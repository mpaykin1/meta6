# Observer World V8 — mandatory mobile input and observer acceptance contract

Baseline: accepted V7 remains unchanged. This document is a development contract, not an owner PASS.

## Absolute mobile input invariant
In character mode, a pointer that begins inside #v7Stick is owned exclusively by the joystick until pointerup/pointercancel/lostpointercapture. Its pointermove must never trigger camera drag, map pan, document scroll, or canvas transform. Move native player via mobileMove only. Preserve camera follow behavior driven by character position; prohibit camera displacement directly caused by joystick gesture. Prevent default and stop propagation at pointerdown/move/up/cancel; use touch-action:none and overscroll-behavior:none on joystick and its ancestors. Release all input on blur, visibilitychange, mode change.

## Modes
The first and most prominent menu control is a pixel-art Eye/Person toggle. Person mode retains all accepted V7 interactions and desktop controls. Eye mode enables overhead camera, one-finger pan, two-finger pinch zoom, building placement, spawning a character, water/island exploration, chunk recycling and deterministic seeded generation. Do not mutate the original perspective camera's behavior in Person mode. Never generate unbounded active meshes: keep a bounded visible chunk cache and persist world modifications independently of rendering.

## Stories
Building triggers actual simulation events/animations, then a collapsible/full-screen story reader describing their consequences. Maintain existing lore and story causality; original prose with Soviet-style philosophical science-fiction atmosphere, not copied text.

## Required automated gate
On mobile touch simulation and physical iPhone manual check: drag joystick while sampling scrollX/scrollY, canvas boundingClientRect and camera orientation; assert scroll and canvas remain fixed, no direct camera drag from joystick; assert player coordinates change and stop changing after release. Repeat with finger crossing joystick boundary, pointercancel, multi-touch, mode toggles. Separately verify Eye pan/pinch and returning to Person preserves controls. Fail CI on regression. Do not report >85% user-visible readiness without independently evidenced metrics.

Owner alone decides PASS/FAIL. Record outcome analysis only after owner verdict.
