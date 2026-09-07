# M3 — live ocean optical proof, working log

Scope: third September 7 proof, not full idle integration. No publication.
Approved baseline 1342d82118d8632cd429e21418832f5c908446a7, local branch
milestone-3-live-glass-proof. GitHub main/Pages still a0501c21f8c782887bf6a5e1257e955ada41b678;
successful Pages run 34133364127 and freshly loaded index-Bt9kzCir.js.
Pre-existing root AGENTS.md modification and untracked research preserved.
Exact detached baseline worktree: /tmp/pelagic-m3-approved-1342, port 5184.

Read both September 7 anchors and M1/M2 implementation reports before edits.
Fresh real Brave/NVIDIA captures preceded edits: public default opening/idle,
90-second journey, 900-square and 390×844; approved local ocean and idle too.
Evidence currently /tmp/pelagic-m3-evidence. No in-app playback tool; inspect
full-size frames and temporal sequences, with actual browser MP4s for review.

Baseline: 31/31 tests; approved-motion and default-animal exact parity pass;
Pages-profile production build passes, existing large-chunk/npm tmp warnings.
Three.js pinned 0.175.0, imperative WebGPURenderer using NVIDIA WebGL2.

## Capture-first findings

1. Approved animal/current: healthy and restrained; preserve them.
2. Existing idle: live ocean remains behind a separate transparent canvas, but
   the jellyfish is not optically bent. IdleGlassScene owns WebGLRenderer,
   two 128–256px simulation ping-pong targets and two clock CanvasTextures.
   The final GLSL receives field and clock only, never ocean scene color.
3. Portrait/journey: inherited edge framing and simpler distant animals remain;
   do not compensate with camera or population changes.

## Source truth and approach

Ocean app.update runs background/lights and renders the same real scene with
interactionMode:true. Its inherited MRT/bloom PostProcessing object is dormant.
Three r175 Renderer._getFrameBufferTarget already renders the direct ocean to
linear HDR MSAA then applies ACES/sRGB in an output quad. Thus an owned color+
depth target and combined lens/output quad replace those two active stages:
one ocean draw + one output draw, not two oceans or an extra bloom chain.
The inherited internal target may remain allocated after startup; count it
separately rather than claiming the owned target is free memory.

New pipeline uses RGBA16F color, depth texture, renderer.samples (4), exact
drawing-buffer dimensions. Scene transparencies are blended in the normal scene
order into current-frame color. Output performs ACES/sRGB once. Lens analytic
ellipsoid is world-positioned: camera rays intersect two interfaces, normals
and optical travel determine refraction. Original and refracted opaque depth
suppress foreground sampling. Current renderer/version unchanged.

Critical approximation: transparent tissue/snow do not write opaque depth.
They are present in live color but not individually reconstructable layers;
their image distance uses a bounded virtual plane. This is not full ray tracing,
offscreen reconstruction, multi-layer transparency or volumetric optics.
Inspect foreground transparency and report any unacceptable error explicitly.

Source references checked against installed r175 code: PostProcessing,
QuadMesh, Renderer output target, TextureNode backend Y handling and
perspectiveDepthToViewZ. Reference [Evan Wallace WebGL Water](https://madebyevan.com/webgl-water/)
freshly captured: moving/reflected sphere and tiled edges expose optical
causality. Adapt that observable test, not its pool assets, shader or UI.
[Official r175 postprocessing](https://github.com/mrdoob/three.js/blob/r175/examples/webgpu_postprocessing.html)
supports compatible node/output composition. No external code/assets copied.

## Staged work

- First static optical prototype actually bends the current ocean on NVIDIA
  WebGL2, no console errors. Initial edge magnification too strong; reduced
  relative optical index 1.12→1.045 and softened vanishing optical thickness.
- Hold exact t=9, compare direct/no lens, zero-strength passthrough, and lens;
  then resume the same real animal before any deformation implementation.
