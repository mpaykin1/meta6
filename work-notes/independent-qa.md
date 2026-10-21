# Independent QA work notes

## 2026-10-20T12:04Z — prior audit
Earlier QA note carried forward from branch ai/chatgpt/independent-qa-review-20261020: work-notes was absent on main; PR #136 had no tests and exact-head check was skipped. No owner verdict was assigned.

## 2026-10-21T11:38:39Z — current audit
Repo: mpaykin1/meta6. Main SHA c6c70ab64f3351ef67e880a1d34095353ab877bf.

Required files reread from main: three-worlds.md (f9ffe47e835edcf045b4be642ff962c6de1d651f), docs/THREE_WORLDS_MERGE_RU.md (1d60595ed905ad04f11b932d986619ce8d4ffa83), AGENTS.md (d202d607fcab8f0099780f235561a2a029865405), graf.md §27 (26952fd351373100d9456b6d571cb7af3868b58e), underwater-world/CLAUDE.md (34f39f6355c8955012cad96539c51c39cb3a372e).

Memory gap: work-notes/ is absent on main. Prior QA branch contains independent-qa.md, qa-addendum.md and underwater-details.md. No SRE or Builder note was found in inspected SRE/Builder branches.

Stage selection BLOCKED: three-worlds.md says stages 0–9 merged and next stage 7b; design §17 says next stage 1 while §11 lists stages 1–6. No owner clarification found. No stage claimed.

Read-only candidate: PR #164, head 294f8b12a00fe2a6ad6f1eb42d7a4f2456f9e611, base main c6c70ab64f3351ef67e880a1d34095353ab877bf. It modifies underwater-sumerek/, not the primary underwater-world/ integration directory, so it is not certified as a Three Worlds stage deliverable.

Exact-head workflow run 39589915601, job 119188016628:
- Golden references unchanged: success.
- Ashen build reproducibility: success.
- Underwater build reproducibility and shader numeric guard: success.
- Playwright/Chromium install: success.
- Live smoke command node underwater-sumerek/tests/fish-tail-browser.mjs: FAILURE at line 84.
- Memory-integrity: success. Merge check: skipped.

Confirmed test defect: assertion expects canvas backing buffer 1280x720; Chromium reports 1024x576, scroll 0,0, gameState play, biome sunken, seed 424242, registry errors empty, uwFail false. Source index.html lines 3251–3255 configures perf.scale=0.8 and renderer.setPixelRatio(pr), so the drawing buffer is intentionally scaled. Assert canvas.getBoundingClientRect() against the CSS viewport; check scroll separately and test backing-buffer scale separately. Screenshot-change and console-error assertions after line 84 were not reached; UNKNOWN.

Cross-company review remains BLOCKED: no submitted PR reviews found. Direct PR-comment action was blocked; this note carries the reproduction/handoff. This QA session ran no local browser/test command; it inspected exact-head CI logs and source only.

Next: Builder fixes the assertion and reruns exact-head CI; QA checks the new head and the later screenshot/console assertions. Owner clarification is needed before selecting the conflicting Three Worlds stage. No owner PASS/FAIL assigned.
