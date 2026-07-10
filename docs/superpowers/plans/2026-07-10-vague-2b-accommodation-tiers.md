# Vague 2b : Accommodation par paliers — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer les forfaits d'hébergement à durée fixe par des dates libres (check-in + check-out) avec calcul par paliers côté serveur, appliqué aux Rooms ET au Bungalow, dans les deux wizards (Camp Stay et Fighter) et dans l'admin. Paiement Stripe en `price_data` dynamique.

**Architecture:** Nouvelle config `src/content/stay-pricing.ts` (source unique des grilles), fonction pure `computeStayPrice` dans `src/lib/booking/stay.ts` (consommée par wizards, endpoint dédié `/api/checkout/stay` et admin), date picker en mode range, suppression du string matching de durée (les dates réelles font foi). Les anciens forfaits `PriceItem` passent `archived: true` (conservés pour l'historique admin). Aucune migration DB : le schéma `bookings` couvre déjà start/end/price_amount.

**Tech Stack:** Next.js 16, TypeScript 5 strict, Supabase, Stripe Checkout (`price_data`), Zod, vitest, react-day-picker (mode range), Resend.

**Spec:** `docs/superpowers/specs/2026-07-10-brief-juillet-design.md` (section 5)

## Global Constraints

- **PRÉREQUIS : plans vague 1 ET 2a exécutés** sur la branche `feat/booking-v2-july` (billing/policies/vitest de la vague 1 ; rien de 2a n'est consommé directement mais la branche est commune).
- Site LIVE : aucune donnée existante modifiée. Les résas d'hébergement déjà payées gardent leurs price_id historiques et restent lisibles dans l'admin.
- Grille VERBATIM (spec §5.1, décisions Rd 2026-07-10) :
  - Room Normal : paliers 7 nuits = 8 000 / 14 nuits = 15 000 / 30 nuits = 18 000 ; nuit supp 1 140 THB (paliers 7 et 14) puis 600 THB (palier 30) ; minimum 7 nuits. Électricité incluse sous 30 nuits, non incluse au mois. Training normal 2x/jour inclus (copy uniquement).
  - Room Fighter : palier 30 nuits = 20 000 ; nuit supp 670 ; minimum 30 nuits.
  - Bungalow Normal : palier 30 nuits = 23 000 ; nuit supp 600 (défaut À CONFIRMER cliente) ; minimum 30 nuits.
  - Bungalow Fighter : palier 30 nuits = 25 500 ; nuit supp 670 (défaut À CONFIRMER cliente) ; minimum 30 nuits.
- Le calcul : palier = plus grand `nights <= durée` ; prix = base du palier + (durée - nuits du palier) x taux du palier. Nuits en logique hôtelière (check-out matin libère la nuit). Anomalie 29 vs 30 nuits assumée (le prix live la rend visible).
- Le client n'envoie JAMAIS de montant : le serveur recalcule tout.
- Texte policy Room (déjà posé en vague 1, vérifier qu'il reste sur les review steps) : "Room reservations are non-refundable and non-exchangeable."
- Copy anglais, pas d'em dash, `toLocaleString("en-US")`. Commits conventionnels descriptions françaises. Lint + build + tests 0 erreur avant chaque commit. JAMAIS merger sans approval Rd.
- Seed Stripe LIVE (product « Accommodation Stay ») : exécuté par Rd au déploiement, comme en vague 1.

---

### Task 1: Config des grilles (`stay-pricing.ts`)

**Files:**
- Create: `src/content/stay-pricing.ts`

**Interfaces:**
- Produces (consommé par TOUTES les tâches suivantes) :
  - `type StayUnit = "room" | "bungalow"`, `type StayPlan = "normal" | "fighter"`
  - `interface StayTier { nights: number; basePrice: number; extraNightRate: number }`
  - `interface StayRateCard { unit: StayUnit; plan: StayPlan; label: string; minNights: number; tiers: StayTier[]; copyNotes: string[] }`
  - `STAY_RATE_CARDS: StayRateCard[]` (4 cartes), `getRateCard(unit, plan): StayRateCard | undefined`
  - `stayPriceId(unit, plan): string` -> `"stay-room-normal"` etc. (price_id des nouvelles résas)
  - `STAY_STRIPE_PRODUCT_TEST` / `STAY_STRIPE_PRODUCT_LIVE`: string (vides au départ, remplis par le seed Task 6)

- [ ] **Step 1: Créer le fichier**

```typescript
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
    // Extra-night rate is a provisional default pending client confirmation;
    // adjust here without any code change.
    label: "Private Bungalow",
    minNights: 30,
    tiers: [{ nights: 30, basePrice: 23000, extraNightRate: 600 }],
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
    tiers: [{ nights: 30, basePrice: 25500, extraNightRate: 670 }],
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
export const STAY_STRIPE_PRODUCT_TEST = "";
export const STAY_STRIPE_PRODUCT_LIVE = "";

export function getStayStripeProduct(): string {
  const isLive = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_") ?? false;
  return isLive ? STAY_STRIPE_PRODUCT_LIVE : STAY_STRIPE_PRODUCT_TEST;
}
```

- [ ] **Step 2: Lint + commit**

```bash
npm run lint
git add src/content/stay-pricing.ts
git commit -m "feat(stay): grille tarifaire hebergement par paliers (source unique, 4 cartes)"
```

---

### Task 2: `computeStayPrice` (TDD)

**Files:**
- Create: `src/lib/booking/stay.ts`
- Test: `src/lib/booking/stay.test.ts`

**Interfaces:**
- Produces:
  - `stayNights(checkIn: string, checkOut: string): number` (nuits, hôtelier)
  - `computeStayPrice(checkIn: string, checkOut: string, unit: StayUnit, plan: StayPlan): StayQuote` où

```typescript
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
```

  - Lève `StayPricingError` (classe exportée, `message` lisible client) si durée < minimum, dates invalides, ou carte inconnue.

- [ ] **Step 1: Tests qui échouent (matrice du spec §5.2)**

Créer `src/lib/booking/stay.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { computeStayPrice, stayNights, StayPricingError } from "./stay";

describe("stayNights", () => {
  it("counts hotel nights (checkout morning frees the night)", () => {
    expect(stayNights("2026-08-01", "2026-08-08")).toBe(7);
  });
});

describe("computeStayPrice: room normal", () => {
  it("rejects below the 7-night minimum", () => {
    expect(() => computeStayPrice("2026-08-01", "2026-08-07", "room", "normal")).toThrow(StayPricingError);
  });

  it.each([
    ["2026-08-01", "2026-08-08", 8000],   // 7 nights = base week
    ["2026-08-01", "2026-08-14", 14840],  // 13 nights = 8000 + 6x1140
    ["2026-08-01", "2026-08-15", 15000],  // 14 nights = special tier
    ["2026-08-01", "2026-08-16", 16140],  // 15 nights = 15000 + 1140
    ["2026-08-01", "2026-08-30", 32100],  // 29 nights = 15000 + 15x1140 (known anomaly vs 30)
    ["2026-08-01", "2026-08-31", 18000],  // 30 nights = monthly base
    ["2026-08-01", "2026-09-15", 27000],  // 45 nights = 18000 + 15x600
  ])("prices %s -> %s at %i THB", (checkIn, checkOut, expected) => {
    expect(computeStayPrice(checkIn, checkOut, "room", "normal").total).toBe(expected);
  });
});

describe("computeStayPrice: other cards", () => {
  it("room fighter: 30 nights = 20000, extra night 670", () => {
    expect(computeStayPrice("2026-08-01", "2026-08-31", "room", "fighter").total).toBe(20000);
    expect(computeStayPrice("2026-08-01", "2026-09-01", "room", "fighter").total).toBe(20670);
  });

  it("bungalow normal: rejects under 30 nights, 31 nights = 23600 (default rate)", () => {
    expect(() => computeStayPrice("2026-08-01", "2026-08-30", "bungalow", "normal")).toThrow(StayPricingError);
    expect(computeStayPrice("2026-08-01", "2026-09-01", "bungalow", "normal").total).toBe(23600);
  });

  it("bungalow fighter: 30 nights = 25500", () => {
    expect(computeStayPrice("2026-08-01", "2026-08-31", "bungalow", "fighter").total).toBe(25500);
  });

  it("exposes the breakdown", () => {
    const quote = computeStayPrice("2026-08-01", "2026-08-16", "room", "normal");
    expect(quote).toMatchObject({
      nights: 15,
      tierNights: 14,
      basePrice: 15000,
      extraNights: 1,
      extraNightRate: 1140,
    });
  });

  it("rejects checkout before checkin", () => {
    expect(() => computeStayPrice("2026-08-10", "2026-08-01", "room", "normal")).toThrow(StayPricingError);
  });
});
```

Run: `npm run test` -> FAIL.

- [ ] **Step 2: Implémenter `src/lib/booking/stay.ts`**

```typescript
import { differenceInCalendarDays, parseISO, isValid } from "date-fns";
import {
  getRateCard,
  type StayPlan,
  type StayUnit,
} from "@/content/stay-pricing";

export class StayPricingError extends Error {}

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
```

Run: `npm run test` -> PASS. (Si le test `it.each` du Step 1 sur les dates générées est fragile, remplacer par des paires de dates littérales : la table ci-dessus EST littérale, garder telle quelle.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/booking/stay.ts src/lib/booking/stay.test.ts
git commit -m "feat(stay): computeStayPrice par paliers avec breakdown (TDD, matrice du spec)"
```

---

### Task 3: Inventaire par champ explicite (fin du string matching)

**Files:**
- Modify: `src/lib/admin/inventory.ts` (`getInventoryKey` mappe aussi les nouveaux price_id)
- Test: `src/lib/admin/inventory.test.ts` (create)

**Interfaces:**
- Produces: `getInventoryKey` reconnaît `stay-room-*` -> `"rooms"`, `stay-bungalow-*` -> `"bungalows"`, et TOUJOURS les anciens ids (les résas historiques comptent dans l'occupation tant qu'elles courent). `getStayUnitInventoryKey(unit: StayUnit): InventoryKey` pour les appels directs.

- [ ] **Step 1: Tests qui échouent**

```typescript
import { describe, it, expect } from "vitest";
import { getInventoryKey, getStayUnitInventoryKey } from "./inventory";

describe("getInventoryKey", () => {
  it("maps new stay price ids", () => {
    expect(getInventoryKey("stay-room-normal")).toBe("rooms");
    expect(getInventoryKey("stay-room-fighter")).toBe("rooms");
    expect(getInventoryKey("stay-bungalow-normal")).toBe("bungalows");
    expect(getInventoryKey("stay-bungalow-fighter")).toBe("bungalows");
  });

  it("still maps historic package ids (live bookings depend on it)", () => {
    expect(getInventoryKey("camp-stay-1week")).toBe("rooms");
    expect(getInventoryKey("camp-stay-2weeks")).toBe("rooms");
    expect(getInventoryKey("camp-stay-1month")).toBe("rooms");
    expect(getInventoryKey("camp-stay-bungalow-monthly")).toBe("bungalows");
    expect(getInventoryKey("fighter-stay-room-monthly")).toBe("rooms");
    expect(getInventoryKey("fighter-stay-bungalow-monthly")).toBe("bungalows");
  });

  it("returns null for non-accommodation ids", () => {
    expect(getInventoryKey("private-adult-solo")).toBeNull();
    expect(getInventoryKey("fighter-monthly")).toBeNull();
  });
});

describe("getStayUnitInventoryKey", () => {
  it("maps units to pools", () => {
    expect(getStayUnitInventoryKey("room")).toBe("rooms");
    expect(getStayUnitInventoryKey("bungalow")).toBe("bungalows");
  });
});
```

Run: `npm run test` -> FAIL.

- [ ] **Step 2: Implémenter**

Dans `src/lib/admin/inventory.ts` :

```typescript
import type { StayUnit } from "@/content/stay-pricing";

export function getStayUnitInventoryKey(unit: StayUnit): InventoryKey {
  return unit === "bungalow" ? "bungalows" : "rooms";
}

export function getInventoryKey(priceId: string): InventoryKey | null {
  // New stay checkout ids (stay-room-normal, stay-bungalow-fighter, ...)
  if (priceId.startsWith("stay-room-")) return "rooms";
  if (priceId.startsWith("stay-bungalow-")) return "bungalows";
  // Historic package ids: keep mapping them, live bookings still use them.
  if (priceId.includes("bungalow")) return "bungalows";
  if (
    priceId.includes("camp-stay-room") ||
    priceId.startsWith("camp-stay-1week") ||
    priceId.startsWith("camp-stay-2weeks") ||
    priceId.startsWith("camp-stay-1month") ||
    priceId === "fighter-stay-room-monthly"
  ) {
    return "rooms";
  }
  return null;
}
```

Run: `npm run test` -> PASS. (Note : `getOccupancyMap` filtre `type IN ('camp-stay','fighter')` : les nouvelles résas stay utilisent ces mêmes types, rien à changer.)

- [ ] **Step 3: Commit**

```bash
git add src/lib/admin/inventory.ts src/lib/admin/inventory.test.ts
git commit -m "feat(stay): mapping d'inventaire pour les nouveaux price_id, historiques conserves"
```

---

### Task 4: Endpoint `/api/checkout/stay` (Zod + price_data)

**Files:**
- Create: `src/lib/validation/stay-booking.ts`
- Create: `src/app/api/checkout/stay/route.ts`

**Interfaces:**
- Consumes: `computeStayPrice`, `StayPricingError`, `stayPriceId`, `getStayStripeProduct`, `getStayUnitInventoryKey`, `checkRangeAvailability`, `verifyTurnstile`, `getCheckoutOrigin`.
- Produces: POST `{ unit, plan, check_in, check_out, client_name, client_email, client_phone, client_nationality?, notes?, cf_turnstile_token }` -> `{ url }` (Stripe). Insert booking : `type` = `"fighter"` si plan fighter sinon `"camp-stay"` ; `camp` = `"plai-laem"` si fighter sinon `"both"` ; `price_id = stayPriceId(unit, plan)` ; `price_amount = quote.total` ; vraies dates. metadata `{ booking_id }` -> le webhook existant confirme sans modification.

- [ ] **Step 1: Schéma Zod**

Créer `src/lib/validation/stay-booking.ts` :

```typescript
import { z } from "zod";

const DateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format");

export const StayCheckoutSchema = z
  .object({
    unit: z.enum(["room", "bungalow"]),
    plan: z.enum(["normal", "fighter"]),
    check_in: DateString,
    check_out: DateString,
    client_name: z.string().trim().min(2).max(100),
    client_email: z.string().trim().email().max(200),
    client_phone: z.string().trim().min(6).max(30),
    client_nationality: z.string().trim().min(2).max(60).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((d) => d.check_out > d.check_in, {
    path: ["check_out"],
    message: "Check-out must be after check-in.",
  });

export type StayCheckoutRequest = z.infer<typeof StayCheckoutSchema>;
```

- [ ] **Step 2: Route**

Créer `src/app/api/checkout/stay/route.ts` :

```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { StayCheckoutSchema } from "@/lib/validation/stay-booking";
import { computeStayPrice, StayPricingError } from "@/lib/booking/stay";
import { stayPriceId, getStayStripeProduct } from "@/content/stay-pricing";
import { getStayUnitInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability } from "@/lib/admin/availability";
import { getCheckoutOrigin } from "@/lib/utils/origin";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { formatDateShort } from "@/lib/utils/date-format";

function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set");
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const captcha = await verifyTurnstile(
      typeof body?.cf_turnstile_token === "string" ? body.cf_turnstile_token : null,
      request,
    );
    if (captcha) return captcha;

    const parsed = StayCheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid stay request", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Server-side price: the client NEVER sends an amount.
    let quote;
    try {
      quote = computeStayPrice(data.check_in, data.check_out, data.unit, data.plan);
    } catch (err) {
      if (err instanceof StayPricingError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    const inventoryKey = getStayUnitInventoryKey(data.unit);
    const check = await checkRangeAvailability(inventoryKey, data.check_in, data.check_out);
    if (!check.ok) {
      return NextResponse.json(
        { error: `Sold out on ${check.conflictDate}. Please choose different dates.` },
        { status: 409 },
      );
    }

    const stayProduct = getStayStripeProduct();
    if (!stayProduct) {
      return NextResponse.json(
        { error: "Stay product not configured. Run npm run stripe:seed." },
        { status: 500 },
      );
    }

    const supabase = createAdminClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        type: data.plan === "fighter" ? "fighter" : "camp-stay",
        status: "pending",
        price_id: stayPriceId(data.unit, data.plan),
        price_amount: quote.total,
        num_participants: 1,
        start_date: data.check_in,
        end_date: data.check_out,
        time_slot: null,
        camp: data.plan === "fighter" ? "plai-laem" : "both",
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_nationality: data.client_nationality ?? null,
        notes: data.notes ?? null,
      })
      .select("id")
      .single();

    if (error || !booking) {
      console.error("Stay booking insert error:", error);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    const origin = getCheckoutOrigin(request);
    const stripe = getStripe();
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "thb",
              unit_amount: quote.total * 100, // satang
              product: stayProduct,
            },
            quantity: 1,
          },
        ],
        metadata: { booking_id: booking.id },
        customer_email: data.client_email,
        success_url: `${origin}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/booking?cancelled=1`,
        payment_intent_data: {
          description: `${quote.label} · ${quote.nights} nights · ${formatDateShort(new Date(`${data.check_in}T00:00:00`))} to ${formatDateShort(new Date(`${data.check_out}T00:00:00`))}`,
        },
      });
    } catch (stripeErr) {
      console.error("Stripe stay session failed:", stripeErr);
      await supabase.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "Payment provider error. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stay checkout error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

Note anti-surbooking : `checkRangeAvailability` compte les bookings `pending` + `confirmed` (le nôtre s'insère après le check ; même fenêtre de course minuscule que l'existant, acceptée pour 7 rooms/1 bungalow à faible volume ; la re-vérification stricte existe côté privé où le volume est réel).

- [ ] **Step 2b: Nom de package pour les price_id stay-* (emails + page confirmed)**

Les surfaces post-paiement résolvent le nom du package via `getPriceById(booking.price_id)`, qui ne connaît pas `stay-room-normal` & co. Créer un helper dans `src/lib/booking/stay.ts` :

```typescript
import { getRateCard, type StayPlan, type StayUnit } from "@/content/stay-pricing";

/** Human label for a stay price_id ("stay-room-normal" -> "Standard Room"). */
export function stayLabelFromPriceId(priceId: string): string | null {
  const match = priceId.match(/^stay-(room|bungalow)-(normal|fighter)$/);
  if (!match) return null;
  return getRateCard(match[1] as StayUnit, match[2] as StayPlan)?.label ?? null;
}
```

Puis :

```bash
grep -rn "getPriceById" src/lib/email/ src/app/booking/confirmed/ src/app/api/webhooks/
```

Sur chaque site qui dérive un nom de package depuis `price_id` (au minimum `src/lib/email/send.ts` et `src/app/booking/confirmed/page.tsx`), appliquer le fallback :

```typescript
const packageName =
  getPriceById(booking.price_id)?.name ??
  stayLabelFromPriceId(booking.price_id) ??
  booking.price_id;
```

Ajouter un test dans `src/lib/booking/stay.test.ts` :

```typescript
import { stayLabelFromPriceId } from "./stay";

describe("stayLabelFromPriceId", () => {
  it("labels stay ids", () => {
    expect(stayLabelFromPriceId("stay-room-normal")).toBe("Standard Room");
    expect(stayLabelFromPriceId("stay-bungalow-fighter")).toBe("Fighter Program + Private Bungalow");
  });

  it("returns null for non-stay ids", () => {
    expect(stayLabelFromPriceId("private-adult-solo")).toBeNull();
  });
});
```

- [ ] **Step 3: Lint + build + tests + commit**

Run: `npm run lint && npm run build && npm run test`

```bash
git add src/lib/validation/stay-booking.ts src/app/api/checkout/stay/route.ts src/lib/booking/stay.ts src/lib/booking/stay.test.ts src/lib/email/send.ts src/app/booking/confirmed/page.tsx
git commit -m "feat(stay): endpoint checkout dedie avec calcul serveur et Stripe price_data"
```

---

### Task 5: DateRangePicker + calendrier de disponibilité en mode plage

**Files:**
- Create: `src/components/booking/DateRangePicker.tsx`
- Create: `src/components/booking/StayCalendar.tsx`

**Interfaces:**
- Produces:
  - `DateRangePicker({ range, onSelect, minDate, disabledDays })` : wrapper react-day-picker `mode="range"` avec les mêmes tokens visuels que `DatePicker` (nav custom, `calendarClassNames`).
  - `StayCalendar({ inventoryKey, range, onRangeChange, minNights })` : charge l'occupation (`/api/availability/occupancy`, 180 jours), grise les nuits pleines, et INVALIDE une plage qui contient une nuit pleine ou est plus courte que `minNights` (message inline + reset de la sélection). `range` = `{ from?: Date; to?: Date }` (type `DateRange` de react-day-picker).

- [ ] **Step 1: DateRangePicker**

Créer `src/components/booking/DateRangePicker.tsx` en copiant la structure de `DatePicker.tsx` (nav mois custom, `calendarClassNames`, `showOutsideDays`, `hideNavigation`) avec ces différences :

```typescript
import { DayPicker, Matcher, DateRange } from "react-day-picker";

interface DateRangePickerProps {
  range: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  minDate?: Date;
  disabledDays?: Matcher | Matcher[];
}
```

et le rendu : `<DayPicker mode="range" selected={range} onSelect={onSelect} ... />`.

- [ ] **Step 2: StayCalendar**

Créer `src/components/booking/StayCalendar.tsx` (client component) :

```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import DateRangePicker from "./DateRangePicker";
import { INVENTORY, type InventoryKey } from "@/lib/admin/inventory";
import { addDays, differenceInCalendarDays, eachDayOfInterval, format, startOfToday, subDays } from "date-fns";

interface Props {
  inventoryKey: InventoryKey;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  minNights: number;
}

export default function StayCalendar({ inventoryKey, range, onRangeChange, minNights }: Props) {
  const [occupancy, setOccupancy] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    const from = format(startOfToday(), "yyyy-MM-dd");
    const to = format(addDays(startOfToday(), 180), "yyyy-MM-dd");
    fetch(`/api/availability/occupancy?key=${inventoryKey}&from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((json) => setOccupancy((json.occupancy ?? {}) as Record<string, number>))
      .catch((err) => {
        console.error("Failed to load occupancy:", err);
        setOccupancy({});
      })
      .finally(() => setLoading(false));
  }, [inventoryKey]);

  const fullNights = useMemo(() => {
    const capacity = INVENTORY[inventoryKey];
    return new Set(
      Object.entries(occupancy)
        .filter(([, count]) => count >= capacity)
        .map(([date]) => date),
    );
  }, [occupancy, inventoryKey]);

  const disabledDays = useMemo(
    () => Array.from(fullNights).map((d) => new Date(d + "T00:00:00")),
    [fullNights],
  );

  const handleSelect = (next: DateRange | undefined) => {
    setRangeError(null);
    if (next?.from && next?.to) {
      const nights = differenceInCalendarDays(next.to, next.from);
      if (nights < minNights) {
        setRangeError(`Minimum stay is ${minNights} nights.`);
        onRangeChange({ from: next.from, to: undefined });
        return;
      }
      // Every night of the stay must have a free unit (checkout night excluded).
      const nightsList = eachDayOfInterval({ start: next.from, end: subDays(next.to, 1) });
      const conflict = nightsList.find((n) => fullNights.has(format(n, "yyyy-MM-dd")));
      if (conflict) {
        setRangeError(`Sold out on ${format(conflict, "MMM d, yyyy")}. Pick different dates.`);
        onRangeChange({ from: next.from, to: undefined });
        return;
      }
    }
    onRangeChange(next);
  };

  if (loading) {
    return <div className="h-80 bg-surface-lowest rounded-[var(--radius-card)] animate-pulse" />;
  }

  return (
    <div className="space-y-3">
      <DateRangePicker
        range={range}
        onSelect={handleSelect}
        minDate={addDays(startOfToday(), 1)}
        disabledDays={disabledDays}
      />
      {rangeError && (
        <p className="text-sm text-primary" role="alert">
          {rangeError}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Lint + build + commit**

```bash
npm run lint && npm run build
git add src/components/booking/DateRangePicker.tsx src/components/booking/StayCalendar.tsx
git commit -m "feat(stay): date range picker et calendrier d'occupation pour sejours a dates libres"
```

---

### Task 6: Seed Stripe : Product « Accommodation Stay » + archivage des forfaits

**Files:**
- Modify: `src/content/pricing.ts` (champ `archived` + flag sur les 6 items de forfait stay)
- Modify: `scripts/stripe-seed-products.ts` (création du Product stay + exclusion des archivés)

**Interfaces:**
- Produces:
  - `archived?: boolean` sur `PriceItem` ; `getPricesByBookingType` et `getPricesByCategory` EXCLUENT les archivés (les wizards et pages ne les voient plus) ; `getPriceById` les retourne TOUJOURS (historique admin).
  - `STAY_STRIPE_PRODUCT_TEST/LIVE` remplis dans `stay-pricing.ts` après seed.

- [ ] **Step 1: Champ archived + flags**

Dans `src/content/pricing.ts` :
- Interface, après `participants` :

```typescript
  /** Superseded item: hidden from wizards, pages, and Stripe seed. Kept so
   * historic bookings still resolve via getPriceById. */
  archived?: boolean;
```

- Poser `archived: true,` sur : `camp-stay-1week`, `camp-stay-2weeks`, `camp-stay-1month`, `camp-stay-bungalow-monthly`, `fighter-stay-room-monthly`, `fighter-stay-bungalow-monthly`. (PAS sur `fighter-monthly` : le tier Fighter Only reste un forfait Stripe classique.)
- Filtrer les helpers :

```typescript
export const getPricesByCategory = (category: PriceCategory): PriceItem[] =>
  PRICES.filter((p) => p.category === category && !p.archived);

export const getPricesByBookingType = (type: BookingType): PriceItem[] =>
  PRICES.filter((p) => p.bookingType === type && !p.archived);
```

(`getPriceById` inchangé : il doit résoudre les archivés.)

- [ ] **Step 2: Seed : produit stay + exclusions**

Dans `scripts/stripe-seed-products.ts` :
- Les DEUX passes (création + sync de la vague 1) excluent les archivés : ajouter `!p.archived` aux deux filtres.
- Après les passes existantes, créer le Product stay s'il manque :

```typescript
  // Permanent "Accommodation Stay" product: stay checkouts attach a computed
  // price_data amount to it (tiered pricing, no pre-created Price).
  const STAY_FILE = path.resolve(process.cwd(), "src/content/stay-pricing.ts");
  const stayField = isLive ? "STAY_STRIPE_PRODUCT_LIVE" : "STAY_STRIPE_PRODUCT_TEST";
  let stayContent = fs.readFileSync(STAY_FILE, "utf8");
  const stayFieldRegex = new RegExp(`export const ${stayField} = "([^"]*)";`);
  const currentStayId = stayContent.match(stayFieldRegex)?.[1] ?? "";

  if (!currentStayId) {
    const stayProduct = await stripe.products.create({
      name: "Accommodation Stay",
      description:
        "Room or bungalow stay at Plai Laem camp, training included. Amount computed from the tiered rate card at checkout.",
      metadata: { price_id: "stay-dynamic", category: "camp-stay", booking_type: "camp-stay" },
    });
    stayContent = stayContent.replace(
      stayFieldRegex,
      `export const ${stayField} = "${stayProduct.id}";`,
    );
    fs.writeFileSync(STAY_FILE, stayContent);
    console.log(`  + Accommodation Stay product: ${stayProduct.id} (${mode})`);
  }
```

(Placer ce bloc dans `main()` après l'écriture de `PRICING_FILE`.)

- [ ] **Step 3: Seed TEST + vérifications + commit**

Run: `npm run stripe:seed` (clé TEST)
Expected: création du Product « Accommodation Stay », `STAY_STRIPE_PRODUCT_TEST` rempli. Aucun re-seed des items archivés.
Run: `npm run lint && npm run build && npm run test`

```bash
git add src/content/pricing.ts scripts/stripe-seed-products.ts src/content/stay-pricing.ts
git commit -m "feat(stripe): produit Accommodation Stay permanent, forfaits sejour archives"
```

---

### Task 7: Refonte CampStayWizard (dates libres, prix live)

**Files:**
- Modify: `src/app/booking/camp-stay/CampStayWizard.tsx` (réécriture guidée)

**Interfaces:**
- Consumes: `STAY_RATE_CARDS` (cartes plan normal), `computeStayPrice`, `StayCalendar`, `/api/checkout/stay`.
- Produces: le wizard n'utilise PLUS `getPricesByBookingType("camp-stay")` (les items sont archivés).

- [ ] **Step 1: Réécrire le wizard**

Structure cible (steps inchangés en nombre : `["Accommodation", "Dates", "Contact", "Review"]`) :

- État : `const [unit, setUnit] = useState<StayUnit | null>(null);` + `const [range, setRange] = useState<DateRange | undefined>();` (remplacent `priceId`/`checkIn`). Plan fixe : `const plan = "normal" as const;`
- `?package=` legacy : mapper les anciens ids vers une unit (`bungalow` dans l'id -> `"bungalow"`, sinon `"room"`) pour ne pas casser les vieux liens `?package=camp-stay-1week`.
- Étape 0 « Accommodation » : deux cartes construites depuis `getRateCard("room", "normal")` et `getRateCard("bungalow", "normal")` : label, `From {tiers[0].basePrice} THB / {tiers[0].nights} nights`, `+{extraNightRate} THB per extra night`, badge « Unique - 1 on-site » pour le bungalow, `copyNotes` en liste.
- Étape 1 « Dates » :

```tsx
          <StayCalendar
            inventoryKey={getStayUnitInventoryKey(unit)}
            range={range}
            onRangeChange={setRange}
            minNights={getRateCard(unit, plan)!.minNights}
          />
```

  et sous le calendrier, le devis live quand `range.from && range.to` :

```tsx
          {quote && (
            <div className="bg-primary/5 border-2 border-primary/20 rounded-[var(--radius-card)] p-4 space-y-1 text-sm">
              <p className="text-on-surface">
                <span className="text-on-surface-variant">Stay:</span>{" "}
                <strong>{quote.nights} nights</strong> ({formatDateLong(range!.from!)} to {formatDateLong(range!.to!)})
              </p>
              <p className="text-on-surface">
                <span className="text-on-surface-variant">Base:</span>{" "}
                {quote.basePrice.toLocaleString("en-US")} THB for {quote.tierNights} nights
              </p>
              {quote.extraNights > 0 && (
                <p className="text-on-surface">
                  <span className="text-on-surface-variant">Extra nights:</span>{" "}
                  {quote.extraNights} x {quote.extraNightRate.toLocaleString("en-US")} THB
                </p>
              )}
              <p className="font-serif text-lg font-bold text-primary pt-1">
                Total: {quote.total.toLocaleString("en-US")} THB
              </p>
              <ul className="text-xs text-on-surface-variant pt-2 space-y-0.5">
                {quote.copyNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </div>
          )}
```

  avec le devis mémoïsé :

```typescript
  const quote = useMemo(() => {
    if (!unit || !range?.from || !range?.to) return null;
    try {
      return computeStayPrice(
        format(range.from, "yyyy-MM-dd"),
        format(range.to, "yyyy-MM-dd"),
        unit,
        plan,
      );
    } catch {
      return null;
    }
  }, [unit, range, plan]);
```

- `canProceed` : step 0 `!!unit` ; step 1 `!!quote` ; steps 2-3 comme avant.
- Review : rows = Accommodation (`quote.label`), Check-in, Check-out, Nights, Access (« Stay Plai Laem, train any camp »), Contact ; `totalAmount={quote.total}` ; la note policy Room (vague 1) reste.
- Submit -> `/api/checkout/stay` :

```typescript
        body: JSON.stringify({
          unit,
          plan,
          check_in: format(range!.from!, "yyyy-MM-dd"),
          check_out: format(range!.to!, "yyyy-MM-dd"),
          client_name: contact.name,
          client_email: contact.email,
          client_phone: contact.phone,
          client_nationality: contact.nationality || undefined,
          notes: contact.notes || undefined,
          cf_turnstile_token: captcha.token,
        }),
```

- `submitLabel` : `quote ? \`Pay ${quote.total.toLocaleString("en-US")} THB\` : "Pay"`.
- Supprimer les fonctions locales `getDurationDays`, `getStayDuration`, `getInventoryKeyForPackage` (string matching mort).

- [ ] **Step 2: Lint + build + E2E + commit**

E2E local : room 12 nuits -> devis 8,000 + 5x1,140 = 13,700, Stripe affiche 13,700 ; bungalow < 30 nuits -> bloqué avec message minimum ; bungalow 31 nuits -> 23,600.

```bash
git add src/app/booking/camp-stay/CampStayWizard.tsx
git commit -m "feat(stay): wizard camp-stay a dates libres avec devis live par paliers"
```

---

### Task 8: FighterWizard : tiers stay à dates libres

**Files:**
- Modify: `src/app/booking/fighter/FighterWizard.tsx`

**Interfaces:**
- Consumes: `getRateCard(unit, "fighter")`, `computeStayPrice`, `StayCalendar`, `/api/checkout/stay`.
- Produces: le tier « Fighter Only » (`fighter-monthly`) garde EXACTEMENT son flux actuel (ancienne route `/api/checkout`, DatePicker single, prix forfait).

- [ ] **Step 1: Reconstruire les tiers**

`getPricesByBookingType("fighter")` ne retourne plus que `fighter-monthly` (les 2 combos sont archivés). Construire la liste des tiers affichés :

```typescript
const fighterOnly = getPriceById("fighter-monthly")!;
const stayTiers = [
  { unit: "room" as const, card: getRateCard("room", "fighter")! },
  { unit: "bungalow" as const, card: getRateCard("bungalow", "fighter")! },
];
```

État : `const [tier, setTier] = useState<"only" | "room" | "bungalow" | null>(null);` (remplace `priceId`), `const [range, setRange] = useState<DateRange | undefined>();` pour les tiers stay, `date` conservé pour Fighter Only.
Étape 1 affiche 3 cartes : Fighter Only (données de `fighterOnly`, prix `9,500 THB / month`) + les 2 stay tiers (`From {basePrice} THB / 30 nights`, `+{extraNightRate} THB per extra night`, badge bungalow).

- [ ] **Step 2: Étape dates + devis + submit**

- `hasStay = tier === "room" || tier === "bungalow"`.
- Pour les tiers stay, remplacer l'`AvailabilityCalendar` par :

```tsx
              <StayCalendar
                inventoryKey={getStayUnitInventoryKey(tier)}
                range={range}
                onRangeChange={setRange}
                minNights={30}
              />
```

  + le même bloc devis live que le CampStayWizard (Task 7), avec `plan = "fighter"`.
- Fighter Only : DatePicker single inchangé.
- Review stay : rows Tier (`quote.label`), Check-in, Check-out, Nights, Contact ; total `quote.total` ; la note policy Room (vague 1) reste sur les tiers stay.
- Submit : si `hasStay` -> POST `/api/checkout/stay` avec `{ unit: tier, plan: "fighter", check_in, check_out, ... }` ; sinon flux actuel inchangé (price_id `fighter-monthly`).
- Supprimer `isStayTier`/`getStayInventoryKey` locaux (remplacés par `tier`).

- [ ] **Step 3: Lint + build + E2E + commit**

E2E : Fighter+Room 30 nuits = 20,000 ; 35 nuits = 20,000 + 5x670 = 23,350 ; Fighter Only inchangé (9,500, route classique).

```bash
git add src/app/booking/fighter/FighterWizard.tsx
git commit -m "feat(stay): tiers fighter+hebergement a dates libres, fighter only inchange"
```

---

### Task 9: Admin : création manuelle stay + API

**Files:**
- Modify: `src/components/admin/CreateBookingForm.tsx`
- Modify: `src/lib/validation/admin-booking.ts`
- Modify: `src/app/api/admin/bookings/route.ts`

**Interfaces:**
- Produces: l'admin crée une résa stay avec unit + plan + dates ; le prix s'auto-remplit via `computeStayPrice` (override manuel conservé) ; le serveur revalide (minimum de nuits + capacité) et n'exige PAS le montant (recalcule si absent).

- [ ] **Step 1: Schéma admin**

Dans `src/lib/validation/admin-booking.ts`, ajouter les champs stay (optionnels, utilisés quand `price_id` commence par `stay-`) :

```typescript
  stay_unit: z.enum(["room", "bungalow"]).optional(),
  stay_plan: z.enum(["normal", "fighter"]).optional(),
```

- [ ] **Step 2: API admin**

Dans `src/app/api/admin/bookings/route.ts` :
- `getPriceById` échoue pour `stay-*` : brancher AVANT la résolution du package :

```typescript
  const isStay = data.price_id.startsWith("stay-");
  if (isStay) {
    if (!data.stay_unit || !data.stay_plan || !data.end_date) {
      return NextResponse.json(
        { error: "Stay bookings need unit, plan, and end date." },
        { status: 400 },
      );
    }
    let quote;
    try {
      quote = computeStayPrice(data.start_date, data.end_date, data.stay_unit, data.stay_plan);
    } catch (err) {
      if (err instanceof StayPricingError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }
    const inventoryKey = getStayUnitInventoryKey(data.stay_unit);
    const check = await checkRangeAvailability(inventoryKey, data.start_date, data.end_date);
    if (!check.ok) {
      return NextResponse.json(
        { error: `No availability on ${check.conflictDate}. Choose different dates.` },
        { status: 409 },
      );
    }
    const admin = createAdminClient();
    const { data: booking, error } = await admin
      .from("bookings")
      .insert({
        type: data.stay_plan === "fighter" ? "fighter" : "camp-stay",
        status: "confirmed",
        price_id: stayPriceId(data.stay_unit, data.stay_plan),
        price_amount: data.price_amount ?? quote.total,
        num_participants: data.num_participants,
        start_date: data.start_date,
        end_date: data.end_date,
        time_slot: null,
        camp: data.stay_plan === "fighter" ? "plai-laem" : "both",
        client_name: data.client_name,
        client_email: data.client_email || "",
        client_phone: data.client_phone || "",
        client_nationality: data.client_nationality || null,
        notes: data.notes || null,
      })
      .select("id")
      .single();
    if (error || !booking) {
      console.error("Admin stay booking insert error:", error);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id: booking.id });
  }
```

(Imports : `computeStayPrice`, `StayPricingError`, `stayPriceId`, `getStayUnitInventoryKey`.)
- Supprimer `computeEndDate` (string matching) : pour les types non-stay restants, `end_date` vient du formulaire ou reste null. Vérifier qu'aucun autre appel ne le référence.

- [ ] **Step 3: CreateBookingForm**

Dans `CreateBookingForm.tsx` :
- `BOOKING_TYPES` gagne une entrée dédiée : `{ value: "stay", label: "Accommodation Stay" }` (valeur UI locale ; le POST envoie `price_id: stayPriceId(unit, plan)` + `stay_unit`/`stay_plan`, et `type` N'est PAS envoyé pour stay — adapter le handler : quand le type UI est `stay`, construire le body avec `type: plan === "fighter" ? "fighter" : "camp-stay"`).
- Quand le type UI est `stay` : le select Package est remplacé par deux selects Unit (Room/Bungalow) + Plan (Normal/Fighter Program) ; les champs Start/End Date restent (libres) ; le champ Amount s'auto-remplit :

```typescript
  useEffect(() => {
    if (uiType !== "stay" || !stayUnit || !stayPlan || !startDate || !endDate) return;
    try {
      setPriceAmount(computeStayPrice(startDate, endDate, stayUnit, stayPlan).total);
    } catch {
      setPriceAmount("");
    }
  }, [uiType, stayUnit, stayPlan, startDate, endDate]);
```

- Supprimer `getStayDurationDays` locale (l'end date est saisie, plus déduite) ; garder l'auto-end-date UNIQUEMENT comme convenance : quand unit/plan choisis et endDate vide, proposer start + minNights.
- Les anciens types `camp-stay`/`fighter` restent dans la liste pour les résas non-stay (fighter only) ; leurs packages listés excluent les archivés automatiquement (helpers filtrés Task 6).

- [ ] **Step 4: Lint + build + vérification manuelle + commit**

Manuel : admin crée un stay Room Normal 12 nuits -> montant auto 13,700, éditable ; création OK, visible dans le calendrier d'occupation. Vérifier aussi que la liste et le détail admin affichent un nom lisible pour un booking `stay-*` : si le détail utilise `getPriceById(...).name`, appliquer le fallback `stayLabelFromPriceId` (Task 4 Step 2b).

```bash
git add src/components/admin/CreateBookingForm.tsx src/lib/validation/admin-booking.ts src/app/api/admin/bookings/route.ts
git commit -m "feat(admin): creation manuelle de sejours a dates libres avec prix auto-calcule"
```

---

### Task 10: Affichages : /accommodation, /pricing, /booking, llms

**Files:**
- Modify: `src/app/accommodation/page.tsx` (cartes packages l.329-470 + GEO l.545 + schema LodgingBusiness)
- Modify: `src/app/pricing/page.tsx` (section Camp Stay l.520-600 env. + offerCatalogSchema entrées stay)
- Modify: `src/app/booking/page.tsx:75` (carte Camp Stay)
- Modify: `public/llms.txt`, `public/llms-full.txt`

**Interfaces:**
- Consumes: `STAY_RATE_CARDS`, `getRateCard` (les montants ne sont PLUS écrits en dur).

- [ ] **Step 1: /accommodation**

En tête de fichier : `import { getRateCard } from "@/content/stay-pricing";` et résoudre les 4 cartes. Les 6 cartes de la section « Camp Stay Packages » deviennent des illustrations de la grille, montants depuis la config :
- « 1 Week · Standard Room » : `{roomNormal.tiers[0].basePrice}` (8,000) + ligne `+1,140 THB per extra night` (`tiers[0].extraNightRate`).
- « 2 Weeks · Standard Room » : `{roomNormal.tiers[1].basePrice}` (15,000) + même ligne extra night.
- « 1 Month · Standard Room » : `{roomNormal.tiers[2].basePrice}` (18,000) + `+600 THB per extra day` + mention électricité.
- « 1 Month · Private Bungalow » : `{bungalowNormal.tiers[0].basePrice}` (23,000) + extra night + mention « 1 month minimum ».
- Fighter + Room / Fighter + Bungalow : `{roomFighter.tiers[0].basePrice}` / `{bungalowFighter.tiers[0].basePrice}` + extra nights.
- Tous les CTA pointent vers `/booking/camp-stay` (ou `/booking/fighter` pour les combos), sans `?package=`.
- Ajouter sous la grille une phrase expliquant le nouveau modèle (à passer au /humanizer) : « Pick your own check-in and check-out dates. The price is computed from the base rate plus extra nights. Rooms from 7 nights, bungalow from 1 month. »
- GEO passage (l.545) : garder les ancres 8,000 THB weekly / 18,000 monthly, ajouter « flexible check-in and check-out dates ».
- Schema LodgingBusiness : vérifier que les prix cités correspondent à la config (utiliser les mêmes constantes).

- [ ] **Step 2: /pricing + /booking + llms**

- `/pricing`, section Camp Stay : mêmes remplacements depuis `getRateCard` (plus aucun montant stay en dur) + mention extra-night ; offerCatalogSchema : entrées stay depuis la config.
- `/booking` : la carte Camp Stay « From 8,000 THB/week » devient `From {getRateCard("room","normal")!.tiers[0].basePrice.toLocaleString("en-US")} THB/week`.
- `llms.txt`/`llms-full.txt` : décrire le nouveau modèle (rooms from 8,000 THB/7 nights + 1,140/extra night ; 14 nights 15,000 ; monthly 18,000 + 600/day ; bungalow monthly 23,000 ; fighter combos 20,000/25,500 + 670/day ; free check-in/check-out dates).

- [ ] **Step 3: Chasse aux montants stay en dur**

```bash
grep -rn "8,000\|15,000\|18,000\|23,000\|25,500\|20,000" src/app public/llms.txt public/llms-full.txt | grep -v stay-pricing
```

Chaque hit restant doit être justifié (ex. 20,000 DTV 2x/week est légitime) ou remplacé par la config.

- [ ] **Step 4: Lint + build + /humanizer + validation schémas + commit**

/humanizer sur la phrase d'explication (Step 1). Valider le JSON-LD modifié.

```bash
git add src/app/accommodation/page.tsx src/app/pricing/page.tsx src/app/booking/page.tsx public/llms.txt public/llms-full.txt
git commit -m "refactor(stay): les pages lisent la grille stay-pricing, fin des montants sejour en dur"
```

---

### Task 11: Recette finale 2b + documentation + handoff vague 2

**Files:**
- Modify: `PROJECT-STATUS.md`, `ROADMAP.md`, `ARCHITECTURE.md`

- [ ] **Step 1: Suite E2E complète (dev + stripe listen, clés TEST)**

1. Room Normal 7 nuits : devis 8,000, Stripe 8,000, payer 4242 -> confirmed, occupation +1 sur 7 nuits.
2. Room Normal 15 nuits : 16,140 (breakdown visible : base 15,000 + 1 x 1,140).
3. Room Normal 6 nuits : bloqué côté UI (minimum) ET côté API (tester via curl : 400 avec le message minimum).
4. Bungalow Normal 31 nuits : 23,600 ; bungalow 20 nuits : bloqué.
5. Fighter + Room 35 nuits : 23,350 via FighterWizard ; Fighter Only : flux classique 9,500 inchangé.
6. Anti-surbooking : le bungalow ayant 1 unité, une 2e résa bungalow chevauchante est refusée (calendrier grisé + API 409).
7. Admin : création stay manuelle 12 nuits (13,700 auto), visible dans l'occupation ; une résa HISTORIQUE (price_id `camp-stay-2weeks` en DB si présente en test) s'affiche toujours correctement dans la liste et le détail.
8. Webhook expired sur un stay pending : booking cancelled (pas de block à nettoyer : les stays n'ont pas de private-slot).
9. `/accommodation`, `/pricing`, `/booking` affichent les montants de la config ; JSON-LD valide.

- [ ] **Step 2: Purge + vérifications + nettoyage**

Purge des données de test Supabase. Run: `npm run lint && npm run build && npm run test` -> 0 erreur, tous les tests verts (capacity, pricing, schedule, booking, stay, inventory).

Nettoyage : après cette vague, le mode `type="camp-stay"` d'`AvailabilityCalendar` n'a plus de consommateur (les wizards stay utilisent `StayCalendar`). Vérifier avec `grep -rn "AvailabilityCalendar" src/` : s'il ne reste que des usages `type="private"`, retirer la branche camp-stay du composant (props `inventoryKey`/`stayDurationDays`, fetch occupancy, blocage multi-nuits) pour ne pas laisser de code mort.

- [ ] **Step 3: Documentation vivante + commit**

- `ARCHITECTURE.md` : §1 (stay-pricing.ts source unique + computeStayPrice), §3 (wizards camp-stay/fighter à dates libres), §5 (inventaire : mapping stay-* + historiques), §6 Stripe (price_data + Product « Accommodation Stay », metadata inchangée), note « anciens forfaits archived: true ».
- `PROJECT-STATUS.md` : entrée d'historique + prix section 1 (Camp Stay : from 8,000 THB / 7 nights + 1,140/extra night, etc.).
- `ROADMAP.md` : vague 2b cochée, statut « attente approval + seed LIVE + merge ».

```bash
git add PROJECT-STATUS.md ROADMAP.md ARCHITECTURE.md
git commit -m "docs: cloture vague 2b (hebergement par paliers a dates libres)"
```

- [ ] **Step 4: Handoff à Rd (NE PAS merger)**

Présenter : diff complet de `feat/booking-v2-july` (2a + 2b), résultats des deux recettes, et la checklist de déploiement :
1. Approval du diff par Rd.
2. Rd lance `npm run stripe:seed` en LIVE (crée le Product « Accommodation Stay » live, remplit `STAY_STRIPE_PRODUCT_LIVE`) ; committer ce diff.
3. Merge + déploiement Vercel.
4. Smoke test prod : devis room 10 nuits sur le wizard (SANS payer), montant Stripe correct ; wizard privé panier 2 sessions jusqu'à la page Stripe (SANS payer) ; admin drawer en unités.
5. Rappels post-merge : les 4 confirmations cliente du spec §7 restent ouvertes (prix groupe 2 vs 3, groupe kids, délai DTV, tarif nuit supp bungalow) : chaque réponse = simple édition de config + redéploiement.
