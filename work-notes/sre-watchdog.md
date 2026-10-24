# SRE Watchdog handoff — 2026-10-24

## Run metadata
- Repository: `mpaykin1/meta6`
- Role: FREE 16.2 — SRE Watchdog (read-only triage; no game implementation)
- Main HEAD observed: `54082eca26fa6c1040781e5afb784a9bdcfb5e77`
- Run timestamp: 2026-10-24T04:09:12.336Z
- Result: `TRIAGE_COMPLETE / STAGE_HOLD / OWNER_VERDICT_UNKNOWN`
- No game source, tests, workflow, access settings, or owner verdict changed in this run.

## Mandatory document reread (current main)
- `three-worlds.md`: `f9ffe47e835edcf045b4be642ff962c6de1d651f`
- `docs/THREE_WORLDS_MERGE_RU.md`: `1d60595ed905ad04f11b932d986619ce8d4ffa83`
- `AGENTS.md`: `718b2d6efaa7d52e43a0047e797fe88f6a57cf23`
- `graf.md`: `26952fd351373100d9456b6d571cb7af3868b58e`; WORLD INTEGRITY constraints are present under a second `## 27` heading. The same file also uses `## 27` for Weather Lab, so heading numbering is duplicated. Do not infer a different rule from the numbering; `three-worlds.md` and `AGENTS.md` explicitly refer to WORLD INTEGRITY.
- `underwater-world/CLAUDE.md`: `34f39f6355c8955012cad96539c51c39cb3a372e`
- Current water behavior register: `docs/ACCEPTED_BEHAVIORS.md` SHA `669496de36b77a3c733ffdc79ac9ceb90f7d0d8a`.
- Current automation priority prompt: `automation/prompts/chatgpt-autotask.md` SHA `66ad21781ad544113f3f3d206bc3611345914f04`.

## Shared memory and handoff freshness
- `work-notes/` is absent from `main`; `GET /contents/work-notes?ref=main` returned 404. `handoff/` is also absent from `main`; the separate `handoff` branch exists.
- Builder note is only in draft PR #231, head `48db0b959aaea6a60706ca237f8af98a00ed4700`, branch `ai/chatgpt/builder-water-camera-handoff-20261023`; it says A01/A08 is BLOCKED pending ownership release.
- Independent QA note is only in draft PR #230, head `872c8137b35579a9020788657902ee184320f070`, branch `ai/chatgpt/independent-qa-20261023-water-camera-mid-depth`; it includes the isolated harness reproduction and a root-cause lesson. PR #230 base is old SHA `ddc656dc7d28928801602eddf23ffbb19d5b406d`, so read it as evidence/handoff, not as an up-to-date code candidate.
- #230 and #231 are open drafts, with no submitted reviews or inline review threads. #230 has one handoff comment referencing #231; #231 itself has no comments.
- The handoff branch has 124 files in `handoff/to-claude/` and 141 in `handoff/to-chatgpt/`; latest global entry is `handoff/to-claude/125-info-pr160-closed-reprioritized.md` (2026-10-21), and latest water-camera-specific finding is `099-autotask-finding-water-camera-mid-depth.md` (2026-10-20). Status heartbeats in `handoff/STATUS-chatgpt.md` and `STATUS-claude.md` are dated 2026-10-21 and 2026-10-20 respectively, and are stale. `ack-099.md` in `handoff/to-claude/` was not found.

## Current blocker: A01/A08 water camera (hold; ownership not released)
- Current source: `three-worlds-game/water-dive-camera.mjs`, blob SHA `8a72eb01183c62de99b9117ee265e7ede261aec6`, still computes `const deep=bound((seaY-floorY-2.8)/1.4,0,1);`
- The accepted test `three-worlds-game/tests/accepted/shallow-deep-water.test.mjs`, blob SHA `9992830ef94ac280406e6ecf2ba13abad78cb2c6`, checks `immersionAt()`, not the actual `waterCameraShift()`.
- Browser fixture `three-worlds-game/tests/owner-2114-water-entry-browser.mjs`, blob SHA `697dee644cee340cea7de3329d1b78f2a37d0b4f`, exercises shallow and saturated-deep cases but not the intermediate shelf.
- QA's isolated Node v22.16 harness (not the full repository test suite) reported shallow PASS, `floorY=1` shift=0 FAIL, and `floorY=0` final cameraY≈4.679543 above `seaY=3.8`; summary 1/3 assertions, exit 1. Full repo/browser rerun and physical-device validation remain UNKNOWN.
- Branch `ai/chatgpt/stage29-deep-camera` still exists. Compare `main...`branch: diverged; branch is 18 commits ahead / 108 behind, merge base `bc9a7e8fa3794f5da694a6d1cd39898d14440b6d`. Its unique diff touches `three-worlds-game/index.html`, `index.source.html`, `tests/owner-2114-water-entry-browser.mjs`, adds `tests/water-dive-camera.test.mjs`, and adds `water-dive-camera.mjs`. It has no ownership-release note.
- Under the no-collision rule, this source/test surface remains **OCCUPIED / HOLD** until an explicit owner/coordinator release or redirect. Do not edit or overwrite stage29, do not cherry-pick or reset it blindly, and do not begin a second implementation.
- The related design §21.22 keeps A01/A08 open: preserve shallow walking; deep water must submerge the camera smoothly. A10 water combat/jump is also open, but it is not the current owned stage and must not be pulled into the same change.

## CI and other repo blockers
- Main push run `39947191468` for SHA `54082eca26fa6c1040781e5afb784a9bdcfb5e77`: **FAILURE**, job `verify-live` (`120392612285`), failed step “Wait for English variant to be live”. At attempt 40 the log says the English Meta6 public URL returned 404/stale content or lacked required fallback markers. This is a separate repo-wide live-delivery blocker; exact underlying cause is not established by this log alone.
- At the time of inspection: 11 open PRs; no separate open issues returned by the Issues API (repo metadata says issues are disabled). #230/#231 are the relevant Three Worlds camera handoffs; #229 and #193 are ABYSS work, #164 is underwater-sumerek fish-tail work; #61/#15/#13/#7/#2/#1 are older or unrelated to the camera stage.
- `automation/prompts/chatgpt-autotask.md` prioritizes `ashen-sumerek`, `underwater-sumerek`, and `ostrov-sumerek` for normal slots and says legacy `three-worlds-game/` must not take that queue. It permits a still-current critical owner blocker only if not already assigned; A01/A08 is still owner-reported/open, but the stale stage29 branch currently prevents safe takeover.
- The Free-role automations peek currently shows exactly three enabled flexible daily tasks (Builder, Independent QA, SRE). All have `next_run_time=null`; SRE's last_run_time was `2026-10-23T04:58:25Z`. Do not claim the next run is scheduled/confirmed, do not change schedules, and do not create a workflow. The hourly GitHub Actions watcher is still described as a plan requiring owner creation/enablement in §16.2.

## Explicit handoff
1. **SRE/coordinator or owner:** explicitly release/redirect `ai/chatgpt/stage29-deep-camera`, or identify its intended continuation and owner. Until then, A01/A08 is not free.
2. **Builder (after release only):** add the failing regression before source edit: shallow remains shift=0; `floorY=1` has a smooth positive intermediate shift; `floorY=0` ends with camera below `seaY-0.12` after 120×1/60 steps. Make a minimal curve change only, preserve the camera rig and shallow behavior; run the pinned standalone build `cd three-worlds-game/tools && npm ci && npm run build`, ensure generated HTML reproducibility, then full `.github/workflows/three-worlds-gate.yml`.
3. **Independent QA:** review only the new exact SHA after Builder's PR exists. Require full exact-head gate and live browser evidence for shallow/intermediate/deep depths, shore return, and water combat/jump if in scope. Physical phone remains UNKNOWN until actually tested.
4. **Live-delivery owner/slot:** inspect the English Pages 404/stale-marker failure from run #39947191468 without conflating it with the Three Worlds fix.
5. No later §11 stage is assigned from this SRE run. No code, test, workflow, merge, release, or owner PASS/FAIL was performed.

## Final status
`A01/A08 = BLOCKED (stale ownership lease, defect still open)`; `main Live Delivery Gate = FAILURE`; `owner PASS/FAIL = UNKNOWN`. This is a documentation-only SRE checkpoint in an isolated branch, not a code fix or proof of game readiness.
