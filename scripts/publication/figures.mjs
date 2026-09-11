// Original explanatory diagrams and exact-function plots; not runtime evidence.
import {mkdirSync,writeFileSync,readFileSync,existsSync,copyFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {mantlePoint,membraneSection} from '../../src/scene/anatomy/mantle.js';
import {sampleSwimCycle} from '../../src/scene/jellyMotion.js';
const out=resolve('paper/figures');mkdirSync(out,{recursive:true});
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;');
const text=(x,y,s,size=20,color='#24383f')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${color}">${esc(s)}</text>`;
const line=(x,y,X,Y,color='#71858c',extra='')=>`<path d="M${x} ${y}L${X} ${Y}" stroke="${color}" stroke-width="2" fill="none" ${extra}/>`;
const path=(points,color,width=3)=>`<polyline points="${points.map(p=>p.join(',')).join(' ')}" stroke="${color}" stroke-width="${width}" fill="none"/>`;
const box=(x,y,w,h,title,sub)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="#f0f6f6" stroke="#9bb1b8"/>${text(x+18,y+32,title,22)}${text(x+18,y+61,sub,15,'#577078')}`;
function save(id,title,body,height=580){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="${height}" viewBox="0 0 1200 ${height}"><rect width="1200" height="${height}" fill="#fff"/><g font-family="DejaVu Sans,sans-serif">${text(45,48,title,26)}${body}${text(45,height-22,'PELAGIC · source-derived diagram · approved M7 bce3571',13,'#687f86')}</g></svg>`;
 writeFileSync(join(out,id+'.svg'),svg);const r=spawnSync('rsvg-convert',[join(out,id+'.svg'),'-o',join(out,id+'.png')]);if(r.status)throw Error('SVG rasterization failed');
}
save('F02-system','One world, separate responsibilities',[
 box(40,105,330,90,'Input and camera','bounded scalar → baked pose'),box(435,105,330,90,'Animal state','pulse → pose → persistent tissue'),box(830,105,330,90,'Connected environment','currents · wake · sanctuary'),
 line(370,150,435,150),line(765,150,830,150),box(435,260,330,90,'Ocean scene','one renderer / graphics context'),line(600,195,600,260),line(990,195,740,260),line(205,195,455,260),
 box(40,425,330,80,'Small persistent field','velocity + displacement'),box(435,425,330,80,'Shared optical output','bubbles · shimmer · idle'),box(830,425,330,80,'Visible frame','linear source → display output'),line(600,350,600,425),line(370,465,435,465),line(765,465,830,465)
].join(''));
let anatomy='';
for(const p of [0,.55,1]){const a=[];for(let i=0;i<=160;i++){const t=i/160*1.12;const o={};mantlePoint(t,0,{radius:1-p*.19,height:.72*(1+p*.22),pulse:p,rimY:.025+p*.085,marginRoll:0},8,{x:0,y:0},o);a.push([300+o.x*180,290-o.y*180]);}anatomy+=path(a,p===0?'#087e91':p===1?'#815ba8':'#8bacb5');}
anatomy+=text(80,380,'Side profile: same mantle contract',21)+text(80,415,'rest → partial → contracted',17);
for(const t of [.2,.5,.8]){const a=[];for(let j=0;j<=120;j++){const o={};membraneSection(t,-1+j/60,0,0,o);a.push([875+o.width*470,255+t*100-o.fold*470]);}anatomy+=path(a,t===.5?'#815ba8':'#087e91');}
anatomy+=text(695,380,'Folded transverse membrane sections',21)+text(695,415,'t = 0.2, 0.5, 0.8; phase held at zero',17);
save('F03-anatomy','Continuous mantle and folded membrane',anatomy);
let pulse=line(100,440,1100,440)+line(100,440,100,100);
for(let i=0;i<=5;i++){const x=100+i*200;pulse+=line(x,440,x,448)+text(x-12,476,(i/5).toFixed(1),17);}
for(const [key,color,label,y]of [['bell','#087e91','Bell contraction',105],['primaryThrust','#bc5874','Primary thrust',137],['secondaryThrust','#7e69b2','Secondary thrust',169]]){
 pulse+=path(Array.from({length:301},(_,i)=>[100+i/300*1000,440-sampleSwimCycle(i/300)[key]*310]),color)+text(730,y,label,18,color);
}
pulse+=text(470,518,'Normalized cycle phase',19);save('F04-pulse','Unequal contraction, refill and coast',pulse);
let chain='';const pts=Array.from({length:9},(_,i)=>[140+i*45,170+i*17+20*Math.sin(i*.6)]);
chain+=path(pts,'#087e91',3)+path(pts.map(([x,y],i)=>[x-18-i*2,y+24]),'#adb9bd',2);
for(const[x,y]of pts)chain+=`<circle cx="${x}" cy="${y}" r="7" fill="#087e91"/>`;
chain+=text(65,365,'Current points',20,'#087e91')+text(65,400,'Previous points: transported equally',20,'#687f86')+box(660,125,450,90,'Prediction','damped history + bounded increments')+box(660,245,450,90,'Projection','root attachment + length correction')+box(660,365,450,90,'Reconstruction','same spine → folded sheet / tube')+line(885,215,885,245)+line(885,335,885,365);
save('F05-appendages','History belongs to the appendage, not the frame',chain);
let lod='';for(const[y,title,sub]of [[125,'FAR','below medium retention; sparse strands'],[260,'MEDIUM','promote at 32 px; retain at 24 px'],[395,'NEAR','promote at 110 px; retain at 90 px']])lod+=box(85,y,620,85,title,sub);
lod+=line(395,210,395,260)+line(395,345,395,395)+text(770,175,'CSS bell diameter',23)+text(770,230,'1.2 s per adjacent tier',19)+text(770,285,'Persistent simulation',19)+text(770,340,'Geometric morph',19)+text(770,395,'No duplicate animal draw',19);
save('F06-lod','Importance with hysteresis and persistent state',lod);
save('F07-compositor','Clean source is shared, never recursively overwritten',[
 box(40,140,300,90,'Real ocean','rendered once'),box(405,140,345,90,'Live RGBA16F color','depth attachment ≠ transparent depth'),box(820,140,340,90,'Output','one screen-sized composition'),line(340,185,405,185),line(750,185,820,185),
 box(40,340,300,90,'Field target A','RG velocity / BA displacement'),box(405,340,345,90,'Field target B','256 × 180 at 1280 × 900'),line(340,370,405,370),line(405,410,340,410),line(750,385,970,230),text(60,495,'Field targets store deformation only. All refractive lookups read the clean ocean color.',20)
].join(''));
let ray=`<ellipse cx="570" cy="270" rx="120" ry="175" fill="#e5f5f7" stroke="#78a8b4" stroke-width="2"/>`+line(100,240,460,210,'#087e91')+line(460,210,665,340,'#087e91')+line(665,340,1070,380,'#087e91')+line(1070,110,1070,440,'#9ba8ae')+line(100,240,1070,160,'#a6b0b6','stroke-dasharray="8 8"');
ray+=text(80,300,'Camera ray',20)+text(380,150,'Entry',18)+text(655,400,'Exit',18)+text(850,490,'Bounded image plane / lookup',19)+text(75,520,'Schematic only: normals and directions are transformed in metric view space.',18);
save('F08-refraction','Analytic interfaces, approximate scene information',ray);
const result='paper/results/benchmark.json';
if(existsSync(result)){
 const rows=JSON.parse(readFileSync(result)).results;let body='';rows.forEach((r,i)=>{const y=105+i*54;body+=text(45,y+20,r.name,18)+`<rect x="255" y="${y}" width="${r.frame.median*19}" height="16" fill="#087e91"/><rect x="255" y="${y+19}" width="${r.frame.p95*19}" height="12" fill="#8f79ad"/>`+text(900,y+22,`${r.frame.median.toFixed(1)} / ${r.frame.p95.toFixed(1)} ms`,17);});body+=text(255,520,'cyan: median  ·  violet: p95  ·  frame intervals, not GPU timings',18);save('F12-performance','Fresh approved-runtime frame intervals',body,590);
}
