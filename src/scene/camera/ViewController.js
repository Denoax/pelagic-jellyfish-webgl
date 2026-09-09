import { Euler, PerspectiveCamera, Vector3 } from 'three/webgpu';
import { bakeTrack, TrackPlayer } from './CameraTrack.js';
import { directions } from './directions.js';
import { JourneyController, normalizeWheel } from './JourneyController.js';
import { readViewPreferences, writeViewPreferences, viewModes } from './viewPreferences.js';

// Owns only the observer and input state. Never creates/restarts the ocean,
// modifies an actor, changes simulation time, or changes render quality.
export class ViewController {
  constructor(camera, director, query = new URLSearchParams(), surface) {
    this.camera = camera; this.director = director; this.surface = surface;
    try { this.storage = window.localStorage; } catch { this.storage = null; }
    this.preferences = readViewPreferences(this.storage);
    this.id = directions[query.get('direction')] ? query.get('direction') : this.preferences.mode === 'explore' ? 'B' : this.preferences.mode;
    this.free = !directions[query.get('direction')] && this.preferences.mode === 'explore';
    this.journey = new JourneyController({ response: this.preferences.response });
    this.spring = this.journey; // Existing local camera diagnostics use this read-only state.
    this.lastRaw = null; this.touchY = null; this.nativeWheelUntil = 0;
    this.telemetry = import.meta.env?.DEV && query.get('scrollDebug') === '1' ? [] : null;
    this.definitions = Object.fromEntries(Object.entries(directions).map(([k,v]) => [k, structuredClone(v)]));
    this.players = Object.fromEntries(Object.entries(this.definitions).map(([k,v]) => [k, new TrackPlayer(bakeTrack(v))]));
    this.keys = new Set(); this.listeners = []; this.subscribers = new Set(); this.dragging = null;
    this.euler = new Euler(0,0,0,'YXZ'); this.move = new Vector3(); this.projected = new Vector3();
    this.targetCamera = new PerspectiveCamera(); this.from = new PerspectiveCamera();
    this.transition = 1; this.transitionDuration = .95; this.lastUI = -Infinity;
    this.players[this.id].sample(0, camera);
    this.setExploreClass();
    const release = () => { this.keys.clear(); this.dragging = null; this.touchY = null; this.journey.suspend(); };
    this.listen(document, 'visibilitychange', release); this.listen(window, 'blur', release);
    this.listen(window, 'keydown', e => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape' && this.free && !e.target.closest?.('[data-view-ui],input,textarea,select')) { this.select(this.id); e.preventDefault(); return; }
      if (document.querySelector('.idle-screen.is-active') || e.target.closest?.('input,textarea,select,[contenteditable=true],[role=menu],[data-view-editor]')) return;
      if (this.free && ['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'].includes(e.code)) { this.keys.add(e.code); e.preventDefault(); }
      if (!this.free && !e.target.closest?.('[data-view-ui]') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const delta = {ArrowDown:64, ArrowUp:-64, PageDown:innerHeight*.6, PageUp:-innerHeight*.6, Space:(e.shiftKey?-1:1)*innerHeight*.6}[e.code];
        if (delta) { this.input(delta, 'keyboard'); e.preventDefault(); }
        if (e.code === 'Home' || e.code === 'End') { this.seek(e.code==='Home'?0:1); e.preventDefault(); }
      }
    });
    const canScroll = e => !this.free && !document.querySelector('.idle-screen.is-active') && !e.target.closest?.('[data-view-ui],input,textarea,select,[contenteditable=true]');
    this.listen(window, 'wheel', e => {
      if (!canScroll(e) || e.ctrlKey || e.metaKey || Math.abs(e.deltaX)>Math.abs(e.deltaY)) return;
      const mode=e.deltaMode, pixels=normalizeWheel(e.deltaY,mode,innerHeight);
      if(e.cancelable)e.preventDefault();
      else this.nativeWheelUntil=performance.now()+250;
      this.input(pixels,'wheel',e.deltaY,mode);
    }, {passive:false});
    this.listen(window, 'touchstart', e => { this.touchY=canScroll(e)&&e.touches.length===1?e.touches[0].clientY:null; }, {passive:true});
    this.listen(window, 'touchmove', e => {
      if (!canScroll(e)||e.touches.length!==1||this.touchY===null) { this.touchY=null; return; }
      const y=e.touches[0].clientY, delta=this.touchY-y; this.touchY=y;
      if(e.cancelable){e.preventDefault();this.input(delta,'touch');}
    }, {passive:false});
    this.listen(window, 'touchend', ()=>{this.touchY=null;}, {passive:true});
    this.listen(window, 'touchcancel', ()=>{this.touchY=null;}, {passive:true});
    this.listen(window, 'resize', ()=>this.syncDocument());
    this.listen(window, 'keyup', e => this.keys.delete(e.code));
    this.listen(surface, 'pointerdown', e => {
      if (!this.free || (e.button !== 2 && e.pointerType !== 'touch')) return;
      this.dragging = { id:e.pointerId, x:e.clientX, y:e.clientY };
      surface.setPointerCapture(e.pointerId); e.preventDefault();
    });
    this.listen(surface, 'pointermove', e => {
      if (!this.free || this.dragging?.id !== e.pointerId) return;
      this.euler.setFromQuaternion(camera.quaternion,'YXZ');
      this.euler.y -= (e.clientX-this.dragging.x)*.002;
      this.euler.x = Math.max(-1.4,Math.min(1.4,this.euler.x-(e.clientY-this.dragging.y)*.002));
      this.euler.z = 0; camera.quaternion.setFromEuler(this.euler);
      this.dragging.x=e.clientX; this.dragging.y=e.clientY;
    });
    this.listen(surface, 'pointerup', release); this.listen(surface, 'pointercancel', release);
    this.listen(surface, 'contextmenu', e => { if(this.free)e.preventDefault(); });
    this.listen(window, 'click', e => { if(e.target.closest?.('a[href="#intro"]')){e.preventDefault();this.seek(0);} });
  }
  listen(target,type,fn,options) { target?.addEventListener(type,fn,options); this.listeners.push(()=>target?.removeEventListener(type,fn,options)); }
  subscribe(fn) { this.subscribers.add(fn); return ()=>this.subscribers.delete(fn); }
  emit() { const state=this.summary(); this.subscribers.forEach(fn=>fn(state)); }
  get destination() { return this.journey.target; }
  set destination(value) { this.journey.request(value); }
  summary() { return { direction:this.id, mode:this.free?'explore':this.id, progress:this.journey.position, destination:this.destination, velocity:this.journey.velocity, acceleration:this.journey.acceleration, lead:this.destination-this.journey.position, leadClamped:this.journey.leadClamped, response:this.journey.response, free:this.free, transitioning:this.transition<1, fixedFov:this.definitions[this.id].fov, roll:this.euler.setFromQuaternion(this.camera.quaternion,'YXZ').z*180/Math.PI }; }
  actors() { return this.director.actors.map(a=>({id:a.id,position:a.position.toArray(),quaternion:a.quaternion.toArray(),scale:a.scale,presence:a.presence})); }
  persist(values) { Object.assign(this.preferences,values); writeViewPreferences(this.storage,this.preferences); }
  setExploreClass() { document.documentElement.classList.toggle('view-is-exploring',this.free); }
  beginTransition() { this.from.position.copy(this.camera.position); this.from.quaternion.copy(this.camera.quaternion); this.from.fov=this.camera.fov; this.transition=0; }
  select(mode) {
    if(!viewModes.some(m=>m.id===mode))return;
    this.keys.clear(); this.dragging=null;
    if(mode==='explore') { this.free=true; this.transition=1; }
    else { this.beginTransition(); this.free=false; this.id=mode; }
    this.setExploreClass(); this.persist({mode}); this.emit();
  }
  syncDocument() {
    window.scrollTo({top:this.destination*Math.max(1,document.documentElement.scrollHeight-innerHeight),behavior:'instant'});
    this.lastRaw=window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
  }
  input(pixels,kind,deltaY=pixels,deltaMode=0) {
    const before=this.destination;
    this.journey.input(pixels);this.syncDocument();
    if(this.telemetry){this.telemetry.push({...this.summary(),time:performance.now(),kind,deltaY,deltaMode,normalized:pixels,inputDirection:Math.sign(pixels),before,after:this.destination});if(this.telemetry.length>512)this.telemetry.shift();}
  }
  request(value) { this.journey.request(value); this.syncDocument(); this.emit(); }
  seek(value) {
    // Explicit authoring/anchor navigation only, never called by wheel/touch.
    this.beginTransition(); this.journey.seek(value); this.syncDocument();
    this.emit();
  }
  setResponse(value) { if(!['cinematic','balanced','responsive'].includes(value))return; this.journey.response=value; this.persist({response:value}); this.emit(); }
  advance(raw,dt,time) {
    // Read actual DOM state, not a potentially one-frame-old scroll callback.
    // Some browser wheel transactions are non-cancelable. They still carry
    // intent; reconcile their native scroll echo instead of counting it twice.
    // This only synchronizes the document, never adds another camera follower.
    if(performance.now()<this.nativeWheelUntil)this.syncDocument();
    const actual=window.scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if(this.lastRaw===null) { this.lastRaw=actual; this.journey.seek(actual); }
    else if(Math.abs(actual-this.lastRaw)>.000001) { this.lastRaw=actual; if(!this.free){this.journey.request(actual);this.syncDocument();} }
    if(!this.free) this.journey.update(null,dt);
    if(time-this.lastUI>.1) { this.lastUI=time;this.emit(); }
    return this.journey.position;
  }
  updatePose(dt,time) {
    if(this.free) {
      this.move.set(Number(this.keys.has('KeyD'))-Number(this.keys.has('KeyA')),Number(this.keys.has('KeyE'))-Number(this.keys.has('KeyQ')),Number(this.keys.has('KeyS'))-Number(this.keys.has('KeyW')));
      if(this.move.lengthSq() && dt<=.25)this.camera.position.add(this.move.normalize().applyQuaternion(this.camera.quaternion).multiplyScalar(Math.min(dt,.05)*2));
      this.camera.updateMatrixWorld();
    } else {
      this.players[this.id].sample(this.journey.position,this.targetCamera);
      if(dt<=.25)this.transition=Math.min(1,this.transition+Math.max(0,dt)/this.transitionDuration);
      const t=this.transition,u=t*t*t*(10+t*(-15+6*t));
      this.camera.position.copy(this.from.position).lerp(this.targetCamera.position,u);
      this.camera.quaternion.copy(this.from.quaternion).slerp(this.targetCamera.quaternion,u);
      const fov=this.from.fov+(this.targetCamera.fov-this.from.fov)*u;
      if(Math.abs(fov-this.camera.fov)>1e-8){this.camera.fov=fov;this.camera.updateProjectionMatrix();}
      this.camera.updateMatrixWorld();
    }
    this.onFrame?.(this.destination,time);
  }
  authoring() { return JSON.stringify(this.definitions[this.id],null,2); }
  validate(definition) {
    if(!definition || !Array.isArray(definition.poses) || definition.poses.length>200 || !Number.isFinite(definition.fov) || definition.fov<35 || definition.fov>80)throw Error('Use 2–200 poses and a field of view between 35° and 80°.');
    for(const p of definition.poses) {
      if(!Array.isArray(p.position)||p.position.length!==3||!p.position.every(Number.isFinite))throw Error('Each pose needs three finite position coordinates.');
      const r=p.quaternion||p.rotation;
      if(!Array.isArray(r)||r.length!==(p.quaternion?4:3)||!r.every(Number.isFinite))throw Error('Each pose needs a valid rotation or quaternion.');
      if(p.quaternion && Math.abs(Math.hypot(...r)-1)>.001)throw Error('Pose quaternions must have unit length.');
    }
    return new TrackPlayer(bakeTrack(definition));
  }
  apply(text) { const definition=JSON.parse(text),player=this.validate(definition); this.beginTransition();this.definitions[this.id]=definition;this.players[this.id]=player;this.emit(); }
  setFov(fov) { const d=structuredClone(this.definitions[this.id]);d.fov=fov;this.apply(JSON.stringify(d)); if(this.free){this.camera.fov=fov;this.camera.updateProjectionMatrix();} }
  savePose(text) {
    const d=JSON.parse(text);this.validate(d);const s=Number(this.journey.position.toFixed(5));
    d.poses=d.poses.filter(p=>Math.abs(p.s-s)>.0001).concat({s,position:this.camera.position.toArray(),quaternion:this.camera.quaternion.toArray()}).sort((a,b)=>a.s-b.s);
    return JSON.stringify(d,null,2);
  }
  export(text) {
    const definition=JSON.parse(text),{track}=this.validate(definition),{data,count,fov}=track;
    return JSON.stringify({authoring:definition,poses:Array.from({length:count},(_,i)=>({s:i/(count-1),position:Array.from(data.slice(i*7,i*7+3)),quaternion:Array.from(data.slice(i*7+3,i*7+7)),fov}))});
  }
  draw(canvas) {
    if(canvas.width!==innerWidth||canvas.height!==innerHeight){canvas.width=innerWidth;canvas.height=innerHeight;}
    const x=canvas.getContext('2d'),w=canvas.width,h=canvas.height;x.clearRect(0,0,w,h);x.strokeStyle='#89adb477';x.fillStyle='#edf7f7';x.font='11px monospace';
    for(const f of [1/3,2/3]){x.beginPath();x.moveTo(w*f,0);x.lineTo(w*f,h);x.moveTo(0,h*f);x.lineTo(w,h*f);x.stroke();}
    this.director.actors.forEach((a,i)=>{const v=this.projected.copy(a.position).project(this.camera);if(v.z>=1||v.z< -1||a.presence<.2)return;const px=(v.x+1)*w/2,py=(1-v.y)*h/2,d=this.camera.position.distanceTo(a.position),r=1.55*a.scale/(Math.max(.1,d)*Math.tan(this.camera.fov*Math.PI/360))*h/2;x.beginPath();x.arc(px,py,r,0,Math.PI*2);x.stroke();x.fillText(`animal ${i} · bell proxy`,px,py);});
  }
  dispose() { this.listeners.forEach(fn=>fn());this.subscribers.clear();this.keys.clear();this.onFrame=null;document.documentElement.classList.remove('view-is-exploring'); }
}
