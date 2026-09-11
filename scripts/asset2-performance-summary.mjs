import {readFileSync,writeFileSync} from 'node:fs';
const root='../asset2-evidence/performance';
const scenes=['qa-pose','journey','sanctuary','explore-near','explore-abyss','idle'];
const q=(a,p)=>{const s=[...a].sort((a,b)=>a-b);return s.length?s[Math.floor(p*(s.length-1))]:null;};
const rows=scenes.map(scene=>{
 const load=label=>JSON.parse(readFileSync(`${root}/${label}/${scene}/performance.json`));
 const baseline=load('baseline-final'),candidate=load('candidate-final');
 const slim=s=>({SHA:s.sourceSHA,...s.summary,drawCalls:s.renderStats.drawCalls,triangles:s.renderStats.triangles,textures:s.renderStats.memory.textures,geometries:s.renderStats.memory.geometries,environmentCPU:s.environmentCost?{samples:s.environmentCost.length,median:q(s.environmentCost,.5),p95:q(s.environmentCost,.95),max:q(s.environmentCost,1),mean:s.environmentCost.reduce((a,b)=>a+b,0)/s.environmentCost.length}:null});
 return{scene,baseline:slim(baseline),candidate:slim(candidate)};
});
writeFileSync(`${root}/comparison.json`,JSON.stringify(rows,null,2));
let table='| Scene | Baseline median / p95 / max / >50ms | Candidate median / p95 / max / >50ms | Draw calls B→C | Triangles B→C | Textures B→C |\n|---|---|---|---|---|---|\n';
const f=s=>`${s.median.toFixed(1)} / ${s.p95.toFixed(1)} / ${s.max.toFixed(1)} / ${s.over50}`;
for(const r of rows)table+=`| ${r.scene} | ${f(r.baseline)} | ${f(r.candidate)} | ${r.baseline.drawCalls}→${r.candidate.drawCalls} | ${r.baseline.triangles}→${r.candidate.triangles} | ${r.baseline.textures}→${r.candidate.textures} |\n`;
writeFileSync(`${root}/comparison.md`,table);console.log(table);console.log(JSON.stringify(rows.map(r=>({scene:r.scene,cpu:r.candidate.environmentCPU})),null,2));
