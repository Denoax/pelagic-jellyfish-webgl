import assert from 'node:assert/strict';
import {browserSession,sleep} from './view-r2-browser.mjs';
import {installProbe} from './m661-probe.mjs';
const[base='http://127.0.0.1:5213/',label='candidate-startup']=process.argv.slice(2);
const b=await browserSession(`../m6-6-1-evidence/${label}`);
try{
 const{windowId}=await b.send('Browser.getWindowForTarget');await b.send('Browser.setWindowBounds',{windowId,bounds:{width:1300,height:1000}});await b.send('Emulation.setVisibleSize',{width:1280,height:900});
 await b.navigate(`${base}?renderer=webgl&idle=1`);await b.ev(`(${installProbe.toString()})()`);await b.ev('__IDLE_AUDIT__.trace(false);window.__HOTFIX_WORLD__=window.__JELLYFISH_WORLD__');
 for(let i=0;i<80;i++){if(await b.ev("!!document.querySelector('.idle-screen.is-active')"))break;await sleep(100);}
 await sleep(1500);const idle=await b.ev('__IDLE_AUDIT__.snapshot()');assert.ok(idle.idle);await b.shot('idle');
 await b.ev("history.replaceState(null,'','?renderer=webgl&idle=300')");await b.key('Enter');await sleep(3200);const returned=await b.ev('__IDLE_AUDIT__.snapshot()');await b.shot('returned');
 assert.ok(returned.sameWorld&&!returned.idle);assert.ok(returned.animals.length>15&&returned.animals.every(a=>!a.invalid));assert.equal(returned.contexts.length,0);assert.equal(b.errors.length,0);b.save('result',{idle,returned,errors:b.errors});console.log('PASS natural startup idle/return');
}finally{await b.close()}
