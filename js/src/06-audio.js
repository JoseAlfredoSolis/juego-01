// === 06-audio.js (from index.html lines 537-579) ===
  { name:'NORMAL', lives:3, enemy:1.00, score:1.0, color:'#fd0' },
  { name:'DIFICIL',lives:2, enemy:1.35, score:1.6, color:'#f55' },
];
function diff(){ return DIFFICULTIES[gs.difficulty] || DIFFICULTIES[1]; }
function startLives(){ return diff().lives + (gs.bonusLives||0); }

// ── Audio (WebAudio synth — no asset files needed) ──────────────────────────
const audio = { ctx:null, sound:true, music:true };
function audioInit() {
  try {
    if (!audio.ctx) audio.ctx = new (window.AudioContext||window.webkitAudioContext)();
    if (audio.ctx.state==='suspended') audio.ctx.resume();
    if (audio.music) musicStart();
  } catch(e){}
}
function beep(freq, dur, type='square', vol=0.2, slideTo=null) {
  if (!audio.sound || !audio.ctx) return;
  const t = audio.ctx.currentTime;
  const o = audio.ctx.createOscillator(), g = audio.ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(1,slideTo), t+dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  o.connect(g).connect(audio.ctx.destination);
  o.start(t); o.stop(t+dur);
}
const sfx = {
  jump:  ()=>beep(420,0.14,'square',0.18,720),
  djump: ()=>beep(620,0.14,'square',0.18,980),
  coin:  ()=>beep(880,0.08,'triangle',0.2,1320),
  star:  ()=>{beep(880,0.1,'triangle',0.2,1320); setTimeout(()=>beep(1320,0.12,'triangle',0.2,1760),90);},
  power: ()=>{beep(520,0.1,'sawtooth',0.16,780); setTimeout(()=>beep(780,0.14,'sawtooth',0.16,1040),90);},
  stomp: ()=>beep(220,0.12,'square',0.22,90),
  hurt:  ()=>beep(300,0.3,'sawtooth',0.22,80),
  win:   ()=>{[523,659,784,1047].forEach((f,i)=>setTimeout(()=>beep(f,0.16,'triangle',0.2),i*120));},
  select:()=>beep(660,0.05,'square',0.12),
};
// Simple looped background melody — one track per level (world × 3 niveles)
let musicTimer = null, musicStep = 0, musicTrack = null;
let levelMusicCache = null;

const MENU_MUSIC = {
  melody: [330, 392, 440, 392, 330, 294, 330, 392],
  tempo: 340, type: 'triangle', vol: 0.045, dur: 0.2,
};

function musicNote(root, semi) {
  return root * Math.pow(2, semi / 12);
}

function buildLevelTracks() {
  const worlds = [
    { root: 392, pat: [0, 2, 4, 5, 7, 5, 4, 2], tempo: 300, type: 'triangle' },   // bosque
    { root: 196, pat: [0, 3, 5, 7, 5, 3, 0, 3], tempo: 340, type: 'sawtooth' },  // cueva
    { root: 494, pat: [0, 2, 4, 7, 4, 2, 0, 2], tempo: 275, type: 'triangle' },   // nieve
    { root: 220, pat: [0, 3, 6, 3, 0, 3, 6, 8], tempo: 255, type: 'square' },    // lava
    { root: 440, pat: [0, 4, 7, 11, 7, 4, 0, 4], tempo: 315, type: 'triangle' }, // cielo
    { root: 349, pat: [0, 2, 5, 7, 5, 2, 0, 5], tempo: 325, type: 'triangle' },  // valle
    { root: 330, pat: [0, 3, 5, 8, 5, 3, 0, 5], tempo: 305, type: 'sine' },      // océano
    { root: 262, pat: [0, 2, 4, 2, 0, 2, 4, 5], tempo: 345, type: 'triangle' },  // desierto
    { root: 415, pat: [0, 4, 7, 4, 0, 7, 4, 0], tempo: 265, type: 'triangle' },  // cristal
    { root: 370, pat: [0, 3, 7, 10, 7, 3, 0, 3], tempo: 285, type: 'sine' },     // cosmos
    { root: 440, pat: [0, 2, 5, 7, 5, 2, 0, 7], tempo: 295, type: 'triangle' },  // pomerania
    { root: 349, pat: [0, 4, 7, 11, 7, 4, 0, 2], tempo: 280, type: 'triangle' }, // bikini
  ];
  const tracks = [];
  for (let w = 0; w < WORLD_COUNT; w++) {
    const cfg = worlds[w] || worlds[0];
    for (let l = 0; l < 3; l++) {
      const shift = l * 2;
      const melody = cfg.pat.map(s => musicNote(cfg.root, s + shift));
      const tempo = l === 2 ? Math.max(200, cfg.tempo - 40) : cfg.tempo + l * 14;
      tracks.push({
        melody,
        tempo,
        type: l === 2 ? 'sawtooth' : cfg.type,
        vol: 0.04 + l * 0.007,
        dur: l === 2 ? 0.14 : 0.18,
      });
    }
  }
  return tracks;
}

function levelMusicTrack(world, level) {
  if (!levelMusicCache) levelMusicCache = buildLevelTracks();
  const w = Math.max(0, Math.min(WORLD_COUNT - 1, world | 0));
  const l = Math.max(0, Math.min(2, level | 0));
  return levelMusicCache[w * 3 + l] || MENU_MUSIC;
}

function musicStop() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
}

function musicApplyTrack(track) {
  musicTrack = track || MENU_MUSIC;
  musicStep = 0;
  musicStop();
  if (!audio.music) return;
  const tick = () => {
    if (!audio.music || !audio.ctx || !musicTrack) return;
    const freq = musicTrack.melody[musicStep % musicTrack.melody.length];
    if (freq > 0) {
      beep(freq, musicTrack.dur || 0.18, musicTrack.type || 'triangle', musicTrack.vol || 0.05);
    }
    musicStep++;
  };
  tick();
  musicTimer = setInterval(tick, musicTrack.tempo || 300);
}

function musicStart(track) {
  musicApplyTrack(track || musicTrack || MENU_MUSIC);
}

function musicPlayMenu() {
  musicApplyTrack(MENU_MUSIC);
}

function musicPlayLevel(world, level) {
  musicApplyTrack(levelMusicTrack(world, level));
}

function musicOnScene(scene) {
  if (scene === 'gameplay' || scene === 'pause' || scene === 'levelcomplete' ||
      scene === 'gameover' || scene === 'kart') return;
  musicPlayMenu();
}
