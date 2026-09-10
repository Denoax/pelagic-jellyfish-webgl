import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../m7-1-evidence/review-check');
try{
 // Validate the evidence viewer as a real page, not just HTTP status codes.
 await b.send('Page.navigate',{url:'http://127.0.0.1:5218/'});await sleep(4000);
 const media=await b.ev(`Promise.all([...document.querySelectorAll('video')].map(async v=>{if(v.readyState<1)await new Promise((resolve,reject)=>{v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',reject,{once:true});setTimeout(()=>reject(Error(v.src)),12000)});return{src:v.getAttribute('src'),width:v.videoWidth,height:v.videoHeight,duration:v.duration}}))`);
 assert.equal(media.length,12);assert.ok(media.every(m=>m.duration>0&&m.width>0));
 await b.ev(`(async()=>{const v=document.querySelector('video');v.muted=true;await v.play()})()`);await sleep(1200);
 assert.ok(await b.ev(`document.querySelector('video').currentTime>0`));
 assert.ok(await b.ev(`[...document.images].every(i=>i.complete&&i.naturalWidth>0)`));b.save('media',media);await b.shot('viewer');
 // Background recovery while the liquid itself is ACTIVE, in addition to the
 // shared lifecycle script's normal-ocean hidden return.
 await b.navigate('http://127.0.0.1:5217/?renderer=webgl&idle=300');await sleep(7000);
 await b.ev(`window.__M71_WORLD__=__JELLYFISH_WORLD__;history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(4000);
 const state=()=>b.ev(`({idle:__OCEAN_IDLE__.state(),camera:__JELLYFISH_WORLD__.getCameraState(),sameWorld:__M71_WORLD__===__JELLYFISH_WORLD__,visibility:document.visibilityState})`);
 const before=await state();assert.equal(before.idle.active,true);
 const tab=await b.send('Target.createTarget',{url:'about:blank'});await b.send('Target.activateTarget',{targetId:tab.targetId});await sleep(1000);
 const hidden=await state();assert.equal(hidden.visibility,'hidden');await sleep(4000);
 const paused=await state();assert.ok(paused.idle.time-hidden.idle.time<.1);
 await b.send('Target.activateTarget',{targetId:b.page.id});await sleep(1000);const after=await state();
 assert.ok(after.idle.time-paused.idle.time<1.3);assert.equal(after.sameWorld,true);assert.deepEqual(after.idle.resources,before.idle.resources);
 assert.deepEqual(after.camera.position,before.camera.position);assert.deepEqual(after.camera.quaternion,before.camera.quaternion);
 const field=await b.ev('__OCEAN_IDLE__.field()');assert.equal(field.invalid,0);b.save('active-hidden',{before,hidden,paused,after,field});await b.shot('active-return');
 await b.send('Target.closeTarget',{targetId:tab.targetId});assert.equal(b.errors.length,0);b.save('errors',b.errors);console.log('viewer media, active-idle hidden recovery PASS');
}finally{await b.close()}
