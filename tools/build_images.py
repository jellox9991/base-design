"""
BASE Design — image pipeline.

Reads the curated portfolio out of the working folder, and writes
web-optimised WebP derivatives into assets/img/.

Run:  python tools/build_images.py
"""
import os
import sys
import json

from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None

SRC = r"C:\Users\jalal\Desktop\JALAL\اعمال سابقة\j\Main work portfolio"
# Anything outside the curated portfolio folder is addressed from here.
JALAL = r"C:\Users\jalal\Desktop\JALAL"
BRAND_SRC = r"C:\Users\jalal\Desktop\JALAL\اعمال سابقة\00- BASE\logo.png"

# live client work, addressed relative to JALAL
INT = r"قيد التصميم\جاسم يوسف الشرقاوي\6-FACADE\interior"
ATHARI = r"قيد التصميم\علي الشيخ الاثري"
FAISAL = r"قيد التصميم\فيصل العنزي"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "img")

# width, quality for each derivative
SIZES = {"thumb": (1000, 76), "full": (2000, 82)}
COMPARE_BOX = (1800, 1125)   # 16:10, both halves must match exactly


def load(path):
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    if im.mode in ("RGBA", "LA", "P"):
        bg = Image.new("RGB", im.size, (255, 255, 255))
        im = im.convert("RGBA")
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert("RGB")


def save_webp(im, rel, quality):
    dst = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, "WEBP", quality=quality, method=5)
    return os.path.getsize(dst)


def derive(src_rel, out_stem, sizes=SIZES):
    """Write thumb + full derivatives. Returns (w, h) of the source."""
    src = os.path.join(SRC, src_rel)
    if not os.path.exists(src):
        print("  MISSING:", src_rel)
        return None
    im = load(src)
    w, h = im.size
    total = 0
    for name, (width, q) in sizes.items():
        c = im.copy()
        if c.width > width:
            c = c.resize((width, round(width * c.height / c.width)), Image.LANCZOS)
        total += save_webp(c, f"{out_stem}-{name}.webp", q)
    print(f"  {out_stem:34s} {w}x{h} -> {total/1024:.0f}KB")
    return (w, h)


def derive_cover(src_rel, out_rel, box, quality=82, centering=(0.5, 0.5)):
    """Crop to an exact box — used for compare pairs and the hero.

    `centering` biases which part survives the crop; renders with a lot of
    sky need to be pulled downward or the pair ends up comparing two skies.
    """
    src = os.path.join(SRC, src_rel)
    if not os.path.exists(src):
        print("  MISSING:", src_rel)
        return False
    im = ImageOps.fit(load(src), box, Image.LANCZOS, centering=centering)
    kb = save_webp(im, out_rel, quality) / 1024
    print(f"  {out_rel:44s} {box[0]}x{box[1]} -> {kb:.0f}KB")
    return True


# ---------------------------------------------------------------- projects
# key: (source file, slug)
PROJECTS = {
    "facade": [
        ("002 facade/ChatGPT Image Apr 30, 2026, 04_02_07 PM.png", "facade-01"),
        ("002 facade/ChatGPT Image Apr 30, 2026, 04_15_48 PM.png", "facade-02"),
        ("002 facade/sec full render.png",                          "facade-03"),
        ("002 facade/ChatGPT Image May 2, 2026, 10_06_44 AM.png",   "facade-04"),
        ("002 facade/facade modern 1.jpg",                          "facade-05"),
        ("002 facade/sec render.png",                               "facade-06"),
    ],
    "salmiya": [
        ("004 JS INt/2.png",                                        "salmiya-01"),
        ("004 JS INt/1.png",                                        "salmiya-02"),
        ("004 JS INt/1dd56e0b-4cfe-4be6-88e0-2b1655b99f52.png",     "salmiya-03"),
        ("004 JS INt/gf ground iso.jpg",                            "salmiya-04"),
        ("004 JS INt/3ed61e1c-6840-4040-ad78-e2d0133fb938.png",     "salmiya-05"),
        ("004 JS INt/5.png",                                        "salmiya-06"),
    ],
    "hollowcore": [
        ("003 dr safaa/ChatGPT Image May 4, 2026, 10_29_28 AM.png", "hollowcore-01"),
        ("003 dr safaa/ChatGPT Image May 5, 2026, 10_18_14 AM.png", "hollowcore-02"),
        ("003 dr safaa/structure.jpg",                              "hollowcore-03"),
        ("003 dr safaa/sec structureee.jpg",                        "hollowcore-04"),
        ("003 dr safaa/ChatGPT Image May 4, 2026, 09_54_31 AM.png", "hollowcore-05"),
        ("003 dr safaa/swiming pool destail.jpg",                   "hollowcore-06"),
    ],
    "boq": [
        ("005 BOQ/563c301c-dba0-4b58-85bd-c65ca7cd126f.png",        "boq-01"),
        ("005 BOQ/a0aa71b0-78af-4e93-8f6f-ba5c69517e77.png",        "boq-02"),
        ("005 BOQ/3961de2f-441f-4caf-a65d-56d90abf767c.png",        "boq-03"),
        ("005 BOQ/cf70d6dd-bbe8-4838-a7e2-e79af26fc08b.png",        "boq-04"),
        ("005 BOQ/rebar 5.jpg",                                     "boq-05"),
        ("005 BOQ/footing sec.jpg",                                 "boq-06"),
    ],
    "hospital": [
        ("000 graduation project/ChatGPT Image May 2, 2026, 03_36_07 PM.png", "hospital-01"),
        ("000 graduation project/hospital image.png",               "hospital-02"),
        ("000 graduation project/sec 1 render.png",                 "hospital-03"),
        ("000 graduation project/sec 2 render.png",                 "hospital-04"),
        ("000 graduation project/ele.png",                          "hospital-05"),
        ("000 graduation project/sec 3 rendert.png",                "hospital-06"),
    ],
}

# exterior -> interior/section, same building.
# Fourth item is the crop centering for the pair (y below 0.5 = keep more
# of the lower half, which is where the building is in an aerial render).
COMPARES = [
    ("002 facade/ChatGPT Image Apr 30, 2026, 04_02_07 PM.png",
     "002 facade/sec full render.png", "c1", (0.5, 0.5)),
    ("000 graduation project/ChatGPT Image May 2, 2026, 03_36_07 PM.png",
     "000 graduation project/sec 2 render.png", "c2", (0.5, 0.72)),
    ("003 dr safaa/structure.jpg",
     "003 dr safaa/sec structureee.jpg", "c3", (0.5, 0.55)),
]

HERO = "002 facade/ChatGPT Image Apr 30, 2026, 04_15_48 PM.png"

# ---------------------------------------------------------- new projects
# Sourced from live client folders rather than the curated portfolio.
PROJECTS_ALT = {
    "villa329": (ATHARI, [
        ("ChatGPT Image Sep 17, 2025, 10_25_22 AM.png", "villa329-01"),
        ("Enscape_2025-09-17-10-07-34.png",             "villa329-02"),
        ("Enscape_2025-09-17-10-15-59.png",             "villa329-03"),
        ("Enscape_2025-09-17-10-29-49.png",             "villa329-04"),
        ("Enscape_2025-09-17-14-45-34.png",             "villa329-05"),
        ("Enscape_2025-09-17-10-19-38.png",             "villa329-06"),
    ]),
    "faisal": (FAISAL, [
        ("16.jpg",  "faisal-01"),
        ("17.jpg",  "faisal-02"),
        ("12.jpg",  "faisal-03"),
        ("18.jpg",  "faisal-04"),
        ("1.png",   "faisal-05"),
        ("21.jpg",  "faisal-06"),
    ]),
}

# ------------------------------------------------------ plan walkthrough
# The furnished ground-floor plan, plus the interior views you step through.
WALK_PLAN = (INT, "GF.jpg", "walk/salmiya-plan.webp", (2600, 1724))
WALK_STOPS = [
    (INT, "Scene 3.png",   "walk/salmiya-s1.webp"),
    (INT, "2.png",         "walk/salmiya-s2.webp"),
    (INT, "100.png",       "walk/salmiya-s3.webp"),
    (INT, "F1.png",        "walk/salmiya-s4.webp"),
    (INT, "full post.png", "walk/salmiya-s5.webp"),
    (INT, "10.jpg",        "walk/salmiya-s6.webp"),
]

# ------------------------------------------------------- build-up layers
# Raw structure through to finished surface. Sources are a mix of the BOQ
# and hollow-core packages plus the finished interior.
LAYERS = [
    (SRC,   r"005 BOQ\footing sec.jpg",                              "layers/l1.webp"),
    (SRC,   r"005 BOQ\rebar 5.jpg",                                  "layers/l2.webp"),
    (SRC,   r"005 BOQ\3961de2f-441f-4caf-a65d-56d90abf767c.png",     "layers/l3.webp"),
    (SRC,   r"003 dr safaa\ChatGPT Image May 4, 2026, 10_29_28 AM.png", "layers/l4.webp"),
    (SRC,   r"003 dr safaa\ChatGPT Image May 4, 2026, 09_54_31 AM.png", "layers/l5.webp"),
    (JALAL, INT + r"\FF 1.jpg",                                      "layers/l6.webp"),
    (JALAL, INT + r"\2.png",                                         "layers/l7.webp"),
]


def derive_from(root, rel, out_stem, sizes=SIZES):
    """Same as derive() but rooted anywhere."""
    src = os.path.join(root, rel)
    if not os.path.exists(src):
        print("  MISSING:", rel)
        return None
    im = load(src)
    w, h = im.size
    total = 0
    for name, (width, q) in sizes.items():
        c = im.copy()
        if c.width > width:
            c = c.resize((width, round(width * c.height / c.width)), Image.LANCZOS)
        total += save_webp(c, f"{out_stem}-{name}.webp", q)
    print(f"  {out_stem:34s} {w}x{h} -> {total/1024:.0f}KB")
    return (w, h)


def derive_wide(root, rel, out_rel, max_w, quality=82):
    """Resize to a max width, keeping the full frame (no cropping)."""
    src = os.path.join(root, rel)
    if not os.path.exists(src):
        print("  MISSING:", rel)
        return False
    im = load(src)
    if im.width > max_w:
        im = im.resize((max_w, round(max_w * im.height / im.width)), Image.LANCZOS)
    kb = save_webp(im, out_rel, quality) / 1024
    print(f"  {out_rel:32s} {im.width}x{im.height} -> {kb:.0f}KB")
    return True


def build_brand():
    """Trim the logo's black field and emit transparent PNG + favicon."""
    print("brand:")
    if not os.path.exists(BRAND_SRC):
        print("  MISSING logo")
        return
    im = Image.open(BRAND_SRC).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _ = px[x, y]
            if r < 26 and g < 26 and b < 26:
                px[x, y] = (0, 0, 0, 0)
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    os.makedirs(os.path.join(OUT, "brand"), exist_ok=True)
    im.save(os.path.join(OUT, "brand", "logo.png"))
    print(f"  logo.png  {im.size[0]}x{im.size[1]}")

    # Nav mark: the same lockup minus the two tagline lines, which turn to
    # mush at nav size. Found by locating ink bands to the right of the
    # bracket rather than hard-coding pixel offsets.
    mark = im.copy()
    w, h = mark.size
    alpha = mark.split()[-1]
    px = alpha.load()

    def ink_rows(x0, x1):
        rows, run = [], None
        for y in range(h):
            hit = any(px[x, y] > 40 for x in range(x0, x1, 3))
            if hit and run is None:
                run = y
            elif not hit and run is not None:
                rows.append((run, y - 1)); run = None
        if run is not None:
            rows.append((run, h - 1))
        return rows

    right = ink_rows(int(w * 0.58), w)
    # the first band is the SE letters; anything after it is the tagline.
    # Back off a few rows — the sampling stride can miss the first thin line.
    if len(right) > 1:
        top = max(right[0][1] + 4, right[1][0] - 10)
        clear = Image.new("RGBA", (w - int(w * 0.55), h - top), (0, 0, 0, 0))
        mark.paste(clear, (int(w * 0.55), top))
    bb = mark.getbbox()
    if bb:
        mark = mark.crop(bb)
    mark.save(os.path.join(OUT, "brand", "logo-mark.png"))
    print(f"  logo-mark.png  {mark.size[0]}x{mark.size[1]}  (tagline removed)")

    # og cover: logo centred on black, 1200x630
    og = Image.new("RGB", (1200, 630), (0, 0, 0))
    lg = im.copy()
    lg.thumbnail((820, 420), Image.LANCZOS)
    og.paste(lg, ((1200 - lg.width) // 2, (630 - lg.height) // 2), lg)
    og.save(os.path.join(OUT, "brand", "og-cover.jpg"), "JPEG",
            quality=88, optimize=True)
    print("  og-cover.jpg  1200x630")


def main():
    os.makedirs(OUT, exist_ok=True)
    build_brand()

    print("\nhero:")
    derive_cover(HERO, "transitions/hero.webp", (2400, 1350), 80)

    print("\ncompare pairs:")
    for ext, inte, slug, cent in COMPARES:
        derive_cover(ext,  f"transitions/{slug}-exterior.webp", COMPARE_BOX,
                     centering=cent)
        derive_cover(inte, f"transitions/{slug}-interior.webp", COMPARE_BOX,
                     centering=cent)

    print("\nplan walkthrough:")
    root, rel, out, box = WALK_PLAN
    derive_wide(JALAL, os.path.join(root, rel), out, box[0], 84)
    for r, f, o in WALK_STOPS:
        derive_wide(JALAL, os.path.join(r, f), o, 1800)

    print("\nbuild-up layers:")
    for root, rel, out in LAYERS:
        derive_wide(root, rel, out, 1700)

    manifest = {}
    for key, items in PROJECTS.items():
        print(f"\n{key}:")
        got = []
        for src_rel, stem in items:
            if derive(src_rel, f"projects/{stem}"):
                got.append(stem)
        manifest[key] = got

    for key, (root, items) in PROJECTS_ALT.items():
        print(f"\n{key}:")
        got = []
        for fname, stem in items:
            if derive_from(JALAL, os.path.join(root, fname), f"projects/{stem}"):
                got.append(stem)
        manifest[key] = got

    with open(os.path.join(ROOT, "assets", "img", "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    tot = sum(os.path.getsize(os.path.join(dp, f))
              for dp, _, fs in os.walk(OUT) for f in fs)
    print(f"\nTOTAL assets: {tot/1048576:.1f} MB")


if __name__ == "__main__":
    sys.exit(main())
