// QA_ONLY. Explicitly loaded by the browser comparison script, never imported
// by production. It observes M3's already rendered depth; M3/M7 code and output
// nodes are untouched. The price of opaque-only application is one-frame AO
// history (reprojected with the previous camera), which must be assessed.
import * as THREE from 'three/webgpu';
import {Fn,texture,textureSize,getViewPosition,uniform,positionWorld,vec2,vec4,mix} from 'three/tsl';
import {ao} from 'three/addons/tsl/display/GTAONode.js';
export class Asset2AOProof{
 constructor({renderer,lens,environment}){
  if(!import.meta.env?.DEV)throw Error('Asset 2 AO proof is development only');
  this.renderer=renderer;this.lens=lens();this.environment=environment;this.disposed=false;this.busy=false;this.frames=0;this.cost=[];
  const l=this.lens;if(!l?.target?.depthTexture)throw Error('Approved depth target unavailable');
  const depth=texture(l.target.depthTexture),inverseProjection=uniform(l.camera.projectionMatrixInverse);
  this.node=ao(depth,null,l.camera);this.node.resolutionScale=.5;this.node.samples.value=8;
  // r175 WebGL depth textureLoad emits a vec4 into a float in its stock
  // getNormalFromDepth helper. Reconstruct from explicit sampled .r instead.
  // The installed GTAONode accepts a sample(uv).rgb normal source. No normal
  // render target, package patch, second ocean or renderer upgrade is needed.
  const normalAt=Fn(([st])=>{
   const pixel=vec2(1).div(textureSize(depth)),z=depth.sample(st).r;
   const lUV=st.sub(vec2(pixel.x,0)),rUV=st.add(vec2(pixel.x,0)),uUV=st.sub(vec2(0,pixel.y)),dUV=st.add(vec2(0,pixel.y));
   const zl=depth.sample(lUV).r,zr=depth.sample(rUV).r,zu=depth.sample(uUV).r,zd=depth.sample(dUV).r;
   const p=getViewPosition(st,z,inverseProjection);
   const dx=zl.sub(z).abs().lessThan(zr.sub(z).abs()).select(p.sub(getViewPosition(lUV,zl,inverseProjection)),getViewPosition(rUV,zr,inverseProjection).sub(p));
   const dy=zu.sub(z).abs().lessThan(zd.sub(z).abs()).select(getViewPosition(uUV,zu,inverseProjection).sub(p),p.sub(getViewPosition(dUV,zd,inverseProjection)));
   return dx.cross(dy).normalize();
  });
  this.node.normalNode={sample:st=>normalAt(st)};
  this.node.radius.value=.65;this.node.thickness.value=.8;this.node.scale.value=1;this.node.distanceFallOff.value=.7;
  this.compute=new THREE.PostProcessing(renderer,this.node);this.compute.outputColorTransform=false;
  this.scratch=new THREE.RenderTarget(1,1,{depthBuffer:false});this.scratch.texture.name='Asset2 DEV AO compute trigger';
  this.history=uniform(new THREE.Matrix4());this.strength=uniform(0);this.valid=uniform(0);
  const clip=this.history.mul(vec4(positionWorld,1)),st=vec2(clip.x.div(clip.w).mul(.5).add(.5),clip.y.div(clip.w).mul(-.5).add(.5));
  const inFrame=st.x.greaterThan(0).and(st.x.lessThan(1)).and(st.y.greaterThan(0)).and(st.y.lessThan(1)).and(clip.w.greaterThan(0));
  // Plain TextureNode: never trigger AO while ocean depth is being written.
  const sampled=texture(this.node.getTextureNode().value,st.clamp(.001,.999)).r;
  const factor=mix(1,sampled,inFrame.select(this.valid.mul(this.strength),0));
  this.materials=environment.surfaces.filter(x=>x.material.name!=='rare-local-biological-light').map(({material})=>{
   const original=material.colorNode;material.colorNode=original.mul(factor);material.needsUpdate=true;return{material,original};
  });
  this.originalRender=renderer.renderAsync;
  const self=this;
  this.wrapper=async function(scene,camera,...rest){
   const target=renderer.getRenderTarget();const result=await self.originalRender.call(renderer,scene,camera,...rest);
   if(!self.disposed&&!self.busy&&scene===self.lens.scene&&target===self.lens.target&&!self.lens.idle?.visible){
    self.busy=true;const started=performance.now();
    try{renderer.setRenderTarget(self.scratch);await self.compute.renderAsync();self.history.value.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);self.valid.value=1;self.frames++;if(self.cost.length<20000)self.cost.push(performance.now()-started);}
    finally{renderer.setRenderTarget(target);self.busy=false;}
   }return result;
  };renderer.renderAsync=this.wrapper;
 }
 set(mode){this.environment.materialAO.value=mode==='B'?0:1;this.strength.value=mode==='A'?0:.55;}
 state(){return{frames:this.frames,AOSize:this.node.resolution.value.toArray(),samples:this.node.samples.value,extraOceanPasses:0,extraTargets:2,fullResolutionBeautyTargets:0,historyFrames:1,cost:this.cost};}
 dispose(){if(this.disposed)return;this.disposed=true;this.strength.value=0;this.materials.forEach(({material,original})=>{material.colorNode=original;material.needsUpdate=true;});if(this.renderer.renderAsync===this.wrapper)this.renderer.renderAsync=this.originalRender;this.environment.materialAO.value=1;this.node.dispose();this.node._noiseNode.value.dispose();this.compute.dispose();this.scratch.dispose();}
}
