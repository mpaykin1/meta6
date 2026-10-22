# SRE Watchdog — append-only work notes

## 2026-10-22T04:42:52Z — current main audit (read-only)

- Repository/default branch: `mpaykin1/meta6`, `main` @ `818cbe936ce09213236eb352da5f291708e76077` (main commit: `ashen-sumerek: drifting fog banks independent of hero, eased layer height, fog/rain alternate (#220)`).
- Required current files reread in order:
  - `three-worlds.md` @ `f9ffe47e835edcf045b4be642ff962c6de1d651f`
  - `docs/THREE_WORLDS_MERGE_RU.md` @ `1d60595ed905ad04f11b932d986619ce8d4ffa83` (read §§3–20, especially §§11–16, §17–18 and latest §§21.20–21.25)
  - `AGENTS.md` @ `3195aff9ae9db0a30cb9d613e3fe550884501605`
  - `graf.md` §27 (and §26) @ `26952fd351373100d9456b6d571cb7af3868b58e`
  - `underwater-world/CLAUDE.md` @ `34f39f6355c8955012cad96539c51c39cb3a372e`
- Owner verdict: UNKNOWN for the whole game. No PASS/FAIL assigned by this run.

### Highest-priority current blocker: §21.22 A01/A08, deep-water camera transition (related to §11 stage 4)

- `docs/ACCEPTED_BEHAVIORS.md` @ blob `669496de36b77a3c733ffdc79ac9ceb90f7d0d8a` still marks A01/A08 as: shallow water and shore exit accepted; true deep-water camera dive OPEN.
- Current `three-worlds-game/water-dive-camera.mjs` @ blob `8a72eb01183c62de99b9117ee265e7ede261aec6` still uses `const deep=bound((seaY-floorY-2.8)/1.4,0,1)`.
- Current accepted test `three-worlds-game/tests/accepted/shallow-deep-water.test.mjs` @ blob `9992830ef94ac280406e6ecf2ba13abad78cb2c6` tests `immersionAt`, not `waterCameraShift`; it has no integer shelf/mid-depth camera assertion.
- Current browser test `three-worlds-game/tests/owner-2114-water-entry-browser.mjs` @ blob `697dee644cee340cea7de3329d1b78f2a37d0b4f` checks a deep fixture with `floor < sea-4`; this does not cover the `floorY=0, seaY=3.8` shelf case identified in the existing handoff.
- Existing evidence/handoff: [handoff/to-claude/099-autotask-finding-water-camera-mid-depth.md](https://github.com/mpaykin1/meta6/blob/handoff/handoff/to-claude/099-autotask-finding-water-camera-mid-depth.md), timestamp 2026-10-20T15:48:18Z, based on old main `f408301107b53ec7d2fa5c232f43a22ef0283be9`. It reports an isolated-harness failure and a candidate threshold change, explicitly NOT a full-repository/browser result. This SRE run did not rerun that harness or any test.
- Current queue decision: **HOLD / ownership needs refresh before claim**. No currently open PR claims A01/A08. PR #105 was merged on 2026-10-20, but its old branch `ai/chatgpt/stage22-water-entry` still diverges from current main (14 commits ahead / 115 behind after squash merge); do not reuse it without fresh diff/review. `ai/chatgpt/builder-water-camera-handoff-20261021` is 0 commits ahead and 28 behind current main, with no PR; it is stale, not evidence of active implementation. No fresh Builder/SRE work-note or explicit release/claim was found. Builder must reconcile these stale references and explicitly claim or release the stage before code changes.

### PRs, CI and issues (live GitHub read)

- Current open PR list returned 9 items: #219, #193, #164, #61, #15, #13, #7, #2, #1. No open non-PR issues returned.
- Only open PR directly about Three Worlds is [PR #61](https://github.com/mpaykin1/meta6/pull/61), draft, last updated 2026-10-19; head `be127066bcac57d68246357a9852a52d37a2d274`, base SHA `28af282a06f9c836d7325f727004d28554832814`. Its “stage 7b next” summary is stale versus current `main`/design and should not be treated as active code work.
- [PR #164](https://github.com/mpaykin1/meta6/pull/164) concerns `underwater-sumerek/`, not the primary `three-worlds-game/` A01/A08 integration. PRs #219 and #193 concern ABYSS asset-quality gates; #15, #13, #7, #2 and #1 are unrelated/older workstreams.
- Current-main runs at SHA `818cbe936ce09213236eb352da5f291708e76077`: [Pages deployment #39713811950](https://github.com/mpaykin1/meta6/actions/runs/39713811950) SUCCESS; [Meta6 Live Delivery Gate #39713812466](https://github.com/mpaykin1/meta6/actions/runs/39713812466) SUCCESS; [Sumerek golden guard #39713812589](https://github.com/mpaykin1/meta6/actions/runs/39713812589) SUCCESS.
- No exact-current-SHA Three Worlds gate run was identified. `.github/workflows/three-worlds-gate.yml` @ blob `bf32f4fc3ad63393088d95afde2ea17aa23790c5` triggers on relevant `pull_request`/push paths only, not on a schedule. The latest main commit is an Ashen-Sumerek change, so the other green gates do not prove that the Three Worlds browser gate ran on this SHA.
- No dedicated hourly SRE workflow was found in the current workflow inventory. `automation/prompts/chatgpt-autotask.md` @ `66ad21781ad544113f3f3d206bc3611345914f04` still describes five hourly slots and legacy Three Worlds queue, which conflicts with the Free §16.2 arrangement and its own later priority rules. Do not create/change a workflow in this SRE run.

### Shared memory / heartbeat

- `work-notes/` is absent on `main`; `work-notes/sre-watchdog.md` and `work-notes/builder.md` are not present there.
- QA note exists only on branch `ai/chatgpt/independent-qa-20261021-canvas-viewport`; its last audit is 2026-10-21T11:38:39Z against old main SHA `c6c70ab64f3351ef67e880a1d34095353ab877bf`, and it concerns PR #164/fish-tail browser evidence, not a fresh A01/A08 review.
- The `handoff` branch head is `965b9e5163d6e7d82c3da10b04da535a99ae50cd` (2026-10-21T10:53:16Z). `handoff/autotask-pulse.md` last entry is 2026-10-21T10:53:10Z at main SHA `c6c70ab...`; `handoff/PROGRESS.md` and STATUS heartbeats are older. `handoff/to-claude/ack-099.md` was not found.
- Automation dashboard recheck: three Free tasks enabled; SRE last run 2026-10-21T04:26:18Z, Builder 2026-10-21T16:02:47Z, QA 2026-10-21T11:41:34Z; all three `next_run_time=null`. Upcoming automatic execution is not confirmed.

### Handoff

- **Builder:** read current design + A01/A08 row in ACCEPTED_BEHAVIORS + handoff 099; reconcile/release stale water branches; before any fix add a red regression for `waterCameraShift` at the mid-depth integer shelf while preserving shallow camera behavior. Then make the smallest source change, rebuild standalone `three-worlds-game/index.html` with the repo build, and run the full current Three Worlds gate and live browser checks on the exact PR head. Do not weaken accepted tests or touch frozen V5–V7.
- **Independent QA:** wait for Builder's exact new SHA; independently inspect diff and run exact-head CI. Verify shallow water keeps camera above surface, mid-depth/deep water places camera below surface, water attack/jump remain responsive, shore exit still works, and no accepted behaviors regress. Mark unrun/device-only checks UNKNOWN; owner alone gives game PASS/FAIL.
- **SRE:** read-only this run; no game files changed, no tests run, no owner verdict inferred. Main blocker remains the untested mid-depth camera transition plus stale/absent shared notes.

