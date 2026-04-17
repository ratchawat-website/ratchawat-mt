export type BookingType =
  | "training"
  | "private"
  | "camp-stay"
  | "fighter";

export type PriceCategory =
  | "group"
  | "kids"
  | "resident"
  | "private-adult"
  | "private-kids"
  | "bodyweight"
  | "fighter"
  | "accommodation"
  | "camp-stay";

export interface PriceItem {
  id: string;
  name: string;
  nameShort: string;
  category: PriceCategory;
  price: number | null;
  priceTodo?: string;
  currency: "THB";
  unit: string;
  description: string;
  includes: string[];
  notes?: string;
  popular?: boolean;
  bookingType: BookingType;
  stripeProductId?: string;
  stripePriceId?: string;
}

export const PRICES: PriceItem[] = [
  // --- GROUP TRAINING (ADULT) ---
  {
    id: "drop-in-adult",
    stripeProductId: "prod_UJh4fbwG6ygUrF",
    stripePriceId: "price_1TL3gARu1Uc6NzUvSgLsgmaY",
    name: "Drop-in Session (Adult)",
    nameShort: "Drop-in",
    category: "group",
    price: 400,
    currency: "THB",
    unit: "session",
    description: "Single group Muay Thai class. Morning or afternoon. No commitment.",
    includes: [
      "1 group class (morning or afternoon)",
      "All equipment provided",
      "Access to Bo Phut or Plai Laem",
    ],
    bookingType: "training",
  },
  {
    id: "weekly-1x",
    stripeProductId: "prod_UJh4CP5HQSTSqk",
    stripePriceId: "price_1TL3gBRu1Uc6NzUv83Hbyk6Y",
    name: "1 Week — 1 Session/Day",
    nameShort: "1 Week (1x/day)",
    category: "group",
    price: 2000,
    currency: "THB",
    unit: "week",
    description: "One week of training, one session per day (5 days).",
    includes: [
      "5 group sessions",
      "Morning or afternoon choice",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },
  {
    id: "weekly-2x",
    stripeProductId: "prod_UJh4QBRiRLrJt7",
    stripePriceId: "price_1TL3gBRu1Uc6NzUv8rRlkrBC",
    name: "1 Week — 2 Sessions/Day",
    nameShort: "1 Week (2x/day)",
    category: "group",
    price: 3000,
    currency: "THB",
    unit: "week",
    description: "One week of training, morning and afternoon every day.",
    includes: [
      "10 group sessions",
      "Morning + afternoon",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },
  {
    id: "biweekly-1x",
    stripeProductId: "prod_UJh4VvVcXVZEc5",
    stripePriceId: "price_1TL3gCRu1Uc6NzUvijdQUZ76",
    name: "2 Weeks — 1 Session/Day",
    nameShort: "2 Weeks (1x/day)",
    category: "group",
    price: 3500,
    currency: "THB",
    unit: "2 weeks",
    description: "Two weeks of training, one session per day.",
    includes: [
      "10 group sessions",
      "Morning or afternoon choice",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },
  {
    id: "biweekly-2x",
    stripeProductId: "prod_UJh4USRFja6dBB",
    stripePriceId: "price_1TL3gDRu1Uc6NzUv1JfSXzm5",
    name: "2 Weeks — 2 Sessions/Day",
    nameShort: "2 Weeks (2x/day)",
    category: "group",
    price: 5500,
    currency: "THB",
    unit: "2 weeks",
    description: "Two weeks of training, morning and afternoon every day.",
    includes: [
      "20 group sessions",
      "Morning + afternoon",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },
  {
    id: "monthly-1x",
    stripeProductId: "prod_UJh4tcv5VCdNFj",
    stripePriceId: "price_1TL3gERu1Uc6NzUvwlwr6UwK",
    name: "Monthly — 1 Session/Day",
    nameShort: "Monthly (1x/day)",
    category: "group",
    price: 5500,
    currency: "THB",
    unit: "month",
    description: "One month of training, one session per day. Best value for regular training.",
    includes: [
      "Unlimited 1x/day group sessions",
      "Morning or afternoon choice",
      "All equipment provided",
      "Both locations",
    ],
    popular: true,
    bookingType: "training",
  },
  {
    id: "monthly-2x",
    stripeProductId: "prod_UJh4L3MEKITK8L",
    stripePriceId: "price_1TL3gFRu1Uc6NzUvLOHIOWeb",
    name: "Monthly — 2 Sessions/Day",
    nameShort: "Monthly (2x/day)",
    category: "group",
    price: 7000,
    currency: "THB",
    unit: "month",
    description: "One month of training, morning and afternoon every day. Maximum progress.",
    includes: [
      "Unlimited 2x/day group sessions",
      "Morning + afternoon",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },

  // --- GROUP TRAINING (KIDS 8-13) ---
  {
    id: "drop-in-kids",
    stripeProductId: "prod_UJh4gSFTIJxxtY",
    stripePriceId: "price_1TL3gHRu1Uc6NzUvM8naG1Zn",
    name: "Drop-in Session (Kids 8-13)",
    nameShort: "Kids Drop-in",
    category: "kids",
    price: 300,
    currency: "THB",
    unit: "session",
    description: "Single kids Muay Thai class. Ages 8-13.",
    includes: [
      "1 kids group class",
      "All equipment provided",
      "Dedicated kids trainer",
    ],
    bookingType: "training",
  },
  {
    id: "monthly-kids",
    stripeProductId: "prod_UJh4xE2AR2ebdg",
    stripePriceId: "price_1TL3gHRu1Uc6NzUvzC4sqdAr",
    name: "Monthly Unlimited (Kids 8-13)",
    nameShort: "Kids Monthly",
    category: "kids",
    price: 2500,
    currency: "THB",
    unit: "month",
    description: "Unlimited kids group sessions for one month. Ages 8-13.",
    includes: [
      "Unlimited kids group sessions",
      "All equipment provided",
      "Progress tracking",
    ],
    popular: true,
    bookingType: "training",
  },

  // --- RESIDENT (KOH SAMUI) ---
  {
    id: "resident-10",
    stripeProductId: "prod_UJh4ul51Pe9DJz",
    stripePriceId: "price_1TL3gIRu1Uc6NzUvH77Uf9pM",
    name: "Resident 10 Classes",
    nameShort: "Resident 10x",
    category: "resident",
    price: 3000,
    currency: "THB",
    unit: "10 classes",
    description: "For Koh Samui residents. 10-class punch card, no expiry.",
    includes: [
      "10 group sessions",
      "Both locations",
      "All equipment provided",
    ],
    notes: "Proof of Koh Samui residency required.",
    bookingType: "training",
  },
  {
    id: "resident-20",
    stripeProductId: "prod_UJh4bqa2s1V8Ra",
    stripePriceId: "price_1TL3gJRu1Uc6NzUvVC2DjREX",
    name: "Resident 20 Classes",
    nameShort: "Resident 20x",
    category: "resident",
    price: 5500,
    currency: "THB",
    unit: "20 classes",
    description: "For Koh Samui residents. 20-class punch card, no expiry. Best resident value.",
    includes: [
      "20 group sessions",
      "Both locations",
      "All equipment provided",
    ],
    notes: "Proof of Koh Samui residency required.",
    popular: true,
    bookingType: "training",
  },

  // --- PRIVATE LESSONS (ADULT) ---
  {
    id: "private-adult-solo",
    stripeProductId: "prod_UJh4kc75JQna2q",
    stripePriceId: "price_1TL3gKRu1Uc6NzUvwM0juIF7",
    name: "Private Lesson 1-on-1 (Adult)",
    nameShort: "Private 1-on-1",
    category: "private-adult",
    price: 800,
    currency: "THB",
    unit: "session",
    description: "60-minute private session with a dedicated trainer. Fully personalized.",
    includes: [
      "60 minutes 1-on-1",
      "Tailored to your level and goals",
      "All equipment provided",
    ],
    bookingType: "private",
  },
  {
    id: "private-adult-group",
    stripeProductId: "prod_UJh47v38QjpAfA",
    stripePriceId: "price_1TL3gLRu1Uc6NzUvLoCZSVze",
    name: "Private Group 2-3 (Adult)",
    nameShort: "Private Group",
    category: "private-adult",
    price: 600,
    currency: "THB",
    unit: "person/session",
    description: "Private session for 2-3 people with one trainer (3 people max). Price per person.",
    includes: [
      "60 minutes with 1 trainer",
      "For 2-3 participants (3 max)",
      "All equipment provided",
    ],
    notes: "Price per person. Minimum 2, maximum 3 participants.",
    bookingType: "private",
  },

  // --- PRIVATE LESSONS (KIDS) ---
  {
    id: "private-kids-solo",
    stripeProductId: "prod_UJh4BkRQsTY603",
    stripePriceId: "price_1TL3gMRu1Uc6NzUvFopE0wpO",
    name: "Private Lesson 1-on-1 (Kids)",
    nameShort: "Private Kids 1-on-1",
    category: "private-kids",
    price: 600,
    currency: "THB",
    unit: "session",
    description: "60-minute private kids session. Ages 8-13. Focused individual attention.",
    includes: [
      "60 minutes 1-on-1",
      "Kids-specific training",
      "All equipment provided",
    ],
    bookingType: "private",
  },
  {
    id: "private-kids-group",
    stripeProductId: "prod_UJh4A9p61wAlWG",
    stripePriceId: "price_1TL3gNRu1Uc6NzUv0rpMvyh7",
    name: "Private Group 2-3 (Kids)",
    nameShort: "Private Kids Group",
    category: "private-kids",
    price: 400,
    currency: "THB",
    unit: "kid/session",
    description: "Private kids session for 2-3 children with one trainer (3 kids max). Price per kid.",
    includes: [
      "60 minutes with 1 trainer",
      "For 2-3 kids aged 3-13 (3 max)",
      "All equipment provided",
    ],
    notes: "Price per kid. Minimum 2, maximum 3 participants. Under 8, private only.",
    bookingType: "private",
  },

  // --- BODYWEIGHT AREA ---
  {
    id: "bodyweight-dropin",
    name: "Bodyweight Area Drop-in",
    nameShort: "Bodyweight Drop-in",
    category: "bodyweight",
    price: 100,
    currency: "THB",
    unit: "session",
    description: "Access to the bodyweight training area with equipment. No class, train at your own pace.",
    includes: [
      "Full equipment access",
      "Bodyweight area",
    ],
    bookingType: "training",
  },
  {
    id: "bodyweight-monthly",
    name: "Bodyweight Area Monthly",
    nameShort: "Bodyweight Monthly",
    category: "bodyweight",
    price: 900,
    currency: "THB",
    unit: "month",
    description: "Unlimited monthly access to the bodyweight training area with equipment.",
    includes: [
      "Unlimited equipment access",
      "Bodyweight area",
    ],
    bookingType: "training",
  },

  // --- FIGHTER PROGRAM ---
  {
    id: "fighter-monthly",
    stripeProductId: "prod_UJh4O6smKPIYsg",
    stripePriceId: "price_1TL3gNRu1Uc6NzUvzlmTzvWd",
    name: "Fighter Program (Monthly)",
    nameShort: "Fighter Program",
    category: "fighter",
    price: 9500,
    currency: "THB",
    unit: "month",
    description: "Intensive monthly fighter program for athletes preparing to compete.",
    includes: [
      "Training 2x per day",
      "Weekly stretch and yoga class",
      "Weekly ice bath",
      "Fight organization and matchmaking",
      "Corner support on fight day",
      "Full conditioning program",
    ],
    bookingType: "fighter",
  },

  // --- ACCOMMODATION + TRAINING (PLAI LAEM ONLY) ---
  {
    id: "camp-stay-1week",
    stripeProductId: "prod_UJh4o6oaXIjRTW",
    stripePriceId: "price_1TL3gORu1Uc6NzUvnurFcy0E",
    name: "Camp Stay — 1 Week (Room)",
    nameShort: "Camp Stay 1 Week (Room)",
    category: "camp-stay",
    price: 8000,
    currency: "THB",
    unit: "week",
    description: "1 week training + accommodation at Plai Laem. All-inclusive except food.",
    includes: [
      "7 nights accommodation at Plai Laem",
      "Unlimited group training sessions",
      "Electricity included",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity included for weekly stays.",
    bookingType: "camp-stay",
  },
  {
    id: "camp-stay-2weeks",
    stripeProductId: "prod_UJh45hlO9IayCF",
    stripePriceId: "price_1TL3gPRu1Uc6NzUvg1pqGorN",
    name: "Camp Stay — 2 Weeks (Room)",
    nameShort: "Camp Stay 2 Weeks (Room)",
    category: "camp-stay",
    price: 15000,
    currency: "THB",
    unit: "2 weeks",
    description: "2 weeks training + accommodation at Plai Laem.",
    includes: [
      "14 nights accommodation at Plai Laem",
      "Unlimited group training sessions",
      "Electricity included",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity included for weekly stays.",
    popular: true,
    bookingType: "camp-stay",
  },
  {
    id: "camp-stay-1month",
    stripeProductId: "prod_UJh4aT5o6LteUz",
    stripePriceId: "price_1TL3gQRu1Uc6NzUvxoKyvZpw",
    name: "Camp Stay - 1 Month (Room)",
    nameShort: "Camp Stay 1 Month (Room)",
    category: "camp-stay",
    price: 18000,
    currency: "THB",
    unit: "month",
    description: "1 month training + standard room at Plai Laem. Best long-stay value.",
    includes: [
      "30 nights in a standard room at Plai Laem",
      "Unlimited group training sessions",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity charged separately for monthly stays.",
    bookingType: "camp-stay",
  },
  {
    id: "camp-stay-bungalow-monthly",
    stripeProductId: "prod_UJh4vu405OIsux",
    stripePriceId: "price_1TL3gRRu1Uc6NzUvjfriPKij",
    name: "Camp Stay - 1 Month (Bungalow)",
    nameShort: "Camp Stay 1 Month (Bungalow)",
    category: "camp-stay",
    price: 23000,
    currency: "THB",
    unit: "month",
    description: "1 month training + the private bungalow at Plai Laem. King bed, kitchenette, private terrace over the pool. Only 1 bungalow available on-site.",
    includes: [
      "30 nights in the private bungalow at Plai Laem",
      "Unlimited group training sessions",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity charged separately. Only 1 bungalow available.",
    bookingType: "camp-stay",
  },

  // --- FIGHTER PROGRAM + ACCOMMODATION ---
  {
    id: "fighter-stay-room-monthly",
    stripeProductId: "prod_UJh4sXBzENDjwN",
    stripePriceId: "price_1TL3gSRu1Uc6NzUvgqxHaCps",
    name: "Fighter Program + Room (Monthly)",
    nameShort: "Fighter + Room",
    category: "camp-stay",
    price: 20000,
    currency: "THB",
    unit: "month",
    description: "Fighter program plus standard room at Plai Laem for 1 month. All-in-one tier for serious athletes.",
    includes: [
      "Fighter program (2x/day training, weekly stretch/yoga, weekly ice bath, fight organization, fight support)",
      "30 nights in a standard room at Plai Laem",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity charged separately.",
    bookingType: "fighter",
  },
  {
    id: "fighter-stay-bungalow-monthly",
    stripeProductId: "prod_UJh4Z54nNAmlWn",
    stripePriceId: "price_1TL3gTRu1Uc6NzUvatELfWUz",
    name: "Fighter Program + Bungalow (Monthly)",
    nameShort: "Fighter + Bungalow",
    category: "camp-stay",
    price: 25500,
    currency: "THB",
    unit: "month",
    description: "Fighter program plus the private bungalow at Plai Laem for 1 month. Premium tier with full kitchenette and terrace. Only 1 bungalow on-site.",
    includes: [
      "Fighter program (2x/day training, weekly stretch/yoga, weekly ice bath, fight organization, fight support)",
      "30 nights in the private bungalow at Plai Laem",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity charged separately. Only 1 bungalow available on-site.",
    bookingType: "fighter",
  },
];

// Convenience helpers
export const getPriceById = (id: string): PriceItem | undefined =>
  PRICES.find((p) => p.id === id);

export const getPricesByCategory = (category: PriceCategory): PriceItem[] =>
  PRICES.filter((p) => p.category === category);

export const getPricesByBookingType = (type: BookingType): PriceItem[] =>
  PRICES.filter((p) => p.bookingType === type);

export const formatPrice = (item: PriceItem): string =>
  item.price !== null
    ? `${item.price.toLocaleString("en-US")} THB`
    : (item.priceTodo ?? "Contact us");
