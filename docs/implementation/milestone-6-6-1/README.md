# M6.6.1 — Idle-return / invalid-input hotfix

Status: PASS for the diagnosed invalid-input / strict idle-return regression. The independent forced-freeze page reload remains unresolved. Bugfix only, local commits only.

- Approved baseline: `a1fd998eab3a20b4fde99076ecde39058bac2298`.
- Branch: `m6-6-1-idle-return-hotfix`.
- Runtime fix: `5e0845752b7876802327429ac6122334f6ac24f6`.
- Repository: `Denoax/pelagic-jellyfish-webgl`.
- Worktree: `/home/mani/dev/jellyfish-studio/m6-6-1-hotfix`.
- [Local candidate](http://127.0.0.1:5213/?renderer=webgl&idle=30), [preserved approved baseline](http://127.0.0.1:5211/?renderer=webgl&idle=300).
- [Local matched screenshots and actual motion evidence](http://127.0.0.1:5214/).

Only runtime file changed: `src/scene/HeroScene.jsx`. Four added lines validate a spatial pointer sample before writing pointer history/current. No final geometry sanitization, world reset, clock rebasing, LOD change, material recreation or renderer change.

## Diagnosis changes the interpretation of earlier evidence

The historical strict idle test dispatched `new Event('pointermove')` solely to restart the idle timer. That generic event has no coordinates. The old ocean input handler nevertheless consumed it as a spatial sample. Numerical corruption began **before idle activation**, not on dismissal. The later idle-return screenshot exposed the already damaged scene.

The unmodified approved baseline passes the same idle sequence with real CDP pointer movement. This does not erase the historical failure: malformed activity was genuinely able to poison persistent application state. It does mean the evidence does not justify changing the idle lifecycle or soft-body timing.

See [DIAGNOSIS.md](DIAGNOSIS.md) for the first state, causal chain, context/material/clock audit and evidence. [VALIDATION.md](VALIDATION.md) records the full matrix, comparisons and performance.

## Resume contract

Visible app idle is an overlay: the existing ocean continues simulation/rendering. Dismissal removes the overlay while retaining the same world, camera, geometry, material and optical resources. Spatial input must contain finite coordinates before it can mutate current/history. Activity-only events may schedule idle but may not inject a spatial sample. Existing bounded simulation and hidden-tab handling remain unchanged.

The historical lifecycle tools now use `focusin` as an activity-only scheduling signal. The original malformed trigger remains deliberately available in `m661-reproduce.mjs` and in focused regression tests, proving the production boundary is fixed rather than merely making the test less demanding.

## Local preview

The agent starts the preview; no user setup is required. Restart if necessary:

```sh
cd /home/mani/dev/jellyfish-studio/m6-6-1-hotfix
export PATH=/home/mani/.local/share/fnm/node-versions/v24.20.0/installation/bin:$PATH
VITE_OCEAN_RELEASE=milestone-2 node scripts/m661-preview.mjs
```

M1–M6.6 appearance, anatomy, materials, animation, currents, LOD, camera tracks, View/scroll, sanctuary and M3/M6.1 optics are not redesigned. Nothing is pushed, merged, deployed or changed on Pages. No M7 work.
