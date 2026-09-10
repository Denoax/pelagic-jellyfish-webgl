import {performance} from 'node:perf_hooks';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {mkdirSync,writeFileSync} from 'node:fs';
import {Scene,Mesh} from 'three/webgpu';
const [root=process.cwd(),label='candidate']=process.argv.slice(2);
const {Sanctuary}=await import(pathToFileURL(resolve(root,'src/scene/sanctuary/Sanctuary.js')));
const out=resolve('../m6-5-evidence/construction');mkdirSync(out,{recursive:true});
const samples=[];
for(let i=0;i<6;i++){
 const start=performance.now(),s=new Sanctuary(new Scene());
 const ms=performance.now()-start;s.dispose();if(i)samples.push(ms);
}
const timings={},raycast=Mesh.prototype.raycast;
Mesh.prototype.raycast=function(...args){const start=performance.now();try{return raycast.apply(this,args);}finally{const key=this.geometry.type+':'+this.geometry.attributes.position.count;const t=timings[key]??={calls:0,ms:0};t.calls++;t.ms+=performance.now()-start;}};
let inspected;
try{const start=performance.now(),s=new Sanctuary(new Scene());inspected={totalMs:performance.now()-start,solids:s.solids.map(m=>({name:m.name,geometry:m.geometry.type,vertices:m.geometry.attributes.position.count,count:m.count||1}))};s.dispose();}finally{Mesh.prototype.raycast=raycast;}
samples.sort((a,b)=>a-b);
const result={label,root,node:process.version,note:'Node-only warm constructor diagnostic, not browser startup or GPU timing; separate ray instrumentation run.',samples,medianMs:samples[2],raycast:timings,inspected};
writeFileSync(resolve(out,label+'.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
