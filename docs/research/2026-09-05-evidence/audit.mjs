import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
const [mode='idle', url='http://127.0.0.1:4173/?idle=12', out='/tmp/pelagic-audit', width='1440', height='900'] = process.argv.slice(2);
const port = 9251;
const profile = mkdtempSync('/tmp/pelagic-audit-browser-');
const browser = spawn('/home/mani/dev/jellyfish-studio/site/scripts/brave-headless.sh', ['--headless=new','--no-sandbox','--hide-scrollbars','--use-gl=angle',`--use-angle=${mode==='software'?'swiftshader-webgl':'gl'}`,'--enable-unsafe-swiftshader',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
const sleep = ms=>new Promise(r=>setTimeout(r,ms));
let socket;
try {
  let page;
  for(let i=0;i<80;i++){try{page=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`,{method:'PUT'})).json();break;}catch{await sleep(100);}}
  socket=new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r=>socket.addEventListener('open',r,{once:true}));
  let id=0; const pending=new Map(); const errors=[];
  socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.id){pending.get(m.id)?.(m);pending.delete(m.id);}else if(m.method==='Runtime.exceptionThrown'||(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error'))errors.push(m.params);});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const n=++id;pending.set(n,m=>m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result));socket.send(JSON.stringify({id:n,method,params}));});
  const evaluate=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true})).result?.value;
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:+width,height:+height,deviceScaleFactor:1,mobile:false});
  await send('Page.addScriptToEvaluateOnNewDocument',{source:`
    window.__audit={frames:[],long:[],contexts:[],draws:0,started:performance.now()};
    if(${JSON.stringify(mode)}==='fallback'){
      Object.defineProperty(navigator,'brave',{value:undefined,configurable:true});
      Object.defineProperty(navigator,'gpu',{value:{requestAdapter:async()=>null},configurable:true});
    }
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){
      if(${JSON.stringify(mode)}==='blocked' && /webgl|webgpu/.test(type))return null;
      const gl=original.call(this,type,...args);
      if(gl && /webgl/.test(type) && !window.__audit.contexts.some(x=>x.gl===gl)) {
        const ext=gl.getExtension('WEBGL_debug_renderer_info');
        window.__audit.contexts.push({gl,type,at:performance.now(),renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)});
      }
      return gl;
    };
    for(const proto of [WebGLRenderingContext.prototype,WebGL2RenderingContext.prototype])for(const name of ['drawArrays','drawElements','drawArraysInstanced','drawElementsInstanced']){const orig=proto[name];if(orig)proto[name]=function(...args){window.__audit.draws++;return orig.apply(this,args);};}
    new PerformanceObserver(list=>{for(const e of list.getEntries())window.__audit.long.push({at:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
    let prev=performance.now(),draws=0;
    function tick(now){const a=window.__audit;a.frames.push({at:now,dt:now-prev,draws:a.draws-draws,idle:!!document.querySelector('.idle-screen.is-active'),opacity:Number(getComputedStyle(document.querySelector('.idle-screen')||document.body).opacity)});prev=now;draws=a.draws;requestAnimationFrame(tick);}requestAnimationFrame(tick);
  `});
  await send('Page.navigate',{url});
  if(mode==='idle'||mode==='profile') {
    await sleep(9000);
    for(const [name,wait] of [['ocean',0],['enter',4200],['idle',3800],['release',0]]){
      await sleep(wait);
      if(name==='release'){
        for(let i=0;i<16;i++){await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:+width*(.28+i*.027),y:+height*(.5+Math.sin(i*.3)*.08)});await sleep(35);}
      }
      if(mode!=='profile'){const img=await send('Page.captureScreenshot',{format:'png'});writeFileSync(out+'-'+name+'.png',Buffer.from(img.data,'base64'));}
    }
    await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    await sleep(3500);
  } else {
    await sleep(mode==='software'?14000:9000);
    if(mode==='loss') {await evaluate("window.__audit.contexts[0]?.gl.getExtension('WEBGL_lose_context')?.loseContext()");await sleep(3000);}
    const img=await send('Page.captureScreenshot',{format:'png'});writeFileSync(out+'.png',Buffer.from(img.data,'base64'));
  }
  const report=await evaluate(`(()=>{const a=window.__audit;const stats=(lo,hi)=>{const f=a.frames.filter(x=>x.at>=lo&&x.at<hi);const times=f.map(x=>x.dt).sort((a,b)=>a-b);return {frames:f.length,mean:times.reduce((s,n)=>s+n,0)/(times.length||1),p95:times[Math.floor(times.length*.95)],max:times.at(-1),drawFrames:f.filter(x=>x.draws>0).length,draws:f.reduce((s,x)=>s+x.draws,0)};};return {status:document.querySelector('[data-scene-status]')?.dataset.sceneStatus,worldRenderer:window.__JELLYFISH_WORLD__?.renderer,canvasCount:document.querySelectorAll('canvas').length,contexts:a.contexts.map(({type,at,renderer})=>({type,at,renderer})),windows:[{label:'startup',...stats(0,5000)},{label:'ocean',...stats(5000,11000)},{label:'entry',...stats(11500,15000)},{label:'idle',...stats(15000,19000)},{label:'exit',...stats(19000,24000)}],longTasks:a.long,frames:a.frames,assets:performance.getEntriesByType('resource').map(x=>({name:x.name,duration:x.duration,transfer:x.transferSize})),text:document.body.innerText};})()`);
  writeFileSync(out+'.json',JSON.stringify({mode,url,width,height,...report,errors},null,2));
  const {frames,assets,...brief}=report;console.log(JSON.stringify({...brief,errorCount:errors.length}));
  await send('Browser.close');
} finally {socket?.close();browser.kill('SIGTERM');}
