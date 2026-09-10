import {browserSession,sleep} from './view-r2-browser.mjs';
const[base='http://127.0.0.1:5213/',label='candidate',withIdle='0']=process.argv.slice(2);
for(const[name,mode,p]of[['opening','B',0],['mid','B',.5],['sanctuary','D',1]]){
 const b=await browserSession(`../m6-6-1-evidence/matched/${label}-${name}`);
 try{
  const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
  await b.navigate(`${base}?renderer=webgl&idle=300&hold=14`);await b.ev(`__CAMERA_LAB__.select('${mode}');__CAMERA_LAB__.seek(${p});window.__HOTFIX_WORLD__=window.__JELLYFISH_WORLD__`);await sleep(15500);
  const state=()=>b.ev('({camera:__JELLYFISH_WORLD__.getCameraState(),animal:__SPECIMEN__.state(),renderer:__SPECIMEN__.rendererInfo(),sanctuary:__SANCTUARY_REVIEW__.state(),optics:__BUBBLE_PASSAGE__.state(),sameWorld:__HOTFIX_WORLD__===__JELLYFISH_WORLD__})');
  b.save('before',await state());await b.shot('before');
  if(withIdle==='1'){
   await b.ev("document.activeElement.blur();history.replaceState(null,'','?renderer=webgl&idle=1');window.dispatchEvent(new Event('focusin'))");
   let idle=false;for(let i=0;i<80;i++){idle=await b.ev("!!document.querySelector('.idle-screen.is-active')");if(idle)break;await sleep(100);}if(!idle)throw Error('Idle did not activate');await sleep(3200);await b.shot('idle');
   await b.ev("history.replaceState(null,'','?renderer=webgl&idle=300')");await b.key('Enter');await sleep(3300);b.save('after',await state());await b.shot('after');
  }
  b.save('errors',b.errors);if(b.errors.length)throw Error('Browser errors');console.log(label+' '+name+' PASS');
 }finally{await b.close()}
}
