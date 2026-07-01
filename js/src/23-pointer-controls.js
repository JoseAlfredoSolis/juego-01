// ── Pointer / mouse / touch-screen movement (gameplay + kart) ───────────────
const ptrCtl = { active: false, id: null };

function ptrGameActive() {
  return typeof camOrbitPlayActive === 'function' && camOrbitPlayActive();
}

function ptrCanvasCoords(e) {
  if (typeof camOrbitScreenCoords === 'function') return camOrbitScreenCoords(e);
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

function ptrCtlOnDown(e, p) {
  ptrCtl.active = true;
  ptrCtl.id = e.pointerId;
  canvas.setPointerCapture?.(e.pointerId);
  ptrApplyAxes(p.x, p.y);
  audioInit();
  e.preventDefault();
}

function ptrCtlOnMove(e) {
  if (!ptrCtl.active || ptrCtl.id !== e.pointerId) return;
  const p = ptrCanvasCoords(e);
  ptrApplyAxes(p.x, p.y);
  e.preventDefault();
}

function ptrCtlOnEnd(e) {
  if (!ptrCtl.active || ptrCtl.id !== e.pointerId) return;
  ptrCtl.active = false;
  ptrCtl.id = null;
  ptrReleaseAll();
  canvas.releasePointerCapture?.(e.pointerId);
  e.preventDefault();
}

function ptrCtlFrameSync() {
  if (!ptrGameActive() && ptrCtl.active) {
    ptrCtl.active = false;
    ptrCtl.id = null;
    ptrReleaseAll();
  }
  if (typeof camOrbitFrameSync === 'function') camOrbitFrameSync();
}

function setupPointerControls() {
  setupCameraOrbit();
}
