import {browserSession,sleep} from './view-r2-browser.mjs';
const [url='http://127.0.0.1:5198/?renderer=webgl&idle=300',label='review',portrait='0']=process.argv.slice(2);
const width=portrait==='1'?390:1280,height=portrait==='1'?844:900;
const b=await browserSession('../m6-evidence/'+label,width,height),states=[];
const state=()=>b.ev(`({camera:window.__JELLYFISH_WORLD__.getCameraState(),deep:window.__JELLYFISH_WORLD__.getDeepState(),animals:window.__JELLYFISH_WORLD__.getSwarmState(),renderer:window.__SPECIMEN__.rendererInfo(),renderStats:window.__SANCTUARY_REVIEW__?.renderStats()})`);
const shot=async name=>{await b.shot(name);states.push({name,...await state()});};
const wheel=async(direction,steps=40)=>{for(let i=0;i<steps;i++){await b.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:width*.7,y:height*.55,deltaY:direction*35,deltaX:0});await sleep(150);}await sleep(1500);};
try{
 await b.navigate(url);await sleep(6000);b.save('identity',await b.send('Browser.getVersion'));
 await b.record();
 for(const mode of portrait==='1'?['B','D']:['B','D','A']){
  await b.ev(`window.__CAMERA_LAB__.select('${mode}');window.__CAMERA_LAB__.seek(.4)`);await sleep(1500);
  await shot(mode+'-approach');
  await wheel(1,16);await shot(mode+'-first');await wheel(1,25);await shot(mode+'-end');
  await sleep(7000);
  if(mode==='B'){await wheel(-1,24);await shot('reverse');await wheel(1,24);await shot('redescend');}
 }
 if(portrait!=='1'){
  await b.ev(`window.__CAMERA_LAB__.select('explore')`);
  const start=Date.now();
  while(Date.now()-start<16000){const a=(Date.now()-start)/16000*Math.PI*2;
   await b.ev(`(()=>{const c=window.__CAMERA_LAB__.camera;c.position.set(${-4.6+Math.sin(a)*11},-6,${-24+Math.cos(a)*11});c.lookAt(-4.6,-6,-24);c.updateMatrixWorld();})()`);await sleep(60);
  }
  await shot('explore-orbit');
  await b.ev(`(()=>{const c=window.__CAMERA_LAB__.camera;c.position.set(-11,-2,-19);c.lookAt(-4.3,-.5,-24);c.updateMatrixWorld();})()`);await sleep(2000);await shot('smoker');await sleep(10000);
  await b.ev(`(()=>{const c=window.__CAMERA_LAB__.camera;c.position.set(-1,-12,-20);c.lookAt(-2.5,-14.8,-22.5);c.updateMatrixWorld();})()`);await sleep(2500);await shot('diffuse-detail');await sleep(4000);
  await b.send('Emulation.setDeviceMetricsOverride',{width:820,height:900,deviceScaleFactor:1,mobile:false});await sleep(2000);await shot('narrow-resize');
 }
 await b.finish();b.save('states',states);b.save('errors',b.errors);console.log(b.out);
}finally{await b.close();}
