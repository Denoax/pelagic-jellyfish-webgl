import * as THREE from 'three/webgpu';
import {uniform,positionLocal,positionWorld,instanceIndex,vec3,mix,float} from 'three/tsl';
import {seed,floorHeight,gullyCenter} from './geology.js';
import {DIFFUSE} from './VentDynamics.js';
import {mineralMaterial} from './materials.js';
import {geologicalWater} from './atmosphere.js';

// Small ecological islands around chemistry, not a global scatter or new species
// simulation. All instances and material graphs are created before scene prewarm.
export function colonyLayout(){
  const sites=[...DIFFUSE,{x:gullyCenter(-30)-2.8,z:-30},{x:gullyCenter(-36)+2.9,z:-36}];
  const filaments=[],shells=[],points=[];
  sites.forEach((o,site)=>{
    for(let i=0;i<32;i++){
      const id=site*32+i,a=seed(id,701)*Math.PI*2;
      const radius=.16+Math.sqrt(seed(id,702))*(site<3?.85:.5);
      const x=o.x+Math.cos(a)*radius,z=o.z+Math.sin(a)*radius*.65,y=floorHeight(x,z);
      const scale=.6+seed(id,703)*1.1;
      filaments.push({p:[x,y+.14*scale,z],s:[.7+seed(id,704)*.6,scale,1],r:[.08*Math.sin(a),a,.12*Math.cos(a)]});
      if(i%2===0){const r=.03+seed(id,705)*.04;shells.push({p:[x+.12,y+.016,z],s:[r,.018,r*1.6],r:[.04,a,.05]});}
      if(i%4===0)points.push({p:[x,y+.045+seed(id,707)*.055,z],s:[.018,.018,.018],r:[0,0,0]});
    }
  });
  return{sites,filaments,shells,points};
}

export function wideLifePoints(points,solids){
  const result=points.map(p=>({p:[...p.p],s:[...p.s],r:[...p.r]}));
  const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),origin=new THREE.Vector3();
  const rocks=solids.filter(o=>['abyssal-basin','basalt-shelves','pillow-flows','layered-basalt-and-channel-banks','active-sulfide-complex'].includes(o.name));
  // One-time attachment, before prewarm. M6.2 floor-only points can be buried
  // under overlapping banks; reveal three existing points per colony, not a
  // second population. Reject tall chimney tops to keep the glow benthic.
  for(let site=0;site<5;site++){
    let selected=0;
    for(const offset of [0,3,6,1,4,7,2,5]){
      const p=result[site*8+offset];ray.set(origin.set(p.p[0],0,p.p[2]),down);
      const hit=ray.intersectObjects(rocks,false)[0];
      if(!hit||hit.point.y-p.p[1]>2.8)continue;
      p.p[1]=hit.point.y+.065;p.s=[.065,.065,.065];
      if(++selected===3)break;
    }
  }
  return result;
}

export class VentLife{
  constructor(owner){
    this.layout=colonyLayout();this.disposed=false;this.time=uniform(0);this.current=uniform(new THREE.Vector2());this.flow={x:0,y:0,z:0};
    const light=owner.light,body=mineralMaterial(light,{life:true});
    const tip=positionLocal.y.add(.14).div(.28).clamp(0,1).pow(2);
    const bend=this.time.mul(.6).add(float(instanceIndex).mul(2.399)).sin().mul(.009);
    body.positionNode=positionLocal.add(vec3(this.current.x.mul(.06).add(bend),0,this.current.y.mul(.06)).mul(tip));
    const stem=new THREE.CylinderGeometry(.005,.012,.28,6,5),p=stem.attributes.position;
    for(let i=0;i<p.count;i++){const h=(p.getY(i)+.14)/.28;p.setX(i,p.getX(i)+Math.sin(h*2.4)*h*.025);}
    stem.computeVertexNormals();
    owner.materials.add(body);owner.instanced(stem,body,this.layout.filaments,'seep-filament-colonies');
    const shell=mineralMaterial(light,{life:true});owner.materials.add(shell);
    owner.instanced(new THREE.SphereGeometry(1,8,5),shell,this.layout.shells,'sheltered-vent-microfauna');
    const m=new THREE.MeshBasicNodeMaterial({depthWrite:true});m.name='rare-local-biological-light';
    const near=positionWorld.distance(light.position).div(8).oneMinus().clamp(0,1).pow(2).mul(light.power);
    const hue=float(instanceIndex).mul(1.71).sin().mul(.5).add(.5);
    // Rare pinpoints, not luminous stone. Warm mineral pigments remain reflected
    // color; only these tiny biological accents carry restrained emission.
    m.fog=false;
    m.colorNode=geologicalWater(mix(vec3(.055,.36,.29),vec3(.22,.12,.36),hue).mul(near.mul(2).add(.8)));
    owner.group.updateMatrixWorld(true);
    this.widePoints=wideLifePoints(this.layout.points,owner.solids);
    owner.materials.add(m);owner.instanced(new THREE.SphereGeometry(1,6,4),m,this.widePoints,'rare-benthic-light-points');
  }
  update(dt,time,field){
    if(this.disposed||!Number.isFinite(dt)||dt<=0||dt>.25)return;
    this.time.value=time;
    const o=DIFFUSE[0];if(field)field.sample(o.x,o.y,o.z,this.flow);else{this.flow.x=.03;this.flow.z=.01;}
    const a=1-Math.exp(-dt/1.1),v=this.current.value;
    v.x+=(Math.max(-.4,Math.min(.4,this.flow.x))-v.x)*a;
    v.y+=(Math.max(-.4,Math.min(.4,this.flow.z))-v.y)*a;
  }
  dispose(){this.disposed=true;}
}
