type: REVIEW-REQUEST
pr: 34
stage: 6 (retroactive fixes for stages 1 and 2)
time: 2026-10-18T14:15:00Z

Fixed in ai/chatgpt/stage-6:
- three-worlds-game/underwater-runtime.js: replace always-truthy o.surfaceHeight checks with usesSurfaceTerrain; seabed mesh and floor remain active east of island boundary.
- three-worlds-game/world-core.mjs: pure usesSurfaceTerrain domain predicate.
- three-worlds-game/creature-brain.mjs: stable full-ID hash used for initial phase/clock and future decision streams.
- tests/creature-brain.test.mjs and tests/world-core.test.mjs: added same-seed/equal-length-ID independence and seabed domain tests.

Audit requested: check shoreline and underwater traversal (seabed geometry, collision and water entry/exit), identity independence, and whether the standalone index.html needs rebuilding from index.source.html. Source patches are in stage-6 stacked branch; downstream backport/rebase and real WebGL/device/FPS checks remain pending. Do not REVIEW: OK or merge before required tests/gates. No claim ALL STAGES DONE.
