// === 08-effects.js (from index.html lines 629-729) ===
  gs.worldUnlocked=freshUnlocked();
  gs.levelDone=freshLevelDone();
  gs.wallet=0; gs.bonusLives=0; gs.magnet=false; gs.bought={}; gs.ach={};
  saveGame();
}
loadSave();

// ── Particles ───────────────────────────────────────────────────────────────
let particles=[];
function spawnParticles(x,y,color,n=8,spd=160){
  if (gs.fxParticles===false) return;
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, s=spd*(0.4+Math.random()*0.6);
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-60,life:0.6+Math.random()*0.3,max:0.9,color,size:3+Math.random()*3});
  }
}
function updateParticles(dt){
  for(const p of particles){ p.vx*=0.92; p.vy+=600*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt; }
  particles=particles.filter(p=>p.life>0);
}
function drawParticles(){
  for(const p of particles){
    ctx.globalAlpha=Math.max(0,p.life/p.max);
    ctx.fillStyle=p.color;
    ctx.fillRect(p.x-cam.x,p.y-cam.y,p.size,p.size);
  }
  ctx.globalAlpha=1;
}

// ── Special-effects (rings, afterimages, sparks, popups) + screen shake/flash ─
let fx=[];            // {kind:'ring'|'after'|'text'|'dust', ...}
let shake=0;          // remaining shake time
let flash=null;       // {color, life, max} full-screen flash
let banner=null;      // {text, color, life, max} big centered announcement
function showBanner(text, color='#FFD700'){ banner={text, color, life:1.9, max:1.9}; }
function spawnRing(x,y,color,maxR=70,life=0.4){ fx.push({kind:'ring',x,y,r:6,maxR,life,max:life,color}); }
function spawnAfterimage(p,color){ fx.push({kind:'after',x:p.x,y:p.y,facing:p.facing,life:0.28,max:0.28,color}); }
function spawnText(x,y,text,color='#fff',size=18){ fx.push({kind:'text',x,y,vy:-46,text,color,size,life:0.8,max:0.8}); }
function spawnDust(x,y,n=8,color='#d9cdb0'){ // ground puff
  for(let i=0;i<n;i++){
    const a=-Math.PI/2 + (Math.random()-0.5)*Math.PI*1.2, s=70+Math.random()*90;
    fx.push({kind:'dust',x,y,vx:Math.cos(a)*s,vy:Math.abs(Math.sin(a))*-s*0.5,life:0.4+Math.random()*0.2,max:0.6,color,size:3+Math.random()*4});
  }
}
function spawnSparks(x,y,color,n=10,spd=320){ // bright fast streaks
  for(let i=0;i<n;i++){
    const a=Math.random()*Math.PI*2, s=spd*(0.5+Math.random()*0.7);
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:0.3+Math.random()*0.25,max:0.55,color,size:2+Math.random()*3});
  }
}
function addShake(t){ if(gs.fxShake!==false) shake=Math.max(shake,t); }
function maybeVibrate(ms){ if(gs.vibration!==false && navigator.vibrate) try{ navigator.vibrate(ms); }catch(e){} }
function addFlash(color,life=0.18){ flash={color,life,max:life}; }
function updateFx(dt){
  for(const e of fx){
    e.life-=dt;
    if(e.kind==='ring') e.r += (e.maxR-e.r)*Math.min(1,dt*10);
    else if(e.kind==='text'){ e.y+=e.vy*dt; e.vy*=0.94; }
    else if(e.kind==='dust'){ e.x+=e.vx*dt; e.y+=e.vy*dt; e.vy+=300*dt; e.vx*=0.9; }
  }
  fx=fx.filter(e=>e.life>0);
  if(shake>0) shake-=dt;
  if(flash){ flash.life-=dt; if(flash.life<=0) flash=null; }
  if(banner){ banner.life-=dt; if(banner.life<=0) banner=null; }
}
function drawFx(){
  for(const e of fx){
    const a=Math.max(0,e.life/e.max);
    if(e.kind==='ring'){
      ctx.globalAlpha=a;
      ctx.strokeStyle=e.color; ctx.lineWidth=4;
      ctx.beginPath(); ctx.arc(e.x-cam.x, e.y-cam.y, e.r, 0, Math.PI*2); ctx.stroke();
    } else if(e.kind==='after'){
      ctx.globalAlpha=a*0.45;
      ctx.fillStyle=e.color;
      ctx.fillRect(e.x-cam.x, e.y-cam.y, PLAYER_W, PLAYER_H);
    } else if(e.kind==='dust'){
      ctx.globalAlpha=a*0.7;
      ctx.fillStyle=e.color;
      ctx.fillRect(e.x-cam.x, e.y-cam.y, e.size, e.size);
    } else if(e.kind==='text'){
      ctx.globalAlpha=Math.min(1,a*1.4);
      ctx.fillStyle=e.color; ctx.font=`bold ${e.size}px monospace`; ctx.textAlign='center';
      ctx.lineWidth=3; ctx.strokeStyle='rgba(0,0,0,0.6)';
      ctx.strokeText(e.text, e.x-cam.x, e.y-cam.y);
      ctx.fillText(e.text, e.x-cam.x, e.y-cam.y);
    }
  }
  ctx.globalAlpha=1;
}
function drawFlash(){ // screen-space; call after camera restore
  if(!flash) return;
  ctx.globalAlpha=Math.max(0,flash.life/flash.max)*0.5;
  ctx.fillStyle=flash.color; ctx.fillRect(0,0,W,H);
  ctx.globalAlpha=1;
}
function drawBanner(){ // screen-space announcement (e.g. boss defeated)
  if(!banner) return;
  const a=banner.life/banner.max, t=1-a;
  const scale=0.6 + Math.min(1,t*5)*0.5 + Math.sin(banner.life*9)*0.02;
  ctx.save();
  ctx.globalAlpha=Math.min(1,a*2.2);
  ctx.translate(W/2,180); ctx.scale(scale,scale);
