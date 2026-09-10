# M6.2 — atmosphere, geology and localized life

Status: **PARTIAL**. The new basin has more physical depth and local detail, but
wide views remain too dark/monochrome to claim the requested artistic success.
This is a preserved local candidate for review, not visual approval.

- Starting M6.1: `cb46120537ee6e56c02611f910c67de1e1a1f80f`.
- Candidate runtime: `3822c638254d7398d4c4c02040bf7812d6404e2c`.
- Branch: `milestone-6-2-atmosphere-life-refinement`.
- Worktree: `/home/mani/dev/jellyfish-studio/m6-2-sanctuary`.
- Repository: `Denoax/pelagic-jellyfish-webgl`.

The final documentation commit follows the runtime commit without changing
runtime source. `git rev-parse HEAD` identifies that complete handoff.

## Preview

<http://127.0.0.1:5203/?renderer=webgl&idle=300>

Use the existing **View → Deep** or **Drift**, descend, then inspect the floor
with **Explore**. No new public controls. Restart the local server with:

```sh
cd /home/mani/dev/jellyfish-studio/m6-2-sanctuary
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
node scripts/m62-preview.mjs
```

The longer idle delay in this review URL does not change the default idle system.

## Changes retained

- Real curved basin-floor incision, tapered at both ends; existing chimney and
  diffuse outlets remain attached to unchanged local floor heights.
- Three terrace families, paired channel banks, outer-bank rubble and four
  smaller dead spires. Shared instancing; no random global rock scatter.
- Smoother eroded shelves, cool slate shoulders, pale mineral ridges, restrained
  ochre and localized seep/gully deposits. No global light/exposure increase.
- Five small ecological islands: curved filaments, tiny shell-like forms and
  rare teal/violet biological points. Minimal movement follows the existing
  current; animal proximity reveals local color. No glowing mineral carpet.

Details: [source/visual audit](AUDIT.md), [architecture and file ownership](ARCHITECTURE.md),
[validation, evidence and performance](VALIDATION.md).

## Verification summary

90/90 Node tests, both approved-animal parity scripts and production build pass.
Real NVIDIA WebGL2, Brave Chromium 152, Three 0.175.0. Seven same-condition
30-second benchmarks at 1280×900/DPR1: candidate medians **16.5–16.7 ms**,
p95 **17.7–19.9 ms**, maximum **31.9 ms**, zero intervals >50 ms. Sanctuary
CPU median remains **0.3 ms**. Stationary/orbit p95 increase by 2.2/1.1 ms;
the added visual work is not free. These are frame intervals, not GPU timings.

Desktop, portrait, narrow resize and Explore evidence is recorded. Strict
lifecycle console validation fails on the existing idle-return defect: both
untouched M6.1 and this candidate reproduce the same 18 invalid-geometry errors
and cyan loss. Click/background recovery and world/UI/resource continuity pass.
Physical mobile, other GPUs and WebGPU are NOT TESTED.

Runtime files: `src/scene/sanctuary/{Sanctuary.js,geology.js,materials.js,VentLife.js}`.
Other edits: scoped AGENTS note, four focused tests, local preview/capture helpers,
console-aware evidence validation, benchmark output-root support and these docs.

## Remaining artistic issues

The gully is clear in floor-level Explore but contributes less than desired to
the unchanged high camera composition. Some paired-bank repetition is apparent
at close range. Life is localized and visible nearby, but too small to reward
the wide journey strongly. Ochre/violet separation remains subtle; broad dark
surfaces still dominate without a nearby animal. These are real limitations,
not a reason to label passing tests as visual success.

The Product Design audit caused two rejected visual iterations: overly faceted
new rock forms and a high-contrast deposit mask that looked like camouflage.
Neither is in the retained runtime. No camera or ocean-light compensation was
used. The useful structural work is committed rather than restarting M6.

## Scope

M1–M5.2 source and behavior were not redesigned. Approved jellyfish geometry,
motion/materials, M2 current/wakes, M3 refraction, M4 population, M5 cameras,
View/scroll and idle source remain unchanged. The known idle-return cyan-loss
issue is explicitly outside this pass. No renderer migration or Three upgrade.

**Nothing pushed, merged, deployed or changed on GitHub Pages. M7 not started.**
