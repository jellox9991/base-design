"""List the Revit host exports for each BOQ project and how complete each one is.
Read-only. Run:  python tools/scan_boq_hosts.py
"""
import json, os, sys, glob, collections

FL = r"C:\Users\jalal\Desktop\JALAL\اعمال سابقة\j\FREELANCE"
CC = os.path.join(FL, "006-Creative City")
AS = os.path.join(FL, "017- ابو صياح")
DIRS = {
    "004": os.path.join(FL, "004"),
    "005": os.path.join(FL, "005- عمارة المنقف"),
    "006": os.path.join(CC, "006- نجربة المفرج"),
    "007": os.path.join(FL, "007"),
    "008": os.path.join(CC, "008- احمد ابراهيم"),
    "009": os.path.join(CC, "009- شاليه الشايجي"),
    "010": os.path.join(CC, "010- بدر العجمي"),
    "011": os.path.join(CC, "011- عمارة حولي"),
    "012": os.path.join(CC, "012- قسيمة الشطفة"),
    "014": os.path.join(CC, "014-عبدالمجيد المطوع"),
    "015": os.path.join(FL, "015 يوسف الراجحي"),
    "016": os.path.join(FL, "016"),
    "017": os.path.join(AS, "017- تجرية ابو صياح"),
    "018": os.path.join(AS, "018- اماتي الرفاعي"),
    "019": os.path.join(AS, "019- سالم مطر"),
    "020": os.path.join(FL, "020- م-مايكل -بدر البدر"),
    "021": os.path.join(AS, "021- برج الرقعي"),
    "022": os.path.join(FL, "022- فهد العتيبي"),
    "024": os.path.join(CC, "024- الشيخة نيران مبارك الصباح"),
}
EXCLUDE = ["review-011", os.sep + "asset" + os.sep]


def load(path):
    try:
        with open(path, encoding="utf-8-sig") as f:
            d = json.load(f)
    except Exception:
        return None
    d = d.get("data", d) if isinstance(d, dict) else None
    return d if isinstance(d, dict) else None


def candidates(root):
    out = []
    for p in glob.glob(os.path.join(root, "**", "*.json"), recursive=True):
        if any(x in p for x in EXCLUDE):
            continue
        n = os.path.basename(p).lower()
        if "host" not in n and "inv" not in n:
            continue
        if os.path.getsize(p) < 15000:
            continue
        out.append(p)
    return out


def score(d):
    fl = d.get("floors") or []
    mem = d.get("members") or []
    walls = d.get("walls") or []
    faces = sum(1 for f in fl if f.get("topFaces"))
    return faces, len(mem), len(walls)


if __name__ == "__main__":
    only = sys.argv[1:]
    for no, root in DIRS.items():
        if only and no not in only:
            continue
        rows = []
        for p in candidates(root):
            d = load(p)
            if not d:
                continue
            fc, m, w = score(d)
            if fc == 0 and m == 0:
                continue
            rows.append((fc + m + w, os.path.getmtime(p), fc, m, w, p))
        rows.sort(reverse=True)
        print("==", no, "candidates:", len(rows))
        for r in rows[:3]:
            cats = collections.Counter(x.get("category") for x in (load(r[5]).get("members") or []))
            print("   slabs %4d  members %5d  walls %4d  %s" % (r[2], r[3], r[4], os.path.relpath(r[5], root)))
            print("      ", dict(cats))
