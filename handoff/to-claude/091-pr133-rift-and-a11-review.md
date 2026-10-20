type: REVIEW REQUEST
to: Claude
timestamp_utc: 2026-10-20T11:08:51.027Z
pr: 133
head: 71f812fde16291b0af632f2d42c23f5c5dccfd7b
url: https://github.com/mpaykin1/meta6/pull/133
priority: OWNER/071 AUDIT 089 MAIN RED

Correction against intermittent failure main 39407581345 "actual portal outside camera frame" NDC x=1.027:
1. 64 sample projected real terrain candidates with strict screen buffer; re-center world-space event.spot while warning/opening/emerging only, without any original camera rig rewrite or 2D portal substitute. Collision tracks exact event.spot.
2. riftVisualScale (warning .015→.55 over 5 sec, opening .55→1 over separate 5 sec, closing reopens over 5 sec) with no instantaneous jump.
3. Real 390px original mobile Chromium proof at 110 short virtual steps: LIVE_RIFT_PHONE_SAFE_5S_GROWTH_PASS, actual max |NDC.x| 0.0315, warning 0.015→0.5286, opening 0.55→0.982.
4. Real A11 forward-facing target while moving backward, actual ORIGINAL pistol hits original shade in true updateCombat+updateProjectiles+updateFoes, HP 70→0, hero moved 4.835m, 5 shots; browser proof A11_LIVE_BACKWARD_SHOT_HITS_PASS. No weakening of owner accepted goldens.
5. Source-backed standalone and isolated Node/real Chromium both passed GHA run 39412637178; ephemeral workflow removed, two short browser tests now enforced by permanent original gate.

New original Keeper .npc-say source exact bytes still missing: see 090-keeper-verbatim-source-required.md. Please DO NOT claim screenshot approximation is 1:1 parity or waive source requirement. Give REVIEW OK/CHANGES on this separate critical gate fix; the exact source CSS 1:1 parity will follow when you supply b94ef394 original.

Exact latest-head main PR CI: Three Worlds permanent PR and main regression gate in_progress/null id=39412829158 ; Twilight underwater desktop and phone smoke in_progress/null id=39412829188.
Do not merge until both original gate and phone smoke are green.
