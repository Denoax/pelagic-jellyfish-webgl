import test from 'node:test';
import assert from 'node:assert/strict';
import { JourneyController } from '../src/scene/camera/JourneyController.js';
import { readViewPreferences, writeViewPreferences } from '../src/scene/camera/viewPreferences.js';

for(const response of ['cinematic','balanced','responsive'])test(`${response}: speed, acceleration and endpoints remain bounded under aggressive input`,()=>{
  const c=new JourneyController({response});
  for(let i=0;i<30000;i++){
    const target=i<12000?1:i<24000?0:Math.floor(i/121)%2;
    const v=c.velocity,p=c.position;c.update(target,1/120);
    assert.ok(Math.abs(c.velocity)<=c.maxSpeed+1e-12);
    assert.ok(Math.abs(c.velocity-v)/(1/120)<=c.maxAcceleration+1e-10);
    assert.ok(Math.abs(c.position-p)/(1/120)<=c.maxSpeed+1e-10);
    assert.ok(c.position>=-1e-8&&c.position<=1+1e-8,`endpoint ${c.position}`);
  }
});
test('journey is cadence independent, settles and ignores background debt',()=>{
  const a=new JourneyController(),b=new JourneyController();
  for(let k=0;k<4;k++){const target=k%2;for(let i=0;i<900;i++)a.update(target,1/30);for(let i=0;i<3600;i++)b.update(target,1/120);}
  assert.ok(Math.abs(a.position-b.position)<1e-10);assert.ok(Math.abs(a.velocity-b.velocity)<1e-10);
  const p=a.position,v=a.velocity;a.update(0,12);assert.equal(a.position,p);assert.equal(a.velocity,v);
  for(let i=0;i<12000;i++)a.update(1,1/120);
  assert.ok(Math.abs(a.position-1)<1e-9);assert.ok(Math.abs(a.velocity)<1e-9);
});
test('preferences validate unknown data and tolerate denied storage',()=>{
  assert.deepEqual(readViewPreferences({getItem:()=>'{bad'}),{mode:'A',expanded:false,response:'balanced'});
  assert.deepEqual(readViewPreferences({getItem:()=>JSON.stringify({mode:'explore',expanded:true,response:'cinematic'})}),{mode:'explore',expanded:true,response:'cinematic'});
  assert.equal(readViewPreferences({getItem:()=>JSON.stringify({mode:'<script>',response:'99'})}).mode,'A');
  assert.doesNotThrow(()=>writeViewPreferences({setItem:()=>{throw Error('denied');}},{}));
  assert.doesNotThrow(()=>readViewPreferences({getItem:()=>{throw Error('denied');}}));
});
