import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.TEST_BASE || 'http://127.0.0.1:8765/underwater-sumerek/';
const out = new URL('../evidence/fish-tail/', import.meta.url);
await mkdir(out, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (error) => consoleErrors.push(error.stack || error.message));

try {
  await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction(() => window.__isle?.registry, null, { timeout: 60_000 });
  await page.evaluate(() => {
    window.__isle.rebuild(424242, 'sunken');
    window.__isle.setTod(0.75);
    window.__isle.startGame();
  });
  await page.waitForFunction(() => {
    const state = window.__isle?.uw;
    return state?.UW && state.city[2] === 5 && state.city[3] > 0;
  }, null, { timeout: 60_000 });
  await page.waitForTimeout(3_000);

  const state = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      registry: window.__isle.registry(),
      uw: window.__isle.uw,
      gameState: window.__isle.G.state,
      biome: window.__isle.G.biome,
      seed: window.__isle.G.seed,
      tod: window.__isle.G.tod,
      canvas: [canvas.width, canvas.height],
      scroll: [scrollX, scrollY],
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
    };
  });
  const before = await page.screenshot({ path: new URL('frame-a.png', out).pathname });
  await page.waitForTimeout(500);
  const after = await page.screenshot({ path: new URL('frame-b.png', out).pathname });
  const timing = await page.evaluate(() => new Promise((resolve) => {
    const frames = [];
    const tick = (time) => {
      frames.push(time);
      if (frames.length < 181) requestAnimationFrame(tick);
      else {
        const dt = frames.slice(1).map((value, index) => value - frames[index]);
        const sorted = [...dt].sort((a, b) => a - b);
        resolve({
          frames: dt.length,
          averageFps: 1000 / (dt.reduce((sum, value) => sum + value, 0) / dt.length),
          p95FrameMs: sorted[Math.ceil(sorted.length * 0.95) - 1],
        });
      }
    };
    requestAnimationFrame(tick);
  }));
  const sha = (buffer) => createHash('sha256').update(buffer).digest('hex');
  const evidence = {
    ...state,
    timing,
    screenshots: {
      a: { bytes: before.length, sha256: sha(before) },
      b: { bytes: after.length, sha256: sha(after) },
      changed: !before.equals(after),
    },
    consoleErrors,
  };
  await writeFile(new URL('evidence.json', out), JSON.stringify(evidence, null, 2) + '\n');

  if (state.gameState !== 'play' || state.biome !== 'sunken' || state.seed !== 424242) throw new Error(`bad live state: ${JSON.stringify(state)}`);
  if (state.registry.errors.length) throw new Error(`registry errors: ${JSON.stringify(state.registry.errors)}`);
  if (state.uw.uwFail || state.uw.city[2] !== 5 || state.uw.city[3] <= 0) throw new Error(`underwater scene incomplete: ${JSON.stringify(state.uw)}`);
  if (state.canvas[0] !== 1280 || state.canvas[1] !== 720 || state.scroll.some(Boolean)) throw new Error(`viewport moved: ${JSON.stringify(state)}`);
  if (before.length < 20_000 || after.length < 20_000 || before.equals(after)) throw new Error(`live frames invalid: ${JSON.stringify(evidence.screenshots)}`);
  if (consoleErrors.length) throw new Error(`console errors: ${JSON.stringify(consoleErrors)}`);
  console.log(JSON.stringify(evidence));
} finally {
  await browser.close();
}
