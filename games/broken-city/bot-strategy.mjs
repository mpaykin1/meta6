// Broken City: real keyboard/touch play only. No page access and no game-state writes.
export async function start(ctx) {
  await ctx.wait(2400);
  if (!ctx.state().started) {
    await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2);
    await ctx.wait(2400);
  }
  // The first visit starts automatically; later visits use the central Play icon.
}

export async function playLevel(ctx, level) {
  let action = 0, lastZ = Infinity, stalled = 0;
  while (true) {
    const s = ctx.state();
    if (s.levelDone || s.gameDone || s.level !== level) return;
    if (!s.started) { await ctx.wait(350); continue; }
    if (!s.alive) {
      // Retry icon in the existing defeat card (equivalent to a player's touch).
      await ctx.tap(ctx.viewport.width / 2, ctx.viewport.height / 2 + 74);
      await ctx.wait(1800);
      continue;
    }
    const d = s.goal ? Math.hypot(s.goal.x - s.hero.x, s.goal.y - s.hero.y) : Infinity;
    if (s.goal) await ctx.walkToGoal(level === 0 || level === 1 ? 750 : 500);
    else await ctx.joystick(0, -1, 650);
    const n = ctx.state();
    if (Math.abs(n.hero.y - lastZ) < 0.1) stalled++;
    else stalled = 0;
    lastZ = n.hero.y;
    // Existing context-sensitive button: jump / stomp / deploy a bridge.
    // Trigger when encountering an obstacle or periodically in combat levels.
    if (stalled >= 2 || (++action % (level === 2 || level === 6 ? 3 : 6)) === 0) {
      await ctx.jump();
      if (level === 1 || level === 5) {
        if (ctx.mobile) await ctx.tap(ctx.viewport.width * 0.61, ctx.viewport.height * 0.91);
        else await ctx.key('KeyE', 100);
      }
      stalled = 0;
    }
    // Falling bridges may require a second action after approaching the gap.
    if ((level === 2 || level === 6) && d < 8) await ctx.jump();
  }
}
