import { readdirSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
const root = process.argv[2];
if (!root) throw Error('Supply the local M4 evidence directory');
const destination = 'docs/implementation/milestone-4/evidence';
mkdirSync(destination, { recursive: true });
for (const entry of readdirSync(root, { withFileTypes: true })) {
  const baseline = /^(matched-before-|review-before-journey$|perf-live-before-|perf-moving-review-before$)/.test(entry.name);
  const final = /^(review-|matched-|perf-live-|perf-moving-)/.test(entry.name) && entry.name.endsWith('-final');
  if (!entry.isDirectory() || (!baseline && !final)) continue;
  const out = join(destination, entry.name); mkdirSync(out, { recursive: true });
  for (const file of readdirSync(join(root, entry.name))) {
    if (!/\.(png|json|mp4)$/.test(file)) continue;
    copyFileSync(join(root, entry.name, file), join(out, file));
  }
}
copyFileSync(join(root, 'performance-summary.json'), join(destination, 'performance-summary.json'));
const publicRoot = process.env.EVIDENCE_PUBLIC_ROOT || '/tmp/pelagic-m4/public-before';
if (existsSync(publicRoot)) {
  const out = join(destination, 'public-inspected'); mkdirSync(out, { recursive: true });
  for (const file of ['opening.png', 'journey-0.52.png'])
    if (existsSync(join(publicRoot, file))) copyFileSync(join(publicRoot, file), join(out, file));
}
