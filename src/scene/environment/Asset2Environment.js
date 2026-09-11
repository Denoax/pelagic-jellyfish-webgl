import * as THREE from 'three/webgpu';
import {Fn,float,uniform,attribute,vec2,vec3,mix,screenUV,positionWorld,cameraPosition,normalWorld,mx_noise_float} from 'three/tsl';
import {Background} from '../../vendor/aurelia/background.js';
import {QA_POSE,qaCamera,spireGeometry,fitSpireLayout} from './asset2Layout.js';
import {ASSET2 as C} from './asset2Config.js';

// ENVIRONMENT ONLY. No renderer, render target, animal/camera writes or global
// fog replacement. The approved animal waterRadiance remains byte unchanged.
export class Asset2Environment {
 constructor(scene,sanctuary){
  this.scene=scene;this.sanctuary=sanctuary;this.previousBackground=scene.backgroundNode;
  this.enabled=uniform(1);this.spires=uniform(1);this.atmosphere=uniform(1);this.phase=5;this.cpu=0;this.disposed=false;
  this.haze=uniform(1);this.outer=uniform(1);this.localLight=uniform(1);this.particles=uniform(1);
  this.materialAO=uniform(1);
  this.shafts=uniform(1);this.dither=uniform(1);this.waterTime=uniform(0);this.lastElapsed=null;
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
  this.material=new THREE.MeshBasicNodeMaterial({transparent:true,depthWrite:false});this.material.fog=false;
  const ray=positionWorld.sub(cameraPosition),d=ray.length();
  const detail=normalWorld.y.max(0).mul(.00025).add(.00010);
  const pigment=vec3(.12,.36,.58).mul(detail);
  // Proxies establish distant scale, never become inspectable near landmarks.
  const silhouette=d.smoothstep(...C.spires.nearFade).mul(d.mul(-C.spires.density).exp()).mul(d.smoothstep(...C.spires.extinction).oneMinus()).mul(C.spires.contrast).mul(Background.depth.smoothstep(...C.journeyDepth));
  // Real alpha fade: a proxy with zero contrast must not write an invisible
  // occluder in front of approved transparent animals. Render these background
  // silhouettes before the approved transparent population, with depth test on.
  const anchor=attribute('asset2Anchor','vec4');
  const approachFade=anchor.xyz.distance(cameraPosition).div(anchor.w).smoothstep(.4,.8);
  const visibility=approachFade.mul(this.worldVisibility(positionWorld));
  // Resolve distant optical contrast in radiance, not by stacking weak alpha
  // over every intersecting triangle of a concave low-poly mesh. Full-strength
  // distant proxies overwrite with the same water radiance plus a silhouette;
  // approach/edge fades remain true alpha and never write invisible depth.
  this.material.colorNode=mix(this.radiance(ray.normalize()),pigment,silhouette.mul(visibility));
  this.material.opacityNode=visibility.mul(d.smoothstep(...C.spires.nearFade)).mul(d.smoothstep(...C.spires.extinction).oneMinus());
  const o=new THREE.Object3D();
  for(let k=0;k<4;k++){
   const g=spireGeometry(k),items=this.items.filter(a=>a.archetype===k),mesh=new THREE.InstancedMesh(g,this.material,items.length);
   g.setAttribute('asset2Anchor',new THREE.InstancedBufferAttribute(new Float32Array(items.flatMap(a=>{const y=a.p[1]+a.s[1]*.5;return[a.p[0],y,a.p[2],Math.hypot(a.p[0]-QA_POSE.position[0],y-QA_POSE.position[1],a.p[2]-QA_POSE.position[2])]})),4));
   items.forEach((a,i)=>{o.position.fromArray(a.p);o.scale.fromArray(a.s);o.rotation.set(0,a.r,0);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
   mesh.name=`asset2-spire-archetype-${k}`;mesh.renderOrder=-5;mesh.computeBoundingSphere();this.group.add(mesh);this.geometries.push(g);
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
   const raised=positionWorld.y.smoothstep(-12,-3).mul(C.fog.raisedDensity);
   const density=nearFloor.mul(C.fog.nearFloor).add(C.fog.base).add(raised).add(distance.smoothstep(...C.fog.farRange).mul(C.fog.far));
   // The approved camera far plane is 48. Lose environmental contrast before
   // that immutable clip boundary, as well as before the physical basin edge.
   const clipFade=distance.smoothstep(...C.fog.clipFade).oneMinus();
   const transmittance=vec3(...C.fog.spectral).mul(distance).mul(density).negate().exp().mul(footprint).mul(clipFade).mul(this.worldVisibility(positionWorld));
   const water=this.radiance(positionWorld.sub(cameraPosition).normalize());
   // A vertically elongated scattering pool makes the existing animal light
   // reach the floor without a broad ambient fill or another selected animal.
   const light=sanctuary.light,delta=light.position.sub(positionWorld),distanceToLight=delta.mul(vec3(1,C.light.verticalScale,1)).length();
   const reveal=distanceToLight.div(this.radius*C.light.radiusR).oneMinus().clamp(0,1).pow(2)
    .mul(light.power).mul(normalWorld.dot(delta.normalize()).max(0).mul(.8).add(.2)).mul(this.localLight).mul(C.light.gain).clamp(0,1);
   const pickup=mix(vec3(...C.fog.ambient),vec3(C.light.surfaceGain),reveal);
   // Keep the existing ten biological pinpoints, including their color and
   // activation response. No extra colonies or glow billboard is introduced.
   const sheltered=normalWorld.y.smoothstep(-.45,.35).oneMinus();
   const floorPocket=positionWorld.y.smoothstep(-17,-14.3).oneMinus();
   const bedding=positionWorld.y.mul(2.2).add(positionWorld.x.mul(.21)).sin().mul(.18).add(.82);
   const contact=sheltered.mul(floorPocket.mul(.4).add(.6)).mul(bedding).mul(C.ao.material).mul(this.materialAO).oneMinus();
   const surface=material.name==='rare-local-biological-light'?original.mul(C.benthic.presentationGain):original.mul(pickup).mul(contact);
   const treated=mix(water,surface,transmittance);
   material.colorNode=mix(original,treated,this.atmosphere.mul(Background.depth.smoothstep(...C.journeyDepth)));
   this.surfaces.push({material,original});
  }
  if(import.meta.env?.DEV)window.__ASSET2__={state:()=>this.state(),cost:()=>Array.from(this.cpuSamples.slice(0,this.cpuCount)),resetCost:()=>{this.cpuCount=0;this.cpuCursor=0;},toggle:(name,on)=>{if(name==='spires'){this.spires.value=Number(Boolean(on));this.group.visible=Boolean(on);}if(name==='background')this.enabled.value=Number(Boolean(on));if(name==='atmosphere')this.atmosphere.value=Number(Boolean(on));if(name==='haze')this.haze.value=Number(Boolean(on));if(name==='outer')this.outer.value=Number(Boolean(on));if(name==='light')this.localLight.value=Number(Boolean(on));if(name==='particles')this.particles.value=Number(Boolean(on));if(name==='ao')this.materialAO.value=Number(Boolean(on));if(name==='shafts')this.shafts.value=Number(Boolean(on));if(name==='dither')this.dither.value=Number(Boolean(on));}};
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
   .add(mx_noise_float(sample.mul(C.haze.fineScale)).mul(C.haze.fineGain))
   .add(mx_noise_float(sample.mul(C.haze.detailScale)).mul(C.haze.detailGain)).add(C.haze.base).clamp(.3,1.1);
  // Values are pre-ACES radiance, not display-space swatches. The locked ACES
  // toe clips extremely small inputs; measure the displayed result, not numbers.
  const visitor=cameraPosition.xz.sub(vec2(this.center.x,this.center.z)).length().div(this.radius);
  const presence=mix(1,visitor.smoothstep(C.fade.coreR,C.fade.cameraR[1]).oneMinus().pow(2).mul(cameraPosition.y.smoothstep(...C.fade.belowFloor)),this.outer);
  let shaft=float(0);
  for(let i=0;i<C.shafts.count;i++){
   const [x,z]=C.shafts.anchors[i],cross=sample.x.sub(x).add(sample.y.mul(.13)).div(C.shafts.widths[i]);
   const reach=sample.z.sub(z).div(22),envelope=cross.mul(cross).add(reach.mul(reach)).mul(-1.5).exp();
   const slow=this.waterTime.mul(C.shafts.driftRate).add(i*2.1).sin().mul(.035).add(.965);
   shaft=shaft.add(envelope.mul(sample.y.smoothstep(-17,4)).mul(slow));
  }
  const light=vec3(...C.shafts.color).mul(shaft).mul(coarse).mul(C.shafts.gain).mul(this.shafts);
  const grain=screenUV.dot(vec2(127.1,311.7)).sin().mul(43758.5453).fract().sub(.5).mul(C.dither.amplitude).mul(this.dither);
  const deep=vec3(...C.abyss.base).add(vec3(...C.abyss.opening).mul(window).mul(coarse).mul(this.haze)).add(light).mul(presence).add(vec3(...C.abyss.void)).add(grain).max(0);
  return mix(Background.waterRadiance(ray),deep,Background.depth.smoothstep(...C.journeyDepth));
 }
 connect(camera,snow,view,reviewContext=null){
  this.camera=camera;this.snow=snow;this.view=view;
  if(import.meta.env?.DEV)window.__ASSET2__.context=()=>({...reviewContext,environment:this});
  const qa=qaCamera(),point=(u,v)=>new THREE.Vector3(u*2-1,1-v*2,.5).unproject(qa).sub(qa.position).normalize().multiplyScalar(20).add(qa.position);
  const a=point(.23,.31),b=point(.59,.50),ab=b.clone().sub(a),length=ab.length();ab.normalize();
  snow?.layers.forEach((layer,i)=>{
   const material=layer.mesh.material,original=material.opacityNode,p=positionWorld.sub(vec3(...a.toArray())),axis=vec3(...ab.toArray());
   const along=p.dot(axis).clamp(0,length),across=p.sub(axis.mul(along)).length();
   const connector=across.div(C.particles.corridorRadius).pow(2).negate().exp();
   const light=this.sanctuary.light,near=positionWorld.sub(light.position).length().div(this.radius*C.light.radiusR).oneMinus().clamp(0,1).pow(2).mul(light.power);
   const presentation=connector.mul(C.particles.corridorGain[i]).add(C.particles.layerBase[i]).add(near.mul(.35))
    .mul(this.worldVisibility(positionWorld));
   material.opacityNode=original.mul(mix(1,presentation,this.particles.mul(Background.depth.smoothstep(...C.journeyDepth))));
   this.particleSurfaces.push({material,original});
  });
 }
 update(elapsed){if(this.disposed)return;const start=performance.now();if(Number.isFinite(elapsed)){this.waterTime.value+=this.lastElapsed===null?0:Math.max(0,Math.min(.05,elapsed-this.lastElapsed));this.lastElapsed=elapsed;}this.group.visible=Boolean(this.spires.value)&&Background.depth.value>C.journeyDepth[0];this.cpu=performance.now()-start;this.cpuSamples[this.cpuCursor++%this.cpuSamples.length]=this.cpu;this.cpuCount=Math.min(this.cpuCount+1,this.cpuSamples.length);}
 state(){return{phase:this.phase,center:this.center.toArray(),R:this.radius,bounds:this.bounds,instances:this.items.length,batches:4,archetypes:4,anchors:this.anchors,localLights:1,light:{position:this.sanctuary.light.position.value.toArray(),power:this.sanctuary.light.power.value},particleLayers:this.particleSurfaces.length,extraOceanPasses:0,extraTargets:0,cpuMs:this.cpu};}
 dispose(){if(this.disposed)return;this.disposed=true;this.scene.backgroundNode=this.previousBackground;this.surfaces.forEach(({material,original})=>{material.colorNode=original;});this.particleSurfaces.forEach(({material,original})=>{material.opacityNode=original;});this.group.removeFromParent();this.geometries.forEach(g=>g.dispose());this.material.dispose();if(import.meta.env?.DEV)delete window.__ASSET2__;}
}
