# Reproducibility

Pelagic uses Node.js 24, the committed `package-lock.json`, Three.js 0.175.0, React 19.2.0, and Vite 6.4.2.

## Build and test

```sh
npm ci
npm run build
node --test tests/*.test.mjs
npm run test:sites
```

The build must produce `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`. GitHub Pages sets `VITE_BASE_PATH=/pelagic-jellyfish-webgl/`.

Some parity tests compare current source with retained Git commits, so run them from a full clone rather than a source archive without history.

## Visual verification

Visual changes require actual browser evidence at the same scene state, viewport, device-pixel ratio, quality settings, and renderer backend. Inspect still frames and normal-speed motion. A successful build does not establish appearance, interaction quality, or animation continuity.

Record at minimum:

- browser and graphics backend;
- viewport and drawing-buffer dimensions;
- camera/view and journey progress;
- quality and reduced-motion state;
- console errors and graphics recovery;
- the exact commit tested.

## Performance measurements

Measure without simultaneous capture, builds, or other GPU workloads. Keep scene state, resolution, quality, warmup, and duration identical between candidates. Report frame-interval distributions and stalls; frame intervals are not GPU timings. Preserve adverse samples and avoid universal claims from a single machine.

## Boundaries

The primary validated path is hardware WebGL2. Browser viewport emulation is not physical-device testing. The procedural motion and optics are deterministic enough for contract testing, but rendered pixels can vary by GPU, driver, and browser.
