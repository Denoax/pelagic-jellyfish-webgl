import {browserSession,sleep} from './view-r2-browser.mjs';
import {installOceanCompletionProbe} from './ocean-completion-probe.mjs';
const b=await browserSession('../asset2-evidence/phase-4/ao-proof-r2',1280,900);
try{
 await b.send('Page.addScriptToEvaluateOnNewDocument',{source:`(${installOceanCompletionProbe.toString()})();let seed=7183;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};`});
 await b.navigate('http://127.0.0.1:5222/?renderer=webgl&idle=300&qaDebug&asset2qa=1&direction=B&hold=14');await b.ev('window.__CAMERA_LAB__.seek(1)');await sleep(16000);
 await b.shot('A-material');await b.ev('window.__ASSET2__.toggle("ao",false)');await sleep(200);await b.shot('material-off');await b.ev('window.__ASSET2__.toggle("ao",true)');
 await b.ev('window.__AUDIT_RENDER__.reset()');await sleep(15000);b.save('A-intervals',await b.ev('window.__AUDIT_RENDER__.read()'));
 await b.ev('import("/src/scene/environment/Asset2AOProof.js").then(({Asset2AOProof})=>{window.__AO_PROOF__=new Asset2AOProof(window.__ASSET2__.context());window.__AO_PROOF__.set("B")})');await sleep(5000);
 for(const mode of ['B','C']){await b.ev(`window.__AO_PROOF__.set('${mode}')`);await sleep(1000);await b.shot(mode);await b.ev('window.__AUDIT_RENDER__.reset()');await sleep(15000);b.save(`${mode}-intervals`,await b.ev('window.__AUDIT_RENDER__.read()'));}
 b.save('state',await b.ev('window.__AO_PROOF__.state()'));await b.ev('window.__SPECIMEN__.resume()');await b.record();await b.ev('window.__CAMERA_LAB__.request(.65)');await sleep(10000);await b.ev('window.__CAMERA_LAB__.request(1)');await sleep(10000);await b.finish();
 await b.ev('window.__AO_PROOF__.dispose()');b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
}finally{await b.close();}
