## V5 — оригинальный 3D «Остров сумерек» с конструктором (16 октября 2026)

**Публичная игра:** https://mpaykin1.github.io/meta6/observer-world-en-v5/

**Главный исходник:** [observer-world-en-v5/index.html](observer-world-en-v5/index.html) — полный оригинальный Three.js/WebGL-движок из загруженного `Остров сумерек (1)(5).html`. Исходник содержит всю графику, шейдеры, 21 вид оружия и оригинальные звуки; камера сохранена без изменений.

**Конструктор / исторические объекты:** [observer-world-en-v5/editor.js](observer-world-en-v5/editor.js) — добавление настоящих 3D-объектов в исходную сцену, нижние кнопки, меню, мини-история, сохранение.

**Музыка Krieger:** [observer-world-en-v5/audio.js](observer-world-en-v5/audio.js) — отдельная музыка, оригинальные SFX по-прежнему принадлежат исходному движку.

**Инструкция для Claude:** [observer-world-en-v5/CLAUDE.md](observer-world-en-v5/CLAUDE.md) — как исправлять игру, референс, границы и доказательства.

**Автоматический контроль:** [.github/workflows/observer-v5-gate.yml](.github/workflows/observer-v5-gate.yml) — реальный Chrome/WebGL с постройкой в 3D, проверка не изменённого `updateCamera`, сохранение 21 оружия.

**Оригинальные загруженные HTML:** [расширенный](observer-world-en-v4/reference/ostrov-sumerek-expanded-original.html) · [первоначальный](observer-world-en-v4/reference/ostrov-sumerek-original.html). Новый файл `(1)(5)` побайтно совпадает с расширенным эталоном `(1)(4)` (SHA-256 `fdbda0240b53f49d6e34aa0965531856e31a0154f4a12339e1682d60d5fe5c1f`). 

**Статус:** технический WebGL/build gate PASS; визуальное сравнение со скриншотом, устройство, музыка на динамиках, AI и исторические механики — владелец PASS ещё не давал. **Не путать с завершённым продуктом.**


---

# Observer World — исходники из любого чата

**Постоянная публичная точка входа:** https://github.com/mpaykin1/meta6/blob/main/SOURCE_INDEX.md

Статус владельца: **Observer World EN V2 — PASS (2026-10-16)**. Принятую версию не переписывать ради экспериментов. Звуковая редакция — отдельное приложение рядом, а не замена эталона.

## Все игровые исходники

| Что | Исходник (GitHub) | Игра |
|---|---|---|
| Оригинал RU | [observer-world/index.html](observer-world/index.html) | https://mpaykin1.github.io/meta6/observer-world/ |
| Первый перевод EN | [observer-world-en/index.html](observer-world-en/index.html) | https://mpaykin1.github.io/meta6/observer-world-en/ |
| **Принятый эталон V2 (PASS)** | [observer-world-en-v2/index.html](observer-world-en-v2/index.html) | https://mpaykin1.github.io/meta6/observer-world-en-v2/ |
| **V4 Mini-Island — реализация объединения (owner PASS ещё нет)** | [observer-world-en-v4/index.html](observer-world-en-v4/index.html) | https://mpaykin1.github.io/meta6/observer-world-en-v4/ |
| V4: оригинальная игровая графика 12 материалов, 21 оружие | [original-assets.js](observer-world-en-v4/original-assets.js) | — |
| V4: исходный APNG и персонажи | [hero-apng.js](observer-world-en-v4/hero-apng.js) · [island-graphics.js](observer-world-en-v4/island-graphics.js) | — |
| V4: 12 музыкальных тем и раздельный микшер | [audio.js](observer-world-en-v4/audio.js) | — |
| V4: монстры, бой и ландшафт | [living-world.js](observer-world-en-v4/living-world.js) · [weapon-catalog.js](observer-world-en-v4/weapon-catalog.js) | — |
| **Подлинный оригинальный HTML «Остров сумерек»** | [ostrov-sumerek-original.html](observer-world-en-v4/reference/ostrov-sumerek-original.html) | — |
| **Подлинный расширенный HTML «Остров сумерек»** | [ostrov-sumerek-expanded-original.html](observer-world-en-v4/reference/ostrov-sumerek-expanded-original.html) | — |
| V4: регрессионные тесты и CI | [.github/workflows/observer-v4-gate.yml](.github/workflows/observer-v4-gate.yml) | — |
| **Новая V3 — графика из «Острова сумерек», улучшенная музыка, полноэкранный читатель** | [observer-world-en-v3/index.html](observer-world-en-v3/index.html) | https://mpaykin1.github.io/meta6/observer-world-en-v3/ |
| V3: графика и встроенные пиксельные ассеты из загруженного эталона | [observer-world-en-v3/island-graphics.js](observer-world-en-v3/island-graphics.js) | — |
| V3: новая музыкальная партитура / многослойный синтез | [observer-world-en-v3/audio.js](observer-world-en-v3/audio.js) | — |
| V3: тесты музыки и графики | [audio.test.cjs](observer-world-en-v3/audio.test.cjs) · [island-graphics.test.cjs](observer-world-en-v3/island-graphics.test.cjs) | — |
| V3: проверка браузера, текста, музыки и графики | [.github/workflows/observer-v3-gate.yml](.github/workflows/observer-v3-gate.yml) | — |
| **Новая музыкальная редакция (отдельный выпуск)** | [observer-world-en-v2-audio/index.html](observer-world-en-v2-audio/index.html) | https://mpaykin1.github.io/meta6/observer-world-en-v2-audio/ |
| Звуковой движок / синтезатор | [observer-world-en-v2-audio/audio.js](observer-world-en-v2-audio/audio.js) | — |
| Тесты звукового движка | [observer-world-en-v2-audio/audio.test.cjs](observer-world-en-v2-audio/audio.test.cjs) | — |
| CI публикации аудио | [.github/workflows/observer-audio-live-gate.yml](.github/workflows/observer-audio-live-gate.yml) | — |
| CI принятой V2 | [.github/workflows/observer-world-en-v2-gate.yml](.github/workflows/observer-world-en-v2-gate.yml) | — |
| Машинный индекс | [game-source-index.json](game-source-index.json) | — |

## Технологии, перенесённые из World Server

- [Процедурный WebAudio-синтезатор](https://github.com/mpaykin1/World_server/blob/master/games/ostrov-sumerek/engine/32_audio.js): oscillator, gain-envelope, filtered noise, frequency sweep, compressor, generated soundtrack.
- [Рецепты звуков](https://github.com/mpaykin1/World_server/blob/master/games/ostrov-sumerek/packs/base/sounds.js): data-driven tone/noise/sweep.
- [Krieger Total Control](https://github.com/mpaykin1/World_server/blob/master/KRIEGER_TOTAL_CONTROL_HANDOFF.md): процессуальное происхождение содержимого вместо тяжёлых ассетов.
- [Дым Living Watercolor](https://github.com/mpaykin1/scratch-chain-reaction/blob/main/living-watercolor-3d/living-watercolor-3d.js): brush-emitter адаптирован в V2 в виде Canvas-дыма.
- [AI_START_HERE](https://github.com/mpaykin1/World_server/blob/master/AI_START_HERE.md), [issue #80](https://github.com/mpaykin1/World_server/issues/80), [Tech Lab](https://github.com/mpaykin1/world-server-tech-lab/blob/main/LIVE_STATUS.json): контекст архитектуры, текущий прогресс, ограничения.

**Важно:** Krieger-style аудио — наша авторская синтезаторная реализация по шаблону WebAudio из World Server. Мы **не импортируем** и не используем проприетарные музыкальные или звуковые ресурсы оригинальной коммерческой игры .kkrieger. Никаких MP3, платных API и закрытых зависимостей.

## Как новому чату продолжить

1. Прочитать именно этот `SOURCE_INDEX.md` и `game-source-index.json`.
2. Открыть конкретные исходники по ссылкам выше; они лежат в **публичном репозитории GitHub**, а не в памяти одного диалога.
3. Перед редактированием проверить свежий `main`, фактический CI и актуальные решения владельца PASS/FAIL.
4. Не подменять принятую V2 звуковой веткой, пока владелец отдельно не подтвердит её PASS.
5. Статус музыки подтверждать тестами: WebAudio запускается по жесту пользователя; mute/volume; реактивная смена тем; мечи и события; стабильность на телефоне. Не считать статический HTML или зелёный JS-check доказательством того, что пользователь слышит звук на своём устройстве.

## Скачивание всех исходников одним архивом

Публичный полный архив репозитория: https://github.com/mpaykin1/meta6/archive/refs/heads/main.zip

Этот индекс является каноническим источником адресов. **От пользователя не нужно повторно загружать исходники в новый чат.**

## Источник графики V3 — предоставленные пользователем эталоны

- `Остров сумерек (1)(4).html`, SHA-256 `fdbda0240b53f49d6e34aa0965531856e31a0154f4a12339e1682d60d5fe5c1f` — версия с оружием, принята как графический источник.
- `Остров сумерек(4).html`, SHA-256 `6856c60e616aa8c1ae8a7292b2e1e7570d663ae287f335623322e3be66e869cd` — первоначальная версия.
- **В V3 действительно перенесены изображения**, извлечённые из встроенного блока `ASSETS`: шесть пиксельных материалов, четырёхкадровый спрайт человека, четыре кадра воды. Они встроены в `island-graphics.js` как data PNG, не зависят от сохранности этого чата.
- Масштаб `cam.zoom`, размеры зданий и положение камеры Observer World не менялись. Не переносили тяжёлый Three.js 3D renderer из «Острова сумерек», это другая игровая архитектура.
- Музыкальная система V3 содержит 7 полноценных 32-шаговых многоголосных тем с прогрессиями аккордов, басом, мелодиями, контрапунктом и аранжировочными вариациями. Звуки событий оставлены от отдельно принятого Krieger Audio Edition.
- Полноэкранное чтение открывает текущий текст журнала, текст инспекции и боевые сообщения; A+/A− изменяют только шрифт читателя, не масштаб мира.

**Применять PASS отдельно.** Принятая владельцем V2 не изменена, V3 — новая редакция до проверки владельца.

## V4 — статус исполнения ТЗ от 2026-10-16

**Новая, экспериментальная версия**, предыдущая V2 имеет решение владельца PASS, V3 — предшествующий прототип. V4 НЕ отмечать как PASS владельца без его решения.

Работает и проверено технически:
- исходные два полных HTML (blob SHA `d164562d0c75f4a0265d19ffe127b78a1bd27153` и `eb8b736d7f4610584f1afb9f533d328ccfb35831`) доступны в этом репозитории **байт-в-байт**, сравнение с загруженными файлами выполнено;
- исходные графические атласы и 21 оружие, встроенные без сторонних CDN, с машинным каталогом WEAPONS и частью игровых свойств;
- 4-кадровый APNG персонажа из оригинального sprite sheet, присоединённый к текущему renderer; пропорции камеры не изменялись;
- оригинальные анимированные кадры воды, материализированная трава, глитч, 3 процедурных монстра Imp, Shade, Warden (ручное и ограниченное авто-появление), взаимодействие с фракциями;
- сохранена история и взаимодействия Observer World (AI мост сохранён, не переименован);
- раздельные кнопки музыки / звуков; музыка включается явно по user gesture, 12 адаптивных партитур, увеличен уровень музыкального канала, есть измеритель сигнала через WebAudio AnalyserNode и статус Context;
- режим Build / Explore; доступен оригинальный каталог 21 оружия, базовые версии ближних и дальних атак, патроны и визуализация из атласа; advanced оружие закрыто за событием Наблюдателя/аномалии;
- регрессионные unit/browser/live тесты работают в `observer-v4-gate.yml`.

**ОСТАЁТСЯ НЕСДЕЛАННЫМ / требует evidence и owner PASS:**
- подлинный комплексный Three.js/WebGL 3D renderer оригинала (в V4 на сегодня реализован совместимый 2.5D Canvas mini-island с настоящими материалами и анимациями);
- полный паритет алгоритмов всех 21 видов оружия: рикошеты, зарядка, отражение, физика снарядов, цепные молнии, комбо, разрушения и прочие свойства пока сохранены **в оригинальных HTML**, но не все реализованы в V4;
- качественная графика каждого существа и его движения на уровне оригинальных GLSL шейдеров;
- реальные прослушивания музыки на iPhone 11/ПК владельца, измерения FPS, долгие стресс-тесты и пользовательский PASS/FAIL;
- гарантия совместимости расширенного рендера с единой физикой и историей без регрессий.

**Строгий принцип:** не называть V4 завершённым объединением двух игр, пока эти пункты не закрыты и не показана работа в живом браузере/на устройстве.

Полный список файлов и испытаний лежит в данной папке. Любому новому чату достаточно начать с этого `SOURCE_INDEX.md`; повторно просить пользователя присылать оригинальные игры нельзя.
