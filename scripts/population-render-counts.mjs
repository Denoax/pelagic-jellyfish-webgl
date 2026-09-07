// Read-only renderer counters, separate from the uncaptured timing benchmark.
import { spawnSync } from 'node:child_process';
const candidate = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
for (const before of [true, false]) {
  const result = spawnSync(process.execPath, ['scripts/specimen-evidence.mjs',
    `http://127.0.0.1:${before ? 5187 : 5178}/?${before ? '' : 'populationLod=1&'}bubblePassage=1&renderer=webgl&idle=300&qaDebug=1`,
    `review-render-counts-${before ? 'before' : 'after'}-final`, 'perf', '1'], {
    stdio: 'inherit', env: { ...process.env,
      EVIDENCE_ROOT: process.env.EVIDENCE_ROOT || '/home/mani/dev/jellyfish-studio/m4-evidence',
      EVIDENCE_SOURCE_REV: before ? '41026098e242ea41af3bd8d881e493ddaf43d2bf' : candidate,
      EVIDENCE_EVAL: `(async()=>{
        const scene=window.__JELLYFISH_WORLD__.scene, original=scene.onAfterRender;
        let last;
        scene.onAfterRender=function(renderer,...args){
          original.call(this,renderer,...args);
          last={drawCalls:renderer.info.render.drawCalls,triangles:renderer.info.render.triangles,
            memory:{...renderer.info.memory}};
        };
        window.__POPULATION_PROFILE__=[];
        try {
          for(const [label,p] of [['opening',0],['school',.52],['bubbles',.35],['far-school',.06],['secondary',.68]]) {
            window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*p);
            await new Promise(r=>setTimeout(r,6000));
            window.__POPULATION_PROFILE__.push({label,progress:p,time:window.__SPECIMEN__.state().time,...last});
          }
        } finally {scene.onAfterRender=original;}
      })()`,
    },
  });
  if (result.status) process.exit(result.status);
}
