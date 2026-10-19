# three-worlds — Остров сумерек + Пепельный путь + Затонувший город

**Статус 2026-10-19:** этап 7 (A–G) слит в main (PR #49), результат: [handoff/RESULT.md](https://github.com/mpaykin1/meta6/blob/handoff/handoff/RESULT.md); играть: https://mpaykin1.github.io/meta6/three-worlds-game/ . Владелец игру НЕ принимал (PASS/FAIL только его). Дальше этап 7b: подключение моделей Затонувшего города.

Канонический короткий пароль для всех Claude / ChatGPT / Codex чатов: **three-worlds**.

**Полный дизайн-документ:** [docs/THREE_WORLDS_MERGE_RU.md](docs/THREE_WORLDS_MERGE_RU.md)

**Обязательные запреты:** [graf.md](graf.md) §27 (WORLD INTEGRITY, HARD FAIL) и §26.

**Основа кода:** [underwater-world/](underwater-world/) (частичный PASS владельца, [вердикт](underwater-world/OWNER_VERDICT_2026-10-17.md)); принятые V5–V7 не менять.

**Правило для автозадач ChatGPT и всех агентов:** [разделы 14–16](docs/THREE_WORLDS_MERGE_RU.md) — читать этот дизайн до любой работы по слиянию миров, один этап за раз, ошибки записывать в `docs/lessons/`; раздел 15 — пайплайн разработки, которому нужно научиться; раздел 16 — расписание автозадач (платный и бесплатный аккаунт) и цикл самообновления по этому документу; раздел 17 — следующий шаг разработки (этап 1); раздел 18 — режим «один промпт»: канал `handoff` Claude ↔ ChatGPT, рабочая папка `three-worlds-game/`, самопочинка связи.

**Конвейер полной автоматизации (Claude ↔ ChatGPT, все промпты и схема):** [automation/README_RU.md](automation/README_RU.md).

Статус: дизайн, не реализация. PASS/FAIL ставит только владелец.
