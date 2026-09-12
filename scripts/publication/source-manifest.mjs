import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import {runtimeSha} from './browser.mjs';
if(existsSync('runtime-manifest.json')){
 const manifest=JSON.parse(readFileSync('runtime-manifest.json'));assert.equal(manifest.runtimeSha,runtimeSha);
 for(const f of manifest.files)assert.equal(createHash('sha256').update(readFileSync(f.path)).digest('hex'),f.sha256,f.path);
 console.log('Snapshot byte parity:',manifest.files.length,'files');
 process.exit(0);
}
const paths=execFileSync('git',['ls-tree','-r','--name-only',runtimeSha,'src','public','package.json','package-lock.json','vite.config.mjs','index.html','.npmrc','worker','scripts/prepare-sites-build.mjs','.openai'],{encoding:'utf8'}).trim().split('\n');
const files=paths.map(path=>{const baseline=execFileSync('git',['show',`${runtimeSha}:${path}`],{maxBuffer:64*1024*1024});const actual=readFileSync(path);assert(actual.equals(baseline),'Runtime changed: '+path);return{path,bytes:actual.length,sha256:createHash('sha256').update(actual).digest('hex')};});
mkdirSync('paper/audit',{recursive:true});writeFileSync('paper/audit/runtime-manifest.json',JSON.stringify({runtimeSha,files},null,2)+'\n');console.log('Runtime byte parity:',files.length,'files');
