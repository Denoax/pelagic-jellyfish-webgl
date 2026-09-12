import {browserSession,sleep} from './view-r2-browser.mjs';
import {installOceanCompletionProbe} from './ocean-completion-probe.mjs';
import {execFileSync} from 'node:child_process';
const [base,label,sha,only='']=process.argv.slice(2);
const scenes=['qa-pose','journey','sanctuary','explore-near','explore-abyss','idle'];
const summary=a=>{const s=[...a].sort((a,b)=>a-b);return{count:s.length,median:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],max:s.at(-1),over50:s.filter(x=>x>50).length};};
for(const name of scenes){
 if(only&&only!==name)continue;
 const b=await browserSession(`../asset2-evidence/performance/${label}/${name}`,1280,900);
 try{
  await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`(${installOceanCompletionProbe.toString()})();let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};`});
  await b.navigate(`${base}?renderer=webgl&idle=${name==='idle'?2:300}&qaDebug&asset2qa=1&direction=B`);
  await b.ev(`window.__CAMERA_LAB__.seek(${name==='journey'?.28:name==='qa-pose'?.55:1})`);
  await sleep(8000);
  if(name.startsWith('explore'))await b.ev(`(()=>{const v=window.__CAMERA_LAB__;v.select('explore');v.camera.position.set(${name==='explore-near'?'7,-11,-15':'240,-11,-28'});v.camera.lookAt(${name==='explore-near'?'2,-15,-28':'280,-11,-50'});v.camera.updateMatrixWorld()})()`);
  if(name==='sanctuary')await b.ev(`window.__CAMERA_LAB__.select('D')`);
  if(name==='idle')await sleep(16000);
  await sleep(4000);
  const before=await b.ev('({renderer:window.__SPECIMEN__.rendererInfo(),camera:window.__JELLYFISH_WORLD__.getCameraState(),idle:window.__OCEAN_IDLE__?.state(),population:window.__POPULATION__.state(),environment:window.__ASSET2__?.state(),userAgent:navigator.userAgent,ratio:window.__JELLYFISH_WORLD__.pixelRatio})');
  if(before.renderer.drawBuffer.join()!=='1280,900'||!before.renderer.gpu.includes('NVIDIA'))throw Error('Invalid equal-quality NVIDIA baseline');
  await b.ev(`window.__AUDIT_RENDER__.reset();window.__SANCTUARY_REVIEW__.resetCost();window.__CONNECTED_OCEAN__.resetCost();window.__ASSET2__?.resetCost?.();`);
  if(name==='journey')await b.ev(`(()=>{const start=performance.now();function traverse(t){window.__CAMERA_LAB__.request(.28+Math.min(1,(t-start)/30000)*.7);if(t-start<30000)requestAnimationFrame(traverse)}requestAnimationFrame(traverse)})()`);
  await sleep(30000);
  const record=await b.ev('({probe:window.__AUDIT_RENDER__.read(),sanctuaryCost:window.__SANCTUARY_REVIEW__.cost(),environmentCost:window.__ASSET2__?.cost?.(),renderStats:window.__SANCTUARY_REVIEW__.renderStats(),camera:window.__JELLYFISH_WORLD__.getCameraState(),population:window.__POPULATION__.state(),idle:window.__OCEAN_IDLE__?.state(),renderer:window.__SPECIMEN__.rendererInfo(),visibility:document.visibilityState})');
  b.save('performance',{sourceSHA:sha,driverSHA:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),scene:name,duration:30,warmup:name==='idle'?28:12,settings:{viewport:[1280,900],DPR:1,bloom:'off; approved direct path',adaptive:'disabled by existing DEV specimen facility'},before,...record,summary:summary(record.probe.intervals),errors:b.errors});
  if(b.errors.length||record.visibility!=='visible'||record.probe.intervals.length<100)throw Error('Invalid performance run');
  console.log(label,name,JSON.stringify(summary(record.probe.intervals)));
 }finally{await b.close();}
}
