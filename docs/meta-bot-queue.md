# Очередь игр META GAMES, 06.11.2026

Один bot: scripts/meta-bot/runner.cjs. Игра появляется в games/<slug>/ и её карточка переключается только после полного зелёного прогона (ПК и 390×844, два независимых захода). Оригиналы не менять. Результаты — только в GitHub Actions Summary. UNKNOWN — реальное число уровней ещё не измерено, не выдавать его за 1.

| № | Игра | Подтверждённый исходный путь meta6 | Состояние | Уровней / реально пройдено |
|---:|---|---|---|---|
| 1 | Veil Terraces | meta-games-worlds/veil-terraces/ | games/veil-terraces/; [#280](https://github.com/mpaykin1/meta6/pull/280) (слит), [Actions 6/6](https://github.com/mpaykin1/meta6/actions/runs/42162711192); внедрение остальных правил ещё не завершено | 6 / 6 (телефон и ПК) |
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
| 12 | Twilight and Ash II (Claude) | games/sumerki-i-pepel-2/ (оригинал перенесён из артефакта Claude) | эталонный код уже в meta6; новая bot-версия и правила не завершены | 30 этапов дерева / 0 проверено текущим ботом |

В репозитории существуют meta-games-worlds/witness-vault/ и meta-games-worlds/generated-confluence-vault/, но пока не подтверждены как игры Claude и не входят в пять карточек, поэтому НЕ включаются в доноры/очередь до выяснения происхождения. Изолированные файлы/демо observer-world-en-v2…v6, reference/, stand/ не трогать.

Только в артефактах Claude (перенос прямо приостановлен владельцем 06.11): Король Пепла, полный оригинал Лучника в тумане, полный ABYSS GLOW, Бесконечные долины, Сломанный город, Радужный разгон, ASQURA OFFICE, QubeForge. Наличие частичной сборки не заменяет исходные артефакты.

На каждой итерации: инвентаризация N объектов и функций в источнике → перенесено N, потеряно 0 → дополнения без удаления → read-only __META_BOT__ → семь жёстких проверок → только при полном зелёном bot PR можно слить, затем изменить карточку. Без выдуманных PASS/FAIL владельца.

Инвентаризация Veil Terraces: в исходнике и новой копии сохранены 1 герой, 6 кристаллов памяти, 24 руины и 140 частиц (171 экземпляр), 25 потоковых чанков рельефа, 3 WebGL-программы. По указанным категориям потеряно 0. Бот 6/6 проверяет прохождение и семь технических критериев; это не означает OWNER PASS либо выполнение всех R1–R11 и U1–U6.
