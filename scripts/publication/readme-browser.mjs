// Inspect the rendered Markdown, not the ocean. Reuses the existing browser harness.
import {browser,wait} from './browser.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const [url,outArg]=process.argv.slice(2);if(!url||!outArg)throw Error('Usage: readme-browser.mjs LOCAL_REVIEW_URL EXTERNAL_OUTPUT');
const out=resolve(outArg);mkdirSync(out,{recursive:true});const b=await browser(out);const results=[];
try{
 await b.send('Page.navigate',{url});await b.until(`document.documentElement.dataset.ready==='true'`);await b.until(`[...document.images].every(i=>i.complete&&i.naturalWidth>0)`);
 const modes=[[1280,900],[820,900],[390,844]];
 for(const [width,height]of modes){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width,height});await b.ev('scrollTo(0,0)');await wait(300);
  const layout=await b.ev(`({width:innerWidth,documentWidth:document.documentElement.scrollWidth,images:[...document.images].map(i=>({src:i.getAttribute('src'),complete:i.complete,naturalWidth:i.naturalWidth})),math:document.querySelectorAll('math[display="block"]').length,mermaid:!!document.querySelector('.mermaid svg'),missingAnchors:[...document.querySelectorAll('a[href^="#"]')].filter(a=>!document.getElementById(a.hash.slice(1))&&!document.querySelector('a[name="'+a.hash.slice(1)+'"]')).map(a=>a.hash)})`);
  assert(layout.documentWidth<=width,JSON.stringify(layout));assert.equal(layout.math,22);assert(layout.mermaid);assert.deepEqual(layout.missingAnchors,[]);results.push(layout);
  await b.shot(join(out,`opening-${width}.png`));
  for(const id of ['1-procedural-jellyfish-geometry','8-live-refraction-and-bubble-passage','10-ocean-to-glass-liquid-system','rendering-architecture','performance']){
   await b.ev(`document.getElementById('${id}').scrollIntoView()`);await wait(200);await b.shot(join(out,`${id}-${width}.png`));
  }
 }
 await b.send('Emulation.setDeviceMetricsOverride',{width:1280,height:900,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 for(const name of ['hero','appendages','refraction','liquid']){
  await b.ev(`document.querySelector('img[src="docs/readme/${name}.gif"]').scrollIntoView({block:'center'})`);
  for(let i=0;i<3;i++){await wait(1500);await b.shot(join(out,`${name}-play-${i}.png`));}
 }
 assert.equal(b.errors.length,0,JSON.stringify(b.errors));
 writeFileSync('docs/readme/browser-validation.json',JSON.stringify({status:'PASS',browser:await b.version(),scope:'Local GFM/MathML/Mermaid emulation, not remote GitHub rendering or physical-device validation. Four animated previews observed in real browser; no artwork recapture.',results,errors:b.errors},null,2)+'\n');
 console.log('README desktop/narrow/portrait, native math, Mermaid, anchors, media: PASS');
}finally{await b.close();}
