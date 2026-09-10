# M6.6 — Existing shelf silhouette de-repetition

Status: READY FOR VISUAL REVIEW. Local review only; user approval remains required.

Baseline: `dd97923241e1d914e637263a6a94182b074c3bf0`, clean `milestone-6-5-dark-basalt-material`. New worktree `/home/mani/dev/jellyfish-studio/m6-6-sanctuary`, branch `milestone-6-6-shelf-silhouette`. Repository `Denoax/pelagic-jellyfish-webgl`. Runtime commit: `da7f09e6f5de76009cefdd0fa6d87843d9fd9bf6`. Later commits contain evidence tools/documentation only.

## Review

- [Candidate ocean](http://127.0.0.1:5211/?renderer=webgl&idle=300)
- [Matched M6.5/M6.6 stills and actual browser clips](http://127.0.0.1:5212/)
- [Preserved M6.5](http://127.0.0.1:5209/?renderer=webgl&idle=300)

The local servers are started by the agent. Restart, if needed:

```sh
cd /home/mani/dev/jellyfish-studio/m6-6-sanctuary
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
VITE_OCEAN_RELEASE=milestone-2 node scripts/m66-preview.mjs
```

Evidence server: `python3 -m http.server 5212 --bind 127.0.0.1 --directory /home/mani/dev/jellyfish-studio/m6-6-evidence`.

## Root cause, measured before editing

Fresh baseline captures precede runtime edits. Source plus screen-space ray identification shows the dominant foreground pattern is the 34-vertex beveled octagonal `ledgeGeometry`, repeated 231 times as `connected-fracture-beds`. It has one outline, one bevel profile and one pitched cap. Collapse rows share yaw and tier thickness; transforms and accepted M6.5 grain cannot remove that common edge signature.

Specific repeated pieces: foreground collapse IDs20–23, left stack22/61/66, right edge86, and bank lips173/174/176/178/179. Underlying macro shelf0/2 and rounded bank11/13 are also visible. The close stacked audit samples hit ledge22 in21 positions and macro shelf0 in17 positions. `baseline-shelf-audit.json` records pixel coordinates, source IDs, tags and world hit positions; it is not a full object segmentation or optical/shimmer-aware ray pass. The original five macro caps and99 terrace/bank/rubble instances remain unchanged. The dominant repeated *attached/collapse ledge* family is the actual target, not a rebuilt basin.

## Fresh human-authored references

- [Rock Face01, Dario Barresi / Poly Haven](https://polyhaven.com/a/rock_face_01): fresh clay/wireframe author preview inspected from the official CDN (`/tmp/m66-rock-face-clay.png`). Broad planes continue through uneven breaks and partial undercuts; they are not equally rounded complete plates. This is a sedimentary land scan used only for fracture/composition principles, not as a claim about abyssal basalt geology or a palette reference. CC0 listing; no new mesh/texture is imported.
- [Three.js instancing performance example](https://threejs.org/examples/webgl_instancing_performance.html): fresh official published frame (`/tmp/m66-instancing-reference.jpg`), not a claimed interactive performance measurement of that example. It demonstrates reuse, but its visibly repeated object is the anti-reference for silhouette identity. Adapt shared geometry/material batching, not its Suzanne model, colors or composition. Installed r175 APIs are the implementation truth; no Three.js upgrade.

## Geometry and attachment strategy

Four reusable original archetypes replace 183 existing ledges. Each has 42 vertices / 80 triangles, versus 34 / 64 for the original. Unequal perimeter corners, one localized break region, a tapered underside and varying lip height replace uniform bevel/thickness. No independent random vertex displacement or animated deformation. A central patch is an exact subdivision of the old top cap, preserving its support plane.

After the existing M6.5 attachment pass, four geometries are generated once. Nearby attachment columns are tested against the cached variants; select a deterministic safe variant or retain the original if its life support cannot be preserved. All37 vent-apron pieces remain original, plus11 attachment-sensitive ledges:48 retained originals total. Existing colony anchor positions, normals, transforms, ten pinpoints, sediment origins, all231 item transforms and layout hash exactly to M6.5. This is not a re-anchoring or ecology pass.

The first trial protected whole colony-overlapping columns. Its69 retained pieces left too many prominent steps unchanged. The final trial preserves central support planes instead, with bounded safety tests before accepting a variant. No hidden collider ocean or per-instance geometry copy was introduced.

No instance translation, scale, yaw, burial or stacking spacing changed. The different local lips/undercuts and footprints alter the visible overlap/thickness rhythm inside the existing arrangement. Some old geometry remains intentionally where moving it would violate a lock; this is not a claim of231 unique rocks.

## Rendering / cost architecture

Original batch is compacted to 48 live instances (not zero-scale hidden instances). Four instanced batches share the exact same accepted M6.5 material object, with 52/42/50/39 instances. Total remains 231; no rocks added. Sanctuary geometry/batch count increases 14→18; material count stays 7. New silhouette triangles add 2,928 across the family, not hundreds of standalone meshes. No extra render target, scene pass, light, shader variant or per-frame update system is added. All changes are construction-time; existing lifecycle disposal owns each shared geometry once.

Runtime files: `src/scene/sanctuary/Sanctuary.js` (small post-attachment hook) and `src/scene/sanctuary/shelfSilhouettes.js` (geometry, bounded selection, shared batching). `materials.js`, `VentLife.js`, `geology.js`, `mesoGeology.js`, sediment, plume/shimmer, camera/UI/scroll/idle and all animal sources remain byte-identical to M6.5.

## Scope and stopping point

This is M6.6 only. No material reopening, extra geology/ecology, M6.7, M7, camera journey change or idle repair. No push, merge, deployment or Pages update. Unrelated worktrees and dirty user work are preserved. See [VALIDATION.md](VALIDATION.md) for evidence, timings and remaining limitations.
