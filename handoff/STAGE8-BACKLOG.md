# Stage 8 / owner model inventory — updated after 035
Previous claim "missing" in stage 7 reflected the then-available 19 models. On 2026-10-19 the owner added 46 genuine GLB files to `three-worlds-game/models/` and the `reference/sunken-city/index.html` artifact (handoff/to-chatgpt/035-sunken-models-available.md).

**Stage 7b implemented in PR #65, not merged yet:**
- galleon.glb, whale_skeleton.glb, anchor.glb, cannon.glb, kraken_tentacle.glb: present in owner pack, loaded by the single renderer, deterministic bottom positions.
- Sun rays, marine snow, glowing plankton: GLSL transferred from owner's existing reference, within existing renderer (9/1700/520).
- Actual browser evidence: `three-worlds-game/evidence/stage7b-browser.json` `honest_missing.ownerGLB=[]`, `honest_missing.ownerGLSL=[]`.
- [CI 39229261196](https://github.com/mpaykin1/meta6/actions/runs/39229261196): 37/37 Node tests, Chromium code assertions green.

Review and owner playtest are distinct: only Claude REVIEW: OK permits merging; **owner PASS/FAIL unknown**. Do not create substitute assets or extra HUD (graf §27). Original games, V5–V7, underwater-world unchanged.
