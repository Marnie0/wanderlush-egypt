import type { AccommodationLevel } from "./types";

/**
 * Four levels. Nightly figures are per room per night and feed the Phase 6
 * estimator, which multiplies them by destination and by night.
 */
export const accommodationLevels: AccommodationLevel[] = [
  {
    id: "essential",
    order: 1,
    name: { en: "Essential", ar: "الأساسي" },
    summary: { en: "Clean, central and simple", ar: "نظيف ومركزي وبسيط" },
    description: {
      en: "Well-run three-star hotels and family guesthouses in walkable parts of town. Private bathrooms, air conditioning and breakfast, without a pool or a view. The right choice when the trip is about what is outside the room.",
      ar: "فنادق ثلاث نجوم جيدة الإدارة وبيوت ضيافة عائلية في مواضع يسهل السير منها. حمامات خاصة وتكييف وفطور، بلا مسبح أو إطلالة. الخيار الصحيح حين تكون الرحلة عمّا هو خارج الغرفة.",
    },
    nightlyFrom: 35,
    nightlyTo: 60,
    inclusions: {
      en: ["Private ensuite room", "Air conditioning", "Breakfast", "Daily housekeeping"],
      ar: ["غرفة خاصة بحمام داخلي", "تكييف هواء", "فطور", "خدمة تنظيف يومية"],
    },
    exampleProperties: { en: "Boutique guesthouses in Zamalek, west bank lodges in Luxor, eco-lodges in Siwa", ar: "بيوت ضيافة صغيرة في الزمالك، ونُزل الضفة الغربية في الأقصر، ونُزل بيئية في سيوة" },
    accent: "#9a7a54",
  },
  {
    id: "comfort",
    order: 2,
    name: { en: "Comfort", ar: "المريح" },
    summary: { en: "Four-star, pool, proper breakfast", ar: "أربع نجوم ومسبح وفطور وافٍ" },
    description: {
      en: "Established four-star hotels with a pool, a restaurant worth eating in and rooms large enough to spread out. The level most travellers pick, and the one the sample prices on this site assume by default.",
      ar: "فنادق أربع نجوم راسخة بمسبح ومطعم يستحق تناول الطعام فيه وغرف واسعة بما يكفي. وهو المستوى الذي يختاره معظم المسافرين، وما تفترضه الأسعار الاسترشادية في هذا الموقع افتراضيًا.",
    },
    nightlyFrom: 75,
    nightlyTo: 130,
    inclusions: {
      en: ["Four-star room with a pool", "Full breakfast buffet", "24-hour reception", "Airport transfer coordination"],
      ar: ["غرفة أربع نجوم مع مسبح", "بوفيه فطور كامل", "استقبال على مدار الساعة", "تنسيق الانتقال من المطار"],
    },
    exampleProperties: { en: "Nile-facing four stars in Cairo and Luxor, reef-front resorts in Hurghada", ar: "فنادق أربع نجوم مطلة على النيل في القاهرة والأقصر، ومنتجعات على الشعاب في الغردقة" },
    accent: "#2c6e67",
  },
  {
    id: "premium",
    order: 3,
    name: { en: "Premium", ar: "المتميز" },
    summary: { en: "Five-star with a view worth paying for", ar: "خمس نجوم بإطلالة تستحق فرقها" },
    description: {
      en: "Five-star hotels where the location is the point: a Nile-facing balcony in Aswan, a garden suite in Luxor, a bay-front room in Sharm. Includes a spa, several restaurants and staff who will rearrange a day for you.",
      ar: "فنادق خمس نجوم يكون الموقع فيها هو المقصد: شرفة على النيل في أسوان، وجناح على الحديقة في الأقصر، وغرفة على الخليج في شرم. وتشمل منتجعًا صحيًا وعدة مطاعم وطاقمًا يعيد ترتيب يومك من أجلك.",
    },
    nightlyFrom: 140,
    nightlyTo: 250,
    inclusions: {
      en: ["Five-star room with a view", "Spa and multiple restaurants", "Priority check-in", "Concierge planning"],
      ar: ["غرفة خمس نجوم بإطلالة", "منتجع صحي ومطاعم متعددة", "تسجيل وصول بأولوية", "خدمة كونسيرج للتخطيط"],
    },
    exampleProperties: { en: "Historic river hotels in Aswan and Luxor, bay-front five stars in Sharm El Sheikh", ar: "فنادق نهرية تاريخية في أسوان والأقصر، وفنادق خمس نجوم على الخليج في شرم الشيخ" },
    accent: "#a8853b",
  },
  {
    id: "luxury",
    order: 4,
    name: { en: "Luxury", ar: "الفاخر" },
    summary: { en: "Suites, private guiding, nothing queued", ar: "أجنحة وإرشاد خاص وبلا طوابير" },
    description: {
      en: "Suites and private villas, a dedicated guide and driver for the whole trip, private transfers between cities and skip-the-queue arrangements at every site. This tier also covers deluxe cabins on the river cruise and private desert camps.",
      ar: "أجنحة وفلل خاصة، ومرشد وسائق مخصصان طوال الرحلة، وانتقالات خاصة بين المدن، وترتيبات لتجاوز الطوابير في كل موقع. ويشمل هذا المستوى أيضًا الكبائن الفاخرة في الرحلة النهرية والمخيمات الصحراوية الخاصة.",
    },
    nightlyFrom: 260,
    nightlyTo: 600,
    inclusions: {
      en: ["Suite or private villa", "Dedicated guide and driver", "Private intercity transfers", "Priority site access"],
      ar: ["جناح أو فيلا خاصة", "مرشد وسائق مخصصان", "انتقالات خاصة بين المدن", "دخول المواقع بأولوية"],
    },
    exampleProperties: { en: "Palace suites in Cairo and Aswan, deluxe cruise cabins, private White Desert camps", ar: "أجنحة قصور في القاهرة وأسوان، وكبائن فاخرة في الرحلات النيلية، ومخيمات خاصة في الصحراء البيضاء" },
    accent: "#8a3b17",
  },
];

export const accommodationById = new Map(accommodationLevels.map((a) => [a.id, a]));
