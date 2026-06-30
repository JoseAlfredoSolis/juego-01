// === 14-scenes.js (from index.html lines 1981-2540) ===
  drawPlayer(player);
  drawRemotePlayer();
  cam.x=sx; cam.y=sy;
  drawFlash();
  drawBanner();
  drawHUD(t);
}

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
  uiBgGrad('#0a1428','#1a2848'); uiSparkles(t*0.6, 20);
  uiTitle('JUGAR EN LINEA', 90, 44);
  hud('Invita amigos y explorad juntos el mismo nivel', W/2, 138, UI.dim, 17, 'center');
  uiPanel(W/2-220, 170, 440, 280, 18);
  for (let i=0;i<mpMenuItems.length;i++) uiMenuRow(mpMenuItems[i], 230+i*62, i===mp.menuSel, 400, 48);
  hud('El anfitrion elige el mundo · ambos ven al otro en pantalla', W/2, 490, UI.cyan, 15, 'center');
  uiFooter('Enter · Esc volver');
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
  hud(mp.status||'Teclado A-Z y 0-9 · Backspace borrar', W/2, 320, UI.bright, 16, 'center');
  if (mp.errMsg) hud(mp.errMsg, W/2, 360, UI.red, 16, 'center');
  if (mp.connected) hud('Conectado — espera a que el anfitrion elija nivel', W/2, 400, UI.green, 17, 'center');
  uiFooter('Enter unirse · Esc volver');
}

// ── Menu Scene ─────────────────────────────────────────────────────────────
let menuSel=0, menuT=0;
const menuItems=['PLAY','KART RACE','MULTIJUGADOR','CHARACTER','TIENDA','LOGROS','INSTRUCTIONS','SETTINGS','CREDITS'];

function updateMenu(dt) {
  menuT+=dt;
  const n=menuItems.length;
  if (pressed('ArrowUp')||pressed('KeyW'))   { menuSel=(menuSel-1+n)%n; sfx.select(); }
  if (pressed('ArrowDown')||pressed('KeyS')) { menuSel=(menuSel+1)%n; sfx.select(); }
  if (pressed('Enter')||pressed('Space')) {
    sfx.select();
    const it=menuItems[menuSel];
    if (it==='PLAY')             { gs.lives=startLives(); gs.score=0; gs.coins=0; changeScene('worldmap'); wmSel=gs.world; wmLvl=0; }
    else if (it==='KART RACE')   { kartMenuSel=0; mp.gameMode='kart'; changeScene('kartmenu'); }
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
  uiBgGrad('#0a2010','#1a5c1a'); uiSparkles(t);
  drawBearSil(80,H-160,60); drawBearSil(W-140,H-160,60);
  const bob=Math.sin(t*2)*8;
  uiTitle('SUPER BEAR', 130+bob, 68);
  uiTitle('ADVENTURE', 200+bob, 52, '#fff');
  hud('Plataformas 2D · PWA movil', W/2, 238+bob, UI.dim, 18, 'center');
  uiPanel(W/2-200, 262, 400, 480, 20);
  for (let i=0;i<menuItems.length;i++) uiMenuRow(menuItems[i], 318+i*54, i===menuSel, 360, 44);
  // Info pills top
  uiPill(16, 36, 'Best: '+gs.highScore, UI.cyan);
  drawCoinIcon(16, 58, 9); hud(' '+gs.wallet, 32, 64, UI.gold, 17);
  uiPill(16, 88, CHARACTERS[gs.character].name, UI.gold);
  uiPill(16, 118, 'Dif: '+diff().name, diff().color);
  uiFooter('WASD/Flechas · Espacio · Esc');
  hud(GAME_VERSION, W-12, H-12, 'rgba(255,255,255,0.4)', 13, 'right');
}

function drawBearSil(x,y,s) {
  ctx.fillStyle='rgba(0,0,0,0.4)';
  ctx.fillRect(x,y,s*0.7,s); // body
  ctx.fillRect(x-s*0.1,y-s*0.35,s*0.9,s*0.4); // head
  ctx.fillRect(x-s*0.15,y-s*0.5,s*0.25,s*0.2); // ear l
  ctx.fillRect(x+s*0.5,y-s*0.5,s*0.25,s*0.2); // ear r
}

// ── Instructions ───────────────────────────────────────────────────────────
function drawInstructions() {
  uiBgGrad('#0a180a','#0d2b0d', false);
  uiTitle('INSTRUCCIONES', 72, 40);
  uiPanel(W/2-340, 95, 680, 560, 18);
  const lines=[
    ['MOVE','← → / A D'],['JUMP','Space / W / ↑'],['DOUBLE JUMP','Double Jump power-up + Space'],
    ['SPECIAL','J / Shift  (boton SP)  — unico por personaje'],
    ['STOMP','Jump on enemies to defeat them'],
    ['CHECKPOINT','Bandera verde: reapareces ahi al morir'],
    ['PELIGROS','Evita pinchos y sierras (el dash/escudo te protege)'],
    ['PAUSE','Esc / P'],['',''],
    ['COINS','50 pts  ★ Stars: 200 pts'],['ENEMIES','100 pts  Boss: 1000 pts'],
    ['TIPOS','Patrulla, perseguidor, volador, saltarin, escupidor'],
    ['+ TIPOS','Cazador  ·  Blindado (embiste)  ·  Mini-jefe (dispara/invoca)'],
    ['GOAL','Reach the green flag → 500 pts'],['',''],
    ['ONLINE','Menu MULTIJUGADOR: crea sala o unete con codigo de 6 letras'],
    ['INVITAR','Copia el enlace y envialo — ambos juegan el mismo nivel'],
    ['POWER-UPS','2x=Double Jump  →→=Speed  ★=Invincible'],
  ];
  ctx.textAlign='left'; ctx.font='18px monospace';
  lines.forEach(([k,v],i)=>{
    if(!k && !v) return;
    ctx.fillStyle=UI.gold; ctx.fillText(k,W/2-300,118+i*34);
    ctx.fillStyle=UI.bright; ctx.fillText(v,W/2-60,118+i*34);
  });
  uiFooter('Enter / Esc para volver');
  if (pressed('Enter')||pressed('Escape')) changeScene('menu');
}

// ── World Map ──────────────────────────────────────────────────────────────
let wmSel=0, wmLvl=0;
const worldNames=['FOREST','CAVE','SNOW','LAVA','SKY','VALLE','OCEAN','DESERT','CRYSTAL','COSMOS'];
const worldColors=[
  ['#2d6e1a','#1a4010'],['#2a3f5a','#0d1b2a'],['#6090b0','#3060a0'],
  ['#7a2418','#3a0d08'],['#5a86c0','#2b4f7a'],['#a08030','#6a5018'],
  ['#2a8a9a','#145a70'],['#d4a850','#a07828'],['#9a60e0','#5a28a0'],['#6a70c0','#2a3068']
];
const worldHints=['','','','','','Valle: exploracion tranquila','Ocean: corales y corrientes','Desert: arenas movedizas','Crystal: rayos laser','Cosmos: gravedad baja'];

function updateWorldMap(dt) {
  if (mp.active && mp.role==='guest') {
    if (pressed('Escape')) { changeScene('menu'); return; }
    return;
  }
  const prevSel=wmSel, prevLvl=wmLvl;
  if (pressed('ArrowLeft'))  wmSel=Math.max(0,wmSel-1);
  if (pressed('ArrowRight')) wmSel=Math.min(LAST_WORLD,wmSel+1);
  if (pressed('ArrowUp'))    wmLvl=Math.max(0,wmLvl-1);
  if (pressed('ArrowDown'))  wmLvl=Math.min(2,wmLvl+1);
  if (wmSel!==prevSel || wmLvl!==prevLvl) mpHostBroadcast();
  if (pressed('Enter')||pressed('Space')) {
    if (gs.worldUnlocked[wmSel]) {
      sfx.select();
      gs.world=wmSel; gs.level=wmLvl;
      startLevel(); changeScene('gameplay');
      mpHostBroadcast();
    }
  }
  if (pressed('Escape')) { if(mp.active) mpDisconnect(); changeScene('menu'); }
}

function drawWorldMap(t) {
  uiBgGrad('#080c14','#141e2e'); uiSparkles(t*0.5, 24);
  uiTitle('MAPA DE MUNDOS', 48, 38);

  const cardW=WORLD_COUNT>5?178:210, gap=WORLD_COUNT>5?10:18, rowGap=18;
  const rows=Math.ceil(WORLD_COUNT/WORLDS_PER_ROW);
  const cardH=250, baseY=H/2-60-(rows>1?70:0);

  for (let wi=0;wi<WORLD_COUNT;wi++) {
    const row=Math.floor(wi/WORLDS_PER_ROW), col=wi%WORLDS_PER_ROW;
    const colsInRow=Math.min(WORLDS_PER_ROW, WORLD_COUNT-row*WORLDS_PER_ROW);
    const totalW=colsInRow*cardW+(colsInRow-1)*gap, startX=(W-totalW)/2;
    const cx=startX+col*(cardW+gap)+cardW/2, cy=baseY+row*(cardH+rowGap);
    const locked=!gs.worldUnlocked[wi], sel=wi===wmSel;
    const [c1,c2]=worldColors[wi];
    const bx=cx-cardW/2, by=cy-cardH/2+10;
    if(sel){ ctx.shadowColor='rgba(255,215,0,0.35)'; ctx.shadowBlur=16; }
    fillRR(bx,by,cardW,cardH,16, locked?'#222830':c2);
    if(!locked){ const cg=ctx.createLinearGradient(bx,by,bx,by+cardH); cg.addColorStop(0,c1); cg.addColorStop(1,c2);
      fillRR(bx,by,cardW,cardH,16,cg); }
    ctx.shadowBlur=0;
    strokeRR(bx,by,cardW,cardH,16, sel?UI.gold:'rgba(255,255,255,0.15)', sel?3:1);

    ctx.fillStyle=locked?'#666':UI.bright;
    ctx.font='bold 17px monospace'; ctx.textAlign='center';
    ctx.fillText(worldNames[wi],cx,cy-78);

    if (locked) {
      ctx.fillStyle=UI.dim; ctx.font='14px monospace';
      ctx.fillText('BLOQUEADO',cx,cy+8); ctx.fillText('Completa el',cx,cy+28); ctx.fillText('mundo anterior',cx,cy+46);
    } else {
      for (let lv=0;lv<3;lv++) {
        const lx=cx+(lv-1)*52, ly=cy+38, lvsel=sel&&lv===wmLvl, done=gs.levelDone[wi][lv], r=lvsel?14:10;
        fillRR(lx-r,ly-r,r*2,r*2,r, done?UI.gold:lvsel?UI.green:'rgba(255,255,255,0.85)');
        if(lvsel) strokeRR(lx-r,ly-r,r*2,r*2,r,UI.gold,2);
        ctx.fillStyle=done?'#111':'#222'; ctx.font=`bold ${lvsel?14:11}px monospace`;
        ctx.fillText(lv+1,lx,ly+4);
        if (done) { ctx.fillStyle=UI.gold; ctx.font='12px monospace'; ctx.fillText('*',lx,ly+24); }
      }
      if(sel){ ctx.fillStyle=UI.dim; ctx.font='13px monospace'; ctx.fillText('W'+(wi+1)+'-'+(wmLvl+1),cx,cy+78); }
    }
  }

  fillRR(0,H-68,W,68,0,'rgba(0,0,0,0.65)');
  hud('Vidas:'+gs.lives+'  Monedas:'+gs.coins+'  Score:'+gs.score, W/2, H-24, UI.bright, 18, 'center');
  uiFooter('Enter=Jugar  Flechas=Navegar  Esc=Menu');
  const hint=worldHints[wmSel];
  if(hint) hud(hint, W/2, H-50, worldColors[wmSel][0], 14, 'center');
  if (mp.active && mp.role==='guest') {
    fillRR(W/2-220, H-120, 440, 52, 14, 'rgba(0,120,200,0.45)');
    hud('Esperando al anfitrion...', W/2, H-92, '#7df', 18, 'center');
  } else if (mp.active && mp.role==='host' && mp.connected) {
    uiPill(W/2-100, H-100, 'Amigo conectado', UI.green);
  }
}

// ── Pause Scene ────────────────────────────────────────────────────────────
let pauseSel=0;
const pauseItems=['RESUME','RESTART LEVEL','MAIN MENU'];

function updatePause(dt) {
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
  drawBg(levelData.bg, levelData.levelW);
  drawPlatforms(levelData.platforms, gs.world);
  for (const it of items) drawCollectible(it, gameTimer);
  drawGoal(...goalPos, t);
  for (const e of enemies) drawEnemy(e);
  drawPlayer(player);
  fillRR(0,0,W,H,0,'rgba(0,0,0,0.6)');
  uiPanel(W/2-230,H/2-175,460,350,22);
  uiTitle('PAUSA', H/2-125, 36);
  for (let i=0;i<pauseItems.length;i++) uiMenuRow(pauseItems[i], H/2-55+i*68, i===pauseSel, 380, 46);
}

// ── Game Over ──────────────────────────────────────────────────────────────
let goSel=0, goT=0;

function updateGameOver(dt) {
  goT+=dt;
  if (pressed('ArrowLeft')||pressed('ArrowRight')) goSel=(goSel+1)%2;
  if (pressed('Enter')||pressed('Space')) {
    if (goSel===0) { gs.lives=startLives(); startLevel(); changeScene('gameplay'); }
    else           { gs.lives=startLives(); gs.score=0; gs.coins=0; changeScene('menu'); menuSel=0; }
  }
}

function drawGameOver() {
  uiBgGrad('#1a0505','#3a0808', false);
  const scale=1+Math.sin(goT*3)*0.04;
  ctx.save(); ctx.translate(W/2,H/2-90); ctx.scale(scale,scale);
  uiTitle('GAME OVER', 0, 64, UI.red); ctx.restore();
  uiPanel(W/2-260,H/2-20,520,200,18);
  hud('Score: '+gs.score+'    Monedas: '+gs.coins, W/2, H/2+10, UI.bright, 22, 'center');
  hud('Record: '+gs.highScore, W/2, H/2+44, UI.cyan, 20, 'center');
  uiBtn(W/2-200,H/2+80,180,48,'REINTENTAR',goSel===0);
  uiBtn(W/2+20,H/2+80,180,48,'MENU',goSel===1);
  uiFooter('Flechas + Enter');
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
  const n=8;
  if (pressed('ArrowUp')||pressed('KeyW'))   { setSel=(setSel-1+n)%n; sfx.select(); }
  if (pressed('ArrowDown')||pressed('KeyS')) { setSel=(setSel+1)%n; sfx.select(); }
  if (pressed('Escape')) { saveGame(); changeScene('menu'); return; }
  const right=pressed('ArrowRight'), left=pressed('ArrowLeft'), enter=pressed('Enter')||pressed('Space');
  if (right||left||enter) {
    if (setSel===0)      { audio.sound=!audio.sound; sfx.select(); }
    else if (setSel===1) { audio.music=!audio.music; if(audio.music)musicStart(); else musicStop(); sfx.select(); }
    else if (setSel===2) { const d=left?-1:1; gs.difficulty=(gs.difficulty+d+DIFFICULTIES.length)%DIFFICULTIES.length; sfx.select(); }
    else if (setSel===3) { gs.fxShake=!gs.fxShake; sfx.select(); }
    else if (setSel===4) { gs.fxParticles=!gs.fxParticles; sfx.select(); }
    else if (setSel===5) { gs.vibration=!gs.vibration; sfx.select(); }
    else if (setSel===6) { if(enter){ resetProgress(); sfx.select(); } }
    else if (setSel===7) { if(enter){ saveGame(); changeScene('menu'); sfx.select(); return; } }
    saveGame();
  }
}
function drawSettings() {
  uiBgGrad('#0a1420','#0d1b2a', false);
  uiTitle('AJUSTES', 68, 42);
  uiPanel(W/2-370,100,740,480,18);
  const opts=[
    ['Efectos de sonido', audio.sound?'ON':'OFF'],
    ['Musica', audio.music?'ON':'OFF'],
    ['Dificultad', diff().name],
    ['Sacudida de pantalla', gs.fxShake?'ON':'OFF'],
    ['Particulas', gs.fxParticles?'ON':'OFF'],
    ['Vibracion tactil', gs.vibration?'ON':'OFF'],
    ['Reiniciar progreso',''],
    ['Volver',''],
  ];
  opts.forEach((o,i)=>{
    let vc=o[1]; if(o[1]==='ON') vc=UI.green; else if(o[1]==='OFF') vc=UI.red;
    if(i===2) vc=diff().color;
    uiListRow(155+i*52, o[0], o[1], i===setSel, vc);
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
function drawStatBar(x,y,w,val,label,color){
  const frac=Math.min(1,Math.max(0.06,(val-0.8)/0.6));
  ctx.textAlign='left'; ctx.font='14px monospace'; ctx.fillStyle=UI.dim; ctx.fillText(label,x,y+9);
  uiBar(x+48,y,w-48,12,frac,color);
}
function drawCharSelect() {
  uiBgGrad('#0a1018','#101826', false); uiSparkles(charT*0.3, 20);
  uiTitle('PERSONAJES', 72, 40);
  uiPanel(W/2-220,110,440,380,20);
  const ch = CHARACTERS[charSel];
  const unlocked = isCharUnlocked(charSel);
  const bob = Math.sin(charT*4)*6;

  fillRR(140,268,56,56,14,'rgba(255,215,0,0.12)'); strokeRR(140,268,56,56,14,UI.gold,1);
  fillRR(W-196,268,56,56,14,'rgba(255,215,0,0.12)'); strokeRR(W-196,268,56,56,14,UI.gold,1);
  ctx.fillStyle=UI.gold; ctx.font='bold 36px monospace'; ctx.textAlign='center';
  ctx.fillText('<', 168, 306); ctx.fillText('>', W-168, 306);

  // Big preview (or locked silhouette)
  ctx.save();
  ctx.translate(W/2, 270+bob);
  ctx.scale(5.5,5.5);
  if (unlocked) {
    ch.draw({facing:1,power:null,invTimer:0}, -PLAYER_W/2, -PLAYER_H/2);
  } else {
    ctx.fillStyle='#2b3240'; ctx.fillRect(-PLAYER_W/2,-PLAYER_H/2,PLAYER_W,PLAYER_H);
    ctx.fillStyle='#566'; ctx.font='bold 30px monospace'; ctx.textAlign='center'; ctx.fillText('?',0,12);
  }
  ctx.restore();

  // Name
  ctx.fillStyle=unlocked?UI.bright:UI.dim; ctx.font='bold 36px monospace'; ctx.textAlign='center';
  ctx.fillText(unlocked?ch.name:'???', W/2, 470);

  if (!unlocked) {
    hud('BLOQUEADO', W/2, 515, UI.red, 22, 'center');
    hud('Completa '+ch.unlock+' mundo(s)', W/2, 548, UI.dim, 18, 'center');
  } else {
    const bx=W/2-180, bw=360;
    drawStatBar(bx, 495, bw, ch.speed, 'SPD', UI.green);
    drawStatBar(bx, 520, bw, ch.jump,  'JMP', UI.cyan);
    hud('Especial: '+ch.special.name, W/2, 560, UI.gold, 19, 'center');
    hud(ch.desc, W/2, 588, UI.dim, 17, 'center');
    if (gs.character===charSel) uiPill(W/2-40, 618, 'EN USO', UI.green);
  }

  const n=CHARACTERS.length, dotW=16, totalW=n*dotW, sx=W/2-totalW/2;
  for(let i=0;i<n;i++){
    fillRR(sx+i*dotW, 636, 12, 12, 6, i===charSel?UI.gold:(isCharUnlocked(i)?'#556':'#333'));
  }
  uiFooter('Izq/Der · Enter · Esc');
}

// ── Shop Scene ───────────────────────────────────────────────────────────────
let shopSel=0;
function buildShop(){
  const list=[];
  if(!gs.magnet) list.push({key:'magnet', label:'Iman de monedas', desc:'Atrae monedas cercanas', cost:300});
  if(gs.bonusLives<3) list.push({key:'life', label:'Vida extra inicial', desc:`Empiezas con +1 vida  (${gs.bonusLives}/3)`, cost:200*(gs.bonusLives+1)});
  for(let i=0;i<CHARACTERS.length;i++){
    const c=CHARACTERS[i];
    if((c.unlock||0)>0 && !(gs.bought&&gs.bought[i]) && worldsCleared()<c.unlock){
      list.push({key:'char', idx:i, label:'Personaje: '+c.name, desc:c.desc, cost:150*c.unlock});
    }
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
  if(shopSel>=n) shopSel=n-1; if(shopSel<0) shopSel=0;
  if(pressed('ArrowUp')||pressed('KeyW')){ shopSel=(shopSel-1+n)%n; sfx.select(); }
  if(pressed('ArrowDown')||pressed('KeyS')){ shopSel=(shopSel+1)%n; sfx.select(); }
  if(pressed('Escape')){ changeScene('menu'); return; }
  if((pressed('Enter')||pressed('Space')) && list.length){ buyShop(list[shopSel]); }
  if(banner){ banner.life-=dt; if(banner.life<=0) banner=null; }
}
function drawShop(){
  uiBgGrad('#100818','#161020', false);
  uiTitle('TIENDA', 72, 42);
  drawCoinIcon(W/2-60, 108, 12); hud(' '+gs.wallet+' monedas', W/2+10, 114, UI.gold, 22, 'center');
  uiPanel(W/2-380,130,760,480,18);
  const list=buildShop();
  if(!list.length){
    hud('Todo comprado. Buen trabajo!', W/2, H/2, UI.green, 24, 'center');
  } else {
    list.forEach((o,i)=>{
      const y=175+i*58, afford=gs.wallet>=o.cost;
      uiListRow(y, o.label, o.cost+' mon.', i===shopSel, afford?UI.gold:UI.red);
      hud(o.desc, W/2-330, y+18, UI.dim, 14);
