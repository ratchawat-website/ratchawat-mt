import { differenceInCalendarDays, parseISO, isValid } from "date-fns";
import {
  getRateCard,
  type StayPlan,
  type StayUnit,
} from "@/content/stay-pricing";

export class StayPricingError extends Error {}

/** Human label for a stay price_id ("stay-room-normal" -> "Standard Room"). */
export function stayLabelFromPriceId(priceId: string): string | null {
  const match = priceId.match(/^stay-(room|bungalow)-(normal|fighter)$/);
  if (!match) return null;
  return getRateCard(match[1] as StayUnit, match[2] as StayPlan)?.label ?? null;
}

export interface StayQuote {
  total: number;
  nights: number;
  tierNights: number;
  basePrice: number;
  extraNights: number;
  extraNightRate: number;
  label: string;
  copyNotes: string[];
}

/** Hotel nights between two yyyy-MM-dd dates (checkout morning frees the night). */
export function stayNights(checkIn: string, checkOut: string): number {
  const start = parseISO(checkIn);
  const end = parseISO(checkOut);
  if (!isValid(start) || !isValid(end)) {
    throw new StayPricingError("Invalid dates.");
  }
  return differenceInCalendarDays(end, start);
}

/**
 * Tiered stay pricing: pick the largest tier whose threshold fits the stay,
 * then add the remaining nights at that tier's extra-night rate.
 */
export function computeStayPrice(
  checkIn: string,
  checkOut: string,
  unit: StayUnit,
  plan: StayPlan,
): StayQuote {
  const card = getRateCard(unit, plan);
  if (!card) {
    throw new StayPricingError("Unknown accommodation option.");
  }
  const nights = stayNights(checkIn, checkOut);
  if (nights < card.minNights) {
    throw new StayPricingError(
      `${card.label} requires a minimum stay of ${card.minNights} nights.`,
    );
  }

  let tier = card.tiers[0];
  for (const t of card.tiers) {
    if (t.nights <= nights) tier = t;
  }

  const extraNights = nights - tier.nights;
  const total = tier.basePrice + extraNights * tier.extraNightRate;

  return {
    total,
    nights,
    tierNights: tier.nights,
    basePrice: tier.basePrice,
    extraNights,
    extraNightRate: tier.extraNightRate,
    label: card.label,
    copyNotes: card.copyNotes,
  };
}
