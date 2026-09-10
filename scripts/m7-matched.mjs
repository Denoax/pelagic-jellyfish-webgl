import {browserSession,sleep} from './view-r2-browser.mjs';
const[base,label]=process.argv.slice(2);
for(const[name,mode,p]of[['opening','B',0],['school','B',.5],['bubbles','B',.36],['sanctuary','D',1],['explore','D',1]]){
 const b=await browserSession('../m7-evidence/matched/'+label+'-'+name);
 try{
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
  await b.navigate(`${base}?renderer=webgl&idle=300&hold=14`);await b.ev(`__CAMERA_LAB__.select('${mode}');__CAMERA_LAB__.seek(${p})`);await sleep(15500);
  if(name==='explore')await b.ev(`__CAMERA_LAB__.select('explore')`);
  b.save('state',await b.ev(`({camera:__JELLYFISH_WORLD__.getCameraState(),animal:__SPECIMEN__.state(),renderer:__SPECIMEN__.rendererInfo(),bubbles:__BUBBLE_PASSAGE__.state(),sanctuary:__SANCTUARY_REVIEW__.state()})`));await b.shot('frame');b.save('errors',b.errors);console.log(label+' '+name);
 }finally{await b.close()}
}
