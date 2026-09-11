# ONE-SHOT IMPLEMENTATION SPEC — PRE-M8 ASSET 2 BACKGROUND RECONSTRUCTION

## ROLE


# ABSOLUTE AUTHORIZATION BOUNDARY — BACKGROUND ONLY

THIS RULE OVERRIDES EVERY LOWER-PRIORITY IMPLEMENTATION IDEA IN THIS DOCUMENT.

You are authorized to modify ONLY the visual construction of the BACKGROUND /
ENVIRONMENT.

The already-approved foreground experience is immutable.

The purpose of this task is NOT to redesign the website.

The purpose is:

    KEEP THE APPROVED WEBSITE
    +
    RECONSTRUCT ITS BACKGROUND TO MATCH ASSET 2.

If an effect can be achieved by either:

A. changing an approved foreground/system component

or

B. changing the background/environment

YOU MUST CHOOSE B.

If the requested background appearance cannot be achieved without modifying an
unauthorized subsystem:

STOP THAT PARTICULAR CHANGE.

Document the constraint.

Do NOT silently modify the unauthorized subsystem.

------------------------------------------------------------
AUTHORIZED RUNTIME CHANGE CATEGORIES
------------------------------------------------------------

You MAY modify or add code whose purpose is exclusively one or more of:

- abyss/background water rendering
- environment extinction
- depth fog
- atmospheric perspective
- central blue haze
- background density fields
- subtle environmental light shafts
- distant hydrothermal/spire silhouettes
- midground proxy geology
- far/background environment LOD
- environment-only impostors/proxies
- sanctuary/world-edge disappearance
- Explore/freecam abyss falloff
- opaque terrain/floor visibility
- opaque rock/spire materials
- opaque-environment roughness/grain
- contact/cavity darkening
- material-space ambient occlusion
- optional GTAO used for opaque environment grounding
- environment-only color attenuation
- environment-side fake jellyfish illumination
- existing particle presentation ONLY where needed for environmental depth
- existing benthic-light presentation ONLY where needed for background hierarchy
- environment-only dither/banding suppression
- environment-only anti-alias experiments
- DEV-only Asset-2 comparison/QA tooling
- reference-analysis scripts
- environment performance instrumentation

Those are the authorized domains.

------------------------------------------------------------
LOCKED SYSTEMS — ZERO ARTISTIC CHANGES
------------------------------------------------------------

DO NOT modify the visual design, behavior, parameters, geometry, timing,
composition, colors, materials, movement, interaction, or algorithms of:

M1 JELLYFISH
- mantle geometry
- oral anatomy
- tentacles
- filaments
- tissue material
- tissue absorption
- tissue scattering approximation
- cyan rim
- pink anatomy
- violet appendages
- bioluminescence map
- pulse cycle
- appendage dynamics
- activation behavior

M2 OCEAN BEHAVIOR
- shared current-field behavior
- wake logic
- connected-response logic
- animal/current coupling

M3 OPTICS / BUBBLES
- bubble choreography
- bubble population
- bubble visual design
- bubble refraction
- approved optical behavior

M4 / M4.1 POPULATION
- screen-size LOD thresholds
- population composition
- biological variation
- detail-tier behavior
- animal optimization behavior

M5.2 CAMERA / INPUT
- Documentary camera track
- Drift camera track
- Intimate camera track
- Deep camera track
- Explore/freecam controls
- camera positions
- camera orientations
- FOVs
- authored journey poses
- scroll mapping
- scroll velocity/acceleration behavior
- View selector UX

M6 APPROVED STRUCTURE
- primary chimney shape
- ravine layout
- approved foreground sanctuary composition
- approved shelf silhouette archetypes
- plume simulation
- thermal shimmer
- approved ten pinpoint lights
- approved five colonies

Exception:
opaque environment shading/visibility may change because that is the explicit
scope of this pass.

Do not reposition the approved major M6 landmarks merely to match a screenshot.

M6.6.1 INPUT SAFETY
- malformed spatial-input rejection
- lifecycle fix

M7
- idle glass architecture
- clock field
- liquid choreography
- merging
- pinching
- minute morph
- idle entry
- idle exit
- pointer deformation
- one-renderer architecture

UI / SITE
- header
- footer
- typography
- branding
- links
- menu
- View UI
- layout

------------------------------------------------------------
JELLYFISH ARE READ-ONLY LIGHT SOURCES
------------------------------------------------------------

The environment is allowed to READ selected jellyfish state:

- world position
- existing emitted color
- existing visual importance
- existing scale/radius if useful

only in order to shade the BACKGROUND.

The environment may NOT write back into jellyfish state.

The background may react to the jellyfish.

The jellyfish may not be changed to make the background look better.

Example:

AUTHORIZED:
hero jellyfish position feeds a cheap environment-light uniform.

FORBIDDEN:
increase hero jellyfish emissive intensity because the floor is too dark.

AUTHORIZED:
darken rock outside jellyfish light radius.

FORBIDDEN:
change jellyfish trajectory so it lights a prettier area.

------------------------------------------------------------
CAMERA IS READ-ONLY
------------------------------------------------------------

The environment may read:

- current camera position
- orientation
- projection
- selected View mode
- Explore state

to choose environment LOD, extinction, proxy fade, or atmospheric-guide strength.

It may NOT alter:

- camera transform
- camera track
- FOV
- journey timing
- selected View mode
- input behavior

The background must adapt to the approved cameras.

The cameras must NOT adapt to the background.

------------------------------------------------------------
EXPLORE / FREECAM RULE
------------------------------------------------------------

You MAY make the environment disappear as Explore leaves the authored core.

You MAY NOT:

- clamp the user's camera merely to hide the environment
- redirect the camera
- teleport Explore
- alter Explore speed
- introduce a hard invisible wall

Solve world-boundary exposure visually:

    geometry loses contrast
    -> fog/extinction increases
    -> particles disappear
    -> silhouettes disappear
    -> abyss

------------------------------------------------------------
PARTICLE RULE
------------------------------------------------------------

Do NOT replace or redesign M2 particle simulation.

You may alter only BACKGROUND PRESENTATION parameters if needed:

- visibility
- environment-specific intensity multiplier
- distance hierarchy
- environment-specific subset selection
- atmosphere interaction

Do not change the underlying current simulation or movement equations.

------------------------------------------------------------
BENTHIC LIFE RULE
------------------------------------------------------------

Existing M6 benthic colonies and ten approved primary pinpoints remain.

Do not redesign them.

Do not replace them.

Do not make them globally brighter.

The environment may add only extremely subordinate non-hero atmospheric detail
if Asset 2 requires it, and only after the existing elements are insufficient.

Any added subordinate glow must be:

- environment dressing
- tiny
- bounded
- non-interactive
- cheaper than a realtime light

------------------------------------------------------------
OPTICAL COMPOSITOR RULE
------------------------------------------------------------

M3/M6/M7 established one renderer and one ocean render.

Preserve that architecture.

You may integrate an environment-only post effect into the existing output path
ONLY if:

- it does not require a second ocean scene render
- it does not create a second renderer/context
- it does not change approved bubble/glass output
- it can be disabled independently for parity testing

------------------------------------------------------------
FILE-TOUCH DISCIPLINE
------------------------------------------------------------

Before editing a runtime file, classify the intended change:

BACKGROUND_SCOPE
or
OUT_OF_SCOPE.

If OUT_OF_SCOPE:

DO NOT EDIT THE FILE.

A file containing both environment and locked systems may be edited only for
the smallest environment-specific integration seam.

For every such mixed-ownership file, the final report must state:

- exact file
- exact environment-only reason it was touched
- exact functions/lines conceptually affected
- confirmation that unrelated behavior was unchanged

Do not opportunistically refactor mixed files.

Do not rename unrelated APIs.

Do not clean up unrelated code.

Do not format unrelated sections.

Minimal diff discipline is mandatory.

------------------------------------------------------------
DIFF AUDIT
------------------------------------------------------------

Before declaring completion, compare against APPROVED_M7.

Classify every runtime changed file as one of:

ENVIRONMENT_RUNTIME
ENVIRONMENT_INTEGRATION
QA_ONLY

There must be ZERO files classified as:

JELLYFISH_CHANGE
CAMERA_CHANGE
M7_CHANGE
UI_CHANGE
UNRELATED_CHANGE

If any such change exists:

REVERT THAT CHANGE BEFORE FINAL REPORT.

------------------------------------------------------------
VISUAL PARITY OUTSIDE BACKGROUND
------------------------------------------------------------

Capture matched approved-M7 vs candidate images.

Foreground jellyfish differences must be attributable only to autonomous phase
timing, not code changes.

Verify explicitly:

- jellyfish colors unchanged
- hero material unchanged
- population unchanged
- camera framing unchanged
- bubble behavior unchanged
- M7 glass unchanged
- UI unchanged

The only intentional visual delta is the BACKGROUND / ENVIRONMENT.

------------------------------------------------------------
FAIL-CLOSED RULE
------------------------------------------------------------

When uncertain whether something belongs to background scope:

ASSUME IT IS LOCKED.

Do not touch it.

This pass succeeds by changing what surrounds the approved artwork.

It does not succeed by altering the approved artwork itself.



You are implementing the final background-art pass for `Denoax/pelagic-jellyfish-webgl`.

This is a production coding task, not an ideation task.

Do not redesign the jellyfish, camera system, M7 idle glass, UI, or journey. Those are already approved.

Your job is to make the **BACKGROUND ENVIRONMENT** — water, abyss, distant spire field, atmospheric depth, floor visibility, local environmental lighting, and freecam/world-edge behavior — reproduce the supplied **Asset 2 reference** as closely as the existing Three.js project can reasonably render in real time.

You have been given a reference pack that removes most artistic ambiguity. Use it. Do not substitute your own taste for it.

The success criterion is not “looks nicer than before.”

The success criterion is:

> When `REF_00_ASSET2_ORIGINAL.png` and the live candidate are placed side by side at the review pose, a graphics artist should immediately read the same depth structure, darkness hierarchy, silhouette field, atmospheric opening, floor visibility, and light hierarchy.

This is a deliberately cheat-friendly art pass.

If 2.5D, impostors, procedural silhouettes, local material hacks, view-conditioned atmospheric guides, or depth tricks produce a better image more efficiently than physically correct rendering, use them.

Every cheat must survive normal motion and Explore long enough that the viewer does not notice the cheat.

---

# 0 — REQUIRED INPUT PACK

Before doing anything, verify this exact directory exists:

`docs/reference/asset2/`

It must contain:

1. `REF_00_ASSET2_ORIGINAL.png`
2. `REF_01_COMPOSITION_MAP.png`
3. `REF_02_LIGHT_FIELD_METRICS.png`
4. `REF_03_SPIRE_CROP_ATLAS.png`
5. `REF_04_SILHOUETTE_MAP.png`
6. `REF_05_FLOOR_ATLAS.png`
7. `REF_06_ATMOSPHERE_ATLAS.png`
8. `REF_07_FREECAM_FADE_STORYBOARD.png`
9. `REF_08_RENDER_STACK.png`
10. `REF_09_PALETTE_BUDGET.png`
11. `asset2_reference_metrics.json`
12. `asset2_target_config.json`
13. `RUNTIME_GUIDE_asset2_lowfreq_atmosphere_256x144.png`
14. `RUNTIME_GUIDE_asset2_luminance_field_256x144.png`
15. `RUNTIME_GUIDE_asset2_visibility_field_256x144.png`

If ANY required file is missing:

STOP.

Print the missing filenames.

Do not approximate them from this prompt.
Do not generate replacements.
Do not search online for a substitute reference.

`REF_00_ASSET2_ORIGINAL.png` is the art source of truth.

The other images are technical decompositions of that exact source.

---

# 1 — BASELINE / GIT / SAFETY

M7 is artistically approved.

The approved runtime commit prefix is:

`bce3571`

Resolve the exact commit locally:

```sh
APPROVED_M7="$(git rev-parse bce3571^{commit})"
git show --no-patch --format='%H%n%s' "$APPROVED_M7"
```

Use the resulting full SHA as the immutable visual/runtime baseline.

Do not guess or replace it with a later QA/docs-only commit.

Create a new local branch/worktree:

`pre-m8-asset2-background`

All work remains local.

DO NOT:

- push
- merge
- deploy
- change GitHub Pages
- start M8
- reset/clean/stash unrelated work
- rewrite history
- upgrade Three.js
- add a second renderer
- add a second graphics context
- render the ocean scene twice
- replace M7 optical architecture
- change approved camera paths
- change scroll behavior
- change View UI
- change jellyfish anatomy/material palette/swimming
- change M7 liquid choreography

Use small reversible commits.

Suggested commit sequence:

1. `qa: add asset2 comparison harness`
2. `env: add abyss and far-spire composition`
3. `env: add extinction and explore world fade`
4. `env: add local jelly illumination and particle hierarchy`
5. `env: ground floor shading and ao experiment`
6. `env: add restrained atmosphere shafts and polish`
7. `qa: asset2 final evidence and performance`

Do not combine all work into one opaque commit.

---

# 2 — FIRST: READ THE EXISTING LOCAL IMPLEMENTATION

Before coding, inspect the current local approved runtime.

At minimum locate and read the CURRENT versions of:

- `src/scene/HeroScene.jsx`
- `src/scene/PelagicEnvironment.js` or its current equivalent
- `src/scene/sanctuary/Sanctuary.js`
- `src/scene/sanctuary/geology.js`
- `src/scene/sanctuary/mesoGeology.js`
- `src/scene/sanctuary/materials.js`
- `src/scene/sanctuary/VentLife.js`
- `src/scene/sanctuary/BenthicSediment.js`
- `src/scene/sanctuary/shelfSilhouettes.js`
- M2 current / marine-particle implementation
- current pooled jellyfish/environment illumination implementation from M6
- `src/scene/glass/LiveOceanLens.js`
- the current final render/output/compositor path
- all relevant `AGENTS.md`

Do not infer architecture from old public `main` if the local approved source differs.

Write a short implementation map into:

`docs/implementation/asset2-background/CURRENT_ARCHITECTURE.md`

Include:

- renderer ownership
- current full-resolution scene target(s)
- post/output path
- current sanctuary center
- current sanctuary horizontal bounds
- `DEEP_FLOOR_Y`
- current floor/spire geometry sources
- current particle system
- current environment lighting uniforms
- current render/draw-call ownership

This audit is factual, not a design phase.

The design is already specified below.

---

# 3 — THE REFERENCE IS NOT “JUST DARKER”

Read:

- `REF_00_ASSET2_ORIGINAL.png`
- `REF_02_LIGHT_FIELD_METRICS.png`
- `asset2_reference_metrics.json`

Treat these values as image-structure targets:

Approximate linear luminance:

- median ≈ `0.0029`
- p90 ≈ `0.0093`
- p95 ≈ `0.0146`
- p99 ≈ `0.137`
- ≈ `91%` of pixels below `0.01`
- ≈ `96%` of pixels below `0.02`

Most importantly:

- central mean ≈ `5.4×` outer-border mean

This means:

ASSET 2 IS MOSTLY NEAR-BLACK,
BUT ITS CENTRAL ATMOSPHERIC REGION IS MUCH MORE INFORMATIVE THAN ITS BORDERS.

Do NOT simply multiply the entire scene darker.

A uniformly black scene fails.

Target structure:

`near-black borders / abyss`
→ `soft blue atmospheric opening`
→ `dark layered spire silhouettes`
→ `selectively revealed near floor`
→ `very bright jellyfish`
→ `tiny benthic points`

The current scene historically failed because too much terrain information lived at similar contrast.

This pass creates hierarchy.

---

# 4 — VISUAL HIERARCHY: NON-NEGOTIABLE

The visual importance order must be:

1. HERO JELLYFISH
2. SECONDARY JELLYFISH
3. CENTRAL BLUE HAZE + PARTICLE CURRENT
4. MID/FAR SPIRE SILHOUETTES
5. TINY BENTHIC LIGHT ACCENTS
6. FLOOR SURFACE DETAIL

At a glance the viewer must NOT inspect floor topology before noticing the animals.

If floor geometry becomes a major subject:

FAIL.

If distant spires show obvious material detail:

FAIL.

If ambient fill reveals the whole sanctuary:

FAIL.

If benthic points resemble a neon garden:

FAIL.

---

# 5 — IMPLEMENTATION PHILOSOPHY

The environment should be built as four spatial complexity layers:

## NEAR

Existing real sanctuary/floor geometry.

Purpose:

- parallax
- contact
- close Explore inspection
- jellyfish-local light response

Cost:

existing detailed geometry/material only where already justified.

## MID

Cheap real 3D spire proxies.

Purpose:

- strong parallax
- silhouette overlap
- depth cues

Cost:

low-poly instanced geometry.

## FAR

Extremely cheap silhouette geometry/proxies.

Purpose:

- massive perceived world
- background vertical rhythm

Cost:

few archetypes, instanced, almost no surface shading.

## EXTREME FAR

No geometry.

Only:

- abyss backdrop
- low-frequency atmosphere
- extinction
- extremely faint haze/shafts

Do not build what the fog hides.

---

# 6 — DEFINE THE SANCTUARY SCALE ONCE

Derive an environment scale variable `R`.

Do not guess a magic world-space number.

Let:

`SANCTUARY_CENTER_XZ`

be the horizontal center of the current approved sanctuary/geology.

Let:

`R`

be the maximum horizontal radial distance from that center to the current sanctuary opaque-geology bounds, excluding newly added far/background proxies.

Compute/cache this once after construction.

Use `R` to normalize:

- world-edge fade
- far-spire annulus
- haze volume scale
- local light radii
- Explore abyss behavior

Do not recompute bounding boxes every frame.

Document actual measured:

- center
- R
- floor Y

in final report.

---

# 7 — BUILD THE REFERENCE QA HARNESS BEFORE ART CHANGES

Create a DEV-only comparison route/flag.

Suggested query:

`?asset2qa=1`

Requirements:

- fixed reference viewport target: `1672×941`, DPR 1
- button/keyboard or script-driven capture of current candidate
- side-by-side:
  - reference
  - approved M7 baseline capture
  - current candidate
- optional views:
  - RGB
  - grayscale
  - blurred low-frequency luminance
  - edge/silhouette view

Do not put QA controls in public production UI.

The harness must be deterministic enough that captures use:

- same View mode
- same journey progress
- same camera pose
- same viewport
- same quality
- fixed/random seed where supported

Animal phase may differ; this is accepted.

Art matching is about environment structure, not pixel-locked tentacles.

---

# 8 — REFERENCE POSE CALIBRATION

Do NOT modify an approved camera track to match the reference.

Find the existing approved Drift/deep-sanctuary pose that most closely corresponds to Asset 2.

Record DEV-only:

- camera world position
- quaternion
- FOV
- journey progress
- View mode

Call it:

`ASSET2_QA_POSE`

Use it only for QA/capture.

Do not expose a new public camera.

All screen-space placement targets below refer to this QA pose.

---

# 9 — EXACT SCREEN-SPACE TARGETS

Load:

`asset2_target_config.json`

Use its normalized screen regions.

The central atmosphere approximately occupies:

- center ≈ `(0.42, 0.42)`
- broad radius ≈ `(0.38, 0.48)`

Floor begins around:

- normalized y ≈ `0.56`

Particle connector approximately runs:

- start ≈ `(0.23, 0.31)`
- end ≈ `(0.59, 0.50)`

Far/mid spire silhouette regions are listed in:

`primary_spire_screen_regions`

Use:

`REF_01_COMPOSITION_MAP.png`
and
`REF_03_SPIRE_CROP_ATLAS.png`

as the visual check.

Do not manually improvise a totally different silhouette layout.

---

# 10 — RECONSTRUCT THE ABYSS FIRST

Before touching AO, rocks, particles, or glow:

create the large-scale abyss backdrop.

Preferred implementation:

- procedural full-screen/background node
OR
- huge inside-facing dome/sphere

Use whichever integrates with the approved renderer with lower complexity.

The abyss must have:

- no horizon
- no visible texture seam
- no star-field appearance
- near-black navy base
- extremely subtle vertically/centrally varying blue density
- negligible high-frequency texture

Approximate color family:

very dark:
`#000307`
`#00050A`
`#010812`

central atmospheric blue-black:
`#031426`
`#052039`
`#082B4B`

These are starting values, not independent art choices.

Compare to `REF_09_PALETTE_BUDGET.png`.

Do not globally fill the scene with cyan/teal.

---

# 11 — OPTIONAL LOW-FREQUENCY REFERENCE GUIDE: AUTHORIZED CHEAT

The reference pack contains:

`RUNTIME_GUIDE_asset2_lowfreq_atmosphere_256x144.png`

This is intentionally heavily blurred so it contains low-frequency atmospheric organization, not usable object detail.

You MAY use it at runtime as a very low-weight atmospheric modulation source if it creates a substantial visual match improvement.

This is explicitly authorized.

Rules:

- it must never replace live scene rendering
- it must never contain a visible jellyfish “ghost”
- opacity must remain subtle
- suggested authored-view weight: `0.08–0.18`
- suggested Explore weight: `0.00–0.04`
- fade contribution down as camera deviates strongly from `ASSET2_QA_POSE`
- do not let it move like a pasted image during camera motion
- it may modulate background/haze color, not draw identifiable shapes

Preferred use:

sample it only as a broad low-frequency RGB/density field.

Gate it away from bright scene pixels so it does not recolor the hero.

Conceptually:

```text
sceneLuma = luminance(sceneColor)
darkWeight = 1 - smoothstep(0.03, 0.12, sceneLuma)
guideContribution = guideRGB * guideOpacity * darkWeight
```

Tune values.

Do NOT directly add it at high opacity.

Run ablation:
guide OFF vs ON.

Keep it only if it materially helps match Asset 2 without looking screen-attached.

---

# 12 — FAR SPIRE FIELD: PRIMARY DEPTH CHEAT

Asset 2 gets much of its scale from tall, dark silhouettes.

Do not add detailed environment meshes everywhere.

Create:

`FarSpireField`

or equivalent.

Use shared instanced geometry.

Initial target:

- `4` main low-poly archetypes
- `24–36` total proxy instances
- no more than a small number of instanced draw batches

The exact final count is an art/performance result.

Do NOT add hundreds.

---

# 13 — SPIRE GEOMETRY GENERATOR

Do not use primitive cylinders.

Create irregular accretion/chimney geometry from stacked rings.

Each spire archetype should be generated ONCE.

Suggested shared topology:

- radial segments: `7–9`
- vertical levels: `6–9`
- triangulated ring connections
- irregular angular phase per level
- low-frequency radial asymmetry
- center drift between levels
- tapered / broken crown
- nonuniform vertical spacing

No per-frame mutation.

No per-instance geometry generation.

Use deterministic seeds.

Base algorithm:

For level `j`:

```text
y_j = profileHeight[j] * H

center_j =
base
+ driftX[j] * width
+ driftZ[j] * width

radius(theta, j) =
profileRadius[j] * width
* (
    1
    + A1[j] * cos(theta * k1 + phase1[j])
    + A2[j] * cos(theta * k2 + phase2[j])
  )
```

Keep `A1/A2` small.

This is geological silhouette variation, not spiky noise.

---

# 14 — FOUR EXACT ARCHETYPE PROFILES

Use these as starting normalized profiles.

Codex may make small changes ONLY if `REF_03_SPIRE_CROP_ATLAS.png` proves a mismatch.

## ARCHETYPE A — TALL NEEDLE

```js
height = [0.00, 0.16, 0.34, 0.55, 0.74, 0.90, 1.00]
radius = [0.34, 0.39, 0.33, 0.28, 0.20, 0.12, 0.05]
driftX = [0.00, 0.02,-0.01, 0.04, 0.03, 0.01, 0.00]
driftZ = [0.00,-0.01, 0.02, 0.02,-0.01, 0.01, 0.00]
segments = 7
```

## ARCHETYPE B — HEAVY CHIMNEY

```js
height = [0.00, 0.14, 0.31, 0.49, 0.67, 0.84, 1.00]
radius = [0.54, 0.60, 0.52, 0.47, 0.38, 0.27, 0.11]
driftX = [0.00,-0.03,-0.02, 0.01, 0.04, 0.02, 0.00]
driftZ = [0.00, 0.02, 0.04, 0.00,-0.02, 0.01, 0.00]
segments = 9
```

## ARCHETYPE C — LEANING COLUMN

```js
height = [0.00, 0.18, 0.37, 0.57, 0.75, 0.90, 1.00]
radius = [0.40, 0.46, 0.40, 0.33, 0.25, 0.16, 0.07]
driftX = [0.00, 0.04, 0.09, 0.15, 0.20, 0.25, 0.28]
driftZ = [0.00, 0.01, 0.02, 0.00,-0.01,-0.02,-0.02]
segments = 8
```

## ARCHETYPE D — BROKEN STACK

```js
height = [0.00, 0.13, 0.29, 0.43, 0.60, 0.76, 0.88, 1.00]
radius = [0.52, 0.56, 0.44, 0.51, 0.35, 0.29, 0.17, 0.08]
driftX = [0.00,-0.02, 0.03,-0.04, 0.02, 0.01,-0.02, 0.00]
driftZ = [0.00, 0.03, 0.01,-0.02,-0.04, 0.01, 0.02, 0.00]
segments = 8
```

For all:

- rotate ring angular phase between levels
- slightly flatten one side on some archetypes
- allow a few omitted/contracted top vertices for broken crown
- recompute normals
- verify finite geometry

Do not put M6.5 micro-grain material on FAR spires.

Far spires are silhouette assets.

---

# 15 — SCREEN-SPACE FIT THE SPIRES INSTEAD OF GUESSING WORLD POSITIONS

This is important.

Do not hand-place proxies with arbitrary world coordinates until they “sort of look right.”

At `ASSET2_QA_POSE`:

1. Take desired spire base/top screen regions from:
   - `REF_01_COMPOSITION_MAP.png`
   - `REF_03_SPIRE_CROP_ATLAS.png`
   - `asset2_target_config.json`

2. For each target cluster:
   - cast/unproject a ray through the desired base UV
   - intersect with floor plane / existing terrain height
   - place the proxy base at that world location

3. Choose/solve its world height so its projected top reaches the desired target y.

A simple bounded binary search on height is sufficient.

4. Choose width/aspect so projected silhouette width approximately matches target.

5. Freeze these deterministic transforms as reference-composition anchors.

Then generate secondary spires around those anchors with deterministic variation.

This gives the QA view the correct large silhouette rhythm while preserving real 3D parallax.

Do not move the camera to fit the spires.

Move the environment.

---

# 16 — DEPTH BANDS

Use three visible proxy bands plus extreme abyss.

Read:

`REF_06_ATMOSPHERE_ATLAS.png`

and:

`asset2_target_config.json -> depth_band_visibility`

## MID

- strongest silhouette
- dark / nearly black
- some parallax
- almost no surface detail
- visually behind near sanctuary

## FAR

- lower contrast
- bluer
- strongly fogged
- little/no local surface shading
- still enough silhouette for scale

## EXTREME FAR

- almost no shape
- only occasional ghost silhouette
- disappears entirely as camera leaves authored core

Do not make every proxy equally black.

Atmospheric perspective requires relative contrast change.

---

# 17 — SPIRE PLACEMENT DISTRIBUTION

Do NOT use uniform random distribution.

Build approximately 5–7 clusters.

A cluster contains:

- one dominant tall silhouette
- one or two subordinate narrower forms
- optional low crag

Leave large negative-space gaps.

Important Asset 2 property:

the right-upper quadrant behind the hero retains substantial darkness.

Do not fill the entire background with towers.

Use `REF_01_COMPOSITION_MAP.png`.

---

# 18 — SPIRE MATERIAL

Make one extremely cheap far-spire material.

Needed properties:

- blue-black base
- minimal rough diffuse
- tiny atmospheric pickup
- fog/extinction
- optional faint top-facing blue response

Not needed:

- detailed textures
- grain
- multiple lights
- glow
- transmission
- expensive normals

Far proxy color should asymptotically approach abyss/fog color with distance.

No proxy should be more visually detailed than its screen size justifies.

---

# 19 — CENTRAL ATMOSPHERIC OPENING

Asset 2 is NOT uniformly fogged.

The broad central/mid-left area contains a low-contrast blue atmosphere field.

Create:

`CentralHazeField`

or equivalent.

The visual target is defined in:

- `REF_02_LIGHT_FIELD_METRICS.png`
- `REF_06_ATMOSPHERE_ATLAS.png`

It should be broad and boundaryless.

Preferred cheap implementation order:

## Attempt A

Analytic environment fog / extinction in opaque materials.

## Attempt B

A small number (`2–4`) of huge, extremely soft world-space haze volumes/cards.

## Attempt C

Low-resolution post/volume only if A+B cannot match the reference.

Do NOT begin with a heavy volumetric raymarch.

---

# 20 — ATMOSPHERIC FORMULA

Use Beer-Lambert-style intuition, not physical simulation.

For environment fragment/view distance `d`:

```text
T = exp(-sigma * d)
```

But do not use one global sigma.

Construct:

```text
sigma =
baseDensity
* depthModifier
* sanctuaryRadiusModifier
* nearFloorModifier
```

Then:

```text
environmentColor =
surfaceColor * T
+ fogColor * (1 - T) * inScatterWeight
```

Use RGB-dependent attenuation subtly:

warm attenuation > green attenuation > blue attenuation.

This is an artistic cheat consistent with underwater visual behavior.

Do not apply the same extinction blindly to luminous jellyfish tissue.

---

# 21 — NORMALIZE FOG TO SANCTUARY SCALE

Use `R`.

Suggested functional zones:

```text
radial = horizontalDistance(worldXZ, sanctuaryCenter) / R

core:
radial <= 0.85

fade begins:
~1.00

strong fade:
~1.65

near black:
~2.10
```

Use smooth curves.

Do not create a visible shell.

Conceptual world visibility:

```text
outerFade =
1 - smoothstep(1.00, 1.65, radial)

outerFade = outerFade * outerFade
```

Then combine with camera-distance extinction.

At `radial >= 2.10`:

environment geometry should contribute almost nothing.

This is the Explore/freecam “infinite ocean” cheat.

Do NOT hard-clip at 2.10.

Approach zero smoothly.

---

# 22 — FREECAM / EXPLORE CONTRACT

Read:

`REF_07_FREECAM_FADE_STORYBOARD.png`

Explore should reveal LESS structure as the camera leaves the authored basin.

Sequence:

CORE:
real environment visible

FADE:
far geometry loses contrast; particles reduce

ABYSS:
only faint haze + rare luminous animals/points

VOID:
almost pure deep navy/black

The finite level boundary must disappear BEFORE a visitor can inspect it.

No hard collision wall is required.

If a visitor flies far away and sees only darkness:

THAT IS CORRECT.

---

# 23 — DO NOT HIDE THE MAP WITH A SCREEN-SPACE BLACK CIRCLE

World disappearance must primarily come from:

- environment material extinction
- proxy fade
- particle density fade
- haze
- low ambient

A subtle final screen-space vignette is allowed.

But the world must already be dark in 3D.

Otherwise Explore exposes the trick.

---

# 24 — CENTRAL HAZE LIGHTING TARGET

The central zone should not look “foggy.”

It should look like:

the water itself contains a little more blue scattered light.

Target:

- soft navy → cool blue-black change
- enough to separate spire layers
- enough to reveal particle current
- NOT enough to flatten the abyss

Use `RUNTIME_GUIDE_asset2_luminance_field_256x144.png` for QA.

A candidate is wrong if:

- borders and center are equally dark
OR
- entire water column is bright blue

Target central/border luminance ratio:

approximately `5.4×`

Acceptable first visual-review band:

`4.2×–6.8×`

Do not optimize blindly to the number.

The number is a guardrail.

---

# 25 — SOFT SHAFTS

Only after the major atmosphere matches:

add `3–5` soft vertical shafts.

Asset 2 shafts are:

- broad
- weak
- blurred
- mostly upper/central
- low frequency
- not crisp god rays

Preferred cheap implementations:

- crossed world-space soft volumes
- elongated cone/cylinder volumes with procedural radial alpha
- low-res post shaft approximation

Avoid:

- hard plane edges
- high-intensity additive cones
- fast moving noise
- full volumetric shadow system

Reference research:
GPU Gems 3, Chapter 13 demonstrates that convincing volumetric scattering can be approximated as post processing and can be downsampled to reduce bandwidth; the project does not need physically complete participating-media transport.

If the cheap shafts are visible as geometry:

remove or redesign them.

---

# 26 — SHAFT MOVEMENT

Nearly static.

Allowed:

- tiny noise drift
- tiny intensity variation over tens of seconds

Not allowed:

- animated spotlight sweeping
- obvious texture scroll
- pulsing

The animals move.

The background should feel massive and slow.

---

# 27 — JELLYFISH MUST FEEL LIKE THE LIGHT SOURCES

This is one of Asset 2’s strongest illusions.

Do NOT add dozens of realtime `PointLight`s.

Use the environment material.

Reuse the existing M6 pooled jelly illumination architecture if possible.

If necessary, expose a fixed-size uniform array containing the most important local jellyfish:

Maximum:

`4`

For each:

```text
position
cyan/violet-biased color
intensity
radius
```

Environment fragment local contribution:

```text
delta = lightPos - worldPos
d = length(delta)

falloff =
smoothstep(radius, 0, d)

falloff *= falloff

NdotL =
max(dot(normal, normalize(delta)), 0)

localLight =
lightColor
* falloff
* mix(0.20, 1.00, NdotL)
```

This is intentionally fake.

No shadow map.

No GI.

No ray tracing.

---

# 28 — JELLY LIGHT SELECTION

Do not use all animals.

Each frame or at a low update rate, choose up to four environment-relevant luminous animals.

Prefer:

- screen-important
- near floor / geology
- near camera
- high M4 visual-importance score if available

Reuse existing population importance calculations if possible.

Do not allocate arrays every frame.

Use persistent typed/uniform storage.

---

# 29 — JELLY LIGHT ART DIRECTION

The local reveal should be obvious only when watching motion.

A jellyfish passes:

rock ridge / floor patch becomes slightly visible.

It leaves:

patch returns to darkness.

No jellyfish should illuminate the entire sanctuary.

Suggested initial radius:

derive relative to `R`,
roughly on the order of `0.12R–0.28R`.

Tune visually.

The largest hero can have a slightly larger pool than far population members.

---

# 30 — ENVIRONMENT AMBIENT FILL

Reduce broad ambient floor exposure.

Asset 2 wants:

LOCAL BIOLUMINESCENCE
>>
GLOBAL AMBIENT.

But do not set ambient to exactly zero.

Need:

- spire silhouette readability
- occasional floor plane separation
- atmosphere layering

Use darkness as default.

Visibility is earned by local atmosphere/light.

---

# 31 — FLOOR MATERIAL: PRESERVE M6.5, REDUCE ITS VISUAL PRIORITY

Do not throw away the approved dark basalt work.

Preserve:

- dark pigments
- grain
- roughness
- crevice treatment
- shelf silhouette variation
- rare primary pinpoints

Asset 2 asks for LESS floor visibility, not a brighter material redesign.

Change mainly:

- environmental illumination
- distance extinction
- local jelly reveal
- contact/cavity weighting

No wholesale geometry rebuild.

---

# 32 — MATERIAL-SPACE CONTACT OCCLUSION FIRST

Before GTAO, improve inexpensive local occlusion in opaque environment materials.

Darken:

- downward/underside normals
- shelf undersides
- geometry contacts
- ravine interior
- spire bases
- rubble pockets
- sheltered crevices

Use existing geology metadata/proximity fields if available.

Do not invent per-frame raycasts.

No expensive scene queries every frame.

The purpose:

make neighboring rock shapes visually merge into one geological mass.

---

# 33 — CAVITY / UNDERSIDE CHEAT

A simple cheap component may use world normal:

```text
upFacing = saturate(dot(normalWorld, worldUp))
underside = 1 - smoothstep(low, high, upFacing)
```

Combine with:

- existing crevice/noise signal
- local shelf/terrain context
- near-floor darkness

Do not blacken all vertical faces equally.

The result must remain natural in motion.

---

# 34 — GTAO: PROTOTYPE, NOT RELIGION

Pinned Three.js r175 already contains:

`examples/jsm/tsl/display/GTAONode.js`

Do NOT upgrade Three.

Research constraints:

- GTAO supports depth
- can optionally accept normals
- can reconstruct normals from depth
- exposes `resolutionScale`
- `0.5` resolution is explicitly intended as a practical quality/performance option
- sample count is configurable

Prototype three variants:

A. material/contact AO only
B. half-resolution GTAO only
C. material AO + restrained half-res GTAO

Start GTAO approximately:

```text
resolutionScale = 0.5
samples = 8
```

Then tune:

- radius
- thickness
- distance falloff
- scale

Do not chase perfect AO.

---

# 35 — GTAO INTEGRATION RULE

M7 architecture requires:

ONE ocean scene render.

If GTAO requires a second scene beauty render:

REJECT THAT INTEGRATION.

Allowed:

- a low-resolution fullscreen AO computation using already available depth
- depth-normal reconstruction
- additional lightweight fullscreen pass

Not allowed:

- render entire ocean scene again
- create another renderer/context
- duplicate full-resolution ocean beauty target

Document exact pass ownership.

---

# 36 — TRANSPARENT JELLYFISH PROTECTION

GTAO must not make the jellyfish dirty/black.

Transparent hero materials historically do not behave like ordinary opaque depth surfaces.

If final-screen multiplication causes background AO to visibly darken transparent jellyfish pixels:

reject that composition method.

Prefer:

- material-space environment AO
OR
- an environment-only AO application path already compatible with the existing render architecture

Do NOT compromise hero quality for AO.

---

# 37 — FLOOR EDGE / “PIXELATED” PROBLEM

Do not assume all rough edges are resolution problems.

Classify each ugly artifact as:

A. geometry silhouette
B. duplicated geometry rhythm
C. hard material contrast
D. aliasing
E. lack of fog
F. LOD transition
G. actual low resolution

Asset 2 hides most floor imperfections through:

- darkness
- haze
- lower contrast
- contact shadow
- selective visibility

Use those first.

---

# 38 — FXAA EXPERIMENT: OPTIONAL

Pinned r175 includes `FXAANode`.

Test under DEV flag only.

Keep only if it clearly improves distant rock/spire stair-stepping WITHOUT visibly softening:

- hero bell edge
- tentacles
- fine filaments
- tiny bioluminescent points

If hero quality drops:

do not ship global FXAA.

Fog and contrast management are preferred for background edges.

---

# 39 — SUBTLE DITHER FOR DARK GRADIENTS

Very dark blue fog can band.

If banding appears:

add extremely weak dither/noise.

Purpose:

break quantization.

Not:

visible film grain.

Pinned r175 contains `FilmNode`, but do not add it merely because it exists.

A custom 1-LSB-ish dither/noise may be cheaper and less stylized.

At native viewing size the user should not consciously see grain.

---

# 40 — MIDWATER PARTICLE CURRENT

Asset 2 uses a particle stream as a compositional bridge.

Do NOT create a giant starfield.

Reuse M2 current/particle architecture.

Create or bias a restrained subset toward the target region:

approx screen path at QA pose:

`(0.23,0.31)` → `(0.59,0.50)`

The exact world volume must remain coherent with the existing current field.

Purpose:

- connect secondary animals to hero
- make central haze visible
- communicate water motion
- create depth

---

# 41 — PARTICLE DISTRIBUTION

Use depth hierarchy.

NEAR:
few, slightly softer/larger

MID:
main visible stream

FAR:
tiny, dim, sparse

Avoid:

- identical point sizes
- uniform random field
- dense glitter
- stars in space

Most particles should be dim.

Only a small percentile should become clearly bright.

---

# 42 — BENTHIC LIGHTS

Preserve M6.5 primary pinpoint concept.

Do NOT convert floor into a bioluminescent garden.

Existing primary pinpoints remain.

If Asset 2 still lacks enough tiny depth cues after atmosphere is correct:

add only:

`8–18`

subordinate micro-points as an initial range.

Subordinate points should be significantly dimmer/smaller than primary M6 points.

No point-light per microglow.

No large halo.

They may slightly bias nearby material emission/atmosphere analytically.

---

# 43 — FLOOR LIGHT HIERARCHY

Primary bright floor accents:
rare.

Secondary:
barely visible.

Reference look:

dark rock
→ occasional cyan pinprick
→ black again.

Not:

continuous dotted outline.

---

# 44 — COLOR CONTRACT

Environment dominant family:

- black
- blue-black
- deep navy
- desaturated cold blue

Saturated colors belong mainly to living luminous elements:

- cyan
- blue-white
- violet
- pink

Do NOT introduce:

- green water
- warm fog
- orange overall grade
- broad purple environment fill
- bright turquoise ambience

Pink belongs primarily to jellyfish anatomy.

---

# 45 — SPECTRAL UNDERWATER CHEAT

Research on real-time underwater rendering explicitly notes that games often prefer art-controllable tinted exponential fog and depth-dependent illumination over fully physical spectral transport.

Use a cheap approximation.

As environment distance/depth increases:

- red falls first
- green falls next
- blue remains longest
- finally all collapse to blue-black

Do not run a spectral renderer.

Do not remove the hero’s pink anatomy.

Apply primarily to opaque environment/background.

---

# 46 — PALETTE QA

Use:

`REF_09_PALETTE_BUDGET.png`

Candidate environment should spend MOST pixels in the darkest bins.

Bright saturated color area must remain small.

If environmental blue starts covering half the image at medium brightness:

too bright.

---

# 47 — NO RAY TRACING

Do NOT add:

- path tracing
- ray-traced GI
- ray-traced reflections
- WebGPU raytracing experiment
- heavyweight SSGI

for the production solution.

The reference’s “expensive” feel comes from:

- composition
- local contrast
- occlusion
- haze
- parallax
- selective specular
- darkness

Actual ray tracing adds unnecessary risk before M8.

---

# 48 — 2.5D CHEATS ARE AUTHORIZED

The user explicitly does not require every illusion to be physically 3D.

Authorized cheats include:

- low-poly silhouette proxy geometry
- view-aware atmospheric modulation
- low-frequency screen-space reference guide
- impostor-like extreme-distance silhouettes
- camera-relative haze modulation
- selective fade before freecam exposes tricks

Use 3D only where motion/parallax makes it valuable.

---

# 49 — IMPOSTOR RULE

Traditional billboard/impostor methods are useful because they trade polygon complexity for image-based representation, but they fail as view angle diverges.

Therefore:

- MID spires: real low-poly 3D
- FAR spires: low-poly 3D preferred
- EXTREME FAR cards/impostors allowed
- extreme far cheats MUST fade out before side-angle error is obvious in Explore

Do not build complex “true impostor” raycasting unless simple proxy geometry fails.

---

# 50 — 2D ATMOSPHERE GUIDE VIEW-DEPENDENCE

If the low-frequency guide texture is retained at runtime:

its contribution MUST decay with angular deviation from the QA camera orientation.

Compute approximate view deviation:

```text
angle = acos(clamp(dot(currentForward, qaForward), -1, 1))
```

Suggested:

- full/normal guide weight near `0–12°`
- smooth fade `12–35°`
- near zero beyond `35°`
- always near-zero in Explore

Do not let a fixed screen-space blue cloud follow freecam like a HUD.

---

# 51 — BACKGROUND PARALLAX

The reason MID/FAR spires remain true geometry is parallax.

During camera motion:

- near silhouettes move more
- far silhouettes move less
- haze separates them

This sells a large 3D world using cheap shapes.

Verify parallax in motion.

Do not judge only still screenshots.

---

# 52 — FLOOR / SPIRE CONTACTS

Every new mid/far spire must feel embedded.

At base:

- sink slightly below terrain
- allow overlap with dark floor
- add material-space base occlusion
- do not leave clean floating contact rings

No floating towers.

No perfect circular base outline.

---

# 53 — NO NEW HIGH-RES ASSET PACKS

Do not download:

- HDRIs
- giant rock packs
- 4K cave textures
- volumetric texture packs

This pass should mostly use:

- existing geometry
- generated proxy geometry
- procedural noise
- provided low-frequency guide texture
- current materials

External assets only if absolutely necessary, with license documentation.

Expectation:

none should be required.

---

# 54 — NO HDRI / SKY

No visible HDRI.

No sky.

No sun disk.

No horizon.

This is deep abyss.

A hidden environment map may be used at extremely low intensity for material response only if already present.

Do not make it visible.

---

# 55 — NO DOF AS A CRUTCH

Do not blur the environment with cinematic depth-of-field to hide flaws.

Underwater extinction/haze provides softness.

Hero tentacles must remain crisp.

If subtle DOF is experimentally tested, it must provide obvious value without harming hero clarity.

Default:

no new DOF.

---

# 56 — NO BLOOM AS A CRUTCH

Do not solve bad environment art by raising bloom.

Preserve approved luminous jellyfish character.

Bloom is not a substitute for:

- silhouette
- atmosphere
- occlusion
- hierarchy

---

# 57 — EXPOSURE

Use fixed art-directed exposure.

Do NOT add aggressive auto exposure.

Asset 2 relies on stable deep blacks.

Exposure pumping when a jellyfish enters/leaves frame would ruin the composition.

If exposure changes at all:

it must be extremely narrow and justified.

Preferred:

no change.

---

# 58 — ENVIRONMENT MOTION

Background is calmer than animals.

Allowed:

- tiny fog density drift
- slow suspended particles
- nearly static shafts

Not allowed:

- obvious animated fog texture
- pulsing haze
- moving backdrop
- rapid noise

The environment should feel enormous.

---

# 59 — PHASE ORDER IS MANDATORY

Implement in this exact order.

Do not jump ahead.

## PHASE 0 — QA

- reference pack validation
- QA pose
- capture tool
- metrics script

## PHASE 1 — MACRO COMPOSITION

- abyss backdrop
- far/mid spire field
- spire screen-space fitting
- negative-space layout

No AO.
No shafts.
No new glow.

## PHASE 2 — ATMOSPHERE / VISIBILITY

- distance extinction
- central haze field
- Explore/freecam world fade
- reduce ambient floor visibility
- optional low-frequency guide

No GTAO yet.

## PHASE 3 — LIGHT HIERARCHY

- fake/reused jelly local illumination
- particle-current hierarchy
- tiny benthic response

## PHASE 4 — GROUNDING

- material contact/cavity darkening
- GTAO A/B/C prototype

## PHASE 5 — POLISH

- soft shafts
- subtle dither if needed
- AA experiment if needed
- final composition tuning

At the end of each phase:

CAPTURE.
COMPARE.
MEASURE.
DECIDE.

Do not proceed because code is complete.

Proceed only because the current phase visually passes.

---

# 60 — AUTOMATED LOW-FREQUENCY IMAGE QA

Create:

`scripts/asset2-compare.mjs`
or equivalent.

Given:

- reference image
- baseline capture
- candidate capture

compute at minimum:

1. linear luminance median
2. p90
3. p95
4. p99
5. fraction below 0.01
6. fraction below 0.02
7. center mean
8. border mean
9. center/border ratio
10. bottom-third edge density
11. heavily blurred/downsampled luminance MAE

For low-frequency comparison:

- convert to linear
- blur heavily OR downsample to approximately `64×36`
- normalize only where explicitly documented
- compare large-scale intensity organization

Do not attempt pixel-perfect animal matching.

---

# 61 — RELATIVE IMAGE IMPROVEMENT GATE

Because current/baseline jellyfish motion differs from the still reference, use RELATIVE improvement.

Let:

`E_base`

= low-frequency luminance error between approved M7 baseline and Asset 2.

Let:

`E_candidate`

= same error for candidate.

Before final review:

require approximately:

`E_candidate <= 0.70 * E_base`

as a QA target.

This is not sole approval.

If visual quality is clearly superior but metric misses due hero movement, document it.

Do not distort the scene just to game metric.

---

# 62 — DARK COVERAGE TARGET

Reference:

~91% below linear luminance 0.01.

Candidate final review should be in a similar regime.

Reasonable review target:

roughly `87–94%`

below 0.01,

subject to actual hero phase.

This is a guardrail.

If candidate is 60%:

environment is almost certainly too exposed.

If candidate is 99%:

likely crushed/flat.

---

# 63 — CENTER/BORDER TARGET

Reference:

~5.4×.

Final review target:

approximately `4.2–6.8×`.

Again:

guardrail, not art law.

The important fact:

center and border MUST NOT have nearly identical readability.

---

# 64 — FLOOR EDGE DENSITY

Use Sobel/Canny or equivalent offline QA on bottom third.

Compare:

reference
baseline
candidate

Candidate should move materially toward reference.

Do not reduce edge density by simply blurring the entire frame.

Changes should come from:

- darkness
- fog
- local reveal
- contact grouping

Hero/tentacle edge density is irrelevant to floor metric.

---

# 65 — ABLATION IS REQUIRED

For each new subsystem, produce QA captures with it OFF and ON.

At minimum:

- far spires
- central haze
- outer extinction
- jelly light field
- particle organization
- material AO
- GTAO
- shafts
- low-frequency guide

For each subsystem report:

VISUAL GAIN:
high / medium / low

COST:
- draw calls
- CPU
- frame interval impact
- textures/targets

KEEP:
yes/no

Delete low-gain/high-cost effects.

This prevents “complexity because it sounds advanced.”

---

# 66 — PERFORMANCE BASELINE

Use approved M7 exact runtime as baseline.

Same:

- browser
- backend
- 1280×900 or existing standard benchmark viewport
- DPR 1
- quality
- capture-free timing
- no simultaneous encoding/build/tests

Measure:

1. QA/reference pose
2. normal journey
3. sanctuary
4. Explore near
5. Explore far / abyss
6. M7 settled idle over new environment

Report:

- median frame interval
- p95
- maximum
- >50ms count

Do not call frame intervals GPU timings.

---

# 67 — PERFORMANCE PHILOSOPHY

The user wants a portfolio art piece.

Do not sacrifice the image for tiny synthetic benchmark wins.

But also do not add expensive physical systems whose visual contribution is hidden by darkness.

The right tradeoff:

high-value visual cheats.

Not:

expensive invisible correctness.

---

# 68 — FULL-RES PASS BUDGET

Preserve:

- one graphics context
- one main ocean scene render
- current M3/M7 live target architecture

Do not add:

- another full-resolution scene beauty render
- another renderer
- another whole-world pass

Allowed:

- low-resolution AO
- small procedural atmosphere targets if truly required
- cheap fullscreen output math
- instanced geometry

---

# 69 — RESOURCE BOUNDS

Far-spire archetypes:
shared.

Far-spire instance transforms:
static/deterministic.

Haze geometry:
small bounded count.

Shaft geometry:
small bounded count.

Jelly light uniform arrays:
fixed size.

No per-frame texture creation.

No per-frame BufferGeometry creation.

No per-frame shader material creation.

No listener/resource growth across resize or idle cycles.

---

# 70 — WHOLE JOURNEY VALIDATION

After QA pose looks correct, test the full approved journey.

Inspect:

- opening
- school
- bubble passage
- deep descent
- sanctuary
- reverse travel

Look for:

- sudden fog density changes
- pop-in
- spires appearing through camera
- proxy silhouettes crossing foreground incorrectly
- atmosphere color discontinuity
- M3 bubbles losing contrast
- sanctuary becoming too dark
- hero jelly becoming fogged incorrectly

Fix environment only.

Do not alter cameras.

---

# 71 — VIEW MODES

Test:

- Documentary
- Drift
- Intimate
- Deep
- Explore

Asset 2 reference is optimized around the deep/Drift environment.

Other modes must remain coherent.

Do not introduce mode-specific art hacks unless they are simple bounded weights for atmosphere and clearly necessary.

If mode weighting is used:

central low-frequency reference guide may have:

- Drift/Deep: normal weight
- Documentary/Intimate: reduced weight
- Explore: near zero

World-space fog/spires remain.

---

# 72 — EXPLORE TESTS

Explore from:

- near floor
- between spires
- above sanctuary
- below authored camera level
- outward beyond sanctuary
- side angle to far proxies

The visitor must not see:

- billboard faces
- clean proxy bases
- empty map border
- fog shell
- sharp world fade
- repeated identical spire silhouette at same scale

If they do:

fade earlier or vary proxies.

---

# 73 — PORTRAIT

Test actual portrait emulation.

Need:

- dark edges
- central haze still useful
- no giant proxy dominating entire screen
- spire silhouettes remain layered
- hero remains dominant
- freecam fade still works

Environment-specific deterministic adjustments to proxy placement/visibility are permitted for portrait if necessary.

Do not change camera track.

---

# 74 — M7 GLASS PARITY

Activate approved M7 idle glass over final background.

Verify:

- same live scene still refracts
- one renderer/context
- no new full-res target
- glass remains readable over haze
- dark environment improves rather than destroys clock legibility
- no M7 choreography changes

Do not touch liquid motion.

---

# 75 — TEMPORAL STABILITY

Record at least 30 seconds stationary.

Look for:

- AO crawling
- fog flicker
- shaft aliasing
- dither shimmer
- proxy LOD popping
- unstable particles
- exposure pumping

Background should be calmer than animals.

If an effect is only beautiful in one frame but unstable in motion:

remove/fix it.

---

# 76 — VISUAL FAILURE CONDITIONS

Mark status PARTIAL if ANY of these remain:

- scene is merely “old scene + more fog”
- far world still feels empty instead of deep
- whole floor is uniformly visible
- floor geometry competes with hero
- far spires expose detailed materials
- far spires visibly repeat
- central haze is a visible blob
- fog wall is obvious
- outer world is still readable far outside sanctuary
- Explore exposes level boundary
- tiny glows become neon garden
- GTAO creates black halos
- jellyfish are dirtied by AO
- shafts look like transparent planes
- low-frequency guide looks screen-attached
- background moves too much
- image only matches Asset 2 from one frozen screenshot
- performance cost is disproportionate

---

# 77 — VISUAL SUCCESS CONDITIONS

Status may become:

`READY FOR MANI VISUAL REVIEW`

only if:

## COMPOSITION

- target QA view contains clear multi-depth spire layering
- hero has dark negative space around it
- center has a broad atmospheric opening
- borders are substantially darker
- floor occupies similar perceptual weight to reference

## SCALE

- environment feels far larger than actual map
- overlapping proxies create parallax
- no finite boundary visible

## ATMOSPHERE

- central blue haze separates depth bands
- far silhouettes fade naturally
- no horizon
- no fog shell
- shafts are subtle

## LIGHT

- hero jellyfish remains dominant
- local jelly light reveals floor briefly
- ambient floor fill remains low
- benthic lights remain tiny

## FLOOR

- rough geometry is mostly concealed
- contacts read as grounded
- floor forms group into dark masses
- no obvious low-poly bright shelf edges

## COLOR

- frame remains mostly deep navy/black
- cyan/violet/pink area is limited
- environment does not become globally turquoise

## EXPLORE

- world fades to darkness before boundary/tricks become visible
- proxy parallax works
- extreme-distance world is effectively abyss

## MOTION

- no background flicker
- no obvious cards
- no AO crawl
- no fog pumping

## ARCHITECTURE

- one renderer
- one context
- one ocean scene render
- approved M1–M7 behavior preserved

---

# 78 — RESEARCH SOURCES / ENGINE FACTS

Use these as implementation facts, not aesthetic alternatives.

## THREE.JS FOG

Official docs:

`https://threejs.org/docs/pages/FogExp2.html`

FogExp2 creates a clear near region and rapidly densening far region.

Useful concept for underwater extinction, though project-specific shader control may be preferable.

## THREE.JS GTAO

Pinned r175 contains:

`examples/jsm/tsl/display/GTAONode.js`

Do not upgrade Three.

The implementation supports:

- depth
- optional normals
- depth-derived normals
- `resolutionScale`
- configurable samples/radius/falloff

Start half resolution if used.

## GPU GEMS — VOLUMETRIC LIGHT SCATTERING

`https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process`

Key point:

convincing light scattering can be approximated in screen space and downsampled.

Do not infer that a large physical volume solver is required.

## GPU GEMS — IMPOSTORS

`https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-21-true-impostors`

Key point:

image/proxy methods are a valid way to trade geometry complexity for perceived distant detail, but view-angle error must be controlled.

Our solution prefers low-poly 3D proxies until extreme distance because Explore moves freely.

## REAL-TIME UNDERWATER RENDERING

Computer Graphics Forum 2024, “Real-Time Underwater Spectral Rendering”

Key practical point:

real-time games often use controllable tinted exponential fog and depth-dependent illumination rather than fully physical underwater transport because artistic control and efficiency matter.

That is exactly the philosophy here.

---

# 79 — REQUIRED NEW FILE ORGANIZATION

Prefer a bounded environment module layout such as:

```text
src/scene/environment/
  AbyssBackdrop.js
  FarSpireField.js
  OceanAtmosphere.js
  EnvironmentLightField.js
  asset2Config.js
```

This naming is a recommendation, not mandatory if the current structure has a more natural location.

Do not scatter Asset 2 logic through unrelated animal classes.

Sanctuary material integration may remain in:

`src/scene/sanctuary/materials.js`

Existing particle integration may remain in current M2 files.

Keep responsibilities clear.

---

# 80 — CONFIGURATION

Create one explicit config object for this pass.

No dozens of unexplained magic numbers embedded across shaders.

At minimum group:

- abyss colors
- spire bands/counts
- fog/extinction
- central haze
- world fade
- local jelly lighting
- particle hierarchy
- AO
- shaft parameters
- optional low-frequency guide

Document units/normalization.

Production UI must not expose tuning controls.

DEV QA may.

---

# 81 — DO NOT LET CODEX “BE CREATIVE” ABOUT THE GOAL

When uncertain:

look at the reference pack.

Priority:

`REF_00`
then
`REF_01 / REF_02`
then
specialized atlas for subsystem.

Do not replace a target with “something cinematic.”

Do not invent a new color palette.

Do not redesign environment theme.

The reference already made those decisions.

---

# 82 — REQUIRED EVIDENCE

Produce a local evidence viewer.

Required stills:

1. `REF_00_ASSET2_ORIGINAL`
2. approved M7 baseline at QA pose
3. final candidate at QA pose
4. grayscale comparison
5. blurred low-frequency comparison
6. luminance false-color comparison
7. spires OFF / ON
8. haze OFF / ON
9. local jelly light OFF / ON
10. material AO OFF / ON
11. GTAO OFF / ON if retained/prototyped
12. shafts OFF / ON
13. low-frequency guide OFF / ON if retained
14. Drift final
15. Deep final
16. Documentary final
17. Intimate final
18. Explore near
19. Explore outer fade
20. Explore abyss/void
21. portrait
22. M7 idle over final environment

Required motion clips:

A. 20 s stationary QA pose
B. journey descending into deep environment
C. jellyfish crossing near floor showing local illumination
D. Explore orbit through real + proxy spires
E. Explore outward flight from core → fade → abyss → void
F. M7 idle entry/settled/exit over final environment
G. reverse journey
H. portrait motion

Actual browser footage only.

No offline cinematic render.

---

# 83 — PERFORMANCE EVIDENCE

Capture-free benchmark only.

Report:

- baseline exact full SHA
- candidate full SHA
- hardware/browser/backend
- viewport/DPR
- quality settings

For each:

QA pose
normal journey
sanctuary
Explore near
Explore far
M7 idle

Report:

- median frame interval
- p95
- max
- >50ms

Also:

- draw calls
- triangles
- environment CPU update
- texture count
- render target count
- context count

Separate art capture from benchmark.

---

# 84 — TESTS

Run all existing tests.

Preserve:

- animal parity
- M2 current behavior
- M3 optics
- M4 population/LOD
- M5 camera/View/scroll
- M6 sanctuary
- M6.6.1 malformed input guard
- M7 one-renderer idle

Add only stable environment tests:

- deterministic spire archetypes
- deterministic spire transforms
- bounded instance count
- finite spire geometry
- finite atmosphere parameters
- finite local-light uniforms
- fixed maximum local jelly lights
- world fade monotonicity
- no extra ocean render
- one renderer/context
- resource counts stable after resize/idle cycles

Do not encode “looks like Asset 2” into brittle unit tests.

Visual QA owns aesthetics.

---

# 85 — FINAL REPORT FORMAT

Return exactly these sections.

## STATUS

`READY FOR MANI VISUAL REVIEW`
or
`PARTIAL`
or
`BLOCKED`

## GIT

- approved M7 full baseline SHA
- result runtime SHA
- branch
- runtime files changed

## REFERENCE MATCH

- baseline low-frequency error
- candidate low-frequency error
- relative improvement
- luminance statistics
- center/border ratio
- dark-pixel coverage
- floor edge-density comparison

## ENVIRONMENT STACK

For each:

- abyss
- far spires
- mid spires
- near geology
- atmosphere
- particles
- benthic glows
- jelly local lighting
- AO
- shafts

state:

implementation
visual purpose
performance cost

## SPIRES

- archetype count
- instance count
- target screen-space fitting method
- draw calls
- placement/depth bands
- Explore behavior

## ATMOSPHERE

- extinction formula
- central haze implementation
- outer-world fade
- RGB attenuation
- optional guide usage and angular fade
- shaft method

## LIGHTING

- ambient change
- local jelly light selection
- max lights
- falloff
- environment reveal behavior
- benthic light hierarchy

## AO

- material-only result/cost
- GTAO result/cost
- final selected method
- reason

## CHEATS

List every intentional rendering cheat.

This is a POSITIVE section.

For each:

- what is fake
- why it is cheaper
- why the visitor should not notice

## PERFORMANCE

Full before/after measurements.

## VALIDATION

- tests
- build
- parity
- full journey
- all Views
- Explore
- portrait
- M7 idle
- repeated lifecycle/resources

## LIMITATIONS

Be explicit.

Do not claim:

- WebGPU
- physical mobile
- Safari
- other GPUs

unless actually tested.

## SCOPE CONFIRMATION

Confirm:

- M1–M7 preserved
- no Three upgrade
- no actual ray tracing
- cameras unchanged
- View unchanged
- scroll unchanged
- M7 choreography unchanged
- one renderer
- one context
- one ocean render
- M8 not started
- nothing pushed/merged/deployed
- Pages unchanged

---

# 86 — STOP CONDITION

When all phases are complete:

STOP.

Do not self-start another beauty pass.

Do not start M8.

Do not deploy.

Do not “improve” jellyfish.

Present the evidence and wait for Mani’s visual approval.

---

# 87 — FINAL HUMAN TEST

Ignore implementation sophistication.

Open:

`REF_00_ASSET2_ORIGINAL.png`

beside the final live browser candidate.

Ask only:

Does this feel like the SAME WORLD?

Specifically:

- same darkness hierarchy?
- same giant abyss?
- same layered spire depth?
- same blue central atmosphere?
- same negative space?
- same selective floor visibility?
- same jellyfish-as-light-source illusion?
- same tiny benthic points?
- same feeling that the world continues beyond what is visible?

If the answer is “the candidate is prettier than before but still obviously the old finite Three.js level”:

STATUS = PARTIAL.

If the candidate feels like Asset 2 became interactive:

STATUS = READY FOR MANI VISUAL REVIEW.

That is the target.
