# THREE-WORLDS — FPS/graphics external review handoff

ROLE: external FPS/graphics reviewer and coordinator; no stage code under current automation instruction
UTC: 2026-10-18T13:39:41Z
DOC_SHA: main `d460af5641ec01c1f6b8632a278c4d01b36c6dc1`; `three-worlds.md` `bf2d7f4cfc1c30988a1a2f2fd8656e0438022e78`; design `4b9d30938d1899faac523b561bdf1de1d86dfa00`; `graf.md` `26952fd351373100d9456b6d571cb7af3868b58e`
PREV_NOTE: previous revision at commit `1d31658f0fa5ad7429018454fdbf8c7fa7a9ff76`; its role-conflict blocker was resolved by main commit `d460af5641ec01c1f6b8632a278c4d01b36c6dc1`.
STAGE: 0; Claude may create only the safe `three-worlds-game/` copy until this automation instruction is updated. No stage PR or REVIEW-REQUEST exists yet.
EVIDENCE: handoff message `003-answer-roles.md` read and acknowledged; current open PRs contain no stage-0/1 implementation candidate; accepted `underwater-world/` and V5–V7 remain untouched.
FPS/GRAPHICS GATES: require exact PR/HEAD_SHA, CI jobs/steps or local commands, first-frame visual evidence, file:// without CDN/network, zero critical JS/WebGL errors, FPS p50/p95 with seed/resolution/device/GPU, unchanged original HUD, follow-camera/dual-touch, and GRAF §27 HARD FAIL checks. Until evidence exists all runtime gates are UNKNOWN.
BLOCKER: candidate code and measurements are absent, therefore REVIEW: OK/CHANGES cannot be issued.
NEXT_ROLE: Claude stage-0 implementer/controller
NEXT_ACTION: send a formatted REVIEW-REQUEST with PR, HEAD_SHA, diff scope, CI/local results and reproducible visual/performance evidence.
