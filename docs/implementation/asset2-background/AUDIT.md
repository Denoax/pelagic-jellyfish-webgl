# Asset 2: background-only authorization

Approved runtime/parity baseline: `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.
Working branch: `pre-m8-asset2-background`; starting HEAD
`ab709b22f68e1bc0cd57f4bb70871ab67c609a01` contains only the supplied reference
pack after that baseline. Initial working tree clean. Origin is
`https://github.com/Denoax/pelagic-jellyfish-webgl.git`. Detached baseline
worktree: `../asset2-approved-baseline`. No previous worktree was switched,
reset, cleaned, stashed or removed.

Read the complete 3,285-line specification, README, RESEARCH_NOTES, both JSON
files and visually inspected all thirteen PNGs before file edits. REF_00 is
immutable. No generated/replacement art or external asset search is needed.

## Scope classification before runtime edits

- ENVIRONMENT_RUNTIME / BACKGROUND_SCOPE: new independent background node,
  static proxy spires, opaque geology extinction/material illumination and
  environment-only particle presentation. No tissue-fog function changes.
- ENVIRONMENT_INTEGRATION / BACKGROUND_SCOPE: minimal creation/update/disposal
  seams in the environment owner and HeroScene, observing camera/animals only.
- QA_ONLY: local server, reference metrics, read-only renderer/resource probes,
  development ablations, repeatable existing-camera inspection, tests/docs.
- OUT_OF_SCOPE / read-only: all animal geometry/material/motion, M2 simulation,
  M3/M7 optics and lifecycle, camera tracks/control/UI, existing M6 geometry,
  layout, colony/pinpoint counts and simulation, renderer/version/quality.

No runtime edits have been made at audit creation. Historical milestone scope
tests will require narrowly documented environment exceptions; their locked
animal/camera/glass comparisons must remain effective, not be disabled.

## Reference inconsistencies to retain honestly

- Actual supplied reference center/border metric is 4.64297545 (also printed
  on REF_02); config's nominal target is 5.4. Use actual measured reference for
  comparison and the specified 4.2–6.8 guardrail, not a fabricated 5.4 result.
- Outer fade prose formula is `(1 - smoothstep(1, 1.65, r))²`; config's string
  has different parentheses. Use the explicit specification formula and
  document it. Neither permits fading the animal or restricting Explore.

Baseline checks: 130/130 Node tests passed before runtime changes. Build and
the two deterministic animal parity scripts are being run separately.
