import test from 'node:test';
import assert from 'node:assert/strict';
import { createQuestSystem, GUARDIAN } from './index.mjs';

test('empty array slots cannot become found quest objects or poison a later JSON save', () => {
  const system = createQuestSystem({ seed: 'save-boundary' });
  system.interact(GUARDIAN.id, { underwater: true, choice: 'accept', questId: 'lost-bell-voice' });
  const before = system.serialize();
  const malformed = structuredClone(before);
  malformed.quests[0].seen['find-bell'] = new Array(1);
  malformed.quests[0].seen['hear-bell'] = new Array(1);

  assert.equal(system.restore(malformed).ok, false, 'every counted object must have an actual stable ID');
  assert.deepEqual(system.serialize(), before, 'invalid input must not partially mark a quest ready');
  assert.equal(system.getQuests()[0].status, 'active');
  const reloaded = createQuestSystem({ seed: 'save-boundary' });
  assert.deepEqual(reloaded.restore(JSON.parse(JSON.stringify(system.serialize()))), { ok: true });
  assert.deepEqual(reloaded.serialize(), before);
});
