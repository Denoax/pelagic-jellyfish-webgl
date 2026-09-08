import { readFileSync, writeFileSync } from 'node:fs';
const dir = process.argv[2];
const events = JSON.parse(readFileSync(`${dir}/timeline.json`, 'utf8')).traceEvents;
const start = events.find(e => e.name === 'm4.1-measure-start').ts;
const end = events.find(e => e.name === 'm4.1-measure-end').ts;
const frames = events.filter(e => e.name === 'FireAnimationFrame' && e.ph === 'X' && e.ts >= start && e.ts < end);
const slowest = frames.sort((a,b) => b.dur - a.dur).slice(0, 6);
const summary = {
  note: 'Main-thread timeline wall durations. A microtask span is not a GPU timing or a source-level attribution. Nested events overlap.',
  seconds: (end - start) / 1e6,
  slowestCallbacks: slowest.map(f => ({ atSeconds: (f.ts - start) / 1e6, ms: f.dur / 1000,
    children: events.filter(e => e.tid === f.tid && e.ph === 'X' && e.ts >= f.ts && e.ts + e.dur <= f.ts + f.dur
      && ['FunctionCall','RunMicrotasks','MinorGC','MajorGC'].includes(e.name))
      .map(e => ({ name: e.name, offsetMs: (e.ts - f.ts) / 1000, ms: e.dur / 1000 })) })),
  gc: Object.fromEntries(['MinorGC','MajorGC'].map(name => {
    const a = events.filter(e => e.name === name && e.ph === 'X' && e.ts >= start && e.ts < end);
    return [name, { count: a.length, totalMs: a.reduce((s,e) => s + e.dur, 0) / 1000,
      maxMs: Math.max(0, ...a.map(e => e.dur)) / 1000 }];
  })),
};
writeFileSync(`${dir}/trace-summary.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
