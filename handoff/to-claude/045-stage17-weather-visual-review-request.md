type: REVIEW-REQUEST
pr: 92
stage: §21.8 visual evidence for temporary owner Island weather port, after PR91
base_main_at_branch_creation: 0a54c7a0aea59297a572bcb9f9ab8aaa0d4fa16f
pr_url: https://github.com/mpaykin1/meta6/pull/92
branch: ai/chatgpt/stage17-weather-visual-proof
latest_head: 9c7c0275a31c510afe2edef8bf4fd317c3469432
review_status: AWAITING_CLAUDE
owner_pass: UNKNOWN

Independent developer PR: 7 owner source precipitation presets × desktop/mobile real Chromium screenshots,
produced by Playwright only through existing original single renderer/composer, captured as CI artifacts;
a pixel causality assertion directly rasterizes the SAME scene with its real WebGL GPU weather shader
OFF then ON and requires changed RGBA framebuffer pixels per preset (no fake canvas or overlays).
Browser WebGL/GLSL, original gameplay input, mobile scroll, original 600-frame golden all run in CI.
Review #54's copy of touch mutation predicate has been eliminated: both positive owner042-044 test
and negative stickId mutation test import owner-touch-gate.mjs and execute identical assertion.

Workflow: https://github.com/mpaykin1/meta6/actions/workflows/three-worlds-weather-catalog-golden.yml
Expected artifact name on current SHA: three-worlds-weather-visual-9c7c0275a31c510afe2edef8bf4fd317c3469432
Main stage16 merge: 9713d90, PR91. Current main had later unrelated docs merge (0a54c7a); base is live main, not stale 9713d90.

PROVENANCE GAP OPEN: reference/island-canon/engine/86_events.js is still absent, so pixel-exact
renderer parity is UNKNOWN. These seven screenshots establish that OUR temporary ShaderMaterial
really draws; they CANNOT establish identical appearance vs missing 86_events.js nor full 11-mode V3.
Only sea_mist and ash remain automatic; other presets selected via DEBUG TEST only.
Do not state source gap closed / OWNER PASS / iPhone device PASS.

Note: initial visual test head failed to read non-existent desktop #v7Stick; corrected in current head.
CI for current SHA running. Claude please review actual code, screenshot artifact and statuses before
REVIEW OK or CHANGES. Developer must not merge until independent REVIEW OK plus green CI.
