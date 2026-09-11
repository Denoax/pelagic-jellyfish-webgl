# Stale-documentation audit

Runtime authority: `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.
Historical milestone reports remain historical; their local review links and
partial statuses are not carried into the portable publication bundles.

| Existing statement | Source truth / publication correction |
| --- | --- |
| README: separate transparent idle renderer | `IdleScreen.jsx` is semantic/input presentation; `HeroScene` attaches `OceanIdleGlass` to the existing compositor. One renderer/context. |
| README: glass cannot refract the actual ocean | M7 samples current `LiveOceanLens.target.texture`; optical deformation is live, but image-space and not multilayer physical transport. |
| README: independent position/target camera damping | Production `ViewController` uses `JourneyController` and baked `TrackPlayer` poses. Legacy `PelagicCameraRig` remains for old development paths. |
| README: direct render path exclusively | Direct outside optical activity; one scene target and output pass when bubbles, thermal shimmer or idle are visible. Bloom stays off. |
| README: React Three Fiber architecture | Installed but not the active scene ownership model. React plus imperative Three.js/TSL is accurate. |
| README: GLSL liquid / packed RGBA8 fallback | Legacy only. Approved M7 uses TSL and signed RGBA16F paired targets; do not claim a tested M7 packed fallback. |
| README: eight foreground animals plus separate visual school | Production population adapter gives both route sources the same approved animal implementation and projected-size detail policy. |
| README: current gallery and GIFs | Earlier work; replace primary images with exact-publication-runtime captures. Retain selected early stages only as labeled history. |
| README: no project-wide license | User resolved MIT original code / CC BY 4.0 original publication/media; exceptions retain their notices. |
| Provenance: coral used on living seabed | Assets remain in repository, but approved deep sanctuary uses basalt/scanned geology, not those coral GLBs. Distinguish shipped archive from rendered content. |
| Provenance: original liquid is `IdleGlassScene.jsx` | Attribute the current `glass/` implementation separately; retain legacy provenance without calling it active. |
| Parent research: service-selling site, CTAs, stock hero | Superseded by the text-free artwork and this publication strategy; not a current implementation specification. |
| M7/M7.1 reports say PARTIAL | Correct historical status at those commits. The pack explicitly approves later M7.2 runtime bce3571. Do not rewrite history as if the earlier candidate passed. |

`docs/CURRENT_ARCHITECTURE.md` does not exist in the approved checkout. No
missing architecture file is invented or described as audited.

