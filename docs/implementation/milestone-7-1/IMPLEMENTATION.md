# M7.1 — liquid choreography implementation

## What changed

The old clock-wide thickness ramp is replaced by an arrival field derived from
two actual stroke anchors per glyph. A tiny 192×192 CPU copy of our typography
mask locates those anchors when the time or layout changes. It never reads the
ocean or a GPU image. Two overlapping distance fronts have different fixed
arrival times; the colon has one continuous local timing domain. Most of the
clock becomes readable in roughly three seconds, with the last local regions
settling by four seconds. Font, font size and the final optical equation are
unchanged. Tabular **positions**, not distorted glyph shapes, reserve enough
space for narrow-to-wide digit changes without moving neighboring digits.

Eight existing slots now carry finite feeding masses. Their target is a real
stroke anchor. Approach speed and offset vary deterministically. The facing
profile extends before contact, an implicit capsule neck grows over multiple
frames, and the bead's squared radius decreases as its transfer fraction rises.
It leaves no permanent independent circle. Contact starts a small finite
compression/release response and a localized impulse in the existing field.

This is an art-directed **perceptual** mass allocation, not a conserved liquid
volume integral. The rest of the glyph condenses from a thin-film reservoir.
The director's transferred fraction and remaining fraction sum to one, but
the displayed clock area is not numerically integrated or forced to equal the
source-drop area. Do not describe it as incompressible fluid simulation.

Minute changes operate only on changed cells. Two local reservoirs are derived
from old/new anchors; a continuous spatial warp retracts old strokes toward
them, they migrate, and new strokes reconnect. The old/new glyph selection
occurs only after the old contribution has eroded into those reservoirs.
There is no alpha blend of two readable full numerals. Independent r175 texture
Sources are necessary here; clone() shared one underlying canvas previously.
The persistent displacement adds a restrained event response to changing cells.

On dismissal, cells thin spatially while attached beads pull away. The neck
narrows over ~0.36 s, breaks, and receives a small recoil. Optical strength is
held for the initial pinch instead of fading away before it can be seen; the
last remnants then clear by 0.85 s. Input is still consumed immediately by the
unchanged capture-phase dismissal handler. No camera/world reset occurs.

## Architecture and bounds

- Original main WebGPURenderer, actual validated WebGL2 backend, Three 0.175.0.
- One ocean scene render. Existing clean M3 color/depth and output compositor.
- Same two low-resolution RGBA16F persistent state targets: 256×180 at
  1280×900; 118×256 at 390×844. Same fixed 60 Hz, maximum three substeps,
  50 ms time cap and bounded displacement. Original pointer injection retained.
- Same two logical clock textures (1536×864 landscape / 768×1280 portrait),
  now with independent CPU canvas Sources. No new full-resolution ocean copy.
- Eight event slots in a preallocated typed ring; input amplitudes clamped.
  Two small uniform arrays pack the eight bead and neck parameters. No per-frame
  geometry creation, global physics, ambient sine wobble or droplet-count increase.
- A named TSL field function and bounded uniform-array loop reduce repeated
  shader construction. See SCHEDULING.md for the separately committed narrow
  asynchronous-linking fix and cleanup guarantees.

The original persistent field remains an elastic/advection approximation, not
Navier–Stokes. Neck geometry is a scalar-field union, not a mesh intersection.
All refracted color still comes from the live ocean target. IOR/refraction
strength, gradient step, normal scaling, highlights, edge response, adaptation,
ocean lighting and bloom were not retuned to make the motion more obvious.

## Locked systems

Exact-source checks cover all non-authorized runtime files. Approved animal
geometry, appendage state and activation pass the existing deterministic parity
programs. No camera tracks, animal code, population/LOD, currents/wakes,
sanctuary, bubble optics, public UI or dismissal listeners were redesigned.
The only HeroScene/LiveOceanLens changes concern preparation scheduling and
restoring renderer state on failure; their normal render/optical paths remain.

## Review limits

Readable connections and useful migration must be judged from browser motion,
not the pure-state tests. Some contacts remain subtle against bright moving
animals; the close crops are inspection aids, not substitutes for full-size
footage. The two-reservoir minute model is intentionally small and original,
not the full persistent topology solver of FluidGlass. No M8 work, optical
beauty pass or publication is included.
