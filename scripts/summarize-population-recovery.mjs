import { readFileSync, existsSync, writeFileSync } from 'node:fs';
const root = process.argv[2];
if (!root) throw Error('Supply the M4.1 evidence directory');
const read = path => JSON.parse(readFileSync(`${root}/${path}.json`, 'utf8'));
const stats = values => {
  const a = [...values].sort((a, b) => a - b), round = x => Math.round(x * 1000) / 1000;
  return { n: a.length, median: round(a[Math.floor(a.length * .5)]), p95: round(a[Math.floor(a.length * .95)]),
    max: round(a.at(-1)), over50: a.filter(x => x > 50).length };
};
const result = { note: 'Render-completion intervals, NOT GPU timings. Population CPU also brackets connectedOcean.update and the specimen controller. Method profiles are inclusive and instrumented; never add them together.', scenes: {}, profiles: {} };
for (const scene of ['secondary', 'moving', 'school', 'bubbles', 'far-school']) {
  const row = result.scenes[scene] = {};
  for (const side of ['before', 'after']) {
    const dir = `bench-${side}-${scene}`;
    if (!existsSync(`${root}/${dir}/performance.json`)) continue;
    const p = read(`${dir}/performance`), c = read(`${dir}/population-cost`);
    if (p.errors.length || p.auditRender.matched !== 1) throw Error(`Invalid evidence: ${dir}`);
    row[side] = { completion: stats(p.auditRender.intervals), populationAndFieldCpu: stats(c.cpu),
      finalCounts: c.state.counts, info: p.info, seconds: p.seconds, finalBuffers: p.after.buffers };
  }
}
for (const scene of ['school', 'secondary', 'moving']) for (const side of ['before', 'after']) {
  const dir = `profile-${side}-${scene}`;
  if (!existsSync(`${root}/${dir}/profile.json`)) continue;
  const p = read(`${dir}/profile`), entries = Object.entries(p.methods);
  const frames = entries.filter(([k]) => k.endsWith(':update')).reduce((n, [,v]) => n + v.calls, 0) / 22;
  const groups = {};
  for (const [key, v] of entries) {
    const method = key.split(':').at(-1), row = groups[method] ||= { msPerFrame: 0, callsPerFrame: 0, maxCall: 0 };
    row.msPerFrame += v.ms / frames; row.callsPerFrame += v.calls / frames; row.maxCall = Math.max(row.maxCall, v.max);
  }
  result.profiles[`${side}-${scene}`] = { frames, groups, methods: p.methods, resources: p.resources,
    resourceCaveat: 'newGeometry/newMaterial count first scene attachments not previously observed; they do not prove new construction. Cached animal tiers were marked before sampling.',
    switches: p.switches, tierCountsOverTime: p.frames,
    countRanges: Object.fromEntries(['near','medium','far','hidden','transitioning'].map(k => {
      const a = p.frames.map(f => f.count[k]); return [k, { min: Math.min(...a), max: Math.max(...a) }];
    })), drawCalls: stats(p.frames.map(f => f.calls)), transparentObjects: stats(p.frames.map(f => f.transparentObjects)) };
}
writeFileSync(`${root}/performance-summary.json`, JSON.stringify(result, null, 2));
for (const [scene, row] of Object.entries(result.scenes)) console.log(scene, JSON.stringify(Object.fromEntries(Object.entries(row).map(([side,r]) => [side,{completion:r.completion,cpu:r.populationAndFieldCpu}]))));
