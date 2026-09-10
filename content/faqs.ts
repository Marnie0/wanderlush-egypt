import type { Faq, FaqCategory } from "./types";

export const faqCategories: FaqCategory[] = [
  { id: "planning", name: { en: "Planning your trip", ar: "التخطيط لرحلتك" } },
  { id: "pricing", name: { en: "Prices and estimates", ar: "الأسعار والتقديرات" } },
  { id: "practical", name: { en: "On the ground", ar: "أثناء الرحلة" } },
  { id: "booking", name: { en: "Booking requests", ar: "طلبات الحجز" } },
];

export const faqs: Faq[] = [
  {
    id: "faq-01",
    categoryId: "planning",
    question: { en: "Do I need an account to build a trip?", ar: "هل أحتاج إلى حساب لأبني رحلة؟" },
    answer: {
      en: "No. You can explore every destination, add experiences, build a full day-by-day itinerary and see the estimate without signing up. Your trip is saved in your own browser and stays there until you reset it.",
      ar: "لا. تستطيع أن تستكشف كل الوجهات وتضيف التجارب وتبني برنامجًا يوميًا كاملًا وترى التقدير دون أن تسجّل. رحلتك محفوظة في متصفحك، وتبقى فيه إلى أن تمسحها بنفسك.",
    },
  },
  {
    id: "faq-02",
    categoryId: "planning",
    question: { en: "How many days do I need in Egypt?", ar: "كم يومًا أحتاج في مصر؟" },
    answer: {
      en: "Seven to ten days covers Cairo and the Nile valley without rushing. Add three or four more if you want the Red Sea or the Western Desert. Under five days, we would suggest staying in one region.",
      ar: "سبعة إلى عشرة أيام تكفي للقاهرة ووادي النيل بلا عجلة. أضف ثلاثة أو أربعة أيام إن أردت البحر الأحمر أو الصحراء الغربية. وإن كان معك أقل من خمسة أيام، فننصحك بالبقاء في إقليم واحد.",
    },
  },
  {
    id: "faq-03",
    categoryId: "planning",
    question: { en: "When is the best time to visit?", ar: "متى أفضل وقت للزيارة؟" },
    answer: {
      en: "October to April for the Nile valley and the desert, when daytime sightseeing is comfortable. The Red Sea works all year. July and August in Luxor and Aswan regularly exceed 40°C.",
      ar: "من أكتوبر إلى أبريل لوادي النيل والصحراء، حين تكون جولات النهار مريحة. البحر الأحمر مناسب طوال العام. أما يوليو وأغسطس في الأقصر وأسوان فتتجاوز الحرارة فيهما 40 درجة في معظم الأيام.",
    },
  },
  {
    id: "faq-04",
    categoryId: "pricing",
    question: { en: "Is the price I see the final price?", ar: "هل السعر الذي أراه نهائي؟" },
    answer: {
      en: "No. Everything shown is an estimate based on typical rates for your dates, party size and accommodation level. Availability moves prices, and a travel specialist confirms the final quotation after your request.",
      ar: "لا. كل ما تراه تقدير مبني على الأسعار المعتادة لتواريخك وعدد المسافرين ومستوى الإقامة. التوافر يغيّر الأسعار، ومستشار السفر هو من يؤكد عرض السعر النهائي بعد أن يصلنا طلبك.",
    },
  },
  {
    id: "faq-05",
    categoryId: "pricing",
    question: { en: "Are international flights included?", ar: "هل تذاكر الطيران الدولية مشمولة؟" },
    answer: {
      en: "No. Estimates cover accommodation, experiences, intercity transport within Egypt and the service fee. International flights are excluded and quoted separately if you ask us to arrange them.",
      ar: "لا. يغطي التقدير الإقامة والتجارب والتنقّل بين المدن داخل مصر ورسوم الخدمة. أما الطيران الدولي فغير مشمول، ونسعّره على حدة إن طلبت منا ترتيبه.",
    },
  },
  {
    id: "faq-06",
    categoryId: "pricing",
    question: { en: "Can I see prices in my own currency?", ar: "هل أستطيع رؤية الأسعار بعملتي؟" },
    answer: {
      en: "Yes. Choose from US dollars, euros, pounds sterling, Egyptian pounds, dirhams or riyals. Conversions are indicative and the final quotation is issued in one agreed currency.",
      ar: "نعم. اختر بين الدولار الأمريكي واليورو والجنيه الإسترليني والجنيه المصري والدرهم الإماراتي والريال السعودي. التحويل استرشادي، ويصدر عرض السعر النهائي بعملة واحدة نتفق عليها.",
    },
  },
  {
    id: "faq-07",
    categoryId: "practical",
    question: { en: "Is Egypt suitable for families with young children?", ar: "هل تناسب مصر العائلات التي معها أطفال صغار؟" },
    answer: {
      en: "Yes, with pacing. Morning site visits, an afternoon break and a Red Sea stretch at the end works well. Our family journey is built exactly that way, and every experience page states a minimum age where one applies.",
      ar: "نعم، بشرط ضبط الإيقاع. زيارات قصيرة في الصباح، واستراحة بعد الظهر، وأيام على البحر الأحمر في الختام: هذه الوصفة تنجح. رحلة العائلة عندنا مبنية على هذا الأساس تحديدًا، وكل صفحة تجربة تذكر الحد الأدنى للعمر إن وُجد.",
    },
  },
  {
    id: "faq-08",
    categoryId: "practical",
    question: { en: "What should I wear at religious sites?", ar: "ماذا أرتدي في الأماكن الدينية؟" },
    answer: {
      en: "Shoulders and knees covered for mosques and churches, and a light scarf for women to cover the head inside mosques. Shoes come off at the mosque door. Ordinary clothing is fine everywhere else.",
      ar: "غطِّ الكتفين والركبتين في المساجد والكنائس، وتحتاج السيدات إلى وشاح خفيف لتغطية الرأس داخل المساجد. وتُخلع الأحذية عند باب المسجد. في ما عدا ذلك، اللباس العادي مناسب في كل مكان.",
    },
  },
  {
    id: "faq-09",
    categoryId: "practical",
    question: { en: "How do I get between cities?", ar: "كيف أتنقّل بين المدن؟" },
    answer: {
      en: "Domestic flights for Cairo to Luxor, Aswan or the Red Sea; trains along the Nile and to Alexandria; private vehicles for Siwa and the Western Desert. Your itinerary shows the recommended mode and journey time for every leg.",
      ar: "طيران داخلي من القاهرة إلى الأقصر وأسوان والبحر الأحمر، وقطارات على طول النيل وإلى الإسكندرية، وسيارات خاصة إلى سيوة والصحراء الغربية. ويعرض برنامجك اليومي الوسيلة المقترحة ومدة الطريق في كل مرحلة.",
    },
  },
  {
    id: "faq-10",
    categoryId: "booking",
    question: { en: "What happens after I submit a request?", ar: "ماذا يحدث بعد أن أرسل الطلب؟" },
    answer: {
      en: "You receive a booking reference and a copy of your itinerary immediately. A travel specialist reviews availability and comes back within one working day with a confirmed quotation and any adjustments.",
      ar: "يصلك رقم مرجع الحجز ونسخة من برنامجك اليومي في الحال. ثم يراجع مستشار السفر التوافر ويعود إليك خلال يوم عمل واحد بعرض سعر مؤكد وما يلزم من تعديلات.",
    },
  },
  {
    id: "faq-11",
    categoryId: "booking",
    question: { en: "Am I paying anything on this site?", ar: "هل أدفع شيئًا على هذا الموقع؟" },
    answer: {
      en: "No. Submitting a request costs nothing and commits you to nothing. There is no card form and no online payment anywhere in the journey.",
      ar: "لا. إرسال الطلب لا يكلّفك شيئًا ولا يلزمك بشيء. لا نموذج لبطاقة ولا دفع إلكتروني في أي مرحلة.",
    },
  },
  {
    id: "faq-12",
    categoryId: "booking",
    question: { en: "Can I change my itinerary after requesting?", ar: "هل أستطيع تعديل برنامجي بعد إرسال الطلب؟" },
    answer: {
      en: "Yes. The request is a starting point, not a contract. Your specialist will adjust destinations, dates, experiences and accommodation before anything is confirmed.",
      ar: "نعم. الطلب نقطة بداية، لا عقد. يعدّل مستشارك الوجهات والتواريخ والتجارب والإقامة معك قبل تأكيد أي شيء.",
    },
  },
];
