# Immutable mobile control acceptance gate — Observer World

This rule applies to every future chat, Claude, Codex, PR and game version. Owner requested 2026-10-16.

- In PERSON mode the screen/camera/viewport MUST NOT scroll or pan when a finger drags the movement joystick. The avatar moves in world coordinates. Camera may follow the avatar only through the original game camera-follow logic, never via document scroll or drag-to-pan from joystick events.
- The mobile canvas is fixed full-screen; document has zero scroll range. Touch gestures on joystick must be consumed with non-passive handlers; release/cancel/blur reset movement. A second finger outside joystick must not cause document scrolling.
- EYE mode is explicitly different: one-finger world panning and two-finger zoom, with camera controls isolated from joystick; placement anywhere in explored world. Person mode retains original combat/build gameplay.
- A regression test MUST drag joystick for several frames and assert: player world position changes, window.scrollX/Y remain 0, canvas bounding rectangle unchanged, no viewport panning from the input, and no unintentional browser touch scroll. Run on actual iOS Safari/WebKit where available, not only desktop pointer emulation.
- Block merges/public PASS until the mobile test proves these invariants. Do not claim success from CSS alone. Only the owner can give PASS/FAIL.
- Eye mode must show consequences and closable/fullscreen literary event reader, keep existing storyline; infinite procedural world must use deterministic seeded chunks, bounded active chunk cache and saved sparse edits.
