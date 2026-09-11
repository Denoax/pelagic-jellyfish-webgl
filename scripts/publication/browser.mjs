// Publication tooling only. No import into the artwork.
import {spawn,spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createServer} from 'node:net';
export const wait=ms=>new Promise(r=>setTimeout(r,ms));
export const runtimeSha='bce3571b0300ecfe5dc6e5dd45f28a9cda57006e';
export const json=(path,value)=>writeFileSync(path,JSON.stringify(value,null,2)+'\n');
export async function browser(out,width=1280,height=900){
 mkdirSync(out,{recursive:true});
 const port=await new Promise(r=>{const s=createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>r(p));});});
 const executable=process.env.BROWSER_EXECUTABLE||'chromium';
 const launch=spawn(executable,[...JSON.parse(process.env.BROWSER_ARGUMENTS||'[]'),'--headless=new','--no-sandbox','--hide-scrollbars','--use-gl=angle','--use-angle=gl',`--remote-debugging-port=${port}`,`--user-data-dir=${mkdtempSync(join(out,'browser-profile-'))}`,'about:blank'],{stdio:'ignore'});
 let launchError;launch.on('error',e=>{launchError=e;});
 let page;for(let i=0;i<200;i++){if(launchError)throw launchError;try{page=await(await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();break;}catch{await wait(100);}}
 if(!page)throw Error('Chromium CDP startup failed');
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let serial=0,recording=null;const pending=new Map(),errors=[];
 const send=(method,params={})=>new Promise((yes,no)=>{pending.set(++serial,{yes,no});ws.send(JSON.stringify({id:serial,method,params}));});
 ws.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.no(Error(JSON.stringify(m.error))):p.yes(m.result);}else if(m.method==='Runtime.exceptionThrown'||m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params);else if(m.method==='Page.screencastFrame'){
  if(recording){const name=`frame-${String(recording.frames.length).padStart(6,'0')}.jpg`;writeFileSync(join(recording.path,name),Buffer.from(m.params.data,'base64'));recording.frames.push({name,time:m.params.metadata.timestamp});}
  void send('Page.screencastFrameAck',{sessionId:m.params.sessionId});
 }});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const until=async(expression,timeout=90000)=>{const end=Date.now()+timeout;while(Date.now()<end){if(await ev(expression))return;await wait(100);}throw Error('Timed out: '+expression);};
 const navigate=async url=>{await send('Page.navigate',{url});await until(`document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`);await send('Page.bringToFront');};
 const shot=async path=>writeFileSync(path,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 const key=async(key,code=key)=>{for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:key==='Enter'?13:key==='Escape'?27:undefined});};
 const record=async path=>{mkdirSync(path,{recursive:true});recording={path,frames:[]};await send('Page.startScreencast',{format:'jpeg',quality:95,maxWidth:width,maxHeight:height,everyNthFrame:2});};
 const finish=async()=>{
  await send('Page.stopScreencast');await wait(200);const r=recording;recording=null;if(r.frames.length<2)throw Error('No browser motion frames');
  json(join(r.path,'frame-timestamps.json'),r.frames);
  writeFileSync(join(r.path,'frames.ffconcat'),'ffconcat version 1.0\n'+r.frames.map((f,i)=>`file '${f.name}'\nduration ${i+1<r.frames.length?Math.max(.001,r.frames[i+1].time-f.time):1/30}\n`).join(''));
  const ff=spawnSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',join(r.path,'frames.ffconcat'),'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-r','30','-c:v','libx264','-threads','4','-preset','slow','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',join(r.path,'motion.mp4')],{encoding:'utf8'});if(ff.status)throw Error(ff.stderr);
  return{frames:r.frames.length,durationSeconds:r.frames.at(-1).time-r.frames[0].time,sourceFps:(r.frames.length-1)/(r.frames.at(-1).time-r.frames[0].time),encodedFps:30};
 };
 const state=()=>ev(`({renderer:__SPECIMEN__.rendererInfo(),camera:window.__CAMERA_LAB__?.summary(),pose:__JELLYFISH_WORLD__.getCameraState(),simulation:__SPECIMEN__.state(),population:window.__POPULATION__?.state().counts,current:window.__CONNECTED_OCEAN__?.state(),idle:window.__OCEAN_IDLE__?.state(),optics:window.__LIVE_LENS__?.state?.(),dpr:__JELLYFISH_WORLD__.pixelRatio,viewport:{width:innerWidth,height:innerHeight}})`);
 const close=async()=>{await Promise.race([send('Browser.close').catch(()=>{}),wait(1000)]);ws.close();launch.kill('SIGTERM');};
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 const{windowId}=await send('Browser.getWindowForTarget');await send('Browser.setWindowBounds',{windowId,bounds:{width:width+20,height:height+100}});await send('Emulation.setVisibleSize',{width,height});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`let publicationSeed=7183;Math.random=()=>{publicationSeed=(Math.imul(publicationSeed,1664525)+1013904223)>>>0;return publicationSeed/4294967296;};`});
 return{send,ev,until,navigate,shot,key,record,finish,state,close,errors,version:()=>send('Browser.getVersion')};
}

export async function setView(b,mode,progress){await b.ev(`__CAMERA_LAB__.select(${JSON.stringify(mode)});__CAMERA_LAB__.seek(${progress})`);await wait(1300);}
export async function enterIdle(b){await b.ev(`document.activeElement.blur();history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await b.until(`window.__OCEAN_IDLE__?.state().active`);}
export async function exitIdle(b){await b.ev(`history.replaceState(null,'','?idle=300')`);await b.key('Enter');await wait(1300);}
