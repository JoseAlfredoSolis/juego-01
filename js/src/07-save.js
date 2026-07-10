// === 07-save.js (from index.html lines 580-628) ===

// ── Save / load progress (localStorage) ─────────────────────────────────────
const SAVE_KEY='superbear_save_v1';
function migrateProgress(){
  while(gs.worldUnlocked.length<WORLD_COUNT) gs.worldUnlocked.push(false);
  while(gs.levelDone.length<WORLD_COUNT) gs.levelDone.push([false,false,false]);
  while(gs.levelStarsBest.length<WORLD_COUNT) gs.levelStarsBest.push([0,0,0]);
  while(gs.levelBestTime.length<WORLD_COUNT) gs.levelBestTime.push([0,0,0]);
  for(let w=0;w<WORLD_COUNT-1;w++){
    if(gs.levelDone[w] && gs.levelDone[w].every(Boolean)) gs.worldUnlocked[w+1]=true;
  }
}
function loadSave(){
  try{
    const s=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');
    if(typeof s.highScore==='number') gs.highScore=s.highScore;
    if(Array.isArray(s.worldUnlocked)) gs.worldUnlocked=s.worldUnlocked;
    if(Array.isArray(s.levelDone)) gs.levelDone=s.levelDone;
    if(Array.isArray(s.levelStarsBest)) gs.levelStarsBest=s.levelStarsBest;
    if(Array.isArray(s.levelBestTime)) gs.levelBestTime=s.levelBestTime;
    if(s.kartBest && typeof s.kartBest==='object') gs.kartBest=s.kartBest;
    migrateProgress();
    if(typeof s.sound==='boolean') audio.sound=s.sound;
    if(typeof s.music==='boolean') audio.music=s.music;
    if(typeof s.character==='number') gs.character=s.character;
    if(typeof s.difficulty==='number' && s.difficulty>=0 && s.difficulty<DIFFICULTIES.length) gs.difficulty=s.difficulty;
    if(typeof s.wallet==='number') gs.wallet=s.wallet;
    if(typeof s.bonusLives==='number') gs.bonusLives=clamp(s.bonusLives,0,3);
    if(typeof s.magnet==='boolean') gs.magnet=s.magnet;
    if(s.bought && typeof s.bought==='object') gs.bought=s.bought;
    if(typeof s.ach==='object') gs.ach=s.ach;
    if(typeof s.fxShake==='boolean') gs.fxShake=s.fxShake;
    if(typeof s.fxParticles==='boolean') gs.fxParticles=s.fxParticles;
    if(typeof s.vibration==='boolean') gs.vibration=s.vibration;
    if(s.viewMode==='2d' || s.viewMode==='3d') gs.viewMode=s.viewMode;
    else if(typeof s.view3d==='boolean') gs.viewMode=s.view3d?'3d':'2d';
    else if(typeof isTouchDevice==='function' && isTouchDevice()) gs.viewMode='2d';
    // Guard against out-of-range or still-locked saved characters
    if(gs.character<0 || gs.character>=CHARACTERS.length || !isCharUnlocked(gs.character)) gs.character=0;
  }catch(e){}
}
function saveGame(){
  try{
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      highScore:gs.highScore, worldUnlocked:gs.worldUnlocked,
      levelDone:gs.levelDone,
      levelStarsBest:gs.levelStarsBest, levelBestTime:gs.levelBestTime,
      kartBest:gs.kartBest, sound:audio.sound, music:audio.music,
      character:gs.character, difficulty:gs.difficulty,
      wallet:gs.wallet, bonusLives:gs.bonusLives, magnet:gs.magnet,
      bought:gs.bought, ach:gs.ach,
      fxShake:gs.fxShake, fxParticles:gs.fxParticles, vibration:gs.vibration,
      viewMode:gs.viewMode
    }));
  }catch(e){}
}
function resetProgress(){
  gs.highScore=0;
