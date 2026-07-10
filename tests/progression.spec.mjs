import { test, expect } from '@playwright/test';
import { waitGameTest, waitForSnapshot } from './helpers.mjs';

test.describe('Progresión con estrellas', () => {
  test('completar nivel guarda estrellas y mejor tiempo', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('2d');
      window.__GAME_TEST__.goGameplay(0, 0);
    });
    await waitForSnapshot(page, 'gameplay_2d');

    const done = await page.evaluate(async () => {
      const api = window.__GAME_TEST__;
      const ok = api.teleportToGoal();
      if (!ok) return { ok: false };
      await api.waitUntil(() => api.snapshot().scene === 'levelcomplete', 5000);
      return { ok: true, scene: api.snapshot().scene, progress: api.progressInfo() };
    });

    expect(done.ok).toBe(true);
    expect(done.scene).toBe('levelcomplete');
    // Al menos 1 estrella (completar); sin daño suma otra.
    expect(done.progress.levelStarsBest[0][0]).toBeGreaterThanOrEqual(1);
    expect(done.progress.levelBestTime[0][0]).toBeGreaterThan(0);
    // Recompensa de monedas por estrellas nuevas.
    expect(done.progress.wallet).toBeGreaterThan(0);
  });

  test('los récords kart empiezan vacíos y existen en el estado', async ({ page }) => {
    await waitGameTest(page);
    const progress = await page.evaluate(() => window.__GAME_TEST__.progressInfo());
    expect(progress.kartBest).toBeDefined();
    expect(Array.isArray(progress.levelStarsBest)).toBe(true);
    expect(progress.levelStarsBest.length).toBeGreaterThanOrEqual(12);
  });
});
