import * as THREE from "three/webgpu";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const FLOOR_Y = -5.45;
const BLADE_COUNT = 54;
const BLADE_SEGMENTS = 12;

function seeded(index, salt = 0) {
  const value = Math.sin(index * 91.73 + salt * 37.11) * 43758.5453;
  return value - Math.floor(value);
}

function terrainHeight(x, z) {
  return (
    Math.sin(x * 0.31 + z * 0.17) * 0.24 +
    Math.sin(x * 0.73 - z * 0.22) * 0.11 +
    Math.cos(z * 0.41) * 0.08
  );
}

function orientCylinder(mesh, start, end) {
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  mesh.position.copy(midpoint);
  mesh.scale.y = direction.length();
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
}

function makeBladeGeometry() {
  const positions = new Float32Array(BLADE_COUNT * (BLADE_SEGMENTS + 1) * 2 * 3);
  const indices = [];

  for (let blade = 0; blade < BLADE_COUNT; blade += 1) {
    const offset = blade * (BLADE_SEGMENTS + 1) * 2;
    for (let segment = 0; segment < BLADE_SEGMENTS; segment += 1) {
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

export class ReefEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = "living-reef";
    this.geometries = new Set();
    this.materials = new Set();
    this.lights = [];
    this.disposed = false;
    scene.add(this.group);

    this.createFloor();
    this.createRocks();
    this.loadSpecimenCoral();
    this.createSeaGrass();
    this.createReefLight();
  }

  track(geometry, material) {
    this.geometries.add(geometry);
    this.materials.add(material);
  }

  createFloor() {
    const geometry = new THREE.PlaneGeometry(34, 25, 56, 40);
    const position = geometry.attributes.position;
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const localZ = -position.getY(index) - 8;
      position.setZ(index, terrainHeight(x, localZ));
    }
    geometry.computeVertexNormals();
    geometry.rotateX(-Math.PI * 0.5);

    const colors = new Float32Array(position.count * 3);
    const deep = new THREE.Color(0x020e16);
    const shelf = new THREE.Color(0x0a3038);
    const mixed = new THREE.Color();
    for (let index = 0; index < position.count; index += 1) {
      const x = position.getX(index);
      const localZ = -position.getY(index) - 8;
      const variation = 0.22 + (Math.sin(x * 0.6) * Math.cos(localZ * 0.43) + 1) * 0.16;
      mixed.copy(deep).lerp(shelf, variation);
      colors[index * 3] = mixed.r;
      colors[index * 3 + 1] = mixed.g;
      colors[index * 3 + 2] = mixed.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.86,
    });
    const floor = new THREE.Mesh(geometry, material);
    floor.position.set(0, FLOOR_Y, -8);
    floor.renderOrder = -4;
    this.group.add(floor);
    this.track(geometry, material);
  }

  async loadSpecimenCoral() {
    const definitions = [
      {
        url: "/assets/models/smithsonian-pocillopora.glb",
        size: 1.75,
        placements: [
          [-7.8, -5.4, 1.12, -0.4],
          [9.8, -12.8, 1.42, 1.1],
        ],
      },
      {
        url: "/assets/models/smithsonian-diploria.glb",
        size: 1.55,
        placements: [
          [7.4, -6.9, 1.04, 0.45],
          [-10.8, -13.7, 1.38, 2.2],
        ],
      },
      {
        url: "/assets/models/smithsonian-acropora-palmata.glb",
        size: 2.05,
        placements: [
          [-2.8, -10.4, 1.05, -1.05],
          [3.8, -16.4, 1.44, 1.8],
        ],
      },
    ];

    const loader = new GLTFLoader();
    await Promise.all(definitions.map(async (definition, definitionIndex) => {
      try {
        const gltf = await loader.loadAsync(definition.url);
        if (this.disposed) return;

        const specimen = gltf.scene;
        const reefTints = [0x8bb3c5, 0x72a2ad, 0x7d91bd];
        specimen.traverse((object) => {
          if (!object.isMesh) return;
          object.castShadow = false;
          object.receiveShadow = false;
          if (object.geometry) this.geometries.add(object.geometry);
          const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
          sourceMaterials.filter(Boolean).forEach((material) => {
            if ("roughness" in material) material.roughness = 0.8;
            if ("metalness" in material) material.metalness = 0;
            if ("envMapIntensity" in material) material.envMapIntensity = 0.26;
            if (material.color) material.color.multiply(new THREE.Color(reefTints[definitionIndex]));
            if (material.emissive) {
              material.emissive.set(0x03151d);
              material.emissiveIntensity = 0.18;
            }
            this.materials.add(material);
          });
        });

        const rawBox = new THREE.Box3().setFromObject(specimen);
        const rawSize = rawBox.getSize(new THREE.Vector3());
        const normalization = definition.size / Math.max(rawSize.x, rawSize.y, rawSize.z);
        specimen.scale.setScalar(normalization);
        specimen.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(specimen);
        const center = box.getCenter(new THREE.Vector3());
        specimen.position.set(-center.x, -box.min.y, -center.z);

        const normalized = new THREE.Group();
        normalized.add(specimen);
        definition.placements.forEach(([x, z, scale, rotation], placementIndex) => {
          const coral = normalized.clone(true);
          coral.position.set(
            x,
            FLOOR_Y + terrainHeight(x, z) - definition.size * 0.24,
            z,
          );
          coral.scale.setScalar(scale);
          const seedIndex = definitionIndex * 5 + placementIndex;
          coral.rotation.set(
            (seeded(seedIndex, 61) - 0.5) * 0.13,
            rotation,
            (seeded(seedIndex, 67) - 0.5) * 0.1,
          );
          this.group.add(coral);
        });
      } catch (error) {
        console.warn(`Smithsonian coral specimen could not be loaded: ${definition.url}`, error);
      }
    }));
  }

  createRocks() {
    const geometry = new THREE.DodecahedronGeometry(0.7, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x123642,
      emissive: 0x02141b,
      emissiveIntensity: 0.28,
      roughness: 0.96,
      metalness: 0,
    });
    const rocks = new THREE.InstancedMesh(geometry, material, 34);
    const dummy = new THREE.Object3D();

    for (let index = 0; index < 34; index += 1) {
      const x = (seeded(index, 2) - 0.5) * 27;
      const z = -2.5 - seeded(index, 5) * 19;
      const size = 0.28 + seeded(index, 8) * 1.08;
      dummy.position.set(x, FLOOR_Y + terrainHeight(x, z) - 0.2, z);
      dummy.rotation.set(seeded(index, 9) * 1.8, seeded(index, 10) * Math.PI, seeded(index, 11));
      dummy.scale.set(size * (0.75 + seeded(index, 12) * 0.7), size, size * 0.8);
      dummy.updateMatrix();
      rocks.setMatrixAt(index, dummy.matrix);
    }
    rocks.instanceMatrix.needsUpdate = true;
    this.group.add(rocks);
    this.track(geometry, material);
  }

  createBranchingCoral() {
    const branchGeometry = new THREE.CylinderGeometry(0.065, 0.11, 1, 7, 1, false);
    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0x2c7f89,
        emissive: 0x073e52,
        emissiveIntensity: 0.62,
        roughness: 0.72,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x64598f,
        emissive: 0x22184e,
        emissiveIntensity: 0.54,
        roughness: 0.78,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x7d7692,
        emissive: 0x172946,
        emissiveIntensity: 0.38,
        roughness: 0.82,
      }),
    ];
    this.geometries.add(branchGeometry);
    materials.forEach((material) => this.materials.add(material));

    const clusterPositions = [
      [-7.8, -4.2, 1.2],
      [-4.2, -8.4, 0.82],
      [6.8, -5.5, 1.08],
      [9.4, -11.8, 1.45],
      [-10.8, -13.5, 1.3],
      [2.7, -14.2, 0.72],
      [12.1, -17.3, 1.7],
    ];

    clusterPositions.forEach(([x, z, scale], clusterIndex) => {
      const coral = new THREE.Group();
      coral.position.set(x, FLOOR_Y + terrainHeight(x, z), z);
      coral.scale.setScalar(scale);
      const material = materials[clusterIndex % materials.length];
      const branchCount = 7 + (clusterIndex % 3);

      for (let branch = 0; branch < branchCount; branch += 1) {
        const angle = (branch / branchCount) * Math.PI * 2 + seeded(branch, clusterIndex) * 0.5;
        const start = new THREE.Vector3(
          Math.cos(angle) * 0.12,
          0.02,
          Math.sin(angle) * 0.12,
        );
        const shoulder = new THREE.Vector3(
          Math.cos(angle) * (0.3 + seeded(branch, 14) * 0.42),
          0.75 + seeded(branch, 17) * 0.55,
          Math.sin(angle) * (0.3 + seeded(branch, 20) * 0.42),
        );
        const end = shoulder.clone().add(
          new THREE.Vector3(
            Math.cos(angle + 0.35) * (0.2 + seeded(branch, 23) * 0.34),
            0.48 + seeded(branch, 26) * 0.62,
            Math.sin(angle + 0.35) * (0.2 + seeded(branch, 29) * 0.34),
          ),
        );

        const lower = new THREE.Mesh(branchGeometry, material);
        orientCylinder(lower, start, shoulder);
        coral.add(lower);

        const upper = new THREE.Mesh(branchGeometry, material);
        upper.scale.x = 0.72;
        upper.scale.z = 0.72;
        orientCylinder(upper, shoulder, end);
        coral.add(upper);

        if (branch % 2 === 0) {
          const forkEnd = shoulder.clone().add(
            new THREE.Vector3(-Math.sin(angle) * 0.34, 0.42, Math.cos(angle) * 0.34),
          );
          const fork = new THREE.Mesh(branchGeometry, material);
          fork.scale.x = 0.6;
          fork.scale.z = 0.6;
          orientCylinder(fork, shoulder, forkEnd);
          coral.add(fork);
        }
      }
      coral.rotation.y = seeded(clusterIndex, 31) * Math.PI;
      this.group.add(coral);
    });
  }

  createSeaGrass() {
    this.grassGeometry = makeBladeGeometry();
    this.grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x177b73,
      emissive: 0x035044,
      emissiveIntensity: 0.46,
      roughness: 0.7,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.grass = new THREE.Mesh(this.grassGeometry, this.grassMaterial);
    this.grass.frustumCulled = false;
    this.group.add(this.grass);
    this.track(this.grassGeometry, this.grassMaterial);
    this.updateGrass(0, new THREE.Vector2());
  }

  updateGrass(elapsed, current) {
    const positions = this.grassGeometry.attributes.position.array;
    let pointer = 0;

    for (let blade = 0; blade < BLADE_COUNT; blade += 1) {
      const baseX = (seeded(blade, 41) - 0.5) * 27;
      const baseZ = -2.5 - seeded(blade, 43) * 18;
      const baseY = FLOOR_Y + terrainHeight(baseX, baseZ);
      const height = 0.55 + seeded(blade, 47) * 1.65;
      const phase = seeded(blade, 53) * Math.PI * 2;

      for (let segment = 0; segment <= BLADE_SEGMENTS; segment += 1) {
        const t = segment / BLADE_SEGMENTS;
        const sway =
          Math.sin(elapsed * 0.56 + phase + t * 1.7) * t * t * 0.34 +
          current.x * t * t * 0.28;
        const driftZ = Math.cos(elapsed * 0.41 + phase + t * 1.25) * t * t * 0.16;
        const width = 0.055 * (1 - t * 0.84);

        positions[pointer++] = baseX + sway - width;
        positions[pointer++] = baseY + t * height;
        positions[pointer++] = baseZ + driftZ + current.y * t * t * 0.15;
        positions[pointer++] = baseX + sway + width;
        positions[pointer++] = baseY + t * height;
        positions[pointer++] = baseZ + driftZ + current.y * t * t * 0.15;
      }
    }
    this.grassGeometry.attributes.position.needsUpdate = true;
    this.grassGeometry.computeVertexNormals();
  }

  createReefLight() {
    const lightA = new THREE.PointLight(0x54cfff, 5.2, 18, 2);
    lightA.position.set(-5, -1.8, -5);
    const lightB = new THREE.PointLight(0x6d79ff, 3.8, 17, 2);
    lightB.position.set(7, -2.2, -9);
    this.lights.push(lightA, lightB);
    this.group.add(lightA, lightB);
  }

  update(elapsed, depth, current) {
    this.updateGrass(elapsed, current);
    this.lights[0].intensity = 4.4 + Math.sin(elapsed * 0.29) * 0.8;
    this.lights[1].intensity = 3.1 + Math.sin(elapsed * 0.21 + 1.8) * 0.7;
    this.group.position.x = current.x * 0.12;
    this.group.position.z = -depth * 1.6;
    this.group.rotation.y = Math.sin(elapsed * 0.035) * 0.012;
  }

  dispose() {
    this.disposed = true;
    this.geometries.forEach((geometry) => geometry.dispose());
    this.materials.forEach((material) => material.dispose());
    this.group.removeFromParent();
  }
}
