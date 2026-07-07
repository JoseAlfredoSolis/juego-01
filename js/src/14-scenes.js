// === 14-scenes.js (from index.html lines 1981-2540) ===

function drawHUD(t) {
  // Top bar with rounded bottom edge
  fillRR(8,8,W-16,52,14,'rgba(8,12,20,0.82)');
  strokeRR(8,8,W-16,52,14,'rgba(255,215,0,0.2)',1);
  // Lives as heart icons
  for(let i=0;i<Math.min(player.lives,8);i++) drawHeartIcon(28+i*22, 18, 10);
  if(player.lives>8) hud('+'+(player.lives-8), 28+8*22, 36, UI.red, 14);
  // Score center
  hud('SCORE '+gs.score, W/2, 38, UI.bright, 20, 'center');
  // Coins right
  drawCoinIcon(W-52, 28, 11); hud(''+gs.coins, W-28, 38, UI.gold, 20, 'right');
  // Bottom info bar
  fillRR(8,H-52,W-16,40,12,'rgba(8,12,20,0.72)');
  strokeRR(8,H-52,W-16,40,12,'rgba(255,255,255,0.1)',1);
  uiPill(18,H-28, 'W'+(gs.world+1)+'-'+(gs.level+1), UI.cyan);
  hud('TIME '+gameTimer.toFixed(1)+'s', W/2, H-26, UI.cyan, 16, 'center');
  const ch = CHARACTERS[gs.character]||CHARACTERS[0];
  uiPill(W-130,H-28, ch.name, UI.gold);
  if(mp.active && mp.connected){
    fillRR(W/2-70, 62, 140, 22, 8, 'rgba(0,180,255,0.35)');
    hud('ONLINE · '+mp.remoteName, W/2, 74, '#7df', 13, 'center');
  }
  // Power-up bar
  if (player.power) {
    const pw=150, px2=W-pw-20, py2=H-78;
    hud(player.power.toUpperCase(), W-20, py2-4, UI.bright, 13, 'right');
    const pc = player.power==='djump'?UI.cyan:player.power==='speed'?UI.green:UI.gold;
    uiBar(px2,py2,pw,10,player.powerTimer/10,pc);
  }
  // Special cooldown
  if (ch.special) {
    const ready=player.sp<=0, bw=130;
    hud('SP '+ch.special.name, 18, H-78, ready?UI.green:UI.dim, 13);
    uiBar(18,H-64,bw,9, ready?1:1-(player.sp/ch.special.cd), ready?UI.green:'#fa0');
  }
  if (player.respawnTimer>0) {
    fillRR(0,0,W,H,0,'rgba(0,0,0,0.55)'); uiTitle('RESPAWNING...',H/2,36,UI.bright);
  }
}

// ── Multiplayer scenes ─────────────────────────────────────────────────────
const mpMenuItems=['CREAR SALA','UNIRSE A SALA','VOLVER'];

function updateMultiMenu(dt) {
  mobBindMenu(() => mp.menuSel, v => { mp.menuSel = v; });
  mobBindSwipe(dir => {
    const n = mpMenuItems.length;
    if (dir === 'up') mp.menuSel = (mp.menuSel - 1 + n) % n;
    if (dir === 'down') mp.menuSel = (mp.menuSel + 1) % n;
  });
  const n=mpMenuItems.length;
  if (pressed('ArrowUp')||pressed('KeyW'))   { mp.menuSel=(mp.menuSel-1+n)%n; sfx.select(); }
  if (pressed('ArrowDown')||pressed('KeyS')) { mp.menuSel=(mp.menuSel+1)%n; sfx.select(); }
  if (pressed('Enter')||pressed('Space')) {
    sfx.select();
    const it=mpMenuItems[mp.menuSel];
    if (it==='CREAR SALA') { mpHostCreate(); changeScene('mpcreate'); mp.createT=0; }
    else if (it==='UNIRSE A SALA') { mp.joinBuf=''; mp.errMsg=''; changeScene('mpjoin'); }
    else if (it==='VOLVER') { mpDisconnect(); changeScene('menu'); }
  }
  if (pressed('Escape')) { mpDisconnect(); changeScene('menu'); }
}

function drawMultiMenu(t) {
  if (document.body.classList.contains('mob-menu-html')) {
    if (!document.body.classList.contains('three-menu')) uiBgGrad('#0a1428', '#1a2848');
    return;
  }
  uiBgGrad('#0a1428','#1a2848'); uiSparkles(t*0.6, 20);
  const lay = mobMenuLayout(mpMenuItems.length);
  if (lay.mode !== 'desktop') {
    uiTitle('JUGAR EN LINEA', lay.mode === 'port' ? 52 : 72, lay.mode === 'port' ? 30 : 40);
    if (lay.mode === 'land') hud('Invita amigos y explorad juntos', W/2, 128, UI.dim, 15, 'center');
    uiPanel(W/2 - lay.pw/2, lay.py, lay.pw, lay.ph, 14);
    for (let i=0;i<mpMenuItems.length;i++) uiMenuRow(mpMenuItems[i], lay.startY + i*lay.rowH, i===mp.menuSel, lay.rw, lay.rh, i);
    uiFooter('▲▼ · OK confirmar');
  } else {
    uiTitle('JUGAR EN LINEA', 90, 44);
    hud('Invita amigos y explorad juntos el mismo nivel', W/2, 138, UI.dim, 17, 'center');
    uiPanel(W/2-220, 170, 440, 280, 18);
    for (let i=0;i<mpMenuItems.length;i++) uiMenuRow(mpMenuItems[i], 230+i*62, i===mp.menuSel, 400, 48, i);
    hud('El anfitrion elige el mundo · ambos ven al otro en pantalla', W/2, 490, UI.cyan, 15, 'center');
    uiFooter('Enter · Esc volver');
  }
}

function updateMpCreate(dt) {
  mp.createT+=dt;
  if (mp.autoJoin) return;
  if (pressed('KeyC')||(pressed('Enter')&&!mp.connected)) mpCopyInvite();
  if (mp.connected && (pressed('Space')||pressed('Enter'))) {
    gs.lives=startLives(); gs.score=0; gs.coins=0;
    changeScene('worldmap'); wmSel=0; wmLvl=0;
  }
  if (pressed('Escape')) { mpDisconnect(); changeScene('multimenu'); }
}

function drawMpCreate(t) {
  uiBgGrad('#0a2010','#1a4030'); uiSparkles(t*0.5, 16);
  uiTitle('SALA CREADA', 80, 40);
  uiPanel(W/2-280, 130, 560, 380, 20);
  if (mp.roomCode) {
    hud('CODIGO DE SALA', W/2, 175, UI.dim, 16, 'center');
    uiTitle(mp.roomCode, 230, 72, UI.gold);
    hud('Comparte este codigo o el enlace con tu amigo', W/2, 310, UI.bright, 17, 'center');
  }
  const pulse=0.7+Math.sin(t*4)*0.3;
  ctx.globalAlpha=pulse;
  hud(mp.connected ? 'Amigo conectado — Enter para ir al mapa' : 'Esperando amigo...', W/2, 360, mp.connected?UI.green:UI.cyan, 18, 'center');
  ctx.globalAlpha=1;
  hud(mp.status, W/2, 400, UI.dim, 15, 'center');
  if (mp.errMsg) hud(mp.errMsg, W/2, 430, UI.red, 15, 'center');
  uiBtn(W/2-120, 450, 240, 48, 'COPIAR INVITACION', true);
  hud('C / Enter = copiar enlace', W/2, 520, UI.dim, 14, 'center');
  uiFooter('Esc = volver');
}

function updateMpJoin(dt) {
  if (mp.autoJoin && typeof Peer!=='undefined' && !mp.active) {
    mp.autoJoin=false; mpGuestJoin(mp.joinBuf);
  }
  mpJoinKeys();
  if (pressed('Escape')) { mpDisconnect(); changeScene('multimenu'); }
}

function drawMpJoin(t) {
  uiBgGrad('#140a28','#281848'); uiSparkles(t*0.4, 14);
  uiTitle('UNIRSE A SALA', 90, 40);
  uiPanel(W/2-260, 150, 520, 320, 18);
  hud('Escribe el codigo de 6 letras', W/2, 195, UI.dim, 17, 'center');
  const code=(mp.joinBuf+'______').slice(0,6).split('').map((c,i)=>mp.joinBuf[i]||'_').join(' ');
  uiTitle(code, 240, 64, mp.joinBuf.length===6?UI.green:UI.gold);
  hud(mp.status||'Toca el cuadro para escribir · 6 caracteres', W/2, 320, UI.bright, 16, 'center');
  if (mp.joinAttempt>0 && !mp.connected) hud('Reintentando conexion...', W/2, 290, UI.cyan, 14, 'center');
  if (mp.errMsg) hud(mp.errMsg, W/2, 360, UI.red, 16, 'center');
  if (mp.connected) hud('Conectado — espera a que el anfitrion elija nivel', W/2, 400, UI.green, 17, 'center');
  uiFooter('Enter unirse · Esc volver');
}

// ── Menu Scene ─────────────────────────────────────────────────────────────
let menuSel=0, menuT=0;
const menuItems=['PLAY','KART RACE','POMERANIA','PECERA','GALERIA','MULTIJUGADOR','CHARACTER','TIENDA','LOGROS','INSTRUCTIONS','SETTINGS','CREDITS'];
const MENU_SECTIONS = [
  { label: 'JUGAR', start: 0 },
  { label: 'TU PERFIL', start: 4 },
  { label: 'MÁS OPCIONES', start: 9 },
];
const MENU_META = {
  'PLAY':          { title: 'AVENTURA',       desc: 'Mapa de mundos y niveles' },
  'KART RACE':     { title: 'KART RACE',      desc: 'Carreras arcade multijugador' },
  'POMERANIA':     { title: 'POMERANIA',      desc: 'Mundo especial de perros' },
  'PECERA':        { title: 'BIKINI PECERA',  desc: 'Fondo del mar y casas de piña' },
  'GALERIA':       { title: 'GALERÍA',        desc: 'Todos los héroes del juego' },
  'MULTIJUGADOR':  { title: 'MULTIJUGADOR',   desc: 'Jugar en línea con amigos' },
  'CHARACTER':     { title: 'PERSONAJES',     desc: 'Elegir tu héroe' },
  'TIENDA':        { title: 'TIENDA',         desc: 'Comprar héroes y mejoras' },
  'LOGROS':        { title: 'LOGROS',         desc: 'Medallas y retos' },
  'INSTRUCTIONS':  { title: 'INSTRUCCIONES',  desc: 'Controles y mecánicas' },
  'SETTINGS':      { title: 'AJUSTES',        desc: 'Audio, gráficos y dificultad' },
  'CREDITS':       { title: 'CRÉDITOS',       desc: 'Equipo y agradecimientos' },
};

function drawMenuHeroPanel(t) {
  const px = 28, py = 64, pw = 400, ph = 592;
  uiPanel(px, py, pw, ph, 22);
  const ch = CHARACTERS[gs.character] || CHARACTERS[0];
  const bob = Math.sin(t * 2.2) * 6;
  const cx = px + pw / 2, cy = py + 200 + bob;

  uiGlowCircle(cx, cy, 88, ch.color || UI.gold, t);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(4.8, 4.8);
  ch.draw({ facing: 1, power: null, invTimer: 0 }, -PLAYER_W / 2, -PLAYER_H / 2);
  ctx.restore();

  uiTitle('SUPER BEAR', py + 52, 44);
  hud('ADVENTURE', cx, py + 92, '#fff', 22, 'center');

  const sy = py + 340;
  uiPanel(px + 20, sy, pw - 40, 220, 16, 'rgba(0,0,0,0.35)', 'rgba(255,255,255,0.1)');
  hud('TU PARTIDA', px + 36, sy + 28, UI.cyan, 14, 'left');
  hud('Héroe: ' + ch.name, px + 36, sy + 54, UI.gold, 17, 'left');
  hud('Récord: ' + gs.highScore, px + 36, sy + 78, UI.bright, 16, 'left');
  uiWalletBadge(px + 130, sy + 108, gs.wallet);
  uiBadge(px + pw - 56, sy + 108, 'Dif. ' + diff().name, diff().color, 'rgba(0,0,0,0.45)');

  let cleared = 0;
  for (let w = 0; w < WORLD_COUNT; w++) if (gs.levelDone[w].every(Boolean)) cleared++;
  const unlocked = typeof worldsUnlockedCount === 'function' ? worldsUnlockedCount() : 1;
  hud('Mundos: ' + unlocked + '/' + WORLD_COUNT + ' · Completos: ' + cleared, px + 36, sy + 148, UI.dim, 14, 'left');
  uiBar(px + 36, sy + 162, pw - 72, 8, cleared / WORLD_COUNT, UI.green);
  hud('Plataformas 2D/3D · PWA', px + 36, sy + 192, UI.dim, 13, 'left');
}

function drawMenuDesktop(t) {
  uiDesktopHeader('SUPER BEAR ADVENTURE', 'Menú principal · PC');
  drawMenuHeroPanel(t);

  const rx = 440, ry = 64, rw = 820, rh = 592;
  uiPanel(rx, ry, rw, rh, 22);
  hud('MENÚ PRINCIPAL', rx + rw / 2, ry + 32, UI.gold, 22, 'center');
  uiWalletBadge(rx + rw - 100, ry + 32, gs.wallet);

  const tileX = rx + 24, tileW = rw - 48, tileH = 44, colW = Math.floor((tileW - 12) / 2);
  let y = ry + 52;
  for (let s = 0; s < MENU_SECTIONS.length; s++) {
    const sec = MENU_SECTIONS[s];
    const nextStart = s + 1 < MENU_SECTIONS.length ? MENU_SECTIONS[s + 1].start : menuItems.length;
    uiSectionLabel(tileX, y + 12, sec.label);
    y += 22;
    let col = 0;
    for (let i = sec.start; i < nextStart; i++) {
      const key = menuItems[i];
      const meta = MENU_META[key] || { title: key, desc: '' };
      const cx = tileX + col * (colW + 12);
      uiMenuTile(cx, y, colW, tileH, meta.title, meta.desc, i === menuSel, i);
      col++;
      if (col >= 2) { col = 0; y += tileH + 6; }
    }
    if (col > 0) y += tileH + 6;
    y += 10;
  }

  const selKey = menuItems[menuSel];
  const selMeta = MENU_META[selKey] || { title: selKey, desc: '' };
  fillRR(rx + 20, ry + rh - 62, rw - 40, 48, 12, 'rgba(255,215,0,0.08)');
  strokeRR(rx + 20, ry + rh - 62, rw - 40, 48, 12, 'rgba(255,215,0,0.25)', 1);
  hud('Enter · ' + selMeta.title + (selMeta.desc ? ' — ' + selMeta.desc : ''), rx + rw / 2, ry + rh - 32, UI.bright, 15, 'center');
  hud('Clic en una opción · Flechas ▲▼ · Enter confirmar', rx + rw / 2, H - 14, UI.dim, 13, 'center');
}

function updateMenu(dt) {
  mobBindMenu(() => menuSel, v => { menuSel = v; });
  mobBindSwipe(dir => {
    const n = menuItems.length;
    if (dir === 'up') menuSel = (menuSel - 1 + n) % n;
    if (dir === 'down') menuSel = (menuSel + 1) % n;
  });
  menuT+=dt;
  const n=menuItems.length;
  if (pressed('ArrowUp')||pressed('KeyW'))   { menuSel=(menuSel-1+n)%n; sfx.select(); }
  if (pressed('ArrowDown')||pressed('KeyS')) { menuSel=(menuSel+1)%n; sfx.select(); }
  if (pressed('Enter')||pressed('Space')) {
    sfx.select();
    const it=menuItems[menuSel];
    if (it==='PLAY')             { gs.lives=startLives(); gs.score=0; gs.coins=0; changeScene('worldmap'); wmSel=gs.world; wmLvl=0; }
    else if (it==='KART RACE')   { kartMenuSel=0; mp.gameMode='kart'; changeScene('kartmenu'); }
    else if (it==='POMERANIA')   { pomT=0; changeScene('pomworld'); }
    else if (it==='PECERA')      { bikiT=0; changeScene('bikiworld'); }
    else if (it==='GALERIA')     { gallerySel=0; galleryT=0; changeScene('gallery'); }
    else if (it==='MULTIJUGADOR'){ mp.menuSel=0; mp.gameMode='platformer'; mp.joinBuf=''; mp.errMsg=''; changeScene('multimenu'); }
    else if (it==='CHARACTER')   { changeScene('charselect'); charSel=gs.character; charT=0; }
    else if (it==='TIENDA')      { changeScene('shop'); shopSel=0; }
    else if (it==='LOGROS')      { changeScene('achievements'); }
    else if (it==='INSTRUCTIONS'){ changeScene('instructions'); }
    else if (it==='SETTINGS')    { changeScene('settings'); setSel=0; }
    else if (it==='CREDITS')     { changeScene('credits'); creditT=0; }
  }
}

function drawMenu(t) {
  const useHtml = document.body.classList.contains('mob-menu-html');
  const use3d = document.body.classList.contains('three-menu');
  if (!useHtml && !use3d) uiBgGrad('#0a2010','#1a5c1a');
  if (!useHtml) uiSparkles(t);
  const lay = mobMenuLayout(menuItems.length);
  const bob = Math.sin(t * 2) * (lay.mode !== 'desktop' ? 4 : 8);

  if (lay.mode !== 'desktop') {
    if (document.body.classList.contains('mob-menu-html')) {
      if (!document.body.classList.contains('three-menu')) uiBgGrad('#0a2010', '#1a5c1a');
      return;
    }
    const t1 = lay.mode === 'port' ? 48 : 68;
    const t2 = lay.mode === 'port' ? 78 : 112;
    uiTitle('SUPER BEAR', t1 + bob, lay.mode === 'port' ? 28 : 40);
    uiTitle('ADVENTURE', t2 + bob, lay.mode === 'port' ? 22 : 30, '#fff');
    if (lay.mode === 'land') hud('Plataformas 2D · PWA movil', W / 2, 142 + bob, UI.dim, 15, 'center');
    uiPanel(W / 2 - lay.pw / 2, lay.py, lay.pw, lay.ph, 14);
    for (let i = 0; i < menuItems.length; i++) {
      uiMenuRow(mobMenuLabel(menuItems[i]), lay.startY + i * lay.rowH, i === menuSel, lay.rw, lay.rh, i);
    }
    uiPill(12, 22, 'Best: ' + gs.highScore, UI.cyan);
    uiWalletBadge(100, 48, gs.wallet);
    uiPill(12, 64, CHARACTERS[gs.character].name, UI.gold);
    uiFooter('▲▼ navegar · OK confirmar');
  } else {
    drawMenuDesktop(t);
    return;
  }
  hud(GAME_VERSION, W - 12, H - 12, 'rgba(255,255,255,0.4)', 13, 'right');
}

function drawBearSil(x,y,s) {
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.fillRect(x,y,s*0.7,s); // body
  ctx.fillRect(x-s*0.1,y-s*0.35,s*0.9,s*0.4); // head
  ctx.fillRect(x-s*0.15,y-s*0.5,s*0.25,s*0.2); // ear l
  ctx.fillRect(x+s*0.5,y-s*0.5,s*0.25,s*0.2); // ear r
}

// ── Instructions ───────────────────────────────────────────────────────────
function updateInstructions() {
  if (pressed('Enter') || pressed('Escape')) changeScene('menu');
}
function drawInstructions() {
  if (document.body.classList.contains('mob-menu-html')) return;
  uiBgGrad('#0a180a','#0d2b0d', false);
  uiTitle('INSTRUCCIONES', 72, 40);
  uiPanel(W/2-340, 95, 680, 560, 18);
  const lines=[
    ['MOVER','← → / A D'],['SALTAR','Espacio / W / ↑'],
    ['DOBLE SALTO','Power-up Doble Salto + Espacio'],
    ['ESPECIAL','J / Shift — único por personaje'],
    ['PISAR','Salta sobre enemigos para eliminarlos'],
    ['CHECKPOINT','Bandera verde: reapareces ahí'],
    ['PELIGROS','Pinchos y sierras (dash/escudo protege)'],
    ['PAUSA','Esc / P'],['',''],
    ['MONEDAS','50 pts · Estrellas 200 pts'],['ENEMIGOS','100 pts · Jefe 1000 pts'],
    ['TIPOS','Patrulla, perseguidor, volador, saltarín'],
    ['+ TIPOS','Cazador · Blindado · Mini-jefe'],
    ['META','Bandera verde → 500 pts'],['',''],
    ['ONLINE','Multijugador: sala o código 6 letras'],
    ['INVITAR','Copia el enlace — mismo nivel'],
    ['POWER-UPS','2x=Doble salto · →→=Velocidad · ★=Invencible'],
  ];
  ctx.textAlign='left'; ctx.font='18px monospace';
  lines.forEach(([k,v],i)=>{
    if(!k && !v) return;
    ctx.fillStyle=UI.gold; ctx.fillText(k,W/2-300,118+i*34);
    ctx.fillStyle=UI.bright; ctx.fillText(v,W/2-60,118+i*34);
  });
  uiFooter('Enter / Esc para volver');
}

// ── Pomeranian World Screen ─────────────────────────────────────────────────
let pomT = 0;
function updatePomWorld(dt) {
  pomT += dt;
  if (!gs.ach) gs.ach = {};
  gs.ach.pomworld = true;
  mobBindMenu(() => pomMenuSel, v => { pomMenuSel = v; });
  mobBindSwipe(dir => {
    if (dir === 'up') pomMenuSel = (pomMenuSel - 1 + 3) % 3;
    if (dir === 'down') pomMenuSel = (pomMenuSel + 1) % 3;
  });
  if (pressed('ArrowUp') || pressed('KeyW')) { pomMenuSel = (pomMenuSel - 1 + 3) % 3; sfx.select(); }
  if (pressed('ArrowDown') || pressed('KeyS')) { pomMenuSel = (pomMenuSel + 1) % 3; sfx.select(); }
  if (pressed('Escape')) { changeScene('menu'); return; }
  if (pressed('Enter') || pressed('Space')) {
    sfx.select();
    if (!gs.ach) gs.ach = {};
    gs.ach.pomworld = true;
    if (pomMenuSel === 0) {
      if (gs.worldUnlocked[POM_WORLD]) {
        wmSel = POM_WORLD; wmLvl = 0; gs.world = POM_WORLD; gs.level = 0;
        gs.lives = startLives(); gs.score = 0; gs.coins = 0;
        startLevel(); changeScene('gameplay');
      } else {
        showBanner('Completa COSMOS primero', '#f80');
      }
    } else if (pomMenuSel === 1) { gallerySel = 17; changeScene('gallery'); }
    else changeScene('menu');
  }
}
let pomMenuSel = 0;
function drawPomWorld(t) {
  uiBgGrad('#ffe8c8', '#ff9a50');
  const portrait = typeof mobTouchPortrait === 'function' && mobTouchPortrait();
  for (let i = 0; i < 30; i++) {
    const x = (i * 97 + t * 40) % W, y = 60 + (i * 53) % 500;
    ctx.globalAlpha = 0.25 + 0.15 * Math.sin(t * 2 + i);
    ctx.fillStyle = i % 2 ? '#ffb870' : '#fff5e8';
    ctx.beginPath(); ctx.arc(x, y, 8 + (i % 5) * 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }
  uiTitle('MUNDO POMERANIAN', portrait ? 52 : 70, portrait ? 34 : 44);
  hud('Reino de los perros peludos', W / 2, portrait ? 88 : 108, '#e87830', portrait ? 16 : 20, 'center');
  uiPanel(W / 2 - (portrait ? 300 : 340), portrait ? 100 : 130, portrait ? 600 : 680, portrait ? 340 : 400, 22);
  const pomChars = [17, 18, 19, 20];
  for (let i = 0; i < pomChars.length; i++) {
    const ci = pomChars[i];
    const c = CHARACTERS[ci];
    const col = i % 2, row = Math.floor(i / 2);
    const px = portrait ? W / 2 - 120 + col * 140 : W / 2 - 240 + i * 130;
    const py = portrait ? 155 + row * 95 : 200;
    fillRR(px - 50, py - 30, 100, portrait ? 100 : 120, 14, 'rgba(255,255,255,0.12)');
    if (c?.draw) {
      ctx.save();
      ctx.translate(px, py + (portrait ? 12 : 20));
      if (portrait) ctx.scale(0.85, 0.85);
      c.draw({ facing: 1 }, 0, 0);
      ctx.restore();
    }
    ctx.fillStyle = isCharUnlocked(ci) ? UI.bright : UI.dim;
    ctx.font = 'bold ' + (portrait ? 11 : 13) + 'px monospace'; ctx.textAlign = 'center';
    ctx.fillText(c?.name || '?', px, py + (portrait ? 58 : 72));
  }
  hud('4 nuevos personajes · 3 niveles de jardin', W / 2, portrait ? 268 : 310, UI.cyan, portrait ? 13 : 16, 'center');
  const opts = ['JUGAR MUNDO POMERANIAN', 'VER EN GALERIA', 'VOLVER AL MENU'];
  const lay = mobMenuLayout(opts.length);
  for (let i = 0; i < opts.length; i++) {
    const y = (portrait ? 290 : lay.startY) + i * (portrait ? 32 : lay.rowH);
    const sel = i === pomMenuSel;
    const rw = portrait ? Math.min(lay.rw, W - 48) : lay.rw;
    const rh = portrait ? 28 : lay.rh;
    fillRR(W / 2 - rw / 2, y - rh / 2, rw, rh, 12, sel ? 'rgba(255,154,64,0.35)' : 'rgba(0,0,0,0.25)');
    if (sel) strokeRR(W / 2 - rw / 2, y - rh / 2, rw, rh, 12, '#ff9a40', 2);
    hud(opts[i], W / 2, y + 4, sel ? '#ffd700' : UI.bright, portrait ? 14 : 18, 'center');
    mobRegisterRow(W / 2 - rw / 2, y - rh / 2, rw, rh, i);
  }
  const unlocked = gs.worldUnlocked[POM_WORLD];
  hud(unlocked ? 'Mundo desbloqueado — ¡listo para jugar!' : 'Bloqueado: completa el mundo COSMOS', W / 2, portrait ? H - 88 : 470, unlocked ? UI.green : UI.dim, portrait ? 12 : 15, 'center');
  uiFooter(portrait ? 'Toca opcion · Desliza ▲▼' : 'Enter = elegir · Esc = volver');
}

// ── Bikini / Pecera World Screen ────────────────────────────────────────────
let bikiT = 0, bikiMenuSel = 0;
function updateBikiWorld(dt) {
  bikiT += dt;
  if (!gs.ach) gs.ach = {};
  gs.ach.bikiworld = true;
  mobBindMenu(() => bikiMenuSel, v => { bikiMenuSel = v; });
  mobBindSwipe(dir => {
    if (dir === 'up') bikiMenuSel = (bikiMenuSel - 1 + 3) % 3;
    if (dir === 'down') bikiMenuSel = (bikiMenuSel + 1) % 3;
  });
  if (pressed('ArrowUp') || pressed('KeyW')) { bikiMenuSel = (bikiMenuSel - 1 + 3) % 3; sfx.select(); }
  if (pressed('ArrowDown') || pressed('KeyS')) { bikiMenuSel = (bikiMenuSel + 1) % 3; sfx.select(); }
  if (pressed('Escape')) { changeScene('menu'); return; }
  if (pressed('Enter') || pressed('Space')) {
    sfx.select();
    if (!gs.ach) gs.ach = {};
    gs.ach.bikiworld = true;
    if (bikiMenuSel === 0) {
      if (gs.worldUnlocked[BIKI_WORLD]) {
        wmSel = BIKI_WORLD; wmLvl = 0; gs.world = BIKI_WORLD; gs.level = 0;
        gs.lives = startLives(); gs.score = 0; gs.coins = 0;
        startLevel(); changeScene('gameplay');
      } else {
        showBanner('Completa POMERANIAN primero', '#48c8f0');
      }
    } else if (bikiMenuSel === 1) { gallerySel = 30; changeScene('gallery'); }
    else changeScene('menu');
  }
}
function drawBikiWorld(t) {
  uiBgGrad('#0a5898', '#1a88c8');
  const portrait = typeof mobTouchPortrait === 'function' && mobTouchPortrait();
  for (let i = 0; i < 40; i++) {
    const x = (i * 73 + t * 25) % W, y = 40 + (i * 61) % 560;
    ctx.globalAlpha = 0.15 + 0.12 * Math.sin(t * 2.5 + i);
    ctx.strokeStyle = '#bff'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x, y, 3 + (i % 4) * 2, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
  for (let i = 0; i < 6; i++) {
    const hx = 80 + i * 200 + Math.sin(t + i) * 8, hy = portrait ? 118 : 140;
    ctx.fillStyle = '#e8a820'; ctx.beginPath(); ctx.ellipse(hx, hy, 22, 32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3aba48'; ctx.fillRect(hx - 16, hy - 42, 32, 12);
    ctx.fillStyle = '#2a9a38'; ctx.fillRect(hx - 6, hy - 52, 12, 10);
  }
  uiTitle('BIKINI PECERA', portrait ? 52 : 70, portrait ? 34 : 44);
  hud('Fondo del mar — casas de piña y roca', W / 2, portrait ? 88 : 108, '#bff', portrait ? 16 : 20, 'center');
  uiPanel(W / 2 - (portrait ? 300 : 340), portrait ? 100 : 130, portrait ? 600 : 680, portrait ? 340 : 400, 22);
  const bikiChars = [30, 31, 32, 33];
  for (let i = 0; i < bikiChars.length; i++) {
    const ci = bikiChars[i];
    const c = CHARACTERS[ci];
    const col = i % 2, row = Math.floor(i / 2);
    const px = portrait ? W / 2 - 120 + col * 140 : W / 2 - 240 + i * 130;
    const py = portrait ? 155 + row * 95 : 200;
    fillRR(px - 50, py - 30, 100, portrait ? 100 : 120, 14, 'rgba(0,80,140,0.35)');
    if (c?.draw) {
      ctx.save();
      ctx.translate(px, py + (portrait ? 12 : 20));
      if (portrait) ctx.scale(0.85, 0.85);
      c.draw({ facing: 1 }, 0, 0);
      ctx.restore();
    }
    ctx.fillStyle = isCharUnlocked(ci) ? UI.bright : UI.dim;
    ctx.font = 'bold ' + (portrait ? 11 : 13) + 'px monospace'; ctx.textAlign = 'center';
    ctx.fillText(c?.name || '?', px, py + (portrait ? 58 : 72));
  }
  hud('4 vecinos del fondo · 3 niveles submarinos', W / 2, portrait ? 268 : 310, UI.cyan, portrait ? 13 : 16, 'center');
  const opts = ['JUGAR MUNDO PECERA', 'VER EN GALERIA', 'VOLVER AL MENU'];
  const lay = mobMenuLayout(opts.length);
  for (let i = 0; i < opts.length; i++) {
    const y = (portrait ? 290 : lay.startY) + i * (portrait ? 32 : lay.rowH);
    const sel = i === bikiMenuSel;
    const rw = portrait ? Math.min(lay.rw, W - 48) : lay.rw;
    const rh = portrait ? 28 : lay.rh;
    fillRR(W / 2 - rw / 2, y - rh / 2, rw, rh, 12, sel ? 'rgba(72,200,240,0.35)' : 'rgba(0,0,0,0.25)');
    if (sel) strokeRR(W / 2 - rw / 2, y - rh / 2, rw, rh, 12, '#48c8f0', 2);
    hud(opts[i], W / 2, y + 4, sel ? '#ffd700' : UI.bright, portrait ? 14 : 18, 'center');
    mobRegisterRow(W / 2 - rw / 2, y - rh / 2, rw, rh, i);
  }
  const unlocked = gs.worldUnlocked[BIKI_WORLD];
  hud(unlocked ? 'Mundo desbloqueado — ¡Estoy listo!' : 'Bloqueado: completa POMERANIAN', W / 2, portrait ? H - 88 : 470, unlocked ? UI.green : UI.dim, portrait ? 12 : 15, 'center');
  uiFooter(portrait ? 'Toca opcion · Desliza ▲▼' : 'Enter = elegir · Esc = volver');
}

// ── Character Gallery ───────────────────────────────────────────────────────
let gallerySel = 0, galleryT = 0;

function drawHeroDesktopGrid(sel, t, gx, gy, gw, gh, label) {
  uiPanel(gx, gy, gw, gh, 18);
  uiSectionLabel(gx + 16, gy + 24, label || 'HÉROES');
  const cols = 6, cw = 88, ch = 76, pad = 14, startY = gy + 42;
  for (let i = 0; i < CHARACTERS.length; i++) {
    const col = i % cols, row = Math.floor(i / cols);
    const x = gx + pad + col * (cw + 8), y = startY + row * (ch + 8);
    if (y + ch > gy + gh - 10) break;
    const on = i === sel, ok = isCharUnlocked(i);
    const c = CHARACTERS[i];
    fillRR(x, y, cw, ch, 12, on ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.04)');
    if (on) strokeRR(x, y, cw, ch, 12, UI.gold, 2);
    else if (ok) strokeRR(x, y, cw, ch, 12, 'rgba(255,255,255,0.1)', 1);
    if (c?.draw) {
      ctx.save();
      ctx.translate(x + cw / 2, y + 36);
      ctx.scale(0.72, 0.72);
      const sil = !ok && !c.shopOnly && !c.shopPrice;
      if (!sil) {
        c.draw({ facing: 1 }, -PLAYER_W / 2, -PLAYER_H / 2);
        if (!ok) { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H); }
      } else {
        ctx.fillStyle = '#2b3240'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H);
      }
      ctx.restore();
    }
    ctx.textAlign = 'center'; ctx.font = 'bold 9px monospace';
    ctx.fillStyle = on ? UI.gold : ok ? UI.bright : UI.dim;
    const nm = (c?.name || '?').slice(0, 10);
    ctx.fillText(nm, x + cw / 2, y + ch - 8);
    mobRegisterRow(x, y, cw, ch, i);
  }
}

function drawHeroDesktopDetail(sel, t, rx, ry, rw, rh, opts) {
  const ch = CHARACTERS[sel];
  const unlocked = isCharUnlocked(sel);
  const bob = Math.sin(t * 3) * 6;
  uiPanel(rx, ry, rw, rh, 20);
  hud(opts?.title || 'DETALLE', rx + rw / 2, ry + 28, UI.cyan, 15, 'center');

  const previewY = ry + 200 + bob;
  uiGlowCircle(rx + rw / 2, previewY, 80, ch?.color || UI.gold, t);
  ctx.save();
  ctx.translate(rx + rw / 2, previewY);
  ctx.scale(4.6, 4.6);
  const showSil = !unlocked && !ch.shopOnly && !ch.shopPrice;
  if (!showSil && ch?.draw) {
    ch.draw({ facing: 1 }, -PLAYER_W / 2, -PLAYER_H / 2);
    if (!unlocked) { ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H); }
  } else {
    ctx.fillStyle = '#2b3240'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H);
  }
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.font = 'bold 26px monospace';
  ctx.fillStyle = unlocked ? UI.gold : UI.dim;
  ctx.fillText(ch?.name || '?', rx + rw / 2, ry + 72);

  if (opts?.pick && gs.character === sel) {
    uiBadge(rx + rw / 2, ry + 98, 'EN USO', UI.green, 'rgba(20,60,30,0.7)');
  } else {
    uiBadge(rx + rw / 2, ry + 98, unlocked ? 'DESBLOQUEADO' : 'BLOQUEADO', unlocked ? UI.green : UI.red,
      unlocked ? 'rgba(20,60,30,0.65)' : 'rgba(60,20,20,0.55)');
  }

  if (unlocked) {
    drawStatBar(rx + 36, ry + 320, rw - 72, ch.speed, 'VEL', UI.green);
    drawStatBar(rx + 36, ry + 348, rw - 72, ch.jump, 'SAL', UI.cyan);
    if (ch?.special) hud('★ ' + ch.special.name, rx + rw / 2, ry + 382, ch.color || UI.cyan, 15, 'center');
    hud(ch?.desc || '', rx + rw / 2, ry + 408, UI.bright, 14, 'center');
    if (opts?.pick) {
      fillRR(rx + 24, ry + rh - 58, rw - 48, 44, 12, 'rgba(255,215,0,0.12)');
      hud('Enter · Elegir a ' + ch.name, rx + rw / 2, ry + rh - 30, UI.gold, 15, 'center');
    }
  } else {
    let lockTxt = 'Completa ' + (ch?.unlock || 0) + ' mundo(s)';
    if (ch?.shopOnly) lockTxt = '★ Tienda · ' + charShopCost(ch) + ' monedas';
    else if (ch?.shopPrice) lockTxt = 'Tienda · ' + charShopCost(ch) + ' monedas';
    hud(lockTxt, rx + rw / 2, ry + 360, UI.gold, 15, 'center');
  }
  uiPager(rx + rw / 2, ry + rh - 78, sel, CHARACTERS.length);
}

function updateGallery(dt) {
  galleryT += dt;
  mobBindMenu(() => gallerySel, v => { gallerySel = v; });
  mobBindSwipe(dir => {
    const n = CHARACTERS.length;
    if (dir === 'left') gallerySel = (gallerySel - 1 + n) % n;
    if (dir === 'right') gallerySel = (gallerySel + 1) % n;
  });
  if (pressed('ArrowLeft') || pressed('KeyA')) { gallerySel = (gallerySel - 1 + CHARACTERS.length) % CHARACTERS.length; sfx.select(); }
  if (pressed('ArrowRight') || pressed('KeyD')) { gallerySel = (gallerySel + 1) % CHARACTERS.length; sfx.select(); }
  if (pressed('Escape') || pressed('Enter')) { changeScene('menu'); }
}
function drawGallery(t) {
  if (document.body.classList.contains('mob-menu-html')) return;
  const portrait = typeof mobTouchPortrait === 'function' && mobTouchPortrait();
  const desktop = uiIsDesktop();
  uiBgGrad('#0a1420', '#1a2840');
  uiSparkles(t * 0.4, 24);

  if (desktop) {
    uiDesktopHeader('GALERÍA DE HÉROES', 'Todos los personajes del juego');
    uiWalletBadge(W - 110, 36, gs.wallet);
    drawHeroDesktopGrid(gallerySel, t, 24, 64, 760, 592, 'COLECCIÓN');
    drawHeroDesktopDetail(gallerySel, t, 800, 64, 456, 592, { title: 'FICHA' });
    hud('Clic en héroe · ◀▶ navegar · Esc volver', W / 2, H - 14, UI.dim, 13, 'center');
    return;
  }

  uiTitle('GALERIA DE HEROES', portrait ? 48 : 58, portrait ? 28 : 36);
  uiWalletBadge(W - 110, portrait ? 38 : 42, gs.wallet);

  const c = CHARACTERS[gallerySel];
  const unlocked = isCharUnlocked(gallerySel);
  const pw = portrait ? 600 : 640, ph = portrait ? 400 : 390;
  const px = W / 2 - pw / 2, py = portrait ? 92 : 108;
  uiPanel(px, py, pw, ph, 20);

  const previewY = py + (portrait ? 155 : 165) + Math.sin(t * 2.5) * 6;
  uiGlowCircle(W / 2, previewY, portrait ? 58 : 68, c?.color || UI.gold, t);
  if (c?.draw) {
    ctx.save();
    ctx.translate(W / 2, previewY);
    ctx.scale(portrait ? 2.0 : 2.4, portrait ? 2.0 : 2.4);
    c.draw({ facing: 1 }, -PLAYER_W / 2, -PLAYER_H / 2);
    if (!unlocked) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H); }
    ctx.restore();
  }

  uiNavBtn(px + 14, py + 120, 48, 48, '◀', true);
  uiNavBtn(px + pw - 62, py + 120, 48, 48, '▶', true);
  if (document.body.classList.contains('touch')) {
    mobRegisterRow(px + 14, py + 120, 48, 48, (gallerySel - 1 + CHARACTERS.length) % CHARACTERS.length);
    mobRegisterRow(px + pw - 62, py + 120, 48, 48, (gallerySel + 1) % CHARACTERS.length);
  }

  hud(c?.name || '?', W / 2, py + 28, unlocked ? UI.gold : UI.dim, portrait ? 24 : 28, 'center');
  uiBadge(W / 2, py + ph - 108, unlocked ? 'DESBLOQUEADO' : 'BLOQUEADO', unlocked ? UI.green : UI.red,
    unlocked ? 'rgba(20,60,30,0.65)' : 'rgba(60,20,20,0.55)');

  const bx = W / 2 - (portrait ? 140 : 160), bw = portrait ? 280 : 320;
  drawStatBar(bx, py + ph - 82, bw, c?.speed || 1, 'VEL', UI.green);
  drawStatBar(bx, py + ph - 58, bw, c?.jump || 1, 'SAL', UI.cyan);
  hud(c?.desc || '', W / 2, py + ph - 34, UI.bright, portrait ? 14 : 15, 'center');
  if (c?.special) hud('★ ' + c.special.name, W / 2, py + ph - 14, c.color || UI.cyan, portrait ? 12 : 13, 'center');

  if (!unlocked) {
    const lockTxt = c?.shopOnly ? '★ Tienda · ' + charShopCost(c) + ' monedas' :
      charInShop(gallerySel) ? 'Tienda · ' + charShopCost(c) + ' monedas' :
      'Mundos: ' + (c?.unlock || 0) + '+ o tienda · ' + charShopCost(c) + ' mon';
    hud(lockTxt, W / 2, py + ph + 18, UI.gold, portrait ? 12 : 13, 'center');
  }

  uiPager(W / 2, py + ph + (unlocked ? 18 : 40), gallerySel, CHARACTERS.length);
  drawCharThumbStrip(W / 2, py + ph + (unlocked ? 58 : 80), gallerySel, CHARACTERS.length, portrait ? 7 : 11);
  uiFooter(portrait ? 'Toca ◀▶ o desliza · Esc volver' : '◀▶ cambiar · Enter/Esc volver');
}

// ── World Map ──────────────────────────────────────────────────────────────
let wmSel=0, wmLvl=0;
const worldNames=['FOREST','CAVE','SNOW','LAVA','SKY','VALLE','OCEAN','DESERT','CRYSTAL','COSMOS','POMERANIAN','BIKINI'];
const worldSubtitles=['Bosque','Cueva','Nieve','Lava','Cielo','Valle','Océano','Desierto','Cristal','Cosmos','Pomerania','Pecera'];
const worldColors=[
  ['#2d6e1a','#1a4010'],['#2a3f5a','#0d1b2a'],['#6090b0','#3060a0'],
  ['#7a2418','#3a0d08'],['#5a86c0','#2b4f7a'],['#a08030','#6a5018'],
  ['#2a8a9a','#145a70'],['#d4a850','#a07828'],['#9a60e0','#5a28a0'],['#6a70c0','#2a3068'],
  ['#ffb870','#e87830'],['#48c8f0','#2088c0']
];
const worldHints=['','','','','','Valle: exploración tranquila','Ocean: corales y corrientes','Desert: arenas movedizas','Crystal: rayos láser','Cosmos: gravedad baja','Pomeranian: jardines peludos','Bikini: casas de piña y burbujas'];
const WORLD_MAP_ROW_LABELS = [
  { title: 'Región inicial', sub: 'W1 – W4' },
  { title: 'Región avanzada', sub: 'W5 – W8' },
  { title: 'Finales y especiales', sub: 'W9 – W12' },
];

function worldMapUseDesktopLayout() {
  return uiIsDesktop() && W >= 1100;
}

function worldMapDesktopMetrics() {
  const px = 20, py = 98, pw = 792, ph = 556;
  const pad = 16, gapX = 10, gapY = 14, labelH = 22;
  const cols = 4;
  const cardW = Math.floor((pw - pad * 2 - gapX * (cols - 1)) / cols);
  const cardH = 108;
  return { px, py, pw, ph, pad, gapX, gapY, labelH, cols, cardW, cardH };
}

function worldMapDesktopCardRect(wi) {
  const m = worldMapDesktopMetrics();
  let row = 0, col = 0;
  for (let r = 0; r < WORLD_MAP_LAYOUT.length; r++) {
    const c = WORLD_MAP_LAYOUT[r].indexOf(wi);
    if (c >= 0) { row = r; col = c; break; }
  }
  const rowBlock = m.labelH + m.gapY + m.cardH + 18;
  const x = m.px + m.pad + col * (m.cardW + m.gapX);
  const y = m.py + m.pad + 28 + row * rowBlock;
  return { x, y, w: m.cardW, h: m.cardH, cx: x + m.cardW / 2, cy: y + m.cardH / 2, row, col };
}

function worldMapCardRect(wi) {
  if (worldMapUseDesktopLayout()) return worldMapDesktopCardRect(wi);
  const cardW = 192, cardH = 130, gapX = 14, gapY = 14, startY = 112;
  let row = 0, col = 0, cols = 4;
  for (let r = 0; r < WORLD_MAP_LAYOUT.length; r++) {
    const c = WORLD_MAP_LAYOUT[r].indexOf(wi);
    if (c >= 0) { row = r; col = c; cols = WORLD_MAP_LAYOUT[r].length; break; }
  }
  const rowW = cols * cardW + (cols - 1) * gapX;
  const x = (W - rowW) / 2 + col * (cardW + gapX);
  const y = startY + row * (cardH + gapY);
  return { x, y, w: cardW, h: cardH, cx: x + cardW / 2, cy: y + cardH / 2, row, col };
}

function worldMapGridNav(wi, dir) {
  let row = 0, col = 0;
  for (let r = 0; r < WORLD_MAP_LAYOUT.length; r++) {
    const c = WORLD_MAP_LAYOUT[r].indexOf(wi);
    if (c >= 0) { row = r; col = c; break; }
  }
  const cur = WORLD_MAP_LAYOUT[row];
  if (dir === 'left') {
    if (col > 0) return cur[col - 1];
    if (row > 0) { const prev = WORLD_MAP_LAYOUT[row - 1]; return prev[Math.min(col, prev.length - 1)]; }
    return wi;
  }
  if (dir === 'right') {
    if (col < cur.length - 1) return cur[col + 1];
    if (row < WORLD_MAP_LAYOUT.length - 1) { const next = WORLD_MAP_LAYOUT[row + 1]; return next[Math.min(col, next.length - 1)]; }
    return wi;
  }
  if (dir === 'up') {
    if (row === 0) return wi;
    const prev = WORLD_MAP_LAYOUT[row - 1];
    return prev[Math.min(col, prev.length - 1)];
  }
  if (dir === 'down') {
    if (row >= WORLD_MAP_LAYOUT.length - 1) return wi;
    const next = WORLD_MAP_LAYOUT[row + 1];
    return next[Math.min(col, next.length - 1)];
  }
  return wi;
}

function worldsUnlockedCount() {
  let n = 0;
  for (let i = 0; i < WORLD_COUNT; i++) if (gs.worldUnlocked[i]) n++;
  return n;
}

function drawWorldIcon(wi, cx, cy, s) {
  const [c1] = worldColors[wi];
  ctx.fillStyle = c1;
  if (wi === 0) { ctx.fillRect(cx - s, cy, s * 2, s * 0.5); ctx.fillRect(cx - s * 0.4, cy - s, s * 0.8, s); }
  else if (wi === 1) { ctx.fillRect(cx - s, cy - s * 0.2, s * 2, s * 0.7); fillRR(cx - s * 0.5, cy - s, s, s * 0.8, 4, c1); }
  else if (wi === 2) { ctx.fillRect(cx - s * 1.1, cy, s * 2.2, s * 0.35); ctx.fillRect(cx - s * 0.35, cy - s * 0.9, s * 0.7, s * 0.9); }
  else if (wi === 3) { ctx.fillRect(cx - s, cy - s * 0.15, s * 2, s * 0.55); ctx.fillStyle = '#ff6020'; ctx.fillRect(cx - s * 0.25, cy - s * 0.55, s * 0.5, s * 0.45); }
  else if (wi === 4) { ctx.fillStyle = '#fff'; ctx.fillRect(cx - s, cy - s * 0.5, s * 2, s * 0.35); ctx.fillStyle = c1; ctx.fillRect(cx - s * 0.5, cy - s * 0.15, s, s * 0.65); }
  else if (wi === 5) { ctx.fillRect(cx - s * 1.1, cy, s * 2.2, s * 0.3); ctx.fillRect(cx - s * 0.25, cy - s, s * 0.5, s); }
  else if (wi === 6) { ctx.fillStyle = '#1a8aaa'; ctx.fillRect(cx - s * 1.1, cy - s * 0.1, s * 2.2, s * 0.45); ctx.fillStyle = '#5ad4ff'; ctx.fillRect(cx - s * 0.2, cy - s * 0.55, s * 0.4, s * 0.5); }
  else if (wi === 7) { ctx.fillStyle = '#e8c060'; ctx.fillRect(cx - s * 1.1, cy, s * 2.2, s * 0.35); ctx.fillStyle = c1; ctx.fillRect(cx - s * 0.2, cy - s * 0.7, s * 0.4, s * 0.75); }
  else if (wi === 8) { ctx.fillStyle = '#c8f'; ctx.fillRect(cx - s * 0.15, cy - s, s * 0.3, s * 1.1); ctx.fillRect(cx - s * 0.65, cy - s * 0.35, s * 0.3, s * 0.75); ctx.fillRect(cx + s * 0.35, cy - s * 0.55, s * 0.3, s * 0.95); }
  else if (wi === 9) { ctx.fillStyle = '#aaf'; for (let i = 0; i < 5; i++) { const a = i * 1.25; ctx.fillRect(cx + Math.cos(a) * s - 2, cy + Math.sin(a) * s * 0.5 - 2, 4, 4); } ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(cx, cy, s * 0.45, 0, Math.PI * 2); ctx.fill(); }
  else if (wi === 10) { ctx.fillStyle = '#ffe8c8'; ctx.fillRect(cx - s * 0.55, cy - s * 0.15, s * 1.1, s * 0.55); ctx.fillStyle = c1; ctx.fillRect(cx - s * 0.35, cy - s * 0.65, s * 0.7, s * 0.55); ctx.fillStyle = '#111'; ctx.fillRect(cx - s * 0.12, cy - s * 0.45, 4, 4); }
  else if (wi === 11) {
    ctx.fillStyle = '#1a88c8'; ctx.fillRect(cx - s, cy + s * 0.15, s * 2, s * 0.35);
    ctx.fillStyle = '#e8a820'; ctx.beginPath(); ctx.ellipse(cx, cy - s * 0.05, s * 0.38, s * 0.52, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3aba48'; ctx.fillRect(cx - s * 0.28, cy - s * 0.58, s * 0.56, s * 0.18);
  }
}

function drawWorldMapCard(wi, t) {
  if (worldMapUseDesktopLayout()) {
    drawWorldMapDesktopTile(wi, t);
    return;
  }
  const { x, y, w, h, cx, cy, row } = worldMapCardRect(wi);
  const locked = !gs.worldUnlocked[wi], sel = wi === wmSel;
  const [c1, c2] = worldColors[wi];
  if (sel) { ctx.shadowColor = 'rgba(255,215,0,0.4)'; ctx.shadowBlur = 18; }
  fillRR(x, y, w, h, 14, locked ? '#1e2430' : c2);
  if (!locked) {
    const cg = ctx.createLinearGradient(x, y, x, y + h);
    cg.addColorStop(0, c1); cg.addColorStop(1, c2);
    fillRR(x, y, w, h, 14, cg);
  }
  ctx.shadowBlur = 0;
  strokeRR(x, y, w, h, 14, sel ? UI.gold : 'rgba(255,255,255,0.14)', sel ? 3 : 1);
  if (!locked) mobRegisterWorldCard(wi, x, y, w, h);

  uiBadge(x + 28, y + 16, 'W' + (wi + 1), sel ? UI.gold : UI.dim, 'rgba(0,0,0,0.45)');
  drawWorldIcon(wi, cx, cy - 8, 16);

  ctx.textAlign = 'center';
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = locked ? '#666' : UI.bright;
  ctx.fillText(worldNames[wi], cx, y + h - 28);
  ctx.font = '12px monospace';
  ctx.fillStyle = locked ? '#555' : 'rgba(255,255,255,0.75)';
  ctx.fillText(worldSubtitles[wi], cx, y + h - 12);

  if (locked) {
    ctx.fillStyle = UI.dim; ctx.font = 'bold 11px monospace';
    ctx.fillText('BLOQ', cx, cy + 10);
  } else {
    const doneCount = gs.levelDone[wi].filter(Boolean).length;
    if (doneCount === 3) uiBadge(cx, y + h - 44, '★ COMPLETO', UI.gold, 'rgba(0,0,0,0.5)');
    else if (doneCount > 0) uiBadge(cx, y + h - 44, doneCount + '/3', UI.cyan, 'rgba(0,0,0,0.45)');
  }
}

function drawWorldMapDesktopTile(wi, t) {
  const { x, y, w, h, cx, cy } = worldMapDesktopCardRect(wi);
  const locked = !gs.worldUnlocked[wi], sel = wi === wmSel;
  const [c1, c2] = worldColors[wi];
  const bob = sel ? Math.sin(t * 4) * 2 : 0;

  if (sel) { ctx.shadowColor = 'rgba(255,215,0,0.5)'; ctx.shadowBlur = 22; }
  fillRR(x, y + bob, w, h, 16, locked ? '#1a2030' : c2);
  if (!locked) {
    const cg = ctx.createLinearGradient(x, y, x + w, y + h);
    cg.addColorStop(0, c1); cg.addColorStop(1, c2);
    fillRR(x, y + bob, w, h, 16, cg);
  }
  ctx.shadowBlur = 0;
  strokeRR(x, y + bob, w, h, 16, sel ? UI.gold : 'rgba(255,255,255,0.12)', sel ? 3 : 1);
  if (sel) fillRR(x, y + bob, 5, h, 3, UI.gold);
  mobRegisterWorldCard(wi, x, y + bob, w, h);

  uiBadge(x + 32, y + bob + 16, 'W' + (wi + 1), sel ? UI.gold : 'rgba(255,255,255,0.85)', 'rgba(0,0,0,0.55)');
  drawWorldIcon(wi, cx, cy + bob - 10, 18);

  ctx.textAlign = 'center';
  ctx.font = 'bold 13px monospace';
  ctx.fillStyle = locked ? '#666' : UI.bright;
  ctx.fillText(worldNames[wi], cx, y + bob + h - 36);
  ctx.font = '11px monospace';
  ctx.fillStyle = locked ? '#555' : 'rgba(255,255,255,0.78)';
  ctx.fillText(locked ? 'Bloqueado' : worldSubtitles[wi], cx, y + bob + h - 22);

  if (locked) {
    ctx.font = '18px monospace'; ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillText('🔒', cx, cy + bob + 14);
  } else {
    for (let lv = 0; lv < 3; lv++) {
      const dx = cx - 22 + lv * 22, dy = y + bob + h - 10;
      const done = gs.levelDone[wi][lv], lvsel = sel && lv === wmLvl;
      ctx.beginPath(); ctx.arc(dx, dy, lvsel ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = done ? UI.gold : lvsel ? UI.green : 'rgba(255,255,255,0.3)';
      ctx.fill();
      if (lvsel) { ctx.strokeStyle = UI.gold; ctx.lineWidth = 2; ctx.stroke(); }
      if (done) {
        ctx.fillStyle = '#111'; ctx.font = 'bold 9px monospace';
        ctx.fillText('★', dx, dy + 3);
      }
    }
  }
}

function drawWorldMapDesktopGrid(t) {
  const m = worldMapDesktopMetrics();
  uiPanel(m.px, m.py, m.pw, m.ph, 20);
  hud('MUNDOS', m.px + 24, m.py + 28, UI.gold, 15, 'left');

  for (let r = 0; r < WORLD_MAP_LAYOUT.length; r++) {
    const rowBlock = m.labelH + m.gapY + m.cardH + 18;
    const ly = m.py + m.pad + 28 + r * rowBlock;
    const info = WORLD_MAP_ROW_LABELS[r] || { title: 'Región', sub: '' };
    uiSectionLabel(m.px + m.pad, ly, info.title + (info.sub ? '  ·  ' + info.sub : ''));
    for (const wi of WORLD_MAP_LAYOUT[r]) drawWorldMapDesktopTile(wi, t);
  }
}

function drawWorldMapDesktopDetail(t) {
  const rx = 824, ry = 98, rw = 436, rh = 556;
  const locked = !gs.worldUnlocked[wmSel];
  const [c1, c2] = worldColors[wmSel];
  const doneCount = gs.levelDone[wmSel].filter(Boolean).length;

  uiPanel(rx, ry, rw, rh, 20);
  hud('DETALLE', rx + rw / 2, ry + 28, UI.cyan, 15, 'center');

  const previewY = ry + 200 + Math.sin(t * 2.5) * 5;
  uiGlowCircle(rx + rw / 2, previewY, 72, locked ? '#445' : c1, t);
  if (!locked) {
    const pg = ctx.createRadialGradient(rx + rw / 2, previewY, 10, rx + rw / 2, previewY, 100);
    pg.addColorStop(0, c1 + '55'); pg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = pg;
    ctx.beginPath(); ctx.arc(rx + rw / 2, previewY, 100, 0, Math.PI * 2); ctx.fill();
  }
  drawWorldIcon(wmSel, rx + rw / 2, previewY, 36);

  ctx.textAlign = 'center';
  ctx.font = 'bold 28px monospace';
  ctx.fillStyle = locked ? UI.dim : UI.bright;
  ctx.fillText(worldNames[wmSel], rx + rw / 2, ry + 72);
  ctx.font = '18px monospace';
  ctx.fillStyle = locked ? '#666' : c1;
  ctx.fillText(worldSubtitles[wmSel], rx + rw / 2, ry + 98);

  uiBadge(rx + rw / 2, ry + 128, 'Mundo ' + (wmSel + 1), UI.gold, 'rgba(0,0,0,0.45)');

  const progY = ry + 300;
  hud('Progreso del mundo', rx + 36, progY, UI.dim, 14, 'left');
  uiBar(rx + 36, progY + 10, rw - 72, 10, doneCount / 3, doneCount === 3 ? UI.gold : UI.cyan);
  hud(doneCount + ' / 3 niveles', rx + rw - 36, progY + 8, UI.bright, 14, 'right');

  const hint = worldHints[wmSel];
  if (hint) {
    fillRR(rx + 24, ry + 328, rw - 48, 44, 12, 'rgba(0,0,0,0.35)');
    hud(hint, rx + rw / 2, ry + 354, c1, 14, 'center');
  }

  if (locked) {
    fillRR(rx + 24, ry + 392, rw - 48, 56, 14, 'rgba(80,20,20,0.35)');
    strokeRR(rx + 24, ry + 392, rw - 48, 56, 14, UI.red, 1);
    hud('Completa el mundo anterior para desbloquear', rx + rw / 2, ry + 424, UI.red, 15, 'center');
  } else {
    hud('Elige nivel', rx + 36, ry + 388, UI.dim, 14, 'left');
    const lw = 118, lh = 52, gap = 12;
    const startX = rx + (rw - (lw * 3 + gap * 2)) / 2;
    for (let lv = 0; lv < 3; lv++) {
      const bx = startX + lv * (lw + gap), by = ry + 408;
      const lvsel = lv === wmLvl, done = gs.levelDone[wmSel][lv];
      fillRR(bx, by, lw, lh, 14, lvsel ? 'rgba(255,215,0,0.22)' : 'rgba(255,255,255,0.06)');
      strokeRR(bx, by, lw, lh, 14, lvsel ? UI.gold : 'rgba(255,255,255,0.12)', lvsel ? 2 : 1);
      ctx.textAlign = 'center'; ctx.font = 'bold 17px monospace';
      ctx.fillStyle = done ? UI.gold : lvsel ? UI.green : UI.bright;
      ctx.fillText('NIVEL ' + (lv + 1), bx + lw / 2, by + 24);
      ctx.font = '12px monospace';
      ctx.fillStyle = done ? UI.gold : UI.dim;
      ctx.fillText(done ? '★ Completado' : lvsel ? 'Seleccionado' : 'Pulsa ' + (lv + 1), bx + lw / 2, by + 42);
      mobRegisterRow(bx, by, lw, lh, lv);
    }
    fillRR(rx + 24, ry + 478, rw - 48, 52, 14, 'rgba(255,215,0,0.12)');
    strokeRR(rx + 24, ry + 478, rw - 48, 52, 14, 'rgba(255,215,0,0.35)', 1);
    hud('Enter · Jugar W' + (wmSel + 1) + '-' + (wmLvl + 1), rx + rw / 2, ry + 510, UI.gold, 17, 'center');
  }

  uiWalletBadge(rx + rw - 90, ry + rh - 36, gs.wallet);
}

function drawWorldMapDetail() {
  if (worldMapUseDesktopLayout()) return;
  const py = H - 148, ph = 108;
  uiPanel(24, py, W - 48, ph, 16);
  const locked = !gs.worldUnlocked[wmSel];
  const [c1] = worldColors[wmSel];

  ctx.textAlign = 'left';
  ctx.font = 'bold 24px monospace';
  ctx.fillStyle = locked ? UI.dim : UI.bright;
  ctx.fillText(worldNames[wmSel] + ' — ' + worldSubtitles[wmSel], 48, py + 34);

  if (locked) {
    hud('Completa el mundo anterior para desbloquear', 48, py + 62, UI.red, 16, 'left');
  } else {
    hud('Elige nivel y pulsa Enter para jugar', 48, py + 62, UI.dim, 15, 'left');
    for (let lv = 0; lv < 3; lv++) {
      const lx = W / 2 - 80 + lv * 88, ly = py + 78;
      const lvsel = lv === wmLvl, done = gs.levelDone[wmSel][lv];
      fillRR(lx - 36, ly - 22, 72, 44, 10, lvsel ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)');
      if (lvsel) strokeRR(lx - 36, ly - 22, 72, 44, 10, UI.gold, 2);
      ctx.textAlign = 'center'; ctx.font = 'bold 16px monospace';
      ctx.fillStyle = done ? UI.gold : lvsel ? UI.green : UI.bright;
      ctx.fillText('NIVEL ' + (lv + 1), lx, ly + 2);
      if (done) { ctx.font = '12px monospace'; ctx.fillStyle = UI.gold; ctx.fillText('★', lx, ly + 18); }
      mobRegisterRow(lx - 36, ly - 22, 72, 44, lv);
    }
  }

  const hint = worldHints[wmSel];
  if (hint) hud(hint, W - 48, py + 34, c1, 14, 'right');
  uiBadge(W - 120, py + 68, 'W' + (wmSel + 1) + '-' + (wmLvl + 1), UI.cyan, 'rgba(0,0,0,0.45)');
}

function updateWorldMap(dt) {
  if (mp.active && mp.role==='guest') {
    mobBindSwipe(null);
    if (pressed('Escape')) { mpDisconnect(); changeScene('menu'); return; }
    return;
  }
  mobBindSwipe(dir => {
    const prevSel = wmSel, prevLvl = wmLvl;
    if (dir === 'left') wmSel = worldMapGridNav(wmSel, 'left');
    if (dir === 'right') wmSel = worldMapGridNav(wmSel, 'right');
    if (dir === 'up') wmSel = worldMapGridNav(wmSel, 'up');
    if (dir === 'down') wmSel = worldMapGridNav(wmSel, 'down');
    if (wmSel !== prevSel) sfx.select();
    if (wmSel !== prevSel || wmLvl !== prevLvl) mpHostBroadcast();
  });
  mobBindMenu(() => wmLvl, v => { wmLvl = v; sfx.select(); mpHostBroadcast(); });
  const prevSel=wmSel, prevLvl=wmLvl;
  if (pressed('ArrowLeft'))  { wmSel=worldMapGridNav(wmSel,'left'); sfx.select(); }
  if (pressed('ArrowRight')) { wmSel=worldMapGridNav(wmSel,'right'); sfx.select(); }
  if (pressed('ArrowUp'))    { wmSel=worldMapGridNav(wmSel,'up'); sfx.select(); }
  if (pressed('ArrowDown'))  { wmSel=worldMapGridNav(wmSel,'down'); sfx.select(); }
  if (pressed('Digit1')) { wmLvl=0; sfx.select(); }
  if (pressed('Digit2')) { wmLvl=1; sfx.select(); }
  if (pressed('Digit3')) { wmLvl=2; sfx.select(); }
  if (wmSel!==prevSel || wmLvl!==prevLvl) mpHostBroadcast();
  if (pressed('Enter')||pressed('Space')) {
    if (gs.worldUnlocked[wmSel]) {
      sfx.select();
      gs.world=wmSel; gs.level=wmLvl;
      startLevel(); changeScene('gameplay');
      mpHostBroadcast();
    } else sfx.hurt();
  }
  if (pressed('Escape')) { if(mp.active) mpDisconnect(); changeScene('menu'); }
}

function drawWorldMap(t) {
  uiBgGrad('#080c14', '#141e2e'); uiSparkles(t * 0.5, 20);
  const desktop = worldMapUseDesktopLayout();
  if (desktop) uiDesktopHeader('MAPA DE MUNDOS', 'Elige mundo y nivel');
  else uiTitle('MAPA DE MUNDOS', 46, 36);

  const unlocked = worldsUnlockedCount();
  let cleared = 0;
  for (let w = 0; w < WORLD_COUNT; w++) if (gs.levelDone[w].every(Boolean)) cleared++;
  const statsY = desktop ? 72 : 78;
  hud(unlocked + ' / ' + WORLD_COUNT + ' desbloqueados · ' + cleared + ' completados', W / 2, statsY, UI.dim, 15, 'center');
  if (!desktop) uiPager(W / 2, 94, wmSel, WORLD_COUNT);

  const touchList = document.body.classList.contains('touch') && !mobUseDesktopMenu();

  if (touchList) {
    const cardW = W - 48, cardH = 58, gap = 6, startY = 118;
    const sections = [
      { label: 'Región inicial', worlds: [0, 1, 2, 3] },
      { label: 'Región avanzada', worlds: [4, 5, 6, 7] },
      { label: 'Región final', worlds: [8, 9] },
      { label: '★ Mundos especiales', worlds: [10, 11] },
    ];
    let y = startY;
    for (const sec of sections) {
      hud(sec.label, W / 2, y, UI.dim, 13, 'center');
      y += 18;
      for (const wi of sec.worlds) {
        const locked = !gs.worldUnlocked[wi], sel = wi === wmSel;
        const [c1, c2] = worldColors[wi];
        const bx = 24, by = y;
        fillRR(bx, by, cardW, cardH, 12, locked ? '#1e2430' : c2);
        if (!locked) {
          const cg = ctx.createLinearGradient(bx, by, bx + cardW, by);
          cg.addColorStop(0, c1); cg.addColorStop(1, c2);
          fillRR(bx, by, cardW, cardH, 12, cg);
        }
        strokeRR(bx, by, cardW, cardH, 12, sel ? UI.gold : 'rgba(255,255,255,0.1)', sel ? 3 : 1);
        if (!locked) mobRegisterWorldCard(wi, bx, by, cardW, cardH);
        drawWorldIcon(wi, bx + 36, by + cardH / 2, 12);
        ctx.textAlign = 'left'; ctx.font = 'bold 16px monospace';
        ctx.fillStyle = locked ? '#666' : UI.bright;
        ctx.fillText('W' + (wi + 1) + ' · ' + worldNames[wi], bx + 58, by + 24);
        ctx.font = '12px monospace'; ctx.fillStyle = locked ? '#555' : UI.dim;
        ctx.fillText(locked ? 'Bloqueado' : worldSubtitles[wi], bx + 58, by + 42);
        if (sel && !locked) {
          for (let lv = 0; lv < 3; lv++) {
            const lx = bx + cardW - 88 + lv * 28, ly = by + cardH / 2;
            const done = gs.levelDone[wi][lv], lvsel = lv === wmLvl;
            fillRR(lx - 10, ly - 10, 20, 20, 5, done ? UI.gold : lvsel ? UI.green : 'rgba(255,255,255,0.85)');
            ctx.fillStyle = '#111'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText(String(lv + 1), lx, ly + 4);
          }
        }
        y += cardH + gap;
      }
      y += 8;
    }
  } else if (worldMapUseDesktopLayout()) {
    drawWorldMapDesktopGrid(t);
    drawWorldMapDesktopDetail(t);
  } else {
    const row2 = worldMapCardRect(8);
    hud('Regiones finales · W9–W12', W / 2, row2.y - 10, '#c8a0ff', 13, 'center');
    for (let wi = 0; wi < WORLD_COUNT; wi++) drawWorldMapCard(wi, t);
    drawWorldMapDetail();
  }

  fillRR(0, H - 36, W, 36, 0, 'rgba(0,0,0,0.55)');
  if (!desktop) {
    hud('Vidas:' + gs.lives + '  Monedas:' + gs.coins + '  Score:' + gs.score, W / 2, H - 12, UI.bright, 16, 'center');
  } else {
    uiDesktopStatusBar();
  }
  uiFooter(touchList ? 'Toca mundo · 1/2/3 nivel · OK jugar' :
    desktop ? 'Clic o flechas · mundo · 1/2/3 nivel · Enter jugar · Esc menú' :
    'Flechas=mundo · 1/2/3=nivel · Enter=jugar · Esc=Menú');
  if (mp.active && mp.role === 'guest') {
    uiBadge(W / 2, H - 56, 'Esperando al anfitrión...', '#7df', 'rgba(0,80,140,0.65)');
  } else if (mp.active && mp.role === 'host' && mp.connected) {
    uiBadge(W / 2, H - 56, 'Amigo conectado', UI.green, 'rgba(20,60,30,0.65)');
  }
}

// ── Pause Scene ────────────────────────────────────────────────────────────
let pauseSel=0;
const pauseItems=['RESUME','RESTART LEVEL','MAIN MENU'];

function updatePause(dt) {
  mobBindMenu(() => pauseSel, v => { pauseSel = v; });
  mobBindSwipe(dir => {
    if (dir === 'up') pauseSel = (pauseSel - 1 + 3) % 3;
    if (dir === 'down') pauseSel = (pauseSel + 1) % 3;
  });
  if (pressed('ArrowUp'))   pauseSel=(pauseSel-1+3)%3;
  if (pressed('ArrowDown')) pauseSel=(pauseSel+1)%3;
  if (pressed('Escape')||pressed('KeyP')) { gs.scene='gameplay'; }
  if (pressed('Enter')||pressed('Space')) {
    sfx.select();
    if (pauseSel===0) gs.scene='gameplay';
    if (pauseSel===1) { startLevel(); gs.scene='gameplay'; }
    if (pauseSel===2) { gs.lives=startLives(); gs.score=0; gs.coins=0; changeScene('menu'); menuSel=0; }
  }
}

function drawPause() {
  if (document.body.classList.contains('mob-menu-html')) return;
  drawBg(levelData.bg, levelData.levelW);
  drawPlatforms(levelData.platforms, gs.world);
  for (const it of items) drawCollectible(it, gameTimer);
  drawGoal(...goalPos, t);
  for (const e of enemies) drawEnemy(e);
  drawPlayer(player);
  fillRR(0,0,W,H,0,'rgba(0,0,0,0.6)');
  uiPanel(W/2-230,H/2-175,460,350,22);
  uiTitle('PAUSA', H/2-125, 36);
  for (let i=0;i<pauseItems.length;i++) uiMenuRow(pauseItems[i], H/2-55+i*68, i===pauseSel, 380, 46, i);
}

// ── Game Over ──────────────────────────────────────────────────────────────
let goSel=0, goT=0;

function updateGameOver(dt) {
  goT+=dt;
  mobBindMenu(() => goSel, v => { goSel = v; });
  mobBindSwipe(dir => {
    if (dir === 'left' || dir === 'right') goSel = (goSel + 1) % 2;
  });
  if (pressed('ArrowLeft')||pressed('ArrowRight')) goSel=(goSel+1)%2;
  if (pressed('Enter')||pressed('Space')) {
    if (goSel===0) { gs.lives=startLives(); startLevel(); changeScene('gameplay'); }
    else           { gs.lives=startLives(); gs.score=0; gs.coins=0; changeScene('menu'); menuSel=0; }
  }
}

function drawGameOver() {
  if (document.body.classList.contains('mob-menu-html')) return;
  uiBgGrad('#1a0505','#3a0808', false);
  const scale=1+Math.sin(goT*3)*0.04;
  ctx.save(); ctx.translate(W/2,H/2-90); ctx.scale(scale,scale);
  uiTitle('GAME OVER', 0, 64, UI.red); ctx.restore();
  uiPanel(W/2-260,H/2-20,520,200,18);
  hud('Score: '+gs.score+'    Monedas: '+gs.coins, W/2, H/2+10, UI.bright, 22, 'center');
  hud('Record: '+gs.highScore, W/2, H/2+44, UI.cyan, 20, 'center');
  uiBtn(W/2-200,H/2+80,180,48,'REINTENTAR',goSel===0);
  mobRegisterRow(W/2-200,H/2+80,180,48,0);
  uiBtn(W/2+20,H/2+80,180,48,'MENÚ',goSel===1);
  mobRegisterRow(W/2+20,H/2+80,180,48,1);
  uiFooter('← → elegir · Enter confirmar · Clic en botón');
}

// ── Level Complete Scene ────────────────────────────────────────────────────
function updateLevelComplete(dt) {
  lcT += dt;
  if (lcT > 0.4 && (pressed('Enter')||pressed('Space')||pressed('ArrowUp')||pressed('KeyW'))) {
    sfx.select();
    advanceLevel();
  }
}
function drawLevelComplete() {
  if (document.body.classList.contains('mob-menu-html')) return;
  uiBgGrad('#06340f','#0a5a1e');
  const bob=Math.sin(lcT*3)*6;
  uiTitle('NIVEL COMPLETO!', 130+bob, 50);
  uiPanel(W/2-280,175,560,380,20);
  hud('Mundo '+(lcStats.world+1)+' - Nivel '+(lcStats.level+1), W/2, 210, UI.bright, 26, 'center');
  const stars = lcStats.time<25 ? 3 : lcStats.time<45 ? 2 : 1;
  for(let i=0;i<3;i++){
    const sx=W/2-60+i*60;
    fillRR(sx-22,228,44,44,10, i<stars?'rgba(255,215,0,0.25)':'rgba(255,255,255,0.06)');
    ctx.font='36px monospace'; ctx.textAlign='center'; ctx.fillStyle=i<stars?UI.gold:'#444'; ctx.fillText('*',sx,262);
  }
  const rows=[['Tiempo',lcStats.time.toFixed(1)+'s'],['Monedas / Estrellas',lcStats.coins+' / '+lcStats.stars],
    ['Bonus nivel','+'+lcStats.base],['Bonus tiempo','+'+lcStats.bonus],['Score total',''+gs.score]];
  rows.forEach((r,i)=>{
    const y=310+i*44;
    ctx.textAlign='left'; ctx.fillStyle=UI.green; ctx.font='22px monospace'; ctx.fillText(r[0],W/2-240,y);
    ctx.textAlign='right'; ctx.fillStyle=UI.bright; ctx.fillText(r[1],W/2+240,y);
  });
  uiFooter('Enter / Salto para continuar');
}

// ── Victory Scene ────────────────────────────────────────────────────────────
let vicT=0;
function updateVictory(dt) {
  vicT+=dt;
  if (vicT>0.5 && (pressed('Enter')||pressed('Space'))) {
    gs.lives=startLives(); gs.score=0; gs.coins=0; gs.world=0; gs.level=0;
    changeScene('menu'); menuSel=0;
  }
}
function drawVictory() {
  if (document.body.classList.contains('mob-menu-html')) return;
  uiBgGrad('#142a5a','#3a1a5a');
  for(let i=0;i<90;i++){
    const x=(i*137+vicT*40)%W, y=((i*89)+vicT*120)%H;
    fillRR(x,y,8,8,3,['#FFD700','#5dd4ff','#3ecf6e','#f6f','#fff'][i%5]);
  }
  const sc=1.1+Math.sin(vicT*3)*0.06;
  ctx.save(); ctx.translate(W/2,140); ctx.scale(sc,sc); uiTitle('VICTORIA!', 0, 58); ctx.restore();
  uiPanel(W/2-280,200,560,220,20);
  hud('Completaste los '+WORLD_COUNT+' mundos!', W/2, 250, UI.bright, 24, 'center');
  hud('Score final: '+gs.score, W/2, 300, UI.gold, 26, 'center');
  hud('Record: '+gs.highScore, W/2, 345, UI.cyan, 22, 'center');
  uiFooter('Enter para volver al menu');
}

// ── Settings Scene ───────────────────────────────────────────────────────────
let setSel=0;
function updateSettings(dt) {
  mobBindMenu(() => setSel, v => { setSel = v; });
  mobBindSwipe(dir => {
    const n = 9;
    if (dir === 'up') setSel = (setSel - 1 + n) % n;
    if (dir === 'down') setSel = (setSel + 1) % n;
  });
  const n=9;
  if (pressed('ArrowUp')||pressed('KeyW'))   { setSel=(setSel-1+n)%n; sfx.select(); }
  if (pressed('ArrowDown')||pressed('KeyS')) { setSel=(setSel+1)%n; sfx.select(); }
  if (pressed('Escape')) { saveGame(); changeScene('menu'); return; }
  const right=pressed('ArrowRight'), left=pressed('ArrowLeft'), enter=pressed('Enter')||pressed('Space');
  if (right||left||enter) {
    if (setSel===0)      { audio.sound=!audio.sound; sfx.select(); }
    else if (setSel===1) { audio.music=!audio.music; if(audio.music)musicStart(); else musicStop(); sfx.select(); }
    else if (setSel===2) { const d=left?-1:1; gs.difficulty=(gs.difficulty+d+DIFFICULTIES.length)%DIFFICULTIES.length; sfx.select(); }
    else if (setSel===3) {
      if (threeCanUse()) {
        gs.viewMode = gs.viewMode === '3d' ? '2d' : '3d';
        if (gs.viewMode === '2d') threeDisable();
      }
      sfx.select();
    }
    else if (setSel===4) { gs.fxShake=!gs.fxShake; sfx.select(); }
    else if (setSel===5) { gs.fxParticles=!gs.fxParticles; sfx.select(); }
    else if (setSel===6) { gs.vibration=!gs.vibration; sfx.select(); }
    else if (setSel===7) { if(enter){ resetProgress(); sfx.select(); } }
    else if (setSel===8) { if(enter){ saveGame(); changeScene('menu'); sfx.select(); return; } }
    saveGame();
  }
}
function drawSettings() {
  if (document.body.classList.contains('mob-menu-html')) return;
  const desktop = uiIsDesktop();
  uiBgGrad('#0a1420','#0d1b2a', false);

  const viewLbl = typeof threeCanUse === 'function' && threeCanUse()
    ? (gs.viewMode === '3d' ? '3D' : '2D')
    : '2D';
  const opts=[
    ['Efectos de sonido', audio.sound?'ON':'OFF'],
    ['Musica', audio.music?'ON':'OFF'],
    ['Dificultad', diff().name],
    ['Vista del juego', viewLbl],
    ['Sacudida de pantalla', gs.fxShake?'ON':'OFF'],
    ['Particulas', gs.fxParticles?'ON':'OFF'],
    ['Vibracion tactil', gs.vibration?'ON':'OFF'],
    ['Reiniciar progreso',''],
    ['Volver',''],
  ];
  const hints = [
    'Sonidos de salto, monedas y golpes.',
    'Música distinta en cada nivel del juego.',
    'Afecta vidas, enemigos y puntuación.',
    'Alterna vista 2D clásica o 3D con Three.js.',
    'Sacude la pantalla al recibir daño.',
    'Partículas al coleccionar y al golpear.',
    'Vibración en móvil (sin efecto en PC).',
    'Borra récord, mundos y compras.',
    'Guarda y vuelve al menú.',
  ];

  if (desktop) {
    uiDesktopHeader('AJUSTES', 'Audio, gráficos y progreso');
    const lx = 28, ly = 72, lw = 520, lh = 580;
    const rx = 564, rw = 688, rh = 580;
    uiPanel(lx, ly, lw, lh, 18);
    uiPanel(rx, ly, rw, rh, 18);
    hud('OPCIONES', lx + 24, ly + 28, UI.gold, 16, 'left');
    opts.forEach((o, i) => {
      let vc = o[1];
      if (o[1] === 'ON') vc = UI.green;
      else if (o[1] === 'OFF') vc = UI.red;
      if (i === 2) vc = diff().color;
      if (i === 3) vc = gs.viewMode === '3d' ? UI.cyan : UI.gold;
      const y = ly + 56 + i * 52;
      fillRR(lx + 12, y - 28, lw - 24, 44, 10, i === setSel ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.04)');
      if (i === setSel) strokeRR(lx + 12, y - 28, lw - 24, 44, 10, UI.gold, 2);
      ctx.textAlign = 'left'; ctx.font = i === setSel ? 'bold 20px monospace' : '18px monospace';
      ctx.fillStyle = i === setSel ? UI.gold : UI.bright;
      ctx.fillText((i === setSel ? '▸ ' : '  ') + o[0], lx + 28, y);
      if (o[1] !== '') {
        ctx.textAlign = 'right'; ctx.font = 'bold 18px monospace'; ctx.fillStyle = vc;
        ctx.fillText(o[1], lx + lw - 28, y);
      }
      mobRegisterRow(lx + 12, y - 28, lw - 24, 44, i);
    });
    hud('AYUDA', rx + 28, ly + 28, UI.cyan, 16, 'left');
    const sel = opts[setSel];
    ctx.textAlign = 'left'; ctx.font = 'bold 24px monospace'; ctx.fillStyle = UI.gold;
    ctx.fillText(sel[0], rx + 36, ly + 80);
    ctx.font = '17px monospace'; ctx.fillStyle = UI.bright;
    ctx.fillText(hints[setSel], rx + 36, ly + 118);
    if (setSel === 2) {
      const d = diff();
      hud('Vidas: ' + d.lives + '  Enemigos: x' + d.enemy.toFixed(2) + '  Puntos: x' + d.score.toFixed(1),
        rx + 36, ly + 160, UI.cyan, 16, 'left');
    }
    hud('◀ ▶ o Enter cambia valor · Esc guardar y volver', W / 2, H - 14, UI.dim, 13, 'center');
    return;
  }

  uiTitle('AJUSTES', 68, 42);
  uiPanel(W/2-370,100,740,530,18);
  opts.forEach((o,i)=>{
    let vc=o[1]; if(o[1]==='ON') vc=UI.green; else if(o[1]==='OFF') vc=UI.red;
    if(i===2) vc=diff().color;
    if(i===3) vc=gs.viewMode==='3d'?UI.cyan:UI.gold;
    uiListRow(155+i*52, o[0], o[1], i===setSel, vc, i);
  });
  const d=diff();
  hud('Vidas: '+d.lives+'  Enemigos: x'+d.enemy.toFixed(2)+'  Puntos: x'+d.score.toFixed(1), W/2, 560, UI.cyan, 17, 'center');
  uiFooter('Arriba/Abajo · Enter/Izq/Der · Esc=Volver');
}

// ── Credits Scene ────────────────────────────────────────────────────────────
let creditT=0;
function updateCredits(dt) {
  creditT+=dt;
  if (pressed('Enter')||pressed('Escape')||pressed('Space')) changeScene('menu');
}
function drawCredits() {
  if (document.body.classList.contains('mob-menu-html')) return;
  uiBgGrad('#0a1018','#101820', false);
  uiTitle('CREDITOS', 90, 42);
  uiPanel(W/2-300,130,600,420,18);
  const lines=['Super Bear Adventure','','Diseno y programacion','MonoGame C# + port HTML5','',
    'Graficos procedurales','Audio WebAudio sintetizado','Controles tactiles PWA','','Gracias por jugar!'];
  ctx.font='22px monospace'; ctx.textAlign='center';
  lines.forEach((l,i)=>{ ctx.fillStyle=l?UI.bright:UI.dim; ctx.fillText(l,W/2,175+i*38); });
  uiFooter('Enter / Esc para volver');
}

// ── Character Select Scene ──────────────────────────────────────────────────
let charSel=0, charT=0;
function updateCharSelect(dt) {
  mobBindMenu(() => charSel, v => { charSel = v; sfx.select(); });
  mobBindSwipe(dir => {
    const n = CHARACTERS.length;
    if (dir === 'left') charSel = (charSel - 1 + n) % n;
    if (dir === 'right') charSel = (charSel + 1) % n;
  });
  charT+=dt;
  const n=CHARACTERS.length;
  if (pressed('ArrowLeft')||pressed('KeyA'))  { charSel=(charSel-1+n)%n; sfx.select(); }
  if (pressed('ArrowRight')||pressed('KeyD')) { charSel=(charSel+1)%n; sfx.select(); }
  if (pressed('Escape')) { changeScene('menu'); }
  if (pressed('Enter')||pressed('Space')) {
    if (isCharUnlocked(charSel)) { gs.character=charSel; saveGame(); sfx.select(); changeScene('menu'); }
    else sfx.hurt();
  }
}
function drawStatBar(x,y,w,val,label,color){ uiStatBar(x, y, w, val, label, color); }

function drawCharThumbStrip(cx, cy, sel, n, maxShow) {
  const show = maxShow || 11;
  const half = Math.floor(show / 2);
  let start = Math.max(0, sel - half);
  let end = Math.min(n, start + show);
  if (end - start < show) start = Math.max(0, end - show);
  const slotW = 46, totalW = (end - start) * slotW;
  const sx = cx - totalW / 2;
  for (let i = start; i < end; i++) {
    const c = CHARACTERS[i];
    const x = sx + (i - start) * slotW;
    const on = i === sel;
    const ok = isCharUnlocked(i);
    fillRR(x, cy - 24, 40, 48, 9, on ? 'rgba(255,215,0,0.22)' : 'rgba(255,255,255,0.05)');
    if (on) strokeRR(x, cy - 24, 40, 48, 9, UI.gold, 2);
    else if (ok) strokeRR(x, cy - 24, 40, 48, 9, 'rgba(255,255,255,0.1)', 1);
    if (c?.draw) {
      ctx.save();
      ctx.translate(x + 20, cy + 2);
      ctx.scale(0.68, 0.68);
      const sil = !ok && !c.shopOnly && !c.shopPrice;
      if (!sil) {
        c.draw({ facing: 1, power: null, invTimer: 0 }, -PLAYER_W / 2, -PLAYER_H / 2);
        if (!ok) { ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H); }
      } else {
        ctx.fillStyle = '#2b3240'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H);
      }
      ctx.restore();
    }
  }
}

function drawCharSelect() {
  if (document.body.classList.contains('mob-menu-html')) return;
  const desktop = uiIsDesktop();
  uiBgGrad('#0a1018', '#142038', false); uiSparkles(charT * 0.3, 24);

  if (desktop) {
    uiDesktopHeader('PERSONAJES', 'Elige tu héroe');
    uiWalletBadge(W - 110, 36, gs.wallet);
    drawHeroDesktopGrid(charSel, charT, 24, 64, 760, 592, 'HÉROES');
    drawHeroDesktopDetail(charSel, charT, 800, 64, 456, 592, { title: 'SELECCIÓN', pick: true });
    hud('Clic en héroe · Enter confirmar · Esc volver', W / 2, H - 14, UI.dim, 13, 'center');
    return;
  }

  uiTitle('PERSONAJES', 68, 40);
  uiWalletBadge(W - 110, 42, gs.wallet);

  const pw = 620, ph = 400, px = W / 2 - pw / 2, py = 108;
  uiPanel(px, py, pw, ph, 22);
  const ch = CHARACTERS[charSel];
  const unlocked = isCharUnlocked(charSel);
  const bob = Math.sin(charT * 4) * 5;
  const previewY = py + 175 + bob;

  uiNavBtn(px + 18, py + 130, 52, 52, '◀', true);
  uiNavBtn(px + pw - 70, py + 130, 52, 52, '▶', true);
  if (document.body.classList.contains('touch')) {
    mobRegisterRow(px + 18, py + 130, 52, 52, (charSel - 1 + CHARACTERS.length) % CHARACTERS.length);
    mobRegisterRow(px + pw - 70, py + 130, 52, 52, (charSel + 1) % CHARACTERS.length);
  }

  uiGlowCircle(W / 2, previewY, 72, ch.color || UI.gold, charT);
  ctx.save();
  ctx.translate(W / 2, previewY);
  ctx.scale(5.2, 5.2);
  const showSilhouette = !unlocked && !ch.shopOnly && !ch.shopPrice;
  if (!showSilhouette) {
    ch.draw({ facing: 1, power: null, invTimer: 0 }, -PLAYER_W / 2, -PLAYER_H / 2);
    if (!unlocked) { ctx.fillStyle = 'rgba(0,0,0,0.42)'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H); }
  } else {
    ctx.fillStyle = '#2b3240'; ctx.fillRect(-PLAYER_W / 2, -PLAYER_H / 2, PLAYER_W, PLAYER_H);
    ctx.fillStyle = '#566'; ctx.font = 'bold 30px monospace'; ctx.textAlign = 'center'; ctx.fillText('?', 0, 12);
  }
  ctx.restore();

  ctx.fillStyle = unlocked ? UI.bright : UI.dim;
  ctx.font = 'bold 32px monospace'; ctx.textAlign = 'center';
  ctx.fillText(unlocked ? ch.name : (ch.shopOnly || ch.shopPrice ? ch.name : '???'), W / 2, py + ph - 118);

  if (!unlocked) {
    uiBadge(W / 2, py + ph - 88, 'BLOQUEADO', UI.red, 'rgba(80,20,20,0.55)');
    if (ch.shopOnly) {
      hud('★ Exclusivo TIENDA · ' + charShopCost(ch) + ' monedas', W / 2, py + ph - 58, UI.gold, 16, 'center');
    } else if (ch.shopPrice) {
      hud('Compra en TIENDA · ' + charShopCost(ch) + ' monedas', W / 2, py + ph - 58, UI.gold, 16, 'center');
    } else if (charInShop(charSel)) {
      hud('Mundos: ' + ch.unlock + '+ · O tienda ' + charShopCost(ch) + ' mon', W / 2, py + ph - 58, UI.dim, 15, 'center');
    } else {
      hud('Completa ' + ch.unlock + ' mundo(s)', W / 2, py + ph - 58, UI.dim, 15, 'center');
    }
  } else {
    const bx = W / 2 - 170, bw = 340;
    drawStatBar(bx, py + ph - 108, bw, ch.speed, 'VEL', UI.green);
    drawStatBar(bx, py + ph - 82, bw, ch.jump, 'SAL', UI.cyan);
    hud('★ ' + ch.special.name, W / 2, py + ph - 54, UI.gold, 16, 'center');
    hud(ch.desc, W / 2, py + ph - 30, UI.dim, 14, 'center');
    if (gs.character === charSel) uiBadge(W / 2, py + 28, 'EN USO', UI.green, 'rgba(20,60,30,0.7)');
  }

  uiPager(W / 2, py + ph + 28, charSel, CHARACTERS.length);
  drawCharThumbStrip(W / 2, py + ph + 72, charSel, CHARACTERS.length, 11);
  uiFooter('◀▶ elegir · Enter confirmar · Esc volver');
}

// ── Shop Scene ───────────────────────────────────────────────────────────────
let shopSel=0;
const SHOP_ROW_H = 66;
const SHOP_VISIBLE = 6;
function shopListOffset(n) {
  if (n <= SHOP_VISIBLE) return 0;
  return Math.max(0, Math.min(shopSel - Math.floor(SHOP_VISIBLE / 2), n - SHOP_VISIBLE));
}
function buildShop(){
  const list=[];
  if(!gs.magnet) list.push({key:'magnet', label:'Iman de monedas', desc:'Atrae monedas cercanas', cost:300});
  if(gs.bonusLives<3) list.push({key:'life', label:'Vida extra inicial', desc:`Empiezas con +1 vida  (${gs.bonusLives}/3)`, cost:200*(gs.bonusLives+1)});
  for(let i=0;i<CHARACTERS.length;i++){
    if(!charInShop(i)) continue;
    const c=CHARACTERS[i];
    const tag = c.shopOnly ? '★ ' : '';
    list.push({
      key:'char', idx:i,
      label: tag + c.name,
      desc: c.desc + (c.shopOnly ? ' · Exclusivo tienda' : ' · Desbloqueo anticipado'),
      cost: charShopCost(c),
    });
  }
  return list;
}
function buyShop(item){
  if(!item) return;
  if(gs.wallet<item.cost){ sfx.hurt(); showBanner('SIN MONEDAS','#f66'); return; }
  gs.wallet-=item.cost;
  if(item.key==='magnet') gs.magnet=true;
  else if(item.key==='life') gs.bonusLives=Math.min(3,gs.bonusLives+1);
  else if(item.key==='char') gs.bought[item.idx]=true;
  unlockAch('shopper'); checkCollectAch();
  sfx.power(); saveGame();
  showBanner('COMPRADO!','#3f6');
}
function updateShop(dt){
  const list=buildShop(), n=Math.max(1,list.length);
  mobBindMenu(() => shopSel, v => { shopSel = v; });
  mobBindSwipe(dir => {
    if (!list.length) return;
    if (dir === 'up') shopSel = (shopSel - 1 + n) % n;
    if (dir === 'down') shopSel = (shopSel + 1) % n;
  });
  if(shopSel>=n) shopSel=n-1; if(shopSel<0) shopSel=0;
  if(pressed('ArrowUp')||pressed('KeyW')){ shopSel=(shopSel-1+n)%n; sfx.select(); }
  if(pressed('ArrowDown')||pressed('KeyS')){ shopSel=(shopSel+1)%n; sfx.select(); }
  if(pressed('Escape')){ changeScene('menu'); return; }
  if((pressed('Enter')||pressed('Space')) && list.length){ buyShop(list[shopSel]); }
  if(banner){ banner.life-=dt; if(banner.life<=0) banner=null; }
}
function drawShop(){
  if (document.body.classList.contains('mob-menu-html')) return;
  const desktop = uiIsDesktop();
  uiBgGrad('#100818','#1a1030', false);
  uiSparkles(performance.now() * 0.001, 18);

  const pw = desktop ? 1232 : 780;
  const ph = desktop ? 560 : 490;
  const px = W / 2 - pw / 2;
  const py = desktop ? 72 : 132;

  if (desktop) {
    uiDesktopHeader('TIENDA', 'Compra héroes y mejoras');
    uiWalletBadge(W - 110, 36, gs.wallet);
  } else {
    uiTitle('TIENDA', 68, 42);
    uiWalletBadge(W / 2, 108, gs.wallet);
  }

  uiPanel(px, py, pw, ph, 20);
  const list = buildShop();
  const listX = px + 16, listW = desktop ? 560 : 430, listY = py + 14, listH = ph - 28;
  const detailX = px + listW + 28, detailW = pw - listW - 44;
  const visible = desktop ? 8 : SHOP_VISIBLE;

  fillRR(detailX, listY, detailW, listH, 16, 'rgba(0,0,0,0.28)');
  strokeRR(detailX, listY, detailW, listH, 16, 'rgba(255,215,0,0.15)', 1);
  hud('VISTA PREVIA', detailX + detailW / 2, listY + 24, UI.dim, 14, 'center');

  if (!list.length) {
    hud('¡Todo comprado!', W / 2, py + ph / 2, UI.green, 26, 'center');
    hud('Sigue jugando para ganar más monedas', W / 2, py + ph / 2 + 36, UI.dim, 16, 'center');
  } else {
    const visible = desktop ? 8 : SHOP_VISIBLE;
    let off = 0;
    if (list.length > visible) {
      off = Math.max(0, Math.min(shopSel - Math.floor(visible / 2), list.length - visible));
    }
    const clipH = visible * SHOP_ROW_H;
    uiClipScroll(listX, listY, listW, clipH, 14, () => {
      list.forEach((o, i) => {
        const y = listY + (i - off) * SHOP_ROW_H + 8;
        const sel = i === shopSel;
        const afford = gs.wallet >= o.cost;
        uiShopCard(listX + 4, y, listW - 8, SHOP_ROW_H - 10, sel, afford, () => {
          if (o.key === 'char') {
            const ch = CHARACTERS[o.idx];
            ctx.save();
            ctx.translate(listX + 36, y + SHOP_ROW_H / 2 - 2);
            ctx.scale(0.9, 0.9);
            if (ch?.draw) ch.draw({ facing: 1 }, -PLAYER_W / 2, -PLAYER_H / 2);
            ctx.restore();
          } else if (o.key === 'magnet') {
            drawCoinIcon(listX + 36, y + SHOP_ROW_H / 2 - 2, 14);
            ctx.fillStyle = UI.cyan; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
            ctx.fillText('MAG', listX + 36, y + SHOP_ROW_H / 2 + 14);
          } else {
            drawHeartIcon(listX + 36, y + SHOP_ROW_H / 2 - 10, 12, true);
          }
          ctx.textAlign = 'left'; ctx.font = sel ? 'bold 20px monospace' : '18px monospace';
          ctx.fillStyle = sel ? UI.gold : UI.bright;
          ctx.fillText(o.label, listX + 68, y + 28);
          ctx.font = '14px monospace'; ctx.fillStyle = UI.dim;
          ctx.fillText(o.desc.slice(0, 34) + (o.desc.length > 34 ? '…' : ''), listX + 68, y + 48);
          ctx.textAlign = 'right'; ctx.font = 'bold 18px monospace';
          ctx.fillStyle = afford ? UI.gold : UI.red;
          ctx.fillText(o.cost + ' mon.', listX + listW - 20, y + 36);
        });
        mobRegisterRow(listX + 4, y, listW - 8, SHOP_ROW_H - 10, i);
      });
    });

    if (list.length > visible) {
      const scrollFrac = off / Math.max(1, list.length - visible);
      uiBar(listX + listW + 6, listY, 5, clipH, (off + visible) / list.length, UI.gold);
      hud('▲▼ ' + (shopSel + 1) + '/' + list.length, listX + listW / 2, listY + clipH + 16, UI.dim, 13, 'center');
    }

    const item = list[shopSel];
    if (item) {
      const cx = detailX + detailW / 2, cy = listY + listH / 2 - 10;
      if (item.key === 'char') {
        const ch = CHARACTERS[item.idx];
        uiGlowCircle(cx, cy - 20, 56, ch?.color || UI.gold, performance.now() * 0.001);
        ctx.save();
        ctx.translate(cx, cy - 20);
        ctx.scale(3.2, 3.2);
        if (ch?.draw) ch.draw({ facing: 1 }, -PLAYER_W / 2, -PLAYER_H / 2);
        ctx.restore();
        hud(ch?.name || '', cx, cy + 58, UI.gold, 20, 'center');
        if (ch?.special) hud('★ ' + ch.special.name, cx, cy + 84, ch.color || UI.cyan, 14, 'center');
      } else if (item.key === 'magnet') {
        drawCoinIcon(cx, cy - 10, 28);
        hud('Imán activo en niveles', cx, cy + 50, UI.cyan, 15, 'center');
      } else {
        for (let h = 0; h < 3; h++) drawHeartIcon(cx - 30 + h * 30, cy - 10, 14, true);
        hud('+1 vida al empezar', cx, cy + 50, UI.red, 15, 'center');
      }
      const afford = gs.wallet >= item.cost;
      uiBadge(cx, listY + listH - 28, afford ? 'COMPRAR' : 'SIN MONEDAS', afford ? UI.green : UI.red,
        afford ? 'rgba(20,60,30,0.7)' : 'rgba(60,20,20,0.6)');
      hud(item.cost + ' monedas', cx, listY + listH - 52, afford ? UI.gold : UI.red, 16, 'center');
    }
  }

  if (banner) {
    const a = banner.life / banner.max;
    ctx.globalAlpha = Math.min(1, a * 2);
    uiBadge(W / 2, py - 8, banner.text, banner.color, 'rgba(0,0,0,0.75)');
    ctx.globalAlpha = 1;
  }
  uiFooter(desktop ? 'Clic o ▲▼ · Enter comprar · Esc volver' : '▲▼ navegar · Enter comprar · Esc volver');
}
