// Exact-state still comparisons using the EXISTING specimen fixed clock.
// No production source changes; all eight foreground actors follow the same
// 60 Hz progress history. Live clips are recorded separately at natural speed.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const side=process.argv[2]||'A',root=resolve('../m5-rd-evidence',`fixed-${side}`);mkdirSync(root,{recursive:true});
const browser=spawn(resolve('scripts/brave-headless.sh'),['--headless=new','--no-sandbox','--use-gl=angle','--use-angle=gl','--hide-scrollbars','--remote-debugging-port=9279',`--user-data-dir=${mkdtempSync(root+'/browser-')}`,'about:blank'],{stdio:'ignore'});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let socket,send;
try{
 let page;for(let i=0;i<100;i++){try{page=await(await fetch('http://127.0.0.1:9279/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(100);}}
 if(!page)throw Error('Browser not ready');socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let n=0;const pending=new Map();
 send=(method,params={})=>new Promise((res,rej)=>{const id=++n;pending.set(id,{res,rej});socket.send(JSON.stringify({id,method,params}));});socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(JSON.stringify(m.error))):p.res(m.result);}});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 const port=side==='approved'?5190:side==='rejected'?5191:5192;
 const extra=side==='rejected'?'&cameraJourney=1':side==='approved'?'':`&cameraLab=1&direction=${side}&labUI=0`;
 const url=`http://127.0.0.1:${port}/?hold=0&populationLod=1&bubblePassage=1&renderer=webgl&idle=300${extra}`;
 await send('Page.navigate',{url});let ready=false;for(let i=0;i<600;i++){ready=await evaluate(`!!window.__SPECIMEN__&&document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`);if(ready)break;await sleep(100);}if(!ready)throw Error('Ocean not ready');
 await evaluate(`(async()=>{
  const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/src/scene/dev/SpecimenPreview.js')).name;
  const {SpecimenPreview}=await import(url),original=SpecimenPreview.prototype.advance;
  SpecimenPreview.prototype.advance=function(dt){const result=original.call(this,dt);const p=Math.max(0,Math.min(.35,(this.time-6)/24*.35));window.scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});window.dispatchEvent(new Event('scroll'));return result;};
  window.__SPECIMEN__.holdAt(30);
 })()`);
 for(let i=0;i<1200;i++){if(await evaluate('window.__SPECIMEN__.state().time>=30-1e-8'))break;await sleep(100);}
 const state=await evaluate(`({specimen:window.__SPECIMEN__.state(),actors:window.__JELLYFISH_WORLD__.getSwarmState(),camera:window.__CAMERA_LAB__?.summary()||window.__JELLYFISH_WORLD__.getCameraState(),renderer:window.__SPECIMEN__.rendererInfo(),viewport:[innerWidth,innerHeight]})`);if(state.specimen.time<29.999)throw Error('Fixed sequence incomplete');
 await evaluate(`(async()=>{const url=performance.getEntriesByType('resource').find(r=>r.name.includes('/three_tsl.js')).name;const {time}=await import(url);time.update=()=>{time.value=30};})()`);await sleep(300);
 const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(root+'/frame.png',Buffer.from(shot.data,'base64'));writeFileSync(root+'/state.json',JSON.stringify({url,seed:7183,step:1/60,state},null,2));console.log(root);
}finally{if(send)await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);socket?.close();browser.kill('SIGTERM');}
