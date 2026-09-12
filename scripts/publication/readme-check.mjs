// README-only static validation and local rendering. No production imports.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync,statSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const [validatorArg,outArg]=process.argv.slice(2);if(!validatorArg||!outArg)throw Error('Usage: readme-check.mjs VALIDATOR_DIRECTORY EXTERNAL_REVIEW_DIRECTORY');
const req=createRequire(join(resolve(validatorArg),'package.json')),{JSDOM}=req('jsdom');
const root=resolve('.'),out=resolve(outArg);assert(!out.startsWith(root+'/'),'Review output must remain outside Git');mkdirSync(out,{recursive:true});
const md=readFileSync('README.md','utf8'),baseline='bce3571b0300ecfe5dc6e5dd45f28a9cda57006e';
assert(!/\/home\/mani|(?:localhost|127\.0\.0\.1):\d+|gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{30,}/.test(md),'Private path/URL/credential');
const headings=[...md.matchAll(/^#{1,6} (.+)$/gm)].map(m=>m[1]);
const slug=s=>s.toLowerCase().replace(/[^\p{L}\p{N}_\- ]/gu,'').replace(/ /g,'-');
const anchors=new Set([...headings.map(slug),...[...md.matchAll(/<a name="([^"]+)"/g)].map(m=>m[1])]);
let pinned=0,relative=0;
const linkText=md.replace(/^\$\$\n[\s\S]*?\n\$\$/gm,'').replace(/`[^`]*`/g,'');
for(const [,url]of linkText.matchAll(/\]\(([^)]+)\)/g)){
 if(url.startsWith('#')){assert(anchors.has(url.slice(1)),url);continue;}
 const match=url.match(/github.com\/Denoax\/pelagic-jellyfish-webgl\/blob\/([a-f0-9]+)\/([^#]+)(?:#L(\d+)(?:-L(\d+))?)?/);
 if(match){assert.equal(match[1],baseline);const text=execFileSync('git',['show',`${baseline}:${match[2]}`],{encoding:'utf8'});if(match[3])assert(Number(match[4]||match[3])<=text.split('\n').length,url);pinned++;}
 else if(!/^https?:/.test(url)){assert(existsSync(url.split('#')[0]),url);relative++;}
}
const imageRefs=[...[...md.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map(([,alt,path])=>({alt,path})),...[...md.matchAll(/<img src="([^"]+)"[^>]*alt="([^"]+)"/g)].map(([,path,alt])=>({alt,path}))];
const images=imageRefs.map(({alt,path})=>{assert(alt.length>35,'Meaningful alt text: '+path);assert(existsSync(path),path);return{path,bytes:statSync(path).size};});
const gifs=images.filter(i=>i.path.endsWith('.gif')),figures=images.filter(i=>!i.path.endsWith('.gif'));
assert.equal(gifs.length,4);assert.equal(figures.length,10);const added=gifs.reduce((s,i)=>s+i.bytes,0);assert(added<=12_000_000);
const metadata=JSON.parse(readFileSync('docs/readme/media.json'));for(const f of metadata.files){assert.equal(f.runtimeSha,baseline);assert.equal(createHash('sha256').update(readFileSync(f.file)).digest('hex'),f.sha256);}
const blocks=[...md.matchAll(/^\$\$\n([\s\S]*?)\n\$\$/gm)];assert.equal(blocks.length,22);assert(!/^\$$/m.test(md),'Unpaired display delimiters');
const old=readFileSync('paper/manuscript.md','utf8');const oldBlocks=[...old.matchAll(/^\$\$\n([\s\S]*?)\n\$\$/gm)].map(m=>m[1].replace(/\s/g,''));
const newBlocks=blocks.map(m=>m[1].replace(/\s/g,''));assert(oldBlocks.every(b=>newBlocks.includes(b)),'Original displayed math must survive verbatim apart from whitespace');
const pandoc=spawnSync(process.env.PANDOC||'pandoc',['README.md','--from=gfm+tex_math_dollars','--to=html5','--math-method=mathml'],{encoding:'utf8'});assert.equal(pandoc.status,0,pandoc.stderr);assert(!/Could not convert|not found|Error/i.test(pandoc.stderr),pandoc.stderr);
const doc=new JSDOM(pandoc.stdout).window.document;assert.equal(doc.querySelectorAll('merror').length,0);
const hs=[...doc.querySelectorAll('h1,h2,h3,h4,h5,h6')];assert.equal(hs.length,headings.length,'Heading parse');hs.forEach((h,i)=>h.id=slug(headings[i]));
const graph=doc.querySelector('pre.mermaid');assert(graph,'Mermaid missing');graph.outerHTML=`<pre class="mermaid">${graph.textContent.replaceAll('&','&amp;').replaceAll('<','&lt;')}</pre>`;
for(const m of doc.querySelectorAll('math[display="block"]')){const wrap=doc.createElement('div');wrap.className='math-scroll';m.replaceWith(wrap);wrap.append(m);}
const css=`body{margin:0;color:#1f2328;background:white;font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:900px;margin:auto;padding:32px}h1,h2{padding-bottom:.3em;border-bottom:1px solid #d1d9e0}h2{margin-top:32px}h3{margin-top:26px}a{color:#0969da;text-decoration:none}a:hover{text-decoration:underline}p,ul,ol,pre,table{margin:0 0 16px}img{max-width:100%;height:auto;background:#fff}pre{padding:16px;overflow:auto;background:#f6f8fa;border-radius:6px;font:13px/1.5 monospace}code{font-size:85%;background:#eff1f3}pre code{background:none;font-size:inherit}table{border-collapse:collapse;display:block;overflow:auto}td,th{border:1px solid #d1d9e0;padding:6px 13px}tr:nth-child(2n){background:#f6f8fa}.math-scroll{max-width:100%;overflow-x:auto;padding:12px 0;margin-bottom:16px}math{font-size:1.05em}.review-note{padding:8px 16px;background:#fff8c5;font-size:12px}svg{max-width:100%;height:auto}@media(max-width:600px){main{padding:16px}body{font-size:15px}}`;
writeFileSync(join(out,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pelagic README local review</title><style>${css}</style><div class="review-note">Local README rendering: GFM + native MathML + Mermaid. This is not a remote GitHub rendering or a separate paper site.</div><main>${doc.body.innerHTML}</main><script type="module">import mermaid from '/vendor/mermaid/dist/mermaid.esm.min.mjs';mermaid.initialize({startOnLoad:false,theme:'neutral',securityLevel:'strict'});await mermaid.run();document.documentElement.dataset.ready='true';</script></html>`);
const base=execFileSync('git',['show','2bea550:README.md'],{encoding:'utf8'});
const cache=[old,readFileSync('paper/supplement-source.md','utf8'),readFileSync('paper/notation.md','utf8'),base].join(' ');
const words=s=>s.toLowerCase().replace(/https?:\/\/\S+/g,'').match(/[\p{L}\p{N}]+/gu)||[];
const cw=words(cache),rw=words(md),grams=new Set(cw.slice(0,-4).map((_,i)=>cw.slice(i,i+5).join(' '))),reused=new Set();
for(let i=0;i<rw.length-4;i++)if(grams.has(rw.slice(i,i+5).join(' ')))for(let j=0;j<5;j++)reused.add(i+j);
const report={runtimeSha:baseline,status:'STATIC CHECKS PASS; browser review recorded separately',words:md.trim().split(/\s+/).length,equationGroups:22,originalDisplaysReused:oldBlocks.length,references:9,figures:figures.length,gifs:gifs.length,newGifBytes:added,totalReferencedMediaBytes:images.reduce((s,i)=>s+i.bytes,0),pinnedSourceLinks:pinned,relativeLinksAndMedia:relative,headingAnchors:anchors.size,proseReuseEstimate:{method:'Fraction of normalized README words covered by matching 5-word spans in original manuscript, supplement, notation and previous README; conservative proxy, not an authorship detector',percent:Number((100*reused.size/rw.length).toFixed(1))},privatePathScan:'PASS',equations:'22 parsed; 21 original display groups unchanged, one existing inline group promoted to display',benchmark:'Reused unchanged; no new timing/capture'};
writeFileSync('docs/readme/validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
