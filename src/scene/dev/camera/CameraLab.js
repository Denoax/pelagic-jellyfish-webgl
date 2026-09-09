import { Euler, Quaternion, Vector3 } from 'three/webgpu';
import { bakeTrack, ProgressSpring, TrackPlayer } from './CameraTrack.js';
import { directions } from './directions.js';

// Dev-only authoring UI around the SAME ocean camera. No second scene/renderer.
export class CameraLab {
  constructor(camera, director, query) {
    this.camera = camera; this.director = director; this.free = false; this.playing = false;
    const response = Number(query.get('response'));
    this.spring = new ProgressSpring([6, 10, 16].includes(response) ? response : 10);
    this.keys = new Set(); this.euler = new Euler(0, 0, 0, 'YXZ'); this.move = new Vector3();
    this.id = directions[query.get('direction')] ? query.get('direction') : 'A';
    this.listeners = []; this.disposed = false; this.cpu = []; this.measuring = false;
    this.select(this.id); this.mount(query.get('labUI') !== '0');
    this.listen(document, 'visibilitychange', () => { this.spring.velocity = 0; this.keys.clear(); this.dragging = false; });
    this.listen(window, 'keydown', e => {
      if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.code === 'KeyH') this.panel.hidden = !this.panel.hidden;
      if (this.free && ['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyE'].includes(e.code)) { this.keys.add(e.code); e.preventDefault(); }
    });
    this.listen(window, 'keyup', e => this.keys.delete(e.code));
    this.listen(window, 'blur', () => { this.keys.clear(); this.dragging = false; });
    this.listen(window, 'pointerdown', e => { if (this.free && e.button === 2 && !this.panel.contains(e.target)) this.dragging = true; });
    this.listen(window, 'pointerup', () => { this.dragging = false; });
    this.listen(window, 'contextmenu', e => { if (this.free) e.preventDefault(); });
    this.listen(window, 'pointermove', e => {
      if (!this.free || !this.dragging) return;
      this.euler.setFromQuaternion(camera.quaternion, 'YXZ');
      this.euler.y -= e.movementX * .002; this.euler.x = Math.max(-1.4, Math.min(1.4, this.euler.x - e.movementY * .002));
      camera.quaternion.setFromEuler(this.euler);
    });
    window.__CAMERA_LAB__ = this;
  }
  listen(el, type, fn) { el.addEventListener(type, fn); this.listeners.push(() => el.removeEventListener(type, fn)); }
  select(id) {
    this.id = id; this.definition = structuredClone(directions[id]); this.rebake();
    this.spring.reset(0); this.free = false; if (this.editor) this.editor.value = JSON.stringify(this.definition, null, 2);
  }
  rebake() { this.player = new TrackPlayer(bakeTrack(this.definition)); }
  summary() { return { direction: this.id, progress: this.spring.position, response: this.spring.omega, free: this.free, fixedFov: this.player.track.fov, roll: this.euler.setFromQuaternion(this.camera.quaternion, 'YXZ').z * 180 / Math.PI }; }
  actors() { return this.director.actors.map(a => ({ id: a.id, position: a.position.toArray(), quaternion: a.quaternion.toArray(), scale: a.scale, presence: a.presence })); }
  update(target, dt, time) {
    const start = this.measuring ? performance.now() : 0;
    if (this.free) {
      this.move.set(Number(this.keys.has('KeyD')) - Number(this.keys.has('KeyA')), Number(this.keys.has('KeyE')) - Number(this.keys.has('KeyQ')), Number(this.keys.has('KeyS')) - Number(this.keys.has('KeyW')));
      if (this.move.lengthSq()) this.camera.position.add(this.move.normalize().applyQuaternion(this.camera.quaternion).multiplyScalar(Math.min(dt, .05) * 2));
    } else this.player.sample(this.spring.update(target, dt), this.camera);
    if (this.measuring) this.cpu.push(performance.now() - start);
    if (this.playing) { this.playProgress = Math.min(1, this.playProgress + Math.min(dt, .05) / 80); this.seek(this.playProgress); if (this.playProgress === 1) this.playing = false; }
    this.onFrame?.(target, time);
    if (!this.panel.hidden && time - (this.lastUI || 0) > .15) { this.lastUI = time; this.status.textContent = `${this.id} · ${this.spring.position.toFixed(3)} · ${this.camera.fov}° · roll ${this.summary().roll.toFixed(2)}°`; this.draw(); }
  }
  seek(s) { window.scrollTo({ top: s * (document.documentElement.scrollHeight - innerHeight), behavior: 'instant' }); }
  mount(visible) {
    this.panel = document.createElement('aside'); this.panel.dataset.cameraLab = 'true'; this.panel.hidden = !visible;
    this.panel.style.cssText = 'position:fixed;z-index:1000;left:16px;top:16px;width:320px;max-height:90vh;overflow:auto;padding:14px;background:#0d1925ee;color:#dceef4;font:12px monospace;border:1px solid #587282';
    this.panel.innerHTML = `<strong>LOCAL CAMERA R&D · not production</strong><p><select aria-label="Direction">${Object.values(directions).map(d => `<option value="${d.id}">${d.id} · ${d.name}</option>`).join('')}</select></p><p data-status></p><p><button data-free>Free camera</button> <button data-play>Play / pause</button> <button data-reset>Replay</button></p><p>Free: RMB look · WASD/QE move · H hide</p><label>Progress <input data-progress type="range" min="0" max="1" step=".001" value="0"></label><p><label>Response <select data-response><option value="6">Patient</option><option value="10" selected>Medium</option><option value="16">Responsive</option></select></label> <label>Fixed FOV <input data-fov type="number" min="35" max="80" style="width:45px"></label></p><p><button data-save>Save pose</button> <button data-apply>Apply edited poses</button> <button data-export>Export JSON</button></p><p>Edit/reorder pose entries below. Progress must increase, endpoints 0 and 1.</p><textarea aria-label="Camera pose authoring JSON" rows="8" style="width:100%;box-sizing:border-box"></textarea><p><label><input data-grid type="checkbox"> Thirds & actor envelopes</label></p><output data-error></output>`;
    this.panel.querySelectorAll('button,select,textarea,input[type=number]').forEach(el => {
      el.style.color = '#e2eff5'; el.style.background = '#172c3a'; el.style.border = '1px solid #597585'; el.style.font = 'inherit'; el.style.padding = '4px';
    });
    document.body.append(this.panel); this.status = this.panel.querySelector('[data-status]'); this.editor = this.panel.querySelector('textarea'); this.editor.value = JSON.stringify(this.definition, null, 2);
    const control = name => this.panel.querySelector(`[data-${name}]`), choose = this.panel.querySelector('select'); choose.value = this.id;
    this.listen(choose, 'change', () => { this.select(choose.value); this.seek(0); control('fov').value = this.definition.fov; });
    control('response').value = String(this.spring.omega);
    this.listen(control('response'), 'change', e => { this.spring.omega = Number(e.target.value); });
    this.listen(control('progress'), 'input', e => { this.playing = false; this.seek(Number(e.target.value)); });
    this.listen(control('free'), 'click', () => { this.free = !this.free; control('free').textContent = this.free ? 'Return to track' : 'Free camera'; });
    this.listen(control('play'), 'click', () => { this.playing = !this.playing; this.playProgress = this.spring.position; });
    this.listen(control('reset'), 'click', () => { this.spring.reset(0); this.seek(0); this.playProgress = 0; this.playing = true; });
    control('fov').value = this.definition.fov;
    this.listen(control('fov'), 'change', e => { this.definition.fov = Math.max(35, Math.min(80, Number(e.target.value) || 48)); this.rebake(); this.editor.value = JSON.stringify(this.definition, null, 2); });
    this.listen(control('save'), 'click', () => { const s = Number(this.spring.position.toFixed(5)); const pose = { s, position: this.camera.position.toArray(), quaternion: this.camera.quaternion.toArray() }; this.definition.poses = this.definition.poses.filter(p => Math.abs(p.s - s) > .0001).concat(pose).sort((a,b) => a.s-b.s); this.editor.value = JSON.stringify(this.definition, null, 2); });
    this.listen(control('apply'), 'click', () => { try { const definition = JSON.parse(this.editor.value); const player = new TrackPlayer(bakeTrack(definition)); this.definition = definition; this.player = player; control('error').textContent = ''; } catch(e) { control('error').textContent = e.message; } });
    this.listen(control('export'), 'click', () => { const { data, count, fov } = this.player.track; const poses = Array.from({length:count}, (_,i) => ({ s:i/(count-1), position:Array.from(data.slice(i*7,i*7+3)), quaternion:Array.from(data.slice(i*7+3,i*7+7)), fov })); const url = URL.createObjectURL(new Blob([JSON.stringify({authoring:this.definition,poses})], {type:'application/json'})); const a = document.createElement('a'); a.href=url; a.download=`pelagic-camera-${this.id}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); });
    this.grid = document.createElement('canvas'); this.grid.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:999'; this.grid.hidden = true; document.body.append(this.grid);
    this.listen(control('grid'), 'change', e => { this.grid.hidden = !e.target.checked; });
  }
  draw() {
    if (this.grid.hidden) return; const c = this.grid; c.width = innerWidth; c.height = innerHeight; const x = c.getContext('2d'); x.strokeStyle='#89adb477'; x.fillStyle='#ddd';
    for (const f of [1/3,2/3]) { x.beginPath(); x.moveTo(c.width*f,0); x.lineTo(c.width*f,c.height); x.moveTo(0,c.height*f); x.lineTo(c.width,c.height*f); x.stroke(); }
    const v = new Vector3(); this.director.actors.forEach((a,i) => { v.copy(a.position).project(this.camera); if (v.z>=1 || a.presence<.2) return; const px=(v.x+1)*c.width/2,py=(1-v.y)*c.height/2,d=this.camera.position.distanceTo(a.position); const r=1.55*a.scale/(Math.max(.1,d)*Math.tan(this.camera.fov*Math.PI/360))*c.height/2; x.beginPath(); x.arc(px,py,r,0,Math.PI*2); x.stroke(); x.fillText(`animal ${i} · bell proxy`,px,py); });
  }
  dispose() { this.listeners.forEach(fn => fn()); this.panel.remove(); this.grid.remove(); this.onFrame = null; this.keys.clear(); this.disposed = true; delete window.__CAMERA_LAB__; }
}
