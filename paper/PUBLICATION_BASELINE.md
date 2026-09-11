# Publication baseline

Author: **Mani Marami Milani**. Publication version: `1.0.0-preprint` (local,
unreleased). Audit date: 2026-09-11.

## Identity and approval

- Repository: <https://github.com/Denoax/pelagic-jellyfish-webgl>.
- Runtime: **`bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`**.
- Local publication branch: `publication-preprint-v1`, created from that commit.
- Authority: Publication Research Pack v3, resolved decisions, approved M7 gate.
- Asset2 runtime `99ac8336be832c18230dcadefd815308c6c83c8f` is review-only. No
  later explicit approval was found in the supplied instructions. It is NOT the
  main paper's runtime or benchmark subject.
- The original checkout was clean at `b4ca42faa3b80e465d39995ebb0537a2aa948148`
  on `pre-m8-asset2-background`. It and all other worktrees remain untouched.
- Publication work uses a separate worktree. It does not advance the runtime.
  A later publication commit identifies documentation/tooling, not a new ocean.

The public Pages experience is a separately published review release. A link to
it is not a claim that it serves this local runtime. Nothing in this package
authorizes a release, push, merge, deployment or remote metadata update.

## Verified implementation

`package-lock.json` and the clean install resolve Three.js **0.175.0**, React
**19.2.0**, and Vite **6.4.2**. The artwork uses imperative Three.js ownership
inside React effects, not React Three Fiber scene ownership; the latter is an
installed dependency, not evidence of use. `HeroScene.jsx` creates one
`WebGPURenderer`; the WebGL2 fallback is exercised explicitly for publication.

M7 uses `OceanIdleGlass` through `LiveOceanLens`. The old `IdleGlassScene.jsx`
remains archived source but is not the production idle renderer. The optical
path renders the ocean once to an RGBA16F color target with a depth attachment,
then runs the shared output. The idle simulation uses two small signed RGBA16F
targets. No second ocean/context or ocean-color feedback is introduced.

Depth attachment existence is NOT proof of resolved, useful depth on every
backend. Transparent tissue generally does not write depth. Screen-space
optics use explicit bounded approximations; the paper must state these limits.
Inherited MRT bloom is disabled in the approved production path.

## Baseline verification and ordering

Clean dependency install: `npm ci --ignore-scripts` succeeded. Initial tests:
129/130 passed; the packaging test failed because `dist/client/index.html` did
not yet exist. This is a build prerequisite, not an animal or renderer failure.
Reproduction must build before running the complete suite. There is no general
`npm test` script. Final results are recorded in the validation report.

## Publication plan / file ownership

| Phase | Local deliverables |
| --- | --- |
| 1 — source truth | this file; `audit/STALE_DOCUMENTATION.md`, `audit/CLAIM_LEDGER.md`, `audit/REFERENCE_LEDGER.md` |
| 2 — mathematical extraction | `source-map.md`, `notation.md`, exactness-labeled equations in `pelagic.md` |
| 3 — bibliography | `references.bib`, verified reference ledger |
| 4 — paper first | `pelagic.md`, `pelagic.tex`, `supplement.md`, `supplement.tex` |
| 5 — actual runtime media | `figures/`, `media/`, metadata and externally staged master clips |
| 6 — fresh results | `results/`, capture-free benchmark scripts and environment records |
| 7 — research landing page | replacement root `README.md` |
| 8 — paper companion | `public/paper/`, generated from paper/artifact metadata |
| 9 — publication packaging | root citation/license/reproduction files, PDFs, externally staged ZIPs and checksums |
| 10 — review gate | `audit/VALIDATION.md`, local artifact manifest and review addresses |

No runtime source, renderer configuration, camera, animal, environment, idle
behavior, package version or hosting adapter is modified for publication.

## Pack/source conflicts resolved

1. Internal reading orders differ; the user's explicit order took precedence.
2. `PACK_INFO.json` retains `version: 2.0` alongside `packVersion: 3`; the v3
   manifest and resolved decisions govern. This is pack metadata drift only.
3. Existing README claims are historical, not current truth (see stale audit).
4. Proposed figure inventories overlap with different numbering. All requested
   subjects are retained; the paper owns one consistent figure numbering scheme.
5. Templates contain prospective release URLs/dates/tags. No unpublished URL,
   release date, DOI, affiliation or identifier will be presented as issued.

