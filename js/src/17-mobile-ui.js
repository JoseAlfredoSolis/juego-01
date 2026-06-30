// ── Mobile UI (touch menus, tap targets, scene chrome) ───────────────────────
const MOB_PLAY_SCENES = ['gameplay', 'kart'];
const MOB_MENU_SCENES = [
  'menu', 'multimenu', 'kartmenu', 'settings', 'shop', 'pause', 'worldmap',
  'charselect', 'achievements', 'kartlobby', 'kartresults', 'gameover',
  'levelcomplete', 'instructions', 'credits', 'mpcreate', 'kartcreate', 'victory',
];
const MOB_JOIN_SCENES = ['mpjoin', 'kartjoin'];
const MOB_NAV_WIDE_SCENES = ['worldmap', 'kartlobby', 'charselect', 'shop'];

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
  if (!document.body.classList.contains('touch')) return;
  const s = gs.scene;
  const playing = MOB_PLAY_SCENES.includes(s);
  const menu = MOB_MENU_SCENES.includes(s);
  const join = MOB_JOIN_SCENES.includes(s);
  document.body.classList.toggle('playing', playing);
  document.body.classList.toggle('mob-menu', menu);
  document.body.classList.toggle('mob-join', join);
  document.body.classList.toggle('mob-nav-wide', MOB_NAV_WIDE_SCENES.includes(s));
  document.body.classList.toggle('kart-race', s === 'kart');
  document.body.classList.toggle('portrait', window.innerHeight > window.innerWidth);
  const nav = document.getElementById('mobNav');
  if (nav) nav.classList.toggle('visible', menu);
  if (!menu) { mobSelGet = null; mobSelSet = null; }
  if (typeof resize === 'function') resize();
}

function mobTouchLand() {
  return document.body.classList.contains('touch')
    && window.innerWidth >= window.innerHeight;
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
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouch) return;

  for (const [id, action] of Object.entries(MOB_BTN_ACTIONS)) {
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
