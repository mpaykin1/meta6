# Очередь игр META GAMES, 06.11.2026

Один bot: каркас Claude scripts/meta-bot/ (run.mjs, контракт CONTRACT.md); для игры дописываются только games/<slug>/bot-adapter.js, bot-strategy.mjs, bot.json. Прежний runner.cjs (PR #279) заменён каркасом, его умная ходьба перенесена в ядро как ctx.walkToGoal(). Игра появляется в games/<slug>/ и её карточка переключается только после полного зелёного прогона (ПК и 390×844, два независимых захода). Оригиналы не менять. Результаты — только в GitHub Actions Summary. UNKNOWN — реальное число уровней ещё не измерено, не выдавать его за 1.

| № | Игра | Подтверждённый исходный путь meta6 | Состояние | Уровней / реально пройдено |
|---:|---|---|---|---|
| 1 | Veil Terraces | games/veil-terraces/ (оригинал: meta-games-worlds/veil-terraces/) | PR #280 слит; на платформе — проверенная версия; исходный HTML сохранён | 6 / 6 (390×844 и ПК, 2 захода) |
| 2 | Twilight Island | observer-world-en-v7/ | очередь, OWNER PASS не менять | UNKNOWN / 0 |
| 3 | Ashen Path | ashen-sumerek/ | очередь | UNKNOWN / 0 |
| 4 | Underwater World | underwater-world/ | очередь, принятый оригинал не менять | UNKNOWN / 0 |
| 5 | Three Worlds | three-worlds-game/ | очередь | UNKNOWN / 0 |
| 6 | ABYSS GLOW | abyss-glow/play/ | очередь, stand/ OWNER PASS | UNKNOWN / 0 |
| 7 | Archer in the Fog | games/archer-in-the-fog/ (эталон 06.11; сборка Playgama — playgama-games/archer-in-the-fog/) | очередь, есть src/; статус по правилам — games/archer-in-the-fog/README.md | UNKNOWN / 0 |
| 8 | Twilight Isle Classic | games/twilight-isle-classic/ (эталон 06.11; сборка Playgama — playgama-games/twilight-isle-classic/) | очередь; статус по правилам — games/twilight-isle-classic/README.md | UNKNOWN / 0 |
| 9 | Twilight Isles 2 | games/twilight-isles/ (эталон 06.11; сборка Playgama — playgama-games/twilight-isles/) | очередь; статус по правилам — games/twilight-isles/README.md | UNKNOWN / 0 |
| 10 | Underwater Sumerek | underwater-sumerek/ | очередь | UNKNOWN / 0 |
| 11 | Island Sumerek Biomes | island-sumerek-biomes/ | очередь; не эталон-донор | UNKNOWN / 0 |
| 12 | Сумерки и пепел II | games/sumerki-i-pepel-2/ | очередь; исходники Claude подтверждены и уже в meta6 | UNKNOWN / 0 |

В репозитории существуют meta-games-worlds/witness-vault/ и meta-games-worlds/generated-confluence-vault/, но пока не подтверждены как игры Claude и не входят в пять карточек, поэтому НЕ включаются в доноры/очередь до выяснения происхождения. Изолированные файлы/демо observer-world-en-v2…v6, reference/, stand/ не трогать.

Только в артефактах Claude (перенос прямо приостановлен владельцем 06.11): Король Пепла, полный оригинал Лучника в тумане, полный ABYSS GLOW, Бесконечные долины, Сломанный город, Радужный разгон, ASQURA OFFICE, QubeForge. Наличие частичной сборки не заменяет исходные артефакты.

На каждой итерации: инвентаризация N объектов и функций в источнике → перенесено N, потеряно 0 → дополнения без удаления → read-only __META_BOT__ → семь жёстких проверок → только при полном зелёном bot PR можно слить, затем изменить карточку. Без выдуманных PASS/FAIL владельца.
