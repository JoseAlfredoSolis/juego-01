/** @param {import('@playwright/test').Page} page */
export async function waitGameTest(page) {
  await page.goto('/index.html?test=1');
  await page.waitForFunction(() => window.__GAME_TEST_READY__ === true);
}

/** @param {import('@playwright/test').Page} page */
export async function getSnapshot(page) {
  return page.evaluate(() => window.__GAME_TEST__.snapshot());
}

/** @param {import('@playwright/test').Page} page */
export async function getMeta(page) {
  return page.evaluate(() => window.__GAME_TEST__.meta());
}

/**
 * @param {import('@playwright/test').Page} page
 * @param {string} key
 */
export async function waitForSnapshot(page, key, timeout = 10000) {
  await page.waitForFunction(
    k => {
      const s = window.__GAME_TEST__.snapshot();
      const ok = {
        menu: s.scene === 'menu',
        worldmap: s.scene === 'worldmap',
        kartmenu: s.scene === 'kartmenu',
        kartlobby: s.scene === 'kartlobby',
        kart_race: s.scene === 'kart',
        pomworld: s.scene === 'pomworld',
        gallery: s.scene === 'gallery',
        settings: s.scene === 'settings',
        pause: s.scene === 'pause',
        gameplay_2d: s.scene === 'gameplay' && s.viewMode === '2d',
        gameplay_3d: s.scene === 'gameplay' && s.threeOn && s.threeCtx,
        kartlobby_3d: s.scene === 'kartlobby' && s.threeOn,
        three_off: s.viewMode === '2d' && !s.threeOn,
      };
      return !!ok[k];
    },
    key,
    { timeout }
  );
}
