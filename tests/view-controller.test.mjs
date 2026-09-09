import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera } from 'three/webgpu';
import { ViewController } from '../src/scene/camera/ViewController.js';

test('mode changes preserve world and pose continuity; editing remains transactional',()=>{
 const saved=Object.fromEntries(['window','document','innerHeight'].map(k=>[k,globalThis[k]]));
 const win=new EventTarget(),doc=new EventTarget(),surface=new EventTarget();
 win.localStorage={getItem:()=>null,setItem:()=>{}};win.scrollY=0;win.scrollTo=({top})=>{win.scrollY=top;};
 doc.documentElement={scrollHeight:10000,classList:{toggle(){},remove(){}}};doc.querySelector=()=>null;
 Object.assign(globalThis,{window:win,document:doc,innerHeight:900});
 let c;
 try {
  const world=Object.freeze({actors:Object.freeze([])}),camera=new PerspectiveCamera();c=new ViewController(camera,world,new URLSearchParams(),surface);
  for(let i=0;i<120;i++){c.advance(.4,1/60,i/60);c.updatePose(1/60,i/60);}
  const progress=c.journey.position;
  for(const mode of ['C','D','A','explore','B']){
   const position=camera.position.clone(),quaternion=camera.quaternion.clone();c.select(mode);
   assert.equal(c.journey.position,progress);assert.equal(c.director,world);assert.ok(camera.position.equals(position));assert.ok(camera.quaternion.equals(quaternion));
   for(let i=0;i<70;i++)c.updatePose(1/60,i/60);
   assert.ok(Math.abs(camera.quaternion.length()-1)<1e-10);
  }
  const player=c.players.B;assert.throws(()=>c.apply('{bad'));assert.equal(c.players.B,player);
  const invalid=JSON.parse(c.authoring());invalid.fov=900;assert.throws(()=>c.apply(JSON.stringify(invalid)));assert.equal(c.players.B,player);
  c.setFov(63);assert.equal(c.definitions.B.fov,63);
  const draft=c.savePose(c.authoring());c.apply(draft);const exported=JSON.parse(c.export(draft));assert.equal(exported.poses.length,1201);assert.equal(exported.poses[0].fov,63);
  c.select('A');c.select('B');assert.equal(c.definitions.B.fov,63);
  c.keys.add('KeyW');win.dispatchEvent(new Event('blur'));assert.equal(c.keys.size,0);
 } finally {c?.dispose();for(const [k,v] of Object.entries(saved)){if(v===undefined)delete globalThis[k];else globalThis[k]=v;}}
});
