import type { Faq, FaqCategory } from "./types";

export const faqCategories: FaqCategory[] = [
  { id: "planning", name: { en: "Planning your trip", ar: "التخطيط لرحلتك" } },
  { id: "pricing", name: { en: "Prices and estimates", ar: "الأسعار والتقديرات" } },
  { id: "practical", name: { en: "On the ground", ar: "على أرض الواقع" } },
  { id: "booking", name: { en: "Booking requests", ar: "طلبات الحجز" } },
];

export const faqs: Faq[] = [
  {
    id: "faq-01",
    categoryId: "planning",
    question: { en: "Do I need an account to build a trip?", ar: "هل أحتاج حسابًا لبناء رحلة؟" },
    answer: {
      en: "No. You can explore every destination, add experiences, build a full day-by-day itinerary and see the estimate without signing up. Your trip is saved in your own browser and stays there until you reset it.",
      ar: "لا. يمكنك استكشاف كل الوجهات وإضافة التجارب وبناء برنامج يومي كامل ورؤية التقدير دون تسجيل. وتُحفظ رحلتك في متصفحك أنت وتبقى فيه حتى تعيد ضبطها.",
    },
  },
  {
    id: "faq-02",
    categoryId: "planning",
    question: { en: "How many days do I need in Egypt?", ar: "كم يومًا أحتاج في مصر؟" },
    answer: {
      en: "Seven to ten days covers Cairo and the Nile valley without rushing. Add three or four more if you want the Red Sea or the Western Desert. Under five days, we would suggest staying in one region.",
      ar: "من سبعة إلى عشرة أيام تغطي القاهرة ووادي النيل دون استعجال. أضف ثلاثة أو أربعة أخرى إن أردت البحر الأحمر أو الصحراء الغربية. وإن كانت المدة أقل من خمسة أيام فننصح بالبقاء في إقليم واحد.",
    },
  },
  {
    id: "faq-03",
    categoryId: "planning",
    question: { en: "When is the best time to visit?", ar: "ما أفضل وقت للزيارة؟" },
    answer: {
      en: "October to April for the Nile valley and the desert, when daytime sightseeing is comfortable. The Red Sea works all year. July and August in Luxor and Aswan regularly exceed 40°C.",
      ar: "من أكتوبر إلى أبريل لوادي النيل والصحراء، حيث تكون الزيارات النهارية مريحة. أما البحر الأحمر فصالح طوال العام. ويتجاوز يوليو وأغسطس في الأقصر وأسوان أربعين درجة بانتظام.",
    },
  },
  {
    id: "faq-04",
    categoryId: "pricing",
    question: { en: "Is the price I see the final price?", ar: "هل السعر الذي أراه هو السعر النهائي؟" },
    answer: {
      en: "No. Everything shown is an estimate based on typical rates for your dates, party size and accommodation level. Availability moves prices, and a travel specialist confirms the final quotation after your request.",
      ar: "لا. كل ما يُعرض تقدير مبني على الأسعار المعتادة لتواريخك وعدد المسافرين ومستوى الإقامة. والتوافر يحرّك الأسعار، ويؤكد أحد مستشاري السفر العرض النهائي بعد طلبك.",
    },
  },
  {
    id: "faq-05",
    categoryId: "pricing",
    question: { en: "Are international flights included?", ar: "هل تشمل الأسعار الرحلات الجوية الدولية؟" },
    answer: {
      en: "No. Estimates cover accommodation, experiences, intercity transport within Egypt and the service fee. International flights are excluded and quoted separately if you ask us to arrange them.",
      ar: "لا. تغطي التقديرات الإقامة والتجارب والتنقل بين المدن داخل مصر ورسوم الخدمة. أما الرحلات الدولية فمستثناة، وتُسعَّر على حدة إن طلبت منا ترتيبها.",
    },
  },
  {
    id: "faq-06",
    categoryId: "pricing",
    question: { en: "Can I see prices in my own currency?", ar: "هل يمكنني رؤية الأسعار بعملتي؟" },
    answer: {
      en: "Yes. Choose from US dollars, euros, pounds sterling, Egyptian pounds, dirhams or riyals. Conversions are indicative and the final quotation is issued in one agreed currency.",
      ar: "نعم. اختر بين الدولار الأمريكي أو اليورو أو الجنيه الإسترليني أو الجنيه المصري أو الدرهم أو الريال. والتحويلات استرشادية، ويصدر العرض النهائي بعملة واحدة متفق عليها.",
    },
  },
  {
    id: "faq-07",
    categoryId: "practical",
    question: { en: "Is Egypt suitable for families with young children?", ar: "هل مصر مناسبة للعائلات ذات الأطفال الصغار؟" },
    answer: {
      en: "Yes, with pacing. Morning site visits, an afternoon break and a Red Sea stretch at the end works well. Our family journey is built exactly that way, and every experience page states a minimum age where one applies.",
      ar: "نعم، مع ضبط الإيقاع. زيارات صباحية للمواقع واستراحة بعد الظهر ومقطع على البحر الأحمر في النهاية تنجح جيدًا. ورحلة العائلة لدينا مبنية بهذه الطريقة تمامًا، وتذكر كل صفحة تجربة الحد الأدنى للعمر حيثما وُجد.",
    },
  },
  {
    id: "faq-08",
    categoryId: "practical",
    question: { en: "What should I wear at religious sites?", ar: "ماذا ألبس في الأماكن الدينية؟" },
    answer: {
      en: "Shoulders and knees covered for mosques and churches, and a light scarf for women to cover the head inside mosques. Shoes come off at the mosque door. Ordinary clothing is fine everywhere else.",
      ar: "تغطية الكتفين والركبتين في المساجد والكنائس، ووشاح خفيف للسيدات لتغطية الرأس داخل المساجد. وتُخلع الأحذية عند باب المسجد. أما في غير ذلك فاللباس العادي مناسب.",
    },
  },
  {
    id: "faq-09",
    categoryId: "practical",
    question: { en: "How do I get between cities?", ar: "كيف أتنقل بين المدن؟" },
    answer: {
      en: "Domestic flights for Cairo to Luxor, Aswan or the Red Sea; trains along the Nile and to Alexandria; private vehicles for Siwa and the Western Desert. Your itinerary shows the recommended mode and journey time for every leg.",
      ar: "رحلات داخلية من القاهرة إلى الأقصر أو أسوان أو البحر الأحمر، وقطارات بمحاذاة النيل وإلى الإسكندرية، وسيارات خاصة إلى سيوة والصحراء الغربية. ويعرض برنامجك الوسيلة المقترحة وزمن الرحلة لكل مرحلة.",
    },
  },
  {
    id: "faq-10",
    categoryId: "booking",
    question: { en: "What happens after I submit a request?", ar: "ماذا يحدث بعد إرسال الطلب؟" },
    answer: {
      en: "You receive a booking reference and a copy of your itinerary immediately. A travel specialist reviews availability and comes back within one working day with a confirmed quotation and any adjustments.",
      ar: "تستلم رقمًا مرجعيًا للحجز ونسخة من برنامجك فورًا. ويراجع أحد مستشاري السفر التوافر ويعود إليك خلال يوم عمل واحد بعرض مؤكد وأي تعديلات لازمة.",
    },
  },
  {
    id: "faq-11",
    categoryId: "booking",
    question: { en: "Am I paying anything on this site?", ar: "هل أدفع أي شيء على هذا الموقع؟" },
    answer: {
      en: "No. Submitting a request costs nothing and commits you to nothing. There is no card form and no online payment anywhere in the journey.",
      ar: "لا. إرسال الطلب لا يكلفك شيئًا ولا يلزمك بشيء. ولا يوجد نموذج بطاقة ولا دفع إلكتروني في أي مرحلة من الرحلة.",
    },
  },
  {
    id: "faq-12",
    categoryId: "booking",
    question: { en: "Can I change my itinerary after requesting?", ar: "هل يمكنني تعديل برنامجي بعد إرسال الطلب؟" },
    answer: {
      en: "Yes. The request is a starting point, not a contract. Your specialist will adjust destinations, dates, experiences and accommodation before anything is confirmed.",
      ar: "نعم. الطلب نقطة انطلاق لا عقد. وسيعدّل مستشارك الوجهات والتواريخ والتجارب والإقامة قبل تأكيد أي شيء.",
    },
  },
];
