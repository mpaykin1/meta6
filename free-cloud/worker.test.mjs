import test from 'node:test';
import assert from 'node:assert/strict';
import worker from './worker.js';

const env = { ALLOWED_ORIGIN: 'https://mpaykin1.github.io' };
const call = (path, init = {}) => worker.fetch(new Request('https://worker.example' + path, init), env);

test('health is available with restricted origin', async () => {
  const res = await call('/health');
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), env.ALLOWED_ORIGIN);
  assert.equal((await res.json()).ok, true);
});

test('invalid JSON is rejected', async () => {
  const res = await call('/event', {method:'POST', body:'{'});
  assert.equal(res.status, 400);
});

test('unsupported event is rejected', async () => {
  const res = await call('/event', {method:'POST', body:JSON.stringify({kind:'admin_override'})});
  assert.equal(res.status, 400);
});

test('accepted events are explicitly NOT persisted', async () => {
  const res = await call('/event', {method:'POST', body:JSON.stringify({kind:'world_visit'})});
  assert.equal(res.status, 200);
  assert.equal((await res.json()).persisted, false);
});

test('unknown route returns 404', async () => {
  assert.equal((await call('/missing')).status, 404);
});
