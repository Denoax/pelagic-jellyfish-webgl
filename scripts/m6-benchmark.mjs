import {spawnSync} from 'node:child_process';
const [url='http://127.0.0.1:5196/?renderer=webgl&idle=300',label='baseline',sha='aef830b1619eef71e36be4e8b4cd8b924fb1bd8a',source='/home/mani/dev/jellyfish-studio/m5-view-ui-r2']=process.argv.slice(2);
const cases=[['pre',.45],['first',.72],['chimney',.92],['illumination',1],['rest',1],['explore',1]];
for(const [name,p]of cases){
 const pose=name==='explore'?`c.select('explore');c.camera.position.set(-4.6,-7,-17);c.camera.lookAt(-4.6,-7,-24);c.camera.updateMatrixWorld();`:'';
 const code=`(async()=>{const c=window.__CAMERA_LAB__;c.select('B');c.seek(${p});await new Promise(r=>setTimeout(r,2000));${pose}await new Promise(r=>setTimeout(r,${name==='rest'?12000:3000}));})();`;
 const r=spawnSync(process.execPath,['scripts/specimen-evidence.mjs',url,`${label}-${name}`,'perf','30'],{stdio:'inherit',env:{...process.env,EVIDENCE_ROOT:'/home/mani/dev/jellyfish-studio/m6-evidence/performance',EVIDENCE_SOURCE_REV:sha,EVIDENCE_SOURCE_ROOT:source,EVIDENCE_EVAL:code}});
 if(r.status)process.exit(r.status);
}
