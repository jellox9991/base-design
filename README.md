# BASE — Architecture & Interior Design

Portfolio site for **BASE**, a Kuwait-based architecture and interior design studio.
Architecture · Interior design · BOQ & cost estimation · 3D visualization.

**Live:** https://jellox9991.github.io/base-design/

Static HTML/CSS/JS. No build step, no dependencies, no framework.
The whole site is ~8 MB including every image.

---

## Editing the site

You only ever need to touch two files.

### 1. `js/config.js` — your contact details

```js
window.SITE = {
  whatsapp: "96555512345",        // digits only, no + and no spaces
  phoneDisplay: "+965 5551 2345",
  email: "info@yourdomain.com",
  instagram: "https://instagram.com/your.handle",
  instagramHandle: "@your.handle",
  formEndpoint: ""                // see "Contact form" below
};
```

### 2. `js/projects.js` — the work

Each project is one block. `cat` controls which filter buttons it appears
under (`architecture`, `interior`, `exterior`, `boq`). Every project needs
both an `en` and an `ar` version of its text.

```js
{
  id: "my-project",
  cat: ["interior"],
  cover: "myproject-01",          // stem of the cover image
  year: "2026",
  en: { title: "...", place: "...", meta: "...", desc: "..." },
  ar: { title: "...", place: "...", meta: "...", desc: "..." },
  images: ["myproject-01", "myproject-02", "myproject-03"]
}
```

UI text (buttons, headings, service descriptions) lives in `js/i18n.js`,
English and Arabic side by side.

---

## Adding new project images

Put the source files anywhere, then add them to `PROJECTS` in
`tools/build_images.py` and run:

```bash
python tools/build_images.py
```

The script writes two WebP derivatives per image into `assets/img/projects/`:

| derivative | width | used for |
|---|---|---|
| `-thumb.webp` | 1000 px | grid cards |
| `-full.webp`  | 2000 px | lightbox |

It also builds the exterior ⇄ interior comparison pairs, both cropped to an
identical 1800×1125 box so the slider lines up, and regenerates the logo and
social share image from the brand file.

Requires Pillow: `pip install pillow`

---

## Contact form

Out of the box the form opens WhatsApp with the enquiry pre-filled, so no
lead is lost even with nothing configured.

To receive enquiries by email instead, create a free form at
[formspree.io](https://formspree.io) and paste the endpoint URL into
`formEndpoint` in `js/config.js`. The form then posts by AJAX and shows an
inline confirmation.

---

## Running locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173

---

## Custom domain

1. Add a file named `CNAME` at the repo root containing your domain, e.g. `basedesign.com`
2. At your registrar, point the domain at GitHub Pages:
   - `A` records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - or a `CNAME` record for `www` to `jellox9991.github.io`
3. In the repo: **Settings → Pages → Custom domain**, then tick **Enforce HTTPS**

Also update the absolute URLs in `robots.txt` and `sitemap.xml`.

---

## What's in here

```
index.html                 one page, all sections
css/style.css              all styling, light/dark-proof, full RTL
js/config.js               contact details          ← edit
js/projects.js             project data             ← edit
js/i18n.js                 English + Arabic UI text
js/main.js                 behaviour
tools/build_images.py      image pipeline
assets/img/                optimized WebP output
```

## Features

- Bilingual English / Arabic with a real RTL layout, choice remembered
- Drag-to-reveal exterior ⇄ interior comparison sliders
- Filterable project grid with a keyboard-accessible lightbox
- WhatsApp-first contact, floating WhatsApp button
- SEO: meta tags, Open Graph, `ProfessionalService` structured data, sitemap
- Respects `prefers-reduced-motion`
