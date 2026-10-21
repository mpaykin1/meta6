# Asset Pack Quality System — v0.1
Основа: abyss.md §§0–15, AGENTS.md, graf.md. Не заменяет старые задачи.
## Контракт
1. Сначала владелец/MD/эталон, затем reuse и новые генерации. Оригинальный source неизменяем.
2. На каждый HARD: requirement_id, source, target, test, evidence, state=FAIL|UNKNOWN|STATIC_PASS|OWNER_APPROVED. Отсутствие доказательства = UNKNOWN, не PASS.
3. Pipeline: source inventory → reference/visual style → crop → opaque body/detail/normal/emissive → manifest/atlas → animation/2.5D/3D → live scene → device evidence → owner decision.
4. Asset Pack Quality Gate запускает статическую проверку Python/Pillow по manifest; живые визуальные, 3D, FPS и художественные проверки отдельно. Не подменять их статическим PASS.
5. Каждый подтверждённый дефект → regression fixture/test + append-only events.jsonl + compact_experience.py --check; не менять существующий CI до проверки gate в отдельном PR.
6. Развитие: общие проверки параметризовать по MD игры, дополнять visual diff, shader probes, animation tests, real mobile benchmarks, license inventory, provenance SHA и asset dependency graph.
## Команда
`python3 automation/asset-quality/validate.py --root abyss-glow/assets --manifest abyss-glow/assets/manifest.json --output asset-quality-report.json`
Отсутствие manifest = FAIL. Статические успехи = STATIC_PASS_RUNTIME_UNKNOWN, окончательный PASS только владелец.
## Пять существующих слотов
:05 requirements traceability; :15 sprite/atlas production; :30 animation; :40 live integration; :50 independent QA. Существующие игровые задачи и расписания сохраняются.
