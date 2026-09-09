# M6.1 — sanctuary visual refinement

Status: **READY FOR VISUAL REVIEW** — local candidate, not user approval.

- Repository: `Denoax/pelagic-jellyfish-webgl`.
- Starting M6: `9b33b64357fa5c1e6c99d0868c7dcf6f4af55dcd`.
- Approved pre-M6: `aef830b1619eef71e36be4e8b4cd8b924fb1bd8a`.
- Runtime/evidence SHA: `3697dfc436b3a7ec1c4bdcb81b487f5cb0c5e56f`.
- Branch: `milestone-6-1-sanctuary-refinement`.
- Worktree: `/home/mani/dev/jellyfish-studio/m6-1-sanctuary`.
- Public main inspected and rechecked: `a2ed3bc89c700ba5c792ecac19747939e9f09b8d`.
  It is not the local M6 starting point. Pages was not modified.

The handoff commit also contains documentation and reproducible capture helpers;
`git rev-parse HEAD` gives its complete SHA. No runtime edit followed the SHA
used for the final benchmark and reviewed evidence above.

## Local review

Open <http://127.0.0.1:5201/?renderer=webgl&idle=300>. Use the existing View
control, descend in Drift or Deep, and inspect the chimney in Explore. The longer
idle delay is for review only; no idle implementation or default changed.

To restart the local server:

```sh
cd /home/mani/dev/jellyfish-studio/m6-1-sanctuary
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
node scripts/m61-preview.mjs
```

Dependencies reuse the existing installation; Three remains **0.175.0**.
Actual validation used **NVIDIA RTX 4070 WebGL2**, Brave Chromium 152.0.7977.76.

## What changed

1. **Granular discharge:** 768 fixed-step carrier packets present 16 seeded
   grains each: 12,288 charcoal micrograins in one instanced draw. Narrow fast
   source, nonlinear entrainment, coherent eddies, increasing current influence
   and gradual dispersion replace large soft smoke discs. Grain size does not
   inflate with plume height. Normal alpha only. Existing water attenuation is
   evaluated at the actual grain location, fixing the custom-vertex fog origin.
2. **Live thermal shimmer:** one orifice and two clear diffuse seeps use small
   world-space density domains in the existing M3 compositor. The actual moving
   animal/particles/geology in scene color bend through them. The same color,
   depth, render target and output are reused: **zero extra ocean renders or
   targets**, no second renderer. One existing output draw stays active when
   thermal regions need it even without a hero bubble. Rising cells also follow
   a bounded, smoothed current sample. Only the third diffuse outlet emits sparse
   particles (16); local entrained snow remains 80.
3. **Geological hierarchy:** source distance, height, orientation and cavity
   proxies organize dark sulfide, sparse pale active crust and restrained older
   oxidation. Secondary meso breakup and micro relief use the existing licensed
   CC0 Poly Haven Rock 07 scan's luminance, not its terrestrial colors. One shared
   texture, loaded before prewarm. Ring rhythm is less regular; accretions sit
   more deeply in their host, without new major structures or triangle growth.
4. **Portrait framing:** primary complex moves **X −4.6 → −2.4** in the same
   world. Z −24, height 12, floor **Y −15**, basalt shelves and all cameras stay
   unchanged. Main crown remains visible off-centre in 390×844 portrait.

The existing pooled jellyfish light, its ownership, strength, falloff and
activation gain are unchanged. It reveals local minerals; the whole basin and
plume are not brightened. The Product Design audit grounded these changes in
fresh browser comparisons; the plume passed its visual gate before mineral edits.

## Evidence and measured cost

See [validation, complete seven-scene benchmark and evidence index](VALIDATION.md)
and [rendering/material architecture](ARCHITECTURE.md).

Evidence root: `/home/mani/dev/jellyfish-studio/m6-1-evidence/`.
Large original screencasts and raw frames are local review artifacts outside Git.
All videos are real browser motion, not generated or reconstructed imagery.

- `desktop-reviewed/motion.mp4`: Drift/Deep/Documentary, reverse/re-entry,
  close source, Explore orbit, diffuse outlets and narrower resize.
- `portrait-reviewed/motion.mp4`: 390×844 Drift/Deep descent and return.
- `shimmer-reviewed-motion/motion.mp4`: moving background with refraction off/on.
- `current-response/motion.mp4`: bounded local flow reversal and restoration of
  ordinary M2 flow; explicitly a development vent-sampler fixture.
- `matched-baseline/` versus `matched-reviewed-fresh/`: equivalent seeded hold-14
  ocean/camera states. `detail-matched-before/` versus `detail-reviewed/`:
  source, entrainment, dispersion, mineral and deposit close-ups.

At identical 1280×900/DPR1/quality/bloom settings, final median intervals are
15.7–16.7 ms; p95 18.7–20.4 ms; maximum 33.0 ms, **zero >50 ms** in seven
30-second runs. Baseline median 16.4–16.7, p95 17.8–20.3, maximum 28.4 ms.
Sanctuary CPU median increases **0.1 → 0.3 ms**. These are render-completion
intervals and CPU samples, **not GPU timings**. Quality was not lowered.

## Verification and limits

Production build passes (existing large-chunk warning). All **86/86** Node tests
pass (baseline 82/82); approved-motion and default-animal parity both pass.
Use `node --test tests/*.test.mjs`, `node scripts/check-approved-motion.mjs` and
`node scripts/check-default-animal.mjs`; there is no invented npm test suite.
Build: `VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build`.

Opaque-depth screen-space refraction cannot perfectly sort flattened transparent
layers or recover off-screen color. Extreme close-up resolves billboard grains.
Scanned luminance is a microheight proxy, not measured sulfide displacement.
Geology deliberately remains very dark without nearby animal illumination.
One repeated-hard-reload headless capture hung; individual fresh-browser review
cases were used for the final comparisons. Its cause remains unestablished.
Physical mobile, non-NVIDIA GPUs and WebGPU were **NOT TESTED** in this pass;
the known full-ocean WebGPU problem is not claimed fixed.

The pre-existing **cyan tissue disappears after idle return** defect was
reproduced and remains unmodified. It is not hidden by passing functional idle
checks. No M1–M5.2 animal/current/camera/View/scroll/idle redesign; only the
authorized M3 compositing hook changed within those established systems.

Nothing pushed, merged, deployed or changed on Pages. No M7 or later work begun.

## Runtime files

- `src/scene/sanctuary/VentDynamics.js`
- `src/scene/sanctuary/VentParticles.js`
- `src/scene/sanctuary/ThermalShimmer.js` (new)
- `src/scene/sanctuary/Sanctuary.js`
- `src/scene/sanctuary/materials.js`
- `src/scene/sanctuary/geology.js`
- `src/scene/glass/LiveOceanLens.js` (shared-output hook)
- `src/scene/PelagicEnvironment.js` (await scan readiness)
- `src/scene/HeroScene.jsx` (wire shared resources and DEV-only review probes)

Other changes are scoped tests, browser/evidence utilities, review documentation,
the current AGENTS scope note and ignoring the existing node_modules symlink.
