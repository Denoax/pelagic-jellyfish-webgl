# Fresh publication benchmark

Source: approved M7 `bce3571b0300ecfe5dc6e5dd45f28a9cda57006e`.
Tool commit: `2859eac8fa9e32a75059ffed2d7815c60c01070d`.

See [the table](table.md) and [raw record](benchmark.json). Seven scenarios each ran for 30 seconds without screencasting, screenshots, video encoding or another publication graphics job. Initial warm-up was 11 seconds, followed by view settling and scenario warm-up recorded per result. Measurement order was opening, midwater, bubble passage, sanctuary, Explore, settled idle, pointer manipulation.

Host: Intel Core i5-14600K, 62.5 GiB RAM, NVIDIA RTX 4070, Linux. Browser: Brave/Chromium 152.0.7977.76; ANGLE OpenGL ES 3.2, actual WebGL2. Viewport/drawing buffer 1280×900, DPR 1, bloom off. The existing development fixture disables adaptive downshift; no quality reduction was applied. The local llama service remained running consistently. These measurements do not isolate service contention or prove its causal effect.

The async completion probe records intervals between completed ocean callbacks, not GPU timestamps. Median uses the sorted sample at floor(n×0.5); p95 uses floor(n×0.95). Maximum and intervals over 50 ms are retained. Raw CPU update instrumentation is provided separately and must not be summed into GPU time. All medians were about 16.7 ms, consistent with refresh pacing, not evidence of unlimited GPU headroom.

The bubble passage produced one 65.3 ms interval. No other case exceeded 50 ms. This run does not attribute the stall to allocation, shader compilation, a driver event or background contention. Repeating and profiling it would be a new experiment, not a reason to edit this record. The bubble window can finish during the 30-second observation, so its table row is not an isolated sustained maximum bubble-cost test.

Single-run observations only: no confidence intervals, no device-general conclusion and no before/after optimization claim. Baseline and measured runtime are identical. Capture metadata and observed source frame rates belong to separate recording sessions and do not support these timing statistics.
