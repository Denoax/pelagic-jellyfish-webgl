// Browser-only profiling. Never imported by the artwork. Timings include probe
// overhead and are deliberately separate from the uninstrumented comparisons.
export function installPopulationCostProfile() {
  const scene = window.__JELLYFISH_WORLD__.scene, tissues = new Set();
  scene.traverse(o => { if (o.userData.livingAppendages) tissues.add(o.userData.livingAppendages); });
  const report = window.__POPULATION_PROFILE__ = { methods: {}, frames: [], switches: 0,
    resources: { newGeometry: 0, newMaterial: 0, geometryDispose: 0, materialDispose: 0, attributeReplacement: 0 },
    note: 'Inclusive method costs; wrappers and state sampling add overhead. Not a performance benchmark.' };
  const knownGeometry = new Set(), knownMaterial = new Set(), attributes = new WeakMap();
  let warmed = false, frames = 0, last = performance.now();
  const inspectResources = () => scene.traverse(o => {
    if (o.geometry && !knownGeometry.has(o.geometry)) {
      knownGeometry.add(o.geometry); if (warmed) report.resources.newGeometry++;
      o.geometry.addEventListener('dispose', () => report.resources.geometryDispose++);
    }
    for (const m of o.material ? Array.isArray(o.material) ? o.material : [o.material] : []) if (!knownMaterial.has(m)) {
      knownMaterial.add(m); if (warmed) report.resources.newMaterial++;
      m.addEventListener('dispose', () => report.resources.materialDispose++);
    }
  });
  // Tier meshes already exist but need not be attached to the scene yet.
  for (const t of tissues) for (const g of [...t.bellLevels, ...t.armLevels, t.tentacleGeometry, t.filamentGeometry]) {
    knownGeometry.add(g); attributes.set(g, Object.values(g.attributes).map(a => a.array));
    g.addEventListener('dispose', () => report.resources.geometryDispose++);
  }
  inspectResources(); warmed = true;
  for (const t of tissues) for (const key of ['update', 'inspectImportance', 'simulateChains', 'updateArmGeometry',
    'updateBellSurface', 'updateTubeGeometry', 'updateBellDetails', 'updateVisualResponse', 'getBellShape']) {
    const original = t[key];
    t[key] = function (...args) {
      const begin = performance.now(), detail = this.detail;
      const tier = Math.ceil(detail), visible = this.onScreen && this.presence > .008;
      const label = `${tier}:${visible ? 'visible' : 'hidden'}:${Number.isInteger(detail) ? 'stable' : 'transition'}:${key}`;
      try { return original.apply(this, args); }
      finally {
        const ms = performance.now() - begin;
        const record = report.methods[label] ||= { ms: 0, calls: 0, max: 0 };
        record.ms += ms; record.calls++; record.max = Math.max(record.max, ms);
        if (key === 'inspectImportance' && Math.ceil(detail) !== Math.ceil(this.detail)) report.switches++;
      }
    };
  }
  const after = scene.onAfterRender;
  scene.onAfterRender = function (renderer, ...args) {
    after.call(this, renderer, ...args); frames++;
    if (frames % 30) return;
    inspectResources();
    for (const t of tissues) for (const g of [...t.bellLevels, ...t.armLevels, t.tentacleGeometry, t.filamentGeometry]) {
      const old = attributes.get(g), next = Object.values(g.attributes).map(a => a.array);
      if (next.some((a, i) => a !== old[i])) report.resources.attributeReplacement++;
      attributes.set(g, next);
    }
    let transparent = 0; scene.traverseVisible(o => { if (o.material?.transparent) transparent++; });
    report.frames.push({ wall: performance.now() - last, count: window.__POPULATION__.state().counts,
      calls: renderer.info.render.drawCalls, triangles: renderer.info.render.triangles,
      transparentObjects: transparent, memory: { ...renderer.info.memory } });
  };
}
