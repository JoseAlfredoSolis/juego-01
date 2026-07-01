// ── Mario Kart: stats, copa, slipstream, salida, personalización ───────────
const KART_RACER_COUNT = 8;
const KART_POINTS = [15, 12, 10, 8, 6, 4, 2, 1];
const KART_ARCHETYPES = {
  light:    { label: 'LIGERO',    accel: 1.14, topSpeed: 0.90, weight: 0.78, handling: 1.18, color: '#5cf' },
  medium:   { label: 'MEDIO',     accel: 1.00, topSpeed: 1.00, weight: 1.00, handling: 1.00, color: '#8f8' },
  heavy:    { label: 'PESADO',    accel: 0.86, topSpeed: 1.10, weight: 1.22, handling: 0.88, color: '#f86' },
  balanced: { label: 'EQUILIBRADO', accel: 1.06, topSpeed: 1.03, weight: 0.96, handling: 1.06, color: '#fd4' },
};
const KART_CHAR_CLASS = {
  0: 'balanced', 1: 'light', 2: 'light', 3: 'heavy', 4: 'medium', 5: 'heavy',
  6: 'medium', 7: 'light', 8: 'medium', 9: 'heavy', 10: 'medium', 11: 'light',
  12: 'medium', 13: 'light', 14: 'light', 15: 'medium', 16: 'balanced',
};
const KART_CHASSIS = [
  { name: 'ESTANDAR', accel: 1.0, topSpeed: 1.0, handling: 1.0 },
  { name: 'VELOZ',    accel: 0.94, topSpeed: 1.08, handling: 0.96 },
  { name: 'MANEJO',   accel: 1.06, topSpeed: 0.96, handling: 1.10 },
];
const KART_WHEELS = [
  { name: 'NORMALES', grip: 1.0, accel: 1.0 },
  { name: 'SLICK',    grip: 0.92, accel: 1.06 },
  { name: 'OFFROAD',  grip: 1.12, accel: 0.98 },
];
const KART_GLIDERS = [
  { name: 'PLANO',   topSpeed: 1.0, handling: 1.0 },
  { name: 'ALAS',    topSpeed: 1.04, handling: 1.06 },
  { name: 'PESADO',  topSpeed: 0.98, handling: 0.94 },
];
const KART_CUPS = [
  { name: 'COPA MUSHROOM', tracks: [0, 1, 2], color: '#e04040', icon: '🍄' },
  { name: 'COPA FLOR',     tracks: [1, 2, 3], color: '#40c040', icon: '🌸' },
  { name: 'COPA ESTRELLA', tracks: [0, 2, 4], color: '#4080ff', icon: '⭐' },
  { name: 'COPA NEBULA',   tracks: [3, 4, 1], color: '#a040ff', icon: '🌌' },
];
const KART_CPU_NAMES = ['PEACH', 'BOWSER', 'TOAD', 'LUIGI', 'YOSHI', 'WARIO', 'WALUIGI'];

let kartRaceMode = 'single';
let kartSelectTab = 0;
let kartSelectDriver = 0;
let kartSelectChassis = 0;
let kartSelectWheels = 0;
let kartSelectGlider = 0;
let kartCupSel = 0;
let kartCupState = null;

function kartCharClass(idx) {
  return KART_ARCHETYPES[KART_CHAR_CLASS[idx] || 'balanced'] || KART_ARCHETYPES.balanced;
}
function kartBuildStats(charIdx, chassis, wheels, glider) {
  const arch = kartCharClass(charIdx);
  const ch = KART_CHASSIS[chassis || 0] || KART_CHASSIS[0];
  const wh = KART_WHEELS[wheels || 0] || KART_WHEELS[0];
  const gl = KART_GLIDERS[glider || 0] || KART_GLIDERS[0];
  return {
    accel: arch.accel * ch.accel * wh.accel,
    topSpeed: arch.topSpeed * ch.topSpeed * gl.topSpeed,
    handling: arch.handling * ch.handling * gl.handling,
    grip: wh.grip,
    weight: arch.weight,
    archetype: arch.label,
    archeColor: arch.color,
  };
}
function kartPlayerStats() {
  return kartBuildStats(
    kartSelectDriver,
    kartSelectChassis,
    kartSelectWheels,
    kartSelectGlider
  );
}
function kartShuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function kartCpuRoster(playerChar, guestChar) {
  const used = new Set([playerChar]);
  if (guestChar !== undefined && guestChar !== null) used.add(guestChar);
  const pool = [];
  for (let i = 0; i < CHARACTERS.length; i++) {
    if (!used.has(i)) pool.push(i);
  }
  const shuffled = kartShuffle(pool);
  const cpus = [];
  for (let i = 0; i < KART_RACER_COUNT - used.size; i++) {
    const ci = shuffled[i % shuffled.length];
    cpus.push({
      char: ci,
      name: KART_CPU_NAMES[i % KART_CPU_NAMES.length],
      chassis: i % KART_CHASSIS.length,
      wheels: (i + 1) % KART_WHEELS.length,
      glider: (i + 2) % KART_GLIDERS.length,
    });
  }
  return cpus;
}
function kartLayoutEightStarts(tr) {
  const st = kartPathTangent(tr, 0.004);
  const nx = -Math.sin(st.angle) * 26, ny = Math.cos(st.angle) * 26;
  const cols = [-78, -26, 26, 78];
  const rows = [-44, 44];
  tr.starts = [];
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols.length; c++) {
      tr.starts.push({
        x: st.x + Math.cos(st.angle) * rows[r] + nx * (cols[c] / 26),
        y: st.y + Math.sin(st.angle) * rows[r] + ny * (cols[c] / 26),
        a: st.angle,
      });
    }
  }
}
function kartInitCup(cupIdx) {
  const cup = KART_CUPS[cupIdx];
  kartCupState = {
    cupIdx,
    cup,
    raceIdx: 0,
    standings: [],
    playerChar: kartSelectDriver,
    playerName: (CHARACTERS[kartSelectDriver] || CHARACTERS[0]).name,
  };
  kartTrackSel = cup.tracks[0];
}
function kartCupAddPoints() {
  if (!kartCupState || !race) return;
  kartRank();
  const sorted = [...race.karts].sort((a, b) => a.rank - b.rank);
  for (let i = 0; i < sorted.length; i++) {
    const k = sorted[i];
    const pts = KART_POINTS[i] || 1;
    let entry = kartCupState.standings.find(s => s.idx === k.idx);
    if (!entry) {
      entry = { idx: k.idx, name: k.name, char: k.char, points: 0, races: 0 };
      kartCupState.standings.push(entry);
    }
    entry.points += pts;
    entry.races++;
    entry.lastRank = i + 1;
  }
  kartCupState.standings.sort((a, b) => b.points - a.points);
}
function kartCupAdvance() {
  if (!kartCupState) return false;
  kartCupAddPoints();
  kartCupState.raceIdx++;
  if (kartCupState.raceIdx >= kartCupState.cup.tracks.length) return false;
  kartTrackSel = kartCupState.cup.tracks[kartCupState.raceIdx];
  return true;
}
function kartCupFinished() {
  return kartCupState && kartCupState.raceIdx >= kartCupState.cup.tracks.length;
}

function kartSurfaceType(tr, x, y) {
  if (!tr.surfaces) return 'road';
  const near = kartNearestPath(tr, x, y, tr.huge ? 100 : 48);
  const u = near.u;
  for (const s of tr.surfaces) {
    const u0 = s.uStart, u1 = s.uEnd;
    if (u0 <= u1) {
      if (u >= u0 && u <= u1) return s.type;
    } else if (u >= u0 || u <= u1) {
      return s.type;
    }
  }
  return 'road';
}
function kartSurfaceGripMod(tr, x, y, baseGrip) {
  const surf = kartSurfaceType(tr, x, y);
  if (surf === 'water') return { grip: baseGrip * 0.42, speedMul: 0.55, label: 'AGUA' };
  if (surf === 'offroad') return { grip: baseGrip * 0.65, speedMul: 0.72, label: null };
  if (surf === 'boost') return { grip: baseGrip * 1.05, speedMul: 1.0, label: null };
  if (surf === 'antigrav') return { grip: baseGrip * 1.12, speedMul: 1.12, label: 'ANTIGRAVEDAD' };
  return { grip: baseGrip, speedMul: 1.0, label: null };
}

function kartUpdateSlipstream(k, dt) {
  if (!race || k.finished || k.ai === false && k.idx !== kartLocalIdx()) return;
  k.slipstream = k.slipstream || 0;
  let bestDist = 1e9, leader = null;
  for (const o of race.karts) {
    if (o === k || o.finished) continue;
    const dx = o.x - k.x, dy = o.y - k.y;
    const dist = Math.hypot(dx, dy);
    const behind = Math.cos(k.angle) * dx + Math.sin(k.angle) * dy;
    const lateral = Math.abs(-Math.sin(k.angle) * dx + Math.cos(k.angle) * dy);
    if (behind > 20 && behind < 110 && lateral < 45 && dist < bestDist) {
      const angleDiff = Math.abs(kartAngleDiff(o.angle, k.angle));
      if (angleDiff < 0.5 && o.speed > 120) {
        bestDist = dist;
        leader = o;
      }
    }
  }
  if (leader) {
    k.slipstream = Math.min(1, k.slipstream + dt * 0.55);
    if (k.slipstream >= 1 && !k.slipstreamUsed) {
      k.boost = Math.max(k.boost, 120);
      k.slipstreamUsed = true;
      spawnText(k.x, k.y - 28, 'REBUFO!', '#8cf', 14);
      spawnRing(k.x, k.y, '#8cf', 50, 0.3);
    }
  } else {
    k.slipstream = Math.max(0, k.slipstream - dt * 0.8);
    if (k.slipstream < 0.3) k.slipstreamUsed = false;
  }
}

function kartCountdownPhase(cd) {
  if (cd > 3.2) return { text: '', light: 'red', lights: 0 };
  if (cd > 2.2) return { text: '3', light: 'red', lights: 1 };
  if (cd > 1.2) return { text: '2', light: 'red', lights: 2 };
  if (cd > 0.2) return { text: '1', light: 'red', lights: 3 };
  if (cd > 0) return { text: 'GO!', light: 'green', lights: 0 };
  return { text: '', light: 'go', lights: 0 };
}
function kartCheckStartBoost(k) {
  if (!race || race.phase !== 'countdown') return;
  if (race.countdown > 0.15 || race.countdown <= 0) return;
  if (k.input.accel > 0 && !k.startBoostAttempt) {
    k.startBoostAttempt = true;
    const timing = Math.abs(race.countdown - 0.08);
    if (timing < 0.12) {
      k.startBoost = 'perfect';
      k.pendingStartBoost = 280;
    } else if (timing < 0.25) {
      k.startBoost = 'good';
      k.pendingStartBoost = 160;
    } else {
      k.startBoost = 'early';
      k.stunTimer = 0.8;
      k.speed = 0;
      spawnText(k.x, k.y - 20, 'DEMASIADO PRONTO!', '#f44', 14);
    }
  }
}
function kartApplyStartBoost(k) {
  if (k.pendingStartBoost) {
    k.boost = k.pendingStartBoost;
    k.pendingStartBoost = 0;
    if (k.startBoost === 'perfect') {
      spawnText(k.x, k.y - 24, 'SALIDA PERFECTA!', '#ffd700', 16);
      spawnRing(k.x, k.y, '#ffd700', 70, 0.4);
    }
  }
}

function kartDrawTrafficLights(t) {
  if (!race?.track?.starts?.[0]) return;
  const st = race.track.starts[0];
  const sp = kartToScreen(st.x, st.y);
  const phase = kartCountdownPhase(race.countdown);
  const cx = sp.x, cy = sp.y - 55;
  fillRR(cx - 70, cy - 90, 140, 180, 14, 'rgba(0,0,0,0.8)');
  strokeRR(cx - 70, cy - 90, 140, 180, 14, '#555', 2);
  const colors = ['#400', '#400', '#400'];
  const lit = phase.lights;
  for (let i = 0; i < 3; i++) {
    if (i < lit) colors[i] = '#f00';
    if (phase.light === 'green') colors[i] = '#0f0';
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = colors[i];
    ctx.beginPath();
    ctx.arc(cx, cy - 55 + i * 42, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  if (phase.text) {
    ctx.font = 'bold ' + (phase.text === 'GO!' ? 52 : 44) + 'px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = phase.text === 'GO!' ? UI.green : UI.gold;
    ctx.fillText(phase.text, cx, cy + 110);
  }
  if (race.countdown > 0 && race.countdown < 0.35) {
    hud('¡Acelera para boost de salida!', W / 2, H - 88, UI.cyan, 15, 'center');
  }
}

function kartDrawSlipstreamBar(k, px, py) {
  if (!k.slipstream || k.slipstream < 0.05) return;
  const bw = 36;
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  fillRR(px - bw / 2, py + 38, bw, 5, 2, ctx.fillStyle);
  fillRR(px - bw / 2, py + 38, bw * k.slipstream, 5, 2, '#48f');
}

function kartDrawWaterZones(tr, t) {
  if (!tr.surfaces) return;
  for (const s of tr.surfaces) {
    if (s.type !== 'water') continue;
    const segs = 16;
    const u0 = s.uStart, u1 = s.uEnd;
    for (let i = 0; i < segs; i++) {
      const u = u0 + (u1 - u0) * (i / segs);
      const p = kartPathSample(tr, u);
      const tg = kartPathTangent(tr, u);
      const sp = kartToScreen(p.x, p.y);
      const wave = Math.sin(t * 3 + i * 0.8) * 4;
      ctx.fillStyle = 'rgba(40,120,220,0.45)';
      ctx.beginPath();
      ctx.ellipse(sp.x, sp.y + wave, tr.roadWidth * 0.35, tr.roadWidth * 0.22, tg.angle, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// ── Selection & cup scenes ───────────────────────────────────────────────────
const kartSelectTabs = ['PILOTO', 'CHASIS', 'RUEDAS', 'PLANEADOR'];

function updateKartSelect(dt) {
  mobBindSwipe(dir => {
    if (dir === 'left') kartSelectTab = (kartSelectTab - 1 + 4) % 4;
    if (dir === 'right') kartSelectTab = (kartSelectTab + 1) % 4;
  });
  if (pressed('ArrowLeft') || pressed('KeyA')) {
    kartSelectTab = (kartSelectTab - 1 + 4) % 4;
    sfx.select();
  }
  if (pressed('ArrowRight') || pressed('KeyD')) {
    kartSelectTab = (kartSelectTab + 1) % 4;
    sfx.select();
  }
  const unlocked = [];
  for (let i = 0; i < CHARACTERS.length; i++) {
    if (isCharUnlocked(i)) unlocked.push(i);
  }
  if (kartSelectTab === 0) {
    mobBindMenu(() => unlocked.indexOf(kartSelectDriver), v => { kartSelectDriver = unlocked[v] || 0; });
    if (pressed('ArrowUp') || pressed('KeyW')) {
      const idx = unlocked.indexOf(kartSelectDriver);
      kartSelectDriver = unlocked[(idx - 1 + unlocked.length) % unlocked.length];
      sfx.select();
    }
    if (pressed('ArrowDown') || pressed('KeyS')) {
      const idx = unlocked.indexOf(kartSelectDriver);
      kartSelectDriver = unlocked[(idx + 1) % unlocked.length];
      sfx.select();
    }
  } else {
    const max = kartSelectTab === 1 ? KART_CHASSIS.length : kartSelectTab === 2 ? KART_WHEELS.length : KART_GLIDERS.length;
    let sel = kartSelectTab === 1 ? kartSelectChassis : kartSelectTab === 2 ? kartSelectWheels : kartSelectGlider;
    if (pressed('ArrowUp') || pressed('KeyW')) { sel = (sel - 1 + max) % max; sfx.select(); }
    if (pressed('ArrowDown') || pressed('KeyS')) { sel = (sel + 1) % max; sfx.select(); }
    if (kartSelectTab === 1) kartSelectChassis = sel;
    else if (kartSelectTab === 2) kartSelectWheels = sel;
    else kartSelectGlider = sel;
  }
  gs.character = kartSelectDriver;
  if (pressed('Escape')) {
  if (kartRaceMode === 'cup') changeScene('kartcup');
    else changeScene('kartmenu');
  }
  if (pressed('Enter') || pressed('Space')) {
    sfx.select();
    gs.character = kartSelectDriver;
    if (kartRaceMode === 'cup') {
      kartInitCup(kartCupSel);
      startKartRace(true);
      changeScene('kart', true);
    } else if (kartRaceMode === 'online') {
      changeScene(mp.connected ? 'kartlobby' : 'kartcreate', true);
    } else {
      changeScene('kartlobby', true);
    }
  }
}
function drawKartSelect(t) {
  if (document.body.classList.contains('mob-menu-html')) {
    if (!document.body.classList.contains('three-menu')) uiBgGrad('#0a1830', '#1a2848');
    return;
  }
  uiBgGrad('#0a1830', '#1a2848');
  uiSparkles(t * 0.4, 18);
  const port = mobTouchPortrait();
  uiTitle('PERSONALIZAR KART', port ? 48 : 70, port ? 28 : 38);
  const tabY = port ? 82 : 115;
  const tabW = port ? 72 : 88;
  const tabGap = port ? 4 : 8;
  const totalW = kartSelectTabs.length * tabW + (kartSelectTabs.length - 1) * tabGap;
  for (let i = 0; i < kartSelectTabs.length; i++) {
    const x = W / 2 - totalW / 2 + i * (tabW + tabGap);
    const active = i === kartSelectTab;
    fillRR(x, tabY, tabW, 28, 8, active ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.06)');
    hud(kartSelectTabs[i], x + tabW / 2, tabY + 18, active ? UI.gold : UI.dim, port ? 10 : 12, 'center');
  }
  const ph = port ? 300 : 340;
  const py = port ? 118 : 160;
  uiPanel(W / 2 - (port ? 260 : 300), py, port ? 520 : 600, ph, 18);
  const st = kartPlayerStats();
  const ch = CHARACTERS[kartSelectDriver] || CHARACTERS[0];
  const cy = port ? 230 : 300;
  if (kartSelectTab === 0) {
    ctx.save();
    ctx.translate(W / 2, cy);
    ctx.scale(port ? 1.6 : 2.2, port ? 1.6 : 2.2);
    ch.draw({ facing: 1, power: null, invTimer: 0, shieldTimer: 0 }, -PLAYER_W / 2, -PLAYER_H / 2);
    ctx.restore();
    uiTitle(ch.name, port ? 200 : 250, port ? 32 : 44, UI.gold);
    hud(ch.desc, W / 2, port ? 310 : 400, UI.bright, port ? 14 : 16, 'center');
    hud('Clase: ' + st.archetype, W / 2, port ? 332 : 425, st.archeColor, port ? 13 : 15, 'center');
  } else if (kartSelectTab === 1) {
    const p = KART_CHASSIS[kartSelectChassis];
    uiTitle(p.name, port ? 200 : 250, port ? 36 : 48, UI.gold);
    hud('Acel: ' + Math.round(p.accel * 100) + '% · Vel: ' + Math.round(p.topSpeed * 100) + '%', W / 2, port ? 300 : 380, UI.cyan, port ? 13 : 15, 'center');
  } else if (kartSelectTab === 2) {
    const p = KART_WHEELS[kartSelectWheels];
    uiTitle(p.name, port ? 200 : 250, port ? 36 : 48, UI.gold);
    hud('Agarre: ' + Math.round(p.grip * 100) + '% · Acel: ' + Math.round(p.accel * 100) + '%', W / 2, port ? 300 : 380, UI.cyan, port ? 13 : 15, 'center');
  } else {
    const p = KART_GLIDERS[kartSelectGlider];
    uiTitle(p.name, port ? 200 : 250, port ? 36 : 48, UI.gold);
    hud('Vel: ' + Math.round(p.topSpeed * 100) + '% · Manejo: ' + Math.round(p.handling * 100) + '%', W / 2, port ? 300 : 380, UI.cyan, port ? 13 : 15, 'center');
  }
  hud('Acel ' + Math.round(st.accel * 100) + '% · Vel ' + Math.round(st.topSpeed * 100) + '% · Peso ' + Math.round(st.weight * 100) + '%',
    W / 2, port ? 380 : 460, UI.dim, port ? 12 : 14, 'center');
  uiFooter(port ? '◀▶ pestañas · ▲▼ elegir · OK confirmar' : '←→ pestañas · ↑↓ elegir · Enter confirmar · Esc volver');
}

function updateKartCup(dt) {
  mobBindSwipe(dir => {
    if (dir === 'up') kartCupSel = (kartCupSel - 1 + KART_CUPS.length) % KART_CUPS.length;
    if (dir === 'down') kartCupSel = (kartCupSel + 1) % KART_CUPS.length;
  });
  if (pressed('ArrowUp') || pressed('KeyW')) { kartCupSel = (kartCupSel - 1 + KART_CUPS.length) % KART_CUPS.length; sfx.select(); }
  if (pressed('ArrowDown') || pressed('KeyS')) { kartCupSel = (kartCupSel + 1) % KART_CUPS.length; sfx.select(); }
  if (pressed('Escape')) changeScene('kartmenu');
  if (pressed('Enter') || pressed('Space')) {
    sfx.select();
    kartRaceMode = 'cup';
    kartSelectDriver = gs.character;
    changeScene('kartselect');
  }
}
function drawKartCup(t) {
  if (document.body.classList.contains('mob-menu-html')) {
    if (!document.body.classList.contains('three-menu')) uiBgGrad('#180828', '#301848');
    return;
  }
  if (!document.body.classList.contains('three-menu')) uiBgGrad('#180828', '#301848');
  uiSparkles(t * 0.5, 20);
  const port = mobTouchPortrait();
  uiTitle('MODO COPA', port ? 48 : 80, port ? 30 : 44);
  if (!port) hud('3 carreras · Puntos estilo Mario Kart (15-12-10-8-6-4-2-1)', W / 2, 130, UI.cyan, 16, 'center');
  const rowH = port ? 62 : 90;
  const startY = port ? 100 : 200;
  for (let i = 0; i < KART_CUPS.length; i++) {
    const cup = KART_CUPS[i];
    const y = startY + i * rowH;
    const sel = i === kartCupSel;
    uiPanel(W / 2 - (port ? 250 : 280), y - (port ? 24 : 30), port ? 500 : 560, port ? 54 : 72, 14);
    ctx.font = 'bold ' + (port ? 20 : 26) + 'px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = sel ? UI.gold : UI.bright;
    ctx.fillText(cup.icon + '  ' + cup.name, W / 2 - (port ? 220 : 250), y + (port ? 6 : 10));
    if (!port) {
      const names = cup.tracks.map(ti => KART_TRACKS[ti].name).join(' · ');
      ctx.font = '13px monospace';
      ctx.fillStyle = UI.dim;
      ctx.fillText(names, W / 2 - 250, y + 32);
    }
  }
  uiFooter(port ? '▲▼ elegir · OK confirmar' : 'Enter elegir copa · Esc volver');
}

function updateKartCupResults(dt) {
  kartResultsT += dt;
  if (pressed('Enter') || pressed('Space') || pressed('Escape')) {
    kartCupState = null;
    race = null;
    changeScene('kartmenu');
  }
}
function drawKartCupResults() {
  uiBgGrad('#0a1420', '#1a2840');
  uiTitle('RESULTADOS COPA', 70, 40);
  if (!kartCupState) { uiFooter('Enter volver'); return; }
  const cup = kartCupState.cup;
  hud(cup.icon + ' ' + cup.name, W / 2, 115, cup.color, 22, 'center');
  uiPanel(W / 2 - 320, 140, 640, 400, 18);
  const sorted = [...kartCupState.standings].sort((a, b) => b.points - a.points);
  sorted.forEach((s, i) => {
    const y = 185 + i * 42;
    const medal = i === 0 ? '🏆' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = i === 0 ? UI.gold : UI.bright;
    ctx.fillText(medal + '  ' + s.name, W / 2 - 280, y);
    ctx.font = '20px monospace';
    ctx.fillStyle = UI.cyan;
    ctx.textAlign = 'right';
    ctx.fillText(s.points + ' pts', W / 2 + 260, y);
  });
  const winner = sorted[0];
  if (winner) hud('Campeón: ' + winner.name + '!', W / 2, 560, UI.gold, 26, 'center');
  uiFooter('Enter / Esc volver al menú');
}
