import test from 'node:test';
import assert from 'node:assert/strict';
import { createCreatureSystem } from './index.mjs';

const falsyExceptions = [undefined, null, false, 0, ''];

function assertThrownValue(work, expected) {
  let caught = false;
  try { work(); } catch (value) {
    caught = true;
    assert.strictEqual(value, expected, 'propagate the original thrown value');
  }
  assert.equal(caught, true, 'JavaScript permits throwing values other than Error objects');
}

test('any thrown terrain value cancels a staged frame and all of its events', () => {
  for (const exception of falsyExceptions) {
    const events = [];
    const system = createCreatureSystem({ seed: 'frame-boundary', emit: event => events.push(event) });
    const player = system.spawnForChunk(0, 0, 'deep')[0].position;
    const before = system.serialize();
    events.length = 0;
    let samples = 0;
    assertThrownValue(() => system.update(0.1, {
      player, underwater: true,
      seabedHeight: () => { if (++samples === 2) throw exception; return -100; },
    }), exception);
    assert.deepEqual(system.serialize(), before);
    assert.deepEqual(events, [], 'no discoveries, state changes, or attacks from a cancelled frame');
    assert.ok(system.update(0.1, { player, underwater: true, seabedHeight: () => -100 }).length > 0,
      'the mutation guard is released after failure');
  }
});

test('observer failures propagate the first thrown value after every queued event is offered', () => {
  for (const exception of falsyExceptions) {
    const events = [];
    let failing = true;
    const system = createCreatureSystem({ seed: 'observer-boundary', emit: event => {
      events.push(event);
      if (failing) {
        if (events.length === 1) throw exception;
        throw new Error('later observer failure');
      }
    } });
    assertThrownValue(() => system.spawnForChunk(0, 0, 'reef'), exception);
    assert.equal(events.length, system.getEntities().length, 'all spawn callbacks are offered after state commits');
    assert.ok(events.length >= 3);
    failing = false;
    assert.equal(system.unloadChunk(0, 0), true);
    assert.deepEqual(system.getEntities(), []);
  }
});

test('observation history cannot retain a missing ID that becomes null in JSON', () => {
  const system = createCreatureSystem({ seed: 'observation-boundary' });
  system.spawnForChunk(0, 0, 'reef');
  const before = system.serialize();
  const malformed = structuredClone(before);
  malformed.observed = new Array(1);
  assert.throws(() => system.restore(malformed), TypeError);
  assert.deepEqual(system.serialize(), before);
  const reloaded = createCreatureSystem({ seed: 'observation-boundary' });
  reloaded.restore(JSON.parse(JSON.stringify(system.serialize())));
  assert.deepEqual(reloaded.serialize(), before);
});
