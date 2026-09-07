import * as THREE from 'three/webgpu';
import { LivingAppendages } from '../LivingAppendages.js';
import { biologicalVariation, DetailState, canInteract } from './Importance.js';
import { mantleGrid, armGrid, morphSurface } from './SurfaceLod.js';

// An adapter of the approved implementation, NOT another animal engine.
// Near calls its exact geometry/material/physics methods. Lower tiers resample
// the same persistent spines and mantle. No pose resets when detail changes.
export class PopulationAnimal extends LivingAppendages {
  constructor(medusa, index, options = {}) {
    super(medusa, index, { ...options, fidelity: 'hero', improved: true });
    this.detailState = new DetailState(); this.detail = 2; this.pixels = 0; this.onScreen = false;
    this.variation = biologicalVariation(index, options.reference === true);
    this.species = { ...this.species, radius: this.species.radius * this.variation.width,
      height: this.species.height * this.variation.height };
    this.armChains.forEach(c => { c.restLength *= this.variation.armLength; });
    this.bellLevels = [mantleGrid(7, 24), mantleGrid(14, 36), this.bellGeometry];
    this.armGeometry.userData.points = 56;
    this.armLevels = [armGrid(15), armGrid(29), this.armGeometry];
    this.bellColors = this.bellLevels.map(g => new Float32Array(g.attributes.color.array));
    this.masterArms = this.armChains;
    this.sampledArms = [15, 29].map(count => this.masterArms.map(c => ({ ...c,
      particles: Array.from({ length: count }, () => ({ position: new THREE.Vector3() })) })));
    this.chainWeights = new Float32Array(this.tentacleCount).fill(1);
    this.tubeViews = new Map();
    this.tubeIndices = new Map();
    for (const [geometry, chains, sides] of [[this.tentacleGeometry, this.tentacleChains, this.tubeSides],
      [this.filamentGeometry, this.filamentChains, 4]]) {
      if (!geometry) continue;
      const size = chains[0].particles.length * sides * 3;
      this.tubeViews.set(geometry, chains.map((_, i) => ({ attributes: {
        position: new THREE.BufferAttribute(geometry.attributes.position.array.subarray(i * size, (i + 1) * size), 3),
        normal: new THREE.BufferAttribute(geometry.attributes.normal.array.subarray(i * size, (i + 1) * size), 3),
      } })));
      const perChain = geometry.index.count / chains.length;
      this.tubeIndices.set(geometry, [0, 1, 2].map(tier => {
        if (tier === 2) return geometry.index;
        const indices = [];
        chains.forEach((_, i) => { if (i % (tier ? 2 : 4) === 0)
          indices.push(...geometry.index.array.subarray(i * perChain, (i + 1) * perChain)); });
        return new THREE.BufferAttribute(new Uint16Array(indices), 1);
      }));
    }
    this.activeTentacles = this.tentacleChains;
    this.wakeRotation = new THREE.Quaternion();
    this.emptyChains = [];
  }

  inspectImportance(pixels, visible, dt) {
    this.pixels = pixels; this.onScreen = visible;
    this.detail = this.detailState.update(pixels, visible && this.presence > .008, dt);
    const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    this.tentacleChains.forEach((chain, i) => {
      const weight = i % 4 === 0 ? 1 : i % 2 === 0 ? ease(this.detail) : ease(this.detail - 1);
      if (weight > 0 && this.chainWeights[i] === 0) {
        const source = this.tentacleChains[Math.floor(i / 4) * 4];
        this.wakeRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), chain.angle - source.angle);
        chain.particles.forEach((p, j) => {
          p.position.copy(source.particles[j].position).applyQuaternion(this.wakeRotation);
          p.previous.copy(source.particles[j].previous).applyQuaternion(this.wakeRotation);
        });
      }
      this.chainWeights[i] = weight;
    });
    this.activeTentacles = this.tentacleChains.filter((_, i) => this.chainWeights[i] > 0);
    this.tentacleGeometry.setIndex(this.tubeIndices.get(this.tentacleGeometry)[Math.ceil(this.detail)]);
  }

  getInteractionMeshes() {
    return canInteract(this.pixels, this.onScreen, this.presence) ? super.getInteractionMeshes() : [];
  }
  simulateChains(chains, ...args) {
    if (chains === this.tentacleChains) chains = this.activeTentacles;
    if (chains === this.filamentChains && this.detail <= 1) return;
    super.simulateChains(chains, ...args);
  }
  updateTubeGeometry(chains, geometry, sides, width) {
    if (!this.tubeViews) return super.updateTubeGeometry(chains, geometry, sides, width);
    if (chains === this.filamentChains && this.detail <= 1) return;
    const views = this.tubeViews.get(geometry);
    chains.forEach((chain, i) => {
      const weight = chains === this.tentacleChains ? this.chainWeights[i] : Math.min(1, this.detail - 1);
      if (weight > 0) super.updateTubeGeometry([chain], views[i], sides, width * weight);
    });
    geometry.attributes.position.needsUpdate = true; geometry.attributes.normal.needsUpdate = true;
  }

  updateBellSurface(...args) {
    if (!this.bellLevels) return super.updateBellSurface(...args);
    const high = Math.ceil(this.detail), low = Math.floor(this.detail);
    for (const tier of high === low ? [high] : [low, high]) {
      this.bellGeometry = this.bellLevels[tier]; this.baseBellColors = this.bellColors[tier];
      const sampleArgs = [...args];
      if (tier !== 2 && !this.bellGeometry.userData.sampled) sampleArgs[3] = true;
      super.updateBellSurface(...sampleArgs); this.bellGeometry.userData.sampled = true;
    }
    if (high !== low) morphSurface(this.bellLevels[high], this.bellLevels[low], high - this.detail);
    this.bell.geometry = this.bellGeometry;
  }
  updateArmGeometry(elapsed, normals) {
    if (!this.armLevels) return super.updateArmGeometry(elapsed, normals);
    const high = Math.ceil(this.detail), low = Math.floor(this.detail);
    for (const tier of high === low ? [high] : [low, high]) {
      this.armGeometry = this.armLevels[tier];
      this.armChains = tier === 2 ? this.masterArms : this.sampledArms[tier];
      if (tier !== 2) this.armChains.forEach((c, i) => c.particles.forEach((p, j) => {
        const x = j / (c.particles.length - 1) * (this.masterArms[i].particles.length - 1);
        const a = Math.floor(x), b = Math.min(a + 1, this.masterArms[i].particles.length - 1);
        p.position.copy(this.masterArms[i].particles[a].position).lerp(this.masterArms[i].particles[b].position, x - a);
      }));
      super.updateArmGeometry(elapsed, normals || (tier !== 2 && !this.armGeometry.userData.sampled));
      this.armGeometry.userData.sampled = true;
      this.armChains = this.masterArms;
    }
    if (high !== low) morphSurface(this.armLevels[high], this.armLevels[low], high - this.detail, true);
    this.arms.geometry = this.armGeometry;
  }
  update(...args) {
    super.update(...args);
    if (this.filaments) this.filaments.visible = this.detail > 1;
    this.organs.rotation.y = this.variation.organTurn;
  }
  dispose() {
    // Base owns the original near resources; lower tiers are adapter-owned.
    this.bellGeometry = this.bellLevels[2]; this.armGeometry = this.armLevels[2];
    super.dispose();
    this.bellLevels.slice(0, 2).forEach(g => g.dispose());
    this.armLevels.slice(0, 2).forEach(g => g.dispose());
  }
}
