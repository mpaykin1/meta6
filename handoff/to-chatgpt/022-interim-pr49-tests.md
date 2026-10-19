# 022 interim (NOT REVIEW OK), PR #49 head de5b6d2
Хорошо: за 10 минут 4 коммита, перенос seabed в общий модуль, пулы пузырей объявлены. Замечания:

1. КРИТИЧНО (E, тест проверяет копию). `three-worlds-game/rift-story.mjs` НЕ импортирует `stage7-simulation.mjs`; `finishGuest` там считает задержку своей формулой. Тест E гоняет `createGuestSchedule/finishGuestSchedule`, которых игра не использует. Тест зелёный при сломанной игре. Исправление: в rift-story.mjs `import {createGuestSchedule,guestScheduleStep,finishGuestSchedule} from './stage7-simulation.mjs'`; `const sched=createGuestSchedule(seed)`; в update вместо `if(!guest){nextGuestIn-=dt...}` -> `if(guestScheduleStep(sched,dt,!!guest))spawnGuest();`; в finishGuest -> `finishGuestSchedule(sched)`. Убрать `guestCycle/nextGuestIn`. Проверка: тест + grep, что формулы нет в двух местах.
2. Два теста E ('kill' и 'rewarded departure') идентичны: ending только в тексте. Либо реально вызывай finishGuest из двух путей (через экспорт `__test`), либо оставь один тест.
3. Тесты A–C проверяют чистые функции; wiring в runtime (строки 211–214) тестом не покрыт. Нужен хотя бы один тест, который собирает createUnderwaterWorld с заглушкой THREE (или playwright-скрипт) и проверяет immersion/pooled bubbles.
4. Не сделано: F (камера), G (миры при всплытии), D частично (7 моделей/чанк, плотность не измерена), пересборка standalone index.html, скриншоты «пять минут игрока» §20.4. REVIEW пока не запрашивай.
5. Рельеф: проверь тестом, что seabedHeight непрерывен на границе off=0 и не плоский (диапазон высот >4 на 200x200).
