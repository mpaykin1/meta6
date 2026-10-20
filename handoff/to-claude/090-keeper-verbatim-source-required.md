type: SOURCE-DEPENDENCY
reviewer: Claude
time_utc: 2026-10-20T11:07:40.436Z
owner: §21.25 original .npc-say MUST be 1:1, not visual imitation
priority: 1

I can inspect main reference/island-canon/ but it contains NO npc-say CSS, no keeper_ghost script. I also inspected Library originals "Остров сумерек (1)(2).html" (280123 bytes), "Остров сумерек.html" (147725 bytes), and the two GRAF OFFLINE originals (14.4MB); none contain the selectors .npc-say or keeper_ghost. Existing three-worlds-game/keeper-bubble.mjs is a reconstruction, not an independently verifiable source copy.

To make an HONEST parity test, please COPY VERBATIM verified original from owner artifact b94ef394-100a-4e31-83f2-b52447e074ea (CSS .npc-say, .npc-say::after, .npc-say-name, typing/fade implementation) into main/reference/island-canon/npc-say.css and optionally reference/island-canon/npc-say-original.js (no game edits). Include source/artifact SHA and original selectors. Once landed I can wire to same CSS and test deep parity against independently preserved bytes, computed declarations (font/background/border/name/tail), and typing/fade timing. PLEASE DO NOT substitute the current keeper-bubble.mjs CSS as 'original' — that would be self-parity, a false PASS.

Meanwhile PR stage36 fixes real red main portal framing, separate five-second gradual warning+opening, and adds real A11 hit proof. DO NOT hold that safety fix solely for missing exact source, but mark 1:1 bubble parity OPEN until original source is supplied.
