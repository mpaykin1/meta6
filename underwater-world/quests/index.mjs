import { GUARDIAN, QUESTS } from './catalog.mjs';
import { guardianDialogue } from './guardian.mjs';

export { GUARDIAN, QUESTS } from './catalog.mjs';
const SCHEMA = 'twilight-underwater-quests';
const copy = value => JSON.parse(JSON.stringify(value));
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const validId = value => typeof value === 'string' && value.length > 0 && value.length <= 128;

export function createQuestSystem({ seed = 0, emit = () => {}, onReward = null } = {}) {
  if (!((typeof seed === 'string' && validId(seed)) || (typeof seed === 'number' && Number.isSafeInteger(seed)))) throw new TypeError('seed must be a short string or safe integer');
  if (typeof emit !== 'function' || (onReward !== null && typeof onReward !== 'function')) throw new TypeError('callbacks must be functions');
  const worldSeed = String(seed);
  const fresh = () => QUESTS.map(quest => ({
    id: quest.id, accepted: false, completed: false, rewardDelivered: false,
    seen: Object.fromEntries(quest.objectives.map(goal => [goal.id, []])),
  }));
  let states = fresh();
  let delivering = false;
  let notifying = false;
  const notify = event => {
    notifying = true;
    try { emit(event); } finally { notifying = false; }
  };
  const stateOf = id => states[QUESTS.findIndex(quest => quest.id === id)];
  const full = (quest, state) => quest.objectives.every(goal => state.seen[goal.id].length === goal.count);
  const unlocked = quest => quest.requires.every(id => stateOf(id).completed);
  const status = (quest, state) => state.completed ? 'completed' : state.accepted ? (full(quest, state) ? 'ready' : 'active') : unlocked(quest) ? 'available' : 'locked';
  const view = (quest, state) => ({
    id: quest.id, title: quest.title, status: status(quest, state),
    objectives: quest.objectives.map(goal => ({ id: goal.id, label: goal.label, count: state.seen[goal.id].length, target: goal.count })),
  });
  const rewardFor = quest => ({ ...quest.reward, questId: quest.id, deliveryId: `${SCHEMA}:${encodeURIComponent(JSON.stringify(worldSeed))}:${quest.id}` });

  // State is committed before callbacks. Retry pending rewards using the SAME id.
  // External inventory writes must atomically deduplicate deliveryId across crashes.
  function flushRewards() {
    if (delivering || notifying || !onReward) return { delivered: 0, pending: states.filter(s => s.completed && !s.rewardDelivered).length };
    delivering = true;
    let delivered = 0;
    try {
      for (let i = 0; i < QUESTS.length; i++) {
        if (states[i].completed && !states[i].rewardDelivered) {
          const result = onReward(copy(rewardFor(QUESTS[i])));
          if (result && typeof result.then === 'function') throw new TypeError('onReward must be synchronous');
          if (result === false) continue;
          states[i].rewardDelivered = true;
          delivered++;
        }
      }
    } finally { delivering = false; }
    return { delivered, pending: states.filter(s => s.completed && !s.rewardDelivered).length };
  }

  function interact(npcId, worldState = {}) {
    if (npcId !== GUARDIAN.id) return null;
    if (notifying || delivering) return guardianDialogue('busy');
    if (!record(worldState) || worldState.underwater !== true) return guardianDialogue('unavailable');
    const index = QUESTS.findIndex((quest, i) => !states[i].completed && (states[i].accepted || unlocked(quest)));
    if (index < 0) return guardianDialogue('farewell');
    const quest = QUESTS[index], state = states[index];
    if (worldState.questId !== undefined && worldState.questId !== quest.id) return guardianDialogue('stale');
    if (!state.accepted) {
      if (worldState.choice === 'decline') return guardianDialogue('declined', quest);
      if (worldState.choice !== 'accept') return guardianDialogue('offer', quest, { progress: view(quest, state) });
      state.accepted = true;
      notify({ type: 'quest:accepted', questId: quest.id });
      return guardianDialogue('accepted', quest, { progress: view(quest, state) });
    }
    if (!full(quest, state)) return guardianDialogue('progress', quest, { progress: view(quest, state) });
    state.completed = true;
    // Failure in a callback cannot pay this quest a second time on interaction.
    notify({ type: 'quest:completed', questId: quest.id, reward: copy(rewardFor(quest)) });
    flushRewards();
    return guardianDialogue('rewarded', quest, { reward: copy(rewardFor(quest)), progress: view(quest, state) });
  }

  function onEvent(event) {
    if (notifying || delivering) return { changed: false, reason: 'callback-in-progress' };
    if (!record(event) || !validId(event.type) || event.underwater !== true) return { changed: false };
    const notifications = [];
    for (let i = 0; i < QUESTS.length; i++) {
      const quest = QUESTS[i], state = states[i];
      if (!state.accepted || state.completed) continue;
      for (const goal of quest.objectives) {
        const seen = state.seen[goal.id];
        if (event.type !== goal.type || seen.length >= goal.count) continue;
        if (goal.after?.some(id => state.seen[id].length < quest.objectives.find(o => o.id === id).count)) continue;
        const key = event[goal.field];
        if (!validId(key) || (goal.equals !== undefined && key !== goal.equals)) continue;
        if (goal.match && Object.entries(goal.match).some(([field, value]) => event[field] !== value)) continue;
        if (seen.includes(key)) continue;
        seen.push(key);
        notifications.push({ type: 'quest:progress', questId: quest.id, objectiveId: goal.id, count: seen.length, target: goal.count });
        if (full(quest, state)) notifications.push({ type: 'quest:ready', questId: quest.id });
      }
    }
    notifications.forEach(notify);
    return { changed: notifications.length > 0 };
  }

  function serialize() { return { schema: SCHEMA, version: 1, seed: worldSeed, quests: copy(states) }; }

  function restore(saved) {
    // Transactional validation: never partially replace progress, emit or reward.
    if (delivering || notifying) return { ok: false, reason: 'callback-in-progress' };
    if (!record(saved) || saved.schema !== SCHEMA || saved.version !== 1 || saved.seed !== worldSeed || !Array.isArray(saved.quests) || saved.quests.length !== QUESTS.length) return { ok: false, reason: 'invalid-schema-or-seed' };
    const restored = [];
    for (let i = 0; i < QUESTS.length; i++) {
      const quest = QUESTS[i], state = saved.quests[i];
      if (!record(state) || state.id !== quest.id || !['accepted', 'completed', 'rewardDelivered'].every(key => typeof state[key] === 'boolean') || !record(state.seen) || Object.keys(state.seen).length !== quest.objectives.length) return { ok: false, reason: 'invalid-quest-state' };
      const seen = {};
      for (const goal of quest.objectives) {
        const ids = state.seen[goal.id];
        if (!Array.isArray(ids) || ids.length > goal.count || Array.from(ids).some(id => !validId(id) || (goal.equals !== undefined && id !== goal.equals)) || new Set(ids).size !== ids.length) return { ok: false, reason: 'invalid-objective-progress' };
        seen[goal.id] = [...ids];
      }
      const candidate = { id: quest.id, accepted: state.accepted, completed: state.completed, rewardDelivered: state.rewardDelivered, seen };
      if ((!candidate.accepted && Object.values(seen).some(ids => ids.length)) || (candidate.completed && (!candidate.accepted || !full(quest, candidate))) || (candidate.rewardDelivered && !candidate.completed)) return { ok: false, reason: 'inconsistent-quest-state' };
      if (candidate.accepted && quest.requires.some(id => !restored.find(s => s.id === id)?.completed)) return { ok: false, reason: 'missing-prerequisite' };
      if (quest.objectives.some(goal => seen[goal.id].length && goal.after?.some(id => seen[id].length !== quest.objectives.find(o => o.id === id).count))) return { ok: false, reason: 'missing-objective-prerequisite' };
      restored.push(candidate);
    }
    states = restored;
    return { ok: true };
  }

  return Object.freeze({ interact, onEvent, serialize, restore, flushRewards,
    getAvailableQuests: () => QUESTS.map((q, i) => view(q, states[i])).filter(q => ['available', 'active', 'ready'].includes(q.status)),
    getQuests: () => QUESTS.map((q, i) => view(q, states[i])),
  });
}
