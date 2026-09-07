// Local browser evidence only. Real-time CDP screencast timestamps preserve motion speed.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const [url='http://127.0.0.1:5178/?idle=300', label='baseline', mode='capture', seconds='24'] = process.argv.slice(2);
const out=resolve('docs/implementation/milestone-1/evidence',label);
mkdirSync(out,{recursive:true});
const profile=mkdtempSync('/tmp/pelagic-specimen-browser-');
const browser=spawn(resolve('scripts/brave-headless.sh'),['--headless=new','--no-sandbox','--hide-scrollbars','--window-size=1280,1000','--use-gl=angle','--use-angle=gl','--enable-unsafe-webgpu','--remote-debugging-port=9279',`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let ws,send; const errors=[],frames=[];
try {
 let page;
 for(let i=0;i<100;i++){try{page=await(await fetch('http://127.0.0.1:9279/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(100);}}
 if(!page)throw Error('Browser unavailable');
 ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let id=0;const pending=new Map();
 send=(method,params={})=>new Promise((res,rej)=>{const n=++id;pending.set(n,{res,rej});ws.send(JSON.stringify({id:n,method,params}));});
 ws.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p?.rej(Error(JSON.stringify(m.error))):p?.res(m.result);}
 else if(m.method==='Runtime.exceptionThrown'||(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'))errors.push(m.params);
 else if(m.method==='Page.screencastFrame'){const name=`motion-${String(frames.length).padStart(5,'0')}.jpg`;writeFileSync(`${out}/${name}`,Buffer.from(m.params.data,'base64'));frames.push({name,time:m.params.metadata.timestamp});send('Page.screencastFrameAck',{sessionId:m.params.sessionId});}});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};`});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(navigator.gpu){const request=navigator.gpu.requestAdapter.bind(navigator.gpu);navigator.gpu.requestAdapter=async (...args)=>{const a=await request(...args);window.__actualAdapter=a?{vendor:a.info?.vendor,device:a.info?.device,architecture:a.info?.architecture,description:a.info?.description,isFallbackAdapter:a.isFallbackAdapter}:null;return a;};}`});
 await send('Page.navigate',{url});
 let ready=false;
 if(mode==='reference'){await sleep(8000);ready=true;}
 else for(let i=0;i<300;i++){ready=await evaluate(`document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`);if(ready)break;await sleep(100);}
 if(!ready)throw Error('Scene did not become ready: '+JSON.stringify(errors));
 await sleep(6000);
 const info=await evaluate(`({userAgent:navigator.userAgent,backend:window.__JELLYFISH_WORLD__?.renderer,ratio:window.__JELLYFISH_WORLD__?.pixelRatio,viewport:[innerWidth,innerHeight],buffers:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height]),specimen:window.__SPECIMEN__?.state(),hardware:window.__SPECIMEN__?.rendererInfo(),bloom:'production direct rendering; bloom disabled'})`);
 info.sourceRevision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
 info.uncommittedSource=spawnSync('git',['diff','--name-only','--','src'],{encoding:'utf8'}).stdout.trim();
 const system={adapter:await evaluate(`window.__actualAdapter||null`),browser:await send('Browser.getVersion')};
 if(process.env.EVIDENCE_EVAL)await evaluate(process.env.EVIDENCE_EVAL);
 if(mode==='perf'){
   await evaluate(`window.__SPECIMEN__?.resetIntervals()`);
   const intervals=await evaluate(`new Promise(resolve=>{const a=[];let last=0;const start=performance.now();function tick(t){if(last)a.push(t-last);last=t;if(t-start<${Number(seconds)*1000})requestAnimationFrame(tick);else resolve(a);}requestAnimationFrame(tick);})`);
   const sorted=[...intervals].sort((a,b)=>a-b);
   writeFileSync(`${out}/performance.json`,JSON.stringify({url,info,system,seconds:Number(seconds),warmupSeconds:6,median:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],max:sorted.at(-1),stallsOver50:intervals.filter(x=>x>50).length,intervals,renderIntervals:await evaluate(`window.__SPECIMEN__?.frameIntervals()`),errors,after:await evaluate(`({ratio:window.__JELLYFISH_WORLD__?.pixelRatio,specimen:window.__SPECIMEN__?.state()})`)},null,2));
 }else{
   const shot=async name=>{const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'));};
   if(mode==='lifecycle'){
     const key=async key=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key,code:key,windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code:key,windowsVirtualKeyCode:27});};
     await shot('idle-entry');
     const idleBefore=await evaluate(`!!document.querySelector('.idle-screen.is-active')`);
     await key('Escape');await sleep(2900);
     const idleAfter=await evaluate(`!!document.querySelector('.idle-screen.is-active')`);
     const point=await evaluate(`window.__JELLYFISH_WORLD__.getJellyScreenPoint(0)`);
     const activationsBefore=await evaluate(`window.__JELLYFISH_WORLD__.activationCount`);
     for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:type==='mouseMoved'?'none':'left',clickCount:1});
     await sleep(150);await shot('returned-and-activated');
     const activationsAfter=await evaluate(`window.__JELLYFISH_WORLD__.activationCount`);
     const beforeFreeze=await evaluate(`window.__SPECIMEN__.state()`);
     const other=await send('Target.createTarget',{url:'about:blank'});
     const backgroundVisibility=await evaluate(`document.visibilityState`);
     await sleep(1800);await send('Page.bringToFront');await sleep(60);
     const afterFreeze=await evaluate(`window.__SPECIMEN__?.state()||{missing:true,status:document.querySelector('[data-scene-status]')?.dataset.sceneStatus,url:location.href}`);
     await send('Target.closeTarget',{targetId:other.targetId});
     writeFileSync(`${out}/lifecycle.json`,JSON.stringify({url,info,idleBefore,idleAfter,activationsBefore,activationsAfter,beforeFreeze,afterFreeze,backgroundVisibility,errors},null,2));
   }else if(mode==='matched'){
     let matched=false;
     const target=Number(new URL(url).searchParams.get('hold')||9);
     for(let i=0;i<1200;i++){matched=await evaluate(`window.__SPECIMEN__?.state().time>=${target}`);if(matched)break;await sleep(100);}
     for(const [angle,distance] of [['oblique','medium'],['side','near'],['underside','near'],['top','near'],['oblique','far']]){
       await evaluate(`window.__SPECIMEN__.view('${angle}','${distance}')`);await sleep(120);await shot(`${angle}-${distance}`);
     }
     writeFileSync(`${out}/matched.json`,JSON.stringify({url,info,system,matched,state:await evaluate(`window.__SPECIMEN__.state()`),errors},null,2));
     console.log(out);process.exitCode=0;
   }else{
   await shot('opening');
   await send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:1280,maxHeight:900,everyNthFrame:2});
   if(mode==='tour'){
     await sleep(12000);
     const chamber=await evaluate(`window.__SPECIMEN__?.state().chamber`);
     if(chamber)await evaluate(`window.__SPECIMEN__.view('side','near')`);
     else await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.07)`);
     await sleep(4000);
     const point=await evaluate(`window.__JELLYFISH_WORLD__.getJellyScreenPoint(0)`);
     for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:type==='mouseMoved'?'none':'left',clickCount:1});
     await sleep(6000);
     await shot('activation-return');
     if(chamber)await evaluate(`window.__SPECIMEN__.view('oblique','medium')`);
     await sleep(Math.max(0,Number(seconds)-22)*1000);
   }else await sleep(Number(seconds)*1000);
   await send('Page.stopScreencast');await sleep(300);
   await shot('ending');
   if(frames.length>1){let concat='';frames.forEach((f,i)=>{concat+=`file '${f.name}'\nduration ${i+1<frames.length?Math.max(.001,frames[i+1].time-f.time):.033}\n`;});writeFileSync(`${out}/motion.txt`,concat);const result=spawnSync('/usr/bin/ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',`${out}/motion.txt`,'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-fps_mode','vfr','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/motion.mp4`],{encoding:'utf8'});if(result.status)throw Error(result.stderr);}
   writeFileSync(`${out}/capture.json`,JSON.stringify({url,info,system,seconds:Number(seconds),frames:frames.length,errors,after:await evaluate(`({state:window.__SPECIMEN__?.state(),activationCount:window.__JELLYFISH_WORLD__?.activationCount,lastActivated:window.__JELLYFISH_WORLD__?.lastActivated})`)},null,2));
   }
 }
 console.log(JSON.stringify({out,mode,errors:errors.length,info}));
}finally{if(send)await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);ws?.close();browser.kill('SIGTERM');}
