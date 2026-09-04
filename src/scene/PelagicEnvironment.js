import * as THREE from "three/webgpu";

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

    const bellGeometry = new THREE.SphereGeometry(1, 18, 9, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const bellMaterial = new THREE.MeshBasicMaterial({
      color: 0x8ddfff,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });
    this.bells = new THREE.InstancedMesh(bellGeometry, bellMaterial, count);
    this.bells.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.bells.frustumCulled = false;
    this.bells.renderOrder = 5;
    this.group.add(this.bells);

    this.tentacleCount = 5;
    this.pointsPerTentacle = 5;
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
      opacity: 0.16,
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
    this.position = new THREE.Vector3();
    this.color = new THREE.Color();
  }

  update(elapsed, progress, focus, reducedMotion) {
    const positions = this.tentacleGeometry.attributes.position.array;
    const colors = this.tentacleGeometry.attributes.color.array;
    const motion = reducedMotion ? 0.2 : 1;
    let cursor = 0;

    for (let index = 0; index < this.count; index += 1) {
      const cluster = index % 4;
      const lane = Math.floor(index / 4);
      const cycle = ((progress * (0.48 + cluster * 0.035)) + seeded(index, 3) + elapsed * 0.0025 * motion) % 1;
      const arc = cycle * Math.PI * 2;
      const radius = 6.8 + seeded(index, 7) * 8.5;
      const clusterAngle = cluster * Math.PI * 0.5 + Math.sin(progress * 3.2 + cluster) * 0.22;
      const visibility = smoothstep(0.02, 0.14, cycle) * (1 - smoothstep(0.86, 0.98, cycle));
      const depth = -4.5 - lane * 1.25 - seeded(index, 11) * 5.8;

      this.position.set(
        focus.x + Math.cos(clusterAngle + arc * 0.3) * radius + Math.sin(arc) * 2.2,
        focus.y + (seeded(index, 13) - 0.5) * 8.5 + Math.sin(arc * 0.7 + index) * 1.2,
        focus.z + depth + Math.cos(arc * 0.46 + cluster) * 2.8,
      );
      const baseScale = (0.09 + seeded(index, 17) * 0.2) * (0.3 + visibility * 0.7);
      const pulse = Math.pow(Math.max(0, Math.sin(elapsed * (0.58 + seeded(index, 19) * 0.2) + index)), 3);

      this.dummy.position.copy(this.position);
      this.dummy.rotation.set(
        Math.sin(elapsed * 0.07 + index) * 0.12 * motion,
        arc * 0.16,
        Math.cos(elapsed * 0.06 + index * 0.7) * 0.11 * motion,
      );
      this.dummy.scale.set(
        baseScale * (1 - pulse * 0.13),
        baseScale * (0.56 + pulse * 0.12),
        baseScale * (1 - pulse * 0.13),
      );
      this.dummy.updateMatrix();
      this.bells.setMatrixAt(index, this.dummy.matrix);
      this.color.copy(this.palette[index % this.palette.length]).multiplyScalar(0.48 + visibility * 0.52);
      this.bells.setColorAt(index, this.color);

      const bellRadius = baseScale * 0.7;
      const tentacleLength = baseScale * (2.1 + seeded(index, 23) * 2.4);
      for (let tentacle = 0; tentacle < this.tentacleCount; tentacle += 1) {
        const angle = (tentacle / this.tentacleCount) * Math.PI * 2 + index * 0.37;
        for (let segment = 0; segment < this.pointsPerTentacle - 1; segment += 1) {
          for (let endpoint = 0; endpoint < 2; endpoint += 1) {
            const point = segment + endpoint;
            const t = point / (this.pointsPerTentacle - 1);
            const sway = Math.sin(elapsed * 0.45 + index * 1.3 + tentacle + t * 5.4) * t * tentacleLength * 0.16 * motion;
            positions[cursor] = this.position.x + Math.cos(angle) * bellRadius * (1 - t * 0.25) + sway;
            colors[cursor++] = this.color.r;
            positions[cursor] = this.position.y - t * tentacleLength;
            colors[cursor++] = this.color.g;
            positions[cursor] = this.position.z + Math.sin(angle) * bellRadius * (1 - t * 0.25) + sway * 0.4;
            colors[cursor++] = this.color.b;
          }
        }
      }
    }
    this.bells.instanceMatrix.needsUpdate = true;
    if (this.bells.instanceColor) this.bells.instanceColor.needsUpdate = true;
    this.tentacleGeometry.attributes.position.needsUpdate = true;
    this.tentacleGeometry.attributes.color.needsUpdate = true;
  }

  dispose() {
    this.bells.geometry.dispose();
    this.bells.material.dispose();
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
