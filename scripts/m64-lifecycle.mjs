import {browserSession,sleep} from './view-r2-browser.mjs';
const[base='http://127.0.0.1:5207/',label='candidate',mode='tab']=process.argv.slice(2);
const b=await browserSession(`../m6-4-evidence/lifecycle-${label}`);
try{
 await b.navigate(`${base}?renderer=webgl&idle=300`);
 await b.ev("window.__CAMERA_LAB__.select('D');window.__CAMERA_LAB__.seek(1)");await sleep(6000);
 const snapshot=()=>b.ev('({visibility:document.visibilityState,status:document.querySelector("[data-scene-status]")?.dataset.sceneStatus,time:window.__SPECIMEN__?.state().time,sanctuary:window.__SANCTUARY_REVIEW__?.state(),camera:window.__JELLYFISH_WORLD__?.getCameraState(),renderer:window.__SPECIMEN__?.rendererInfo(),text:document.body.innerText.slice(-500)})');
 b.save('before',await snapshot());
 if(mode==='freeze'){
  await b.send('Page.setWebLifecycleState',{state:'frozen'});await sleep(5000);await b.send('Page.setWebLifecycleState',{state:'active'});await b.send('Page.bringToFront');
 }else if(mode==='tab'){
  const target=await b.send('Target.createTarget',{url:'about:blank',background:false});await b.send('Target.activateTarget',{targetId:target.targetId});await sleep(1000);b.save('hidden',await snapshot());await sleep(4000);await b.send('Target.activateTarget',{targetId:b.page.id});await b.send('Page.bringToFront');
 }
 await sleep(1000);
 const resume=await snapshot();b.save('resume',resume);await b.shot('resume');
 if(!resume.renderer){await sleep(5000);b.save('resume-late',await snapshot());await b.shot('resume-late');b.save('errors',b.errors);throw Error('Renderer absent after freeze/resume; see saved baseline/candidate comparison');}
 for(const p of [.75,.92,.6,1,.8,1]){await b.ev(`window.__CAMERA_LAB__.seek(${p})`);await sleep(1500);}
 b.save('reverse',await snapshot());await b.shot('reverse');
 for(const[width,height]of [[800,900],[390,844],[1280,900]]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width,height});await sleep(2000);b.save(`resize-${width}`,await snapshot());await b.shot(`resize-${width}`);
 }
 b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
 console.log('Lifecycle/reverse/resize checks completed; idle-return defect intentionally not exercised or repaired.');
}catch(error){b.save('failure',{message:error.message,errors:b.errors});throw error;}finally{await b.close()}
