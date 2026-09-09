import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Quaternion, Vector3, Euler, PerspectiveCamera } from 'three/webgpu';
const root=resolve(process.argv[2]);
const raw=JSON.parse(readFileSync(`${root}/trace.json`));
if(raw.length<30)throw Error('Missing camera samples');
const meta=JSON.parse(readFileSync(`${root}/metadata.json`));
const h=1/60, radius=[1.34,1.2,1.4,1.28], q=new Quaternion(), qa=new Quaternion(),qb=new Quaternion();
const lerp=(a,b,t)=>a+(b-a)*t, diff=(a,b,d)=>a.map((v,i)=>(v-b[i])/d),mag=a=>Math.hypot(...a);
const stats=a=>{a=a.filter(Number.isFinite).sort((a,b)=>a-b);return {median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};
// Uniform simulation-time samples; browser frame intervals are not GPU timings.
// Central derivatives span 100ms, explicitly reducing resampling noise.
const samples=[];let cursor=0;
for(let t=raw[0].time;t<raw.at(-1).time;t+=h){
 while(cursor<raw.length-2&&raw[cursor+1].time<t)cursor++;
 const a=raw[cursor],b=raw[cursor+1],u=(t-a.time)/(b.time-a.time||h);
 qa.fromArray(a.quaternion);qb.fromArray(b.quaternion);if(qa.dot(qb)<0)qb.set(-qb.x,-qb.y,-qb.z,-qb.w);
 q.copy(qa).slerp(qb,u);
 samples.push({time:t-raw[0].time,position:a.position.map((v,i)=>lerp(v,b.position[i],u)),quaternion:q.toArray(),fov:lerp(a.fov,b.fov,u),progress:lerp(a.progress,b.progress,u),target:a.target.map((v,i)=>lerp(v,b.target[i],u)),actors:a.actors,correction:a.correction});
}
const deltaQ=new Quaternion(), angular=(a,b,dt)=>{qa.fromArray(a);qb.fromArray(b);if(qa.dot(qb)<0)qb.set(-qb.x,-qb.y,-qb.z,-qb.w);deltaQ.copy(qb).multiply(qa.invert()).normalize();const n=Math.hypot(deltaQ.x,deltaQ.y,deltaQ.z),angle=2*Math.atan2(n,deltaQ.w);return n<1e-10?[0,0,0]:[deltaQ.x,deltaQ.y,deltaQ.z].map(v=>v/n*angle/dt*180/Math.PI);};
const n=3,euler=new Euler(0,0,0,'YXZ');
for(let i=n;i<samples.length-n;i++){
 const s=samples[i],a=samples[i-n],b=samples[i+n];
 s.velocity=diff(b.position,a.position,2*n*h);
 s.acceleration=s.position.map((v,k)=>(b.position[k]-2*v+a.position[k])/(n*h)**2);
 s.angularVelocity=angular(a.quaternion,b.quaternion,2*n*h);
 s.targetSpeed=mag(diff(b.target,a.target,2*n*h));
 s.roll=euler.setFromQuaternion(q.fromArray(s.quaternion),'YXZ').z*180/Math.PI;
}
for(let i=2*n;i<samples.length-2*n;i++){
 const s=samples[i],a=samples[i-n],b=samples[i+n];s.jerk=mag(diff(b.acceleration,a.acceleration,2*n*h));s.angularAcceleration=mag(diff(b.angularVelocity,a.angularVelocity,2*n*h));
 s.speed=mag(s.velocity);s.accel=mag(s.acceleration);s.angularSpeed=mag(s.angularVelocity);
}
const valid=samples.slice(2*n,-2*n),cam=new PerspectiveCamera(47,meta.info.viewport[0]/meta.info.viewport[1],.1,1000),v=new Vector3();
let closest=Infinity,path=0,rotation=0,reversals=0,lastReversal=-Infinity,stillStart=null;const still=[],composition=[];
for(let i=0;i<valid.length;i++){
 const s=valid[i];cam.position.fromArray(s.position);cam.quaternion.fromArray(s.quaternion);cam.fov=s.fov;cam.updateProjectionMatrix();cam.updateMatrixWorld();
 if(i){path+=mag(diff(s.position,valid[i-1].position,1));rotation+=mag(angular(valid[i-1].quaternion,s.quaternion,1));}
 if(s.speed<.04&&s.angularSpeed<.2){if(stillStart===null)stillStart=s.time;}else if(stillStart!==null){if(s.time-stillStart>=2)still.push([stillStart,s.time]);stillStart=null;}
 if(i>30&&s.speed>.08&&valid[i-30].speed>.08&&s.velocity.reduce((sum,x,k)=>sum+x*valid[i-30].velocity[k],0)<0&&s.time-lastReversal>1){lastReversal=s.time;reversals++;}
 const actors=s.actors.filter(a=>a.presence>.2).map(a=>{
   v.fromArray(a.position);const distance=cam.position.distanceTo(v),r=(radius[a.id%4]||1.4)*a.scale*1.12;
   closest=Math.min(closest,distance-r);
   const depth=-v.applyMatrix4(cam.matrixWorldInverse).z;
   const ry=r/(Math.max(.01,depth)*Math.tan(s.fov*Math.PI/360)),rx=ry/cam.aspect;
   v.fromArray(a.position).project(cam);
   return {id:a.id,ndc:v.toArray(),distance,viewDepth:depth,bellRadiusProxy:r,projectedRadius:ry,projectedRadiusX:rx,
     onScreen:depth>0&&Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z<1,
     envelopeOverlapsFrame:depth>0&&Math.abs(v.x)<1+rx&&Math.abs(v.y)<1+ry&&v.z<1};
 });
 if(i%6===0)composition.push({time:s.time,progress:s.progress,actors});
}
if(stillStart!==null&&valid.at(-1).time-stillStart>=2)still.push([stillStart,valid.at(-1).time]);
const summary={kind:'live browser camera telemetry, not render completion or GPU timings',h,derivativeSpanSeconds:2*n*h,duration:valid.at(-1).time,pathLength:path,totalRotationDegrees:rotation,speed:stats(valid.map(s=>s.speed)),angularSpeed:stats(valid.map(s=>s.angularSpeed)),angularAcceleration:stats(valid.map(s=>s.angularAcceleration)),linearAcceleration:stats(valid.map(s=>s.accel)),jerk:stats(valid.map(s=>s.jerk)),roll:[Math.min(...valid.map(s=>s.roll)),Math.max(...valid.map(s=>s.roll))],fov:[Math.min(...valid.map(s=>s.fov)),Math.max(...valid.map(s=>s.fov))],nearStillIntervals:still,reversalEvents:reversals,closestConservativeBellEnvelope:closest,targetSpeed:stats(valid.map(s=>s.targetSpeed)),correctionTarget:stats(valid.map(s=>s.correction?.target||0)),correctionPosition:stats(valid.map(s=>s.correction?.position||0)),limitations:'Actor coordinates rounded to .01 by existing debug API. Bell radius proxy includes 12% variation allowance; no exact deformed appendage collision claim. Derivatives smoothed over 100 ms. Includes deliberate input reversals/jumps; inspect forward segment separately.'};
const forward=valid.filter(s=>s.time<valid.at(-1).time*.8);
summary.kind = meta.mode === 'motion' ? 'live browser camera telemetry; not render completion or GPU timings' : `${meta.mode}; camera diagnostics only`;
summary.subjects = Array.from({length:8},(_,id)=>{
  const track=composition.map(f=>({time:f.time,...f.actors.find(a=>a.id===id)})).filter(a=>a.ndc);
  return {id,visibleSeconds:track.filter(a=>a.onScreen).length*.1,edgeCrossings:track.slice(1).filter((a,i)=>a.onScreen!==track[i].onScreen).length,minDistance:Math.min(...track.map(a=>a.distance)),centerFraction:track.length?track.filter(a=>a.onScreen&&Math.hypot(a.ndc[0],a.ndc[1])<.15).length/track.length:0};
});
summary.forwardOnly={angularSpeed:stats(forward.map(s=>s.angularSpeed)),angularAcceleration:stats(forward.map(s=>s.angularAcceleration)),linearAcceleration:stats(forward.map(s=>s.accel)),jerk:stats(forward.map(s=>s.jerk)),worstAngular:forward.toSorted((a,b)=>b.angularSpeed-a.angularSpeed).filter((s,i)=>i===0||i%30===0).slice(0,4).map(s=>({time:s.time,progress:s.progress,angularSpeed:s.angularSpeed,correction:s.correction}))};
writeFileSync(`${root}/metrics.json`,JSON.stringify(summary,null,2));writeFileSync(`${root}/composition.json`,JSON.stringify(composition));
const channels=['speed','accel','jerk','angularSpeed','angularAcceleration','roll'];
writeFileSync(`${root}/graphs.html`,`<!doctype html><meta charset="utf-8"><title>Camera diagnostics</title><style>body{background:#101820;color:#ddd;font:15px sans-serif}canvas{display:block;width:100%;height:160px}pre{white-space:pre-wrap}</style><h1>Camera diagnostics · 60 Hz resampling</h1><p>100 ms central derivative window. Not a cinematography score.</p>${channels.map(c=>`<h2>${c}</h2><canvas id="${c}" width="1200" height="160"></canvas>`).join('')}<pre>${JSON.stringify(summary,null,2)}</pre><script>const a=${JSON.stringify(valid.map(s=>Object.fromEntries(['time',...channels].map(k=>[k,s[k]]))))};for(const key of ${JSON.stringify(channels)}){const c=document.getElementById(key),x=c.getContext('2d'),lo=Math.min(0,...a.map(s=>s[key])),hi=Math.max(...a.map(s=>s[key]));x.strokeStyle='#6cd1de';x.beginPath();a.forEach((s,i)=>{const px=i/(a.length-1)*1200,py=150-(s[key]-lo)/(hi-lo||1)*140;i?x.lineTo(px,py):x.moveTo(px,py)});x.stroke();x.fillStyle='#ddd';x.fillText(hi.toFixed(2),10,12);}</script>`);
console.log(root,JSON.stringify(summary));
writeFileSync(`${root}/composition.html`,`<!doctype html><meta charset="utf-8"><title>Offline camera blocking</title><style>body{background:#0b1822;color:#ccdce5;font:14px sans-serif}canvas{background:#06111a;margin:10px;border:1px solid #456}label{display:block}</style><h1>Offline blocking · no framing feedback</h1><p>Left: animal bell centres in normalized frame, colours identify animals. Right: camera world X/Z path. Outside-frame paths are clipped. Proxies, not exact deformed silhouettes.</p><canvas id="subjects" width="600" height="420"></canvas><canvas id="world" width="600" height="420"></canvas><label>Progress interval <input id="lo" type="range" min="0" max="1" step=".01" value="0"><input id="hi" type="range" min="0" max="1" step=".01" value="1"></label><script>const a=${JSON.stringify(composition)},p=${JSON.stringify(valid.filter((_,i)=>i%6===0).map(s=>({s:s.progress,p:s.position})))};const colours=['#64d8ed','#d480eb','#f39b72','#d5da74','#719cfe','#eb81a2','#6de0b1','#fff'];function draw(){let ctx=subjects.getContext('2d');ctx.clearRect(0,0,600,420);ctx.strokeStyle='#345';ctx.strokeRect(100,70,400,280);for(let id=0;id<8;id++){ctx.strokeStyle=colours[id];ctx.beginPath();let active=false;for(const f of a){const v=f.actors.find(v=>v.id===id);if(!v||f.progress<+lo.value||f.progress>+hi.value){active=false;continue;}const x=300+v.ndc[0]*200,y=210-v.ndc[1]*140;active?ctx.lineTo(x,y):ctx.moveTo(x,y);active=true;}ctx.stroke();}ctx=world.getContext('2d');ctx.clearRect(0,0,600,420);ctx.strokeStyle='#a5d9e6';ctx.beginPath();p.forEach((v,i)=>{const x=300+v.p[0]*18,y=140-v.p[2]*12;i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();}lo.oninput=hi.oninput=draw;draw();</script>`);
