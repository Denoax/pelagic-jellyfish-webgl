import { mkdirSync, writeFileSync } from 'node:fs';
import { bakeTrack, ProgressSpring, TrackPlayer } from '../src/scene/dev/camera/CameraTrack.js';
import { directions } from '../src/scene/dev/camera/directions.js';
import { PerspectiveCamera } from 'three/webgpu';
const root='docs/research/2026-09-08-camera-direction/tracks';mkdirSync(root,{recursive:true});
const costs=[];
for(const definition of Object.values(directions)){
 const track=bakeTrack(definition),samples=Array.from({length:track.count},(_,i)=>({s:i/(track.count-1),position:Array.from(track.data.slice(i*7,i*7+3)),quaternion:Array.from(track.data.slice(i*7+3,i*7+7))}));
 writeFileSync(`${root}/${definition.id}.json`,JSON.stringify({authoring:definition,fov:track.fov,poses:samples}));
 const player=new TrackPlayer(track),camera=new PerspectiveCamera(),spring=new ProgressSpring();
 for(let i=0;i<20000;i++)player.sample(spring.update((i%10000)/10000,1/60),camera);
 const start=performance.now();for(let i=0;i<100000;i++)player.sample(spring.update((i%10000)/10000,1/60),camera);
 costs.push({direction:definition.id,iterations:100000,meanCpuMsPerSample:(performance.now()-start)/100000,bytes:track.data.byteLength});
}
writeFileSync(`${root}/cpu-microbenchmark.json`,JSON.stringify({kind:'Node CPU microbenchmark, not browser whole-scene or GPU timing',costs},null,2));
