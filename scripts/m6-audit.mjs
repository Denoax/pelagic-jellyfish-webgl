import {browserSession,sleep} from './view-r2-browser.mjs';
const url=process.argv[2]||'http://127.0.0.1:5196/?renderer=webgl&idle=300';
const b=await browserSession('../m6-evidence/'+(process.argv[3]||'before'));
try{
 await b.navigate(url);await sleep(6000);b.save('identity',await b.ev(`({browser:navigator.userAgent,renderer:window.__SPECIMEN__.rendererInfo(),deep:window.__JELLYFISH_WORLD__.getDeepState?.()})`));
 const states=[];await b.record();
 for(const mode of ['A','B','C','D'])for(const p of [.5,.72,1]){
  await b.ev(`window.__CAMERA_LAB__.select('${mode}');window.__CAMERA_LAB__.seek(${p});`);await sleep(1400);await b.shot(`${mode}-${p}`);
  states.push(await b.ev(`({camera:window.__JELLYFISH_WORLD__.getCameraState(),deep:window.__JELLYFISH_WORLD__.getDeepState?.(),animals:window.__JELLYFISH_WORLD__.getSwarmState()})`));
 }
 await b.finish();b.save('states',states);b.save('errors',b.errors);console.log(b.out);
}finally{await b.close();}
