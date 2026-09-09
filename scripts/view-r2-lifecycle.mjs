import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession(process.argv[2]||'lifecycle-final'),{ev,send}=b,checks={};
const assert=(v,m)=>{if(!v)throw Error(m);};
try{
 await b.navigate('http://127.0.0.1:5197/pelagic-jellyfish-webgl/?renderer=webgl&idle=300');await sleep(6000);
 checks.production=await ev(`({renderer:window.__JELLYFISH_WORLD__.renderer,devCamera:!!window.__CAMERA_LAB__,devSpecimen:!!window.__SPECIMEN__,buffers:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height]),browser:navigator.userAgent,buttons:[...document.querySelectorAll('.view-ui button')].filter(x=>x.getBoundingClientRect().height).map(x=>x.textContent)})`);
 assert(!checks.production.devCamera&&!checks.production.devSpecimen&&checks.production.renderer==='WebGL 2','Production/backend mismatch');
 assert(!checks.production.buttons.some(x=>/Play|Pause|Replay/.test(x))&&!await ev(`Boolean(document.querySelector('.view-ui input[type=range]'))`),'Public playback/scrubber leaked');
 await b.shot('production-default');await b.record();
 const activate=async()=>{const before=await ev('window.__JELLYFISH_WORLD__.activationCount');for(let i=0;i<8;i++){const p=await ev(`window.__JELLYFISH_WORLD__.getJellyScreenPoint(${i})`);if(!p||p.x<5||p.x>1275||p.y<90||p.y>780)continue;for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:type==='mouseMoved'?'none':'left',clickCount:1});await sleep(120);if(await ev('window.__JELLYFISH_WORLD__.activationCount')>before)return true;}return false;};
 checks.normalActivation=await activate();assert(checks.normalActivation,'Normal activation failed');
 await ev('window.__REVIEW_WORLD__=window.__JELLYFISH_WORLD__');await b.click('.view-trigger');const count=await ev('window.__JELLYFISH_WORLD__.activationCount');await b.click('[data-mode="explore"]');
 checks.uiExcluded=await ev(`window.__JELLYFISH_WORLD__.activationCount===${count}`);assert(checks.uiExcluded,'UI activated animal');
 checks.exploreActivation=await activate();assert(checks.exploreActivation,'Explore activation failed');await b.click('.view-exit');await sleep(1200);
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await send('Emulation.setTouchEmulationEnabled',{enabled:true});await sleep(700);
 const state=()=>ev('window.__JELLYFISH_WORLD__.getCameraState()');const before=await state();
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:155,y:600}]});
 for(let i=1;i<=8;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:155,y:600-i*35}]});await sleep(45);}
 await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(2200);const after=await state();await sleep(1000);const settled=await state();
 checks.touchJourney={before,after,settled};assert(after.progress>before.progress+.05,'Touch journey too small');assert(after.progress===settled.progress,'Touch did not settle');await b.shot('portrait-touch-settled');
 await b.click('.view-trigger');await b.click('[data-mode="explore"]');await send('Emulation.setDeviceMetricsOverride',{width:320,height:640,deviceScaleFactor:1,mobile:false});await sleep(700);await b.shot('320-explore');
 const p=await ev(`(()=>{const r=document.querySelector('[aria-label="Explore forward"]').getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);assert(p.x<320&&p.y<640,'Touch button clipped');const start=await state();
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await sleep(500);await send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await sleep(100);const moved=await state();await sleep(350);const stopped=await state();
 checks.touchMove={distance:Math.hypot(...moved.position.map((v,i)=>v-start.position[i])),stopped:JSON.stringify(moved.position)===JSON.stringify(stopped.position)};assert(checks.touchMove.distance>.3&&checks.touchMove.stopped,'Touch move/cancel stuck');
 await b.click('.view-exit');await sleep(1400);
 await sleep(650);await ev(`document.activeElement.blur();history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('pointermove'));`);
 for(let i=0;i<80;i++){if(await ev(`Boolean(document.querySelector('.idle-screen.is-active'))`))break;await sleep(100);}
 checks.idle=await ev(`({active:!!document.querySelector('.idle-screen.is-active'),hidden:document.querySelector('.view-ui').hidden,same:window.__REVIEW_WORLD__===window.__JELLYFISH_WORLD__})`);assert(Object.values(checks.idle).every(Boolean),'Idle entry failed');await sleep(2500);await b.shot('idle');
 await ev(`history.replaceState(null,'','?idle=300')`);await b.key('Enter');await sleep(3200);
 checks.return=await ev(`({active:!!document.querySelector('.idle-screen.is-active'),hidden:document.querySelector('.view-ui').hidden,same:window.__REVIEW_WORLD__===window.__JELLYFISH_WORLD__})`);assert(!checks.return.active&&!checks.return.hidden&&checks.return.same,'Idle return failed');await b.shot('idle-return');
 await b.finish();assert(!b.errors.length,'Browser errors');b.save('checks',{checks,errors:b.errors});console.log(b.out);
}catch(e){b.save('failure',{error:String(e),checks,errors:b.errors});throw e;}finally{await b.close();}
