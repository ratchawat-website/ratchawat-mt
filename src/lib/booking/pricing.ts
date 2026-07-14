import type { PriceItem } from "@/content/pricing";

type BillingFields = Pick<PriceItem, "billing">;
type AmountFields = Pick<PriceItem, "price" | "billing">;

/**
 * Total charged for a booking. "per-person" items (default) scale with the
 * participant count; "flat" items (group sessions, packs) are one price per
 * session no matter how many people attend.
 */
export function computeBookingAmount(
  item: AmountFields,
  numParticipants: number,
): number {
  if (item.price === null || item.price === undefined) return 0;
  if (item.billing === "flat") return item.price;
  return item.price * numParticipants;
}

/**
 * Stripe line item quantity matching computeBookingAmount: the Stripe price
 * is the unit price, so flat items always bill quantity 1.
 */
export function getStripeQuantity(
  item: BillingFields,
  numParticipants: number,
): number {
  return item.billing === "flat" ? 1 : numParticipants;
}
