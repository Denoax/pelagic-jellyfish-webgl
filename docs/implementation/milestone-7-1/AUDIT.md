# M7.1 — baseline and observed motion diagnosis

Authoritative baseline: `b6450239e64764dbba36ae9c913e15f3d847ee65`.
Clean baseline retained at `m7-ocean-glass`; new local worktree/branch
`m7-1-liquid-choreography` / `milestone-7-1-liquid-choreography`.
Origin: Denoax/pelagic-jellyfish-webgl. No remote mutation authorized.

Public browser inspection preceded runtime edits. Main and successful Pages
[workflow 34182837955](https://github.com/Denoax/pelagic-jellyfish-webgl/actions/runs/34182837955)
still identify `a2ed3bc89c700ba5c792ecac19747939e9f09b8d`. The site rendered and
animated without browser errors. This earlier release is visitor/reference
evidence, not the development baseline. Captures: `../m7-1-evidence/audit/public/`.

Baseline build passes (existing chunk warning), 118/118 tests pass, animal
motion parity passes 720 frames/24 checkpoints, default-animal parity passes
240 frames/8 checkpoints. Logs: `/tmp/m71-baseline-*.log`.
Installed Three remains 0.175.0, WebGPURenderer using NVIDIA WebGL2. React/Vite,
camera, one-ocean clean target, output and finite input/lifecycle remain locked.

## Fresh observation and source agreement

`../m7-1-evidence/baseline/opening/` contains the initial browser sequence,
frame captures, actual time metadata and motion.mp4. Filenames in this FIRST
diagnostic run indicate requested waits, not exact phase: screenshot overhead
accumulated. Metadata records actual liquid time. Subsequent script revisions
wait against liquid time instead. Do not present diagnostic filenames as exact
animation phase.

At early time the eight circles remain separate. The complete outlines appear
largely together later; local thickening around nearby beads is weak. The clock
settles while most beads remain independent. Source explains this: global
growth subtracts one threshold across the mask; six beads hardly approach real
strokes, while two aim for colon coordinates. Their radius loses only 22%.
Minute morph subtracts a common thickness and grows a centered bead. Exit is
primarily global amount/erosion. No event-driven liquid impulse exists.

## Focused human references

Fresh browser motion/captures of [FluidGlass](https://chiuhans111.github.io/fluidglass/)
and [Evan Wallace's Water](https://madebyevan.com/webgl-water/) are under
`../m7-1-evidence/audit/`. FluidGlass visibly stretches connected regions and
retains deformation after cursor travel. Its dense cells, metallic treatment,
clock composition and unlicensed implementation are NOT copied. Its author's
[README](https://github.com/chiuhans111/fluidglass) identifies coupled simulation
fields; that explains mechanism but does not authorize code reuse.
Evan's moving height surface continuously changes the refracted pool/sphere;
the useful principle is stateful response rather than independent UV noise.
No new third-party code, assets, solver or optical shader was imported.

The narrow adaptation is original spatial arrival from actual glyph anchors,
finite feeding masses and explicit neck events driving the EXISTING field.
The final optical normal/refraction/highlight equation remains byte-identical.

## Issues discovered during implementation, not accepted tradeoffs

- Hard-coded x=.33 cut through the proportional-font `4` in 14:29. Measured
  glyph advance boundaries replace guessed partitions. Clock centers are fixed
  within an idle visit so unchanged hours do not slide during a minute change.
- r175 Texture.clone shares Source. The old/current masks therefore need
  independent CanvasTexture sources, still the same two logical mask textures.
- First candidate prewarm was ~1.8 seconds versus baseline ~114 ms. Expanded
  repeated TSL expressions are a concrete regression; intermediate shader
  expressions are now explicitly materialized. Final measurement must decide
  whether this actually removes the regression. It is not acceptable to hide
  it by moving the timing window or calling it unrelated startup.

Visual review remains pending. A working scalar topology is not sufficient
proof of convincing contact, absorption, pinch or minute migration.
