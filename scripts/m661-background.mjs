import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
import {installProbe} from './m661-probe.mjs';
const [base='http://127.0.0.1:5213/',label='candidate-background']=process.argv.slice(2);
for(const mode of['tab','combined','dismiss-hidden','freeze']){
 const b=await browserSession(`../m6-6-1-evidence/${label}/${mode}`),checks={};
 try{
  const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  await b.navigate(`${base}?renderer=webgl&idle=300`);await b.ev(`(${installProbe.toString()})()`);await b.ev("__IDLE_AUDIT__.trace(false);window.__HOTFIX_WORLD__=window.__JELLYFISH_WORLD__;__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1)");await sleep(5000);
  const snap=()=>b.ev('window.__IDLE_AUDIT__?.snapshot()||({missing:true,url:location.href,status:document.querySelector("[data-scene-status]")?.dataset.sceneStatus,navigation:performance.getEntriesByType("navigation").map(n=>({type:n.type,start:n.startTime}))})');
  checks.before=await snap();await b.shot('before');
  if(mode==='combined'||mode==='dismiss-hidden'){
   await b.ev("history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'))");
   for(let j=0;j<80;j++){if(await b.ev("!!document.querySelector('.idle-screen.is-active')"))break;await sleep(100);}
   checks.idle=await snap();assert.equal(checks.idle.idle,true);await sleep(1000);await b.ev("history.replaceState(null,'','?renderer=webgl&idle=300')");
   if(mode==='dismiss-hidden')await b.key('Enter');
  }
  if(mode==='freeze'){
   await b.send('Page.setWebLifecycleState',{state:'frozen'});await sleep(5000);await b.send('Page.setWebLifecycleState',{state:'active'});await b.send('Page.bringToFront');
  }else{
   const target=await b.send('Target.createTarget',{url:'about:blank'});await b.send('Target.activateTarget',{targetId:target.targetId});await sleep(1000);checks.hidden=await snap();assert.equal(checks.hidden.visibility,'hidden');await sleep(4000);
   await b.send('Target.activateTarget',{targetId:b.page.id});await b.send('Page.bringToFront');await b.send('Target.closeTarget',{targetId:target.targetId});
  }
  await sleep(700);checks.returned=await snap();await b.shot('returned');await sleep(3000);checks.later=await snap();await b.shot('later');
  b.save('checks',checks);b.save('errors',b.errors);
  if(checks.later.missing){console.log(mode+' PAGE REINITIALIZED — no finite-state result');continue;}
  for(const s of[checks.returned,checks.later]){assert.equal(s.sameWorld,true);assert.equal(s.contexts.length,0);assert.ok(s.animals.every(a=>!a.invalid));assert.ok(s.animals.every(a=>a.state.delta<=.05));assert.equal(s.world.mode,checks.before.world.mode);assert.ok(Math.abs(s.world.progress-checks.before.world.progress)<.002);}
  assert.equal(b.errors.length,0);console.log(mode+' PASS');
 }catch(e){b.save('failure',{error:String(e),checks,errors:b.errors});console.log(mode+' FAIL '+e.message);}finally{await b.close();}
}
