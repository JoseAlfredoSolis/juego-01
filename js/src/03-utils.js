// === 03-utils.js (from index.html lines 20-26) ===
// ── Utilities ─────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function rectOverlap(ax,ay,aw,ah, bx,by,bw,bh) {
  return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by;
}

/** Pantalla táctil real (evita falsos positivos de ontouchstart en PC). */
function isTouchDevice() {
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const fine = window.matchMedia('(pointer: fine)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  return coarse && (noHover || !fine);
}
