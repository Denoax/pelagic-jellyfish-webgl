import{readdirSync,readFileSync}from'node:fs';
const root=process.env.EVIDENCE_ROOT||'/home/mani/dev/jellyfish-studio/m6-1-evidence/performance';
const stats=a=>{a=[...a].sort((x,y)=>x-y);const r=x=>Math.round(x*100)/100;return{median:r(a[Math.floor(a.length*.5)]),p95:r(a[Math.floor(a.length*.95)]),max:r(a.at(-1)),over50:a.filter(x=>x>50).length,n:a.length};};
const rows=[];
for(const name of readdirSync(root).sort())try{
 const x=JSON.parse(readFileSync(`${root}/${name}/performance.json`));
 const env=JSON.parse(readFileSync(`${root}/${name}/sanctuary-cost.json`));
 rows.push({name,frame:stats(x.auditRender.intervals),cpu:stats(env.cpu),ratio:[x.info.ratio,x.after.ratio],buffers:[x.info.buffers[0],x.after.buffers[0]],gl:x.info.actualGL,errors:x.errors.length,draw:env.render,source:x.info.sourceRevision});
}catch{}
console.log(JSON.stringify(rows,null,2));
