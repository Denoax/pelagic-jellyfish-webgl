import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const FLOOR_Y = -15;
export const BASIN_SIZE = 192;
export const HERO = Object.freeze({ x: -2.4, z: -24, height: 12, radius: 1.65 });
export function seed(i, salt = 1) { const v = Math.sin(i * 91.73 + salt * 37.11) * 43758.5453; return v - Math.floor(v); }
export const GULLY=Object.freeze({x:3,drift:.10,bend:.8,frequency:.13,depth:3.2,front:-12,back:-46});
const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function gullyCenter(z){return GULLY.x+(z+24)*GULLY.drift+Math.sin((z+24)*GULLY.frequency)*GULLY.bend;}
export function gullyDepth(x,z){
  const envelope=smooth(GULLY.front,GULLY.front-7,z)*smooth(GULLY.back,GULLY.back+7,z);
  const width=1.3+.15*Math.sin(z*.21);
  return GULLY.depth*envelope*(1-smooth(width*.35,width*1.9,Math.abs(x-gullyCenter(z))));
}
export function floorHeight(x, z) {
  return FLOOR_Y + .18 * Math.sin(x * .19 + z * .13) + .09 * Math.cos(z * .41 - x * .22)
    - .65 * Math.exp(-(x*x / 190 + (z+23)**2 / 320))-gullyDepth(x,z);
}

// A quiet basin; sampling concentrated around the inhabited end, not a uniformly
// dense terrain grid. No camera/progress inputs participate in persistent layout.
export function basinGeometry() {
  const g = new THREE.PlaneGeometry(BASIN_SIZE, BASIN_SIZE, 80, 80); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position;
  for (let i=0;i<p.count;i++) {
    const x = Math.sign(p.getX(i)) * (Math.abs(p.getX(i))/96)**1.6 * 96;
    const z = Math.sign(p.getZ(i)) * (Math.abs(p.getZ(i))/96)**1.6 * 96 - 28;
    p.setXYZ(i,x,floorHeight(x,z),z);
  }
  g.computeVertexNormals(); return g;
}

export function lobeGeometry(salt=7) {
  const g=new THREE.SphereGeometry(1,24,14), p=g.attributes.position;
  for(let i=0;i<p.count;i++) {
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const r=1+.075*Math.sin(x*7+z*3+salt)+.035*Math.sin(z*13-y*8);
    p.setXYZ(i,x*r,y*r*(1+.08*Math.cos(z*5)),z*r);
  }
  g.computeVertexNormals();return g;
}

export function shelfGeometry() {
  const g=new THREE.SphereGeometry(1,40,20),p=g.attributes.position;
  for(let i=0;i<p.count;i++) {
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x);
    const edge=1+.10*Math.sin(a*3+.8)+.05*Math.cos(a*7)+.024*Math.sin(a*17+y*8);
    const strata=1+.025*Math.sin(y*29+a*2);
    p.setXYZ(i,x*edge*strata,Math.sign(y)*Math.abs(y)**.48*.52+.025*Math.sin(x*9+z*7),z*edge*strata);
  }
  g.computeVertexNormals();return g;
}

export function sanctuaryLayout() {
  // Shelves frame an empty central basin. Pillow lobes flow down their outside
  // shoulders, instead of being scattered independently over the whole floor.
  const shelves=[
    {p:[-11,-13.1,-15],s:[8,2.4,6],r:[.06,.33,-.11]},
    {p:[-15,-12.3,-24],s:[9,3.3,7],r:[.12,-.35,-.13]},
    {p:[12,-13.3,-20],s:[7,2.5,9],r:[.03,-.4,.12]},
    {p:[16,-12.9,-32],s:[10,3.4,8],r:[-.09,.35,.13]},
    {p:[-7,-14,-37],s:[12,2.5,5],r:[.1,.2,0]},
  ];
  const pillows=[];
  for(let stream=0;stream<4;stream++) for(let i=0;i<15;i++) {
    const t=i/14, side=stream%2?-1:1;
    const x=side*(9+stream*1.6+Math.sin(t*4+stream)*2.2)+(seed(i,stream+12)-.5)*2.4;
    const z=-11-t*28-stream*2;
    pillows.push({p:[x,floorHeight(x,z)+.45+seed(i,32+stream)*.8,z],
      s:[.75+seed(i,41)*.65,.38+seed(i,53)*.45,1.3+seed(i,61)*1.4],r:[.13*seed(i),side*.4,.12*seed(i,2)]});
  }
  // Three related basalt terrace families. Shared orientation and buried lower
  // tiers describe fractures/flows, not a field of independent scattered props.
  const terraces=[];
  for(const [family,x,z,angle]of [[0,-8,-22,.28],[1,10,-29,-.38],[2,-6,-38,.16]]){
    for(let tier=0;tier<3;tier++){
      const px=x+(family===1?-1:1)*tier*.8,pz=z+tier*1.1;
      terraces.push({p:[px,floorHeight(px,pz)+.45+tier*.8,pz],s:[5-tier*.8,.85,3.5-tier*.55],r:[.04,angle,.025*(family-1)]});
    }
  }
  const banks=[],rubble=[];
  for(let station=0;station<9;station++){
    const z=-16-station*3.1;
    for(const side of [-1,1]){
      const x=gullyCenter(z)+side*(2.3+seed(station,22)*.35);
      banks.push({p:[x,floorHeight(x,z)+.05,z],s:[.9,.7+seed(station,27)*.45,1.7],r:[.06,side*.16+seed(station,33)*.12,side*.12]});
      // Talus stays on the OUTER bank. Do not fill the channel's negative space.
      for(let k=0;k<4;k++){
        const salt=station*8+k+(side===1?4:0),px=x+side*(.8+seed(salt,301)*1.6),pz=z+(seed(salt,302)-.5)*2.5;
        const scale=.16+seed(salt,303)*.5;
        rubble.push({p:[px,floorHeight(px,pz)+scale*.15,pz],s:[scale,scale*.55,scale*1.4],r:[seed(salt,304)*.3,seed(salt,305)*6.28,seed(salt,306)*.2]});
      }
    }
  }
  return {shelves,pillows,terraces,banks,rubble};
}

export function fractureGeometry(){
  const g=new THREE.SphereGeometry(1,24,12),p=g.attributes.position;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    p.setXYZ(i,x*(1+.11*Math.sin(z*6+y*2)),y*.65+.055*Math.sin(x*5+z*3),z*(1+.09*Math.sin(x*7)));
  }
  g.computeVertexNormals();return g;
}

export function deadSpireGeometry(){
  const parts=[[-7,-26,3.1,.72],[7,-32,3.8,.85],[-5.5,-35,2.6,.65],[9,-22,2.1,.7]].map(([x,z,height,radius],i)=>
    chimneyColumn({x,y:floorHeight(x,z)-.2,z,height,radius,salt:170+i*9,radial:24,levels:24}));
  const merged=mergeGeometries(parts);parts.forEach(g=>g.dispose());return merged;
}

// Sulfide growth: bent centerline, irregular accretion at several scales, offset
// branch columns and actual thick-walled outlets. No rotationally symmetric cone.
function crustRadius(t,a,salt,radius){
  const foot=radius*(.26+.64*(1-t)**.7+.28*Math.exp(-t*12));
  return foot*(1+.16*Math.sin(a*3+salt+t*3)+.105*Math.cos(a*5-t*8)+.065*Math.sin(a*11+t*21))
    *(1+.08*Math.sin(t*37+3*Math.sin(t*11)+a*3)+.045*Math.sin(t*97+Math.sin(a*7)*2));
}
export function chimneyColumn({x=0,y=0,z=0,height=12,radius=1.6,salt=11,radial=48,levels=70}={}) {
  const positions=[],indices=[];
  const center=(t)=>[x+Math.sin(t*3.7+salt)*.28*t+Math.sin(t*8)*.1*t,z+Math.sin(t*4.5+salt)*.25*t];
  const ring=(t,inner=false)=>{
    const [cx,cz]=center(t);
    for(let j=0;j<=radial;j++) {
      const a=j/radial*Math.PI*2;
      const r=crustRadius(t,a,salt,radius)*(inner?.47:1);
      positions.push(cx+Math.cos(a)*r,y+t*height+(inner?-.3:0)+Math.sin(a*5+salt)*.055*t,cz+Math.sin(a)*r);
    }
  };
  for(let i=0;i<=levels;i++)ring(i/levels);
  ring(1,true);
  for(let i=0;i<=levels;i++) for(let j=0;j<radial;j++) {
    const a=i*(radial+1)+j,b=a+radial+1;
    indices.push(a,b,a+1,a+1,b,b+1);
  }
  // Caps close base and recessed dark throat; top outer annulus remains visible.
  for(const [row,top] of [[0,false],[levels+1,true]]) {
    const n=positions.length/3,[cx,cz]=center(top?1:0);
    positions.push(cx,y+(top?height-.42:0),cz);
    for(let j=0;j<radial;j++) {const a=row*(radial+1)+j;indices.push(n,top?a:a+1,top?a+1:a);}
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
}

export function chimneyGeometry(height=HERO.height) {
  const params=[
    {x:HERO.x,y:FLOOR_Y,z:HERO.z,height,radius:HERO.radius,salt:11},
    {x:HERO.x+1.4,y:FLOOR_Y-.2,z:HERO.z+.45,height:height*.68,radius:1.02,salt:37},
    {x:HERO.x-1.15,y:FLOOR_Y-.2,z:HERO.z+.8,height:height*.5,radius:.86,salt:51},
    {x:HERO.x+.6,y:FLOOR_Y-.2,z:HERO.z-1.1,height:height*.83,radius:.87,salt:71},
  ];
  // Bury each foot into the actual local basin, preserving the tested crown
  // heights. A constant Y base leaves exposed air gaps over the depressed floor.
  for(const p of params){const base=floorHeight(p.x,p.z)-.12;p.height+=p.y-base;p.y=base;}
  const parts=params.map(chimneyColumn),merged=mergeGeometries(parts);parts.forEach(g=>g.dispose());return merged;
}

export function mineralAccretions() {
  const pieces=[],base=floorHeight(HERO.x,HERO.z)-.12,height=HERO.height+FLOOR_Y-base;
  for(let i=0;i<112;i++){
    const t=.08+seed(i,207)*.88,a=seed(i,208)*Math.PI*2;
    const r=crustRadius(t,a,11,HERO.radius);
    const width=.08+seed(i,209)*.18;
    pieces.push({p:[HERO.x+Math.sin(t*3.7+11)*.28*t+Math.sin(t*8)*.1*t+Math.cos(a)*(r-.08),base+t*height,HERO.z+Math.sin(t*4.5+11)*.25*t+Math.sin(a)*(r-.08)],s:[width,.04+seed(i,210)*.11,width*.8],r:[seed(i,211)*.3,a,seed(i,212)*.25]});
  }
  return pieces;
}
