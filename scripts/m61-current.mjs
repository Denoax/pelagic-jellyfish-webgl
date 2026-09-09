import {browserSession,sleep} from './view-r2-browser.mjs';
import {ORIFICE} from '../src/scene/sanctuary/VentDynamics.js';
const b=await browserSession('../m6-1-evidence/current-response');
try{
 const {windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.navigate('http://127.0.0.1:5201/?renderer=webgl&idle=300');await b.ev(`window.__CAMERA_LAB__.select('D');window.__CAMERA_LAB__.seek(1)`);await sleep(3000);
 await b.ev(`window.__CAMERA_LAB__.select('explore');const c=window.__CAMERA_LAB__.camera;c.position.set(${ORIFICE.x},1,-33);c.lookAt(${ORIFICE.x},1,-24);c.updateMatrixWorld()`);
 await b.record();
 for(const[x,name]of [[-.3,'left-current'],[.3,'right-current'],[null,'ordinary-M2-restored']]){
  await b.ev(`window.__SANCTUARY_REVIEW__.plumeCurrentForReview(${x},0)`);await sleep(9000);await b.shot(name);await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 }
 await b.finish();b.save('errors',b.errors);b.save('method',{note:'Development-only bounded current fixture applied to local vent sampler; actual M2 state is never modified. Integrated plume history remains live throughout the sign change.'});
}finally{await b.close();}
