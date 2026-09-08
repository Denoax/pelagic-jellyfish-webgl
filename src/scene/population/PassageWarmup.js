// M4.1 startup only. Build the EXISTING M3 programs before the canvas is shown.
// No alternate optics, new targets, simulation steps, or steady-state passes.
const prepared = new WeakMap();
export function preparePopulationPassage(renderer, scene, camera, passage) {
  if (prepared.has(passage)) return prepared.get(passage);
  const work = (async () => {
    const start = performance.now(), { mesh, lens } = passage;
    const saved = { target: renderer.getRenderTarget(), tone: renderer.toneMapping,
      color: renderer.outputColorSpace, xr: renderer.xr.enabled, visible: mesh.visible, count: mesh.count };
    try {
      renderer.getDrawingBufferSize(lens.size);
      lens.target.setSize(lens.size.x, lens.size.y);
      // Keep the real pool count. In r175, count=1 builds a non-instanced
      // shader; restoring the count afterwards does not reliably rebuild it.
      // Initial opacity is zero, so no bubbles are advanced or spawned here.
      mesh.visible = true;
      renderer.setRenderTarget(lens.target);
      await renderer.compileAsync(scene, camera);
      if (lens.disposed) return;
      await renderer.renderAsync(scene, camera);
      renderer.setRenderTarget(saved.target);
      if (lens.disposed) return;
      // r175 PostProcessing has renderAsync, not a public compile method.
      // Sampling the completed input target is legal; never read/write it
      // simultaneously. HeroScene redraws the ordinary ocean before ready.
      await lens.output.renderAsync();
      return { ms: performance.now() - start, oceanDraws: 1, outputDraws: 1,
        newTargets: 0, size: [lens.size.x, lens.size.y] };
    } finally {
      mesh.visible = saved.visible; mesh.count = saved.count;
      renderer.setRenderTarget(saved.target); renderer.toneMapping = saved.tone;
      renderer.outputColorSpace = saved.color; renderer.xr.enabled = saved.xr;
    }
  })();
  prepared.set(passage, work); return work;
}
