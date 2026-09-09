// Offline conservative blocking proxies, NOT a runtime collision solver.
import { readFileSync, writeFileSync } from 'node:fs';
import { Vector3, Quaternion } from 'three/webgpu';
const root=process.argv[2],trace=JSON.parse(readFileSync(`${root}/trace.json`));
const c=new Vector3(),a=new Vector3(),b=new Vector3(),v=new Vector3(),q=new Quaternion();
let bell={clearance:Infinity},arms={clearance:Infinity},tentacles={clearance:Infinity},floor=Infinity;
const hits=[];
for(const f of trace){c.fromArray(f.position);floor=Math.min(floor,c.y-(-7.85+1.4));
 for(const animal of f.actors){if(animal.presence<.2)continue;a.fromArray(animal.position);const scale=animal.scale;
 const br=[1.34,1.2,1.4,1.28][animal.id%4]*scale*1.12,d=c.distanceTo(a)-br;
 const detail={time:f.time,progress:f.progress,animal:animal.id};if(d<bell.clearance)bell={clearance:d,...detail};
 if(animal.quaternion){q.fromArray(animal.quaternion);
   for(const [key,len,radius] of [['arms',4.2,1.2],['tentacles',5.6,1.5]]){
     b.set(0,-len*scale,0).applyQuaternion(q).add(a);v.copy(b).sub(a);const t=Math.max(0,Math.min(1,c.clone().sub(a).dot(v)/v.lengthSq()));const distance=c.distanceTo(v.multiplyScalar(t).add(a))-radius*scale;
     if(key==='arms'&&distance<arms.clearance)arms={clearance:distance,...detail};
     if(key==='tentacles'&&distance<tentacles.clearance)tentacles={clearance:distance,...detail};
     if(distance<0&&hits.length<100)hits.push({part:key,clearance:distance,...detail});
   }
 }
 }}
const result={bell,arms,tentacles,floorProxyClearance:floor,hits,limitations:'Capsules use local -Y and conservative maximum chain length, not the deformed curved strands. False positives are possible; negative clearance requires browser inspection, not automatic camera pushes. Floor proxy is y=-7.85 plus 1.4 terrain allowance; scanned rock silhouettes need visual checking. Eight foreground actors only. Distant population checked in browser.'};
writeFileSync(`${root}/clearance.json`,JSON.stringify(result,null,2));console.log(root,result.bell,result.arms,result.tentacles,result.floorProxyClearance);
