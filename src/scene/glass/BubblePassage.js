import * as THREE from 'three/webgpu';
import { attribute, dot, normalView, positionView, normalize, max, vec3 } from 'three/tsl';
import { BubblePopulation, PLUME, bubbleShape, ease } from './BubblePopulation.js';
import { LiveOceanLens } from './LiveOceanLens.js';

// Presentation adapter: cheap instanced films + bounded slots in the accepted M3
// compositor. Never writes the camera, animals, current field or journey.
export class BubblePassage {
  constructor(app, field, tissues, { reviewControls = false } = {}) {
    this.app = app; this.field = field; this.tissues = tissues;
    this.population = new BubblePopulation({ narrow: app.camera.aspect < .85 });
    this.lens = new LiveOceanLens(app.renderer, app.camera, { bubbleCount: PLUME.heroes });
    this.lens.scene = app.scene;
    this.geometry = new THREE.SphereGeometry(1, 20, 12);
    this.opacity = new THREE.InstancedBufferAttribute(new Float32Array(PLUME.ambient), 1);
    this.geometry.setAttribute('bubbleOpacity', this.opacity);
    this.glint = new THREE.InstancedBufferAttribute(new Float32Array(PLUME.ambient), 1);
    this.geometry.setAttribute('bubbleGlint', this.glint);
    this.edgeWidth = new THREE.InstancedBufferAttribute(new Float32Array(PLUME.ambient), 1);
    this.geometry.setAttribute('bubbleEdgeWidth', this.edgeWidth);
    const material = this.material = new THREE.MeshBasicNodeMaterial({ transparent: true,
      depthWrite: false, side: THREE.FrontSide, blending: THREE.AdditiveBlending });
    const facing = max(dot(normalView, normalize(positionView.negate())), 0);
    // A sub-pixel small interface needs a broader integrated rim, otherwise
    // only the medium arcs survive rasterisation and the stream looks empty.
    const rim = facing.oneMinus().pow(attribute('bubbleEdgeWidth'));
    const light = normalize(vec3(attribute('bubbleGlint').mul(.7).sub(.7), .85, .35));
    // Only the edge reflects light: no central specular dot or dark alpha fill.
    const crescent = max(dot(normalView, light), 0).pow(5);
    material.colorNode = vec3(.70, .88, .95);
    material.opacityNode = rim.mul(crescent.mul(2.6).add(.10)).mul(attribute('bubbleOpacity'));
    this.mesh = new THREE.InstancedMesh(this.geometry, material, PLUME.ambient);
    this.mesh.frustumCulled = false; this.mesh.visible = false;
    this.mesh.name = 'M3 rising ambient bubble films'; app.scene.add(this.mesh);
    this.matrix = new THREE.Matrix4(); this.inverse = new THREE.Matrix4();
    this.position = new THREE.Vector3(); this.scale = new THREE.Vector3();
    this.rotation = new THREE.Quaternion(); this.euler = new THREE.Euler();
    this.view = new THREE.Vector3(); this.heroOrder = []; this.cpu = []; this.enabled = true; this.refract = true;
    this.place = this.place.bind(this); this.progress = 0;
    this.reviewAge = null;
    this.sources = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
    this.sourceEvent = -1; this.form = {};
    this.metrics = { duration: 0, ambientSeconds: 0, heroSeconds: 0, peakAmbient: 0, peakHeroes: 0 };
    this.onKey = event => { if (event.code === 'KeyB' && !event.ctrlKey && !event.metaKey && !event.target.closest?.('input,textarea,select')) this.reviewAge = 0; };
    this.onWheel = () => { this.reviewAge = null; };
    if (reviewControls) {
      window.addEventListener('keydown', this.onKey);
      window.addEventListener('wheel', this.onWheel, { passive: true });
    }
  }
  place(b, random) {
    const camera = this.app.camera;
    if (this.sourceEvent !== this.population.eventId) {
      // Three fixed world-space seep cores for this traversal. They do not follow
      // the camera. The source stays below frame; widening happens during rise.
      this.sourceEvent = this.population.eventId;
      this.sources.forEach((source, i) => {
        const depth = [4.8, 8.2, 12][i];
        const halfY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * depth;
        source.set([-.50, .05, .50][i] * halfY * camera.aspect, -halfY + .15, -depth).applyMatrix4(camera.matrixWorld);
      });
    }
    if (!b.hero) {
      const source = this.sources[b.stream];
      const packet = Math.floor(this.population.eventAge / 1.3);
      const offshoot = random() < .12 ? .55 : .16;
      b.x = source.x + Math.sin(packet * 1.73 + b.stream * 2) * .18 + (random() - .5) * offshoot;
      b.y = source.y + random() * .4;
      b.z = source.z + Math.cos(packet * 1.21 + b.stream) * .13 + (random() - .5) * offshoot;
      return;
    }
    const depth = b.hero ? 2.9 + random() * 1.8 : 2.3 + random() ** .6 * 11;
    const halfY = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * depth;
    const halfX = halfY * camera.aspect;
    let x = (random() * 2 - 1) * halfX * 1.15;
    let y = -halfY * (.8 + random() * .35);
    if (b.hero) {
      // Birth composition only, never tracks after birth: a screen ray through
      // a visible real subject, raised through its lower silhouette. No collisions.
      let best = null, score = -1;
      for (const t of this.tissues) {
        if (t.presence < .2) continue;
        this.view.copy(t.group.position).project(camera);
        if (Math.abs(this.view.x) > .9 || Math.abs(this.view.y) > .85 || this.view.z > 1) continue;
        const s = t.presence + (t.feature || 0);
        if (s > score) { score = s; best = t; }
      }
      if (best) {
        // Use visible anatomy, not the transformation origin at the oral roots.
        // Two slots favour bell tissue, one the lower membrane/appendages.
        this.view.set(.24, best.species.height * (b.id % 3 === 0 ? .38 : .68), .08);
        best.group.localToWorld(this.view);
        this.view.project(camera);
        x = THREE.MathUtils.clamp(this.view.x, -.65, .65) * halfX + (random() - .5) * .4;
        y = THREE.MathUtils.clamp(this.view.y, -.5, .5) * halfY - .95 - random() * .45;
      }
      // Portrait only limits angular size; main renderer quality is unchanged.
      b.radius = Math.min(b.radius, halfX * .26);
    }
    this.position.set(x, y, -depth).applyMatrix4(camera.matrixWorld);
    b.x = this.position.x; b.y = this.position.y; b.z = this.position.z;
  }
  update(dt, progress) {
    const start = performance.now(); this.progress = progress;
    const camera = this.app.camera;
    // DEV review only: drive native scroll through the existing path, never
    // replace keyframes or write camera/animal transforms. Wheel cancels it.
    if (this.reviewAge !== null && dt > 0) {
      this.reviewAge += Math.min(dt, .05);
      const p = .15 + THREE.MathUtils.clamp((this.reviewAge - 3) / 34, 0, 1) * .47;
      // Repeated CSS-smooth scrolls restart before advancing at 60 Hz. The
      // existing camera rig already supplies the authored smoothing.
      window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * p, behavior: 'instant' });
      if (this.reviewAge > 42) this.reviewAge = null;
    }
    this.population.narrow = camera.aspect < .85;
    this.population.update(dt, progress, this.field, this.place);
    this.mesh.visible = this.enabled && this.population.envelope > .0001;
    this.heroOrder.length = 0;
    let count = 0;
    for (const b of this.population.pool) {
      if (!b.live || b.alpha <= .00001) continue;
      if (b.hero) { this.heroOrder.push(b); continue; }
      this.position.set(b.x, b.y, b.z);
      const form = bubbleShape(b, this.form);
      this.scale.set(b.radius * form.x, b.radius * form.y, b.radius * form.z);
      this.euler.set(form.tilt * .4, 0, form.tilt);
      this.rotation.setFromEuler(this.euler);
      this.matrix.compose(this.position, this.rotation, this.scale);
      this.matrix.elements[4] += form.shear * b.radius;
      this.mesh.setMatrixAt(count, this.matrix);
      this.opacity.setX(count, b.alpha * b.opacity * Math.min(1, 8 / camera.position.distanceTo(this.position)));
      this.glint.setX(count, b.glint);
      this.edgeWidth.setX(count, b.sizeClass === 'small' ? 3.5 : 7);
      count++;
    }
    // r175 InstanceNode sizes its matrix UBO from count at first compilation.
    // Keep capacity fixed, otherwise later births can index beyond that UBO.
    this.drawCount = count;
    if (dt > 0 && this.population.envelope > .01) {
      const m = this.metrics, span = Math.min(dt, .05);
      m.duration += span; m.ambientSeconds += count * span; m.heroSeconds += this.heroOrder.length * span;
      m.peakAmbient = Math.max(m.peakAmbient, count); m.peakHeroes = Math.max(m.peakHeroes, this.heroOrder.length);
    }
    this.matrix.makeTranslation(0, -10000, 0);
    for (let i = count; i < PLUME.ambient; i++) {
      this.mesh.setMatrixAt(i, this.matrix); this.opacity.setX(i, 0);
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.opacity.needsUpdate = true; this.glint.needsUpdate = true;
    this.edgeWidth.needsUpdate = true;
    for (const b of this.heroOrder) b.distance = camera.position.distanceToSquared(this.position.set(b.x, b.y, b.z));
    this.heroOrder.sort((a, b) => b.distance - a.distance);
    this.lens.slots.forEach((slot, i) => {
      const b = this.heroOrder[i]; slot.strength.value = b && this.enabled && this.refract ? b.alpha : 0;
      if (!b) return;
      this.position.set(b.x, b.y, b.z);
      this.view.copy(this.position).applyMatrix4(camera.matrixWorldInverse);
      const fraction = b.radius / Math.max(.01, -this.view.z * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * camera.aspect);
      slot.strength.value *= 1 - ease((fraction - .20) / .10);
      const form = bubbleShape(b, this.form);
      this.scale.set(b.radius * form.x, b.radius * form.y, b.radius * form.z);
      this.euler.set(form.tilt * .4, 0, form.tilt);
      this.rotation.setFromEuler(this.euler);
      this.matrix.compose(this.position, this.rotation, this.scale);
      this.matrix.elements[4] += form.shear * b.radius;
      this.inverse.copy(this.matrix).invert();
      slot.cameraToLens.value.multiplyMatrices(this.inverse, camera.matrixWorld);
      slot.lensToView.value.multiplyMatrices(camera.matrixWorldInverse, this.matrix);
      slot.normalToView.value.getNormalMatrix(slot.lensToView.value);
      slot.eta.value = b.eta;
      slot.edgeScale.value = b.radius * b.radius;
    });
    if (this.cpu.length < 20000) this.cpu.push(performance.now() - start);
  }
  state() {
    return { ...this.population.state(), progress: this.progress, enabled: this.enabled,
      metrics: { ...this.metrics, averageAmbient: this.metrics.ambientSeconds / (this.metrics.duration || 1), averageHeroes: this.metrics.heroSeconds / (this.metrics.duration || 1) },
      drawCount: this.drawCount, lens: this.lens.state(),
      heroesDetail: this.heroOrder.map(b => {
        this.view.set(b.x, b.y, b.z).project(this.app.camera);
        return { x: b.x, y: b.y, z: b.z, radius: b.radius, alpha: b.alpha, age: b.age,
          screen: [(this.view.x + 1) * innerWidth / 2, (1 - this.view.y) * innerHeight / 2] };
      }) };
  }
  dispose() {
    window.removeEventListener('keydown', this.onKey); window.removeEventListener('wheel', this.onWheel);
    this.lens.dispose(); this.app.scene.remove(this.mesh); this.geometry.dispose(); this.material.dispose();
  }
}
