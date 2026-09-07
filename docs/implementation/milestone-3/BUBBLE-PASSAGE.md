# M3 presentation refinement — rising refractive bubble passage

Status: **READY FOR VISUAL REVIEW**. Local review only, not M4 or publication.
This is a review recommendation, not a substitute for Mani's visual approval.

**Subsequent user review:** `b3f1c9b` was technically accepted but NOT artistically
approved. This document records that historical handoff. Current refinement and
reference-access limitations are in [GEYSER-REFINEMENT.md](GEYSER-REFINEMENT.md).

Starting SHA: `78d723a76c48cc6bf93c8d4b7d27549bfbce2920`.
Approved M2: `1342d82118d8632cd429e21418832f5c908446a7`.
Branch: `milestone-3-bubble-passage`, directly from accepted local M3.
First implementation checkpoint: `8b5c7f3`.
Final runtime checkpoint: `d8b8a0d3898c8081968c23a309f7e9ab3c0a9ff0`.
Subsequent evidence/report commit does not change runtime code.
Repository: `Denoax/pelagic-jellyfish-webgl`, verified origin
`https://github.com/Denoax/pelagic-jellyfish-webgl.git`.
Public main remains `a0501c21f8c782887bf6a5e1257e955ada41b678` (rechecked
after validation); the earlier M2 Pages review build is run `34133364127`.
Root AGENTS.md modification and untracked September 7 research were preserved.
No reset, clean, stash, push, merge, Pages change or deployment.

## Review

Local automatic passage: <http://127.0.0.1:5178/?bubblePassage=1&bubbleReview=1&renderer=webgl&idle=300>.
Press **B** to replay. Wheel cancels the automatic review scroll. This only
drives ordinary native scroll through the existing camera path; it does not
replace camera keyframes, animal routes or framing. Omit `bubbleReview=1` to
explore manually. The event belongs to **27–46% scroll**.

Start locally if the existing server is not running:

```sh
cd /home/mani/dev/jellyfish-studio/site
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

The B-key replay uses instant native scroll updates because repeatedly restarting
CSS smooth scrolling prevented progression in an early review-control test.
The existing camera's smoothing is unchanged. That failed test had zero births
and was excluded; the repaired replay produced 178 births and settled to zero.

The accepted single lens remains at
<http://127.0.0.1:5178/?liveLens=1&renderer=webgl&idle=300> as a technical fixture,
not the intended bubble presentation. Production builds expose neither path.

## Before editing: source and human-reference comparison

Fresh browser footage of the accepted single lens and the existing 35% journey
preceded runtime edits. The second-encounter shot has a prominent animal,
passing secondary animals and lateral/orbital travel with no seabed complication.
That composition supports optical crossings without moving an animal to suit us.

Fresh [Evan Wallace WebGL Water](https://madebyevan.com/webgl-water/) browser
capture shows how the live sphere/tile edges make bending unmistakable. The
mechanism adapted is optical causality against moving geometry—not the pool,
texture, water solver, UI or copied source. The current M3 implementation already
solves this live-image problem; no replacement shader project was imported.
Reference media remain research-only in `/tmp/pelagic-m3-bubbles/evan-reference`.
No external asset or code was copied/purchased. Installed r175 InstanceNode
source was checked when a first-frame matrix-capacity problem appeared.

Gap in accepted presentation: an enduring centred dark lens has no natural
environmental role. New expression: rising transparent films, then a short
curtain with a few real optical crossings, then empty water again.

## Architecture retained, not restarted

- **Same live M3 target and compositor:** one actual ocean scene render into
  full drawing-buffer RGBA16F + depth24 / 4× MSAA; one TSL optical/output pass.
  Three.js stays pinned to 0.175.0 and the same WebGPURenderer family.
- The existing two-interface world-space ellipsoid kernel is parameterized for
  **three hero slots in one output shader**, not three targets or three oceans.
  The single-lens fixture uses the same kernel with its previous parameters.
- Every hero samples the original same-frame scene color, never the previous
  hero's refracted output. Back-to-front masked composition gives nearer heroes
  priority. No nested/recursive refraction or compounded image warping.
- Bubble optical contrast is weakly divergent (effective ratio 1.025–1.045),
  with a bounded ~0.0113 UV displacement. This has an air-like optical sign but
  is deliberately less severe than physical water/air's grazing reflection.
- Bubble tint multiplies scene color by exactly one: **no dark filled disc**.
  Only a small highlight/edge response accompanies the live refraction.
- Ambient bubbles add one instanced draw inside the normal ocean target;
  they can appear in the heroes' live sampled image. They do not own targets.
- In calm, no bubble draw and no optical output: use the normal ocean path.
  The existing target remains reusable after the first event, not churned.

Target count/resolution/storage does not grow with bubble population. The same
M3 owned target costs approximately 66 MiB logical attachment storage at
1280×900 with MSAA, alongside the retained renderer-internal output target.
There are zero additional ocean/output stages versus accepted M3, and one
additional ambient draw during the event. Three optical evaluations cost more
fragment work; actual measurements below distinguish that from pass count.

## Population and composition

`BubblePopulation` owns a fixed pool of **128 ambient + 3 hero** records.
Seeded births vary position, depth, size, velocity, drift, phase, wobble, lifetime,
opacity, highlight and refractive contrast. There is no per-frame random reseed.

Ambient births: 83% small radii 0.025–0.085 world units; remaining 17% medium
0.09–0.17. Hero births: 90% medium 0.22–0.39; rare 10% larger 0.43–0.53.
Portrait additionally caps hero angular size. These are distribution weights,
not a promise that every passage has a large bubble.

Ambient depth spans 2.3–13.3 units from the camera **at birth**; heroes spawn
2.9–4.7 units in front. Each thereafter moves independently in world space,
mainly upward at ~0.65–1.5 units/s with small nonlinear drift and wobble.
Read-only M2 CurrentField samples contribute 30% lateral / 15% vertical flow.
The current implementation and animal geometry/state are never modified.

Hero birth rays are biased toward actual visible anatomy on the featured animal:
two slots favour the bell, one the lower membranes/appendages, starting beneath
that region. This is only initial composition: heroes never track the animal or
camera after birth. Natural swimming, rising and camera travel produce crossings.
No physical collision is needed or claimed. Mild changing ellipsoid proportions
drive the same optical normals; the original drag spring remains in the debug
lens, not added as a second independent bubble simulation.

Ambient films use smooth instanced spheres with faint Fresnel and directional
highlight, normal alpha blending and no depth writes. Unused slots are hidden
outside view with zero opacity. **Draw capacity stays 128:** r175 compiles its
instance matrix UBO from the initial count, so changing that count from the first
birth hid later instances in the first draft. Fixed capacity resolved it.

## One moment, with a definite end

Spatial ramp: 0.27→0.315 approach, 0.315→0.405 dense, 0.405→0.46 exit.
Temporal ramp: 3-second approach, at most 7-second dense plateau, 4-second exit.
The product of both envelopes drives births/visibility, so stationary browsing
cannot turn the event into a permanent screensaver. Fast scroll drains smoothly.
Re-entry requires leaving the wider 0.23–0.50 range. Pools recycle in place.
No new births outside the configured range; remaining optical strength/films
decay before records are released. Ordinary water returns exactly.

## Validation record

Before editing: 36 tests, both animal-parity scripts and production build PASS.
New tests cover deterministic 30/120 Hz equality, nonuniform distribution, fixed
capacity, no pause debt, finite event duration, repeated re-entry/recycling,
read-only current influence and exact protected-source equality to accepted M3.

After final runtime edits: **41/41 tests PASS**, both parity scripts PASS,
production build PASS. There is no generic npm test script; all existing Node
test files were run explicitly. Existing npm `tmp` config and Vite chunk-size
warnings remain; neither is a newly introduced test failure.

```sh
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
```

The new protected-source check verifies M1/M2, camera, idle and dependencies
against accepted M3; only HeroScene integration and LiveOceanLens may differ
among pre-existing runtime modules. Browser click activation reached 1, the
existing idle view entered and returned via Escape, and a genuinely backgrounded
tab resumed without simulation catch-up (about 0.12–0.13 s observed advancement
around the return, not the 1.8–2 s hidden time).

Five backward/forward traversals returned to zero live bubbles outside the
event and recycled the same pool on re-entry. About 75 seconds of browser
lifecycle observation ended at 783 cumulative births, zero remaining bubbles.
An additional whole automatic passage ended at 178 births and zero bubbles.
No browser console errors were recorded in the selected captures/checks.
This is bounded-duration observation, not an hours-long soak or a GPU leak proof.

Desktop 1280×900, narrow 900×900 and portrait 390×844 were captured in motion.
Live resize during an event exercised all three sizes; the refraction target
matched the drawing buffer each time. Portrait reduces birth rate and caps hero
angular size without lowering render resolution. Close ambient bubbles can
still briefly occupy roughly a quarter of the narrow screen; the attached
portrait clip is the review evidence for that tradeoff. No portrait camera
choreography was changed.

### Performance: separate from recording

Actual path: **NVIDIA WebGL2**, ANGLE RTX 4070, Brave/Chromium 152.0.7977.76,
Three 0.175.0 WebGPURenderer with WebGL backend. Host: i5-14600K, 62 GiB RAM,
RTX 4070 12 GiB, driver 610.57.04. Every matched run used viewport/drawing buffer
1280×900, DPR 1, 4× MSAA, fixed specimen quality, adaptive quality disabled,
bloom off (normal production path), 6 s initial warm-up plus 1 s after settling,
then 30 s / approximately 1800 completed renders. No screenshot or video capture
ran during these measurements. Camera/school/M2 state match exactly in the saved
baseline/candidate JSON; held simulation and shader time make those comparable.

| Condition | Median ms | p95 ms | Maximum ms | >50 ms |
| --- | ---: | ---: | ---: | ---: |
| Accepted M3, calm | 16.7 | 18.4 | 24.9 | 0 |
| Bubbles, calm (0 ambient / 0 heroes) | 16.7 | 18.6 | 25.4 | 0 |
| Accepted M3, matched peak scene | 16.7 | 17.7 | 18.5 | 0 |
| Final optics/composition, peak (127 ambient / 3 heroes) | 16.7 | 18.3 | 23.0 | 0 |

Peak pool distribution was 109 small / 20 medium / 1 large; fixed ambient draw
capacity remains 128. Counts mean live alpha >0.01, **not frustum-visible bubble
counts**. Typically 2–3 heroes coexist during the dense interval, never over 3.

These are **render-completion intervals, not GPU timings**. The 60 Hz pacing
limits what can be inferred about GPU headroom. Peak p95 increased 0.6 ms and
maximum 4.5 ms in this comparison; no quality reduction hides that cost. A
separate freely evolving 5 s peak run measured 16.6/20.0/26.6 ms median/p95/max;
controller CPU cost was 0.10/0.20/0.30 ms. Held-state controller CPU is unmeasured,
not zero. The final 33 s automatic moving-camera passage, including event entry,
measured 17.6/21.0/44.3 ms with no >50 ms intervals and controller CPU
0.10/0.20/0.60 ms. This last run is not a matched baseline comparison.

Approved M2's historical 16.6/17.7/18.9 ms is retained in the parent M3 report as
context, not a new run or a claim of improvement. Raw timings, source identities,
hardware/browser details and exact-state comparisons are in the evidence below.
Calm was measured at `8b5c7f3`; final peak composition at `3d9be73`; final automatic
review at `d8b8a0d`. The last runtime change only repairs DEV replay scrolling.

### Actual browser evidence

- [Primary automatic passage — calm → curtain → calm](bubble-evidence/automatic-review/motion.mp4)
- [Bell crossing: live optical motion](bubble-evidence/bell-crossing/motion.mp4)
- [Desktop passage with timed checkpoints](bubble-evidence/tissue-desktop/motion.mp4)
- [Narrow passage](bubble-evidence/tissue-narrow/motion.mp4)
- [Portrait passage](bubble-evidence/tissue-portrait/motion.mp4)
- [Accepted single-lens reference before editing](bubble-evidence/single-lens-before/motion.mp4)
- [Existing ocean journey before editing](bubble-evidence/journey-before/motion.mp4)
- [Retained single-lens fixture after refactoring](bubble-evidence/retained-single-lens/motion.mp4)
- [Temporal contact sheet from the primary browser clip](bubble-evidence/final-passage-sequence.png)
- [Matched comparison: ambient-only left, live refraction right](bubble-evidence/final-bell-comparison.png)
- Full-size matched [clear ocean](bubble-evidence/bell-crossing/matched-clear.png),
  [ambient-only](bubble-evidence/bell-crossing/matched-ambient-only.png), and
  [live bubbles](bubble-evidence/bell-crossing/matched-bubbles.png)
- [Lifecycle/resize/re-entry results](bubble-evidence/final-lifecycle/lifecycle.json),
  [idle/activation/hidden-tab results](bubble-evidence/idle-return/lifecycle.json),
  [production query guard](bubble-evidence/production-guard/capture.json),
  [timing and matched-state summary](bubble-evidence/bubble-summary.json)

The matched bell frames freeze the same actual scene/shader state at a natural
bubble crossing (not a repositioned animal), toggle only the optical/ambient
presentation, then resume for the motion clip. The refractive change affects
75,736 color channels by more than 3/255 relative to ambient-only; that is a
pixel-difference check, not a visual-quality score. No generated images or
prerecorded ocean texture were used. Contact sheets are sampled browser frames.

Final desktop/narrow/portrait/optical footage was captured at `3d9be73`; the
automatic-review and production guard at `d8b8a0d`. Lifecycle evidence was
captured before the later birth-composition and DEV-scroll refinements; neither
changed pools, cleanup, field sampling, optics, target resizing or activation.

Runtime files changed: `src/scene/HeroScene.jsx`,
`src/scene/glass/LiveOceanLens.js`, `src/scene/glass/BubblePopulation.js` and
`src/scene/glass/BubblePassage.js`. Supporting changes are the scoped instructions,
five focused tests, the existing browser evidence driver, summary script and this
report/evidence. Original user edits/research are not included in these commits.

## Honest approximations / scope

This preserves M3's existing screen-space live color and opaque-depth model.
Transparent layers have no individually recoverable depth: a transparent film
or animal in front cannot always be separated perfectly from color behind.
Hero-over-hero optics are nearest-priority composition, not nested refraction.
There are no scene reflections, offscreen reconstruction, caustics or physical
air/water total-internal-reflection appearance. Weak effective optical contrast
and bounded edge displacement keep the effect stable and restrained.

The emitter volume is composed at birth relative to the current view, not an
authored fixed geological vent. There is no seabed/vent work, no new camera shot,
no full idle glass, clock refraction, merging/splitting or later milestone.
Ordinary picking remains the approved unrefracted camera ray.

The curtain is intentionally a short, restrained event. Optical bending is easiest
to judge against luminous tissue and tentacles; against empty dark water, a hero
is mainly a subtle edge. The population is varied ellipsoids, not fluid bubble
merging/splitting or turbulent shape simulation. Transparent-object approximation
can still affect close overlap; no physically exact layer separation is claimed.

**NOT TESTED for this refinement:** hardware WebGPU, SwiftShader multi-bubble
WebGPU, physical phones/tablets, Safari or Firefox. Previous isolated M3 software
WebGPU evidence does not validate this new multi-bubble path. The legacy
full-ocean WebGPU issue remains separate and unresolved.

M1 anatomy/material/motion and M2 current/snow/wake/activation implementations are
unchanged; optical changes are confined to what is seen through bubbles. Camera,
seabed and idle source remain unchanged. Production query guards were exercised
in a real browser. The default experience and live Pages were NOT changed.
No push, merge, deployment, full idle integration or later milestone was started.
