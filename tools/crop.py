"""Crop the Unit 1 textbook pictures that Word Island uses.

Run from the word-island folder:  python -I tools/crop.py
Boxes are (book page, x0, y0, x1, y1) in pixels of the page rendered at 80 dpi.
"""
import io
import os
import sys

import fitz
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PDF = os.path.join(ROOT, "..", "unit 1.pdf")
OUT = os.path.join(ROOT, "img")
FIRST_PAGE = 4  # the PDF starts at book page 4
SCALE = 2  # render at 160 dpi
MAX_SIDE = 420

BOXES = {
    # p.9 Super Friends heads (no tick boxes)
    "misty": (9, 72, 958, 218, 1112),
    "whisper": (9, 246, 958, 390, 1112),
    "flash": (9, 416, 958, 584, 1112),
    "thunder": (9, 600, 958, 760, 1112),
    "tabby": (9, 790, 958, 892, 1124),
    # p.13 classroom instructions
    "sit": (13, 61, 190, 494, 435),
    "open": (13, 514, 190, 946, 435),
    "close": (13, 61, 455, 494, 700),
    "pass": (13, 514, 455, 946, 652),
    # p.14-15 story: Watch out, Flash!
    "sorry": (14, 40, 690, 535, 905),
    "pencilcase-story": (14, 562, 925, 990, 1280),
    "mybag": (15, 514, 125, 994, 445),
    "rat": (15, 124, 905, 944, 1215),
    # p.17 school things photos
    "photo-bag": (17, 90, 585, 262, 738),
    "photo-pen": (17, 400, 590, 632, 700),
    "photo-pencilcase": (17, 676, 610, 962, 724),
    "photo-rubber": (17, 404, 768, 624, 852),
    # p.20 actions
    "act-head": (20, 186, 160, 362, 440),
    "act-catch": (20, 480, 180, 650, 440),
    "act-stretch": (20, 786, 160, 984, 432),
    "act-standup": (20, 186, 490, 384, 742),
    "act-takeout": (20, 486, 480, 692, 728),
    "act-turn": (20, 816, 470, 954, 742),
}


def main(only=None):
    os.makedirs(OUT, exist_ok=True)
    doc = fitz.open(PDF)
    for name, (page, x0, y0, x1, y1) in BOXES.items():
        if only and name not in only:
            continue
        pdf_page = doc[page - FIRST_PAGE]
        clip = fitz.Rect(x0, y0, x1, y1) * (72 / 80)
        pix = pdf_page.get_pixmap(dpi=80 * SCALE, clip=clip)
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        img.thumbnail((MAX_SIDE, MAX_SIDE))
        path = os.path.join(OUT, name + ".webp")
        img.save(path, "WEBP", quality=72, method=6)
        print(f"{name:18} {img.size[0]}x{img.size[1]} {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main(set(sys.argv[1:]) or None)
