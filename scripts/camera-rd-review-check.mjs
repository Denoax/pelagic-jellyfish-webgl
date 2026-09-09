// Verify the local evidence reader in the user's chosen browser, not production.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve('../m5-rd-evidence/review-reader');mkdirSync(root,{recursive:true});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const browser=spawn(resolve('scripts/brave-headless.sh'),['--headless=new','--no-sandbox','--remote-debugging-port=9279',`--user-data-dir=${mkdtempSync(root+'/browser-')}`,'about:blank'],{stdio:'ignore'});
let socket,send;
try{
 let page;for(let i=0;i<100;i++){try{page=await(await fetch('http://127.0.0.1:9279/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(100);}}
 if(!page)throw Error('Browser not ready');socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let id=0;const pending=new Map(),errors=[];
 send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(Error(JSON.stringify(m.error))):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);});
 const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await send('Page.navigate',{url:'http://127.0.0.1:5193/'});await sleep(1500);
 const checks=await evaluate(`(async()=>{
  const checks=[];
  for(const d of ['A','B','C','D'])for(const r of ['normal','portrait','slow','fast']){
   direction.value=d;recording.value=r;refresh();
   await Promise.all([before,after].map(v=>new Promise((resolve,reject)=>{if(v.readyState>=1)return resolve();v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',()=>reject(Error('Video failed '+v.src)),{once:true});})));
   checks.push({direction:d,recording:r,duration:after.duration,dimensions:[after.videoWidth,after.videoHeight],error:after.error?.message||null});
  }
  direction.value='B';recording.value='normal';refresh();
  await Promise.all([before,after].map(v=>new Promise(r=>v.addEventListener('loadedmetadata',r,{once:true}))));
  document.querySelector('#play').click();await new Promise(r=>setTimeout(r,1200));
  const playback=[before,after].map(v=>({time:v.currentTime,paused:v.paused,error:v.error?.message||null}));document.querySelector('#pause').click();
  const images=await Promise.all([fixedBefore,fixedAfter].map(async i=>{await i.decode();return [i.naturalWidth,i.naturalHeight];}));
  return {checks,playback,paused:[before.paused,after.paused],images,title:document.title};
 })()`);
 if(errors.length||checks.playback.some(v=>v.paused||v.time<.3||v.error)||checks.checks.length!==16)throw Error('Reader validation failed');
 const shot=await send('Page.captureScreenshot',{format:'png'});writeFileSync(root+'/reader.png',Buffer.from(shot.data,'base64'));writeFileSync(root+'/checks.json',JSON.stringify({checks,errors},null,2));console.log(root);
}finally{if(send)await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);socket?.close();browser.kill('SIGTERM');}
