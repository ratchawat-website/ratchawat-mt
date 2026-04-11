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
    name: "Private Group 2-3 (Adult)",
    nameShort: "Private Group",
    category: "private-adult",
    price: 600,
    currency: "THB",
    unit: "person/session",
    description: "Private session for 2-3 people with one trainer. Price per person.",
    includes: [
      "60 minutes with 1 trainer",
      "For 2-3 participants",
      "All equipment provided",
    ],
    notes: "Price per person. Minimum 2 participants.",
    bookingType: "private",
  },

  // --- PRIVATE LESSONS (KIDS) ---
  {
    id: "private-kids-solo",
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
    name: "Private Group 2-3 (Kids)",
    nameShort: "Private Kids Group",
    category: "private-kids",
    price: 400,
    currency: "THB",
    unit: "kid/session",
    description: "Private kids session for 2-3 children with one trainer. Price per kid.",
    includes: [
      "60 minutes with 1 trainer",
      "For 2-3 kids aged 8-13",
      "All equipment provided",
    ],
    notes: "Price per kid. Minimum 2 participants.",
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
    name: "Camp Stay — 1 Week",
    nameShort: "Camp Stay 1 Week",
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
    name: "Camp Stay — 2 Weeks",
    nameShort: "Camp Stay 2 Weeks",
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
    name: "Camp Stay - 1 Month (Bungalow)",
    nameShort: "Camp Stay 1 Month (Bungalow)",
    category: "camp-stay",
    price: 23000,
    currency: "THB",
    unit: "month",
    description: "1 month training + private bungalow at Plai Laem. King bed, kitchenette, private terrace over pool. Limited availability (4 bungalows).",
    includes: [
      "30 nights in a private bungalow at Plai Laem",
      "Unlimited group training sessions",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity charged separately. Limited to 4 bungalows.",
    bookingType: "camp-stay",
  },

  // --- FIGHTER PROGRAM + ACCOMMODATION ---
  {
    id: "fighter-stay-room-monthly",
    name: "Fighter Program + Room (Monthly)",
    nameShort: "Fighter + Room",
    category: "camp-stay",
    price: 20000,
    priceTodo: "Approximate price - pending client confirmation",
    currency: "THB",
    unit: "month",
    description: "Fighter program plus standard room at Plai Laem for 1 month. All-in-one tier for serious athletes.",
    includes: [
      "Fighter program (2x/day training, weekly stretch/yoga, weekly ice bath, fight organization, fight support)",
      "30 nights in a standard room at Plai Laem",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity charged separately. Price pending final client confirmation.",
    bookingType: "fighter",
  },
  {
    id: "fighter-stay-bungalow-monthly",
    name: "Fighter Program + Bungalow (Monthly)",
    nameShort: "Fighter + Bungalow",
    category: "camp-stay",
    price: 25000,
    priceTodo: "Approximate price - pending client confirmation",
    currency: "THB",
    unit: "month",
    description: "Fighter program plus private bungalow at Plai Laem for 1 month. Premium tier with full kitchenette and terrace.",
    includes: [
      "Fighter program (2x/day training, weekly stretch/yoga, weekly ice bath, fight organization, fight support)",
      "30 nights in a private bungalow at Plai Laem",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity charged separately. Limited to 4 bungalows. Price pending final client confirmation.",
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
    ? `${item.price.toLocaleString()} THB`
    : (item.priceTodo ?? "Contact us");
