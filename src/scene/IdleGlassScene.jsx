import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main(){vUv=uv;gl_Position=vec4(position.xy,0.0,1.0);}
`;

// Original spring/advection field: RG velocity, BA displacement. Persistent
// ping-pong state replaces frame-local UV wobble. Fixed, bounded simulation.
const simulationShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uState;
uniform vec2 uTexel,uPointer,uPrevious,uVelocity;
uniform float uDt,uAspect,uInput,uBias;
uniform bool uPacked;
vec2 packedState(vec2 p){vec4 s=texture2D(uState,p)*255.0;return (vec2(s.r*256.0+s.g,s.b*256.0+s.a)-32768.0)/65535.0*0.36;}
vec4 packState(vec2 d){vec2 n=floor(clamp(d/0.36*65535.0+32768.0,0.0,65535.0)+0.5);return vec4(floor(n.x/256.0),mod(n.x,256.0),floor(n.y/256.0),mod(n.y,256.0))/255.0;}
vec4 state(vec2 p){return (texture2D(uState,p)-uBias)*vec4(1.2,1.2,0.36,0.36);}
void main(){
  vec2 scale=vec2(uAspect,1.0),a=(vUv-uPrevious)*scale,b=(uPointer-uPrevious)*scale;
  float t=clamp(dot(a,b)/max(dot(b,b),0.000001),0.0,1.0);
  float brush=exp(-dot(a-b*t,a-b*t)/0.009);
  if(uPacked){
    vec2 d=packedState(vUv);
    d=packedState(clamp(vUv-d*uDt*0.4,uTexel,1.0-uTexel))*exp(-uDt*1.6);
    d+=uVelocity*brush*uInput*uDt*0.7;
    if(length(d)<0.0002)d=vec2(0.0);
    gl_FragColor=packState(clamp(d,-0.17,0.17));return;
  }
  vec4 old=state(vUv);
  vec2 uv=clamp(vUv-old.xy*uDt*0.42,uTexel,1.0-uTexel);
  vec4 s=state(uv);
  vec4 adjacent=(state(uv+vec2(uTexel.x,0.0))+state(uv-vec2(uTexel.x,0.0))
    +state(uv+vec2(0.0,uTexel.y))+state(uv-vec2(0.0,uTexel.y)))*0.25;
  vec2 velocity=mix(s.xy,adjacent.xy,0.12);
  velocity+=((adjacent.zw-s.zw)*36.0-s.zw*5.5)*uDt;
  velocity*=exp(-uDt*2.8);
  velocity+=uVelocity*brush*uInput*uDt*7.0;
  vec2 displacement=s.zw+velocity*uDt;
  float edge=smoothstep(0.0,0.035,vUv.x)*smoothstep(0.0,0.035,vUv.y)
    *smoothstep(0.0,0.035,1.0-vUv.x)*smoothstep(0.0,0.035,1.0-vUv.y);
  gl_FragColor=vec4(clamp(velocity,-0.58,0.58),clamp(displacement,-0.17,0.17))
    *edge/vec4(1.2,1.2,0.36,0.36)+uBias;
}
`;

const glassShader = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uState,uClockFrom,uClockTo;
uniform vec2 uResolution;
uniform float uTime,uClockMix,uBias;
uniform bool uPacked;
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
float clockField(vec2 p){
  float a=texture2D(uClockTo,p).r;
  if(uClockMix>0.999)return a;
  float b=texture2D(uClockFrom,p).r;
  return mix(b,a,smoothstep(p.y*0.32,0.68+p.y*0.32,uClockMix));
}
float thickness(vec2 uv){
  float aspect=uResolution.x/uResolution.y;
  vec4 field=texture2D(uState,clamp(uv,0.001,0.999));
  vec2 displacement=(field.ba-uBias)*0.36;
  if(uPacked)displacement=(vec2(field.r*65280.0+field.g*255.0,field.b*65280.0+field.a*255.0)-32768.0)/65535.0*0.36;
  vec2 p=uv-displacement;
  p+=vec2(sin(p.y*11.0+uTime*0.065),cos(p.x*9.0-uTime*0.052))*0.0025;
  float clock=clockField(clamp(p,0.0,1.0));
  vec2 cells=p*vec2(aspect,1.0)*21.0,id=floor(cells),f=fract(cells);
  float liquid=0.0;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
    vec2 offset=vec2(float(x),float(y)),seed=hash2(id+offset);
    vec2 center=offset+0.5+(seed-0.5)*0.64
      +vec2(sin(uTime*0.075+seed.x*6.28),cos(uTime*0.060+seed.y*6.28))*0.23;
    vec2 q=(f-center)*vec2(1.0,0.85+seed.x*0.3);
    float radius=0.16+seed.y*0.20;
    liquid+=exp(-dot(q,q)/(radius*radius)*2.6)*step(0.22,seed.x);
  }
  float droplet=smoothstep(0.16,0.92,liquid)*0.68;
  return max(clock,droplet*(1.0-smoothstep(0.04,0.4,clock)));
}
void main(){
  vec2 uv=vUv,texel=vec2(1.7)/uResolution;
  float h=thickness(uv);
  vec2 gradient=vec2(thickness(uv+vec2(texel.x,0.0))-thickness(uv-vec2(texel.x,0.0)),
    thickness(uv+vec2(0.0,texel.y))-thickness(uv-vec2(0.0,texel.y)));
  vec3 n=normalize(vec3(-gradient*16.0,1.0));
  float slope=clamp(length(gradient)*8.0,0.0,1.0),fresnel=pow(1.0-n.z,2.2);
  float key=pow(max(dot(n,normalize(vec3(-0.65,0.8,0.55))),0.0),18.0);
  float rim=pow(max(dot(n,normalize(vec3(0.75,-0.2,0.42))),0.0),12.0);
  vec3 color=vec3(0.015,0.045,0.065);
  color+=vec3(0.70,0.91,0.95)*key*1.25+vec3(0.08,0.34,0.55)*rim*0.65;
  color+=mix(vec3(0.025,0.16,0.24),vec3(0.32,0.66,0.74),n.y*0.5+0.5)*fresnel*0.7;
  float alpha=clamp(h*0.14+slope*0.68+key*0.56+rim*0.24,0.0,0.88);
  gl_FragColor=vec4(color,alpha*smoothstep(0.006,0.07,h));
}
`;

function clockTexture() {
  const texture = new THREE.CanvasTexture(document.createElement("canvas"));
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}
function drawClock(texture, date, portrait) {
  const canvas = texture.image;
  canvas.width = portrait ? 768 : 1536;
  canvas.height = portrait ? 1280 : 864;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.filter = "blur(8px)";
  const h = String(date.getHours()).padStart(2, "0"),
    m = String(date.getMinutes()).padStart(2, "0");
  ctx.font = '600 400px "Instrument Sans", sans-serif';
  if (portrait) {
    ctx.fillText(h, 384, 410);
    ctx.fillText(m, 384, 890);
  } else ctx.fillText(`${h}:${m}`, 768, 432);
  texture.needsUpdate = true;
}

export function IdleGlassScene({ running, onReady, onFailure }) {
  const mountRef = useRef(null),
    runningRef = useRef(running);
  runningRef.current = running;
  useEffect(() => {
    let renderer,
      frame = 0,
      disposed = false,
      last = 0,
      lastClockCheck = 0,
      time = 0,
      accumulator = 0,
      prepared = false;
    let targets = [],
      textures = [],
      simulation,
      glass,
      geometry;
    let current = 0,
      from = 0,
      to = 1,
      clockKey = "",
      transition = 1,
      portrait = false,
      pointerSeen = false,
      freshAt = -Infinity;
    const pointer = new THREE.Vector2(0.5, 0.5),
      previous = pointer.clone(),
      velocity = new THREE.Vector2();
    const camera = new THREE.Camera(),
      scene = new THREE.Scene(),
      mesh = new THREE.Mesh();
    scene.add(mesh);
    const fail = (event) => {
      event?.preventDefault?.();
      cancelAnimationFrame(frame);
      if (!disposed) onFailure();
    };
    const updateClock = (reset = false) => {
      const date = new Date(),
        key = `${date.getHours()}:${date.getMinutes()}`;
      if (reset) {
        textures.forEach((t) => drawClock(t, date, portrait));
        transition = 1;
      } else if (key !== clockKey) {
        from = to;
        to = 1 - to;
        drawClock(textures[to], date, portrait);
        transition = 0;
      }
      clockKey = key;
      glass.uniforms.uClockFrom.value = textures[from];
      glass.uniforms.uClockTo.value = textures[to];
    };
    const render = (dt) => {
      const s = simulation.uniforms;
      accumulator = Math.min(accumulator + dt, 3 / 60);
      velocity
        .copy(pointer)
        .sub(previous)
        .divideScalar(Math.max(dt, 1 / 120))
        .clampLength(0, 1.5);
      s.uInput.value = pointerSeen && performance.now() - freshAt < 120 ? 1 : 0;
      s.uVelocity.value.copy(velocity);
      s.uPrevious.value.copy(previous);
      s.uPointer.value.copy(pointer);
      while (accumulator >= 1 / 60) {
        mesh.material = simulation;
        s.uState.value = targets[current].texture;
        renderer.setRenderTarget(targets[1 - current]);
        renderer.render(scene, camera);
        current = 1 - current;
        accumulator -= 1 / 60;
      }
      previous.copy(pointer);
      time += dt;
      transition = Math.min(1, transition + dt / 2.8);
      updateClock();
      glass.uniforms.uClockMix.value =
        transition * transition * (3 - 2 * transition);
      glass.uniforms.uTime.value = time;
      glass.uniforms.uState.value = targets[current].texture;
      mesh.material = glass;
      renderer.setRenderTarget(null);
      renderer.setClearColor(0, 0);
      renderer.render(scene, camera);
    };
    const loop = (now) => {
      if (disposed) return;
      if (runningRef.current && !document.hidden) {
        try {
          render(Math.min((now - last) / 1000 || 1 / 60, 0.05));
        } catch (error) {
          console.warn("Liquid enhancement unavailable", error);
          fail();
          return;
        }
      } else if (prepared && !document.hidden && now - lastClockCheck > 1000) {
        lastClockCheck = now;
        const date = new Date();
        if (`${date.getHours()}:${date.getMinutes()}` !== clockKey) {
          try { updateClock(true); render(1 / 60); }
          catch (error) { console.warn("Clock refresh unavailable", error); fail(); return; }
        }
      }
      last = now;
      frame = requestAnimationFrame(loop);
    };
    const resize = () => {
      if (!renderer || !glass) return;
      const nextPortrait = innerHeight > innerWidth * 1.15;
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, innerWidth < 760 ? 1 : 1.15),
      );
      renderer.setSize(innerWidth, innerHeight);
      glass.uniforms.uResolution.value.set(innerWidth, innerHeight);
      simulation.uniforms.uAspect.value = innerWidth / innerHeight;
      const changed = nextPortrait !== portrait;
      portrait = nextPortrait;
      if (changed) updateClock(true);
      if (prepared && !runningRef.current) render(1 / 60);
    };
    const move = (event) => {
      if (!runningRef.current) {
        pointerSeen = false;
        return;
      }
      pointer.set(event.clientX / innerWidth, 1 - event.clientY / innerHeight);
      if (!pointerSeen) previous.copy(pointer);
      pointerSeen = true;
      freshAt = performance.now();
    };
    const prepare = async () => {
      try {
        await document.fonts.ready;
        if (disposed) return;
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: false,
          powerPreference: "low-power",
        });
        renderer.domElement.className = "idle-canvas";
        renderer.domElement.addEventListener("webglcontextlost", fail);
        mountRef.current.appendChild(renderer.domElement);
        const floatTargets = renderer.extensions.has("EXT_color_buffer_float"),
          aspect = innerWidth / innerHeight;
        const w = Math.min(256, Math.round(128 * Math.max(1, aspect))),
          h = Math.min(256, Math.round(128 * Math.max(1, 1 / aspect)));
        targets = [0, 1].map(
          () =>
            new THREE.WebGLRenderTarget(w, h, {
              type: floatTargets ? THREE.HalfFloatType : THREE.UnsignedByteType,
              depthBuffer: false,
              stencilBuffer: false,
            }),
        );
        // Float fields are centered on zero: encoding them around 0.5 wastes
        // half-float precision and makes the final few pixels of gel stick.
        const bias = floatTargets ? 0 : 128 / 255;
        renderer.setClearColor(new THREE.Color(bias, bias, bias), bias);
        targets.forEach((target) => {
          renderer.setRenderTarget(target);
          renderer.clear();
          if (!floatTargets) {
            const gl = renderer.getContext();
            gl.clearBufferfv(
              gl.COLOR,
              0,
              new Float32Array([128 / 255, 0, 128 / 255, 0]),
            );
          }
        });
        renderer.setRenderTarget(null);
        textures = [clockTexture(), clockTexture()];
        geometry = new THREE.PlaneGeometry(2, 2);
        mesh.geometry = geometry;
        mesh.frustumCulled = false;
        simulation = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader: simulationShader,
          depthTest: false,
          depthWrite: false,
          uniforms: {
            uState: { value: targets[0].texture },
            uTexel: { value: new THREE.Vector2(1 / w, 1 / h) },
            uPointer: { value: pointer.clone() },
            uPrevious: { value: pointer.clone() },
            uVelocity: { value: velocity.clone() },
            uDt: { value: 1 / 60 },
            uAspect: { value: aspect },
            uInput: { value: 0 },
            uBias: { value: bias },
            uPacked: { value: !floatTargets },
          },
        });
        glass = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader: glassShader,
          transparent: true,
          depthWrite: false,
          depthTest: false,
          uniforms: {
            uState: { value: targets[0].texture },
            uClockFrom: { value: textures[0] },
            uClockTo: { value: textures[1] },
            uClockMix: { value: 1 },
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(innerWidth, innerHeight) },
            uBias: { value: bias },
            uPacked: { value: !floatTargets },
          },
        });
        portrait = innerHeight > innerWidth * 1.15;
        updateClock(true);
        resize();
        mesh.material = simulation;
        await renderer.compileAsync(scene, camera);
        mesh.material = glass;
        await renderer.compileAsync(scene, camera);
        if (disposed) return;
        prepared = true;
        render(1 / 60);
        window.__PELAGIC_GEL__ = {
          renderer,
          targets,
          getState: () => ({
            time,
            current,
            clockKey,
            transition,
            floatTargets,
          }),
        };
        // Keep the layer invisible until its first valid submitted frame.
        frame = requestAnimationFrame((now) => {
          if (!disposed) {
            onReady();
            last = now;
            loop(now);
          }
        });
      } catch (error) {
        console.warn("Liquid enhancement could not prepare", error);
        fail();
      }
    };
    prepare();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      renderer?.domElement.removeEventListener("webglcontextlost", fail);
      targets.forEach((t) => t.dispose());
      textures.forEach((t) => t.dispose());
      simulation?.dispose();
      glass?.dispose();
      geometry?.dispose();
      renderer?.dispose();
      renderer?.domElement.remove();
      delete window.__PELAGIC_GEL__;
    };
  }, [onReady, onFailure]);
  return <div ref={mountRef} className="idle-canvas" />;
}
