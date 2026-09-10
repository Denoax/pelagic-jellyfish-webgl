import {cameraPosition,positionWorld,vec3,mix} from 'three/tsl';
import {Background} from '../../vendor/aurelia/background.js';

// Sanctuary-only optical response. Reuse the ocean's directional water radiance;
// do not add a light/pass or change attenuation of animals, plume or open water.
// The old d^1.5 extinction erased virtually all pigment at wide camera distances.
// Keep its exact near response; preserve the far-field fade and boundary safety.
export function geologicalWater(color){
  const ray=positionWorld.sub(cameraPosition),d=ray.length().sub(12).max(0);
  const depth=mix(.5,1,Background.depth);
  const original=vec3(.11,.078,.060).mul(depth).mul(d.pow(1.5)).negate().exp();
  const local=vec3(.034,.027,.029).mul(depth).mul(d.pow(1.08)).negate().exp();
  const radius=positionWorld.xz.sub(vec3(-2.4,0,-24).xz).length();
  const raised=positionWorld.y.smoothstep(-14,-10);
  const footprint=radius.smoothstep(mix(18,30,raised),mix(36,58,raised)).oneMinus();
  const transmission=mix(original,local,footprint);
  return mix(Background.waterRadiance(ray.normalize()),color,transmission);
}
