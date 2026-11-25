"""Gera dist/chathappens-<versão>.zip, pronto para enviar ao Edge, Firefox e Chrome Web Store.

Uso: python3 build.py
"""
import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# Só o que a extensão precisa: nada de README, banner, scripts ou docs.
INCLUDE = ["manifest.json", "content.js", "popup.html", "popup.js", "icons", "_locales"]

version = json.loads((ROOT / "manifest.json").read_text(encoding="utf-8"))["version"]
out = ROOT / "dist" / f"chathappens-{version}.zip"
out.parent.mkdir(exist_ok=True)

with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as z:
    for name in INCLUDE:
        path = ROOT / name
        files = sorted(p for p in path.rglob("*") if p.is_file()) if path.is_dir() else [path]
        for f in files:
            z.write(f, f.relative_to(ROOT).as_posix())  # caminhos com "/" (exigido pelo Firefox)

print(f"Gerado: {out.relative_to(ROOT)}")
with zipfile.ZipFile(out) as z:
    for n in z.namelist():
        print("  ", n)
