import type { Localized } from "./types";

/**
 * The brand in machine-readable form. `docs/brand-guide.md` is the written
 * version for humans; this file is what the About page actually renders.
 */
export const brand = {
  name: { en: "Wanderlush Egypt", ar: "واندرلَش مصر" } satisfies Localized,
  tagline: {
    en: "Experience Egypt beyond the ordinary",
    ar: "عِش مصر على غير المعتاد",
  } satisfies Localized,
  purpose: {
    en: "Most people arrive in Egypt with a list of monuments and leave with photographs of a queue. We exist so that travellers design a journey around what they actually want, understand what it costs before they commit, and arrive knowing why each day is arranged the way it is.",
    ar: "يصل معظم الناس إلى مصر ومعهم قائمة من الآثار، ويغادرون بصور لطوابير. نحن موجودون كي يصمم المسافر رحلته حول ما يريده فعلًا، ويعرف تكلفتها قبل أن يلتزم، ويصل وهو يفهم لماذا رُتب كل يوم على هذا النحو.",
  } satisfies Localized,
  valueProposition: {
    en: "A journey you design yourself, priced honestly, arranged by people who live here.",
    ar: "رحلة تصممها بنفسك، بسعر صادق، ينظمها من يعيشون هنا.",
  } satisfies Localized,
  story: [
    {
      en: "Egypt is not difficult to visit. It is difficult to plan. The distances are longer than they look, the good hours at each site are narrow, and the difference between a fine day and an unforgettable one is usually a decision made three weeks earlier.",
      ar: "زيارة مصر ليست صعبة. التخطيط لها هو الصعب. فالمسافات أطول مما تبدو، والساعات الجيدة في كل موقع ضيقة، والفارق بين يوم جيد ويوم لا يُنسى قرار اتُّخذ قبل ثلاثة أسابيع غالبًا.",
    },
    {
      en: "So we built the planning instead of selling the package. You choose the destinations, we tell you how many days each one deserves and how you get between them. You choose the experiences, we flag the day you have overloaded. The estimate moves as you work, so there is never a number waiting at the end that you did not expect.",
      ar: "لذلك بنينا التخطيط بدل بيع الباقة. أنت تختار الوجهات، ونخبرك بعدد الأيام التي تستحقها كل واحدة وكيف تنتقل بينها. وأنت تختار التجارب، وننبهك إلى اليوم الذي حمّلته أكثر مما يحتمل. ويتحرك التقدير أثناء عملك، فلا يفاجئك رقم في النهاية لم تكن تتوقعه.",
    },
    {
      en: "Everything is written by people who have stood on the west bank at six in the morning and know which tomb is worth the extra ticket. Nothing on this site is a stock description, and nothing is a promise we would not keep.",
      ar: "كل ما هنا كتبه من وقفوا في الضفة الغربية عند السادسة صباحًا، ويعرفون أي مقبرة تستحق التذكرة الإضافية. لا شيء في هذا الموقع وصف جاهز، ولا شيء فيه وعد لا نفي به.",
    },
  ],
  values: [
    {
      title: { en: "Local knowledge, stated plainly", ar: "معرفة محلية تُقال بوضوح" },
      body: {
        en: "We tell you the balloon gets cancelled for wind, that Abu Simbel by road starts at four in the morning, and that January nights in the desert are genuinely cold.",
        ar: "نخبرك أن المنطاد يُلغى بسبب الرياح، وأن الطريق إلى أبو سمبل يبدأ عند الرابعة فجرًا، وأن ليالي يناير في الصحراء باردة فعلًا.",
      },
    },
    {
      title: { en: "Flexible by default", ar: "مرونة افتراضية" },
      body: {
        en: "Reorder days, swap an experience, change the accommodation level. Nothing is locked until a specialist confirms it with you.",
        ar: "أعد ترتيب الأيام، وبدّل تجربة، وغيّر مستوى الإقامة. لا شيء يُثبَّت حتى يؤكده معك أحد المستشارين.",
      },
    },
    {
      title: { en: "Transparent estimates", ar: "تقديرات شفافة" },
      body: {
        en: "Accommodation, activities, transport and the service fee are itemised. What is excluded is written down, not buried.",
        ar: "الإقامة والأنشطة والتنقل ورسوم الخدمة مفصّلة بندًا بندًا. وما هو مستثنى مكتوب صراحة لا مدفون.",
      },
    },
    {
      title: { en: "Both languages, properly", ar: "اللغتان كما ينبغي" },
      body: {
        en: "Arabic is not a translation layer here. Dates, prices, layout and typography are all built for it from the start.",
        ar: "العربية هنا ليست طبقة ترجمة. فالتواريخ والأسعار والتخطيط والخطوط كلها مبنية لها منذ البداية.",
      },
    },
  ],
  personality: {
    en: "Confident, warm and specific. We sound like a well-travelled friend who happens to live in Cairo, not like a brochure.",
    ar: "واثقون ودافئون ومحددون. نبدو كصديق كثير الترحال يقيم في القاهرة، لا ككتيّب دعائي.",
  } satisfies Localized,
  privacy: [
    {
      en: "This is a portfolio demonstration of a fictional travel company. It does not take payments and does not run advertising or third-party tracking.",
      ar: "هذا عرض لمشروع يحاكي شركة سفر متخيَّلة. لا يستقبل مدفوعات ولا يشغّل إعلانات ولا تتبعًا من طرف ثالث.",
    },
    {
      en: "The trip you build is stored in your own browser so it survives a refresh. Clearing it removes it completely, and it is never sent anywhere until you submit a booking request.",
      ar: "تُحفظ الرحلة التي تبنيها في متصفحك أنت لتبقى بعد تحديث الصفحة. ومسحها يزيلها تمامًا، ولا تُرسل إلى أي جهة حتى ترسل طلب حجز.",
    },
    {
      en: "If you submit a request, the details you enter are stored so a specialist can reply. Nothing is shared with anyone else, and you can ask for the record to be deleted at any time.",
      ar: "إذا أرسلت طلبًا، تُحفظ البيانات التي تدخلها ليتمكن أحد المستشارين من الرد. ولا تُشارك مع أي جهة أخرى، ويمكنك طلب حذف السجل في أي وقت.",
    },
  ],
} as const;
