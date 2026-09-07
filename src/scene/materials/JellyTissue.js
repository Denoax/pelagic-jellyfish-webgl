import * as THREE from 'three/webgpu';
import { Fn, attribute, uv, normalView, normalWorld, positionViewDirection, float, mix, vec3, uniform, materialEmissive } from 'three/tsl';

// r175-compatible single-draw tissue approximation, not framebuffer refraction.
// Optical depth combines a anatomical thickness profile and the viewing path.
// No transmission buffer, raw shader patch, extra bloom or material dependency.
export function createJellyTissue({ membrane=false }={}) {
  const material=new THREE.MeshPhysicalNodeMaterial({
    color:0xb2ddeb,roughness:.38,metalness:0,clearcoat:0,
    specularIntensity:.65,ior:1.24,transmission:0,
    emissive:0x213b55,emissiveIntensity:.18,
    transparent:true,opacity:membrane?.48:.58,side:THREE.DoubleSide,
    depthWrite:false,vertexColors:!membrane,
  });
  // Interpolated UVs can overshoot 1 by a float ULP on the constant-v rim.
  // A fractional power of (1-v) then yields NaN: the dotted black rim wasn't
  // a missing triangle. Keep every fractional-power operand nonnegative.
  const v=uv().y.clamp(0,1);
  const canals=uv().x.mul(Math.PI*16).add(v.mul(1.2).sin().mul(.3)).cos()
    .mul(.5).add(.5).pow(7).mul(v.pow(.65));
  const mesoglea=v.mul(Math.PI).sin().max(0);
  const thickness=membrane
    ? uv().x.mul(Math.PI).sin().abs().mul(.2).add(.07)
    : v.oneMinus().max(0).pow(1.4).mul(.30).add(.04).add(canals.mul(.20).mul(mesoglea));
  const facing=normalView.dot(positionViewDirection).abs().max(.24);
  const path=thickness.div(facing);
  const absorption=path.mul(-1.7).exp().oneMinus();
  const opacity=uniform(material.opacity);
  // Transparent thin edge, gently milkier mesoglea; no global opacity lift.
  material.opacityNode=absorption.mul(.5).add(.09).mul(opacity.div(.58)).clamp(.04,.7);
  const pigment=canals.mul(.07);
  material.colorNode=membrane
    ? mix(vec3(.46,.50,.65),vec3(.78,.83,.88),absorption)
    : mix(vec3(.34,.55,.63),vec3(.72,.84,.87),absorption).mul(pigment.oneMinus());
  material.roughnessNode=membrane?float(.45):mix(.31,.48,absorption);
  // Broad tissue back-scattering rather than high-contrast reflected cells.
  const backlight=normalWorld.dot(vec3(.3,1,.2).normalize()).negate().max(0);
  material.emissiveNode=materialEmissive.add(vec3(.045,.095,.13).mul(backlight).mul(thickness));
  if(!membrane)material.emissiveNode=material.emissiveNode.add(vec3(.16,.45,.60).mul(attribute('tissueSignal','float')));
  // Analytically filtered, broad water-light lobe. Honor r175's separate
  // irradiance (normal) and radiance (reflected view) contexts, so highlights
  // actually travel over the turning surface rather than being painted on it.
  material.envNode=Fn(builder=>{
    const direction=builder.context.getUV?.()||normalWorld;
    const blur=builder.context.getTextureLevel?.()||float(1);
    const key=direction.dot(vec3(.32,.94,.12).normalize()).max(0).pow(mix(18,2,blur));
    return vec3(.02,.035,.05).add(vec3(.48,.61,.65).mul(key));
  })();
  material.userData.tissueOpacity=opacity;
  return material;
}
