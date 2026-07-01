// ── Kart Racing (Need for Speed / Gran Turismo road circuits) ────────────────
const KART_LAPS = 3;
const KART_MAX_SPEED = 580;
const KART_ACCEL = 820;
const KART_BRAKE = 1000;
const KART_FRICTION = 260;
const KART_TURN = 3.6;
const KART_DRIFT_BOOST = 230;
const KART_DRIFT_SUPER = 320;

function kartTrackLaps(tr) { return tr.laps || KART_LAPS; }

const KART_TRACKS = [
  {
    name: 'AUTOPISTA COSTA',
    bg: ['#1a4080', '#70b8f0'],
    grass: ['#2a5820', '#3a9030'],
    asphalt: ['#4a4e56', '#626870'],
    kerb: ['#e03030', '#f0f0f0'],
    accent: '#5ee0ff',
    decor: 'palm',
    roadWidth: 108,
    surfaces: [{ uStart: 0.08, uEnd: 0.16, type: 'water' }, { uStart: 0.48, uEnd: 0.54, type: 'water' }],
    obstacleSpots: [{ u: 0.22, kind: 'rock' }, { u: 0.55, kind: 'crab' }, { u: 0.78, kind: 'rock' }],
    shortcuts: [{
      width: 76,
      path: [
        { x: 740, y: 370 }, { x: 820, y: 430 }, { x: 900, y: 400 }, { x: 960, y: 330 },
      ],
    }],
    path: [
      { x: 160, y: 520 }, { x: 320, y: 450 }, { x: 520, y: 400 }, { x: 740, y: 370 },
      { x: 960, y: 330 }, { x: 1120, y: 240 }, { x: 1080, y: 110 }, { x: 880, y: 70 },
      { x: 640, y: 90 }, { x: 420, y: 150 }, { x: 260, y: 260 }, { x: 150, y: 400 },
    ],
  },
  {
    name: 'PASO MONTAÑA',
    bg: ['#1a2838', '#4a6888'],
    grass: ['#2a4028', '#4a6838'],
    asphalt: ['#484c54', '#5e646c'],
    kerb: ['#ff8020', '#ffcc40'],
    accent: '#ffb060',
    decor: 'rock',
    roadWidth: 96,
    surfaces: [{ uStart: 0.72, uEnd: 0.82, type: 'offroad' }],
    obstacleSpots: [{ u: 0.3, kind: 'rock' }, { u: 0.65, kind: 'crab' }],
    path: [
      { x: 140, y: 380 }, { x: 260, y: 290 }, { x: 420, y: 200 }, { x: 620, y: 170 },
      { x: 820, y: 210 }, { x: 1000, y: 310 }, { x: 1100, y: 440 }, { x: 1040, y: 560 },
      { x: 880, y: 640 }, { x: 680, y: 660 }, { x: 460, y: 600 }, { x: 280, y: 500 },
    ],
  },
  {
    name: 'CIRCUITO URBANO',
    bg: ['#181828', '#383858'],
    grass: ['#1a2820', '#2a3828'],
    asphalt: ['#505460', '#686e78'],
    kerb: ['#3080ff', '#ffffff'],
    accent: '#80b0ff',
    decor: 'city',
    roadWidth: 92,
    obstacleSpots: [{ u: 0.4, kind: 'crab' }, { u: 0.7, kind: 'rock' }],
    path: [
      { x: 200, y: 600 }, { x: 440, y: 570 }, { x: 680, y: 510 }, { x: 920, y: 430 },
      { x: 1080, y: 300 }, { x: 1060, y: 170 }, { x: 900, y: 110 }, { x: 700, y: 140 },
      { x: 520, y: 240 }, { x: 400, y: 380 }, { x: 420, y: 500 }, { x: 300, y: 570 },
    ],
  },
  {
    name: 'GRAN CIRCUITO GT',
    bg: ['#081420', '#203048'],
    grass: ['#142818', '#243820'],
    asphalt: ['#383c44', '#4c5058'],
    kerb: ['#d01818', '#ececec'],
    accent: '#ff3838',
    decor: 'grandstand',
    roadWidth: 126,
    laps: 2,
    huge: true,
    path: [
      { x: 500, y: 2200 }, { x: 1100, y: 2150 }, { x: 1900, y: 2050 }, { x: 2700, y: 1880 },
      { x: 3400, y: 1620 }, { x: 3900, y: 1250 }, { x: 4100, y: 800 }, { x: 3950, y: 400 },
      { x: 3500, y: 200 }, { x: 2900, y: 280 }, { x: 2400, y: 550 }, { x: 2100, y: 900 },
      { x: 1850, y: 1250 }, { x: 1550, y: 1550 }, { x: 1150, y: 1750 }, { x: 700, y: 1780 },
      { x: 350, y: 1650 }, { x: 150, y: 1350 }, { x: 100, y: 1000 }, { x: 200, y: 650 },
      { x: 450, y: 350 }, { x: 750, y: 180 }, { x: 1100, y: 120 }, { x: 1500, y: 200 },
      { x: 1900, y: 400 }, { x: 2200, y: 700 }, { x: 2400, y: 1050 }, { x: 2550, y: 1400 },
      { x: 2700, y: 1750 }, { x: 2900, y: 2050 }, { x: 3100, y: 2350 }, { x: 3200, y: 2700 },
      { x: 3000, y: 3050 }, { x: 2600, y: 3300 }, { x: 2100, y: 3400 }, { x: 1600, y: 3280 },
      { x: 1100, y: 3000 }, { x: 700, y: 2650 }, { x: 450, y: 2400 },
    ],
  },
  {
    name: 'NEBULA ANTIGRAV',
    bg: ['#0a0828', '#281858'],
    grass: ['#180830', '#281050'],
    asphalt: ['#383050', '#504068'],
    kerb: ['#c040ff', '#80e0ff'],
    accent: '#d080ff',
    decor: 'city',
    roadWidth: 100,
    surfaces: [
      { uStart: 0.22, uEnd: 0.40, type: 'antigrav' },
      { uStart: 0.62, uEnd: 0.78, type: 'antigrav' },
    ],
    jumpRamps: [{ u: 0.10, power: 190 }, { u: 0.50, power: 250 }, { u: 0.88, power: 170 }],
    obstacleSpots: [{ u: 0.35, kind: 'rock' }, { u: 0.72, kind: 'crab' }],
    path: [
      { x: 180, y: 520 }, { x: 380, y: 440 }, { x: 600, y: 360 }, { x: 820, y: 300 },
      { x: 1020, y: 280 }, { x: 1100, y: 420 }, { x: 1000, y: 560 }, { x: 820, y: 620 },
      { x: 600, y: 580 }, { x: 400, y: 500 }, { x: 280, y: 400 }, { x: 200, y: 480 },
    ],
  },
].map(kartLayoutTrack);

// ── Spline path helpers ──────────────────────────────────────────────────────
function kartPathCatmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return {
    x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}
function kartPathSample(tr, u) {
  const pts = tr.path, n = pts.length;
  const f = ((u % 1) + 1) % 1 * n;
  const i = Math.floor(f) % n;
  const t = f - Math.floor(f);
  return kartPathCatmull(pts[(i - 1 + n) % n], pts[i], pts[(i + 1) % n], pts[(i + 2) % n], t);
}
function kartPathTangent(tr, u, eps) {
  eps = eps || 0.003;
  const a = kartPathSample(tr, u);
  const b = kartPathSample(tr, u + eps);
  return { x: a.x, y: a.y, angle: Math.atan2(b.y - a.y, b.x - a.x) };
}
function kartPathLength(tr, segs) {
  segs = segs || 80;
  let len = 0, prev = kartPathSample(tr, 0);
  for (let i = 1; i <= segs; i++) {
    const p = kartPathSample(tr, i / segs);
    len += Math.hypot(p.x - prev.x, p.y - prev.y);
    prev = p;
  }
  return len;
}
function kartNearestPath(tr, x, y, samples) {
  samples = samples || (tr.huge ? 140 : 64);
  let best = { dist: 1e9, u: 0, x: tr.cx, y: tr.cy, angle: 0 };
  for (let i = 0; i <= samples; i++) {
    const u = i / samples;
    const p = kartPathSample(tr, u);
    const d = Math.hypot(x - p.x, y - p.y);
    if (d < best.dist) {
      const tg = kartPathTangent(tr, u);
      best = { dist: d, u, x: p.x, y: p.y, angle: tg.angle };
    }
  }
  return best;
}
function kartLayoutTrack(tr) {
  let cx = 0, cy = 0;
  for (const p of tr.path) { cx += p.x; cy += p.y; }
  tr.cx = cx / tr.path.length;
  tr.cy = cy / tr.path.length;
  const cpCount = tr.huge ? 12 : 4;
  tr.cpCount = cpCount;
  tr.checkpoints = [];
  for (let i = 0; i < cpCount; i++) {
    const frac = i / cpCount;
    const tg = kartPathTangent(tr, frac);
    tr.checkpoints.push({ u: frac, x: tg.x, y: tg.y, angle: tg.angle });
  }
  const st = kartPathTangent(tr, 0.004);
  const nx = -Math.sin(st.angle) * 26, ny = Math.cos(st.angle) * 26;
  const cols = [-78, -26, 26, 78], rows = [-44, 44];
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
  const itemUs = tr.huge
    ? [0.07, 0.14, 0.22, 0.30, 0.38, 0.46, 0.54, 0.62, 0.70, 0.78, 0.86, 0.93]
    : [0.14, 0.36, 0.58, 0.80];
  tr.items = itemUs.map(u => {
    const p = kartPathSample(tr, u);
    return { x: p.x, y: p.y, taken: false };
  });
  tr.length = kartPathLength(tr, tr.huge ? 160 : 80);
  return tr;
}
function kartCpRadius(tr) {
  return Math.max(72, (tr.roadWidth || 100) * (tr.huge ? 0.85 : 0.75));
}
function kartTrackBounds(tr) {
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const p of tr.path) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  const pad = tr.huge ? 200 : 80;
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}

let race = null;
let kartTrackSel = 0;
let kartLobbySel = 0;
let kartMenuSel = 0;
let kartResultsT = 0;

function kartToScreen(x, y, mini) {
  if (mini) {
    const s = mini.scale || 0.35;
    return { x: mini.px + (x - mini.tx) * s, y: mini.py + (y - mini.ty) * s };
  }
  let dx = x - race.camX, dy = y - race.camY;
  const ca = race.camAngle || 0;
  const zoom = race.camZoom || 1;
  if (ca) {
    const c = Math.cos(-ca) * zoom, sn = Math.sin(-ca) * zoom;
    return { x: dx * c - dy * sn + W / 2, y: dx * sn + dy * c + H / 2 };
  }
  return { x: dx * zoom + W / 2, y: dy * zoom + H / 2 };
}
function kartRoadHalf(tr, mini) {
  return (tr.roadWidth || 100) * (mini ? (mini.scale || 0.35) : 1) * 0.5;
}
function kartGrip(tr, x, y, angle) {
  const near = kartNearestOnAnyPath(tr, x, y);
  const half = (near.onShortcut ? (near.shortcut.width || 76) : tr.roadWidth) * 0.5;
  const lane = near.dist;
  if (angle !== undefined) {
    const diff = Math.abs(kartAngleDiff(near.angle, angle));
    if (diff < 0.35 && lane < half * 0.6) return 1.08;
  }
  if (near.onShortcut) {
    if (lane < half * 0.4) return 1.02;
    if (lane < half * 0.75) return 0.7;
    return 0.35;
  }
  if (lane < half * 0.35) return 1;
  if (lane < half * 0.7) return 0.9;
  if (lane < half) return 0.75;
  return 0.48;
}
function kartAngleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
function kartDrawRoadRibbon(tr, t, mini) {
  const segs = mini ? 48 : (tr.huge ? 220 : 120);
  const hw = kartRoadHalf(tr, mini);
  const left = [], right = [];
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const p = kartPathSample(tr, u);
    const tg = kartPathTangent(tr, u);
    const nx = -Math.sin(tg.angle), ny = Math.cos(tg.angle);
    left.push(kartToScreen(p.x + nx * hw, p.y + ny * hw, mini));
    right.push(kartToScreen(p.x - nx * hw, p.y - ny * hw, mini));
  }
  ctx.fillStyle = tr.grass[0];
  if (!mini) ctx.fillRect(0, 0, W, H);
  else {
    const b = kartRoadBounds(left, right);
    fillRR(b.x - 20, b.y - 20, b.w + 40, b.h + 40, 12, tr.grass[0]);
  }
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  const mid = kartToScreen(tr.cx, tr.cy, mini);
  const ag = ctx.createRadialGradient(mid.x, mid.y, 10, mid.x, mid.y, mini ? 120 : 600);
  ag.addColorStop(0, tr.asphalt[1]); ag.addColorStop(1, tr.asphalt[0]);
  ctx.fillStyle = ag;
  ctx.fill();
  kartDrawRoadKerbs(left, right, tr, mini);
  ctx.setLineDash(mini ? [6, 8] : [14, 16]);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = mini ? 1.5 : 2.5;
  ctx.beginPath();
  for (let i = 0; i <= segs; i++) {
    const u = i / segs;
    const p = kartPathSample(tr, u);
    const sp = kartToScreen(p.x, p.y, mini);
    if (i === 0) ctx.moveTo(sp.x, sp.y); else ctx.lineTo(sp.x, sp.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  if (!mini) {
    const chevN = tr.huge ? 36 : 20;
    for (let i = 0; i < chevN; i++) {
      const u = ((i / chevN) + t * (tr.huge ? 0.25 : 0.4)) % 1;
      const p = kartPathSample(tr, u);
      const tg = kartPathTangent(tr, u);
      const sp = kartToScreen(p.x, p.y, mini);
      const sp2 = kartToScreen(p.x + Math.cos(tg.angle) * 18, p.y + Math.sin(tg.angle) * 18, mini);
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(sp2.x, sp2.y);
      ctx.lineTo(sp.x - Math.sin(tg.angle) * 5, sp.y + Math.cos(tg.angle) * 5);
      ctx.lineTo(sp.x + Math.sin(tg.angle) * 5, sp.y - Math.cos(tg.angle) * 5);
      ctx.closePath(); ctx.fill();
    }
  }
}
function kartRoadBounds(left, right) {
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const p of left.concat(right)) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}
function kartDrawRoadKerbs(left, right, tr, mini) {
  const w = mini ? 3 : Math.max(5, tr.roadWidth * 0.07);
  for (let side = 0; side < 2; side++) {
    const pts = side ? right : left;
    for (let i = 0; i < pts.length - 1; i++) {
      ctx.strokeStyle = (i % 3 < 2) ? tr.kerb[side ? 1 : 0] : tr.kerb[side ? 0 : 1];
      ctx.lineWidth = w;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }
  }
}
function kartDrawTrackDecor(tr, t, mini) {
  const n = mini ? (tr.huge ? 16 : 12) : (tr.huge ? 56 : 28);
  const hw = (tr.roadWidth || 100) * 0.5 + (mini ? 18 : 50);
  for (let i = 0; i < n; i++) {
    const u = (i / n + t * 0.02) % 1;
    const p = kartPathSample(tr, u);
    const tg = kartPathTangent(tr, u);
    const side = (i % 2) ? 1 : -1;
    const off = hw + (i % 4) * (mini ? 8 : (tr.huge ? 28 : 22));
    const px = p.x + Math.cos(tg.angle + Math.PI / 2 * side) * off;
    const py = p.y + Math.sin(tg.angle + Math.PI / 2 * side) * off;
    const sp = kartToScreen(px, py, mini);
    if (tr.decor === 'palm') {
      ctx.fillStyle = '#6a4020';
      ctx.fillRect(sp.x - 2, sp.y, 4, mini ? 10 : 18);
      ctx.fillStyle = '#2a8830';
      ctx.beginPath(); ctx.arc(sp.x, sp.y - (mini ? 6 : 12), mini ? 8 : 16, 0, Math.PI * 2); ctx.fill();
    } else if (tr.decor === 'rock') {
      ctx.fillStyle = '#5a5a68';
      ctx.beginPath(); ctx.arc(sp.x, sp.y, mini ? 7 : 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#787888';
      ctx.beginPath(); ctx.arc(sp.x - 3, sp.y - 3, mini ? 4 : 8, 0, Math.PI * 2); ctx.fill();
    } else if (tr.decor === 'grandstand') {
      const bw = mini ? 14 : 28, bh = mini ? 10 : 20;
      ctx.fillStyle = '#404858';
      fillRR(sp.x - bw / 2, sp.y - bh / 2, bw, bh, 2, ctx.fillStyle);
      ctx.fillStyle = 'rgba(220,230,255,0.45)';
      for (let r = 0; r < 4; r++) ctx.fillRect(sp.x - bw / 2 + 2, sp.y - bh / 2 + 2 + r * (bh / 4), bw - 4, 2);
      if (!mini && i % 5 === 0) {
        ctx.fillStyle = tr.accent;
        ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
        ctx.fillText('GT', sp.x, sp.y - bh / 2 - 4);
      }
    } else {
      ctx.fillStyle = 'rgba(80,90,120,0.85)';
      fillRR(sp.x - (mini ? 5 : 10), sp.y - (mini ? 12 : 24), mini ? 10 : 20, mini ? 24 : 48, 3, ctx.fillStyle);
      ctx.fillStyle = 'rgba(255,220,100,0.5)';
      for (let w = 0; w < 3; w++) ctx.fillRect(sp.x - 4 + w * 4, sp.y - (mini ? 8 : 16), 2, mini ? 4 : 8);
    }
  }
}
function kartDrawStartLine(tr, t) {
  const st = tr.starts[0];
  const tg = kartPathTangent(tr, 0.008);
  const nx = -Math.sin(tg.angle), ny = Math.cos(tg.angle);
  const hw = tr.roadWidth * 0.42;
  const bob = Math.sin(t * 8) * 2;
  for (let i = 0; i < 10; i++) {
    const along = (i - 4.5) * 10;
    const wx = st.x + Math.cos(tg.angle) * along + nx * hw;
    const wy = st.y + Math.sin(tg.angle) * along + ny * hw;
    const s = kartToScreen(wx, wy);
    ctx.save();
    ctx.translate(s.x, s.y + bob);
    ctx.rotate(tg.angle);
    ctx.fillStyle = (Math.floor(i / 2) % 2) ? '#111' : '#fff';
    ctx.fillRect(-5, -20, 10, 40);
    ctx.restore();
  }
  const ms = kartToScreen(st.x, st.y - 30);
  ctx.fillStyle = tr.accent; ctx.font = 'bold 14px monospace'; ctx.textAlign = 'center';
  ctx.fillText('META', ms.x, ms.y + bob);
}
function kartDrawCheckpoints(tr) {
  const cps = tr.checkpoints || [];
  for (let i = 0; i < cps.length; i++) {
    if (tr.huge && i !== 0) continue;
    const cp = cps[i];
    const p = kartToScreen(cp.x, cp.y);
    const isFinish = i === 0;
    if (!tr.huge) {
      ctx.fillStyle = isFinish ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.12)';
      fillRR(p.x - 22, p.y - 14, 44, 28, 6, ctx.fillStyle);
      strokeRR(p.x - 22, p.y - 14, 44, 28, 6, isFinish ? UI.gold : 'rgba(255,255,255,0.35)', isFinish ? 2 : 1);
    }
    ctx.fillStyle = isFinish ? UI.gold : UI.bright;
    ctx.font = 'bold ' + (tr.huge ? 16 : 13) + 'px monospace'; ctx.textAlign = 'center';
    ctx.fillText(isFinish ? 'META' : 'S' + i, p.x, p.y + 5);
  }
}
function kartDrawHugeBg(tr) {
  ctx.fillStyle = tr.grass[0];
  ctx.fillRect(0, 0, W, H);
  const grid = 240;
  const camX = race.camX, camY = race.camY;
  const ca = race.camAngle || 0;
  const c = Math.cos(-ca), sn = Math.sin(-ca);
  const startGX = Math.floor((camX - W) / grid) * grid;
  const startGY = Math.floor((camY - H) / grid) * grid;
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let gx = startGX; gx < camX + W + grid; gx += grid) {
    for (let gy = startGY; gy < camY + H + grid; gy += grid) {
      const dx = gx - camX, dy = gy - camY;
      const sx = dx * c - dy * sn + W / 2;
      const sy = dx * sn + dy * c + H / 2;
      if (sx < -20 || sy < -20 || sx > W + 20 || sy > H + 20) continue;
      ctx.strokeRect(sx, sy, grid * 0.9, grid * 0.9);
    }
  }
}
function kartDrawMiniMap(tr, me, rivals) {
  const mx = W - 138, my = 72, mw = 124, mh = 124;
  fillRR(mx, my, mw, mh, 10, 'rgba(4,8,16,0.82)');
  strokeRR(mx, my, mw, mh, 10, 'rgba(255,255,255,0.22)', 1);
  const b = kartTrackBounds(tr);
  const tcx = (b.minX + b.maxX) / 2, tcy = (b.minY + b.maxY) / 2;
  const sc = Math.min(mw, mh) / Math.max(b.maxX - b.minX, b.maxY - b.minY) * 0.88;
  const ox = mx + mw / 2, oy = my + mh / 2;
  const mapPt = (x, y) => ({ x: ox + (x - tcx) * sc, y: oy + (y - tcy) * sc });
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  const segs = 100;
  for (let i = 0; i <= segs; i++) {
    const p = mapPt(kartPathSample(tr, i / segs));
    if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
  if (rivals) {
    for (const k of rivals) {
      if (k === me) continue;
      const p = mapPt(k.x, k.y);
      ctx.fillStyle = 'rgba(100,160,255,0.9)';
      ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (me) {
    const p = mapPt(me.x, me.y);
    ctx.fillStyle = UI.gold;
    ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.fillStyle = UI.dim; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
  ctx.fillText('MAPA', mx + mw / 2, my + mh + 14);
  if (tr.length) {
    ctx.fillStyle = UI.cyan; ctx.font = '10px monospace';
    ctx.fillText(Math.round(tr.length) + 'm', mx + mw / 2, my - 4);
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
  return tr.checkpoints[i];
}
function kartInTrack(tr, x, y) {
  const near = kartNearestOnAnyPath(tr, x, y);
  const half = (near.onShortcut ? (near.shortcut?.width || 76) : tr.roadWidth) * 0.55;
  return near.dist <= half;
}
function kartPushToTrack(tr, k) {
  const near = kartNearestOnAnyPath(tr, k.x, k.y, tr.huge ? 140 : 80);
  k.x = near.x;
  k.y = near.y;
  k.speed *= 0.45;
  spawnParticles(k.x, k.y, '#ccc', 8, 220);
}
function mkKart(idx, tr, cfg) {
  const st = tr.starts[idx] || tr.starts[0];
  const stats = kartBuildStats(cfg.char, cfg.chassis, cfg.wheels, cfg.glider);
  const k = {
    idx, x: st.x, y: st.y, angle: st.a, speed: 0,
    lap: 0, cp: 0, boost: 0, drift: 0, driftCharge: 0,
    item: null, shieldTimer: 0, stunTimer: 0, starTimer: 0,
    finished: false, finishTime: 0, rank: 0, dnf: false,
    coins: 0,
    char: cfg.char,
    name: cfg.name,
    ai: !!cfg.ai,
    stats,
    slipstream: 0, slipstreamUsed: false,
    startBoostAttempt: false, pendingStartBoost: 0,
    chassis: cfg.chassis || 0, wheels: cfg.wheels || 0, glider: cfg.glider || 0,
    input: { steer: 0, accel: 0, brake: 0, drift: false, useItem: false },
  };
  kartInitJumpState(k);
  return k;
}
function kartBuildRoster(solo) {
  const roster = [];
  if (solo) {
    const pc = kartSelectDriver ?? gs.character;
    roster.push({
      char: pc,
      name: (CHARACTERS[pc] || CHARACTERS[0]).name,
      ai: false,
      chassis: kartSelectChassis || 0,
      wheels: kartSelectWheels || 0,
      glider: kartSelectGlider || 0,
    });
  } else if (mp.role === 'host') {
    const hc = kartSelectDriver ?? gs.character;
    roster.push({
      char: hc,
      name: (CHARACTERS[hc] || CHARACTERS[0]).name,
      ai: false,
      chassis: kartSelectChassis || 0,
      wheels: kartSelectWheels || 0,
      glider: kartSelectGlider || 0,
    });
    if (mp.connected) {
      roster.push({
        char: mp.remoteChar ?? 1,
        name: mp.remoteName || 'RIVAL',
        ai: false,
        chassis: 0, wheels: 0, glider: 0,
      });
    }
  } else if (mp.role === 'guest') {
    roster.push({
      char: mp.remoteChar ?? 0,
      name: mp.remoteName || 'ANFITRION',
      ai: false,
      chassis: 0, wheels: 0, glider: 0,
    });
    roster.push({
      char: gs.character,
      name: (CHARACTERS[gs.character] || CHARACTERS[0]).name,
      ai: false,
      chassis: 0, wheels: 0, glider: 0,
    });
  }
  const playerChar = mp.role === 'guest' ? gs.character : (kartSelectDriver ?? gs.character);
  const rivalChar = mp.connected && !solo
    ? (mp.role === 'guest' ? gs.character : mp.remoteChar)
    : null;
  const cpus = kartCpuRoster(playerChar, rivalChar);
  for (const c of cpus) roster.push({ ...c, ai: true });
  return roster.slice(0, KART_RACER_COUNT);
}
function startKartRace(solo) {
  const tr = KART_TRACKS[kartTrackSel];
  tr.items.forEach(b => { b.taken = false; });
  const roster = kartBuildRoster(solo);
  race = {
    track: tr, solo: !!solo, phase: 'countdown', countdown: 4.5,
    timer: 0, karts: [],
    itemCd: 0, camX: tr.starts[0].x, camY: tr.starts[0].y, camAngle: 0, camZoom: 1, syncAcc: 0,
    boxCooldowns: tr.items.map(() => 0),
    endTimer: 0, leaderName: '',
    cupRace: kartCupState ? kartCupState.raceIdx + 1 : 0,
    cupTotal: kartCupState ? kartCupState.cup.tracks.length : 0,
  };
  for (let i = 0; i < roster.length; i++) race.karts.push(mkKart(i, tr, roster[i]));
  kartInitRaceExtras(tr);
  kartResultsT = 0;
  sfx.select();
}
function kartTryCheckpoint(k, tr) {
  const cpN = tr.checkpoints.length;
  const r = kartCpRadius(tr);
  const want = (k.cp + 1) % cpN;
  const cp = kartCpPos(tr, want);
  if (Math.hypot(k.x - cp.x, k.y - cp.y) >= r) return;
  k.cp = want;
  if (want === 0 && k.lap < kartTrackLaps(tr)) {
    k.lap++;
    spawnText(k.x, k.y - 20, 'VUELTA ' + k.lap, '#ffd700', 18);
    sfx.star();
  } else if (tr.huge && want > 0) {
    spawnText(k.x, k.y - 16, 'S' + want, tr.accent, 14);
  }
}

function kartTryPickupItem(k, tr, dt) {
  if (!race?.boxCooldowns) return;
  for (let bi = 0; bi < tr.items.length; bi++) {
    const box = tr.items[bi];
    if (race.boxCooldowns[bi] > 0) {
      race.boxCooldowns[bi] -= dt;
      if (race.boxCooldowns[bi] <= 0) box.taken = false;
      continue;
    }
    if (box.taken) continue;
    if (Math.hypot(k.x - box.x, k.y - box.y) < 40) {
      box.taken = true;
      k.item = kartRollItem(k);
      race.boxCooldowns[bi] = 8;
      spawnRing(box.x, box.y, KART_ITEMS[k.item]?.color || '#f0f', 40, 0.3);
      spawnText(k.x, k.y - 28, KART_ITEMS[k.item]?.name || 'ITEM', '#fff', 14);
      sfx.coin();
    }
  }
}

function kartCheckRaceEnd(dt) {
  if (!race || race.phase !== 'racing') return;
  const done = race.karts.filter(k => k.finished);
  if (done.length && !race.endTimer) {
    const leader = done.slice().sort((a, b) => a.finishTime - b.finishTime)[0];
    race.endTimer = 28;
    race.leaderName = leader?.name || 'Líder';
    showBanner('META: ' + race.leaderName, '#ffd700');
  }
  if (race.endTimer > 0) {
    race.endTimer -= dt;
    if (race.endTimer <= 0) {
      for (const k of race.karts) {
        if (!k.finished) {
          k.finished = true;
          k.finishTime = race.timer + 999;
          k.dnf = true;
        }
      }
    }
  }
  if (race.karts.every(k => k.finished)) {
    race.phase = 'done';
    if (mp.connected && mp.role === 'host') { kartBroadcastState(); mpHostBroadcast(); }
    kartOnRaceFinished();
  }
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
  const near = kartNearestOnAnyPath(tr, k.x, k.y, tr.huge ? 120 : 72);
  let lookU = near.u + (tr.huge ? 0.025 : 0.06);
  if (!near.onShortcut && tr.shortcuts && Math.random() < 0.012) {
    const sc = tr.shortcuts[0];
    if (sc?.path?.[0]) {
      const dx = sc.path[0].x - k.x, dy = sc.path[0].y - k.y;
      if (Math.hypot(dx, dy) < 120) lookU = near.u;
    }
  }
  if (lookU > 1) lookU -= 1;
  const target = near.onShortcut && near.shortcut
    ? near.shortcut.path[Math.min(near.shortcut.path.length - 1, Math.floor(lookU * near.shortcut.path.length))]
    : kartPathSample(tr, lookU);
  const dx = target.x - k.x, dy = target.y - k.y;
  const want = Math.atan2(dy, dx);
  let diff = kartAngleDiff(want, k.angle);
  k.input.steer = clamp(diff * 2.8, -1, 1);
  const curve = Math.abs(diff);
  const top = tr.huge ? KART_MAX_SPEED * 1.08 : KART_MAX_SPEED;
  const rb = kartRubberBandAI(k, tr);
  k.input.accel = curve > 1.2 ? 0.5 : 1;
  k.input.brake = (curve > 0.85 && k.speed > 300) || k.speed > top * 0.92 ? 0.65 : 0;
  k.input.drift = curve > 0.65 && k.speed > 200;
  k.input.useItem = false;
  k._aiMul = rb;
  kartAIUseItem(k);
}
function kartSimKart(k, dt, tr) {
  if (k.finished) return;
  if (race.phase === 'countdown') {
    if (!k.ai && k.idx === kartLocalIdx()) kartCheckStartBoost(k);
    k.speed = 0;
    return;
  }
  if (k.pendingStartBoost) kartApplyStartBoost(k);
  kartUpdateSlipstream(k, dt);
  if (k.stunTimer > 0) {
    k.stunTimer -= dt;
    k.speed *= 0.92;
    k.x += Math.cos(k.angle) * k.speed * dt;
    k.y += Math.sin(k.angle) * k.speed * dt;
    return;
  }
  if (k.shieldTimer > 0) k.shieldTimer -= dt;
  if (k.starTimer > 0) {
    k.starTimer -= dt;
    k.boost = Math.max(k.boost, 160);
    if (Math.random() < 0.3) spawnParticles(k.x, k.y, '#ffd700', 2, 80);
  }
  const inp = k.input;
  const st = k.stats || kartBuildStats(k.char, k.chassis, k.wheels, k.glider);
  let grip = kartGrip(tr, k.x, k.y, k.angle) * (st.grip || 1);
  const surf = kartSurfaceGripMod(tr, k.x, k.y, grip);
  grip = surf.grip;
  if (surf.label && !k._surfWarn) {
    k._surfWarn = 0.5;
    spawnText(k.x, k.y - 18, surf.label, '#48f', 13);
  }
  if (k._surfWarn > 0) k._surfWarn -= dt;
  let turn = KART_TURN * grip * (st.handling || 1) * (0.4 + 0.6 * Math.min(1, Math.abs(k.speed) / 260));
  if (inp.drift && inp.steer) turn *= 1.4;
  if (inp.steer) k.angle += inp.steer * turn * dt;
  let target = 0;
  const aiMul = k._aiMul || 1;
  const coinMul = 1 + Math.min(0.14, (k.coins || 0) * 0.014);
  const topSpd = (tr.huge ? KART_MAX_SPEED * 1.1 : KART_MAX_SPEED) * (st.topSpeed || 1) * aiMul * (surf.speedMul || 1) * coinMul;
  const maxSpd = topSpd * (0.74 + grip * 0.26);
  if (inp.accel) target = maxSpd + k.boost;
  if (inp.brake) target = -140;
  if (k.boost > 0) { k.boost -= dt * 130; if (k.boost < 0) k.boost = 0; }
  const accel = KART_ACCEL * (st.accel || 1) * (0.7 + grip * 0.3) * (inp.accel ? 1 : 0.85);
  if (k.speed < target) k.speed = Math.min(target, k.speed + accel * dt);
  else k.speed = Math.max(target, k.speed - (inp.brake ? KART_BRAKE : KART_FRICTION * (1.05 - grip * 0.2)) * dt);
  if (inp.drift && inp.steer && Math.abs(k.speed) > 140) {
    k.driftCharge = Math.min(1.15, k.driftCharge + dt * 1.05);
    k.speed *= 0.988;
    if (Math.random() < 0.5) spawnParticles(k.x, k.y, tr.accent || '#ff0', 2, 100);
  } else if (k.driftCharge > 0.45) {
    const charge = Math.min(1, k.driftCharge);
    if (charge > 0.95) {
      k.boost = KART_DRIFT_SUPER;
      spawnText(k.x, k.y - 24, 'SUPER DRIFT!', '#f0f', 16);
      spawnRing(k.x, k.y, '#f0f', 70, 0.4);
      sfx.power();
    } else if (charge > 0.75) {
      k.boost = KART_DRIFT_BOOST * charge * 1.2;
      spawnText(k.x, k.y - 20, 'MINI-TURBO!', '#f80', 14);
      spawnRing(k.x, k.y, '#ff8800', 55, 0.3);
      sfx.djump();
    } else {
      k.boost = KART_DRIFT_BOOST * charge;
      spawnRing(k.x, k.y, '#ff0', 50, 0.25);
      sfx.select();
    }
    k.driftCharge = 0;
  } else {
    k.driftCharge = Math.max(0, k.driftCharge - dt * 2.5);
  }
  k.x += Math.cos(k.angle) * k.speed * dt;
  k.y += Math.sin(k.angle) * k.speed * dt;
  kartUpdateAntigrav(k, tr, dt);
  kartCheckJumpRamps(k, tr);
  kartUpdateJump(k, dt);
  kartResolveCollisions(k, dt);
  if (!kartInTrack(tr, k.x, k.y)) kartPushToTrack(tr, k);
  else if (grip < 0.75 && Math.random() < 0.15) spawnParticles(k.x, k.y, tr.grass[0], 1, 60);
  kartTryCheckpoint(k, tr);
  if (inp.useItem && k.item) kartUseItem(k, tr);
  kartTryPickupItem(k, tr, dt);
  if (k.lap >= kartTrackLaps(tr) && k.cp === 0 && !k.finished) {
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
  score: k.finished ? 10000 - k.finishTime : k.lap * 10000 + k.cp * 100 - race.timer * 0.01,
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
  kartRank();
  kartUpdateObstacles(dt, race.track);
  kartUpdateHazards(dt);
  kartUpdateProjectiles(dt);
  kartUpdateBlueShells(dt);
  const localIdx = kartLocalIdx();
  for (const k of race.karts) {
    if (k.ai) kartAIInput(k, race.track);
    else if (k.idx === localIdx || (race.solo && k.idx === 0)) kartReadInput(k);
    kartSimKart(k, dt, race.track);
  }
  kartRank();
  kartCheckRaceEnd(dt);
}
function kartOnRaceFinished() {
  if (kartCupState && kartRaceMode === 'cup') {
    if (kartCupAdvance()) {
      setTimeout(() => {
        startKartRace(true);
        changeScene('kart', true);
      }, 2200);
    } else {
      setTimeout(() => changeScene('kartcupresults', true), 1200);
    }
  } else {
    setTimeout(() => changeScene('kartresults', true), 1200);
  }
}
function kartGuestApplyState(msg) {
  if (!race) {
    if (typeof msg.tr === 'number') kartTrackSel = msg.tr;
    startKartRace(false);
  }
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
        k.stunTimer = s.st || 0; k.shieldTimer = s.sh || 0;
        k.starTimer = s.stt || 0; k.boost = s.bo || k.boost;
        if (typeof s.co === 'number') k.coins = s.co;
      } else {
        k.tx = s.x; k.ty = s.y; k.ta = s.a; k.ts = s.s;
        k.lap = s.l; k.cp = s.c; k.finished = s.f; k.finishTime = s.ft;
        k.rank = s.r; k.item = s.it;
        k.stunTimer = s.st || 0; k.shieldTimer = s.sh || 0;
        k.starTimer = s.stt || 0;
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
      r: k.rank, it: k.item, st: k.stunTimer || 0, sh: k.shieldTimer || 0,
      stt: k.starTimer || 0, bo: k.boost || 0, co: k.coins || 0,
    })),
  };
  mpSend(msg);
}
function kartTick(dt) {
  if (!race || gs.scene !== 'kart') return;
  if (race.phase === 'countdown') {
    const localIdx = kartLocalIdx();
    const me = race.karts[localIdx];
    if (me && !me.ai) kartReadInput(me);
    if (mp.role === 'guest' && mp.connected) return;
    race.countdown -= dt;
    if (me) kartCheckStartBoost(me);
    if (race.countdown <= 0) {
      race.phase = 'racing';
      race.countdown = 0;
      for (const k of race.karts) kartApplyStartBoost(k);
      showBanner('GO!', '#3f6');
      sfx.win();
    }
    if (mp.role === 'host' && mp.connected) {
      race.syncAcc = (race.syncAcc || 0) + dt;
      if (race.syncAcc >= 0.04) { race.syncAcc = 0; kartBroadcastState(); }
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
      if (race.syncAcc >= 0.04) { race.syncAcc = 0; kartBroadcastState(); }
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
  updateParticles(dt);
  updateFx(dt);
  kartTick(dt);
  if (race.phase === 'racing' || race.phase === 'countdown') {
    const me = race.karts[kartLocalIdx()];
    if (me) {
      const look = me.speed > 80 ? me.angle : kartPathTangent(race.track, kartNearestPath(race.track, me.x, me.y).u).angle;
      const speedT = Math.min(1, Math.abs(me.speed) / KART_MAX_SPEED);
      const lookAhead = 60 + speedT * 55;
      race.camX = lerp(race.camX, me.x - Math.cos(look) * lookAhead, 0.1);
      race.camY = lerp(race.camY, me.y - Math.sin(look) * lookAhead, 0.1);
      let targetA = look - Math.PI / 2;
      const agTilt = kartAntigravCamTilt(me, race.track);
      targetA += agTilt;
      if (me.driftCharge > 0.2 && me.input.steer) {
        targetA -= me.input.steer * Math.min(0.16, me.driftCharge * 0.14);
      }
      let da = kartAngleDiff(targetA, race.camAngle || 0);
      race.camAngle = (race.camAngle || 0) + da * 0.08;
      const speedZoom = 1 - speedT * 0.07;
      const boostPunch = Math.min(0.07, (me.boost || 0) / 2600);
      const zoomTarget = speedZoom + boostPunch;
      race.camZoom = lerp(race.camZoom || 1, zoomTarget, 0.08);
    }
  }
  if (pressed('Escape') || pressed('KeyP')) {
    if (race.solo) { race = null; changeScene('kartmenu'); }
  }
}
function drawKartTrack(tr, t) {
  if (tr.huge) kartDrawHugeBg(tr);
  else {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, tr.bg[1]); grad.addColorStop(1, tr.bg[0]);
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);
  }
  kartDrawTrackDecor(tr, t || 0, false);
  kartDrawRoadRibbon(tr, t || 0, false);
  kartDrawShortcuts(tr, t || 0);
  kartDrawWaterZones(tr, t || 0);
  kartDrawAntigravZones(tr, t || 0);
  kartDrawJumpRamps(tr, t || 0);
  kartDrawObstacles(tr, t || 0);
  kartDrawHazards(tr);
  kartDrawProjectiles(tr);
  kartDrawBlueShells();
  kartDrawStartLine(tr, t || 0);
  kartDrawCheckpoints(tr);
  kartDrawItemBoxes(tr, t || 0);
}
function drawKartEntity(k, tr) {
  const sp = kartToScreen(k.x, k.y);
  const px = sp.x, py = sp.y - (k.z || 0) * 0.4;
  const scale = 1 + Math.min(0.15, (k.z || 0) / 200);
  kartDrawJumpShadow(k, sp.x, sp.y);
  const visAngle = k.angle - (race.camAngle || 0) + (k.antigrav ? Math.PI * 0.12 : 0);
  const col = ['#e33', '#33e', '#3e3', '#ee3', '#e3e', '#3ee', '#f83', '#8af'][k.idx % 8];
  if (k.driftCharge > 0.2 && Math.abs(k.speed) > 120) {
    ctx.fillStyle = tr.accent || '#ff0';
    for (let i = 0; i < 3; i++) {
      const bx = px - Math.cos(visAngle) * (14 + i * 8) + Math.sin(visAngle) * (i - 1) * 6;
      const by = py - Math.sin(visAngle) * (14 + i * 8) - Math.cos(visAngle) * (i - 1) * 6;
      ctx.globalAlpha = 0.35 - i * 0.08;
      ctx.beginPath(); ctx.arc(bx, by, 5 - i, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(scale, scale);
  ctx.rotate(visAngle);
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
  if (k.shieldTimer > 0 || k.starTimer > 0) {
    ctx.strokeStyle = k.starTimer > 0 ? 'rgba(255,215,0,0.85)' : 'rgba(100,200,255,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();
  }
  if (k.antigrav) {
    ctx.strokeStyle = 'rgba(200,120,255,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
  ctx.save();
  ctx.translate(px, py - 22);
  ctx.scale(0.55, 0.55);
  (CHARACTERS[k.char] || CHARACTERS[0]).draw({ facing: 1, power: null, invTimer: 0, shieldTimer: 0 }, -PLAYER_W / 2, -PLAYER_H / 2);
  ctx.restore();
  if (k.item) {
    const meta = KART_ITEMS[k.item] || { name: k.item, icon: '?', color: '#f0f' };
    ctx.fillStyle = meta.color; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';
    ctx.fillText(meta.icon + ' ' + meta.name, px, py - 32);
  }
  if (k.driftCharge > 0.35) {
    const barW = 40;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; fillRR(px - barW / 2, py + 32, barW, 6, 3, ctx.fillStyle);
    const col = k.driftCharge > 0.85 ? '#f0f' : k.driftCharge > 0.6 ? '#f80' : '#ff0';
    fillRR(px - barW / 2, py + 32, barW * Math.min(1, k.driftCharge), 6, 3, col);
  }
  kartDrawSlipstreamBar(k, px, py);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'center';
  ctx.fillText(k.name, px, py + 44);
}
function kartDrawParticles() {
  for (const p of particles) {
    const sp = kartToScreen(p.x, p.y);
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(sp.x, sp.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}
function kartDrawFx() {
  const zoom = race.camZoom || 1;
  for (const e of fx) {
    const a = Math.max(0, e.life / e.max);
    const sp = kartToScreen(e.x, e.y);
    if (e.kind === 'ring') {
      ctx.globalAlpha = a;
      ctx.strokeStyle = e.color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(sp.x, sp.y, e.r * zoom, 0, Math.PI * 2); ctx.stroke();
    } else if (e.kind === 'dust') {
      ctx.globalAlpha = a * 0.7;
      ctx.fillStyle = e.color;
      ctx.fillRect(sp.x, sp.y, e.size, e.size);
    } else if (e.kind === 'text') {
      ctx.globalAlpha = Math.min(1, a * 1.4);
      ctx.fillStyle = e.color; ctx.font = `bold ${e.size}px monospace`; ctx.textAlign = 'center';
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.6)';
      ctx.strokeText(e.text, sp.x, sp.y);
      ctx.fillText(e.text, sp.x, sp.y);
    }
  }
  ctx.globalAlpha = 1;
}
function drawKart(t) {
  if (!race) return;
  const sx = race.camX, sy = race.camY;
  if (shake > 0 && gs.fxShake !== false) {
    const m = Math.min(8, shake * 55);
    race.camX += (Math.random() * 2 - 1) * m;
    race.camY += (Math.random() * 2 - 1) * m;
  }
  drawKartTrack(race.track, t);
  const sorted = [...race.karts].sort((a, b) => a.rank - b.rank || 0);
  for (const k of sorted) drawKartEntity(k, race.track);
  kartDrawParticles();
  kartDrawFx();
  race.camX = sx; race.camY = sy;
  drawFlash();
  fillRR(8, 8, W - 16, 56, 14, 'rgba(8,12,20,0.85)');
  const me = race.karts[kartLocalIdx()];
  const laps = kartTrackLaps(race.track);
  const cpN = race.track.checkpoints.length;
  if (me) {
    hud('VUELTA ' + Math.min(me.lap + 1, laps) + '/' + laps, 24, 38, UI.gold, 20);
    hud((race.track.huge ? 'SECTOR ' : 'CP ') + (me.cp + 1) + '/' + cpN, 24, 58, UI.dim, 14);
    if (me.coins > 0) hud('🪙 ' + me.coins, 24, 78, UI.gold, 14);
    if (me.item) {
      const meta = KART_ITEMS[me.item];
      hud((meta?.icon || '') + ' ' + (meta?.name || me.item), 24, me.coins > 0 ? 98 : 78, meta?.color || UI.cyan, 14);
    }
  }
  if (race.endTimer > 0 && race.phase === 'racing') {
    hud('Fin en ' + Math.ceil(race.endTimer) + 's', W / 2, 82, UI.gold, 18, 'center');
  }
  hud(race.track.name, W / 2, 36, UI.bright, 22, 'center');
  if (race.cupTotal > 0) hud('COPA · Carrera ' + race.cupRace + '/' + race.cupTotal, W / 2, 58, UI.gold, 15, 'center');
  else if (race.track.huge) hud('~' + Math.round(race.track.length || 0) + ' m por vuelta', W / 2, 58, UI.cyan, 14, 'center');
  else if (race.phase === 'racing') hud(race.timer.toFixed(1) + 's', W / 2, 58, UI.cyan, 16, 'center');
  if (race.track.huge && race.phase === 'racing') hud(race.timer.toFixed(1) + 's', W / 2, 76, UI.dim, 13, 'center');
  if (race.phase === 'countdown') kartDrawTrafficLights(t);
  const lbH = Math.min(200, 24 + race.karts.length * 16);
  fillRR(W - 208, 8, 200, lbH, 12, 'rgba(8,12,20,0.85)');
  race.karts.slice().sort((a, b) => a.rank - b.rank).forEach((k, i) => {
    hud((k.rank || i + 1) + '. ' + k.name + (k.finished ? ' ✓' : ''), W - 108, 24 + i * 16, k.idx === kartLocalIdx() ? UI.gold : UI.bright, 12, 'center');
  });
  if (mp.connected) uiPill(W / 2 - 70, H - 36, 'ONLINE 8K', UI.cyan);
  else if (race.solo) uiPill(W / 2 - 65, H - 36, '8 CORREDORES', UI.green);
  if (race.track.huge && me) kartDrawMiniMap(race.track, me, race.karts);
  uiFooter('↑↓ Girar · Espacio=Drift turbo · J=Usar objeto · Esc=Salir');
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
  uiPanel(W / 2 - 300, 110, 600, 420, 20);
  const sorted = [...race.karts].sort((a, b) => a.rank - b.rank);
  sorted.forEach((k, i) => {
    const y = 155 + i * 46;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
    ctx.font = 'bold 22px monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = i === 0 ? UI.gold : UI.bright;
    ctx.fillText(medal + '  ' + k.name, W / 2 - 260, y);
    ctx.font = '16px monospace'; ctx.fillStyle = UI.cyan;
    ctx.fillText('+' + (KART_POINTS[i] || 1) + ' pts', W / 2 + 60, y);
    ctx.font = '16px monospace'; ctx.fillStyle = UI.dim;
    const time = k.dnf ? 'DNF' : (k.finished ? k.finishTime.toFixed(2) + 's' : '—');
    ctx.fillText(time, W / 2 + 160, y);
  });
  const winner = sorted[0];
  if (winner) hud('Ganador: ' + winner.name + '!', W / 2, 560, UI.gold, 24, 'center');
  uiFooter('Enter / Esc para volver');
}

// ── Kart menu / lobby scenes ─────────────────────────────────────────────────
const kartMenuItems = ['COPA KART', 'CARRERA RAPIDA', 'CREAR CARRERA', 'UNIRSE A CARRERA', 'VOLVER'];

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
    if (it === 'COPA KART') { mp.gameMode = 'kart'; kartRaceMode = 'cup'; changeScene('kartcup'); }
    else if (it === 'CARRERA RAPIDA') {
      mp.gameMode = 'kart'; kartRaceMode = 'single';
      kartSelectDriver = gs.character;
      changeScene('kartselect');
    }
    else if (it === 'CREAR CARRERA') {
      mp.gameMode = 'kart'; kartRaceMode = 'online';
      kartSelectDriver = gs.character;
      mpHostCreate(); changeScene('kartselect'); mp.createT = 0;
    }
    else if (it === 'UNIRSE A CARRERA') { mp.gameMode = 'kart'; mp.joinBuf = ''; mp.errMsg = ''; changeScene('kartjoin'); }
    else if (it === 'VOLVER') { mpDisconnect(); changeScene('menu'); }
  }
}
function drawKartMenu(t) {
  uiBgGrad('#1a0830', '#301858'); uiSparkles(t * 0.5, 24);
  const lay = mobMenuLayout(kartMenuItems.length);
  if (lay.mode !== 'desktop') {
    if (document.body.classList.contains('mob-menu-html')) {
      uiBgGrad('#1a0830', '#301858');
      return;
    }
    uiTitle('MARIO KART', lay.mode === 'port' ? 50 : 68, lay.mode === 'port' ? 32 : 44);
    if (lay.mode === 'land') hud('8 corredores · Copa · Drift · Objetos', W / 2, 118, UI.cyan, 14, 'center');
    uiPanel(W / 2 - lay.pw / 2, lay.py, lay.pw, lay.ph, 14);
    for (let i = 0; i < kartMenuItems.length; i++) {
      uiMenuRow(kartMenuItems[i], lay.startY + i * lay.rowH, i === kartMenuSel, lay.rw, lay.rh, i);
    }
    uiFooter('▲▼ · OK confirmar');
  } else {
    uiTitle('MARIO KART', 80, 52);
    hud('8 corredores · Copa · Drift · Objetos · Rebufo · Salida con boost', W / 2, 130, UI.cyan, 16, 'center');
    uiPanel(W / 2 - 240, 155, 480, 340, 18);
    for (let i = 0; i < kartMenuItems.length; i++) uiMenuRow(kartMenuItems[i], 200 + i * 52, i === kartMenuSel, 420, 44, i);
    hud('Personaliza piloto, chasis, ruedas y planeador', W / 2, 520, UI.dim, 15, 'center');
    uiFooter('Enter · Esc volver');
  }
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
  if (mp.joinAttempt > 0 && !mp.connected) hud('Reintentando conexion...', W / 2, 290, UI.cyan, 14, 'center');
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
    if (dir === 'up') kartDifficulty = (kartDifficulty - 1 + KART_DIFFICULTIES.length) % KART_DIFFICULTIES.length;
    if (dir === 'down') kartDifficulty = (kartDifficulty + 1) % KART_DIFFICULTIES.length;
    if (kartTrackSel !== prev) mpHostBroadcast();
  });
  if (pressed('ArrowUp') || pressed('KeyW')) {
    const prev = kartTrackSel;
    kartTrackSel = (kartTrackSel - 1 + KART_TRACKS.length) % KART_TRACKS.length;
    if (kartTrackSel !== prev) { sfx.select(); mpHostBroadcast(); }
  }
  if (pressed('ArrowDown') || pressed('KeyS')) {
    const prev = kartTrackSel;
    kartTrackSel = (kartTrackSel + 1 + KART_TRACKS.length) % KART_TRACKS.length;
    if (kartTrackSel !== prev) { sfx.select(); mpHostBroadcast(); }
  }
  if (pressed('ArrowLeft') || pressed('KeyA')) {
    kartDifficulty = (kartDifficulty - 1 + KART_DIFFICULTIES.length) % KART_DIFFICULTIES.length;
    sfx.select();
  }
  if (pressed('ArrowRight') || pressed('KeyD')) {
    kartDifficulty = (kartDifficulty + 1) % KART_DIFFICULTIES.length;
    sfx.select();
  }
  if (pressed('Enter') || pressed('Space')) {
    if (mp.role === 'guest') return;
    if (mp.connected) {
      startKartRace(false);
      changeScene('kart', true);
    } else {
      kartRaceMode = kartRaceMode || 'single';
      startKartRace(true);
      changeScene('kart', true);
    }
  }
  if (pressed('Escape')) { mpDisconnect(); changeScene('kartmenu'); }
}
function drawKartLobby(t) {
  if (document.body.classList.contains('mob-menu-html')) {
    uiBgGrad('#1a0830', '#301858');
    return;
  }
  const tr = KART_TRACKS[kartTrackSel];
  uiBgGrad(tr.bg[0], tr.bg[1]); uiSparkles(t * 0.3, 16);
  uiTitle('PISTA DE CARRERA', 70, 40);
  uiPanel(W / 2 - 320, 110, 640, 420, 20);
  hud('PISTA', W / 2, 150, UI.dim, 16, 'center');
  uiTitle(tr.name, 200, 48, UI.gold);
  const cx = W / 2, cy = 330;
  const b = kartTrackBounds(tr);
  const span = Math.max(b.maxX - b.minX, b.maxY - b.minY);
  const miniScale = tr.huge ? Math.min(0.2, 100 / span) : 0.38;
  const mini = { px: cx, py: cy, tx: tr.cx, ty: tr.cy, scale: miniScale };
  kartDrawTrackDecor(tr, t * 0.6, mini);
  kartDrawRoadRibbon(tr, t, mini);
  const decor = tr.huge ? 'Pista enorme · ' + Math.round(tr.length || 0) + ' m · 2 vueltas'
    : tr.surfaces?.some(s => s.type === 'antigrav') ? 'Antigravedad · Saltos · Nebulosa'
    : tr.decor === 'palm' ? 'Costa · Rectas rapidas · Agua'
    : tr.decor === 'rock' ? 'Montaña · Curvas cerradas' : 'Urbano · Tecnica pura';
  hud(decor, W / 2, 430, tr.accent, 15, 'center');
  hud('Dificultad IA: ' + kartDiff().name, W / 2, 455, UI.cyan, 15, 'center');
  ctx.fillStyle = UI.dim; ctx.font = '16px monospace'; ctx.textAlign = 'center';
  ctx.fillText('↑↓ pista · ←→ dificultad', W / 2, 480);
  if (mp.role === 'guest') {
    hud('Esperando al anfitrion...', W / 2, 500, UI.cyan, 20, 'center');
    hud('Pista: ' + tr.name, W / 2, 530, UI.bright, 18, 'center');
  } else {
    hud(mp.connected ? 'Rival listo — Enter para INICIAR' : 'Sin rival — Enter para jugar vs CPU', W / 2, 500, mp.connected ? UI.green : UI.dim, 18, 'center');
  }
  uiFooter('Enter=Iniciar carrera · Esc=Salir');
}
