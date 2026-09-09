// Reuses the existing render-COMPLETION probe. No screenshots or video in these
// runs. Scene visibility naturally differs between tracks; not an isolated GPU
// comparison. Fixed quality, viewport, inputs and warm-up for all directions.
import { spawnSync } from 'node:child_process';
const selected=process.argv.slice(2);const sides=selected.length?selected:['approved','A','B','C','D'];
for(const side of sides){
 const url=side==='approved'?'http://127.0.0.1:5190/?populationLod=1&bubblePassage=1&renderer=webgl&idle=300':`http://127.0.0.1:5192/?cameraLab=1&direction=${side}&labUI=0&renderer=webgl&idle=300`;
 const result=spawnSync(process.execPath,['scripts/specimen-evidence.mjs',url,`perf-${side}${process.env.BENCH_TAG||''}`,'perf','40'],{stdio:'inherit',env:{...process.env,EVIDENCE_SOURCE_REV:side==='approved'?'a61d79be0fab528daa11a1cf72e00d986b4a5727':'22e330c7cdc2fdfc6aee50ab393ee1684fd67967',EVIDENCE_SOURCE_ROOT:side==='approved'?'/home/mani/dev/jellyfish-studio/m5-approved-baseline':process.cwd(),EVIDENCE_ROOT:'/home/mani/dev/jellyfish-studio/m5-rd-evidence',EVIDENCE_EVAL:`(async()=>{window.scrollTo({top:0,behavior:'instant'});await new Promise(r=>setTimeout(r,6000));window.__BENCH_STATE__={progress:0,lab:window.__CAMERA_LAB__?.summary(),quality:'DPR1, adaptive disabled by existing specimen facility',input:'40 seconds continuous 0 to 1'};const start=performance.now();function input(now){const p=Math.min(1,(now-start)/40000);window.scrollTo({top:p*(document.documentElement.scrollHeight-innerHeight),behavior:'instant'});if(p<1)requestAnimationFrame(input);}requestAnimationFrame(input);})()`}});
 if(result.status)process.exit(result.status);
}
