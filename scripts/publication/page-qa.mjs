import {resolve,join} from 'node:path';
import {mkdirSync} from 'node:fs';
import {browser,wait,json} from './browser.mjs';
const [base,outArg]=process.argv.slice(2);const out=resolve(outArg);mkdirSync(out,{recursive:true});const b=await browser(out);const results=[];
const open=async url=>{await b.send('Page.navigate',{url});await b.until('document.readyState==="complete"');await wait(700);};
try{
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'}]});
 for(const[width,height]of[[1280,900],[820,900],[390,844]]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width,height});await open(base+'paper/');
  await b.shot(join(out,`page-${width}.png`));
  const layout=await b.ev(`({width:innerWidth,scroll:document.documentElement.scrollWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),videos:document.querySelectorAll('video').length,autoplay:[...document.querySelectorAll('video')].some(v=>v.autoplay),mathErrors:document.querySelectorAll('math merror').length})`);
  if(layout.scroll>width||layout.brokenImages.length||layout.autoplay)throw Error(JSON.stringify(layout));results.push({viewport:[width,height],layout});
  await b.ev(`document.getElementById('S9').scrollIntoView()`);await b.shot(join(out,`page-contact-${width}.png`));
 }
 await b.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await open(base+'paper/');
 const links=await b.ev(`[...new Set([...document.querySelectorAll('a')].map(a=>a.href).filter(u=>u.startsWith(location.origin)))].map(u=>u.split('#')[0])`);
 const checks=[];for(const link of new Set(links)){const r=await fetch(link,{method:'HEAD'});checks.push({path:new URL(link).pathname,status:r.status});if(!r.ok)throw Error('Broken link: '+link);}
 results.push({links:checks});
 // Play every full source clip in the actual browser. Capture endpoints separately from performance.
 for(let n=1;n<=(process.argv[4]==='layout'?0:12);n++){
  await b.ev(`document.querySelector('#S${n}').scrollIntoView()`);
  const point=await b.ev(`(()=>{const r=document.querySelector('#S${n} video').getBoundingClientRect();return{x:r.x+28,y:r.bottom-48}})()`);
  for(const type of ['mouseMoved','mousePressed','mouseReleased'])await b.send('Input.dispatchMouseEvent',{type,...point,button:type==='mouseMoved'?'none':'left',clickCount:1});
  try{await b.until(`document.querySelector('#S${n} video').currentTime>.1`,12000);}catch(e){console.log(await b.ev(`(()=>{const v=document.querySelector('#S${n} video');return{src:v.src,ready:v.readyState,network:v.networkState,error:v.error?.message,paused:v.paused,bounds:v.getBoundingClientRect().toJSON()}})()`));throw e;}
  await b.until(`document.querySelector('#S${n} video').ended`,45000);
  const playback=await b.ev(`(()=>{const v=document.querySelector('#S${n} video');return {id:'S${n}',duration:v.duration,time:v.currentTime,width:v.videoWidth,height:v.videoHeight,quality:v.getVideoPlaybackQuality(),error:v.error?.message||null}})()`);
  if(playback.error||playback.width!==1280)throw Error(JSON.stringify(playback));results.push(playback);console.log('Played',playback.id,playback.duration);
 }
 await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'dark'},{name:'prefers-reduced-motion',value:'reduce'}]});await open(base+'paper/');await b.shot(join(out,'page-dark-reduced.png'));results.push({reducedMotion:await b.ev(`[...document.querySelectorAll('video')].every(v=>v.paused&&!v.autoplay)`)});
 await open(base);await b.shot(join(out,'readme.png'));
 await open(base+'paper/pelagic.html');await b.shot(join(out,'paper-html.png'));
 await b.key('Tab');results.push({keyboardFocus:await b.ev('document.activeElement.tagName')});
 json(join(out,'page-qa.json'),{results,errors:b.errors,browser:await b.version()});
 if(b.errors.length)throw Error('Browser console errors: '+JSON.stringify(b.errors));
}finally{await b.close();}
