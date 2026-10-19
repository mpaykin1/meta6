# Stage 8 — missing underwater assets / evidence queue
Source: Claude REVIEW OK 034, §20.2 D, owner correction 032 and graf.md §27.
Stage 7 merged: PR #49, squash 5eef11e974d2fbca4a75173edfbf3b1aef9cc1ae. Owner PASS/FAIL remains UNKNOWN.

Unfulfilled or not proven in Stage 7:
- Galleon: MISSING, no matching GLB in known 19-model catalog.
- Whale skeleton: MISSING.
- Anchor: MISSING.
- Cannon: MISSING.
- Kraken tentacles: MISSING, no new ad-hoc creature permitted.
- Sun rays: UNKNOWN / not proven.
- Marine snow: UNKNOWN / not proven.
- Plankton: UNKNOWN / not proven.

Before any implementation, inspect existing assets in `underwater-world/models/`, `three-worlds-game/models/` and `reference/`; reuse only approved assets/systems; don't invent replacements, additional panels/buttons or unapproved creatures. Use short code-first assertions and owner correction 032 (max ~60 simulated seconds). No owner PASS is implied by green CI or Claude's REVIEW OK.
