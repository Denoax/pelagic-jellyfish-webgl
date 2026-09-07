import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { LensDeformation } from "../src/scene/glass/LensDeformation.js";

test("lens pull is bounded, rate-independent and recovers completely", () => {
  const runs = [];
  for (const hz of [30, 60, 120]) {
    const state = new LensDeformation();
    state.begin(0.4, 0.2);
    state.move(20, -30);
    assert.ok(Math.hypot(...state.target) <= 0.65000001);
    for (let i = 0; i < hz; i++) state.update(1 / hz);
    runs.push([...state.pull]);
    state.release();
    for (let i = 0; i < hz * 6; i++) state.update(1 / hz);
    assert.deepEqual(state.pull, [0, 0]);
    assert.deepEqual(state.velocity, [0, 0]);
  }
  for (const run of runs)
    for (let i = 0; i < 2; i++)
      assert.ok(Math.abs(run[i] - runs[0][i]) < 1e-10);
});
test("lens ignores invalid delta and discards suspension debt", () => {
  const a = new LensDeformation(),
    b = new LensDeformation();
  for (const s of [a, b]) {
    s.begin(0, 0);
    s.move(0.4, 0.3);
  }
  a.update(120);
  b.update(0.05);
  assert.deepEqual(a.pull, b.pull);
  const saved = [...a.pull];
  a.update(NaN);
  a.update(-1);
  assert.deepEqual(a.pull, saved);
  for (let i = 0; i < 1000; i++) {
    a.begin(0, 0);
    a.move(i, -i);
    a.update(0.016);
    a.release();
  }
  assert.ok(a.pull.every(Number.isFinite));
  a.reset();
  assert.deepEqual(a.pull, [0, 0]);
});
test("approved M1 and M2 runtime ownership remains byte-for-byte unchanged", () => {
  const baseline = "1342d82118d8632cd429e21418832f5c908446a7";
  const files = execFileSync(
    "git",
    ["ls-tree", "-r", "--name-only", baseline, "src/scene"],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(
      (path) =>
        !path.endsWith("/HeroScene.jsx") && !path.endsWith("/AGENTS.md"),
    );
  for (const file of files)
    assert.equal(
      readFileSync(file, "utf8"),
      execFileSync("git", ["show", `${baseline}:${file}`], {
        encoding: "utf8",
      }),
      file,
    );
});
test("lens path is opt-in DEV and does not change idle or production release selection", () => {
  const source = readFileSync("src/scene/HeroScene.jsx", "utf8");
  assert.match(
    source,
    /lensRequested = import\.meta\.env\.DEV && query\.get\('liveLens'\) === '1'/,
  );
  assert.match(source, /if \(lensRequested\)/);
  assert.match(source, /renderScene: liveLens\?\.render/);
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(pkg.dependencies.three, "0.175.0");
});
test("same renderer receives ocean target then output, restores state on failure and cleans resources", async () => {
  const previousWindow = globalThis.window,
    previousDocument = globalThis.document;
  globalThis.window = new EventTarget();
  globalThis.document = new EventTarget();
  globalThis.document.hidden = false;
  try {
    const THREE = await import("three/webgpu");
    const { LiveOceanLens } = await import(
      "../src/scene/glass/LiveOceanLens.js"
    );
    const camera = new THREE.PerspectiveCamera(47, 1280 / 900, 0.1, 48);
    camera.updateMatrixWorld();
    const calls = [],
      renderer = {
        samples: 4,
        backend: { isWebGLBackend: true },
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        target: null,
        getRenderTarget() {
          return this.target;
        },
        setRenderTarget(t) {
          this.target = t;
          calls.push(t);
        },
        getDrawingBufferSize(v) {
          v.set(1280, 900);
        },
        async renderAsync() {
          assert.ok(this.target);
        },
      };
    const lens = new LiveOceanLens(renderer, camera);
    lens.scene = new THREE.Scene();
    lens.output.renderAsync = async () => {
      assert.equal(renderer.target, null);
    };
    await lens.render();
    assert.equal(lens.target.width, 1280);
    assert.equal(lens.target.height, 900);
    assert.equal(calls[0], lens.target);
    assert.equal(calls[1], null);
    const identity = lens.target;
    await lens.render();
    assert.equal(lens.target, identity);
    renderer.getDrawingBufferSize = (v) => v.set(390, 844);
    await lens.render();
    assert.equal(lens.target.width, 390);
    lens.output.renderAsync = async () => {
      renderer.toneMapping = 0;
      throw Error("simulated output failure");
    };
    await assert.rejects(lens.render(), /simulated output failure/);
    assert.equal(renderer.target, null);
    assert.equal(renderer.toneMapping, THREE.ACESFilmicToneMapping);
    let disposals = 0;
    lens.target.addEventListener("dispose", () => disposals++);
    lens.dispose();
    lens.dispose();
    assert.equal(disposals, 1);
    const pendingLens = new LiveOceanLens(renderer, camera);
    let complete,
      outputs = 0;
    renderer.renderAsync = () =>
      new Promise((resolve) => {
        complete = resolve;
      });
    pendingLens.output.renderAsync = async () => {
      outputs++;
    };
    const pendingRender = pendingLens.render();
    pendingLens.dispose();
    assert.equal(pendingLens.resourcesReleased, undefined);
    complete();
    await pendingRender;
    assert.equal(outputs, 0);
    assert.equal(pendingLens.resourcesReleased, true);
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});
