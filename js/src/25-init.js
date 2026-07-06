// ── Boot: touch UI + game loop (must run after all modules load) ─────────────
setupTouch();
setupPointerControls();
setupMobileUi();
mobUiSync();
resize();

(function () {
  const params = new URLSearchParams(location.search);
  const code = params.get('sala');
  if (code) {
    mp.joinBuf = code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (mp.joinBuf.length === 6) {
      mp.autoJoin = true;
      if (params.get('mode') === 'kart') {
        mp.gameMode = 'kart';
        gs.scene = 'kartjoin';
      } else gs.scene = 'mpjoin';
    }
  }
})();

gameTestInstall();
requestAnimationFrame(loop);
