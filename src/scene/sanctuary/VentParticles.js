import * as THREE from 'three/webgpu';
import { attribute, cameraProjectionMatrix, modelViewMatrix, positionGeometry, vec4, varying, uv, mx_noise_float, vec3, uniform } from 'three/tsl';

// One local instanced quad batch per optical type. Uses the existing
// SoftParticles projection convention; no new renderer or full-screen layer.
export class VentParticles {
  constructor(sim,light,start,count,smoke=false){
    this.sim=sim;this.start=start;this.count=count;this.smoke=smoke;this.time=uniform(0);
    const plane=new THREE.PlaneGeometry(1,1),g=new THREE.InstancedBufferGeometry().copy(plane);plane.dispose();g.instanceCount=count;
    this.centers=new Float32Array(count*3);this.sizes=new Float32Array(count);this.alphas=new Float32Array(count);
    for(const [name,array,size]of [['ventCenter',this.centers,3],['ventSize',this.sizes,1],['ventAlpha',this.alphas,1]])g.setAttribute(name,new THREE.InstancedBufferAttribute(array,size).setUsage(THREE.DynamicDrawUsage));
    this.dynamicAttributes=[g.getAttribute('ventCenter'),g.getAttribute('ventSize'),g.getAttribute('ventAlpha')];
    const m=new THREE.MeshBasicNodeMaterial({transparent:true,depthWrite:false,blending:THREE.NormalBlending,side:THREE.DoubleSide});
    const c=attribute('ventCenter','vec3'),diameter=attribute('ventSize','float');
    m.positionNode=c;m.vertexNode=cameraProjectionMatrix.mul(modelViewMatrix.mul(vec4(c,1)).add(vec4(positionGeometry.xy.mul(diameter.mul(2.5)),0,0)));
    const r=uv().sub(.5).length().mul(2),world=varying(c);
    const noise=mx_noise_float(vec3(uv().mul(5),this.time.mul(.16)).add(world.mul(.32))).mul(.28).add(.7);
    const edge=r.smoothstep(.05,1).oneMinus();
    m.opacityNode=edge.pow(smoke?1.3:2).mul(noise).mul(varying(attribute('ventAlpha','float')));
    // Absorptive core, almost black. No additive glow. A tiny cool scattering
    // contribution makes the mineral boundary legible near an actual animal.
    const local=world.sub(light.position).length().div(11).oneMinus().clamp(0,1).pow(2).mul(light.power);
    m.colorNode=smoke?vec3(.115,.13,.145).mul(noise).add(vec3(.022,.029,.036).mul(local)):vec3(.10,.16,.19).mul(local.add(.22));
    this.mesh=new THREE.Mesh(g,m);this.mesh.name=smoke?'black-mineral-discharge':'diffuse-filaments-and-entrained-snow';this.mesh.frustumCulled=false;this.mesh.renderOrder=1;
    this.update();
  }
  update(){const s=this.sim;this.time.value=s.time;for(let i=0;i<this.count;i++){const j=i+this.start;this.centers[i*3]=s.position[j*3];this.centers[i*3+1]=s.position[j*3+1];this.centers[i*3+2]=s.position[j*3+2];this.sizes[i]=s.size[j];this.alphas[i]=s.alpha[j];}for(const a of this.dynamicAttributes)a.needsUpdate=true;}
  dispose(){this.mesh.removeFromParent();this.mesh.geometry.dispose();this.mesh.material.dispose();}
}
