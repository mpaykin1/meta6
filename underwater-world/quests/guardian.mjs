import { GUARDIAN } from './catalog.mjs';

export function guardianDialogue(kind, quest = null, extra = {}) {
  const lines = {
    offer: quest?.offer,
    accepted: 'Я буду ждать здесь. Возвращайся с открытиями, когда будешь готов.',
    declined: 'Не спеши. Глубина умеет ждать.',
    progress: quest?.progress,
    rewarded: quest?.ending,
    farewell: 'Ты вернул городу голос, пути, свет, жизнь и время. Теперь исследуй его свободно.',
    unavailable: 'Мой голос слышен только под водой.',
    stale: 'Наш разговор изменился. Давай начнём его снова.',
    busy: 'Дай мне закончить эту мысль, и мы продолжим.',
  };
  return {
    npcId: GUARDIAN.id, name: GUARDIAN.name, kind,
    questId: quest?.id ?? null, title: quest?.title ?? null,
    text: lines[kind] ?? '',
    choices: kind === 'offer' ? [
      { id: 'accept', label: 'Я помогу', questId: quest.id },
      { id: 'decline', label: 'Позже', questId: quest.id },
    ] : [],
    ...extra,
  };
}
