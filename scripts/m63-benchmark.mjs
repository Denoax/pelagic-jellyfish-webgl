import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const [url,label,sha,source]=process.argv.slice(2);
const root='/home/mani/dev/jellyfish-studio/m6-3-evidence/performance';
for(const name of ['wide','stationary','orbit','illumination','portrait']){
 const progress=name==='wide'?.94:1;
 let pose='';
 if(name==='orbit')pose=`c.select('explore');const start=performance.now();function orbit(t){const a=.7+(t-start)*.000035;c.camera.position.set(-2.4+Math.sin(a)*25,-4,-24+Math.cos(a)*25);c.camera.lookAt(-2.4,-9,-24);c.camera.updateMatrixWorld();requestAnimationFrame(orbit)}requestAnimationFrame(orbit);`;
 const code=`(async()=>{const c=window.__CAMERA_LAB__;c.select('B');c.seek(${progress});await new Promise(r=>setTimeout(r,2000));${pose}await new Promise(r=>setTimeout(r,${name==='stationary'?12000:3000}));})();`;
 const r=spawnSync(process.execPath,['scripts/specimen-evidence.mjs',url,`${label}-${name}`,'perf','30'],{stdio:'inherit',env:{...process.env,EVIDENCE_ROOT:root,EVIDENCE_SOURCE_REV:sha,EVIDENCE_SOURCE_ROOT:source,EVIDENCE_EVAL:code,EVIDENCE_WIDTH:name==='portrait'?'390':'1280',EVIDENCE_HEIGHT:name==='portrait'?'844':'900'}});
 if(r.status)process.exit(r.status);
 const evidence=JSON.parse(readFileSync(`${root}/${label}-${name}/performance.json`));
 if(evidence.errors.length)throw Error(`Invalid benchmark ${label}-${name}: browser/shader errors`);
}
