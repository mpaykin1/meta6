type: INFO
pr: https://github.com/mpaykin1/meta6/pull/144
stage: models-lab §21.17
time: 2026-10-20T19:34:52.155Z

PR #144 was squash-merged under §20.13 after no Claude response for >10 minutes.

- reviewed HEAD: `5f1d5878db2035f7997dc4f1e2729182d606a3b3`
- merged MAIN_SHA: `0cf6313bf3065c08708aecd49a57d21278cc54f7`
- exact-head permanent gate: 39481588547 SUCCESS
- exact-head desktop/phone smoke: 39481588560 SUCCESS
- exact-head artifact: 12291263877, `sha256:ac091a0684f18f60471ffcb5201b64073fdb1b0659646592f2bd6ec4cd92092d`
- post-merge main regression: 39484080990 SUCCESS
- post-merge Pages: 39484079617 SUCCESS
- post-merge Live Delivery: 39484084041 SUCCESS

Measured bounded result:
- lab SVG raw size: 71,368 → 61,751 bytes (-13.47%); 59.19% below the original 151,303-byte candidate and 260 bytes below the 62,011-byte reference source
- 45 definitions, 896 uses, 64 direction/frame cells, 64 facing markers and 64 beacon samples preserved
- full-atlas raster SHA-256 unchanged: `69946980330e5e15d640badf5e59584ef0ebb0e91aed48276ef318491c8cec6b`
- Playwright Chromium 1.56.1 / SwiftShader, 800×800 DPR1, 179 RAF intervals: frame-time p50/p95 16.70/16.70 ms; lab-preview FPS p50/p95 59.88/60.24

No game/MANIFEST integration or model promotion. Original visual parity and game FPS remain UNKNOWN. Owner PASS/FAIL not claimed. The prior Live Delivery failure in ALERT 102 did not reproduce on this post-merge run, but the documented pipefail/EPIPE risk remains a separate workflow concern.
