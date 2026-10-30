#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const doc = readFileSync(resolve(root, 'EPOCH_RAIDS.md'), 'utf8');
const source = readFileSync(resolve(root, 'source/ilya-copy.html'), 'utf8').split(/\r?\n/);
const rows = doc.split(/\r?\n/).filter(line => /^\|\s*`[A-Za-z_$][\w$]*`\s*\|\s*\d+\s*\|/.test(line));
let errors = 0;
if (!rows.length) { console.error('ERROR: нет строк таблиц'); process.exit(1); }
for (const row of rows) {
  const match = row.match(/^\|\s*`([A-Za-z_$][\w$]*)`\s*\|\s*(\d+)\s*\|/);
  const [, name, rawLine] = match;
  const number = Number(rawLine);
  const actual = source[number - 1] ?? '';
  const definition = new RegExp('\\b(?:function|const)\\s+' + name + '\\b');
  if (!definition.test(actual)) {
    console.error(`ERROR: ${name}:${number} — объявление не найдено`);
    errors++;
  }
}
console.log(`check-raids-doc.mjs: ${rows.length} строк таблиц, ${errors} ошибок`);
if (errors) process.exitCode = 1;
