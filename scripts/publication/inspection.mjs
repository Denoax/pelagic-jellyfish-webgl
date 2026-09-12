import {resolve,join} from 'node:path';
import {mkdirSync} from 'node:fs';
import {browser,wait,runtimeSha,json,setView,enterIdle,exitIdle} from './browser.mjs';
const [base,outArg]=process.argv.slice(2);if(!base||!outArg)throw Error('Usage: inspection.mjs BASE_URL OUTPUT');
const out=resolve(outArg);mkdirSync(out,{recursive:true});
const b=await browser(out);const records=[];
try{
 await b.navigate(base+'?renderer=webgl&specimen=1&hold=9.4&idle=300');await b.until('__SPECIMEN__.state().time>=9.4');
 for(let i=0;i<4;i++){
  const t=[9.4,10.1,11.5,12.9][i];await b.ev(`__SPECIMEN__.holdAt(${t})`);await b.until(`__SPECIMEN__.state().time>=${t}`);await wait(150);
  await b.shot(join(out,`pulse-${i}.png`));records.push({id:`pulse-${i}`,runtimeSha,state:await b.state()});
 }
 await b.navigate(base+'?renderer=webgl&idle=300');await b.until('window.__OCEAN_IDLE__?.state().ready');await setView(b,'B',.35);await wait(4300);await b.ev('__SPECIMEN__.pause()');await wait(200);
 const frozen=await b.state(),bubble=await b.ev('__BUBBLE_PASSAGE__.state()');
 await b.shot(join(out,'optics-on.png'));await b.ev('__BUBBLE_PASSAGE__.optics(false)');await wait(200);await b.shot(join(out,'optics-off.png'));
 records.push({id:'bubble-optics-ablation',runtimeSha,state:frozen,bubble,after:await b.state(),notes:'Existing review API disables refractive contribution only; frozen scene, same resolution/pose. Ambient films remain. Diagnostic only, no source changes.'});
 await b.ev('__BUBBLE_PASSAGE__.optics(true);__SPECIMEN__.resume()');
 for(const p of [.3,.5,.7]){await setView(b,'B',p);await wait(2000);await b.shot(join(out,`population-${p}.png`));records.push({id:`population-${p}`,runtimeSha,state:await b.state(),population:await b.ev('__POPULATION__.state()'),notes:'Actual tier assignments at different journey positions; not a forced same-pose quality ablation.'});}
 for(const [width,height]of [[820,900],[390,844],[1280,900]]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await b.send('Emulation.setVisibleSize',{width,height});await wait(2200);
  await b.shot(join(out,`ocean-${width}.png`));await enterIdle(b);await wait(5800);await b.shot(join(out,`idle-${width}.png`));
  records.push({id:`responsive-${width}`,runtimeSha,state:await b.state(),notes:'Browser emulation; not physical-device validation. Resize of the existing runtime, not fresh mobile initialization.'});await exitIdle(b);
 }
 json(join(out,'inspection.json'),{runtimeSha,browser:await b.version(),records,errors:b.errors});
}finally{await b.close();}
