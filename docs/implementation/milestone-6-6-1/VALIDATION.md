# M6.6.1 validation

Status: PASS for the diagnosed regression; separate forced-freeze navigation reload is not fixed.

## Automated checks

Baseline: 102/102 tests, both parity checks and production build pass. Candidate: 107/107 tests, both parity checks and production build pass. New focused tests exercise the actual extracted pointer handler (not a rewritten mock), reproduce the original missing-coordinate failure, retain exact finite-pointer behavior, test 25 repeated malformed activity injections through persistent LOD geometry, and enforce the exact four-line runtime delta against approved M6.6.

Historical scope assertions now allow only the authorized HeroScene input change; the new exact-source assertion protects every other line and all other runtime files. No animal, material, compositor or camera assertions were removed to hide changes.

The first candidate suite invocation preceded building the fresh worktree and failed the existing Sites artifact check because `dist/client/index.html` did not yet exist. Building first and rerunning produced the passing result above; this was a test prerequisite/order issue, not a runtime regression. The existing large-chunk build warning remains.

```sh
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
```

Motion parity: 720 frames / 24 checkpoints, exact geometry, appendages and activation. Default animal parity: 240 frames / eight checkpoints, exact geometry and material response. No general `npm test` script exists. Logs: `/tmp/m661-{baseline,final}-{tests,build,motion,animal}.log`.

## Browser evidence

Root: `/home/mani/dev/jellyfish-studio/m6-6-1-evidence/`. Every screenshot and clip is actual browser output, not generated imagery. Baseline and candidate use the same NVIDIA WebGL2 path and unchanged artwork settings. Diagnostic instrumentation is not used for performance measurements.

The [local review page](http://127.0.0.1:5214/) was opened in the actual browser: all nine comparison images loaded, the motion clip played normally and there were no browser errors. `review-page/validation.json`, `comparison.png` and `playback.png` retain that check. The first ten mixed cycles are in `candidate-cycles/motion.mp4`; malformed-trigger failure/repaired clips are in `baseline-first-input/motion.mp4` and `candidate-legacy/motion.mp4`.

`candidate-cycles/` passed **35 consecutive visible idle/return cycles on one page instance**: first ten recorded, next 25 not recorded. Opening, mid-journey and sanctuary alternate. The matrix includes immediate pointer movement, wheel/reverse scrolling, successful native jellyfish clicks, View switch, Explore entry/exit, resize and a close/far detail transition. Four actual activations succeeded; 25 cycles ended with a transitioning LOD representation. All returned states have finite checked attributes/Verlet/transforms and retain the same world, all animal geometry/material/detail-map identities, View/progress until deliberately changed by the test, and valid tissue opacity.

Whole-renderer counters are not equivalent to object allocations: resident GPU geometry rises as previously unseen LOD buffers are registered, while all CPU geometry identities remain exact. The matrix's deliberate portrait/desktop resizes increase the renderer texture counter by four per resize pair. This is reported separately from idle-only resource behavior, not labeled zero growth without qualification.

An additional **ten fixed-sanctuary idle cycles on each version**, without View/resize changes, keep both counters exactly stable at **193 geometries / 71 textures before and after every cycle**. Persistent geometry, material and detail-map identities also remain unchanged. There is no idle-only leak in this test. The resize-associated counter behavior was not turned into an unrelated renderer cleanup project. Raw results are `baseline-fixed-cycles/cycles.json` and `candidate-fixed-cycles/cycles.json`.

## Lifecycle and matched rendering

On both approved baseline and candidate, ordinary tab hide/return, idle followed by hiding, and hiding immediately around dismissal pass with finite geometry, bounded deltas, stable world identity and retained camera mode/progress. The hidden interval is five seconds; native tab activation confirms `document.visibilityState === 'hidden'`. This is not the same test as visible app idle.

The stronger CDP frozen/active sequence remains unsuccessful on both versions: the browser performs a **full navigation reload** (`PerformanceNavigationTiming.type === 'reload'`), loses all diagnostic/world hooks and enters loading. It does not reproduce the malformed-input chain. No evidence supports repairing this with a tissue/clock reset. It remains a separate browser/development-page lifecycle limitation, not a claimed hotfix success; driver/context continuity cannot be certified across that discarded document.

Matched opening/mid/sanctuary images have identical camera, animal time 14, pulse phase and 1280×900 drawing buffer. Each candidate also has a held-state before-idle/after-idle pair with the same world and camera. These confirm cyan tissue/material continuity without motion confusing the comparison; the 35-cycle clip/checks separately validate live unpaused motion. Whole images are not asserted byte-identical: bubble scheduling can differ by one fixed step between browser loads, and wall-time shader/optical detail and keyboard focus feedback remain live. No pixels were edited or brightened. The ordinary-rendering source parity test proves that valid input follows the exact approved runtime.

The repaired malformed-trigger clip shows healthy cyan tissue throughout return. The original malformed-trigger clip exposes the corresponding missing dynamic tissue, with pink internal pieces left behind. These free-running diagnostic clips have tracing overhead and are not matched performance runs.

## Remaining checks / limitations

Fresh loading directly into `?idle=1` (no View change or synthetic pointer trigger) also passes on both baseline and candidate, with live cyan tissue and finite geometry after natural idle entry and Enter dismissal. See `baseline-startup/` and `candidate-startup/`.

Physical mobile, hardware/software WebGPU, Firefox/Safari and other GPU drivers are NOT TESTED. Portrait is browser viewport emulation. Browser lifecycle validation uses local Vite development serving; production builds pass but a separate production-bundle browser matrix was not run. No renderer-family or Three.js upgrade, M7, push, merge, deployment or Pages change.

## Capture-free performance

Intel i5-14600K / NVIDIA RTX 4070, Brave Chromium 152.0.7977.76, actual ANGLE NVIDIA OpenGL WebGL2. Three.js remains 0.175.0. Identical 1280×900 viewport and drawing buffer, DPR 1 before/after, existing adaptive policy and approved direct-render/bloom-off settings. Each fresh browser warms six seconds, selects the same camera/scene and settles five seconds, then measures 30 seconds. Post-idle additionally waits for natural idle and its entry fade, then measures from dismissal without a post-return warm-up that could conceal a hitch.

These are async **ocean render-completion intervals**, not GPU timings. No screen capture, encoding, geometry diagnostic scan, build or test suite runs alongside timing measurements. Baseline post-idle uses valid activity/native dismissal, not the already-corrupted malformed-input scene. Both sources use the same protocol.

| Scene | Baseline median / p95 / max ms | Hotfix median / p95 / max ms | >50 ms baseline / hotfix |
|---|---:|---:|---:|
| normal | 16.7 / 17.9 / 25.7 | 16.7 / 17.9 / 25.9 | 0 / 0 |
| sanctuary | 16.7 / 18.2 / 29.2 | 16.7 / 18.1 / 27.8 | 0 / 0 |
| post-idle | 16.7 / 18.0 / 26.8 | 16.6 / 17.9 / 28.5 | 0 / 0 |

All six runs have zero browser errors and zero intervals over 50 ms. Sanctuary CPU median remains 0.3 ms in every run. First actual ocean completion after the dismiss key: baseline **17.2 ms**, candidate **17.4 ms**. This measures input-to-next-completion latency (not an isolated GPU frame); the first ten following intervals are retained in the summary. No measured resume hitch or meaningful steady-state regression. Small distribution differences are normal paired-run observations, not evidence of a speedup.

[Structured summary](performance-summary.json) records source SHAs, browser/backend, buffer sizes, camera/quality, CPU and first-return measurements. Full interval arrays are in `m6-6-1-evidence/performance/{baseline,candidate}-{normal,sanctuary,post-idle}/performance.json`. No samples were dropped or quality lowered.

## Final safety / parity

Only `HeroScene.updatePointer` receives the early input validation. M1 animal geometry/material/color/glow/motion/activation, M2 currents/wakes, M3 optical output, M4/M4.1 LOD and performance architecture, M5.2 camera/View/scroll, M6.6 sanctuary/material/life/plume/shimmer remain source-identical. Visible idle/return does not remount the ocean or reset any simulation. No new render pass, target, texture, per-frame scan or production debug control. All user worktrees preserved. Local commits only; Pages unchanged.
