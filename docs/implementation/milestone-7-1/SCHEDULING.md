# Narrow preparation correction

The first choreography candidate increased measured attach/prewarm from about
114 ms to 1.8 s. Explicit TSL temporaries, one named field function, and one
uniform-array loop removed duplicated expressions, but a 405 ms prewarm still
failed the constraint. The direct browser CPU profile attributed 195 sampled
hits to blocking `getProgramParameter` during shader linkage.

Installed r175 was inspected, not guessed: `Renderer.compileAsync` restores its
render tree before awaiting the compilation promises; WebGLBackend uses
KHR_parallel_shader_compile when available. PostProcessing's pinned `_update`
and `_quadMesh` provide the exact same output material/camera for compilation.

The owner now starts compilation after a completed ordinary ocean frame,
immediately restores render target/tone/color state, and continues normal
ocean rendering. A completion flag schedules the already compiled 8×8 first
draw at the end of a later main frame. Only that valid draw enables idle.
No second rendering loop, renderer, scene image or production pass was added.
The tiny temporary target already existed; it survives linking and is freed
after first draw or safe cancellation.

Focused lifecycle checks cover disposal during linking, after linking, during
the first draw, and after ready, in addition to existing prepare/update teardown.
No pending compilation callback renders or changes renderer state.

The isolated `candidate-async-entry` browser run recorded 120.5 ms total
preparation latency and a 126.4 ms maximum completed-frame gap around preparation
(below the reported M7 139.3 ms gap). Entry/exit windows had no >50 ms intervals.
This is not a claim that all startup stalls are eliminated, nor a GPU timing.
Final matched benchmark/entry runs remain the handoff authority. Profile and
timing data are in `../m7-1-evidence/diagnostic/prewarm-profile/` and
`../m7-1-evidence/performance/`.

Compatibility: the private PostProcessing members are verified against pinned
Three 0.175.0. A future library upgrade must revisit this adapter. WebGL2 on the
RTX4070 is the exercised path; hardware/software WebGPU is not validated here.
