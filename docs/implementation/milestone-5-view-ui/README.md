# M5 — Native View controls

Local review candidate, 2026-09-09. No publishing authorization.

## Baseline and scope

- Repository: `Denoax/pelagic-jellyfish-webgl`.
- Feature basis: `e71cd6deb4d767da379f1080b93f932f7b7dfc43`.
- Approved biological/environmental baseline: M4.1 `a61d79be0fab528daa11a1cf72e00d986b4a5727`.
- New worktree: `/home/mani/dev/jellyfish-studio/m5-view-ui`.
- New branch: `milestone-5-view-ui`.
- The original `site` worktree, its modified instructions and untracked research are preserved. The R&D worktree remains available. No reset, stash, clean, merge, push, dependency upgrade or deployment.

This integrates the authorized multi-camera feature into the local application's default UI, including its approved M4 population/M3 bubbles/M2 environment. It does **not** claim the local default UI is unchanged: changing that UI is the assignment. Public Pages is unchanged.

## Design audit and instruction sources

Read the actual ancestor `AGENTS.md`, project `AGENTS.md`, project `RESEARCH.md`, active `src/App.jsx`, `src/styles.css`, current idle UI and the R&D camera panel. Inspected `src/ui/Header.jsx` and deliberately did not reuse it: it is an unused earlier service-site header, not the current artwork.

No project-local lowercase `agent.md` or `skill.md` exists. The actual `AGENTS.md` is authoritative. The advertised Product Design 0.1.53 skill paths were missing; the installed 0.1.54 index, audit, get-context, user-context and required references were read instead. Its screenshot-first audit and existing-component-first rules informed this integration. No new site scaffold, image generation or external design system was introduced.

The existing system supplies Instrument Sans control text, Cormorant Garamond display type, IBM Plex Mono instrumentation, near-black water, foam text, muted cyan, thin borders, existing gutter/easing/focus tokens. The new panel uses these directly: restrained 2–3px corners, no backdrop blur, quiet thin dividers, 44px primary targets, a light Play button and secondary outline Replay. Fresh old/new desktop and portrait screenshots were inspected together. The old screenshots and new UI screenshots compare layout at matching viewport sizes, **not** identical animal poses or simulation phases.

### Information architecture

| Earlier R&D surface | New View surface |
| --- | --- |
| Permanently visible debug panel and raw A/B/C/D | Small collapsed `View · Documentary` trigger; human names |
| Playback, freecam, overlays, FOV and JSON mixed together | Perspective → playback → collapsed Advanced |
| Raw JSON visible immediately | JSON only inside Advanced / Pose tools |
| Small inline controls; identity overlap on portrait | Clear groups, touch-sized primary controls, viewport-bounded scrolling panel below identity |
| Camera selection resets path and scroll | Same world, time and progress; short pose transition |

Public modes: **Documentary, Drift, Intimate, Deep, Explore**. Each has a short description; portrait shows the selected description to reduce density. The trigger indicates the current mode. Play/Pause, Replay and a destination scrubber sit below the mode list. The percentage is actual reached progress; the scrubber is requested destination. Help explicitly explains the difference.

Advanced remains available in production, collapsed by default. It contains Cinematic/Balanced/Responsive response presets, fixed FOV, thirds/actor-envelope guides, Save pose, Apply edits, editable JSON, validation feedback and JSON export. `?expert=1` expands Advanced when the menu is opened; it does not force the panel over the artwork.

Explore is a genuine camera mode, not a second renderer: RMB/touch drag to look, WASD movement, Q down/E up, six holdable buttons for touch and keyboard. Help appears only in Explore. Returning to a named view rejoins the same journey. Existing left-click animal activation remains available; menu interactions are excluded from ocean pointer effects.

## Architecture

- `src/scene/camera/CameraTrack.js` and `directions.js`: moved, byte-unchanged R&D bake/playback and four authored directions. Thin re-exports preserve the old DEV import paths.
- `JourneyController.js`: one fixed-step, bounded destination follower. Maximum normalized journey speed **0.025/s** and acceleration **0.025/s²**, with 1/240s integration. Responsive changes ease-in, never the cap. Aggressive native scroll changes a destination, not immediate camera speed. Reversal obeys the same acceleration limit. Background debt is dropped.
- `ViewController.js`: observes the existing camera and director. Four paths are baked once. No animal, environment, simulation time, renderer or resolution mutation. Mode changes snapshot the actual pose and use a 0.95s quintic blend, maintaining current progress. Repeated switches begin from the actual current pose. The controller owns input cleanup, validation and authoring, not React.
- `ViewMenu.jsx` / `view-menu.css`: React UI, native radio/fieldset/details controls, non-modal disclosure, outside click/Escape close, focus return, native keyboard navigation, safe storage, session drafts and revocable export URLs. Controller state is published approximately 10Hz, not once per rendered frame. Guides draw only when requested.
- `App.jsx` / `HeroScene.jsx`: connect the controller without remounting the ocean. The bounded progress reaches the existing director/environment before camera playback. Explore allows canvas input through the otherwise invisible scroll layer. UI-originating pointer motion/clicks do not activate or stir animals. Idle hides View without replacing the idle implementation.

This bounds **journey parameter** speed, not constant world-space metres/second; the approved tracks intentionally include different distances and holds. There is no live animal tracking, new correction spring, procedural bob, roll or camera-path redesign.

## Validation and evidence

Evidence root: `/home/mani/dev/jellyfish-studio/m5-view-evidence/`.

- Before: `/home/mani/dev/jellyfish-studio/m5-rd-evidence/view-ui-before-desktop/phase-3.png` and `view-ui-before-portrait/phase-3.png`, with browser clips in those directories.
- Desktop: `desktop-final/01-default.png`, `02-view-menu.png`, `04-advanced.png`, `06-explore.png`, `08-keyboard-focus.png`, `motion.mp4`, `checks.json`, `journey-trace.json`.
- Portrait: `portrait-pass2/` with the same files and actual touch-look checks.
- Narrow: `narrow-final/` with the same interaction suite.
- Production/lifecycle: `lifecycle/`, recorded by `scripts/view-lifecycle-evidence.mjs`.

Motion is actual Brave browser screencast, encoded from timestamped JPEG frames to variable-frame-rate H.264. Capture overhead is **not** a frame-time benchmark. Earlier failed diagnostic passes are retained, not presented as passing evidence. One real Explore input bug was found and fixed: invisible scroll chapters intercepted right-drag. Other initial failures were CDP key/reload/viewport-click assumptions, corrected in the evidence driver.

`scripts/view-ui-evidence.mjs` covers default disclosure, native Enter/Escape/Tab, play/pause/replay, aggressive destination input, FOV editing, guides, free movement/look, save/apply/export, malformed JSON, rapid switches with identical world/actors/time/immediate pose, persisted mode/open state, actual tab hiding/return and horizontal overflow. Portrait adds touch look. `scripts/view-lifecycle-evidence.mjs` exercises the built production bundle, native response selection/storage, activation in normal and Explore, touch movement/cancel, live resize and actual idle entry/return.

Run verification with the existing Node 24 toolchain:

```sh
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
```

73 tests pass. Approved-motion parity: 720 frames / 24 checkpoints, geometry byte-equal, appendages exact and activation equal. Default-animal parity: 240 frames / eight checkpoints, geometry byte-equal and material response equal. Production build passes, including Sites packaging; the existing large-chunk warning remains. The historical M3 source lock was updated to allow only the exact new App View integration lines and the explicitly authorized public bubble selection; all other protected source assertions remain.

The very first fresh-worktree test run lacked a built `dist` for the existing packaging test. Building resolved that prerequisite; it was not counted as a pass. The obsolete whole-App lock was a real expected integration-test failure and was revised explicitly, not suppressed.

## Limits and review notes

- An expanded mobile panel necessarily covers much of the ocean; default collapse keeps the artwork dominant. Advanced scrolls within that panel.
- Replay returns at the bounded pace before beginning again; returning from the bottom can take roughly 40 seconds plus easing. It does not teleport the camera or restart animals.
- Mode/open/response persist. Camera position, JSON edits and guide state do not survive reload; export preserves authoring work. Applied edits and drafts survive ordinary mode switches in the current session.
- Free camera has no collision or world-boundary constraint. It can intentionally leave the authored framing; this is expert exploration, not a new journey.
- Browser emulation is not physical mobile validation. Screen-reader testing and hardware/software WebGPU are not claimed. The known legacy full-ocean WebGPU issue is untouched. Real tested path is Brave/Chromium 152, NVIDIA RTX 4070 ANGLE OpenGL ES, WebGL2.
- Animal, population/LOD, current/wake, refraction/bubble, seabed and idle implementations are byte-unchanged from the R&D feature basis, which retains approved M1–M4.1. View switching is tested not to reset simulation. Camera framing and bounded travel are intentionally the authorized M5 changes.
- Nothing pushed, merged, deployed or modified on Pages. No M6 or later milestone started.

Local running previews: development `http://127.0.0.1:5194/`; production build `http://127.0.0.1:5195/pelagic-jellyfish-webgl/`. The final validation addendum records lifecycle results, separate performance sanity measurements and commit identities.

## Final validation addendum

**Status: READY FOR VISUAL REVIEW.** Human approval remains outstanding.

Implementation commits:

- `f8e1aed`: shared camera modules, bounded journey controller, preferences and focused tests.
- `30e959b7b883df4153fae2d23f2804343fe07a8e`: native View UI and production integration. This is the runtime revision exercised; the following evidence/report commit changes no runtime files. `git rev-parse milestone-5-view-ui` identifies the final handoff revision.

Full desktop 1280×900, narrow 820×900 and portrait 390×844 browser suites **PASS**. Production bundle has **no DEV camera or specimen object**. Normal and Explore animal activation **PASS**; UI does not activate the ocean. Keyboard-selected response persists. Actual touch hold moves the camera and cancellation stops it. Live resize 1280→820→390→320→1280 preserves world identity, correct drawing-buffer size, on-screen panel bounds and no horizontal overflow. Actual idle entry hides View; Enter returns to the same live world and visible menu. Real background-tab recovery passes in all three layout suites. No JavaScript exceptions were recorded in successful runs.

The first production preview command omitted `VITE_BASE_PATH`; its prefixed JavaScript requests received the preview server's HTML fallback. This was a **local preview configuration failure**, not an application regression. Restarting preview with the same base as the build resolved it. Its old `lifecycle/failure.json` is retained alongside the later successful `checks.json` for transparency.

Exact local preview command (already running):

```sh
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run preview -- --host 0.0.0.0 --port 5195 --strictPort
```

### Capture-free performance sanity check

One 30-second ordinary opening observation per revision, after six seconds of warm-up, A/Documentary at progress 0 with no scroll; ocean continues swimming. Same deterministic random seed, 1280×900 viewport and drawing buffer, DPR 1 before/after, NVIDIA RTX 4070 WebGL2/ANGLE, Brave/Chromium 152. Existing DEV specimen facility disables adaptive quality in both runs; normal production bloom remains off in both. Old debug panel hidden, new menu collapsed. No screenshot, screencast or profiler during measurement.

The existing probe observes completion of the actual asynchronous ocean render callback, not an independent display rAF. These are **render-completion intervals, not GPU timings**.

| Opening observation | Samples | Median | p95 | Maximum | >50ms |
| --- | ---: | ---: | ---: | ---: | ---: |
| R&D `e71cd6d` | 1802 | 16.7ms | 18.5ms | 26.7ms | 0 |
| Native View `30e959b` | 1801 | 16.7ms | 18.4ms | 26.0ms | 0 |

Raw files: `perf-rd-opening/performance.json` and `perf-view-opening/performance.json` under the evidence root. Both detected exactly one ocean callback; no errors. This does not demonstrate a speedup or replace a full M4.1 benchmark matrix. The small differences are ordinary run variation. Warm-up metadata separately recorded approximately 121ms vs 1692ms in the population's pre-render warm-up step; that initialization variability was **outside** these steady-state windows and was not isolated or attributed to the View code. No claim of startup parity or GPU improvement is made. Interactive screen captures are functional evidence, not comparable performance runs.

### Files in this pass

Runtime: `src/App.jsx`, `src/scene/HeroScene.jsx`, `src/scene/camera/{CameraTrack,JourneyController,ViewController,directions,viewPreferences}.js`, the two `src/scene/dev/camera/` re-export shims, `src/ui/ViewMenu.jsx`, `src/ui/view-menu.css`.

Support: `AGENTS.md`, `tests/bubble-passage.test.mjs`, `tests/view-controller.test.mjs`, `tests/view-journey.test.mjs`, `scripts/view-ui-evidence.mjs`, `scripts/view-lifecycle-evidence.mjs`, and this report. `CameraTrack.js` and `directions.js` retain their exact former content at the new shared location. No package/lockfile changes.

M1–M4.1 implementation/source parity is preserved. No changes to animal geometry/material/motion, current/wake, population/LOD, bubbles/refraction, seabed, idle, renderer family, Three.js version, DPR or quality settings. No push, merge, deployment, Pages change or M6 work.
