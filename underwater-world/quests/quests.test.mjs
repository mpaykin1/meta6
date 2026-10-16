import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuestSystem, GUARDIAN, QUESTS } from './index.mjs';

const talk = (system, extra = {}) => system.interact(GUARDIAN.id, { underwater: true, ...extra });
const signal = (system, type, detail = {}) => system.onEvent({ type, underwater: true, ...detail });
const accept = system => talk(system, { choice: 'accept', questId: system.getAvailableQuests()[0].id });
const bell = system => {
  signal(system, 'landmark:examined', { landmarkId: 'sunken-bell' });
  signal(system, 'bell:resonated', { bellId: 'sunken-bell' });
};
const journey = [
  ['lost-bell-voice', bell],
  ['cartographer-fragments', system => ['map-a', 'map-b', 'map-c'].forEach(instanceId => signal(system, 'relic:recovered', { itemId: 'cartographer-fragment', instanceId }))],
  ['lighthouse-beacons', system => ['light-a', 'light-b', 'light-c'].forEach(beaconId => signal(system, 'beacon:lit', { beaconId }))],
  ['coral-restoration', system => ['reef-a', 'reef-b', 'reef-c'].forEach(colonyId => signal(system, 'coral:restored', { colonyId }))],
  ['ship-trail', system => ['wreck-a', 'wreck-b', 'wreck-c'].forEach(wreckId => signal(system, 'wreck:surveyed', { wreckId }))],
  ['stopped-clock', system => {
    signal(system, 'landmark:examined', { landmarkId: 'stopped-clock' });
    signal(system, 'clock:restarted', { clockId: 'stopped-clock' });
  }],
];
const finishBell = system => { accept(system); bell(system); return talk(system); };

test('guardian offers a choice, waits underwater, and leaves unrelated NPCs alone', () => {
  const system = createQuestSystem({ seed: 'island' });
  const before = system.serialize();
  assert.equal(system.interact('original-lighthouse-ghost', { underwater: true }), null);
  assert.equal(system.interact(GUARDIAN.id, { underwater: false }).kind, 'unavailable');
  assert.equal(system.interact(GUARDIAN.id).kind, 'unavailable');
  const offer = talk(system);
  assert.equal(offer.name, 'Хранитель Глубин');
  assert.equal(offer.questId, 'lost-bell-voice');
  assert.deepEqual(offer.choices.map(choice => choice.id), ['accept', 'decline']);
  assert.equal(talk(system, { choice: 'decline' }).kind, 'declined');
  assert.deepEqual(system.serialize(), before, 'reading/declining cannot accept or pay a quest');
  assert.equal(accept(system).kind, 'accepted');
  assert.equal(talk(system).kind, 'progress');
});

test('six exploration quests complete in sequence with return dialogue and one reward each', () => {
  const events = [], rewards = [];
  const system = createQuestSystem({ seed: 42, emit: event => events.push(event), onReward: reward => rewards.push(reward) });
  assert.equal(QUESTS.length, 6);
  for (const [questId, explore] of journey) {
    assert.equal(talk(system).questId, questId);
    accept(system);
    explore(system);
    assert.equal(system.getAvailableQuests()[0].status, 'ready');
    assert.equal(rewards.length, journey.findIndex(entry => entry[0] === questId), 'discoveries do not auto-pay');
    const reply = talk(system);
    assert.equal(reply.kind, 'rewarded');
    assert.equal(reply.questId, questId);
    assert.ok(reply.text.length > 20);
    assert.equal(reply.reward.kind, 'knowledge', 'no grants of uncollected weapons or ammo');
  }
  assert.equal(talk(system).kind, 'farewell');
  talk(system); bell(system);
  assert.deepEqual(system.getAvailableQuests(), []);
  assert.equal(rewards.length, 6);
  assert.equal(new Set(rewards.map(reward => reward.deliveryId)).size, 6);
  for (const type of ['quest:accepted', 'quest:ready', 'quest:completed']) assert.equal(events.filter(event => event.type === type).length, 6, type);
  assert.ok(system.getQuests().every(quest => quest.status === 'completed'));
});

test('events require acceptance, underwater context, correct targets and objective order', () => {
  const system = createQuestSystem();
  bell(system);
  accept(system);
  signal(system, 'bell:resonated', { bellId: 'sunken-bell' });
  system.onEvent({ type: 'landmark:examined', landmarkId: 'sunken-bell', underwater: false });
  signal(system, 'landmark:examined', { landmarkId: 'island-lighthouse' });
  assert.deepEqual(system.getQuests()[0].objectives.map(goal => goal.count), [0, 0]);
  signal(system, 'landmark:examined', { landmarkId: 'sunken-bell' });
  assert.deepEqual(system.getQuests()[0].objectives.map(goal => goal.count), [1, 0]);
  signal(system, 'bell:resonated', { bellId: 'sunken-bell' });
  assert.equal(system.getQuests()[0].status, 'ready');
  assert.equal(system.getQuests()[1].status, 'locked', 'return to guardian unlocks the next quest');
  const before = system.serialize();
  assert.equal(talk(system, { questId: 'stopped-clock', choice: 'accept' }).kind, 'stale');
  assert.deepEqual(system.serialize(), before);
});

test('repeated notifications cannot farm fragments, progress, or rewards', () => {
  const events = [], rewards = [];
  const system = createQuestSystem({ emit: event => events.push(event), onReward: reward => rewards.push(reward) });
  finishBell(system);
  accept(system);
  for (let i = 0; i < 500; i++) {
    signal(system, 'relic:recovered', { itemId: 'cartographer-fragment', instanceId: 'same-fragment' });
    signal(system, 'relic:recovered', { itemId: 'doubloon', instanceId: `wrong-${i}` });
    signal(system, 'creature:killed', { entityId: `fish-${i}` });
  }
  assert.equal(system.getQuests()[1].objectives[0].count, 1);
  assert.equal(events.filter(event => event.type === 'quest:progress' && event.questId === 'cartographer-fragments').length, 1);
  assert.equal(rewards.length, 1);
  signal(system, 'relic:recovered', { itemId: 'cartographer-fragment', instanceId: 'second-fragment' });
  signal(system, 'relic:recovered', { itemId: 'cartographer-fragment', instanceId: 'third-fragment' });
  for (let i = 0; i < 1000; i++) signal(system, 'relic:recovered', { itemId: 'cartographer-fragment', instanceId: `extra-${i}` });
  assert.equal(system.serialize().quests[1].seen['map-fragments'].length, 3, 'save memory is bounded by goal count');
  talk(system); talk(system);
  assert.equal(rewards.length, 2);
});

test('save roundtrip preserves partially explored quests and never emits during restore', () => {
  const system = createQuestSystem({ seed: 'test-reef' });
  finishBell(system); accept(system);
  signal(system, 'relic:recovered', { itemId: 'cartographer-fragment', instanceId: 'fragment-1' });
  const saved = JSON.parse(JSON.stringify(system.serialize()));
  const calls = [];
  const restored = createQuestSystem({ seed: 'test-reef', emit: event => calls.push(event), onReward: reward => calls.push(reward) });
  assert.deepEqual(restored.restore(saved), { ok: true });
  assert.deepEqual(restored.serialize(), saved);
  assert.deepEqual(calls, []);
  signal(restored, 'relic:recovered', { itemId: 'cartographer-fragment', instanceId: 'fragment-1' });
  assert.equal(restored.getQuests()[1].objectives[0].count, 1);
  saved.quests[1].seen['map-fragments'].push('foreign-mutation');
  assert.equal(restored.getQuests()[1].objectives[0].count, 1);
});

test('corrupt, oversized, foreign-seed and out-of-order saves fail transactionally', () => {
  const system = createQuestSystem({ seed: 'a' });
  finishBell(system); accept(system);
  const valid = system.serialize();
  const mutate = fn => { const changed = structuredClone(valid); fn(changed); return changed; };
  const bad = [null, {}, [], mutate(s => s.seed = 'b'), mutate(s => s.version = 99),
    mutate(s => s.quests[0].id = 'unknown'), mutate(s => s.quests[1].seen['map-fragments'] = ['x', 'x']),
    mutate(s => s.quests[1].seen['map-fragments'] = ['a', 'b', 'c', 'd']),
    mutate(s => s.quests[1].seen['map-fragments'] = ['x'.repeat(129)]),
    mutate(s => s.quests[1].completed = true), mutate(s => s.quests[2].accepted = true),
    mutate(s => s.quests[2].rewardDelivered = true), mutate(s => s.quests[0].seen['find-bell'] = []),
    mutate(s => s.quests[1].seen.extra = []), mutate(s => s.quests.pop()),
  ];
  for (const saved of bad) {
    assert.equal(system.restore(saved).ok, false);
    assert.deepEqual(system.serialize(), valid);
  }
});

test('reward outbox survives failures and reload; retries carry a stable delivery id', () => {
  let attempts = 0;
  const attempted = [];
  const system = createQuestSystem({ seed: 'persist', onReward: reward => {
    attempted.push(reward.deliveryId);
    if (++attempts === 1) throw new Error('inventory temporarily unavailable');
  } });
  accept(system); bell(system);
  assert.throws(() => talk(system), /inventory temporarily unavailable/);
  assert.equal(system.getQuests()[0].status, 'completed');
  assert.equal(system.serialize().quests[0].rewardDelivered, false);
  const reload = createQuestSystem({ seed: 'persist', onReward: reward => attempted.push(reward.deliveryId) });
  assert.equal(reload.restore(system.serialize()).ok, true);
  assert.deepEqual(reload.flushRewards(), { delivered: 1, pending: 0 });
  assert.deepEqual(reload.flushRewards(), { delivered: 0, pending: 0 });
  assert.equal(attempted.length, 2);
  assert.equal(attempted[0], attempted[1]);
  assert.equal(talk(reload).questId, 'cartographer-fragments');
});

test('false reward acknowledgement defers, and reentrant flush cannot deliver twice', () => {
  let system, tries = 0;
  system = createQuestSystem({ onReward: () => {
    tries++;
    assert.equal(system.flushRewards().delivered, 0);
    assert.equal(system.restore(system.serialize()).ok, false);
    return tries > 1;
  } });
  finishBell(system);
  assert.equal(system.serialize().quests[0].rewardDelivered, false);
  assert.deepEqual(system.flushRewards(), { delivered: 1, pending: 0 });
  assert.equal(tries, 2);
});

test('outputs are detached and invalid events do not change state or touch engine globals', () => {
  const system = createQuestSystem();
  accept(system);
  const before = system.serialize();
  for (const event of [null, [], {}, { type: 'bell:resonated' }, { type: 'landmark:examined', underwater: true, landmarkId: {} }]) assert.equal(system.onEvent(event).changed, false);
  const returned = system.getQuests();
  returned[0].objectives[0].count = 99;
  returned.push({});
  assert.deepEqual(system.serialize(), before);
  assert.equal(typeof globalThis.window, 'undefined');
  assert.ok(Object.isFrozen(QUESTS[0].objectives));
  assert.throws(() => createQuestSystem({ seed: NaN }), TypeError);
  assert.throws(() => createQuestSystem({ seed: {} }), TypeError);
  assert.throws(() => createQuestSystem({ emit: 5 }), TypeError);
});

test('event callbacks can read but cannot restore or reorder progress/completion reentrantly', () => {
  let system;
  const events = [], rewards = [];
  const fresh = createQuestSystem().serialize();
  system = createQuestSystem({ onReward: reward => rewards.push(reward), emit: event => {
    events.push(event.type);
    assert.equal(system.restore(fresh).ok, false);
    assert.equal(talk(system).kind, 'busy');
    assert.equal(system.onEvent({ type: 'landmark:examined', landmarkId: 'sunken-bell', underwater: true }).changed, false);
    assert.equal(system.flushRewards().delivered, 0);
  } });
  accept(system); bell(system);
  assert.equal(system.getQuests()[0].status, 'ready');
  assert.equal(talk(system).kind, 'rewarded');
  assert.deepEqual(events, ['quest:accepted', 'quest:progress', 'quest:progress', 'quest:ready', 'quest:completed']);
  assert.equal(system.getQuests()[0].status, 'completed');
  assert.equal(rewards.length, 1);
});

test('every accepted string seed has a safe deterministic reward delivery key', () => {
  const ids = [];
  for (const seed of ['\ud800', '\udc00', '🪸', 'a:b', 'a/b']) {
    const rewards = [];
    const system = createQuestSystem({ seed, onReward: reward => rewards.push(reward) });
    assert.equal(finishBell(system).kind, 'rewarded');
    assert.equal(rewards.length, 1);
    const repeated = [];
    finishBell(createQuestSystem({ seed, onReward: reward => repeated.push(reward) }));
    assert.equal(rewards[0].deliveryId, repeated[0].deliveryId);
    ids.push(rewards[0].deliveryId);
  }
  assert.equal(new Set(ids).size, ids.length);
});
