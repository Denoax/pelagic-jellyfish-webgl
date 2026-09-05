# Fresh capture notes — revision 92e61b0

Research only. Desktop Brave/ANGLE OpenGL on RTX 4070, 1440×900 unless stated. Saved images are actual browser captures, not generated references. Render snapshots do not measure presented FPS.

1. `01-surface.png`: live ocean works and negative space is calm. Hero has colored internal anatomy, but concentric bell lines and long bright cords feel diagrammatic. Background animals differ sharply in anatomy and tissue thickness. Small flecks still form a conspicuous colored cloud. Screenshot has soft/dotted thin detail; need distinguish raster resolution from geometry/material filtering.
2. `02-idle-default.png`: accepted as evidence of a faulty-looking idle state, not as a successful clock reference. Fullscreen droplets render over the ocean; no visible clock in this frame. `getState()` later reports a valid clock key and completed transition. Root cause not established. Droplets repeat at similar scale; tiny bright rims compete with the organism. Need repeated/minute-rollover evidence.
3. `03-idle-sweep.png`: inspected. Fullscreen small cells remain visible; clock is still not visible, so this is not proof that digit deformation succeeds. Escape subsequently dismissed idle, with no navigation or page reset. Its mouse displacement should be evaluated separately from the clock mask issue.
4. `04-midwater.png`: 49% progress, aggregation shot. Multiple hero-scale animals and recognizable depth overlap, but particle density obscures anatomy and one animal crops awkwardly at the left edge. Background animals remain clear enough to reveal the less developed model. Code reports 1.497° bank, not a barrel roll. A screenshot alone does not prove camera jank.
5. `05-deep-approach.png`: 82% progress. Long twilight survives and animals stay visible. Central pair dominates; surroundings remain almost empty, with mostly particles rather than directional water structure. Does not justify filling it with coral or text.
6. `06-seafloor.png`: final frame. Terrain boundaries are not visible in this capture; the near geology reads as a textured shelf, but silhouette progression and local lighting are weak. Orange emission appears as disconnected bright dots/lines rather than convincing hot crust. Thin vertical props look pole-like. Main featured animal is partly outside the frame; the endpoint lacks a deliberate visual culmination. This is an art-direction finding, not evidence that geometry failed to load (runtime reports assetsReady).

Desktop DOM: header links are 44px tall; footer links are only 13px tall. Their small glyphs are not a reliable measure of hit target quality. Footer target spacing and touch behavior need separate evaluation. User asked for almost no text; do not interpret that as authorization to restore service copy or a HUD.

7. `07-seafloor-motion.png`: excluded from motion evidence; the delayed capture ran after idle activated. Do not treat it as the second frame of a short seafloor sequence.
8. `08-portrait.png`: inspected, 390×844 emulation. No horizontal overflow. Hero sits low/right with considerable upper empty area; footer very small. Same desktop GPU, not real mobile testing.
9. `09-idle-repeat.png`: fresh navigation with `?idle=6`; clock clearly visible as 04:41, fullscreen cells and ocean present. Runtime transition=1, floatTargets=true. Initial missing clock is intermittent/unexplained, not an established universal failure.
10. `10-click-response.png`: inspected; actual pointer click targeted animal 0 and activation count changed 0→1. Bell brightens; particle cloud remains visually competitive. No normal-session console error.
11. `11-blocked.png`: inspected. Forced graphics denial shows fallback image, readable failure copy, and compatibility link. Expected graphics error recorded. This does not verify successful recovery under persistent denial.
12. `12-final-hold.png`: inspected after a clean 12-second traversal and a subsequent hold. No plane edge visible; dark faceted objects, thin upright props, and isolated emissive cracks remain visually unconvincing. Confirms endpoint composition issue is not just a mid-scroll screenshot.
13. `13-return-surface.png`: inspected. Actual click on the footer return link reached scrollY=0 and hash=#intro; ocean still live, no normal-session errors. Confirms pointer navigation, not keyboard compliance.

Reference acceptance:

- Medusae rest and motion frames inspected. Different mantle/crown contours, dim peripheral particulate, unified translucent body. Legacy control labels are missing/unhelpful in this environment.
- FluidGlass rest and sweep inspected. Sweep produces connected flowing bands over clock and cells; regular small cells also appear, so do not describe reference topology as entirely non-repetitive.
- Volatile Nexus inspected after load. Transparent ring, refracted cubes, floor reflection. Detailed physics claims come from the author's walkthrough, not still image inference.
- Nature Beyond entry inspected and accepted. Scroll capture is a scanning transition, not accepted as a completed later chapter; later-scene techniques are author-described only.
- Xylophone hover inspected. Clear local color/shape variation; audio was not evaluated.

Performance: separate `performance-clean.json` contains no screenshots. Opacity-filtered entry: 179 samples, p95 16.7 ms, max 16.8 ms; fully visible idle: 34 samples (short window), p95/max 16.8 ms; exit: 156 samples, p95 16.7 ms, max 16.8 ms. Startup long task 989 ms, later prewarm-correlated task 179 ms. Browser callback intervals are not hardware GPU timing.

Separate 12-second programmatic native-scroll traversal: 706 post-settle callback samples, p95 16.7 ms, max 16.8 ms, zero above 33.4 ms. `scroll-clean.json` stores raw frames. This checks rendering during changing scroll position, not real trackpad inertia, wheel-event bursts, reverse input, or weaker-device behavior.
