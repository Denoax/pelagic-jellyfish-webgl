# Optional GTAO: rejected, not a working retained feature

Pinned Three r175, actual NVIDIA WebGL2, M3's existing four-sample RGBA16F/depth target, 1280×900. No engine/package source was modified.

## Actual experiments

- A: retained material/contact approximation only.
- B: additional material AO off, half-resolution GTAO on.
- C: both on.
- The original M6 material's own crevice treatment remains in all variants. “B only” means no **new** Asset 2 material AO, not removal of approved M6 material construction.

The prototype is DEV-only and has no production import. It applies its sampled AO only to opaque environmental material nodes, never final-screen color, animal materials or the M3/M7 output nodes. It observes the existing ocean render completion and reads the existing depth into a 640×450 AO target plus a 1×1 computation-trigger target. No second ocean render or full-resolution beauty copy. Because the opaque surfaces have already rendered, this experiment has one-frame history reprojected through the preceding view-projection matrix. That is an explicit compromise, not hidden “same-frame AO.”

First run: the installed `getNormalFromDepth` path generated GLSL `texelFetch` vec4-to-float assignment errors. The `ao-proof/` evidence is **INVALID** for a working GTAO comparison. A small explicit `.r` depth-sampling normal adapter in the QA module compiled successfully without modifying Three.

Second run: `../asset2-evidence/phase-4/ao-proof-r2/` has A/B/C captures, actual motion and empty browser error list. However, a readback verification exposed an identity AO buffer: min=max=mean=255. Increasing radius .65→1.5, scale 1→2 and strength .55→.8 still produced an identity buffer. These are **not** evidence of useful GTAO, despite successful compilation.

`phase-4/ao-range-test/depth-range.json` samples `(1 - depth) * 100` into a diagnostic half-resolution color target: every pixel is zero. Actual depth dimensions are1280×900; near=.01, far=48. The installed `src/renderers/webgl-fallback/WebGLBackend.js`, `finishRender` multisample fallback, blits with **COLOR_BUFFER_BIT only** (around lines550–585). This explains the unavailable sampled depth on this path. Existing M3 state records `samples:4`. Changing that resolve path, removing MSAA, or adding a geometry/depth render would exceed this background pass's parity/architecture constraints.

## Cost and decision

15-second capture-free **frozen-scene prototype** intervals (not full task benchmarks, not GPU timings): A median16.7/p95 18.9/max23.6; B16.7/19.0/24.4; C16.7/19.0/25.1 ms. No intervals>50 ms. The identity AO computation's measured async CPU wall cost was median .20/p95 .30 ms after warm-up. This is not the cost of a successfully working occlusion effect and must not be marketed as one.

Visual gain: **none**, confirmed by output readback. Retain: **NO**. Production uses material-space grounding, zero new render targets/passes, no history. The optional GTAO limitation does not prevent the remaining background work. The QA prototype remains reproducible but is not imported by the artwork. Legacy optical behavior is unchanged; repairing renderer depth resolve is a separate explicitly authorized future task, not part of Asset 2.
