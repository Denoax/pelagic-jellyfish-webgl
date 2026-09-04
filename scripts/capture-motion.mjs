import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const chrome = process.env.CHROME_BIN;
if (!chrome) throw new Error("Set CHROME_BIN to the available Chromium executable.");

const targetUrl = process.argv[2] || "http://127.0.0.1:4173/";
const outputPath = resolve(process.argv[3] || "qa-jellyfish-motion.mp4");
const width = Number(process.argv[4] || 960);
const height = Number(process.argv[5] || 640);
const frameCount = Number(process.argv[6] || 54);
const fps = Number(process.argv[7] || 18);
const profile = mkdtempSync("/tmp/jellyfish-motion-chrome-");
const frames = mkdtempSync("/tmp/jellyfish-motion-frames-");
const port = 9238;

mkdirSync(dirname(outputPath), { recursive: true });

const browser = spawn(
  chrome,
  [
    "--headless=new",
    "--no-sandbox",
    "--hide-scrollbars",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--enable-webgl",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));

async function endpoint(path, options) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
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
      const { resolve: resolveRequest, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolveRequest(message.result);
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
  });

  const ready = new Promise((resolveReady, rejectReady) => {
    socket.addEventListener("open", resolveReady, { once: true });
    socket.addEventListener("error", rejectReady, { once: true });
  });

  return {
    errors,
    ready,
    close: () => socket.close(),
    send(method, params = {}) {
      const requestId = ++id;
      socket.send(JSON.stringify({ id: requestId, method, params }));
      return new Promise((resolveRequest, reject) => {
        pending.set(requestId, { resolve: resolveRequest, reject });
      });
    },
  };
}

let client;

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
    mobile: false,
  });
  await client.send("Page.navigate", { url: targetUrl });

  for (let attempt = 0; attempt < 140; attempt += 1) {
    const ready = await client.send("Runtime.evaluate", {
      expression: `document.querySelector('.ocean-stage')?.dataset.sceneStatus === 'ready'`,
      returnByValue: true,
    });
    if (ready.result.value) break;
    await sleep(100);
  }
  await sleep(1100);

  const frameDuration = 1000 / fps;
  for (let frame = 0; frame < frameCount; frame += 1) {
    const t = frame / Math.max(1, frameCount - 1);
    const travel = Math.max(0, Math.min(1, (t - 0.055) / 0.89));
    const easedTravel = travel * travel * (3 - 2 * travel);
    await client.send("Runtime.evaluate", {
      expression: `window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * ${easedTravel})`,
      returnByValue: true,
    });
    const x = width * (0.5 + Math.sin(t * Math.PI * 1.6) * 0.065);
    const y = height * (0.5 + Math.sin(t * Math.PI * 2.1 + 0.7) * 0.045);
    await client.send("Input.dispatchMouseEvent", {
      type: "mouseMoved",
      x,
      y,
      button: "none",
    });
    const capture = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    writeFileSync(
      `${frames}/frame-${String(frame).padStart(4, "0")}.png`,
      Buffer.from(capture.data, "base64"),
    );
    await sleep(Math.max(0, frameDuration - 12));
  }

  const render = spawnSync(
    "/usr/bin/ffmpeg",
    [
      "-y",
      "-framerate",
      String(fps),
      "-i",
      `${frames}/frame-%04d.png`,
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-crf",
      "19",
      outputPath,
    ],
    { encoding: "utf8" },
  );
  if (render.status !== 0) throw new Error(render.stderr || "ffmpeg failed");

  const meta = await client.send("Runtime.evaluate", {
    expression: `({
      scene: window.__JELLYFISH_WORLD__,
      status: document.querySelector('.ocean-stage')?.dataset.sceneStatus,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      journeyProgress: getComputedStyle(document.documentElement).getPropertyValue('--journey-progress').trim(),
      cameraState: window.__JELLYFISH_WORLD__?.getCameraState?.()
    })`,
    returnByValue: true,
  });
  process.stdout.write(
    `${JSON.stringify({ outputPath, frames: frameCount, fps, ...meta.result.value, errors: client.errors })}\n`,
  );
} finally {
  client?.close();
  browser.kill("SIGTERM");
  await sleep(250);
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  rmSync(frames, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
