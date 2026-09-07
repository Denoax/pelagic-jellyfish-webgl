# Milestone 4 — one animal family across the population

**Status: READY FOR VISUAL REVIEW.** Local development only; this is a review
candidate, not user visual approval. The denser close encounters have a measured
performance cost, detailed below, and portrait composition remains inherited.

## Identity and review path

- Repository: `Denoax/pelagic-jellyfish-webgl`, `/home/mani/dev/jellyfish-studio/site`.
- Approved M3 baseline and starting SHA: `41026098e242ea41af3bd8d881e493ddaf43d2bf`.
- Branch: `milestone-4-population-lod`.
- Frozen runtime under final review: `3b4074d2aa62bb0acfabd9e3d77c93ab46c295f2`.
- Public/main inspected: `a0501c21f8c782887bf6a5e1257e955ada41b678`.
  [Successful Pages build 34133364127](https://github.com/Denoax/pelagic-jellyfish-webgl/actions/runs/34133364127).
  Actual public browser loaded `index-Bt9kzCir.js`, release `milestone-2`.
  Public Pages is not the approved local development baseline.

The candidate server is running at:

`http://127.0.0.1:5178/?populationLod=1&bubblePassage=1&renderer=webgl&idle=300`

Normal native scrolling uses the existing journey; **B** runs the existing
development bubble-passage tour. Use `idle=30` instead of `idle=300` to inspect
ordinary idle entry. No inspection controls are added to production artwork.

Reproducible server command, if the current process has been stopped:

```sh
cd /home/mani/dev/jellyfish-studio/site
npm run dev -- --host 127.0.0.1 --port 5178 --strictPort
```

The exact M3 comparison worktree is detached at the approved SHA, serving
`http://127.0.0.1:5187/?bubblePassage=1&renderer=webgl&idle=300`.

## What changed

Previously the 6/8 main animals selected hero/companion geometry through fixed
IDs (desktop 0/2/4/5, mobile 0/2/5). Only ID 0 used approved M1 anatomy.
The separate 7/14 background animals used instanced hemispheres, additive
shells, torus rims and eight line strands. They already swam and rotated;
the defect was inconsistent anatomy/material identity, not absent movement.
Only main animals participated in picking.

The opt-in candidate adapts **LivingAppendages**, not a new animal engine.
Every animal uses its approved cyan tissue, pink internal anatomy, violet
folded membranes, activation materials and restrained luminous texture.
The existing two route owners still supply positions, orientations and pulse
state. No camera or route was rewritten. Former background IDs can become
near-quality and interactive when they occupy enough screen space.

Runtime changes are confined to:

| File | Responsibility |
| --- | --- |
| `src/scene/HeroScene.jsx` | DEV-only switch, controller ordering and disposal |
| `src/scene/population/Importance.js` | Projected size, hysteresis, deterministic variation, picking eligibility |
| `src/scene/population/SurfaceLod.js` | Compatible grid sampling/morphing; cached exact approved surface equations |
| `src/scene/population/PopulationAnimal.js` | Reusable approved-animal adapter, tier geometry/strands and cadence |
| `src/scene/population/PopulationDetail.js` | Existing background pose adapter, importance selection, bounded light/fleck pools |

## Detail policy

The primary signal is **projected bell diameter in CSS pixels**, using world
radius, camera-space depth, FOV, zoom and viewport height. DPR and adaptive
drawing-buffer resolution are deliberately not inputs: changing render scale
must not cause a population-wide detail collapse. Conservative appendage bounds
retain detail while a clipped bell's arms still occupy the picture.

| Tier | Thresholds | Bell triangles | Four-arm triangles | Fine tentacles |
| --- | --- | ---: | ---: | ---: |
| Far | Below medium band | 648 | 1,792 | 6 |
| Medium | Enter at 32px; leave below 24px | 1,476 | 3,584 | 11 |
| Near | Enter at 110px; leave below 90px | 4,968 | 7,040 | 22 + 10 internal filaments |

Triangle counts above describe bell and membranes, not total scene geometry.
All tiers retain four folded arms and the same rolled-margin parameterization.
All use the original material family; there is no brightened far shader or
replacement flat icon. The existing mipmapped tissue masks filter speckles
with distance. Near/medium/far geometry resources are preallocated and reused.

Adjacent transitions last 1.2 seconds, reverse from their current state, and
use hysteresis. One rendered high grid collapses onto the actual triangles of
the lower grid. There are **not two alpha-blended copies** of the animal.
Strands fade in width before their index subset is removed. Fine chains awaken
from a neighboring persistent chain, preserving local velocity. The four oral
spines remain persistent; lower meshes resample them, not a separate animation.

Large animals receive full deformation cadence regardless of the director's
featured-ID flag, without borrowing that flag's extra illumination. Invisible
meshes stop rebuilding; swimming/spines remain live and meshes refresh on entry.

## Variation, interaction and water

Deterministic per-animal variation is bounded to bell width ±4%, bell height
±8%, oral-arm rest length ±6%, and organ orientation ±0.08 radians. Existing
route/pulse phases remain intact. No random rainbow palette or independent
wobble. Reference ID 0 has identity variation values, **not a privileged tier**.

Picking requires at least 24px projected diameter, conservative visibility,
and presence above 0.15. It uses the existing raycaster and tissue activation
interface, including the M2 local environmental response and nonrecursive echo.
Tiny animals are not made indiscriminately clickable.

Local flecks and lights use four pooled resources on desktop, three on mobile.
Flecks are assigned to prominent animals above 80px, never 22 permanent halos.
Unassigned flecks continue aging independently in world space. Ordinary wake
births from tiny/offscreen animals are filtered before occupying the existing
bounded M2 field. Already-born wakes decay normally; direct activation and
echoes are unfiltered. The field method is restored at controller teardown.
This changes opt-in **population participation**, not the approved M2 equations.

## Preservation and limitations

M1 anatomy/material/swimming sources, M2 ocean sources, M3 lens/bubble sources,
camera/director, seabed, idle, renderer and package versions are unchanged.
The near reference adapter's visible geometry attributes—including normals,
UVs, colors and traveling activation signal—are exactly equal to the approved
implementation in the focused deterministic comparison. Its unchanged material
recipe is used directly. This is not a claim that the *whole new population*
is pixel-identical: replacing the other animals is the point of this milestone.

Pure CPU savings remove overwritten legacy-cap calculations, invisible rib and
pearl updates, and repeated time-independent membrane terms. No near mesh
density, simulation quality, render resolution or bloom was lowered to conceal
cost. Original near resources are retained for disposal; lower caches belong
to the adapter.

Known compromises to judge in motion:

- Existing camera crops and overlapping close animals remain. Portrait
  choreography was not redesigned.
- The old distant field still computes its original route/strand state even
  though its graphics are hidden: retained CPU overhead, not a claimed saving.
- Tier resources and canonical tissue textures are preallocated per animal.
  This is not a full instancing or shared-texture memory optimization.
- Medium/far membrane meshes retain 17 transverse fold samples; reductions are
  mostly longitudinal sampling, bell samples and fine strand count.
- Conservative visibility counts can include a partly clipped animal and are
  not exact pixel-occlusion counts.
- The pre-existing bubble screen-space optical approximations and unrefracted
  picking ray remain; no M3 optical rewrite.
- A 60Hz-capped held scene is not proof of zero GPU cost. Moving tests exposed
  a real tail-latency cost that is reported rather than hidden.

## Validation and evidence

Baseline: 44 existing tests, two parity scripts, production build PASS.
Candidate runtime: 54 tests, both parity scripts, production build PASS.
There is no general `npm test` script. Exact commands:

```sh
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
```

The existing npm global `tmp` configuration warning and Vite >500kB chunk
warning remain. Passing these checks does not establish visual acceptance.

Browser evidence is actual Brave/CDP footage, not generated imagery, emulated
animation, or a still-image slideshow. Capture and encoding are separate from
uncaptured performance runs. Seed, held time, viewport, quality and native
journey checkpoints match. The pre-existing variable-step route integrator
leaves small pose/aim differences between separate runs; comparisons are not
claimed pixel-exact. Raw state accompanies the frames.

Evidence root: `/home/mani/dev/jellyfish-studio/m4-evidence`.
Selected portable evidence is in `evidence/` beside this report. Final candidate
folders end in `-final` and record runtime `3b4074d`; earlier candidate captures
in the external evidence root are historical diagnostics, not final evidence.

### Matched frames

Open the full-resolution pairs; all are the real ocean at 1280×900/DPR 1,
with the same held simulation/shader time and native journey checkpoint.

| Scene | Approved M3 | M4 candidate |
| --- | --- | --- |
| Opening hero, time 9 | [Before](evidence/matched-before-opening/matched-clear.png) | [After](evidence/matched-after-opening-final/matched-clear.png) |
| Distant school, progress .06/time 26 | [Before](evidence/matched-before-far-school/matched-clear.png) | [After](evidence/matched-after-far-school-final/matched-clear.png) |
| School, progress .52/time 26 | [Before](evidence/matched-before-school/matched-clear.png) | [After](evidence/matched-after-school-final/matched-clear.png) |
| Secondary encounter, progress .68/time 26 | [Before](evidence/matched-before-secondary/matched-clear.png) | [After](evidence/matched-after-secondary-final/matched-clear.png) |

The opening reference remains visually consistent; nearby smaller animals now
show pink anatomy and folded oral mass. In the secondary encounter, the old
concentric construction lines and pale flower-like cores are replaced by the
approved M1 tissue recipe. Far animals are darker and less uniformly white;
small membranes remain recognizable rather than becoming flat caps.

### Motion and interaction evidence

- [Approved M3 native journey](evidence/review-before-journey/motion.mp4).
- [M4 native journey, forward and backward](evidence/review-after-journey-final/motion.mp4).
- [Tracked former background animal #11](evidence/review-tracked-11-final/motion.mp4).
  The small identifier is injected only by the evidence tool, never by runtime
  artwork. It does not move the animal or camera.
- [Bubble passage](evidence/review-bubbles-final/motion.mp4).
- [Clicking secondary/background animals](evidence/review-population-clicks-final/motion.mp4).
- [900×900 narrow](evidence/review-narrow-final/motion.mp4) and
  [390×844 portrait emulation](evidence/review-portrait-final/motion.mp4).

The unlabeled candidate journey has 2,090 captured browser frames over 73.91s.
Frame sequences were inspected around promotion, pulse/turn and bubble overlap;
there is no in-tool real-time video player, so this is sampled temporal visual
inspection plus actual delivered footage, not a claim of human playback review.
No obvious model replacement or color jump was found in the inspected sequences.
Your motion review remains the artistic acceptance gate.

Animal #11 in the unlabeled journey grows from ~36px to ~127px and promotes to
near despite being a former instanced background ID. Detail moves continuously
through 0.92 → 1.91 → 2 around the .70-to-.92 journey transition, then returns
through lower detail during the reverse
journey. `population.json` records one-second states for every animal. The
existing camera occasionally takes it outside the frame, so this is a native
journey demonstration, not an invented uninterrupted hero tracking shot.

A final focused check caught dormant internal filaments stretching on re-entry
after medium-detail travel. The adapter now seeds those near-only filaments
from a live core strand before their width rises. The diagnostic maximum reach
fell from 19.8 to 3.04 local units; its longest rest length is 3.54. Continuously
near reference anatomy/motion is unaffected. All final browser captures and
timings were rerun after this fix; a permanent regression test covers it.

Real raycast clicks hit the requested IDs **3, 11, 17, 14**. The existing M2
interface accepted four local activations and produced three subdued echoes;
after settling, activations and pending echoes were both zero. Ordinary wake
activity continued. See [click log](evidence/review-population-clicks-final/clicks.json).
This includes former background IDs, not merely the original hero.

Representative desktop journey counts (conservative bounds, rounded blended
tier, not exact pixel occlusion):

| Progress / pass | Near | Medium | Far | Outside/presence-hidden |
| --- | ---: | ---: | ---: | ---: |
| Opening | 1 | 5 | 4 | 12 |
| .28 bubble entry | 2 | 4 | 2 | 14 |
| .52 forward school | 3 | 10 | 1 | 8 |
| .70 secondary | 4 | 7 | 1 | 10 |
| .92 late approach | 2 | 0 | 0 | 20 |
| .52 reverse school | 5 | 7 | 2 | 8 |

Desktop/narrow/portrait tours completed with zero browser errors. Portrait
keeps the existing 13-animal budget and mobile resource pool; narrow has 20,
desktop 22. The scene remains responsive, but inherited portrait framing can
leave the primary school offscreen and clip long appendages. That is explicitly
not presented as solved by M4.

### Lifecycle checks

The 96.8-second lifecycle sequence crosses out of and back into bubble water
five times, resizes 1280×900 → 900×900 → 390×844 → 1280×900, and clicks existing
animals. No browser errors. A genuinely hidden tab returned after two seconds
with only ~0.142 seconds of simulation advance, not two seconds of catch-up.
The separate idle check entered, dismissed, and successfully activated an
animal afterward; its hidden-tab check likewise advanced only ~0.108 seconds.

Geometry reporting warmed from 182 to 199 as cached tiers were first drawn,
then stayed at 199 through the later re-entries. Reported textures rose by two
per resize, then plateaued at 90. **This is not claimed to prove constant VRAM.**
The same +2-per-resize counter behavior exists in the pre-M4 M3
`evidence/candidate-resize/resize.json` (28→30→32→34). Installed r175
`renderers/common/Textures.js` destroys render-target attachments through
`_destroyTexture` but decrements its counter only through the separate texture
dispose listener. This explains why that counter alone is not a reliable
live-allocation measure after target resize. No renderer/M3 patch was made.

The separate 180.78-second observation advanced 178.65 simulation seconds,
completed with zero browser errors and finite state, and made 14 click attempts
(not 14 claimed hits). Activations and pending echoes ended at zero. Geometry
reporting warmed from 165 to 203; textures from 80 to 82 as optics first became
active. Raw [observation](evidence/review-observe-final/observation.json),
[resize/re-entry](evidence/review-lifecycle-final/lifecycle.json), and
[idle/return](evidence/review-idle-final/lifecycle.json) records are included.

Requested device DPR 2 exercises the existing 1.25 renderer cap; the measured
ocean buffer is 1600×1125 at the same 1280×900 CSS viewport. LOD remains based
on CSS projected size. This is explicitly not a claim of rendering at DPR 2.

The local production-profile browser check requested the M4/M3 query flags
and confirmed that `__POPULATION__`, `__SPECIMEN__` and `__BUBBLE_PASSAGE__`
were absent. DEV artwork did not leak into the production release path.

Environment: Three.js 0.175.0, existing WebGPURenderer using real **NVIDIA
WebGL2**, Brave Chromium 152.0.7977.76, RTX 4070/ANGLE OpenGL ES 3.2,
i5-14600K, approximately 62GiB RAM. Desktop measurement viewport/drawing buffer
1280×900, DPR 1, fixed review quality, normal production bloom disabled,
six-second ready warm-up plus six-second scroll settling; 30-second measurements
with continuous swimming at five native journey positions, and a 44-second
moving-camera journey. These final measurements do **not** freeze the animals.
Reported intervals are async render-completion
intervals, **not GPU timings**. The combined animal CPU probe includes the M2
update and population controller; it is not a pure controller timing.

### Baseline versus final candidate performance

All times below are milliseconds. Each fixed-progress case measured 30 seconds
after the warm-up described above. Camera aim and organisms continue moving at
that native journey position. Both runs used 1280×900 CSS **and** drawing buffer,
DPR 1, NVIDIA WebGL2, the same quality and normal bloom-off path. No capture or
video encoding ran during measurement. The moving B-key journey measured 44s.

| Case | Baseline median / p95 | M4 median / p95 | Baseline max → M4 max | >50ms baseline → M4 |
| --- | ---: | ---: | ---: | ---: |
| Opening | 16.7 / 20.0 | 16.7 / 18.7 | 32.4 → 27.6 | 0 → 0 |
| School | 16.6 / 18.7 | 17.1 / 19.7 | 29.5 → 23.6 | 0 → 0 |
| Bubble water | 16.7 / 20.1 | 16.7 / 18.2 | 28.7 → 25.5 | 0 → 0 |
| Distant school | 16.7 / 19.2 | 16.7 / 18.5 | 27.2 → 34.1 | 0 → 0 |
| Secondary close encounter | 16.5 / 21.7 | 18.7 / 22.9 | 35.7 → 35.7 | 0 → 0 |
| Moving camera / bubble journey | 17.2 / 20.7 | 16.5 / 25.9 | 58.8 → 74.4 | 1 → 1 |

The close encounter has **+13.3% median interval**; the moving journey has
**+25.1% p95 interval** and one 74.4ms stall. This is not cost-free population
parity or a claim of locked 60fps. The five fixed-position runs have no >50ms
stalls, and the family/detail improvement is ready to judge, but the moving
tail and dense close encounters remain performance compromises. Lower p95
in some capped cases is not evidence of a GPU improvement. These are single
paired runs with ordinary desktop noise, not confidence-bounded lab results.

The combined candidate animal/current/controller CPU median / p95 was
7.6 / 9.4ms opening, 13.8 / 16.4ms school, 10.3 / 11.8ms bubbles,
7.7 / 9.4ms distant school, and 16.0 / 20.1ms secondary. It cannot be subtracted
from the baseline's M2-only probe as if those measured the same work. The old
distant CPU simulation and persistent full oral spines are retained costs.

Baseline completed intervals: 1,800 per fixed case, 2,639 moving. Candidate:
1,802 / 1,797 / 1,803 / 1,801 / 1,616 respectively, 2,575 moving. Full
[measurement summary](evidence/performance-summary.json) includes dimensions,
start camera/animal states, sample counts, candidate CPU distribution, end tier
counts and renderer counters. Raw intervals are in the corresponding
`perf-live-*` and `perf-moving-review-*` folders. Final candidate folders end
in `-final`; older candidate timing folders are not this table's source.

An earlier draft had a 30.9ms moving p95. Exact-surface caching and avoiding
offscreen mesh rebuilding reduced that cost without lowering approved near
geometry, simulation settings or pixel ratio. The final filament fix was
followed by a complete fresh candidate timing pass; no older, faster draft
measurement has been substituted for final runtime `3b4074d`.

### Renderer work and resource cost

A separate read-only `Scene.onAfterRender` probe sampled the installed renderer
at the same sequence of native progress positions, six seconds apart, after
warm-up. These are single ocean-render snapshots, not CPU/GPU timings or maxima,
and they are separate from the 30-second measurements above. The sampler restores
the original callback afterward; the application source is not patched.

| Scene | Draw calls before → after | Triangles before → after |
| --- | ---: | ---: |
| Opening | 165 → 176 | 547,695 → 705,979 |
| School | 199 → 181 | 735,980 → 917,500 |
| Bubble water | 191 → 181 | 788,130 → 922,014 |
| Distant school | 216 → 184 | 661,831 → 750,267 |
| Secondary encounter | 182 → 181 | 561,135 → 797,323 |

Removing legacy construction layers/pooling does not mean fewer triangles:
canonical folded animals are richer than the old caps, even at reduced tiers.
Population resource allocation also increases. This is a quality/consistency
tradeoff, not a population-wide performance optimization over the cheap old
assets. [Before counters](evidence/review-render-counts-before-final/profile.json)
and [after counters](evidence/review-render-counts-after-final/profile.json)
include geometry/texture counts and exact simulation times.

### Untested environments and scope boundary

Hardware WebGPU, software WebGPU, other GPU vendors/browsers and physical mobile
are NOT TESTED in this milestone. The known legacy full-ocean WebGPU problem
is not repaired or claimed repaired. Portrait testing is browser emulation.

No push, merge, deployment, Pages update, or later milestone is authorized or
performed. Existing user AGENTS/research changes remain unstaged and preserved.
