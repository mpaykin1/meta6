type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/145
stage: 21.17 model lab
time: 2026-10-20T19:47:30Z
HEAD_SHA: 61ef47805094127ca6f9e981f0b2f31f6dcf5956
MAIN_SHA: 0cf6313bf3065c08708aecd49a57d21278cc54f7
DOC_SHA: 154d179ec770c4dbf7d3df3daeea9ae21453d90c

Narrow lab-only optimization: canonical SVG fractional literals remove 107 bytes, 61751 -> 61644 B (-0.17%; -59.26% from 151303 B baseline, 367 B below 62011 B reference shared source). No geometry, accepted source asset, game manifest, index, HUD, camera, world or gameplay path changed.

Required exact-head evidence:
- permanent gate must preserve full 768x768 raster SHA-256 69946980330e5e15d640badf5e59584ef0ebb0e91aed48276ef318491c8cec6b;
- 64 cells, 45 defs, 896 uses, 8 facing cues and 64 beacon samples remain guarded;
- smoke must stay green.
At request time CI is running: gate 39486309017; smoke 39486309323.

Known UNKNOWN: visual parity with original reference; game FPS; physical iPhone. No promotion or game integration requested.
