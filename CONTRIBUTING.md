# Contributing

Keep changes small and preserve the single-renderer, shared-ocean architecture.

Before opening a pull request:

```sh
npm ci
npm run build
node --test tests/*.test.mjs
npm run test:sites
```

For visual changes, include matched browser stills and a short normal-speed motion capture. Record the tested commit, browser/backend, viewport, DPR, quality, and scene state. Keep performance runs separate from capture.

Use original or appropriately licensed assets and update [asset provenance](ASSET_PROVENANCE.md) when shipped material changes. Do not commit browser profiles, credentials, raw frame sequences, large profiling traces, generated build output, or local machine paths.

Contributions must remain compatible with the repository's [split license policy](LICENSE.md).
