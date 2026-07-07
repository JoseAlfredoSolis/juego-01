import { test, expect } from '@playwright/test';
import { waitGameTest, getSnapshot } from './helpers.mjs';

test.describe('Menú copa kart', () => {
  test('kartmenu abre modo copa y confirma copa', async ({ page }) => {
    await waitGameTest(page);
    await page.evaluate(() => {
      window.__GAME_TEST__.goKartMenu();
      kartMenuSel = 0;
      const it = kartMenuItems[kartMenuSel];
      if (it !== 'COPA KART') throw new Error('COPA KART no es la primera opción');
      kartRaceMode = 'cup';
      changeScene('kartcup', true);
    });
    let snap = await getSnapshot(page);
    expect(snap.scene).toBe('kartcup');

    await page.evaluate(() => {
      kartCupSel = 0;
      changeScene('kartselect', true);
    });
    snap = await getSnapshot(page);
    expect(snap.scene).toBe('kartselect');
  });

  test('inicia carrera de copa sin error de pista', async ({ page }) => {
    await waitGameTest(page);
    await page.evaluate(() => {
      window.__GAME_TEST__.goKartMenu();
      kartMenuSel = 0;
      kartRaceMode = 'cup';
      changeScene('kartcup', true);
      kartCupSel = 6;
      kartSelectDriver = 0;
      changeScene('kartselect', true);
    });
    await page.evaluate(async () => {
      kartInitCup(kartCupSel);
      window.__GAME_TEST__.press('Enter');
      await window.__GAME_TEST__.wait(120);
    });
    const info = await page.evaluate(() => window.__GAME_TEST__.meta().kart);
    expect(info.raceActive).toBe(true);
    expect(info.trackName).toBeTruthy();
  });
});
