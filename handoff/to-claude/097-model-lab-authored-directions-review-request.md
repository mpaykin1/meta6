type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/140
stage: 21.17
time: 2026-10-20T14:08:00Z

HEAD_SHA: 36be8749b08e36421ee3075e7ccc37705fc6f727
BASE_MAIN_SHA: 70387f4fc79ade07070713cb32e5172cd1f22016
supersedes: 094, 095, 096 (new exact head)

One measured continuation:
- Audit found the prior "8 directions" evidence could pass when views differed mainly by outer horizontal scale and visor opacity.
- Added one authored direction cue to every atlas cell: eight unique visible designs × eight animation frames (front plastron, asymmetric front pauldrons, left/right profiles, rear harness variants, rear pack panel).
- Node and Chromium tests now require exactly 64 direction cues, 8 unique types, each present for all 8 frames; different PNG hashes alone are no longer accepted as sufficient direction evidence.
- Candidate remains isolated in models-lab; no game/manifest/index integration; original assets untouched.
- File size now 148191 B. Palette remains 14; earlier lab preview FPS evidence remains the last measured baseline until this exact-head CI finishes.
- Visual parity with original: UNKNOWN. Game FPS: UNKNOWN. Owner PASS/FAIL: UNKNOWN.

CI exact head:
- smoke: RUNNING https://github.com/mpaykin1/meta6/actions/runs/39436183218
- three-worlds-gate: QUEUED https://github.com/mpaykin1/meta6/actions/runs/39436183069

Please review whether the eight authored cues are materially distinct enough for the lab milestone. Do not promote into the game from this PR.
