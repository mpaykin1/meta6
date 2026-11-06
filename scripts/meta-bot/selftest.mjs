// Каркас Claude. Самопроверка ядра бота: хорошая мини-игра проходит, плохие ловятся.
// Если этот тест красный — сломано ядро (или его ослабили). Запуск: node scripts/meta-bot/selftest.mjs
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './server.mjs';
import { checkGame } from './core.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)); const repoRoot = path.resolve(here, '../..');
const gameDir = path.join(here, 'fixture');
const srv = await serve(repoRoot);
const cases = [
  { q: '', expect: true, name: 'хорошая игра проходится' },
  { q: '?rot=1', expect: true, name: 'повёрнутая камера: калибровка ходьбы проходит' },
  { q: '?form=data', expect: true, name: 'ручка-данные (форма ChatGPT) поддерживается' },
  { q: '?bad=text', expect: /ЧИСТЫЙ ЭКРАН/, name: 'текст на экране пойман' },
  { q: '?bad=stuck', expect: /застрял/, name: 'застревание поймано' },
  { q: '?bad=repeat', expect: /БЕЗ ПОВТОРОВ/, name: 'повтор раскладки пойман' },
  { q: '?bad=cheat', expect: /запрещённые ключи/, name: 'чит в ручке пойман' }
];
let ok = true;
for (const c of cases) {
  const r = await checkGame({ gameDir, repoRoot, baseUrl: srv.url, query: c.q });
  const errs = r.runs.flatMap(x => x.errors).join(' | ');
  const pass = c.expect === true ? r.ok : (!r.ok && c.expect.test(errs));
  console.log(`${pass ? '✅' : '❌'} ${c.name}${pass ? '' : ' → ' + (errs || 'ошибок нет')}`);
  ok = ok && pass;
}
srv.close();
process.exit(ok ? 0 : 1);
