import * as THREE from 'three/webgpu';
import {Fn,uniform,texture,vec2,vec3,vec4,normalize,dot,max,min,smoothstep,mix} from 'three/tsl';

// First integration gate: original clock typography, live ocean optical path.
// No renderer, ocean copy, mesh clock or persistent color feedback.
export class OceanIdleGlass {
  constructor(renderer) {
    this.renderer=renderer; this.active=false; this.ready=false; this.amount=uniform(0);
    this.size=uniform(new THREE.Vector2(1280,900)); this.clockKey='';
    this.clock=new THREE.CanvasTexture(document.createElement('canvas'));
    this.clock.colorSpace=THREE.NoColorSpace; this.clock.generateMipmaps=false;
    this.clock.minFilter=THREE.LinearFilter; this.clock.magFilter=THREE.LinearFilter;
    this.last=performance.now(); this.elapsed=0; this.checkAt=0;
    this.resize();
  }
  resize() {
    const w=innerWidth,h=innerHeight;
    if(!(w>0&&h>0))return;
    const changed=this.size.value.x!==w||this.size.value.y!==h;
    this.size.value.set(w,h);
    if(changed||!this.clockKey)this.drawClock();
  }
  drawClock() {
    const d=new Date(),h=String(d.getHours()).padStart(2,'0'),m=String(d.getMinutes()).padStart(2,'0');
    const portrait=this.size.value.y>this.size.value.x*1.15;
    const c=this.clock.image;c.width=portrait?768:1536;c.height=portrait?1280:864;
    const ctx=c.getContext('2d');ctx.fillStyle='black';ctx.fillRect(0,0,c.width,c.height);
    ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';ctx.filter='blur(8px)';
    ctx.font='600 400px "Instrument Sans", sans-serif';
    if(portrait){ctx.fillText(h,384,410);ctx.fillText(m,384,890)}else ctx.fillText(`${h}:${m}`,768,432);
    this.clockKey=`${h}:${m}`;this.clock.needsUpdate=true;
  }
  setActive(value){this.active=Boolean(value);}
  update() {
    const now=performance.now(),dt=document.hidden?0:Math.min(.05,Math.max(0,(now-this.last)/1000));this.last=now;
    this.resize();
    if(!this.active&&this.amount.value===0)return;
    this.elapsed+=dt;
    this.amount.value=THREE.MathUtils.clamp(this.amount.value+(this.active?dt/3:-dt/.8),0,1);
    if(this.elapsed-this.checkAt>1){this.checkAt=this.elapsed;const d=new Date();if(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`!==this.clockKey)this.drawClock();}
  }
  get visible(){return this.amount.value>0;}
  sample(lens,st,base) {
    const field=Fn(([p])=>texture(this.clock,vec2(p.x,p.y.oneMinus())).r);
    return Fn(()=>{
      const e=vec2(1.7).div(this.size),h=field(st).toVar();
      const grad=vec2(field(st.add(vec2(e.x,0))).sub(field(st.sub(vec2(e.x,0)))),field(st.add(vec2(0,e.y))).sub(field(st.sub(vec2(0,e.y))))).toVar();
      const n=normalize(vec3(grad.mul(-16),1)).toVar();
      const strength=this.amount.mul(this.amount).mul(this.amount.mul(-2).add(3));
      const border=min(min(st.x,st.y),min(st.x.oneMinus(),st.y.oneMinus()));
      const offset=n.xy.mul(vec2(this.size.y.div(this.size.x),1)).mul(h).mul(.035).mul(strength).mul(smoothstep(0,.06,border));
      const bent=texture(lens.target.texture,st.add(offset).clamp(.001,.999)).rgb;
      const key=max(dot(n,normalize(vec3(-.65,-.8,.55))),0).pow(18);
      const rim=n.z.oneMinus().pow(2.2);
      const light=vec3(.10,.18,.21).mul(key.mul(.7).add(rim.mul(.3))).mul(strength);
      return vec4(mix(base.rgb,bent.add(light),smoothstep(.02,.3,h).mul(strength)),base.a);
    })();
  }
  state(){return{ready:this.ready,active:this.active,amount:this.amount.value,clock:this.clockKey,size:this.size.value.toArray(),renderer:this.renderer.backend.isWebGLBackend?'WebGL2':'WebGPU',clockTextures:1,simulationTargets:0};}
  dispose(){this.clock.dispose();}
}
