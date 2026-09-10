# M7.1 performance evidence

These are **ocean render-completion intervals**, not GPU timings. The JavaScript
renderer promise does not mean the GPU has physically finished executing. No
GPU speedup is claimed. Capture, image encoding and builds were stopped during
these measurements. Other user applications were not closed.

## Conditions

- Baseline: `b6450239e64764dbba36ae9c913e15f3d847ee65`.
- Final runtime measured: `bfbe9837f4e0587662f79d481af8e7b1dcb94156`.
- NVIDIA RTX 4070, ANGLE OpenGL ES 3.2 / real WebGL2, main Three 0.175.0
  WebGPURenderer. Brave reports Chromium 152.0.7977.76 through CDP.
- Viewport and actual drawing buffer: 1280×900; DPR 1 throughout. Unchanged
  adaptive quality configuration and approved direct output/bloom-off path.
- Same seed 7183, camera mode and requested progress. The autonomous ocean's
  exact animal phase is not frame-locked between runs; this is a limitation.
- 11 s initial warm-up, 5 s scene warm-up; settled modes have another 9 s.
- Normal and settled: 30 s each. Entry: five 6 s windows. Minute: ten 3 s
  windows. Exit: ten 1.2 s windows, separated by full entry/settling. Pointer:
  300 timed CDP movements (~30 s plus command overhead).
- The completion probe resets per window; the first boundary interval may be
  omitted. Manual DEV minute-mask preparation is outside the controller CPU
  timer, although subsequent render intervals include its effects.

Reproduce from this worktree with the two preview servers running:

```sh
node scripts/m71-benchmark.mjs http://127.0.0.1:5215/ baseline-repeat b6450239e64764dbba36ae9c913e15f3d847ee65
node scripts/m71-benchmark.mjs http://127.0.0.1:5217/ candidate-repeat bfbe9837f4e0587662f79d481af8e7b1dcb94156
```

Run sequentially, with no other browser evidence job. Optional fourth argument
`normal,settled` limits a diagnostic repeat; it is not a replacement for the
full suite.

## Full run — do not discard the regression

Each cell is median / p95 / maximum milliseconds / count >50 ms.

| Window | Baseline | Final candidate |
|---|---:|---:|
| Normal ocean | 16.7 / 18.9 / 29.3 / 0 | 16.4 / 20.2 / 33.1 / 0 |
| Opening formation | 16.8 / 25.9 / 40.4 / 0 | 16.2 / 20.3 / 74.6 / 1 |
| School formation | 17.5 / 34.1 / 46.8 / 0 | 19.5 / 35.5 / 79.6 / 4 |
| Sanctuary formation | 16.7 / 19.7 / 29.4 / 0 | 30.3 / 37.6 / 52.5 / 3 |
| Settled | 16.7 / 18.6 / 25.7 / 0 | 29.6 / 37.1 / 50.9 / 1 |
| Pointer | 16.7 / 18.2 / 27.2 / 0 | 30.4 / 37.1 / 47.0 / 0 |
| Minute morph | 16.7 / 17.9 / 30.2 / 0 | 29.4 / 37.4 / 127.7 / 3 |
| Exit | 16.6 / 19.1 / 27.0 / 0 | 29.6 / 37.5 / 46.7 / 0 |

Raw per-frame intervals, CPU samples and before/after renderer/camera/resource
records: `../m7-1-evidence/performance/{baseline,candidate-final}/`.
An earlier full candidate run at `e8904ac` was ~16.6–16.7 ms median across all
windows, with no >50 ms intervals. It remains under `performance/candidate/`;
it must not be substituted for this final runtime's measurements.

The final long-run slowdown started during repeated entry and persisted into
later modes. The 74.6 ms opening stall occurred in a later repetition, not the
initial shader link. Controller CPU samples were typically below the browser's
0.1 ms timer granularity (p95 0.1 ms), with small maxima; this is not evidence
of zero cost and does not measure field/compositor GPU work.

During investigation the host GPU was shared with another active user Brave
renderer and a resident llama-server (~8.5 GB VRAM). The latter's memory
residency does **not** establish active inference. Those processes were not
terminated. External contention is a possible confound, not a proven cause.
Neither the low CPU samples nor stable resources justify dismissing the slow
run. No resolution/quality reduction was used to improve a number.

## Fresh paired diagnostic repeat

After the capture/lifecycle batch ended, the unchanged baseline and final
runtime were measured sequentially again, with the same settings and 30 s
windows. No capture, encoding or build ran during this repeat.

| Window | Baseline median / p95 / max / >50 | Candidate median / p95 / max / >50 |
|---|---:|---:|
| Normal | 16.7 / 18.8 / 27.6 / 0 | 16.6 / 18.8 / 31.4 / 0 |
| Settled sanctuary idle | 16.2 / 19.6 / 29.4 / 0 | 16.7 / 18.6 / 29.5 / 0 |

Raw data: `performance/repeat-baseline/` and `performance/repeat-candidate/`.
This does **not** reproduce the sustained ~30 ms settled slowdown. It also
does **not** explain or erase the earlier long-run stalls: this shorter repeat
does not include the same number of repeated entries or the complete sequence.
No runtime optimization was made between these runs, and no user process was
closed. The evidence supports a non-reproduced/possibly contingent slowdown,
not a proven fix or an attribution to external load. Full long-run consistency
remains unresolved; performance is not unconditionally signed off.

## Preparation / shader linking

An initial expanded TSL candidate regressed first preparation to ~1.8 s.
Named field reuse, explicit temporary nodes and bounded uniform-array loops
removed redundant generated expressions. A CPU profile then identified
blocking shader-program queries during link. The separately committed change
uses the pinned renderer's compileAsync and serializes the first tiny output
draw into a later main-loop boundary. See [SCHEDULING.md](SCHEDULING.md).

A fresh cache-busted diagnostic changes only a harmless GLSL local identifier:

| Measurement | Baseline | Candidate |
|---|---:|---:|
| Preparation wall latency | 250.0 ms | 307.6 ms |
| Largest ocean completion gap around preparation | 280.3 ms | 125.9 ms |
| Steady-window p95 | 17.7 ms | 17.6 ms |
| Gaps >50 ms | 1 | 1 |

Asynchronous latency is not a blocking pause. The smaller gap supports the
scheduling change but does not prove all preparation stalls are eliminated.
The original M7 report's 139.3 ms pause was a different run/cache condition.
Do not compare it as though it were this fresh baseline's exact measurement.
Raw data: `performance/cold-baseline/` and `performance/cold-candidate/`.

No general performance rewrite or visual-quality tradeoff was made.
