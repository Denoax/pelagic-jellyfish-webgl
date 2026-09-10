import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const root='/home/mani/dev/jellyfish-studio/m6-4-evidence';
const read=p=>JSON.parse(readFileSync(p));
const rows=[];
for(const key of ['explore','deep','drift','ravine','base','colony','shelf','spires','illumination','portrait']){
 const a=read(`${root}/baseline/${key}/state.json`),b=read(`${root}/candidate/${key}/state.json`);
 rows.push({key,cameraEqual:JSON.stringify(a.camera)===JSON.stringify(b.camera),buffersEqual:JSON.stringify(a.buffers)===JSON.stringify(b.buffers),animalTime:[a.animal.time,b.animal.time],phase:[a.animal.phase,b.animal.phase],plumeTime:[a.sanctuary.plumeTime,b.sanctuary.plumeTime],baselineErrors:read(`${root}/baseline/${key}/errors.json`).length,candidateErrors:read(`${root}/candidate/${key}/errors.json`).length});
}
const clips=[];
for(const side of ['before','after'])for(const mode of ['descent','stationary','orbit','ravine','life','illumination']){
 const path=`${root}/motion/${side}-${mode}`;
 if(!existsSync(`${path}/motion.mp4`))throw Error('Missing '+path);
 const p=spawnSync('ffprobe',['-v','error','-show_entries','stream=width,height,nb_frames:format=duration','-of','json',`${path}/motion.mp4`],{encoding:'utf8'});
 const metadata=JSON.parse(p.stdout),record=read(`${path}/recording.json`);
 clips.push({side,mode,metadata,record});
 if(metadata.streams[0].width!==1280||metadata.streams[0].height!==900||record.errors.length)throw Error('Invalid clip '+path);
}
writeFileSync(`${root}/evidence-validation.json`,JSON.stringify({rows,clips},null,2));
console.log(JSON.stringify({rows,clips:clips.map(c=>({side:c.side,mode:c.mode,frames:c.record.frames,seconds:c.record.duration}))},null,2));
if(rows.some(x=>!x.cameraEqual||!x.buffersEqual||x.baselineErrors||x.candidateErrors||Math.abs(x.animalTime[0]-x.animalTime[1])>1e-7))process.exitCode=1;
