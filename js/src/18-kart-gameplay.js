// ── Kart items, rubberbanding, hazards & dynamic obstacles ───────────────────
const KART_ITEMS = {
  boost:     { name: 'TURBO',     icon: '⚡', color: '#ff8800' },
  banana:    { name: 'BANANA',    icon: '🍌', color: '#ffe040' },
  shell:     { name: 'CAPARAZON', icon: '🐚', color: '#40c878' },
  blueshell: { name: 'AZUL',      icon: '🔵', color: '#3080ff' },
  lightning: { name: 'RAYO',      icon: '⚡', color: '#aaccff' },
  shield:    { name: 'ESCUDO',    icon: '🛡', color: '#66ccff' },
  coin:      { name: 'MONEDA',    icon: '🪙', color: '#ffd700' },
  star:      { name: 'ESTRELLA',  icon: '⭐', color: '#ffd700' },
  mushroom:  { name: 'CHAMPIÑON', icon: '🍄', color: '#e04040' },
};

function kartRollItem(k) {
  if (!race) return 'boost';
  kartRank();
  const rank = k.rank || 1;
  const total = race.karts.length;
  const last = rank >= total;
  const r = Math.random();
  if (rank === 1) {
    if (r < 0.32) return 'shield';
    if (r < 0.58) return 'banana';
    if (r < 0.78) return 'coin';
    return 'mushroom';
  }
  if (last) {
    if (r < 0.18) return 'lightning';
    if (r < 0.32) return 'blueshell';
    if (r < 0.55) return 'shell';
    if (r < 0.78) return 'boost';
    if (r < 0.92) return 'star';
    return 'banana';
  }
  if (r < 0.28) return 'boost';
  if (r < 0.48) return 'shell';
  if (r < 0.65) return 'banana';
  if (r < 0.80) return 'mushroom';
  return 'coin';
}

function kartInitRaceExtras(tr) {
  race.hazards = [];
  race.projectiles = [];
  race.blueShells = [];
  race.obstacles = [];
  if (!tr.obstacleSpots) return;
  for (const spot of tr.obstacleSpots) {
    const p = kartPathSample(tr, spot.u);
    const tg = kartPathTangent(tr, spot.u);
    race.obstacles.push({
      u: spot.u, x: p.x, y: p.y, angle: tg.angle,
      phase: Math.random() * Math.PI * 2,
      kind: spot.kind || 'rock',
      active: true,
    });
  }
}

function kartUpdateObstacles(dt, tr) {
  if (!race?.obstacles) return;
  for (const ob of race.obstacles) {
    ob.phase += dt * (ob.kind === 'crab' ? 2.2 : 1.4);
    const tg = kartPathTangent(tr, ob.u);
    const lane = Math.sin(ob.phase) * tr.roadWidth * 0.32;
    ob.x = kartPathSample(tr, ob.u).x + Math.cos(tg.angle + Math.PI / 2) * lane;
    ob.y = kartPathSample(tr, ob.u).y + Math.sin(tg.angle + Math.PI / 2) * lane;
    ob.angle = tg.angle;
    for (const k of race.karts) {
      if (k.finished || k.shieldTimer > 0 || k.starTimer > 0) continue;
      if (Math.hypot(k.x - ob.x, k.y - ob.y) < 28) {
        k.speed *= 0.35;
        k.stunTimer = Math.max(k.stunTimer || 0, 0.6);
        spawnParticles(k.x, k.y, '#888', 8, 180);
        sfx.hurt();
      }
    }
  }
}

function kartUpdateHazards(dt) {
  if (!race?.hazards) return;
  for (let i = race.hazards.length - 1; i >= 0; i--) {
    const h = race.hazards[i];
    h.life -= dt;
    if (h.life <= 0) { race.hazards.splice(i, 1); continue; }
    for (const k of race.karts) {
      if (k.finished || k.idx === h.owner || k.shieldTimer > 0 || k.starTimer > 0) continue;
      if (Math.hypot(k.x - h.x, k.y - h.y) < 22) {
        k.speed *= 0.4;
        k.stunTimer = Math.max(k.stunTimer || 0, 1.1);
        spawnText(k.x, k.y - 18, 'RESBALON!', '#ff0', 14);
        spawnParticles(h.x, h.y, '#ffe040', 10, 140);
        race.hazards.splice(i, 1);
        sfx.hurt();
        break;
      }
    }
  }
}

function kartUpdateProjectiles(dt) {
  if (!race?.projectiles) return;
  for (let i = race.projectiles.length - 1; i >= 0; i--) {
    const p = race.projectiles[i];
    p.life -= dt;
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;
    if (p.life <= 0) { race.projectiles.splice(i, 1); continue; }
    let hit = false;
    for (const k of race.karts) {
      if (k.finished || k.idx === p.owner) continue;
      if (k.shieldTimer > 0 || k.starTimer > 0) {
        if (Math.hypot(k.x - p.x, k.y - p.y) < 30) {
          spawnRing(k.x, k.y, '#66ccff', 50, 0.3);
          hit = true; break;
        }
        continue;
      }
      if (Math.hypot(k.x - p.x, k.y - p.y) < 26) {
        k.speed *= 0.25;
        k.stunTimer = Math.max(k.stunTimer || 0, 1.4);
        spawnParticles(p.x, p.y, '#40c878', 12, 200);
        spawnText(k.x, k.y - 18, 'GOLPE!', '#f44', 15);
        sfx.hurt();
        hit = true; break;
      }
    }
    if (hit) race.projectiles.splice(i, 1);
  }
}

function kartUseItem(k, tr) {
  if (!k.item) return;
  const it = k.item;
  k.item = null;
  const meta = KART_ITEMS[it];
  if (it === 'boost') {
    k.boost = 260;
    spawnRing(k.x, k.y, meta.color, 65, 0.35);
    sfx.power();
  } else if (it === 'banana') {
    race.hazards.push({
      x: k.x - Math.cos(k.angle) * 32,
      y: k.y - Math.sin(k.angle) * 32,
      life: 18, owner: k.idx,
    });
    spawnText(k.x, k.y - 20, meta.name, meta.color, 13);
    sfx.select();
  } else if (it === 'shell') {
    race.projectiles.push({
      x: k.x + Math.cos(k.angle) * 28,
      y: k.y + Math.sin(k.angle) * 28,
      angle: k.angle, speed: 520, life: 3.5, owner: k.idx,
    });
    sfx.power();
  } else if (it === 'blueshell') {
    kartRank();
    const leader = race.karts.find(o => o.rank === 1 && o.idx !== k.idx);
    if (leader) {
      race.blueShells.push({
        x: k.x, y: k.y, target: leader.idx, speed: 380, life: 12, owner: k.idx, phase: 0,
      });
      showBanner('CAPARAZON AZUL!', '#3080ff');
    }
    sfx.power();
  } else if (it === 'lightning') {
    for (const o of race.karts) {
      if (o.idx === k.idx || o.finished) continue;
      if ((o.rank || 99) < (k.rank || 99)) {
        o.speed *= 0.2;
        o.stunTimer = Math.max(o.stunTimer || 0, 2.2);
        spawnRing(o.x, o.y, '#aaf', 70, 0.4);
      }
    }
    addFlash('#aaf', 0.12);
    sfx.power();
    showBanner('RAYO!', '#aaf');
  } else if (it === 'shield') {
    k.shieldTimer = 8;
    spawnRing(k.x, k.y, meta.color, 55, 0.35);
    sfx.power();
  } else if (it === 'coin') {
    k.coins = (k.coins || 0) + 1;
    k.boost = 90;
    spawnText(k.x, k.y - 16, 'MONEDA x' + k.coins, meta.color, 13);
    sfx.coin();
  } else if (it === 'mushroom') {
    k.boost = 200;
    spawnRing(k.x, k.y, '#e04040', 60, 0.35);
    spawnText(k.x, k.y - 20, 'CHAMPIÑON!', '#e04040', 14);
    sfx.power();
  } else if (it === 'star') {
    k.starTimer = 8;
    k.boost = 180;
    spawnRing(k.x, k.y, '#ffd700', 80, 0.45);
    showBanner('ESTRELLA!', '#ffd700');
    sfx.power();
  }
}

function kartUpdateBlueShells(dt) {
  if (!race?.blueShells) return;
  kartRank();
  for (let i = race.blueShells.length - 1; i >= 0; i--) {
    const p = race.blueShells[i];
    p.life -= dt;
    p.phase += dt * 8;
    if (p.life <= 0) { race.blueShells.splice(i, 1); continue; }
    let target = race.karts.find(o => o.idx === p.target && !o.finished);
    if (!target) target = race.karts.find(o => o.rank === 1 && !o.finished && o.idx !== p.owner);
    if (!target) { race.blueShells.splice(i, 1); continue; }
    p.target = target.idx;
    const dx = target.x - p.x, dy = target.y - p.y;
    const dist = Math.hypot(dx, dy);
    const want = Math.atan2(dy, dx);
    p.angle = want;
    const spd = p.speed + Math.sin(p.phase) * 40;
    p.x += Math.cos(want) * spd * dt;
    p.y += Math.sin(want) * spd * dt;
    if (dist < 30) {
      if (target.shieldTimer > 0 || target.starTimer > 0) {
        spawnRing(target.x, target.y, '#66ccff', 60, 0.35);
      } else {
        target.speed *= 0.1;
        target.stunTimer = Math.max(target.stunTimer || 0, 2.5);
        spawnParticles(p.x, p.y, '#3080ff', 20, 250);
        addShake(0.2);
        showBanner('GOLPE AZUL!', '#3080ff');
        sfx.hurt();
      }
      race.blueShells.splice(i, 1);
    }
  }
}

function kartDrawBlueShells() {
  if (!race?.blueShells) return;
  for (const p of race.blueShells) {
    const sp = kartToScreen(p.x, p.y);
    ctx.fillStyle = '#2060e0';
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 11, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#aaf'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#fff';
    for (let s = 0; s < 3; s++) {
      const a = p.phase + s * 2.1;
      ctx.beginPath();
      ctx.arc(sp.x + Math.cos(a) * 16, sp.y + Math.sin(a) * 16, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function kartAIUseItem(k) {
  if (!k.item || !k.ai) return;
  kartRank();
  const rank = k.rank || 2;
  if (k.item === 'lightning' || k.item === 'shell' || k.item === 'blueshell') {
    if (rank >= 3) { k.input.useItem = true; return; }
  }
  if (k.item === 'boost' && k.speed < KART_MAX_SPEED * 0.7) k.input.useItem = true;
  if (k.item === 'mushroom' || k.item === 'star') k.input.useItem = true;
  if (k.item === 'banana' && rank === 1 && Math.random() < 0.02) k.input.useItem = true;
  if (k.item === 'shield' && rank === 1 && Math.random() < 0.015) k.input.useItem = true;
}

function kartRubberBandAI(k, tr) {
  if (!k.ai) return 1;
  kartRank();
  const diff = kartDiff();
  const rank = k.rank || 2;
  const total = race.karts.length;
  if (rank >= total) return diff.catchupMul;
  if (rank === 1) {
    if (Math.random() < diff.errorRate) k.input.steer = -k.input.steer * 0.6;
    return diff.leaderMul;
  }
  return 1;
}

function kartDrawHazards(tr) {
  if (!race?.hazards) return;
  for (const h of race.hazards) {
    const p = kartToScreen(h.x, h.y);
    ctx.fillStyle = '#ffe040';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 10, 0.3, Math.PI * 2 - 0.3);
    ctx.fill();
    ctx.strokeStyle = '#aa8800'; ctx.lineWidth = 2; ctx.stroke();
  }
}

function kartDrawProjectiles(tr) {
  if (!race?.projectiles) return;
  for (const p of race.projectiles) {
    const sp = kartToScreen(p.x, p.y);
    ctx.fillStyle = '#40c878';
    ctx.beginPath(); ctx.arc(sp.x, sp.y, 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  }
}

function kartDrawObstacles(tr, t) {
  if (!race?.obstacles) return;
  for (const ob of race.obstacles) {
    const sp = kartToScreen(ob.x, ob.y);
    if (ob.kind === 'crab') {
      const pulse = Math.sin(t * 6 + ob.phase) * 3;
      ctx.fillStyle = '#c04040';
      ctx.beginPath(); ctx.arc(sp.x, sp.y + pulse, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.fillRect(sp.x - 8, sp.y - 4 + pulse, 4, 4);
      ctx.fillRect(sp.x + 4, sp.y - 4 + pulse, 4, 4);
    } else {
      ctx.fillStyle = '#666';
      ctx.beginPath(); ctx.arc(sp.x, sp.y, 16, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#999';
      ctx.beginPath(); ctx.arc(sp.x - 4, sp.y - 4, 6, 0, Math.PI * 2); ctx.fill();
    }
  }
}

function kartDrawShortcuts(tr, t) {
  if (!tr.shortcuts) return;
  for (const sc of tr.shortcuts) {
    const hw = (sc.width || 72) * 0.5;
    const segs = 24;
    const left = [], right = [];
    for (let i = 0; i <= segs; i++) {
      const frac = i / segs;
      const p0 = sc.path[Math.min(sc.path.length - 1, Math.floor(frac * (sc.path.length - 1)))];
      const p1 = sc.path[Math.min(sc.path.length - 1, Math.ceil(frac * (sc.path.length - 1)))];
      const f = (frac * (sc.path.length - 1)) % 1;
      const px = p0.x + (p1.x - p0.x) * f;
      const py = p0.y + (p1.y - p0.y) * f;
      const ang = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const nx = -Math.sin(ang), ny = Math.cos(ang);
      left.push(kartToScreen(px + nx * hw, py + ny * hw));
      right.push(kartToScreen(px - nx * hw, py - ny * hw));
    }
    ctx.fillStyle = 'rgba(80,90,60,0.85)';
    ctx.beginPath();
    ctx.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
    for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,80,0.5)'; ctx.lineWidth = 2; ctx.setLineDash([8, 6]);
    ctx.stroke(); ctx.setLineDash([]);
    const mid = sc.path[Math.floor(sc.path.length / 2)];
    const ms = kartToScreen(mid.x, mid.y);
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
    ctx.fillText('ATAJO', ms.x, ms.y - 12);
  }
}

function kartNearestOnAnyPath(tr, x, y, samples) {
  let best = kartNearestPath(tr, x, y, samples);
  best.onShortcut = false;
  if (!tr.shortcuts) return best;
  for (const sc of tr.shortcuts) {
    for (let i = 0; i <= (samples || 20); i++) {
      const frac = i / (samples || 20);
      const idx = Math.min(sc.path.length - 2, Math.floor(frac * (sc.path.length - 1)));
      const p0 = sc.path[idx], p1 = sc.path[idx + 1];
      const f = (frac * (sc.path.length - 1)) - idx;
      const px = p0.x + (p1.x - p0.x) * f;
      const py = p0.y + (p1.y - p0.y) * f;
      const d = Math.hypot(x - px, y - py);
      if (d < best.dist) {
        best = {
          dist: d, u: frac, x: px, y: py,
          angle: Math.atan2(p1.y - p0.y, p1.x - p0.x),
          onShortcut: true, shortcut: sc,
        };
      }
    }
  }
  return best;
}
