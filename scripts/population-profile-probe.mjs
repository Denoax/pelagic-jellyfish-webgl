// Temporary browser instrumentation, never imported by the artwork.
export function installPopulationProfile() {
  const tissues = new Set();
  window.__JELLYFISH_WORLD__.scene.traverse(o => { if (o.userData.livingAppendages) tissues.add(o.userData.livingAppendages); });
  window.__POPULATION_PROFILE__ = {};
  for (const t of tissues) for (const key of ['update', 'simulateChains', 'updateArmGeometry', 'updateBellSurface', 'updateTubeGeometry', 'updateBellDetails', 'updateSignalPearls']) {
    const original = t[key];
    t[key] = function (...args) {
      const start = performance.now();
      try { return original.apply(this, args); }
      finally {
        const label = `${Math.ceil(this.detail)}:${key}`;
        const record = window.__POPULATION_PROFILE__[label] ||= { ms: 0, calls: 0 };
        record.ms += performance.now() - start; record.calls++;
      }
    };
  }
}
