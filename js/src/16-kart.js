// ── Kart Racing (Need for Speed / Gran Turismo road circuits) ────────────────
const KART_LAPS = 3;
const KART_MAX_SPEED = 580;
const KART_ACCEL = 980;
const KART_BRAKE = 900;
const KART_FRICTION = 210;
const KART_TURN = 4.8;
const KART_DRIFT_BOOST = 255;
const KART_DRIFT_SUPER = 340;

function kartTrackLaps(tr) { return tr.laps || KART_LAPS; }

const KART_TRACK_SCALE = 3;

function kartScalePath(path, s) {
  return path.map(p => ({ x: Math.round(p.x * s), y: Math.round(p.y * s) }));
}
function kartApplyTrackScale(tr) {
  const s = tr.scale || 1;
  if (s === 1) return;
  tr.path = kartScalePath(tr.path, s);
  if (tr.shortcuts) {
    tr.shortcuts = tr.shortcuts.map(sc => ({
      width: Math.round((sc.width || 76) * s),
      path: kartScalePath(sc.path, s),
    }));
  }
  delete tr.scale;
}
function kartTrackTier(tr) {
  if (tr.mega) return 'mega';
  if (tr.huge) return 'huge';
  return 'normal';
}
function kartTrackSamples(tr) {
  const tier = kartTrackTier(tr);
  return tier === 'mega' ? 220 : tier === 'huge' ? 140 : 64;
}
function kartTrackSegs(tr, mini) {
  if (mini) return kartTrackTier(tr) === 'mega' ? 64 : 48;
  const tier = kartTrackTier(tr);
  return tier === 'mega' ? 360 : tier === 'huge' ? 220 : 120;
}
function kartTrackSpeedMul(tr) {
  const tier = kartTrackTier(tr);
  return tier === 'mega' ? 1.18 : tier === 'huge' ? 1.1 : 1;
}

const KART_TRACKS = [
  {
    name: 'AUTOPISTA COSTA',
    bg: ['#1a4080', '#70b8f0'],
    grass: ['#2a5820', '#3a9030'],
    asphalt: ['#4a4e56', '#626870'],
    kerb: ['#e03030', '#f0f0f0'],
    accent: '#5ee0ff',
    decor: 'palm',
    scale: KART_TRACK_SCALE,
    roadWidth: 178,
    surfaces: [
      { uStart: 0.06, uEnd: 0.14, type: 'water' },
      { uStart: 0.44, uEnd: 0.52, type: 'water' },
      { uStart: 0.72, uEnd: 0.78, type: 'offroad' },
    ],
    obstacleSpots: [
      { u: 0.18, kind: 'crab' }, { u: 0.35, kind: 'rock' },
      { u: 0.52, kind: 'crab' }, { u: 0.68, kind: 'rock' }, { u: 0.85, kind: 'crab' },
    ],
    boostPads: [
      { u: 0.12, power: 115 }, { u: 0.28, power: 120 }, { u: 0.45, power: 125 },
      { u: 0.62, power: 118 }, { u: 0.78, power: 122 },
    ],
    jumpRamps: [{ u: 0.58, power: 185 }],
    shortcuts: [
      {
        width: 82,
        path: [
          { x: 740, y: 370 }, { x: 820, y: 430 }, { x: 900, y: 400 }, { x: 960, y: 330 },
        ],
      },
      {
        width: 68,
        path: [
          { x: 420, y: 150 }, { x: 480, y: 220 }, { x: 520, y: 300 }, { x: 480, y: 380 },
        ],
      },
    ],
    path: [
      { x: 160, y: 520 }, { x: 240, y: 480 }, { x: 320, y: 450 }, { x: 420, y: 420 },
      { x: 520, y: 400 }, { x: 640, y: 385 }, { x: 740, y: 370 }, { x: 860, y: 350 },
      { x: 960, y: 330 }, { x: 1040, y: 290 }, { x: 1120, y: 240 }, { x: 1100, y: 160 },
      { x: 1080, y: 110 }, { x: 980, y: 80 }, { x: 880, y: 70 }, { x: 760, y: 75 },
      { x: 640, y: 90 }, { x: 520, y: 120 }, { x: 420, y: 150 }, { x: 340, y: 200 },
      { x: 260, y: 260 }, { x: 200, y: 330 }, { x: 150, y: 400 }, { x: 140, y: 460 },
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
    scale: KART_TRACK_SCALE,
    roadWidth: 164,
    surfaces: [
      { uStart: 0.18, uEnd: 0.26, type: 'offroad' },
      { uStart: 0.68, uEnd: 0.78, type: 'offroad' },
    ],
    obstacleSpots: [
      { u: 0.22, kind: 'rock' }, { u: 0.38, kind: 'crab' },
      { u: 0.55, kind: 'rock' }, { u: 0.72, kind: 'crab' }, { u: 0.88, kind: 'rock' },
    ],
    boostPads: [
      { u: 0.10, power: 105 }, { u: 0.32, power: 112 }, { u: 0.55, power: 108 },
      { u: 0.75, power: 115 }, { u: 0.90, power: 102 },
    ],
    jumpRamps: [{ u: 0.48, power: 210 }, { u: 0.82, power: 175 }],
    shortcuts: [{
      width: 72,
      path: [
        { x: 620, y: 170 }, { x: 720, y: 220 }, { x: 780, y: 320 }, { x: 820, y: 210 },
      ],
    }],
    path: [
      { x: 140, y: 380 }, { x: 200, y: 330 }, { x: 260, y: 290 }, { x: 340, y: 240 },
      { x: 420, y: 200 }, { x: 520, y: 175 }, { x: 620, y: 170 }, { x: 720, y: 190 },
      { x: 820, y: 210 }, { x: 920, y: 260 }, { x: 1000, y: 310 }, { x: 1060, y: 380 },
      { x: 1100, y: 440 }, { x: 1080, y: 510 }, { x: 1040, y: 560 }, { x: 960, y: 610 },
      { x: 880, y: 640 }, { x: 780, y: 655 }, { x: 680, y: 660 }, { x: 560, y: 630 },
      { x: 460, y: 600 }, { x: 360, y: 550 }, { x: 280, y: 500 }, { x: 200, y: 440 },
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
    scale: KART_TRACK_SCALE,
    roadWidth: 162,
    surfaces: [{ uStart: 0.32, uEnd: 0.40, type: 'offroad' }],
    obstacleSpots: [
      { u: 0.25, kind: 'crab' }, { u: 0.48, kind: 'rock' },
      { u: 0.62, kind: 'crab' }, { u: 0.82, kind: 'rock' },
    ],
    boostPads: [
      { u: 0.12, power: 108 }, { u: 0.28, power: 118 }, { u: 0.45, power: 122 },
      { u: 0.62, power: 115 }, { u: 0.78, power: 110 }, { u: 0.92, power: 105 },
    ],
    jumpRamps: [{ u: 0.38, power: 195 }, { u: 0.72, power: 180 }],
    shortcuts: [{
      width: 70,
      path: [
        { x: 680, y: 510 }, { x: 760, y: 460 }, { x: 820, y: 400 }, { x: 880, y: 350 },
      ],
    }],
    path: [
      { x: 200, y: 600 }, { x: 320, y: 585 }, { x: 440, y: 570 }, { x: 560, y: 545 },
      { x: 680, y: 510 }, { x: 800, y: 470 }, { x: 920, y: 430 }, { x: 1020, y: 370 },
      { x: 1080, y: 300 }, { x: 1070, y: 230 }, { x: 1060, y: 170 }, { x: 980, y: 130 },
      { x: 900, y: 110 }, { x: 800, y: 125 }, { x: 700, y: 140 }, { x: 600, y: 180 },
      { x: 520, y: 240 }, { x: 460, y: 310 }, { x: 420, y: 380 }, { x: 400, y: 450 },
      { x: 420, y: 500 }, { x: 380, y: 540 }, { x: 300, y: 570 },
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
    scale: 3.5,
    roadWidth: 205,
    laps: 2,
    huge: true,
    boostPads: [
      { u: 0.06, power: 110 }, { u: 0.14, power: 118 }, { u: 0.22, power: 125 },
      { u: 0.30, power: 115 }, { u: 0.38, power: 128 }, { u: 0.46, power: 120 },
      { u: 0.54, power: 130 }, { u: 0.62, power: 122 }, { u: 0.70, power: 125 },
      { u: 0.78, power: 118 }, { u: 0.86, power: 128 }, { u: 0.94, power: 115 },
    ],
    jumpRamps: [{ u: 0.25, power: 200 }, { u: 0.62, power: 215 }],
    shortcuts: [{
      width: 88,
      path: [
        { x: 2400, y: 1050 }, { x: 2550, y: 1200 }, { x: 2650, y: 1400 }, { x: 2700, y: 1750 },
      ],
    }],
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
    scale: KART_TRACK_SCALE,
    roadWidth: 168,
    surfaces: [
      { uStart: 0.18, uEnd: 0.36, type: 'antigrav' },
      { uStart: 0.58, uEnd: 0.76, type: 'antigrav' },
    ],
    jumpRamps: [{ u: 0.08, power: 195 }, { u: 0.45, power: 260 }, { u: 0.82, power: 180 }],
    boostPads: [{ u: 0.24, power: 125 }, { u: 0.52, power: 130 }, { u: 0.78, power: 122 }],
    obstacleSpots: [
      { u: 0.30, kind: 'rock' }, { u: 0.48, kind: 'crab' }, { u: 0.65, kind: 'rock' }, { u: 0.88, kind: 'crab' },
    ],
    shortcuts: [{
      width: 74,
      path: [
        { x: 600, y: 360 }, { x: 700, y: 420 }, { x: 820, y: 480 }, { x: 900, y: 420 },
      ],
    }],
    path: [
      { x: 180, y: 520 }, { x: 280, y: 480 }, { x: 380, y: 440 }, { x: 500, y: 390 },
      { x: 600, y: 360 }, { x: 720, y: 320 }, { x: 820, y: 300 }, { x: 920, y: 285 },
      { x: 1020, y: 280 }, { x: 1080, y: 340 }, { x: 1100, y: 420 }, { x: 1060, y: 500 },
      { x: 980, y: 560 }, { x: 880, y: 600 }, { x: 760, y: 620 }, { x: 640, y: 600 },
      { x: 520, y: 560 }, { x: 400, y: 500 }, { x: 300, y: 440 }, { x: 220, y: 480 },
    ],
  },
  {
    name: 'MEGA ARENA OBSTÁCULOS',
    bg: ['#180c08', '#503020'],
    grass: ['#2a2010', '#403018'],
    asphalt: ['#3c3830', '#504840'],
    kerb: ['#ff5010', '#ffd020'],
    accent: '#ff7020',
    decor: 'rock',
    roadWidth: 210,
    laps: 1,
    huge: true,
    mega: true,
    boostPads: [
      { u: 0.05, power: 100 }, { u: 0.15, power: 115 }, { u: 0.25, power: 120 },
      { u: 0.40, power: 125 }, { u: 0.55, power: 130 }, { u: 0.70, power: 120 }, { u: 0.85, power: 115 },
    ],
    jumpRamps: [{ u: 0.32, power: 210 }, { u: 0.68, power: 230 }],
    surfaces: [
      { uStart: 0.10, uEnd: 0.16, type: 'water' },
      { uStart: 0.34, uEnd: 0.40, type: 'offroad' },
      { uStart: 0.58, uEnd: 0.64, type: 'water' },
      { uStart: 0.78, uEnd: 0.84, type: 'offroad' },
    ],
    obstacleSpots: [
      { u: 0.03, kind: 'rock' }, { u: 0.06, kind: 'crab' }, { u: 0.09, kind: 'rock' },
      { u: 0.12, kind: 'crab' }, { u: 0.15, kind: 'rock' }, { u: 0.18, kind: 'crab' },
      { u: 0.21, kind: 'rock' }, { u: 0.24, kind: 'crab' }, { u: 0.27, kind: 'rock' },
      { u: 0.30, kind: 'crab' }, { u: 0.33, kind: 'rock' }, { u: 0.36, kind: 'crab' },
      { u: 0.39, kind: 'rock' }, { u: 0.42, kind: 'crab' }, { u: 0.45, kind: 'rock' },
      { u: 0.48, kind: 'crab' }, { u: 0.51, kind: 'rock' }, { u: 0.54, kind: 'crab' },
      { u: 0.57, kind: 'rock' }, { u: 0.60, kind: 'crab' }, { u: 0.63, kind: 'rock' },
      { u: 0.66, kind: 'crab' }, { u: 0.69, kind: 'rock' }, { u: 0.72, kind: 'crab' },
      { u: 0.75, kind: 'rock' }, { u: 0.78, kind: 'crab' }, { u: 0.81, kind: 'rock' },
      { u: 0.84, kind: 'crab' }, { u: 0.87, kind: 'rock' }, { u: 0.90, kind: 'crab' },
      { u: 0.93, kind: 'rock' }, { u: 0.96, kind: 'crab' },
    ],
    path: [
      { x: 1200, y: 6200 }, { x: 3000, y: 5700 }, { x: 5200, y: 5200 }, { x: 7400, y: 4700 },
      { x: 9600, y: 4200 }, { x: 11400, y: 3600 }, { x: 12200, y: 2600 }, { x: 11800, y: 1500 },
      { x: 10400, y: 700 }, { x: 8600, y: 500 }, { x: 6600, y: 800 }, { x: 4800, y: 1300 },
      { x: 3200, y: 1900 }, { x: 2000, y: 2700 }, { x: 1200, y: 3700 }, { x: 900, y: 4800 },
      { x: 1100, y: 5900 }, { x: 2000, y: 6800 }, { x: 3400, y: 7400 }, { x: 5200, y: 7800 },
      { x: 7200, y: 7900 }, { x: 9200, y: 7600 }, { x: 10800, y: 6900 }, { x: 11800, y: 6000 },
      { x: 12200, y: 5000 }, { x: 11800, y: 4100 }, { x: 10600, y: 3400 }, { x: 9000, y: 3000 },
      { x: 7200, y: 2900 }, { x: 5400, y: 3200 }, { x: 3800, y: 3700 }, { x: 2400, y: 4400 },
      { x: 1600, y: 5200 },
    ],
  },
  {
    name: 'ÓVALO VELOCIDAD',
    bg: ['#0c1830', '#3060a0'],
    grass: ['#1a3828', '#2a5838'],
    asphalt: ['#424850', '#565e68'],
    kerb: ['#00c8ff', '#ffffff'],
    accent: '#00d4ff',
    decor: 'grandstand',
    scale: KART_TRACK_SCALE,
    roadWidth: 200,
    boostPads: [
      { u: 0.08, power: 132 }, { u: 0.18, power: 142 }, { u: 0.28, power: 138 },
      { u: 0.38, power: 148 }, { u: 0.48, power: 155 }, { u: 0.58, power: 145 },
      { u: 0.68, power: 140 }, { u: 0.78, power: 138 }, { u: 0.88, power: 130 },
    ],
    jumpRamps: [{ u: 0.25, power: 200 }, { u: 0.50, power: 235 }, { u: 0.75, power: 195 }],
    obstacleSpots: [
      { u: 0.20, kind: 'rock' }, { u: 0.40, kind: 'crab' },
      { u: 0.60, kind: 'rock' }, { u: 0.80, kind: 'crab' },
    ],
    shortcuts: [{
      width: 76,
      path: [
        { x: 2100, y: 1550 }, { x: 2500, y: 2000 }, { x: 2900, y: 2500 }, { x: 2900, y: 3100 },
      ],
    }],
    path: [
      { x: 500, y: 2100 }, { x: 900, y: 1850 }, { x: 1200, y: 1700 }, { x: 1600, y: 1580 },
      { x: 2100, y: 1550 }, { x: 2600, y: 1620 }, { x: 3000, y: 1700 }, { x: 3400, y: 2000 },
      { x: 3700, y: 2300 }, { x: 3700, y: 2800 }, { x: 3600, y: 3100 }, { x: 3300, y: 3400 },
      { x: 2900, y: 3600 }, { x: 2400, y: 3700 }, { x: 1900, y: 3680 }, { x: 1400, y: 3500 },
      { x: 1000, y: 3300 }, { x: 700, y: 3000 }, { x: 550, y: 2600 },
    ],
  },
  {
    name: 'JARDÍN POMERANIAN',
    bg: ['#301828', '#f0a0c0'],
    grass: ['#3a5828', '#5a8840'],
    asphalt: ['#5a4e48', '#726860'],
    kerb: ['#ff80a0', '#fff0e8'],
    accent: '#ff90b8',
    decor: 'pom',
    scale: KART_TRACK_SCALE,
    roadWidth: 172,
    surfaces: [
      { uStart: 0.12, uEnd: 0.20, type: 'water' },
      { uStart: 0.55, uEnd: 0.62, type: 'offroad' },
    ],
    obstacleSpots: [
      { u: 0.20, kind: 'crab' }, { u: 0.42, kind: 'rock' },
      { u: 0.65, kind: 'crab' }, { u: 0.85, kind: 'rock' },
    ],
    boostPads: [
      { u: 0.15, power: 112 }, { u: 0.35, power: 118 }, { u: 0.55, power: 120 },
      { u: 0.72, power: 115 }, { u: 0.88, power: 108 },
    ],
    jumpRamps: [{ u: 0.48, power: 190 }],
    shortcuts: [{
      width: 74,
      path: [
        { x: 520, y: 380 }, { x: 600, y: 440 }, { x: 680, y: 400 }, { x: 720, y: 320 },
      ],
    }],
    path: [
      { x: 180, y: 480 }, { x: 260, y: 420 }, { x: 340, y: 360 }, { x: 440, y: 320 },
      { x: 520, y: 300 }, { x: 620, y: 310 }, { x: 720, y: 340 }, { x: 820, y: 380 },
      { x: 920, y: 420 }, { x: 1000, y: 480 }, { x: 1060, y: 540 }, { x: 1080, y: 620 },
      { x: 1040, y: 680 }, { x: 960, y: 720 }, { x: 860, y: 740 }, { x: 760, y: 720 },
      { x: 660, y: 680 }, { x: 560, y: 620 }, { x: 460, y: 560 }, { x: 360, y: 520 },
      { x: 260, y: 500 },
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
  samples = samples || kartTrackSamples(tr);
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
  kartApplyTrackScale(tr);
  let cx = 0, cy = 0;
  for (const p of tr.path) { cx += p.x; cy += p.y; }
  tr.cx = cx / tr.path.length;
  tr.cy = cy / tr.path.length;
  const cpCount = tr.mega ? 20 : (tr.huge ? 12 : 4);
  tr.cpCount = cpCount;
  tr.checkpoints = [];
  for (let i = 0; i < cpCount; i++) {
    const frac = i / cpCount;
    const tg = kartPathTangent(tr, frac);
    tr.checkpoints.push({ u: frac, x: tg.x, y: tg.y, angle: tg.angle });
  }
  const st = kartPathTangent(tr, 0.004);
  const grid = tr.mega ? { cols: [-96, -32, 32, 96], rows: [-56, 56] } : { cols: [-78, -26, 26, 78], rows: [-44, 44] };
  const nx = -Math.sin(st.angle) * 26, ny = Math.cos(st.angle) * 26;
  tr.starts = [];
  for (let r = 0; r < grid.rows.length; r++) {
    for (let c = 0; c < grid.cols.length; c++) {
      tr.starts.push({
        x: st.x + Math.cos(st.angle) * grid.rows[r] + nx * (grid.cols[c] / 26),
        y: st.y + Math.sin(st.angle) * grid.rows[r] + ny * (grid.cols[c] / 26),
        a: st.angle,
      });
    }
  }
  const itemUs = tr.mega
    ? [0.04, 0.08, 0.12, 0.16, 0.20, 0.24, 0.28, 0.32, 0.36, 0.40, 0.44, 0.48, 0.52, 0.56, 0.60, 0.64, 0.68, 0.72, 0.76, 0.80, 0.84, 0.88, 0.92, 0.96]
    : tr.huge
      ? [0.07, 0.14, 0.22, 0.30, 0.38, 0.46, 0.54, 0.62, 0.70, 0.78, 0.86, 0.93]
      : [0.14, 0.36, 0.58, 0.80];
  tr.items = itemUs.map(u => {
    const p = kartPathSample(tr, u);
    return { x: p.x, y: p.y, taken: false };
  });
  const lenSegs = tr.mega ? 320 : (tr.huge ? 160 : 80);
  tr.length = kartPathLength(tr, lenSegs);
  return tr;
}
function kartCpRadius(tr) {
  const tier = kartTrackTier(tr);
  const mul = tier === 'mega' ? 0.9 : tier === 'huge' ? 0.85 : 0.75;
  return Math.max(72, (tr.roadWidth || 100) * mul);
}
function kartTrackBounds(tr) {
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const p of tr.path) {
    minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
  }
  const pad = tr.mega ? 600 : (tr.huge ? 320 : 140);
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
  return kartWorldToScreen(x, y);
}
function kartWorldToCam(x, y) {
  const ca = race.camAngle || 0;
  const fx = race.camFocusX ?? race.camX;
  const fy = race.camFocusY ?? race.camY;
  const dx = x - fx, dy = y - fy;
  const c = Math.cos(-ca), sn = Math.sin(-ca);
  return { x: dx * c - dy * sn, y: dx * sn + dy * c };
}
function kartWorldToScreen(x, y, mini) {
  if (mini) {
    const s = mini.scale || 0.35;
    return { x: mini.px + (x - mini.tx) * s, y: mini.py + (y - mini.ty) * s, scale: 1, depth: 0 };
  }
  const cam = kartWorldToCam(x, y);
  const focal = race.camFocal || 460;
  const horizon = race.camHorizon ?? H * 0.34;
  const baseY = race.camBaseY ?? H * 0.82;
  const zoom = race.camZoom || 1;
  const depth = focal + cam.y;
  if (depth < 55) return { x: W / 2, y: H + 120, scale: 0.01, depth: cam.y };
  const scale = (focal / depth) * zoom;
  return {
    x: W / 2 + cam.x * scale,
    y: horizon + scale * (baseY - horizon),
    scale,
    depth: cam.y,
  };
}
let kartPtrSteer = 0;

function kartCamLookAngle(me, tr) {
  const samples = tr.mega ? 160 : tr.huge ? 110 : 72;
  const near = kartNearestPath(tr, me.x, me.y, samples);
  const spd = Math.abs(me.speed || 0);
  const speedFactor = Math.min(1, spd / 380);
  const pathAngle = kartPathTangent(tr, near.u).angle;
  if (spd < 60) {
    return me.angle + kartAngleDiff(pathAngle, me.angle) * 0.25;
  }
  const lookU = (near.u + (tr.mega ? 0.028 : tr.huge ? 0.038 : 0.048) + speedFactor * 0.065) % 1;
  const ahead = kartPathSample(tr, lookU);
  const aheadAngle = Math.atan2(ahead.y - me.y, ahead.x - me.x);
  const blend = 0.32 + speedFactor * 0.28;
  return me.angle + kartAngleDiff(aheadAngle, me.angle) * blend;
}
function kartUpdateRaceCamera(me, tr) {
  const touch = document.body.classList.contains('touch');
  const look = kartCamLookAngle(me, tr);
  const speedFactor = Math.min(1, Math.abs(me.speed) / 380);
  const boostFactor = Math.min(1, (me.boost || 0) / 200);
  const orbitMul = touch ? 0.45 : 0.22;
  const orbitX = Math.sin(camOrbit.yaw) * (touch ? 28 : 18) * orbitMul;
  const orbitY = camOrbit.pitch * (touch ? 18 : 12) * orbitMul;
  const tierMul = tr.mega ? 1.35 : tr.huge ? 1.2 : 1;
  race.camFocusX = me.x + Math.cos(look + Math.PI / 2) * orbitX + Math.cos(look) * orbitY * 0.2;
  race.camFocusY = me.y + Math.sin(look + Math.PI / 2) * orbitX + Math.sin(look) * orbitY * 0.2;
  race.camX = race.camFocusX;
  race.camY = race.camFocusY;
  let targetA = look - Math.PI / 2;
  targetA += kartAntigravCamTilt(me, tr);
  const rotLerp = 0.1 + speedFactor * 0.1;
  race.camAngle = (race.camAngle || 0) + kartAngleDiff(targetA, race.camAngle || 0) * rotLerp;
  race.camHorizon = H * (0.30 + speedFactor * 0.04);
  race.camBaseY = H * (0.80 + boostFactor * 0.02);
  race.camFocal = (420 + speedFactor * 80 + boostFactor * 40) * tierMul;
  const jumpZoom = (me.z || 0) > 25 ? 0.08 : 0;
  race.camZoom = lerp(race.camZoom || 1, 1.02 + boostFactor * 0.05 - jumpZoom, 0.1);
}
function kartDrawChaseSky(tr) {
  const hz = race.camHorizon ?? H * 0.34;
  const sky = ctx.createLinearGradient(0, 0, 0, hz);
  sky.addColorStop(0, tr.bg[1] || '#70b8f0');
  sky.addColorStop(1, tr.bg[0] || '#1a4080');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, hz + 2);
  const ground = ctx.createLinearGradient(0, hz, 0, H);
  ground.addColorStop(0, tr.grass[1] || tr.grass[0]);
  ground.addColorStop(1, tr.grass[0]);
  ctx.fillStyle = ground;
  ctx.fillRect(0, hz, W, H - hz);
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
  if (lane < half * 0.35) return 1.05;
  if (lane < half * 0.7) return 0.92;
  if (lane < half) return 0.75;
  return 0.62;
}
function kartAngleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
function kartDrawRoadRibbon(tr, t, mini) {
  const segs = kartTrackSegs(tr, mini);
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
  if (mini) {
    const b = kartRoadBounds(left, right);
    fillRR(b.x - 20, b.y - 20, b.w + 40, b.h + 40, 12, tr.grass[0]);
  }
  ctx.beginPath();
  ctx.moveTo(left[0].x, left[0].y);
  for (let i = 1; i < left.length; i++) ctx.lineTo(left[i].x, left[i].y);
  for (let i = right.length - 1; i >= 0; i--) ctx.lineTo(right[i].x, right[i].y);
  ctx.closePath();
  const midIdx = Math.floor(left.length / 2);
  const mid = {
    x: (left[midIdx].x + right[midIdx].x) * 0.5,
    y: (left[midIdx].y + right[midIdx].y) * 0.5,
  };
  const ag = ctx.createRadialGradient(mid.x, mid.y, 10, mid.x, mid.y, mini ? 120 : Math.max(W, H) * 0.55);
  ag.addColorStop(0, tr.asphalt[1]); ag.addColorStop(1, tr.asphalt[0]);
  ctx.fillStyle = ag;
  ctx.fill();
  kartDrawRoadKerbs(left, right, tr, mini);
  if (!mini) kartDrawRoadShoulders(tr, segs, hw, mini);
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
  if (!mini) {
    const chevN = tr.mega ? 48 : (tr.huge ? 36 : 20);
    for (let i = 0; i < chevN; i++) {
      const u = ((i / chevN) + t * (tr.mega ? 0.18 : tr.huge ? 0.25 : 0.4)) % 1;
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
    if (tr.boostPads) kartDrawBoostPads(tr, t, mini);
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
function kartDrawRoadShoulders(tr, segs, hw, mini) {
  const shW = hw * 0.22;
  const outer = hw + shW;
  for (let side = 0; side < 2; side++) {
    const sign = side ? -1 : 1;
    ctx.strokeStyle = tr.grass[1] || tr.grass[0];
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = shW * 0.9;
    ctx.beginPath();
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      const p = kartPathSample(tr, u);
      const tg = kartPathTangent(tr, u);
      const nx = -Math.sin(tg.angle), ny = Math.cos(tg.angle);
      const sp = kartToScreen(p.x + nx * outer * sign, p.y + ny * outer * sign, mini);
      if (i === 0) ctx.moveTo(sp.x, sp.y); else ctx.lineTo(sp.x, sp.y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
function kartDrawSectorSigns(tr, t) {
  if (tr.mega) return;
  const count = tr.huge ? 4 : 3;
  for (let s = 1; s <= count; s++) {
    const u = s / (count + 1);
    const p = kartPathSample(tr, u);
    const tg = kartPathTangent(tr, u);
    const nx = -Math.sin(tg.angle), ny = Math.cos(tg.angle);
    const off = tr.roadWidth * 0.72;
    const sp = kartToScreen(p.x + nx * off, p.y + ny * off);
    const bob = Math.sin(t * 3 + s) * 2;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    fillRR(sp.x - 18, sp.y - 12 + bob, 36, 24, 4, ctx.fillStyle);
    ctx.strokeStyle = tr.accent || '#fff';
    ctx.lineWidth = 1.5;
    strokeRR(sp.x - 18, sp.y - 12 + bob, 36, 24, 4, ctx.strokeStyle, ctx.lineWidth);
    ctx.fillStyle = tr.accent || '#fff';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('S' + s, sp.x, sp.y + 5 + bob);
  }
}
function kartDrawTrackDecor(tr, t, mini) {
  const n = mini ? (tr.mega ? 20 : tr.huge ? 16 : 12) : (tr.mega ? 72 : tr.huge ? 56 : 28);
  const hw = (tr.roadWidth || 100) * 0.5 + (mini ? 18 : (tr.mega ? 70 : tr.huge ? 50 : 50));
  for (let i = 0; i < n; i++) {
    const u = (i / n + t * 0.02) % 1;
    const p = kartPathSample(tr, u);
    const tg = kartPathTangent(tr, u);
    const side = (i % 2) ? 1 : -1;
    const off = hw + (i % 4) * (mini ? 8 : (tr.mega ? 36 : tr.huge ? 28 : 22));
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
    } else if (tr.decor === 'pom') {
      const fs = mini ? 6 : 12;
      const colors = ['#ff90b8', '#ffd080', '#90d8ff', '#c0ff90'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath(); ctx.arc(sp.x, sp.y, fs, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#3a5820';
      ctx.fillRect(sp.x - 1, sp.y + fs - 2, 2, mini ? 6 : 10);
      if (!mini && i % 6 === 0) {
        ctx.fillStyle = '#f8e0c8';
        fillRR(sp.x - 10, sp.y - 18, 20, 14, 3, ctx.fillStyle);
        ctx.fillStyle = '#c06040';
        fillRR(sp.x - 6, sp.y - 10, 12, 8, 2, ctx.fillStyle);
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
    const s2 = kartToScreen(wx + Math.cos(tg.angle) * 24, wy + Math.sin(tg.angle) * 24);
    const screenA = Math.atan2(s2.y - s.y, s2.x - s.x);
    ctx.save();
    ctx.translate(s.x, s.y + bob);
    ctx.rotate(screenA);
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
    if ((tr.huge || tr.mega) && i !== 0) continue;
    const cp = cps[i];
    const p = kartToScreen(cp.x, cp.y);
    const isFinish = i === 0;
    if (!tr.huge && !tr.mega) {
      ctx.fillStyle = isFinish ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.12)';
      fillRR(p.x - 22, p.y - 14, 44, 28, 6, ctx.fillStyle);
      strokeRR(p.x - 22, p.y - 14, 44, 28, 6, isFinish ? UI.gold : 'rgba(255,255,255,0.35)', isFinish ? 2 : 1);
    }
    ctx.fillStyle = isFinish ? UI.gold : UI.bright;
    ctx.font = 'bold ' + (tr.mega ? 18 : tr.huge ? 16 : 13) + 'px monospace'; ctx.textAlign = 'center';
    ctx.fillText(isFinish ? 'META' : 'S' + i, p.x, p.y + 5);
  }
}
function kartDrawHugeBg(tr) {
  kartDrawChaseSky(tr);
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
    const ang = me.angle - (race.camAngle || 0);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(p.x + Math.cos(ang) * 8, p.y + Math.sin(ang) * 8);
    ctx.lineTo(p.x + Math.cos(ang + 2.4) * 5, p.y + Math.sin(ang + 2.4) * 5);
    ctx.lineTo(p.x + Math.cos(ang - 2.4) * 5, p.y + Math.sin(ang - 2.4) * 5);
    ctx.closePath(); ctx.fill();
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
function kartSpeedKmh(speed) {
  return Math.round(Math.abs(speed || 0) * 2.6);
}
function kartInTrack(tr, x, y) {
  const near = kartNearestOnAnyPath(tr, x, y);
  const half = (near.onShortcut ? (near.shortcut?.width || 76) : tr.roadWidth) * 0.72;
  return near.dist <= half;
}
function kartPushToTrack(tr, k) {
  if (k._offTrackGrace > 0) return;
  const near = kartNearestOnAnyPath(tr, k.x, k.y, tr.mega ? 160 : tr.huge ? 140 : 80);
  const half = (near.onShortcut ? (near.shortcut?.width || 76) : tr.roadWidth) * 0.72;
  const overshoot = Math.max(0, near.dist - half);
  const pull = Math.min(1, 0.22 + overshoot / Math.max(half, 40));
  k.x = lerp(k.x, near.x, pull);
  k.y = lerp(k.y, near.y, pull);
  k.angle = lerpAngle(k.angle, near.angle, 0.16 + pull * 0.12);
  k.speed *= 0.97 - pull * 0.03;
  if (overshoot > half * 0.45) {
    if (!k._offTrackWarn) {
      k._offTrackWarn = 0.55;
      if (!k.ai && k.idx === kartLocalIdx()) spawnText(k.x, k.y - 20, '¡CÉSPED!', tr.grass?.[0] || '#8a8', 13);
    }
    spawnParticles(k.x, k.y, tr.grass?.[0] || '#6a5', 3, 100);
  }
  if (overshoot > half * 1.1) {
    k.x = lerp(k.x, near.x, 0.5);
    k.y = lerp(k.y, near.y, 0.5);
    k.speed *= 0.9;
    k._offTrackGrace = 0.3;
  }
}
function lerpAngle(a, b, t) {
  return a + kartAngleDiff(b, a) * t;
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
    _stuckT: 0, _stuckCp: 0, _stuckLap: 0, _offTrackGrace: 0, _offTrackWarn: 0,
    _shortcutSc: null, _shortcutTimer: 0, _shortcutDur: 0, _surfHud: '', _surfHudT: 0,
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
    track: tr, solo: !!solo, phase: 'countdown', countdown: 3.2,
    timer: 0, karts: [],
    itemCd: 0, camX: tr.starts[0].x, camY: tr.starts[0].y, camFocusX: tr.starts[0].x, camFocusY: tr.starts[0].y,
    camAngle: 0, camZoom: 1, camFocal: 460, camHorizon: H * 0.34, camBaseY: H * 0.82, syncAcc: 0,
    boxCooldowns: tr.items.map(() => 0),
    endTimer: 0, leaderName: '',
    countdownBeep: -1,
    cupRace: kartCupState ? kartCupState.raceIdx + 1 : 0,
    cupTotal: kartCupState ? kartCupState.cup.tracks.length : 0,
  };
  for (let i = 0; i < roster.length; i++) race.karts.push(mkKart(i, tr, roster[i]));
  kartInitRaceExtras(tr);
  if (typeof camOrbitReset === 'function') camOrbitReset();
  const me = race.karts[kartLocalIdx()];
  if (me) {
    const look = kartCamLookAngle(me, tr);
    race.camAngle = look - Math.PI / 2;
    race.camFocusX = me.x;
    race.camFocusY = me.y;
    race.camX = me.x;
    race.camY = me.y;
    race.camFocal = 460;
    race.camHorizon = H * 0.34;
    race.camBaseY = H * 0.82;
    race.camZoom = 1;
  }
  if (!gs._hintKart) {
    gs._hintKart = true;
    showBanner(document.body.classList.contains('touch')
      ? '◀▶ girar · ▲ acelera · ▼ freno · DRIFT/ITEM · Zona arriba-dcha=deriva'
      : '←→ girar · ↓ freno · Espacio deriva · J=objeto · Aceleración automática · Q/E cámara', '#ff8020');
  }
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
  } else if ((tr.huge || tr.mega) && want > 0) {
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
    race.endTimer = 22;
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

function kartAIStuckRecovery(k, tr, dt) {
  if (!k.ai || k.finished) return;
  if (k._stuckCp === k.cp && k._stuckLap === k.lap) k._stuckT += dt;
  else { k._stuckT = 0; k._stuckCp = k.cp; k._stuckLap = k.lap; }
  if (k._stuckT > 5 && k.speed < 100) {
    const near = kartNearestPath(tr, k.x, k.y);
    const ahead = kartPathSample(tr, (near.u + 0.04) % 1);
    k.x = ahead.x;
    k.y = ahead.y;
    k.angle = kartPathTangent(tr, near.u).angle;
    k.speed = 220;
    k._stuckT = 0;
  }
}

function kartReadInput(k) {
  const left = held('ArrowLeft') || held('KeyA');
  const right = held('ArrowRight') || held('KeyD');
  const down = held('ArrowDown') || held('KeyS');
  let steer = (right ? 1 : 0) - (left ? 1 : 0);
  if (!steer && kartPtrSteer) steer = kartPtrSteer;
  k.input.steer = clamp(steer, -1, 1);
  k.input.brake = down ? 1 : 0;
  k.input.accel = down ? 0 : 1;
  k.input.drift = held('Space');
  k.input.useItem = pressed('KeyJ') || pressed('ShiftLeft');
}
function kartAIShortcutTarget(k, tr, near, dt) {
  if (k._shortcutSc && k._shortcutTimer > 0) {
    k._shortcutTimer -= dt;
    const sc = k._shortcutSc;
    const path = sc.path;
    const prog = 1 - Math.max(0, k._shortcutTimer) / Math.max(0.01, k._shortcutDur || 2.5);
    const idx = Math.min(path.length - 1, Math.floor(prog * (path.length - 1)));
    return path[idx];
  }
  k._shortcutSc = null;
  if (!tr.shortcuts?.length || near.onShortcut) return null;
  const rank = k.rank || 8;
  if (rank < 4 && Math.random() > 0.08) return null;
  for (const sc of tr.shortcuts) {
    const entry = sc.path[0];
    const d = Math.hypot(entry.x - k.x, entry.y - k.y);
    if (d > 150) continue;
    const takeChance = rank >= 6 ? 0.72 : rank >= 4 ? 0.48 : 0.18;
    if (d < 90 || Math.random() < takeChance) {
      k._shortcutSc = sc;
      k._shortcutDur = 2.4 + sc.path.length * 0.35;
      k._shortcutTimer = k._shortcutDur;
      return entry;
    }
  }
  return null;
}
function kartAIInput(k, tr, dt) {
  const near = kartNearestOnAnyPath(tr, k.x, k.y, tr.mega ? 180 : tr.huge ? 120 : 72);
  const spdFactor = Math.min(1, Math.abs(k.speed) / 420);
  const lookAhead = (tr.mega ? 0.012 : tr.huge ? 0.02 : 0.045) + spdFactor * 0.04;
  let lookU = near.u + lookAhead;
  const scTarget = kartAIShortcutTarget(k, tr, near, dt);
  if (lookU > 1) lookU -= 1;
  const target = scTarget
    || (near.onShortcut && near.shortcut
      ? near.shortcut.path[Math.min(near.shortcut.path.length - 1, Math.floor(lookU * near.shortcut.path.length))]
      : kartPathSample(tr, lookU));
  const dx = target.x - k.x, dy = target.y - k.y;
  const want = Math.atan2(dy, dx);
  let diff = kartAngleDiff(want, k.angle);
  k.input.steer = clamp(diff * 3.2, -1, 1);
  const curve = Math.abs(diff);
  const top = KART_MAX_SPEED * kartTrackSpeedMul(tr);
  const rb = kartRubberBandAI(k, tr);
  k.input.accel = curve > 1.0 ? 0.55 : curve > 0.5 ? 0.85 : 1;
  k.input.brake = (curve > 0.75 && k.speed > 280) || k.speed > top * 0.94 ? 0.55 : 0;
  k.input.drift = curve > 0.55 && k.speed > 180;
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
    if (k._offTrackGrace > 0) k._offTrackGrace -= dt;
    const inp = k.input;
    const st = k.stats || kartBuildStats(k.char, k.chassis, k.wheels, k.glider);
    const grip = kartGrip(tr, k.x, k.y, k.angle) * (st.grip || 1);
    let turn = KART_TURN * grip * (st.handling || 1) * 0.38;
    if (inp.steer) k.angle += inp.steer * turn * dt;
    k.speed *= 0.94;
    k.x += Math.cos(k.angle) * k.speed * dt;
    k.y += Math.sin(k.angle) * k.speed * dt;
    return;
  }
  if (k._offTrackWarn > 0) k._offTrackWarn -= dt;
  if (k._offTrackGrace > 0) k._offTrackGrace -= dt;
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
    k._surfHud = surf.label;
    k._surfHudT = 1.8;
    spawnText(k.x, k.y - 18, surf.label, surf.label === 'AGUA' ? '#48f' : '#fa4', 13);
  }
  if (k._surfWarn > 0) k._surfWarn -= dt;
  if (k._surfHudT > 0) k._surfHudT -= dt;
  let turn = KART_TURN * grip * (st.handling || 1) * (0.72 + 0.28 * Math.min(1, Math.abs(k.speed) / 180));
  if (inp.drift && inp.steer) turn *= 1.55;
  if (inp.brake && inp.steer) turn *= 1.12;
  if (inp.steer) k.angle += inp.steer * turn * dt;
  let target = 0;
  const aiMul = k._aiMul || 1;
  const coinMul = 1 + Math.min(0.14, (k.coins || 0) * 0.014);
  const topSpd = KART_MAX_SPEED * kartTrackSpeedMul(tr) * (st.topSpeed || 1) * aiMul * (surf.speedMul || 1) * coinMul;
  const maxSpd = topSpd * (0.74 + grip * 0.26);
  if (inp.accel) target = maxSpd + k.boost;
  if (inp.brake) target = -140;
  if (k.boost > 0) { k.boost -= dt * 130; if (k.boost < 0) k.boost = 0; }
  const accel = KART_ACCEL * (st.accel || 1) * (0.7 + grip * 0.3) * (inp.accel ? 1 : 0.85);
  if (k.speed < target) k.speed = Math.min(target, k.speed + accel * dt);
  else k.speed = Math.max(target, k.speed - (inp.brake ? KART_BRAKE : KART_FRICTION * (1.05 - grip * 0.2)) * dt);
  if (inp.drift && inp.steer && Math.abs(k.speed) > 110) {
    k.driftCharge = Math.min(1.15, k.driftCharge + dt * 1.18);
    k.speed *= 0.991;
    if (!k._drifting) { k._drifting = true; k.vz = Math.max(k.vz || 0, 18); }
    if (Math.random() < 0.5) spawnParticles(k.x, k.y, tr.accent || '#ff0', 2, 100);
  } else {
    k._drifting = false;
    if (k.driftCharge > 0.45) {
      const charge = Math.min(1, k.driftCharge);
      if (charge > 0.95) {
        k.boost = KART_DRIFT_SUPER;
        spawnText(k.x, k.y - 24, 'SUPER DRIFT!', '#f0f', 16);
        spawnRing(k.x, k.y, '#f0f', 70, 0.4);
        sfx.power();
        maybeVibrate(45);
      } else if (charge > 0.75) {
        k.boost = KART_DRIFT_BOOST * charge * 1.2;
        spawnText(k.x, k.y - 20, 'MINI-TURBO!', '#f80', 14);
        spawnRing(k.x, k.y, '#ff8800', 55, 0.3);
        sfx.djump();
        maybeVibrate(28);
      } else {
        k.boost = KART_DRIFT_BOOST * charge;
        spawnRing(k.x, k.y, '#ff0', 50, 0.25);
        sfx.select();
      }
      k.driftCharge = 0;
    } else {
      k.driftCharge = Math.max(0, k.driftCharge - dt * 2.5);
    }
  }
  if (k.boost > 50 && Math.random() < 0.35) {
    spawnParticles(k.x - Math.cos(k.angle) * 20, k.y - Math.sin(k.angle) * 20, '#ff8800', 1, 90);
  }
  k.x += Math.cos(k.angle) * k.speed * dt;
  k.y += Math.sin(k.angle) * k.speed * dt;
  kartUpdateAntigrav(k, tr);
  kartCheckJumpRamps(k, tr);
  kartCheckBoostPads(k, tr);
  kartUpdateJump(k, dt);
  kartResolveCollisions(k);
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
    if (!k.ai && k.idx === kartLocalIdx()) showBanner('¡META!', '#ffd700');
  }
}
function kartRank() {
  if (!race) return;
  const scored = race.karts.map(k => ({
    k,
    score: k.finished && !k.dnf
      ? 10000 - k.finishTime
      : k.finished && k.dnf
        ? 5000 - race.timer
        : k.lap * 10000 + k.cp * 100 - race.timer * 0.01,
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
    if (k.ai) kartAIInput(k, race.track, dt);
    else if (k.idx === localIdx || (race.solo && k.idx === 0)) kartReadInput(k);
    kartAIStuckRecovery(k, race.track, dt);
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
    const beep = kartCountdownPhase(race.countdown);
    const beepKey = beep.text || (beep.lights > 0 ? String(beep.lights) : '');
    if (beepKey && beepKey !== race.countdownBeep) {
      race.countdownBeep = beepKey;
      if (beep.text === 'GO!') sfx.win();
      else if (beep.text) sfx.select();
    }
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
  kartTick(dt);
  if (race.phase === 'racing' || race.phase === 'countdown') {
    const me = race.karts[kartLocalIdx()];
    if (me) kartUpdateRaceCamera(me, race.track);
  }
  if (pressed('Escape') || pressed('KeyP')) {
    if (race.solo) { race = null; changeScene('kartmenu'); }
  }
}
function drawKartTrack(tr, t) {
  kartDrawChaseSky(tr);
  kartDrawTrackDecor(tr, t || 0, false);
  kartDrawRoadRibbon(tr, t || 0, false);
  kartDrawShortcuts(tr, t || 0);
  kartDrawWaterZones(tr, t || 0);
  kartDrawOffroadZones(tr, t || 0);
  kartDrawAntigravZones(tr, t || 0);
  kartDrawSectorSigns(tr, t || 0);
  kartDrawJumpRamps(tr, t || 0);
  kartDrawBoostPads(tr, t || 0);
  kartDrawObstacles(tr, t || 0);
  kartDrawHazards(tr);
  kartDrawProjectiles(tr);
  kartDrawBlueShells();
  kartDrawStartLine(tr, t || 0);
  kartDrawCheckpoints(tr);
  kartDrawItemBoxes(tr, t || 0);
}
function kartDrawRearKart(k, tr, col) {
  const lean = (k.input?.steer || 0) * 0.2;
  ctx.rotate(lean);
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(2, 10, 24, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col;
  fillRR(-22, -6, 44, 26, 7, col);
  strokeRR(-22, -6, 44, 26, 7, 'rgba(0,0,0,0.35)', 1);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(-18, 14, 12, 8);
  ctx.fillRect(6, 14, 12, 8);
  ctx.fillStyle = '#444';
  ctx.fillRect(-8, -2, 16, 10);
  ctx.fillStyle = '#888';
  fillRR(10, -4, 10, 14, 2, '#999');
  if (k.boost > 40) {
    ctx.fillStyle = '#ff8800';
    ctx.beginPath(); ctx.moveTo(-20, 8); ctx.lineTo(-32, 4); ctx.lineTo(-32, 12); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath(); ctx.moveTo(-24, 8); ctx.lineTo(-36, 6); ctx.lineTo(-36, 10); ctx.closePath(); ctx.fill();
  }
  if (k.shieldTimer > 0 || k.starTimer > 0) {
    ctx.strokeStyle = k.starTimer > 0 ? 'rgba(255,215,0,0.85)' : 'rgba(100,200,255,0.75)';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(0, 6, 28, 18, 0, 0, Math.PI * 2); ctx.stroke();
  }
  if (k.antigrav) {
    ctx.strokeStyle = 'rgba(200,120,255,0.6)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(0, 6, 30, 20, 0, 0, Math.PI * 2); ctx.stroke();
  }
}
function drawKartEntity(k, tr) {
  const sp = kartToScreen(k.x, k.y);
  if ((sp.scale || 1) < 0.06) return;
  const sc = sp.scale || 1;
  const px = sp.x, py = sp.y - (k.z || 0) * 0.55 * sc;
  const col = ['#e33', '#33e', '#3e3', '#ee3', '#e3e', '#3ee', '#f83', '#8af'][k.idx % 8];
  kartDrawJumpShadow(k, px, py + 8 * sc);
  if (k.driftCharge > 0.2 && Math.abs(k.speed) > 120) {
    ctx.fillStyle = tr.accent || '#ff0';
    for (let i = 0; i < 3; i++) {
      const bx = px + (i - 1) * 10 * sc;
      const by = py + 14 * sc + i * 2;
      ctx.globalAlpha = 0.35 - i * 0.08;
      ctx.beginPath(); ctx.arc(bx, by, (5 - i) * sc, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(sc * 1.15, sc);
  kartDrawRearKart(k, tr, col);
  ctx.restore();
  ctx.save();
  ctx.translate(px, py - 18 * sc);
  ctx.scale(0.5 * sc, 0.5 * sc);
  (CHARACTERS[k.char] || CHARACTERS[0]).draw({ facing: 1, power: null, invTimer: 0, shieldTimer: 0 }, -PLAYER_W / 2, -PLAYER_H / 2);
  ctx.restore();
  if (k.item) {
    const meta = KART_ITEMS[k.item] || { name: k.item, icon: '?', color: '#f0f' };
    ctx.fillStyle = meta.color; ctx.font = 'bold ' + Math.round(11 * sc) + 'px monospace'; ctx.textAlign = 'center';
    ctx.fillText(meta.icon + ' ' + meta.name, px, py - 28 * sc);
  }
  if (k.driftCharge > 0.35) {
    const barW = 40 * sc;
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; fillRR(px - barW / 2, py + 30 * sc, barW, 6 * sc, 3, ctx.fillStyle);
    const dcol = k.driftCharge > 0.85 ? '#f0f' : k.driftCharge > 0.6 ? '#f80' : '#ff0';
    fillRR(px - barW / 2, py + 30 * sc, barW * Math.min(1, k.driftCharge), 6 * sc, 3, dcol);
  }
  kartDrawSlipstreamBar(k, px, py);
  if (sc > 0.35) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.round(11 * sc) + 'px monospace'; ctx.textAlign = 'center';
    ctx.fillText(k.name, px, py + 42 * sc);
  }
}
function drawKart(t) {
  if (!race) return;
  const use3d = typeof threeKartHudOnly === 'function' && threeKartHudOnly();
  if (!use3d) {
    drawKartTrack(race.track, t);
    const sorted = [...race.karts].sort((a, b) => kartWorldToCam(b.x, b.y).y - kartWorldToCam(a.x, a.y).y);
    for (const k of sorted) drawKartEntity(k, race.track);
  }
  const meFx = race.karts[kartLocalIdx()];
  if (meFx && race.phase === 'racing') {
    const sf = Math.min(1, Math.abs(meFx.speed || 0) / 450);
    const bf = Math.min(1, (meFx.boost || 0) / 180);
    if (sf > 0.35 || bf > 0.3) {
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.72);
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, `rgba(0,0,0,${0.12 + sf * 0.14 + bf * 0.1})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);
    }
  }
  fillRR(8, 8, W - 16, 56, 14, 'rgba(8,12,20,0.85)');
  const me = race.karts[kartLocalIdx()];
  const laps = kartTrackLaps(race.track);
  const cpN = race.track.checkpoints.length;
  if (me) {
    const pos = me.rank || 1;
    hud(pos + 'º / ' + race.karts.length, W - 148, 58, pos <= 3 ? UI.gold : UI.bright, 22, 'center');
    hud('VUELTA ' + Math.min(me.lap + 1, laps) + '/' + laps, 24, 38, UI.gold, 20);
    const lapProg = Math.min(1, (me.lap * cpN + me.cp) / Math.max(1, laps * cpN));
    fillRR(24, 86, W - 48, 8, 4, 'rgba(0,0,0,0.45)');
    fillRR(24, 86, (W - 48) * lapProg, 8, 4, race.track.accent || UI.cyan);
    const spdKmh = kartSpeedKmh(me.speed);
    hud(spdKmh + ' km/h', W - 28, 38, UI.cyan, 20, 'right');
    hud(((race.track.huge || race.track.mega) ? 'SECTOR ' : 'CP ') + (me.cp + 1) + '/' + cpN, 24, 58, UI.dim, 14);
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
  else if (race.track.huge || race.track.mega) hud('~' + Math.round(race.track.length || 0) + ' m por vuelta', W / 2, 58, UI.cyan, 14, 'center');
  else if (race.phase === 'racing') hud(race.timer.toFixed(1) + 's', W / 2, 58, UI.cyan, 16, 'center');
  if ((race.track.huge || race.track.mega) && race.phase === 'racing') hud(race.timer.toFixed(1) + 's', W / 2, 76, UI.dim, 13, 'center');
  if (race.phase === 'countdown') kartDrawTrafficLights(t);
  const lbH = Math.min(200, 24 + race.karts.length * 16);
  fillRR(W - 208, 8, 200, lbH, 12, 'rgba(8,12,20,0.85)');
  race.karts.slice().sort((a, b) => a.rank - b.rank).forEach((k, i) => {
    hud((k.rank || i + 1) + '. ' + k.name + (k.finished ? ' ✓' : ''), W - 108, 24 + i * 16, k.idx === kartLocalIdx() ? UI.gold : UI.bright, 12, 'center');
  });
  if (me && me.driftCharge > 0.15) {
    const dw = 100;
    fillRR(W / 2 - dw / 2, H - 52, dw, 10, 5, 'rgba(0,0,0,0.5)');
    const dc = Math.min(1, me.driftCharge);
    const dcol = dc > 0.85 ? '#f0f' : dc > 0.6 ? '#f80' : '#ff0';
    fillRR(W / 2 - dw / 2, H - 52, dw * dc, 10, 5, dcol);
    hud('DERIVA', W / 2, H - 56, dcol, 11, 'center');
  }
  if (mp.connected) uiPill(W / 2 - 70, H - 36, 'ONLINE 8K', UI.cyan);
  else if (race.solo) uiPill(W / 2 - 65, H - 36, '8 CORREDORES', UI.green);
  if (me) kartDrawMiniMap(race.track, me, race.karts);
  if (me && race.phase === 'racing') {
    const spdKmh = kartSpeedKmh(me.speed);
    fillRR(10, H - 50, 120, 40, 10, 'rgba(8,12,20,0.82)');
    hud('P' + (me.rank || '?') + '/' + race.karts.length, 22, H - 34, UI.gold, 14);
    hud(spdKmh + ' km/h', 22, H - 16, UI.cyan, 16);
    if (me.boost > 50) hud('BOOST', 100, H - 34, '#ff0', 10);
    if (me._surfHudT > 0 && me._surfHud) {
      hud(me._surfHud, 70, H - 34, me._surfHud === 'AGUA' ? '#48f' : '#fa4', 11);
    }
  }
  uiFooter('←→ Girar · ↓ Freno · Espacio=Deriva · J=Objeto · Esc=Salir');
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
  if (document.body.classList.contains('mob-menu-html')) return;
  uiBgGrad('#0a1420', '#1a2840');
  uiTitle('RESULTADOS', 80, 44);
  if (!race) { uiFooter('Enter para volver'); return; }
  uiPanel(W / 2 - 300, 110, 600, 420, 20);
  const sorted = [...race.karts].sort((a, b) => a.rank - b.rank);
  sorted.forEach((k, i) => {
    const y = 155 + i * 46;
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
    const isMe = k.idx === kartLocalIdx();
    if (isMe) fillRR(W / 2 - 270, y - 28, 540, 40, 8, 'rgba(255,215,0,0.12)');
    ctx.font = isMe ? 'bold 22px monospace' : 'bold 22px monospace'; ctx.textAlign = 'left';
    ctx.fillStyle = isMe ? UI.gold : (i === 0 ? UI.gold : UI.bright);
    ctx.fillText(medal + '  ' + k.name + (isMe ? '  (TÚ)' : ''), W / 2 - 260, y);
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
      if (!document.body.classList.contains('three-menu')) uiBgGrad('#1a0830', '#301858');
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
    if (!document.body.classList.contains('three-menu')) uiBgGrad('#1a0830', '#301858');
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
  const miniScale = tr.mega ? Math.min(0.12, 80 / span) : tr.huge ? Math.min(0.2, 100 / span) : 0.38;
  const mini = { px: cx, py: cy, tx: tr.cx, ty: tr.cy, scale: miniScale };
  kartDrawTrackDecor(tr, t * 0.6, mini);
  kartDrawRoadRibbon(tr, t, mini);
  const decor = tr.mega ? 'Mega arena · ' + Math.round(tr.length || 0) + ' m · Obstáculos · 1 vuelta'
    : tr.huge ? 'Pista enorme · ' + Math.round(tr.length || 0) + ' m · ' + kartTrackLaps(tr) + ' vueltas'
    : tr.decor === 'pom' ? 'Jardín Pomeranian · Flores · Atajos · Fuente'
    : tr.surfaces?.some(s => s.type === 'antigrav') ? 'Antigravedad · Saltos · Nebulosa'
    : tr.boostPads?.length >= 7 ? 'Óvalo velocidad · ' + tr.boostPads.length + ' turbos · Saltos'
    : tr.shortcuts?.length >= 2 ? 'Doble atajo · Turbos · ' + (tr.surfaces?.length || 0) + ' zonas'
    : tr.decor === 'palm' ? 'Costa · Rectas rápidas · Agua · Atajos'
    : tr.decor === 'rock' ? 'Montaña · Curvas cerradas · Saltos'
    : 'Urbano · Técnica · Atajos';
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
