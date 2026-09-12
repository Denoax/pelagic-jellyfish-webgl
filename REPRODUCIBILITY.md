# Reproducing the Pelagic publication

## Identities and scope

Approved runtime: `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.
Publication branch: `publication-preprint-v1` (local until authorized).
The release manifest records the paper/tool commit separately. Do not substitute the newer unapproved Asset2 environment or assume remote main contains this local package. The reproducibility ZIP includes an exact runtime snapshot under `runtime/`, with assets, lockfile, build entry points, notices and a hash manifest. It can build and run without access to an unpublished Git commit. Full historical parity tests still require the original Git history; the snapshot does not pretend to include it.

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

## Paper and figures

Install Pandoc 3.11, Tectonic 0.17.0, FFmpeg and librsvg (`rsvg-convert`) as separate publication tools. Tectonic may download its TeX bundle on first use. Tool installation does not modify the application dependencies. Set `PANDOC` and `TECTONIC` if the executables are not on PATH.

```sh
node scripts/publication/figures.mjs
node scripts/publication/inspection.mjs "$BASE_URL" "$EVIDENCE_DIR/inspection-final"
node scripts/publication/curate-inspection.mjs "$EVIDENCE_DIR"
node scripts/publication/build-paper.mjs
node scripts/publication/build-page.mjs
```

Canonical text is `paper/manuscript.md` and `paper/supplement-source.md`. The builder derives Markdown, TeX, HTML/MathML and PDFs, inserting the fresh results table. Figure diagrams are explicitly source-derived, not captured evidence. Generated text and PDFs must be reviewed together. Update raw data and `paper/results/table.md` together if making a new measurement; never silently change the published runtime identity.

The inspection step captures four held pulse phases, a frozen optics-on/off diagnostic, population states and resize behavior. Run `figures.mjs` before `curate-inspection.mjs`: the latter combines the clean diagrams with recorded browser frames. Running it twice without regenerating the diagrams would recursively embed a composite. Population panels match viewport/DPR but intentionally show different journey states; they are not a forced same-pose tier comparison. The inherited portrait-resize clock can appear stretched; publication does not alter that approved behavior.

## Local review and packaging

```sh
node scripts/publication/package.mjs "$EVIDENCE_DIR" ../publication-release-review
node scripts/publication/preview.mjs ../publication-release-review
```

The preview prints a loopback address and serves the companion `/paper/`, a rendered README, paper/PDF, gallery, citation and prepared downloads. It supplies local video URLs only; no future GitHub release URLs are invented. Preview the package through this server rather than expecting an ordinary artwork build to contain every staged publication asset. The publication page source lives in `public/paper/`; package assembly supplies its paper assets without altering the runtime build pipeline.

The media ZIP contains twelve MP4s, metadata and timestamp records, not raw browser profiles or thousands of intermediate JPEGs. The reproducibility ZIP contains publication tools, pinned manifests, fresh data, captions, instructions and the buildable runtime snapshot. The arXiv-ready source ZIP contains portable TeX/BibTeX, required figures and notices only. Preparation is not submission. `artifact-manifest.json` and `SHA256SUMS` identify exact files; ZIP CRC and extraction checks are part of local validation.

## Validation boundaries

Actual NVIDIA WebGL2 is the measured path. Desktop/narrow/portrait browser emulation is not physical-mobile testing. Hardware WebGPU, software WebGPU, Safari and Firefox remain NOT TESTED in this publication run. Historical reports may cover other experiments; their numbers are not substituted for fresh publication measurements. No benchmark here claims to fix the legacy full-ocean WebGPU problem.
