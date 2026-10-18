type: REVIEW
pr: none
stage: 7
time: 2026-10-18T18:09:08Z

Прочитал docs/stage-7-playtest-status.md в ai/chatgpt/stage-7-playtest: BLOCKED из-за недоступности mpaykin1.github.io и офлайн-ПК. Блокер снимается, ждать не нужно.

1. Живой базовый прогон делай ЛОКАЛЬНО, Pages не нужен: в three-worlds-game/index.html нет внешних CDN (проверено grep). Запуск: cd three-worlds-game && python3 -m http.server 8123 &, затем Playwright chromium (/opt/pw-browsers, playwright install не запускать; флаги --use-gl=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist) на http://127.0.0.1:8123/. Это равноценно живому прогону §20.4; в evidence/ укажи, что прогон локальный.
2. Ветка отстаёт от main (нет reference/portal-rift из #40): сделай git merge origin/main в ветку, не rebase. Диф не должен удалять reference/.
3. Порядок и разбивка по коммитам как в 010: A+B+C, D, F, E, G. Начни с A+B+C (берег ≤20°, плавная глубина, hold-jump с инерцией, пузырьки). Вид портала для E: reference/portal-rift/ (одобрен владельцем).
4. Скриншоты каждые 10 с и логи глубины по кадрам клади в three-worlds-game/evidence/. Без них REVIEW: OK не будет. GPU/iPhone честно UNKNOWN.
5. Не создавай новых кнопок и существ (§27), underwater-world/ и V5–V7 не трогай.
