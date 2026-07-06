import { test, expect } from '@playwright/test';
import { waitGameTest, getSnapshot, getMeta, waitForSnapshot } from './helpers.mjs';

test.describe('Menús y pantallas', () => {
  test('navega por menú principal, mapa y ajustes', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => window.__GAME_TEST__.goMenu());
    await waitForSnapshot(page, 'menu');
    expect((await getSnapshot(page)).scene).toBe('menu');

    await page.evaluate(() => window.__GAME_TEST__.goWorldMap());
    await waitForSnapshot(page, 'worldmap');
    expect((await getSnapshot(page)).scene).toBe('worldmap');

    await page.evaluate(() => window.__GAME_TEST__.goSettings());
    await waitForSnapshot(page, 'settings');
    expect((await getSnapshot(page)).scene).toBe('settings');

    const pixels = await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'));
    expect(pixels).toBe(true);
  });

  test('pantallas Pomerania y galería cargan', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => window.__GAME_TEST__.goPomWorld());
    await waitForSnapshot(page, 'pomworld');
    expect((await getSnapshot(page)).scene).toBe('pomworld');

    await page.evaluate(() => window.__GAME_TEST__.goGallery());
    await waitForSnapshot(page, 'gallery');
    expect((await getSnapshot(page)).scene).toBe('gallery');

    const pixels = await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'));
    expect(pixels).toBe(true);
  });

  test('menú kart accesible desde API', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => window.__GAME_TEST__.goKartMenu());
    await waitForSnapshot(page, 'kartmenu');

    const snap = await getSnapshot(page);
    expect(snap.scene).toBe('kartmenu');
    expect(await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'))).toBe(true);
  });

  test('metadatos del juego son coherentes', async ({ page }) => {
    await waitGameTest(page);

    const meta = await getMeta(page);
    expect(meta.worldCount).toBeGreaterThanOrEqual(6);
    expect(meta.characterCount).toBeGreaterThanOrEqual(30);
    expect(meta.kartTracks).toBeGreaterThanOrEqual(8);
    expect(meta.threeAvailable).toBe(true);
  });

  test('tienda lista personajes comprables originales', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => window.__GAME_TEST__.goShop());
    await waitForSnapshot(page, 'shop');
    expect((await getSnapshot(page)).scene).toBe('shop');

    const shop = await page.evaluate(() => window.__GAME_TEST__.shopInfo());
    expect(shop.chars.length).toBeGreaterThanOrEqual(9);
    const exclusives = shop.chars.filter(c => c.shopOnly);
    expect(exclusives.length).toBeGreaterThanOrEqual(3);
    expect(exclusives.some(c => c.name.includes('ASTRO'))).toBe(true);
    expect(await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'))).toBe(true);
  });
});
