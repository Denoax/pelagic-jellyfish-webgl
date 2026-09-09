# M6.1 sanctuary refinement

## Plume

The accepted M6 simulation remains fixed-step, bounded and preallocated.
768 advected carrier packets each present 16 static seeded micrograins: **12,288
mineral instances, one instanced draw**. The other existing batch now has 16
sparse particles at the third diffuse outlet plus 80 local entrained snow particles.
The first two diffuse outlets are clear refractive seeps, not smoke emitters.
No per-frame geometry,
material, texture or simulation allocation. Attribute buffers are expanded once
per update for portable instancing (no WebGL-only instance-divisor dependency).

Grain diameter is 0.018–0.058 world units with a cubic distribution favouring the
small end; it is independent of packet spread. A narrow source accelerates
upward, then packet width grows nonlinearly with height. Coherent world-space
eddies replace independent smoke phases. Existing low-passed M2 flow and
integrated velocity history progressively dominate above the outlet; lifecycle
opacity removes dispersed packets. Normal alpha blending, no additive emission.
The plume is intentionally charcoal, with only faint pooled animal scattering.

A browser diagnostic identified another legibility problem: the custom quad
vertex path was fogging at the ordinary quad-origin position. The mineral batch
now evaluates the **existing water radiance/extinction law** at each grain's
actual world position. No water shader or global brightness was changed.

`plume-gate` was inspected before mineral material changes. Initial failed
experiments (`plume-grains`, `plume-dense`) remain recorded; they are not presented
as successful results.

## Thermal optics

Three bounded analytic world-space regions: main outlet and two existing diffuse
outlets. Smooth vertically advected density cells, sheared by a bounded low-passed
sample of the same local current, alter the live sample
coordinates with a soft, quickly decaying spatial envelope. Opaque depth masks
occluded regions. The shader does not add glow, white opacity, blur or static
imagery. It refracts the **current ocean color**, including live particulate and
transparent animals contained in that color image.

`ThermalShimmer` owns uniforms and reusable CPU matrices/frustum only. It has no
scene, renderer, render target, mesh or event listeners. `LiveOceanLens` attaches
its node to the **same existing M3 output**, using the same RGBA16F scene-color
and depth24 target at the full drawing-buffer resolution, with unchanged MSAA.
One ocean render, followed by the existing optical/output draw. No second ocean
render, duplicate scene, new target, new post-processing object or feedback.

Important cost distinction: M6 bypassed M3 capture/output when no hero bubble was
active. A visible thermal region now keeps that existing path live. This means
**one additional output draw in those frames**, not zero extra GPU work. Outside
both bubbles and thermal regions, the original direct-render bypass remains.
The approved bubble `opticalSample` function is byte-identical; bubble animation,
placement and lifecycle are unchanged.

Approximation: depth represents opaque geology, not separate translucent depths.
Transparent layers already flattened into scene color cannot be perfectly sorted
relative to the density volume. Overlapping hero-bubble and vent optics sample
the same original color independently, not nested physical multi-volume optics.
Screen-space sampling cannot recover off-screen objects. This is a restrained
local density-gradient approximation, not fluid simulation or spectral optics.

## Geology

Large spatial zones are driven by outlet distance, height and orientation.
Pale crust is restrained to upper active shoulders and cavity/downward-facing
proxies near the outlet; desaturated oxidation is limited to older exposed areas.
Lower body remains dark sulfide. Meso variation breaks deposits, not the entire
palette. Micro relief uses luminance from a valid region of the **existing CC0
Poly Haven Rock 07 scan**, triplanar mirrored sampling, recolored completely.
The atlas's stretched empty padding is not repeated across the chimney. Scan
luminance is an artistic microheight proxy, not measured sulfide displacement.
No new asset downloaded or purchased. One shared texture is loaded before
prewarm and used by all geological materials.

The repeated ring cadence was broken with a smoothly varying phase/frequency.
Attached accretions use the same radial profile and sit more deeply in the host
surface. Triangle counts and overall monumental dimensions remain unchanged.

One world-space change: main complex **X −4.6 → −2.4**, Z −24 and height 12
unchanged. Outlet, diffuse sources and their local deposits follow that same
world definition. No viewport-specific environment, camera, FOV or scroll change.
The basin remains **Y −15**. All five basalt shelves are unchanged. Offline
nearest-triangle clearance against 101,920 triangles at 1,201 samples of each
approved track remains >11 units; see external `clearance.json`.

The existing single pooled animal light, ownership hysteresis, activation gain
and attenuation are unchanged. The mineral surface falls into darkness without
a nearby animal; no new ROV light, sun, orange glow or global illumination boost.

## Scope and known defect

No M1–M5.2 animal/current/population/camera/View/scroll/idle implementation was
redesigned. M3 compositor extension is explicitly authorized for this milestone.
The pre-existing cyan-tissue disappearance after idle return remains out of scope
and unmodified. All work is local: no push, merge, deployment, Pages or M7.
