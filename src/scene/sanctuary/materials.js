import * as THREE from 'three/webgpu';
import { mix, normalWorld, positionWorld, vec3, uniform, mx_noise_float } from 'three/tsl';
import { DIFFUSE } from './VentDynamics.js';

export function lightUniforms(){return{position:uniform(new THREE.Vector3()),power:uniform(0)};}
export function mineralMaterial(light,{chimney=false,life=false,floor=false}={}) {
  const m=new THREE.MeshBasicNodeMaterial({transparent:false,opacity:1,depthWrite:true});
  m.name=life?'vent-tubes':chimney?'sulfide-mineral-crust':'dark-pillow-basalt';
  const p=positionWorld;
  const low=mx_noise_float(p.mul(chimney?1.8:.65));
  const grain=mx_noise_float(p.mul(chimney?15:7));
  const crust=low.mul(.38).add(grain.mul(.68)).smoothstep(.12,.35);
  let pigment=vec3(.11,.13,.15).mul(grain.mul(.65).add(.8));
  if(chimney) {
    const deposit=mix(vec3(.24,.205,.145),vec3(.38,.4,.4),low.smoothstep(.06,.3));
    pigment=mix(pigment,deposit,crust.mul(.75));
  }
  if(life)pigment=vec3(.42,.43,.38).mul(grain.mul(.15).add(.85));
  if(floor)for(const source of DIFFUSE){
    const radius=p.xz.sub(vec3(source.x,0,source.z).xz).length().add(low.mul(.5)).add(grain.mul(.22));
    const mat=radius.smoothstep(.24,.8).oneMinus().mul(grain.mul(2).add(.7).clamp(0,1));
    pigment=mix(pigment,vec3(.32,.31,.265),mat.mul(.8));
  }
  // Small rough facets, without shiny specular or caustics. The normal-dependent
  // term is a dim legibility fill, explicitly not sunlight or a moving ROV light.
  // Surface-gradient bump (same derivative principle as r175 BumpMapNode),
  // applied to procedural world-space height: no UV seam or texture dependency.
  const height=grain.mul(chimney?.024:.05).add(low.mul(.025));
  const dx=p.dFdx(),dy=p.dFdy(),r1=dy.cross(normalWorld),r2=normalWorld.cross(dx);
  const determinant=dx.dot(r1);
  const gradient=r1.mul(height.dFdx()).add(r2.mul(height.dFdy())).mul(determinant.sign());
  const n=normalWorld.mul(determinant.abs().max(.00000001)).sub(gradient).normalize();
  const relief=n.dot(vec3(-.4,.7,.5).normalize()).mul(.38).add(.55).max(.12);
  const ambient=vec3(.105,.14,.17).mul(relief);
  const ray=light.position.sub(p),distance=ray.length();
  const diffuse=n.dot(ray.normalize()).max(0).mul(.88).add(.12);
  const falloff=distance.div(13).oneMinus().clamp(0,1).pow(2).div(distance.mul(distance).mul(.09).add(1));
  const illumination=vec3(.24,.64,.9).mul(light.power).mul(falloff).mul(diffuse).mul(3.6);
  m.colorNode=pigment.mul(ambient.add(illumination));
  return m;
}
