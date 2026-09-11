import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
const pandoc=process.env.PANDOC||'pandoc',tectonic=process.env.TECTONIC||'tectonic';
const run=(cmd,args)=>{const r=spawnSync(cmd,args,{cwd:resolve('paper'),encoding:'utf8'});if(r.status||r.error)throw Error(r.error?.message||r.stderr);if(r.stderr)console.log(r.stderr);};
const result=existsSync('paper/results/table.md')?readFileSync('paper/results/table.md','utf8'):'Fresh measurement is pending; this draft is not ready for publication review.';
const manuscript=readFileSync('paper/manuscript.md','utf8').replace('<!-- PUBLICATION_RESULTS -->',result);
// A derived intermediate lives outside the archival source set.
mkdirSync('paper/.build',{recursive:true});writeFileSync('paper/.build/manuscript.md',manuscript);
for(const [source,name]of [['.build/manuscript.md','pelagic'],['supplement-source.md','supplement']]){
 const common=[source,'--standalone','--citeproc','--resource-path=.',...(name==='pelagic'?['--bibliography=references.bib']:[])];
 run(pandoc,[...common,'--to=gfm+tex_math_dollars','--wrap=auto','-o',name+'.md']);
 run(pandoc,[...common,'--to=latex','--pdf-engine=tectonic','-V','documentclass=article','-V','fontsize=11pt','-V','geometry=margin=1in','-V','colorlinks=true','-V','linkcolor=teal','-V','urlcolor=teal','-V','linestretch=1.04','-o',name+'.tex']);
 run(pandoc,[...common,'--to=html5','--mathml','--css=paper.css','--metadata','pagetitle=Pelagic technical preprint','-o',name+'.html']);
 if(!process.argv.includes('--sources-only'))run(tectonic,['--keep-logs',name+'.tex']);
}
