# M6.2 — source and visual audit

## Exact starting point

The supplied M6.1 commit `cb46120537ee6e56c02611f910c67de1e1a1f80f` exists
locally. A clean additional worktree was created at
`/home/mani/dev/jellyfish-studio/m6-2-sanctuary`, branch
`milestone-6-2-atmosphere-life-refinement`. The original dirty `site` checkout
and all previous milestone worktrees were preserved. Repository remote remains
`https://github.com/Denoax/pelagic-jellyfish-webgl.git`.

Public main was inspected read-only at
`a2ed3bc89c700ba5c792ecac19747939e9f09b8d`; this older public release was not
used as a development baseline. A fresh Brave capture of Pages is in
`/home/mani/dev/jellyfish-studio/m6-2-evidence/references/public/entry.png`.
This is a visitor-experience capture plus remote identity, not proof that the
served JavaScript embeds that SHA.

Three remains pinned to **0.175.0**, the current node/TSL ocean renderer remains
in place, and real NVIDIA WebGL2 was exercised. Baseline production build,
86 Node tests and both approved-animal parity scripts passed. The project has
no general `npm test` script; the complete suite is `node --test tests/*.test.mjs`.

## Fresh evidence before editing

Fresh M6.1 captures include the normal desktop descent, reverse/re-entry,
Explore, portrait, and five seeded fixed-state inspection poses. The main
chimney reads as a landmark, but its base disappears into a broad dark floor.
Large shelves have obvious flat cap silhouettes in close freecam. Pale deposits
are small, and the empty basin contributes little compositional depth.

The Product Design audit was used to ground this in actual browser evidence,
not to introduce a new website design. No generated image is used as evidence.

## Reference grounding and limits

- [NOAA ASHES venting](https://oceanexplorer.noaa.gov/multimedia/ashes-venting/):
  actual fractured dark substrate with localized white mineral/bacterial mats.
  Its page and image were captured and inspected in Brave. This supports
  concentrating pale detail around chemistry rather than evenly scattering life.
- [NOAA hydrothermal vents](https://oceanexplorer.noaa.gov/fact-sheet/hydrothermal-vents-fact-sheet/):
  hydrothermal mineral structures and chemosynthetic ecosystems provide the
  geological/ecological reference. This implementation is an artistic basin,
  not a scientifically reconstructed vent field.
- [The Sea We Breathe](https://www.bluemarinefoundation.com/the-sea-we-breathe/):
  the fresh browser inspection reached the ocean-surface entry screen. Only that
  entry was inspected; no claim of reviewing its complete underwater journey.
  Its clear focal hierarchy reinforces keeping one main sanctuary landmark.

Fresh reference captures are under `m6-2-evidence/references/`. No code or model
was copied from these projects. Existing CC0 Poly Haven Rock 07 luminance is
reused; no new purchased asset, texture download or unlicensed implementation.

## Decisions and self-review

Preserve the structural M6.1 plume/shimmer/light system. Add a real shallow
ravine and organized basalt families, then local ecological islands. Keep
open water sparse, ambient/exposure unchanged, and the animal the light source.

The first new fractured-rock prototype looked too faceted in close view. Shared
rounded-eroded geometry replaced those obvious triangular facets. A later
broad high-contrast deposit mask looked like camouflage; it was removed, not
accepted as geological detail. The retained palette is deliberately subtler.

The final candidate is **PARTIAL against the artistic goal**: close views gain
structure, localized life and mineral variation, but wide views remain too dark
and predominantly blue-black to establish the requested richer culmination.
The extra rock mass is present, yet the recessed channel is easiest to read in
Explore, and some bank repetition remains visible. Tests do not override this
visual judgement. No global-light or camera change was used to hide it.
