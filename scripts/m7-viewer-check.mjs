import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../m7-evidence/viewer-check');
try {
 await b.send('Page.navigate',{url:'http://127.0.0.1:5216/'});await sleep(1500);
 await b.ev(`document.querySelectorAll('img').forEach(i=>i.loading='eager')`);
 for(let i=0;i<100;i++){if(await b.ev(`[...document.images].every(i=>i.complete&&i.naturalWidth>0)`))break;await sleep(100)}
 const images=await b.ev(`[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0}))`);
 assert.ok(images.every(i=>i.loaded));
 const videos=[];
 for(let i=0;i<8;i++){
  const v=await b.ev(`(async()=>{const v=document.querySelectorAll('video')[${i}],src=v.getAttribute('src');const loaded=new Promise((resolve,reject)=>{v.onloadedmetadata=resolve;v.onerror=()=>reject(Error('Video load failed'));setTimeout(()=>reject(Error('Metadata timeout')),15000)});v.preload='metadata';v.load();await loaded;const result={src,duration:v.duration,width:v.videoWidth,height:v.videoHeight};v.removeAttribute('src');v.load();return result})()`);
  assert.ok(v.duration>5);assert.deepEqual([v.width,v.height],v.src.includes('portrait')?[390,844]:[1280,900]);videos.push(v);
 }
 await b.ev(`(async()=>{const v=document.querySelector('video');v.src='motion/sanctuary/motion.mp4';v.muted=true;await v.play()})()`);await sleep(3000);
 const time=await b.ev(`document.querySelector('video').currentTime`);assert.ok(time>2);assert.equal(b.errors.length,0);
 await b.shot('playing');b.save('assets',{images,videos});b.save('playback',{time,errors:b.errors});console.log(JSON.stringify({videos:videos.length,images:images.length,time,errors:b.errors.length}));
}finally{await b.close()}
