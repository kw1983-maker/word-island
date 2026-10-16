"""Builds quest/fonts/pixelify-sans.woff2: Pixelify Sans at weight 600, overlaps removed, a plain pixel "2"
and "5" (the original's looped 2 reads as an 8 and its 5 as an S at small sizes), cut to Basic Latin plus
the kit's symbols. Run: python -I tools/make-pixel-font.py PixelifySans[wght].ttf quest/fonts/pixelify-sans.woff2
(the source font is from github.com/google/fonts, ofl/pixelifysans; needs fonttools, brotli and skia-pathops)"""
import sys
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools import subset
import pathops

src, out = sys.argv[1], sys.argv[2]
font = instancer.instantiateVariableFont(TTFont(src), {"wght": 600}, overlap=instancer.OverlapMode.REMOVE)

# Same grid as this weight's "8": outer edges 61 and 536, strokes about 120 units, bevels about 90.
DIGITS = {
    "2": [
        (150, 548, 446, 636),  # top bar
        (61, 424, 179, 548),   # top left hook
        (417, 337, 536, 548),  # right side, upper half
        (150, 251, 446, 374),  # middle step
        (61, 75, 179, 288),    # left side, lower half
        (61, -11, 536, 113),   # bottom bar
    ],
    "5": [
        (61, 511, 536, 636),   # flat top bar to the right edge, square corner: not an S
        (61, 288, 179, 636),   # left side, upper half
        (61, 251, 446, 374),   # middle bar
        (417, 75, 536, 337),   # right side, lower half
        (61, -11, 446, 113),   # bottom bar, square left corner
        (417, 75, 446, 113),
    ],
}
for char, rects in DIGITS.items():
    path = pathops.Path()
    for x0, y0, x1, y1 in rects:
        path.moveTo(x0, y0)
        path.lineTo(x0, y1)
        path.lineTo(x1, y1)
        path.lineTo(x1, y0)
        path.close()
    path.simplify(clockwise=True)
    pen = TTGlyphPen(None)
    path.draw(pen)
    name = font.getBestCmap()[ord(char)]
    font["glyf"][name] = pen.glyph()
    font["glyf"][name].recalcBounds(font["glyf"])
    font["hmtx"][name] = (font["hmtx"][name][0], font["glyf"][name].xMin)

opts = subset.Options()
opts.flavor = "woff2"
opts.layout_features = ["kern"]
opts.name_IDs = ["*"]
opts.notdef_outline = True
sub = subset.Subsetter(opts)
sub.populate(unicodes=list(range(0x20, 0x7F)) + [0xB7, 0x2026, 0x201C, 0x201D, 0x2018, 0x2019])
sub.subset(font)
font.flavor = "woff2"
font.save(out)
print("saved", out)
