import * as THREE from 'three/webgpu';
import {Fn,Loop,If,uniformArray,uniform,texture,vec2,vec3,vec4,normalize,dot,max,min,smoothstep,mix,exp} from 'three/tsl';
import {IdleDisplacement} from './IdleDisplacement.js';
import {IdleLiquidState,DROPLETS,clockDigits,ease} from './IdleLiquidState.js';
import {strokeAnchors,entryDrop,exitDrop} from './LiquidChoreography.js';

// Same clock/ocean compositor proved at gate one, now driven by scalar topology
// and persistent displacement. No color feedback, renderer or ocean copy.
export class OceanIdleGlass {
  constructor(renderer) {
    this.renderer=renderer; this.active=false; this.ready=false; this.amount=uniform(0);
    this.size=uniform(new THREE.Vector2(1280,900)); this.clockKey='';
    this.clock=new THREE.CanvasTexture(document.createElement('canvas'));
    this.clock.colorSpace=THREE.NoColorSpace; this.clock.generateMipmaps=false;
    this.clock.minFilter=THREE.LinearFilter; this.clock.magFilter=THREE.LinearFilter;
    // Texture.clone shares Source in r175. Minute topology needs independent masks.
    this.previousClock=new THREE.CanvasTexture(document.createElement('canvas'));
    this.previousClock.colorSpace=THREE.NoColorSpace;this.previousClock.generateMipmaps=false;
    this.previousClock.minFilter=THREE.LinearFilter;this.previousClock.magFilter=THREE.LinearFilter;
    this.controller=new IdleLiquidState();this.growth=uniform(0);this.erosion=uniform(0);this.minute=uniform(1);
    this.changed=uniform(new THREE.Vector4());this.portrait=uniform(0);
    this.cuts=uniform(new THREE.Vector4(.33,.5,.67,.5));this.colon=uniform(new THREE.Vector2(.44,.51));this.clockLayout=null;
    this.droplets=DROPLETS.map(()=>uniform(new THREE.Vector4()));
    this.sites=DROPLETS.map(()=>uniform(new THREE.Vector4()));
    this.oldSites=DROPLETS.map(()=>uniform(new THREE.Vector4()));
    this.necks=DROPLETS.map(()=>uniform(new THREE.Vector4()));
    this.dropArray=uniformArray(this.droplets.map(d=>d.value),'vec4');
    this.neckArray=uniformArray(this.necks.map(d=>d.value),'vec4');
    this.age=uniform(0);this.exitAge=uniform(0);this.events=new Uint8Array(8);
    this.dropState=DROPLETS.map(()=>({}));this.anchors=[];
    this.maskProbe=document.createElement('canvas');this.maskProbe.width=192;this.maskProbe.height=192;
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
    if(reset||!this.clockLayout){
      const c=this.maskProbe.getContext('2d');c.font='600 400px "Instrument Sans", sans-serif';
      const width=portrait?768:1536,height=portrait?1280:864,text=`${digits.slice(0,2)}:${digits.slice(2)}`;
      this.clockLayout=Array.from({length:4},(_,i)=>{
        const row=portrait?digits.slice(i<2?0:2,i<2?2:4):text,index=portrait?i%2:i<2?i:i+1;
        const left=width/2-c.measureText(row).width/2+c.measureText(row.slice(0,index)).width;
        const right=width/2-c.measureText(row).width/2+c.measureText(row.slice(0,index+1)).width;
        return{left:left/width,right:right/width,cy:(portrait?(i<2?410:890):432)/height};
      });
      this.cuts.value.set(this.clockLayout[0].right,(this.clockLayout[1].right+this.clockLayout[2].left)/2,this.clockLayout[2].right,.5);
      this.colon.value.set(this.clockLayout[1].right,this.clockLayout[2].left);
    }
    const draw=(texture,text)=>{
      const c=texture.image;c.width=portrait?768:1536;c.height=portrait?1280:864;
      const ctx=c.getContext('2d');ctx.fillStyle='black';ctx.fillRect(0,0,c.width,c.height);
      ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';ctx.filter='blur(8px)';
      ctx.font='600 400px "Instrument Sans", sans-serif';
      // Fixed per-entry centers: a changed minute never slides the untouched hours.
      for(let i=0;i<4;i++){const b=this.clockLayout[i];ctx.fillText(text[i],(b.left+b.right)*.5*c.width,b.cy*c.height);}
      if(!portrait)ctx.fillText(':',this.cuts.value.y*c.width,432);
      texture.needsUpdate=true;
    };
    draw(this.previousClock,reset||!old?digits:old);draw(this.clock,digits);
    const probe=this.maskProbe,ctx=probe.getContext('2d',{willReadFrequently:true});
    ctx.drawImage(this.clock.image,0,0,192,192);
    const anchors=strokeAnchors(ctx.getImageData(0,0,192,192).data,192,192,portrait,this.clockLayout);
    this.sites.forEach((s,i)=>{this.oldSites[i].value.copy(s.value);const a=anchors[i];s.value.set(a.x,a.y,a.start,0);if(reset)this.oldSites[i].value.copy(s.value)});
    this.anchors=anchors;
    this.changed.value.set(...Array.from({length:4},(_,i)=>!reset&&old[i]!==digits[i]?1:0));
    if(!reset&&this.active)for(let i=0;i<4;i++)if(old[i]!==digits[i]){const a=anchors[i*2];this.fluid.impulse(a.x,a.y,-.05);}
    this.minute.value=reset?1:0;
    this.clockKey=`${digits.slice(0,2)}:${digits.slice(2)}`;
  }
  setActive(value){
    value=Boolean(value);if(value===this.active)return;
    this.active=value;this.controller.setActive(value);this.fluid.pointerSeen=false;this.fluid.fresh=false;
    this.events.fill(0);this.fluid.eventCount=0;
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
    this.age.value=this.controller.age;this.exitAge.value=this.controller.active?0:this.controller.exitAge;
    this.minute.value=Math.min(1,this.minute.value+dt/2.8);
    if(this.elapsed-this.checkAt>1){this.checkAt=this.elapsed;const d=this.reviewDate||new Date();if(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`!==this.clockKey)this.drawClock(false,d);}
    const aspect=this.size.value.x/this.size.value.y;
    this.anchors.forEach((a,i)=>{
      const d=this.active?entryDrop(this.controller.age,a,i,aspect,this.dropState[i]):exitDrop(this.controller.exitAge,a,i,aspect,this.dropState[i]);
      this.droplets[i].value.set(d.x,d.y,d.radius,d.stretch);
      this.necks[i].value.set(a.x+d.recoil/aspect,a.y,d.neck,0);
      if(this.active&&!this.events[i]&&this.controller.age>a.start+.93){this.events[i]=1;this.fluid.impulse(a.x,a.y,-.065);}
      if(!this.active&&!this.events[i]&&this.controller.exitAge>.54+(i%3)*.025){this.events[i]=1;this.fluid.impulse(a.x,a.y,.08);}
    });
    if(this.captureCost&&this.cpu.length<20000)this.cpu.push(performance.now()-now);
    await this.fluid.run(steps,dt);this.displacement.value=this.fluid.texture;
  }
  get visible(){return this.amount.value>0;}
  sample(lens,st,base) {
    const field=Fn(([uv])=>{
      const d=this.displacement.sample(uv.clamp(.001,.999)).zw;
      const p=uv.sub(d).toVar(),aspect=vec2(this.size.x.div(this.size.y),1);
      const choose=(a,b,c,d)=>this.portrait.greaterThan(.5).select(p.y.lessThan(.5).select(p.x.lessThan(.5).select(a,b),p.x.lessThan(.5).select(c,d)),p.x.lessThan(this.cuts.x).select(a,p.x.lessThan(this.cuts.y).select(b,p.x.lessThan(this.cuts.z).select(c,d))));
      const a=choose(this.sites[0],this.sites[2],this.sites[4],this.sites[6]).toVar();
      const b=choose(this.sites[1],this.sites[3],this.sites[5],this.sites[7]).toVar();
      const oa=choose(this.oldSites[0],this.oldSites[2],this.oldSites[4],this.oldSites[6]).toVar();
      const ob=choose(this.oldSites[1],this.oldSites[3],this.oldSites[5],this.oldSites[7]).toVar();
      const landscape=p.x.lessThan(this.cuts.x).select(this.changed.x,p.x.lessThan(this.cuts.y).select(this.changed.y,p.x.lessThan(this.cuts.z).select(this.changed.z,this.changed.w)));
      const portrait=p.y.lessThan(.5).select(p.x.lessThan(.5).select(this.changed.x,this.changed.y),p.x.lessThan(.5).select(this.changed.z,this.changed.w));
      const isColon=this.portrait.lessThan(.5).and(p.x.greaterThan(this.colon.x)).and(p.x.lessThan(this.colon.y));
      const changed=isColon.select(0,this.portrait.greaterThan(.5).select(portrait,landscape)).toVar();
      const phase=this.minute,loss=phase.lessThan(.5).select(phase.mul(2),phase.oneMinus().mul(2)).toVar();
      // Each changed stroke retracts toward its two local liquid reservoirs.
      // The reservoirs migrate before the new strokes reconnect. No glyph alpha mix.
      const localA=mix(oa.xy,a.xy,smoothstep(.22,.78,phase)).toVar();
      const localB=mix(ob.xy,b.xy,smoothstep(.22,.78,phase)).toVar();
      const share=smoothstep(-.045,.045,p.sub(localB).mul(aspect).length().sub(p.sub(localA).mul(aspect).length())).toVar();
      const center=mix(localB,localA,share).toVar();
      const source=phase.lessThan(.5).select(mix(ob.xy,oa.xy,share),mix(b.xy,a.xy,share)).toVar();
      const collapse=smoothstep(.04,.86,loss).mul(changed).toVar();
      const mapped=mix(p,source.add(p.sub(center).div(collapse.mul(-.65).add(1))),changed).toVar();
      const clockUv=vec2(mapped.x,mapped.y.oneMinus()).toVar();
      const next=texture(this.clock,clockUv).r.toVar(),old=texture(this.previousClock,clockUv).r.toVar();
      const glyph=phase.lessThan(.5).select(old,next).sub(collapse.mul(1.03)).toVar();
      const arrival=min(p.sub(a.xy).mul(aspect).length().mul(6.8).add(a.z),p.sub(b.xy).mul(aspect).length().mul(7.4).add(b.z)).toVar();
      const localGrowth=smoothstep(arrival,arrival.add(.85),this.age).toVar();
      const exitFront=smoothstep(arrival.mul(.11),arrival.mul(.11).add(.55),this.exitAge).toVar();
      const clock=glyph.sub(localGrowth.oneMinus().mul(1.1)).sub(exitFront.mul(1.15));
      const liquid=clock.max(0).toVar();
      for(const site of [localA,localB]){
        const q=p.sub(site).mul(aspect);
        liquid.addAssign(exp(dot(q,q).div(-.0014)).mul(smoothstep(.18,.65,loss)).mul(changed).mul(this.growth).mul(this.erosion.oneMinus()));
      }
      If(this.age.lessThan(4).or(this.exitAge.greaterThan(0)),()=>{Loop(8,({i})=>{
        const drop=this.dropArray.element(i).toVar(),neck=this.neckArray.element(i).toVar();
        const q=p.sub(drop.xy).mul(aspect).toVar(),axis=neck.xy.sub(drop.xy).mul(aspect).toVar();
        const direction=axis.div(max(axis.length(),.00001)).toVar();
        const along=dot(q,direction).toVar(),across=q.sub(direction.mul(along)).toVar();
        const oval=along.div(drop.w.mul(.6).add(1)).pow(2).add(dot(across,across).mul(drop.w.mul(.2).add(1))).toVar();
        liquid.addAssign(exp(oval.div(max(drop.z.mul(drop.z),.000001)).mul(-1.8)).mul(.9));
        const t=dot(q,axis).div(max(dot(axis,axis),.000001)).clamp(0,1).toVar(),bridge=q.sub(axis.mul(t)).toVar();
        liquid.addAssign(exp(dot(bridge,bridge).div(max(neck.z.mul(neck.z),.0000001)).mul(-1.8)).mul(neck.z.greaterThan(.0001).select(.7,0)));
      });});
      // Additive implicit masses form a shared neck, not intersecting circles.
      return smoothstep(.12,.95,liquid).mul(this.amount);
    }).setLayout({name:'pelagicIdleLiquid',type:'float',inputs:[{name:'uv',type:'vec2'}]});
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
  state(){return{ready:this.ready,prewarmMilliseconds:this.prewarmMilliseconds,active:this.active,amount:this.amount.value,clock:this.clockKey,minute:this.minute.value,phase:this.controller.phase,time:this.controller.time,size:this.size.value.toArray(),renderer:this.renderer.backend.isWebGLBackend?'WebGL2':'WebGPU',clockTextures:2,simulationTargets:2,field:[this.fluid.targets[0].width,this.fluid.targets[0].height],steps:this.fluid.steps,resources:[this.clock.uuid,this.previousClock.uuid,...this.fluid.targets.map(t=>t.texture.uuid)]};}
  dispose(){window.removeEventListener('pointermove',this.pointerHandler);document.removeEventListener('visibilitychange',this.hiddenHandler);this.fluid.dispose();this.clock.dispose();this.previousClock.dispose();}
}
