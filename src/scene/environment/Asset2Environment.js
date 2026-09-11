import * as THREE from 'three/webgpu';
import {Fn,uniform,vec3,mix,positionWorld,cameraPosition,normalWorld,mx_noise_float} from 'three/tsl';
import {Background} from '../../vendor/aurelia/background.js';
import {QA_POSE,qaCamera,spireGeometry,fitSpireLayout} from './asset2Layout.js';

// ENVIRONMENT ONLY. No renderer, render target, animal/camera writes or global
// fog replacement. The approved animal waterRadiance remains byte unchanged.
export class Asset2Environment {
 constructor(scene,sanctuary){
  this.scene=scene;this.sanctuary=sanctuary;this.previousBackground=scene.backgroundNode;
  this.enabled=uniform(1);this.spires=uniform(1);this.phase=1;this.cpu=0;this.disposed=false;
  this.group=new THREE.Group();this.group.name='asset2-far-spire-field';scene.add(this.group);
  const bounds=new THREE.Box3();sanctuary.group.updateMatrixWorld(true);
  for(const m of sanctuary.solids)bounds.expandByObject(m);
  this.center=bounds.getCenter(new THREE.Vector3());this.radius=Math.hypot((bounds.max.x-bounds.min.x)/2,(bounds.max.z-bounds.min.z)/2);
  this.bounds={min:bounds.min.toArray(),max:bounds.max.toArray()};
  this.forward=new THREE.Vector3(0,0,-1).applyQuaternion(qaCamera().quaternion);
  this.right=new THREE.Vector3(1,0,0).applyQuaternion(qaCamera().quaternion);
  this.up=new THREE.Vector3(0,1,0).applyQuaternion(qaCamera().quaternion);
  this.focus=new THREE.Vector3().fromArray(QA_POSE.position).addScaledVector(this.forward,35).addScaledVector(this.right,-5).addScaledVector(this.up,2);
  this.backdrop=Fn(()=>this.radiance(positionWorld.sub(cameraPosition).normalize()))();
  scene.backgroundNode=mix(this.previousBackground,this.backdrop,this.enabled);
  const fitted=fitSpireLayout();this.anchors=fitted.anchors;this.items=fitted.items;this.geometries=[];
  this.material=new THREE.MeshBasicNodeMaterial();this.material.fog=false;
  const ray=positionWorld.sub(cameraPosition),d=ray.length();
  const detail=normalWorld.y.max(0).mul(.00025).add(.00010);
  const pigment=vec3(.12,.36,.58).mul(detail);
  this.material.colorNode=mix(pigment,this.radiance(ray.normalize()),d.smoothstep(17,48).mul(.22).add(.66));
  const o=new THREE.Object3D();
  for(let k=0;k<4;k++){
   const g=spireGeometry(k),items=this.items.filter(a=>a.archetype===k),mesh=new THREE.InstancedMesh(g,this.material,items.length);
   items.forEach((a,i)=>{o.position.fromArray(a.p);o.scale.fromArray(a.s);o.rotation.set(0,a.r,0);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
   mesh.name=`asset2-spire-archetype-${k}`;mesh.computeBoundingSphere();this.group.add(mesh);this.geometries.push(g);
  }
  if(import.meta.env?.DEV)window.__ASSET2__={state:()=>this.state(),toggle:(name,on)=>{if(name==='spires'){this.spires.value=Number(Boolean(on));this.group.visible=Boolean(on);}if(name==='background')this.enabled.value=Number(Boolean(on));}};
 }
 radiance(ray){
  // Broad world-anchored atmospheric opening. Perspective/parallax are derived
  // from ray direction to one remote volume, never a screen-attached picture.
  const v=vec3(...this.focus.toArray()).sub(cameraPosition),axis=v.normalize();
  const spread=ray.sub(axis);const x=spread.dot(vec3(...this.right.toArray())).div(.52),y=spread.dot(vec3(...this.up.toArray())).div(.50);
  const window=x.mul(x).add(y.mul(y)).mul(-1.8).exp().mul(ray.dot(axis).max(0));
  const coarse=mx_noise_float(ray.mul(3.1)).mul(.12).add(.88);
  // Values are pre-ACES radiance, not display-space swatches. The locked ACES
  // toe clips extremely small inputs; measure the displayed result, not numbers.
  const deep=vec3(.004,.008,.014).add(vec3(.012,.030,.050).mul(window).mul(coarse));
  return mix(Background.waterRadiance(ray),deep,Background.depth.smoothstep(.35,.82));
 }
 connect(camera,snow,view){this.camera=camera;this.snow=snow;this.view=view;}
 update(){if(this.disposed)return;const start=performance.now();this.group.visible=Boolean(this.spires.value)&&Background.depth.value>.35;this.cpu=performance.now()-start;}
 state(){return{phase:this.phase,center:this.center.toArray(),R:this.radius,bounds:this.bounds,instances:this.items.length,batches:4,archetypes:4,anchors:this.anchors,extraOceanPasses:0,extraTargets:0,cpuMs:this.cpu};}
 dispose(){if(this.disposed)return;this.disposed=true;this.scene.backgroundNode=this.previousBackground;this.group.removeFromParent();this.geometries.forEach(g=>g.dispose());this.material.dispose();if(import.meta.env?.DEV)delete window.__ASSET2__;}
}
