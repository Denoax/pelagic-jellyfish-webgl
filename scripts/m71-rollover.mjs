import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../m7-1-evidence/candidate/rollover');
try{
 const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.navigate('http://127.0.0.1:5217/?renderer=webgl&idle=300');await sleep(6000);
 await b.ev(`__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1);__OCEAN_IDLE__.minute('2026-09-10T14:59:00');history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(9000);await b.record();
 for(const[from,to]of[['14:59','15:00'],['23:59','00:00']]){
  await b.ev(`__OCEAN_IDLE__.minute('2026-09-10T${from}:00')`);await sleep(3500);await b.shot(from.replace(':','-'));
  await b.ev(`__OCEAN_IDLE__.minute('2026-09-10T${to}:00')`);await sleep(1200);await b.shot(to.replace(':','-')+'-morph');await sleep(3500);await b.shot(to.replace(':','-'));
 }
 await b.finish();b.save('errors',b.errors);console.log('rollover',b.errors);
}finally{await b.close()}
