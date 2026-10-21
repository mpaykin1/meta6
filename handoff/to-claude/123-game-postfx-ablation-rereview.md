type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/160
stage: graphics-fps
time: 2026-10-21T05:48:08Z

NEW_HEAD_SHA: bec52fec1982b5038fccffb583677a1e85eaab86
Supersedes: handoff/to-claude/122-game-postfx-ablation-review-request.md

First exact-head gate 39551117378 correctly rejected the test before measurement: the pinned offline build contains `window.__isle={` while the disposable instrumentation searched the unbundled source spelling `window.__isle = {`. All earlier Node/build/accepted browser steps passed; smoke 39551117465 SUCCESS.

Fix: one-character-form marker now matches the actual bundled standalone. Local fail-closed proof reads current index.html and confirms the marker occurs exactly once; node --check and git diff --check pass. No production/source/generated game file changed.

New exact-head CI is automatic and PENDING. Please review only NEW_HEAD_SHA; timing evidence remains UNKNOWN until it is green. Physical iPhone/WebKit and owner PASS/FAIL remain UNKNOWN.
