# Milestone 2 — one connected ocean interaction

Status: **READY FOR VISUAL REVIEW**. Mani subsequently authorized updating the live Pages website separately from visual approval; see [publication follow-up](PUBLISHING.md). The measurements below document the original review gate, not a claim that publishing constitutes approval.

The approved animal is intact. Its surrounding violet star-like cloud is now quieter suspended material: pulse-driven wakes linger behind it, and clicking briefly reveals a patch of nearby water before that patch settles. The strongest visual evidence is the full-size motion, not a still of the peak response.

## Verified baseline and scope

- Repository: `Denoax/pelagic-jellyfish-webgl`, `/home/mani/dev/jellyfish-studio/site`.
- Origin: `https://github.com/Denoax/pelagic-jellyfish-webgl.git`.
- Approved baseline: **`515fa71d90f423ac97747cb7a60d1d84d446d13b`**.
- Branch created directly from that commit: **`milestone-2-connected-ocean`**.
- Runtime implementation commit: **`f373d28`**. Later commits add QA tooling and evidence only.
- Existing dirty root `AGENTS.md` and untracked September 7 research documents were preserved and not staged. The checkout contained the actual ocean, approved animal, development fixture and prior browser evidence—not a scaffold.
- Three.js remains **0.175.0**. Existing imperative `three/webgpu` WebGPURenderer, actually running its **WebGL 2 backend on NVIDIA** in the captures. No renderer migration, upgrade, assets, new dependencies, fluid solver, camera, seabed or idle-glass changes.

The implementation was initially kept local under the milestone's explicit no-push restriction. Mani then authorized pushing review branches, followed by an explicit request to update the Pages website too. The [publication follow-up](PUBLISHING.md) supersedes the original no-deployment boundary, not the visual review gate or milestone scope.

## Preview

The local server is running on port 5178. Open:

- [Connected ocean](http://127.0.0.1:5178/?oceanPreview=1&connectedOcean=1&renderer=webgl) — approved M1 foreground animal plus M2 water response.
- [Approved M1 ocean comparison](http://127.0.0.1:5178/?oceanPreview=1&renderer=webgl) — same approved foreground animal, original particles/interaction surroundings.
- [Unchanged default](http://127.0.0.1:5178/) — no preview switches.

Click the foreground bell, wait for the response to settle, then scroll normally. No new controls appear in the artwork. Add `&idle=300` for an uninterrupted observation, or `&idle=4` to exercise the existing idle screen. `connectedOcean=1` is honored **only in development**, not in a production build.

If restarting the local server is needed:

```sh
cd /home/mani/dev/jellyfish-studio/site
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

## Reference comparison and mechanism

Read the approved September 7 fresh review and implementation blueprint before this work. The relevant baseline gap was several unrelated particle motions: global star-like plankton, translated snow layers, a current veil, and independently wandering violet flecks. The click illuminated the animal and scheduled up to three neighbor callbacks, but did not visibly travel through shared water.

A fresh local capture of [Bruno Imbrizi's Interactive Particles](https://tympanus.net/Tutorials/InteractiveParticles/) shows soft billboards with strong density/size hierarchy. His [primary implementation article](https://tympanus.net/codrops/2019/01/17/interactive-particles-with-three-js/) describes instancing and persistent, eased interaction history. The useful principle here is **spatial memory plus gradual recovery**, not his portrait composition or a screen-space touch texture. The reference capture is retained locally in `evidence/reference-imbrizi/`; it is not redistributed as this project's art or used as a runtime asset. No reference code/assets were copied. Our field is original, world-space CPU sampling because the preview has fewer than 2,000 particulate billboards rather than tens of thousands.

## Runtime changes / architecture

| File | Responsibility |
| --- | --- |
| `src/scene/ocean/CurrentField.js` | Smooth deterministic analytic ambient flow; bounded localized vortices; fixed-capacity wake and activation records; spatial arrival, advection and decay. No rendering dependency. |
| `src/scene/ocean/OceanSnow.js` | Three existing soft-billboard material consumers at distinct depths. Persistent world positions, real parallax, hidden boundary recycling, smooth rebirth. |
| `src/scene/ocean/ConnectedOcean.js` | Observes existing animal pose/pulse/speed; emits wakes; routes real clicks into water; one conditional faint neighbor echo; owns preview cleanup. |
| `src/scene/FreeParticleDrift.js` | Optional current-field consumer for the existing world-space flecks. Null field preserves exact original behavior. |
| `src/scene/HeroScene.jsx` | DEV-only import/switch and small lifecycle/click hooks. No new renderer or scene engine. |
| `src/scene/dev/SpecimenPreview.js` | Adds a held-time QA checkpoint to the existing fixture; no public UI or camera changes. |

The field is reusable for future consumers, but this milestone deliberately uses **one-way coupling from the animal to the water**. Approved tentacle physics still receives its existing current input; it is not silently retuned. Vent plumes, distant-school steering and seabed particulate are not migrated.

### Ordinary water and swimming

- 64 sparse foreground, 320 dim mid-distance, 400 restrained far particles on desktop: **784 ambient billboards**, not an increased population.
- Existing four hero fleck pools render **300 each instead of 900**: 1,200 local flecks instead of 3,600. Their new births alone use the animal transform; existing particles retain independent world position and velocity. Lifetime is 7–11 seconds with eased births/deaths.
- The preview hides the overlapping legacy plankton, original three snow layers and current veil. Distant animals and geology remain intact.
- A rising existing primary-thrust phase, with actual movement and valid presence, creates a wake near the animal's rear. It advects downstream, curls nearby particulate and dies after **5.8 seconds**. No geometry/sphere/halo is attached to the animal. High-speed discontinuities are rejected instead of producing giant wakes.
- The shared field is bounded at **0.65 world units/second**. A 60 Hz bounded environmental step avoids unbounded catch-up. This is an artistic flow field, not a claim of physically correct incompressible fluid dynamics.

### One click

1. Existing raycast and approved `tissue.activate(hit.point)` run unchanged.
2. A fixed world-space activation record begins at the actual hit. Nearby particulate becomes locally more visible after a soft arrival delay; a broad irregular window avoids a hard expanding sphere.
3. Small outward/rotational current offsets disturb the same particles. Light is per-particle visibility, not a fullscreen flash or new lighting/bloom pass.
4. At most **one** eligible animal within 5.5 world units may receive strength **0.11** after propagation delay. No recursive activation, no timers, no duplicate pending echo on that neighbor; a neighbor that swims out of range is skipped.
5. The environmental event expires after **6.4 seconds**. Repeated input has a per-source 0.8-second cooldown and bounded pools of 8 activation / 32 wake records. Direct animal clicks remain responsive even when the environmental cooldown rejects a duplicate.

## Visual evidence

All showcase media is actual browser output, not generated imagery. The clips use real mouse input and CDP screencast timestamps, encoded as variable-frame-rate MP4. Capture overhead is not used for performance claims.

- [Before implementation: 36-second baseline browser clip](evidence/baseline-ocean/motion.mp4).
- [Main connected-interaction clip](evidence/connected-ocean-final/motion.mp4): 48.92 seconds, calm opening → click at about 6 seconds → tissue → surrounding flecks → settled water → existing close pass → four repeated clicks → second encounter with near/far animals → return.
- [Same interaction tour with approved M1 / old environment](evidence/approved-ocean-final/motion.mp4).
- [Natural nearby-animal encounter](evidence/connected-neighbors/motion.mp4): 40.36-second real-browser clip; no staged animal/camera transforms.
- [Main clip's recorded click/state checkpoints](evidence/connected-ocean-final/interaction.json).

Matched stills use seeded initial state, fixed **1280 × 900** viewport/drawing buffer, DPR 1, identical quality and normal bloom-off path. The existing ocean camera is not replaced. Time is held at 9 seconds, a real mouse click occurs, then both variants advance through the same checkpoints. Camera and school state comparisons are recorded separately from visual judgments.

| State | Approved M1 ocean | Connected candidate |
| --- | --- | --- |
| Calm / t=9 | [before](evidence/baseline-matched-final/time-9.png) | [after](evidence/candidate-matched-final/time-9.png) |
| Tissue / t=9.8 | [before](evidence/baseline-matched-final/time-9.8.png) | [after](evidence/candidate-matched-final/time-9.8.png) |
| Surrounding response / t=11 | [before](evidence/baseline-matched-final/time-11.png) | [after](evidence/candidate-matched-final/time-11.png) |
| Downstream / t=13 | [before](evidence/baseline-matched-final/time-13.png) | [after](evidence/candidate-matched-final/time-13.png) |
| Settled / t=17 | [before](evidence/baseline-matched-final/time-17.png) | [after](evidence/candidate-matched-final/time-17.png) |

## Validation and performance

Before edits: **18/18 existing tests passed**, both existing parity scripts passed, and the production build passed. There is no generic `npm test` script; that absence is not counted as a pass.

After implementation: **28/28 tests passed**, including current bounds/determinism, wake drift/decay, propagation lifetime, repeated activation cleanup, 30/60/120 Hz sampling, suspension rejection, world-space recycling, conditional echo cleanup, approved animal parity, and exact default particle buffers. Existing anatomy/activation/asset packaging tests also pass.

```sh
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run build
```

The original approved-motion check still compares the earlier geometry approval `c4eaa35` (720 frames / 24 checkpoints). The new M2 tests additionally pin the final **515fa71** animal/anatomy/material/swim/camera source and compare candidate-enabled vs disabled geometry, material values and direct activation. The default-animal check against original production `1b5b83e` also passes. Five browser checkpoints have **exactly identical recorded camera, school and direct activation states** between the M1 and M2 previews.

Production build passes, with the pre-existing npm `tmp` configuration and large-chunk warnings. No connected-ocean module is emitted into the production build. The dormant optional particle interface adds about 0.7 kB raw to the scene bundle; default buffers remain byte-for-byte equal over 600 checked frames. No quality setting was lowered.

### Capture-free timing protocol

Hardware: Intel i5-14600K, 62 GiB RAM, NVIDIA RTX 4070 12 GiB. Browser: Flatpak Brave 1.94.119 / Chromium **152.0.7977.76**, headless CDP, ANGLE **NVIDIA WebGL 2**, not software emulation. Each run has a **1280 × 900 viewport and actual ocean drawing buffer, DPR 1**, identical fixed preview quality, normal production **bloom off**, 6-second post-ready warm-up and 30-second measurement. No screenshots/video during timing; alternate approved/candidate and repeat. This is desktop browser validation, not physical-mobile testing.

Report completed-render **frame intervals**, measured at the end of the existing renderer update. These are **not GPU timings**. rAF callback intervals are also saved separately; their stable 16.7 ms cadence alone would hide variation in render completion.

| Run | Median render interval | p95 | Maximum | Intervals >50 ms |
| --- | ---: | ---: | ---: | ---: |
| [Original approved checkout, before edits](evidence/perf-baseline/performance.json) | 16.7 ms | 18.9 ms | 25.2 ms | 0 |
| [Approved M1 / final comparison A](evidence/perf-approved-final/performance.json) | 16.6 ms | 18.2 ms | 22.1 ms | 0 |
| [Connected M2 / comparison A](evidence/perf-connected-final/performance.json) | 16.7 ms | 19.5 ms | 30.9 ms | 0 |
| [Approved M1 / repeat B](evidence/perf-approved-repeat/performance.json) | 16.6 ms | 18.9 ms | 34.2 ms | 0 |
| [Connected M2 / repeat B](evidence/perf-connected-repeat/performance.json) | 16.6 ms | 20.2 ms | 35.6 ms | 0 |

**Measured cost:** median essentially unchanged; p95 **+1.3 ms** in both alternating comparisons (roughly 7%). The connected controller's directly instrumented CPU work measured median **0.2 ms**, p95 **0.3 / 0.4 ms**. That timer covers field updates, ambient snow and echo dispatch, **not** the existing fleck consumer loop, renderer submission or GPU execution; it is not total feature cost. Whole-scene frame-interval comparisons above include the result. All runs retain ~16.7 ms rAF callback cadence. These desktop results support a restrained cost, not a universal 60 fps or GPU-speedup claim.

### Runtime recovery

[Browser lifecycle evidence](evidence/connected-lifecycle/lifecycle.json): idle active before Escape, inactive afterward, then a successful real click (count 0 → 1). The tab was actually `hidden` for 1.8 seconds. Ocean simulation advanced only ~0.117 seconds across surrounding control/return frames rather than catching up 1.8 seconds, and the local event remained bounded. No browser errors. The existing 2.6-second idle exit was allowed to finish before clicking.

The main clip has five successful real clicks; its final repeated-input checkpoint has **zero active environmental activations and zero pending echoes**. Ordinary swimming wakes remain, as intended.

[Natural pair verification](evidence/connected-neighbors/social.json): the actual existing aggregation scene produced two real clicks. One scheduled neighbor left the local area and was skipped; the second encounter dispatched **one** faint echo. The final state has **zero activations / zero pending echoes / one cumulative echo**. This was observed in the real ocean, not only asserted by a unit test. Existing older animals enter this part of the journey; M1's one-animal preview has deliberately not been expanded into a population migration.

[180.25-second observation](evidence/connected-long/observation.json): 12/12 rapid real clicks reached the animal; cooldown accepted two environmental events. The run followed existing 28%, 52%, 88% and surface camera positions. Sampled peaks were **5 wakes / 2 activations**, well below fixed capacities. It ended with **1 ordinary wake / 0 activations / 0 pending echoes**, no browser errors and no stuck response. Two scheduled nearby-pair checks found no eligible visible pair at those exact instants; they did not manufacture one. This is a three-minute recovery check, not a thermal endurance benchmark.

### Reproducing browser evidence

Use one browser capture job at a time (the existing Brave CDP helper uses port 9279). For example:

```sh
export EVIDENCE_ROOT=docs/implementation/milestone-2/evidence
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?oceanPreview=1&connectedOcean=1&renderer=webgl&idle=300' new-motion connected-tour 48
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?oceanPreview=1&connectedOcean=1&renderer=webgl&idle=300&hold=9' new-matched ocean-matched
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?oceanPreview=1&connectedOcean=1&renderer=webgl&idle=300' new-perf perf 30
```

Remove only `connectedOcean=1` for the approved-M1 comparison. Do not remove `oceanPreview=1`, which would select the older default public animal instead. Raw capture JPEGs and the external reference are retained locally but ignored by Git; actual before/after PNGs, MP4 clips and measurement JSON are the review deliverables.

## Remaining compromises / environments

- This is intentionally a restrained response. At small display sizes the wake is subtler than the animal's tissue response; judge the full-size motion clip, not only a thumbnail.
- The main opening clip has no eligible neighboring full animal within the local radius. It does **not** fake a distant echo. The separate natural-pair clip demonstrates the conditional neighbor response. Neither clip should imply that every click lights another organism.
- Camera-dependent billboard softness and additive transparency remain existing approximations; no volumetric scattering, fluid mass conservation, particle collision or physical device-wide performance guarantee is claimed.
- Distant low-detail animals, deep benthic snow and the existing camera composition are deliberately not rebuilt to flatter this interaction.
- Full-ocean WebGPU retains the [previously documented legacy transmission render-target issue](../milestone-1/COLOR-PASS.md). It is separate from this field and **NOT TESTED** anew here. The previously available WebGPU adapter was software SwiftShader, not native NVIDIA validation. Physical mobile, Safari, Firefox, other GPUs, high-refresh-rate physical displays, device loss and long thermal/battery runs are **NOT TESTED**. The headless compositor's ~60 Hz cadence is not a maximum-throughput benchmark.
- At the original review gate, default production behavior and live deployment were unchanged. The later [publication instruction](PUBLISHING.md) authorizes enabling this same implementation on Pages. Visual approval and later milestones remain separate decisions.
