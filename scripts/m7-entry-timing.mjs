import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
const [base,label,sha]=process.argv.slice(2);
const b=await browserSession('../m7-evidence/performance/'+label+'-entry');
try {
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`
 const raf=requestAnimationFrame.bind(window),ends=[];
 window.__ENTRY_TRACE__={ends,marks:{}};
 window.requestAnimationFrame=callback=>{
  const source=Function.prototype.toString.call(callback);
  const ocean=callback.constructor.name==='AsyncFunction'&&source.includes('__JELLYFISH_WORLD__')&&source.includes('.getDelta()');
  return raf(ocean?function(t){let yielded=false;const p=callback(t);p.then(()=>{if(yielded&&!document.hidden)ends.push(performance.now())});queueMicrotask(()=>yielded=true);return p}:callback);
 };
 `});
 await b.navigate(`${base}?renderer=webgl&idle=300`);await b.ev(`__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1)`);await sleep(6000);
 await b.ev(`(()=>{const trace=__ENTRY_TRACE__;let previous=false;const observe=()=>{const next=document.documentElement.classList.contains('idle-active');if(next!==previous){trace.marks[next?'active':'dismissed']=performance.now();previous=next}};new MutationObserver(observe).observe(document.documentElement,{attributes:true,attributeFilter:['class']});history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))})()`);
 await sleep(12000);await b.ev(`history.replaceState(null,'','?idle=300')`);await b.key('Enter');await sleep(4000);
 const data=await b.ev(`({trace:__ENTRY_TRACE__,idle:window.__OCEAN_IDLE__?.state(),renderer:__SPECIMEN__.rendererInfo()})`);
 const stats=a=>{a.sort((x,y)=>x-y);return{median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1),over50:a.filter(x=>x>50).length,n:a.length}};
 const around=mark=>{const ends=data.trace.ends,intervals=ends.slice(1).map((t,i)=>({t,dt:t-ends[i]}));return{firstCompletionAfterDomStateMs:ends.find(t=>t>=mark)-mark,intervals:stats(intervals.filter(x=>x.t>=mark-100&&x.t<mark+1200).map(x=>x.dt))}};
 assert.ok(data.trace.marks.active&&data.trace.marks.dismissed);assert.equal(b.errors.length,0);
 const result={label,sha,...data,entry:around(data.trace.marks.active),exit:around(data.trace.marks.dismissed),browser:await b.send('Browser.getVersion'),errors:b.errors};b.save('result',result);console.log(JSON.stringify({label,entry:result.entry,exit:result.exit,prewarm:data.idle?.prewarmMilliseconds}));
}finally{await b.close()}
