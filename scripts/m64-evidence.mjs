import {browserSession,sleep} from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5207/',label='candidate',only='']=process.argv.slice(2);
const cases=[
 ['explore','explore',[14,-4,-8],[-2.4,-9,-27]],
 ['deep','D'],['drift','B'],
 ['ravine','explore',[10,-7,-8],[3,-15,-30]],
 ['base','explore',[5,-10,-15],[-2.4,-14,-24]],
 ['colony','explore',[1,-11,-15],[-.3,-15,-22.6]],
 ['shelf','explore',[-3,-8,-9],[-10,-12,-19]],
 ['spires','explore',[12,-7,-17],[7,-13,-32]],
 ['illumination','C'],['portrait','D',null,null,390,844]
];
for(const[name,mode,eye,look,width=1280,height=900]of cases){
 if(only&&name!==only)continue;
 const b=await browserSession(`../m6-4-evidence/${label}/${name}`,width,height);
 try{
  const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:width+20,height:height+100}});await b.send('Emulation.setVisibleSize',{width,height});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
  await b.navigate(`${base}?renderer=webgl&idle=300&hold=14`);
  await b.ev(`window.__CAMERA_LAB__.select('${mode}');window.__CAMERA_LAB__.seek(1)`);
  if(eye)await b.ev(`(()=>{const c=window.__CAMERA_LAB__.camera;c.position.set(${eye});c.lookAt(${look});c.updateMatrixWorld()})()`);
  await sleep(15500);await b.shot('wide');
  b.save('state',await b.ev('({camera:window.__JELLYFISH_WORLD__.getCameraState(),deep:window.__JELLYFISH_WORLD__.getDeepState(),renderer:window.__SPECIMEN__.rendererInfo(),animal:window.__SPECIMEN__.state(),sanctuary:window.__SANCTUARY_REVIEW__.state(),buffers:[...document.querySelectorAll("canvas")].map(c=>[c.width,c.height])})'));
  b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));console.log(label+' '+name);
 }finally{await b.close()}
}
