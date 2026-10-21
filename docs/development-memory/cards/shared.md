# Карточка опыта: shared

Краткая выборка; все исходные записи сохранены в ../events.jsonl.
При конфликте не выбирай победителя по дате: проверь обе ссылки, запиши новую запись с supersedes.

## baseline/golden-readonly
- 2026-10-21 · baseline · technical · 2026-10-21-golden-no-touch
- **Наблюдение:** Три эталона в reference/sumerek-golden защищены SHA-256; изменения эталона ломают проверку.
- **Применять:** Не редактировать эталоны; сравнивать изменения в рабочих сборках с ними.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/AGENTS.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## build/patch-not-html
- 2026-10-21 · solution · technical · 2026-10-21-source-patches
- **Наблюдение:** Готовые index.html формируются из исходников и скриптов patch, а не редактируются вручную.
- **Применять:** Для ashen запускать patch_ash.py; для underwater запускать patch.py; сверять сборку с закоммиченным HTML.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/ashen-sumerek/README.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## git/stale-dependent-pr
- 2026-10-21 · failure · technical · 2026-10-21-avoid-stale-base
- **Наблюдение:** Зависимые PR с устаревшей веткой теряли исправление simDir и ломали golden.
- **Применять:** Перед ревью проверять ancestry актуального родителя и запускать тесты на head ветки.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-19-stacked-prs-stale-base.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## review/ai-other-company
- 2026-10-21 · decision · technical · 2026-10-21-world-review
- **Наблюдение:** World_server требует независимого ревью Claude и ChatGPT для изменяемых игр; тесты не заменяют решения владельца.
- **Применять:** Перед слиянием запрашивать Claude в PR и показывать проверенную игровую ссылку владельцу.
- **Источник:** [доказательство](https://github.com/mpaykin1/World_server/blob/567a48442ed1dee39e2baad87df2df998b231f95/AGENTS.md) · SHA 567a48442ed1dee39e2baad87df2df998b231f95

## tests/tautology-green-ci
- 2026-10-21 · failure · technical · 2026-10-21-dont-self-test
- **Наблюдение:** Тест сверял таблицу с самой собой: зелёный CI скрывал ошибку координат портала.
- **Применять:** Проверять реальное игровое поведение, включая отрицательные сценарии, и мутацией подтверждать полезность теста.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/lessons/2026-10-20-guest-trigger-xz-and-self-compared-constants.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd
