/* ============================================================
   BASE · BOQ — behaviour
   Plain JS, no libraries. Sections:
   1 helpers + language   2 iso building renderer   3 hero
   4 method stage         5 tower ascent             6 projects + modal
   7 ledger               8 reveal / cursor / nav    9 boot
   ============================================================ */
(function(){
"use strict";

var P = window.BOQ_PROJECTS || [];
var root = document.documentElement;
var LANG = "en";
try{ LANG = localStorage.getItem("boq-lang") === "ar" ? "ar" : "en"; }catch(e){}
if(/[?&]lang=ar/.test(location.search)) LANG = "ar";        // shareable Arabic link
if(/[?&]lang=en/.test(location.search)) LANG = "en";
var REDUCED = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
/* ?y=… = screenshot mode: no loader, no transitions, everything fully built */
var CAPTURE = /[?&]y=\d+/.test(location.search);
if(CAPTURE){ REDUCED = true; root.classList.add("cap"); }
var $ = function(s, el){ return (el||document).querySelector(s); };
var $$ = function(s, el){ return Array.prototype.slice.call((el||document).querySelectorAll(s)); };

/* ---------- 1. helpers + language ---------- */
function fmt(n, dp){
  if(n == null) return "—";
  return n.toLocaleString(LANG === "ar" ? "ar-EG" : "en-US", { minimumFractionDigits: dp||0, maximumFractionDigits: dp||0 });
}
function t(p){ return p[LANG] || p.en; }
var KIND = {
  tower:{ en:"Tower", ar:"برج" }, villa:{ en:"Villa", ar:"فيلا" },
  chalet:{ en:"Chalet", ar:"شاليه" }, commercial:{ en:"Commercial", ar:"تجاري" }
};
var L = {
  conc:{ en:"Concrete", ar:"خرسانة" }, steel:{ en:"Steel", ar:"حديد" },
  ratio:{ en:"kg / m³", ar:"كغ / م³" }, levels:{ en:"Storeys", ar:"أدوار" },
  src:{ en:"Source", ar:"المصدر" }, proj:{ en:"Project", ar:"مشروع" },
  t:{ en:"t", ar:"طن" }, m3:{ en:"m³", ar:"م³" }, na:{ en:"not published", ar:"غير منشور" }
};
function l(k){ return L[k][LANG]; }

function applyLang(){
  root.lang = LANG; root.dir = LANG === "ar" ? "rtl" : "ltr";
  $$("[data-en]").forEach(function(el){
    var v = el.getAttribute("data-" + LANG); if(v != null) el.textContent = v;
  });
  $("#langBtn").textContent = LANG === "ar" ? "EN" : "عربي";
  buildMarquee(); renderCards(); renderBars(); setStage(stageIdx, true);
  updateAscent(true);
  if(modalIdx >= 0) fillModal();
  $$(".count").forEach(function(el){ if(el._done) el.textContent = fmt(TOT[el.dataset.key]); });
}

/* totals across the archive */
var TOT = { concrete:0, steel:0, projects:P.length, levels:0 };
P.forEach(function(p){ TOT.concrete += p.concrete||0; TOT.steel += p.steel||0; TOT.levels += p.levels||0; });
TOT.concrete = Math.round(TOT.concrete); TOT.steel = Math.round(TOT.steel);

/* ---------- 2. isometric building renderer ----------
   Draws a stack of slabs + columns in true isometric, rotated about Z.
   o = { levels, w, d, h (storey m), built (0..levels, fractional), rot (rad),
         cx, cy (0..1 centre in canvas), pad, glow, scan }               */
var C30 = Math.cos(Math.PI/6), S30 = Math.sin(Math.PI/6);

function fitCanvas(cv){
  var dpr = Math.min(window.devicePixelRatio||1, 2);
  var r = cv.getBoundingClientRect();
  var W = Math.max(1, Math.round(r.width*dpr)), H = Math.max(1, Math.round(r.height*dpr));
  if(cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
  return { W:W, H:H, dpr:dpr };
}

function drawBuilding(cv, o){
  var f = fitCanvas(cv), W = f.W, H = f.H, ctx = cv.getContext("2d");
  ctx.clearRect(0,0,W,H);
  var hgt = o.levels * o.h;
  var r = Math.sqrt(o.w*o.w + o.d*o.d)/2;
  var spanX = 2*Math.SQRT2*r*C30, spanY = 2*Math.SQRT2*r*S30 + hgt;
  var pad = (o.pad==null ? .12 : o.pad);
  var s = Math.min(W*(1-2*pad)/spanX, H*(1-2*pad)/spanY) * (o.zoom||1);
  var ox = W*(o.cx==null?.5:o.cx), oy = H*(o.cy==null?.5:o.cy) + (hgt*s)/2;
  var ca = Math.cos(o.rot||0), sa = Math.sin(o.rot||0);
  function pr(x,y,z){
    var X = x*ca - y*sa, Y = x*sa + y*ca;
    return [ox + (X - Y)*C30*s, oy + (X + Y)*S30*s - z*s];
  }
  var hw = o.w/2, hd = o.d/2;
  var corners = [[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]];
  var lw = Math.max(1, f.dpr*.8);

  /* ground: hairline plate + soft shadow */
  ctx.save();
  var g0 = pr(0,0,0);
  var grad = ctx.createRadialGradient(g0[0], g0[1], 0, g0[0], g0[1], r*s*1.9);
  grad.addColorStop(0, o.glow ? "rgba(249,1,48,.16)" : "rgba(255,255,255,.06)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.ellipse(g0[0], g0[1], r*s*1.9*C30*1.15, r*s*1.9*S30*1.15, 0, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = lw;
  var m = 1.35, k;
  for(k=-4;k<=4;k++){
    var a1 = pr(-hw*m, k*hd*m/4, 0), a2 = pr(hw*m, k*hd*m/4, 0);
    var b1 = pr(k*hw*m/4, -hd*m, 0), b2 = pr(k*hw*m/4, hd*m, 0);
    ctx.beginPath(); ctx.moveTo(a1[0],a1[1]); ctx.lineTo(a2[0],a2[1]); ctx.moveTo(b1[0],b1[1]); ctx.lineTo(b2[0],b2[1]); ctx.stroke();
  }
  ctx.restore();

  /* column grid */
  var nx = Math.max(2, Math.round(o.w/7)+1), ny = Math.max(2, Math.round(o.d/7)+1);
  var cols = [];
  for(var i=0;i<nx;i++) for(var j=0;j<ny;j++){
    var edge = (i===0||j===0||i===nx-1||j===ny-1);
    cols.push([-hw + o.w*i/(nx-1), -hd + o.d*j/(ny-1), edge]);
  }
  /* order columns back-to-front for the current rotation */
  cols.sort(function(A,B){ return (A[0]*ca - A[1]*sa + A[0]*sa + A[1]*ca) - (B[0]*ca - B[1]*sa + B[0]*sa + B[1]*ca); });

  /* which side faces show */
  var faces = [];
  for(k=0;k<4;k++){
    var A = corners[k], B = corners[(k+1)%4];
    var nxv = (B[1]-A[1]), nyv = -(B[0]-A[0]);              // outward normal (ccw)
    var NX = nxv*ca - nyv*sa, NY = nxv*sa + nyv*ca;
    if(NX + NY > 0) faces.push([A,B, (NX - NY)]);
  }

  var built = Math.max(0, Math.min(o.levels, o.built));
  var full = Math.floor(built), frac = built - full;
  var slabT = Math.max(.3, o.h*.09);

  function slab(z, alpha, hot){
    var top = corners.map(function(c){ return pr(c[0],c[1],z); });
    faces.forEach(function(fc){
      var a = pr(fc[0][0],fc[0][1],z), b = pr(fc[1][0],fc[1][1],z), c = pr(fc[1][0],fc[1][1],z-slabT), d = pr(fc[0][0],fc[0][1],z-slabT);
      ctx.fillStyle = "rgba(" + (fc[2] > 0 ? "58,58,58" : "34,34,34") + "," + alpha + ")";
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.lineTo(c[0],c[1]); ctx.lineTo(d[0],d[1]); ctx.closePath(); ctx.fill();
    });
    ctx.fillStyle = "rgba(22,22,22," + (alpha*.92) + ")";
    ctx.beginPath(); top.forEach(function(p,ix){ ix ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]); }); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = hot ? "rgba(249,1,48," + (.9*alpha) + ")" : "rgba(255,255,255," + (.55*alpha) + ")";
    ctx.lineWidth = lw; ctx.stroke();
  }
  function columns(z0, z1, alpha){
    ctx.lineWidth = lw*1.6;
    cols.forEach(function(c){
      var a = pr(c[0],c[1],z0), b = pr(c[0],c[1],z1);
      ctx.strokeStyle = "rgba(255,255,255," + ((c[2] ? .42 : .16)*alpha) + ")";
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
    });
  }
  function mesh(z, amt){
    ctx.strokeStyle = "rgba(249,1,48,.75)"; ctx.lineWidth = lw;
    var n = Math.max(6, Math.round(o.w/3)), mm = Math.max(4, Math.round(o.d/3)), q;
    ctx.beginPath();
    for(q=0;q<=n;q++){
      var x = -hw + o.w*q/n, p1 = pr(x,-hd,z), p2 = pr(x,-hd + o.d*Math.min(1,amt*1.6),z);
      ctx.moveTo(p1[0],p1[1]); ctx.lineTo(p2[0],p2[1]);
    }
    for(q=0;q<=mm;q++){
      var y = -hd + o.d*q/mm, p3 = pr(-hw,y,z), p4 = pr(-hw + o.w*Math.max(0,Math.min(1,amt*1.6-.4)),y,z);
      ctx.moveTo(p3[0],p3[1]); ctx.lineTo(p4[0],p4[1]);
    }
    ctx.stroke();
  }

  /* raft */
  slab(0, built > 0 ? 1 : .35, false);
  for(var lv=0; lv<full; lv++){
    columns(lv*o.h, (lv+1)*o.h, 1);
    slab((lv+1)*o.h, 1, false);
  }
  if(frac > 0 && full < o.levels){
    var z0 = full*o.h, zc = z0 + o.h*Math.min(1, frac*2);
    columns(z0, zc, 1);
    if(frac > .35) mesh(z0 + o.h, (frac-.35)/.4);
    if(frac > .7) slab(z0 + o.h, (frac-.7)/.3, true);
  }
  /* ghost of the unbuilt height */
  if(o.ghost && built < o.levels){
    ctx.setLineDash([3*f.dpr, 5*f.dpr]); ctx.strokeStyle = "rgba(255,255,255,.12)"; ctx.lineWidth = lw;
    corners.forEach(function(c){
      var a = pr(c[0],c[1], Math.ceil(built)*o.h), b = pr(c[0],c[1], hgt);
      ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.stroke();
    });
    var tp = corners.map(function(c){ return pr(c[0],c[1],hgt); });
    ctx.beginPath(); tp.forEach(function(p,ix){ ix ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]); }); ctx.closePath(); ctx.stroke();
    ctx.setLineDash([]);
  }
  /* scan line at the working level */
  if(o.scan && built > 0 && built < o.levels){
    var zs = built*o.h, sp = corners.map(function(c){ return pr(c[0]*1.25,c[1]*1.25,zs); });
    ctx.strokeStyle = "rgba(249,1,48,.5)"; ctx.lineWidth = lw;
    ctx.beginPath(); sp.forEach(function(p,ix){ ix ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]); }); ctx.closePath(); ctx.stroke();
  }
  return { pr:pr, s:s };
}

function storeyH(p){ return p.kind === "tower" ? 3.4 : (p.kind === "commercial" ? 4.6 : 3.8); }

/* ---------- 3. hero ---------- */
var hero = { cv:$("#heroCanvas"), t0:0, visible:true };
var HERO_P = P[0];
function heroFrame(now){
  if(!hero.t0) hero.t0 = now;
  var el = (now - hero.t0)/1000;
  var cycle = 16, ph = (el % cycle)/cycle;                     // build 0-.7, hold, fade
  var built = REDUCED ? HERO_P.levels : HERO_P.levels * Math.min(1, ph/.68);
  var mobile = window.innerWidth < 760;
  drawBuilding(hero.cv, { levels:HERO_P.levels, w:34, d:24, h:3.4, built:built,
    rot: -0.35 + el*0.05, cx: mobile ? .66 : (LANG === "ar" ? .28 : .72), cy:.53, pad: mobile ? .14 : .09, glow:true, scan:true, ghost:true });
  hero.cv.style.opacity = ph > .94 ? String(Math.max(.15, 1 - (ph-.94)/.06*.85)) : "1";
}

/* ---------- 4. method stage (SVG) ---------- */
var stageIdx = 0;
var STAGES = [
  { en:"Drawing", ar:"المخطط" }, { en:"Concrete", ar:"الخرسانة" }, { en:"Reinforcement", ar:"التسليح" },
  { en:"Schedules", ar:"الجداول" }, { en:"Workbook", ar:"ملف العميل" }
];
function iso(x,y,z){ return [300 + (x - y)*C30*26, 330 + (x + y)*S30*26 - z*26]; }
function poly(pts){ return pts.map(function(p){ return p[0].toFixed(1)+","+p[1].toFixed(1); }).join(" "); }
function lineLen(a,b){ return Math.hypot(b[0]-a[0], b[1]-a[1]); }

function buildStage(){
  var g = [], i, j, a, b;
  /* L0 — plan grid with bubbles (flat, drawn as iso plane) */
  var L0 = [];
  var xs = [-6,-2,2,6], ys = [-4,0,4];
  xs.forEach(function(x, n){
    a = iso(x,-6.5,0); b = iso(x,6.5,0);
    L0.push('<line class="draw" style="--len:'+lineLen(a,b).toFixed(0)+'" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="rgba(255,255,255,.35)" stroke-dasharray="6 4"/>');
    L0.push('<circle cx="'+a[0]+'" cy="'+a[1]+'" r="10" fill="none" stroke="rgba(255,255,255,.5)"/><text x="'+a[0]+'" y="'+(a[1]+4)+'" fill="rgba(255,255,255,.7)" font-size="10" text-anchor="middle" font-family="Outfit">'+"ABCD"[n]+'</text>');
  });
  ys.forEach(function(y, n){
    a = iso(-8.5,y,0); b = iso(8.5,y,0);
    L0.push('<line class="draw" style="--len:'+lineLen(a,b).toFixed(0)+'" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="rgba(255,255,255,.35)" stroke-dasharray="6 4"/>');
    L0.push('<circle cx="'+a[0]+'" cy="'+a[1]+'" r="10" fill="none" stroke="rgba(255,255,255,.5)"/><text x="'+a[0]+'" y="'+(a[1]+4)+'" fill="rgba(255,255,255,.7)" font-size="10" text-anchor="middle" font-family="Outfit">'+(n+1)+'</text>');
  });
  xs.forEach(function(x){ ys.forEach(function(y){
    L0.push('<polygon points="'+poly([iso(x-.4,y-.4,0),iso(x+.4,y-.4,0),iso(x+.4,y+.4,0),iso(x-.4,y+.4,0)])+'" fill="rgba(255,255,255,.75)"/>');
  }); });
  g.push('<g class="lyr" data-l="0">'+L0.join("")+'</g>');

  /* L1 — concrete: columns + two slabs */
  var L1 = [], H1 = 3.4;
  function box(x0,y0,x1,y1,z0,z1,top,side1,side2){
    return '<polygon points="'+poly([iso(x1,y0,z0),iso(x1,y1,z0),iso(x1,y1,z1),iso(x1,y0,z1)])+'" fill="'+side1+'"/>'+
           '<polygon points="'+poly([iso(x0,y1,z0),iso(x1,y1,z0),iso(x1,y1,z1),iso(x0,y1,z1)])+'" fill="'+side2+'"/>'+
           '<polygon points="'+poly([iso(x0,y0,z1),iso(x1,y0,z1),iso(x1,y1,z1),iso(x0,y1,z1)])+'" fill="'+top+'" stroke="rgba(255,255,255,.4)" stroke-width=".8"/>';
  }
  for(var lv=0; lv<2; lv++){
    var zb = lv*H1;
    xs.forEach(function(x){ ys.forEach(function(y){
      L1.push(box(x-.4,y-.4,x+.4,y+.4,zb,zb+H1,"#3a3a3a","#2c2c2c","#1f1f1f"));
    }); });
    L1.push(box(-7,-5,7,5,zb+H1-.35,zb+H1,"rgba(30,30,30,.92)","#3b3b3b","#262626"));
  }
  g.push('<g class="lyr" data-l="1">'+L1.join("")+'</g>');

  /* L2 — rebar mesh on the top slab + column cages */
  var L2 = [], zt = 2*H1+.02;
  for(i=0;i<=14;i++){ a = iso(-7+i,-5,zt); b = iso(-7+i,5,zt);
    L2.push('<line class="draw" style="--len:'+lineLen(a,b).toFixed(0)+'" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#f90130" stroke-width="1.1"/>'); }
  for(j=0;j<=10;j++){ a = iso(-7,-5+j,zt); b = iso(7,-5+j,zt);
    L2.push('<line class="draw" style="--len:'+lineLen(a,b).toFixed(0)+'" x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#ff4d6d" stroke-width=".8" opacity=".8"/>'); }
  xs.forEach(function(x){ ys.forEach(function(y){
    a = iso(x,y,zt); b = iso(x,y,zt+2.2);
    L2.push('<line x1="'+a[0]+'" y1="'+a[1]+'" x2="'+b[0]+'" y2="'+b[1]+'" stroke="#f90130" stroke-width="1.6"/>');
  }); });
  g.push('<g class="lyr" data-l="2">'+L2.join("")+'</g>');

  /* L3 — schedule panel */
  var rows = [["Footings","m³","312.50"],["Columns","m³","128.70"],["Beams","m³","256.40"],["Slabs","m³","842.30"],["Ø12","t","18.42"],["Ø16","t","31.07"]];
  var L3 = ['<rect x="300" y="64" width="268" height="232" rx="2" fill="rgba(6,6,6,.94)" stroke="rgba(255,255,255,.18)"/>',
            '<text x="318" y="92" fill="#f90130" font-size="10" letter-spacing="3" font-family="Outfit">SCHEDULE · LEVEL 01</text>'];
  rows.forEach(function(r, n){
    var y = 124 + n*28;
    L3.push('<line x1="318" y1="'+(y+10)+'" x2="550" y2="'+(y+10)+'" stroke="rgba(255,255,255,.08)"/>');
    L3.push('<text x="318" y="'+y+'" fill="rgba(255,255,255,.75)" font-size="12" font-family="Outfit">'+r[0]+'</text>');
    L3.push('<text x="460" y="'+y+'" fill="rgba(255,255,255,.4)" font-size="11" font-family="Outfit">'+r[1]+'</text>');
    L3.push('<text x="550" y="'+y+'" fill="#fff" font-size="13" text-anchor="end" font-family="Cormorant Garamond">'+r[2]+'</text>');
  });
  g.push('<g class="lyr" data-l="3" style="transform-origin:430px 180px">'+L3.join("")+'</g>');

  /* L4 — workbook */
  var tabs = ["مقدمة","الملخص خرسانة","الملخص حديد","Summary","Slab","Beam"];
  var L4 = ['<rect x="34" y="370" width="532" height="200" rx="2" fill="#f4f1ec"/>',
            '<rect x="34" y="370" width="532" height="30" fill="#000"/>',
            '<text x="50" y="390" fill="#fff" font-size="11" letter-spacing="3" font-family="Outfit">CLIENT WORKBOOK · REV 02</text>',
            '<rect x="490" y="378" width="62" height="14" fill="#f90130"/><text x="521" y="389" fill="#fff" font-size="9" text-anchor="middle" font-family="Outfit">PDF ✓</text>'];
  [["Concrete","1,335.41","m³"],["Steel","163.59","t"],["BUA","2,348.7","m²"]].forEach(function(c, n){
    var x = 54 + n*172;
    L4.push('<text x="'+x+'" y="432" fill="#777" font-size="10" letter-spacing="2" font-family="Outfit">'+c[0].toUpperCase()+'</text>');
    L4.push('<text x="'+x+'" y="474" fill="#000" font-size="34" font-family="Cormorant Garamond">'+c[1]+'<tspan font-size="14" fill="#777"> '+c[2]+'</tspan></text>');
  });
  for(i=0;i<5;i++) L4.push('<rect x="54" y="'+(494+i*10)+'" width="'+(470 - i*62)+'" height="4" fill="rgba(0,0,0,'+(.1+i*.03)+')"/>');
  var tx = 34;
  tabs.forEach(function(tb, n){
    var wd = 14 + tb.length*7.2;
    L4.push('<rect x="'+tx+'" y="548" width="'+wd+'" height="22" fill="'+(n===1?"#fff":"#e2ddd5")+'" stroke="#cfc8bd"/>');
    L4.push('<text x="'+(tx+wd/2)+'" y="563" fill="'+(n===1?"#f90130":"#555")+'" font-size="10" text-anchor="middle" font-family="Tajawal,Outfit">'+tb+'</text>');
    tx += wd + 2;
  });
  g.push('<g class="lyr" data-l="4" style="transform-origin:300px 470px">'+L4.join("")+'</g>');
  $("#stageLayers").innerHTML = g.join("");
}

function setStage(n, force){
  if(n === stageIdx && !force) return;
  stageIdx = n;
  $$("#stage .lyr").forEach(function(el){
    var k = +el.getAttribute("data-l"), on = (k <= 2) ? k <= n : k === n;
    if(k === 0 && n >= 3) on = true;
    el.classList.toggle("show", on);
    el.style.opacity = on ? (k === 0 && n >= 1 ? ".45" : "1") : "0";
    el.style.transform = on ? "none" : (k >= 3 ? "translateY(26px) scale(.97)" : "translateY(-30px)");
  });
  $("#stageNo").textContent = LANG === "ar" ? ("٠" + fmt(n+1)) : ("0" + (n+1));
  $("#stageName").textContent = STAGES[n][LANG];
  $$(".step").forEach(function(s){ s.classList.toggle("on", +s.dataset.step === n); });
}

/* ---------- 5. tower ascent ---------- */
var asc = { sec:$("#ascent"), cv:$("#towerCanvas"), p:0, shown:-1, visible:false };
var ASC_P = P[0];   // the tallest — Al-Riggae
function levelName(i, n){
  var ar = LANG === "ar";
  if(i <= 0) return ar ? "اللبشة" : "Raft";
  if(i === 1) return ar ? "السرداب" : "Basement";
  if(i === 2) return ar ? "الأرضي" : "Ground";
  if(i >= n) return ar ? ("الدور " + fmt(n-2) + " · السطح") : ((n-2) + "F · Roof");
  return ar ? ("الدور " + fmt(i-2)) : ((i-2) + "F");
}
var CAP_P = /[?&]p=([\d.]+)/.exec(location.search);
function ascProgress(){
  if(CAPTURE && CAP_P) return Math.min(1, +CAP_P[1]);
  var r = asc.sec.getBoundingClientRect(), span = r.height - window.innerHeight;
  return Math.max(0, Math.min(1, -r.top / Math.max(1, span)));
}
function updateAscent(force){
  var p = asc.p, n = ASC_P.levels, built = p*n*1.04;
  var lvl = Math.min(n, Math.floor(built));
  if(force || lvl !== asc.shown){
    asc.shown = lvl;
    $("#aLevel").textContent = levelName(lvl, n);
  }
  var q = Math.min(1, built/n);
  $("#aConc").textContent = fmt(Math.round(ASC_P.concrete*q));
  $("#aSteel").textContent = fmt(ASC_P.steel*q, 1);
  $("#aBar").style.width = (q*100).toFixed(2) + "%";
}
function ascentFrame(now){
  var target = ascProgress();
  asc.p += (target - asc.p) * (REDUCED ? 1 : .12);
  var n = ASC_P.levels;
  var mobile = window.innerWidth < 860;
  drawBuilding(asc.cv, { levels:n, w:ASC_P.w, d:ASC_P.d, h:3.4, built:Math.min(n, asc.p*n*1.04),
    rot: -0.6 + asc.p*1.1 + Math.sin(now/4000)*.03, cx:.5, cy:.5, pad: mobile ? .06 : .05, glow:true, scan:true, ghost:true });
  updateAscent(false);
}

/* ---------- 6. projects + modal ---------- */
var filter = "all", sortKey = "concrete", list = [];
function sorted(){
  var a = P.slice();
  a.sort(function(x,y){
    if(sortKey === "no") return x.no < y.no ? -1 : 1;
    var vx = x[sortKey], vy = y[sortKey];
    if(vx == null && vy == null) return x.no < y.no ? -1 : 1;
    if(vx == null) return 1; if(vy == null) return -1;
    return vy - vx;
  });
  return a;
}
var cardArt = [];
function renderCards(){
  var grid = $("#grid");
  list = sorted().filter(function(p){ return filter === "all" || p.kind === filter; });
  grid.innerHTML = list.map(function(p, i){
    var tx = t(p);
    return '<article class="card" data-i="'+i+'" tabindex="0" role="button" aria-label="'+tx.name+'">'+
      '<div class="card-top"><span><b>'+p.no+'</b> · '+KIND[p.kind][LANG]+'</span><span>'+p.source+'</span></div>'+
      '<span class="card-arrow" aria-hidden="true">'+(LANG==="ar"?"↖":"↗")+'</span>'+
      '<div class="card-art"><canvas></canvas></div>'+
      '<h3>'+tx.name+'</h3><p class="place">'+tx.place+' · '+fmt(p.levels)+' '+l("levels")+'</p>'+
      '<div class="card-q">'+
        '<div><small>'+l("conc")+'</small>'+(p.concrete!=null ? '<b>'+fmt(Math.round(p.concrete))+'</b><em>'+l("m3")+'</em>' : '<b class="na">'+l("na")+'</b>')+'</div>'+
        '<div><small>'+l("steel")+'</small>'+(p.steel!=null ? '<b>'+fmt(p.steel,1)+'</b><em>'+l("t")+'</em>' : '<b class="na">'+l("na")+'</b>')+'</div>'+
      '</div></article>';
  }).join("");
  cardArt = $$(".card", grid).map(function(el, i){
    var c = { el:el, cv:$("canvas", el), p:list[i], built:0, target:0, rot:-0.5 + (i%3)*.15, hover:false, dirty:true };
    el.addEventListener("mouseenter", function(){ c.hover = true; });
    el.addEventListener("mouseleave", function(){ c.hover = false; });
    el.addEventListener("pointermove", function(e){
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px"); el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
    el.addEventListener("click", function(){ openModal(i); });
    el.addEventListener("keydown", function(e){ if(e.key === "Enter" || e.key === " "){ e.preventDefault(); openModal(i); } });
    io.observe(el);
    return c;
  });
}
function cardsFrame(){
  cardArt.forEach(function(c){
    if(!c.inview) return;
    var moving = false;
    if(REDUCED && c.target) c.built = c.target;
    if(c.built < c.target - .01){ c.built += (c.target - c.built)*.06 + .02; moving = true; }
    if(c.hover){ c.rot += .012; moving = true; }
    if(moving || c.dirty){
      c.dirty = false;
      drawBuilding(c.cv, { levels:c.p.levels, w:c.p.w, d:c.p.d, h:storeyH(c.p), built:Math.min(c.built, c.p.levels),
        rot:c.rot, cx:.5, cy:.52, pad:.1, glow:c.hover, ghost:true });
    }
  });
}

var modalIdx = -1, modal = { el:$("#modal"), cv:$("#modalCanvas"), built:0, rot:-.5, t0:0 };
function openModal(i){
  modalIdx = i; modal.built = 0; modal.rot = -.7; fillModal();
  modal.el.classList.add("open"); modal.el.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  setTimeout(function(){ $(".modal-x").focus(); }, 50);
}
function closeModal(){
  modal.el.classList.remove("open"); modal.el.setAttribute("aria-hidden","true");
  document.body.style.overflow = ""; var c = cardArt[modalIdx]; modalIdx = -1;
  if(c) c.el.focus();
}
function fillModal(){
  var p = list[modalIdx]; if(!p) return; var tx = t(p);
  $("#mNo").textContent = l("proj") + " " + p.no + " · " + KIND[p.kind][LANG] + " · " + l("src") + ": " + p.source;
  $("#mName").textContent = tx.name; $("#mPlace").textContent = tx.place;
  $("#mScope").textContent = tx.scope; $("#mNote").textContent = tx.note;
  var ratio = (p.concrete && p.steel) ? fmt(Math.round(p.steel*1000/p.concrete)) : "—";
  $("#mStats").innerHTML =
    '<div><small>'+l("conc")+' '+l("m3")+'</small><b>'+(p.concrete!=null?fmt(p.concrete,1):"—")+'</b></div>'+
    '<div><small>'+l("steel")+' '+l("t")+'</small><b>'+(p.steel!=null?fmt(p.steel,1):"—")+'</b></div>'+
    '<div><small>'+l("ratio")+'</small><b>'+ratio+'</b></div>';
}
function modalFrame(){
  if(modalIdx < 0) return;
  var p = list[modalIdx];
  modal.built += (p.levels - modal.built)*.04 + .01;
  modal.rot += .004;
  drawBuilding(modal.cv, { levels:p.levels, w:p.w, d:p.d, h:storeyH(p), built:Math.min(modal.built, p.levels), rot:modal.rot, cx:.5, cy:.5, pad:.12, glow:true, scan:true, ghost:true });
}
function stepModal(d){ if(!list.length) return; modalIdx = (modalIdx + d + list.length) % list.length; modal.built = 0; fillModal(); }

/* ---------- 7. ledger ---------- */
var ledgerMode = "concrete", ledgerShown = false;
function renderBars(){
  var rows = P.map(function(p){
    var v = ledgerMode === "ratio" ? ((p.concrete && p.steel) ? p.steel*1000/p.concrete : null) : p[ledgerMode];
    return { p:p, v:v };
  }).filter(function(r){ return r.v != null; }).sort(function(a,b){ return b.v - a.v; });
  var max = rows.length ? rows[0].v : 1;
  var el = $("#bars");
  el.innerHTML = rows.map(function(r){
    var dp = ledgerMode === "steel" ? 1 : 0;
    return '<div class="bar '+r.p.kind+'" data-no="'+r.p.no+'"><span class="bn"><b>'+r.p.no+'</b>'+t(r.p).name+'</span>'+
      '<span class="bt"><i data-w="'+(r.v/max*100).toFixed(2)+'"></i></span><span class="bv">'+fmt(r.v, dp)+'</span></div>';
  }).join("");
  $$(".bar", el).forEach(function(b){
    b.addEventListener("click", function(){
      filter = "all"; $$("#filters button").forEach(function(x){ x.classList.toggle("on", x.dataset.f === "all"); });
      renderCards();
      var i = list.findIndex(function(p){ return p.no === b.dataset.no; }); if(i >= 0) openModal(i);
    });
  });
  if(ledgerShown) growBars();
}
function growBars(){
  $$("#bars i").forEach(function(i, n){
    i.style.width = "0";
    setTimeout(function(){ i.style.width = i.dataset.w + "%"; }, 30 + n*45);
  });
}

/* ---------- 8. reveal / cursor / nav / marquee ---------- */
var io = new IntersectionObserver(function(ents){
  ents.forEach(function(e){
    var el = e.target;
    if(el.classList.contains("card")){
      var c = cardArt.filter(function(x){ return x.el === el; })[0];
      if(c){ c.inview = e.isIntersecting; c.dirty = true; if(e.isIntersecting) c.target = c.p.levels; }
      if(e.isIntersecting){ setTimeout(function(){ el.classList.add("in"); }, (+el.dataset.i % 3)*90); }
      return;
    }
    if(e.isIntersecting){ el.classList.add("in"); if(!el.classList.contains("card")) io.unobserve(el); }
  });
}, { rootMargin:"0px 0px -8% 0px", threshold:.08 });

function buildMarquee(){
  var items = P.map(function(p){ return '<span><b>'+p.no+'</b>'+t(p).name+'</span>'; }).join("");
  $("#marquee").innerHTML = items + items;
}

function countUp(){
  $$(".count").forEach(function(el){
    var end = TOT[el.dataset.key], t0 = performance.now(), dur = REDUCED ? 1 : 2400;
    (function tick(now){
      var k = Math.min(1, (now - t0)/dur), e = 1 - Math.pow(1-k, 4);
      el.textContent = fmt(Math.round(end*e));
      if(k < 1) requestAnimationFrame(tick); else el._done = true;
    })(t0);
  });
}

function initCursor(){
  var cur = $("#cursor"); if(!cur || matchMedia("(hover:none)").matches) return;
  var x = -100, y = -100, cx = x, cy = y;
  window.addEventListener("pointermove", function(e){ x = e.clientX; y = e.clientY; cur.classList.add("on"); });
  document.addEventListener("pointerover", function(e){ cur.classList.toggle("big", !!e.target.closest(".card,.bar,.reel figure")); });
  (function loop(){ cx += (x-cx)*.2; cy += (y-cy)*.2; cur.style.transform = "translate("+cx+"px,"+cy+"px)"; requestAnimationFrame(loop); })();
}

function initReel(){
  var r = $("#reel"), down = false, sx = 0, sl = 0;
  r.addEventListener("pointerdown", function(e){ if(e.pointerType !== "mouse") return; down = true; sx = e.clientX; sl = r.scrollLeft; r.classList.add("drag"); });
  window.addEventListener("pointerup", function(){ down = false; r.classList.remove("drag"); });
  r.addEventListener("pointermove", function(e){ if(down){ r.scrollLeft = sl - (e.clientX - sx); } });
  $$("figure", r).forEach(function(f){ io.observe(f); });
}

var sections = ["method","ascent","projects","ledger","contact"].map(function(id){ return document.getElementById(id); });
function onScroll(){
  var y = window.scrollY, H = document.documentElement.scrollHeight - innerHeight;
  $("#progress").style.transform = "scaleX(" + (H > 0 ? y/H : 0) + ")";
  $("#nav").classList.toggle("solid", y > 40);
  /* method step = the step whose centre is nearest the viewport centre */
  var mid = innerHeight*.5, best = 0, bd = 1e9;
  $$(".step").forEach(function(s){ var r = s.getBoundingClientRect(), d = Math.abs(r.top + r.height/2 - mid); if(d < bd){ bd = d; best = +s.dataset.step; } });
  setStage(best);
  var cur = null;
  sections.forEach(function(s){ if(s.getBoundingClientRect().top < innerHeight*.4) cur = s.id; });
  $$(".nav-links a").forEach(function(a){ a.classList.toggle("cur", a.getAttribute("href") === "#" + cur); });
  var r = asc.sec.getBoundingClientRect(); asc.visible = r.bottom > 0 && r.top < innerHeight;
  var hr = hero.cv.getBoundingClientRect(); hero.visible = hr.bottom > 0;
  var lr = $("#bars").getBoundingClientRect();
  if(!ledgerShown && lr.top < innerHeight*.85){ ledgerShown = true; growBars(); }
}

/* ---------- 9. boot ---------- */
function frame(now){
  if(hero.visible) heroFrame(now);
  if(asc.visible) ascentFrame(now);
  cardsFrame(); modalFrame();
  requestAnimationFrame(frame);
}

function wire(){
  $("#langBtn").addEventListener("click", function(){
    LANG = LANG === "ar" ? "en" : "ar";
    try{ localStorage.setItem("boq-lang", LANG); }catch(e){}
    applyLang();
  });
  $$("#filters button").forEach(function(b){
    b.addEventListener("click", function(){
      filter = b.dataset.f; $$("#filters button").forEach(function(x){ x.classList.toggle("on", x === b); }); renderCards();
    });
  });
  $("#sort").addEventListener("change", function(e){ sortKey = e.target.value; renderCards(); });
  $$("#ledgerMode button").forEach(function(b){
    b.addEventListener("click", function(){
      ledgerMode = b.dataset.m; $$("#ledgerMode button").forEach(function(x){ x.classList.toggle("on", x === b); }); renderBars();
    });
  });
  $$("[data-close]").forEach(function(b){ b.addEventListener("click", closeModal); });
  $("#mPrev").addEventListener("click", function(){ stepModal(-1); });
  $("#mNext").addEventListener("click", function(){ stepModal(1); });
  document.addEventListener("keydown", function(e){
    if(modalIdx < 0) return;
    if(e.key === "Escape") closeModal();
    if(e.key === "ArrowRight") stepModal(LANG === "ar" ? -1 : 1);
    if(e.key === "ArrowLeft") stepModal(LANG === "ar" ? 1 : -1);
  });
  window.addEventListener("scroll", onScroll, { passive:true });
  window.addEventListener("resize", function(){ cardArt.forEach(function(c){ c.dirty = true; }); onScroll(); });
  $$(".sec-head, .method-stage, .contact-inner").forEach(function(el){ el.setAttribute("data-reveal",""); io.observe(el); });
}

function boot(){
  $("#yr").textContent = new Date().getFullYear();
  buildStage();
  wire();
  applyLang();
  initCursor(); initReel(); onScroll();
  /* ?y=1234 jumps to a scroll position (used for screenshots) */
  var qy = /[?&]y=(\d+)/.exec(location.search), qm = /[?&]m=(\d+)/.exec(location.search);
  if(CAPTURE && qm) setTimeout(function(){ openModal(+qm[1]); }, 300);
  if(qy) setTimeout(function(){ root.style.scrollBehavior = "auto"; window.scrollTo(0, +qy[1]); onScroll();
    document.body.setAttribute("data-offsets", ["method","ascent","projects","ledger","gallery","contact"].map(function(id){
      return id + ":" + Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY); }).join(" ")); }, 400);
  requestAnimationFrame(frame);
  /* loader: fill bar, then reveal */
  var bar = $(".loader-bar span"), pct = 0;
  var iv = setInterval(function(){
    pct = Math.min(100, pct + 9 + Math.random()*16); bar.style.width = pct + "%";
    if(pct >= 100){
      clearInterval(iv);
      setTimeout(function(){ $("#loader").classList.add("done"); document.body.classList.add("ready"); countUp(); }, REDUCED ? 0 : 260);
    }
  }, REDUCED ? 1 : 90);
}
if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
