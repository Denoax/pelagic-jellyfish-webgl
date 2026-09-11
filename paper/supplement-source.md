---
title: 'Pelagic — Technical Supplement'
author: Mani Marami Milani
date: '2026 · Local publication-review edition'
lang: en
---

# S0. Identity and evidence rules

This supplement accompanies the independent Pelagic technical preprint.
Primary runtime: `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.
Later documentation commits do not change the runtime. Asset2
`99ac8336be832c18230dcadefd815308c6c83c8f` remains an unapproved experiment.
No release, DOI, arXiv submission or peer review is implied.

Three evidence types are kept separate: source-derived diagrams, actual browser
captures, and capture-free performance measurements. The diagrams explain code;
they are not screenshots. Video preserves observed browser timing and records
frame timestamps before encoding. A 30 fps file does not prove the application
rendered 30 unique frames each second. Benchmark data is collected without
screencasting, screenshots or concurrent video encoding.

# S1–S12. Motion catalog

| ID | Subject and claim | Inspection task |
| --- | --- | --- |
| S1 | Approved pulse in specimen view | Follow several contraction/refill/coast cycles, not one favorable silhouette |
| S2 | Stateful appendage motion | Compare body turn with lagging membrane/tentacle history; inspect underside |
| S3 | Connected activation | Observe animal response, nearby particulate and decay; do not call it a fluid solve |
| S4 | Population during camera movement | Watch changing projected scale and detail, retaining original behavior |
| S5 | Bubble passage | Look for moving background distortion through a hero, not merely its outline |
| S6 | Four authored camera views and Explore | One world persists through observer changes |
| S7 | Sanctuary plume | Inspect localized discharge, sparse ecology and dark geological scale |
| S8 | Idle condensation | Ocean stays alive while the clock forms in the same compositor |
| S9 | Contact and merging at normal size | Surface approach, narrow neck and transfer must be visible without a diagnostic zoom |
| S10 | Pointer deformation and recovery | Persistent field remembers input and settles afterward |
| S11 | Minute change | Changed cells retract and reconnect; unchanged digits retain their place |
| S12 | Pinch dismissal | Throat narrows and separates before optical presentation disappears |

Every clip has a JSON record containing SHA, backend, browser, viewport,
drawing buffer, DPR, camera state, seed, simulation time, duration, observed
source rate, encoded rate and capture tool path. Master videos and frame
timestamps are staged outside normal Git. The small committed gallery and
manifest point to local-review assets until a future release is actually
authorized. No invented remote video URL is used.

# S13. Numerical and timing interpretation

The paper's fixed-step values belong to different accumulators, not one global
physics solve. Tissue uses 1/60 s with bounded admission; the journey follower
uses 1/240 s; idle admits at most three 1/60 s steps per update. Main-route
locomotion uses its own bounded delta and exponential factors. Therefore the
whole application is not bitwise frame-rate independent merely because several
subsystems use fixed steps.

The current field's analytical ambient expression is divergence-free before
local effects. Its envelopes, drift and speed clamp invalidate a general
incompressibility claim. The word "wake" names a visual disturbance seeded by
motion/pulse observations, not a solved vorticity field. The secondary thrust
window supplies a perceptual rhythm inspired by biology without estimating
real pressure or efficiency.

The liquid field's velocity clamp precedes the queued event impulse. Its final
displacement remains clamped, and edges are attenuated. Reporting only the
first clamp as a bound on every intermediate would be inaccurate. Similarly,
the implicit field normal uses differences at a 1.7-pixel spacing without
dividing by that spacing. It is an authored optical normal, not a numerically
convergent measurement of a physical height derivative.

# S14. Historical negative results

These are development records, not controlled comparisons against other
research systems. The evidence links point to the relevant versioned records;
their original local-review URLs are not reproduction dependencies.

## N1. Camera ownership

**Hypothesis:** independent camera position, point-of-interest and safety
corrections could keep moving animals attractively framed.
**Implementation:** earlier camera experiments combined multiple correction
sources. **Observed failure:** the author rejected overdirected/janky travel.
**Replacement:** bounded input progress and baked position/quaternion tracks.
**Evidence:** the M5/M5.2 history and current `JourneyController`/`CameraTrack`.
**Conclusion boundary:** this explains an ownership decision; no unsupported
jerk reduction or isolated performance percentage is published.

## N2. Giant analytic lens

**Hypothesis:** one large analytic lens would clearly demonstrate live
refraction. **Implementation:** the M3 development lens used a world-space
ellipsoid and the real scene target. **Observed failure:** technical bending
was accepted before the large dark-disc presentation was artistically accepted.
**Replacement:** a brief passage of sparse refractive hero bubbles with cheaper
ambient films. **Evidence:** M3 review history and `BubblePopulation`.
**Conclusion boundary:** the optical architecture survived; rejecting the
presentation does not mean analytic refraction failed.

## N3. Bright repetitive geology

**Hypothesis:** larger shelf masses and broad color zones would clarify the
abyss. **Observed failure:** successive M6 reviews found flat, bright or
repetitive slabs. **Replacement:** connected meso geology, darker mineral
response, restrained highlights and deterministic silhouette variation.
**Evidence:** M6.4–M6.6 reports and `shelfSilhouettes`/`materials`.
**Conclusion boundary:** the result is an art-directed basalt garden, not a
photogrammetric geological reconstruction or physically measured material.

## N4. Separate idle renderer

**Hypothesis:** a transparent independent idle canvas could supply a liquid
clock over a moving ocean. **Observed limitation:** that canvas did not contain
the live ocean color to refract. **Replacement:** M7 integrates topology and
field deformation into the existing live-ocean optical output.
**Evidence:** historical `IdleGlassScene.jsx`, current `IdleScreen.jsx`,
`OceanIdleGlass` and `LiveOceanLens`. **Conclusion boundary:** the old file is
retained history, not the active architecture; no second ocean is maintained.

## N5. Invalid pointer versus idle corruption

**Initial hypothesis:** idle return damaged dynamic geometry. **Investigation:**
strict QA identified malformed synthetic pointer events lacking finite spatial
coordinates before the symptom appeared. **Correction:** finite spatial-input
validation at the boundary, not sanitizing final geometry.
**Evidence:** M6.6.1 input/idle-return test history and guarded pointer path.
**Conclusion boundary:** this does not prove every context-loss or frozen-tab
case is fixed. It demonstrates why the first non-finite input matters more
than the eventual renderer symptom.

## N6. Asset2 / optional GTAO — not the publication runtime

**Hypothesis:** material grounding and a narrowly scoped GTAO experiment could
improve a background reference match without changing approved subjects.
**Implementation:** a review-only environment pass and a separate QA-only AO
prototype using the pinned scene depth. **Observed failure:** the first shader
adapter had a depth-fetch type mismatch; the corrected prototype compiled but
returned identity AO. Depth readback showed no useful variation. The installed
WebGL multisample fallback resolves color with `COLOR_BUFFER_BIT` only.

**Evidence:** Asset2 `GTAO_PROTOTYPE.md` at documentation commit
`b4ca42faa3b80e465d39995ebb0537a2aa948148`; its retained range/readback record.
The main image-metric improvement was about 1.47%, not the requested 30%.
Pooled phases improved only about 0.55%, with an adverse phase retained.
**Replacement:** the candidate retained material-space approximation, not GTAO.
**Conclusion boundary:** those timings do not measure useful AO. Asset2 is not
approved and is excluded from primary publication frames and fresh results.

# S15. Optical information boundary

The clean ocean color is real and current. This establishes live image
distortion, not complete ray transport. The following limits remain:

- Transparent tissue generally writes no depth; its visible color is already
  composited with other layers.
- Opaque-depth masking is coded, but useful depth resolution is backend-
  dependent. The pinned NVIDIA WebGL MSAA issue is not repaired by publication.
- A bounded virtual image plane supplies missing transparent-layer depth.
- Offscreen color cannot be recovered; border fades and displacement caps
  reduce artifacts rather than reconstruct it.
- Overlapping bubble/thermal/idle contributions sample one clean source.
  They do not trace nested refractions through each other's outputs.
- Idle thickness is a scalar field with an artistic normal. It is not a
  watertight three-dimensional liquid volume.

# S16. Reproduction and fresh results

Follow the root reproducibility guide, lockfile and publication manifest.
Build before running the packaging test. Benchmark tools record raw frame
intervals and summary statistics; they never rename those intervals GPU time.
Tables in the primary paper are derived from `results/benchmark.json`.
Historical milestone numbers remain separate.

Browser-generated desktop/narrow/portrait input is not physical device testing.
The publication does not claim Safari, Firefox, hardware WebGPU or mobile
validation absent a named record. The legacy full-ocean WebGPU problem remains
outside this publication task. Existing runtime source is held byte-identical.

# S17. Licensing and authorship

Author: **Mani Marami Milani**. Codex/OpenAI assistance covered implementation,
audit, writing and tooling under the author's direction. Original code is MIT;
original paper, diagrams, documentation and project-generated media are CC BY
4.0. Third-party exceptions remain controlling and are enumerated in asset
provenance and retained notices. External reference artwork is not copied into
this supplement. Preparation of a source archive does not assert arXiv
submission, DOI assignment, acceptance or peer review.
