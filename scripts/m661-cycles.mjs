import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
import {installProbe} from './m661-probe.mjs';
const [base='http://127.0.0.1:5213/',label='candidate-cycles',count='35']=process.argv.slice(2);
const fixed=process.env.M661_FIXED==='1',record=process.env.M661_RECORD!=='0';
const b=await browserSession(`../m6-6-1-evidence/${label}`),rows=[];let recording=false;
try{
 const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.navigate(`${base}?renderer=webgl&idle=300`);await b.ev(`(${installProbe.toString()})()`);await b.ev('__IDLE_AUDIT__.trace(false);window.__HOTFIX_WORLD__=window.__JELLYFISH_WORLD__');await sleep(6000);
 const snap=()=>b.ev('__IDLE_AUDIT__.snapshot()');
 const healthy=s=>{assert.equal(s.sameWorld,true);assert.equal(s.contexts.length,0);assert.equal(s.chain.length,0);assert.ok(s.animals.length>15);assert.ok(s.animals.every(a=>!a.invalid),'Nonfinite animal: '+JSON.stringify(s.animals.filter(a=>a.invalid)));assert.ok(s.animals.every(a=>Number.isFinite(a.material.tissue)));assert.ok(s.animals.every(a=>a.state.delta<=.05));assert.ok(s.canvases.every(c=>c.size.every(n=>n>0)));};
 if(fixed){await b.ev("__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1)");await sleep(6000);}
 const initial=await snap();healthy(initial);const identity=initial.animals.map(a=>[a.state.id,[...a.geometries].sort(),a.material.id,a.material.map]);
 if(record){await b.record();recording=true;}
 const actions=['none','move','scroll','activate','view','explore','resize','reverse','threshold','none'];
 for(let i=0;i<Number(count);i++){
  const mode=fixed?'D':i%3===2?'D':'B',progress=fixed?1:[0,.5,1][i%3],action=fixed?'none':actions[i%actions.length];
  if(!fixed)await b.ev(`window.__CAMERA_LAB__.select('${mode}');window.__CAMERA_LAB__.seek(${progress});document.activeElement.blur()`);await sleep(1000);
  const before=await snap();healthy(before);if(i<3)await b.shot(`cycle-${i}-before`);
  await b.ev("history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'))");
  let active=false;for(let j=0;j<90;j++){active=await b.ev("!!document.querySelector('.idle-screen.is-active')");if(active)break;await sleep(100);}
  assert.equal(active,true,'No idle entry');await sleep(i<3?2000:250);
  const idle=await snap();healthy(idle);
  await b.ev("history.replaceState(null,'','?renderer=webgl&idle=300')");await b.key('Enter');
  const returned=await snap();healthy(returned);assert.equal(returned.world.mode,idle.world.mode);assert.ok(Math.abs(returned.world.progress-idle.world.progress)<.002,'Journey reset');
  let activation=false;
  if(action==='move')await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:620,y:430});
  if(action==='scroll'||action==='reverse'){for(const deltaY of action==='reverse'?[280,-280]:[200])await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:620,y:430,deltaX:0,deltaY});}
  if(action==='activate'){
   const old=await b.ev('__JELLYFISH_WORLD__.activationCount');
   for(let id=0;id<40&&!activation;id++){
    const p=await b.ev(`__JELLYFISH_WORLD__.getJellyScreenPoint(${id})`);if(!p||p.x<20||p.x>1260||p.y<90||p.y>790)continue;
    for(const type of['mouseMoved','mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...p,button:type==='mouseMoved'?'none':'left',clickCount:1});
    activation=await b.ev('__JELLYFISH_WORLD__.activationCount')>old;
   }
  }
  if(action==='view'){await b.click('.view-trigger');await b.click('[data-mode="C"]');}
  if(action==='explore'){await b.click('.view-trigger');await b.click('[data-mode="explore"]');await b.key('Escape');}
  if(action==='resize'){await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width:390,height:844});await sleep(200);healthy(await snap());await b.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width:1280,height:900});}
  if(action==='threshold'){await b.ev("__CAMERA_LAB__.select('explore');__CAMERA_LAB__.camera.position.z-=8;__CAMERA_LAB__.camera.updateMatrixWorld()");}
  await sleep(2800);const after=await snap();healthy(after);
  assert.deepEqual(after.animals.map(a=>[a.state.id,[...a.geometries].sort(),a.material.id,a.material.map]),identity,'Animal resources replaced');
  rows.push({cycle:i+1,action,activation,before,idle,returned,after});b.save('cycles',rows);
  if(i<3)await b.shot(`cycle-${i}-after`);
  if(i===9&&recording){await b.finish();recording=false;}
  console.log(`cycle ${i+1}: ${mode} ${progress} ${action} PASS`);
 }
 if(recording)await b.finish();b.save('errors',b.errors);assert.equal(b.errors.length,0);if(!fixed)assert.ok(rows.some(r=>r.activation),'No real activation succeeded');
 console.log('PASS '+rows.length+' same-world idle cycles');
}catch(e){b.save('failure',{error:String(e),errors:b.errors,cycles:rows.length});throw e;}finally{await b.close()}
