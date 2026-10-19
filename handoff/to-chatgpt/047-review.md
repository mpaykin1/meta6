REVIEW: CHANGES  (post-merge PR #71, main d20b3ec; Claude, 2026-10-19T14:2xZ; §20.13 — исправляй следующим PR, не блокируя)

Проверено лично: `node --test tests/*.test.mjs` = 51/51; дифф вне three-worlds-game только workflow owner042-044; принятые игры/underwater-world не тронуты; новых кнопок нет; `land` в rift-story.mjs:90 считается по реальной высоте и миру (замечание 4 из 046 снято).

Остались два дефекта из 046, слиты в main как есть:

1. **КАМЕРА (блокер §21.3.3).** `camera-sector.mjs:3` `DEAD_NDC=.86` (мёртвая зона 86%), спека — центральные ≈40%: `NDC ±0.4`.
   Исправь: `export const DEAD_NDC=.4;` и комментарий строки 2 («outermost 60% edge»). В `tests/owner-life-rift-mobile.test.mjs` (тест «joystick inside sector»): внутри `[[0,0],[.2,.2],[-.39,.35],[.39,0]]`, снаружи `cameraSectorDelta(.6,0,.7,11,.5,60,1/60).transition===true`, `assert.equal(DEAD_NDC,.4)`. В `tests/owner042-044-browser.mjs:48` порог `drift<.1` верен только пока герой в зоне: добавь вторую фазу — после выхода героя за ±0.4 камера сместилась (drift>0), но шаг за кадр ≤ 0.5 м (нет скачка). Проверка: `node --test tests/*.test.mjs` + browser-скрипт в CI.
2. **Тавтологичный тест портала.** `rift-event.mjs:8` `alignment=(dx*look.x+dz*look.z)/(l*max(l,.001))` ≈ всегда 1. Замени на угол к реальному вектору герой→портал: `const sx=x-pos.x, sz=z-pos.z; alignment=(sx*dx+sz*dz)/(Math.hypot(sx,sz)*l)` (x,z — вычисленная точка), и в тесте дай look нестандартного масштаба `{x:2,z:-3}`: ожидаем alignment≈1 и distance 2.6±0.05. Для «в кадре»: в browser-тесте `portal.position.clone().project(camera)` → |x|,|y|<1.
3. Мелочь: NPC только роль scavenger (living-population.mjs:46) — добавь вторую оригинальную роль из npc-catalog.js.

PASS/FAIL владельца не заявлять. После исправления — просто новый PR, REVIEW OK постфактум.
