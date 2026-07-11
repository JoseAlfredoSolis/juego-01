// === 09-render.js — camera, HUD, UI kit ─────────────────────────────────────
const cam = { x:0, y:0 };
const CAM_CFG = {
  anchorY: 0.62,
  leadX: 30,
  leadVel: 0.055,
  yLead: 0.065,
  yLeadMax: 42,
  yMin: -120,
};

function camUpdate(px, py, levelW, snap=false, p=null, levelH=720) {
  const pcx = px + (p ? p.w : PLAYER_W) / 2;
  const pcy = py + (p ? p.h : PLAYER_H) / 2;

  let anchorX = 0.5;
  let leadX = 0, leadY = 0;
  if (p) {
    const moveDir = Math.abs(p.vx || 0) > 20 ? Math.sign(p.vx) : p.facing;
    anchorX = moveDir > 0 ? 0.38 : 0.62;
    leadX = moveDir * CAM_CFG.leadX + (p.vx || 0) * CAM_CFG.leadVel;
    if (!p.onGround) {
      const vy = p.vy || 0;
      leadY = clamp(vy * CAM_CFG.yLead, -CAM_CFG.yLeadMax, CAM_CFG.yLeadMax);
      if (vy < -180) leadY -= 18;
      if (vy > 200) leadY += 14;
    }
  }

  const maxCamY = Math.max(0, levelH - H);
  const tx = clamp(pcx - W * anchorX + leadX, 0, Math.max(0, levelW - W));
  const ty = clamp(pcy - H * CAM_CFG.anchorY + leadY, CAM_CFG.yMin, maxCamY);

  if (snap) { cam.x = tx; cam.y = ty; return; }

  const dx = Math.abs(tx - cam.x), dy = Math.abs(ty - cam.y);
  const fast = p && (p.dashTimer > 0 || Math.abs(p.vx || 0) > 200);
  const off = typeof camOrbit2DOffset === 'function' ? camOrbit2DOffset() : { x: 0, y: 0 };
  const orbiting = typeof camOrbitDragging === 'function' && camOrbitDragging();
  const lx = orbiting ? 0.45 : (fast ? 0.38 : dx > 90 ? 0.3 : dx > 30 ? 0.24 : 0.19);
  const ly = orbiting ? 0.45 : (dy > 60 ? 0.28 : dy > 18 ? 0.22 : 0.17);
  cam.x = lerp(cam.x, tx + off.x, lx);
  cam.y = lerp(cam.y, ty + off.y, ly);
}

// ── Drawing Helpers ────────────────────────────────────────────────────────
let ctx;
function rect(x,y,w,h,c) { ctx.fillStyle=c; ctx.fillRect(x-cam.x,y-cam.y,w,h); }
function rectS(x,y,w,h,c,lw=2) { ctx.strokeStyle=c; ctx.lineWidth=lw; ctx.strokeRect(x-cam.x+0.5,y-cam.y+0.5,w-1,h-1); }
function text(str,x,y,c,size=20,align='left') {
  ctx.fillStyle=c; ctx.font=`bold ${size}px ${UI.font}`; ctx.textAlign=align; ctx.fillText(str,x,y);
}
function hud(str,x,y,c,size=20,align='left') { // HUD coords (no cam offset)
  ctx.fillStyle=c; ctx.font=`bold ${size}px ${UI.font}`; ctx.textAlign=align; ctx.fillText(str,x,y);
}

// ── UI Kit (menus, HUD, panels) — arcade / playable ─────────────────────────
const UI = {
  gold:'#FFD700', green:'#3ecf6e', red:'#ff5a5a', cyan:'#5dd4ff', dim:'#8a9bb0', bright:'#eef4ff',
  panel:'rgba(8,14,24,0.88)', panelBorder:'rgba(255,215,0,0.38)',
  ink:'#0b1220', accent:'#ffb020', mint:'#7dffb3',
  font: '"Fredoka", "Nunito", "Segoe UI", system-ui, sans-serif',
  mono: 'ui-monospace, "Cascadia Code", monospace',
};
const UI_THEMES = {
  forest:  { c1:'#062416', c2:'#145a28', accent:'#ffd24a', particle:'leaf' },
  race:    { c1:'#14082a', c2:'#3a1860', accent:'#ff7ad9', particle:'spark' },
  shop:    { c1:'#1a0c28', c2:'#3a2048', accent:'#ffd24a', particle:'coin' },
  ocean:   { c1:'#042438', c2:'#0a5a78', accent:'#7dffb3', particle:'bubble' },
  night:   { c1:'#081018', c2:'#142438', accent:'#5dd4ff', particle:'star' },
  danger:  { c1:'#280808', c2:'#5a1010', accent:'#ff6a6a', particle:'ember' },
  victory: { c1:'#102848', c2:'#3a2060', accent:'#ffd24a', particle:'confetti' },
  pom:     { c1:'#2a1810', c2:'#6a4020', accent:'#ffc878', particle:'spark' },
};

function roundRectPath(x,y,w,h,r){
  r=Math.min(Math.max(0, +r || 0),w/2,h/2);
  ctx.beginPath(); ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+h-r);
  ctx.arcTo(x+w,y+h,x+w-r,y+h,r); ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r); ctx.lineTo(x,y+r);
  ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}
function fillRR(x,y,w,h,r,c){ roundRectPath(x,y,w,h,r); ctx.fillStyle=c; ctx.fill(); }
function strokeRR(x,y,w,h,r,c,lw=2){ roundRectPath(x,y,w,h,r); ctx.strokeStyle=c; ctx.lineWidth=lw; ctx.stroke(); }

function uiBgGrad(c1,c2,vignette=true){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,c1); g.addColorStop(1,c2);
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  if(vignette){ const v=ctx.createRadialGradient(W/2,H*0.42,60,W/2,H/2,Math.max(W,H)*0.78);
    v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,0.55)'); ctx.fillStyle=v; ctx.fillRect(0,0,W,H); }
}

function uiSparkles(t,n=36){
  for(let i=0;i<n;i++){
    const x=(i*173+t*22)%W, y=(i*97+t*14)%H;
    const a=0.14+0.22*Math.sin(t*2.8+i);
    const s=1+(i%3);
    ctx.globalAlpha=a; ctx.fillStyle='#fff';
    ctx.fillRect(x,y,s,s);
  }
  ctx.globalAlpha=1;
}

function uiPlayParticles(t, kind='spark', n=28) {
  for (let i = 0; i < n; i++) {
    const x = (i * 179 + t * (kind === 'bubble' ? 12 : 28) + Math.sin(t + i) * 8) % W;
    const y = (i * 101 + t * (kind === 'bubble' || kind === 'leaf' ? -18 : 16) + H) % H;
    const a = 0.18 + 0.25 * Math.sin(t * 2.2 + i * 0.7);
    ctx.globalAlpha = a;
    if (kind === 'coin') {
      ctx.fillStyle = UI.gold;
      ctx.beginPath(); ctx.arc(x, y, 3 + (i % 2), 0, Math.PI * 2); ctx.fill();
    } else if (kind === 'leaf') {
      ctx.fillStyle = i % 2 ? '#6fd36a' : '#c8e86a';
      ctx.save(); ctx.translate(x, y); ctx.rotate(t + i);
      ctx.fillRect(-4, -1.5, 8, 3); ctx.restore();
    } else if (kind === 'bubble') {
      ctx.strokeStyle = 'rgba(160,230,255,0.85)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, 3 + (i % 4), 0, Math.PI * 2); ctx.stroke();
    } else if (kind === 'ember') {
      ctx.fillStyle = i % 2 ? '#ff7a3a' : '#ffd24a';
      ctx.fillRect(x, y, 2 + (i % 2), 2 + (i % 3));
    } else if (kind === 'confetti') {
      ctx.fillStyle = [UI.gold, UI.cyan, UI.green, '#ff7ad9', '#fff'][i % 5];
      ctx.fillRect(x, y, 5, 5);
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(x, y, 2, 2);
    }
  }
  ctx.globalAlpha = 1;
}

function uiHills(t, color='rgba(0,0,0,0.22)', amp=40, yBase) {
  const base = yBase == null ? H * 0.72 : yBase;
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 24) {
    const y = base + Math.sin(x * 0.008 + t * 0.35) * amp + Math.sin(x * 0.02 + t) * (amp * 0.35);
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W, H); ctx.closePath();
  ctx.fillStyle = color; ctx.fill();
}

function uiPlayBg(themeKey, t, vignette=true) {
  const th = UI_THEMES[themeKey] || UI_THEMES.forest;
  uiBgGrad(th.c1, th.c2, false);
  // soft radial spotlight behind content
  const spot = ctx.createRadialGradient(W * 0.5, H * 0.28, 40, W * 0.5, H * 0.4, Math.max(W, H) * 0.55);
  spot.addColorStop(0, 'rgba(255,255,255,0.08)');
  spot.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = spot; ctx.fillRect(0, 0, W, H);
  if (themeKey === 'forest' || themeKey === 'pom') {
    uiHills(t * 0.6, 'rgba(0,0,0,0.18)', 48, H * 0.68);
    uiHills(t, 'rgba(0,0,0,0.28)', 36, H * 0.78);
  } else if (themeKey === 'ocean') {
    for (let i = 0; i < 4; i++) {
      const y = H * 0.55 + i * 40 + Math.sin(t * 1.4 + i) * 8;
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#9ef';
      ctx.fillRect(0, y, W, 3);
    }
    ctx.globalAlpha = 1;
  } else if (themeKey === 'race') {
    // speed lines
    for (let i = 0; i < 18; i++) {
      const y = (i * 47 + t * 80) % H;
      ctx.globalAlpha = 0.08 + (i % 3) * 0.03;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, y, W * (0.15 + (i % 5) * 0.08), 2);
    }
    ctx.globalAlpha = 1;
  }
  uiPlayParticles(t, th.particle, themeKey === 'victory' ? 48 : 26);
  if (vignette) {
    const v = ctx.createRadialGradient(W / 2, H * 0.4, 70, W / 2, H / 2, Math.max(W, H) * 0.78);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.52)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }
}

function uiTitle(str,y,size=48,color=UI.gold){
  ctx.textAlign='center'; ctx.font=`900 ${size}px ${UI.font}`;
  ctx.lineWidth=Math.max(4,size/10); ctx.strokeStyle='rgba(0,0,0,0.7)'; ctx.strokeText(str,W/2,y);
  // soft highlight pass
  ctx.fillStyle='rgba(255,255,255,0.18)'; ctx.fillText(str,W/2,y-1);
  ctx.fillStyle=color; ctx.fillText(str,W/2,y);
}

function uiPanel(x,y,w,h,r=18,bg=UI.panel,border=UI.panelBorder){
  // depth plate
  fillRR(x, y + 5, w, h, r, 'rgba(0,0,0,0.35)');
  ctx.shadowColor='rgba(0,0,0,0.45)'; ctx.shadowBlur=18; ctx.shadowOffsetY=6;
  fillRR(x,y,w,h,r,bg); ctx.shadowBlur=0; ctx.shadowOffsetY=0;
  strokeRR(x,y,w,h,r,border,2);
  // inner top sheen
  ctx.globalAlpha = 0.12;
  fillRR(x + 2, y + 2, w - 4, Math.min(28, h * 0.18), r - 2, '#fff');
  ctx.globalAlpha = 1;
}

function uiMenuRow(label,y,sel,w=340,h=48,rowIdx){
  const port = document.body.classList.contains('touch') && window.innerHeight > window.innerWidth;
  if (port) { h = Math.min(h, 34); w = Math.min(w, 480); }
  const x=W/2-w/2, ty=y-h+16;
  const pulse = sel ? (0.92 + Math.sin(performance.now() * 0.008) * 0.08) : 1;
  const lift = sel ? -2 : 0;
  // 3D arcade plate
  fillRR(x, ty + 5 + lift, w, h, 14, sel ? 'rgba(180,120,0,0.55)' : 'rgba(0,0,0,0.35)');
  fillRR(x, ty + lift, w, h, 14, sel ? `rgba(255,215,0,${0.22 * pulse})` : 'rgba(255,255,255,0.07)');
  if (sel) {
    strokeRR(x, ty + lift, w, h, 14, UI.gold, 2.5);
    fillRR(x + 4, ty + 6 + lift, 5, h - 12, 3, UI.gold);
  } else {
    strokeRR(x, ty + lift, w, h, 14, 'rgba(255,255,255,0.12)', 1.5);
  }
  ctx.fillStyle = sel ? UI.gold : '#d5e2ef';
  ctx.font = (sel ? '900 ' : '700 ') + (port ? '18px ' : '22px ') + UI.font;
  ctx.textAlign = 'center';
  ctx.fillText(label, W / 2, y + lift);
  if (rowIdx !== undefined) mobRegisterRow(x, ty + lift, w, h, rowIdx);
}

function uiListRow(y,label,value,sel,vc,rowIdx){
  const pw=700, ph=52, px=W/2-pw/2;
  const lift = sel ? -2 : 0;
  fillRR(px, y - 36 + 4, pw, ph, 14, 'rgba(0,0,0,0.28)');
  fillRR(px, y - 36 + lift, pw, ph, 14, sel ? 'rgba(255,215,0,0.16)' : 'rgba(255,255,255,0.05)');
  if (sel) strokeRR(px, y - 36 + lift, pw, ph, 14, 'rgba(255,215,0,0.55)', 2);
  else strokeRR(px, y - 36 + lift, pw, ph, 14, 'rgba(255,255,255,0.08)', 1);
  ctx.textAlign='left'; ctx.font=(sel?'900 ':'700 ')+'22px '+UI.font;
  ctx.fillStyle=sel?UI.gold:UI.bright; ctx.fillText((sel?'▸ ':'  ')+label, px+22, y + lift);
  if(value!==undefined && value!==''){
    ctx.textAlign='right'; ctx.font='900 20px '+UI.font; ctx.fillStyle=vc||UI.bright; ctx.fillText(value, px+pw-22, y + lift);
  }
  if(rowIdx!==undefined) mobRegisterRow(px,y-36+lift,pw,ph,rowIdx);
}

function uiBar(x,y,w,h,frac,color,bg='#182030'){
  fillRR(x,y,w,h,h/2,bg); if(frac>0) fillRR(x,y,w*clamp(frac,0,1),h,h/2,color);
  strokeRR(x,y,w,h,h/2,'rgba(255,255,255,0.22)',1);
}
function uiFooterY() {
  if (!document.body.classList.contains('touch')) return H - 28;
  if (document.body.classList.contains('mob-menu')) return H - 56;
  return H - 34;
}
function uiFooter(str){ hud(uiFooterTouch(str), W/2, uiFooterY(), UI.dim, document.body.classList.contains('touch')?14:16,'center'); }
function uiPill(x,y,text,color){
  ctx.font='700 14px '+UI.font; ctx.textAlign='left';
  const tw=ctx.measureText(text).width+22; fillRR(x,y-17,tw,30,15,'rgba(0,0,0,0.55)'); strokeRR(x,y-17,tw,30,15,'rgba(255,255,255,0.14)',1);
  ctx.fillStyle=color; ctx.fillText(text,x+11,y+2);
}
function uiWalletBadge(cx, y, amount) {
  const label = '' + amount;
  ctx.font = '900 20px ' + UI.font;
  const tw = ctx.measureText(label).width;
  const w = tw + 54, x = cx - w / 2;
  fillRR(x, y - 20 + 4, w, 40, 20, 'rgba(0,0,0,0.4)');
  fillRR(x, y - 22, w, 44, 22, 'rgba(8,12,20,0.9)');
  strokeRR(x, y - 22, w, 44, 22, 'rgba(255,215,0,0.5)', 2);
  drawCoinIcon(x + 20, y, 12);
  ctx.fillStyle = UI.gold; ctx.textAlign = 'left';
  ctx.fillText(label, x + 38, y + 7);
}
function uiBadge(cx, y, text, color, bg) {
  ctx.font = '800 13px ' + UI.font; ctx.textAlign = 'center';
  const tw = ctx.measureText(text).width + 24, h = 26;
  fillRR(cx - tw / 2, y - h / 2, tw, h, h / 2, bg || 'rgba(0,0,0,0.45)');
  strokeRR(cx - tw / 2, y - h / 2, tw, h, h / 2, color, 1);
  ctx.fillStyle = color; ctx.fillText(text, cx, y + 5);
}
function uiPager(cx, y, index, total) {
  hud((index + 1) + ' / ' + total, cx, y, UI.bright, 17, 'center');
  const bw = Math.min(240, W * 0.35), bx = cx - bw / 2;
  uiBar(bx, y + 12, bw, 7, total > 1 ? (index + 1) / total : 1, UI.gold);
}
function uiGlowCircle(cx, cy, r, color, t) {
  const pulse = 0.88 + Math.sin(t * 3) * 0.12;
  ctx.globalAlpha = 0.28 * pulse;
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(cx, cy, r * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 0.1;
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.4 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1;
}
function uiNavBtn(x, y, w, h, label, active) {
  fillRR(x, y + 3, w, h, 14, 'rgba(0,0,0,0.35)');
  fillRR(x, y, w, h, 14, active ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)');
  strokeRR(x, y, w, h, 14, active ? UI.gold : 'rgba(255,255,255,0.16)', active ? 2 : 1);
  ctx.fillStyle = active ? UI.gold : UI.dim;
  ctx.font = '900 ' + Math.min(32, h - 8) + 'px ' + UI.font; ctx.textAlign = 'center';
  ctx.fillText(label, x + w / 2, y + h / 2 + 10);
}
function uiStatBar(x, y, w, val, label, color) {
  const frac = Math.min(1, Math.max(0.06, (val - 0.8) / 0.6));
  ctx.textAlign = 'left'; ctx.font = '700 13px ' + UI.font; ctx.fillStyle = UI.dim;
  ctx.fillText(label, x, y + 9);
  uiBar(x + 48, y, w - 48, 12, frac, color);
}
function uiClipScroll(x, y, w, h, r, drawFn) {
  ctx.save();
  roundRectPath(x, y, w, h, r);
  ctx.clip();
  drawFn();
  ctx.restore();
  strokeRR(x, y, w, h, r, 'rgba(255,255,255,0.1)', 1);
}
function uiShopCard(x, y, w, h, sel, afford, drawFn) {
  fillRR(x, y + 3, w, h, 14, 'rgba(0,0,0,0.3)');
  fillRR(x, y, w, h, 14, sel ? 'rgba(255,215,0,0.16)' : 'rgba(255,255,255,0.05)');
  if (sel) strokeRR(x, y, w, h, 14, UI.gold, 2);
  else strokeRR(x, y, w, h, 14, afford ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.08)', 1);
  if (drawFn) drawFn(x, y, w, h, sel, afford);
}
function uiMenuTile(x, y, w, h, title, desc, sel, rowIdx) {
  const lift = sel ? -2 : 0;
  fillRR(x, y + 4, w, h, 14, 'rgba(0,0,0,0.3)');
  fillRR(x, y + lift, w, h, 14, sel ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.06)');
  if (sel) {
    strokeRR(x, y + lift, w, h, 14, UI.gold, 2.5);
    fillRR(x, y + lift, 5, h, 4, UI.gold);
  } else strokeRR(x, y + lift, w, h, 14, 'rgba(255,255,255,0.1)', 1);
  ctx.textAlign = 'left';
  ctx.font = (sel ? '900 ' : '800 ') + (sel ? '18px ' : '16px ') + UI.font;
  ctx.fillStyle = sel ? UI.gold : UI.bright;
  ctx.fillText(sel ? '▸ ' + title : '  ' + title, x + 16, y + h / 2 + (desc ? -2 : 6) + lift);
  if (desc) {
    ctx.font = '600 12px ' + UI.font;
    ctx.fillStyle = sel ? 'rgba(255,255,255,0.8)' : UI.dim;
    ctx.fillText(desc, x + 18, y + h - 10 + lift);
  }
  if (rowIdx !== undefined) mobRegisterRow(x, y + lift, w, h, rowIdx);
}
function uiSectionLabel(x, y, text) {
  ctx.textAlign = 'left'; ctx.font = '800 12px ' + UI.font; ctx.fillStyle = UI.cyan;
  ctx.fillText(text.toUpperCase(), x, y);
}

function uiCtaBanner(x, y, w, h, label, t) {
  const pulse = 0.85 + Math.sin((t || performance.now() * 0.001) * 4) * 0.15;
  fillRR(x, y + 4, w, h, 14, 'rgba(0,0,0,0.35)');
  fillRR(x, y, w, h, 14, `rgba(255,215,0,${0.12 + 0.1 * pulse})`);
  strokeRR(x, y, w, h, 14, `rgba(255,215,0,${0.35 + 0.25 * pulse})`, 2);
  hud(label, x + w / 2, y + h / 2 + 6, UI.gold, 16, 'center');
}

function uiIsDesktop() {
  return typeof mobUseDesktopMenu === 'function' && mobUseDesktopMenu();
}

function uiDesktopHeader(title, subtitle) {
  fillRR(0, 0, W, 58, 0, 'rgba(0,0,0,0.5)');
  // accent stripe
  fillRR(0, 56, W, 3, 0, 'rgba(255,215,0,0.35)');
  hud(title, 28, 34, UI.gold, 22, 'left');
  if (subtitle) hud(subtitle, 28, 52, UI.dim, 13, 'left');
  if (typeof GAME_VERSION !== 'undefined') {
    hud(GAME_VERSION, W - 16, 36, 'rgba(255,255,255,0.35)', 13, 'right');
  }
}

function uiDesktopStatusBar() {
  fillRR(0, H - 40, W, 40, 0, 'rgba(0,0,0,0.6)');
  fillRR(0, H - 40, W, 2, 0, 'rgba(255,215,0,0.2)');
  hud('Vidas: ' + gs.lives + '   Monedas: ' + gs.coins + '   Score: ' + gs.score, W / 2, H - 14, UI.bright, 15, 'center');
}
function drawHeartIcon(x,y,s,on=true){
  ctx.fillStyle=on?'#ff4d6d':'#3a3040'; ctx.beginPath();
  ctx.moveTo(x,y+s*0.3); ctx.bezierCurveTo(x,y,x-s*0.45,y-s*0.15,x-s*0.45,y+s*0.12);
  ctx.bezierCurveTo(x-s*0.45,y+s*0.5,x,y+s*0.82,x,y+s);
  ctx.bezierCurveTo(x,y+s*0.82,x+s*0.45,y+s*0.5,x+s*0.45,y+s*0.12);
  ctx.bezierCurveTo(x+s*0.45,y-s*0.15,x,y,x,y+s*0.3); ctx.fill();
  if(on){ ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x-s*0.12,y+s*0.15,s*0.12,0,Math.PI*2); ctx.fill(); }
}
