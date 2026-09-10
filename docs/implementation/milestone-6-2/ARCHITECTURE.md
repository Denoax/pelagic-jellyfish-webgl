# M6.2 implementation

## Geology

`geology.js` retains the Y −15 basin, X −2.4/Z −24 primary chimney, its height,
the existing shelf locations and pillow-flow layout. The basin vertices now
include a curved, recessed channel from approximately Z −12 to −46, with
smoothly tapered ends and maximum local incision 3.2 units. It is actual mesh
relief, not a color/depth decal. The three diffuse outlets and chimney foot are
outside that incision; existing attachment and vent source positions remain.

Three families of three overlapping terraces, eighteen channel-bank forms and
72 outer-bank talus pieces reuse one instanced geometry/material batch. Rubble
stays outside the negative space. Four short merged secondary spires support
the existing main landmark. Shelf cap geometry is rounded/eroded with layered
side variation instead of the previous low-sided cylinder cap. Existing large
shelf positions and scale are unchanged. The new bank form has smooth normals,
not the rejected flat-shaded triangular prototype.

The final solid-mesh clearance audit covers 184,264 triangles and 1,201 samples
per unchanged cinematic track. Minimum distances are A 12.106, B 11.619,
C 11.638 and D 11.294 units. Explore remains freecam, not collision-constrained.

## Material and local illumination

`materials.js` retains the same single scan texture, triplanar luminance sampling,
microrelief, ambient fill, pooled-light position/intensity/falloff and renderer.
Slate shoulders separate from blue-black recesses. Chimney source/height/normal
and noise masks organize pale deposits, muted ochre oxidation and cooler ridges.
Diffuse seep patches expand locally; gully bank patches carry restrained teal.
These mineral surfaces are reflected color, not broad emissive geology.

The existing pooled light also supplies an observation-only activation scalar.
Grazing surfaces pick up a faint pink/violet shift; the existing source remains
cyan, and no animal response or activation ownership changes. This is an
artistic material response, not a new physically spectral lighting model.

## Small ecological islands

`VentLife.js` creates five deterministic islands: three around existing diffuse
outlets, two sheltered channel-bank pockets. Total new instances:

- 160 small curved filaments in one batch;
- 80 tiny shell-like benthic forms in one batch;
- 40 rare cool biological light points in one batch.

Their positions are fixed and seeded. One bounded existing-current sample and
exponential smoothing drive a very small tip deformation through a TSL uniform.
No per-frame mesh/texture allocation. Invalid/large elapsed deltas are discarded;
the existing plume simulation time drives the motion. GPU resources are owned
and disposed by Sanctuary, including shared geometries exactly once.

Only tiny biological points use self-luminous color. They are an artistic
bioluminescence cue, not a claim that mineral crust or microbial mats glow.
No new global snow population or plankton simulator was added; existing M2
particulate, vent snow and diffuse discharge already provide suspension.

## Cost and preserved architecture

Five added draw batches maximum (two geology, three life), all new solid
materials opaque/depth-writing. No new transparent layers, realtime lights,
render targets, ocean renders or compositor passes. No new shader framework.
Pre-existing scene-color/depth reuse and thermal shimmer are byte unchanged.

Runtime edits are limited to `Sanctuary.js`, `geology.js`, `materials.js` and new
`VentLife.js`, all in `src/scene/sanctuary/`. M1–M5.2 animal, ocean current,
bubble/refraction, camera, View UI, scroll and idle source files are untouched.
The known cyan-loss-after-idle defect is intentionally not repaired here.
