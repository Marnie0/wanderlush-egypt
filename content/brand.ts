import type { Localized } from "./types";

/**
 * The brand in machine-readable form. `docs/brand-guide.md` is the written
 * version for humans; this file is what the About page actually renders.
 */
export const brand = {
  name: { en: "Wanderlush Egypt", ar: "واندرلاش مصر" } satisfies Localized,
  tagline: {
    en: "Experience Egypt beyond the ordinary",
    ar: "عِش مصر خارج المألوف",
  } satisfies Localized,
  purpose: {
    en: "Most people arrive in Egypt with a list of monuments and leave with photographs of a queue. We exist so that travellers design a journey around what they actually want, understand what it costs before they commit, and arrive knowing why each day is arranged the way it is.",
    ar: "يصل معظم الزوار إلى مصر وفي أيديهم قائمة بالآثار، ويعودون بصور الطوابير. نحن هنا ليصمّم المسافر رحلته حول ما يريده هو، ويعرف كم ستكلّفه قبل أن يلتزم بشيء، ويصل وهو يفهم لماذا رُتّب كل يوم على هذا النحو.",
  } satisfies Localized,
  valueProposition: {
    en: "A journey you design yourself, priced honestly, arranged by people who live here.",
    ar: "رحلة تصمّمها بنفسك، بسعر لا يخفي شيئًا، يرتّبها أناس يعيشون هنا.",
  } satisfies Localized,
  story: [
    {
      en: "Egypt is not difficult to visit. It is difficult to plan. The distances are longer than they look, the good hours at each site are narrow, and the difference between a fine day and an unforgettable one is usually a decision made three weeks earlier.",
      ar: "زيارة مصر ليست الصعبة؛ الصعب هو التخطيط لها. فالمسافات أطول مما تبدو على الخريطة، والساعات المناسبة في كل موقع قليلة، والفرق بين يوم جميل ويوم لا يُنسى قرارٌ اتُّخذ غالبًا قبل ثلاثة أسابيع.",
    },
    {
      en: "So we built the planning instead of selling the package. You choose the destinations, we tell you how many days each one deserves and how you get between them. You choose the experiences, we flag the day you have overloaded. The estimate moves as you work, so there is never a number waiting at the end that you did not expect.",
      ar: "لذلك بنينا أداة التخطيط بدل أن نبيع باقة جاهزة. تختار أنت الوجهات، ونخبرك كم يومًا تستحق كل واحدة وكيف تنتقل بينها. تختار التجارب، وننبّهك إلى اليوم الذي أثقلته. ويتغيّر التقدير مع كل خطوة، فلا ينتظرك في النهاية رقم لم تتوقعه.",
    },
    {
      en: "Everything is written by people who have stood on the west bank at six in the morning and know which tomb is worth the extra ticket. Nothing on this site is a stock description, and nothing is a promise we would not keep.",
      ar: "كل ما تقرؤه هنا كتبه أناس وقفوا على البر الغربي في السادسة صباحًا ويعرفون أي مقبرة تستحق التذكرة الإضافية. لا وصف جاهزًا في هذا الموقع، ولا وعدًا لا نستطيع الوفاء به.",
    },
  ],
  values: [
    {
      title: { en: "Local knowledge, stated plainly", ar: "معرفة محلية، بلا مواربة" },
      body: {
        en: "We tell you the balloon gets cancelled for wind, that Abu Simbel by road starts at four in the morning, and that January nights in the desert are genuinely cold.",
        ar: "نقول لك إن المنطاد يُلغى حين تشتد الرياح، وإن رحلة أبو سمبل بالسيارة تبدأ في الرابعة فجرًا، وإن ليالي يناير في الصحراء باردة حقًا.",
      },
    },
    {
      title: { en: "Flexible by default", ar: "المرونة هي الأصل" },
      body: {
        en: "Reorder days, swap an experience, change the accommodation level. Nothing is locked until a specialist confirms it with you.",
        ar: "أعد ترتيب الأيام، أو بدّل تجربة بأخرى، أو غيّر مستوى الإقامة. لا شيء يُثبَّت قبل أن يؤكده معك مستشار السفر.",
      },
    },
    {
      title: { en: "Transparent estimates", ar: "تقديرات شفافة" },
      body: {
        en: "Accommodation, activities, transport and the service fee are itemised. What is excluded is written down, not buried.",
        ar: "الإقامة والأنشطة والتنقّل ورسوم الخدمة، كلٌّ في بنده. وما لا يشمله السعر مكتوب بوضوح، لا مدفون في الهوامش.",
      },
    },
    {
      title: { en: "Both languages, properly", ar: "لغتان، كلٌّ كما ينبغي" },
      body: {
        en: "Arabic is not a translation layer here. Dates, prices, layout and typography are all built for it from the start.",
        ar: "العربية هنا ليست طبقة ترجمة فوق الإنجليزية. التواريخ والأسعار والتخطيط والخطوط صُممت لها منذ اليوم الأول.",
      },
    },
  ],
  /**
   * The six promises the homepage makes, in the order the brief lists them.
   * `icon` maps to a shape in `src/components/ui/Icon.tsx`.
   */
  promises: [
    {
      icon: "route",
      title: { en: "Itineraries built around you", ar: "برامج على مقاسك" },
      body: {
        en: "Choose the places and the pace. We tell you how many days each one deserves and how you get between them.",
        ar: "اختر الأماكن والإيقاع الذي يناسبك، ونخبرك كم يومًا تستحق كل وجهة وكيف تنتقل بينها.",
      },
    },
    {
      icon: "compass",
      title: { en: "Experiences worth the day", ar: "تجارب تستحق يومًا من رحلتك" },
      body: {
        en: "Twenty-seven of them, each one chosen because it is better than the obvious alternative, not because it sells.",
        ar: "سبع وعشرون تجربة، اخترنا كل واحدة لأنها أفضل من البديل المعتاد، لا لأنها الأكثر مبيعًا.",
      },
    },
    {
      icon: "pin",
      title: { en: "Local knowledge, written down", ar: "معرفة محلية مكتوبة" },
      body: {
        en: "Which hour to arrive, which tomb needs the extra ticket, which night the desert drops near freezing.",
        ar: "في أي ساعة تصل، وأي مقبرة تحتاج تذكرة إضافية، وفي أي ليلة تقترب حرارة الصحراء من الصفر.",
      },
    },
    {
      icon: "shuffle",
      title: { en: "Nothing locked in", ar: "لا شيء نهائي" },
      body: {
        en: "Reorder days, swap an experience, change the accommodation level. A request is a starting point, not a contract.",
        ar: "أعد ترتيب الأيام، أو بدّل تجربة، أو غيّر مستوى الإقامة. الطلب نقطة بداية، لا عقد.",
      },
    },
    {
      icon: "receipt",
      title: { en: "Estimates you can read", ar: "تقديرات تُقرأ" },
      body: {
        en: "Accommodation, activities, transport and the fee, itemised and moving as you build. What is excluded is written down.",
        ar: "الإقامة والأنشطة والتنقّل والرسوم، كلٌّ في بنده، تتغيّر وأنت تبني رحلتك. وما لا يشمله السعر مكتوب بوضوح.",
      },
    },
    {
      icon: "language",
      title: { en: "Arabic, properly", ar: "العربية كما ينبغي" },
      body: {
        en: "Not a translation layer. Dates, prices, layout and typography are built for both languages from the start.",
        ar: "ليست طبقة ترجمة. التواريخ والأسعار والتخطيط والخطوط صُممت للغتين منذ اليوم الأول.",
      },
    },
  ],
  personality: {
    en: "Confident, warm and specific. We sound like a well-travelled friend who happens to live in Cairo, not like a brochure.",
    ar: "واثقون، ودودون، دقيقون. نتحدث كصديق كثير الأسفار يصادف أنه يسكن القاهرة، لا كنشرة دعائية.",
  } satisfies Localized,
  privacy: [
    {
      en: "This is a portfolio demonstration of a fictional travel company. It does not take payments and does not run advertising or third-party tracking.",
      ar: "هذا الموقع عرض تجريبي لشركة سفر متخيَّلة ضمن معرض أعمال. لا يقبل مدفوعات، ولا يعرض إعلانات، ولا يتتبّعك عبر أي طرف ثالث.",
    },
    {
      en: "The trip you build is stored in your own browser so it survives a refresh. Clearing it removes it completely, and it is never sent anywhere until you submit a booking request.",
      ar: "الرحلة التي تبنيها محفوظة في متصفحك وحده، فلا تضيع إن حدّثت الصفحة. وإن مسحتها زالت تمامًا، ولا تُرسل إلى أي جهة قبل أن تقدّم طلب حجز بنفسك.",
    },
    {
      en: "If you submit a request, the details you enter are stored so a specialist can reply. Nothing is shared with anyone else, and you can ask for the record to be deleted at any time.",
      ar: "إن أرسلت طلبًا، نحتفظ بالبيانات التي أدخلتها ليتمكّن مستشار السفر من الرد عليك. لا نشاركها مع أحد، ويمكنك أن تطلب حذفها في أي وقت.",
    },
  ],
} as const;
