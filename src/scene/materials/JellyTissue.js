import * as THREE from 'three/webgpu';
import { Fn, attribute, texture, uv, normalView, normalWorld, positionViewDirection, float, mix, vec3, uniform, materialEmissive } from 'three/tsl';
import { createBioluminescenceMap } from './BioluminescenceMap.js';

// r175-compatible single-draw tissue approximation, not framebuffer refraction.
// Optical depth combines a anatomical thickness profile and the viewing path.
// No transmission buffer, raw shader patch, extra bloom or material dependency.
export function createJellyTissue({ membrane=false }={}) {
  const material=new THREE.MeshPhysicalNodeMaterial({
    color:0xb2ddeb,roughness:.3,metalness:0,clearcoat:0,
    specularIntensity:.65,ior:1.24,transmission:0,
    emissive:membrane?0x663da8:0x4f72d8,emissiveIntensity:membrane?.32:.5,
    transparent:true,opacity:membrane?.42:.58,side:THREE.DoubleSide,
    depthWrite:false,vertexColors:!membrane,
  });
  // Interpolated UVs can overshoot 1 by a float ULP on the constant-v rim.
  // A fractional power of (1-v) then yields NaN: the dotted black rim wasn't
  // a missing triangle. Keep every fractional-power operand nonnegative.
  const v=uv().y.clamp(0,1);
  const detailMap=createBioluminescenceMap();
  const detail=texture(detailMap,uv());
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
  const sheetEdge=membrane?uv().x.mul(Math.PI).sin().abs().pow(.25).mul(.7).add(.3):float(1);
  material.opacityNode=absorption.mul(membrane?.38:.40).add(.08).mul(sheetEdge).mul(opacity.div(.58)).clamp(.025,.62);
  const pigment=canals.mul(.07);
  material.colorNode=membrane
    ? mix(vec3(.34,.30,.60),vec3(.65,.72,.87),absorption)
    : mix(vec3(.18,.39,.67),vec3(.60,.78,.89),absorption).mul(pigment.oneMinus());
  material.roughnessNode=membrane?float(.40):mix(.18,.30,absorption);
  // Broad tissue back-scattering rather than high-contrast reflected cells.
  const backlight=normalWorld.dot(vec3(.3,1,.2).normalize()).negate().max(0);
  // Recover the old blue/violet personality in the approved tissue, not in
  // concentric additive shells. Canal/cell masks are attached to existing UVs.
  const edge=facing.oneMinus().max(0).pow(2);
  const rim=v.smoothstep(.82,1).mul(edge.mul(.65).add(.2));
  material.emissiveNode=materialEmissive.mul(detail.r.mul(.65).add(.35))
    .add(vec3(.045,.095,.13).mul(backlight).mul(thickness));
  if(membrane){
    material.emissiveNode=material.emissiveNode
      .add(vec3(.12,.20,.50).mul(detail.g).mul(.22))
      .add(vec3(.8,.38,.65).mul(detail.b).mul(.85));
  }else{
    material.emissiveNode=material.emissiveNode
      .add(vec3(.06,1.2,1.65).mul(rim))
      .add(vec3(.06,.45,.8).mul(detail.g).mul(.24))
      .add(vec3(.45,.80,1).mul(detail.b).mul(1.6))
      .add(vec3(.16,.45,.60).mul(attribute('tissueSignal','float')));
  }
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
  material.userData.detailMap=detailMap;
  material.addEventListener('dispose',()=>detailMap.dispose());
  return material;
}
