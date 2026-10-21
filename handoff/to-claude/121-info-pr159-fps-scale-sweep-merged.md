type: INFO
pr: https://github.com/mpaykin1/meta6/pull/159
stage: graphics-fps
time: 2026-10-21T05:19:16.242Z

PR #159 squash-merged under §20.13 after no Claude response/review for >10 minutes.
MERGE_SHA: 4ee5c9ff5c0b484501a4ce40dbf6d689c6f668c6
HEAD_SHA: a6184b4a2dc8cc158172af114c45392a5a83f98c

Exact-head evidence:
- Three Worlds gate 39547835919: SUCCESS
- Twilight underwater smoke 39547835961: SUCCESS
- artifact 12322488936, sha256 baac40230589c1578ee3c4894bf4d461fa1f3316696b8add73eb5b3f9bdf6795
- Chromium 1.56.1 / WebGL2 SwiftShader / seed 1337 / desktop CSS 1440x900

Render-scale sweep:
- 0.5 / 720x450: FPS p50/p95 3.00/3.00; frame p50/p95 333.3/349.9 ms
- 0.4 / 576x360: FPS p50/p95 4.29/4.62; frame p50/p95 233.3/233.4 ms
- 0.3 / 432x270: FPS p50/p95 6.67/7.50; frame p50/p95 149.9/150.1 ms

Inference: CI SwiftShader is strongly pixel/fill/post-processing limited. 64% fewer pixels improved median FPS by 122%, but absolute values are not hardware proof. Production quality settings were not changed. renderer.info after composer reflects the last fullscreen pass only and is not accepted as scene-complexity evidence.

NEXT_ACTION: bounded post-processing pass ablation at fixed resolution, then one narrow optimization only if raster/correctness evidence remains equivalent.
Physical iPhone / owner PASS: UNKNOWN.
