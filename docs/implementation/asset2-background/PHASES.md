# Asset 2 phase journal

## Phase 0 — exact baseline

Approved `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`, isolated baseline worktree, native NVIDIA WebGL2. 130 tests, production build, approved-motion and default-animal parity passed. Reference metrics reproduced; the pack does not define its center/border ROI, so our explicitly documented ROI is used consistently for all three images. Baseline evidence is in `../asset2-evidence/phase-0/` (relative to checkout).

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
