# Underwater wildlife module

`index.mjs` is independent of Three.js, the original game, DOM, networking and
combat code. It exports `createCreatureSystem`, `CREATURE_CATALOG` and
`CREATURE_BIOMES`. There are no runtime dependencies. Asset ids reference the
Sunken City pack in World_server PR #521; this module does not load assets.

```js
import { createCreatureSystem } from './creatures/index.mjs';

const wildlife = createCreatureSystem({
  seed: 'current-world',
  emit(event) {
    // Queue events for the renderer / journal / original combat adapter.
    // Do not call wildlife mutation methods from this callback.
    engineEvents.push(event);
  },
});

wildlife.spawnForChunk(chunkX, chunkZ, 'reef');
const entities = wildlife.update(deltaSeconds, {
  underwater: heroIsActuallyUnderwater,
  player: { x: hero.x, y: hero.y - SEA, z: hero.z },
  seabedHeight: (x, z) => nativeTerrainHeight(x, z) - SEA,
});
// Match meshes by entity.id; native mesh Y = entity.position.y + SEA.
```

## Coordinates and lifecycle

- This module uses water surface **Y = 0**, negative underwater Y, and a creature
  ceiling at -0.6 units. V7 uses `SEA = 3.8`; the game adapter must convert both
  player Y and the seabed height, then convert mesh Y back. X/Z are unchanged.
- `spawnForChunk(x, z, biome)` returns detached entity snapshots. Supported biome
  ids are `reef`, `ruins`, `deep`, `open`; unknown ids use `open`. The default chunk
  width is 64 world units, configurable with `chunkSize` (8–1024). Chunk coordinates
  are integers within ±1e9. Spawn positions are provisional depth guesses: call
  `update` with the real sampler before creating visible meshes.
- `update(dt, context)` accepts seconds and returns all detached snapshots. The
  largest accepted simulation step is one second; larger finite steps are clamped
  to one second so resuming a suspended tab does not fast-forward combat. Use the
  engine's regular frame/fixed-step loop. Negative/non-finite dt is rejected; zero
  dt changes only the remembered underwater context, not positions or discoveries.
- `context.player` is a finite `{x,y,z}`. Observations and attack requests require
  this valid point **and** `context.underwater === true`; missing/false surface
  context stops defense. The system never changes the player object.
- Optional `seabedHeight(x,z)` must be a pure synchronous numerical sampler. It
  receives final moved X/Z, so slopes are resolved in the same frame. Fauna stays
  0.6 units above the sampled bottom. Non-finite heights use the fallback -100 Y
  depth limit; water shallower than 1.2 units despawns the creature. A throwing
  sampler aborts the entire frame, including timers, observations and events.
- `getEntities()` returns copies with
  `{id,speciesId,assetId,chunkX,chunkZ,biome,position,heading,state,hostile}`. Position
  is `{x,y,z}` and heading is radians measured from +X toward +Z. Map it to the
  mesh model's forward axis; this module does not assume its original orientation.
- `unloadChunk(x,z)` returns whether the chunk existed and emits despawn events.
  Repeated spawn of an active chunk is idempotent (its first biome remains in use).
  Reloading an unloaded chunk reproduces original stable ids and initial positions;
  motion is not retained for unloaded chunks. Persistent quest progress belongs
  to the quest system, not unloaded wildlife instances.

## Passive behavior and controlled defense

All creatures start idle or exploring. Approaching within 2.5 units makes them
flee; ordinary observation never starts combat. Only angler, eel and hermit crab
can defend, with respective 12%, 18% and 4% chances per contextual disturbance.
The other 11 species always flee. There is no continuous combat loop.

After an actual player action confirmed by the main game's interaction/combat
adapter, call:

```js
wildlife.onPlayerAction({ type: 'attack', targetId: entity.id, underwater: true });
// Also supported: type 'disturb', type 'feed'. Unknown types/targets return false.
```

`attack`/`disturb` return whether the target reacted. Defense or flight consumes a
30-second response cooldown, so repeated input cannot reroll the chance. Defense
lasts at most four simulated seconds, then becomes flight with a fresh cooldown.
`feed` ends active defense. The caller owns food inventory, valid hit/range checks
and action authorization. If `underwater` is omitted, the last valid frame context
is used; explicit false overrides that remembered context.

Attack requests are at most one per 1.5 seconds per hostile creature, within 1.8
units. They apply **no damage**. The native game adapter must recheck current
underwater status, distance, line of sight, player immunity and weapon/combat
rules before invoking its existing damage function. Do not add a second combat
implementation or reset terrestrial weapons/ammo.

## Events

Every event has `{type,entityId,speciesId,position:{x,y,z}}`, copied away from state.

| Type | Additional fields / meaning |
| --- | --- |
| `creature:spawned` | `entity`: detached complete render snapshot |
| `creature:state` | `previousState`, `state`: `idle`, `explore`, `flee`, `hostile` |
| `creature:despawned` | `reason`: `unloaded`, `capacity`, or `dry-terrain` |
| `creature:observed` | `biome`, `underwater: true`; once per retained stable id within 12 units |
| `creature:attack-requested` | `target:'player'`, `attackKind:'defensive-contact'`, `range:1.8`, `underwater:true` |

Callbacks run after the operation commits. They may read `getEntities`/`serialize`;
reentrant mutation throws an explicit error. Queue actions until the callback
returns. An emitter exception is propagated after all queued events are offered;
the committed simulation remains valid. The caller must handle callback errors;
there is no automatic event retry. There are no callbacks during restore.

## Bounds and saves

Defaults: 96 active entities, 32 tracked chunks, 256 retained observations. Options
`maxEntities` (1–512), `maxChunks` (1–128), `maxObserved` (1–4096) control these
bounds; the effective observation limit is at least `maxEntities`. Capacity evicts
the oldest loaded chunks. Call spawn on chunk arrival, unload on departure, and
keep the renderer's active chunk set within these limits to avoid reload churn.

Old observed ids are forgotten in insertion order. Revisiting one after eviction
can emit observation again. No unbounded world exploration history is retained;
the finite quest engine owns completed objective records separately.

`serialize()` returns a detached JSON-safe state with schema
`twilight-underwater-creatures`, version 1. `restore(state)` validates the whole
snapshot, seed, chunk size, state fields and current capacity limits before
replacing state. Invalid saves throw and leave state intact; extra entity fields
are discarded. Use the same configuration and seed (non-empty string up to 128
characters or safe integer) for deterministic continuation. Mutating the returned
save cannot affect simulation. Restore emits nothing; reconcile the renderer from
`getEntities()` and provide current frame context before processing new controls.

## Checks

```sh
node --test underwater-world/creatures/*.test.mjs
```

Unit coverage includes deterministic chunk reloads, streaming/history limits,
passive bias, defense rarity/cooldown/cadence/surface safety, observations,
save round trips and malformed saves, detached snapshots, invalid dt/NaN,
sloped-bottom resolution, atomic sampler failures and callback reentrancy.
These checks are not evidence of rendered graphics, physical-phone behavior,
asset-loading performance or owner acceptance; those require engine integration.
