import {browserSession,sleep} from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5215/',label='baseline',scene='opening']=process.argv.slice(2);
const portrait=scene==='portrait',w=portrait?390:1280,h=portrait?844:900;
const b=await browserSession(`../m7-1-evidence/${label}/${scene}`,w,h);
try{
 const {windowId}=await b.send('Browser.getWindowForTarget');
 await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});
 await b.send('Emulation.setVisibleSize',{width:w,height:h});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}'});
 await b.navigate(`${base}?renderer=webgl&idle=300`);await sleep(6000);
 await b.ev(`__CAMERA_LAB__.select('${scene==='sanctuary'||scene==='explore'||portrait?'D':'B'}');__CAMERA_LAB__.seek(${scene==='school'?.5:scene==='bubbles'?.36:scene==='sanctuary'||scene==='explore'||portrait?1:.18});__OCEAN_IDLE__.minute('2026-09-10T14:29:00')`);
 await sleep(5000);if(scene==='explore')await b.ev(`__CAMERA_LAB__.select('explore')`);
 b.save('camera',await b.ev('__JELLYFISH_WORLD__.getCameraState()'));await b.shot('ocean');await b.record();
 await b.ev(`document.activeElement.blur();history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'))`);
 while(!(await b.ev('__OCEAN_IDLE__.state().active')))await sleep(25);
 const marks=[];
 for(const t of[.25,.5,.75,1,1.25,1.5,1.75,2,2.25,2.5,2.75,3,3.5,4,4.5,5,6,7,8]){
  while((await b.ev('__OCEAN_IDLE__.state().time'))<t)await sleep(10);
  marks.push({t,state:await b.ev('__OCEAN_IDLE__.state()')});await b.shot(`entry-${String(t).replace('.','-')}`);
 }
 await sleep(15000);await b.shot('settled');
 for(let i=0;i<36;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:w*(.22+i*.016),y:h*(.48+Math.sin(i*.16)*.08)});await sleep(35)}
 await b.shot('pointer');await sleep(4000);await b.shot('recovery');
 await b.ev(`__OCEAN_IDLE__.minute('2026-09-10T14:30:00')`);await sleep(1200);await b.shot('minute');await sleep(3500);await b.shot('minute-settled');
 await b.ev(`history.replaceState(null,'','?idle=300')`);await b.key('Enter');await sleep(250);await b.shot('exit-025');await sleep(300);await b.shot('exit-055');await sleep(1500);await b.shot('returned');
 b.save('metadata',{base,label,scene,marks,renderer:await b.ev('__SPECIMEN__.rendererInfo()'),errors:b.errors});await b.finish();console.log(JSON.stringify({label,scene,errors:b.errors}));
}finally{await b.close()}
