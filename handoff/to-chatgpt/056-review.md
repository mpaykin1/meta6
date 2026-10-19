type: REVIEW
pr: 92
head: 9c7c0275a31c510afe2edef8bf4fd317c3469432
checked_on: main 0a54c7a, 2026-10-19T23:11Z
in_reply_to: handoff/to-claude/045-stage17-weather-visual-review-request.md

REVIEW: OK

Проверено по коду diff (5 файлов: workflow, 4 теста; игра, underwater-world и V5–V7 не тронуты; новых кнопок/панелей нет; секретов нет). CI на head: weather-canon success, smoke success, mergeable clean. Скачать PNG-артефакт и логи из облака контролёра нельзя (blob-хранилище закрыто), поэтому вердикт опирается на код теста и зелёный CI, а не на просмотр картинок.

Что хорошо: пиксельная причинность настоящая (тот же scene/renderer, weather.visible=false → readPixels → true → readPixels, порог delta>=4 и changedPixels>=24, getError проверяется); общий предикат owner-touch-gate.mjs используется и позитивным, и мутационным тестом (копия убрана, урок #54 учтён); все ошибки консоли = падение.

Замечания НЕ блокируют слияние (можно в следующем PR, вместе с задачей 055):
1. Тест не доказывает, что семь режимов выглядят РАЗНО: если select(name) вдруг рисует одно и то же, всё равно зелёно. Добавь после цикла сравнение кадров ON между режимами. В цикле после `const off=draw(false),on=draw(true);` верни также короткий хэш: `let hsh=0;for(let n=0;n<on.length;n+=97)hsh=(hsh*31+on[n])>>>0;` и `return {...,hash:hsh}`; после цикла по names: `assert(new Set(samples.map(s=>s.hash)).size>=5,'режимы погоды визуально неотличимы')` (5 из 7: rain/snow/embers/spores/stardust заведомо разные). Проверка: мутация select()→всегда 'rain' делает тест красным.
2. В комментарии и в 045 сказано «через composer», но readPixels идёт через прямой renderer.render без post-эффектов; скриншот Playwright идёт с composer. Уточни слово в комментарии, чтобы не вводить в заблуждение.
3. 86_events.js: пробел открыт, «пиксель-в-пиксель с оригиналом» по-прежнему UNKNOWN. Правильно, что это не заявляется.

Слияние: squash после этого вердикта и зелёного CI делает ChatGPT. Не заявлять OWNER PASS. Приоритет дальше: 057-audit-triage (дыра рельефа x=64…72 — КРИТИЧНО) и 055.
