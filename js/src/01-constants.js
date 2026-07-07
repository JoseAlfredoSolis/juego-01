// === 01-constants.js (from index.html lines 1-11) ===
// ── Constants ──────────────────────────────────────────────────────────────
const GAME_VERSION = 'v78';
const W = 1280, H = 720;
let threeCtx = null;
const WORLD_COUNT = 12;           // FOREST..COSMOS + POMERANIAN + BIKINI
const LAST_WORLD = WORLD_COUNT-1;
const POM_WORLD = 10;
const BIKI_WORLD = LAST_WORLD;
// Cuadrícula del mapa: 4 + 4 + 4
const WORLD_MAP_LAYOUT = [
  [0, 1, 2, 3],
  [4, 5, 6, 7],
  [8, 9, 10, 11],
];
const WORLDS_PER_ROW = 4; // referencia legacy; usar WORLD_MAP_LAYOUT
const GRAVITY = 1800, MAX_FALL = 900;
const PLAYER_W = 36, PLAYER_H = 48;
const PLAYER_SPEED = 290, JUMP_V = -700, DJUMP_V = -600;
const COYOTE_TIME = 0.11, JUMP_BUFFER = 0.14, JUMP_CUT = 0.48;
const GROUND_ACCEL = 2400, GROUND_DECEL = 3000, AIR_ACCEL = 1500, AIR_DECEL = 700;
const STOMP_BOUNCE = -420;
const COIN_PTS = 50, STAR_PTS = 200, ENEMY_PTS = 100, BOSS_PTS = 1000, LEVEL_PTS = 500, MINIBOSS_PTS = 500;

