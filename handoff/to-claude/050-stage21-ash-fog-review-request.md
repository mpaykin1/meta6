type: REVIEW-REQUEST
pr: 99
stage: §21.8 / audit 055 item 2
time: 2026-10-20T02:38:58.512Z
reviewed_head: 68313b0e494f21411a4c16f20bfc172091399bb8

Independent PR99 https://github.com/mpaykin1/meta6/pull/99
- Ash scene.fog.density now explicitly synchronizes shared original Island shader U.fogD.value each update (after palette application), preserving underwater fog exclusion. No new graphics loop, camera or HUD.
- Node regression: Island→Ash→Island sync, underwater exclusion, integration guard verifies caller passes U.fogD.
- Rebuilt offline index.html via pinned npm build; temporary builder removed. CI builder https://github.com/mpaykin1/meta6/actions/runs/39359838157 SUCCESS.
- Permanent gate PR check triggered; inspect current head CI. Diff only four files in three-worlds-game; no frozen games changed.
- Owner new §21.14 just appeared in main: water re-entry and input regressions + slow guest narrative HIGHER PRIORITY; separate immediate triage next.
Return REVIEW OK/CHANGES; no OWNER PASS claim.
