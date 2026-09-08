// Browser-only diagnostic. Timings are synchronous WebGL API wall costs, NOT
// GPU timings; blocking shader/buffer calls can include driver work and waits.
export function installWebGLStallProfile() {
  const names = ['compileShader','linkProgram','getProgramParameter','getShaderParameter','bufferData',
    'bufferSubData','texImage2D','texStorage2D','texSubImage2D','drawElements','drawArrays','drawElementsInstanced',
    'drawArraysInstanced','readPixels','clientWaitSync','finish','flush'];
  let active = false, start = 0, entries = [], totals = {};
  window.__GL_STALL__ = {
    reset() { entries = []; totals = {}; start = performance.now(); active = true; },
    read() { active = false; return { entries, totals, note: 'Instrumented synchronous API wall duration; not GPU timings.' }; },
  };
  for (const name of names) {
    const method = WebGL2RenderingContext.prototype[name];
    WebGL2RenderingContext.prototype[name] = function (...args) {
      if (!active) return method.apply(this, args);
      const begin = performance.now();
      try { return method.apply(this, args); }
      finally {
        const ms = performance.now() - begin, row = totals[name] ||= { calls: 0, ms: 0, max: 0 };
        row.calls++; row.ms += ms; row.max = Math.max(row.max, ms);
        if (ms >= 2) entries.push({ name, ms, at: begin - start });
      }
    };
  }
}
