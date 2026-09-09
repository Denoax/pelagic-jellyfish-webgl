import {browserSession,sleep} from './view-r2-browser.mjs';
const [url='http://127.0.0.1:5198/?renderer=webgl&idle=300',label='lifecycle']=process.argv.slice(2);
const b=await browserSession('../m6-evidence/'+label),{ev,send}=b,checks={};
const assert=(v,m)=>{if(!v)throw Error(m);};
try {
 const {windowId}=await send('Browser.getWindowForTarget');
 await send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});
 await send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.navigate(url);await sleep(6000);
 checks.initial=await ev(`({backend:window.__JELLYFISH_WORLD__.renderer,dev:!!window.__CAMERA_LAB__,deep:window.__JELLYFISH_WORLD__.getDeepState(),browser:navigator.userAgent})`);
 assert(checks.initial.backend==='WebGL 2','Wrong backend');
 await b.click('.view-trigger');await b.click('[data-mode="D"]');await ev('document.activeElement.blur()');await b.key('End');await sleep(2300);
 await ev('window.__M6_ORIGINAL_WORLD__=window.__JELLYFISH_WORLD__');
 checks.deep=await ev('window.__JELLYFISH_WORLD__.getCameraState()');assert(checks.deep.progress>.99,'Not at sanctuary');
 await b.record();await b.shot('deep-before');
 const activate=async()=>{const before=await ev('window.__JELLYFISH_WORLD__.activationCount');for(let i=0;i<20;i++){const p=await ev(`window.__JELLYFISH_WORLD__.getJellyScreenPoint(${i})`);if(!p||p.x<5||p.x>1275||p.y<90||p.y>780)continue;for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:type==='mouseMoved'?'none':'left',clickCount:1});await sleep(120);if(await ev('window.__JELLYFISH_WORLD__.activationCount')>before)return true;}return false;};
 checks.activation=await activate();assert(checks.activation,'No clicked animal activated');await sleep(1300);await b.shot('activation');
 const beforeHidden=await ev('window.__JELLYFISH_WORLD__.getDeepState()');
 const other=await send('Target.createTarget',{url:'about:blank'});await send('Target.activateTarget',{targetId:other.targetId});await sleep(2500);
 checks.hidden=await ev('document.visibilityState');assert(checks.hidden==='hidden','Tab did not background');
 await send('Target.activateTarget',{targetId:b.page.id});await send('Page.bringToFront');await send('Target.closeTarget',{targetId:other.targetId});await sleep(700);
 const afterHidden=await ev('window.__JELLYFISH_WORLD__.getDeepState()');checks.background={beforeHidden,afterHidden};if(Number.isFinite(afterHidden.plumeTime))assert(afterHidden.plumeTime-beforeHidden.plumeTime<1.5,'Plume caught up hidden wall time');await b.shot('resume');
 await ev(`document.activeElement.blur();history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('pointermove'));`);
 for(let i=0;i<100;i++){if(await ev(`!!document.querySelector('.idle-screen.is-active')`))break;await sleep(100);}
 checks.idle=await ev(`({active:!!document.querySelector('.idle-screen.is-active'),hidden:document.querySelector('.view-ui').hidden,same:window.__M6_ORIGINAL_WORLD__===window.__JELLYFISH_WORLD__})`);assert(Object.values(checks.idle).every(Boolean),'Idle entry');await sleep(2500);await b.shot('idle');
 await ev(`history.replaceState(null,'','?renderer=webgl&idle=300')`);await b.key('Enter');await sleep(3200);
 checks.return=await ev(`({active:!!document.querySelector('.idle-screen.is-active'),hidden:document.querySelector('.view-ui').hidden,same:window.__M6_ORIGINAL_WORLD__===window.__JELLYFISH_WORLD__,deep:window.__JELLYFISH_WORLD__.getDeepState(),camera:window.__JELLYFISH_WORLD__.getCameraState()})`);
 assert(!checks.return.active&&!checks.return.hidden&&checks.return.same&&checks.return.camera.progress>.99,'Idle return');await b.shot('idle-return');
 await sleep(8000);await b.shot('idle-return-later');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:false});await sleep(1000);await b.shot('portrait');
 checks.resourcesStable=['geometries','materials','solids'].every(k=>checks.initial.deep[k]===checks.return.deep[k]);assert(checks.resourcesStable,'Resource count changed');
 await b.finish();assert(!b.errors.length,'Browser exception');b.save('checks',{checks,errors:b.errors});console.log(b.out);
}catch(error){b.save('failure',{error:String(error),checks,errors:b.errors});throw error;}finally{await b.close();}
