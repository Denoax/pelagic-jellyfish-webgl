// Local Brave/CDP evidence helper; no dependency or production import.
import {spawn,spawnSync} from 'node:child_process';
import {mkdirSync,mkdtempSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
export const sleep=ms=>new Promise(r=>setTimeout(r,ms));
export async function browserSession(label,width=1280,height=900){
 const out=resolve('../m5-view-r2-evidence',label);mkdirSync(out,{recursive:true});
 const browser=spawn(resolve('scripts/brave-headless.sh'),['--headless=new','--no-sandbox','--hide-scrollbars','--use-gl=angle','--use-angle=gl','--remote-debugging-port=9279',`--user-data-dir=${mkdtempSync(out+'/profile-')}`,'about:blank'],{stdio:'ignore'});
 let page;for(let i=0;i<100;i++){try{page=await(await fetch('http://127.0.0.1:9279/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(100);}}
 if(!page)throw Error('Brave unavailable');const socket=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let id=0;const pending=new Map(),errors=[],frames=[];
 const send=(method,params={})=>new Promise((res,rej)=>{pending.set(++id,{res,rej});socket.send(JSON.stringify({id,method,params}));});
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.rej(Error(JSON.stringify(m.error))):p.res(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params);else if(m.method==='Page.screencastFrame'){const name=`frame-${String(frames.length).padStart(5,'0')}.jpg`;writeFileSync(`${out}/${name}`,Buffer.from(m.params.data,'base64'));frames.push({name,time:m.params.metadata.timestamp});void send('Page.screencastFrameAck',{sessionId:m.params.sessionId});}});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const save=(name,value)=>writeFileSync(`${out}/${name}.json`,JSON.stringify(value,null,2));
 const shot=async name=>writeFileSync(`${out}/${name}.png`,Buffer.from((await send('Page.captureScreenshot',{format:'png'})).data,'base64'));
 const ready=async()=>{for(let i=0;i<700;i++){if(await ev(`document.querySelector('[data-scene-status]')?.dataset.sceneStatus==='ready'`))return;await sleep(100);}throw Error('Ocean not ready');};
 const navigate=async url=>{await send('Page.navigate',{url});await sleep(300);await ready();await send('Page.bringToFront');};
 const click=async selector=>{const p=await ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});if(!e)throw Error('Missing '+${JSON.stringify(selector)});e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2};})()`);for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});await sleep(100);};
 const key=async(key,code=key,modifiers=0)=>{const vk={Tab:9,Enter:13,Escape:27,End:35,Home:36,ArrowDown:40,ArrowUp:38,Space:32,KeyA:65}[code];await send('Input.dispatchKeyEvent',{type:'keyDown',key,code,modifiers,windowsVirtualKeyCode:vk,text:key==='Enter'?'\r':key===' '?' ':undefined});await send('Input.dispatchKeyEvent',{type:'keyUp',key,code,modifiers,windowsVirtualKeyCode:vk});};
 const record=()=>send('Page.startScreencast',{format:'jpeg',quality:88,maxWidth:width,maxHeight:height,everyNthFrame:2});
 const finish=async()=>{await send('Page.stopScreencast');await sleep(200);writeFileSync(`${out}/motion.txt`,frames.map((f,i)=>`file '${f.name}'\nduration ${i+1<frames.length?Math.max(.001,frames[i+1].time-f.time):.033}\n`).join(''));if(frames.length){const p=spawnSync('ffmpeg',['-y','-loglevel','error','-f','concat','-safe','0','-i',`${out}/motion.txt`,'-vf','pad=ceil(iw/2)*2:ceil(ih/2)*2','-fps_mode','vfr','-c:v','libx264','-preset','veryfast','-threads','4','-crf','21','-pix_fmt','yuv420p','-movflags','+faststart',`${out}/motion.mp4`]);if(p.status)throw Error('Video encode failed');}save('recording',{frames:frames.length,duration:frames.length?frames.at(-1).time-frames[0].time:0,errors});};
 const close=async()=>{await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);socket.close();browser.kill('SIGTERM');};
 await send('Page.enable');await send('Runtime.enable');await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});
 return{out,page,send,ev,save,shot,ready,navigate,click,key,record,finish,close,errors};
}
