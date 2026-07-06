import { test, expect } from '@playwright/test';
import { waitGameTest, getSnapshot, waitForSnapshot } from './helpers.mjs';

test.describe('Carrera kart', () => {
  test('inicia carrera solo con 8 karts', async ({ page }) => {
    await waitGameTest(page);

    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('2d');
      window.__GAME_TEST__.goKartRace(0);
    });
    await waitForSnapshot(page, 'kart_race', 12000);

    const info = await page.evaluate(() => window.__GAME_TEST__.kartInfo());
    expect(info.raceActive).toBe(true);
    expect(info.kartCount).toBe(8);
    expect(info.phase).toBe('countdown');
    expect(info.trackName).toBeTruthy();
    expect(info.trackLength).toBeGreaterThan(100);

    const pixels = await page.evaluate(() => window.__GAME_TEST__.canvasHasContent('c'));
    expect(pixels).toBe(true);
  });

  test('todas las pistas existen y tienen geometría', async ({ page }) => {
    await waitGameTest(page);

    const tracks = await page.evaluate(() => {
      const n = window.__GAME_TEST__.kartInfo().trackCount;
      const out = [];
      for (let i = 0; i < n; i++) {
        window.__GAME_TEST__.goKartLobby(i);
        const k = window.__GAME_TEST__.kartInfo();
        out.push({ idx: i, name: k.trackName, length: k.trackLength });
      }
      return out;
    });

    expect(tracks.length).toBeGreaterThanOrEqual(8);
    for (const tr of tracks) {
      expect(tr.name).toBeTruthy();
      expect(tr.length).toBeGreaterThan(50);
    }
  });

  test('carrera 3D activa HUD kart', async ({ page }) => {
    const hasThree = await page.goto('/index.html?test=1').then(() =>
      page.evaluate(() => typeof THREE !== 'undefined')
    );
    test.skip(!hasThree, 'Three.js no cargado');
    await page.waitForFunction(() => window.__GAME_TEST_READY__ === true);

    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('3d');
      window.__GAME_TEST__.goKartRace(7);
    });
    await waitForSnapshot(page, 'kart_race', 15000);

    const snap = await getSnapshot(page);
    expect(snap.viewMode).toBe('3d');
    expect(snap.threeOn).toBe(true);
    expect(snap.kart3d).toBe(true);
  });

  test('kart avanza tras countdown (simulación acelerar)', async ({ page }) => {
    await waitGameTest(page);
    await page.evaluate(() => {
      window.__GAME_TEST__.setViewMode('2d');
      window.__GAME_TEST__.goKartRace(0);
    });
    await waitForSnapshot(page, 'kart_race', 12000);

    const progress = await page.evaluate(async () => {
      await window.__GAME_TEST__.wait(4600);
      await window.__GAME_TEST__.holdKey('ArrowUp', 800);
      const k = window.__GAME_TEST__.kartInfo();
      return { phase: k.phase, speed: k.playerSpeed, x: k.playerX };
    });
    expect(progress.phase).toBe('racing');
    expect(progress.speed).toBeGreaterThan(50);
  });
});
