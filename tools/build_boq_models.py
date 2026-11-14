"""Build boq/models/<no>.js — the real structural geometry of each BOQ project,
taken from the Revit host exports the bridge wrote during modelling.

Read-only on the project folders; writes only into base-design/boq/models/.
Run:  python tools/build_boq_models.py            (all projects)
      python tools/build_boq_models.py 012 021    (some)

Output format (all lengths in decimetres, integers, origin = model centre at ground):
  {"no": "012", "bb": [w, d, zmin, zmax] (m), "lv": [[z_dm, "name"], ...],
   "e": [[kind, z0, z1, vol_dl, x1, y1, x2, y2, ...], ...]}       # sorted bottom-up
  kind: 0 slab/raft/footing-slab, 1 column, 2 beam, 3 foundation, 4 wall
"""
import json, os, sys, glob, math, re

sys.path.insert(0, os.path.dirname(__file__))
from scan_boq_hosts import DIRS, candidates, load, score  # noqa: E402

OUT = os.path.join(os.path.dirname(__file__), "..", "boq", "models")
DM = 100.0   # mm per output unit


def area(loop):
    a = 0.0
    for i in range(len(loop)):
        x1, y1 = loop[i][0], loop[i][1]
        x2, y2 = loop[(i + 1) % len(loop)][0], loop[(i + 1) % len(loop)][1]
        a += x1 * y2 - x2 * y1
    return a / 2.0


def simplify(pts):
    """round to dm, drop repeats and collinear points, make ccw"""
    out = []
    for p in pts:
        q = (round(p[0] / DM), round(p[1] / DM))
        if not out or q != out[-1]:
            out.append(q)
    if len(out) > 1 and out[0] == out[-1]:
        out.pop()
    changed = True
    while changed and len(out) > 3:
        changed = False
        for i in range(len(out)):
            a, b, c = out[i - 1], out[i], out[(i + 1) % len(out)]
            if (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) == 0:
                out.pop(i)
                changed = True
                break
    if len(out) >= 3 and area(out) < 0:
        out.reverse()
    return out if len(out) >= 3 else None


def member_poly(m):
    o, X, Y = m.get("originMm"), m.get("x"), m.get("y")
    loc = m.get("local")
    if o and X and Y and loc and abs((m.get("z") or [0, 0, 1])[2]) > .99:
        (x0, y0, _), (x1, y1, _) = loc["minMm"], loc["maxMm"]
        pts = []
        for lx, ly in ((x0, y0), (x1, y0), (x1, y1), (x0, y1)):
            pts.append((o[0] + lx * X[0] + ly * Y[0], o[1] + lx * X[1] + ly * Y[1]))
        return pts
    mn, mx = m.get("minMm"), m.get("maxMm")
    if not mn:
        return None
    return [(mn[0], mn[1]), (mx[0], mn[1]), (mx[0], mx[1]), (mn[0], mx[1])]


WALL_T = re.compile(r"(\d{3})\s*(?:mm)?\b")


def rc_walls(root):
    """RC walls from the build batches (last batch wins per key)."""
    found = {}
    files = [p for p in glob.glob(os.path.join(root, "**", "*.json"), recursive=True)
             if "review-011" not in p and os.path.getsize(p) < 6e6
             and not re.search(r"(preview|result|verified|audit|hosts?|inv|rebar|bars)", os.path.basename(p), re.I)]
    for p in sorted(files, key=os.path.getmtime):
        try:
            with open(p, encoding="utf-8-sig") as f:
                ops = json.load(f)
        except Exception:
            continue
        if isinstance(ops, dict):
            ops = ops.get("ops") or ops.get("items") or []
        if not isinstance(ops, list):
            continue
        for op in ops:
            if not isinstance(op, dict) or op.get("kind") != "wall":
                continue
            mark = (op.get("mark") or "") + " " + (op.get("comments") or "")
            up = mark.upper()
            if not re.search(r"\bRC\b|RETAINING|SHEAR|CORE WALL|\bRW\b", up) or any(k in up for k in ("BLOCK", "BRICK", "MASON", "WHITE", "BLACK")):
                continue
            s, e = op.get("startMm"), op.get("endMm")
            if not s or not e:
                continue
            m = WALL_T.search(op.get("mark") or "")
            t = float(m.group(1)) if m else 250.0
            ee = op.get("expectedElevationMm")
            if ee:
                z0, z1 = ee[0], ee[1]
            else:
                z0 = s[2] if len(s) > 2 else 0
                z1 = z0 + (op.get("heightMm") or 3000)
            found[op.get("key") or (tuple(s), tuple(e))] = (s, e, t, z0, z1)
    return list(found.values())


def build(no, root):
    rows = []
    for p in candidates(root):
        d = load(p)
        if not d:
            continue
        fc, m, w = score(d)
        if fc + m:
            rows.append((fc + m + w, os.path.getmtime(p), p, d))
    if not rows:
        return None
    rows.sort(key=lambda r: (r[0], r[1]), reverse=True)
    _, _, src, d = rows[0]

    els = []      # (kind, z0, z1, vol, pts_mm)
    for f in d.get("floors") or []:
        faces = f.get("topFaces") or []
        loops = [lp for fc in faces for lp in (fc.get("loops") or [])]
        if not loops:
            continue
        outer = max(loops, key=lambda lp: abs(area(lp)))
        ztop = max(p[2] for p in outer)
        t = f.get("thicknessMm") or 200
        els.append((0, ztop - t, ztop, f.get("volumeM3") or 0, [(p[0], p[1]) for p in outer]))
    for m in d.get("members") or []:
        cat = m.get("category") or ""
        kind = 1 if "Column" in cat else 2 if "Framing" in cat else 3 if "Foundation" in cat else None
        if kind is None or not m.get("minMm"):
            continue
        pts = member_poly(m)
        if pts:
            els.append((kind, m["minMm"][2], m["maxMm"][2], m.get("volumeM3") or 0, pts))
    walls = rc_walls(root)
    for s, e, t, z0, z1 in walls:
        dx, dy = e[0] - s[0], e[1] - s[1]
        L = math.hypot(dx, dy)
        if L < 50:
            continue
        nx, ny = -dy / L * t / 2, dx / L * t / 2
        pts = [(s[0] + nx, s[1] + ny), (e[0] + nx, e[1] + ny), (e[0] - nx, e[1] - ny), (s[0] - nx, s[1] - ny)]
        els.append((4, z0, z1, L * t * (z1 - z0) / 1e9, pts))

    xs = [p[0] for e in els for p in e[4]]
    ys = [p[1] for e in els for p in e[4]]
    cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
    zmin = min(e[1] for e in els)
    zmax = max(e[2] for e in els)
    # ground = lowest slab top that covers most of the plan, else 0
    out = []
    for kind, z0, z1, vol, pts in els:
        poly = simplify([(p[0] - cx, p[1] - cy) for p in pts])
        if not poly or z1 - z0 < 20:
            continue
        row = [kind, round(z0 / DM), max(round(z1 / DM), round(z0 / DM) + 1), round(vol * 10)]
        for q in poly:
            row += [q[0], q[1]]
        out.append(row)
    out.sort(key=lambda r: (r[1], r[0] != 0, r[2]))

    skip = re.compile(r"excav|p\.?c\.?c|blind|beam|parapet|fence|haunch|pit|tank|sunk|base$|top of|ref", re.I)
    lv = sorted({(round(l["elevationMm"] / DM), l["name"]) for l in d.get("levels") or []
                 if not skip.search(l.get("name") or "")})
    model = {"no": no, "src": os.path.relpath(src, root).replace("\\", "/"),
             "bb": [round((max(xs) - min(xs)) / 1000, 2), round((max(ys) - min(ys)) / 1000, 2),
                    round(zmin / 1000, 2), round(zmax / 1000, 2)],
             "lv": [[z, n] for z, n in lv], "e": out}
    os.makedirs(OUT, exist_ok=True)
    # .js, not .json: browsers refuse fetch() on file://, a <script> tag works everywhere
    path = os.path.join(OUT, no + ".js")
    with open(path, "w", encoding="utf-8") as f:
        f.write("window.BOQ_MODEL&&BOQ_MODEL(")
        json.dump(model, f, ensure_ascii=False, separators=(",", ":"))
        f.write(");\n")
    stale = os.path.join(OUT, no + ".json")
    if os.path.exists(stale):
        os.remove(stale)
    vol = sum(r[3] for r in out) / 10
    return dict(no=no, src=model["src"], n=len(out), walls=len(walls), bb=model["bb"], vol=vol,
                kb=os.path.getsize(path) // 1024)


if __name__ == "__main__":
    only = sys.argv[1:]
    for no, root in DIRS.items():
        if only and no not in only:
            continue
        r = build(no, root)
        if not r:
            print(no, "NO DATA")
            continue
        print("%s  %5d el  %4d RC walls  %6.1f x %5.1f m  z %6.1f..%6.1f  vol %8.1f m3  %4d KB  %s" % (
            r["no"], r["n"], r["walls"], r["bb"][0], r["bb"][1], r["bb"][2], r["bb"][3], r["vol"], r["kb"], r["src"]))
