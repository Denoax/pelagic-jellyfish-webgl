# Asset 2 phase journal

## Phase 0 — exact baseline

Approved `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`, isolated baseline worktree, native NVIDIA WebGL2. 130 tests, production build, approved-motion and default-animal parity passed. Reference metrics reproduced; the pack does not define its center/border ROI, so our explicitly documented ROI is used consistently for all three images. Baseline evidence is in `../asset2-evidence/phase-0/` (relative to checkout).

## Phase 1 — macro composition

Three actual-browser iterations: r1 was too dark under the locked ACES toe; r2 recovered the blue opening but exposed overly simple silhouettes; r3 adds restrained shoulders to the four shared proxy profiles. Thirty instances, six screen-fitted clusters, four batches, no texture/pass/target. Existing near geology is unchanged; the lower portions of reference rectangles C/D/E are reserved for that geology, not filled with new near landmarks.

R3 evidence: `../asset2-evidence/phase-1/r3/frame.png`, `r3-comparison/comparison.png`, `r3-comparison/metrics.json`. Linear low-frequency MAE falls .00769528 → .00683874 (11.1%). Dark coverage is 91.94% versus reference 91.17%; center/border is 1.91 versus reference 5.23 using our stated ROI. The coarse blue opening and dark enclosing silhouettes now pass the macro-only gate. The exposed floor horizon, insufficient atmospheric depth and excessive floor contrast explicitly **do not** pass the final gate; they are the next phase's work. No AO, shafts, extra glow, camera or animal edits were used.

Baseline capture-free benchmark: 30 seconds per scene after warm-up, 1280×900 DPR 1, native NVIDIA WebGL2, locked quality/exposure, no bloom. Median/p95/max milliseconds: QA 16.7/17.8/29.8; journey 16.3/19.2/23.6; sanctuary 16.7/17.8/23.9; Explore near 16.7/18.3/26.8; Explore abyss 16.7/17.9/24.2; M7 settled 16.7/17.9/24.6. All had zero intervals >50 ms. These are render-completion intervals, not GPU timings. The existing llama service was left running for every baseline run.
