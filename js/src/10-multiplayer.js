// === 10-multiplayer.js — PeerJS P2P online multiplayer ===
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

// ── Scene transitions ────────────────────────────────────────────────────────
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

// ── Multiplayer online (PeerJS P2P) ──────────────────────────────────────────
const PEER_SERVER = {
  host: '0.peerjs.com',
  port: 443,
  path: '/',
  secure: true,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' },
    ],
  },
};

const mp = {
  active:false, role:null, peer:null, conn:null,
  roomCode:'', connected:false, status:'', errMsg:'',
  remote:null, remoteChar:1, remoteName:'Amigo',
  syncAcc:0, pingAcc:0, joinBuf:'', autoJoin:false, menuSel:0, createT:0,
  gameMode:'platformer',
  joinAttempt:0, joinTimer:null, sendQueue:[], lastPong:0,
};

function mpGenCode(){
  const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s=''; for(let i=0;i<6;i++) s+=c[(Math.random()*c.length)|0];
  return s;
}

function mpClearJoinTimer(){
  if(mp.joinTimer){ clearTimeout(mp.joinTimer); mp.joinTimer=null; }
}

function mpDisconnect(){
  mpClearJoinTimer();
  mp.active=false; mp.connected=false; mp.remote=null; mp.role=null;
  mp.roomCode=''; mp.status=''; mp.errMsg='';
  mp.joinAttempt=0; mp.sendQueue.length=0;
  mp.gameMode='platformer';
  if(mp.conn){ try{mp.conn.close();}catch(e){} mp.conn=null; }
  if(mp.peer){ try{mp.peer.destroy();}catch(e){} mp.peer=null; }
}

function mpFlushQueue(){
  if(!mp.conn||!mp.connected) return;
  while(mp.sendQueue.length){
    try{ mp.conn.send(mp.sendQueue.shift()); }catch(e){ break; }
  }
}

function mpSend(obj){
  if(!mp.conn) return;
  const data = JSON.stringify(obj);
  if(!mp.connected){ mp.sendQueue.push(data); return; }
  try{ mp.conn.send(data); }catch(e){ mp.sendQueue.push(data); }
}

function mpInviteUrl(){
  const u=new URL(location.href);
  u.searchParams.set('sala', mp.roomCode);
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

function mpPeerError(err){
  const type = err && err.type ? err.type : '';
  if(type==='unavailable-id'){
    mp.errMsg='Codigo en uso — crea otra sala';
  } else if(type==='network' || type==='server-error'){
    mp.errMsg='Error de red — revisa internet e intenta de nuevo';
  } else if(type==='peer-unavailable'){
    mp.errMsg='Sala no encontrada — revisa el codigo';
  } else {
    mp.errMsg='Error de conexion — reintenta';
  }
  mp.status='Desconectado';
}

function mpSetupConn(conn){
  conn.on('open', ()=>{
    mp.connected=true;
    mp.joinAttempt=0;
    mpClearJoinTimer();
    mp.status=mp.role==='host' ? 'Amigo conectado!' : 'Conectado al anfitrion';
    mp.errMsg='';
    mpSend({t:'hi', char:gs.character, name:(CHARACTERS[gs.character]||CHARACTERS[0]).name, mode:mp.gameMode});
    mpFlushQueue();
    if(mp.role==='host') mpHostBroadcast();
    if(mp.role==='guest') mpSend({t:'sync_req'});
    unlockAch('coop');
    sfx.star();
  });
  conn.on('data', d=>{
    try{
      const msg = typeof d === 'string' ? JSON.parse(d) : d;
      mpHandle(msg);
    }catch(e){}
  });
  conn.on('close', ()=>{
    mp.connected=false;
    mp.status=mp.role==='host' ? 'Amigo desconectado' : 'Desconectado del anfitrion';
    mp.remote=null;
    mp.sendQueue.length=0;
  });
  conn.on('error', ()=>{
    if(mp.role==='guest' && !mp.connected) return;
    mp.connected=false;
    mp.status='Error en la conexion';
  });
}

function mpHostCreate(){
  if(typeof Peer==='undefined'){ mp.errMsg='PeerJS no cargo — revisa internet'; return; }
  mpDisconnect();
  mp.active=true; mp.role='host'; mp.roomCode=mpGenCode();
  mp.status='Creando sala...';
  const peerId='sbear-'+mp.roomCode;
  mp.peer=new Peer(peerId, PEER_SERVER);
  mp.peer.on('open', ()=>{ mp.status='Codigo: '+mp.roomCode+' — esperando amigo'; });
  mp.peer.on('connection', conn=>{
    if(mp.conn && mp.conn.open){
      try{ mp.conn.close(); }catch(e){}
    }
    mp.conn=conn;
    mpSetupConn(conn);
  });
  mp.peer.on('error', err=>{
    if(err && err.type==='unavailable-id'){
      mp.roomCode=mpGenCode();
      try{ mp.peer.destroy(); }catch(e){}
      mp.peer=new Peer('sbear-'+mp.roomCode, PEER_SERVER);
      mp.peer.on('open', ()=>{ mp.status='Codigo: '+mp.roomCode; });
      mp.peer.on('connection', conn=>{ mp.conn=conn; mpSetupConn(conn); });
      mp.peer.on('error', e=>mpPeerError(e));
      return;
    }
    mpPeerError(err);
  });
}

function mpGuestTryConnect(code, attempt){
  if(!mp.active || mp.role!=='guest') return;
  mp.joinAttempt=attempt;
  if(attempt>10){
    mp.errMsg='No se pudo conectar. Verifica el codigo y que el anfitrion tenga la sala abierta.';
    mp.status='Fallo de conexion';
    return;
  }
  mp.status='Conectando a '+code+'... ('+(attempt+1)+'/10)';
  mpClearJoinTimer();
  let conn;
  try{
    conn=mp.peer.connect('sbear-'+code, { reliable:true, serialization:'json' });
  }catch(e){
    mp.joinTimer=setTimeout(()=>mpGuestTryConnect(code, attempt+1), 2000);
    return;
  }
  mp.conn=conn;
  mpSetupConn(conn);
  mp.joinTimer=setTimeout(()=>{
    if(!mp.connected && mp.active && mp.role==='guest'){
      try{ conn.close(); }catch(e){}
      mpGuestTryConnect(code, attempt+1);
    }
  }, 4500);
}

function mpGuestJoin(code){
  if(typeof Peer==='undefined'){ mp.errMsg='PeerJS no cargo — revisa internet'; return; }
  code=(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
  if(code.length<6){ mp.errMsg='Codigo de 6 caracteres'; return; }
  mpDisconnect();
  mp.active=true; mp.role='guest'; mp.roomCode=code;
  mp.status='Iniciando conexion...'; mp.errMsg='';
  mp.peer=new Peer(undefined, PEER_SERVER);
  mp.peer.on('open', ()=>{ mpGuestTryConnect(code, 0); });
  mp.peer.on('error', err=>mpPeerError(err));
}

function mpHostBroadcast(){
  if(!mp.active||mp.role!=='host'||!mp.connected) return;
  const syncScenes=['worldmap','gameplay','pause','levelcomplete','gameover','victory','charselect',
    'kartlobby','kart','kartresults','kartcupresults'];
  if(!syncScenes.includes(gs.scene)) return;
  const payload={t:'scene', scene:gs.scene, world:gs.world, level:gs.level,
    lives:gs.lives, score:gs.score, coins:gs.coins, wmSel, wmLvl, char:gs.character,
    kartTrack:kartTrackSel, mode:mp.gameMode};
  if(gs.scene==='kart' && race){
    payload.kartPhase=race.phase;
    payload.kartCd=race.countdown;
    payload.kartTr=kartTrackSel;
  }
  mpSend(payload);
}

function mpEnsureKartRace(msg){
  if(typeof msg.kartTrack==='number') kartTrackSel=msg.kartTrack;
  if(typeof msg.kartTr==='number') kartTrackSel=msg.kartTr;
  if(!race) startKartRace(false);
  if(race){
    if(typeof msg.kartCd==='number') race.countdown=msg.kartCd;
    if(msg.kartPhase) race.phase=msg.kartPhase;
  }
}

function mpApplyScene(msg){
  if(mp.role!=='guest') return;
  if(['mpcreate','mpjoin','multimenu','menu','kartmenu','kartcreate','kartjoin'].includes(msg.scene)) return;
  if(msg.mode==='kart' || msg.mode==='platformer') mp.gameMode=msg.mode;
  if(typeof msg.lives==='number') gs.lives=msg.lives;
  if(typeof msg.score==='number') gs.score=msg.score;
  if(typeof msg.coins==='number') gs.coins=msg.coins;
  if(typeof msg.wmSel==='number') wmSel=msg.wmSel;
  if(typeof msg.wmLvl==='number') wmLvl=msg.wmLvl;
  if(typeof msg.kartTrack==='number') kartTrackSel=msg.kartTrack;

  if(msg.scene==='kart' || msg.scene==='kartlobby'){
    if(typeof msg.kartTrack==='number') kartTrackSel=msg.kartTrack;
    if(msg.scene==='kart'){
      mpEnsureKartRace(msg);
      if(gs.scene!=='kart') changeScene('kart', true);
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
  if(!msg || !msg.t) return;
  switch(msg.t){
    case 'hi':
      mp.remoteChar=msg.char??1;
      mp.remoteName=msg.name||'Amigo';
      if(msg.mode) mp.gameMode=msg.mode;
      if(mp.role==='host') mpHostBroadcast();
      break;
    case 'sync_req':
      if(mp.role==='host') mpHostBroadcast();
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
      if(mp.role==='guest'){
        if(!race && typeof msg.tr==='number'){
          kartTrackSel=msg.tr;
          startKartRace(false);
        }
        kartGuestApplyState(msg);
      }
      break;
    case 'ki':
      if(mp.role==='host') kartApplyGuestInput(msg);
      break;
    case 'ping':
      mpSend({t:'pong', ts:msg.ts});
      break;
    case 'pong':
      mp.lastPong=Date.now();
      break;
  }
}

function mkRemotePlayer(){
  return {x:140,y:570,tx:140,ty:570,vx:0,vy:0,facing:-1,w:PLAYER_W,h:PLAYER_H,char:1,inv:0,shield:0};
}

function mpTick(dt){
  if(!mp.active||!mp.connected) return;

  mp.pingAcc+=dt;
  if(mp.pingAcc>=4){
    mp.pingAcc=0;
    mpSend({t:'ping', ts:Date.now()});
  }

  if(gs.scene==='kart') return;

  mp.syncAcc+=dt;
  if(mp.syncAcc>=0.05 && player && gs.scene==='gameplay'){
    mp.syncAcc=0;
    mpSend({t:'pos', x:player.x, y:player.y, vx:player.vx, vy:player.vy,
      facing:player.facing, char:gs.character,
      inv:player.invTimer>0?1:0, sh:player.shieldTimer>0?1:0});
  }
  if(mp.remote){
    mp.remote.x=lerp(mp.remote.x, mp.remote.tx, 0.38);
    mp.remote.y=lerp(mp.remote.y, mp.remote.ty, 0.38);
  }
}
