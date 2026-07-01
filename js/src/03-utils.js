// === 03-utils.js (from index.html lines 20-26) ===
// ── Utilities ─────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rectOverlap(ax,ay,aw,ah, bx,by,bw,bh) {
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

/** App solo móvil (HTML táctil). */
function isMobileApp() {
  return typeof MOBILE_ONLY !== 'undefined' && MOBILE_ONLY;
}

/** Pantalla táctil real, o forzada en modo solo móvil. */
function isTouchDevice() {
  if (isMobileApp()) return true;
  if (navigator.maxTouchPoints > 0) return true;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  return coarse && (noHover || !fine);
}

