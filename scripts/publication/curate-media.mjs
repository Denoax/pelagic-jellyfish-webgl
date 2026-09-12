// Derive publication media from recorded browser frames, never synthesized imagery.
import {readFileSync,writeFileSync,mkdirSync,copyFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
const evidence=resolve(process.argv[2]||'publication-evidence');
const out=resolve('paper/media');mkdirSync(out,{recursive:true});
const ff=args=>{const r=spawnSync('ffmpeg',['-y','-loglevel','error',...args],{encoding:'utf8'});if(r.status)throw Error(r.stderr);};
const claims=['Pulse, refill and coast','Body turn and appendage history','Activation and environmental decay','Projected detail during camera travel','Live bubble passage','Four views and Explore','Sanctuary plume','Ocean-to-clock entry','Contact and merge','Pointer deformation and recovery','Minute change','Pinch dismissal'];
const records=[];
for(let n=1;n<=12;n++){
 const id='S'+n,dir=join(evidence,'motion',id),m=JSON.parse(readFileSync(join(dir,'metadata.json')));
 m.claim=claims[n-1];m.captureToolSha='2859eac';
 writeFileSync(join(out,id+'.json'),JSON.stringify(m,null,2)+'\n');records.push(m);
 const frame=n===2?180:n===9?155:n===10?30:n===11?40:n===12?52:n===8?160:80;
 ff(['-i',join(dir,`frame-${String(frame).padStart(6,'0')}.jpg`),'-vf','scale=960:-2','-q:v','3',join(out,id+'.jpg')]);
}
writeFileSync(join(out,'catalog.json'),JSON.stringify(records,null,2)+'\n');
ff(['-i',join(evidence,'scout','A-0.16.png'),'-q:v','2','paper/figures/F01-overview.jpg']);
ff(['-i',join(evidence,'scout','D-1.png'),'-q:v','2','paper/figures/F09-sanctuary.jpg']);
for(const [name,file]of [['surface','A-0.16'],['pelagic','B-0.55'],['abyss','D-1']])ff(['-i',join(evidence,'scout',file+'.png'),'-vf','scale=640:-2','-q:v','3',join(out,name+'.jpg')]);
const stills=[];
for(const [id,clip,frames]of [['F10-contact','S9',[80,110,135,155]],['F11-pinch','S12',[42,52,65,82]]]){
 const dir=join(evidence,'motion',clip),times=JSON.parse(readFileSync(join(dir,'frame-timestamps.json')));
 const inputs=frames.flatMap(i=>['-i',join(dir,`frame-${String(i).padStart(6,'0')}.jpg`)]);
 const filter=frames.map((i,j)=>`[${j}:v]scale=640:450[v${j}]`).join(';')+';[v0][v1][v2][v3]xstack=inputs=4:layout=0_0|640_0|0_450|640_450[v]';
 ff([...inputs,'-filter_complex',filter,'-map','[v]','-frames:v','1','-q:v','2',`paper/figures/${id}.jpg`]);
 stills.push({id,sourceClip:clip,frames:frames.map(i=>({index:i,elapsed:times[i].time-times[0].time})),transformation:'Reading order 2×2 layout; each complete 1280×900 browser frame scaled to 640×450; elapsed values in metadata and caption'});
}
writeFileSync('paper/figures/capture-metadata.json',JSON.stringify({runtimeSha:records[0].runtimeSha,overview:JSON.parse(readFileSync(join(evidence,'scout','A-0.16.json'))),sanctuary:JSON.parse(readFileSync(join(evidence,'scout','D-1.json'))),filmstrips:stills},null,2)+'\n');
for(const [id,name,start,duration]of [['S3','hero',0,6],['S9','contact',2,6],['S12','pinch',0,6]]){
 ff(['-ss',String(start),'-t',String(duration),'-i',join(evidence,'motion',id,'motion.mp4'),'-filter_complex','fps=12,scale=960:-2:flags=lanczos,split[a][b];[a]palettegen=max_colors=64[p];[b][p]paletteuse=dither=bayer:bayer_scale=4','-loop','0',join(out,name+'.gif')]);
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1280" height="640"><image width="1280" height="900" y="-80" xlink:href="data:image/jpeg;base64,${readFileSync('paper/figures/F01-overview.jpg').toString('base64')}"/><rect width="1280" height="155" fill="#000" opacity=".6"/><g fill="white" font-family="DejaVu Sans,sans-serif"><text x="54" y="85" font-size="58">PELAGIC</text><text x="57" y="130" font-size="22">Mani Marami Milani · Technical preprint</text></g></svg>`;
writeFileSync(join(out,'social-preview.svg'),svg);const r=spawnSync('rsvg-convert',[join(out,'social-preview.svg'),'-o',join(out,'social-preview.png')]);if(r.status)throw Error('Social preview rasterization failed');
ff(['-i',join(out,'social-preview.png'),'-q:v','3',join(out,'social-preview.jpg')]);
console.log('Curated actual browser evidence. Masters remain outside Git.');
