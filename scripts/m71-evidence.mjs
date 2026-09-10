import {spawnSync} from 'node:child_process';
import {existsSync,renameSync} from 'node:fs';
// One browser at a time. Never run this while a benchmark is active.
if(existsSync('../m7-1-evidence/candidate/opening')&&!existsSync('../m7-1-evidence/candidate/pre-birth-opening'))renameSync('../m7-1-evidence/candidate/opening','../m7-1-evidence/candidate/pre-birth-opening');
const jobs=[
 ...['opening','sanctuary'].map(s=>['m71-motion.mjs','http://127.0.0.1:5215/','baseline-final',s]),
 ...['opening','sanctuary','school','bubbles','explore','portrait'].map(s=>['m71-motion.mjs','http://127.0.0.1:5217/','candidate',s]),
 ['m71-minute.mjs'],
 ['m71-rollover.mjs'],
 ['m7-lifecycle.mjs','http://127.0.0.1:5217/','../m7-1-evidence/lifecycle'],
 ['m7-resource-audit.mjs','http://127.0.0.1:5217/','../../m7-1-evidence/resources/candidate'],
 ['m7-pass-audit.mjs','http://127.0.0.1:5217/','../m7-1-evidence/passes'],
];
for(const[file,...args]of jobs){console.log('START',file,...args);const r=spawnSync(process.execPath,['scripts/'+file,...args],{stdio:'inherit'});if(r.status)process.exit(r.status||1)}
