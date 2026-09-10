import type { AccommodationLevel } from "./types";

/**
 * Four levels. Nightly figures are per room per night and feed the Phase 6
 * estimator, which multiplies them by destination and by night.
 */
export const accommodationLevels: AccommodationLevel[] = [
  {
    id: "essential",
    order: 1,
    name: { en: "Essential", ar: "أساسي" },
    summary: { en: "Clean, central and simple", ar: "نظيف، في قلب المدينة، وبلا تكلّف" },
    description: {
      en: "Well-run three-star hotels and family guesthouses in walkable parts of town. Private bathrooms, air conditioning and breakfast, without a pool or a view. The right choice when the trip is about what is outside the room.",
      ar: "فنادق ثلاث نجوم حسنة الإدارة وبيوت ضيافة عائلية في أحياء تمشي منها إلى كل شيء. حمام خاص وتكييف وفطور، من دون مسبح أو إطلالة. الاختيار الصحيح حين يكون ما يهمك في الرحلة خارج الغرفة لا داخلها.",
    },
    nightlyFrom: 35,
    nightlyTo: 60,
    inclusions: {
      en: ["Private ensuite room", "Air conditioning", "Breakfast", "Daily housekeeping"],
      ar: ["غرفة خاصة بحمام داخلي", "تكييف", "فطور", "تنظيف يومي"],
    },
    exampleProperties: { en: "Boutique guesthouses in Zamalek, west bank lodges in Luxor, eco-lodges in Siwa", ar: "بيوت ضيافة صغيرة في الزمالك، ونُزل في البر الغربي بالأقصر، ونُزل بيئية في سيوة" },
    accent: "#9a7a54",
  },
  {
    id: "comfort",
    order: 2,
    name: { en: "Comfort", ar: "مريح" },
    summary: { en: "Four-star, pool, proper breakfast", ar: "أربع نجوم، بمسبح وفطور يليق باليوم" },
    description: {
      en: "Established four-star hotels with a pool, a restaurant worth eating in and rooms large enough to spread out. The level most travellers pick, and the one the sample prices on this site assume by default.",
      ar: "فنادق أربع نجوم معروفة، بمسبح ومطعم يستحق أن تتعشى فيه وغرف تتسع لك ولحقائبك. المستوى الذي يختاره أغلب المسافرين، وهو ما تُحسب عليه الأسعار الإرشادية في هذا الموقع ما لم تغيّره.",
    },
    nightlyFrom: 75,
    nightlyTo: 130,
    inclusions: {
      en: ["Four-star room with a pool", "Full breakfast buffet", "24-hour reception", "Airport transfer coordination"],
      ar: ["غرفة أربع نجوم ومسبح", "بوفيه فطور كامل", "استقبال على مدار الساعة", "ترتيب الانتقال من المطار"],
    },
    exampleProperties: { en: "Nile-facing four stars in Cairo and Luxor, reef-front resorts in Hurghada", ar: "فنادق أربع نجوم على النيل في القاهرة والأقصر، ومنتجعات على الشعاب مباشرة في الغردقة" },
    accent: "#2c6e67",
  },
  {
    id: "premium",
    order: 3,
    name: { en: "Premium", ar: "متميّز" },
    summary: { en: "Five-star with a view worth paying for", ar: "خمس نجوم، والإطلالة تستحق الفرق" },
    description: {
      en: "Five-star hotels where the location is the point: a Nile-facing balcony in Aswan, a garden suite in Luxor, a bay-front room in Sharm. Includes a spa, several restaurants and staff who will rearrange a day for you.",
      ar: "فنادق خمس نجوم الموقع فيها هو الغاية: شرفة على النيل في أسوان، أو جناح على الحديقة في الأقصر، أو غرفة على الخليج في شرم الشيخ. مع سبا وأكثر من مطعم وطاقم يعيد ترتيب يومك متى طلبت.",
    },
    nightlyFrom: 140,
    nightlyTo: 250,
    inclusions: {
      en: ["Five-star room with a view", "Spa and multiple restaurants", "Priority check-in", "Concierge planning"],
      ar: ["غرفة خمس نجوم بإطلالة", "سبا وأكثر من مطعم", "أولوية في تسجيل الوصول", "كونسيرج يخطط لك"],
    },
    exampleProperties: { en: "Historic river hotels in Aswan and Luxor, bay-front five stars in Sharm El Sheikh", ar: "فنادق النيل التاريخية في أسوان والأقصر، وفنادق خمس نجوم على الخليج في شرم الشيخ" },
    accent: "#a8853b",
  },
  {
    id: "luxury",
    order: 4,
    name: { en: "Luxury", ar: "فاخر" },
    summary: { en: "Suites, private guiding, nothing queued", ar: "أجنحة، ومرشد خاص، ولا طوابير" },
    description: {
      en: "Suites and private villas, a dedicated guide and driver for the whole trip, private transfers between cities and skip-the-queue arrangements at every site. This tier also covers deluxe cabins on the river cruise and private desert camps.",
      ar: "أجنحة وفلل خاصة، ومرشد وسائق مخصصان لك طوال الرحلة، وانتقالات خاصة بين المدن، ودخول بلا طوابير في كل موقع. ويشمل هذا المستوى أيضًا الكبائن الفاخرة في الرحلة النيلية والمخيمات الصحراوية الخاصة.",
    },
    nightlyFrom: 260,
    nightlyTo: 600,
    inclusions: {
      en: ["Suite or private villa", "Dedicated guide and driver", "Private intercity transfers", "Priority site access"],
      ar: ["جناح أو فيلا خاصة", "مرشد وسائق مخصصان", "انتقالات خاصة بين المدن", "دخول بأولوية إلى المواقع"],
    },
    exampleProperties: { en: "Palace suites in Cairo and Aswan, deluxe cruise cabins, private White Desert camps", ar: "أجنحة القصور في القاهرة وأسوان، وكبائن فاخرة على المراكب النيلية، ومخيمات خاصة في الصحراء البيضاء" },
    accent: "#8a3b17",
  },
];

export const accommodationById = new Map(accommodationLevels.map((a) => [a.id, a]));
