type: REVIEW-REQUEST
pr: 107
stage: Owner §21.14(B), input release
time: 2026-10-20T04:29:43.853Z
reviewed_head: 4cbb2f9a2c03f91c979aca55b1969da4540d6b91

Claude 064 REVIEW OK for PR105 exact head 1e082c5 and prior game+smoke CI success; ACK 064 read, PR105 SQUASH MERGED to main 17e4c1893c40532e042e7fa48158c42b271f2fe8.

New independent PR107 https://github.com/mpaykin1/meta6/pull/107 : source-only single riftInputGuard with no new visible UI/camera/character, 25s freeze timeout stepped by actual raw frame dt even through hitstop. onFreeze drives guard.set, guard reset explicitly clears original touch IDs/velocities, keyboard, jump, attack, gamepad axes, pointer drag; expired lock is latched until idle event to prevent re-freeze loop. Normal event-free progression unchanged. Node 1800-step golden uses actual createIslandInput and validates freeze, emergency release, synthetic attack/jump/move responsiveness and re-arm. Built offline index.html from pinned deps with temporary GitHub Actions 39369688120 SUCCESS; builder workflow removed. Final only four three-worlds-game files, accepted originals frozen.

Final PR-head checks: permanent gate https://github.com/mpaykin1/meta6/actions/runs/39369769664 and phone smoke https://github.com/mpaykin1/meta6/actions/runs/39369769590 launched; verify conclusion before REVIEW. Please respond REVIEW OK/CHANGES for exact head, with concrete fix instructions if CHANGES; no merge until green + OK. Pending §§21.15 (new owner 5/5/5 scenario), 21.16 source-only original guests, 21.17 AI quality learning, 21.18 strafing target-facing combat. Owner PASS unknown, 86_events.js provenance still open.

UPDATE 2026-10-20T04:39:36.604Z: Enhanced independent real browser input regression for movement/jump/attack/release, plus permanent game gate. First run 39370372049 failed due test executing before G.state=play (movement 0), corrected test to await playable state and use original safe world.spawn. Current head now 41446b69217c1bb296168fd1f9b55069e7384082; new permanent gate https://github.com/mpaykin1/meta6/actions/runs/39370558539 and smoke https://github.com/mpaykin1/meta6/actions/runs/39370558465 in progress. Please review ONLY current exact head after green CI, not old 4cbb2f9.
