// Focused M4 review recipes; uses the existing browser, renderer and recorder.
// Run one suite at a time. Performance must not overlap capture/build/encoding.
import { spawnSync } from 'node:child_process';
const suite = process.argv[2], baseline = '41026098e242ea41af3bd8d881e493ddaf43d2bf';
const candidate = spawnSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim();
const before = 'http://127.0.0.1:5187/?bubblePassage=1&renderer=webgl&idle=300';
const after = 'http://127.0.0.1:5178/?populationLod=1&bubblePassage=1&renderer=webgl&idle=300';
function run(url, label, mode, seconds = 24, env = {}) {
  if (process.env.EVIDENCE_ONLY_CANDIDATE && url.includes(':5187')) return;
  if (!url.includes(':5187')) label += process.env.EVIDENCE_TAG || '';
  const r = spawnSync(process.execPath, ['scripts/specimen-evidence.mjs', url, label, mode, String(seconds)], {
    stdio: 'inherit', env: { ...process.env,
      EVIDENCE_ROOT: process.env.EVIDENCE_ROOT || '/home/mani/dev/jellyfish-studio/m4-evidence',
      EVIDENCE_SOURCE_REV: url.includes(':5187') ? baseline : candidate, ...env },
  });
  if (r.status) process.exit(r.status);
}
if (suite === 'matched') {
  for (const [scene, progress] of [['opening', 0], ['school', .52], ['far-school', .06], ['secondary', .68]]) {
    const env = { EVIDENCE_BUBBLE_STATE: progress ? 'scene' : 'calm', EVIDENCE_HOLD: '26', EVIDENCE_PROGRESS: String(progress) };
    run(before, `matched-before-${scene}`, 'bubble-inspect', 24, env);
    run(after, `matched-after-${scene}`, 'bubble-inspect', 24, env);
  }
} else if (suite === 'motion') {
  run(before, 'review-before-journey', 'population-tour');
  run(after, 'review-after-journey', 'population-tour');
  run(after, 'review-bubbles', 'geyser-tour');
  run(after, 'review-narrow', 'population-tour', 24, { EVIDENCE_WIDTH: '900' });
  run(after, 'review-portrait', 'population-tour', 24, { EVIDENCE_WIDTH: '390', EVIDENCE_HEIGHT: '844', EVIDENCE_MOBILE: '1' });
} else if (suite === 'moving-perf') {
  const env = { EVIDENCE_EVAL: "window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyB'}))" };
  run(before, 'perf-moving-review-before', 'perf', 44, env);
  run(after, 'perf-moving-review-after', 'perf', 44, env);
} else if (suite === 'lifecycle') {
  run(after, 'review-population-clicks', 'population-click');
  run(after, 'review-lifecycle', 'bubble-life');
  run(after.replace('idle=300', 'idle=4'), 'review-idle', 'lifecycle');
  run(after, 'review-dpr2', 'bubble-inspect', 24, { EVIDENCE_DPR: '2', EVIDENCE_BUBBLE_STATE: 'calm' });
  run('http://127.0.0.1:5181/pelagic-jellyfish-webgl/?populationLod=1&bubblePassage=1&idle=300',
    'review-production-guard', 'capture', 4, { EVIDENCE_EVAL: "if(window.__POPULATION__||window.__SPECIMEN__||window.__BUBBLE_PASSAGE__)throw Error('DEV preview leaked into production')" });
} else if (suite === 'tracked') {
  run(after, 'review-tracked-11', 'population-tour', 24, {
    EVIDENCE_EVAL: `(()=>{const label=document.createElement('div');document.body.append(label);
      label.style.cssText='position:fixed;z-index:9999;pointer-events:none;padding:6px;background:#00121ecc;color:#d3f6ff;font:12px monospace;border:1px solid #54849a';
      const update=()=>{const a=window.__POPULATION__.state().animals[11],p=window.__JELLYFISH_WORLD__.getJellyScreenPoint(11);
        const visible=a.visible&&p.x>0&&p.x<innerWidth&&p.y>0&&p.y<innerHeight;
        label.textContent='REVIEW ONLY · former background #11 · '+Math.round(a.pixels)+'px · '+a.tier+' · detail '+a.detail.toFixed(2)+(visible?'':' · outside view');
        label.style.left=(visible?Math.min(innerWidth-480,Math.max(8,p.x+12)):12)+'px';
        label.style.top=(visible?Math.min(innerHeight-45,Math.max(8,p.y+12)):innerHeight-48)+'px';requestAnimationFrame(update);};update();})()`,
  });
  run(after, 'review-observe', 'observe', 180);
} else throw Error('Choose matched, motion, moving-perf or lifecycle');
