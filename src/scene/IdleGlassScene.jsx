import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uClockMix;
  uniform float uPointerEnergy;
  uniform float uGelStrength;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec2 uPointerVelocity;
  uniform sampler2D uClockFrom;
  uniform sampler2D uClockTo;
  varying vec2 vUv;

  float hash21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise21(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise21(p);
      p = rotation * p * 2.03 + 11.7;
      amplitude *= 0.5;
    }
    return value;
  }

  float textureMask(sampler2D source, vec2 uv) {
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    return texture2D(source, uv).r;
  }

  float clockMask(vec2 uv) {
    float transitionNoise = fbm(uv * vec2(4.0, 6.0) + vec2(uTime * 0.07, -uTime * 0.04));
    float transitionWave = sin(uv.y * 18.0 + uv.x * 7.0 - uTime * 2.2) * 0.035;
    float transitionBoundary = clamp(
      0.08 + uv.y * 0.58 + transitionNoise * 0.30 + transitionWave,
      0.04,
      0.96
    );
    float localMix = smoothstep(transitionBoundary - 0.035, transitionBoundary + 0.035, uClockMix);
    vec2 liquidShift = vec2(
      sin(uv.y * 16.0 + uTime * 1.4),
      cos(uv.x * 11.0 - uTime * 1.1)
    ) * 0.007;
    float departing = textureMask(uClockFrom, uv + liquidShift * localMix);
    float arriving = textureMask(uClockTo, uv - liquidShift * (1.0 - localMix));
    return mix(departing, arriving, localMix);
  }

  float circleRing(vec2 p, vec2 center, float radius, float width) {
    return 1.0 - smoothstep(width, width * 2.4, abs(length(p - center) - radius));
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = uv * 2.0 - 1.0;
    p.x *= aspect;

    vec2 slowFlow = vec2(
      fbm(uv * vec2(2.2, 3.4) + vec2(uTime * 0.030, -uTime * 0.022)),
      fbm(uv.yx * vec2(2.8, 2.0) + vec2(-uTime * 0.026, uTime * 0.019))
    ) - 0.5;

    vec2 pointerDelta = uv - uPointer;
    pointerDelta.x *= aspect;
    float pointerDistance = length(pointerDelta);
    float pointerWake = exp(-pointerDistance * 6.5) * uPointerEnergy;
    vec2 pointerNormal = normalize(pointerDelta + vec2(0.0001));
    vec2 pointerVelocity = vec2(uPointerVelocity.x * aspect, uPointerVelocity.y);
    float pointerSpeed = clamp(length(pointerVelocity), 0.0, 1.4);
    vec2 travelDirection = normalize(pointerVelocity + vec2(0.0001));
    float alongTravel = dot(pointerDelta, travelDirection);
    float acrossTravel = dot(pointerDelta, vec2(-travelDirection.y, travelDirection.x));
    float gelDistance = sqrt(
      acrossTravel * acrossTravel * 1.55
      + alongTravel * alongTravel * mix(1.0, 0.28, clamp(pointerSpeed, 0.0, 1.0))
    );
    float gelCore = exp(-pow(gelDistance / 0.235, 2.0) * 2.1) * uGelStrength;
    float gelShell = exp(-pow((gelDistance - 0.19) / 0.045, 2.0)) * uGelStrength;
    vec2 radialUv = vec2(pointerNormal.x / max(aspect, 1.0), pointerNormal.y);
    vec2 dragUv = -uPointerVelocity * gelCore * (0.075 + pointerSpeed * 0.085);
    float lensBulge = sin(clamp(gelDistance / 0.27, 0.0, 1.0) * 3.14159265)
      * gelCore * (0.026 + pointerSpeed * 0.018);
    float elasticWobble = sin(gelDistance * 34.0 - uTime * 3.4)
      * gelCore * (0.010 + pointerSpeed * 0.009);
    vec2 glassUv = uv + slowFlow * 0.020;
    glassUv += vec2(
      fbm(uv * 8.0 + vec2(uTime * 0.055, 17.0)),
      fbm(uv.yx * 7.0 + vec2(31.0, -uTime * 0.048))
    ) * 0.010 - 0.005;
    // Direct manipulation field: pull the sampled clock and fluid cells with
    // the cursor, then curl their boundary into an elastic rebound wave.
    glassUv += dragUv;
    glassUv += radialUv * (lensBulge + elasticWobble - gelShell * 0.011);
    glassUv += pointerNormal * sin(pointerDistance * 28.0 - uTime * 0.12)
      * pointerWake * 0.0065;

    float texel = 1.0 / min(uResolution.x, 1500.0);
    vec2 dx = vec2(texel * 1.8, 0.0);
    vec2 dy = vec2(0.0, texel * aspect * 1.8);
    float mask = clockMask(glassUv);
    float maskL = clockMask(glassUv - dx);
    float maskR = clockMask(glassUv + dx);
    float maskD = clockMask(glassUv - dy);
    float maskU = clockMask(glassUv + dy);
    vec2 gradient = vec2(maskR - maskL, maskU - maskD);
    float edge = smoothstep(0.025, 0.24, length(gradient));

    float spread = max(
      max(clockMask(glassUv + dx * 11.0), clockMask(glassUv - dx * 11.0)),
      max(clockMask(glassUv + dy * 11.0), clockMask(glassUv - dy * 11.0))
    );
    spread = max(spread, max(
      max(clockMask(glassUv + vec2(dx.x * 8.0, dy.y * 7.0)), clockMask(glassUv - vec2(dx.x * 8.0, dy.y * 7.0))),
      max(clockMask(glassUv + vec2(-dx.x * 8.0, dy.y * 7.0)), clockMask(glassUv + vec2(dx.x * 8.0, -dy.y * 7.0)))
    ));
    float nearClock = max(mask, spread * 0.86);

    vec2 cellScale = aspect > 1.0 ? vec2(58.0, 29.0) : vec2(23.0, 57.0);
    vec2 cellWarp = vec2(
      fbm(glassUv * 10.0 + vec2(uTime * 0.035, 73.0)),
      fbm(glassUv.yx * 9.0 + vec2(-uTime * 0.030, 41.0))
    ) - 0.5;
    vec2 cellPosition = glassUv * cellScale + cellWarp * 1.8;
    vec2 cellId = floor(cellPosition);
    vec2 cellUv = fract(cellPosition) - 0.5;
    vec2 jitter = vec2(hash21(cellId + 3.1), hash21(cellId + 9.7)) - 0.5;
    jitter *= 0.46;
    float cellRadius = 0.13 + hash21(cellId + 19.4) * 0.20;
    float stretch = 0.62 + hash21(cellId + 26.8) * 0.55;
    float cellDistance = length((cellUv - jitter) * vec2(1.0, stretch));
    float cellBody = 1.0 - smoothstep(cellRadius, cellRadius + 0.055, cellDistance);
    float cellRim = smoothstep(cellRadius * 0.48, cellRadius * 0.88, cellDistance)
      * (1.0 - smoothstep(cellRadius, cellRadius + 0.05, cellDistance));
    float density = smoothstep(0.23, 0.70, fbm(glassUv * 5.0 + uTime * 0.025));
    float keepCell = step(0.28, hash21(cellId + 43.2));
    float fieldStrength = max(smoothstep(0.01, 0.54, nearClock), 0.22 + density * 0.46);
    float droplets = cellBody * keepCell * fieldStrength
      * (1.0 - smoothstep(0.22, 0.80, mask));
    float dropletEdge = cellRim * keepCell * fieldStrength
      * (1.0 - smoothstep(0.22, 0.80, mask));

    float cells = fbm(glassUv * vec2(28.0, 17.0) + slowFlow * 6.0 + uTime * 0.04);

    vec3 deepGlass = vec3(0.003, 0.018, 0.036);
    vec3 cyan = vec3(0.20, 0.82, 1.00);
    vec3 ice = vec3(0.76, 0.94, 1.00);
    vec3 cobalt = vec3(0.10, 0.31, 0.90);

    float highlightSide = clamp(dot(normalize(gradient + vec2(0.0001)), normalize(vec2(-0.8, 0.6))) * 0.5 + 0.5, 0.0, 1.0);
    float body = smoothstep(0.08, 0.68, mask);
    float glassAlpha = body * 0.92 + edge * 0.92 + droplets * 0.56 + dropletEdge * 0.48
      + gelShell * 0.34;
    vec3 glassColor = deepGlass;
    glassColor += edge * mix(cobalt, ice, highlightSide) * 1.72;
    glassColor += droplets * vec3(0.012, 0.065, 0.11) + dropletEdge * mix(cyan, ice, highlightSide) * 0.92;
    glassColor += body * vec3(0.012, 0.045, 0.075) * (0.30 + cells * 0.55);
    glassColor += gelShell * mix(cyan, ice, 0.62) * (0.46 + pointerSpeed * 0.42);

    float arcOne = circleRing(p, vec2(-aspect * 0.66, 0.72), 0.92, 0.010);
    float arcTwo = circleRing(p, vec2(aspect * 0.67, -0.66), 0.74, 0.007);
    float arcThree = circleRing(p, vec2(aspect * 0.52, 0.80), 0.46, 0.0045);
    float lightFields = arcOne * 0.66 + arcTwo * 0.58 + arcThree * 0.28;
    vec3 fieldColor = ice * arcOne * 1.20 + cyan * arcTwo + cobalt * arcThree;

    float wakeRing = (1.0 - smoothstep(0.022, 0.065, abs(pointerDistance - 0.15 - sin(uTime * 0.08) * 0.010)))
      * uPointerEnergy * 0.16;
    vec3 finalColor = glassColor + fieldColor * lightFields + cyan * wakeRing;
    float finalAlpha = clamp(glassAlpha + lightFields * 0.48 + wakeRing * 0.34, 0.0, 0.98);

    float film = hash21(gl_FragCoord.xy + floor(uTime * 12.0));
    finalColor += (film - 0.5) * 0.012 * finalAlpha;
    gl_FragColor = vec4(finalColor, finalAlpha);
  }
`;

function createClockTexture(portrait) {
  const canvas = document.createElement("canvas");
  canvas.width = portrait ? 768 : 2048;
  canvas.height = portrait ? 1400 : 768;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function drawClock(texture, now, portrait) {
  const canvas = texture.image;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  if (portrait) {
    context.font = '600 430px "Instrument Sans", sans-serif';
    context.fillText(hours, canvas.width / 2, 420);
    context.fillText(minutes, canvas.width / 2, 980);
  } else {
    context.font = '600 520px "Instrument Sans", sans-serif';
    context.fillText(`${hours}:${minutes}`, canvas.width / 2, canvas.height / 2 + 5);
  }

  texture.needsUpdate = true;
}

function LiquidClock({ now }) {
  const materialRef = useRef(null);
  const smoothPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const previousPointer = useRef(new THREE.Vector2(0.5, 0.5));
  const pointerUv = useRef(new THREE.Vector2(0.5, 0.5));
  const rawVelocity = useRef(new THREE.Vector2());
  const pointerVelocity = useRef(new THREE.Vector2());
  const gelStrength = useRef(0);
  const pointerSeen = useRef(false);
  const lastPointerEventAt = useRef(-10);
  const energy = useRef(0);
  const lastWakeAt = useRef(-10);
  const displayedTexture = useRef(null);
  const hiddenTexture = useRef(null);
  const lastClockKey = useRef("");
  const transitionStartedAt = useRef(-1);
  const { size } = useThree();
  const portrait = size.height > size.width * 1.15;
  const clockTextures = useMemo(
    () => [createClockTexture(portrait), createClockTexture(portrait)],
    [portrait],
  );

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uClockMix: { value: 1 },
    uPointerEnergy: { value: 0 },
    uGelStrength: { value: 0 },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uPointerVelocity: { value: new THREE.Vector2() },
    uClockFrom: { value: clockTextures[0] },
    uClockTo: { value: clockTextures[1] },
  }), [clockTextures, size.height, size.width]);

  useEffect(() => {
    drawClock(clockTextures[0], now, portrait);
    drawClock(clockTextures[1], now, portrait);
    displayedTexture.current = clockTextures[0];
    hiddenTexture.current = clockTextures[1];
    lastClockKey.current = `${now.getHours()}:${now.getMinutes()}`;
    transitionStartedAt.current = -1;
    uniforms.uClockFrom.value = clockTextures[0];
    uniforms.uClockTo.value = clockTextures[1];
    uniforms.uClockMix.value = 1;
  }, [clockTextures, portrait, uniforms]);

  useEffect(() => {
    const nextKey = `${now.getHours()}:${now.getMinutes()}`;
    if (!displayedTexture.current || nextKey === lastClockKey.current) return;

    drawClock(hiddenTexture.current, now, portrait);
    uniforms.uClockFrom.value = displayedTexture.current;
    uniforms.uClockTo.value = hiddenTexture.current;
    const previousTexture = displayedTexture.current;
    displayedTexture.current = hiddenTexture.current;
    hiddenTexture.current = previousTexture;
    lastClockKey.current = nextKey;
    transitionStartedAt.current = performance.now() * 0.001;
    uniforms.uClockMix.value = 0;
  }, [now, portrait, uniforms]);

  useEffect(() => () => {
    clockTextures.forEach((texture) => texture.dispose());
  }, [clockTextures]);

  useEffect(() => {
    uniforms.uResolution.value.set(size.width, size.height);
  }, [size.height, size.width, uniforms]);

  useEffect(() => {
    const updatePointer = (event) => {
      pointerUv.current.set(
        event.clientX / Math.max(1, window.innerWidth),
        1 - event.clientY / Math.max(1, window.innerHeight),
      );
      pointerSeen.current = true;
      lastPointerEventAt.current = performance.now() * 0.001;
    };
    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, []);

  useFrame((state, delta) => {
    if (!materialRef.current) return;
    if (transitionStartedAt.current >= 0) {
      const elapsed = performance.now() * 0.001 - transitionStartedAt.current;
      const progress = THREE.MathUtils.clamp(elapsed / 1.28, 0, 1);
      const eased = progress * progress * (3 - 2 * progress);
      materialRef.current.uniforms.uClockMix.value = eased;
      if (progress >= 1) transitionStartedAt.current = -1;
    }
    rawVelocity.current.copy(pointerUv.current).sub(previousPointer.current)
      .divideScalar(Math.max(delta, 0.001));
    const speed = rawVelocity.current.length();
    if (speed > 1.4) rawVelocity.current.multiplyScalar(1.4 / speed);
    previousPointer.current.copy(pointerUv.current);
    const rippleReady = state.clock.elapsedTime - lastWakeAt.current > 14;
    if (speed > 1.4 && rippleReady) {
      energy.current = Math.min(0.72, 0.34 + speed * 0.035);
      lastWakeAt.current = state.clock.elapsedTime;
    } else {
      energy.current *= Math.exp(-delta * 0.45);
    }
    const pointerFresh = pointerSeen.current
      && performance.now() * 0.001 - lastPointerEventAt.current < 0.2;
    const targetGel = pointerFresh
      ? THREE.MathUtils.clamp(0.34 + speed * 0.5, 0.34, 1)
      : 0;
    gelStrength.current += (targetGel - gelStrength.current)
      * (1 - Math.exp(-delta * (pointerFresh ? 14 : 3.2)));
    pointerVelocity.current.lerp(
      rawVelocity.current,
      1 - Math.exp(-delta * (pointerFresh ? 18 : 4.4)),
    );
    smoothPointer.current.lerp(pointerUv.current, 1 - Math.exp(-delta * 11));
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uPointer.value.copy(smoothPointer.current);
    materialRef.current.uniforms.uPointerVelocity.value.copy(pointerVelocity.current);
    materialRef.current.uniforms.uPointerEnergy.value = energy.current;
    materialRef.current.uniforms.uGelStrength.value = gelStrength.current;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

export function IdleGlassScene({ now }) {
  return (
    <Canvas
      className="idle-canvas"
      orthographic
      camera={{ position: [0, 0, 1], near: 0.1, far: 2 }}
      dpr={[1, 1.45]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
    >
      <LiquidClock now={now} />
    </Canvas>
  );
}
