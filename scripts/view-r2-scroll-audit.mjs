import {browserSession,sleep} from './view-r2-browser.mjs';
const [url='http://127.0.0.1:5194/?renderer=webgl&idle=300',label='rejected-scroll']=process.argv.slice(2);
const b=await browserSession(label);const {ev,send}=b;
try{
 await b.navigate(url);await sleep(6000);
 if(process.env.M52_TUNING)await ev(`Object.assign(window.__CAMERA_LAB__.journey,${process.env.M52_TUNING})`);
 b.save('metadata',await ev(`({browser:navigator.userAgent,renderer:window.__SPECIMEN__.rendererInfo(),scrollHeight:document.documentElement.scrollHeight,viewport:[innerWidth,innerHeight],state:window.__CAMERA_LAB__.summary()})`));
 await b.shot('collapsed');
 await ev(`(()=>{const c=window.__CAMERA_LAB__;window.__INPUT_AUDIT__={events:[],frames:[],label:'',start:0};let previous=null;
 const state=()=>({target:c.destination??c.spring.position,actual:c.spring.position,velocity:c.spring.velocity,follower:c.journey?.sensitivity?'bounded-velocity':'legacy',omega:c.spring.omega??null,responseGain:c.journey?.sensitivity?({cinematic:52,balanced:72,responsive:92}[c.spring.response]):null,speedCap:c.spring.maxSpeed??null,accelerationCap:c.spring.maxAcceleration??null,leadCap:c.journey?.maxLead??null,scrollY,position:c.camera.position.toArray()});
 window.addEventListener('wheel',e=>{const mode=e.deltaMode,normalized=e.deltaY*(mode===1?16:mode===2?innerHeight:1);const item={at:performance.now(),label:window.__INPUT_AUDIT__.label,deltaY:e.deltaY,deltaMode:mode,normalized,direction:Math.sign(normalized),trusted:e.isTrusted,before:state()};window.__INPUT_AUDIT__.events.push(item);requestAnimationFrame(()=>{item.after=state();});},{capture:true,passive:true});
 c.onFrame=()=>{const a=window.__INPUT_AUDIT__;const s=state(),now=performance.now(),dt=previous?(now-previous.at)/1000:0;const accel=dt?(s.velocity-previous.velocity)/dt:0;a.frames.push({at:now,label:a.label,...s,acceleration:accel,cameraDelta:previous?Math.hypot(...s.position.map((v,i)=>v-previous.position[i])):0,speedClamped:s.speedCap?Math.abs(s.velocity)>=s.speedCap-1e-7:false,accelerationClamped:s.accelerationCap?Math.abs(accel)>=s.accelerationCap-.001:false});previous={...s,at:now};};})()`);
 const reset=async(mode,p)=>{await ev(`(()=>{window.__INPUT_AUDIT__.label='';const c=window.__CAMERA_LAB__;c.select('${mode}');Object.assign(c.spring,{position:${p},velocity:0,debt:0});c.destination=${p};c.lastRaw=${p};window.scrollTo({top:${p}*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});})()`);await sleep(1400);};
 const wheel=async(delta,n=1,delay=70)=>{for(let i=0;i<n;i++){await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:1050,y:450,deltaX:0,deltaY:delta});await sleep(delay);}};
 await b.record();
 for(const [mode,start,name,d,n,delay] of [['A',0,'A-opening-one-notch',100,1,70],['B',0,'B-opening-one-notch',100,1,70],['B',.2,'one-notch',100,1,70],['B',.2,'several-notches',100,4,140],['B',.2,'fast-spin',1200,10,16],['B',.2,'trackpad-small',4,20,20],['B',.2,'trackpad-large',80,20,16]]){
  await reset(mode,start);await ev(`window.__INPUT_AUDIT__.label=${JSON.stringify(name)}`);await sleep(400);await wheel(d,n,delay);await sleep(2300);await b.shot(name);
 }
 await reset('B',.2);await ev(`window.__INPUT_AUDIT__.label='reverse'`);await wheel(700,4,40);await sleep(300);await wheel(-100,2,70);await sleep(2800);
 b.save('trace',await ev('window.__INPUT_AUDIT__'));await b.finish();
 if(await ev('Boolean(document.querySelector(".view-trigger"))')){await b.click('.view-trigger');await b.shot('menu-open');}
 console.log(b.out);
}finally{await b.close();}
