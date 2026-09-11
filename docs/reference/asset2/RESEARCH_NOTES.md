# Research notes used to constrain the implementation

These notes are informational. The supplied Asset 2 remains the art source of truth.

## Three.js fog

Official Three.js FogExp2 documentation:
https://threejs.org/docs/pages/FogExp2.html

Relevant engineering point:
FogExp2 is designed to leave the near region comparatively clear while density rises
rapidly with distance. This supports the intended 'finite world disappears into abyss'
cheat, although custom environment-material extinction is preferred if global fog
would interfere with approved transparent jellyfish.

## Three.js GTAO

Pinned Three.js r175 contains:
examples/jsm/tsl/display/GTAONode.js

The implementation accepts scene depth, optional normals, can reconstruct normals
from depth, exposes resolutionScale, and exposes sample/radius/falloff controls.
The production prompt therefore authorizes a half-resolution GTAO prototype without
upgrading Three.js. It must be rejected if it dirties the transparent hero or requires
a second ocean scene render.

## Real-time volumetric scattering

GPU Gems 3, Chapter 13:
https://developer.nvidia.com/gpugems/gpugems3/part-ii-light-and-shadows/chapter-13-volumetric-light-scattering-post-process

Relevant engineering point:
Convincing atmospheric/light-shaft effects can be approximated in image space, can
be downsampled, and do not require a complete participating-media solver.

## Impostors / distant-detail cheats

GPU Gems 3, Chapter 21:
https://developer.nvidia.com/gpugems/gpugems3/part-iv-image-effects/chapter-21-true-impostors

Relevant engineering point:
Image/proxy representations are valid for distant complexity, but ordinary impostors
lose correctness as viewing angle diverges. Because Explore is free-camera, the prompt
uses cheap true 3D proxy spires for mid/far bands and allows image-based cheats only
where fog removes them before angle error becomes obvious.

## Underwater rendering

Computer Graphics Forum 2024:
Real-Time Underwater Spectral Rendering
https://onlinelibrary.wiley.com/doi/10.1111/cgf.15009

Relevant practical point:
Real-time games commonly prefer controllable depth/tinted-fog approximations over
fully physical spectral light transport when artistic control and runtime cost matter.
The Asset 2 pass intentionally follows that philosophy.
