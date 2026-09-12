import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Pages selects approved M7 ocean and current views without exposing review fixtures', () => {
  const source = readFileSync('src/scene/HeroScene.jsx', 'utf8');
  assert.match(source, /releasedOcean = import.meta.env.PROD && import.meta.env.VITE_OCEAN_RELEASE === 'milestone-2'/);
  assert.match(source, /populationRequested = viewRequested \|\|/);
  assert.match(source, /bubblesRequested = viewRequested \|\|/);
  assert.match(source, /connectedRequested = viewRequested \|\| releasedOcean/);
  assert.match(source, /if \(import.meta.env.DEV && previewRequested\)/);
  assert.match(source, /chamber: import.meta.env.DEV && query.get\('specimen'\)/);
  assert.match(source, /if \(import.meta.env.DEV && query.get\('bubbleReview'\)/);
  assert.match(source, /if \(import.meta.env.DEV\) window.__BUBBLE_PASSAGE__/);
  assert.match(source, /if \(import.meta.env.DEV\) window.__POPULATION__.warmup = warmup/);
  assert.match(source, /liveLens.attachThermal\(environment.sanctuary.thermal\)/);
  assert.match(readFileSync('.github/workflows/pages.yml', 'utf8'), /VITE_OCEAN_RELEASE: milestone-2/);
});

test('population inspection and bubble replay listeners require explicit review mode', () => {
  assert.match(readFileSync('src/scene/population/PopulationDetail.js', 'utf8'), /if \(options.reviewControls\) window.__POPULATION__/);
  assert.match(readFileSync('src/scene/glass/BubblePassage.js', 'utf8'), /reviewControls = false/);
  assert.match(readFileSync('src/scene/glass/BubblePassage.js', 'utf8'), /if \(reviewControls\) \{\s*window.addEventListener\('keydown'/);
});
