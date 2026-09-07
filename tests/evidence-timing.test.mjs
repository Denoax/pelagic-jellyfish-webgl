import test from 'node:test';
import assert from 'node:assert/strict';
import { installOceanCompletionProbe } from '../scripts/ocean-completion-probe.mjs';

test('browser probe counts completed async renders, including a held simulation, but not busy returns', async () => {
  const savedWindow=globalThis.window, savedDocument=globalThis.document;
  let queued;
  globalThis.window={requestAnimationFrame(callback){queued=callback;return 1;}};
  globalThis.document={hidden:false};
  try {
    installOceanCompletionProbe();
    let busy=false;
    const clock={getDelta(){return 0;}};
    const animate=async()=>{
      // __JELLYFISH_WORLD__: same identifying source marker as the actual loop.
      if(busy)return;
      clock.getDelta();
      await Promise.resolve(); // await app.update(), even with no world step
    };
    window.requestAnimationFrame(animate);
    const frame=async()=>{await queued(0);await Promise.resolve();};
    await frame();await frame();
    assert.equal(window.__AUDIT_RENDER__.read().intervals.length,1);
    busy=true;await frame();await frame();
    assert.equal(window.__AUDIT_RENDER__.read().intervals.length,1);
    busy=false;document.hidden=true;await frame();
    assert.equal(window.__AUDIT_RENDER__.read().intervals.length,1);
    document.hidden=false;await frame();
    assert.equal(window.__AUDIT_RENDER__.read().intervals.length,2);
    assert.equal(window.__AUDIT_RENDER__.read().matched,1);
  } finally {globalThis.window=savedWindow;globalThis.document=savedDocument;}
});
