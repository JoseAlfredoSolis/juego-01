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
  melody: [330, 392, 440, 494, 440, 392, 330, 294, 330, 392],
  bass: [165, 0, 196, 0, 165, 0, 147, 0, 165, 0],
  tempo: 350, type: 'triangle', bassType: 'sine', vol: 0.044, dur: 0.2,
};

function musicNote(root, semi) {
  return root * Math.pow(2, semi / 12);
}

function mkMelody(root, semis) {
  return semis.map(s => (s == null || s < 0 ? 0 : musicNote(root, s)));
}

function mkTrack(root, melodySemi, bassSemi, opts) {
  return {
    melody: mkMelody(root, melodySemi),
    bass: bassSemi ? mkMelody(root, bassSemi.map(s => (s == null || s < 0 ? -1 : s - 12))) : null,
    tempo: opts.tempo,
    type: opts.type || 'triangle',
    bassType: opts.bassType || 'sine',
    vol: opts.vol ?? 0.045,
    dur: opts.dur ?? 0.18,
  };
}

// Temas por mundo: 3 pistas (nivel 1, 2, jefe) con melodía y bajo propios
function buildLevelTracks() {
  const T = mkTrack;
  const themes = [
    // 0 FOREST — alegre, saltarina
    [
      T(392, [0, 2, 4, 7, 4, 2, 0, 2, 4, 5], [0, -1, 4, -1, 0, -1, 4, -1, 0, -1], { tempo: 310, type: 'triangle', vol: 0.044 }),
      T(392, [0, 4, 7, 11, 7, 4, 2, 4, 7, 9, 7, 4], [0, -1, 4, -1, 7, -1, 4, -1, 0, -1, 4, -1], { tempo: 285, type: 'triangle', vol: 0.046 }),
      T(392, [0, 2, 4, 7, 12, 7, 4, 2, 0, 3, 7, 10, 7], [0, -1, 0, -1, 4, -1, 0, -1, 0, -1, 3, -1, 0], { tempo: 235, type: 'sawtooth', vol: 0.05, dur: 0.14 }),
    ],
    // 1 CAVE — grave, misteriosa
    [
      T(196, [0, 3, 5, 7, 5, 3, 0, 3, 5], [0, -1, 3, -1, 0, -1, 3, -1, 0], { tempo: 360, type: 'sawtooth', vol: 0.042 }),
      T(196, [0, 3, 6, 8, 6, 3, 0, 5, 3, 0], [0, -1, 3, -1, 0, -1, 3, -1, 0, -1], { tempo: 330, type: 'sawtooth', vol: 0.044 }),
      T(185, [0, 3, 6, 10, 6, 3, 0, 6, 3, 0, 3, 8], [0, -1, 0, -1, 3, -1, 0, -1, 3, -1, 0, -1], { tempo: 270, type: 'square', vol: 0.048, dur: 0.15 }),
    ],
    // 2 SNOW — cristalina, lenta
    [
      T(494, [0, 2, 4, 7, 4, 2, 0, -1, 2, 4], [0, -1, -1, 4, -1, -1, 0, -1, -1, 4], { tempo: 380, type: 'sine', vol: 0.04, dur: 0.22 }),
      T(494, [0, 4, 7, 11, 7, 4, 0, 4, 7], [0, -1, 4, -1, 0, -1, 4, -1, 0], { tempo: 340, type: 'triangle', vol: 0.042, dur: 0.2 }),
      T(494, [0, 2, 4, 7, 12, 7, 4, 2, 0, 7, 12, 7], [0, -1, 0, -1, 4, -1, 0, -1, 0, -1, 4, -1], { tempo: 290, type: 'sawtooth', vol: 0.046, dur: 0.16 }),
    ],
    // 3 LAVA — urgente, volcánica
    [
      T(220, [0, 3, 6, 3, 0, 3, 6, 8, 6, 3], [0, -1, 3, -1, 0, -1, 3, -1, 0, -1], { tempo: 250, type: 'square', vol: 0.046 }),
      T(220, [0, 3, 7, 10, 7, 3, 0, 5, 8, 5, 3, 0], [0, -1, 3, -1, 0, -1, 3, -1, 5, -1, 3, -1], { tempo: 230, type: 'square', vol: 0.048 }),
      T(207, [0, 3, 6, 10, 13, 10, 6, 3, 0, 6, 10, 6], [0, -1, 0, -1, 3, -1, 0, -1, 0, -1, 3, -1], { tempo: 195, type: 'sawtooth', vol: 0.052, dur: 0.12 }),
    ],
    // 4 SKY — etérea, arpegios
    [
      T(440, [0, 4, 7, 11, 7, 4, 0, 4, 7], [0, -1, 4, -1, 0, -1, 4, -1, 0], { tempo: 300, type: 'sine', vol: 0.043 }),
      T(440, [0, 4, 7, 12, 7, 4, 0, 7, 11, 7, 4], [0, -1, 4, -1, 7, -1, 4, -1, 0, -1, 4, -1], { tempo: 275, type: 'triangle', vol: 0.045 }),
      T(440, [0, 4, 7, 11, 16, 11, 7, 4, 0, 7, 12, 16, 12], [0, -1, 0, -1, 4, -1, 0, -1, 0, -1, 4, -1, 0], { tempo: 240, type: 'sawtooth', vol: 0.048, dur: 0.14 }),
    ],
    // 5 VALLE — folk tranquilo
    [
      T(349, [0, 2, 5, 7, 5, 2, 0, 5, 2, 0], [0, -1, 2, -1, 0, -1, 2, -1, 0, -1], { tempo: 335, type: 'triangle', vol: 0.043 }),
      T(349, [0, 2, 5, 9, 5, 2, 0, 7, 5, 2, 0], [0, -1, 2, -1, 0, -1, 2, -1, 5, -1, 2, -1], { tempo: 310, type: 'triangle', vol: 0.045 }),
      T(349, [0, 2, 5, 7, 12, 7, 5, 2, 0, 5, 9, 12, 9], [0, -1, 0, -1, 2, -1, 0, -1, 0, -1, 2, -1, 0], { tempo: 265, type: 'sawtooth', vol: 0.047, dur: 0.15 }),
    ],
    // 6 OCEAN — ondas, fluyente
    [
      T(330, [0, 3, 5, 8, 5, 3, 0, -1, 3, 5, 8], [0, -1, -1, 3, -1, -1, 0, -1, -1, 3, -1], { tempo: 315, type: 'sine', vol: 0.042, dur: 0.2 }),
      T(330, [0, 3, 5, 8, 12, 8, 5, 3, 0, 5, 8], [0, -1, 3, -1, 5, -1, 3, -1, 0, -1, 3, -1], { tempo: 295, type: 'sine', vol: 0.044 }),
      T(330, [0, 3, 7, 10, 14, 10, 7, 3, 0, 7, 10, 7, 3], [0, -1, 0, -1, 3, -1, 0, -1, 0, -1, 3, -1, 0], { tempo: 255, type: 'triangle', vol: 0.047, dur: 0.16 }),
    ],
    // 7 DESERT — mística, espaciada
    [
      T(262, [0, 2, 4, 2, 0, -1, 2, 4, 5, 4, 2], [0, -1, -1, -1, 0, -1, -1, 4, -1, -1, 2], { tempo: 355, type: 'triangle', vol: 0.04, dur: 0.21 }),
      T(262, [0, 2, 5, 7, 5, 2, 0, 4, 7, 4, 2], [0, -1, 2, -1, 0, -1, 2, -1, 4, -1, 2], { tempo: 325, type: 'triangle', vol: 0.043 }),
      T(247, [0, 2, 5, 9, 12, 9, 5, 2, 0, 5, 9, 5], [0, -1, 0, -1, 2, -1, 0, -1, 0, -1, 2, -1], { tempo: 280, type: 'sawtooth', vol: 0.046, dur: 0.15 }),
    ],
    // 8 CRYSTAL — brillante, arpegiada
    [
      T(415, [0, 4, 7, 4, 0, 7, 4, 0, 4, 7, 11], [0, -1, 4, -1, 0, -1, 4, -1, 0, -1, 4, -1], { tempo: 270, type: 'triangle', vol: 0.044 }),
      T(415, [0, 4, 7, 11, 7, 4, 0, 11, 7, 4, 0, 7], [0, -1, 4, -1, 0, -1, 4, -1, 0, -1, 4, -1], { tempo: 250, type: 'triangle', vol: 0.046 }),
      T(415, [0, 4, 7, 11, 16, 11, 7, 4, 0, 7, 11, 16, 11, 7], [0, -1, 0, -1, 4, -1, 0, -1, 0, -1, 4, -1, 0, -1], { tempo: 220, type: 'sawtooth', vol: 0.05, dur: 0.13 }),
    ],
    // 9 COSMOS — espacial, flotante
    [
      T(370, [0, 3, 7, 10, 7, 3, 0, -1, 7, 10], [0, -1, -1, 3, -1, -1, 0, -1, -1, 3], { tempo: 340, type: 'sine', vol: 0.039, dur: 0.24 }),
      T(370, [0, 3, 7, 10, 14, 10, 7, 3, 0, 10, 14], [0, -1, 3, -1, 7, -1, 3, -1, 0, -1, 7, -1], { tempo: 300, type: 'sine', vol: 0.041, dur: 0.2 }),
      T(370, [0, 3, 7, 10, 15, 10, 7, 3, 0, 7, 10, 15, 10], [0, -1, 0, -1, 3, -1, 0, -1, 0, -1, 3, -1, 0], { tempo: 260, type: 'triangle', vol: 0.045, dur: 0.17 }),
    ],
    // 10 POMERANIAN — juguetona, perruna
    [
      T(440, [0, 2, 5, 7, 5, 2, 0, 2, 5, 7, 9], [0, -1, 2, -1, 0, -1, 2, -1, 0, -1, 2, -1], { tempo: 290, type: 'triangle', vol: 0.045 }),
      T(440, [0, 2, 5, 7, 9, 7, 5, 2, 0, 5, 9, 7], [0, -1, 2, -1, 0, -1, 2, -1, 0, -1, 2, -1], { tempo: 268, type: 'triangle', vol: 0.047 }),
      T(440, [0, 2, 5, 7, 12, 7, 5, 2, 0, 2, 5, 9, 12, 9], [0, -1, 0, -1, 2, -1, 0, -1, 0, -1, 2, -1, 0, -1], { tempo: 225, type: 'sawtooth', vol: 0.05, dur: 0.13 }),
    ],
    // 11 BIKINI — tropical submarina, bouncy
    [
      T(349, [0, 4, 7, 11, 7, 4, 0, 4, 7, 4, 0], [0, -1, 4, -1, 0, -1, 4, -1, 0, -1, 4, -1], { tempo: 278, type: 'triangle', vol: 0.044 }),
      T(349, [0, 4, 7, 11, 14, 11, 7, 4, 0, 7, 11, 7, 4], [0, -1, 4, -1, 7, -1, 4, -1, 0, -1, 4, -1, 0], { tempo: 258, type: 'triangle', vol: 0.046 }),
      T(349, [0, 4, 7, 11, 16, 11, 7, 4, 0, 4, 7, 11, 16, 11, 7], [0, -1, 0, -1, 4, -1, 0, -1, 0, -1, 4, -1, 0, -1, 0], { tempo: 218, type: 'sawtooth', vol: 0.05, dur: 0.13 }),
    ],
  ];

  const tracks = [];
  for (let w = 0; w < WORLD_COUNT; w++) {
    const levels = themes[w] || themes[0];
    for (let l = 0; l < 3; l++) tracks.push(levels[l] || levels[0]);
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
    const i = musicStep % musicTrack.melody.length;
    const freq = musicTrack.melody[i];
    if (freq > 0) {
      beep(freq, musicTrack.dur || 0.18, musicTrack.type || 'triangle', musicTrack.vol || 0.05);
    }
    if (musicTrack.bass && musicTrack.bass[i] > 0) {
      beep(musicTrack.bass[i], (musicTrack.dur || 0.18) * 1.05,
        musicTrack.bassType || 'sine', (musicTrack.vol || 0.05) * 0.5);
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
