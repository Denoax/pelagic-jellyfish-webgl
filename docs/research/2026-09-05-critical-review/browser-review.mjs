// Research-only browser driver. Does not modify application files or user profiles.
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { createInterface } from 'node:readline';
const root = new URL('.', import.meta.url).pathname;
const profile = mkdtempSync('/tmp/pelagic-review-');
const browser = spawn(new URL('../../../scripts/brave-headless.sh', import.meta.url).pathname, ['--headless=new','--no-sandbox','--hide-scrollbars','--use-gl=angle','--use-angle=gl','--remote-debugging-port=9267',`--user-data-dir=${profile}`,'about:blank'], {stdio:'ignore'});
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
let socket;
let send;
try {
  let page;
  for(let i=0;i<80;i++){try{page=await(await fetch('http://127.0.0.1:9267/json/new?about:blank',{method:'PUT'})).json();break;}catch{await sleep(100);}}
  socket=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let id=0;const pending=new Map();const errors=[];
  socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}else if(m.method==='Runtime.exceptionThrown'||(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'))errors.push(m.params);});
  send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,m=>m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result));socket.send(JSON.stringify({id:n,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result?.value;};
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');
  await send('Network.setCacheDisabled',{cacheDisabled:true});
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__review={frames:[],long:[],states:[]};
    new PerformanceObserver(l=>{for(const e of l.getEntries())window.__review.long.push({at:e.startTime,duration:e.duration})}).observe({type:'longtask',buffered:true});
    let previous=performance.now();function tick(t){window.__review.frames.push({at:t,dt:t-previous,idle:!!document.querySelector('.idle-screen.is-active')});previous=t;requestAnimationFrame(tick)}requestAnimationFrame(tick);
    new MutationObserver(()=>{const status=document.querySelector('[data-scene-status]')?.dataset.sceneStatus;const a=window.__review.states;if(status&&a.at(-1)?.status!==status)a.push({at:performance.now(),status})}).observe(document,{subtree:true,attributes:true,childList:true,attributeFilter:['data-scene-status']});
  `});
  console.log('READY: JSON commands navigate, capture, evaluate, cdp, save, quit');
  for await(const line of createInterface({input:process.stdin})){
    try{
      const c=JSON.parse(line);let result;
      if(c.action==='quit')break;
      if(c.action==='navigate'){errors.length=0;result=await send('Page.navigate',{url:c.url});}
      if(c.action==='evaluate')result=await evaluate(c.expression);
      if(c.action==='cdp')result=await send(c.method,c.params||{});
      if(c.wait)await sleep(Math.min(c.wait,15000));
      if(c.action==='capture'){
        const p=root+c.name+'.png';mkdirSync(new URL('.', 'file://'+p).pathname,{recursive:true});
        const s=await send('Page.captureScreenshot',{format:'png'});writeFileSync(p,Buffer.from(s.data,'base64'));result={file:p};
      }
      if(c.action==='save'){
        const report=await evaluate(`({url:location.href,viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},review:window.__review,scene:window.__JELLYFISH_WORLD__?{renderer:window.__JELLYFISH_WORLD__.renderer}:null,assets:performance.getEntriesByType('resource').map(x=>({url:x.name,bytes:x.transferSize,duration:x.duration})),text:document.body.innerText,links:[...document.querySelectorAll('a,button')].map(e=>{const r=e.getBoundingClientRect();return {text:e.innerText,label:e.getAttribute('aria-label'),href:e.getAttribute('href'),width:r.width,height:r.height}})})`);
        writeFileSync(root+c.name+'.json',JSON.stringify({...report,errors},null,2));result={file:root+c.name+'.json',errors:errors.length};
      }
      console.log(JSON.stringify({ok:true,result}));
    }catch(e){console.log(JSON.stringify({ok:false,error:String(e)}));}
  }
}finally{
  if(send)await Promise.race([send('Browser.close').catch(()=>{}),sleep(1000)]);
  socket?.close();browser.kill('SIGTERM');await sleep(300);
  rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100});
}
