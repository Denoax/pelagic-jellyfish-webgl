// Offline exact closest-triangle queries (no runtime collision/scene dependency).
import {Scene,Matrix4,Vector3,Triangle,Box3,PerspectiveCamera} from 'three/webgpu';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
import {directions} from '../src/scene/camera/directions.js';
import {bakeTrack,TrackPlayer} from '../src/scene/camera/CameraTrack.js';
const s=new Sanctuary(new Scene()),triangles=[],matrix=new Matrix4(),instance=new Matrix4();
for(const mesh of s.solids){
 const g=mesh.geometry,p=g.attributes.position,index=g.index;
 for(let j=0;j<(mesh.isInstancedMesh?mesh.count:1);j++){
  if(mesh.isInstancedMesh){mesh.getMatrixAt(j,instance);matrix.multiplyMatrices(mesh.matrixWorld,instance);}else matrix.copy(mesh.matrixWorld);
  for(let i=0;i<(index?index.count:p.count);i+=3){
   const v=[0,1,2].map(k=>new Vector3().fromBufferAttribute(p,index?index.getX(i+k):i+k).applyMatrix4(matrix));
   const triangle=new Triangle(...v),box=new Box3().setFromPoints(v);
   triangles.push({triangle,box,name:mesh.name,center:box.getCenter(new Vector3())});
  }
 }
}
function tree(items){const box=new Box3();for(const t of items)box.union(t.box);if(items.length<=16)return{box,items};const d=box.getSize(new Vector3()),axis=d.x>d.y?(d.x>d.z?'x':'z'):(d.y>d.z?'y':'z');items.sort((a,b)=>a.center[axis]-b.center[axis]);const n=items.length>>1;return{box,left:tree(items.slice(0,n)),right:tree(items.slice(n))};}
const root=tree(triangles),point=new Vector3();
function nearest(node,c,result){
 if(node.box.distanceToPoint(c)>=result.distance)return;
 if(node.items){for(const t of node.items){if(t.box.distanceToPoint(c)>=result.distance)continue;t.triangle.closestPointToPoint(c,point);const d=point.distanceTo(c);if(d<result.distance){result.distance=d;result.solid=t.name;result.point=point.toArray();}}}
 else {const first=node.left.box.distanceToPoint(c)<node.right.box.distanceToPoint(c)?node.left:node.right;nearest(first,c,result);nearest(first===node.left?node.right:node.left,c,result);}
}
const report={method:'closest point on every solid triangle, spatial BVH, 1201 samples per unchanged cinematic track; not just vertical floor distance',triangles:triangles.length,modes:{}};
for(const [id,d]of Object.entries(directions)){const player=new TrackPlayer(bakeTrack(d)),camera=new PerspectiveCamera();let minimum={distance:Infinity};for(let i=0;i<=1200;i++){player.sample(i/1200,camera);const q={distance:Infinity};nearest(root,camera.position,q);if(q.distance<minimum.distance)minimum={...q,progress:i/1200,camera:camera.position.toArray()};}report.modes[id]=minimum;}
console.log(JSON.stringify(report,null,2));s.dispose();
