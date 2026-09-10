// Real-browser production and lifecycle checks, separate from motion capture.
import {spawn} from 'node:child_process';
import {mkdirSync,mkdtempSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const root=resolve('../m5-view-evidence/lifecycle');mkdirSync(root,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=spawn(resolve('scripts/brave-headless.sh'),['--headless=new','--no-sandbox','--hide-scrollbars','--use-gl=angle','--use-angle=gl','--remote-debugging-port=9279',`--user-data-dir=${mkdtempSync(root+'/profile-')}`,'about:blank'],{stdio:'ignore'});
let socket,send;const checks={},errors=[];
try{
 let page;for(let i=0;i<100;i++){try{page=await(await fetch('http://127.0.0.1:9279/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(100);}}
 socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();
 send=(method,params={})=>new Promise((res,rej)=>{pending.set(++id,{res,rej});socket.send(JSON.stringify({id,method,params}));});
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(JSON.stringify(m.error))):p.res(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const assert=(v,m)=>{if(!v)throw Error(m);};
 const ready=async()=>{for(let i=0;i<700;i++){if(await ev(`Boolean(document.querySelector('.view-trigger'))&&document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`))return;await sleep(100);}throw Error('Not ready');};
 const shot=async name=>writeFileSync(`${root}/${name}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 const point=selector=>ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
 const click=async selector=>{const p=await point(selector);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await sleep(150);};
 const activate=async()=>{
  const start=await ev('window.__JELLYFISH_WORLD__.activationCount');
  for(let i=0;i<8;i++){
   const p=await ev(`window.__JELLYFISH_WORLD__.getJellyScreenPoint(${i})`);if(!p||p.x<5||p.x>1275||p.y<90||p.y>780)continue;
   for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:type==='mouseMoved'?'none':'left',clickCount:1});await sleep(120);
   if(await ev('window.__JELLYFISH_WORLD__.activationCount')>start)return true;
  }return false;
 };
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'http://127.0.0.1:5195/pelagic-jellyfish-webgl/?idle=300'});await ready();await sleep(6000);
 checks.production=await ev(`({renderer:window.__JELLYFISH_WORLD__.renderer,view:window.__JELLYFISH_WORLD__.getCameraState(),devCamera:!!window.__CAMERA_LAB__,devSpecimen:!!window.__SPECIMEN__,buffers:[...document.querySelectorAll('.ocean-canvas')].map(c=>[c.width,c.height]),browser:navigator.userAgent})`);
 assert(!checks.production.devCamera&&!checks.production.devSpecimen,'DEV inspection leaked into build');
 assert(checks.production.renderer==='WebGL 2','Expected actual WebGL2 backend');await shot('production-default');
 checks.normalActivation=await activate();assert(checks.normalActivation,'Normal animal click failed');
 await ev('window.__REVIEW_WORLD__=window.__JELLYFISH_WORLD__');await click('.view-trigger');
 const count=await ev('window.__JELLYFISH_WORLD__.activationCount');await click('input[value="explore"]');
 checks.uiDoesNotActivate=await ev(`window.__JELLYFISH_WORLD__.activationCount===${count}`);assert(checks.uiDoesNotActivate,'UI click activated ocean');
 await click('.view-icon');checks.exploreActivation=await activate();assert(checks.exploreActivation,'Explore animal click failed');
 await click('.view-trigger');await click('.view-advanced summary');await click('.view-field select');
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'End',code:'End',windowsVirtualKeyCode:35});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'End',code:'End',windowsVirtualKeyCode:35});
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await sleep(150);
 checks.response=await ev(`({value:document.querySelector('.view-field select').value,saved:JSON.parse(localStorage.getItem('pelagic.view.v1')).response})`);assert(checks.response.value==='responsive'&&checks.response.saved==='responsive','Response keyboard/persistence failed');
 await click('.view-advanced summary');checks.resize=[];
 for(const [width,height] of [[820,900],[390,844],[320,640],[1280,900]]){
  await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await sleep(800);
  const state=await ev(`(()=>{const p=document.querySelector('.view-panel').getBoundingClientRect();return {width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,sameWorld:window.__JELLYFISH_WORLD__===window.__REVIEW_WORLD__,panel:{x:p.x,y:p.y,right:p.right,bottom:p.bottom},buffer:[document.querySelector('.ocean-canvas').width,document.querySelector('.ocean-canvas').height]};})()`);
  checks.resize.push(state);assert(state.sameWorld&&!state.overflow&&state.panel.x>=0&&state.panel.right<=width&&state.panel.y>=0&&state.panel.bottom<=height,'Resize failed');await shot(`resize-${width}`);
 }
 await send('Emulation.setTouchEmulationEnabled',{enabled:true});const p=await point('.view-move-pad button:first-child');const before=await ev('window.__JELLYFISH_WORLD__.getCameraState().position');
 await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await sleep(500);await send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await sleep(100);
 const after=await ev('window.__JELLYFISH_WORLD__.getCameraState().position');await sleep(300);const settled=await ev('window.__JELLYFISH_WORLD__.getCameraState().position');
 checks.touchPad={distance:Math.hypot(...after.map((v,i)=>v-before[i])),released:JSON.stringify(after)===JSON.stringify(settled)};assert(checks.touchPad.distance>.3&&checks.touchPad.released,'Touch move/cancel failed');
 await sleep(650);await ev(`document.activeElement.blur();history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'));`);
 for(let i=0;i<80;i++){if(await ev(`Boolean(document.querySelector('.idle-screen.is-active'))`))break;await sleep(100);}
 checks.idle=await ev(`({active:!!document.querySelector('.idle-screen.is-active'),viewHidden:document.querySelector('.view-ui').hidden,sameWorld:window.__JELLYFISH_WORLD__===window.__REVIEW_WORLD__})`);assert(checks.idle.active&&checks.idle.viewHidden&&checks.idle.sameWorld,'Idle integration failed');await sleep(3000);await shot('idle');
 await ev(`history.replaceState(null,'','?idle=300')`);await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,text:'\r'});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13});await sleep(3200);
 checks.return=await ev(`({active:!!document.querySelector('.idle-screen.is-active'),viewHidden:document.querySelector('.view-ui').hidden,sameWorld:window.__JELLYFISH_WORLD__===window.__REVIEW_WORLD__,status:document.querySelector('[data-scene-status]').dataset.sceneStatus})`);assert(!checks.return.active&&!checks.return.viewHidden&&checks.return.sameWorld&&checks.return.status==='ready','Idle return failed');await shot('idle-return');assert(!errors.length,'Browser exception');
 writeFileSync(root+'/checks.json',JSON.stringify({checks,errors},null,2));console.log(root);
}catch(error){writeFileSync(root+'/failure.json',JSON.stringify({error:String(error),checks,errors},null,2));throw error;}
finally{if(send)await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);socket?.close();browser.kill('SIGTERM');}
