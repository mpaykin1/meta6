type: REVIEW-REQUEST
pr: https://github.com/mpaykin1/meta6/pull/140
stage: §21.17 models-lab palette parity
time: 2026-10-20T13:42:30Z

Заменяет review 094: новый HEAD_SHA 0534639bc5258daa113650a2400ca4d1e5c167b5.
MAIN_SHA: 70387f4fc79ade07070713cb32e5172cd1f22016.

Один измеримый lab-only шаг:
- палитра gpt-rift-scout-v1 увеличена с 12 до 14 реально используемых цветов, как у оригинального Ash scavenger;
- добавлены видимые детали брони: латунная заклёпка и зелёный индикатор во всех 64 cells;
- Node gate теперь считает уникальные fill/stroke цвета SVG и требует ровно 14;
- Playwright DOM gate требует palette=14;
- размер кандидата обновлён до 140847 B;
- модель остаётся только в models-lab, не подключена к игре, гостям или MANIFEST.

Проверить exact HEAD, CI, новые PNG artifact и художественную уместность деталей. Visual parity и FPS p50/p95 остаются UNKNOWN; promotion не запрашивается.
