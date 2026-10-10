"""Crop the textbook pictures that Word Island uses.

Run from the word-island folder:  python -I tools/crop.py u5 [name ...]
Boxes are (book page, x0, y0, x1, y1) in pixels of the page rendered at 80 dpi.
"""
import io
import os
import sys

import fitz
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SCALE = 2  # render at 160 dpi
MAX_SIDE = 420

UNITS = {
    "u1": {
        "pdf": "unit 1.pdf",
        "first_page": 4,
        "boxes": {
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
        },
    },
    "u5": {
        "pdf": "unit 5.pdf",
        "first_page": 58,
        "boxes": {
            # p.58 This week board
            "match": (58, 555, 455, 710, 565),
            "lake": (58, 555, 622, 712, 732),
            # p.60 song
            "sing": (60, 20, 140, 330, 450),
            "swim": (60, 520, 40, 990, 300),
            "games": (60, 20, 720, 340, 960),
            "hideseek": (60, 780, 440, 990, 760),
            # p.61 Do you ...?
            "tv-yes": (61, 384, 130, 664, 290),
            "tv-no": (61, 709, 130, 919, 290),
            "games-yes": (61, 419, 340, 659, 500),
            "games-no": (61, 709, 340, 934, 500),
            # p.63 story and phonics
            "rabbit": (63, 19, 140, 499, 445),
            "mud": (63, 134, 880, 959, 1215),
            "duck": (63, 699, 950, 839, 1175),
            "mum": (63, 404, 890, 709, 1110),
            # p.65 My perfect week
            "bike": (65, 659, 200, 889, 410),
            "toys": (65, 84, 665, 264, 880),
            "sleep": (65, 632, 660, 934, 925),
            "swim2": (65, 634, 460, 894, 615),
            "friends": (65, 79, 150, 569, 365),
            "games2": (65, 114, 455, 259, 615),
            # p.66 healthy or unhealthy
            "h-fruit": (66, 190, 830, 350, 1005),
            "h-sport": (66, 462, 835, 615, 1000),
            "h-sleep": (66, 720, 840, 880, 1000),
            "h-sweets": (66, 178, 1035, 350, 1200),
            "h-tvnight": (66, 460, 1060, 628, 1225),
            "h-late": (66, 718, 1060, 885, 1222),
            # p.68 the piano
            "p-ears": (68, 180, 190, 405, 410),
            "p-cat": (68, 470, 190, 692, 405),
            "p-floor": (68, 756, 180, 985, 410),
            "p-open": (68, 180, 425, 410, 640),
            "p-sit": (68, 468, 425, 697, 640),
            "p-play": (68, 756, 425, 980, 640),
        },
    },
    "u2": {
        "pdf": "Unit 2.pdf",
        "first_page": 22,
        "boxes": {
            # p.33 spelling game: toy pictures
            "kite": (33, 425, 535, 572, 682),
            "doll": (33, 598, 355, 735, 502),
            "monster": (33, 775, 535, 922, 682),
            "plane": (33, 248, 535, 398, 682),
            "game": (33, 248, 1070, 398, 1222),
            "train": (33, 72, 710, 222, 862),
            "car": (33, 248, 355, 398, 502),
            "ball": (33, 598, 175, 748, 325),
            "bike": (33, 422, 890, 572, 1042),
            "gokart": (33, 598, 710, 748, 862),
            # p.23 his / her
            "ben": (23, 140, 1012, 420, 1242),
            "lisa": (23, 530, 1012, 810, 1242),
            # p.24 song: Emma and Mike
            "emma": (24, 640, 560, 990, 860),
            "mike": (24, 830, 890, 990, 1110),
            # p.25 adjectives
            "a-longtrain": (25, 45, 185, 250, 332),
            "a-shorttrain": (25, 258, 185, 465, 332),
            "a-bigball": (25, 498, 185, 705, 332),
            "a-smallball": (25, 712, 185, 917, 332),
            "a-uglymonster": (25, 45, 428, 250, 610),
            "a-beautifulmonster": (25, 258, 428, 465, 610),
            "a-oldgokart": (25, 498, 428, 705, 610),
            "a-newgokart": (25, 712, 428, 917, 610),
            "yellowmonster": (25, 88, 955, 358, 1252),
            # p.26-27 story: The go-kart race
            "race-go": (26, 570, 300, 990, 540),
            "race-fair": (26, 40, 1045, 550, 1310),
            "race-woah": (27, 20, 182, 500, 450),
            "race-cup": (27, 522, 218, 990, 450),
            "ken": (27, 228, 1018, 760, 1215),
            # p.28 reading
            "r-longtrain": (28, 182, 168, 584, 358),
            "r-boat": (28, 212, 548, 614, 742),
            "r-doll": (28, 214, 740, 624, 932),
            "r-shorttrain": (28, 237, 1118, 646, 1306),
            # p.30 tangram shapes
            "triangle": (30, 140, 345, 368, 465),
            "square": (30, 458, 342, 580, 462),
            "circle": (30, 190, 528, 318, 648),
            "parallelogram": (30, 448, 526, 690, 646),
            "rectangle": (30, 760, 526, 958, 648),
            "tangram": (30, 772, 730, 990, 988),
        },
    },
    "u3": {
        "pdf": "unit 3.pdf",
        "first_page": 34,
        "boxes": {
            # p.35 description game: where are the animals?
            "lizard-on-bag": (35, 52, 825, 215, 1010),
            "rat-under-desk": (35, 232, 825, 395, 1010),
            "rat-on-book": (35, 410, 825, 572, 1010),
            "spider-in-case": (35, 588, 825, 750, 1010),
            "spider-under-book": (35, 765, 825, 928, 1010),
            "frog-on-bag": (35, 52, 1030, 215, 1215),
            "frog-under-case": (35, 232, 1030, 395, 1215),
            "cat-on-book": (35, 410, 1030, 572, 1215),
            "frog-in-bag": (35, 588, 1030, 750, 1215),
            "cat-under-desk": (35, 765, 1030, 928, 1215),
            # p.36 song: Look at the …
            "s-spiders": (36, 700, 0, 990, 112),
            "s-rats": (36, 0, 140, 328, 330),
            "s-lizards": (36, 178, 412, 422, 512),
            "s-cats": (36, 662, 160, 990, 420),
            "s-elephants": (36, 575, 548, 990, 790),
            "s-dogs": (36, 25, 530, 330, 760),
            "s-ducks": (36, 740, 770, 990, 1080),
            "s-frogs": (36, 75, 990, 305, 1135),
            # p.37 I like / I don't like
            "like-cats": (37, 138, 148, 535, 440),
            "like-spiders": (37, 570, 148, 962, 440),
            "spider": (37, 120, 535, 360, 745),
            # p.38-39 story: The spider
            "st-come": (38, 36, 180, 525, 530),
            "st-under": (38, 40, 555, 528, 900),
            "st-clever": (38, 552, 548, 990, 895),
            "st-great": (38, 40, 925, 532, 1275),
            "st-tree": (39, 22, 105, 505, 450),
            "st-ohno": (39, 523, 105, 990, 455),
            "timkim": (39, 85, 950, 955, 1225),
            # p.40 pet show
            "show-frog": (40, 130, 295, 395, 485),
            "show-right": (40, 418, 295, 690, 485),
            "show-spider": (40, 730, 285, 990, 500),
            # p.42 camouflage
            "snake": (42, 163, 323, 316, 465),
            "crocodile": (42, 330, 323, 483, 465),
            "butterfly": (42, 497, 320, 648, 460),
            "tiger": (42, 662, 318, 813, 458),
            "giraffe": (42, 826, 315, 977, 455),
            "cam-croc": (42, 168, 582, 572, 880),
            "cam-spider": (42, 585, 578, 985, 875),
            "cam-frog": (42, 172, 888, 576, 1185),
            # p.43 where animals hide (above the word labels)
            "bird": (43, 532, 228, 726, 435),
            "logs": (43, 103, 455, 300, 650),
            "trees": (43, 318, 455, 512, 650),
            "leaves": (43, 532, 455, 726, 650),
            "grass": (43, 744, 455, 938, 650),
            # p.44 the little dog
            "dog-tree": (44, 735, 425, 992, 652),
            "dog-hug": (44, 735, 185, 992, 412),
            # p.45 quiz
            "q-lizard": (45, 100, 150, 310, 270),
            "q-cat-bag": (45, 585, 278, 848, 402),
            "q-log": (45, 80, 925, 290, 1060),
        },
    },
    "u7": {
        "pdf": "unit 7.pdf",
        "first_page": 82,
        "boxes": {
            # p.93 the dressing game: clothes
            "c-socks": (93, 268, 305, 375, 405),
            "c-trousers": (93, 382, 272, 478, 372),
            "c-cap": (93, 498, 284, 600, 352),
            "c-tshirt": (93, 600, 300, 735, 410),
            "c-jacket": (93, 695, 375, 830, 472),
            "c-shoes": (93, 780, 492, 905, 572),
            "c-jeans": (93, 105, 810, 215, 932),
            "c-greycap": (93, 100, 470, 205, 556),
            "c-bluetshirt": (93, 55, 590, 195, 695),
            "c-redsocks": (93, 198, 912, 278, 1005),
            # p.90 materials photos
            "m-socks": (90, 165, 390, 312, 527),
            "m-shoes": (90, 170, 590, 325, 737),
            "m-shorts": (90, 195, 805, 325, 947),
            "m-sweater": (90, 760, 380, 985, 527),
            "m-tshirt": (90, 800, 590, 968, 727),
            "m-jacket": (90, 775, 798, 992, 927),
            "m-cotton": (90, 438, 355, 702, 553),
            "m-cow": (90, 440, 560, 707, 753),
            "m-sheep": (90, 443, 765, 713, 960),
            "m-woolhat": (90, 205, 1078, 326, 1218),
            "m-belt": (90, 340, 1072, 422, 1218),
            "m-gloves": (90, 865, 1060, 976, 1182),
            "m-boots": (90, 725, 1062, 856, 1206),
            # p.83 Do you like this / these ...?
            "l-hat": (83, 125, 780, 296, 946),
            "l-greenhat": (83, 338, 778, 522, 946),
            "l-boots": (83, 575, 755, 746, 992),
            "l-redboots": (83, 800, 755, 942, 982),
            "l-jacket": (83, 113, 1045, 314, 1226),
            "l-tuxedo": (83, 345, 1040, 532, 1212),
            "l-trousers": (83, 600, 1025, 712, 1256),
            # p.84 song: the cool cat
            "cat": (84, 500, 575, 722, 1002),
            # p.88 who is wearing what?
            "k-naomi": (88, 582, 408, 702, 692),
            "k-oscar": (88, 762, 408, 892, 692),
            "k-david": (88, 362, 518, 492, 800),
            "k-hannah": (88, 486, 640, 604, 912),
            "k-james": (88, 676, 668, 802, 948),
            "k-amy": (88, 848, 655, 986, 932),
            # p.89 Tom on his bike
            "tom": (89, 130, 575, 590, 812),
            # p.86-87 story: The cap
            "s-gary": (86, 360, 650, 545, 852),
            "s-bird": (86, 40, 962, 552, 1302),
            "s-thanks": (86, 575, 962, 992, 1302),
            "s-chair": (87, 18, 145, 500, 450),
            "s-sorry": (87, 520, 170, 992, 450),
            "spiders": (87, 135, 865, 955, 1222),
        },
    },
    "u9": {
        "pdf": "unit 9.pdf",
        "first_page": 106,
        "boxes": {
            # p.106 at the beach (people only, not the word labels)
            "fish": (106, 25, 440, 170, 722),
            "paint": (106, 468, 405, 602, 582),
            "photo": (106, 648, 415, 748, 642),
            "music": (106, 790, 695, 990, 885),
            "shells": (106, 165, 555, 320, 808),
            "book": (106, 340, 648, 510, 808),
            "sandcastle": (106, 500, 705, 790, 888),
            # p.107 Let's ...
            "l-music": (107, 38, 205, 483, 470),
            "l-paint": (107, 508, 205, 948, 470),
            "l-shells": (107, 38, 490, 483, 755),
            "l-photo": (107, 508, 490, 948, 755),
            "guitar": (107, 318, 1080, 438, 1165),
            "rod": (107, 532, 1080, 652, 1165),
            "icecream": (107, 742, 1080, 862, 1165),
            "openbook": (107, 336, 1185, 458, 1268),
            "castle": (107, 532, 1185, 652, 1268),
            "football": (107, 742, 1185, 862, 1268),
            # p.108 song: Happy holiday
            "s-hands": (108, 15, 165, 355, 355),
            "s-shells": (108, 85, 360, 420, 560),
            "s-photo": (108, 15, 610, 355, 855),
            "s-sand": (108, 750, 80, 992, 280),
            "s-fish": (108, 690, 300, 992, 515),
            "s-swim": (108, 775, 545, 992, 790),
            # p.109 Where's ...? Where are ...?
            "shell-on": (109, 22, 133, 270, 315),
            "shell-next": (109, 695, 133, 940, 310),
            "kites-red": (109, 25, 340, 270, 520),
            "kites-blue": (109, 695, 338, 940, 518),
            "bag-green": (109, 25, 805, 320, 1020),
            "bag-black": (109, 338, 805, 632, 1020),
            "bag-yellow": (109, 650, 805, 943, 1020),
            "bag-pink": (109, 25, 1038, 320, 1252),
            "bag-orange": (109, 338, 1038, 632, 1252),
            "bag-blue": (109, 650, 1038, 943, 1252),
            # p.110-111 story: The top of the hill
            "st-run": (110, 550, 285, 990, 515),
            "st-rock": (110, 553, 625, 990, 885),
            "st-end": (110, 45, 985, 530, 1255),
            "st-lift": (111, 18, 215, 500, 445),
            "st-together": (111, 520, 205, 990, 445),
            "teeth": (111, 95, 890, 955, 1210),
            # p.117 quiz: the friends
            "thunder": (117, 212, 598, 388, 710),
            "flash": (117, 698, 598, 873, 708),
            # p.112 countries
            "palace": (112, 102, 455, 392, 670),
            "koala": (112, 413, 455, 700, 670),
            "canada": (112, 722, 455, 990, 670),
            "flag-au": (112, 196, 845, 323, 928),
            "flag-ca": (112, 196, 930, 323, 1013),
            "flag-uk": (112, 196, 1015, 323, 1098),
            # p.114 weather
            "w-sunny": (114, 105, 255, 232, 385),
            "w-hot": (114, 276, 255, 375, 385),
            "w-cold": (114, 418, 255, 520, 385),
            "w-snowing": (114, 562, 262, 665, 380),
            "w-raining": (114, 708, 262, 808, 378),
            "w-cloudy": (114, 828, 240, 952, 372),
            # p.115 postcards
            "p-japan": (115, 633, 218, 898, 396),
            "p-snow": (115, 633, 432, 898, 610),
            "p-beach": (115, 633, 652, 898, 832),
        },
    },
    "u6": {
        "pdf": "unit 6.pdf",
        "first_page": 70,
        "boxes": {
            # p.70 the old house, one room each (below the word labels)
            "room-bathroom": (70, 188, 408, 364, 498),
            "room-bedroom": (70, 372, 408, 654, 498),
            "room-living": (70, 188, 556, 364, 656),
            "room-hall": (70, 372, 556, 496, 656),
            "room-dining": (70, 500, 556, 656, 656),
            "room-kitchen": (70, 660, 556, 810, 656),
            "room-stairs": (70, 188, 702, 450, 780),
            "room-cellar": (70, 452, 700, 720, 784),
            # p.71 monsters
            "monster": (71, 130, 145, 325, 300),
                        # p.72 song: In my little house
            "s-lizard": (72, 645, 380, 805, 505),
            "s-crocodiles": (72, 815, 380, 980, 500),
            "s-cat": (72, 650, 560, 800, 705),
            "s-spider": (72, 862, 545, 980, 640),
            "s-snake": (72, 880, 705, 975, 800),
            "s-tigers": (72, 600, 740, 990, 1010),
            # p.73 the park, and Is there a ...?
            "park": (73, 62, 142, 958, 470),
            "plane": (73, 342, 1062, 448, 1140),
            "rat": (73, 506, 1060, 618, 1140),
            "car": (73, 672, 1068, 788, 1135),
            "bike": (73, 848, 1060, 950, 1140),
            "cake": (73, 340, 1192, 432, 1258),
            "kite": (73, 512, 1172, 618, 1262),
            "pears": (73, 682, 1180, 782, 1260),
            "gokart": (73, 838, 1180, 958, 1262),
            # p.74-75 story: At the house
            "house": (74, 585, 180, 760, 335),
            "st-stairs": (74, 40, 640, 420, 872),
            "st-cat": (74, 620, 690, 800, 870),
            "st-spiders": (74, 40, 972, 510, 1232),
            "st-rats": (74, 535, 966, 990, 1232),
            "st-here": (75, 520, 262, 990, 410),
            "hall-hats": (75, 500, 812, 940, 1205),
            # p.78 habitats
            "polar": (78, 168, 258, 425, 430),
            "ocean": (78, 442, 254, 700, 425),
            "jungle": (78, 172, 489, 432, 660),
            "desert": (78, 447, 484, 705, 657),
            "mountains": (78, 722, 479, 978, 652),
            "sand": (78, 176, 791, 432, 964),
            "trees": (78, 451, 789, 708, 958),
            "rocks": (78, 181, 1021, 440, 1194),
            "coral": (78, 457, 1016, 714, 1189),
            "snow": (78, 731, 1013, 985, 1184),
            # p.79 animals (inside the number circles)
            "tiger": (79, 160, 300, 318, 450),
            "parrot": (79, 366, 300, 523, 450),
            "camel": (79, 571, 300, 728, 450),
            "goat": (79, 776, 300, 932, 450),
            "polarbear": (79, 160, 551, 318, 700),
            "shark": (79, 366, 551, 523, 700),
            "jellyfish": (79, 571, 551, 728, 700),
            "penguin": (79, 776, 551, 932, 700),
            # p.81 quiz: the friends
            "misty": (81, 452, 732, 582, 856),
        },
    },
}


def main(unit_id, only=None):
    unit = UNITS[unit_id]
    out = os.path.join(ROOT, "img", unit_id)
    os.makedirs(out, exist_ok=True)
    doc = fitz.open(os.path.join(ROOT, "..", unit["pdf"]))
    for name, (page, x0, y0, x1, y1) in unit["boxes"].items():
        if only and name not in only:
            continue
        pdf_page = doc[page - unit["first_page"]]
        clip = fitz.Rect(x0, y0, x1, y1) * (72 / 80)
        pix = pdf_page.get_pixmap(dpi=80 * SCALE, clip=clip)
        img = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
        img.thumbnail((MAX_SIDE, MAX_SIDE))
        path = os.path.join(out, name + ".webp")
        img.save(path, "WEBP", quality=72, method=6)
        print(f"{name:18} {img.size[0]}x{img.size[1]} {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    main(sys.argv[1], set(sys.argv[2:]) or None)
