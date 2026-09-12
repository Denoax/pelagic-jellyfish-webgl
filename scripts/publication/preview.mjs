import {createServer} from 'node:http';
import {readFileSync,existsSync,statSync,createReadStream} from 'node:fs';
import {resolve,join,extname,sep} from 'node:path';
const root=resolve(process.argv[2]||'');if(!existsSync(join(root,'.pelagic-publication-stage')))throw Error('Provide a prepared publication stage');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.gif':'image/gif','.mp4':'video/mp4','.pdf':'application/pdf','.zip':'application/zip','.md':'text/plain; charset=utf-8','.bib':'text/plain','.cff':'text/plain'};
const server=createServer((req,res)=>{
 const url=new URL(req.url,'http://local');let route;try{route=decodeURIComponent(url.pathname);}catch{res.writeHead(400).end();return;}
 if(route==='/publication-review.json'){res.writeHead(200,{'Content-Type':'application/json'}).end('{"motionAvailable":true}');return;}
 if(route==='/public/paper/index.html'){res.writeHead(302,{Location:'/paper/'}).end();return;}
 let base=join(root,'site'),path=route;
 if(route.startsWith('/review-media/')){base=join(root,'supplemental-media');path=route.slice('/review-media'.length);}
 if(route.startsWith('/downloads/')){base=root;path=route.slice('/downloads'.length);}
 if(path==='/'||path==='/paper/')path+='index.html';
 const file=resolve(base,'.'+path);
 if(!file.startsWith(base+sep)||!existsSync(file)||!statSync(file).isFile()||path.split('/').some(p=>p.startsWith('.'))){res.writeHead(404).end('Not in this publication package');return;}
 const size=statSync(file).size,headers={'Content-Type':mime[extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
 if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):size-1,size-1);if(start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`}).end();return;}res.writeHead(206,{...headers,'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});createReadStream(file,{start,end}).pipe(res);}
 else{res.writeHead(200,{...headers,'Content-Length':size});if(req.method==='HEAD')res.end();else createReadStream(file).pipe(res);}
});
server.listen(Number(process.env.PUBLICATION_PORT)||0,'127.0.0.1',()=>console.log(`Publication review: http://127.0.0.1:${server.address().port}/paper/\nREADME: http://127.0.0.1:${server.address().port}/`));
