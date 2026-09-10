import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
import {installOceanCompletionProbe} from './ocean-completion-probe.mjs';
const[base,label,sha]=process.argv.slice(2);
const stats=a=>{const s=[...a].sort((a,b)=>a-b);return{median:s[Math.floor(s.length*.5)]??null,p95:s[Math.floor(s.length*.95)]??null,max:s.at(-1)??null,over50:s.filter(x=>x>50).length,n:s.length}};
const scenes=[['normal-opening','B',.18,false],['normal-school','B',.5,false],['normal-sanctuary','D',1,false],['idle-opening','B',.18,true],['idle-school','B',.5,true],['idle-bubbles','B',.36,true],['idle-sanctuary','D',1,true],['idle-explore','D',1,true],['idle-pointer','D',1,true]];
for(const[name,mode,p,idle]of scenes){
 const b=await browserSession('../m7-evidence/performance/'+label+'-'+name);
 try{
  const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`(${installOceanCompletionProbe.toString()})();let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};window.__CONTEXTS__=[];const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){const r=get.call(this,type,...args);if(r&&/webgl|webgpu/.test(type)&&!__CONTEXTS__.includes(r))__CONTEXTS__.push(r);return r};`});
  await b.navigate(`${base}?renderer=webgl&idle=300`);await sleep(6000);await b.ev(`__CAMERA_LAB__.select('${mode}');__CAMERA_LAB__.seek(${p})`);await sleep(5000);
  if(name==='idle-explore')await b.ev(`__CAMERA_LAB__.select('explore')`);
  if(idle){await b.ev(`document.activeElement.blur();history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(10000);}
  const environment=()=>b.ev(`({camera:__JELLYFISH_WORLD__.getCameraState(),renderer:__SPECIMEN__.rendererInfo(),ratio:__JELLYFISH_WORLD__.pixelRatio,viewport:[innerWidth,innerHeight],contexts:__CONTEXTS__.length,bloom:'approved direct / off',quality:'unchanged adaptive',idle:window.__OCEAN_IDLE__?.state()||window.__PELAGIC_GEL__?.getState(),render:__SANCTUARY_REVIEW__.renderStats(),optics:__BUBBLE_PASSAGE__.state()})`);
  const before=await environment();await b.ev(`__AUDIT_RENDER__.reset();window.__OCEAN_IDLE__?.resetCost()`);
  if(name==='idle-pointer'){for(let i=0;i<300;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:640+Math.sin(i*.065)*260,y:450+Math.cos(i*.043)*90});await sleep(100);}}
  else await sleep(30000);
  const raw=await b.ev(`({frames:__AUDIT_RENDER__.read(),cpu:window.__OCEAN_IDLE__?.cost()||[]})`),after=await environment();
  const result={name,label,sha,browser:await b.send('Browser.getVersion'),warmupSeconds:11+(idle?10:0),measurementSeconds:30,before,after,frame:stats(raw.frames.intervals),cpu:stats(raw.cpu),raw,errors:b.errors};
  b.save('result',result);assert.equal(b.errors.length,0);assert.ok(raw.frames.intervals.length>500,'No useful completion trace');assert.equal(after.ratio,1);assert.equal(before.ratio,after.ratio);assert.deepEqual(after.renderer.drawBuffer,[1280,900]);assert.match(after.renderer.gpu,/NVIDIA.*4070/);console.log(JSON.stringify({name,label,frame:result.frame,cpu:result.cpu}));
 }finally{await b.close()}
}
