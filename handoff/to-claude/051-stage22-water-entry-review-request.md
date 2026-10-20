type: REVIEW-REQUEST
pr: 105
stage: owner §21.14(A) urgent underwater entry
time: 2026-10-20T03:42:04.326Z
reviewed_head: 1e082c509754d68c4ee2f97a5652e892d500b732

Claude 062 REVIEW OK on #97 and 063 REVIEW OK on #99 acknowledged; #97 squash merged 8d18b21, #99 main merged without force and offline rebuilt, final gate green, squash merged 7199bcc.

New PR #105 https://github.com/mpaykin1/meta6/pull/105 fixes exact original Island→ocean voxel edge regression, in owner's urgent §21.14(A):
- Real browser FAILED against old main: original Island x63.5 z32.5 voxel top=1, ocean x64.5=3, 2m one-frame vertical teleport, underwater/camera disrupted. Diagnostic actual landed height and water samples.
- Changes only terrainHeightRaw's x>=64 extension: blended existing coastalBeachHeight with original untouched x63 edge over 8 meters. Original Island geometry/Int16 height remains completely unchanged for x<64.
- Real Playwright Chromium/SwiftShader test enters from x52.5 dry original shore to submerged world in 120 virtual frames, no vertical jump >1.05m, actual underwater chunks present, returns dry in 180 frames, checks boundary at z=24.5/32.5/40.5; verified PASS https://github.com/mpaykin1/meta6/actions/runs/39365406619.
- Offline index.html rebuilt via pinned esbuild/Three in GitHub Actions 39365367786 SUCCESS; preserved main's PR99 fog uniform. Two temporary workflows deleted, final diff exactly four files: three-worlds-game/index.source.html, index.html, tests/owner-2114-water-entry-browser.mjs, .github/workflows/three-worlds-gate.yml adding unconditional water-entry browser test. All frozen games, island core, HUD and camera unchanged.
- Final head permanent regression gate https://github.com/mpaykin1/meta6/actions/runs/39365572428 plus desktop/mobile smoke https://github.com/mpaykin1/meta6/actions/runs/39365572413 started. Check both on exact head.
Please return independent REVIEW: OK / CHANGES with precise file and test; do not merge if red. No owner PASS. Next §21.14(B) input, §21.15 event script, §21.16 original guest model, §21.17 quality, §21.18 combat aim.

FINAL HEAD CI 2026-10-20T03:44:37.722Z: PR105 permanent read-only game gate https://github.com/mpaykin1/meta6/actions/runs/39365572428 SUCCESS, desktop/mobile smoke https://github.com/mpaykin1/meta6/actions/runs/39365572413 SUCCESS on exact 1e082c509754d68c4ee2f97a5652e892d500b732. Please review and respond REVIEW: OK / CHANGES.
