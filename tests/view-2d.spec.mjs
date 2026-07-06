import { test, expect } from '@playwright/test';
import { waitGameTest, getSnapshot, waitForSnapshot } from './helpers.mjs';

test.describe('Modo 2D', () => {
  test('menú y gameplay renderizan canvas 2D sin Three.js', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('2d');
      window.__GAME_TEST__.goMenu();
    });

    let snap = await getSnapshot(page);
    expect(snap.viewMode).toBe('2d');
    expect(snap.scene).toBe('menu');
    expect(snap.threeOn).toBe(false);

    const menuPixels = await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'));
    expect(menuPixels).toBe(true);

    await page.evaluate(() => window.__GAME_TEST__.goGameplay(0, 0));

    await waitForSnapshot(page, 'gameplay_2d');

    snap = await getSnapshot(page);
    expect(snap.threeOn).toBe(false);
    expect(snap.gameplay3d).toBe(false);

    const gameplayPixels = await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'));
    expect(gameplayPixels).toBe(true);
  });

  test('carrera kart en lobby usa vista 2D', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('2d');
      window.__GAME_TEST__.goKartLobby(0);
    });

    await waitForSnapshot(page, 'kartlobby');

    const snap = await getSnapshot(page);
    expect(snap.viewMode).toBe('2d');
    expect(snap.threeOn).toBe(false);

    const pixels = await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'));
    expect(pixels).toBe(true);
  });
});
