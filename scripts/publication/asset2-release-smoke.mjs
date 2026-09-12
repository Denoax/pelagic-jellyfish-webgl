// Verify the approved background exists in the actual production bundle.
// Uses the pre-existing read-only scene inspection and native wheel input.
import {browser,wait,json} from './browser.mjs';
import assert from 'node:assert/strict';
const [url,out]=process.argv.slice(2);
if(!url||!out)throw Error('Provide production URL and external evidence directory');
const b=await browser(out);
try{
 await b.navigate(url+'?idle=300&qaDebug&direction=B');
 await b.until("document.querySelector('[data-testid=idle-screen]')?.dataset.ready==='true'");
 const inspect=()=>b.ev(`(()=>{const w=__JELLYFISH_WORLD__,g=w.scene.getObjectByName('asset2-far-spire-field');return{backend:w.renderer,canvasCount:document.querySelectorAll('canvas.ocean-canvas').length,devControls:!!window.__ASSET2__,group:!!g,visible:g?.visible,batches:g?.children.length,instances:g?.children.reduce((n,m)=>n+m.count,0),camera:w.getCameraState()}})()`);
 const opening=await inspect();
 assert.equal(opening.backend,'WebGL 2');assert.equal(opening.canvasCount,1);
 assert.equal(opening.group,true);assert.equal(opening.batches,4);assert.equal(opening.instances,30);assert.equal(opening.devControls,false);
 await b.shot(out+'/opening.png');await b.record(out+'/descent');
 for(let i=0;i<8;i++){
  await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:640,y:450,deltaX:0,deltaY:115});
  await wait(1200);
 }
 await wait(2000);const deep=await inspect();
 assert(deep.camera.progress>.5&&deep.camera.progress<.65,'Native descent reached the approved background range');assert.equal(deep.visible,true);
 await b.shot(out+'/background.png');await wait(3000);const motion=await b.finish();
 assert.equal(b.errors.length,0,JSON.stringify(b.errors));json(out+'/result.json',{opening,deep,motion,errors:b.errors});
 console.log(JSON.stringify({opening,deep,motion,errors:b.errors}));
}finally{await b.close()}
