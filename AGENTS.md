# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Selected direction and durable decisions

- Source visual: `/home/mani/.codex/generated_images/01a06455-c046-7731-86c0-4bff2a8e811c/exec-b8beb4e1-3994-4ff2-b159-f3b2d1f10a85.png` (the third displayed ideation result selected on 2026-09-03).
- Preserve the abyssal near-black water, central blue-white bioluminescent moon jelly, large areas of negative space, sparse editorial serif copy, tiny monospaced depth instrumentation, and spatially occluded capability language.
- The main experience must be real-time 3D geometry. Use the vendored MIT Aurelia WebGPU simulation for deforming bells, Verlet tentacles and oral arms, autonomous swimming, background groups, plankton and god rays. Do not render a raster jellyfish in the live scene.
- Treat `https://milcktoast.com/medusae/` as the primary anatomy, soft-body, particulate-density, and interaction reference; use `https://jellyfish-sage.vercel.app/` for the restrained editorial framing and biological translucency.
- A jellyfish must read as one coherent organism: never layer a separately drifting bell over disconnected line tentacles. Favor a broad translucent mantle, a luminous internal crown, soft oral arms, tapered constrained tentacles, and localized suspended particulate.
- Keep the opening in open water. Do not reintroduce coral or reef props until they can match the organism's visual fidelity and preserve the quiet-water area behind copy.
- Cursor movement must behave like a water current: affect nearby jellyfish orientation/propulsion, leave a visible wake in the water field, and decay naturally after movement stops.
- Jellyfish are interactive organisms. Clicking or tapping an individual animal should trigger a localized bioluminescent wave and a restrained physical recoil, then decay naturally; each animal must respond independently.
- Bell deformation must remain clearly visible without relying on tentacle motion: use a fast contraction, slower recovery, delayed rim response, current-driven shear, and subtle organic asymmetry. The frill, internal crown, and tentacle roots must share the same pulse state.
- Keep the interface extremely sparse. No motion toggle, demo buttons, card grids, index overlay, decorative pills, project/service copy, depth readout, or nonessential controls. Retain only quiet identity, GitHub, attribution, return navigation, and invisible accessibility affordances.
- Keep editorial headings broad and intentionally composed, generally as two balanced lines. Avoid narrow measures that stack one or two words per line and visually clutter the ocean.
- Build one continuous native-scroll descent. The fixed living scene persists while semantic content appears as quiet discoveries in the water; the environment darkens and the jelly's glow intensifies with depth.
- Camera choreography must feel like an authored pelagic dive, not a horizontal pendulum: move continuously around the subject in mostly one orbit direction, travel meaningfully through depth and elevation, track a separate point of interest, and use only restrained curvature-driven bank. Never add barrel rolls, automatic idle spinning, scroll hijacking, or cursor-steered camera rotation.
- Do not use conventional card grids, bright section slabs, a large navbar, generic portfolio chrome, or CSS-looking cyan-purple gradients. Natural image lighting, tissue scattering, refraction, and localized biological color are allowed.
- The original WebGL liquid-lens idle screen is now a text-free visual showcase: retain only the living hours-and-minutes clock, extend the small fluid cells across the entire viewport, and morph between minutes rather than hard-cutting the time. It begins after 30 seconds of inactivity and dismisses through click/tap or Enter/Escape/Space without a visible instruction label.
- This repository is now presented as a visual art project. Keep the scroll chapters as invisible choreography tracks and do not reintroduce visible middle-page headlines, descriptions, project labels, service copy, depth readouts, or scroll instructions. The only persistent visible DOM chrome is `MANI MARAMI MILANI` plus `GITHUB` at the top-right, `@DENOAX`/copyright at the bottom-left, and `RETURN TO THE SURFACE` at the bottom-right. The top-right GitHub label opens `https://github.com/Denoax`.
- The idle pointer ripple is an occasional, extremely slow disturbance rather than continuous cursor feedback: require purposeful pointer speed, enforce roughly a 14-second cooldown, and decay the impulse gently.
- Jellyfish leave a shot by swimming beyond the frame at stable physical scale. Never use lifecycle scale-down as a disappearance effect; reserve opacity loss for the final off-screen depth-haze interval.
- The idle transition must never produce an opaque black frame or cover the living ocean before its visual layer is ready. Preserve the live scene beneath the idle treatment and reveal only a successfully prepared enhancement.
- The FluidGlass project is interaction inspiration only; its unlicensed source, shaders, assets, composition, and clock design must not be copied.
- Reduced-motion users do not receive the animated idle screen.
- Jellyfish translation must be visibly driven by bell kinematics: a fast contraction creates the main acceleration, slower elastic refill creates drag plus secondary thrust, and an interpulse coast follows. Do not animate continuous path-gliding independently of the bell pulse; tentacles and oral arms must lag the resulting body acceleration and turns.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
