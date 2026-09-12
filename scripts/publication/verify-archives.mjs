import {mkdtempSync,readFileSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const stage=resolve(process.argv[2]),extract=mkdtempSync(join(tmpdir(),'pelagic-publication-extract-'));
const results=[];
function run(command,args,cwd,env=process.env){const r=spawnSync(command,args,{cwd,env,encoding:'utf8',maxBuffer:20*1024*1024});if(r.status||r.error)throw Error(r.error?.message||r.stdout+r.stderr);return r.stdout+r.stderr;}
for(const name of ['pelagic-reproducibility.zip','pelagic-supplemental-media.zip','pelagic-arxiv-source.zip']){run('unzip',['-q',join(stage,name),'-d',extract],stage);results.push({archive:name,extraction:'PASS'});}
const src=join(extract,'arxiv-source');for(const file of ['pelagic.tex','supplement.tex']){run(process.env.TECTONIC||'tectonic',[file],src);results.push({file,extractedBuild:'PASS'});}
const runtime=join(extract,'reproducibility','runtime'),manifest=JSON.parse(readFileSync(join(runtime,'runtime-manifest.json')));
for(const f of manifest.files)assert.equal(createHash('sha256').update(readFileSync(join(runtime,f.path))).digest('hex'),f.sha256,f.path);
run('npm',['ci'],runtime);run('npm',['run','build'],runtime,{...process.env,VITE_OCEAN_RELEASE:'milestone-2'});
results.push({snapshotSha:manifest.runtimeSha,filesVerified:manifest.files.length,cleanInstall:'PASS',productionBuild:'PASS',historicalParity:'Requires original Git history; not claimed for history-free snapshot'});
const combined=join(extract,'reproducibility');run('npm',['ci'],combined);run('node',['scripts/publication/source-manifest.mjs'],combined);run('node',['scripts/publication/build-paper.mjs'],combined);
results.push({combinedReproducibilityRoot:{cleanInstall:'PASS',snapshotHashes:'PASS',canonicalPaperBuild:'PASS'}});
writeFileSync('paper/audit/archive-validation.json',JSON.stringify({results},null,2)+'\n');console.log(JSON.stringify(results));console.log('Extraction retained for local inspection:',extract);
