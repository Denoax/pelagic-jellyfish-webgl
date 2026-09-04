import * as THREE from "three/webgpu";
import { sampleSwimCycle } from "./jellyMotion.js";

const HERO_TENTACLES = 22;
const BACKGROUND_TENTACLES = 14;
const HERO_SEGMENTS = 42;
const BACKGROUND_SEGMENTS = 28;
const ARM_COUNT = 4;
const HERO_ARM_SEGMENTS = 38;
const BACKGROUND_ARM_SEGMENTS = 26;
const FILAMENT_COUNT = 10;
const FILAMENT_SEGMENTS = 34;
const RIB_COUNT = 18;
const RIB_SEGMENTS = 14;
const LATITUDE_RINGS = 0;
const LATITUDE_SEGMENTS = 32;

const SPECIES = [
  {
    bell: 0xc7edff,
    vein: 0x536fd2,
    glow: 0x68ddff,
    tentacle: 0x78c8ff,
    radius: 1.34,
    height: 0.78,
    lobes: 8,
  },
  {
    bell: 0x89bfd0,
    vein: 0x4b8faf,
    glow: 0x6fe5ff,
    tentacle: 0x73d8e8,
    radius: 1.2,
    height: 0.68,
    lobes: 12,
  },
  {
    bell: 0xa99ad2,
    vein: 0x66579f,
    glow: 0xb08cff,
    tentacle: 0x9ab7ed,
    radius: 1.4,
    height: 0.9,
    lobes: 6,
  },
  {
    bell: 0xb6c9c4,
    vein: 0x6c8f91,
    glow: 0x8fffe2,
    tentacle: 0x9bd9cf,
    radius: 1.28,
    height: 0.74,
    lobes: 10,
  },
];

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(min, max, value) {
  const t = clamp((value - min) / Math.max(0.0001, max - min), 0, 1);
  return t * t * (3 - 2 * t);
}

function angularDistance(a, b) {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

function seeded(index, salt = 0) {
  const value = Math.sin(index * 91.73 + salt * 37.11) * 43758.5453;
  return value - Math.floor(value);
}

function createParticle(x, y, z) {
  const position = new THREE.Vector3(x, y, z);
  return { position, previous: position.clone() };
}

function createChain(angle, count, length, radius, seed) {
  const particles = [];
  for (let index = 0; index < count; index += 1) {
    const t = index / (count - 1);
    const curl = Math.sin(t * 8.2 + seed) * Math.pow(t, 1.2) * 0.3;
    const curlDepth = Math.cos(t * 6.7 + seed * 0.73) * Math.pow(t, 1.35) * 0.2;
    particles.push(createParticle(
      Math.cos(angle) * radius + Math.cos(angle + Math.PI * 0.5) * curl,
      0.05 - length * t,
      Math.sin(angle) * radius + Math.sin(angle + Math.PI * 0.5) * curl + curlDepth,
    ));
  }
  return {
    angle,
    particles,
    restLength: length / (count - 1),
    radius,
    seed,
    drift: 0.78 + seeded(seed, 4) * 0.5,
  };
}

function createTubeGeometry(chainCount, pointCount, radialSegments) {
  const vertexCount = chainCount * pointCount * radialSegments;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = [];

  for (let chain = 0; chain < chainCount; chain += 1) {
    const chainOffset = chain * pointCount * radialSegments;
    for (let point = 0; point < pointCount; point += 1) {
      for (let side = 0; side < radialSegments; side += 1) {
        const vertex = chainOffset + point * radialSegments + side;
        uvs[vertex * 2] = side / radialSegments;
        uvs[vertex * 2 + 1] = point / (pointCount - 1);
      }
    }
    for (let point = 0; point < pointCount - 1; point += 1) {
      const row = chainOffset + point * radialSegments;
      const next = row + radialSegments;
      for (let side = 0; side < radialSegments; side += 1) {
        const nextSide = (side + 1) % radialSegments;
        indices.push(row + side, next + side, row + nextSide);
        indices.push(row + nextSide, next + side, next + nextSide);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  geometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
  return geometry;
}

function createRibbonGeometry(chainCount, pointCount) {
  const positions = new Float32Array(chainCount * pointCount * 2 * 3);
  const uvs = new Float32Array(chainCount * pointCount * 2 * 2);
  const indices = [];

  for (let chain = 0; chain < chainCount; chain += 1) {
    const offset = chain * pointCount * 2;
    for (let point = 0; point < pointCount; point += 1) {
      const row = offset + point * 2;
      uvs[row * 2] = 0;
      uvs[row * 2 + 1] = point / (pointCount - 1);
      uvs[(row + 1) * 2] = 1;
      uvs[(row + 1) * 2 + 1] = point / (pointCount - 1);
      if (point < pointCount - 1) {
        indices.push(row, row + 2, row + 1, row + 1, row + 2, row + 3);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  return geometry;
}

function createRibGeometry() {
  const radialVertices = RIB_COUNT * RIB_SEGMENTS * 2;
  const latitudeVertices = LATITUDE_RINGS * LATITUDE_SEGMENTS * 2;
  const positions = new Float32Array((radialVertices + latitudeVertices) * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  return geometry;
}

function createFrillGeometry(hero) {
  const rows = hero ? 7 : 4;
  const segments = hero ? 96 : 48;
  const positions = new Float32Array((rows + 1) * segments * 3);
  const uvs = new Float32Array((rows + 1) * segments * 2);
  const indices = [];

  for (let row = 0; row <= rows; row += 1) {
    for (let segment = 0; segment < segments; segment += 1) {
      const vertex = row * segments + segment;
      uvs[vertex * 2] = segment / segments;
      uvs[vertex * 2 + 1] = row / rows;
      if (row < rows) {
        const nextSegment = row * segments + ((segment + 1) % segments);
        const nextRow = vertex + segments;
        const nextRowSegment = (row + 1) * segments + ((segment + 1) % segments);
        indices.push(vertex, nextRow, nextSegment, nextSegment, nextRow, nextRowSegment);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  geometry.userData.rows = rows;
  geometry.userData.segments = segments;
  return geometry;
}

function createTissueTexture(index, hero) {
  const width = hero ? 192 : 96;
  const height = hero ? 128 : 64;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    const v = y / (height - 1);
    for (let x = 0; x < width; x += 1) {
      const u = x / (width - 1);
      const warp = Math.sin(v * 17.3 + index * 1.7) * 0.035
        + Math.sin(v * 39.1 - index * 0.8) * 0.012;
      const vein = Math.pow(Math.max(0, Math.cos((u + warp) * Math.PI * 16)), 22);
      const branch = Math.pow(Math.max(0, Math.cos((u * 31 + v * 8.4 + index) * Math.PI)), 34);
      const cloud = (
        Math.sin(u * 19.2 + v * 11.7 + index * 0.7)
        + Math.sin(u * 43.4 - v * 17.1 + 1.9)
        + Math.sin((u + v) * 67.3 + index * 2.1)
      ) / 3;
      const luma = clamp(0.68 + cloud * 0.12 + vein * 0.22 + branch * 0.08, 0.42, 1);
      const offset = (y * width + x) * 4;
      data[offset] = Math.round(235 * luma);
      data[offset + 1] = Math.round(245 * luma);
      data[offset + 2] = Math.round(255 * luma);
      data[offset + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function createBellGeometry(hero, species) {
  const rings = hero ? 28 : 18;
  const segments = hero ? 72 : 42;
  const vertexCount = (rings + 1) * segments;
  const positions = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const colors = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const indices = [];
  const membrane = new THREE.Color(species.bell).lerp(new THREE.Color(0xe4fbff), hero ? 0.38 : 0.12);
  const vein = new THREE.Color(species.vein);
  const mixed = new THREE.Color();

  for (let ring = 0; ring <= rings; ring += 1) {
    const t = ring / rings;
    for (let segment = 0; segment < segments; segment += 1) {
      const vertex = ring * segments + segment;
      const angle = (segment / segments) * Math.PI * 2;
      const primaryVein = Math.pow(Math.max(0, Math.cos(angle * species.lobes + t * 2.1)), 20);
      const branchingVein = Math.pow(Math.max(0, Math.cos(angle * (species.lobes * 2) - t * 8.2)), 28);
      const cloud = Math.sin(angle * 3.1 + t * 11.7 + Math.sin(angle * 2.3) * 1.7) * 0.5 + 0.5;
      const edge = Math.pow(t, 5) * 0.24;
      const tissueMix = primaryVein * 0.28 + branchingVein * 0.12 + cloud * 0.08 + edge;
      mixed.copy(membrane).lerp(vein, clamp(tissueMix, 0, 0.56));
      colors[vertex * 3] = mixed.r;
      colors[vertex * 3 + 1] = mixed.g;
      colors[vertex * 3 + 2] = mixed.b;
      uvs[vertex * 2] = segment / segments;
      uvs[vertex * 2 + 1] = t;

      if (ring < rings) {
        const nextRing = vertex + segments;
        const nextSegment = ring * segments + ((segment + 1) % segments);
        const nextRingSegment = (ring + 1) * segments + ((segment + 1) % segments);
        indices.push(vertex, nextRing, nextSegment);
        indices.push(nextSegment, nextRing, nextRingSegment);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  geometry.attributes.normal.setUsage(THREE.DynamicDrawUsage);
  geometry.attributes.color.setUsage(THREE.DynamicDrawUsage);
  geometry.userData.rings = rings;
  geometry.userData.segments = segments;
  return geometry;
}

function makeTissueMaterial({ hero, broad = false }) {
  return new THREE.MeshPhysicalMaterial({
    color: hero ? (broad ? 0x86b7e6 : 0xffffff) : (broad ? 0x4e6f9d : 0xffffff),
    emissive: hero ? (broad ? 0x293f82 : 0x102b57) : 0x071b38,
    emissiveIntensity: hero ? (broad ? 1.05 : 0.55) : 0.24,
    roughness: broad ? 0.5 : 0.42,
    metalness: 0,
    transmission: broad ? 0.72 : 0.48,
    thickness: broad ? 0.32 : 0.09,
    iridescence: broad ? 0.34 : 0.18,
    iridescenceIOR: 1.32,
    clearcoat: 0.08,
    transparent: true,
    opacity: hero ? (broad ? 0.42 : 0.46) : (broad ? 0.2 : 0.22),
    vertexColors: !broad,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
}

export class LivingAppendages {
  constructor(medusa, index, { reducedMotion = false, fidelity = index === 0 ? "hero" : "companion" } = {}) {
    this.medusa = medusa;
    this.index = index;
    this.hero = fidelity === "hero";
    this.fidelity = fidelity;
    this.species = this.hero ? SPECIES[0] : SPECIES[1 + ((index - 1) % 3)];
    this.reducedMotion = reducedMotion;
    this.presence = 1;
    this.feature = this.hero ? 1 : 0;
    this.activation = 0;
    this.activationAge = 99;
    this.hover = 0;
    this.hoverTarget = 0;
    this.hitAngle = 0;
    this.hitPolar = 0.48;
    this.glowColor = new THREE.Color(this.species.glow);
    this.pulseRate = (this.hero ? 0.205 : 0.17) + seeded(index, 207) * 0.035;
    this.pulseOffset = seeded(index, 211);
    this.fallbackKinematics = {};
    this.delayedKinematics = {};
    this.group = new THREE.Group();
    this.group.name = this.hero ? `featured-soft-body-${index}` : `school-soft-body-${index}`;
    this.group.frustumCulled = false;

    this.bellGeometry = createBellGeometry(this.hero, this.species);
    this.baseBellColors = new Float32Array(this.bellGeometry.attributes.color.array);
    this.tissueTexture = createTissueTexture(index, this.hero);
    this.bellMaterial = new THREE.MeshPhysicalMaterial({
      color: this.species.bell,
      emissive: this.species.vein,
      emissiveIntensity: this.hero ? 0.82 : 0.3,
      roughness: 0.48,
      metalness: 0,
      sheen: this.hero ? 0.92 : 0.48,
      sheenColor: this.species.glow,
      sheenRoughness: 0.38,
      specularIntensity: this.hero ? 0.78 : 0.52,
      specularColor: 0xdffaff,
      transmission: this.hero ? 0.28 : 0.42,
      thickness: this.hero ? 0.48 : 0.32,
      attenuationColor: this.hero ? 0x746be0 : 0x407ba6,
      attenuationDistance: this.hero ? 1.35 : 1.2,
      iridescence: this.hero ? 0.46 : 0.16,
      iridescenceIOR: 1.33,
      clearcoat: 0.16,
      clearcoatRoughness: 0.62,
      transparent: true,
      opacity: this.hero ? 0.62 : 0.34,
      map: this.tissueTexture,
      emissiveMap: this.tissueTexture,
      vertexColors: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.bell = new THREE.Mesh(this.bellGeometry, this.bellMaterial);
    this.bell.renderOrder = 23;
    this.bell.frustumCulled = false;
    this.group.add(this.bell);
    this.bell.userData.livingAppendages = this;

    this.activationMaterial = new THREE.MeshBasicMaterial({
      color: this.species.glow,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.activationShell = new THREE.Mesh(this.bellGeometry, this.activationMaterial);
    this.activationShell.scale.setScalar(1.012);
    this.activationShell.renderOrder = 26;
    this.activationShell.frustumCulled = false;
    this.group.add(this.activationShell);

    this.activationNodeGeometry = new THREE.SphereGeometry(this.hero ? 0.085 : 0.065, 14, 10);
    this.activationNodeMaterial = new THREE.MeshBasicMaterial({
      color: this.species.glow,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.activationNode = new THREE.Mesh(this.activationNodeGeometry, this.activationNodeMaterial);
    this.activationNode.renderOrder = 28;
    this.group.add(this.activationNode);

    this.activationRingGeometry = new THREE.RingGeometry(0.07, 0.095, 48);
    this.activationRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xd9fbff,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.activationRing = new THREE.Mesh(this.activationRingGeometry, this.activationRingMaterial);
    this.activationRing.renderOrder = 29;
    this.group.add(this.activationRing);

    this.innerBellMaterial = new THREE.MeshBasicMaterial({
      color: this.hero ? 0x9d78ec : this.species.glow,
      transparent: true,
      opacity: this.hero ? 0.17 : 0.06,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.innerBell = new THREE.Mesh(this.bellGeometry, this.innerBellMaterial);
    this.innerBell.scale.set(0.968, 0.93, 0.968);
    this.innerBell.position.y = 0.025;
    this.innerBell.renderOrder = 19;
    this.group.add(this.innerBell);

    this.tentacleCount = this.hero ? HERO_TENTACLES : BACKGROUND_TENTACLES;
    this.tentacleSegments = this.hero ? HERO_SEGMENTS : BACKGROUND_SEGMENTS;
    this.armSegments = this.hero ? HERO_ARM_SEGMENTS : BACKGROUND_ARM_SEGMENTS;
    this.tubeSides = this.hero ? 5 : 4;

    this.tentacleChains = Array.from({ length: this.tentacleCount }, (_, chain) => {
      const angle = (chain / this.tentacleCount) * Math.PI * 2;
      const length = (this.hero ? 4.45 : 3.45) * (0.74 + seeded(chain, index + 3) * 0.5);
      const radius = 0.9 + seeded(chain, index + 9) * 0.18;
      return createChain(angle, this.tentacleSegments, length, radius, index * 31 + chain);
    });

    this.armChains = Array.from({ length: ARM_COUNT }, (_, chain) => {
      const angle = chain * Math.PI * 0.5 + Math.PI * 0.25;
      const length = (this.hero ? 3.75 : 2.8) * (0.9 + seeded(chain, index + 16) * 0.22);
      return createChain(angle, this.armSegments, length, 0.32, index * 17 + chain + 70);
    });
    this.filamentChains = this.hero
      ? Array.from({ length: FILAMENT_COUNT }, (_, chain) => {
          const angle = (chain / FILAMENT_COUNT) * Math.PI * 2 + 0.18;
          const length = 2.45 + seeded(chain, 133) * 1.15;
          return createChain(angle, FILAMENT_SEGMENTS, length, 0.2 + seeded(chain, 137) * 0.14, 170 + chain);
        })
      : [];

    this.tentacleGeometry = createTubeGeometry(
      this.tentacleCount,
      this.tentacleSegments,
      this.tubeSides,
    );
    const tentacleColors = new Float32Array(this.tentacleGeometry.attributes.position.count * 3);
    const chainVertexCount = this.tentacleSegments * this.tubeSides;
    const color = new THREE.Color();
    for (let chain = 0; chain < this.tentacleCount; chain += 1) {
      const mix = seeded(chain, index + 121);
      color.setRGB(
        THREE.MathUtils.lerp(this.hero ? 0.28 : 0.34, this.hero ? 0.48 : 0.64, mix),
        THREE.MathUtils.lerp(this.hero ? 0.62 : 0.58, this.hero ? 0.76 : 0.42, mix),
        THREE.MathUtils.lerp(0.88, 0.99, mix),
      );
      for (let vertex = 0; vertex < chainVertexCount; vertex += 1) {
        const offset = (chain * chainVertexCount + vertex) * 3;
        tentacleColors[offset] = color.r;
        tentacleColors[offset + 1] = color.g;
        tentacleColors[offset + 2] = color.b;
      }
    }
    this.tentacleGeometry.setAttribute("color", new THREE.BufferAttribute(tentacleColors, 3));
    this.tentacleMaterial = makeTissueMaterial({ hero: this.hero });
    this.tentacles = new THREE.Mesh(this.tentacleGeometry, this.tentacleMaterial);
    this.tentacles.renderOrder = 21;
    this.tentacles.frustumCulled = false;
    this.group.add(this.tentacles);

    if (this.hero) {
      this.filamentGeometry = createTubeGeometry(FILAMENT_COUNT, FILAMENT_SEGMENTS, 4);
      this.filamentMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xc5b4ff,
        emissive: 0x5b2b92,
        emissiveIntensity: 1.25,
        roughness: 0.48,
        metalness: 0,
        transmission: 0.38,
        thickness: 0.06,
        transparent: true,
        opacity: 0.48,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.filaments = new THREE.Mesh(this.filamentGeometry, this.filamentMaterial);
      this.filaments.renderOrder = 22;
      this.filaments.frustumCulled = false;
      this.group.add(this.filaments);
    }

    this.armGeometry = createRibbonGeometry(ARM_COUNT, this.armSegments);
    this.armMaterial = makeTissueMaterial({ hero: this.hero, broad: true });
    this.arms = new THREE.Mesh(this.armGeometry, this.armMaterial);
    this.arms.renderOrder = 20;
    this.arms.frustumCulled = false;
    this.group.add(this.arms);

    this.ribGeometry = createRibGeometry();
    this.ribMaterial = new THREE.LineBasicMaterial({
      color: this.hero ? 0xc6b5ff : this.species.glow,
      transparent: true,
      opacity: this.hero ? 0.038 : 0.022,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.ribs = new THREE.LineSegments(this.ribGeometry, this.ribMaterial);
    this.ribs.renderOrder = 24;
    this.ribs.frustumCulled = false;
    this.group.add(this.ribs);

    this.rimGeometry = new THREE.TorusGeometry(1, this.hero ? 0.018 : 0.012, 5, 96);
    this.rimMaterial = new THREE.MeshBasicMaterial({
      color: this.hero ? 0x9c8cff : this.species.glow,
      transparent: true,
      opacity: this.hero ? 0.3 : 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.rim = new THREE.Mesh(this.rimGeometry, this.rimMaterial);
    this.rim.rotation.x = Math.PI * 0.5;
    this.rim.renderOrder = 24;
    this.group.add(this.rim);

    this.frillGeometry = createFrillGeometry(this.hero);
    this.frillMaterial = new THREE.MeshPhysicalMaterial({
      color: this.hero ? 0x9c7bde : this.species.bell,
      emissive: this.hero ? 0x442078 : this.species.vein,
      emissiveIntensity: this.hero ? 0.78 : 0.25,
      roughness: 0.62,
      metalness: 0,
      transmission: this.hero ? 0.44 : 0.52,
      thickness: 0.16,
      transparent: true,
      opacity: this.hero ? 0.34 : 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.frill = new THREE.Mesh(this.frillGeometry, this.frillMaterial);
    this.frill.renderOrder = 22;
    this.frill.frustumCulled = false;
    this.frill.userData.livingAppendages = this;
    this.group.add(this.frill);

    this.crown = new THREE.Group();
    this.crownMaterial = new THREE.MeshBasicMaterial({
      color: this.hero ? 0xc387ff : this.species.glow,
      transparent: true,
      opacity: this.hero ? 0.11 : 0.04,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const crownRadii = this.hero ? [0.34, 0.55, 0.77, 0.98] : [0.4, 0.72];
    crownRadii.forEach((radius, ringIndex) => {
      const geometry = new THREE.TorusGeometry(
        radius,
        this.hero ? 0.018 + ringIndex * 0.004 : 0.014,
        5,
        this.hero ? 96 : 48,
      );
      const ring = new THREE.Mesh(geometry, this.crownMaterial);
      ring.rotation.x = Math.PI * 0.5;
      ring.position.y = 0.28 - ringIndex * 0.075;
      ring.scale.z = 0.94 + ringIndex * 0.025;
      ring.renderOrder = 25;
      this.crown.add(ring);
    });
    this.group.add(this.crown);

    this.organGeometry = new THREE.SphereGeometry(0.18, this.hero ? 20 : 12, this.hero ? 14 : 9);
    this.organMaterial = new THREE.MeshPhysicalMaterial({
      color: this.hero ? 0xe9c38a : this.species.bell,
      emissive: this.hero ? 0xb66c2c : this.species.vein,
      emissiveIntensity: this.hero ? 1.15 : 0.42,
      roughness: 0.5,
      metalness: 0,
      transmission: 0.58,
      thickness: 0.4,
      transparent: true,
      opacity: this.hero ? 0.52 : 0.2,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.organs = new THREE.Group();
    for (let organ = 0; organ < 4; organ += 1) {
      const angle = organ * Math.PI * 0.5 + Math.PI * 0.25;
      const mesh = new THREE.Mesh(this.organGeometry, this.organMaterial);
      mesh.position.set(Math.cos(angle) * 0.3, 0.34, Math.sin(angle) * 0.3);
      mesh.scale.set(1.25, 0.38, 0.72);
      mesh.rotation.y = -angle;
      this.organs.add(mesh);
    }
    this.organs.renderOrder = 22;
    this.group.add(this.organs);

    if (this.hero) {
      this.pearlGeometry = new THREE.SphereGeometry(0.024, 8, 6);
      this.pearlMaterial = new THREE.MeshBasicMaterial({
        color: 0xffd27f,
        transparent: true,
        opacity: 0.7,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.pearlsPerArm = 7;
      this.signalPearls = new THREE.InstancedMesh(
        this.pearlGeometry,
        this.pearlMaterial,
        ARM_COUNT * this.pearlsPerArm,
      );
      this.signalPearls.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      this.signalPearls.renderOrder = 27;
      this.signalPearls.frustumCulled = false;
      this.group.add(this.signalPearls);
    }

    if (this.hero) {
      this.tissueLight = new THREE.PointLight(0x5abfff, 3.6, 5.5, 2);
      this.tissueLight.position.set(0, 0.16, 0.2);
      this.group.add(this.tissueLight);
    }

    if (this.hero) {
      const haloCount = 900;
      const haloPositions = new Float32Array(haloCount * 3);
      for (let particle = 0; particle < haloCount; particle += 1) {
        const angle = seeded(particle, 83) * Math.PI * 2;
        const radius = Math.pow(seeded(particle, 89), 0.58) * 3.1;
        const vertical = (seeded(particle, 97) - 0.56) * 5.8;
        haloPositions[particle * 3] = Math.cos(angle) * radius;
        haloPositions[particle * 3 + 1] = vertical;
        haloPositions[particle * 3 + 2] = Math.sin(angle) * radius * 0.68;
      }
      this.haloGeometry = new THREE.BufferGeometry();
      this.haloGeometry.setAttribute("position", new THREE.BufferAttribute(haloPositions, 3));
      this.haloMaterial = new THREE.PointsMaterial({
        color: 0xb6a2ff,
        size: 0.019,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.halo = new THREE.Points(this.haloGeometry, this.haloMaterial);
      this.halo.renderOrder = 18;
      this.group.add(this.halo);
    }

    this.baseVisuals = {
      bellEmissive: this.bellMaterial.emissiveIntensity,
      bellOpacity: this.bellMaterial.opacity,
      innerOpacity: this.innerBellMaterial.opacity,
      tentacleEmissive: this.tentacleMaterial.emissiveIntensity,
      tentacleOpacity: this.tentacleMaterial.opacity,
      armEmissive: this.armMaterial.emissiveIntensity,
      armOpacity: this.armMaterial.opacity,
      filamentEmissive: this.filamentMaterial?.emissiveIntensity ?? 0,
      filamentOpacity: this.filamentMaterial?.opacity ?? 0,
      ribOpacity: this.ribMaterial.opacity,
      rimOpacity: this.rimMaterial.opacity,
      frillEmissive: this.frillMaterial.emissiveIntensity,
      frillOpacity: this.frillMaterial.opacity,
      crownOpacity: this.crownMaterial.opacity,
      organEmissive: this.organMaterial.emissiveIntensity,
      organOpacity: this.organMaterial.opacity,
      pearlOpacity: this.pearlMaterial?.opacity ?? 0,
      haloOpacity: this.haloMaterial?.opacity ?? 0,
    };

    this.interactionMeshes = [this.bell, this.frill];

    this.inverseMatrix = new THREE.Matrix4();
    this.localRay = new THREE.Ray();
    this.closestPoint = new THREE.Vector3();
    this.away = new THREE.Vector3();
    this.delta = new THREE.Vector3();
    this.velocity = new THREE.Vector3();
    this.tangent = new THREE.Vector3();
    this.side = new THREE.Vector3();
    this.binormal = new THREE.Vector3();
    this.normal = new THREE.Vector3();
    this.anchor = new THREE.Vector3();
    this.armSide = new THREE.Vector3();
    this.armAxis = new THREE.Vector3();
    this.bodyDelta = new THREE.Vector3();
    this.lastBodyPosition = new THREE.Vector3();
    this.inverseQuaternion = new THREE.Quaternion();
    this.hitLocal = new THREE.Vector3();
    this.recoilDirection = new THREE.Vector3();
    this.hitNormal = new THREE.Vector3(0, 1, 0);
    this.pearlMatrix = new THREE.Matrix4();
    this.pearlQuaternion = new THREE.Quaternion();
    this.pearlScale = new THREE.Vector3();
    this.bodyInitialized = false;
    this.deformAccumulator = 0;
    this.deformFrame = 0;
    this.deformOffset = index % 2;
  }

  getInteractionMeshes() {
    return this.interactionMeshes;
  }

  setHovered(hovered) {
    this.hoverTarget = hovered ? 1 : 0;
  }

  setPresence(presence, feature = 0) {
    this.presence = clamp(presence, 0, 1);
    this.feature = clamp(feature, 0, 1);
    this.group.visible = true;
  }

  activate(worldPoint, strength = 1) {
    this.group.updateMatrixWorld(true);
    this.inverseMatrix.copy(this.group.matrixWorld).invert();
    this.hitLocal.copy(worldPoint).applyMatrix4(this.inverseMatrix);
    this.hitAngle = Math.atan2(this.hitLocal.z, this.hitLocal.x);
    const radial = Math.sqrt(this.hitLocal.x ** 2 + this.hitLocal.z ** 2);
    this.hitPolar = clamp(Math.atan2(radial, Math.max(0.001, this.hitLocal.y)) / (Math.PI * 0.5), 0, 1);
    const activationStrength = clamp(strength, 0.05, 1);
    this.activation = Math.max(this.activation, activationStrength);
    this.activationAge = 0;
    this.activationNode.position.copy(this.hitLocal);
    const hitRadius = Math.max(0.001, Math.hypot(this.hitLocal.x, this.hitLocal.z));
    this.hitNormal.set(
      (this.hitLocal.x / hitRadius) * 0.62,
      0.78,
      (this.hitLocal.z / hitRadius) * 0.62,
    ).normalize();
    this.activationRing.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), this.hitNormal);

    if (this.reducedMotion) return;

    const chains = [...this.tentacleChains, ...this.armChains, ...this.filamentChains];
    chains.forEach((chain) => {
      const angularFalloff = Math.exp(-Math.pow(angularDistance(chain.angle, this.hitAngle) / 0.82, 2));
      chain.particles.forEach((particle, pointIndex) => {
        if (pointIndex === 0) return;
        const t = pointIndex / (chain.particles.length - 1);
        const lengthFalloff = Math.exp(-t * 2.4);
        const impulse = (this.hero ? 0.12 : 0.18) * angularFalloff * lengthFalloff * activationStrength;
        this.recoilDirection.set(
          Math.cos(chain.angle) * 0.72,
          -0.32 - t * 0.18,
          Math.sin(chain.angle) * 0.72,
        ).normalize();
        particle.previous.addScaledVector(this.recoilDirection, -impulse);
      });
    });
  }

  getBellShape(elapsed) {
    const cycle = elapsed * this.pulseRate + this.pulseOffset;
    const kinematics = this.medusa.swimKinematics
      || sampleSwimCycle(cycle, this.fallbackKinematics);
    const pulse = kinematics.bell;
    const activeKick = this.activation * Math.max(0, Math.sin(this.activationAge * 7.8))
      * Math.exp(-this.activationAge * 0.75);
    const baseRadius = this.species.radius;
    const baseHeight = this.species.height;
    return {
      pulse,
      cycle: kinematics.cycle,
      phase: kinematics.phase,
      contraction: kinematics.contraction,
      refill: kinematics.refill,
      primaryThrust: kinematics.primaryThrust,
      secondaryThrust: kinematics.secondaryThrust,
      coast: kinematics.coast,
      marginRoll: kinematics.marginRoll,
      activeKick,
      radius: baseRadius * (1 - pulse * 0.19 - activeKick * 0.075),
      height: baseHeight * (1 + pulse * 0.22 + activeKick * 0.1),
      rimY: 0.025 + pulse * 0.085 + kinematics.marginRoll * 0.03 + activeKick * 0.045,
    };
  }

  anchorChain(chain, shape, arm = false) {
    const radius = shape.radius * chain.radius * (arm ? 1 : 0.91);
    this.anchor.set(
      Math.cos(chain.angle) * radius,
      shape.rimY + (arm ? 0.12 : 0),
      Math.sin(chain.angle) * radius,
    );
    chain.particles[0].position.copy(this.anchor);
    chain.particles[0].previous.copy(this.anchor);
  }

  simulateChains(chains, shape, deltaTime, elapsed, current, pointerRay, pointerStrength, arm) {
    const frameScale = clamp(deltaTime * 60, 0.3, 1.6);
    const damping = Math.pow(arm ? 0.955 : 0.968, frameScale);
    const gravity = (arm ? 0.0013 : 0.00072) * frameScale * frameScale;
    const currentScale = (arm ? 0.012 : 0.009) * frameScale * frameScale;
    const repulsorRadius = this.hero ? 0.92 : 0.58;
    const repulsorScale = (this.hero ? 0.075 : 0.025) * pointerStrength;

    chains.forEach((chain) => {
      this.anchorChain(chain, shape, arm);

      for (let pointIndex = 1; pointIndex < chain.particles.length; pointIndex += 1) {
        const particle = chain.particles[pointIndex];
        const t = pointIndex / (chain.particles.length - 1);
        this.velocity.copy(particle.position).sub(particle.previous).multiplyScalar(damping);
        particle.previous.copy(particle.position);
        particle.position.add(this.velocity);
        particle.position.y -= gravity * (0.55 + t * 0.8);
        particle.position.x += current.x * currentScale * t * t;
        particle.position.z += current.y * currentScale * t * t;

        const flow = Math.sin(elapsed * 0.52 + chain.seed * 0.71 + t * 8.4);
        const eddy = Math.cos(elapsed * 0.37 + chain.seed * 1.13 + t * 5.7);
        const lateral = 0.0052 * chain.drift * Math.pow(t, 1.32) * frameScale;
        particle.position.x += Math.cos(chain.angle + Math.PI * 0.5) * flow * lateral;
        particle.position.z += Math.sin(chain.angle + Math.PI * 0.5) * flow * lateral;
        particle.position.x += Math.cos(chain.angle) * eddy * lateral * 0.48;
        particle.position.z += Math.sin(chain.angle) * eddy * lateral * 0.48;

        if (pointerRay && pointerStrength > 0.01) {
          const distance = pointerRay.distanceToPoint(particle.position);
          if (distance < repulsorRadius) {
            pointerRay.closestPointToPoint(particle.position, this.closestPoint);
            this.away.copy(particle.position).sub(this.closestPoint);
            if (this.away.lengthSq() < 0.00001) this.away.set(1, 0, 0);
            const falloff = 1 - distance / repulsorRadius;
            particle.position.addScaledVector(this.away.normalize(), repulsorScale * falloff * falloff);
          }
        }
      }

      const iterations = arm ? 5 : 4;
      for (let iteration = 0; iteration < iterations; iteration += 1) {
        this.anchorChain(chain, shape, arm);
        for (let pointIndex = 1; pointIndex < chain.particles.length; pointIndex += 1) {
          const parent = chain.particles[pointIndex - 1].position;
          const particle = chain.particles[pointIndex].position;
          this.delta.copy(particle).sub(parent);
          const distance = Math.max(0.0001, this.delta.length());
          const correction = (distance - chain.restLength) / distance;
          if (pointIndex === 1) {
            particle.addScaledVector(this.delta, -correction);
          } else {
            parent.addScaledVector(this.delta, correction * 0.46);
            particle.addScaledVector(this.delta, -correction * 0.54);
          }
        }
      }

      this.anchorChain(chain, shape, arm);
    });
  }

  updateTubeGeometry(chains, geometry, tubeSides, baseWidth) {
    const positions = geometry.attributes.position.array;
    const normals = geometry.attributes.normal.array;
    let pointer = 0;

    chains.forEach((chain) => {
      chain.particles.forEach((particle, pointIndex) => {
        const previous = chain.particles[Math.max(0, pointIndex - 1)].position;
        const next = chain.particles[Math.min(chain.particles.length - 1, pointIndex + 1)].position;
        this.tangent.copy(next).sub(previous).normalize();
        const reference = Math.abs(this.tangent.y) > 0.88 ? X_AXIS : Y_AXIS;
        this.side.crossVectors(this.tangent, reference).normalize();
        this.binormal.crossVectors(this.tangent, this.side).normalize();
        const t = pointIndex / (chain.particles.length - 1);
        const width = (this.hero ? 0.027 : 0.018) * Math.pow(1 - t, 0.62) + 0.002;

        for (let sideIndex = 0; sideIndex < tubeSides; sideIndex += 1) {
          const angle = (sideIndex / tubeSides) * Math.PI * 2;
          this.normal.copy(this.side).multiplyScalar(Math.cos(angle));
          this.normal.addScaledVector(this.binormal, Math.sin(angle)).normalize();
          positions[pointer] = particle.position.x + this.normal.x * width * baseWidth;
          normals[pointer++] = this.normal.x;
          positions[pointer] = particle.position.y + this.normal.y * width * baseWidth;
          normals[pointer++] = this.normal.y;
          positions[pointer] = particle.position.z + this.normal.z * width * baseWidth;
          normals[pointer++] = this.normal.z;
        }
      });
    });

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }

  updateTentacleGeometry() {
    this.updateTubeGeometry(this.tentacleChains, this.tentacleGeometry, this.tubeSides, 1);
    if (this.filamentGeometry) {
      this.updateTubeGeometry(this.filamentChains, this.filamentGeometry, 4, 0.55);
    }
  }

  updateArmGeometry(elapsed, refreshNormals = true) {
    const positions = this.armGeometry.attributes.position.array;
    let pointer = 0;

    this.armChains.forEach((chain, chainIndex) => {
      this.armSide.set(-Math.sin(chain.angle), 0, Math.cos(chain.angle));
      this.armAxis.set(Math.cos(chain.angle), 0, Math.sin(chain.angle));
      chain.particles.forEach((particle, pointIndex) => {
        const t = pointIndex / (chain.particles.length - 1);
        const scallop = 0.78
          + Math.sin(t * 18 + chainIndex * 1.7 + elapsed * 0.42) * 0.18
          + Math.sin(t * 39 - elapsed * 0.26 + chain.seed) * 0.07;
        const width = (this.hero ? 0.39 : 0.2) * Math.pow(1 - t, 0.66) * scallop + 0.008;
        const twist = Math.sin(t * 7.4 + elapsed * 0.28 + chain.seed) * 0.46;
        const flutter = Math.sin(t * 10.2 + elapsed * 0.36 + chainIndex * 2.1)
          * Math.pow(t, 1.15) * (this.hero ? 0.115 : 0.06);
        this.side.copy(this.armSide).applyAxisAngle(this.armAxis, twist).normalize();

        positions[pointer++] = particle.position.x + this.armSide.x * flutter - this.side.x * width;
        positions[pointer++] = particle.position.y + this.armSide.y * flutter - this.side.y * width;
        positions[pointer++] = particle.position.z + this.armSide.z * flutter - this.side.z * width;
        positions[pointer++] = particle.position.x + this.armSide.x * flutter + this.side.x * width;
        positions[pointer++] = particle.position.y + this.armSide.y * flutter + this.side.y * width;
        positions[pointer++] = particle.position.z + this.armSide.z * flutter + this.side.z * width;
      });
    });

    this.armGeometry.attributes.position.needsUpdate = true;
    if (refreshNormals) this.armGeometry.computeVertexNormals();
  }

  updateSignalPearls(elapsed) {
    if (!this.signalPearls) return;
    let instance = 0;
    this.armChains.forEach((chain, chainIndex) => {
      for (let pearl = 0; pearl < this.pearlsPerArm; pearl += 1) {
        const t = 0.2 + (pearl / (this.pearlsPerArm - 1)) * 0.63;
        const pointIndex = Math.min(chain.particles.length - 1, Math.round(t * (chain.particles.length - 1)));
        const position = chain.particles[pointIndex].position;
        const breath = 0.72 + Math.sin(elapsed * 1.4 + pearl * 0.9 + chainIndex) * 0.18;
        this.pearlScale.setScalar(breath);
        this.pearlMatrix.compose(position, this.pearlQuaternion, this.pearlScale);
        this.signalPearls.setMatrixAt(instance, this.pearlMatrix);
        instance += 1;
      }
    });
    this.signalPearls.instanceMatrix.needsUpdate = true;
  }

  updateBellDetails(shape) {
    const positions = this.ribGeometry.attributes.position.array;
    let pointer = 0;

    for (let rib = 0; rib < RIB_COUNT; rib += 1) {
      const angle = (rib / RIB_COUNT) * Math.PI * 2;
      for (let segment = 0; segment < RIB_SEGMENTS; segment += 1) {
        for (let endpoint = 0; endpoint < 2; endpoint += 1) {
          const t = (segment + endpoint) / RIB_SEGMENTS;
          const polar = t * Math.PI * 0.5;
          const ripple = 1 + Math.sin(angle * this.species.lobes + t * 7) * 0.012 * t * t;
          const radial = Math.sin(polar) * shape.radius * 1.012 * ripple;
          const warpedAngle = angle + Math.sin(t * Math.PI) * Math.sin(angle * (this.species.lobes * 0.5)) * 0.035;
          positions[pointer++] = Math.cos(warpedAngle) * radial;
          positions[pointer++] = Math.pow(Math.max(0, Math.cos(polar)), 0.62) * shape.height + 0.015;
          positions[pointer++] = Math.sin(warpedAngle) * radial;
        }
      }
    }
    for (let ring = 1; ring <= LATITUDE_RINGS; ring += 1) {
      const t = (ring / (LATITUDE_RINGS + 1)) * 0.94;
      const polar = t * Math.PI * 0.5;
      for (let segment = 0; segment < LATITUDE_SEGMENTS; segment += 1) {
        for (let endpoint = 0; endpoint < 2; endpoint += 1) {
          const angle = ((segment + endpoint) / LATITUDE_SEGMENTS) * Math.PI * 2;
          const ripple = 1 + Math.sin(angle * this.species.lobes + t * 7) * 0.012 * t * t;
          const radial = Math.sin(polar) * shape.radius * 1.014 * ripple;
          positions[pointer++] = Math.cos(angle) * radial;
          positions[pointer++] = Math.pow(Math.max(0, Math.cos(polar)), 0.62) * shape.height + 0.015;
          positions[pointer++] = Math.sin(angle) * radial;
        }
      }
    }
    this.ribGeometry.attributes.position.needsUpdate = true;
    this.rim.position.y = shape.rimY;
    this.rim.scale.setScalar(shape.radius);
    const crownBreath = (shape.radius / this.species.radius) * (0.98 + shape.pulse * 0.045);
    this.crown.scale.set(crownBreath, 0.96 + shape.pulse * 0.08, crownBreath);
    const organBreath = 0.9 + shape.pulse * 0.18;
    this.organs.scale.set(organBreath, 1 - shape.pulse * 0.08, organBreath);
  }

  updateBellSurface(shape, elapsed, current, refreshNormals = true) {
    const positions = this.bellGeometry.attributes.position.array;
    const colors = this.bellGeometry.attributes.color.array;
    const { rings, segments } = this.bellGeometry.userData;
    let pointer = 0;
    let colorPointer = 0;
    for (let ring = 0; ring <= rings; ring += 1) {
      const t = ring / rings;
      const polar = t * Math.PI * 0.5;
      const delayed = sampleSwimCycle(shape.cycle - t * 0.105, this.delayedKinematics);
      const delayedPulse = delayed.bell;
      const radiusPulse = 1 - delayedPulse * 0.105 * t;
      const heightPulse = 1 + delayedPulse * 0.065 * (1 - t);
      for (let segment = 0; segment < segments; segment += 1) {
        const angle = (segment / segments) * Math.PI * 2;
        const scallop = 1 + Math.sin(angle * this.species.lobes + Math.PI * 0.5)
          * (this.hero ? 0.03 : 0.024) * Math.pow(t, 4.3);
        const tissueNoise = (
          Math.sin(angle * 3 + t * 9 + elapsed * 0.16 + this.index) * 0.006
          + Math.sin(angle * 7.2 - t * 13 + elapsed * 0.09) * 0.0035
        ) * t;
        const asymmetry = Math.sin(angle * 2 + elapsed * 0.12 + this.index * 1.7) * 0.018 * t;
        const surfaceDistance = Math.sqrt(
          Math.pow(angularDistance(angle, this.hitAngle) / Math.PI, 2) * 0.62
          + Math.pow(t - this.hitPolar, 2),
        );
        const waveFront = this.activationAge * 0.48;
        const wave = Math.exp(-Math.pow((surfaceDistance - waveFront) / 0.075, 2)) * this.activation;
        const radial = Math.sin(polar) * shape.radius * radiusPulse * scallop
          + tissueNoise + asymmetry + wave * (this.hero ? 0.035 : 0.055);
        const canopy = Math.pow(Math.max(0, Math.cos(polar)), 0.62) * shape.height * heightPulse;
        const rimLoop = Math.pow(t, 5.4) * delayed.marginRoll * 0.09;
        const rimFold = Math.pow(t, 6) * Math.sin(angle * this.species.lobes + Math.PI * 0.5) * 0.045;
        const currentShear = t * t * (this.hero ? 0.11 : 0.16);
        positions[pointer++] = Math.cos(angle) * radial + current.x * currentShear;
        positions[pointer++] = canopy + shape.rimY * t + rimFold + rimLoop - wave * 0.018;
        positions[pointer++] = Math.sin(angle) * radial + current.y * currentShear;

        const light = clamp(wave * 1.6 + this.activation * 0.08 + this.hover * 0.035, 0, 1);
        colors[colorPointer] = THREE.MathUtils.lerp(this.baseBellColors[colorPointer], this.glowColor.r, light);
        colorPointer += 1;
        colors[colorPointer] = THREE.MathUtils.lerp(this.baseBellColors[colorPointer], this.glowColor.g, light);
        colorPointer += 1;
        colors[colorPointer] = THREE.MathUtils.lerp(this.baseBellColors[colorPointer], this.glowColor.b, light);
        colorPointer += 1;
      }
    }
    this.bellGeometry.attributes.position.needsUpdate = true;
    this.bellGeometry.attributes.color.needsUpdate = true;
    if (refreshNormals) this.bellGeometry.computeVertexNormals();
  }

  updateFrill(shape, elapsed, refreshNormals = true) {
    const positions = this.frillGeometry.attributes.position.array;
    const { rows, segments } = this.frillGeometry.userData;
    let pointer = 0;
    for (let row = 0; row <= rows; row += 1) {
      const t = row / rows;
      for (let segment = 0; segment < segments; segment += 1) {
        const angle = (segment / segments) * Math.PI * 2;
        const lobe = Math.sin(angle * this.species.lobes + elapsed * 0.34)
          * (0.025 + t * 0.055);
        const fineFold = Math.sin(angle * this.species.lobes * 2 - elapsed * 0.2) * t * 0.018;
        const radius = shape.radius * (0.985 - t * 0.085) + lobe + fineFold;
        const twist = Math.sin(angle * 4 + elapsed * 0.17) * t * 0.035;
        positions[pointer++] = Math.cos(angle + twist) * radius;
        positions[pointer++] = shape.rimY - t * (this.hero ? 0.34 : 0.24) - Math.abs(lobe) * 0.42;
        positions[pointer++] = Math.sin(angle + twist) * radius;
      }
    }
    this.frillGeometry.attributes.position.needsUpdate = true;
    if (refreshNormals) this.frillGeometry.computeVertexNormals();
  }

  updateVisualResponse(deltaTime, shape) {
    const hoverDamping = 1 - Math.exp(-deltaTime * 9);
    this.hover += (this.hoverTarget - this.hover) * hoverDamping;
    this.activationAge += deltaTime;
    this.activation *= Math.exp(-deltaTime * (this.reducedMotion ? 0.72 : 0.52));
    if (this.activation < 0.001) this.activation = 0;

    const response = clamp(this.activation + this.hover * 0.13, 0, 1.15);
    const anatomy = clamp(this.activation * 0.82 + shape.activeKick * 0.45, 0, 1.25);
    const visibility = 0.12 + this.presence * 0.88;
    const featureLight = this.feature * (this.hero ? 0.24 : 0.16);
    this.bellMaterial.emissiveIntensity = (this.baseVisuals.bellEmissive + response * (this.hero ? 0.72 : 1.35)) * visibility + featureLight;
    this.bellMaterial.opacity = clamp((this.baseVisuals.bellOpacity + response * 0.055) * visibility, 0, 0.74);
    this.innerBellMaterial.opacity = (this.baseVisuals.innerOpacity + anatomy * (this.hero ? 0.13 : 0.12)) * visibility;
    this.activationMaterial.opacity = this.activation * (this.hero ? 0.045 : 0.12) * visibility;
    this.tentacleMaterial.emissiveIntensity = (this.baseVisuals.tentacleEmissive + anatomy * 1.35) * visibility + featureLight * 0.5;
    this.tentacleMaterial.opacity = clamp((this.baseVisuals.tentacleOpacity + anatomy * 0.12) * visibility, 0, 0.7);
    this.armMaterial.emissiveIntensity = (this.baseVisuals.armEmissive + anatomy * 1.15) * visibility + featureLight * 0.4;
    this.armMaterial.opacity = clamp((this.baseVisuals.armOpacity + anatomy * 0.15) * visibility, 0, 0.72);
    this.ribMaterial.opacity = (this.baseVisuals.ribOpacity + response * (this.hero ? 0.2 : 0.16)) * visibility;
    this.rimMaterial.opacity = (this.baseVisuals.rimOpacity + response * (this.hero ? 0.36 : 0.3)) * visibility;
    this.frillMaterial.emissiveIntensity = (this.baseVisuals.frillEmissive + anatomy * 1.55) * visibility;
    this.frillMaterial.opacity = clamp((this.baseVisuals.frillOpacity + anatomy * 0.16) * visibility, 0, 0.68);
    this.crownMaterial.opacity = (this.baseVisuals.crownOpacity + anatomy * (this.hero ? 0.32 : 0.22)) * visibility;
    this.organMaterial.emissiveIntensity = (this.baseVisuals.organEmissive + anatomy * 2.1) * visibility + featureLight;
    this.organMaterial.opacity = clamp((this.baseVisuals.organOpacity + anatomy * 0.17) * visibility, 0, 0.78);
    if (this.pearlMaterial) {
      this.pearlMaterial.opacity = clamp((this.baseVisuals.pearlOpacity + anatomy * 0.24) * visibility, 0, 0.96);
    }

    if (this.filamentMaterial) {
      this.filamentMaterial.emissiveIntensity = this.baseVisuals.filamentEmissive + anatomy * 1.65;
      this.filamentMaterial.opacity = clamp((this.baseVisuals.filamentOpacity + anatomy * 0.16) * visibility, 0, 0.78);
    }

    const nodePolar = this.hitPolar * Math.PI * 0.5;
    const nodeRadius = Math.sin(nodePolar) * shape.radius * 1.015;
    this.activationNode.position.set(
      Math.cos(this.hitAngle) * nodeRadius,
      Math.pow(Math.max(0, Math.cos(nodePolar)), 0.62) * shape.height + shape.rimY * this.hitPolar,
      Math.sin(this.hitAngle) * nodeRadius,
    );
    const nodeFlash = this.activation * Math.exp(-this.activationAge * 1.1);
    this.activationNodeMaterial.opacity = nodeFlash * 0.88;
    this.activationNode.scale.setScalar(1 + Math.min(this.activationAge, 1.5) * 2.1);
    this.activationRing.position.copy(this.activationNode.position).addScaledVector(this.hitNormal, 0.012);
    this.activationRingMaterial.opacity = nodeFlash * 0.72;
    this.activationRing.scale.setScalar(1 + Math.min(this.activationAge, 1.3) * (this.hero ? 7.5 : 5.2));

    if (this.halo) {
      this.haloMaterial.opacity = (this.baseVisuals.haloOpacity + anatomy * 0.2 + this.feature * 0.05) * visibility;
      this.haloMaterial.size = 0.019 + anatomy * 0.016;
      this.halo.scale.setScalar(1 + anatomy * 0.045);
    }
    if (this.tissueLight) {
      this.tissueLight.position.lerp(this.activationNode.position, 0.12);
      this.tissueLight.intensity = 3 + shape.pulse * 1.35 + anatomy * 2.8;
    }
  }

  update(
    deltaTime,
    elapsed,
    current,
    worldRay = null,
    pointerStrength = 0,
    interactionMode = false,
  ) {
    const active = this.presence > 0.008;
    this.group.visible = true;
    if (!active) {
      this.group.position.copy(this.medusa.transformationObject.position);
      this.group.quaternion.copy(this.medusa.transformationObject.quaternion);
      this.group.scale.setScalar(0.00001);
      this.group.updateMatrixWorld(true);
      this.bodyInitialized = false;
      this.deformAccumulator = 0;
      return;
    }
    const wasBodyInitialized = this.bodyInitialized;
    if (this.bodyInitialized) {
      this.bodyDelta.copy(this.medusa.transformationObject.position).sub(this.lastBodyPosition);
      if (this.bodyDelta.lengthSq() > 0.04) this.bodyDelta.set(0, 0, 0);
      this.inverseQuaternion.copy(this.medusa.transformationObject.quaternion).invert();
      this.bodyDelta.applyQuaternion(this.inverseQuaternion);
      const scale = Math.max(0.001, this.medusa.transformationObject.scale.x);
      this.bodyDelta.multiplyScalar(1 / scale);
      [...this.tentacleChains, ...this.armChains, ...this.filamentChains].forEach((chain) => {
        chain.particles.forEach((particle, pointIndex) => {
          if (pointIndex === 0) return;
          const t = pointIndex / (chain.particles.length - 1);
          particle.position.addScaledVector(this.bodyDelta, -0.72 * t);
          particle.previous.addScaledVector(this.bodyDelta, -0.34 * t);
        });
      });
    }
    this.lastBodyPosition.copy(this.medusa.transformationObject.position);
    this.bodyInitialized = true;

    this.group.position.copy(this.medusa.transformationObject.position);
    this.group.quaternion.copy(this.medusa.transformationObject.quaternion);
    this.group.scale.copy(this.medusa.transformationObject.scale);
    this.group.updateMatrixWorld(true);

    let pointerRay = null;
    if (worldRay && pointerStrength > 0.01) {
      this.inverseMatrix.copy(this.group.matrixWorld).invert();
      this.localRay.copy(worldRay).applyMatrix4(this.inverseMatrix);
      pointerRay = this.localRay;
    }

    const shape = this.getBellShape(elapsed);
    this.updateVisualResponse(deltaTime, shape);
    this.deformAccumulator += deltaTime;
    this.deformFrame += 1;
    const foregroundMotion = this.feature > 0.45 || this.activation > 0.01 || this.hover > 0.01;
    const deformStride = foregroundMotion ? 1 : interactionMode ? 3 : 2;
    const shouldDeform = !wasBodyInitialized
      || (this.deformFrame + this.deformOffset) % deformStride === 0;
    if (!shouldDeform) {
      if (this.halo) {
        this.halo.rotation.y = elapsed * 0.018;
        this.halo.rotation.z = Math.sin(elapsed * 0.08) * 0.035;
      }
      return;
    }
    const deformDelta = Math.min(this.deformAccumulator, 1 / 24);
    this.deformAccumulator = 0;
    const refreshNormals = foregroundMotion || (!interactionMode && this.deformFrame % 4 === 0);
    this.simulateChains(
      this.tentacleChains,
      shape,
      deformDelta,
      elapsed,
      current,
      pointerRay,
      pointerStrength,
      false,
    );
    this.simulateChains(
      this.armChains,
      shape,
      deformDelta,
      elapsed,
      current,
      pointerRay,
      pointerStrength,
      true,
    );
    if (this.filamentChains.length) {
      this.simulateChains(
        this.filamentChains,
        shape,
        deformDelta,
        elapsed,
        current,
        pointerRay,
        pointerStrength,
        false,
      );
    }
    this.updateTentacleGeometry();
    this.updateArmGeometry(elapsed, refreshNormals);
    this.updateSignalPearls(elapsed);
    this.updateBellDetails(shape);
    this.updateBellSurface(shape, elapsed, current, refreshNormals);
    this.updateFrill(shape, elapsed, refreshNormals);
    if (this.halo) {
      this.halo.rotation.y = elapsed * 0.018;
      this.halo.rotation.z = Math.sin(elapsed * 0.08) * 0.035;
    }
  }

  dispose() {
    this.armGeometry.dispose();
    this.armMaterial.dispose();
    this.tentacleGeometry.dispose();
    this.tentacleMaterial.dispose();
    this.filamentGeometry?.dispose();
    this.filamentMaterial?.dispose();
    this.ribGeometry.dispose();
    this.ribMaterial.dispose();
    this.rimGeometry.dispose();
    this.rimMaterial.dispose();
    this.frillGeometry.dispose();
    this.frillMaterial.dispose();
    this.crown.children.forEach((ring) => ring.geometry.dispose());
    this.crownMaterial.dispose();
    this.organGeometry.dispose();
    this.organMaterial.dispose();
    this.pearlGeometry?.dispose();
    this.pearlMaterial?.dispose();
    this.bellGeometry.dispose();
    this.tissueTexture.dispose();
    this.bellMaterial.dispose();
    this.activationMaterial.dispose();
    this.activationNodeGeometry.dispose();
    this.activationNodeMaterial.dispose();
    this.activationRingGeometry.dispose();
    this.activationRingMaterial.dispose();
    this.innerBellMaterial.dispose();
    this.haloGeometry?.dispose();
    this.haloMaterial?.dispose();
    this.group.removeFromParent();
  }
}
