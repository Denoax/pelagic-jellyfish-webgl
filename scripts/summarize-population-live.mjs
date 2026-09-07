import { readFileSync, writeFileSync } from 'node:fs';
const root = process.argv[2];
const tag = process.argv[3] || '';
const read = path => JSON.parse(readFileSync(`${root}/${path}`, 'utf8'));
const stats = values => {
  if (!values?.length) return null;
  const x = [...values].sort((a, b) => a - b);
  return { n: x.length, median: x[Math.floor(x.length * .5)], p95: x[Math.floor(x.length * .95)],
    max: x.at(-1), over50: x.filter(v => v > 50).length };
};
const results = ['opening', 'school', 'bubbles', 'far-school', 'secondary'].map(scene => {
  const before = read(`perf-live-before-${scene}/performance.json`), after = read(`perf-live-after-${scene}${tag}/performance.json`);
  const population = read(`perf-live-after-${scene}${tag}/population-cost.json`);
  return { scene, before: stats(before.auditRender.intervals), after: stats(after.auditRender.intervals),
    startBefore: before.info.controlledState, startAfter: after.info.controlledState,
    dimensionsBefore: before.after.buffers[0], dimensionsAfter: after.after.buffers[0],
    dprBefore: before.after.ratio, dprAfter: after.after.ratio,
    combinedAnimalCpu: stats(population.cpu), countsAtEnd: population.state.counts,
    renderer: population.state.renderer, memory: population.state.memory,
    errors: [before.errors.length, after.errors.length] };
});
const moving = ['review-before', 'review-after'].map(label => {
  const j = read(`perf-moving-${label}${label.endsWith('after') ? tag : ''}/performance.json`);
  return { label, ...stats(j.auditRender.intervals), errors: j.errors.length };
});
writeFileSync(`${root}/performance-summary.json`, JSON.stringify({
  metric: 'async render-completion intervals, NOT GPU timings', live: true, results, moving }, null, 2));
console.log(JSON.stringify({ results: results.map(({ scene, before, after, combinedAnimalCpu, countsAtEnd, errors }) =>
  ({ scene, before, after, combinedAnimalCpu, countsAtEnd, errors })), moving }, null, 2));
