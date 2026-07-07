#!/usr/bin/env python3
"""Bundle js/src/*.js into js/game.js and sync version markers for deploy/cache."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "js" / "src"
BUNDLE = ROOT / "js" / "game.js"
CONSTANTS = SRC / "01-constants.js"
INDEX = ROOT / "index.html"
SW = ROOT / "sw.js"


def read_version():
    text = CONSTANTS.read_text(encoding="utf-8")
    m = re.search(r"const GAME_VERSION = '([^']+)'", text)
    if not m:
        raise SystemExit(f"GAME_VERSION not found in {CONSTANTS}")
    return m.group(1)


def sync_version_markers(version):
    idx = INDEX.read_text(encoding="utf-8")
    idx = re.sub(r"window\.__APP_BUILD__\s*=\s*'[^']+'", f"window.__APP_BUILD__='{version}'", idx)
    idx = re.sub(r'js/game\.js\?v=\d+', f'js/game.js?v={version[1:]}', idx)
    if "window.__APP_BUILD__" not in idx:
        idx = idx.replace(
            '<script src="vendor/peer.min.js"></script>',
            f"<script>window.__APP_BUILD__='{version}';</script>\n<script src=\"vendor/peer.min.js\"></script>",
        )
    INDEX.write_text(idx, encoding="utf-8")

    sw = SW.read_text(encoding="utf-8")
    sw = re.sub(r"const CACHE = 'super-bear-[^']+'", f"const CACHE = 'super-bear-{version}'", sw)
    sw = re.sub(r"const SW_VERSION = '[^']+'", f"const SW_VERSION = '{version}'", sw)
    if "SW_VERSION" not in sw:
        sw = sw.replace(
            "const CACHE = ",
            f"const SW_VERSION = '{version}';\nconst CACHE = ",
        )
    SW.write_text(sw, encoding="utf-8")


def bundle():
    files = sorted(SRC.glob("*.js"))
    if not files:
        raise SystemExit(f"No source files in {SRC}")
    parts = [f.read_text(encoding="utf-8") for f in files]
    BUNDLE.write_text("\n\n".join(parts), encoding="utf-8")
    return len(files)


def main():
    version = read_version()
    sync_version_markers(version)
    n = bundle()
    print(f"Bundled {n} files -> {BUNDLE} ({BUNDLE.stat().st_size} bytes), version {version}")


if __name__ == "__main__":
    main()
