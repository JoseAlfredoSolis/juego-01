import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname } from 'path';

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webmanifest': 'application/json' };
const srv = createServer(async (req, res) => {
  try {
    const p = '.' + (req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]);
    const data = await readFile(p);
    res.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(r => srv.listen(8931, r));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.goto('http://localhost:8931/index.html?test=1');
await page.waitForFunction(() => window.__GAME_TEST_READY__ === true);
await page.evaluate(() => {
  window.__GAME_TEST__.setViewMode('3d');
  window.__GAME_TEST__.goGameplay(0, 0);
});
await page.waitForFunction(() => {
  const s = window.__GAME_TEST__.snapshot();
  return s.scene === 'gameplay' && s.threeOn;
}, { timeout: 10000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'artifacts/3d-gameplay.png' });
// también saltando para ver despegue/aterrizaje
await page.evaluate(async () => { await window.__GAME_TEST__.holdKey('ArrowRight', 600); });
await page.waitForTimeout(300);
await page.screenshot({ path: 'artifacts/3d-gameplay-moved.png' });
await browser.close();
srv.close();
console.log('OK screenshots');
