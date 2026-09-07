# Milestone 1 — one jellyfish, local review only

Current review: **[READY FOR VISUAL REVIEW — approved model with restored bioluminescent color](COLOR-PASS.md)**. The [preceding anatomy pass](REFINEMENT.md) records the geometry/motion subsequently approved by Mani. Everything below preserves the initial handoff and its original measurements/limitations for comparison.

## Historical status at fc84892: PARTIAL

The reusable candidate, controlled specimen, opt-in ocean substitution, matched comparisons, and browser recordings are implemented. This is **not a claim that the exceptional-animal visual gate is passed**. Folded arms and coordinated motion are materially different, but close WebGL views still expose thin rim artifacts, transparent overlap boundaries and an overly simple internal junction. Those require another anatomical/transparent-surface pass before calling the animal convincing from every requested angle. No later milestone was started.

## Verified baseline and scope

- Repository: `/home/mani/dev/jellyfish-studio/site`, origin `https://github.com/Denoax/pelagic-jellyfish-webgl.git`.
- Baseline branch `main`, commit `1b5b83e776de1ccad1038a75a98830ac4fc41184`. This contains the working ocean described by both September 7 research documents, which were read before animal edits. No scaffold replacement or branch discrepancy was found.
- Dedicated implementation branch: `milestone-1-jellyfish-specimen`. Rendering source checkpoint: `3bff13872ce10b6e29f99433e082b13120ca1f3e`. Later evidence/documentation commits do not change that animal.
- Pre-existing modified `AGENTS.md` and untracked September 7 research documents were preserved, not staged or committed here. `main` and remote refs were not changed.
- Installed Three.js remains **0.175.0**. React/Vite still host the imperative `three/webgpu` renderer and vendored Aurelia presentation shell. No renderer family change, framework migration, dependency upgrade, purchased asset or external asset implementation.
- Production already uses direct rendering with bloom disabled on both backends. The specimen uses that same path; “normal bloom” and “bloom off” are therefore the same condition. No unvalidated bloom pipeline was enabled for comparison.

## Run and inspect

From the repository:

```sh
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

- Candidate specimen: <http://127.0.0.1:5178/?specimen=1&renderer=webgl&idle=300>
- Baseline specimen: <http://127.0.0.1:5178/?specimen=1&animal=baseline&renderer=webgl&idle=300>
- Candidate in the existing ocean: <http://127.0.0.1:5178/?oceanPreview=1&renderer=webgl&idle=300>
- Default artwork, unchanged: <http://127.0.0.1:5178/>

Specimen-only keys: **1–4** select oblique/side/underside/top; **N/M/F** select near/medium/far; **Space** pauses/resumes; **A** invokes the existing activation method. Actual clicking also works through the existing raycast interface. No panel, buttons or inspection bindings are added to the default artwork.

Append `&hold=9` for a deterministic relaxed-pulse checkpoint, or `&hold=10.06` for contraction. During a held checkpoint the view offsets are in the animal's anatomical frame; during live swimming the camera follows translation without locking to its changing heading. The fixture supplies a repeatable curved route to the **existing** school director, not a second swimming engine. Near views intentionally crop the distal tentacles to inspect tissue. Reload to reset the simulation; `idle=300` only extends the existing idle timeout for inspection.

`import.meta.env.DEV` gates all preview entry points. Production query strings cannot enable the specimen or substitution. Only animal **0** is substituted in the ocean; the other foreground actors and distant school are untouched.

## Implementation and visible changes

| Source | Change |
| --- | --- |
| `src/scene/LivingAppendages.js` | Optional candidate in the existing class. One connected mantle/margin mesh; corrected outward winding; roots sampled from its rolled edge; folded oral-arm grids; restrained internal C-shaped anatomy; transported tube frames; world-relative trailing state under turns; fixed-step strand solves. Existing presence, hover, picking, activation and disposal interfaces remain. |
| `src/scene/anatomy/mantle.js` | Original periodic mantle surface, folded membrane section and bounded timestep helpers. |
| `src/scene/materials/JellyTissue.js` | r175 node material using anatomical optical-depth and viewing-path approximation, broad back-scattering, restrained emission and softer environmental response. This is **not** calibrated subsurface transport or framebuffer refraction. |
| `src/scene/dev/SpecimenPreview.js` | Small inspection fixture attached to the production renderer/director/animal. No separate renderer or animal engine. |
| `src/scene/HeroScene.jsx` | Development-only opt-in wiring, fixed comparison quality, bounded preview clock, and chamber-specific warm-up visibility. No production camera/environment/idle redesign. |
| `tests/jelly-anatomy.test.mjs` | Geometry periodicity/attachments, endpoint shape, outward normals, finite deformation through activation/turns, bounded resume input, and 30/60/120 Hz trajectory checks. |
| `scripts/specimen-evidence.mjs` | Isolated Brave/CDP captures, timestamped live screencast encoding, fixed-checkpoint images, no-capture timing runs, renderer identification and idle/tab-return checks. |
| `scripts/check-default-animal.mjs` | Read-only comparison against the baseline class from Git: 240 frames, eight geometry/material checkpoints. |

The mantle retains 72 radial samples. It gains seven continuation rows while replacing the separate frill. Oral arms deliberately gain cross-section topology: 56 spine stations × 17 transverse samples per arm, rather than 38 × 2. Tentacle radial sides increase from five to six; their strand-point count stays 42. Parallel transport removes the old abrupt reference-axis switch. These are localized topology changes, not a scene-wide density increase.

Core geometry counts, excluding hidden decorative parts and unchanged filaments/particles:

| Part | Baseline triangles | Candidate triangles |
| --- | ---: | ---: |
| Mantle | 4,032 | 5,040, including the joined margin |
| Four oral arms | 296 | 7,040 |
| Tentacles | 9,020 | 10,824 |
| Internal anatomy, per reused geometry | 520 | 576 |

The candidate hides the old concentric crown rings, separate torus rim, additive inner shell, signal pearls and expanding click ring. Existing localized tissue activation remains. The existing point light no longer approaches the skin's last hit position while inactive; it stays inside the body. The image is intentionally less neon, not simply brighter.

## Comparable frames and actual browser motion

All final WebGL comparison frames: **1280 × 900 viewport and drawing buffer, DPR 1, identical quality, bloom off**, seeded fixture, identical held time and camera/animal scale. Check each folder's `matched.json` for the post-capture phase and `matched: true`; the earlier `info.specimen.time` is the warm-up sample, not the captured checkpoint.

| Comparison | Before | After |
| --- | --- | --- |
| Relaxed, oblique | [baseline](evidence/final-baseline/oblique-medium.png) | [candidate](evidence/final-candidate/oblique-medium.png) |
| Close side | [baseline](evidence/final-baseline/side-near.png) | [candidate](evidence/final-candidate/side-near.png) |
| Close underside | [baseline](evidence/final-baseline/underside-near.png) | [candidate](evidence/final-candidate/underside-near.png) |
| Close top | [baseline](evidence/final-baseline/top-near.png) | [candidate](evidence/final-candidate/top-near.png) |
| Distant | [baseline](evidence/final-baseline/oblique-far.png) | [candidate](evidence/final-candidate/oblique-far.png) |
| Contracted, oblique | [baseline](evidence/contracted-baseline/oblique-medium.png) | [candidate](evidence/contracted-candidate/oblique-medium.png) |

Motion files are actual live browser recordings, not generated images or animated stills:

- [Unmodified production baseline, captured before animal edits](evidence/production-baseline/motion.mp4).
- [Original-animal specimen baseline](evidence/specimen-baseline/motion.mp4).
- [Candidate: repeated pulses, close view, actual click, recovery and gradual turn](evidence/specimen-candidate-tour/motion.mp4).
- [Same candidate in the existing ocean](evidence/ocean-candidate-tour/motion.mp4).

The recording tool retains CDP frame timestamps and encodes variable frame durations. Recording changes workload and is **not** used as a performance benchmark. Browser screencast output may be compositor-scaled; PNG comparison dimensions and drawing-buffer dimensions remain explicitly recorded. Initial production footage used a smaller compositor output and is not a pixel-matched comparison clip. Raw JPEG frame sequences are retained locally but ignored by Git.

Verified encoded media: pre-edit production baseline **18.04 s, 780 × 500**; final original-animal specimen **44.16 s, 1280 × 900**; final candidate specimen **44.16 s, 1280 × 900**; ocean candidate **36.56 s, 1254 × 900**. Both specimen tours use the final fixture; their wall-clock phase varies slightly under capture workload, so use the held PNG pairs for exact phase comparisons. The ocean clip uses the final animal geometry/material/motion, captured before the subsequent chamber-only warm-up guard.

The ocean recording covers the opening and the existing first approach at approximately 7% scroll, with overlapping particles/animals and click activation of actor 0. It does not claim to validate every later close pass involving other foreground actors. Those actors are not migrated by this milestone.

## Verification

- Baseline `npm run build`: passed, with pre-existing large-chunk warning. Existing worker/particle tests: **7/7 passed**. There is no general `npm test` script; this is not a claim that a missing suite passed.
- Candidate `VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run build`: passed. Combined existing and focused tests: **12/12 passed**. Worker, hosting packaging and deployment configuration were not edited.
- Default-animal parity: `node scripts/check-default-animal.mjs` passed. Geometry buffers and sampled material responses matched the baseline exactly at eight checkpoints across 240 frames, including activation and movement. The production bundle contains neither `SpecimenPreview` nor `__SPECIMEN__`.
- Local production smoke: the built GitHub Pages-path app rendered with `?specimen=1` present, but exposed no specimen state or substitution controls; browser errors were empty. [Evidence](evidence/production-guard/capture.json). The first attempt used a preview server without the matching `VITE_BASE_PATH`, which returned HTML for prefixed asset URLs and failed readiness. Restarting only that local test server with the correct base resolved it.
- WebGL 2: actual NVIDIA backend, specimen and ocean rendered; raycast click increased the activation counter and targeted actor 0. Browser error logs for accepted WebGL captures are empty.
- Idle entry and Escape return: [lifecycle evidence](evidence/ocean-lifecycle/lifecycle.json); active `true → false`, then activation counter `0 → 1`.
- Ordinary tab switch: the browser reported `document.visibilityState === 'hidden'` during an approximately 1.8-second background interval. Preview simulation advanced only about 0.107 seconds across the transition and short resumed observation, rather than jumping the whole hidden duration. The stronger CDP freeze probe discarded usable page state; it is retained separately as an unsuccessful probe, not represented as a passing test.
- WebGPU: **actual WebGPU backend, but Google SwiftShader software adapter**, not the RTX 4070. The isolated candidate reached the same held checkpoint with **zero console errors**. The baseline emitted repeated r175 `copyFramebufferToTexture` `rgba16float`/`rgba8unorm` mismatch errors. Initial candidate chamber warm-up also exposed those errors through unrelated baseline actors; isolating actual chamber warm-up removed them. See [candidate](evidence/webgpu-candidate/matched.json) and [baseline](evidence/webgpu-baseline/matched.json). The unchanged ocean's other transmission materials remain a separate compatibility risk; no renderer upgrade or scene-wide material replacement was attempted.
- Explicit software-WebGPU ocean probe: **FAILED clean-render validation**, with 50 logged errors and very slow rendering. [Probe and actual adapter](evidence/webgpu-ocean/capture.json). It reproduced the transmission-format errors already seen in the original animal. This short three-second capture is compatibility evidence, not a valid warmed performance benchmark or clean full-ocean approval.
- Physical-device WebGPU, Safari, Firefox, integrated-GPU laptops, Android/iOS, thermal runs, and a hardware GPU timestamp benchmark: **NOT TESTED**. Software WebGPU and viewport emulation are not physical-device validation.

## Performance

Test machine: Intel Core i5-14600K, 62 GiB reported system RAM, NVIDIA RTX 4070 12 GiB, driver 610.57.04. Brave Flatpak **1.94.119**, Chromium **152**. Actual WebGL renderer string: `ANGLE (NVIDIA Corporation, NVIDIA GeForce RTX 4070/PCIe/SSE2, OpenGL ES 3.2)`.

Each run warms for six seconds after scene readiness, then records thirty seconds without screenshots/video capture. Viewport/drawing buffer 1280 × 900; DPR 1; fixed quality; no adaptive reduction; production bloom remains off. Only one QA page renders during a timing run. This is the user's working PC, not an isolated device laboratory.

Final measured values are recorded in `evidence/perf-*/performance.json`. The two interval sets distinguish browser rAF cadence from completion-to-completion intervals around the existing asynchronous scene render call. **Neither is a GPU timing measurement**, and a 60 Hz cadence ceiling cannot reveal spare GPU capacity.

| Scene / animal | rAF median / p95 (ms) | Render-completion median / p95 (ms) | Maximum render interval (ms) | Intervals over 50 ms |
| --- | ---: | ---: | ---: | ---: |
| Specimen baseline | 16.7 / 16.7 | 16.7 / 19.1 | 27.5 | 0 |
| Specimen candidate | 16.7 / 16.7 | 16.7 / 19.5 | 35.4 | 0 |
| Ocean baseline | 16.7 / 16.8 | 16.8 / 20.3 | 28.4 | 0 |
| Ocean candidate | 16.7 / 16.7 | 16.6 / 19.1 | 27.4 | 0 |

These single paired runs show no sustained cadence regression at this resolution. The specimen's render-completion p95 rose **0.4 ms** and its largest interval rose **7.9 ms**. The ocean's lower candidate p95 is not evidence of a reliable optimization: scheduling noise and different transparent geometry both affect these measurements. Geometry cost increased substantially in the oral arms, while hidden decorative meshes and transmission were removed from the candidate. No quality or resolution reduction concealed that tradeoff. Longer repeated runs and constrained hardware remain necessary before broader rollout.

Reproduce locally with the dev server already running; run each browser check separately (the evidence script uses a single CDP port):

```sh
node --test tests/*.test.mjs
node scripts/check-default-animal.mjs
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run build
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?specimen=1&renderer=webgl&idle=300&hold=9' repeat-candidate matched
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?specimen=1&renderer=webgl&idle=300' repeat-candidate-perf perf 30
```

Add `&animal=baseline` for the corresponding baseline; replace `specimen=1` with `oceanPreview=1` for ocean timing. Use `tour 44` instead of `perf 30` to record a live specimen tour. These commands write a new evidence folder, not application source. The browser wrapper assumes the existing local Brave/host-spawn setup. For production smoke, serve the build with `VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run preview -- --host 127.0.0.1 --port 5179 --strictPort`.

## Remaining visual defects and limitations

1. **Close WebGL rim artifacts remain.** The connected topology and attached roots are better, but a faint dotted boundary is still visible in some close views. This is why the package is PARTIAL rather than claiming the every-angle visual gate has passed.
2. **Membrane overlap and insertion are still simplified.** The folded sheets now have a genuine cross-section, but four independently constrained sheets do not form a fully continuous common oral trunk, and there is no sheet-to-sheet self-collision. Abrupt turns can expose overlaps. An original authored mesh option should provide a joined manubrium/four-arm insertion, rolled membrane thickness, non-self-intersecting rest folds, explicit thickness/UV data and deformation weights mapped to the existing four simulated spines. It should preserve the current pulse/activation contract, not include a second animation engine. This is a specific authoring requirement, not a claim that procedural anatomy is fundamentally impossible or that an asset purchase is required.
3. **The tissue remains a stylized approximation.** The bell is too opaque/matte at some angles and the four internal shapes still look manufactured in the close underside view. Removing construction lines improved coherence but did not finish the living-tissue target. There is no calibrated optical model, scene-image refraction, or scientifically exact species reconstruction. Long oral arms plus the C-shaped internal pattern are not presented as exact moon-jelly anatomy.
4. **Environment limitations deliberately remain:** conspicuous purple flecks, unlike-looking distant animals, existing camera framing/reversals, floor/water quality and idle optics. None was redesigned to flatter the specimen.
5. **Compatibility boundary:** software WebGPU isolated-specimen success is narrower than a clean hardware-WebGPU full-ocean result. The baseline transmission issue is documented separately, not hidden by switching renderer families or lowering resolution.

## Reference comparison and provenance

A fresh [Medusae capture](evidence/reference-medusae.png) was inspected alongside the baseline. Its useful principle is a coherent mantle/interior/appendage silhouette; its code and assets were not copied. [Noomo's author-written case study](https://noomoagency.com/work/noomo-labs-the-jellyfish) informed the emphasis on modeling, material and motion around one object, not additional interface controls. The new mantle, folded sections and node material are original repository code. Existing vendored MIT attribution remains untouched.

## Publication boundary

No merge, push, deployment command or workflow trigger was performed. The default local artwork retains the original animals. GitHub Pages and the live deployment were not changed. Milestone 2/3 proof scenes, shared wake, scene-wide LOD migration, camera redesign, water, floor and idle-glass implementation remain outside this change.
