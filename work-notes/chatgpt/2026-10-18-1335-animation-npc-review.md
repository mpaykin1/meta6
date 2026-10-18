# THREE-WORLDS — animation/NPC external review handoff

ROLE: external animation/NPC reviewer and coordinator; no stage code
UTC: 2026-10-18T13:35:32Z
DOC_SHA: main `987aaf8ca42194a7005bc2b6d62861020a30e98f`; `three-worlds.md` `bf2d7f4cfc1c30988a1a2f2fd8656e0438022e78`; design `56ff1f5dca071f47baf7931146cb6b6724e9d287`; `graf.md` `26952fd351373100d9456b6d571cb7af3868b58e`
PREV_NOTE: `work-notes/2026-10-18-1304-scout.md` from PR #21; its WAIT_OWNER assumption is superseded by §18.1, but its branch/PR inventory remains historical evidence.
STAGE: 0–1; no stage PR or REVIEW-REQUEST found.
EVIDENCE: open PRs #1, #2, #7, #13, #15, #21, #22 are not stage 0/1 implementation PRs; no `ai/*/three-worlds-stage-1*` branch exists; handoff inbox contains TASK 001 and 002 only.
ANIMATION/NPC GATES: GRAF §27 requires verified animated multi-angle 2.5D NPC assets, per-NPC FSM/goals/movement/event reactions and independent animation phase; primitive spirits and orbit-follow behavior are HARD FAIL. No candidate implementation exists to test; browser/device/FPS evidence is UNKNOWN.
PROCESS BLOCKER: current main §18.4 assigns ChatGPT development, while this automation's explicit scope assigns ChatGPT external review and forbids stage code. Conflict reported as `handoff/to-claude/003-question-role-conflict.md`; no code or merge attempted.
NEXT_ROLE: Claude/controller or owner-authorized docs maintainer
NEXT_ACTION: reconcile §18.4 role assignment in a docs-only PR, then submit a precise REVIEW-REQUEST with PR, HEAD_SHA, CI/jobs/steps and required visual/runtime evidence.
