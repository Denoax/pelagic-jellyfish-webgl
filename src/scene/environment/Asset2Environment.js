import * as THREE from 'three/webgpu';
import {Fn,uniform,vec2,vec3,mix,positionWorld,cameraPosition,normalWorld,mx_noise_float} from 'three/tsl';
import {Background} from '../../vendor/aurelia/background.js';
import {QA_POSE,qaCamera,spireGeometry,fitSpireLayout} from './asset2Layout.js';
import {ASSET2 as C} from './asset2Config.js';

// ENVIRONMENT ONLY. No renderer, render target, animal/camera writes or global
// fog replacement. The approved animal waterRadiance remains byte unchanged.
export class Asset2Environment {
 constructor(scene,sanctuary){
  this.scene=scene;this.sanctuary=sanctuary;this.previousBackground=scene.backgroundNode;
  this.enabled=uniform(1);this.spires=uniform(1);this.atmosphere=uniform(1);this.phase=3;this.cpu=0;this.disposed=false;
  this.haze=uniform(1);this.outer=uniform(1);this.localLight=uniform(1);this.particles=uniform(1);
  this.cpuSamples=new Float32Array(8192);this.cpuCursor=0;this.cpuCount=0;this.particleSurfaces=[];
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
   const light=sanctuary.light,delta=light.position.sub(positionWorld),distanceToLight=delta.length();
   const reveal=distanceToLight.div(this.radius*C.light.radiusR).oneMinus().clamp(0,1).pow(2)
    .mul(light.power).mul(normalWorld.dot(delta.normalize()).max(0).mul(.8).add(.2)).mul(this.localLight).mul(C.light.gain).clamp(0,1);
   const pickup=mix(vec3(...C.fog.ambient),vec3(C.light.surfaceGain),reveal);
   // Keep the existing ten biological pinpoints, including their color and
   // activation response. No extra colonies or glow billboard is introduced.
   const surface=material.name==='rare-local-biological-light'?original:original.mul(pickup);
   const treated=mix(water,surface,transmittance);
   material.colorNode=mix(original,treated,this.atmosphere.mul(Background.depth.smoothstep(.35,.82)));
   this.surfaces.push({material,original});
  }
  if(import.meta.env?.DEV)window.__ASSET2__={state:()=>this.state(),cost:()=>Array.from(this.cpuSamples.slice(0,this.cpuCount)),resetCost:()=>{this.cpuCount=0;this.cpuCursor=0;},toggle:(name,on)=>{if(name==='spires'){this.spires.value=Number(Boolean(on));this.group.visible=Boolean(on);}if(name==='background')this.enabled.value=Number(Boolean(on));if(name==='atmosphere')this.atmosphere.value=Number(Boolean(on));if(name==='haze')this.haze.value=Number(Boolean(on));if(name==='outer')this.outer.value=Number(Boolean(on));if(name==='light')this.localLight.value=Number(Boolean(on));if(name==='particles')this.particles.value=Number(Boolean(on));}};
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
  const deep=vec3(...C.abyss.base).add(vec3(...C.abyss.opening).mul(window).mul(coarse).mul(this.haze)).mul(presence).add(vec3(...C.abyss.void));
  return mix(Background.waterRadiance(ray),deep,Background.depth.smoothstep(.35,.82));
 }
 connect(camera,snow,view,reviewContext=null){
  this.camera=camera;this.snow=snow;this.view=view;
  if(import.meta.env?.DEV)window.__ASSET2__.context=()=>reviewContext;
  const qa=qaCamera(),point=(u,v)=>new THREE.Vector3(u*2-1,1-v*2,.5).unproject(qa).sub(qa.position).normalize().multiplyScalar(20).add(qa.position);
  const a=point(.23,.31),b=point(.59,.50),ab=b.clone().sub(a),length=ab.length();ab.normalize();
  snow?.layers.forEach((layer,i)=>{
   const material=layer.mesh.material,original=material.opacityNode,p=positionWorld.sub(vec3(...a.toArray())),axis=vec3(...ab.toArray());
   const along=p.dot(axis).clamp(0,length),across=p.sub(axis.mul(along)).length();
   const connector=across.div(C.particles.corridorRadius).pow(2).negate().exp();
   const light=this.sanctuary.light,near=positionWorld.sub(light.position).length().div(this.radius*C.light.radiusR).oneMinus().clamp(0,1).pow(2).mul(light.power);
   const presentation=connector.mul(C.particles.corridorGain[i]).add(C.particles.layerBase[i]).add(near.mul(.35))
    .mul(this.worldVisibility(positionWorld));
   material.opacityNode=original.mul(mix(1,presentation,this.particles.mul(Background.depth.smoothstep(.35,.82))));
   this.particleSurfaces.push({material,original});
  });
 }
 update(){if(this.disposed)return;const start=performance.now();this.group.visible=Boolean(this.spires.value)&&Background.depth.value>.35;this.cpu=performance.now()-start;this.cpuSamples[this.cpuCursor++%this.cpuSamples.length]=this.cpu;this.cpuCount=Math.min(this.cpuCount+1,this.cpuSamples.length);}
 state(){return{phase:this.phase,center:this.center.toArray(),R:this.radius,bounds:this.bounds,instances:this.items.length,batches:4,archetypes:4,anchors:this.anchors,localLights:1,light:{position:this.sanctuary.light.position.value.toArray(),power:this.sanctuary.light.power.value},particleLayers:this.particleSurfaces.length,extraOceanPasses:0,extraTargets:0,cpuMs:this.cpu};}
 dispose(){if(this.disposed)return;this.disposed=true;this.scene.backgroundNode=this.previousBackground;this.surfaces.forEach(({material,original})=>{material.colorNode=original;});this.particleSurfaces.forEach(({material,original})=>{material.opacityNode=original;});this.group.removeFromParent();this.geometries.forEach(g=>g.dispose());this.material.dispose();if(import.meta.env?.DEV)delete window.__ASSET2__;}
}
