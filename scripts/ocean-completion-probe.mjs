// Injected only by the browser evidence tool; never imported into the artwork.
export function installOceanCompletionProbe() {
  const raf = window.requestAnimationFrame.bind(window), wrappers = new WeakMap();
  let last = 0, intervals = [], matched = 0;
  window.__AUDIT_RENDER__ = {
    reset() { last = 0; intervals = []; },
    read() { return { matched, method: 'async-render-completion-v2', intervals: intervals.slice() }; },
  };
  window.requestAnimationFrame = callback => {
    if (!wrappers.has(callback)) {
      const source = Function.prototype.toString.call(callback);
      const ocean = callback.constructor.name === 'AsyncFunction'
        && source.includes('__JELLYFISH_WORLD__') && source.includes('.getDelta()');
      if (ocean) matched++;
      wrappers.set(callback, ocean ? function(t) {
        let yielded = false;
        const result = callback(t);
        result.then(() => {
          // Busy/hidden early returns resolve before our microtask marker.
          // An actual await app.update() completes after it, even if the
          // environmental fixed-step clock didn't advance this display frame.
          if (!yielded || document.hidden) return;
          const now = performance.now();
          if (last && intervals.length < 20000) intervals.push(now - last);
          last = now;
        });
        queueMicrotask(() => { yielded = true; });
        return result;
      } : callback);
    }
    return raf(wrappers.get(callback));
  };
}
