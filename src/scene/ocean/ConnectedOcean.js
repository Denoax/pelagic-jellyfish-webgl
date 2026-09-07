import { Vector3 } from 'three/webgpu';
import { CurrentField } from './CurrentField.js';
import { OceanSnow } from './OceanSnow.js';

// One-way adapter: approved animal motion -> surrounding water. No tissue
// geometry/material/physics writes, and no changes to the authored camera.
export class ConnectedOcean {
  constructor(app, environment, tissues, mobile) {
    this.field = new CurrentField();
    this.tissues = tissues;
    this.snow = new OceanSnow(app.scene, this.field, app.camera, mobile);
    this.hidden = [...environment.layers, environment.currentVeil, app.plankton.object];
    this.hidden.forEach(object => { object.visible = false; });
    this.axis = new Vector3(); this.origin = new Vector3(); this.echoPoint = new Vector3();
    this.observers = tissues.map(t => ({ previous: t.medusa.transformationObject.position.clone(), pulse: 0, ready: false }));
    this.echoes = Array.from({ length: 8 }, () => ({ tissue: null, due: 0, origin: new Vector3() }));
    this.accumulator = 0; this.cpuMs = []; this.echoCount = 0;
    tissues.forEach(t => t.haloDrift?.setCurrentField(this.field));
    window.__CONNECTED_OCEAN__ = {
      state: () => ({ ...this.field.state(), echoes: this.echoes.filter(e => e.tissue).length,
        echoCount: this.echoCount, snowCount: this.snow.layers.reduce((n, l) => n + l.count, 0),
        localFlecks: tissues.reduce((n, t) => n + (t.haloDrift?.count || 0), 0) }),
      cost: () => this.cpuMs.slice(),
      resetCost: () => { this.cpuMs.length = 0; },
    };
  }

  activate(tissue, point) {
    const event = this.field.activate(point, tissue.index);
    if (!event) return;
    let neighbor = null, distance = 5.5;
    for (const other of this.tissues) {
      if (other === tissue || other.presence < 0.15) continue;
      const d = other.group.position.distanceTo(point);
      if (d < distance) { distance = d; neighbor = other; }
    }
    if (neighbor) {
      // One subdued response, after the surrounding disturbance arrives.
      // Never recursively calls this adapter; bounded pool, no timer closures.
      if (this.echoes.some(e => e.tissue === neighbor)) return;
      const slot = this.echoes.find(e => !e.tissue) || this.echoes.reduce((a, b) => a.due < b.due ? a : b);
      slot.tissue = neighbor; slot.due = this.field.time + distance / 1.8 + 0.3;
      slot.origin.copy(point);
    }
  }

  update(dt) {
    const start = performance.now();
    if (!Number.isFinite(dt) || dt <= 0 || dt > 0.25) return;
    for (let i = 0; i < this.tissues.length; i++) {
      const t = this.tissues[i], observer = this.observers[i], body = t.medusa.transformationObject;
      const pulse = t.medusa.swimKinematics?.primaryThrust || 0;
      const speed = body.position.distanceTo(observer.previous) / dt;
      if (observer.ready && t.presence > 0.15 && pulse > 0.18 && observer.pulse <= 0.18 && speed > 0.015 && speed < 4) {
        this.axis.set(0, 1, 0).applyQuaternion(body.quaternion);
        const scale = body.scale.x;
        this.origin.copy(body.position).addScaledVector(this.axis, -0.24 * scale);
        this.field.wake(this.origin, this.axis, 1.05 * scale, Math.min(0.85, 0.25 + speed * 0.4), t.index);
      }
      observer.previous.copy(body.position); observer.pulse = pulse; observer.ready = true;
    }
    this.accumulator = Math.min(this.accumulator + dt, 0.1);
    while (this.accumulator >= 1 / 60 - 1e-8) {
      this.field.step(1 / 60);
      this.snow.update(1 / 60);
      this.accumulator -= 1 / 60;
    }
    for (const echo of this.echoes) if (echo.tissue && this.field.time >= echo.due) {
      if (echo.tissue.presence > 0.15 && echo.tissue.group.position.distanceTo(echo.origin) < 5.5) {
        this.echoPoint.set(0.18, echo.tissue.species.height * 0.62, 0.06);
        echo.tissue.group.localToWorld(this.echoPoint);
        echo.tissue.activate(this.echoPoint, 0.11);
        this.echoCount++;
      }
      echo.tissue = null;
    }
    if (this.cpuMs.length < 20000) this.cpuMs.push(performance.now() - start);
  }

  afterTissue() {
    this.hidden.forEach(object => { object.visible = false; });
    // Only the independent particulate material; NEVER tissue glow/color.
    this.tissues.forEach(t => {
      if (!t.halo) return;
      t.halo.material.color.setHex(0x83bbd7);
      t.halo.material.opacity = 0.34;
      t.halo.material.size = 0.022;
    });
  }

  dispose() {
    this.tissues.forEach(t => t.haloDrift?.setCurrentField(null));
    this.snow.dispose();
    delete window.__CONNECTED_OCEAN__;
  }
}
