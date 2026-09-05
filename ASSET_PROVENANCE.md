# Asset provenance

Reviewed: 2026-09-03

## Production assets

### Aurelia procedural jellyfish ecosystem

- Files: `src/vendor/aurelia/`
- Canonical source: `https://github.com/holtsetio/aurelia`
- Creator: Niklas Niehus / Holtsetio
- License: MIT; full notice bundled at `licenses/Aurelia-MIT.txt`
- Date integrated: 2026-09-03
- Production use: Three.js scene foundation, lights and plankton with WebGPU/WebGL 2 backends. Visible animals now use `LivingAppendages` and `JellySchoolDirector`; hidden legacy animals and their GPU spring buffers are not initialized. Production uses the direct render path, not the inherited MRT bloom chain.
- Modifications: removed the debug/info interface; added configurable population count, cleanup hooks, blue-white bioluminescent material colors, authored camera/swarm choreography, scroll depth, and cursor-current uniforms
- Required attribution: retain the bundled copyright and MIT permission notice in distributions containing substantial portions of the source

### Smithsonian Open Access coral specimens

- Files: `public/assets/models/smithsonian-pocillopora.glb`, `public/assets/models/smithsonian-diploria.glb`, and `public/assets/models/smithsonian-acropora-palmata.glb`
- Source: Smithsonian National Museum of Natural History / Smithsonian 3D API
- Specimens: *Pocillopora damicornis caespitosa*, *Diploria labyrinthiformis*, and *Acropora palmata*
- Source packages: `3d_package:14eb9321-2308-4878-8adb-831d078ba0b0`, `3d_package:87738412-3acd-45d1-bff4-3ab67093470e`, and `3d_package:6fd30c79-3345-4d06-b27c-99d5b320ce5f`
- License: Smithsonian Open Access / CC0
- Production use: real scanned coral geometry and textures distributed across the living seabed
- Modifications: textures resized from 2048px to 1024px and background-detail meshes simplified for web delivery; normalized scale and origin at runtime; cooler underwater material tint, reduced environment intensity, partial seabed burial, varied scale and rotation
- Required attribution: none; provenance is retained here for transparency

### Accessibility and graphics-recovery artwork

- Files: `public/assets/generated/abyssal-jellyfish-poster-v1.webp` and `public/assets/generated/abyssal-jellyfish-icon-v1.webp`. The poster appears only with reduced motion or when graphics are unavailable, never during normal startup. It does not replace the successfully running 3D scene.
- Creator: OpenAI ImageGen, directed by Codex for Mani Marami Milani
- Source: generated specifically for this project on 2026-09-03 after Mani selected the third displayed abyssal concept
- Reference inputs: the selected project mock and a CC BY moon-jelly research image by foxcc
- Reference use: composition, lighting, and biological guidance only; the research image is not shipped
- Modifications: all mock UI and typography removed during generation; production PNG compressed to WebP at quality 88; icon cropped from the same generated scene
- License/status: original generated project asset; review final usage under the applicable OpenAI terms before commercial launch
- Required attribution: none in the interface

### Archived sunlit moon jelly hero

- File: `../source-assets/archive/sunlit-moon-jelly-hero.webp`
- Creator: OpenAI ImageGen, directed by Codex for Mani Marami Milani
- Source: generated specifically for this project on 2026-09-03
- Reference inputs: the selected project mock and a CC BY moon-jelly research image by foxcc
- Reference use: layout and biological guidance only; neither source image is shipped as the hero
- Modifications: compressed from the generated PNG to WebP at quality 88
- License/status: original generated project asset; review final usage under the applicable OpenAI terms before commercial launch
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

### Original liquid field

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
- Production rule: no source, shader, image, clock layout, or asset from FluidGlass is included. The idle screen is an independent Three.js shader using original metaball/lens math and this project's own composition.
