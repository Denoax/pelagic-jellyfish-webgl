# M7.1 validation and evidence

Runtime under test: `bfbe9837f4e0587662f79d481af8e7b1dcb94156`.
Evidence root: `/home/mani/dev/jellyfish-studio/m7-1-evidence`.

## Automated checks

- Baseline: 118/118 tests, production build, both animal parity programs PASS.
- Candidate: `node --test tests/*.test.mjs`: **126/126 PASS**, no skipped tests.
- `npm run build`: PASS, including Sites output preparation; existing large
  chunk warning remains. There is no general `npm test` script; the explicit
  Node test command is what was run.
- `node scripts/check-approved-motion.mjs`: approved geometry buffers equal
  over 720 frames / 24 checkpoints, appendage state and activation equal.
- `node scripts/check-default-animal.mjs`: geometry buffers and material
  response equal over 240 frames / eight checkpoints.
- Focused tests cover stroke anchors, deterministic spatial timing, bounded
  feeding masses, neck thinning, finite event queue, rapid/hidden time handling,
  independent old/new texture Sources and asynchronous preparation cleanup.
- Exact-source checks preserve non-authorized runtime and the final idle
  refraction/highlight equation. No animal/camera/environment tuning occurred.

Final handoff rerun logs: `/tmp/m71-handoff-tests.log`,
`/tmp/m71-handoff-build.log`, `/tmp/m71-handoff-motion.log`,
`/tmp/m71-handoff-animal.log`. Earlier equivalent final-runtime checks remain
in `/tmp/m71-final-*.log`.
These historical parity programs have not been rewritten for M7.1.

## Browser lifecycle

`scripts/m7-lifecycle.mjs` with candidate URL: **PASS**.

- Twenty consecutive entries/returns, alternating native CDP Enter and pointer
  clicks. No click activation leaked into the animal beneath the idle layer.
- Same world identity, stable four idle-resource UUIDs, one graphics context,
  finite animal geometry and finite read-back simulation state throughout.
- Camera position/quaternion/progress stayed fixed while idle; the world
  continued. No scene reset was used to achieve recovery.
- Documentary / Drift / Intimate / Deep / Explore entry and return PASS.
- Active resize through 800×900, 390×844 and 1280×900 PASS.
- Escape, Space and CDP touch dismissal PASS; return amount zero after 1.2 s.
- Real hidden-tab normal-ocean return PASS. This uses a second blank tab,
  verifies document.hidden, then returns to the original world.

Raw snapshots, finite-field summaries and errors are under `lifecycle/`.
The separate `m71-review-check.mjs` **PASS** also checks hidden recovery while
idle is active: liquid time remained exactly 3.0356 s during four hidden
seconds, then advanced to 3.9205 s after one visible second (no wall-time catch
up). The same world/resources/camera remained, with zero invalid field values.
It validated metadata for all 12 viewer videos, image loading and advancing
playback. Results: `review-check/`.

## Renderer / resources

Actual browser instrumentation, not inferred from object ownership:

- **One WebGL2 context**.
- Normal: 91 ocean renders / 91 output draws in the sampled window.
- Idle: 90 ocean renders / 90 output draws / 90 low-resolution simulation draws
  in the sampled window. The fixed-step simulation may use 0–3 steps/frame at
  other cadences; it is not another ocean render.
- Existing 1280×900 M3 clean scene color/depth target is reused. No new full-size
  scene target, copy, second renderer or second ocean was added.
- Existing two RGBA16F field targets: 256×180 landscape, 118×256 portrait.
- The temporary 8×8 preparation target is disposed after its first valid draw.
- Six repeated portrait→landscape resize cycles retain **75 native textures,
  six framebuffers, four renderbuffers**. Native-handle count is stable.
  Three's `info.memory.textures` counter rises 76→124 during those resizes;
  it is not being represented as a native leak or hidden. Native create/delete
  hooks are the independent check. Existing r175 bookkeeping remains outside
  this choreography pass.

Evidence: `passes/{normal,idle,state}.json` and `resources/candidate/`.

## Motion / visual evidence

Open the local [review viewer](http://127.0.0.1:5218/). It offers normal and
0.5× playback. Footage is actual browser screencast with original frame-time
durations, encoded to MP4; it is not generated imagery or a simulated render.

- Matched baseline: `baseline-final/{opening,sanctuary}/motion.mp4`.
- Candidate: `candidate/{opening,sanctuary,school,bubbles,explore,portrait}/motion.mp4`.
- Each includes local entry, **15 seconds of settled observation**, pointer
  stretching/recovery, 14:29→14:30 and dismissal/return.
- `candidate/contact-close.mp4` and `candidate/exit-close.mp4` are explicitly
  labeled enlarged, half-speed crops of the sanctuary browser clip.
- Entry PNGs at requested .25–8 s are paired with actual liquid state in each
  `metadata.json`. Baseline/candidate settings, font size and requested camera
  states match. Autonomous animal phases are not exactly frame-aligned, and
  candidate clock cells are deliberately tabular-positioned for safe rollover.
- `candidate/minutes/motion.mp4`: 11 fixed-hour cases; unchanged hour masks
  remain identical. Includes 0→1, 1→2, 2→3, 3→4, 5→6, 8→9, 9→0 and
  09→10, 19→20, 29→30, 59→00. These are general algorithm tests, not handcrafted
  transitions. `candidate/rollover/motion.mp4`: actual 14:59→15:00 and
  23:59→00:00. All completed without browser errors.

The first diagnostic baseline's PNG names included accumulated screenshot
waits; do not use those as phase-matched proof. Use **baseline-final** instead.

## Untested / limits

Validated: real NVIDIA RTX 4070 WebGL2 via Brave/Chromium 152.0.7977.76,
1280×900 and emulated 800×900 / 390×844, DPR 1.

**NOT TESTED:** physical phone/tablet, physical touch, Safari, Firefox, hardware
WebGPU, SwiftShader WebGPU in this pass, context-loss/restore on a real driver,
all possible system fonts/time-zone settings. The existing legacy full-ocean
WebGPU limitation is not fixed or claimed fixed. Emulation is not device proof.

Automatic tests prove bounds and parity, not artistic success. Full-size
contact/pinch readability and performance consistency remain review gates.
