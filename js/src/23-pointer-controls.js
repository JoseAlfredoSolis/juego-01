// ── Pointer / mouse / touch-screen movement (gameplay + kart) ───────────────
const ptrCtl = { active: false, id: null };

function ptrGameActive() {
  if (gs.scene === 'gameplay') return true;
  return gs.scene === 'kart' && race && (race.phase === 'racing' || race.phase === 'countdown');
}

function ptrCanvasCoords(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = W / Math.max(1, rect.width);
  const scaleY = H / Math.max(1, rect.height);
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function ptrReleaseAll() {
  for (const code of ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyW', 'KeyA', 'KeyD', 'KeyS']) {
    touchRelease(code);
  }
}

function ptrApplyAxes(cx, cy) {
  if (!ptrGameActive()) return;
  const deadX = 42;
  const midX = W * 0.5;

  ptrReleaseAll();

  if (cx < midX - deadX) touchPress('ArrowLeft');
  else if (cx > midX + deadX) touchPress('ArrowRight');

  if (gs.scene === 'kart') {
    if (cy < H * 0.4) touchPress('ArrowUp');
    else if (cy > H * 0.68) touchPress('ArrowDown');
  } else if (cy < H * 0.52) {
    touchPress('Space');
  }
}

function ptrCtlFrameSync() {
  if (!ptrGameActive() && ptrCtl.active) {
    ptrCtl.active = false;
    ptrCtl.id = null;
    ptrReleaseAll();
  }
}

function setupPointerControls() {
  const onDown = e => {
    if (!ptrGameActive()) return;
    if (e.target.closest('#touch .tbtn, #mobNav, #mobMenuHtml, #mpJoinBar')) return;
    ptrCtl.active = true;
    ptrCtl.id = e.pointerId;
    canvas.setPointerCapture?.(e.pointerId);
    const p = ptrCanvasCoords(e);
    ptrApplyAxes(p.x, p.y);
    audioInit();
    e.preventDefault();
  };

  const onMove = e => {
    if (!ptrCtl.active || ptrCtl.id !== e.pointerId) return;
    const p = ptrCanvasCoords(e);
    ptrApplyAxes(p.x, p.y);
    e.preventDefault();
  };

  const onEnd = e => {
    if (!ptrCtl.active || ptrCtl.id !== e.pointerId) return;
    ptrCtl.active = false;
    ptrCtl.id = null;
    ptrReleaseAll();
    canvas.releasePointerCapture?.(e.pointerId);
    e.preventDefault();
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onEnd);
  canvas.addEventListener('pointercancel', onEnd);
}
