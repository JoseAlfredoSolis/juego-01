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
    cx: 640, cy: 360, rxOut: 300, ryOut: 220, rxIn: 165, ryIn: 115,
    items: [{x:640,y:140},{x:940,y:360},{x:640,y:580},{x:340,y:360}],
    starts: [{x:580,y:300,a:-0.4},{x:620,y:300,a:-0.4}],
  },
  {
    name: 'CIRCUITO CIELO',
    bg: ['#1a3060', '#4a80c0'],
    cx: 640, cy: 360, rxOut: 280, ryOut: 200, rxIn: 150, ryIn: 100,
    items: [{x:640,y:160},{x:880,y:280},{x:760,y:520},{x:400,y:440},{x:520,y:200}],
    starts: [{x:600,y:280,a:-0.5},{x:640,y:280,a:-0.5}],
  },
  {
    name: 'VOLCANO',
    bg: ['#2a0808', '#6a1a0a'],
    cx: 640, cy: 370, rxOut: 310, ryOut: 210, rxIn: 155, ryIn: 105,
    items: [{x:640,y:150},{x:920,y:370},{x:640,y:590},{x:360,y:370},{x:780,y:250}],
    starts: [{x:570,y:310,a:-0.35},{x:610,y:310,a:-0.35}],
  },
];

let race = null;
let kartTrackSel = 0;
let kartLobbySel = 0;
let kartMenuSel = 0;
let kartResultsT = 0;

function kartCpAngles(tr) {
  return [ -Math.PI/2, 0, Math.PI/2, Math.PI ];
}
function kartCpPos(tr, i) {
  const a = kartCpAngles(tr)[i];
  const r = (tr.rxOut + tr.rxIn) / 2;
  const ry = (tr.ryOut + tr.ryIn) / 2;
  return { x: tr.cx + Math.cos(a) * r, y: tr.cy + Math.sin(a) * ry };
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
  const turn = KART_TURN * (0.35 + 0.65 * Math.min(1, Math.abs(k.speed) / 280));
  if (inp.steer) k.angle += inp.steer * turn * dt;
  let target = 0;
  if (inp.accel) target = KART_MAX_SPEED + k.boost;
  if (inp.brake) target = -120;
  if (k.boost > 0) { k.boost -= dt * 120; if (k.boost < 0) k.boost = 0; }
  if (k.speed < target) k.speed = Math.min(target, k.speed + KART_ACCEL * dt);
  else k.speed = Math.max(target, k.speed - (inp.brake ? KART_BRAKE : KART_FRICTION) * dt);
  if (inp.drift && inp.steer && Math.abs(k.speed) > 150) {
    k.driftCharge = Math.min(1, k.driftCharge + dt * 0.9);
    k.speed *= 0.985;
    if (Math.random() < 0.3) spawnParticles(k.x, k.y, '#ff0', 1, 80);
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
  for (let i = 0; i < 4; i++) {
    const cp = kartCpPos(tr, i);
    if (Math.hypot(k.x - cp.x, k.y - cp.y) < 55) {
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
function drawKartTrack(tr) {
  const cx = tr.cx - race.camX + W / 2, cy = tr.cy - race.camY + H / 2;
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, tr.bg[1]); grad.addColorStop(1, tr.bg[0]);
  ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#2a5a2a';
  ctx.beginPath(); ctx.ellipse(cx, cy, tr.rxOut + 40, tr.ryOut + 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3a7a3a';
  ctx.beginPath(); ctx.ellipse(cx, cy, tr.rxOut, tr.ryOut, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = tr.bg[0];
  ctx.beginPath(); ctx.ellipse(cx, cy, tr.rxIn, tr.ryIn, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; ctx.setLineDash([16, 14]);
  ctx.beginPath(); ctx.ellipse(cx, cy, (tr.rxOut + tr.rxIn) / 2, (tr.ryOut + tr.ryIn) / 2, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 4; i++) {
    const cp = kartCpPos(tr, i);
    const px = cp.x - race.camX + W / 2, py = cp.y - race.camY + H / 2;
    ctx.fillStyle = 'rgba(255,215,0,0.35)';
    ctx.beginPath(); ctx.arc(px, py, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
    ctx.fillText('' + (i + 1), px, py + 5);
  }
  for (const box of tr.items) {
    const px = box.x - race.camX + W / 2, py = box.y - race.camY + H / 2;
    if (box.taken) continue;
    const bob = Math.sin(performance.now() / 200 + box.x) * 4;
    fillRR(px - 14, py - 14 + bob, 28, 28, 6, '#f0f');
    ctx.fillStyle = '?'; ctx.font = 'bold 18px monospace'; ctx.textAlign = 'center';
    ctx.fillText('?', px, py + 6 + bob);
  }
  const sx = tr.starts[0].x - race.camX + W / 2, sy = tr.starts[0].y - race.camY + H / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.fillRect(sx - 50, sy - 30, 100, 4); ctx.fillRect(sx - 50, sy + 26, 100, 4);
}
function drawKartEntity(k) {
  const px = k.x - race.camX + W / 2, py = k.y - race.camY + H / 2;
  ctx.save();
  ctx.translate(px, py);
  ctx.rotate(k.angle);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fillRect(-18, -10, 36, 22);
  ctx.fillStyle = ['#e33', '#33e', '#3e3', '#ee3'][k.idx % 4];
  ctx.fillRect(-20, -12, 40, 24);
  ctx.fillStyle = '#222'; ctx.fillRect(-8, -16, 16, 8); ctx.fillRect(-8, 8, 16, 8);
  ctx.fillStyle = '#888'; ctx.fillRect(14, -6, 6, 12);
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
  drawKartTrack(race.track);
  const sorted = [...race.karts].sort((a, b) => a.rank - b.rank || 0);
  for (const k of sorted) drawKartEntity(k);
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
  for (let i = 0; i < kartMenuItems.length; i++) uiMenuRow(kartMenuItems[i], 220 + i * 58, i === kartMenuSel, 420, 46);
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
    if (pressed('Escape')) { mpDisconnect(); changeScene('kartmenu'); }
    return;
  }
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
  const cx = W / 2, cy = 340;
  ctx.fillStyle = '#3a7a3a';
  ctx.beginPath(); ctx.ellipse(cx, cy, 120, 88, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = tr.bg[0];
  ctx.beginPath(); ctx.ellipse(cx, cy, 65, 45, 0, 0, Math.PI * 2); ctx.fill();
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
