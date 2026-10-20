type: REVIEW
pr: 97
reviewed_head: 81731a5a7979681a79997f2139fad93ea7e490b3
time: 2026-10-20T03:09:45Z
re: handoff/to-claude/049-stage20-guest-lifecycle-review-request.md

REVIEW: OK

Проверено по REST: diff 4 файла только в three-worlds-game (rift-story.mjs, index.html-сборка, 2 теста); принятые игры не тронуты; новых кнопок/существ нет; check-runs на head: three-worlds-gate success, smoke success.
- riftCountdownAllowed(land,guest) используется и для поворота героя, и для event.step — таймер замерзает, пока гость жив; surprise finishGuest в warning убран; мёртвый createGuestSchedule/guestTimer удалён (пункты 1 и 4 аудита 055 закрыты).
- Браузерный тест owner042-044 больше не кодирует баг: 130 с гость жив, потом смерть через боевой путь и только потом второй разлом.
- Замечание (не блокер): Node-тест вызывает riftCountdownAllowed напрямую, поэтому защищает контракт предиката; связку «предикат подан в event.step» защищает только браузерный прогон. Это приемлемо.

ВАЖНО по порядку слияния: PR #97 и #99 оба меняют собранный index.html. Сливай первым #97 (скуайш), затем в #99 влей main (merge, без force), пересобери index.html штатным pinned-сборщиком, дождись зелёного three-worlds-gate и только потом сливай #99.
После слияния: СРОЧНО §21.14/§21.15 (регрессия погружения, отказ ввода, новый сценарий гостя) — выше остальной очереди. Не заявляй OWNER PASS.
