# README publication salvage

Strategy: salvage superpack v5, `01_SUPER_EXECUTOR_PROMPT.md`. README.md is
the publication; the previous paper/site is a content cache, not a required
reader route. Continue `publication-preprint-v1` from publication commit
`2bea550f29140bb7fe9b9720c4d207f08f7b0612`; approved runtime stays
`bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`. Initial worktree: clean.

A = direct reuse; B = adapt; C = verify; D = historical/ablation;
E = obsolete; F = wrong-surface infrastructure.

| README target | Existing source | Reuse action | New work genuinely needed? |
| --- | --- | --- | --- |
| Abstract and full method | `paper/manuscript.md`, `pelagic.md`, TeX/HTML | B: rearrange existing sections into requested README order | Markdown assembly only |
| Equations and notation | `paper/source-map.md`, `notation.md`, manuscript equations 1–22 | A/B: retain verified math, definitions, classifications; add pinned links beside sections | No derivation |
| Algorithms | Six manuscript pseudocode blocks | A: retain relevant blocks beside methods | No |
| References | `paper/references.bib`, `paper/audit/REFERENCE_LEDGER.md` | A: reuse verified entries and prose citations | No research |
| System diagram | Existing README Mermaid; F02/F07 SVG and PNG | A/B: reuse graph and compositor diagram | No diagram redesign |
| Anatomy/pulse/appendages | F03/F04/F05, inspection composites | A/B: reuse plots and labelled geometry; prefer captured motion for lag | Existing S2 master needs compact GIF |
| Population/optics | F06/F08 plus frozen on/off inspection | A: retain honest distinctions between different-state LOD panels and matched optics diagnostic | No new capture |
| Sanctuary/topology/performance | F09/F10/F11/F12 | A: reuse approved screenshots, filmstrips and raw-data plot | No |
| Hero journey motion | S4/S6/S7/S8 MP4 masters, existing hero GIF | B: compact montage from existing actual frames | Transcode only |
| Technical motion | S2/S5/S9 MP4 masters; contact/pinch GIFs | B: curate three economical previews | Transcode only; no new recording |
| Posters and provenance | `paper/media/S1–S12.jpg/json`, catalog, capture metadata | A: keep originals; record segment/encoding derivation for README media | Small derivative manifest |
| Filmstrips | F10/F11; inspection F04/F06/F08 | A: reuse existing browser evidence | No |
| Benchmarks | `paper/results/benchmark.json`, `table.md`, `README.md` | A/C: confirm runtime match; reuse all seven runs including adverse stall | No rerun |
| Validation | `paper/audit/*validation.json`, `VALIDATION.md`, runtime manifest | A/C: reuse scoped evidence; run documentation checks and final runtime guard/build/tests | README-specific checker |
| Negative results | `paper/supplement-source.md`, manuscript §23, stale audit | D/B: compact failed-attempt table; explicitly exclude Asset2 from final runtime | No recreation |
| Reproduction | `REPRODUCIBILITY.md`, old README commands | B: include complete runtime commands in README; make old paper build optional history | No new runtime tooling |
| Citation/licensing | `CITATION.*`, `LICENSE.md`, `LICENSES/`, `ASSET_PROVENANCE.md` | A/C: preserve author, MIT/CC BY split and vendor exceptions | Only consistency edits if needed |
| Prior README | README at `2bea550` (2,621 words) | A/B: retain accurate context, Mermaid, reproduction and licensing | Merge with full manuscript |
| Paper/PDF/source tools | `paper/`, publication builders, raw results | A/D: keep useful source/evidence and history | Do not rebuild PDFs |
| Separate page frontend | `public/paper/index.html`, `page.js`, `build-page.mjs` | F: retire only after README salvage; recoverable in prior local commit | Remove unused page entry; preserve source history |
| Separate page QA/package | `page-qa.mjs`, old `package.mjs`/preview and reports | D: keep as historical evidence/tools, clearly no longer primary workflow | README-only local validation/preview |

All MP4 masters already exist in the external publication evidence directory.
They remain outside normal Git. No browser capture, equation, plot, reference
or benchmark regeneration is planned. Any later discovered gap must be named
before new work is added.
