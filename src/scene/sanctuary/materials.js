import * as THREE from 'three/webgpu';
import { mix, normalWorld, positionWorld, vec2, vec3, uniform, mx_noise_float, texture } from 'three/tsl';
import { DIFFUSE, ORIFICE } from './VentDynamics.js';
import { FLOOR_Y, HERO } from './geology.js';

export function lightUniforms(){
  const scan=new THREE.Texture();
  scan.wrapS=scan.wrapT=THREE.RepeatWrapping;
  const ready=typeof document==='undefined'?Promise.resolve():new THREE.TextureLoader().loadAsync(
    `${import.meta.env?.BASE_URL||'/'}assets/models/polyhaven/rock_07/textures/rock_07_diff_1k.jpg`
  ).then(t=>{scan.image=t.image;scan.generateMipmaps=true;scan.minFilter=THREE.LinearMipmapLinearFilter;scan.magFilter=THREE.LinearFilter;scan.anisotropy=4;scan.needsUpdate=true;t.dispose();});
  return{position:uniform(new THREE.Vector3()),power:uniform(0),scan,ready};
}
export function mineralMaterial(light,{chimney=false,life=false,floor=false}={}) {
  const m=new THREE.MeshBasicNodeMaterial({transparent:false,opacity:1,depthWrite:true});
  m.name=life?'vent-tubes':chimney?'sulfide-mineral-crust':'dark-pillow-basalt';
  const p=positionWorld;
  const low=mx_noise_float(p.mul(.24));
  const meso=mx_noise_float(p.mul(vec3(1.4,.7,1.4)));
  const weights=normalWorld.abs().pow(4);const w=weights.div(weights.x.add(weights.y).add(weights.z).max(.0001));
  // Sample a valid photographed rock region, not the atlas's stretched padding.
  // Mirrored patches have continuous edges; triplanar blending avoids UV seams.
  // Only luminance survives: terrestrial browns do not tint the sulfide.
  const scanUV=q=>q.mul(1.4).fract().sub(.5).abs().mul(2).mul(vec2(.18,.25)).add(vec2(.10,.50));
  const scan=texture(light.scan,scanUV(p.yz)).rgb.mul(w.x)
    .add(texture(light.scan,scanUV(p.xz)).rgb.mul(w.y)).add(texture(light.scan,scanUV(p.xy)).rgb.mul(w.z)).dot(vec3(.2126,.7152,.0722));
  const grain=scan.sub(.5);
  let pigment=vec3(.075,.082,.09).mul(meso.mul(.10).add(.93)).mul(scan.mul(.24).add(.76));
  if(chimney) {
    const up=normalWorld.y.max(0),down=normalWorld.y.negate().max(0);
    const height=p.y.sub(FLOOR_Y).div(HERO.height).clamp(0,1);
    const source=p.sub(vec3(ORIFICE.x,ORIFICE.y,ORIFICE.z));
    const fresh=source.length().smoothstep(.35,2.7).oneMinus();
    const cavity=meso.smoothstep(-.2,.25).oneMinus().mul(.3).add(down.mul(.7));
    const cap=up.smoothstep(.1,.65).mul(height.smoothstep(.55,.95));
    const activeCrust=fresh.mul(cap.mul(.7).add(cavity.mul(.45))).mul(meso.mul(.22).add(.7)).clamp(0,.7);
    const oxidized=height.smoothstep(.15,.55).mul(height.smoothstep(.7,.93).oneMinus())
      .mul(fresh.oneMinus()).mul(up.smoothstep(.08,.5)).mul(low.smoothstep(.1,.38));
    pigment=mix(pigment,vec3(.19,.17,.135),oxidized.mul(.45));
    pigment=mix(pigment,vec3(.34,.35,.34),activeCrust);
  }
  if(life)pigment=vec3(.42,.43,.38).mul(grain.mul(.15).add(.85));
  if(floor)for(const source of DIFFUSE){
    const radius=p.xz.sub(vec3(source.x,0,source.z).xz).length().add(low.mul(.3)).add(meso.mul(.12));
    const mat=radius.smoothstep(.2,.85).oneMinus().mul(normalWorld.y.max(0)).mul(scan.mul(.3).add(.7));
    pigment=mix(pigment,vec3(.32,.31,.265),mat.mul(.8));
  }
  // Small rough facets, without shiny specular or caustics. The normal-dependent
  // term is a dim legibility fill, explicitly not sunlight or a moving ROV light.
  // Surface-gradient bump (same derivative principle as r175 BumpMapNode),
  // applied to procedural world-space height: no UV seam or texture dependency.
  const height=grain.mul(.022).add(meso.mul(.012));
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
