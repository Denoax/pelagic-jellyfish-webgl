import { browserSession, sleep } from './view-r2-browser.mjs';
const [base='http://127.0.0.1:5222/', label='candidate', mode='still', direction='B', progress='1'] = process.argv.slice(2);
const portrait=mode==='portrait', width=portrait?390:1672, height=portrait?844:941;
const b=await browserSession(`../asset2-evidence/${label}`,width,height);
try {
  await b.send('Emulation.setVisibleSize',{width,height});
  await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
  await b.navigate(`${base}?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=${direction}&hold=${mode==='motion'?10000:14}`);
  await b.ev(`window.__CAMERA_LAB__.seek(${Number(progress)})`);
  await sleep(15500);
  if(mode==='motion') { await b.record(); await sleep(30000); await b.finish(); }
  await b.shot('frame');
  b.save('state',await b.ev('({camera:window.__JELLYFISH_WORLD__.getCameraState(),renderer:window.__SPECIMEN__.rendererInfo(),specimen:window.__SPECIMEN__.state(),deep:window.__SANCTUARY_REVIEW__.state(),environment:window.__ASSET2__?.state(),browser:navigator.userAgent})'));
  b.save('errors',b.errors); if(b.errors.length) throw Error(JSON.stringify(b.errors));
  console.log(b.out);
} finally { await b.close(); }
