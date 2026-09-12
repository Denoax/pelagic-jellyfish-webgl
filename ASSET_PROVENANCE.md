# Asset provenance

Publication review: 2026-09-11, runtime `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.

Original code is MIT. Original paper, documentation, diagrams and project-generated publication media are CC BY 4.0, to the extent the author holds applicable rights. Third-party exceptions below remain controlling. See [LICENSE.md](LICENSE.md). Codex/OpenAI assisted implementation, writing and publication tooling under Mani Marami Milani's direction. Primary publication frames and videos are actual approved-runtime browser captures, not AI-generated illustrations.

## Production assets

### Aurelia procedural jellyfish ecosystem

- Files: `src/vendor/aurelia/`
- Canonical source: `https://github.com/holtsetio/aurelia`
- Creator: Niklas Niehus / Holtsetio
- License: MIT; full notice bundled at `licenses/Aurelia-MIT.txt`
- Date integrated: 2026-09-03
- Production use: scene foundation and renderer integration. Visible animals use the approved procedural anatomy and `PopulationAnimal` detail adapter. Hidden legacy GPU animals are not initialized. Production uses direct output outside optical activity and the shared live-color compositor during bubbles, thermal shimmer and idle; inherited MRT bloom is off. Actual publication evidence uses WebGL2; the renderer class name does not validate hardware WebGPU.
- Modifications: removed the debug/info interface; added configurable population count, cleanup hooks, blue-white bioluminescent material colors, authored camera/swarm choreography, scroll depth, and cursor-current uniforms
- Required attribution: retain the bundled copyright and MIT permission notice in distributions containing substantial portions of the source

### Smithsonian Open Access coral specimens

- Files: `public/assets/models/smithsonian-pocillopora.glb`, `public/assets/models/smithsonian-diploria.glb`, and `public/assets/models/smithsonian-acropora-palmata.glb`
- Source: Smithsonian National Museum of Natural History / Smithsonian 3D API
- Specimens: *Pocillopora damicornis caespitosa*, *Diploria labyrinthiformis*, and *Acropora palmata*
- Source packages: `3d_package:14eb9321-2308-4878-8adb-831d078ba0b0`, `3d_package:87738412-3acd-45d1-bff4-3ab67093470e`, and `3d_package:6fd30c79-3345-4d06-b27c-99d5b320ce5f`
- License: Smithsonian Open Access / CC0
- Current status: retained historical assets, not active geometry in the approved basalt sanctuary. Earlier scenes distributed the scanned specimens across a living seabed; that is not a current-runtime claim.
- Modifications: textures resized from 2048px to 1024px and background-detail meshes simplified for web delivery; normalized scale and origin at runtime; cooler underwater material tint, reduced environment intensity, partial seabed burial, varied scale and rotation
- Required attribution: none; provenance is retained here for transparency

### Accessibility and graphics-recovery artwork

- Files: `public/assets/generated/abyssal-jellyfish-poster-v1.webp` and `public/assets/generated/abyssal-jellyfish-icon-v1.webp`. The poster appears only with reduced motion or when graphics are unavailable, never during normal startup. It does not replace the successfully running 3D scene.
- Creator: OpenAI ImageGen, directed by Codex for Mani Marami Milani
- Source: generated specifically for this project on 2026-09-03 after Mani selected the third displayed abyssal concept
- Reference inputs: the selected project mock and a CC BY moon-jelly research image by foxcc
- Reference use: composition, lighting, and biological guidance only; the research image is not shipped
- Modifications: all mock UI and typography removed during generation; production PNG compressed to WebP at quality 88; icon cropped from the same generated scene
- License/status: original generated project asset, included under the original-content policy to the extent applicable rights exist; no assertion that generation establishes copyright. Third-party reference inputs are not redistributed.
- Required attribution: none in the interface

### Archived sunlit moon jelly hero

- File: `../source-assets/archive/sunlit-moon-jelly-hero.webp`
- Creator: OpenAI ImageGen, directed by Codex for Mani Marami Milani
- Source: generated specifically for this project on 2026-09-03
- Reference inputs: the selected project mock and a CC BY moon-jelly research image by foxcc
- Reference use: layout and biological guidance only; neither source image is shipped as the hero
- Modifications: compressed from the generated PNG to WebP at quality 88
- License/status: original generated project asset, covered by the original-content policy to the extent applicable rights exist; no assertion that generation establishes copyright. The archived file is not primary publication evidence.
- Required attribution: none in the interface

### Archived sunlit moon jelly icon

- File: `../source-assets/archive/moon-jelly-icon.webp`
- Source: a square crop of the generated sunlit moon-jelly hero above
- Modifications: cropped from the left side and resized to 96 × 96 pixels
- Required attribution: none in the interface

### Portfolio gravity image

- File: `public/assets/projects/portfolio-gravity.jpg`
- Source: Mani's local portfolio repository, `attractors-main/attractors-main/img/preview.jpg`
- Creator/owner: Mani Marami Milani
- Use: selected-work image for Mani's own project

### Poly Haven geology

- Existing CC0 sources: [Rock 07](https://polyhaven.com/a/rock_07), [Rock 09](https://polyhaven.com/a/rock_09), [Moon Rock 02](https://polyhaven.com/a/moon_rock_02).
- Earlier processing is documented in `public/assets/models/README.md`.
- This pass reuses the existing Rock 07 albedo as a triplanar layer blended with procedural sediment. No new third-party asset was downloaded. Filenames retain `1k`, but the earlier optimized textures are 640px.

### Current original liquid field

- Active code: `src/scene/glass/OceanIdleGlass.js`, `IdleDisplacement.js`, `IdleLiquidState.js`, `LiquidChoreography.js` and `LiveOceanLens.js`.
- The approved M7 TSL implementation uses two signed RGBA16F field targets and the same renderer/context as the ocean. It genuinely distorts the current clean ocean image. It is not full Navier–Stokes, mass-conserving topology or exact multilayer optical transport.
- The current M7 path does not implement the legacy packed RGBA8 fallback. Hardware compatibility must be recorded, not inferred from the older implementation.
- No FluidGlass code, shaders or assets were copied. Original implementation and publication diagrams are by the project, with Codex/OpenAI assistance.

### Historical separate idle field — inactive

- `IdleGlassScene.jsx`: original fixed-step spring/advection simulation, paired render targets, smooth droplet level sets, clock texture morph and normal-based shading.
- Half-float devices store signed velocity/displacement around zero. Other WebGL 2 devices use packed 16-bit displacement in RGBA8 and a simpler damped flow model.
- No FluidGlass or third-party fluid shaders were copied. This is not full Navier–Stokes or refraction of the actual ocean framebuffer.

## Fonts and icons

- Cormorant Garamond: bundled through `@fontsource/cormorant-garamond`; SIL Open Font License 1.1.
- Instrument Sans: bundled through `@fontsource/instrument-sans`; SIL Open Font License 1.1.
- IBM Plex Mono: bundled through `@fontsource/ibm-plex-mono`; SIL Open Font License 1.1.
- Phosphor Icons: bundled through `@phosphor-icons/react`; MIT License.

## Interaction reference not copied

- Reference: `https://chiuhans111.github.io/fluidglass/`
- Repository: `https://github.com/chiuhans111/fluidglass`
- Observed technique: interactive liquid/glass field around a clock, described by its author as reaction diffusion, Navier–Stokes, and a glass shader.
- License review: no license file was present in the repository on 2026-09-03.
- Production rule: no source, shader, image or asset from FluidGlass is included. Its visual behavior informed direction; current independent TSL code uses this project's implicit topology, deformation and live-ocean composition. The reference is not relicensed by this repository.

## Publication-only media

- Files: `paper/figures/`, `paper/media/` and staged supplemental-media MP4s.
- Author: Mani Marami Milani, with Codex/OpenAI-assisted capture, diagram and document tooling.
- Browser evidence: approved runtime SHA and renderer/configuration in adjacent JSON metadata. No unapproved Asset2 frames are primary results.
- Original explanatory diagrams are identified as such; no external paper figures or website screenshots were copied into the publication.
- Original contribution license: CC BY 4.0; visible third-party contributions retain their respective source licenses. Aurelia's MIT notice and Poly Haven's CC0 provenance remain applicable.
