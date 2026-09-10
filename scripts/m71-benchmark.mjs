import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
import {installOceanCompletionProbe} from './ocean-completion-probe.mjs';
const [base,label,sha,filter='']=process.argv.slice(2);
const stats=a=>{const s=[...a].sort((a,b)=>a-b);return{median:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],max:s.at(-1),over50:s.filter(x=>x>50).length,n:s.length}};
const b=await browserSession(`../m7-1-evidence/performance/${label}`),results=[];
try{
 const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`(${installOceanCompletionProbe.toString()})();let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};`});
 await b.navigate(`${base}?renderer=webgl&idle=300`);await sleep(11000);
 const enter=async()=>{await b.ev(`document.activeElement.blur();history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);while(!(await b.ev('__OCEAN_IDLE__.state().active')))await sleep(10)};
 const exit=async()=>{await b.ev(`history.replaceState(null,'','?idle=300')`);await b.key('Enter');await sleep(1200)};
 const environment=()=>b.ev(`({renderer:__SPECIMEN__.rendererInfo(),camera:__JELLYFISH_WORLD__.getCameraState(),ratio:__JELLYFISH_WORLD__.pixelRatio,viewport:[innerWidth,innerHeight],bloom:'approved direct / off',quality:'unchanged adaptive',idle:__OCEAN_IDLE__.state(),render:__SANCTUARY_REVIEW__.renderStats()})`);
 for(const[name,mode,p,kind]of[['normal','B',.18,'normal'],['entry-opening','B',.18,'entry'],['entry-school','B',.5,'entry'],['entry-sanctuary','D',1,'entry'],['settled','D',1,'settled'],['pointer','D',1,'pointer'],['minute','D',1,'minute'],['exit','D',1,'exit']]){
  if(filter&&!filter.split(',').includes(name))continue;
  await exit();await b.ev(`__CAMERA_LAB__.select('${mode}');__CAMERA_LAB__.seek(${p});__OCEAN_IDLE__.minute('2026-09-10T14:29:00')`);await sleep(5000);
  if(!['normal','entry'].includes(kind)){await enter();await sleep(9000)}
  const before=await environment(),frames=[],cpu=[];
  const sample=async(fn)=>{await b.ev('__AUDIT_RENDER__.reset();__OCEAN_IDLE__.resetCost()');await fn();const raw=await b.ev('({f:__AUDIT_RENDER__.read().intervals,c:__OCEAN_IDLE__.cost()})');frames.push(...raw.f);cpu.push(...raw.c)};
  if(kind==='entry')for(let i=0;i<5;i++){await enter();await sample(()=>sleep(6000));await exit()}
  else if(kind==='minute')for(let i=0;i<10;i++){await sample(async()=>{await b.ev(`__OCEAN_IDLE__.minute('2026-09-10T14:${i%2?'29':'30'}:00')`);await sleep(3000)})}
  else if(kind==='exit')for(let i=0;i<10;i++){if(i){await enter();await sleep(8000)}await sample(exit)}
  else if(kind==='pointer')await sample(async()=>{for(let i=0;i<300;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:640+Math.sin(i*.065)*260,y:450+Math.cos(i*.043)*90});await sleep(100)}});
  else await sample(()=>sleep(30000));
  const after=await environment();assert.equal(after.ratio,1);assert.deepEqual(after.renderer.drawBuffer,[1280,900]);assert.match(after.renderer.gpu,/NVIDIA.*4070/);assert.equal(b.errors.length,0);
  const r={name,label,sha,before,after,frame:stats(frames),controllerCPU:stats(cpu),raw:{frames,cpu}};results.push(r);b.save('results',results);console.log(JSON.stringify({name,label,frame:r.frame,cpu:r.controllerCPU}));
 }
 b.save('environment',{browser:await b.send('Browser.getVersion'),errors:b.errors,warmupSeconds:11,sceneWarmup:5,settledWarmup:9,notes:'Frame completion intervals, NOT GPU timing. Entry:5x6s; minute:10x3s; exit:10x1.2s; others30s (pointer includes CDP latency). No capture.'});
}finally{await b.close()}
