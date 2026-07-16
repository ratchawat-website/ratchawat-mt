# Corrections cliente V2 — Design

**Date :** 2026-07-16
**Source :** `docs/brief-correction-cliente-V2.md` (retours cliente du 16/07/2026, suite au ship du brief juillet)
**Contexte :** site LIVE (https://ratchawatmuaythai.com), Stripe en mode LIVE, booking v2 en prod depuis le 2026-07-14. Batch de 4 corrections de contenu/tarifs, pas de nouvelle architecture, pas de migration DB.

## Correction 1 — Groupe privé adulte : 700 THB par personne

**Constat.** L'item `private-adult-group` (`src/content/pricing.ts`) est à `price: 1400, billing: "flat"` : un prix par session, que 2 ou 3 personnes participent. La cliente corrige : 700 THB **par personne** (2 pers. = 1 400 THB, 3 pers. = 2 100 THB).

**Changement.**
- `src/content/pricing.ts`, item `private-adult-group` :
  - `price: 1400` → `price: 700`
  - supprimer `billing: "flat"` (le défaut du moteur = per-person, comme `private-kids-group`)
  - `unit: "session"` → `unit: "person/session"`
  - réécrire `description`, `includes`, `notes` : prix par personne, minimum 2, maximum 3 participants (plus de « One price per session »)
- `public/llms-full.txt` : « Private group 2-3 adults (60 min) | 1,400 THB per session » → « 700 THB per person ».

**Pas de changement de code.** `computeBookingAmount`, `getStripeQuantity` (`src/lib/booking/pricing.ts`), le checkout (`src/app/api/checkout/route.ts`) et le `PrivateWizard` lisent `billing` et s'adaptent : montant = 700 × participants, quantité Stripe = participants. `getCapacityUnits` reste 1 entraîneur (pas de `capacity: "per-participant"`).

**Stripe.** Le price LIVE actuel (`price_1TszRmRu1Uc6NzUvlxJBnJPS`, 1 400 THB) ne correspond plus. Procédure établie (brief juillet) :
1. `scripts/stripe-seed-products.ts` en TEST : la passe de sync crée un nouveau Price 700 THB sur le Product existant et réécrit `stripePriceIdTest` dans `pricing.ts`.
2. Même script en LIVE après validation : réécrit `stripePriceIdLive`.
3. Archiver l'ancien price 1 400 APRÈS le deploy (le script ne le désactive pas volontairement, un checkout en vol peut encore le référencer).
4. ⚠️ Piège connu : la CLI `stripe` locale pointe sur le compte wyron. Le script doit recevoir la clé du projet via variable d'environnement, jamais la config CLI par défaut.

**Hors scope.** `private-kids-group` reste à 400 THB/enfant (déjà per-person ; validé en brainstorming).

## Correction 2 — Nuits supplémentaires : bungalow

**Constat.** Tarifs cliente vs `src/content/stay-pricing.ts` :

| Formule | Base (OK) | Extra night actuel | Extra night correct |
|---|---|---|---|
| Standard Room + normal (30 n) | 18 000 | 600 | 600 ✅ |
| Standard Room + Fighter | 20 000 | 670 | 670 ✅ |
| Bungalow + normal | 23 000 | 600 | **760** ❌ |
| Bungalow + Fighter | 25 500 | 670 | **850** ❌ |

Seuls les deux bungalows sont faux. Le commentaire du fichier signalait déjà le tarif bungalow comme « provisional default pending client confirmation ».

**Changement.**
- `src/content/stay-pricing.ts` : bungalow normal `extraNightRate: 600` → `760` ; bungalow fighter `670` → `850` ; supprimer le commentaire « provisional ».
- `src/app/programs/fighter/page.tsx` (~ligne 303) : copie en dur « then 670 THB per extra night » pour le bungalow fighter → 850. La ligne Standard Room (670) ne change pas.
- `public/llms-full.txt` : toutes les occurrences bungalow (4 lignes : fighter 670 → 850 ×2, normal 600 → 760 ×2). La ligne « Standard room, 1 month … 600 THB » ne change pas.
- `src/lib/booking/stay.test.ts` : mettre à jour les attentes bungalow.

**Pas de Stripe.** Les stays sont facturés via `price_data` calculé côté serveur : éditer le fichier + redéployer suffit (documenté en tête de `stay-pricing.ts`). Les pages `/pricing`, `/accommodation` et les wizards lisent `STAY_RATE_CARDS`, rien d'autre à toucher.

**Hors scope.** Paliers chambre 7/14 nuits (8 000 / 15 000, extra 1 140) : non mentionnés par la cliente, inchangés.

## Correction 3 — « Double bed » → king-size

**Changement.** 4 occurrences, toutes dans `src/app/accommodation/page.tsx` (aucune autre dans le repo, `llms*.txt` inclus) :
- ~ligne 217 (paragraphe rooms) et ~ligne 563 (passage GEO) : « a double bed » → « a king-size bed (cannot be split into two single beds) »
- ~ligne 119 (label feature) : « Double bed » → « King-size bed » (label court ; la précision vit dans le paragraphe ; l'icône `BedDouble` reste)
- ~ligne 99 (alt image) : « Double bed in standard room » → « King-size bed in standard room »

## Correction 4 — Politiques : non-remboursable + électricité

**Changement.** Deux constantes dans `src/content/policies.ts` (anglais, fidèles au texte cliente, même statut verbatim que les existantes) :

```ts
export const PURCHASE_NO_REFUND_POLICY =
  "Memberships, packages and purchased classes are non-refundable and non-exchangeable.";

export const ELECTRICITY_BILLING_NOTE =
  "Electricity fees are billed separately and typically range from 500 THB to 3,000 THB per month, depending on usage.";
```

**Affichage (choix validé : terms + pages de vente, pas d'emails).**
- `/terms` : `PURCHASE_NO_REFUND_POLICY` dans la section paiements/annulation ; `ELECTRICITY_BILLING_NOTE` dans la section Accommodation, en complément du « 8 THB per unit » existant (les deux infos sont compatibles : taux unitaire + fourchette mensuelle typique).
- `/pricing` : mention non-refundable près des sections d'achat + note électricité dans la section camp stays (là où « Electricity charged separately » apparaît).
- `/accommodation` : note électricité dans la section tarifs.
- Les libellés d'intégration exacts (phrase d'accroche autour de la constante, position dans la page) se décident à l'implémentation en réutilisant les patterns existants ; les textes des constantes, eux, sont figés ci-dessus.

## Vérification et livraison

1. `npm run lint` (0 erreur), `npm run build` (0 erreur), tests `stay.test.ts` à jour et verts.
2. Seed Stripe TEST → checkout groupe test à 3 personnes = 2 100 THB.
3. Commit (avec `PROJECT-STATUS.md` mis à jour) → push → seed Stripe LIVE → deploy Vercel → smoke prod.
4. Archiver l'ancien price LIVE 1 400 THB après le deploy (+ reste du brief juillet : anciens prix live à archiver, cosmétique).
5. Fin d'exécution : inventaire spontané « ce qui a touché la prod vs resté local ».

**Textes visibles :** toute nouvelle copie passe par `/humanizer` avant commit, SAUF les deux constantes de politique (verbatim cliente, règle du fichier `policies.ts`).

## Hors scope global

- Kids group (400 THB/enfant, inchangé)
- Paliers chambre 7/14 nuits
- Traductions FR/ES
- Refonte des politiques existantes (`PRIVATE_CANCELLATION_POLICY`, etc.)
