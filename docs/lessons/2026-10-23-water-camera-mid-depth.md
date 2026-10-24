# A01/A08: camera immersion misses intermediate water depth

Date: 2026-10-23  
Repository: `mpaykin1/meta6`  
Observed on main SHA: `ddc656dc7d28928801602eddf23ffbb19d5b406d`  
Source blob: [`water-dive-camera.mjs`](https://github.com/mpaykin1/meta6/blob/main/three-worlds-game/water-dive-camera.mjs), SHA `8a72eb01183c62de99b9117ee265e7ede261aec6`.

## Symptom

The accepted shallow-water behavior remains intact, and the existing live browser test passes both its shallow and deep fixtures, yet some intermediate-depth cells fail to submerge the camera smoothly with the hero.

## Root cause

The source computes:

```js
const deep = bound((seaY - floorY - 2.8) / 1.4, 0, 1);
```

With `seaY=3.8`:
- At `floorY=1`, depth is exactly 2.8. `deep=0`, so the target camera shift remains zero.
- At `floorY=0`, depth is 3.8. `deep≈0.714`; after 120 steps of `dt=1/60`, the isolated source-function harness gives cameraY≈4.679543, still above seaY=3.8.
- The live browser fixture at `floorY=-1` has depth 4.8, so `deep=1` and passes. It does not prove the interval between the shallow and saturated cases works.

This is a test-coverage gap and a confirmed source-formula defect; it is not a verdict on the whole game.

## Reproduction / regression test to add before changing the formula

Use the current `waterCameraShift()` with `seaY=3.8`, `heroY=1.2`, `eyeY=9`, `immersion=1`, 120 steps at `dt=1/60`:
1. Keep shallow fixture `floorY=3.62` and assert shift stays zero.
2. Add intermediate shelf `floorY=1`; assert transition becomes positive and less than the full-deep shift.
3. Add `floorY=0`; assert final cameraY is below `seaY-0.12`.

The current code passes only the shallow assertion in an isolated Node v22.16.0 harness (1/3; exit code 1). The full repository unit suite was not run as part of that harness.

## Required safeguard

After writing the red-first test, adjust only the depth-transition curve in `water-dive-camera.mjs), preserving the accepted shallow-water fixture and original camera rig. Rebuild the standalone with the pinned toolchain and run all tests and the live browser checks in `.github/workflows/three-worlds-gate.yml`. Do not bypass the build-reproducibility `git diff --exit-code -- three-worlds-game/index.html` check. Physical-device validation remains UNKNOWN until performed.

Owner PASS/FAIL has not been assigned. The defect should be closed only after exact-head evidence and the owner's verdict.


## Revalidation — 2026-10-24 (main e7a2c912656d33dade48cb1ed38949e606852d90)

The current main still has source blob `8a72eb01183c62de99b9117ee265e7ede261aec6` and the same threshold `bound((seaY-floorY-2.8)/1.4,0,1)`. A temporary Node v22.16.0 test copied the existing stage29 tests and this exact source: the existing two tests pass 2/2, but do not target the intermediate shelf. The separate focused 3-case reproduction remains 1/3: shallow passes; `floorY=1` returns shift 0; `floorY=0` leaves cameraY=4.679543 above seaY=3.8. This is still a formula/test-coverage defect, not an owner verdict. The stage29 branch remains occupied/HOLD until explicit owner/coordinator release; no source was changed. Full repository CI/browser/physical-device validation remains UNKNOWN.
