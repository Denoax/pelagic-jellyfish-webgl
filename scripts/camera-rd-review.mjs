// Local-only evidence reader. Never bundled or deployed with the artwork.
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { resolve, extname } from 'node:path';
const evidence=resolve('../m5-rd-evidence'),report=resolve('docs/research/2026-09-08-camera-direction');
const types={'.html':'text/html','.json':'application/json','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.md':'text/plain'};
createServer((req,res)=>{try{
  const url=new URL(req.url,'http://localhost'),isEvidence=url.pathname.startsWith('/evidence/');
  const root=isEvidence?evidence:report,path=resolve(root,decodeURIComponent(isEvidence?url.pathname.slice(10):url.pathname==='/'?'review.html':url.pathname.slice(1)));
  if(!path.startsWith(root+'/')){res.writeHead(403);res.end();return;}
  const stat=statSync(path);if(!stat.isFile())throw Error('Not a file');
  const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/),start=range?Number(range[1]):0,end=range&&range[2]?Math.min(stat.size-1,Number(range[2])):stat.size-1;
  if(start> end || start>=stat.size){res.writeHead(416);res.end();return;}
  res.writeHead(range?206:200,{'Content-Type':types[extname(path)]||'application/octet-stream','Content-Length':end-start+1,'Accept-Ranges':'bytes','Cache-Control':'no-store',...(range?{'Content-Range':`bytes ${start}-${end}/${stat.size}`}:{})});createReadStream(path,{start,end}).pipe(res);
}catch{res.writeHead(404);res.end('Evidence not available yet.');}}).listen(5193,'127.0.0.1',()=>console.log('Camera direction review: http://127.0.0.1:5193'));
