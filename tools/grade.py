"""
BASE — render post-production.

Raw Enscape/Lumion output is flat: low contrast, cool cast, soft micro
detail. This is the grade you would otherwise do by hand in Photoshop —
tone curve, warmth, local contrast, sharpening, and a light vignette.

Nothing is invented. Every pixel is still your render.

Usage:
    python tools/grade.py preview     # side-by-side before/after samples
    python tools/grade.py apply       # grade the site's photographic images
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter, ImageEnhance

Image.MAX_IMAGE_PIXELS = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")
SCRATCH = (r"C:\Users\jalal\AppData\Local\Temp\claude"
           r"\C--Users-jalal-Crypto-bot-claude"
           r"\ac67ab20-4b6e-4140-8a35-3943d84ab4b2\scratchpad")


# ---------------------------------------------------------------- grade
def tone_curve(a, shadow=0.030, highlight=0.028, pivot=0.5, strength=0.16):
    """Gentle S-curve: deepen the low end, lift the top, keep mids honest."""
    x = a.copy()
    s = 1.0 + strength
    x = (x - pivot) * s + pivot
    x = x - shadow * np.clip(1.0 - x * 2.0, 0, 1) ** 2
    x = x + highlight * np.clip((x - 0.5) * 2.0, 0, 1) ** 2
    return np.clip(x, 0, 1)


def split_tone(a, warm=0.009, cool=0.008):
    """Warm the highlights, cool the shadows — how daylight actually reads."""
    lum = a @ np.array([0.2126, 0.7152, 0.0722])
    hi = np.clip((lum - 0.5) * 2.0, 0, 1)[..., None]
    lo = np.clip((0.5 - lum) * 2.0, 0, 1)[..., None]
    a = a + hi * np.array([warm, warm * 0.42, -warm * 0.55])
    a = a + lo * np.array([-cool * 0.5, -cool * 0.12, cool])
    return np.clip(a, 0, 1)


def vignette(im, amount=0.10):
    w, h = im.size
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = (w - 1) / 2.0, (h - 1) / 2.0
    r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2) / np.sqrt(2)
    mask = 1.0 - amount * np.clip((r - 0.45) / 0.55, 0, 1) ** 1.7
    a = np.asarray(im).astype(np.float32) / 255.0
    a = a * mask[..., None]
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))


def grade(im, strength=1.0):
    """Full pass. strength scales the whole grade (0 = untouched)."""
    im = im.convert("RGB")

    a = np.asarray(im).astype(np.float32) / 255.0
    a = tone_curve(a, strength=0.16 * strength,
                   shadow=0.030 * strength, highlight=0.028 * strength)
    # Warmth stays deliberately low: pushing it further reads nicer but
    # shifts specified finishes, and clients choose materials off these.
    a = split_tone(a, warm=0.009 * strength, cool=0.008 * strength)
    im = Image.fromarray((a * 255).astype(np.uint8))

    # local contrast — big radius, low amount. This is what reads as "depth".
    im = im.filter(ImageFilter.UnsharpMask(
        radius=int(38 * strength) or 1, percent=int(26 * strength), threshold=2))

    im = ImageEnhance.Color(im).enhance(1.0 + 0.11 * strength)

    # micro detail last, tight radius so edges crisp without haloing
    im = im.filter(ImageFilter.UnsharpMask(
        radius=1.2, percent=int(62 * strength), threshold=3))

    return vignette(im, amount=0.10 * strength)


# ------------------------------------------------------------- selection
# Photographic renders only. Technical boards, plans, BOQ sheets and
# structural diagrams are deliberately excluded — grading a drawing just
# makes it dirty.
GRADE_LIST = [
    "transitions/hero.webp",
    "transitions/c1-exterior.webp",
    "transitions/c1-interior.webp",
    "transitions/c2-exterior.webp",
    "walk/salmiya-s1.webp",
    "walk/salmiya-s2.webp",
    "walk/salmiya-s3.webp",
    "walk/salmiya-s4.webp",
    "walk/salmiya-s5.webp",
]
GRADE_PROJECT_STEMS = [
    "facade-01", "facade-02", "facade-03",
    "salmiya-01", "salmiya-02",
    "villa329-01", "villa329-02", "villa329-03",
    "villa329-04", "villa329-05", "villa329-06",
    "faisal-01", "faisal-02", "faisal-03",
    "faisal-04", "faisal-05", "faisal-06",
    "hospital-01", "hospital-02",
]

SAMPLES = [
    ("projects/faisal-01-full.webp",   "Private Villa — dusk"),
    ("projects/villa329-02-full.webp", "Villa 329"),
    ("walk/salmiya-s2.webp",           "Al-Salmiya — living"),
    ("transitions/hero.webp",          "Hero — Mutlaa façade"),
]


def preview(strength=1.0):
    """Three-up: raw, subtle, strong — so the level is a choice, not a guess."""
    os.makedirs(SCRATCH, exist_ok=True)
    from PIL import ImageDraw
    levels = [(0.0, "RAW"), (0.55, "SUBTLE"), (0.90, "STRONG")]
    for rel, label in SAMPLES:
        src = os.path.join(IMG, rel)
        if not os.path.exists(src):
            print("  missing", rel)
            continue
        before = Image.open(src).convert("RGB")

        w = 720
        tiles = []
        for s, tag in levels:
            im = before if s == 0 else grade(before, s)
            t = im.resize((w, round(w * im.height / im.width)), Image.LANCZOS)
            tiles.append((t, tag))

        h = tiles[0][0].height
        sheet = Image.new("RGB", (w * 3 + 24, h + 26), (10, 10, 10))
        dr = ImageDraw.Draw(sheet)
        for i, (t, tag) in enumerate(tiles):
            x = i * (w + 12)
            sheet.paste(t, (x, 26))
            dr.text((x + 6, 7), tag, fill=(255, 255, 255))
        name = "grade_" + os.path.basename(rel).replace(".webp", "") + ".jpg"
        sheet.save(os.path.join(SCRATCH, name), "JPEG", quality=90)
        print(f"  {label:28s} -> {name}")


MARKER = os.path.join(IMG, ".graded")


def apply(strength=1.0, force=False):
    """Grade in place.

    Grading is destructive, so running it twice would stack the curve and
    the sharpening. The marker blocks that: to change the strength, rebuild
    the derivatives from source first.

        python tools/build_images.py
        python tools/grade.py apply 0.55
    """
    if os.path.exists(MARKER) and not force:
        with open(MARKER) as f:
            prev = f.read().strip()
        print(f"REFUSING: assets are already graded ({prev}).")
        print("Grading again would stack the curve. Rebuild first:")
        print("    python tools/build_images.py")
        print("    python tools/grade.py apply <strength>")
        return 1

    targets = list(GRADE_LIST)
    for stem in GRADE_PROJECT_STEMS:
        targets += [f"projects/{stem}-thumb.webp", f"projects/{stem}-full.webp"]

    done = 0
    for rel in targets:
        p = os.path.join(IMG, rel)
        if not os.path.exists(p):
            print("  missing", rel)
            continue
        im = Image.open(p)
        q = 82 if "-full" in rel or rel.startswith(("transitions/", "walk/")) else 76
        grade(im, strength).save(p, "WEBP", quality=q, method=5)
        done += 1

    with open(MARKER, "w") as f:
        f.write(f"strength={strength}")
    print(f"graded {done} images at strength {strength}")
    return 0


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--force"]
    force = "--force" in sys.argv
    mode = args[0] if args else "preview"
    s = float(args[1]) if len(args) > 1 else 0.55
    if mode == "preview":
        preview(s)
    else:
        sys.exit(apply(s, force) or 0)
