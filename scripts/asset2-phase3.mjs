import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../asset2-evidence/phase-3/local-reveal',1672,941);
try{
 await b.send('Emulation.setVisibleSize',{width:1672,height:941});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate('http://127.0.0.1:5222/?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=B&hold=14');
 await b.ev('window.__CAMERA_LAB__.seek(1)');await sleep(16000);await b.shot('on');
 for(const name of ['light','particles']){await b.ev(`window.__ASSET2__.toggle('${name}',false)`);await sleep(400);await b.shot(`${name}-off`);await b.ev(`window.__ASSET2__.toggle('${name}',true)`);}
 await b.ev('window.__SPECIMEN__.resume();window.__CAMERA_LAB__.select("explore");window.__CAMERA_LAB__.camera.position.set(7,-11,-15);window.__CAMERA_LAB__.camera.lookAt(2,-14,-28)');await sleep(3000);
 await b.record();const samples=[];
 for(let i=0;i<8;i++){await sleep(4000);samples.push(await b.ev('({time:window.__SPECIMEN__.state().time,environment:window.__ASSET2__.state(),lens:window.__ASSET2__.context().lens().state()})'));}
 await b.finish();await b.shot('near');b.save('light-history',samples);b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
}finally{await b.close();}
