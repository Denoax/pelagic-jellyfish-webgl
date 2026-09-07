import * as THREE from 'three/webgpu';
import { uv, normalView, normalWorld, positionViewDirection, float, mix, vec3, uniform, materialEmissive } from 'three/tsl';

// r175-compatible single-draw tissue approximation, not framebuffer refraction.
// Optical depth combines a anatomical thickness profile and the viewing path.
// No transmission buffer, raw shader patch, extra bloom or material dependency.
export function createJellyTissue({ membrane=false }={}) {
  const material=new THREE.MeshPhysicalNodeMaterial({
    color:0xb2ddeb,roughness:.61,metalness:0,clearcoat:0,
    specularIntensity:.08,ior:1.08,transmission:0,
    emissive:0x31577b,emissiveIntensity:.24,
    transparent:true,opacity:membrane?.48:.58,side:THREE.DoubleSide,
    depthWrite:false,vertexColors:!membrane,
  });
  const v=uv().y;
  const canals=uv().x.mul(Math.PI*16).cos().mul(.5).add(.5).pow(3).mul(v.pow(.65));
  const thickness=membrane
    ? uv().x.mul(Math.PI).sin().abs().mul(.2).add(.07)
    : v.oneMinus().pow(1.4).mul(.38).add(.055).add(canals.mul(.07));
  const facing=normalView.dot(positionViewDirection).abs().max(.24);
  const path=thickness.div(facing);
  const absorption=path.mul(-1.7).exp().oneMinus();
  const opacity=uniform(material.opacity);
  material.opacityNode=absorption.mul(.65).add(.2).mul(opacity.div(.58)).clamp(.08,.82);
  material.colorNode=mix(vec3(.29,.47,.58),vec3(.68,.8,.86),absorption);
  material.roughnessNode=float(.76);
  // Broad tissue back-scattering rather than high-contrast reflected cells.
  const backlight=normalWorld.dot(vec3(.3,1,.2).normalize()).negate().max(0);
  material.emissiveNode=materialEmissive.add(vec3(.045,.095,.13).mul(backlight).mul(thickness));
  // The inherited procedural environment has very high-contrast reflected cells.
  // Tissue uses a diffuse, low-frequency environment response instead of glassy cells.
  material.envNode=vec3(.045,.08,.12);
  material.userData.tissueOpacity=opacity;
  return material;
}
