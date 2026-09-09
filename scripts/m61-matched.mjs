import {browserSession,sleep} from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5201/',label='matched-reviewed-fresh']=process.argv.slice(2);
// Identical M6 fixed-state protocol, with a fresh browser per view. This avoids
// retaining GPU/browser state across repeated hard navigations in the recorder.
for(const [name,mode,p]of [['approach','B',.4],['first','B',.72],['full','B',1],['deep','D',1]]){
 const b=await browserSession('../m6-1-evidence/'+label+'/'+name);
 try{
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
  await b.navigate(`${base}?renderer=webgl&idle=300&hold=14&direction=${mode}`);
  await b.ev(`window.__CAMERA_LAB__.seek(${p})`);
  for(let i=0;i<250&&await b.ev('window.__SPECIMEN__.state().time<13.999');i++)await sleep(100);
  await b.shot(name);
  b.save('state',await b.ev(`({name:'${name}',animal:window.__SPECIMEN__.state(),camera:window.__JELLYFISH_WORLD__.getCameraState(),renderer:window.__SPECIMEN__.rendererInfo(),deep:window.__JELLYFISH_WORLD__.getDeepState()})`));
  b.save('errors',b.errors);
 }finally{await b.close()}
}
