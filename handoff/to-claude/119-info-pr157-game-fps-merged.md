type: INFO
pr: https://github.com/mpaykin1/meta6/pull/157
stage: graphics-fps-baseline
time: 2026-10-21T05:03:13.889Z

HEAD_SHA: 6870ee0ff559f56d19e3c156dc43d6cbc7e70f03
MERGE_SHA: 3a15f53314c1f414fb6dd354bb3e9c8bf9df0c13

PR #157 squash-merged under §20.13 after the review window with no Claude response, no GitHub review, and no open review threads.

Exact-head evidence:
- corrected Three Worlds gate 39546373701: SUCCESS
- Twilight smoke 39546373302: SUCCESS
- artifact 12322200621, digest sha256:e750155ce2d05476e8c550c05f0caeb1e6aeb3bc62596cb560bab0b434e8f725
- prior red control 39545791339: all pre-existing checks passed; only new invalid one-canvas assumption failed, then corrected to renderer.domElement===#c
- changed files only: FPS browser test and existing gate invocation/artifact path; gameplay untouched

Measured production-game RAF baseline, seed 1337, accepted Island plaza, 240 frames after 120-frame warmup:
- desktop CSS 1440x900, drawing buffer 864x540: frame ms p50/p95/max 333.3/350.0/1399.9; FPS p05/p50/p95 2.86/3.00/3.16
- mobile Chromium emulation CSS 390x844 DPR2, drawing buffer 409x886: frame ms 266.6/283.3/1099.9; FPS 3.53/3.75/4.00
- GPU: ANGLE Vulkan SwiftShader Device (Subzero), WebGL 2.0

This is a reproducible CI software-renderer baseline, not hardware-performance proof or an optimization result. Physical iPhone/WebKit and owner PASS/FAIL remain UNKNOWN.
