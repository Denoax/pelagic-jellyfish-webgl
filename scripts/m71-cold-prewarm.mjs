import {browserSession,sleep} from './view-r2-browser.mjs';
// Separate cold-link diagnostic, not the steady-state benchmark. A harmless
// GLSL local-identifier rename prevents reuse of an identical cached program.
for(const[label,base]of[['baseline','http://127.0.0.1:5215/'],['candidate','http://127.0.0.1:5217/']]){
 const b=await browserSession(`../m7-1-evidence/performance/cold-${label}`);
 try{
  const salt=String(Date.now());
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`
   const shader=WebGL2RenderingContext.prototype.shaderSource;
   WebGL2RenderingContext.prototype.shaderSource=function(s,code){return shader.call(this,s,code.replace(/\\bnodeVar0\\b/g,'nodeVar0Cold${salt}'))};
   const raf=requestAnimationFrame.bind(window);window.__ENDS__=[];
   window.requestAnimationFrame=cb=>{const s=Function.prototype.toString.call(cb);const ocean=cb.constructor.name==='AsyncFunction'&&s.includes('__JELLYFISH_WORLD__')&&s.includes('.getDelta()');return raf(ocean?function(t){let yielded=false;const p=cb(t);p.then(()=>{if(yielded&&!document.hidden)__ENDS__.push(performance.now())});queueMicrotask(()=>yielded=true);return p}:cb)};
  `});
  await b.navigate(`${base}?renderer=webgl&idle=300`);const ready=await b.ev('performance.now()');await sleep(8500);
  const r=await b.ev('({ends:__ENDS__,idle:__OCEAN_IDLE__.state(),renderer:__SPECIMEN__.rendererInfo()})');
  const intervals=r.ends.slice(1).map((t,i)=>({t,dt:t-r.ends[i]})).filter(x=>x.t>ready+100&&x.t<ready+8000);
  const s=intervals.map(x=>x.dt).sort((a,b)=>a-b);const result={label,ready,salt,method:'cold local-identifier shader variant; ordinary ocean still rendered',...r,intervals,median:s[Math.floor(s.length*.5)],p95:s[Math.floor(s.length*.95)],max:s.at(-1),over50:s.filter(x=>x>50).length,errors:b.errors};
  b.save('result',result);console.log(JSON.stringify({label,preparationLatency:r.idle.prewarmMilliseconds,max:result.max,p95:result.p95,over50:result.over50,errors:b.errors}));
 }finally{await b.close()}
}
