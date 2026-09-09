import { seed, HERO, FLOOR_Y, floorHeight } from './geology.js';

const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const ORIFICE=Object.freeze({x:HERO.x+Math.sin(14.7)*.28+Math.sin(8)*.1,y:FLOOR_Y+HERO.height-.03,z:HERO.z+Math.sin(15.5)*.25});
export const DIFFUSE=Object.freeze([[2.1,1.4],[-1.8,2.2],[1.1,-2.1]].map(([x,z])=>Object.freeze({x:HERO.x+x,y:floorHeight(HERO.x+x,HERO.z+z)+.06,z:HERO.z+z})));

// Fixed-size CPU simulation. Sources and random phases are immutable; only
// numerical state changes. Fixed stepping discards suspension debt.
export class VentDynamics {
  constructor({count=144,diffuseCount=48,snowCount=80,reducedMotion=false}={}) {
    this.smokeCount=count;this.diffuseCount=diffuseCount;this.snowCount=snowCount;
    this.count=count+diffuseCount+snowCount;this.reducedMotion=reducedMotion;
    this.position=new Float32Array(this.count*3);this.velocity=new Float32Array(this.count*3);
    this.current=new Float32Array(this.count*3);this.age=new Float32Array(this.count);
    this.life=new Float32Array(this.count);this.size=new Float32Array(this.count);this.alpha=new Float32Array(this.count);
    this.flow={x:0,y:0,z:0,light:0,wake:0};this.field=null;this.time=0;this.accumulator=0;this.births=0;
    for(let i=0;i<this.count;i++) {this.life[i]=i<count?15+seed(i,3)*5:i<count+diffuseCount?7+seed(i,4)*4:24+seed(i,5)*10;this.reset(i);this.age[i]=-seed(i,9)*this.life[i];}
    // Pre-established continuous discharge, not a burst on the first descent.
    for(let i=0;i<1200;i++)this.step(1/60);
  }
  reset(i) {
    const k=i*3,isSmoke=i<this.smokeCount,isSnow=i>=this.smokeCount+this.diffuseCount;
    const origin=isSmoke?ORIFICE:DIFFUSE[i%DIFFUSE.length],phase=seed(i,18)*Math.PI*2;
    const radius=isSmoke?.08:.5;
    this.position[k]=isSnow?HERO.x+(seed(i,21)-.5)*14:origin.x+Math.sin(phase)*radius;
    this.position[k+1]=isSnow?FLOOR_Y+seed(i,22)*13:origin.y;
    this.position[k+2]=isSnow?HERO.z+(seed(i,23)-.5)*14:origin.z+Math.cos(phase)*radius;
    this.velocity[k]=0;this.velocity[k+1]=isSmoke?1.15:isSnow?-.065:.12;this.velocity[k+2]=0;
    this.current[k]=this.current[k+1]=this.current[k+2]=0;this.age[i]=0;this.births++;
  }
  update(dt) {
    if(!Number.isFinite(dt)||dt<=0||dt>.25)return;
    this.accumulator=Math.min(.1,this.accumulator+dt);
    while(this.accumulator>=1/60-1e-8){this.step(1/60);this.accumulator-=1/60;}
  }
  step(dt) {
    this.time+=dt;const motion=this.reducedMotion?.3:1;
    for(let i=0;i<this.count;i++) {
      const k=i*3;this.age[i]+=dt;
      if(this.age[i]>=this.life[i])this.reset(i);
      if(this.age[i]<0){this.alpha[i]=0;continue;}
      const age=this.age[i],u=age/this.life[i],isSmoke=i<this.smokeCount,isSnow=i>=this.smokeCount+this.diffuseCount;
      const x=this.position[k],y=this.position[k+1],z=this.position[k+2];
      if(this.field)this.field.sample(x,y,z,this.flow);else{this.flow.x=.07;this.flow.y=.01;this.flow.z=.02;this.flow.light=0;}
      const lowpass=1-Math.exp(-dt/.85);
      this.current[k]+=(clamp(this.flow.x,-.65,.65)-this.current[k])*lowpass;
      this.current[k+1]+=(clamp(this.flow.y,-.65,.65)-this.current[k+1])*lowpass;
      this.current[k+2]+=(clamp(this.flow.z,-.65,.65)-this.current[k+2])*lowpass;
      const h=Math.max(0,y-ORIFICE.y),entrainment=isSmoke?Math.min(1,h/6):0;
      const flowGain=isSmoke?.3+entrainment*3.5:isSnow?.5:.28;
      const turbulence=(isSmoke?.05+entrainment*.24:isSnow?.02:.025)*motion;
      const tx=this.current[k]*flowGain+Math.sin(this.time*.48+y*.8+seed(i,6)*6.28)*turbulence;
      const tz=this.current[k+2]*flowGain+Math.cos(this.time*.41+y*.7+seed(i,7)*6.28)*turbulence;
      let ty=isSmoke?1.15*Math.exp(-age*.18)+.045:isSnow?-.065:.12*Math.exp(-age*.15);
      if(isSnow){const dx=x-ORIFICE.x,dz=z-ORIFICE.z;ty+=.35*Math.exp(-(dx*dx+dz*dz)/(1+h*.25))*Math.exp(-Math.abs(h)*.18);}
      ty+=this.current[k+1]*(isSmoke?.4:.2);
      const drag=1-Math.exp(-dt*(isSmoke?2.1:1.2));
      this.velocity[k]+=(tx-this.velocity[k])*drag;this.velocity[k+1]+=(ty-this.velocity[k+1])*drag;this.velocity[k+2]+=(tz-this.velocity[k+2])*drag;
      this.position[k]+=this.velocity[k]*dt;this.position[k+1]+=this.velocity[k+1]*dt;this.position[k+2]+=this.velocity[k+2]*dt;
      const envelope=Math.min(1,age/(isSmoke?.35:1.5))*Math.min(1,(1-u)/(isSmoke?.35:.25));
      this.size[i]=isSmoke?(.2+Math.sqrt(h)*.36)*( .8+seed(i,16)*.45):isSnow?.025+seed(i,17)*.025:.065+age*.016;
      this.alpha[i]=Math.max(0,envelope)*(isSmoke?.32*(1-u*.55):isSnow?.2:.09)*(isSmoke?1:1+Math.min(.6,this.flow.light||0));
    }
  }
  dispose(){this.field=null;this.accumulator=0;}
}

// Exactly one pooled contribution; no Three PointLight or global light-list
// changes. Ownership changes fade through zero instead of moving a light across
// empty water. Animals are observed, never mutated.
export class AnimalLight {
  constructor(){this.index=-1;this.intensity=0;this.x=0;this.y=0;this.z=0;this.activation=0;}
  score(t) {
    if(!t||t.presence<.12)return 0;
    const p=t.medusa.transformationObject.position;
    const d=Math.hypot(p.x-HERO.x,p.z-HERO.z,Math.max(FLOOR_Y-p.y,p.y-(FLOOR_Y+HERO.height),0));
    return Math.max(0,1-d/13)*t.presence*(.7+.3*(t.feature||0));
  }
  update(dt,tissues=[]) {
    if(!Number.isFinite(dt)||dt<=0||dt>.25)return;
    let best=-1,score=.025;
    for(let i=0;i<tissues.length;i++){const s=this.score(tissues[i])*(i===this.index?1.2:1);if(s>score){score=s;best=i;}}
    const switching=best!==this.index;
    const t=tissues[this.index],target=switching?0:this.score(t)*(1+Math.min(.6,t?.activation||0)*.6);
    this.intensity+=(target-this.intensity)*(1-Math.exp(-dt*2.2));
    if(switching&&this.intensity<.007){this.index=best;this.intensity=0;}
    const active=tissues[this.index];
    if(active){const p=active.medusa.transformationObject.position;this.x=p.x;this.y=p.y;this.z=p.z;this.activation=active.activation||0;}
    else this.activation=0;
  }
  dispose(){this.index=-1;this.intensity=0;this.activation=0;}
}
