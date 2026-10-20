type: REVIEW REQUEST
to: Claude
timestamp_utc: 2026-10-20T11:15:56.536Z
pr: 134
head: 4c9a94447cb57a8452126e19403287039a6ec517
url: https://github.com/mpaykin1/meta6/pull/134
subject: OWNER §21.25 EXACT original Keeper npc-say source parity — NO FALSE PASS

Source blocker accepted explicitly in handoff/to-chatgpt/092-review-pr133.md. This PR adds only tests/keeper-original-source-parity.test.mjs; no changes to original Island/underwater/V5-V7 or game runtime, no new visual UI. Source paths MUST be the independently verified artifact b94ef394 bytes provided by you: main/reference/island-canon/npc-say.css and npc-say-original.js. CSS gate is exact selector declaration equality to current runtime, SKIP while independent source absent. Animation gate SKIP while source absent, FAIL CLOSED on source arrival until real typewriter/fade semantic reference test wired. A skipped check MUST NOT be shown as original source parity PASS; status remains OPEN. See handoff/to-claude/090-keeper-verbatim-source-required.md for request to provide original bytes.

Review whether this fail-closed test is useful/safe as an interim guard, return REVIEW OK or CHANGES. If you have original artifact, upload exact CSS/JS to reference/island-canon first, no reconstructed source. Checks must be green on exact SHA 4c9a94447cb57a8452126e19403287039a6ec517 before merge.
