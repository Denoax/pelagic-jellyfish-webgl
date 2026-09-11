# Equation/source map

All locations refer to the immutable runtime
`bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`, not the evolving documentation HEAD.
Source truth wins over illustrative equations: the production journey follower
is a bounded velocity controller. The idle normal uses an unnormalized finite
difference scaled by 16, not a calibrated spatial derivative.

CE = CODE-EQUIVALENT subexpression; CA = CONTINUOUS ABSTRACTION;
AH = ART-DIRECTION HEURISTIC. CE does not imply physical correctness.

| Equation | Source path, function, lines | Space | Class / omitted context |
| --- | --- | --- | --- |
| 1 | `src/scene/anatomy/mantle.js`, `mantlePoint`, 4–14 | animal local | CE; shape parameters supplied by pulse state |
| 2 | same, `membraneSection`, 17–29 | transverse membrane section | CE width and folded profile; transported along constrained spine |
| 3 | `src/scene/jellyMotion.js`, `sampleSwimCycle`, 22–58 | phase | CE bell envelope |
| 4 | same, `pulseWindow`, 10–14; `sampleSwimCycle`, 42–46 | phase | CE thrust windows, not force measurements |
| 5 | `src/scene/JellySchoolDirector.js`, `update`, 246–275 | world | CE velocity core; surrounding steering/separation described in prose |
| 6 | same, `update`, 209–225 | world desired positions | CE pairwise route correction; not collision resolution |
| 7 | `src/scene/LivingAppendages.js`, `simulateChains`, 888–945 | animal-local, transported history | CE prediction plus named increment; does not substitute physical acceleration for frame-scaled terms |
| 8 | same, 930–948; `anatomy/mantle.js`, `separateOralSpines`, 35–54 | animal-local | CE weighted length projection; oral contact described separately |
| 9 | `src/scene/materials/JellyTissue.js`, `createJellyTissue`, 17–39 | UV/view normal | CE bell absorption/opacity core; artistic optical depth |
| 10 | `src/scene/ocean/CurrentField.js`, `ambient`, 17–25 | world | CE analytic ambient field |
| 11 | same, `sample`, 64–79 | world around event | CE local wake; not globally divergence-free after envelope/cap |
| 12 | `src/scene/population/Importance.js`, `projectedDiameter`, 4–10; `DetailState.update`, 21–30 | CSS pixels / tier | CE projection and continuous detail; thresholds in Table 2 |
| 13 | `src/scene/camera/JourneyController.js`, `update`, 35–58 | journey progress | CE bounded fixed-step follower |
| 14 | `src/scene/camera/CameraTrack.js`, `bakeTrack`, 31–47 | world position / Euler authoring | CE quintic; runtime quaternion interpolation described separately |
| 15 | `src/scene/glass/LiveOceanLens.js`, `opticalSample`, 171–201 | lens local / metric view | CE ray–ellipsoid entry and normals |
| 16 | same, 201–259 | metric view → screen UV | CE exit/background projection; bounded virtual plane and lookup cap are explicit approximations |
| 17 | `src/scene/sanctuary/VentDynamics.js`, `step`, 46–69 | world | CE selected filtered-current/velocity update; plume is AH physically |
| 18 | `src/scene/glass/OceanIdleGlass.js`, `sample.field`, 114–164 | aspect-corrected screen UV | CA additive topology summary; full glyph mapping and conditionals stay in source |
| 19 | same, `sample`, 166–179 | screen UV | CE finite difference, normal and lookup displacement |
| 20 | `src/scene/glass/IdleDisplacement.js`, `shader`, 22–38 | screen UV | CE spring/advection step, boundary/event operations stated |
| 21 | `src/scene/glass/LiquidChoreography.js`, `entryDrop`, 40–60; `exitDrop`, 63–77 | viewport-height lengths | CE selected mass/radius/choreography relationships; not conservation law |
| 22 | `src/scene/glass/IdleLiquidState.js`, `advance`, 21–31 | seconds | CE bounded accumulator; not general behavior of every subsystem |

Each row can be inspected at the repository URL using
`blob/bce3571b0300ecfe5dc6e5dd45f28a9cda57006e/<path>#L<start>-L<end>`.
The runtime source manifest and publication validator check that these files
remain byte-identical. Line ranges intentionally include the enclosing logic
where an isolated equation would hide an important clamp or exceptional path.
