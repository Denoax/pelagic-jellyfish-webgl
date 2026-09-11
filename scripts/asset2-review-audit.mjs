import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../asset2-evidence/final/viewer-audit');
try{
 await b.send('Page.navigate',{url:'http://127.0.0.1:5222/docs/implementation/asset2-background/review.html'});await sleep(1500);
 await b.ev("document.querySelectorAll('img').forEach(i=>i.loading='eager')");
 for(let i=0;i<100;i++){if(await b.ev('[...document.images].every(i=>i.complete)'))break;await sleep(200);}
 const images=await b.ev('[...document.images].map(i=>({src:i.getAttribute("src"),width:i.naturalWidth,height:i.naturalHeight,complete:i.complete}))');
 assert.ok(images.every(i=>i.width>0),'Missing evidence images');
 const clips=[];
 for(let i=0;i<8;i++){
  await b.ev(`(async()=>{const v=document.querySelectorAll('video')[${i}];v.muted=true;v.scrollIntoView();await v.play()})()`);await sleep(900);
  const s=await b.ev(`(()=>{const v=document.querySelectorAll('video')[${i}];v.pause();return{src:v.getAttribute('src'),duration:v.duration,time:v.currentTime,width:v.videoWidth,height:v.videoHeight,error:v.error?.message}})()`);
  assert.ok(s.time>0&&s.duration>=20&&!s.error);clips.push(s);
 }
 await b.ev('scrollTo(0,0)');await b.shot('viewer');
 await b.click('#fixed');let page;
 for(let i=0;i<100;i++){page=(await(await fetch('http://127.0.0.1:9279/json/list')).json()).find(p=>p.url.includes('asset2qa=1'));if(page)break;await sleep(100);}
 assert.ok(page,'QA launcher opened its review window');
 const ws=new WebSocket(page.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let id=0;const query=expression=>new Promise((resolve,reject)=>{const n=++id;const listener=({data})=>{const m=JSON.parse(data);if(m.id!==n)return;ws.removeEventListener('message',listener);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result.result?.value);};ws.addEventListener('message',listener);ws.send(JSON.stringify({id:n,method:'Runtime.evaluate',params:{expression,returnByValue:true}}));});
 let fixture;
 for(let i=0;i<500;i++){fixture=await query('window.__SPECIMEN__&&window.__CAMERA_LAB__?({camera:__JELLYFISH_WORLD__.getCameraState(),phase:__SPECIMEN__.state(),renderer:__SPECIMEN__.rendererInfo()}):null');if(fixture?.phase.time===8&&fixture.camera.progress===.55)break;await sleep(100);}
 assert.equal(fixture?.phase.time,8);assert.equal(fixture.camera.progress,.55);assert.equal(fixture.renderer.backend,'WebGL 2');
 ws.close();await b.send('Target.closeTarget',{targetId:page.id});
 b.save('result',{images,clips,fixture,errors:b.errors});assert.equal(b.errors.length,0);console.log('Evidence viewer: all images loaded, eight clips played, fixed-pose launcher verified');
}finally{await b.close();}
