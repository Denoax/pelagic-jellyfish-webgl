import {browserSession,sleep} from './view-r2-browser.mjs';
const label=process.argv[2]||'phase-5/r2';
const b=await browserSession(`../asset2-evidence/${label}`,1672,941);
try{
 await b.send('Emulation.setVisibleSize',{width:1672,height:941});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate('http://127.0.0.1:5222/?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=B&hold=8');await b.ev('__CAMERA_LAB__.seek(.55)');
 for(let n=0;n<300;n++){if(await b.ev('__SPECIMEN__.state().time>=8'))break;await sleep(100);}
 if(!await b.ev('__SPECIMEN__.state().time===8'))throw Error('Fixed state not reached');
 await b.shot('on');
 for(const name of ['spires','haze','outer','atmosphere','light','particles','ao','shafts','dither']){await b.ev(`__ASSET2__.toggle('${name}',false)`);await sleep(250);await b.shot(`${name}-off`);await b.ev(`__ASSET2__.toggle('${name}',true)`);}
 b.save('state',await b.ev('({camera:__JELLYFISH_WORLD__.getCameraState(),renderer:__SPECIMEN__.rendererInfo(),phase:__SPECIMEN__.state(),environment:__ASSET2__.state(),render:__SANCTUARY_REVIEW__.renderStats()})'));b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
}finally{await b.close();}
