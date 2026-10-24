# ABYSS GLOW — owner demo gate and maw-darkness production handoff (2026-10-24)

## Owner-reported defect and decision

- **Confirmed usability defect:** owner was sent the stable `main` game URL to inspect a new maw that existed **only** in PR #229; after extended gameplay the owner never encountered it. This was an invalid owner-facing claim, not failed user navigation.
- **Owner artistic decision:** owner said the existing isolated experimental maw stand was **PASS**. Scope: previously inspected isolated stand **only**. Neither main-game encounter nor later dark-lunge animation is thereby approved.
- **New requirement:** maw must abruptly jump out of a black ocean, approach the camera, open and disappear into darkness.

## Implemented on existing PR #229

1. Source-preserving animation in `abyss-glow/maw-stand/index.html`; uses the original `maw_front_atlas.png`, `maw_front_light8.png`, fixed hinge [108,168] and existing body/emissive parts. Canonical game HTML is not edited.
2. Repeatable 5.4-second cycle: 1.08 s pure darkness, 0.38 s rapid zoom/lunge, 0.84 s looming open mouth, 0.72 s retreat, then black hold. Approach scales relative to jaw pivot; incoming fade preserves existing artwork. Eight light directions continue changing between cycles.
3. `window.__mawAttackTest(seconds,direction)` provides deterministic captures; existing `window.__mawTest(open,direction)` is unchanged for articulation-regression compatibility.
4. New `maw_stand_smoke.mjs` screenshots and pixel assertions for dark/lunge/attack/retreat/reset at desktop 960×540 and touch 390×844. Requires black hold, no draws in darkness, real pixels and both jaw parts during the attack, changed phase hashes and approach scale.
5. Mandatory link policy now in `main:automation/prompts/chatgpt-autotask.md`; five existing task schedules and previous work unchanged. Reviewer links are labelled differently from owner-visible links. See the factory contract in PR #229.

## Evidence / exact scope

- Existing owner stand verdict: **OWNER PASS** as reported in this conversation, **only for the version owner viewed**.
- Updated dark-lunge source and smoke changes: saved to PR #229; code inspected and GitHub commit verified.
- New source/CI/test outcome: **UNKNOWN until exact-head workflows complete**; runtime pixels on external preview: **UNKNOWN**; physical iPhone/FPS: **UNKNOWN**.
- Preview URL verification: **UNKNOWN**. External raw.githack and GitHub Pages inspection was unavailable from this environment, thus do **not** present those URLs as working new-version demos.
- User-facing demo status: **ДЕМОНСТРАЦИЯ НЕ ГОТОВА** for the newly requested darkness animation until external URL is verified; existing technical PR is accessible for independent Claude review.

## Handoff for next scheduled :30/:40/:50 slots

1. Check fresh PR HEAD / base and run new `maw_stand_smoke.mjs` on exact head; verify both profiles and all 5 attack phases; preserve isolated stand and owner assets.
2. Compare screenshot sheet of old visible-at-start vs new dark-to-lunge and record evidence; measure motion visibility and draw-call counts; verify no static substitution.
3. Check successful public hosting of the new branch preview (actual request and loaded atlas/light PNGs), then — and **only then** — set `demo_status=VERIFIED` and offer the exact verified user-facing URL. Otherwise `UNKNOWN`.
4. Request owner review for **new** darkness/lunge behavior. Owner PASS for old isolated stand must not be promoted to full-game/art/iPhone approval.
5. Do not change five task schedules, create sixth automation, open a new PR, merge without independent Claude review or touch canonical original HTML. Run `compact_experience.py --check` from a capable checkout; on this run local complete repository checkout is absent — runner **UNAVAILABLE**, not PASS.
