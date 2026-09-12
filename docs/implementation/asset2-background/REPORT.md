# Asset 2 — background-only implementation report

## STATUS

**READY FOR MANI VISUAL REVIEW** — qualitative background/world gate, with the numerical guardrail misses explicitly retained below. This is not a claim of pixel matching or Mani's visual approval.

The completed comparison/review finds layered enclosing depth instead of a readable finite basin, a stronger blue-center/dark-border hierarchy, selective moving floor illumination, unobstructed approved animals, and continuous withdrawal into the abyss in Explore. All phases, adverse variants, motion, ablations, lifecycle and equal-quality measurements are recorded. The specification's§61–64 metric exception is used transparently: the result is ready to judge as an interactive world, **not** presented as achieving the30% image-error target. Original angular near geology and population composition remain visible compromises within the explicit read-only boundary.

Local review: <http://127.0.0.1:5222/docs/implementation/asset2-background/review.html>.
Use **Open repeatable QA pose** for the calibrated comparison, or open the interactive candidate to use all existing Views/Explore.

```sh
cd /home/mani/dev/jellyfish-studio/m7-2-contact-perf
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
node scripts/asset2-preview.mjs
```

The candidate is already running on5222. The exact approved baseline is on5221 (`node scripts/asset2-preview.mjs --baseline`). Do not launch a second server on an occupied port. Evidence is local, outside Git, at `/home/mani/dev/jellyfish-studio/asset2-evidence/`; the review page links those actual files.

## GIT

- Repository: `Denoax/pelagic-jellyfish-webgl`.
- Approved M7: **`bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`**.
- Initial checkout: `ab709b22f68e1bc0cd57f4bb70871ab67c609a01`, approved runtime plus supplied reference pack; initially clean.
- Branch: **`pre-m8-asset2-background`**.
- Result **runtime SHA: `99ac8336be832c18230dcadefd815308c6c83c8f`**. Subsequent evidence/report commits do not change this runtime.
- Five production files: new `src/scene/environment/{Asset2Environment.js,asset2Config.js,asset2Layout.js}`; one connection line in `HeroScene.jsx`; four ownership/import/update/disposal lines in `PelagicEnvironment.js`.
- `Asset2AOProof.js` is a rejected, unimported QA-only prototype, not production rendering.
- Scope tests compare every original `src` file with approved M7, allowing only those five exact integration lines. Existing worktrees and all pre-existing work were preserved.

## REFERENCE MATCH

Immutable source: `docs/reference/asset2/REF_00_ASSET2_ORIGINAL.png`, SHA256 `9226b64fa9dafc63753e25e333a58e157b033dfe21e9b6713ff02cea13dbac22`. All13 PNGs and both JSON documents were inspected along with the complete specification, README and research notes. The pack is unchanged.

The final QA fixture is the **existing Drift(B) track at .55, time8, seed7183**, FOV53,1672×941 actual drawing buffer,DPR1, exposure.94, normal bloom-off path. Camera position `[0.5642370370370373,-0.7495267509677421,-1.5095754305291214]`; quaternion `[-0.017628854191455136,-0.019758087781289953,-0.00034843464513902993,0.9996492985344516]`.

The original endpoint choice was corrected after motion review. A **baseline-only**45/55/65/75/85/100% pose sweep found55% closest to the drawn landmark scale; a baseline-only4/8/12/16 phase sweep selected8 for the closest right-side animal presentation. No camera track or actor definition changed. Historical endpoint evidence is retained and is not mixed into final metrics.

| Linear luminance metric | Reference | Approved M7 | Candidate |
|---|---:|---:|---:|
| Median | .002895 | .001402 | .002624 |
| p90 | .009287 | .005393 | .015277 |
| p95 | .014613 | .035052 | .036419 |
| p99 | .137051 | .140915 | .145189 |
| Fraction below .01 | 91.172% | 91.588% | 84.630% |
| Fraction below .02 | 96.111% | 93.345% | 92.005% |
| Center mean | .015620 | .005355 | .012099 |
| Border mean | .002988 | .003631 | .003625 |
| Center/border | 5.227 | 1.475 | 3.338 |
| Bottom-third edge density | .079099 | .153068 | .143282 |
| 64×36 low-frequency MAE | — | .01124820 | .01108234 |

**Full-image error improves1.47%, not the30% target.** Relative error is .98525, not≤.70. Dark coverage and center/border also miss the nominal87–94% and4.2–6.8 ranges. These are **not marked passed**. The center/border hierarchy is materially stronger without brightening the border, but it is not the reference's exact intensity organization.

The approved population differs substantially from the drawing: multiple large animals occupy the upper/right/lower frame where the reference has dark water or small animals. The bottom-third edge metric therefore includes approved tentacles and is **not a clean floor-only statistic**. Its6.39% reduction is reported without pretending it proves the floor target. Bright-reference-cell attribution explains only31.9% of candidate error; it is not proof that all residual error comes from animals. Remaining differences also include the restricted near geology, proxy shape simplification and approximate scattering. No masks, animal dimming, exposure normalization or camera changes were used to make the acceptance numbers look better.

Final fixed comparison and gray/blur/false-color/edge images: `final/comparison/`. Candidate original pixels: `phase-5/r10/on.png`; exact baseline: `temporal/calibrated-baseline/t8.png`. All four calibrated animation phases are retained in `temporal/calibrated-comparison-t*/`. The supplied center/border number uses an unspecified ROI; our documented central-half/outer10% ROI yields5.227 for the source itself rather than claiming to reproduce its4.643 scalar.

Temporal cross-check, same fixed pose: time4 error **worsens6.23%**; time8 improves1.32%; time12 improves4.31%; time16 improves3.32%. Pooled mean MAE .01176589→.01170063, only **.55% improvement**. This prevents presenting the selected still as a robust30% match. The separately captured time8 repeat differs slightly from the main ablation capture (1.32% versus1.47%); existing realtime environmental/particle state is not promised bit-identical merely by holding the specimen clock.

## ENVIRONMENT STACK

| Layer | Implementation and visual purpose | Incremental cost |
|---|---|---|
| Abyss | New scene background node, near-black blue radiance and world-presence fade; the view no longer ends at a brightly readable basin | Reuses background draw; no target/texture |
| Far spires | Four shared instanced silhouettes, distance extinction and approach withdrawal; larger enclosing world | Up to4 draws shared with mid proxies,640 unique vertices |
| Mid spires | Same30-instance field with stronger nearer contrast; separate depth planes, not a painted skyline | Same4 batches,9,456 submitted proxy triangles when all visible |
| Near geology | Original M6 geometry/scan/material graph, wrapped only on opaque environment surfaces with extinction and local pickup | No added mesh/draw; extra material arithmetic |
| Atmosphere | Three broad procedural density scales around one world-anchored blue opening, plus RGB geological transmittance | Shader arithmetic only; no raymarch/pass |
| Particles | Existing three M2 snow layers multiplied by a world-space corridor/depth/light presentation envelope | No new particles or draws; simulation unchanged |
| Benthic glows | Existing10 point materials,2.6× pre-extinction presentation; original five colonies/count/layout retained | No added draw/point/light |
| Jelly local light | Read-only reuse of one existing M6 AnimalLight; bounded, vertically elongated near-floor reveal | No added selection loop/light; opaque shader arithmetic |
| AO | Material-space normal/height/bedding grounding, on top of approved crevice treatment | No pass/target; arithmetic only |
| Shafts | Three weak analytic world-space envelopes modulated slowly by the same density | No geometry/draw/target |

Subsystem GPU times were **not** measured. Zero extra passes does not mean zero GPU cost. Whole-scene frame intervals below include all retained arithmetic and transparent proxy overdraw. New owner CPU bookkeeping is below the timer's resolution at median/p95; it is not the shader cost.

Final ablation assessment: far spires **high** gain in scale/depth; central haze **high** gain in intensity hierarchy; outer extinction **high** gain in removing authored-world boundaries; local light **medium**, dependent on the approved owner passing useful floor; particle presentation **medium**, without simulation change; material AO **low**, subtle grounding; shafts **low**, intentionally subordinate; static dither **low**, dark-gradient polish. All retained except the guide (**none**, removed) and GTAO (**none**, rejected). Off/on pixels are linked in the review page. Apart from the4 proxy draws, these retain existing draws and add shader arithmetic; no isolated GPU timing is invented for them.

## SPIRES

Four deterministic closed procedural archetypes;30 instances in six clusters; four InstancedMesh batches;640 unique geometry vertices and9,456 instanced triangles. Four geometries and one shared material, not30 unique materials.480 bytes of per-instance center/reference-distance attributes. Nothing is created or disposed during normal frames or Explore movement.

Reference rectangles are projected through the existing QA camera. Crown heights are fitted by binary projection; bases intersect the actual floor-height function and are buried. Their screen-bottom fit is constrained so bases lie inside the immutable48-unit camera far plane. The three nominal presentation bands are17–30/30–38/38–47; these are vertex/view-distance bands, not six equally spaced Z layers. All newly placed bases are behind z−30. No original near landmark is relocated or rescaled.

Contrast decays exponentially with distance and ends smoothly before clipping42→47. An approaching proxy withdraws smoothly at .4→.8 of its fitted reference-center distance; useful near geometry remains the approved M6 geometry. Side-view QA exposed weak-alpha self-overlap bands in R9: R10 resolves silhouette contrast in radiance and reserves alpha for withdrawal/world fades. Proxies depth-test but **never depth-write**, and render before the approved transparent population. This intentionally avoids invisible proxy depth masking transparent animals.

## ATMOSPHERE

Opaque-only transmittance is approximately `exp(-distance * density * [1.1,1,.92])`, multiplied by footprint, clip and Explore visibility. Density=.022 + up to.012 near the floor +.035 on raised geology + up to.030 at distance24→65. Original M6 material extinction remains underneath; this is deliberately not a global fog-node replacement.

Central radiance uses the ray toward a point35 units forward,5 left and2.8 up from the calibrated pose. An elliptical angular envelope is modulated by three low-amplitude world-space noise scales. No source image is stretched into the world. Environment blending uses the existing `Background.depth=progress^1.68`, with only this new owner's blend range .08→.34 (about22–53% journey).

Geometry-derived bounds: min`[-96,-19.04996109,-124]`, max`[96,-2.94500065,68]`; center`[0,-10.99748087,-28]`; **R135.76450198781714**; floorY−15. Radial geometry fade is `(1-smoothstep(1,1.65,r/R))²`; camera visibility uses1→2.1R. Background presence begins withdrawing at.85R. An additional actual square-footprint fade65→91 conceals the nearer edge that corner-radius-only fading would miss. Camera-below-floor fade−23→−14 prevents exposing the basin underside; opaque contrast ends34→46 before the unchanged far plane48. Explore remains unrestricted.

The256×144 low-frequency guide was prototyped at.12 weight, then **removed**: no useful additional depth and slightly worse image error. No retained guide texture or angular-fade dependency. Three shafts vary only±3.5% on roughly251-second periods. Static sub-code-value dither reduces very dark banding without animated noise shimmer. No full-frame blur/AA or resolution change.

## LIGHTING

Ambient opaque pickup is reduced to `[.57,.64,.70]` times the original material response. One existing hysteretic, smoothly faded M6 light is observed, never reassigned or written. Maximum lights **1**. Environmental distance scales Y by.4, with radius.085R, squared falloff, approved light power and a restrained normal-facing term. Local pickup can approach3.5×, but only inside that bounded moving pool. This reveals existing photographed mineral detail locally rather than raising the whole floor.

The light follows its approved animal owner and fades during owner changes. Existing benthic dots stay secondary, not lava fields or added neon. No animal material, glow hierarchy, activation, swim, light-selection state or M2 simulation is edited. Local-light off/on and moving-light clipC make the contribution inspectable.

## AO

Retained: material-only underside/pocket/bedding grounding, maximum added darkening.35, no history/pass/texture. Visual gain is subtle; original M6 cavities remain.

Rejected: optional half-resolution GTAO. The pinned r175 normal-depth API initially produced an invalid GLSL scalar conversion. A QA-only adapter compiled, but readback proved the existing WebGL2 multisampled target's sampled depth was uniformly1 and AO uniformly white. The installed fallback resolves color, not that sampled depth. No working GTAO is claimed. Changing renderer resolve, disabling MSAA or adding a second geometry render was rejected as outside scope.

Prototype15-second frozen-scene A/B/C median/p95/max: material16.7/18.9/23.6; GTAO16.7/19.0/24.4; both16.7/19.0/25.1ms, all0>50. Identity AO async CPU wall median.20/p95.30ms. Those numbers are **not** the cost of useful GTAO. Prototype used640×450AO plus1×1trigger; neither is present in production. See [GTAO_PROTOTYPE.md](GTAO_PROTOTYPE.md) for raw readback and compatibility details.

## CHEATS

- **Analytic scattering, not a simulated volume.** Three density scales and a remote light opening provide parallax cues without raymarching. Smooth, low-frequency variation keeps the approximation subordinate to animals; extreme traversal is handled by world fade.
- **Cheap distant geometry.** Four reused profiles establish silhouette/scale, not inspectable close rocks. Contrast and approach fade retire them before their simple anatomy becomes the subject.
- **Proxy radiance composition without depth writing.** Distant contrast is mixed against the same analytic water, avoiding concave alpha banding and transparent-animal occlusion. This is not physically exact opaque occlusion.
- **Extra environment extinction over the original fog.** Preserves approved shared animal fog graphs while making the basin recede. It is an art-directed double approximation, not a single physical scattering integral.
- **Ellipsoidal animal-light pickup.** One existing owner creates a longer vertical reach to the floor; no real volumetric scattering/shadow/GI. Bounded movement and decay make it read as a local reveal rather than constant ambient fill.
- **Material AO.** Normal, height and bedding approximate contact grouping without sampled depth or world raycasts. It cannot produce accurate contact shadows for arbitrary geometry.
- **Shader shafts and static dither.** No beam meshes, ray tracing, animated grain layer or extra post-process; weak amplitudes prevent these cues becoming independent effects.
- **Presentation-only particle corridor.** Highlights existing water movement rather than moving particles onto a reference-painted path. M2's actual advection/wake/activation remains authoritative.

## PERFORMANCE

Capture-free, fresh-browser baseline/candidate pairs; no screenshot/video encoding during measurement. RTX4070 12GB, i5-14600K, NVIDIA610.57.04. Brave/Chrome152.0.7977.76; actual backend **WebGL2, ANGLE NVIDIA OpenGL ES3.2**. One Three0.175.0 WebGPURenderer using its WebGL fallback. The existing llama service remained running for **both** builds; it was not selectively stopped for the candidate. This is a controlled local comparison, not an otherwise idle dedicated benchmark machine.

Identical1280×900 viewport and drawing buffer,DPR1, adaptive reduction disabled by existing specimen QA, exposure.94, same bloom-off path and MSAA settings. Warm-up12 seconds,28 for settled idle; measurement30 seconds per scene. These are **async render-completion frame intervals, not GPU timings**. Autonomous population phase can differ slightly between wall-time runs; draw/triangle numbers below are end snapshots, not exact matched-population averages or isolated feature costs.

| Scene | Baseline median / p95 / max / >50ms | Candidate median / p95 / max / >50ms | Draw calls B→C | Triangles B→C | Textures B→C |
|---|---|---|---|---|---|
| QA pose |16.6 /18.3 /27.7 /0|16.7 /18.3 /24.9 /0|185→189|903633→918009|76→76|
| Journey |15.4 /22.2 /31.0 /0|16.7 /20.8 /27.6 /0|188→191|926481→924273|76→76|
| Sanctuary |16.7 /17.8 /27.4 /0|16.7 /18.0 /21.1 /0|184→188|854321→863777|76→76|
| Explore near |16.7 /18.1 /25.7 /0|16.7 /18.1 /26.4 /0|167→171|792177→801633|76→76|
| Explore abyss |16.7 /18.3 /25.2 /0|16.7 /18.1 /25.3 /0|143→143|440529→440529|76→76|
| M7 idle |16.7 /17.9 /28.5 /0|16.7 /18.0 /24.4 /0|186→190|841707→851163|76→76|

No>50ms interval in either set. The moving-scene median increases1.3ms while p95 decreases1.4ms; do **not** interpret that as a GPU speed-up. No repeated-trial confidence interval is claimed. New environment CPU mean is .0015–.0023ms; median/p95 quantize to0 and maximum.1ms. Timer granularity means this only establishes tiny bookkeeping cost, not nanosecond precision. No resolution or quality reduction was used. Raw data: `performance/{baseline-final,candidate-final}/`, aggregate `performance/comparison.json`.

## VALIDATION

- Baseline130 tests passed before edits. Candidate **135/135** Node tests pass, with no skipped/cancelled tests. `package.json` has no general `test` script; the actual command is `node --test tests/*.test.mjs`, not an invented `npm test` success.
- Production build passes. Existing>500kB chunk warning remains. The build prepares local hosting artifacts but no deployment command ran.
- Approved-motion parity:720frames/24checkpoints, exact geometry/appendage state/activation. Default-animal parity:240frames/8checkpoints, exact geometry/material response.
- New focused tests cover finite/closed/deterministic bounded proxies, bounded monotonic fade, one reused light, unchanged M2 buffers, background-tab time debt clamp, original node restoration, idempotent teardown and byte-identical approved source outside exact environment seams.
- Actual-browser motion set: `final/motion-A` stationary30s;Bdescent;Cmoving floor light;DExplore orbit;Ecore→void;FM7entry/settled/return;Greverse journey;H390×844portrait. Each directory retains MP4, raw screencast JPEGs, timestamps, sampled states and errors. Matched baseline motionA/F is in `calibrated-baseline/`.
- All existing ViewsA/B/C/D and Explore near/between/above/below/side/fade/abyss/void/under are captured in `final/views/`. These use existing DEV camera selection/Explore APIs, not edited production choreography.
- **M7 lifecycle PASS:**20 entry/exit cycles, all five modes,800×900/390×844/1280×900 resize while active, keyboard/pointer/touch dismissal, actual hidden-tab4-second pause/return, finite animals, no activation leak, unchanged resource IDs and one context. `validation/lifecycle/` retains all checkpoints and empty errors.
- **Native-resource PASS:**six portrait↔desktop resize cycles on baseline and candidate. Both stay at75 native GL textures,6 framebuffers,4 renderbuffers. Candidate has196 geometry objects versus192, exactly the four new shared profiles. Three's reported texture counter rises76→124 during resize in BOTH builds while native handles remain stable; this pre-existing accounting behavior is not called a new leak or concealed as an unchanged counter. Raw records: `../m7-evidence/resources/asset2-{baseline,candidate}/`.
- **Render-pass audit:**baseline and candidate both render one ocean into the existing1280×900 target followed by one output quad in the sampled normal bubble-present state. Settled M7 adds the existing256×180 fixed-step liquid simulation calls (occasionally two catch-up steps), still just one ocean and one output. Three live render-target objects remain: the original M3 color/depth target plus the two M7 field targets. The background adds zero. `validation/{baseline,candidate}-passes/` contains actual call sequences, not only a self-reported zero-pass field.
- **Evidence delivery PASS:**54 images load, all eight MP4s play in the actual browser, and the review launcher opens the existing QA fixture at progress.55/time8. Empty console-error list. Final clips run30.26–31.50seconds,901–928captured frames each. Corrected C visibly shows the local pool moving/fading over existing rock; corrected E looks back through the sanctuary's fade into void. `final/manifest.json` records runtime SHA, clip hashes, backend, dimensions, native resources and pass sequences; `final/viewer-audit/result.json` records actual playback/launcher checks.

## LIMITATIONS

The full-image metric targets are not met; see explicit numbers and composition caveats above. The reference's authored small-scale geology and animal placement are not reproduced by changing locked M6 topology or approved animals. Close illuminated original slabs remain recognizably angular; background material work cannot turn their silhouette into a different authored mesh. Proxies are deliberately low-detail and withdraw on approach. The world is visually extended by fades, not an infinite physical seabed. The tiny ten-point benthic population remains sparser than the drawing in some views.

No physically based volumetric multiple scattering, shadowed local lights, true GI, ray tracing or working GTAO. The current shader noise is procedural density, not ocean fluid physics. Reference matching was inspected in browser captures/contact sheets and matched image comparisons; that self-review is not Mani's approval.

**NOT TESTED:** WebGPU (hardware or SwiftShader), Safari, physical mobile, other GPUs/displays, HDR, or a full context-loss recovery drill. Portrait/narrow results are Brave viewport emulation only. The known legacy full-ocean WebGPU issue is not repaired or claimed repaired. Extreme bright-display/black-level differences may affect very dark silhouette readability.

## SCOPE CONFIRMATION

Approved M1–M7 runtime definitions are preserved outside the five explicit background integration lines. Animal geometry/material/animation/activation; current/wake/neighbor simulation; population/LOD; camera/View/scroll/Explore/input; original seabed geometry/layout/plume state; M7 optics/clock/choreography are not rewritten. Environmental presentation intentionally changes the water behind transparent tissue; that is not a claim of identical final blended pixels against a changed background.

Three remains0.175.0. One renderer, no new renderer/context, no new ocean render, no retained additional target or texture. No actual ray tracing. M8 not started. No push, merge, deployment, workflow trigger or GitHub Pages modification. All commits and previews remain local.
