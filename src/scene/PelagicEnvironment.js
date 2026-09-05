import * as THREE from "three/webgpu";
import { createSoftParticles } from "./SoftParticles.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import {
  color as tslColor,
  mix as tslMix,
  positionLocal,
  smoothstep as tslSmoothstep,
  positionWorld,
  mx_noise_float,
  texture as tslTexture,
  triplanarTexture,
} from "three/tsl";
import { sampleSwimCycle } from "./jellyMotion.js";

const SWIM_AXIS = new THREE.Vector3(0, 1, 0);
const TWO_PI = Math.PI * 2;
const PUBLIC_BASE = import.meta.env.BASE_URL;
const DEEP_FLOOR_Y = -7.85;

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

function deepTerrainHeight(x, z) {
  const warpedX = x + Math.sin(z * 0.16) * 1.25;
  const warpedZ = z + Math.sin(x * 0.13) * 1.1;
  const shelfNoise =
    Math.sin(warpedX * 0.27 + warpedZ * 0.14) * 0.2
    + Math.sin(warpedX * 0.71 - warpedZ * 0.19) * 0.09
    + Math.cos(warpedZ * 0.38) * 0.07
    + Math.sin(warpedX * 1.72 + warpedZ * 1.21) * 0.026
    + Math.cos(warpedX * 2.83 - warpedZ * 2.15) * 0.012;
  const leftRidge = Math.max(0, 1 - Math.hypot((x + 11.5) / 5.8, (z + 14) / 10.5));
  const rightRidge = Math.max(0, 1 - Math.hypot((x - 11.2) / 6.2, (z + 18) / 9.5));
  const centerBasin = Math.max(0, 1 - Math.hypot(x / 7.5, (z + 13) / 11));
  return shelfNoise + leftRidge * 1.05 + rightRidge * 0.82 - centerBasin * 0.22;
}

function createSedimentNormalTexture(size = 128) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = (y * size + x) * 4;
      const waveX = Math.sin(x * 0.73 + Math.sin(y * 0.17)) * 0.5;
      const waveY = Math.cos(y * 0.61 + Math.sin(x * 0.13)) * 0.5;
      const grain = (seeded(x + y * size, 307) - 0.5) * 0.36;
      data[index] = Math.round(128 + (waveX + grain) * 28);
      data[index + 1] = Math.round(128 + (waveY + grain) * 28);
      data[index + 2] = 238;
      data[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(13, 11);
  texture.needsUpdate = true;
  return texture;
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

function createWeatheredStoneGeometry(seedSalt, detail = 1) {
  const geometry = new THREE.IcosahedronGeometry(1, detail);
  const positions = geometry.attributes.position;
  const point = new THREE.Vector3();
  for (let index = 0; index < positions.count; index += 1) {
    point.fromBufferAttribute(positions, index);
    const direction = point.clone().normalize();
    const strata = Math.sin(direction.y * 8.5 + seedSalt) * 0.055;
    // The same spatial vertex receives the same displacement on every face.
    // Per-index randomness cracked this non-indexed geometry at its seams.
    const fracture = Math.sin(direction.x * 13.7 + direction.z * 9.3 + seedSalt)
      * Math.cos(direction.y * 11.1 - direction.x * 5.3) * 0.045;
    point.multiplyScalar(1 + strata + fracture);
    point.y *= 0.72;
    positions.setXYZ(index, point.x, point.y, point.z);
  }
  geometry.computeVertexNormals();
  return geometry;
}

function createFissureRibbon(path, width, seedSalt, segmentChance = 1) {
  const positions = new Float32Array(path.length * 2 * 3);
  const indices = [];
  const previous = new THREE.Vector3();
  const next = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const perpendicular = new THREE.Vector3();
  let cursor = 0;
  path.forEach(([x, z], index) => {
    const previousPoint = path[Math.max(0, index - 1)];
    const nextPoint = path[Math.min(path.length - 1, index + 1)];
    previous.set(previousPoint[0], 0, previousPoint[1]);
    next.set(nextPoint[0], 0, nextPoint[1]);
    tangent.subVectors(next, previous).normalize();
    perpendicular.set(-tangent.z, 0, tangent.x);
    const localWidth = width * (0.52 + seeded(index, seedSalt) * 0.72);
    const y = DEEP_FLOOR_Y + deepTerrainHeight(x, z) + 0.035;
    positions[cursor++] = x + perpendicular.x * localWidth;
    positions[cursor++] = y;
    positions[cursor++] = z + perpendicular.z * localWidth;
    positions[cursor++] = x - perpendicular.x * localWidth;
    positions[cursor++] = y + 0.002;
    positions[cursor++] = z - perpendicular.z * localWidth;
    if (
      index < path.length - 1
      && (segmentChance >= 1 || seeded(index, seedSalt + 97) < segmentChance)
    ) {
      const row = index * 2;
      indices.push(row, row + 2, row + 1, row + 2, row + 3, row + 1);
    }
  });
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function orientCylinderMatrix(dummy, start, end, radius = 1) {
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  dummy.position.copy(midpoint);
  dummy.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize(),
  );
  dummy.scale.set(radius, direction.length(), radius);
  dummy.updateMatrix();
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
    this.deepGroup.name = "abyssal-basalt-garden";
    scene.add(this.deepGroup);
    this.deepMaterials = new Set();
    this.deepGeometries = new Set();
    this.deepTextures = new Set();
    this.deepLights = [];
    this.deepAssetsRequested = false;
    this.deepAssetsReady = false;
    this.disposed = false;
    this.createShelf();
    this.createKelp();
  }

  trackDeep(geometry, material, baseOpacity = 1) {
    if (geometry) this.deepGeometries.add(geometry);
    const materials = Array.isArray(material) ? material : [material];
    materials.filter(Boolean).forEach((entry) => {
      entry.transparent = true;
      entry.opacity = 0;
      entry.userData.deepBaseOpacity = baseOpacity;
      this.deepMaterials.add(entry);
    });
  }

  trackSourceTextures(material) {
    [
      "map",
      "normalMap",
      "aoMap",
      "roughnessMap",
      "metalnessMap",
      "emissiveMap",
      "alphaMap",
    ].forEach((key) => {
      if (material?.[key]?.isTexture) this.deepTextures.add(material[key]);
    });
  }

  createShelf() {
    this.createSedimentFloor();
    this.createRubbleFields();
    this.createMicroRubble();
    this.createSessileLife();
    this.createVolcanicField();
    this.createBenthicSnow();
    this.createDeepLights();
  }

  createSedimentFloor() {
    const floorSize = 144;
    const terrainSegments = this.mobile ? 96 : 160;
    const geometry = new THREE.PlaneGeometry(
      floorSize,
      floorSize,
      terrainSegments,
      terrainSegments,
    );
    const positions = geometry.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const trenchColor = new THREE.Color(0x030b12);
    const siltColor = new THREE.Color(0x102934);
    const mineralColor = new THREE.Color(0x204754);
    const color = new THREE.Color();

    for (let index = 0; index < positions.count; index += 1) {
      // Concentrate samples inside the visible basin, coarse outside it.
      const x = Math.sign(positions.getX(index)) * Math.pow(Math.abs(positions.getX(index)) / (floorSize / 2), 1.55) * floorSize / 2;
      const localY = Math.sign(positions.getY(index)) * Math.pow(Math.abs(positions.getY(index)) / (floorSize / 2), 1.55) * floorSize / 2;
      positions.setX(index, x);
      positions.setY(index, localY);
      const worldZ = -localY - 14;
      const height = deepTerrainHeight(x, worldZ);
      positions.setZ(index, height);
      const shelfMix = clamp01(0.27 + height * 0.22 + seeded(index, 333) * 0.13);
      color.copy(trenchColor).lerp(siltColor, shelfMix);
      if (seeded(index, 337) > 0.84) color.lerp(mineralColor, 0.12);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geometry.computeVertexNormals();
    geometry.rotateX(-Math.PI * 0.5);

    const normalMap = createSedimentNormalTexture(this.mobile ? 128 : 256);
    this.deepTextures.add(normalMap);
    const material = new THREE.MeshPhongNodeMaterial({
      color: 0xffffff,
      vertexColors: false,
      normalMap,
      normalScale: new THREE.Vector2(0.65, 0.65),
      emissive: 0x04131b,
      emissiveIntensity: 0.2,
      specular: 0x06151c,
      shininess: 2,
      depthWrite: true,
      side: THREE.FrontSide,
    });
    const deposits = mx_noise_float(positionWorld.mul(0.48)).mul(0.5).add(0.5);
    const grain = mx_noise_float(positionWorld.mul(17)).mul(0.5).add(0.5);
    const sedimentMask = tslSmoothstep(0.28, 0.76, deposits);
    const scan = new THREE.TextureLoader().load(`${PUBLIC_BASE}assets/models/polyhaven/rock_07/textures/rock_07_diff_1k.jpg`);
    scan.colorSpace = THREE.SRGBColorSpace;
    scan.wrapS = scan.wrapT = THREE.RepeatWrapping;
    scan.anisotropy = 4;
    this.deepTextures.add(scan);
    const rockTexture = triplanarTexture(tslTexture(scan), null, null, 0.7);
    material.colorNode = tslMix(rockTexture.rgb.mul(tslColor(0x839aa4)), tslColor(0x47585c), sedimentMask.mul(0.68))
      .mul(grain.mul(0.24).add(0.76));
    // Contact shade is embedded in terrain rather than hard floating discs.
    for (const [x, z, radius] of [[-4.8,-11.1,2.3],[7.2,-4.8,1.5],[-3.8,-7.2,1.5],[5.9,-12.8,2.1],[-7.7,-5.7,1.4],[4.2,-8.8,1.3]]) {
      const distance = positionLocal.x.sub(x).abs().pow(2).add(positionLocal.z.sub(z + 14).abs().pow(2));
      material.colorNode = material.colorNode.mul(distance.div(radius * radius).negate().exp().mul(-0.6).add(1));
    }
    material.emissiveNode = tslColor(0x010609).mul(sedimentMask.mul(0.25).add(0.4));
    this.floorMaterial = material;
    this.floor = new THREE.Mesh(geometry, material);
    this.floor.position.set(0, DEEP_FLOOR_Y, -14);
    this.floor.renderOrder = -5;
    this.deepGroup.add(this.floor);
    this.trackDeep(geometry, material, 0.96);
  }

  createMicroRubble() {
    const geometry = createWeatheredStoneGeometry(347, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      emissive: 0x04141b,
      emissiveIntensity: 0.24,
      specular: 0x071a20,
      shininess: 2,
      vertexColors: true,
    });
    const count = this.mobile ? 72 : 150;
    const field = new THREE.InstancedMesh(geometry, material, count);
    const dummy = new THREE.Object3D();
    const colors = [
      new THREE.Color(0x10252c),
      new THREE.Color(0x183039),
      new THREE.Color(0x20363d),
      new THREE.Color(0x12202a),
    ];
    for (let index = 0; index < count; index += 1) {
      const x = (seeded(index, 341) - 0.5) * 43;
      const z = 1 - seeded(index, 343) * 38;
      const corridor = Math.max(0, 1 - Math.abs(x) / 4.6);
      const size = (0.035 + seeded(index, 349) * 0.13) * (1 - corridor * 0.34);
      dummy.position.set(
        x,
        DEEP_FLOOR_Y + deepTerrainHeight(x, z) + size * 0.24,
        z,
      );
      dummy.rotation.set(
        seeded(index, 357) * 1.3,
        seeded(index, 363) * TWO_PI,
        seeded(index, 369) * 0.9,
      );
      dummy.scale.set(
        size * (0.75 + seeded(index, 371) * 0.72),
        size * (0.38 + seeded(index, 377) * 0.38),
        size * (0.72 + seeded(index, 379) * 0.66),
      );
      dummy.updateMatrix();
      field.setMatrixAt(index, dummy.matrix);
      field.setColorAt(index, colors[index % colors.length]);
    }
    field.instanceMatrix.needsUpdate = true;
    if (field.instanceColor) field.instanceColor.needsUpdate = true;
    this.deepGroup.add(field);
    this.trackDeep(geometry, material, 0.7);
  }

  createRubbleFields() {
    const rubbleDefinitions = [
      { geometry: createWeatheredStoneGeometry(351, 1), count: this.mobile ? 14 : 24, salt: 353 },
      { geometry: createWeatheredStoneGeometry(359, 1), count: this.mobile ? 10 : 18, salt: 367 },
    ];
    const colors = [
      new THREE.Color(0x102b35),
      new THREE.Color(0x183943),
      new THREE.Color(0x223f4a),
    ];
    this.rubble = [];

    rubbleDefinitions.forEach(({ geometry, count, salt }, fieldIndex) => {
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        emissive: 0x071c26,
        emissiveIntensity: 0.34,
        specular: 0x0a2530,
        shininess: 4,
        vertexColors: true,
      });
      const field = new THREE.InstancedMesh(geometry, material, count);
      const dummy = new THREE.Object3D();
      for (let index = 0; index < count; index += 1) {
        const x = (seeded(index, salt) - 0.5) * 35;
        const z = -1 - seeded(index, salt + 2) * 31;
        const corridor = Math.max(0, 1 - Math.abs(x) / 5.2);
        const size = (0.12 + seeded(index, salt + 4) * 0.43) * (1 - corridor * 0.46);
        dummy.position.set(
          x,
          DEEP_FLOOR_Y + deepTerrainHeight(x, z) + size * 0.18,
          z,
        );
        dummy.rotation.set(
          seeded(index, salt + 6) * 1.7,
          seeded(index, salt + 8) * TWO_PI,
          seeded(index, salt + 10) * 1.1,
        );
        dummy.scale.set(
          size * (0.75 + seeded(index, salt + 12) * 0.9),
          size * (0.55 + seeded(index, salt + 14) * 0.8),
          size * (0.8 + seeded(index, salt + 16) * 0.72),
        );
        dummy.updateMatrix();
        field.setMatrixAt(index, dummy.matrix);
        field.setColorAt(index, colors[(index + fieldIndex) % colors.length]);
      }
      field.instanceMatrix.needsUpdate = true;
      if (field.instanceColor) field.instanceColor.needsUpdate = true;
      this.rubble.push(field);
      this.deepGroup.add(field);
      this.trackDeep(geometry, material, fieldIndex === 0 ? 0.9 : 0.76);
    });
  }

  createContactShadows() {
    const placements = [
      [-4.8, -11.1, 3.25, 2.05],
      [7.2, -4.8, 2.1, 1.35],
      [-3.8, -7.2, 2.1, 1.35],
      [5.9, -12.8, 3.15, 1.9],
      [-7.7, -5.7, 1.9, 1.15],
      [4.2, -8.8, 1.65, 1],
      [-7.4, -3.8, 0.72, 0.46],
      [7.8, -1.5, 0.58, 0.4],
    ];
    const geometry = new THREE.CircleGeometry(1, 32);
    geometry.rotateX(-Math.PI * 0.5);
    const material = new THREE.MeshBasicMaterial({
      color: 0x010509,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.contactShadows = new THREE.InstancedMesh(geometry, material, placements.length);
    const dummy = new THREE.Object3D();
    placements.forEach(([x, z, width, depth], index) => {
      dummy.position.set(x, DEEP_FLOOR_Y + deepTerrainHeight(x, z) + 0.018, z);
      dummy.rotation.y = seeded(index, 373) * TWO_PI;
      dummy.scale.set(width, 1, depth);
      dummy.updateMatrix();
      this.contactShadows.setMatrixAt(index, dummy.matrix);
    });
    this.contactShadows.instanceMatrix.needsUpdate = true;
    this.contactShadows.renderOrder = -4;
    this.deepGroup.add(this.contactShadows);
    this.trackDeep(geometry, material, 0.34);
  }

  createSessileLife() {
    const spongeGeometry = new THREE.SphereGeometry(1, 12, 8);
    const spongeMaterial = new THREE.MeshPhongMaterial({
      color: 0x7b9fa7,
      emissive: 0x092b37,
      emissiveIntensity: 0.4,
      specular: 0x173946,
      shininess: 6,
      vertexColors: true,
    });
    const spongeCount = this.mobile ? 8 : 14;
    this.sponges = new THREE.InstancedMesh(spongeGeometry, spongeMaterial, spongeCount);
    const dummy = new THREE.Object3D();
    const spongeColors = [
      new THREE.Color(0x7da7ad),
      new THREE.Color(0x657f9f),
      new THREE.Color(0x8b91ab),
    ];
    for (let index = 0; index < spongeCount; index += 1) {
      const side = index % 2 === 0 ? -1 : 1;
      const x = side * (6.4 + seeded(index, 383) * 9.5);
      const z = -4.5 - seeded(index, 389) * 25;
      const size = 0.11 + seeded(index, 397) * 0.28;
      dummy.position.set(x, DEEP_FLOOR_Y + deepTerrainHeight(x, z) + size * 0.55, z);
      dummy.rotation.set(0, seeded(index, 401) * TWO_PI, (seeded(index, 409) - 0.5) * 0.26);
      dummy.scale.set(size * (0.65 + seeded(index, 419) * 0.36), size * (1.2 + seeded(index, 421)), size);
      dummy.updateMatrix();
      this.sponges.setMatrixAt(index, dummy.matrix);
      this.sponges.setColorAt(index, spongeColors[index % spongeColors.length]);
    }
    this.sponges.instanceMatrix.needsUpdate = true;
    if (this.sponges.instanceColor) this.sponges.instanceColor.needsUpdate = true;
    this.deepGroup.add(this.sponges);
    this.trackDeep(spongeGeometry, spongeMaterial, 0.72);

    const branchGeometry = new THREE.CylinderGeometry(1, 1, 1, 6, 1, false);
    const branchMaterial = new THREE.MeshPhongMaterial({
      color: 0x7696a4,
      emissive: 0x0a2b40,
      emissiveIntensity: 0.42,
      specular: 0x173a48,
      shininess: 5,
    });
    const clusters = this.mobile ? 3 : 5;
    const segmentsPerCluster = 7;
    this.coralBranches = new THREE.InstancedMesh(
      branchGeometry,
      branchMaterial,
      clusters * segmentsPerCluster,
    );
    let instance = 0;
    for (let cluster = 0; cluster < clusters; cluster += 1) {
      const side = cluster % 2 === 0 ? -1 : 1;
      const x = side * (7.2 + seeded(cluster, 431) * 7.2);
      const z = -7 - seeded(cluster, 433) * 20;
      const base = new THREE.Vector3(x, DEEP_FLOOR_Y + deepTerrainHeight(x, z), z);
      for (let segment = 0; segment < segmentsPerCluster; segment += 1) {
        const angle = (segment / segmentsPerCluster) * TWO_PI + seeded(segment, cluster + 439) * 0.5;
        const start = base.clone().add(new THREE.Vector3(
          Math.cos(angle) * 0.08,
          0.03,
          Math.sin(angle) * 0.08,
        ));
        const length = 0.32 + seeded(segment, cluster + 443) * 0.54;
        const end = start.clone().add(new THREE.Vector3(
          Math.cos(angle) * length * 0.28,
          length,
          Math.sin(angle) * length * 0.28,
        ));
        orientCylinderMatrix(dummy, start, end, 0.026 + seeded(segment, cluster + 449) * 0.018);
        this.coralBranches.setMatrixAt(instance, dummy.matrix);
        instance += 1;
      }
    }
    this.coralBranches.instanceMatrix.needsUpdate = true;
    this.deepGroup.add(this.coralBranches);
    this.trackDeep(branchGeometry, branchMaterial, 0.62);
  }

  createVolcanicField() {
    const fissurePaths = [
      [[-8.4, -13.6], [-7.5, -13.2], [-6.9, -13.45], [-6, -12.85], [-5.35, -13.34], [-4.55, -13.08], [-3.75, -13.46], [-3.1, -12.9]],
      [[2.8, -10.2], [3.55, -10.72], [4.15, -10.55], [4.85, -11.18], [5.55, -10.82], [6.25, -11.25], [7.25, -11.16], [8.5, -12.1]],
      [[-1.5, -5.1], [-1.05, -5.74], [-0.48, -5.6], [0.05, -6.32], [0.72, -6.26], [1.15, -7.12], [1.72, -7.48], [2.1, -8.8]],
    ];
    this.lavaMaterials = [];
    this.ventBases = [];

    fissurePaths.forEach((path, pathIndex) => {
      const points = path.map(([x, z]) => new THREE.Vector3(
        x,
        DEEP_FLOOR_Y + deepTerrainHeight(x, z) + 0.045,
        z,
      ));
      const crustGeometry = createFissureRibbon(path, 0.095, 601 + pathIndex * 11);
      const coreGeometry = createFissureRibbon(path, 0.014, 607 + pathIndex * 13, 0.66);
      const crustMaterial = new THREE.MeshBasicMaterial({
        color: pathIndex === 1 ? 0x531713 : 0x391014,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const coreMaterial = new THREE.MeshBasicMaterial({
        color: pathIndex === 2 ? 0xff8b42 : 0xe94b27,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const crust = new THREE.Mesh(crustGeometry, crustMaterial);
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      crust.renderOrder = 1;
      core.renderOrder = 2;
      this.deepGroup.add(crust, core);
      this.trackDeep(crustGeometry, crustMaterial, 0.16);
      this.trackDeep(coreGeometry, coreMaterial, 0.34);
      this.lavaMaterials.push(
        { material: crustMaterial, baseOpacity: 0.16, phase: pathIndex * 1.7 },
        { material: coreMaterial, baseOpacity: 0.34, phase: pathIndex * 1.7 + 0.65 },
      );
      this.ventBases.push(points[Math.floor(points.length * 0.55)].clone());
    });

    const glowRockGeometry = createWeatheredStoneGeometry(503, 3);
    const glowRockMaterial = new THREE.MeshPhongNodeMaterial({
      color: 0x17191b,
      emissive: 0x4a130c,
      emissiveIntensity: 0.13,
      specular: 0x6b2a18,
      shininess: 10,
      vertexColors: true,
    });
    const crust = mx_noise_float(positionLocal.mul(7.5)).abs();
    const hotSeams = tslSmoothstep(0.075, 0.012, crust);
    glowRockMaterial.emissiveNode = tslColor(0xff652b).mul(hotSeams.pow(2)).mul(0.38);
    const glowRockCount = this.mobile ? 10 : 18;
    this.glowRocks = new THREE.InstancedMesh(
      glowRockGeometry,
      glowRockMaterial,
      glowRockCount,
    );
    const dummy = new THREE.Object3D();
    const crustColors = [
      new THREE.Color(0x202629),
      new THREE.Color(0x2b2220),
      new THREE.Color(0x252a2d),
    ];
    for (let index = 0; index < glowRockCount; index += 1) {
      const vent = this.ventBases[index % this.ventBases.length];
      const angle = seeded(index, 509) * TWO_PI;
      const radius = 0.22 + seeded(index, 521) * 1.18;
      const x = vent.x + Math.cos(angle) * radius;
      const z = vent.z + Math.sin(angle) * radius;
      const size = 0.16 + seeded(index, 523) * 0.32;
      dummy.position.set(x, DEEP_FLOOR_Y + deepTerrainHeight(x, z) + size * 0.3, z);
      dummy.rotation.set(
        seeded(index, 541) * 1.3,
        seeded(index, 547) * TWO_PI,
        seeded(index, 557) * 0.8,
      );
      dummy.scale.set(size * 1.35, size * 0.62, size * 1.08);
      dummy.updateMatrix();
      this.glowRocks.setMatrixAt(index, dummy.matrix);
      this.glowRocks.setColorAt(index, crustColors[index % crustColors.length]);
    }
    this.glowRocks.instanceMatrix.needsUpdate = true;
    if (this.glowRocks.instanceColor) this.glowRocks.instanceColor.needsUpdate = true;
    this.deepGroup.add(this.glowRocks);
    this.trackDeep(glowRockGeometry, glowRockMaterial, 0.92);
    this.glowRockMaterial = glowRockMaterial;

    const bubbleCount = this.mobile ? 22 : 42;
    const bubbleGeometry = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(bubbleCount * 3);
    bubbleGeometry.setAttribute("position", new THREE.BufferAttribute(bubblePositions, 3));
    bubbleGeometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
    const bubbleTexture = createSoftParticleTexture();
    this.deepTextures.add(bubbleTexture);
    const bubbleMaterial = new THREE.PointsMaterial({
      color: 0xff7140,
      map: bubbleTexture,
      alphaMap: bubbleTexture,
      size: this.mobile ? 0.1 : 0.075,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.lavaBubbleState = Array.from({ length: bubbleCount }, (_, index) => ({
      vent: index % this.ventBases.length,
      phase: seeded(index, 563),
      speed: 0.045 + seeded(index, 569) * 0.075,
      height: 0.55 + seeded(index, 571) * 1.45,
      drift: 0.04 + seeded(index, 577) * 0.12,
      angle: seeded(index, 587) * TWO_PI,
    }));
    this.lavaBubbles = new THREE.Points(bubbleGeometry, bubbleMaterial);
    this.lavaBubbles.frustumCulled = false;
    this.lavaBubbles.renderOrder = 4;
    this.deepGroup.add(this.lavaBubbles);
    this.trackDeep(bubbleGeometry, bubbleMaterial, 0.58);
    this.lavaBubbleMaterial = bubbleMaterial;

    this.ventLight = new THREE.PointLight(0xff5e2f, 0, 7.5, 2.2);
    this.ventLight.position.copy(this.ventBases[1]).add(new THREE.Vector3(0, 0.72, 0));
    this.deepGroup.add(this.ventLight);
  }

  updateVolcanicField(elapsed, deepReveal) {
    const motion = this.reducedMotion ? 0.22 : 1;
    this.lavaMaterials?.forEach(({ material, baseOpacity, phase }) => {
      const pulse = 0.76 + Math.sin(elapsed * 0.34 * motion + phase) * 0.16;
      material.opacity = deepReveal * baseOpacity * pulse;
    });
    if (this.glowRockMaterial) {
      this.glowRockMaterial.emissiveIntensity = deepReveal
        * (0.12 + Math.sin(elapsed * 0.27 * motion + 0.8) * 0.025);
    }
    if (this.lavaBubbles) {
      const positions = this.lavaBubbles.geometry.attributes.position.array;
      this.lavaBubbleState.forEach((state, index) => {
        const vent = this.ventBases[state.vent];
        const travel = (state.phase + elapsed * state.speed * motion) % 1;
        const spread = state.drift * (0.2 + travel);
        positions[index * 3] = vent.x
          + Math.cos(state.angle + elapsed * 0.18 * motion) * spread
          + Math.sin(travel * Math.PI * 3) * 0.025;
        positions[index * 3 + 1] = vent.y + 0.08 + travel * state.height;
        positions[index * 3 + 2] = vent.z
          + Math.sin(state.angle + elapsed * 0.15 * motion) * spread;
      });
      this.lavaBubbles.geometry.attributes.position.needsUpdate = true;
      this.lavaBubbleMaterial.opacity = deepReveal
        * (0.28 + Math.sin(elapsed * 0.23 * motion) * 0.04);
    }
    if (this.ventLight) {
      this.ventLight.intensity = deepReveal
        * (0.62 + Math.sin(elapsed * 0.31 * motion + 0.4) * 0.1);
    }
  }

  createDeepLights() {
    const cyan = new THREE.PointLight(0x4cbde6, 0, 13, 2.1);
    const violet = new THREE.PointLight(0x7478d8, 0, 11, 2.2);
    this.deepAmbient = new THREE.HemisphereLight(0x4f8094, 0x010407, 0);
    this.deepLights.push(cyan, violet);
    this.deepGroup.add(cyan, violet, this.deepAmbient);
  }

  createBenthicSnow() {
    const count = this.mobile ? 80 : 150;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const pale = new THREE.Color(0x8fc8d3);
    const violet = new THREE.Color(0x7181b1);
    const mixed = new THREE.Color();
    for (let index = 0; index < count; index += 1) {
      const x = (seeded(index, 467) - 0.5) * 36;
      const z = -1 - seeded(index, 469) * 31;
      positions[index * 3] = x;
      positions[index * 3 + 1] = DEEP_FLOOR_Y
        + deepTerrainHeight(x, z)
        + 0.16
        + seeded(index, 479) * 2.6;
      positions[index * 3 + 2] = z;
      mixed.copy(pale).lerp(violet, seeded(index, 487));
      colors[index * 3] = mixed.r;
      colors[index * 3 + 1] = mixed.g;
      colors[index * 3 + 2] = mixed.b;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    this.benthicSnow = createSoftParticles(geometry, {
      size: this.mobile ? 0.035 : 0.027,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.benthicSnow.renderOrder = 3;
    this.deepGroup.add(this.benthicSnow);
    this.trackDeep(this.benthicSnow.geometry, this.benthicSnow.material, 0.26);
  }

  async loadDeepAssets() {
    if (this.deepAssetsRequested || this.disposed) return;
    this.deepAssetsRequested = true;
    const loader = new GLTFLoader();
    const rockDefinitions = [
      {
        url: `${PUBLIC_BASE}assets/models/polyhaven/rock_09/rock_09_1k.gltf`,
        tint: 0x91b4bd,
        placements: [
          [-4.8, -11.1, 5.2, -0.42, 0.98, 1.28],
          [7.2, -4.8, 3.25, 1.9, 0.82, 1.08],
          [-3.8, -7.2, 3.45, 0.26, 0.92, 1.16],
        ],
      },
      {
        url: `${PUBLIC_BASE}assets/models/polyhaven/rock_07/rock_07_1k.gltf`,
        tint: 0x789aa5,
        placements: [
          [5.9, -12.8, 4.9, 0.74, 1.02, 1.08],
          [-7.7, -5.7, 3.1, -1.38, 0.9, 1.04],
          [4.2, -8.8, 2.75, -0.28, 0.86, 1.08],
        ],
      },
      {
        url: `${PUBLIC_BASE}assets/models/polyhaven/moon_rock_02/moon_rock_02_1k.gltf`,
        tint: 0x829fa8,
        placements: [
          [-7.4, -3.8, 1.15, 0.36, 1.18, 1.04],
          [7.8, -1.5, 0.9, -0.86, 1.12, 1.08],
        ],
      },
    ];

    await Promise.all(rockDefinitions.map(async (definition) => {
      try {
        const gltf = await loader.loadAsync(definition.url);
        if (this.disposed) return;
        const source = gltf.scene;
        source.traverse((object) => {
          if (!object.isMesh) return;
          object.castShadow = false;
          object.receiveShadow = false;
          if (object.geometry) this.deepGeometries.add(object.geometry);
          const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
          const materials = sourceMaterials.filter(Boolean).map((entry) => {
            this.trackSourceTextures(entry);
            const material = new THREE.MeshPhongMaterial({
              color: definition.tint,
              map: entry.map ?? null,
              normalMap: entry.normalMap ?? null,
              normalScale: entry.normalScale?.clone().multiplyScalar(0.72)
                ?? new THREE.Vector2(0.72, 0.72),
              aoMap: entry.aoMap ?? null,
              aoMapIntensity: 0.78,
              emissive: 0x214957,
              emissiveMap: entry.map ?? null,
              emissiveIntensity: 0.16,
              specular: 0x183843,
              shininess: 7,
            });
            this.trackDeep(null, material, 0.93);
            return material;
          });
          object.material = Array.isArray(object.material) ? materials : materials[0];
        });

        const rawBox = new THREE.Box3().setFromObject(source);
        const rawSize = rawBox.getSize(new THREE.Vector3());
        const normalization = 1 / Math.max(rawSize.x, rawSize.y, rawSize.z);
        source.scale.setScalar(normalization);
        source.updateMatrixWorld(true);
        const normalizedBox = new THREE.Box3().setFromObject(source);
        const center = normalizedBox.getCenter(new THREE.Vector3());
        source.position.set(-center.x, -normalizedBox.min.y, -center.z);
        const normalized = new THREE.Group();
        normalized.add(source);

        definition.placements.forEach(([x, z, scale, rotation, width, height]) => {
          const rock = normalized.clone(true);
          rock.position.set(
            x,
            DEEP_FLOOR_Y + deepTerrainHeight(x, z) - scale * 0.14,
            z,
          );
          rock.rotation.set(
            (seeded(Math.round(z * 10), 457) - 0.5) * 0.18,
            rotation,
            (seeded(Math.round(x * 10), 463) - 0.5) * 0.24,
          );
          rock.scale.set(scale * width, scale * height, scale);
          this.deepGroup.add(rock);
        });
      } catch (error) {
        console.warn(`Abyssal rock could not be loaded: ${definition.url}`, error);
      }
    }));

    if (!this.disposed) {
      await this.loadSpecimenCoral(loader);
      if (!this.disposed) this.deepAssetsReady = true;
    }
  }

  getDeepState() {
    return {
      name: this.deepGroup.name,
      assetsRequested: this.deepAssetsRequested,
      assetsReady: this.deepAssetsReady,
      materialCount: this.deepMaterials.size,
      geometryCount: this.deepGeometries.size,
      floorOpacity: this.floorMaterial.opacity,
      floorPosition: this.floor.position.toArray(),
      rockSources: 3,
      scannedRockPlacements: 8,
      rubbleInstances: this.rubble?.reduce((sum, field) => sum + field.count, 0) ?? 0,
    };
  }

  async loadSpecimenCoral(loader) {
    try {
      const gltf = await loader.loadAsync(`${PUBLIC_BASE}assets/models/smithsonian-acropora-palmata.glb`);
      if (this.disposed) return;
      const specimen = gltf.scene;
      specimen.traverse((object) => {
        if (!object.isMesh) return;
        if (object.geometry) this.deepGeometries.add(object.geometry);
        const sources = Array.isArray(object.material) ? object.material : [object.material];
        const materials = sources.filter(Boolean).map((entry) => {
          this.trackSourceTextures(entry);
          const material = new THREE.MeshPhongMaterial({
            color: 0x688c9b,
            map: entry.map ?? null,
            normalMap: entry.normalMap ?? null,
            normalScale: entry.normalScale?.clone().multiplyScalar(0.64)
              ?? new THREE.Vector2(0.64, 0.64),
            aoMap: entry.aoMap ?? null,
            aoMapIntensity: 0.7,
            emissive: 0x061822,
            emissiveIntensity: 0.14,
            specular: 0x153845,
            shininess: 6,
          });
          this.trackDeep(null, material, 0.54);
          return material;
        });
        object.material = Array.isArray(object.material) ? materials : materials[0];
      });
      const rawBox = new THREE.Box3().setFromObject(specimen);
      const rawSize = rawBox.getSize(new THREE.Vector3());
      specimen.scale.setScalar(1 / Math.max(rawSize.x, rawSize.y, rawSize.z));
      specimen.updateMatrixWorld(true);
      const normalizedBox = new THREE.Box3().setFromObject(specimen);
      const center = normalizedBox.getCenter(new THREE.Vector3());
      specimen.position.set(-center.x, -normalizedBox.min.y, -center.z);
      const normalized = new THREE.Group();
      normalized.add(specimen);
      const placements = [
        [-8.1, -11.4, 0.74, 0.4],
        [8.2, -15.1, 0.62, -0.8],
        [-11.1, -24.5, 0.5, 1.7],
      ];
      placements.forEach(([x, z, scale, rotation]) => {
        const coral = normalized.clone(true);
        coral.position.set(x, DEEP_FLOOR_Y + deepTerrainHeight(x, z) + 0.06, z);
        coral.rotation.y = rotation;
        coral.scale.setScalar(scale);
        this.deepGroup.add(coral);
      });
    } catch (error) {
      console.warn("The sparse Smithsonian coral specimen could not be loaded", error);
    }
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
      const baseZ = -8.5 - seeded(blade, 115) * 16;
      const baseY = DEEP_FLOOR_Y + deepTerrainHeight(baseX, baseZ) - 0.03;
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
    if (!prewarm && progress > 0.54 && !this.deepAssetsRequested) {
      void this.loadDeepAssets();
    }
    const deepReveal = smoothstep(0.62, 0.9, progress);
    this.deepMaterials.forEach((material) => {
      material.opacity = deepReveal * (material.userData.deepBaseOpacity ?? 1);
    });
    this.kelpMaterial.opacity = deepReveal * 0.44;
    if (this.benthicSnow) {
      this.benthicSnow.position.x = current.x * 0.16;
      this.benthicSnow.position.z = Math.sin(elapsed * 0.025) * 0.08;
      this.benthicSnow.rotation.y = Math.sin(elapsed * 0.018) * 0.006;
    }
    if (this.deepLights.length === 2) {
      const lightMotion = this.reducedMotion ? 0.2 : 1;
      this.deepLights[0].position.set(
        focus.x - 3.8,
        Math.max(DEEP_FLOOR_Y + 1.3, focus.y - 1.6),
        focus.z + 1.8,
      );
      this.deepLights[1].position.set(
        focus.x + 4.6,
        Math.max(DEEP_FLOOR_Y + 1.1, focus.y - 2.1),
        focus.z - 3.2,
      );
      this.deepLights[0].intensity = deepReveal
        * (4.1 + Math.sin(elapsed * 0.19) * 0.4 * lightMotion);
      this.deepLights[1].intensity = deepReveal
        * (2.7 + Math.sin(elapsed * 0.14 + 1.7) * 0.3 * lightMotion);
      this.deepAmbient.intensity = deepReveal * 0.62;
    }
    this.updateVolcanicField(elapsed, smoothstep(0.72, 0.93, progress));
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
    this.disposed = true;
    this.deepGeometries.forEach((geometry) => geometry.dispose());
    this.deepMaterials.forEach((material) => material.dispose());
    this.deepTextures.forEach((texture) => texture.dispose());
    this.kelpGeometry.dispose();
    this.kelpMaterial.dispose();
    this.distantJellies.dispose();
    this.group.removeFromParent();
    this.deepGroup.removeFromParent();
  }
}
