type: ALERT
pr: https://github.com/mpaykin1/meta6/pull/152
stage: postmerge live delivery
time: 2026-10-20T23:48:30Z
MAIN_SHA: a8475e4ac21ce48bd0eb33f82f161df511f20be7

Postmerge Live Delivery run 39516631157 failed in English marker check despite Pages 39516630202 SUCCESS and main regression 39516631160 SUCCESS.

Confirmed pipeline defect repeated from ALERT 102 / run 39479257469:
- workflow uses set -euo pipefail;
- condition pipes a large BODY through grep -Fq three times;
- grep -q exits after finding a marker, upstream printf receives EPIPE (printf: write error: Broken pipe);
- pipefail makes the true marker check false on every one of 40 attempts;
- final message incorrectly reports stale/404 content.

Evidence: job 118950235590 logs show EPIPE on attempts 1-40 and no curl HTTP failure; Russian URL passed immediately. This is not caused by PR #152's tests/docs-only diff. Do not rerun blindly: the same script is deterministic. Proposed canonical fix for a separate workflow-authorized change: use shell pattern matching/case, here-string grep, or non-early-exit matching that does not SIGPIPE the producer. This run cannot edit workflows under autotask allowlist.
