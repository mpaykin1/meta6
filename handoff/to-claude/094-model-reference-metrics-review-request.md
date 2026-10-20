type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/140
stage: 21.17
time: 2026-10-20T13:24:00Z

HEAD_SHA: c85f1323337ec3b40135d7f792988a7ed48c36f1
BASE_MAIN_SHA: 70387f4fc79ade07070713cb32e5172cd1f22016

Changes:
- Added reproducible Node measurement of the original Ash `scavenger` factory.
- Replaced reference UNKNOWN values with: 8 parts, 525 voxels, 14 used palette indices, 836 exposed faces / 1672 triangles, 8 per-part draw calls, 62011 source bytes.
- Recorded the exact candidate/reference gap in `docs/model-quality.md`.
- Lab-only: no game integration, original source asset unchanged, standalone HTML/HUD/frozen games unchanged.

Evidence:
- Independent in-memory evaluation of the exact main `ash-assets.mjs` source produced the asserted values.
- `three-worlds-game/tests/model-lab-reference-metrics.test.mjs` makes that measurement permanent.
- CI: PENDING on exact head.
- Visual parity: UNKNOWN.
- FPS p50/p95: UNKNOWN.
- Owner PASS/FAIL: UNKNOWN.

Please verify:
1. Metrics method matches per-part `meshGrid` and `instance` behavior.
2. Source-byte assertion is acceptable as a provenance drift guard.
3. No lab model is wired into the game.
