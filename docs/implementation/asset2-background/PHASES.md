# Asset 2 phase journal

## Phase 0 — exact baseline

Approved `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`, isolated baseline worktree, native NVIDIA WebGL2. 130 tests, production build, approved-motion and default-animal parity passed. Reference metrics reproduced; the pack does not define its center/border ROI, so our explicitly documented ROI is used consistently for all three images. Baseline evidence is in `../asset2-evidence/phase-0/` (relative to checkout).

## Phase 5 — bounded polish and cross-view corrections

### Calibration correction after the journey review (R6–R9)

The initial endpoint was not the closest existing reference pose. Actual journey footage exposed this: the approved landmark's projected crown is near reference y≈.55 at Drift55%, versus y≈.30 at the endpoint. A baseline-only sweep of45/55/65/75/85/100% confirmed55% as the closer geometric composition. A separate baseline-only4/8/12/16-second sweep selected8 seconds for the nearest right-side animal presentation; every sampled baseline and subsequent candidate comparison is retained. No track, pose, FOV, actor or animation definition was edited. The earlier endpoint evidence remains historical, not silently relabeled.

This corrected a real environmental timing problem: `Background.depth = progress^1.68`, so the previous .35→.82 environmental blend was almost absent at55%. The new environment-only blend is .08→.34 in that existing depth coordinate (roughly22–53% of the journey). The approved global depth value and all animal material graphs are unchanged. Refit the thirty proxies to the corrected camera, with submerged bases constrained inside the existing48-unit far plane. The apparent approach fade is relative to each proxy's fitted reference distance, so it hides approaching cheap silhouettes without erroneously suppressing the intended tall reference silhouettes. Extinction is exponential with a smooth42→47 clip guard. The4shared meshes/30instances/4draw batches remain.

R9 reuses the same one M6 light but gives its environmental scattering a narrower .085R XZ footprint and .4 vertical distance scale; the bounded material pickup can reach3.5 only locally. The ten existing biological point materials receive2.6× presentation compensation through the new extinction; no new points, colonies, halos or geometry. These are environment-only light/material adjustments, not approved-animal changes. Final reference matching uses `phase-5/r9/on.png` against `temporal/calibrated-baseline/t8.png`. Old R5 motion and comparison evidence was preserved under `phase-5/r5-review/`.

The full-image target is still assessed without masks/exposure normalization. Dense approved foreground animals remain a substantial mismatch with the reference population. This must remain explicit in the final report; calibrated screenshots are not a claim that whole-image metrics passed.

### R10 — proxy compositing correction

The final side-angle sweep exposed internal triangle overlap in concave proxies when low contrast was implemented entirely as weak alpha. R10 resolves the distant silhouette contrast in radiance, then uses real alpha only for approach/world/clip fades. Near fade multiplies contrast as well, so overlapping triangles are insignificant during withdrawal. Depth writing remains OFF and the approved transparent population is still rendered afterward; no invisible depth occluder or extra pass is introduced. The matched side view no longer shows the internal triangle bands. This correction costs an analytic water-radiance evaluation on those four background batches and is included in final whole-scene benchmarks, not hidden behind a resolution reduction.

R1 added three very weak world-anchored analytic shaft envelopes and a static sub-code-value dither; its noise was too visibly mottled. R2 reduced the density modulation and added environmental extinction before the immutable camera far plane (48), ending contrast by46. R3 reduced proxy contrast after the stationary/Explore comparison exposed overly obvious simple profiles.

The actual Explore orbit exposed a further issue: an opaque proxy could visually fade to the water color while still writing depth. R4 gives the four new background batches true alpha, depth-test on/depth-write off, and draws them before approved transparency. R5 adds a static per-instance center/height attribute and bounded distance/height fade, so a large nearby proxy does not become an inspectable foreground landmark. These changes affect ONLY newly added proxies. Their four shared profiles gain slightly less regular shoulders/crowns; existing M6 geology remains byte-identical. The QA framing is not changed.

Final phase stills and all single-component ablations: `../asset2-evidence/phase-5/r5/`. The 20-second-plus Explore pilot clips prompted the correction; final clips replace those pilot paths. There is no additional render target, ocean render, shader-displaced floor, exposure change, animal edit, or full-screen AA/blur. Dither is time-independent and below one display code in ordinary deep water; shafts change by only ±3.5% on an approximately251-second cycle. They do not supply the main atmosphere.

The four uniformly sampled temporal comparisons (14/24/34/44, R2 diagnostic) show a consistently missing reference central-hero energy, not one unlucky chosen frame. The whole-image MAE and center/border targets are NOT called passed. Their explicit hero-composition exception must be judged alongside the unmasked metrics and final motion, not used to brighten/reposition the approved animals. Final lifecycle, performance and visual-review status are reported separately after validation.

## Phase 4 — grounding

Retained a restrained opaque-only underside/pocket/bedding factor on top of the existing M6 crevice treatment. No per-frame raycasts, geometry changes, AO over animals or global blur. Compared material off/on and GTAO variants; the pinned WebGL2 depth limitation is documented fully in `GTAO_PROTOTYPE.md`. GTAO is rejected, not silently called successful after compilation. Its DEV module is never imported by production.

Matched still and comparison: `../asset2-evidence/phase-4/material-only/frame.png`, `phase-4/comparison/comparison.png`. Floor edge density .06863; dark coverage93.10%; MAE .00677742. Material grounding is subtle and preserves the scan and local reveal; it passes this phase's inexpensive-grounding gate. The broader final reference match, motion sweep and performance gate remain unfinished.

## Phase 3 — local light hierarchy

One existing M6 light owner is reused; no new lights, selection loop or animal writes. Its bounded surface pickup restores mineral detail locally, with the original scan/relief/pigment retained. Existing ten pinpoints and five colonies are retained, with no new benthic population. M2 snow receives a world-space presentation envelope around a broad diagonal corridor; positions, advection, alpha simulation and wake/activation equations remain byte-identical. The optional guide was removed after its failed value test.

R1 matched floor-edge density .06861 versus reference .07910 and baseline .09118. Dark coverage 93.11%. Overall low-frequency MAE .00677776; the full-image final gate remains open. Actual 31.96-second near-floor browser clip (960 screencast frames), samples and extracted contact sheet: `../asset2-evidence/phase-3/local-reveal/`. The same local light moves between observed animals and fades through owner changes; no broad constant floor fill or permanent glow halo is added. Off/on stills include `light-off.png`, `particles-off.png`, `on.png`. This passes the local-light phase gate. Final reference matching and grounding remain unfinished.

## Phase 2 — atmosphere / visibility

Five matched drafts were inspected. A uniform increase in the blue opening made the comparison worse (r3 relative MAE .928); this was rejected. R5 uses two broad world-space density scales, environment-only opaque extinction and a darker ambient floor. The original M6 material graphs, pigment, grain and pooled illumination remain intact underneath the wrapper. No animal fog node is changed. The exposed horizon is attenuated before the actual square basin edge, and Explore below the open basin now loses environmental contrast smoothly instead of exposing its underside. Radial fade uses the geometry-derived R; an additional actual-footprint fade is necessary because the square's edge is nearer than its corner-derived R.

R5: dark coverage 93.58%, MAE .00665925 (13.5% improvement), center/border 1.89, floor edge density .03838. This passes the atmosphere-specific depth/boundary check, **not** the final reference gate. The fixed reference hero is absent at our approved camera/time; it is not painted back into the background to inflate the center metric. Local floor reveal and final haze balance remain to be evaluated in subsequent phases.

Actual browser ablations: `../asset2-evidence/phase-2/ablation/` includes spires/haze/extinction/guide off/on and Explore core, edge, abyss, void, underside. R3 guide weight .12 changes relative MAE .92829 → .93123 and adds a weak blue blob without useful depth. Reject it; preserve this prototype commit for reproducibility, then remove the texture sampler/storage from retained runtime. No additional ocean render, target or context was used. R5 still/combined reference: `phase-2/r5/frame.png`, `phase-2/r5-comparison/comparison.png`.

## Phase 1 — macro composition

Three actual-browser iterations: r1 was too dark under the locked ACES toe; r2 recovered the blue opening but exposed overly simple silhouettes; r3 adds restrained shoulders to the four shared proxy profiles. Thirty instances, six screen-fitted clusters, four batches, no texture/pass/target. Existing near geology is unchanged; the lower portions of reference rectangles C/D/E are reserved for that geology, not filled with new near landmarks.

R3 evidence: `../asset2-evidence/phase-1/r3/frame.png`, `r3-comparison/comparison.png`, `r3-comparison/metrics.json`. Linear low-frequency MAE falls .00769528 → .00683874 (11.1%). Dark coverage is 91.94% versus reference 91.17%; center/border is 1.91 versus reference 5.23 using our stated ROI. The coarse blue opening and dark enclosing silhouettes now pass the macro-only gate. The exposed floor horizon, insufficient atmospheric depth and excessive floor contrast explicitly **do not** pass the final gate; they are the next phase's work. No AO, shafts, extra glow, camera or animal edits were used.

Baseline capture-free benchmark: 30 seconds per scene after warm-up, 1280×900 DPR 1, native NVIDIA WebGL2, locked quality/exposure, no bloom. Median/p95/max milliseconds: QA 16.7/17.8/29.8; journey 16.3/19.2/23.6; sanctuary 16.7/17.8/23.9; Explore near 16.7/18.3/26.8; Explore abyss 16.7/17.9/24.2; M7 settled 16.7/17.9/24.6. All had zero intervals >50 ms. These are render-completion intervals, not GPU timings. The existing llama service was left running for every baseline run.
