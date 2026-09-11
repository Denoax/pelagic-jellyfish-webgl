import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../asset2-evidence/phase-2/ablation',1672,941);
try{
 await b.send('Emulation.setVisibleSize',{width:1672,height:941});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate('http://127.0.0.1:5222/?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=B&hold=14');
 await b.ev('window.__CAMERA_LAB__.seek(1)');await sleep(16000);await b.shot('all-on-guide-off');
 for(const name of ['spires','haze','atmosphere','outer','guide']){
  await b.ev(`window.__ASSET2__.toggle('${name}',${name==='guide'})`);await sleep(300);await b.shot(`${name}-${name==='guide'?'on':'off'}`);
  await b.ev(`window.__ASSET2__.toggle('${name}',${name!=='guide'})`);
 }
 await b.ev('window.__SPECIMEN__.resume();window.__CAMERA_LAB__.select("explore")');
 for(const [name,p,target] of [['core',[7,-11,-15],[2,-15,-28]],['edge',[85,-8,-28],[96,-15,-28]],['abyss',[220,-10,-28],[260,-10,-28]],['void',[300,-10,-28],[340,-10,-28]],['under',[10,-26,-20],[0,-15,-28]]]){
  await b.ev(`(()=>{const c=window.__CAMERA_LAB__.camera;c.position.set(${p});c.lookAt(${target});c.updateMatrixWorld()})()`);await sleep(1200);await b.shot(name);
 }
 b.save('state',await b.ev('({environment:window.__ASSET2__.state(),renderer:window.__SPECIMEN__.rendererInfo()})'));b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
}finally{await b.close();}
