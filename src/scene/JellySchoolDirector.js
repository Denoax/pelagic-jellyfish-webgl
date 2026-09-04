import * as THREE from "three/webgpu";
import { sampleSwimCycle } from "./jellyMotion.js";

const UP = new THREE.Vector3(0, 1, 0);

const ACTORS = [
  {
    life: [-0.14, 0.34],
    entry: [5.8, -2.8, -4.8],
    center: [0.55, 0.22, -0.25],
    exit: [-6.2, 3.4, -4.4],
    scale: 0.9,
    drift: 0.42,
    cluster: 0,
  },
  {
    life: [-0.03, 0.44],
    entry: [-7.2, 2.9, -7.4],
    center: [-3.15, 1.3, -2.7],
    exit: [5.5, 3.8, -7.2],
    scale: 0.31,
    drift: 0.64,
    cluster: 0,
  },
  {
    life: [0.12, 0.63],
    entry: [-6.8, -2.6, -6.2],
    center: [-0.35, -0.12, -0.45],
    exit: [6.9, 2.4, -5.8],
    scale: 0.82,
    drift: 0.5,
    cluster: 1,
  },
  {
    life: [0.18, 0.7],
    entry: [7.4, 3.8, -8.8],
    center: [3.05, 1.15, -2.9],
    exit: [-5.8, -3.4, -7.5],
    scale: 0.35,
    drift: 0.72,
    cluster: 1,
  },
  {
    life: [0.42, 0.88],
    entry: [7.2, -3.3, -7.2],
    center: [0.32, -0.28, -0.62],
    exit: [-6.7, 3.7, -6.6],
    scale: 0.76,
    drift: 0.46,
    cluster: 2,
  },
  {
    life: [0.48, 1.02],
    entry: [-7.8, 2.2, -8.6],
    center: [-0.28, 0.16, -0.7],
    exit: [7.5, 3.9, -7.8],
    scale: 0.58,
    drift: 0.54,
    cluster: 3,
  },
  {
    life: [0.52, 1.12],
    entry: [7.9, 4.2, -10.2],
    center: [3.3, 1.5, -3.6],
    exit: [-7.8, -1.8, -8.5],
    scale: 0.33,
    drift: 0.69,
    cluster: 3,
  },
  {
    life: [0.6, 1.16],
    entry: [-8.4, -3.7, -9.4],
    center: [-3.4, -1.5, -3.4],
    exit: [-1.5, 2.5, -3.5],
    scale: 0.27,
    drift: 0.76,
    cluster: 3,
  },
];

const SHOTS = [
  { id: "arrival", subject: [0], window: [-0.06, 0.02, 0.15, 0.25], strength: 0.96 },
  { id: "second-encounter", subject: [2], window: [0.2, 0.29, 0.42, 0.52], strength: 0.94 },
  { id: "aggregation", subject: [2, 3, 4], window: [0.43, 0.5, 0.59, 0.67], strength: 0.66 },
  { id: "deep-guide", subject: [4], window: [0.59, 0.67, 0.76, 0.84], strength: 0.92 },
  { id: "final-guide", subject: [5], window: [0.78, 0.84, 0.91, 0.97], strength: 0.84 },
  { id: "departure", subject: [5, 6, 7], window: [0.91, 0.96, 1.04, 1.1], strength: 0.38 },
];

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smootherstep(value) {
  const t = clamp01(value);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function bellWeight(progress, [start, inEnd, outStart, end]) {
  const enter = smootherstep((progress - start) / Math.max(0.0001, inEnd - start));
  const leave = 1 - smootherstep((progress - outStart) / Math.max(0.0001, end - outStart));
  return clamp01(Math.min(enter, leave));
}

function quadraticBezier(a, b, c, t, out) {
  const inverse = 1 - t;
  out.copy(a).multiplyScalar(inverse * inverse);
  out.addScaledVector(b, 2 * inverse * t);
  out.addScaledVector(c, t * t);
  return out;
}

function seeded(index, salt = 0) {
  const value = Math.sin(index * 91.73 + salt * 37.11) * 43758.5453;
  return value - Math.floor(value);
}

function vector(values) {
  return new THREE.Vector3(values[0], values[1], values[2]);
}

export class JellySchoolDirector {
  constructor(medusae, { reducedMotion = false, mobile = false } = {}) {
    this.medusae = medusae;
    this.reducedMotion = reducedMotion;
    this.mobile = mobile;
    this.focus = new THREE.Vector3();
    this.centroid = new THREE.Vector3();
    this.directiveTarget = new THREE.Vector3();
    this.separation = new THREE.Vector3();
    this.heading = new THREE.Vector3();
    this.routeHeading = new THREE.Vector3();
    this.flowForce = new THREE.Vector3();
    this.targetQuaternion = new THREE.Quaternion();
    this.yawQuaternion = new THREE.Quaternion();
    this.lastShot = "open-water";

    this.actors = medusae.map((medusa, index) => {
      const definition = ACTORS[index % ACTORS.length];
      const actor = {
        id: index,
        medusa,
        definition,
        entry: vector(definition.entry),
        center: vector(definition.center),
        exit: vector(definition.exit),
        position: new THREE.Vector3(),
        previous: new THREE.Vector3(),
        desired: new THREE.Vector3(),
        correction: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        swimDirection: new THREE.Vector3(0, 1, 0),
        kinematics: {},
        pulseRate: (index === 0 ? 0.205 : 0.17) + seeded(index, 207) * 0.035,
        pulseOffset: seeded(index, 211),
        quaternion: new THREE.Quaternion(),
        scale: 0,
        presence: 0,
        feature: 0,
        initialized: false,
      };

      medusa.noiseSeed = 17.4 + index * 19.17;
      medusa.time = index * 2.73;
      medusa.swimKinematics = actor.kinematics;
      medusa.needsPositionUpdate = true;
      medusa.updatePosition = () => {
        medusa.transformationObject.position.copy(actor.position);
        medusa.transformationObject.quaternion.copy(actor.quaternion);
        medusa.transformationObject.scale.setScalar(actor.scale);
        medusa.transformationObject.updateMatrix();
      };
      return actor;
    });
  }

  update(progress, delta, elapsed, current, journeyFocus) {
    this.focus.copy(journeyFocus);
    const motionScale = this.reducedMotion ? 0.25 : 1;

    this.actors.forEach((actor, index) => {
      const { definition } = actor;
      const [start, authoredEnd] = definition.life;
      const end = this.mobile && index === 5 ? 1.08 : authoredEnd;
      const local = clamp01((progress - start) / Math.max(0.0001, end - start));
      const arrival = smootherstep(local / 0.3);
      // Stay full-sized while swimming beyond the composition. Once the exit
      // route is complete, retain a faint full-scale silhouette in the water
      // instead of shrinking or popping the animal out of existence.
      const depthHaze = 1 - smootherstep((local - 0.84) / 0.16) * 0.9;
      actor.presence = progress < start ? 0 : Math.min(arrival, depthHaze);

      quadraticBezier(actor.entry, actor.center, actor.exit, smootherstep(local), actor.desired);
      actor.desired.add(this.focus);

      const phase = index * 1.73 + definition.cluster * 0.91;
      const flowX = Math.sin(elapsed * 0.105 + phase + actor.desired.z * 0.07);
      const flowZ = Math.cos(elapsed * 0.083 + phase * 0.7 + actor.desired.x * 0.06);
      const eddy = Math.sin(elapsed * (0.13 + definition.drift * 0.025) + phase * 1.9);
      actor.desired.x += (flowX * 0.58 + eddy * 0.2 + current.x * 0.38) * motionScale;
      actor.desired.y += (
        Math.sin(elapsed * (0.12 + index * 0.004) + phase) * 0.38
        + Math.pow(Math.max(0, Math.sin(elapsed * (0.82 + index * 0.025) + phase + 4.4)), 5) * 0.11
      ) * motionScale;
      actor.desired.z += (flowZ * 0.52 + Math.cos(elapsed * 0.057 + phase) * 0.24 + current.y * 0.3) * motionScale;
      actor.correction.set(0, 0, 0);
    });

    for (let first = 0; first < this.actors.length; first += 1) {
      const actor = this.actors[first];
      if (actor.presence < 0.04) continue;
      for (let second = first + 1; second < this.actors.length; second += 1) {
        const other = this.actors[second];
        if (other.presence < 0.04) continue;
        this.separation.subVectors(actor.desired, other.desired);
        const distance = Math.max(0.001, this.separation.length());
        const safeDistance = 1.05 + (actor.definition.scale + other.definition.scale) * 0.55;
        if (distance >= safeDistance) continue;
        const force = (1 - distance / safeDistance) * 0.44;
        this.separation.multiplyScalar(force / distance);
        actor.correction.add(this.separation);
        other.correction.sub(this.separation);
      }
    }

    this.actors.forEach((actor, index) => {
      const { definition } = actor;
      actor.desired.add(actor.correction);
      actor.previous.copy(actor.position);
      sampleSwimCycle(elapsed * actor.pulseRate + actor.pulseOffset, actor.kinematics);

      if (!actor.initialized) {
        actor.position.copy(actor.desired);
        this.routeHeading.subVectors(actor.center, actor.entry);
        if (this.routeHeading.lengthSq() < 0.0001) this.routeHeading.copy(UP);
        actor.swimDirection.copy(this.routeHeading.normalize());
        actor.velocity.copy(actor.swimDirection).multiplyScalar(0.08);
      } else {
        this.routeHeading.subVectors(actor.desired, actor.position);
        const routeDistance = this.routeHeading.length();
        if (routeDistance > 0.0001) this.routeHeading.multiplyScalar(1 / routeDistance);
        else this.routeHeading.copy(actor.swimDirection);

        // The route is only a steering field. Translation comes from two
        // biologically timed impulses and momentum carried between them.
        const turnDamping = 1 - Math.exp(-delta * (0.72 + actor.kinematics.contraction * 1.4));
        actor.swimDirection.lerp(this.routeHeading, turnDamping).normalize();
        const scaleFactor = 0.72 + definition.scale * 0.28;
        const thrust = (
          actor.kinematics.primaryThrust * 2.35
          + actor.kinematics.secondaryThrust * 0.58
        ) * scaleFactor * motionScale;
        actor.velocity.addScaledVector(actor.swimDirection, thrust * delta);

        // A weak positional tether preserves the authored story without
        // erasing the pulse/coast speed profile.
        this.flowForce.subVectors(actor.desired, actor.position);
        const tether = Math.min(0.42, 0.075 + routeDistance * 0.045);
        actor.velocity.addScaledVector(this.flowForce, tether * delta);
        actor.velocity.x += current.x * 0.095 * delta * motionScale;
        actor.velocity.z += current.y * 0.095 * delta * motionScale;

        // Refilling presents more frontal area; the coast retains momentum.
        const drag = 0.24 + actor.kinematics.refill * 0.22
          - actor.kinematics.coast * 0.08;
        actor.velocity.multiplyScalar(Math.exp(-delta * drag));
        const maxSpeed = 0.92 + definition.drift * 0.42;
        if (actor.velocity.lengthSq() > maxSpeed * maxSpeed) actor.velocity.setLength(maxSpeed);
        actor.position.addScaledVector(actor.velocity, delta);

        // Emergency composition guard for very fast scroll jumps. It is soft
        // and only engages outside the normal swimming envelope.
        if (routeDistance > 4.2) {
          actor.position.addScaledVector(this.flowForce, (1 - Math.exp(-delta * 0.52)) * 0.32);
        }
      }

      this.heading.copy(actor.velocity);
      if (this.heading.lengthSq() < 0.00001) this.heading.copy(actor.swimDirection);
      this.heading.normalize();
      this.targetQuaternion.setFromUnitVectors(UP, this.heading);
      const yaw = Math.sin(elapsed * 0.09 + index * 1.7) * 0.055 * motionScale;
      this.yawQuaternion.setFromAxisAngle(UP, yaw);
      this.targetQuaternion.multiply(this.yawQuaternion);
      const orientationDamping = 1 - Math.exp(-delta * (1.05 + actor.kinematics.primaryThrust * 1.9));
      actor.quaternion.slerp(this.targetQuaternion, orientationDamping);

      const mobileScale = this.mobile && actor.definition.scale > 0.6 ? 0.88 : 1;
      actor.scale = actor.definition.scale * mobileScale;
      actor.medusa.needsPositionUpdate = actor.medusa.needsPositionUpdate || !actor.initialized;
      actor.medusa.transformationObject.visible = actor.presence > 0.008;
      actor.medusa.updatePosition();
      actor.initialized = true;
    });

    return this.getCameraDirective(progress);
  }

  getCameraDirective(progress) {
    let totalWeight = 0;
    let strongestWeight = 0;
    let strongestShot = "open-water";
    this.directiveTarget.set(0, 0, 0);
    this.actors.forEach((actor) => { actor.feature = 0; });

    SHOTS.forEach((shot) => {
      const weight = bellWeight(progress, shot.window) * shot.strength;
      if (weight <= 0.0001) return;
      this.centroid.set(0, 0, 0);
      let contributors = 0;
      shot.subject.forEach((id) => {
        const actor = this.actors[id];
        if (!actor || actor.presence < 0.03) return;
        this.centroid.add(actor.position);
        actor.feature = Math.max(actor.feature, weight);
        contributors += 1;
      });
      if (!contributors) return;
      this.centroid.multiplyScalar(1 / contributors);
      this.directiveTarget.addScaledVector(this.centroid, weight);
      totalWeight += weight;
      if (weight > strongestWeight) {
        strongestWeight = weight;
        strongestShot = shot.id;
      }
    });

    if (totalWeight > 0.0001) this.directiveTarget.multiplyScalar(1 / totalWeight);
    else this.directiveTarget.copy(this.focus);
    this.lastShot = strongestShot;

    return {
      target: this.directiveTarget,
      strength: clamp01(totalWeight),
      shot: strongestShot,
      featured: this.actors
        .filter((actor) => actor.feature > 0.18)
        .map((actor) => actor.id),
    };
  }

  getActorState() {
    return this.actors.map((actor) => ({
      id: actor.id,
      presence: Number(actor.presence.toFixed(3)),
      feature: Number(actor.feature.toFixed(3)),
      scale: Number(actor.scale.toFixed(3)),
      position: actor.position.toArray().map((value) => Number(value.toFixed(2))),
      velocity: Number(actor.velocity.length().toFixed(3)),
      phase: Number(actor.kinematics.phase.toFixed(3)),
      primaryThrust: Number(actor.kinematics.primaryThrust.toFixed(3)),
      secondaryThrust: Number(actor.kinematics.secondaryThrust.toFixed(3)),
    }));
  }
}
