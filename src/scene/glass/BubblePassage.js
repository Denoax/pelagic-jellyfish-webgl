import * as THREE from 'three/webgpu';
import { attribute, dot, normalView, positionView, normalize, max, vec3 } from 'three/tsl';
import { BubblePopulation, PLUME } from './BubblePopulation.js';
import { LiveOceanLens } from './LiveOceanLens.js';

// Presentation adapter: cheap instanced films + three slots in the accepted M3
// compositor. Never writes the camera, animals, current field or journey.
export class BubblePassage {
  constructor(app, field, tissues) {
    this.app = app; this.field = field; this.tissues = tissues;
    this.population = new BubblePopulation({ narrow: app.camera.aspect < .85 });
    this.lens = new LiveOceanLens(app.renderer, app.camera, { bubbleCount: PLUME.heroes });
    this.lens.scene = app.scene;
    this.geometry = new THREE.SphereGeometry(1, 20, 12);
    this.opacity = new THREE.InstancedBufferAttribute(new Float32Array(PLUME.ambient), 1);
    this.geometry.setAttribute('bubbleOpacity', this.opacity);
    const material = this.material = new THREE.MeshBasicNodeMaterial({ transparent: true,
      depthWrite: false, side: THREE.FrontSide });
    const facing = max(dot(normalView, normalize(positionView.negate())), 0);
    const rim = facing.oneMinus().pow(4);
    const glint = max(dot(normalView, normalize(vec3(-.5, .8, .8))), 0).pow(22);
    material.colorNode = vec3(.24, .43, .52).add(vec3(.45, .55, .58).mul(glint));
    material.opacityNode = rim.mul(.34).add(glint.mul(.9)).mul(attribute('bubbleOpacity'));
    this.mesh = new THREE.InstancedMesh(this.geometry, material, PLUME.ambient);
    this.mesh.frustumCulled = false; this.mesh.visible = false;
    this.mesh.name = 'M3 rising ambient bubble films'; app.scene.add(this.mesh);
    this.matrix = new THREE.Matrix4(); this.inverse = new THREE.Matrix4();
    this.position = new THREE.Vector3(); this.scale = new THREE.Vector3();
    this.rotation = new THREE.Quaternion(); this.euler = new THREE.Euler();
    this.view = new THREE.Vector3(); this.heroOrder = []; this.cpu = []; this.enabled = true; this.refract = true;
    this.place = this.place.bind(this); this.progress = 0;
    this.reviewAge = null;
    this.onKey = event => { if (event.code === 'KeyB' && !event.ctrlKey && !event.metaKey && !event.target.closest?.('input,textarea,select')) this.reviewAge = 0; };
    this.onWheel = () => { this.reviewAge = null; };
    window.addEventListener('keydown', this.onKey);
    window.addEventListener('wheel', this.onWheel, { passive: true });
  }
  place(b, random) {
    const camera = this.app.camera;
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
        this.view.copy(best.group.position).project(camera);
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
      const p = .23 + THREE.MathUtils.clamp((this.reviewAge - 3) / 22, 0, 1) * .28;
      window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * p);
      if (this.reviewAge > 30) this.reviewAge = null;
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
      const wobble = Math.sin(b.age * b.frequency + b.phase) * .08;
      this.scale.set(b.radius * (1.08 + wobble), b.radius * (.91 - wobble), b.radius);
      this.euler.set(0, 0, Math.sin(b.phase + b.age) * .1);
      this.rotation.setFromEuler(this.euler);
      this.matrix.compose(this.position, this.rotation, this.scale);
      this.mesh.setMatrixAt(count, this.matrix);
      this.opacity.setX(count, b.alpha * b.opacity * Math.min(1, 8 / camera.position.distanceTo(this.position)));
      count++;
    }
    // r175 InstanceNode sizes its matrix UBO from count at first compilation.
    // Keep capacity fixed, otherwise later births can index beyond that UBO.
    this.drawCount = count;
    this.matrix.makeTranslation(0, -10000, 0);
    for (let i = count; i < PLUME.ambient; i++) {
      this.mesh.setMatrixAt(i, this.matrix); this.opacity.setX(i, 0);
    }
    this.mesh.instanceMatrix.needsUpdate = true; this.opacity.needsUpdate = true;
    for (const b of this.heroOrder) b.distance = camera.position.distanceToSquared(this.position.set(b.x, b.y, b.z));
    this.heroOrder.sort((a, b) => b.distance - a.distance);
    this.lens.slots.forEach((slot, i) => {
      const b = this.heroOrder[i]; slot.strength.value = b && this.enabled && this.refract ? b.alpha : 0;
      if (!b) return;
      this.position.set(b.x, b.y, b.z);
      const wave = Math.sin(b.age * b.frequency + b.phase) * .075;
      this.scale.set(b.radius * (1.1 + wave), b.radius * (.91 - wave), b.radius * .83);
      this.euler.set(Math.sin(b.age + b.phase) * .08, 0, Math.sin(b.phase + b.age * .8) * .12);
      this.rotation.setFromEuler(this.euler);
      this.matrix.compose(this.position, this.rotation, this.scale);
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
