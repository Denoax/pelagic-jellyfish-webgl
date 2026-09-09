import test from 'node:test';
import assert from 'node:assert/strict';
import { JourneyController, normalizeWheel } from '../src/scene/camera/JourneyController.js';
import { readViewPreferences, writeViewPreferences } from '../src/scene/camera/viewPreferences.js';

for(const response of ['cinematic','balanced','responsive'])test(`${response}: speed, acceleration and endpoints remain bounded under aggressive input`,()=>{
  const c=new JourneyController({response});
  for(let i=0;i<30000;i++){
    if(i%12===0)c.input(i<12000?10000:i<24000?-10000:Math.floor(i/121)%2?5000:-5000);
    const v=c.velocity,p=c.position;c.update(null,1/120);
    assert.ok(Math.abs(c.velocity)<=c.maxSpeed+1e-12);
    assert.ok(Math.abs(c.velocity-v)/(1/120)<=c.maxAcceleration+1e-10);
    assert.ok(Math.abs(c.position-p)/(1/120)<=c.maxSpeed+1e-10);
    assert.ok(c.position>=-1e-8&&c.position<=1+1e-8,`endpoint ${c.position}`);
  }
});
test('journey is cadence independent, settles and ignores background debt',()=>{
  const a=new JourneyController(),b=new JourneyController();
  for(let k=0;k<4;k++){const pixels=k%2?100:-100;a.input(pixels);b.input(pixels);for(let i=0;i<900;i++)a.update(null,1/30);for(let i=0;i<3600;i++)b.update(null,1/120);}
  assert.ok(Math.abs(a.position-b.position)<1e-10);assert.ok(Math.abs(a.velocity-b.velocity)<1e-10);
  const p=a.position,v=a.velocity;a.update(0,12);assert.equal(a.position,p);assert.equal(a.velocity,v);
  a.input(100);
  for(let i=0;i<1200;i++)a.update(null,1/120);
  assert.equal(a.position,a.target);assert.equal(a.velocity,0);
});
test('wheel units produce equivalent intent; ordinary step moves promptly and settles exactly',()=>{
  const values=[normalizeWheel(48,0,900),normalizeWheel(3,1,900),normalizeWheel(48/900,2,900)];
  const paths=values.map(pixels=>{const c=new JourneyController();c.input(pixels);const path=[];for(let i=0;i<480;i++){c.update(null,1/240);path.push(c.position);}return path;});
  assert.deepEqual(paths[0],paths[1]);assert.deepEqual(paths[1],paths[2]);
  assert.ok(paths[0][23]>.005,'100ms response should not crawl');
  assert.ok(paths[0][119]>.025,'ordinary step should nearly arrive within 500ms');
  assert.equal(paths[0].at(-1),48*.0006);
  assert.equal(normalizeWheel(NaN,0,900),0);
});
test('input accumulates, extreme lead saturates, reverse drops queue and brakes promptly',()=>{
  const c=new JourneyController();c.seek(.5);c.input(20);const first=c.target;c.input(20);assert.ok(c.target>first);
  for(let i=0;i<50;i++)c.input(10000);
  assert.ok(c.target-c.position<=c.maxLead+1e-10);
  for(let i=0;i<48;i++){c.input(100);c.update(null,1/240);}
  assert.ok(c.velocity>.13);const position=c.position;
  c.input(-100);assert.ok(c.target<position,'reverse must not work through old forward queue');
  let maxAhead=0;for(let i=0;i<48;i++){c.update(null,1/240);maxAhead=Math.max(maxAhead,c.position-position);}
  assert.ok(c.velocity<0);assert.ok(maxAhead<.009);
  for(let i=0;i<720;i++)c.update(null,1/240);
  assert.equal(c.velocity,0);assert.equal(c.position,c.target);
});
test('elapsed time cannot request travel and settled camera remains exactly still',()=>{
 const c=new JourneyController();for(let i=0;i<10000;i++)c.update(1,1/60);
 assert.equal(c.position,0);assert.equal(c.target,0);
 c.input(100);for(let i=0;i<600;i++)c.update(null,1/60);const rest=c.position;
 for(let i=0;i<10000;i++)c.update(null,1/60);assert.equal(c.position,rest);
});
test('preferences validate unknown data and tolerate denied storage',()=>{
  assert.deepEqual(readViewPreferences({getItem:()=>'{bad'}),{mode:'B',expanded:false,response:'balanced'});
  assert.deepEqual(readViewPreferences({getItem:()=>JSON.stringify({mode:'explore',expanded:true,response:'cinematic'})}),{mode:'explore',expanded:true,response:'cinematic'});
  assert.equal(readViewPreferences({getItem:()=>JSON.stringify({mode:'<script>',response:'99'})}).mode,'B');
  assert.doesNotThrow(()=>writeViewPreferences({setItem:()=>{throw Error('denied');}},{}));
  assert.doesNotThrow(()=>readViewPreferences({getItem:()=>{throw Error('denied');}}));
});
