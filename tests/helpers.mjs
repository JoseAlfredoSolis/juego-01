/** @param {import('@playwright/test').Page} page */
export async function waitGameTest(page) {
  await page.goto('/index.html?test=1');
  await page.waitForFunction(() => window.__GAME_TEST_READY__ === true);
}

/** @param {import('@playwright/test').Page} page */
export async function getSnapshot(page) {
  return page.evaluate(() => window.__GAME_TEST__.snapshot());
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {'gameplay_2d'|'gameplay_3d'|'kartlobby'|'kartlobby_3d'|'three_off'} key
 */
export async function waitForSnapshot(page, key, timeout = 10000) {
  await page.waitForFunction(
    k => {
      const s = window.__GAME_TEST__.snapshot();
      const ok = {
        gameplay_2d: s.scene === 'gameplay' && s.viewMode === '2d',
        gameplay_3d: s.scene === 'gameplay' && s.threeOn && s.threeCtx,
        kartlobby: s.scene === 'kartlobby',
        kartlobby_3d: s.scene === 'kartlobby' && s.threeOn,
        three_off: s.viewMode === '2d' && !s.threeOn,
      };
      return !!ok[k];
    },
    key,
    { timeout }
  );
}
