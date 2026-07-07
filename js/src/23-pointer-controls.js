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

  ptrReleaseAll();

  const midX = W * 0.5;
  if (gs.scene === 'kart') {
    const steerNorm = clamp((cx - midX) / (W * 0.38), -1, 1);
    kartPtrSteer = Math.abs(steerNorm) > 0.1 ? steerNorm : 0;
    if (kartPtrSteer < -0.1) touchPress('ArrowLeft');
    else if (kartPtrSteer > 0.1) touchPress('ArrowRight');
    if (cy > H * 0.76) touchPress('ArrowDown');
    else touchPress('ArrowUp');
    return;
  }

  const deadX = 42;
  if (cx < midX - deadX) touchPress('ArrowLeft');
  else if (cx > midX + deadX) touchPress('ArrowRight');

  if (cy < H * 0.52) touchPress('Space');
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
  if (!ptrCtl.active) kartPtrSteer = 0;
  if (typeof camOrbitFrameSync === 'function') camOrbitFrameSync();
}

function setupPointerControls() {
  setupCameraOrbit();
}
