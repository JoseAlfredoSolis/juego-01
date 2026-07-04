// === 05-state.js (from index.html lines 517-536) ===
// ── Game State ─────────────────────────────────────────────────────────────
function freshUnlocked(){ return Array.from({length:WORLD_COUNT}, (_,i)=>i===0); }
function freshLevelDone(){ return Array.from({length:WORLD_COUNT}, ()=>[false,false,false]); }
const gs = {
  scene: 'menu', // menu | worldmap | gameplay | pause | gameover | levelcomplete | victory | settings | credits | instructions | shop | achievements
  score: 0, highScore: 0, coins: 0, lives: 3,
  world: 0, level: 0, character: 0, difficulty: 1,
  worldUnlocked: freshUnlocked(),
  levelDone: freshLevelDone(),
  wallet: 0,            // persistent coins for the shop
  bonusLives: 0,        // bought extra starting lives (0..3)
  magnet: false,        // bought coin magnet
  bought: {},           // characters unlocked via shop {index:true}
  ach: {},              // unlocked achievements {id:true}
  fxShake: true,        // screen shake
  fxParticles: true,    // particle effects
  vibration: true,      // haptic feedback on mobile
  viewMode: '2d',       // '2d' | '3d' — vista del juego (2d más estable en móvil)
};

// ── Difficulty ──────────────────────────────────────────────────────────────
// lives: starting lives · enemy: enemy/boss speed mult · score: points mult · color: UI tint
const DIFFICULTIES = [
  { name:'FACIL',  lives:5, enemy:0.80, score:0.8, color:'#3f6' },
