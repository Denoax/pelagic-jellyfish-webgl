import * as THREE from 'three/webgpu';
import {seed,floorHeight,gullyCenter,HERO} from './geology.js';

// Original low-cost fractured block: eight unequal corners, bevel rings and a
// broken pitched crown. Shared by attached beds, fallen lips and base talus.
export function ledgeGeometry(){
  const outline=[[-1,-.62],[-.56,-1],[.47,-.88],[1,-.38],[.92,.48],[.38,1],[-.59,.83],[-.94,.21]];
  const p=[],idx=[];
  for(let ring=0;ring<4;ring++)for(let i=0;i<8;i++){
    const [x,z]=outline[i],scale=[.7,1,1,.78][ring];
    p.push(x*scale+(ring===3?.09:0),[-.7,-.36,.18,.49][ring]+(ring>1?.08*Math.sin(i*2.3)+x*.1:0),z*scale);
  }
  for(let r=0;r<3;r++)for(let i=0;i<8;i++){const a=r*8+i,b=r*8+(i+1)%8;idx.push(a,a+8,b,b,a+8,b+8);}
  p.push(.13,.61,-.09,0,-.7,0);
  for(let i=0;i<8;i++){idx.push(32,24+(i+1)%8,24+i);idx.push(33,i,(i+1)%8);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(idx);g.computeVertexNormals();return g;
}

export function surfaceSampler(solids){
  const ray=new THREE.Raycaster(),down=new THREE.Vector3(0,-1,0),origin=new THREE.Vector3();
  return(x,z,maxY=0)=>{ray.set(origin.set(x,maxY,z),down);return ray.intersectObjects(solids,false)[0]||null;};
}

export function mesoLayout(layout,solids){
  const sample=surfaceSampler(solids),items=[],o=new THREE.Object3D(),v=new THREE.Vector3();
  const add=(x,z,sx,sy,sz,angle,tag,tilt=0)=>{
    const hit=sample(x,z);if(!hit)return;
    // A base fan must not use an overhead chimney shoulder as its support.
    if((tag==='vent-apron'||hit.object.name==='active-sulfide-complex')&&hit.point.y>floorHeight(x,z)+2.5)return;
    // Bottom penetrates its support. Upper tiers grow FROM a parent, never
    // hover above it. Preserve the channel's original open central footprint.
    if(Math.abs(x-gullyCenter(z))<1.35&&z< -16&&z> -43)return;
    items.push({p:[x,hit.point.y+sy*.10,z],s:[sx,sy,sz],r:[tilt,angle,tilt*.4],tag,support:hit.point.y,supportName:hit.object.name});
  };
  layout.shelves.forEach((s,f)=>{
    o.position.fromArray(s.p);o.rotation.set(...s.r);o.scale.fromArray(s.s);o.updateMatrix();
    // Related diagonal fracture beds. Irregular spacing follows the same strike
    // through each shelf, while offset rows stop reading as a tiled surface.
    for(let row=0;row<2;row++)for(let col=0;col<5;col++){
      const id=f*40+row*6+col,u=-.75+col*.35+(seed(id,810)-.5)*.18;
      const w=-.38+row*.68+u*.2+(seed(id,811)-.5)*.22;
      if(u*u+w*w>1)continue;
      v.set(u,0,w).applyMatrix4(o.matrix);
      add(v.x,v.z,1.35+seed(id,812)*1.3,.28+seed(id,813)*.5,.45+seed(id,814)*.5,s.r[1]+.2+(seed(id,815)-.5)*.3,'attached-bed',.05*(seed(id,816)-.5));
    }
    // Fractured lips descend into smaller debris on the basin-facing shoulder.
    const facing=f===2||f===3?Math.PI:0;
    for(let j=0;j<9;j++){
      const a=facing-1.1+j*.27;
      for(let tier=0;tier<3;tier++){
        v.set(Math.cos(a)*(1+tier*.14),0,Math.sin(a)*(1+tier*.14)).applyMatrix4(o.matrix);
        const id=f*80+j*3+tier,sc=(1-tier*.24);
        add(v.x,v.z,(1.15+seed(id,820)*.6)*sc,.6*sc,(.9+seed(id,821)*.5)*sc,s.r[1]+.4,'edge-collapse',.12+seed(id,822)*.2);
      }
    }
  });
  // Bank ledges run downstream; staggered bedding exposes a darker inner face
  // and a broken brighter shoulder without drawing a continuous glowing line.
  for(let station=0;station<12;station++)for(const side of [-1,1]){
    const z=-15.5-station*2.4,x=gullyCenter(z)+side*(1.65+seed(station,840)*.4);
    add(x,z,.58+seed(station,841)*.3,.48+seed(station,842)*.35,1.05+seed(station,843)*.35,.13,'bank-lip',side*.10);
  }
  // Accretion aprons and collapse fans connect the hero and four dead spires to
  // the same basin. Keep main vent dominant through a wider, denser base fan.
  [[HERO.x,HERO.z,2.2,22],[-7,-26,.9,8],[7,-32,1.05,9],[-5.5,-35,.8,7],[9,-22,.85,7]].forEach(([x,z,r,n],f)=>{
    for(let i=0;i<n;i++){
      const a=i/n*Math.PI*2,d=r+seed(i,850+f)*1.3,id=f*30+i;
      add(x+Math.cos(a)*d,z+Math.sin(a)*d,.5+seed(id,861)*.65,.35+seed(id,862)*.65,.6+seed(id,863)*.7,a,'vent-apron',.1);
    }
  });
  return items;
}
