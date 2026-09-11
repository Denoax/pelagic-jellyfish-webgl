import {browserSession,sleep} from './view-r2-browser.mjs';
const [base,label,progress='1',phases='14,24,34,44']=process.argv.slice(2),times=phases.split(',').map(Number);
const b=await browserSession(`../asset2-evidence/temporal/${label}`,1672,941);
try{
 await b.send('Emulation.setVisibleSize',{width:1672,height:941});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate(`${base}?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=B&hold=${times[0]}`);await b.ev(`__CAMERA_LAB__.seek(${Number(progress)})`);
 for(const time of times){
  await b.ev(`__SPECIMEN__.holdAt(${time})`);
  for(let n=0;n<400;n++){if(await b.ev(`__SPECIMEN__.state().time>=${time}`))break;await sleep(100);}
  const state=await b.ev('({phase:__SPECIMEN__.state(),camera:__JELLYFISH_WORLD__.getCameraState(),renderer:__SPECIMEN__.rendererInfo()})');
  if(state.phase.time!==time)throw Error('Unmatched phase');
  await b.shot(`t${time}`);b.save(`t${time}`,state);
 }
 b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
}finally{await b.close();}
