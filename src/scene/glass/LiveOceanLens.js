import * as THREE from 'three/webgpu';
import { Fn, uniform, uv, vec2, vec3, vec4, texture, dot, normalize, refract, sqrt, max, min, smoothstep, mix, perspectiveDepthToViewZ } from 'three/tsl';

// Original world-space ellipsoid. Trace both interfaces through CURRENT ocean
// color. The lens never enters its own input. No second ocean or renderer.
export class LiveOceanLens {
  constructor(renderer, camera) {
    this.renderer=renderer; this.camera=camera; this.enabled=true; this.disposed=false;
    this.position=new THREE.Vector3(); this.rotation=new THREE.Quaternion();
    this.size=new THREE.Vector2(); this.unit=new THREE.Vector3(1,1,1);
    this.world=new THREE.Matrix4(); this.inverse=new THREE.Matrix4();
    this.radii=uniform(new THREE.Vector3(.92,1.08,.32));
    this.cameraToLens=uniform(new THREE.Matrix4()); this.lensToView=uniform(new THREE.Matrix4());
    this.projection=uniform(new THREE.Matrix4()); this.inverseProjection=uniform(new THREE.Matrix4());
    this.near=uniform(camera.near); this.far=uniform(camera.far);
    this.strength=uniform(1); this.eta=uniform(1/1.045);
    this.target=new THREE.RenderTarget(1,1,{
      type:THREE.HalfFloatType, format:THREE.RGBAFormat, colorSpace:THREE.LinearSRGBColorSpace,
      minFilter:THREE.LinearFilter, magFilter:THREE.LinearFilter, generateMipmaps:false,
      samples:renderer.samples, depthTexture:new THREE.DepthTexture(1,1,THREE.UnsignedIntType),
    });
    this.target.texture.name='M3 live ocean color (no lens)';
    this.target.depthTexture.name='M3 opaque ocean depth';
    this.output=new THREE.PostProcessing(renderer,this.optics());
    this.anchor(); this.render=this.render.bind(this);
  }
  anchor() {
    this.camera.updateMatrixWorld();
    this.position.set(.35,-.03,-4).applyMatrix4(this.camera.matrixWorld);
    this.rotation.copy(this.camera.quaternion);
  }
  optics() {
    return Fn(()=>{
      const st=uv(), original=texture(this.target.texture,st).toVar();
      const viewRay=this.inverseProjection.mul(vec4(st.x.mul(2).sub(1),st.y.mul(-2).add(1),1,1));
      const direction=normalize(this.cameraToLens.mul(vec4(normalize(viewRay.xyz.div(viewRay.w)),0)).xyz).toVar();
      const origin=this.cameraToLens.mul(vec4(0,0,0,1)).xyz.toVar();
      const o=origin.div(this.radii),d=direction.div(this.radii);
      const a=dot(d,d),b=dot(o,d),c=dot(o,o).sub(1);
      const disc=b.mul(b).sub(a.mul(c)).toVar(),root=sqrt(max(disc,.000001));
      const entryDistance=b.negate().sub(root).div(a).toVar();
      const entry=origin.add(direction.mul(entryDistance)).toVar();
      const normal=normalize(entry.div(this.radii.mul(this.radii))).toVar();
      const inside=refract(direction,normal,this.eta).toVar(),scaledInside=inside.div(this.radii);
      const travel=max(dot(entry.div(this.radii),scaledInside).mul(-2).div(max(dot(scaledInside,scaledInside),.00001)),0).toVar();
      const exit=entry.add(inside.mul(travel)).toVar();
      const exitNormal=normalize(exit.div(this.radii.mul(this.radii)));
      const outgoing=refract(inside,exitNormal.negate(),this.eta.reciprocal()).toVar();
      const exitView=this.lensToView.mul(vec4(exit,1)).xyz.toVar();
      const outView=normalize(this.lensToView.mul(vec4(outgoing,0)).xyz).toVar();
      const entryView=this.lensToView.mul(vec4(entry,1)).xyz;
      const sceneZ=perspectiveDepthToViewZ(texture(this.target.depthTexture,st).r,this.near,this.far);
      // Transparent layers do not write depth. Use a bounded virtual image plane
      // for them, explicitly approximate; real opaque depth controls occlusion.
      const imageZ=max(sceneZ,exitView.z.sub(6));
      const rayLength=max(imageZ.sub(exitView.z).div(min(outView.z,-.05)),0);
      const projected=this.projection.mul(vec4(exitView.add(outView.mul(rayLength)),1));
      const refractedUv=vec2(projected.x.div(projected.w).mul(.5).add(.5),projected.y.div(projected.w).mul(-.5).add(.5)).toVar();
      const border=min(min(refractedUv.x,refractedUv.y),min(refractedUv.x.oneMinus(),refractedUv.y.oneMinus()));
      const sourceZ=perspectiveDepthToViewZ(texture(this.target.depthTexture,refractedUv.clamp(.001,.999)).r,this.near,this.far);
      const mask=smoothstep(0,.025,disc.div(a)).mul(smoothstep(.025,.18,travel)).mul(smoothstep(0,.08,entryDistance))
        .mul(smoothstep(0,.12,entryView.z.sub(sceneZ))).mul(smoothstep(0,.12,entryView.z.sub(sourceZ)))
        .mul(smoothstep(.005,.04,border)).mul(this.strength).toVar();
      const bent=texture(this.target.texture,refractedUv.clamp(.001,.999)).rgb;
      const grazing=max(dot(normal,direction.negate()),0).oneMinus().pow(3);
      const highlight=max(dot(normal,normalize(vec3(-.5,.7,1))),0).pow(24);
      const optical=bent.mul(vec3(.994,.999,1)).add(vec3(.015,.035,.046).mul(grazing.mul(.35).add(highlight.mul(.08))));
      return vec4(mix(original.rgb,optical,mask),original.a);
    })();
  }
  async render() {
    if(this.disposed)return;
    if(!this.enabled)return this.renderer.renderAsync(this.scene,this.camera);
    const renderer=this.renderer;
    renderer.getDrawingBufferSize(this.size); this.target.setSize(this.size.x,this.size.y);
    this.camera.updateMatrixWorld(); this.world.compose(this.position,this.rotation,this.unit);
    this.inverse.copy(this.world).invert();
    this.cameraToLens.value.multiplyMatrices(this.inverse,this.camera.matrixWorld);
    this.lensToView.value.multiplyMatrices(this.camera.matrixWorldInverse,this.world);
    this.projection.value.copy(this.camera.projectionMatrix); this.inverseProjection.value.copy(this.camera.projectionMatrixInverse);
    this.near.value=this.camera.near; this.far.value=this.camera.far;
    const previous=renderer.getRenderTarget(),toneMapping=renderer.toneMapping,colorSpace=renderer.outputColorSpace;
    try {
      renderer.setRenderTarget(this.target); await renderer.renderAsync(this.scene,this.camera);
      renderer.setRenderTarget(previous); await this.output.renderAsync();
    } finally {
      renderer.setRenderTarget(previous); renderer.toneMapping=toneMapping; renderer.outputColorSpace=colorSpace;
    }
  }
  state(){return {enabled:this.enabled,position:this.position.toArray(),radii:this.radii.value.toArray(),size:[this.target.width,this.target.height],samples:this.target.samples,format:'RGBA16F + depth24',oceanRenders:1,outputPasses:1,backend:this.renderer.backend.isWebGLBackend?'WebGL2':'WebGPU'};}
  dispose(){if(this.disposed)return;this.disposed=true;this.output.dispose();this.target.dispose();}
}
