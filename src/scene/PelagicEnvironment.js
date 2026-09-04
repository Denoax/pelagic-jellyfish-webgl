import * as THREE from "three/webgpu";
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
    this.flowVector = new THREE.Vector3();
    const simulatedTentaclePoints = count * this.tentacleCount * this.pointsPerTentacle;
    this.tentacleCurrent = new Float32Array(simulatedTentaclePoints * 3);
    this.tentaclePrevious = new Float32Array(simulatedTentaclePoints * 3);
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
      const tentacleDamping = Math.pow(reducedMotion ? 0.8 : 0.935, delta * 60);
      const deltaSquared = delta * delta;

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
            this.tentaclePrevious[pointOffset] = this.localPoint.x;
            this.tentaclePrevious[pointOffset + 1] = this.localPoint.y;
            this.tentaclePrevious[pointOffset + 2] = this.localPoint.z;
          }
        } else {
          for (let point = 1; point < this.pointsPerTentacle; point += 1) {
            const t = point / (this.pointsPerTentacle - 1);
            const pointOffset = (firstPoint + point) * 3;
            const currentX = this.tentacleCurrent[pointOffset];
            const currentY = this.tentacleCurrent[pointOffset + 1];
            const currentZ = this.tentacleCurrent[pointOffset + 2];
            const velocityX = (currentX - this.tentaclePrevious[pointOffset]) * tentacleDamping;
            const velocityY = (currentY - this.tentaclePrevious[pointOffset + 1]) * tentacleDamping;
            const velocityZ = (currentZ - this.tentaclePrevious[pointOffset + 2]) * tentacleDamping;
            this.tentaclePrevious[pointOffset] = currentX;
            this.tentaclePrevious[pointOffset + 1] = currentY;
            this.tentaclePrevious[pointOffset + 2] = currentZ;

            const radial = rootRadius * (1 - t * 0.3);
            this.targetPoint.set(
              angleCos * radial,
              -t * tentacleLength,
              angleSin * radial,
            ).applyQuaternion(this.orientation).add(this.position);
            const flowPhase = elapsed * (0.36 + seeded(tentacle, index + 53) * 0.18)
              + index * 1.31 + tentacle * 1.87 + t * 4.6;
            this.flowVector.set(
              Math.sin(flowPhase),
              Math.sin(flowPhase * 0.63 + 1.8) * 0.22,
              Math.cos(flowPhase * 0.81),
            ).applyQuaternion(this.orientation);
            const spring = (0.68 + swim.primaryThrust * 1.35) * (1 - t * 0.52);
            const flow = tentacleLength * (0.5 + t * 1.25) * motion;
            const thrustDrag = swim.primaryThrust * t * t * baseScale * 3.8;

            this.tentacleCurrent[pointOffset] = currentX + velocityX
              + (this.targetPoint.x - currentX) * spring * deltaSquared
              + this.flowVector.x * flow * deltaSquared
              - this.travelTangent.x * thrustDrag * deltaSquared;
            this.tentacleCurrent[pointOffset + 1] = currentY + velocityY
              + (this.targetPoint.y - currentY) * spring * deltaSquared
              + this.flowVector.y * flow * deltaSquared
              - this.travelTangent.y * thrustDrag * deltaSquared;
            this.tentacleCurrent[pointOffset + 2] = currentZ + velocityZ
              + (this.targetPoint.z - currentZ) * spring * deltaSquared
              + this.flowVector.z * flow * deltaSquared
              - this.travelTangent.z * thrustDrag * deltaSquared;
          }

          const rootOffset = firstPoint * 3;
          this.tentacleCurrent[rootOffset] = this.rootPoint.x;
          this.tentacleCurrent[rootOffset + 1] = this.rootPoint.y;
          this.tentacleCurrent[rootOffset + 2] = this.rootPoint.z;
          this.tentaclePrevious[rootOffset] = this.rootPoint.x - centerDx;
          this.tentaclePrevious[rootOffset + 1] = this.rootPoint.y - centerDy;
          this.tentaclePrevious[rootOffset + 2] = this.rootPoint.z - centerDz;

          for (let pass = 0; pass < 3; pass += 1) {
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
              const correction = ((distance - segmentLength) / distance) * 0.78;
              this.tentacleCurrent[pointOffset] -= dx * correction;
              this.tentacleCurrent[pointOffset + 1] -= dy * correction;
              this.tentacleCurrent[pointOffset + 2] -= dz * correction;
            }
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
  const material = new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const points = new THREE.Points(geometry, material);
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
  const material = new THREE.PointsMaterial({
    color: 0x4cb9e9,
    size: 0.026,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const veil = new THREE.Points(geometry, material);
  veil.frustumCulled = false;
  return veil;
}

function createKelpGeometry(bladeCount, segments) {
  const positions = new Float32Array(bladeCount * (segments + 1) * 2 * 3);
  const indices = [];
  for (let blade = 0; blade < bladeCount; blade += 1) {
    const offset = blade * (segments + 1) * 2;
    for (let segment = 0; segment < segments; segment += 1) {
      const row = offset + segment * 2;
      const next = row + 2;
      indices.push(row, next, row + 1, next, next + 1, row + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  return geometry;
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

    this.deepGroup = new THREE.Group();
    this.deepGroup.name = "abyssal-shelf-silhouette";
    scene.add(this.deepGroup);
    this.createShelf();
    this.createKelp();
  }

  createShelf() {
    const geometry = new THREE.DodecahedronGeometry(1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x061b26,
      emissive: 0x020c16,
      emissiveIntensity: 0.4,
      roughness: 0.98,
      metalness: 0,
      transparent: true,
      opacity: 0,
      depthWrite: true,
    });
    this.shelfMaterial = material;
    this.shelf = new THREE.InstancedMesh(geometry, material, 15);
    const dummy = new THREE.Object3D();
    for (let index = 0; index < 15; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (5.6 + seeded(index, 91) * 8.5);
      const y = -6.2 - seeded(index, 93) * 2.5;
      const z = -8 - seeded(index, 95) * 17;
      const scale = 0.8 + seeded(index, 97) * 2.4;
      dummy.position.set(x, y, z);
      dummy.rotation.set(seeded(index, 99) * 1.2, seeded(index, 101) * Math.PI, seeded(index, 103));
      dummy.scale.set(scale * 1.8, scale * 0.7, scale * 1.25);
      dummy.updateMatrix();
      this.shelf.setMatrixAt(index, dummy.matrix);
    }
    this.shelf.instanceMatrix.needsUpdate = true;
    this.deepGroup.add(this.shelf);
  }

  createKelp() {
    this.bladeCount = this.mobile ? 12 : 24;
    this.bladeSegments = 10;
    this.kelpGeometry = createKelpGeometry(this.bladeCount, this.bladeSegments);
    this.kelpMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a4b51,
      emissive: 0x032a39,
      emissiveIntensity: 0.42,
      roughness: 0.76,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.kelp = new THREE.Mesh(this.kelpGeometry, this.kelpMaterial);
    this.kelp.frustumCulled = false;
    this.deepGroup.add(this.kelp);
  }

  updateKelp(elapsed, current) {
    const positions = this.kelpGeometry.attributes.position.array;
    const motion = this.reducedMotion ? 0.18 : 1;
    let cursor = 0;
    for (let blade = 0; blade < this.bladeCount; blade += 1) {
      const side = blade % 2 === 0 ? -1 : 1;
      const baseX = side * (5.4 + seeded(blade, 111) * 8.2);
      const baseY = -6.35 - seeded(blade, 113) * 1.3;
      const baseZ = -8.5 - seeded(blade, 115) * 16;
      const height = 1.2 + seeded(blade, 117) * 2.8;
      const phase = seeded(blade, 119) * Math.PI * 2;
      for (let segment = 0; segment <= this.bladeSegments; segment += 1) {
        const t = segment / this.bladeSegments;
        const sway = (Math.sin(elapsed * 0.34 + phase + t * 2.1) * 0.5 + current.x * 0.32) * t * t * motion;
        const depthSway = Math.cos(elapsed * 0.27 + phase + t) * 0.18 * t * t * motion;
        const width = (0.09 + seeded(blade, 121) * 0.08) * (1 - t * 0.72);
        positions[cursor++] = baseX + sway - width;
        positions[cursor++] = baseY + t * height;
        positions[cursor++] = baseZ + depthSway;
        positions[cursor++] = baseX + sway + width;
        positions[cursor++] = baseY + t * height;
        positions[cursor++] = baseZ + depthSway;
      }
    }
    this.kelpGeometry.attributes.position.needsUpdate = true;
    this.kelpGeometry.computeVertexNormals();
  }

  update(elapsed, progress, current, focus, interactionMode = false) {
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
    const deepReveal = smoothstep(0.5, 0.76, progress);
    this.shelfMaterial.opacity = deepReveal * 0.62;
    this.kelpMaterial.opacity = deepReveal * 0.44;
    if (deepReveal > 0.01 && this.frame % backgroundStride === 0) {
      this.updateKelp(elapsed, current);
    }
  }

  dispose() {
    this.layers.forEach((layer) => {
      layer.geometry.dispose();
      layer.material.dispose();
    });
    this.currentVeil.geometry.dispose();
    this.currentVeil.material.dispose();
    this.shelf.geometry.dispose();
    this.shelfMaterial.dispose();
    this.kelpGeometry.dispose();
    this.kelpMaterial.dispose();
    this.distantJellies.dispose();
    this.group.removeFromParent();
    this.deepGroup.removeFromParent();
  }
}
