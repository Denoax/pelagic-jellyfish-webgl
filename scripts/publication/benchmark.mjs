import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {browser,wait,runtimeSha,json,setView,enterIdle,exitIdle} from './browser.mjs';
import {installOceanCompletionProbe} from '../ocean-completion-probe.mjs';
const [base,outArg]=process.argv.slice(2);if(!base||!outArg)throw Error('Usage: benchmark.mjs BASE_URL OUTPUT_DIRECTORY');
const out=resolve(outArg);mkdirSync(out,{recursive:true});
const stats=a=>{assert(a.length>100,'Insufficient completed frames');const s=[...a].sort((a,b)=>a-b);return{n:s.length,median:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],maximum:s.at(-1),over50:s.filter(n=>n>50).length};};
const b=await browser(join(out,'browser'));const results=[];
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`(${installOceanCompletionProbe.toString()})();`});
 for(const [name,mode,progress,kind]of [['opening','B',0,'normal'],['midwater','B',.5,'normal'],['bubble passage','B',.35,'bubble'],['sanctuary','D',1,'normal'],['Explore','D',1,'explore'],['settled M7','B',.18,'idle'],['M7 manipulation','B',.18,'pointer']]){
  await b.navigate(base+'?renderer=webgl&idle=300');await b.until('window.__OCEAN_IDLE__?.state().ready');await wait(11000);
  await setView(b,mode,progress);await wait(kind==='bubble'?1500:5000);
  if(kind==='explore')await b.ev(`__CAMERA_LAB__.select('explore')`);
  if(['idle','pointer'].includes(kind)){await b.ev(`__OCEAN_IDLE__.minute('2026-09-11T14:29:00')`);await enterIdle(b);await wait(7000);}
  const before=await b.state();
  await b.ev('__AUDIT_RENDER__.reset();__POPULATION__.resetCost();__CONNECTED_OCEAN__.resetCost();__OCEAN_IDLE__.resetCost()');
  const start=Date.now();
  if(kind==='pointer')while(Date.now()-start<30000){const t=(Date.now()-start)/1000;await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:640+Math.sin(t*.85)*320,y:450+Math.sin(t*.57)*85});await wait(100);}
  else await wait(30000);
  const raw=await b.ev('({completion:__AUDIT_RENDER__.read(),animal:__POPULATION__.cost(),connected:__CONNECTED_OCEAN__.cost(),idle:__OCEAN_IDLE__.cost()})');
  const after=await b.state();assert.equal(after.dpr,1);assert.deepEqual(after.renderer.drawBuffer,[1280,900]);assert.match(after.renderer.gpu,/NVIDIA.*4070/);assert.equal(raw.completion.matched,1);assert.equal(b.errors.length,0);
  results.push({name,kind,mode,progress,measurementSeconds:(Date.now()-start)/1000,warmupSeconds:11,sceneWarmupSeconds:kind==='bubble'?1.5:5,idleWarmupSeconds:['idle','pointer'].includes(kind)?7:0,before,after,frame:stats(raw.completion.intervals),raw});
  json(join(out,'benchmark.json'),{runtimeSha,publicationToolSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),browser:await b.version(),backend:'NVIDIA WebGL2',hardware:process.env.PELAGIC_HARDWARE||'Record host hardware separately',capture:false,quality:'approved DPR 1; production bloom off; existing DEV fixture disables adaptive downshift',probe:'async-render-completion-v2',durationPolicy:'30 seconds per scene; bubble window may finish naturally within measurement',results});
  console.log(name,JSON.stringify(results.at(-1).frame));
 }
}finally{await b.close();}
const table='**Table 3. Fresh approved-runtime frame intervals (milliseconds).**\n\n| Scenario | Median | p95 | Maximum | >50 ms | Frames |\n| --- | ---: | ---: | ---: | ---: | ---: |\n'+results.map(r=>`| ${r.name} | ${r.frame.median.toFixed(2)} | ${r.frame.p95.toFixed(2)} | ${r.frame.maximum.toFixed(2)} | ${r.frame.over50} | ${r.frame.n} |`).join('\n')+'\n\nActual NVIDIA WebGL2; 1280×900 viewport and drawing buffer; DPR 1; bloom off. Eleven-second initial warm-up plus scene/idle warm-up; 30-second measurement per case. Existing development hooks select the approved runtime states. These are render-completion intervals, not GPU timings. Single-run observations, not confidence intervals. Bubble passage includes its natural decay. No capture or video encoding during timing.\n';
writeFileSync(join(out,'table.md'),table);
