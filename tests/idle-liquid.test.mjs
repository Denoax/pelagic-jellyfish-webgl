import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {IdleLiquidState,fieldSize,validPoint,clockDigits,DROPLETS} from '../src/scene/glass/IdleLiquidState.js';
import {m7Paths} from './m7-scope.mjs';
const baseline='046430847448206cfc58ce84758d9410121a97d3';
const read=p=>readFileSync(p,'utf8');
test('M7 preserves every existing non-integration runtime file exactly',()=>{
 const paths=execFileSync('git',['ls-tree','-r','--name-only',baseline,'src'],{encoding:'utf8'}).trim().split('\n');
 for(const p of paths.filter(p=>!m7Paths.includes(p)&&!p.endsWith('AGENTS.md')))assert.deepEqual(readFileSync(p),execFileSync('git',['show',`${baseline}:${p}`]),p);
});
test('implicit droplet seeds are fixed, sparse and bounded',()=>{
 assert.equal(DROPLETS.length,8);assert.ok(Object.isFrozen(DROPLETS));
 for(const d of DROPLETS)assert.ok(d.x>0&&d.x<1&&d.y>0&&d.y<1&&d.radius>0&&d.radius<.03&&Number.isFinite(d.phase));
});
test('fixed step/entry duration consistent at 30, 60 and 120 Hz',()=>{
 const results=[30,60,120].map(hz=>{const c=new IdleLiquidState();c.setActive(true);let steps=0;for(let i=0;i<hz*10;i++)steps+=c.advance(1/hz);return{steps,c}});
 for(const{steps,c}of results){assert.equal(steps,600);assert.equal(c.phase,'settled');assert.equal(c.amount,1);assert.ok(Math.abs(c.time-10)<1e-9)}
});
test('hidden/invalid/long dt never accrue wall-time debt',()=>{
 const c=new IdleLiquidState();c.setActive(true);c.advance(1/60);const t=c.time;
 assert.equal(c.advance(90,true),0);assert.equal(c.time,t);
 for(const dt of[NaN,Infinity,-1])assert.ok(c.advance(dt)<=3);
 assert.ok(c.advance(90)<=3);assert.ok(c.accumulator<1/60+1e-9);
});
test('twenty-five cycles settle then fully exit with bounded state',()=>{
 const c=new IdleLiquidState();
 for(let cycle=0;cycle<25;cycle++){
  c.setActive(true);for(let i=0;i<480;i++)c.advance(1/60);assert.equal(c.phase,'settled');
  c.setActive(false);for(let i=0;i<60;i++)c.advance(1/60);assert.equal(c.amount,0);assert.equal(c.phase,'ocean');assert.equal(c.advance(1),0);
 }
});
test('clock and field layout account for real aspect ratio',()=>{
 assert.equal(clockDigits(new Date(2026,8,10,3,9)),'0309');assert.equal(clockDigits(new Date(2026,8,10,23,59)),'2359');
 assert.deepEqual(fieldSize(1280,900),[256,180]);assert.deepEqual(fieldSize(390,844),[118,256]);
});
test('glass rejects malformed pointer and invalid viewport before spatial use',()=>{
 for(const e of[{}, {clientX:NaN,clientY:2},{clientX:1,clientY:Infinity},{clientX:'1',clientY:3}])assert.equal(validPoint(e,1280,900),false);
 assert.equal(validPoint({clientX:0,clientY:0},1280,900),true);assert.equal(validPoint({clientX:1,clientY:2},0,900),false);
});
test('single production renderer, clean-source refraction, no clock opacity ghost',()=>{
 assert.doesNotMatch(read('src/ui/IdleScreen.jsx'),/IdleGlassScene|WebGLRenderer|canvas/);
 const glass=read('src/scene/glass/OceanIdleGlass.js');assert.doesNotMatch(glass,/new THREE\.(WebGLRenderer|WebGPURenderer)|getImageData|toDataURL/);
 assert.match(glass,/texture\(lens.target.texture/);assert.match(glass,/phase.lessThan\(.5\).select\(old,next\)/);
 const lens=read('src/scene/glass/LiveOceanLens.js');const render=lens.slice(lens.indexOf('  async render()'),lens.indexOf('  state()'));
 assert.equal((render.match(/renderAsync\(this.scene, this.camera\)/g)||[]).length,2); // mutually exclusive direct OR clean target paths
 assert.match(render,/idle\?\.visible \? this.idleOutput : this.output/);
});
