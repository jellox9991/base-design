/* ============================================================
   BASE — plan walkthrough + build-up layers

   ⚠ VERIFY THE ROOM MAPPING
   `x` and `y` are percentages of the plan image (0–100, from the
   top-left). They place the numbered marker on the plan. The room names
   and which render belongs to which room are a best guess from reading
   the plan — you know the project, so correct any that are wrong. Only
   these three values per stop need touching: x, y, img.
   ============================================================ */

window.WALKTHROUGH = {
  plan: "assets/img/walk/salmiya-plan.webp",
  // Client name deliberately omitted — the project is not listed on the site.
  project: {
    en: { title: "Private Residence, Kuwait", meta: "Ground floor · walk the plan" },
    ar: { title: "سكن خاص، الكويت", meta: "الدور الأرضي · تجوّل في المخطط" }
  },
  stops: [
    {
      x: 75, y: 59, img: "assets/img/walk/salmiya-s1.webp",
      en: { room: "Entrance & stair", note: "Double-height entry with the stair rising against a stone-clad wall." },
      ar: { room: "المدخل والدرج", note: "مدخل بارتفاع مزدوج مع درج يصعد بمحاذاة جدار مكسو بالحجر." }
    },
    {
      x: 20, y: 55, img: "assets/img/walk/salmiya-s2.webp",
      en: { room: "Main living", note: "Open-plan living running the full depth of the plot, glazed to the courtyard." },
      ar: { room: "الصالة الرئيسية", note: "صالة مفتوحة تمتد بعمق القسيمة بالكامل، مطلّة على الفناء بواجهة زجاجية." }
    },
    {
      x: 18, y: 23, img: "assets/img/walk/salmiya-s3.webp",
      en: { room: "Majlis", note: "The formal sitting, lit for evening — warmer palette, deeper tones." },
      ar: { room: "المجلس", note: "الجلسة الرسمية بإضاءة مسائية — ألوان أدفأ ودرجات أعمق." }
    },
    {
      x: 58, y: 59, img: "assets/img/walk/salmiya-s4.webp",
      en: { room: "Media wall", note: "Joinery wall in warm wood with the screen recessed flush into the panel." },
      ar: { room: "جدار التلفزيون", note: "وحدة نجارة بخشب دافئ مع شاشة غاطسة بمستوى اللوح." }
    },
    {
      x: 33, y: 55, img: "assets/img/walk/salmiya-s5.webp",
      en: { room: "Living, evening", note: "The same space after dark — the lighting design doing the work." },
      ar: { room: "الصالة ليلاً", note: "الفراغ نفسه بعد المغيب — هنا يظهر أثر تصميم الإضاءة." }
    },
    {
      x: 58, y: 85, img: "assets/img/walk/salmiya-s6.webp",
      en: { room: "Long section", note: "Cut through the whole house — every space above in one line." },
      ar: { room: "المقطع الطولي", note: "مقطع عبر المنزل بالكامل — كل الفراغات السابقة في خط واحد." }
    }
  ]
};

/* Build-up: raw structure through to the finished surface. */
window.LAYERS = [
  {
    img: "assets/img/layers/l1.webp",
    en: { name: "Foundation", spec: "Isolated footings",
          note: "Footings set out and detailed before anything is poured — bottom mesh, top mesh, and column starter bars in position." },
    ar: { name: "الأساسات", spec: "قواعد منفصلة",
          note: "قواعد محددة ومفصّلة قبل أي صب — الشبكة السفلية والعلوية وأشاير الأعمدة في مواضعها." }
  },
  {
    img: "assets/img/layers/l2.webp",
    en: { name: "Reinforcement", spec: "Rebar modelled in 3D",
          note: "Bars, links and laps modelled rather than estimated, which is what makes the steel tonnage in the BOQ a real number." },
    ar: { name: "حديد التسليح", spec: "نمذجة ثلاثية الأبعاد",
          note: "الأسياخ والكانات والتشريك تُنمذج بدل تقديرها، ولهذا يكون وزن الحديد في جدول الكميات رقماً حقيقياً." }
  },
  {
    img: "assets/img/layers/l3.webp",
    en: { name: "Frame", spec: "Columns, beams, slab bands",
          note: "The full structural frame as one coordinated model, floor by floor, so clashes surface here and not on site." },
    ar: { name: "الهيكل", spec: "أعمدة وكمرات وبلاطات",
          note: "الهيكل الإنشائي كاملاً كنموذج منسّق دور بدور، لتظهر التعارضات هنا لا في الموقع." }
  },
  {
    img: "assets/img/layers/l4.webp",
    en: { name: "Slab", spec: "Precast hollow core",
          note: "Hollow-core planks spanning onto the beams — lighter, faster, and longer spans than a solid slab." },
    ar: { name: "البلاطة", spec: "بلاطات مفرغة مسبقة الصب",
          note: "بلاطات مفرغة ترتكز على الكمرات — أخف وأسرع وبحور أطول من البلاطة المصمتة." }
  },
  {
    img: "assets/img/layers/l5.webp",
    en: { name: "Build-up", spec: "Grout, topping, screed",
          note: "Grouted joints, structural topping, insulation and screed — the layers between the structure and anything you can see." },
    ar: { name: "طبقات الأرضية", spec: "روبة وخرسانة علوية ومونة",
          note: "وصلات مروّبة وخرسانة علوية وعزل ومونة تسوية — الطبقات الواقعة بين الهيكل وأي شيء تراه العين." }
  },
  {
    img: "assets/img/layers/l6.webp",
    en: { name: "Ceramic", spec: "Tiling set out from finish level",
          note: "Floor and wall tiling set out from the finished screed level, so joints line up with the joinery instead of fighting it." },
    ar: { name: "السيراميك", spec: "تبليط من منسوب التشطيب",
          note: "تبليط الأرضيات والجدران يُوزَّع من منسوب التشطيب النهائي، لتتوافق الفواصل مع النجارة بدل أن تتعارض معها." }
  },
  {
    img: "assets/img/layers/l7.webp",
    en: { name: "The room", spec: "What the client sees",
          note: "The same build-up, from the sofa. Everything above is why the finish lands where it was drawn." },
    ar: { name: "الفراغ", spec: "ما يراه العميل",
          note: "الطبقات نفسها، من مكان الجلوس. كل ما سبق هو سبب وصول التشطيب إلى ما رُسم تماماً." }
  }
];
