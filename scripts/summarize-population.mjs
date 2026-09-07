import { readFileSync, writeFileSync } from 'node:fs';
const root = process.argv[2];
const candidate = process.argv[3] || 'candidate';
const read = path => JSON.parse(readFileSync(`${root}/${path}`, 'utf8'));
function stats(values) {
  if (!values?.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return { n: sorted.length, median: sorted[Math.floor(sorted.length * .5)],
    p95: sorted[Math.floor(sorted.length * .95)], max: sorted.at(-1), over50: sorted.filter(v => v > 50).length };
}
const cases = ['opening', 'school', 'bubbles', 'far-school', 'distant', 'secondary'];
const results = cases.map(scene => {
  const before = read(`perf-baseline-${scene}/performance.json`), after = read(`perf-${candidate}-${scene}/performance.json`);
  const population = read(`perf-${candidate}-${scene}/population-cost.json`);
  return { scene, before: stats(before.auditRender.intervals), after: stats(after.auditRender.intervals),
    beforeCamera: before.info.controlledState.camera, afterCamera: after.info.controlledState.camera,
    dimensions: after.info.buffers[0], dpr: after.info.ratio, counts: population.state.counts,
    animals: population.state.animals, memory: population.state.memory,
    // Held controller does no work; absent samples are NOT zero CPU cost.
    controller: stats(population.cpu), errors: [before.errors.length, after.errors.length] };
});
writeFileSync(`${root}/performance-summary.json`, JSON.stringify({ metric: 'async render-completion intervals, NOT GPU timings', results }, null, 2));
console.log(JSON.stringify(results.map(({ scene, before, after, counts, errors }) => ({ scene, before, after, counts, errors })), null, 2));
