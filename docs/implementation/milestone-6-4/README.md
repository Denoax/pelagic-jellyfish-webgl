# M6.4 — Geological integration and wide-view ecology

Status: **PARTIAL — implementation and validation complete; artistic target not yet met**. Some foreground shelves still read as plates/repeated blocks, and ecology is clearer at medium distance than in the primary wide view. No visual approval is implied by local commits.

Starting SHA: `8752d1af1f01bd1142bad1d55ae2b047cacb1d8d` (failed M6.3, preserved).

Runtime candidate: `d2f8fffd1d443ce1df78bbca8d4cf6333aaa131d`.

Branch: `milestone-6-4-geological-integration`.

Repository: `Denoax/pelagic-jellyfish-webgl`; origin `https://github.com/Denoax/pelagic-jellyfish-webgl.git`.

Worktree: `/home/mani/dev/jellyfish-studio/m6-4-sanctuary`. The older dirty `site` worktree and clean M6.3 worktree were preserved.

## Review locally

- Candidate: <http://127.0.0.1:5207/?renderer=webgl&idle=300>
- Evidence comparison: <http://127.0.0.1:5208/>
- Preserved M6.3: <http://127.0.0.1:5205/?renderer=webgl&idle=300>

Servers were started locally by the agent. Restart command if the process later ends:

```sh
cd /home/mani/dev/jellyfish-studio/m6-4-sanctuary
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
VITE_OCEAN_RELEASE=milestone-2 node scripts/m64-preview.mjs
```

No public/default deployment was changed. This worktree's development ocean contains M6.4; the baseline server still serves M6.3.

## Runtime changes

| File | Change |
|---|---|
| `src/scene/sanctuary/geology.js` | Only shared shelf/fracture surface functions: resolved bed breaks and recessed joints. Original five shelf transforms, floor, gully, chimney, spires and layout remain unchanged. |
| `src/scene/sanctuary/mesoGeology.js` | Original 64-triangle beveled fracture family, deterministic connected placement, startup-only exact surface sampling with cached world bounds. |
| `src/scene/sanctuary/Sanctuary.js` | Owns the extra instanced rock batch and small sediment batch, updates/disposes them with the existing sanctuary. |
| `src/scene/sanctuary/materials.js` | Removes fixed east/west cyan/violet wash; bedding, slope, scan variation, ravine banks and actual diffuse outlets control deposits. Existing pooled animal illumination remains. |
| `src/scene/sanctuary/VentLife.js` | Reuses existing five sites/160 filaments/80 shells/40 points; anchors them on finished surfaces, normal-orients and embeds roots, gives four sites medium-scale bodies and restrained clustered accents. |
| `src/scene/sanctuary/BenthicSediment.js` | 72 bounded low sediment particles in collapse/bank/vent pockets, using unchanged `VentParticles` rendering and existing shared current. |

## Geology

The macro masses were not replaced. Shared shelf sampling increases from 40×20 to 64×32, and existing fracture-family sampling from 24×12 to 32×16, to resolve the added geometric bed relief rather than relying on shader noise alone. One additional shared geometry/batch contains **231** pieces: 47 attached beds, 123 edge-collapse fragments, 24 bank lips and 37 vent-apron fragments. Their sizes and embedding follow parent surfaces and structural breaks. The central channel remains recessed by its original 3.2-unit profile; added instances avoid its central footprint. No channel glow outline. The screenshot-first audit caught both regular top coverage and a misplaced high chimney ledge; the revised work reduces that coverage and rejects high support hits.

The hero/secondary-spire aprons sit at low base level; attachment explicitly rejects tall hero shoulders. Main chimney and the four secondary spires retain their geometry. Larger distant inactive spires are also unchanged.

## Color

The rejected split came directly from `p.x.smoothstep(-3,13)` blending cyan and violet pigments over upward faces. That logic is removed. The replacement is neutral basalt/slate with small exposed mineral beds, sheltered ochre, ravine-associated teal/slate and pale seep deposits. Scan luminance and bedding break reflectance within one rock. Violet is not permanently painted across the right half; the existing nearby animal-light response supplies local cyan/violet pickup.

No exposure/ambient increase, new point lights, shadow maps, passes, water/fog edits, or bloom compensation. Existing M6.3 geological attenuation remains byte unchanged.

## Life and near-floor connection

Four existing sites (0, 1, 3, 4) receive larger pale bodies/filaments. Site2 stays subdued. Existing point count remains40, now eight associated with each colony instead of15 oversized scattered-looking highlights. Root placement samples the actual finished rock meshes, carries surface normal orientation, and penetrates the support slightly; high chimney hits search outward toward lower surfaces. Pale shell/mat bodies provide non-emissive attachment cues.

Sediment stays in selected geological pockets. A fixed 1/60 step integrates bounded existing current with slow restoring drag, without particle wrapping/birth flashes. Paused/reversed time debt is discarded. The 72 particles reuse the existing transparent quad renderer. There is no full-screen dust, opaque haze, upper-water population increase, or new volumetric system. The visual atmospheric connection remains intentionally subtle and must not be overstated as a new haze field.

## Performance and validation

See `VALIDATION.md` for measured six-scene results, actual backend, evidence paths and limitations. Screenshots and video are captured separately from performance. Frame intervals are not GPU timings.

Startup diagnostic (Node-only, one construction, not browser latency/GPU timing): M6.3 ~126ms; first M6.4 ~1270ms, including ~1170ms of attachment rays. Cached bounds reduced a subsequent M6.4 construction to ~762ms with exact-hit parity. The remaining startup cost is a disclosed compromise; no claim of overall startup improvement over M6.3.

## Safety / scope

M1–M5.2 animals, currents/wakes, activation, bubbles/refraction, population, camera tracks, View, scroll and idle source remain unchanged. M6.1 plume (768 packets ×16 grains), diffuse particles, current coupling and thermal shimmer remain byte unchanged. The known pre-existing idle-return cyan-loss/invalid-geometry defect was neither fixed nor concealed. No push, merge, deployment, Pages changes, or M7 work.
