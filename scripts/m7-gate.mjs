import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../m7-evidence/architecture-gate');
try {
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__CONTEXTS__=[];const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){const result=get.call(this,type,...args);if(result&&/webgl|webgpu/.test(type)&&!__CONTEXTS__.includes(result))__CONTEXTS__.push(result);return result;};`});
 await b.navigate('http://127.0.0.1:5215/?renderer=webgl&idle=300');
 await b.ev(`__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1);window.__SAME__=__JELLYFISH_WORLD__;`);await sleep(5000);
 const state=()=>b.ev(`({idle:window.__OCEAN_IDLE__?.state(),camera:__JELLYFISH_WORLD__.getCameraState(),worldSame:__SAME__===__JELLYFISH_WORLD__,contexts:__CONTEXTS__.length,canvas:document.querySelectorAll('canvas').length,activation:__JELLYFISH_WORLD__.activationCount,renderer:__SPECIMEN__.rendererInfo(),optics:__BUBBLE_PASSAGE__.state()})`);
 b.save('before',await state());await b.shot('before');await b.record();
 await b.ev(`history.replaceState(null,'','?renderer=webgl&idle=1');document.activeElement.blur();window.dispatchEvent(new Event('focusin'));`);
 await sleep(6500);b.save('idle',await state());await b.shot('idle');await sleep(10000);
 await b.ev(`history.replaceState(null,'','?renderer=webgl&idle=300');`);await b.key('Enter');await sleep(2000);
 b.save('after',await state());await b.shot('after');await b.finish();b.save('errors',b.errors);console.log(JSON.stringify({errors:b.errors,state:await state()}));
} finally {await b.close();}
