import * as THREE from "three/webgpu";
import { createSoftParticles } from "./SoftParticles.js";
import { Sanctuary } from "./sanctuary/Sanctuary.js";
import { sampleSwimCycle } from "./jellyMotion.js";

const SWIM_AXIS = new THREE.Vector3(0, 1, 0);
const TWO_PI = Math.PI * 2;

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(min, max, value) {
  const t = clamp01((value - min) / Math.max(0.0001, max - min));
  return t * t * (3 - 2 * t);
}

function seeded(index, salt = 0) {
  const value = Math.sin(index * 91.73 + salt * 37.11) * 43758.5453;
  return value - Math.floor(value);
}

function createSoftParticleTexture(size = 48) {
  const data = new Uint8Array(size * size * 4);
  const center = (size - 1) * 0.5;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const distance = Math.hypot(x - center, y - center) / center;
      const core = clamp01(1 - distance);
      const alpha = Math.pow(core, 1.7);
      const index = (y * size + x) * 4;
      data[index] = 255;
      data[index + 1] = Math.round(126 + core * 88);
      data[index + 2] = Math.round(54 + core * 82);
      data[index + 3] = Math.round(alpha * 255);
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  return texture;
}

class DistantJellyField {
  constructor(scene, count) {
    this.count = count;
    this.group = new THREE.Group();
    this.group.name = "distant-jelly-field";
    scene.add(this.group);

    // The far school is instanced, so substantially smoother shared geometry
    // costs very little compared with running another set of soft-body animals.
    const bellGeometry = new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const bellMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x123c54,
      emissiveIntensity: 0.72,
      roughness: 0.34,
      metalness: 0,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      vertexColors: true,
    });
    this.bells = new THREE.InstancedMesh(bellGeometry, bellMaterial, count);
    this.bells.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.bells.frustumCulled = false;
    this.bells.renderOrder = 5;
    this.group.add(this.bells);

    const innerBellMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.1,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
    this.innerBells = new THREE.InstancedMesh(bellGeometry, innerBellMaterial, count);
    this.innerBells.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.innerBells.frustumCulled = false;
    this.innerBells.renderOrder = 4;
    this.group.add(this.innerBells);

    const rimGeometry = new THREE.TorusGeometry(1, 0.028, 8, 64);
    rimGeometry.rotateX(Math.PI * 0.5);
    const rimMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
    this.rims = new THREE.InstancedMesh(rimGeometry, rimMaterial, count);
    this.rims.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.rims.frustumCulled = false;
    this.rims.renderOrder = 6;
    this.group.add(this.rims);

    this.tentacleCount = 8;
    this.pointsPerTentacle = 20;
    const vertexCount = count * this.tentacleCount * (this.pointsPerTentacle - 1) * 2;
    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 3);
    this.tentacleGeometry = new THREE.BufferGeometry();
    this.tentacleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.tentacleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.tentacleGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    const tentacleMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.tentacles = new THREE.LineSegments(this.tentacleGeometry, tentacleMaterial);
    this.tentacles.frustumCulled = false;
    this.tentacles.renderOrder = 4;
    this.group.add(this.tentacles);

    this.palette = [
      new THREE.Color(0x63d9ef),
      new THREE.Color(0x8e79df),
      new THREE.Color(0x6bb7cc),
      new THREE.Color(0x7ae8d2),
    ];
    this.dummy = new THREE.Object3D();
    this.innerDummy = new THREE.Object3D();
    this.rimDummy = new THREE.Object3D();
    this.position = new THREE.Vector3();
    this.color = new THREE.Color();
    this.innerColor = new THREE.Color();
    this.innerTarget = new THREE.Color(0xd8f7ff);
    this.orientation = new THREE.Quaternion();
    this.rollQuaternion = new THREE.Quaternion();
    this.wobbleQuaternion = new THREE.Quaternion();
    this.wobbleEuler = new THREE.Euler();
    this.travelTangent = new THREE.Vector3();
    this.localPoint = new THREE.Vector3();
    this.rootPoint = new THREE.Vector3();
    this.targetPoint = new THREE.Vector3();
    const simulatedTentaclePoints = count * this.tentacleCount * this.pointsPerTentacle;
    this.tentacleCurrent = new Float32Array(simulatedTentaclePoints * 3);
    this.tentacleInitialized = new Uint8Array(count);
    this.previousCenters = new Float32Array(count * 3);
    this.previousRoutes = new Float32Array(count).fill(-1);
    this.routes = Array.from({ length: count }, (_, index) => {
      const heading = seeded(index, 41) * TWO_PI;
      const depthSlope = (seeded(index, 43) - 0.5) * 0.42;
      const direction = new THREE.Vector3(
        Math.cos(heading),
        Math.sin(heading),
        depthSlope,
      ).normalize();
      const side = new THREE.Vector3(-direction.y, direction.x, 0).normalize();
      return {
        direction,
        side,
        span: 27 + seeded(index, 45) * 8,
        offset: (seeded(index, 47) - 0.5) * 11,
        depth: -5.1 - Math.floor(index / 4) * 1.15 - seeded(index, 11) * 4.4,
        curve: 0.75 + seeded(index, 35) * 1.45,
        depthCurve: 0.65 + seeded(index, 39) * 1.25,
        phase: seeded(index, 37) * TWO_PI,
        roll: (seeded(index, 49) - 0.5) * Math.PI,
      };
    });
    this.routeProgress = Float32Array.from(
      { length: count },
      (_, index) => seeded(index, 3),
    );
    this.routeVelocity = Float32Array.from(
      { length: count },
      (_, index) => 0.012 + seeded(index, 29) * 0.008,
    );
    this.kinematics = Array.from({ length: count }, () => ({}));
    this.motionState = Array.from({ length: count }, () => ({
      route: 0,
      speed: 0,
      pulse: 0,
      x: 0,
      y: 0,
      z: 0,
      dx: 0,
      dy: 1,
      dz: 0,
    }));
    this.lastElapsed = null;
  }

  update(elapsed, progress, focus, reducedMotion) {
    const positions = this.tentacleGeometry.attributes.position.array;
    const colors = this.tentacleGeometry.attributes.color.array;
    const motion = reducedMotion ? 0.2 : 1;
    const delta = this.lastElapsed === null
      ? 1 / 60
      : Math.min(0.08, Math.max(0, elapsed - this.lastElapsed));
    this.lastElapsed = elapsed;
    let cursor = 0;

    for (let index = 0; index < this.count; index += 1) {
      const cluster = index % 4;
      const swim = sampleSwimCycle(
        elapsed * (0.17 + seeded(index, 19) * 0.045) + seeded(index, 31),
        this.kinematics[index],
      );
      const targetVelocity = 0.01 + swim.speedSignal * (0.115 + seeded(index, 33) * 0.025);
      const velocityDamping = 1 - Math.exp(-delta * (swim.primaryThrust > 0.05 ? 10 : 2.1));
      this.routeVelocity[index] += (targetVelocity - this.routeVelocity[index]) * velocityDamping;
      this.routeProgress[index] = (
        this.routeProgress[index] + this.routeVelocity[index] * delta * motion
      ) % 1;

      const route = (
        this.routeProgress[index] + progress * (0.16 + cluster * 0.012)
      ) % 1;
      const arc = route * TWO_PI;
      const routeDefinition = this.routes[index];
      const visibility = smoothstep(0.015, 0.12, route)
        * (1 - smoothstep(0.88, 0.985, route));
      const routeWave = Math.sin(arc + routeDefinition.phase) * routeDefinition.curve;
      const depthWave = Math.cos(arc * 1.3 + routeDefinition.phase) * routeDefinition.depthCurve;
      this.position.copy(focus)
        .addScaledVector(routeDefinition.direction, (route - 0.5) * routeDefinition.span)
        .addScaledVector(routeDefinition.side, routeDefinition.offset + routeWave);
      this.position.z += routeDefinition.depth + depthWave;

      this.travelTangent.copy(routeDefinition.direction).multiplyScalar(routeDefinition.span)
        .addScaledVector(
          routeDefinition.side,
          Math.cos(arc + routeDefinition.phase) * TWO_PI * routeDefinition.curve,
        );
      this.travelTangent.z += -Math.sin(arc * 1.3 + routeDefinition.phase)
        * TWO_PI * 1.3 * routeDefinition.depthCurve;
      this.travelTangent.normalize();

      const baseScale = 0.15 + seeded(index, 17) * 0.26;
      const pulse = swim.bell;
      this.orientation.setFromUnitVectors(SWIM_AXIS, this.travelTangent);
      this.rollQuaternion.setFromAxisAngle(
        SWIM_AXIS,
        routeDefinition.roll + Math.sin(elapsed * 0.16 + index) * 0.16 * motion,
      );
      this.wobbleEuler.set(
        Math.sin(elapsed * 0.19 + index * 0.8) * 0.055 * motion,
        0,
        Math.cos(elapsed * 0.17 + index * 1.1) * 0.045 * motion,
      );
      this.wobbleQuaternion.setFromEuler(this.wobbleEuler);
      this.orientation.multiply(this.rollQuaternion).multiply(this.wobbleQuaternion);

      this.dummy.position.copy(this.position);
      this.dummy.quaternion.copy(this.orientation);
      this.dummy.scale.set(
        baseScale * (1 - pulse * 0.13),
        baseScale * (0.56 + pulse * 0.12),
        baseScale * (1 - pulse * 0.13),
      );
      this.dummy.updateMatrix();
      this.bells.setMatrixAt(index, this.dummy.matrix);
      this.color.copy(this.palette[index % this.palette.length]).multiplyScalar(0.22 + visibility * 0.78);
      this.bells.setColorAt(index, this.color);

      const state = this.motionState[index];
      state.route = route;
      state.speed = this.routeVelocity[index];
      state.pulse = pulse;
      state.x = this.position.x;
      state.y = this.position.y;
      state.z = this.position.z;
      state.dx = this.travelTangent.x;
      state.dy = this.travelTangent.y;
      state.dz = this.travelTangent.z;

      this.innerDummy.position.copy(this.position);
      this.innerDummy.quaternion.copy(this.orientation);
      this.innerDummy.scale.set(
        baseScale * 0.84 * (1 - pulse * 0.1),
        baseScale * (0.47 + pulse * 0.1),
        baseScale * 0.84 * (1 - pulse * 0.1),
      );
      this.innerDummy.updateMatrix();
      this.innerBells.setMatrixAt(index, this.innerDummy.matrix);
      this.innerColor.copy(this.color).lerp(this.innerTarget, 0.36);
      this.innerBells.setColorAt(index, this.innerColor);

      this.rimDummy.position.copy(this.position);
      this.rimDummy.quaternion.copy(this.orientation);
      this.rimDummy.scale.setScalar(baseScale * (1 - pulse * 0.13));
      this.rimDummy.updateMatrix();
      this.rims.setMatrixAt(index, this.rimDummy.matrix);
      this.rims.setColorAt(index, this.color);

      const bellRadius = baseScale * 0.72;
      const tentacleLength = baseScale * (2.35 + seeded(index, 23) * 2.5);
      const centerOffset = index * 3;
      const centerDx = this.position.x - this.previousCenters[centerOffset];
      const centerDy = this.position.y - this.previousCenters[centerOffset + 1];
      const centerDz = this.position.z - this.previousCenters[centerOffset + 2];
      const routeWrapped = this.previousRoutes[index] >= 0
        && route < this.previousRoutes[index] - 0.5;
      const resetTentacles = this.tentacleInitialized[index] === 0
        || routeWrapped
        || centerDx * centerDx + centerDy * centerDy + centerDz * centerDz > 9;
      const segmentLength = tentacleLength / (this.pointsPerTentacle - 1);

      for (let tentacle = 0; tentacle < this.tentacleCount; tentacle += 1) {
        const angle = (tentacle / this.tentacleCount) * TWO_PI + index * 0.37;
        const angleCos = Math.cos(angle);
        const angleSin = Math.sin(angle);
        const rootRadius = bellRadius * (1 - pulse * 0.13);
        this.rootPoint.set(
          angleCos * rootRadius,
          -baseScale * 0.015,
          angleSin * rootRadius,
        ).applyQuaternion(this.orientation).add(this.position);
        const firstPoint = (
          index * this.tentacleCount * this.pointsPerTentacle
          + tentacle * this.pointsPerTentacle
        );

        if (resetTentacles) {
          for (let point = 0; point < this.pointsPerTentacle; point += 1) {
            const t = point / (this.pointsPerTentacle - 1);
            const radial = rootRadius * (1 - t * 0.3);
            const initialSway = Math.sin(index * 1.7 + tentacle * 2.3 + t * 4.2)
              * t * t * tentacleLength * 0.075;
            this.localPoint.set(
              angleCos * radial - angleSin * initialSway,
              -t * tentacleLength,
              angleSin * radial + angleCos * initialSway,
            ).applyQuaternion(this.orientation).add(this.position);
            const pointOffset = (firstPoint + point) * 3;
            this.tentacleCurrent[pointOffset] = this.localPoint.x;
            this.tentacleCurrent[pointOffset + 1] = this.localPoint.y;
            this.tentacleCurrent[pointOffset + 2] = this.localPoint.z;
          }
        } else {
          for (let point = 1; point < this.pointsPerTentacle; point += 1) {
            const t = point / (this.pointsPerTentacle - 1);
            const pointOffset = (firstPoint + point) * 3;
            const currentX = this.tentacleCurrent[pointOffset];
            const currentY = this.tentacleCurrent[pointOffset + 1];
            const currentZ = this.tentacleCurrent[pointOffset + 2];
            const radial = rootRadius * (1 - t * 0.3);
            const waveEnvelope = t * t * (3 - 2 * t);
            const wavePhase = elapsed * (0.62 + seeded(tentacle, index + 53) * 0.14)
              + index * 0.83 + tentacle * 0.28 - t * 3.4;
            const restWave = (
              Math.sin(wavePhase) + Math.sin(wavePhase * 0.53 + index) * 0.15
            ) * waveEnvelope * tentacleLength * 0.24 * motion;
            const restCurl = Math.sin(wavePhase * 0.71 + tentacle * 0.91)
              * waveEnvelope * tentacleLength * 0.08 * motion;
            const pulseTrail = swim.primaryThrust * t * t * baseScale * 0.22;
            this.targetPoint.set(
              angleCos * (radial + restCurl) - angleSin * restWave,
              -t * tentacleLength - pulseTrail,
              angleSin * (radial + restCurl) + angleCos * restWave,
            ).applyQuaternion(this.orientation).add(this.position);
            const followRate = 6.5 - t * 3.8;
            const followBlend = 1 - Math.exp(-delta * followRate);
            this.tentacleCurrent[pointOffset] = currentX
              + (this.targetPoint.x - currentX) * followBlend;
            this.tentacleCurrent[pointOffset + 1] = currentY
              + (this.targetPoint.y - currentY) * followBlend;
            this.tentacleCurrent[pointOffset + 2] = currentZ
              + (this.targetPoint.z - currentZ) * followBlend;
          }

          const rootOffset = firstPoint * 3;
          this.tentacleCurrent[rootOffset] = this.rootPoint.x;
          this.tentacleCurrent[rootOffset + 1] = this.rootPoint.y;
          this.tentacleCurrent[rootOffset + 2] = this.rootPoint.z;

          for (let point = 1; point < this.pointsPerTentacle; point += 1) {
            const parentOffset = (firstPoint + point - 1) * 3;
            const pointOffset = (firstPoint + point) * 3;
            const dx = this.tentacleCurrent[pointOffset]
              - this.tentacleCurrent[parentOffset];
            const dy = this.tentacleCurrent[pointOffset + 1]
              - this.tentacleCurrent[parentOffset + 1];
            const dz = this.tentacleCurrent[pointOffset + 2]
              - this.tentacleCurrent[parentOffset + 2];
            const distance = Math.max(0.00001, Math.hypot(dx, dy, dz));
            const correction = ((distance - segmentLength) / distance) * 0.16;
            this.tentacleCurrent[pointOffset] -= dx * correction;
            this.tentacleCurrent[pointOffset + 1] -= dy * correction;
            this.tentacleCurrent[pointOffset + 2] -= dz * correction;
          }
        }

        for (let segment = 0; segment < this.pointsPerTentacle - 1; segment += 1) {
          for (let endpoint = 0; endpoint < 2; endpoint += 1) {
            const point = segment + endpoint;
            const pointOffset = (firstPoint + point) * 3;
            const t = point / (this.pointsPerTentacle - 1);
            const tipFade = 1 - t * 0.58;
            positions[cursor] = this.tentacleCurrent[pointOffset];
            colors[cursor++] = this.color.r * tipFade;
            positions[cursor] = this.tentacleCurrent[pointOffset + 1];
            colors[cursor++] = this.color.g * tipFade;
            positions[cursor] = this.tentacleCurrent[pointOffset + 2];
            colors[cursor++] = this.color.b * tipFade;
          }
        }
      }
      this.tentacleInitialized[index] = 1;
      this.previousCenters[centerOffset] = this.position.x;
      this.previousCenters[centerOffset + 1] = this.position.y;
      this.previousCenters[centerOffset + 2] = this.position.z;
      this.previousRoutes[index] = route;
    }
    this.bells.instanceMatrix.needsUpdate = true;
    if (this.bells.instanceColor) this.bells.instanceColor.needsUpdate = true;
    this.innerBells.instanceMatrix.needsUpdate = true;
    if (this.innerBells.instanceColor) this.innerBells.instanceColor.needsUpdate = true;
    this.rims.instanceMatrix.needsUpdate = true;
    if (this.rims.instanceColor) this.rims.instanceColor.needsUpdate = true;
    this.tentacleGeometry.attributes.position.needsUpdate = true;
    this.tentacleGeometry.attributes.color.needsUpdate = true;
  }

  getState() {
    return this.motionState.map((state, index) => ({
      id: index,
      route: Number(state.route.toFixed(3)),
      speed: Number(state.speed.toFixed(4)),
      pulse: Number(state.pulse.toFixed(3)),
      position: [
        Number(state.x.toFixed(2)),
        Number(state.y.toFixed(2)),
        Number(state.z.toFixed(2)),
      ],
      direction: [
        Number(state.dx.toFixed(3)),
        Number(state.dy.toFixed(3)),
        Number(state.dz.toFixed(3)),
      ],
    }));
  }

  dispose() {
    this.bells.geometry.dispose();
    this.bells.material.dispose();
    this.innerBells.material.dispose();
    this.rims.geometry.dispose();
    this.rims.material.dispose();
    this.tentacleGeometry.dispose();
    this.tentacles.material.dispose();
    this.group.removeFromParent();
  }
}

function createParticleLayer(count, spread, color, size, opacity, seedSalt) {
  const positions = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    positions[index * 3] = (seeded(index, seedSalt) - 0.5) * spread.x;
    positions[index * 3 + 1] = (seeded(index, seedSalt + 1) - 0.5) * spread.y;
    positions[index * 3 + 2] = (seeded(index, seedSalt + 2) - 0.5) * spread.z;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = createSoftParticles(geometry, {
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  points.frustumCulled = false;
  return points;
}

function createCurrentVeil() {
  const streamCount = 7;
  const pointsPerStream = 52;
  const positions = new Float32Array(streamCount * pointsPerStream * 3);
  let cursor = 0;
  for (let stream = 0; stream < streamCount; stream += 1) {
    const phase = seeded(stream, 81) * Math.PI * 2;
    for (let point = 0; point < pointsPerStream; point += 1) {
      const t = point / (pointsPerStream - 1);
      positions[cursor++] = -13 + t * 26 + Math.sin(t * Math.PI * 2 + phase) * 1.2;
      positions[cursor++] = (seeded(stream, 83) - 0.5) * 8 + Math.sin(t * Math.PI * 3 + phase) * 0.42;
      positions[cursor++] = -6 - stream * 1.35 + Math.cos(t * Math.PI * 2 + phase) * 0.9;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const veil = createSoftParticles(geometry, {
    color: 0x4cb9e9,
    size: 0.026,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  veil.frustumCulled = false;
  return veil;
}

export class PelagicEnvironment {
  constructor(scene, { mobile = false, reducedMotion = false } = {}) {
    this.scene = scene;
    this.mobile = mobile;
    this.reducedMotion = reducedMotion;
    this.group = new THREE.Group();
    this.group.name = "pelagic-depth-layers";
    this.frame = 0;
    scene.add(this.group);

    this.layers = [
      createParticleLayer(mobile ? 110 : 180, new THREE.Vector3(23, 13, 22), 0xa8ebff, 0.034, 0.2, 31),
      createParticleLayer(mobile ? 170 : 300, new THREE.Vector3(33, 18, 34), 0x4faed4, 0.022, 0.14, 41),
      createParticleLayer(mobile ? 220 : 460, new THREE.Vector3(48, 25, 52), 0x526fb7, 0.015, 0.11, 51),
    ];
    this.layers.forEach((layer, index) => {
      layer.renderOrder = 2 + index;
      this.group.add(layer);
    });

    this.currentVeil = createCurrentVeil();
    this.group.add(this.currentVeil);
    this.distantJellies = new DistantJellyField(scene, mobile ? 7 : reducedMotion ? 8 : 14);

    this.sanctuary = new Sanctuary(scene, { mobile, reducedMotion });
    this.deepGroup = this.sanctuary.group;
  }

  async loadDeepAssets() { /* Procedural resources already allocated before prewarm. */ }
  getDeepState() { return this.sanctuary.state(); }

  update(elapsed, progress, current, focus, interactionMode = false, prewarm = false) {
    this.frame += 1;
    const backgroundStride = interactionMode ? 3 : 2;
    const motion = this.reducedMotion ? 0.12 : 1;
    this.layers.forEach((layer, index) => {
      const parallax = 0.22 + index * 0.17;
      layer.position.set(
        focus.x * parallax + Math.sin(elapsed * (0.018 + index * 0.006)) * 0.5 * motion,
        focus.y * parallax + Math.cos(elapsed * (0.014 + index * 0.005)) * 0.35 * motion,
        focus.z * parallax,
      );
      layer.rotation.y = elapsed * (0.0018 + index * 0.0009) * motion;
    });
    this.currentVeil.position.copy(focus).multiplyScalar(0.72);
    this.currentVeil.position.x += current.x * 0.5;
    this.currentVeil.rotation.z = Math.sin(elapsed * 0.025) * 0.025 * motion;
    this.currentVeil.material.opacity = 0.07 + smoothstep(0.18, 0.72, progress) * 0.11;

    if (this.frame % backgroundStride === 0) {
      this.distantJellies.update(elapsed, progress, focus, this.reducedMotion);
    }
    this.sanctuary.update(elapsed, progress);
  }

  dispose() {
    this.layers.forEach((layer) => {
      layer.geometry.dispose();
      layer.material.dispose();
    });
    this.currentVeil.geometry.dispose();
    this.currentVeil.material.dispose();
    this.sanctuary.dispose();
    this.distantJellies.dispose();
    this.group.removeFromParent();
    this.deepGroup.removeFromParent();
  }
}
