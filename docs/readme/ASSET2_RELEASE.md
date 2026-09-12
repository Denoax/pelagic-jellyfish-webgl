# Approved Asset2 main / Pages release

Mani explicitly approved publishing `b4ca42faa3b80e465d39995ebb0537a2aa948148`
to main and Pages, correcting the earlier release's omission of this background.
Its runtime commit is `99ac8336be832c18230dcadefd815308c6c83c8f`.

This release merges that complete branch into published `990a4cf913d0668a067df276358b63f8399a450c`.
The README publication and existing production-only review guards are preserved.
No environment calibration, animal, camera, M7, renderer, quality or dependency
change is made while publishing. The `milestone-2` build flag is the existing
full-ocean release selector, not a restriction to M2 artwork.

`tests/release-scope.mjs` asserts every approved Asset2 runtime source file is
unchanged after reversing only the exact existing production review guards.
Historical M1–M7 scope checks retain Asset2's already-tested integration seams.
The original Asset2 branch and evidence are retained unmodified. Its report's
local-only scope statement describes that historical handoff; this approval
supersedes it for publication, not for new artwork or M8.

The publication's M7 measurements remain M7 measurements. Asset2's separate
performance and imperfect reference-match results remain in its original report.
No new benchmark claim or exact-reference-match claim is made by this release.

Release validation: 137/137 Node tests passed, production project-subpath build
passed, and both approved-motion/default-animal parity tools passed. Browser
checks on the built WebGL2 site found all 30 Asset2 instances in four batches,
visible after native scrolling to progress .552; DEV controls stayed absent.
A 15-second browser descent, background frame, activation and idle entry/return
were captured with no browser errors under
`../readme-review/asset2-release-{local,lifecycle-local}/` (local evidence).
The production entry bundle is `index-CFKgTUCU.js`; the ocean chunk is
`HeroScene-ByJEnUPo.js`, replacing the earlier non-Asset2 release hashes.
