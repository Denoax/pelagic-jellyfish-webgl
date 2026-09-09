import {browserSession,sleep} from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5198/',label='matched-after']=process.argv.slice(2);
const b=await browserSession('../m6-evidence/'+label),states=[];
try {
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 for(const [name,mode,p]of [['approach','B',.4],['first','B',.72],['full','B',1],['deep','D',1]]){
  await b.navigate(`${base}?renderer=webgl&idle=300&hold=14&direction=${mode}`);
  await b.ev(`window.__CAMERA_LAB__.seek(${p})`);
  for(let i=0;i<250&&await b.ev('window.__SPECIMEN__.state().time<14');i++)await sleep(100);
  await b.shot(name);states.push(await b.ev(`({name:'${name}',animal:window.__SPECIMEN__.state(),camera:window.__JELLYFISH_WORLD__.getCameraState(),school:window.__JELLYFISH_WORLD__.getSwarmState(),renderer:window.__SPECIMEN__.rendererInfo(),deep:window.__JELLYFISH_WORLD__.getDeepState()})`));
 }
 b.save('states',states);b.save('errors',b.errors);
}finally{await b.close()}
