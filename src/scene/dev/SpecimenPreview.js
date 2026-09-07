import * as THREE from 'three/webgpu';

// Inspection fixture only: no renderer, geometry, material, or appendage solver.
// The production school director and LivingAppendages remain the owners.
export class SpecimenPreview {
  constructor(query, app, tissues, environment, director) {
    this.app=app; this.tissues=tissues; this.environment=environment;
    this.chamber=query.get('specimen')==='1';
    this.candidate=query.get('animal')!=='baseline';
    this.time=0; this.hold=Number(query.get('hold')||Infinity);
    this.angle=query.get('angle')||'oblique'; this.distance=query.get('distance')||'medium';
    this.target=new THREE.Vector3(); this.offset=new THREE.Vector3();
    this.intervals=[]; this.lastFrame=0;
    this.savedVisibility=new Map();
    if(this.chamber){
      const actor=director.actors[0];
      actor.entry.set(0,-18,0); actor.center.set(0,25,0);actor.exit.set(20,45,4);
      actor.definition={...actor.definition,life:[0,1],scale:1};
      actor.initialized=false;
      app.scene.children.forEach(object=>{
        this.savedVisibility.set(object,object.visible);
        if(!object.isLight && object!==app.lights.object && object!==tissues[0].group) object.visible=false;
      });
      app.scene.backgroundNode=null; app.scene.background=new THREE.Color(0x06121c);
    }
    window.__SPECIMEN__={
      state:()=>({time:this.time,angle:this.angle,distance:this.distance,candidate:this.candidate,chamber:this.chamber,bloom:'off (normal production path)',phase:tissues[0].medusa.swimKinematics?.phase,activation:tissues[0].activation,frames:this.intervals.length}),
      view:(angle,distance='medium')=>{this.angle=angle;this.distance=distance;},
      resume:()=>{this.hold=Infinity;},
      pause:()=>{this.hold=this.time;},
      holdAt:time=>{this.hold=Math.max(this.time,Number(time)||this.time);},
      activate:()=>{const p=new THREE.Vector3(.3,.5,.15);tissues[0].group.localToWorld(p);tissues[0].activate(p);},
      frameIntervals:()=>this.intervals.slice(),
      resetIntervals:()=>{this.intervals.length=0;this.lastFrame=0;},
      rendererInfo:()=>{const backend=app.renderer.backend;const gl=backend.gl;const ext=gl?.getExtension('WEBGL_debug_renderer_info');return {backend:backend.isWebGLBackend?'WebGL 2':'WebGPU',gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):backend.device?.adapterInfo?.description||'not exposed',drawBuffer:[app.renderer.domElement.width,app.renderer.domElement.height]};},
    };
    this.onKey=event=>{
      if(!this.chamber || document.querySelector('.idle-screen.is-active') || event.target.closest?.('input,textarea,select'))return;
      const angle={Digit1:'oblique',Digit2:'side',Digit3:'underside',Digit4:'top'}[event.code];
      if(angle)this.angle=angle;
      const distance={KeyN:'near',KeyM:'medium',KeyF:'far'}[event.code];
      if(distance)this.distance=distance;
      if(event.code==='KeyA')window.__SPECIMEN__.activate();
      if(event.code==='Space'){event.preventDefault();this.hold=Number.isFinite(this.hold)?Infinity:this.time;}
    };
    window.addEventListener('keydown',this.onKey);
  }
  advance(delta){const step=Math.min(Number.isFinite(this.hold)?1/60:Math.max(delta,0),.05,Math.max(0,this.hold-this.time));this.time+=step;return step;}
  beforeTissue(){
    if(!this.chamber)return;
    const tissue=this.tissues[0];
    tissue.setPresence(1,1);
    this.tissues.slice(1).forEach(t=>{t.presence=0;});
    // Follow translation only. Body heading/turns are still the school director's.
    this.target.copy(tissue.medusa.transformationObject.position);
    this.offset.set(0,this.distance==='near'?-.25:-1.4,0).applyQuaternion(tissue.medusa.transformationObject.quaternion);
    this.target.add(this.offset);
    const distance={near:4.3,medium:8.6,far:17}[this.distance]||8.6;
    const offsets={side:[1,0,0],underside:[.2,-.9,.6],top:[.2,1,.4],oblique:[.65,.18,1]};
    this.offset.fromArray(offsets[this.angle]||offsets.oblique).normalize().multiplyScalar(distance);
    if(Number.isFinite(this.hold))this.offset.applyQuaternion(tissue.medusa.transformationObject.quaternion);
    this.app.camera.position.copy(this.target).add(this.offset);
    this.app.camera.up.set(0,1,0);this.app.camera.lookAt(this.target);this.app.camera.updateMatrixWorld();
  }
  afterTissue(){
    if(this.chamber){
      this.savedVisibility.forEach((_,o)=>{if(!o.isLight&&o!==this.app.lights.object&&o!==this.tissues[0].group)o.visible=false;});
      this.tissues.slice(1).forEach(t=>{t.group.visible=false;});
      this.tissues.forEach(t=>{if(t.halo)t.halo.visible=false;});
    }
  }
  rendered(){const now=performance.now();if(this.lastFrame)this.intervals.push(now-this.lastFrame);this.lastFrame=now;if(this.intervals.length>20000)this.intervals.shift();}
  dispose(){window.removeEventListener('keydown',this.onKey);delete window.__SPECIMEN__;}
}
