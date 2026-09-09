import * as THREE from 'three/webgpu';
import { color, normalWorld, vec3 } from 'three/tsl';
import { FLOOR_Y, HERO, BASIN_SIZE, basinGeometry, lobeGeometry, shelfGeometry, sanctuaryLayout, chimneyGeometry, chimneyColumn } from './geology.js';

export class Sanctuary {
  constructor(scene,{reducedMotion=false}={}) {
    this.group=new THREE.Group();this.group.name='abyssal-hydrothermal-sanctuary';scene.add(this.group);
    this.geometries=new Set();this.materials=new Set();this.disposed=false;this.reducedMotion=reducedMotion;
    this.layout=sanctuaryLayout();this.solids=[];
    const mat=new THREE.MeshBasicNodeMaterial();mat.colorNode=color('#868686').mul(normalWorld.dot(vec3(-.4,.7,.55).normalize()).mul(.4).add(.6));
    this.materials.add(mat);
    this.add(basinGeometry(),mat,'abyssal-basin');
    const lobe=lobeGeometry();this.instanced(shelfGeometry(),mat,this.layout.shelves,'basalt-shelves');
    this.instanced(lobe,mat,this.layout.pillows,'pillow-flows');
    const query=typeof location==='undefined'?null:new URLSearchParams(location.search);
    const height=import.meta.env?.DEV?Number(query?.get('chimneyHeight'))||HERO.height:HERO.height;
    this.height=height;this.add(chimneyGeometry(height),mat,'active-sulfide-complex');
    this.add(chimneyColumn({x:12,y:FLOOR_Y,z:-35,height:6.2,radius:1.2,salt:121}),mat,'inactive-spire-east');
    this.add(chimneyColumn({x:-15,y:FLOOR_Y,z:-40,height:7.4,radius:1.4,salt:151}),mat,'inactive-spire-west');
    this.group.updateMatrixWorld(true);
  }
  add(g,m,name){this.geometries.add(g);this.materials.add(m);const mesh=new THREE.Mesh(g,m);mesh.name=name;this.group.add(mesh);this.solids.push(mesh);return mesh;}
  instanced(g,m,items,name){this.geometries.add(g);const mesh=new THREE.InstancedMesh(g,m,items.length),o=new THREE.Object3D();items.forEach((a,i)=>{o.position.fromArray(a.p);o.scale.fromArray(a.s);o.rotation.set(...a.r);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});mesh.name=name;mesh.computeBoundingSphere();this.group.add(mesh);this.solids.push(mesh);return mesh;}
  connect(field,tissues,camera){this.field=field;this.tissues=tissues;this.camera=camera;}
  update(){}
  state(){return{floorY:FLOOR_Y,basinSize:BASIN_SIZE,chimney:{...HERO,height:this.height},solids:this.solids.length,opaque:this.solids.every(m=>!m.material.transparent&&m.material.opacity===1),geometries:this.geometries.size,materials:this.materials.size,blockout:true};}
  dispose(){if(this.disposed)return;this.disposed=true;this.group.removeFromParent();this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());this.field=null;this.tissues=null;this.camera=null;}
}
