import {browserSession,sleep} from './view-r2-browser.mjs';
import {existsSync} from 'node:fs';
if(existsSync('/tmp/asset2-stop-capture'))process.exit(75);
const [mode,base='http://127.0.0.1:5222/',label='final']=process.argv.slice(2),portrait=mode==='H',width=portrait?390:1672,height=portrait?844:941;
if(!'ABCDEFGH'.includes(mode)||mode.length!==1)throw Error('Choose evidence clip A–H');
const b=await browserSession(`../asset2-evidence/${label}/motion-${mode}`,width,height);
const state=()=>b.ev('({camera:__JELLYFISH_WORLD__.getCameraState(),renderer:__SPECIMEN__.rendererInfo(),environment:window.__ASSET2__?.state(),idle:__OCEAN_IDLE__.state(),phase:__SPECIMEN__.state()})');
try{
 await b.send('Emulation.setVisibleSize',{width,height});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate(`${base}?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=B&hold=8`);
 await b.ev(`__CAMERA_LAB__.seek(${'AFH'.includes(mode)?.55:mode==='B'?.28:1})`);
 for(let n=0;n<400;n++){if(await b.ev('__SPECIMEN__.state().time>=8'))break;await sleep(100);}
 if(['C','D','E'].includes(mode))await b.ev(`__CAMERA_LAB__.select('explore');__CAMERA_LAB__.camera.position.set(7,-11,-15);__CAMERA_LAB__.camera.lookAt(2,-14,-28);__CAMERA_LAB__.camera.updateMatrixWorld()`);
 if(mode==='C')await b.ev('__CAMERA_LAB__.camera.position.set(8,-6,-9);__CAMERA_LAB__.camera.lookAt(-3,-13,-24);__CAMERA_LAB__.camera.updateMatrixWorld()');
 await b.shot('start');b.save('start',await state());await b.ev('__SPECIMEN__.resume()');await b.record();
 if(mode==='B'||mode==='G')await b.ev(`(()=>{const start=performance.now();function step(t){const u=Math.min(1,(t-start)/26000);__CAMERA_LAB__.request(${mode==='B'?'.28+u*.72':'1-u*.9'});if(u<1)requestAnimationFrame(step)}requestAnimationFrame(step)})()`);
 if(mode==='D')await b.ev(`(()=>{const start=performance.now();function step(t){const u=Math.min(1,(t-start)/30000),a=u*4.7,c=__CAMERA_LAB__.camera;c.position.set(Math.cos(a)*14,-8+Math.sin(u*Math.PI)*3,-32+Math.sin(a)*14);c.lookAt(0,-8,-38);c.updateMatrixWorld();if(u<1)requestAnimationFrame(step)}requestAnimationFrame(step)})()`);
 if(mode==='E')await b.ev(`(()=>{const start=performance.now();function step(t){const u=Math.min(1,(t-start)/30000),c=__CAMERA_LAB__.camera;c.position.set(7+313*u,-9,-20-8*u);c.lookAt(-2,-11,-28);c.updateMatrixWorld();if(u<1)requestAnimationFrame(step)}requestAnimationFrame(step)})()`);
 if(mode==='F'){
  await sleep(3000);await b.ev("history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'))");
  await sleep(13000);await b.shot('settled');b.save('settled',await state());
  await b.ev("history.replaceState(null,'','?renderer=webgl&idle=300')");await b.key('Escape');await sleep(14000);
 }else{
  for(let i=0;i<6;i++){await sleep(5000);await b.shot(`step-${i+1}`);b.save(`step-${i+1}`,await state());}
 }
 await b.finish();await b.shot('end');b.save('end',await state());b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));console.log(`clip ${mode} complete`);
}finally{await b.close();}
