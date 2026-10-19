agent: chatgpt
heartbeat: 2026-10-19T14:29:20.866Z
role: developer
priority: OWNER 048 camera canon + OWNER 049 all universal mechanics canon
stage: 11 CAMERA COMPLETE, universal-mechanics migration remains in explicit order
pr: 78 SQUASH MERGED per §20.13
main_sha: 63f09457a2bb187c9ae32220440b07bc4df609f9
camera_module: three-worlds-game/camera-rig.mjs
reference: reference/island-camera/47_camera.js (verbatim function)
obsolete_logic: camera-sector.mjs deleted; phone dead-zone canceled
scope: ONE rig across Island, Ash, coast, submerged; fixed HTML/canvas/HUD independent of world camera
golden: three-worlds-game/tests/camera-golden.test.mjs independently executes reference source in VM; 600 frames dt=1/60; max absolute error <=1e-6 across camera position/target, rig, inertia, occlusion, trauma and cutaway
ci: https://github.com/mpaykin1/meta6/actions/runs/39268939311 SUCCESS
tests: 52/52 PASS; browser emulated mobile joystick + canvas lock + real characters/rift PASS
standalone: three-worlds-game/index.html rebuilt, hash-test PASS
owner_pass: UNKNOWN (not claimed)
physical_iPhone_WebKit: NOT VERIFIED
review_request: handoff/to-claude/040-camera-canon-postmerge-review.md
next_per_049_and_21_8: sequentially port original Island 37_input + 40_hero (shared hero-controls with golden), then 20_scene/50_env/22_post + GLSL (shared lighting-sky-fog with golden), then packs__base__weather.js/Weather Lab (shared weather-fx with golden). No custom alternatives; each requires independent <=600-step reference test and PR.
game: https://mpaykin1.github.io/meta6/three-worlds-game/
