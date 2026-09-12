# README publication review

**STATUS: READY FOR MANI README PUBLICATION REVIEW**

Author: Mani Marami Milani. Strategy: salvage superpack v5 executor only;
support files were not needed. Continued the clean `publication-preprint-v1`
worktree from `2bea550f29140bb7fe9b9720c4d207f08f7b0612`, without a new clone
or branch. Runtime stays `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.

## Salvage and footprint

README now contains all ten technical methods, native mathematics, six
algorithms, inline figures/motion, failed approaches, raw-data-backed results,
validation, reproduction, visible limitations, nine references and citation.
No separate reader site is needed. Approximately 70% of normalized README
words are covered by exact five-word spans in the previous manuscript,
supplement, notation and README; this conservative reuse proxy excludes
many reworded adaptations. See `validation.json` for the exact count/method.

All 22 equation groups are reused: 21 existing displays are unchanged apart
from whitespace; the existing inline thrust group is now a display. All nine
references, ten figures, the Mermaid graph and seven benchmark records are
reused. No research, equation derivation, new plot, runtime recording or
benchmark campaign was performed. New media consists only of four compact
GIF derivatives of existing approved browser masters.

Added GIF bytes: **11,546,258**. Existing figures add no new tracked image
bytes. Total image payload referenced by README is **13,617,297 bytes**;
this includes already-tracked figures. Historical original GIFs and MP4 masters
are preserved, not silently deleted to make the added-byte budget look smaller.
Compression is 640 pixels wide / 8 fps / 48 colors at original playback speed.
Quantization and temporal subsampling are visible compromises, not a claim of
changed runtime quality. The hero is a labeled four-excerpt montage.

## Validation actually performed

- Production build passed (existing large-chunk warning remains).
- `node --test tests/*.test.mjs`: 130 passed, zero failed.
- Approved-motion parity: 720 frames, 24 exact checkpoints, activation equal.
- Default-animal parity: 240 frames, eight geometry checkpoints, material equal.
- Runtime manifest: all 116 protected files byte-identical.
- Source/config/worker/deployment paths unchanged from the prior publication
  commit. No production helper imports added.
- All 27 source permalinks resolve to files/line ranges in the pinned Git object;
  relative media/links and internal anchors pass local validation.
- All 22 native math displays parse to MathML without errors. Mermaid renders.
- Browser inspection at 1280×900, 820×900 and 390×844: no horizontal document
  overflow or broken images; local equation/table scroll remains available.
- All four GIFs were observed through changing browser frames. No browser errors.
- CFF validates against schema 1.2.0. Author/license exceptions remain correct.
- README scan finds no private home paths, local evidence ports or secret patterns.
- Existing benchmark record retained, including the unexplained 65.3 ms stall.

This is local GFM/MathML/Mermaid rendering, not remote GitHub rendering.
Viewport emulation is not physical-mobile validation. The old WebGPU/depth and
portrait-idle limitations remain documented; no runtime repair is claimed.

## Files changed in this salvage commit

Modified:

- `README.md`
- `AGENTS.md`
- `CITATION.cff`
- `REPRODUCIBILITY.md`
- `paper/PUBLICATION_BASELINE.md`
- `scripts/publication/package.mjs`

Added:

- `README_SALVAGE_MATRIX.md`
- `docs/readme/hero.gif`
- `docs/readme/appendages.gif`
- `docs/readme/refraction.gif`
- `docs/readme/liquid.gif`
- `docs/readme/media.json`
- `docs/readme/validation.json`
- `docs/readme/browser-validation.json`
- `docs/readme/REVIEW.md`
- `scripts/publication/readme-assemble.mjs`
- `scripts/publication/readme-media.mjs`
- `scripts/publication/readme-check.mjs`
- `scripts/publication/readme-preview.mjs`
- `scripts/publication/readme-browser.mjs`

Removed, recoverable from local commit `2bea550`:

- `public/paper/index.html`
- `public/paper/page.js`
- `scripts/publication/build-page.mjs`

Only the unused publication-page frontend/generator was retired after salvage.
The manuscript, PDFs, diagrams, plots, recordings, raw benchmarks, provenance
and historical validation/package tools remain. The old external stage is a
historical artifact, not the current README review target.

## Human gate

Mani still decides whether the repository-front-page reading experience,
technical depth and compact motion selection are ready for publication.
No additional technical or licensing decision is required to inspect it.
README.md is the publication. No push, merge, deploy, Pages/settings change,
release or M8 occurred.
