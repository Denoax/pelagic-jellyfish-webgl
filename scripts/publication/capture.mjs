import {resolve,join} from 'node:path';
import {mkdirSync,copyFileSync} from 'node:fs';
import {browser,wait,runtimeSha,json,setView,enterIdle,exitIdle} from './browser.mjs';
const [base,outArg,filter='scout']=process.argv.slice(2);
if(!base||!outArg)throw Error('Usage: node scripts/publication/capture.mjs BASE_URL OUTPUT_DIRECTORY [scout|S1,...]');
const out=resolve(outArg);mkdirSync(out,{recursive:true});
const b=await browser(out);const manifest=[];
try{
 if(filter==='scout'){
  await b.navigate(base+'?renderer=webgl&idle=300');await b.until('window.__OCEAN_IDLE__?.state().ready');
  for(const [mode,p]of [['A',.16],['B',.18],['C',.18],['B',.35],['B',.55],['D',1]]){
   await setView(b,mode,p);await wait(2200);await b.shot(join(out,`${mode}-${p}.png`));json(join(out,`${mode}-${p}.json`),await b.state());
  }
 }else for(const id of filter.split(',')){
  const specimen=['S1','S2'].includes(id);const mode=id==='S7'?'D':'B',p=id==='S7'?1:id==='S4'?.5:id==='S5'?.35:.18;
  await b.navigate(base+(specimen?'?renderer=webgl&specimen=1&animal=candidate&idle=300':'?renderer=webgl&idle=300'));
  if(!specimen){await b.until('window.__OCEAN_IDLE__?.state().ready');await setView(b,mode,p);}
  await wait(4000);
  const path=join(out,id);mkdirSync(path,{recursive:true});
  if(['S9','S10','S11','S12'].includes(id))await b.ev(`__OCEAN_IDLE__.minute('2026-09-11T14:29:00')`);
  if(['S10','S11','S12'].includes(id)){await enterIdle(b);await wait(5500);}
  const before=await b.state();await b.shot(join(path,'poster.png'));await b.record(path);
  if(id==='S1'){await wait(8000);await b.ev(`__SPECIMEN__.view('side','medium')`);await wait(8000);}
  if(id==='S2'){await b.ev(`__SPECIMEN__.view('oblique','near')`);await wait(8000);await b.ev(`__SPECIMEN__.view('underside','medium')`);await wait(8000);}
  if(id==='S3'){
   await wait(3000);const point=await b.ev(`(()=>{const a=__POPULATION__.state().animals.filter(a=>a.clickable).sort((a,b)=>b.pixels-a.pixels);return a.length?__JELLYFISH_WORLD__.getJellyScreenPoint(a[0].id):null})()`);
   if(!point)throw Error('No visible activation subject');
   for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:'left',clickCount:1});await wait(11000);
  }
  if(id==='S4'){for(let i=0;i<160;i++){await b.ev('__CAMERA_LAB__.input(20)');await wait(100);}}
  if(id==='S5'){await wait(18000);}
  if(id==='S6'){for(const m of ['A','B','C','D','explore']){await b.ev(`__CAMERA_LAB__.select('${m}')`);await wait(4000);}}
  if(id==='S7'){await wait(14000);}
  if(['S8','S9'].includes(id)){await wait(1500);await enterIdle(b);await wait(8500);}
  if(id==='S10'){for(let i=0;i<45;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:260+i*17,y:440+Math.sin(i*.12)*65});await wait(50);}await wait(11000);}
  if(id==='S11'){await wait(1500);await b.ev(`__OCEAN_IDLE__.minute('2026-09-11T14:30:00')`);await wait(7500);}
  if(id==='S12'){await wait(1500);await exitIdle(b);await wait(5000);}
  const capture=await b.finish();const after=await b.state();await b.shot(join(path,'after.png'));
  const metadata={id,runtimeSha,renderer:'Three.js WebGPURenderer r175',backend:before.renderer.backend,gpu:before.renderer.gpu,browser:await b.version(),viewport:before.viewport,drawingBuffer:{width:before.renderer.drawBuffer[0],height:before.renderer.drawBuffer[1]},dpr:before.dpr,viewMode:before.camera?.mode||'specimen',journeyProgress:before.camera?.progress??null,seed:7183,simulationTime:before.simulation.time,captureDate:new Date().toISOString(),captureScript:'scripts/publication/capture.mjs',bloom:'off',quality:'approved, no reduction',...capture,before,after,errors:b.errors,notes:'Actual browser screencast; measured timestamps retained. CFR encoding may repeat frames. Not performance evidence.'};
  json(join(path,'metadata.json'),metadata);manifest.push(metadata);json(join(out,'capture-manifest.json'),manifest);console.log(id,JSON.stringify(capture));
 }
}finally{await b.close();}
