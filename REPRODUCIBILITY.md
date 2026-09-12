# Reproducing the Pelagic publication

**README.md is now the complete publication.** Its method, equations,
figures, results, limitations and references are readable on the repository
front page. The paper/PDF cache and earlier archive reports below are retained
history, not a required reader route. No separate paper frontend is shipped.

For README maintenance, edit `README.md` directly. The one-time
`readme-assemble.mjs` transform records how the previous manuscript was salvaged;
do not rerun it over later manual edits. Existing figures and benchmark data
are reused without regeneration. If a motion derivative needs rebuilding:

```sh
node scripts/publication/readme-media.mjs ../publication-evidence
node scripts/publication/readme-check.mjs ../publication-validators ../readme-review
node scripts/publication/readme-preview.mjs ../readme-review ../publication-validators
```

The checker uses Pandoc and the separate jsdom/Mermaid validator installation
described below. The preview prints its loopback address and renders README
only; it is not a new app, deployment or required publication website. Motion
derivatives are 640 pixels wide at 8 fps, from retained browser recordings at
original speed. Their exact excerpts/hashes are in `docs/readme/media.json`.

## Identities and scope

Approved runtime: `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.
Publication branch: `publication-preprint-v1` (local until authorized).
The release manifest records the paper/tool commit separately. Do not substitute the newer unapproved Asset2 environment or assume remote main contains this local package. The reproducibility ZIP includes an exact runtime snapshot under `runtime/`, with assets, lockfile, build entry points, notices and a hash manifest. It can build and run without access to an unpublished Git commit. Full historical parity tests still require the original Git history; the snapshot does not pretend to include it.

The archive root also mirrors that source alongside the complete paper assets and publication tools, so both runtime and paper commands have their expected relative paths. The nested `runtime/` is a smaller, clearly separated build snapshot. For a history-free archive, run installation/build/hash verification from either snapshot root; do not run the historical test/parity commands below there. Those commands are for a full publication Git checkout with its recorded historical objects.

## Runtime

Node 24.20.0 was used, with the committed lockfile. Three.js is pinned at 0.175.0; React is 19.2.0 and Vite 6.4.2. Do not upgrade packages for reproduction.

```sh
npm ci
VITE_OCEAN_RELEASE=milestone-2 npm run build
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
node scripts/publication/source-manifest.mjs
npm run dev -- --host 127.0.0.1
```

Open the address printed by Vite. The existing release flag selects the approved ocean. Build before tests because the packaging test reads `dist/client/index.html`. Initially 129/130 passed before build; after satisfying that prerequisite, all 130 passed. Missing generated output is not a passing test suite.

The manifest checks approved runtime files against the baseline commit, including geometry, materials, animation, cameras, compositor, assets and build configuration. Publication tools are not imported by the artwork. No renderer, quality or runtime change is part of this publication branch.

## Browser evidence

Use a Chromium-compatible executable exposing CDP, supplied through `BROWSER_EXECUTABLE`. Its executable path is a local environment choice, not a file to commit. Optional `BROWSER_ARGUMENTS` is a JSON array. The harness creates an isolated profile in the evidence directory; **never distribute that profile**. FFmpeg is required for encoding. The harness requests ANGLE/OpenGL and verifies the actual backend in metadata; flags alone do not prove hardware use.

```sh
export BASE_URL='replace-with-the-local-address-printed-by-Vite/'
export EVIDENCE_DIR='../publication-evidence'
export BROWSER_EXECUTABLE='chromium'
node scripts/publication/capture.mjs "$BASE_URL" "$EVIDENCE_DIR/scout" scout
node scripts/publication/capture.mjs "$BASE_URL" "$EVIDENCE_DIR/motion" S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12
node scripts/publication/curate-media.mjs "$EVIDENCE_DIR"
```

The two placeholders above identify an explicitly supplied local address and output location, not a prescribed QA port. Specimen clips inspect the same approved animal contracts; ocean clips inspect the production population and environment. Presets use seed 7183. Camera fixture, progress, simulation time, browser identity, viewport and drawing buffer accompany each clip. Arrival/scheduling may differ between machines; these are not bitwise reproducible images.

Captured source frames retain timestamps before 30 fps H.264 encoding. CFR output may repeat frames. GIFs are 960 pixels wide, 12 fps, six-second excerpts with a limited palette; they are compressed previews, not lossless evidence. MP4s retain complete normal-resolution source sequences. No AI imagery is used as runtime evidence.

## Timing — run separately

Close recording sessions and wait for encoding to finish. Do not run tests, builds or another GPU scene concurrently.

```sh
export PELAGIC_HARDWARE='describe CPU, RAM, GPU, OS and relevant background services'
node scripts/publication/benchmark.mjs "$BASE_URL" "$EVIDENCE_DIR/performance"
```

The recorded publication fixture specifically asserts NVIDIA RTX 4070, DPR 1 and 1280×900 drawing buffer. On different hardware, adjust only the hardware assertion in a separately identified measurement script; do not describe that run as the same hardware experiment. Camera presets and quality must remain recorded. Seven 30-second cases follow eleven seconds of initial warm-up and additional scene/idle warm-up. A bubble window can finish naturally during its measurement.

When running from the history-free snapshot, set `PUBLICATION_TOOL_SHA` to `paperSha` from the artifact manifest. This metadata fallback does not change the measured loop. The retained original run records its actual original tool commit, before that portability addition.

Results are async render-completion intervals, **not GPU timings**. Raw intervals, CPU instrumentation and before/after states are retained. These are single runs, not confidence intervals or statistically isolated feature costs. Refresh-paced medians do not measure available GPU headroom. The publication host retained its local llama service throughout; the run does not isolate contention from that service. The adverse 65.3 ms interval is not removed.

## Archived paper and figures (optional)

Install Pandoc 3.11, Tectonic 0.17.0, FFmpeg and librsvg (`rsvg-convert`) as separate publication tools. Tectonic may download its TeX bundle on first use. Tool installation does not modify the application dependencies. Set `PANDOC` and `TECTONIC` if the executables are not on PATH.

```sh
node scripts/publication/figures.mjs
node scripts/publication/inspection.mjs "$BASE_URL" "$EVIDENCE_DIR/inspection-final"
node scripts/publication/curate-inspection.mjs "$EVIDENCE_DIR"
node scripts/publication/metadata-provenance.mjs "$EVIDENCE_DIR"
node scripts/publication/build-paper.mjs
```

The old manuscript cache is `paper/manuscript.md` and `paper/supplement-source.md`; README.md is now canonical for publication. The archived builder derives Markdown, TeX, HTML/MathML and PDFs, inserting the retained results table. It does not replace README. Figure diagrams are explicitly source-derived, not captured evidence. Generated text and PDFs must be reviewed together if intentionally rebuilt. Do not regenerate these valid assets just to maintain README, and never silently change the measured runtime identity.

The inspection step captures four held pulse phases, a frozen optics-on/off diagnostic, population states and resize behavior. Run `figures.mjs` before `curate-inspection.mjs`: the latter combines the clean diagrams with recorded browser frames. Running it twice without regenerating the diagrams would recursively embed a composite. Population panels match viewport/DPR but intentionally show different journey states; they are not a forced same-pose tier comparison. The inherited portrait-resize clock can appear stretched; publication does not alter that approved behavior.

## Prior local packaging (historical, not the README workflow)

```sh
node scripts/publication/package.mjs "$EVIDENCE_DIR" ../publication-release-review
node scripts/publication/preview.mjs ../publication-release-review
```

These tools and the earlier staged archives are preserved for reproducibility history. The separate `public/paper/` frontend and its generator were removed after salvage; their exact prior versions remain in local commit `2bea550`. The old stage may still contain that earlier page and must not be mistaken for the current README review. Use `readme-preview.mjs` above for this task. No future release URL is invented, and no remote publication is authorized.

The media ZIP contains twelve MP4s, metadata and timestamp records, not raw browser profiles or thousands of intermediate JPEGs. The reproducibility ZIP contains publication tools, pinned manifests, fresh data, captions, instructions and the buildable runtime snapshot. The arXiv-ready source ZIP contains portable TeX/BibTeX, required figures and notices only. Preparation is not submission. `artifact-manifest.json` and `SHA256SUMS` identify exact files; ZIP CRC and extraction checks are part of local validation.

## Validation boundaries

Publication validators are separate tools, not application dependencies. The review used Mermaid 12.0.0, jsdom 30.0.1, Ajv 8.20.0, cffconvert 2.0.0 and PyMuPDF 1.28.2. A separate tool directory and virtual environment keep the original application lockfile unchanged:

```sh
npm install --prefix ../publication-validators mermaid@12.0.0 jsdom@30.0.1 ajv@8.20.0
python -m venv ../publication-pdf-tools
../publication-pdf-tools/bin/pip install cffconvert==2.0.0 pymupdf==1.28.2
../publication-pdf-tools/bin/cffconvert --validate -i CITATION.cff
node scripts/publication/validate.mjs ../publication-validators ../publication-release-review
node scripts/publication/verify-archives.mjs ../publication-release-review
../publication-pdf-tools/bin/python scripts/publication/pdf-qa.py ../publication-pdf-review
node scripts/publication/page-qa.mjs "$REVIEW_URL" ../publication-browser-review
```

Set `REVIEW_URL` to the loopback address printed by `preview.mjs`, with its trailing slash. PDF and archive checks require the Tectonic/Pandoc variables described above. The page check operates native video controls and waits for every clip to end; do not substitute a direct autoplay call that browser policy rejects. Validate again after regenerating packages, and visually inspect the rendered output as well as passing machine checks.

Actual NVIDIA WebGL2 is the measured path. Desktop/narrow/portrait browser emulation is not physical-mobile testing. Hardware WebGPU, software WebGPU, Safari and Firefox remain NOT TESTED in this publication run. Historical reports may cover other experiments; their numbers are not substituted for fresh publication measurements. No benchmark here claims to fix the legacy full-ocean WebGPU problem.
