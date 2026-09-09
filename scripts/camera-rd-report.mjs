// Derived evidence manifest and tables; preserves all raw browser artifacts.
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const raw='/home/mani/dev/jellyfish-studio/m5-rd-evidence',out='docs/research/2026-09-08-camera-direction';
const read=p=>JSON.parse(readFileSync(p)),fmt=n=>Number.isFinite(n)?n.toFixed(2):'NOT TESTED';
const result={baseline:'a61d79be0fab528daa11a1cf72e00d986b4a5727',rejected:'de13db2372d0847e18cd2154095f4aade9f23c81',cameraCore:'22e330c7cdc2fdfc6aee50ab393ee1684fd67967',raw,motion:{},performance:{},captures:{},fixedStates:{}};
let text='# Measured camera studies\n\nGenerated from raw evidence. Camera kinematics are diagnostics, not a cinematic score. Frame intervals are not GPU timings.\n\n## Normal forward segment\n\n| Camera | Angular median / p95 / max °/s | Angular acceleration p95 °/s² | Linear acceleration p95 | Jerk p95 / max | FOV |\n|---|---:|---:|---:|---:|---:|\n';
for(const label of ['approved-v2','rejected-v2',...['A','B','C','D'].map(d=>`candidate-${d}-final`)]){
 if(!existsSync(`${raw}/${label}/trace.json`))continue;
 spawnSync(process.execPath,['scripts/camera-rd-metrics.mjs',`${raw}/${label}`],{stdio:'ignore'});
 const m=read(`${raw}/${label}/metrics.json`);result.motion[label]=m;const f=m.forwardOnly;
 text+=`| ${label} | ${fmt(f.angularSpeed.median)} / ${fmt(f.angularSpeed.p95)} / ${fmt(f.angularSpeed.max)} | ${fmt(f.angularAcceleration.p95)} | ${fmt(f.linearAcceleration.p95)} | ${fmt(f.jerk.p95)} / ${fmt(f.jerk.max)} | ${m.fov.map(fmt).join('–')} |\n`;
 mkdirSync(`${out}/evidence/${label}`,{recursive:true});for(const file of ['metrics.json','graphs.html','composition.json','composition.html','phase-3.png','phase-6.png'])if(existsSync(`${raw}/${label}/${file}`))copyFileSync(`${raw}/${label}/${file}`,`${out}/evidence/${label}/${file}`);
}
text+='\n## Whole-route frame completion intervals\n\n40 seconds, 12 seconds warm-up (6 initial + 6 route settle), 1280×900 actual ocean buffer, DPR 1, fixed quality, normal production bloom off. Actual NVIDIA RTX 4070 WebGL2, Brave Chromium 152. No screenshots, recording or profiler during measurement. Camera paths deliberately expose different scene content, so this is a whole-scene comparison, not isolated shader/GPU cost.\n\n| Camera/run | Median ms | p95 ms | Max ms | >50 ms | Completed intervals |\n|---|---:|---:|---:|---:|---:|\n';
for(const label of ['approved','A','B','C','D','approved-repeat']){
 const path=`${raw}/perf-${label}/performance.json`;if(!existsSync(path))continue;const p=read(path),a=p.auditRender.intervals.toSorted((a,b)=>a-b);
 const m={median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1),over50:a.filter(v=>v>50).length,count:a.length,backend:p.info.actualGL,buffer:p.info.hardware?.drawBuffer,ratio:p.info.ratio,method:p.auditRender.method,errors:p.errors.length};result.performance[label]=m;
 text+=`| ${label} | ${fmt(m.median)} | ${fmt(m.p95)} | ${fmt(m.max)} | ${m.over50} | ${m.count} |\n`;
}
text+='\n## Capture coverage\n\n';
for(const d of ['A','B','C','D'])for(const profile of ['final','portrait','slow','fast']){
 const label=`candidate-${d}-${profile}`,path=`${raw}/${label}/result.json`;if(!existsSync(path)){result.captures[label]='NOT TESTED';continue;}
 const r=read(path);result.captures[label]={seconds:r.seconds,frames:r.frames,exceptions:r.errors.length};text+=`- ${label}: ${fmt(r.seconds)} s, ${r.frames} recorded frames, ${r.errors.length} browser exceptions. [Motion](http://127.0.0.1:5193/evidence/${label}/motion.mp4)\n`;
 if(existsSync(`${raw}/${label}/trace.json`))spawnSync(process.execPath,['scripts/camera-rd-metrics.mjs',`${raw}/${label}`],{stdio:'ignore'});
}
text+='\n## Fixed-state browser frames\n\n30 seconds of simulation, seeded at 7183, fixed 1/60-second steps, identical native-scroll history ending at 0.35. These are real ocean frames; different cameras and their approved visibility/LOD decisions intentionally differ. Equality below compares the foreground debug state, not all mesh buffers or pixels.\n\n';
const fixedBaseline=`${raw}/fixed-approved/state.json`;
if(existsSync(fixedBaseline)){
 const baseline=read(fixedBaseline).state.actors;
 for(const side of ['approved','rejected','A','B','C','D']){
  const folder=`fixed-${side}`,file=`${raw}/${folder}/state.json`;if(!existsSync(file))continue;
  const state=read(file);result.fixedStates[side]={time:state.state.specimen.time,foregroundDebugStateEqual:JSON.stringify(baseline)===JSON.stringify(state.state.actors),renderer:state.state.renderer};
  mkdirSync(`${out}/evidence/${folder}`,{recursive:true});for(const name of ['frame.png','state.json'])copyFileSync(`${raw}/${folder}/${name}`,`${out}/evidence/${folder}/${name}`);
  text+=`- ${side}: foreground debug state equal = ${result.fixedStates[side].foregroundDebugStateEqual}. [Frame](evidence/${folder}/frame.png) · [State](evidence/${folder}/state.json)\n`;
 }
}
writeFileSync(`${out}/results.json`,JSON.stringify(result,null,2));writeFileSync(`${out}/results.md`,text);console.log(text);
