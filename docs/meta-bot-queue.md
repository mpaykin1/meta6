# Очередь игр META GAMES, 06.11.2026

Один bot: scripts/meta-bot/runner.cjs. Игра появляется в games/<slug>/ и её карточка переключается только после полного зелёного прогона (ПК и 390×844, два независимых захода). Оригиналы не менять. Результаты — только в GitHub Actions Summary. UNKNOWN — реальное число уровней ещё не измерено, не выдавать его за 1.

| № | Игра | Подтверждённый исходный путь meta6 | Состояние | Уровней / реально пройдено |
|---:|---|---|---|---|
| 1 | Twilight Island | observer-world-en-v7/ | очередь, OWNER PASS не менять | UNKNOWN / 0 |
| 2 | Ashen Path | ashen-sumerek/ | очередь | UNKNOWN / 0 |
| 3 | Underwater World | underwater-world/ | очередь, принятый оригинал не менять | UNKNOWN / 0 |
| 4 | Three Worlds | three-worlds-game/ | очередь | UNKNOWN / 0 |
| 5 | Veil Terraces | meta-games-worlds/veil-terraces/ | очередь | UNKNOWN / 0 |
| 6 | ABYSS GLOW | abyss-glow/play/ | очередь, stand/ OWNER PASS | UNKNOWN / 0 |
| 7 | Archer in the Fog | playgama-games/archer-in-the-fog/ | очередь, есть src/ | UNKNOWN / 0 |
| 8 | Twilight Isle Classic | playgama-games/twilight-isle-classic/ | очередь | UNKNOWN / 0 |
| 9 | Twilight Isles 2 | playgama-games/twilight-isles/ | очередь | UNKNOWN / 0 |
| 10 | Underwater Sumerek | underwater-sumerek/ | очередь | UNKNOWN / 0 |
| 11 | Island Sumerek Biomes | island-sumerek-biomes/ | очередь; не эталон-донор | UNKNOWN / 0 |

В репозитории существуют meta-games-worlds/witness-vault/ и meta-games-worlds/generated-confluence-vault/, но пока не подтверждены как игры Claude и не входят в пять карточек, поэтому НЕ включаются в доноры/очередь до выяснения происхождения. Изолированные файлы/демо observer-world-en-v2…v6, reference/, stand/ не трогать.

Только в артефактах Claude (перенос прямо приостановлен владельцем 06.11): Король Пепла, полный оригинал Лучника в тумане, полный ABYSS GLOW, Бесконечные долины, Сломанный город, Сумерки и пепел II, Радужный разгон, ASQURA OFFICE, QubeForge. Наличие частичной сборки не заменяет исходные артефакты.

На каждой итерации: инвентаризация N объектов и функций в источнике → перенесено N, потеряно 0 → дополнения без удаления → read-only __META_BOT__ → семь жёстких проверок → только при полном зелёном bot PR можно слить, затем изменить карточку. Без выдуманных PASS/FAIL владельца.
