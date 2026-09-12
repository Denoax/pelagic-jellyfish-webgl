import {browserSession,sleep} from './view-r2-browser.mjs';
const b=await browserSession('../asset2-evidence/phase-4/ao-range-test',1280,900);
try{
 await b.navigate('http://127.0.0.1:5222/?renderer=webgl&idle=300&qaDebug&direction=B&hold=14');await b.ev('__CAMERA_LAB__.seek(1)');await sleep(16000);
 await b.ev('import("/src/scene/environment/Asset2AOProof.js").then(({Asset2AOProof})=>{window.__AO_PROOF__=new Asset2AOProof(__ASSET2__.context());__AO_PROOF__.set("C")})');await sleep(4000);
 const read=()=>b.ev(`(async()=>{const p=__AO_PROOF__,r=p.node._aoRenderTarget,a=await p.renderer.readRenderTargetPixelsAsync(r,0,0,r.width,r.height);let min=255,max=0,sum=0,count=0;for(let i=0;i<a.length;i+=4){min=Math.min(min,a[i]);max=Math.max(max,a[i]);sum+=a[i];count+=a[i]<250;}return{min,max,mean:sum/(a.length/4),occludedFraction:count/(a.length/4),pixels:a.length/4}})()`);
 b.save('normal-range',await read());await b.shot('normal');
 await b.ev('__AO_PROOF__.node.radius.value=1.5;__AO_PROOF__.node.scale.value=2;__AO_PROOF__.strength.value=.8');await sleep(1200);b.save('strong-range',await read());await b.shot('strong');
 await b.ev(`(async()=>{const {texture,vec3}=await import(performance.getEntriesByType('resource').find(r=>r.name.includes('/three_tsl.js')).name);const p=__AO_PROOF__;p.compute.outputNode=vec3(texture(p.lens.target.depthTexture).r.oneMinus().mul(100));p.compute.needsUpdate=true;p.scratch.setSize(640,450);})()`);await sleep(1200);
 b.save('depth-range',await b.ev(`(async()=>{const p=__AO_PROOF__,r=p.scratch,a=await p.renderer.readRenderTargetPixelsAsync(r,0,0,r.width,r.height);let min=255,max=0,sum=0;for(let i=0;i<a.length;i+=4){min=Math.min(min,a[i]);max=Math.max(max,a[i]);sum+=a[i];}return{min,max,mean:sum/(a.length/4),near:p.lens.camera.near,far:p.lens.camera.far,depthSize:p.lens.target.depthTexture.image}})()`));
 await b.ev('__AO_PROOF__.dispose()');b.save('errors',b.errors);if(b.errors.length)throw Error(JSON.stringify(b.errors));
}finally{await b.close();}
