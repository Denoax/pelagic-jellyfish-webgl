import {browserSession,sleep} from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5201/',label='before-detail',motion='0']=process.argv.slice(2);
const b=await browserSession('../m6-2-evidence/'+label),states=[];
try{
 const {windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate(`${base}?renderer=webgl&idle=300${motion==='1'?'':'&hold=14'}`);
 await b.ev(`window.__CAMERA_LAB__.select('D');window.__CAMERA_LAB__.seek(1)`);await sleep(15000);
 if(motion==='1')await b.record();
 for(const [name,pos,look]of [
  ['full',null,null],
  ['chimney',[-6,-6,-17],[-2.4,-7,-24]],
  ['ravine',[8,-8,-11],[3,-16,-24]],
  ['life',[2,-13.3,-18],[-.3,-14.5,-22.6]],
  ['wide',[14,-4,-8],[-2.4,-9,-27]],
 ]){
  if(pos)await b.ev(`(()=>{window.__CAMERA_LAB__.select('explore');const c=window.__CAMERA_LAB__.camera;c.position.set(${pos});c.lookAt(${look});c.updateMatrixWorld()})()`);
  await sleep(1500);await b.shot(name);await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  states.push({name,...await b.ev('({deep:window.__JELLYFISH_WORLD__.getDeepState(),renderer:window.__SPECIMEN__.rendererInfo(),animal:window.__SPECIMEN__.state()})')});
  if(motion==='1')await sleep(6500);
 }
 if(motion==='1')await b.finish();b.save('states',states);b.save('errors',b.errors);if(b.errors.length)throw Error('Browser/shader errors: inspect errors.json');
}finally{await b.close()}
