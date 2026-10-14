# Deep-view banner capture

`pelagic-sanctuary-clean-loop.gif` shows only Pelagic's original native jellyfish and rock-lit deep ocean. Capture-only CSS hides every DOM overlay except the original ocean canvas: all text, eyebrows, navigation, buttons, view/settings controls, footer, debug overlays and cursor are absent. The website source and its normal controls remain unchanged.

The native `D` camera stays at journey progress 1 and FOV 50. The 1215 × 432 capture has the identical 45:16 aspect ratio of the earlier 1440 × 512 capture, with the same desktop population and camera framing. It is downsampled to the 990 × 352 banner canvas. The basalt sanctuary, coupled lighting, anatomy, materials and motion solvers are unchanged. This export uses the original scene, not the portfolio embed or a substitute animal.

The existing `oceanPreview` authoring fixture advances simulation in 1/60-second steps. Capture-only RAF scheduling invokes the original animation callbacks and waits for each software GL submission to finish, preventing idle redraws from accumulating behind screenshots. No simulation, renderer or application source is replaced. 240 source frames cover 8 seconds, sampled at 30 fps. The first 1.5 seconds are omitted while the native idle-glass effect clears; retained frames 45–239 show only the original ocean. The existing 0.5-second tail-to-head lap dissolve closes those 195 source frames into a 180-frame, 6-second infinite loop. This is an edited native-renderer export, not an unedited idle recording.

Output: 990 × 352, 256-color GIF with 30/40 ms frame delays. File cadence is not measured device performance. The capture used Chromium's ANGLE SwiftShader software WebGL renderer after a hardware-context initialization failure; exact renderer identity is retained in the record. No lighting/exposure replacement, anatomy changes, generated media or motion interpolation were used.

The earlier banner and other demonstration clips remain historical assets. Exact source revision, native state, capture-only CSS, renderer identity, file measurements and SHA-256: [motion-source.json](motion-source.json).
