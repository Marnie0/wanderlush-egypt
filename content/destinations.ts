import type { Destination } from "./types";

/**
 * Eight destinations spanning the Nile valley, both coasts and the Western
 * Desert. Copy is written as a travel editor would write it: specific,
 * outcome-focused, never generic.
 */
export const destinations: Destination[] = [
  {
    id: "dst-cairo",
    slug: "cairo",
    name: { en: "Cairo", ar: "القاهرة" },
    tagline: {
      en: "Five thousand years, stacked one street at a time",
      ar: "خمسة آلاف عام تتراكم شارعًا بعد شارع",
    },
    region: "greater-cairo",
    coordinates: { lat: 30.0444, lng: 31.2357 },
    travelStyles: ["history", "family", "luxury"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar", "apr"],
    bestSeasonNote: {
      en: "October to April keeps the afternoons walkable. Summer visits are best planned around early mornings and late evenings.",
      ar: "من أكتوبر إلى أبريل يظل الطقس مناسبًا للتجوّل بعد الظهر. أما في الصيف فيُفضَّل ترتيب الزيارات في الصباح الباكر أو المساء.",
    },
    recommendedDays: { min: 3, max: 5 },
    nightlyRates: { essential: 55, comfort: 110, premium: 210, luxury: 420 },
    dailyBudgetFrom: 95,
    intro: {
      en: "Cairo does not ease you in. The Giza plateau sits at the end of a city street, a medieval bazaar trades beside a Fatimid mosque, and the Grand Egyptian Museum holds Tutankhamun's complete collection under one roof for the first time. Give it three days and it rearranges what you thought ancient meant.",
      ar: "القاهرة لا تستقبلك على مهل. هضبة الجيزة تقف عند نهاية شارع من شوارع المدينة، وسوق من العصور الوسطى يعمل إلى جوار مسجد فاطمي، والمتحف المصري الكبير يضم مقتنيات توت عنخ آمون كاملة تحت سقف واحد لأول مرة. امنحها ثلاثة أيام تُعِد ترتيب ما ظننت أنك تعرفه عن القِدَم.",
    },
    heroImage: {
      src: "/images/destinations/cairo-hero.jpg",
      alt: { en: "The Pyramids of Giza at first light", ar: "أهرامات الجيزة عند أول الضوء" },
    },
    gallery: [
      { src: "/images/destinations/cairo-01.jpg", alt: { en: "Lanterns in Khan el-Khalili", ar: "فوانيس في خان الخليلي" } },
      { src: "/images/destinations/cairo-02.jpg", alt: { en: "The Grand Egyptian Museum atrium", ar: "بهو المتحف المصري الكبير" } },
      { src: "/images/destinations/cairo-03.jpg", alt: { en: "Feluccas on the Nile at sunset", ar: "فلوكة على النيل عند الغروب" } },
      { src: "/images/destinations/cairo-04.jpg", alt: { en: "Rooftops of Islamic Cairo", ar: "أسطح القاهرة الإسلامية" } },
    ],
    attractions: [
      {
        name: { en: "The Giza Pyramids and Sphinx", ar: "أهرامات الجيزة وأبو الهول" },
        blurb: {
          en: "Arrive at opening or stay for the last hour. Both avoid the coach crowds and give you the low, gold light the plateau deserves.",
          ar: "احضر عند الفتح أو ابقَ في الساعة الأخيرة. كلاهما يجنّبك ازدحام الحافلات ويمنحك الضوء الذهبي المنخفض الذي تستحقه الهضبة.",
        },
      },
      {
        name: { en: "Grand Egyptian Museum", ar: "المتحف المصري الكبير" },
        blurb: {
          en: "Allow a full half day. The Tutankhamun galleries alone hold more than five thousand objects.",
          ar: "خصّص نصف يوم كاملًا. قاعات توت عنخ آمون وحدها تضم أكثر من خمسة آلاف قطعة.",
        },
      },
      {
        name: { en: "Khan el-Khalili", ar: "خان الخليلي" },
        blurb: {
          en: "A working market since the fourteenth century. Coffee at El Fishawy is part of the visit, not a detour.",
          ar: "سوق عامل منذ القرن الرابع عشر. القهوة في الفيشاوي جزء من الزيارة وليست انحرافًا عنها.",
        },
      },
      {
        name: { en: "Coptic Cairo", ar: "القاهرة القبطية" },
        blurb: {
          en: "The Hanging Church, Ben Ezra Synagogue and Abu Serga sit within a few quiet minutes of each other.",
          ar: "الكنيسة المعلقة ومعبد بن عزرا وكنيسة أبي سرجة على بعد دقائق هادئة من بعضها.",
        },
      },
      {
        name: { en: "Al-Muizz Street by night", ar: "شارع المعز ليلًا" },
        blurb: {
          en: "An open-air museum of Fatimid, Ayyubid and Mamluk architecture, lit and pedestrianised after dark.",
          ar: "متحف مفتوح للعمارة الفاطمية والأيوبية والمملوكية، مضاء ومخصص للمشاة بعد الغروب.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Giza plateau and the Grand Egyptian Museum", ar: "هضبة الجيزة والمتحف المصري الكبير" },
        detail: {
          en: "Pyramids at opening, the Sphinx from the causeway, then the museum across the road in the afternoon.",
          ar: "الأهرامات عند الفتح، وأبو الهول من الطريق الصاعد، ثم المتحف المقابل بعد الظهر.",
        },
      },
      {
        day: 2,
        title: { en: "Islamic and Coptic Cairo", ar: "القاهرة الإسلامية والقبطية" },
        detail: {
          en: "The Citadel and Sultan Hassan in the morning, Coptic Cairo after lunch, Al-Muizz Street once the lamps come on.",
          ar: "القلعة ومسجد السلطان حسن صباحًا، والقاهرة القبطية بعد الغداء، وشارع المعز حين تُضاء المصابيح.",
        },
      },
      {
        day: 3,
        title: { en: "Saqqara, Dahshur and the Nile", ar: "سقارة ودهشور والنيل" },
        detail: {
          en: "The Step Pyramid and the Bent Pyramid without the crowds, then a felucca hour before dinner.",
          ar: "الهرم المدرج والهرم المائل بلا زحام، ثم ساعة في فلوكة قبل العشاء.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Traffic decides your day. Book the Giza plateau first thing and keep the afternoon on the same side of the river.",
        "Carry small notes for tips, entry extras and the photography fee inside tombs.",
        "Dress covers shoulders and knees for mosques; women should carry a light scarf for head covering.",
        "Ride-hailing apps work well and remove the fare negotiation entirely.",
      ],
      ar: [
        "الزحام هو ما يحدد يومك. احجز هضبة الجيزة في أول النهار وابقَ بعد الظهر على الضفة نفسها.",
        "احمل فئات نقدية صغيرة للإكراميات ورسوم الدخول الإضافية وتصوير المقابر من الداخل.",
        "يغطي اللباس الكتفين والركبتين في المساجد، ويُستحسن أن تحمل السيدات وشاحًا خفيفًا لتغطية الرأس.",
        "تطبيقات النقل الذكي تعمل بكفاءة وتعفيك من مساومة الأجرة تمامًا.",
      ],
    },
    gettingThere: {
      en: "Cairo International is Egypt's main gateway, forty to ninety minutes from the city depending on traffic. Trains run north to Alexandria and south along the Nile valley.",
      ar: "مطار القاهرة الدولي هو البوابة الرئيسية لمصر، ويبعد عن المدينة من أربعين إلى تسعين دقيقة بحسب الزحام. وتسير القطارات شمالًا إلى الإسكندرية وجنوبًا بمحاذاة وادي النيل.",
    },
    accommodationNote: {
      en: "Zamalek and Garden City suit travellers who want quiet streets and river views. Giza puts the pyramids outside the window but adds a commute to the old city.",
      ar: "تناسب الزمالك وجاردن سيتي من يريد شوارع هادئة وإطلالات على النهر. أما الجيزة فتضع الأهرامات خارج النافذة لكنها تضيف مسافة إلى القاهرة القديمة.",
    },
    relatedSlugs: ["alexandria", "luxor", "white-desert"],
    accent: "#c85f26",
  },
  {
    id: "dst-alexandria",
    slug: "alexandria",
    name: { en: "Alexandria", ar: "الإسكندرية" },
    tagline: {
      en: "A Mediterranean city that remembers being Greek",
      ar: "مدينة متوسطية ما زالت تتذكر يونانيتها",
    },
    region: "mediterranean",
    coordinates: { lat: 31.2001, lng: 29.9187 },
    travelStyles: ["history", "beach", "romantic"],
    bestSeason: ["apr", "may", "jun", "sep", "oct", "nov"],
    bestSeasonNote: {
      en: "Late spring and early autumn give warm sea air without August's crowds. Winter brings dramatic storms along the Corniche.",
      ar: "أواخر الربيع وأوائل الخريف يمنحان هواءً بحريًا دافئًا بلا زحام أغسطس. أما الشتاء فيجلب عواصف مشهدية على الكورنيش.",
    },
    recommendedDays: { min: 2, max: 3 },
    nightlyRates: { essential: 45, comfort: 90, premium: 170, luxury: 320 },
    dailyBudgetFrom: 75,
    intro: {
      en: "Founded by Alexander, run by the Ptolemies, and still facing north to Europe rather than south to the desert. Alexandria trades pyramids for a seafront corniche, Greco-Roman catacombs, a reborn library and the best seafood in Egypt.",
      ar: "أسسها الإسكندر، وحكمها البطالمة، وما زالت تتجه شمالًا نحو أوروبا لا جنوبًا نحو الصحراء. تستبدل الإسكندرية بالأهرامات كورنيشًا بحريًا وسراديب يونانية رومانية ومكتبة وُلدت من جديد وأفضل مأكولات بحرية في مصر.",
    },
    heroImage: {
      src: "/images/destinations/alexandria-hero.jpg",
      alt: { en: "The Corniche curving toward Qaitbay Citadel", ar: "الكورنيش ينحني نحو قلعة قايتباي" },
    },
    gallery: [
      { src: "/images/destinations/alexandria-01.jpg", alt: { en: "Qaitbay Citadel on the harbour wall", ar: "قلعة قايتباي على سور الميناء" } },
      { src: "/images/destinations/alexandria-02.jpg", alt: { en: "Reading hall of the Bibliotheca Alexandrina", ar: "قاعة المطالعة في مكتبة الإسكندرية" } },
      { src: "/images/destinations/alexandria-03.jpg", alt: { en: "Fishing boats in the Eastern Harbour", ar: "قوارب صيد في الميناء الشرقي" } },
    ],
    attractions: [
      {
        name: { en: "Bibliotheca Alexandrina", ar: "مكتبة الإسكندرية" },
        blurb: {
          en: "A disc of granite tilted toward the sea, standing where the ancient library once did.",
          ar: "قرص من الجرانيت مائل نحو البحر، يقوم حيث كانت المكتبة القديمة.",
        },
      },
      {
        name: { en: "Qaitbay Citadel", ar: "قلعة قايتباي" },
        blurb: {
          en: "Built from the rubble of the Pharos lighthouse on the exact spot where it stood.",
          ar: "بُنيت من أنقاض فنار الإسكندرية في الموضع نفسه الذي كان يقوم عليه.",
        },
      },
      {
        name: { en: "Catacombs of Kom el-Shoqafa", ar: "سراديب كوم الشقافة" },
        blurb: {
          en: "Three levels cut into rock where Egyptian, Greek and Roman funerary art share a single wall.",
          ar: "ثلاثة مستويات منحوتة في الصخر يتشارك فيها الفن الجنائزي المصري واليوناني والروماني جدارًا واحدًا.",
        },
      },
      {
        name: { en: "Montazah Gardens", ar: "حدائق المنتزه" },
        blurb: {
          en: "Royal parkland running down to private coves, best at the end of the afternoon.",
          ar: "حدائق ملكية تنحدر إلى خلجان خاصة، وأجملها في آخر النهار.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Greco-Roman Alexandria", ar: "الإسكندرية اليونانية الرومانية" },
        detail: {
          en: "Catacombs, Pompey's Pillar and the Roman amphitheatre, then seafood at the harbour.",
          ar: "السراديب وعمود السواري والمسرح الروماني، ثم مأكولات بحرية عند الميناء.",
        },
      },
      {
        day: 2,
        title: { en: "Library, citadel and corniche", ar: "المكتبة والقلعة والكورنيش" },
        detail: {
          en: "The Bibliotheca in the morning, Qaitbay at midday, and the corniche walk as the light drops.",
          ar: "المكتبة صباحًا، وقايتباي ظهرًا، ثم المشي على الكورنيش مع انخفاض الضوء.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Take the train from Cairo rather than the road. Two and a half hours, and the delta scenery is part of the trip.",
        "Seafood is chosen by weight at the counter before it is cooked. Point at what you want.",
        "The corniche wind is genuine in winter. Bring a layer even when Cairo is warm.",
      ],
      ar: [
        "خذ القطار من القاهرة بدل الطريق البري. ساعتان ونصف، ومشاهد الدلتا جزء من الرحلة.",
        "تُختار الأسماك بالوزن عند المنضدة قبل طهيها. أشِر إلى ما تريد.",
        "رياح الكورنيش حقيقية في الشتاء. احمل طبقة إضافية حتى لو كانت القاهرة دافئة.",
      ],
    },
    gettingThere: {
      en: "Two and a half hours by express train from Cairo, three by road. Borg El Arab airport serves a growing list of European cities.",
      ar: "ساعتان ونصف بالقطار السريع من القاهرة، وثلاث ساعات بالسيارة. ويخدم مطار برج العرب قائمة متنامية من المدن الأوروبية.",
    },
    accommodationNote: {
      en: "Sea-facing rooms along the Corniche are worth the supplement. Montazah is quieter and greener but twenty minutes from the centre.",
      ar: "تستحق الغرف المطلة على البحر في الكورنيش فرقها في السعر. والمنتزه أهدأ وأكثر خضرة لكنه على بعد عشرين دقيقة من الوسط.",
    },
    relatedSlugs: ["cairo", "sharm-el-sheikh", "siwa-oasis"],
    accent: "#2a719a",
  },
  {
    id: "dst-luxor",
    slug: "luxor",
    name: { en: "Luxor", ar: "الأقصر" },
    tagline: {
      en: "The world's greatest open-air museum, split by a river",
      ar: "أعظم متحف مفتوح في العالم، يشطره نهر",
    },
    region: "nile-valley",
    coordinates: { lat: 25.6872, lng: 32.6396 },
    travelStyles: ["history", "luxury", "romantic"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar"],
    bestSeasonNote: {
      en: "November to February is the window. Summer regularly clears 40°C and limits sightseeing to before ten in the morning.",
      ar: "من نوفمبر إلى فبراير هي الفترة المثلى. أما الصيف فيتجاوز الأربعين درجة بانتظام ويحصر الزيارات فيما قبل العاشرة صباحًا.",
    },
    recommendedDays: { min: 3, max: 4 },
    nightlyRates: { essential: 50, comfort: 105, premium: 220, luxury: 480 },
    dailyBudgetFrom: 90,
    intro: {
      en: "Ancient Thebes put its living on the east bank and its dead on the west, and both halves survived. Karnak alone covers two square kilometres. Across the water, the Valley of the Kings hides painted tombs behind a limestone ridge that looks like nothing at all from the road.",
      ar: "وضعت طيبة القديمة أحياءها على الضفة الشرقية وموتاها على الغربية، وبقي النصفان. الكرنك وحده يمتد على كيلومترين مربعين. وعلى الضفة المقابلة يخفي وادي الملوك مقابر مزخرفة خلف حافة جيرية لا تلفت النظر من الطريق.",
    },
    heroImage: {
      src: "/images/destinations/luxor-hero.jpg",
      alt: { en: "Balloons rising over the Theban hills at dawn", ar: "مناطيد ترتفع فوق جبال طيبة عند الفجر" },
    },
    gallery: [
      { src: "/images/destinations/luxor-01.jpg", alt: { en: "The hypostyle hall at Karnak", ar: "بهو الأعمدة في الكرنك" } },
      { src: "/images/destinations/luxor-02.jpg", alt: { en: "Hatshepsut's terraces at Deir el-Bahari", ar: "مدرجات حتشبسوت في الدير البحري" } },
      { src: "/images/destinations/luxor-03.jpg", alt: { en: "Painted ceiling inside a royal tomb", ar: "سقف مزخرف داخل مقبرة ملكية" } },
      { src: "/images/destinations/luxor-04.jpg", alt: { en: "Luxor Temple lit after dark", ar: "معبد الأقصر مضاءً بعد الغروب" } },
    ],
    attractions: [
      {
        name: { en: "Karnak Temple", ar: "معبد الكرنك" },
        blurb: {
          en: "Two thousand years of additions by successive pharaohs. The hypostyle hall holds 134 columns.",
          ar: "ألفا عام من الإضافات على يد فراعنة متعاقبين. ويضم بهو الأعمدة مئة وأربعة وثلاثين عمودًا.",
        },
      },
      {
        name: { en: "Valley of the Kings", ar: "وادي الملوك" },
        blurb: {
          en: "Sixty-three tombs cut into the rock. Three are included with entry; Seti I and Tutankhamun are ticketed separately.",
          ar: "ثلاث وستون مقبرة منحوتة في الصخر. ثلاث منها ضمن التذكرة، أما سيتي الأول وتوت عنخ آمون فلهما تذاكر منفصلة.",
        },
      },
      {
        name: { en: "Temple of Hatshepsut", ar: "معبد حتشبسوت" },
        blurb: {
          en: "Three colonnaded terraces built straight into the cliff at Deir el-Bahari.",
          ar: "ثلاث مدرجات ذات أعمدة شُيدت في قلب الجرف بالدير البحري.",
        },
      },
      {
        name: { en: "Luxor Temple", ar: "معبد الأقصر" },
        blurb: {
          en: "In the middle of the modern town and best after dark, when the columns are lit from below.",
          ar: "يقع في قلب المدينة الحديثة، وأجمل ما يكون بعد الغروب حين تُضاء الأعمدة من أسفل.",
        },
      },
      {
        name: { en: "Medinet Habu", ar: "مدينة هابو" },
        blurb: {
          en: "Ramesses III's mortuary temple keeps more original colour than anywhere else on the west bank.",
          ar: "يحتفظ معبد رمسيس الثالث الجنائزي بألوان أصلية أكثر من أي موضع آخر في الضفة الغربية.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "East bank temples", ar: "معابد الضفة الشرقية" },
        detail: {
          en: "Karnak early, the Luxor Museum through the hottest hours, Luxor Temple after dark.",
          ar: "الكرنك مبكرًا، ومتحف الأقصر خلال ساعات الحر، ومعبد الأقصر بعد الغروب.",
        },
      },
      {
        day: 2,
        title: { en: "West bank and the royal tombs", ar: "الضفة الغربية والمقابر الملكية" },
        detail: {
          en: "Balloon at dawn if booked, then the Valley of the Kings, Hatshepsut and Medinet Habu before noon.",
          ar: "منطاد عند الفجر إن كان محجوزًا، ثم وادي الملوك وحتشبسوت ومدينة هابو قبل الظهر.",
        },
      },
      {
        day: 3,
        title: { en: "Dendera or a slow river day", ar: "دندرة أو يوم نهري هادئ" },
        detail: {
          en: "The ceiling at Dendera is a ninety-minute drive north, or stay for a felucca afternoon and the souk.",
          ar: "سقف دندرة على بعد تسعين دقيقة شمالًا، أو ابقَ لأصيل في فلوكة وجولة في السوق.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Tomb photography needs a separate ticket bought at the valley entrance, not at each tomb.",
        "Book balloon flights for your first morning so a weather cancellation still has a spare day.",
        "The west bank has almost no shade. Water and a hat are not optional between March and October.",
      ],
      ar: [
        "يتطلب التصوير داخل المقابر تذكرة منفصلة تُشترى عند مدخل الوادي لا عند كل مقبرة.",
        "احجز رحلة المنطاد في صباحك الأول ليبقى لديك يوم احتياطي إن أُلغيت بسبب الطقس.",
        "لا تكاد توجد ظلال في الضفة الغربية. الماء والقبعة ضرورة لا خيار بين مارس وأكتوبر.",
      ],
    },
    gettingThere: {
      en: "An hour's flight from Cairo, or ten hours on the overnight sleeper train. Most Nile cruises begin or end here.",
      ar: "ساعة طيران من القاهرة، أو عشر ساعات في قطار النوم الليلي. ومعظم رحلات النيل النهرية تبدأ أو تنتهي هنا.",
    },
    accommodationNote: {
      en: "East bank keeps you near restaurants and the night-lit temple. West bank guesthouses trade convenience for silence and field views.",
      ar: "تبقيك الضفة الشرقية قريبًا من المطاعم والمعبد المضاء ليلًا. أما بيوت الضيافة في الضفة الغربية فتستبدل بالراحة صمتًا وإطلالات على الحقول.",
    },
    relatedSlugs: ["aswan", "cairo", "hurghada"],
    accent: "#a8853b",
  },
  {
    id: "dst-aswan",
    slug: "aswan",
    name: { en: "Aswan", ar: "أسوان" },
    tagline: {
      en: "Where the Nile slows down and Nubia begins",
      ar: "حيث يتمهّل النيل وتبدأ النوبة",
    },
    region: "nile-valley",
    coordinates: { lat: 24.0889, lng: 32.8998 },
    travelStyles: ["romantic", "nature", "history", "luxury"],
    bestSeason: ["nov", "dec", "jan", "feb", "mar"],
    bestSeasonNote: {
      en: "Winter is warm and dry with cool evenings, which is exactly why Aswan became a wintering town in the first place.",
      ar: "الشتاء دافئ وجاف بأمسيات لطيفة، وهو بالضبط سبب صيرورة أسوان مشتى منذ البداية.",
    },
    recommendedDays: { min: 2, max: 4 },
    nightlyRates: { essential: 45, comfort: 100, premium: 210, luxury: 460 },
    dailyBudgetFrom: 85,
    intro: {
      en: "The river widens here, breaks around granite islands and turns a deep, unhurried blue. Aswan is the softest city in Egypt: Nubian villages painted in blocks of colour, a temple moved stone by stone to escape a rising lake, and afternoons that ask nothing of you but a sail.",
      ar: "يتسع النهر هنا، ويتفرع حول جزر من الجرانيت، ويتحول إلى زرقة عميقة غير عجولة. أسوان ألطف مدن مصر: قرى نوبية مصبوغة بكتل من اللون، ومعبد نُقل حجرًا حجرًا هربًا من بحيرة صاعدة، وأصائل لا تطلب منك سوى شراع.",
    },
    heroImage: {
      src: "/images/destinations/aswan-hero.jpg",
      alt: { en: "Feluccas among the granite islands at Aswan", ar: "فلائك بين جزر الجرانيت في أسوان" },
    },
    gallery: [
      { src: "/images/destinations/aswan-01.jpg", alt: { en: "Painted Nubian houses above the river", ar: "بيوت نوبية ملونة فوق النهر" } },
      { src: "/images/destinations/aswan-02.jpg", alt: { en: "The Temple of Philae on its island", ar: "معبد فيلة على جزيرته" } },
      { src: "/images/destinations/aswan-03.jpg", alt: { en: "Abu Simbel's colossi at sunrise", ar: "تماثيل أبو سمبل عند الشروق" } },
    ],
    attractions: [
      {
        name: { en: "Philae Temple", ar: "معبد فيلة" },
        blurb: {
          en: "Dismantled and rebuilt on higher ground after the High Dam. Reached only by boat, which is half the pleasure.",
          ar: "فُكك وأعيد بناؤه على أرض أعلى بعد السد العالي. ولا يُوصل إليه إلا بالقارب، وهو نصف المتعة.",
        },
      },
      {
        name: { en: "Abu Simbel", ar: "أبو سمبل" },
        blurb: {
          en: "Three hours south, four colossal Ramesses figures cut into a cliff and relocated in the 1960s.",
          ar: "على بعد ثلاث ساعات جنوبًا، أربعة تماثيل ضخمة لرمسيس منحوتة في جرف ونُقلت في الستينيات.",
        },
      },
      {
        name: { en: "A Nubian village on Elephantine", ar: "قرية نوبية في جزيرة إلفنتين" },
        blurb: {
          en: "Indigo and ochre houses, hibiscus tea, and a pace that makes the mainland feel loud.",
          ar: "بيوت بالنيلي والمغرة، وشاي كركديه، وإيقاع يجعل البر الرئيسي يبدو صاخبًا.",
        },
      },
      {
        name: { en: "The Unfinished Obelisk", ar: "المسلة الناقصة" },
        blurb: {
          en: "Still attached to the bedrock it cracked in. The clearest lesson in how granite was actually quarried.",
          ar: "ما زالت متصلة بالصخر الذي تشققت فيه. وهي أوضح درس في كيفية استخراج الجرانيت فعليًا.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Philae, the quarry and a felucca", ar: "فيلة والمحجر والفلوكة" },
        detail: {
          en: "Temple by boat in the morning, the obelisk quarry after, then sail around Elephantine at sunset.",
          ar: "المعبد بالقارب صباحًا، ثم محجر المسلة، ثم إبحار حول إلفنتين عند الغروب.",
        },
      },
      {
        day: 2,
        title: { en: "Abu Simbel and the Nubian west bank", ar: "أبو سمبل والضفة النوبية الغربية" },
        detail: {
          en: "Early convoy or short flight south, back by afternoon for the Nubian Museum and a village dinner.",
          ar: "قافلة مبكرة أو رحلة قصيرة جنوبًا، والعودة بعد الظهر لمتحف النوبة وعشاء في القرية.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Abu Simbel by road means leaving around four in the morning. The flight costs more and returns half a day.",
        "Agree the felucca price and the length of the sail before stepping aboard.",
        "Aswan is the best place in Egypt to buy hibiscus, dates and Nubian spice blends.",
      ],
      ar: [
        "الذهاب إلى أبو سمبل برًا يعني المغادرة نحو الرابعة فجرًا. أما الطيران فأغلى لكنه يعيد لك نصف يوم.",
        "اتفق على سعر الفلوكة ومدة الإبحار قبل الصعود.",
        "أسوان أفضل مكان في مصر لشراء الكركديه والتمر وخلطات التوابل النوبية.",
      ],
    },
    gettingThere: {
      en: "Ninety minutes by air from Cairo, three hours by train from Luxor, or arrive slowly by river on a Nile cruise.",
      ar: "تسعون دقيقة جوًا من القاهرة، وثلاث ساعات بالقطار من الأقصر، أو الوصول على مهل عبر النهر في رحلة نيلية.",
    },
    accommodationNote: {
      en: "River-facing rooms matter more here than anywhere else in Egypt. Island guesthouses are simpler and unmatched at dusk.",
      ar: "الغرف المطلة على النهر هنا أهم منها في أي مكان آخر في مصر. وبيوت الضيافة في الجزر أبسط لكنها لا تُضاهى عند الغسق.",
    },
    relatedSlugs: ["luxor", "cairo", "white-desert"],
    accent: "#2c6e67",
  },
  {
    id: "dst-siwa-oasis",
    slug: "siwa-oasis",
    name: { en: "Siwa Oasis", ar: "واحة سيوة" },
    tagline: {
      en: "Salt lakes, olive groves and a language of its own",
      ar: "بحيرات ملحية وبساتين زيتون ولغة خاصة بها",
    },
    region: "western-desert",
    coordinates: { lat: 29.2041, lng: 25.5195 },
    travelStyles: ["desert", "nature", "romantic"],
    bestSeason: ["oct", "nov", "dec", "feb", "mar", "apr"],
    bestSeasonNote: {
      en: "Autumn and spring are ideal. Nights in December and January drop close to freezing in the dunes.",
      ar: "الخريف والربيع مثاليان. أما ليالي ديسمبر ويناير فتقترب من الصفر في الكثبان.",
    },
    recommendedDays: { min: 3, max: 4 },
    nightlyRates: { essential: 40, comfort: 85, premium: 165, luxury: 340 },
    dailyBudgetFrom: 70,
    intro: {
      en: "Eight hours from the coast and a world from everywhere else. Siwa speaks Siwi rather than Arabic, builds in salt and mud, floats you in lakes you cannot sink in, and keeps the oracle that told Alexander he was a god.",
      ar: "ثماني ساعات من الساحل، وعالم كامل بعيدًا عن كل مكان. تتحدث سيوة السيوية لا العربية، وتبني بالملح والطين، وتطفو بك في بحيرات لا تغرق فيها، وتحتفظ بمعبد الوحي الذي أخبر الإسكندر أنه إله.",
    },
    heroImage: {
      src: "/images/destinations/siwa-hero.jpg",
      alt: { en: "The Shali fortress at golden hour", ar: "قلعة شالي في الساعة الذهبية" },
    },
    gallery: [
      { src: "/images/destinations/siwa-01.jpg", alt: { en: "A salt lake with white crystalline banks", ar: "بحيرة ملحية بضفاف بلورية بيضاء" } },
      { src: "/images/destinations/siwa-02.jpg", alt: { en: "Palm groves and mudbrick walls", ar: "بساتين نخيل وجدران من الطوب اللبن" } },
      { src: "/images/destinations/siwa-03.jpg", alt: { en: "Dunes of the Great Sand Sea", ar: "كثبان بحر الرمال الأعظم" } },
    ],
    attractions: [
      {
        name: { en: "Shali Fortress", ar: "قلعة شالي" },
        blurb: {
          en: "A thirteenth-century town of salt and mud, half melted by rare rain and beautiful for it.",
          ar: "بلدة من القرن الثالث عشر بُنيت من الملح والطين، ذابت نصفًا بفعل أمطار نادرة فازدادت جمالًا.",
        },
      },
      {
        name: { en: "Temple of the Oracle", ar: "معبد الوحي" },
        blurb: {
          en: "Alexander crossed the desert to consult it in 331 BC. The view over the oasis explains the detour.",
          ar: "عبر الإسكندر الصحراء لاستشارته عام 331 قبل الميلاد. والإطلالة على الواحة تفسر ذلك المسار.",
        },
      },
      {
        name: { en: "Cleopatra's Spring", ar: "عين كليوباترا" },
        blurb: {
          en: "A stone-rimmed natural pool that bubbles cold all day. Modest swimwear is expected.",
          ar: "بركة طبيعية محاطة بالحجر تتفجر باردة طوال اليوم. ويُتوقع ارتداء ملابس سباحة محتشمة.",
        },
      },
      {
        name: { en: "The Great Sand Sea", ar: "بحر الرمال الأعظم" },
        blurb: {
          en: "Dunes running to the Libyan border, with hot springs and fossil beds hidden between them.",
          ar: "كثبان تمتد إلى الحدود الليبية، وبينها عيون ساخنة وطبقات من الأحافير.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "The oasis on foot and by bicycle", ar: "الواحة سيرًا وبالدراجة" },
        detail: {
          en: "Shali, the oracle, the old town market, then Fatnas island for the sunset.",
          ar: "شالي ومعبد الوحي وسوق البلدة القديمة، ثم جزيرة فطناس عند الغروب.",
        },
      },
      {
        day: 2,
        title: { en: "Great Sand Sea safari", ar: "سفاري بحر الرمال الأعظم" },
        detail: {
          en: "Dune driving, sandboarding, a hot spring at dusk and dinner under the stars.",
          ar: "قيادة على الكثبان وتزلج على الرمال وعين ساخنة عند الغسق وعشاء تحت النجوم.",
        },
      },
      {
        day: 3,
        title: { en: "Salt lakes and slow hours", ar: "البحيرات الملحية وساعات بطيئة" },
        detail: {
          en: "Float in a salt pool, eat in an olive grove, and let the day stay empty.",
          ar: "اطفُ في بركة ملحية، وتناول الطعام في بستان زيتون، ودع اليوم فارغًا.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Siwa is conservative. Cover shoulders and knees away from hotel pools, and ask before photographing people.",
        "Card payments are rare. Bring the cash you expect to need from Cairo or Alexandria.",
        "Desert safaris need a licensed local guide. Independent driving into the sand sea is not permitted.",
      ],
      ar: [
        "سيوة محافظة. غطِّ الكتفين والركبتين خارج مسابح الفنادق، واستأذن قبل تصوير الناس.",
        "الدفع بالبطاقة نادر. احمل ما تتوقع أن تحتاجه من النقد من القاهرة أو الإسكندرية.",
        "تتطلب رحلات السفاري مرشدًا محليًا مرخصًا. والقيادة المنفردة داخل بحر الرمال غير مسموحة.",
      ],
    },
    gettingThere: {
      en: "Eight to nine hours by road from Cairo, four from Marsa Matrouh on the coast. There is no airport, and that is part of the appeal.",
      ar: "من ثماني إلى تسع ساعات برًا من القاهرة، وأربع من مرسى مطروح على الساحل. لا يوجد مطار، وهذا جزء من جاذبيتها.",
    },
    accommodationNote: {
      en: "Eco-lodges built from salt rock and palm run without mains electricity and are the reason most people come. Bring a torch.",
      ar: "النُّزل البيئية المبنية من صخر الملح والنخيل تعمل بلا كهرباء عمومية، وهي سبب مجيء معظم الزوار. احمل مصباحًا.",
    },
    relatedSlugs: ["white-desert", "alexandria", "cairo"],
    accent: "#9a7a54",
  },
  {
    id: "dst-hurghada",
    slug: "hurghada",
    name: { en: "Hurghada", ar: "الغردقة" },
    tagline: {
      en: "Reef diving and desert on the same afternoon",
      ar: "غوص بين الشعاب وصحراء في الأصيل نفسه",
    },
    region: "red-sea",
    coordinates: { lat: 27.2579, lng: 33.8116 },
    travelStyles: ["beach", "family", "nature"],
    bestSeason: ["mar", "apr", "may", "jun", "sep", "oct", "nov"],
    bestSeasonNote: {
      en: "Swimmable all year. Spring and autumn give warm water without the July heat on land.",
      ar: "صالحة للسباحة طوال العام. ويمنح الربيع والخريف ماءً دافئًا دون حرارة يوليو على اليابسة.",
    },
    recommendedDays: { min: 3, max: 6 },
    nightlyRates: { essential: 40, comfort: 95, premium: 190, luxury: 400 },
    dailyBudgetFrom: 70,
    intro: {
      en: "A working fishing town that turned into Egypt's most practical Red Sea base. Reefs start twenty minutes offshore, the mountains behind town open into desert within half an hour, and it is the easiest coast to reach from Luxor.",
      ar: "بلدة صيد عاملة تحولت إلى أكثر قواعد البحر الأحمر عملية في مصر. تبدأ الشعاب على بعد عشرين دقيقة من الشاطئ، وتنفتح الجبال خلف المدينة على الصحراء خلال نصف ساعة، وهي أسهل ساحل يُوصل إليه من الأقصر.",
    },
    heroImage: {
      src: "/images/destinations/hurghada-hero.jpg",
      alt: { en: "Turquoise shallows over a Red Sea reef", ar: "مياه ضحلة فيروزية فوق شعاب البحر الأحمر" },
    },
    gallery: [
      { src: "/images/destinations/hurghada-01.jpg", alt: { en: "A dive boat moored above coral", ar: "قارب غوص راسٍ فوق الشعاب" } },
      { src: "/images/destinations/hurghada-02.jpg", alt: { en: "Giftun Island sandbank", ar: "لسان رملي في جزيرة الجفتون" } },
      { src: "/images/destinations/hurghada-03.jpg", alt: { en: "Eastern Desert mountains at sunset", ar: "جبال الصحراء الشرقية عند الغروب" } },
    ],
    attractions: [
      {
        name: { en: "Giftun Island", ar: "جزيرة الجفتون" },
        blurb: {
          en: "Protected sandbanks and shallow reef, the standard and still the best day out on the water.",
          ar: "ألسنة رملية محمية وشعاب ضحلة، وهي الرحلة البحرية المعتادة وما زالت الأفضل.",
        },
      },
      {
        name: { en: "Abu Nuhas wrecks", ar: "حطام أبو نحاس" },
        blurb: {
          en: "Four cargo ships on one reef, shallow enough that several are open to advanced open-water divers.",
          ar: "أربع سفن شحن على شعبة واحدة، وعمقها يسمح لعدد منها باستقبال الغواصين المتقدمين.",
        },
      },
      {
        name: { en: "El Dahar old town", ar: "حي الدهار القديم" },
        blurb: {
          en: "The original town: a real souk, fish grills and coffee houses away from the resort strip.",
          ar: "البلدة الأصلية: سوق حقيقي ومشاوي أسماك ومقاهٍ بعيدًا عن شريط المنتجعات.",
        },
      },
      {
        name: { en: "Eastern Desert by quad or jeep", ar: "الصحراء الشرقية بالدراجات الرباعية أو الجيب" },
        blurb: {
          en: "Bedouin settlements and canyon tracks starting thirty minutes inland.",
          ar: "مضارب بدوية ومسارات في الأودية تبدأ على بعد ثلاثين دقيقة نحو الداخل.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Reef day", ar: "يوم الشعاب" },
        detail: {
          en: "Boat out to Giftun, two snorkel or dive stops, back for grilled fish in El Dahar.",
          ar: "قارب إلى الجفتون، ومحطتان للغطس أو الغوص، والعودة لسمك مشوي في الدهار.",
        },
      },
      {
        day: 2,
        title: { en: "Desert afternoon", ar: "أصيل في الصحراء" },
        detail: {
          en: "Late start, canyon drive inland, Bedouin tea and stargazing after dinner.",
          ar: "بداية متأخرة، وقيادة في الأودية نحو الداخل، وشاي بدوي ورصد للنجوم بعد العشاء.",
        },
      },
      {
        day: 3,
        title: { en: "Open water or open schedule", ar: "مياه مفتوحة أو جدول مفتوح" },
        detail: {
          en: "A wreck dive at Abu Nuhas, or nothing at all beyond the house reef.",
          ar: "غوصة حطام في أبو نحاس، أو لا شيء إطلاقًا خارج شعاب الفندق.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Reef-safe sunscreen only. Egyptian marine parks enforce it and the coral is the whole attraction.",
        "Leave twenty-four hours between your last dive and any flight.",
        "Hotel beaches vary enormously. Check whether the house reef is entered by ladder or by sand.",
      ],
      ar: [
        "استخدم واقي شمس آمنًا للشعاب فقط. المحميات البحرية المصرية تطبق ذلك، والشعاب هي المقصد كله.",
        "اترك أربعًا وعشرين ساعة بين آخر غوصة وأي رحلة طيران.",
        "تتفاوت شواطئ الفنادق كثيرًا. تحقق مما إذا كان النزول إلى الشعاب بسُلّم أم من الرمل.",
      ],
    },
    gettingThere: {
      en: "Direct flights from Cairo and much of Europe, or four hours by road from Luxor across the Eastern Desert.",
      ar: "رحلات مباشرة من القاهرة ومن معظم أوروبا، أو أربع ساعات برًا من الأقصر عبر الصحراء الشرقية.",
    },
    accommodationNote: {
      en: "Sahl Hasheesh and Makadi Bay are quieter and newer. Staying in town costs less and puts you nearer real restaurants.",
      ar: "سهل حشيش ومكادي باي أهدأ وأحدث. أما الإقامة داخل المدينة فأقل تكلفة وأقرب إلى مطاعم حقيقية.",
    },
    relatedSlugs: ["sharm-el-sheikh", "luxor", "cairo"],
    accent: "#2a719a",
  },
  {
    id: "dst-sharm-el-sheikh",
    slug: "sharm-el-sheikh",
    name: { en: "Sharm El Sheikh", ar: "شرم الشيخ" },
    tagline: {
      en: "The reef wall the whole Red Sea is judged against",
      ar: "جدار الشعاب الذي يُقاس عليه البحر الأحمر كله",
    },
    region: "red-sea",
    coordinates: { lat: 27.9158, lng: 34.33 },
    travelStyles: ["beach", "luxury", "family", "nature"],
    bestSeason: ["mar", "apr", "may", "jun", "sep", "oct", "nov", "dec"],
    bestSeasonNote: {
      en: "A genuine year-round destination. Water stays above 21°C in winter and the desert air keeps summer bearable.",
      ar: "وجهة صالحة للزيارة طوال العام بحق. تبقى حرارة الماء فوق 21 درجة شتاءً، ويجعل هواء الصحراء الصيف محتملًا.",
    },
    recommendedDays: { min: 4, max: 7 },
    nightlyRates: { essential: 50, comfort: 115, premium: 230, luxury: 520 },
    dailyBudgetFrom: 85,
    intro: {
      en: "Ras Mohammed drops from ankle-deep coral to a blue wall in a single step, which is why divers have come here for fifty years. Above the water, Sinai's mountains give you St Catherine, a sunrise from Mount Sinai, and desert that starts where the marina ends.",
      ar: "ينحدر رأس محمد من شعاب لا تغطي الكاحل إلى جدار أزرق في خطوة واحدة، ولهذا يقصده الغواصون منذ خمسين عامًا. وفوق الماء تمنحك جبال سيناء دير سانت كاترين وشروقًا من فوق الجبل وصحراء تبدأ حيث تنتهي المارينا.",
    },
    heroImage: {
      src: "/images/destinations/sharm-hero.jpg",
      alt: { en: "The reef wall dropping into deep blue at Ras Mohammed", ar: "جدار الشعاب ينحدر إلى الزرقة العميقة في رأس محمد" },
    },
    gallery: [
      { src: "/images/destinations/sharm-01.jpg", alt: { en: "Coral garden in shallow water", ar: "حديقة مرجانية في مياه ضحلة" } },
      { src: "/images/destinations/sharm-02.jpg", alt: { en: "Sinai mountains behind the bay", ar: "جبال سيناء خلف الخليج" } },
      { src: "/images/destinations/sharm-03.jpg", alt: { en: "Sunrise from the summit of Mount Sinai", ar: "شروق الشمس من قمة جبل موسى" } },
    ],
    attractions: [
      {
        name: { en: "Ras Mohammed National Park", ar: "محمية رأس محمد" },
        blurb: {
          en: "Egypt's first national park, where two seas meet over a vertical reef wall.",
          ar: "أول محمية وطنية في مصر، حيث يلتقي بحران فوق جدار مرجاني رأسي.",
        },
      },
      {
        name: { en: "The SS Thistlegorm", ar: "حطام الثيسل غورم" },
        blurb: {
          en: "A 1941 wreck still holding motorcycles and trucks in its holds. Among the finest dives anywhere.",
          ar: "حطام سفينة من عام 1941 ما زالت عنابرها تحوي دراجات نارية وشاحنات. من أروع مواقع الغوص في العالم.",
        },
      },
      {
        name: { en: "Naama Bay and the marina", ar: "خليج نعمة والمارينا" },
        blurb: {
          en: "The evening side of Sharm: promenades, restaurants and the town's nightlife.",
          ar: "وجه شرم المسائي: ممشى ومطاعم وحياة ليلية.",
        },
      },
      {
        name: { en: "St Catherine and Mount Sinai", ar: "سانت كاترين وجبل موسى" },
        blurb: {
          en: "A night drive inland, a three-hour climb, and sunrise over the Sinai range.",
          ar: "قيادة ليلية نحو الداخل، وتسلق ثلاث ساعات، وشروق فوق سلسلة سيناء.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Ras Mohammed", ar: "رأس محمد" },
        detail: {
          en: "Two dives or a full snorkel day at Shark and Yolanda reefs, then an early night.",
          ar: "غوصتان أو يوم غطس كامل عند شعاب شارك ويولاندا، ثم نوم مبكر.",
        },
      },
      {
        day: 2,
        title: { en: "Sinai interior", ar: "داخل سيناء" },
        detail: {
          en: "Coloured Canyon and a Bedouin lunch, or the overnight climb up Mount Sinai.",
          ar: "الوادي الملون وغداء بدوي، أو تسلق ليلي إلى جبل موسى.",
        },
      },
      {
        day: 3,
        title: { en: "Wreck or rest", ar: "حطام أو راحة" },
        detail: {
          en: "A long boat day to the Thistlegorm, or the beach and the marina at night.",
          ar: "يوم بحري طويل إلى الثيسل غورم، أو الشاطئ والمارينا ليلًا.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Nothing may be taken from Ras Mohammed, shells and coral fragments included. Rangers do check bags.",
        "The Thistlegorm is a long day starting before five in the morning. Worth it, but not on your last day.",
        "Mount Sinai is cold at the summit before dawn even in summer. Take a jacket you would not otherwise pack.",
      ],
      ar: [
        "لا يجوز أخذ أي شيء من رأس محمد، بما في ذلك الأصداف وشظايا المرجان. والحراس يفتشون الحقائب فعلًا.",
        "رحلة الثيسل غورم يوم طويل يبدأ قبل الخامسة فجرًا. تستحق ذلك، لكن ليس في يومك الأخير.",
        "قمة جبل موسى باردة قبل الفجر حتى في الصيف. خذ سترة ما كنت لتحزمها لولا ذلك.",
      ],
    },
    gettingThere: {
      en: "Direct flights from Cairo and Europe into Sharm El Sheikh International, fifteen minutes from most bays.",
      ar: "رحلات مباشرة من القاهرة وأوروبا إلى مطار شرم الشيخ الدولي، على بعد خمس عشرة دقيقة من معظم الخلجان.",
    },
    accommodationNote: {
      en: "Nabq is calm and family-led, Naama Bay is walkable and lively, Om El Seid sits high with the widest views.",
      ar: "نبق هادئة ومناسبة للعائلات، وخليج نعمة قريب المشي وحيوي، وأم السيد مرتفعة بأوسع الإطلالات.",
    },
    relatedSlugs: ["hurghada", "cairo", "aswan"],
    accent: "#1f5a7d",
  },
  {
    id: "dst-white-desert",
    slug: "white-desert",
    name: { en: "White Desert", ar: "الصحراء البيضاء" },
    tagline: {
      en: "Chalk sculptures under the clearest sky in Egypt",
      ar: "منحوتات من الطباشير تحت أصفى سماء في مصر",
    },
    region: "western-desert",
    coordinates: { lat: 27.0587, lng: 27.97 },
    travelStyles: ["desert", "nature", "romantic"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar"],
    bestSeasonNote: {
      en: "Camping season runs October to March. Summer nights stay hot and the daytime sun is genuinely dangerous.",
      ar: "موسم التخييم من أكتوبر إلى مارس. تبقى ليالي الصيف حارة، وشمس النهار خطرة فعلًا.",
    },
    recommendedDays: { min: 2, max: 3 },
    nightlyRates: { essential: 60, comfort: 110, premium: 180, luxury: 300 },
    dailyBudgetFrom: 105,
    intro: {
      en: "Wind has spent millennia carving a chalk plateau into mushrooms, towers and animals, and left them white against orange sand. You come to sleep here. One night in a desert camp, with no light for two hundred kilometres, is the reason this place is on the list.",
      ar: "أمضت الرياح آلاف السنين تنحت هضبة طباشيرية إلى فطر وأبراج وحيوانات، وتركتها بيضاء على رمل برتقالي. تأتي إلى هنا لتنام. ليلة واحدة في مخيم صحراوي، بلا ضوء على مدى مئتي كيلومتر، هي سبب وجود هذا المكان في القائمة.",
    },
    heroImage: {
      src: "/images/destinations/white-desert-hero.jpg",
      alt: { en: "Chalk formations glowing at sunset in the White Desert", ar: "تكوينات طباشيرية تتوهج عند الغروب في الصحراء البيضاء" },
    },
    gallery: [
      { src: "/images/destinations/white-desert-01.jpg", alt: { en: "A mushroom rock against orange sand", ar: "صخرة على شكل فطر أمام رمل برتقالي" } },
      { src: "/images/destinations/white-desert-02.jpg", alt: { en: "Camp fire under a full night sky", ar: "نار مخيم تحت سماء ليل كاملة" } },
      { src: "/images/destinations/white-desert-03.jpg", alt: { en: "The black basalt hills of the Black Desert", ar: "تلال البازلت السوداء في الصحراء السوداء" } },
    ],
    attractions: [
      {
        name: { en: "The chalk formations", ar: "التكوينات الطباشيرية" },
        blurb: {
          en: "Named shapes like the Chicken and the Mushroom, best photographed in the last hour of light.",
          ar: "أشكال لها أسماء مثل الدجاجة وعش الغراب، وأفضل تصويرها في آخر ساعة من الضوء.",
        },
      },
      {
        name: { en: "The Black Desert", ar: "الصحراء السوداء" },
        blurb: {
          en: "Volcanic hills coated in dark basalt, passed on the drive in from Bahariya.",
          ar: "تلال بركانية مغطاة ببازلت داكن، تمر بها في الطريق من الباويطي.",
        },
      },
      {
        name: { en: "Crystal Mountain", ar: "جبل الكريستال" },
        blurb: {
          en: "A ridge of quartz crystal with a natural arch, a short stop that catches the sun.",
          ar: "حافة من بلورات الكوارتز فيها قوس طبيعي، محطة قصيرة تلتقط الشمس.",
        },
      },
      {
        name: { en: "Bahariya Oasis", ar: "واحة الباويطي" },
        blurb: {
          en: "The gateway village, with hot springs and the Valley of the Golden Mummies nearby.",
          ar: "القرية البوابة، وفيها عيون ساخنة ووادي المومياوات الذهبية على مقربة.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Drive in and camp", ar: "الوصول والتخييم" },
        detail: {
          en: "Cairo to Bahariya, the Black Desert and Crystal Mountain on the way, camp set up before sunset.",
          ar: "من القاهرة إلى الباويطي، مرورًا بالصحراء السوداء وجبل الكريستال، ونصب المخيم قبل الغروب.",
        },
      },
      {
        day: 2,
        title: { en: "Sunrise and the return", ar: "الشروق والعودة" },
        detail: {
          en: "First light on the chalk, a hot spring stop in the oasis, back in Cairo by evening.",
          ar: "أول الضوء على الطباشير، ووقفة في عين ساخنة بالواحة، والعودة إلى القاهرة مساءً.",
        },
      },
    ],
    localAdvice: {
      en: [
        "This is camping, not a hotel. Facilities are a mat, a fire, a shared tent and a desert toilet.",
        "Desert nights in January fall near zero. Camps supply blankets, but pack a warm layer regardless.",
        "Take every piece of rubbish out with you. The formations are a protected national park.",
      ],
      ar: [
        "هذا تخييم لا فندق. التجهيزات حصيرة ونار وخيمة مشتركة ودورة مياه صحراوية.",
        "تقترب ليالي يناير في الصحراء من الصفر. توفر المخيمات أغطية، لكن احزم طبقة دافئة على أي حال.",
        "خذ كل قطعة نفايات معك عند المغادرة. فالتكوينات محمية طبيعية وطنية.",
      ],
    },
    gettingThere: {
      en: "Four to five hours by road from Cairo to Bahariya Oasis, then four-wheel drive only beyond the tarmac.",
      ar: "من أربع إلى خمس ساعات برًا من القاهرة إلى واحة الباويطي، ثم بالدفع الرباعي فقط بعد نهاية الأسفلت.",
    },
    accommodationNote: {
      en: "Overnight is a guided desert camp. Comfort tiers add private tents, proper bedding and a cook rather than a building.",
      ar: "المبيت في مخيم صحراوي بصحبة مرشد. وترفع الفئات الأعلى مستوى الخيام الخاصة والفرش الجيد والطاهي، لا المباني.",
    },
    relatedSlugs: ["siwa-oasis", "cairo", "aswan"],
    accent: "#7c6144",
  },
];

export const destinationBySlug = new Map(destinations.map((d) => [d.slug, d]));
