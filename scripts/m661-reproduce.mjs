import {browserSession,sleep} from './view-r2-browser.mjs';
import {installProbe} from './m661-probe.mjs';
const [base='http://127.0.0.1:5211/',label='baseline',event='legacy']=process.argv.slice(2);
const b=await browserSession(`../m6-6-1-evidence/${label}`);
try{
 const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.navigate(`${base}?renderer=webgl&idle=300`);await b.ev(`(${installProbe.toString()})()`);
 await b.ev("window.__CAMERA_LAB__.select('D');window.__CAMERA_LAB__.seek(1)");await sleep(6000);
 b.save('before',await b.ev('__IDLE_AUDIT__.snapshot()'));await b.shot('before');await b.record();
 await b.ev(`__IDLE_AUDIT__.resetEvents();document.activeElement.blur();history.replaceState(null,'','?renderer=webgl&idle=1');`);
 if(event==='legacy')await b.ev("window.dispatchEvent(new Event('pointermove'))");
 else await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:640,y:450});
 b.save('event',await b.ev('__IDLE_AUDIT__.snapshot()'));
 for(let i=0;i<100;i++){if(await b.ev("!!document.querySelector('.idle-screen.is-active')"))break;await sleep(100);}
 await sleep(2500);b.save('idle',await b.ev('__IDLE_AUDIT__.snapshot()'));await b.shot('idle');
 await b.ev("history.replaceState(null,'','?renderer=webgl&idle=300')");await b.key('Enter');await sleep(3200);
 b.save('returned',await b.ev('__IDLE_AUDIT__.snapshot()'));await b.shot('returned');await sleep(5000);b.save('later',await b.ev('__IDLE_AUDIT__.snapshot()'));await b.shot('later');
 await b.finish();b.save('errors',b.errors);console.log(JSON.stringify({out:b.out,errors:b.errors.length}));
}finally{await b.close();}
