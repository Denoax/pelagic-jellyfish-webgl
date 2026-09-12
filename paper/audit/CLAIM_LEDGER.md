# Claim ledger

All source evidence below refers to runtime
`bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.

| ID | Candidate claim | Class | Evidence / boundary |
| --- | --- | --- | --- |
| C01 | One active renderer and ocean render | source-proven | `HeroScene`, `LiveOceanLens.render`, `IdleScreen`; distinguish auxiliary field/output passes from ocean scene renders |
| C02 | Procedural mantle and folded membranes | source-proven | `anatomy/mantle`, `LivingAppendages`, `SurfaceLod`; not scanned animal geometry |
| C03 | Persistent constrained appendages | source-proven | `simulateChains`, body transport, fixed 1/60 tissue steps; not full soft-body elasticity |
| C04 | Pulse-coupled locomotion | source-proven / physically inspired heuristic | `sampleSwimCycle`, `JellySchoolDirector`; secondary thrust is authored, not measured vortex-energy recapture |
| C05 | Shared current and localized wake | source-proven | `CurrentField`, `ConnectedOcean`, `OceanSnow`; bounded analytic field, not CFD |
| C06 | Importance-based population detail | source-proven | `Importance`, `PopulationAnimal`, `PopulationDetail`; thresholds are CSS pixels, not DPR pixels |
| C07 | Stable input-driven camera | source-proven | `JourneyController`, `CameraTrack`, `ViewController`; bounded follower, not the obsolete critically damped production spring |
| C08 | Live image-space bubble refraction | source-proven | `LiveOceanLens.opticalSample`; analytic two-interface ray, bounded lookup, shared clean color, approximate depth |
| C09 | Persistent interactive liquid clock | source-proven | `OceanIdleGlass`, `IdleDisplacement`, `LiquidChoreography`; authored implicit masses, not conservation-law fluid dynamics |
| C10 | Plausible tissue, coherent water, readable contacts | visual observation | Must be tied to named actual-runtime figures/clip IDs; approval is art direction, not psychophysical validation |
| C11 | Runtime performance | benchmark-proven for the recorded NVIDIA WebGL2 single-machine run only | Seven fresh 30-second cases, DPR 1 at 1280×900, median about 16.7 ms; one 65.3 ms stall retained. See results/benchmark.json. Not GPU timings or a cross-device guarantee. |
| C12 | Scanned basalt detail | source-proven | Sanctuary material uses scanned albedo/normal detail with authored lighting; do not label it a calibrated PBR geological reconstruction |
| C13 | Compatible across devices/backends | unsupported as a blanket claim | Distinguish tested NVIDIA WebGL2 from software/hardware WebGPU, other browsers and physical mobile |
| C14 | Novel physical solver / state of the art / first | prohibited | No such priority, physical validation or comparative study exists |
| C15 | Peer reviewed / DOI assigned / accepted | prohibited | Independent unreleased technical preprint only |
| C16 | Asset2 is final / successful GTAO | prohibited | Review-only; GTAO identity-depth result and missed metrics belong in negative-results supplement |
