# Карточка опыта: ashen-sumerek

Краткая выборка; все исходные записи сохранены в ../events.jsonl.
При конфликте не выбирай победителя по дате: проверь обе ссылки, запиши новую запись с supersedes.

## fx/bloom-whiteout
- 2026-10-21 · failure · technical · 2026-10-21-ashen-bloom
- **Наблюдение:** Белая пелена вокруг костра происходила из чрезмерного bloom, а не из тумана.
- **Применять:** При белой засветке сначала изолировать bloom и снять одинаковые кадры; в зафиксированном случае множитель 0.12.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## fx/visible-dark-particles
- 2026-10-21 · solution · technical · 2026-10-21-ashen-opaque-ash
- **Наблюдение:** Мелкие additive частицы теряются на тёмной сцене; заметный чёрный пепел получен обычным смешиванием, крупными тёмными точками.
- **Применять:** Сравнивать кадры с отключёнными соседними FX; не заменять непрозрачный пепел добавочным свечением.
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd

## tests/live-events-loop
- 2026-10-21 · failure · technical · 2026-10-21-ashen-live-events
- **Наблюдение:** sim() не запускает игровой директор событий; для проверки событий необходим реальный кадровый цикл G.play.
- **Применять:** Тестировать события в живом игровом цикле Chromium, а не объявлять покрытие по sim().
- **Источник:** [доказательство](https://github.com/mpaykin1/meta6/blob/715ae2ad43b07e47c9d2e6a4f65eedd608091bdd/docs/SUCCESS_SUMERKI_I_PEPEL_2026-10-21.md) · SHA 715ae2ad43b07e47c9d2e6a4f65eedd608091bdd
