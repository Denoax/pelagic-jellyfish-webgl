import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {spireGeometry,fitSpireLayout} from '../src/scene/environment/asset2Layout.js';
import {asset2Paths,withoutAsset2Seams} from './asset2-scope.mjs';
import {ASSET2,outerVisibility} from '../src/scene/environment/asset2Config.js';
import * as THREE from 'three/webgpu';
import {vec3,uniform} from 'three/tsl';
import {Asset2Environment} from '../src/scene/environment/Asset2Environment.js';
const baseline='bce3571b0300ecfe5dc6e5dd45f28a9cda57006e';
test('Asset 2: atmosphere parameters finite; world fade bounded and monotonic',()=>{
 const inspect=o=>{for(const v of Object.values(o)){if(typeof v==='number')assert.ok(Number.isFinite(v));else if(v&&typeof v==='object')inspect(v);}};inspect(ASSET2);
 let previous=1;for(let r=0;r<4;r+=.005){const v=outerVisibility(r);assert.ok(v>=0&&v<=previous);previous=v;}assert.equal(outerVisibility(.85),1);assert.equal(outerVisibility(2.1),0);assert.equal(ASSET2.light.max,1);
});
test('Asset 2: bounded ownership restores original environment nodes and never mutates simulation buffers',()=>{
 const scene=new THREE.Scene(),background=vec3(.01);scene.backgroundNode=background;
 const group=new THREE.Group();scene.add(group);const material=new THREE.MeshBasicNodeMaterial(),original=vec3(.1);material.colorNode=original;
 const geometry=new THREE.BoxGeometry(192,4,192),mesh=new THREE.Mesh(geometry,material);mesh.position.set(0,-15,-28);group.add(mesh);
 const light={position:uniform(new THREE.Vector3(1,-12,-25)),power:uniform(.5),activation:uniform(0)};
 const sanctuary={group,solids:[mesh],light};
 const e=new Asset2Environment(scene,sanctuary),camera=new THREE.PerspectiveCamera();
 const position=new Float32Array([1,2,3]),alpha=new Float32Array([.4]),pm=new THREE.MeshBasicNodeMaterial(),opacity=uniform(.4);pm.opacityNode=opacity;
 const snow={layers:[{mesh:{material:pm},position,alpha}]};e.connect(camera,snow,null);
 e.update(0);e.update(.016);e.update(1000);assert.ok(e.waterTime.value<=.067,'Background-tab debt is not shader animation time');
 for(let i=0;i<10000;i++)e.update();assert.ok(e.cpuCount<=8192);assert.deepEqual([...position],[1,2,3]);assert.equal(alpha[0],Math.fround(.4));assert.ok(light.position.value.toArray().every(Number.isFinite));assert.equal(light.power.value,.5);
 assert.equal(e.group.children.length,4);assert.equal(e.state().extraOceanPasses,0);assert.equal(e.state().extraTargets,0);
 assert.equal(e.material.transparent,true);assert.equal(e.material.depthWrite,false);assert.ok(e.group.children.every(m=>m.renderOrder<0));
 e.dispose();e.dispose();assert.equal(scene.backgroundNode,background);assert.equal(material.colorNode,original);assert.equal(pm.opacityNode,opacity);assert.equal(e.group.parent,null);geometry.dispose();material.dispose();pm.dispose();
});
test('Asset 2: every approved runtime source outside the two exact environment seams is byte-identical',()=>{
 const paths=execFileSync('git',['ls-tree','-r','--name-only',baseline,'src'],{encoding:'utf8'}).trim().split('\n');
 for(const p of paths.filter(p=>!p.endsWith('AGENTS.md'))){
  const old=execFileSync('git',['show',`${baseline}:${p}`]);
  if(['src/scene/HeroScene.jsx','src/scene/PelagicEnvironment.js'].includes(p)){
   assert.equal(withoutAsset2Seams(readFileSync(p,'utf8')),old.toString(),p);
   const added=readFileSync(p,'utf8').split('\n').filter(l=>l.includes('backgroundPresentation')||l.includes('import { Asset2Environment }'));
   assert.equal(added.length,p.endsWith('.jsx')?1:4,'Only isolated environment ownership calls');
  }else assert.deepEqual(readFileSync(p),old,p);
 }
 const tracked=execFileSync('git',['diff',baseline,'--name-only','--','src'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
 assert.ok(tracked.every(p=>asset2Paths.includes(p)),tracked.join('\n'));
});
test('Asset 2: proxy geometry is deterministic, finite, closed, outward and bounded',()=>{
 for(let i=0;i<4;i++){
  const g=spireGeometry(i),copy=spireGeometry(i),p=g.attributes.position;
  assert.deepEqual(p.array,copy.attributes.position.array);assert.ok(p.count<220);
  assert.ok([...p.array].every(Number.isFinite));assert.ok(g.boundingBox.max.y<1.1);
  const edges=new Map();for(let k=0;k<g.index.count;k+=3)for(const[a,b]of[[0,1],[1,2],[2,0]]){const x=g.index.array[k+a],y=g.index.array[k+b],key=[Math.min(x,y),Math.max(x,y)].join(':');edges.set(key,(edges.get(key)||0)+1);}
  assert.ok([...edges.values()].every(n=>n===2));
  let signed=0;for(let k=0;k<g.index.count;k+=3){const a=g.index.array[k],b=g.index.array[k+1],c=g.index.array[k+2];signed+=p.getX(a)*(p.getY(b)*p.getZ(c)-p.getZ(b)*p.getY(c))+p.getY(a)*(p.getZ(b)*p.getX(c)-p.getX(b)*p.getZ(c))+p.getZ(a)*(p.getX(b)*p.getY(c)-p.getY(b)*p.getX(c));}assert.ok(signed>0);
  g.dispose();copy.dispose();
 }
});
test('Asset 2: frozen screen-fit layout never edits camera tracks or existing geology',()=>{
 const a=fitSpireLayout();assert.deepEqual(a,fitSpireLayout());assert.equal(a.items.length,30);assert.equal(a.anchors.length,6);
 for(const item of a.items){assert.ok([...item.p,...item.s,item.r].every(Number.isFinite));assert.ok(item.p[2]<-30);assert.ok(item.s.every(x=>x>0&&x<45));}
});
