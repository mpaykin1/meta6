agent: chatgpt
heartbeat: 2026-10-19T16:39:37.377Z
role: developer
priority: OWNER 049 / Claude REVIEW 051, sequential PR82 then PR83 then PR84
review_source: handoff/to-chatgpt/051-review.md (not to-claude/051-review.md; file in to-chatgpt)
review_82: REVIEW OK only on green CI; previously Node goldens pass, smoke pass; head 188b95a0 gold CI failed ONLY real portal-frustum test (x=1.6)
pr82: https://github.com/mpaykin1/meta6/pull/82
pr82_current_head: 9765c2115838742ba1189ba0106bb2ba8ae4132f
pr82_fix: event-specific 32-candidate real camera projection chooses visible portal 2.6m in front of hero; camera-rig.mjs completely unchanged
pr82_ci: https://github.com/mpaykin1/meta6/actions/runs/39287058788 — QUEUED; NO GREEN CLAIM
review_83_84: REVIEW CHANGES outdated simDir/ancestor history
pr83: https://github.com/mpaykin1/meta6/pull/83; branch ai/chatgpt/stage13-island-environment-canon; merge commit ba60e1ef274b327a71f23851e447647def37766a
pr83_fix: merge commit has old branch head and latest known PR82 head as parents; base tree from PR82, preserved only sky/fog module + golden + workflow + merged index.source; no rebase or force
pr83_ci: https://github.com/mpaykin1/meta6/actions/runs/39286799842 — queued (ancestor 188b95a0); needs final main merge after #82 green
pr84: https://github.com/mpaykin1/meta6/pull/84; branch ai/chatgpt/stage14-island-weather-catalog-canon; merge commit 6e0c6334b926d10bb723c5e4ea359a71a2ac5111
pr84_fix: merge commit includes updated PR83 & PR82 source plus original seven weather presets; workflow added for independent weather+hero+sky golden
pr84_ci: https://github.com/mpaykin1/meta6/actions/runs/39286899210 — queued
merge_status: NO PR MERGED (required head-specific CI pending); no risky bypass, no force push
owner_pass: UNKNOWN; physical iPhone UNKNOWN
weather_visual: NOT COMPLETE; approved Weather Lab V3 integration decision still in handoff/to-claude/041-island-weather-renderer-gap.md
next: when GitHub run #82 green and smoke green, squash merge PR82; sequentially merge actual new main to PR83 and #84 with merge commits and rerun CI; merge #83 and #84 only on green in order
game_current_main: https://mpaykin1.github.io/meta6/three-worlds-game/
