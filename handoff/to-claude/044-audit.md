type: AUDIT
pr: none
stage: §21.15–21.24
time: 2026-10-20T08:19:48.480Z
range: 17e4c1893c40532e042e7fa48158c42b271f2fe8..ede1698a5113c44956fcd22b50277f1707ed5f33
main_sha_at_audit: ede1698a5113c44956fcd22b50277f1707ed5f33
focus: 6+1

# 044 — Независимый аудит поведения гостя и регрессий канона

**Итог: критичных 0, важных 4, мелких 1.** По compare изучены 12 коммитов и 18 затронутых файлов. Актуальный реестр docs/ACCEPTED_BEHAVIORS.md прочитан из открытого PR #118 (head 8c32f372); на main его ещё нет, A06 отмечен ОТКРЫТЫМ ДЕФЕКТОМ. Не заявлять OWNER PASS.

1. **[ВАЖНО]** [rift-story.mjs:118–123,146–149](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/three-worlds-game/rift-story.mjs#L118-L149), [QUEST_RULES_RU.md:25–32](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/docs/QUEST_RULES_RU.md#L25-L32). Вместо четырёх отдельных подтверждаемых реплик вызывается один line(guest,'neutral'); после автоматической печати текста без переходов по нажатию появляются две кнопки. **Сценарий:** игрок видит выбор без четырёх обязательных смысловых фаз (знакомство, беда, потребность, просьба). **Исправить:** отдельный сценарий guestLines(guest), assert(lines.length===4); после завершения печати каждой реплики ждать click/key/touch, только после четвёртой включать controls.hidden=false. Готовая проверка: for (let i=0;i<4;i++){assert(buttonsHidden);pressNext();} assert(!buttonsHidden); и проверка отсутствия автоперехода без ввода.

2. **[ВАЖНО]** [rift-story.mjs:125–143,151–159](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/three-worlds-game/rift-story.mjs#L125-L159), [rift-event.mjs:32–35](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/three-worlds-game/rift-event.mjs#L32-L35). При «Помочь» через пять секунд вызывается travel() без проверки коллизии героя с глитч-разломом. **Сценарий:** неподвижный герой телепортируется сам, хотя §21.15 п.2/7 требует подойти и войти в проходимый объект. **Исправить:** после раскрытия разлома перевести в фазу await-entry и оставить управление свободным; переход только при реальном входе: if(phase==='await-entry' && Math.hypot(player.pos.x-spot.x,player.pos.z-spot.z)<1.0){ travel({to:destination}); finishEscortTransition(); }. Тест: стояние у портала не меняет мир; движение внутрь меняет.

3. **[ВАЖНО]** [rift-story.mjs:137–142,178–183](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/three-worlds-game/rift-story.mjs#L137-L183), [QUEST_RULES_RU.md:3–14](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/docs/QUEST_RULES_RU.md#L3-L14). «Исследуй руины и найди знак»/«Доберись и узнай» содержат две команды. Нет конкретного проверяемого targetId и условия завершения; дружественный гость исчезает после age>25 независимо от результата. **Сценарий:** невозможно объективно завершить квест, проводник исчезает до найденной цели. **Исправить:** mission={world:to,targetId:pickExistingTarget(to),step:0,completed:false}; сформировать по одной команде на шаг и один указатель; удалять гостя только при mission.completed (либо явном подтверждённом финале). Тест: объект существует в реестре; без достижения целевого объекта NPC не исчезает, после достижения выдаётся результат/награда.

4. **[ВАЖНО]** [guest-roster.mjs:3–9](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/three-worlds-game/guest-roster.mjs#L3-L9), [rift-story.mjs:63–75](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/three-worlds-game/rift-story.mjs#L63-L75). Всегда появляется Ash strider_m, но home=guestHomeFor(getWorldId()) и sourceWorld=getWorldId() подменяют фактический origin=ash. **Сценарий:** на Пепельном пути якобы межмировой гость из своего мира, в остальных мирах Ash-гостю присваивают ложное происхождение. **Исправить:** реестр оригинальных моделей нескольких миров, выбор с фильтром ref.origin!==getWorldId(), guest.home=ref.origin; guest.sourceWorld=ref.origin. Тесты на каждом из трёх миров: guest.origin!==currentWorld, guest.home===guest.origin. Никаких самодельных NPC (жёсткий §21.16).

5. **[МЕЛКО]** [index.source.html:339,4776–4782](https://github.com/mpaykin1/meta6/blob/ede1698a5113c44956fcd22b50277f1707ed5f33/three-worlds-game/index.source.html#L4776-L4782). В boss HUD показывается здоровье нового гостя, но фиксированный текст — «Страж маяка». **Сценарий:** игрок видит имя неверного босса. **Исправить:** whud.boss.querySelector('span').textContent = riftStory?.boss ? 'Страж Пепла' : 'Страж маяка'; имя гостя сверить с утверждённой сценой. Тест на оба типа босса.

## Проверено
- Живой main SHA по GitHub REST дважды: ede1698a5113c44956fcd22b50277f1707ed5f33. Диапазон после AUDIT-STATE.md (last 17e4c189, focus 4+5), новая ротация 6+1.
- three-worlds.md, automation/prompts/chatgpt-auditor.md, docs/THREE_WORLDS_MERGE_RU.md §20.12–21.24, docs/QUEST_RULES_RU.md, реестр ACCEPTED_BEHAVIORS из PR118 и принятые A01–A10.
- Рантайм и тесты: rift-event, rift-story, guest-roster, rift-input-guard, index.source, rift-story.test, owner042-044-browser, owner-life-rift-mobile, owner-2116-original-guest-roster, owner-2114-input-live-browser. Сверено с REVIEW 065 и AUDIT 043: прежние замечания о телефоне/CI не повторены.
- Проверено, что PR118 открыт и документ ещё не в main. Нет оснований объявлять исправленными дефекты глубокого погружения, дождя, пустых миров, водного боя или гостя, уже признанные владельцем.

## Не мог проверить
- Реальный iPhone 11, WebGL-маску/глубину гостя, физический FPS и игровой UX.
- Node, Playwright и CI не запускались: режим только чтения, вывод из файлов/исходников. Диалоги доступа не принимались.

**Единственная запись: этот отчёт в handoff. Игра, main, ветки разработчика, PR, CI и автозадачи не менялись.**
