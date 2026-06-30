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
let mobSelGet = null;
let mobSelSet = null;

function mobRegisterRow(x, y, w, h, idx) {
  if (!document.body.classList.contains('touch')) return;
  mobRows.push({ x, y, w, h, idx });
}

function mobClearRows() {
  mobRows.length = 0;
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
  const nav = document.getElementById('mobNav');
  if (nav) nav.classList.toggle('visible', menu);
  if (!menu) { mobSelGet = null; mobSelSet = null; }
}

function mobUiPreUpdate() {
  mobClearRows();
}

function setupMobileUi() {
  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouch) return;

  const map = {
    mobBack: 'Escape',
    mobLeft: 'ArrowLeft',
    mobUp: 'ArrowUp',
    mobDown: 'ArrowDown',
    mobRight: 'ArrowRight',
    mobOk: 'Enter',
  };
  for (const [id, code] of Object.entries(map)) {
    const btn = document.getElementById(id);
    if (!btn) continue;
    const down = e => { e.preventDefault(); btn.classList.add('active'); mobTapKey(code); };
    const up = e => { e.preventDefault(); btn.classList.remove('active'); };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
  }

  canvas.addEventListener('pointerup', e => {
    if (!document.body.classList.contains('touch')) return;
    if (MOB_PLAY_SCENES.includes(gs.scene) || MOB_JOIN_SCENES.includes(gs.scene)) return;
    if (!MOB_MENU_SCENES.includes(gs.scene)) return;
    const p = canvasPoint(e.clientX, e.clientY);
    mobHitTest(p.x, p.y);
  });
}

function uiFooterTouch(str) {
  if (!document.body.classList.contains('touch')) return str;
  return str
    .replace(/Enter/g, 'OK')
    .replace(/Esc/g, '←')
    .replace(/WASD\/Flechas/g, '▲▼')
    .replace(/Flechas/g, '▲▼')
    .replace(/Espacio/g, 'OK')
    .replace(/Izq\/Der/g, '◀▶')
    .replace(/Arriba\/Abajo/g, '▲▼');
}
