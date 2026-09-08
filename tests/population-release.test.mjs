import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('Pages selects M4 population and passage without exposing review fixtures', () => {
  const source = readFileSync('src/scene/HeroScene.jsx', 'utf8');
  assert.match(source, /releasedPopulation = import.meta.env.PROD && import.meta.env.VITE_OCEAN_RELEASE === 'milestone-4'/);
  assert.match(source, /populationRequested = .*\|\| releasedPopulation/);
  assert.match(source, /bubblesRequested = .*\|\| releasedPopulation/);
  assert.match(source, /releasedOcean = releasedPopulation \|\|/);
  assert.match(source, /if \(import.meta.env.DEV && previewRequested\)/);
  assert.match(source, /chamber: import.meta.env.DEV && query.get\('specimen'\)/);
  assert.match(source, /if \(import.meta.env.DEV && query.get\('bubbleReview'\)/);
  assert.match(source, /if \(import.meta.env.DEV\) window.__BUBBLE_PASSAGE__/);
  assert.match(readFileSync('.github/workflows/pages.yml', 'utf8'), /VITE_OCEAN_RELEASE: milestone-4/);
});

test('population inspection and bubble replay listeners require explicit review mode', () => {
  assert.match(readFileSync('src/scene/population/PopulationDetail.js', 'utf8'), /if \(options.reviewControls\) window.__POPULATION__/);
  assert.match(readFileSync('src/scene/glass/BubblePassage.js', 'utf8'), /reviewControls = false/);
  assert.match(readFileSync('src/scene/glass/BubblePassage.js', 'utf8'), /if \(reviewControls\) \{\s*window.addEventListener\('keydown'/);
});
