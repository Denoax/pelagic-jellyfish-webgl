import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from './release-scope.mjs';
import {execFileSync} from 'node:child_process';
import {strokeAnchors,arrivalAt,entryDrop,exitDrop} from '../src/scene/glass/LiquidChoreography.js';
import {IdleDisplacement} from '../src/scene/glass/IdleDisplacement.js';
import {IdleLiquidState} from '../src/scene/glass/IdleLiquidState.js';
import {withoutAsset2Seams} from './asset2-scope.mjs';
const baseline='b6450239e64764dbba36ae9c913e15f3d847ee65';
test('M7.1 locks the exact M7 optical equation and all unrelated runtime files',()=>{
 const paths=execFileSync('git',['ls-tree','-r','--name-only',baseline,'src'],{encoding:'utf8'}).trim().split('\n');
 for(const p of paths.filter(p=>!['src/scene/glass/OceanIdleGlass.js','src/scene/glass/IdleDisplacement.js','src/scene/glass/IdleLiquidState.js','src/scene/glass/LiveOceanLens.js','src/scene/HeroScene.jsx'].includes(p)&&!p.endsWith('AGENTS.md')))assert.equal(withoutAsset2Seams(readFileSync(p,'utf8')),execFileSync('git',['show',`${baseline}:${p}`],{encoding:'utf8'}),p);
 const p='src/scene/glass/OceanIdleGlass.js',a=readFileSync(p,'utf8'),b=execFileSync('git',['show',`${baseline}:${p}`],{encoding:'utf8'});
 const optics=s=>s.slice(s.indexOf('      const e=vec2(1.7)'),s.indexOf('  state()'));
 assert.equal(optics(a),optics(b));
});
test('anchors come from actual mask strokes for both layouts, deterministic',()=>{
 const w=64,h=64,data=new Uint8Array(w*h*4);
 for(let y=5;y<60;y++)for(let x=5;x<60;x++)if(x%7<3)data[(y*w+x)*4]=255;
 for(const portrait of[false,true]){
  const a=strokeAnchors(data,w,h,portrait);assert.deepEqual(a,strokeAnchors(data,w,h,portrait));assert.equal(a.length,8);
  for(const p of a){assert.ok(data[(Math.floor(p.y*h)*w+Math.floor(p.x*w))*4]>=150);assert.ok(p.x>0&&p.x<1&&p.y>0&&p.y<1)}
 }
 assert.notDeepEqual(strokeAnchors(data,w,h,false),strokeAnchors(data,w,h,true));
});
test('formation is spatial, overlapping, bounded and not a global threshold',()=>{
 const a={x:.25,y:.35,start:.55},b={x:.28,y:.6,start:.92};
 assert.equal(arrivalAt(a.x,a.y,a,b,1.42),.55);
 assert.ok(arrivalAt(.35,.5,a,b,1.42)>.9);
 assert.ok(arrivalAt(b.x,b.y,a,b,1.42)<1);
});
test('eight feeding masses transfer monotonically, retain no decorative remainder',()=>{
 for(let i=0;i<8;i++){
  const a={x:.3,y:.4,start:.55+i*.05,side:i%2?1:-1};let previous=0;
  for(let frame=0;frame<=360;frame++){
   const d=entryDrop(frame/60,a,i,1.42);for(const v of Object.values(d))assert.ok(Number.isFinite(v));
   assert.ok(d.radius>=0&&d.radius<.05);assert.ok(d.transferred>=previous);assert.ok(Math.abs(d.mass+d.transferred-1)<1e-10);previous=d.transferred;
  }
  assert.equal(entryDrop(6,a,i,1.42).radius,0);assert.equal(entryDrop(6,a,i,1.42).neck,0);
 }
});
test('neck shrinks over multiple frames before detached exit mass disappears',()=>{
 const a={x:.3,y:.5,start:.5,side:1};const samples=Array.from({length:61},(_,i)=>exitDrop(i/60,a,0,1.42));
 const neckFrames=samples.filter(x=>x.neck>0&&x.neck<.02);assert.ok(neckFrames.length>12);
 assert.equal(samples[35].neck,0);assert.ok(samples[35].radius>.02);assert.equal(samples[60].radius,0);
});
test('event impulse queue is finite, capped, clamped and preallocated',()=>{
 const q={eventQueue:new Float32Array(24),eventHead:0,eventCount:0};
 for(let i=0;i<25;i++)IdleDisplacement.prototype.impulse.call(q,.3,.5,100);
 assert.equal(q.eventCount,8);assert.equal(q.eventQueue.length,24);
 assert.ok([...q.eventQueue].every(Number.isFinite));assert.ok(q.eventQueue[2]<.101);
 const invalid={eventQueue:new Float32Array(24),eventHead:0,eventCount:0};
 IdleDisplacement.prototype.impulse.call(invalid,NaN,.5,.1);assert.equal(invalid.eventCount,0);
});
test('exit keeps optics present for physical pinch, then finishes in .85s',()=>{
 const c=new IdleLiquidState();c.setActive(true);for(let i=0;i<600;i++)c.advance(1/60);
 c.setActive(false);for(let i=0;i<30;i++)c.advance(1/60);assert.equal(c.amount,1);
 for(let i=0;i<30;i++)c.advance(1/60);assert.equal(c.amount,0);
});
test('old and new typography do not share a cloned r175 Source',()=>{
 const s=readFileSync('src/scene/glass/OceanIdleGlass.js','utf8');
 assert.match(s,/this.previousClock=new THREE.CanvasTexture/);assert.doesNotMatch(s,/this.previousClock=this.clock.clone/);
});
