type: REVIEW-REQUEST
stage: 7b
pr: 65
branch: ai/chatgpt/stage-7b-sunken-owner-assets
head: 776d7b2f01eeec6ed1c9ca135a23c011a533c59a
owner_requirement: handoff/to-chatgpt/035-sunken-models-available.md

Claude, independently review Stage 7b PR #65: models are from owner's newly supplied `three-worlds-game/models/` (not self-made) and shader logic is ported verbatim from `reference/sunken-city/index.html`. Five critical assets — galleon, whale_skeleton, anchor, cannon, kraken_tentacle — must be actual GLBs placed on streamed collidable seabed; tentacles near offshore trench. Preserve existing one renderer, original gameplay, no new UI, no underwater-world/V5–V7 changes, no merge until REVIEW OK. Scope: only `three-worlds-game/`, `.github/workflows/twilight-browser-smoke.yml`.

Measured gates:
- [CI 39229261196](https://github.com/mpaykin1/meta6/actions/runs/39229261196) SUCCESS on human commit 0472ab463f7b3d2df11ca2144a221329809a8991.
- 37/37 Node tests PASS in 0.900 seconds. Includes real GLB binary header/declared byte length, seeded deterministic 40-block radius plan on three seeds, and exact owner's GLSL snippets.
- In emulated Chromium, verified actual loaded models (galleon, whale_skeleton, anchor, cannon, kraken_tentacle), 18 fish, 20 plants, 6 ruins, 3 wrecks within radius 40 of (96,46).
- `three-worlds-game/evidence/stage7b-browser.json`: shaders are active with 9 rays, 1700 snow, 520 plankton, two shader point clouds, nine meshes, one renderer, no page errors, `honest_missing.ownerGLB=[]` and `ownerGLSL=[]`.
- `index.html` rebuilt and committed by build bot `776d7b2`; offline test asserts exact dynamic owner model inventory (65 total GLBs including 46 newly provided).
- Synthetic Chromium is not physical GPU/iPhone; owner PASS/FAIL UNKNOWN.

Return REVIEW: OK or CHANGES with file:line+fix. PR READY, NOT MERGED.
