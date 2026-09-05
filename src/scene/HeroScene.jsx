import { useEffect, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import AureliaApp from "../vendor/aurelia/app.js";
import { Background } from "../vendor/aurelia/background.js";
import { LivingAppendages } from "./LivingAppendages.js";
import { JellySchoolDirector } from "./JellySchoolDirector.js";
import { PelagicEnvironment } from "./PelagicEnvironment.js";
import { PelagicCameraRig } from "./PelagicCameraRig.js";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function HeroScene({ reducedMotion = false }) {
  const mountRef = useRef(null);
  const [status, setStatus] = useState("loading");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    let app;
    let renderer;
    let schoolDirector;
    let environment;
    let frameId = 0;
    let frameBusy = false;
    let appendages = [];
    let scrollTarget = 0;
    let scrollProgress = 0;
    let lastScrollTime = -Infinity;
    let lastPointerTime = 0;
    let pointerSeen = false;
    let hoverDirty = false;
    let lastHoverCheck = 0;
    let hoveredTissue = null;
    let pointerDown = null;
    const socialTimers = [];
    const pointer = new THREE.Vector2(0.5, 0.5);
    const previousPointer = new THREE.Vector2(0.5, 0.5);
    const pointerNdc = new THREE.Vector2();
    const pointerClient = new THREE.Vector2(window.innerWidth * 0.5, window.innerHeight * 0.5);
    const pointerGoal = new THREE.Vector2();
    const currentTarget = new THREE.Vector2();
    const current = { value: new THREE.Vector2() };
    const journeyFocus = new THREE.Vector3();
    const socialPoint = new THREE.Vector3();
    const pickRaycaster = new THREE.Raycaster();
    const projectedPoint = new THREE.Vector3();
    const clock = new THREE.Clock();

    const updateScrollTarget = (event) => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollTarget = clamp(window.scrollY / maxScroll, 0, 1);
      if (event?.type === "scroll") lastScrollTime = performance.now();
    };

    const updatePointer = (event) => {
      pointerClient.set(event.clientX, event.clientY);
      pointer.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
      pointerNdc.set(pointer.x * 2 - 1, pointer.y * 2 - 1);
      const deltaX = pointer.x - previousPointer.x;
      const deltaY = pointer.y - previousPointer.y;
      pointerGoal.set(
        deltaX * 3.2,
        deltaY * 3.2,
      );
      currentTarget.lerp(pointerGoal, 0.48);
      previousPointer.copy(pointer);
      lastPointerTime = performance.now();
      pointerSeen = true;
      hoverDirty = event.pointerType !== "touch";
      if (app?.camera && app.raycaster) app.raycaster.setFromCamera(pointerNdc, app.camera);
    };

    const findJellyAt = (clientX, clientY) => {
      if (!app?.camera || !appendages.length) return null;
      pointerNdc.set(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1,
      );
      app.camera.updateMatrixWorld();
      appendages.forEach((tissue) => tissue.group.updateMatrixWorld(true));
      pickRaycaster.setFromCamera(pointerNdc, app.camera);
      const meshes = appendages.flatMap((tissue) => tissue.getInteractionMeshes());
      const hit = pickRaycaster.intersectObjects(meshes, false)[0];
      if (!hit) return null;
      return { tissue: hit.object.userData.livingAppendages, point: hit.point };
    };

    const updateHover = () => {
      const hit = findJellyAt(pointerClient.x, pointerClient.y);
      const next = hit?.tissue ?? null;
      if (next === hoveredTissue) return;
      hoveredTissue?.setHovered(false);
      next?.setHovered(true);
      hoveredTissue = next;
      mount.classList.toggle("is-jelly-hover", Boolean(next));
    };

    const beginPointer = (event) => {
      if (!event.isPrimary) return;
      pointerDown = {
        x: event.clientX,
        y: event.clientY,
        time: performance.now(),
        id: event.pointerId,
      };
    };

    const endPointer = (event) => {
      if (!pointerDown || pointerDown.id !== event.pointerId) return;
      const travel = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
      const duration = performance.now() - pointerDown.time;
      pointerDown = null;
      const target = event.target instanceof Element ? event.target : null;
      if (
        travel > 9
        || duration > 520
        || target?.closest("a, button, input, textarea, select, .scene-copy, .idle-screen")
      ) return;
      const hit = findJellyAt(event.clientX, event.clientY);
      if (!hit?.tissue) return;
      hit.tissue.activate(hit.point);
      appendages
        .filter((tissue) => tissue !== hit.tissue && tissue.presence > 0.008)
        .map((tissue) => ({
          tissue,
          distance: tissue.group.position.distanceTo(hit.tissue.group.position),
        }))
        .filter(({ distance }) => distance < 6.2)
        .sort((first, second) => first.distance - second.distance)
        .slice(0, 3)
        .forEach(({ tissue }, index) => {
          const timer = window.setTimeout(() => {
            if (disposed || tissue.presence <= 0.008) return;
            socialPoint.set(0.18, tissue.species.height * 0.62, 0.06);
            tissue.group.localToWorld(socialPoint);
            tissue.activate(socialPoint, 0.24 - index * 0.045);
          }, 130 + index * 125);
          socialTimers.push(timer);
        });
      if (window.__JELLYFISH_WORLD__) {
        window.__JELLYFISH_WORLD__.activationCount += 1;
        window.__JELLYFISH_WORLD__.lastActivated = hit.tissue.index;
      }
    };

    const clearPointer = () => {
      pointerDown = null;
      hoveredTissue?.setHovered(false);
      hoveredTissue = null;
      mount.classList.remove("is-jelly-hover");
    };

    const resize = () => {
      if (!renderer || !app) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1 : 1.35));
      renderer.setSize(window.innerWidth, window.innerHeight);
      app.resize(window.innerWidth, window.innerHeight);
    };

    const start = async () => {
      try {
        const query = new URLSearchParams(window.location.search);
        const forceWebGL =
          query.get("renderer") === "webgl" ||
          !navigator.gpu ||
          Boolean(navigator.brave);

        renderer = new THREE.WebGPURenderer({
          antialias: true,
          powerPreference: "high-performance",
          forceWebGL,
        });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 760 ? 1 : 1.35));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.domElement.className = "ocean-canvas";
        renderer.domElement.dataset.renderer = forceWebGL
          ? "webgl-aurelia-fallback"
          : "webgpu-aurelia";
        mount.appendChild(renderer.domElement);

        const isMobile = window.innerWidth < 760;
        const jellyfishCount = window.innerWidth < 1180 ? 6 : 8;
        app = new AureliaApp(renderer, { jellyfishCount });
        await app.init(async (fraction) => {
          if (!disposed) setProgress(Math.round(fraction * 100));
        });
        if (disposed) return;

        app.controls.enabled = false;
        app.camera.fov = window.innerWidth < 760 ? 58 : 47;
        app.camera.far = 48;
        app.camera.updateProjectionMatrix();
        app.bloomPass.strength.value = 0.46;
        app.bloomPass.radius.value = 0.82;
        renderer.toneMappingExposure = 0.94;
        // The vendored 360 Hz spring simulation only drives meshes that this
        // presentation replaces. Keeping it alive duplicated the cost of every
        // visible custom animal and caused avoidable frame pacing stalls.
        app.setSimulationEnabled(false);

        const cameraRig = new PelagicCameraRig(app.camera, {
          mobile: isMobile,
          reducedMotion,
        });
        schoolDirector = new JellySchoolDirector(app.bridge.medusae, {
          mobile: isMobile,
          reducedMotion,
        });
        cameraRig.getJourneyFocus(scrollProgress, journeyFocus);
        const initialDirective = schoolDirector.update(
          scrollProgress,
          1 / 60,
          clock.elapsedTime,
          current.value,
          journeyFocus,
        );
        cameraRig.update(scrollProgress, 1 / 60, clock.elapsedTime, initialDirective);

        const featuredFidelity = new Set(isMobile ? [0, 2, 5] : [0, 2, 4, 5]);
        appendages = app.bridge.medusae.map((medusa, index) => {
          medusa.bell.object.visible = false;
          medusa.arms.object.visible = false;
          medusa.tentacles.object.visible = false;
          const tissue = new LivingAppendages(medusa, index, {
            reducedMotion,
            fidelity: featuredFidelity.has(index) ? "hero" : "companion",
          });
          app.scene.add(tissue.group);
          return tissue;
        });
        environment = new PelagicEnvironment(app.scene, { mobile: isMobile, reducedMotion });
        updateScrollTarget();
        window.addEventListener("scroll", updateScrollTarget, { passive: true });
        window.addEventListener("resize", resize);
        window.addEventListener("pointermove", updatePointer, { passive: true });
        window.addEventListener("pointerdown", beginPointer, { passive: true });
        window.addEventListener("pointerup", endPointer, { passive: true });
        window.addEventListener("pointercancel", clearPointer, { passive: true });
        document.documentElement.addEventListener("mouseleave", clearPointer);

        window.__JELLYFISH_WORLD__ = {
          renderer: forceWebGL ? "WebGL 2" : "WebGPU",
          jellyfishCount,
          distantJellyfishCount: environment.distantJellies.count,
          physics: "Verlet soft body + procedural water",
          procedural: true,
          interaction: "raycast bioluminescence + localized recoil + social glow echo",
          camera: "pelagic camera story director + multi-subject handoffs",
          activationCount: 0,
          lastActivated: null,
          getCameraState() {
            return cameraRig.getState();
          },
          getSwarmState() {
            return {
              shot: schoolDirector.lastShot,
              actors: schoolDirector.getActorState(),
            };
          },
          getDistantSwarmState() {
            return environment.distantJellies.getState();
          },
          getDeepState() {
            return environment.getDeepState();
          },
          getJellyScreenPoint(index = 0) {
            const tissue = appendages[index];
            if (!tissue) return null;
            projectedPoint.set(0.24, tissue.species.height * 0.68, 0.08);
            tissue.group.localToWorld(projectedPoint);
            projectedPoint.project(app.camera);
            return {
              x: (projectedPoint.x * 0.5 + 0.5) * window.innerWidth,
              y: (-projectedPoint.y * 0.5 + 0.5) * window.innerHeight,
            };
          },
        };

        // Populate every dynamic buffer once while the loading veil is still
        // present. Otherwise later high-fidelity actors pay their first geometry
        // upload in the middle of a wheel gesture.
        appendages.forEach((tissue) => {
          tissue.setPresence(1, 1);
          tissue.update(1 / 60, clock.elapsedTime, current.value, null, 0, false);
        });
        environment.update(clock.elapsedTime, 0.78, current.value, journeyFocus, false, true);

        // Compile both the full cinematic pass and the lightweight scrolling
        // pass before exposing the scene.
        await renderer.compileAsync(app.scene, app.camera);
        await renderer.renderAsync(app.scene, app.camera);
        // The TSL bloom/MRT chain is not reliable on Brave's forced WebGL
        // backend and can resolve to an opaque black target. Prewarm only the
        // render path this browser will actually use.
        await app.update(1 / 60, clock.elapsedTime, { interactionMode: forceWebGL });
        if (disposed) return;

        schoolDirector.actors.forEach((actor, index) => {
          appendages[index]?.setPresence(actor.presence, actor.feature);
        });
        environment.update(clock.elapsedTime, 0, current.value, journeyFocus, false);
        setStatus("ready");

        const animate = async () => {
          if (disposed) return;
          frameId = window.requestAnimationFrame(animate);
          if (frameBusy) return;
          frameBusy = true;
          try {
            const rawDelta = clock.getDelta();
            const delta = Math.min(rawDelta, 1 / 24);
            const motionDelta = Math.min(rawDelta, 0.12);
            // Never let a late renderer frame turn into a large camera catch-up
            // step. The animals may advance with elapsed time, but the viewer
            // eases back into the shot over subsequent frames.
            const cameraDelta = Math.min(rawDelta, 1 / 30);
            const elapsed = clock.elapsedTime;
            const scrollDamping = 1 - Math.exp(-cameraDelta * (reducedMotion ? 5.8 : 3.5));
            scrollProgress += (scrollTarget - scrollProgress) * scrollDamping;
            const interactionMode = performance.now() - lastScrollTime < 180
              || Math.abs(scrollTarget - scrollProgress) > 0.0015;

            const pointerActive = pointerSeen && performance.now() - lastPointerTime < 720;
            const currentDamping = 1 - Math.exp(-motionDelta * (pointerActive ? 4.8 : 1.4));
            if (!pointerActive) currentTarget.multiplyScalar(Math.exp(-motionDelta * 3.4));
            current.value.lerp(currentTarget, currentDamping);

            if (hoverDirty && elapsed - lastHoverCheck > 0.07) {
              updateHover();
              hoverDirty = false;
              lastHoverCheck = elapsed;
            }

            cameraRig.getJourneyFocus(scrollProgress, journeyFocus);
            const directive = schoolDirector.update(
              scrollProgress,
              motionDelta,
              elapsed,
              current.value,
              journeyFocus,
            );
            cameraRig.update(scrollProgress, cameraDelta, elapsed, directive);
            schoolDirector.actors.forEach((actor, index) => {
              appendages[index]?.setPresence(actor.presence, actor.feature);
            });
            environment.update(
              elapsed,
              scrollProgress,
              current.value,
              journeyFocus,
              interactionMode,
            );

            Background.pointer.value.copy(pointer);
            Background.current.value.copy(current.value);
            Background.currentStrength.value = clamp(current.value.length() * 1.35, 0, 1);
            // Keep the mesopelagic blue alive through more of the journey;
            // darkness now gathers gradually instead of tracking scroll 1:1.
            Background.depth.value = Math.pow(scrollProgress, 1.68);

            const pointerStrength = pointerActive
              ? clamp(0.24 + current.value.length() * 3.4, 0, 1)
              : 0;
            appendages.forEach((tissue) => tissue.update(
              delta,
              elapsed,
              current.value,
              pointerSeen ? app.raycaster.ray : null,
              pointerStrength,
              interactionMode,
            ));

            await app.update(
              reducedMotion ? delta * 0.28 : delta,
              elapsed,
              { interactionMode: forceWebGL || interactionMode },
            );
          } catch (error) {
            console.error("Living ocean frame failed", error);
          } finally {
            frameBusy = false;
          }
        };

        frameId = window.requestAnimationFrame(animate);
      } catch (error) {
        console.error("Living ocean failed to initialize", error);
        if (!disposed) setStatus("error");
      }
    };

    start();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerdown", beginPointer);
      window.removeEventListener("pointerup", endPointer);
      window.removeEventListener("pointercancel", clearPointer);
      document.documentElement.removeEventListener("mouseleave", clearPointer);
      mount.classList.remove("is-jelly-hover");
      socialTimers.forEach((timer) => window.clearTimeout(timer));
      delete window.__JELLYFISH_WORLD__;
      appendages.forEach((tissue) => tissue.dispose());
      environment?.dispose();
      app?.dispose();
      renderer?.dispose();
      renderer?.domElement?.remove();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={mountRef}
      className={`ocean-stage ocean-stage--${status}`}
      data-scene-status={status}
      data-scene-progress={progress}
      aria-hidden="true"
    >
      <div className="ocean-depth-haze" />
    </div>
  );
}
