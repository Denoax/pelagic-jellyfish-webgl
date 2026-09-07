// Read saved evidence only. Run AFTER browser/performance jobs finish.
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
const root=new URL('./evidence/',import.meta.url);
const read=(path)=>JSON.parse(readFileSync(new URL(path,root),'utf8'));
const stats=a=>{
  if(!a?.length)return null;
  const s=a.slice().sort((a,b)=>a-b), round=x=>Math.round(x*100)/100;
  return {count:s.length,median:round(s[Math.floor(s.length*.5)]),p95:round(s[Math.floor(s.length*.95)]),max:round(s.at(-1)),over50:s.filter(x=>x>50).length};
};
const result={source:{live:'a0501c21f8c782887bf6a5e1257e955ada41b678',approved:'515fa71d90f423ac97747cb7a60d1d84d446d13b',candidate:'cd3d79c2f5ae8f0bc9eb88936123bd26ac219e49'},performance:{},clips:{},matched:{}};
for(const name of readdirSync(root)){
  if(name.startsWith('perf-') && name.includes('-final-')){
    const path=`${name}/performance.json`;
    if(!existsSync(new URL(path,root)))continue;
    const j=read(path);
    assert.equal(j.auditRender.matched,1);
    assert.equal(j.auditRender.method,'async-render-completion-v2');
    assert.ok(j.auditRender.intervals.length>0);
    assert.ok(j.auditRender.intervals.reduce((sum,dt)=>sum+dt,0)>j.seconds*900,
      'Incomplete render observation; do not mistake a stopped loop for good frame pacing');
    assert.deepEqual(j.info.viewport,[1280,900]);
    assert.deepEqual(j.info.buffers[0],[1280,900]);
    assert.deepEqual(j.after.buffers[0],[1280,900]);
    assert.equal(j.info.ratio,1);assert.equal(j.after.ratio,1);
    assert.equal(j.info.backend,'WebGL 2');assert.equal(j.errors.length,0);
    result.performance[name]={render:stats(j.auditRender.intervals),nativeFixture:stats(j.renderIntervals),raf:stats(j.intervals),controllerCpu:stats(j.featureCpuIntervals)};
  }
  if(!name.startsWith('reference-')&&!name.startsWith('draft-')&&!['candidate-narrow','candidate-narrow-final'].includes(name)&&existsSync(new URL(`${name}/motion.mp4`,root))){
    const raw=execFileSync('ffprobe',['-v','error','-show_entries','stream=width,height','-show_entries','format=duration','-of','json',fileURLToPath(new URL(`${name}/motion.mp4`,root))],{encoding:'utf8'});
    result.clips[name]=JSON.parse(raw);
    const capture=read(`${name}/capture.json`);
    assert.deepEqual([result.clips[name].streams[0].width,result.clips[name].streams[0].height],capture.info.viewport,
      `${name}: encoded footage does not match the inspected viewport`);
    assert.equal(capture.errors.length,0);
  }
}
for(const [before,after] of [['shipped-pulses','candidate-pulses'],['shipped-activation','candidate-activation']]){
  const a=read(`${before}/matched.json`).snapshots,b=read(`${after}/matched.json`).snapshots;
  a.forEach((s,i)=>{
    if(s.click){assert.deepEqual(s.click,b[i].click);return;}
    for(const key of ['camera','actors','connected'])assert.deepEqual(s[key],b[i][key]);
    assert.equal(s.specimen.phase,b[i].specimen.phase);
    assert.equal(s.specimen.activation,b[i].specimen.activation);
  });
  result.matched[after]={checkpoints:a.filter(s=>!s.click).length,phaseCameraActorsFieldActivation:'exact parity'};
}
const long=read('candidate-long-final/observation.json');
assert.equal(long.valid,true);
result.long={duration:long.durationSeconds,simulationAdvance:long.simulationAdvance,valid:long.valid,rapidHits:long.clicks.slice(0,12).filter(c=>c.hit).length,
  otherClicks:long.clicks.slice(12),peaks:Object.fromEntries(['wakes','activations','echoes'].map(k=>[k,Math.max(...long.checkpoints.map(c=>c.state.connected[k]))])),final:long.checkpoints.at(-1).state.connected,errors:long.errors.length};
const life=read('candidate-lifecycle/lifecycle.json');
result.lifecycle={idleBefore:life.idleBefore,idleAfter:life.idleAfter,clicks:[life.activationsBefore,life.activationsAfter],visibility:life.backgroundVisibility,simulationAdvance:life.connectedAfterFreeze.time-life.connectedBeforeFreeze.time,errors:life.errors.length};
writeFileSync(new URL('summary.json',root),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
