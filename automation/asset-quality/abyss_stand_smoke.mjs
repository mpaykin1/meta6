import assert from 'node:assert/strict';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { chromium } from 'playwright';

const root = path.resolve('abyss-glow/stand');
const out = path.resolve('abyss-glow/evidence');
const html = await readFile(path.join(root, 'index.html'));
const sha256 = createHash('sha256').update(html).digest('hex');
const source = html.toString('utf8');
const report = {
  game: 'ABYSS GLOW',
  source: 'abyss-glow/stand/index.html',
  source_sha256: sha256,
  source_bytes: html.length,
  runtime: 'GitHub Actions / headless Chromium / SwiftShader software WebGL',
  real_phone_measured: false,
  profiles: [],
  embedded_assets: [],
  failures: []
};
const expectedSHA = 'd968e47997dbd1cf843fdc73fed94e682217e6d5c833a0c8d602ec5b064f94e5';
assert.equal(sha256, expectedSHA, 'Original game bytes must not be edited');
assert.equal((source.match(/data:image\/png;base64,/g) || []).length, 4, 'Four original inline PNGs');
await mkdir(out, { recursive: true });
// Lossless, byte-for-byte extraction from the immutable owner HTML.
const embedded = [...source.matchAll(/"(assets\/[^"]+\.png)":"data:image\/png;base64,([A-Za-z0-9+/=]+)"/g)];
assert.equal(embedded.length, 4, 'Expected four owner PNGs to extract');
for (const [, assetPath, encoded] of embedded) {
  const bytes = Buffer.from(encoded, 'base64');
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'PNG signature: ' + assetPath);
  const dest = path.join(out, 'extracted', assetPath);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, bytes);
  report.embedded_assets.push({
    path: assetPath, bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex')
  });
}

function percentile(values, p) {
  if (!values.length) return null;
  const a = [...values].sort((x, y) => x - y);
  const index = Math.min(a.length - 1, Math.max(0, Math.ceil(p * a.length) - 1));
  return Number(a[index].toFixed(2));
}
// Pixel evidence is measured from the *rendered screenshot*, not a shader declaration.
async function sampleRenderedPixels(page, pngBytes) {
  const dataUrl = 'data:image/png;base64,' + pngBytes.toString('base64');
  return page.evaluate(async url => {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let sampled = 0, dark = 0, central = 0, centralVisible = 0;
    const w = canvas.width, h = canvas.height;
    for (let y = 0; y < h; y += 3) {
      for (let x = 0; x < w; x += 3) {
        const p = (y * w + x) * 4;
        const top = Math.max(data[p], data[p + 1], data[p + 2]);
        sampled++;
        if (top < 30) dark++;
        if (x >= w * .25 && x < w * .75 && y >= h * .25 && y < h * .75) {
          central++;
          if (top > 60) centralVisible++;
        }
      }
    }
    return {
      dimensions: [w, h], sample_stride: 3, sample_count: sampled,
      darkness_fraction: Number((dark / sampled).toFixed(4)),
      center_visible_fraction: Number((centralVisible / central).toFixed(4)),
      center_visible_samples: centralVisible
    };
  }, dataUrl);
}
const profiles = [
  { name: 'desktop', width: 960, height: 540, touch: false, scale: 1 },
  { name: 'touch', width: 390, height: 844, touch: true, scale: 2 }
];
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
  });
  for (const profile of profiles) {
    const record = { name: profile.name, viewport: [profile.width, profile.height],
      device_pixel_ratio: profile.scale, browser_errors: [], zones: [] };
    report.profiles.push(record);
    let context;
    try {
      context = await browser.newContext({
        viewport: { width: profile.width, height: profile.height },
        deviceScaleFactor: profile.scale,
        isMobile: profile.touch,
        hasTouch: profile.touch
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__standContextLoss = 0;
        document.addEventListener('webglcontextlost', () => {
          window.__standContextLoss += 1;
        }, true);
      });
      page.on('pageerror', error => record.browser_errors.push('pageerror: ' + error.message));
      page.on('console', msg => {
        if (msg.type() === 'error') record.browser_errors.push('console: ' + msg.text());
      });
      page.on('requestfailed', req => {
        record.browser_errors.push('request: ' + req.url() + ' ' + (req.failure()?.errorText || 'failed'));
      });
      await page.goto('http://127.0.0.1:8765/', { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => typeof window.__abyssStats === 'function' &&
        typeof window.__abyssTest === 'function', null, { timeout: 90000 });
      await page.waitForTimeout(3000);
      const before = await page.evaluate(() => {
        const canvas = document.querySelector('#gl');
        const gl = canvas?.getContext('webgl2') || canvas?.getContext('webgl');
        const info = gl?.getExtension('WEBGL_debug_renderer_info');
        return {
          stats: window.__abyssStats(),
          webgl_version: gl ? (gl instanceof WebGL2RenderingContext ? 2 : 1) : 0,
          gl_renderer: info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'not exposed',
          context_losses: window.__standContextLoss,
          canvas: { width: canvas?.width, height: canvas?.height,
            rect: { width: canvas?.getBoundingClientRect().width,
              height: canvas?.getBoundingClientRect().height } },
          scrollY: window.scrollY
        };
      });
      record.boot = before;
      assert(before.webgl_version > 0, profile.name + ': WebGL context missing');
      assert(before.stats.calls > 0, profile.name + ': no actual draw calls');
      assert(before.stats.chunks > 0, profile.name + ': no world chunks');
      assert.equal(before.scrollY, 0, profile.name + ': unexpected page scroll');
      assert.equal(before.canvas.rect.width, profile.width, profile.name + ': canvas does not fill viewport');
      assert.equal(before.canvas.rect.height, profile.height, profile.name + ': canvas does not fill viewport');

      const start = before.stats.hero;
      const tx = Math.round(profile.width * 0.83);
      const ty = Math.round(profile.height * 0.39);
      if (profile.touch) {
        const cdp = await context.newCDPSession(page);
        await cdp.send('Input.dispatchTouchEvent',
          { type: 'touchStart', touchPoints: [{ id: 1, x: tx, y: ty }] });
        await page.waitForTimeout(1500);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await cdp.detach();
      } else {
        await page.mouse.move(tx, ty);
        await page.mouse.down();
        await page.waitForTimeout(1500);
        await page.mouse.up();
      }
      const after = await page.evaluate(() => window.__abyssStats());
      record.movement = {
        from: start, to: after.hero,
        distance_world_units: Number(Math.hypot(after.hero[0] - start[0],
          after.hero[1] - start[1]).toFixed(2))
      };
      assert(record.movement.distance_world_units > 1,
        profile.name + ': actual pointer/touch movement not observed');

      for (let zone = 0; zone < 5; zone++) {
        await page.evaluate(z => window.__abyssTest(z), zone);
        await page.waitForTimeout(1800);
        const stats = await page.evaluate(() => window.__abyssStats());
        const file = profile.name + '-zone-' + (zone + 1) + '.png';
        const shot = await page.locator('#gl').screenshot({
          path: path.join(out, file), timeout: 60000
        });
        const pixels = await sampleRenderedPixels(page, shot);
        record.zones.push({
          number: zone + 1,
          stats,
          screenshot: file,
          screenshot_bytes: shot.length,
          screenshot_sha256: createHash('sha256').update(shot).digest('hex'),
          pixels
        });
        assert(stats.chunks > 0 && stats.calls > 0,
          profile.name + ': zone ' + (zone + 1) + ' not rendering');
        assert(shot.length > 1500,
          profile.name + ': screenshot too small for zone ' + (zone + 1));
        // A black canvas with an intact HUD can no longer pass as a rendered world.
        assert(pixels.darkness_fraction >= 0.70,
          profile.name + ': zone ' + (zone + 1) + ' fails darkness budget');
        assert(pixels.center_visible_fraction >= 0.001,
          profile.name + ': zone ' + (zone + 1) + ' has no visible world in the center');
      }
      const current = await page.evaluate(() => ({
        ...window.__abyssStats(), context_losses: window.__standContextLoss,
        scrollY: window.scrollY
      }));
      const rates = current.fps.filter(x => typeof x === 'number' && x > 0);
      record.fps = {
        samples: rates, p50: percentile(rates, 0.5), p05: percentile(rates, 0.05),
        p95_frame_ms: percentile(rates.map(x => 1000 / x), 0.95)
      };
      record.context_losses = current.context_losses;
      assert.equal(current.context_losses, 0, profile.name + ': WebGL context lost');
      assert.equal(current.scrollY, 0, profile.name + ': window scrolled during play');
      assert.equal(record.browser_errors.length, 0,
        profile.name + ': browser errors: ' + record.browser_errors.join('; '));
      record.status = 'PASS_BROWSER_SMOKE';
    } catch (error) {
      record.status = 'FAIL';
      record.error = String(error?.stack || error);
      report.failures.push(profile.name + ': ' + String(error?.message || error));
    } finally {
      if (context) await context.close();
    }
  }
} catch (error) {
  report.failures.push('browser: ' + String(error?.stack || error));
} finally {
  if (browser) await browser.close();
  report.status = report.failures.length ? 'FAIL' : 'PASS_BROWSER_SMOKE_NOT_DEVICE_ACCEPTANCE';
  await writeFile(path.join(out, 'browser-report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({
    status: report.status,
    source_sha256: report.source_sha256,
    profiles: report.profiles.map(p => ({
      name: p.name, status: p.status, movement: p.movement,
      fps: p.fps, zone_count: p.zones.length, error: p.error
    })),
    failures: report.failures
  }, null, 2));
}
if (report.failures.length) process.exitCode = 1;
