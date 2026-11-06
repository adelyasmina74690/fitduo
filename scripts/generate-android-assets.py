#!/usr/bin/env python3
"""Génère les icônes, la bannière Android TV et les écrans de démarrage de l'APK
à partir de public/icon.svg. Usage : python3 scripts/generate-android-assets.py"""
import re, subprocess, tempfile, os
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "android/app/src/main/res"
SVG = (ROOT / "public/icon.svg").read_text()
BG = "#090D16"

# Silhouettes seules (sans le carré arrondi de fond) pour l'icône adaptative
defs = re.search(r"<defs>.*?</defs>", SVG, re.S).group(0)
body = SVG.split("</defs>", 1)[1].rsplit("</svg>", 1)[0]
body = re.sub(r'<rect width="512" height="512"[^>]*/>', "", body)
GLYPH = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">{defs}{body}</svg>'

def render(svg: str, w: int, h: int, out: Path):
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile("w", suffix=".svg", delete=False) as f:
        f.write(svg)
    subprocess.run(["rsvg-convert", "-w", str(w), "-h", str(h), f.name, "-o", str(out)], check=True)
    os.unlink(f.name)

def wrap(inner_svg: str, size: int, scale: float) -> str:
    """Place le glyphe centré, à `scale` de la taille, dans un SVG carré."""
    off = (1 - scale) * size / 2
    inner = inner_svg.replace("<svg ", f'<svg x="{off}" y="{off}" width="{size*scale}" height="{size*scale}" ', 1)
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}">{inner}</svg>'

densities = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
for d, k in densities.items():
    legacy = int(48 * k); fg = int(108 * k)
    render(SVG, legacy, legacy, RES / f"mipmap-{d}/ic_launcher.png")
    # icône ronde
    round_svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">'
                 f'<circle cx="256" cy="256" r="256" fill="{BG}"/>'
                 + wrap(GLYPH, 512, 0.86)[len('<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">'):])
    render(round_svg, legacy, legacy, RES / f"mipmap-{d}/ic_launcher_round.png")
    # avant-plan adaptatif : contenu dans la zone sûre (66/108)
    render(wrap(GLYPH, 512, 0.66), fg, fg, RES / f"mipmap-{d}/ic_launcher_foreground.png")

(RES / "values/ic_launcher_background.xml").write_text(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n'
    f'    <color name="ic_launcher_background">{BG}</color>\n</resources>\n')

# Bannière Android TV (320x180 dp -> 640x360 px en xhdpi pour un rendu net)
def banner_svg(w, h):
    g = GLYPH.replace("<svg ", f'<svg x="{h*0.08}" y="{h*0.08}" width="{h*0.84}" height="{h*0.84}" ', 1)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            '<defs><linearGradient id="bb" x1="0" y1="0" x2="1" y2="1">'
            f'<stop offset="0" stop-color="#0F1A24"/><stop offset="1" stop-color="{BG}"/></linearGradient></defs>'
            f'<rect width="{w}" height="{h}" fill="url(#bb)"/>{g}'
            f'<text x="{h*0.94}" y="{h*0.55}" font-family="Inter" font-weight="900" font-size="{h*0.225}" fill="#FFFFFF">Fit'
            f'<tspan fill="#22D3EE">Duo</tspan></text>'
            f'<text x="{h*0.95}" y="{h*0.72}" font-family="Inter" font-weight="600" font-size="{h*0.09}" fill="#94A3B8">Fitness maison</text>'
            '</svg>')
render(banner_svg(640, 360), 640, 360, RES / "drawable-xhdpi/banner.png")
render(banner_svg(320, 180), 320, 180, RES / "drawable/banner.png")

# Écrans de démarrage : fond sombre + logo centré
for png in RES.glob("drawable*/splash.png"):
    w, h = Image.open(png).size
    s = int(min(w, h) * 0.42)
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}">'
           f'<rect width="{w}" height="{h}" fill="{BG}"/>'
           + GLYPH.replace("<svg ", f'<svg x="{(w-s)/2}" y="{(h-s)/2 - h*0.04}" width="{s}" height="{s}" ', 1)
           + f'<text x="{w/2}" y="{(h+s)/2 + h*0.04}" text-anchor="middle" font-family="Inter" font-weight="900" '
             f'font-size="{s*0.2}" fill="#FFFFFF">Fit<tspan fill="#22D3EE">Duo</tspan></text></svg>')
    render(svg, w, h, png)
print("Assets Android générés.")
