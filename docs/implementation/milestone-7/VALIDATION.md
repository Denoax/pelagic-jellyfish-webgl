# M7 validation record

Approved source baseline: `046430847448206cfc58ce84758d9410121a97d3`.
Optical/material/field visual code: `542932953c423ebd3267d9367a01b67c8891b6d5`.
Teardown guards: `c77224d`.
Deferred prewarm/runtime candidate: `e666b34f11f9867dc59f698ff07ebf2c50daf618`.
Later documentation/tool commits do not change runtime pixels.

Final production build PASS (`VITE_OCEAN_RELEASE=milestone-2 npm run build`),
118/118 Node tests PASS (`node --test tests/*.test.mjs`), approved motion PASS
(720 frames / 24 exact checkpoints), default animal PASS (240 frames / eight
checkpoints). Baseline was 107/107 tests plus both parity checks and build PASS.
The existing >500 kB bundle warning remains, not a new test failure. Logs:
`/tmp/m7-final-{build,tests,motion,animal}.log`.

The 20-cycle/all-mode/resize/hidden lifecycle suite was rerun successfully after
e666b34, followed by fresh complete sanctuary, school and Explore motion.
Three earlier desktop recordings had been downscaled by the headless window's
screencast surface despite a correct ocean drawing buffer; these were replaced
with 1280×900 captures after setting the browser window AND visible size.
The other final visual clips precede only the visually neutral teardown/prewarm
scheduling changes; their field/material/clock implementation is identical.
The three-minute soak predates those two ownership changes and is not falsely
relabeled as a new final-SHA soak. Portrait recording is 390×844.

## Evidence provenance

Root: `/home/mani/dev/jellyfish-studio/m7-evidence/`.
The local evidence viewer is `index.html`. No generated image, composited fake
ocean, prerecorded runtime texture, or still substituted for browser motion.
Browser screencast frames are encoded as variable-frame-rate MP4; their cadence
is capture-overhead affected and is **not** benchmark performance.

Final gallery browser check PASS: eight videos have valid duration and expected
1280×900 dimensions (portrait 390×844), ten matched images load, and the primary
video advances during actual playback. No browser errors. Metadata is loaded
sequentially by the checker; the gallery preloads no videos, avoiding competing
full-file downloads on the simple local evidence server. `viewer-check/` holds
the asset and playback results.

| Evidence | Contents |
| --- | --- |
| `baseline-idle/` | Approved legacy idle before runtime editing, actual entry/rest/exit |
| `architecture-gate/` | Initial same-renderer/live-clock proof before topology work |
| `motion/sanctuary/` | Complete entry, rest, deformation, persistent response, recovery, deterministic minute, dissolution/return |
| `motion/opening/`, `school/`, `bubbles/` | Same sequence in those existing regions |
| `motion/explore/` | Free-view pose preserved during idle and retained after return |
| `motion/portrait/` | 390×844 stacked HH/MM entry/deformation/minute/return |
| `long-idle/` | Three-minute samples, actual wall-clock minute-change video |
| `lifecycle/` | Twenty cycles, all five modes, resize, hidden/return, same world and finite state |
| `resources/` | Native GPU create/delete handle counts across twelve resizes |
| `pass-audit/` | Actual ocean/output/simulation draw classification |
| `matched/` | Five approved/candidate pairs at fixed seed/time/camera/resolution |
| `performance/` | Capture-free baseline/candidate raw completion traces and environment metadata |
| `public-audit/` | Actual current Pages release, not the new local baseline |

Each motion directory has before/idle/after state, screenshots, `motion.mp4`,
`recording.json`, field samples and errors. Earlier `liquid-gate/` and failed
startup diagnostics are development history, not final review evidence.

## Non-idle parity

All five matched cases have exactly equal camera JSON, renderer/buffer JSON and
specimen JSON: time 14, phase 0.0447453219262024, activation 0, 839 frames.
Seed 7183; 1280×900, DPR1, normal bloom-off production path. Captures use B at
0, .5, .36; D at 1; then Explore from D. Source guards preserve every existing
runtime file outside the nine explicitly allowed idle-integration paths.
Approved anatomy/material/motion checks remain separate from screenshots.

Whole-frame byte equality is NOT claimed. Some auxiliary appendage/runtime
histories differ despite the held main specimen state. Matched frames show the
same composition, palette, geometry family and environment. No camera tracks,
View controls, scroll controller, animal assets, LOD logic, current/wakes,
bubble optical formula, or sanctuary code was changed.

## Lifecycle and ownership

Twenty enter/dismiss cycles use alternating actual CDP click and Enter. The
first two settle fully; subsequent cycles exercise interrupted formation and
exit. Every cycle checks the same world identity, finite animals, equal idle
camera pose/progress, no activation increment from dismissal, stable idle
texture identities, zero invalid field values, and one graphics context.
Reported resources remain 192 geometries / 76 textures in this fixed scene.

A/B/C/D/Explore each enter and return retaining mode. Active resize tests cover
800×900, 390×844, 1280×900. Field sizes become 228×256, 118×256, 256×180. Hidden
tab was confirmed by real document visibility, held for five seconds, then
returned without world replacement. This is not the stronger forced-page-freeze
case, which remains independently unresolved from M6.6.1.

Three-minute idle samples keep stable resource identities/counters while the
clock changes and the world continues. Pixel readback is restricted to the
tiny field in diagnostics: all samples finite, nonzero after manipulation,
returning to zero after recovery. It is not used by production rendering.

See IMPLEMENTATION.md for the native-handle audit explaining the r175 texture
counter increase on resize. Native live handles do not grow.

## Timing method

Intel i5-14600K, NVIDIA RTX4070, Arch Linux kernel 7.2.2-arch1-1. Brave headless
reports Chromium 152.0.7977.76; ANGLE OpenGL ES / NVIDIA hardware **WebGL2**.
Same browser flags, seed, 1280×900 viewport AND drawing buffer, DPR1, unchanged
adaptive-quality code, approved bloom-off direct path, same View/progress.
No screenshot, video, build, tests, other browser job or GPU audit during timing.

Each case gets 6 seconds warm-up plus 5 seconds in the requested View; idle
cases then get 10 additional seconds. Measurement is nominally 30 seconds.
The pointer case sends 300 real pointer moves with 100 ms waits, so protocol
overhead can make its actual span slightly longer. Raw intervals allow exact
observed duration reconstruction. Fresh browser per case, baseline then
candidate. Single runs are not statistical proof against all machine noise.

The existing async-rAF probe timestamps **render-completion intervals**. These
are NOT GPU timings. Candidate CPU samples measure the idle JS controller
before awaiting simulation; they exclude GPU execution and driver submission.
Display cadence can hide spare GPU cost. No GPU-speedup claim is made.

Separate capture-free entry test: candidate first ocean completion after the
DOM active-state mutation 16.5 ms; after dismissal 11.6 ms. Baseline 15.4/15.2 ms.
Candidate transition-window maxima 21.7/18.0 ms; baseline 17.7/18.8 ms. Neither
window contains a >50 ms interval. DOM mutation-to-completion is not precise
physical input latency. Deferred prewarm measured 111 ms in that run; this is
a one-time preparation cost, not a first-idle stall. The 111 ms timer covers
attach/prepare/compile, excluding construction before attach. The inclusive
main-loop trace shows ONE pre-idle preparation interval of 139.3 ms in the
candidate versus 188.6 ms in the legacy baseline. Both occur about 2.3 seconds
after the first completed ocean frame. This startup pause is real and is not
hidden in the steady-state table; it is not eliminated by deferred scheduling.
No claim of a generally hitch-free startup is made from these single samples.

The nine-case timing table is recorded separately in PERFORMANCE.md after all
baseline/candidate runs complete.

## Untested and approximate

Hardware WebGPU, software SwiftShader WebGPU, Firefox, Safari, physical phones,
integrated GPUs, denied/lost graphics, long thermal throttling and full forced
page freeze are NOT TESTED for M7. Existing full-ocean WebGPU problems remain;
M8 compatibility work was not started. Portrait/narrow are browser emulation.

Liquid is a bounded elastic/advection height field plus implicit scalar masses,
not mass-conserving Navier–Stokes, true glyph SDF, or volumetric ray tracing.
Strong sustained input may produce narrow pointed folds. Minute changes use
erosion→bead→regrowth rather than advecting conserved numeral volume. These
art-direction compromises require human review, not automated approval.

The live scene is genuinely sampled at displaced UVs. Offscreen information,
precise transparent depth, and physically nested bubble→film refraction cannot
be reconstructed by this screen-space approximation. No bloom hides those
limitations. The original ocean remains unchanged outside idle.
