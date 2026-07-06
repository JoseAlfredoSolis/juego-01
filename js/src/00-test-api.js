// ── Test API (activo con ?test=1) — pruebas automatizadas 2D / 3D ─────────
function gameTestEnabled() {
  if (typeof location === 'undefined') return false;
  const q = new URLSearchParams(location.search).get('test');
  return q === '1' || q === 'true';
}

function gameTestSetViewMode(mode) {
  const m = mode === '3d' ? '3d' : '2d';
  if (typeof threeCanUse === 'function' && !threeCanUse()) {
    gs.viewMode = '2d';
  } else {
    gs.viewMode = m;
    if (m === '2d' && typeof threeDisable === 'function') threeDisable();
  }
  if (typeof saveGame === 'function') saveGame();
}

function gameTestPress(code) {
  if (!keys[code]) keyDown[code] = true;
  keys[code] = true;
}

function gameTestRelease(code) {
  keys[code] = false;
  keyUp[code] = true;
}

function gameTestClearInput() {
  for (const k of Object.keys(keys)) delete keys[k];
  for (const k of Object.keys(keyDown)) delete keyDown[k];
  for (const k of Object.keys(keyUp)) delete keyUp[k];
}

function gameTestGoGameplay(world, level) {
  gs.lives = typeof startLives === 'function' ? startLives() : 3;
  gs.world = world ?? 0;
  gs.level = level ?? 0;
  startLevel();
  changeScene('gameplay', true);
}

function gameTestGoKartLobby(trackIdx) {
  if (typeof kartRaceMode !== 'undefined') kartRaceMode = 'single';
  if (typeof kartTrackSel !== 'undefined') kartTrackSel = trackIdx ?? 0;
  changeScene('kartlobby', true);
}

function gameTestSnapshot() {
  const threeEl = document.getElementById('three-c');
  const threeVisible = !!(threeEl && threeEl.style.display !== 'none' && threeEl.width > 0);
  return {
    version: GAME_VERSION,
    scene: gs.scene,
    viewMode: gs.viewMode,
    viewLabel: typeof gameViewModeLabel === 'function' ? gameViewModeLabel() : '?',
    threeOn: document.body.classList.contains('three-on'),
    threeVisible,
    threeCtx: !!threeCtx,
    threeMode: threeCtx?.mode || null,
    gameplay3d: typeof threeGameplayHudOnly === 'function' && threeGameplayHudOnly(),
    kart3d: typeof threeKartHudOnly === 'function' && threeKartHudOnly(),
    canvas2d: !!document.getElementById('c'),
  };
}

function gameTestCanvasHasContent(canvasId) {
  const c = document.getElementById(canvasId || 'c');
  if (!c || c.width < 1 || c.height < 1) return false;
  const ctx2 = c.getContext('2d');
  if (ctx2) {
    const w = Math.min(c.width, 96);
    const h = Math.min(c.height, 96);
    const data = ctx2.getImageData(0, 0, w, h).data;
    let nz = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] || data[i + 1] || data[i + 2]) nz++;
    }
    return nz > 40;
  }
  const gl = c.getContext('webgl') || c.getContext('webgl2');
  if (!gl) return false;
  const px = new Uint8Array(4);
  gl.readPixels(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  return px[0] + px[1] + px[2] > 8;
}

function gameTestInstall() {
  if (!gameTestEnabled()) return;
  document.body.classList.remove('touch', 'mob-menu-html', 'mob-menu');
  window.__GAME_TEST__ = {
    enabled: true,
    setViewMode: gameTestSetViewMode,
    goMenu: () => changeScene('menu', true),
    goGameplay: gameTestGoGameplay,
    goKartLobby: gameTestGoKartLobby,
    press: gameTestPress,
    release: gameTestRelease,
    clearInput: gameTestClearInput,
    snapshot: gameTestSnapshot,
    canvasHasContent: gameTestCanvasHasContent,
    wait: (ms) => new Promise(r => setTimeout(r, ms)),
    waitUntil: async (fn, timeout = 8000, step = 40) => {
      const t0 = performance.now();
      while (performance.now() - t0 < timeout) {
        if (fn()) return true;
        await new Promise(r => setTimeout(r, step));
      }
      return false;
    },
  };
  window.__GAME_TEST_READY__ = true;
}
