// Real Brave UI interaction, lifecycle and motion evidence. No test dependency.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const width=Number(process.argv[2]||1280),height=Number(process.argv[3]||900),label=process.argv[4]||`view-${width}`;
const root=resolve('../m5-view-evidence',label);mkdirSync(root,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=spawn(resolve('scripts/brave-headless.sh'),['--headless=new','--no-sandbox','--hide-scrollbars','--use-gl=angle','--use-angle=gl','--remote-debugging-port=9279',`--user-data-dir=${mkdtempSync(root+'/browser-')}`,'about:blank'],{stdio:'ignore'});
let socket,send;const frames=[],errors=[],checks={};
try {
 let page;for(let i=0;i<100;i++){try{page=await(await fetch('http://127.0.0.1:9279/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(100);}}
 if(!page)throw Error('Browser not ready');socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map();
 send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);else if(m.method==='Page.screencastFrame'){const name=`frame-${String(frames.length).padStart(5,'0')}.jpg`;writeFileSync(`${root}/${name}`,Buffer.from(m.params.data,'base64'));frames.push({name,time:m.params.metadata.timestamp});void send('Page.screencastFrameAck',{sessionId:m.params.sessionId});}});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const assert=(value,message)=>{if(!value)throw Error(message);};
 const shot=async name=>{const s=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${root}/${name}.png`,Buffer.from(s.data,'base64'));};
 const click=async selector=>{
  const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,text:e.textContent,width:r.width,height:r.height};})()`);
  assert(p.width&&p.height,`Not visible: ${selector}`);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x:p.x,y:p.y,button:'left',clickCount:1});await sleep(180);
 };
 const key=async(key,code=key,modifiers=0)=>{const windowsVirtualKeyCode={Tab:9,Enter:13,Escape:27,End:35,Home:36,KeyA:65}[code];await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,modifiers,windowsVirtualKeyCode,text:key==='Enter'?'\r':undefined});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,modifiers,windowsVirtualKeyCode});};
 const fill=async(selector,value)=>{await click(selector);await key('a','KeyA',2);await send('Input.insertText',{text:value});};
 const ready=async()=>{for(let i=0;i<700;i++){if(await evaluate(`!!window.__CAMERA_LAB__&&document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`))return;await sleep(100);}throw Error('Ocean not ready');};
 await send('Page.enable');await send('Runtime.enable');await send('Browser.setDownloadBehavior',{behavior:'deny'});
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 const url='http://127.0.0.1:5194/?renderer=webgl&idle=300';await send('Page.navigate',{url});await ready();await sleep(6000);
 checks.metadata=await evaluate(`({browser:navigator.userAgent,viewport:[innerWidth,innerHeight],renderer:window.__SPECIMEN__.rendererInfo(),ratio:window.__JELLYFISH_WORLD__.pixelRatio,status:document.querySelector('[data-scene-status]').dataset.sceneStatus})`);
 checks.default=await evaluate(`({mode:window.__CAMERA_LAB__.summary().mode,closed:document.querySelector('.view-panel').hidden,advanced:document.querySelector('.view-advanced').open,scrollWidth:document.documentElement.scrollWidth})`);
 assert(checks.default.closed&&!checks.default.advanced,'Complexity must be closed by default');await shot('01-default');
 await evaluate('document.querySelector(".view-trigger").focus()');await key('Enter');await sleep(200);assert(await evaluate('!document.querySelector(".view-panel").hidden'),'Native Enter must open the menu');await key('Escape');await sleep(150);
 await send('Page.startScreencast',{format:'jpeg',quality:89,maxWidth:width,maxHeight:height,everyNthFrame:2});
 await click('.view-trigger');await shot('02-view-menu');
 checks.controls=await evaluate(`[...document.querySelectorAll('.view-panel button,.view-mode,.view-advanced summary')].filter(e=>e.getBoundingClientRect().height).map(e=>({text:e.textContent.trim(),height:e.getBoundingClientRect().height}))`);
 await click('.view-mode:has(input[value="B"])');await sleep(1500);
 await click('.view-primary');await sleep(1800);await click('.view-primary');await sleep(2500);
 checks.pause=await evaluate('window.__CAMERA_LAB__.summary()');assert(checks.pause.paused&&Math.abs(checks.pause.velocity)<.0001,'Pause must stop journey, not ocean');
 await click('.view-range');await key('End');await sleep(500);
 await evaluate(`window.__VIEW_TRACE__=[];window.__CAMERA_LAB__.onFrame=(_,time)=>{const c=window.__CAMERA_LAB__;window.__VIEW_TRACE__.push({time,...c.summary(),position:c.camera.position.toArray()});}`);
 await key('Escape');await sleep(4000);
 checks.scroll=await evaluate('window.__CAMERA_LAB__.summary()');assert(checks.scroll.destination>.99&&checks.scroll.progress<.3,'Aggressive input bypassed rate limit');
 await shot('03-bounded-journey');
 await click('.view-trigger');await click('.view-primary');await sleep(1800);
 await click('.view-advanced summary');await shot('04-advanced');
 await fill('.view-field input[type="number"]','63');await key('Tab');await sleep(1200);
 checks.fov=await evaluate(`({value:window.__CAMERA_LAB__.summary().fixedFov,input:document.querySelector('.view-field input[type="number"]').value,error:document.querySelector('.view-error').textContent,active:document.activeElement.outerHTML.slice(0,300)})`);await shot('04b-lens');assert(checks.fov.value===63,'FOV edit failed');
 await click('.view-checkbox');await sleep(400);assert(await evaluate('!document.querySelector(".view-guides").hidden'),'Guide toggle failed');await shot('05-guides');
 await click('.view-checkbox');await click('.view-mode:has(input[value="explore"])');await sleep(300);await shot('06-explore');
 const before=await evaluate('window.__CAMERA_LAB__.camera.position.toArray()');
 // A real canvas click closes the non-modal panel; keyboard movement then has no form focus.
 for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x:width*.5,y:80,button:'left',clickCount:1});
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW'});await sleep(600);await send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW'});
 const after=await evaluate('window.__CAMERA_LAB__.camera.position.toArray()');checks.freeDistance=Math.hypot(...after.map((v,i)=>v-before[i]));assert(checks.freeDistance>.3,'Free camera did not move');
 const q=await evaluate('window.__CAMERA_LAB__.camera.quaternion.toArray()');
 await send('Input.dispatchMouseEvent',{type:'mousePressed',x:width*.6,y:height*.3,button:'right',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:width*.7,y:height*.35,button:'right',buttons:2});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:width*.7,y:height*.35,button:'right',clickCount:1});
 checks.look=await evaluate(`JSON.stringify(window.__CAMERA_LAB__.camera.quaternion.toArray())!==${JSON.stringify(JSON.stringify(q))}`);assert(checks.look,'Free look failed');
 if(width<600){
  await send('Emulation.setTouchEmulationEnabled',{enabled:true});const old=await evaluate('window.__CAMERA_LAB__.camera.quaternion.toArray()');
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:150,y:200}]});await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:195,y:235}]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  checks.touchLook=await evaluate(`JSON.stringify(window.__CAMERA_LAB__.camera.quaternion.toArray())!==${JSON.stringify(JSON.stringify(old))}`);assert(checks.touchLook,'Touch look failed');
 }
 await click('.view-trigger');await click('.view-pose-buttons button:first-child');await click('.view-pose-buttons button:last-child');
 checks.pose=await evaluate(`({error:document.querySelector('.view-error').textContent,notice:document.querySelector('.view-notice').textContent,poses:window.__CAMERA_LAB__.definitions[window.__CAMERA_LAB__.id].poses.length})`);assert(!checks.pose.error,'Save/apply failed');
 await evaluate(`window.__EXPORT_BLOB__=null;window.__CREATE_URL__=URL.createObjectURL;URL.createObjectURL=b=>{window.__EXPORT_BLOB__=b;return window.__CREATE_URL__(b);}`);
 await click('.view-export');checks.export=await evaluate(`(async()=>{const j=JSON.parse(await window.__EXPORT_BLOB__.text());URL.createObjectURL=window.__CREATE_URL__;return {count:j.poses.length,fov:j.poses[0].fov,authoring:j.authoring.poses.length};})()`);assert(checks.export.count===1201,'Export failed');
 const valid=await evaluate('document.querySelector("#view-json").value');await fill('#view-json','{broken');await click('.view-pose-buttons button:last-child');assert(await evaluate('Boolean(document.querySelector(".view-error").textContent)'),'Invalid JSON must report error');await shot('07-editor-validation');await fill('#view-json',valid);await click('.view-pose-buttons button:last-child');
 checks.switchParity=await evaluate(`(()=>{const world=window.__JELLYFISH_WORLD__,c=window.__CAMERA_LAB__,actors=JSON.stringify(world.getSwarmState()),time=window.__SPECIMEN__.state().time,position=c.camera.position.toArray();for(const mode of ['A','B','C','D','B'])document.querySelector('input[value="'+mode+'"]').click();return {sameWorld:world===window.__JELLYFISH_WORLD__,sameActors:actors===JSON.stringify(world.getSwarmState()),sameTime:time===window.__SPECIMEN__.state().time,sameImmediatePose:JSON.stringify(position)===JSON.stringify(c.camera.position.toArray())};})()`);assert(Object.values(checks.switchParity).every(Boolean),'Mode switch reset/jumped state');await sleep(1300);
 await click('.view-advanced summary');await key('Escape');checks.escape=await evaluate(`({closed:document.querySelector('.view-panel').hidden,focused:document.activeElement===document.querySelector('.view-trigger')})`);assert(checks.escape.closed&&checks.escape.focused,'Escape focus restore failed');
 await key('Enter');await sleep(200);checks.keyboardOpened=await evaluate('!document.querySelector(".view-panel").hidden');await key('Tab');checks.keyboard=await evaluate('({label:document.activeElement.getAttribute("aria-label"),element:document.activeElement.outerHTML.slice(0,400)})');assert(checks.keyboardOpened&&checks.keyboard.label==='Close view controls','Panel keyboard order failed');
 await shot('08-keyboard-focus');
 await send('Page.stopScreencast');await sleep(200);
 writeFileSync(root+'/journey-trace.json',JSON.stringify(await evaluate('window.__VIEW_TRACE__')));
 // Persisted mode/open state must survive a real reload without restarting on a mode click.
 await evaluate('window.__BEFORE_RELOAD__=true');await send('Page.reload');
 for(let i=0;i<100;i++){if(!await evaluate('Boolean(window.__BEFORE_RELOAD__)'))break;await sleep(100);}
 await ready();checks.persistence=await evaluate(`({mode:window.__CAMERA_LAB__.summary().mode,open:!document.querySelector('.view-panel').hidden,advanced:document.querySelector('.view-advanced').open})`);assert(checks.persistence.mode==='B'&&checks.persistence.open&&!checks.persistence.advanced,'Persistence failed');
 const other=await send('Target.createTarget',{url:'about:blank'});await send('Target.activateTarget',{targetId:other.targetId});await sleep(2000);checks.hidden=await evaluate('document.visibilityState');await send('Target.activateTarget',{targetId:page.id});await send('Page.bringToFront');await sleep(800);checks.returned=await evaluate(`({status:document.querySelector('[data-scene-status]').dataset.sceneStatus,state:window.__CAMERA_LAB__.summary()})`);await send('Target.closeTarget',{targetId:other.targetId});assert(checks.hidden==='hidden'&&checks.returned.status==='ready','Background recovery failed');
 if(await evaluate('window.__CAMERA_LAB__.summary().paused'))await click('.view-primary');await sleep(2200);await click('.view-secondary');
 for(let i=0;i<120;i++){await sleep(250);if(await evaluate('!window.__CAMERA_LAB__.summary().replaying'))break;}
 checks.replay=await evaluate('window.__CAMERA_LAB__.summary()');assert(checks.replay.playing&&!checks.replay.replaying&&checks.replay.destination===1,'Replay did not return and restart');
 await click('.view-primary');await key('Escape');await shot('09-return');
 await sleep(200);
 checks.final=await evaluate(`({status:document.querySelector('[data-scene-status]').dataset.sceneStatus,scrollWidth:document.documentElement.scrollWidth,width:innerWidth})`);assert(checks.final.scrollWidth===width,'Horizontal overflow');assert(!errors.length,'Browser exceptions');
 writeFileSync(root+'/checks.json',JSON.stringify({checks,errors,source:spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim(),dirty:spawnSync('git',['diff','--name-only'],{encoding:'utf8'}).stdout.trim()},null,2));
 writeFileSync(root+'/motion.txt',frames.map((f,i)=>`file '${f.name}'\nduration ${i+1<frames.length?Math.max(.001,frames[i+1].time-f.time):.033}\n`).join(''));
 const encoded=spawnSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',root+'/motion.txt','-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-fps_mode','vfr','-c:v','libx264','-preset','veryfast','-threads','4','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',root+'/motion.mp4']);assert(encoded.status===0,'Encoding failed');console.log(root);
} catch(error) { writeFileSync(root+'/failure.json',JSON.stringify({error:String(error),checks,errors},null,2));throw error; }
finally {if(send)await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);socket?.close();browser.kill('SIGTERM');}
