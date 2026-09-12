# Publication review gate

**STATUS: READY FOR MANI PUBLICATION REVIEW**

Author: **Mani Marami Milani**. Approved runtime:
`bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.
Publication branch: `publication-preprint-v1`.
The final local publication commit is recorded by `paperSha` in the staged
artifact manifest. It is not a new approved artwork version.

## What was checked

| Check | Result and scope |
| --- | --- |
| Pack | All 47 files read, including research, blueprints, templates, decisions and references; SVG wireframes inspected |
| Baseline | Approved M7 selected; later Asset2 remains review-only; original worktree remains clean at b4ca42f |
| Runtime lock | 116 files byte-identical to approved source, including actual `vite.config.mjs`, entry HTML, npm settings, assets and hosting adapter |
| Clean installation | `npm ci` passed in publication checkout and extracted runtime snapshot |
| Production build | Passed with existing release flag; pre-existing large-chunk warning retained |
| Full runtime tests | 130 passed, zero failed after build; initial missing-build prerequisite reported separately |
| Approved motion | 720 frames, 24 checkpoints, exact geometry/state and activation parity |
| Default animal | 240 frames, eight geometry checkpoints, material-response parity |
| Paper | 29-page PDF; canonical Markdown → GFM, TeX, HTML/MathML and PDF; all pages rendered and inspected |
| Supplement | Five-page PDF; extracted TeX rebuild also passed |
| Mathematics | 22 numbered equation groups mapped to pinned source and labeled exact, abstract or heuristic; GFM/MathML conversion passes |
| Bibliography | Canonical metadata checked; BibTeX parses; no invented DOI, affiliation, acceptance or release date |
| CFF | Valid against Citation File Format 1.2.0 |
| Mermaid | Parsed by Mermaid; portable README preview uses the corresponding explanatory diagram rather than an external script CDN |
| Motion | Twelve real browser MP4s, all played to completion through native controls; normal-size contact and pinch inspected in sampled frames and filmstrips |
| Page | 1280×900, 820×900 and 390×844 emulation; no horizontal document overflow or broken images; light/dark and reduced-motion checks pass |
| Interaction | Native playback, internal links, focusable links and no-autoplay behavior checked; full playback report has no browser errors |
| Performance | Seven capture-free 30-second cases, 16.7 ms medians; raw intervals and one 65.3 ms stall retained; not GPU timings |
| Archives | Three ZIPs extract; extracted paper and supplement compile; extracted approved runtime builds; SHA-256 checks pass |
| Metadata | Motion JSON and artifact manifest validate against the pack schemas; PDF author/title and sample JPEG/MP4 metadata inspected |
| Media size | Each GIF under 8 MB; social preview 1280×640 and under 1 MB; combined PDFs under 15 MB; new publication payload below 50 MB |
| Privacy | Curated public text/artifacts scanned for home paths, ephemeral QA addresses and credential patterns; no browser profiles or private notes packaged |
| Licensing | Full MIT and CC BY 4.0 texts included; original code/content split explicit; Aurelia and other third-party exceptions preserved |
| Remote state | No push, merge, release, deployment, Pages change, repository metadata mutation or archival submission |

The acceptance checklist supplied in the pack has no outstanding applicable
item. This is a preparation/inspection gate, not Mani's publication approval.

## Evidence locations

- `browser-validation.json`: full native-video playback, internal links,
  viewport/layout and reduced-motion results.
- `layout-validation.json`: additional light-theme responsive pass.
- `pdf-validation.json`: page counts and PDF metadata.
- `automated-validation.json`: Mermaid, MathML, citation parsing, schemas,
  checksums, privacy and file-size assertions.
- `archive-validation.json`: extraction and clean snapshot builds.
- `runtime-manifest.json`: exact approved-file hashes.
- `../inspection/metadata.json`: held pulse phases, frozen optics diagnostic,
  actual population assignments and resized ocean/idle states.
- `../review/`: rendered README and desktop/portrait project-page captures.
- `../results/benchmark.json`: raw frame intervals, environment and CPU probes.
- Staged supplemental-media directory: twelve full MP4s and source timestamps.

## Corrections caught during preparation

The first pre-build runtime suite lacked generated packaging output. Building
first resolved the prerequisite. Initial PDF equations exceeded the text width;
aligned line breaks corrected them without changing mathematics. Repeated
figure-number prefixes were removed from PDF captions. Early GIF encodings
exceeded the preview budget and were re-encoded as explicitly compressed
six-second previews; master motion remained unchanged.

Programmatic `play()` without a user gesture was blocked by browser policy.
The final check uses native control clicks and all twelve clips reach their
ends. A downloaded license file was initially empty; the full SPDX CC BY 4.0
text was then installed and an explicit completeness assertion added. The
source guard was expanded from 113 to 116 files after correcting its Vite
configuration filename and including entry/npm configuration. No runtime
file changed during any of these publication-tool corrections.

## Honest compromises and untested scope

The paper is an independent technical preprint, not peer reviewed. Numerical
equivalence tests do not establish biological accuracy or user preference.
Single-run frame intervals do not isolate GPU duration, individual feature
cost or background-service contention. The local llama service remained
running; its causal effect is unknown. The one 65.3 ms interval is not explained
away. Draw counts in separate population diagnostics were not recorded
simultaneously with the benchmark and are not relabeled as such.

The frozen optical on/off pair is a real same-state diagnostic; the population
panels show different journey states at matched viewport/DPR, not a forced
same-pose tier experiment. S3 is an activation time course; a particulate
visible/hidden ablation was not run. Contact topology is authored and does not
conserve liquid mass. The pinned depth-resolve problem remains documented.

The inherited clock can look stretched after a portrait resize. Its actual
resized appearance is retained in `inspection/`, not retouched. No artwork
change was authorized. Physical mobile, Safari, Firefox, hardware WebGPU and
software WebGPU are NOT TESTED in this publication run. Existing full-ocean
WebGPU issues are not claimed fixed.

The local preview is not GitHub's actual Markdown renderer. GitHub-compatible
math and Mermaid syntax were checked locally; no remote README rendering or
publication was performed. The history-free runtime snapshot builds on its
own, but historical parity tests require the original Git objects. Source ZIP
preparation and compilation are not an arXiv submission or acceptance check.

M8 and all new artistic/runtime implementation remain out of scope. Mani's
next approval is required before any remote publication action.
