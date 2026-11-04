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
