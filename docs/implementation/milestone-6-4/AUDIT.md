# M6.4 — wide geological integration audit

Baseline: `8752d1af1f01bd1142bad1d55ae2b047cacb1d8d`, clean M6.3 worktree. New isolated worktree/branch; older dirty `site` is untouched. Three.js remains 0.175.0, WebGPURenderer with NVIDIA WebGL2 selected. No renderer migration.

## Fresh baseline capture, 2026-09-10

1. **Deep final — failed structure.** `m6-4-evidence/before/deep/wide.png`. Large smooth shelves, disconnected central chimney, a dark slot on its right, isolated colored dots. Strong animal hierarchy/black upper water are worth preserving. Floor color is not convincing mineral structure.
2. **Explore wide — primary failed frame.** `before/explore/wide.png`. Camera `[14,-4,-8]`, look-at `[-2.4,-9,-27]`, 1280×900, DPR1, seed7183, held animal time14. Left foreground/corner is cyan slab; right foreground is violet slab. Chimney around x44% dominates; ravine right of it runs toward the lower right; dead spires sit on right shelves; tiny life at the foot reads as particles. Wide empty gaps below/around shelf edges disconnect the formation. Large upper black water is intentional, not a defect to fill.
3. **Drift/Documentary/Intimate — same structural weakness from different tracks.** Fresh captures under `before/`; no camera edits authorized.
4. **Portrait — incomplete geological context.** Existing crop privileges chimney; do not solve by changing the camera. Improve the visible banks and foot using the same world.

This is a bounded visual scene audit, not a UI/accessibility audit. Existing UI is preserved; screenshots do not establish accessibility compliance. Exact previously supplied review camera was not embedded in the new attachment, so use the M6.3 documented deterministic wide Explore pose rather than claiming a new undocumented user camera match.

## Primary human-authored references, checked afresh

- [Unseen Studio: The Sea We Breathe](https://unseen.co/projects/blue-marine-foundation/). Author describes three underwater WebGL environments and the role of lighting/textures under web performance constraints. Fresh author-published [marine protected area still](https://unseen.co/wp-content/uploads/2021/11/mpa_static_1_small.jpg) inspected: large rock forms connect through medium boulders, broken surfaces, and attached habitat; color varies on the SAME rock. Borrow the scale hierarchy and surface/context relationships, not its sunny exposure, green reef, models or composition. This is author-still/source inspection, **not a successful interactive walkthrough**. Third-party image stays research-only, no runtime copy.
- [NOAA/USGS: Northwestern Atlantic cold seeps](https://oceanexplorer.noaa.gov/expedition-feature/okeanos-ex1903-background-seeps/). Primary text describes mats and tube/mussel communities around chemical seepage. Mechanism reference for localized attached habitat, not a claim that the stylized sanctuary recreates a specific real site. No external mesh/texture acquired.

## Implementation order / checks

The five macro shelf transforms, basin, channel and chimney stay unchanged. The shelf surface itself gets moderate 64×32 sampling (from 40×20) for real bed relief and a recessed joint; this is a targeted surface refinement, not replacement of the masses. Add original low-cost attached fracture beds and collapse fans in one instanced batch, leave channel negative space open, then remove the regional material wash. Life remains five sites with 160 filaments, 80 shells/mat bodies and 40 points; geometry anchors must be sampled after meso integration. Minimal near-floor sediment reuses existing particles/current and leaves the plume untouched.

The first structural trial revealed reversed side winding on the new blocks. Fixed before final capture; an outward-face test guards this defect. Do not accept triangles/black wedges as geological cavities.

The second trial read as regular stones laid on smooth platforms. Rejected locally: reduced top coverage from five rows to two fracture seams and sculpted bed breaks into the actual parent surface. Surface anchoring also initially climbed the chimney where a seep overlapped its footprint; anchors now search outward for low geological surfaces. These are recorded misses, not accepted evidence.

The same low-support constraint was extended to shelf-collapse pieces after one landed on a tall chimney shoulder. No hero geometry changed. A second startup-only optimization caches instance world bounds before ray tests; a focused test compares every generated bed/filament position against ordinary Three raycasting and requires identical points and face normals.

No artistic success is inferred from object counts, color histograms or tests. Wide screenshots and actual motion remain the gate. Performance uses separate capture-free runs at equal settings.
