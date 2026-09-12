import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,readdirSync,statSync} from 'node:fs';
import {resolve,join,dirname,relative} from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const [evidenceArg,outArg]=process.argv.slice(2);if(!evidenceArg||!outArg)throw Error('Usage: package.mjs EVIDENCE_DIRECTORY EXTERNAL_OUTPUT_DIRECTORY');
const root=resolve('.'),out=resolve(outArg),evidence=resolve(evidenceArg);
if(out===root||out.startsWith(root+'/'))throw Error('Stage large assets outside the repository');
if(existsSync(out)&&!existsSync(join(out,'.pelagic-publication-stage')))throw Error('Refusing an unowned existing output directory');
mkdirSync(out,{recursive:true});writeFileSync(join(out,'.pelagic-publication-stage'),'Pelagic local publication staging only\n');
const cp=(a,b)=>{mkdirSync(dirname(b),{recursive:true});copyFileSync(a,b);};
const walk=d=>readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?walk(join(d,e.name)):e.isFile()?[join(d,e.name)]:[]);
const allowed=f=>!f.split('/').some(p=>p.startsWith('.')&&!['.npmrc','.openai'].includes(p))&&!/\.(aux|log|out)$/.test(f);
const docRoots=['README.md','REPRODUCIBILITY.md','CONTRIBUTING.md','ASSET_PROVENANCE.md','LICENSE.md','CITATION.cff','CITATION.bib'];
const paperFiles=walk('paper').filter(allowed);const docs=[...docRoots,...paperFiles,...walk('LICENSES'),...walk('licenses')];
for(const f of docs)cp(f,join(out,'site',f));
for(const f of walk('public/paper'))cp(f,join(out,'site','paper',relative('public/paper',f)));
// README's repository-source link remains useful in the local rendering too.
for(const f of walk('public/paper'))cp(f,join(out,'site',f));
const pandoc=process.env.PANDOC||'pandoc';
const rendered=spawnSync(pandoc,['README.md','--from=gfm+tex_math_dollars','--to=html5','--math-method=mathml','--standalone','--metadata=pagetitle=Pelagic README preview','--css=paper/paper.css'],{encoding:'utf8'});if(rendered.status)throw Error(rendered.stderr);
const html=rendered.stdout.replace(/<pre class="mermaid">[\s\S]*?<\/pre>/g,'<figure><img src="paper/figures/F02-system.png" alt="Source-derived system architecture"><figcaption>Portable preview of the architecture. The README contains a separately validated Mermaid graph for GitHub.</figcaption></figure>');
writeFileSync(join(out,'site','index.html'),html);
for(let n=1;n<=12;n++)for(const f of ['motion.mp4','frame-timestamps.json'])cp(join(evidence,'motion','S'+n,f),join(out,'supplemental-media','S'+n,f));
for(let n=1;n<=12;n++)cp(`paper/media/S${n}.json`,join(out,'supplemental-media','S'+n,'metadata.json'));
for(const f of ['LICENSE.md',...walk('LICENSES'),...walk('licenses'),'ASSET_PROVENANCE.md'])cp(f,join(out,'supplemental-media',f));
for(const f of [...docs,...walk('scripts/publication'),'scripts/ocean-completion-probe.mjs','package.json','package-lock.json'])cp(f,join(out,'reproducibility',f));
const runtime=JSON.parse(readFileSync('paper/audit/runtime-manifest.json'));
for(const f of runtime.files){cp(f.path,join(out,'reproducibility','runtime',f.path));cp(f.path,join(out,'reproducibility',f.path));}
for(const f of walk('public/paper'))cp(f,join(out,'reproducibility',f));
cp('paper/audit/runtime-manifest.json',join(out,'reproducibility','runtime-manifest.json'));
for(const f of ['LICENSE.md','ASSET_PROVENANCE.md',...walk('LICENSES'),...walk('licenses'),...walk('scripts/publication'),'scripts/ocean-completion-probe.mjs'])cp(f,join(out,'reproducibility','runtime',f));
cp('paper/audit/runtime-manifest.json',join(out,'reproducibility','runtime','runtime-manifest.json'));
writeFileSync(join(out,'reproducibility','runtime','SNAPSHOT.md'),'# Approved runtime snapshot\n\nApproved source: '+runtime.runtimeSha+'. No Git history is included. Run npm ci, then VITE_OCEAN_RELEASE=milestone-2 npm run build and npm run dev. The runtime-manifest.json hashes identify exact files. Publication capture scripts are supplied. Full historical parity tests require the original Git history; do not claim they passed in this snapshot merely because it builds.\n');
// Self-contained typeset sources. Exclude internal audit notes and comments.
for(const f of ['pelagic.tex','supplement.tex','references.bib','preamble.tex']){
 let s=readFileSync(join('paper',f),'utf8');if(f.endsWith('.tex'))s=s.split('\n').filter(l=>!/^\s*%/.test(l)).map(l=>l.replace(/(?<!\\)%.*$/,'')).join('\n');
 mkdirSync(join(out,'arxiv-source'),{recursive:true});writeFileSync(join(out,'arxiv-source',f),s);
}
for(const f of walk('paper/figures').filter(f=>/\.(png|jpg)$/.test(f)))cp(f,join(out,'arxiv-source','figures',relative('paper/figures',f)));
for(const f of ['LICENSE.md',...walk('LICENSES'),...walk('licenses'),'ASSET_PROVENANCE.md'])cp(f,join(out,'arxiv-source',f));
writeFileSync(join(out,'arxiv-source','README.txt'),'Pelagic — Mani Marami Milani\nIndependent technical preprint, local review only. Not submitted to arXiv.\nBuild pelagic.tex and supplement.tex with Tectonic 0.17.0 or a compatible XeLaTeX installation.\nBibliography text is included in the generated TeX; references.bib retains canonical sources.\nOriginal publication content CC BY 4.0; see LICENSE.md and third-party notices.\n');
for(const [folder,name]of [['reproducibility','pelagic-reproducibility.zip'],['supplemental-media','pelagic-supplemental-media.zip'],['arxiv-source','pelagic-arxiv-source.zip']]){
 const r=spawnSync('zip',['-q','-r','-X',join(out,name),folder],{cwd:out,encoding:'utf8'});if(r.status)throw Error(r.stderr);
 const check=spawnSync('unzip',['-t',join(out,name)],{encoding:'utf8'});if(check.status)throw Error(check.stdout);
}
for(const f of ['pelagic.pdf','supplement.pdf'])cp(join('paper',f),join(out,f));
const sha=f=>createHash('sha256').update(readFileSync(f)).digest('hex');
const benchmark=JSON.parse(readFileSync('paper/results/benchmark.json'));
const files=walk(out).filter(f=>allowed(relative(out,f))&&!['artifact-manifest.json','SHA256SUMS'].includes(relative(out,f))).map(f=>({path:relative(out,f),sha256:sha(f),bytes:statSync(f).size,role:f.endsWith('.mp4')?'browser-motion':f.endsWith('.zip')?'prepared-archive':f.endsWith('.pdf')?'typeset-publication':'supporting-artifact'}));
const manifest={publicationVersion:'1.0.0-preprint',runtimeSha:benchmark.runtimeSha,paperSha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),releaseTag:null,threeVersion:'0.175.0',nodeVersion:process.version,browserVersion:benchmark.browser.product,backend:benchmark.backend,captureHardware:{description:benchmark.hardware},files};
writeFileSync(join(out,'artifact-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
writeFileSync(join(out,'SHA256SUMS'),files.map(f=>`${f.sha256}  ${f.path}\n`).join('')+`${sha(join(out,'artifact-manifest.json'))}  artifact-manifest.json\n`);
console.log(`Prepared locally: ${files.length} hashed artifacts; ${out}`);
