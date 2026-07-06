import { test, expect } from '@playwright/test';
import { waitGameTest, getSnapshot, waitForSnapshot } from './helpers.mjs';

test.describe('Modo 3D', () => {
  test.beforeEach(async ({ page }) => {
    const hasThree = await page.goto('/index.html?test=1').then(() =>
      page.evaluate(() => typeof THREE !== 'undefined')
    );
    test.skip(!hasThree, 'Three.js no cargado');
    await page.waitForFunction(() => window.__GAME_TEST_READY__ === true);
  });

  test('gameplay activa renderer Three.js', async ({ page }) => {
    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('3d');
      window.__GAME_TEST__.goGameplay(0, 0);
    });

    await waitForSnapshot(page, 'gameplay_3d', 15000);

    const snap = await getSnapshot(page);
    expect(snap.viewMode).toBe('3d');
    expect(snap.gameplay3d).toBe(true);
    expect(snap.threeVisible).toBe(true);

    const canvas2d = await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'));
    expect(canvas2d).toBe(true);
  });

  test('lobby kart muestra pista en 3D', async ({ page }) => {
    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('3d');
      window.__GAME_TEST__.goKartLobby(0);
    });

    await waitForSnapshot(page, 'kartlobby_3d', 15000);

    const snap = await getSnapshot(page);
    expect(snap.viewMode).toBe('3d');
    expect(snap.threeCtx).toBe(true);
    expect(snap.threeVisible).toBe(true);
    expect(snap.threeMode).toBe('menu');
  });

  test('alternar 3D → 2D desactiva Three.js', async ({ page }) => {
    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('3d');
      window.__GAME_TEST__.goGameplay(0, 0);
    });

    await waitForSnapshot(page, 'gameplay_3d', 15000);

    await page.evaluate(() => window.__GAME_TEST__.setViewMode('2d'));

    await waitForSnapshot(page, 'three_off', 8000);

    const snap = await getSnapshot(page);
    expect(snap.gameplay3d).toBe(false);
  });
});
