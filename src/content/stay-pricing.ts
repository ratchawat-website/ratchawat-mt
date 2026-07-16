/**
 * Accommodation pricing grid (July 2026 brief). Single source of truth for
 * stay prices: wizards, /api/checkout/stay, admin, and display pages all
 * read from here. Amounts are charged via Stripe price_data (computed
 * server-side), so editing this file + redeploying is enough to change rates.
 */

export type StayUnit = "room" | "bungalow";
export type StayPlan = "normal" | "fighter";

export interface StayTier {
  /** Tier threshold in nights (hotel logic: checkout morning frees the night). */
  nights: number;
  basePrice: number;
  /** Rate for each night beyond this tier, until the next tier applies. */
  extraNightRate: number;
}

export interface StayRateCard {
  unit: StayUnit;
  plan: StayPlan;
  label: string;
  minNights: number;
  /** Ascending by nights. Pricing picks the largest tier <= stay length. */
  tiers: StayTier[];
  /** Informational copy shown with the price breakdown. No pricing logic. */
  copyNotes: string[];
}

export const STAY_RATE_CARDS: StayRateCard[] = [
  {
    unit: "room",
    plan: "normal",
    label: "Standard Room",
    minNights: 7,
    tiers: [
      { nights: 7, basePrice: 8000, extraNightRate: 1140 },
      { nights: 14, basePrice: 15000, extraNightRate: 1140 },
      { nights: 30, basePrice: 18000, extraNightRate: 600 },
    ],
    copyNotes: [
      "Unlimited group training included (2 sessions per day)",
      "Electricity included for stays under 1 month, charged separately from 1 month",
      "Wi-Fi included",
    ],
  },
  {
    unit: "room",
    plan: "fighter",
    label: "Fighter Program + Standard Room",
    minNights: 30,
    tiers: [{ nights: 30, basePrice: 20000, extraNightRate: 670 }],
    copyNotes: [
      "Full Fighter Program included (2x/day training, yoga, ice bath, fight organization)",
      "Electricity charged separately",
      "Wi-Fi included",
    ],
  },
  {
    unit: "bungalow",
    plan: "normal",
    label: "Private Bungalow",
    minNights: 30,
    tiers: [{ nights: 30, basePrice: 23000, extraNightRate: 760 }],
    copyNotes: [
      "Unlimited group training included (2 sessions per day)",
      "Electricity charged separately",
      "King bed, kitchenette, private terrace. Only 1 bungalow on-site",
    ],
  },
  {
    unit: "bungalow",
    plan: "fighter",
    label: "Fighter Program + Private Bungalow",
    minNights: 30,
    tiers: [{ nights: 30, basePrice: 25500, extraNightRate: 850 }],
    copyNotes: [
      "Full Fighter Program included (2x/day training, yoga, ice bath, fight organization)",
      "Electricity charged separately",
      "Only 1 bungalow on-site",
    ],
  },
];

export function getRateCard(
  unit: StayUnit,
  plan: StayPlan,
): StayRateCard | undefined {
  return STAY_RATE_CARDS.find((c) => c.unit === unit && c.plan === plan);
}

/** price_id stored on bookings rows created by the stay checkout. */
export function stayPriceId(unit: StayUnit, plan: StayPlan): string {
  return `stay-${unit}-${plan}`;
}

// Written by scripts/stripe-seed-products.ts (one permanent Product; each
// checkout attaches a computed price_data amount to it).
export const STAY_STRIPE_PRODUCT_TEST = "prod_UshsAgdTqyTiT1";
export const STAY_STRIPE_PRODUCT_LIVE = "prod_UskxQSrmezEJNQ";

export function getStayStripeProduct(): string {
  const isLive = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ?? false;
  return isLive ? STAY_STRIPE_PRODUCT_LIVE : STAY_STRIPE_PRODUCT_TEST;
}
