// ── Camera orbit / perspective drag (mouse + touch + keyboard) ───────────────
const camOrbit = {
  yaw: 0,
  pitch: 0,
  dist: 0,
  mode: null,
  dragId: null,
  lastX: 0,
  lastY: 0,
  pointers: new Map(),
  keys: { yawL: false, yawR: false, pitchU: false, pitchD: false, zoomIn: false, zoomOut: false },
};

function camOrbitPlayActive() {
  if (gs.scene === 'gameplay') return true;
  return gs.scene === 'kart' && race && (race.phase === 'racing' || race.phase === 'countdown');
}

function camOrbitDragging() {
  return camOrbit.mode === 'camera' && camOrbit.dragId != null;
}

function camOrbitReset() {
  camOrbit.yaw = 0;
  camOrbit.pitch = 0;
  camOrbit.dist = 0;
}

function camOrbitOnDrag(dx, dy) {
  camOrbit.yaw -= dx * 0.009;
  camOrbit.pitch = clamp(camOrbit.pitch - dy * 0.006, -0.55, 1.05);
}

function camOrbitOnZoom(delta) {
  camOrbit.dist = clamp(camOrbit.dist + delta, -12, 28);
}

function camOrbit2DOffset() {
  return { x: camOrbit.yaw * 72, y: camOrbit.pitch * 52 };
}

function camOrbit3DPosition(tx, ty, tz, baseDist, baseHeight) {
  const pitch = clamp(0.32 + camOrbit.pitch, 0.08, 1.25);
  const dist = Math.max(10, baseDist + camOrbit.dist);
  const yaw = camOrbit.yaw;
  return {
    x: tx + Math.sin(yaw) * Math.cos(pitch) * dist,
    y: ty + baseHeight + Math.sin(pitch) * dist,
    z: tz + Math.cos(yaw) * Math.cos(pitch) * dist,
  };
}

function camOrbitScreenCoords(e) {
  const el = (e.currentTarget && e.currentTarget !== document)
    ? e.currentTarget
    : (document.getElementById('three-c') || canvas);
  const rect = el.getBoundingClientRect();
  const scaleX = W / Math.max(1, rect.width);
  const scaleY = H / Math.max(1, rect.height);
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function camOrbitPointerMode(e, cx) {
  if (e.button === 2 || e.button === 1 || (e.buttons & 2) || (e.buttons & 4)) return 'camera';
  if (e.shiftKey || e.altKey || e.ctrlKey) return 'camera';
  if (camOrbit.pointers.size >= 2) return 'camera';
  if (gs.scene === 'kart') {
    if (document.body.classList.contains('touch') && document.body.classList.contains('playing')) {
      return cx < W * 0.55 ? 'move' : 'camera';
    }
    return cx > W * 0.9 ? 'camera' : 'move';
  }
  if (cx < W * 0.34) return 'move';
  if (document.body.classList.contains('touch') && document.body.classList.contains('playing')) return 'camera';
  return 'camera';
}

function camOrbitUpdateKeys(dt) {
  if (!camOrbitPlayActive()) return;
  const k = camOrbit.keys;
  if (k.yawL) camOrbit.yaw += dt * 1.8;
  if (k.yawR) camOrbit.yaw -= dt * 1.8;
  if (k.pitchU) camOrbit.pitch = clamp(camOrbit.pitch + dt * 1.1, -0.55, 1.05);
  if (k.pitchD) camOrbit.pitch = clamp(camOrbit.pitch - dt * 1.1, -0.55, 1.05);
  if (k.zoomIn) camOrbitOnZoom(-dt * 14);
  if (k.zoomOut) camOrbitOnZoom(dt * 14);
}

function camOrbitFrameSync() {
  if (!camOrbitPlayActive()) {
    camOrbit.mode = null;
    camOrbit.dragId = null;
    camOrbit.pointers.clear();
    for (const k of Object.keys(camOrbit.keys)) camOrbit.keys[k] = false;
  }
}

function camOrbitBlockedTarget(t) {
  return t && t.closest && t.closest('#touch .tbtn, #mobNav, #mobMenuHtml, #mpJoinBar, #mpCodeInput, #mpJoinBtn');
}

function camOrbitAttach(el) {
  if (!el || el._camOrbitBound) return;
  el._camOrbitBound = true;
  el.style.touchAction = 'none';

  const onDown = e => {
    if (!camOrbitPlayActive()) return;
    if (camOrbitBlockedTarget(e.target)) return;
    camOrbit.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = camOrbitScreenCoords(e);
    const mode = camOrbitPointerMode(e, p.x);
    if (!mode) return;

    if (mode === 'camera') {
      camOrbit.mode = 'camera';
      camOrbit.dragId = e.pointerId;
      camOrbit.lastX = e.clientX;
      camOrbit.lastY = e.clientY;
      el.setPointerCapture?.(e.pointerId);
      e.preventDefault();
      return;
    }

    if (mode === 'move' && typeof ptrCtlOnDown === 'function') {
      ptrCtlOnDown(e, p);
    }
  };

  const onMove = e => {
    if (camOrbit.pointers.has(e.pointerId)) {
      camOrbit.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }
    if (camOrbit.pointers.size >= 2) {
      camOrbit.mode = 'camera';
      const pts = [...camOrbit.pointers.values()];
      const mx = (pts[0].x + pts[1].x) / 2;
      const my = (pts[0].y + pts[1].y) / 2;
      if (camOrbit.dragId == null) {
        camOrbit.dragId = -1;
        camOrbit.lastX = mx;
        camOrbit.lastY = my;
      } else if (camOrbit.dragId === -1) {
        camOrbitOnDrag(mx - camOrbit.lastX, my - camOrbit.lastY);
        camOrbit.lastX = mx;
        camOrbit.lastY = my;
      }
      e.preventDefault();
      return;
    }

    if (camOrbit.mode === 'camera' && camOrbit.dragId === e.pointerId) {
      camOrbitOnDrag(e.clientX - camOrbit.lastX, e.clientY - camOrbit.lastY);
      camOrbit.lastX = e.clientX;
      camOrbit.lastY = e.clientY;
      e.preventDefault();
      return;
    }

    if (typeof ptrCtlOnMove === 'function') ptrCtlOnMove(e);
  };

  const onEnd = e => {
    camOrbit.pointers.delete(e.pointerId);
    if (ptrCtl.active && ptrCtl.id === e.pointerId && typeof ptrCtlOnEnd === 'function') ptrCtlOnEnd(e);
    if (camOrbit.dragId === e.pointerId) {
      camOrbit.dragId = null;
      camOrbit.mode = null;
    }
    if (camOrbit.pointers.size < 2 && camOrbit.dragId === -1) {
      camOrbit.dragId = null;
      if (!camOrbit.pointers.size) camOrbit.mode = null;
    }
    el.releasePointerCapture?.(e.pointerId);
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onEnd);
  el.addEventListener('pointercancel', onEnd);
  el.addEventListener('contextmenu', e => {
    if (camOrbitPlayActive()) e.preventDefault();
  });
  el.addEventListener('wheel', e => {
    if (!camOrbitPlayActive()) return;
    if (camOrbitBlockedTarget(e.target)) return;
    camOrbitOnZoom(e.deltaY * 0.018);
    e.preventDefault();
  }, { passive: false });
}

function camOrbitBindKeys() {
  if (camOrbit._keysBound) return;
  camOrbit._keysBound = true;
  const map = {
    KeyQ: 'yawL', KeyE: 'yawR',
    KeyR: 'pitchU', KeyF: 'pitchD',
    Minus: 'zoomOut', Equal: 'zoomIn',
    NumpadSubtract: 'zoomOut', NumpadAdd: 'zoomIn',
  };
  window.addEventListener('keydown', e => {
    if (!camOrbitPlayActive()) return;
    const k = map[e.code];
    if (!k) return;
    if (e.target.closest('input, textarea')) return;
    camOrbit.keys[k] = true;
    e.preventDefault();
  });
  window.addEventListener('keyup', e => {
    const k = map[e.code];
    if (k) camOrbit.keys[k] = false;
  });
}

function setupCameraOrbit() {
  camOrbitAttach(canvas);
  camOrbitAttach(document.getElementById('three-c'));
  camOrbitBindKeys();
}
