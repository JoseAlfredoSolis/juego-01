// ── Kart Racing (Mario Kart-style multiplayer) ───────────────────────────────
const KART_LAPS = 3;
const KART_MAX_SPEED = 480;
const KART_ACCEL = 620;
const KART_BRAKE = 900;
const KART_FRICTION = 320;
const KART_TURN = 3.8;
const KART_DRIFT_BOOST = 180;

const KART_TRACKS = [
  {
    name: 'BOSQUE OVAL',
    bg: ['#143818', '#2d6e1a'],
    grass: ['#1e4a1e', '#2f7a28'],
    asphalt: ['#3d4248', '#565c64'],
    kerb: ['#e03030', '#f0f0f0'],
    accent: '#7cff7c',
    decor: 'tree',
    cx: 640, cy: 360, rxOut: 420, ryOut: 308, rxIn: 232, ryIn: 160,
  },
  {
    name: 'CIRCUITO CIELO',
    bg: ['#1a3060', '#4a80c0'],
    grass: ['#1a4878', '#3a90c8'],
    asphalt: ['#505868', '#6a7488'],
    kerb: ['#3080ff', '#ffffff'],
    accent: '#9ed4ff',
    decor: 'cloud',
    cx: 640, cy: 360, rxOut: 395, ryOut: 278, rxIn: 210, ryIn: 138,
  },
  {
    name: 'VOLCANO',
    bg: ['#2a0808', '#6a1a0a'],
    grass: ['#3a1810', '#6a2818'],
    asphalt: ['#4a3830', '#625048'],
    kerb: ['#ff6020', '#ffcc40'],
    accent: '#ff9040',
    decor: 'lava',
    cx: 640, cy: 370, rxOut: 435, ryOut: 292, rxIn: 218, ryIn: 145,
  },
].map(kartLayoutTrack);

function kartMidRadii(tr) {
  return { rx: (tr.rxOut + tr.rxIn) * 0.5, ry: (tr.ryOut + tr.ryIn) * 0.5 };
}
function kartCpRadius(tr) {
  return Math.max(62, (tr.rxOut + tr.ryOut) * 0.12);
}
function kartLayoutTrack(tr) {
  const { rx, ry } = kartMidRadii(tr);
  const cpAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  tr.items = cpAngles.map((a, i) => {
    const ang = a + (i % 2 ? 0.42 : -0.42);
    return { x: tr.cx + Math.cos(ang) * rx * 0.96, y: tr.cy + Math.sin(ang) * ry * 0.96 };
  });
  const sa = -Math.PI / 2 - 0.32;
  const sx = tr.cx + Math.cos(sa) * rx * 0.9;
  const sy = tr.cy + Math.sin(sa) * ry * 0.9;
  tr.starts = [
    { x: sx - 20, y: sy, a: -0.4 },
    { x: sx + 20, y: sy, a: -0.4 },
  ];
  return tr;
}

let race = null;
let kartTrackSel = 0;
let kartLobbySel = 0;
let kartMenuSel = 0;
let kartResultsT = 0;

function kartCpAngles(tr) {
  return [ -Math.PI/2, 0, Math.PI/2, Math.PI ];
}
function kartEllPt(cx, cy, rx, ry, ang) {
  return { x: cx + Math.cos(ang) * rx, y: cy + Math.sin(ang) * ry };
}
function kartToScreen(x, y) {
  return { x: x - race.camX + W / 2, y: y - race.camY + H / 2 };
}
function kartGrip(tr, x, y) {
  const ang = Math.atan2(y - tr.cy, x - tr.cx);
  const rx = (tr.rxOut + tr.rxIn) * 0.5, ry = (tr.ryOut + tr.ryIn) * 0.5;
  const mx = tr.cx + Math.cos(ang) * rx, my = tr.cy + Math.sin(ang) * ry;
  const lane = Math.hypot(x - mx, y - my);
  const half = ((tr.rxOut - tr.rxIn) + (tr.ryOut - tr.ryIn)) * 0.22;
  if (lane < half * 0.45) return 1;
  if (lane < half * 0.85) return 0.88;
  return 0.68;
}
function kartDrawKerbs(scx, scy, tr, rx, ry, segs) {
  const w = Math.max(6, (tr.rxOut - tr.rxIn) * 0.07);
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2, a1 = ((i + 1) / segs) * Math.PI * 2;
    const p0 = kartEllPt(scx, scy, rx, ry, a0);
    const p1 = kartEllPt(scx, scy, rx, ry, a1);
    ctx.strokeStyle = (i % 2) ? tr.kerb[1] : tr.kerb[0];
    ctx.lineWidth = w;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.stroke();
  }
}
function kartDrawTrackDecor(tr, scx, scy, t, scale) {
  scale = scale || 1;
  const n = tr.decor === 'cloud' ? 10 : tr.decor === 'lava' ? 14 : 18;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + t * 0.08;
    const p = kartEllPt(scx, scy, (tr.rxOut + 58) * scale, (tr.ryOut + 42) * scale, ang);
    if (tr.decor === 'tree') {
      ctx.fillStyle = '#1a3a12';
      ctx.beginPath(); ctx.arc(p.x, p.y, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2d6a1a';
      ctx.beginPath(); ctx.arc(p.x, p.y - 8, 14, 0, Math.PI * 2); ctx.fill();
    } else if (tr.decor === 'cloud') {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 14, 0, Math.PI * 2);
      ctx.arc(p.x + 12, p.y + 2, 10, 0, Math.PI * 2);
      ctx.arc(p.x - 10, p.y + 3, 9, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const pulse = 0.45 + Math.sin(t * 3 + i) * 0.25;
      ctx.fillStyle = `rgba(255,${80 + (i % 3) * 40},20,${pulse})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 7 + (i % 3) * 2, 0, Math.PI * 2); ctx.fill();
    }
  }
}
function kartDrawTrackSurface(tr, scx, scy, t, mini) {
  const scale = mini ? 0.38 : 1;
  const rxO = tr.rxOut * scale, ryO = tr.ryOut * scale;
  const rxI = tr.rxIn * scale, ryI = tr.ryIn * scale;
  const g = ctx.createRadialGradient(scx, scy, 20, scx, scy, Math.max(rxO, ryO) + 80);
  g.addColorStop(0, tr.grass[1]); g.addColorStop(1, tr.grass[0]);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.ellipse(scx, scy, rxO + 46 * scale, ryO + 34 * scale, 0, 0, Math.PI * 2); ctx.fill();

  const ag = ctx.createLinearGradient(scx - rxO, scy - ryO, scx + rxO, scy + ryO);
  ag.addColorStop(0, tr.asphalt[0]); ag.addColorStop(0.5, tr.asphalt[1]); ag.addColorStop(1, tr.asphalt[0]);
  ctx.fillStyle = ag;
  ctx.beginPath(); ctx.ellipse(scx, scy, rxO, ryO, 0, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = tr.bg[0];
  ctx.beginPath(); ctx.ellipse(scx, scy, rxI, ryI, 0, 0, Math.PI * 2); ctx.fill();

  kartDrawKerbs(scx, scy, tr, rxO, ryO, mini ? 28 : 56);
  kartDrawKerbs(scx, scy, tr, rxI, ryI, mini ? 24 : 48);

  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = mini ? 1.5 : 2.5; ctx.setLineDash([mini ? 8 : 18, mini ? 10 : 16]);
  ctx.beginPath();
  ctx.ellipse(scx, scy, (rxO + rxI) * 0.5, (ryO + ryI) * 0.5, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  if (!mini) {
    const chevs = 16;
    for (let i = 0; i < chevs; i++) {
      const a = (i / chevs) * Math.PI * 2 + t * 1.6;
      const p = kartEllPt(scx, scy, (rxO + rxI) * 0.5, (ryO + ryI) * 0.5, a);
      const p2 = kartEllPt(scx, scy, (rxO + rxI) * 0.5, (ryO + ryI) * 0.5, a + 0.08);
      const dx = p2.x - p.x, dy = p2.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.beginPath();
      ctx.moveTo(p.x + dx / len * 10, p.y + dy / len * 10);
      ctx.lineTo(p.x - dy / len * 5, p.y + dx / len * 5);
      ctx.lineTo(p.x + dy / len * 5, p.y - dx / len * 5);
      ctx.closePath(); ctx.fill();
    }
  }
}
function kartDrawStartLine(tr, t) {
  const st = tr.starts[0];
  const s = kartToScreen(st.x, st.y);
  const bob = Math.sin(t * 8) * 2;
  for (let i = 0; i < 10; i++) {
    ctx.fillStyle = (Math.floor(i / 2) % 2) ? '#111' : '#fff';
    ctx.fillRect(s.x - 48 + i * 10, s.y - 24 + bob, 10, 48);
  }
  ctx.fillStyle = tr.accent; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
  ctx.fillText('META', s.x, s.y - 32 + bob);
}
function kartDrawCheckpoints(tr) {
  for (let i = 0; i < 4; i++) {
    const cp = kartCpPos(tr, i);
    const p = kartToScreen(cp.x, cp.y);
    const isFinish = i === 0;
    ctx.fillStyle = isFinish ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.12)';
    fillRR(p.x - 22, p.y - 14, 44, 28, 6, ctx.fillStyle);
    strokeRR(p.x - 22, p.y - 14, 44, 28, 6, isFinish ? UI.gold : 'rgba(255,255,255,0.35)', isFinish ? 2 : 1);
    ctx.fillStyle = isFinish ? UI.gold : UI.bright;
    ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
    ctx.fillText(isFinish ? 'META' : 'CP' + i, p.x, p.y + 5);
  }
}
function kartDrawItemBoxes(tr, t) {
  for (const box of tr.items) {
    if (box.taken) continue;
    const p = kartToScreen(box.x, box.y);
    const bob = Math.sin(t * 4 + box.x * 0.01) * 5;
    const hue = (t * 120 + box.x) % 360;
    ctx.fillStyle = `hsl(${hue}, 85%, 58%)`;
    fillRR(p.x - 16, p.y - 16 + bob, 32, 32, 7, ctx.fillStyle);
    strokeRR(p.x - 16, p.y - 16 + bob, 32, 32, 7, '#fff', 2);
    ctx.fillStyle = '#111'; ctx.font = 'bold 20px monospace'; ctx.textAlign = 'center';
    ctx.fillText('?', p.x, p.y + 7 + bob);
  }
}
function kartCpPos(tr, i) {
  const a = kartCpAngles(tr)[i];
  const { rx, ry } = kartMidRadii(tr);
  return { x: tr.cx + Math.cos(a) * rx, y: tr.cy + Math.sin(a) * ry };
}
function kartInTrack(tr, x, y) {
  const dx = (x - tr.cx) / tr.rxOut, dy = (y - tr.cy) / tr.ryOut;
  const dout = dx * dx + dy * dy;
  const dxi = (x - tr.cx) / tr.rxIn, dyi = (y - tr.cy) / tr.ryIn;
  const din = dxi * dxi + dyi * dyi;
  return dout <= 1.02 && din >= 0.92;
}
function kartPushToTrack(tr, k) {
  const ang = Math.atan2(k.y - tr.cy, k.x - tr.cx);
  const rMid = ((tr.rxOut + tr.rxIn) / 2 + (tr.ryOut + tr.ryIn) / 2) / 2;
  const rx = (tr.rxOut + tr.rxIn) / 2, ry = (tr.ryOut + tr.ryIn) / 2;
  k.x = tr.cx + Math.cos(ang) * rx;
  k.y = tr.cy + Math.sin(ang) * ry;
  k.speed *= 0.55;
  spawnParticles(k.x, k.y, '#fff', 6, 200);
}
function mkKart(idx, tr, solo) {
  const st = tr.starts[idx] || tr.starts[0];
  const isHost = idx === 0;
  const isAI = solo && idx === 1;
  return {
    idx, x: st.x, y: st.y, angle: st.a, speed: 0,
    lap: 0, cp: 0, boost: 0, drift: 0, driftCharge: 0,
    item: null, finished: false, finishTime: 0, rank: 0,
    char: isHost ? gs.character : (isAI ? 1 : mp.remoteChar),
    name: isHost ? (CHARACTERS[gs.character] || CHARACTERS[0]).name
      : (isAI ? 'CPU' : mp.remoteName),
    ai: isAI,
    input: { steer: 0, accel: 0, brake: 0, drift: false, useItem: false },
  };
}
function startKartRace(solo) {
  const tr = KART_TRACKS[kartTrackSel];
  tr.items.forEach(b => { b.taken = false; });
  const count = solo ? 2 : (mp.connected ? 2 : 1);
  race = {
    track: tr, solo: !!solo, phase: 'countdown', countdown: 3.5,
    timer: 0, karts: [],
    itemCd: 0, camX: tr.cx, camY: tr.cy, syncAcc: 0,
  };
  for (let i = 0; i < count; i++) race.karts.push(mkKart(i, tr, solo));
  kartResultsT = 0;
  sfx.select();
}
function kartReadInput(k) {
  const left = held('ArrowLeft') || held('KeyA');
  const right = held('ArrowRight') || held('KeyD');
  const up = held('ArrowUp') || held('KeyW');
  const down = held('ArrowDown') || held('KeyS');
  k.input.steer = (right ? 1 : 0) - (left ? 1 : 0);
  k.input.accel = up ? 1 : 0;
  k.input.brake = down ? 1 : 0;
  k.input.drift = held('Space');
  k.input.useItem = pressed('KeyJ') || pressed('ShiftLeft');
}
function kartAIInput(k, tr) {
  const target = kartCpPos(tr, k.cp);
  const dx = target.x - k.x, dy = target.y - k.y;
  const want = Math.atan2(dy, dx);
  let diff = want - k.angle;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  k.input.steer = clamp(diff * 2.5, -1, 1);
  k.input.accel = 1;
  k.input.brake = k.speed > KART_MAX_SPEED * 0.85 ? 0.3 : 0;
  k.input.drift = Math.abs(diff) > 0.8 && k.speed > 200;
  k.input.useItem = false;
}
function kartSimKart(k, dt, tr) {
  if (k.finished) return;
  const inp = k.input;
  const grip = kartGrip(tr, k.x, k.y);
  const turn = KART_TURN * grip * (0.35 + 0.65 * Math.min(1, Math.abs(k.speed) / 280));
  if (inp.steer) k.angle += inp.steer * turn * dt;
  let target = 0;
  const maxSpd = KART_MAX_SPEED * (0.72 + grip * 0.28);
  if (inp.accel) target = maxSpd + k.boost;
  if (inp.brake) target = -120;
  if (k.boost > 0) { k.boost -= dt * 120; if (k.boost < 0) k.boost = 0; }
  const accel = KART_ACCEL * (0.65 + grip * 0.35);
  if (k.speed < target) k.speed = Math.min(target, k.speed + accel * dt);
  else k.speed = Math.max(target, k.speed - (inp.brake ? KART_BRAKE : KART_FRICTION * (1.1 - grip * 0.2)) * dt);
  if (inp.drift && inp.steer && Math.abs(k.speed) > 150) {
    k.driftCharge = Math.min(1, k.driftCharge + dt * 0.9);
    k.speed *= 0.985;
    if (Math.random() < 0.45) spawnParticles(k.x, k.y, tr.accent || '#ff0', 2, 90);
  } else if (k.driftCharge > 0.5) {
    k.boost = KART_DRIFT_BOOST * k.driftCharge;
    spawnRing(k.x, k.y, '#ff0', 50, 0.3);
    k.driftCharge = 0;
  } else {
    k.driftCharge = Math.max(0, k.driftCharge - dt * 2);
  }
  k.x += Math.cos(k.angle) * k.speed * dt;
  k.y += Math.sin(k.angle) * k.speed * dt;
  if (!kartInTrack(tr, k.x, k.y)) kartPushToTrack(tr, k);
  else if (grip < 0.75 && Math.random() < 0.15) spawnParticles(k.x, k.y, tr.grass[0], 1, 60);
  for (let i = 0; i < 4; i++) {
    const cp = kartCpPos(tr, i);
    if (Math.hypot(k.x - cp.x, k.y - cp.y) < kartCpRadius(tr)) {
      if (i === (k.cp + 1) % 4) {
        k.cp = i;
        if (i === 0 && k.lap < KART_LAPS) {
          k.lap++;
          spawnText(k.x, k.y - 20, 'VUELTA ' + k.lap, '#ffd700', 18);
          sfx.star();
        }
      }
    }
  }
  if (inp.useItem && k.item) {
    if (k.item === 'boost') { k.boost = 220; spawnRing(k.x, k.y, '#f80', 60, 0.35); sfx.power(); }
    k.item = null;
  }
  for (const box of tr.items) {
    if (!box.taken && Math.hypot(k.x - box.x, k.y - box.y) < 36) {
      box.taken = true;
      k.item = Math.random() < 0.7 ? 'boost' : 'boost';
      spawnRing(box.x, box.y, '#f0f', 40, 0.3);
      sfx.coin();
      setTimeout(() => { box.taken = false; }, 8000);
    }
  }
  if (k.lap >= KART_LAPS && !k.finished) {
    k.finished = true;
    k.finishTime = race.timer;
    k.speed *= 0.3;
    sfx.win();
    spawnRing(k.x, k.y, '#ffd700', 90, 0.5);
  }
}
function kartRank() {
  if (!race) return;
  const scored = race.karts.map(k => ({
    k,
  score: k.finished ? 10000 - k.finishTime : k.lap * 1000 + k.cp * 100 - race.timer * 0.01,
  }));
  scored.sort((a, b) => b.score - a.score);
  scored.forEach((s, i) => { s.k.rank = i + 1; });
}
function kartLocalIdx() {
  if (!race) return 0;
  if (race.solo) return 0;
  return mp.role === 'guest' ? 1 : 0;
}
function kartHostSim(dt) {
  if (!race || race.phase !== 'racing') return;
  race.timer += dt;
  for (const k of race.karts) {
    if (k.idx === 0 || (race.solo && k.ai)) {
      if (k.ai) kartAIInput(k, race.track);
      else kartReadInput(k);
    }
    kartSimKart(k, dt, race.track);
  }
  kartRank();
  const allDone = race.karts.every(k => k.finished);
  if (allDone && race.phase === 'racing') {
    race.phase = 'done';
    if (mp.connected && mp.role === 'host') { kartBroadcastState(); mpHostBroadcast(); }
    setTimeout(() => changeScene('kartresults'), 1200);
  }
}
function kartGuestApplyState(msg) {
  if (!race) return;
  race.phase = msg.ph || race.phase;
  race.countdown = msg.cd ?? race.countdown;
  race.timer = msg.tm ?? race.timer;
  if (msg.k) {
    for (const s of msg.k) {
      const k = race.karts[s.i];
      if (!k) continue;
      if (s.i === kartLocalIdx()) {
        if (k.x === undefined) { k.x = s.x; k.y = s.y; k.angle = s.a; k.speed = s.s; }
        else {
          k.x = lerp(k.x, s.x, 0.45);
          k.y = lerp(k.y, s.y, 0.45);
          k.angle = lerp(k.angle, s.a, 0.35);
          k.speed = lerp(k.speed, s.s, 0.35);
        }
        k.lap = s.l; k.cp = s.c; k.finished = s.f; k.finishTime = s.ft;
        k.rank = s.r; k.item = s.it || k.item;
      } else {
        k.tx = s.x; k.ty = s.y; k.ta = s.a; k.ts = s.s;
        k.lap = s.l; k.cp = s.c; k.finished = s.f; k.finishTime = s.ft;
        k.rank = s.r; k.item = s.it;
        if (k.x === undefined) { k.x = s.x; k.y = s.y; k.angle = s.a; k.speed = s.s; }
        k.x = lerp(k.x, k.tx, 0.35);
        k.y = lerp(k.y, k.ty, 0.35);
        k.angle = lerp(k.angle, k.ta, 0.35);
        k.speed = lerp(k.speed, k.ts, 0.35);
      }
    }
  }
  if (race.phase === 'done') changeScene('kartresults', true);
}
function kartBroadcastState() {
  if (!race || mp.role !== 'host' || !mp.connected) return;
  const msg = {
    t: 'ks',
    ph: race.phase,
    cd: race.countdown,
    tm: race.timer,
    tr: kartTrackSel,
    k: race.karts.map(k => ({
      i: k.idx, x: k.x, y: k.y, a: k.angle, s: k.speed,
      l: k.lap, c: k.cp, f: k.finished ? 1 : 0, ft: k.finishTime,
      r: k.rank, it: k.item,
    })),
  };
  mpSend(msg);
}
function kartTick(dt) {
  if (!race || gs.scene !== 'kart') return;
  if (race.phase === 'countdown') {
    race.countdown -= dt;
    if (race.countdown <= 0) { race.phase = 'racing'; race.countdown = 0; showBanner('GO!', '#3f6'); sfx.win(); }
    if (mp.role === 'host' && mp.connected) {
      race.syncAcc = (race.syncAcc || 0) + dt;
      if (race.syncAcc >= 0.05) { race.syncAcc = 0; kartBroadcastState(); }
    }
    return;
  }
  if (mp.role === 'guest') {
    const k = race.karts[kartLocalIdx()];
    if (k) {
      kartReadInput(k);
      mpSend({ t: 'ki', st: k.input.steer, ac: k.input.accel, br: k.input.brake, df: k.input.drift ? 1 : 0, it: k.input.useItem ? 1 : 0 });
    }
    return;
  }
  if (mp.role === 'host' || race.solo) {
    kartHostSim(dt);
    if (mp.connected && mp.role === 'host') {
      race.syncAcc = (race.syncAcc || 0) + dt;
      if (race.syncAcc >= 0.05) { race.syncAcc = 0; kartBroadcastState(); }
    }
  }
}
function kartApplyGuestInput(msg) {
  if (!race) return;
  const k = race.karts[1];
  if (!k) return;
  k.input.steer = msg.st || 0;
  k.input.accel = msg.ac || 0;
  k.input.brake = msg.br || 0;
  k.input.drift = !!msg.df;
  k.input.useItem = !!msg.it;
}
function updateKart(dt) {
  if (!race) { changeScene('kartlobby'); return; }
  kartTick(dt);
  if (race.phase === 'racing' || race.phase === 'countdown') {
    const me = race.karts[kartLocalIdx()];
    if (me) { race.camX = lerp(race.camX, me.x, 0.12); race.camY = lerp(race.camY, me.y, 0.12); }
  }
  if (pressed('Escape') || pressed('KeyP')) {
    if (race.solo) { race = null; changeScene('kartmenu'); }
  }
}
function drawKartTrack(tr, t) {
  const sc = kartToScreen(tr.cx, tr.cy);
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, tr.bg[1]); grad.addColorStop(1, tr.bg[0]);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  kartDrawTrackDecor(tr, sc.x, sc.y, t || 0, 1);
  kartDrawTrackSurface(tr, sc.x, sc.y, t || 0, false);
  kartDrawStartLine(tr, t || 0);
  kartDrawCheckpoints(tr);
  kartDrawItemBoxes(tr, t || 0);
}
function drawKartEntity(k, tr) {
  const px = k.x - race.camX + W / 2, py = k.y - race.camY + H / 2;
  const col = ['#e33', '#33e', '#3e3', '#ee3'][k.idx % 4];
  if (k.driftCharge > 0.2 && Math.abs(k.speed) > 120) {
    ctx.fillStyle = tr.accent || '#ff0';
    for (let i = 0; i < 3; i++) {
      const bx = px - Math.cos(k.angle) * (14 + i * 8) + Math.sin(k.angle) * (i - 1) * 6;
      const by = py - Math.sin(k.angle) * (14 + i * 8) - Math.cos(k.angle) * (i - 1) * 6;
      ctx.globalAlpha = 0.35 - i * 0.08;
      ctx.beginPath(); ctx.arc(bx, by, 5 - i, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(k.angle);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(2, 4, 22, 12, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col;
  fillRR(-20, -12, 40, 24, 6, col);
  strokeRR(-20, -12, 40, 24, 6, 'rgba(0,0,0,0.35)', 1);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-10, -15, 20, 8); ctx.fillRect(-10, 7, 20, 8);
  ctx.fillStyle = '#555';
  ctx.beginPath(); ctx.arc(-12, -11, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(12, -11, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-12, 11, 4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(12, 11, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#888'; fillRR(12, -6, 8, 12, 2, '#999');
  if (k.boost > 40) {
    ctx.fillStyle = '#ff8800';
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-34, -5); ctx.lineTo(-34, 5); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(px, py - 22);
  ctx.scale(0.55, 0.55);
  (CHARACTERS[k.char] || CHARACTERS[0]).draw({ facing: 1, power: null, invTimer: 0, shieldTimer: 0 }, -PLAYER_W / 2, -PLAYER_H / 2);
  ctx.restore();
  if (k.item) {
    ctx.fillStyle = '#f0f'; ctx.font = '12px monospace'; ctx.textAlign = 'center';
    ctx.fillText('ITEM', px, py - 32);
  }
  ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
  ctx.fillText(k.name, px, py + 28);
}
function drawKart(t) {
  if (!race) return;
  drawKartTrack(race.track, t);
  const sorted = [...race.karts].sort((a, b) => a.rank - b.rank || 0);
  for (const k of sorted) drawKartEntity(k, race.track);
  fillRR(8, 8, W - 16, 56, 14, 'rgba(8,12,20,0.85)');
  const me = race.karts[kartLocalIdx()];
  if (me) {
    hud('VUELTA ' + Math.min(me.lap + 1, KART_LAPS) + '/' + KART_LAPS, 24, 38, UI.gold, 20);
    hud('CP ' + (me.cp + 1) + '/4', 24, 58, UI.dim, 14);
  }
  hud(race.track.name, W / 2, 36, UI.bright, 22, 'center');
  if (race.phase === 'racing') hud(race.timer.toFixed(1) + 's', W / 2, 58, UI.cyan, 16, 'center');
  if (race.phase === 'countdown') {
    const n = Math.ceil(race.countdown);
    uiTitle(n > 0 ? '' + n : 'GO!', H / 2, n > 0 ? 120 : 80, n > 0 ? UI.gold : UI.green);
  }
  fillRR(W - 208, 8, 200, 56, 12, 'rgba(8,12,20,0.85)');
  race.karts.slice().sort((a, b) => a.rank - b.rank).forEach((k, i) => {
    hud((k.rank || i + 1) + '. ' + k.name + (k.finished ? ' ✓' : ''), W - 108, 24 + i * 18, k.idx === kartLocalIdx() ? UI.gold : UI.bright, 14, 'center');
  });
  if (mp.connected) uiPill(W / 2 - 60, H - 36, 'ONLINE 1v1', UI.cyan);
  else if (race.solo) uiPill(W / 2 - 50, H - 36, 'VS CPU', UI.green);
  uiFooter('Flechas=Acelerar/Girar · Espacio=Drift · J=Item · Esc=Salir');
  drawBanner();
}
function updateKartResults(dt) {
  kartResultsT += dt;
  if (pressed('Enter') || pressed('Space') || pressed('Escape')) {
    race = null;
    if (mp.active) changeScene('kartlobby');
    else changeScene('kartmenu');
  }
}
function drawKartResults() {
  uiBgGrad('#0a1420', '#1a2840');
  uiTitle('RESULTADOS', 80, 44);
  if (!race) { uiFooter('Enter para volver'); return; }
  uiPanel(W / 2 - 300, 130, 600, 380, 20);
  const sorted = [...race.karts].sort((a, b) => a.rank - b.rank);
  sorted.forEach((k, i) => {
    const y = 180 + i * 72;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
    ctx.font = 'bold 28px monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = i === 0 ? UI.gold : UI.bright;
    ctx.fillText(medal + '  ' + k.name, W / 2 - 260, y);
    ctx.font = '18px monospace'; ctx.fillStyle = UI.dim;
    const time = k.finished ? k.finishTime.toFixed(2) + 's' : 'DNF';
    ctx.fillText(time, W / 2 + 80, y);
  });
  const winner = sorted[0];
  if (winner) hud('Ganador: ' + winner.name + '!', W / 2, 480, UI.gold, 24, 'center');
  uiFooter('Enter / Esc para volver');
}

// ── Kart menu / lobby scenes ─────────────────────────────────────────────────
const kartMenuItems = ['CREAR CARRERA', 'UNIRSE A CARRERA', 'CARRERA SOLO', 'VOLVER'];

function updateKartMenu(dt) {
  mobBindMenu(() => kartMenuSel, v => { kartMenuSel = v; });
  mobBindSwipe(dir => {
    const n = kartMenuItems.length;
    if (dir === 'up') kartMenuSel = (kartMenuSel - 1 + n) % n;
    if (dir === 'down') kartMenuSel = (kartMenuSel + 1) % n;
  });
  const n = kartMenuItems.length;
  if (pressed('ArrowUp') || pressed('KeyW')) { kartMenuSel = (kartMenuSel - 1 + n) % n; sfx.select(); }
  if (pressed('ArrowDown') || pressed('KeyS')) { kartMenuSel = (kartMenuSel + 1) % n; sfx.select(); }
  if (pressed('Escape')) { changeScene('menu'); return; }
  if (pressed('Enter') || pressed('Space')) {
    sfx.select();
    const it = kartMenuItems[kartMenuSel];
    if (it === 'CREAR CARRERA') { mp.gameMode = 'kart'; mpHostCreate(); changeScene('kartcreate'); mp.createT = 0; }
    else if (it === 'UNIRSE A CARRERA') { mp.gameMode = 'kart'; mp.joinBuf = ''; mp.errMsg = ''; changeScene('kartjoin'); }
    else if (it === 'CARRERA SOLO') { mp.gameMode = 'kart'; startKartRace(true); changeScene('kart'); }
    else if (it === 'VOLVER') { mpDisconnect(); changeScene('menu'); }
  }
}
function drawKartMenu(t) {
  uiBgGrad('#1a0830', '#301858'); uiSparkles(t * 0.5, 24);
  uiTitle('KART RACE', 80, 52);
  hud('Carreras estilo Mario Kart · Multijugador online', W / 2, 135, UI.cyan, 18, 'center');
  uiPanel(W / 2 - 240, 165, 480, 300, 18);
  for (let i = 0; i < kartMenuItems.length; i++) uiMenuRow(kartMenuItems[i], 220 + i * 58, i === kartMenuSel, 420, 46, i);
  hud('Invita a un amigo o practica contra la CPU', W / 2, 500, UI.dim, 16, 'center');
  uiFooter('Enter · Esc volver');
}
function updateKartCreate(dt) {
  mp.createT += dt;
  if (mp.autoJoin) return;
  if (pressed('KeyC') || (pressed('Enter') && !mp.connected)) mpCopyInvite();
  if (mp.connected && (pressed('Space') || pressed('Enter'))) changeScene('kartlobby');
  if (pressed('Escape')) { mpDisconnect(); changeScene('kartmenu'); }
}
function drawKartCreate(t) {
  uiBgGrad('#200818', '#401028'); uiSparkles(t * 0.4, 14);
  uiTitle('SALA DE CARRERA', 80, 40);
  uiPanel(W / 2 - 280, 130, 560, 380, 20);
  if (mp.roomCode) {
    hud('CODIGO DE CARRERA', W / 2, 175, UI.dim, 16, 'center');
    uiTitle(mp.roomCode, 230, 72, UI.gold);
  }
  const pulse = 0.7 + Math.sin(t * 4) * 0.3;
  ctx.globalAlpha = pulse;
  hud(mp.connected ? 'Rival conectado — Enter para elegir pista' : 'Esperando rival...', W / 2, 360, mp.connected ? UI.green : UI.cyan, 18, 'center');
  ctx.globalAlpha = 1;
  hud(mp.status, W / 2, 400, UI.dim, 15, 'center');
  if (mp.errMsg) hud(mp.errMsg, W / 2, 430, UI.red, 15, 'center');
  uiBtn(W / 2 - 120, 450, 240, 48, 'COPIAR INVITACION', true);
  uiFooter('Esc = volver');
}
function updateKartJoin(dt) {
  if (mp.autoJoin && typeof Peer !== 'undefined' && !mp.active) {
    mp.gameMode = 'kart';
    mp.autoJoin = false; mpGuestJoin(mp.joinBuf);
  }
  mpJoinKeys();
  if (mp.connected) changeScene('kartlobby', true);
  if (pressed('Escape')) { mpDisconnect(); changeScene('kartmenu'); }
}
function drawKartJoin(t) {
  uiBgGrad('#140828', '#281848'); uiSparkles(t * 0.4, 14);
  uiTitle('UNIRSE A CARRERA', 90, 40);
  uiPanel(W / 2 - 260, 150, 520, 320, 18);
  hud('Codigo de 6 letras del anfitrion', W / 2, 195, UI.dim, 17, 'center');
  const code = (mp.joinBuf + '______').slice(0, 6).split('').map((c, i) => mp.joinBuf[i] || '_').join(' ');
  uiTitle(code, 240, 64, mp.joinBuf.length === 6 ? UI.green : UI.gold);
  hud(mp.status || 'Toca el cuadro para escribir · 6 caracteres', W / 2, 320, UI.bright, 16, 'center');
  if (mp.errMsg) hud(mp.errMsg, W / 2, 360, UI.red, 16, 'center');
  if (mp.connected) hud('Conectado — espera al anfitrion', W / 2, 400, UI.green, 17, 'center');
  uiFooter('Enter unirse · Esc volver');
}
function updateKartLobby(dt) {
  if (mp.role === 'guest') {
    mobBindSwipe(null);
    if (pressed('Escape')) { mpDisconnect(); changeScene('kartmenu'); }
    return;
  }
  mobBindSwipe(dir => {
    const prev = kartTrackSel;
    if (dir === 'left') kartTrackSel = (kartTrackSel - 1 + KART_TRACKS.length) % KART_TRACKS.length;
    if (dir === 'right') kartTrackSel = (kartTrackSel + 1 + KART_TRACKS.length) % KART_TRACKS.length;
    if (kartTrackSel !== prev) mpHostBroadcast();
  });
  if (pressed('ArrowLeft') || pressed('KeyA')) {
    const prev = kartTrackSel;
    kartTrackSel = (kartTrackSel - 1 + KART_TRACKS.length) % KART_TRACKS.length;
    if (kartTrackSel !== prev) { sfx.select(); mpHostBroadcast(); }
  }
  if (pressed('ArrowRight') || pressed('KeyD')) {
    const prev = kartTrackSel;
    kartTrackSel = (kartTrackSel + 1 + KART_TRACKS.length) % KART_TRACKS.length;
    if (kartTrackSel !== prev) { sfx.select(); mpHostBroadcast(); }
  }
  if (pressed('Enter') || pressed('Space')) {
    if (mp.connected) {
      startKartRace(false);
      changeScene('kart');
    } else {
      startKartRace(true);
      changeScene('kart');
    }
  }
  if (pressed('Escape')) { mpDisconnect(); changeScene('kartmenu'); }
}
function drawKartLobby(t) {
  const tr = KART_TRACKS[kartTrackSel];
  uiBgGrad(tr.bg[0], tr.bg[1]); uiSparkles(t * 0.3, 16);
  uiTitle('PISTA DE CARRERA', 70, 40);
  uiPanel(W / 2 - 320, 110, 640, 420, 20);
  hud('PISTA', W / 2, 150, UI.dim, 16, 'center');
  uiTitle(tr.name, 200, 48, UI.gold);
  const cx = W / 2, cy = 330;
  kartDrawTrackSurface(tr, cx, cy, t, true);
  kartDrawTrackDecor(tr, cx, cy, t * 0.6, 0.38);
  const decor = tr.decor === 'tree' ? 'Bosque · Grip alto' : tr.decor === 'cloud' ? 'Cielo · Curvas rapidas' : 'Volcan · Riesgo y boost';
  hud(decor, W / 2, 430, tr.accent, 15, 'center');
  ctx.fillStyle = UI.dim; ctx.font = '16px monospace'; ctx.textAlign = 'center';
  ctx.fillText('< Izq/Der cambiar pista >', W / 2, 460);
  if (mp.role === 'guest') {
    hud('Esperando al anfitrion...', W / 2, 500, UI.cyan, 20, 'center');
    hud('Pista: ' + tr.name, W / 2, 530, UI.bright, 18, 'center');
  } else {
    hud(mp.connected ? 'Rival listo — Enter para INICIAR' : 'Sin rival — Enter para jugar vs CPU', W / 2, 500, mp.connected ? UI.green : UI.dim, 18, 'center');
  }
  uiFooter('Enter=Iniciar carrera · Esc=Salir');
}
