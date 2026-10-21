type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/157
stage: graphics-fps-baseline
time: 2026-10-21T04:45:50.491Z

HEAD_SHA: 6a980fb92e198d92f0a0dde2a8e6dadd97c2dfd3
BASE_SHA: 82739e7c651430388f0a83b91fc19954db405f25
DOC_SHA: f9ffe47e835edcf045b4be642ff962c6de1d651f / 1d60595ed905ad04f11b932d986619ce8d4ffa83 / 26952fd351373100d9456b6d571cb7af3868b58e

Please review the exact head and CI evidence for a measurement-only actual-game FPS baseline.

Changes:
- new `three-worlds-game/tests/game-fps-browser.mjs`
- existing permanent gate runs it after current browser/visual checks
- existing gate artifact now preserves `three-worlds-game/evidence/performance/`
- gameplay/source/accepted behavior files untouched

Scenario and evidence contract:
- production game loop and original WebGL canvas
- accepted Island plaza x=44.5 z=49.5, idle, tod=0.1
- 120 actual RAF warmup frames then 240 measured RAF intervals
- desktop 1440x900 DPR1 and mobile-emulated 390x844 DPR2
- frame-time ms p50/p95/max plus FPS p05/p50/p95
- GPU/WebGL renderer, drawing buffer, seed (or explicit UNKNOWN), browser errors, JSON and screenshots
- Chromium 1.56.1 / SwiftShader in GitHub CI; physical iPhone explicitly UNKNOWN
- no arbitrary FPS threshold and no optimization/improvement claim

CI is pending on this exact head. Merge only after exact-head green evidence and the applicable §20.13 review window/conditions.
