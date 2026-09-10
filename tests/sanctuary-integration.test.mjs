import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,Vector3,Raycaster} from 'three/webgpu';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
import {ledgeGeometry} from '../src/scene/sanctuary/mesoGeology.js';
import {gullyCenter,gullyDepth,floorHeight} from '../src/scene/sanctuary/geology.js';

test('meso beds are deterministic, bounded and rooted in geology; ravine remains recessed',()=>{
 const a=new Sanctuary(new Scene()),b=new Sanctuary(new Scene());
 assert.deepEqual(a.meso,b.meso);assert.ok(a.meso.length>0&&a.meso.length<=360);
 const tags=new Set(a.meso.map(x=>x.tag));assert.deepEqual([...tags].sort(),['attached-bed','bank-lip','edge-collapse','vent-apron']);
 for(const item of a.meso){assert.ok(item.p.every(Number.isFinite));assert.ok(item.p[1]-.7*item.s[1]<item.support);if(item.p[2]<-16&&item.p[2]>-43)assert.ok(Math.abs(item.p[0]-gullyCenter(item.p[2]))>=1.35);}
 assert.ok(gullyDepth(gullyCenter(-27),-27)>3);
 for(const item of a.meso)if(item.supportName==='active-sulfide-complex'||item.tag==='vent-apron')assert.ok(item.support<=floorHeight(item.p[0],item.p[2])+2.5);
 const g=ledgeGeometry(),positions=g.attributes.position.array,normals=g.attributes.normal.array;
 assert.ok(positions.every(Number.isFinite)&&normals.every(Number.isFinite));
 // Outward face winding, including the side faces rejected in the first trial.
 const idx=g.index.array,p=g.attributes.position,u=new Vector3(),v=new Vector3(),w=new Vector3(),n=new Vector3(),center=new Vector3();
 for(let i=0;i<idx.length;i+=3){u.fromBufferAttribute(p,idx[i]);v.fromBufferAttribute(p,idx[i+1]);w.fromBufferAttribute(p,idx[i+2]);center.copy(u).add(v).add(w).divideScalar(3);n.copy(v).sub(u).cross(w.sub(u));assert.ok(n.dot(center)>0);}
 g.dispose();a.dispose();b.dispose();
});
test('five existing life sites retain counts with embedded roots and geological surface anchors',()=>{
 const s=new Sanctuary(new Scene()),life=s.life.anchored;
 assert.equal(life.filaments.length,160);assert.equal(life.shells.length,80);assert.equal(life.points.length,40);
 for(const a of [...life.filaments,...life.shells,...life.points]){
   assert.ok(a.anchor&&a.normal);assert.ok(a.anchor.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...a.normal)-1)<1e-6);
   const offset=a.p.reduce((sum,v,i)=>sum+(v-a.anchor[i])*a.normal[i],0);
   if(a.kind==='filament')assert.ok(offset-.14*a.s[1]<0);
   else assert.ok(offset<a.s[1]);
 }
 assert.equal(life.points.filter(x=>x.s[0]>.02).length,32);
 s.dispose();
});
test('sediment shares bounded current, discards pause/reverse debt and never reallocates',()=>{
 const s=new Sanctuary(new Scene()),d=s.sediment,arrays=[d.position,d.origin,d.velocity,d.size,d.alpha],g=d.renderer.mesh.geometry;
 const field={sample(x,y,z,o){o.x=.3;o.y=.03;o.z=-.2;}};
 for(let i=0;i<600;i++)d.update(1/60,field);
 assert.ok(d.position[0]>d.origin[0]);assert.ok(d.position.every(Number.isFinite));
 for(let i=0;i<d.position.length;i++)assert.ok(Math.abs(d.position[i]-d.origin[i])<1);
 const before=d.position.slice(),time=d.time;
 for(const dt of [-1,30,NaN,0])d.update(dt,field);
 assert.deepEqual(d.position,before);assert.equal(d.time,time);
 [d.position,d.origin,d.velocity,d.size,d.alpha].forEach((a,i)=>assert.equal(a,arrays[i]));assert.equal(d.renderer.mesh.geometry,g);assert.equal(d.count,72);
 let disposed=0;g.addEventListener('dispose',()=>disposed++);s.dispose();s.dispose();assert.equal(disposed,1);assert.equal(d.disposed,true);
});
