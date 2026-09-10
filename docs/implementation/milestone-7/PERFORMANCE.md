# M7 capture-free performance comparison

Baseline `046430847448206cfc58ce84758d9410121a97d3`.
Candidate runtime `e666b34f11f9867dc59f698ff07ebf2c50daf618`.
Method/environment: [VALIDATION.md](VALIDATION.md#timing-method).

All values below are **render-completion intervals in milliseconds**, NOT GPU
timings. RTX4070/NVIDIA WebGL2, i5-14600K, Chromium 152.0.7977.76 via Brave,
1280×900 viewport and drawing buffer, DPR1, unchanged quality/bloom. Screenshot
and video capture OFF. No test/build/encoding/other browser runs overlapped.

| Scene | Baseline median | M7 median | Baseline p95 | M7 p95 | Baseline max | M7 max | >50 ms baseline / M7 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Normal opening B .18 | 16.7 | 16.7 | 18.0 | 17.5 | 30.8 | 29.3 | 0 / 0 |
| Normal school B .50 | 16.7 | 16.7 | 17.6 | 17.4 | 26.4 | 22.0 | 0 / 0 |
| Normal sanctuary D 1 | 16.7 | 16.7 | 17.8 | 17.8 | 29.1 | 22.7 | 0 / 0 |
| Idle opening B .18 | 16.7 | 16.7 | 17.6 | 18.2 | 25.5 | 38.8 | 0 / 0 |
| Idle school B .50 | 16.7 | 16.7 | 17.5 | 18.8 | 21.1 | 26.8 | 0 / 0 |
| Idle bubbles B .36 | 16.7 | 16.7 | 18.1 | 18.0 | 22.3 | 25.0 | 0 / 0 |
| Idle sanctuary D 1 | 16.7 | 16.5 | 18.1 | 19.7 | 26.5 | 27.8 | 0 / 0 |
| Idle Explore from D 1 | 16.7 | 16.7 | 18.2 | 18.7 | 24.1 | 26.1 | 0 / 0 |
| Continuous idle pointer | 16.3 | 16.7 | 19.9 | 18.1 | 26.0 | 26.6 | 0 / 0 |

Normal-scene cost is negligible in these samples, not a universal performance
guarantee. Real glass has a measurable tail cost in school/sanctuary. The new
pointer path fares better than the separate-renderer legacy pointer path here.
Do not infer a GPU speedup or significance from small single-run differences.
The 38.8 ms opening interval is a notable sub-50 ms stall; its exact driver/
scheduling cause was not isolated. It was not concealed by changing quality.

11 seconds warm-up; idle gets another 10 seconds. Ordinary measured spans
29.98–30.00 seconds, 1798–1800 intervals. Pointer protocol overhead yields
34.9092 seconds / 2095 intervals baseline and 34.9322 / 2096 candidate.
Each raw result includes before/after camera, buffers, ratio, context count,
renderer identity, optical state, browser version, raw intervals and errors.
Every case retained DPR1 and the 1280×900 buffer. All browser error arrays empty.

## Controller, prewarm and transitions

M7 idle controller CPU median is below the ~0.1 ms timer quantum (raw 0), p95
0.1 ms, maximum 0.1–0.2 ms. Zero means quantized below resolution, not no work.
This excludes GPU simulation/output and submission cost; baseline controller
was not equivalently instrumented, so its CPU column is NOT MEASURED, not zero.
Inactive controller returns before capture/simulation, yielding no idle CPU
samples and no simulation draws.

Attach/prepare/compile prewarm spans 93.8–120.2 ms across the nine candidate
runs. This excludes constructing the controller before attach. The separate
entry test captures the inclusive one-time main-frame interval: **139.3 ms M7
versus 188.6 ms baseline**, about 2.3 seconds after the first completed frame.
That startup pause remains a disclosed compromise. Warm-up does not erase it.

| Transition trace | Baseline | M7 |
| --- | ---: | ---: |
| First completed ocean frame after DOM idle-active | 15.4 | 16.5 |
| Entry window p95 / maximum | 17.4 / 17.7 | 18.6 / 21.7 |
| First completion after DOM dismissal | 15.2 | 11.6 |
| Exit window p95 / maximum | 17.6 / 18.8 | 17.9 / 18.0 |
| Entry/exit intervals >50 ms | 0 | 0 |

These are DOM-state-to-completion observations, not physical input latency.
No first-idle compilation stall appeared. The candidate entry result originally
labels SHA `HEAD`; it was recorded immediately after e666b34 and before any
subsequent runtime edit. Other performance files contain the full immutable SHA.

## Passes and storage

One ocean render, one optical output; roughly one extra 256×180 field draw per
60 Hz idle frame (bounded 0–3 catch-up steps). No extra full-resolution ocean
target/copy. Reuses M3 RGBA16F/depth24 target and existing renderer output target.
Added field payload ~0.70 MiB desktop plus two ~10.13 MiB-total clock masks.
Native contexts drop 2→1; native total textures in the resource audit 79→75,
framebuffers 9→6, renderbuffers 4→4. Counts are not measured GPU bytes.
See [IMPLEMENTATION.md](IMPLEMENTATION.md) for all approximations and resources.
