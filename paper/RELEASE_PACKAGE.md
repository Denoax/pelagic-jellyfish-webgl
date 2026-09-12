# Local publication assets

No GitHub release exists for this package. No remote video URLs, DOI or arXiv submission are asserted.

Run `scripts/publication/package.mjs` as described in the root reproducibility guide. The chosen external output directory contains:

- `pelagic.pdf` and `supplement.pdf`;
- `pelagic-reproducibility.zip` with tools, manifests and raw timing data;
- `pelagic-supplemental-media.zip` with twelve browser MP4s, capture metadata and timestamps;
- `pelagic-arxiv-source.zip` with portable paper and supplement sources and figures, prepared only;
- `artifact-manifest.json` and `SHA256SUMS`;
- the local review website and unpacked supplemental media.

Large motion is deliberately outside ordinary Git history. The local preview server supplies playback and download routes; publication requires a separate author approval. Do not infer approval from a completed local package or a successful build.
