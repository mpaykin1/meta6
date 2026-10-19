type: REVIEW-REQUEST
pr: 49
stage: 7
branch: ai/chatgpt/stage-7-playtest
developer_sha: 9b556c324af25a837966ecb209797003449d1b92
bundled_head: d1444ebefb17882b505d671b4a9aa030e3aa6878
owner_verdict: UNKNOWN
ready_for_review: yes (PR is NOT draft)
rule: 032 overrides 029.1; 9000 steps canceled; virtual max 60 s / 1800 steps.

Claude, review the current head of PR #49 against 029 except canceled point 1, with 027 and 032 active.

029.2: the live renderer and the pure Node tests now use the SAME ocean-placements.mjs for seeded per-chunk placement, and three-worlds-game/tests/ocean-placements.test.mjs checks positive ruin/wreck/fish/plant categories on three seeds. Existing five-minutes.test.mjs now tests one 60-second virtual guest cycle independently.
029.3: the accepted island's eastern approach x58..76 uses coastalBeachHeight through terrainTop and beachPatch (real renderer/collision), tested by half-meter samples and the actual Chromium realShore array: start immersion 0, end 1, no step >0.15, no slope >20 degrees. Evidence: three-worlds-game/evidence/stage7-browser.json.
029.4: guestHomeFor(world) selects a home different from the active world, confirmed in three-worlds-game/tests/rift-story.test.mjs. The old visual visitor rig uses the existing scavenger animation; no new creatures introduced.
029.5: real loaded names by seed are reported in evidence/stage7-browser.json populationBySeed[].present and .missing. Source GLB catalog lacks galleon, whale_skeleton, anchor, cannon, kraken_tentacle. No provable implementation for sun_rays, marine_snow, plankton. Honest status: MISSING / UNKNOWN; do not mark these features as delivered. Only existing models may be used (graf §27).
029.6: existing cathedral/wreck landmark anchors emit bubbles at >10 blocks from the player via the SAME live bounded ring allocator (96 slots), test in tests/ocean-placements.test.mjs. Browser confirms bubbleCount 89/96 during diving.
Previously resolved: warning before rift, debug 5s URL flag, recurring timer, G islands, camera two pointer inputs.

Validation:
- Github Actions [run 39225157353](https://github.com/mpaykin1/meta6/actions/runs/39225157353) on HUMAN 9b556c3: SUCCESS.
- Actual `node --test three-worlds-game/tests/*.test.mjs`: 34/34 pass, 0 failures, 649.7 ms (new fresh evidence/unit-tests.txt).
- Rebuilt standalone index.html committed by bot d1444ebe; Chromium/SwiftShader stage7-browser.json updated after 60 virtual seconds; no extra 31-frame loop.
- Physical iPhone/real GPU/owner PASS: UNKNOWN.

Please return REVIEW: OK or concrete CHANGES. No merge until REVIEW: OK and owner gate.
