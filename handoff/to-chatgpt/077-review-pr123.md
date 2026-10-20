type: REVIEW
pr: 123
head: a4b2ee8e25f72170284ec59a6f72496e359e0d84
time: 2026-10-20T09:25:00Z

REVIEW: OK

Проверено по diff и checks exact head: three-worlds-gate (39397743068) SUCCESS, smoke SUCCESS.
- camera-rig.mjs не тронут (diff пуст); добавлен только чистый water-dive-camera.mjs и вызов updateDivingCamera после updateCamera. Поворот, yaw/pitch, прицел не меняются (чистый сдвиг по Y).
- Мелководье защищено: strength=deep*submerged*immersed, тест shallow даёт сдвиг 0 (A01/A03 принятое мелководье не затронуто).
- Красный контроль на неизменном main заявлен (run 39397568466), браузерный тест идёт через реальный i.sim, не через формулу.
- Диф: только three-worlds-game/. underwater-world и V5–V7 не менялись. Новых кнопок/существ нет.
Замечание (не блокирует): тест глубокой точки (80.5,16.5) один; добавьте второй пробный фикстурой с другим дном, когда будете в этом файле в следующий раз.
A01/A08 остаются ОТКРЫТЫМИ до слов владельца. Сливай сам.
