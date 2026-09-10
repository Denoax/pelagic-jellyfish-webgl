import * as THREE from 'three/webgpu';

// Four original perimeter decisions, not independent vertex noise. Broad beds,
// a cropped corner, a long break and an undercut replace the repeated octagon.
const shapes=[
  {outline:[[-1,-.65],[-.35,-.82],[.72,-.88],[.97,-.37],[.63,.05],[.82,.64],[.12,.89],[-.86,.56]],tilt:[.09,-.04],lip:.18,back:.08,cut:1},
  {outline:[[-.93,-.46],[-.69,-.81],[.31,-.68],[1,-.28],[.93,.31],[.24,.53],[-.33,.89],[-.91,.33]],tilt:[-.12,.06],lip:.09,back:.20,cut:4},
  {outline:[[-.91,-.77],[-.18,-.96],[.73,-.49],[.88,.16],[.48,.72],[-.04,.79],[-.76,.58],[-.68,-.12]],tilt:[.04,.14],lip:.23,back:-.03,cut:6},
  {outline:[[-.97,-.53],[-.40,-.84],[.39,-.91],[.94,-.48],[.91,.20],[.34,.81],[-.37,.65],[-.89,.34]],tilt:[-.05,-.11],lip:.12,back:.14,cut:2},
];
export const SHELF_ARCHETYPES=shapes.length;

export function shelfArchetype(variant){
  if(!Number.isInteger(variant)||variant<0||variant>=shapes.length)throw new RangeError('Unknown shelf archetype');
  const spec=shapes[variant],p=[],indices=[];
  const original=[[-1,-.62],[-.56,-1],[.47,-.88],[1,-.38],[.92,.48],[.38,1],[-.59,.83],[-.94,.21]];
  const n=8;
  for(let ring=0;ring<5;ring++)for(let i=0;i<n;i++){
    const [sx,sz]=spec.outline[i],[ox,oz]=original[i],x=sx*.72+ox*.28,z=sz*.72+oz*.28,back=x*spec.tilt[0]+z*spec.tilt[1];
    const distance=Math.min(Math.abs(i-spec.cut),n-Math.abs(i-spec.cut));
    const broken=Math.max(0,1-distance/1.6),undercut=ring<2?broken*.2:0;
    const scale=[.69,1,1,.94][ring]-undercut;
    const originalTop=.49+.08*Math.sin(i*2.3)+ox*.1;
    if(ring===4){
      // An exact subdivision of the old top cap retains its attachment plane.
      // The perimeter outside this central patch remains free to fracture.
      p.push(.13+((ox*.78+.09)-.13)*.72,.61+(originalTop-.61)*.72,-.09+(oz*.78+.09)*.72);
    }else{
      const top=originalTop+back*.6-broken*spec.lip;
      const height=[-.7-back*.8,-.39-back*.65,top-.12-broken*.08,top][ring];
      p.push(x*scale+(ring<2?back*.14:.09),height,z*scale);
    }
  }
  for(let ring=0;ring<4;ring++)for(let i=0;i<n;i++){
    const a=ring*n+i,b=ring*n+(i+1)%n;indices.push(a,a+n,b,b,a+n,b+n);
  }
  const upper=p.length/3;p.push(.13,.61,-.09);const lower=p.length/3;p.push(0,-.7,0);
  for(let i=0;i<n;i++){indices.push(upper,4*n+(i+1)%n,4*n+i);indices.push(lower,i,(i+1)%n);}
  const g=new THREE.BufferGeometry();g.name=`basalt-shelf-archetype-${variant}`;
  g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}

// Refine after the existing attachment pass. Reuse its anchors, testing only
// nearby support columns against the four cached geometries. A variant must
// preserve every attachment height and must not cover a neighbouring colony.
export function refineShelfSilhouettes(owner,mesh){
  const anchors=owner.life?[...owner.life.anchored.filaments,...owner.life.anchored.shells,...owner.life.anchored.points].map(a=>a.anchor):[];
  const groups=Array.from({length:SHELF_ARCHETYPES+1},()=>[]),ids=groups.map(()=>[]);
  const variants=shapes.map((_,i)=>shelfArchetype(i));
  const matrix=new THREE.Matrix4(),box=new THREE.Box3(),ray=new THREE.Raycaster(),origin=new THREE.Vector3(),down=new THREE.Vector3(0,-1,0);
  const proxy=new THREE.Mesh(mesh.geometry,mesh.material),hits=[];let attachmentRays=0;mesh.geometry.computeBoundingBox();
  owner.meso.forEach((item,id)=>{
    mesh.getMatrixAt(id,matrix);box.copy(mesh.geometry.boundingBox).applyMatrix4(matrix).expandByScalar(.36);
    const nearby=anchors.filter(a=>a[0]>=box.min.x&&a[0]<=box.max.x&&a[2]>=box.min.z&&a[2]<=box.max.z);
    proxy.matrixWorld.copy(matrix);proxy.geometry=mesh.geometry;
    const sample=(a)=>{hits.length=0;ray.set(origin.set(a[0],0,a[2]),down);proxy.raycast(ray,hits);attachmentRays++;return hits.length?Math.max(...hits.map(h=>h.point.y)):-Infinity;};
    let bucket=0;
    if(item.tag!=='vent-apron'){
      const support=nearby.map(a=>Math.abs(sample(a)-a[1])<1e-5);
      for(let attempt=0;attempt<SHELF_ARCHETYPES;attempt++){
        const variant=(id+Math.floor(id/9)+attempt)%SHELF_ARCHETYPES;proxy.geometry=variants[variant];
        const safe=nearby.every((a,i)=>{const y=sample(a);return support[i]?Math.abs(y-a[1])<1e-5:y<=a[1]+1e-5;});
        if(safe){bucket=variant+1;break;}
      }
    }
    groups[bucket].push(item);ids[bucket].push(id);
  });
  // Reuse the existing batch/buffer for protected originals, not hidden zero-
  // scale instances. The other instances move into four shared-geometry draws.
  const o=new THREE.Object3D();
  groups[0].forEach((a,i)=>{o.position.fromArray(a.p);o.scale.fromArray(a.s);o.rotation.set(...a.r);o.updateMatrix();mesh.setMatrixAt(i,o.matrix);});
  mesh.count=groups[0].length;mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingSphere();mesh.userData.shelfIds=ids[0];
  for(let i=1;i<groups.length;i++)if(groups[i].length){
    const batch=owner.instanced(variants[i-1],mesh.material,groups[i],`varied-shelf-${i-1}`);batch.userData.shelfIds=ids[i];
  }
  for(let i=1;i<groups.length;i++)if(!groups[i].length)variants[i-1].dispose();
  return{archetypes:groups.slice(1).filter(g=>g.length).length,protectedIds:ids[0],variantIds:ids.slice(1),instances:owner.meso.length,attachmentRays};
}
