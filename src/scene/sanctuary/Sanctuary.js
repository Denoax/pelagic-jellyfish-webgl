import * as THREE from 'three/webgpu';
import { color, normalWorld, vec3 } from 'three/tsl';
import { FLOOR_Y, HERO, BASIN_SIZE, basinGeometry, lobeGeometry, shelfGeometry, sanctuaryLayout, chimneyGeometry, chimneyColumn } from './geology.js';
import { seed, floorHeight, mineralAccretions } from './geology.js';
import { VentDynamics, AnimalLight, DIFFUSE } from './VentDynamics.js';
import { VentParticles } from './VentParticles.js';
import { lightUniforms, mineralMaterial } from './materials.js';
import { ThermalShimmer } from './ThermalShimmer.js';

export class Sanctuary {
  constructor(scene,{reducedMotion=false}={}) {
    this.group=new THREE.Group();this.group.name='abyssal-hydrothermal-sanctuary';scene.add(this.group);
    this.geometries=new Set();this.materials=new Set();this.disposed=false;this.reducedMotion=reducedMotion;
    this.layout=sanctuaryLayout();this.solids=[];
    const query=typeof location==='undefined'?null:new URLSearchParams(location.search);
    this.blockout=Boolean(import.meta.env?.DEV&&query?.get('sanctuaryBlockout')==='1');
    this.light=lightUniforms();this.animalLight=new AnimalLight();
    this.thermal=new ThermalShimmer();
    const mat=this.blockout?new THREE.MeshBasicNodeMaterial():mineralMaterial(this.light);
    if(this.blockout)mat.colorNode=color('#868686').mul(normalWorld.dot(vec3(-.4,.7,.55).normalize()).mul(.4).add(.6));
    const chimneyMat=this.blockout?mat:mineralMaterial(this.light,{chimney:true});
    this.materials.add(mat);
    this.add(basinGeometry(),this.blockout?mat:mineralMaterial(this.light,{floor:true}),'abyssal-basin');
    const lobe=lobeGeometry();this.instanced(shelfGeometry(),mat,this.layout.shelves,'basalt-shelves');
    this.instanced(lobe,mat,this.layout.pillows,'pillow-flows');
    const height=import.meta.env?.DEV?Number(query?.get('chimneyHeight'))||HERO.height:HERO.height;
    this.height=height;this.add(chimneyGeometry(height),chimneyMat,'active-sulfide-complex');
    this.add(chimneyColumn({x:12,y:floorHeight(12,-35)-.1,z:-35,height:6.2,radius:1.2,salt:121}),chimneyMat,'inactive-spire-east');
    this.add(chimneyColumn({x:-15,y:floorHeight(-15,-40)-.1,z:-40,height:7.4,radius:1.4,salt:151}),chimneyMat,'inactive-spire-west');
    if(!this.blockout){
      this.instanced(new THREE.IcosahedronGeometry(1,1),chimneyMat,mineralAccretions(),'sulfide-accretion-shoulders');
      const tubes=[];
      for(let i=0;i<36;i++){
        const o=DIFFUSE[i%3],a=seed(i,71)*Math.PI*2,r=seed(i,72)*.7;
        const x=o.x+Math.sin(a)*r,z=o.z+Math.cos(a)*r,scale=.65+seed(i,75)*1.4;
        if(i%2===0)tubes.push({p:[x,floorHeight(x,z)+.1*scale,z],s:[1,scale,1],r:[.18*Math.sin(a),a,.2*Math.cos(a)]});
      }
      const chalk=mineralMaterial(this.light,{life:true});this.materials.add(chalk);
      this.instanced(new THREE.CylinderGeometry(.012,.023,.22,6,2),chalk,tubes,'sparse-vent-tubes');
      this.sim=new VentDynamics({reducedMotion});
      this.plume=new VentParticles(this.sim,this.light,0,this.sim.smokeCount,true);
      this.diffuse=new VentParticles(this.sim,this.light,this.sim.smokeCount,this.sim.diffuseCount+this.sim.snowCount);
      this.group.add(this.plume.mesh,this.diffuse.mesh);
    }
    this.lastTime=null;this.cpu=new Float32Array(8192);this.cpuCursor=0;this.cpuCount=0;
    this.group.updateMatrixWorld(true);
  }
  add(g,m,name){this.geometries.add(g);this.materials.add(m);const mesh=new THREE.Mesh(g,m);mesh.name=name;this.group.add(mesh);this.solids.push(mesh);return mesh;}
  instanced(g,m,items,name){this.geometries.add(g);const mesh=new THREE.InstancedMesh(g,m,items.length),o=new THREE.Object3D();items.forEach((a,i)=>{o.position.fromArray(a.p);o.scale.fromArray(a.s);o.rotation.set(...a.r);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.name=name;mesh.computeBoundingSphere();this.group.add(mesh);this.solids.push(mesh);return mesh;}
  connect(field,tissues,camera){this.field=field;this.tissues=tissues;this.camera=camera;if(this.sim)this.sim.field=field;}
  update(elapsed){
    if(this.disposed)return;
    const started=performance.now(),dt=this.lastTime===null?0:elapsed-this.lastTime;this.lastTime=elapsed;
    if(this.sim){this.sim.update(dt);this.plume.update();this.diffuse.update();}
    this.thermal.time.value=this.sim?.time||0;
    this.animalLight.update(dt,this.tissues);
    this.light.position.value.set(this.animalLight.x,this.animalLight.y,this.animalLight.z);this.light.power.value=this.animalLight.intensity;
    this.cpu[this.cpuCursor++%this.cpu.length]=performance.now()-started;this.cpuCount=Math.min(this.cpuCount+1,this.cpu.length);
  }
  state(){return{floorY:FLOOR_Y,basinSize:BASIN_SIZE,chimney:{...HERO,height:this.height},solids:this.solids.length,opaque:this.solids.every(m=>!m.material.transparent&&m.material.opacity===1),geometries:this.geometries.size,materials:this.materials.size,blockout:this.blockout,plumeCount:this.sim?.smokeCount||0,diffuseCount:this.sim?.diffuseCount||0,localSnowCount:this.sim?.snowCount||0,plumeTime:this.sim?.time,light:{index:this.animalLight.index,intensity:this.animalLight.intensity,position:[this.animalLight.x,this.animalLight.y,this.animalLight.z]},extraOceanPasses:0};}
  dispose(){if(this.disposed)return;this.disposed=true;this.thermal.dispose();this.group.removeFromParent();this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());this.sim?.dispose();this.plume?.dispose();this.diffuse?.dispose();this.animalLight.dispose();this.light.power.value=0;this.field=null;this.tissues=null;this.camera=null;if(import.meta.env?.DEV&&typeof window!=='undefined')delete window.__SANCTUARY_REVIEW__;}
}
