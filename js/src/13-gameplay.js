// === 13-gameplay.js (from index.html lines 1694-1980) ===
  const wave = Math.sin(t*6)*6;
  const wave2 = Math.sin(t*6+1.2)*4;
  // Pole
  ctx.fillStyle='#6a6a78'; ctx.fillRect(x+17,y-162,5,162);
  ctx.fillStyle='#888898'; ctx.fillRect(x+18,y-162,2,162);
  ctx.fillStyle=UI.gold; ctx.beginPath(); ctx.arc(x+19.5,y-165,7,0,Math.PI*2); ctx.fill();
  // Waving flag
  ctx.fillStyle='#2a9d4a'; ctx.beginPath();
  ctx.moveTo(x+22,y-158);
  ctx.quadraticCurveTo(x+48+wave,y-152, x+54+wave2,y-142);
  ctx.lineTo(x+50+wave,y-132);
  ctx.quadraticCurveTo(x+38+wave*0.5,y-138, x+22,y-138);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=1; ctx.stroke();
  // Finish zone glow
  const pulse = 0.22+0.12*Math.sin(t*3);
  ctx.globalAlpha=pulse; fillRR(x-2,y,44,78,8,'#39d353'); ctx.globalAlpha=1;
  strokeRR(x-2,y,44,78,8,'rgba(57,211,83,0.6)',2);
  ctx.fillStyle='rgba(255,255,255,0.7)'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText('META', x+20, y+44);
}

// ── Background ─────────────────────────────────────────────────────────────
function drawBg(bg, levelW) {
  const w = gs.world;
  const grad = ctx.createLinearGradient(0,0,0,H);
  grad.addColorStop(0, bg[1]); grad.addColorStop(1, bg[0]);
  ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);
  const off = cam.x*0.3;
  if (w===7) {
    for (let i=0;i<18;i++) {
      const bx=((i*260+80)-off%levelW+levelW)%levelW-cam.x, by=80+((i*53)%500);
      if (bx>-40&&bx<W+40) { ctx.globalAlpha=0.25; ctx.fillStyle='#7df'; ctx.beginPath(); ctx.arc(bx,by,6+((i*7)%8),0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1; }
    }
  } else if (w===8) {
    ctx.fillStyle='rgba(255,220,120,0.35)'; ctx.beginPath(); ctx.arc(W*0.82,90,50,0,Math.PI*2); ctx.fill();
    for (let i=0;i<14;i++) {
      const sx=((i*310)-off*0.15%levelW+levelW)%levelW-cam.x, sy=H-40-((i*41)%30);
      if (sx>-60&&sx<W+60) { ctx.fillStyle='rgba(200,160,80,0.35)'; ctx.fillRect(sx,sy,80,8); }
    }
  } else if (w===9) {
    for (let i=0;i<24;i++) {
      const sx=((i*190+50)-off*0.5%levelW+levelW)%levelW-cam.x, sy=40+((i*67)%600);
      if (sx>-10&&sx<W+10) { ctx.fillStyle=['#c8f','#8af','#f8f'][i%3]; ctx.globalAlpha=0.5; ctx.fillRect(sx,sy,4,14); ctx.globalAlpha=1; }
    }
  } else if (w===10) {
    for (let i=0;i<80;i++) {
      const sx=(i*97+(i*13)%200)%W, sy=(i*61)%H;
      ctx.fillStyle=i%5===0?'#fff':'#ccc'; ctx.globalAlpha=0.35+(i%5)*0.1;
      ctx.fillRect(sx,sy,2,2); ctx.globalAlpha=1;
    }
  } else {
    ctx.fillStyle='rgba(255,255,255,0.15)';
    for (let i=0;i<20;i++) {
      const cx2=((i*400+200)-off%levelW+levelW)%levelW - cam.x;
      if (cx2>-200&&cx2<W+200) {
        ctx.fillRect(cx2,60+((i*73)%120),80+((i*37)%60),20);
        ctx.fillRect(cx2+20,45+((i*73)%120),50,20);
      }
    }
  }
}
function drawPlatforms(plats, world) {
  const cols = [
    ['#3d7a2a','#2d5a1b'],['#4a3520','#2d1f0f'],['#b0c8e0','#8aaac0'],
    ['#8a3320','#5a1e10'],['#dfeaf6','#a9c4e0'],['#d4b860','#9a7830'],
    ['#2a8a9a','#145a70'],['#d4a850','#a07828'],['#9a60e0','#5a28a0'],['#4a5080','#1a2048']
  ];
  const [top,side] = cols[world]||cols[0];
  for (const [px,py,pw,ph] of plats) {
    ctx.fillStyle=side; ctx.fillRect(px-cam.x,py-cam.y,pw,ph);
    ctx.fillStyle=top;  ctx.fillRect(px-cam.x,py-cam.y,pw,Math.min(8,ph));
  }
}

// ── Gameplay Scene State ───────────────────────────────────────────────────
let player, enemies, items, hazards, checkpoints, goalPos, levelData, gameTimer;
let levelCoins = 0, levelStars = 0, runNoHit = true;
let lcStats = null, lcT = 0; // level-complete screen data

function startLevel() {
  levelData = mkLevel(gs.world, gs.level);
  player = mkPlayer();
  if(mp.active && mp.connected){
    player.x = mp.role==='host' ? 80 : 150;
    player.respawnX = player.x;
  }
  player.lives = gs.lives;
  enemies = mkEnemies(levelData.enemies.concat(extraEnemies(gs.world, gs.level)));
  items = mkCollectibles(levelData.coins, levelData.stars, levelData.powerups);
  hazards = mkHazards(hazardData(gs.world, gs.level));
  checkpoints = computeCheckpoints(levelData);
  projectiles = [];
  goalPos = levelData.goal;
  gameTimer = 0;
  levelCoins = 0; levelStars = 0; runNoHit = true;
  particles = [];
  fx = []; shake = 0; flash = null; banner = null;
  camUpdate(player.x, player.y, levelData.levelW, true);
}

function updateGameplay(dt) {
  gameTimer += dt;
  const ld = levelData;

  updatePlayer(player, dt, ld.platforms, ld.levelW);
  applyHazardModifiers(player);
  for (const e of enemies) updateEnemy(e, dt, ld.platforms, player.x, player.y, ld.levelW);
  updateHazards(dt);
  updateProjectiles(dt, ld.levelW);
  updateCheckpoints();
  updateParticles(dt);
  updateFx(dt);

  // Coin magnet (bought in the shop): pull nearby uncollected coins to the bear.
  if (gs.magnet) {
    const pcx=player.x+player.w/2, pcy=player.y+player.h/2;
    for (const it of items) {
      if (it.taken || it.type!=='coin') continue;
      const dx=pcx-(it.x+it.w/2), dy=pcy-(it.y+it.h/2), d=Math.hypot(dx,dy);
      if (d<220 && d>1) { const s=Math.min(1,520/d)*420*dt; it.x+=dx/d*s; it.y+=dy/d*s; }
    }
  }

  // Collectibles
  for (const it of items) {
    if (it.taken) continue;
    if (!rectOverlap(player.x,player.y,player.w,player.h, it.x,it.y,it.w,it.h)) continue;
    it.taken = true;
    const cx=it.x+it.w/2, cy=it.y+it.h/2;
    if (it.type==='coin')  { gs.score+=COIN_PTS; gs.coins++; gs.wallet++; levelCoins++; sfx.coin(); spawnParticles(cx,cy,'#FFD700',6); spawnText(cx,cy-8,'+'+COIN_PTS,'#FFD700',14); unlockAch('firstcoin'); checkCollectAch(); }
    else if (it.type==='star') { gs.score+=STAR_PTS; levelStars++; sfx.star(); spawnParticles(cx,cy,'#FFE066',14,220); spawnRing(cx,cy,'#FFE066',40,0.35); spawnText(cx,cy-8,'+'+STAR_PTS,'#FFE066',18); }
    else if (it.type==='life') { if (gs.lives<maxLives()){ gs.lives++; player.lives=gs.lives; } sfx.power(); spawnParticles(cx,cy,'#ff5d77',14,220); spawnRing(cx,cy,'#ff5d77',44,0.4); spawnText(cx,cy-8,'+1 VIDA','#ff8da1',16); }
    else { player.power=it.type; player.powerTimer=10; if(it.type==='djump')player.djumpUsed=false; sfx.power(); spawnParticles(cx,cy,'#0ff',14,220); spawnRing(cx,cy,'#0ff',44,0.4); spawnText(cx,cy-8,it.type.toUpperCase()+'!','#0ff',16); }
  }

  // Special offensive frames (punch / dash): defeat enemies on contact, take no damage
  if ((player.attackTimer>0 || player.dashTimer>0) && player.respawnTimer<=0) {
    const reach = player.attackTimer>0 ? 44 : 8;
    const hx = player.facing>0 ? player.x - 4 : player.x - reach;
    const hw = player.w + reach + 4;
    for (const e of enemies) {
      if (!e.active) continue;
      if (!rectOverlap(hx,player.y,hw,player.h, e.x,e.y,e.w,e.h)) continue;
      const ecx=e.x+e.w/2, ecy=e.y+e.h/2;
      if (e.type==='boss') {
        e.hp--; e.hitFlash=0.25; e.range=Math.floor(e.range*1.15);
        spawnSparks(ecx,ecy,'#fff',14,360); spawnRing(ecx,ecy,'#ffcf3a',60,0.35); addShake(0.16); addFlash('#fff',0.08);
        if (e.hp<=0) { e.active=false; gs.score+=BOSS_PTS; spawnParticles(ecx,ecy,'#FFD700',26,300); spawnRing(ecx,ecy,'#FFD700',110,0.5); spawnText(ecx,ecy-10,'+'+BOSS_PTS,'#FFD700',22); addShake(0.3); addFlash('#fff',0.15); dropReward(ecx,ecy,true); }
        else { gs.score+=100; spawnText(ecx,ecy-10,'HIT! '+e.hp,'#fff',16); }
        player.attackTimer = 0; // one hit per punch
      } else if (e.type==='miniboss') {
        e.hp--; e.hitFlash=0.2; spawnSparks(ecx,ecy,'#fff',12,320); spawnRing(ecx,ecy,'#b06bff',60,0.35); addShake(0.14);
        if (e.hp<=0) { e.active=false; gs.score+=MINIBOSS_PTS; spawnParticles(ecx,ecy,'#b06bff',22,260); spawnRing(ecx,ecy,'#b06bff',95,0.45); spawnText(ecx,ecy-10,'+'+MINIBOSS_PTS,'#c9f',20); addShake(0.22); addFlash('#fff',0.12); dropReward(ecx,ecy); }
        else { gs.score+=80; spawnText(ecx,ecy-10,'HIT! '+e.hp,'#fff',16); }
        player.attackTimer = 0; // one hit per punch
      } else {
        e.active=false; gs.score+=ENEMY_PTS;
        spawnParticles(ecx,ecy,'#fff',14); spawnSparks(ecx,ecy,'#ffd24d',8,300); spawnText(ecx,ecy-8,'+'+ENEMY_PTS,'#fff',14);
      }
    }
  }

  // Enemy collisions
  if (player.invTimer<=0 && player.respawnTimer<=0 && (player.power!=='inv')) {
    for (const e of enemies) {
      if (!e.active) continue;
      if (!rectOverlap(player.x,player.y,player.w,player.h, e.x,e.y,e.w,e.h)) continue;
      // Stomp?
      const stomp = player.vy>=6 && (player.y+player.h) <= e.y+(e.h/2+12);
      const ecx=e.x+e.w/2, ecy=e.y+e.h/2;
      if (stomp) {
        player.vy = STOMP_BOUNCE; sfx.stomp();
        if (e.type==='armor') {
          // Armored: stomping just clangs off — must be hit with a special.
          e.hitFlash=0.12; spawnSparks(ecx,ecy,'#dde',10,220); spawnText(ecx,ecy-8,'CLANC!','#cdd',14);
        } else if (e.type==='miniboss') {
          e.hp--; e.hitFlash=0.2; spawnParticles(ecx,ecy,'#c9f',12); spawnRing(ecx,ecy,'#b06bff',60,0.35); addShake(0.14);
          if (e.hp<=0) { e.active=false; gs.score+=MINIBOSS_PTS; spawnParticles(ecx,ecy,'#b06bff',22,260); spawnRing(ecx,ecy,'#b06bff',95,0.45); spawnText(ecx,ecy-10,'+'+MINIBOSS_PTS,'#c9f',20); addShake(0.22); addFlash('#fff',0.12); dropReward(ecx,ecy); }
          else { gs.score+=80; spawnText(ecx,ecy-10,'HIT! '+e.hp,'#fff',16); }
        } else if (e.type==='boss') {
          spawnParticles(ecx,ecy,'#fff',10); spawnDust(ecx,ecy+e.h/2,6,'#ddd');
          e.hp--;
          e.hitFlash=0.25;
          e.range = Math.floor(e.range*1.15);
          spawnRing(ecx,ecy,'#ffcf3a',60,0.35); addShake(0.16);
          if (e.hp<=0) { e.active=false; gs.score+=BOSS_PTS; spawnParticles(ecx,ecy,'#FFD700',24,260); spawnRing(ecx,ecy,'#FFD700',110,0.5); spawnText(ecx,ecy-10,'+'+BOSS_PTS,'#FFD700',22); addShake(0.3); addFlash('#fff',0.15); dropReward(ecx,ecy,true); }
          else { gs.score+=100; spawnText(ecx,ecy-10,'HIT! '+e.hp,'#fff',16); }
        } else {
          spawnParticles(ecx,ecy,'#fff',10); spawnDust(ecx,ecy+e.h/2,6,'#ddd');
          e.active=false; gs.score+=ENEMY_PTS; spawnText(ecx,ecy-8,'+'+ENEMY_PTS,'#fff',14);
        }
      } else {
        sfx.hurt(); gs.lives--; player.lives=gs.lives; runNoHit=false;
        addFlash('#ff2b2b',0.22); addShake(0.2);
        spawnText(player.x+player.w/2, player.y-6, '-1', '#ff4d4d', 20);
        if (gs.lives<=0) { gameOver(); return; }
        respawnPlayer();
      }
    }
  }

  // Hazard collisions (spikes / saws / coral / beam / meteor). Special i-frames, the Inv power and the
  // Rewind shield all protect you, so dashing through is briefly safe.
  if (player.invTimer<=0 && player.respawnTimer<=0 && player.power!=='inv') {
    for (const h of hazards) {
      if (h.type==='quicksand') continue;
      let hx=h.x, hy=h.y, hw=h.w, hh=h.h;
      if (h.type==='spikes' || h.type==='coral') { hy+=6; hh-=6; }
      else if (h.type==='beam') { hy+=2; hh-=4; }
      else if (h.type==='meteor') { hx+=4; hy+=4; hw-=8; hh-=8; }
      else { hx+=6; hy+=6; hw-=12; hh-=12; }
      if (!rectOverlap(player.x+4,player.y+4,player.w-8,player.h-4, hx,hy,hw,hh)) continue;
      sfx.hurt(); gs.lives--; player.lives=gs.lives; runNoHit=false;
      addFlash('#ff2b2b',0.22); addShake(0.2); maybeVibrate(40);
      spawnText(player.x+player.w/2, player.y-6, '-1', '#ff4d4d', 20);
      if (gs.lives<=0) { gameOver(); return; }
      respawnPlayer();
      break;
    }
  }

  // Projectile collisions. Absorbed harmlessly while protected; otherwise hurt.
  for (let i=projectiles.length-1; i>=0; i--) {
    const pr = projectiles[i];
    if (!rectOverlap(player.x,player.y,player.w,player.h, pr.x,pr.y,pr.w,pr.h)) continue;
    const cxp=pr.x+pr.w/2, cyp=pr.y+pr.h/2;
    projectiles.splice(i,1);
    const protectedNow = player.invTimer>0 || player.respawnTimer>0 || player.power==='inv';
    if (protectedNow) { spawnSparks(cxp,cyp,'#b06bff',8,220); continue; }
    sfx.hurt(); gs.lives--; player.lives=gs.lives; runNoHit=false;
    addFlash('#ff2b2b',0.22); addShake(0.18);
    spawnParticles(cxp,cyp,'#b06bff',10,200);
    spawnText(player.x+player.w/2, player.y-6, '-1', '#ff4d4d', 20);
    if (gs.lives<=0) { gameOver(); return; }
    respawnPlayer();
    break;
  }

  // Pit death
  if (player.y > 800) {
    sfx.hurt(); gs.lives--; player.lives=gs.lives; runNoHit=false;
    addFlash('#ff2b2b',0.22); addShake(0.2);
    if (gs.lives<=0) { gameOver(); return; }
    respawnPlayer();
  }

  // Goal
  if (rectOverlap(player.x,player.y,player.w,player.h, goalPos[0],goalPos[1],40,80)) {
    sfx.win();
    spawnRing(goalPos[0]+20,goalPos[1]+40,'#39d353',120,0.6);
    spawnSparks(goalPos[0]+20,goalPos[1]+20,'#39d353',24,360);
    spawnText(goalPos[0]+20,goalPos[1],'LEVEL CLEAR!','#39d353',20);
    addFlash('#fff',0.18);
    const mult = diff().score;
    const timeBonus = Math.round(Math.max(0, 2000 - gameTimer*20) * mult);
    const base = Math.round(LEVEL_PTS * mult);
    gs.score += base + timeBonus;
    if (gs.score > gs.highScore) gs.highScore = gs.score;
    gs.levelDone[gs.world][gs.level] = true;
    if (gs.level===2 && gs.world<LAST_WORLD) gs.worldUnlocked[gs.world+1]=true;
    if (runNoHit) unlockAch('nohit');
    if (gameTimer < 20) unlockAch('speed');
    checkCollectAch();
    saveGame();
    lcStats = { world:gs.world, level:gs.level, time:gameTimer, bonus:timeBonus, base:base, coins:levelCoins, stars:levelStars };
    changeScene('levelcomplete'); lcT=0;
    return;
  }

  camUpdate(player.x, player.y, ld.levelW);
  if (gs.score > gs.highScore) gs.highScore = gs.score;
  mpTick(dt);

  // Pause
  if (pressed('Escape')||pressed('KeyP')) { gs.scene='pause'; pauseSel=0; }
}

function gameOver(){
  if (gs.score>gs.highScore) gs.highScore=gs.score;
  saveGame();
  changeScene('gameover'); goSel=0; goT=0;
}

function respawnPlayer() {
  player.x=player.respawnX||80; player.y=player.respawnY||570; player.vx=0; player.vy=0;
  player.invTimer=2; player.respawnTimer=1.5;
  camUpdate(player.x, player.y, levelData.levelW, true);
}

function advanceLevel() {
  if (gs.level < 2) {
    gs.level++;
    startLevel();
    changeScene('gameplay');
  } else if (gs.world < LAST_WORLD) {
    gs.world++; gs.level=0;
    changeScene('worldmap'); wmSel=gs.world; wmLvl=0;
  } else {
    changeScene('victory'); vicT=0;   // cleared all worlds
  }
}

function drawGameplay(t) {
  const ld = levelData;
  // Screen shake: jitter the camera during world rendering, then restore.
  const sx=cam.x, sy=cam.y;
  if (shake>0 && gs.fxShake!==false) { const m=Math.min(8, shake*55); cam.x+=(Math.random()*2-1)*m; cam.y+=(Math.random()*2-1)*m; }
  drawBg(ld.bg, ld.levelW);
  drawPlatforms(ld.platforms, gs.world);
  drawCheckpoints();
  drawHazards();
  drawProjectiles();
  for (const it of items) drawCollectible(it, t);
  drawGoal(...goalPos, t);
  for (const e of enemies) drawEnemy(e);
  drawFx();
  drawParticles();
