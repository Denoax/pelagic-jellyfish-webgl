// Main already shipped these review-control guards. Preserve them when merging
// approved M7. Historical byte locks may remove ONLY this enumerated release
// delta; the complete normalized files must still equal approved M7 exactly.
import {readFileSync as read} from 'node:fs';
import {relative,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const changes={
 'src/scene/HeroScene.jsx':[
  ["chamber: import.meta.env.DEV && query.get('specimen') === '1', reviewControls: import.meta.env.DEV", "chamber: query.get('specimen') === '1'"],
  ["new BubblePassage(app, connectedOcean?.field, appendages, { reviewControls: import.meta.env.DEV })", "new BubblePassage(app, connectedOcean?.field, appendages)"],
  ["if (import.meta.env.DEV && query.get('bubbleReview') === '1')", "if (query.get('bubbleReview') === '1')"],
  ['if (import.meta.env.DEV) window.__BUBBLE_PASSAGE__ =', 'window.__BUBBLE_PASSAGE__ ='],
  ['if (import.meta.env.DEV) window.__POPULATION__.warmup =', 'window.__POPULATION__.warmup ='],
 ],
 'src/scene/glass/BubblePassage.js':[
  ['constructor(app, field, tissues, { reviewControls = false } = {})', 'constructor(app, field, tissues)'],
  ["    if (reviewControls) {\n      window.addEventListener('keydown', this.onKey);\n      window.addEventListener('wheel', this.onWheel, { passive: true });\n    }", "    window.addEventListener('keydown', this.onKey);\n    window.addEventListener('wheel', this.onWheel, { passive: true });"],
 ],
 'src/scene/population/PopulationDetail.js':[
  ['if (options.reviewControls) window.__POPULATION__ =', 'window.__POPULATION__ ='],
 ],
};
export const releasePaths=Object.keys(changes);
function normalize(path,text){for(const [now,before]of changes[path]||[]){assert.equal(text.split(now).length,2,'Exact release guard: '+path);text=text.replace(now,before);}return text;}
for(const path of releasePaths)assert.equal(normalize(path,read(path,'utf8')),execFileSync('git',['show',`bce3571b0300ecfe5dc6e5dd45f28a9cda57006e:${path}`],{encoding:'utf8'}),'Release-only delta: '+path);
export function readFileSync(path,options){const key=relative(resolve('.'),path instanceof URL?fileURLToPath(path):resolve(path));if(!changes[key])return read(path,options);const text=normalize(key,read(path,'utf8'));return options==='utf8'||options?.encoding==='utf8'?text:Buffer.from(text);}
