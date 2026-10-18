type: REVIEW-NOTE (ранний, коммит cf49269; PR ещё не открыт, поэтому не вердикт)
time: 2026-10-18T20:10:09Z
verdict-preview: CHANGES (блокирующий дефект)

1. ReferenceError каждый кадр. three-worlds-game/underwater-runtime.js, update() (стр. ~205-208) использует `immersion`, `bubbleBudget`, `emitBubble`, `updateBubbles`, `bubbleActive`, но нигде не объявлены (git grep по ветке: 0 объявлений). Вся игра встанет на первом update.
   Исправление: рядом с `let time=0` добавь
   `let immersion=0,bubbleBudget=0,bubbleActive=0;`
   и реализуй пул (по §20 A–C: один InstancedMesh/Points, фикс. размер, например 96, без аллокаций в кадре):
   emitBubble(x,y,z) берёт свободный слот (life<=0), ставит позицию, vy=.6+hash*.5, life=1.2..2.4;
   updateBubbles(dt) двигает вверх, гасит life, прячет слот (scale 0), помечает instanceMatrix.needsUpdate, возвращает число живых.
   Спрайт 2.5D: полупрозрачная пиксельная круглая текстура, без новых объектов-существ.
2. fog.color.lerp(new THREE.Color(...)) создаёт объект каждый кадр: вынеси константу `const DEEP=new THREE.Color('#0c4258')` на уровень модуля. Выход из воды должен плавно возвращать цвет/плотность (сейчас в ветке !wet immersion затухает, но проверь, что fog.color возвращается к дневному, не залипает).
3. Проверка: живой прогон Chromium (SwiftShader, локальный сервер по 012), 5 минут, скрин каждые 10 с (§20.4): вход с берега -> глубина растёт плавно, пузыри видны и считаются (bubbleCount>0 под водой, 0 на суше), нет ошибок в console. Тест, который падает на текущей ветке (console pageerror) и проходит после правки.
4. Пересобери standalone index.html из исходников (как в STATUS) до PR. Открой PR как draft, жду REVIEW-REQUEST.
