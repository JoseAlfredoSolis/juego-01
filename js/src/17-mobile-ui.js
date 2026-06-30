// ── Mobile UI (touch menus, tap targets, scene chrome) ───────────────────────
const MOB_PLAY_SCENES = ['gameplay', 'kart'];
const MOB_MENU_SCENES = [
  'menu', 'multimenu', 'kartmenu', 'kartselect', 'kartcup', 'kartcupresults',
  'settings', 'shop', 'pause', 'worldmap',
  'charselect', 'achievements', 'kartlobby', 'kartresults', 'gameover',
  'levelcomplete', 'instructions', 'credits', 'mpcreate', 'kartcreate', 'victory',
];
const MOB_JOIN_SCENES = ['mpjoin', 'kartjoin'];
const MOB_NAV_WIDE_SCENES = ['worldmap', 'kartlobby', 'charselect', 'shop', 'kartselect'];

let mobRows = [];
let mobWorldCards = [];
let mobSelGet = null;
let mobSelSet = null;
let mobSwipeHandler = null;
let mobPtr = null;

const MOB_TAP_MAX = 22;
const MOB_SWIPE_MIN = 36;

function mobRegisterRow(x, y, w, h, idx) {
  if (!document.body.classList.contains('touch')) return;
  mobRows.push({ x, y, w, h, idx });
}

function mobRegisterWorldCard(wi, x, y, w, h) {
  if (!document.body.classList.contains('touch')) return;
  mobWorldCards.push({ wi, x, y, w, h });
}

function mobClearRows() {
  mobRows.length = 0;
}

function mobClearWorldCards() {
  mobWorldCards.length = 0;
}

function canvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return { x: 0, y: 0 };
  return {
    x: (clientX - rect.left) * (W / rect.width),
    y: (clientY - rect.top) * (H / rect.height),
  };
}

function mobBindMenu(selGet, selSet) {
  mobSelGet = selGet;
  mobSelSet = selSet;
}

function mobBindSwipe(handler) {
  mobSwipeHandler = handler;
}

function mobWorldHitTest(gx, gy) {
  for (const c of mobWorldCards) {
    if (gx >= c.x && gx <= c.x + c.w && gy >= c.y && gy <= c.y + c.h) {
      if (c.wi !== wmSel) {
        wmSel = c.wi;
        sfx.select();
        mpHostBroadcast();
      }
      return true;
    }
  }
  return false;
}

function mobHitTest(gx, gy) {
  if (!mobSelSet) return false;
  for (const r of mobRows) {
    if (gx >= r.x && gx <= r.x + r.w && gy >= r.y && gy <= r.y + r.h) {
      mobSelSet(r.idx);
      sfx.select();
      return true;
    }
  }
  return false;
}

function mobTapKey(code) {
  audioInit();
  if (!keys[code]) keyDown[code] = true;
  keys[code] = true;
  tryImmersive();
}

const MOB_BTN_ACTIONS = {
  mobBack: 'back',
  mobLeft: 'left',
  mobUp: 'up',
  mobDown: 'down',
  mobRight: 'right',
  mobOk: 'ok',
};
const MOB_ACTION_KEYS = {
  ok: ['Enter', 'Space'],
  back: ['Escape'],
  up: ['ArrowUp', 'KeyW'],
  down: ['ArrowDown', 'KeyS'],
  left: ['ArrowLeft', 'KeyA'],
  right: ['ArrowRight', 'KeyD'],
};
let mobMenuAction = null;

function mobQueueAction(action) {
  mobMenuAction = action;
  audioInit();
  tryImmersive();
}

// Apply queued nav tap at frame start so pressed() sees it before clearFrame().
function mobProcessNav() {
  if (!mobMenuAction) return;
  const codes = MOB_ACTION_KEYS[mobMenuAction] || [];
  mobMenuAction = null;
  for (const c of codes) {
    keyDown[c] = true;
    keys[c] = true;
  }
}

function mobUiSync() {
  if (!document.body.classList.contains('touch')) {
    document.body.classList.remove('playing', 'mob-menu', 'mob-join', 'mob-nav-wide', 'kart-race', 'portrait', 'mob-menu-html');
    return;
  }
  const s = gs.scene;
  const playing = MOB_PLAY_SCENES.includes(s);
  const menu = MOB_MENU_SCENES.includes(s);
  const join = MOB_JOIN_SCENES.includes(s);
  const portrait = window.innerHeight > window.innerWidth;
  document.body.classList.toggle('playing', playing);
  document.body.classList.toggle('mob-menu', menu);
  document.body.classList.toggle('mob-join', join);
  document.body.classList.toggle('mob-nav-wide', MOB_NAV_WIDE_SCENES.includes(s));
  document.body.classList.toggle('kart-race', s === 'kart');
  document.body.classList.toggle('portrait', portrait);
  const nav = document.getElementById('mobNav');
  if (nav) nav.classList.toggle('visible', menu);
  if (!menu) { mobSelGet = null; mobSelSet = null; }
  mobMenuHtmlSync();
  if (typeof resize === 'function') resize();
}

function mobTouchLand() {
  return document.body.classList.contains('touch')
    && window.innerWidth >= window.innerHeight;
}

function mobTouchPortrait() {
  return document.body.classList.contains('touch')
    && window.innerHeight > window.innerWidth;
}

/** Layout compacto para menus en movil (vertical u horizontal). */
function mobUseDesktopMenu() {
  if (!document.body.classList.contains('touch')) return true;
  return Math.max(window.innerWidth, window.innerHeight) >= 900;
}

function mobMenuLayout(itemCount) {
  if (mobUseDesktopMenu()) {
    return { mode: 'desktop', startY: 318, rowH: 54, pw: 400, ph: 480, py: 262, rw: 360, rh: 44 };
  }
  if (mobTouchLand()) {
    return { mode: 'land', startY: 192, rowH: 38, pw: 600, ph: 400, py: 158, rw: 520, rh: 34 };
  }
  const rowH = 34;
  const ph = Math.min(400, 72 + itemCount * rowH);
  return { mode: 'port', startY: 118, rowH, pw: 560, ph, py: 96, rw: 480, rh: 30 };
}

function mobUiPreUpdate() {
  mobClearRows();
  mobClearWorldCards();
  mobSwipeHandler = null;
}

function mobHandlePointerUp(clientX, clientY) {
  if (!mobPtr) return;
  const dx = clientX - mobPtr.x;
  const dy = clientY - mobPtr.y;
  const dist = Math.hypot(dx, dy);
  mobPtr = null;

  if (!document.body.classList.contains('touch')) return;
  if (MOB_PLAY_SCENES.includes(gs.scene) || MOB_JOIN_SCENES.includes(gs.scene)) return;

  if (dist < MOB_TAP_MAX) {
    const p = canvasPoint(clientX, clientY);
    if (gs.scene === 'worldmap') {
      if (!mobWorldHitTest(p.x, p.y) && MOB_MENU_SCENES.includes(gs.scene)) mobHitTest(p.x, p.y);
    } else if (MOB_MENU_SCENES.includes(gs.scene)) {
      mobHitTest(p.x, p.y);
    }
    return;
  }

  if (dist < MOB_SWIPE_MIN || !mobSwipeHandler) return;
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);
  if (ax > ay * 1.15) {
    mobSwipeHandler(dx > 0 ? 'right' : 'left');
    sfx.select();
  } else if (ay > ax * 1.15) {
    mobSwipeHandler(dy > 0 ? 'down' : 'up');
    sfx.select();
  }
}

function setupMobileUi() {
  if (!isTouchDevice()) return;

  let actions;
  try { actions = MOB_BTN_ACTIONS; } catch (_) { return; }
  if (!actions) return;

  for (const [id, action] of Object.entries(actions)) {
    const btn = document.getElementById(id);
    if (!btn) continue;
    const down = e => { e.preventDefault(); e.stopPropagation(); btn.classList.add('active'); };
    const up = e => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.remove('active');
      mobQueueAction(action);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('click', e => e.preventDefault());
  }

  canvas.addEventListener('pointerdown', e => {
    if (!document.body.classList.contains('touch')) return;
    if (MOB_PLAY_SCENES.includes(gs.scene)) return;
    mobPtr = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });

  canvas.addEventListener('pointerup', e => {
    if (!mobPtr || mobPtr.id !== e.pointerId) return;
    mobHandlePointerUp(e.clientX, e.clientY);
  });

  canvas.addEventListener('pointercancel', () => { mobPtr = null; });
}

let mobMenuHtmlScene = '';
let mobKartSelectSel = 0;

function mobGetHtmlMenuConfig() {
  if (!document.body.classList.contains('touch')) return null;
  if (window.innerWidth >= window.innerHeight) return null;
  if (!MOB_MENU_SCENES.includes(gs.scene)) return null;

  if (gs.scene === 'menu' && typeof menuItems !== 'undefined') {
    return {
      type: 'list', theme: 'green', title: 'SUPER BEAR', subtitle: 'ADVENTURE',
      items: menuItems, getSel: () => menuSel, setSel: v => { menuSel = v; },
      onPick: () => mobQueueAction('ok'), showMeta: true,
    };
  }
  if (gs.scene === 'kartmenu' && typeof kartMenuItems !== 'undefined') {
    return {
      type: 'list', theme: 'purple', title: 'MARIO KART', subtitle: 'Elige modo de carrera',
      items: kartMenuItems, getSel: () => kartMenuSel, setSel: v => { kartMenuSel = v; },
      onPick: () => mobQueueAction('ok'),
    };
  }
  if (gs.scene === 'kartselect') {
    const ch = CHARACTERS[kartSelectDriver] || CHARACTERS[0];
    const st = typeof kartPlayerStats === 'function' ? kartPlayerStats() : null;
    return {
      type: 'list', theme: 'purple', title: 'PERSONALIZAR', subtitle: ch.name,
      detail: st ? 'Clase: ' + st.archetype : '',
      items: ['CONTINUAR', 'VOLVER'],
      getSel: () => mobKartSelectSel, setSel: v => { mobKartSelectSel = v; },
      onPick: idx => { if (idx === 0) mobQueueAction('ok'); else mobQueueAction('back'); },
    };
  }
  if (gs.scene === 'kartlobby' && typeof KART_TRACKS !== 'undefined') {
    const tr = KART_TRACKS[kartTrackSel];
    return { type: 'kartlobby', theme: 'purple', title: 'PISTA DE CARRERA', subtitle: tr.name, track: tr };
  }
  return null;
}

function mobMenuHtmlSync() {
  const root = document.getElementById('mobMenuHtml');
  const list = document.getElementById('mobMenuHtmlList');
  const titleEl = root?.querySelector('.mmh-title');
  const subEl = root?.querySelector('.mmh-sub');
  const meta = document.getElementById('mmhMeta');
  const detail = document.getElementById('mmhDetail');
  const ver = document.getElementById('mmhVer');
  const cfg = mobGetHtmlMenuConfig();
  const show = !!cfg;

  document.body.classList.toggle('mob-menu-html', show);
  if (root) root.classList.toggle('theme-purple', show && cfg?.theme === 'purple');

  if (!root || !list) return;
  if (!show) {
    mobMenuHtmlScene = '';
    list.innerHTML = '';
    if (detail) detail.textContent = '';
    return;
  }

  if (titleEl) titleEl.textContent = cfg.title || '';
  if (subEl) subEl.textContent = cfg.subtitle || '';
  if (detail) detail.textContent = cfg.detail || '';

  if (mobMenuHtmlScene !== gs.scene) {
    mobMenuHtmlScene = gs.scene;
    list.innerHTML = '';

    if (cfg.type === 'kartlobby') {
      const prev = document.createElement('button');
      prev.type = 'button'; prev.className = 'mmh-item';
      prev.textContent = '◀ PISTA ANTERIOR';
      prev.addEventListener('click', e => {
        e.preventDefault();
        kartTrackSel = (kartTrackSel - 1 + KART_TRACKS.length) % KART_TRACKS.length;
        sfx.select();
        if (mp.role === 'host') mpHostBroadcast();
        mobMenuHtmlSync();
      });
      const next = document.createElement('button');
      next.type = 'button'; next.className = 'mmh-item';
      next.textContent = 'PISTA SIGUIENTE ▶';
      next.addEventListener('click', e => {
        e.preventDefault();
        kartTrackSel = (kartTrackSel + 1) % KART_TRACKS.length;
        sfx.select();
        if (mp.role === 'host') mpHostBroadcast();
        mobMenuHtmlSync();
      });
      const start = document.createElement('button');
      start.type = 'button'; start.className = 'mmh-item mmh-start';
      start.textContent = '¡EMPEZAR CARRERA!';
      start.addEventListener('click', e => {
        e.preventDefault();
        audioInit();
        sfx.select();
        if (mp.connected) {
          startKartRace(false);
        } else {
          if (!kartRaceMode) kartRaceMode = 'single';
          startKartRace(true);
        }
        changeScene('kart', true);
      });
      list.appendChild(prev);
      list.appendChild(next);
      list.appendChild(start);
    } else if (cfg.items) {
      cfg.items.forEach((label, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mmh-item';
        btn.dataset.idx = String(idx);
        btn.textContent = label;
        btn.addEventListener('click', e => {
          e.preventDefault();
          if (cfg.setSel) cfg.setSel(idx);
          sfx.select();
          if (cfg.onPick) cfg.onPick(idx);
        });
        list.appendChild(btn);
      });
    }
  }

  if (cfg.type === 'list' && cfg.getSel) {
    const sel = cfg.getSel();
    list.querySelectorAll('.mmh-item').forEach((btn, i) => {
      btn.classList.toggle('sel', i === sel);
    });
  }

  if (meta) {
    if (cfg.showMeta && typeof gs !== 'undefined' && typeof CHARACTERS !== 'undefined') {
      const ch = CHARACTERS[gs.character] || CHARACTERS[0];
      meta.innerHTML = '<span>Best: ' + gs.highScore + '</span><span>🪙 ' + gs.wallet + '</span><span>' + ch.name + '</span>';
      meta.style.display = 'flex';
    } else {
      meta.innerHTML = '';
      meta.style.display = 'none';
    }
  }
  if (ver && typeof GAME_VERSION !== 'undefined') ver.textContent = GAME_VERSION;
}

function uiFooterTouch(str) {
  if (!document.body.classList.contains('touch')) return str;
  return str
    .replace(/Enter/g, 'OK')
    .replace(/Esc/g, '←')
    .replace(/WASD\/Flechas/g, '▲▼')
    .replace(/Flechas=Navegar/g, 'Desliza o ◀▶')
    .replace(/Flechas/g, 'Desliza')
    .replace(/Espacio/g, 'OK')
    .replace(/Izq\/Der/g, '◀▶')
    .replace(/Arriba\/Abajo/g, '▲▼')
    .replace(/< Izq\/Der cambiar pista >/g, 'Desliza ◀▶ para cambiar pista');
}
