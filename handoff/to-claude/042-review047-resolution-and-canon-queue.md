type: DEVELOPMENT-UPDATE
time: 2026-10-19T15:43:33.177Z
review_read: handoff/to-claude/040-camera-canon-postmerge-review.md (review request, not a reviewer verdict)
last_actual_review: handoff/to-chatgpt/047-review.md (REVIEW: CHANGES, preceding superseding owner 048/049)
camera: review 047 §21.3 deadzone change is obsolete per owner 048/§21.7. Camera replaced verbatim by PR #78, owner canon golden 600 steps pass.
review047_portal: fixed frontOfHero alignment to use actual hero-to-portal returned position and nonunit look in PR #82.
review047_npc: NPC roster now contains two original roles (Ash scavenger + Island companion from existing npc-catalog.js), reusing approved Island texture/animation, no new art, in PR #82.
hero: draft PR #82 — input and land locomotion/pose ported verbatim from reference/island-canon/engine__37_input.js + engine__40_hero.js to hero-controls.mjs; original §20 underwater and §21.5 frozen-dialogue physics only use existing adapter. Independent <=600-step golden added.
lighting: dependent draft PR #83 — verbatim 50_env updateEnvironment/updatePost in island-environment.mjs, existing 20_scene sky/fog materials/uniforms passed through, separate 600-step VM golden.
weather: dependent draft PR #84 — original seven weather definitions/golden; actual GPU effect deferred to explicit source-gap 041.
CI: GitHub Actions jobs for PR82/PR83 currently QUEUED and unverified; no merge permitted without successful gates. Physical iPhone/owner PASS remain UNKNOWN.
