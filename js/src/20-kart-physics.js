// ── Kart physics: saltos, colisiones, antigravedad ─────────────────────────
const KART_JUMP_GRAV = 1100;
const KART_DIFFICULTIES = [
  { name: 'FACIL',   leaderMul: 0.82, catchupMul: 1.18, errorRate: 0.012 },
  { name: 'NORMAL',  leaderMul: 0.90, catchupMul: 1.14, errorRate: 0.006 },
  { name: 'DIFICIL', leaderMul: 0.96, catchupMul: 1.10, errorRate: 0.003 },
  { name: 'EXPERTO', leaderMul: 1.00, catchupMul: 1.06, errorRate: 0.001 },
];
let kartDifficulty = 1;

function kartDiff() {
  return KART_DIFFICULTIES[kartDifficulty] || KART_DIFFICULTIES[1];
}

function kartInitJumpState(k) {
  k.z = 0;
  k.vz = 0;
  k.antigrav = false;
  k._jumpCd = 0;
  k._boostCd = 0;
  k._agWarn = 0;
}

function kartPathU(tr, x, y) {
  return kartNearestPath(tr, x, y, tr.mega ? 160 : tr.huge ? 100 : 56).u;
}

function kartCheckJumpRamps(k, tr) {
  if (!tr.jumpRamps || k._jumpCd > 0 || k.z > 2) return;
  const u = kartPathU(tr, k.x, k.y);
  for (const ramp of tr.jumpRamps) {
    if (Math.abs(u - ramp.u) < 0.025 && k.speed > 140) {
      k.vz = ramp.power || 200;
      k._jumpCd = 0.6;
      k.boost = Math.max(k.boost, 40);
      spawnText(k.x, k.y - 30, '¡SALTO!', '#fff', 15);
      spawnRing(k.x, k.y, tr.accent || '#ff0', 45, 0.25);
      sfx.jump();
      break;
    }
  }
}

function kartCheckBoostPads(k, tr) {
  if (!tr.boostPads || k._boostCd > 0) return;
  const u = kartPathU(tr, k.x, k.y);
  for (const pad of tr.boostPads) {
    if (Math.abs(u - pad.u) < 0.028 && k.speed > 80) {
      const boost = pad.power || 100;
      k.boost = Math.max(k.boost, boost);
      k._boostCd = 0.45;
      spawnText(k.x, k.y - 26, 'TURBO!', tr.accent || '#0cf', 14);
      spawnRing(k.x, k.y, tr.accent || '#0cf', 55, 0.3);
      spawnParticles(k.x, k.y, tr.accent || '#0cf', 6, 160);
      sfx.power();
      if (!k.ai && k.idx === kartLocalIdx()) maybeVibrate(20);
      break;
    }
  }
}

function kartUpdateJump(k, dt) {
  if (k._jumpCd > 0) k._jumpCd -= dt;
  if (k._boostCd > 0) k._boostCd -= dt;
  if (k.z <= 0 && k.vz <= 0) {
    k.z = 0;
    k.vz = 0;
    return;
  }
  k.vz -= KART_JUMP_GRAV * dt;
  k.z += k.vz * dt;
  if (k.z < 0) {
    const hard = k.vz < -120;
    if (hard && (k.input?.accel || k.input?.drift)) {
      k.boost = Math.max(k.boost || 0, 120);
      spawnText(k.x, k.y - 28, 'TRUCO +BOOST!', '#8cf', 14);
      sfx.djump();
    } else if (hard) {
      spawnDust(k.x, k.y, 6);
      k.speed *= 0.98;
    }
    k.z = 0;
    k.vz = 0;
  }
}

function kartResolveCollisions(k) {
  if (!race || k.finished) return;
  const w = (k.stats?.weight || 1);
  for (const o of race.karts) {
    if (o === k || o.finished) continue;
    const dx = k.x - o.x, dy = k.y - o.y;
    const dist = Math.hypot(dx, dy);
    const minD = 34 + (k.z > 0 || o.z > 0 ? 8 : 0);
    if (dist >= minD || dist < 1) continue;
    const ow = (o.stats?.weight || 1);
    const push = (minD - dist) * (0.5 + w / (w + ow));
    const nx = dx / dist, ny = dy / dist;
    k.x += nx * push;
    k.y += ny * push;
    const rel = (k.speed - o.speed) * 0.08;
    k.speed = Math.max(80, k.speed - rel * (ow / w));
    o.speed = Math.max(80, o.speed + rel * (w / ow) * 0.5);
    if (dist < minD - 4 && Math.random() < 0.08) {
      spawnParticles((k.x + o.x) / 2, (k.y + o.y) / 2, '#ccc', 4, 120);
    }
  }
}

function kartUpdateAntigrav(k, tr) {
  const surf = kartSurfaceType(tr, k.x, k.y);
  const was = k.antigrav;
  k.antigrav = surf === 'antigrav';
  if (k.antigrav && !was) {
    k._agWarn = 1.2;
    spawnText(k.x, k.y - 24, 'ANTIGRAVEDAD!', '#c8f', 16);
    showBanner('ANTIGRAVEDAD', '#a8f');
  }
  if (k._agWarn > 0) k._agWarn -= dt;
}

function kartAntigravCamTilt(me, tr) {
  if (!race || !me) return 0;
  if (me.antigrav) return Math.PI * 0.22;
  return 0;
}

function kartDrawAntigravZones(tr, t) {
  if (!tr.surfaces) return;
  for (const s of tr.surfaces) {
    if (s.type !== 'antigrav') continue;
    const segs = 20;
    const u0 = s.uStart, u1 = s.uEnd;
    for (let i = 0; i <= segs; i++) {
      const u = u0 + (u1 - u0) * (i / segs);
      const p = kartPathSample(tr, u);
      const tg = kartPathTangent(tr, u);
      const sp = kartToScreen(p.x, p.y);
      const pulse = Math.sin(t * 5 + i * 0.5) * 0.3 + 0.7;
      const hw = tr.roadWidth * 0.55;
      const nx = -Math.sin(tg.angle), ny = Math.cos(tg.angle);
      ctx.strokeStyle = `rgba(180,100,255,${0.35 * pulse})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(sp.x + nx * hw, sp.y + ny * hw);
      ctx.lineTo(sp.x - nx * hw, sp.y - ny * hw);
      ctx.stroke();
      if (i % 4 === 0) {
        ctx.fillStyle = `rgba(200,140,255,${0.25 * pulse})`;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y - 20 - Math.sin(t * 4 + i) * 8, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const midU = (u0 + u1) / 2;
    const mp = kartPathSample(tr, midU);
    const ms = kartToScreen(mp.x, mp.y);
    ctx.fillStyle = '#d8a0ff';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('ANTI-G', ms.x, ms.y - 36);
  }
}

function kartDrawJumpRamps(tr, t) {
  if (!tr.jumpRamps) return;
  for (const ramp of tr.jumpRamps) {
    const p = kartPathSample(tr, ramp.u);
    const tg = kartPathTangent(tr, ramp.u);
    const sp = kartToScreen(p.x, p.y);
    const bob = Math.sin(t * 6) * 3;
    ctx.save();
    ctx.translate(sp.x, sp.y + bob);
    ctx.rotate(tg.angle);
    ctx.fillStyle = 'rgba(255,200,60,0.85)';
    ctx.beginPath();
    ctx.moveTo(-22, 8);
    ctx.lineTo(22, 8);
    ctx.lineTo(0, -16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }
}

function kartDrawBoostPads(tr, t, mini) {
  if (!tr.boostPads || mini) return;
  for (const pad of tr.boostPads) {
    const p = kartPathSample(tr, pad.u);
    const tg = kartPathTangent(tr, pad.u);
    const sp = kartToScreen(p.x, p.y);
    const pulse = 0.7 + 0.3 * Math.sin(t * 8 + pad.u * 20);
    const hw = kartRoadHalf(tr, false) * 0.55;
    const nx = -Math.sin(tg.angle), ny = Math.cos(tg.angle);
    const l = kartToScreen(p.x + nx * hw, p.y + ny * hw);
    const r = kartToScreen(p.x - nx * hw, p.y - ny * hw);
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = tr.accent || '#0cf';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.lineTo(r.x, r.y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = tr.accent || '#0cf';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', sp.x, sp.y + 4);
  }
}

function kartDrawJumpShadow(k, px, py) {
  if (!k.z || k.z <= 0) return;
  const shrink = Math.max(0.35, 1 - k.z / 120);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(px, py + 8, 22 * shrink, 10 * shrink, 0, 0, Math.PI * 2);
  ctx.fill();
}
