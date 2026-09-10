import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {Scene,Vector3,Matrix4,Object3D,Raycaster} from 'three/webgpu';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
import {shelfArchetype,SHELF_ARCHETYPES} from '../src/scene/sanctuary/shelfSilhouettes.js';
const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
const base='dd97923241e1d914e637263a6a94182b074c3bf0';
test('bounded reusable shelf family has deterministic finite watertight nondegenerate geometry',()=>{
 assert.ok(SHELF_ARCHETYPES>=3&&SHELF_ARCHETYPES<=6);const distinct=new Set();
 for(let k=0;k<SHELF_ARCHETYPES;k++){
  const g=shelfArchetype(k),copy=shelfArchetype(k),p=g.attributes.position,n=g.attributes.normal,idx=g.index.array;
  assert.deepEqual(p.array,copy.attributes.position.array);assert.deepEqual(n.array,copy.attributes.normal.array);
  distinct.add(hash([...p.array]));assert.ok(p.array.every(Number.isFinite));assert.ok(n.array.every(Number.isFinite));
  const a=new Vector3(),b=new Vector3(),c=new Vector3(),edges=new Map(),directions=new Map();let volume=0;
  for(let i=0;i<idx.length;i+=3){
   for(let j=0;j<3;j++){const x=idx[i+j],y=idx[i+(j+1)%3];assert.ok(Number.isInteger(x)&&x>=0&&x<p.count);const key=[Math.min(x,y),Math.max(x,y)].join(':');edges.set(key,(edges.get(key)||0)+1);directions.set(key,(directions.get(key)||0)+(x<y?1:-1));}
   a.fromBufferAttribute(p,idx[i]);b.fromBufferAttribute(p,idx[i+1]);c.fromBufferAttribute(p,idx[i+2]);const normal=b.clone().sub(a).cross(c.clone().sub(a));
   assert.ok(normal.length()>1e-8);volume+=a.dot(b.clone().cross(c))/6;
  }
  // Undercut/concave faces need not point away from the global origin. Require
  // consistent closed orientation and positive volume, not convexity.
  assert.ok([...edges.values()].every(n=>n===2));assert.ok([...directions.values()].every(n=>n===0));assert.ok(volume>0);
  for(let i=0;i<n.count;i++)assert.ok(Math.abs(a.fromBufferAttribute(n,i).length()-1)<1e-5);
  g.dispose();copy.dispose();
 }
 assert.equal(distinct.size,SHELF_ARCHETYPES);assert.throws(()=>shelfArchetype(-1),RangeError);
});
test('M6.5 material, life, sediment, geology and camera systems remain source-locked',()=>{
 const changed=execFileSync('git',['diff',base,'--name-only','--','src'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 assert.ok(changed.every(f=>['src/scene/sanctuary/Sanctuary.js','src/scene/sanctuary/shelfSilhouettes.js'].includes(f)),changed.join('\n'));
 for(const name of ['materials.js','VentLife.js','geology.js','mesoGeology.js','BenthicSediment.js','VentDynamics.js','VentParticles.js','ThermalShimmer.js']){
  const path='src/scene/sanctuary/'+name;assert.equal(readFileSync(new URL('../'+path,import.meta.url),'utf8'),execFileSync('git',['show',base+':'+path],{encoding:'utf8'}));
 }
});
test('shelf variants retain exact approved anchors, instances and shared material without runtime churn',()=>{
 const s=new Sanctuary(new Scene());
 // Captured directly from dd97923: parity fixtures, not new aesthetic constants.
 for(const [value,expected] of [[s.life.anchored,'1388576c1dc811b7a2963483c1db8892c8ca18c8a4a285386a67bf09ae3aec67'],[s.life.widePoints,'9b5b03e201e5326bacf7bcdf24e751e8f4ca04c957729bdadf651c1f6e4fce22'],[s.meso,'c2a360b42b841066ca366b3de1de8186daa800a86407cc332e5a7c403fb65805'],[s.layout,'25ffa46e406853a5f881393daa52452fdaf7c42200ab2cca936c7a0a696f7006'],[[...s.sediment.origin],'6a9d1183a679f34399d1b0758281d698a91e5d6883fa3de34c7c7081c6f00f67']])assert.equal(hash(value),expected);
 const batches=s.solids.filter(m=>m.userData.shelfIds),ids=batches.flatMap(m=>m.userData.shelfIds);
 assert.equal(ids.length,s.meso.length);assert.equal(new Set(ids).size,ids.length);assert.equal(batches.length,SHELF_ARCHETYPES+1);
 const matrix=new Matrix4(),o=new Object3D(),material=batches[0].material;
 for(const batch of batches){assert.equal(batch.material,material);batch.userData.shelfIds.forEach((id,i)=>{const a=s.meso[id];o.position.fromArray(a.p);o.scale.fromArray(a.s);o.rotation.set(...a.r);o.updateMatrix();batch.getMatrixAt(i,matrix);assert.deepEqual([...new Float32Array(o.matrix.elements)],matrix.elements)});}
 assert.equal(new Set(batches.map(b=>b.geometry)).size,SHELF_ARCHETYPES+1);
 // Raycast confirms original ecological support is still present after refining.
 const ray=new Raycaster(),down=new Vector3(0,-1,0),rocks=s.solids.filter(m=>!['seep-filament-colonies','sheltered-vent-microfauna','rare-benthic-light-points'].includes(m.name));
 for(const a of s.life.anchored.shells){ray.set(new Vector3(a.anchor[0],0,a.anchor[2]),down);const hit=ray.intersectObjects(rocks,false)[0];assert.ok(hit);assert.ok(Math.abs(hit.point.y-a.anchor[1])<1e-6,JSON.stringify({anchor:a.anchor,hit:hit.point.toArray(),name:hit.object.name}));}
 const geometry=[...s.geometries],materials=[...s.materials];for(let i=0;i<180;i++)s.update(i/60);
 assert.deepEqual([...s.geometries],geometry);assert.deepEqual([...s.materials],materials);assert.equal(s.life.widePoints.length,10);assert.equal(s.state().extraOceanPasses,0);s.dispose();
});
