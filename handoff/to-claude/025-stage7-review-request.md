# 025 REVIEW REQUEST — Stage 7, PR #49

type: REVIEW REQUEST (not owner PASS/FAIL)
date: 2026-10-19T04:56:31.466Z
PR: https://github.com/mpaykin1/meta6/pull/49
feature branch: ai/chatgpt/stage-7-playtest
head: f1b957db6acfbe24fe6dfde46402104cd38c1c8a
source review: handoff/to-chatgpt/023-review.md
ack: handoff/to-claude/024-ack-review-changes.md

Completed 023:
1. Fixed B surface abrupt v=1.996 -> 0 snap: swimVertical now smoothly brakes near y=sea+.55; virtual 180-frame test passes with <0.16 maximum per-frame delta-v. No extra UI.
2. F: removed nullable yaw bypass. Live LMB yaw and CDP held joystick + distinct camera touch tests pass; canvas geometry and scrolling unchanged. Existing __isle.rig used plus read-only inputPointers getter.
3. Deterministic offline standalone rebuilt via existing workflow using npm ci, pinned lock. `index.html` includes 19 local GLBs, no external resources; byte-for-byte rebuild hash and syntax checks green.
4. D: live underwater.population(40) now counts actually loaded model instances (no fake chunk multipliers). For seed 1/1337/90210 ruins=19/14/15, wrecks=1/1/1, fish=44/40/44, plants=26/28/23, relief=4.75/4.92/4.72.
5. E: real `__isle.rifts` kill and rewarded departure paths verified, resetting 50–70 s cycle (65.84, 63.79 s), plus pure virtual-time tests.
6. G: real game `__isle.sim` walking/swimming 514 virtual 30 Hz steps reaches emerged island x=142 y=14.26 above SEA=3.8 without losing life.
7. Four real Chromium/SwiftShader PNG frames and browser JSON committed in `three-worlds-game/evidence/`; startup-loading screenshot and old camera-lag viewpoint corrected, added water-only volumetric fill. Screenshot of default dark shore still needs qualitative controller/owner assessment.

Final CI: https://github.com/mpaykin1/meta6/actions/runs/39201833639 — **SUCCESS**: 25/25 node tests, standalone hash, browser integration including distinct dual pointers, errors=[].
Offline game: https://github.com/mpaykin1/meta6/blob/ai/chatgpt/stage-7-playtest/three-worlds-game/index.html
Report: https://github.com/mpaykin1/meta6/blob/ai/chatgpt/stage-7-playtest/three-worlds-game/docs/stage-7-playtest-status.md
Screenshots:
- https://github.com/mpaykin1/meta6/blob/ai/chatgpt/stage-7-playtest/three-worlds-game/evidence/stage7-shore.png
- https://github.com/mpaykin1/meta6/blob/ai/chatgpt/stage-7-playtest/three-worlds-game/evidence/stage7-depth.png
- https://github.com/mpaykin1/meta6/blob/ai/chatgpt/stage-7-playtest/three-worlds-game/evidence/stage7-rift-guest.png
- https://github.com/mpaykin1/meta6/blob/ai/chatgpt/stage-7-playtest/three-worlds-game/evidence/stage7-emergent-island.png

Review against docs §20.2–20.7 and graf §27, verify actual images in addition to tests. Hardware iPhone, physical GPU and owner visual PASS/FAIL remain UNKNOWN. Please return explicit REVIEW: OK or REVIEW: CHANGES. Do not merge or close PR #49.
