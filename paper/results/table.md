**Table 3. Fresh approved-runtime frame intervals (milliseconds).**

| Scenario | Median | p95 | Maximum | >50 ms | Frames |
| --- | ---: | ---: | ---: | ---: | ---: |
| opening | 16.70 | 18.60 | 28.80 | 0 | 1800 |
| midwater | 16.70 | 17.80 | 27.20 | 0 | 1800 |
| bubble passage | 16.70 | 18.70 | 65.30 | 1 | 1798 |
| sanctuary | 16.70 | 18.00 | 25.90 | 0 | 1800 |
| Explore | 16.70 | 18.50 | 31.80 | 0 | 1800 |
| settled M7 | 16.70 | 17.90 | 26.00 | 0 | 1800 |
| M7 manipulation | 16.70 | 18.20 | 30.00 | 0 | 1803 |

Actual NVIDIA WebGL2; 1280×900 viewport and drawing buffer; DPR 1; bloom off. Eleven-second initial warm-up plus scene/idle warm-up; 30-second measurement per case. Existing development hooks select the approved runtime states. These are render-completion intervals, not GPU timings. Single-run observations, not confidence intervals. Bubble passage includes its natural decay. No capture or video encoding during timing.
