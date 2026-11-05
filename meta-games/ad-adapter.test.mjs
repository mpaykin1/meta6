import test from 'node:test';
import assert from 'node:assert/strict';
import { createAdBridge } from './ad-adapter.mjs';

test('no consent, no SDK calls or advertising events', async () => {
  let called = 0;
  const ads = createAdBridge();
  ads.registerProvider('provider_a', { formats: ['interstitial'],
    show: async () => { called++; return { displayed: true }; } });
  assert.equal((await ads.show('result')).status, 'consent_required');
  assert.equal(called, 0);
  assert.equal(ads.statistics().counters.length, 0);
  ads.setConsent('denied');
  assert.equal((await ads.show('result')).status, 'consent_required');
  assert.equal(called, 0);
});
test('actual confirmed impressions and rewarded completions only', async () => {
  const ads = createAdBridge();
  ads.registerProvider('reward_a', { formats: ['rewarded'],
    show: async () => ({ displayed: true, completed: false }) });
  ads.setConsent('granted');
  const result = await ads.show('reward');
  assert.equal(result.status, 'displayed');
  assert.equal(result.rewarded, false);
  assert.deepEqual(ads.statistics().counters[0],
    { provider: 'reward_a', slot: 'reward', requests: 1, impressions: 1, completions: 0, errors: 0 });
});
test('provider SDK failures fall back without breaking game', async () => {
  const ads = createAdBridge({ cooldownMs: 0 });
  ads.registerProvider('broken_sdk', { formats: ['interstitial'],
    show: async () => { throw new Error('SDK unavailable'); } });
  ads.registerProvider('backup', { formats: ['interstitial'],
    show: async ({ slot }) => ({ displayed: slot === 'pause' }) });
  ads.setConsent('granted');
  const result = await ads.show('pause');
  assert.equal(result.provider, 'backup');
  assert.equal(ads.statistics().counters.find(x => x.provider === 'broken_sdk').errors, 1);
});
test('cooldowns, revocation and duplicate providers work', async () => {
  let time = 100000;
  const ads = createAdBridge({ now: () => time, cooldownMs: 40000 });
  ads.registerProvider('provider_a', { formats: ['interstitial'],
    show: async () => ({ displayed: true }) });
  assert.throws(() => ads.registerProvider('provider_a', { formats: ['interstitial'],
    show: async () => ({ displayed: true }) }), /already/);
  ads.setConsent('granted');
  assert.equal((await ads.show('result')).status, 'displayed');
  assert.equal((await ads.show('result')).status, 'frequency_capped');
  time += 40000;
  assert.equal((await ads.show('result')).status, 'displayed');
  ads.setConsent('denied');
  assert.equal(ads.statistics().counters.length, 0);
});
test('rewarded intent is distinct from interstitial, input errors are contained', async () => {
  const ads = createAdBridge();
  ads.setConsent('granted');
  assert.equal((await ads.show('reward')).status, 'unavailable');
  await assert.rejects(() => ads.show('popup'), /Unknown ad slot/);
});

test('revocation during an SDK request prevents late reward and statistics', async () => {
  let complete;
  const ads = createAdBridge();
  ads.registerProvider('reward_a', { formats: ['rewarded'],
    show: () => new Promise(resolve => { complete = resolve; }) });
  ads.setConsent('granted');
  const pending = ads.show('reward');
  ads.setConsent('denied');
  complete({ displayed: true, completed: true });
  assert.deepEqual(await pending, { status: 'consent_required', rewarded: false });
  assert.deepEqual(ads.statistics().counters, []);
});

test('revoked SDK rejection or unavailable result never starts a backup SDK', async () => {
  for (const fail of [false, true]) {
    let complete, reject, backupCalls = 0;
    const ads = createAdBridge();
    ads.registerProvider('first_sdk', { formats: ['interstitial'],
      show: () => new Promise((resolve, decline) => { complete = resolve; reject = decline; }) });
    ads.registerProvider('backup_sdk', { formats: ['interstitial'],
      show: async () => { backupCalls++; return { displayed: true }; } });
    ads.setConsent('granted');
    const pending = ads.show('pause');
    ads.setConsent('denied');
    if (fail) reject(new Error('late SDK failure')); else complete({ displayed: false });
    assert.equal((await pending).status, 'consent_required');
    assert.equal(backupCalls, 0);
    assert.deepEqual(ads.statistics().counters, []);
  }
});

test('revocation settles a hanging SDK wait and releases the bridge for a new consent session', async () => {
  let complete, calls = 0, settled = false;
  const ads = createAdBridge({ cooldownMs: 0 });
  ads.registerProvider('reward_a', { formats: ['rewarded'], show: () => {
    calls++;
    return calls === 1 ? new Promise(resolve => { complete = resolve; }) :
      Promise.resolve({ displayed: true, completed: true });
  } });
  ads.setConsent('granted');
  const pending = ads.show('reward');
  pending.then(() => { settled = true; });
  ads.setConsent('denied');
  ads.setConsent('granted');
  await new Promise(resolve => setImmediate(resolve));
  try {
    assert.equal(settled, true, 'withdrawal must not wait indefinitely for the provider');
    assert.deepEqual(await pending, { status: 'consent_required', rewarded: false });
    assert.equal((await ads.show('reward')).rewarded, true);
  } finally {
    complete({ displayed: true, completed: true });
    await pending;
  }
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(ads.statistics().counters, [
    { provider: 'reward_a', slot: 'reward', requests: 1, impressions: 1, completions: 1, errors: 0 }
  ]);
});

