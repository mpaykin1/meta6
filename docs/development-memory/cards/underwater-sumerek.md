# Карточка опыта: underwater-sumerek

Краткая выборка; все исходные записи сохранены в ../events.jsonl.
При конфликте не выбирай победителя по дате: проверь обе ссылки, запиши новую запись с supersedes.

## animation/glsl-smoothstep-order
- 2026-10-21 · failure · technical · 2026-10-21-underwater-smoothstep-order
- **Наблюдение:** Шейдер хвоста косяков рыб вызывал smoothstep с edge0 больше edge1, что даёт неопределённый результат GLSL.
- **Применять:** Для обратной маски применять 1.0 - smoothstep(minEdge, maxEdge, x) и защищать source/build поиском старого вызова и численной проверкой весов.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/pull/164) · SHA 69f9414127b589f7e200f2a4edb4d75cc5b2fcca

## game/portal-preserve-state
- 2026-10-21 · baseline · technical · 2026-10-21-underwater-portal
- **Наблюдение:** Портал соединяет подводный биом с островом, перенося HP, реликвии и оружие.
- **Применять:** При графических улучшениях регрессионно проверять оба перехода и сохранение состояния.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/underwater-sumerek/README.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd
