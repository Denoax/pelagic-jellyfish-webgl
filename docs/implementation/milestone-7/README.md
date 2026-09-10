# M7 — Ocean-to-glass idle integration

**Status: PARTIAL.** The single-renderer live-ocean integration, persistent
deformation, clock lifecycle, resource ownership and WebGL2 validation work.
The full artistic liquid gate is not claimed: droplet-to-clock coalescence and
bridge/separation are still too subtle/authored, and numeral change reads as
erosion→bead→regrowth rather than convincing flowing material. The evidence is
ready to inspect; automated success is not visual approval. No M8 work.

## Review now

- [Candidate, five-second idle](http://127.0.0.1:5215/?renderer=webgl&idle=5)
- [Candidate, normal 30-second idle](http://127.0.0.1:5215/?renderer=webgl)
- [Actual clips and matched frame gallery](http://127.0.0.1:5216/)
- [Sanctuary motion](http://127.0.0.1:5216/motion/sanctuary/motion.mp4)
- [Portrait motion](http://127.0.0.1:5216/motion/portrait/motion.mp4)
- [Approved baseline](http://127.0.0.1:5213/?renderer=webgl&idle=5)

Move across the glass to stretch it; movement does not dismiss. Click/tap,
Enter, Escape or Space begins dissolution and restores control. The dismissal
is consumed before animal/View input. Ocean life continues while the exact
camera/journey pose is held. The world is not recreated on entry or return.

Repository: `Denoax/pelagic-jellyfish-webgl`.
Worktree: `/home/mani/dev/jellyfish-studio/m7-ocean-glass`.
Branch: `milestone-7-ocean-glass-integration`.
Approved baseline: `046430847448206cfc58ce84758d9410121a97d3`.
Measured runtime: `e666b34f11f9867dc59f698ff07ebf2c50daf618`.
Subsequent report/tool commits contain no runtime changes; final local HEAD is
reported in the handoff. Baseline and unrelated dirty `site` worktree preserved.

The current public site was actually rendered and recorded. Latest successful
Pages workflow identifies `a2ed3bc89c700ba5c792ecac19747939e9f09b8d`, not M6.6.1.
It remains unchanged. [AUDIT.md](AUDIT.md) records the late public-inspection
protocol deviation and exact public bundle names; no invented release parity.

## What changed

The production idle component no longer creates a second graphics context.
The legacy implementation is preserved but no longer imported by production.
Idle extends M3's clean live-ocean optical output, sharing the main renderer and
scene target with the existing bubble/thermal path. No extra ocean render,
full-resolution ocean copy, static screenshot, prerecorded texture or bloom
substitute. Three stays **0.175.0**; React/Vite and renderer family unchanged.

The live jellyfish, tentacles, particles, vent/plume and rocks bend through the
clock's scalar thickness/normal field. Two low-resolution signed RGBA16F
targets retain displacement/velocity. The sparse droplet masses and blurred
glyph masks share an implicit surface. This permits connected boundaries but
does not yet make every merge/pinch visually convincing. Strong input can make
pointed narrow folds. There is no mass conservation or volumetric glass solver.

Entry grows local lenses then the clock field over roughly seven seconds.
Clock updates use changed-digit erosion and regrowth over 2.8 seconds, not
opacity-overlapping complete numerals. Dismissal dissolves over 0.85 seconds.
Landscape uses HH:MM; portrait stacks HH/MM. No seconds or new public controls.

Runtime files changed:

- `src/App.jsx`, `src/core/useIdleScreen.js`, `src/ui/IdleScreen.jsx`,
  `src/styles.css`: idle readiness, capture-phase dismissal and semantic chrome.
- `src/scene/HeroScene.jsx`: idle ref, hold camera calls only, serialized quiet
  prewarm after ready, local diagnostic hooks.
- `src/scene/glass/LiveOceanLens.js`: clean-source idle output and awaited
  preparation/simulation teardown ownership.
- `src/scene/glass/OceanIdleGlass.js`: topology, masks, optics and lifecycle.
- `src/scene/glass/IdleDisplacement.js`: low-resolution TSL spring/advection.
- `src/scene/glass/IdleLiquidState.js`: bounded deterministic state helpers.

No approved animal, population, camera track, View/scroll, current/wake, bubble
optical formula, seabed, sanctuary material or M6.6.1 finite-input guard was
redesigned. Their existing source is protected by focused byte/parity tests.

## Validation and cost

- Production build PASS; 118/118 Node tests PASS. No general `npm test` script.
- Approved motion: 720 frames / 24 checkpoints, exact geometry/appendage state
  and equal activation. Default animal: 240 frames / eight exact checkpoints.
- Twenty repeated idle cycles, all View modes/Explore, resize, hidden return,
  multi-minute idle and actual/deterministic minute change exercised in Brave.
- Native GPU handles stable over twelve resizes. One graphics context, not two.
  Roughly one extra 256×180 simulation draw per idle frame, no extra ocean draw.
- Non-idle medians remain 16.7 ms. Idle p95 costs up to +1.6 ms in sanctuary;
  continuous-pointer p95 improves 19.9→18.1 ms in these single runs. No >50 ms
  intervals in the steady-state comparisons. No resolution/quality reduction.
- One-time prewarm is not free: inclusive preparation frame 139.3 ms versus
  legacy 188.6 ms in the entry trace. No first-idle compilation stall appeared.

Full details: [architecture](IMPLEMENTATION.md), [validation and evidence
provenance](VALIDATION.md), [nine-case performance table](PERFORMANCE.md).
Frame intervals are not GPU timings. Compatibility is tested on actual NVIDIA
WebGL2 only; software/hardware WebGPU, Safari/Firefox and physical mobile are
NOT TESTED here. The independent forced-freeze reload remains unresolved.

## Reproduce locally

Servers are running locally. If they later stop:

```sh
cd /home/mani/dev/jellyfish-studio/m7-ocean-glass
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
VITE_OCEAN_RELEASE=milestone-2 node scripts/m7-preview.mjs
```

Evidence viewer, in another terminal:

```sh
python -m http.server 5216 --bind 127.0.0.1 --directory /home/mani/dev/jellyfish-studio/m7-evidence
```

Validation commands:

```sh
VITE_OCEAN_RELEASE=milestone-2 npm run build
node --test tests/*.test.mjs
node scripts/check-approved-motion.mjs
node scripts/check-default-animal.mjs
```

Browser reproduction scripts are `scripts/m7-*.mjs`. Run them sequentially;
benchmark separately from capture, builds, tests and encoding. Evidence stays
outside the repository at `/home/mani/dev/jellyfish-studio/m7-evidence/`.

**Nothing pushed, merged or deployed. Pages unchanged. M8 not started.**
