import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
import {installOceanCompletionProbe} from './ocean-completion-probe.mjs';
const[base,label,sha]=process.argv.slice(2);
const stats=a=>{const s=[...a].sort((a,b)=>a-b);return{median:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],max:s.at(-1),over50:s.filter(x=>x>50).length,n:s.length};};
for(const name of['normal','sanctuary','post-idle']){
 const b=await browserSession(`../m6-6-1-evidence/performance/${label}-${name}`);
 try{
  const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  // Same existing async completion hook; retain first completion latency after
  // the actual dismiss key as well as subsequent complete frame intervals.
  const probe=installOceanCompletionProbe.toString().replace('const now = performance.now();','const now = performance.now(); if(window.__RESUME_MARK__&&!window.__RESUME_FIRST__)window.__RESUME_FIRST__=now-window.__RESUME_MARK__;');
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`(${probe})();let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};`});
  await b.navigate(`${base}?renderer=webgl&idle=300`);await sleep(6000);await b.ev(`__CAMERA_LAB__.select('${name==='normal'?'B':'D'}');__CAMERA_LAB__.seek(${name==='normal'?.18:1})`);await sleep(5000);
  const env=()=>b.ev('({renderer:__SPECIMEN__.rendererInfo(),ratio:__JELLYFISH_WORLD__.pixelRatio,viewport:[innerWidth,innerHeight],buffers:[...document.querySelectorAll("canvas")].map(c=>[c.width,c.height]),camera:__JELLYFISH_WORLD__.getCameraState(),time:__SPECIMEN__.state().time,bloom:"approved direct rendering, bloom off",quality:"unchanged adaptive policy",render:__SANCTUARY_REVIEW__.renderStats()})');
  let beforeIdle;
  if(name==='post-idle'){
   beforeIdle=await env();await b.ev("document.activeElement.blur();history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'))");
   let idle=false;for(let i=0;i<80;i++){idle=await b.ev("!!document.querySelector('.idle-screen.is-active')");if(idle)break;await sleep(100);}assert.ok(idle);await sleep(3200);
   await b.ev("history.replaceState(null,'','?renderer=webgl&idle=300');window.addEventListener('keydown',()=>{window.__RESUME_MARK__=performance.now()},{once:true,capture:true});__AUDIT_RENDER__.reset();__SANCTUARY_REVIEW__.resetCost()");
  }else await b.ev('__AUDIT_RENDER__.reset();__SANCTUARY_REVIEW__.resetCost()');
  const before=await env();if(name==='post-idle')await b.key('Enter');
  await sleep(30000);
  const data=await b.ev('({completion:__AUDIT_RENDER__.read(),cpu:__SANCTUARY_REVIEW__.cost(),firstCompletionAfterDismiss:window.__RESUME_FIRST__||null})'),after=await env();
  const result={name,label,sha,browser:await b.send('Browser.getVersion'),beforeIdle,before,after,seconds:30,warmupSeconds:11,frame:stats(data.completion.intervals),cpu:stats(data.cpu),...data,errors:b.errors};
  b.save('performance',result);assert.equal(b.errors.length,0);assert.equal(before.ratio,after.ratio);assert.equal(after.ratio,1);assert.match(after.renderer.gpu,/NVIDIA.*4070/);console.log(JSON.stringify({name,label,frame:result.frame,firstCompletionAfterDismiss:data.firstCompletionAfterDismiss}));
 }finally{await b.close()}
}
