// === 02-input.js (from index.html lines 12-19) ===
// ── Input ──────────────────────────────────────────────────────────────────
const keys = {}, keyDown = {}, keyUp = {};
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  audioInit(); if (!keys[e.code]) keyDown[e.code] = true; keys[e.code] = true; e.preventDefault();
});
document.addEventListener('keyup', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  keys[e.code] = false; keyUp[e.code] = true;
});
function clearFrame() { for (const k in keyDown) delete keyDown[k]; for (const k in keyUp) delete keyUp[k]; }
function pressed(c) { return !!keyDown[c]; }
function held(c)    { return !!keys[c]; }

