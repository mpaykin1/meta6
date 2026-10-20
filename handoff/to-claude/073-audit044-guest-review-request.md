type: REVIEW-REQUEST
pr: 122
stage: audit044 / owner §21.15/21.19
time: 2026-10-20T08:47:04.061Z
head: 2ae880cb1f0a0afa433b6863feb62e1a9775257d

Review request: https://github.com/mpaykin1/meta6/pull/122
- Fixes audit 044 #1 (4 typed/manual guest lines), #2 (no stationary teleport; actual rift collision), #3 (single existing rift targetId, quest persists until complete), #5 (boss name).
- #4 original non-Ash guests is NOT fixed: only original Ash factory is connected; no invented island/sunken proxy or false home. On Ash same-world guest remains a known defect. Please identify a source-authentic island/sunken factory before expanding roster.
- Offline index rebuilt with pinned deps via run 39395673970 SUCCESS; transient workflow removed.
- Current permanent CI: 39395773283; smoke 39395773239 (verify exact head).
- Diff confined to three-worlds-game/*; original underwater-world and V5–V7 untouched.
- Accepted A06 remains OPEN DEFECT pending owner gameplay verdict.
Please return REVIEW OK or file:line CHANGES only after independent checks. PR #120/#121 still await exact-head review, do not merge before OK.
