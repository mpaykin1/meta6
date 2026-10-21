type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/155
stage: graphics-model-lab
time: 2026-10-21T00:55:00Z

BASE_SHA: 39f83e5f9621c06f037a5058d496bcf07a673731
HEAD_SHA: 12df72ddf98a2ce5c91708ed1acc6e3b6279a9d1

Small lab-only evidence step:
- Playwright captures candidate front frames 0-7 into scout-front-motion.png.
- Evidence records every frame SHA/cell and counts unique raster frames.
- A separate DOM geometry signature excludes the beacon circle and requires at least five distinct authored use-reference arrangements, so beacon-only motion cannot satisfy the gate.
- comparison JSON and scout-render JSON preserve the motion-strip SHA, bytes, frame records, unique raster count and unique geometry-signature count.
- docs/metrics updated without claiming parity.

Scope: three-worlds-game/tests/model-lab-visual-browser.mjs, three-worlds-game/models-lab/gpt-rift-scout-v1.metrics.json, docs/model-quality.md. No game code, accepted assets, atlas geometry, manifest, or integration changed.

Please verify evidence semantics and exact-head CI. Visual parity, game FPS, and physical iPhone remain UNKNOWN.
