// Read-only identification of visible geology; no alternate render or image edits.
import {Scene,PerspectiveCamera,Raycaster,Vector2} from 'three/webgpu';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const [source=process.cwd(),label='baseline']=process.argv.slice(2);
const {Sanctuary}=await import(pathToFileURL(resolve(source,'src/scene/sanctuary/Sanctuary.js')));
const root=resolve('../m6-6-evidence'),s=new Sanctuary(new Scene()),out={};s.group.updateMatrixWorld(true);
for(const view of ['explore','stacked','ravine-edge','low','high','deep']){
 const file=`${root}/${label}/${view}/state.json`;if(!existsSync(file))continue;
 const state=JSON.parse(readFileSync(file)),[w,h]=state.buffers[0],c=new PerspectiveCamera(state.camera.fixedFov,w/h,.1,300);
 c.position.fromArray(state.camera.position);c.quaternion.fromArray(state.camera.quaternion);c.updateMatrixWorld();
 const ray=new Raycaster(),samples=[],counts={};
 for(let y=300;y<h-40;y+=80)for(let x=100;x<w-40;x+=120){
  ray.setFromCamera(new Vector2(x/w*2-1,1-y/h*2),c);const hit=ray.intersectObjects(s.solids,false)[0];if(!hit)continue;
  const key=hit.object.name+':'+(hit.instanceId??'mesh');counts[key]=(counts[key]||0)+1;
  const originalId=hit.object.userData.shelfIds?.[hit.instanceId]??hit.instanceId;
  const item=hit.object.name==='connected-fracture-beds'||hit.object.name.startsWith('varied-shelf-')?s.meso[originalId]:null;
  samples.push({pixel:[x,y],name:hit.object.name,id:hit.instanceId,originalId,tag:item?.tag,point:hit.point.toArray()});
 }
 out[view]={dominant:Object.entries(counts).sort((a,b)=>b[1]-a[1]),samples};
}
out.instances={meso:s.meso,layout:s.layout};s.dispose();writeFileSync(`${root}/${label}-shelf-audit.json`,JSON.stringify(out,null,2));
console.log(JSON.stringify(Object.fromEntries(Object.entries(out).filter(([k])=>k!=='instances').map(([k,v])=>[k,v.dominant.slice(0,10)]))));
