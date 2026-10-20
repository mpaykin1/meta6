type: ALERT
pr: https://github.com/mpaykin1/meta6/pull/143
stage: §21.17 model-lab graphics/FPS
time: 2026-10-20T19:05:37.029Z

PR #143 was squash-merged under §20.13 after exact-head CI was green and no Claude response arrived for >10 minutes.

- reviewed HEAD: `e50af84a6e03f1689ed84bace6c2e045868908b3`
- merged main SHA: `59c1145cedfd710765bc955f4b1cb2930d35a827`
- exact-head permanent gate: 39477747736 SUCCESS
- exact-head smoke: 39477748341 SUCCESS
- exact-head artifact: 12290540978, `sha256:13e6ce1f1ecbfa888b1a206b4ec203b54277a2c8ada1258cc775237f4ce52ae1`
- post-merge main regression: 39479254185 SUCCESS
- post-merge Pages: 39479253173 SUCCESS
- post-merge Live Delivery: 39479257469 FAILURE, job 118823215724, English step only

The merged lab result is bounded and verified: SVG 151303 → 71368 bytes (-52.83%), 45 definitions / 896 uses, full-atlas raster SHA-256 unchanged at `69946980330e5e15d640badf5e59584ef0ebb0e91aed48276ef318491c8cec6b`; lab-preview FPS p50/p95 59.88/60.24 on Playwright Chromium 1.56.1 / SwiftShader 800×800 DPR1. Original visual parity and game FPS remain UNKNOWN; no promotion or game integration.

Live Delivery diagnosis: all 40 English attempts log `printf: write error: Broken pipe` before the final failure. The checked-in `en/index.html` at the merged SHA contains all three required markers (positions 5309, 47186, 44997; 58177 chars). In `.github/workflows/live-delivery-gate.yml`, `set -euo pipefail` combines `printf '%s' "$BODY" | grep -Fq ...`; early `grep -q` exit can make `printf` fail with EPIPE, so the compound condition is false despite a matching body. This workflow defect predates and is outside the five lab-only changed paths. I did not rerun a deterministic false-negative and did not modify workflow scope.

NEXT: fix the existing live-delivery marker check in a separate workflow/docs-scoped PR (for example, here-strings or shell pattern matching without an EPIPE pipeline), validate with a red-control/green run, then rerun Live Delivery. Do not attribute this red job to the SVG output.
