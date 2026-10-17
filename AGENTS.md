## FIX — обязательное правило статичного экрана (незакрытый блокер)

Если пользователь говорит **fix**, «закрепи экран», «экран тянется», «статичный экран», «неподвижная камера» или агент меняет игровое управление, **сначала прочитать [fix.md](fix.md)**. Быстрый публичный адрес: https://mpaykin1.github.io/meta6/fix/ . Это сквозной контракт для всех игр. Пользователь поставил **PASS всем остальным компонентам подводной игры**, но **не принял закрепление экрана**. Проверка одного `scrollY===0` или `overflow:hidden` — недостаточна: отдельно обязательно проверить камеру и неподвижность мировых ориентиров при джойстике. Нельзя автоматически закрывать FIX либо записывать его PASS/FAIL до решения владельца. Исправление ведётся на принятых исходниках; никаких дублирующих автозадач.

## EVOLVE — универсальное саморазвитие технологий

При задачах ежедневного развития графики, анимации, ассетов и оптимизации любой игры обязательно прочитай [**evolve.md**](evolve.md) вместе с [graf.md](graf.md). Короткий пароль для всех агентов: **evolve**. Это общий GitHub-контракт для Claude, ChatGPT, Codex, OpenCode, OpenHuman; расписание 02:00 Asia/Tbilisi только после реальной настройки и тестового запуска. Не создавать шестую AKA-задачу; сохранять 50/50 CLEAN_SERVER/GRAPHICS, текущие контракты и owner-only PASS/FAIL.

# Coding agent handoff — `mpaykin1/meta6`
## GRAF — обязательный стандарт графики всех наших игр

При любом создании, улучшении, переносе, оптимизации или ревью **графики и анимации** сначала полностью прочитай [**graf.md — Hybrid 2D / 2.5D / 3D**](graf.md). Это единый публичный стандарт для Claude, Codex, ChatGPT и других AI; применять к любой игре с учётом принятого baseline и её стилистики. Для гибридного MVP обязательны одновременно анимированные 2D, 2.5D и 3D персонажи и объекты; PASS/FAIL назначает только владелец. Не считай появление документа доказательством выполнения графической интеграции.


**Current owner-approved baseline:** Observer World V7 (PASS, 2026-10-16). Do not overwrite accepted V5/V6/V7 to pursue a new feature.

First read: [CLAUDE.md](CLAUDE.md) → [observer-world-en-v7/CLAUDE.md](observer-world-en-v7/CLAUDE.md) → [SOURCE_INDEX.md](SOURCE_INDEX.md) and [game-source-index.json](game-source-index.json).

**Public playable V7:** https://mpaykin1.github.io/meta6/observer-world-en-v7/

**Complete game code** is under `observer-world-en-v7/`. All main Three.js renderer, animation, voxel island, shader, weapon physics and sound code resides in `index.html`. Interactions and modern modules live in `editor.js`, `mobile-controls.js`, `mobile-controls.css`, `building-assets.js`, `npc-catalog.js`, `combat-relations.js`, `story-system.js`, `audio.js`. Do not invent missing sources, ask for re-upload of files already in the repo, or substitute a generic 2D game for the user's accepted 3D graphics.

**PASS evidence:** [success record](docs/SUCCESS_OBSERVER_WORLD_V7_MOBILE_2026-10-16.md). **Chrome CI:** https://github.com/mpaykin1/meta6/actions/runs/38896347402. CI is a simulated touch/browser test and should not be described as a physical-device FPS benchmark.

**Desktop:** retain WASD, ПКМ build, ЛКМ attack. **Phone:** joystick left, three 25%-transparent action controls right, historical glyphs bottom, touch terrain → press hammer; don't damage accepted layouts. Rendering still uses the original Three.js scene.

All new development should occur in a new V8 directory, test branch or PR rather than silently replacing V7. No paid keys, no exposed secrets. A public repo permits reading, NOT GitHub writes; require the actual connected account permission to commit.
