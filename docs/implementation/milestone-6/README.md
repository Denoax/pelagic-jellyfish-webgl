# M6 — abyssal hydrothermal sanctuary

## Status: PARTIAL

The spatial replacement is implemented and locally reviewable. It is **not yet an artistically accepted sanctuary**: the plume can read as ordinary gray smoke, close mineral patterning is too conspicuously procedural, diffuse activity is weak, and portrait framing clips the landmark. Genuine thermal refraction is not implemented. These are reasons to retain PARTIAL even if automated validation passes.

A separate **pre-existing visual idle-return defect** was reproduced on approved M5.2 and M6: cyan tissue disappears while pink anatomy remains. State assertions alone passed and missed it; actual screenshot review caught it. It is documented, not silently repaired by changing protected idle/animal systems.

Approved starting SHA: `aef830b1619eef71e36be4e8b4cd8b924fb1bd8a`.
Branch: `milestone-6-abyssal-vent-sanctuary`.
Runtime/evidence SHA: `963174b2507ed89768ee36cdc2ea2096abe1dadc`.
Repository: `https://github.com/Denoax/pelagic-jellyfish-webgl.git`.
Worktree: `/home/mani/dev/jellyfish-studio/m6-sanctuary`.

```sh
cd /home/mani/dev/jellyfish-studio/m6-sanctuary
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
npm run dev -- --host 127.0.0.1 --port 5198
```

Open <http://127.0.0.1:5198/?renderer=webgl&idle=300>. Use **View → Deep**, click away from the menu, then **End** to inspect the destination. Scroll upward to compare approach/reveal; View → Explore retains the approved controls. `?sanctuaryBlockout=1` is development-only grayscale inspection, not a new public control.

## Audit and research provenance

[Research and baseline audit](RESEARCH-AUDIT.md) records the NOAA, Schmidt, MBARI, WHOI, Unseen, Unknown Worlds and Three sources actually reviewed, with direct links and distinctions between text, imagery and video inspection. No purchased/copied hero asset, new dependency, or generated raster art is used.

Adapted: one towering irregular landmark, overlapping basalt flows, mineral precipitation rather than combustion, focused discharge transitioning to lateral dilution, local diffuse communities, cold darkness revealed by biological light. Rejected: ROV floodlight brightness as natural illumination, tropical reef species, lava-zone orange/emission, Lost City carbonate chemistry applied to a sulfide vent, and a raymarched volume.

Public main and the latest successful Pages run inspected read-only both identify `a2ed3bc89c700ba5c792ecac19747939e9f09b8d`, run [34182837955](https://github.com/Denoax/pelagic-jellyfish-webgl/actions/runs/34182837955). The actual public browser loaded `index-Du7wn8Xk.js` / `index-DpyDdchG.css`, reported `milestone-4`, and showed the older shallow/lava-treated ending without the M5 View menu. The deployment SHA is correlated from Actions/main; the HTML does not embed that SHA. The newer approved **local** M5.2 commit, not public main, was used as the development baseline.

Process deviation: fresh scientific/reference and local baseline work preceded edits, and the blockout preceded material work. However, the standing protocol's **public-site-first** ordering was missed: fresh public browser inspection happened later, not before source work. The September 7 documents were found in the original site's untracked research directory and read there; they were not silently invented or copied into this branch. Their older warm-crack suggestion was superseded by the explicit M6 no-lava direction.

Original dirty `site` worktree and approved M5.2 worktree were preserved. No reset, clean, force checkout, stash, merge, push or deployment was performed. The untracked `node_modules` symlink in this worktree is an installation convenience, not committed source.

## What changed

Old environment: Y −7.85, 144×144 terrain, scanned rock texture, randomly placed rubble, shallow *Acropora palmata*, kelp-like blades, orange fissures/bubbles and an orange light plus moving fill lights. Solid material alpha was multiplied by a `.62–.90` journey reveal. It read as a nearby decorated floor, without one strong destination.

New environment:

- Nominal floor **Y −15**, with a shallow local basin depression; **192×192** world units centered around Z −28.
- Five large closed, fractured shelves, 60 instanced pillow lobes arranged in four coherent flow groups, rather than uniform random rubble.
- One active complex at **X −4.6, Z −24**. Main crown is 12 units above nominal floor; four merged, bent/irregular columns with recessed thick outlet, side lobes and 112 small mineral accretions. Approximate combined chimney bounds: **5.17 wide × 12.78 tall × 4.76 deep**. Feet are buried into sampled terrain, not floating above it.
- Two inactive columns, 6.2 and 7.4 units tall, provide subordinate depth cues. There is one shared layout for all cameras.
- Three localized mineral/microbial masks shaded directly onto the ground, 18 instanced tiny tube forms and quiet diffuse movement. No shallow coral/kelp replacement catalog.
- World-space procedural pigment/crust and derivative surface-gradient relief using installed r175 TSL. Solids are opaque, depth-writing, and never journey-alpha faded. Existing ocean fog handles distance; no new water/fog/camera path.
- Historical coral, scanned rock and concept assets remain in the repository but are no longer instantiated in this deep environment.

### Runtime files

| File | Responsibility |
| --- | --- |
| `src/scene/PelagicEnvironment.js` | Remove legacy deep construction/loading; delegate deep environment; preserve original distant animals and water layers |
| `src/scene/HeroScene.jsx` | Connect the existing current field, animal interfaces and camera read-only; DEV diagnostics |
| `src/scene/sanctuary/Sanctuary.js` | Pre-created resources, integration, update, state and cleanup |
| `src/scene/sanctuary/geology.js` | Deterministic floor, shelves, pillow flows, chimney and accretions |
| `src/scene/sanctuary/materials.js` | Opaque mineral materials and one pooled animal-light contribution |
| `src/scene/sanctuary/VentDynamics.js` | Fixed-step bounded current-coupled discharge and light selection |
| `src/scene/sanctuary/VentParticles.js` | Two instanced transparent particle batches |

Other changed files: `AGENTS.md` (M6 scope), this report and research audit; `scripts/m6-{audit,benchmark,clearance,matched,review,lifecycle}.mjs`; two diagnostic lines in `scripts/specimen-evidence.mjs`; `tests/sanctuary.test.mjs`; and the two prior environment-wide parity guards in `tests/{bubble-passage,live-lens}.test.mjs`. Those guards now allow the authorized deep-environment replacement while new tests explicitly protect the original distant field, water helpers/update and closed milestones. They were not presented as byte parity for a file that necessarily changed.

## Plume and local lighting

Preallocated **144 focused plume + 48 diffuse + 80 local benthic snow = 272 particles**, in two instanced quad draws. Normal alpha blending, no additive smoke, no depth writes. Eight solid geometries/four solid materials plus two particle geometries/materials; no additional scene-color/depth target, no new full-screen/ocean pass, no new Three PointLight, no shadow map.

Focused discharge starts at the actual outlet. Source buoyancy decays with age, spatial/time-continuous turbulence and height-dependent entrainment widen the plume, and a bounded low-pass sample of the existing M2 CurrentField increasingly carries older particles sideways. Fixed 1/60 stepping, bounded catch-up, finite 15–20 second particle lives and smooth birth/death envelopes. The constructor pre-establishes 20 seconds of discharge, so the vent is not born when the visitor arrives. Local snow settles except near vent updraft; global M2 snow is unchanged. Source particles are seeded and reused, not allocated on every emission.

**Thermal optics limitation:** M3's scene color is current only during active bubble passages; otherwise its renderer goes directly to output. Reusing that target from vent geometry would risk stale sampling/feedback, while forcing it continuously would change M3's approved path/cost. It was not reused. The inexpensive fallback is diffuse particle/density movement only, **not optical refraction or distortion of the live ocean**. It does not yet satisfy the desired clear-water shimmer.

Lighting uses one pooled shader contribution selected from existing visible/present animal states near the landmark, with hysteresis and fade-out before ownership changes. It follows that animal's position and approved cyan/blue identity; existing activation increases its bounded strength. It reveals nearby mineral surfaces and adds a small cool edge contribution to particulate, then subsides. It neither activates other organisms nor changes plume buoyancy. There is no separate floor-wide pulse or recursive interaction. The old deep point/hemisphere lights were removed; a dim material-local normal-dependent fill remains for legibility. This is an artistic irradiation approximation, not measured biological radiometry or global illumination.

## Physical depth and camera protection

1201 samples per unchanged cinematic track. Old numbers below are **vertical clearance to the old analytic floor**, not clearance to every old imported rock. New vertical values use the new floor; new solid clearance is an offline BVH nearest-triangle query over actual candidate solids.

| View | Old floor minimum | New floor minimum | New nearest-solid minimum |
| --- | ---: | ---: | ---: |
| Documentary A | 5.148 | 12.558 | 11.725 |
| Drift B | 4.555 | 11.966 | 11.147 |
| Intimate C | 5.183 | 12.594 | 11.067 |
| Deep D | 3.927 | 11.321 | 11.149 |

No cinematic camera was moved. Grayscale A/B/C/D captures, 9/12/14 height comparisons and four Explore azimuths preceded final materials. 12 gave the strongest scale without the 14-unit version's overhead crowding. The floor is physically farther away; reverse travel reveals/recedes through the same opaque geometry rather than dissolving it.

Limits: free Explore still has no collision, as requested; it can enter solids or reach finite terrain edges. A sampled 20-second deep-end animal observation found the closest center 2.695 units from the source core, but this is **not an exhaustive all-time animal/jet intersection proof**. Existing wide camera framing clips much of the left-hand chimney in 390-pixel portrait. The camera was not redesigned to hide that defect.

## Browser evidence and comparison limits

Evidence root: `/home/mani/dev/jellyfish-studio/m6-evidence/` (external local evidence, not pushed binary media).

Quick local links: [matched before](/home/mani/dev/jellyfish-studio/m6-evidence/matched-before/deep.png), [matched after](/home/mani/dev/jellyfish-studio/m6-evidence/matched-after/deep.png), [full-size desktop motion](/home/mani/dev/jellyfish-studio/m6-evidence/full-desktop/motion.mp4), [portrait motion](/home/mani/dev/jellyfish-studio/m6-evidence/final-portrait/motion.mp4), [production lifecycle](/home/mani/dev/jellyfish-studio/m6-evidence/lifecycle-production-correct-base/motion.mp4).

- `before/`: approved M5.2 A/B/C/D states and actual browser motion.
- `matched-before/` and `matched-after/`: `approach.png`, `first.png`, `full.png`, `deep.png` plus states. Same seed 7183, animal inspection time 14, identical camera states and 1280×900 drawing buffers/backend. Foreground specimen states match exactly. Some swarm positions differ by approximately .01–.02 world units from frame-step settling; these are comparable, **not pixel-identical entire-scene snapshots**. TSL time/noise is not frozen.
- `blockout-12/`, `blockout-scales/`, `blockout-explore/`: grayscale gate evidence.
- `full-desktop/motion.mp4`: full-size **1280×900, 110.49 seconds, 3297 captured frames**. Drift/Deep/Documentary final descent, stationary observation, reverse/re-descent, Explore orbit, outlet and base detail, then 820×900 resize. Camera-mode switches and the explicitly scripted Explore inspection positions are intentional review repositioning, not edits to production camera tracks. The earlier `final-desktop/motion.mp4` (107.68 seconds, 3156 frames) used a 780×500 headless capture surface; it is retained but superseded as primary motion evidence. Screenshots and performance buffers were already 1280×900; capture correction did not change runtime quality.
- `final-portrait/motion.mp4`: **52.65 seconds, 1580 timestamped browser frames**, 390×844 Drift/Deep descent, reverse/re-descent and final composition. Portrait cropping is visible, not hidden from the evidence.
- Desktop stills: `B-approach.png`, `B-first.png`, `B-end.png`, `D-end.png`, `explore-orbit.png`, `smoker.png`, `diffuse-detail.png`, `reverse.png`, `redescend.png`, `narrow-resize.png`. `smoker.png` has a foreground animal partially occluding the close outlet; the full clip provides temporal context.
- `final-all-modes/`: final-material A/B/C/D .5/.72/1 audit, including Intimate. `baseline-full-motion/`: full-size equivalent approved-M5.2 mode audit. These intentionally switch/seek camera states and are not represented as continuous natural descents.
- `live-reference/`: actual older public release capture. `references/`: scientific and Unseen visual material, not runtime assets.

These are real Brave/CDP captures encoded with FFmpeg at captured timestamps, not generated imagery or reconstructed still-image animation. Recording intervals are not used for performance claims.

## Validation and performance

See [validation and benchmark results](VALIDATION.md) for exact measurements, lifecycle outcomes and commands.

Baseline: production build followed by **76/76 tests**; first pre-build run was 75/76 because the Sites bundle test needs generated dist. Candidate: production build and **82/82 tests**, approved-motion parity (720 frames/24 checkpoints) and default-animal parity (240 frames/8 checkpoints) pass. Existing bundle-size warning remains.

Scientific/visual anti-failure check: no instantiated tropical coral, kelp, orange fissures/lava bubbles, volcanic floodlights, sunlight caustics, boiling effect, glowing garden, or solid-alpha reveal. One landmark, dark basalt, sparse base communities and localized animal light exist. **The mineral-plume appearance, close rock material, convincing diffuse shimmer and portrait composition do not yet clear the visual bar.** No claim of scientific simulation is made.

Protected M1 anatomy/material/motion/activation, M2 field/wakes/snow, M3 refraction, M4 population, M4.1 optimization, all M5.2 tracks, View, scroll and idle source remain unchanged. New scenery necessarily changes occlusion and the view, but the approved organisms and controllers were not redesigned. Hardware WebGPU, software WebGPU, Firefox, Safari and physical mobile are **NOT TESTED** here; the legacy full-ocean WebGPU issue is not claimed fixed.

**Local deep environment changed; live Pages did not. Nothing pushed, merged or deployed. M7 was not started.**
