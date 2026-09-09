// Diagnostic ONLY: remove rejected M5 corrections from an existing trace.
// This does not create a candidate or change the rejected checkout.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { Vector3, Matrix4, Quaternion } from 'three/webgpu';
import { CameraJourney } from '../../site/src/scene/choreography/CameraJourney.js';
const root='/home/mani/dev/jellyfish-studio/m5-rd-evidence';
const source=`${root}/rejected-v2`,out=`${root}/rejected-authored-only-diagnostic`;
mkdirSync(out,{recursive:true});
const trace=JSON.parse(readFileSync(`${source}/trace.json`)), journey=new CameraJourney();
const pose={position:new Vector3(),target:new Vector3()},m=new Matrix4(),q=new Quaternion(),up=new Vector3(0,1,0);
for(const frame of trace){journey.sample(frame.progress,1280/900,pose);frame.position=pose.position.toArray();frame.target=pose.target.toArray();frame.quaternion=q.setFromRotationMatrix(m.lookAt(pose.position,pose.target,up)).toArray();frame.correction=null;}
writeFileSync(`${out}/trace.json`,JSON.stringify(trace));
const meta=JSON.parse(readFileSync(`${source}/metadata.json`));meta.label='DIAGNOSTIC ONLY, authored M5 path without protection';meta.mode='offline counterfactual';
writeFileSync(`${out}/metadata.json`,JSON.stringify(meta,null,2));console.log(out);
