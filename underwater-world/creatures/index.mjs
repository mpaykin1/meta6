import { CREATURE_BIOMES, CREATURE_CATALOG } from './catalog.mjs';

export { CREATURE_BIOMES, CREATURE_CATALOG } from './catalog.mjs';

const STATES = new Set(['idle', 'explore', 'flee', 'hostile']);
const SCHEMA = 'twilight-underwater-creatures';
const MAX_STEP = 1;
const OBSERVE_RANGE = 12;
const DEFENSE_SECONDS = 4;
const DEFENSE_COOLDOWN = 30;
const ATTACK_INTERVAL = 1.5;
const ATTACK_RANGE = 1.8;
const SURFACE = -0.6;

function hash(value) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++) {
    result = Math.imul(result ^ value.charCodeAt(index), 16777619) >>> 0;
  }
  return result || 1;
}

function random(holder) {
  let value = holder.rng;
  value ^= value << 13;
  value ^= value >>> 17;
  value ^= value << 5;
  holder.rng = value >>> 0;
  return holder.rng / 4294967296;
}

function point(value) {
  return value && ['x', 'y', 'z'].every(axis => Number.isFinite(value[axis]));
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function copy(value) {
  return structuredClone(value);
}

function copyEntity(entity) {
  return { ...entity, position: { ...entity.position }, origin: { ...entity.origin } };
}

function positiveInteger(value, fallback, name, maximum) {
  if (value === undefined) return fallback;
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) {
    throw new RangeError(`${name} must be an integer from 1 to ${maximum}`);
  }
  return value;
}

function coordinate(value) {
  // Leave headroom for multiplication by the supported chunk size.
  if (!Number.isSafeInteger(value) || Math.abs(value) > 1e9) {
    throw new RangeError('Chunk coordinates must be safe integers within +/- 1e9');
  }
}

function finiteRange(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

/** Rendering and combat belong to the game adapter; this system emits intentions. */
export function createCreatureSystem({
  seed = 0, emit = () => {}, maxEntities = 96, maxChunks = 32,
  maxObserved = 256, chunkSize = 64,
} = {}) {
  if (!((typeof seed === 'string' && seed.length > 0 && seed.length <= 128) ||
        (typeof seed === 'number' && Number.isSafeInteger(seed)))) {
    throw new TypeError('seed must be a non-empty string up to 128 characters or a safe integer');
  }
  if (typeof emit !== 'function') throw new TypeError('emit must be a function');
  maxEntities = positiveInteger(maxEntities, 96, 'maxEntities', 512);
  maxChunks = positiveInteger(maxChunks, 32, 'maxChunks', 128);
  maxObserved = positiveInteger(maxObserved, 256, 'maxObserved', 4096);
  maxObserved = Math.max(maxEntities, maxObserved);
  if (!finiteRange(chunkSize, 8, 1024)) throw new RangeError('chunkSize must be from 8 to 1024');

  const seedText = String(seed);
  const prefix = `creature:${hash(seedText).toString(16)}:`;
  let chunks = new Map();
  let entities = new Map();
  let observed = new Set();
  let elapsed = 0;
  let lastUnderwater = false;
  let mutating = false;
  let dispatching = false;
  let pending = [];

  function snapshot(entity) {
    return {
      id: entity.id, speciesId: entity.speciesId, assetId: entity.speciesId,
      chunkX: entity.chunkX, chunkZ: entity.chunkZ, biome: entity.biome,
      position: { ...entity.position }, heading: entity.heading,
      state: entity.state, hostile: entity.state === 'hostile',
    };
  }

  function queue(type, entity, details = {}) {
    pending.push({
      type, entityId: entity.id, speciesId: entity.speciesId,
      position: { ...entity.position }, ...details,
    });
  }

  function setState(entity, state) {
    if (state === entity.state) return;
    const previousState = entity.state;
    entity.state = state;
    queue('creature:state', entity, { previousState, state });
  }

  function mutate(work) {
    if (mutating || dispatching) {
      throw new Error('Defer creature mutations until the current operation / emit callback returns');
    }
    mutating = true;
    let result;
    let workError;
    let workFailed = false;
    try { result = work(); } catch (error) { workFailed = true; workError = error; }
    finally { mutating = false; }
    if (workFailed) {
      pending = [];
      throw workError;
    }
    const events = pending;
    pending = [];
    dispatching = true;
    let callbackError;
    let callbackFailed = false;
    try {
      for (const event of events) {
        try { emit(copy(event)); } catch (error) {
          if (!callbackFailed) callbackError = error;
          callbackFailed = true;
        }
      }
    } finally { dispatching = false; }
    if (callbackFailed) throw callbackError;
    return result;
  }

  function removeChunk(key, reason) {
    const chunk = chunks.get(key);
    if (!chunk) return false;
    for (const id of chunk.ids) {
      const entity = entities.get(id);
      if (entity) {
        queue('creature:despawned', entity, { reason });
        entities.delete(id);
      }
    }
    chunks.delete(key);
    return true;
  }

  function spawnForChunk(chunkX, chunkZ, biome = 'open') {
    coordinate(chunkX);
    coordinate(chunkZ);
    if (!CREATURE_BIOMES.includes(biome)) biome = 'open';
    return mutate(() => {
      const key = `${chunkX}:${chunkZ}`;
      const existing = chunks.get(key);
      if (existing) return existing.ids.map(id => entities.get(id)).filter(Boolean).map(snapshot);
      const generator = { rng: hash(`${seedText}|${key}|${biome}`) };
      const count = Math.min(maxEntities, 3 + Math.floor(random(generator) * 4));
      while (chunks.size >= maxChunks || entities.size + count > maxEntities) {
        removeChunk(chunks.keys().next().value, 'capacity');
      }
      const candidates = Object.values(CREATURE_CATALOG).filter(species => species.biomes.includes(biome));
      const chunk = { chunkX, chunkZ, biome, ids: [] };
      chunks.set(key, chunk);
      for (let slot = 0; slot < count; slot++) {
        const species = candidates[Math.floor(random(generator) * candidates.length)];
        const id = `${prefix}${chunkX}:${chunkZ}:${biome}:${slot}`;
        const position = {
          x: (chunkX + 0.15 + random(generator) * 0.7) * chunkSize,
          y: -(species.minDepth + random(generator) * (species.maxDepth - species.minDepth)),
          z: (chunkZ + 0.15 + random(generator) * 0.7) * chunkSize,
        };
        const entity = {
          id, speciesId: species.id, chunkX, chunkZ, biome, slot,
          position, origin: { ...position }, heading: random(generator) * Math.PI * 2,
          state: random(generator) < 0.25 ? 'idle' : 'explore',
          stateTime: 2 + random(generator) * 5, cooldown: 0,
          aggressionRemaining: 0, attackCooldown: 0, rng: generator.rng,
        };
        entities.set(id, entity);
        chunk.ids.push(id);
        queue('creature:spawned', entity, { entity: snapshot(entity) });
      }
      return chunk.ids.map(id => snapshot(entities.get(id)));
    });
  }

  function observe(entity, history) {
    if (history.has(entity.id)) return;
    history.add(entity.id);
    if (history.size > maxObserved) history.delete(history.values().next().value);
    queue('creature:observed', entity, { biome: entity.biome, underwater: true });
  }

  function stopDefense(entity) {
    entity.aggressionRemaining = 0;
    entity.cooldown = Math.max(entity.cooldown, DEFENSE_COOLDOWN);
    entity.stateTime = 3;
    setState(entity, 'flee');
  }

  function update(dt, context = {}) {
    if (!Number.isFinite(dt) || dt < 0) throw new RangeError('dt must be a finite non-negative number of seconds');
    if (!context || typeof context !== 'object') throw new TypeError('context must be an object');
    if (context.seabedHeight !== undefined && typeof context.seabedHeight !== 'function') {
      throw new TypeError('seabedHeight must be a function');
    }
    const player = point(context.player) ? { ...context.player } : null;
    const underwater = context.underwater === true && player !== null;
    dt = Math.min(dt, MAX_STEP);
    return mutate(() => {
      if (dt === 0) {
        lastUnderwater = underwater;
        return getEntities();
      }
      // Stage the whole frame: the sampler receives FINAL x/z, and a throwing
      // sampler leaves entities, observation history, timers and events unchanged.
      const nextEntities = new Map(Array.from(entities, ([id, entity]) => [id, copyEntity(entity)]));
      const nextChunks = new Map(Array.from(chunks, ([key, chunk]) => [key, { ...chunk, ids: [...chunk.ids] }]));
      const nextObserved = new Set(observed);
      const nextElapsed = (elapsed + dt) % 3600;
      for (const entity of nextEntities.values()) {
        const species = CREATURE_CATALOG[entity.speciesId];
        entity.cooldown = Math.max(0, entity.cooldown - dt);
        entity.attackCooldown = Math.max(0, entity.attackCooldown - dt);
        entity.stateTime = Math.max(0, entity.stateTime - dt);
        if (entity.state === 'hostile') {
          entity.aggressionRemaining = Math.max(0, entity.aggressionRemaining - dt);
          if (!underwater || entity.aggressionRemaining === 0) stopDefense(entity);
        }
        if ((entity.state === 'flee' || entity.state === 'idle' || entity.state === 'explore') && entity.stateTime === 0) {
          setState(entity, random(entity) < 0.25 ? 'idle' : 'explore');
          entity.heading = random(entity) * Math.PI * 2;
          entity.stateTime = 2 + random(entity) * 5;
        }
        let playerDistance = underwater ? distance(entity.position, player) : Infinity;
        if (playerDistance < 2.5 && ['idle', 'explore'].includes(entity.state)) {
          entity.stateTime = 3;
          setState(entity, 'flee');
        }
        let speed = entity.state === 'idle' ? 0 : species.speed;
        if (underwater && ['flee', 'hostile'].includes(entity.state)) {
          const toward = entity.state === 'hostile' ? 1 : -1;
          entity.heading = Math.atan2((player.z - entity.position.z) * toward, (player.x - entity.position.x) * toward);
          speed *= entity.state === 'flee' ? 1.8 : 1.25;
          if (entity.state === 'hostile' && playerDistance < 0.8) speed = 0;
          entity.position.y += Math.sign((player.y - entity.position.y) * toward) * speed * 0.3 * dt;
        } else {
          if (Math.hypot(entity.position.x - entity.origin.x, entity.position.z - entity.origin.z) > chunkSize * 0.45) {
            entity.heading = Math.atan2(entity.origin.z - entity.position.z, entity.origin.x - entity.position.x);
          }
          const targetY = entity.origin.y + Math.sin(nextElapsed * 0.4 + entity.slot) * 0.8;
          entity.position.y += Math.max(-0.5, Math.min(0.5, targetY - entity.position.y)) * dt;
        }
        entity.position.x += Math.cos(entity.heading) * speed * dt;
        entity.position.z += Math.sin(entity.heading) * speed * dt;
        const sampled = context.seabedHeight?.(entity.position.x, entity.position.z);
        const floor = Number.isFinite(sampled) ? sampled : undefined;
        if (floor !== undefined && floor + 0.6 >= SURFACE) {
          const chunk = nextChunks.get(`${entity.chunkX}:${entity.chunkZ}`);
          chunk.ids = chunk.ids.filter(id => id !== entity.id);
          nextEntities.delete(entity.id);
          queue('creature:despawned', entity, { reason: 'dry-terrain' });
          continue;
        }
        entity.position.y = Math.min(SURFACE, Math.max(floor === undefined ? -100 : floor + 0.6, entity.position.y));
        playerDistance = underwater ? distance(entity.position, player) : Infinity;
        if (underwater && playerDistance <= OBSERVE_RANGE) observe(entity, nextObserved);
        if (entity.state === 'hostile' && playerDistance <= ATTACK_RANGE && entity.attackCooldown === 0) {
          entity.attackCooldown = ATTACK_INTERVAL;
          queue('creature:attack-requested', entity, { target: 'player', attackKind: 'defensive-contact', range: ATTACK_RANGE, underwater: true });
        }
      }
      entities = nextEntities;
      chunks = nextChunks;
      observed = nextObserved;
      elapsed = nextElapsed;
      lastUnderwater = underwater;
      return getEntities();
    });
  }

  function onPlayerAction(action) {
    if (!action || typeof action !== 'object') throw new TypeError('action must be an object');
    if (!['attack', 'disturb', 'feed'].includes(action.type)) return false;
    return mutate(() => {
      const entity = entities.get(action.targetId);
      if (!entity || !(action.underwater === true || (action.underwater !== false && lastUnderwater))) return false;
      if (action.type === 'feed') {
        if (entity.state === 'hostile') stopDefense(entity);
        return true;
      }
      if (entity.cooldown > 0 || entity.state === 'hostile') return false;
      entity.cooldown = DEFENSE_COOLDOWN;
      entity.stateTime = 3;
      if (random(entity) < CREATURE_CATALOG[entity.speciesId].defensiveChance) {
        entity.aggressionRemaining = DEFENSE_SECONDS;
        entity.attackCooldown = 0;
        setState(entity, 'hostile');
      } else {
        setState(entity, 'flee');
      }
      return true;
    });
  }

  function getEntities() {
    return Array.from(entities.values(), snapshot);
  }

  function unloadChunk(chunkX, chunkZ) {
    coordinate(chunkX);
    coordinate(chunkZ);
    return mutate(() => removeChunk(`${chunkX}:${chunkZ}`, 'unloaded'));
  }

  function serialize() {
    return {
      schema: SCHEMA, version: 1, seed: seedText, chunkSize, elapsed, lastUnderwater,
      chunks: Array.from(chunks.values(), chunk => ({
        chunkX: chunk.chunkX, chunkZ: chunk.chunkZ, biome: chunk.biome,
        entities: chunk.ids.map(id => copy(entities.get(id))),
      })),
      observed: [...observed],
    };
  }

  function restore(state) {
    // Validate the whole bounded snapshot before replacing anything.
    if (!state || state.schema !== SCHEMA || state.version !== 1 || state.seed !== seedText || state.chunkSize !== chunkSize ||
        !finiteRange(state.elapsed, 0, 3600) || typeof state.lastUnderwater !== 'boolean' ||
        !Array.isArray(state.chunks) || state.chunks.length > maxChunks ||
        !Array.isArray(state.observed) || state.observed.length > maxObserved) {
      throw new TypeError('Invalid or incompatible creature save');
    }
    const restoredChunks = new Map();
    const restoredEntities = new Map();
    for (const savedChunk of state.chunks) {
      if (!savedChunk || !Array.isArray(savedChunk.entities) || savedChunk.entities.length > 6 || !CREATURE_BIOMES.includes(savedChunk.biome)) {
        throw new TypeError('Invalid creature chunk');
      }
      coordinate(savedChunk.chunkX);
      coordinate(savedChunk.chunkZ);
      const key = `${savedChunk.chunkX}:${savedChunk.chunkZ}`;
      if (restoredChunks.has(key)) throw new TypeError('Duplicate creature chunk');
      const chunk = { chunkX: savedChunk.chunkX, chunkZ: savedChunk.chunkZ, biome: savedChunk.biome, ids: [] };
      restoredChunks.set(key, chunk);
      for (const entity of savedChunk.entities) {
        const species = entity && Object.hasOwn(CREATURE_CATALOG, entity.speciesId) ? CREATURE_CATALOG[entity.speciesId] : null;
        const expectedId = entity && `${prefix}${chunk.chunkX}:${chunk.chunkZ}:${chunk.biome}:${entity.slot}`;
        if (!species || !species.biomes.includes(chunk.biome) || entity.id !== expectedId ||
            entity.chunkX !== chunk.chunkX || entity.chunkZ !== chunk.chunkZ || entity.biome !== chunk.biome ||
            !Number.isInteger(entity.slot) || entity.slot < 0 || entity.slot > 5 || restoredEntities.has(entity.id) ||
            !point(entity.position) || !point(entity.origin) || entity.position.y > SURFACE || entity.origin.y > SURFACE ||
            !Number.isFinite(entity.heading) || !STATES.has(entity.state) ||
            !finiteRange(entity.stateTime, 0, 7) || !finiteRange(entity.cooldown, 0, DEFENSE_COOLDOWN) ||
            !finiteRange(entity.aggressionRemaining, 0, DEFENSE_SECONDS) || !finiteRange(entity.attackCooldown, 0, ATTACK_INTERVAL) ||
            !Number.isInteger(entity.rng) || entity.rng < 1 || entity.rng > 0xffffffff ||
            (entity.state === 'hostile' && (species.defensiveChance === 0 || entity.aggressionRemaining === 0))) {
          throw new TypeError('Invalid creature entity');
        }
        // Whitelist fields rather than retaining arbitrary save payloads/references.
        restoredEntities.set(entity.id, {
          id: entity.id, speciesId: entity.speciesId, chunkX: entity.chunkX, chunkZ: entity.chunkZ,
          biome: entity.biome, slot: entity.slot, position: { x: entity.position.x, y: entity.position.y, z: entity.position.z },
          origin: { x: entity.origin.x, y: entity.origin.y, z: entity.origin.z }, heading: entity.heading,
          state: entity.state, stateTime: entity.stateTime, cooldown: entity.cooldown,
          aggressionRemaining: entity.aggressionRemaining, attackCooldown: entity.attackCooldown, rng: entity.rng,
        });
        chunk.ids.push(entity.id);
      }
    }
    if (restoredEntities.size > maxEntities || Array.from(state.observed).some(id => typeof id !== 'string' || id.length > 160 || !id.startsWith(prefix)) ||
        new Set(state.observed).size !== state.observed.length) throw new TypeError('Creature save exceeds limits or has invalid observations');
    return mutate(() => {
      chunks = restoredChunks;
      entities = restoredEntities;
      observed = new Set(state.observed);
      elapsed = state.elapsed;
      lastUnderwater = state.lastUnderwater;
      return getEntities();
    });
  }

  return Object.freeze({ spawnForChunk, update, onPlayerAction, serialize, restore, getEntities, unloadChunk });
}
