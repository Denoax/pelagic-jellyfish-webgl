import * as THREE from "three/webgpu";

const WORLD_UP = new THREE.Vector3(0, 1, 0);
const LOCAL_ROLL_AXIS = new THREE.Vector3(0, 0, 1);
const MAX_BANK = THREE.MathUtils.degToRad(1.5);
const SHOT_FRAMING = {
  "second-encounter": { horizontal: 1.55, vertical: 0 },
  aggregation: { horizontal: 1.7, vertical: -0.08 },
  "final-guide": { horizontal: 1.45, vertical: -0.38 },
  departure: { horizontal: 3.15, vertical: -1.08 },
};

// One continuous descent, authored as spherical camera moves around a travelling
// point of interest. Azimuth always advances so the journey never becomes a
// left/right pendulum.
const CHAPTERS = [
  {
    at: 0,
    focus: [0, 0, 0],
    azimuth: -0.16,
    elevation: 0.045,
    radius: 9.65,
    subjectOffset: 1.55,
    lookLift: 0.08,
    fov: 47,
  },
  {
    at: 0.16,
    focus: [0.08, -0.28, -0.9],
    azimuth: 0.18,
    elevation: 0.105,
    radius: 9.15,
    subjectOffset: -1.65,
    lookLift: 0.12,
    fov: 46,
  },
  {
    at: 0.31,
    focus: [0.34, -0.7, -2.25],
    azimuth: 0.65,
    elevation: 0.025,
    radius: 8.25,
    subjectOffset: -1.95,
    lookLift: 0.16,
    fov: 45,
  },
  {
    at: 0.49,
    focus: [-0.14, -1.24, -4.2],
    azimuth: 1.14,
    elevation: -0.105,
    radius: 7.75,
    subjectOffset: -1.82,
    lookLift: 0.22,
    fov: 44,
  },
  {
    at: 0.6,
    focus: [-0.3, -1.55, -5.2],
    azimuth: 1.39,
    elevation: -0.13,
    radius: 8.05,
    subjectOffset: -1.62,
    lookLift: 0.2,
    fov: 45,
  },
  {
    at: 0.72,
    focus: [0.18, -2.02, -6.8],
    azimuth: 1.78,
    elevation: -0.14,
    radius: 8.72,
    subjectOffset: 2,
    lookLift: 0.17,
    fov: 46.2,
  },
  {
    at: 0.82,
    focus: [0.48, -2.58, -8.55],
    azimuth: 2.18,
    elevation: -0.03,
    radius: 9.82,
    subjectOffset: 1.62,
    lookLift: 0.1,
    fov: 47,
  },
  {
    at: 0.91,
    focus: [-0.2, -3.18, -10.85],
    azimuth: 2.55,
    elevation: 0.055,
    radius: 9.4,
    subjectOffset: 1.92,
    lookLift: 0.12,
    fov: 46,
  },
  {
    at: 1,
    focus: [0.02, -3.95, -13.55],
    azimuth: 2.9,
    elevation: 0.105,
    radius: 8.75,
    subjectOffset: 2.5,
    lookLift: 0.15,
    fov: 45,
  },
];

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smootherstep(value) {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function findChapter(progress) {
  const p = clamp01(progress);
  let index = 0;
  while (index < CHAPTERS.length - 2 && p > CHAPTERS[index + 1].at) index += 1;
  const from = CHAPTERS[index];
  const to = CHAPTERS[index + 1];
  return {
    from,
    to,
    mix: smootherstep((p - from.at) / Math.max(0.0001, to.at - from.at)),
  };
}

function lerpValue(from, to, amount) {
  return THREE.MathUtils.lerp(from, to, amount);
}

function smoothDampVector(
  current,
  target,
  velocity,
  smoothTime,
  maxSpeed,
  delta,
  change,
  temp,
) {
  const duration = Math.max(0.0001, smoothTime);
  const omega = 2 / duration;
  const x = omega * delta;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  change.subVectors(current, target);
  const maxChange = maxSpeed * duration;
  if (change.lengthSq() > maxChange * maxChange) change.setLength(maxChange);
  temp.copy(velocity).addScaledVector(change, omega).multiplyScalar(delta);
  velocity.addScaledVector(temp, -omega).multiplyScalar(decay);
  current.copy(target).addScaledVector(change, decay).addScaledVector(temp, decay);
  return current;
}

function createPose() {
  return {
    focus: new THREE.Vector3(),
    actor: new THREE.Vector3(),
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    right: new THREE.Vector3(),
    subjectOffset: 0,
    fov: 47,
  };
}

export class PelagicCameraRig {
  constructor(camera, { mobile = false, reducedMotion = false } = {}) {
    this.camera = camera;
    this.mobile = mobile;
    this.reducedMotion = reducedMotion;
    this.pose = createPose();
    this.beforePose = createPose();
    this.afterPose = createPose();
    this.smoothedTarget = new THREE.Vector3();
    this.smoothedSubject = new THREE.Vector3();
    this.smoothedFraming = new THREE.Vector2();
    this.positionVelocity = new THREE.Vector3();
    this.targetVelocity = new THREE.Vector3();
    this.positionChange = new THREE.Vector3();
    this.positionTemp = new THREE.Vector3();
    this.targetChange = new THREE.Vector3();
    this.targetTemp = new THREE.Vector3();
    this.viewDirection = new THREE.Vector3();
    this.beforeTangent = new THREE.Vector3();
    this.afterTangent = new THREE.Vector3();
    this.turnAxis = new THREE.Vector3();
    this.orientationMatrix = new THREE.Matrix4();
    this.targetQuaternion = new THREE.Quaternion();
    this.rollQuaternion = new THREE.Quaternion();
    this.initialized = false;
    this.bank = 0;
    this.progress = 0;
    this.subjectStrength = 0;
    this.subjectShot = "open-water";
    this.subjectInitialized = false;
  }

  getJourneyFocus(progress, out = new THREE.Vector3()) {
    const { from, to, mix } = findChapter(progress);
    const travelScale = this.reducedMotion ? 0.28 : this.mobile ? 0.72 : 1;
    return out.set(
      lerpValue(from.focus[0], to.focus[0], mix) * travelScale,
      lerpValue(from.focus[1], to.focus[1], mix) * travelScale,
      lerpValue(from.focus[2], to.focus[2], mix) * travelScale,
    );
  }

  sample(progress, out) {
    const { from, to, mix } = findChapter(progress);
    const orbitScale = this.reducedMotion ? 0.2 : this.mobile ? 0.58 : 1;
    const framingScale = this.mobile ? 0.52 : 1;
    const originAzimuth = CHAPTERS[0].azimuth;
    const azimuth = originAzimuth
      + (lerpValue(from.azimuth, to.azimuth, mix) - originAzimuth) * orbitScale;
    const elevation = lerpValue(from.elevation, to.elevation, mix)
      * (this.reducedMotion ? 0.25 : this.mobile ? 0.72 : 1);
    const radius = lerpValue(from.radius, to.radius, mix) + (this.mobile ? 0.72 : 0);
    const horizontalRadius = Math.cos(elevation) * radius;

    this.getJourneyFocus(progress, out.focus);
    out.position.set(
      out.focus.x + Math.sin(azimuth) * horizontalRadius,
      out.focus.y + Math.sin(elevation) * radius,
      out.focus.z + Math.cos(azimuth) * horizontalRadius,
    );
    out.actor.copy(out.focus);
    out.subjectOffset = lerpValue(from.subjectOffset, to.subjectOffset, mix) * framingScale;
    out.target.copy(out.actor);
    out.target.y += lerpValue(from.lookLift, to.lookLift, mix);

    // Reframe by moving the camera's point of interest, never by throwing the
    // simulated animal across the world. The tentacles can now react to water
    // and propulsion instead of trailing behind an invisible layout tween.
    this.viewDirection.subVectors(out.target, out.position).normalize();
    out.right.crossVectors(this.viewDirection, WORLD_UP).normalize();
    out.target.addScaledVector(out.right, -out.subjectOffset);
    out.fov = lerpValue(from.fov, to.fov, mix) + (this.mobile ? 10 : 0);

    this.viewDirection.subVectors(out.target, out.position).normalize();
    out.right.crossVectors(this.viewDirection, WORLD_UP).normalize();
    return out;
  }

  calculateBank(progress) {
    if (this.reducedMotion || this.mobile || progress < 0.025 || progress > 0.975) return 0;
    const sampleDistance = 0.022;
    this.sample(Math.max(0, progress - sampleDistance), this.beforePose);
    this.sample(Math.min(1, progress + sampleDistance), this.afterPose);
    this.beforeTangent.subVectors(this.pose.position, this.beforePose.position).normalize();
    this.afterTangent.subVectors(this.afterPose.position, this.pose.position).normalize();
    const turn = this.turnAxis
      .crossVectors(this.beforeTangent, this.afterTangent)
      .dot(WORLD_UP);
    return THREE.MathUtils.clamp(-turn * 0.58, -MAX_BANK, MAX_BANK);
  }

  applyOrientation(bankTarget) {
    this.orientationMatrix.lookAt(this.camera.position, this.smoothedTarget, WORLD_UP);
    this.targetQuaternion.setFromRotationMatrix(this.orientationMatrix);
    this.rollQuaternion.setFromAxisAngle(LOCAL_ROLL_AXIS, bankTarget);
    this.targetQuaternion.multiply(this.rollQuaternion).normalize();
    // Position and point-of-interest are already damped. Rebuilding orientation
    // from those settled vectors keeps world-up stable during fast scrolls and
    // prevents quaternion interpolation from taking a cinematic orbit through
    // an unintended barrel roll.
    this.camera.quaternion.copy(this.targetQuaternion);
  }

  update(progress, delta, elapsed, directive = null) {
    this.progress = clamp01(progress);
    this.sample(this.progress, this.pose);

    const requestedStrength = directive?.strength ?? 0;
    this.subjectShot = directive?.shot ?? "open-water";
    const targetDamping = 1 - Math.exp(-delta * (this.reducedMotion ? 6.5 : 1.55));
    this.subjectStrength += (requestedStrength - this.subjectStrength) * targetDamping;
    const mobileNarrativeShot = this.mobile && [
      "deep-guide",
      "final-guide",
      "departure",
    ].includes(this.subjectShot);
    const subjectScale = this.reducedMotion ? 0.2 : mobileNarrativeShot ? 2.5 : this.mobile ? 0.64 : 1;
    if (directive?.target && this.subjectStrength > 0.001) {
      if (!this.subjectInitialized) {
        this.smoothedSubject.copy(directive.target);
        this.subjectInitialized = true;
      } else {
        const subjectDamping = 1 - Math.exp(-delta * (this.reducedMotion ? 7 : 1.6));
        this.smoothedSubject.lerp(directive.target, subjectDamping);
      }
      this.pose.target.lerp(
        this.smoothedSubject,
        Math.min(1, this.subjectStrength * subjectScale),
      );
    }

    // Each editorial chapter owns a quiet side of the frame. Recompose the
    // tracked animal through the camera target so it can swim naturally in
    // world space without crossing the copy.
    const shotFraming = SHOT_FRAMING[this.subjectShot];
    const framingDamping = 1 - Math.exp(-delta * (this.reducedMotion ? 8 : 1.85));
    this.smoothedFraming.x += ((shotFraming?.horizontal ?? 0) - this.smoothedFraming.x)
      * framingDamping;
    this.smoothedFraming.y += ((shotFraming?.vertical ?? 0) - this.smoothedFraming.y)
      * framingDamping;
    if (this.smoothedFraming.lengthSq() > 0.000001) {
      this.viewDirection.subVectors(this.pose.target, this.pose.position).normalize();
      this.pose.right.crossVectors(this.viewDirection, WORLD_UP).normalize();
      const framingWeight = Math.min(1, this.subjectStrength * 1.35);
      this.pose.target.addScaledVector(
        this.pose.right,
        this.smoothedFraming.x * framingWeight * (this.mobile ? 0 : 1),
      );
      this.pose.target.y += this.smoothedFraming.y * framingWeight * (this.mobile ? 1.2 : 1);
    }

    const driftScale = this.reducedMotion ? 0 : this.mobile ? 0.55 : 1;
    this.pose.position.x += Math.sin(elapsed * 0.19 + 0.4) * 0.035 * driftScale;
    this.pose.position.y += Math.sin(elapsed * 0.145) * 0.026 * driftScale;
    this.pose.position.z += Math.cos(elapsed * 0.113 + 1.2) * 0.032 * driftScale;

    if (!this.initialized) {
      this.camera.position.copy(this.pose.position);
      this.smoothedTarget.copy(this.pose.target);
      this.camera.fov = this.pose.fov;
    } else {
      smoothDampVector(
        this.camera.position,
        this.pose.position,
        this.positionVelocity,
        this.reducedMotion ? 0.16 : 0.38,
        this.reducedMotion ? 26 : 16,
        delta,
        this.positionChange,
        this.positionTemp,
      );
      smoothDampVector(
        this.smoothedTarget,
        this.pose.target,
        this.targetVelocity,
        this.reducedMotion ? 0.13 : 0.33,
        this.reducedMotion ? 30 : 18,
        delta,
        this.targetChange,
        this.targetTemp,
      );
      this.camera.fov = THREE.MathUtils.damp(
        this.camera.fov,
        this.pose.fov,
        this.reducedMotion ? 7 : 2.55,
        delta,
      );
    }

    const bankTarget = this.calculateBank(this.progress);
    this.bank = THREE.MathUtils.damp(
      this.bank,
      bankTarget,
      this.reducedMotion ? 10 : 2.25,
      delta,
    );
    this.applyOrientation(this.bank);
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();

    this.initialized = true;
  }

  getState() {
    return {
      progress: Number(this.progress.toFixed(4)),
      position: this.camera.position.toArray().map((value) => Number(value.toFixed(5))),
      target: this.smoothedTarget.toArray().map((value) => Number(value.toFixed(5))),
      actor: this.pose.actor.toArray().map((value) => Number(value.toFixed(3))),
      shot: this.subjectShot,
      subjectStrength: Number(this.subjectStrength.toFixed(3)),
      bankDegrees: Number(THREE.MathUtils.radToDeg(this.bank).toFixed(3)),
      fov: Number(this.camera.fov.toFixed(2)),
      orbit: this.reducedMotion ? "reduced" : this.mobile ? "mobile" : "full",
    };
  }
}
