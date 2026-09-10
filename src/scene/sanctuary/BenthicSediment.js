import {seed} from './geology.js';
import {VentParticles} from './VentParticles.js';
const axes=['x','y','z'];

// Surface-bound suspension using the existing particle renderer. No volumetric
// layer, smoker changes, births/resets or per-frame resource allocations.
export class BenthicSediment{
  constructor(owner){
    this.count=72;this.time=0;this.accumulator=0;this.disposed=false;
    this.position=new Float32Array(this.count*3);this.origin=new Float32Array(this.count*3);
    this.velocity=new Float32Array(this.count*3);this.size=new Float32Array(this.count);this.alpha=new Float32Array(this.count);
    this.flow={x:0,y:0,z:0,light:0};
    const pockets=owner.meso.filter(x=>x.tag==='bank-lip'||x.tag==='vent-apron'||x.tag==='edge-collapse');
    for(let i=0;i<this.count;i++){
      const a=pockets[Math.floor(seed(i,970)*pockets.length)];
      this.origin.set([a.p[0],a.support+.65+seed(i,971)*.7,a.p[2]],i*3);
      this.size[i]=.016+seed(i,972)*.025;this.alpha[i]=.11+seed(i,973)*.06;
    }
    this.position.set(this.origin);this.renderer=new VentParticles(this,owner.light,0,this.count);this.renderer.mesh.name='benthic-current-sediment';owner.group.add(this.renderer.mesh);
  }
  update(dt,field){
    if(this.disposed||!Number.isFinite(dt)||dt<=0||dt>.25)return;
    this.accumulator=Math.min(.1,this.accumulator+dt);
    while(this.accumulator>=1/60-1e-8){this.step(1/60,field);this.accumulator-=1/60;}
    this.renderer.update();
  }
  step(dt,field){
    this.time+=dt;
    for(let i=0;i<this.count;i++){
      const k=i*3;
      if(field)field.sample(this.position[k],this.position[k+1],this.position[k+2],this.flow);
      else{this.flow.x=.03;this.flow.y=0;this.flow.z=.02;}
      for(let axis=0;axis<3;axis++){
        const flow=Math.max(-.4,Math.min(.4,this.flow[axes[axis]]||0));
        const target=flow*.18-(this.position[k+axis]-this.origin[k+axis])*.09;
        this.velocity[k+axis]+=(target-this.velocity[k+axis])*(1-Math.exp(-dt*.8));
        this.position[k+axis]+=this.velocity[k+axis]*dt;
      }
    }
  }
  dispose(){if(this.disposed)return;this.disposed=true;this.renderer.dispose();}
}
