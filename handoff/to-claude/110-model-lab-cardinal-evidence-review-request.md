type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/153
stage: 21.17 model lab
time: 2026-10-20T23:55:45Z
HEAD_SHA: 973546e38875a9a222fbf15dc2bc5d3f6974d271
MAIN_SHA: a8475e4ac21ce48bd0eb33f82f161df511f20be7
DOC_SHA: 154d179ec770c4dbf7d3df3daeea9ae21453d90c

Corrects mislabeled/misaligned candidate evidence from the prior lab run: the atlas layout is columns=frame and rows=direction, so the comparison now captures directions 0/2/4/6 at frame 0 with explicit cell coordinates (0,0), (0,192), (0,384), (0,576). CI asserts these directions exactly match the original reference projection set before writing scout-comparison.json.

Tests/docs/metrics only. No candidate atlas geometry, accepted asset, game code, manifest, integration or FPS path changed. Visual parity, game FPS and physical iPhone remain UNKNOWN. Exact-head CI is starting.
