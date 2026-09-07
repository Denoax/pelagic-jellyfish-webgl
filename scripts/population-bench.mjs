// Sequential, uncaptured A/B checkpoints using the established actual browser.
import { spawnSync } from 'node:child_process';
const [url, label] = process.argv.slice(2);
if (!url || !label) throw Error('Usage: node scripts/population-bench.mjs URL LABEL');
for (const [scene, progress] of [['opening', 0], ['school', .52], ['bubbles', .35], ['distant', .92], ['secondary', .68]]) {
  const r = spawnSync(process.execPath, ['scripts/specimen-evidence.mjs', url, `${label}-${scene}`, 'perf', '30'], {
    stdio: 'inherit', env: { ...process.env, EVIDENCE_BUBBLE_STATE: progress ? 'scene' : 'calm',
      EVIDENCE_PROGRESS: String(progress), EVIDENCE_HOLD: '26' },
  });
  if (r.status) process.exit(r.status);
}
