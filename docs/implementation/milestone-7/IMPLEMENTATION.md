# M7 implementation notes

This is an original implementation using Pelagic's existing spring/advection
model and r175 TSL. No reference-site code, assets, fonts or UI was imported.

## Ownership and passes

App passes idle activity through a ref to the existing HeroScene. The React
idle component is now only a transparent input/semantic surface. Legacy
IdleGlassScene remains archived in source but is not imported in production.

LiveOceanLens retains its original non-idle PostProcessing graph. It owns a
second *output material*, not a renderer or ocean, for active idle. Exactly
one of those materials is drawn in a frame. The inactive graph contains no
idle field samples; inactive simulation takes no GPU steps.

Active frame:

1. Existing animals/current/environment/population update, unchanged.
2. Zero to three 60 Hz low-resolution spring/advection draws, bounded by 50 ms.
3. ONE ocean scene render to the EXISTING M3 RGBA16F/depth24 MSAA target.
4. ONE output draw: thermal/bubbles + screen-space idle glass, source always
   the clean ocean color. Existing renderer output color/tone mapping once.

The original direct-render bypass remains outside optical regions when idle is
off. No idle color feedback, screenshot capture, CPU ocean readback, extra
full-resolution color copy, new scene renderer, or changed rendering quality.
The renderer's existing internal framebuffer target must not be confused with
an added M7 target. An 8×8 temporary prewarm surface is released after compile.

## Field and optics

Two reusable canvas masks preserve Instrument Sans 600/400px typography,
1536×864 landscape or 768×1280 portrait. They store shape, not ocean imagery.
Landscape HH:MM and stacked portrait HH/MM are retained. Changed digit regions
erode the old field, temporarily gather a bead, then regrow the new field.
No simultaneous opacity blend of complete old/new digits is used.

Eight fixed-seed Gaussian masses add to the warped clock scalar. Shared
thresholding makes their boundary one implicit surface. Two approach the colon
anchors during formation. They are screen-space liquid, NOT replacements for
M3's world-space rising bubbles. No polygon reconstruction or full fluid solver.

Four neighboring samples of this thickness field yield normals. Bounded
normal/thickness displacement samples the live M3 color texture. Screen-edge
falloff and UV clamping prevent reading unavailable offscreen content.
Directional cyan-neutral specular and restrained grazing response clarify
edges; local luminance reduces highlights over bright tissue. No dispersion,
blur, opaque veil, environmental dimming, lighting/exposure or bloom changes.

Approximation: this is a screen-space optical height surface, not a volumetric
IOR ray trace. It cannot recover hidden/offscreen content or exact refracted
transparent depth. Bubble, thermal and idle effects observe the same clean
source, not physical successive refraction through each other. Idle therefore
does not perfectly relens an already-composited bubble highlight.

## Persistent deformation

Two signed, zero-centered RGBA16F targets encode RG velocity / BA displacement.
Longest edge 256; desktop 256×180, portrait 118×256. Bilinear filtering, no
mipmaps/depth. Fixed 1/60 step, at most three steps per rendered frame, modest
advection, neighbor diffusion, damped elastic return. Pointer travel injects a
localized segment splat; no direct text translation. Finite coordinates and
positive finite viewport dimensions are checked before input enters the field.

Visibility changes reset only timing debt/pointer history; hidden frames do no
simulation. Resize rebuilds mask layout and clears ONLY idle deformation.
The ocean, animal state, materials and camera controller are never reset.

## Lifecycle

0–2 s: first local lensing. Approximately 1.4–7 s: scalar clock cohesion grows
as beads approach; then calm bounded secondary movement. This is field growth,
not opacity-fading an already-finished separate canvas. Minute change lasts
2.8 s. Dismissal immediately returns input and restores site chrome; 0.85 s
erosion/thickness loss returns to the unchanged ocean. Capture-phase dismissal
consumes Enter/Escape/Space or pointer/touch down before View/animal handlers.
Pointer movement interacts without dismissing. Reduced-motion idle stays off.

During idle HeroScene skips ONLY camera progress/pose calls. The animal/world
updates continue. View, Explore, scroll controller, camera tracks and the
malformed-input guard remain intact. The same camera object is retained.

## Resource estimate

Added field targets: 256×180×8×2 = 737,280 bytes (~0.70 MiB) desktop;
118×256×8×2 = 483,328 bytes portrait. Two landscape RGBA8 clock textures:
10,616,832 bytes (~10.13 MiB), portrait 7,864,320 bytes (7.5 MiB).
These are approximate uncompressed texture payloads, not measured total GPU
memory. Driver buffers, shaders, and transient uploads are extra. Legacy idle
also had two clock masks and two simulation targets, but in a second context.

### Native handle audit, not just the Three counter

Six portrait→desktop resize pairs were instrumented at native WebGL2
create/deleteTexture, create/deleteFramebuffer and create/deleteRenderbuffer.
Baseline remained 71/4/4 in the ocean context plus 8/5/0 in the legacy idle
context. Candidate remained 75/6/4 in ONE context. No growth between cycles.
These are object counts, not GPU-byte measurements.

r175's common Textures render-target resize/disposal calls `_destroyTexture`
directly without decrementing the texture-info counter (the decrement belongs
to the texture dispose listener). The counter consequently rose 71→95 in the
baseline and 76→124 in the candidate during twelve resizes while native live
handles stayed constant. Do not interpret that counter alone as a leak or
claim the counter itself was fixed. Evidence: `resources/`.

The ordinary 20 idle cycles do not resize targets: their identities and the
reported 192 geometries / 76 textures stayed constant. Population resource
counts can vary with the scene, so the native audit isolates GPU ownership.

Disposal is idempotent and deferred across pending optical render, idle
preparation and idle simulation. Unit tests dispose during both awaited idle
operations and verify no new output or ocean draw occurs afterward.

### Observed draw structure

A 1.5-second sanctuary audit recorded 91 normal ocean + 91 output draws;
active idle recorded 90 ocean + 90 output + 89 low-resolution simulation draws.
The ocean contained roughly 181–183 draw calls in those samples, each output
and simulation draw one. These are separate diagnostic samples, not timing
benchmarks. No second full-resolution scene render appeared.

## Known review considerations

Screen-space topology is authored scalar behavior, not mass-conserving fluid.
Strong sustained pointer sweeps can make narrow folds. Minute glyph changes
prioritize no ghosting but still need a human assessment of erosion/bead/regrowth.
Clock edges intentionally remain quiet against black water. Prewarm waits until
the ocean is ready, then 2.2 seconds without scroll/pointer input and a frame
that completed in under 20 ms. It runs once inside the existing renderer's
serialized scheduler; the idle timer stays disabled until it finishes. There
is no continuous inactive simulation. Compilation is still a one-time cost,
not claimed to be zero or magically asynchronous on the GPU.

Browser validation is local Vite/Brave/NVIDIA WebGL2; a successful build is not
physical-mobile, Safari/Firefox or WebGPU compatibility validation. M8 remains
untouched. Existing stronger forced-freeze reload behavior is not repaired here.
