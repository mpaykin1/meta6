type: ALERT
pr: none
stage: §21.22 A01/A08 — stage 4 water entry / deep-camera transition
time: 2026-10-20T15:48:18Z

MAIN_SHA: f408301107b53ec7d2fa5c232f43a22ef0283be9
OWNER_STATUS: UNKNOWN (no owner PASS/FAIL inferred)
WORK_NOTES: work-notes/ is absent from main; this finding is saved in the existing handoff mailbox per automation/prompts/chatgpt-autotask.md. No code PR opened because the standalone build cannot be regenerated/verified from this execution.

Confirmed source gap:
- File: three-worlds-game/water-dive-camera.mjs, current depth factor:
  const deep=bound((seaY-floorY-2.8)/1.4,0,1);
- Existing accepted test: three-worlds-game/tests/accepted/shallow-deep-water.test.mjs checks only shallow floor=3.62 and deep floor=-5; it misses the integer voxel shelf/transition.
- With seaY=3.8, eyeY=9, heroY=1.2, immersion=1, voxel floorY=0 (3.8m depth), the current factor is (3.8-2.8)/1.4=0.714. The camera settles at about y=4.68, still above the water surface y=3.8, although the hero is fully immersed. Reproduced in a Node isolated harness: the new mid-depth assertion fails on the current formula.
- Candidate fix: begin transition at 2.5m and reach full dive around 3.4m:
  const deep=bound((seaY-floorY-2.5)/0.9,0,1);
  A local isolated harness with this candidate passed the same regression and kept the shallow fixture at zero shift. This is NOT a full-repository or browser test.

Ready regression for tests/accepted/shallow-deep-water.test.mjs:
1) Import waterCameraShift and simulate 120 steps at dt=1/60 to settle the offset.
2) Keep the existing shallow test (heroY=3.99, floorY=3.62) and assert shift=0.
3) For the integer shelf transition floorY=1, heroY=1.2, seaY=3.8, assert shift is positive but less than the floorY=0 shift.
4) For floorY=0, heroY=1.2, immersion=1, assert 9-shift < seaY-0.12.
Expected: current formula FAILS; candidate formula PASSES.

Blocker to a safe implementation PR:
- .github/workflows/three-worlds-gate.yml rebuilds the standalone three-worlds-game/index.html and then requires `git diff --exit-code -- three-worlds-game/index.html`. Source changes without a matching rebuilt 13,663,438-byte index.html would fail the gate.
- GitHub fetch_file returned metadata/SHA but no content for index.html (content length 0); the authorized Remote Desktop Commander device is offline (last seen 61h ago). No verified way to rebuild/commit the exact standalone in this execution. Do not open a red/draft PR or alter CI/workflows to bypass this.
- Therefore no source/test/lesson files were changed in this run. Continue once a build-capable execution is available: update module + accepted test + docs/lessons, run the exact project gate, ensure the rebuilt standalone diff is clean, then open a green PR.

Next role: Builder should read this note and the current source/test; do not treat the isolated harness as repository CI. QA should verify the exact-head full gate and the live browser water-camera assertion.