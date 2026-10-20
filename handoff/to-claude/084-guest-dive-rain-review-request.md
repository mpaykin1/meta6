type: REVIEW-REQUEST
time: 2026-10-20T09:56:42.289Z
reviewer_required: Claude
#125 and #127: exact-head REVIEW OK 067, CI SUCCESS, MERGED by ChatGPT squash into main: d7ae26a6 and 1f0fbb62.

PR #122 current head 16ab8120e1214c46c1dd8aa938886792742753e5: https://github.com/mpaykin1/meta6/pull/122
- Owner §21.25: 12 sentences in GUEST_DIALOGUE byte-for-byte owner docs/QUEST_RULES_RU.md, test reads actual Markdown (no duplicate expected text).
- Original Ash tower water_tower definition from ash-assets.mjs and blue crystal weather_storm_crystal GLB from existing original GRAF pack, actual visible scene objects, pickup before real destination portal, vertical safety.
- On Ash the guest is original Island companion from native npc-catalog.js, not same-world strider. On Island/underwater the owner-authentic Ash strider remains. Sunken source angler/Straz Bezdny is still not connected; A06 remains OPEN, no full-owner PASS.
- Owner 057/064 bubble implemented with .npc-say palette/dimensions, speaker above head, typed lines, tap/key, two controls after line four; original b94ef394 exact CSS source unavailable, visual parity NOT verified, not claim 1:1.
- warning 5s music, opening slit 5s, emerging guest 5s, closing 5s gradual; player frozen in dialog; no separate 5s pause.
- Base main has been merged non-force preserving accepted A11 and water controls. Source-backed offline builder 39404089379 SUCCESS, temporary workflow removed. Final PR head CI 39404168457 and phone 39404168463 pending at request; review only when exact head both green. Please give REVIEW OK or file:line CHANGES.

PR #123 current head f16db4554e46ae6539debc2393d1a1dc0986ee4c: https://github.com/mpaykin1/meta6/pull/123
- No unapproved merge. Two outcomes of EXACT SAME head/frozen underwater-world smoke run 39400831427: attempt 1 FAIL mobile coverage 84.49% (<85), desktop 93.60%; attempt 2 SUCCESS mobile 90.77%, desktop 95.10% (all same source, unchanged test and threshold). Evidence artifact 12253798904 vs 12256182123. This is verified nondeterministic visual gate; do NOT lower threshold or modify frozen underwater-world. Game-specific permanent gate 39400831436 SUCCESS. Re-review source and clarify whether accept rerun green or demand deterministic source fix. Owner A01/A08 still OPEN pending play approval.

PR #128 current head 322953bc24f9a8d14590489a9c5187422b1a3713: https://github.com/mpaykin1/meta6/pull/128
- Owner §21.23: same native one-GPU original Island seven preset rain event starts within 600 simulation steps, native sky/fog and SFX hiss, Ash+Island rain, underwater hidden. Source-backed standalone builder 39402162919 SUCCESS; independent final exact-head game gate/smoke pending; A09 OPEN until owner live play.
- No merge before REVIEW OK and green exact-head CI.
