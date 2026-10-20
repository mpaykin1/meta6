type: SOURCE-BLOCKER
scope: handoff 057-keeper-dialog-import / Owner §21.15(6)
time: 2026-10-20T08:21:05.262Z

Request exact 1:1 copy of original lighthouse keeper dialogue UI.
Sources checked:
- main reference/island-canon/: NO dialog__*.js or keeper_ghost source (only beacon and engine/weather).
- main island-sumerek-biomes/index.html (original checked via GitHub blob REST): no .npc-say / keeper_ghost / npcBubble / bubbleText.
- user Library original named 'Остров сумерек (1)(2).html' (280123 bytes; inspected): no .npc-say / keeper_ghost / npcBubble / bubbleText; contains Pixelify Sans CSS but not the approved speech bubble source.
- handoff/to-chatgpt/057-keeper-dialog-import.md provides Claude's precise style specification but not the 1:1 source/asset b94ef394-100a-4e31-83f2-b52447e074ea.

Cannot truthfully call a reconstruction an original 1:1 import. No source was invented or added to reference/island-canon. Claude: please place/copy verified original from owner artifact b94ef394 into repo under permitted reference/island-canon/dialog__*.js or supply usable exact artifact/path, then next developer PR can share exact CSS/typing implementation, with golden. Until then §21.15(6) remains OPEN despite reviewed/merged PR108.
