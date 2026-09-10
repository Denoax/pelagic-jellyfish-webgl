// Read captured pixels; never alter or brighten evidence images.
import {readFileSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';
import {Scene,PerspectiveCamera,Vector3,Raycaster} from 'three/webgpu';
import {Sanctuary} from '../src/scene/sanctuary/Sanctuary.js';
const root=resolve('../m6-5-evidence'),out={},s=new Sanctuary(new Scene());
s.group.updateMatrixWorld(true);
const rois={explore:[80,480,900,300],drift:[10,610,1240,180],deep:[10,530,1240,270],grain:[50,330,1100,420]};
for(const [view,[x,y,w,h]] of Object.entries(rois)){
 const results={};
 for(const side of ['baseline','candidate']){
  const r=spawnSync('ffmpeg',['-v','error','-i',`${root}/${side}/${view}/wide.png`,'-f','rawvideo','-pix_fmt','rgb24','-'],{maxBuffer:8e6});if(r.status)throw Error(r.stderr.toString());
  let total=0,srgb=0,n=0;const convert=v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4;
  for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){const k=(j*1280+i)*3;const rgb=[r.stdout[k]/255,r.stdout[k+1]/255,r.stdout[k+2]/255];total+=rgb.reduce((a,v,i)=>a+convert(v)*[.2126,.7152,.0722][i],0);srgb+=rgb.reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);n++;}
  results[side]={meanLinearY:total/n,meanSrgbLuma:srgb/n};
 }
 out[view]={roi:[x,y,w,h],...results,linearRatio:results.candidate.meanLinearY/results.baseline.meanLinearY};
}
const glows={};
for(const view of ['drift','deep','wide','explore','glow-close','portrait']){
 const state=JSON.parse(readFileSync(`${root}/candidate/${view}/state.json`));const [width,height]=state.buffers[0];
 const c=new PerspectiveCamera(state.camera.fixedFov||50,width/height,.1,200);c.position.fromArray(state.camera.position);c.quaternion.fromArray(state.camera.quaternion);c.updateMatrixWorld();
 const ray=new Raycaster(),p=new Vector3();
 glows[view]=s.life.widePoints.map((a,id)=>{
  p.fromArray(a.p);const distance=c.position.distanceTo(p);ray.set(c.position,p.clone().sub(c.position).normalize());
  const hit=ray.intersectObjects(s.solids,false)[0],ndc=p.clone().project(c),onScreen=Math.abs(ndc.x)<1&&Math.abs(ndc.y)<1&&ndc.z>-1&&ndc.z<1;
  return{id,site:a.site,signature:a.signature,screen:[(ndc.x*.5+.5)*width,(-ndc.y*.5+.5)*height],radiusPixels:a.s[0]*height/(2*Math.tan(c.fov*Math.PI/360)*distance),onScreen,unoccluded:hit?.object.name==='rare-benthic-light-points'&&hit.instanceId===id,firstHit:hit?.object.name};
 });
}
s.dispose();
const result={note:'Fixed rectangular displayed-image ROIs include any overlapping organisms/colonies; these are image luminance statistics, not isolated albedo, exposure or photometry. Point ray visibility is static geometry prediction, not a substitute for viewing captured pixels; shimmer can slightly shift apparent position.',luminance:out,glows};
writeFileSync(`${root}/image-analysis.json`,JSON.stringify(result,null,2));console.log(JSON.stringify(result));
