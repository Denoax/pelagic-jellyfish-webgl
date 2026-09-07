import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const root = process.argv[2] || '/tmp/pelagic-m3-bubbles';
const read = path => JSON.parse(readFileSync(`${root}/${path}`));
const stats = values => {
  if (!values?.length) return null;
  const a = [...values].sort((a,b)=>a-b);
  return { n:a.length, median:a[Math.floor(a.length*.5)], p95:a[Math.floor(a.length*.95)], max:a.at(-1), over50:a.filter(v=>v>50).length };
};
const performance = [];
for (const label of ['perf-m3-calm','perf-bubbles-calm','perf-m3-peak','perf-bubbles-peak','perf-m3-capacity','perf-bubbles-capacity','perf-bubbles-tissue','perf-live-bubbles','perf-review-passage']) {
  if (!existsSync(`${root}/${label}/performance.json`)) continue;
  const data = read(`${label}/performance.json`), cost = read(`${label}/bubble-cost.json`);
  performance.push({label, completion:stats(data.auditRender.intervals), cpu:stats(cost.cpu), population:cost.state,
    info:data.info, after:data.after, errors:data.errors});
}
const matchedStates = ['calm','peak','capacity'].map(s => {
  const a=performance.find(p=>p.label===`perf-m3-${s}`), b=performance.find(p=>p.label===`perf-bubbles-${s}`);
  return {state:s, exact:a&&b?JSON.stringify(a.info.controlledState)===JSON.stringify(b.info.controlledState):null};
});
const finalPeak=performance.find(p=>p.label==='perf-bubbles-tissue');
if(finalPeak)matchedStates.push({state:'final-tissue-capacity',exact:JSON.stringify(finalPeak.info.controlledState)===JSON.stringify(performance.find(p=>p.label==='perf-m3-capacity')?.info.controlledState)});
if(matchedStates.some(s=>s.exact!==true))throw Error('Performance scene states do not match');
const replay=performance.find(p=>p.label==='perf-review-passage');
if(replay&&(!(replay.population.births>0)||replay.population.ambient||replay.population.heroes))throw Error('Review did not enter and completely leave the bubble event');
const tours = [];
for (const label of ['tissue-desktop','tissue-narrow','tissue-portrait']) {
  if (!existsSync(`${root}/${label}/bubbles.json`)) continue;
  const {checkpoints,errors}=read(`${label}/bubbles.json`);
  tours.push({label,errors,checkpoints:checkpoints.map(c=>({name:c.name,time:c.state.specimen.time,progress:c.state.camera.progress,
    population:c.bubbles,buffer:c.bubbles.lens.size})), movie:read(`${label}/motion-metadata.json`)});
}
const pixels=[];
const decode=name=>spawnSync('/usr/bin/ffmpeg',['-v','error','-i',`${root}/bell-crossing/${name}.png`,'-f','rawvideo','-pix_fmt','rgb24','-'],{maxBuffer:12e6}).stdout;
if(existsSync(`${root}/bell-crossing/matched-bubbles.png`)){
  const a=decode('matched-bubbles');
  for(const name of ['matched-ambient-only','matched-clear']){
    const b=decode(name);if(a.length!==b.length||a.length===0)throw Error('Missing matched frames');
    let changed=0,over3=0,max=0,sum=0;
    for(let i=0;i<a.length;i++){const d=Math.abs(a[i]-b[i]);changed+=Number(d>0);over3+=Number(d>3);max=Math.max(max,d);sum+=d;}
    pixels.push({comparison:name,channels:a.length,changed,over3,max,mean:sum/a.length});
  }
}
const summary={performance,matchedStates,tours,pixels};
writeFileSync(`${root}/bubble-summary.json`,JSON.stringify(summary,null,2));
console.log(JSON.stringify({performance:performance.map(({label,completion,cpu,population})=>({label,completion,cpu,population:population&&{ambient:population.ambient,heroes:population.heroes,classes:population.classes}})),matchedStates,pixels},null,2));
