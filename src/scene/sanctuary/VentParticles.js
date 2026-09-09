import * as THREE from 'three/webgpu';
import { attribute, cameraProjectionMatrix, cameraPosition, modelViewMatrix, positionGeometry, vec4, varying, uv, mx_noise_float, vec3, uniform, mix } from 'three/tsl';
import { seed } from './geology.js';

// One local instanced quad batch per optical type. Uses the existing
// SoftParticles projection convention; no new renderer or full-screen layer.
export class VentParticles {
  constructor(sim,light,start,count,smoke=false){
    this.sim=sim;this.start=start;this.count=count;this.smoke=smoke;this.time=uniform(0);
    this.grains=smoke?16:1;const instances=count*this.grains;
    const plane=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry().copy(plane);plane.dispose();g.instanceCount=instances;
    this.centers=new Float32Array(instances*3);this.sizes=new Float32Array(instances);this.alphas=new Float32Array(instances);
    for(const [name,array,size]of [['ventCenter',this.centers,3],['ventSize',this.sizes,1],['ventAlpha',this.alphas,1]])g.setAttribute(name,new THREE.InstancedBufferAttribute(array,size).setUsage(THREE.DynamicDrawUsage));
    this.dynamicAttributes=[g.getAttribute('ventCenter'),g.getAttribute('ventSize'),g.getAttribute('ventAlpha')];
    const m=new THREE.MeshBasicNodeMaterial({transparent:true,depthWrite:false,blending:THREE.NormalBlending,side:THREE.DoubleSide,fog:!smoke});
    const offsets=new Float32Array(instances*3),radii=new Float32Array(instances);
    for(let i=0;i<instances;i++){
      const a=seed(i,211)*Math.PI*2,z=seed(i,212)*2-1,r=Math.cbrt(seed(i,213)),s=Math.sqrt(1-z*z);
      offsets.set([Math.cos(a)*s*r,z*r,Math.sin(a)*s*r],i*3);
      radii[i]=.018+Math.pow(seed(i,214),3)*.04;
    }
    g.setAttribute('grainOffset',new THREE.InstancedBufferAttribute(offsets,3));
    g.setAttribute('grainDiameter',new THREE.InstancedBufferAttribute(radii,1));
    const diameter=attribute('ventSize','float');
    const c=smoke?attribute('ventCenter','vec3').add(attribute('grainOffset','vec3').mul(diameter)):attribute('ventCenter','vec3');
    const spriteSize=smoke?attribute('grainDiameter','float'):diameter.mul(2.5);
    m.positionNode=c;m.vertexNode=cameraProjectionMatrix.mul(modelViewMatrix.mul(vec4(c,1)).add(vec4(positionGeometry.xy.mul(spriteSize),0,0)));
    const r=uv().sub(.5).length().mul(2),world=varying(c);
    const noise=mx_noise_float(vec3(uv().mul(5),this.time.mul(.16)).add(world.mul(.32))).mul(.28).add(.7);
    const edge=r.smoothstep(smoke?.5:.05,1).oneMinus();
    m.opacityNode=edge.pow(smoke?1:2).mul(smoke?1:noise).mul(varying(attribute('ventAlpha','float')));
    // Absorptive core, almost black. No additive glow. A tiny cool scattering
    // contribution makes the mineral boundary legible near an actual animal.
    const local=world.sub(light.position).length().div(11).oneMinus().clamp(0,1).pow(2).mul(light.power);
    m.colorNode=smoke?vec3(.022,.024,.027).add(vec3(.004,.006,.008).mul(local)):vec3(.10,.16,.19).mul(local.add(.22));
    this.applyWater=(water)=>{if(smoke){
      // Custom billboard vertexNode bypasses the ordinary positionNode stage.
      // Evaluate existing water extinction at the grain, never the quad origin.
      const ray=world.sub(cameraPosition),distance=ray.length().sub(12).max(0);
      const transmission=vec3(.11,.078,.06).mul(mix(.5,1,water.depth)).mul(distance.pow(1.5)).negate().exp();
      m.colorNode=mix(water.waterRadiance(ray.normalize()),m.colorNode,transmission);
    }};
    this.mesh=new THREE.Mesh(g,m);this.mesh.name=smoke?'black-mineral-discharge':'diffuse-filaments-and-entrained-snow';this.mesh.frustumCulled=false;this.mesh.renderOrder=1;
    this.update();
  }
  update(){const s=this.sim;this.time.value=s.time;for(let i=0;i<this.count*this.grains;i++){const j=Math.floor(i/this.grains)+this.start;this.centers[i*3]=s.position[j*3];this.centers[i*3+1]=s.position[j*3+1];this.centers[i*3+2]=s.position[j*3+2];this.sizes[i]=s.size[j];this.alphas[i]=s.alpha[j];}for(const a of this.dynamicAttributes)a.needsUpdate=true;}
  dispose(){this.mesh.removeFromParent();this.mesh.geometry.dispose();this.mesh.material.dispose();}
}
