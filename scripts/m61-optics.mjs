import {browserSession,sleep} from './view-r2-browser.mjs';
import {ORIFICE} from '../src/scene/sanctuary/VentDynamics.js';
const [base='http://127.0.0.1:5201/',label='shimmer-optics',motion='0']=process.argv.slice(2);
const b=await browserSession('../m6-1-evidence/'+label);
try{
 const {windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate(`${base}?renderer=webgl&idle=300${motion==='1'?'':'&hold=14'}`);
 await b.ev(`window.__CAMERA_LAB__.select('D');window.__CAMERA_LAB__.seek(1)`);await sleep(motion==='1'?3000:15000);
 await b.ev(`window.__CAMERA_LAB__.select('explore');const c=window.__CAMERA_LAB__.camera;c.position.set(${ORIFICE.x},-2.1,-25.7);c.lookAt(${ORIFICE.x},-2.1,-23.95);c.updateMatrixWorld()`);
 if(motion!=='1')await b.ev(`(async()=>{const u=performance.getEntriesByType('resource').find(x=>x.name.includes('three_tsl.js')).name;const{time}=await import(u);time.update=()=>{time.value=14;};})()`);
 if(motion==='1')await b.record();
 for(const enabled of [false,true]){await b.ev(`window.__SANCTUARY_REVIEW__.shimmer(${enabled})`);await sleep(1200);await b.shot(enabled?'on':'off');await b.send('Emulation.setVisibleSize',{width:1280,height:900});if(motion==='1')await sleep(10000);}
 if(motion==='1')await b.finish();b.save('state',await b.ev('window.__BUBBLE_PASSAGE__.state()'));b.save('errors',b.errors);
}catch(e){b.save('errors',b.errors);throw e;}finally{await b.close();}
