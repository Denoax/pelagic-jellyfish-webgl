import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync,existsSync,writeFileSync} from 'node:fs';
import {resolve,join,relative,dirname} from 'node:path';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
const [toolsArg,stageArg]=process.argv.slice(2);if(!toolsArg||!stageArg)throw Error('Usage: validate.mjs VALIDATOR_PACKAGE_DIRECTORY STAGE');
const req=createRequire(join(resolve(toolsArg),'package.json')),stage=resolve(stageArg);
const {JSDOM}=req('jsdom');const dom=new JSDOM('<!doctype html><html><body></body></html>');globalThis.window=dom.window;globalThis.document=dom.window.document;
const mermaid=(await import(pathToFileURL(req.resolve('mermaid')))).default;
const readme=readFileSync('README.md','utf8'),graph=readme.match(/```mermaid\n([\s\S]+?)```/)[1];await mermaid.parse(graph);
const Ajv=req('ajv/dist/2020').default;const ajv=new Ajv({strict:false});
for(const [schema,files]of [['motion',Array.from({length:12},(_,i)=>`paper/media/S${i+1}.json`)],['artifact',[join(stage,'artifact-manifest.json')]]]){
 const validate=ajv.compile(JSON.parse(readFileSync(`scripts/publication/schemas/${schema}.json`)));
 for(const file of files){assert(validate(JSON.parse(readFileSync(file))),file+JSON.stringify(validate.errors));}
}
const manifest=JSON.parse(readFileSync(join(stage,'artifact-manifest.json')));
for(const f of manifest.files){const b=readFileSync(join(stage,f.path));assert.equal(b.length,f.bytes);assert.equal(createHash('sha256').update(b).digest('hex'),f.sha256,f.path);}
const bad=[];const walk=d=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
for(const f of walk(join(stage,'site')).filter(f=>/\.(md|html|tex|json|bib|cff)$/.test(f))){const s=readFileSync(f,'utf8');if(/\/home\/mani|(?:localhost|127\.0\.0\.1):\d+|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{30,}/.test(s))bad.push(f);}
assert.deepEqual(bad,[],'Private paths/credentials in publication output');
// Parse actual Markdown into MathML: unknown TeX commands are reported by Pandoc.
const pandoc=process.env.PANDOC||'pandoc';for(const file of ['README.md','paper/pelagic.md','paper/supplement.md']){
 const r=spawnSync(pandoc,[file,'--from=gfm+tex_math_dollars','--to=html5','--math-method=mathml'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert(!/Could not convert TeX math|Error|citation.*not found/i.test(r.stderr),r.stderr);
 const d=new JSDOM(r.stdout).window.document;assert.equal(d.querySelectorAll('math merror').length,0);
}
for(const file of ['CITATION.bib','paper/references.bib']){const r=spawnSync(pandoc,[file,'--from=biblatex','--to=csljson'],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);const entries=JSON.parse(r.stdout);assert(entries.length);assert(entries.every(e=>e.title&&e.author?.length));}
for(const f of ['hero.gif','contact.gif','pinch.gif'])assert(statSync('paper/media/'+f).size<=8_000_000,f+' exceeds preview budget');
assert(statSync('paper/media/social-preview.jpg').size<1_000_000);
assert(statSync('paper/pelagic.pdf').size+statSync('paper/supplement.pdf').size<15_000_000);
const words=readme.split(/\s+/).length;assert(words>=2500&&words<=4000,'README scope');
const hashes=spawnSync('sha256sum',['-c','SHA256SUMS'],{cwd:stage,encoding:'utf8'});assert.equal(hashes.status,0,hashes.stderr);
const result={mermaid:'PASS',mathml:'PASS',bibtex:'PASS',schemas:'PASS',hashes:'PASS',privacy:'PASS',mediaBudgets:'PASS',readmeWords:words,manifestFiles:manifest.files.length};
writeFileSync('paper/audit/automated-validation.json',JSON.stringify(result,null,2)+'\n');console.log(result);
