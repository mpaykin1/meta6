## Current V6 gameplay implementation (2026-10-16)

**The owner's visual approval is V5; V6 adds historical gameplay without touching the original perspective camera.**

- [Open playable V6](https://mpaykin1.github.io/meta6/observer-world-en-v6/)
- [V6 code and complete source map](observer-world-en-v6/CLAUDE.md)
- [36 original-atlas building architectures](observer-world-en-v6/building-assets.js)
- [16 animated character roles](observer-world-en-v6/npc-catalog.js)
- [NPC fighting, companions, betrayal, hero death and New rebirth](observer-world-en-v6/combat-relations.js)
- [Causal history and full-screen reading](observer-world-en-v6/story-system.js)
- [V6 tests](.github/workflows/observer-v6-gate.yml)

Keep V5 untouched as approved visual reference. Use V6 as the game currently being developed. The user should not need to re-upload files in any chat. Writing changes still requires connected GitHub permissions.

# CLAUDE — meta6 / Observer World

This repository contains multiple game editions. The **current exact-reference implementation** is [Observer World V5](observer-world-en-v5/).

**IMPORTANT:** The owner provided the full original HTML “Остров сумерек (1)(5).html” (SHA-256 `fdbda0240b53f49d6e34aa0965531856e31a0154f4a12339e1682d60d5fe5c1f`) and its screenshot. The intent is to use the **exact original Three.js 3D renderer and camera**, NOT to approximate it using a separate 2D painter. The full game and existing physics must remain editable and reproducible.

Start here: [observer-world-en-v5/CLAUDE.md](observer-world-en-v5/CLAUDE.md).

Source of the running 3D game, all shaders, terrain, water, camera, effects, enemies, weapons and original sounds: [observer-world-en-v5/index.html](observer-world-en-v5/index.html). Editor and bottom buttons: [observer-world-en-v5/editor.js](observer-world-en-v5/editor.js). Additional Krieger music: [observer-world-en-v5/audio.js](observer-world-en-v5/audio.js).

Original source archives: [expanded original](observer-world-en-v4/reference/ostrov-sumerek-expanded-original.html) and [first original](observer-world-en-v4/reference/ostrov-sumerek-original.html).

The owner requires all non-building controls in a collapsible menu, bottom row for placement of historical objects, and game viewport otherwise mostly unobscured.

Live version: https://mpaykin1.github.io/meta6/observer-world-en-v5/

Technical gate: [V5 CI](.github/workflows/observer-v5-gate.yml); requires original camera code unchanged and actual WebGL building placed in headless Chrome. **Visual equivalence to screenshot, iPhone sound, AI integration, full history are NOT owner-PASS.** Never assert they are done merely because CI is green.

All game source links: [SOURCE_INDEX.md](SOURCE_INDEX.md) and [game-source-index.json](game-source-index.json).

Do not overwrite previous accepted V2–V4; do not use paid APIs or print tokens; do not merge speculative breaking code without tests and owner's PASS.
