# Independent QA work notes

## 2026-10-23T11:32:21Z — A01/A08: missing mid-depth camera transition

- Repository: `mpaykin1/meta6`; current main SHA at audit start: `ddc656dc7d28928801602eddf23ffbb19d5b406d` (unrelated ABYSS §15a documentation change).
- Role: read-only Independent QA of the existing Three Worlds water-camera regression. No §11 implementation stage claimed; no owner PASS/FAIL assigned.
- Required docs reread in order:
  - `three-worlds.md`: `f9ffe47e835edcf045b4be642ff962c6de1d651f`
  - `docs/THREE_WORLDS_MERGE_RU.md`: `1d60595ed905ad04f11b932d986619ce8d4ffa83`
  - `AGENTS.md`: `718b2d6efaa7d52e43a0047e797fe88f6a57cf23`
  - `graf.md` §27 / full document: `26952fd351373100d9456b6d571cb7af3868b58e`
  - `underwater-world/CLAUDE.md`: `34f39f6355c8955012cad96539c51c39cb3a372e`
- Memory gap: `work-notes/` is absent from main. An earlier `work-notes/independent-qa.md` exists only in stale branch `ai/chatgpt/independent-qa-20261021-canvas-viewport`; no current SRE or Builder note was found in their inspected branches.
- Ownership / candidate: no open PR was found for `three-worlds-game/water-dive-camera.mjs` or A01/A08. Old `ai/chatgpt/builder-water-camera-handoff-20261022` and `ai/chatgpt/independent-qa-water-camera-20261022` are both at `818cbe936ce09213236eb352da5f291708e76077`, 0 commits ahead and 14 behind main. Latest SRE branch `ai/chatgpt/sre-watchdog-20261023-0444` is 0 ahead / 12 behind and has no `work-notes/sre-watchdog.md`. The current open PR #164 is for `underwater-sumerek/` fish-tail deformation and is unrelated. Other checked Claude underwater branches change `underwater-sumerek/`; the old Codex branch is for isolated `underwater-world/quests` and `creatures` modules. No current camera-change candidate was available for review; local/remote agent runtime state not independently inspected.
- Current source: `three-worlds-game/water-dive-camera.mjs`, blob SHA `8a72eb01183c62de99b9117ee265e7ede261aec6`. The factor is `bound((seaY-floorY-2.8)/1.4,0,1)`.
- Current accepted unit test: `three-worlds-game/tests/accepted/shallow-deep-water.test.mjs`, blob SHA `9992830ef94ac280406e6ecf2ba13abad78cb2c6`; it tests `immersionAt()` only and does not call `waterCameraShift()`.
- Current live browser test: `three-worlds-game/tests/owner-2114-water-entry-browser.mjs`, blob SHA `697dee644cee340cea7de3329d1b78f2a37d0b4f`. It has a real deep fixture and a shallow fixture but does not exercise the intermediate voxel shelf (floorY=1) or the moderate-depth case (floorY=0).
- Latest relevant CI evidence: [Three Worlds gate run 39547354457](https://github.com/mpaykin1/meta6/actions/runs/39547354457), job `three-worlds-gate` id `119048430517`, SUCCESS on SHA `3a15f53314c1f414fb6dd354bb3e9c8bf9df0c13`. Its log reports:
  - `OWNER_2122_REAL_CAMERA_IMMERSION`: deep fixture floor=-1, cameraY=1.7506308774469117, sea=3.8, immersion=1; shallow fixture floor=2, cameraY=9.937964332893497, sea=3.8. The live entry and water-controls tests passed for these fixtures.
  - This is Chromium/SwiftShader CI evidence, not a physical-phone result. It does not cover the failing floorY=1 / floorY=0 range.
- Local isolated harness: `node /tmp/meta6-qa-20261023/water-camera-mid-depth.mjs`, Node v22.16.0, 120 steps at dt=1/60; copies the pure function from the exact source SHA above; not a full repository test:
  - shallow control (sea=3.8, floor=3.62, heroY=3.99, immersion=.1): shift=0, cameraY=9 — PASS.
  - intermediate shelf (floor=1, heroY=1.2, immersion=1): shift=0, cameraY=9 — FAIL, expected positive transition.
  - moderate depth (floor=0, heroY=1.2, immersion=1): shift=4.320457, cameraY=4.679543 while sea=3.8 — FAIL, camera remains above the surface.
  - summary: 1/3 assertions passed; harness exit code 1. Full repo `node --test`, a new full CI run, and physical mobile were not run in this audit.
- Confirmed technical defect: the existing depth factor clamps to zero at depth `seaY-floorY <= 2.8` and is only ~0.714 at depth 3.8m; the live CI only samples a shallow floor and a deeper floor that saturates the factor. Hence the existing live test can be green while intermediate depth is not covered.
- Builder handoff: add a red-first camera regression covering (1) shallow shift remains zero, (2) floorY=1 has a smooth, nonzero intermediate shift, and (3) floorY=0 reaches cameraY < seaY-0.12 after 120×1/60 steps. Make a minimal adjustment to `water-dive-camera.mjs`, preserve accepted shallow behavior and the original camera rig, rebuild the standalone via `cd three-worlds-game/tools && npm ci && npm run build`, then run the full `three-worlds-gate.yml` including live browser checks. Do not bypass the standalone `git diff --exit-code` guard.
- Cross-company review: BLOCKED because there is no current camera PR/reviewer submission to review. Only owner can assign the final PASS/FAIL. Wait for Builder's exact new SHA/PR; do not start a later stage.
- No game code, tests, workflow, main branch, or owner verdict changed in this QA run.
