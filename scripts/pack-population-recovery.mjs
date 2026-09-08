import { readdirSync, readFileSync, mkdirSync, copyFileSync, writeFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';
const root = process.argv[2];
if (!root) throw Error('Supply the M4.1 evidence root');
const out = 'docs/implementation/milestone-4-1/evidence';
const pairs = [];
for (const s of ['school','secondary','bubbles','far-school','moving']) {
  pairs.push([`final/bench-before-${s}`,`bench-before-${s}`], [`complete/bench-after-${s}`,`bench-after-${s}`]);
  if (['school','secondary','moving'].includes(s)) pairs.push([`profile-before-${s}`,`profile-before-${s}`],
    [`final/profile-after-${s}`,`profile-after-${s}`]);
  if (s !== 'moving') for (const side of ['before','after']) pairs.push([`${side === 'before' ? 'validated' : 'complete'}/matched-exact-${side}-${s}`,`matched-${side}-${s}`]);
}
for (const clip of ['journey','bubbles']) {
  pairs.push([`complete/motion-before-${clip}`,`motion-before-${clip}`], [`complete/motion-after-${clip}`,`motion-after-${clip}`]);
}
pairs.push(['final/trace-before-moving','trace-before-moving'], ['final/gl-before-moving','gl-before-moving'],
  ['final/gl-after-moving','gl-after-moving-before-warmup'], ['complete/gl-after-moving','gl-after-moving'],
  ['complete/lifecycle-after','lifecycle-after'], ['complete/clicks-after','clicks-after'],
  ['complete/repeat-before-moving','repeat-before-moving'], ['complete/repeat-after-moving','repeat-after-moving']);
mkdirSync(out,{recursive:true});
for (const [input,label] of pairs) {
  const dir = join(root,input);
  if (!existsSync(dir)) throw Error(`Missing evidence ${dir}`);
  const target = join(out,label); mkdirSync(target,{recursive:true});
  for (const name of readdirSync(dir)) {
    if (!/\.(json|png|mp4)$/.test(name)) continue;
    if (/^(cpu-profile|allocation-profile|timeline)\.json$/.test(name))
      writeFileSync(join(target,`${name}.gz`),gzipSync(readFileSync(join(dir,name))));
    else copyFileSync(join(dir,name),join(target,name));
  }
}
writeFileSync(join(out,'sources.json'),JSON.stringify({root,collections:pairs,
  note:'All packed motion and matched frames load the approved fonts. Final matched before/after frames start on the same fixed simulation clock. After method profiles predate startup-only warmup; steady-state sampling code is identical. Superseded single-instance warmup evidence under validated/ is excluded; only its clean approved-baseline matched frames are retained.'},null,2));
console.log(out);
