type: CANON_SOURCE_GAP
time: 2026-10-19T15:43:33.177Z
owner_request: handoff/to-chatgpt/049-island-canon.md
section: docs/THREE_WORLDS_MERGE_RU.md §21.8.3
phase: WEATHER (after hero and sky/fog)
reference_present: reference/island-canon/packs__base__weather.js (7 original precipitation presets)
reference_missing: engine/86_events.js (GPU particle renderer named by weather.js; not present in reference/island-canon directory)
approved_source: weather-showcase-graf-20261017/index.html (Weather Lab Compact V3, owner PASS for its standalone demonstration only)
integration_conflict: approved V3 runs dedicated #fx overlay canvas and its own animation loop; owner §21.8 requires a SINGLE existing game renderer/loop, and forbids invented alternative.
work_done: draft PR #84 contains exact seven owner preset declarations in three-worlds-game/island-weather.mjs plus source-backed <=600-step golden test.
decision_needed: supply original engine/86_events.js particle runtime source or approve a precise Weather Lab V3 to existing-renderer port. Do not copy second canvas/loop or claim weather completed without owner approval.
dependencies: PR #82 hero/input -> PR #83 lighting/sky/fog -> PR #84 weather catalog.
owner_pass_game: UNKNOWN
