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
// Simple looped background melody
let musicTimer=null, musicStep=0;
const melody=[392,440,494,523,494,440,392,330];
function musicStart(){
  if (musicTimer || !audio.music) return;
  musicTimer=setInterval(()=>{
