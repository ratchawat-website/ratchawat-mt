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
 * Trainers consumed by one booking on its slot. 1-on-1 sessions need one
 * trainer per participant; group sessions and packs need a single trainer.
 */
export function getCapacityUnits(
  item: Pick<PriceItem, "capacity">,
  numParticipants: number,
): number {
  return item.capacity === "per-participant" ? numParticipants : 1;
}

/**
 * Participant range the booking form should allow for an item.
 * Items without explicit bounds are single-participant (1-on-1 default).
 */
export function getParticipantBounds(
  item: Pick<PriceItem, "participants">,
): { min: number; max: number } {
  return item.participants ?? { min: 1, max: 1 };
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
