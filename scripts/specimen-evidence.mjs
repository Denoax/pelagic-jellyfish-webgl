// Local browser evidence only. Real-time CDP screencast timestamps preserve motion speed.
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { installOceanCompletionProbe } from './ocean-completion-probe.mjs';
const [url='http://127.0.0.1:5178/?idle=300', label='baseline', mode='capture', seconds='24'] = process.argv.slice(2);
const out=resolve(process.env.EVIDENCE_ROOT || 'docs/implementation/milestone-1/evidence',label);
const width=Number(process.env.EVIDENCE_WIDTH || 1280), height=Number(process.env.EVIDENCE_HEIGHT || 900);
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
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`(()=>{
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(...args){
     const context=original.apply(this,args);
     if(args[0]==='webgl2' && context && !window.__AUDIT_GL__){
       const ext=context.getExtension('WEBGL_debug_renderer_info');
       window.__AUDIT_GL__={version:context.getParameter(context.VERSION),gpu:ext?context.getParameter(ext.UNMASKED_RENDERER_WEBGL):'not exposed'};
     }
     return context;
   };
 })();`});
 await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:process.env.EVIDENCE_MOBILE==='1'});
 // Read-only measurement in the actual shipped page. The ocean's asynchronous
 // rAF callback resolves after await app.update(). Observe that completion,
 // not a second independent rAF loop. Reject hidden/busy callbacks.
 if(mode==='perf')await send('Page.addScriptToEvaluateOnNewDocument',{source:`(${installOceanCompletionProbe.toString()})();`});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};`});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`if(navigator.gpu){const request=navigator.gpu.requestAdapter.bind(navigator.gpu);navigator.gpu.requestAdapter=async (...args)=>{const a=await request(...args);window.__actualAdapter=a?{vendor:a.info?.vendor,device:a.info?.device,architecture:a.info?.architecture,description:a.info?.description,isFallbackAdapter:a.isFallbackAdapter}:null;return a;};}`});
 await send('Page.navigate',{url});
 await send('Page.bringToFront');
 let ready=false;
 if(mode==='reference'){await sleep(8000);ready=true;}
 else for(let i=0;i<300;i++){ready=await evaluate(`document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`);if(ready)break;await sleep(100);}
 if(!ready)throw Error('Scene did not become ready: '+JSON.stringify(errors));
 await send('Page.bringToFront');
 await sleep(6000);
 const info=await evaluate(`({userAgent:navigator.userAgent,backend:window.__JELLYFISH_WORLD__?.renderer,ratio:window.__JELLYFISH_WORLD__?.pixelRatio,viewport:[innerWidth,innerHeight],buffers:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height]),specimen:window.__SPECIMEN__?.state(),hardware:window.__SPECIMEN__?.rendererInfo(),bloom:'production direct rendering; bloom disabled'})`);
 info.driverRevision=spawnSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).stdout.trim();
 info.sourceRevision=process.env.EVIDENCE_SOURCE_REV || info.driverRevision;
 info.sourceIdentity=process.env.EVIDENCE_SOURCE_REV?'explicit source checkout/release; verify against deployment or worktree':'driver checkout only; may differ from target URL';
 info.release=await evaluate(`window.__JELLYFISH_WORLD__?.oceanRelease`);
 info.hasSpecimenControls=await evaluate(`Boolean(window.__SPECIMEN__)`);
 info.visibility=await evaluate(`document.visibilityState`);
 if(info.visibility!=='visible')throw Error('Evidence page lost foreground visibility during warm-up');
 info.actualGL=await evaluate(`window.__AUDIT_GL__||null`);
 info.loadedScripts=await evaluate(`[...document.scripts].map(s=>s.src).filter(Boolean)`);
 info.uncommittedSource=spawnSync('git',['diff','--name-only','--','src'],{encoding:'utf8'}).stdout.trim();
 const system={adapter:await evaluate(`window.__actualAdapter||null`),browser:await send('Browser.getVersion')};
 if(process.env.EVIDENCE_EVAL)await evaluate(process.env.EVIDENCE_EVAL);
 if(mode==='perf' && process.env.EVIDENCE_BUBBLE_STATE){
   const peak=process.env.EVIDENCE_BUBBLE_STATE==='peak';
   const hold=peak?Number(process.env.EVIDENCE_HOLD||24):9;
   await evaluate(`window.__SPECIMEN__.holdAt(${hold})`);
   if(peak){
     await evaluate(`new Promise(resolve=>{function tick(){if(window.__SPECIMEN__.state().time>=17.5){window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.35);resolve();}else requestAnimationFrame(tick);}tick();})`);
   }
   await evaluate(`new Promise(resolve=>{function tick(){if(window.__SPECIMEN__.state().time>=${hold}-1e-7)resolve();else requestAnimationFrame(tick);}tick();})`);
   await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').map(r=>r.name).find(n=>n.includes('/three_tsl.js'));const {time}=await import(url);time.update=()=>{time.value=${hold};};window.__LIVE_LENS__?.anchor();})()`);
   await sleep(1000);
   await evaluate(`window.__BENCH_STATE__={time:window.__SPECIMEN__.state().time,camera:window.__JELLYFISH_WORLD__.getCameraState(),actors:window.__JELLYFISH_WORLD__.getSwarmState(),field:window.__CONNECTED_OCEAN__.state(),shaderClock:${hold}}`);
 }
 info.controlledState=await evaluate(`window.__BENCH_STATE__||null`);
 if(mode==='perf'){
   await evaluate(`window.__SPECIMEN__?.resetIntervals()`);
   await evaluate(`window.__AUDIT_RENDER__.reset()`);
   await evaluate(`window.__CONNECTED_OCEAN__?.resetCost()`);
   await evaluate(`window.__LIVE_LENS__?.resetCost()`);
   await evaluate(`window.__BUBBLE_PASSAGE__?.resetCost()`);
   const intervals=await evaluate(`new Promise(resolve=>{const a=[];let last=0;const start=performance.now();function tick(t){if(last)a.push(t-last);last=t;if(t-start<${Number(seconds)*1000})requestAnimationFrame(tick);else resolve(a);}requestAnimationFrame(tick);})`);
   const sorted=[...intervals].sort((a,b)=>a-b);
   writeFileSync(`${out}/lens-cost.json`,JSON.stringify({cpu:await evaluate(`window.__LIVE_LENS__?.cost()`),state:await evaluate(`window.__LIVE_LENS__?.state()`)},null,2));
   writeFileSync(`${out}/bubble-cost.json`,JSON.stringify({cpu:await evaluate(`window.__BUBBLE_PASSAGE__?.cost()`),state:await evaluate(`window.__BUBBLE_PASSAGE__?.state()`)},null,2));
   writeFileSync(`${out}/performance.json`,JSON.stringify({url,info,system,seconds:Number(seconds),warmupSeconds:6,median:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],max:sorted.at(-1),stallsOver50:intervals.filter(x=>x>50).length,intervals,renderIntervals:await evaluate(`window.__SPECIMEN__?.frameIntervals()`),auditRender:await evaluate(`window.__AUDIT_RENDER__.read()`),featureCpuIntervals:await evaluate(`window.__CONNECTED_OCEAN__?.cost()`),errors,after:await evaluate(`({ratio:window.__JELLYFISH_WORLD__?.pixelRatio,buffers:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height]),specimen:window.__SPECIMEN__?.state(),connected:window.__CONNECTED_OCEAN__?.state()})`)},null,2));
 }else{
   const lensRecording=mode==='lens-optics'||mode==='lens-tour'||mode==='bubble-tour'||mode==='bubble-inspect';
   const finishRecording=async()=>{
     await send('Page.stopScreencast');await sleep(300);
     if(frames.length<2)throw Error('Motion evidence missing: fewer than two screencast frames');
     let concat='';frames.forEach((f,i)=>{concat+=`file '${f.name}'\nduration ${i+1<frames.length?Math.max(.001,frames[i+1].time-f.time):.033}\n`;});
     writeFileSync(`${out}/motion.txt`,concat);
     const result=spawnSync('/usr/bin/ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',`${out}/motion.txt`,'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-fps_mode','vfr','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/motion.mp4`],{encoding:'utf8'});
     if(result.status)throw Error(result.stderr);
     writeFileSync(`${out}/motion-metadata.json`,JSON.stringify({url,info,system,frames:frames.length,duration:frames.at(-1).time-frames[0].time,errors},null,2));
   };
   const shot=async name=>{
     const r=await send('Page.captureScreenshot',{format:'png'});
     writeFileSync(`${out}/${name}.png`,Buffer.from(r.data,'base64'));
     // Capture can restore container dimensions despite overridden CSS metrics.
     // Keep subsequent screencast frames at the requested size, without padding.
     await send('Emulation.setVisibleSize',{width,height});
   };
   const clickJelly=async(index=0)=>{
     const point=await evaluate(`window.__JELLYFISH_WORLD__.getJellyScreenPoint(${index})`);
     const before=await evaluate(`window.__JELLYFISH_WORLD__.activationCount`);
     for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:type==='mouseMoved'?'none':'left',clickCount:1});
     const after=await evaluate(`window.__JELLYFISH_WORLD__.activationCount`);
     return {point,before,after,hit:after>before};
   };
   const state=()=>evaluate(`({visibility:document.visibilityState,specimen:window.__SPECIMEN__?.state(),connected:window.__CONNECTED_OCEAN__?.state(),camera:window.__JELLYFISH_WORLD__?.getCameraState(),actors:window.__JELLYFISH_WORLD__?.getSwarmState(),activationCount:window.__JELLYFISH_WORLD__?.activationCount,bubbles:window.__BUBBLE_PASSAGE__?.state()})`);
   const nearbyPair=()=>evaluate(`(()=>{const a=window.__JELLYFISH_WORLD__.getSwarmState().actors;let pair=null,best=5.2;for(let i=0;i<a.length;i++){if(a[i].presence<.2)continue;const p=window.__JELLYFISH_WORLD__.getJellyScreenPoint(i);if(p.x<20||p.x>innerWidth-20||p.y<20||p.y>innerHeight-20)continue;for(let j=0;j<a.length;j++){if(i===j||a[j].presence<.2)continue;const d=Math.hypot(...a[i].position.map((v,k)=>v-a[j].position[k]));if(d<best){best=d;pair={index:i,neighbor:j,distance:d};}}}return pair;})()`);
   if(mode==='bubble-life'){
     const checkpoints=[];
     const scroll=p=>evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*${p})`);
     await scroll(.35);await sleep(5000);checkpoints.push({stage:'active',state:await state()});
     const other=await send('Target.createTarget',{url:'about:blank'});
     const before=await state();await sleep(2000);await send('Page.bringToFront');await sleep(100);
     checkpoints.push({stage:'background-return',before,after:await state()});await send('Target.closeTarget',{targetId:other.targetId});
     for(const [w,h] of [[900,900],[390,844],[1280,900]]){
       await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
       await send('Emulation.setVisibleSize',{width:w,height:h});await scroll(.35);await sleep(650);
       const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/resize-${w}-${h}.png`,Buffer.from(r.data,'base64'));
       checkpoints.push({stage:'resize',viewport:[w,h],state:await state()});
     }
     checkpoints.push({stage:'activation',click:await clickJelly(2)});
     for(let i=0;i<5;i++){
       await scroll(i%2?.15:.6);await sleep(4000);checkpoints.push({stage:'outside',state:await state()});
       await scroll(.35);await sleep(6000);checkpoints.push({stage:'reentered',state:await state()});
     }
     await sleep(13000);await shot('finished-calm');checkpoints.push({stage:'exhausted',state:await state()});
     writeFileSync(`${out}/lifecycle.json`,JSON.stringify({checkpoints,errors},null,2));
   }else if(mode==='bubble-tour'||mode==='bubble-inspect'){
     const checkpoints=[];
     const capture=async name=>{await shot(name);checkpoints.push({name,state:await state(),bubbles:await evaluate(`window.__BUBBLE_PASSAGE__?.state()`)});};
     const scroll=p=>evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*${p})`);
     if(mode==='bubble-inspect'){
       await scroll(.35);
       if(process.env.EVIDENCE_MATCH_CROSSING==='1'){
         let crossing=null, closest=Infinity;
         for(let i=0;i<260;i++){
           const pair=await evaluate(`(()=>{const target=window.__JELLYFISH_WORLD__.getJellyScreenPoint(2);const h=window.__BUBBLE_PASSAGE__.state().heroesDetail.filter(h=>h.alpha>.8).map(h=>({...h,distance:Math.hypot(h.screen[0]-target.x,h.screen[1]-target.y)})).sort((a,b)=>a.distance-b.distance)[0];return h?{target,hero:h}:null;})()`);
           if(pair){closest=Math.min(closest,pair.hero.distance);if(pair.hero.distance<50){crossing=pair;break;}}
           await sleep(50);
         }
         if(!crossing)throw Error('No natural bell crossing; closest pixel distance '+closest);
         checkpoints.push({name:'natural-bell-crossing',crossing});
       }else await sleep(6500);
       await evaluate(`window.__SPECIMEN__.pause()`);
       await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').map(r=>r.name).find(n=>n.includes('/three_tsl.js'));const {time}=await import(url);const update=time.update,value=time.value;time.update=()=>{time.value=value;};window.__RESTORE_QA_TIME__=()=>{time.update=update;};})()`);
       await sleep(100);await capture('matched-bubbles');
       await evaluate(`window.__BUBBLE_PASSAGE__.optics(false)`);await sleep(100);await capture('matched-ambient-only');
       await evaluate(`window.__BUBBLE_PASSAGE__.optics(true)`);
       await evaluate(`window.__BUBBLE_PASSAGE__.enable(false)`);await sleep(100);await capture('matched-clear');
       await evaluate(`window.__BUBBLE_PASSAGE__.enable(true);window.__RESTORE_QA_TIME__();window.__SPECIMEN__.resume()`);
       await send('Emulation.setVisibleSize',{width,height});
       await send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:width,maxHeight:height,everyNthFrame:2});
       await sleep(8000);await capture('settled');
     }else{
       await scroll(.23);await sleep(4500);
       await send('Emulation.setVisibleSize',{width,height});
       await send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:width,maxHeight:height,everyNthFrame:2});
       await capture('calm');await sleep(2000);
       const started=performance.now();let nextShot=3;
       while(performance.now()-started<22000){
         const t=(performance.now()-started)/22000;
         await scroll(.23+t*.27);
         if((performance.now()-started)/1000>=nextShot){await capture(`passage-${nextShot}`);nextShot+=3;}
         await sleep(45);
       }
       await scroll(.51);await sleep(4500);await capture('return-to-calm');
     }
     writeFileSync(`${out}/bubbles.json`,JSON.stringify({checkpoints,errors},null,2));
   }else if(mode==='lens-optics'||mode==='lens-tour'){
     await evaluate(`window.__SPECIMEN__.holdAt(9)`);
     for(let i=0;i<600;i++){if(await evaluate(`window.__SPECIMEN__.state().time>=9-1e-7`))break;await sleep(50);}
     // Inspection only: existing SoftParticles/background use TSL render time
     // even while animal simulation is held. Pin the installed singleton during
     // matched stills, restore its exact callback before any motion recording.
     await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').map(r=>r.name).find(n=>n.includes('/three_tsl.js'));if(!url)throw Error('TSL clock module not found');const {time}=await import(url);const update=time.update;time.update=()=>{time.value=9;};window.__RESTORE_QA_TIME__=()=>{time.update=update;delete window.__RESTORE_QA_TIME__;};})()`);
     await evaluate(`window.__LIVE_LENS__?.anchor()`);await sleep(150);
     await evaluate(`window.__LIVE_LENS__?.enable(false)`);await sleep(150);await shot('matched-no-lens');
     await sleep(150);await shot('matched-direct-repeat');
     await evaluate(`window.__LIVE_LENS__?.enable(true);window.__LIVE_LENS__?.optics(0)`);await sleep(150);await shot('matched-passthrough');
     await evaluate(`window.__LIVE_LENS__?.optics(1)`);await sleep(150);await shot('matched-lens');
     writeFileSync(`${out}/lens.json`,JSON.stringify({state:await state(),lens:await evaluate(`window.__LIVE_LENS__?.state()`),errors},null,2));
     await evaluate(`window.__RESTORE_QA_TIME__()`);
     await evaluate(`window.__SPECIMEN__.resume()`);
     await send('Emulation.setVisibleSize',{width,height});
     await send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:width,maxHeight:height,everyNthFrame:2});
     await evaluate(`window.__LIVE_LENS__?.enable(false)`);await sleep(2500);
     await evaluate(`window.__LIVE_LENS__?.enable(true)`);
     await sleep(6000);await shot('crossing');await sleep(6000);await shot('leaving');
     if(mode==='lens-tour'){
       const checkpoints=[];
       const drag=async(dx,dy)=>{
         await evaluate(`window.__LIVE_LENS__?.anchor()`);await sleep(200);
         const x=width*.57,y=height*.49;
         await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',modifiers:8,clickCount:1});
         for(let i=1;i<=45;i++){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+dx*i/45,y:y+dy*i/45,button:'left',buttons:1,modifiers:8});await sleep(25);}
         await sleep(500);await shot('deformed');checkpoints.push({stage:'deformed',lens:await evaluate(`window.__LIVE_LENS__?.state()`)});
         await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+dx,y:y+dy,button:'left',modifiers:8,clickCount:1});
         await sleep(800);await shot('recovering');await sleep(4500);await shot('recovered');
         checkpoints.push({stage:'recovered',lens:await evaluate(`window.__LIVE_LENS__?.state()`)});
       };
       await drag(Math.min(130,width*.17),-70);
       checkpoints.push({click:await clickJelly()});await sleep(2400);await shot('activated-through-lens');await sleep(6500);
       await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.07)`);await sleep(6500);
       await evaluate(`window.__LIVE_LENS__?.anchor()`);await sleep(200);await shot('close-lens');await drag(-90,55);
       await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.52)`);await sleep(9000);
       await evaluate(`window.__LIVE_LENS__?.anchor()`);await sleep(200);await shot('depth-and-transparency');
       writeFileSync(`${out}/tour.json`,JSON.stringify({checkpoints,lens:await evaluate(`window.__LIVE_LENS__?.state()`),errors},null,2));
     }
     await sleep(6000);
   }else if(mode==='lens-recovery'){
     const before=await evaluate(`window.__LIVE_LENS__.state()`);
     await evaluate(`document.querySelector('.ocean-stage canvas').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext()`);
     await sleep(800);await shot('context-lost');
     const failed=await evaluate(`document.querySelector('[data-scene-status]').dataset.sceneStatus`);
     await send('Page.reload');let recovered=false;
     for(let i=0;i<300;i++){recovered=await evaluate(`document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`);if(recovered)break;await sleep(100);}
     await sleep(7000);await shot('reloaded-ocean');
     writeFileSync(`${out}/recovery.json`,JSON.stringify({before,failed,recovered,after:await evaluate(`window.__LIVE_LENS__?.state()`),errors},null,2));
   }else if(mode==='lens-resize'){
     const checkpoints=[];
     for(const [w,h] of [[1280,900],[900,900],[390,844],[1280,900]]){
       await send('Emulation.setDeviceMetricsOverride',{width:w,height:h,deviceScaleFactor:1,mobile:false});
       await send('Emulation.setVisibleSize',{width:w,height:h});await sleep(1200);
       const r=await send('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/resize-${w}-${h}.png`,Buffer.from(r.data,'base64'));
       checkpoints.push({viewport:[w,h],lens:await evaluate(`window.__LIVE_LENS__?.state()`),state:await state()});
     }
     writeFileSync(`${out}/resize.json`,JSON.stringify({checkpoints,errors},null,2));
   }else if(mode==='ocean-matched'||mode==='pulse-matched'){
     const snapshots=[];
     for(const target of mode==='pulse-matched'?[9,10,10.6,11.5,13,16]:[9,9.8,11,13,17]){
       await evaluate(`window.__SPECIMEN__.holdAt(${target})`);
       let held=false;
       for(let i=0;i<1200;i++){held=await evaluate(`window.__SPECIMEN__.state().time>=${target}-1e-7`);if(held)break;await sleep(50);}
       if(!held)throw Error('Matched ocean did not reach '+target);
       await shot(`time-${target}`); snapshots.push(await state());
       if(target===9&&mode==='ocean-matched')snapshots.push({click:await clickJelly()});
     }
     writeFileSync(`${out}/matched.json`,JSON.stringify({url,info,system,snapshots,errors},null,2));
   }else if(mode==='observe'){
     const checkpoints=[], clicks=[];
     for(let i=0;i<12;i++){clicks.push(await clickJelly());await sleep(100);}
     const start=performance.now();let step=0;
     while(performance.now()-start<Number(seconds)*1000){
       if(step===15)await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.28)`);
       if(step===35)await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.52)`);
       if(step===55)await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.88)`);
       if(step===70)await evaluate(`window.scrollTo(0,0)`);
       if(step===20||step===40){
         // Choose an existing visible animal with a genuinely nearby partner;
         // do not reposition the school to manufacture the secondary response.
         const pair=await nearbyPair();
         clicks.push({pair,click:pair?await clickJelly(pair.index):null});
       }
       if(step===22||step===42)await shot(`nearby-response-${step}`);
       checkpoints.push({wallSeconds:(performance.now()-start)/1000,state:await state()});
       await sleep(2000);step++;
     }
     await shot('long-observation-end');
     const durationSeconds=(performance.now()-start)/1000;
     const simulationAdvance=checkpoints.at(-1).state.connected.time-checkpoints[0].state.connected.time;
     const valid=simulationAdvance>durationSeconds*.8&&checkpoints.every(c=>c.state.visibility==='visible');
     writeFileSync(`${out}/observation.json`,JSON.stringify({url,info,system,durationSeconds,simulationAdvance,valid,clicks,checkpoints,errors},null,2));
     if(!valid)throw Error('Observation invalid: simulation stalled or page lost foreground visibility');
   }else if(mode==='lifecycle'){
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
     const beforeFreeze=await evaluate(`window.__SPECIMEN__?.state()||null`);
     const connectedBeforeFreeze=await evaluate(`window.__CONNECTED_OCEAN__?.state()`);
     const other=await send('Target.createTarget',{url:'about:blank'});
     const backgroundVisibility=await evaluate(`document.visibilityState`);
     await sleep(1800);await send('Page.bringToFront');await sleep(60);
     const afterFreeze=await evaluate(`window.__SPECIMEN__?.state()||{missing:true,status:document.querySelector('[data-scene-status]')?.dataset.sceneStatus,url:location.href}`);
     const connectedAfterFreeze=await evaluate(`window.__CONNECTED_OCEAN__?.state()`);
     await send('Target.closeTarget',{targetId:other.targetId});
     writeFileSync(`${out}/lifecycle.json`,JSON.stringify({url,info,idleBefore,idleAfter,activationsBefore,activationsAfter,beforeFreeze,afterFreeze,connectedBeforeFreeze,connectedAfterFreeze,backgroundVisibility,errors},null,2));
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
   await send('Page.startScreencast',{format:'jpeg',quality:90,maxWidth:width,maxHeight:height,everyNthFrame:2});
   if(mode==='audit-journey'){
     const checkpoints=[];
     const checkpoint=async name=>{await shot(name);checkpoints.push({label:name,state:await state()});};
     // Long no-input observation uses the existing idle=300 inspection option.
     await sleep(20000);await checkpoint('ordinary-wake');
     for(const delay of [3800,8500,1000,8000]){
       checkpoints.push({click:await clickJelly()});await sleep(delay);
       await checkpoint('click-settle-'+delay);
     }
     for(const progress of [.28,.52,.88,1,0]){
       await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*${progress})`);
       await sleep(9000);await checkpoint('journey-'+progress);
     }
     writeFileSync(`${out}/journey.json`,JSON.stringify({checkpoints,errors},null,2));
   }else if(mode==='social-tour'){
     const checkpoints=[];
     await sleep(3000);
     await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.52)`);
     await sleep(10000);
     for(let i=0;i<Number(seconds);i++){
       const pair=await nearbyPair();
       if(pair){
         checkpoints.push({pair,before:await state(),click:await clickJelly(pair.index)});
         await sleep(3000);await shot('local-echo');checkpoints.push({after:await state()});
         if(checkpoints.at(-1).after.connected.echoCount>0)break;
       }
       await sleep(1000);
     }
     await sleep(8000);checkpoints.push({settled:await state()});
     writeFileSync(`${out}/social.json`,JSON.stringify({checkpoints,errors},null,2));
   }else if(mode==='connected-tour'){
     const checkpoints=[];
     await sleep(6000);checkpoints.push({label:'calm',state:await state()});
     checkpoints.push({label:'click',click:await clickJelly()});
     await sleep(900);await shot('tissue-response');checkpoints.push({label:'tissue-response',state:await state()});
     await sleep(1800);await shot('surroundings-response');checkpoints.push({label:'surroundings-response',state:await state()});
     await sleep(6500);await shot('settled');checkpoints.push({label:'settled',state:await state()});
     await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.07)`);
     await sleep(6000);await shot('close-pass');
     for(let i=0;i<4;i++){checkpoints.push({label:'repeat',click:await clickJelly()});await sleep(250);}
     await sleep(9000);checkpoints.push({label:'repeat-settled',state:await state()});
     await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.35)`);
     await sleep(9000);await shot('distant');checkpoints.push({label:'distant',state:await state()});
     await evaluate(`window.scrollTo(0,0)`);
     await sleep(6000);
     writeFileSync(`${out}/interaction.json`,JSON.stringify({checkpoints,errors},null,2));
   }else if(mode==='tour'||mode==='anatomy-tour'){
     await sleep(12000);
     const chamber=await evaluate(`window.__SPECIMEN__?.state().chamber`);
     if(chamber)await evaluate(`window.__SPECIMEN__.view('side','near')`);
     else await evaluate(`window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*.07)`);
     await sleep(4000);
     const point=await evaluate(`window.__JELLYFISH_WORLD__.getJellyScreenPoint(0)`);
     for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:type==='mouseMoved'?'none':'left',clickCount:1});
     await sleep(6000);
     await shot('activation-return');
     if(chamber&&mode==='anatomy-tour'){
       await evaluate(`window.__SPECIMEN__.view('underside','near')`);await sleep(6000);
       await shot('underside-cycle');
       await evaluate(`window.__SPECIMEN__.view('oblique','far')`);await sleep(6000);
     }
     if(chamber)await evaluate(`window.__SPECIMEN__.view('oblique','medium')`);
     await sleep(Math.max(0,Number(seconds)-(chamber&&mode==='anatomy-tour'?34:22))*1000);
   }else await sleep(Number(seconds)*1000);
   await send('Page.stopScreencast');await sleep(300);
   await shot('ending');
   if(frames.length>1){let concat='';frames.forEach((f,i)=>{concat+=`file '${f.name}'\nduration ${i+1<frames.length?Math.max(.001,frames[i+1].time-f.time):.033}\n`;});writeFileSync(`${out}/motion.txt`,concat);const result=spawnSync('/usr/bin/ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',`${out}/motion.txt`,'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-fps_mode','vfr','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/motion.mp4`],{encoding:'utf8'});if(result.status)throw Error(result.stderr);}
   writeFileSync(`${out}/capture.json`,JSON.stringify({url,info,system,seconds:Number(seconds),frames:frames.length,errors,after:await evaluate(`({state:window.__SPECIMEN__?.state(),ratio:window.__JELLYFISH_WORLD__?.pixelRatio,buffers:[...document.querySelectorAll('canvas')].map(c=>[c.width,c.height]),activationCount:window.__JELLYFISH_WORLD__?.activationCount,lastActivated:window.__JELLYFISH_WORLD__?.lastActivated})`)},null,2));
   }
   if(lensRecording)await finishRecording();
 }
 console.log(JSON.stringify({out,mode,errors:errors.length,info}));
}finally{if(send)await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);ws?.close();browser.kill('SIGTERM');}
