// Uncaptured, continuously swimming ocean. Unlike the held optical checkpoints,
// these runs include animal/current/bubble CPU work throughout measurement.
import { spawnSync } from 'node:child_process';
const baseline = '41026098e242ea41af3bd8d881e493ddaf43d2bf';
const candidate = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
for (const [scene, progress] of [['opening', 0], ['school', .52], ['bubbles', .35], ['far-school', .06], ['secondary', .68]]) {
  for (const before of [true, false]) {
    if (before && process.env.EVIDENCE_ONLY_CANDIDATE) continue;
    const url = before ? 'http://127.0.0.1:5187/?bubblePassage=1&renderer=webgl&idle=300'
      : 'http://127.0.0.1:5178/?populationLod=1&bubblePassage=1&renderer=webgl&idle=300';
    const result = spawnSync(process.execPath, ['scripts/specimen-evidence.mjs', url,
      `perf-live-${before ? 'before' : 'after'}-${scene}${before ? '' : process.env.EVIDENCE_TAG || ''}`, 'perf', '30'], {
      stdio: 'inherit', env: { ...process.env,
        EVIDENCE_ROOT: process.env.EVIDENCE_ROOT || '/home/mani/dev/jellyfish-studio/m4-evidence',
        EVIDENCE_SOURCE_REV: before ? baseline : candidate,
        EVIDENCE_EVAL: `(async()=>{window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*${progress});
          await new Promise(r=>setTimeout(r,6000));
          window.__BENCH_STATE__={live:true,progress:${progress},time:window.__SPECIMEN__.state().time,
            camera:window.__JELLYFISH_WORLD__.getCameraState(),actors:window.__JELLYFISH_WORLD__.getSwarmState(),
            population:window.__POPULATION__?.state()};})()`,
      },
    });
    if (result.status) process.exit(result.status);
  }
}
