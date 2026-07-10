# Vague 2a : Réservation privée v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Capacité en unités coachs (6 par camp/créneau), 19 créneaux de 30 minutes, sélecteur de participants avec bornes par type (1-6 en 1-1, 2-3 en groupe), réservation multi-créneaux multi-jours en un seul paiement, horaires publiés étendus à 20:00.

**Architecture:** Deux migrations additives (`bookings.booking_group_id`, `availability_blocks.units`). Le comptage de capacité passe de « nombre de lignes » à « somme des unités » partout (checkout, admin, calendrier public, drawer admin). Une réservation multi-créneaux = N lignes `bookings` reliées par `booking_group_id`, un seul paiement Stripe, le webhook confirme/annule le groupe entier. Le wizard privé gagne un panier de sessions.

**Tech Stack:** Next.js 16, TypeScript 5 strict, Supabase (MCP `supabase-ratchawat`), Stripe Checkout, Zod, vitest, react-day-picker, Resend.

**Spec:** `docs/superpowers/specs/2026-07-10-brief-juillet-design.md` (section 4)

## Global Constraints

- **PRÉREQUIS : vague 1 mergée.** Ce plan consomme `src/lib/booking/capacity.ts` (`hasSlotCapacity`, `isSlotClosed`, `getSlotOccupancy`), `src/lib/booking/pricing.ts` (`computeBookingAmount`, `getStripeQuantity`), le champ `billing` sur `PriceItem`, l'item `private-adult-10pack`, `src/content/policies.ts` et vitest. Vérifier leur présence avant de commencer.
- Branche : `feat/booking-v2-july` créée depuis `main` à jour. JAMAIS merger sans approval explicite de Rd.
- Site LIVE : migrations additives uniquement, via MCP `mcp__supabase-ratchawat__apply_migration` + fichier miroir `supabase/migrations/`. Jamais le MCP générique.
- Décisions figées (spec §2) : capacité = 6 coachs ; créneaux INDÉPENDANTS (pas de contrôle de chevauchement, décision cliente) ; multi-jours OK ; même package + mêmes participants pour tout le panier ; 10-pack = 1 seul créneau ; cutoff 12h pour les créneaux avant 09:30, 2h sinon.
- Les 19 créneaux VERBATIM : 07:00, 07:30, 08:00, 08:30, 09:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 18:30, 19:00.
- Copy anglais, pas d'em dash, montants `toLocaleString("en-US")`. Commits : Conventional Commits, description en français. Lint + build 0 erreur avant chaque commit.
- Aucun nouveau prix Stripe dans ce plan (les montants ne changent pas ; seul le mode de comptage change).

---

### Task 1: Branche + migrations (booking_group_id, units)

**Files:**
- Create: `supabase/migrations/20260711000000_booking_groups_and_units.sql` (miroir local)

**Interfaces:**
- Produces: colonne `bookings.booking_group_id uuid null` + index partiel ; colonne `availability_blocks.units integer not null default 1`. Données existantes : group null, units 1 (comportement inchangé).

- [ ] **Step 1: Créer la branche**

```bash
git checkout main && git pull && git checkout -b feat/booking-v2-july
```

- [ ] **Step 2: Appliquer la migration (MCP + miroir)**

Via `mcp__supabase-ratchawat__apply_migration`, name `booking_groups_and_units`, query :

```sql
-- Multi-slot private bookings: N rows share one booking_group_id (one payment).
alter table public.bookings add column booking_group_id uuid;
create index idx_bookings_group on public.bookings (booking_group_id)
  where booking_group_id is not null;

-- Trainer capacity: a 1-on-1 booking for N people consumes N trainers (units),
-- a group session consumes 1. Existing rows keep 1 (historic behavior).
alter table public.availability_blocks add column units integer not null default 1;
```

Créer le miroir `supabase/migrations/20260711000000_booking_groups_and_units.sql` avec le même SQL. Vérifier via `mcp__supabase-ratchawat__list_tables` que les colonnes existent.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260711000000_booking_groups_and_units.sql
git commit -m "feat(db): booking_group_id sur bookings et units sur availability_blocks (additif)"
```

---

### Task 2: Capacité en unités coachs (helpers + tous les consommateurs)

Le « 6 » compte désormais des coachs : une résa 1-1 à N participants consomme N unités, une résa groupe ou un 10-pack consomme 1. La règle est portée par un nouveau champ `capacity` sur `PriceItem`, distinct de `billing` (le groupe kids est facturé par enfant mais ne mobilise qu'un coach).

**Files:**
- Modify: `src/content/pricing.ts` (interface + 4 items privés + 10-pack)
- Modify: `src/lib/booking/pricing.ts` (+ `getCapacityUnits`)
- Test: `src/lib/booking/pricing.test.ts`
- Modify: `src/lib/booking/capacity.ts` (`getSlotOccupancy` somme les units)
- Modify: `src/app/api/checkout/route.ts` (pré-check + insert block + insert-then-verify avec units)
- Modify: `src/app/api/admin/bookings/route.ts` (pré-check + insert block avec units)
- Modify: `src/app/api/webhooks/stripe/route.ts` (safety-net block avec units)

**Interfaces:**
- Produces:
  - Champ `capacity?: "per-participant" | "per-session"` sur `PriceItem` (absent = `"per-session"`).
  - `getCapacityUnits(item: Pick<PriceItem, "capacity">, numParticipants: number): number`
  - `getSlotOccupancy(...)` retourne désormais la SOMME des `units` (signature inchangée).
  - Tasks 5, 7, 9 consomment `getCapacityUnits`.

- [ ] **Step 1: Tests qui échouent**

Ajouter à `src/lib/booking/pricing.test.ts` :

```typescript
import { getCapacityUnits } from "./pricing";

describe("getCapacityUnits", () => {
  it("per-participant items consume one trainer per participant", () => {
    expect(getCapacityUnits({ capacity: "per-participant" }, 4)).toBe(4);
  });

  it("per-session items consume one trainer regardless of participants", () => {
    expect(getCapacityUnits({ capacity: "per-session" }, 3)).toBe(1);
  });

  it("defaults to per-session when capacity is undefined", () => {
    expect(getCapacityUnits({}, 3)).toBe(1);
  });
});
```

Run: `npm run test` -> FAIL (`getCapacityUnits` inexistant).

- [ ] **Step 2: Implémenter**

Dans `src/content/pricing.ts`, interface `PriceItem`, après le champ `billing` :

```typescript
  /** Trainer capacity consumed per booking. Absent = "per-session" (1 trainer). */
  capacity?: "per-participant" | "per-session";
```

Poser `capacity: "per-participant"` sur `private-adult-solo` et `private-kids-solo` UNIQUEMENT (les groupes et le 10-pack restent au défaut per-session : 1 coach).

Dans `src/lib/booking/pricing.ts` :

```typescript
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
```

Run: `npm run test` -> PASS.

- [ ] **Step 3: `getSlotOccupancy` somme les units**

Dans `src/lib/booking/capacity.ts`, remplacer le corps de `getSlotOccupancy` (le count `head: true` ne peut pas sommer ; on sélectionne la colonne) :

```typescript
export async function getSlotOccupancy(
  client: SupabaseClient,
  q: SlotQuery,
): Promise<number> {
  const { data, error } = await client
    .from("availability_blocks")
    .select("units")
    .eq("type", "private-slot")
    .eq("is_blocked", true)
    .eq("date", q.date)
    .eq("time_slot", q.timeSlot)
    .eq("camp", q.camp);
  if (error) {
    throw new Error(`Slot capacity check failed: ${error.message}`);
  }
  return (data ?? []).reduce(
    (sum, row) => sum + ((row as { units: number | null }).units ?? 1),
    0,
  );
}
```

- [ ] **Step 4: Les trois writers écrivent `units`**

Le nombre d'unités d'une résa : `const units = getCapacityUnits(pkg, data.num_participants);`

1. `src/app/api/checkout/route.ts` :
   - Pré-check : `if (!hasSlotCapacity(occupied, units))` (au lieu de l'appel à un seul argument).
   - Insert du block : ajouter `units,` dans l'objet inséré.
   - Insert-then-verify (Task 3 vague 1) : la re-vérification devient `if (occupiedAfter > PRIVATE_SLOT_CAPACITY)` INCHANGÉ (occupiedAfter somme déjà les units, notre insert inclus).
   - Import `getCapacityUnits` depuis `@/lib/booking/pricing`.
2. `src/app/api/admin/bookings/route.ts` : idem, pré-check `hasSlotCapacity(occupied, units)` + `units,` dans l'insert du block.
3. `src/app/api/webhooks/stripe/route.ts` (safety-net « Ensure a private-slot block exists ») : l'insert du block ajoute `units` recalculé : `getCapacityUnits(getPriceById(updated.price_id) ?? {}, updated.num_participants)` (import `getPriceById` + `getCapacityUnits`).

- [ ] **Step 5: Lint + build + tests + vérification manuelle**

Run: `npm run lint && npm run build && npm run test`
Manuel : wizard privé 1-1 avec 1 participant -> block `units=1`. (Le sélecteur 1-6 arrive en Task 4 ; à ce stade le comportement visible est identique.)

- [ ] **Step 6: Commit**

```bash
git add src/content/pricing.ts src/lib/booking/pricing.ts src/lib/booking/pricing.test.ts src/lib/booking/capacity.ts src/app/api/checkout/route.ts src/app/api/admin/bookings/route.ts src/app/api/webhooks/stripe/route.ts
git commit -m "feat(capacity): la capacite 6 compte des coachs (somme d'unites), 1-1 xN consomme N"
```

---

### Task 3: 19 créneaux + cutoffs + affichage groupé + horaires publiés

**Files:**
- Modify: `src/content/schedule.ts:13-61` (SCHEDULE.private, PRIVATE_SLOT_TIMES, cutoffs, fallback copy, + SLOT_GROUPS)
- Test: `src/content/schedule.test.ts` (create)
- Modify: `src/app/booking/private/PrivateWizard.tsx:271-294` (grille groupée par période)
- Modify: horaires publiés : `src/app/camps/plai-laem/page.tsx` + `src/app/camps/bo-phut/page.tsx` (schedule local en dur l.53-90 + copy « 6:30 PM »), `src/app/contact/page.tsx`, `src/app/faq/page.tsx`, `src/components/seo/SchemaOrg.tsx` (openingHours), `public/llms.txt`, `public/llms-full.txt`

**Interfaces:**
- Produces: `PRIVATE_SLOT_TIMES` (19 valeurs), `SLOT_GROUPS: { label: string; slots: string[] }[]`, `getCutoffHoursForSlot` basé sur « avant 09:30 ». `PRIVATE_SLOTS` (re-export) suit automatiquement ; `TimeSlotSchema` (Zod) et le drawer admin suivent aussi.

- [ ] **Step 1: Tests qui échouent**

Créer `src/content/schedule.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import {
  PRIVATE_SLOT_TIMES,
  SLOT_GROUPS,
  getCutoffHoursForSlot,
} from "./schedule";

describe("PRIVATE_SLOT_TIMES", () => {
  it("contains the 19 client-approved slots in order", () => {
    expect(PRIVATE_SLOT_TIMES).toEqual([
      "07:00", "07:30", "08:00", "08:30", "09:00",
      "10:30", "11:00", "11:30", "12:00", "12:30",
      "13:00", "13:30", "14:00", "14:30", "15:00",
      "15:30", "16:00", "18:30", "19:00",
    ]);
  });

  it("groups cover every slot exactly once", () => {
    const grouped = SLOT_GROUPS.flatMap((g) => g.slots);
    expect(grouped).toEqual([...PRIVATE_SLOT_TIMES]);
  });
});

describe("getCutoffHoursForSlot", () => {
  it("requires 12h notice before 09:30", () => {
    for (const slot of ["07:00", "07:30", "08:00", "08:30", "09:00"]) {
      expect(getCutoffHoursForSlot(slot)).toBe(12);
    }
  });

  it("requires 2h notice from 10:30 onward", () => {
    for (const slot of ["10:30", "12:00", "16:00", "18:30", "19:00"]) {
      expect(getCutoffHoursForSlot(slot)).toBe(2);
    }
  });
});
```

Run: `npm run test` -> FAIL.

- [ ] **Step 2: Mettre à jour `src/content/schedule.ts`**

- `SCHEDULE.private` devient :

```typescript
  private: {
    morning: { start: "7:00", end: "10:00", duration: "1h slots" },
    afternoon: { start: "10:30", end: "17:00", duration: "1h slots" },
    evening: { start: "18:30", end: "20:00", duration: "1h slots" },
    location: "both",
  },
```

(Si le type de `SCHEDULE` est inféré, l'ajout de `evening` passe ; `ScheduleTable` et les pages camps qui itèrent doivent être vérifiés au build.)

- `PRIVATE_SLOT_TIMES` : les 19 valeurs du test (30-minute starts, sessions of 60 minutes, overlap accepted by the client — mettre ce contexte en commentaire).
- Remplacer `EARLY_MORNING_SLOTS` et `getCutoffHoursForSlot` :

```typescript
export const PRIVATE_BOOKING_CUTOFF_HOURS_DEFAULT = 2;
export const PRIVATE_BOOKING_CUTOFF_HOURS_EARLY = 12;
/** Slots starting before 09:30 need 12h notice (trainers commute early). */
export const EARLY_CUTOFF_BEFORE = "09:30";

export function getCutoffHoursForSlot(slot: string): number {
  return slot < EARLY_CUTOFF_BEFORE
    ? PRIVATE_BOOKING_CUTOFF_HOURS_EARLY
    : PRIVATE_BOOKING_CUTOFF_HOURS_DEFAULT;
}
```

(Comparaison de strings zero-paddées « HH:mm » : valide. Chercher les usages restants d'`EARLY_MORNING_SLOTS` avec grep et les adapter.)

- `PRIVATE_BOOKING_WHATSAPP_FALLBACK` devient :

```typescript
export const PRIVATE_BOOKING_WHATSAPP_FALLBACK =
  "Slot too close for online booking? Send us a WhatsApp message and we will get back to you. Note: sessions starting before 9:30 need 12 hours notice; later slots only need 2 hours.";
```

- Ajouter les groupes d'affichage :

```typescript
export const SLOT_GROUPS = [
  { label: "Morning", slots: ["07:00", "07:30", "08:00", "08:30", "09:00"] },
  { label: "Midday", slots: ["10:30", "11:00", "11:30", "12:00", "12:30"] },
  { label: "Afternoon", slots: ["13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"] },
  { label: "Evening", slots: ["18:30", "19:00"] },
] as const;
```

Run: `npm run test` -> PASS.

- [ ] **Step 3: Grille groupée dans PrivateWizard**

Dans `PrivateWizard.tsx`, remplacer la grille plate `<div className="grid grid-cols-4 gap-2">{slotStates.map(...)}</div>` par un rendu par groupe (le calcul `slotStates` reste, on le transforme en lookup) :

```tsx
                <div className="space-y-4">
                  {SLOT_GROUPS.map((group) => {
                    const groupStates = slotStates.filter((s) =>
                      (group.slots as readonly string[]).includes(s.slot),
                    );
                    if (groupStates.length === 0) return null;
                    return (
                      <div key={group.label}>
                        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">
                          {group.label}
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {groupStates.map(({ slot, isAvailable, withinCutoff, cutoffHours }) => (
                            <button
                              type="button"
                              key={slot}
                              disabled={!isAvailable}
                              onClick={() => setTimeSlot(slot)}
                              aria-label={
                                withinCutoff
                                  ? `${slot}, less than ${cutoffHours} hours away, book by WhatsApp`
                                  : slot
                              }
                              className={`rounded-[var(--radius-input)] py-3 text-sm font-semibold border-2 transition-colors ${
                                timeSlot === slot
                                  ? "border-primary bg-primary text-white"
                                  : isAvailable
                                    ? "border-outline-variant bg-surface-lowest text-on-surface hover:border-outline"
                                    : "border-outline-variant bg-surface-lowest text-on-surface-variant/30 line-through cursor-not-allowed"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
```

Import `SLOT_GROUPS` depuis `@/content/schedule`. (Cette grille sera retravaillée par le panier en Task 7 ; garder `setTimeSlot` pour l'instant.)

- [ ] **Step 4: Horaires publiés 20:00 (validé cliente)**

```bash
grep -rn "18:30\|6:30 PM\|6.30\|18h30" src/ public/llms.txt public/llms-full.txt
```

Pour chaque occurrence d'HORAIRE DE FERMETURE du camp (ne pas toucher au créneau de group class 17:00-18:30 qui reste exact) : la fermeture passe à 20:00 / « 8:00 PM ». Surfaces attendues :
- `src/components/seo/SchemaOrg.tsx` : `openingHours` « Mo-Sa 07:00-18:30 » -> « Mo-Sa 07:00-20:00 ».
- `src/app/camps/plai-laem/page.tsx` + `src/app/camps/bo-phut/page.tsx` : copy « 7:00 AM - 6:30 PM » -> « 7:00 AM - 8:00 PM » ; dans le schedule local en dur (l.53-90), ajouter la ligne des créneaux privés du soir (18:30 - 20:00, Private 1h slots).
- `src/app/contact/page.tsx` et `src/app/faq/page.tsx` : heures d'ouverture.
- `public/llms.txt` + `public/llms-full.txt` : hours + private slots (7:00-19:00 starts, sessions until 20:00).
- `PROJECT-STATUS.md` business info sera mis à jour en Task 11.

- [ ] **Step 5: Lint + build + vérification visuelle**

Run: `npm run lint && npm run build`
Dev : la grille des 19 créneaux s'affiche par période à 375px et desktop ; le drawer admin `/admin/availability` liste 19 créneaux (automatique via `PRIVATE_SLOTS`).

- [ ] **Step 6: Commit**

```bash
git add src/content/schedule.ts src/content/schedule.test.ts src/app/booking/private/PrivateWizard.tsx src/app/camps/plai-laem/page.tsx src/app/camps/bo-phut/page.tsx src/app/contact/page.tsx src/app/faq/page.tsx src/components/seo/SchemaOrg.tsx public/llms.txt public/llms-full.txt
git commit -m "feat(schedule): 19 creneaux prives (pas de 30 min), cutoff 12h avant 9h30, horaires publies jusqu'a 20h"
```

---

### Task 4: Bornes de participants par type (UI + Zod + admin)

**Files:**
- Modify: `src/content/pricing.ts` (champ `participants` sur les 5 items privés)
- Modify: `src/lib/booking/pricing.ts` (+ `getParticipantBounds`)
- Test: `src/lib/booking/pricing.test.ts`
- Modify: `src/components/booking/ContactInfoForm.tsx` (min/max)
- Modify: `src/app/booking/private/PrivateWizard.tsx` (sélecteur déplacé à l'étape Session type)
- Modify: `src/lib/validation/booking.ts:26` (max 3 -> 6) + `src/app/api/checkout/route.ts` (bounds par item)
- Modify: `src/lib/validation/admin-booking.ts:11` (max 10 -> 6) + `src/app/api/admin/bookings/route.ts` (bounds par item)

**Interfaces:**
- Produces:
  - Champ `participants?: { min: number; max: number }` sur `PriceItem` (absent = `{ min: 1, max: 1 }`).
  - `getParticipantBounds(item: Pick<PriceItem, "participants">): { min: number; max: number }`
  - Props `minParticipants`/`maxParticipants` sur `ContactInfoForm` (le sélecteur du wizard privé vit désormais à l'étape 0).

- [ ] **Step 1: Tests qui échouent**

Ajouter à `src/lib/booking/pricing.test.ts` :

```typescript
import { getParticipantBounds } from "./pricing";

describe("getParticipantBounds", () => {
  it("returns the item bounds when present", () => {
    expect(getParticipantBounds({ participants: { min: 2, max: 3 } })).toEqual({ min: 2, max: 3 });
  });

  it("defaults to exactly one participant", () => {
    expect(getParticipantBounds({})).toEqual({ min: 1, max: 1 });
  });
});
```

Run: `npm run test` -> FAIL.

- [ ] **Step 2: Implémenter**

`src/content/pricing.ts`, interface (après `capacity`) :

```typescript
  /** Allowed participant range for the booking form. Absent = exactly 1. */
  participants?: { min: number; max: number };
```

Poser sur les items : `private-adult-solo` et `private-kids-solo` -> `participants: { min: 1, max: 6 }` ; `private-adult-group` et `private-kids-group` -> `participants: { min: 2, max: 3 }` ; `private-adult-10pack` -> rien (défaut 1).

`src/lib/booking/pricing.ts` :

```typescript
export function getParticipantBounds(
  item: Pick<PriceItem, "participants">,
): { min: number; max: number } {
  return item.participants ?? { min: 1, max: 1 };
}
```

Run: `npm run test` -> PASS.

- [ ] **Step 3: ContactInfoForm générique**

Dans `ContactInfoForm.tsx`, remplacer les props `showParticipants`/`maxParticipants` par :

```typescript
interface Props {
  value: ContactInfo;
  onChange: (value: ContactInfo) => void;
  showParticipants?: boolean;
  minParticipants?: number;
  maxParticipants?: number;
}
```

et le `<select>` génère les options de `minParticipants` (défaut 1) à `maxParticipants` (défaut 3) :

```typescript
            {Array.from(
              { length: maxParticipants - minParticipants + 1 },
              (_, i) => i + minParticipants,
            ).map((n) => (
```

(défauts : `minParticipants = 1, maxParticipants = 3` dans la signature pour ne pas casser les autres wizards).

- [ ] **Step 4: Sélecteur à l'étape Session type du wizard privé**

Le nombre de participants détermine les unités de capacité, donc le grisage des créneaux : il doit être connu AVANT le choix de date. Dans `PrivateWizard.tsx` :
- À l'étape 0, sous la liste des packages, quand `selectedPackage` a des bounds `max > 1`, afficher le sélecteur :

```tsx
          {selectedPackage && bounds.max > 1 && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-on-surface-variant mb-2">
                Number of participants
              </label>
              <select
                value={contact.numParticipants}
                onChange={(e) =>
                  setContact((c) => ({
                    ...c,
                    numParticipants: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
              >
                {Array.from(
                  { length: bounds.max - bounds.min + 1 },
                  (_, i) => i + bounds.min,
                ).map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
              {selectedPackage.capacity === "per-participant" && (
                <p className="text-xs text-on-surface-variant mt-1.5">
                  Each participant trains with their own trainer
                  ({computeBookingAmount(selectedPackage, contact.numParticipants).toLocaleString("en-US")} THB total per session).
                </p>
              )}
            </div>
          )}
```

avec `const bounds = selectedPackage ? getParticipantBounds(selectedPackage) : { min: 1, max: 1 };` près de `selectedPackage`.
- Remplacer le `useEffect` de clamp (lignes 89-96) par un clamp basé sur bounds :

```typescript
  useEffect(() => {
    setContact((c) => {
      const clamped = Math.min(Math.max(c.numParticipants, bounds.min), bounds.max);
      return clamped === c.numParticipants ? c : { ...c, numParticipants: clamped };
    });
  }, [bounds.min, bounds.max]);
```

- À l'étape 3, `ContactInfoForm` passe à `showParticipants={false}` (le champ a déménagé) ; supprimer la prop `maxParticipants={3}`.
- Supprimer la fonction locale `isGroupPrice` si plus utilisée telle quelle (la garder si le review l'utilise pour la ligne Participants ; sinon `bounds.max > 1` fait foi).

- [ ] **Step 5: Zod + bounds serveur (public et admin)**

- `src/lib/validation/booking.ts` : `num_participants: z.number().int().min(1).max(6).default(1)`.
- `src/app/api/checkout/route.ts`, juste après la résolution de `pkg` : 

```typescript
    const bounds = getParticipantBounds(pkg);
    if (
      data.num_participants < bounds.min ||
      data.num_participants > bounds.max
    ) {
      return NextResponse.json(
        {
          error: `This package accepts ${bounds.min} to ${bounds.max} participant(s).`,
        },
        { status: 400 },
      );
    }
```

(import `getParticipantBounds`).
- `src/lib/validation/admin-booking.ts` : `.max(10)` -> `.max(6)`.
- `src/app/api/admin/bookings/route.ts` : même garde bounds que le public, après la résolution de `pkg`.
- `src/components/admin/CreateBookingForm.tsx` : input Participants `max={10}` -> bornes du package sélectionné :

```typescript
  const bounds = selectedPkg ? getParticipantBounds(selectedPkg) : { min: 1, max: 1 };
```

et sur l'input : `min={bounds.min} max={bounds.max}` + clamp dans le onChange (`Math.min(Math.max(parsed, bounds.min), bounds.max)`) + un `useEffect` qui re-clamp quand `priceId` change. Import depuis `@/lib/booking/pricing`.

- [ ] **Step 6: Lint + build + tests + vérification manuelle**

Run: `npm run lint && npm run build && npm run test`
Manuel : wizard privé -> 1-1 propose 1-6 avec le total par session affiché ; groupe propose 2-3 ; 10-pack n'affiche pas de sélecteur. Admin : les bornes suivent le package.

- [ ] **Step 7: Commit**

```bash
git add src/content/pricing.ts src/lib/booking/pricing.ts src/lib/booking/pricing.test.ts src/components/booking/ContactInfoForm.tsx src/app/booking/private/PrivateWizard.tsx src/lib/validation/booking.ts src/lib/validation/admin-booking.ts src/app/api/checkout/route.ts src/app/api/admin/bookings/route.ts src/components/admin/CreateBookingForm.tsx
git commit -m "feat(booking): selecteur de participants avec bornes par type (1-6 solo, 2-3 groupe), validation partout"
```

---

### Task 5: Checkout multi-sessions (Zod + API)

Le wizard privé envoie désormais `sessions: [{ date, time_slot }]` (1 à 10 entrées, multi-jours). Une ligne `bookings` par session, un `booking_group_id` commun, UN paiement Stripe.

**Files:**
- Modify: `src/lib/validation/booking.ts`
- Modify: `src/app/api/checkout/route.ts` (branche private réécrite)
- Test: `src/lib/validation/booking.test.ts` (create)

**Interfaces:**
- Consumes: `getCapacityUnits`, `getParticipantBounds`, `computeBookingAmount`, `getStripeQuantity`, helpers capacity.
- Produces:
  - `BookingRequestSchema` accepte `sessions: { date: string; time_slot: TimeSlot }[]` (optionnel, requis pour type private, max 10, dates uniques par créneau).
  - Réponse d'erreur capacité nommant la session : `"Tuesday, July 14 at 10:30 is fully booked..."`.
  - metadata Stripe : `{ booking_id: <première ligne>, booking_group_id }` (Task 6 consomme `booking_group_id`).
  - `price_amount` par ligne = montant d'UNE session ; total Stripe = montant x nombre de sessions.

- [ ] **Step 1: Tests Zod qui échouent**

Créer `src/lib/validation/booking.test.ts` :

```typescript
import { describe, it, expect } from "vitest";
import { BookingRequestSchema } from "./booking";

const base = {
  price_id: "private-adult-solo",
  type: "private" as const,
  camp: "bo-phut" as const,
  start_date: "2026-08-03",
  client_name: "Test Client",
  client_email: "test@example.com",
  client_phone: "+66123456789",
};

describe("BookingRequestSchema sessions", () => {
  it("accepts a private booking with multiple sessions across days", () => {
    const parsed = BookingRequestSchema.safeParse({
      ...base,
      sessions: [
        { date: "2026-08-03", time_slot: "10:30" },
        { date: "2026-08-05", time_slot: "19:00" },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a private booking with zero sessions", () => {
    const parsed = BookingRequestSchema.safeParse({ ...base, sessions: [] });
    expect(parsed.success).toBe(false);
  });

  it("rejects duplicate date+slot entries", () => {
    const parsed = BookingRequestSchema.safeParse({
      ...base,
      sessions: [
        { date: "2026-08-03", time_slot: "10:30" },
        { date: "2026-08-03", time_slot: "10:30" },
      ],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects more than 10 sessions", () => {
    const sessions = Array.from({ length: 11 }, (_, i) => ({
      date: `2026-08-${String(i + 1).padStart(2, "0")}`,
      time_slot: "10:30",
    }));
    const parsed = BookingRequestSchema.safeParse({ ...base, sessions });
    expect(parsed.success).toBe(false);
  });

  it("still accepts non-private bookings without sessions", () => {
    const parsed = BookingRequestSchema.safeParse({
      ...base,
      price_id: "drop-in-adult",
      type: "training",
    });
    expect(parsed.success).toBe(true);
  });
});
```

Run: `npm run test` -> FAIL.

- [ ] **Step 2: Étendre le schéma**

Dans `src/lib/validation/booking.ts` :

```typescript
export const SessionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time_slot: TimeSlotSchema,
});

export const BookingRequestSchema = z
  .object({
    // ... champs existants inchangés (garder time_slot optionnel legacy) ...
    sessions: z.array(SessionSchema).min(1).max(10).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "private") {
      if (!data.sessions || data.sessions.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sessions"],
          message: "Private bookings need at least one session.",
        });
        return;
      }
      const keys = new Set(data.sessions.map((s) => `${s.date}|${s.time_slot}`));
      if (keys.size !== data.sessions.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sessions"],
          message: "Duplicate session in cart.",
        });
      }
    }
  });
```

(Le `.superRefine` s'ajoute à l'objet existant ; `time_slot` top-level reste accepté et ignoré pour private.)

Run: `npm run test` -> PASS.

- [ ] **Step 3: Réécrire la branche private du checkout**

Dans `src/app/api/checkout/route.ts`, remplacer TOUT le traitement private (cutoff + capacité + insert booking + insert block, y compris l'insert-then-verify) par un chemin dédié AVANT le chemin générique existant (le chemin générique reste pour training/camp-stay/fighter) :

```typescript
    if (data.type === "private") {
      const sessions = data.sessions!; // superRefine guarantees >= 1
      const isPack = pkg.id === "private-adult-10pack";
      if (isPack && sessions.length !== 1) {
        return NextResponse.json(
          { error: "The 10-session pack books exactly one first session online." },
          { status: 400 },
        );
      }
      if (data.camp === "both") {
        return NextResponse.json(
          { error: "Private sessions need a specific camp." },
          { status: 400 },
        );
      }
      const camp = data.camp;
      const units = getCapacityUnits(pkg, data.num_participants);
      const supabase = createAdminClient();

      // Validate every session before writing anything.
      try {
        for (const s of sessions) {
          const slotDate = new Date(`${s.date}T00:00:00`);
          if (isSlotWithinCutoff(slotDate, s.time_slot)) {
            const cutoff = getCutoffHoursForSlot(s.time_slot);
            return NextResponse.json(
              {
                error: `${formatDateLong(slotDate)} at ${s.time_slot} needs at least ${cutoff}h notice. Please adjust your cart or contact us on WhatsApp.`,
              },
              { status: 400 },
            );
          }
          if (await isSlotClosed(supabase, s.date, s.time_slot)) {
            return NextResponse.json(
              { error: `${formatDateLong(slotDate)} at ${s.time_slot} is closed. Please pick another time.` },
              { status: 409 },
            );
          }
          const occupied = await getSlotOccupancy(supabase, {
            date: s.date,
            timeSlot: s.time_slot,
            camp,
          });
          if (!hasSlotCapacity(occupied, units)) {
            return NextResponse.json(
              {
                error: `${formatDateLong(slotDate)} at ${s.time_slot} is fully booked at the selected camp. Please pick another time or camp.`,
              },
              { status: 409 },
            );
          }
        }
      } catch (checkErr) {
        console.error("Slot availability check failed:", checkErr);
        return NextResponse.json(
          { error: "Could not verify slot availability. Please try again." },
          { status: 500 },
        );
      }

      const perSessionAmount = computeBookingAmount(pkg, data.num_participants);
      const totalAmount = perSessionAmount * sessions.length;
      const groupId = crypto.randomUUID();
      const insertedBookingIds: string[] = [];

      // Rollback helper: remove everything this request created.
      const rollback = async () => {
        if (insertedBookingIds.length === 0) return;
        await supabase
          .from("availability_blocks")
          .delete()
          .in("reason", insertedBookingIds.map((id) => `Booking ${id}`));
        await supabase.from("bookings").delete().in("id", insertedBookingIds);
      };

      for (const s of sessions) {
        const { data: booking, error } = await supabase
          .from("bookings")
          .insert({
            type: "private",
            status: "pending",
            price_id: data.price_id,
            price_amount: perSessionAmount,
            num_participants: data.num_participants,
            start_date: s.date,
            end_date: null,
            time_slot: s.time_slot,
            camp,
            booking_group_id: groupId,
            client_name: data.client_name,
            client_email: data.client_email,
            client_phone: data.client_phone,
            client_nationality: data.client_nationality ?? null,
            notes: data.notes ?? null,
          })
          .select("id")
          .single();
        if (error || !booking) {
          console.error("Booking insert failed:", error);
          await rollback();
          return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 },
          );
        }
        insertedBookingIds.push(booking.id);

        const { error: blockErr } = await supabase
          .from("availability_blocks")
          .insert({
            date: s.date,
            type: "private-slot",
            time_slot: s.time_slot,
            camp,
            units,
            is_blocked: true,
            reason: `Booking ${booking.id}`,
          });
        if (blockErr) {
          console.error("Slot block insert failed:", blockErr);
          await rollback();
          return NextResponse.json(
            { error: "Could not reserve the slot. Please try again." },
            { status: 500 },
          );
        }

        // Insert-then-verify per session (closes the concurrent race).
        const occupiedAfter = await getSlotOccupancy(supabase, {
          date: s.date,
          timeSlot: s.time_slot,
          camp,
        });
        if (occupiedAfter > PRIVATE_SLOT_CAPACITY) {
          await rollback();
          return NextResponse.json(
            {
              error: `${formatDateLong(new Date(`${s.date}T00:00:00`))} at ${s.time_slot} just filled up. Please pick another time.`,
            },
            { status: 409 },
          );
        }
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
              price: stripePriceId,
              quantity: getStripeQuantity(pkg, data.num_participants) * sessions.length,
            },
          ],
          metadata: {
            booking_id: insertedBookingIds[0],
            booking_group_id: groupId,
          },
          customer_email: data.client_email,
          success_url: `${origin}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/booking?cancelled=1`,
        });
      } catch (stripeErr) {
        console.error("Stripe session creation failed:", stripeErr);
        await rollback();
        return NextResponse.json(
          { error: "Payment provider error. Please try again." },
          { status: 500 },
        );
      }

      return NextResponse.json({ url: session.url });
    }
```

Notes d'intégration :
- `formatDateLong` vient de `@/lib/utils/date-format` (import à ajouter). `crypto.randomUUID()` est global sous Node runtime.
- Contrôle de cohérence du montant : `totalAmount` doit égaler `perSessionAmount x sessions.length` et le line item Stripe (`unit price x quantity`) le garantit par construction : `getStripeQuantity` retourne `numParticipants x sessions.length` pour per-person (unit price = prix par personne) et `1 x sessions.length` pour flat (unit price = prix par session). `totalAmount` reste utile si on veut le logger.
- Le chemin générique existant (training/camp-stay/fighter) ne doit PLUS traiter le type private : retirer de l'ancien code tout le bloc `if (data.type === "private" ...)` (cutoff/capacité) et l'insert de block private.

- [ ] **Step 4: Lint + build + tests**

Run: `npm run lint && npm run build && npm run test`
(Le wizard n'envoie pas encore `sessions` : il est mis à jour en Task 7. Ne pas tester le flux complet ici.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation/booking.ts src/lib/validation/booking.test.ts src/app/api/checkout/route.ts
git commit -m "feat(checkout): panier multi-sessions prive (N bookings groupes, un paiement Stripe)"
```

---

### Task 6: Webhook de groupe (confirmation et expiration en bloc)

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts` (branches completed + expired, cas booking)

**Interfaces:**
- Consumes: metadata `booking_group_id` (Task 5), `getCapacityUnits`.
- Produces: `BookingEmailData.sessions` rempli pour les groupes (consommé Task 8).

- [ ] **Step 1: Branche completed**

Dans la branche `checkout.session.completed` (cas non-DTV), remplacer la logique single-booking par : si `meta.booking_group_id` présent, update le GROUPE ; sinon comportement actuel (bookings legacy et autres types). Code :

```typescript
    const bookingId = meta.booking_id;
    const groupId = meta.booking_group_id;

    if (!bookingId) {
      console.error("Missing booking_id in session metadata");
      return NextResponse.json({ received: true });
    }

    const updatePayload = {
      status: "confirmed" as const,
      stripe_session_id: session.id,
      stripe_payment_intent_id:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      stripe_payment_status: session.payment_status,
    };

    const query = groupId
      ? supabase.from("bookings").update(updatePayload).eq("booking_group_id", groupId)
      : supabase.from("bookings").update(updatePayload).eq("id", bookingId);

    const { data: updatedRows, error } = await query.select("*");

    if (error || !updatedRows || updatedRows.length === 0) {
      console.error("Failed to update booking(s):", error);
      return NextResponse.json({ received: true });
    }

    // Sort sessions chronologically; the first row feeds the email header.
    const sorted = [...updatedRows].sort((a, b) =>
      `${a.start_date}${a.time_slot ?? ""}`.localeCompare(
        `${b.start_date}${b.time_slot ?? ""}`,
      ),
    );
    const updated = sorted[0];
    const totalAmount = sorted.reduce((sum, b) => sum + b.price_amount, 0);

    const bookingData: BookingEmailData = {
      id: updated.id,
      type: updated.type,
      price_id: updated.price_id,
      price_amount: totalAmount,
      start_date: updated.start_date,
      end_date: updated.end_date,
      time_slot: updated.time_slot,
      camp: updated.camp,
      num_participants: updated.num_participants,
      client_name: updated.client_name,
      client_email: updated.client_email,
      client_phone: updated.client_phone,
      client_nationality: updated.client_nationality,
      notes: updated.notes,
      sessions:
        sorted.length > 1
          ? sorted.map((b) => ({
              date: b.start_date,
              time_slot: b.time_slot ?? "",
            }))
          : undefined,
    };
```

Le safety-net « ensure private-slot block exists » boucle sur `sorted` (chaque ligne private + time_slot) avec `units` (déjà en place Task 2) et `reason: \`Booking ${b.id}\``.

- [ ] **Step 2: Branche expired**

Remplacer le cas booking par une version groupe (extension du fix B3 vague 1) :

```typescript
    } else if (meta.booking_id) {
      const groupId = meta.booking_group_id;
      const query = groupId
        ? supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("booking_group_id", groupId)
            .eq("status", "pending")
        : supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("id", meta.booking_id)
            .eq("status", "pending");

      const { data: cancelledRows } = await query.select("id, type, time_slot");

      const blockReasons = (cancelledRows ?? [])
        .filter((b) => b.type === "private" && b.time_slot)
        .map((b) => `Booking ${b.id}`);
      if (blockReasons.length > 0) {
        await supabase
          .from("availability_blocks")
          .delete()
          .in("reason", blockReasons);
      }
    }
```

- [ ] **Step 3: Lint + build**

Run: `npm run lint && npm run build`
(Type error attendu sur `sessions` tant que Task 8 n'a pas étendu `BookingEmailData` : si c'est bloquant, exécuter le Step 1 de la Task 8 (type uniquement) maintenant et le mentionner dans le commit.)

- [ ] **Step 4: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat(webhook): confirmation et expiration par groupe de sessions (multi-creneaux)"
```

---

### Task 7: Panier de sessions dans le wizard privé

**Files:**
- Modify: `src/app/booking/private/PrivateWizard.tsx` (état, étape 2, review, submit)
- Modify: `src/components/booking/AvailabilityCalendar.tsx` (somme des units + prop unitsRequested)

**Interfaces:**
- Consumes: endpoint sessions (Task 5), `getCapacityUnits`, `SLOT_GROUPS`.
- Produces: payload `sessions: [{ date, time_slot }]` envoyé à `/api/checkout`.

- [ ] **Step 1: AvailabilityCalendar en unités**

Dans `AvailabilityCalendar.tsx` :
- Le select ajoute `units` : `.select("date, time_slot, type, camp, units")` et `AvailabilityBlock` gagne `units: number | null`.
- Prop nouvelle : `unitsRequested?: number` (défaut 1).
- Les DEUX comptages (disabledDays `dateSlotCampCount` et le useEffect `slotCounts`) somment `block.units ?? 1` au lieu de `+ 1`, et la condition « slot plein » devient : `count + unitsRequested > PRIVATE_SLOT_CAPACITY` (remplace `count >= PRIVATE_SLOT_CAPACITY` aux 2 endroits : lignes 137 et 202).

- [ ] **Step 2: État panier + étape 2**

Dans `PrivateWizard.tsx` :
- Nouvel état : `const [sessions, setSessions] = useState<{ date: string; slot: string }[]>([]);` (remplace `timeSlot` ; `date` reste la date en cours de consultation).
- `const isPack = priceId === "private-adult-10pack";`
- `const maxSessions = isPack ? 1 : 10;`
- `const units = selectedPackage ? getCapacityUnits(selectedPackage, contact.numParticipants) : 1;` (import).
- Passer `unitsRequested={units}` à `AvailabilityCalendar`.
- Dans le calcul `slotStates`, une entrée du panier rend son créneau non re-sélectionnable et consomme des unités locales :

```typescript
            const slotStates = PRIVATE_SLOTS.map((slot) => {
              const withinCutoff = isSlotWithinCutoff(date, slot);
              const cutoffHours = getCutoffHoursForSlot(slot);
              const dateStr = format(date, "yyyy-MM-dd");
              const inCart = sessions.some(
                (s) => s.date === dateStr && s.slot === slot,
              );
              const isAvailable =
                availableSlots.includes(slot) && !withinCutoff && !inCart;
              return { slot, isAvailable, withinCutoff, cutoffHours, inCart };
            });
```

- Le clic sur un créneau AJOUTE au panier (plus de `setTimeSlot`) :

```typescript
              onClick={() =>
                setSessions((prev) =>
                  prev.length >= maxSessions
                    ? prev
                    : [...prev, { date: format(date, "yyyy-MM-dd"), slot }],
                )
              }
```

Style du bouton : état `inCart` rendu comme sélectionné (`border-primary bg-primary text-white`).
- Sous la grille, la liste du panier :

```tsx
          {sessions.length > 0 && (
            <div className="rounded-[var(--radius-card)] border-2 border-outline-variant bg-surface-lowest p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
                Your sessions ({sessions.length}{isPack ? "" : ` / ${maxSessions}`})
              </p>
              <ul className="space-y-2">
                {[...sessions]
                  .sort((a, b) => `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`))
                  .map((s) => (
                    <li key={`${s.date}-${s.slot}`} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-on-surface">
                        {formatDateLong(new Date(`${s.date}T00:00:00`))} at {s.slot}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setSessions((prev) =>
                            prev.filter((x) => !(x.date === s.date && x.slot === s.slot)),
                          )
                        }
                        className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
                        aria-label={`Remove session on ${s.date} at ${s.slot}`}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
              </ul>
              {!isPack && sessions.length < maxSessions && (
                <p className="text-xs text-on-surface-variant mt-3">
                  Pick another date or time to add more sessions. One payment for everything.
                </p>
              )}
            </div>
          )}
          {isPack && (
            <p className="text-xs text-on-surface-variant">
              Your pack includes 10 sessions. Book your first one here; the other nine are scheduled at the camp or on WhatsApp.
            </p>
          )}
```

- Vider le panier quand le package ou le camp change (le prix et la capacité changent) :

```typescript
  useEffect(() => {
    setSessions([]);
  }, [priceId, camp]);
```

- [ ] **Step 3: Total, canProceed, review, submit**

- `const totalAmount = selectedPackage ? computeBookingAmount(selectedPackage, contact.numParticipants) * Math.max(sessions.length, 1) : 0;`
- `canProceed` step 2 : `sessions.length >= 1` (plus de `timeSlot`).
- Review : remplacer les lignes Date/Time par la liste des sessions :

```typescript
            rows={[
              { label: "Session type", value: selectedPackage.name },
              { label: "Camp", value: CAMPS.find((c) => c.id === camp)!.name },
              ...sessions
                .slice()
                .sort((a, b) => `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`))
                .map((s, i) => ({
                  label: sessions.length > 1 ? `Session ${i + 1}` : "Session",
                  value: `${formatDateLong(new Date(`${s.date}T00:00:00`))} at ${s.slot}`,
                })),
              ...(bounds.max > 1
                ? [{ label: "Participants", value: `${contact.numParticipants}` }]
                : []),
              { label: "Contact", value: contact.email },
            ]}
```

- Submit : le body remplace `start_date`/`time_slot` par :

```typescript
          start_date: sessions[0].date,
          sessions: sessions
            .slice()
            .sort((a, b) => `${a.date}${a.slot}`.localeCompare(`${b.date}${b.slot}`))
            .map((s) => ({ date: s.date, time_slot: s.slot })),
```

- La condition de garde du submit : `if (!selectedPackage || !camp || sessions.length === 0) return;`

- [ ] **Step 4: Lint + build + E2E local**

Run: `npm run lint && npm run build && npm run test`
E2E (dev + `stripe listen`) : panier de 2 sessions sur 2 jours différents, Stripe affiche le total x2, payer 4242 : les 2 bookings passent `confirmed`, 2 blocks avec `units` corrects. Vérifier le grisage : 1-1 à 5 participants sur un créneau où 2 unités existent -> créneau grisé (2+5>6). Nettoyer.

- [ ] **Step 5: Commit**

```bash
git add src/app/booking/private/PrivateWizard.tsx src/components/booking/AvailabilityCalendar.tsx
git commit -m "feat(booking): panier multi-creneaux dans le wizard prive, grisage en unites coachs"
```

---

### Task 8: Emails multi-sessions

**Files:**
- Modify: `src/lib/email/types.ts`
- Modify: `src/lib/email/templates/BookingConfirmed.tsx`
- Modify: `src/lib/email/templates/BookingNotification.tsx` (même pattern : lire le fichier et appliquer la même section sessions)

**Interfaces:**
- Consumes: `BookingEmailData.sessions` rempli par le webhook (Task 6).

- [ ] **Step 1: Étendre le type**

Dans `src/lib/email/types.ts` :

```typescript
export interface BookingEmailData {
  // ... champs existants inchangés ...
  /** Present when the booking is a multi-session private cart (sorted). */
  sessions?: { date: string; time_slot: string }[];
}
```

- [ ] **Step 2: Template client**

Dans `BookingConfirmed.tsx`, remplacer les deux blocs Start date / Time par :

```tsx
            {booking.sessions && booking.sessions.length > 1 ? (
              <>
                <Text>
                  <strong>Your sessions:</strong>
                </Text>
                {booking.sessions.map((s) => (
                  <Text key={`${s.date}-${s.time_slot}`} style={{ marginLeft: 12 }}>
                    {s.date} at {s.time_slot}
                  </Text>
                ))}
              </>
            ) : (
              <>
                <Text>
                  <strong>Start date:</strong> {booking.start_date}
                </Text>
                {booking.time_slot && (
                  <Text>
                    <strong>Time:</strong> {booking.time_slot}
                  </Text>
                )}
              </>
            )}
```

(`Total paid` affiche déjà `price_amount`, que le webhook envoie sommé pour un groupe.)

- [ ] **Step 3: Template admin + build**

Appliquer le même pattern dans `BookingNotification.tsx` (lire le fichier, dupliquer la structure sessions au même endroit que les dates).
Run: `npm run lint && npm run build && npm run test`

- [ ] **Step 4: Commit**

```bash
git add src/lib/email/types.ts src/lib/email/templates/BookingConfirmed.tsx src/lib/email/templates/BookingNotification.tsx
git commit -m "feat(email): les confirmations listent toutes les sessions d'un panier multi-creneaux"
```

---

### Task 9: Admin : unités dans le drawer + sessions sœurs + annulation qui libère le créneau

**Files:**
- Modify: `src/components/admin/AdminDayDrawer.tsx` (somme units)
- Modify: `src/app/admin/(dashboard)/availability/page.tsx` (le select des blocks doit inclure `units` ; lire le fichier pour localiser la requête)
- Modify: `src/app/admin/(dashboard)/bookings/[id]/page.tsx` (bloc sessions sœurs)
- Modify: `src/app/api/admin/bookings/[id]/status/route.ts` (annulation d'une session : delete de SON block ; lire le fichier, vérifier le comportement existant "delete private-slot block on cancel" et l'adapter au reason par booking)

- [ ] **Step 1: Drawer en unités**

Dans `AdminDayDrawer.tsx` :
- `BlockRecord` gagne `units: number | null;`.
- Les comptages `boPhutCount`/`plaiLaemCount` passent de `.length` à une somme :

```typescript
                const sumUnits = (campId: "bo-phut" | "plai-laem") =>
                  blocks
                    .filter(
                      (b) =>
                        b.type === "private-slot" &&
                        b.time_slot === slot &&
                        b.is_blocked &&
                        b.camp === campId,
                    )
                    .reduce((sum, b) => sum + (b.units ?? 1), 0);
                const boPhutCount = sumUnits("bo-phut");
                const plaiLaemCount = sumUnits("plai-laem");
```

Dans `availability/page.tsx`, ajouter `units` à la requête Supabase qui charge les blocks du mois (chercher `.select(` sur `availability_blocks`).

- [ ] **Step 2: Sessions sœurs sur le détail**

Dans `bookings/[id]/page.tsx` (Server Component) : après le fetch du booking, si `booking.booking_group_id` est non-null, requêter les sœurs :

```typescript
  const { data: siblings } = booking.booking_group_id
    ? await admin
        .from("bookings")
        .select("id, start_date, time_slot, status")
        .eq("booking_group_id", booking.booking_group_id)
        .neq("id", booking.id)
        .order("start_date")
    : { data: null };
```

et afficher un bloc (même style de carte que les blocs voisins) : titre « Same cart (N other sessions) », une ligne par sœur : `{start_date} at {time_slot} · {status}` en lien vers `/admin/bookings/<id>`. Adapter le select existant du booking pour inclure `booking_group_id`.

- [ ] **Step 3: Annulation d'une session libère SON créneau**

Lire `src/app/api/admin/bookings/[id]/status/route.ts` : le delete du block existant doit cibler `reason = 'Booking <id>'` (une session = son block). Si le code actuel supprime par (date, time_slot) sans reason, le corriger :

```typescript
      await admin
        .from("availability_blocks")
        .delete()
        .eq("reason", `Booking ${id}`);
```

(L'annulation reste PAR SESSION : annuler une session d'un panier ne touche pas ses sœurs. C'est le comportement voulu pour l'admin.)

- [ ] **Step 4: Lint + build + vérification manuelle + commit**

Run: `npm run lint && npm run build`
Manuel : drawer affiche BP/PL en unités (créer une résa 1-1 x3 -> BP 3/6) ; détail d'une session d'un panier liste ses sœurs ; annuler une session libère 3 unités.

```bash
git add src/components/admin/AdminDayDrawer.tsx "src/app/admin/(dashboard)/availability/page.tsx" "src/app/admin/(dashboard)/bookings/[id]/page.tsx" "src/app/api/admin/bookings/[id]/status/route.ts"
git commit -m "feat(admin): occupation en unites coachs, sessions soeurs visibles, annulation par session"
```

---

### Task 10: Page de confirmation multi-sessions

**Files:**
- Modify: `src/app/booking/confirmed/page.tsx` (lire le fichier : il résout le booking via stripe session -> metadata ; afficher toutes les sessions du groupe)

- [ ] **Step 1: Afficher le groupe**

Dans la page confirmed : après la résolution du booking par `metadata.booking_id`, si le booking a un `booking_group_id`, requêter toutes les lignes du groupe (admin client, `order("start_date")`) et afficher la liste des sessions (date + heure) à la place de la ligne date/heure unique, plus le total sommé. Suivre la structure JSX existante de la page (lire le fichier avant de modifier ; le pattern données est identique à celui du webhook Task 6).

- [ ] **Step 2: Lint + build + E2E + commit**

E2E : payer un panier de 2 sessions, la page confirmed liste les 2 sessions et le total.

```bash
git add src/app/booking/confirmed/page.tsx
git commit -m "feat(booking): la page de confirmation liste toutes les sessions du panier"
```

---

### Task 11: Recette finale 2a + documentation

**Files:**
- Modify: `PROJECT-STATUS.md`, `ROADMAP.md`, `ARCHITECTURE.md`

- [ ] **Step 1: Suite E2E complète (dev + stripe listen, clés TEST)**

1. 1-1 adulte, 4 participants, 1 session : Stripe = 4,000 THB (4 x 1,000), block units=4 ; le créneau affiche 4/6 dans le drawer.
2. Panier 3 sessions sur 3 jours (1-1, 2 participants) : Stripe = 6,000 THB, 3 bookings confirmed groupés, email unique listant 3 sessions, page confirmed liste 3 sessions.
3. Groupe 2-3 : 1,400 THB peu importe 2 ou 3 ; block units=1.
4. 10-pack : panier limité à 1 session, 9,000 THB.
5. Capacité : remplir un créneau à 6 unités -> 7e refusée (public ET admin), créneau grisé côté client, rouge côté drawer.
6. Cutoff : slot 09:00 aujourd'hui +2h -> refusé (12h) ; slot 10:30 à +3h -> accepté.
7. Expiration : panier de 2 sessions abandonné, `stripe trigger checkout.session.expired --add "checkout_session:metadata[booking_id]=<id>" --add "checkout_session:metadata[booking_group_id]=<group>"` -> 2 bookings cancelled + 2 blocks supprimés.
8. Annulation admin d'une session d'un panier -> sa sœur reste confirmed, son créneau est libéré.
9. `/camps/*`, `/faq`, `/contact` affichent 7:00 AM - 8:00 PM ; le schéma openingHours dit 07:00-20:00.

- [ ] **Step 2: Purge des données de test + vérifications**

Purge Supabase (bookings, blocks de test). Run: `npm run lint && npm run build && npm run test` -> 0 erreur.

- [ ] **Step 3: Documentation vivante + commit**

- `PROJECT-STATUS.md` : entrée d'historique (19 créneaux, unités coachs, multi-sessions, horaires 20:00) + business info (hours 7:00 AM - 8:00 PM, private slots 19).
- `ARCHITECTURE.md` : §4 (19 slots, SLOT_GROUPS, cutoff avant 09:30), §6 (colonnes booking_group_id + units), §6 Stripe (metadata booking_group_id), nouveau paragraphe capacité coachs (avec la limite assumée : chevauchement 30 min non contrôlé, décision cliente 2026-07-10).
- `ROADMAP.md` : section vague 2a cochée.

```bash
git add PROJECT-STATUS.md ROADMAP.md ARCHITECTURE.md
git commit -m "docs: cloture vague 2a (prive v2: creneaux, unites, multi-sessions)"
```

- [ ] **Step 4: Handoff**

NE PAS merger. La branche continue avec le plan 2b (`docs/superpowers/plans/2026-07-10-vague-2b-accommodation-tiers.md`). Présenter à Rd le diff et les résultats de recette avant d'enchaîner.
