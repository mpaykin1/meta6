import test from 'node:test';
import assert from 'node:assert/strict';
import { CREATURE_CATALOG, createCreatureSystem } from './index.mjs';

function contextAt(entity, extras = {}) {
  return { player: { ...entity.position }, underwater: true, ...extras };
}

function defendingFixture() {
  for (let seed = 0; seed < 100; seed++) {
    const events = [];
    const system = createCreatureSystem({ seed, emit: event => events.push(event) });
    for (const entity of system.spawnForChunk(0, 0, 'deep')) {
      if (!CREATURE_CATALOG[entity.speciesId].defensiveChance) continue;
      system.onPlayerAction({ type: 'disturb', targetId: entity.id, underwater: true });
      const defending = system.getEntities().find(item => item.id === entity.id);
      if (defending.state === 'hostile') return { system, entity: defending, events };
    }
  }
  assert.fail('A representative set of deterministic seeds must include a defensive encounter');
}

test('catalog uses the supplied Sunken City asset ids and most species cannot become hostile', () => {
  assert.deepEqual(Object.keys(CREATURE_CATALOG).sort(), [
    'glow_fish_teal', 'glow_fish_violet', 'glow_fish_amber', 'glow_fish_emerald',
    'lantern_fish', 'angler', 'eel', 'jellyfish_violet', 'jellyfish_teal', 'manta',
    'seahorse', 'nautilus', 'hermit_crab', 'siphonophore',
  ].sort());
  assert.ok(Object.values(CREATURE_CATALOG).filter(species => species.defensiveChance === 0).length >= 10);
  assert.ok(Object.values(CREATURE_CATALOG).every(species => species.assetId === species.id));
});

test('spawns are deterministic across unload/reload and independent of chunk load order', () => {
  const first = createCreatureSystem({ seed: 'Тихий океан' });
  const second = createCreatureSystem({ seed: 'Тихий океан' });
  const initial = first.spawnForChunk(-2, 3, 'reef');
  second.spawnForChunk(11, 20, 'deep');
  assert.deepEqual(second.spawnForChunk(-2, 3, 'reef'), initial);
  assert.deepEqual(first.spawnForChunk(-2, 3, 'deep'), initial, 'an active chunk does not silently change biome');
  assert.equal(first.unloadChunk(-2, 3), true);
  assert.equal(first.unloadChunk(-2, 3), false);
  assert.deepEqual(first.spawnForChunk(-2, 3, 'reef'), initial);
  assert.notEqual(createCreatureSystem({ seed: 'other' }).spawnForChunk(-2, 3, 'reef')[0].id, initial[0].id);
});

test('endless chunk streaming caps entities, chunks, and observed history', () => {
  const events = [];
  const system = createCreatureSystem({ seed: 'streaming', maxEntities: 12, maxChunks: 3, maxObserved: 15, emit: event => events.push(event) });
  for (let index = 0; index < 120; index++) {
    const population = system.spawnForChunk(index, -index, 'reef');
    for (const entity of population) system.update(0.01, contextAt(entity));
    const state = system.serialize();
    assert.ok(system.getEntities().length <= 12);
    assert.ok(state.chunks.length <= 3);
    assert.ok(state.observed.length <= 15);
  }
  assert.ok(events.some(event => event.type === 'creature:despawned' && event.reason === 'capacity'));
  assert.ok(system.getEntities().every(entity => entity.chunkX > 110));
});

test('passive exploration does not initiate combat, even when approached repeatedly', () => {
  const events = [];
  const system = createCreatureSystem({ seed: 'calm', emit: event => events.push(event) });
  for (let chunk = 0; chunk < 30; chunk++) {
    const population = system.spawnForChunk(chunk, 0, 'deep');
    for (const entity of population) {
      for (let frame = 0; frame < 10; frame++) system.update(0.1, contextAt(entity));
    }
  }
  assert.equal(events.filter(event => event.type === 'creature:attack-requested').length, 0);
  assert.equal(events.filter(event => event.type === 'creature:state' && event.state === 'hostile').length, 0);
  assert.ok(events.some(event => event.type === 'creature:state' && event.state === 'flee'));
});

test('targeted disturbance causes rare, temporary defense; repeated input cannot reroll cooldown', () => {
  let total = 0;
  let hostile = 0;
  for (let seed = 0; seed < 150; seed++) {
    const system = createCreatureSystem({ seed });
    for (const entity of system.spawnForChunk(0, 0, 'deep')) {
      total++;
      assert.equal(system.onPlayerAction({ type: 'disturb', targetId: entity.id, underwater: true }), true);
      const firstState = system.getEntities().find(item => item.id === entity.id).state;
      if (firstState === 'hostile') hostile++;
      for (let retry = 0; retry < 5; retry++) {
        assert.equal(system.onPlayerAction({ type: 'attack', targetId: entity.id, underwater: true }), false);
      }
      assert.equal(system.getEntities().find(item => item.id === entity.id).state, firstState);
    }
  }
  assert.ok(hostile > 0, 'defense remains possible');
  assert.ok(hostile / total < 0.1, `only ${hostile}/${total} encounters defended`);
});

test('defensive contact emits bounded attack requests, never deals damage, and ends on a timer', () => {
  const { system, entity, events } = defendingFixture();
  const player = { ...entity.position, hp: 10 };
  for (let frame = 0; frame < 40; frame++) system.update(0.1, { player, underwater: true });
  const requests = events.filter(event => event.type === 'creature:attack-requested' && event.entityId === entity.id);
  assert.ok(requests.length >= 1 && requests.length <= 3, `bounded cadence: ${requests.length}`);
  assert.ok(requests.every(event => event.target === 'player' && event.attackKind === 'defensive-contact'));
  assert.equal(player.hp, 10);
  assert.notEqual(system.getEntities().find(item => item.id === entity.id).state, 'hostile');
  assert.equal(system.onPlayerAction({ type: 'attack', targetId: entity.id, underwater: true }), false);
  for (let frame = 0; frame < 32; frame++) system.update(1, { underwater: true, player: { x: 999, y: -5, z: 999 } });
  assert.equal(system.onPlayerAction({ type: 'disturb', targetId: entity.id, underwater: true }), true);
});

test('defense cannot attack a surface player; feeding can de-escalate it', () => {
  const { system, entity, events } = defendingFixture();
  system.update(0.1, contextAt(entity, { underwater: false }));
  assert.equal(events.filter(event => event.type === 'creature:attack-requested').length, 0);
  assert.notEqual(system.getEntities().find(item => item.id === entity.id).state, 'hostile');
  assert.equal(system.onPlayerAction({ type: 'attack', targetId: entity.id }), false);
  const other = defendingFixture();
  assert.equal(other.system.onPlayerAction({ type: 'feed', targetId: other.entity.id, underwater: true }), true);
  assert.equal(other.system.getEntities().find(item => item.id === other.entity.id).state, 'flee');
});

test('observations have stable entity/species ids, survive unload and restore, and do not duplicate every frame', () => {
  const events = [];
  const system = createCreatureSystem({ seed: 'observation', emit: event => events.push(event) });
  const entity = system.spawnForChunk(1, -1, 'reef')[0];
  system.update(0.1, contextAt(entity));
  system.update(0.1, contextAt(entity));
  const observations = events.filter(event => event.type === 'creature:observed' && event.entityId === entity.id);
  assert.equal(observations.length, 1);
  assert.equal(observations[0].speciesId, entity.speciesId);
  system.unloadChunk(1, -1);
  system.spawnForChunk(1, -1, 'reef');
  system.update(0.1, contextAt(entity));
  assert.equal(events.filter(event => event.type === 'creature:observed' && event.entityId === entity.id).length, 1);
  const restoredEvents = [];
  const restored = createCreatureSystem({ seed: 'observation', emit: event => restoredEvents.push(event) });
  restored.restore(JSON.parse(JSON.stringify(system.serialize())));
  restored.update(0.1, contextAt(entity));
  assert.equal(restoredEvents.filter(event => event.type === 'creature:observed' && event.entityId === entity.id).length, 0);
});

test('identical saved states and future inputs continue deterministically without emitting on restore', () => {
  const { system: original, entity } = defendingFixture();
  original.update(0.5, contextAt(entity));
  const save = JSON.parse(JSON.stringify(original.serialize()));
  const events = [];
  const restored = createCreatureSystem({ seed: save.seed, emit: event => events.push(event) });
  restored.restore(save);
  assert.equal(events.length, 0);
  assert.deepEqual(restored.serialize(), save);
  save.chunks[0].entities[0].position.y = -999;
  for (let frame = 0; frame < 20; frame++) {
    const context = contextAt(entity);
    assert.deepEqual(restored.update(0.1, context), original.update(0.1, context));
  }
  assert.deepEqual(restored.serialize(), original.serialize());
});

test('invalid save data is rejected atomically and cannot inject extra retained payloads', () => {
  const system = createCreatureSystem({ seed: 'validation', maxEntities: 6, maxChunks: 2 });
  system.spawnForChunk(0, 0, 'deep');
  const before = system.serialize();
  for (const mutate of [
    state => { state.seed = 'foreign'; },
    state => { state.elapsed = NaN; },
    state => { state.chunks[0].entities[0].position.x = Infinity; },
    state => { state.chunks[0].entities[0].position.y = 10; },
    state => { state.chunks[0].entities[0].speciesId = 'toString'; },
    state => { state.chunks[0].entities[0].id = 'foreign'; },
    state => { state.chunks[0].entities[0].rng = 0; },
    state => { state.chunks.push(state.chunks[0]); },
    state => { state.observed.push('foreign'); },
  ]) {
    const corrupt = structuredClone(before);
    mutate(corrupt);
    assert.throws(() => system.restore(corrupt));
    assert.deepEqual(system.serialize(), before);
  }
  const extra = structuredClone(before);
  extra.chunks[0].entities[0].untrusted = { huge: 'discarded' };
  system.restore(extra);
  assert.equal('untrusted' in system.serialize().chunks[0].entities[0], false);
});

test('restore preserves context-dependent actions as well as movement state', () => {
  const original = createCreatureSystem({ seed: 8 });
  const entity = original.spawnForChunk(0, 0, 'deep')[0];
  original.update(0.1, contextAt(entity));
  const restored = createCreatureSystem({ seed: 8 });
  restored.restore(original.serialize());
  const action = { type: 'disturb', targetId: entity.id };
  assert.equal(restored.onPlayerAction(action), original.onPlayerAction(action));
  assert.deepEqual(restored.serialize(), original.serialize());
});

test('snapshots, saves, and emitted positions cannot mutate the simulation', () => {
  const system = createCreatureSystem({ seed: 12, emit: event => {
    event.position.y = 999;
    if (event.entity) event.entity.position.y = 999;
  } });
  const spawned = system.spawnForChunk(0, 0, 'reef');
  spawned[0].position.y = 999;
  system.getEntities()[0].position.y = 999;
  system.serialize().chunks[0].entities[0].position.y = 999;
  assert.ok(system.getEntities().every(entity => entity.position.y < 0));
});

test('NaN, invalid dt, coordinates, and bad callbacks cannot poison simulation state', () => {
  const system = createCreatureSystem({ seed: 42 });
  system.spawnForChunk(0, 0, 'reef');
  const before = system.serialize();
  for (const dt of [-1, NaN, Infinity, undefined]) assert.throws(() => system.update(dt), /dt/);
  for (const x of [NaN, Infinity, 1.5, 1e10]) assert.throws(() => system.spawnForChunk(x, 0), /coordinates/);
  assert.deepEqual(system.serialize(), before);
  let samples = 0;
  assert.throws(() => system.update(0.1, { seabedHeight: () => {
    if (++samples === 2) throw new Error('second sample failed');
    return -5;
  } }), /second sample failed/);
  assert.deepEqual(system.serialize(), before, 'no partial frame or observations after a late sampler failure');
  assert.throws(() => system.update(0.1, { seabedHeight: () => { throw new Error('terrain failed'); } }), /terrain failed/);
  assert.deepEqual(system.serialize(), before);
  system.update(0, { underwater: true, player: { x: NaN, y: -4, z: 0 } });
  system.update(10000, { player: { x: NaN, y: -4, z: 0 }, underwater: true, seabedHeight: () => NaN });
  assert.equal(system.serialize().elapsed, 1, 'a suspended tab does not fast-forward combat');
  assert.ok(system.getEntities().every(entity => Object.values(entity.position).every(Number.isFinite)));
});

test('floor sampling uses final moved x/z on ramps, with no one-frame penetration', () => {
  const system = createCreatureSystem({ seed: 'sloped-floor' });
  const initial = system.spawnForChunk(0, 0, 'deep');
  const seabedHeight = x => -6 + x * 0.01;
  const after = system.update(1, { seabedHeight });
  assert.ok(after.some((entity, index) => entity.position.x > initial[index].position.x));
  assert.ok(after.every(entity => entity.position.y >= seabedHeight(entity.position.x, entity.position.z) + 0.6));
});

test('seed validation matches the quest module seed contract', () => {
  for (const seed of ['', 'x'.repeat(129), 1.5, NaN, Infinity, {}, null]) {
    assert.throws(() => createCreatureSystem({ seed }), /seed/);
  }
  assert.doesNotThrow(() => createCreatureSystem({ seed: 'мир' }));
  assert.doesNotThrow(() => createCreatureSystem({ seed: Number.MAX_SAFE_INTEGER }));
});

test('seabed sampler clamps fauna above the bottom and dry chunks despawn rather than surfacing', () => {
  const events = [];
  const system = createCreatureSystem({ seed: 3, emit: event => events.push(event) });
  system.spawnForChunk(0, 0, 'deep');
  system.update(0.1, { seabedHeight: () => -8 });
  assert.ok(system.getEntities().every(entity => entity.position.y >= -7.4 && entity.position.y < 0));
  system.update(0.1, { seabedHeight: () => 0 });
  assert.equal(system.getEntities().length, 0);
  assert.ok(events.some(event => event.type === 'creature:despawned' && event.reason === 'dry-terrain'));
});

test('callbacks can read snapshots; reentrant mutations are rejected without corrupting state', () => {
  let system;
  let reads = 0;
  let mutations = 0;
  system = createCreatureSystem({ emit: () => {
    assert.ok(system.serialize().chunks.length > 0);
    assert.ok(system.getEntities().length > 0);
    reads++;
    assert.throws(() => system.unloadChunk(0, 0), /Defer creature mutations/);
    mutations++;
  } });
  system.spawnForChunk(0, 0, 'reef');
  assert.ok(reads > 0 && reads === mutations);
  assert.ok(system.getEntities().length > 0);
});

test('emitter failures propagate after commit; later operations remain usable', () => {
  let shouldThrow = true;
  const system = createCreatureSystem({ emit: () => { if (shouldThrow) throw new Error('consumer failed'); } });
  assert.throws(() => system.spawnForChunk(0, 0, 'reef'), /consumer failed/);
  assert.ok(system.getEntities().length >= 3);
  shouldThrow = false;
  assert.equal(system.unloadChunk(0, 0), true);
  assert.equal(system.getEntities().length, 0);
});
