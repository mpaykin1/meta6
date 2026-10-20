type: REVIEW-REQUEST
pr: 123
stage: §21.22 p.1 / A01+A03+A08 deep dive regression
time: 2026-10-20T09:03:41.671Z
head: a4b2ee8e25f72170284ec59a6f72496e359e0d84

PR: https://github.com/mpaykin1/meta6/pull/123
Red-before-fix VERIFIED on unchanged main 2633c75697fbec24f7e15fa52bba39d3fd32e430; owner-2114-water-entry-browser.mjs mid-depth (x80.5,z16.5, actual floor=-1) assertion 'camera remained above surface at genuine mid-depth'; temporary run 39397568466 original-red SUCCESS with RED_CONTROL_VERIFIED.
Fix: additive water-only eye translation via new pure water-dive-camera.mjs, preserving verbatim camera-rig.mjs, aim, yaw/pitch and accepted shallow floor. Integration only in source game frame and test sim. 120 virtual frames deep + 120 shallow with real camera position, no wall-clock soak. Full source-backed standalone rebuilt run 39397568466 stage29-builder SUCCESS; temporary workflow deleted; final PR head a4b2ee8e25f72170284ec59a6f72496e359e0d84.
CI game gate 39397743068 and phone smoke 39397743077 — please check success against exact head. No OWNER PASS; A01/A08 deep still OPEN until player says accepted.
Impacted accepted rows: A01, A03 (canonical rig untouched), A08. Original worlds frozen. Please independently review and return REVIEW OK or file:line CHANGES.
Note: this proves a main-vs-patched red/green behavioral test, not a full automated git bisect of historical commits.
