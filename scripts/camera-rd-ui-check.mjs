import { spawnSync } from 'node:child_process';
const check=`(async()=>{
 const lab=window.__CAMERA_LAB__,p=lab.panel;
 const initial=lab.summary();p.hidden=false;
 p.querySelector('[data-free]').click();const before=lab.camera.position.toArray();
 window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyW'}));await new Promise(r=>setTimeout(r,300));window.dispatchEvent(new KeyboardEvent('keyup',{code:'KeyW'}));
 const moved=lab.camera.position.distanceTo({x:before[0],y:before[1],z:before[2]})>.1;
 p.querySelector('[data-free]').click();p.querySelector('[data-save]').click();p.querySelector('[data-apply]').click();
 const edited=!p.querySelector('[data-error]').textContent;
 const grid=p.querySelector('[data-grid]');grid.checked=true;grid.dispatchEvent(new Event('change'));await new Promise(r=>setTimeout(r,300));
 const gridWorks=lab.grid.width===innerWidth&&!lab.grid.hidden;
 const select=p.querySelector('select');select.value='D';select.dispatchEvent(new Event('change'));await new Promise(r=>setTimeout(r,300));
 const selection=lab.id==='D';
 let exported=null;const create=URL.createObjectURL;URL.createObjectURL=blob=>{exported=blob;return create(blob)};
 p.querySelector('[data-export]').click();await new Promise(r=>setTimeout(r,100));URL.createObjectURL=create;
 const json=exported?JSON.parse(await exported.text()):null;
 return {initial,moved,edited,gridWorks,selection,exportCount:json?.poses?.length,exportFov:json?.poses?.[0]?.fov,state:lab.summary()};
})()`;
const r=spawnSync(process.execPath,['scripts/camera-rd-browser.mjs','http://127.0.0.1:5192/?cameraLab=1&direction=A&idle=300&renderer=webgl','lab-ui-lifecycle','motion','12'],{stdio:'inherit',env:{...process.env,CAMERA_INPUT:'close',EVIDENCE_AFTER:check,EVIDENCE_LIFECYCLE:'1'}});process.exitCode=r.status;
