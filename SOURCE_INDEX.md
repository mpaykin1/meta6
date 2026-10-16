# Observer World — исходники из любого чата

**Постоянная публичная точка входа:** https://github.com/mpaykin1/meta6/blob/main/SOURCE_INDEX.md

Статус владельца: **Observer World EN V2 — PASS (2026-10-16)**. Принятую версию не переписывать ради экспериментов. Звуковая редакция — отдельное приложение рядом, а не замена эталона.

## Все игровые исходники

| Что | Исходник (GitHub) | Игра |
|---|---|---|
| Оригинал RU | [observer-world/index.html](observer-world/index.html) | https://mpaykin1.github.io/meta6/observer-world/ |
| Первый перевод EN | [observer-world-en/index.html](observer-world-en/index.html) | https://mpaykin1.github.io/meta6/observer-world-en/ |
| **Принятый эталон V2 (PASS)** | [observer-world-en-v2/index.html](observer-world-en-v2/index.html) | https://mpaykin1.github.io/meta6/observer-world-en-v2/ |
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
