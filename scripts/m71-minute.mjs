import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../m7-1-evidence/candidate/minutes');
try{
 const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__CLOCK_CANVASES__=new Set();const fill=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(...args){if(this.canvas.width===1536&&this.canvas.height===864)__CLOCK_CANVASES__.add(this.canvas);return fill.apply(this,args)};window.__HOURS_HASH__=()=>[...__CLOCK_CANVASES__].map(c=>{const d=c.getContext('2d').getImageData(0,0,600,864).data;let h=0;for(let i=0;i<d.length;i+=4)h=(Math.imul(h,31)+d[i])>>>0;return h})`});
 await b.navigate('http://127.0.0.1:5217/?renderer=webgl&idle=300');await sleep(6000);await b.ev(`__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1);__OCEAN_IDLE__.minute('2026-09-10T14:00:00')`);await sleep(3000);
 await b.ev(`document.activeElement.blur();history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(9000);await b.record();
 const rows=[];
 for(const[from,to]of[['00','01'],['01','02'],['02','03'],['03','04'],['05','06'],['08','09'],['09','00'],['09','10'],['19','20'],['29','30'],['59','00']]){
  await b.ev(`__OCEAN_IDLE__.minute('2026-09-10T14:${from}:00')`);await sleep(3100);const before=await b.ev('__HOURS_HASH__()');await b.shot(`${from}-${to}-before`);
  await b.ev(`__OCEAN_IDLE__.minute('2026-09-10T14:${to}:00')`);await sleep(800);await b.shot(`${from}-${to}-neck`);await sleep(500);await b.shot(`${from}-${to}-masses`);await sleep(1800);await b.shot(`${from}-${to}-after`);
  const after=await b.ev('__HOURS_HASH__()');assert.deepEqual(after,before,'Untouched hour mask changed');rows.push({from,to,before,after,field:await b.ev('__OCEAN_IDLE__.field()')});b.save('cases',rows);
 }
 await b.finish();assert.equal(b.errors.length,0);console.log('11 minute transitions, unchanged-hour masks: PASS');
}finally{b.save('errors',b.errors);await b.close()}
