import {readFileSync,writeFileSync,copyFileSync,mkdirSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const evidence=resolve(process.argv[2]),dir=join(evidence,'inspection-final');
const meta=JSON.parse(readFileSync(join(dir,'inspection.json')));if(meta.errors.length)throw Error('Inspection contained browser errors');
mkdirSync('paper/inspection',{recursive:true});copyFileSync(join(dir,'inspection.json'),'paper/inspection/metadata.json');
const img=(file,x,y,w,h)=>`<image x="${x}" y="${y}" width="${w}" height="${h}" href="data:image/${file.endsWith('.jpg')?'jpeg':'png'};base64,${readFileSync(file).toString('base64')}"/>`;
const label=(s,x,y)=>`<text x="${x}" y="${y}" fill="#24383f" font-size="21" font-family="DejaVu Sans">${s}</text>`;
const save=(name,height,body)=>{const s=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="${height}"><rect width="1280" height="${height}" fill="white"/>${body}</svg>`;writeFileSync(`paper/inspection/${name}.svg`,s);const r=spawnSync('rsvg-convert',[`paper/inspection/${name}.svg`,'-o',`paper/figures/${name}.png`]);if(r.status)throw Error('Rasterizing inspection figure failed');};
let pulse=img('paper/figures/F04-pulse.png',0,0,1280,619);
for(let i=0;i<4;i++){const x=(i%2)*640,y=640+Math.floor(i/2)*490;const state=meta.records.find(r=>r.id===`pulse-${i}`).state.simulation;pulse+=label(`q=${state.phase.toFixed(3)} · t=${state.time.toFixed(1)} s`,x+16,y+25)+img(join(dir,`pulse-${i}.png`),x,y+34,640,450);}
save('F04-pulse',1620,pulse);
let lod=img('paper/figures/F06-lod.png',0,0,1280,619);
for(const [i,p]of [.3,.5,.7].entries()){const record=meta.records.find(r=>r.id===`population-${p}`);const c=record.population.counts;lod+=label(`p=${p} · N/M/F ${c.near}/${c.medium}/${c.far}`,i*426+10,650)+img(join(dir,`population-${p}.png`),i*426,665,426,300);}
save('F06-lod',980,lod);
let optics=img('paper/figures/F08-refraction.png',0,0,1280,619);
for(const[i,frame]of[110,230,360].entries())optics+=label(`S5 · source frame ${frame}`,i*426+10,650)+img(join(evidence,'motion','S5',`frame-${String(frame).padStart(6,'0')}.jpg`),i*426,665,426,300);
optics+=label('Frozen live ocean: optics ON',15,1000)+label('Same frame state: optics OFF',655,1000)+img(join(dir,'optics-on.png'),0,1020,640,450)+img(join(dir,'optics-off.png'),640,1020,640,450);
save('F08-refraction',1480,optics);
for(const name of ['ocean-820','idle-820','ocean-390','idle-390','optics-on','optics-off'])copyFileSync(join(dir,name+'.png'),join('paper/inspection',name+'.png'));
// Lossless difference statistics do not measure artistic quality or prove physical accuracy.
const ff=spawnSync('ffmpeg',['-hide_banner','-i',join(dir,'optics-on.png'),'-i',join(dir,'optics-off.png'),'-lavfi','ssim','-f','null','-'],{encoding:'utf8'});
const stat=ff.stderr.match(/SSIM Y:[^\n]+|SSIM R:[^\n]+/g);writeFileSync('paper/inspection/optics-difference.txt',(stat||['No SSIM output']).join('\n')+'\n');
console.log('Integrated actual pulse phases, population snapshots and optical comparison.');
