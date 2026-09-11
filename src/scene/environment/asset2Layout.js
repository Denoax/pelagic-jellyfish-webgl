import * as THREE from 'three/webgpu';
import {floorHeight,seed} from '../sanctuary/geology.js';

// The camera is sampled from the APPROVED Drift endpoint, never changed to fit
// this environment. These are frozen composition coordinates, not a new track.
export const QA_POSE=Object.freeze({position:[.3,-3.6,-8.2],quaternion:[-.0784322097552987,.026096253512354825,.0020538196931502704,.9965757150614236],fov:53,aspect:1672/941});
export const PROFILES=Object.freeze([
 {h:[0,.16,.34,.55,.74,.90,1],r:[.34,.39,.33,.28,.20,.12,.05],x:[0,.02,-.01,.04,.03,.01,0],z:[0,-.01,.02,.02,-.01,.01,0],segments:7},
 {h:[0,.14,.31,.49,.67,.84,1],r:[.54,.60,.52,.47,.38,.27,.11],x:[0,-.03,-.02,.01,.04,.02,0],z:[0,.02,.04,0,-.02,.01,0],segments:9},
 {h:[0,.18,.37,.57,.75,.90,1],r:[.40,.46,.40,.33,.25,.16,.07],x:[0,.04,.09,.15,.20,.25,.28],z:[0,.01,.02,0,-.01,-.02,-.02],segments:8},
 {h:[0,.13,.29,.43,.60,.76,.88,1],r:[.52,.56,.44,.51,.35,.29,.17,.08],x:[0,-.02,.03,-.04,.02,.01,-.02,0],z:[0,.03,.01,-.02,-.04,.01,.02,0],segments:8},
]);
export const TARGETS=Object.freeze([[0,.15,.18,.70],[.15,.23,.31,.72],[.23,.44,.38,.86],[.36,.48,.50,.97],[.55,.46,.73,.98],[.70,.20,1,.90]]);
export function spireGeometry(index){
 const s=PROFILES[index];if(!s)throw Error('Invalid spire archetype');const p=[],indices=[],n=s.segments,levels=s.h.length*3-2;
 // Two small shoulder breaks per authored interval remove the straight cone
 // outline exposed in the first matched capture. Four shared meshes only.
 for(let j=0;j<levels;j++)for(let i=0;i<n;i++){
  const base=Math.min(s.h.length-2,Math.floor(j/3)),t=(j-base*3)/3,lerp=a=>a[base]+(a[base+1]-a[base])*t;
  const a=i/n*Math.PI*2+.13*Math.sin(j*.8+index),shoulder=1+.14*Math.sin(j*2.1+a*2+index);
  const r=lerp(s.r)*shoulder*(1+.12*Math.cos(a*3+j*.19+index)+.065*Math.sin(a*5-j*.27));
  p.push(lerp(s.x)+Math.cos(a)*r,lerp(s.h)+(j===0?0:.025*Math.sin(a*3+j*.5+index)),lerp(s.z)+Math.sin(a)*r);
 }
 for(let j=0;j<levels-1;j++)for(let i=0;i<n;i++){const a=j*n+i,b=j*n+(i+1)%n;indices.push(a,a+n,b,b,a+n,b+n);}
 const bottom=p.length/3;p.push(0,0,0);const top=p.length/3;p.push(s.x.at(-1),1.012,s.z.at(-1));
 for(let i=0;i<n;i++){indices.push(bottom,i,(i+1)%n);const a=(levels-1)*n;indices.push(top,a+(i+1)%n,a+i);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}
export function qaCamera(){const c=new THREE.PerspectiveCamera(QA_POSE.fov,QA_POSE.aspect,.1,48);c.position.fromArray(QA_POSE.position);c.quaternion.fromArray(QA_POSE.quaternion);c.updateMatrixWorld();return c;}
export function fitSpireLayout(){
 const camera=qaCamera(),ray=new THREE.Raycaster(),v=new THREE.Vector3(),items=[],anchors=[];
 TARGETS.forEach((rect,cluster)=>{
  const u=(rect[0]+rect[2])*.5;
  // The lower C/D/E regions belong to LOCKED near geology. Fit their background
  // continuation at the terrain-facing mid-depth band rather than inserting
  // a new foreground landmark in front of the approved sanctuary.
  const baseV=Math.min(rect[3],cluster===5?.67:.70);
  ray.setFromCamera(new THREE.Vector2(u*2-1,1-baseV*2),camera);
  let distance=(-15-camera.position.y)/ray.ray.direction.y;
  for(let i=0;i<5;i++){ray.ray.at(distance,v);distance=(floorHeight(v.x,v.z)-camera.position.y)/ray.ray.direction.y;}
  ray.ray.at(distance,v);const base=v.clone();base.y-=.8;
  let lo=.5,hi=42;
  for(let i=0;i<40;i++){const h=(lo+hi)/2;v.copy(base).add(new THREE.Vector3(0,h,0)).project(camera);if((1-v.y)*.5>rect[1])lo=h;else hi=h;}
  const height=(lo+hi)/2,width=(rect[2]-rect[0])*distance*2*Math.tan(camera.fov*Math.PI/360)*camera.aspect*.62;
  anchors.push({cluster,target:rect,baseUV:[u,baseV],position:base.toArray(),height,width,nearRegionReserved:baseV!==rect[3]});
  for(let i=0;i<5;i++){
   const subordinate=i>0,salt=cluster*5+i,scale=subordinate?.3+seed(salt,53)*.42:1;
   const x=base.x+(subordinate?(seed(salt,51)-.5)*width*1.5:0),z=base.z-(subordinate?2+seed(salt,52)*5:0);
   items.push({cluster,archetype:(cluster+i)%4,p:[x,floorHeight(x,z)-.8,z],s:[width*scale,height*scale,width*scale*.78],r:seed(salt,57)*Math.PI*2,band:cluster===0||cluster===5?2:1});
  }
 });
 return {anchors,items};
}
