import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const [url,label,sha,source]=process.argv.slice(2);
const root=process.env.M65_PERF_ROOT||'/home/mani/dev/jellyfish-studio/m6-5-evidence/performance';
for(const name of process.env.M65_SCENES?.split(',')||['wide','stationary','orbit','near-floor','illumination','portrait']){
 let pose='';
 if(name==='orbit')pose=`c.select('explore');const start=performance.now();function orbit(t){const a=.7+(t-start)*.000035;c.camera.position.set(-2.4+Math.sin(a)*25,-4,-24+Math.cos(a)*25);c.camera.lookAt(-2.4,-9,-24);c.camera.updateMatrixWorld();requestAnimationFrame(orbit)}requestAnimationFrame(orbit);`;
 if(name==='near-floor')pose=`c.select('explore');c.camera.position.set(7,-11,-15);c.camera.lookAt(2,-15,-28);c.camera.updateMatrixWorld();`;
 const code=`(async()=>{const c=window.__CAMERA_LAB__;c.select('${name==='illumination'?'C':'D'}');c.seek(1);await new Promise(r=>setTimeout(r,2000));${pose}await new Promise(r=>setTimeout(r,${name==='stationary'?12000:3000}));})();`;
 const r=spawnSync(process.execPath,['scripts/specimen-evidence.mjs',url,`${label}-${name}`,'perf','30'],{stdio:'inherit',env:{...process.env,EVIDENCE_ROOT:root,EVIDENCE_SOURCE_REV:sha,EVIDENCE_SOURCE_ROOT:source,EVIDENCE_EVAL:code,EVIDENCE_WIDTH:name==='portrait'?'390':'1280',EVIDENCE_HEIGHT:name==='portrait'?'844':'900'}});
 if(r.status)process.exit(r.status);
 const e=JSON.parse(readFileSync(`${root}/${label}-${name}/performance.json`));if(e.errors.length)throw Error('Invalid measurement '+name);
}
