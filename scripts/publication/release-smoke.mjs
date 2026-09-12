// Production/static-host smoke test; never exposes DEV hooks or changes runtime.
import {browser,wait} from './browser.mjs';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const [url,out]=process.argv.slice(2);if(!url||!out)throw Error('Provide production URL and external output directory');
const b=await browser(out);
try{
 await b.navigate(url+'?idle=300&specimen=1&bubbleReview=1');
 await b.until("document.querySelector('[data-testid=idle-screen]')?.dataset.ready==='true'");
 const state=await b.ev(`({backend:__JELLYFISH_WORLD__.renderer,release:__JELLYFISH_WORLD__.oceanRelease,oceanCanvases:document.querySelectorAll('canvas.ocean-canvas').length,canvases:[...document.querySelectorAll('canvas')].map(c=>({class:c.className,hidden:c.hidden})),review:['__SPECIMEN__','__POPULATION__','__BUBBLE_PASSAGE__','__OCEAN_IDLE__','__CAMERA_LAB__'].filter(k=>!!window[k]),camera:__JELLYFISH_WORLD__.getCameraState()})`);
 assert.equal(state.backend,'WebGL 2');assert.equal(state.release,'milestone-2');assert.deepEqual(state.review,[]);assert.equal(state.oceanCanvases,1); // Existing hidden 2D View guide is not another ocean renderer.
 await b.shot(out+'/ocean.png');
 const point=await b.ev(`(()=>{for(let i=0;i<8;i++){let p=__JELLYFISH_WORLD__.getJellyScreenPoint(i);if(p&&p.x>30&&p.x<innerWidth-30&&p.y>80&&p.y<innerHeight-60)return p}return null})()`);
 const before=await b.ev('__JELLYFISH_WORLD__.activationCount');
 if(point)for(const type of ['mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:'left',clickCount:1});
 const activation=await b.ev('__JELLYFISH_WORLD__.activationCount');assert(activation>before,'Activation');
 await wait(600); // Respect the existing 500 ms activity-scheduling throttle.
 await b.ev("history.replaceState(null,'','?idle=1');document.activeElement.blur();window.dispatchEvent(new Event('focusin'))");
 await b.until("document.documentElement.classList.contains('idle-active')");await wait(5500);await b.shot(out+'/idle.png');
 await b.ev("history.replaceState(null,'','?idle=300')");await b.key('Enter');await b.until("!document.documentElement.classList.contains('idle-active')");await wait(1500);await b.shot(out+'/returned.png');assert.equal(b.errors.length,0,JSON.stringify(b.errors));
 const result={state,activation,errors:b.errors,idleEntryReturn:'PASS'};writeFileSync(out+'/result.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await b.close()}
