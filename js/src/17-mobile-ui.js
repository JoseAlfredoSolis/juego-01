// ── Mobile UI (touch menus, tap targets, scene chrome) ───────────────────────
const MOB_PLAY_SCENES = ['gameplay', 'kart'];
const MOB_MENU_SCENES = [
  'menu', 'multimenu', 'kartmenu', 'kartselect', 'kartcup', 'kartcupresults',
  'settings', 'shop', 'pause', 'worldmap', 'pomworld', 'bikiworld', 'gallery',
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
  mobRows.push({ x, y, w, h, idx });
}

function mobRegisterWorldCard(wi, x, y, w, h) {
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
  if (s !== 'settings') mobSettingsResetArm = 0;
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
  document.body.classList.toggle('landscape', !portrait);
  const bJump = document.getElementById('bJump');
  const bSp = document.getElementById('bSp');
  if (bJump) bJump.textContent = s === 'kart' ? 'DRIFT' : 'JUMP';
  if (bSp) bSp.textContent = s === 'kart' ? 'ITEM' : 'SP';
  if (['menu', 'kartmenu', 'kartselect', 'kartlobby', 'kartcup'].includes(s) && typeof threeMobileCanUse === 'function' && threeMobileCanUse()) {
    if (typeof threeEnsure === 'function') threeEnsure();
  }
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

  if (!document.body.classList.contains('touch')) {
    if (MOB_PLAY_SCENES.includes(gs.scene)) return;
    if (dist < MOB_TAP_MAX) {
      const p = canvasPoint(clientX, clientY);
      if (gs.scene === 'worldmap') mobWorldHitTest(p.x, p.y);
      else if (MOB_MENU_SCENES.includes(gs.scene)) {
        const prev = mobSelGet ? mobSelGet() : -1;
        if (mobHitTest(p.x, p.y) && mobSelGet && mobSelGet() === prev) {
          mobTapKey('Enter');
        }
      }
    }
    return;
  }
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

function setupDesktopPointer() {
  const canvas = document.getElementById('c');
  if (!canvas) return;
  canvas.addEventListener('pointerdown', e => {
    if (document.body.classList.contains('touch')) return;
    if (MOB_PLAY_SCENES.includes(gs.scene)) return;
    mobPtr = { x: e.clientX, y: e.clientY, id: e.pointerId };
  });
  canvas.addEventListener('pointerup', e => {
    if (document.body.classList.contains('touch')) return;
    if (!mobPtr || mobPtr.id !== e.pointerId) return;
    mobHandlePointerUp(e.clientX, e.clientY);
  });
  canvas.addEventListener('pointercancel', () => {
    if (!document.body.classList.contains('touch')) mobPtr = null;
  });
}

let mobMenuHtmlScene = '';
let mobKartSelectSel = 0;
let mobSettingsResetArm = 0;

function mobUiHaptic(ms) {
  if (typeof gs !== 'undefined' && gs.vibration && navigator.vibrate) {
    try { navigator.vibrate(ms || 10); } catch (_) {}
  }
}

function mobMenuLabel(key) {
  if (typeof MENU_META !== 'undefined' && MENU_META[key]) return MENU_META[key].title;
  return key;
}

function mobMenuDesc(key) {
  if (typeof MENU_META !== 'undefined' && MENU_META[key]) return MENU_META[key].desc || '';
  return '';
}

function mobGetHtmlMenuConfig() {
  if (!document.body.classList.contains('touch')) return null;
  if (!MOB_MENU_SCENES.includes(gs.scene)) return null;

  if (gs.scene === 'menu' && typeof menuItems !== 'undefined') {
    return {
      type: 'list', theme: 'green', title: 'SUPER BEAR', subtitle: 'ADVENTURE',
      items: menuItems.map(mobMenuLabel),
      itemDescs: menuItems.map(mobMenuDesc),
      sections: typeof MENU_SECTIONS !== 'undefined' ? MENU_SECTIONS : null,
      keys: menuItems,
      getSel: () => menuSel, setSel: v => { menuSel = v; },
      onPick: () => mobQueueAction('ok'), showMeta: true,
    };
  }
  if (gs.scene === 'multimenu' && typeof mpMenuItems !== 'undefined') {
    return {
      type: 'list', theme: 'blue', title: 'JUGAR EN LINEA', subtitle: 'Multijugador',
      items: mpMenuItems, getSel: () => mp.menuSel, setSel: v => { mp.menuSel = v; },
      onPick: () => mobQueueAction('ok'),
    };
  }
  if (gs.scene === 'kartcup' && typeof KART_CUPS !== 'undefined') {
    return {
      type: 'list', theme: 'purple', title: 'MODO COPA', subtitle: '3 carreras · puntos MK',
      items: KART_CUPS.map(c => c.name),
      getSel: () => kartCupSel, setSel: v => { kartCupSel = v; },
      onPick: () => mobQueueAction('ok'),
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
      detail: (st ? 'Clase: ' + st.archetype + ' · ' : '') + 'Toca para cambiar piloto',
      items: ['◀ OTRO PILOTO', 'CONTINUAR', 'VOLVER'],
      getSel: () => mobKartSelectSel, setSel: v => { mobKartSelectSel = v; },
      onPick: idx => {
        if (idx === 0) {
          const unlocked = [];
          for (let i = 0; i < CHARACTERS.length; i++) if (isCharUnlocked(i)) unlocked.push(i);
          const pos = unlocked.indexOf(kartSelectDriver);
          kartSelectDriver = unlocked[(pos - 1 + unlocked.length) % unlocked.length];
          gs.character = kartSelectDriver;
          sfx.select();
          mobMenuHtmlScene = '';
          mobMenuHtmlSync();
        } else if (idx === 1) mobQueueAction('ok');
        else mobQueueAction('back');
      },
    };
  }
  if (gs.scene === 'kartlobby' && typeof KART_TRACKS !== 'undefined') {
    const tr = KART_TRACKS[kartTrackSel];
    return { type: 'kartlobby', theme: 'purple', title: 'PISTA DE CARRERA', subtitle: tr.name, track: tr };
  }
  if (gs.scene === 'worldmap' && typeof worldNames !== 'undefined') {
    const worldLbl = (i) => {
      const sub = typeof worldSubtitles !== 'undefined' ? worldSubtitles[i] : '';
      const tag = gs.worldUnlocked[i] ? '' : ' [bloq]';
      return 'W' + (i + 1) + ' · ' + worldNames[i] + (sub ? ' — ' + sub : '') + tag;
    };
    return {
      type: 'worldmap', theme: 'blue', title: 'MAPA DE MUNDOS',
      subtitle: 'W' + (wmSel + 1) + ' ' + worldNames[wmSel] + ' · Nivel ' + (wmLvl + 1),
      items: worldNames.map((n, i) => worldLbl(i)),
      getSel: () => wmSel,
      setSel: v => { wmSel = v; },
      onPick: idx => {
        if (!gs.worldUnlocked[idx]) { sfx.hurt(); return; }
        wmSel = idx;
        mobMenuHtmlScene = '';
        mobMenuHtmlSync();
      },
    };
  }
  if (gs.scene === 'pause') {
    return {
      type: 'list', theme: 'blue', title: 'PAUSA',
      subtitle: 'W' + (gs.world + 1) + '-' + (gs.level + 1),
      items: ['CONTINUAR', 'REINICIAR NIVEL', 'MENU PRINCIPAL'],
      getSel: () => pauseSel,
      setSel: v => { pauseSel = v; },
      onPick: idx => {
        if (idx === 0) { gs.scene = 'gameplay'; sfx.select(); }
        else if (idx === 1) { startLevel(); gs.scene = 'gameplay'; sfx.select(); }
        else { gs.lives = startLives(); gs.score = 0; gs.coins = 0; changeScene('menu'); menuSel = 0; }
      },
    };
  }
  if (gs.scene === 'settings') {
    const viewLbl = typeof threeCanUse === 'function' && threeCanUse()
      ? (gs.viewMode === '3d' ? '3D' : '2D') : '2D';
    const resetLbl = mobSettingsResetArm
      ? '⚠ Toca otra vez para BORRAR todo'
      : 'Reiniciar progreso';
    return {
      type: 'settings', theme: 'blue', title: 'AJUSTES', subtitle: 'Toca para cambiar',
      items: [
        'Sonido: ' + (audio.sound ? 'ON' : 'OFF'),
        'Música: ' + (audio.music ? 'ON' : 'OFF'),
        'Dificultad: ' + diff().name,
        'Vista: ' + viewLbl,
        'Sacudida: ' + (gs.fxShake ? 'ON' : 'OFF'),
        'Partículas: ' + (gs.fxParticles ? 'ON' : 'OFF'),
        'Vibración: ' + (gs.vibration ? 'ON' : 'OFF'),
        resetLbl,
        '← VOLVER AL MENÚ',
      ],
      onPick: idx => {
        if (idx === 0) { audio.sound = !audio.sound; }
        else if (idx === 1) { audio.music = !audio.music; if (audio.music) musicStart(); else musicStop(); }
        else if (idx === 2) { gs.difficulty = (gs.difficulty + 1) % DIFFICULTIES.length; }
        else if (idx === 3 && threeCanUse()) {
          gs.viewMode = gs.viewMode === '3d' ? '2d' : '3d';
          if (gs.viewMode === '2d') threeDisable();
        }
        else if (idx === 4) { gs.fxShake = !gs.fxShake; }
        else if (idx === 5) { gs.fxParticles = !gs.fxParticles; }
        else if (idx === 6) { gs.vibration = !gs.vibration; }
        else if (idx === 7) {
          if (!mobSettingsResetArm) {
            mobSettingsResetArm = 1;
            sfx.hurt();
            mobMenuHtmlScene = '';
            mobMenuHtmlSync();
            return;
          }
          resetProgress();
          mobSettingsResetArm = 0;
          saveGame();
          changeScene('menu');
          return;
        }
        else if (idx === 8) { mobSettingsResetArm = 0; saveGame(); changeScene('menu'); return; }
        mobSettingsResetArm = 0;
        sfx.select(); saveGame();
        mobMenuHtmlScene = ''; mobMenuHtmlSync();
      },
    };
  }
  if (gs.scene === 'shop' && typeof buildShop === 'function') {
    const list = buildShop();
    return {
      type: 'shop', theme: 'orange', title: 'TIENDA',
      subtitle: '🪙 ' + gs.wallet + ' monedas',
      detail: list.length ? 'Toca un artículo para comprar' : '¡Todo comprado!',
      items: list.length
        ? list.map(o => o.label + ' — ' + o.cost + ' 🪙')
        : ['Volver al menú'],
      shopList: list,
      getSel: () => shopSel,
      setSel: v => { shopSel = v; },
      onPick: idx => {
        if (!list.length) { changeScene('menu'); return; }
        shopSel = idx;
        buyShop(list[idx]);
        mobMenuHtmlScene = '';
        mobMenuHtmlSync();
      },
    };
  }
  if (gs.scene === 'gameover') {
    return {
      type: 'list', theme: 'orange', title: 'GAME OVER',
      subtitle: 'Puntos: ' + gs.score + ' · Monedas: ' + gs.coins,
      detail: 'Récord: ' + gs.highScore,
      items: ['REINTENTAR', 'MENÚ PRINCIPAL'],
      getSel: () => goSel, setSel: v => { goSel = v; },
      onPick: idx => {
        if (idx === 0) { gs.lives = startLives(); startLevel(); changeScene('gameplay'); }
        else { gs.lives = startLives(); gs.score = 0; gs.coins = 0; changeScene('menu'); menuSel = 0; }
      },
    };
  }
  if (gs.scene === 'levelcomplete') {
    const stars = lcStats.time < 25 ? 3 : lcStats.time < 45 ? 2 : 1;
    return {
      type: 'list', theme: 'green', title: '¡NIVEL COMPLETO!',
      subtitle: 'Mundo ' + (lcStats.world + 1) + ' · Nivel ' + (lcStats.level + 1),
      detail: '★'.repeat(stars) + '☆'.repeat(3 - stars) + ' · Score ' + gs.score,
      items: ['CONTINUAR'],
      onPick: () => { sfx.select(); advanceLevel(); },
    };
  }
  if (gs.scene === 'victory') {
    return {
      type: 'list', theme: 'green', title: '¡VICTORIA!',
      subtitle: 'Completaste los ' + WORLD_COUNT + ' mundos',
      detail: 'Score final: ' + gs.score + ' · Récord: ' + gs.highScore,
      items: ['VOLVER AL MENÚ'],
      onPick: () => {
        gs.lives = startLives(); gs.score = 0; gs.coins = 0; gs.world = 0; gs.level = 0;
        changeScene('menu'); menuSel = 0;
      },
    };
  }
  if (gs.scene === 'achievements' && typeof ACHIEVEMENTS !== 'undefined') {
    const got = ACHIEVEMENTS.filter(a => gs.ach[a.id]).length;
    return {
      type: 'list', theme: 'blue', title: 'LOGROS',
      subtitle: got + ' / ' + ACHIEVEMENTS.length + ' desbloqueados',
      items: ACHIEVEMENTS.map(a => (gs.ach[a.id] ? '✓ ' : '○ ') + a.name),
      itemDescs: ACHIEVEMENTS.map(a => a.desc),
      onPick: () => changeScene('menu'),
    };
  }
  if (gs.scene === 'charselect' && typeof CHARACTERS !== 'undefined') {
    const ch = CHARACTERS[charSel];
    const unlocked = isCharUnlocked(charSel);
    return {
      type: 'list', theme: 'green', title: 'PERSONAJES',
      subtitle: ch.name,
      detail: unlocked ? ch.desc : 'Bloqueado — gana monedas o compra en tienda',
      items: CHARACTERS.map((c, i) => (isCharUnlocked(i) ? '' : '🔒 ') + c.name),
      getSel: () => charSel,
      setSel: v => { charSel = v; },
      onPick: idx => {
        charSel = idx;
        if (isCharUnlocked(idx)) {
          gs.character = idx;
          saveGame();
          sfx.select();
          changeScene('menu');
        } else {
          sfx.hurt();
          mobMenuHtmlScene = '';
          mobMenuHtmlSync();
        }
      },
    };
  }
  if (gs.scene === 'gallery' && typeof CHARACTERS !== 'undefined') {
    const c = CHARACTERS[gallerySel];
    const unlocked = isCharUnlocked(gallerySel);
    return {
      type: 'list', theme: 'blue', title: 'GALERÍA DE HÉROES',
      subtitle: c.name,
      detail: (unlocked ? '' : 'Bloqueado · ') + c.desc,
      items: CHARACTERS.map((ch, i) => (isCharUnlocked(i) ? '' : '🔒 ') + ch.name),
      getSel: () => gallerySel,
      setSel: v => { gallerySel = v; },
      onPick: idx => {
        gallerySel = idx;
        sfx.select();
        mobMenuHtmlScene = '';
        mobMenuHtmlSync();
      },
    };
  }
  if (gs.scene === 'instructions') {
    return {
      type: 'list', theme: 'green', title: 'INSTRUCCIONES', subtitle: 'Controles y mecánicas',
      items: [
        'Moverse — ◀ ▶ o A D',
        'Saltar — Espacio / ▲ / W',
        'Doble salto — Power-up + Espacio',
        'Especial — J / SP (único por héroe)',
        'Pisar enemigos — Salta encima',
        'Checkpoint — Bandera verde',
        'Pausa — Esc / II',
        'Monedas 50 pts · Estrellas 200 pts',
        'Multijugador — Código de 6 letras',
        '← VOLVER AL MENÚ',
      ],
      onPick: idx => {
        if (idx >= 9) changeScene('menu');
      },
    };
  }
  if (gs.scene === 'credits') {
    return {
      type: 'list', theme: 'blue', title: 'CRÉDITOS',
      subtitle: 'Super Bear Adventure',
      items: [
        'Diseño y programación',
        'Motor HTML5 + canvas',
        'Gráficos y audio procedurales',
        'Controles táctiles PWA',
        '¡Gracias por jugar!',
        '← VOLVER AL MENÚ',
      ],
      onPick: idx => { if (idx >= 5) changeScene('menu'); },
    };
  }
  if (gs.scene === 'kartresults' && race) {
    const sorted = [...race.karts].sort((a, b) => a.rank - b.rank);
    return {
      type: 'list', theme: 'purple', title: 'RESULTADOS',
      subtitle: sorted[0] ? 'Ganador: ' + sorted[0].name : '',
      items: sorted.map((k, i) => {
        const medal = i === 0 ? '🥇 ' : i === 1 ? '🥈 ' : i === 2 ? '🥉 ' : (i + 1) + '. ';
        const me = k.idx === kartLocalIdx() ? ' (TÚ)' : '';
        const time = k.dnf ? 'DNF' : (k.finished ? k.finishTime.toFixed(2) + 's' : '—');
        return medal + k.name + me + ' · ' + time;
      }).concat(['VOLVER']),
      onPick: idx => {
        if (idx >= sorted.length) {
          race = null;
          changeScene(mp.active ? 'kartlobby' : 'kartmenu');
        }
      },
    };
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
  if (root) {
    root.classList.toggle('theme-purple', show && cfg?.theme === 'purple');
    root.classList.toggle('theme-blue', show && cfg?.theme === 'blue');
    root.classList.toggle('theme-orange', show && cfg?.theme === 'orange');
  }

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
  if (cfg.type === 'kartlobby' && subEl && typeof KART_TRACKS !== 'undefined') {
    subEl.textContent = KART_TRACKS[kartTrackSel].name;
  }

  if (mobMenuHtmlScene !== gs.scene) {
    mobMenuHtmlScene = gs.scene;
    list.innerHTML = '';

    if (cfg.type === 'kartlobby') {
      if (mp.role === 'guest') {
        const wait = document.createElement('p');
        wait.className = 'mmh-wait';
        wait.textContent = 'Esperando al anfitrión para iniciar...';
        list.appendChild(wait);
      } else {
      const diff = document.createElement('button');
      diff.type = 'button'; diff.className = 'mmh-item';
      diff.textContent = 'IA: ' + (typeof kartDiff === 'function' ? kartDiff().name : 'NORMAL');
      diff.addEventListener('click', e => {
        e.preventDefault();
        kartDifficulty = (kartDifficulty + 1) % (typeof KART_DIFFICULTIES !== 'undefined' ? KART_DIFFICULTIES.length : 4);
        sfx.select();
        mobMenuHtmlScene = '';
        mobMenuHtmlSync();
      });
      list.appendChild(diff);
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
        if (mp.role === 'guest') return;
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
      }
    } else if (cfg.type === 'worldmap') {
      cfg.items.forEach((label, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'mmh-item';
        btn.textContent = label;
        if (idx === wmSel) btn.classList.add('sel');
        btn.addEventListener('click', e => {
          e.preventDefault();
          if (cfg.onPick) cfg.onPick(idx);
        });
        list.appendChild(btn);
      });
      const sep = document.createElement('p');
      sep.className = 'mmh-sub';
      sep.style.marginTop = '10px';
      sep.textContent = 'Elegir nivel';
      list.appendChild(sep);
      for (let lv = 0; lv < 3; lv++) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'mmh-item';
        const done = gs.levelDone[wmSel]?.[lv];
        btn.textContent = (done ? '★ ' : '') + 'NIVEL ' + (lv + 1);
        if (lv === wmLvl) btn.classList.add('sel');
        btn.addEventListener('click', e => {
          e.preventDefault();
          if (!gs.worldUnlocked[wmSel]) return;
          wmLvl = lv; gs.world = wmSel; gs.level = lv;
          sfx.select(); mobQueueAction('ok');
        });
        list.appendChild(btn);
      }
    } else if (cfg.items) {
      const appendItem = (label, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mmh-item';
        btn.dataset.idx = String(idx);
        if (cfg.itemDescs?.[idx]) {
          btn.innerHTML = label + '<span class="mmh-desc">' + cfg.itemDescs[idx] + '</span>';
        } else {
          btn.textContent = label;
        }
        if (cfg.type === 'shop' && cfg.shopList?.[idx]) {
          const afford = gs.wallet >= cfg.shopList[idx].cost;
          btn.classList.toggle('mmh-afford', afford);
          btn.classList.toggle('mmh-locked', !afford);
        }
        if (cfg.keys?.[idx] === 'GALERIA' || label.startsWith('🔒')) btn.classList.toggle('mmh-locked', label.startsWith('🔒'));
        btn.addEventListener('click', e => {
          e.preventDefault();
          mobUiHaptic(12);
          if (cfg.setSel) cfg.setSel(idx);
          sfx.select();
          if (cfg.onPick) cfg.onPick(idx);
        });
        list.appendChild(btn);
      };
      if (cfg.sections?.length && cfg.keys) {
        for (let s = 0; s < cfg.sections.length; s++) {
          const sec = cfg.sections[s];
          const nextStart = s + 1 < cfg.sections.length ? cfg.sections[s + 1].start : cfg.items.length;
          const head = document.createElement('p');
          head.className = 'mmh-section';
          head.textContent = sec.label;
          list.appendChild(head);
          for (let i = sec.start; i < nextStart; i++) appendItem(cfg.items[i], i);
        }
      } else {
        cfg.items.forEach((label, idx) => appendItem(label, idx));
      }
    }
  }

  if (gs.scene === 'gallery' && typeof CHARACTERS !== 'undefined' && subEl) {
    subEl.textContent = CHARACTERS[gallerySel].name;
    if (detail) {
      const unlocked = isCharUnlocked(gallerySel);
      detail.textContent = (unlocked ? '' : 'Bloqueado · ') + CHARACTERS[gallerySel].desc;
    }
  } else if (gs.scene === 'charselect' && typeof CHARACTERS !== 'undefined' && subEl) {
    subEl.textContent = CHARACTERS[charSel].name;
    if (detail) {
      detail.textContent = isCharUnlocked(charSel)
        ? CHARACTERS[charSel].desc
        : 'Bloqueado — gana monedas o compra en tienda';
    }
  } else if (gs.scene === 'shop' && subEl) {
    subEl.textContent = '🪙 ' + gs.wallet + ' monedas';
  }

  if (cfg.getSel) {
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
