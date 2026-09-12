// QA-only evidence inventory. Never imported by the artwork.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root='../asset2-evidence',read=p=>JSON.parse(readFileSync(`${root}/${p}.json`));
const runtimeSHA='99ac8336be832c18230dcadefd815308c6c83c8f';
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const clips=[];
for(const mode of 'ABCDEFGH'){
 const dir=`final/motion-${mode}`,r=read(`${dir}/recording`),start=read(`${dir}/start`),end=read(`${dir}/end`);
 assert.ok(r.frames>400&&r.duration>=20);assert.deepEqual(read(`${dir}/errors`),[]);
 assert.equal(start.renderer.backend,'WebGL 2');assert.ok(start.renderer.gpu.includes('NVIDIA'));
 assert.deepEqual(start.renderer.drawBuffer,mode==='H'?[390,844]:[1672,941]);
 clips.push({mode,duration:r.duration,frames:r.frames,renderer:start.renderer,phaseStart:start.phase.time,phaseEnd:end.phase.time,sha256:hash(`${root}/${dir}/motion.mp4`)});
}
const cycles=read('validation/lifecycle/cycles'),life=read('validation/lifecycle/final');
assert.equal(cycles.length,20);assert.equal(life.contexts,1);assert.deepEqual(read('validation/lifecycle/errors'),[]);
const resources={};
for(const label of ['baseline','candidate']){
 const base=`../m7-evidence/resources/asset2-${label}`,get=n=>JSON.parse(readFileSync(`${base}/${n}.json`));
 const cycles=get('cycles');assert.equal(cycles.length,6);assert.deepEqual(cycles[0].handles,cycles.at(-1).handles);assert.deepEqual(get('errors'),[]);
 resources[label]={initial:get('initial').handles,last:cycles.at(-1).handles,idle:cycles.at(-1).idle};
}
assert.deepEqual(resources.baseline.last,resources.candidate.last);
const passes={};
for(const label of ['baseline','candidate']){
 passes[label]={};
 for(const state of ['normal','idle']){
  const rows=read(`validation/${label}-passes/${state}`),counts={},targets={};
  for(const row of rows){counts[row.kind]=(counts[row.kind]||0)+1;const key=JSON.stringify(row.target);targets[key]=(targets[key]||0)+1;}
  passes[label][state]={counts,targets,first:rows.slice(0,12)};
 }
 assert.deepEqual(read(`validation/${label}-passes/errors`),[]);
}
const baseline='bce3571b0300ecfe5dc6e5dd45f28a9cda57006e';
const sourceFiles=execFileSync('git',['diff',baseline,'--name-only','--','src'],{encoding:'utf8'}).trim().split('\n');
const referenceHash=hash('docs/reference/asset2/REF_00_ASSET2_ORIGINAL.png');
assert.equal(referenceHash,'9226b64fa9dafc63753e25e333a58e157b033dfe21e9b6713ff02cea13dbac22');
assert.equal(execFileSync('git',['diff','ab709b22f68e1bc0cd57f4bb70871ab67c609a01','--','docs/reference/asset2'],{encoding:'utf8'}),'');
const result={runtimeSHA,baseline,branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),referenceHash,sourceFiles,clips,lifecycle:{cycles:20,contexts:life.contexts},resources,passes};
writeFileSync(`${root}/final/manifest.json`,JSON.stringify(result,null,2));
console.log(JSON.stringify({clips:clips.map(({mode,duration,frames})=>({mode,duration,frames})),lifecycle:result.lifecycle,handles:resources.candidate.last,passes},null,2));
