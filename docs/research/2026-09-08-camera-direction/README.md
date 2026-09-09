# M5-RD · The camera is the observer

Camera-direction selection handoff, 2026-09-08. This is camera research and previsualization, **not production M5**. No direction is selected automatically. The four browser studies and continuous recordings are ready for human comparison; portrait framing and abrupt-jump compromises below remain open.

## Provenance and boundaries

- Approved M4.1: `a61d79be0fab528daa11a1cf72e00d986b4a5727`.
- Rejected M5, retained only as an anti-reference: `de13db2372d0847e18cd2154095f4aade9f23c81`.
- R&D branch: `milestone-5-camera-rd`, separate worktree `/home/mani/dev/jellyfish-studio/m5-camera-rd`.
- Original worktree and its user changes to AGENTS/research are preserved.
- Three.js remains 0.175.0. Existing React/Vite and WebGPURenderer with NVIDIA WebGL2 backend remain unchanged.
- Baseline: production build passes; 57/57 existing tests pass; approved-motion and default-animal parity pass. Existing large-chunk build warning remains.
- Blender is not installed. No system packages or animation dependencies installed. A browser lab is the chosen authoring route.
- No merge, push, deployment, Pages changes, M6, or changes to approved biology/environment are authorized.

## Research before camera edits

These are primary-source lessons, not claims that an award-winning site uses an inferred algorithm. Source descriptions, actual browser observations, and our hypotheses are separated below. No reference source or copyrighted music is imported into runtime.

### Camera engineering and authoring

**[Giant Squid: Camera Control in ABZÛ](https://giantsquidstudios.com/Camera-Control-in-ABZU), Max Kaufmann.** A stable horizon and fluid predictive movement are explicit goals. Its authored/custom camera has complete control without gameplay constraints. Transitions preserve incoming motion; Hermite translation and shortest-arc quaternion interpolation require care around rotational continuity. Application: bake a complete position/orientation pose, allow one progress controller to evaluate it, and avoid independently corrected target/position channels. Reject: player-follow detectors, obstacle-avoidance solver, gameplay overrides, and shake. Pelagic is an observer, not a swimming avatar game. A spline alone does not establish visual continuity.

**[John Nesky: 50 Camera Mistakes, GDC 2014](https://www.gdcvault.com/play/1020460/50-Camera), [official GDC video](https://www.youtube.com/watch?v=C7307qRmlMI).** Studied the actual publicly embedded GDC lecture slides at 2:30, 11:00, 19:00, 29:00, 39:00 and 49:00; local evidence is `nesky-slides/`. These cover spatial judgment, line-of-sight distance, sideways occlusion response, control burden, orientation and narrow FOV. Application: preserve a stable spatial reference, test physical proximity with wider context, and avoid requiring the visitor to operate the camera. Reject importing gameplay avatar-follow/occlusion correction into an observational artwork. Narrow FOV magnifies apparent movement; this supports testing fixed lenses, not claiming one universal safe angle. Full uninterrupted talk/audio and complete transcript were NOT verified: the caption request returned empty content. Viewer-authored comment summaries are excluded as primary evidence.

**[Ryan Juckett: Damped Springs](https://www.ryanjuckett.com/damped-springs/).** The critically damped solution carries position and velocity, converges without oscillation from rest, and integrates analytically for a fixed target over a timestep. Application: one scalar progress state. Do not stack position, look target, FOV, and roll springs. Test varying frame rate with identical target-event times, not different sampled inputs; preserve momentum on reversals, and explicitly discard background pause debt. An analytic integrator does not magically eliminate differences in how input is sampled.

**Blender official [Follow Path](https://docs.blender.org/manual/en/latest/animation/constraints/relationship/follow_path.html), [Graph Editor](https://docs.blender.org/manual/en/latest/editors/graph_editor/introduction.html), [F-Curve properties/handle modes](https://docs.blender.org/manual/en/latest/editors/graph_editor/fcurves/properties.html).** Read from official HTML using ordinary network fetch after the search tool returned a fetch error. Path position and orientation are separate authoring choices. Handles control timing and tangents; continuous-acceleration handling reduces acceleration discontinuities, while auto-clamped handles restrain overshoot. Application: editable poses, explicit holds, and derivative graphs; bake before playback. Reject automatic follow-curve orientation as the sole composition decision. Do not mistake aligned handles/C1 continuity for continuous acceleration.

**Codrops: [Blender path gallery](https://tympanus.net/codrops/2026/07/07/building-a-scroll-driven-3d-gallery-using-a-blender-camera-path-with-three-js-and-gsap/).** The hand-authored path and JSON export are the useful workflow. The example's `getPoint(t)` is geometric parameterization, not proof of constant physical speed. Adapt author → export → cheap playback. Reject its looping gallery, plane-content setup, and dependency choices as unrelated to this ocean.

**Codrops: [Theatre.js camera fly-through](https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/).** Timeline authoring allows inspection of the camera in the environment before linking sequence position to scroll. Adapt pose editing and replay. Do not add Theatre, Drei, R3F, or GSAP; this is a workflow reference, not a migration proposal. Its 90° lens is not a recommendation for Pelagic.

**Three.js [r175 Curve source](https://github.com/mrdoob/three.js/blob/r175/src/extras/core/Curve.js), [CatmullRomCurve3](https://github.com/mrdoob/three.js/blob/r175/src/extras/curves/CatmullRomCurve3.js).** Installed source verified. `getPointAt` and `getTangentAt` use arc-length-to-parameter mapping. The cumulative length table is cached and requires invalidation when geometry changes. Equal travel distances do not equal equal image motion: FOV, depth, rotation and near objects govern optical flow. Use arc length as a diagnostic/authoring aid, not a rule that removes patient holds or accelerates through intimate encounters.

### Underwater cinematography

**[DivePhotoGuide: Wide-Angle Shooting Techniques](https://www.divephotoguide.com/underwater-photography-techniques/article/gopro-underwater-wide-angle-techniques/).** Stabilization, deliberate dolly/truck movement, and locked observation of active subjects matter. Busy animal motion is a reason to reduce camera motion. Physical approach changes spatial relationships; zoom is not equivalent. Application: A observes a crossing; B travels with purpose; C approaches physically while preserving surroundings. Reject copying the GoPro fisheye distortion or a literal breathing-induced bob.

**[National Geographic / Jennifer Hayes](https://www.nationalgeographic.com/photography/article/how-to-take-photos-underwater).** Wide angles place animals in context, alternate viewpoints reveal unseen behavior, and remotely placed cameras permit undisturbed encounters. Application: compose a volume animals can traverse; the camera need not chase every pulse. Reject using photographic advice as quantitative camera speed/FOV limits.

**[BBC Earth: The changing face of our frozen worlds](https://www.bbcearth.com/news/the-changing-face-of-our-frozen-worlds).** First-person production account: remote cameras and underwater rebreathers enable longer and closer observation; animal behavior remains unpredictable. Application: include meaningful stillness and test encounters at several elapsed times. [Blue Planet II ray-filming BTS](https://www.youtube.com/watch?v=GJPRW92Yqd0) is a footage reference pending accessible playback inspection; no motion claim is inferred from a title or thumbnail.

**[Disney / Avatar: The Way of Water production account](https://thewaltdisneycompany.com/news/how-avatar-the-way-of-water-revolutionizes-underwater-cinematography/).** Performance was captured in real water; virtual cameras were then used to author shots around the selected performances. Application: inspect approved animal movement first, author observational camera poses around it, and do not disguise a choreography problem with additional camera wobble. Reject blockbuster shot density, cuts, or production technology as runtime requirements.

### Human-authored real-time experiences

| Primary reference | Mechanism worth studying | What not to copy | Current evidence |
|---|---|---|---|
| [The Sea We Breathe / Unseen](https://unseen.co/projects/blue-marine-foundation/) | Distinct environments and a patient, guided dive establish scale and purpose. Lighting/textures are explicitly part of their world-building. | Educational copy, entry gate, narration, or habitat assets. Camera alone cannot manufacture unavailable geology. | Live breathing/entry gate captured; full underwater journey NOT VERIFIED. |
| [The Extraordinary Lab / GQ × AP](https://www.gq.com/sponsored/story/the-extraordinary-lab) | A persistent spatial scene can organize a technical story around an authored viewpoint. | Watch-gallery motion density, grids, text, or audio gate. | Entered live sequence captured; foreground table/objects establish spatial reference. |
| [Artisans d'Idées / Immersive Garden](https://immersive-g.com/projects/artisans-d-idees) | Author describes poetic spatial exploration, light/shadow and emerging objects. | Its objects, choreography, assets or entire visual identity. | Case study read and entered live sequence captured. |
| [Cartier Watches & Wonders / Immersive Garden](https://immersive-g.com/projects/cartier-watches-and-wonders-24) | Environments serve a consistent visual subject; scroll-linked reveals and transitions are coordinated. | Product hotspots, environment swaps, or glamour turns that obscure biology. | Primary case study read; historical 2024 journey playback not yet verified. |
| [Aurelia / Niklas Niehus](https://github.com/holtsetio/aurelia) | Procedural animal motion fills the image without a complex shot director. | Its renderer version, shaders, tissue design, or replacing approved Pelagic anatomy. | Actual live WebGPU scene captured; source confirms GPU Verlet anatomy and procedural light. |
| [Chrysaora / Aki Rodic](https://history.siggraph.org/wp-content/uploads/2022/07/2011-Realtime-Live-Rodic_Chrysaora.pdf) | Early browser simulation presents a coherent living population. | Old renderer or anatomy. | SIGGRAPH primary abstract read; historical live motion not yet verified. |
| [Particulate Medusae / Ash Weeks](https://milcktoast.com/medusae/) | One legible organism holds attention through continuous tissue deformation. | Its luminous construction lines, material, UI or color treatment. | Live motion and clear full-animal frames captured. |
| [Noomo Labs](https://noomoagency.com/work/noomo-labs-the-jellyfish) | A recognizable subject persists through scroll reveals. | Shattering sphere, customization UI, glass material or strong brand staging. | Primary case study read and entered reveal captured. |

### Audio as pacing support, never camera control

**[Austin Wintory: From JOURNEY to ERICA](https://awintory.medium.com/from-journey-to-erica-214355002896).** Journey's musical phrases anticipate approximate travel durations, but accommodate lingering and alternate choices. Individual melodic statements need not repeat with the ambient bed. More reactive scoring can be distracting rather than helpful. Application: judge silent motion first; an optional later audio experiment could change phrasing/holds, not add motion forces or make position depend on beats.

**[Mooders: Cartier Watches and Wonders](https://mooders.net/en/works/cartier-watches-and-wonders/)** describes distinct sound universes, restrained orchestral layers and fluid transitions supporting visual chapters. [Artisans credits](https://immersive-g.com/projects/artisans-d-idees) also name Mooders. Medusae credits JP Arsenault for audio. Those credits are not permission to reuse recordings. No external music is downloaded or committed; sound quality has not yet been evaluated in our candidates.

## Measurement protocol

`scripts/camera-rd-browser.mjs` records the real browser camera at each update using the actually loaded Vite module URL, including its HMR query. It does not edit the approved or rejected checkouts. It captures timestamped browser screencasts, exact camera position/quaternion/FOV, current target, directive, actor debug state and rejected-camera correction magnitudes. A missing hook fails the capture rather than silently reporting a pass.

`scripts/camera-rd-metrics.mjs` resamples simulation-time poses at 60 Hz with hemisphere-continuous quaternion interpolation. Central derivative windows span 100 ms to reduce noise from variable browser sampling. It produces six graphs, distribution summaries and subject NDC traces. These are camera diagnostics, **not GPU timings or render-completion benchmarks**. Full route and intentional reverse/jump portions must be distinguished. Actor positions from the existing debug interface are rounded to 0.01 world units; envelope distances are conservative proxies, not exact membrane collision tests.

Fresh raw evidence: `/home/mani/dev/jellyfish-studio/m5-rd-evidence/`.

Excluded runs: `baseline-desktop` used incorrect population/bubble flags. `rejected-desktop` contains valid motion but zero telemetry because its hot-reloaded module URL differed. Initial v1 recordings used a Node scroll driver that could pause while capturing screenshots. Canonical comparisons are `approved-v2`, `rejected-v2`, and `candidate-[A-D]-final`, driven inside browser rAF. `candidate-A-first` lost its hook to an authoring HMR reload after 65 seconds and is also excluded. The driver now rejects prematurely ended telemetry. Original captures remain preserved, not silently overwritten.

## Initial hypotheses (evaluated below)

1. Rejected M5 constructs gaze from a separately interpolated target. Large changes in its direction can occur even where translation looks smooth.
2. Its C1 Hermite joins do not ensure acceleration continuity.
3. `protect()` modifies both position and gaze based on living actors. Magnitude and timing must be measured before blaming this system.
4. The approved camera also tracks subjects, carries independent target/position smoothing and introduces slight drift/bank. Approval does not mean these mechanisms must survive the new direction.
5. Both foreground routes and distant motion include elapsed-time behavior. A path that only works at one timestamp is not a successful scroll experience.

## Direction experiments (not selected)

- **A · Documentary Observer:** move between patient observation locations; substantial held poses; animals cross rather than being tracked.
- **B · Neutrally Buoyant One-Take:** continuous forward/diagonal travel, broad curve, little rotation; no repeated stop/start shot sequence.
- **C · Intimate Wide-Angle Observer:** physically closer crossing, wider contextual view, near/far parallax; no zoom simulation of approach.
- **D · Deep Pelagic Descent:** greater emphasis on elevation and empty water, longest quiet intervals, late floor reveal.

Authoring and validation results follow the measured baseline audit below. None is production M5.

## Source-based failure analysis, checked against fresh telemetry

Rejected M5 is not simply “too fast.” On the forward segment its median/p95 angular speeds are **2.81 / 12.74°/s**, versus approved M4.1 **4.17 / 14.75°/s**. The more specific issue is uneven motion and competing gaze/proximity changes. The rejected path approaches the conservative bell envelope to **0.87 units** over the full stress route, compared with **2.80** for M4.1. Its correction layer can shift the camera **1.60 units** and the target **2.42 units**.

An offline counterfactual evaluates the unchanged rejected path without `protect()`, against the same recorded progress. Forward angular-acceleration p95 falls **12.54 → 5.63°/s²**; maximum translation acceleration **3.50 → 0.73 units/s²**; maximum jerk **27.71 → 6.98 units/s³**. This isolates a substantial correction contribution. It does not prove the uncorrected path is good: it has less clearance, remains a separately interpolated gaze/position path and still has C1 acceleration discontinuities. No part of that path is imported by the new runtime. `camera-rd-counterfactual.mjs` is a read-only forensic script only.

The unchanged-source fixed-step replay corroborates the forward translation jerk spike (rejected maximum **29.35**, approved **1.75**). These are derivative diagnostics, not a score or GPU timings. The large full-route maxima also include deliberately rapid reverse/jump input; they must not be presented as ordinary forward swimming behavior. Source findings: rejected `CameraJourney` independently interpolates six position/target coordinates; `protect()` changes both with actor-dependent envelopes and a projective safe region; narrow-frame track blending adds another authoring surface. Approved M4.1 instead combines subject strength/framing, two smoothed vectors, target-derived orientation, small time drift, bank and FOV changes. R&D retains neither system's runtime gaze control.

## Actual reference observations, not inferred algorithms

Entered recordings supplement the initial capture table: `ref-extraordinary-entered`, `ref-artisans-entered`, `ref-noomo-entered`, `ref-medusae`, and `ref-aurelia`. Extraordinary Lab's table edges and layered foreground objects establish spatial reference around the watch. Artisans' lit central object remains a legible anchor while surrounding atmosphere carries the reveal. Medusae fills a comparatively quiet frame with continuously changing anatomy; it does not need an ocean-wide target relay to establish life. Noomo's scroll reveal is intentionally theatrical, which is not appropriate to copy wholesale here. These observations informed the four blocking studies, not their materials or assets.

Sea We Breathe was captured through its breathing/Dive Deeper gate, but the full underwater journey was not yet inspected. Cartier's historical 2024 live journey was not verified; the primary author/sound case studies are the available evidence. Chrysaora's primary SIGGRAPH abstract is verified, not a fresh successful historical live run. BBC production writing was read; Blue Planet BTS motion remains unverified. Do not convert those access limits into claims of having watched their full experiences.

## Browser authoring and minimum playback architecture

No Blender executable was available, so the authoring tool is inside the real approved ocean. Open `http://127.0.0.1:5192/?cameraLab=1&direction=A&renderer=webgl&idle=300`. The flag opts into the approved M4 population and M3 bubble preview automatically; without it the default route is unchanged. `labUI=0` hides all inspection chrome for captures. H toggles the panel. The panel provides A–D, play/pause, replay, progress, fixed FOV, three response rates, free-camera RMB + WASD/QE, save pose, editable/reorderable pose JSON, apply, export, thirds and labelled conservative bell envelopes.

Authoring uses explicit position and pitch/yaw/roll keys, with optional saved quaternions. Per-coordinate quintics share knot velocity and zero knot acceleration; monotone tangents suppress unintended overshoot and repeated keys create genuine holds. Angles are unwrapped and baked into **1,201 hemisphere-continuous quaternion/position samples per direction**. No live target survives. Runtime is one analytic critically damped scalar and an allocation-free table sample (position lerp + quaternion slerp). Dense linear table interpolation approximates the authored C2 curves; it is not an exact symbolic C2 playback proof. Exported tracks are in `tracks/A.json` through `D.json`.

The three response controls use ω = 6, 10 and 16. They are R&D alternatives, not three stacked springs. Medium is only the initial lab setting, not a production choice. Native scrolling and the approved actor/environment progress remain unchanged. This leaves a measurable camera/world response mismatch on jumps, which is evaluated rather than concealed. The lab does not stage animals.

## Answers to the 15 research questions

1. **What made rejected M5 shaky?** Actor-dependent position/gaze corrections at close proximity, combined with acceleration discontinuities and large authored gaze sweeps. The counterfactual above isolates correction cost in motion; a slower angular average did not rescue the composition.
2. **Which channel?** A combination. Translation spikes are especially clear around protection; angular acceleration reflects changed gaze. Pacing and short-distance perspective make both perceptible. It is not defensible to blame rotation speed alone.
3. **What stays from M4.1?** Native scroll, the living scene, approved macro actor routes, interactions, stable rendering and the idea of a continuous dive. Its bob/bank/tracking/FOV machinery is not required in a new camera direction.
4. **Minimum runtime logic?** One progress state, dense pose lookup, interpolation, assignment and lifecycle reset. No actor scoring, collision force or target spring.
5. **Can baked 6DOF work?** Yes technically: all four run through the actual ocean renderer. Artistic approval still belongs to Mani; the lab is not production M5.
6. **Can it avoid live tracking?** All four already do. Animals enter and leave their frames without camera reactions. Whether a chosen flagship encounter needs narrower authoring remains a human review question.
7. **Is staging needed?** Not demonstrated for normal dives. Slow/fast/pause tests deliberately expose different elapsed-time encounters. Conservative tentacle capsules flag a very brief overlap on an immediate school jump, especially C, but a capsule is not the actual curved anatomy. No staging or reactive solver was introduced on that evidence alone.
8. **Which fixed FOV?** A tests 48°, B 53°, C 64°, D 50°. B's 53° is a restrained general-purpose candidate; C's wider lens is justified by physical proximity rather than zooming. No final lens selected.
9. **Useful roll?** None demonstrated. Authored roll is zero; tiny measured fractions of a degree come from quaternion interpolation/resampling, not procedural bank.
10. **Best depth?** D deliberately starts higher, descends farther vertically and withholds the floor-directed pitch until late. It gives up early anatomical intimacy. It cannot increase the actual seabed depth.
11. **Best anatomy?** C gives the largest readable tissue crossings; it also crops appendages more aggressively. A is the more patient whole-organism observation choice.
12. **Best population?** B's long translation reveals a field rather than a sequence of targets. Existing animals can cluster at the edges; no attempt is made to centre every organism.
13. **Does music improve judgment?** NOT TESTED. All recordings are silent. No copyrighted audio was downloaded, no autoplay or Web Audio subsystem added, and optional E was not started. Music must not be used to obscure camera problems.
14. **What cannot camera fix?** The fixed floor at y = −7.85, limited geological silhouettes, visibility/lighting depth policy, repeated environment patterns, population routes anchored to journey focus, and transient crowding. Altering those is outside M5-RD.
15. **Minimum production M5 after selection?** One selected baked asset, scalar controller, camera assignment, resize projection and lifecycle reset, with small deterministic tests. The editor, comparisons, telemetry, forensic rejected-camera import and research assets stay out of production. Production work must wait for explicit direction approval.

## Safety, repeatability and evidence limitations

All normal fixed-step trajectories retain positive conservative foreground clearance. C is closest: about **2.42 units** outside the bell proxy and **1.14 units** outside the straight maximum-length tentacle capsule in the 80-second normal replay. Other candidates have more room. The immediate school jump gives capsule minima A −0.07, B −0.22 and C −0.83 units for a fraction of a second; D remains clear. This requires rendered inspection and is not an assertion of actual mesh penetration. Proxies use approved maximum chain lengths, local −Y, 12% bell allowance, and a floor-height allowance; folded/curved appendages and scanned rocks are not exact capsule geometry.

The fixed-step CPU replays provide identical actor equations, zero pointer input and exact 60 Hz events. Browser recordings use seed 7183, six-second warm-up, identical viewport/quality/input schedules and continuous real simulation. Their initial elapsed state may differ by a small fraction of a second: they are comparable moving scenes, not pixel-identical state snapshots. The normal 80-second input contains an initial hold, 57.6-second forward dive, end hold, reverse and final settle. Real screencast timestamps preserve speed. Motion evidence is never synthesized from the saved PNGs.

Additional **fixed-state browser captures** use the existing specimen clock, seed 7183 and 1,800 fixed 1/60-second updates, ending at simulation time 30 and raw native-scroll progress 0.35. All eight foreground debug states compare exactly equal across approved M4.1, rejected M5 and A–D. See `evidence/fixed-{approved,rejected,A,B,C,D}/`. Camera pose and fixed lens intentionally differ; existing camera-dependent LOD/visibility and bubble generation can therefore differ. This is not a claim of identical pixel output or exact equality of every internal mesh buffer. The live ocean, not a substitute scene, produced the frames. At this matched moment C offers the largest crossing and also the strongest crop; D puts the featured animal outside the frame and reveals the broader water column instead.

Reviewer capability is explicit: frames and temporal contact sequences can be inspected here, and full browser motion is recorded for playback; this environment does not expose a video-playback perception tool for claiming an uninterrupted human-style real-time viewing. Do not label selected screenshots or telemetry as having watched every second. The review page provides actual continuous clips for Mani's selection.

## Performance and practical review findings

See [generated measurements](results.md) and [complete distributions/coverage](results.json). The independent 40-second full-route render-completion runs use the existing async completion probe, not an unrelated rAF timer. Both baseline repetitions and all four candidates have zero intervals above 50 ms. Baseline median/p95 is **17.8/21.7 ms**, repeated **18.1/22.4 ms**. A is **19.7/22.1**, B **14.4/25.3**, C **15.9/21.7**, D **14.7/23.2 ms**. B's tail is worse despite its lower median; A's median is worse. These are not universal performance improvements. Different viewpoints expose different transparent layers and LOD counts, with the approved quality/LOD rules unchanged. No resolution, DPR, bloom or quality reduction was used.

The playback table is **67,256 bytes per direction**. A separate warmed Node CPU microbenchmark averages about **0.00014–0.00021 ms/sample** across 100,000 samples; this is only an indication of the controller's small cost, not a browser/GPU performance claim. Whole-ocean cost remains dominated by the scene it reveals. Hardware: i5-14600K, RTX 4070, approximately 62 GiB RAM; Brave Chromium 152, actual NVIDIA WebGL2. Hardware/software full-ocean WebGPU, Safari, Firefox and physical mobile are NOT TESTED in this R&D pass. The legacy full-ocean WebGPU issue is not claimed fixed.

The browser UI test verified free movement, saving/applying edited poses, grid drawing, direction changes and export of all 1,201 poses. An actual secondary tab made the ocean document hidden; returning after five seconds preserved the held pose exactly and status stayed ready. Resizing through 820×900, 390×844 and 1280×900 changed projection aspect without changing the pose or FOV. See `lab-ui-lifecycle/checks.json` and `lifecycle.json` in raw evidence. This is a held-camera lifecycle check, not a guarantee about every in-flight background timing.

The abrupt C school jump was recorded separately as `candidate-C-school-jump/motion.mp4`. Inspected consecutive early frames show a very close appendage crossing and fast subject exit. No bell penetration or black frame is visible in those frames, but the broad capsule overlap is not dismissed as a mathematical pass. This stress behavior needs deliberate treatment after a direction is selected; no runtime safety push was added.

A targeted response experiment identifies a simpler mitigation to test before staging: the approved world still eases progress with its existing first-order 3.5 rate, while the new camera has a single critical spring. An immediate jump can let a responsive camera enter a volume before the actor route has settled. In the identical C school-jump replay, changing only the camera response from ω10 to ω6 changes the conservative tentacle clearance from **−0.83 to +0.38 units**. ω16 gives **−0.80**. Animal motion is identical in all three replays. This supports testing a patient response instead of adding tracking, moving animals, or building a collision solver; it is not proof from a formula that patient input feels best. The main A–D comparisons retain the same ω10 so response is not a hidden confounder.

Actual 20-second browser response clips supplement that replay: [patient ω6](http://127.0.0.1:5193/evidence/candidate-C-school-w6/motion.mp4), [medium ω10](http://127.0.0.1:5193/evidence/candidate-C-school-jump/motion.mp4), [responsive ω16](http://127.0.0.1:5193/evidence/candidate-C-school-w16/motion.mp4). Both added captures completed without browser exceptions. Consecutive early-frame inspection shows the patient camera spreading the initial crossing over more frames; both still leave a temporarily quiet composition after the jump. This remains an input/composition tradeoff, not a production fix. The ω6/ω16 URLs now initialize the visible response selector correctly; invalid response query values fall back to 10.

Portrait first-pass finding: using the unchanged master path/FOV can lose the opening foreground animal outside the narrow frame, then produce strong cropped anatomy during the middle crossing. That is a real compositional compromise, not a renderer failure. The comparison intentionally does not quietly replace the master with a portrait tracking camera. A final selected direction would need a fixed portrait lens/very small baked offset evaluation before production acceptance.

All four directions completed **normal 80-second, portrait 80-second, slow 120-second and rapid-jump 40-second browser recordings**, with no captured JavaScript exceptions. Rapid-input contact sequences include large near-frame appendage crossings; absence of exceptions is not cinematic approval. The browser slow test traverses the whole route over 120 seconds; the earlier CPU `slow` replay is a separate 80-second partial-progress stress profile, not an identically timed motion comparison.

## Final validation and reproducibility

- `node --test tests/*.test.mjs`: **67/67 pass**, versus 57 baseline tests. There is no generic `npm test` script; this explicitly runs the repository's existing Node tests plus the focused camera tests.
- `node scripts/check-approved-motion.mjs`: PASS, 720 frames / 24 checkpoints, exact geometry/appendage state/activation.
- `node scripts/check-default-animal.mjs`: PASS, 240 frames / eight checkpoints, exact geometry buffers/material response.
- `VITE_BASE_PATH=/pelagic-jellyfish-webgl/ VITE_OCEAN_RELEASE=milestone-2 npm run build`: PASS. Existing >500 kB chunk warning remains. Lab text/direction data are absent from generated production assets.
- Browser lab authoring/export, held-tab recovery and three resize sizes passed again after the UI-only correction.
- Local comparison reader: all **16 candidate video choices** loaded metadata, both players advanced during replay, pause worked, and matched PNGs decoded at 1280×900. Evidence: `review-reader/checks.json` and `reader.png`.
- Normal camera-core captures use `22e330c7cdc2fdfc6aee50ab393ee1684fd67967`. Subsequent runtime edits only improve control contrast and response-query/selector initialization; direction poses, interpolation and default ω10 remain unchanged. Raw metadata records target source identity separately from the diagnostic driver's revision.
- Curated PNGs, measurements, exports and this report are committed locally. Full MP4s, raw frame sequences and browser profiles remain in `/home/mani/dev/jellyfish-studio/m5-rd-evidence/`, served by the local review reader; they are not bundled into the artwork or published.

The Product Design audit workflow influenced the evidence-first comparison and the explicit separation of source facts, rendered observations and limitations. It did not introduce a new site template, generated imagery or a deployment step.

## Local review and scope of the handoff

The comparison page is served at **http://127.0.0.1:5193/**. It offers approved M4.1, rejected M5 and the four new continuous clips, plus live lab links and diagnostic plots. The real ocean lab is running on port 5192. If restarting these local-only tools: `npm run dev -- --host 0.0.0.0 --port 5192 --strictPort` and, in another terminal, `node scripts/camera-rd-review.mjs`, from this worktree. Use the installed Node 24 environment. Browser selection remains Brave; no Playwright dependency was added.

**Recommendation for human comparison:** start with B for the overall continuous dive, then C for physical intimacy. A is preferable if patient whole-animal observation matters more than continuous travel. D tests solitude/depth most directly but intentionally has a weaker early hero encounter. This is a recommendation, not a selection or merge. Do not automatically blend them into a new production camera.

Approved anatomy, swimming, materials, population/LOD, current/wakes, bubbles/refraction, seabed and idle source files are unchanged. Only `HeroScene.jsx` gains an explicit development gate and camera call switch; all camera authoring code lives under `src/scene/dev/camera/`. The production build contains neither the lab controls nor direction data. No production M5, M6, audio subsystem, environment redesign, merge, push or deployment was performed. The original rejected branch and the original worktree's user changes remain preserved.
