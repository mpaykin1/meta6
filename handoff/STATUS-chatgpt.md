agent: chatgpt
heartbeat: 2026-10-19T15:48:18.800Z
role: developer
priority: OWNER 049 Island canon — sequential universal mechanics §21.8
last_camera: PR #78 merged, Island camera golden previously 52/52 PASS
latest_claude_review_read: handoff/to-chatgpt/047-review.md (REVIEW: CHANGES, older than superseding owner 048 camera canon)
camera_review_resolution: 047 request to restore 40% deadzone is superseded by owner's explicit §21.7 / 048 no-deadzone; PR #78 verbatim camera unchanged
review047_portal_resolution: PR #82 uses actual hero-to-rift vector, nonunit facing, and a browser assertion of riftMesh projected inside camera frustum after camera settles
review047_npc_resolution: PR #82 adds original Island companion NPC role alongside owner Ash scavenger via npc-catalog.js, no new art; Node check asserts two original roles
phase1_hero: PR #82 DRAFT, branch ai/chatgpt/stage12-island-hero-input-canon, head c3448e2a092776604e446dfefcaf66c669dfa87a
phase1_source: reference/island-canon/engine__37_input.js and engine__40_hero.js -> three-worlds-game/hero-controls.mjs
phase1_scope: original input held attacks/jump/orbit + canonical dry-terrain inertial movement and hero animation; only §20 underwater/ship and §21.5 rift freeze use previously accepted special-case adapter
phase1_golden: three-worlds-game/tests/hero-input-golden.test.mjs (600-frame independent VM, tolerance 1e-6) — SOURCE COMMITTED, CI NOT COMPLETED
phase1_ci: GitHub Actions run 39280655286 QUEUED at latest head c3448e2a; no green claim; do not merge PR82
phase2_light: PR #83 DRAFT, branch ai/chatgpt/stage13-island-environment-canon, dependent on PR82
phase2_source: reference/island-canon/engine__50_env.js -> three-worlds-game/island-environment.mjs with exact updateEnvironment and updatePost, existing owner sky/fog/palette uniforms and one renderer, existing rift glitch layered after reference post
phase2_golden: tests/island-environment-golden.test.mjs independent 600-frame reference sky/fog/post numerical comparison <=1e-6 — CI QUEUED, not verified
phase3_weather: PR #84 DRAFT, branch ai/chatgpt/stage14-island-weather-catalog-canon, dependent on PR83
phase3_source: original reference/island-canon/packs__base__weather.js registered as 7 owner modes with independent 600-step catalog golden; NOT YET visually integrated
phase3_blocker: reference engine/86_events.js original GPU particle implementation absent; Weather Lab accepted Compact V3 has separate canvas/loop conflicting with §21.8.4 — Claude decision requested at handoff/to-claude/041-island-weather-renderer-gap.md
review_handoff: handoff/to-claude/042-review047-resolution-and-canon-queue.md
ci_status: runners QUEUED, no tests claimed successful on these new PRs
merge_status: none of PR82/83/84 merged; preserve main and frozen original worlds
owner_pass: UNKNOWN
next: resolve queued GitHub Actions and run golden + browser; merge sequentially only on green; acquire authorized exact weather renderer integration after Claude/owner gap decision
game_current_main: https://mpaykin1.github.io/meta6/three-worlds-game/
