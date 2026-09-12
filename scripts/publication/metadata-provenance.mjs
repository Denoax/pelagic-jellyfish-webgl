import {readFileSync,writeFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join,resolve} from 'node:path';
const evidence=resolve(process.argv[2]);
const digest=file=>createHash('sha256').update(readFileSync(file)).digest('hex');
const json=(path,data)=>writeFileSync(path,JSON.stringify(data,null,2)+'\n');
const records=[];
for(let i=1;i<=12;i++){
 const file=`paper/media/S${i}.json`,m=JSON.parse(readFileSync(file));
 m.captureToolSha='2859eac8fa9e32a75059ffed2d7815c60c01070d';
 m.captureScriptsSha256={capture:digest('scripts/publication/capture.mjs'),browser:digest('scripts/publication/browser.mjs')};
 if(i<=2)m.cameraTelemetryNote='The specimen angle/distance fixture in simulation is authoritative for the view. The legacy route-rig pose field is not the specimen camera transform.';
 json(file,m);records.push(m);
}
json('paper/media/catalog.json',records);
const f=JSON.parse(readFileSync('paper/figures/capture-metadata.json'));
f.seed=7183;f.captureScript='scripts/publication/capture.mjs';f.captureScriptsSha256=records[0].captureScriptsSha256;
f.quality='Approved runtime; DPR 1; bloom off';
f.overviewCaptureDate=statSync(join(evidence,'scout','A-0.16.png')).mtime.toISOString();
f.sanctuaryCaptureDate=statSync(join(evidence,'scout','D-1.png')).mtime.toISOString();
f.dateProvenance='Original capture-file modification timestamps, retained before publication processing';json('paper/figures/capture-metadata.json',f);
const inspection=JSON.parse(readFileSync('paper/inspection/metadata.json'));
inspection.seed=7183;inspection.captureScript='scripts/publication/inspection.mjs';inspection.captureScriptsSha256={inspection:digest(inspection.captureScript),browser:digest('scripts/publication/browser.mjs')};inspection.quality='Approved runtime; DPR 1; bloom off';
inspection.captureDate=statSync(join(evidence,'inspection-final','inspection.json')).mtime.toISOString();json('paper/inspection/metadata.json',inspection);
