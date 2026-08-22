/* ============================================================
   BASE — project data
   This is the ONLY file you need to edit to add or change work.

   cat:    architecture | interior | exterior | boq
   images: file stems in assets/img/projects/ (without -thumb / -full)
   The first image is the cover.
   ============================================================ */

window.PROJECTS = [
  {
    id: "facade",
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
    id: "hospital",
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
