import { spawnSync } from 'node:child_process';
import { installPopulationCostProfile } from './population-cost-profile.mjs';
const [suite, side = 'before'] = process.argv.slice(2);
const baseline = 'ece7cc0f26acbd95b8386a02c3e84f2b5efc4f47';
const sha = side === 'before' ? baseline : spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const url = `http://127.0.0.1:${side === 'before' ? 5188 : 5189}/?populationLod=1&bubblePassage=1&renderer=webgl&idle=300${suite === 'matched-exact' ? '&hold=26' : ''}`;
const root = process.env.EVIDENCE_ROOT || '/home/mani/dev/jellyfish-studio/m4-1-evidence';
const cases = [['school', .52], ['secondary', .68], ['bubbles', .35], ['far-school', .06], ['moving', null]];
function run(label, mode, seconds, env = {}) {
  const r = spawnSync(process.execPath, ['scripts/specimen-evidence.mjs', url + (suite === 'profile' ? '&qaDebug=1' : ''),
    `${suite}-${side}-${label}`, mode, String(seconds)], { stdio: 'inherit', env: { ...process.env,
      EVIDENCE_ROOT: root, EVIDENCE_SOURCE_REV: sha,
      EVIDENCE_SOURCE_ROOT: side === 'before' ? '/home/mani/dev/jellyfish-studio/m4-1-approved-baseline' : process.cwd(), ...env } });
  if (r.status) process.exit(r.status);
}
if (suite === 'profile' || suite === 'bench') for (const [scene, progress] of cases) {
  if (suite === 'profile' && !['school', 'secondary', 'moving'].includes(scene)) continue;
  const setup = progress === null ? `window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyB'}));`
    : `window.scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*${progress});await new Promise(r=>setTimeout(r,6000));`;
  run(scene, 'perf', progress === null ? 44 : 30, {
    EVIDENCE_PROFILE: suite === 'profile' ? '1' : '0',
    EVIDENCE_EVAL: `(async()=>{${setup}${suite === 'profile' ? `(${installPopulationCostProfile.toString()})();` : ''}
      window.__BENCH_STATE__={progress:${progress},time:window.__SPECIMEN__.state().time,camera:window.__JELLYFISH_WORLD__.getCameraState()};})()`,
  });
} else if (suite === 'matched' || suite === 'matched-exact') for (const [scene, progress] of cases.filter(c => c[1] !== null)) {
  run(scene, 'bubble-inspect', 24, { EVIDENCE_BUBBLE_STATE: 'scene', EVIDENCE_HOLD: '26', EVIDENCE_PROGRESS: String(progress) });
} else if (suite === 'motion') {run('journey', 'population-tour', 24);run('bubbles', 'geyser-tour', 24);}
else throw Error('Use profile, bench, matched or motion; before or after.');
