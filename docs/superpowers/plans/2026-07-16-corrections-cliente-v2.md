# Corrections cliente V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Appliquer les 4 corrections cliente du 16/07/2026 : groupe privé adulte à 700 THB/personne, tarifs nuit supplémentaire bungalow (760/850), lit king-size dans la copie, politiques non-remboursable + électricité.

**Architecture:** Corrections de catalogue centralisé (`src/content/pricing.ts`, `src/content/stay-pricing.ts`, `src/content/policies.ts`) + copie en dur dérivée (pages, `llms-full.txt`). Le moteur de facturation (`src/lib/booking/pricing.ts`) et les wizards lisent le catalogue et s'adaptent sans changement de code. Un seed Stripe (sync pass existante) crée le nouveau price 700 THB.

**Tech Stack:** Next.js 16, TypeScript 5, Vitest, Stripe (LIVE en prod), script `npm run stripe:seed`.

**Spec:** `docs/superpowers/specs/2026-07-16-corrections-cliente-v2-design.md`

## Global Constraints

- Toute la copie visible est en **anglais**. Pas d'em dash. Pas de séquences unicode échappées.
- Les 2 nouvelles constantes de `policies.ts` sont du **texte cliente verbatim** : ne pas les passer au humanizer, ne pas les reformuler. Le reste de la copie modifiée passe par `/humanizer` avant commit (Task 5).
- **Ne pas toucher** : `private-kids-group` (400 THB/enfant), paliers chambre 7/14 nuits (8 000 / 15 000, extra 1 140), politiques existantes de `policies.ts`.
- **Ne jamais éditer à la main** les champs `stripePriceIdTest`/`stripePriceIdLive` : le script `scripts/stripe-seed-products.ts` les réécrit (Task 6).
- Site **LIVE en prod** : la Task 6 (Stripe LIVE + deploy) exige un GO explicite de Rd avant chaque étape marquée ⚠️.
- Commits : Conventional Commits, type/scope en anglais, description en français.
- Commandes de vérification : `npm run test` (vitest), `npm run lint`, `npm run build`.

---

### Task 1: Groupe privé adulte à 700 THB par personne

**Files:**
- Create: `src/content/pricing.test.ts`
- Modify: `src/content/pricing.ts:335-357` (item `private-adult-group`)
- Modify: `src/app/pricing/page.tsx:78` et `:383`
- Modify: `src/app/programs/private/page.tsx:213`
- Modify: `public/llms-full.txt:72`

**Interfaces:**
- Consumes: `getPriceById(id)` de `src/content/pricing.ts` ; `computeBookingAmount`, `getStripeQuantity`, `getCapacityUnits` de `src/lib/booking/pricing.ts` (signatures existantes, inchangées).
- Produces: item catalogue `private-adult-group` avec `price: 700` et **sans** champ `billing` (le défaut du moteur = per-person). Le checkout, le wizard et les pages s'adaptent seuls.

- [ ] **Step 1: Écrire le test de régression catalogue (failing)**

Créer `src/content/pricing.test.ts` :

```ts
import { describe, it, expect } from "vitest";
import { getPriceById } from "./pricing";
import {
  computeBookingAmount,
  getStripeQuantity,
  getCapacityUnits,
} from "../lib/booking/pricing";

describe("catalog: private-adult-group (client correction 2026-07-16)", () => {
  const item = getPriceById("private-adult-group")!;

  it("is billed per person at 700 THB", () => {
    expect(item.price).toBe(700);
    expect(item.billing).toBeUndefined();
    expect(computeBookingAmount(item, 2)).toBe(1400);
    expect(computeBookingAmount(item, 3)).toBe(2100);
  });

  it("bills one Stripe quantity per participant but consumes one trainer", () => {
    expect(getStripeQuantity(item, 3)).toBe(3);
    expect(getCapacityUnits(item, 3)).toBe(1);
  });
});
```

- [ ] **Step 2: Vérifier que le test échoue**

Run: `npm run test -- src/content/pricing.test.ts`
Expected: FAIL (`item.price` vaut 1400, `item.billing` vaut "flat", `computeBookingAmount(item, 3)` vaut 1400)

- [ ] **Step 3: Corriger l'item catalogue**

Dans `src/content/pricing.ts`, remplacer l'item `private-adult-group` (les champs `stripe*` restent tels quels, ils seront réécrits par le seed en Task 6) :

```ts
  {
    id: "private-adult-group",
    stripeProductIdLive: "prod_UQ39nAneq8uwpM",
    stripePriceIdLive: "price_1TszRmRu1Uc6NzUvlxJBnJPS",
    stripeProductIdTest: "prod_UJh47v38QjpAfA",
    stripePriceIdTest: "price_1Tsuv4Ru1Uc6NzUvxpmMPTcU",
    name: "Private Group 2-3 (Adult)",
    nameShort: "Private Group",
    category: "private-adult",
    price: 700,
    currency: "THB",
    unit: "person/session",
    description: "Private session for 2-3 people with one trainer (3 people max). Price per person.",
    includes: [
      "60 minutes with 1 trainer",
      "For 2-3 participants (3 max)",
      "All equipment provided",
    ],
    notes: "Price per person. Minimum 2, maximum 3 participants.",
    participants: { min: 2, max: 3 },
    bookingType: "private",
  },
```

Changements vs l'existant : `price: 1400` → `700` ; suppression de `billing: "flat"` ; `unit: "session"` → `"person/session"` ; `description` et `notes` réécrites (plus de "One price per session").

- [ ] **Step 4: Vérifier que le test passe**

Run: `npm run test -- src/content/pricing.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 5: Mettre à jour la copie en dur**

`src/app/pricing/page.tsx` ligne 78 (JSON-LD offers), remplacer :

```tsx
              { name: "Private Lesson Adult Group", price: privateAdultGroup.price!, description: "60-minute private session for 2-3 people, one price per session" },
```

par :

```tsx
              { name: "Private Lesson Adult Group", price: privateAdultGroup.price!, description: "60-minute private session for 2-3 people, price per person" },
```

`src/app/pricing/page.tsx` ligne 383, remplacer :

```tsx
                    <span>Small group private session (60 min, 2-3 people, one price per session)</span>
```

par :

```tsx
                    <span>Small group private session (60 min, 2-3 people, price per person)</span>
```

`src/app/programs/private/page.tsx` ligne 213, remplacer `THB per session` par `THB per person` :

```tsx
              <span className="font-serif text-2xl font-bold text-primary">{privateAdultGroup.price!.toLocaleString("en-US")} <span className="text-xs font-normal text-on-surface-variant">THB per person</span></span>
```

`public/llms-full.txt` ligne 72, remplacer :

```
| Private group 2-3 adults (60 min) | 1,400 THB per session |
```

par :

```
| Private group 2-3 adults (60 min) | 700 THB per person |
```

- [ ] **Step 6: Vérifier qu'il ne reste aucune trace de l'ancien tarif**

Run: `rg -ni "one price per session|1,400" src public`
Expected: aucun résultat.

Run: `npm run test`
Expected: PASS (la suite complète — `src/lib/booking/pricing.test.ts` teste le moteur avec des littéraux, pas le catalogue, donc rien d'autre ne casse).

- [ ] **Step 7: Commit**

```bash
git add src/content/pricing.ts src/content/pricing.test.ts src/app/pricing/page.tsx src/app/programs/private/page.tsx public/llms-full.txt
git commit -m "fix(pricing): groupe privé adulte à 700 THB par personne (correction cliente V2)"
```

---

### Task 2: Nuits supplémentaires bungalow (760 / 850 THB)

**Files:**
- Modify: `src/lib/booking/stay.test.ts:50-57`
- Modify: `src/content/stay-pricing.ts:60-84`
- Modify: `src/app/programs/fighter/page.tsx:303`
- Modify: `public/llms-full.txt:29,34,81,89`

**Interfaces:**
- Consumes: `computeStayPrice(checkIn, checkOut, unit, plan)` et `STAY_RATE_CARDS` (signatures inchangées).
- Produces: `extraNightRate` bungalow normal = 760, bungalow fighter = 850 dans `STAY_RATE_CARDS`. Pages et wizards lisent ces valeurs.

- [ ] **Step 1: Mettre à jour les attentes des tests (failing)**

Dans `src/lib/booking/stay.test.ts`, remplacer les deux tests bungalow (lignes 50-57) :

```ts
  it("bungalow normal: rejects under 30 nights, 31 nights = 23760 (extra night 760)", () => {
    expect(() => computeStayPrice("2026-08-01", "2026-08-30", "bungalow", "normal")).toThrow(StayPricingError);
    expect(computeStayPrice("2026-08-01", "2026-09-01", "bungalow", "normal").total).toBe(23760);
  });

  it("bungalow fighter: 30 nights = 25500, extra night 850", () => {
    expect(computeStayPrice("2026-08-01", "2026-08-31", "bungalow", "fighter").total).toBe(25500);
    expect(computeStayPrice("2026-08-01", "2026-09-01", "bungalow", "fighter").total).toBe(26350);
  });
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `npm run test -- src/lib/booking/stay.test.ts`
Expected: FAIL (23600 au lieu de 23760 ; 26170 au lieu de 26350)

- [ ] **Step 3: Corriger les tarifs**

Dans `src/content/stay-pricing.ts` :

Bungalow normal : remplacer

```ts
  {
    unit: "bungalow",
    plan: "normal",
    // Extra-night rate is a provisional default pending client confirmation;
    // adjust here without any code change.
    label: "Private Bungalow",
    minNights: 30,
    tiers: [{ nights: 30, basePrice: 23000, extraNightRate: 600 }],
```

par

```ts
  {
    unit: "bungalow",
    plan: "normal",
    label: "Private Bungalow",
    minNights: 30,
    tiers: [{ nights: 30, basePrice: 23000, extraNightRate: 760 }],
```

Bungalow fighter : remplacer

```ts
    tiers: [{ nights: 30, basePrice: 25500, extraNightRate: 670 }],
```

par

```ts
    tiers: [{ nights: 30, basePrice: 25500, extraNightRate: 850 }],
```

(Le tier room fighter `{ nights: 30, basePrice: 20000, extraNightRate: 670 }` ne change PAS : vérifier qu'on modifie bien la carte `unit: "bungalow"`.)

- [ ] **Step 4: Vérifier que les tests passent**

Run: `npm run test -- src/lib/booking/stay.test.ts`
Expected: PASS (toute la suite du fichier)

- [ ] **Step 5: Corriger la copie en dur du programme Fighter**

`src/app/programs/fighter/page.tsx` ligne ~303, remplacer :

```tsx
                <strong className="text-on-surface">Fighter + Private Bungalow:</strong> 25,500 THB for 30 nights, then 670 THB per extra night (electricity separate). Premium tier with king bed, kitchenette, and private terrace. Only 1 bungalow on-site.
```

par :

```tsx
                <strong className="text-on-surface">Fighter + Private Bungalow:</strong> 25,500 THB for 30 nights, then 850 THB per extra night (electricity separate). Premium tier with king bed, kitchenette, and private terrace. Only 1 bungalow on-site.
```

La ligne 300 (Fighter + Standard Room, 670 THB) ne change PAS.

- [ ] **Step 6: Corriger `public/llms-full.txt` (4 occurrences bungalow)**

- Ligne 29 : `Fighter + Private Bungalow: 25,500 THB for 30 nights plus 670 THB per extra night` → `plus 850 THB per extra night`
- Ligne 34 : `Private bungalow: 23,000 THB per month plus 600 THB per extra night` → `plus 760 THB per extra night`
- Ligne 81 : `| Fighter + Private Bungalow (30 nights) | 25,500 THB + 670 THB per extra night (electricity separate) |` → `+ 850 THB`
- Ligne 89 : `| Private bungalow, 1 month (minimum) | 23,000 THB + 600 THB per extra night (electricity separate) |` → `+ 760 THB`

La ligne 88 (`Standard room, 1 month | 18,000 THB + 600 THB per extra day`) ne change PAS.

Vérification : `rg -n "extra night|extra day" public/llms-full.txt` ne doit plus montrer 600/670 associé au bungalow.

- [ ] **Step 7: Commit**

```bash
git add src/content/stay-pricing.ts src/lib/booking/stay.test.ts src/app/programs/fighter/page.tsx public/llms-full.txt
git commit -m "fix(stay): nuits supplémentaires bungalow à 760/850 THB (correction cliente V2)"
```

---

### Task 3: Standard Room, « double bed » devient king-size

**Files:**
- Modify: `src/app/accommodation/page.tsx:99,119,217,563`

**Interfaces:**
- Consumes: rien.
- Produces: copie uniquement, aucun changement d'API. L'icône `BedDouble` (lucide) reste.

- [ ] **Step 1: Remplacer les 4 occurrences**

Ligne 99 (alt photo) :

```tsx
  { src: "/images/room/room-bed.jpeg", caption: "Bed", alt: "King-size bed in standard room" },
```

Ligne 119 (label amenity, court ; la précision vit dans le paragraphe) :

```tsx
  { icon: BedDouble, label: "King-size bed" },
```

Ligne 217 (paragraphe rooms), remplacer la phrase par :

```tsx
                The rooms are inside the Plai Laem camp. Clean, simple, everything you need after training and nothing you don&apos;t. Each room has a king-size bed (it cannot be split into two single beds), a private bathroom, air conditioning, and a balcony over the shared pool.
```

Ligne 563 (passage GEO), remplacer `Standard rooms include a double bed,` par :

```tsx
Standard rooms include a king-size bed (not splittable into two singles),
```

- [ ] **Step 2: Vérifier qu'il ne reste aucun « double bed »**

Run: `rg -ni "double bed" src public`
Expected: aucun résultat.

- [ ] **Step 3: Commit**

```bash
git add src/app/accommodation/page.tsx
git commit -m "fix(accommodation): lit king-size non séparable dans la copie des chambres (correction cliente V2)"
```

---

### Task 4: Politiques non-remboursable + électricité

**Files:**
- Modify: `src/content/policies.ts` (2 constantes ajoutées à la fin)
- Modify: `src/app/terms/page.tsx` (import + sections "Cancellations" et "Accommodation")
- Modify: `src/app/pricing/page.tsx:15` (import), `:555-558` (intro Camp Stay), `:822-828` (fin What's Included)
- Modify: `src/app/accommodation/page.tsx` (import + `:427-429`)

**Interfaces:**
- Consumes: pattern existant d'affichage des constantes de `policies.ts` (ex. `DTV_POLICY_REFUSAL` déjà importé dans `pricing/page.tsx:15`).
- Produces: `PURCHASE_NO_REFUND_POLICY: string` et `ELECTRICITY_BILLING_NOTE: string` exportées de `src/content/policies.ts`.

- [ ] **Step 1: Ajouter les constantes (texte cliente VERBATIM, ne pas humanizer)**

À la fin de `src/content/policies.ts` :

```ts
export const PURCHASE_NO_REFUND_POLICY =
  "Memberships, packages and purchased classes are non-refundable and non-exchangeable.";

export const ELECTRICITY_BILLING_NOTE =
  "Electricity fees are billed separately and typically range from 500 THB to 3,000 THB per month, depending on usage.";
```

- [ ] **Step 2: Afficher sur /terms**

Dans `src/app/terms/page.tsx`, ajouter l'import (après les imports existants, ligne ~5) :

```tsx
import {
  PURCHASE_NO_REFUND_POLICY,
  ELECTRICITY_BILLING_NOTE,
} from "@/content/policies";
```

Section "Cancellations, changes, and refunds" (ligne ~80) : insérer AVANT le paragraphe "Plans change, we get it." un nouveau paragraphe d'ouverture, et ajouter `className="mt-3"` au paragraphe existant :

```tsx
              <p>
                <strong className="text-on-surface">
                  {PURCHASE_NO_REFUND_POLICY}
                </strong>
              </p>
              <p className="mt-3">
                Plans change, we get it. Once a booking is paid, we do{" "}
```

NE PAS supprimer ni modifier le paragraphe voucher existant (politique voucher plus généreuse, compatible : le voucher n'est pas un remboursement). Cette coexistence est listée dans les confirmations cliente (Task 5).

Section "Accommodation" : après le paragraphe "Rooms include water and Wi-Fi. The bungalow is metered for electricity, billed at 8 THB per unit..." (ligne ~161-167), insérer :

```tsx
              <p className="mt-3">{ELECTRICITY_BILLING_NOTE}</p>
```

- [ ] **Step 3: Afficher sur /pricing**

Ligne 15, étendre l'import existant :

```tsx
import {
  DTV_POLICY_REFUSAL,
  PURCHASE_NO_REFUND_POLICY,
  ELECTRICITY_BILLING_NOTE,
} from "@/content/policies";
```

Intro de la section Camp Stay (lignes 555-558), remplacer :

```tsx
          <p className="text-center text-on-surface-variant text-sm mb-10 max-w-2xl mx-auto">
            Training and on-site accommodation at our Plai Laem camp. Rooms and bungalows available.
            Electricity is included for stays under 1 month. Pick your own check-in and check-out dates.
          </p>
```

par :

```tsx
          <p className="text-center text-on-surface-variant text-sm mb-10 max-w-2xl mx-auto">
            Training and on-site accommodation at our Plai Laem camp. Rooms and bungalows available.
            Electricity is included for stays under 1 month. Pick your own check-in and check-out dates.{" "}
            {ELECTRICITY_BILLING_NOTE}
          </p>
```

Fin de la section "What's Included" : après le `<p>` "Looking for accommodation near the camps?" (lignes 822-828), insérer :

```tsx
          <p className="text-center mt-4 text-on-surface-variant text-xs">
            {PURCHASE_NO_REFUND_POLICY}
          </p>
```

- [ ] **Step 4: Afficher sur /accommodation**

Ajouter l'import (après `import { getRateCard } from "@/content/stay-pricing";`, ligne 29) :

```tsx
import { ELECTRICITY_BILLING_NOTE } from "@/content/policies";
```

Paragraphe sous les cartes Camp Stay (lignes 427-429), remplacer :

```tsx
          <p className="text-center text-on-surface-variant text-sm mt-8 max-w-2xl mx-auto">
            Pick your own check-in and check-out dates. Your price is the base rate for your stay length plus any extra nights. Rooms start at 7 nights, the bungalow at 1 month.
          </p>
```

par :

```tsx
          <p className="text-center text-on-surface-variant text-sm mt-8 max-w-2xl mx-auto">
            Pick your own check-in and check-out dates. Your price is the base rate for your stay length plus any extra nights. Rooms start at 7 nights, the bungalow at 1 month.{" "}
            {ELECTRICITY_BILLING_NOTE}
          </p>
```

- [ ] **Step 5: Vérifier le rendu**

Run: `npm run lint`
Expected: 0 erreur.

Run: `rg -n "PURCHASE_NO_REFUND_POLICY|ELECTRICITY_BILLING_NOTE" src`
Expected: définitions dans `policies.ts` + usages dans `terms/page.tsx`, `pricing/page.tsx` (2 usages), `accommodation/page.tsx`.

- [ ] **Step 6: Commit**

```bash
git add src/content/policies.ts src/app/terms/page.tsx src/app/pricing/page.tsx src/app/accommodation/page.tsx
git commit -m "feat(policies): non-remboursable + fourchette électricité affichés sur terms, pricing et accommodation (correction cliente V2)"
```

---

### Task 5: Vérification globale, humanizer, documentation

**Files:**
- Modify: `PROJECT-STATUS.md` (entrée d'historique + confirmations cliente)
- Possibly modify: fichiers de copie des Tasks 1-4 si le humanizer relève quelque chose

**Interfaces:**
- Consumes: tout le travail des Tasks 1-4.
- Produces: working tree vert (lint, test, build), docs à jour.

- [ ] **Step 1: Passer /humanizer sur la copie modifiée**

Invoquer le skill `/humanizer` sur les textes visibles modifiés : descriptions de `pricing.ts` (item groupe), phrases modifiées de `accommodation/page.tsx`, `pricing/page.tsx`, `programs/fighter/page.tsx`, `programs/private/page.tsx`. EXCLUS : les 2 constantes de `policies.ts` (verbatim cliente). Appliquer les retouches éventuelles.

- [ ] **Step 2: Suite de vérification complète**

Run: `npm run test`
Expected: PASS, 0 échec.

Run: `npm run lint`
Expected: 0 erreur.

Run: `npm run build`
Expected: build OK, 0 erreur.

- [ ] **Step 3: Mettre à jour PROJECT-STATUS.md**

Ajouter une entrée d'historique datée 2026-07-16 : « Corrections cliente V2 : groupe privé adulte 700 THB/personne (per-person billing), extra nights bungalow 760/850 THB, king-size bed copy, politiques non-refundable + électricité 500-3 000 THB/mois (policies.ts, affichées terms/pricing/accommodation). »

Ajouter aux points en attente / confirmations cliente :
- « Confirmer avec la cliente la coexistence : nouvelle mention "non-refundable and non-exchangeable" vs politique voucher existante des terms (voucher 12 mois conservé). »
- « Archiver les anciens prices Stripe (1 400 THB groupe + restes brief juillet) après le deploy. »

- [ ] **Step 4: Commit docs**

```bash
git add PROJECT-STATUS.md docs/superpowers/specs/2026-07-16-corrections-cliente-v2-design.md docs/superpowers/plans/2026-07-16-corrections-cliente-v2.md docs/brief-correction-cliente-V2.md
git commit -m "docs: corrections cliente V2 (spec, plan, statut)"
```

---

### Task 6: Stripe (TEST puis LIVE) et livraison prod — GATE Rd

**Files:**
- Modify: `src/content/pricing.ts` (champs `stripePriceIdTest` puis `stripePriceIdLive`, réécrits PAR LE SCRIPT)

**Interfaces:**
- Consumes: `npm run stripe:seed` (`scripts/stripe-seed-products.ts`) : lit `STRIPE_SECRET_KEY` depuis `.env.local`, détecte TEST/LIVE via le préfixe de clé ; sa passe de sync crée un nouveau Price sur le Product existant quand le prix catalogue diffère, met à jour `default_price`, et réécrit l'ID dans `pricing.ts`. Il n'archive PAS l'ancien price (voulu : un checkout en vol peut encore le référencer).
- Produces: nouveau price 700 THB en TEST et en LIVE, `pricing.ts` à jour, prod déployée.

⚠️ Piège connu (mémoire projet) : les CLIs locales `stripe` et `vercel` pointent sur des comptes tiers (wyron / roadtofightapp). Toujours passer par la clé du projet dans `.env.local` (le script fait ça) ; ne jamais utiliser la config des CLIs.

- [ ] **Step 1: Seed TEST**

Vérifier que `.env.local` contient la clé TEST du projet (`sk_test_...`), puis :

Run: `npm run stripe:seed`
Expected: sortie `~ private-adult-group: 140000 -> 70000 satang (new price)` et diff git sur `src/content/pricing.ts` limité au champ `stripePriceIdTest` de cet item. Aucun autre item modifié.

- [ ] **Step 2: Vérifier le checkout en TEST (manuel, dev server)**

Run: `npm run dev`, ouvrir `/booking/private`, choisir Private Group, 3 participants.
Expected: total affiché 2 100 THB, note "Price per person." ; la session Stripe Checkout affiche 3 x 700 THB.

- [ ] **Step 3: Commit de l'ID TEST**

```bash
git add src/content/pricing.ts
git commit -m "chore(stripe): price TEST 700 THB groupe privé après seed"
```

- [ ] **Step 4: ⚠️ GO Rd — Seed LIVE**

Attendre le GO explicite de Rd. Mettre temporairement la clé LIVE du projet dans `.env.local` (`sk_live_...`, jamais commitée), puis :

Run: `npm run stripe:seed`
Expected: même sortie en mode LIVE ; diff limité à `stripePriceIdLive` de `private-adult-group`. Remettre la clé TEST dans `.env.local` ensuite.

```bash
git add src/content/pricing.ts
git commit -m "chore(stripe): price LIVE 700 THB groupe privé après seed"
```

- [ ] **Step 5: ⚠️ GO Rd — Push + deploy**

```bash
git push origin main
```

Expected: deploy Vercel automatique (~60 s). Vérifier le dashboard Vercel (compte `ratchawat.website@gmail.com`).

- [ ] **Step 6: Smoke test prod**

Sur https://ratchawatmuaythai.com :
- `/pricing` : groupe privé 700 THB, note per person ; bungalow +760 / fighter bungalow +850 THB per extra night ; note non-refundable en fin de What's Included.
- `/accommodation` : king-size bed, note électricité.
- `/terms` : les 2 nouvelles mentions.
- `/booking/private` : Private Group 3 participants → 2 100 THB à l'écran ET sur la page Stripe Checkout (ne pas payer).
- `/booking/camp-stay` : bungalow 31+ nuits → extra night à 760 THB dans le récap.

- [ ] **Step 7: Archiver les anciens prices Stripe (après deploy uniquement)**

Dans le dashboard Stripe (compte du projet), archiver le price 1 400 THB (`private-adult-group`) en TEST et en LIVE + les anciens prix restants du brief juillet (hygiène connue). Aucune modification de code.

- [ ] **Step 8: Inventaire prod vs local**

Donner spontanément à Rd l'inventaire final : ce qui a touché la prod (deploy Vercel, prices Stripe LIVE créés/archivés) vs ce qui est resté local (rien attendu). Rappeler les confirmations cliente en attente (voucher vs non-exchangeable).
