// === 11-physics.js — remote player draw, join UI, scene transition draw ─────
function drawRemotePlayer(){
  if(!mp.remote||!mp.connected||gs.scene!=='gameplay') return;
  const rp=mp.remote;
  const x=rp.x-cam.x, y=rp.y-cam.y;
  const fake={facing:rp.facing, shieldTimer:rp.shield?1.5:0, invTimer:rp.inv?0.5:0};
  (CHARACTERS[rp.char]||CHARACTERS[1]).draw(fake, x, y);
  fillRR(x+PLAYER_W/2-28, y-24, 56, 16, 5, 'rgba(0,180,255,0.55)');
  hud(mp.remoteName||'Amigo', x+PLAYER_W/2, y-12, '#fff', 11, 'center');
}
function mpJoinKeys(){
  for(const k in keyDown){
    if(k==='Backspace'){ mp.joinBuf=mp.joinBuf.slice(0,-1); mpCodeInputSet(mp.joinBuf); sfx.select(); return; }
    if(k==='Enter' && mp.joinBuf.length===6){ mpGuestJoin(mp.joinBuf); return; }
    if(k.startsWith('Key') && mp.joinBuf.length<6){
      const ch=k.slice(3); if(ch.length===1 && ch>='A' && ch<='Z'){ mp.joinBuf+=ch; mpCodeInputSet(mp.joinBuf); sfx.select(); return; }
    }
    if(k.startsWith('Digit') && mp.joinBuf.length<6){ mp.joinBuf+=k.slice(5); mpCodeInputSet(mp.joinBuf); sfx.select(); return; }
  }
}
function mpCodeInputSet(val){
  const el=document.getElementById('mpCodeInput');
  if(el && el.value!==val) el.value=val;
}
let mpCodeInputFocused=false;
function mpCodeInputSync(){
  const show=gs.scene==='mpjoin'||gs.scene==='kartjoin';
  const jump=document.getElementById('bJump');
  const sp=document.getElementById('bSp');
  if(jump) jump.textContent=gs.scene==='kart'?'DRIFT':'JUMP';
  if(sp) sp.textContent=gs.scene==='kart'?'ITEM':'SP';
  const el=document.getElementById('mpCodeInput');
  if(!el) return;
  if(show){
    if(el.value!==mp.joinBuf) el.value=mp.joinBuf;
    if(!mpCodeInputFocused){ mpCodeInputFocused=true; setTimeout(()=>el.focus(), 80); }
  } else {
    mpCodeInputFocused=false;
    el.blur();
  }
}
function drawSceneTrans(){
  if(!sceneTrans.active) return;
  const a=sceneTrans.mode==='out' ? sceneTrans.t/sceneTrans.dur : 1-sceneTrans.t/sceneTrans.dur;
  const fade=clamp(a,0,1);
  ctx.fillStyle=`rgba(6,10,18,${fade*0.9})`; ctx.fillRect(0,0,W,H);
  if(fade>0.45 && fade<0.55){
    ctx.strokeStyle=`rgba(255,215,0,${0.25*(1-Math.abs(fade-0.5)*20)})`;
    ctx.lineWidth=2; ctx.strokeRect(W/2-120,H/2-2,240,4);
  }
}
