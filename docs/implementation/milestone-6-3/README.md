# M6.3 — wide-view atmosphere / color readability

Status: **READY FOR VISUAL REVIEW**. This is not a claim of user approval.

Local review only. Starting baseline: `685eaf5960251923bc4ae7012f8fd3c8c42bf46d`.
Branch: `milestone-6-3-wide-atmosphere`, worktree `/home/mani/dev/jellyfish-studio/m6-3-sanctuary`.
Runtime candidate: `0937f05fd836e721fb1fbe70d6fe1864d84d748d` (following reversible implementation commit `209dc88`).

## Review

- Live local artwork: `http://127.0.0.1:5205/?renderer=webgl&idle=300`.
- Side-by-side evidence and actual browser clips: `http://127.0.0.1:5206/`.
- Reproduce preview: from this worktree, Node 24, `VITE_OCEAN_RELEASE=milestone-2 node scripts/m63-preview.mjs`.
- Evidence lives outside the repository at `/home/mani/dev/jellyfish-studio/m6-3-evidence/`; private browser profiles are not committed.

The review page is an evidence viewer only, not new public UI. Use View → Deep or Drift and scroll to the sanctuary; Explore is unchanged. The current public Pages website has not been modified.

## Diagnosis and mechanism

See [the wide-first audit](AUDIT.md). The dominant cause was superlinear distance extinction applied to already dim geological pigment. Disabling geology fog temporarily exposed the missing forms, but also exposed the distant floor horizon. The implementation instead reuses the existing directional water radiance with bounded sanctuary-only attenuation and a tighter low-elevation far-field fade. No new background color or global water change.

The second cause was weak macro hue separation. World-space west/east and older back-deposit regions now establish slate/teal, muted violet and subdued ochre identities beneath the existing meso crust and photographed microtexture. The final violet/ochre pigment adjustment approximately preserves pigment luma; it is hue separation rather than another intensity boost. The existing animal-derived illumination remains exactly unchanged.

A small cool material-side upward-plane contribution reveals exposed shoulders. It excludes buried/downward surfaces; ravine interiors and cavities retain darkness. It is not a hemisphere-light/exposure increase or whole-chimney rim light.

Existing life points also suffered from actual burial under overlapping geology. A one-time surface attachment selects three eligible points from each existing eight-point colony, preserves X/Z and all colony locations, rejects tall chimney surfaces, and seats those 15 accents on nearby stone. Their radius changes from .018 to .065. The other 25 retain their original position and size; the shared life material receives the new color/attenuation response. Forty instances, same batch, same species/sites, no new particle system. The original filament/shell layout and motion remain intact. Selected points may shift vertically by up to 2.865 units; this is deliberately documented, not claimed as position parity.

## Changed runtime files

| File | Change |
|---|---|
| `src/scene/sanctuary/atmosphere.js` | Shared sanctuary-only TSL optical response; original near transmission, softer intermediate extinction, bounded far fade into existing directional water radiance. |
| `src/scene/sanctuary/materials.js` | Macro mineral zones, dim exposed-plane pickup, once-only geological atmosphere. Original deposits/scan/pooled light retained. |
| `src/scene/sanctuary/VentLife.js` | Select/attach/scale 15 existing points once before prewarm; restrained teal/violet emission and matching local attenuation. |
| `src/vendor/aurelia/background.js` | Import path `./lights` → `./lights.js` only, required for native ESM access to the existing graph. All shader/water behavior is byte-identical. |

No new lights, passes, targets, textures, meshes, geological structures or runtime populations. No scene-wide simulation, camera, bloom, DPR or resolution changes. Surface raycasts and temporary attachment allocations occur only during construction, never in the frame loop. This adds some initialization CPU work; it does not claim zero startup cost.

## Evidence map

`before/<view>/wide.png` versus `final/<view>/wide.png`, with adjacent `state.json`, `histogram.json`, `errors.json`:

| Requested evidence | View |
|---|---|
| Drift wide | `drift` |
| Deep wide / chimney silhouette | `deep` |
| Documentary wide | `documentary` |
| Intimate audit | `intimate` |
| Portrait sanctuary | `portrait` |
| Ravine / constellation / localized life from distance | `explore` |
| Pooled jellyfish illumination | `drift`, `deep`, and stationary/orbit motion; light state recorded in JSON |

Camera position/orientation, simulation time 14, pulse phase, plume time, seed 7183, viewport and DPR are matched. Tiny asynchronous shader/particle raster differences are not presented as pixel-perfect whole-image equality. Geometry/camera/animal source parity is tested separately.

Actual browser motion: `motion/{before,after}-{stationary,orbit,descent}/motion.mp4`. Stationary and wide Explore orbit are ~20 seconds each; descent ~45 seconds, including an ending hold. The evidence driver traverses the existing camera track; it does not alter production scrolling. Clips use actual CDP frame timestamps and variable-frame-rate encoding. They are not generated imagery and are **not performance measurements**.

Use `motion/after-corrected-orbit/motion.mp4` for the final candidate orbit: the first candidate orbit capture was cropped by the headless browser. The corrected 1280×900, 20.2-second recording has zero browser errors and is the one linked in the review page. Baseline orbit was already 1280×900.

## Validation and limitations

Final automated results and benchmark table are recorded in [VALIDATION.md](VALIDATION.md).

The geological shapes and microtexture are preserved, including their existing smooth broad shelf planes and stylized mineral lobes. Those shapes were not remodeled in this color/atmosphere pass. Glow is intentionally pin-sized, not a blooming garden; distant colonies may be occluded by actual stone. The unchanged dark plume remains subordinate and needs motion/full-resolution inspection rather than expecting a bright smoke column. Portrait's locked camera still crops some flanking geology.

M1–M5.2 behavior, M6.2 geology, plume architecture, shimmer, pooled illumination and local colony simulation remain unchanged. The pre-existing idle-return cyan-loss / invalid-geometry defect is explicitly untouched. No new hardware/software WebGPU validation, physical mobile, Safari or Firefox claim. Tested browser/backend details are in the benchmark report.

Nothing pushed, merged, deployed or published. No Pages changes. No M7 or unrelated idle work started. Visual review remains Mani's decision.
