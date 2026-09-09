import { spawnSync } from 'node:child_process';
const root='/home/mani/dev/jellyfish-studio/m5-rd-evidence';
for(const profile of ['portrait','slow','fast'])for(const d of ['A','B','C','D']){
 const env={...process.env,EVIDENCE_ROOT:root,CAMERA_INPUT:profile==='portrait'?'normal':profile,EVIDENCE_SOURCE_REV:'22e330c'};
 if(profile==='portrait'){env.EVIDENCE_WIDTH='390';env.EVIDENCE_HEIGHT='844';}
 const result=spawnSync(process.execPath,['scripts/camera-rd-browser.mjs',`http://127.0.0.1:5192/?cameraLab=1&direction=${d}&labUI=0&idle=300&renderer=webgl`,`candidate-${d}-${profile}`,'motion',profile==='slow'?'120':profile==='fast'?'40':'80'],{stdio:'inherit',env});
 if(result.status)process.exit(result.status);
}
