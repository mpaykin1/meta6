# Codex underwater module checkpoint

Status: **MODULES IMPLEMENTED; integration/review and owner verdict pending**. This is a module delivery, not a playable underwater release.

Primary ChatGPT owns rendering, terrain, bathyscaphe, water physics, controls, integration and deployment. Codex owns only `quests/`, `creatures/`, and this document under `underwater-world/`. Preserve accepted V5/V6/V7 and the primary ChatGPT's files. No renderer imports, npm runtime dependencies, monkeypatches, timers, DOM writes or automatic storage.

Branch: `ai/codex/twilight-underwater-quests-20261016`, based on shared contract commit `8e3eee4a623b1c91f43dece6be7e6f0bd70eee6b`.
Integration branch: `ai/chatgpt/twilight-underwater-20261016`.
Contract: [CLAUDE.md](../CLAUDE.md). Source specification: [World_server #522](https://github.com/mpaykin1/World_server/issues/522). Donor assets: [PR #521](https://github.com/mpaykin1/World_server/pull/521), fetched at `1b292a3d7cefcfd021298f2ab234ef0fc31c9ccf`.

## Delivered scope

- `quests/index.mjs`: `createQuestSystem({seed, emit, onReward})`, deterministic quest progression, bounded snapshots and reward retry queue.
- `quests/catalog.mjs`: six data-driven exploration quests and guardian descriptor.
- `quests/guardian.mjs`: Russian dialogue and explicit accept/decline choices.
- `quests/quests.test.mjs`: progression, duplicates, stale dialogue, hostile input, saves, callback failure/reentry and Unicode seed tests.
- `quests/save-validation.test.mjs`: empty array slots must not become quest progress or poison a JSON save.
- `creatures/index.mjs` and `catalog.mjs`: seeded population, exploration/flee/temporary defense, bounded streaming, saves and semantic events. `creatures/README.md` supplies detailed fauna options.
- `creatures/failure-boundaries.test.mjs`: all thrown values cancel terrain frames, the first observer error is preserved, and observation saves require actual IDs.
- Tests live alongside their modules. No original V7 files, renderer, gameplay, weapons, ammo, mobile controls, terrain, asset files or main ChatGPT files are changed.

Do not infer a finished game or a player-visible quality percentage from these module tests. There is no owner PASS/FAIL for this work.

## Quest integration API

ES modules with `.mjs` extension work directly in browsers and Node. The catalog is deeply frozen; all public state snapshots and dialogue results are detached from live state.

```js
import { createQuestSystem, GUARDIAN } from './quests/index.mjs';

const quests = createQuestSystem({
  seed: gameSeed, // short string (1..128 UTF-16 units) or safe integer
  emit: event => adapter.presentQuestEvent(event),
  onReward: reward => adapter.awardKnowledgeOnce(reward.deliveryId, reward.id),
});

// These adapter methods illustrate integration points; they are NOT existing V7 APIs.
// Call only after engine-side proximity, live ghost and underwater checks.
const dialogue = quests.interact(GUARDIAN.id, { underwater: true });
adapter.showGuardianDialogue(dialogue);

// Use the actual choice from the displayed dialogue; keep its questId to reject stale UI.
quests.interact(GUARDIAN.id, {
  underwater: true, choice: 'accept', questId: dialogue.questId,
});
```

- `interact(npcId, worldState)` returns `null` for every other NPC, including the original lighthouse ghost. Missing/false `underwater` returns an unavailable dialogue. First contact offers accept/decline; accepting starts only that quest. Subsequent interaction reports progress or turns in a ready quest. Completion unlocks the next quest. Completed campaign returns farewell.
- Dialogue: `{npcId, name, kind, questId, title, text, choices, progress?, reward?}`. Kinds: `offer`, `accepted`, `declined`, `progress`, `rewarded`, `farewell`, `unavailable`, `stale`, `busy`. A choice carries `{id, label, questId}`.
- `getAvailableQuests()` returns available, active or ready quest views; `getQuests()` also includes locked/completed ones. Each view contains `{id,title,status,objectives:[{id,label,count,target}]}`.
- `onEvent(event)` returns `{changed:boolean,reason?}`. Only accepted quests progress; ready objectives stop accumulating. No pre-accept history is retained. The integrator must keep quest objects discoverable/revisitable, and replay a validated stable world fact after acceptance when needed. Turning in is required before the next quest becomes available.
- `serialize()` returns `{schema:'twilight-underwater-quests',version:1,seed,quests}`. `restore(snapshot)` returns `{ok:true}` or `{ok:false,reason}`. Validation is atomic, seed-specific, bounded and emits no callbacks. It is a local save format, not an anti-cheat service.
- `flushRewards()` retries pending deliveries; returns `{delivered,pending}`. Reward objects: `{id,kind:'knowledge',title,questId,deliveryId}`. There are no weapon/ammo grants. An opaque deterministic `deliveryId` is unchanged on retries. `onReward` must be **synchronous**: return `false` to defer, otherwise it acknowledges delivery. Throwing retains pending state and propagates to the caller. With no callback, knowledge rewards remain pending in the snapshot.
- External writes must **atomically deduplicate `deliveryId`** in the main game save/inventory. A process can crash after the external award but before this module records delivery; callbacks alone cannot guarantee exactly-once effects across a crash or a restored older save.
- `emit` is a synchronous read-only observer. State commits first; errors propagate. All mutating quest calls from inside `emit` or `onReward` are rejected (`busy`, `{changed:false,reason}`, `{ok:false,reason}` or a zero-delivery result). Queue new commands until the callback returns. `serialize()`/read views are allowed. Reward delivery can be explicitly retried if the completion event observer throws.

### Engine → quest signals

Every signal must contain **`underwater:true`**. The module accepts semantic facts, not keyboard input. The engine validates proximity, puzzle result, collected item and native inventory before sending. It must not forward surface events or arbitrary UI clicks as accomplishments. IDs are nonempty strings up to 128 UTF-16 units. Use stable world/chunk/slot IDs, independent of mesh UUIDs or reloads.

| Quest | Validated event and required fields | Goal |
|---|---|---|
| `lost-bell-voice` | `landmark:examined`, `landmarkId:'sunken-bell'`; then `bell:resonated`, `bellId:'sunken-bell'` | Examine then resonate the bell; early resonance is ignored |
| `cartographer-fragments` | `relic:recovered`, `itemId:'cartographer-fragment'`, unique `instanceId` | 3 different fragments |
| `lighthouse-beacons` | `beacon:lit`, unique `beaconId` | 3 different underwater beacons |
| `coral-restoration` | `coral:restored`, unique `colonyId` | 3 different colonies |
| `ship-trail` | `wreck:surveyed`, unique `wreckId` | 3 different ship sites |
| `stopped-clock` | `landmark:examined`, `landmarkId:'stopped-clock'`; then `clock:restarted`, `clockId:'stopped-clock'` | Examine then restart the clock |

Example: `quests.onEvent({type:'relic:recovered', underwater:true, itemId:'cartographer-fragment', instanceId:'relic:12:-4:2'})`. Repeated IDs never add progress. Fish kills, item quantities and frame updates are not quest progress.

Quest output envelopes:

- `quest:accepted`, `quest:ready`: `{type,questId}`.
- `quest:progress`: `{type,questId,objectiveId,count,target}`.
- `quest:completed`: `{type,questId,reward}`. This is a notification; only `onReward` should apply a reward to avoid double grants.

The six themes come from the shared contract. Sequential unlocks, three distinct sites for the middle four quests, knowledge rewards and exact signal names are concrete module design choices for primary ChatGPT review. Full issue #522 was not readable from this cloud session (`gh` proxy 403, public HTML unavailable); reconcile any additional issue requirements in the integration PR rather than claiming they were checked here.

### Ghost and prop presentation

`GUARDIAN.id` is `guardian-of-depths`, name `Хранитель Глубин`. Its `assetId` is explicitly `null`: the pack has no confirmed guardian ghost model. Main ChatGPT supplies an adapted original-game ghost visual without replacing the surface ghost/warden logic. The module provides text/state only and adds no scene object itself.

Verified donor IDs used as **hints**: `cathedral_bell`, `street_lamp`, `galleon`. Fragment, clock and coral-restoration puzzle props still need explicit engine placement/art. Null hints do not claim an existing asset. Catalog requirements are gameplay signals; the integrator owns actual landmark generation, puzzles, proximity, persistently collected fragments and collision.

## Creature integration API

```js
import { createCreatureSystem } from './creatures/index.mjs';

const fauna = createCreatureSystem({
  seed: gameSeed, chunkSize: adapter.chunkWorldSize,
  emit: event => adapter.presentCreatureEvent(event),
});
fauna.spawnForChunk(chunkX, chunkZ, 'reef'); // reef | ruins | deep | open

// Call from the existing continuation frame, not a new animation loop.
const entities = fauna.update(dtSeconds, {
  underwater: adapter.isUnderwater(),
  player: { x: player.x, y: player.y - seaLevel, z: player.z },
  seabedHeight: (x, z) => adapter.seabedY(x, z) - seaLevel,
});
adapter.syncCreatureMeshes(entities.map(entity => ({
  ...entity, position: { ...entity.position, y: entity.position.y + seaLevel },
})));

// Only after the real engine resolves an action against a valid target:
fauna.onPlayerAction({ type: 'disturb', targetId, underwater: true });
fauna.unloadChunk(chunkX, chunkZ);
```

Coordinates are world units with **surface at y=0**, water below zero. V7's native `SEA=3.8` must be subtracted on input and added for rendering. X/Z chunk size/origin must match the terrain streamer. The module does not import `SEA`, probe the renderer or alter native drowning/vehicle physics.

- `spawnForChunk(x,z,biome)` returns a detached array, creates 3–6 entities (or a smaller configured cap), and reuses an active chunk. Unknown biome falls back to `open`. Reload resets unloaded fauna to deterministic spawn state; stable IDs persist, not simulation state of infinitely many unloaded chunks.
- Do not render initial spawn positions before a first **positive-dt** `update` with a valid seabed sampler: spawn cannot know the real floor or dry terrain. Use update's resolved snapshots for rendering and reconcile after despawn events. The sampler is called at final moved X/Z; a throwing sampler cancels the entire frame and emits nothing.
- `update(dt,context)` returns all active entity snapshots. Time is seconds; invalid/negative time throws, resumed-tab steps clamp to 1 second. The engine should supply its normal small frame/fixed steps. `underwater:true` **and finite player position** are required for observations/attacks. Missing player or surface mode cannot attack the player.
- `onPlayerAction({type:'attack'|'disturb'|'feed',targetId,underwater?})` returns boolean. Attack/disturb can produce rare brief defense, usually flee. Repeated actions cannot reroll the cooldown. Feed de-escalates defense; the engine must validate real food/use first. Missing `underwater` uses the last update's context, so pass it explicitly after transitions.
- `getEntities()` snapshots have `{id,speciesId,assetId,chunkX,chunkZ,biome,position:{x,y,z},heading,state,hostile}`. States: `idle`, `explore`, `flee`, `hostile`.
- `unloadChunk(x,z)` removes active entities and emits despawns. Default caps: 96 entities, 32 chunks, 256 observations; capacity evicts oldest active chunks. Observation history is bounded: after eviction a very old creature may be observed again. Do not turn observations into an unlimited repeatable reward.
- `serialize()`/`restore(snapshot)` schema `twilight-underwater-creatures`, version 1, seed/chunk-size specific. Restore validates before replacement and emits nothing; invalid saves **throw** (unlike quest restore's result object). Snapshot includes the last underwater flag for deterministic continuation. Explicitly pass the current underwater flag for actions after loading or changing modes, so an old context cannot authorize a surface action.
- Snapshots/callback payloads cannot mutate module state. Creature mutators called during a mutation/emit throw; callbacks may read state. Emitter failures propagate after committed state; notification delivery is not a durable event log. Ensure the main adapter reconciles meshes from `getEntities()` after an error.

Fauna output envelopes all include `{type,entityId,speciesId,position}` in surface-relative coordinates:

| Event | Additional fields | Adapter action |
|---|---|---|
| `creature:spawned` | `entity` snapshot | Load/reuse matching catalog asset |
| `creature:despawned` | `reason` | Release/hide mesh; reasons include capacity, unloaded, dry-terrain |
| `creature:state` | `previousState,state` | Choose an available donor animation |
| `creature:observed` | `biome,underwater:true` | Bestiary/journal notification only |
| `creature:attack-requested` | `target:'player',attackKind:'defensive-contact',range,underwater:true` | Revalidate range, live player/creature, line-of-sight, invulnerability, vehicle and native damage rules |

There is **no damage amount or direct HP/weapon/ammo mutation**. The adapter alone applies native combat. Avoid applying contact damage as well as an attack request for the same interaction. Default species do not initiate ambient combat; defensive behavior needs a validated disturbance. Defense lasts at most 4 simulated seconds, attacks no faster than every 1.5 seconds, and has a 30-second cooldown. Feeding or surfacing ends defense. Terrain sampler keeps fauna above the bottom; it is not a general wall/cavern collider. Main physics owns detailed geometry and collision resolution.

All 14 species IDs are real entries of the fetched PR #521 manifest. Import the catalog to choose assets, do not construct guessed filenames. This module does not bundle or fetch models. Main ChatGPT owns archive extraction/loading and animation support.

## Save and event integration rules

Use a separate namespace such as `twilight-underwater-modules-v1` in the continuation's save. Do not reuse V7's `observer-v7-mobile-island-builder` or wipe it. Include game seed, module snapshots, main landmark/loot state and the idempotent reward ledger in the main save transaction. No module automatically accesses localStorage.

Restore into **new module instances** first, validate both, then swap them into the main runtime. This avoids half-restoring the live game when only one snapshot is invalid. Do not flush reward deliveries during restore; validate/load the main inventory and ledger first, then call `flushRewards()` when the adapter is ready. Handle errors visibly and preserve the previous good save.

Keep quest world-fact events separate from fauna presentation events. No broad event forwarding is required. Neither module owns `window.__isle`, `window.__observerV7Frame`, input listeners or an animation loop. V7's original drowning, surface ghost, weapons, loot and attack controls remain the integrator's responsibility.

## Verification and remaining integration

Run from repository root, using existing Node (no package install):

```sh
node --test underwater-world/quests/*.test.mjs underwater-world/creatures/*.test.mjs
```

Current module run: **33 tests, 0 failing, 0 skipped** (12 quest and 21 creature cases). Four added regressions first reproduced errors on `5236f58`, then passed with the fixes in `ca62334`. Any thrown value (including `undefined`, `null`, `false`, `0`, `''`) now cancels the staged terrain frame without emitting its events; observer errors preserve the first thrown value after every queued callback is offered. Sparse arrays in quest/observation saves are rejected before replacing state. Valid saves, public API and version-1 schemas are unchanged.

Internal Codex review also reproduced and corrected quest callback reentry, malformed-Unicode reward keys and sampling the floor at the moved position; this is not Claude review or owner acceptance. Earlier separate read-only probes exercised 700 streamed/save/restore states across different entity caps and a late sampler failure. All 14 species IDs and 3 distinct prop hints were checked against the fetched donor manifest.

A real Chromium 154.0.8037.57 HTTP ES-module smoke on `ca62334` rejected both malformed snapshots, cancelled a terrain frame throwing `undefined` with no state/event leakage, then completed the bell quest, delivered one reward, spawned/updated 6 fauna and roundtripped their save. It installed neither original renderer nor frame hook; no page errors. This is a **module/browser check only**, not a game or physical-phone test. No packages, authentication, TLS settings or environment configuration were changed.

Still owned by primary ChatGPT: all visual ghost/creature placement and animations, six actual world interactions, stable prop IDs and persistent discoveries, primary save/ledger adapter, real damage and native weapon rules, underwater physics/vehicle/surface transitions, frame/chunk hooks, HUD/dialogue UI, desktop/mobile integration tests, independently measured player-visible quality, live publication and final review. No playable underwater URL is asserted here. Last accepted baseline source remains [Observer V7](https://github.com/mpaykin1/meta6/tree/main/observer-world-en-v7); source availability is not a fresh live-game verification.

## GitHub review request / checkpoint

**Current code + tests commit:** [`ca6233471da2f778c6c67038b88ce79f1547b1f3`](https://github.com/mpaykin1/meta6/commit/ca6233471da2f778c6c67038b88ce79f1547b1f3). Initial implementation: [`63eae5b298740fcafac740bc8d010a279b95a8ee`](https://github.com/mpaykin1/meta6/commit/63eae5b298740fcafac740bc8d010a279b95a8ee). A following documentation-only commit updates this checkpoint; use the branch HEAD for the complete handoff.

**PR not created by Codex.** After successful push, `gh pr create` failed with `Post "https://api.github.com/graphql": Forbidden`. Issue #522 comments/checkpoints were **not updated**; this repository file is the saved checkpoint. No merge, Pages release, CI run or Claude review is claimed. The API block is external to the modules; no login/reset/reinstall was attempted.

At continuation start the primary integration branch still pointed to `8e3eee4` (contract only); no underwater runtime or module integration was published there. Git refs showed PRs #1/#2 for unrelated V6/V8 work, no Codex modules PR. The owner reports Slack is connected, but no callable Slack tool is exposed in this session; no Slack messages were read or sent. Coordination is saved here in GitHub for the connected primary browser ChatGPT.

PR target: `ai/chatgpt/twilight-underwater-20261016`. Head: `ai/codex/twilight-underwater-quests-20261016`. [Open the comparison / PR creation form](https://github.com/mpaykin1/meta6/compare/ai/chatgpt/twilight-underwater-20261016...ai/codex/twilight-underwater-quests-20261016?expand=1). This link is a form, **not an existing PR**.

Suggested PR title: `feat(underwater): guardian quests and passive wildlife modules`.

Suggested review comment (after primary ChatGPT creates the PR):

> Ревью для Claude: проверь отдельные модули `underwater-world/quests/` и `creatures/`, выполни 33 теста командой из CODEX_HANDOFF.md, проверь сохранения/повторные награды/редкую агрессию и API интеграции. Код исходной V7 и файлы основного ChatGPT не изменены. Внутренние проверки Codex не заменяют твоё ревью. Не назначай пользовательский PASS/FAIL.

Main ChatGPT should review and integrate only after its integration checks. Codex must not merge its own modules into the primary game. The owner alone decides PASS/FAIL. This checkpoint contains implementation evidence and limitations, not a verdict-based success/failure learning record.

## Ready prompt for the current or a new ordinary browser ChatGPT

Copy this block into the primary ChatGPT, or into a **new ordinary browser ChatGPT** if the primary chat is unavailable. Do not start a new Codex or a new project.

```text
Продолжай текущую совместную разработку подводного продолжения «Острова сумерек».

Основной репозиторий: https://github.com/mpaykin1/meta6
Ветка основного ChatGPT: ai/chatgpt/twilight-underwater-20261016
Ветка модулей Codex: ai/codex/twilight-underwater-quests-20261016
Проверенный коммит кода и тестов: ca6233471da2f778c6c67038b88ce79f1547b1f3
Полный актуальный checkpoint/API:
https://github.com/mpaykin1/meta6/blob/ai/codex/twilight-underwater-quests-20261016/underwater-world/docs/CODEX_HANDOFF.md
Распределение файлов:
https://github.com/mpaykin1/meta6/blob/ai/codex/twilight-underwater-quests-20261016/underwater-world/CLAUDE.md
Базовая принятая игра (исходники):
https://github.com/mpaykin1/meta6/tree/main/observer-world-en-v7
Полное ТЗ: https://github.com/mpaykin1/World_server/issues/522
Донор ассетов: https://github.com/mpaykin1/World_server/pull/521

Codex написал только quests/, creatures/ и docs/CODEX_HANDOFF.md внутри underwater-world/.
Готовы Хранитель Глубин, русские диалоги, 6 квестов, 14 видов подводных обитателей,
ограниченное состояние, сохранения, редкая временная защитная агрессия и API.
33 теста прошли (12 quests + 21 creatures), ошибок/пропусков нет.
Дополнительно исправлены отмена кадра при любом исключении и пустые ID в сохранениях;
4 новые регрессии воспроизвели ошибки на5236f58 и проходят после исправления.
ES-модули/исправления проверены в Chromium154 по HTTP, ошибок страницы нет;
это не проверка готовой игры/телефона. API и схема сохранений не изменились.
Оригинальная V7, движок, графика, управление, террейн, батискаф и файлы интегратора не менялись.

Первые действия:
1. Прочитать CLAUDE.md и полный CODEX_HANDOFF.md из ветки Codex, сверить полное issue522.
2. Через подключённый GitHub создать PR из ai/codex/twilight-underwater-quests-20261016
   в ai/chatgpt/twilight-underwater-20261016 (если такого PR ещё нет).
   Заголовок: feat(underwater): guardian quests and passive wildlife modules.
   В описание включить границы изменений, 33 теста, браузерную проверку и ограничения интеграции.
3. Обновить существующий checkpoint issue522 ссылкой на PR и этот файл; не создавать дубликат задания.
   Codex этого не сделал: Git push работает, gh API/GraphQL заблокирован облачным прокси Forbidden.
4. Запустить: node --test underwater-world/quests/*.test.mjs underwater-world/creatures/*.test.mjs
5. Проверить/подключить API и запросить ревью Claude через комментарий PR из checkpoint.

API: createQuestSystem({seed,emit,onReward}) из quests/index.mjs;
createCreatureSystem({seed,emit,chunkSize}) из creatures/index.mjs.
Quest world events требуют underwater:true и стабильных ID подтверждённых взаимодействий.
onReward синхронный, внешний ledger атомарно дедуплицирует deliveryId.
Fauna Y=0 на поверхности: вычитай engine SEA из player/terrain и прибавляй для mesh.
После spawn сначала update с положительным dt + seabedHeight, потом отображай resolved snapshots.
Нет дополнительного requestAnimationFrame, DOM/storage побочных эффектов или прямого урона.

Основной ChatGPT отвечает за основной движок, графику, бесконечный мир, батискаф, погружение,
управление, UI призрака, реальные квестовые объекты, сохранение мира/находок/ledger и адаптеры.
Этого ещё нет в модулях Codex. Сохрани оригинальные оружие, лут, маячного призрака, камеру и HUD.
Точные условия заданий (3 разных места для средних четырёх квестов, последовательность,
knowledge-награды) — проверяемые решения модуля; сверь их с полным ТЗ522.
Не переписывай готовые модули заново, не переустанавливай окружение/gh, не повторяй авторизацию.
Используй бесплатные инструменты; не меняй main/master напрямую и не публикуй непроверенную игру.
Полноценная опубликованная подводная игра этим коммитом НЕ заявлена.
Пользовательский PASS/FAIL назначает исключительно владелец; его решения для этого среза нет.
```

## Continuation rule

If Codex reaches a resource limit, save code and push this branch, update this existing checkpoint, and give the owner a complete continuation prompt for a **new ordinary browser ChatGPT**, never another Codex. The new chat continues these modules and coordinates through GitHub; it must not reinstall the environment, rewrite accepted modules, or assign owner PASS/FAIL. No browser-chat creation tool is available here.

Git HTTPS fetch/push works. `gh api` currently receives cloud-proxy `403` before GitHub; public issue/PR HTML is unavailable here. Do not repeat login, disable TLS, or reinstall `gh`. Bound network operations to 15 seconds. If API stays blocked, push code and let the connected primary/browser ChatGPT create the PR and update issue #522.
