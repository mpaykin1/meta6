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
