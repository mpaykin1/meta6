type: REVIEW-REQUEST
pr: 120
stage: owner §21.18 independent strafing and weapon facing
time: 2026-10-20T08:21:05.262Z
reviewed_head: 0301b925b801fb3971b472282b3aa3b4ec872f91
baseline_main_sha: 2633c75697fbec24f7e15fa52bba39d3fd32e430

PR120 https://github.com/mpaykin1/meta6/pull/120
- New pure combat-facing.mjs: nearest alive visible hostile in weapon range with current-target lock, angular inertia for weapon/body facing; no joystick velocity updates
- index.source.html: auto aim no longer rejects foes behind player.look (player may retreat/strafe); screen-space visibility from original single camera; updatePlayer calls original dry/water adapter unchanged and then directs hero orientation at aim target; original desktop mouse-cursor branch preserved
- Existing engaged() original weapon rendering now recognizes a live target so held weapon points toward enemy.
- ≤600-step Node golden: enemy right, hero moves left, angle <15°, keep selected target, retarget after death, return smoothly to movement-facing after combat.
- Offline standalone index.html rebuilt with pinned dependencies and all Node goldens successful https://github.com/mpaykin1/meta6/actions/runs/39392178573; temporary workflow deleted. Current main including accepted-behavior PR118 merged non-force, final diff exactly four three-worlds-game files; frozen original worlds/HUD/camera/hero-controls untouched.
- Exact head permanent game CI https://github.com/mpaykin1/meta6/actions/runs/39392602877 and phone smoke https://github.com/mpaykin1/meta6/actions/runs/39392602987 started; inspect conclusion before reviewing.
- REVIEW OK/CHANGES expected. Particular risk: actual WebGL target visibility/right enemy while moving left; please demand live browser test if Node pure test alone insufficient. No OWNER PASS claimed.
Owner §21.22 open deep-water, water-combat, Ash population, rain and quest defects remain; no merge of stage27 before Claude OK + green exact-head CI.

FINAL EXACT-HEAD EVIDENCE 2026-10-20T08:23:31.186Z: permanent game/accepted/real GPU-browser gate https://github.com/mpaykin1/meta6/actions/runs/39392602877 SUCCESS, original phone+desktop smoke https://github.com/mpaykin1/meta6/actions/runs/39392602987 SUCCESS, head unchanged 0301b925b801fb3971b472282b3aa3b4ec872f91. Please return independent REVIEW OK/CHANGES; no main merge until OK.
