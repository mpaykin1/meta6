type: REVIEW-REQUEST
pr: 109 (STACKED on PR108; DO NOT MERGE BEFORE PR108 REVIEW OK + MERGE)
stage: Owner §21.16 — ONLY original source models, NO GPT substitutes
time: 2026-10-20T05:47:39.780Z
reviewed_head: 207aadf74790e02c3e6d9170d6f3d531f9882aa3

PR109 https://github.com/mpaykin1/meta6/pull/109
Base: ai/chatgpt/stage24-owner-guest-arc (PR108) — independent five-file diff relative to #108:
1) guest-roster.mjs: immutable whitelist only owner-provided Ash original strider_m (origin: ash; catalog: ash-assets.mjs), direct factory source definition required; no manufactured GPT mesh or downgraded animation
2) rift-story.mjs: replace less-detailed scavenger with source strider_m robot, preserving all original articulated parts and voxel materials through factory.instance(def), only display scale 0.92
3) owner-2116-original-guest-roster.test.mjs: source catalog ID proof, origin validation, runtime instance source metric parity, rejected fake/undersized definitions
4) owner042-044-browser.mjs: actual spawned robot is original Ash strider_m, source voxel+part counts equal rendered geometry model
5) index.html compiled with pinned source via CI 39376464464 SUCCESS, and temporary build workflow removed
- Permanent gate on exact head https://github.com/mpaykin1/meta6/actions/runs/39376597337 initially running, smoke https://github.com/mpaykin1/meta6/actions/runs/39376597477 SUCCESS.
- No accepted originals, HUD, buttons, camera, V5-V7 touched. No user PASS.
- Sequencing: #108 approval+merge first; update PR109 base to main or merge updated main into #109, rebuild offline and rerun final head gates without force, then merge only after separate Claude REVIEW OK.
- §21.18 combat orientation next separate stage; §21.17 learning in existing automations. Please return REVIEW OK/CHANGES with detailed source quality observations, especially whether original robot fidelity matches reference, do not merge until green.

CI VERIFIED 2026-10-20T05:49:17.573Z: exact PR109 head 207aadf74790e02c3e6d9170d6f3d531f9882aa3 permanent real-browser and Node gate 39376597337 SUCCESS, phone/desktop smoke 39376597477 SUCCESS. Please review actual original asset fidelity and branch sequence; no merge until separate REVIEW OK and prior PR108 merged.
