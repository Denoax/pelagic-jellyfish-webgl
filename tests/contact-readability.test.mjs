import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {entryDrop,exitDrop,contactSites} from '../src/scene/glass/LiquidChoreography.js';
import {IdleLiquidState,DROPLETS} from '../src/scene/glass/IdleLiquidState.js';
import {withoutAsset2Seams} from './asset2-scope.mjs';
const a={x:.3,y:.4,surfaceX:.3,surfaceY:.35,start:.55,side:-1};
test('M7.2 preserves every runtime file outside three authorized glass paths',()=>{
 const sha='bfbe9837f4e0587662f79d481af8e7b1dcb94156';const allowed=new Set(['src/scene/glass/LiquidChoreography.js','src/scene/glass/OceanIdleGlass.js','src/scene/glass/IdleLiquidState.js']);
 for(const file of execFileSync('git',['ls-tree','-r','--name-only',sha,'src'],{encoding:'utf8'}).trim().split('\n'))if(!allowed.has(file)&&!file.endsWith('AGENTS.md'))assert.equal(withoutAsset2Seams(readFileSync(file,'utf8')),execFileSync('git',['show',sha+':'+file],{encoding:'utf8'}),file);
 const text=readFileSync('src/scene/glass/OceanIdleGlass.js','utf8'),old=execFileSync('git',['show',sha+':src/scene/glass/OceanIdleGlass.js'],{encoding:'utf8'});
 const minute=s=>s.slice(s.indexOf('    const digits=clockDigits'),s.indexOf('    const probe=this.maskProbe'));
 assert.equal(minute(text),minute(old),'Typography and independent masks unchanged');
 const reservoirs=s=>s.slice(s.indexOf('      const choose='),s.indexOf('      const arrival='));assert.equal(reservoirs(text),reservoirs(old));
});
test('surface contacts preserve original stroke anchors and remain bounded',()=>{
 const w=64,h=64,p=new Uint8Array(w*h*4);for(let y=20;y<36;y++)for(let x=15;x<28;x++)p[(y*w+x)*4]=255;
 const anchors=[{x:20.5/64,y:28.5/64,start:.55,side:-1,glyph:0}];const c=contactSites(p,w,h,anchors);assert.deepEqual(anchors[0],{x:20.5/64,y:28.5/64,start:.55,side:-1,glyph:0});assert.equal(c[0].surfaceY,20.5/64);assert.equal(c[0].x,anchors[0].x);
});
test('finite staged contact retains source mass through the narrow bridge',()=>{
 assert.equal(DROPLETS.length,8);
 for(const h of [844,900,1440])for(let i=0;i<8;i++){
  const contact=a.start+1.06,d=entryDrop(contact+.12,a,i,1.42,{},h);
  assert.equal(d.mass,1);assert.equal(d.transferred,0);const width=.773*d.neck*h;assert.ok(width>2&&width<2.5);
  assert.ok(Math.abs(d.y-d.rootY)*h>d.radius*h*1.4,'Bridge not buried inside the source');
  for(let n=0;n<360;n++)assert.ok(Object.values(entryDrop(n/60,a,i,1.42,{},h)).every(Number.isFinite));
  assert.equal(entryDrop(5,a,i,1.42).neck,0);assert.equal(entryDrop(5,a,i,1.42).bulge,0);
 }
});
test('pinch has detached mass and opposing recoil before optical clearance',()=>{
 const c=new IdleLiquidState();c.setActive(true);for(let n=0;n<300;n++)c.advance(1/60);c.setActive(false);
 for(let n=0;n<42;n++)c.advance(1/60);assert.equal(c.amount,1);
 for(let i=0;i<8;i++){const d=exitDrop(.59,a,i,1.42);assert.equal(d.neck,0);assert.ok(d.radius>.02);assert.ok(d.recoil<0);assert.ok(Object.values(d).every(Number.isFinite));}
 for(let n=0;n<18;n++)c.advance(1/60);assert.equal(c.amount,0);
});
