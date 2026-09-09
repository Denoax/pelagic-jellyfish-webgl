import * as THREE from 'three/webgpu';
import { Fn, If, uniform, vec2, vec3, vec4, texture, dot, normalize, mix, perspectiveDepthToViewZ } from 'three/tsl';
import { ORIFICE, DIFFUSE } from './VentDynamics.js';

// Bounded world-space density domains, evaluated inside M3's EXISTING output.
// No mesh, framebuffer, scene copy, recursive sample or independent clock.
export class ThermalShimmer {
  constructor(){
    this.time=uniform(0);this.enabled=true;this.disposed=false;
    this.cameraWorld=uniform(new THREE.Matrix4());this.view=uniform(new THREE.Matrix4());
    this.frustum=new THREE.Frustum();this.matrix=new THREE.Matrix4();
    this.domains=[{p:ORIFICE,r:[.48,1.35,.48]},...DIFFUSE.slice(0,2).map(p=>({p,r:[.4,.6,.4]}))].map(({p,r},i)=>({
      center:uniform(new THREE.Vector3(p.x,p.y+r[1]*.8,p.z)),radii:vec3(...r),
      strength:uniform(0),radius:Math.max(...r),gain:i===0?1:.55,
      sphere:new THREE.Sphere(new THREE.Vector3(p.x,p.y+r[1]*.8,p.z),Math.max(...r)),
    }));
  }
  prepare(camera){
    if(this.disposed)return false;
    camera.updateMatrixWorld();this.cameraWorld.value.copy(camera.matrixWorld);this.view.value.copy(camera.matrixWorldInverse);
    this.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);this.frustum.setFromProjectionMatrix(this.matrix);
    let visible=false;
    for(const d of this.domains){
      const distance=camera.position.distanceTo(d.sphere.center);
      const fade=Math.max(0,Math.min(1,(38-distance)/10));
      d.strength.value=this.enabled&&this.frustum.intersectsSphere(d.sphere)?fade*d.gain:0;
      visible ||= d.strength.value>0;
    }
    return visible;
  }
  sample(lens,st,original){return Fn(()=>{
    const offset=vec2(0).toVar();
    const ray4=lens.inverseProjection.mul(vec4(st.x.mul(2).sub(1),st.y.mul(-2).add(1),1,1));
    const direction=normalize(this.cameraWorld.mul(vec4(normalize(ray4.xyz.div(ray4.w)),0)).xyz);
    const origin=this.cameraWorld.mul(vec4(0,0,0,1)).xyz;
    const sceneZ=perspectiveDepthToViewZ(texture(lens.target.depthTexture,st).r,lens.near,lens.far);
    for(const d of this.domains){If(d.strength.greaterThan(0),()=>{
      const o=origin.sub(d.center).div(d.radii),v=direction.div(d.radii);
      const distance=dot(o,v).negate().div(dot(v,v)).toVar();
      const q=o.add(v.mul(distance)),r2=dot(q,q).toVar();
      If(r2.lessThan(1).and(distance.greaterThan(0)),()=>{
        const p=origin.add(direction.mul(distance)),pv=this.view.mul(vec4(p,1));
        const visible=pv.z.sub(sceneZ).smoothstep(0,.25);
        const mask=r2.smoothstep(.08,1).oneMinus().pow(2).mul(visible).mul(d.strength);
        // Smooth rising cells; world coordinates, not a screen-locked wiggle.
        const flow=p.sub(d.center),y=flow.y.mul(5).sub(this.time.mul(1.8));
        const a=y.add(flow.x.mul(6)).sin().mul(y.mul(.63).sub(flow.z.mul(5)).cos());
        const b=y.mul(.79).add(flow.z.mul(5)).cos().mul(flow.x.mul(4).sub(y.mul(.38)).sin());
        const moved=p.add(vec3(a,b.mul(.25),b).mul(.024));
        const clip=lens.projection.mul(this.view.mul(vec4(moved,1)));
        const bent=vec2(clip.x.div(clip.w).mul(.5).add(.5),clip.y.div(clip.w).mul(-.5).add(.5));
        offset.addAssign(bent.sub(st).mul(mask));
      });
    });}
    const safe=st.add(offset).clamp(.001,.999);
    return vec4(texture(lens.target.texture,safe).rgb,original.a);
  })();}
  state(){return{enabled:this.enabled,active:this.domains.filter(d=>d.strength.value>0).length,domains:this.domains.map(d=>d.center.value.toArray()),extraOceanRenders:0,extraTargets:0};}
  dispose(){this.disposed=true;this.enabled=false;for(const d of this.domains)d.strength.value=0;}
}
