const freeze = value => {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
};

export const GUARDIAN = freeze({
  id: 'guardian-of-depths',
  name: 'Хранитель Глубин',
  // The integrator supplies the ghost's original-game visual, not a guessed pack asset.
  assetId: null,
});

// Semantic signals are sent only after the main engine validates a real interaction.
// Asset hints refer to PR #521; null means a new prop/puzzle is owned by the integrator.
export const QUESTS = freeze([
  {
    id: 'lost-bell-voice', title: 'Утраченный голос колокола', requires: [],
    offer: 'В затонувшей башне молчит колокол. Найди его и помоги морю вспомнить его голос. Не оружием — прислушайся к нему.',
    progress: 'Сначала осмотри колокол в башне, затем разбуди его голос и вернись ко мне.',
    ending: 'Я слышу его. Теперь этот звон соединяет берег и глубину.',
    reward: { id: 'bell-memory', kind: 'knowledge', title: 'Память колокола' },
    objectives: [
      { id: 'find-bell', label: 'Осмотреть затонувший колокол', type: 'landmark:examined', field: 'landmarkId', equals: 'sunken-bell', count: 1, assetId: 'cathedral_bell' },
      { id: 'hear-bell', label: 'Вернуть колоколу голос', type: 'bell:resonated', field: 'bellId', equals: 'sunken-bell', count: 1, after: ['find-bell'], assetId: 'cathedral_bell' },
    ],
  },
  {
    id: 'cartographer-fragments', title: 'Фрагменты картографа', requires: ['lost-bell-voice'],
    offer: 'Картограф оставил три фрагмента карты среди руин. Найди разные фрагменты: так мы восстановим путь, а не соберём три копии одной страницы.',
    progress: 'Ищи три разных фрагмента карты в подводных руинах.',
    ending: 'Линии снова сходятся. На карте осталось место и для твоих открытий.',
    reward: { id: 'cartographer-memory', kind: 'knowledge', title: 'Память картографа' },
    objectives: [
      { id: 'map-fragments', label: 'Найти разные фрагменты карты', type: 'relic:recovered', field: 'instanceId', match: { itemId: 'cartographer-fragment' }, count: 3, assetId: null },
    ],
  },
  {
    id: 'lighthouse-beacons', title: 'Огни глубинных маяков', requires: ['cartographer-fragments'],
    offer: 'Зажги три разных подводных маяка. Их свет поможет путникам, а старому маяку на острове оставь его собственную историю.',
    progress: 'Нужны огни трёх разных подводных маяков.',
    ending: 'Огни видят друг друга. Теперь в этом городе труднее потеряться.',
    reward: { id: 'beacon-memory', kind: 'knowledge', title: 'Память маяков' },
    objectives: [
      { id: 'beacons', label: 'Зажечь разные подводные маяки', type: 'beacon:lit', field: 'beaconId', count: 3, assetId: 'street_lamp' },
    ],
  },
  {
    id: 'coral-restoration', title: 'Возвращение кораллов', requires: ['lighthouse-beacons'],
    offer: 'Город станет живым, когда вернутся кораллы. Восстанови три разные колонии и не тревожь их обитателей.',
    progress: 'Восстанови три разные колонии кораллов. Обитателей убивать не нужно.',
    ending: 'Здесь снова есть укрытие для маленьких рыб. Спасибо за терпение.',
    reward: { id: 'coral-memory', kind: 'knowledge', title: 'Память рифа' },
    objectives: [
      { id: 'corals', label: 'Восстановить разные колонии', type: 'coral:restored', field: 'colonyId', count: 3, assetId: null },
    ],
  },
  {
    id: 'ship-trail', title: 'След кораблей', requires: ['coral-restoration'],
    offer: 'Три разных остова хранят след старого морского пути. Осмотри их: мне нужны свидетельства путешествий, а не добыча из сундуков.',
    progress: 'Обследуй три разных затонувших судна.',
    ending: 'Теперь мы знаем, куда они шли. Их путь больше не потерян.',
    reward: { id: 'ship-memory', kind: 'knowledge', title: 'Память морского пути' },
    objectives: [
      { id: 'wrecks', label: 'Обследовать разные затонувшие суда', type: 'wreck:surveyed', field: 'wreckId', count: 3, assetId: 'galleon' },
    ],
  },
  {
    id: 'stopped-clock', title: 'Остановившиеся часы', requires: ['ship-trail'],
    offer: 'В сердце города остановились часы. Найди их, изучи механизм и запусти снова. Город должен продолжить свою историю.',
    progress: 'Сначала осмотри часы, затем запусти их механизм.',
    ending: 'Слышишь? Время идёт. Глубина помнит прошлое, но больше не держит его в плену.',
    reward: { id: 'clock-memory', kind: 'knowledge', title: 'Память времени' },
    objectives: [
      { id: 'find-clock', label: 'Осмотреть остановившиеся часы', type: 'landmark:examined', field: 'landmarkId', equals: 'stopped-clock', count: 1, assetId: null },
      { id: 'restart-clock', label: 'Запустить часы', type: 'clock:restarted', field: 'clockId', equals: 'stopped-clock', count: 1, after: ['find-clock'], assetId: null },
    ],
  },
]);
