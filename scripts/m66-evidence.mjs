import {browserSession,sleep} from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5211/',label='candidate',only='']=process.argv.slice(2);
const cases=[
 ['explore','explore',[1,-11,-15],[-.3,-15,-22.6]],
 ['stacked','explore',[-3,-11,-15],[-8,-13,-22]],
 ['ravine-edge','explore',[5,-12,-15],[2,-15,-22]],
 ['low','explore',[-2,-13.5,-12],[-10,-13,-22]],
 ['low-clear','explore',[2,-12.2,-12],[-6,-12.3,-20]],
 ['high','explore',[-4,-6,-14],[-9,-13,-22]],
 ['documentary','A'],
 ['wide','explore',[14,-4,-8],[-2.4,-9,-27]],
 ['chimney','explore',[4,-5,-15],[-2.4,-5,-24]],
 ['grain','explore',[1,-12.2,-19],[-.3,-14.5,-22.6]],
 ['glow-close','explore',[1,-12,-19],[-.3,-14.5,-22.6]],
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
 const b=await browserSession(`../m6-6-evidence/${label}/${name}`,width,height);
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
