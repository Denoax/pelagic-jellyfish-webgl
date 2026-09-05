import * as THREE from "three/webgpu";
import {
  attribute, cameraProjectionMatrix, materialOpacity, modelScale,
  modelViewMatrix, positionGeometry, uniform, time, uv, varying, vec3, vec4,
} from "three/tsl";

// Camera-facing discs instead of hardware points: the same round silhouette
// works on WebGL and WebGPU, without gl_PointCoord or extra draw calls.
export function createSoftParticles(source, options, drift = 0.06) {
  const plane = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry().copy(plane);
  plane.dispose();
  const centers = source.getAttribute("position");
  geometry.setAttribute("particleCenter", new THREE.InstancedBufferAttribute(centers.array, 3));
  geometry.instanceCount = centers.count;
  const seeds = new Float32Array(centers.count);
  for (let i = 0; i < seeds.length; i += 1) seeds[i] = i * 2.399963;
  geometry.setAttribute("particleSeed", new THREE.InstancedBufferAttribute(seeds, 1));
  const alpha = source.getAttribute("particleAlpha");
  if (alpha) geometry.setAttribute("particleAlpha", new THREE.InstancedBufferAttribute(alpha.array, 1));
  if (source.getAttribute("color")) {
    geometry.setAttribute("particleTint", new THREE.InstancedBufferAttribute(source.getAttribute("color").array, 3));
  }
  source.dispose();

  const { size, sizeAttenuation: _attenuation, vertexColors, ...parameters } = options;
  const material = new THREE.MeshBasicNodeMaterial(parameters);
  material.size = size;
  const center = attribute("particleCenter", "vec3");
  const phase = attribute("particleSeed", "float");
  const slow = time.mul(0.28);
  const offset = vec3(
    slow.add(phase).sin(),
    slow.mul(0.71).add(phase.mul(1.31)).sin(),
    slow.mul(0.83).add(phase.mul(0.79)).cos(),
  ).mul(drift);
  // Keep shared underwater fog evaluated at each particle, not the quad origin.
  material.positionNode = center.add(offset);
  const viewCenter = modelViewMatrix.mul(vec4(center.add(offset), 1));
  const sizeVariation = phase.sin().mul(0.22).add(1);
  const particleSize = uniform(size);
  const diameter = particleSize.mul(2.6).mul(modelScale.x).mul(sizeVariation);
  material.vertexNode = cameraProjectionMatrix.mul(
    viewCenter.add(vec4(positionGeometry.xy.mul(diameter), 0, 0)),
  );
  const radius = uv().sub(0.5).length().mul(2);
  const softDisc = radius.smoothstep(0.12, 1).oneMinus();
  const shimmer = varying(slow.mul(1.2).add(phase).sin().mul(0.12).add(0.88));
  material.opacityNode = materialOpacity.mul(softDisc.pow(1.4)).mul(shimmer);
  if (alpha) material.opacityNode = material.opacityNode.mul(varying(attribute("particleAlpha", "float")));
  if (vertexColors) material.colorNode = varying(attribute("particleTint", "vec3"));

  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = "soft-drifting-particles";
  mesh.onBeforeRender = () => { particleSize.value = material.size; };
  mesh.frustumCulled = false;
  return mesh;
}
