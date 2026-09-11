import * as THREE from 'three/webgpu';
import {Fn,uniform,vec2,vec3,mix,texture,positionWorld,cameraPosition,normalWorld,mx_noise_float} from 'three/tsl';
import {Background} from '../../vendor/aurelia/background.js';
import {QA_POSE,qaCamera,spireGeometry,fitSpireLayout} from './asset2Layout.js';
import {ASSET2 as C} from './asset2Config.js';

// ENVIRONMENT ONLY. No renderer, render target, animal/camera writes or global
// fog replacement. The approved animal waterRadiance remains byte unchanged.
export class Asset2Environment {
 constructor(scene,sanctuary){
  this.scene=scene;this.sanctuary=sanctuary;this.previousBackground=scene.backgroundNode;
  this.enabled=uniform(1);this.spires=uniform(1);this.atmosphere=uniform(1);this.phase=2;this.cpu=0;this.disposed=false;
  this.haze=uniform(1);this.outer=uniform(1);this.guideWeight=uniform(0);this.guideAngle=uniform(0);
  this.guide=new THREE.TextureLoader().load(new URL('../../../docs/reference/asset2/RUNTIME_GUIDE_asset2_lowfreq_atmosphere_256x144.png',import.meta.url).href);
  this.guide.colorSpace=THREE.SRGBColorSpace;this.guide.generateMipmaps=false;this.guide.minFilter=THREE.LinearFilter;
  this.cameraForward=new THREE.Vector3();
  this.group=new THREE.Group();this.group.name='asset2-far-spire-field';scene.add(this.group);
  const bounds=new THREE.Box3();sanctuary.group.updateMatrixWorld(true);
  for(const m of sanctuary.solids)bounds.expandByObject(m);
  this.center=bounds.getCenter(new THREE.Vector3());this.radius=Math.hypot((bounds.max.x-bounds.min.x)/2,(bounds.max.z-bounds.min.z)/2);
  this.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};
  this.forward=new THREE.Vector3(0,0,-1).applyQuaternion(qaCamera().quaternion);
  this.right=new THREE.Vector3(1,0,0).applyQuaternion(qaCamera().quaternion);
  this.up=new THREE.Vector3(0,1,0).applyQuaternion(qaCamera().quaternion);
  this.focus=new THREE.Vector3().fromArray(QA_POSE.position).addScaledVector(this.forward,C.haze.distance).addScaledVector(this.right,C.haze.right).addScaledVector(this.up,C.haze.up);
  this.backdrop=Fn(()=>this.radiance(positionWorld.sub(cameraPosition).normalize()))();
  scene.backgroundNode=mix(this.previousBackground,this.backdrop,this.enabled);
  const fitted=fitSpireLayout();this.anchors=fitted.anchors;this.items=fitted.items;this.geometries=[];
  this.material=new THREE.MeshBasicNodeMaterial();this.material.fog=false;
  const ray=positionWorld.sub(cameraPosition),d=ray.length();
  const detail=normalWorld.y.max(0).mul(.00025).add(.00010);
  const pigment=vec3(.12,.36,.58).mul(detail);
  const silhouette=d.smoothstep(...C.spires.extinction).oneMinus().mul(C.spires.contrast).mul(Background.depth.smoothstep(.35,.82));
  this.material.colorNode=mix(this.radiance(ray.normalize()),pigment,silhouette.mul(this.worldVisibility(positionWorld)));
  const o=new THREE.Object3D();
  for(let k=0;k<4;k++){
   const g=spireGeometry(k),items=this.items.filter(a=>a.archetype===k),mesh=new THREE.InstancedMesh(g,this.material,items.length);
   items.forEach((a,i)=>{o.position.fromArray(a.p);o.scale.fromArray(a.s);o.rotation.set(0,a.r,0);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
   mesh.name=`asset2-spire-archetype-${k}`;mesh.computeBoundingSphere();this.group.add(mesh);this.geometries.push(g);
  }
  // Wrap only existing OPAQUE environmental materials. Their approved scanned
  // pigment/relief and local animal-light pool remain the original source.
  // No global fog or animal material is modified.
  this.surfaces=[];
  for(const material of new Set(sanctuary.solids.map(m=>m.material))){
   if(material.transparent||!material.colorNode)continue;
   const original=material.colorNode;
   const distance=positionWorld.sub(cameraPosition).length();
   const footprint=mix(1,positionWorld.x.abs().max(positionWorld.z.add(28).abs()).smoothstep(...C.fog.footprint).oneMinus(),this.outer);
   const nearFloor=positionWorld.y.smoothstep(...C.fog.floorY).oneMinus();
   const density=nearFloor.mul(C.fog.nearFloor).add(C.fog.base).add(distance.smoothstep(...C.fog.farRange).mul(C.fog.far));
   const transmittance=distance.mul(density).negate().exp().mul(footprint).mul(this.worldVisibility(positionWorld));
   const water=this.radiance(positionWorld.sub(cameraPosition).normalize());
   const treated=mix(water,original.mul(vec3(...C.fog.ambient)),transmittance);
   material.colorNode=mix(original,treated,this.atmosphere.mul(Background.depth.smoothstep(.35,.82)));
   this.surfaces.push({material,original});
  }
  if(import.meta.env?.DEV)window.__ASSET2__={state:()=>this.state(),toggle:(name,on)=>{if(name==='spires'){this.spires.value=Number(Boolean(on));this.group.visible=Boolean(on);}if(name==='background')this.enabled.value=Number(Boolean(on));if(name==='atmosphere')this.atmosphere.value=Number(Boolean(on));if(name==='haze')this.haze.value=Number(Boolean(on));if(name==='outer')this.outer.value=Number(Boolean(on));if(name==='guide')this.guideWeight.value=on?.12:0;}};
 }
 worldVisibility(p){
  const r=p.xz.sub(vec2(this.center.x,this.center.z)).length().div(this.radius);
  const visitor=cameraPosition.xz.sub(vec2(this.center.x,this.center.z)).length().div(this.radius);
  const below=cameraPosition.y.smoothstep(...C.fade.belowFloor);
  return mix(1,r.smoothstep(...C.fade.geometryR).oneMinus().pow(2).mul(visitor.smoothstep(...C.fade.cameraR).oneMinus().pow(2)).mul(below),this.outer);
 }
 radiance(ray){
  // Broad world-anchored atmospheric opening. Perspective/parallax are derived
  // from ray direction to one remote volume, never a screen-attached picture.
  const v=vec3(...this.focus.toArray()).sub(cameraPosition),axis=v.normalize();
  const spread=ray.sub(axis);const x=spread.dot(vec3(...this.right.toArray())).div(C.haze.width),y=spread.dot(vec3(...this.up.toArray())).div(C.haze.height);
  const window=x.mul(x).add(y.mul(y)).mul(-C.haze.falloff).exp().mul(ray.dot(axis).max(0));
  const sample=cameraPosition.add(ray.mul(C.haze.distance));
  // Two broad world-space density scales, not screen noise or a moving card.
  // Different parts of the opening have different optical thickness.
  const coarse=mx_noise_float(sample.mul(vec3(...C.haze.coarseScale))).mul(C.haze.coarseGain)
   .add(mx_noise_float(sample.mul(C.haze.fineScale)).mul(C.haze.fineGain)).add(C.haze.base).clamp(.22,1.25);
  // Values are pre-ACES radiance, not display-space swatches. The locked ACES
  // toe clips extremely small inputs; measure the displayed result, not numbers.
  const visitor=cameraPosition.xz.sub(vec2(this.center.x,this.center.z)).length().div(this.radius);
  const presence=mix(1,visitor.smoothstep(C.fade.coreR,C.fade.cameraR[1]).oneMinus().pow(2).mul(cameraPosition.y.smoothstep(...C.fade.belowFloor)),this.outer);
  const projected=ray.dot(vec3(...this.forward.toArray())).max(.001);
  const guideUV=vec2(ray.dot(vec3(...this.right.toArray())).div(projected.mul(1.77)).add(.5),ray.dot(vec3(...this.up.toArray())).div(projected.mul(.996)).add(.5));
  const guide=texture(this.guide,guideUV).rgb.mul(this.guideWeight).mul(this.guideAngle);
  const deep=vec3(...C.abyss.base).add(vec3(...C.abyss.opening).mul(window).mul(coarse).mul(this.haze)).add(guide).mul(presence).add(vec3(...C.abyss.void));
  return mix(Background.waterRadiance(ray),deep,Background.depth.smoothstep(.35,.82));
 }
 connect(camera,snow,view){this.camera=camera;this.snow=snow;this.view=view;}
 update(){if(this.disposed)return;const start=performance.now();this.group.visible=Boolean(this.spires.value)&&Background.depth.value>.35;if(this.camera){this.camera.getWorldDirection(this.cameraForward);const dot=this.cameraForward.dot(this.forward),t=THREE.MathUtils.clamp((dot-Math.cos(35*Math.PI/180))/(Math.cos(12*Math.PI/180)-Math.cos(35*Math.PI/180)),0,1);this.guideAngle.value=t*t*(3-2*t)*(this.view?.free?.25:1);}this.cpu=performance.now()-start;}
 state(){return{phase:this.phase,center:this.center.toArray(),R:this.radius,bounds:this.bounds,instances:this.items.length,batches:4,archetypes:4,anchors:this.anchors,extraOceanPasses:0,extraTargets:0,cpuMs:this.cpu};}
 dispose(){if(this.disposed)return;this.disposed=true;this.scene.backgroundNode=this.previousBackground;this.surfaces.forEach(({material,original})=>{material.colorNode=original;});this.group.removeFromParent();this.geometries.forEach(g=>g.dispose());this.material.dispose();this.guide.dispose();if(import.meta.env?.DEV)delete window.__ASSET2__;}
}
