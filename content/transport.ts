import type { Localized } from "./types";

export type TransportMode = "flight" | "train" | "road";

export interface TransportOption {
  mode: TransportMode;
  /** Door to door, including the airport or station at either end. */
  hours: number;
  /** Indicative USD per person, one way. */
  priceFrom: number;
  note?: Localized;
}

export interface TransportLink {
  between: [string, string];
  options: TransportOption[];
}

/**
 * How to get between the places we send people. Direct links only; anything
 * not listed here routes through a hub (see `findRoute`), which is also how
 * the trips are actually run: nobody drives from Siwa to Sharm el-Sheikh.
 */
export const transportLinks: TransportLink[] = [
  { between: ["cairo", "giza"], options: [{ mode: "road", hours: 0.75, priceFrom: 15 }] },
  {
    between: ["cairo", "alexandria"],
    options: [
      { mode: "train", hours: 2.5, priceFrom: 15, note: { en: "First-class express from Ramses station", ar: "قطار سريع درجة أولى من محطة رمسيس" } },
      { mode: "road", hours: 3, priceFrom: 40 },
    ],
  },
  { between: ["cairo", "fayoum"], options: [{ mode: "road", hours: 1.5, priceFrom: 35 }] },
  { between: ["giza", "fayoum"], options: [{ mode: "road", hours: 1.25, priceFrom: 35 }] },
  {
    between: ["cairo", "luxor"],
    options: [
      { mode: "flight", hours: 2.5, priceFrom: 110, note: { en: "One hour in the air, with the airport at each end", ar: "ساعة في الجو، مع المطار في الطرفين" } },
      { mode: "train", hours: 10, priceFrom: 90, note: { en: "Overnight sleeper, a cabin for two", ar: "قطار نوم ليلي، كابينة لشخصين" } },
    ],
  },
  {
    between: ["cairo", "aswan"],
    options: [
      { mode: "flight", hours: 3, priceFrom: 120 },
      { mode: "train", hours: 12, priceFrom: 95, note: { en: "Overnight sleeper, a cabin for two", ar: "قطار نوم ليلي، كابينة لشخصين" } },
    ],
  },
  {
    between: ["cairo", "hurghada"],
    options: [
      { mode: "flight", hours: 2.5, priceFrom: 95 },
      { mode: "road", hours: 5.5, priceFrom: 45 },
    ],
  },
  {
    between: ["cairo", "sharm-el-sheikh"],
    options: [
      { mode: "flight", hours: 2.5, priceFrom: 100 },
      { mode: "road", hours: 6.5, priceFrom: 45 },
    ],
  },
  {
    between: ["cairo", "siwa-oasis"],
    options: [{ mode: "road", hours: 8.5, priceFrom: 70, note: { en: "Via Marsa Matrouh; the last three hours are open desert", ar: "عبر مرسى مطروح؛ الساعات الثلاث الأخيرة صحراء مفتوحة" } }],
  },
  {
    between: ["alexandria", "siwa-oasis"],
    options: [{ mode: "road", hours: 7, priceFrom: 65, note: { en: "The coast road to Marsa Matrouh, then inland", ar: "الطريق الساحلي إلى مرسى مطروح، ثم إلى الداخل" } }],
  },
  {
    between: ["cairo", "white-desert"],
    options: [{ mode: "road", hours: 5, priceFrom: 60, note: { en: "To Bahariya, where the 4x4 takes over", ar: "إلى الواحات البحرية، حيث تتولى سيارة الدفع الرباعي" } }],
  },
  {
    between: ["siwa-oasis", "white-desert"],
    options: [{ mode: "road", hours: 7.5, priceFrom: 130, note: { en: "A permit and a 4x4 for the desert track to Bahariya", ar: "تصريح وسيارة دفع رباعي لمسار الصحراء إلى الواحات البحرية" } }],
  },
  {
    between: ["luxor", "aswan"],
    options: [
      { mode: "road", hours: 3.5, priceFrom: 40, note: { en: "Edfu and Kom Ombo sit on the way", ar: "إدفو وكوم أمبو على الطريق" } },
      { mode: "train", hours: 3, priceFrom: 20 },
    ],
  },
  { between: ["luxor", "hurghada"], options: [{ mode: "road", hours: 4, priceFrom: 45 }] },
  {
    between: ["hurghada", "sharm-el-sheikh"],
    options: [{ mode: "flight", hours: 3, priceFrom: 110, note: { en: "Usually connecting through Cairo", ar: "عادةً عبر القاهرة" } }],
  },
];

/** Places a route may pass through when there is no direct link. */
export const transportHubs = ["cairo", "luxor"];
