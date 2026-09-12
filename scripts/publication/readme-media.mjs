// Re-encode existing approved browser motion. Never captures or renders artwork.
import {readFileSync,writeFileSync,mkdirSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const evidence=resolve(process.argv[2]||'../publication-evidence');
const out='docs/readme';mkdirSync(out,{recursive:true});
const runtime='bce3571b0300ecfe5dc6e5dd45f28a9cda57006e';
const jobs=[
 {name:'hero',segments:[['S3',0,2.5],['S4',4,2.5],['S7',3,2.5],['S8',4,2.5]],claim:'Edited sequence: organism, travelling ocean, sanctuary, liquid clock; cuts are not a continuous camera route.'},
 {name:'appendages',segments:[['S2',1,7]],claim:'Oblique near specimen: pulsing body and lagging appendages. No speed change.'},
 {name:'refraction',segments:[['S5',2,7]],claim:'Live moving ocean bends through the sparse refractive bubble passage.'},
 {name:'liquid',segments:[['S9',2,6]],claim:'Normal-frame clock contact, joining and settlement. Authored topology, not conserved fluid.'},
];
const hash=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const records=[];
for(const job of jobs){
 const inputs=[],filters=[];
 for(const [i,[id,start,duration]]of job.segments.entries()){
  const m=JSON.parse(readFileSync(`paper/media/${id}.json`));if(m.runtimeSha!==runtime||m.errors.length)throw Error('Invalid source '+id);
  inputs.push('-ss',String(start),'-t',String(duration),'-i',join(evidence,'motion',id,'motion.mp4'));
  filters.push(`[${i}:v]fps=8,scale=640:-2:flags=lanczos,setpts=PTS-STARTPTS[v${i}]`);
 }
 const vs=job.segments.map((_,i)=>`[v${i}]`).join('');
 filters.push(`${vs}concat=n=${job.segments.length}:v=1:a=0,split[a][b]`,'[a]palettegen=max_colors=48[p]','[b][p]paletteuse=dither=bayer:bayer_scale=5[out]');
 const file=`${out}/${job.name}.gif`;
 const r=spawnSync('ffmpeg',['-y','-loglevel','error',...inputs,'-filter_complex_threads','2','-filter_complex',filters.join(';'),'-map','[out]','-loop','0',file],{encoding:'utf8'});if(r.status)throw Error(r.stderr);
 records.push({file,claim:job.claim,runtimeSha:runtime,encoding:{width:640,fps:8,colors:48,speed:1},bytes:statSync(file).size,sha256:hash(file),sources:job.segments.map(([id,start,duration])=>({id,startSeconds:start,durationSeconds:duration,metadata:`paper/media/${id}.json`,masterSha256:hash(join(evidence,'motion',id,'motion.mp4'))}))});
 console.log(file,statSync(file).size);
}
const total=records.reduce((s,r)=>s+r.bytes,0);if(total>12_000_000)throw Error('README derivative media exceeds 12 MB budget');
writeFileSync(`${out}/media.json`,JSON.stringify({runtimeSha:runtime,notes:'Existing browser masters only. GIF quantization and temporal subsampling are publication compression, not runtime quality changes. Sources retain original frame timestamps outside Git. No new recording, benchmark or generated imagery.',totalGifBytes:total,files:records},null,2)+'\n');
