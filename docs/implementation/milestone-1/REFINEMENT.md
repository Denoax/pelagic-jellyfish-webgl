# Milestone 1 — animal-quality refinement

## Status: READY FOR VISUAL REVIEW

The September 7 continuation addresses the animal only. Final visual evidence is from runtime commit **`bb61d68c737f677551817358ffe2f603d41443df`**. The candidate now passes my animal-quality self-review across the requested checkpoints and motion, and is ready for **Mani's visual judgment**, not approved for publication. The earlier [PARTIAL report](README.md) remains a historical record, not the current animal description.

Verified repository: `/home/mani/dev/jellyfish-studio/site`, origin `https://github.com/Denoax/pelagic-jellyfish-webgl.git`, branch **`milestone-1-jellyfish-specimen`**. This pass started at **`fc8489285c633b5aeab95e71ccccb9dbaeb7eb80`**. Original production baseline remains `1b5b83e776de1ccad1038a75a98830ac4fc41184`. No checkout discrepancy, branch switch, stash, reset or discarded user work. The pre-existing root `AGENTS.md` edit and untracked September 7 research remain outside these commits.

Three.js **0.175.0**, the existing imperative `three/webgpu` renderer, school director, appendage state, React/Vite shell and opt-in development fixture are unchanged. No new dependencies or purchased/copied assets.

## Defects corrected

### Continuous mantle, not an artifact-covering effect

The black dotted rim was a **shader-domain defect**, not a gap to cover with another mesh. The margin's interpolated constant UV could exceed 1 by a floating-point ULP. Raising `1-v` to a fractional power then has an invalid negative operand. Clamping the UV and power base removed the black bands with the original geometry, lighting and bloom settings unchanged. Compare [before](evidence/refinement-before/side-near.png) with the [isolated clamp-only fix](evidence/refinement-rim-clamp/side-near.png).

Separate close-up defects also warranted actual topology work:

- Split the periodic UV seam while explicitly matching its positions and normals. A triangle no longer interpolates nearly an entire texture turn across the last sector.
- Share one apex vertex across the cap triangles, removing 72 zero-area triangles. Correct the analytic pole tangent so the cap is soft rather than subtly conical.
- Remove the candidate's old per-sector blue vertex pigment. Multiplying that pigment by the new tissue color caused a radial construction fan and double tint. The node material now owns pigmentation.
- Taper the tentacles into their existing mantle insertions rather than exposing blunt tube cuts. Bell radial sampling remains 72; the folded-arm grid remains 56 × 17. This pass does not indiscriminately increase surface density.

### Folded arms and a common internal attachment

The four arms retain a genuinely folded cross-section. Their former imposed longitudinal twist was replaced by a transported transverse frame, a narrow insertion, accordion-like pleats and restrained free-edge motion. The fold phase now follows the **existing swim cycle**.

A small contact constraint operates on the existing four simulated spines, including neighboring longitudinal stations. Corrections apply equally to position and Verlet history so separation does not inject propulsion. The roots stay fixed. This is not a second swimming or cloth engine.

Four open manufactured-looking torus parts were replaced by **one closed four-lobed gastric body**, within the existing organ geometry/group lifecycle. All four roots insert into its lower surface as it contracts with the bell. Automated checks bound the sampled insertion gap below 0.006 world units through the tested phases. The internal body remains deliberately stylized, not a species-accurate anatomical claim.

### Living-tissue response, without more bloom

The r175-compatible physical node material uses anatomical optical thickness, viewing-path absorption, restrained radial canal variation, soft back-scattering and a broad analytic water-light reflection. The latter respects the renderer's separate irradiance/radiance contexts, so the highlight moves as the animal turns rather than behaving as painted color. Exact node APIs were checked against the installed package.

Thin tissue is more transparent, the thicker crown retains volume, and internal anatomy is visible from above and oblique views. The internal body and membranes have restrained cool-violet separation. Global emission and opacity were **not increased** to sell the effect. Production bloom is already disabled; normal production and bloom-off inspection are the same path.

This is a thickness-aware tissue approximation, **not** framebuffer refraction or calibrated subsurface transport. No transmission dependency, renderer migration or extra post-processing was introduced.

### Activation caught during motion review

The intermediate recording exposed a detached glow sphere and an excessive filament kick during activation. The sphere is now hidden for this candidate; the existing localized activation signal travels on the mantle itself. Candidate recoil is restrained while retaining the existing raycast/activation interface and return to ordinary swimming. The original animals keep their original behavior.

## Matched visual evidence

All matched PNGs use a seeded fixture, identical camera offsets, scale, animation checkpoint, quality settings, **1280 × 900 viewport and drawing buffer, DPR 1**, and normal production rendering with bloom off. The recorded `matched.json` **`state`** is the capture checkpoint; `info.specimen.time` is the earlier warm-up sample.

| Inspection | Starting candidate | Refined candidate |
| --- | --- | --- |
| Relaxed, oblique medium, t=9 | [before](evidence/refinement-before/oblique-medium.png) | [after](evidence/refinement-final-rest/oblique-medium.png) |
| Relaxed, close side | [before](evidence/refinement-before/side-near.png) | [after](evidence/refinement-final-rest/side-near.png) |
| Relaxed, close underside | [before](evidence/refinement-before/underside-near.png) | [after](evidence/refinement-final-rest/underside-near.png) |
| Relaxed, close top | [before](evidence/refinement-before/top-near.png) | [after](evidence/refinement-final-rest/top-near.png) |
| Relaxed, distant | [before](evidence/refinement-before/oblique-far.png) | [after](evidence/refinement-final-rest/oblique-far.png) |
| Maximum contraction, close side, t=10.06 | [before](evidence/contracted-candidate/side-near.png) | [after](evidence/refinement-final-contract/side-near.png) |
| Maximum contraction, underside | [before](evidence/contracted-candidate/underside-near.png) | [after](evidence/refinement-final-contract/underside-near.png) |

The contraction-before set was captured during the prior pass at `3bff138`; `git diff 3bff138 fc84892 -- src` is empty. It is the same starting animal and fixture, not a newly fabricated baseline. Additional final contraction oblique/top/far frames are in [refinement-final-contract](evidence/refinement-final-contract). The full recovery checkpoint at **t=11.4** is in [refinement-final-recover](evidence/refinement-final-recover), including close side/underside/top and medium/far presentation. There is no claim of a newly captured starting-candidate recovery pair.

The original production animal remains available in the earlier [matched baseline](evidence/final-baseline). Compare both: this continuation improves the first candidate, not merely the older production animal.

## New actual browser motion

- **[54.28-second specimen recording](evidence/refinement-final-motion/motion.mp4)**: repeated pulse cycles; close side; an actual raycast click at approximately 16 seconds; activation/recovery; close underside through a complete cycle at approximately 22–28 seconds; far presentation at 28–34 seconds; return to medium through a controlled heading change. Browser source `bb61d68`, 1,620 captured frames, encoded 1254 × 900. [Capture metadata](evidence/refinement-final-motion/capture.json).
- **[36.56-second ocean recording](evidence/refinement-final-ocean/motion.mp4)**: the exact same animal code in foreground slot 0, opening and first existing approach at approximately 7% scroll, overlapping particles/animals, click activation and return. Source `bb61d68`, 1,096 captured frames, encoded 1280 × 900. [Capture metadata](evidence/refinement-final-ocean/capture.json).

These are live browser screencasts encoded from their actual timestamps, not generated images or still-image animations. Encoding is variable-duration; this is not a claim of 60 fps recording. CDP can scale/crop the compositor output independently of the recorded 1280 × 900 drawing buffer. Use the matched PNGs for exact pixel/phase comparisons. Capture workload is excluded from performance measurements.

Self-review inspected the matched views, sampled full pulse sequences, the underside cycle, controlled turn, activation and ocean approach. The refined animal maintains a continuous bell and readable folded anatomy across those views. In the unchanged ocean it retains softer tissue highlights and coordinated trailing motion rather than depending on the black specimen background. This review is not a substitute for Mani's visual approval.

## Run locally

The existing local development server is at port 5178. To reproduce it from the repository:

```sh
cd /home/mani/dev/jellyfish-studio/site
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

- [Refined specimen](http://127.0.0.1:5178/?specimen=1&renderer=webgl&idle=300).
- [Refined single-animal ocean preview](http://127.0.0.1:5178/?oceanPreview=1&renderer=webgl&idle=300).
- [Original production animal in the specimen](http://127.0.0.1:5178/?specimen=1&animal=baseline&renderer=webgl&idle=300).
- [Unchanged default artwork](http://127.0.0.1:5178/).

Specimen-only keys remain **1–4** for oblique/side/underside/top, **N/M/F** for distance, **Space** to pause/resume, **A** for activation. Actual clicking also works. Append `&hold=9`, `&hold=10.06` or `&hold=11.4` for deterministic inspection. Reload resets the fixture. No controls appear in the normal artwork.

Repeat evidence, one browser job at a time:

```sh
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?specimen=1&renderer=webgl&idle=300&hold=9' review-repeat matched
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?specimen=1&renderer=webgl&idle=300' review-motion anatomy-tour 54
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?oceanPreview=1&renderer=webgl&idle=300' review-ocean tour 36
node scripts/specimen-evidence.mjs 'http://127.0.0.1:5178/?specimen=1&renderer=webgl&idle=300' review-perf perf 30
```

The local evidence wrapper uses the existing Brave/host-spawn installation and CDP port 9279. For performance baseline append `&animal=baseline`; for ocean timing replace `specimen=1` with `oceanPreview=1`.

## Validation

- `node --test tests/*.test.mjs`: **16/16 passed**, including all seven pre-existing worker/particle tests and nine focused animal tests. There is still no generic `npm test` script.
- `node scripts/check-default-animal.mjs`: **PASS**, original-baseline geometry buffers byte-for-byte equal at eight checkpoints across 240 frames, sampled material behavior equal, including activation/movement.
- `VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run build`: **PASS** after the final recoil change. Existing large-chunk and npm global `tmp` warnings remain. No deployment command was run.
- Production output contains neither `SpecimenPreview` nor `__SPECIMEN__`. Development-only entry guards remain unchanged.
- **New production smoke:** the built GitHub Pages-path app rendered locally with `?specimen=1` present but exposed no specimen state. Browser errors were empty. [Built-app evidence](evidence/refinement-production-guard/capture.json). This was local `vite preview`, not a deployment.
- **Actual click activation:** both final motion records show one activation, target 0, followed by activation returning to zero; no browser errors.
- **Idle and tab return:** [new lifecycle evidence](evidence/refinement-final-lifecycle/lifecycle.json) shows idle active `true → false`, subsequent raycast activation `0 → 1`, and actual background visibility `hidden`. Across approximately 1.8 seconds hidden plus the short resumed observation, simulation time advanced **0.1072 seconds**, not the entire hidden duration. No violent catch-up or browser errors were observed.
- Focused regressions cover finite nondegenerate mantle triangles, UV seam positions/normals, gastric insertion, contact constraints without velocity injection, localized surface activation, multiple cycles/turns, pause-delta rejection and 30/60/120 Hz trajectory variation.
- `git diff --check` for changed implementation/tests/tooling: **PASS**.

### Renderer coverage

**WebGL 2:** actual NVIDIA RTX 4070 backend, final specimen, ocean, activation, idle/return and motion captured without console errors.

**WebGPU:** actual WebGPU backend, **Google SwiftShader software adapter**. The final isolated specimen reached t=9 and completed all five matched views with zero console errors. [Adapter and checkpoint](evidence/refinement-final-webgpu/matched.json). This is a compatibility probe, not a useful performance benchmark or physical-GPU validation.

The earlier full-ocean legacy `copyFramebufferToTexture` rgba16float/rgba8unorm transmission-format failure remains documented in the [original report](README.md#verification). This pass neither changes those legacy materials nor claims to fix or revalidate that full-ocean path.

Hardware WebGPU, Firefox, Safari, physical Android/iOS, integrated-GPU laptops, thermal endurance and GPU timestamps: **NOT TESTED**. Browser viewport emulation/software adapters are not physical-device tests.

## Performance

Final uncaptured comparison measurements are recorded in `evidence/refinement-perf-*/performance.json`. Same methodology as the previous pass: **six-second warm-up, thirty-second measurement**, one QA browser page, **1280 × 900 viewport and drawing buffer, DPR 1**, fixed quality, no adaptive resolution reduction, production bloom off. Timing runs occurred separately from screenshot/video capture and builds.

Hardware: Intel Core i5-14600K, approximately 62 GiB RAM, RTX 4070 12 GiB, driver 610.57.04. Brave Flatpak 1.94.119 / Chromium **152.0.7977.76**. Actual WebGL renderer: `ANGLE (NVIDIA Corporation, NVIDIA GeForce RTX 4070/PCIe/SSE2, OpenGL ES 3.2)`.

The JSON records both rAF cadence and completion-to-completion intervals around the existing asynchronous render call. **Neither is GPU timing.** The roughly 60 Hz scheduling ceiling does not reveal spare GPU headroom. This is the user's working PC, not an isolated laboratory.

| Scene / animal, newly measured | rAF median / p95 (ms) | Render-completion median / p95 (ms) | Maximum render interval (ms) | Render intervals >50 ms |
| --- | ---: | ---: | ---: | ---: |
| Specimen / original baseline | 16.7 / 16.8 | 16.7 / 18.8 | 24.0 | 0 |
| Specimen / refined candidate | 16.7 / 16.7 | 16.7 / 17.0 | 20.2 | 0 |
| Ocean / original baseline | 16.7 / 16.7 | 16.6 / 20.0 | 25.5 | 0 |
| Ocean / one refined candidate | 16.7 / 16.7 | 16.8 / 19.0 | 27.3 | 0 |

Each run contains 1,800 render-completion intervals and zero browser errors. DPR remained 1 before and after. Raw evidence: [specimen baseline](evidence/refinement-perf-specimen-baseline/performance.json), [specimen refined](evidence/refinement-perf-specimen-final/performance.json), [ocean baseline](evidence/refinement-perf-ocean-baseline/performance.json), [ocean refined](evidence/refinement-perf-ocean-final/performance.json).

Compared with the contemporaneous original baseline, the ocean candidate's median render interval increased **0.2 ms** and its maximum increased **1.8 ms**, while p95 fell 1.0 ms. The specimen's p95 fell 1.8 ms. These single paired runs show no sustained cadence regression; they **do not establish a reliable speedup**.

For continuity, the previous pass's first-candidate specimen measured render median/p95 **16.7/19.5 ms**, maximum 35.4 ms; its ocean measured **16.6/19.1 ms**, maximum 27.4 ms. Those are historical runs, not a new simultaneous A/B. The refinement remains within that observed envelope on this device. Local contact solving adds CPU work, but four former organ draws become one, degenerate cap triangles disappear, and geometry detail/quality was not silently reduced to improve the timing result. Constrained hardware and longer repeated runs remain untested.

## Changed source and review limits

Runtime files changed in this continuation:

- `src/scene/LivingAppendages.js`: cap/seam topology, pigment ownership, internal body/roots, transported membrane sections, contact integration, insertion taper and localized activation/recoil.
- `src/scene/anatomy/mantle.js`: continuous pole tangent, folded membrane profile and deterministic spine-separation constraint.
- `src/scene/materials/JellyTissue.js`: safe UV/power domain, thickness/view response, broad moving highlights and activation attribute.

Supporting files: `tests/jelly-anatomy.test.mjs`, `scripts/specimen-evidence.mjs` (underside/far motion tour and diagnostic/reference options), new scoped `src/scene/anatomy/AGENTS.md`, and this review/evidence package. The camera, school director, water, seabed, idle glass and application layout were not edited during this continuation.

Remaining visual/modeling limits:

1. Tissue is a stylized analytic approximation. It does not refract actual background objects, simulate volumetric scattering, or reproduce one exact jellyfish species. Very close internal-body views still reveal a simplified four-lobed organ, not authored microanatomy.
2. Arm separation is a local spine constraint, not triangle-level cloth self-collision. Layering remains intentional; arbitrary violent configurations are not guaranteed intersection-free. The inspected ordinary cycles, turn and activation do not show the previous collapsed attachment/twisting-sheet defect. A physically closed authored oral trunk would require a shared watertight transition, explicit thickness and deformation weights mapped to these same four spines—not a replacement renderer/animation engine.
3. Fine tubes and folds can still show finite sampling at distances closer than the inspection fixture. No scene-wide LOD or population migration was attempted.
4. The unchanged ocean's purple flecks, unlike-looking distant animals, existing camera reversals/framing and environmental limitations remain visible. They were not altered to flatter this animal. Only foreground slot 0 is substituted; later passes involving other actors remain original.

A fresh [Medusae browser reference](evidence/refinement-reference/opening.png) was reviewed for coherent silhouette and interior/appendage hierarchy, not copied for its particle count or brightness. [Ash Weeks' Medusae](https://milcktoast.com/medusae/) and [Noomo's authored jellyfish case study](https://noomoagency.com/work/noomo-labs-the-jellyfish) remain reference context. The local reference capture's hardcoded application bloom metadata does not describe that external site's renderer. No reference code or assets were imported.

## Publication boundary

All animal changes remain behind the existing opt-in development path. The original default animals passed parity checks. No merge, push, deployment or workflow trigger occurred; live GitHub Pages remains unchanged. No Milestone 2/3 work, shared current/wake, camera redesign, seabed work or idle-glass change was begun. Your visual approval is required before any wider integration.
