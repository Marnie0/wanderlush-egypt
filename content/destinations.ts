import type { Destination } from "./types";

/**
 * Ten destinations spanning the Nile valley, both coasts, Fayoum and the
 * Western Desert. Copy is written as a travel editor would write it: specific,
 * outcome-focused, never generic.
 */
export const destinations: Destination[] = [
  {
    id: "dst-cairo",
    slug: "cairo",
    name: { en: "Cairo", ar: "القاهرة" },
    tagline: {
      en: "A thousand minarets and a market that never closed",
      ar: "ألف مئذنة وسوق لم يُغلق أبوابه يومًا",
    },
    region: "greater-cairo",
    coordinates: { lat: 30.0444, lng: 31.2357 },
    travelStyles: ["history", "family", "luxury"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar", "apr"],
    bestSeasonNote: {
      en: "October to April keeps the afternoons walkable. Summer visits are best planned around early mornings and late evenings.",
      ar: "من أكتوبر إلى أبريل يبقى الجو مناسبًا للمشي بعد الظهر. أما في الصيف فرتّب زياراتك في الصباح الباكر وآخر المساء.",
    },
    recommendedDays: { min: 2, max: 4 },
    nightlyRates: { essential: 55, comfort: 110, premium: 210, luxury: 420 },
    dailyBudgetFrom: 85,
    intro: {
      en: "The pyramids are across the river in Giza. Cairo itself is the other thousand years: a Fatimid street still trading after dark, a medieval citadel above the haze, churches and a synagogue standing shoulder to shoulder in the old quarter, and a river that the whole city turns to face at sunset.",
      ar: "الأهرامات على الضفة الأخرى، في الجيزة. أما القاهرة نفسها فهي الألف سنة التالية: شارع فاطمي ما زالت تجارته قائمة بعد الغروب، وقلعة من العصور الوسطى تعلو الضباب، وكنائس ومعبد يهودي كتفًا بكتف في الحي القديم، ونهر تستدير إليه المدينة كلها وقت المغيب.",
    },
    heroImage: {
      src: "/images/destinations/cairo-hero.webp",
      alt: {
        en: "Sultan Hassan and Al-Rifai mosques above the old city",
        ar: "مسجدا السلطان حسن والرفاعي فوق المدينة القديمة",
      },
    },
    gallery: [
      {
        src: "/images/destinations/cairo-01.webp",
        alt: { en: "Lanterns in Khan el-Khalili", ar: "فوانيس في خان الخليلي" },
      },
      {
        src: "/images/destinations/cairo-02.webp",
        alt: { en: "An alley off Al-Muizz Street", ar: "زقاق متفرع من شارع المعز" },
      },
      {
        src: "/images/destinations/cairo-03.webp",
        alt: { en: "Cairo lit up after dark along the Nile", ar: "القاهرة مضاءة بعد الغروب على امتداد النيل" },
      },
    ],
    attractions: [
      {
        name: { en: "Khan el-Khalili", ar: "خان الخليلي" },
        blurb: {
          en: "A working market since the fourteenth century. Coffee at El Fishawy is part of the visit, not a detour.",
          ar: "سوق تعمل منذ القرن الرابع عشر. وقهوة الفيشاوي جزء من الزيارة لا محطة عابرة.",
        },
      },
      {
        name: { en: "Al-Muizz Street by night", ar: "شارع المعز ليلًا" },
        blurb: {
          en: "An open-air museum of Fatimid, Ayyubid and Mamluk architecture, lit and pedestrianised after dark.",
          ar: "متحف مفتوح للعمارة الفاطمية والأيوبية والمملوكية، يُضاء ويُخصَّص للمشاة بعد الغروب.",
        },
      },
      {
        name: { en: "The Citadel and Sultan Hassan", ar: "القلعة ومسجد السلطان حسن" },
        blurb: {
          en: "Salah al-Din's fortress on the ridge, and beneath it the mosque most Egyptian architects will tell you is the finest in the city.",
          ar: "قلعة صلاح الدين فوق المرتفع، وتحتها المسجد الذي سيقول لك معظم المعماريين المصريين إنه أجمل ما في المدينة.",
        },
      },
      {
        name: { en: "Coptic Cairo", ar: "القاهرة القبطية" },
        blurb: {
          en: "The Hanging Church, Ben Ezra Synagogue and Abu Serga sit within a few quiet minutes of each other.",
          ar: "الكنيسة المعلقة ومعبد بن عزرا وكنيسة أبي سرجة، لا تفصل بينها سوى دقائق قليلة هادئة سيرًا.",
        },
      },
      {
        name: { en: "The Egyptian Museum in Tahrir", ar: "المتحف المصري بالتحرير" },
        blurb: {
          en: "The original 1902 museum, still holding the royal mummies' neighbours and a century of cataloguing history.",
          ar: "المتحف الأصلي منذ عام 1902، وما زال يحتفظ بجيران المومياوات الملكية وبقرن كامل من تاريخ التصنيف والفهرسة.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Islamic Cairo", ar: "القاهرة الإسلامية" },
        detail: {
          en: "The Citadel and Sultan Hassan in the morning, Khan el-Khalili after lunch, Al-Muizz Street once the lamps come on.",
          ar: "القلعة ومسجد السلطان حسن صباحًا، وخان الخليلي بعد الغداء، وشارع المعز حين تُضاء المصابيح.",
        },
      },
      {
        day: 2,
        title: { en: "Coptic Cairo and the river", ar: "القاهرة القبطية والنهر" },
        detail: {
          en: "The old churches in the morning, the Tahrir museum through the heat, a felucca hour before dinner.",
          ar: "الكنائس القديمة صباحًا، ومتحف التحرير في ساعات الحر، وساعة على فلوكة قبل العشاء.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Traffic decides your day. Keep the morning and the afternoon on the same side of the river.",
        "Carry small notes for tips and entry extras.",
        "Dress covers shoulders and knees for mosques; women should carry a light scarf for head covering.",
        "Ride-hailing apps work well and remove the fare negotiation entirely.",
      ],
      ar: [
        "المرور هو الذي يرسم يومك. اجعل برنامج الصباح وبعد الظهر على ضفة واحدة.",
        "احتفظ بأوراق نقدية صغيرة للبقشيش ورسوم الدخول الإضافية.",
        "في المساجد، ملابس تغطي الكتفين والركبتين، وعلى السيدات حمل وشاح خفيف لتغطية الرأس.",
        "تطبيقات طلب السيارات تعمل جيدًا وتريحك من المساومة على الأجرة تمامًا.",
      ],
    },
    gettingThere: {
      en: "Cairo International is Egypt's main gateway, forty to ninety minutes from the centre depending on traffic. Trains run north to Alexandria and south along the Nile valley.",
      ar: "مطار القاهرة الدولي هو بوابة مصر الرئيسية، على بعد أربعين إلى تسعين دقيقة من وسط المدينة بحسب المرور. والقطارات تتجه شمالًا إلى الإسكندرية وجنوبًا على طول وادي النيل.",
    },
    accommodationNote: {
      en: "Zamalek and Garden City suit travellers who want quiet streets and river views. Downtown is louder, cheaper and walkable to the Tahrir museum.",
      ar: "الزمالك وجاردن سيتي لمن يريد شوارع هادئة وإطلالة على النيل. أما وسط البلد فأكثر صخبًا وأرخص، ومتحف التحرير على مسافة مشي منه.",
    },
    relatedSlugs: ["giza", "fayoum", "alexandria"],
    accent: "#a8853b",
  },
  {
    id: "dst-giza",
    slug: "giza",
    name: { en: "Giza", ar: "الجيزة" },
    tagline: {
      en: "The last standing wonder, at the end of a city street",
      ar: "آخر عجائب الدنيا الباقية، في نهاية شارع من شوارع المدينة",
    },
    region: "greater-cairo",
    coordinates: { lat: 29.9773, lng: 31.1325 },
    travelStyles: ["history", "family", "luxury"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar", "apr"],
    bestSeasonNote: {
      en: "October to April. In summer the plateau is only comfortable in the first two hours after opening.",
      ar: "من أكتوبر إلى أبريل. أما في الصيف فلا تُحتمل الهضبة إلا في أول ساعتين بعد فتح الأبواب.",
    },
    recommendedDays: { min: 2, max: 3 },
    nightlyRates: { essential: 50, comfort: 105, premium: 200, luxury: 430 },
    dailyBudgetFrom: 95,
    intro: {
      en: "Giza is its own governorate on the west bank, and it holds almost everything people picture when they picture Egypt. The plateau sits where the city stops and the desert starts. The Grand Egyptian Museum faces it across the road. Half an hour south, Saqqara and Dahshur show the same idea being worked out, two centuries earlier, in stone that had never been stacked that high before.",
      ar: "الجيزة محافظة قائمة بذاتها على البر الغربي، وفيها يكاد يكون كل ما يخطر في بال الناس حين يذكرون مصر. الهضبة تقف حيث تنتهي المدينة وتبدأ الصحراء، والمتحف المصري الكبير يقابلها على الجانب الآخر من الطريق. وعلى بعد نصف ساعة جنوبًا، تريك سقارة ودهشور الفكرة نفسها وهي تختمر قبل ذلك بقرنين، في حجر لم يُرفع إلى هذا العلو من قبل.",
    },
    heroImage: {
      src: "/images/destinations/giza-hero.webp",
      alt: {
        en: "The Great Sphinx with the pyramid of Khafre behind",
        ar: "أبو الهول ومن خلفه هرم خفرع",
      },
    },
    gallery: [
      {
        src: "/images/destinations/giza-01.webp",
        alt: { en: "The Grand Egyptian Museum atrium", ar: "بهو المتحف المصري الكبير" },
      },
      {
        src: "/images/destinations/giza-02.webp",
        alt: { en: "The Step Pyramid of Djoser at Saqqara", ar: "هرم زوسر المدرج في سقارة" },
      },
      {
        src: "/images/destinations/giza-03.webp",
        alt: { en: "The Red Pyramid at Dahshur", ar: "الهرم الأحمر في دهشور" },
      },
    ],
    attractions: [
      {
        name: { en: "The Great Pyramid and the Sphinx", ar: "الهرم الأكبر وأبو الهول" },
        blurb: {
          en: "Arrive at opening or stay for the last hour. Both avoid the coach crowds and give you the low, gold light the plateau deserves.",
          ar: "كن هناك عند فتح الأبواب، أو ابقَ حتى الساعة الأخيرة. في الحالتين تتفادى زحام الحافلات السياحية وتظفر بالضوء الذهبي المنخفض الذي تستحقه الهضبة.",
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
        name: { en: "Saqqara", ar: "سقارة" },
        blurb: {
          en: "Djoser's Step Pyramid is the oldest stone building on earth, and the mastabas around it carry finer carving than anything on the plateau.",
          ar: "هرم زوسر المدرج أقدم بناء حجري على وجه الأرض، والمصاطب من حوله تحمل نقوشًا أدق من كل ما على الهضبة.",
        },
      },
      {
        name: { en: "Dahshur", ar: "دهشور" },
        blurb: {
          en: "The Bent Pyramid and the Red Pyramid, where the geometry was solved. You can walk down inside the Red with no queue at all.",
          ar: "الهرم المنحني والهرم الأحمر، حيث اهتدى البناؤون إلى الهندسة الصحيحة. وتستطيع النزول إلى جوف الأحمر من غير أن تقف في طابور.",
        },
      },
      {
        name: { en: "Memphis at Mit Rahina", ar: "منف في ميت رهينة" },
        blurb: {
          en: "The capital that ran all of this, now an open field with a colossal reclining Ramesses under a shelter.",
          ar: "العاصمة التي كانت تدير كل هذا، وهي اليوم ساحة مفتوحة فيها تمثال هائل لرمسيس مستلقٍ تحت سقيفة.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "The plateau and the museum", ar: "الهضبة والمتحف" },
        detail: {
          en: "Pyramids at opening, the Sphinx from the causeway, then the Grand Egyptian Museum across the road in the afternoon.",
          ar: "الأهرامات ساعة الفتح، وأبو الهول من الطريق الصاعد، ثم المتحف المصري الكبير على الجانب الآخر من الطريق بعد الظهر.",
        },
      },
      {
        day: 2,
        title: { en: "Saqqara, Dahshur and Memphis", ar: "سقارة ودهشور ومنف" },
        detail: {
          en: "The earlier pyramids without the crowds, and the painted mastabas most visitors never reach.",
          ar: "الأهرامات الأقدم بلا زحام، والمصاطب الملوّنة التي لا يصل إليها معظم الزوار.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Book the plateau first thing. By ten the coaches have arrived and the light has gone flat.",
        "Entry inside the Great Pyramid is a separate ticket, sold at the gate and capped each day.",
        "The camel and horse handlers work on commission. Agree a price and a duration before you sit down.",
        "Saqqara and Dahshur are half an hour apart on the same road. Do them together or not at all.",
      ],
      ar: [
        "اجعل الهضبة أول ما تفعله في يومك. فمع العاشرة تكون الحافلات قد وصلت والضوء قد صار مسطّحًا بلا ظلال.",
        "الدخول إلى جوف الهرم الأكبر بتذكرة منفصلة، تُباع عند البوابة وبعدد محدود كل يوم.",
        "الجمّالة وأصحاب الخيل يعملون بالعمولة. اتفق على السعر والمدة قبل أن تركب.",
        "بين سقارة ودهشور نصف ساعة على الطريق نفسه. إما أن تزورهما معًا أو لا تزورهما أصلًا.",
      ],
    },
    gettingThere: {
      en: "Forty-five to seventy-five minutes from Cairo International, or twenty from central Cairo outside rush hour. Sphinx International, north-west of the plateau, takes a growing number of regional flights.",
      ar: "من 45 إلى 75 دقيقة من مطار القاهرة الدولي، أو عشرون دقيقة من وسط القاهرة بعيدًا عن ساعات الذروة. ومطار سفنكس الدولي، شمال غرب الهضبة، يستقبل عددًا متزايدًا من الرحلات الإقليمية.",
    },
    accommodationNote: {
      en: "Nazlet El-Semman puts the pyramids outside the window, and a handful of rooftops there face them directly. Sheikh Zayed is newer, quieter and twenty minutes away.",
      ar: "في نزلة السمان تكون الأهرامات خلف نافذتك مباشرة، وفيها بضعة أسطح تطل عليها وجهًا لوجه. أما الشيخ زايد فأحدث وأهدأ، وتبعد عشرين دقيقة.",
    },
    relatedSlugs: ["cairo", "fayoum", "white-desert"],
    accent: "#c85f26",
  },
  {
    id: "dst-fayoum",
    slug: "fayoum",
    name: { en: "Fayoum", ar: "الفيوم" },
    tagline: {
      en: "Waterfalls, whale fossils and a lake older than the pharaohs",
      ar: "شلالات وأحافير حيتان وبحيرة أقدم من الفراعنة",
    },
    region: "fayoum",
    coordinates: { lat: 29.3084, lng: 30.8428 },
    travelStyles: ["nature", "desert", "family"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar", "apr"],
    bestSeasonNote: {
      en: "October to April. The desert sections are unpleasant from June onward, and the lake is at its best in the cool months.",
      ar: "من أكتوبر إلى أبريل. فالأجزاء الصحراوية لا تُطاق من يونيو فصاعدًا، والبحيرة في أحسن حالاتها في شهور البرد.",
    },
    recommendedDays: { min: 1, max: 2 },
    nightlyRates: { essential: 35, comfort: 75, premium: 140, luxury: 260 },
    dailyBudgetFrom: 60,
    intro: {
      en: "Ninety minutes from Cairo, a depression in the desert fills with water and turns green. Fayoum has Egypt's only waterfalls, a valley of forty-million-year-old whale skeletons that UNESCO protects, a lake that fishermen have worked since the Middle Kingdom, and a village of potters who fire everything they sell. It is the easiest day out of the capital that feels nothing like it.",
      ar: "على بعد تسعين دقيقة من القاهرة، ينخفض سطح الصحراء فيمتلئ بالماء ويخضرّ. في الفيوم شلالات مصر الوحيدة، ووادٍ تحميه اليونسكو فيه هياكل حيتان عمرها أربعون مليون سنة، وبحيرة يصطاد فيها الناس منذ الدولة الوسطى، وقرية خزّافين يصنعون بأيديهم كل ما يبيعونه. هي أسهل مشوار يوم واحد من العاصمة، ولا يشبه العاصمة في شيء.",
    },
    heroImage: {
      src: "/images/destinations/fayoum-hero.webp",
      alt: {
        en: "Water falling into the lakes at Wadi El Rayan",
        ar: "الماء يتساقط إلى بحيرات وادي الريان",
      },
    },
    gallery: [
      {
        src: "/images/destinations/fayoum-01.webp",
        alt: { en: "The shore of Lake Qarun", ar: "شاطئ بحيرة قارون" },
      },
      {
        src: "/images/destinations/fayoum-02.webp",
        alt: { en: "Eroded sandstone at Wadi Al-Hitan", ar: "حجر رملي متآكل في وادي الحيتان" },
      },
      {
        src: "/images/destinations/fayoum-03.webp",
        alt: { en: "Egrets around a fishing boat on the lake", ar: "بلشونات حول قارب صيد في البحيرة" },
      },
    ],
    attractions: [
      {
        name: { en: "Wadi El Rayan", ar: "وادي الريان" },
        blurb: {
          en: "Two lakes joined by the only waterfalls in Egypt, with dunes running down to the water on the far side.",
          ar: "بحيرتان تصلهما شلالات مصر الوحيدة، وكثبان تنحدر إلى الماء في الجهة المقابلة.",
        },
      },
      {
        name: { en: "Wadi Al-Hitan", ar: "وادي الحيتان" },
        blurb: {
          en: "A UNESCO World Heritage site holding the skeletons of early whales that still had legs. The walk is a marked loop through open desert.",
          ar: "موقع تراث عالمي مسجّل لدى اليونسكو، فيه هياكل حيتان أولى كانت لا تزال لها أرجل. والمسار دائرة معلّمة تمشيها وسط صحراء مفتوحة.",
        },
      },
      {
        name: { en: "Lake Qarun", ar: "بحيرة قارون" },
        blurb: {
          en: "A remnant of the ancient Lake Moeris, fished since the Middle Kingdom and full of migratory birds in winter.",
          ar: "ما بقي من بحيرة موريس القديمة، يصطاد فيها الناس منذ الدولة الوسطى، وتعجّ بالطيور المهاجرة في الشتاء.",
        },
      },
      {
        name: { en: "Tunis Village", ar: "قرية تونس" },
        blurb: {
          en: "A hillside of potters above the lake, where a Swiss ceramicist started a school in the 1980s and the whole village followed.",
          ar: "قرية خزّافين على تل يطل على البحيرة؛ افتتحت فيها خزّافة سويسرية مدرسة في الثمانينيات، فسارت القرية كلها على دربها.",
        },
      },
      {
        name: { en: "Qasr Qarun", ar: "قصر قارون" },
        blurb: {
          en: "A Ptolemaic temple at the desert edge of the lake, almost intact, and usually empty.",
          ar: "معبد بطلمي عند طرف البحيرة الصحراوي، شبه مكتمل، وغالبًا لن تجد فيه أحدًا غيرك.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "The lakes and the falls", ar: "البحيرات والشلالات" },
        detail: {
          en: "Wadi El Rayan in the morning, lunch by the water, Tunis Village and the potters in the afternoon.",
          ar: "وادي الريان صباحًا، وغداء بجوار الماء، وقرية تونس والخزّافون بعد الظهر.",
        },
      },
      {
        day: 2,
        title: { en: "Whale Valley and Qasr Qarun", ar: "وادي الحيتان وقصر قارون" },
        detail: {
          en: "An early run into the protected area, the fossil trail on foot, then the temple on the way back.",
          ar: "انطلاق مبكر إلى المحمية، ومشي على درب الأحافير، ثم المعبد في طريق العودة.",
        },
      },
    ],
    localAdvice: {
      en: [
        "Wadi Al-Hitan needs a four-wheel drive for the last stretch, and the gate closes at four.",
        "Buy pottery in Tunis Village directly from the workshops rather than the roadside stalls.",
        "Weekends fill with Cairo day-trippers. Come on a weekday and the falls are almost yours.",
        "There is very little shade anywhere. Water and a hat matter more here than the distance suggests.",
      ],
      ar: [
        "الجزء الأخير من الطريق إلى وادي الحيتان لا يصلح إلا لسيارة دفع رباعي، والبوابة تُغلق في الرابعة.",
        "اشترِ الفخار في قرية تونس من الورش مباشرة لا من أكشاك الطريق.",
        "في عطلة الأسبوع يزدحم المكان بأهل القاهرة. تعال في يوم من أيام الأسبوع تجد الشلالات لك وحدك تقريبًا.",
        "الظل شحيح في كل مكان. الماء والقبعة هنا أهم مما توحي به المسافات القصيرة.",
      ],
    },
    gettingThere: {
      en: "Ninety minutes to two hours by road from Cairo or Giza. There is no airport and no useful train; this is a drive.",
      ar: "من تسعين دقيقة إلى ساعتين بالسيارة من القاهرة أو الجيزة. لا مطار هناك ولا قطار يُعتمد عليه؛ هذا مشوار بالسيارة.",
    },
    accommodationNote: {
      en: "The eco-lodges above Tunis Village are the reason to stay a night rather than come for the day. Mudbrick rooms, lake views, no television.",
      ar: "النُّزل البيئية فوق قرية تونس هي ما يجعل المبيت ليلةً أفضل من زيارة يوم واحد: غرف من الطوب اللبن، وإطلالة على البحيرة، ولا تلفاز.",
    },
    relatedSlugs: ["giza", "cairo", "white-desert"],
    accent: "#2c6e67",
  },
  {
    id: "dst-alexandria",
    slug: "alexandria",
    name: { en: "Alexandria", ar: "الإسكندرية" },
    tagline: {
      en: "A Mediterranean city that remembers being Greek",
      ar: "مدينة متوسطية لم تنسَ أصلها اليوناني",
    },
    region: "mediterranean",
    coordinates: { lat: 31.2001, lng: 29.9187 },
    travelStyles: ["history", "beach", "romantic"],
    bestSeason: ["apr", "may", "jun", "sep", "oct", "nov"],
    bestSeasonNote: {
      en: "Late spring and early autumn give warm sea air without August's crowds. Winter brings dramatic storms along the Corniche.",
      ar: "آخر الربيع وأول الخريف: هواء بحر دافئ من غير زحام أغسطس. أما الشتاء فيأتي بعواصف مهيبة تستحق أن تُشاهد من الكورنيش.",
    },
    recommendedDays: { min: 2, max: 3 },
    nightlyRates: { essential: 45, comfort: 90, premium: 170, luxury: 320 },
    dailyBudgetFrom: 75,
    intro: {
      en: "Founded by Alexander, run by the Ptolemies, and still facing north to Europe rather than south to the desert. Alexandria trades pyramids for a seafront corniche, Greco-Roman catacombs, a reborn library and the best seafood in Egypt.",
      ar: "أسسها الإسكندر وحكمها البطالمة، وما زالت وجهتها إلى الشمال نحو أوروبا لا إلى الجنوب نحو الصحراء. ليس في الإسكندرية أهرامات، لكن فيها كورنيشًا على البحر، وسراديب يونانية رومانية، ومكتبة بُعثت من جديد، وأطيب مأكولات بحرية في مصر.",
    },
    heroImage: {
      src: "/images/destinations/alexandria-hero.webp",
      alt: { en: "Qaitbay Citadel above the eastern harbour", ar: "قلعة قايتباي فوق الميناء الشرقي" },
    },
    gallery: [
      { src: "/images/destinations/alexandria-01.webp", alt: { en: "The Corniche looking along the seafront", ar: "الكورنيش بامتداد الواجهة البحرية" } },
      { src: "/images/destinations/alexandria-02.webp", alt: { en: "Reading hall of the Bibliotheca Alexandrina", ar: "قاعة المطالعة في مكتبة الإسكندرية" } },
      { src: "/images/destinations/alexandria-03.webp", alt: { en: "Fishing boats in the Eastern Harbour", ar: "قوارب صيد في الميناء الشرقي" } },
    ],
    attractions: [
      {
        name: { en: "Bibliotheca Alexandrina", ar: "مكتبة الإسكندرية" },
        blurb: {
          en: "A disc of granite tilted toward the sea, standing where the ancient library once did.",
          ar: "قرص من الجرانيت يميل نحو البحر، في الموضع الذي قامت فيه المكتبة القديمة.",
        },
      },
      {
        name: { en: "Qaitbay Citadel", ar: "قلعة قايتباي" },
        blurb: {
          en: "Built from the rubble of the Pharos lighthouse on the exact spot where it stood.",
          ar: "بُنيت من حجارة منارة الإسكندرية القديمة، وفي المكان نفسه الذي كانت تقوم فيه.",
        },
      },
      {
        name: { en: "Catacombs of Kom el-Shoqafa", ar: "سراديب كوم الشقافة" },
        blurb: {
          en: "Three levels cut into rock where Egyptian, Greek and Roman funerary art share a single wall.",
          ar: "ثلاثة طوابق محفورة في الصخر، تتجاور فيها فنون الدفن المصرية واليونانية والرومانية على الجدار الواحد.",
        },
      },
      {
        name: { en: "Montazah Gardens", ar: "حدائق المنتزه" },
        blurb: {
          en: "Royal parkland running down to private coves, best at the end of the afternoon.",
          ar: "حدائق ملكية تنحدر إلى خلجان مغلقة، وأجمل وقت لها آخر النهار.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Greco-Roman Alexandria", ar: "الإسكندرية اليونانية الرومانية" },
        detail: {
          en: "Catacombs, Pompey's Pillar and the Roman amphitheatre, then seafood at the harbour.",
          ar: "مقابر كوم الشقافة وعمود السواري والمسرح الروماني، ثم غداء بحري على الميناء.",
        },
      },
      {
        day: 2,
        title: { en: "Library, citadel and corniche", ar: "المكتبة والقلعة والكورنيش" },
        detail: {
          en: "The Bibliotheca in the morning, Qaitbay at midday, and the corniche walk as the light drops.",
          ar: "المكتبة صباحًا، وقايتباي ظهرًا، ثم مشوار على الكورنيش والضوء يخفت.",
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
        "خذ القطار من القاهرة بدل الطريق. ساعتان ونصف، ومناظر الدلتا جزء من المتعة.",
        "السمك تختاره بنفسك بالوزن عند الطاولة قبل أن يُطهى. أشِر إلى ما يعجبك.",
        "رياح الكورنيش في الشتاء ليست مزحة. خذ معك سترة حتى لو كان الجو في القاهرة دافئًا.",
      ],
    },
    gettingThere: {
      en: "Two and a half hours by express train from Cairo, three by road. Borg El Arab airport serves a growing list of European cities.",
      ar: "ساعتان ونصف بالقطار السريع من القاهرة، أو ثلاث ساعات بالسيارة. ومطار برج العرب يربطها بعدد متزايد من المدن الأوروبية.",
    },
    accommodationNote: {
      en: "Sea-facing rooms along the Corniche are worth the supplement. Montazah is quieter and greener but twenty minutes from the centre.",
      ar: "الغرف المطلة على البحر على الكورنيش تستحق فرق السعر. والمنتزه أهدأ وأكثر خضرة، لكنه يبعد عشرين دقيقة عن الوسط.",
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
      ar: "أكبر متحف مفتوح في العالم، يقسمه نهر إلى نصفين",
    },
    region: "nile-valley",
    coordinates: { lat: 25.6872, lng: 32.6396 },
    travelStyles: ["history", "luxury", "romantic"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar"],
    bestSeasonNote: {
      en: "November to February is the window. Summer regularly clears 40°C and limits sightseeing to before ten in the morning.",
      ar: "من نوفمبر إلى فبراير هو الوقت الأمثل. أما في الصيف فتتخطى الحرارة الأربعين درجة كثيرًا، ولا مجال للزيارات بعد العاشرة صباحًا.",
    },
    recommendedDays: { min: 3, max: 4 },
    nightlyRates: { essential: 50, comfort: 105, premium: 220, luxury: 480 },
    dailyBudgetFrom: 90,
    intro: {
      en: "Ancient Thebes put its living on the east bank and its dead on the west, and both halves survived. Karnak alone covers two square kilometres. Across the water, the Valley of the Kings hides painted tombs behind a limestone ridge that looks like nothing at all from the road.",
      ar: "جعلت طيبة القديمة أحياءها على البر الشرقي وموتاها على البر الغربي، وبقي النصفان إلى اليوم. الكرنك وحده يمتد على كيلومترين مربعين. وعلى الضفة المقابلة يُخفي وادي الملوك مقابره المزخرفة خلف جرف من الحجر الجيري لا يلفت النظر من الطريق.",
    },
    heroImage: {
      src: "/images/destinations/luxor-hero.webp",
      alt: { en: "The colonnade of Luxor Temple in the late afternoon", ar: "صف أعمدة معبد الأقصر في آخر النهار" },
    },
    gallery: [
      { src: "/images/destinations/luxor-01.webp", alt: { en: "The hypostyle hall at Karnak", ar: "بهو الأعمدة في الكرنك" } },
      { src: "/images/destinations/luxor-02.webp", alt: { en: "Hatshepsut's terraces at Deir el-Bahari", ar: "مدرجات حتشبسوت في الدير البحري" } },
      { src: "/images/destinations/luxor-03.webp", alt: { en: "Painted ceiling inside a royal tomb", ar: "سقف مزخرف داخل مقبرة ملكية" } },
      { src: "/images/destinations/luxor-04.webp", alt: { en: "Colossi and colonnade at Luxor Temple", ar: "التماثيل والأعمدة في معبد الأقصر" } },
    ],
    attractions: [
      {
        name: { en: "Karnak Temple", ar: "معبد الكرنك" },
        blurb: {
          en: "Two thousand years of additions by successive pharaohs. The hypostyle hall holds 134 columns.",
          ar: "ألفا سنة من البناء والإضافة على أيدي فراعنة متعاقبين. وفي بهو الأعمدة الكبير 134 عمودًا.",
        },
      },
      {
        name: { en: "Valley of the Kings", ar: "وادي الملوك" },
        blurb: {
          en: "Sixty-three tombs cut into the rock. Three are included with entry; Seti I and Tutankhamun are ticketed separately.",
          ar: "63 مقبرة محفورة في الصخر. التذكرة تشمل ثلاثًا منها، أما مقبرتا سيتي الأول وتوت عنخ آمون فلكل منهما تذكرتها.",
        },
      },
      {
        name: { en: "Temple of Hatshepsut", ar: "معبد حتشبسوت" },
        blurb: {
          en: "Three colonnaded terraces built straight into the cliff at Deir el-Bahari.",
          ar: "ثلاث شرفات ذات أعمدة، مبنية في قلب الجرف بالدير البحري.",
        },
      },
      {
        name: { en: "Luxor Temple", ar: "معبد الأقصر" },
        blurb: {
          en: "In the middle of the modern town and best after dark, when the columns are lit from below.",
          ar: "في قلب المدينة الحديثة، وأجمل ما يكون بعد الغروب حين تُضاء أعمدته من أسفل.",
        },
      },
      {
        name: { en: "Medinet Habu", ar: "مدينة هابو" },
        blurb: {
          en: "Ramesses III's mortuary temple keeps more original colour than anywhere else on the west bank.",
          ar: "معبد رمسيس الثالث الجنائزي، وفيه من الألوان الأصلية ما لا تجده في أي مكان آخر على البر الغربي.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "East bank temples", ar: "معابد البر الشرقي" },
        detail: {
          en: "Karnak early, the Luxor Museum through the hottest hours, Luxor Temple after dark.",
          ar: "الكرنك في الصباح الباكر، ومتحف الأقصر في ساعات الحر، ومعبد الأقصر بعد الغروب.",
        },
      },
      {
        day: 2,
        title: { en: "West bank and the royal tombs", ar: "البر الغربي والمقابر الملكية" },
        detail: {
          en: "Balloon at dawn if booked, then the Valley of the Kings, Hatshepsut and Medinet Habu before noon.",
          ar: "المنطاد مع الفجر إن كنت حجزته، ثم وادي الملوك وحتشبسوت ومدينة هابو قبل الظهر.",
        },
      },
      {
        day: 3,
        title: { en: "Dendera or a slow river day", ar: "دندرة أو يوم نهري هادئ" },
        detail: {
          en: "The ceiling at Dendera is a ninety-minute drive north, or stay for a felucca afternoon and the souk.",
          ar: "سقف دندرة على بعد تسعين دقيقة إلى الشمال، أو ابقَ لأصيل على فلوكة وجولة في السوق.",
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
        "التصوير داخل المقابر بتذكرة منفصلة تشتريها عند مدخل الوادي، لا عند كل مقبرة.",
        "احجز رحلة المنطاد في صباحك الأول ليبقى لديك يوم احتياطي إن أُلغيت بسبب الطقس.",
        "البر الغربي تكاد تخلو من الظل. الماء والقبعة ليسا خيارًا بين مارس وأكتوبر.",
      ],
    },
    gettingThere: {
      en: "An hour's flight from Cairo, or ten hours on the overnight sleeper train. Most Nile cruises begin or end here.",
      ar: "ساعة طيران من القاهرة، أو عشر ساعات في قطار النوم. ومعظم الرحلات النيلية تبدأ من هنا أو تنتهي هنا.",
    },
    accommodationNote: {
      en: "East bank keeps you near restaurants and the night-lit temple. West bank guesthouses trade convenience for silence and field views.",
      ar: "البر الشرقي تبقيك قريبًا من المطاعم ومن المعبد المضاء ليلًا. أما بيوت الضيافة على البر الغربي فتمنحك، بدل الرفاهية، سكونًا وإطلالة على الحقول.",
    },
    relatedSlugs: ["aswan", "giza", "hurghada"],
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
      ar: "شتاء دافئ جاف وأمسيات لطيفة، وهذا بالضبط ما جعل أسوان مشتًى منذ البداية.",
    },
    recommendedDays: { min: 2, max: 4 },
    nightlyRates: { essential: 45, comfort: 100, premium: 210, luxury: 460 },
    dailyBudgetFrom: 85,
    intro: {
      en: "The river widens here, breaks around granite islands and turns a deep, unhurried blue. Aswan is the softest city in Egypt: Nubian villages painted in blocks of colour, a temple moved stone by stone to escape a rising lake, and afternoons that ask nothing of you but a sail.",
      ar: "هنا يتسع النهر ويتفرع حول جزر من الجرانيت، ويصير أزرق عميقًا لا يستعجل شيئًا. أسوان أرقّ مدن مصر: قرى نوبية مطلية بكتل من الألوان، ومعبد نُقل حجرًا حجرًا هربًا من بحيرة صاعدة، وأصائل لا تحتاج فيها إلى أكثر من شراع.",
    },
    heroImage: {
      src: "/images/destinations/aswan-hero.webp",
      alt: { en: "Feluccas among the granite islands at Aswan", ar: "فلايك بين جزر الجرانيت في أسوان" },
    },
    gallery: [
      { src: "/images/destinations/aswan-01.webp", alt: { en: "A painted Nubian house at Gharb Soheil", ar: "بيت نوبي ملوّن في غرب سهيل" } },
      { src: "/images/destinations/aswan-02.webp", alt: { en: "The Temple of Philae on its island", ar: "معبد فيلة على جزيرته" } },
      { src: "/images/destinations/aswan-03.webp", alt: { en: "Abu Simbel's colossi at sunrise", ar: "تماثيل أبو سمبل عند الشروق" } },
    ],
    attractions: [
      {
        name: { en: "Philae Temple", ar: "معبد فيلة" },
        blurb: {
          en: "Dismantled and rebuilt on higher ground after the High Dam. Reached only by boat, which is half the pleasure.",
          ar: "فُكّ وأُعيد بناؤه على أرض أعلى بعد السد العالي. لا تصله إلا بالقارب، والقارب نصف المتعة.",
        },
      },
      {
        name: { en: "Abu Simbel", ar: "أبو سمبل" },
        blurb: {
          en: "Three hours south, four colossal Ramesses figures cut into a cliff and relocated in the 1960s.",
          ar: "على بعد ثلاث ساعات إلى الجنوب: أربعة تماثيل هائلة لرمسيس منحوتة في الجرف، نُقلت بأكملها في الستينيات.",
        },
      },
      {
        name: { en: "A Nubian village on Elephantine", ar: "قرية نوبية في جزيرة إلفنتين" },
        blurb: {
          en: "Indigo and ochre houses, hibiscus tea, and a pace that makes the mainland feel loud.",
          ar: "بيوت بلون النيلة والمغرة، وكركديه، وإيقاع للحياة يجعل المدينة على الضفة تبدو صاخبة.",
        },
      },
      {
        name: { en: "The Unfinished Obelisk", ar: "المسلة الناقصة" },
        blurb: {
          en: "Still attached to the bedrock it cracked in. The clearest lesson in how granite was actually quarried.",
          ar: "ما زالت ملتصقة بالصخر الذي تشققت فيه، وهي أوضح درس ستراه في كيف كان الجرانيت يُقطع فعلًا.",
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
          ar: "قافلة الفجر أو طيران قصير إلى الجنوب، والعودة بعد الظهر إلى متحف النوبة وعشاء في القرية.",
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
        "أبو سمبل بالسيارة معناها الخروج في نحو الرابعة فجرًا. الطيران أغلى، لكنه يوفر لك نصف يوم.",
        "اتفق على سعر الفلوكة ومدة الإبحار قبل الصعود.",
        "أسوان أفضل مكان في مصر لشراء الكركديه والتمر وخلطات التوابل النوبية.",
      ],
    },
    gettingThere: {
      en: "Ninety minutes by air from Cairo, three hours by train from Luxor, or arrive slowly by river on a Nile cruise.",
      ar: "تسعون دقيقة طيرانًا من القاهرة، أو ثلاث ساعات بالقطار من الأقصر، أو على مهل في رحلة نيلية.",
    },
    accommodationNote: {
      en: "River-facing rooms matter more here than anywhere else in Egypt. Island guesthouses are simpler and unmatched at dusk.",
      ar: "الغرفة المطلة على النهر تهمّ هنا أكثر من أي مكان آخر في مصر. وبيوت الضيافة على الجزر أبسط، لكن لا شيء يضاهيها وقت الغسق.",
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
      ar: "بحيرات ملح وبساتين زيتون ولغة لا يتكلمها غيرها",
    },
    region: "western-desert",
    coordinates: { lat: 29.2041, lng: 25.5195 },
    travelStyles: ["desert", "nature", "romantic"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar", "apr"],
    bestSeasonNote: {
      en: "Autumn and spring are ideal. Nights in December and January drop close to freezing in the dunes.",
      ar: "الخريف والربيع هما الأفضل. أما ليالي ديسمبر ويناير فتقترب من الصفر بين الكثبان.",
    },
    recommendedDays: { min: 3, max: 4 },
    nightlyRates: { essential: 40, comfort: 85, premium: 165, luxury: 340 },
    dailyBudgetFrom: 70,
    intro: {
      en: "Eight hours from Cairo and a world from everywhere else. Siwa speaks Siwi rather than Arabic, builds in salt and mud, floats you in lakes you cannot sink in, and keeps the oracle that told Alexander he was a god.",
      ar: "ثماني ساعات من القاهرة، وعالم آخر بعيد عن كل شيء. سيوة تتكلم السيوية لا العربية، وتبني بيوتها من الملح والطين، وتطفو بك على بحيرات لا يغرق فيها أحد، وتحتفظ بمعبد التنبؤات الذي قال للإسكندر إنه إله.",
    },
    heroImage: {
      src: "/images/destinations/siwa-hero.webp",
      alt: { en: "The Shali fortress at golden hour", ar: "قلعة شالي في الساعة الذهبية" },
    },
    gallery: [
      { src: "/images/destinations/siwa-01.webp", alt: { en: "A salt lake with white crystalline banks", ar: "بحيرة ملحية بضفاف بلورية بيضاء" } },
      { src: "/images/destinations/siwa-02.webp", alt: { en: "Palm groves reflected in an oasis lake", ar: "بساتين نخيل تنعكس في بحيرة الواحة" } },
      { src: "/images/destinations/siwa-03.webp", alt: { en: "Date palm orchards under the hills of Siwa", ar: "بساتين النخيل تحت تلال سيوة" } },
    ],
    attractions: [
      {
        name: { en: "Shali Fortress", ar: "قلعة شالي" },
        blurb: {
          en: "A thirteenth-century town of salt and mud, half melted by rare rain and beautiful for it.",
          ar: "بلدة من القرن الثالث عشر مبنية من الملح والطين، أذابت نصفَها أمطار نادرة فزادتها جمالًا.",
        },
      },
      {
        name: { en: "Temple of the Oracle", ar: "معبد التنبؤات" },
        blurb: {
          en: "Alexander crossed the desert to consult it in 331 BC. The view over the oasis explains the detour.",
          ar: "قطع الإسكندر الصحراء ليستشيره عام 331 قبل الميلاد. والإطلالة من فوقه على الواحة تفسر لك لماذا.",
        },
      },
      {
        name: { en: "Cleopatra's Spring", ar: "عين كليوباترا" },
        blurb: {
          en: "A stone-rimmed natural pool that bubbles cold all day. Modest swimwear is expected.",
          ar: "عين طبيعية مطوّقة بالحجر يتدفق ماؤها باردًا طوال اليوم. وملابس السباحة المحتشمة هي المتوقعة هنا.",
        },
      },
      {
        name: { en: "The Great Sand Sea", ar: "بحر الرمال الأعظم" },
        blurb: {
          en: "Dunes running to the Libyan border, with hot springs and fossil beds hidden between them.",
          ar: "كثبان تمتد حتى الحدود الليبية، تتخللها عيون ساخنة وطبقات من الأحافير.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "The oasis on foot and by bicycle", ar: "الواحة سيرًا وبالدراجة" },
        detail: {
          en: "Shali, the oracle, the old town market, then Fatnas island for the sunset.",
          ar: "شالي ومعبد التنبؤات وسوق البلدة القديمة، ثم جزيرة فطناس عند الغروب.",
        },
      },
      {
        day: 2,
        title: { en: "Great Sand Sea safari", ar: "سفاري بحر الرمال الأعظم" },
        detail: {
          en: "Dune driving, sandboarding, a hot spring at dusk and dinner under the stars.",
          ar: "قيادة فوق الكثبان، وتزلج على الرمال، وعين ساخنة وقت الغسق، وعشاء تحت النجوم.",
        },
      },
      {
        day: 3,
        title: { en: "Salt lakes and slow hours", ar: "البحيرات الملحية وساعات بطيئة" },
        detail: {
          en: "Float in a salt pool, eat in an olive grove, and let the day stay empty.",
          ar: "اطفُ في بحيرة ملح، وتغدَّ في بستان زيتون، واترك بقية اليوم فارغًا.",
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
        "سيوة بلدة محافظة. غطِّ كتفيك وركبتيك خارج مسابح الفنادق، واستأذن قبل أن تصوّر أحدًا.",
        "الدفع بالبطاقة نادر هنا. خذ معك من القاهرة أو الإسكندرية كل ما تتوقع أن تحتاجه من نقد.",
        "رحلات السفاري لا تكون إلا مع مرشد محلي مرخّص. والدخول بسيارتك وحدك إلى بحر الرمال ممنوع.",
      ],
    },
    gettingThere: {
      en: "Eight to nine hours by road from Cairo, four from Marsa Matrouh on the coast. There is no airport, and that is part of the appeal.",
      ar: "من ثماني إلى تسع ساعات بالسيارة من القاهرة، أو أربع من مرسى مطروح على الساحل. لا مطار هناك، وهذا جزء من سحرها.",
    },
    accommodationNote: {
      en: "Eco-lodges built from salt rock and palm run without mains electricity and are the reason most people come. Bring a torch.",
      ar: "النُّزل البيئية المبنية من صخر الملح وجذوع النخيل تعيش بلا كهرباء من الشبكة، وهي ما يأتي معظم الزوار من أجله. خذ معك مصباحًا.",
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
      ar: "غوص على الشعاب وصحراء في الأصيل نفسه",
    },
    region: "red-sea",
    coordinates: { lat: 27.2579, lng: 33.8116 },
    travelStyles: ["beach", "family", "nature"],
    bestSeason: ["jan", "feb", "mar", "apr", "may", "jun", "sep", "oct", "nov", "dec"],
    bestSeasonNote: {
      en: "Swimmable all year. Spring and autumn give warm water without the July heat on land.",
      ar: "تصلح للسباحة طوال العام. والربيع والخريف يعطيانك ماءً دافئًا من غير حرّ يوليو على البر.",
    },
    recommendedDays: { min: 3, max: 6 },
    nightlyRates: { essential: 40, comfort: 95, premium: 190, luxury: 400 },
    dailyBudgetFrom: 70,
    intro: {
      en: "A working fishing town that turned into Egypt's most practical Red Sea base. Reefs start twenty minutes offshore, the mountains behind town open into desert within half an hour, and it is the easiest coast to reach from Luxor.",
      ar: "قرية صيادين صارت أكثر قواعد البحر الأحمر عملية في مصر. الشعاب تبدأ على بعد عشرين دقيقة من الشاطئ، والجبال خلف المدينة تفتح لك الصحراء في نصف ساعة، وهي أقرب ساحل تصله من الأقصر.",
    },
    heroImage: {
      src: "/images/destinations/hurghada-hero.webp",
      alt: { en: "Table corals on a Red Sea reef", ar: "مرجان مائدي على شعاب البحر الأحمر" },
    },
    gallery: [
      { src: "/images/destinations/hurghada-01.webp", alt: { en: "A dive boat moored above coral", ar: "قارب غوص راسٍ فوق الشعاب" } },
      { src: "/images/destinations/hurghada-02.webp", alt: { en: "Giftun Island sandbank", ar: "لسان رملي في جزيرة الجفتون" } },
      { src: "/images/destinations/hurghada-03.webp", alt: { en: "A track through the Eastern Desert mountains", ar: "مسار بين جبال الصحراء الشرقية" } },
    ],
    attractions: [
      {
        name: { en: "Giftun Island", ar: "جزيرة الجفتون" },
        blurb: {
          en: "Protected sandbanks and shallow reef, the standard and still the best day out on the water.",
          ar: "ألسنة رملية محمية وشعاب ضحلة. هي الرحلة البحرية التي يذهب إليها الجميع، وما زالت الأفضل.",
        },
      },
      {
        name: { en: "Abu Nuhas wrecks", ar: "حطام أبو نحاس" },
        blurb: {
          en: "Four cargo ships on one reef, shallow enough that several are open to advanced open-water divers.",
          ar: "أربع سفن شحن غارقة على شعبة واحدة، وعمقها يسمح لحاملي رخصة المياه المفتوحة المتقدمة بالنزول إلى عدد منها.",
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
          ar: "مضارب بدوية ودروب في الأودية، تبدأ على بعد نصف ساعة إلى الداخل.",
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
          ar: "صباح كسول، ثم مشوار بالسيارة في الأودية إلى الداخل، وشاي بدوي ومشاهدة للنجوم بعد العشاء.",
        },
      },
      {
        day: 3,
        title: { en: "Open water or open schedule", ar: "مياه مفتوحة أو جدول مفتوح" },
        detail: {
          en: "A wreck dive at Abu Nuhas, or nothing at all beyond the house reef.",
          ar: "غوصة على حطام أبو نحاس، أو لا شيء على الإطلاق سوى شعاب الفندق.",
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
        "واقي الشمس الآمن للشعاب فقط. المحميات البحرية المصرية تشدد على ذلك، والشعاب هي كل ما جئت من أجله.",
        "اترك أربعًا وعشرين ساعة بين آخر غوصة وأي رحلة طيران.",
        "شواطئ الفنادق تتفاوت تفاوتًا كبيرًا. اسأل هل تنزل إلى الشعاب من سلّم أم من الرمل.",
      ],
    },
    gettingThere: {
      en: "Direct flights from Cairo and much of Europe, or four hours by road from Luxor across the Eastern Desert.",
      ar: "رحلات مباشرة من القاهرة ومن معظم أوروبا، أو أربع ساعات برًا من الأقصر عبر الصحراء الشرقية.",
    },
    accommodationNote: {
      en: "Sahl Hasheesh and Makadi Bay are quieter and newer. Staying in town costs less and puts you nearer real restaurants.",
      ar: "سهل حشيش ومكادي باي أهدأ وأحدث. أما الإقامة في المدينة نفسها فأرخص وأقرب إلى المطاعم الحقيقية.",
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
      ar: "جدار الشعاب الذي يُقاس به كل ما في البحر الأحمر",
    },
    region: "red-sea",
    coordinates: { lat: 27.9158, lng: 34.33 },
    travelStyles: ["beach", "luxury", "family", "nature"],
    bestSeason: [
      "jan", "feb", "mar", "apr", "may", "jun",
      "jul", "aug", "sep", "oct", "nov", "dec",
    ],
    bestSeasonNote: {
      en: "A genuine year-round destination. Water stays above 21°C in winter and the desert air keeps summer bearable.",
      ar: "وجهة للعام كله بحق. الماء لا تنزل حرارته عن 21 درجة في الشتاء، وهواء الصحراء يجعل الصيف محتملًا.",
    },
    recommendedDays: { min: 4, max: 7 },
    nightlyRates: { essential: 50, comfort: 115, premium: 230, luxury: 520 },
    dailyBudgetFrom: 85,
    intro: {
      en: "Ras Mohammed drops from ankle-deep coral to a blue wall in a single step, which is why divers have come here for fifty years. Above the water, Sinai's mountains give you St Catherine, a sunrise from Mount Sinai, and desert that starts where the marina ends.",
      ar: "في رأس محمد تهبط الشعاب من ماء لا يغطي الكاحل إلى جدار أزرق في خطوة واحدة، ولهذا يقصدها الغواصون منذ خمسين سنة. وفوق الماء تعطيك جبال سيناء دير سانت كاترين، وشروقًا من قمة الجبل، وصحراء تبدأ حيث تنتهي المارينا.",
    },
    heroImage: {
      src: "/images/destinations/sharm-hero.webp",
      alt: { en: "The Sinai shore at Sharm El Sheikh", ar: "ساحل سيناء في شرم الشيخ" },
    },
    gallery: [
      { src: "/images/destinations/sharm-01.webp", alt: { en: "Coral garden in shallow water", ar: "حديقة مرجانية في مياه ضحلة" } },
      { src: "/images/destinations/sharm-02.webp", alt: { en: "The red mountains of southern Sinai", ar: "الجبال الحمراء في جنوب سيناء" } },
      { src: "/images/destinations/sharm-03.webp", alt: { en: "A bay on the Sharm coast in the evening light", ar: "خليج على ساحل شرم في ضوء المساء" } },
    ],
    attractions: [
      {
        name: { en: "Ras Mohammed National Park", ar: "محمية رأس محمد" },
        blurb: {
          en: "Egypt's first national park, where two seas meet over a vertical reef wall.",
          ar: "أول محمية طبيعية في مصر، حيث يلتقي بحران فوق جدار مرجاني عمودي.",
        },
      },
      {
        name: { en: "The SS Thistlegorm", ar: "حطام الثيستلجورم" },
        blurb: {
          en: "A 1941 wreck still holding motorcycles and trucks in its holds. Among the finest dives anywhere.",
          ar: "سفينة غرقت عام 1941 وما زالت عنابرها مليئة بالدراجات النارية والشاحنات. من أعظم مواقع الغوص في العالم.",
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
          ar: "مشوار ليلي بالسيارة إلى الداخل، وصعود ثلاث ساعات، وشروق فوق جبال سيناء.",
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
          ar: "يوم بحري طويل إلى الثيستلجورم، أو الشاطئ والمارينا ليلًا.",
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
        "ممنوع أخذ أي شيء من رأس محمد، حتى الأصداف وكسر المرجان. وحراس المحمية يفتشون الحقائب فعلًا.",
        "الثيستلجورم يوم طويل يبدأ قبل الخامسة فجرًا. يستحق العناء، لكن لا تجعله يومك الأخير.",
        "قمة جبل موسى باردة قبل الفجر حتى في الصيف. خذ معك سترة ما كنت لتفكر في حزمها.",
      ],
    },
    gettingThere: {
      en: "Direct flights from Cairo and Europe into Sharm El Sheikh International, fifteen minutes from most bays.",
      ar: "رحلات مباشرة من القاهرة وأوروبا إلى مطار شرم الشيخ الدولي، الذي يبعد ربع ساعة عن معظم الخلجان.",
    },
    accommodationNote: {
      en: "Nabq is calm and family-led, Naama Bay is walkable and lively, Om El Seid sits high with the widest views.",
      ar: "نبق هادئة وتناسب العائلات، وخليج نعمة كل شيء فيه على مسافة مشي وفيه حياة، وأم السيد على مرتفع ولها أوسع الإطلالات.",
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
    // The protectorate itself, on the road between Farafra and Bahariya.
    coordinates: { lat: 27.33, lng: 28.17 },
    travelStyles: ["desert", "nature", "romantic"],
    bestSeason: ["oct", "nov", "dec", "jan", "feb", "mar"],
    bestSeasonNote: {
      en: "Camping season runs October to March. Summer nights stay hot and the daytime sun is genuinely dangerous.",
      ar: "موسم التخييم من أكتوبر إلى مارس. ليالي الصيف تظل حارة، وشمس النهار فيه خطر حقيقي.",
    },
    recommendedDays: { min: 2, max: 3 },
    nightlyRates: { essential: 60, comfort: 110, premium: 180, luxury: 300 },
    dailyBudgetFrom: 105,
    intro: {
      en: "The route runs from Bahariya, on the Giza side, into the White Desert protectorate in New Valley. Wind has spent millennia carving a chalk plateau into mushrooms, towers and animals, and left them white against orange sand. You come to sleep here. One night in a desert camp, with no light for two hundred kilometres, is the reason this place is on the list.",
      ar: "يمتد الطريق من الواحات البحرية في جهة الجيزة إلى محمية الصحراء البيضاء في الوادي الجديد. آلاف السنين والرياح تنحت هضبة من الطباشير إلى فطر وأبراج وحيوانات، ثم تركتها بيضاء فوق رمل برتقالي. أنت تأتي إلى هنا لتنام: ليلة واحدة في مخيم صحراوي، بلا ضوء واحد على مدى مئتي كيلومتر، هي سبب وجود هذا المكان في القائمة.",
    },
    heroImage: {
      src: "/images/destinations/white-desert-hero.webp",
      alt: { en: "Chalk formations glowing at sunset in the White Desert", ar: "تكوينات طباشيرية تتوهج عند الغروب في الصحراء البيضاء" },
    },
    gallery: [
      { src: "/images/destinations/white-desert-01.webp", alt: { en: "Chalk pillars rising from the desert floor", ar: "أعمدة طباشيرية تنهض من أرض الصحراء" } },
      { src: "/images/destinations/white-desert-02.webp", alt: { en: "Late light over the Bahariya escarpment", ar: "ضوء آخر النهار فوق حافة الواحات البحرية" } },
      { src: "/images/destinations/white-desert-03.webp", alt: { en: "A black basalt cone in the Black Desert", ar: "مخروط بازلتي أسود في الصحراء السوداء" } },
    ],
    attractions: [
      {
        name: { en: "The chalk formations", ar: "التكوينات الطباشيرية" },
        blurb: {
          en: "Named shapes like the Chicken and the Mushroom, best photographed in the last hour of light.",
          ar: "أشكال لها أسماء، كالدجاجة وعش الغراب، وأفضل وقت لتصويرها آخر ساعة من الضوء.",
        },
      },
      {
        name: { en: "The Black Desert", ar: "الصحراء السوداء" },
        blurb: {
          en: "Volcanic hills coated in dark basalt, passed on the drive in from Bahariya.",
          ar: "تلال بركانية مغطاة ببازلت داكن، تمر بها في الطريق من الواحات البحرية.",
        },
      },
      {
        name: { en: "Crystal Mountain", ar: "جبل الكريستال" },
        blurb: {
          en: "A ridge of quartz crystal with a natural arch, a short stop that catches the sun.",
          ar: "نتوء من بلورات الكوارتز فيه قوس طبيعي، وقفة قصيرة يتلألأ فيها الحجر تحت الشمس.",
        },
      },
      {
        name: { en: "Bahariya Oasis", ar: "الواحات البحرية" },
        blurb: {
          en: "The gateway oasis, four hours from Cairo and still inside Giza governorate. Hot springs, and the Valley of the Golden Mummies nearby.",
          ar: "واحة البوابة، على بعد أربع ساعات من القاهرة ولا تزال تتبع محافظة الجيزة. فيها عيون ساخنة، ووادي المومياوات الذهبية على مقربة منها.",
        },
      },
    ],
    suggestedItinerary: [
      {
        day: 1,
        title: { en: "Drive in and camp", ar: "الوصول والتخييم" },
        detail: {
          en: "Cairo to Bahariya, the Black Desert and Crystal Mountain on the way, camp set up before sunset.",
          ar: "من القاهرة إلى الواحات البحرية، مرورًا بالصحراء السوداء وجبل الكريستال، ونصب المخيم قبل الغروب.",
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
        "هذا تخييم لا فندق. كل ما هناك حصيرة ونار وخيمة مشتركة ودورة مياه على الطريقة الصحراوية.",
        "ليالي يناير في الصحراء تقترب من الصفر. المخيمات توفر البطاطين، لكن خذ معك شيئًا دافئًا على أي حال.",
        "خذ معك كل قطعة قمامة عند المغادرة. فالتكوينات داخل محمية طبيعية.",
      ],
    },
    gettingThere: {
      en: "Four to five hours by road from Cairo to Bahariya Oasis, then four-wheel drive only beyond the tarmac.",
      ar: "من أربع إلى خمس ساعات بالسيارة من القاهرة إلى الواحات البحرية، ثم لا شيء غير الدفع الرباعي بعد أن ينتهي الأسفلت.",
    },
    accommodationNote: {
      en: "Overnight is a guided desert camp. Comfort tiers add private tents, proper bedding and a cook rather than a building.",
      ar: "المبيت في مخيم صحراوي مع مرشد. والفئات الأعلى تعني خيامًا خاصة وفرشًا أفضل وطاهيًا، لا مباني.",
    },
    relatedSlugs: ["siwa-oasis", "fayoum", "giza"],
    accent: "#7c6144",
  },
];

export const destinationBySlug = new Map(destinations.map((d) => [d.slug, d]));

/**
 * The six the homepage leads with, chosen to show the whole country rather
 * than the six most famous names: the pharaonic core (Giza, Luxor), the
 * softer south (Aswan), a true oasis (Siwa), the reef coast (Sharm) and the
 * desert nobody expects (White Desert). Cairo, Alexandria, Fayoum and
 * Hurghada are strong guides but each repeats a region already represented.
 */
export const homepageDestinationSlugs = [
  "giza",
  "luxor",
  "aswan",
  "siwa-oasis",
  "sharm-el-sheikh",
  "white-desert",
] as const;

export const homepageDestinations = homepageDestinationSlugs.map((slug) => {
  const destination = destinationBySlug.get(slug);
  if (!destination) throw new Error(`Unknown homepage destination: ${slug}`);
  return destination;
});
