import {browserSession,sleep} from './view-r2-browser.mjs';
import {spawnSync} from 'node:child_process';
const [base='http://127.0.0.1:5203/',label='before',diagnostic='0']=process.argv.slice(2);
const cases=[['drift','B',1280,900],['deep','D',1280,900],['documentary','A',1280,900],['intimate','C',1280,900],['portrait','D',390,844],['explore','explore',1280,900]];
function histogram(path,w,h){
 const r=spawnSync('/usr/bin/ffmpeg',['-v','error','-i',path,'-f','rawvideo','-pix_fmt','rgb24','-'],{maxBuffer:w*h*4});if(r.status)throw Error(String(r.stderr));
 const bins=Array(16).fill(0),rgb=[0,0,0];let count=0,near=0,dark=0,warm=0,violet=0,teal=0,sum=0;
 // Exclude persistent DOM chrome. Encoded sRGB luma, not scene-linear radiance.
 for(let y=70;y<h-85;y++)for(let x=15;x<w-15;x++){
  const i=(y*w+x)*3,[r0,g,b]=r.stdout.subarray(i,i+3),v=.2126*r0+.7152*g+.0722*b;
  count++;sum+=v;bins[Math.min(15,Math.floor(v/16))]++;near+=v<8;dark+=v<16;
  rgb[0]+=r0;rgb[1]+=g;rgb[2]+=b;
  if(v>=8){warm+=r0>g*1.12&&g>b*1.12;violet+=b>g*1.15&&r0>g*1.1;teal+=g>r0*1.2&&g>b*.75;}
 }
 return{metric:'encoded sRGB luma 0–255; cropped UI margins; not radiometric luminance',mean:sum/count,nearBlackBelow8:near/count*100,darkBelow16:dark/count*100,bins,meanRGB:rgb.map(x=>x/count),warmPercent:warm/count*100,violetPercent:violet/count*100,tealPercent:teal/count*100};
}
for(const [name,mode,width,height]of cases){
 const b=await browserSession(`../m6-3-evidence/${label}/${name}`,width,height);
 try{
  const {windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:width+20,height:height+100}});await b.send('Emulation.setVisibleSize',{width,height});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
  await b.navigate(`${base}?renderer=webgl&idle=300&hold=14`);
  await b.ev(`window.__CAMERA_LAB__.select('${mode}');window.__CAMERA_LAB__.seek(1)`);
  if(mode==='explore')await b.ev(`(()=>{const c=window.__CAMERA_LAB__.camera;c.position.set(14,-4,-8);c.lookAt(-2.4,-9,-27);c.updateMatrixWorld()})()`);
  await sleep(15500);
  await b.shot('wide');b.save('histogram',histogram(`${b.out}/wide.png`,width,height));
  b.save('state',await b.ev('({camera:window.__JELLYFISH_WORLD__.getCameraState(),deep:window.__JELLYFISH_WORLD__.getDeepState(),renderer:window.__SPECIMEN__.rendererInfo(),animal:window.__SPECIMEN__.state(),buffers:[...document.querySelectorAll("canvas")].map(c=>[c.width,c.height])})'));
  if(diagnostic==='1'&&name==='deep'){
   await b.ev(`(async()=>{const url=performance.getEntriesByType('resource').map(r=>r.name).find(n=>n.includes('/three_webgpu.js'));const T=await import(url);const proto=T.WebGPURenderer.prototype,original=proto.renderAsync;await new Promise(resolve=>{proto.renderAsync=function(scene,...args){if(scene.getObjectByName('abyssal-hydrothermal-sanctuary')){window.__AUDIT_SCENE__=scene;proto.renderAsync=original;resolve();}return original.call(this,scene,...args)};});})()`);
   b.save('geology',await b.ev(`(()=>{const s=window.__AUDIT_SCENE__.getObjectByName('abyssal-hydrothermal-sanctuary'),c=window.__CAMERA_LAB__.camera;return s.children.map(o=>({name:o.name,material:o.material?.name,fog:o.material?.fog,distance:c.position.distanceTo(o.position)}));})()`));
   await b.ev(`(()=>{const s=window.__AUDIT_SCENE__.getObjectByName('abyssal-hydrothermal-sanctuary');s.traverse(o=>{if(o.material&&!o.material.transparent){o.material.fog=false;o.material.needsUpdate=true}})})()`);
   await sleep(2000);await b.shot('diagnostic-no-geology-fog');b.save('histogram-no-fog',histogram(`${b.out}/diagnostic-no-geology-fog.png`,width,height));
  }
  b.save('errors',b.errors);if(b.errors.length)throw Error('Browser errors '+name);console.log(name+' captured');
 }finally{await b.close()}
}
