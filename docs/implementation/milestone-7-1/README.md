# M7.1 — liquid choreography review handoff

**Status: PARTIAL.** This is a substantial local motion improvement, not an
artistic approval or unconditional performance sign-off. The remaining gates
are normal-size neck/pinch readability and consistent long-run performance.
No M7.2 or M8 work has begun.

## Review now

Both servers are running locally:

- [Before/after motion viewer](http://127.0.0.1:5218/) — start here. Opening and
  sanctuary pairs, close contact/exit crops, minute/hour rollovers, school,
  bubble passage, Explore and portrait; includes half-speed playback.
- [Live candidate](http://127.0.0.1:5217/?renderer=webgl&idle=8) — leave the mouse
  still for eight seconds; move it to stretch the liquid, then click or press
  Enter/Escape/Space to return. No debug controls were added to public artwork.
- [Unchanged local M7 baseline](http://127.0.0.1:5215/?renderer=webgl&idle=8).

Repository: `Denoax/pelagic-jellyfish-webgl`.
Worktree: `/home/mani/dev/jellyfish-studio/m7-1-liquid-choreography`.
Branch: `milestone-7-1-liquid-choreography`.
Authoritative baseline: `b6450239e64764dbba36ae9c913e15f3d847ee65`.
Final **runtime** SHA: `bfbe9837f4e0587662f79d481af8e7b1dcb94156`.
Subsequent handoff commits only add QA scripts/documentation; the final branch
tip is reported in the user handoff. No remote was mutated.

If the local processes stop, from this worktree:

```sh
VITE_OCEAN_RELEASE=milestone-2 node scripts/m71-preview.mjs
python -m http.server 5218 --bind 127.0.0.1 --directory /home/mani/dev/jellyfish-studio/m7-1-evidence
```

The evidence directory's `index.html` links to this folder's `review.html`.
The local release flag preserves the approved ocean path; it is not deployment.

## Changes and evidence

- Local stroke-anchor fronts replace the baseline's clock-wide reveal.
- Eight finite feeding beads approach real stroke sites, stretch into implicit
  necks, reduce their mass fraction and absorb rather than remain decorative.
- Local contact and pinch events drive the existing bounded persistent field.
- Only changing digit cells retract through two migrating local reservoirs;
  independent mask textures fix the old shared-Source problem. Fixed cell
  positions keep unchanged hours stable and wide rollover digits separated.
- Dismissal begins spatial thinning/separation immediately, keeps optical
  strength through the initial pinch, then clears remnants within 0.85 s.
- The clock settles; there is no added perpetual sine wobble or new droplets.
- A separately committed async shader-link scheduling fix reduces the measured
  cold preparation completion gap, without adding a renderer or ocean pass.

Read [AUDIT.md](AUDIT.md) for the old synthetic-motion diagnosis and fresh
human reference observations, [IMPLEMENTATION.md](IMPLEMENTATION.md) for exact
formation/mass/neck/minute/exit mechanics and approximations, and
[SCHEDULING.md](SCHEDULING.md) for pinned-r175 preparation ownership.

Runtime files changed:

| File | Responsibility |
|---|---|
| `src/scene/glass/LiquidChoreography.js` | New deterministic stroke sites, feeding/exit director |
| `src/scene/glass/OceanIdleGlass.js` | Spatial assembly, independent masks, local minute migration |
| `src/scene/glass/IdleLiquidState.js` | Entry/exit envelope and phase timing |
| `src/scene/glass/IdleDisplacement.js` | Bounded local event impulses in existing field |
| `src/scene/glass/LiveOceanLens.js` | Async prewarm ownership, restoration and cleanup |
| `src/scene/HeroScene.jsx` | Serial completion of preparation and ready publication |

## Validation result

126/126 tests, production build and both exact animal parity programs PASS.
Twenty repeated idle cycles, all five camera modes, keyboard/pointer/touch
dismissal, normal/active hidden return, finite state, resize and resource checks
PASS. One graphics context, one ocean render, unchanged existing M3 target,
two bounded low-resolution simulation targets. Native GPU handle counts remain
stable through repeated resizes. No WebGPU success is inferred from WebGL2.

See [VALIDATION.md](VALIDATION.md) for actual commands, evidence paths,
resolution/backend details, lifecycle results and untested environments.

## Performance — mixed evidence, not cleared

Fresh paired normal-ocean medians were 16.7 → 16.6 ms; settled-idle medians
16.2 → 16.7 ms, p95 19.6 → 18.6 ms, no >50 ms intervals. However the earlier
complete final-candidate sequence degraded to ~30 ms median in late scenes,
with a 127.7 ms maximum. That long-run slowdown did not reproduce in the short
repeat, but its cause is **not established**. Shared user GPU activity is a
possible confound, not an excuse to delete data.

The cold preparation diagnostic measured 280.3 → 125.9 ms maximum ocean
completion gaps, while async preparation wall latency was 250.0 → 307.6 ms.
Those are different measurements. No GPU timing or zero-stall claim is made.
No quality, DPR or resolution reduction was used.

All eight window comparisons and raw-data locations are in
[PERFORMANCE.md](PERFORMANCE.md), including the adverse run and repeat.

## Visual self-review / remaining compromises

The sequence now forms locally, absorbs the feeding masses and settles into
readable time. Real moving jellyfish remain refracted through the same ocean
image. Minute transitions no longer alpha-blend two complete readable digits.

The narrow-neck/merge moment is visible in enlarged motion, but is not yet
consistently compelling at normal size against bright moving animals. Exit is
quick and physically directed in the field, but the distinct pinch and recoil
are fleeting enough that it can still read as rapid dissolution. This does
**not** meet the brief's strongest defining-shot criterion confidently enough
to label READY. Shader parameters or pure-state tests cannot approve that shot.

The mass transfer is perceptual rather than an integrated volume-conservation
solver. The changed-digit algorithm has two local reservoirs; it does not
recreate FluidGlass's complete topology simulation. Tabular placement changes
clock spacing slightly while preserving the original glyph shapes/font size.
Autonomous ocean phase differs slightly between paired clips; actual liquid
times and camera states are saved, rather than claiming pixel-locked motion.

The next unresolved work is specifically contact/pinch legibility and a
controlled reproduction of the long-run stalls—not more optical decoration,
a renderer replacement or a later milestone. Human review is still required.

## Scope confirmation

M1 anatomy/material/swimming/activation, M2 currents/wakes, M3 normal bubble
optics, M4 population/LOD, M4.1 recovery, M5.2 camera/View/scroll/Explore,
M6.6 sanctuary and M6.6.1 finite-input guard remain unchanged outside the
authorized idle/preparation path. M7's one-renderer architecture is preserved.

The local idle choreography intentionally changed; the published/default Pages
release did not. Last inspected main/Pages build:
`a2ed3bc89c700ba5c792ecac19747939e9f09b8d`, workflow `34182837955`.
Nothing pushed, merged, deployed or published. No later milestone started.
