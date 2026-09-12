# Approved main / Pages integration

Mani explicitly approved merging/pushing the README to main and publishing
the artwork on GitHub Pages. This supersedes the local-only restriction for
this release, not the prohibition on unapproved later artwork.

Inputs: publication `421aa468246da6118bfa958439e8ae115cf864a8` and prior main
`a2ed3bc89c700ba5c792ecac19747939e9f09b8d`. The measured/visual baseline stays
`bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`; Asset2 is excluded.

Main's M4 publishing adapter conflicted with the approved M5–M7 scene owner.
The merged version preserves the current View/camera, population, sanctuary,
thermal hook and idle system; Pages uses the existing `milestone-2` release
flag to select the validated WebGL2 path. The flag's historical name is not
a milestone limit. Existing main history and release documentation are retained.

Three runtime files retain main's production-only privacy guards:
`HeroScene.jsx`, `BubblePassage.js`, and `PopulationDetail.js`. Specimen query
parameters cannot select a chamber in production; bubble replay listeners and
population/bubble inspection globals are DEV-only. The warmup metadata write
is also DEV-only so it cannot dereference the deliberately absent global.
No geometry, material, motion, optics equation or environmental parameter changes.

The first merged test run passed 125/132: seven historical whole-file/scope
locks rejected these explicit guards. Tests now normalize ONLY the enumerated
release delta and assert the complete normalized files equal approved M7.
All other bytes remain subject to the original historical comparisons. There
is no blanket exclusion of these files. The final suite passes 132/132; approved
motion (720 frames/24 checkpoints) and default-animal geometry/material parity
(240 frames/eight checkpoints) pass. The production build passes with its
existing large-chunk warning. No new benchmark claim is made.

The original publication byte-manifest describes the untouched numerical
baseline. On this merged release use `node --test tests/*.test.mjs` for its
exact release-delta checks; do not claim the three guarded files are literally
byte-identical to baseline. Historical publication reports remain historical.

Production smoke tooling checks one ocean canvas (the existing hidden 2D View
guide is separate), actual WebGL2, hidden DEV globals,
click activation, rendered idle entry and return, and browser errors. It runs
against the actual project-subpath bundle and can also inspect the live URL.
No separate paper website or new release tag is created by this integration.
