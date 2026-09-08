import * as THREE from 'three/webgpu';
import { PopulationAnimal } from './PopulationAnimal.js';
import { projectedDiameter, TIERS } from './Importance.js';

// Rendering adapter for both existing route owners. Neither camera nor route
// definitions are replaced. The old instanced school remains the pose source.
export class PopulationDetail {
  constructor(app, environment, tissues, options) {
    this.app = app; this.field = environment.distantJellies; this.tissues = tissues;
    this.chamber = Boolean(options.chamber);
    this.mainCount = tissues.length; this.matrix = new THREE.Matrix4();
    this.frustum = new THREE.Frustum(); this.bounds = new THREE.Sphere();
    this.view = new THREE.Vector3(); this.projected = new THREE.Vector3();
    this.scale = new THREE.Vector3(); this.cpu = []; this.counts = [];
    this.savedVisible = this.field.group.visible;
    for (let i = 0; i < this.field.count; i++) {
      const medusa = { transformationObject: new THREE.Object3D() };
      const t = new PopulationAnimal(medusa, this.mainCount + i, options);
      t.setPresence(0, 0); app.scene.add(t.group); tissues.push(t);
    }
    // Fixed resource budgets, assigned by importance instead of original ID.
    this.halos = []; this.lights = [];
    this.capacity = options.mobile ? 3 : 4;
    for (const t of tissues) {
      if (this.halos.length < this.capacity) this.halos.push({ mesh: t.halo, drift: t.haloDrift, owner: null });
      else { t.haloGeometry.dispose(); t.haloMaterial.dispose(); }
      t.halo = null; t.haloDrift = null; t.haloGeometry = null; t.haloMaterial = null;
      t.group.remove(t.tissueLight);
      if (this.lights.length < this.capacity) {
        const light = t.tissueLight.clone(); app.scene.add(light); this.lights.push(light);
      }
    }
    if (options.reviewControls) window.__POPULATION__ = {
      state: () => this.state(), cost: () => this.cpu.slice(), resetCost: () => { this.cpu.length = 0; },
    };
  }
  beforeTissue(dt) {
    const start = performance.now(), camera = this.app.camera;
    camera.updateMatrixWorld();
    this.frustum.setFromProjectionMatrix(this.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    this.field.group.visible = false;
    for (let i = 0; i < this.field.count; i++) {
      const t = this.tissues[this.mainCount + i], k = this.field.kinematics[i];
      t.medusa.swimKinematics = Number.isFinite(k.bell) ? k : undefined;
      this.field.bells.getMatrixAt(i, this.matrix);
      this.matrix.decompose(t.medusa.transformationObject.position, t.medusa.transformationObject.quaternion, this.scale);
      const base = this.scale.x / Math.max(.5, 1 - (k.bell || 0) * .13);
      t.medusa.transformationObject.scale.setScalar(base / 1.34);
      const route = this.field.motionState[i].route;
      const smooth = (a, b, x) => { x = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return x * x * (3 - 2 * x); };
      t.setPresence(this.chamber ? 0 : smooth(.015, .12, route) * (1 - smooth(.88, .985, route)), 0);
    }
    for (const t of this.tissues) {
      const body = t.medusa.transformationObject;
      this.view.copy(body.position).applyMatrix4(camera.matrixWorldInverse);
      this.projected.copy(body.position).project(camera);
      const radius = t.species.radius * Math.max(body.scale.x, body.scale.y, body.scale.z);
      // Conservative appendage bounds retain detail when the bell is clipped
      // but its long membranes still occupy the frame. Not a new camera shot.
      this.bounds.center.set(0, -1.4 * body.scale.y, 0).applyQuaternion(body.quaternion).add(body.position);
      this.bounds.radius = 4.8 * Math.max(body.scale.x, body.scale.y, body.scale.z);
      const visible = this.frustum.intersectsSphere(this.bounds);
      const px = projectedDiameter(radius, visible ? Math.max(radius * .25, -this.view.z) : -this.view.z,
        innerHeight, camera.fov, camera.zoom);
      t.inspectImportance(px, visible, dt);
    }
    const ranked = this.tissues.filter(t => t.onScreen && t.presence > .15 && t.pixels > 80)
      .sort((a, b) => b.pixels - a.pixels).slice(0, this.capacity);
    this.tissues.forEach(t => { t.halo = null; t.haloDrift = null; t.haloMaterial = null; t.haloGeometry = null; });
    const available = ranked.filter(t => !this.halos.some(s => s.owner === t));
    this.halos.forEach(slot => {
      const t = ranked.includes(slot.owner) ? slot.owner : available.shift(); slot.owner = t || null;
      if (t) { t.halo = slot.mesh; t.haloDrift = slot.drift; t.haloMaterial = slot.mesh.material; t.haloGeometry = slot.mesh.geometry; }
      // Unassigned world-space flecks still age and expire; no stale halo.
      else slot.drift.update(dt, this.time || 0, this.matrix.identity(), false, this.zero ||= new THREE.Vector2());
    });
    this.ranked = ranked;
    this.started = start;
  }
  afterTissue(elapsed) {
    this.time = elapsed;
    this.lights.forEach((light, i) => {
      const t = this.ranked?.[i];
      if (!t) { light.intensity = 0; return; }
      light.position.copy(t.tissueLight.position).applyMatrix4(t.group.matrixWorld);
      light.intensity = t.tissueLight.intensity;
      light.distance = t.tissueLight.distance;
    });
    if (this.cpu.length < 20000) this.cpu.push(performance.now() - this.started);
  }
  setCurrentField(field) {
    this.halos.forEach(s => s.drift.setCurrentField(field));
    this.currentField = field; this.originalWake = field.wake;
    // A sub-pixel/offscreen propulsion disturbance should not spend the shared
    // field's bounded wake capacity. Direct activation/echoes remain untouched.
    field.wake = (...args) => {
      const t = this.tissues[args[4]];
      if (t && (!t.onScreen || t.pixels < 80)) return false;
      return this.originalWake.apply(field, args);
    };
  }
  state() {
    const counts = { near: 0, medium: 0, far: 0, hidden: 0, transitioning: 0 };
    const animals = this.tissues.map(t => {
      if (t.onScreen && t.presence > .008) counts[TIERS[Math.round(t.detail)]]++; else counts.hidden++;
      if (t.detail !== t.detailState.tier) counts.transitioning++;
      return { id: t.index, tier: TIERS[t.detailState.tier], detail: t.detail, pixels: t.pixels,
        visible: t.onScreen, presence: t.presence, clickable: t.getInteractionMeshes().length > 0,
        variation: t.variation, triangles: (t.bell.geometry.index.count + t.arms.geometry.index.count
          + t.tentacleGeometry.index.count) / 3 };
    });
    return { basis: 'CSS bell diameter; DPR independent', counts, animals,
      renderer: { renderCallsTotal: this.app.renderer.info.render.calls,
        drawCalls: this.app.renderer.info.render.drawCalls, triangles: this.app.renderer.info.render.triangles },
      memory: this.app.renderer.info.memory };
  }
  dispose() {
    if (this.currentField) this.currentField.wake = this.originalWake;
    this.field.group.visible = this.savedVisible;
    this.tissues.forEach(t => { t.halo = null; t.haloDrift = null; t.haloMaterial = null; t.haloGeometry = null; });
    this.halos.forEach(s => { s.drift.setCurrentField(null); s.mesh.removeFromParent(); s.mesh.geometry.dispose(); s.mesh.material.dispose(); });
    this.lights.forEach(l => { l.removeFromParent(); l.dispose(); });
    delete window.__POPULATION__;
  }
}
