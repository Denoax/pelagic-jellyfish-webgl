import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
const[base='http://127.0.0.1:5215/',label='candidate']=process.argv.slice(2);
const b=await browserSession('../m7-evidence/resources/'+label),rows=[];
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`
 const contexts=new Map();
 for(const name of ['Texture','Framebuffer','Renderbuffer']){
  const proto=WebGL2RenderingContext.prototype,create=proto['create'+name],remove=proto['delete'+name];
  proto['create'+name]=function(...args){const result=create.apply(this,args);if(!contexts.has(this))contexts.set(this,{Texture:new Set(),Framebuffer:new Set(),Renderbuffer:new Set()});if(result)contexts.get(this)[name].add(result);return result};
  proto['delete'+name]=function(value){contexts.get(this)?.[name].delete(value);return remove.call(this,value)};
 }
 window.__GPU_HANDLES__=()=>[...contexts.values()].map(c=>Object.fromEntries(Object.entries(c).map(([k,v])=>[k,v.size])));
 `});
 await b.navigate(`${base}?renderer=webgl&idle=300`);await b.ev(`__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1)`);await sleep(5000);
 await b.ev(`history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(9000);
 const state=()=>b.ev(`({handles:__GPU_HANDLES__(),counter:__SANCTUARY_REVIEW__.renderStats().memory,idle:window.__OCEAN_IDLE__?.state()})`);
 const initial=await state();b.save('initial',initial);
 for(let i=0;i<6;i++){
  for(const[width,height]of[[390,844],[1280,900]]){await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width,height});await sleep(1000);}
  rows.push(await state());b.save('cycles',rows);
 }
 assert.deepEqual(rows.at(-1).handles,rows[0].handles);assert.equal(b.errors.length,0);console.log(JSON.stringify({label,initial,last:rows.at(-1),result:'stable native handles'}));
}finally{b.save('errors',b.errors);await b.close()}
