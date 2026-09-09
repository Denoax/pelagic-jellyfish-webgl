# M5.2 — scroll repair and compact View

Status: **READY FOR VISUAL REVIEW**. Local review only. No deployment, merge, push,
M6, or changes to the animal/ocean art. This is a request for human review, not a
claim of visual approval.

## Identity and preservation

Repository: Denoax/pelagic-jellyfish-webgl. Branch: `milestone-5-view-ui-r2`.
Starting candidate: `57dbcf18a60f7fe3da0c714519a6fde3361391d0`.
Camera comparison: `e71cd6deb4d767da379f1080b93f932f7b7dfc43`.
Approved production-art reference: `a61d79be0fab528daa11a1cf72e00d986b4a5727`.
Runtime implementation: `80d9a8a` (input) and `0492e43` (menu).
The report/evidence-driver commit follows those runtime commits; use `git rev-parse HEAD` for the complete local delivery SHA.

The new worktree is `/home/mani/dev/jellyfish-studio/m5-view-ui-r2`.
The original `site` worktree's modified AGENTS.md and untracked research are untouched.
The untracked node_modules symlink is local dependency reuse, not committed.
Three.js remains 0.175.0, React 19.2.0, Vite 6.4.2; no new dependencies.

`src/scene/camera/directions.js` and `CameraTrack.js` are byte-equal to their
`src/scene/dev/camera/` counterparts at e71cd6d, as well as unchanged from 57dbcf.
SHA-256 respectively: `6d0f07a922abbc1b9a63df60763058726d8ec2dd38129423fc1dd917910039af`
and `10411613d4e35ae77884518aeb96420dd2b5d86160603463276361073f6005e1`.
No changes to HeroScene, materials, geometry, swimming, currents, wakes, bubbles,
refraction, population, seabed, idle implementation, renderer, resolution or quality policy.

## Measured diagnosis — before UI work

57dbcf used native browser scrolling → scrollY / scrollable height → a fixed-step
PD follower (omega 2.3, max speed .025 journey/s, acceleration .025 journey/s²)
→ baked camera pose. Its ordinary input target was only 100 / 5688 = .01758087.
The browser already normalized native wheel units. An original deltaMode bug was
**not** established; native input amplitude, the slow follower and authored holds were.

Classification:

- **B / D / E:** weak effective input, low speed ceiling and a full second to reach it.
- **H:** Documentary is exactly stationary over progress 0–.13; Intimate over 0–.17.
  Drift also starts with a zero-derivative baked endpoint, magnifying tiny input.
- **F, limited:** browser-native scroll easing preceded the PD follower. No additional
  temporal camera spring was found after the brief user-triggered mode transition.
- Not C: the old queue was *unbounded*, not too small. Extreme input left .7446
  progress queued after the measured window (~30 seconds at the old cap).
- Reversing still left .3958 forward progress queued, continuing at +.025/s.
- No evidence that playback state gated the ordinary-wheel test. Playback was
  nevertheless removed because it contradicts the requested production interaction.

Matched browser-injected pixel-mode input, 1280×900, DPR 1, NVIDIA WebGL2:

| Version / tuning | B opening, 100px: world displacement at ~500ms | B at .2, 100px | extreme max journey/s |
|---|---:|---:|---:|
| Rejected 57dbcf | .000054 | .06165 | .025 |
| R&D e71cd6d | .00689 | .32493 | 2.55925 |
| Trial 1: .0006 / .14 / 1.4 | .19919 | .97041 | .13999 |
| Trial 2: .00045 / .12 / 1.2 | .09296 | .74686 | .11999 |

Trial columns are sensitivity / speed / acceleration. Trial 1 was retained for a
more legible opening response without R&D's extreme-input launch. These are world
displacements, not pixels, and ~500ms samples vary by a browser frame. Both trials
settled their queues; trajectories were never retuned to improve these numbers.

Raw baseline audit caveats: early drivers left the prior case label set during a
reset. Above calculations exclude frames after last input +2200ms. The first rAF
after a native wheel event can precede native scroll delivery; its target difference
alone is not the input gain. Early trial logs retain a legacy omega-label fallback
(2.3), which is not a parameter of the new tanh follower; the driver now explicitly
distinguishes follower/responseGain. The old R&D driver also assigned an unused destination
property; R&D's actual camera/velocity, not that target property, is compared.

## Input architecture

Wheel/touch/keyboard intent → normalized CSS pixels → requested progress → **one**
velocity follower → unchanged baked track. `INPUT_SENSITIVITY=.0006` is the one
input gain. Lines multiply by 16; pages multiply by viewport height; pixel mode
passes through. Touch consumes one-finger vertical displacement, not fling inertia.
Ctrl/meta zoom, predominantly horizontal wheel, editable fields and View controls
are excluded. Cinematic keyboard scrolling does not consume Space on View buttons.

Balanced desired velocity is .14 × tanh(72 × error), with a stopping-distance
bound and acceleration limited to 1.4 journey/s². Fixed 1/240s integration keeps
ordinary frame-rate changes from changing the response. Time debt >250ms is dropped.
The other expert response presets alter convergence, not the safety ceilings.
The queue is clamped to ±.075 of actual progress when input requests a destination.
Reversing drops the old queue but brakes existing velocity rather than snapping it.
During braking, separation may briefly exceed .075 by the stopping distance
(.14²/(2×1.4)=.007); this is not an accumulating input queue.

DOM scroll is synchronized instantly to the requested position; it does not drive
a second easing loop. A full continuous recording exposed a Chromium/CDP first
wheel transaction with `cancelable=false`. It originally bypassed the new input
gain. Non-cancelable events now feed the same intent, while a 250ms document-only
reconciliation window absorbs the unavoidable native-scroll echo. A targeted unit
test exercises that echo. Subsequent cancelable events use preventDefault normally.
The failing first two recordings remain in the evidence directory, not presented
as successful runs. Pointer hit-testing alone did not consistently fix the issue.

The final uninterrupted proof records:

- Four seconds without input: progress exactly constant, organism time increasing.
- One 100px event: +.05384 progress / .17737 world displacement by ~500ms.
- Continued scrolling, then 20 × 1800px aggressive input.
- Max measured journey speed .139994/s; acceleration 1.4/s².
- Stop and settle; reverse becomes negative in 119.1ms.
- Final quiet period: progress exactly constant again.
- Equal browser-component targets .3288 for 48px, three lines and 48/height pages.

This is trusted CDP-dispatched browser wheel/touch input, **not a physical mouse or
trackpad test**. The line/page equivalence check is explicitly synthetic DOM input.
Physical wheel detents are device/OS dependent; 100px is the documented test action,
not a universal notch definition. These distinctions matter for final human review.

No autonomous playing/paused/replaying state or production methods remain. The
unused historical development CameraLab is retained as R&D history only.
No-input means no journey advance once the brief input settle completes. Explicit
mode changes retain the existing .95s pose blend; Home/End, Return to Surface and
authoring seeks are explicit navigation, not elapsed-time playback.

## View and Explore

The old expanded control was a ~714px-high tool panel. The normal replacement is
`VIEW · Drift`. Its selection menu is 188×280px desktop / 176×280px portrait, with
five simple choices plus Advanced. No default descriptions, scrubber, FOV or JSON.
It uses existing gutter/foam/bio/line tokens, IBM Plex Mono chrome, Instrument Sans
menu text and the app's focus treatment. Product Design's screenshot-first audit
guided reducing disclosure rather than decorating the rejected panel.

Every selection closes the menu and returns focus. Enter/Space open, arrow keys
navigate, Home/End select menu endpoints, Escape closes, and Tab leaves the menu.
World object, actor states, simulation time and journey progress survive switching.
The menu starts collapsed even when an older release stored expanded=true.

Fresh visitors start in **Drift**, because Documentary's opening hold cannot produce
visible travel without changing the explicitly protected trajectory. Existing
explicit saved cinematic modes remain respected. A/C authored pauses remain; they
are not controller failures or silently skipped timeline regions. A saved Explore
reload uses B as its cinematic return fallback; within a session Exit restores the
actual previously selected cinematic view and progress.

Explore closes selection, shows actual controls for four seconds, then fades them
over 700ms. Reduced-motion uses an immediate visibility change. The small question
button shows help again without opening tools. Keyboard Escape and Exit Explore
return to the last cinematic mode. Desktop: right-drag look, WASD, Q down/E up.
Portrait: touch-drag look and 44px hold-arrow buttons move forward/backward; release,
cancel, blur and lost capture clear movement. At 320px the small control row wraps.

Advanced is an explicitly opened, separately scrollable sheet. Lens/composition,
response/diagnostics and Authoring are nested. JSON is not mounted until Authoring
is opened. Fixed FOV, guides/actor envelopes, save/apply pose, JSON export (1201
samples), editable authoring progress and freecam movement tools remain available.
DEV scroll telemetry is opt-in with `scrollDebug=1`, bounded to 512 events; the
existing 10Hz summary subscription remains, not a new per-frame React update.

## Browser evidence

Root: `/home/mani/dev/jellyfish-studio/m5-view-r2-evidence/` (kept local, not published).
Each UI directory has collapsed/open/selected/Explore/help-faded/Advanced/Authoring
PNGs and an actual timestamped Brave CDP screencast encoded as VFR H.264 `motion.mp4`.

- `rejected-scroll/`, `rd-scroll/`: before UI frames, raw event/frame telemetry and motion.
- `scroll-trial1/`, `scroll-trial2/`: both measured tunings, same controlled inputs.
- `scroll-proof-verified/motion.mp4`: mandatory continuous quiet → one input →
  continued → extreme → settle → reverse → quiet proof; `trace.json` and `checks.json`.
- `desktop-verified/`: final 1280×900 menu/keyboard/mode/Explore/expert recording.
- `portrait-verified/`: final 390×844 equivalent plus touch look.
- `lifecycle-verified/`: final built production default, animal activation in cinematic and
  Explore, UI exclusion, cinematic touch travel followed by exact rest, 320px
  touch movement/cancel, idle entry/return with unchanged world identity.

Desktop/portrait review drivers also reload persisted mode, actually background
the tab, return, and resize through 820×900, 390×844 and 320×640 without horizontal
overflow or losing scene-ready state. These are browser viewport/touch emulations,
not physical phone validation. Before/after UI screenshots compare menu disclosure
at the same viewport but different journey progress and animal phases; they are
not matched optical-parity frames. Camera telemetry has controlled track/progress/input.

## Verification and local launch

```sh
cd /home/mani/dev/jellyfish-studio/m5-view-ui-r2
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build
VITE_BASE_PATH=/pelagic-jellyfish-webgl/ npm run preview -- --host 0.0.0.0 --port 5197 --strictPort
```

Review address: `http://localhost:5197/pelagic-jellyfish-webgl/`.
DEV diagnostics: `npm run dev -- --host 0.0.0.0 --port 5196 --strictPort`, then
`http://localhost:5196/?renderer=webgl&idle=300&scrollDebug=1`.
Do not use `specimen=1`: that deliberately bypasses the public camera controller.

Baseline: 73 tests passed. Candidate: 76 tests passed, zero skipped. Production
build passes including packaging; existing >500kB chunk warning remains. No general
`npm test` script exists: the full existing suite was invoked via node --test.
Approved-motion check: 720 frames /24 checkpoints, byte-equal geometry, exact
appendage state, equal activation. Default-animal check: 240 frames /8 checkpoints,
byte-equal geometry and equal material response. Source hashes above additionally
protect the actual R&D trajectories. Both checks' historical baseline SHAs are
reported by their scripts; they are not falsely described as full screenshot parity.

## Recording-free performance

Intel i5-14600K, NVIDIA RTX4070; actual ANGLE/OpenGL WebGL2, Brave Chromium152.
Both runs: fresh browser, seeded randomness, Drift opening at progress 0,
1280×900 viewport and drawing buffer, DPR 1, same production-direct bloom-off
path, same population configuration. DEV inspection disables adaptive resolution
in both; buffers and DPR verified unchanged at start and end. Six seconds warm-up,
30 seconds measurement. No recording, screenshot capture, build or competing
evidence browser during measurement. One matched async ocean callback each.

| Version | Median | p95 | Maximum | >50ms intervals | samples |
|---|---:|---:|---:|---:|---:|
| 57dbcf baseline | 16.7ms | 17.6ms | 82.9ms | 1 | 1798 |
| 0492e43 candidate | 16.7ms | 17.6ms | 24.9ms | 0 | 1801 |

These are **async render-completion frame intervals, not GPU timings**. Use the
`auditRender.intervals` field of `perf-57-opening/performance.json` and
`perf-r2-opening/performance.json`, not the independent rAF interval field.
No material steady-state regression is visible in this run. The baseline's single
82.9ms outlier was not causally isolated, so this is not a claim that View fixed a
renderer/GC stall. Startup population warm-up was 69.0 vs72.6ms, outside the measured
windows. Exact organism phase differs by ~.15s after wall-clock warm-up; this is not
a deterministic pulse-phase benchmark. It is not the full M4.1 five-scene suite.

Added render passes: **zero**. Dependencies: **zero**. No quality/DPR/resolution
reduction. Input work is scalar arithmetic; active UI retains the prior sampled
10Hz subscription. Interaction captures verify behavior, not GPU performance.

## Runtime files changed

- `src/scene/camera/JourneyController.js`: normalized intent and one bounded follower.
- `src/scene/camera/ViewController.js`: wheel/touch/key ownership, native echo handling,
  production playback removal, queue synchronization and optional diagnostics.
- `src/scene/camera/viewPreferences.js`: fresh default B, same validated persistence.
- `src/ui/ViewMenu.jsx`: compact menu, focus/auto-close, fading Explore help and nested tools.
- `src/ui/view-menu.css`: existing-token compact styling and responsive disclosure.

Other changes are the standing AGENTS boundary, two focused test files, five local
Brave evidence drivers and this report. There are no other runtime file changes.

## References actually used

- [MDN deltaMode](https://developer.mozilla.org/en-US/docs/Web/API/WheelEvent/deltaMode): explicit wheel unit handling.
- [Lenis virtual-scroll source](https://raw.githubusercontent.com/darkroomengineering/lenis/main/packages/core/src/virtual-scroll.ts) and [target/animated scroll ownership](https://raw.githubusercontent.com/darkroomengineering/lenis/main/packages/core/src/lenis.ts): separate input intent from rendered travel; no dependency imported.
- [GSAP scrub documentation](https://gsap.com/docs/v3/Plugins/ScrollTrigger/): input-owned progress and catch-up, not autonomous playback.
- [Ryan Juckett's damped springs](https://www.ryanjuckett.com/damped-springs/): position/velocity continuity; no stacked corrective springs.
- [Camera Control in ABZÛ](https://giantsquidstudios.com/Camera-Control-in-ABZU): preserve authored camera character rather than dominate it with correction.
- [WAI menu button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/) and [menu behavior](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/): keyboard, selection, closing and focus.

## Limits and review gate

Physical wheel, physical high-resolution trackpad, phone hardware, screen-reader
output and WebGPU were NOT TESTED. Actual exercised GPU path is NVIDIA RTX4070
WebGL2 via ANGLE/OpenGL in Brave Chromium152; no software GPU is mislabelled as hardware.
Documentary/Intimate intentional holds and current portrait camera framing remain.
The speed cap is in journey units, not constant world meters/second along unequal
tracks. Native scrollbar dragging receives the same bounded destination clamp.
The non-cancelable-wheel reconciliation is local to document scrolling, but physical
devices should still be reviewed for unusual OS momentum sequences.
No M1–M4.1 visual source changed. Live Pages and all remote branches remain untouched.
No later milestone began. The menu's aesthetic and actual-device feel remain the
user's decision; automated checks do not constitute visual approval.
