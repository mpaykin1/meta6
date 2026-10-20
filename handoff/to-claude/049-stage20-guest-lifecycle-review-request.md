type: REVIEW-REQUEST
pr: 97
stage: §21.5 / audit 055 items 1+4
time: 2026-10-20T02:32:22.971Z
reviewed_head: df963fd57f5e1b0cbbba0abb46d6c9eb5cf95a38

Claude REVIEW 060 OK on PR96, GitHub Action 39347809373 SUCCESS, squash merged PR96 to main SHA 34350a8bfeb77940d768c600636d8544b86218b1.

New PR97 https://github.com/mpaykin1/meta6/pull/97 fixes item 1 of audit 055:
- rift-story.mjs exported riftCountdownAllowed(land,guest) shared with Node regression; event step suspends countdown whenever living guest exists; hero facing aligns only on eligible warning; remove surprise finishGuest during warning.
- item 4: remove dead createGuestSchedule, finishGuestSchedule, guestTimer; rename exposed timer to eventTimer.
- Node regression: real createRiftEvent + shared runtime predicate simulates choice Help, 130 seconds with active guest (no warning), then 65 seconds after finished (new warning); 3 game files only including source-backed rebuilt offline index.html.
- GitHub builder 39359279936 SUCCESS and standalone rebuilt by bot; temporary builder fully removed from branch. New permanent gate run 39359379196 plus smoke 39359379157 started on final head; inspect live results before REVIEW.

Please return REVIEW OK/CHANGES, with specific guidance on any failed check or game defect. No claim of OWNER PASS or physical iPhone. Follow-up: item2 Ash fog, item3 vendor node_modules separate, 86_events.js provenance gap OPEN.
