type: AUDIT
pr: none
stage: §21.15–21.24; PR #120/#121/#122
time: 2026-10-20T08:55:21.970Z
range: main 2633c75697fbec24f7e15fa52bba39d3fd32e430..PR120 0301b925b801fb3971b472282b3aa3b4ec872f91 / PR121 db06c6b37a1dc78c70661b41aaa92c53172a4087 / PR122 2ae880cb1f0a0afa433b6863feb62e1a9775257d
main_sha_at_audit: 2633c75697fbec24f7e15fa52bba39d3fd32e430
focus: PR #120, #121, #122 vs accepted A01–A10 and audit 044

# 075 — Независимый аудит трёх открытых PR

**Итог: критичных 0, важных 5, мелких 0; ВОЗМОЖНО 1.** Не OWNER PASS. Все три PR открыты, exact-head CI **three-worlds-gate SUCCESS** и **smoke SUCCESS**; review submissions пусты, Claude REVIEW OK не получен. Незакрытые A01/A05/A06/A08/A09/A10 остаются открытыми по реестру — зелёные модельные тесты их не закрывают.

## Четыре важных замечания 044: состояние на PR #122
- **044 №1 — ЧАСТИЧНО:** четыре отдельные строки и ручное подтверждение до выбора реализованы [rift-story.mjs:47–60,153–175](https://github.com/mpaykin1/meta6/blob/2ae880cb1f0a0afa433b6863feb62e1a9775257d/three-worlds-game/rift-story.mjs#L47-L60); содержание строк не соответствует утверждённому образцу/проверяемым предметам (см. замечание 1 ниже).
- **044 №2 — ЧАСТИЧНО:** автоматический travel после 5 с удалён, но портал проверяет только XZ, а не объём (замечание 2).
- **044 №3 — ЧАСТИЧНО:** устранено исчезновение через 25 с; targetId отдельно от реального массива порталов, тест проверяет лишь собственные константы (замечание 3).
- **044 №4 — ОТКРЫТО:** оригинальный гость только Ash, на Ash появляется гость из того же мира (замечание 4).
- **044 №5 (мелкое) — ИСПРАВЛЕНО:** имя полоски босса изменено в [index.source.html:4776–4782](https://github.com/mpaykin1/meta6/blob/2ae880cb1f0a0afa433b6863feb62e1a9775257d/three-worlds-game/index.source.html#L4776-L4782).

## Замечания

1. **[ВАЖНО]** [PR122 rift-story.mjs:10–16](https://github.com/mpaykin1/meta6/blob/2ae880cb1f0a0afa433b6863feb62e1a9775257d/three-worlds-game/rift-story.mjs#L10-L16) vs [QUEST_RULES_RU.md:16–32](https://github.com/mpaykin1/meta6/blob/main/docs/QUEST_RULES_RU.md#L16-L32). У «Стража Пепла» заменён утверждённый видимый красный признак беды на «янтарный огонёк», нет утверждённого кристалла у ржавой вышки; нужда заменена разломом, а квест — щелью. **Сценарий:** игроку обещают беду/помощь, не связанную с согласованными видимыми объектами; четыре строки проходят самопроверку без проверки реестра. **Исправить:** использовать согласованные четыре реплики из §QUEST_RULES, но лишь после регистрации и визуального подтверждения действительно существующих `red-blinking-heart` / `rusty-tower` / `blue-crystal`; до этого не объявлять диалог соответствующим §21.19. Тест проверяет реальные id объектов и признак модели, а не только наличие 4 строк.

2. **[ВАЖНО]** [PR122 rift-story.mjs:186–191](https://github.com/mpaykin1/meta6/blob/2ae880cb1f0a0afa433b6863feb62e1a9775257d/three-worlds-game/rift-story.mjs#L186-L191). Триггер входа после «Помочь» сравнивает лишь XZ, игнорируя Y, хотя постоянные порталы на строке 120 проверяют разницу высот. **Сценарий:** персонаж проходит над/под разломом, не касаясь его, но меняет мир. **Исправить:** `const nearXZ=Math.hypot(player.pos.x-spot.x,player.pos.z-spot.z)<1.0; const nearY=Math.abs(player.pos.y-height(spot.x,spot.z))<2.0; if(phase==='escort'&&guest&&spot&&nearXZ&&nearY){...}`. Проверить отрицательным тестом Y+10 и положительным тестом реального входа.

3. **[ВАЖНО]** [PR122 rift-story.mjs:19–23,32,114–118,195–198](https://github.com/mpaykin1/meta6/blob/2ae880cb1f0a0afa433b6863feb62e1a9775257d/three-worlds-game/rift-story.mjs#L19-L32), [rift-story.test.mjs:73–80](https://github.com/mpaykin1/meta6/blob/2ae880cb1f0a0afa433b6863feb62e1a9775257d/three-worlds-game/tests/rift-story.test.mjs#L73-L80). `MISSION_RIFT_TARGETS` объявляет `rift-island/ash/water`, но фактические `portals` не имеют `id`, а тест сверяет константы с самими собой. Достижение координат даёт reward независимо от найденного именованного объекта и проверенной навигации. **Сценарий:** невидимый/перемещённый портал не обнаруживается тестом, миссия завершается на голых XZ. **Исправить:** присвоить `id` непосредственно каждому элементу `portals`, выдавать mission.target из `portals.find(p=>p.id===mission.targetId)` и в тесте проверять единственность и реальное наличие mesh/waypoint + высотное пересечение, а не отдельную таблицу совпадающих чисел.

4. **[ВАЖНО, НЕ ЗАКРЫТО ИЗ 044]** [guest-roster.mjs:3–9](https://github.com/mpaykin1/meta6/blob/main/three-worlds-game/guest-roster.mjs#L3-L9), [PR122 rift-story.mjs:97–104,188](https://github.com/mpaykin1/meta6/blob/2ae880cb1f0a0afa433b6863feb62e1a9775257d/three-worlds-game/rift-story.mjs#L97-L104). Единственный `strider_m` имеет origin=ash и появляется также на Ash; fallback `guestHomeFor(from)` меняет пункт назначения, но не делает его межмировым гостем. **Сценарий:** на Пепельном пути «гость из другого мира» на деле местный. **Исправить:** подключить только исходные модели Island/Sunken (без GPT-реконструкции), выбирать `ref.origin!==getWorldId()`; тестить все три мира, `guest.origin!==currentWorld`, `guest.home===guest.origin`. Не закрывать до подключения оригинальных фабрик.

5. **[ВАЖНО]** [PR122 rift-story.mjs:140–142,177–184](https://github.com/mpaykin1/meta6/blob/2ae880cb1f0a0afa433b6863feb62e1a9775257d/three-worlds-game/rift-story.mjs#L140-L142), [rift-event.mjs:32–35](https://github.com/mpaykin1/meta6/blob/main/three-worlds-game/rift-event.mjs#L32-L35). Фаза `closing` длится 5 с, но визуальный scale разлома сразу равен 1 (для всех фаз, кроме warning), intensity тоже сразу 1 — §21.15 п.7 требует плавного повторного открытия 5 с. **Сценарий:** вместо визуального раскрытия разлом остаётся постоянно раскрытым, несмотря на таймер. **Исправить:** в `closing` вычислять `progress=clamp(event.state.elapsed/5,0,1)` и применять к масштабу и FX; screenshot/golden на 0, 2.5, 5 с.

6. **[ВОЗМОЖНО / ПРОБЕЛ ДОКАЗАТЕЛЬСТВ]** [PR120 owner-2118-combat-facing.test.mjs:3–25](https://github.com/mpaykin1/meta6/blob/0301b925b801fb3971b472282b3aa3b4ec872f91/three-worlds-game/tests/owner-2118-combat-facing.test.mjs#L3-L25), [index.source.html:3147–3183,4843–4849](https://github.com/mpaykin1/meta6/blob/0301b925b801fb3971b472282b3aa3b4ec872f91/three-worlds-game/index.source.html#L3147-L3183). Golden тестирует синтетические `look/vel` и `turnHeroToward`, который в настоящем `index.source` не вызывается; тест не демонстрирует фактический удар/выстрел по врагу при отступлении или возврат инерции вне боя. **Сценарий:** узел рендера/ударов может вести себя иначе, а unit-тест останется зелёным. **Исправить:** добавить ≤600 шагов браузерной интеграции через `__isle.sim`, проверить реальную скорость/угол `player.look`, вектор пули/удар по реальному `foe` и плавный возврат после убийства.

## Проверено
- Живой main SHA через GitHub REST; свежие docs/ACCEPTED_BEHAVIORS.md, docs/THREE_WORLDS_MERGE_RU.md §21.15–21.24, docs/QUEST_RULES_RU.md, automation/prompts/chatgpt-auditor.md и handoff/to-claude/044-audit.md.
- PR #120 (0301b925), #121 (db06c6b3), #122 (2ae880cb), изменённые файлы и runtime/тесты; ни один не меняет frozen underwater-world/V5–V7. PR121 изолирует модели в models-lab, явно отмечает visual parity/FPS UNKNOWN и не подключает их как гостей: **нового нарушения §21.16 в PR121 не обнаружено**.
- Exact-head GitHub checks: у каждого #120/#121/#122 `three-worlds-gate=success`, `smoke=success` (другие stage7 и merge jobs skipped); в GitHub PR reviews ни у одного нет REVIEW OK.
- Принятое A02/A03/A04/A07 и мелководье A01/A08 не заявляются сломанными по этому диффу; A01/A05/A06/A08/A09/A10 с открытыми дефектами НЕ считаются восстановленными автоматически.

## Не мог проверить
- Живой iPhone 11, фактические пользовательские ощущения, GPU FPS, арт-паритет модели, реальные механики меча/выстрела и визуальную глубину разлома.
- Node/Playwright локально не запускал (аудит только чтения); CI-статусы изучены, но успешный общий CI не равен owner PASS.

**Изменений игры, PR, main, CI и автозадач не делал. Единственная запись — этот AUDIT в ветку handoff.**
