/* ============================================================
   BASE — project data
   This is the ONLY file you need to edit to add or change work.

   hidden: true  keeps a project in this file but off the site. Used for
                 client-identifiable work and student work. Delete the line
                 or set it to false to bring a project back.

   cat:    architecture | interior | exterior | boq | concept
   images: file stems in assets/img/projects/ (without -thumb / -full)
   The first image is the cover.
   ============================================================ */

window.PROJECTS = [
  {
    id: "facade",
    hidden: true,   // set false to put this project back on the site
    cat: ["architecture", "exterior"],
    cover: "facade-01",
    year: "2024",
    en: {
      title: "Modern Façade",
      place: "Mutlaa, Kuwait",
      meta: "Architecture · Façade · Visualization",
      desc: "A contemporary residential façade built from off-white stucco, dark stacked stone and black aluminium framing. The design was resolved in Revit and taken through to a full material palette and a sectional perspective, so the client could approve the exterior and the interior volumes at the same time."
    },
    ar: {
      title: "واجهة معاصرة",
      place: "المطلاع، الكويت",
      meta: "عمارة · واجهات · إظهار ثلاثي الأبعاد",
      desc: "واجهة سكنية معاصرة من البلاستر الأبيض والحجر الداكن وإطارات الألمنيوم الأسود. صُمّم المشروع بالكامل على ريفيت مع لوحة مواد ومقطع منظوري، ليعتمد العميل الشكل الخارجي والفراغات الداخلية في وقت واحد."
    },
    images: ["facade-01", "facade-02", "facade-03", "facade-04", "facade-05", "facade-06"]
  },

  {
    id: "salmiya",
    hidden: true,   // set false to put this project back on the site
    cat: ["interior"],
    cover: "salmiya-01",
    year: "2025",
    en: {
      title: "Al-Salmiya Residence",
      place: "Al Salmiya, Kuwait",
      meta: "Interior design · Material palette · FF&E",
      desc: "A calm, contemporary interior rooted in concrete, stone, plaster and warm wood. Open-plan living with a refined material palette, detailed down to joinery, ceiling accents and lighting — documented well enough for a contractor to price and build directly."
    },
    ar: {
      title: "سكن السالمية",
      place: "السالمية، الكويت",
      meta: "تصميم داخلي · لوحة مواد · أثاث وتجهيزات",
      desc: "تصميم داخلي هادئ ومعاصر يعتمد على الخرسانة والحجر والبلاستر والخشب الدافئ. فراغات مفتوحة بلوحة مواد مدروسة، مفصّلة حتى النجارة وتفاصيل الأسقف والإضاءة — بمستوى تفصيل يكفي المقاول للتسعير والتنفيذ مباشرة."
    },
    images: ["salmiya-01", "salmiya-02", "salmiya-03", "salmiya-04", "salmiya-05", "salmiya-06"]
  },

  {
    id: "shaleh",
    cat: ["concept", "architecture", "exterior"],
    cover: "shaleh-01",
    year: "Unbuilt",
    en: {
      title: "Waterfront Chalet",
      place: "Coastal study",
      meta: "Unbuilt · Massing · Coastal",
      desc: "A study in stacked white volumes meeting water. Cantilevered slabs shade the levels below, the pool reads as an extension of the sea, and the whole composition is arranged so the long elevation is the one you see from the water. Speculative — no client, no site, no constraints except the ones we set."
    },
    ar: {
      title: "شاليه على الواجهة البحرية",
      place: "دراسة ساحلية",
      meta: "غير منفّذ · كتل · ساحلي",
      desc: "دراسة في كتل بيضاء متراكبة تلتقي بالماء. بلاطات كابولية تظلّل المناسيب تحتها، والمسبح يُقرأ كامتداد للبحر، والتكوين كله مرتّب ليكون الارتفاع الطولي هو ما تراه من جهة الماء. عمل تخيّلي — بلا عميل ولا موقع ولا قيود سوى ما وضعناه نحن."
    },
    images: ["shaleh-01", "shaleh-02", "shaleh-03", "shaleh-04", "shaleh-05", "shaleh-06"]
  },

  {
    id: "classic",
    cat: ["concept", "architecture", "exterior"],
    cover: "classic-01",
    year: "Unbuilt",
    en: {
      title: "Townhouse Insertion",
      place: "Urban infill",
      meta: "Unbuilt · Classical order · Infill",
      desc: "A classical façade dropped into a gap between two older neighbours — the hardest kind of elevation to get right, because it has to hold its own proportions while answering to buildings it did not choose. Studied at dawn, midday and dusk to test whether the order survives every light."
    },
    ar: {
      title: "إدراج بيت مدينة",
      place: "ملء فراغ حضري",
      meta: "غير منفّذ · نظام كلاسيكي · ملء فراغ",
      desc: "واجهة كلاسيكية تُدرَج في فراغ بين جارين أقدم — وهي أصعب أنواع الواجهات، لأنها يجب أن تحافظ على نسبها الخاصة وتجاوب في الوقت نفسه مبانيَ لم تخترها. دُرست عند الفجر والظهيرة والغروب لاختبار ثبات النظام في كل ضوء."
    },
    images: ["classic-01", "classic-02", "classic-03", "classic-04", "classic-05", "classic-06"]
  },

  {
    id: "vancouver",
    cat: ["concept", "architecture"],
    cover: "vancouver-01",
    year: "Unbuilt",
    en: {
      title: "Vancouver Tall",
      place: "Open competition",
      meta: "Competition · Tower · Urban strategy",
      desc: "An entry for an open tall-building competition: massing model, site strategy and a ground-level use plan working out how a tower meets the street. Competitions are where a studio designs without a client editing it — which is exactly why they are worth entering."
    },
    ar: {
      title: "فانكوفر تول",
      place: "مشاركة في مسابقة مفتوحة",
      meta: "مسابقة · برج · استراتيجية عمرانية",
      desc: "مشاركة في مسابقة مفتوحة للمباني العالية: نموذج الكتل، واستراتيجية الموقع، ومخطط استعمالات الدور الأرضي الذي يعالج كيفية التقاء البرج بالشارع. المسابقات هي المكان الذي يصمّم فيه المكتب دون تعديل من عميل — ولهذا تحديداً تستحق المشاركة."
    },
    images: ["vancouver-01", "vancouver-02", "vancouver-03"]
  },

  {
    id: "hollowcore",
    cat: ["architecture"],
    cover: "hollowcore-01",
    year: "2025",
    en: {
      title: "Hollow Core Structural System",
      place: "Mutlaa, Kuwait",
      meta: "Structural coordination · Precast · Detailing",
      desc: "A precast hollow-core floor system modelled and coordinated in 3D: slabs, grouted joints, topping concrete, reinforced beams and columns, plus basement ramp and pool structural details. Modelling the system this way removes the clashes that normally surface on site."
    },
    ar: {
      title: "نظام البلاطات المفرغة (Hollow Core)",
      place: "المطلاع، الكويت",
      meta: "تنسيق إنشائي · خرسانة مسبقة الصب · تفاصيل",
      desc: "نظام بلاطات مفرغة مسبقة الصب تم نمذجته وتنسيقه ثلاثي الأبعاد: البلاطات، الوصلات، الخرسانة العلوية، الكمرات والأعمدة المسلحة، مع تفاصيل منحدر القبو والمسبح. النمذجة بهذه الطريقة تمنع التعارضات التي تظهر عادة في الموقع."
    },
    images: ["hollowcore-01", "hollowcore-02", "hollowcore-03", "hollowcore-04", "hollowcore-05", "hollowcore-06"]
  },

  {
    id: "boq",
    cat: ["boq"],
    cover: "boq-01",
    year: "2025",
    en: {
      title: "Revit BOQ &amp; Quantity Takeoff",
      place: "Kuwait",
      meta: "BOQ · Rebar modelling · Quantity extraction",
      desc: "Quantities extracted straight from the coordinated Revit structural model — concrete, reinforcement steel, formwork and every major structural element, with footings, columns, beams and slabs itemised. When the model updates, the BOQ updates with it. No re-measuring, no drift between drawing and bill."
    },
    ar: {
      title: "جداول الكميات من ريفيت",
      place: "الكويت",
      meta: "جداول كميات · نمذجة حديد التسليح · حصر",
      desc: "كميات مستخرجة مباشرة من نموذج ريفيت الإنشائي المنسّق — الخرسانة وحديد التسليح والشدّات وكل العناصر الإنشائية الرئيسية، مع حصر القواعد والأعمدة والكمرات والبلاطات. عند تحديث النموذج يتحدّث جدول الكميات معه: لا إعادة حصر، ولا فجوة بين المخطط والجدول."
    },
    images: ["boq-01", "boq-02", "boq-03", "boq-04", "boq-05", "boq-06"]
  },

  {
    id: "villa329",
    hidden: true,   // set false to put this project back on the site
    cat: ["architecture", "exterior"],
    cover: "villa329-01",
    year: "2025",
    en: {
      title: "Villa 329",
      place: "Kuwait",
      meta: "Architecture · Façade · Visualization",
      desc: "A private villa built on a sculpted composition of solid and screen — warm stone against off-white render, with a perforated panel filtering the western sun. Studied through a full set of renders at different times of day before a line was committed."
    },
    ar: {
      title: "فيلا ٣٢٩",
      place: "الكويت",
      meta: "عمارة · واجهات · إظهار",
      desc: "فيلا خاصة قائمة على تكوين نحتي بين الكتلة المصمتة والمشربية — حجر دافئ مقابل بلاستر فاتح، مع لوح مثقّب يرشّح شمس الغرب. دُرست بمجموعة كاملة من المناظير في أوقات مختلفة من النهار قبل اعتماد أي خط."
    },
    images: ["villa329-01", "villa329-02", "villa329-03", "villa329-04", "villa329-05", "villa329-06"]
  },

  {
    id: "faisal",
    hidden: true,   // set false to put this project back on the site
    cat: ["architecture", "exterior"],
    cover: "faisal-01",
    year: "2025",
    en: {
      title: "Private Villa — Contemporary Classic",
      place: "Kuwait",
      meta: "Architecture · Façade · Visualization",
      desc: "A restrained contemporary-classic elevation: vertical proportions, a recessed entrance bay and a quiet palette. Rendered across day, dusk and night to check how the façade holds up under each, plus an internal courtyard study."
    },
    ar: {
      title: "فيلا خاصة — كلاسيكي معاصر",
      place: "الكويت",
      meta: "عمارة · واجهات · إظهار",
      desc: "واجهة كلاسيكية معاصرة مضبوطة: نسب رأسية، ومدخل غائر، ولوحة ألوان هادئة. أُظهرت نهاراً وعند الغروب وليلاً للتأكد من ثبات الواجهة في كل حالة، مع دراسة للفناء الداخلي."
    },
    images: ["faisal-01", "faisal-02", "faisal-03", "faisal-04", "faisal-05", "faisal-06"]
  },

  {
    id: "hospital",
    hidden: true,   // set false to put this project back on the site
    cat: ["architecture", "exterior"],
    cover: "hospital-01",
    year: "2023",
    en: {
      title: "Hospital — Large-Scale Design",
      place: "Graduation project",
      meta: "Architecture · Masterplan · Sections",
      desc: "A full hospital scheme taken from site strategy and massing through floor plans, elevations and long sections. The project is here because it shows the part clients rarely see: how a large, complicated brief gets organised before it ever looks good."
    },
    ar: {
      title: "مستشفى — مشروع بمقياس كبير",
      place: "مشروع التخرج",
      meta: "عمارة · مخطط عام · مقاطع",
      desc: "مشروع مستشفى متكامل من دراسة الموقع والكتل حتى المساقط والواجهات والمقاطع الطولية. أدرجناه لأنه يُظهر الجزء الذي نادراً ما يراه العميل: كيف يُنظَّم برنامج كبير ومعقّد قبل أن يبدو جميلاً."
    },
    images: ["hospital-01", "hospital-02", "hospital-03", "hospital-04", "hospital-05", "hospital-06"]
  }
];

/* Exterior → interior comparison sliders (drag the handle).
   Files live in assets/img/transitions/ */
window.COMPARES = [
  {
    slug: "c1",
    en: { title: "Modern Façade", meta: "Exterior render → sectional perspective" },
    ar: { title: "واجهة معاصرة", meta: "منظور خارجي ← مقطع منظوري" }
  },
  {
    slug: "c2",
    en: { title: "Hospital", meta: "Aerial massing → long section" },
    ar: { title: "مستشفى", meta: "منظور جوي ← مقطع طولي" }
  },
  {
    slug: "c3",
    en: { title: "Hollow Core System", meta: "Structural model → cut section" },
    ar: { title: "نظام البلاطات المفرغة", meta: "نموذج إنشائي ← مقطع" }
  }
];
