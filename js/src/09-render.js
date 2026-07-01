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
  const lx = fast ? 0.38 : dx > 90 ? 0.3 : dx > 30 ? 0.24 : 0.19;
  const ly = dy > 60 ? 0.28 : dy > 18 ? 0.22 : 0.17;
  cam.x = lerp(cam.x, tx, lx);
  cam.y = lerp(cam.y, ty, ly);
}

// ── Drawing Helpers ────────────────────────────────────────────────────────
let ctx;
function rect(x,y,w,h,c) { ctx.fillStyle=c; ctx.fillRect(x-cam.x,y-cam.y,w,h); }
function rectS(x,y,w,h,c,lw=2) { ctx.strokeStyle=c; ctx.lineWidth=lw; ctx.strokeRect(x-cam.x+0.5,y-cam.y+0.5,w-1,h-1); }
function text(str,x,y,c,size=20,align='left') {
  ctx.fillStyle=c; ctx.font=`bold ${size}px monospace`; ctx.textAlign=align; ctx.fillText(str,x,y);
}
function hud(str,x,y,c,size=20,align='left') { // HUD coords (no cam offset)
  ctx.fillStyle=c; ctx.font=`bold ${size}px monospace`; ctx.textAlign=align; ctx.fillText(str,x,y);
}

// ── UI Kit (menus, HUD, panels) ─────────────────────────────────────────────
const UI = { gold:'#FFD700', green:'#3ecf6e', red:'#ff5a5a', cyan:'#5dd4ff', dim:'#8a9bb0', bright:'#eef4ff',
  panel:'rgba(10,16,26,0.92)', panelBorder:'rgba(255,215,0,0.32)' };
function roundRectPath(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
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
  if(vignette){ const v=ctx.createRadialGradient(W/2,H/2,80,W/2,H/2,Math.max(W,H)*0.72);
    v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,0,0,0.5)'); ctx.fillStyle=v; ctx.fillRect(0,0,W,H); }
}
function uiSparkles(t,n=36){
  for(let i=0;i<n;i++){ const x=(i*173+t*18)%W, y=(i*97+t*12)%H, a=0.12+0.2*Math.sin(t*2.5+i);
    ctx.globalAlpha=a; ctx.fillStyle='#fff'; ctx.fillRect(x,y,2,2); }
  ctx.globalAlpha=1;
}
function uiTitle(str,y,size=48,color=UI.gold){
  ctx.textAlign='center'; ctx.font=`bold ${size}px monospace`;
  ctx.lineWidth=Math.max(3,size/12); ctx.strokeStyle='rgba(0,0,0,0.6)'; ctx.strokeText(str,W/2,y);
  ctx.fillStyle=color; ctx.fillText(str,W/2,y);
}
function uiPanel(x,y,w,h,r=18,bg=UI.panel,border=UI.panelBorder){
  ctx.shadowColor='rgba(0,0,0,0.55)'; ctx.shadowBlur=22; ctx.shadowOffsetY=8;
  fillRR(x,y,w,h,r,bg); ctx.shadowBlur=0; ctx.shadowOffsetY=0; strokeRR(x,y,w,h,r,border,2);
}
function uiMenuRow(label,y,sel,w=340,h=48,rowIdx){
  const port = document.body.classList.contains('touch') && window.innerHeight > window.innerWidth;
  if (port) { h = Math.min(h, 30); w = Math.min(w, 480); }
  const x=W/2-w/2, ty=y-h+16;
  if(sel){ fillRR(x,ty,w,h,'rgba(255,215,0,0.16)',14); strokeRR(x,ty,w,h,UI.gold,14,2); ctx.fillStyle=UI.gold; ctx.font= port?'bold 20px monospace':'bold 26px monospace'; }
  else { fillRR(x,ty,w,h,'rgba(255,255,255,0.05)',12); ctx.fillStyle='#b8c8d8'; ctx.font= port?'20px monospace':'24px monospace'; }
  ctx.textAlign='center'; ctx.fillText(label,W/2,y);
  if(rowIdx!==undefined) mobRegisterRow(x,ty,w,h,rowIdx);
}
function uiListRow(y,label,value,sel,vc,rowIdx){
  const pw=700, ph=52, px=W/2-pw/2;
  fillRR(px,y-36,pw,ph, sel?'rgba(255,215,0,0.12)':'rgba(255,255,255,0.04)',12);
  if(sel) strokeRR(px,y-36,pw,ph,'rgba(255,215,0,0.4)',12,2);
  ctx.textAlign='left'; ctx.font=sel?'bold 24px monospace':'22px monospace';
  ctx.fillStyle=sel?UI.gold:UI.bright; ctx.fillText((sel?'▸ ':'  ')+label, px+22, y);
  if(value!==undefined && value!==''){
    ctx.textAlign='right'; ctx.font='bold 22px monospace'; ctx.fillStyle=vc||UI.bright; ctx.fillText(value, px+pw-22, y);
  }
  if(rowIdx!==undefined) mobRegisterRow(px,y-36,pw,ph,rowIdx);
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
  ctx.font='bold 15px monospace'; ctx.textAlign='left';
  const tw=ctx.measureText(text).width+22; fillRR(x,y-17,tw,30,15,'rgba(0,0,0,0.5)'); strokeRR(x,y-17,tw,30,15,'rgba(255,255,255,0.12)',1);
  ctx.fillStyle=color; ctx.fillText(text,x+11,y+2);
}
function drawHeartIcon(x,y,s,on=true){
  ctx.fillStyle=on?'#ff4d6d':'#3a3040'; ctx.beginPath();
  ctx.moveTo(x,y+s*0.3); ctx.bezierCurveTo(x,y,x-s*0.45,y-s*0.15,x-s*0.45,y+s*0.12);
  ctx.bezierCurveTo(x-s*0.45,y+s*0.5,x,y+s*0.82,x,y+s);
  ctx.bezierCurveTo(x,y+s*0.82,x+s*0.45,y+s*0.5,x+s*0.45,y+s*0.12);
  ctx.bezierCurveTo(x+s*0.45,y-s*0.15,x,y,x,y+s*0.3); ctx.fill();
  if(on){ ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x-s*0.12,y+s*0.15,s*0.12,0,Math.PI*2); ctx.fill(); }
}
