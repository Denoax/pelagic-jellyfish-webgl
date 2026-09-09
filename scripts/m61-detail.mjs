import {browserSession,sleep} from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5198/',label='detail-before',motion='0']=process.argv.slice(2);
const b=await browserSession('../m6-1-evidence/'+label),states=[];
try {
 const {windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate(`${base}?renderer=webgl&idle=300${motion==='1'?'':'&hold=14'}`);
 await b.ev(`window.__CAMERA_LAB__.select('D');window.__CAMERA_LAB__.seek(1)`);await sleep(motion==='1'?4000:15000);
 await b.ev(`window.__CAMERA_LAB__.select('explore')`);
 if(motion==='1')await b.record();
 for(const [name,pos,look]of [
  ['source',[-4,-1.2,-28],[-4.264,-1.6,-23.948]],
  ['entrainment',[-4,1,-28],[-4.1,.5,-23.6]],
  ['dispersion',[-4,3,-28],[-3,3,-23]],
  ['mineral',[-7,-7,-17],[-4.6,-7,-24]],
  ['deposits',[-1,-12,-20],[-2.5,-14.8,-22.5]],
 ]){
  await b.ev(`(()=>{const c=window.__CAMERA_LAB__.camera;c.position.set(${pos});c.lookAt(${look});c.updateMatrixWorld();})()`);await sleep(1500);await b.shot(name);await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  states.push({name,pos,look,...await b.ev(`({camera:window.__JELLYFISH_WORLD__.getCameraState(),deep:window.__JELLYFISH_WORLD__.getDeepState(),renderer:window.__SPECIMEN__.rendererInfo(),animal:window.__SPECIMEN__.state()})`)});
  if(motion==='1')await sleep(6500);
 }
 if(motion==='1')await b.finish();b.save('states',states);b.save('errors',b.errors);
}catch(e){b.save('errors',b.errors);await b.shot('failed');throw e;}finally{await b.close();}
