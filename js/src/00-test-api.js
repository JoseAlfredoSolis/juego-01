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

function gameTestGoScene(scene) {
  changeScene(scene, true);
}

function gameTestGoKartMenu() {
  if (typeof kartMenuSel !== 'undefined') kartMenuSel = 0;
  if (typeof mp !== 'undefined') mp.gameMode = 'kart';
  changeScene('kartmenu', true);
}

function gameTestGoKartRace(trackIdx) {
  if (typeof kartRaceMode !== 'undefined') kartRaceMode = 'single';
  if (typeof kartTrackSel !== 'undefined') kartTrackSel = trackIdx ?? 0;
  startKartRace(true);
  changeScene('kart', true);
}

function gameTestGameplayInfo() {
  if (gs.scene !== 'gameplay' || typeof player === 'undefined' || !player) return null;
  return {
    world: gs.world,
    level: gs.level,
    lives: gs.lives,
    x: Math.round(player.x),
    y: Math.round(player.y),
    onGround: !!player.onGround,
    enemies: typeof enemies !== 'undefined' ? enemies.filter(e => e.active).length : 0,
    hazards: hazards?.length ?? 0,
    levelW: levelData?.levelW ?? 0,
    coins: items?.filter(it => !it.taken && it.type === 'coin').length ?? 0,
  };
}

function gameTestKartInfo() {
  const tr = typeof KART_TRACKS !== 'undefined' ? KART_TRACKS[kartTrackSel] : null;
  const me = race?.karts?.[0];
  return {
    trackCount: typeof KART_TRACKS !== 'undefined' ? KART_TRACKS.length : 0,
    trackSel: typeof kartTrackSel !== 'undefined' ? kartTrackSel : -1,
    trackName: tr?.name ?? null,
    trackLength: tr?.length ?? 0,
    raceActive: !!race,
    phase: race?.phase ?? null,
    kartCount: race?.karts?.length ?? 0,
    playerSpeed: me ? Math.abs(me.speed || 0) : 0,
    playerX: me ? Math.round(me.x) : 0,
  };
}

function gameTestMeta() {
  return {
    worldCount: typeof WORLD_COUNT !== 'undefined' ? WORLD_COUNT : 0,
    kartTracks: typeof KART_TRACKS !== 'undefined' ? KART_TRACKS.length : 0,
    threeAvailable: typeof threeCanUse === 'function' && threeCanUse(),
    gameplay: gameTestGameplayInfo(),
    kart: gameTestKartInfo(),
  };
}

async function gameTestHoldKey(code, ms) {
  gameTestPress(code);
  await new Promise(r => setTimeout(r, ms));
  gameTestRelease(code);
  gameTestClearInput();
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
    goScene: gameTestGoScene,
    goWorldMap: () => changeScene('worldmap', true),
    goKartMenu: gameTestGoKartMenu,
    goGameplay: gameTestGoGameplay,
    goKartLobby: gameTestGoKartLobby,
    goKartRace: gameTestGoKartRace,
    goPomWorld: () => changeScene('pomworld', true),
    goGallery: () => { if (typeof gallerySel !== 'undefined') gallerySel = 0; changeScene('gallery', true); },
    goSettings: () => { if (typeof setSel !== 'undefined') setSel = 0; changeScene('settings', true); },
    press: gameTestPress,
    release: gameTestRelease,
    clearInput: gameTestClearInput,
    holdKey: gameTestHoldKey,
    snapshot: gameTestSnapshot,
    meta: gameTestMeta,
    gameplayInfo: gameTestGameplayInfo,
    kartInfo: gameTestKartInfo,
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
