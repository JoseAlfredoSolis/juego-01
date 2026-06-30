// === 11-physics.js (from index.html lines 981-1005) ===
  if(mp.remote){
    mp.remote.x=lerp(mp.remote.x, mp.remote.tx, 0.38);
    mp.remote.y=lerp(mp.remote.y, mp.remote.ty, 0.38);
  }
}
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
    if(k==='Backspace'){ mp.joinBuf=mp.joinBuf.slice(0,-1); sfx.select(); return; }
    if(k==='Enter' && mp.joinBuf.length===6){ mpGuestJoin(mp.joinBuf); return; }
    if(k.startsWith('Key') && mp.joinBuf.length<6){
      const ch=k.slice(3); if(ch.length===1 && ch>='A' && ch<='Z'){ mp.joinBuf+=ch; sfx.select(); return; }
    }
    if(k.startsWith('Digit') && mp.joinBuf.length<6){ mp.joinBuf+=k.slice(5); sfx.select(); return; }
  }
}
function drawSceneTrans(){
