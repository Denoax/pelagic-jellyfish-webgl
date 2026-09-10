# M6.3 — wide-only diagnosis (2026-09-09)

Baseline: `685eaf5960251923bc4ae7012f8fd3c8c42bf46d`, clean M6.2 worktree. New branch `milestone-6-3-wide-atmosphere`, separate worktree `../m6-3-sanctuary`. Original dirty `site` and other worktrees preserved. Origin: Denoax/pelagic-jellyfish-webgl. Three.js remains 0.175.0; Node 24.20.0. No publishing authorization.

## Evidence before runtime edits

`../m6-3-evidence/before/{drift,deep,documentary,intimate,portrait,explore}/wide.png` and adjacent state/histogram JSON. Seed 7183, fixed simulation hold 14, progress 1. Desktop 1280×900/DPR1, portrait emulation 390×844/DPR1. Drift B / Deep D / Documentary A / Intimate C; Explore eye [14,−4,−8] looks toward [−2.4,−9,−27]. Actual Brave/NVIDIA WebGL2. The audit intentionally ignores close-up beauty.

All six views lose the geology into similar blue-black values. The main chimney survives through proximity and pooled animal illumination. Shelves, gully and secondary spires mostly vanish; local life does not resolve. Violet is almost entirely animal anatomy. The plume remains a deliberately subtle dark granular column rather than a bright subject.

Deep's cropped encoded-sRGB luma is 2.94/255 mean, with 91.31% below 8 and 96.98% below 16. This is an image histogram, **not radiometric luminance**; margins exclude most persistent UI, and hue classification is a rough image-level diagnostic, not geological segmentation.

A temporary browser-only ablation disabled fog on opaque sanctuary materials without moving the camera or changing geometry/lights. Near-black dropped to 47.95%, mean rose to 12.94. Existing shelves, gully and spires became visible. This diagnostic is not shippable: it exposes a distant floor horizon and lacks atmospheric hierarchy. The fresh browser was discarded after capture; no baseline source was modified.

## Root cause

Primary C + D, resulting in A: global water extinction uses `exp(-[.11,.078,.060] * depth * max(distance−12,0)^1.5)`. It extinguishes already dim, ambient-multiplied geological pigment at cinematic distances. Secondary B: existing fine mineral/scan variation has too little low-frequency hue separation. Secondary E: tiny .018-world-unit life points, compounded by extinction, cannot carry wide composition. The pooled animal light can already reveal adjacent surfaces; no evidence justifies enlarging it into a floodlight.

## Scoped response

Additional source/geometry ray audit: many life points were placed against the analytical basin height before overlapping rocks were considered. Several are buried 1–2.4 units beneath banks; a few intersect the chimney by much more. Increasing brightness cannot reveal occluded geometry. The final subset keeps all horizontal locations and the original colony layout, but anchors three eligible existing points per island to actual stone surfaces at construction time. It rejects surfaces more than 2.8 units above the original point, avoiding tall chimney tops. Fifteen .065-radius accents, twenty-five original .018-radius points; same batch/mesh/count. No raycasting or allocation is added to the frame loop.

Reuse directional ocean radiance, but apply a bounded sanctuary-only distance response with a stronger far-field fade on low basin surfaces. Do not disable atmospheric perspective, change ocean fog, exposure, camera, bloom or quality. Add geological-location slate/teal/violet/old-ochre pigment zones beneath existing deposits/scan detail. A very dim upward-plane material-side pickup excludes buried/downward faces. Enlarge only 15 existing local life points; retain the other 25 and all sites/counts. No new geometry families, population or passes.

## Human-authored comparison

[Unseen Studio: The Sea We Breathe](https://unseen.co/projects/blue-marine-foundation/) describes three underwater environments and the importance of lighting/textures under interactive performance constraints. Fresh author-page entry screenshots were captured; the site's entry gate did not dismiss through the automated DOM click, so these are **not a successful live experience inspection**. The author-provided underwater still is inspected separately and is explicitly a published reference image, not live motion evidence.

The applicable mechanism is separation of large surface/void masses through spatial color and attenuation, not copying its sunlit palette, fish, architecture or assets. No reference asset enters the runtime. Existing Poly Haven Rock 07 scanned detail/license remains unchanged. Acceptance here is fresh matched wide frames and moving browser evidence, not reference reputation.

## Baseline validation

First fresh-worktree test attempt: 89/90; Sites packaging check failed because `dist/client/index.html` had not been generated. Build-first rerun: 90/90. Production build passes with the existing >500kB chunk warning. Both existing approved-motion/default-animal parity scripts pass. This is a preparation-order failure, not a baseline runtime failure.

Pre-existing idle-return cyan-loss / invalid geometry remains out of scope and untouched. No hardware WebGPU claim is made. M6.3 is judged in real NVIDIA WebGL2; portrait is browser emulation, not physical-mobile validation.
