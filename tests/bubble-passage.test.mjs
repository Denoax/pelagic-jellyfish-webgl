import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { BubblePopulation, densityAt, PLUME } from '../src/scene/glass/BubblePopulation.js';
const place = (b, random) => { b.x = random() * 8 - 4; b.y = -3; b.z = random() * 10; };
const run = (p, seconds, progress = .35, hz = 60) => { for (let i = 0; i < seconds * hz; i++) p.update(1 / hz, progress, null, place); };

test('bubble population is deterministic and frame-rate independent with fixed capacity', () => {
  const a = new BubblePopulation(), b = new BubblePopulation();
  run(a, 8, .35, 30); run(b, 8, .35, 120);
  assert.deepEqual(a.pool, b.pool);
  assert.equal(a.pool.length, 131); assert.ok(a.state().heroes <= 3);
  assert.ok(a.state().ambient <= 128);
  assert.ok(a.state().classes.small > a.state().classes.medium * 2);
  assert.ok(a.pool.every(p => !p.live || (p.radius > 0 && p.radius <= .53)));
});
test('curtain has a short dense interval, smooth ramps and calm outside its range', () => {
  assert.equal(densityAt(.1, 6), 0); assert.equal(densityAt(.7, 6), 0);
  assert.equal(densityAt(.35, 0), 0); assert.equal(densityAt(.35, 6), 1);
  assert.equal(densityAt(.35, 14), 0);
  const p = new BubblePopulation(); run(p, 20, .1); assert.equal(p.births, 0);
  run(p, 8); assert.ok(p.state().ambient > 40);
  const births = p.births; run(p, 7, .65);
  assert.equal(p.births, births); assert.equal(p.state().ambient, 0); assert.equal(p.state().heroes, 0);
  run(p, 8); assert.ok(p.births > births);
  run(p, 30); assert.equal(p.state().ambient, 0); assert.equal(p.state().heroes, 0);
  const ended = p.births; run(p, 30); assert.equal(p.births, ended);
});
test('no pause debt or runaway emitter through repeated traversal and recycling', () => {
  const p = new BubblePopulation(); run(p, 5);
  const before = JSON.stringify(p);
  for (const dt of [NaN, Infinity, -1, 4, 3600]) p.update(dt, .35, null, place);
  assert.equal(JSON.stringify(p), before);
  for (let i = 0; i < 30; i++) { run(p, 3, .1); run(p, 12, .35); run(p, 3, .6); }
  assert.equal(p.pool.length, 131); assert.ok(p.pool.some(b => b.generation > 5));
  assert.ok(p.pool.every(b => Number.isFinite(b.x + b.y + b.z + b.alpha)));
});
test('bubble buoyancy remains upward with restrained read-only shared current', () => {
  const p = new BubblePopulation(); let samples = 0;
  const field = { sample(x, y, z, out) { samples++; Object.assign(out, {x:.3,y:-.4,z:.2}); } };
  for (let i = 0; i < 600; i++) p.update(1 / 60, .35, field, place);
  assert.ok(samples > 100); assert.ok(p.pool.filter(b => b.live).every(b => b.y > -3));
});
test('approved animals, M2 water, camera and idle sources remain exact M3 baseline', () => {
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', '78d723a', 'src'], {encoding:'utf8'}).trim().split('\n')
    .filter(p => /\.(js|jsx)$/.test(p) && !['src/scene/HeroScene.jsx','src/scene/glass/LiveOceanLens.js'].includes(p));
  for (const p of paths) assert.equal(readFileSync(p, 'utf8'), execFileSync('git', ['show', `78d723a:${p}`], {encoding:'utf8'}), p);
  const hero = readFileSync('src/scene/HeroScene.jsx', 'utf8');
  assert.match(hero, /bubblesRequested = import.meta.env.DEV &&/);
  assert.equal(PLUME.heroes, 3);
  const adapter = readFileSync('src/scene/glass/BubblePassage.js', 'utf8');
  assert.match(adapter, /behavior: 'instant'/, 'DEV replay must not restart CSS smooth-scroll every frame');
});
