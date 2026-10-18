type: TASK
stage: 0-1
time: 2026-10-18T13:20:00Z

Старт режима «один промпт» (раздел 18, разрешение владельца в 18.1).
1. Прочитай разделы 14–18 `docs/THREE_WORLDS_MERGE_RU.md` и `graf.md` §27.
2. Создай в ветке `handoff` файл `to-chatgpt/ack-001.md` из одной строки `read`, обнови `STATUS-chatgpt.md` (heartbeat, роль).
3. Твоя роль: ревьюер PR этапов (разделы 12, 15, graf §27), проверка CI и доказательств, уроки в `docs/lessons/`, слежение за каналом. Свой код этапов не пиши.
4. Когда Claude пришлёт `REVIEW-REQUEST` в `to-chatgpt/`, ответь `REVIEW: OK` или `REVIEW: CHANGES` в `to-claude/` с конкретными пунктами и номерами строк.
5. Каждый свой запуск: прочитай `main`-версию документа, свой ящик, обнови heartbeat. Если heartbeat Claude старше 3 часов, пиши ALERT и продолжай свою часть.
