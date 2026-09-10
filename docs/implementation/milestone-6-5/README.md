# M6.5 — Dark basalt / grain / pinpoint life

Status: PARTIAL. Material darkness, coarse response and tiny attached life are improved, but repeated rounded terrace silhouettes remain obvious in some close/oblique views. This does not satisfy the complete artistic gate. No visual approval is implied.

Baseline: `518db86f0be40ac4273900081b5385a9f8ca25bf`, clean M6.4. Branch: `milestone-6-5-dark-basalt-material`. Worktree: `/home/mani/dev/jellyfish-studio/m6-5-sanctuary`. The older M6.3 SHA is explicitly not used. Unrelated dirty `site` and other worktrees are preserved.

Material runtime commit: `0a9168474ae96584f3b6f9b662c06628bf69c107`. Later commits contain evidence tools/documentation only.

## Local preview

- Candidate: <http://127.0.0.1:5209/?renderer=webgl&idle=300>
- Matched evidence: <http://127.0.0.1:5210/>
- Preserved M6.4: <http://127.0.0.1:5207/?renderer=webgl&idle=300>

The agent starts these local servers. If they later stop:

```sh
cd /home/mani/dev/jellyfish-studio/m6-5-sanctuary
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
VITE_OCEAN_RELEASE=milestone-2 node scripts/m65-preview.mjs
```

The separate evidence viewer is `python3 -m http.server 5210 --bind 127.0.0.1 --directory /home/mani/dev/jellyfish-studio/m6-5-evidence`. No public site was modified.

## Scope and fresh audit

Fresh baseline browser captures precede runtime editing: close Explore, wide Drift and Deep, plus shelf, ravine, chimney, colony and portrait. Evidence root: `/home/mani/dev/jellyfish-studio/m6-5-evidence/`. Query uses fixed seed7183, held animal time14, DPR1, actual NVIDIA WebGL2. Baseline server5207, candidate5209. The latest attachment contains text but no additional image/camera metadata; the repeatable prior review poses are used. Do not claim an exact reconstruction of an unknown screenshot camera.

Source findings:

- `MeshBasicNodeMaterial` is a custom diffuse-only geological graph, not a PBR material with a specular roughness lobe. Simply assigning roughness would do nothing. Broad normal-dependent ambient fill, upward bounce, high reflected pigments and weak bump contribute to the waxy/smooth read.
- The same rounded ledge primitive and broadly similar collapse tilt/height recur. Geometry already has per-instance size/angle variation. Similar shading exposes that shared primitive; this pass first conceals edges/recesses and breaks reflected response rather than changing geometry.
- All40 M6.4 biological points were rendered. The accepted direction now explicitly calls for fewer, with hierarchy, not brighter colony bodies.

## Fresh primary references

- [Three.js tangent-free bump mapping example](https://threejs.org/examples/webgl_materials_bumpmap.html), credited Lee Perry-Smith head. Fresh official thumbnail inspected at `/tmp/m65-three-bump-reference.jpg`; this is a published frame, not a claimed interactive walkthrough. Small normal relief breaks the continuous surface response without silhouette changes. Its glossy skin/exposure is an anti-reference for basalt. Installed r175 `BumpMapNode.js` was inspected for derivative API compatibility; no version change or copied head asset.
- [Rock07 by Jenelle van Heerden, Poly Haven](https://polyhaven.com/a/rock_07). Fresh author preview inspected at `/tmp/m65-rock-reference.png`. Layered mineral texture and coarse surface breakup sit within one coherent rock, unlike equal smooth shelves. Reuse the already-vendored CC0 scan luminance, not the terrestrial brown palette or a new asset dependency. No new external runtime assets.

## Material implementation

Only sanctuary `materials.js` and `VentLife.js` change at runtime. Geometry, layout, transforms and simulation sources remain byte unchanged. `BASALT_FINISH` names deterministic material controls.

Rock pigments are compressed before the existing water composition, with a separate reduction to rock ambient fill and upward bounce. Bedding, face orientation and ravine depth suppress recesses; existing geological pigment zones remain. This is approximate contact/crevice shading, not actual AO or new shadow maps. Pooled animal light retains its original position, intensity, falloff and cyan/violet response.

The scan-derived height layer is strengthened. One additional world-space mineral-noise octave supplies fine grit, with screen-footprint attenuation when unresolved. Grain affects the custom surface-gradient normal, plus restrained albedo breakup; it does not deform vertices. The diffuse-only response has no added specular lobe. There is no renderer exposure change, bloom change, extra pass/light/target or extra particle system.

Non-emissive colony bodies remain the same geometry and anchors, with reduced ambient fill but unchanged response to nearby animal light. Existing72 benthic sediment particles and M6.1 plume/shimmer are unchanged.

## Pinpoint hierarchy

Ten points associated with existing colony offsets0 and4 per colony. All five colonies retain their160 filaments and80 shells. Sites0/1/3 have one radius.036 world-unit signature each; the seven smaller points have radius.011. Normal-axis scale is65% of radius. Each point is embedded on an existing static shell/mineral-nodule apex; its center offset is35% of radius along the support normal. The first trial retained geological anchors beneath the larger bodies and buried several points; placing them on the actual body surface corrected this without new raycasts, halo sprites or lights.

Pale cyan/blue-white, without warm or broad violet emission. Nearby-light modulation is reduced from up to2× power contribution to.3×, avoiding a bright group when a jelly passes. Final wide Drift and Deep frames each have one clearly perceptible source near the lower central colony. Smaller points are subpixel/faint or occluded, not ten equally obvious lights. Visibility changes naturally with camera and shell/filament occlusion; three allocated signature sites does not mean three visible signatures in every composition.

## Rejected first trial

`trial1/` is retained, not final evidence. Its combination of albedo.56, ambient.42 and stronger cavity suppression obscured too much chimney context; grain height.014 was too conspicuous on illuminated faces. The refined version uses albedo.70, ambient.62 (chimney.85 to preserve the landmark), bounce.18, weaker cavity suppression and grain height.008. These are factors on the prior material graph, not displayed sRGB values. Existing animal illumination is not increased. `trial2/` shows the refinement before the full final evidence series.

## Validation and performance

See [VALIDATION.md](VALIDATION.md) for measurements, evidence and remaining limitations. Existing97 tests require the production build artifacts: the first fresh-worktree run failed only the packaging-file test because `dist/` did not exist. After build, all97 passed, along with both existing animal parity scripts. This was a test prerequisite, not a runtime regression. Final candidate passes99 tests, production build and both parity checks.

Constructor diagnostics and browser frame intervals are separate. The isolated paired Node diagnostic is948.98ms baseline versus942.69ms candidate median (one warm-up, five samples each), effectively unchanged. Attachment raycasts dominate: the basin plane was raycast667times, and high-triangle chimney geometry also consumed substantial time. No additional anchoring rays are introduced. Historical single126/762ms samples are not directly comparable to these warm medians.

## Safety

Local commits only. No push, merge, deploy, Pages modification or M7. M1–M5.2, geometry, camera tracks, View/scroll, currents, refraction, M6.1 plume/shimmer and M6.4 sediment stay unchanged. The pre-existing idle-return cyan-loss/invalid-geometry issue is out of scope and untouched. WebGPU and physical-device checks not exercised must be marked NOT TESTED.
