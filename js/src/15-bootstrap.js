// === 15-bootstrap.js (from index.html lines 2541-2705) ===

// ── Achievements Scene ───────────────────────────────────────────────────────
function updateAchievements(dt){
  if(pressed('Enter')||pressed('Escape')||pressed('Space')) changeScene('menu');
}
function drawAchievements(){
  const desktop = uiIsDesktop();
  uiBgGrad('#0a1018','#101820', false);
  const got=ACHIEVEMENTS.filter(a=>gs.ach[a.id]).length;
  if (desktop) {
    uiDesktopHeader('LOGROS', got + ' / ' + ACHIEVEMENTS.length + ' desbloqueados');
    uiPanel(28, 72, 1224, 580, 18);
    const colW = 580, gap = 24, x0 = 48, y0 = 100;
    ACHIEVEMENTS.forEach((a,i)=>{
      const col = i % 2, row = Math.floor(i / 2);
      const x = x0 + col * (colW + gap), y = y0 + row * 52;
      const on=!!gs.ach[a.id];
      fillRR(x, y - 24, colW, 44, 10, on?'rgba(60,200,90,0.12)':'rgba(255,255,255,0.04)');
      if(on) strokeRR(x, y - 24, colW, 44, 10,'rgba(60,200,90,0.35)',1);
      ctx.textAlign='left'; ctx.font='bold 20px monospace';
      ctx.fillStyle=on?UI.green:'#555'; ctx.fillText('*', x + 8, y);
      ctx.fillStyle=on?UI.bright:'#777'; ctx.fillText(a.name, x + 28, y - 2);
      ctx.font='13px monospace'; ctx.fillStyle=on?UI.dim:'#555'; ctx.fillText(a.desc, x + 28, y + 14);
    });
    hud('Enter / Esc volver', W / 2, H - 14, UI.dim, 13, 'center');
    return;
  }
  uiTitle('LOGROS', 66, 40);
  hud(got+' / '+ACHIEVEMENTS.length+' desbloqueados', W/2, 102, UI.green, 20, 'center');
  uiPanel(W/2-380,118,760,520,18);
  ACHIEVEMENTS.forEach((a,i)=>{
    const y=158+i*58, on=!!gs.ach[a.id];
    fillRR(W/2-350,y-28,700,48,10, on?'rgba(60,200,90,0.12)':'rgba(255,255,255,0.04)');
    if(on) strokeRR(W/2-350,y-28,700,48,10,'rgba(60,200,90,0.35)',1);
    ctx.textAlign='left'; ctx.font='bold 22px monospace';
    ctx.fillStyle=on?UI.green:'#555'; ctx.fillText('*', W/2-338, y);
    ctx.fillStyle=on?UI.bright:'#777'; ctx.fillText(a.name, W/2-310, y-2);
    ctx.font='14px monospace'; ctx.fillStyle=on?UI.dim:'#555'; ctx.fillText(a.desc, W/2-310, y+16);
  });
  uiFooter('Enter / Esc para volver');
}

// ── Main Loop ──────────────────────────────────────────────────────────────
const canvas = document.getElementById('c');
canvas.width = W; canvas.height = H;
ctx = canvas.getContext('2d');

// Scale canvas to window (accounts for mobile chrome: nav bar, safe areas)
function resize() {
  const vv = window.visualViewport;
  let availW = vv ? vv.width : window.innerWidth;
  let availH = vv ? vv.height : window.innerHeight;

  if (document.body.classList.contains('touch')) {
    const bs = getComputedStyle(document.body);
    availW -= (parseFloat(bs.paddingLeft) || 0) + (parseFloat(bs.paddingRight) || 0);
    availH -= (parseFloat(bs.paddingTop) || 0) + (parseFloat(bs.paddingBottom) || 0);

    if (document.body.classList.contains('mob-menu')) {
      const nav = document.getElementById('mobNav');
      const navH = nav && nav.offsetHeight > 0 ? nav.offsetHeight + 8 : 78;
      availH -= navH;
    }
    if (document.body.classList.contains('mob-join')) {
      availH -= 140;
    }
    if (document.body.classList.contains('kart-race') && document.body.classList.contains('playing')) {
      availH -= 76;
    }
  }

  availW = Math.max(200, availW);
  availH = Math.max(160, availH);

  let scale = Math.min(availW / W, availH / H);
  if (document.body.classList.contains('touch') && document.body.classList.contains('playing')
    && window.innerWidth >= window.innerHeight) {
    scale = Math.min(availW / W, availH / H);
  }

  const dw = Math.floor(W * scale);
  const dh = Math.floor(H * scale);
  canvas.style.width = dw + 'px';
  canvas.style.height = dh + 'px';
  if (typeof threeEnsure === 'function') {
    try { threeEnsure()?.resize?.(); } catch (_) {}
  }
}
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 100));
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', resize);
  window.visualViewport.addEventListener('scroll', resize);
}

// ── Touch controls ──────────────────────────────────────────────────────────
// Reuse the same key maps the keyboard handlers feed, so the game logic
// (pressed/held) works identically whether input comes from keys or touch.
function touchPress(code)   { if (!keys[code]) keyDown[code] = true; keys[code] = true; }
function touchRelease(code) { keys[code] = false; keyUp[code] = true; }

function setupTouch() {
  if (isTouchDevice()) document.body.classList.add('touch');

  document.querySelectorAll('#touch .tbtn').forEach(btn => {
    const code = btn.dataset.code;
    const down = e => {
      e.preventDefault();
      btn.classList.add('active');
      audioInit();
      touchPress(code);
      tryImmersive();
    };
    const up = e => {
      e.preventDefault();
      btn.classList.remove('active');
      touchRelease(code);
    };
    btn.addEventListener('pointerdown', down);
    btn.addEventListener('pointerup', up);
    btn.addEventListener('pointercancel', up);
    btn.addEventListener('pointerleave', up);
    btn.addEventListener('contextmenu', e => e.preventDefault());
  });
}

// Go fullscreen + try to lock landscape on the first interaction (best effort).
let immersiveDone = false;
function tryImmersive() {
  if (immersiveDone) return;
  immersiveDone = true;
  const el = document.documentElement;
  (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el).catch?.(() => {});
  screen.orientation?.lock?.('landscape').catch?.(() => {});
}
(function(){
  const inp=document.getElementById('mpCodeInput');
  const btn=document.getElementById('mpJoinBtn');
  if(!inp) return;
  inp.addEventListener('input', ()=>{
    mp.joinBuf=inp.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
    if(inp.value!==mp.joinBuf) inp.value=mp.joinBuf;
    mp.errMsg='';
  });
  inp.addEventListener('keydown', e=>{
    if(e.key==='Enter' && mp.joinBuf.length===6){ e.stopPropagation(); mpGuestJoin(mp.joinBuf); }
  });
  btn?.addEventListener('click', ()=>{
    audioInit();
    if(mp.joinBuf.length===6) mpGuestJoin(mp.joinBuf);
    else mp.errMsg='Codigo de 6 caracteres';
  });
})();

// ── Service worker (offline / installable PWA) ──────────────────────────────
function swActivateUpdate(reg) {
  if (reg.waiting) reg.waiting.postMessage('SKIP_WAITING');
  if (reg.installing) {
    reg.installing.addEventListener('statechange', () => {
      if (reg.installing.state === 'installed' && navigator.serviceWorker.controller) {
        reg.installing.postMessage('SKIP_WAITING');
      }
    });
  }
}

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !gameTestEnabled()) {
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return;
    reloaded = true;
    location.reload();
  });
  window.addEventListener('load', () => {
    const build = (typeof window.__APP_BUILD__ === 'string' && window.__APP_BUILD__) ||
      (typeof GAME_VERSION !== 'undefined' ? GAME_VERSION : 'dev');
    navigator.serviceWorker.register('sw.js?v=' + encodeURIComponent(build)).then(reg => {
      swActivateUpdate(reg);
      reg.update();
      reg.addEventListener('updatefound', () => swActivateUpdate(reg));
      setInterval(() => reg.update(), 60 * 1000);
    }).catch(() => {});
  });
}

let lastTime = 0;
function loop(ts) {
  const dt = Math.min((ts - lastTime)/1000, 0.05);
  lastTime = ts;
  const t = ts/1000;

  updateSceneTrans(dt);
  mobProcessNav();
  mobUiPreUpdate();
  mpCodeInputSync();
  mobUiSync();
  if (typeof ptrCtlFrameSync === 'function') ptrCtlFrameSync();
  if (typeof camOrbitUpdateKeys === 'function') camOrbitUpdateKeys(dt);
  if (typeof threeMobileSync === 'function') threeMobileSync(gs.scene, dt, t);
  ctx.clearRect(0, 0, W, H);

  const scene = renderScene();
  const updating = sceneUpdating();

  if (updating) {
    switch(gs.scene) {
      case 'menu':       updateMenu(dt); break;
      case 'worldmap':   updateWorldMap(dt); break;
      case 'gameplay':   updateGameplay(dt); break;
      case 'pause':      updatePause(dt); break;
      case 'gameover':   updateGameOver(dt); break;
      case 'levelcomplete': updateLevelComplete(dt); break;
      case 'victory':    updateVictory(dt); break;
      case 'settings':   updateSettings(dt); break;
      case 'credits':    updateCredits(dt); break;
      case 'charselect': updateCharSelect(dt); break;
      case 'shop':       updateShop(dt); break;
      case 'achievements': updateAchievements(dt); break;
      case 'pomworld':   updatePomWorld(dt); break;
      case 'bikiworld':  updateBikiWorld(dt); break;
      case 'gallery':    updateGallery(dt); break;
      case 'multimenu':  updateMultiMenu(dt); break;
      case 'mpcreate':   updateMpCreate(dt); break;
      case 'mpjoin':     updateMpJoin(dt); break;
      case 'kartmenu':   updateKartMenu(dt); break;
      case 'kartselect': updateKartSelect(dt); break;
      case 'kartcup':    updateKartCup(dt); break;
      case 'kartcreate': updateKartCreate(dt); break;
      case 'kartjoin':   updateKartJoin(dt); break;
      case 'kartlobby':  updateKartLobby(dt); break;
      case 'kart':       updateKart(dt); break;
      case 'kartresults': updateKartResults(dt); break;
      case 'kartcupresults': updateKartCupResults(dt); break;
    }
    if (mp.active && mp.connected) mpTick(dt);
  }

  switch(scene) {
    case 'menu':          drawMenu(t); break;
    case 'instructions':  drawInstructions(); break;
    case 'worldmap':      drawWorldMap(t); break;
    case 'gameplay':      drawGameplay(t); break;
    case 'pause':         drawPause(); break;
    case 'gameover':      drawGameOver(); break;
    case 'levelcomplete': drawLevelComplete(); break;
    case 'victory':       drawVictory(); break;
    case 'settings':      drawSettings(); break;
    case 'credits':       drawCredits(); break;
    case 'charselect':    drawCharSelect(); break;
    case 'shop':          drawShop(); break;
    case 'achievements':  drawAchievements(); break;
    case 'pomworld':      drawPomWorld(t); break;
    case 'bikiworld':     drawBikiWorld(t); break;
    case 'gallery':       drawGallery(t); break;
    case 'multimenu':     drawMultiMenu(t); break;
    case 'mpcreate':      drawMpCreate(t); break;
    case 'mpjoin':        drawMpJoin(t); break;
    case 'kartmenu':      drawKartMenu(t); break;
    case 'kartselect':    drawKartSelect(t); break;
    case 'kartcup':       drawKartCup(t); break;
    case 'kartcreate':    drawKartCreate(t); break;
    case 'kartjoin':      drawKartJoin(t); break;
    case 'kartlobby':     drawKartLobby(t); break;
    case 'kart':          drawKart(t); break;
    case 'kartresults':   drawKartResults(); break;
    case 'kartcupresults': drawKartCupResults(); break;
  }

  drawSceneTrans();
  clearFrame();
  requestAnimationFrame(loop);
}
