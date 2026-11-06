#!/usr/bin/env bash
# META GAMES guard: принятые оригиналы и файлы направления проекта не меняются.
# Режимы: check (проверка), update (пересчитать суммы — только Claude по слову владельца).
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
P=.github/protected
list() { grep -v '^\s*#' "$P/paths.txt" | sed '/^\s*$/d' | while read -r p; do git ls-files -- "$p"; done | sort -u; }
if [ "${1:-check}" = update ]; then list | xargs -d '\n' sha256sum > "$P/SHA256SUMS"; echo "updated $(wc -l < $P/SHA256SUMS) files"; exit 0; fi
fail=0
# Суммы и список защищённого меняет только Claude (коммит с трейлером Claude-Session:) по слову владельца.
if [ -n "${GUARD_RANGE:-}" ]; then
  for c in $(git rev-list "$GUARD_RANGE" -- .github/protected 2>/dev/null || true); do
    git log -1 --format=%B "$c" | grep -q '^Claude-Session: https://claude.ai/' || { fail=1; echo "::error::Коммит $c изменил .github/protected без подписи Claude — менять защищённое может только Claude по слову владельца"; }
  done
fi
if ! sha256sum --quiet -c "$P/SHA256SUMS"; then fail=1; echo "::error::Изменён или удалён защищённый файл (см. выше). Принятые оригиналы и цель проекта менять нельзя: rules/09-platforma/META_GAMES_PLATFORM.md"; fi
extra=$(comm -13 <(awk '{print $2}' "$P/SHA256SUMS" | sort) <(list) || true)
if [ -n "$extra" ]; then fail=1; echo "::error::В защищённые папки добавлены новые файлы:"; echo "$extra"; fi
while IFS='|' read -r f s; do case "$f" in ''|\#*) continue;; esac
  grep -qF -- "$s" "$f" 2>/dev/null || { fail=1; echo "::error::$f потерял обязательную строку: $s"; }
done < "$P/must-contain.txt"
[ $fail = 0 ] && echo "META GAMES guard: OK ($(wc -l < $P/SHA256SUMS) защищённых файлов)"
exit $fail
