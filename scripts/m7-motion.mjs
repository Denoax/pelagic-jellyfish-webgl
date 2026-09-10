import {browserSession,sleep} from './view-r2-browser.mjs';
const name=process.argv[2]||'sanctuary',portrait=name==='portrait';
const progress={opening:0,school:.5,bubbles:.36}[name]??1;
const mode=['opening','school','bubbles'].includes(name)?'B':'D';
const b=await browserSession('../m7-evidence/motion/'+name,portrait?390:1280,portrait?844:900);
try{
 const {windowId}=await b.send('Browser.getWindowForTarget');
 await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});
 await b.send('Emulation.setVisibleSize',{width:portrait?390:1280,height:portrait?844:900});
 await b.navigate('http://127.0.0.1:5215/?renderer=webgl&idle=300');
 await b.ev(`__CAMERA_LAB__.select('${mode}');__CAMERA_LAB__.seek(${progress});window.__SAME__=__JELLYFISH_WORLD__`);await sleep(4000);
 if(name==='explore')await b.ev(`__CAMERA_LAB__.select('explore')`);
 b.save('before',await b.ev(`({camera:__JELLYFISH_WORLD__.getCameraState(),idle:__OCEAN_IDLE__.state()})`));await b.shot('before');await b.record();
 await b.ev(`document.activeElement.blur();history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'));`);
 await sleep(3000);await b.shot('condensing');await sleep(3000);await b.shot('coalescing');await sleep(4000);await b.shot('settled');await sleep(10000);
 b.save('field-before',await b.ev('__OCEAN_IDLE__.field()'));
 for(let i=0;i<36;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseMoved',x:(portrait?95:360)+i*(portrait?5:15),y:(portrait?340:410)+Math.sin(i*.16)*(portrait?65:75)});await sleep(35);}
 await b.shot('deformed');b.save('field-deformed',await b.ev('__OCEAN_IDLE__.field()'));await sleep(1200);await b.shot('persistent');await sleep(7000);await b.shot('recovered');b.save('field-recovered',await b.ev('__OCEAN_IDLE__.field()'));
 await b.ev(`__OCEAN_IDLE__.minute('2026-09-10T14:29:58')`);await sleep(3500);await b.shot('minute-before');await b.ev(`__OCEAN_IDLE__.minute('2026-09-10T14:30:00')`);await sleep(1200);await b.shot('minute-changing');await sleep(2300);await b.shot('minute-after');
 b.save('idle',await b.ev(`({camera:__JELLYFISH_WORLD__.getCameraState(),idle:__OCEAN_IDLE__.state()})`));
 await b.ev(`history.replaceState(null,'','?idle=300')`);await b.key('Enter');await sleep(300);await b.shot('dissolving');await sleep(1400);await b.shot('returned');
 b.save('after',await b.ev(`({camera:__JELLYFISH_WORLD__.getCameraState(),same:__SAME__===__JELLYFISH_WORLD__,idle:__OCEAN_IDLE__.state()})`));await b.finish();
 console.log(JSON.stringify({name,errors:b.errors}));
}finally{b.save('errors',b.errors);await b.close();}
