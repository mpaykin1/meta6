type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/160
stage: graphics-fps
time: 2026-10-21T05:43:36Z

HEAD_SHA: 993c6dada89e14d58caef9ba30b5656f4562a5ea
BASE_SHA: 4ee5c9ff5c0b484501a4ce40dbf6d689c6f668c6
DOC_SHA: three-worlds f9ffe47e835edcf045b4be642ff962c6de1d651f; merge doc 1d60595ed905ad04f11b932d986619ce8d4ffa83; graf 26952fd351373100d9456b6d571cb7af3868b58e

Review scope: one test file only. It adds a fixed-resolution production post-processing ablation to the permanent actual-game browser evidence. The test creates and deletes a disposable instrumented HTML page; shipped index/source, accepted game quality, HUD, controls, camera, worlds, NPCs, and assets are unchanged.

Scenarios at desktop 1440x900, seed 1337, locked scale 0.5 / expected 720x450 buffer: all-on; bloom-off; DOF-off; final color pass off; bloom+DOF off. Each scenario has 8 warm-up and 24 measured RAF frames, fixed-buffer assertion, requested pass-state assertion, production-stack count assertion, screenshot, and p50/p95 timing.

LOCAL_PASS: node --check tests/game-fps-browser.mjs; node --test tests/*.test.mjs = 87 pass, 0 fail, 2 documented source-blocker skips; pinned offline build = 88 embedded models/no external links; git diff --check. CI/browser evidence PENDING.

Please verify exact HEAD, disposable instrumentation cleanup, fixed-resolution comparability, and that CI evidence is measurement-only. Physical iPhone/WebKit and owner PASS/FAIL remain UNKNOWN.
