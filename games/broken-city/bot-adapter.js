// META BOT v1 — read-only view of Broken City's existing window.__G state.
// No movement, collision changes, level skips, or game state mutations.
(() => {
  'use strict';
  const num = v => Number.isFinite(v) ? Math.round(v * 1000) / 1000 : 0;
  const xyz = p => p && p.position ? p.position : p;
  const point = p => p ? [num(xyz(p).x), num(xyz(p).y), num(xyz(p).z)] : null;
  const snapshot = () => {
    const b = window.__G;
    if (!b || !b.G || !b.heroState) return null;
    const g = b.G, pos = b.heroState.pos, c = g.cfg;
    const pieces = b.BOT && b.BOT.get ? b.BOT.get() : {};
    // Hash only actual geometry and game layout state; no timestamps/random fake hashes.
    const geom = {};
    for (const k of ['bridges', 'barriers', 'paths', 'cracks', 'stations', 'ruins', 'falls', 'comboChunks', 'tHouses', 'truins']) {
      const list = pieces[k];
      if (!Array.isArray(list)) continue;
      geom[k] = list.filter(x => x && (x.on !== false)).map(x => ({
        p: point(x.m || x),
        x: num(x.x), z: num(x.z), gz: num(x.userData && x.userData.gz),
        route: x.route && x.route.map(n => n.slice(0, 2).map(num)),
        kind: x.k || x.kind || '',
      }));
    }
    const shades = Array.isArray(pieces.shades) ? pieces.shades.filter(x => x.visible && !x.userData.copy) : [];
    const toys = Array.isArray(pieces.toyPool) ? pieces.toyPool.filter(x => x.userData.on) : [];
    const inGame = !!c && ['trans', 'play', 'defeat', 'ending', 'endwait'].includes(g.state);
    const finished = g.state === 'ending' || g.state === 'endwait';
    const changing = g.state === 'trans' && Number.isInteger(g.next) && g.next > g.li;
    const controlCount = ['bJump', 'bStomp', 'bBridge'].filter(id => {
      const e = document.getElementById(id);
      return !!e && !e.classList.contains('hidden');
    }).length;
    const menu = document.getElementById('menu');
    return {
      started: inGame,
      level: Math.max(0, Number.isInteger(g.li) ? g.li : 0),
      levelDone: finished || changing,
      gameDone: finished && !!(c && c.final),
      alive: g.state !== 'defeat',
      hero: { x: num(pos.x), y: num(pos.z) },
      goal: c ? { x: 0, y: num(c.goal + 5) } : null,
      enemies: shades.length + toys.length,
      weapons: Math.max(1, controlCount),
      layoutHash: JSON.stringify({ level: g.li, mode: c && c.mode, plannedObstacleZ: num(g.nextBarrier), geometry: geom }),
      menuOpen: !!menu && !menu.classList.contains('hidden')
    };
  };
  const bot = Object.freeze({
    version: 1,
    info() { return { name: 'Broken City', levels: 9 }; },
    state() {
      return snapshot() || {
        started: false, level: 0, levelDone: false, gameDone: false, alive: true,
        hero: { x: 0, y: 0 }, goal: null, enemies: 0, weapons: 0,
        layoutHash: '', menuOpen: false
      };
    }
  });
  // Module scripts execute asynchronously; register only when the engine publishes __G.
  const install = () => {
    if (!window.__G || window.__META_BOT__) return false;
    Object.defineProperty(window, '__META_BOT__', {
      value: bot, writable: false, configurable: false, enumerable: false
    });
    return true;
  };
  if (!install()) {
    let n = 0;
    const id = setInterval(() => { if (install() || ++n >= 600) clearInterval(id); }, 50);
  }
})();
