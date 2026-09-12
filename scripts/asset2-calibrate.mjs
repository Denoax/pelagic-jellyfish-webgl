// Calibration of EXISTING approved camera positions. No camera track edits.
import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../asset2-evidence/calibration/baseline',1672,941);
try{
 await b.send('Emulation.setVisibleSize',{width:1672,height:941});
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:'let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};'});
 await b.navigate('http://127.0.0.1:5221/?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=B');
 for(const p of [.45,.55,.65,.75,.85,1]){await b.ev(`__CAMERA_LAB__.seek(${p})`);await sleep(4000);const s=await b.ev('({camera:__JELLYFISH_WORLD__.getCameraState(),phase:__SPECIMEN__.state(),renderer:__SPECIMEN__.rendererInfo()})');if(s.camera.transitioning)throw Error('Unsettled pose');await b.shot(`p${p}`);b.save(`p${p}`,s);}
 b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
}finally{await b.close();}
