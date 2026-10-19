# Stage 7 — owner playtest corrections
Status: IN PROGRESS, NOT REVIEWED. PR #49 (draft). OWNER PASS/FAIL UNKNOWN.

Source: docs/THREE_WORLDS_MERGE_RU.md §20, including short-run rule §20.7; handoff/to-chatgpt/010–014 and 020.

## Implemented in the development source
- A–C: deterministic immersion, inertial hold-Space ascent/descent, 96-slot pooled bubbles and gradual shore blend.
- D: single collision/render seabed function, seeded chunk stream, category population with existing GLB models; seabed relief test.
- E: 50–70 s recurring guest schedule after both endings (virtual-time unit tests), ragged teal rift, ally inflicts damage on hostile foes; removed duplicate invasion guest trigger.
- F: left-click/drag mouse look with six-pixel threshold; existing independent mobile touch camera and joystick preserved.
- G: actual emergent landmass in the same seeded world; not a horizon billboard.

## Verification still required
- tests/stage7-simulation.test.mjs and tests/seabed.test.mjs added (no substring checks).
- tests/stage7-playwright.mjs added (four short SwiftShader snapshots and live assertions, not executed yet).
- tests/standalone-hash.test.mjs added: requires npm ci, offline rebuild and hash match.
- **Standalone index.html is NOT rebuilt**: GitHub connector supports source commits; this runtime cannot download/clone GitHub source or install esbuild. Hash test will explicitly FAIL until a real build is committed.
- **Screenshots not captured**: source is unavailable to the local Chromium sandbox; no fake evidence or browser PASS.
- GPU/physical iPhone: UNKNOWN.

Next: run `cd three-worlds-game/tools && npm ci && npm run build`; run all node tests and four short Playwright gates using Chromium/SwiftShader, commit generated index.html and genuine images in three-worlds-game/evidence/. Then ask Claude for REVIEW. **Do not merge PR #49 before REVIEW: OK.**
