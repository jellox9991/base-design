/* ============================================================
   BASE — behaviour
   ============================================================ */
(function () {
  "use strict";

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var IMG = "assets/img/projects/";
  var TRANS = "assets/img/transitions/";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------ language */
  var LS_KEY = "base-lang";
  var lang = localStorage.getItem(LS_KEY);
  if (lang !== "en" && lang !== "ar") {
    lang = (navigator.language || "").toLowerCase().indexOf("ar") === 0 ? "ar" : "en";
  }

  function t(key) {
    var d = window.I18N[lang] || window.I18N.en;
    return d[key] !== undefined ? d[key] : (window.I18N.en[key] || "");
  }

  function applyLang(l) {
    lang = l;
    localStorage.setItem(LS_KEY, l);

    var html = document.documentElement;
    html.setAttribute("lang", l);
    html.setAttribute("dir", l === "ar" ? "rtl" : "ltr");

    $$("[data-i18n]").forEach(function (el) {
      var v = t(el.getAttribute("data-i18n"));
      if (v) el.innerHTML = v;
    });

    document.title = l === "ar"
      ? "بيس — العمارة والتصميم الداخلي | الكويت"
      : "BASE — Architecture & Interior Design | Kuwait";

    buildCompares();
    buildWalk();
    buildLayers();
    buildGrid();
    applyFilter(currentFilter);
  }

  /* ------------------------------------------------ contact details */
  function applyConfig() {
    var s = window.SITE || {};
    var wa = "https://wa.me/" + (s.whatsapp || "");

    $$(".wa-float, #waLink").forEach(function (a) { a.href = wa; });
    var waLink = $("#waLink");
    if (waLink) waLink.textContent = s.phoneDisplay || "";

    var mail = $("#mailLink");
    if (mail && s.email) { mail.href = "mailto:" + s.email; mail.textContent = s.email; }

    // No Instagram yet? Hide the whole row rather than ship a dead link.
    var ig = $("#igLink");
    if (ig) {
      var row = ig.closest("li");
      if (s.instagram) {
        ig.href = s.instagram;
        ig.textContent = s.instagramHandle || s.instagram;
        if (row) row.removeAttribute("hidden");
      } else if (row) {
        row.setAttribute("hidden", "");
      }
    }

    var form = $("#contactForm");
    if (form && s.formEndpoint) form.setAttribute("action", s.formEndpoint);
  }

  /* ------------------------------------------------ nav */
  var nav = $("#nav");
  var burger = $("#burger");
  var navLinks = $("#navLinks");

  function onScroll() {
    nav.classList.toggle("is-stuck", window.scrollY > 40);
    var wa = $(".wa-float");
    if (wa) wa.classList.toggle("is-in", window.scrollY > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger) {
    burger.addEventListener("click", function () {
      var open = navLinks.classList.toggle("is-open");
      burger.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
    });
  }
  $$("#navLinks a").forEach(function (a) {
    a.addEventListener("click", function () {
      navLinks.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    });
  });

  var langBtn = $("#langBtn");
  if (langBtn) {
    langBtn.addEventListener("click", function () {
      applyLang(lang === "en" ? "ar" : "en");
    });
  }

  /* ------------------------------------------------ scroll spy */
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var id = e.target.id;
      $$("#navLinks a").forEach(function (a) {
        a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["walkthrough", "work", "services", "process", "about", "contact"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });

  /* ------------------------------------------------ reveal */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("is-in");
        revealIO.unobserve(e.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

  function watchReveals() {
    $$("[data-reveal]:not(.is-in), .step:not(.is-in)").forEach(function (el) {
      revealIO.observe(el);
    });
  }

  /* ------------------------------------------------ counters */
  var countIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      countIO.unobserve(e.target);
      var el = e.target;
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduced) { el.textContent = target + suffix; return; }
      var start = performance.now(), dur = 1500;
      (function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(start);
    });
  }, { threshold: 0.4 });
  $$("[data-count]").forEach(function (el) { countIO.observe(el); });

  /* ------------------------------------------------ compare sliders */
  function buildCompares() {
    var host = $("#compareList");
    if (!host || !window.COMPARES) return;

    host.innerHTML = window.COMPARES.map(function (c) {
      var d = c[lang] || c.en;
      return '' +
        '<figure class="compare" data-reveal>' +
          '<div class="compare__frame" style="--pos:50%">' +
            '<img class="compare__img compare__img--after" src="' + TRANS + c.slug + '-interior.webp" alt="' + d.title + ' — interior" loading="lazy" decoding="async">' +
            '<img class="compare__img compare__img--before" src="' + TRANS + c.slug + '-exterior.webp" alt="' + d.title + ' — exterior" loading="lazy" decoding="async">' +
            '<span class="compare__tag compare__tag--l">' + t("tagExterior") + '</span>' +
            '<span class="compare__tag compare__tag--r">' + t("tagInterior") + '</span>' +
            '<button class="compare__handle" type="button" role="slider" aria-label="' + t("dragHint") + '" ' +
              'aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" tabindex="0">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6 4 12l5 6M15 6l5 6-5 6" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>' +
            '</button>' +
          '</div>' +
          '<figcaption><strong>' + d.title + '</strong><span>' + d.meta + '</span></figcaption>' +
        '</figure>';
    }).join("");

    $$(".compare__frame", host).forEach(bindCompare);
    watchReveals();
  }

  function bindCompare(frame) {
    var handle = $(".compare__handle", frame);
    var dragging = false;

    function set(pct) {
      pct = Math.max(0, Math.min(100, pct));
      frame.style.setProperty("--pos", pct + "%");
      handle.setAttribute("aria-valuenow", Math.round(pct));
    }

    function fromEvent(e) {
      var r = frame.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      set((x / r.width) * 100);
    }

    function down(e) { dragging = true; fromEvent(e); e.preventDefault(); }
    function move(e) { if (dragging) fromEvent(e); }
    function up() { dragging = false; }

    frame.addEventListener("mousedown", down);
    frame.addEventListener("touchstart", down, { passive: false });
    window.addEventListener("mousemove", move);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("mouseup", up);
    window.addEventListener("touchend", up);

    // hover-to-scrub on desktop feels good and costs nothing
    frame.addEventListener("mousemove", function (e) { if (!dragging) fromEvent(e); });

    handle.addEventListener("keydown", function (e) {
      var cur = parseFloat(handle.getAttribute("aria-valuenow")) || 50;
      if (e.key === "ArrowLeft")  { set(cur - 4); e.preventDefault(); }
      if (e.key === "ArrowRight") { set(cur + 4); e.preventDefault(); }
      if (e.key === "Home")       { set(0);  e.preventDefault(); }
      if (e.key === "End")        { set(100); e.preventDefault(); }
    });
  }

  /* ------------------------------------------------ plan walkthrough */
  var walkIdx = 0, walkTimer = null;

  function buildWalk() {
    var W = window.WALKTHROUGH;
    var dots = $("#walkDots");
    if (!W || !dots) return;

    var plan = $("#walkPlan");
    if (plan) plan.src = W.plan;

    dots.innerHTML = W.stops.map(function (s, i) {
      var d = s[lang] || s.en;
      return '<button class="dot" type="button" data-i="' + i + '" ' +
             'style="left:' + s.x + '%;top:' + s.y + '%" ' +
             'aria-label="' + d.room + '">' + (i + 1) + '</button>';
    }).join("");

    $$(".dot", dots).forEach(function (d) {
      d.addEventListener("click", function () {
        stopWalk();
        showStop(parseInt(d.getAttribute("data-i"), 10));
      });
    });

    showStop(walkIdx);
  }

  function showStop(i) {
    var W = window.WALKTHROUGH;
    if (!W || !W.stops[i]) return;
    walkIdx = i;
    var s = W.stops[i];
    var d = s[lang] || s.en;

    var img = $("#walkImg");
    if (img) {
      img.src = s.img;
      img.alt = d.room;
      // restart the fade so each step reads as a move, not a swap
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "";
    }
    var room = $("#walkRoom"); if (room) room.textContent = d.room;
    var note = $("#walkNote"); if (note) note.textContent = d.note;
    var badge = $("#walkBadge"); if (badge) badge.textContent = (i + 1) + " / " + W.stops.length;

    $$(".dot").forEach(function (el) {
      el.classList.toggle("is-on", parseInt(el.getAttribute("data-i"), 10) === i);
    });
  }

  function stepWalk(n) {
    var len = (window.WALKTHROUGH && window.WALKTHROUGH.stops.length) || 1;
    showStop((walkIdx + n + len) % len);
  }

  function stopWalk() {
    if (walkTimer) { clearInterval(walkTimer); walkTimer = null; }
    var b = $("#walkPlay");
    if (b) b.classList.remove("is-playing");
    var ic = $("#walkPlayIcon");
    if (ic) ic.textContent = "▶";
    var lbl = $("#walkPlay span:last-child");
    if (lbl) lbl.textContent = t("walkPlay");
  }

  function startWalk() {
    stopWalk();
    walkTimer = setInterval(function () { stepWalk(1); }, 2600);
    var b = $("#walkPlay");
    if (b) b.classList.add("is-playing");
    var ic = $("#walkPlayIcon");
    if (ic) ic.textContent = "❚❚";
    var lbl = $("#walkPlay span:last-child");
    if (lbl) lbl.textContent = t("walkPause");
  }

  var wPlay = $("#walkPlay");
  if (wPlay) {
    wPlay.addEventListener("click", function () {
      if (walkTimer) stopWalk(); else startWalk();
    });
  }
  var wNext = $("#walkNext");
  if (wNext) wNext.addEventListener("click", function () { stopWalk(); stepWalk(1); });
  var wPrev = $("#walkPrev");
  if (wPrev) wPrev.addEventListener("click", function () { stopWalk(); stepWalk(-1); });

  // don't let it run while off-screen
  var walkSection = $("#walkthrough");
  if (walkSection) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (!e.isIntersecting) stopWalk(); });
    }, { threshold: 0.15 }).observe(walkSection);
  }

  /* ------------------------------------------------ build-up layers */
  var layIdx = 0;

  function buildLayers() {
    var L = window.LAYERS;
    var ticks = $("#layTicks");
    if (!L || !ticks) return;

    ticks.innerHTML = L.map(function (l, i) {
      var d = l[lang] || l.en;
      return '<li data-i="' + i + '">' + d.name + '</li>';
    }).join("");

    $$("li", ticks).forEach(function (li) {
      li.addEventListener("click", function () {
        showLayer(parseInt(li.getAttribute("data-i"), 10));
      });
    });

    var range = $("#layRange");
    if (range) {
      range.max = String(L.length - 1);
      range.value = String(layIdx);
      range.addEventListener("input", function () {
        showLayer(parseInt(range.value, 10));
      });
    }
    showLayer(layIdx);
  }

  function showLayer(i) {
    var L = window.LAYERS;
    if (!L || !L[i]) return;
    layIdx = i;
    var l = L[i];
    var d = l[lang] || l.en;

    var img = $("#layImg");
    if (img) {
      img.src = l.img;
      img.alt = d.name;
      img.style.animation = "none";
      void img.offsetWidth;
      img.style.animation = "";
    }
    var step = $("#layStep");
    if (step) step.textContent = String(i + 1).padStart(2, "0");
    var name = $("#layName"); if (name) name.textContent = d.name;
    var spec = $("#laySpec"); if (spec) spec.textContent = d.spec;
    var note = $("#layNote"); if (note) note.textContent = d.note;

    var range = $("#layRange");
    if (range && range.value !== String(i)) range.value = String(i);

    $$("#layTicks li").forEach(function (li) {
      li.classList.toggle("is-on", parseInt(li.getAttribute("data-i"), 10) === i);
    });
  }

  /* ------------------------------------------------ project grid */
  var currentFilter = "all";

  function catLabel(cats) {
    var map = { architecture: "fArch", interior: "fInt", exterior: "fExt", boq: "fBoq" };
    return cats.map(function (c) { return t(map[c]); }).join(" · ");
  }

  function buildGrid() {
    var host = $("#grid");
    if (!host || !window.PROJECTS) return;

    host.innerHTML = window.PROJECTS.map(function (p, i) {
      var d = p[lang] || p.en;
      return '' +
        '<article class="card" data-cat="' + p.cat.join(" ") + '" data-idx="' + i + '" data-reveal style="--d:' + (i % 3) * 90 + 'ms" tabindex="0" role="button" aria-label="' + d.title + '">' +
          '<div class="card__media">' +
            '<img src="' + IMG + p.cover + '-thumb.webp" alt="' + d.title + ', ' + d.place + '" loading="lazy" decoding="async">' +
          '</div>' +
          '<span class="card__go" aria-hidden="true">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 17 17 7M9 7h8v8"/></svg>' +
          '</span>' +
          '<div class="card__body">' +
            '<p class="card__cat">' + catLabel(p.cat) + '</p>' +
            '<h3 class="card__title">' + d.title + '</h3>' +
            '<p class="card__meta">' + d.place + ' · ' + p.year + ' · ' + p.images.length + ' ' + t("imagesLabel") + '</p>' +
          '</div>' +
        '</article>';
    }).join("");

    $$(".card", host).forEach(function (card) {
      function open() { openProject(parseInt(card.getAttribute("data-idx"), 10)); }
      card.addEventListener("click", open);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
      });
    });
    watchReveals();
  }

  function applyFilter(f) {
    currentFilter = f;
    $$(".chip").forEach(function (c) {
      c.classList.toggle("is-active", c.getAttribute("data-filter") === f);
    });
    $$(".card").forEach(function (card) {
      var cats = (card.getAttribute("data-cat") || "").split(" ");
      card.classList.toggle("is-hidden", f !== "all" && cats.indexOf(f) === -1);
    });
  }

  $$(".chip").forEach(function (c) {
    c.addEventListener("click", function () { applyFilter(c.getAttribute("data-filter")); });
  });

  /* ------------------------------------------------ lightbox */
  var lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  var gallery = [], gi = 0;

  function openProject(idx) {
    var p = window.PROJECTS[idx];
    if (!p) return;
    var d = p[lang] || p.en;
    gallery = p.images.map(function (stem, n) {
      return {
        src: IMG + stem + "-full.webp",
        cap: d.title + " · " + d.place + " · " + (n + 1) + "/" + p.images.length
      };
    });
    gi = 0;
    show();
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    $("#lbClose").focus();
  }

  function show() {
    if (!gallery[gi]) return;
    lbImg.src = gallery[gi].src;
    lbImg.alt = gallery[gi].cap;
    lbCap.textContent = gallery[gi].cap;
    // preload the neighbour
    var nxt = gallery[(gi + 1) % gallery.length];
    if (nxt) { var pre = new Image(); pre.src = nxt.src; }
  }

  function closeLb() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
  }
  function step(n) { gi = (gi + n + gallery.length) % gallery.length; show(); }

  $("#lbClose").addEventListener("click", closeLb);
  $("#lbNext").addEventListener("click", function () { step(1); });
  $("#lbPrev").addEventListener("click", function () { step(-1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });

  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  var tsx = 0;
  lb.addEventListener("touchstart", function (e) { tsx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    var dx = e.changedTouches[0].clientX - tsx;
    if (Math.abs(dx) > 55) step(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ------------------------------------------------ form */
  var form = $("#contactForm"), note = $("#formNote");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var s = window.SITE || {};
      var data = new FormData(form);

      // No endpoint configured yet → hand off to WhatsApp so no lead is lost.
      if (!s.formEndpoint) {
        var msg =
          "Name: " + (data.get("name") || "") + "\n" +
          "Phone: " + (data.get("phone") || "") + "\n" +
          "Type: " + (data.get("type") || "") + "\n\n" +
          (data.get("message") || "");
        window.open("https://wa.me/" + s.whatsapp + "?text=" + encodeURIComponent(msg), "_blank", "noopener");
        note.textContent = t("fOk");
        note.className = "form__note is-ok";
        form.reset();
        return;
      }

      note.textContent = t("fSending");
      note.className = "form__note";

      fetch(form.action, { method: "POST", body: data, headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          note.textContent = t("fOk");
          note.className = "form__note is-ok";
          form.reset();
        })
        .catch(function () {
          note.textContent = t("fErr");
          note.className = "form__note is-err";
        });
    });
  }

  /* ------------------------------------------------ go */
  var yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  applyConfig();
  applyLang(lang);
  watchReveals();
})();
