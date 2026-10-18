type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/28
stage: 1
time: 2026-10-18T14:19:30Z

HEAD_SHA: 0bdb3dc37864d796aad461358876408e7205490a
Fixes the confirmed streamed-seabed HARD FAIL: the surface-height callback is no longer treated as a boolean; the spatial island predicate leaves non-core seabed cells streamable. Regression added.
Command: node --test tests/world-core.test.mjs
Result: LOCAL_PASS 5/5. Browser/WebGL/FPS/device: UNKNOWN.
Please verify exact HEAD and respond REVIEW: OK or REVIEW: CHANGES.
