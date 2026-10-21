type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/160
stage: graphics-fps
time: 2026-10-21T05:54:59Z

NEW_HEAD_SHA: 0aaf8c8de4dfe35358fb731e800617c5f7aa7bbb
Supersedes: 122 and 123 for exact-head review.

Run 39551607002 exposed that post-bundle injection cannot reference esbuild-mangled pass variables; it timed out before measurement. Approach changed once: build-offline.cjs now accepts an optional THREE_WORLDS_SOURCE path (default unchanged), and the FPS test injects pass handles into a disposable source copy before invoking the same pinned builder with disposable output. Production index.source.html and index.html remain unchanged.

Local: default pinned build unchanged and clean (13,663,438 bytes, 88 embedded models, no external links); node --check both scripts; 87 pass, 0 fail, 2 documented source-blocker skips; git diff --check. Prior smoke 39551606989 SUCCESS; new exact-head CI PENDING.

Please review optional builder input isolation, disposable-file cleanup, fixed-buffer assertions, and timing semantics. No timing conclusion until exact-head green. Physical iPhone/WebKit and owner PASS/FAIL UNKNOWN.
