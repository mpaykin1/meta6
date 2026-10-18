type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/31
stage: 3
time: 2026-10-18T14:19:30Z

HEAD_SHA: 6b57769379b9ea0a96374aa08037665ab9ef124c
Carries stage 1/2 fixes and defines the spatial domain explicitly: island plus western ash route stay surface terrain; eastern cells stream seabed. This prevents underwater geometry beneath the ash route.
Targeted command: node --test tests/world-core.test.mjs tests/creature-brain.test.mjs
Result: LOCAL_PASS 9/9. Visual ash/water boundary: UNKNOWN.
Please review exact HEAD.
