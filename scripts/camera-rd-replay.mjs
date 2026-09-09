// Deterministic CPU replay of the UNMODIFIED source camera/director equations.
// Not rendering evidence, not a replacement for browser motion, not GPU timing.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PerspectiveCamera, Object3D, Vector3, Vector2 } from 'three/webgpu';
import { bakeTrack, ProgressSpring, TrackPlayer } from '../src/scene/dev/camera/CameraTrack.js';
import { directions } from '../src/scene/dev/camera/directions.js';
const [side='approved',profile='normal',viewport='desktop']=process.argv.slice(2);
const project=resolve(side==='rejected'?'../site':'../m5-approved-baseline');
const omega=Number(process.env.CAMERA_RESPONSE||10);
const player=directions[side]?new TrackPlayer(bakeTrack(directions[side])):null,spring=new ProgressSpring(omega);
const {PelagicCameraRig}=await import(pathToFileURL(`${project}/src/scene/PelagicCameraRig.js`));
const {JellySchoolDirector}=await import(pathToFileURL(`${project}/src/scene/JellySchoolDirector.js`));
const mobile=viewport==='portrait',size=mobile?[390,844]:[1280,900];
const camera=new PerspectiveCamera(47,size[0]/size[1],.1,1000),rig=new PelagicCameraRig(camera,{mobile,cinematic:side==='rejected'});
const medusae=Array.from({length:8},()=>({transformationObject:new Object3D()}));
const director=new JellySchoolDirector(medusae,{mobile}),focus=new Vector3(),current=new Vector2();
rig.actors=director.actors;
if(rig.journey){const original=rig.journey.protect;rig.journey.protect=function(out,...args){const p=out.position.clone(),t=out.target.clone();original.call(this,out,...args);this.measure={position:p.distanceTo(out.position),target:t.distanceTo(out.target)};};}
let progress=0;const h=1/60,frames=[],duration=80,warmup=6;
for(let frame=0;frame<=(duration+warmup)*60;frame++){
 const elapsed=frame*h,time=elapsed-warmup,u=time/duration;
 let target=time<0||u<.08?0:u<.8?(u-.08)/.72:u<.86?1:u<.95?1-(u-.86)/.09:0;
 if(time>=0&&profile==='close')target=.1;
 if(time>=0&&profile==='school')target=.52;
 if(time>=0&&profile==='slow')target=Math.min(1,u*.45);
 if(time>=0&&profile==='fast')target=u<.25?0:u<.5?.9:u<.75?.12:1;
 progress+=(target-progress)*(1-Math.exp(-h*3.5));
 rig.getJourneyFocus(progress,focus);
 const directive=director.update(progress,h,elapsed,current,focus);
 if(player)player.sample(spring.update(target,h),camera);else rig.update(progress,h,elapsed,directive);
 if(time>=0)frames.push({time,wall:time*1000,progress:player?spring.position:progress,position:camera.position.toArray(),quaternion:camera.quaternion.toArray(),target:player?camera.position.toArray():rig.smoothedTarget.toArray(),fov:camera.fov,actors:director.actors.map(a=>({id:a.id,position:a.position.toArray(),quaternion:a.quaternion.toArray(),scale:a.scale,presence:a.presence})),correction:rig.journey?.measure||null});
}
const out=resolve(`/home/mani/dev/jellyfish-studio/m5-rd-evidence/replay-${side}-${profile}-${viewport}${omega===10?'':`-w${omega}`}`);mkdirSync(out,{recursive:true});
writeFileSync(`${out}/trace.json`,JSON.stringify(frames));writeFileSync(`${out}/metadata.json`,JSON.stringify({mode:'deterministic CPU replay of source equations; NOT browser capture',side,profile,info:{viewport:size},h,scope:'Eight foreground actors, zero pointer input. Distant population visual/collision inspection remains a browser check.'},null,2));console.log(out);
