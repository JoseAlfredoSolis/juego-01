// === 12-entities.js (from index.html lines 1006-1693) ===
  if(!sceneTrans.active) return;
  const a=sceneTrans.mode==='out' ? sceneTrans.t/sceneTrans.dur : 1-sceneTrans.t/sceneTrans.dur;
  const fade=clamp(a,0,1);
  ctx.fillStyle=`rgba(6,10,18,${fade*0.9})`; ctx.fillRect(0,0,W,H);
  if(fade>0.45 && fade<0.55){
    ctx.strokeStyle=`rgba(255,215,0,${0.25*(1-Math.abs(fade-0.5)*20)})`;
    ctx.lineWidth=2; ctx.strokeRect(W/2-120,H/2-2,240,4);
  }
}
function renderScene(){ return (sceneTrans.active && sceneTrans.mode==='out') ? sceneTrans.from : gs.scene; }
function sceneUpdating(){ return !sceneTrans.active || sceneTrans.mode==='in'; }

// ── Physics ────────────────────────────────────────────────────────────────
function resolveX(e, plats) {
  for (const p of plats) {
    if (!rectOverlap(e.x,e.y,e.w,e.h, p[0],p[1],p[2],p[3])) continue;
    const overlapX = Math.min(e.x+e.w, p[0]+p[2]) - Math.max(e.x, p[0]);
    const overlapY = Math.min(e.y+e.h, p[1]+p[3]) - Math.max(e.y, p[1]);
    if (overlapX < overlapY) {
      if (e.x < p[0]) { e.x = p[0]-e.w; } else { e.x = p[0]+p[2]; }
      e.vx = 0;
    }
  }
}
function resolveY(e, plats) {
  e.onGround = false;
  for (const p of plats) {
    if (!rectOverlap(e.x,e.y,e.w,e.h, p[0],p[1],p[2],p[3])) continue;
    const overlapX = Math.min(e.x+e.w, p[0]+p[2]) - Math.max(e.x, p[0]);
    const overlapY = Math.min(e.y+e.h, p[1]+p[3]) - Math.max(e.y, p[1]);
    if (overlapY <= overlapX) {
      if (e.y < p[1]) { e.y = p[1]-e.h; e.vy = 0; e.onGround = true; }
      else { e.y = p[1]+p[3]; e.vy = 0; }
    }
  }
}

// ── Player ─────────────────────────────────────────────────────────────────
function mkPlayer() {
  return { x:80, y:570, vx:0, vy:0, w:PLAYER_W, h:PLAYER_H,
    onGround:false, canDjump:false, djumpUsed:false,
    lives:gs.lives, invTimer:0, respawnTimer:0,
    power:null, powerTimer:0,
    facing:1,
    respawnX:80, respawnY:570,   // updated by checkpoints
    sp:0, attackTimer:0, dashTimer:0, shieldTimer:0   // special-ability state
  };
}
function doSpecial(p, ch) {
  const t = ch.special; if (!t) return;
  p.sp = t.cd;
  spawnText(p.x+p.w/2, p.y-6, t.name, t.fx, 16);   // shout the move name
  if (t.type==='punch') {
    p.attackTimer = 0.28; sfx.stomp();
    const fxX=p.x+p.w/2 + p.facing*26, fxY=p.y+p.h/2;
    spawnParticles(fxX, fxY, t.fx, 18, 300);
    spawnSparks(fxX, fxY, '#fff', 12, 380);
    spawnRing(fxX, fxY, t.fx, 80, 0.4);     // shockwave
    spawnRing(fxX, fxY, '#fff', 50, 0.3);
    addShake(0.18); addFlash(t.fx, 0.12);
  } else if (t.type==='dash') {
    p.dashTimer = 0.22; sfx.jump();
    spawnParticles(p.x+p.w/2, p.y+p.h/2, t.fx, 14, 240);
    spawnRing(p.x+p.w/2, p.y+p.h/2, t.fx, 46, 0.3);
    addShake(0.08); addFlash(t.fx, 0.08);
  } else if (t.type==='thrust') {
    p.vy = -560; p.onGround = false; sfx.jump();
    spawnParticles(p.x+p.w/2, p.y+p.h, t.fx, 18, 280);
    spawnSparks(p.x+p.w/2, p.y+p.h, t.fx, 10, 300);
    spawnRing(p.x+p.w/2, p.y+p.h, t.fx, 56, 0.35);
    addShake(0.1); addFlash(t.fx, 0.1);
  } else if (t.type==='rewind') {
    // Eri's Quirk: protective shield + heal one life (capped)
    p.invTimer = Math.max(p.invTimer, 2.2);
    p.shieldTimer = 2.2;
    const cx=p.x+p.w/2, cy=p.y+p.h/2;
    if (gs.lives < 5) { gs.lives++; p.lives = gs.lives; spawnText(cx, p.y-20, '+1 VIDA', '#ffd0e0', 18); }
    sfx.power();
    spawnRing(cx, cy, t.fx, 70, 0.55);
    spawnRing(cx, cy, '#fff', 48, 0.45);
    spawnSparks(cx, cy, t.fx, 16, 240);
    addFlash(t.fx, 0.14);
  }
}
function updatePlayer(p, dt, plats, levelW) {
  if (p.respawnTimer > 0) { p.respawnTimer -= dt; return; }

  const ch = CHARACTERS[gs.character] || CHARACTERS[0];

  // Special-ability timers
  if (p.sp>0) p.sp -= dt;
  if (p.attackTimer>0) p.attackTimer -= dt;
  if (p.dashTimer>0)   p.dashTimer   -= dt;

  const spKey = pressed('KeyJ')||pressed('ShiftLeft')||pressed('ShiftRight')||pressed('KeyK');
  if (spKey && p.sp<=0) doSpecial(p, ch);

  // Brief invulnerability while a special is active (lets you plow through enemies)
  if (p.attackTimer>0 || p.dashTimer>0) p.invTimer = Math.max(p.invTimer, 0.06);
  // Motion trail while dashing
  if (p.dashTimer>0) spawnAfterimage(p, ch.special?.fx || '#fff');

  // Input (speed/jump scaled by the chosen character's stats)
  const spd = (p.power==='speed' ? PLAYER_SPEED*1.65 : PLAYER_SPEED) * ch.speed;
  let ax = 0;
  if (held('ArrowLeft')||held('KeyA'))  { ax=-spd; p.facing=-1; }
  if (held('ArrowRight')||held('KeyD')) { ax=spd;  p.facing=1; }
  // Special movement overrides
  if (p.dashTimer>0)   ax = p.facing * 660;
  if (p.attackTimer>0) ax = p.facing * PLAYER_SPEED * 1.15;

  const jumpKey = pressed('Space')||pressed('ArrowUp')||pressed('KeyW');
  if (jumpKey && p.onGround) {
    p.vy = JUMP_V * ch.jump; p.onGround = false; sfx.jump();
    spawnDust(p.x+p.w/2, p.y+p.h, 7);                 // jump puff
    if (p.power==='djump') p.djumpUsed = false;
  } else if (jumpKey && !p.onGround && p.power==='djump' && !p.djumpUsed) {
    p.vy = DJUMP_V * ch.jump; p.djumpUsed = true; sfx.djump();
    spawnRing(p.x+p.w/2, p.y+p.h/2, '#7df', 40, 0.3); // mid-air double-jump ring
    spawnSparks(p.x+p.w/2, p.y+p.h, '#7df', 8, 200);
  }

  // Physics
  const wasGround = p.onGround;
  const fallSpeed = p.vy;
  p.vx = ax;
  p.vy = Math.min(p.vy + (levelData?.lowGrav ? GRAVITY*0.55 : GRAVITY)*dt, levelData?.lowGrav ? MAX_FALL*0.75 : MAX_FALL);
  p.x += p.vx*dt; p.x = Math.max(0, Math.min(levelW-p.w, p.x));
  resolveX(p, plats);
  p.y += p.vy*dt;
  resolveY(p, plats);
  if (p.onGround && p.power==='djump') p.djumpUsed = false;
  // Landing puff (only after a meaningful fall)
  if (!wasGround && p.onGround && fallSpeed > 280) {
    spawnDust(p.x+p.w/2, p.y+p.h, Math.min(14, 6+Math.floor(fallSpeed/120)));
    if (fallSpeed > 720) addShake(0.06);
  }
  // Speed-trail while sprinting with the Speed power-up
  if (p.power==='speed' && Math.abs(p.vx) > 60) {
    p._trail = (p._trail||0) + dt;
    if (p._trail > 0.04) { spawnAfterimage(p, '#5f6'); p._trail = 0; }
  }

  // Timers
  if (p.invTimer > 0) p.invTimer -= dt;
  if (p.shieldTimer > 0) p.shieldTimer -= dt;
  if (p.powerTimer > 0) { p.powerTimer -= dt; if (p.powerTimer<=0) p.power=null; }
}
// ── Playable characters ─────────────────────────────────────────────────────
// Each character has a stat profile and its own pixel-rect drawing routine.
function drawBearChar(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#8B4513'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);          // body
  ctx.fillStyle='#D2691E'; ctx.fillRect(x+2,y,PLAYER_W-4,20);                  // head
  ctx.fillStyle='#8B4513'; ctx.fillRect(x,y-6,10,10); ctx.fillRect(x+PLAYER_W-10,y-6,10,10); // ears
  ctx.fillStyle='#D2A679'; ctx.fillRect(x+10,y+22,16,14);                      // belly
  ctx.fillStyle='#000'; ctx.fillRect(x+(f?20:6),y+5,6,5);                      // eye
  ctx.fillStyle='#000'; ctx.fillRect(x+(f?24:8),y+12,4,3);                     // nose
}
function drawAllMight(p, x, y) {
  const f = p.facing>0;
  // Red/blue hero suit
  ctx.fillStyle='#0a3d91'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);          // torso (blue)
  ctx.fillStyle='#c8102e'; ctx.fillRect(x,y+12,PLAYER_W,6);                    // red chest stripe
  ctx.fillStyle='#c8102e'; ctx.fillRect(x+2,y+30,6,PLAYER_H-30);              // side stripes
  ctx.fillStyle='#c8102e'; ctx.fillRect(x+PLAYER_W-8,y+30,6,PLAYER_H-30);
  // Head (skin)
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+2,PLAYER_W-8,18);
  // Iconic blonde hair tufts
  ctx.fillStyle='#ffd700';
  ctx.fillRect(x+2,y-10,8,12); ctx.fillRect(x+PLAYER_W-10,y-10,8,12);
  ctx.fillRect(x+12,y-6,PLAYER_W-24,8);
  // Confident eyes + smile
  ctx.fillStyle='#003'; ctx.fillRect(x+(f?22:6),y+7,5,4);
  ctx.fillStyle='#fff'; ctx.fillRect(x+10,y+15,PLAYER_W-20,3);
}
function drawNinja(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#222'; ctx.fillRect(x,y+10,PLAYER_W,PLAYER_H-10);            // body
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(x+2,y,PLAYER_W-4,16);                 // head/mask
  ctx.fillStyle='#c00'; ctx.fillRect(x,y+18,PLAYER_W,5);                      // headband/scarf
  ctx.fillStyle='#c00'; ctx.fillRect(x+(f?0:PLAYER_W-6),y+18,6,18);          // scarf tail
  ctx.fillStyle='#fff'; ctx.fillRect(x+(f?20:8),y+5,8,4);                     // eye slit
}
function drawRobot(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#9aa7b5'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);         // metal body
  ctx.fillStyle='#6b7785'; ctx.fillRect(x+6,y+22,PLAYER_W-12,12);            // panel
  ctx.fillStyle='#cfd8e3'; ctx.fillRect(x+2,y,PLAYER_W-4,18);                 // head
  ctx.fillStyle='#00e5ff'; ctx.fillRect(x+(f?20:8),y+5,8,6);                  // glowing eye
  ctx.fillStyle='#ffce00'; ctx.fillRect(x+PLAYER_W/2-2,y-8,4,8);             // antenna
  ctx.fillStyle='#ff3b3b'; ctx.fillRect(x+PLAYER_W/2-3,y-11,6,4);            // antenna light
}
function drawDeku(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#1f7a3d'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);           // green suit
  ctx.fillStyle='#0f5128'; ctx.fillRect(x+2,y+30,6,PLAYER_H-30);               // side accents
  ctx.fillStyle='#0f5128'; ctx.fillRect(x+PLAYER_W-8,y+30,6,PLAYER_H-30);
  ctx.fillStyle='#fff'; ctx.fillRect(x+6,y+16,PLAYER_W-12,6);                   // belt/line
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+2,PLAYER_W-8,16);                 // face
  ctx.fillStyle='#2a6e30'; ctx.fillRect(x,y-8,PLAYER_W,12);                     // green messy hair
  ctx.fillStyle='#2a6e30'; ctx.fillRect(x+4,y-12,6,8); ctx.fillRect(x+PLAYER_W-12,y-12,6,8);
  ctx.fillStyle='#063'; ctx.fillRect(x+(f?22:6),y+7,5,4);                       // eye
}
function drawCat(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#e8943b'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);           // body
  ctx.fillStyle='#f6b860'; ctx.fillRect(x+10,y+24,16,14);                       // belly
  ctx.fillStyle='#e8943b'; ctx.fillRect(x+2,y,PLAYER_W-4,18);                   // head
  ctx.fillStyle='#e8943b'; ctx.fillRect(x,y-8,9,10); ctx.fillRect(x+PLAYER_W-9,y-8,9,10); // pointy ears
  ctx.fillStyle='#7a4a18'; ctx.fillRect(x+(f?PLAYER_W-4:0),y+24,4,14);          // tail
  ctx.fillStyle='#0a0a0a'; ctx.fillRect(x+8,y+6,5,5); ctx.fillRect(x+PLAYER_W-13,y+6,5,5); // eyes
  ctx.fillStyle='#ff8da1'; ctx.fillRect(x+PLAYER_W/2-2,y+11,4,3);               // nose
}
function drawSuperhero(p, x, y) {
  const f = p.facing>0;
  // Cape behind
  ctx.fillStyle='#7a1020'; ctx.fillRect(x+(f?-6:PLAYER_W),y+8,6,PLAYER_H-6);
  ctx.fillStyle='#16327a'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);           // suit
  ctx.fillStyle='#ffd24d'; ctx.fillRect(x+PLAYER_W/2-7,y+20,14,12);            // chest emblem
  ctx.fillStyle='#c8102e'; ctx.fillRect(x+PLAYER_W/2-3,y+22,6,8);
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+2,PLAYER_W-8,16);                 // face
  ctx.fillStyle='#2b2b2b'; ctx.fillRect(x+2,y-4,PLAYER_W-4,8);                  // hair
  ctx.fillStyle='#003'; ctx.fillRect(x+(f?22:6),y+7,5,4);                       // eye
}
function drawGoku(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#e8631a'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);           // orange gi
  ctx.fillStyle='#2256b3'; ctx.fillRect(x+4,y+16,PLAYER_W-8,6);                 // blue undershirt/sash
  ctx.fillStyle='#2256b3'; ctx.fillRect(x+4,y+PLAYER_H-12,PLAYER_W-8,5);        // blue belt
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+2,PLAYER_W-8,16);                 // face
  // Spiky black hair
  ctx.fillStyle='#161616';
  ctx.fillRect(x,y-14,PLAYER_W,16);
  ctx.fillRect(x+2,y-20,6,8); ctx.fillRect(x+12,y-22,6,10); ctx.fillRect(x+22,y-20,6,8); ctx.fillRect(x+PLAYER_W-8,y-18,6,8);
  ctx.fillStyle='#003'; ctx.fillRect(x+(f?22:6),y+7,5,4);                       // eye
}
function drawSaitama(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#f2d21a'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);           // yellow suit
  ctx.fillStyle='#fff'; ctx.fillRect(x+(f?-5:PLAYER_W),y+12,5,PLAYER_H-12);     // white cape edge
  ctx.fillStyle='#cf2a2a'; ctx.fillRect(x+4,y+PLAYER_H-12,PLAYER_W-8,12);       // red boots
  ctx.fillStyle='#cf2a2a'; ctx.fillRect(x+2,y+22,5,10); ctx.fillRect(x+PLAYER_W-7,y+22,5,10); // red gloves
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y,PLAYER_W-8,20);                   // bald head (no hair)
  ctx.fillStyle='#222'; ctx.fillRect(x+(f?22:6),y+8,4,2);                       // blank serious eye
}
function drawNaruto(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#e8631a'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);           // orange jacket
  ctx.fillStyle='#16336b'; ctx.fillRect(x+4,y+22,PLAYER_W-8,8);                 // blue shoulder band
  ctx.fillStyle='#16336b'; ctx.fillRect(x+4,y+PLAYER_H-14,PLAYER_W-8,8);        // blue pants
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+2,PLAYER_W-8,16);                 // face
  // Spiky blonde hair + headband
  ctx.fillStyle='#ffd21a';
  ctx.fillRect(x,y-12,PLAYER_W,14);
  ctx.fillRect(x+2,y-18,6,8); ctx.fillRect(x+14,y-20,6,10); ctx.fillRect(x+PLAYER_W-10,y-18,6,8);
  ctx.fillStyle='#3b6fb0'; ctx.fillRect(x,y,PLAYER_W,5);                        // headband
  ctx.fillStyle='#c0c0c0'; ctx.fillRect(x+PLAYER_W/2-4,y,8,4);                  // metal plate
  ctx.fillStyle='#1d6fa5'; ctx.fillRect(x+(f?22:6),y+7,5,4);                    // blue eye
}
function drawEri(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#eef0f5'; ctx.fillRect(x,y+14,PLAYER_W,PLAYER_H-14);           // pale dress
  ctx.fillStyle='#cfd6e6'; ctx.fillRect(x+4,y+PLAYER_H-9,PLAYER_W-8,9);         // skirt hem
  ctx.fillStyle='#f3d2b3'; ctx.fillRect(x+6,y+2,PLAYER_W-12,16);                // face
  // Long silver hair (top + both sides)
  ctx.fillStyle='#dfe3ea';
  ctx.fillRect(x+2,y-4,PLAYER_W-4,8);
  ctx.fillRect(x,y+2,6,PLAYER_H-20);
  ctx.fillRect(x+PLAYER_W-6,y+2,6,PLAYER_H-20);
  // Small horn on the forehead
  ctx.fillStyle='#f2ead0'; ctx.fillRect(x+(f?PLAYER_W-15:10),y-9,5,10);
  ctx.fillStyle='#d6c79a'; ctx.fillRect(x+(f?PLAYER_W-15:10),y-3,5,3);
  // Red eyes
  ctx.fillStyle='#d83a3a'; ctx.fillRect(x+(f?20:9),y+8,4,4);
}
function drawVegeta(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#1a3a8a'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+2,PLAYER_W-8,16);
  ctx.fillStyle='#2a2a2a';
  ctx.fillRect(x,y-14,PLAYER_W,16);
  ctx.fillRect(x+2,y-20,6,8); ctx.fillRect(x+14,y-22,6,10); ctx.fillRect(x+PLAYER_W-10,y-20,6,8);
  ctx.fillStyle='#fff'; ctx.fillRect(x+4,y+18,PLAYER_W-8,5);
  ctx.fillStyle='#003'; ctx.fillRect(x+(f?22:6),y+7,5,4);
}
function drawLuffy(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#c8102e'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);
  ctx.fillStyle='#16336b'; ctx.fillRect(x+4,y+PLAYER_H-14,PLAYER_W-8,10);
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+6,PLAYER_W-8,16);
  ctx.fillStyle='#e8c040'; ctx.fillRect(x-2,y-2,PLAYER_W+4,6);
  ctx.fillStyle='#c8102e'; ctx.fillRect(x+2,y-8,PLAYER_W-4,8);
  ctx.fillStyle='#003'; ctx.fillRect(x+(f?22:6),y+10,5,4);
}
function drawIchigo(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+2,PLAYER_W-8,16);
  ctx.fillStyle='#e87020';
  ctx.fillRect(x,y-12,PLAYER_W,14);
  ctx.fillRect(x+2,y-18,6,8); ctx.fillRect(x+PLAYER_W-10,y-18,6,8);
  ctx.fillStyle='#fff'; ctx.fillRect(x+8,y+20,PLAYER_W-16,4);
  ctx.fillStyle='#003'; ctx.fillRect(x+(f?22:6),y+7,5,4);
}
function drawSonic(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#2256e8'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+4,PLAYER_W-8,14);
  ctx.fillStyle='#2256e8';
  ctx.fillRect(x,y-10,PLAYER_W,14);
  ctx.fillRect(x+(f?PLAYER_W-4:0),y+8,6,18);
  ctx.fillRect(x+2,y-18,8,10); ctx.fillRect(x+12,y-22,8,14); ctx.fillRect(x+22,y-18,8,10);
  ctx.fillStyle='#fff'; ctx.fillRect(x+8,y+10,6,4);
  ctx.fillStyle='#003'; ctx.fillRect(x+(f?22:6),y+8,5,4);
}
function drawKirby(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#ff8fb0'; ctx.fillRect(x+2,y+8,PLAYER_W-4,PLAYER_H-8);
  ctx.fillStyle='#ff6b90'; ctx.fillRect(x+6,y+20,PLAYER_W-12,14);
  ctx.fillStyle='#ff8fb0'; ctx.fillRect(x,y-4,PLAYER_W,18);
  ctx.fillStyle='#ff4d70'; ctx.fillRect(x+6,y+6,5,5); ctx.fillRect(x+PLAYER_W-11,y+6,5,5);
  ctx.fillStyle='#003'; ctx.fillRect(x+(f?20:10),y+8,4,4);
  ctx.fillStyle='#ff4d70'; ctx.fillRect(x+PLAYER_W/2-2,y+14,4,3);
}
function drawCosmo(p, x, y) {
  const f = p.facing>0;
  ctx.fillStyle='#4a2080'; ctx.fillRect(x,y+12,PLAYER_W,PLAYER_H-12);
  ctx.fillStyle='#7a40c0'; ctx.fillRect(x+2,y+18,PLAYER_W-4,8);
  ctx.fillStyle='#f0c080'; ctx.fillRect(x+4,y+2,PLAYER_W-8,16);
  ctx.fillStyle='#6a30a0'; ctx.fillRect(x,y-6,PLAYER_W,10);
  ctx.fillStyle='#c8f'; ctx.fillRect(x+PLAYER_W/2-4,y-10,8,6);
  ctx.fillStyle='#8af'; ctx.fillRect(x+(f?22:6),y+7,5,4);
}

// stat: speed/jump multipliers; special: {type,cd,fx,name}; unlock: worlds cleared needed
const CHARACTERS = [
  { name:'BEAR',      speed:1.00, jump:1.00, color:'#8B4513', draw:drawBearChar,  unlock:0, desc:'Equilibrado',
    special:{ type:'punch',  cd:1.5, fx:'#D2A679', name:'BEAR SLAM' } },
  { name:'CAT',       speed:1.18, jump:1.08, color:'#e8943b', draw:drawCat,       unlock:0, desc:'Agil y saltarin',
    special:{ type:'dash',   cd:0.9, fx:'#ffd24d', name:'POUNCE' } },
  { name:'NINJA',     speed:1.28, jump:1.02, color:'#222222', draw:drawNinja,     unlock:1, desc:'Muy rapido',
    special:{ type:'dash',   cd:0.8, fx:'#ffffff', name:'DASH' } },
  { name:'ROBOT',     speed:0.92, jump:1.28, color:'#9aa7b5', draw:drawRobot,     unlock:1, desc:'Super salto',
    special:{ type:'thrust', cd:1.2, fx:'#00e5ff', name:'BOOST' } },
  { name:'DEKU',      speed:1.12, jump:1.14, color:'#1f7a3d', draw:drawDeku,      unlock:2, desc:'Heroe en formacion',
    special:{ type:'punch',  cd:1.3, fx:'#39d353', name:'SMASH' } },
  { name:'ALL MIGHT', speed:1.10, jump:1.12, color:'#0a3d91', draw:drawAllMight,  unlock:2, desc:'El simbolo de la paz',
    special:{ type:'punch',  cd:1.4, fx:'#c8102e', name:'DETROIT SMASH' } },
  { name:'SUPERHERO', speed:1.15, jump:1.20, color:'#16327a', draw:drawSuperhero, unlock:3, desc:'Vuela y golpea fuerte',
    special:{ type:'thrust', cd:1.1, fx:'#ff5da2', name:'FLY' } },
  { name:'NARUTO',    speed:1.24, jump:1.10, color:'#e8631a', draw:drawNaruto,    unlock:1, desc:'Ninja veloz e imparable',
    special:{ type:'punch',  cd:1.2, fx:'#ff9a3c', name:'RASENGAN' } },
  { name:'GOKU',      speed:1.16, jump:1.18, color:'#e8631a', draw:drawGoku,      unlock:2, desc:'Guerrero legendario',
    special:{ type:'punch',  cd:1.3, fx:'#33c6ff', name:'KAMEHAMEHA' } },
  { name:'SAITAMA',   speed:1.10, jump:1.10, color:'#f2d21a', draw:drawSaitama,   unlock:3, desc:'Un solo golpe basta',
    special:{ type:'punch',  cd:1.0, fx:'#ffe14d', name:'SERIOUS PUNCH' } },
  { name:'ERI',       speed:1.05, jump:1.22, color:'#eef0f5', draw:drawEri,       unlock:2, desc:'Rebobina: escudo y cura',
    special:{ type:'rewind', cd:7.0, fx:'#ff8fb0', name:'REWIND' } },
  { name:'VEGETA',    speed:1.20, jump:1.10, color:'#1a3a8a', draw:drawVegeta,    unlock:4, desc:'Principe Saiyan arrogante',
    special:{ type:'dash',   cd:0.9, fx:'#7af',   name:'GALICK DASH' } },
  { name:'LUFFY',     speed:1.14, jump:1.16, color:'#c8102e', draw:drawLuffy,     unlock:4, desc:'Goma goma stretch',
    special:{ type:'punch',  cd:1.1, fx:'#ff6b4a', name:'GOMU PUNCH' } },
  { name:'ICHIGO',    speed:1.22, jump:1.12, color:'#e87020', draw:drawIchigo,    unlock:5, desc:'Corte espiritual',
    special:{ type:'dash',   cd:0.85,fx:'#ff8844',name:'GETSUGA' } },
  { name:'SONIC',     speed:1.32, jump:1.06, color:'#2256e8', draw:drawSonic,    unlock:5, desc:'Velocidad supersonica',
    special:{ type:'dash',   cd:0.7, fx:'#5af',   name:'SPIN DASH' } },
  { name:'KIRBY',     speed:1.08, jump:1.24, color:'#ff8fb0', draw:drawKirby,    unlock:6, desc:'Inhala y vuela',
    special:{ type:'thrust', cd:1.0, fx:'#ff8fb0', name:'INHALE' } },
  { name:'COSMO',     speed:1.12, jump:1.20, color:'#7a40c0', draw:drawCosmo,    unlock:7, desc:'Poder cosmico',
    special:{ type:'rewind', cd:6.0, fx:'#c8f',   name:'STAR HEAL' } },
];

function worldsCleared(){
  let c=0;
  for(let w=0;w<WORLD_COUNT;w++) if(gs.levelDone[w].every(Boolean)) c++;
  return c;
}
function isCharUnlocked(i){ return (gs.bought&&gs.bought[i]) || worldsCleared() >= (CHARACTERS[i].unlock||0); }
function maxLives(){ return 5 + (gs.bonusLives||0); }

// ── Achievements ────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id:'firstcoin', name:'Primera moneda',  desc:'Recoge tu primera moneda' },
  { id:'boss',      name:'Cazajefes',       desc:'Vence a un jefe' },
  { id:'nohit',     name:'Intocable',       desc:'Completa un nivel sin recibir daño' },
  { id:'speed',     name:'Veloz',           desc:'Termina un nivel en menos de 20s' },
  { id:'rich',      name:'Millonario oso',  desc:'Acumula 500 monedas en total' },
  { id:'shopper',   name:'Comprador',       desc:'Compra algo en la tienda' },
  { id:'allchars',  name:'Equipo completo', desc:'Desbloquea todos los personajes' },
  { id:'allworlds', name:'Leyenda',         desc:'Completa los 10 mundos' },
  { id:'coop',      name:'Equipo online',   desc:'Juega con un amigo en linea' },
];
function unlockAch(id){
  if (gs.ach[id]) return;
  const a = ACHIEVEMENTS.find(x=>x.id===id); if(!a) return;
  gs.ach[id]=true; saveGame();
  spawnText(player?player.x+player.w/2:W/2, player?player.y-20:H/2, 'LOGRO: '+a.name, '#ffd24d', 16);
  if (typeof sfx!=='undefined') sfx.star();
}
function checkCollectAch(){
  if (gs.wallet>=500) unlockAch('rich');
  let all=true; for(let i=0;i<CHARACTERS.length;i++) if(!isCharUnlocked(i)) all=false;
  if (all) unlockAch('allchars');
  if (worldsCleared()>=WORLD_COUNT) unlockAch('allworlds');
}

function drawPlayer(p) {
  // Blink during post-hit i-frames, but NOT while a Rewind shield is up.
  if (p.shieldTimer<=0 && p.invTimer > 0 && Math.floor(p.invTimer*8)%2===0) return;
  const x=p.x-cam.x, y=p.y-cam.y;
  (CHARACTERS[gs.character]||CHARACTERS[0]).draw(p, x, y);
  // Rewind shield bubble (Eri)
  if (p.shieldTimer>0) {
    const cx=x+PLAYER_W/2, cy=y+PLAYER_H/2-2, r=PLAYER_H*0.7 + Math.sin(p.shieldTimer*12)*2;
    ctx.globalAlpha=0.35+Math.sin(p.shieldTimer*10)*0.1;
    ctx.strokeStyle='#ff8fb0'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=0.12; ctx.fillStyle='#ff8fb0';
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=1;
  }
  // Power glow
  if (p.power==='djump') { ctx.strokeStyle='#0ff'; ctx.lineWidth=2; ctx.strokeRect(x-1,y-7,PLAYER_W+2,PLAYER_H+7); }
  if (p.power==='speed') { ctx.strokeStyle='#0f0'; ctx.lineWidth=2; ctx.strokeRect(x-1,y-7,PLAYER_W+2,PLAYER_H+7); }
  if (p.power==='inv')   { ctx.strokeStyle='#ff0'; ctx.lineWidth=2; ctx.strokeRect(x-1,y-7,PLAYER_W+2,PLAYER_H+7); }
}

// ── Enemy ──────────────────────────────────────────────────────────────────
// types: patrol · chaser · boss · flyer (air) · jumper (hops) · spitter (shoots)
function mkEnemies(data) {
  return data.map(([ex,ey,type,range]) => {
    const isBoss = type==='boss';
    return {
      x:ex, y:ey, vx:0, vy:0,
      w: isBoss?58 : type==='miniboss'?46 : type==='spitter'?36 : 34,
      h: isBoss?66 : type==='miniboss'?52 : type==='flyer'?30 : type==='hunter'?32 : type==='jumper'?34 : type==='spitter'?36 : type==='armor'?40 : 38,
      onGround:false, type, range:range||160, startX:ex, baseY:ey,
      dir:1, hp:isBoss?3 : type==='miniboss'?(gs.difficulty>=2?3:2) : 1, maxhp:type==='miniboss'?(gs.difficulty>=2?3:2):1, active:true, hitFlash:0,
      // boss state
      phase:'patrol', phaseTimer:3, chargeDir:1,
      // new-enemy state
      jumpTimer: 0.8+Math.random()*1.2, shootTimer: 1.2+Math.random()*1.2, bob: Math.random()*Math.PI*2,
    };
  });
}
function updateEnemy(e, dt, plats, px, py, levelW) {
  if (!e.active) return;
  const dm = diff().enemy;

  // Flying enemy: no gravity, patrols horizontally and bobs vertically.
  if (e.type==='flyer') {
    const spd = 110*dm;
    if (e.x <= e.startX - e.range/2) e.dir=1;
    if (e.x >= e.startX + e.range/2) e.dir=-1;
    e.x += e.dir*spd*dt; e.x = clamp(e.x, 0, levelW-e.w);
    e.bob += dt*3;
    e.y = e.baseY + Math.sin(e.bob)*22;
    if (e.hitFlash>0) e.hitFlash-=dt;
    return;
  }

  // Flying hunter: homes in on the player when nearby, drifts home otherwise.
  if (e.type==='hunter') {
    const spd = 130*dm;
    const dx = px - e.x, dy = py - e.y;
    if (Math.abs(dx) < 440) {
      const d = Math.hypot(dx,dy) || 1;
      e.x += (dx/d)*spd*dt; e.y += (dy/d)*spd*dt;
    } else {
      e.x += Math.sign(e.startX-e.x)*spd*0.5*dt;
      e.y += Math.sign(e.baseY-e.y)*spd*0.5*dt;
    }
    e.x = clamp(e.x, 0, levelW-e.w);
    e.y = clamp(e.y, 80, 660-e.h);
    e.dir = dx<0?-1:1;
    if (e.hitFlash>0) e.hitFlash-=dt;
    return;
  }

  e.vy = Math.min(e.vy + GRAVITY*dt, MAX_FALL);

  if (e.type==='boss') {
    updateBoss(e, dt, px, py);
  } else if (e.type==='miniboss') {
    updateMiniBoss(e, dt, px, py);
  } else if (e.type==='armor') {
    // Patrols slowly, but CHARGES when it spots the player at a similar height.
    const dx = px - e.x;
    if (Math.abs(dx) < 300 && Math.abs(py - e.y) < 90) {
      e.dir = dx>0?1:-1; e.vx = e.dir * 210 * dm; e.charging = true;
    } else {
      if (e.x <= e.startX - e.range/2) e.dir = 1;
      if (e.x >= e.startX + e.range/2) e.dir = -1;
      e.vx = e.dir * 70 * dm; e.charging = false;
    }
  } else if (e.type==='jumper') {
    e.jumpTimer -= dt;
    if (e.onGround && e.jumpTimer<=0) { e.vy = -560; e.jumpTimer = 0.9+Math.random()*0.9; e.dir = px<e.x?-1:1; }
    e.vx = e.onGround ? 0 : e.dir*(95*dm);   // drift toward player while airborne
  } else if (e.type==='spitter') {
    e.vx = 0; e.dir = px<e.x?-1:1;
    e.shootTimer -= dt;
    if (e.shootTimer<=0 && Math.abs(px-e.x)<580) {
      e.shootTimer = 1.5+Math.random()*0.8;
      spawnProjectile(e.x+e.w/2, e.y+e.h/2, e.dir*(250*dm));
    }
  } else {
    const spd = (e.type==='chaser' ? 140 : 100) * dm;
    const dx = px - e.x;
    if (e.type==='chaser' && Math.abs(dx) < 260) {
      e.vx = dx > 0 ? spd : -spd;
    } else {
      if (e.x <= e.startX - e.range/2) e.dir = 1;
      if (e.x >= e.startX + e.range/2) e.dir = -1;
      e.vx = e.dir * spd;
    }
  }

  e.x += e.vx*dt; e.x = clamp(e.x, 0, levelW-e.w);
  resolveX(e, plats);
  e.y += e.vy*dt;
  resolveY(e, plats);
  if (e.hitFlash > 0) e.hitFlash -= dt;
}

// Spawn a single enemy at runtime (used by the mini-boss to summon minions).
function spawnEnemyAt(x, y, type, range, minion) {
  const e = mkEnemies([[x,y,type,range]])[0];
  if (minion) e.minion = true;
  enemies.push(e);
  return e;
}
function minionCount() { let c=0; for (const e of enemies) if (e.minion && e.active) c++; return c; }

// Drop a reward where a (mini-)boss died. Better loot on harder difficulties;
// `big` (final boss) drops extra lives, power-ups and stars.
function dropReward(x, y, big=false) {
  const d = gs.difficulty;                       // 0 easy · 1 normal · 2 hard
  const pwAll = ['djump','speed','inv'];
  const nPw   = (d>=2 ? 2 : 1) + (big?1:0);      // hard +1, boss +1
  const nLife = big ? 2 : 1;                      // boss gives two extra lives
  const nStar = (d>=1?1:0) + (big?2:0);          // boss adds extra stars
  let slot = 0;
  const place = (type,w) => { items.push({ x:x-90+slot*44, y:y-36, w, h:w, type, taken:false, bob:Math.random()*6 }); slot++; };
  for (let i=0;i<nPw;i++)   place(pwAll[Math.floor(Math.random()*pwAll.length)], 28);
  for (let i=0;i<nLife;i++) place('life', 24);
  for (let i=0;i<nStar;i++) items.push({ x:x-40+i*40, y:y-70, w:24, h:24, type:'star', taken:false, bob:Math.random()*6 });
  spawnText(x, y-48, big?'GRAN RECOMPENSA!':'RECOMPENSA!', '#ffd24d', big?18:16);
  if (big) {
    showBanner('JEFE DERROTADO!', '#FFD700');
    unlockAch('boss');
    // Final world: refill lives to the maximum as a special bonus.
    if (gs.world>=LAST_WORLD) { gs.lives = maxLives(); if (player) player.lives = gs.lives; spawnText(x, y-86, 'VIDAS AL MAXIMO!', '#ff8da1', 16); }
  }
}

// ── Projectiles (fired by spitters and mini-bosses) ─────────────────────────
let projectiles=[];
function spawnProjectile(x, y, vx){ projectiles.push({x:x-7, y:y-7, w:14, h:14, vx, life:4}); }
function updateProjectiles(dt, levelW){
  for (const p of projectiles) { p.x += p.vx*dt; p.life -= dt; }
  projectiles = projectiles.filter(p => p.life>0 && p.x>-60 && p.x<levelW+60);
}
function drawProjectiles(){
  for (const p of projectiles) {
    const x=p.x-cam.x+p.w/2, y=p.y-cam.y+p.h/2;
    ctx.fillStyle='#b06bff'; ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#e6ccff'; ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
  }
}
function updateMiniBoss(b, dt, px, py) {
  const dm = diff().enemy;
  const cd = [1.2, 1.0, 0.75][gs.difficulty] ?? 1;   // attacks come faster on harder modes
  b.phaseTimer -= dt;

  // Ranged attack: fires a projectile at the player on a timer.
  b.shootTimer -= dt;
  if (b.shootTimer<=0 && Math.abs(px-b.x)<640) {
    b.shootTimer = 1.8*cd;
    const sd = px<b.x?-1:1; b.dir = sd;
    spawnProjectile(b.x+b.w/2, b.y+b.h/2-4, sd*(240*dm));
  }
  // Summon: spawns small minions occasionally (capped so it never floods).
  // Flying minions appear in later worlds.
  b.summonTimer = (b.summonTimer ?? 4) - dt;
  if (b.summonTimer<=0) {
    b.summonTimer = 5.5*cd;
    if (minionCount() < 3) {
      const mt = gs.world>=2 ? 'hunter' : gs.world>=1 ? 'flyer' : 'patrol';
      const my = mt==='patrol' ? b.y : b.y-90;
      spawnEnemyAt(b.x + (b.dir<0?-40:b.w+8), my, mt, 130, true);
      spawnParticles(b.x+b.w/2, b.y+b.h/2, '#b06bff', 14, 220);
      spawnRing(b.x+b.w/2, b.y+b.h/2, '#b06bff', 50, 0.35);
    }
  }

  if (b.phase==='patrol') {
    b.vx = b.dir * 90 * dm;
    if (b.x <= b.startX - b.range/2) b.dir=1;
    if (b.x >= b.startX + b.range/2) b.dir=-1;
    if (b.phaseTimer<=0) {
      if (Math.abs(px-b.x) < 380) { b.phase='windup'; b.phaseTimer=0.5; b.vx=0; b.chargeDir=px<b.x?-1:1; }
      else b.phaseTimer = 1.4;
    }
  } else if (b.phase==='windup') {
    b.vx=0;
    if (b.phaseTimer<=0) { b.phase='charge'; b.phaseTimer=0.6; }
  } else if (b.phase==='charge') {
    b.vx = b.chargeDir * 300 * dm;
    if (b.phaseTimer<=0) { b.phase='rest'; b.phaseTimer=1.0; b.vx=0; }
  } else {
    b.vx=0;
    if (b.phaseTimer<=0) { b.phase='patrol'; b.phaseTimer=2.0; }
  }
}
function updateBoss(b, dt, px, py) {
  const dm = diff().enemy;
  b.phaseTimer -= dt;
  if (b.phase==='patrol') {
    b.vx = b.dir * 80 * dm;
    if (b.x <= b.startX - b.range/2) b.dir=1;
    if (b.x >= b.startX + b.range/2) b.dir=-1;
    if (b.phaseTimer<=0) { b.phase='windup'; b.phaseTimer=0.6; b.vx=0; b.chargeDir=px<b.x?-1:1; }
  } else if (b.phase==='windup') {
    b.vx=0;
    if (b.phaseTimer<=0) { b.phase='charge'; b.phaseTimer=0.7; }
  } else if (b.phase==='charge') {
    b.vx = b.chargeDir * 380 * dm;
    if (b.phaseTimer<=0) { b.phase='rest'; b.phaseTimer=1.2; b.vx=0; }
  } else if (b.phase==='rest') {
    b.vx=0;
    if (b.phaseTimer<=0) { b.phase='patrol'; b.phaseTimer=3.0; }
  }
}
function drawEnemy(e) {
  if (!e.active) return;
  const x=e.x-cam.x, y=e.y-cam.y;
  if (e.type==='boss') {
    const c = e.hitFlash>0 ? '#fff' : '#8B0000';
    ctx.fillStyle=c; ctx.fillRect(x,y+16,e.w,e.h-16);
    ctx.fillStyle=c; ctx.fillRect(x+6,y,e.w-12,24);
    // crown
    ctx.fillStyle='#FFD700';
    ctx.fillRect(x+8,y-8,6,10); ctx.fillRect(x+26-3,y-12,8,14); ctx.fillRect(x+e.w-14,y-8,6,10);
    // eyes
    ctx.fillStyle='#FF4500'; ctx.fillRect(x+8,y+4,10,8); ctx.fillRect(x+e.w-18,y+4,10,8);
    // health bar
    ctx.fillStyle='#400'; ctx.fillRect(x-5,y-22,e.w+10,8);
    ctx.fillStyle='#0a0'; ctx.fillRect(x-5,y-22,(e.w+10)*(e.hp/3),8);
    ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.strokeRect(x-5,y-22,e.w+10,8);
  } else if (e.type==='flyer') {
    const wf = Math.sin(e.bob*2)*5;
    ctx.fillStyle='#5430a0'; ctx.fillRect(x-8,y+5+wf,10,e.h-12); ctx.fillRect(x+e.w-2,y+5-wf,10,e.h-12); // wings
    ctx.fillStyle='#6a3db0'; ctx.fillRect(x+4,y+2,e.w-8,e.h-4);                                          // body
    ctx.fillStyle='#ff3'; ctx.fillRect(x+8,y+8,5,5); ctx.fillRect(x+e.w-13,y+8,5,5);                     // eyes
    ctx.fillStyle='#fff'; ctx.fillRect(x+8,y+e.h-6,4,4); ctx.fillRect(x+e.w-12,y+e.h-6,4,4);             // fangs
  } else if (e.type==='jumper') {
    ctx.fillStyle='#2aa84a'; ctx.fillRect(x,y,e.w,e.h);
    ctx.fillStyle='#1c7a36'; ctx.fillRect(x+3,y+e.h-7,e.w-6,7);                       // legs
    ctx.fillStyle='#fff'; ctx.fillRect(x+6,y+7,8,8); ctx.fillRect(x+e.w-14,y+7,8,8);  // eyes
    ctx.fillStyle='#000'; ctx.fillRect(x+9,y+10,3,3); ctx.fillRect(x+e.w-11,y+10,3,3);
  } else if (e.type==='spitter') {
    ctx.fillStyle='#7a5230'; ctx.fillRect(x,y+6,e.w,e.h-6);
    ctx.fillStyle='#3a2a1a'; const mx = e.dir<0 ? x-5 : x+e.w-3; ctx.fillRect(mx,y+e.h/2-4,8,9); // muzzle
    ctx.fillStyle='#5b3a20'; ctx.fillRect(x+4,y,e.w-8,8);                                        // brow
    ctx.fillStyle='#ff5'; ctx.fillRect(x+8,y+12,6,6); ctx.fillRect(x+e.w-14,y+12,6,6);           // eyes
  } else if (e.type==='armor') {
    const c = e.hitFlash>0 ? '#fff' : '#8a93a0';
    ctx.fillStyle=c; ctx.fillRect(x,y+8,e.w,e.h-8);                                  // armored body
    ctx.fillStyle='#666f7a'; ctx.fillRect(x+2,y+e.h-8,e.w-4,8);                       // greaves
    ctx.fillStyle='#aeb6c0'; ctx.fillRect(x-2,y,e.w+4,15);                            // helmet
    ctx.fillStyle='#2a2f36'; ctx.fillRect(x+4,y+6,e.w-8,5);                           // visor slit
    ctx.fillStyle='#ff3b3b'; ctx.fillRect(x+8,y+7,4,3); ctx.fillRect(x+e.w-12,y+7,4,3); // eye glow
    ctx.fillStyle='#cfd6df'; ctx.fillRect(x+3,y+18,3,3); ctx.fillRect(x+e.w-6,y+18,3,3); // rivets
  } else if (e.type==='miniboss') {
    const c = e.hitFlash>0 ? '#fff' : '#6a2da0';
    ctx.fillStyle=c; ctx.fillRect(x,y+12,e.w,e.h-12);                                  // body
    ctx.fillStyle=c; ctx.fillRect(x+5,y,e.w-10,18);                                    // head
    ctx.fillStyle='#39d353'; ctx.fillRect(x+2,y-9,6,11); ctx.fillRect(x+e.w-8,y-9,6,11); // horns
    ctx.fillStyle='#ffce00'; ctx.fillRect(x+9,y+5,9,7); ctx.fillRect(x+e.w-18,y+5,9,7);  // eyes
    ctx.fillStyle='#000'; ctx.fillRect(x+12,y+7,3,3); ctx.fillRect(x+e.w-15,y+7,3,3);
    ctx.fillStyle='#400'; ctx.fillRect(x-3,y-18,e.w+6,6);                               // hp bar
    ctx.fillStyle='#0c0'; ctx.fillRect(x-3,y-18,(e.w+6)*(e.hp/(e.maxhp||2)),6);
    ctx.strokeStyle='#000'; ctx.lineWidth=1; ctx.strokeRect(x-3,y-18,e.w+6,6);
  } else if (e.type==='hunter') {
    const cx2=x+e.w/2, cy2=y+e.h/2, r=e.w/2;
    ctx.fillStyle='#7a0a22'; ctx.fillRect(x-7,cy2-3,9,6); ctx.fillRect(x+e.w-2,cy2-3,9,6);   // wings
    ctx.fillStyle=e.hitFlash>0?'#fff':'#b01030'; ctx.beginPath(); ctx.arc(cx2,cy2,r,0,Math.PI*2); ctx.fill(); // body
    ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx2,cy2,7,0,Math.PI*2); ctx.fill();        // eye
    ctx.fillStyle='#000'; ctx.beginPath(); ctx.arc(cx2+e.dir*2,cy2,3,0,Math.PI*2); ctx.fill(); // pupil
  } else {
    const c = e.type==='chaser' ? '#cc3300' : '#884400';
    ctx.fillStyle=c; ctx.fillRect(x,y,e.w,e.h);
    ctx.fillStyle='#000'; ctx.fillRect(x+6,y+8,6,6); ctx.fillRect(x+e.w-12,y+8,6,6);
    ctx.fillStyle='#fff'; ctx.fillRect(x+8,y+18,e.w-16,4);
  }
}

// ── Collectibles & Power-ups ───────────────────────────────────────────────
function mkCollectibles(coins, stars, powerups) {
  const items = [];
  for (const [cx,cy] of coins)   items.push({x:cx,y:cy,w:20,h:20,type:'coin',taken:false,bob:Math.random()*Math.PI*2});
  for (const [sx,sy] of stars)   items.push({x:sx,y:sy,w:24,h:24,type:'star',taken:false,bob:Math.random()*Math.PI*2});
  for (const [ux,uy,ut] of powerups) items.push({x:ux,y:uy,w:28,h:28,type:ut,taken:false,bob:Math.random()*Math.PI*2});
  return items;
}
function drawCollectible(it, t) {
  if (it.taken) return;
  const bob = Math.sin(t*3+it.bob)*5;
  const cx = it.x-cam.x+it.w/2, cy = it.y-cam.y+it.h/2+bob;
  if (it.type==='coin') {
    const spin = Math.abs(Math.cos(t*4+it.bob));
    const rx = 9*spin+3, ry = 10;
    ctx.globalAlpha=0.25+0.2*Math.sin(t*5+it.bob);
    ctx.strokeStyle='#fff'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.ellipse(cx,cy,15,15,0,0,Math.PI*2); ctx.stroke();
    ctx.globalAlpha=1;
    ctx.fillStyle='#8a6510'; ctx.beginPath(); ctx.ellipse(cx,cy,rx+1.5,ry+1.5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(cx-rx*0.25,cy-ry*0.3,rx*0.22,ry*0.18,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#7a5500'; ctx.font='bold 10px monospace'; ctx.textAlign='center'; ctx.fillText('C',cx,cy+3);
  } else if (it.type==='star') {
    const pulse = 1+0.1*Math.sin(t*4+it.bob);
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(t*0.8+it.bob*0.1); ctx.scale(pulse,pulse);
    ctx.globalAlpha=0.35; ctx.fillStyle='#FFE066'; drawStar(0,0,17,7,5); ctx.globalAlpha=1;
    ctx.fillStyle='#FFD700'; drawStar(0,0,12,5,5);
    ctx.fillStyle='#FFFACD'; drawStar(0,0,5,2,5);
    ctx.restore();
  } else if (it.type==='life') {
    drawHeartIcon(cx,cy-2,12,true);
  } else {
    const colors = {djump:'#0ff',speed:'#3ecf6e',inv:'#FFD700'};
    const labels = {djump:'2x',speed:'>>',inv:'INV'};
    const col = colors[it.type]||'#fff';
    const px=it.x-cam.x, py=it.y-cam.y+bob;
    ctx.globalAlpha=0.3+0.15*Math.sin(t*3+it.bob);
    fillRR(px-5,py-5,it.w+10,it.h+10,12,col); ctx.globalAlpha=1;
    fillRR(px,py,it.w,it.h,9,col);
    strokeRR(px,py,it.w,it.h,9,'rgba(255,255,255,0.55)',2);
    ctx.fillStyle='#111'; ctx.font='bold 11px monospace'; ctx.textAlign='center';
    ctx.fillText(labels[it.type]||'?', cx, cy+4);
  }
}
function drawStar(cx,cy,outer,inner,pts) {
  ctx.beginPath();
  for (let i=0;i<pts*2;i++) {
    const r = i%2===0?outer:inner;
    const a = (i/pts)*Math.PI - Math.PI/2;
    if (i===0) ctx.moveTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
    else ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));
  }
  ctx.closePath(); ctx.fill();
}

// ── Goal Flag ──────────────────────────────────────────────────────────────
function drawGoal(gx, gy, t) {
  const x=gx-cam.x, y=gy-cam.y;
