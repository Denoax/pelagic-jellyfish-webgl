import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
import {installProbe} from './m661-probe.mjs';
const b=await browserSession('../m7-evidence/lifecycle'),rows=[];
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__CONTEXTS__=[];const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){const r=get.call(this,type,...args);if(r&&/webgl|webgpu/.test(type)&&!__CONTEXTS__.includes(r))__CONTEXTS__.push(r);return r};`});
 await b.navigate('http://127.0.0.1:5215/?renderer=webgl&idle=300');await b.ev(`(${installProbe.toString()})()`);await b.ev(`__IDLE_AUDIT__.trace(false);window.__HOTFIX_WORLD__=__JELLYFISH_WORLD__;__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1)`);await sleep(5000);
 const state=()=>b.ev(`({idle:__OCEAN_IDLE__.state(),camera:__JELLYFISH_WORLD__.getCameraState(),world:__IDLE_AUDIT__.snapshot(),contexts:__CONTEXTS__.length,render:__SANCTUARY_REVIEW__.renderStats(),activation:__JELLYFISH_WORLD__.activationCount})`);
 const check=s=>{assert.equal(s.contexts,1);assert.equal(s.world.sameWorld,true);assert.ok(s.world.animals.every(a=>!a.invalid));};
 const initial=await state();check(initial);b.save('initial',initial);
 for(let i=0;i<20;i++){
  const before=await state();
  await b.ev(`document.activeElement.blur();history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'))`);
  await sleep(1300);const entered=await state();await sleep(i<2?8000:1100);const during=await state();check(during);
  assert.deepEqual(during.camera.position,entered.camera.position);assert.deepEqual(during.camera.quaternion,entered.camera.quaternion);assert.equal(during.camera.progress,entered.camera.progress);
  await b.ev(`window.dispatchEvent(new Event('pointermove'));history.replaceState(null,'','?renderer=webgl&idle=300')`);
  if(i%2===0)await b.key('Enter');else{for(const type of['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:640,y:450,button:'left',clickCount:1});}
  await sleep(1400);const after=await state();check(after);assert.equal(after.idle.amount,0);assert.equal(after.activation,before.activation);assert.deepEqual(after.idle.resources,initial.idle.resources);
  const field=await b.ev('__OCEAN_IDLE__.field()');assert.equal(field.invalid,0);
  rows.push({cycle:i+1,before,during,after,field});b.save('cycles',rows);console.log('cycle '+(i+1)+' PASS');
 }
 // Idle from each mode, resize while active, then real hidden-tab recovery.
 for(const mode of['A','B','C','D','explore']){
  await b.ev(`__CAMERA_LAB__.select('${mode}');history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(3500);
  const before=await state();check(before);await b.ev(`history.replaceState(null,'','?idle=300')`);await b.key('Escape');await sleep(1200);const after=await state();check(after);assert.equal(after.camera.mode,before.camera.mode);b.save('mode-'+mode,{before,after});
 }
 await b.ev(`history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(2000);
 for(const[width,height]of[[800,900],[390,844],[1280,900]]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width,height});await sleep(2000);check(await state());await b.shot('resize-'+width);b.save('resize-'+width,await state());
 }
 await b.ev(`history.replaceState(null,'','?idle=300')`);
 const tab=await b.send('Target.createTarget',{url:'about:blank'});await b.send('Target.activateTarget',{targetId:tab.targetId});await sleep(1000);const hidden=await state();assert.equal(hidden.world.visibility,'hidden');b.save('hidden',hidden);await sleep(4000);await b.send('Target.activateTarget',{targetId:b.page.id});await sleep(1800);check(await state());b.save('hidden-return',await state());await b.send('Target.closeTarget',{targetId:tab.targetId});
 b.save('final',await state());b.save('errors',b.errors);assert.equal(b.errors.length,0);console.log('lifecycle PASS');
}finally{b.save('errors',b.errors);await b.close()}
