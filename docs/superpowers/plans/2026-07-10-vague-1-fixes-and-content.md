# Vague 1 : Fixes & Content (juillet 2026) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les 4 bugs du système de réservation privée (capacité admin, encadré WhatsApp, blocage fantôme, race condition), mettre à jour tous les tarifs et textes demandés par la cliente (privés adultes, DTV, policies, Plai Laem, Standard Room), et résorber la duplication des prix privés + DTV.

**Architecture:** Aucun changement structurel. Extraction de helpers partagés (`src/lib/booking/capacity.ts`, `src/lib/booking/pricing.ts`, `src/content/policies.ts`), nouveau mode de facturation `billing: "per-person" | "flat"` sur `PriceItem`, extension du script de seed Stripe pour synchroniser les changements de prix. Une migration DB additive (`dtv_applications.date_of_birth`).

**Tech Stack:** Next.js 16 (App Router), TypeScript 5 strict, Supabase (MCP `supabase-ratchawat`, projet `rlmeafyvedpsflwohuyy`), Stripe Checkout, Zod, vitest (nouveau), Resend.

**Spec:** `docs/superpowers/specs/2026-07-10-brief-juillet-design.md` (sections 3 et 6)

## Global Constraints

- Branche : `feat/fixes-and-content-july`. JAMAIS merger sans approval explicite de Rd.
- Site LIVE en production avec vrais paiements : migrations DB additives uniquement, appliquées via MCP `mcp__supabase-ratchawat__apply_migration` + fichier miroir dans `supabase/migrations/`. JAMAIS le MCP Supabase générique.
- Les textes fournis par la cliente (policies, encadré WhatsApp DTV) sont VERBATIM : ne pas les reformuler, ne pas les passer au /humanizer. Le copy écrit par nous (Plai Laem, descriptions) passe par /humanizer.
- Copy en anglais. Pas d'em dash (—) dans le copy visible. Pas de séquences d'échappement unicode dans les sources. `toLocaleString("en-US")` pour les montants.
- Prix : `src/content/pricing.ts` est la source unique. Montants Stripe TOUJOURS recalculés côté serveur.
- Commits : Conventional Commits, type/scope en anglais, description en français.
- `npm run lint` et `npm run build` doivent passer à 0 erreur avant chaque commit.
- Seed Stripe : mode TEST en local pendant le dev. Le seed LIVE est exécuté par Rd au moment du déploiement, AVANT le merge en prod (ne jamais lancer le seed avec une clé live sans Rd).
- Valeurs tarifaires cibles : private-adult-solo 1 000 THB ; private-adult-10pack 9 000 THB (nouveau) ; private-adult-group 1 400 THB fixe/session ; dtv-6m-unlimited 35 000 THB. Kids inchangés (600 / 400 per-person).

---

### Task 1: Branche + infrastructure vitest

**Files:**
- Modify: `package.json` (script test + devDependency vitest)
- Create: `vitest.config.ts`

**Interfaces:**
- Produces: commande `npm run test` (vitest run), alias `@/` résolu dans les tests, pattern de test colocalisé `src/**/*.test.ts`.

- [ ] **Step 1: Créer la branche**

```bash
git checkout main && git pull && git checkout -b feat/fixes-and-content-july
```

- [ ] **Step 2: Installer vitest**

```bash
npm install -D vitest
```

- [ ] **Step 3: Créer `vitest.config.ts`**

```typescript
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 4: Ajouter le script dans `package.json`**

Dans le bloc `"scripts"`, ajouter :

```json
"test": "vitest run"
```

- [ ] **Step 5: Vérifier que la commande tourne (0 test = OK)**

Run: `npm run test`
Expected: "No test files found" avec exit code 0 (vitest run passe sans fichier) ou message équivalent. Si vitest sort en erreur sur 0 test, ajouter `passWithNoTests: true` dans `test: {}`.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "chore: ajoute vitest (premiere infra de test du projet)"
```

---

### Task 2: Helper de capacité partagé + fix du contrôle admin cassé (bug B1)

Le contrôle admin (`src/app/api/admin/bookings/route.ts:71-88`) refuse toute création dès qu'UNE ligne `private-slot` existe sur (date, créneau), ignore le camp, et son `.maybeSingle()` échoue silencieusement à 2+ lignes. Le contrôle public (`src/app/api/checkout/route.ts:80-127`) est correct. On extrait la logique correcte dans un helper partagé, on l'utilise des deux côtés.

**Files:**
- Create: `src/lib/booking/capacity.ts`
- Test: `src/lib/booking/capacity.test.ts`
- Modify: `src/app/api/checkout/route.ts:76-127`
- Modify: `src/app/api/admin/bookings/route.ts:69-88`

**Interfaces:**
- Consumes: `PRIVATE_SLOT_CAPACITY` de `@/content/schedule`.
- Produces:
  - `hasSlotCapacity(occupied: number, requested?: number): boolean` (pure)
  - `isSlotClosed(client: SupabaseClient, date: string, timeSlot: string): Promise<boolean>` (throw en cas d'erreur DB)
  - `getSlotOccupancy(client: SupabaseClient, q: { date: string; timeSlot: string; camp: "bo-phut" | "plai-laem" }): Promise<number>` (throw en cas d'erreur DB)
  - Tasks 3 et 13 réutilisent `getSlotOccupancy`/`hasSlotCapacity`.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `src/lib/booking/capacity.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { hasSlotCapacity } from "./capacity";

describe("hasSlotCapacity", () => {
  it("accepts when the slot is empty", () => {
    expect(hasSlotCapacity(0)).toBe(true);
  });

  it("accepts the 6th booking (5 occupied + 1 requested)", () => {
    expect(hasSlotCapacity(5)).toBe(true);
  });

  it("refuses the 7th booking (6 occupied)", () => {
    expect(hasSlotCapacity(6)).toBe(false);
  });

  it("refuses when the request alone would overflow (1 occupied + 6 requested)", () => {
    expect(hasSlotCapacity(1, 6)).toBe(false);
  });

  it("accepts a multi-unit request that fits exactly (2 occupied + 4 requested)", () => {
    expect(hasSlotCapacity(2, 4)).toBe(true);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npm run test`
Expected: FAIL, "Cannot find module './capacity'" (ou équivalent).

- [ ] **Step 3: Créer `src/lib/booking/capacity.ts`**

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";
import { PRIVATE_SLOT_CAPACITY } from "@/content/schedule";

export interface SlotQuery {
  date: string; // yyyy-MM-dd
  timeSlot: string; // HH:mm
  camp: "bo-phut" | "plai-laem";
}

/**
 * A slot can host up to PRIVATE_SLOT_CAPACITY parallel private sessions
 * per camp (one per available trainer).
 */
export function hasSlotCapacity(occupied: number, requested = 1): boolean {
  return occupied + requested <= PRIVATE_SLOT_CAPACITY;
}

/**
 * Hard closure: admin toggled the slot off for everyone, regardless of
 * per-camp capacity. One row is enough to refuse.
 */
export async function isSlotClosed(
  client: SupabaseClient,
  date: string,
  timeSlot: string,
): Promise<boolean> {
  const { count, error } = await client
    .from("availability_blocks")
    .select("id", { count: "exact", head: true })
    .eq("type", "private-slot-closure")
    .eq("is_blocked", true)
    .eq("date", date)
    .eq("time_slot", timeSlot);
  if (error) {
    throw new Error(`Slot closure check failed: ${error.message}`);
  }
  return (count ?? 0) > 0;
}

/**
 * Number of private sessions already booked on (date, timeSlot, camp).
 */
export async function getSlotOccupancy(
  client: SupabaseClient,
  q: SlotQuery,
): Promise<number> {
  const { count, error } = await client
    .from("availability_blocks")
    .select("id", { count: "exact", head: true })
    .eq("type", "private-slot")
    .eq("is_blocked", true)
    .eq("date", q.date)
    .eq("time_slot", q.timeSlot)
    .eq("camp", q.camp);
  if (error) {
    throw new Error(`Slot capacity check failed: ${error.message}`);
  }
  return count ?? 0;
}
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `npm run test`
Expected: 5 tests PASS.

- [ ] **Step 5: Brancher le checkout public sur le helper (sans changement de comportement)**

Dans `src/app/api/checkout/route.ts`, remplacer le bloc lignes 76-127 (depuis `const supabaseCheck = createAdminClient();` jusqu'à la fin du `if ((count ?? 0) >= PRIVATE_SLOT_CAPACITY) {...}`) par :

```typescript
      const supabaseCheck = createAdminClient();

      try {
        if (await isSlotClosed(supabaseCheck, data.start_date, data.time_slot)) {
          return NextResponse.json(
            {
              error:
                "This slot is closed on the selected date. Please pick another time.",
            },
            { status: 409 },
          );
        }
        const occupied = await getSlotOccupancy(supabaseCheck, {
          date: data.start_date,
          timeSlot: data.time_slot,
          camp: data.camp as "bo-phut" | "plai-laem",
        });
        if (!hasSlotCapacity(occupied)) {
          return NextResponse.json(
            {
              error:
                "This slot is fully booked at the selected camp. Please pick another time or camp.",
            },
            { status: 409 },
          );
        }
      } catch (checkErr) {
        console.error("Slot availability check failed:", checkErr);
        return NextResponse.json(
          { error: "Could not verify slot availability. Please try again." },
          { status: 500 },
        );
      }
```

Adapter les imports en tête de fichier : supprimer `PRIVATE_SLOT_CAPACITY` de l'import `@/content/schedule` (garder `isSlotWithinCutoff` et `getCutoffHoursForSlot`), et ajouter :

```typescript
import {
  hasSlotCapacity,
  isSlotClosed,
  getSlotOccupancy,
} from "@/lib/booking/capacity";
```

Note : `data.camp` est typé `"bo-phut" | "plai-laem" | "both"` par Zod ; une résa privée a toujours un camp concret, d'où le cast local. Ne pas élargir `SlotQuery` à `"both"`.

- [ ] **Step 6: Corriger le contrôle admin (le bug)**

Dans `src/app/api/admin/bookings/route.ts`, remplacer le bloc lignes 69-88 (`// Check private slot availability` jusqu'à la fin du `if (existingBlock) {...}`) par :

```typescript
  // Check private slot availability: same rules as the public checkout
  // (hard closure + per-camp trainer capacity), NOT "one booking blocks all".
  const admin = createAdminClient();
  if (data.type === "private" && data.time_slot && data.camp !== "both") {
    try {
      if (await isSlotClosed(admin, data.start_date, data.time_slot)) {
        return NextResponse.json(
          {
            error: `Time slot ${data.time_slot} is closed on ${data.start_date}.`,
          },
          { status: 409 },
        );
      }
      const occupied = await getSlotOccupancy(admin, {
        date: data.start_date,
        timeSlot: data.time_slot,
        camp: data.camp,
      });
      if (!hasSlotCapacity(occupied)) {
        return NextResponse.json(
          {
            error: `Time slot ${data.time_slot} is fully booked at ${data.camp} on ${data.start_date} (${occupied}/6).`,
          },
          { status: 409 },
        );
      }
    } catch (checkErr) {
      console.error("Admin slot availability check failed:", checkErr);
      return NextResponse.json(
        { error: "Could not verify slot availability. Please try again." },
        { status: 500 },
      );
    }
  }
```

Ajouter l'import :

```typescript
import {
  hasSlotCapacity,
  isSlotClosed,
  getSlotOccupancy,
} from "@/lib/booking/capacity";
```

- [ ] **Step 7: Lint + build**

Run: `npm run lint && npm run build`
Expected: 0 erreur.

- [ ] **Step 8: Vérification manuelle du fix admin**

Avec `npm run dev` + un booking privé existant en DB sur un créneau (créer via le wizard public si besoin, carte test 4242) : dans `/admin/bookings?create=1`, créer une résa privée sur le MÊME créneau + même camp. Avant le fix : refus « already blocked ». Attendu : création OK (2/6). Créer aussi sur l'autre camp : OK. Nettoyer les résas de test créées.

- [ ] **Step 9: Commit**

```bash
git add src/lib/booking/capacity.ts src/lib/booking/capacity.test.ts src/app/api/checkout/route.ts src/app/api/admin/bookings/route.ts
git commit -m "fix(admin): la creation de resa privee respecte la capacite 6 par camp au lieu de bloquer des la premiere resa"
```

---

### Task 3: Race condition sur la dernière place (bug B4)

Entre le comptage de capacité et l'insertion du block dans `/api/checkout`, deux requêtes simultanées peuvent toutes deux obtenir la 6e place. Pattern insert-then-verify : on insère le block, on recompte, et si le créneau déborde on retire le block + le booking et on répond 409.

**Files:**
- Modify: `src/app/api/checkout/route.ts:180-192` (bloc « If this is a private session, create an availability block »)

**Interfaces:**
- Consumes: `getSlotOccupancy`, `PRIVATE_SLOT_CAPACITY` (via `hasSlotCapacity` sémantique : ici on vérifie `occupied <= capacité` APRÈS insert, donc comparaison directe).

- [ ] **Step 1: Remplacer le bloc d'insertion du block**

Dans `src/app/api/checkout/route.ts`, remplacer le bloc actuel :

```typescript
    // If this is a private session, create an availability block for the slot
    if (data.type === "private" && data.time_slot) {
      await supabase
        .from("availability_blocks")
        .insert({
          date: data.start_date,
          type: "private-slot",
          time_slot: data.time_slot,
          camp: data.camp,
          is_blocked: true,
          reason: `Booking ${booking.id}`,
        });
    }
```

par :

```typescript
    // If this is a private session, create an availability block for the slot.
    // Insert-then-verify: two concurrent checkouts can both pass the capacity
    // pre-check, so we re-count AFTER inserting our own block and roll back
    // if the slot overflowed.
    if (data.type === "private" && data.time_slot) {
      const { error: blockErr } = await supabase
        .from("availability_blocks")
        .insert({
          date: data.start_date,
          type: "private-slot",
          time_slot: data.time_slot,
          camp: data.camp,
          is_blocked: true,
          reason: `Booking ${booking.id}`,
        });
      if (blockErr) {
        console.error("Slot block insert failed:", blockErr);
        await supabase.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          { error: "Could not reserve the slot. Please try again." },
          { status: 500 },
        );
      }

      const occupiedAfter = await getSlotOccupancy(supabase, {
        date: data.start_date,
        timeSlot: data.time_slot,
        camp: data.camp as "bo-phut" | "plai-laem",
      });
      if (occupiedAfter > PRIVATE_SLOT_CAPACITY) {
        await supabase
          .from("availability_blocks")
          .delete()
          .eq("reason", `Booking ${booking.id}`);
        await supabase.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          {
            error:
              "This slot just filled up at the selected camp. Please pick another time or camp.",
          },
          { status: 409 },
        );
      }
    }
```

Ré-ajouter `PRIVATE_SLOT_CAPACITY` à l'import `@/content/schedule` (retiré en Task 2).

- [ ] **Step 2: Lint + build + tests**

Run: `npm run lint && npm run build && npm run test`
Expected: 0 erreur, tests verts.

- [ ] **Step 3: Vérification manuelle**

Flux privé complet en local (wizard → Stripe test 4242 → webhook via `stripe listen --forward-to localhost:3000/api/webhooks/stripe`) : la résa passe toujours, le block existe, la confirmation arrive. Nettoyer la résa de test.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "fix(checkout): verifie la capacite apres insertion du block pour fermer la course sur la derniere place"
```

---

### Task 4: Blocage fantôme après paiement abandonné (bug B3)

`checkout.session.expired` annule le booking pending mais ne supprime pas son block `private-slot` : le créneau reste consommé pour rien.

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts:216-222` (branche `expired`, cas booking)

- [ ] **Step 1: Modifier la branche expired**

Dans `src/app/api/webhooks/stripe/route.ts`, remplacer :

```typescript
    } else if (meta.booking_id) {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", meta.booking_id)
        .eq("status", "pending");
    }
```

par :

```typescript
    } else if (meta.booking_id) {
      const { data: cancelled } = await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", meta.booking_id)
        .eq("status", "pending")
        .select("id, type, time_slot")
        .maybeSingle();

      // Free the private slot held by this abandoned booking. Only when the
      // update actually cancelled something: an out-of-order `expired` after
      // `completed` matches no row and must not delete a paid booking's block.
      if (cancelled && cancelled.type === "private" && cancelled.time_slot) {
        await supabase
          .from("availability_blocks")
          .delete()
          .eq("reason", `Booking ${cancelled.id}`);
      }
    }
```

- [ ] **Step 2: Lint + build**

Run: `npm run lint && npm run build`
Expected: 0 erreur.

- [ ] **Step 3: Vérification manuelle**

En local avec `stripe listen` actif : démarrer un checkout privé (wizard jusqu'à Stripe) puis NE PAS payer. Vérifier en DB : booking `pending` + block présent. Déclencher l'expiration :

```bash
stripe trigger checkout.session.expired --add "checkout_session:metadata[booking_id]=<uuid-du-booking>"
```

Expected: booking passe à `cancelled`, la ligne `availability_blocks` avec `reason = 'Booking <uuid>'` est supprimée. Nettoyer.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "fix(webhook): libere le creneau prive quand le paiement expire (blocage fantome)"
```

---

### Task 5: Encadré « créneau non disponible » permanent (bug B2)

L'encadré WhatsApp de `PrivateWizard` n'apparaît que si un créneau du jour est sous le cutoff (donc uniquement le jour même). La cliente veut le message sur tous les jours.

**Files:**
- Modify: `src/app/booking/private/PrivateWizard.tsx:295-320`

- [ ] **Step 1: Rendre l'encadré permanent**

Dans `src/app/booking/private/PrivateWizard.tsx`, remplacer le bloc `{anyCutoffBlocked && ( ... )}` (lignes 295-320) par un bloc toujours rendu dès qu'une date est choisie (il est déjà dans le scope `{date && (() => { ... })()}`) :

```tsx
                <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-card)] border-2 border-primary/30 bg-primary/5 p-4">
                  <MessageCircle
                    size={20}
                    className="text-primary shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-on-surface mb-1">
                      If your preferred time slot is not available, please
                      leave us a message.
                    </p>
                    {anyCutoffBlocked && (
                      <p className="text-on-surface-variant mb-2">
                        {PRIVATE_BOOKING_WHATSAPP_FALLBACK}
                      </p>
                    )}
                    <a
                      href={buildWhatsAppUrl(waMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dim font-semibold inline-flex items-center gap-1"
                    >
                      Message us on WhatsApp
                      <span aria-hidden="true">&rarr;</span>
                    </a>
                  </div>
                </div>
```

Le titre est le texte cliente VERBATIM. La variable `waMessage` existante reste. Adapter son texte pour le cas général :

```typescript
            const waMessage = `Hi, I would like to book a private session on ${formatDateLong(
              date,
            )} but my preferred time slot is not available online. Can you help?`;
```

- [ ] **Step 2: Lint + vérification visuelle**

Run: `npm run lint`
Puis `npm run dev` : sur `/booking/private`, choisir une date à J+7 : l'encadré s'affiche avec le texte cliente. Choisir aujourd'hui : l'encadré affiche en plus la ligne cutoff. Tester à 375px.

- [ ] **Step 3: Commit**

```bash
git add src/app/booking/private/PrivateWizard.tsx
git commit -m "fix(booking): encadre WhatsApp visible tous les jours sur le selecteur de creneaux prives"
```

---

### Task 6: Mode de facturation per-person | flat + calcul partagé (TDD)

Le passage du groupe adulte à un prix fixe par session casse l'hypothèse « montant = prix x participants » codée dans checkout, admin et wizard. On introduit `billing` sur `PriceItem` et un calcul partagé.

**Files:**
- Modify: `src/content/pricing.ts:20-38` (interface `PriceItem`)
- Create: `src/lib/booking/pricing.ts`
- Test: `src/lib/booking/pricing.test.ts`
- Modify: `src/app/api/checkout/route.ts:130` et `:200-205`
- Modify: `src/app/api/admin/bookings/route.ts:43-45`
- Modify: `src/app/booking/private/PrivateWizard.tsx:98-101` et `:371`

**Interfaces:**
- Produces:
  - Champ optionnel `billing?: "per-person" | "flat"` sur `PriceItem` (absent = `"per-person"`, comportement historique).
  - `computeBookingAmount(item: Pick<PriceItem, "price" | "billing">, numParticipants: number): number`
  - `getStripeQuantity(item: Pick<PriceItem, "billing">, numParticipants: number): number`
  - Task 7 s'appuie sur `billing: "flat"` pour `private-adult-group` et `private-adult-10pack`.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `src/lib/booking/pricing.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { computeBookingAmount, getStripeQuantity } from "./pricing";

describe("computeBookingAmount", () => {
  it("multiplies per-person items by participants (historic behavior)", () => {
    expect(computeBookingAmount({ price: 1000, billing: "per-person" }, 3)).toBe(3000);
  });

  it("defaults to per-person when billing is undefined", () => {
    expect(computeBookingAmount({ price: 400 }, 2)).toBe(800);
  });

  it("keeps flat items at the listed price regardless of participants", () => {
    expect(computeBookingAmount({ price: 1400, billing: "flat" }, 2)).toBe(1400);
    expect(computeBookingAmount({ price: 1400, billing: "flat" }, 3)).toBe(1400);
  });

  it("returns 0 for null price", () => {
    expect(computeBookingAmount({ price: null }, 2)).toBe(0);
  });
});

describe("getStripeQuantity", () => {
  it("bills one line item per participant on per-person items", () => {
    expect(getStripeQuantity({ billing: "per-person" }, 3)).toBe(3);
    expect(getStripeQuantity({}, 2)).toBe(2);
  });

  it("bills a single line item on flat items", () => {
    expect(getStripeQuantity({ billing: "flat" }, 3)).toBe(1);
  });
});
```

- [ ] **Step 2: Vérifier l'échec**

Run: `npm run test`
Expected: FAIL, module `./pricing` introuvable.

- [ ] **Step 3: Ajouter le champ `billing` à `PriceItem`**

Dans `src/content/pricing.ts`, dans l'interface `PriceItem` (après la ligne `bookingType: BookingType;`) :

```typescript
  /** How the amount scales with participants. Absent = "per-person". */
  billing?: "per-person" | "flat";
```

- [ ] **Step 4: Créer `src/lib/booking/pricing.ts`**

```typescript
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
```

- [ ] **Step 5: Vérifier que les tests passent**

Run: `npm run test`
Expected: tous les tests PASS (capacity + pricing).

- [ ] **Step 6: Brancher le checkout public**

Dans `src/app/api/checkout/route.ts` :
- Ligne `const totalAmount = pkg.price * data.num_participants;` devient :

```typescript
    const totalAmount = computeBookingAmount(pkg, data.num_participants);
```

- Dans `stripe.checkout.sessions.create`, le line item devient :

```typescript
      line_items: [
        {
          price: stripePriceId,
          quantity: getStripeQuantity(pkg, data.num_participants),
        },
      ],
```

- Import :

```typescript
import { computeBookingAmount, getStripeQuantity } from "@/lib/booking/pricing";
```

- [ ] **Step 7: Brancher l'API admin**

Dans `src/app/api/admin/bookings/route.ts`, remplacer :

```typescript
  const priceAmount =
    data.price_amount ?? (pkg.price ?? 0) * data.num_participants;
```

par :

```typescript
  const priceAmount =
    data.price_amount ?? computeBookingAmount(pkg, data.num_participants);
```

avec l'import :

```typescript
import { computeBookingAmount } from "@/lib/booking/pricing";
```

- [ ] **Step 8: Brancher le wizard privé**

Dans `src/app/booking/private/PrivateWizard.tsx` :
- Remplacer le calcul `totalAmount` (lignes 98-101) par :

```typescript
  const totalAmount = selectedPackage
    ? computeBookingAmount(selectedPackage, contact.numParticipants)
    : 0;
```

- Remplacer la note du review (ligne 371) :

```typescript
            note={
              isGroup
                ? selectedPackage.billing === "flat"
                  ? "One price per session, whether 2 or 3 people join."
                  : "Price per person for group sessions."
                : undefined
            }
```

- Import :

```typescript
import { computeBookingAmount } from "@/lib/booking/pricing";
```

- [ ] **Step 9: Lint + build + tests**

Run: `npm run lint && npm run build && npm run test`
Expected: 0 erreur. (Comportement inchangé à ce stade : aucun item n'a encore `billing: "flat"`.)

- [ ] **Step 10: Commit**

```bash
git add src/content/pricing.ts src/lib/booking/pricing.ts src/lib/booking/pricing.test.ts src/app/api/checkout/route.ts src/app/api/admin/bookings/route.ts src/app/booking/private/PrivateWizard.tsx
git commit -m "feat(pricing): mode de facturation per-person/flat avec calcul partage client-serveur-admin"
```

---

### Task 7: Nouveaux tarifs privés adultes dans le catalogue (1000 / 9000 / 1400 flat)

**Files:**
- Modify: `src/content/pricing.ts:281-321` (private-adult-solo, private-adult-group) + insertion du 10-pack entre les deux

**Interfaces:**
- Consumes: champ `billing` (Task 6).
- Produces: item `private-adult-10pack` (id utilisé par Tasks 8, 12, 13). IMPORTANT : ne PAS toucher aux champs `stripeProductId*`/`stripePriceId*` existants de solo/group (Task 8 les synchronise).

- [ ] **Step 1: Mettre à jour `private-adult-solo`**

Dans `src/content/pricing.ts`, remplacer les champs de l'objet `private-adult-solo` (garder les 4 champs stripe* tels quels) :

```typescript
    name: "Private Lesson 1-on-1 (Adult)",
    nameShort: "Private 1-on-1",
    category: "private-adult",
    price: 1000,
    currency: "THB",
    unit: "session",
    description: "60-minute private session with a dedicated trainer. Fully personalized.",
    includes: [
      "60 minutes 1-on-1",
      "Tailored to your level and goals",
      "All equipment provided",
    ],
    bookingType: "private",
```

- [ ] **Step 2: Insérer `private-adult-10pack` juste après `private-adult-solo`**

```typescript
  {
    id: "private-adult-10pack",
    name: "Private 1-on-1 Pack, 10 Sessions (Adult)",
    nameShort: "Private 10-Pack",
    category: "private-adult",
    price: 9000,
    currency: "THB",
    unit: "10 sessions",
    description:
      "Ten 60-minute private sessions at a pack rate (save 1,000 THB). Book your first session online, then schedule the other nine directly with the camp.",
    includes: [
      "10 private sessions of 60 minutes",
      "First session booked online, 9 more scheduled with the camp",
      "All equipment provided",
    ],
    notes: "Pack rate. First session booked at checkout; the remaining 9 are scheduled at the camp or on WhatsApp.",
    billing: "flat",
    bookingType: "private",
  },
```

Note : pas d'em dash dans `name` (règle projet), la virgule est voulue.

- [ ] **Step 3: Mettre à jour `private-adult-group`**

Remplacer les champs (garder les 4 champs stripe*) :

```typescript
    name: "Private Group 2-3 (Adult)",
    nameShort: "Private Group",
    category: "private-adult",
    price: 1400,
    currency: "THB",
    unit: "session",
    description: "Private session for 2-3 people with one trainer (3 people max). One price per session.",
    includes: [
      "60 minutes with 1 trainer",
      "For 2-3 participants (3 max)",
      "All equipment provided",
    ],
    notes: "One price per session, whether 2 or 3 people join. Minimum 2, maximum 3 participants.",
    billing: "flat",
    bookingType: "private",
```

- [ ] **Step 4: Vérifier le wizard**

Run: `npm run dev`, ouvrir `/booking/private` :
- Le 10-pack apparaît en étape « Session type » à 9,000 THB / 10 sessions.
- Groupe adulte : à l'étape Contact, sélectionner 3 participants ; au Review, total = 1,400 THB (pas 4,200), note « One price per session ».
- Solo : total 1,000 THB.

- [ ] **Step 5: Lint + build + tests + commit**

Run: `npm run lint && npm run build && npm run test`

```bash
git add src/content/pricing.ts
git commit -m "feat(pricing): tarifs prives adultes 2026 (solo 1000, pack 10 seances 9000, groupe 1400 fixe)"
```

---

### Task 8: Synchronisation Stripe des changements de prix (extension du seed)

Le script de seed est idempotent par présence d'ID : il ne re-crée rien pour un item déjà seedé dont le prix a changé. On ajoute une passe de synchronisation : nouveau Price sur le produit existant, default_price mis à jour, ancien Price désactivé, nom/description du produit rafraîchis, nouveau Price ID réécrit dans `pricing.ts`.

**Files:**
- Modify: `scripts/stripe-seed-products.ts` (dans `main()`, après la boucle de création, avant l'écriture finale de `fileContent` sur disque ; lire la fin du fichier pour localiser le `fs.writeFileSync`)

**Interfaces:**
- Consumes: items modifiés en Tasks 7 et 9 (solo 1000, group 1400, unlimited 35000) + nouvel item 10-pack (créé par la boucle de seed existante).

- [ ] **Step 1: Ajouter la passe de synchronisation**

Dans `main()`, après la boucle `for (const item of toSeed) { ... }` et avant l'écriture du fichier, insérer :

```typescript
  // Sync pass: items already seeded whose catalog price no longer matches
  // the active Stripe price. Creates a new Price on the same Product,
  // makes it the default, deactivates the old one, refreshes name/description,
  // and rewrites the price ID in pricing.ts.
  const seeded = PRICES.filter(
    (p) =>
      p.price !== null &&
      p[priceField as keyof typeof p] &&
      !p.id.startsWith("bodyweight-"),
  );

  for (const item of seeded) {
    const currentPriceId = item[priceField as keyof typeof item] as string;
    const current = await stripe.prices.retrieve(currentPriceId);
    const expected = item.price! * 100;
    if (current.unit_amount === expected) continue;

    console.log(
      `  ~ ${item.id}: ${current.unit_amount} -> ${expected} satang (new price)`,
    );

    const productId =
      typeof current.product === "string" ? current.product : current.product.id;

    const description = [item.description, item.notes]
      .filter(Boolean)
      .join(" - ");

    const newPrice = await stripe.prices.create({
      product: productId,
      unit_amount: expected,
      currency: "thb",
    });
    await stripe.products.update(productId, {
      name: item.name,
      description,
      default_price: newPrice.id,
    });
    // Deliberately NOT deactivating the old price here: in LIVE mode the
    // currently deployed code still references it until the new deploy is
    // out. Deactivating it during that window would break live checkouts.
    // Old prices are archived AFTER the deploy (see handoff checklist).
    console.log(`    old price kept active for zero-downtime cutover: ${currentPriceId}`);

    fileContent = fileContent.replace(currentPriceId, newPrice.id);
  }
```

- [ ] **Step 2: Lancer le seed en mode TEST**

Vérifier que `.env.local` contient une clé `sk_test_`, puis :

Run: `npm run stripe:seed`
Expected:
- Création du produit `private-adult-10pack` (boucle existante).
- Sync de `private-adult-solo` (80000 -> 100000 satang), `private-adult-group` (60000 -> 140000). (Le sync de `dtv-6m-unlimited` arrivera après la Task 9 ; relancer le seed à ce moment-là.)
- `pricing.ts` mis à jour avec les nouveaux `stripePriceIdTest`.

- [ ] **Step 3: Vérifier dans le dashboard Stripe (TEST)**

Les produits solo/group montrent le nouveau prix par défaut (l'ancien price reste actif : il sera archivé en post-déploiement, voir Task 13), le produit groupe affiche la nouvelle description « One price per session ».

- [ ] **Step 4: Checkout E2E de contrôle**

Flux wizard privé solo en local : la page Stripe affiche 1,000 THB. Groupe 3 personnes : 1,400 THB (quantity 1). Ne pas payer (abandonner), nettoyer le booking pending + block via la purge de la Task 13 ou immédiatement.

- [ ] **Step 5: Commit**

```bash
git add scripts/stripe-seed-products.ts src/content/pricing.ts
git commit -m "feat(stripe): le seed synchronise les changements de prix (nouveau price + archivage de l'ancien)"
```

---

### Task 9: DTV : tarif illimité 35 000 + textes de politique + encadré WhatsApp

**Files:**
- Create: `src/content/policies.ts`
- Modify: `src/content/pricing.ts:604-626` (dtv-6m-unlimited) + notes des 3 items DTV
- Modify: `src/app/visa/dtv/page.tsx` (FAQ l.127-130, zone sous packages l.325-328, nouvel encadré WhatsApp dans la section packages)
- Modify: `src/app/visa/dtv/apply/DtvApplyForm.tsx` (texte du bloc commitment, vers l.401-405)
- Modify: `src/app/pricing/page.tsx:64` (offerCatalogSchema DTV unlimited) et la zone DTV (l.662-719, note de politique)
- Modify: `src/lib/email/templates/DTVApplicationReceived.tsx` (disclaimer remboursement)
- Modify: `src/app/terms/page.tsx` (clause DTV : aligner sur 50% refund + 50% voucher)

**Interfaces:**
- Produces: constantes `DTV_POLICY_DELIVERY`, `DTV_POLICY_REFUSAL`, `DTV_WHATSAPP_CUSTOM_PLAN`, `PRIVATE_CANCELLATION_POLICY`, `ROOM_RESERVATION_POLICY` (les 2 dernières consommées en Task 11).

- [ ] **Step 1: Créer `src/content/policies.ts`**

Textes cliente VERBATIM, ne pas reformuler :

```typescript
/**
 * Client-provided policy texts (July 2026 brief). VERBATIM: do not rewrite,
 * do not run through humanizer, do not translate.
 */

export const PRIVATE_CANCELLATION_POLICY =
  "Private lesson bookings are non-refundable and cannot be rescheduled if cancelled less than 24 hours before the scheduled session.";

export const ROOM_RESERVATION_POLICY =
  "Room reservations are non-refundable and non-exchangeable.";

export const DTV_POLICY_DELIVERY =
  "Documents are delivered within 24 hours of receiving your payment (on business days).";

export const DTV_POLICY_REFUSAL =
  "If your DTV visa application is refused, you may request a 50% refund within a maximum of 3 weeks after payment, provided you submit official proof of the visa refusal. The remaining 50% will be issued as a training voucher of the same value, valid for use at our gym.";

export const DTV_WHATSAPP_CUSTOM_PLAN =
  "Need a 9-month or 12-month training plan? Or a personalized program including private lessons or any other special request? Please contact us via WhatsApp.";
```

- [ ] **Step 2: Mettre à jour `dtv-6m-unlimited` dans `pricing.ts`**

- `price: 33000` devient `price: 35000`.
- `description` devient :

```typescript
    description: "DTV visa training package. Unlimited group training (1-2 sessions per day) for 6 months. Fighter Program not included. Includes official enrollment letter for your DTV application.",
```

- Dans `includes`, remplacer `"Unlimited training (1-2 sessions per day)"` par `"Unlimited group training (1-2 sessions per day)"` et ajouter en fin de liste `"Fighter Program not included"`.
- Pour LES TROIS items DTV, remplacer le champ `notes` par :

```typescript
    notes: "Documents delivered within 24h of payment (business days). If the visa is refused: 50% refund within 3 weeks of payment with official proof, plus a 50% training voucher.",
```

(Résumé pour Stripe/admin ; les surfaces publiques affichent le texte long verbatim via policies.ts.)

- [ ] **Step 3: Mettre à jour `/visa/dtv`**

Dans `src/app/visa/dtv/page.tsx` :
- FAQ (l.127-130) : remplacer la réponse sur le remboursement par les deux textes cliente concaténés : `` `${DTV_POLICY_DELIVERY} ${DTV_POLICY_REFUSAL}` ``.
- Zone sous les packages (l.325-328) : remplacer la phrase « No refund... voucher » par `{DTV_POLICY_REFUSAL}` (le texte delivery apparaît déjà dans le process ; vérifier que le « 24 hours » du process dit bien « on business days », sinon l'aligner avec `DTV_POLICY_DELIVERY`).
- Dans la section packages, ajouter un encadré (même style que les encadrés d'info existants de la page, bordure `border-primary/30 bg-primary/5`) contenant `{DTV_WHATSAPP_CUSTOM_PLAN}` suivi d'un lien `buildWhatsAppUrl("Hi, I am interested in a custom DTV training plan (9-12 months or personalized program).")` libellé « Message us on WhatsApp ».
- Imports : `import { DTV_POLICY_DELIVERY, DTV_POLICY_REFUSAL, DTV_WHATSAPP_CUSTOM_PLAN } from "@/content/policies";` et `buildWhatsAppUrl` depuis `@/content/schedule` s'il n'y est pas déjà.

- [ ] **Step 4: Mettre à jour le formulaire, la page pricing, l'email, les terms**

- `DtvApplyForm.tsx` bloc commitment : remplacer la phrase de politique par `{DTV_POLICY_REFUSAL}` (import depuis policies.ts). Le label de la checkbox reste une confirmation d'engagement.
- `src/app/pricing/page.tsx` : offerCatalogSchema l.64 : `price: 33000` -> `35000` et description `"DTV visa package, unlimited group training for 6 months (Fighter Program not included)"`. Dans la zone DTV (l.662-719) : les cartes lisent déjà les prix ? Le rapport d'exploration indique des montants EN DUR : remplacer chaque montant DTV en dur par la valeur de `pricing.ts` (voir Task 12 pour le pattern), et remplacer la note de politique l.717-719 par `{DTV_POLICY_REFUSAL}`.
- `DTVApplicationReceived.tsx` : remplacer le disclaimer « no refund but training voucher » par les deux phrases cliente (delivery + refusal), texte brut dans le template email.
- `src/app/terms/page.tsx` : localiser la clause DTV (« refund », « voucher ») et la remplacer par les deux textes cliente. Ne pas toucher au reste des terms.

- [ ] **Step 5: Relancer le seed pour synchroniser 35 000 (TEST)**

Run: `npm run stripe:seed`
Expected: sync `dtv-6m-unlimited` 3300000 -> 3500000 satang, nouveau `stripePriceIdTest` écrit dans pricing.ts.

- [ ] **Step 6: Lint + build + vérification visuelle**

Run: `npm run lint && npm run build`
Puis vérifier `/visa/dtv` (prix 35,000, encadré WhatsApp, politique), `/visa/dtv/apply` (checkbox), `/pricing` (section DTV), `/terms`.

- [ ] **Step 7: Commit**

```bash
git add src/content/policies.ts src/content/pricing.ts src/app/visa/dtv/page.tsx src/app/visa/dtv/apply/DtvApplyForm.tsx src/app/pricing/page.tsx src/lib/email/templates/DTVApplicationReceived.tsx src/app/terms/page.tsx
git commit -m "feat(dtv): illimite a 35000 THB, nouvelle politique de remboursement 50/50, encadre plans personnalises"
```

---

### Task 10: DTV : champ date de naissance

**Files:**
- Create: `supabase/migrations/20260710000000_dtv_date_of_birth.sql` (miroir local)
- Modify: `src/lib/validation/dtv-application.ts`
- Modify: `src/app/visa/dtv/apply/DtvApplyForm.tsx` (FormState, INITIAL_STATE, validate(), champ UI section Personal, payload submit)
- Modify: `src/app/api/visa/dtv/apply/route.ts:47-62` (insert)
- Modify: `src/app/api/webhooks/stripe/route.ts:98-112` (mapping DtvApplicationEmailData)
- Modify: `src/lib/email/templates/DTVApplicationReceived.tsx` (type `DtvApplicationEmailData` + ligne dans l'email admin si le type y est partagé)
- Modify: `src/lib/email/templates/DTVAdminNotification.tsx` (ligne Date of birth dans la carte contact)
- Modify: `src/app/admin/(dashboard)/dtv-applications/[id]/page.tsx` (affichage)

**Interfaces:**
- Produces: colonne `dtv_applications.date_of_birth date` (nullable : les 5 dossiers existants n'en ont pas), champ `date_of_birth: string` (yyyy-MM-dd) dans le payload API.

- [ ] **Step 1: Appliquer la migration (MCP + miroir)**

Via `mcp__supabase-ratchawat__apply_migration`, name `dtv_date_of_birth`, query :

```sql
alter table public.dtv_applications add column date_of_birth date;
```

Créer le miroir `supabase/migrations/20260710000000_dtv_date_of_birth.sql` avec le même SQL précédé d'un commentaire :

```sql
-- Client brief July 2026 (5.2): date of birth on the DTV application form.
-- Nullable: applications submitted before this migration have no value.
alter table public.dtv_applications add column date_of_birth date;
```

Vérifier avec `mcp__supabase-ratchawat__list_tables` que la colonne existe.

- [ ] **Step 2: Zod serveur**

Dans `src/lib/validation/dtv-application.ts`, ajouter dans l'objet (après `email`) :

```typescript
    date_of_birth: DateString,
```

et dans le `superRefine`, ajouter :

```typescript
    const dob = new Date(`${data.date_of_birth}T00:00:00`);
    const oldest = new Date("1920-01-01T00:00:00");
    if (Number.isNaN(dob.getTime()) || dob >= today || dob < oldest) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["date_of_birth"],
        message: "Enter a valid date of birth.",
      });
    }
```

(Pas de règle d'âge minimum : non demandée par la cliente, ne pas l'inventer.)

- [ ] **Step 3: Formulaire client**

Dans `DtvApplyForm.tsx` :
- `FormState` : ajouter `date_of_birth: string;` après `email`.
- `INITIAL_STATE` : `date_of_birth: "",`.
- `validate()` : après le bloc email :

```typescript
  if (!form.date_of_birth) {
    errors.date_of_birth = "Required.";
  } else {
    const dob = new Date(`${form.date_of_birth}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(dob.getTime()) || dob >= today) {
      errors.date_of_birth = "Enter a valid date of birth.";
    }
  }
```

- Champ UI dans la section « 1. Personal details », après le couple first/last name (dans la grille) :

```tsx
          <div data-field="date_of_birth">
            <FieldLabel required>Date of birth</FieldLabel>
            <input
              type="date"
              value={form.date_of_birth}
              onChange={(e) => update("date_of_birth", e.target.value)}
              className={inputCls}
              autoComplete="bday"
              max={new Date().toISOString().split("T")[0]}
            />
            {errors.date_of_birth && (
              <p className="text-primary text-xs mt-1">{errors.date_of_birth}</p>
            )}
          </div>
```

- Payload `handleSubmit` : ajouter `date_of_birth: form.date_of_birth,` après `email`.

- [ ] **Step 4: API + webhook + emails + admin**

- `src/app/api/visa/dtv/apply/route.ts` : dans l'insert, ajouter `date_of_birth: data.date_of_birth,` après `email`.
- `DtvApplicationEmailData` (dans `DTVApplicationReceived.tsx`) : ajouter `date_of_birth: string | null;`.
- Webhook `route.ts` mapping `appData` : ajouter `date_of_birth: app.date_of_birth,`.
- `DTVAdminNotification.tsx` : dans la carte contact/passport, ajouter une ligne `Date of birth: {formatted}` (même format de date que les lignes voisines ; gérer le null avec un tiret simple "-").
- `src/app/admin/(dashboard)/dtv-applications/[id]/page.tsx` : ajouter la ligne « Date of birth » dans le bloc client (gérer null pour les anciens dossiers).

- [ ] **Step 5: Lint + build + E2E local**

Run: `npm run lint && npm run build`
E2E : soumettre le formulaire DTV complet en local (Stripe test, ne pas payer OU payer avec 4242 si `stripe listen` actif), vérifier : row `dtv_applications` avec `date_of_birth`, page admin qui l'affiche, email admin (si payé). Vérifier aussi qu'un ancien dossier sans date de naissance s'affiche sans crash. Nettoyer le dossier de test.

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260710000000_dtv_date_of_birth.sql src/lib/validation/dtv-application.ts src/app/visa/dtv/apply/DtvApplyForm.tsx src/app/api/visa/dtv/apply/route.ts src/app/api/webhooks/stripe/route.ts src/lib/email/templates/DTVApplicationReceived.tsx src/lib/email/templates/DTVAdminNotification.tsx "src/app/admin/(dashboard)/dtv-applications/[id]/page.tsx"
git commit -m "feat(dtv): champ date de naissance (formulaire, DB, admin, emails)"
```

---

### Task 11: Contenus camps + policies de réservation

**Files:**
- Modify: `src/app/camps/plai-laem/page.tsx:159-218` (section The Gym)
- Modify: `src/app/accommodation/page.tsx:349,366` (titres cartes 1 Week / 2 Weeks)
- Modify: `src/app/booking/camp-stay/CampStayWizard.tsx` (étape Review : politique Room)
- Modify: `src/app/booking/fighter/FighterWizard.tsx` (étape Review, tiers stay uniquement : politique Room)
- Modify: `src/app/booking/private/PrivateWizard.tsx` (étape Review : politique privée)
- Modify: `src/lib/email/templates/BookingConfirmed.tsx` (rappel de la politique dans l'email client)

**Interfaces:**
- Consumes: `PRIVATE_CANCELLATION_POLICY`, `ROOM_RESERVATION_POLICY` de `@/content/policies` (Task 9).

- [ ] **Step 1: Paragraphe Plai Laem**

Dans la section « The Gym » de `src/app/camps/plai-laem/page.tsx` (colonne texte, l.167-184), ajouter un paragraphe après les paragraphes existants. Proposition de base à passer au /humanizer avant commit :

```tsx
            <p>
              Plai Laem is the only camp with on-site accommodation: 7 standard
              rooms and a private bungalow a few steps from the ring. It also
              has a dedicated bodyweight training section and an ice bath area
              for recovery. If you want to stay, train, and recover in the same
              place, this is the camp for it.
            </p>
```

(Faits vérifiés : hébergement uniquement à Plai Laem, 7 rooms + 1 bungalow, bodyweight section, ice bath. Ne pas mentionner Bo Phut négativement.)

- [ ] **Step 2: Mention « Standard Room » sur les cartes**

Dans `src/app/accommodation/page.tsx`, les titres des deux cartes courtes durées (l.349 et l.366, actuellement du type "1 Week (Room)" ou "1 Week") deviennent exactement :
- `1 Week · Standard Room`
- `2 Weeks · Standard Room`
(Point médian `·`, PAS un em dash. Vérifier le rendu : si le titre casse en mobile 375px, autorisé : `1 Week, Standard Room`.)

- [ ] **Step 3: Politique privée sur le wizard privé**

Dans `PrivateWizard.tsx`, étape Review (step 4), juste après le composant `<BookingReview ... />` :

```tsx
          <p className="text-xs text-on-surface-variant border-l-2 border-primary/40 pl-3">
            {PRIVATE_CANCELLATION_POLICY}
          </p>
```

Import : `import { PRIVATE_CANCELLATION_POLICY } from "@/content/policies";`

- [ ] **Step 4: Politique Room sur camp-stay et fighter (tiers stay)**

- `CampStayWizard.tsx`, étape Review, même pattern après le `<BookingReview ... />` :

```tsx
          <p className="text-xs text-on-surface-variant border-l-2 border-primary/40 pl-3">
            {ROOM_RESERVATION_POLICY}
          </p>
```

- `FighterWizard.tsx`, étape Review : même bloc, mais UNIQUEMENT si le tier sélectionné inclut l'hébergement (les tiers stay sont identifiables par leur price_id contenant `stay`, réutiliser la fonction/condition locale existante du wizard, ex. `getStayInventoryKey(priceId) !== null`) :

```tsx
          {isStayTier && (
            <p className="text-xs text-on-surface-variant border-l-2 border-primary/40 pl-3">
              {ROOM_RESERVATION_POLICY}
            </p>
          )}
```

(Adapter `isStayTier` au nom réel de la condition dans le fichier ; la logique existe déjà pour verrouiller le camp sur Plai Laem.)

- [ ] **Step 4b: Rappel de la politique dans l'email de confirmation client**

Le client garde ainsi la politique par écrit (réduit les litiges). Dans `src/lib/email/templates/BookingConfirmed.tsx` (email CLIENT uniquement ; ne pas toucher `BookingNotification`, l'admin connaît ses politiques), juste après la `<Section>` du résumé et avant le premier `<Hr />` :

```tsx
          {booking.type === "private" && (
            <Text style={{ fontSize: 12, color: "#999" }}>
              {PRIVATE_CANCELLATION_POLICY}
            </Text>
          )}
          {includesAccommodation && (
            <Text style={{ fontSize: 12, color: "#999" }}>
              {ROOM_RESERVATION_POLICY}
            </Text>
          )}
```

avec, près du haut du composant :

```typescript
  const includesAccommodation =
    booking.type === "camp-stay" || booking.price_id.includes("stay");
```

et l'import :

```typescript
import {
  PRIVATE_CANCELLATION_POLICY,
  ROOM_RESERVATION_POLICY,
} from "@/content/policies";
```

Notes : `booking.price_id.includes("stay")` capte les combos `fighter-stay-*` actuels ET les futurs ids `stay-*` de la vague 2b (aucune retouche à prévoir là-bas), tandis que `fighter-monthly` (sans hébergement) et le DTV ne matchent pas. La politique DTV, elle, est déjà traitée dans `DTVApplicationReceived` (Task 9).

- [ ] **Step 5: /humanizer sur le paragraphe Plai Laem**

Passer le paragraphe du Step 1 au /humanizer (PAS les textes de policies : verbatim cliente).

- [ ] **Step 6: Lint + build + vérification visuelle (375px + desktop)**

Run: `npm run lint && npm run build`
Vérifier `/camps/plai-laem`, `/accommodation`, et les 3 wizards à l'étape Review.

- [ ] **Step 7: Commit**

```bash
git add src/app/camps/plai-laem/page.tsx src/app/accommodation/page.tsx src/app/booking/camp-stay/CampStayWizard.tsx src/app/booking/fighter/FighterWizard.tsx src/app/booking/private/PrivateWizard.tsx src/lib/email/templates/BookingConfirmed.tsx
git commit -m "feat(content): equipements exclusifs Plai Laem, mention Standard Room, policies sur les wizards et l'email de confirmation"
```

---

### Task 12: Résorber la duplication des prix privés (pages + JSON-LD + llms)

Les surfaces qui réécrivent les montants en dur doivent lire `pricing.ts`. Périmètre vague 1 : prix PRIVÉS + DTV (l'accommodation part en vague 2).

**Files:**
- Modify: `src/app/pricing/page.tsx` (section Private Lessons l.334-390, offerCatalogSchema l.56-59, meta description si elle cite un prix privé)
- Modify: `src/app/programs/private/page.tsx` (courseSchema l.29, bloc pricing l.196-211, GEO l.220, CTA l.227)
- Modify: `public/llms.txt` + `public/llms-full.txt` (prix privés + DTV)

**Interfaces:**
- Consumes: `getPriceById` de `@/content/pricing`.

- [ ] **Step 1: `/pricing` section Private Lessons**

En tête de fichier (Server Component), ajouter `import { getPriceById } from "@/content/pricing";` s'il n'y est pas déjà, puis résoudre les items une fois :

```typescript
const privateAdultSolo = getPriceById("private-adult-solo")!;
const privateAdult10 = getPriceById("private-adult-10pack")!;
const privateAdultGroup = getPriceById("private-adult-group")!;
const privateKidsSolo = getPriceById("private-kids-solo")!;
const privateKidsGroup = getPriceById("private-kids-group")!;
```

Carte Adult : les `<li>` deviennent (montants dynamiques, nouveau 10-pack) :

```tsx
                <li className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 text-on-surface-variant">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>1-on-1 private session (60 min)</span>
                  </div>
                  <span className="font-bold text-primary shrink-0">{privateAdultSolo.price!.toLocaleString("en-US")} THB</span>
                </li>
                <li className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 text-on-surface-variant">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>10-session pack, 1-on-1 (60 min each)</span>
                  </div>
                  <span className="font-bold text-primary shrink-0">{privateAdult10.price!.toLocaleString("en-US")} THB</span>
                </li>
                <li className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-2 text-on-surface-variant">
                    <Check size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>Small group private session (60 min, 2-3 people, one price per session)</span>
                  </div>
                  <span className="font-bold text-primary shrink-0">{privateAdultGroup.price!.toLocaleString("en-US")} THB</span>
                </li>
```

Carte Kids : mêmes remplacements avec `privateKidsSolo.price!` et `privateKidsGroup.price!` (libellés existants conservés, toujours per-person pour les kids : garder « /kid » ou équivalent si présent).

- [ ] **Step 2: `/pricing` offerCatalogSchema**

Remplacer les 2 entrées privées adultes (l.56-57) et ajouter le pack :

```typescript
              { name: "Private Lesson Adult 1-on-1", price: privateAdultSolo.price!, description: "60-minute solo private session" },
              { name: "Private 10-Session Pack Adult 1-on-1", price: privateAdult10.price!, description: "Ten 60-minute solo private sessions" },
              { name: "Private Lesson Adult Group", price: privateAdultGroup.price!, description: "60-minute private session for 2-3 people, one price per session" },
              { name: "Private Lesson Kids 1-on-1", price: privateKidsSolo.price!, description: "60-minute solo private session for kids" },
              { name: "Private Lesson Kids Group", price: privateKidsGroup.price!, description: "60-minute group private session for kids, price per kid" },
```

Les entrées DTV du schema pointent sur les prix de pricing.ts de la même façon (`getPriceById("dtv-6m-2x")!.price!`, etc.) : plus aucun montant DTV en dur.

- [ ] **Step 3: `/programs/private`**

- `courseSchema` : `offers: { price: 1000, priceCurrency: "THB" }` via `getPriceById("private-adult-solo")!.price!`.
- Bloc 4 tuiles (l.196-211) : remplacer les 4 montants en dur par les valeurs de pricing.ts (mêmes constantes que Step 1). La tuile groupe adulte devient `1,400 THB` avec le suffixe `per session` (plus « /person ») ; ajouter une 5e tuile pour le 10-pack : label `10-session pack`, montant `9,000 THB`.
- GEO passage (l.220) : remplacer « run 60 minutes for 800 THB per session » par « run 60 minutes for 1,000 THB per session, with a 10-session pack at 9,000 THB » (le reste de la phrase inchangé).
- CTA (l.227) : « From 800 THB per hour » devient « From 1,000 THB per hour ».

- [ ] **Step 4: llms.txt + llms-full.txt**

Dans `public/llms.txt` et `public/llms-full.txt`, mettre à jour toute mention : privé solo 800 -> 1,000 THB ; groupe 600/person -> 1,400 per session (2-3 people) ; ajouter le 10-pack 9,000 THB ; DTV unlimited 33,000 -> 35,000 THB (+ « Fighter Program not included »).

- [ ] **Step 5: Chasse aux retardataires**

```bash
grep -rn "800 THB\|600 THB\|33,000\|33000" src/ public/llms.txt public/llms-full.txt --include="*.tsx" --include="*.ts" --include="*.txt" | grep -v pricing.ts | grep -v ".test.ts"
```

Analyser chaque hit : les 600 THB kids solo sont LÉGITIMES (kids inchangés), les mentions de 800 privé adulte ou 33000 DTV ne doivent plus exister. Corriger les retardataires trouvés (homepage, FAQ, emails éventuels).

- [ ] **Step 6: Lint + build + validation schémas**

Run: `npm run lint && npm run build`
Vérifier `/pricing` et `/programs/private` en dev + valider le JSON-LD (copier le script généré dans validator.schema.org, 0 erreur).

- [ ] **Step 7: Commit**

```bash
git add src/app/pricing/page.tsx src/app/programs/private/page.tsx public/llms.txt public/llms-full.txt
git commit -m "refactor(pricing): les pages et schemas lisent pricing.ts, fin des montants prives/DTV en dur"
```

---

### Task 13: Recette finale vague 1 + documentation

**Files:**
- Modify: `PROJECT-STATUS.md` (correction history + known issues)
- Modify: `ROADMAP.md` (nouvelle section vague 1 juillet 2026)
- Modify: `ARCHITECTURE.md` (billing mode, policies.ts, colonne date_of_birth, seed sync)

- [ ] **Step 1: Suite E2E locale complète**

Avec `npm run dev` + `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (clés TEST) :
1. Privé solo adulte : wizard complet, Stripe affiche 1,000 THB, payer 4242, booking `confirmed`, email reçu (avec le rappel de la politique 24h non-refundable), block créé.
2. Privé groupe 3 adultes : Stripe affiche 1,400 THB (quantity 1), payer, `confirmed`.
3. 10-pack : Stripe affiche 9,000 THB, payer, `confirmed`.
4. Admin : créer une résa privée sur le créneau du test 1 (même camp) : OK (2/6). La créer 5 fois de plus : la 7e refuse avec « fully booked (6/6) ».
5. Paiement abandonné : checkout privé sans payer, `stripe trigger checkout.session.expired --add "checkout_session:metadata[booking_id]=<uuid>"`, vérifier booking `cancelled` + block supprimé.
6. DTV : formulaire avec date de naissance, payer 35,000 THB, vérifier row + admin + emails.
7. Encadré WhatsApp visible sur un jour à J+7.

- [ ] **Step 2: Purge des données de test**

Via MCP `mcp__supabase-ratchawat__execute_sql` : supprimer les bookings/blocks/dtv_applications créés pendant la recette (filtrer sur les emails de test utilisés). Vérifier avec un SELECT que les tables ne contiennent plus que des données réelles.

- [ ] **Step 3: Vérifications finales**

Run: `npm run lint && npm run build && npm run test`
Expected: 0 erreur partout, tous les tests verts.

- [ ] **Step 4: Documentation vivante**

- `PROJECT-STATUS.md` : entrée d'historique datée (bugs B1-B4 corrigés, tarifs 2026, DTV 35K + dob, policies, dédup prix, vitest). Mettre à jour les prix listés en section 1 (privé 1000/1400 flat/9000, DTV 35K).
- `ROADMAP.md` : section « Vague 1 juillet 2026 » avec les tâches cochées et le statut « attente approval + seed LIVE + merge ».
- `ARCHITECTURE.md` : §1 (billing mode sur PriceItem, policies.ts), §6/7b (colonne `date_of_birth`), note seed sync dans §6 Stripe.

- [ ] **Step 5: Commit final**

```bash
git add PROJECT-STATUS.md ROADMAP.md ARCHITECTURE.md
git commit -m "docs: cloture vague 1 juillet 2026 (bugs resa, tarifs, DTV, policies)"
```

- [ ] **Step 6: Handoff à Rd (NE PAS merger)**

Présenter à Rd : le diff complet (`git log --oneline main..HEAD` + résumé), les résultats de la recette E2E, et la checklist de déploiement dans l'ordre STRICT :
1. Approval du diff par Rd.
2. Rd lance `npm run stripe:seed` avec la clé LIVE (crée le 10-pack + les nouveaux prices 1000/1400/35000 en live, réécrit les IDs live dans pricing.ts ; les ANCIENS prices restent actifs, donc la prod continue de tourner normalement) ; committer ce diff sur la branche. Cette étape peut se faire à n'importe quel moment avant le merge, sans fenêtre de risque.
3. Merge dans main + déploiement Vercel.
4. Smoke test prod : /pricing affiche 1,000/9,000/1,400/35,000 ; wizard privé jusqu'à la page Stripe (SANS payer) pour vérifier le montant live ; retour arrière.
5. POST-DÉPLOIEMENT (une fois le smoke test validé) : archiver les anciens prices dans le dashboard Stripe LIVE (private-adult-solo 800, private-adult-group 600, dtv-6m-unlimited 33000) pour l'hygiène du catalogue. Non urgent, aucun impact fonctionnel.

Rappel : le rollback = revert de la PR ; comme les anciens prices restent actifs jusqu'à l'étape 5, un revert redonne un site 100 % fonctionnel immédiatement.
