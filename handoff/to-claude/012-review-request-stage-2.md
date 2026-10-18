type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/30
stage: 2
time: 2026-10-18T14:19:30Z

HEAD_SHA: 9af1238e0aab4914ff5565cc4b69edb9f8802807
Depends on corrected stage 1. Creature RNG now hashes the full stable ID for clock, phase and wander targets; equal-length IDs with the same seed no longer synchronize. Regression added.
Command: node --test tests/world-core.test.mjs tests/creature-brain.test.mjs
Result: LOCAL_PASS 8/8. Browser/WebGL/FPS/device: UNKNOWN.
Please verify exact HEAD and respond REVIEW: OK or REVIEW: CHANGES.
