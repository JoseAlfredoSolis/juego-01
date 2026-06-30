// === 10-multiplayer.js (from index.html lines 819-980) ===
  ctx.moveTo(x,y+s*0.3); ctx.bezierCurveTo(x,y,x-s*0.45,y-s*0.15,x-s*0.45,y+s*0.12);
  ctx.bezierCurveTo(x-s*0.45,y+s*0.5,x,y+s*0.82,x,y+s);
  ctx.bezierCurveTo(x,y+s*0.82,x+s*0.45,y+s*0.5,x+s*0.45,y+s*0.12);
  ctx.bezierCurveTo(x+s*0.45,y-s*0.15,x,y,x,y+s*0.3); ctx.fill();
  if(on){ ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x-s*0.12,y+s*0.15,s*0.12,0,Math.PI*2); ctx.fill(); }
}
function drawCoinIcon(x,y,r){
  ctx.fillStyle='#FFD700'; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#a07810'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#7a5500'; ctx.font=`bold ${Math.round(r*1.1)}px monospace`; ctx.textAlign='center'; ctx.fillText('C',x,y+r*0.38);
}
function uiBtn(x,y,w,h,label,sel,color=UI.gold){
  fillRR(x,y,w,h, sel?color:'rgba(255,255,255,0.08)',12);
  strokeRR(x,y,w,h, sel?UI.gold:'rgba(255,255,255,0.2)',12, sel?2:1);
  ctx.fillStyle=sel?'#111':UI.bright; ctx.font=`bold ${sel?22:20}px monospace`; ctx.textAlign='center';
  ctx.fillText(label,x+w/2,y+h/2+7);
}

// ── Scene transitions (fade between screens) ────────────────────────────────
let sceneTrans = { active:false, t:0, dur:0.34, from:'menu', to:'menu', mode:'in' };
function changeScene(next, instant=false){
  if(next===gs.scene && !sceneTrans.active) return;
  if(instant){ gs.scene=next; sceneTrans.active=false; mpHostBroadcast(); return; }
  if(sceneTrans.active) return;
  sceneTrans = { active:true, t:0, dur:0.34, from:gs.scene, to:next, mode:'out' };
}
function updateSceneTrans(dt){
  if(!sceneTrans.active) return;
  sceneTrans.t += dt;
  if(sceneTrans.mode==='out' && sceneTrans.t>=sceneTrans.dur){
    gs.scene=sceneTrans.to; sceneTrans.mode='in'; sceneTrans.t=0;
  } else if(sceneTrans.mode==='in' && sceneTrans.t>=sceneTrans.dur){
    sceneTrans.active=false;
    mpHostBroadcast();
  }
}

// ── Multiplayer online (PeerJS P2P — invitar amigos) ───────────────────────
const mp = {
  active:false, role:null, peer:null, conn:null,
  roomCode:'', connected:false, status:'', errMsg:'',
  remote:null, remoteChar:1, remoteName:'Amigo',
  syncAcc:0, joinBuf:'', autoJoin:false, menuSel:0, createT:0,
  gameMode:'platformer'  // 'platformer' | 'kart'
};
function mpGenCode(){
  const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s=''; for(let i=0;i<6;i++) s+=c[(Math.random()*c.length)|0];
  return s;
}
function mpDisconnect(){
  mp.active=false; mp.connected=false; mp.remote=null; mp.role=null; mp.roomCode=''; mp.status=''; mp.errMsg='';
  mp.gameMode='platformer';
  if(mp.conn){ try{mp.conn.close();}catch(e){} mp.conn=null; }
  if(mp.peer){ try{mp.peer.destroy();}catch(e){} mp.peer=null; }
}
function mpSend(obj){
  if(!mp.conn||!mp.connected) return;
  try{ mp.conn.send(JSON.stringify(obj)); }catch(e){}
}
function mpInviteUrl(){
  const u=new URL(location.href); u.searchParams.set('sala', mp.roomCode);
  if(mp.gameMode==='kart') u.searchParams.set('mode','kart');
  return u.href;
}
async function mpCopyInvite(){
  const url=mpInviteUrl(), txt='Super Bear Adventure — Codigo: '+mp.roomCode+'\n'+url;
  try{
    if(navigator.share) await navigator.share({title:'Super Bear Adventure', text:'Juguemos juntos! Codigo: '+mp.roomCode, url});
    else if(navigator.clipboard) await navigator.clipboard.writeText(txt);
    mp.status='Enlace copiado — envialo a tu amigo';
    sfx.select();
  }catch(e){ mp.status='Codigo: '+mp.roomCode; }
}
function mpSetupConn(conn){
  conn.on('open', ()=>{
    mp.connected=true;
    mp.status=mp.role==='host' ? 'Amigo conectado!' : 'Conectado al anfitrion';
    mpSend({t:'hi', char:gs.character, name:(CHARACTERS[gs.character]||CHARACTERS[0]).name});
    if(mp.role==='host') mpHostBroadcast();
    unlockAch('coop');
    sfx.star();
  });
  conn.on('data', d=>{ try{mpHandle(JSON.parse(d));}catch(e){} });
  conn.on('close', ()=>{ mp.connected=false; mp.status='Amigo desconectado'; mp.remote=null; });
}
function mpHostCreate(){
  if(typeof Peer==='undefined'){ mp.errMsg='PeerJS no cargo — revisa internet'; return; }
  mpDisconnect();
  mp.active=true; mp.role='host'; mp.roomCode=mpGenCode();
  mp.status='Creando sala...';
  mp.peer=new Peer('sbear-'+mp.roomCode);
  mp.peer.on('open', ()=>{ mp.status='Comparte el codigo con tu amigo'; });
  mp.peer.on('connection', conn=>{ mp.conn=conn; mpSetupConn(conn); });
  mp.peer.on('error', ()=>{ mp.errMsg='Error al crear sala — reintenta'; mp.status='Error'; });
}
function mpGuestJoin(code){
  if(typeof Peer==='undefined'){ mp.errMsg='PeerJS no cargo — revisa internet'; return; }
  code=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
  if(code.length<6){ mp.errMsg='Codigo de 6 caracteres'; return; }
  mpDisconnect();
  mp.active=true; mp.role='guest'; mp.roomCode=code;
  mp.status='Conectando a '+code+'...'; mp.errMsg='';
  mp.peer=new Peer();
  mp.peer.on('open', ()=>{
    const conn=mp.peer.connect('sbear-'+code, {reliable:true});
    mp.conn=conn; mpSetupConn(conn);
  });
  mp.peer.on('error', ()=>{ mp.errMsg='No se encontro la sala — revisa el codigo'; mp.status='Error'; });
}
function mpHostBroadcast(){
  if(!mp.active||mp.role!=='host'||!mp.connected) return;
  const syncScenes=['worldmap','gameplay','pause','levelcomplete','gameover','victory','charselect',
    'kartlobby','kart','kartresults'];
  if(!syncScenes.includes(gs.scene)) return;
  const payload={t:'scene', scene:gs.scene, world:gs.world, level:gs.level,
    lives:gs.lives, score:gs.score, coins:gs.coins, wmSel, wmLvl, char:gs.character,
    kartTrack:kartTrackSel};
  if(gs.scene==='kart' && race){
    payload.kartPhase=race.phase; payload.kartCd=race.countdown;
  }
  mpSend(payload);
}
function mpApplyScene(msg){
  if(mp.role!=='guest') return;
  if(['mpcreate','mpjoin','multimenu','menu','kartmenu','kartcreate','kartjoin'].includes(msg.scene)) return;
  if(typeof msg.lives==='number') gs.lives=msg.lives;
  if(typeof msg.score==='number') gs.score=msg.score;
  if(typeof msg.coins==='number') gs.coins=msg.coins;
  if(typeof msg.wmSel==='number') wmSel=msg.wmSel;
  if(typeof msg.wmLvl==='number') wmLvl=msg.wmLvl;
  if(typeof msg.kartTrack==='number') kartTrackSel=msg.kartTrack;
  if(msg.scene==='kart' || msg.scene==='kartlobby'){
    if(typeof msg.kartTrack==='number') kartTrackSel=msg.kartTrack;
    if(msg.scene==='kart' && gs.scene!=='kart'){
      startKartRace(false);
      if(race && typeof msg.kartCd==='number') race.countdown=msg.kartCd;
      if(race && msg.kartPhase) race.phase=msg.kartPhase;
      changeScene('kart', true);
    } else if(msg.scene==='kartlobby' && gs.scene!=='kartlobby'){
      changeScene('kartlobby', true);
    }
    return;
  }
  if(msg.scene==='kartresults' && gs.scene!=='kartresults'){
    changeScene('kartresults', true);
    return;
  }
  if(msg.scene==='gameplay'){
    const need=gs.world!==msg.world||gs.level!==msg.level||gs.scene!=='gameplay';
    gs.world=msg.world; gs.level=msg.level;
    if(need){ startLevel(); changeScene('gameplay', true); }
    else if(gs.scene!=='gameplay') changeScene('gameplay', true);
  } else if(msg.scene && msg.scene!==gs.scene){
    changeScene(msg.scene, true);
  }
}
function mpHandle(msg){
  switch(msg.t){
    case 'hi':
      mp.remoteChar=msg.char??1; mp.remoteName=msg.name||'Amigo';
      break;
    case 'scene':
    case 'sync':
      mpApplyScene(msg);
      break;
    case 'pos':
      if(!mp.remote) mp.remote=mkRemotePlayer();
      mp.remote.tx=msg.x; mp.remote.ty=msg.y;
      mp.remote.vx=msg.vx||0; mp.remote.vy=msg.vy||0;
      mp.remote.facing=msg.facing||1;
      mp.remote.char=msg.char??mp.remoteChar;
      mp.remote.inv=msg.inv||0; mp.remote.shield=msg.sh||0;
      mp.remoteChar=msg.char??mp.remoteChar;
      break;
    case 'ks':
      if(mp.role==='guest') kartGuestApplyState(msg);
      break;
    case 'ki':
      if(mp.role==='host') kartApplyGuestInput(msg);
      break;
  }
}
function mkRemotePlayer(){
  return {x:140,y:570,tx:140,ty:570,vx:0,vy:0,facing:-1,w:PLAYER_W,h:PLAYER_H,char:1,inv:0,shield:0};
}
function mpTick(dt){
  if(!mp.active||!mp.connected) return;
  if(gs.scene==='kart') return;
  mp.syncAcc+=dt;
  if(mp.syncAcc>=0.05 && player && gs.scene==='gameplay'){
    mp.syncAcc=0;
    mpSend({t:'pos', x:player.x, y:player.y, vx:player.vx, vy:player.vy,
      facing:player.facing, char:gs.character,
      inv:player.invTimer>0?1:0, sh:player.shieldTimer>0?1:0});
  }
