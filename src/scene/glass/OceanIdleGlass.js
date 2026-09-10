import * as THREE from 'three/webgpu';
import {Fn,uniform,texture,vec2,vec3,vec4,normalize,dot,max,min,smoothstep,mix,exp} from 'three/tsl';
import {IdleDisplacement} from './IdleDisplacement.js';
import {IdleLiquidState,DROPLETS,clockDigits,ease} from './IdleLiquidState.js';

// Same clock/ocean compositor proved at gate one, now driven by scalar topology
// and persistent displacement. No color feedback, renderer or ocean copy.
export class OceanIdleGlass {
  constructor(renderer) {
    this.renderer=renderer; this.active=false; this.ready=false; this.amount=uniform(0);
    this.size=uniform(new THREE.Vector2(1280,900)); this.clockKey='';
    this.clock=new THREE.CanvasTexture(document.createElement('canvas'));
    this.clock.colorSpace=THREE.NoColorSpace; this.clock.generateMipmaps=false;
    this.clock.minFilter=THREE.LinearFilter; this.clock.magFilter=THREE.LinearFilter;
    this.previousClock=this.clock.clone();this.previousClock.image=document.createElement('canvas');
    this.controller=new IdleLiquidState();this.growth=uniform(0);this.erosion=uniform(0);this.minute=uniform(1);
    this.changed=uniform(new THREE.Vector4());this.portrait=uniform(0);
    this.droplets=DROPLETS.map(()=>uniform(new THREE.Vector3()));
    this.fluid=new IdleDisplacement(renderer);this.displacement=texture(this.fluid.texture);
    this.pointerHandler=e=>{if(this.active)this.fluid.move(e,innerWidth,innerHeight)};
    this.hiddenHandler=()=>{this.last=performance.now();this.controller.accumulator=0;this.fluid.fresh=false;this.fluid.pointerSeen=false;};
    window.addEventListener('pointermove',this.pointerHandler,{passive:true});
    document.addEventListener('visibilitychange',this.hiddenHandler);
    this.last=performance.now(); this.elapsed=0; this.checkAt=0;this.cpu=[];this.captureCost=false;this.reviewDate=null;
    this.resize();
  }
  resize() {
    const w=innerWidth,h=innerHeight;
    if(!(w>0&&h>0))return;
    const changed=this.size.value.x!==w||this.size.value.y!==h;
    this.size.value.set(w,h);
    if(changed||!this.clockKey){this.fluid.resize(w,h);this.drawClock(true);}
  }
  drawClock(reset=false,date=this.reviewDate||new Date()) {
    const digits=clockDigits(date),old=this.clockKey.replace(':','');
    const portrait=this.size.value.y>this.size.value.x*1.15;
    this.portrait.value=portrait?1:0;
    const draw=(texture,text)=>{
      const c=texture.image;c.width=portrait?768:1536;c.height=portrait?1280:864;
      const ctx=c.getContext('2d');ctx.fillStyle='black';ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';ctx.filter='blur(8px)';
      ctx.font='600 400px "Instrument Sans", sans-serif';
      if(portrait){ctx.fillText(text.slice(0,2),384,410);ctx.fillText(text.slice(2),384,890)}else ctx.fillText(`${text.slice(0,2)}:${text.slice(2)}`,768,432);
      texture.needsUpdate=true;
    };
    draw(this.previousClock,reset||!old?digits:old);draw(this.clock,digits);
    this.changed.value.set(...Array.from({length:4},(_,i)=>!reset&&old[i]!==digits[i]?1:0));
    this.minute.value=reset?1:0;
    this.clockKey=`${digits.slice(0,2)}:${digits.slice(2)}`;
  }
  setActive(value){
    value=Boolean(value);if(value===this.active)return;
    this.active=value;this.controller.setActive(value);this.fluid.pointerSeen=false;this.fluid.fresh=false;
    if(value)this.drawClock(true);
  }
  async prepare(){await document.fonts.ready;this.drawClock(true);await this.fluid.prepare();}
  async update() {
    const now=performance.now(),dt=document.hidden?0:Math.min(.05,Math.max(0,(now-this.last)/1000));this.last=now;
    this.resize();
    if(!this.active&&this.amount.value===0)return;
    this.elapsed+=dt;
    const steps=this.controller.advance(dt,document.hidden);
    this.amount.value=this.controller.amount;this.growth.value=this.controller.clockGrowth;this.erosion.value=this.controller.erosion;
    this.minute.value=Math.min(1,this.minute.value+dt/2.8);
    if(this.elapsed-this.checkAt>1){this.checkAt=this.elapsed;const d=this.reviewDate||new Date();if(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`!==this.clockKey)this.drawClock(false,d);}
    const t=this.controller.time,entry=this.controller.clockGrowth;
    DROPLETS.forEach((d,i)=>{
      const drift=Math.sin(t*(.035+i*.002)+d.phase),coalesce=ease((this.controller.age-1)/4);
      // Two beads approach the colon's persistent liquid anchors, making an
      // actual implicit neck while the numeral masses acquire cohesion.
      const joins=i===2||i===3;
      const x=d.x+drift*.006+(joins?(.5-d.x)*coalesce:i<6?(.5-d.x)*.08*coalesce:0);
      const y=d.y+Math.cos(t*.028+d.phase)*.008+(joins?((i===2?.46:.55)-d.y)*coalesce:i<6?(.5-d.y)*.55*coalesce:0);
      this.droplets[i].value.set(x,y,d.radius*(.35+.65*ease(this.controller.age/2))*(1-entry*.22)*(1-this.erosion.value));
    });
    if(this.captureCost&&this.cpu.length<20000)this.cpu.push(performance.now()-now);
    await this.fluid.run(steps,dt);this.displacement.value=this.fluid.texture;
  }
  get visible(){return this.amount.value>0;}
  sample(lens,st,base) {
    const field=Fn(([uv])=>{
      const d=this.displacement.sample(uv.clamp(.001,.999)).zw;
      const p=uv.sub(d).toVar(),clockUv=vec2(p.x,p.y.oneMinus());
      const next=texture(this.clock,clockUv).r,old=texture(this.previousClock,clockUv).r;
      const landscape=p.x.lessThan(.33).select(this.changed.x,p.x.lessThan(.5).select(this.changed.y,p.x.lessThan(.67).select(this.changed.z,this.changed.w)));
      const portrait=p.y.lessThan(.5).select(p.x.lessThan(.5).select(this.changed.x,this.changed.y),p.x.lessThan(.5).select(this.changed.z,this.changed.w));
      const changed=this.portrait.greaterThan(.5).select(portrait,landscape);
      // Changed glyphs erode to narrow residual liquid, then regrow. Never
      // simultaneously opacity-blend two complete numerals.
      const phase=this.minute,loss=phase.lessThan(.5).select(phase.mul(2),phase.oneMinus().mul(2));
      const glyph=phase.lessThan(.5).select(old,next).sub(loss.mul(.96).mul(changed));
      const organic=exp(p.sub(vec2(.34,.48)).length().mul(-5)).mul(.12);
      const clock=glyph.sub(this.growth.oneMinus().mul(1.1)).add(organic.mul(this.growth.oneMinus())).sub(this.erosion.mul(1.15));
      const liquid=clock.max(0).toVar();
      const lx=p.x.lessThan(.33).select(.26,p.x.lessThan(.5).select(.41,p.x.lessThan(.67).select(.60,.75)));
      const center=this.portrait.greaterThan(.5).select(vec2(p.x.lessThan(.5).select(.35,.65),p.y.lessThan(.5).select(.32,.70)),vec2(lx,.49));
      const beadDistance=p.sub(center).mul(vec2(this.size.x.div(this.size.y),1));
      liquid.addAssign(exp(dot(beadDistance,beadDistance).div(-.001)).mul(loss.pow(4)).mul(changed).mul(this.growth).mul(this.erosion.oneMinus()));
      for(const drop of this.droplets){
        const q=p.sub(drop.xy).mul(vec2(this.size.x.div(this.size.y),1));
        liquid.addAssign(exp(dot(q,q).div(max(drop.z.mul(drop.z),.000001)).mul(-1.8)).mul(.9));
      }
      // Additive implicit masses form a shared neck, not intersecting circles.
      return smoothstep(.12,.95,liquid).mul(this.amount);
    });
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
      const luma=dot(bent,vec3(.2126,.7152,.0722));
      const adaptation=mix(1,.5,smoothstep(.04,.6,luma));
      const light=vec3(.18,.27,.30).mul(key.mul(.7).add(rim.mul(.3))).mul(strength).mul(adaptation);
      return vec4(mix(base.rgb,bent.add(light),smoothstep(.02,.3,h).mul(strength)),base.a);
    })();
  }
  state(){return{ready:this.ready,active:this.active,amount:this.amount.value,clock:this.clockKey,minute:this.minute.value,phase:this.controller.phase,time:this.controller.time,size:this.size.value.toArray(),renderer:this.renderer.backend.isWebGLBackend?'WebGL2':'WebGPU',clockTextures:2,simulationTargets:2,field:[this.fluid.targets[0].width,this.fluid.targets[0].height],steps:this.fluid.steps,resources:[this.clock.uuid,this.previousClock.uuid,...this.fluid.targets.map(t=>t.texture.uuid)]};}
  dispose(){window.removeEventListener('pointermove',this.pointerHandler);document.removeEventListener('visibilitychange',this.hiddenHandler);this.fluid.dispose();this.clock.dispose();this.previousClock.dispose();}
}
