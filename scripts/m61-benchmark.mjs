import {spawnSync} from 'node:child_process';
const [url,label,sha,source]=process.argv.slice(2);
const cases=[['first',.72],['full',.94],['close',1],['shimmer',1],['illumination',1],['stationary',1],['orbit',1]];
for(const[name,p]of cases){
 let pose='';
 if(['close','shimmer','orbit'].includes(name))pose=`c.select('explore');c.camera.position.set(-3,-1.2,-28);c.camera.lookAt(-3,-1.6,-24);c.camera.updateMatrixWorld();`;
 if(name==='orbit')pose+=`const start=performance.now();function orbit(t){const a=(t-start)*.00012;c.camera.position.set(-3+Math.sin(a)*9,-6,-24+Math.cos(a)*9);c.camera.lookAt(-3,-6,-24);c.camera.updateMatrixWorld();requestAnimationFrame(orbit)}requestAnimationFrame(orbit);`;
 const code=`(async()=>{const c=window.__CAMERA_LAB__;c.select('B');c.seek(${p});await new Promise(r=>setTimeout(r,2000));${pose}await new Promise(r=>setTimeout(r,${name==='stationary'?12000:3000}));})();`;
 const r=spawnSync(process.execPath,['scripts/specimen-evidence.mjs',url,`${label}-${name}`,'perf','30'],{stdio:'inherit',env:{...process.env,EVIDENCE_ROOT:'/home/mani/dev/jellyfish-studio/m6-1-evidence/performance',EVIDENCE_SOURCE_REV:sha,EVIDENCE_SOURCE_ROOT:source,EVIDENCE_EVAL:code}});
 if(r.status)process.exit(r.status);
}
