// Asset ids are the names in World_server PR #521, not renderer file paths.
const definitions = [
  ['glow_fish_teal', 'Бирюзовая светорыба', ['reef', 'ruins', 'open'], 1.7, 0, 2, 24],
  ['glow_fish_violet', 'Фиолетовая светорыба', ['deep', 'ruins'], 1.5, 0, 12, 60],
  ['glow_fish_amber', 'Янтарная светорыба', ['reef', 'open'], 1.6, 0, 3, 30],
  ['glow_fish_emerald', 'Изумрудная светорыба', ['reef', 'ruins'], 1.5, 0, 3, 32],
  ['lantern_fish', 'Рыба-фонарик', ['deep', 'ruins', 'open'], 1.2, 0, 10, 65],
  ['angler', 'Удильщик', ['deep', 'ruins'], 0.9, 0.12, 18, 80],
  ['eel', 'Глубинный угорь', ['reef', 'ruins', 'deep'], 2.0, 0.18, 5, 50],
  ['jellyfish_violet', 'Фиолетовая медуза', ['deep', 'open'], 0.35, 0, 4, 45],
  ['jellyfish_teal', 'Бирюзовая медуза', ['reef', 'open'], 0.35, 0, 2, 25],
  ['manta', 'Скат манта', ['open', 'deep'], 2.2, 0, 5, 45],
  ['seahorse', 'Морской конёк', ['reef', 'ruins'], 0.45, 0, 2, 18],
  ['nautilus', 'Наутилус', ['deep', 'ruins'], 0.55, 0, 12, 65],
  ['hermit_crab', 'Краб-отшельник', ['reef', 'ruins'], 0.4, 0.04, 2, 18],
  ['siphonophore', 'Сифонофора', ['deep', 'open'], 0.25, 0, 15, 75],
];

export const CREATURE_CATALOG = Object.freeze(Object.fromEntries(definitions.map(
  ([id, name, biomes, speed, defensiveChance, minDepth, maxDepth]) => [id, Object.freeze({
    id, assetId: id, name, biomes: Object.freeze(biomes), speed, defensiveChance,
    minDepth, maxDepth,
  })],
)));

export const CREATURE_BIOMES = Object.freeze(['reef', 'ruins', 'deep', 'open']);
