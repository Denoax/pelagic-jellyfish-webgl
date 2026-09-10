import * as THREE from 'three/webgpu';
import {Fn,uniform,texture,screenUV,vec2,vec4,dot,max,mix,exp,smoothstep} from 'three/tsl';
import {fieldSize,validPoint,IDLE_STEP} from './IdleLiquidState.js';
const ADVECT_STEP=IDLE_STEP*.42, INPUT_STEP=IDLE_STEP*3.2, DAMPING=Math.exp(-IDLE_STEP*2.8);

// Port of Pelagic's original spring/advection idea, not FluidGlass source.
// RG velocity / BA displacement, signed zero-centered RGBA16F throughout.
export class IdleDisplacement {
  constructor(renderer){
    this.renderer=renderer;this.current=0;this.targets=[];this.pointerSeen=false;this.fresh=false;this.clearColor=new THREE.Color();
    this.pointer=new THREE.Vector2(.5,.5);this.previous=this.pointer.clone();
    this.p=uniform(this.pointer.clone());this.prev=uniform(this.previous.clone());
    this.velocity=uniform(new THREE.Vector2());this.input=uniform(0);this.aspect=uniform(1);
    this.event=uniform(new THREE.Vector3());this.eventQueue=new Float32Array(24);this.eventHead=0;this.eventCount=0;
    this.texel=uniform(new THREE.Vector2());this.camera=new THREE.Camera();
    this.material=new THREE.MeshBasicNodeMaterial({depthTest:false,depthWrite:false,toneMapped:false});
    this.scene=new THREE.Scene();this.mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,2),this.material);this.mesh.frustumCulled=false;this.scene.add(this.mesh);
    this.resize(innerWidth,innerHeight);
    this.read=texture(this.targets[0].texture);
    this.material.fragmentNode=this.shader();this.steps=0;
  }
  shader(){return Fn(()=>{
    const st=screenUV,read=p=>this.read.sample(p.clamp(this.texel,this.texel.oneMinus()));
    const old=read(st).toVar();
    const p=st.sub(old.xy.mul(ADVECT_STEP)).toVar(),s=read(p).toVar();
    const e=this.texel;
    const adjacent=read(p.add(vec2(e.x,0))).add(read(p.sub(vec2(e.x,0)))).add(read(p.add(vec2(0,e.y)))).add(read(p.sub(vec2(0,e.y)))).mul(.25).toVar();
    const a=st.sub(this.prev).mul(vec2(this.aspect,1)),b=this.p.sub(this.prev).mul(vec2(this.aspect,1));
    const t=dot(a,b).div(max(dot(b,b),.000001)).clamp(0,1),q=a.sub(b.mul(t));
    const brush=exp(dot(q,q).div(-.009));
    const v=mix(s.xy,adjacent.xy,.12).add(adjacent.zw.sub(s.zw).mul(36).sub(s.zw.mul(5.5)).mul(IDLE_STEP)).mul(DAMPING).add(this.velocity.mul(brush).mul(this.input).mul(INPUT_STEP)).clamp(-.58,.58).toVar();
    const eventOffset=st.sub(this.event.xy),eventQ=eventOffset.mul(vec2(this.aspect,1));
    v.addAssign(eventOffset.mul(exp(dot(eventQ,eventQ).div(-.0025))).mul(this.event.z));
    const d=s.zw.add(v.mul(IDLE_STEP)).clamp(-.17,.17);
    const edge=smoothstep(0,.035,st.x).mul(smoothstep(0,.035,st.y)).mul(smoothstep(0,.035,st.x.oneMinus())).mul(smoothstep(0,.035,st.y.oneMinus()));
    return vec4(v,d).mul(edge);
  })()}
  resize(w,h){
    this.aspect.value=w/h;const[fw,fh]=fieldSize(w,h);this.texel.value.set(1/fw,1/fh);
    if(!this.targets.length)this.targets=[0,1].map(()=>new THREE.RenderTarget(fw,fh,{type:THREE.HalfFloatType,depthBuffer:false,stencilBuffer:false,minFilter:THREE.LinearFilter,magFilter:THREE.LinearFilter,generateMipmaps:false}));
    else if(this.targets[0].width!==fw||this.targets[0].height!==fh){this.targets.forEach(t=>t.setSize(fw,fh));this.needsClear=true;}
    this.needsClear=true;this.pointerSeen=false;
  }
  move(event,w,h){
    if(!validPoint(event,w,h))return false;
    this.pointer.set(THREE.MathUtils.clamp(event.clientX/w,0,1),THREE.MathUtils.clamp(event.clientY/h,0,1));
    if(!this.pointerSeen)this.previous.copy(this.pointer);
    this.pointerSeen=true;this.fresh=true;return true;
  }
  async prepare(){await this.renderer.compileAsync(this.scene,this.camera);await this.run(1,IDLE_STEP);}
  impulse(x,y,strength){if(Number.isFinite(x+y+strength)&&this.eventCount<8){const n=((this.eventHead+this.eventCount)%8)*3;this.eventQueue[n]=x;this.eventQueue[n+1]=y;this.eventQueue[n+2]=THREE.MathUtils.clamp(strength,-.1,.1);this.eventCount++;}}
  async run(steps,dt){
    if(!steps&&!this.needsClear)return;
    const r=this.renderer,target=r.getRenderTarget(),tone=r.toneMapping,space=r.outputColorSpace;
    const clear=this.clearColor;r.getClearColor(clear);const alpha=r.getClearAlpha();
    try{
      r.toneMapping=THREE.NoToneMapping;r.outputColorSpace=THREE.LinearSRGBColorSpace;
      if(this.needsClear){r.setClearColor(0,0);for(const t of this.targets){r.setRenderTarget(t);await r.clearAsync();}this.needsClear=false;this.current=0;}
      this.velocity.value.copy(this.pointer).sub(this.previous).divideScalar(Math.max(dt,IDLE_STEP)).clampLength(0,1.5);
      this.p.value.copy(this.pointer);this.prev.value.copy(this.previous);this.input.value=this.fresh?1:0;
      for(let i=0;i<steps;i++){
        if(this.eventCount){const n=this.eventHead*3;this.event.value.set(this.eventQueue[n],this.eventQueue[n+1],this.eventQueue[n+2]);this.eventHead=(this.eventHead+1)%8;this.eventCount--;}else this.event.value.set(0,0,0);
        this.read.value=this.targets[this.current].texture;r.setRenderTarget(this.targets[1-this.current]);await r.renderAsync(this.scene,this.camera);this.current=1-this.current;this.steps++;
      }
      if(steps){this.previous.copy(this.pointer);this.fresh=false;}
    }finally{r.setRenderTarget(target);r.toneMapping=tone;r.outputColorSpace=space;r.setClearColor(clear,alpha);}
  }
  get texture(){return this.targets[this.current].texture}
  dispose(){this.targets.forEach(t=>t.dispose());this.material.dispose();this.mesh.geometry.dispose();}
}
