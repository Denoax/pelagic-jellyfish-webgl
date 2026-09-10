import {browserSession,sleep} from './view-r2-browser.mjs';
const[base='http://127.0.0.1:5207/',label='after',only='']=process.argv.slice(2);
for(const mode of ['descent','stationary','orbit','ravine','life','illumination']){
 if(only&&only!==mode)continue;
 const b=await browserSession(`../m6-4-evidence/motion/${label}-${mode}`);
 try{
  const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
  await b.navigate(`${base}?renderer=webgl&idle=300&hold=14`);
  await b.ev(`window.__CAMERA_LAB__.select('${mode==='illumination'?'C':'D'}');window.__CAMERA_LAB__.seek(${mode==='descent'?0:1})`);await sleep(15500);
  await b.ev('window.__SPECIMEN__.resume()');
  if(['orbit','ravine','life'].includes(mode))await b.ev(`(()=>{const c=window.__CAMERA_LAB__;c.select('explore');const start=performance.now();function tick(t){const u=Math.min(1,(t-start)/20000);${mode==='orbit'?`const a=.7+u*.95;c.camera.position.set(-2.4+Math.sin(a)*25,-4,-24+Math.cos(a)*25);c.camera.lookAt(-2.4,-9,-24);`:mode==='ravine'?`c.camera.position.set(4+Math.sin(u*2)*1.2,-11.6,-13-u*21);c.camera.lookAt(2.8,-15,-22-u*18);`:`c.camera.position.set(1+u*13,-11+u*7,-15+u*7);c.camera.lookAt(-.3-u*2.1,-15+u*6,-22.6-u*4.4);`}c.camera.updateMatrixWorld();requestAnimationFrame(tick)}requestAnimationFrame(tick)})()`);
  if(mode==='descent')await b.ev(`(()=>{const start=performance.now();function tick(t){window.__CAMERA_LAB__.seek(Math.min(1,(t-start)/40000));if(t-start<40000)requestAnimationFrame(tick)}requestAnimationFrame(tick)})()`);
  await b.send('Emulation.setVisibleSize',{width:1280,height:900});await b.record();await sleep(mode==='descent'?45000:22000);await b.shot('end');await b.finish();
  b.save('state',await b.ev('({renderer:window.__SPECIMEN__.rendererInfo(),camera:window.__JELLYFISH_WORLD__.getCameraState(),sanctuary:window.__SANCTUARY_REVIEW__.state()})'));
  if(b.errors.length)throw Error(JSON.stringify(b.errors));console.log(label+' '+mode);
 }finally{await b.close()}
}
