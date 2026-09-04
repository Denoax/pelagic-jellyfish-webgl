function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function pulseWindow(phase, start, end) {
  if (phase <= start || phase >= end) return 0;
  const t = (phase - start) / (end - start);
  return Math.sin(t * Math.PI) ** 2;
}

export function wrapSwimPhase(cycle) {
  return ((cycle % 1) + 1) % 1;
}

// Aurelia-style rowing cycle. Muscle effort is concentrated into the first
// fifth; elastic refill and a weaker stopping-vortex impulse occupy the rest.
export function sampleSwimCycle(cycle, target = {}) {
  const phase = wrapSwimPhase(cycle);
  const contractionEnd = 0.2;
  const refillEnd = 0.68;

  let bell;
  let contraction = 0;
  let refill = 0;
  if (phase < contractionEnd) {
    contraction = smoothstep01(phase / contractionEnd);
    bell = contraction;
  } else if (phase < refillEnd) {
    refill = smoothstep01((phase - contractionEnd) / (refillEnd - contractionEnd));
    // The elastic bell initially holds its compressed shape, then rolls open.
    bell = 1 - Math.pow(refill, 1.42);
  } else {
    refill = 1;
    bell = 0;
  }

  const primaryThrust = pulseWindow(phase, 0.025, 0.215);
  const refillSpeed = pulseWindow(phase, 0.22, 0.66);
  const secondaryThrust = pulseWindow(phase, 0.57, 0.82);
  const coast = phase >= 0.68 ? smoothstep01((phase - 0.68) / 0.12) : 0;
  const marginRoll = primaryThrust * 0.78 - refillSpeed * 0.52;

  target.phase = phase;
  target.cycle = cycle;
  target.bell = bell;
  target.contraction = contraction;
  target.refill = refill;
  target.primaryThrust = primaryThrust;
  target.secondaryThrust = secondaryThrust;
  target.coast = coast;
  target.marginRoll = marginRoll;
  target.speedSignal = primaryThrust + secondaryThrust * 0.38;
  return target;
}
