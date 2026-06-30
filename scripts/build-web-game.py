#!/usr/bin/env python3
"""Bundle js/src/*.js into js/game.js for deployment."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "js" / "src"
BUNDLE = ROOT / "js" / "game.js"

files = sorted(SRC.glob("*.js"))
if not files:
    raise SystemExit(f"No source files in {SRC}")

parts = [f.read_text(encoding="utf-8") for f in files]
BUNDLE.write_text("\n\n".join(parts), encoding="utf-8")
print(f"Bundled {len(files)} files -> {BUNDLE} ({BUNDLE.stat().st_size} bytes)")
