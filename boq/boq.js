/* ============================================================
   BASE · BOQ — behaviour
   Plain JS, no libraries. Sections:
   1 helpers + language   2 Revit-style renderer of the real models   3 hero
   4 method stage         5 tower ascent             6 projects + modal
   8 reveal / cursor / nav    9 boot
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
  t:{ en:"t", ar:"طن" }, m3:{ en:"m³", ar:"م³" }, na:{ en:"not published", ar:"غير منشور" },
  kasra:{ en:"Kasra plot", ar:"قسيمة كسرة" }
};
function l(k){ return L[k][LANG]; }

function applyLang(){
  root.lang = LANG; root.dir = LANG === "ar" ? "rtl" : "ltr";
  $$("[data-en]").forEach(function(el){
    var v = el.getAttribute("data-" + LANG); if(v != null) el.textContent = v;
  });
  $("#langBtn").textContent = LANG === "ar" ? "EN" : "عربي";
  buildMarquee(); renderCards(); setStage(stageIdx, true);
  asc.label = ""; updateAscent(); heroRestart();
  if(modalIdx >= 0) fillModal();
  $$(".count").forEach(function(el){ if(el._done) el.textContent = fmt(TOT[el.dataset.key]); });
}

/* totals across the archive */
var TOT = { concrete:0, steel:0, projects:P.length, levels:0 };
P.forEach(function(p){ TOT.concrete += p.concrete||0; TOT.steel += p.steel||0; TOT.levels += p.levels||0; });
TOT.concrete = Math.round(TOT.concrete); TOT.steel = Math.round(TOT.steel);

/* ---------- 2. Revit "Realistic" renderer for the REAL models ----------
   boq/models/<no>.js holds every slab, column, beam, footing and RC wall of
   the project's Revit model (exported by tools/build_boq_models.py).
   A View draws one model in true isometric, element by element, bottom-up,
   so a build animation is just "draw a few more elements each frame".   */
var C30 = Math.cos(Math.PI/6), S30 = Math.sin(Math.PI/6);

function fitCanvas(cv){
  var dpr = Math.min(window.devicePixelRatio||1, 2);
  var r = cv.getBoundingClientRect();
  var W = Math.max(1, Math.round(r.width*dpr)), H = Math.max(1, Math.round(r.height*dpr));
  if(cv.width !== W || cv.height !== H){ cv.width = W; cv.height = H; }
  return { W:W, H:H, dpr:dpr };
}

/* --- model loading --- */
var MODELS = {}, WAIT = {};
window.BOQ_MODEL = function(m){
  MODELS[m.no] = prepModel(m);
  (WAIT[m.no]||[]).forEach(function(f){ f(MODELS[m.no]); }); delete WAIT[m.no];
};
function getModel(no, cb){
  if(MODELS[no]){ cb(MODELS[no]); return; }
  if(WAIT[no]){ WAIT[no].push(cb); return; }
  WAIT[no] = [cb];
  var s = document.createElement("script"); s.src = "models/" + no + ".js"; s.async = true;
  s.onerror = function(){ delete WAIT[no]; };
  document.head.appendChild(s);
}
function hull2d(pts){
  pts = pts.slice().sort(function(a,b){ return a[0]-b[0] || a[1]-b[1]; });
  function cr(o,a,b){ return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]); }
  var lo = [], hi = [], i;
  for(i=0;i<pts.length;i++){ while(lo.length>1 && cr(lo[lo.length-2],lo[lo.length-1],pts[i]) <= 0) lo.pop(); lo.push(pts[i]); }
  for(i=pts.length-1;i>=0;i--){ while(hi.length>1 && cr(hi[hi.length-2],hi[hi.length-1],pts[i]) <= 0) hi.pop(); hi.push(pts[i]); }
  return lo.slice(0,-1).concat(hi.slice(0,-1));
}
function prepModel(m){
  var all = [];
  var els = m.e.map(function(r){
    var pts = [], cx = 0, cy = 0, i;
    for(i=4;i<r.length;i+=2){ pts.push([r[i]/10, r[i+1]/10]); cx += r[i]/10; cy += r[i+1]/10; }
    cx /= pts.length; cy /= pts.length;
    var e = { k:r[0], z0:r[1]/10, z1:r[2]/10, v:r[3]/10, pts:pts, cx:cx, cy:cy };
    if(e.z1 > 0) for(i=0;i<pts.length;i++) all.push(pts[i]);
    return e;
  });
  var vol = 0; els.forEach(function(e){ vol += e.v; });
  return { no:m.no, w:m.bb[0], d:m.bb[1], zmin:m.bb[2], zmax:m.bb[3], vol:vol, els:els,
           lv:(m.lv||[]).map(function(l){ return [l[0]/10, l[1]]; }), hull:hull2d(all.length ? all : [[0,0],[1,0],[0,1]]) };
}

/* --- concrete texture: tinted tiles, one per shade step --- */
var TILES = null, SHADES = 14;
function tiles(){
  if(TILES) return TILES;
  var noise = document.createElement("canvas"); noise.width = noise.height = 128;
  var nx = noise.getContext("2d"), img = nx.createImageData(128,128), d = img.data, i;
  for(i=0;i<d.length;i+=4){
    var px = (i/4)%128, py = Math.floor(i/4/128);
    var n = Math.random()*26 - 13 + Math.sin(py*.09 + px*.011)*4;
    if(Math.random() < .01) n -= 34;
    d[i] = d[i+1] = d[i+2] = 128 + n; d[i+3] = 255;
  }
  nx.putImageData(img,0,0);
  TILES = { light:[], dark:[] };
  [["light",[208,204,196]],["dark",[150,147,141]]].forEach(function(spec){
    for(var k=0;k<SHADES;k++){
      var f = .5 + .55*k/(SHADES-1), c = document.createElement("canvas"); c.width = c.height = 128;
      var x = c.getContext("2d");
      x.fillStyle = "rgb("+Math.min(255,Math.round(spec[1][0]*f))+","+Math.min(255,Math.round(spec[1][1]*f))+","+Math.min(255,Math.round(spec[1][2]*f))+")";
      x.fillRect(0,0,128,128);
      x.globalAlpha = .16; x.globalCompositeOperation = "overlay"; x.drawImage(noise,0,0);
      TILES[spec[0]].push(c);
    }
  });
  return TILES;
}

/* --- a View: one model on one canvas at one angle --- */
function View(cv, M, o){
  this.cv = cv; this.M = M; this.o = o || {};
  this.rot = this.o.rot == null ? -0.62 : this.o.rot;
  this.order(); this.reset();
}
View.prototype.order = function(){
  var ca = Math.cos(this.rot), sa = Math.sin(this.rot), M = this.M;
  var keys = M.els.map(function(e, i){ return [Math.round(e.z0*2), (e.cx*ca - e.cy*sa) + (e.cx*sa + e.cy*ca), i]; });
  keys.sort(function(a,b){ return a[0]-b[0] || a[1]-b[1]; });
  this.list = keys.map(function(k){ return M.els[k[2]]; });
  this.zkey = keys.map(function(k){ return k[0]/2; });
};
View.prototype.reset = function(){
  var f = fitCanvas(this.cv), W = f.W, H = f.H, ctx = this.cv.getContext("2d"), o = this.o, M = this.M;
  this.ctx = ctx; this.dpr = f.dpr; this.W = W; this.H = H; this.i = 0; this.vol = 0;
  var VP = this.VP = !!o.viewport;
  var pats = this.pats = (VP ? tiles().light : tiles().dark).map(function(t){ return ctx.createPattern(t, "repeat"); });
  var r = Math.hypot(M.w, M.d)/2;
  var pad = o.pad == null ? .1 : o.pad;
  var ca = this.ca = Math.cos(this.rot), sa = this.sa = Math.sin(this.rot);
  /* fit the model's real on-screen outline at this angle, not a worst-case circle */
  var x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  M.hull.forEach(function(p){
    var X = p[0]*ca - p[1]*sa, Y = p[0]*sa + p[1]*ca, u = (X - Y)*C30, v = (X + Y)*S30;
    x0 = Math.min(x0, u); x1 = Math.max(x1, u);
    y0 = Math.min(y0, v - M.zmax); y1 = Math.max(y1, v - M.zmin);
  });
  var s = this.s = Math.min(W*(1-2*pad)/Math.max(1, x1 - x0), H*(1-2*pad)/Math.max(1, y1 - y0)) * (o.zoom||1);
  var ox = W*(o.cx == null ? .5 : o.cx) - s*(x0 + x1)/2, oy = H*(o.cy == null ? .5 : o.cy) - s*(y0 + y1)/2;
  this.pr = function(x,y,z){ var X = x*ca - y*sa, Y = x*sa + y*ca; return [ox + (X - Y)*C30*s, oy + (X + Y)*S30*s - z*s]; };
  /* camera-fixed sun, upper left (Revit default) */
  var Lx = -.15, Ly = 1.1, Lz = 1.3, Ln = Math.hypot(Lx,Ly,Lz);
  this.L = [Lx/Ln, Ly/Ln, Lz/Ln];
  ctx.setTransform(1,0,0,1,0,0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  ctx.clearRect(0,0,W,H);
  if(VP){
    var bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,"#b9d0e4"); bg.addColorStop(.5,"#e4edf4"); bg.addColorStop(.64,"#f4f2ed"); bg.addColorStop(1,"#d9d4c9");
    ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  } else {
    var g0 = this.pr(0,0,0), gr = ctx.createRadialGradient(g0[0], g0[1], 0, g0[0], g0[1], r*s*1.8);
    gr.addColorStop(0, "rgba(249,1,48,.13)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gr; ctx.beginPath(); ctx.ellipse(g0[0], g0[1], r*s*2.1*C30, r*s*2.1*S30, 0, 0, Math.PI*2); ctx.fill();
  }
  if(!o.noShadow) this.shadow(M.zmax);
  if(VP) this.chrome();
};
View.prototype.shadow = function(h){
  var ctx = this.ctx, L = this.L, ca = this.ca, sa = this.sa, pr = this.pr;
  var sl = Math.hypot(L[0],L[1]), SX = -L[0]/sl, SY = -L[1]/sl;
  var wx = SX*ca + SY*sa, wy = -SX*sa + SY*ca, len = Math.max(2, h)*.5, pts = [];
  this.M.hull.forEach(function(p){ pts.push(pr(p[0],p[1],0)); pts.push(pr(p[0]+wx*len, p[1]+wy*len, 0)); });
  var hp = hull2d(pts);
  ctx.save(); ctx.filter = "blur(" + Math.round(5*this.dpr) + "px)";
  ctx.fillStyle = this.VP ? "rgba(70,62,50,.26)" : "rgba(0,0,0,.6)";
  ctx.beginPath(); hp.forEach(function(p,i){ i ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]); }); ctx.closePath(); ctx.fill();
  ctx.restore();
};
View.prototype.el = function(e){
  var ctx = this.ctx, pr = this.pr, ca = this.ca, sa = this.sa, L = this.L, pats = this.pats, pts = e.pts, n = pts.length, k;
  ctx.lineWidth = Math.max(.6, this.dpr*.55); ctx.lineJoin = "round";
  ctx.strokeStyle = this.VP ? "rgba(45,40,32,.22)" : "rgba(0,0,0,.42)";
  var dim = (e.k === 3 || e.z1 <= 0) ? .9 : 1;
  for(k=0;k<n;k++){
    var A = pts[k], B = pts[(k+1)%n], nx = B[1]-A[1], ny = -(B[0]-A[0]), ln = Math.hypot(nx,ny);
    if(!ln) continue; nx /= ln; ny /= ln;
    var NX = nx*ca - ny*sa, NY = nx*sa + ny*ca;
    if(NX + NY <= 0) continue;
    var lit = .5 + .5*Math.max(0, NX*L[0] + NY*L[1]);
    var a = pr(A[0],A[1],e.z0), b = pr(B[0],B[1],e.z0), c = pr(B[0],B[1],e.z1), d = pr(A[0],A[1],e.z1);
    ctx.beginPath(); ctx.moveTo(a[0],a[1]); ctx.lineTo(b[0],b[1]); ctx.lineTo(c[0],c[1]); ctx.lineTo(d[0],d[1]); ctx.closePath();
    ctx.fillStyle = pats[Math.max(0, Math.min(SHADES-1, Math.round(((lit*dim) - .5)/.55*(SHADES-1))))]; ctx.fill(); ctx.stroke();
  }
  var top = .5 + .5*L[2];
  ctx.beginPath();
  for(k=0;k<n;k++){ var p = pr(pts[k][0], pts[k][1], e.z1); k ? ctx.lineTo(p[0],p[1]) : ctx.moveTo(p[0],p[1]); }
  ctx.closePath();
  ctx.fillStyle = pats[Math.max(0, Math.min(SHADES-1, Math.round(((top*dim) - .5)/.55*(SHADES-1))))]; ctx.fill(); ctx.stroke();
};
View.prototype.drawTo = function(n){
  n = Math.min(n, this.list.length);
  for(; this.i < n; this.i++){ var e = this.list[this.i]; this.el(e); this.vol += e.v; }
  if(this.VP && this.i >= this.list.length && !this.chromed){ this.chromed = true; this.chrome(); }
};
View.prototype.done = function(){ return this.i >= this.list.length; };
View.prototype.indexAtZ = function(z){              /* elements with z0 <= z */
  var lo = 0, hi = this.zkey.length;
  while(lo < hi){ var mid = (lo+hi) >> 1; if(this.zkey[mid] <= z) lo = mid+1; else hi = mid; }
  return lo;
};
/* ViewCube + {3D} view name */
View.prototype.chrome = function(){
  var ctx = this.ctx, dpr = this.dpr, W = this.W, H = this.H, ca = this.ca, sa = this.sa;
  var R = Math.min(Math.min(W,H)*.07, 19*dpr), cx = W - R*2.3, cy = R*2.2;
  function p(x,y,z){ var X = x*ca - y*sa, Y = x*sa + y*ca; return [cx + (X - Y)*C30*R, cy + (X + Y)*S30*R - z*R]; }
  ctx.save();
  ctx.lineWidth = Math.max(1, dpr*.7); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.strokeStyle = "rgba(90,105,125,.5)";
  ctx.beginPath(); ctx.ellipse(cx, cy + R*.8, R*1.65, R*.82, 0, 0, Math.PI*2); ctx.stroke();
  var nP = p(0,-1.8,-.8);
  ctx.fillStyle = "rgba(60,75,95,.9)"; ctx.font = "600 " + Math.round(R*.5) + "px Outfit, sans-serif"; ctx.fillText("N", nP[0], nP[1]);
  var c = [[-1,-1],[1,-1],[1,1],[-1,1]], LBL = ["BACK","RIGHT","FRONT","LEFT"], k;
  ctx.strokeStyle = "rgba(95,110,130,.9)";
  for(k=0;k<4;k++){
    var A = c[k], B = c[(k+1)%4], nx = B[1]-A[1], ny = -(B[0]-A[0]);
    var NX = nx*ca - ny*sa, NY = nx*sa + ny*ca; if(NX + NY <= 0) continue;
    var q = [p(A[0]*.8,A[1]*.8,-.8),p(B[0]*.8,B[1]*.8,-.8),p(B[0]*.8,B[1]*.8,.8),p(A[0]*.8,A[1]*.8,.8)];
    ctx.fillStyle = (NX - NY) > 0 ? "#eef1f4" : "#e0e5ea";
    ctx.beginPath(); q.forEach(function(pt,i){ i ? ctx.lineTo(pt[0],pt[1]) : ctx.moveTo(pt[0],pt[1]); }); ctx.closePath(); ctx.fill(); ctx.stroke();
    var mid = p((A[0]+B[0])*.4,(A[1]+B[1])*.4,0), faceW = Math.abs(q[1][0] - q[0][0]);
    ctx.font = Math.max(6*dpr, Math.round(R*.25)) + "px Outfit, sans-serif";
    if(ctx.measureText(LBL[k]).width < faceW*.9){ ctx.fillStyle = "rgba(55,68,86,.85)"; ctx.fillText(LBL[k], mid[0], mid[1]); }
  }
  var top = c.map(function(a){ return p(a[0]*.8,a[1]*.8,.8); });
  ctx.fillStyle = "#f8fafb"; ctx.beginPath(); top.forEach(function(pt,i){ i ? ctx.lineTo(pt[0],pt[1]) : ctx.moveTo(pt[0],pt[1]); }); ctx.closePath(); ctx.fill(); ctx.stroke();
  var tc = p(0,0,.8); ctx.fillStyle = "rgba(55,68,86,.85)"; ctx.fillText("TOP", tc[0], tc[1]);
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "rgba(50,60,75,.8)"; ctx.font = (10.5*dpr) + "px Outfit, sans-serif";
  ctx.fillText("{3D}  ·  Realistic", 10*dpr, H - 10*dpr);
  ctx.restore();
};

/* ---------- 3. hero — the real Jabriya tower building itself ---------- */
var hero = { cv:$("#heroCanvas"), visible:true, view:null, phase:"build", t:0, n:0, rots:[-0.62,-0.98,-0.3] };
var HERO_NO = "019";
function heroFrame(now){
  var M = MODELS[HERO_NO]; if(!M) return;
  var mobile = window.innerWidth < 760;
  if(!hero.view){
    hero.view = new View(hero.cv, M, { rot:hero.rots[hero.n % hero.rots.length], cx: mobile ? .66 : (LANG === "ar" ? .28 : .72),
      cy:.52, pad: mobile ? .12 : .07 });
    hero.phase = "build"; hero.t = now; hero.cv.style.opacity = "1";
  }
  var v = hero.view;
  if(REDUCED){ if(!v.done()) v.drawTo(Infinity); return; }
  if(hero.phase === "build"){
    v.drawTo(v.i + Math.max(4, Math.ceil(v.list.length/170)));
    if(v.done()){ hero.phase = "hold"; hero.t = now; }
  } else if(hero.phase === "hold" && now - hero.t > 4200){
    hero.phase = "fade"; hero.t = now; hero.cv.style.opacity = "0";
  } else if(hero.phase === "fade" && now - hero.t > 750){
    hero.n++; hero.view = null;
  }
}
function heroRestart(){ hero.view = null; }

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

/* ---------- 5. tower ascent — the real Al-Riggae model, cut by scroll ---------- */
var asc = { sec:$("#ascent"), cv:$("#towerCanvas"), p:0, visible:false, view:null, cut:-1e9, label:"" };
var ASC_P = P.filter(function(p){ return p.no === "021"; })[0] || P[0];
var CAP_P = /[?&]p=([\d.]+)/.exec(location.search);
function ascProgress(){
  if(CAPTURE && CAP_P) return Math.min(1, +CAP_P[1]);
  var r = asc.sec.getBoundingClientRect(), span = r.height - window.innerHeight;
  return Math.max(0, Math.min(1, -r.top / Math.max(1, span)));
}
function prettyLevel(name){
  var n = String(name || "").replace(/^RG\s*/i, "").replace(/\b(level|lvl)\b/ig, "").trim();
  return n ? n.toUpperCase() : "—";
}
function updateAscent(){
  var v = asc.view, M = MODELS[ASC_P.no];
  if(!v || !M){ return; }
  var q = M.vol ? Math.min(1, v.vol / M.vol) : 0;
  var lv = M.lv.filter(function(l){ return l[0] <= asc.cut + .05; });
  var name = lv.length ? prettyLevel(lv[lv.length-1][1]) : (LANG === "ar" ? "الأساسات" : "FOUNDATIONS");
  if(name !== asc.label){ asc.label = name; $("#aLevel").textContent = name; }
  $("#aConc").textContent = fmt(Math.round(ASC_P.concrete*q));
  $("#aSteel").textContent = fmt(ASC_P.steel*q, 1);
  $("#aBar").style.width = (q*100).toFixed(2) + "%";
}
function ascentFrame(){
  var M = MODELS[ASC_P.no]; if(!M) return;
  var mobile = window.innerWidth < 860;
  if(!asc.view) asc.view = new View(asc.cv, M, { rot:-0.62, cx:.5, cy:.5, pad: mobile ? .05 : .04 });
  var target = ascProgress();
  asc.p += (target - asc.p) * (REDUCED ? 1 : .14);
  var v = asc.view, cut = M.zmin + (M.zmax - M.zmin + .5) * Math.min(1, asc.p*1.05);
  asc.cut = cut;
  var idx = v.indexAtZ(cut);
  if(idx < v.i - 2){ v.reset(); }                     /* scrolled back: redraw up to the cut */
  v.drawTo(Math.min(idx, v.i + (REDUCED || v.i === 0 ? 1e9 : 900)));
  updateAscent();
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
function floorsOf(p){ return p.floors ? p.floors[LANG] || p.floors.en : (fmt(p.levels) + " " + l("levels")); }
var cardArt = [];
function renderCards(){
  var grid = $("#grid");
  list = sorted().filter(function(p){ return filter === "all" || p.kind === filter; });
  grid.innerHTML = list.map(function(p, i){
    var tx = t(p);
    return '<article class="card" data-i="'+i+'" tabindex="0" role="button" aria-label="'+tx.name+'">'+
      '<div class="card-top"><span><b>'+p.no+'</b> · '+KIND[p.kind][LANG]+(p.kasra ? ' · '+l("kasra") : '')+'</span><span>'+p.source+'</span></div>'+
      '<span class="card-arrow" aria-hidden="true">'+(LANG==="ar"?"↖":"↗")+'</span>'+
      '<div class="card-art"><canvas></canvas></div>'+
      '<h3>'+tx.name+'</h3><p class="place">'+tx.place+' · '+floorsOf(p)+'</p>'+
      '<div class="card-q">'+
        '<div><small>'+l("conc")+'</small>'+(p.concrete!=null ? '<b>'+fmt(Math.round(p.concrete))+'</b><em>'+l("m3")+'</em>' : '<b class="na">'+l("na")+'</b>')+'</div>'+
        '<div><small>'+l("steel")+'</small>'+(p.steel!=null ? '<b>'+fmt(p.steel,1)+'</b><em>'+l("t")+'</em>' : '<b class="na">'+l("na")+'</b>')+'</div>'+
      '</div></article>';
  }).join("");
  cardArt = $$(".card", grid).map(function(el, i){
    var c = { el:el, cv:$("canvas", el), p:list[i], view:null, inview:false };
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
  var budget = 2400;                                  /* elements per frame across all cards */
  cardArt.forEach(function(c){
    if(!c.inview || budget <= 0) return;
    if(!c.view){
      var M = MODELS[c.p.no];
      if(!M){ getModel(c.p.no, function(){}); return; }
      c.view = new View(c.cv, M, { rot:-0.62, viewport:true, cx:.47, cy:.54, pad:.1 });
    }
    if(c.view.done()) return;
    var step = REDUCED ? 1e9 : Math.max(6, Math.ceil(c.view.list.length/55));
    var before = c.view.i; c.view.drawTo(c.view.i + step); budget -= c.view.i - before;
  });
}

var modalIdx = -1, modal = { el:$("#modal"), cv:$("#modalCanvas"), view:null, rot:-0.62 };
function openModal(i){
  modalIdx = i; modal.view = null; modal.rot = -0.62; fillModal();
  modal.el.classList.add("open"); modal.el.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
  setTimeout(function(){ $(".modal-x").focus(); }, 50);
}
function closeModal(){
  modal.el.classList.remove("open"); modal.el.setAttribute("aria-hidden","true");
  document.body.style.overflow = ""; var c = cardArt[modalIdx]; modalIdx = -1; modal.view = null;
  if(c) c.el.focus();
}
function fillModal(){
  var p = list[modalIdx]; if(!p) return; var tx = t(p);
  $("#mNo").textContent = l("proj") + " " + p.no + " · " + KIND[p.kind][LANG] + (p.kasra ? " · " + l("kasra") : "") + " · " + l("src") + ": " + p.source;
  $("#mName").textContent = tx.name; $("#mPlace").textContent = tx.place + " · " + floorsOf(p);
  $("#mScope").textContent = tx.scope; $("#mNote").textContent = tx.note;
  var ratio = (p.concrete && p.steel) ? fmt(Math.round(p.steel*1000/p.concrete)) : "—";
  $("#mStats").innerHTML =
    '<div><small>'+l("conc")+' '+l("m3")+'</small><b>'+(p.concrete!=null?fmt(p.concrete,1):"—")+'</b></div>'+
    '<div><small>'+l("steel")+' '+l("t")+'</small><b>'+(p.steel!=null?fmt(p.steel,1):"—")+'</b></div>'+
    '<div><small>'+l("ratio")+'</small><b>'+ratio+'</b></div>';
}
function modalFrame(){
  if(modalIdx < 0) return;
  var p = list[modalIdx], M = MODELS[p.no];
  if(!M){ getModel(p.no, function(){}); return; }
  if(!modal.view) modal.view = new View(modal.cv, M, { rot:modal.rot, viewport:true, cx:.5, cy:.52, pad:.1 });
  var v = modal.view;
  if(!v.done()) v.drawTo(v.i + (REDUCED ? 1e9 : Math.max(8, Math.ceil(v.list.length/70))));
}
function rotateModal(d){ modal.rot += d*Math.PI/4; modal.view = null; }
function stepModal(d){ if(!list.length) return; modalIdx = (modalIdx + d + list.length) % list.length; modal.view = null; fillModal(); }

/* ---------- 8. reveal / cursor / nav / marquee ---------- */
var io = new IntersectionObserver(function(ents){
  ents.forEach(function(e){
    var el = e.target;
    if(el.classList.contains("card")){
      var c = cardArt.filter(function(x){ return x.el === el; })[0];
      if(c){ c.inview = e.isIntersecting; if(c.inview) getModel(c.p.no, function(){}); }
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

var sections = ["method","ascent","projects","contact"].map(function(id){ return document.getElementById(id); });
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
  $$("[data-close]").forEach(function(b){ b.addEventListener("click", closeModal); });
  $("#mPrev").addEventListener("click", function(){ stepModal(-1); });
  $("#mNext").addEventListener("click", function(){ stepModal(1); });
  $("#mRotL").addEventListener("click", function(){ rotateModal(-1); });
  $("#mRotR").addEventListener("click", function(){ rotateModal(1); });
  document.addEventListener("keydown", function(e){
    if(modalIdx < 0) return;
    if(e.key === "Escape") closeModal();
    if(e.key === "ArrowRight") stepModal(LANG === "ar" ? -1 : 1);
    if(e.key === "ArrowLeft") stepModal(LANG === "ar" ? 1 : -1);
  });
  window.addEventListener("scroll", onScroll, { passive:true });
  var rz = 0;
  window.addEventListener("resize", function(){
    clearTimeout(rz);
    rz = setTimeout(function(){ cardArt.forEach(function(c){ c.view = null; }); asc.view = null; hero.view = null; modal.view = null; onScroll(); }, 200);
  });
  $$(".sec-head, .method-stage, .contact-inner").forEach(function(el){ el.setAttribute("data-reveal",""); io.observe(el); });
}

function boot(){
  $("#yr").textContent = new Date().getFullYear();
  buildStage();
  getModel(HERO_NO, function(){}); getModel(ASC_P.no, function(){});
  wire();
  applyLang();
  initCursor(); initReel(); onScroll();
  /* ?y=1234 jumps to a scroll position (used for screenshots) */
  var qy = /[?&]y=(\d+)/.exec(location.search), qm = /[?&]m=(\d+)/.exec(location.search);
  if(CAPTURE && qm) setTimeout(function(){ openModal(+qm[1]); }, 300);
  if(qy) setTimeout(function(){ root.style.scrollBehavior = "auto"; window.scrollTo(0, +qy[1]); onScroll();
    document.body.setAttribute("data-offsets", ["method","ascent","projects","gallery","contact"].map(function(id){
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
