# Correctifs Audit 2026-07-16 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corriger les 2 bugs critiques, 3 élevés et ~12 moyens/faibles identifiés par l'audit du 2026-07-16, sans aucune régression sur un site LIVE avec paiements réels.

**Architecture:** Corrections chirurgicales fichier par fichier, chacune committée séparément. Un nouveau helper timezone (`src/lib/utils/bangkok-time.ts`) devient la source de vérité pour « maintenant à Bangkok ». Le webhook Stripe passe d'un modèle « marqué traité avant traitement » à « claim puis release + 500 en cas d'échec DB » pour déclencher les retries Stripe. Les chemins hébergement adoptent le pattern insert-then-verify déjà éprouvé sur les créneaux privés.

**Tech Stack:** Next.js 16 (App Router), TypeScript 5 strict, Zod 4, Stripe SDK 21, Supabase, Vitest 4, date-fns 4.

## Global Constraints

- **SITE LIVE en production** (https://ratchawatmuaythai.com, Stripe LIVE, vraies réservations en cours). Aucun `git push` dans ce plan : les commits restent locaux, Rd pousse après validation (Vercel déploie sur push).
- **Aucune migration DB, aucune modification de schéma, aucune écriture en prod.** La seule interaction Supabase autorisée est une requête SELECT read-only (Task 15) via le MCP `mcp__supabase-ratchawat__*` (projet `rlmeafyvedpsflwohuyy`), jamais le MCP générique.
- **Aucun changement de prix.** La grille tarifaire 17-29 nuits (finding n°7) est une question cliente, documentée en Task 16, PAS un changement de code.
- Code, commentaires, copy in English. Messages de commit : type/scope anglais, description en français (Conventional Commits). Pas d'em dash dans la copy. Pas de séquences d'échappement unicode.
- Après CHAQUE tâche : `npm run test` (vitest) et `npm run lint` doivent passer à 0 erreur. `npm run build` au minimum aux tâches 1, 2, 5 et à la vérification finale.
- Ne jamais lancer `stripe` ou `vercel` CLI sans clé projet explicite (les CLIs locaux pointent sur des comptes tiers — wyron / roadtofightapp).
- `src/proxy.ts` est la convention middleware Next 16 active. Ne pas le renommer, ne pas recréer `src/middleware.ts`.
- Timezone : la Thaïlande est UTC+7 toute l'année (ICT, pas de DST). Vercel exécute en UTC. Les navigateurs clients sont dans n'importe quel fuseau.

## Décisions assumées (validées à l'approbation de ce plan)

1. **robots.ts vs sitemap.ts** : on retire `/privacy` et `/terms` des `disallow` de robots.ts (elles restent dans le sitemap). Ce sont des pages légitimes linkées dans le footer ; les bloquer tout en les soumettant crée l'erreur Search Console. L'option inverse (retirer du sitemap) laisserait des URLs « indexées sans contenu ».
2. **PrivateWizard, changement de participants avec panier rempli** : PAS de reset du panier (ce serait une régression UX : l'utilisateur perdrait ses créneaux choisis à l'étape contact). Le serveur revalide chaque session et renvoie un message explicite par créneau. Documenté comme risque UX accepté.
3. **Fraîcheur des calendriers (occupancy fetchée une fois au mount)** : pas de polling ajouté. Le serveur revalide au submit ; ajouter du refetch en prod sans tests E2E = risque de régression supérieur au gain.
4. **Admin peut créer des réservations à date passée** : conservé volontairement (régularisation de walk-ins). Le plancher de date (Task 4) ne s'applique qu'aux routes publiques.
5. **DTV checkout sans `expires_at` court** : conservé (une candidature DTV ne bloque aucune capacité).
6. **`payment_status === "no_payment_required"`** est traité comme payé sur les pages de confirmation (cas promo/100% discount, aujourd'hui inexistant mais valide côté Stripe).

---

### Task 1: Helper timezone Bangkok + correction du cutoff (CRITIQUE n°1)

**Files:**
- Create: `src/lib/utils/bangkok-time.ts`
- Create: `src/lib/utils/bangkok-time.test.ts`
- Modify: `src/content/schedule.ts:106-118` (`isSlotWithinCutoff`)
- Modify: `src/content/schedule.test.ts` (nouveaux tests)
- Modify: `src/app/api/checkout/route.ts:112-143` et `:232` (appels)
- Modify: `src/app/booking/private/PrivateWizard.tsx:317` (appel)

**Interfaces:**
- Produces: `bangkokSlotInstant(dateStr: string, slot: string): number` (epoch ms UTC de l'instant `dateStr slot` heure de Bangkok) ; `todayInBangkok(): string` (date calendaire `yyyy-MM-dd` courante à Bangkok). `isSlotWithinCutoff(dateStr: string, slot: string): boolean` — **la signature change** (premier paramètre `Date` → `string`), Task 4 consomme `todayInBangkok`.

- [x] **Step 1: Chercher tous les appels existants de `isSlotWithinCutoff`**

Run: `grep -rn "isSlotWithinCutoff" src/`
Expected: exactement 3 fichiers — `src/content/schedule.ts` (définition), `src/app/api/checkout/route.ts`, `src/app/booking/private/PrivateWizard.tsx`. Si un 4e site d'appel apparaît, l'adapter de la même façon que ceux ci-dessous avant de continuer.

- [x] **Step 2: Écrire les tests du helper (failing)**

Create `src/lib/utils/bangkok-time.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { bangkokSlotInstant, todayInBangkok } from "./bangkok-time";

describe("bangkokSlotInstant", () => {
  it("converts a Bangkok wall-clock slot to the correct UTC instant", () => {
    // 09:30 in Bangkok (UTC+7) is 02:30 UTC.
    expect(bangkokSlotInstant("2026-07-16", "09:30")).toBe(
      Date.parse("2026-07-16T02:30:00Z"),
    );
  });

  it("handles midnight-adjacent slots without shifting the date", () => {
    // 07:00 Bangkok is 00:00 UTC the same day.
    expect(bangkokSlotInstant("2026-07-16", "07:00")).toBe(
      Date.parse("2026-07-16T00:00:00Z"),
    );
  });
});

describe("todayInBangkok", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the Bangkok calendar date, not the UTC one", () => {
    // 17:30 UTC = 00:30 next day in Bangkok.
    vi.setSystemTime(new Date("2026-07-16T17:30:00Z"));
    expect(todayInBangkok()).toBe("2026-07-17");
  });

  it("matches UTC date while both calendars agree", () => {
    // 05:00 UTC = 12:00 Bangkok, same calendar day.
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
    expect(todayInBangkok()).toBe("2026-07-16");
  });
});
```

- [x] **Step 3: Vérifier que les tests échouent**

Run: `npm run test -- src/lib/utils/bangkok-time.test.ts`
Expected: FAIL — module `./bangkok-time` introuvable.

- [x] **Step 4: Implémenter le helper**

Create `src/lib/utils/bangkok-time.ts`:

```ts
/**
 * Bangkok wall-clock helpers. The camp operates in Asia/Bangkok (UTC+7,
 * no DST), while Vercel functions run in UTC and visitor browsers can be
 * in any timezone. Every "is it too late to book" decision must go
 * through these helpers instead of local Date methods.
 */

const BANGKOK_UTC_OFFSET = "+07:00";

/** UTC instant (epoch ms) of `HH:mm` on `yyyy-MM-dd`, Bangkok wall-clock. */
export function bangkokSlotInstant(dateStr: string, slot: string): number {
  return Date.parse(`${dateStr}T${slot}:00${BANGKOK_UTC_OFFSET}`);
}

/** Current calendar date in Bangkok, formatted yyyy-MM-dd. */
export function todayInBangkok(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
```

(Note : `en-CA` produit nativement le format `yyyy-MM-dd`.)

- [x] **Step 5: Vérifier que les tests du helper passent**

Run: `npm run test -- src/lib/utils/bangkok-time.test.ts`
Expected: PASS (4 tests).

- [x] **Step 6: Écrire les tests du cutoff corrigé (failing)**

Append to `src/content/schedule.test.ts` (et ajouter `isSlotWithinCutoff` à l'import existant depuis `./schedule`, plus `vi, beforeEach, afterEach` à l'import vitest) :

```ts
describe("isSlotWithinCutoff (Bangkok wall-clock)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("blocks a 2h-cutoff slot booked 1h before Bangkok time", () => {
    // Now: 05:00 UTC = 12:00 Bangkok. Slot 13:00 Bangkok starts in 1h.
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "13:00")).toBe(true);
  });

  it("allows a 2h-cutoff slot booked 3h before Bangkok time", () => {
    // Now: 05:00 UTC = 12:00 Bangkok. Slot 15:00 Bangkok starts in 3h.
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "15:00")).toBe(false);
  });

  it("blocks a slot that already started", () => {
    // Now: 08:00 UTC = 15:00 Bangkok. Slot 13:00 Bangkok started 2h ago.
    vi.setSystemTime(new Date("2026-07-16T08:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "13:00")).toBe(true);
  });

  it("blocks an early slot 11h before (12h cutoff)", () => {
    // Now: 15:00 UTC on the 15th = 22:00 Bangkok. Slot 09:00 Bangkok
    // on the 16th starts in 11h.
    vi.setSystemTime(new Date("2026-07-15T15:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "09:00")).toBe(true);
  });

  it("allows an early slot 13h before (12h cutoff)", () => {
    // Now: 13:00 UTC on the 15th = 20:00 Bangkok.
    vi.setSystemTime(new Date("2026-07-15T13:00:00Z"));
    expect(isSlotWithinCutoff("2026-07-16", "09:00")).toBe(false);
  });
});
```

- [x] **Step 7: Vérifier l'échec**

Run: `npm run test -- src/content/schedule.test.ts`
Expected: FAIL — soit erreur de type (signature `Date` vs `string`), soit assertions fausses (l'ancienne implémentation calcule en heure locale de la machine de test, pas en heure Bangkok).

- [x] **Step 8: Réécrire `isSlotWithinCutoff` dans `src/content/schedule.ts`**

Remplacer le bloc lignes 106-118 :

```ts
/**
 * Returns true when the given slot (HH:mm) on `date` starts in less than the
 * cutoff that applies to that slot (12h before 09:30, 2h for the rest).
 * Below the cutoff the client must reach out on WhatsApp instead of booking
 * online.
 */
export function isSlotWithinCutoff(date: Date, slot: string): boolean {
  const [hh, mm] = slot.split(":").map(Number);
  const slotDate = new Date(date);
  slotDate.setHours(hh, mm, 0, 0);
  const cutoffMs = getCutoffHoursForSlot(slot) * 60 * 60 * 1000;
  return slotDate.getTime() - Date.now() < cutoffMs;
}
```

par :

```ts
/**
 * Returns true when the given slot (HH:mm) on `dateStr` (yyyy-MM-dd,
 * Bangkok calendar) starts in less than the cutoff that applies to that
 * slot (12h before 09:30, 2h for the rest). Slot instants are anchored to
 * Asia/Bangkok so the check gives the same answer on the UTC server and
 * in any visitor's browser. Below the cutoff the client must reach out on
 * WhatsApp instead of booking online.
 */
export function isSlotWithinCutoff(dateStr: string, slot: string): boolean {
  const slotInstant = bangkokSlotInstant(dateStr, slot);
  const cutoffMs = getCutoffHoursForSlot(slot) * 60 * 60 * 1000;
  return slotInstant - Date.now() < cutoffMs;
}
```

et ajouter en tête de fichier :

```ts
import { bangkokSlotInstant } from "@/lib/utils/bangkok-time";
```

- [x] **Step 9: Adapter l'appel serveur dans `src/app/api/checkout/route.ts`**

Remplacer le bloc lignes 112-143 (la boucle de validation) — les 3 usages de `slotDate` disparaissent au profit de `s.date` (que `formatDateLong` accepte, il parse les strings via `parseISO`) :

```ts
        for (const s of sessions) {
          if (isSlotWithinCutoff(s.date, s.time_slot)) {
            const cutoff = getCutoffHoursForSlot(s.time_slot);
            return NextResponse.json(
              {
                error: `${formatDateLong(s.date)} at ${s.time_slot} needs at least ${cutoff}h notice. Please adjust your cart or contact us on WhatsApp.`,
              },
              { status: 400 },
            );
          }
          if (await isSlotClosed(supabase, s.date, s.time_slot)) {
            return NextResponse.json(
              {
                error: `${formatDateLong(s.date)} at ${s.time_slot} is closed. Please pick another time.`,
              },
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
                error: `${formatDateLong(s.date)} at ${s.time_slot} is fully booked at the selected camp. Please pick another time or camp.`,
              },
              { status: 409 },
            );
          }
        }
```

Puis ligne 232 (message « just filled up » du insert-then-verify), remplacer :

```ts
              error: `${formatDateLong(new Date(`${s.date}T00:00:00`))} at ${s.time_slot} just filled up. Please pick another time.`,
```

par :

```ts
              error: `${formatDateLong(s.date)} at ${s.time_slot} just filled up. Please pick another time.`,
```

- [x] **Step 10: Adapter l'appel client dans `src/app/booking/private/PrivateWizard.tsx`**

Ligne 317, dans l'IIFE où `dateStr` est déjà défini (`const dateStr = format(date, "yyyy-MM-dd");` ligne 315), remplacer :

```ts
              const withinCutoff = isSlotWithinCutoff(date, slot);
```

par :

```ts
              const withinCutoff = isSlotWithinCutoff(dateStr, slot);
```

- [x] **Step 11: Suite de tests complète + lint + build**

Run: `npm run test && npm run lint && npm run build`
Expected: tous PASS, 0 erreur. Le build attrape tout appel de `isSlotWithinCutoff` oublié (signature changée = erreur TS).

- [x] **Step 12: Commit**

```bash
git add src/lib/utils/bangkok-time.ts src/lib/utils/bangkok-time.test.ts src/content/schedule.ts src/content/schedule.test.ts src/app/api/checkout/route.ts src/app/booking/private/PrivateWizard.tsx
git commit -m "fix(booking): cutoffs privés calculés en heure de Bangkok, plus en heure serveur UTC"
```

---

### Task 2: Idempotence du webhook Stripe — release + 500 sur échec DB (CRITIQUE n°2)

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts`

**Interfaces:**
- Consumes: rien de nouveau.
- Produces: comportement — tout échec DB post-dédup supprime la ligne `processed_stripe_events` et renvoie 500, pour que Stripe retente la livraison. Les échecs d'email restent non bloquants (loggés). Un event dont la donnée cible n'existe pas (metadata absente, 0 ligne matchée sans erreur) reste un 200 définitif.

- [x] **Step 1: Ajouter le helper `releaseEvent`**

Dans `src/app/api/webhooks/stripe/route.ts`, après la fonction `getStripe()` (ligne 23), insérer :

```ts
/**
 * Un-claim a webhook event so Stripe's retry can reprocess it. Called when
 * the business logic fails AFTER the dedup insert: without this, the event
 * would stay marked as processed and a paid booking could stay pending
 * forever with no retry path.
 */
async function releaseEvent(
  supabase: ReturnType<typeof createAdminClient>,
  eventId: string,
): Promise<void> {
  const { error } = await supabase
    .from("processed_stripe_events")
    .delete()
    .eq("event_id", eventId);
  if (error) {
    console.error("Failed to release stripe event for retry:", error);
  }
}
```

- [x] **Step 2: Chemin DTV — échec d'update = release + 500**

Remplacer (lignes 95-98 actuelles) :

```ts
      if (dtvErr || !app) {
        console.error("Failed to update DTV application:", dtvErr);
        return NextResponse.json({ received: true });
      }
```

par :

```ts
      if (dtvErr) {
        console.error("Failed to update DTV application:", dtvErr);
        await releaseEvent(supabase, event.id);
        return NextResponse.json(
          { error: "DTV update failed" },
          { status: 500 },
        );
      }
      if (!app) {
        // No matching row: a retry cannot fix this, keep the 200.
        console.error("DTV application not found:", applicationId);
        return NextResponse.json({ received: true });
      }
```

- [x] **Step 3: Chemin booking confirmé — échec d'update = release + 500**

Remplacer (lignes 158-161 actuelles) :

```ts
    if (error || !updatedRows || updatedRows.length === 0) {
      console.error("Failed to update booking(s):", error);
      return NextResponse.json({ received: true });
    }
```

par :

```ts
    if (error) {
      console.error("Failed to update booking(s):", error);
      await releaseEvent(supabase, event.id);
      return NextResponse.json(
        { error: "Booking update failed" },
        { status: 500 },
      );
    }
    if (!updatedRows || updatedRows.length === 0) {
      // No matching row: a retry cannot fix this, keep the 200.
      console.error("No booking matched webhook metadata:", meta);
      return NextResponse.json({ received: true });
    }
```

- [x] **Step 4: Chemin `checkout.session.expired` — vérifier les erreurs d'annulation**

Branche DTV expired, remplacer :

```ts
    if (meta.type === "dtv" && meta.dtv_application_id) {
      await supabase
        .from("dtv_applications")
        .update({ status: "cancelled" })
        .eq("id", meta.dtv_application_id)
        .eq("status", "pending");
    } else if (meta.booking_id) {
```

par :

```ts
    if (meta.type === "dtv" && meta.dtv_application_id) {
      const { error: dtvCancelErr } = await supabase
        .from("dtv_applications")
        .update({ status: "cancelled" })
        .eq("id", meta.dtv_application_id)
        .eq("status", "pending");
      if (dtvCancelErr) {
        console.error("Failed to cancel expired DTV application:", dtvCancelErr);
        await releaseEvent(supabase, event.id);
        return NextResponse.json(
          { error: "DTV cancel failed" },
          { status: 500 },
        );
      }
    } else if (meta.booking_id) {
```

Puis, dans la même branche, remplacer :

```ts
      const { data: cancelledRows } = await query.select("id, type, time_slot");

      const blockReasons = (cancelledRows ?? [])
```

par :

```ts
      const { data: cancelledRows, error: cancelErr } =
        await query.select("id, type, time_slot");
      if (cancelErr) {
        console.error("Failed to cancel expired booking(s):", cancelErr);
        await releaseEvent(supabase, event.id);
        return NextResponse.json(
          { error: "Cancel failed" },
          { status: 500 },
        );
      }

      const blockReasons = (cancelledRows ?? [])
```

Et remplacer la suppression des blocs (fin de branche) :

```ts
      if (blockReasons.length > 0) {
        await supabase
          .from("availability_blocks")
          .delete()
          .in("reason", blockReasons);
      }
```

par :

```ts
      if (blockReasons.length > 0) {
        const { error: blockDelErr } = await supabase
          .from("availability_blocks")
          .delete()
          .in("reason", blockReasons);
        if (blockDelErr) {
          // Bookings are already cancelled; a stuck block only leaks
          // capacity. Log it, do not force a full-event retry that would
          // re-run nothing useful (the status filter matches 0 rows now).
          console.error("Failed to delete expired blocks:", blockDelErr);
        }
      }
```

(Justification du non-retry ici : au retry, l'update `status=pending → cancelled` matcherait 0 ligne, donc `blockReasons` serait vide et les blocs orphelins ne seraient de toute façon pas retentés. Le log suffit ; le cas est visible dans le drawer admin.)

- [x] **Step 5: Filet de sécurité des blocs post-confirmation — logger l'échec**

Dans la boucle « Ensure a private-slot block exists » (lignes 210-234 actuelles), remplacer :

```ts
      if (!existingBlock) {
        await supabase
          .from("availability_blocks")
          .insert({
```

par :

```ts
      if (!existingBlock) {
        const { error: safetyErr } = await supabase
          .from("availability_blocks")
          .insert({
```

et après l'objet inséré (fermeture du `.insert({...})`), ajouter :

```ts
        if (safetyErr) {
          console.error("Safety-net block insert failed:", safetyErr);
        }
```

- [x] **Step 6: Test + lint + build**

Run: `npm run test && npm run lint && npm run build`
Expected: 0 erreur. (Pas de test unitaire de route : aucune infra de mock Supabase/Stripe n'existe dans ce repo, et en créer une dépasse le périmètre zéro-régression. La vérification est la revue du diff + build.)

- [x] **Step 7: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "fix(webhook): libérer l'event Stripe et renvoyer 500 quand l'update DB échoue, pour déclencher le retry"
```

---

### Task 3: Réservation privée admin camp « both » — guard + option masquée (ÉLEVÉ n°3)

**Files:**
- Modify: `src/app/api/admin/bookings/route.ts` (guard avant le check capacité)
- Modify: `src/components/admin/CreateBookingForm.tsx:310-314` (options camp)

**Interfaces:**
- Consumes: rien.
- Produces: la route renvoie 400 `Private sessions need a specific camp.` pour `type=private, camp=both` (miroir exact du checkout public `src/app/api/checkout/route.ts:100-105`).

- [x] **Step 1: Guard serveur**

Dans `src/app/api/admin/bookings/route.ts`, juste avant le commentaire `// Check private slot availability` (ligne 151), insérer :

```ts
  // Mirror of the public checkout rule: a private session must target one
  // camp. "both" would skip the capacity check below AND create a block
  // that no per-camp occupancy query ever counts (silent overbooking).
  if (data.type === "private" && data.camp === "both") {
    return NextResponse.json(
      { error: "Private sessions need a specific camp." },
      { status: 400 },
    );
  }
```

Ne PAS retirer la clause `data.camp !== "both"` de la condition ligne 155 : elle est désormais inatteignable pour private mais fournit le narrowing TypeScript (`getSlotOccupancy` exige `"bo-phut" | "plai-laem"`).

- [x] **Step 2: Masquer l'option côté formulaire**

Dans `src/components/admin/CreateBookingForm.tsx`, remplacer (lignes 310-314) :

```tsx
                {CAMPS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
```

par :

```tsx
                {CAMPS.filter(
                  (c) => !(type === "private" && c.value === "both"),
                ).map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
```

Note : `getDefaultCamp` retourne déjà `"bo-phut"` pour type private, donc aucun état par défaut ne pointe sur both ; le filtre couvre le seul chemin restant (sélection manuelle).

- [x] **Step 3: Test + lint**

Run: `npm run test && npm run lint`
Expected: 0 erreur.

- [x] **Step 4: Commit**

```bash
git add src/app/api/admin/bookings/route.ts src/components/admin/CreateBookingForm.tsx
git commit -m "fix(admin): refuser camp both pour une session privée (bypass du contrôle de capacité)"
```

---

### Task 4: Plancher de date serveur pour training / camp-stay / fighter / stay (ÉLEVÉ n°4)

**Files:**
- Modify: `src/lib/validation/booking.ts` (superRefine)
- Modify: `src/lib/validation/stay-booking.ts` (refine)
- Modify: `src/lib/validation/booking.test.ts` (tests)

**Interfaces:**
- Consumes: `todayInBangkok()` de Task 1.
- Produces: `BookingRequestSchema` rejette `start_date` passée (calendrier Bangkok) pour tout type sauf `private` (déjà couvert par le cutoff, strictement plus fort). `StayCheckoutSchema` rejette `check_in` passé.

- [x] **Step 1: Vérifier qu'aucun composant client n'importe ces schémas**

Run: `grep -rln "BookingRequestSchema\|StayCheckoutSchema" src/ --include="*.tsx" --include="*.ts" | grep -v validation | grep -v api/`
Expected: aucun résultat (seules les routes API importent les schémas). S'il y a un import client, vérifier que `Intl.DateTimeFormat` avec `timeZone` y fonctionne (c'est le cas dans tout navigateur moderne) et continuer.

- [x] **Step 2: Tests failing**

Append to `src/lib/validation/booking.test.ts` (ajouter `vi, beforeEach, afterEach` à l'import vitest si absents) :

```ts
describe("start_date floor (Bangkok calendar)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // 2026-07-16 12:00 Bangkok (05:00 UTC).
    vi.setSystemTime(new Date("2026-07-16T05:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const base = {
    price_id: "training-dropin",
    type: "training" as const,
    camp: "bo-phut" as const,
    client_name: "Test Client",
    client_email: "test@example.com",
    client_phone: "0630802876",
  };

  it("rejects a past start_date for training", () => {
    const result = BookingRequestSchema.safeParse({
      ...base,
      start_date: "2026-07-15",
    });
    expect(result.success).toBe(false);
  });

  it("accepts today (Bangkok) as start_date", () => {
    const result = BookingRequestSchema.safeParse({
      ...base,
      start_date: "2026-07-16",
    });
    expect(result.success).toBe(true);
  });

  it("still accepts past dates for private (cutoff handles those)", () => {
    const result = BookingRequestSchema.safeParse({
      ...base,
      type: "private",
      start_date: "2026-07-10",
      sessions: [{ date: "2026-07-10", time_slot: "13:00" }],
    });
    expect(result.success).toBe(true);
  });
});
```

(Adapter l'import du fichier de test existant : il importe déjà `BookingRequestSchema`.)

- [x] **Step 3: Vérifier l'échec**

Run: `npm run test -- src/lib/validation/booking.test.ts`
Expected: FAIL sur « rejects a past start_date ».

- [x] **Step 4: Implémenter dans `booking.ts`**

Ajouter l'import :

```ts
import { todayInBangkok } from "@/lib/utils/bangkok-time";
```

Dans le `.superRefine((data, ctx) => {` existant, AVANT le bloc `if (data.type === "private")`, insérer :

```ts
    // Private sessions are covered by the per-slot cutoff (stricter than a
    // date floor). Everything else must not start in the past, judged on
    // the Bangkok calendar since server and visitors run in other zones.
    if (data.type !== "private" && data.start_date < todayInBangkok()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start_date"],
        message: "Start date cannot be in the past.",
      });
    }
```

- [x] **Step 5: Implémenter dans `stay-booking.ts`**

Ajouter l'import `todayInBangkok` (même chemin), puis chaîner après le `.refine` existant :

```ts
  .refine((d) => d.check_in >= todayInBangkok(), {
    path: ["check_in"],
    message: "Check-in cannot be in the past.",
  })
```

- [x] **Step 6: Tests + lint**

Run: `npm run test && npm run lint`
Expected: PASS. (Note anti-régression : les wizards imposent déjà `minDate = demain` côté navigateur ; le plancher serveur `>= aujourd'hui Bangkok` est strictement plus permissif que tout « demain » local possible — aucun client légitime ne peut être bloqué, y compris depuis UTC-10 ou UTC+14.)

- [x] **Step 7: Commit**

```bash
git add src/lib/validation/booking.ts src/lib/validation/stay-booking.ts src/lib/validation/booking.test.ts
git commit -m "fix(validation): refuser les dates passées côté serveur pour training, stay et fighter (calendrier Bangkok)"
```

---

### Task 5: Insert-then-verify sur l'inventaire hébergement (ÉLEVÉ n°5)

**Files:**
- Modify: `src/lib/admin/availability.ts` (nouvelles fonctions)
- Create: `src/lib/admin/availability.test.ts`
- Modify: `src/app/api/checkout/stay/route.ts` (verify après insert)
- Modify: `src/app/api/checkout/route.ts` (verify après insert, chemin standard)

**Interfaces:**
- Consumes: `getOccupancyMap`, `INVENTORY` (existants).
- Produces: `firstOverbookedNight(map: Map<string, number>, capacity: number, startDate: string, endDate: string): string | null` (pure, testable) et `findOverbookedNight(inventoryKey: InventoryKey, startDate: string, endDate: string): Promise<string | null>` (première nuit où occupation > capacité, bornes hôtelières : endDate exclu).

- [x] **Step 1: Test failing de la fonction pure**

Create `src/lib/admin/availability.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { firstOverbookedNight } from "./availability";

describe("firstOverbookedNight", () => {
  it("returns null when every night is at or under capacity", () => {
    const map = new Map([
      ["2026-08-01", 1],
      ["2026-08-02", 1],
    ]);
    expect(firstOverbookedNight(map, 1, "2026-08-01", "2026-08-03")).toBeNull();
  });

  it("returns the first night strictly over capacity", () => {
    const map = new Map([
      ["2026-08-01", 1],
      ["2026-08-02", 2],
    ]);
    expect(firstOverbookedNight(map, 1, "2026-08-01", "2026-08-03")).toBe(
      "2026-08-02",
    );
  });

  it("ignores the checkout day (hotel logic)", () => {
    // Stay Aug 1 -> Aug 3 occupies nights 1 and 2 only.
    const map = new Map([["2026-08-03", 99]]);
    expect(firstOverbookedNight(map, 1, "2026-08-01", "2026-08-03")).toBeNull();
  });
});
```

- [x] **Step 2: Vérifier l'échec**

Run: `npm run test -- src/lib/admin/availability.test.ts`
Expected: FAIL — `firstOverbookedNight` non exporté.

- [x] **Step 3: Implémenter dans `availability.ts`**

Append à la fin de `src/lib/admin/availability.ts` :

```ts
/**
 * Pure core of the insert-then-verify pattern for accommodation: first
 * night in [startDate, endDate) whose occupancy STRICTLY exceeds capacity.
 * Called after inserting a booking, so a fully-booked night reads
 * `capacity` and only a concurrent double-insert reads more.
 */
export function firstOverbookedNight(
  map: Map<string, number>,
  capacity: number,
  startDate: string,
  endDate: string,
): string | null {
  const lastNight = format(subDays(parseISO(endDate), 1), "yyyy-MM-dd");
  const nights = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(lastNight),
  });
  for (const night of nights) {
    const key = format(night, "yyyy-MM-dd");
    if ((map.get(key) ?? 0) > capacity) return key;
  }
  return null;
}

/**
 * Re-reads occupancy AFTER a booking insert and reports the first
 * overbooked night, closing the check-then-insert race the same way the
 * private-slot path does in /api/checkout.
 */
export async function findOverbookedNight(
  inventoryKey: InventoryKey,
  startDate: string,
  endDate: string,
): Promise<string | null> {
  const lastNight = format(subDays(parseISO(endDate), 1), "yyyy-MM-dd");
  const map = await getOccupancyMap(inventoryKey, startDate, lastNight);
  return firstOverbookedNight(map, INVENTORY[inventoryKey], startDate, endDate);
}
```

- [x] **Step 4: Vérifier que les tests passent**

Run: `npm run test -- src/lib/admin/availability.test.ts`
Expected: PASS (3 tests).

- [x] **Step 5: Brancher dans `src/app/api/checkout/stay/route.ts`**

Ajouter `findOverbookedNight` à l'import existant depuis `@/lib/admin/availability` (ligne 8) :

```ts
import { checkRangeAvailability, findOverbookedNight } from "@/lib/admin/availability";
```

Puis, après le bloc d'insert réussi (après la garde `if (error || !booking) {...}`, avant `const origin = getCheckoutOrigin(request);`), insérer :

```ts
    // Insert-then-verify: with the booking now counted in occupancy, any
    // night above capacity means a concurrent request won the last unit.
    const overbooked = await findOverbookedNight(
      inventoryKey,
      data.check_in,
      data.check_out,
    );
    if (overbooked) {
      await supabase.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        {
          error: `Sold out on ${overbooked}. Please choose different dates.`,
        },
        { status: 409 },
      );
    }
```

- [x] **Step 6: Brancher dans `src/app/api/checkout/route.ts` (chemin standard)**

Ajouter `findOverbookedNight` à l'import ligne 7 :

```ts
import { checkRangeAvailability, findOverbookedNight } from "@/lib/admin/availability";
```

Après la garde d'insert du chemin standard (`if (error || !booking) {...}`, ligne 317-323), avant `const origin = getCheckoutOrigin(request);`, insérer :

```ts
    // Insert-then-verify for accommodation-consuming packages (same race
    // closure as the private-slot path above).
    if (inventoryKey && data.start_date && data.end_date) {
      const overbooked = await findOverbookedNight(
        inventoryKey,
        data.start_date,
        data.end_date,
      );
      if (overbooked) {
        await supabase.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          {
            error: `Sold out on ${overbooked}. Please choose different dates.`,
          },
          { status: 409 },
        );
      }
    }
```

- [x] **Step 7: Tests + lint + build**

Run: `npm run test && npm run lint && npm run build`
Expected: 0 erreur.

- [x] **Step 8: Commit**

```bash
git add src/lib/admin/availability.ts src/lib/admin/availability.test.ts src/app/api/checkout/stay/route.ts src/app/api/checkout/route.ts
git commit -m "fix(booking): insert-then-verify sur l'inventaire chambres et bungalow (race de double réservation)"
```

---

### Task 6: Rollback du booking si Stripe échoue sur le chemin standard (MOYEN n°6)

**Files:**
- Modify: `src/app/api/checkout/route.ts:327-346`

**Interfaces:** aucun changement de signature ; miroir exact du pattern déjà présent dans `checkout/stay/route.ts:112-143`.

- [x] **Step 1: Envelopper la création de session Stripe**

Remplacer le bloc final du chemin standard :

```ts
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "en",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: getStripeQuantity(pkg, data.num_participants),
        },
      ],
      metadata: {
        booking_id: booking.id,
      },
      customer_email: data.client_email,
      success_url: `${origin}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/booking?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
```

par :

```ts
    const stripe = getStripe();
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        locale: "en",
        payment_method_types: ["card"],
        line_items: [
          {
            price: stripePriceId,
            quantity: getStripeQuantity(pkg, data.num_participants),
          },
        ],
        metadata: {
          booking_id: booking.id,
        },
        customer_email: data.client_email,
        success_url: `${origin}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/booking?cancelled=1`,
      });
    } catch (stripeErr) {
      // No Stripe session means no expired-webhook cleanup will ever come:
      // remove the pending row so it stops consuming inventory.
      console.error("Stripe session creation failed:", stripeErr);
      await supabase.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "Payment provider error. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
```

- [x] **Step 2: Tests + lint**

Run: `npm run test && npm run lint`
Expected: 0 erreur.

- [x] **Step 3: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "fix(checkout): rollback du booking pending si la création de session Stripe échoue (chemin standard)"
```

---

### Task 7: `expires_at` 30 minutes sur les checkouts qui bloquent de la capacité (FAIBLE)

**Files:**
- Modify: `src/app/api/checkout/route.ts` (2 appels `sessions.create`)
- Modify: `src/app/api/checkout/stay/route.ts` (1 appel)

**Interfaces:** aucun. 30 minutes est le minimum autorisé par Stripe ; un panier abandonné libère créneaux/chambres via le webhook `expired` en 30 min au lieu de 24 h. La route DTV n'est volontairement pas touchée (aucune capacité bloquée).

- [x] **Step 1: Ajouter le champ aux 3 `sessions.create`**

Dans chacun des 3 appels (checkout privé ligne ~243, checkout standard ligne ~331 dans sa nouvelle forme try/catch, stay ligne ~114), ajouter juste après `mode: "payment",` :

```ts
        // Stripe minimum. Bookings hold real capacity (trainer units or
        // rooms) from insert time: keep the unpaid-hold window short.
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
```

- [x] **Step 2: Tests + lint + build**

Run: `npm run test && npm run lint && npm run build`
Expected: 0 erreur.

- [x] **Step 3: Commit**

```bash
git add src/app/api/checkout/route.ts src/app/api/checkout/stay/route.ts
git commit -m "fix(checkout): expiration Stripe à 30 min pour libérer la capacité des paniers abandonnés"
```

---

### Task 8: Insert-then-verify sur la réservation privée admin (FAIBLE, TOCTOU)

**Files:**
- Modify: `src/app/api/admin/bookings/route.ts:217-230`

**Interfaces:**
- Consumes: `getSlotOccupancy` (déjà importé), `PRIVATE_SLOT_CAPACITY` (à importer depuis `@/content/schedule`).

- [x] **Step 1: Ajouter l'import**

```ts
import { PRIVATE_SLOT_CAPACITY } from "@/content/schedule";
```

- [x] **Step 2: Vérifier après l'insert du bloc**

Remplacer le bloc « Create private-slot block if private session » :

```ts
  // Create private-slot block if private session
  if (data.type === "private" && data.time_slot) {
    await admin
      .from("availability_blocks")
      .insert({
        date: data.start_date,
        type: "private-slot",
        time_slot: data.time_slot,
        camp: data.camp,
        units,
        is_blocked: true,
        reason: `Booking ${booking.id}`,
      });
  }
```

par :

```ts
  // Create private-slot block if private session
  if (data.type === "private" && data.time_slot) {
    const { error: blockErr } = await admin
      .from("availability_blocks")
      .insert({
        date: data.start_date,
        type: "private-slot",
        time_slot: data.time_slot,
        camp: data.camp,
        units,
        is_blocked: true,
        reason: `Booking ${booking.id}`,
      });
    if (blockErr) {
      console.error("Admin slot block insert failed:", blockErr);
      await admin.from("bookings").delete().eq("id", booking.id);
      return NextResponse.json(
        { error: "Could not reserve the slot. Please try again." },
        { status: 500 },
      );
    }

    // Insert-then-verify, same as the public checkout: a concurrent
    // customer booking can land between our check and our insert.
    if (data.camp !== "both") {
      const occupiedAfter = await getSlotOccupancy(admin, {
        date: data.start_date,
        timeSlot: data.time_slot,
        camp: data.camp,
      });
      if (occupiedAfter > PRIVATE_SLOT_CAPACITY) {
        await admin
          .from("availability_blocks")
          .delete()
          .eq("reason", `Booking ${booking.id}`);
        await admin.from("bookings").delete().eq("id", booking.id);
        return NextResponse.json(
          {
            error: `Time slot ${data.time_slot} just filled up on ${data.start_date}. Pick another time.`,
          },
          { status: 409 },
        );
      }
    }
  }
```

(Le `data.camp !== "both"` reste pour le narrowing TS ; Task 3 garantit qu'un private n'arrive jamais ici avec both.)

- [x] **Step 3: Tests + lint**

Run: `npm run test && npm run lint`
Expected: 0 erreur.

- [x] **Step 4: Commit**

```bash
git add src/app/api/admin/bookings/route.ts
git commit -m "fix(admin): insert-then-verify sur les créneaux privés créés par l'admin (course admin vs client)"
```

---

### Task 9: Confirmation avant suppression d'un bloc dans le drawer admin (MOYEN n°8)

**Files:**
- Modify: `src/components/admin/AdminDayDrawer.tsx:350-362`

- [x] **Step 1: Ajouter la confirmation**

Remplacer le onClick du bouton Remove :

```tsx
                    <button
                      onClick={async () => {
                        setLoading(`del-${block.id}`);
                        await removeBlock(block.id);
                        onRefresh();
                        setLoading(null);
                      }}
```

par :

```tsx
                    <button
                      onClick={async () => {
                        const linkedToBooking =
                          block.reason?.startsWith("Booking ");
                        const message = linkedToBooking
                          ? "This block reserves a paid booking's slot. Removing it frees the slot for new customers while the booking stays active. Remove anyway?"
                          : "Remove this block?";
                        if (!window.confirm(message)) return;
                        setLoading(`del-${block.id}`);
                        await removeBlock(block.id);
                        onRefresh();
                        setLoading(null);
                      }}
```

- [x] **Step 2: Tests + lint**

Run: `npm run test && npm run lint`
Expected: 0 erreur.

- [x] **Step 3: Commit**

```bash
git add src/components/admin/AdminDayDrawer.tsx
git commit -m "fix(admin): confirmation avant suppression d'un bloc, avec avertissement si lié à un booking payé"
```

---

### Task 10: Pages de confirmation — vérifier `payment_status` (MOYEN n°9)

**Files:**
- Modify: `src/app/booking/confirmed/page.tsx`
- Modify: `src/app/visa/dtv/confirmed/page.tsx`

**Interfaces:**
- Produces: les deux resolvers retournent un état discriminé ; `payment_status === "unpaid"` affiche un écran « Payment not completed » au lieu du message de succès. `"paid"` et `"no_payment_required"` restent le chemin succès. Résolution impossible (erreur réseau, session inconnue) garde le fallback neutre actuel.

- [x] **Step 1: `booking/confirmed` — resolver**

Dans `src/app/booking/confirmed/page.tsx`, remplacer la signature et le début de `resolveBooking` :

```ts
async function resolveBooking(
  sessionId: string,
): Promise<BookingSummary | null> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return null;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.booking_id;
    const groupId = session.metadata?.booking_group_id;
    if (!bookingId) return null;
```

par :

```ts
type BookingResolution =
  | { state: "paid"; booking: BookingSummary }
  | { state: "unpaid" }
  | { state: "unknown" };

async function resolveBooking(
  sessionId: string,
): Promise<BookingResolution> {
  try {
    if (!process.env.STRIPE_SECRET_KEY) return { state: "unknown" };
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // The success URL is guessable; never show "confirmed" copy for a
    // session whose payment did not actually complete.
    if (session.payment_status === "unpaid") return { state: "unpaid" };
    const bookingId = session.metadata?.booking_id;
    const groupId = session.metadata?.booking_group_id;
    if (!bookingId) return { state: "unknown" };
```

Adapter le corps : `if (error || !rows || rows.length === 0) return { state: "unknown" };`, le `return {...}` final devient `return { state: "paid", booking: { ...objet actuel... } };`, et le `catch` retourne `{ state: "unknown" }`.

- [x] **Step 2: `booking/confirmed` — rendu**

Remplacer le début du composant :

```tsx
export default async function BookingConfirmedPage({ searchParams }: Props) {
  const params = await searchParams;
  const booking = params.session_id
    ? await resolveBooking(params.session_id)
    : null;
```

par :

```tsx
export default async function BookingConfirmedPage({ searchParams }: Props) {
  const params = await searchParams;
  const resolution = params.session_id
    ? await resolveBooking(params.session_id)
    : null;
  const booking = resolution?.state === "paid" ? resolution.booking : null;

  if (resolution?.state === "unpaid") {
    return (
      <>
        <JsonLd data={[organizationSchema()]} />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Book", href: "/booking" },
          ]}
        />
        <section className="py-16 sm:py-24 px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
              Payment not completed
            </h1>
            <p className="mt-4 text-on-surface-variant text-lg">
              This booking has no completed payment yet. If you just paid,
              give it a minute and refresh this page. Otherwise you can start
              again from the booking page.
            </p>
            <Link href="/booking" className="mt-8 inline-block btn-link">
              Back to booking
            </Link>
          </div>
        </section>
      </>
    );
  }
```

(Vérifier que `Link` est importé ; le fichier importe déjà `next/link` — sinon l'ajouter. Vérifier la classe `btn-link` : elle est utilisée dans `ContactForm.tsx`, donc existe dans le design system. Si le rendu paraît trop nu à l'exécution, réutiliser les classes du CTA existant de la page.)

- [x] **Step 3: `visa/dtv/confirmed` — même traitement**

Dans `resolveApplication`, après le retrieve (ligne 40), insérer :

```ts
    if (session.payment_status === "unpaid") return null;
```

et changer le rendu : la page affiche déjà un fallback quand `application` est null, MAIS son titre reste « Application received ». Passer le titre et le sous-texte en variante conditionnelle n'est pas possible sans savoir si null vient d'unpaid ou d'une erreur : appliquer le même pattern discriminé que Step 1-2 :

```ts
type DtvResolution =
  | { state: "paid"; application: DtvSummary }
  | { state: "unpaid" }
  | { state: "unknown" };
```

`resolveApplication` retourne `{ state: "unpaid" }` si `payment_status === "unpaid"`, `{ state: "paid", application: {...} }` en succès, `{ state: "unknown" }` sinon. Le composant rend, pour `unpaid` :

```tsx
  if (resolution?.state === "unpaid") {
    return (
      <>
        <JsonLd data={[organizationSchema()]} />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "DTV Visa", href: "/visa/dtv" },
          ]}
        />
        <section className="py-16 sm:py-24 px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
              Payment not completed
            </h1>
            <p className="mt-4 text-on-surface-variant text-lg">
              Your DTV application is saved but the payment did not go
              through. You can restart the payment from the application page,
              or reach out on WhatsApp if you need help.
            </p>
            <Link href="/visa/dtv/apply" className="mt-8 inline-block btn-link">
              Back to the application
            </Link>
          </div>
        </section>
      </>
    );
  }
```

- [x] **Step 4: Tests + lint + build**

Run: `npm run test && npm run lint && npm run build`
Expected: 0 erreur.

- [x] **Step 5: Commit**

```bash
git add src/app/booking/confirmed/page.tsx src/app/visa/dtv/confirmed/page.tsx
git commit -m "fix(confirmation): ne plus afficher un succès pour une session Stripe non payée"
```

---

### Task 11: Copy du formulaire de contact — ne plus promettre un email (FAIBLE n°13)

**Files:**
- Modify: `src/components/ui/ContactForm.tsx:74-77`

- [x] **Step 1: Ajuster la copy**

Remplacer :

```tsx
          <p className="text-on-surface-variant text-sm max-w-sm">
            We received your message and will get back to you shortly. Check
            your email for a confirmation.
          </p>
```

par :

```tsx
          <p className="text-on-surface-variant text-sm max-w-sm">
            We received your message and will get back to you shortly,
            usually within a day.
          </p>
```

(L'email de confirmation visiteur reste best-effort côté API ; la promesse disparaît de l'UI. La réception par le camp, elle, est garantie : la route renvoie 500 si l'email admin échoue.)

- [x] **Step 2: Lint + commit**

Run: `npm run lint`

```bash
git add src/components/ui/ContactForm.tsx
git commit -m "fix(contact): ne plus promettre un email de confirmation (envoi best-effort)"
```

---

### Task 12: Corrections de contenu factuel (MOYEN n°12)

**Files:**
- Modify: `src/app/page.tsx:431`
- Modify: `src/app/booking/page.tsx:66`
- Modify: `src/components/ui/ScheduleTable.tsx:105`
- Modify: `src/app/robots.ts:18-19`

- [x] **Step 1: Horaires du passage GEO homepage**

`src/app/page.tsx` ligne 431, remplacer :

```tsx
            . Open 6 days a week from 8 AM to 8 PM. Drop-in sessions start at
```

par :

```tsx
            . Open 6 days a week from 7 AM to 8 PM. Drop-in sessions start at
```

(Aligne avec contact, FAQ, camps et le JSON-LD `Mo-Sa 07:00-20:00`.)

- [x] **Step 2: Badge Fighter Program du hub booking**

`src/app/booking/page.tsx` ligne 66, remplacer :

```tsx
    badge: "Bo Phut or Plai Laem",
```

(celui de l'objet `id: "fighter"` UNIQUEMENT — les badges training et private lignes 44 et 55 sont corrects) par :

```tsx
    badge: "Plai Laem only",
```

- [x] **Step 3: Légende du planning**

`src/components/ui/ScheduleTable.tsx` ligne 105, remplacer :

```tsx
              <span className="w-2 h-2 rounded-full bg-red-500" />
```

par :

```tsx
              <span className="w-2 h-2 rounded-full bg-blue-500" />
```

(Aligne la légende sur `TYPE_STYLES.fighter.dot` et supprime la collision visuelle avec le rouge « Sunday Closed ».)

- [x] **Step 4: robots.ts**

Supprimer les deux lignes :

```ts
          "/privacy",
          "/terms",
```

du tableau `disallow` (décision assumée n°1 : pages légitimes du footer, présentes dans le sitemap).

- [x] **Step 5: Humanizer + vérifications**

Passer `/humanizer` sur les deux strings modifiées (« Open 6 days a week from 7 AM to 8 PM... » et « Plai Laem only ») — corrections factuelles minimales, aucune reformulation attendue.

Run: `npm run test && npm run lint && npm run build`
Expected: 0 erreur.

- [x] **Step 6: Commit**

```bash
git add src/app/page.tsx src/app/booking/page.tsx src/components/ui/ScheduleTable.tsx src/app/robots.ts
git commit -m "fix(content): horaires GEO 7AM, badge fighter Plai Laem only, légende planning, robots vs sitemap"
```

---

### Task 13: Formulaire DTV — erreurs de champ serveur + plancher DOB client (FAIBLE)

**Files:**
- Modify: `src/app/visa/dtv/apply/DtvApplyForm.tsx:85-94` (validate) et `:195-200` (handleSubmit)

- [x] **Step 1: Plancher DOB côté client (aligné sur le serveur)**

Dans `validate()`, remplacer :

```ts
    const dob = new Date(`${form.date_of_birth}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(dob.getTime()) || dob >= today) {
      errors.date_of_birth = "Enter a valid date of birth.";
    }
```

par :

```ts
    const dob = new Date(`${form.date_of_birth}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oldest = new Date("1920-01-01T00:00:00");
    if (Number.isNaN(dob.getTime()) || dob >= today || dob < oldest) {
      errors.date_of_birth = "Enter a valid date of birth.";
    }
```

- [x] **Step 2: Mapper les issues Zod du serveur vers les champs**

Dans `handleSubmit`, remplacer :

```ts
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setApiError(data.error ?? "Something went wrong.");
      }
```

par :

```ts
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (res.status === 400 && Array.isArray(data.issues)) {
        // Surface the server-side Zod messages on their fields instead of
        // a generic error the user cannot act on.
        const fieldErrors: Record<string, string> = {};
        for (const issue of data.issues as {
          path?: (string | number)[];
          message?: string;
        }[]) {
          const key = issue.path?.[0];
          if (typeof key === "string" && !(key in fieldErrors)) {
            fieldErrors[key] = issue.message ?? "Invalid value.";
          }
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors);
          const firstKey = Object.keys(fieldErrors)[0];
          const el = document.querySelector<HTMLElement>(
            `[data-field="${firstKey}"]`,
          );
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
          setApiError(data.error ?? "Something went wrong.");
        }
      } else {
        setApiError(data.error ?? "Something went wrong.");
      }
```

- [x] **Step 3: Tests + lint + commit**

Run: `npm run test && npm run lint`

```bash
git add src/app/visa/dtv/apply/DtvApplyForm.tsx
git commit -m "fix(dtv): erreurs Zod serveur affichées par champ + plancher date de naissance côté client"
```

---

### Task 14: Assainir le paramètre de recherche admin (FAIBLE)

**Files:**
- Modify: `src/lib/admin/bookings-query.ts:34-38`

- [x] **Step 1: Neutraliser les caractères de grammaire PostgREST**

Remplacer :

```ts
  if (params.q) {
    query = query.or(
      `client_name.ilike.%${params.q}%,client_email.ilike.%${params.q}%`,
    );
  }
```

par :

```ts
  if (params.q) {
    // Strip PostgREST .or() grammar characters (comma, parens, quotes):
    // they would break the filter string. Dots and % are safe inside an
    // ilike pattern and dots are common in emails.
    const q = params.q.replace(/[,()"\\]/g, " ").trim();
    if (q) {
      query = query.or(`client_name.ilike.%${q}%,client_email.ilike.%${q}%`);
    }
  }
```

- [x] **Step 2: Lint + commit**

Run: `npm run test && npm run lint`

```bash
git add src/lib/admin/bookings-query.ts
git commit -m "fix(admin): neutraliser les caractères spéciaux PostgREST dans la recherche bookings"
```

---

### Task 15: Valider les paramètres de l'API occupancy publique (FAIBLE)

**Files:**
- Modify: `src/app/api/availability/occupancy/route.ts`

- [x] **Step 1: Validation format + plage**

Remplacer le corps de la garde existante :

```ts
  if (!inventoryKey || !from || !to) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (inventoryKey !== "rooms" && inventoryKey !== "bungalows") {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }
```

par :

```ts
  if (!inventoryKey || !from || !to) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  if (inventoryKey !== "rooms" && inventoryKey !== "bungalows") {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  if (!DATE_RE.test(from) || !DATE_RE.test(to) || from > to) {
    return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
  }
  // Public endpoint: cap the window to keep the occupancy scan bounded.
  if (
    differenceInCalendarDays(parseISO(to), parseISO(from)) > 366
  ) {
    return NextResponse.json({ error: "Range too large" }, { status: 400 });
  }
```

Ajouter l'import :

```ts
import { differenceInCalendarDays, parseISO } from "date-fns";
```

- [x] **Step 2: Vérifier les consommateurs**

Run: `grep -rn "api/availability/occupancy" src/`
Expected: `StayCalendar.tsx` (et potentiellement `AvailabilityCalendar.tsx` / wizards). Vérifier que chaque appelant envoie des fenêtres < 366 jours (les calendriers demandent 1-4 mois) — aucun changement attendu côté appelants.

- [x] **Step 3: Tests + lint + commit**

Run: `npm run test && npm run lint`

```bash
git add src/app/api/availability/occupancy/route.ts
git commit -m "fix(api): valider format et plage des dates sur l'endpoint occupancy public"
```

---

### Task 16: FighterWizard — reset des dates au changement de tier (MOYEN n°11b)

**Files:**
- Modify: `src/app/booking/fighter/FighterWizard.tsx:63-66`
- Check: `src/app/booking/camp-stay/CampStayWizard.tsx` (même pattern ?)

- [x] **Step 1: Reset du range**

Remplacer :

```ts
  // Fighter program runs at Plai Laem only — camp stays locked to plai-laem.
  useEffect(() => {
    setCamp("plai-laem");
  }, [tier]);
```

par :

```ts
  // Fighter program runs at Plai Laem only: camp stays locked to plai-laem.
  // Switching tier also resets the picked dates: rooms (7 units) and the
  // bungalow (1 unit) have different availability, so dates validated
  // against one pool must not carry over to the other.
  useEffect(() => {
    setCamp("plai-laem");
    setRange(undefined);
  }, [tier]);
```

- [x] **Step 2: Vérifier CampStayWizard**

Run: `grep -n "setRange\|unit\|useEffect" src/app/booking/camp-stay/CampStayWizard.tsx | head -30`
Lire les lignes concernées. Si le wizard permet de changer d'unité (room/bungalow) en conservant un `range` déjà choisi, appliquer le même reset (`setRange(undefined)` dans un `useEffect` sur l'unité). Sinon, ne rien toucher.

- [x] **Step 3: Tests + lint + commit**

Run: `npm run test && npm run lint`

```bash
git add src/app/booking/fighter/FighterWizard.tsx
git commit -m "fix(booking): reset des dates quand on change de tier room/bungalow dans le wizard fighter"
```

(Ajouter CampStayWizard.tsx au commit si modifié.)

---

### Task 17: Vérification read-only des données prod camp="both" (suite du finding n°3)

**Files:** aucun fichier modifié — inspection seule.

- [x] **Step 1: Requêter la prod en lecture seule via le MCP projet**

Via `mcp__supabase-ratchawat__execute_sql` (projet `rlmeafyvedpsflwohuyy`), exécuter :

```sql
select id, date, time_slot, camp, units, reason
from availability_blocks
where type = 'private-slot' and camp = 'both';
```

puis :

```sql
select id, start_date, time_slot, camp, status, client_name
from bookings
where type = 'private' and camp = 'both';
```

- [x] **Step 2: Rapporter, ne rien corriger**

Si les deux requêtes renvoient 0 ligne : consigner « aucune donnée corrompue » dans le rapport final. Si des lignes existent : les lister à Rd avec la correction proposée (réattribuer le bon camp manuellement), et NE PAS modifier la prod sans son accord explicite.

---

### Task 18: Documentation, question cliente, vérification finale

**Files:**
- Modify: `PROJECT-STATUS.md`
- Modify: `docs/superpowers/plans/2026-07-16-audit-fixes.md` (cocher les cases)

- [x] **Step 1: Question cliente grille tarifaire (finding n°7 — AUCUN changement de code)**

Ajouter dans `PROJECT-STATUS.md`, section questions ouvertes / à confirmer :

```markdown
- **Grille Standard Room 17-29 nuits à confirmer avec la cliente** : avec les
  paliers actuels (14 nuits = 15 000 THB + 1 140/nuit extra ; 30 nuits =
  18 000 THB), un séjour de 17 à 29 nuits coûte plus cher que le mois complet
  (ex. 29 nuits = 32 100 THB vs 30 nuits = 18 000 THB). Est-ce voulu ?
  Sinon, fournir le tarif extra-night souhaité entre 14 et 30 nuits.
  (Détecté par l'audit du 2026-07-16, aucun changement appliqué.)
```

- [x] **Step 2: Historique des corrections**

Ajouter une entrée datée 2026-07-16 dans l'historique de `PROJECT-STATUS.md` listant les correctifs (cutoff Bangkok, webhook retry, camp both, plancher de dates, insert-then-verify hébergement, rollback checkout, expires_at 30 min, verify admin, confirm drawer, payment_status pages confirmées, copy contact, contenus, DTV field errors, sanitize recherche, validation occupancy, reset range fighter) + les décisions assumées (section de ce plan) + le résultat de la Task 17.

- [x] **Step 3: Vérification finale complète**

Run: `npm run test && npm run lint && npm run build`
Expected: 0 erreur partout.

Run: `git log --oneline main -20`
Expected: la série de commits de ce plan, tous locaux (`git status` propre, aucun push effectué).

- [x] **Step 4: Commit docs**

```bash
git add PROJECT-STATUS.md docs/superpowers/plans/2026-07-16-audit-fixes.md
git commit -m "docs: correctifs audit 2026-07-16 consignés + question cliente grille 17-29 nuits"
```

- [x] **Step 5: Rapport final à Rd**

Livrer l'inventaire « prod vs local » : TOUT est resté local (commits non poussés) ; rien n'a touché la prod sauf les 2 SELECT read-only de la Task 17. Le déploiement se fera quand Rd pousse sur main après revue. Recommander un smoke test post-deploy : une réservation privée test en mode Stripe LIVE à petit montant OU vérification en préproduction/preview Vercel, au choix de Rd.
