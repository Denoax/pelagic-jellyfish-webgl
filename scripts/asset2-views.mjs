import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../asset2-evidence/final/views',1672,941);
try{
 await b.send('Emulation.setVisibleSize',{width:1672,height:941});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate('http://127.0.0.1:5222/?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=B&hold=14');await b.ev('__CAMERA_LAB__.seek(1)');
 for(let n=0;n<400;n++){if(await b.ev('__SPECIMEN__.state().time>=14'))break;await sleep(100);}
 await b.ev('__SPECIMEN__.resume()');
 for(const mode of ['A','B','C','D']){await b.ev(`__CAMERA_LAB__.select('${mode}');__CAMERA_LAB__.seek(1)`);await sleep(4500);const state=await b.ev('({camera:__JELLYFISH_WORLD__.getCameraState(),environment:__ASSET2__.state()})');if(state.camera.transitioning)throw Error('View has not settled');await b.shot(mode);b.save(mode,state);}
 await b.ev('__CAMERA_LAB__.select("explore")');
 for(const [name,p,target] of [['near',[7,-11,-15],[2,-15,-28]],['between',[-10,-6,-42],[0,-6,-48]],['above',[0,12,-25],[0,-12,-32]],['below-camera',[10,-15,-20],[0,-12,-35]],['side',[30,-7,-42],[-5,-7,-42]],['fade',[85,-8,-28],[96,-15,-28]],['abyss',[220,-10,-28],[260,-10,-28]],['void',[300,-10,-28],[340,-10,-28]],['under',[10,-26,-20],[0,-15,-28]]]){
  await b.ev(`(()=>{const c=__CAMERA_LAB__.camera;c.position.set(${p});c.lookAt(${target});c.updateMatrixWorld()})()`);await sleep(800);await b.shot(name);
 }
 b.save('renderer',await b.ev('__SPECIMEN__.rendererInfo()'));b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
}finally{await b.close();}
