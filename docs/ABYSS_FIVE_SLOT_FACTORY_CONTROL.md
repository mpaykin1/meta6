# ABYSS GLOW — five-slot factory control plane

State: operational contract; NOT proof of visual quality. Owner's original HTML must remain byte-identical.

## Production order (every hour, Asia/Tbilisi)
- :05 — SCOUT: read main SHA, PR state, CI, visual target, development-memory; select one measurable visual defect and define acceptance.
- :15 — BUILD: implement one isolated asset/animation change with source, deterministic build and before/after evidence.
- :30 — TEST: test rendered result in portrait touch and desktop, measure frame progression, regressions, resource cost and save screenshots.
- :40 — QA: independently verify exact commit SHA, original SHA, asset license, visual evidence, performance and test coverage. Reject failures.
- :50 — DIRECTOR: reconcile the four handoffs, select next priority and issue the next hour's one-task brief. No new PR before current PR is merged.

## Handoff record (write to GitHub, one per slot per cycle)
```json
{
  "schema": 1,
  "cycle_utc": "YYYY-MM-DDTHH:00:00Z",
  "slot": "05|15|30|40|50",
  "repo": "mpaykin1/meta6",
  "base_sha": "40-character sha",
  "pr": 229,
  "head_sha": "40-character sha",
  "objective": "one specific visual or animation defect",
  "change_paths": [],
  "evidence_urls": [],
  "checks": {"browser": "PASS|FAIL|UNKNOWN", "art": "PASS|FAIL|UNKNOWN", "device_fps": "PASS|FAIL|UNKNOWN"},
  "blockers": [],
  "next_action": "one actionable handoff"
}
```

## Strict gates
1. No original HTML modification; no new PR while #229 is open; no merge without independent review and all exact-head CI passing.
2. A green GitHub Action validates tests, not aesthetics. Do not mark ART PASS without comparable actual frames and human/independent artistic assessment.
3. SwiftShader/browser emulation is not physical iPhone FPS. Never infer mobile performance from software rendering.
4. Record a specific verified improvement and regression test before raising readiness percentage. Unverified items remain UNKNOWN.
5. If a slot cannot read a previous handoff, it must log MISSING_HANDOFF and stop dependent mutations rather than assume success.
6. Concurrency: compare SHA immediately before writes; do not overwrite another slot's work. Append independent records only, or reconcile through one director-controlled change.
7. Preserve existing five schedules and all legacy responsibilities.

## Next priority
Get independent review for PR #229; then ship one demonstrable, high-quality animated Gothic scene into a separate offline game candidate, compare against owner's reference and measure real-device FPS.

## Owner-visible demo release gate (mandatory; 2026-10-24)

- All five slots inherit the live `automation/prompts/chatgpt-autotask.md` main rule: distinguish `CODE_FOR_CLAUDE` from `DEMO_FOR_OWNER`. Never hand the owner a `main` Pages link to review content that exists only in an open PR.
- A demo is `VERIFIED` only after opening that exact external URL and proving that its HTML, source images, animation frames and target feature load. Merely fetching source or seeing green CI is not deployment verification.
- Unmerged branch demos are allowed only when the branch-specific **public preview itself** is verified. If external preview cannot be opened and checked, `demo_status=UNKNOWN`, owner-facing response is `ДЕМОНСТРАЦИЯ НЕ ГОТОВА`, and no unverified gameplay link is provided.
- In handoff write `demo_status`, `demo_url` only if VERIFIED, `verified_at`, SHA, page/assets/render feature checks; keep reviewer PR and evidence links labeled as engineering artifacts.
- Owner's 2026-10-24 verdict `PASS` applies strictly to the pre-existing experimental isolated animated-maw stand personally viewed; owner requested a new **spring from complete darkness** behavior. That behavior is separately assessed and is `UNKNOWN` until inspected by owner. Full-game integration and physical iPhone remain `UNKNOWN`.
- Production sequence for new motion: source owner atlas stays immutable; dark hold > short spatial approach > wide-open lunge > retreat into black; browser captures deterministic frames at both touch and desktop and fails absent movement/black frames. Keep canonical `abyss-glow/stand/index.html` unchanged.
