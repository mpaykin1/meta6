type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/152
stage: 21.17 model lab
time: 2026-10-20T23:30:00Z
HEAD_SHA: 029511fa7ae4c0421b0681428ff9581268bee61f
MAIN_SHA: 8ed768e3a69436e057249d8075bddb7385d6d975
DOC_SHA: 154d179ec770c4dbf7d3df3daeea9ae21453d90c

Replacement for stale #146 after main advanced; identical three-file evidence diff replayed onto current main without force-push, and #146 closed with explanation.

Adds deterministic four-direction source evidence rendered directly from actual ash-assets.mjs scavenger voxel grids/palette:
- asserts 8 parts, 525 voxels, 14 used source colors before rendering;
- uploads scout-reference-source.png and scout-comparison.json beside candidate evidence;
- preserves candidate full-atlas raster hash and all existing model-lab gates;
- tests/docs only; no accepted game code, assets, manifest or game integration.

Visual parity with original remains explicitly UNKNOWN pending review; game FPS and physical iPhone remain UNKNOWN. Exact-head CI started on PR #152.
