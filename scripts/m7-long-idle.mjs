import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../m7-evidence/long-idle'),rows=[];
try{
 await b.navigate('http://127.0.0.1:5215/?renderer=webgl&idle=300');await b.ev(`__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1)`);await sleep(4000);
 await b.ev(`history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(9000);
 let recording=false,done=false,startKey;
 for(let i=0;i<180;i++){
  const s=await b.ev(`({idle:__OCEAN_IDLE__.state(),seconds:new Date().getSeconds(),memory:__SANCTUARY_REVIEW__.renderStats().memory})`);
  if(!done&&!recording&&s.seconds>=56){await b.record();recording=true;startKey=s.idle.clock;await b.shot('minute-before');}
  if(recording&&s.idle.clock!==startKey&&s.idle.minute===1){await b.shot('minute-after');await b.finish();recording=false;done=true;}
  if(i%30===0){rows.push(s);b.save('samples',rows);console.log('long idle '+i+' seconds');}
  await sleep(1000);
 }
 if(recording)await b.finish();assert.ok(done,'Actual minute transition not captured');b.save('field',await b.ev('__OCEAN_IDLE__.field()'));
 assert.equal(b.errors.length,0);assert.deepEqual(rows.at(-1).memory,rows[0].memory);console.log('long idle PASS');
}finally{b.save('errors',b.errors);await b.close()}
