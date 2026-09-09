# Measured camera studies

Generated from raw evidence. Camera kinematics are diagnostics, not a cinematic score. Frame intervals are not GPU timings.

## Normal forward segment

| Camera | Angular median / p95 / max °/s | Angular acceleration p95 °/s² | Linear acceleration p95 | Jerk p95 / max | FOV |
|---|---:|---:|---:|---:|---:|
| approved-v2 | 4.17 / 14.75 / 27.61 | 18.69 | 0.93 | 1.11 / 1.77 | 44.00–47.00 |
| rejected-v2 | 2.81 / 12.74 / 16.97 | 12.54 | 0.59 | 3.52 / 27.71 | 47.00–47.00 |
| candidate-A-final | 0.01 / 1.02 / 1.18 | 0.29 | 0.23 | 1.11 / 1.80 | 48.00–48.00 |
| candidate-B-final | 0.22 / 0.69 / 0.76 | 0.14 | 0.08 | 0.67 / 1.65 | 53.00–53.00 |
| candidate-C-final | 0.05 / 1.24 / 1.46 | 0.35 | 0.23 | 1.20 / 4.28 | 64.00–64.00 |
| candidate-D-final | 0.04 / 2.02 / 3.02 | 0.99 | 0.41 | 0.83 / 3.15 | 50.00–50.00 |

## Whole-route frame completion intervals

40 seconds, 12 seconds warm-up (6 initial + 6 route settle), 1280×900 actual ocean buffer, DPR 1, fixed quality, normal production bloom off. Actual NVIDIA RTX 4070 WebGL2, Brave Chromium 152. No screenshots, recording or profiler during measurement. Camera paths deliberately expose different scene content, so this is a whole-scene comparison, not isolated shader/GPU cost.

| Camera/run | Median ms | p95 ms | Max ms | >50 ms | Completed intervals |
|---|---:|---:|---:|---:|---:|
| approved | 17.80 | 21.70 | 31.50 | 0 | 2403 |
| A | 19.70 | 22.10 | 31.50 | 0 | 2403 |
| B | 14.40 | 25.30 | 35.80 | 0 | 2402 |
| C | 15.90 | 21.70 | 30.00 | 0 | 2403 |
| D | 14.70 | 23.20 | 30.70 | 0 | 2403 |
| approved-repeat | 18.10 | 22.40 | 31.90 | 0 | 2403 |

## Capture coverage

- candidate-A-final: 80.56 s, 2393 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-A-final/motion.mp4)
- candidate-A-portrait: 80.44 s, 2406 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-A-portrait/motion.mp4)
- candidate-A-slow: 120.79 s, 3605 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-A-slow/motion.mp4)
- candidate-A-fast: 40.41 s, 1202 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-A-fast/motion.mp4)
- candidate-B-final: 80.57 s, 2401 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-B-final/motion.mp4)
- candidate-B-portrait: 80.40 s, 2405 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-B-portrait/motion.mp4)
- candidate-B-slow: 120.86 s, 3606 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-B-slow/motion.mp4)
- candidate-B-fast: 40.40 s, 1201 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-B-fast/motion.mp4)
- candidate-C-final: 80.54 s, 2402 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-C-final/motion.mp4)
- candidate-C-portrait: 80.42 s, 2406 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-C-portrait/motion.mp4)
- candidate-C-slow: 120.90 s, 3603 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-C-slow/motion.mp4)
- candidate-C-fast: 40.41 s, 1203 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-C-fast/motion.mp4)
- candidate-D-final: 80.55 s, 2404 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-D-final/motion.mp4)
- candidate-D-portrait: 80.41 s, 2406 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-D-portrait/motion.mp4)
- candidate-D-slow: 120.88 s, 3606 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-D-slow/motion.mp4)
- candidate-D-fast: 40.45 s, 1205 recorded frames, 0 browser exceptions. [Motion](http://127.0.0.1:5193/evidence/candidate-D-fast/motion.mp4)

## Fixed-state browser frames

30 seconds of simulation, seeded at 7183, fixed 1/60-second steps, identical native-scroll history ending at 0.35. These are real ocean frames; different cameras and their approved visibility/LOD decisions intentionally differ. Equality below compares the foreground debug state, not all mesh buffers or pixels.

- approved: foreground debug state equal = true. [Frame](evidence/fixed-approved/frame.png) · [State](evidence/fixed-approved/state.json)
- rejected: foreground debug state equal = true. [Frame](evidence/fixed-rejected/frame.png) · [State](evidence/fixed-rejected/state.json)
- A: foreground debug state equal = true. [Frame](evidence/fixed-A/frame.png) · [State](evidence/fixed-A/state.json)
- B: foreground debug state equal = true. [Frame](evidence/fixed-B/frame.png) · [State](evidence/fixed-B/state.json)
- C: foreground debug state equal = true. [Frame](evidence/fixed-C/frame.png) · [State](evidence/fixed-C/state.json)
- D: foreground debug state equal = true. [Frame](evidence/fixed-D/frame.png) · [State](evidence/fixed-D/state.json)
