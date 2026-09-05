import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";

const chrome = process.env.CHROME_BIN;
if (!chrome) throw new Error("Set CHROME_BIN to the available Chromium executable.");

const targetUrl = process.argv[2] || "http://127.0.0.1:4173/";
const outputPath = process.argv[3] || "qa-capture.png";
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 1024);
const waitMs = Number(process.argv[6] || 2000);
const profile = mkdtempSync("/tmp/jellyfish-chrome-");
const port = Number(process.env.CDP_PORT || 9237);

const browserArgs = [
  "--headless=new",
  "--no-sandbox",
  "--hide-scrollbars",
  "--use-gl=angle",
  `--use-angle=${process.env.QA_ANGLE_BACKEND || "swiftshader-webgl"}`,
  "--enable-unsafe-swiftshader",
  "--enable-webgl",
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`,
];
if (process.env.REDUCE_MOTION === "1") browserArgs.push("--force-prefers-reduced-motion");
browserArgs.push("about:blank");

const browser = spawn(
  chrome,
  browserArgs,
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function endpoint(path, options) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
      if (response.ok) return response.json();
    } catch {
      // Chromium is still starting.
    }
    await sleep(100);
  }
  throw new Error("Chromium debugging endpoint did not become ready.");
}

function createClient(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  const errors = [];
  let id = 0;

  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") {
      errors.push(
        message.params.exceptionDetails.exception?.description ||
          message.params.exceptionDetails.text,
      );
    }
    if (message.method === "Log.entryAdded" && message.params.entry.level === "error") {
      errors.push(message.params.entry.text);
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      errors.push(message.params.args
        .map((arg) => arg.value ?? arg.description ?? arg.type)
        .join(" "));
    }
  });

  const ready = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  return {
    errors,
    ready,
    close: () => socket.close(),
    send(method, params = {}) {
      const requestId = ++id;
      socket.send(JSON.stringify({ id: requestId, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(requestId, { resolve, reject });
      });
    },
  };
}

let client;
let performanceSample = null;

try {
  await endpoint("/json/version");
  const page = await endpoint(`/json/new?${encodeURIComponent("about:blank")}`, { method: "PUT" });
  client = createClient(page.webSocketDebuggerUrl);
  await client.ready;
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Log.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 767,
  });
  await client.send("Page.navigate", { url: targetUrl });
  await sleep(waitMs);
  const requestedHash = new URL(targetUrl).hash;
  if (requestedHash) {
    await client.send("Runtime.evaluate", {
      expression: `(() => {
        document.documentElement.style.scrollBehavior = "auto";
        const target = document.querySelector(${JSON.stringify(requestedHash)});
        if (target) window.scrollTo(0, Math.max(0, target.offsetTop - 72));
      })()`,
      returnByValue: true,
    });
    await sleep(Math.max(1800, waitMs));
  }
  const requestedProgress = Number(new URL(targetUrl).searchParams.get("qaProgress"));
  if (Number.isFinite(requestedProgress) && requestedProgress >= 0 && requestedProgress <= 1) {
    await client.send("Runtime.evaluate", {
      expression: `(() => {
        document.documentElement.style.scrollBehavior = "auto";
        const maximum = document.documentElement.scrollHeight - innerHeight;
        window.scrollTo(0, maximum * ${requestedProgress});
      })()`,
      returnByValue: true,
    });
    await sleep(Math.max(2200, waitMs));
  }
  if (new URL(targetUrl).searchParams.get("qaMenu") === "1") {
    await client.send("Runtime.evaluate", {
      expression: `document.querySelector('.menu-toggle')?.click()`,
      returnByValue: true,
    });
    await sleep(600);
  }
  if (new URL(targetUrl).searchParams.get("qaMotion") === "1") {
    await client.send("Runtime.evaluate", {
      expression: `document.querySelector('.motion-control')?.click()`,
      returnByValue: true,
    });
    await sleep(600);
  }
  if (new URL(targetUrl).searchParams.get("qaJellyClick") === "1") {
    const jellyIndex = Number(new URL(targetUrl).searchParams.get("qaJellyIndex") || 0);
    const point = await client.send("Runtime.evaluate", {
      expression: `window.__JELLYFISH_WORLD__?.getJellyScreenPoint?.(${jellyIndex})`,
      returnByValue: true,
    });
    const coordinates = point.result.value;
    if (!coordinates || !Number.isFinite(coordinates.x) || !Number.isFinite(coordinates.y)) {
      throw new Error("The jellyfish interaction target was unavailable.");
    }
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x: coordinates.x,
      y: coordinates.y,
    });
    await client.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: coordinates.x,
      y: coordinates.y,
      button: "left",
      clickCount: 1,
    });
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: coordinates.x,
      y: coordinates.y,
      button: "left",
      clickCount: 1,
    });
    await sleep(420);
  }
  if (new URL(targetUrl).searchParams.get("qaGel") === "1") {
    for (let step = 0; step < 18; step += 1) {
      const progress = step / 17;
      await client.send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: width * (0.22 + progress * 0.42),
        y: height * (0.5 + Math.sin(progress * Math.PI * 2) * 0.12),
      });
      await sleep(28);
    }
    await sleep(80);
  }
  if (new URL(targetUrl).searchParams.get("qaSwimPerf") === "1") {
    const sample = await client.send("Runtime.evaluate", {
      expression: `new Promise((resolve) => {
        const samples = [];
        const started = performance.now();
        let lastSample = started;
        let previousSpeed = null;
        const tick = (now) => {
          if (now - lastSample >= 80) {
            const actor = window.__JELLYFISH_WORLD__?.getSwarmState?.().actors?.[0];
            if (actor) {
              const dt = Math.max(0.001, (now - lastSample) / 1000);
              samples.push({
                phase: actor.phase,
                speed: actor.velocity,
                primary: actor.primaryThrust,
                secondary: actor.secondaryThrust,
                acceleration: previousSpeed === null ? 0 : (actor.velocity - previousSpeed) / dt,
              });
              previousSpeed = actor.velocity;
            }
            lastSample = now;
          }
          if (now - started < 7600) requestAnimationFrame(tick);
          else {
            const mean = (values) => values.length
              ? values.reduce((sum, value) => sum + value, 0) / values.length
              : 0;
            const speeds = samples.map(({ speed }) => speed);
            const primaryAccel = samples
              .filter(({ primary }) => primary > 0.55)
              .map(({ acceleration }) => acceleration);
            const recoveryAccel = samples
              .filter(({ phase }) => phase > 0.27 && phase < 0.55)
              .map(({ acceleration }) => acceleration);
            resolve({
              mode: "pulse-coupling",
              samples: samples.length,
              minSpeed: Number(Math.min(...speeds).toFixed(3)),
              maxSpeed: Number(Math.max(...speeds).toFixed(3)),
              primaryAcceleration: Number(mean(primaryAccel).toFixed(3)),
              recoveryAcceleration: Number(mean(recoveryAccel).toFixed(3)),
            });
          }
        };
        requestAnimationFrame(tick);
      })`,
      awaitPromise: true,
      returnByValue: true,
    });
    performanceSample = sample.result.value;
  } else if (new URL(targetUrl).searchParams.get("qaScrollPerf") === "1") {
    const sample = await client.send("Runtime.evaluate", {
      expression: `new Promise((resolve) => {
        document.documentElement.style.scrollBehavior = "auto";
        const samples = [];
        const positions = [];
        const cameraSpeeds = [];
        const targetSpeeds = [];
        const cameraJerks = [];
        let previousCamera = null;
        let previousTarget = null;
        let previousCameraSpeed = null;
        const started = performance.now();
        let previous = started;
        const distance = (document.documentElement.scrollHeight - innerHeight) * 0.78;
        const tick = (now) => {
          samples.push(now - previous);
          positions.push(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight));
          const cameraState = window.__JELLYFISH_WORLD__?.getCameraState?.();
          if (cameraState && previousCamera) {
            const seconds = Math.max(0.001, (now - previous) / 1000);
            const distance = (first, second) => Math.hypot(
              first[0] - second[0],
              first[1] - second[1],
              first[2] - second[2],
            );
            const cameraSpeed = distance(cameraState.position, previousCamera) / seconds;
            const targetSpeed = distance(cameraState.target, previousTarget) / seconds;
            cameraSpeeds.push(cameraSpeed);
            targetSpeeds.push(targetSpeed);
            if (previousCameraSpeed !== null) {
              cameraJerks.push(Math.abs(cameraSpeed - previousCameraSpeed) / seconds);
            }
            previousCameraSpeed = cameraSpeed;
          }
          if (cameraState) {
            previousCamera = cameraState.position;
            previousTarget = cameraState.target;
          }
          previous = now;
          const progress = Math.min(1, (now - started) / 2600);
          window.scrollTo(0, distance * progress);
          if (progress < 1) requestAnimationFrame(tick);
          else {
            const rawStable = samples.slice(8);
            const longFrames = rawStable
              .map((value, index) => ({
                index,
                value: Number(value.toFixed(2)),
                progress: Number((positions[index + 8] ?? 0).toFixed(3)),
              }))
              .filter(({ value }) => value > 34)
              .slice(0, 8);
            const stable = [...rawStable].sort((a, b) => a - b);
            const averageMs = stable.reduce((sum, value) => sum + value, 0) / stable.length;
            const percentile = (values, amount) => {
              const ordered = [...values].sort((a, b) => a - b);
              return ordered[Math.min(ordered.length - 1, Math.floor(ordered.length * amount))] || 0;
            };
            resolve({
              mode: "continuous-scroll",
              averageMs: Number(averageMs.toFixed(2)),
              fps: Number((1000 / averageMs).toFixed(1)),
              p95Ms: Number(stable[Math.floor(stable.length * 0.95)].toFixed(2)),
              maxMs: Number(stable[stable.length - 1].toFixed(2)),
              cameraSpeedP95: Number(percentile(cameraSpeeds, 0.95).toFixed(3)),
              targetSpeedP95: Number(percentile(targetSpeeds, 0.95).toFixed(3)),
              cameraJerkP95: Number(percentile(cameraJerks, 0.95).toFixed(3)),
              longFrames,
            });
          }
        };
        requestAnimationFrame(tick);
      })`,
      awaitPromise: true,
      returnByValue: true,
    });
    performanceSample = sample.result.value;
    await sleep(250);
  } else if (new URL(targetUrl).searchParams.get("qaPerf") === "1") {
    const sample = await client.send("Runtime.evaluate", {
      expression: `new Promise((resolve) => {
        const samples = [];
        let previous = performance.now();
        const tick = (now) => {
          samples.push(now - previous);
          previous = now;
          if (samples.length < 90) requestAnimationFrame(tick);
          else {
            const stable = samples.slice(8).sort((a, b) => a - b);
            const averageMs = stable.reduce((sum, value) => sum + value, 0) / stable.length;
            resolve({
              averageMs: Number(averageMs.toFixed(2)),
              fps: Number((1000 / averageMs).toFixed(1)),
              p95Ms: Number(stable[Math.floor(stable.length * 0.95)].toFixed(2)),
              maxMs: Number(stable[stable.length - 1].toFixed(2)),
            });
          }
        };
        requestAnimationFrame(tick);
      })`,
      awaitPromise: true,
      returnByValue: true,
    });
    performanceSample = sample.result.value;
  }
  const sequenceFrameCount = Math.max(
    0,
    Math.min(12, Number(new URL(targetUrl).searchParams.get("qaFrames") || 0)),
  );
  const sequenceFrameDelay = Math.max(
    100,
    Math.min(3000, Number(new URL(targetUrl).searchParams.get("qaFrameDelay") || 800)),
  );
  if (sequenceFrameCount > 0) {
    for (let frame = 0; frame < sequenceFrameCount; frame += 1) {
      const sequenceCapture = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true,
        captureBeyondViewport: false,
      });
      const suffix = `-${String(frame + 1).padStart(2, "0")}`;
      const sequencePath = /\.[^./]+$/.test(outputPath)
        ? outputPath.replace(/(\.[^./]+)$/, `${suffix}$1`)
        : `${outputPath}${suffix}.png`;
      writeFileSync(sequencePath, Buffer.from(sequenceCapture.data, "base64"));
      if (frame < sequenceFrameCount - 1) await sleep(sequenceFrameDelay);
    }
  }
  const capture = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  writeFileSync(outputPath, Buffer.from(capture.data, "base64"));

  const state = await client.send("Runtime.evaluate", {
    expression: `({
      title: document.title,
      idleActive: document.querySelector('[data-testid="idle-screen"]')?.classList.contains('is-active'),
      h1: document.querySelector('h1')?.innerText,
      links: document.querySelectorAll('a').length,
      bodyOverflow: getComputedStyle(document.body).overflow,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollY: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      journeyProgress: getComputedStyle(document.documentElement).getPropertyValue('--journey-progress').trim(),
      canvasCount: document.querySelectorAll('canvas').length,
      menuOpen: document.querySelector('.site-index')?.classList.contains('is-open'),
      motionControl: document.querySelector('.motion-control')?.textContent.trim(),
      contactHref: document.querySelector('.contact-primary')?.getAttribute('href'),
      motionText: document.querySelector('.motion-toggle')?.textContent.trim(),
      sceneStatus: document.querySelector('.ocean-stage')?.dataset.sceneStatus,
      sceneMeta: window.__JELLYFISH_WORLD__,
      cameraState: window.__JELLYFISH_WORLD__?.getCameraState?.(),
      swarmState: window.__JELLYFISH_WORLD__?.getSwarmState?.(),
      distantSwarmState: window.__JELLYFISH_WORLD__?.getDistantSwarmState?.(),
      heroScreenPoint: window.__JELLYFISH_WORLD__?.getJellyScreenPoint?.(0),
      jellyScreenPoints: Array.from(
        { length: window.__JELLYFISH_WORLD__?.jellyfishCount ?? 0 },
        (_, index) => window.__JELLYFISH_WORLD__?.getJellyScreenPoint?.(index),
      ),
      overflowers: [...document.querySelectorAll('body *')]
        .map((element) => ({
          tag: element.tagName,
          className: typeof element.className === 'string' ? element.className : '',
          left: Math.round(element.getBoundingClientRect().left),
          right: Math.round(element.getBoundingClientRect().right),
          width: Math.round(element.getBoundingClientRect().width),
        }))
        .filter((item) => item.right > innerWidth + 2 || item.left < -2)
        .slice(0, 12)
    })`,
    returnByValue: true,
  });
  let idleAfterClick = null;
  if (state.result.value.idleActive) {
    await client.send("Input.dispatchMouseEvent", {
      type: "mousePressed",
      x: width / 2,
      y: height / 2,
      button: "left",
      clickCount: 1,
    });
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseReleased",
      x: width / 2,
      y: height / 2,
      button: "left",
      clickCount: 1,
    });
    await sleep(350);
    const dismissed = await client.send("Runtime.evaluate", {
      expression: `document.querySelector('[data-testid="idle-screen"]')?.classList.contains('is-active')`,
      returnByValue: true,
    });
    idleAfterClick = dismissed.result.value;
  }
  process.stdout.write(
    `${JSON.stringify({ ...state.result.value, performanceSample, idleAfterClick, errors: client.errors })}\n`,
  );
} finally {
  client?.close();
  browser.kill("SIGTERM");
  await sleep(300);
  spawnSync("host-spawn", [
    "sh",
    "-lc",
    `pgrep -f '/app/brave/[b]rave.*--user-data-dir=${profile}' | xargs -r kill`,
  ]);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
