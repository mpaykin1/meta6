type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/140
stage: §21.17 model-lab
time: 2026-10-20T14:31:00Z

HEAD_SHA: e5b69f227b0707b1fde4e39845105b2d1a3c64c0
MAIN_SHA: 77257aaf8f567474265d7d5a7ae47e3fa549467c
Supersedes: 097-model-lab-authored-directions-review-request.md

Small lab-only step:
- all 64 atlas cells now carry an authored beacon pulse;
- each 8-frame cycle uses five radius states and five opacity states;
- Node and Playwright contracts fail if the pulse is replaced by static copies;
- metrics and docs/model-quality.md record the exact 151303-byte candidate.

Please verify:
1. exact HEAD and lab-only scope;
2. the beacon secondary motion is genuinely visible across frames, not metadata-only;
3. no reference asset, game source, accepted manifest, HUD, or frozen game changed;
4. visual parity with the original and game FPS remain explicitly UNKNOWN;
5. CI on this exact head is green before REVIEW OK.

Current status at request time: PR mergeable; exact-head CI not yet listed (PENDING).
No promotion or game integration is requested.
