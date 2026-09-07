import test from 'node:test';
import assert from 'node:assert/strict';
import { Object3D, Vector2, Vector3 } from 'three/webgpu';
import { LivingAppendages } from '../src/scene/LivingAppendages.js';
import { sampleSwimCycle } from '../src/scene/jellyMotion.js';
import { mantlePoint, membraneSection, separateOralSpines, boundedTissueDelta } from '../src/scene/anatomy/mantle.js';

const create=()=>new LivingAppendages({transformationObject:new Object3D()},0,{improved:true});
test('candidate bell has no degenerate triangles and a continuous split-UV seam',()=>{
  const tissue=create(),a=new Vector3(),b=new Vector3(),c=new Vector3();
  for(const cycle of [0,.2,.48,.75]){
    tissue.medusa.swimKinematics=sampleSwimCycle(cycle);
    tissue.update(1/60,cycle,new Vector2());
    const g=tissue.bellGeometry,p=g.attributes.position,n=g.attributes.normal;
    for(let i=0;i<g.index.count;i+=3){
      a.fromBufferAttribute(p,g.index.getX(i));b.fromBufferAttribute(p,g.index.getX(i+1));c.fromBufferAttribute(p,g.index.getX(i+2));
      assert.ok(b.sub(a).cross(c.sub(a)).lengthSq()>1e-12,`triangle ${i/3}, phase ${cycle}`);
    }
    const {stride,segments,totalRings}=g.userData;
    for(let row=1;row<=totalRings;row++){
      const left=row*stride,right=left+segments;
      assert.ok(a.fromBufferAttribute(p,left).distanceTo(b.fromBufferAttribute(p,right))<1e-6);
      assert.ok(a.fromBufferAttribute(n,left).distanceTo(b.fromBufferAttribute(n,right))<1e-6);
      assert.equal(g.attributes.uv.getX(left),0);assert.equal(g.attributes.uv.getX(right),1);
    }
  }
  tissue.dispose();
});
test('oral contact separation preserves Verlet velocity and fixed roots',()=>{
  const tissue=create();
  tissue.armChains.forEach(c=>c.particles.forEach((p,i)=>{p.position.set(0,-i*.07,0);p.previous.copy(p.position).add(new Vector3(.01,.02,.03));}));
  separateOralSpines(tissue.armChains);
  for(const chain of tissue.armChains){
    assert.equal(chain.particles[0].position.length(),0);
    chain.particles.forEach(p=>assert.ok(p.previous.clone().sub(p.position).distanceTo(new Vector3(.01,.02,.03))<1e-10));
  }
  assert.ok(tissue.armChains[0].particles[20].position.distanceTo(tissue.armChains[1].particles[20].position)>.2);
  tissue.dispose();
});
test('four oral roots remain inserted in the shared gastric body through a pulse',()=>{
  const tissue=create(),p=new Vector3();
  for(const cycle of [0,.2,.48,.75]){
    tissue.medusa.swimKinematics=sampleSwimCycle(cycle);
    tissue.update(1/60,cycle,new Vector2());tissue.group.updateMatrixWorld(true);
    const gastric=tissue.organs.children[0];
    for(const chain of tissue.armChains){
      let nearest=Infinity;
      for(let i=0;i<tissue.organGeometry.attributes.position.count;i++){
        p.fromBufferAttribute(tissue.organGeometry.attributes.position,i).applyMatrix4(gastric.matrixWorld);
        nearest=Math.min(nearest,p.distanceTo(chain.particles[0].position));
      }
      assert.ok(nearest<.006,`insertion gap ${nearest}`);
    }
  }
  tissue.dispose();
});
test('mantle and margin are periodic and finite throughout contraction and refill',()=>{
  const tissue=create();const current=new Vector2(.2,-.1);
  for(let i=0;i<=100;i++){
    const shape=tissue.getBellShape(i/100/tissue.pulseRate);
    for(let t=0;t<=1.12;t+=.04){
      const a=mantlePoint(t,0,shape,8,current,{}),b=mantlePoint(t,Math.PI*2,shape,8,current,{});
      for(const key of ['x','y','z']){assert.ok(Number.isFinite(a[key]));assert.ok(Math.abs(a[key]-b[key])<1e-10);}
    }
    tissue.surfaceCurrent.copy(current);
    tissue.tentacleChains.forEach(chain=>{
      tissue.anchorChain(chain,shape);
      const edge=mantlePoint(1.1,chain.angle,shape,8,current,new Vector3());
      assert.ok(chain.particles[0].position.distanceTo(edge)<1e-10);
    });
  }
  tissue.dispose();
});
test('folded membrane has non-planar width and a closed rounded endpoint',()=>{
  assert.notEqual(membraneSection(.5,.5,0,0,{}).fold,0);
  for(let u=-1;u<=1;u+=.125){const p=membraneSection(1,u,1,0,{});assert.ok(p.width===0&&p.fold===0);}
});
test('simulation rejects background-tab jumps instead of catching up seconds',()=>{
  for(const dt of [0,-1,NaN,Infinity,.25,10])assert.equal(boundedTissueDelta(dt),0);
  assert.equal(boundedTissueDelta(1/120),1/120);
  assert.equal(boundedTissueDelta(.1),.05);
});
test('candidate geometry and activation remain finite through multiple cycles and a turn',()=>{
  const tissue=create();const current=new Vector2();
  for(let frame=0;frame<1080;frame++){
    const t=frame/60;
    tissue.medusa.transformationObject.quaternion.setFromAxisAngle(new Vector3(0,0,1),Math.sin(t*.2)*.6);
    if(frame===240)tissue.activate(new Vector3(.4,.5,.1));
    tissue.update(1/60,t,current);
  }
  for(const geometry of [tissue.bellGeometry,tissue.armGeometry,tissue.tentacleGeometry]){
    assert.ok(geometry.attributes.position.array.every(Number.isFinite));
    assert.ok(geometry.attributes.normal.array.every(Number.isFinite));
  }
  const normals=tissue.bellGeometry.attributes.normal;
  assert.ok(normals.getY(tissue.bellGeometry.userData.stride)>0,'upper mantle normals point outward');
  assert.ok(tissue.activation<.01);
  assert.equal(tissue.getInteractionMeshes()[0],tissue.bell);
  tissue.dispose();
});
test('30/60/120 Hz appendage presentation has a bounded trajectory difference',()=>{
  function run(hz){const tissue=create();const current=new Vector2();
    for(let i=1;i<=hz*8;i++){
      const t=i/hz;
      tissue.medusa.transformationObject.position.set(Math.sin(t*.15)*.4,t*.15,0);
      tissue.medusa.transformationObject.quaternion.setFromAxisAngle(new Vector3(0,0,1),Math.sin(t*.2)*.35);
      tissue.update(1/hz,t,current);
    }
    const points=tissue.armChains.flatMap(c=>c.particles.map(p=>p.position.clone()));tissue.dispose();return points;
  }
  const reference=run(60);
  for(const hz of [30,120]){
    const points=run(hz);const max=Math.max(...points.map((p,i)=>p.distanceTo(reference[i])));
    assert.ok(max<.2,`${hz} Hz maximum oral-arm difference ${max.toFixed(4)} world units`);
  }
});
