import { test, expect } from '@playwright/test';
import { waitGameTest, getSnapshot, waitForSnapshot } from './helpers.mjs';

test.describe('Gameplay plataformas', () => {
  test('inicia nivel con jugador, enemigos y monedas', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('2d');
      window.__GAME_TEST__.goGameplay(0, 0);
    });
    await waitForSnapshot(page, 'gameplay_2d');

    const info = await page.evaluate(() => window.__GAME_TEST__.gameplayInfo());
    expect(info.world).toBe(0);
    expect(info.level).toBe(0);
    expect(info.lives).toBeGreaterThan(0);
    expect(info.enemies).toBeGreaterThan(0);
    expect(info.coins).toBeGreaterThan(0);
    expect(info.levelW).toBeGreaterThan(1000);
    expect(info.y).toBeLessThan(700);
  });

  test('jugador se mueve al pulsar derecha', async ({ page }) => {
    await waitGameTest(page);
    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('2d');
      window.__GAME_TEST__.goGameplay(0, 0);
    });
    await waitForSnapshot(page, 'gameplay_2d');

    const moved = await page.evaluate(async () => {
      const x0 = window.__GAME_TEST__.gameplayInfo().x;
      await window.__GAME_TEST__.holdKey('ArrowRight', 350);
      const x1 = window.__GAME_TEST__.gameplayInfo().x;
      return { x0, x1 };
    });
    expect(moved.x1).toBeGreaterThan(moved.x0);
  });

  test('salto reduce posición Y del jugador', async ({ page }) => {
    await waitGameTest(page);
    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('2d');
      window.__GAME_TEST__.goGameplay(0, 0);
    });
    await waitForSnapshot(page, 'gameplay_2d');

    const jumped = await page.evaluate(async () => {
      await window.__GAME_TEST__.wait(100);
      const y0 = window.__GAME_TEST__.gameplayInfo().y;
      await window.__GAME_TEST__.holdKey('Space', 120);
      await window.__GAME_TEST__.wait(80);
      const y1 = window.__GAME_TEST__.gameplayInfo().y;
      return { y0, y1 };
    });
    expect(jumped.y1).toBeLessThan(jumped.y0);
  });

  test('mundo 2 (cueva) carga con hazards', async ({ page }) => {
    await waitGameTest(page);
    await page.evaluate(() => window.__GAME_TEST__.goGameplay(1, 0));
    await waitForSnapshot(page, 'gameplay_2d');

    const info = await page.evaluate(() => window.__GAME_TEST__.gameplayInfo());
    expect(info.world).toBe(1);
    expect(info.hazards).toBeGreaterThan(0);
  });

  test('pausa desde gameplay', async ({ page }) => {
    await waitGameTest(page);
    await page.evaluate(() => window.__GAME_TEST__.goGameplay(0, 0));
    await waitForSnapshot(page, 'gameplay_2d');

    await page.evaluate(async () => {
      window.__GAME_TEST__.press('Escape');
      await window.__GAME_TEST__.wait(80);
      window.__GAME_TEST__.clearInput();
    });
    await waitForSnapshot(page, 'pause', 5000);
    expect((await getSnapshot(page)).scene).toBe('pause');
  });
});
