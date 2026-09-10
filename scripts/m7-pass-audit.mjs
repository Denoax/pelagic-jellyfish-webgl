import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../m7-evidence/pass-audit');
try{
 await b.navigate('http://127.0.0.1:5215/?renderer=webgl&idle=300');await b.ev(`__CAMERA_LAB__.select('D');__CAMERA_LAB__.seek(1)`);await sleep(5000);
 await b.ev(`(async()=>{
  const T=await import(performance.getEntriesByType('resource').find(r=>/\\/three_webgpu\\.js/.test(r.name)).name);
  const original=T.WebGPURenderer.prototype.renderAsync,rows=[];
  T.WebGPURenderer.prototype.renderAsync=async function(scene,camera){
   const target=this.getRenderTarget(),kind=scene.isQuadMesh?'output':scene.children?.length===1?'simulation':'ocean';
   const before=this.info.render.calls,drawBefore=this.info.render.drawCalls;await original.call(this,scene,camera);
   if(rows.length<2000)rows.push({kind,target:target?[target.width,target.height]:null,calls:this.info.render.calls,before,drawCalls:this.info.render.drawCalls-drawBefore,frameCalls:this.info.render.frameCalls});
  };
  window.__M7_PASSES__={read:()=>rows.slice(),reset:()=>rows.length=0};
 })()`);
 await sleep(1500);b.save('normal',await b.ev('__M7_PASSES__.read()'));await b.ev(`history.replaceState(null,'','?idle=1');window.dispatchEvent(new Event('focusin'))`);await sleep(9000);
 await b.ev('__M7_PASSES__.reset()');await sleep(1500);b.save('idle',await b.ev('__M7_PASSES__.read()'));b.save('state',await b.ev('__OCEAN_IDLE__.state()'));
 console.log('pass audit complete');
}finally{b.save('errors',b.errors);await b.close()}
