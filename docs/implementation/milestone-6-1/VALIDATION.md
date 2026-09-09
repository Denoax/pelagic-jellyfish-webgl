# M6.1 validation and review evidence

## Environment and method

Baseline `9b33b64357fa5c1e6c99d0868c7dcf6f4af55dcd`, candidate runtime
`3697dfc436b3a7ec1c4bdcb81b487f5cb0c5e56f`.
Separate local worktrees/servers, identical pinned Three 0.175.0 and dependency
installation. Brave Flatpak headless, Chromium **152.0.7977.76**; actual ANGLE
**NVIDIA GeForce RTX 4070, OpenGL ES 3.2 / WebGL2**, not SwiftShader.
Existing WebGPURenderer family using its WebGL2 backend.
CPU: Intel Core i5-14600K, 20 logical processors.

Desktop viewport and actual ocean drawing buffer **1280×900**, DPR **1**,
unchanged quality and four-sample MSAA. Bloom disabled as in approved production.
DEV specimen instrumentation disables adaptive ratio changes; ratio/buffer
dimensions are recorded before and after every test. No recording, screenshots,
production build or test suite runs during the performance measurement windows.
Six-second warm-up after ready, two-second view settling and three-second scene
settling (twelve for the stationary case), then thirty seconds measured per case.
Same scene/camera setup and seeded randomness on baseline/candidate. Simulation
continues normally; these are comparable live runs, not bit-identical GPU workloads.

Development setup failures are not hidden: an external temporary Vite cache was
mistakenly processed by the TSL transform (`Identifier 'float' already declared`).
The isolated cache was moved under node_modules and both servers were restarted.
Two later capture attempts found the dev servers terminated; those failed runs
were discarded and repeated from reachable servers. Final evidence directories
and performance JSON explicitly record their own errors and source identities.
One final four-navigation screenshot session stopped answering JavaScript on
its fourth hard reload. The already-completed performance runs were separate
fresh-browser sessions. That capture was stopped (its partial `matched-reviewed`
files are retained), and the same views were recaptured in individual fresh
browsers with `scripts/m61-matched.mjs`. The cause of the reload-session hang was
not established; it is not silently classified as a passing lifecycle check.

The observer measures completion of the application's asynchronous render loop
(`async-render-completion-v2`), **not GPU duration** and not an independent rAF
loop labelled as render time. Environment CPU samples cover Sanctuary.update;
the optical output cost is included in whole-scene intervals, not falsely
attributed to CPU samples. Thirty-second runs are finite observations, not a
guarantee that no future stall can occur.

Raw results: `/home/mani/dev/jellyfish-studio/m6-1-evidence/performance/`.
Reproduction: `scripts/m61-benchmark.mjs`; summary: `scripts/m61-summary.mjs`.

## Matched performance results

All values below are milliseconds. Each cell is **median / p95 / maximum**.
Every baseline and final candidate case recorded **zero intervals >50 ms**.
Baseline directories are `m6-*`; final runtime directories are `m61-final-*`.
The older `m61-*` directories without `final` are intermediate measurements and
are deliberately not substituted for the final results.

| Scene | M6 | M6.1 |
| --- | --- | --- |
| First sanctuary reveal | 16.7 / 17.8 / 22.6 | 16.7 / 19.0 / 29.6 |
| Full plume | 16.7 / 17.8 / 24.2 | 16.4 / 19.0 / 24.4 |
| Close plume | 16.7 / 18.5 / 28.4 | 16.7 / 18.7 / 25.0 |
| Shimmer visible | 16.4 / 20.3 / 26.1 | 16.7 / 19.3 / 29.5 |
| Jellyfish illumination | 16.7 / 18.2 / 27.1 | 15.7 / 20.4 / 31.2 |
| Stationary ending | 16.7 / 18.0 / 23.2 | 16.6 / 19.2 / 33.0 |
| Explore close orbit | 16.7 / 18.9 / 25.4 | 16.6 / 19.4 / 25.9 |

Sanctuary CPU update median is **0.1 → 0.3 ms** in all seven scenes. Its p95 is
**0.2 → 0.3–0.4 ms**; maximum **0.3 → 1.3 ms** across the measured cases.
The extra grain-buffer expansion and thermal controller are not free. Overall
cadence remains near 60 Hz, but first/full and illumination p95 increased by
1.2–2.2 ms. The 15.7 ms illumination median alongside a 20.4 ms p95 is cadence
variation, not a claimed GPU speedup. One run per case cannot establish small
statistical improvements. No resolution, DPR, quality or bloom reduction was used.

The shared scanned texture adds one resident texture (70 → 71 observed). Grain
instancing retains one mineral draw plus the existing sparse-particle draw.
Thermal adds no mesh/draw of its own and no ocean rerender; it can keep the
existing optical output draw active in frames M6 previously rendered directly.
Renderer-info snapshots are retained in JSON but are not treated as a complete
pass count, because the renderer resets counters across its internal passes.

## Automated checks

- Starting M6 build and all **82/82** tests passed before edits.
- Candidate production build passed; existing >500 kB chunk warning remains.
- Candidate tests **86/86 passed**, zero skipped.
- Approved motion: 720 frames / 24 checkpoints, exact geometry, appendage state
  and activation parity.
- Default-animal check: 240 frames / 8 checkpoints, exact buffers and material
  response parity.
- Protected animal/current/camera sources and M3 bubble optics remain identical.
  The former whole-file lens hash was replaced with a byte-identical optical
  function check because extending its compositor is explicitly authorized.
- Focused new checks: bounded normal-alpha grain buffers, thermal frustum /
  disable / disposal behavior, shared color/depth usage with no new target or
  renderer, off-centre crown visibility in all four final portrait tracks,
  clear-seep particle-source separation and bounded current-driven heat shear.
- Existing long-run deterministic plume, frame-rate parity, suspension debt,
  light ownership and disposal tests still pass.

## Actual browser checks

Fresh baseline audit covered all four cinematic modes, Explore and portrait.
Candidate recordings cover Drift / Deep / Documentary descent, reverse scroll
and re-entry, close source, diffuse deposits, a complete Explore orbit and
820×900 resize. Portrait recording covers Drift and Deep at **390×844**.
This is desktop browser emulation, not physical-phone validation.

Activation succeeded. A genuinely hidden background tab resumed with only
**0.767 s** additional plume simulation after the controlled pause/return, not
the hidden wall-time debt. Solid/material/geometry counts remained stable.
Idle entered and returned to the same world and camera progress; no new browser
exceptions were recorded.

**Pre-existing idle defect remains:** cyan tissue disappears after idle return.
The frame `lifecycle-reviewed/idle-return-later.png` reproduces it. Functional idle
assertions passing do not mean this visual defect is fixed. No idle code changed.

## Evidence index

All paths below are under `/home/mani/dev/jellyfish-studio/m6-1-evidence/`.
Videos are actual timestamped browser screencasts, not generated imagery.

| Evidence | Location |
| --- | --- |
| Fresh M6 all-mode audit | `audit-modes/`, `audit-portrait/` |
| Same-camera close baseline/candidate | `detail-matched-before/`, `detail-reviewed/` |
| Same seeded hold-14 desktop before/after | `matched-baseline/`, `matched-reviewed-fresh/` (candidate has one subdirectory per view) |
| Plume gate before mineral edits | `plume-gate/motion.mp4` |
| Current direction change and return | `current-response/motion.mp4` — 27 s; DEV bounded vent-sampler fixture, not a claim of pointer-induced whole-ocean reversal |
| Live shimmer disabled/enabled | `shimmer-reviewed-matched/off.png`, `on.png`; same simulation and shader time |
| Clear diffuse seep disabled/enabled | `diffuse-reviewed-clear/off.png`, `on.png` (outside the basal rock, looking through the seep at geology) |
| Moving animal and plume through shimmer | `shimmer-reviewed-motion/motion.mp4` — approximately 23 s |
| Desktop descents / reverse / orbit / diffuse / resize | `desktop-reviewed/motion.mp4` — approximately 110 s |
| Portrait descents / reverse / re-entry | `portrait-reviewed/motion.mp4` — approximately 53 s |
| Activation / true background / idle / return | `lifecycle-reviewed/motion.mp4`, `checks.json` |
| Solid-triangle camera clearance | `clearance.json` |

The main chimney moves intentionally for portrait, so fixed-camera close
comparisons also reveal that world-layout change. `minerals-grain/mineral.png`
isolates the material pass before the placement change; do not mislabel it as
the final composition. Optical screenshots include the existing direct-vs-M3
output/antialiasing difference; they are not asserted pixel-identical outside
the refracting volume.

### Direct still comparisons

| Subject | M6 | M6.1 |
| --- | --- | --- |
| Source | [Before](../../../../m6-1-evidence/detail-matched-before/source.png) | [After](../../../../m6-1-evidence/detail-reviewed/source.png) |
| Entrainment | [Before](../../../../m6-1-evidence/detail-matched-before/entrainment.png) | [After](../../../../m6-1-evidence/detail-reviewed/entrainment.png) |
| Dispersion | [Before](../../../../m6-1-evidence/detail-matched-before/dispersion.png) | [After](../../../../m6-1-evidence/detail-reviewed/dispersion.png) |
| Animal-lit mineral surface | [Before](../../../../m6-1-evidence/detail-matched-before/mineral.png) | [After](../../../../m6-1-evidence/detail-reviewed/mineral.png) |
| Deposits | [Before](../../../../m6-1-evidence/detail-matched-before/deposits.png) | [After](../../../../m6-1-evidence/detail-reviewed/deposits.png) |
| Desktop Deep, held at 14 s | [Before](../../../../m6-1-evidence/matched-baseline/deep.png) | [After](../../../../m6-1-evidence/matched-reviewed-fresh/deep/deep.png) |
| Portrait Deep ending | [Before](../../../../m6-1-evidence/audit-portrait/D-end.png) | [After](../../../../m6-1-evidence/portrait-reviewed/D-end.png) |
| Live primary shimmer | [Disabled](../../../../m6-1-evidence/shimmer-reviewed-matched/off.png) | [Enabled](../../../../m6-1-evidence/shimmer-reviewed-matched/on.png) |
| Clear diffuse shimmer | [Disabled](../../../../m6-1-evidence/diffuse-reviewed-clear/off.png) | [Enabled](../../../../m6-1-evidence/diffuse-reviewed-clear/on.png) |

The portrait images are comparable final-view motion samples, not a claim of
identical animation phase. The desktop held-state capture records time exactly
14 and matching camera progress. The final four independent captures each had
zero browser exceptions. The initial diffuse inspection camera was too close
to the basal rock; its dark captures are retained in `diffuse-reviewed-matched`
but are not the clear-view evidence linked above. No production camera changed.

## Limitations / not tested

- Optical depth is opaque depth. Correct per-layer sorting of overlapping
  transparent animals and mineral grains remains approximate, as in M3.
- Subtle shimmer is clearest against a nearby moving silhouette; empty black
  water has no visible reference to bend. No glow/forcefield was added to fake it.
- Analytic rising density cells are not a thermal fluid solver.
- Extreme close-up still resolves billboard grains. Mineral microheight comes
  from scanned luminance, not a physically measured sulfide displacement map.
- The single pooled light and sparse palette deliberately leave most geology
  dark without a nearby animal. No new light was used to improve screenshots.
- Hardware WebGPU, SwiftShader WebGPU, non-NVIDIA hardware and physical mobile:
  **NOT TESTED** in this pass. The known legacy full-ocean WebGPU issue is not
  claimed fixed. No renderer/Three/framework migration occurred.
- Nothing pushed, merged, deployed or changed on Pages. M7 not started.
