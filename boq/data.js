/* ============================================================
   BASE · BOQ portfolio — project data
   The ONLY file to edit when a figure changes or a project is added.

   Names are district + building type, never the client's family name
   (same rule as the main site: no client-identifiable work).

   concrete : modelled concrete, m³        (null = not measured / not published)
   steel    : modelled reinforcement, tonnes (null = not measured / not published)
   levels   : storeys drawn in the mini-building (basement counts as one)
   kind     : tower | villa | chalet | commercial
   source   : what the model was built from
   floors   : how the floors are said — roof floor / roof room = ½
   kasra    : true for a corner-chamfered (شطفة) plot — "Kasra plot" / "قسيمة كسرة"
   The 3D view of each card is the real Revit geometry: boq/models/<no>.js
   (rebuild with  python tools/build_boq_models.py)
   ============================================================ */

window.BOQ_PROJECTS = [
  { no:"021", kind:"tower", levels:27, w:75, d:40, concrete:9160, steel:1423.5, source:"PDF", floors:{ en:"Basement + 26 floors", ar:"سرداب + ٢٦ دوراً" },
    en:{ name:"Al-Riggae Residential Tower", place:"Al-Riggae, Kuwait", scope:"75×40 m basement · GF · 25 floors · top roof +112.00",
         note:"The largest model in the archive. 57 stairs, raft, shear walls, flat slabs and 1,423 t of bars placed from the structural details — beams 441 t, raft 307 t, walls 291 t." },
    ar:{ name:"برج الرقعي السكني", place:"الرقعي، الكويت", scope:"سرداب ٧٥×٤٠ م · أرضي · ٢٥ دوراً · سطح +١١٢٫٠٠",
         note:"أكبر نموذج في الأرشيف. ٥٧ درجاً، لبشة، جدران قص، بلاطات مسطحة، و١٬٤٢٣ طن حديد موزّعة حسب التفاصيل الإنشائية." } },

  { no:"005", kind:"tower", levels:15, w:36, d:28, concrete:4318.3, steel:317.7, source:"DWG", floors:{ en:"13½ floors", ar:"١٣ دوراً ونصف" },
    en:{ name:"Al-Mangaf Residential Tower", place:"Al-Mangaf, Kuwait", scope:"Raft · 13 storeys · post-tensioned slabs · roof rooms",
         note:"10 raft zones, 272 columns, 221 RC walls and 361 beams. Delivered with a full client submission workbook — concrete and steel summarised floor by floor." },
    ar:{ name:"برج المنقف السكني", place:"المنقف، الكويت", scope:"لبشة · ١٣ دوراً · بلاطات شد لاحق · غرف سطح",
         note:"١٠ مناطق لبشة، ٢٧٢ عموداً، ٢٢١ جداراً خرسانياً و٣٦١ كمرة. سُلّم مع ملف كميات كامل للعميل مفصّل دوراً بدور." } },

  { no:"019", kind:"tower", levels:17, w:40, d:25, concrete:3360, steel:477, source:"PDF", floors:{ en:"Basement + 15½ floors", ar:"سرداب + ١٥ دوراً ونصف" },
    en:{ name:"Jabriya Residential Tower", place:"Jabriya, Kuwait", scope:"Basement · GF · 14 floors · roof room · raft + flat slabs",
         note:"Concrete, stairs and 477 t of reinforcement modelled from the PDF set, using the project's own covers (75 / 50 / 40 / 20 mm)." },
    ar:{ name:"برج الجابرية السكني", place:"الجابرية، الكويت", scope:"سرداب · أرضي · ١٤ دوراً · غرفة سطح · لبشة وبلاطات مسطحة",
         note:"الخرسانة والأدراج و٤٧٧ طن حديد من مخططات PDF، بأغطية المشروع نفسه (٧٥ / ٥٠ / ٤٠ / ٢٠ مم)." } },

  { no:"011", kind:"tower", levels:11, w:30, d:22, concrete:2365, steel:336.9, source:"DWG", floors:{ en:"Basement + 9½ floors", ar:"سرداب + ٩ أدوار ونصف" },
    en:{ name:"Hawally Residential Building", place:"Hawally, Kuwait", scope:"Basement · GF · 8 floors · roof room",
         note:"Structure read straight from the CAD file by a custom extraction tool; 336.9 t of rebar, independently reviewed, then blockwork, doors and windows." },
    ar:{ name:"عمارة حولي السكنية", place:"حولي، الكويت", scope:"سرداب · أرضي · ٨ أدوار · غرفة سطح",
         note:"قُرئ الإنشائي مباشرة من ملف الكاد بأداة استخراج خاصة؛ ٣٣٦٫٩ طن حديد مع مراجعة مستقلة، ثم الطابوق والأبواب والنوافذ." } },

  { no:"009", kind:"chalet", levels:3, w:46, d:30, concrete:2490, steel:null, source:"PDF", floors:{ en:"3 floors", ar:"٣ أدوار" },
    en:{ name:"Creative City Chalet", place:"Kuwait", scope:"159 columns · 275 beams · 172 slab panels · 280 ribs",
         note:"A large ribbed-slab chalet taken off from PDF only, then masonry from the architectural set — white exterior, black interior blockwork." },
    ar:{ name:"شاليه كريتف سيتي", place:"الكويت", scope:"١٥٩ عموداً · ٢٧٥ كمرة · ١٧٢ بلاطة · ٢٨٠ عصب",
         note:"شاليه كبير ببلاطات معصّبة حُسبت كمياته من PDF فقط، ثم الطابوق من المعماري — أبيض للخارجي وأسود للداخلي." } },

  { no:"017", kind:"villa", levels:5, w:24, d:18, concrete:1335.4, steel:163.6, source:"PDF", floors:{ en:"Basement + 3½ floors", ar:"سرداب + ٣ أدوار ونصف" },
    en:{ name:"Granada Villa", place:"Granada, Kuwait", scope:"Basement · GF · FF · SF · roof room · BUA 2,348.7 m²",
         note:"Client workbook Rev 02: 1,335.41 m³ of concrete and 163.59 t of steel across a 2,348.7 m² built-up area." },
    ar:{ name:"فيلا غرناطة", place:"غرناطة، الكويت", scope:"سرداب · أرضي · أول · ثاني · غرفة سطح · مسطح ٢٬٣٤٨٫٧ م²",
         note:"ملف العميل المراجعة ٠٢: ١٬٣٣٥٫٤١ م³ خرسانة و١٦٣٫٥٩ طن حديد لمسطح بناء ٢٬٣٤٨٫٧ م²." } },

  { no:"020", kind:"villa", levels:5, w:20, d:16, concrete:545, steel:60.5, source:"DWG", floors:{ en:"Basement + 3½ floors", ar:"سرداب + ٣ أدوار ونصف" },
    en:{ name:"Private Villa 020", place:"Kuwait", scope:"Partial basement · GF · FF · SF · roof room · hordi slabs",
         note:"769 structural elements built in a single session from the combined drawing, rebar the same week." },
    ar:{ name:"فيلا خاصة ٠٢٠", place:"الكويت", scope:"سرداب جزئي · أرضي · أول · ثاني · غرفة سطح · بلاطات هوردي",
         note:"٧٦٩ عنصراً إنشائياً في جلسة واحدة من المخطط الموحّد، والحديد في الأسبوع نفسه." } },

  { no:"022", kind:"villa", levels:5, w:20, d:15, concrete:507, steel:58.8, source:"Scanned PDF", floors:{ en:"Basement + 3½ floors", ar:"سرداب + ٣ أدوار ونصف" },
    en:{ name:"Private Villa 022", place:"Kuwait", scope:"Basement · GF · FF · 2F · roof floor",
         note:"Modelled from a scanned set with no vector data — footings as families, slab panels between beams, sunk slabs at 300 mm." },
    ar:{ name:"فيلا خاصة ٠٢٢", place:"الكويت", scope:"سرداب · أرضي · أول · ثاني · دور سطح",
         note:"من مخططات ممسوحة ضوئياً بلا خطوط — القواعد عائلات، البلاطات بين الكمرات، والهابط ٣٠٠ مم." } },

  { no:"018", kind:"villa", levels:4, w:19, d:15, concrete:472, steel:58.5, source:"DWG", floors:{ en:"3½ floors", ar:"٣ أدوار ونصف" },
    en:{ name:"Private Villa 018", place:"Kuwait", scope:"GF · FF · SF · roof room · stairs",
         note:"A clean combined STR + ARCH drawing turned into a repeatable DWG-to-model pipeline." },
    ar:{ name:"فيلا خاصة ٠١٨", place:"الكويت", scope:"أرضي · أول · ثاني · غرفة سطح · أدراج",
         note:"مخطط موحّد إنشائي ومعماري تحوّل إلى خط عمل قابل للتكرار من الكاد إلى النموذج." } },

  { no:"014", kind:"villa", levels:4, w:19, d:14, concrete:436.6, steel:62.2, source:"PDF", floors:{ en:"3½ floors", ar:"٣ أدوار ونصف" },
    en:{ name:"Private Villa 014", place:"Kuwait", scope:"GF · FF · 2F · roof · 300 mm sunk slabs",
         note:"Rebar audited with zero bars outside concrete; client workbook built with 97 automated checks and no error cells." },
    ar:{ name:"فيلا خاصة ٠١٤", place:"الكويت", scope:"أرضي · أول · ثاني · سطح · هابط ٣٠٠ مم",
         note:"تدقيق الحديد بلا أي سيخ خارج الخرسانة؛ ملف العميل بـ ٩٧ فحصاً آلياً وبلا خلايا خطأ." } },

  { no:"006", kind:"villa", levels:4, w:18, d:14, concrete:396, steel:47.3, source:"PDF", floors:{ en:"2½ floors", ar:"دوران ونصف" },
    en:{ name:"Al-Mutlaa Villa", place:"Al-Mutlaa, Kuwait", scope:"Footings · GF · FF · roof · 187 masonry walls",
         note:"Rebuilt to the approved final revision: pit removed, ground-floor roof redone, reinforcement regenerated." },
    ar:{ name:"فيلا المطلاع", place:"المطلاع، الكويت", scope:"قواعد · أرضي · أول · سطح · ١٨٧ جدار طابوق",
         note:"أُعيد بناؤه حسب المراجعة النهائية المعتمدة: إلغاء الحفرة، إعادة سقف الأرضي، وتوليد الحديد من جديد." } },

  { no:"004", kind:"chalet", levels:3, w:22, d:16, concrete:384.6, steel:34.4, source:"DWG", floors:{ en:"3 floors", ar:"٣ أدوار" },
    en:{ name:"Seaside Chalet", place:"Kuwait", scope:"Concrete · rebar · masonry · doors & windows · pool · lift",
         note:"Drawing-review ledger kept item by item; nine rebar weight schedules summarise the steel by element group." },
    ar:{ name:"شاليه بحري", place:"الكويت", scope:"خرسانة · حديد · طابوق · أبواب ونوافذ · مسبح · مصعد",
         note:"سجل مراجعة المخططات بنداً بنداً؛ تسعة جداول أوزان تلخّص الحديد حسب مجموعة العناصر." } },

  { no:"024", kind:"commercial", levels:1, w:28, d:20, concrete:367, steel:40.1, source:"PDF", floors:{ en:"Ground floor", ar:"دور أرضي" },
    en:{ name:"Restaurant Building", place:"Kuwait", scope:"Ground-floor restaurant · stair · parapet columns · 127 walls",
         note:"Concrete, stair and 40.1 t of reinforcement in ten rebar batches, plus masonry from the vector architectural set." },
    ar:{ name:"مبنى مطعم", place:"الكويت", scope:"مطعم دور أرضي · درج · أعمدة دروة · ١٢٧ جداراً",
         note:"الخرسانة والدرج و٤٠٫١ طن حديد على عشر دفعات، والطابوق من المعماري." } },

  { no:"008", kind:"villa", levels:4, w:20, d:15, concrete:350.5, steel:35.8, source:"DWG", floors:{ en:"3½ floors", ar:"٣ أدوار ونصف" },
    en:{ name:"Private Villa 008", place:"Kuwait", scope:"853 m² · top mesh · side bars · column ties",
         note:"Client BOQ 350.531 m³ without blinding (by the engineer's choice); steel 35.84 t net, 39.42 t with 10 % wastage." },
    ar:{ name:"فيلا خاصة ٠٠٨", place:"الكويت", scope:"٨٥٣ م² · شبكة علوية · حديد جانبي · كانات أعمدة",
         note:"كميات العميل ٣٥٠٫٥٣١ م³ بدون نظافة؛ الحديد ٣٥٫٨٤ طن صافي و٣٩٫٤٢ طن مع ١٠٪ هالك." } },

  { no:"012", kind:"villa", kasra:true, levels:4, w:18, d:14, concrete:325.4, steel:39.1, source:"PDF", floors:{ en:"2½ floors", ar:"دوران ونصف" },
    en:{ name:"Kasra Plot Villa 012", place:"Kuwait", scope:"GF · FF · SF · roof room · 1,291 m² blockwork",
         note:"Concrete, steel and blockwork all scheduled from one model: 325.35 m³, 39.06 t and 1,291 m² of block." },
    ar:{ name:"فيلا قسيمة كسرة ٠١٢", place:"الكويت", scope:"أرضي · أول · ثاني · غرفة سطح · ١٬٢٩١ م² طابوق",
         note:"الخرسانة والحديد والطابوق من نموذج واحد: ٣٢٥٫٣٥ م³ و٣٩٫٠٦ طن و١٬٢٩١ م² طابوق." } },

  { no:"016", kind:"chalet", levels:2, w:20, d:14, concrete:321, steel:null, source:"PDF", floors:{ en:"1½ floors", ar:"دور ونصف" },
    en:{ name:"Sabah Al-Ahmed Chalet", place:"Sabah Al-Ahmed, Kuwait", scope:"GF · partial FF · pool · strap beams",
         note:"Footings, strap and ground beams, pool, columns and both roofs — 321 m³ net." },
    ar:{ name:"شاليه صباح الأحمد", place:"صباح الأحمد، الكويت", scope:"أرضي · أول جزئي · مسبح · كمرات ربط",
         note:"القواعد وكمرات الربط والأرضية والمسبح والأعمدة والسقفان — ٣٢١ م³ صافي." } },

  { no:"007", kind:"villa", levels:4, w:25, d:16, concrete:null, steel:90.8, source:"PDF", floors:{ en:"Basement + 3½ floors", ar:"سرداب + ٣ أدوار ونصف" },
    en:{ name:"Al-Qusur Villa", place:"Al-Qusur, Kuwait", scope:"Basement fills the 25×16 m plot · 52 bar-bending sheets",
         note:"Earthworks measured to the plot line — 2,063 m³ excavation — and 90.8 t of steel issued as BS 8666 bar-bending schedules." },
    ar:{ name:"فيلا القصور", place:"القصور، الكويت", scope:"سرداب بكامل القسيمة ٢٥×١٦ م · ٥٢ جدول تفريد",
         note:"أعمال الحفر حتى حد القسيمة — ٢٬٠٦٣ م³ حفر — و٩٠٫٨ طن حديد في جداول تفريد BS 8666." } },

  { no:"010", kind:"villa", levels:4, w:18, d:13, concrete:null, steel:36.0, source:"PDF", floors:{ en:"2½ floors", ar:"دوران ونصف" },
    en:{ name:"Private Villa 010", place:"Kuwait", scope:"Concrete · stairs · rebar · 602 m²",
         note:"Concrete, stairs and 36.0 t of rebar; slab bars set by the span rule where the drawings were silent." },
    ar:{ name:"فيلا خاصة ٠١٠", place:"الكويت", scope:"خرسانة · أدراج · حديد · ٦٠٢ م²",
         note:"الخرسانة والأدراج و٣٦ طن حديد؛ حديد البلاطات حسب البحر حيث سكتت المخططات." } },

  { no:"015", kind:"villa", levels:5, w:20, d:15, concrete:null, steel:null, source:"PDF", floors:{ en:"Basement + 3½ floors", ar:"سرداب + ٣ أدوار ونصف" },
    en:{ name:"Private Villa 015", place:"Kuwait", scope:"Full basement · GF · FF · 2F · roof floor · hordi",
         note:"Continuous beams, columns to beam top. Concrete model in progress." },
    ar:{ name:"فيلا خاصة ٠١٥", place:"الكويت", scope:"سرداب كامل · أرضي · أول · ثاني · دور سطح · هوردي",
         note:"كمرات مستمرة وأعمدة حتى أعلى الكمرة. النموذج الخرساني قيد العمل." } }
];
