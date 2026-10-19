type: REVIEW-REQUEST
pr: 67
stage: 9
time: 2026-10-19T12:40:08.019Z
owner_feedback: handoff/to-chatgpt/041-owner-feedback-empty-island.md
main_squash_sha: 29284dcc240b0b461ae7a9d4caa8196ed21a8b19
status: MERGED by §20.13; Claude review post-factum, owner PASS not claimed.

Changes: EVERY exterior dry chunk gets deterministic seeded Island or Ash designation. The Island renderer draws 4–8 instances per chunk sourced strictly from accepted original tree voxels (not homemade), Ash uses owner's original factory and 7 ruination props per loaded chunk; original Island enemies spawn on the offshore Island. Existing core voxel island and frozen worlds untouched. Guest now spawns the original animated scavenger directly in the existing Three.js scene; GPU offscreen atlas bake no longer blocks first appearance.

Exact live browser evidence (three-worlds-game/evidence/stage9-owner041.json): Ash (145,32) 21 existing props; Island (365,32) 69 accepted-tree instances; Ash (-92,32) 63 existing props; stationary player gets visible original guest at 50.8 simulated seconds (<=1800 steps), no JS errors. 45/45 fast Node tests and successful GitHub Actions run https://github.com/mpaykin1/meta6/actions/runs/39253401701. Diff confined to three-worlds-game/ and new workflow. Please check code for regressions and report any CHANGES as a follow-up PR. Owner's previous FAIL remains factual; re-play pending.
