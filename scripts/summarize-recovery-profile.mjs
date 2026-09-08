import { readFileSync } from 'node:fs';
const root = process.argv[2], read = name => JSON.parse(readFileSync(`${root}/${name}.json`, 'utf8'));
const profile = read('cpu-profile'), nodes = new Map(profile.nodes.map(n => [n.id, n])), totals = new Map();
for (let i = 0; i < profile.samples.length; i++) {
  const n = nodes.get(profile.samples[i]), c = n.callFrame;
  const key = `${c.functionName || '(anonymous)'} ${c.url?.split('/').at(-1) || ''}:${c.lineNumber + 1}`;
  totals.set(key, (totals.get(key) || 0) + profile.timeDeltas[i] / 1000);
}
const heap = [];
function walk(n) { if (n.selfSize) heap.push({ name: n.callFrame.functionName, source: n.callFrame.url?.split('/').at(-1),
  line: n.callFrame.lineNumber + 1, bytes: n.selfSize }); for (const c of n.children) walk(c); }
walk(read('allocation-profile').head);
const methods = read('profile'), groups = {};
for (const [key, r] of Object.entries(methods.methods)) {
  const name = key.split(':').at(-1), group = groups[name] ||= { ms: 0, calls: 0, max: 0 };
  group.ms += r.ms; group.calls += r.calls; group.max = Math.max(group.max, r.max);
}
console.log(JSON.stringify({ cpuSelfMs: [...totals].sort((a,b)=>b[1]-a[1]).slice(0,24),
  allocations: heap.sort((a,b)=>b.bytes-a.bytes).slice(0,20), groups,
  resources: methods.resources, switches: methods.switches,
  frames: methods.frames.filter((_,i)=>i%20===0) }, null, 2));
