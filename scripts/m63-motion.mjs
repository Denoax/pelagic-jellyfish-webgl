import {browserSession,sleep} from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5205/',label='after',only='']=process.argv.slice(2);
for(const mode of ['stationary','orbit','descent']){
 if(only&&mode!==only)continue;
 const b=await browserSession(`../m6-3-evidence/motion/${label}-${mode}`);
 try{
  const {windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
  await b.navigate(`${base}?renderer=webgl&idle=300&hold=14`);
  await b.ev(`window.__CAMERA_LAB__.select('B');window.__CAMERA_LAB__.seek(${mode==='descent'?0:1})`);await sleep(15500);
  await b.record();await b.ev('window.__SPECIMEN__.resume()');
  if(mode==='orbit')await b.ev(`(()=>{const c=window.__CAMERA_LAB__;c.select('explore');const start=performance.now();function tick(t){const a=.7+(t-start)*.000035;c.camera.position.set(-2.4+Math.sin(a)*25,-4,-24+Math.cos(a)*25);c.camera.lookAt(-2.4,-9,-24);c.camera.updateMatrixWorld();requestAnimationFrame(tick)}requestAnimationFrame(tick)})()`);
  await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  if(mode==='descent')await b.ev(`(()=>{const start=performance.now();function tick(t){window.__CAMERA_LAB__.seek(Math.min(1,(t-start)/40000));if(t-start<40000)requestAnimationFrame(tick)}requestAnimationFrame(tick)})()`);
  await sleep(mode==='descent'?45000:20000);await b.shot('end');
  b.save('state',await b.ev('({renderer:window.__SPECIMEN__.rendererInfo(),camera:window.__JELLYFISH_WORLD__.getCameraState(),sanctuary:window.__SANCTUARY_REVIEW__.state()})'));
  await b.finish();if(b.errors.length)throw Error('Browser errors in '+mode);console.log(label+' '+mode+' recorded');
 }finally{await b.close()}
}
