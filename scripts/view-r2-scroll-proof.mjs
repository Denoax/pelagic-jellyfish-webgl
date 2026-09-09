import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession(process.argv[2]||'scroll-proof'),{ev,send}=b;
const assert=(v,m)=>{if(!v)throw Error(m);};
try{
 await b.navigate('http://127.0.0.1:5196/?direction=B&renderer=webgl&idle=300&scrollDebug=1');await sleep(6000);
 await ev(`(()=>{window.__PROOF__={frames:[],events:[],label:'quiet'};const c=window.__CAMERA_LAB__;c.onFrame=(_,time)=>window.__PROOF__.frames.push({at:performance.now(),time,label:window.__PROOF__.label,...c.summary(),position:c.camera.position.toArray(),quaternion:c.camera.quaternion.toArray()});})()`);
 const label=value=>ev(`window.__PROOF__.label=${JSON.stringify(value)}`);
 const wheel=async(d,n=1,delay=20)=>{for(let i=0;i<n;i++){await ev(`window.__PROOF__.events.push({at:performance.now(),label:window.__PROOF__.label,delta:${d}})`);await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:1020,y:440,deltaX:0,deltaY:d});await sleep(delay);}};
 // Establish a real pointer hit-test before the first wheel transaction. CDP can
 // otherwise dispatch an uncancelable compositor scroll to an unvisited point.
 await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:1020,y:440});await sleep(100);
 await b.record();await b.shot('01-quiet');await sleep(4000);
 await label('one-step');await wheel(100);await sleep(1800);await b.shot('02-one-step');
 await label('continued');await wheel(100,6,200);await sleep(1800);await b.shot('03-continued');
 await label('extreme');await wheel(1800,20,16);await b.shot('04-extreme');await label('settle');await sleep(2200);await b.shot('05-settled');
 await label('rapid-reverse-down');await wheel(700,4,30);await sleep(120);await label('rapid-reverse-up');await wheel(-300);await sleep(2000);await b.shot('06-reversed');
 await label('quiet-final');await sleep(3000);
 const d=await ev('window.__PROOF__');b.save('trace',d);await b.finish();
 const first=d.frames.filter(f=>f.label==='quiet'),last=d.frames.filter(f=>f.label==='quiet-final');
 const checks={quiet:first.every(f=>f.progress===first[0].progress)&&first.at(-1).time>first[0].time+3,finalQuiet:last.every(f=>f.progress===last[0].progress),maxVelocity:Math.max(...d.frames.map(f=>Math.abs(f.velocity))),maxLead:Math.max(...d.frames.map(f=>Math.abs(f.lead))),maxAcceleration:Math.max(...d.frames.map(f=>Math.abs(f.acceleration)))};
 assert(checks.quiet&&checks.finalQuiet,'Journey moves without input');assert(checks.maxVelocity<=.140001&&checks.maxAcceleration<=1.4001,'Motion caps exceeded');
 const event=d.events.find(e=>e.label==='one-step'),baseline=d.frames.findLast(f=>f.at<event.at),half=d.frames.find(f=>f.at>event.at+500);
 checks.oneStep500ms={progress:half.progress-baseline.progress,worldDistance:Math.hypot(...half.position.map((v,i)=>v-baseline.position[i]))};assert(checks.oneStep500ms.worldDistance>.12,'Ordinary input not visibly moving');
 const reverse=d.events.find(e=>e.label==='rapid-reverse-up'),negative=d.frames.find(f=>f.at>reverse.at&&f.velocity<0);checks.reverseMs=negative.at-reverse.at;assert(checks.reverseMs<300,'Reversal delayed');
 checks.units=await ev(`(()=>{const c=window.__CAMERA_LAB__,result=[];for(const [deltaY,deltaMode]of[[48,0],[3,1],[48/innerHeight,2]]){c.seek(.3);document.querySelector('.ocean-canvas').dispatchEvent(new WheelEvent('wheel',{deltaY,deltaMode,bubbles:true,cancelable:true}));result.push(c.destination);}return result;})()`);assert(checks.units.every(p=>Math.abs(p-.3288)<1e-8),'Browser deltaMode normalization failed');
 b.save('checks',{checks,errors:b.errors});console.log(b.out);
}catch(e){b.save('failure',{error:String(e),errors:b.errors});throw e;}finally{await b.close();}
