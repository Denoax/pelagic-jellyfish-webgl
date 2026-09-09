// Read-only browser diagnostics. Does not modify either comparison checkout.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const [url, label='audit', mode='motion', duration='80'] = process.argv.slice(2);
const out=resolve(process.env.EVIDENCE_ROOT||'/home/mani/dev/jellyfish-studio/m5-rd-evidence',label);
mkdirSync(out,{recursive:true});
const width=Number(process.env.EVIDENCE_WIDTH||1280),height=Number(process.env.EVIDENCE_HEIGHT||900);
const profile=mkdtempSync(`${out}/browser-`), frames=[], errors=[];
const browser=spawn(resolve('scripts/brave-headless.sh'),['--headless=new','--no-sandbox','--hide-scrollbars','--use-gl=angle','--use-angle=gl','--enable-unsafe-webgpu','--remote-debugging-port=9279',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let socket,send;
try{
 let page;
 for(let i=0;i<100;i++){try{page=await(await fetch('http://127.0.0.1:9279/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(100);}}
 if(!page)throw Error('Browser unavailable');
 socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let next=0;const pending=new Map();
 send=(method,params={})=>new Promise((resolve,reject)=>{const id=++next;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p?.reject(Error(JSON.stringify(m.error))):p?.resolve(m.result);}
 else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);
 else if(m.method==='Page.screencastFrame'){const name=`frame-${String(frames.length).padStart(5,'0')}.jpg`;writeFileSync(`${out}/${name}`,Buffer.from(m.params.data,'base64'));frames.push({name,time:m.params.metadata.timestamp});void send('Page.screencastFrameAck',{sessionId:m.params.sessionId});}});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'));await send('Emulation.setVisibleSize',{width,height});};
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 if(mode!=='reference')await send('Page.addScriptToEvaluateOnNewDocument',{source:`let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};`});
 await send('Page.navigate',{url});await send('Page.bringToFront');
 if(mode==='reference'){
   await sleep(14000);await shot('entry');
   const dom=await evaluate(`({title:document.title,url:location.href,text:document.body.innerText.slice(0,16000),controls:[...document.querySelectorAll('button,a')].filter(e=>e.getBoundingClientRect().width).map(e=>({text:e.innerText.trim().slice(0,90),href:e.href,rect:(()=>{let r=e.getBoundingClientRect();return [r.x,r.y,r.width,r.height]})()})).slice(0,100)})`);
   writeFileSync(`${out}/page.json`,JSON.stringify(dom,null,2));
   if(process.env.REFERENCE_TRANSCRIPT==='1'){
     const transcript=await evaluate(`(async()=>{const p=window.ytInitialPlayerResponse,tracks=p?.captions?.playerCaptionsTracklistRenderer?.captionTracks||[];const track=tracks.find(t=>t.languageCode==='en')||tracks[0];return {tracks:tracks.map(t=>({name:t.name,language:t.languageCode})),text:track?await(await fetch(track.baseUrl)).text():null};})()`);
     writeFileSync(`${out}/transcript.json`,JSON.stringify(transcript,null,2));
     await evaluate(`document.querySelector('ytd-text-inline-expander #expand')?.click()`);await sleep(1200);
     const opened=await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/show transcript/i.test(b.textContent));b?.click();return Boolean(b)})()`);await sleep(3000);
     const segments=await evaluate(`({opened:${opened},text:[...document.querySelectorAll('ytd-transcript-segment-renderer')].map(e=>e.innerText).join(String.fromCharCode(10)),panels:[...document.querySelectorAll('ytd-engagement-panel-section-list-renderer')].map(e=>e.innerText.slice(0,100))})`);
     writeFileSync(`${out}/transcript-ui.json`,JSON.stringify(segments,null,2));
   }
   if(process.env.REFERENCE_CLICK){const [x,y]=process.env.REFERENCE_CLICK.split(',').map(Number);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x,y,button:'left',clickCount:1});await sleep(4000);}
   await send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:width,maxHeight:height,everyNthFrame:3});
   for(let i=0;i<4;i++){await sleep(4000);await shot(`view-${i}`);await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:width*.7,y:height*.55,deltaX:0,deltaY:450});}
 }else{
   let ready=false;for(let i=0;i<700;i++){ready=await evaluate(`document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`);if(ready)break;await sleep(100);}
   if(!ready)throw Error('Ocean not ready');
   await evaluate(`(async()=>{
     if(window.__CAMERA_LAB__){
       const lab=window.__CAMERA_LAB__;window.__RD_TRACE__=[];window.__RD_RIG__=lab;
       lab.onFrame=(target,time)=>{if(window.__RD_RECORD__){const c=lab.camera;window.__RD_TRACE__.push({time,wall:performance.now(),progress:lab.spring.position,position:c.position.toArray(),quaternion:c.quaternion.toArray(),fov:c.fov,target:c.position.toArray(),actors:lab.actors(),lab:lab.summary()});}};
       return;
     }
     const loaded=performance.getEntriesByType('resource').find(r=>r.name.includes('/src/scene/PelagicCameraRig.js'))?.name;
     if(!loaded)throw Error('Loaded camera module not found');
     const {PelagicCameraRig}=await import(loaded);
     const proto=PelagicCameraRig.prototype, original=proto.update;
     window.__RD_TRACE__=[];window.__RD_RIG__=null;
     proto.update=function(...args){
       if(this.journey&&!this.journey.__rdInstrumented){const protect=this.journey.protect;this.journey.__rdInstrumented=true;
         this.journey.protect=function(out,...rest){const p=out.position.clone(),t=out.target.clone();const r=protect.call(this,out,...rest);this.__rdCorrection={position:out.position.distanceTo(p),target:out.target.distanceTo(t)};return r;};}
       const r=original.apply(this,args);window.__RD_RIG__=this;
       if(window.__RD_RECORD__){const c=this.camera, d=args[3],lab=window.__CAMERA_LAB__;
         const actual=c.position.toArray(),planned=this.pose.position.toArray();
         window.__RD_TRACE__.push({time:args[2],wall:performance.now(),progress:args[0],position:actual,quaternion:c.quaternion.toArray(),fov:c.fov,bank:this.bank,planned,target:this.smoothedTarget.toArray(),directive:d?.target?.toArray(),strength:this.subjectStrength,correction:this.journey?.__rdCorrection||null,actors:window.__JELLYFISH_WORLD__.getSwarmState().actors,lab:lab?.summary()});
       }return r;};
   })()`);
   if(process.env.EVIDENCE_EVAL)await evaluate(process.env.EVIDENCE_EVAL);
   await sleep(6000);
   if(!await evaluate('!!window.__RD_RIG__'))throw Error('Camera telemetry hook did not attach to the live module');
   const info=await evaluate(`({browser:navigator.userAgent,viewport:[innerWidth,innerHeight],buffer:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height]),ratio:window.__JELLYFISH_WORLD__.pixelRatio,hardware:window.__SPECIMEN__?.rendererInfo(),world:window.__JELLYFISH_WORLD__,version:window.__SPECIMEN__?.state()})`);
   const sourceRoot=new URL(url).port==='5190'?resolve('../m5-approved-baseline'):new URL(url).port==='5191'?resolve('../site'):process.cwd();
   const sourceSHA=spawnSync('git',['-C',sourceRoot,'rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
   writeFileSync(`${out}/metadata.json`,JSON.stringify({url,label,mode,sourceSHA,sourceRoot,requestedSourceSHA:process.env.EVIDENCE_SOURCE_REV,uncommittedRuntime:spawnSync('git',['-C',sourceRoot,'diff','--name-only','--','src'],{encoding:'utf8'}).stdout.trim(),info,seed:7183,warmup:6},null,2));
   await evaluate(`window.__RD_RECORD__=true`);
   await shot('start');
   if(mode==='motion')await send('Page.startScreencast',{format:'jpeg',quality:89,maxWidth:width,maxHeight:height,everyNthFrame:2});
   const seconds=Number(duration), start=performance.now();let lastShot=-1;
   // Identical input schedule: hold, continuous traverse, hold, reverse, jump, settle.
   const profileName=process.env.CAMERA_INPUT||'normal';
   await evaluate(`(()=>{const start=performance.now(),duration=${seconds},profile=${JSON.stringify(profileName)};
     function input(now){const u=(now-start)/(duration*1000);let p=u<.08?0:u<.80?(u-.08)/.72:u<.86?1:u<.95?1-(u-.86)/.09:0;
       if(profile==='close')p=.10;if(profile==='school')p=.52;if(profile==='slow')p=Math.min(1,u);if(profile==='fast')p=u<.25?0:u<.5?.9:u<.75?.12:1;
       window.scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*p,behavior:'instant'});
       if(u<1)requestAnimationFrame(input);
     }requestAnimationFrame(input);
   })()`);
   while(performance.now()-start<seconds*1000){
     const t=(performance.now()-start)/1000,u=t/seconds;
     const section=Math.floor(u*8);
     if(mode==='motion'&&section>lastShot){await shot(`phase-${section}`);lastShot=section;}
     await sleep(33);
   }
   await evaluate(`window.__RD_RECORD__=false`);
   const trace=await evaluate('window.__RD_TRACE__');
   if(trace.length<30)throw Error('Insufficient live camera telemetry');
   if(trace.at(-1).wall-trace[0].wall < seconds*900)throw Error('Telemetry ended early, possibly because of HMR; discard this comparison');
   writeFileSync(`${out}/trace.json`,JSON.stringify(trace));
   await shot('end');
   if(process.env.EVIDENCE_AFTER){const check=await evaluate(process.env.EVIDENCE_AFTER);writeFileSync(`${out}/checks.json`,JSON.stringify(check,null,2));}
   if(process.env.EVIDENCE_LIFECYCLE==='1'){
     const before=await evaluate(`({lab:window.__CAMERA_LAB__?.summary(),position:window.__CAMERA_LAB__?.camera.position.toArray(),visible:document.visibilityState})`);
     const other=await send('Target.createTarget',{url:'about:blank'});await send('Target.activateTarget',{targetId:other.targetId});await sleep(5000);
     const hidden=await evaluate('document.visibilityState');
     await send('Target.activateTarget',{targetId:page.id});await send('Page.bringToFront');await sleep(500);
     const returned=await evaluate(`({lab:window.__CAMERA_LAB__?.summary(),position:window.__CAMERA_LAB__?.camera.position.toArray(),visible:document.visibilityState,status:document.querySelector('[data-scene-status]')?.dataset.sceneStatus})`);
     const sizes=[];for(const [w,h] of [[820,900],[390,844],[1280,900]]){await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});await sleep(700);sizes.push(await evaluate(`({size:[innerWidth,innerHeight],camera:window.__CAMERA_LAB__?.camera.position.toArray(),fov:window.__CAMERA_LAB__?.camera.fov,aspect:window.__CAMERA_LAB__?.camera.aspect,status:document.querySelector('[data-scene-status]')?.dataset.sceneStatus})`));}
     writeFileSync(`${out}/lifecycle.json`,JSON.stringify({before,hidden,returned,sizes},null,2));await send('Target.closeTarget',{targetId:other.targetId});
   }
 }
 if(frames.length){await send('Page.stopScreencast');await sleep(300);
   let concat='';frames.forEach((f,i)=>{concat+=`file '${f.name}'\nduration ${i+1<frames.length?Math.max(.001,frames[i+1].time-f.time):.033}\n`;});
   writeFileSync(`${out}/motion.txt`,concat);
   const result=spawnSync('/usr/bin/ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',`${out}/motion.txt`,'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-fps_mode','vfr','-c:v','libx264','-preset','veryfast','-threads','4','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/motion.mp4`],{encoding:'utf8'});
   if(result.status)throw Error(result.stderr);
 }
 writeFileSync(`${out}/result.json`,JSON.stringify({url,frames:frames.length,seconds:frames.length?(frames.at(-1).time-frames[0].time):0,errors},null,2));
 console.log(out);
}finally{if(send)await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);socket?.close();browser.kill('SIGTERM');}
