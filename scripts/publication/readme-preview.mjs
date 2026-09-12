// Local-only static README preview, not an application route or deployment.
import {createServer} from 'node:http';
import {resolve,join,extname,sep} from 'node:path';
import {existsSync,statSync,createReadStream} from 'node:fs';
const [outArg,vendorArg]=process.argv.slice(2);if(!outArg||!vendorArg)throw Error('Usage: readme-preview.mjs EXTERNAL_REVIEW_DIRECTORY VALIDATOR_DIRECTORY');
const root=resolve('.'),out=resolve(outArg),vendor=resolve(vendorArg,'node_modules');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.gif':'image/gif','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.md':'text/plain; charset=utf-8','.bib':'text/plain'};
const server=createServer((req,res)=>{let path;try{path=decodeURIComponent(new URL(req.url,'http://local').pathname);}catch{res.writeHead(400).end();return;}
 let base=root,file;
 if(path==='/'){base=out;file=join(out,'index.html');}
 else if(path.startsWith('/vendor/')){base=vendor;file=resolve(vendor,'.'+path.slice(7));}
 else{file=resolve(root,'.'+path);}
 if(!file.startsWith(base+sep)||path.split('/').some(p=>p.startsWith('.'))||!existsSync(file)||!statSync(file).isFile()||base===root&&!/^\/(paper\/|docs\/readme\/|README|CITATION|LICENSE|ASSET_PROVENANCE|REPRODUCIBILITY|CONTRIBUTING)/.test(path)){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});createReadStream(file).pipe(res);
});
server.listen(0,'127.0.0.1',()=>console.log(`README review: http://127.0.0.1:${server.address().port}/`));
