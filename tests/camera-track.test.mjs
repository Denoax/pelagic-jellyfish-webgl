import test from 'node:test';
import assert from 'node:assert/strict';
import { PerspectiveCamera, Quaternion } from 'three/webgpu';
import { bakeTrack, ProgressSpring, TrackPlayer } from '../src/scene/dev/camera/CameraTrack.js';
import { directions } from '../src/scene/dev/camera/directions.js';

test('analytic scalar matches at 30/60/120 Hz and irregular frame steps', () => {
  const run = hz => { const s = new ProgressSpring(); for (let i=0;i<hz*2;i++) s.update(.8,1/hz); return s; };
  const a=run(30),b=run(120); assert.ok(Math.abs(a.position-b.position)<1e-12); assert.ok(Math.abs(a.velocity-b.velocity)<1e-12);
  const c=new ProgressSpring();for(let i=0;i<40;i++){c.update(.8,.012);c.update(.8,.038);}assert.ok(Math.abs(a.position-c.position)<1e-12);
});
test('forward/reverse symmetry, finite jumps, pause debt discarded', () => {
  const a=new ProgressSpring(),b=new ProgressSpring(); b.reset(1);
  for(let i=0;i<120;i++){a.update(1,1/60);b.update(0,1/60);assert.ok(Math.abs(a.position+b.position-1)<1e-12);}
  const p=a.position;a.update(0,30);assert.equal(a.position,p);assert.equal(a.velocity,0);
  for(let i=0;i<2000;i++){a.update(i%80<40?0:1,1/60);assert.ok(a.position>=0&&a.position<=1);assert.ok(Number.isFinite(a.velocity));}
});
for(const definition of Object.values(directions)) test(`${definition.id}: fixed lens, finite unit quaternions, hemisphere continuity and zero roll`, () => {
  const track=bakeTrack(definition),camera=new PerspectiveCamera(),player=new TrackPlayer(track),q=new Quaternion(),prev=new Quaternion();
  for(let i=0;i<track.count;i++){player.sample(i/(track.count-1),camera);q.copy(camera.quaternion);assert.ok(Math.abs(q.length()-1)<1e-10);if(i)assert.ok(q.dot(prev)>0);prev.copy(q);assert.equal(camera.fov,definition.fov);assert.ok(camera.position.toArray().every(Number.isFinite));}
});
test('holds remain exactly stationary and malformed authoring is rejected', () => {
  const player=new TrackPlayer(bakeTrack(directions.A)),c=new PerspectiveCamera();player.sample(.01,c);const p=c.position.clone(),q=c.quaternion.clone();player.sample(.12,c);assert.ok(c.position.distanceTo(p)<1e-12);assert.ok(c.quaternion.angleTo(q)<1e-7);
  assert.throws(()=>bakeTrack({...directions.A,poses:[directions.A.poses[1],directions.A.poses[0]]}));
});
