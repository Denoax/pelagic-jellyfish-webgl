# Asset 2 Codex Reference Pack

This pack is intended to be extracted directly into:

`docs/reference/asset2/`

inside the approved M7 worktree.

The one-shot implementation brief is:

`ONE_SHOT_CODEX_PROMPT.md`

Use `REF_00_ASSET2_ORIGINAL.png` as the primary visual source of truth.

The analytical images are all derived from that exact supplied reference:

- REF_01: composition / screen-space target
- REF_02: low-frequency light field and luminance structure
- REF_03: exact spire crop atlas
- REF_04: silhouette-priority analysis
- REF_05: floor / benthic visibility atlas
- REF_06: atmosphere / negative-space atlas
- REF_07: Explore/freecam world-fade storyboard
- REF_08: required render-stack diagram
- REF_09: sampled palette / brightness budget

`asset2_reference_metrics.json` and `asset2_target_config.json` provide machine-readable
targets for the QA harness.

The three `RUNTIME_GUIDE_*.png` files are heavily reduced/blurred derivatives. They
are optional low-frequency guide assets, not replacements for live rendering. Their
allowed use and fade rules are specified in the prompt.

Nothing in this pack authorizes push, merge, deployment, camera changes, jellyfish
redesign, M7 changes, a Three.js upgrade, or starting M8.
