# Spec : Brief cliente juillet 2026 (bugs, contenu, booking privé v2, accommodation par paliers)

> Source : `docs/brief-implementation-claude-code.md` (demandes cliente + clarifications développeur).
> Design validé par Rd le 2026-07-10 (session brainstorming, section par section).
> Prochaine étape : plan d'implémentation via superpowers:writing-plans.

## 1. Contexte

Site live en production (https://ratchawatmuaythai.com) avec vrais clients, réservations payées, Stripe LIVE. Toute modification doit être additive, testée en local (Stripe test mode) et validée par Rd avant merge. Le dashboard admin doit refléter chaque changement du système de réservation (exigence prioritaire du brief).

Exécution en deux vagues, chacune sur sa branche `feat-*`, jamais mergée sans approval explicite de Rd :

- **Vague 1** `feat/fixes-and-content-july` : bugs sous garantie + bugs latents + toutes les mises à jour contenu/tarifs/textes. Rapide, faible risque, livrable en premier.
- **Vague 2** `feat/booking-v2-july` : réservation privée v2 (participants, capacité coachs, 19 créneaux, multi-créneaux) puis accommodation par paliers. Chantiers lourds, plan détaillé, tests systématiques.

## 2. Décisions validées (Rd, 2026-07-10)

| Sujet | Décision |
|-------|----------|
| Sémantique de la capacité 6 par camp/créneau | 6 coachs. Une résa 1-1 avec N participants consomme N unités ; une résa groupe (2-3 pers, 1 coach) consomme 1 unité. |
| Chevauchement des créneaux 30 min | Créneaux indépendants, chacun avec son compteur de 6. Le chevauchement des sessions d'1h n'est PAS contrôlé (choix cliente : 19 créneaux, capacité 6 par créneau). Limite assumée, documentée. L'admin peut fermer des créneaux manuellement si le planning coince. |
| Multi-créneaux | Multi-jours autorisé. Même type de session et même nombre de participants pour tout le panier. Un seul paiement Stripe du total. |
| Forfait 10 séances (9 000 THB) | Achetable en ligne via le wizard privé : paiement + réservation du 1er créneau. Les 9 séances restantes se planifient avec le camp (aucun suivi de solde en ligne). |
| Carte « 2 Weeks » 15 000 THB | 15 000 reste le prix exact de 14 nuits : la grille est structurée en paliers (7 n = 8 000, 14 n = 15 000, 30 n = mensuel), pas en formule unique. |
| Bungalow au lancement | Mois minimum uniquement (Normal 23 000 / Fighter 25 500). Palier court séjour activable plus tard par simple config. Tarif nuit supplémentaire : à confirmer cliente, défauts 600/670 en config. |
| Cours privés kids | Même mécanique que les adultes (sélecteur participants, groupe à prix fixe), tarifs actuels inchangés (solo 600 THB/enfant). Prix fixe du groupe kids à confirmer cliente. |
| Horaires publiés | Cliente a validé les nouveaux horaires : les surfaces publiées (pages camps, FAQ, schémas SEO `openingHours`, llms.txt) passent à une fermeture 20:00 (dernière session privée 19:00-20:00). |

## 3. Vague 1 : bugs + contenu

### 3.1 Bugs sous garantie (gratuits)

**B1 : contrôle de capacité admin cassé** (brief 2.2)
`src/app/api/admin/bookings/route.ts:71-88` refuse toute création dès qu'une ligne `private-slot` existe sur (date, créneau), sans filtre camp, via `.maybeSingle()` qui échoue silencieusement à 2+ lignes. Fix : même logique que le checkout public (`src/app/api/checkout/route.ts:104-127`) : compter les blocks `private-slot` filtrés par (date, time_slot, camp), refuser à >= `PRIVATE_SLOT_CAPACITY` (6). En vague 2 ce comptage passera en somme d'unités (voir 4.2) ; le fix vague 1 prépare le terrain en centralisant le comptage dans un helper partagé public/admin.

**B2 : encadré « créneau non disponible » visible uniquement le jour même** (brief 2.6)
`PrivateWizard.tsx:295-320` : l'encadré WhatsApp est conditionné à `anyCutoffBlocked` (un créneau du jour sous le délai minimum), donc n'apparaît que le jour courant. Fix : l'encadré devient permanent sous le sélecteur de créneaux, tous les jours, avec le texte cliente exact :
> "If your preferred time slot is not available, please leave us a message."
Le lien WhatsApp pré-rempli existant est conservé.

### 3.2 Bugs latents découverts (inclus, gratuits)

**B3 : blocage fantôme après paiement abandonné.** `src/app/api/webhooks/stripe/route.ts:204-222` : `checkout.session.expired` annule le booking pending mais ne supprime PAS la ligne `availability_blocks` type `private-slot` créée au checkout (reason = `Booking <uuid>`). Le créneau reste consommé pour rien. Fix : le handler `expired` supprime aussi le(s) block(s) lié(s) au booking.

**B4 : race condition sur la 6e place.** Entre le comptage de capacité et l'insertion du block, rien n'est transactionnel : deux checkouts simultanés peuvent tous deux passer. Fix léger (pattern insert-then-verify) : insérer le block, recompter, si dépassement supprimer le block et répondre 409. Suffisant au volume actuel, sans exposer de transaction SQL.

### 3.3 Tarifs cours privés adultes (brief 1)

Nouveaux tarifs dans `src/content/pricing.ts` (+ nouveaux prix Stripe test + live via `npm run stripe:seed`, anciens prices archivés) :

| Item | Avant | Après |
|------|-------|-------|
| `private-adult-solo` (1-1, 60 min) | 800 THB | 1 000 THB |
| `private-adult-10pack` (NOUVEAU, 10 séances 1-1) | n'existe pas | 9 000 THB |
| `private-adult-group` (2-3 pers, 1 coach) | 600 THB/pers | 1 400 THB fixe par session (montant pour 3 pers à confirmer cliente ; défaut : fixe quel que soit 2 ou 3) |

Le passage du groupe adulte à un prix fixe change la facturation : chaque item privé porte désormais un mode `billing: 'per-person' | 'flat'` dans `pricing.ts`. Adulte groupe = `flat` (Stripe quantity = 1, dès la vague 1, petit ajustement dans `/api/checkout`) ; adulte solo = `per-person` (quantity = N). Kids inchangés : solo 600 `per-person`, groupe 400/enfant qui RESTE `per-person` tant que la cliente n'a pas confirmé un prix fixe kids (bascule = simple config, voir §7).

Surfaces à mettre à jour (prix en dur aujourd'hui) : `src/app/pricing/page.tsx` (JSX l.334-390 + `offerCatalogSchema` + meta description), `src/app/programs/private/page.tsx` (bloc pricing, `courseSchema`, passage GEO, CTA), `llms.txt`, `llms-full.txt`, `/terms` si les montants y figurent. En vague 1, ces surfaces passent à une lecture depuis `pricing.ts` (fin de la duplication affichage/SEO/Stripe).

Note vente du forfait 10 : dans le wizard privé, la sélection du forfait désactive le panier multi-créneaux (vague 2) ; un seul créneau est réservé (la première séance), les 9 autres se planifient avec le camp. Copy à afficher près du forfait pour l'expliquer.

### 3.4 Contenu DTV (brief 5)

- **Tarifs** (`pricing.ts` catégorie dtv + surfaces dupliquées `/visa/dtv`, `/pricing`, llms) : `dtv-6m-2x` 20 000 (inchangé), `dtv-6m-4x` 25 000 (inchangé), `dtv-6m-unlimited` 33 000 -> 35 000 THB + mention « Fighter Program not included ». Nouveau price Stripe live+test pour l'illimité, ancien archivé. Les ids ne changent pas : le CHECK `price_id` de `dtv_applications` reste valide.
- **Champ date de naissance** (brief 5.2) : migration `alter table dtv_applications add column date_of_birth date;` (table existante, grants conservés) + Zod (`src/lib/validation/dtv-application.ts`) + `validate()` client et champ UI (`DtvApplyForm.tsx`, section Personal) + insert (`/api/visa/dtv/apply/route.ts`) + affichage admin (`/admin/dtv-applications/[id]`) + email admin (`DTVAdminNotification.tsx`).
- **Encadré informatif** (brief 5.3), texte exact, sur `/visa/dtv` (zone packages) :
  > "Need a 9-month or 12-month training plan? Or a personalized program including private lessons or any other special request? Please contact us via WhatsApp."
- **Politique de remboursement** (brief 5.4) : REMPLACER le texte actuel (« No refund if the visa is refused, but we offer a training voucher of the same value ») par le texte cliente exact, aux ~6 emplacements recensés : `pricing.ts` (notes l.577/600/624), `visa/dtv/page.tsx` (FAQ + zone packages), `DtvApplyForm.tsx` (checkbox), `pricing/page.tsx`, email `DTVApplicationReceived.tsx`, `/terms` :
  > "Documents are delivered within 24 hours of receiving your payment (on business days).
  > If your DTV visa application is refused, you may request a 50% refund within a maximum of 3 weeks after payment, provided you submit official proof of the visa refusal. The remaining 50% will be issued as a training voucher of the same value, valid for use at our gym."

  Attention : la politique passe de « voucher 100 % » à « 50 % remboursement + 50 % voucher ». `/terms` (clause DTV) doit être aligné.

### 3.5 Contenu camps et accommodation (briefs 3, 4.1, 4.3, 2.5)

- **Plai Laem hero** (`src/app/camps/plai-laem/page.tsx`, section The Gym l.159-218) : paragraphe précisant que CE camp propose l'hébergement, la section bodyweight et l'ice bath (différenciation vs Bo Phut). Passage par /humanizer.
- **Mention « Standard Room »** (`src/app/accommodation/page.tsx`) : ajoutée aux titres des cartes 1 Week et 2 Weeks.
- **Politique Room/Bungalow**, texte exact, sur les pages de réservation Room ET Bungalow (wizard camp-stay + fighter stay tiers, étape review) :
  > "Room reservations are non-refundable and non-exchangeable."
- **Politique cours privés**, texte exact, page de réservation privée (étape review du wizard) :
  > "Private lesson bookings are non-refundable and cannot be rescheduled if cancelled less than 24 hours before the scheduled session."

(La mise à jour des horaires publiés part en vague 2 avec les créneaux, voir §4.3 : publier une fermeture à 20:00 avant que les créneaux du soir soient réservables créerait une incohérence.)

### 3.6 Critères de sortie vague 1

Lint + build 0 erreur ; /humanizer sur toutes les copies modifiées ; E2E local des flux touchés (privé, DTV) avec carte test ; seed Stripe LIVE exécuté AVANT le déploiement du code référençant les nouveaux prices ; PROJECT-STATUS.md + ROADMAP.md à jour ; approval Rd ; merge ; smoke test prod.

## 4. Vague 2, chantier 1 : réservation privée v2

### 4.1 Migrations (additives, tables existantes, grants conservés)

```sql
alter table bookings add column booking_group_id uuid;
create index idx_bookings_group on bookings (booking_group_id) where booking_group_id is not null;
alter table availability_blocks add column units integer not null default 1;
```

Résas existantes : `booking_group_id` null, blocks `units` = 1 : comportement inchangé.

### 4.2 Capacité en unités coachs

- Une résa 1-1 à N participants écrit un block `private-slot` avec `units = N` ; une résa groupe écrit `units = 1`.
- Tous les comptages passent de count(lignes) à sum(units) : checkout public, API admin (helper partagé créé en vague 1), `AvailabilityCalendar` (grisage des créneaux pleins), `AdminDayDrawer` (occupation BP x/6 · PL x/6).
- Créneau réservable si sum(units) existants + units demandés <= 6 (par camp, par créneau, créneaux indépendants).

### 4.3 Les 19 créneaux (brief 2.4)

`PRIVATE_SLOT_TIMES` (`src/content/schedule.ts:34-43`) passe de 8 à 19 valeurs :
`07:00, 07:30, 08:00, 08:30, 09:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 18:30, 19:00`
(11 nouveaux : 07:30, 08:30, 09:00, 10:30, 11:30, 12:30, 13:30, 14:30, 15:30, 18:30, 19:00 ; les 8 actuels sont conservés tels quels.)

- Sessions d'1h, heures de début toutes les 30 min. Chevauchement non contrôlé (décision §2).
- Lead time (`EARLY_MORNING_SLOTS` -> renommage en règle « avant 09:30 ») : 12h pour 07:00, 07:30, 08:00, 08:30, 09:00 ; 2h pour les autres.
- UI sélecteur : groupement par période (Morning 07:00-09:00, Midday 10:30-12:30, Afternoon 13:00-16:00, Evening 18:30-19:00).
- Admin : `AdminDayDrawer` affiche les 19 créneaux (toggles de fermeture par créneau existants, occupation par camp).
- Rien en DB (les créneaux ne sont pas stockés, seuls les blocages/occupations le sont).
- **Horaires publiés** (validé cliente, livré avec les créneaux) : fermeture 18:30 -> 20:00 sur pages camps, `/faq`, `/contact`, schémas `openingHours` (Mo-Sa 07:00-20:00), `llms.txt`, `llms-full.txt`.

### 4.4 Sélecteur de participants (brief 2.1)

- 1-1 (adulte et kids) : 1 à 6 participants. Prix = prix unitaire x N (Stripe : quantity = N).
- Groupe (adulte et kids) : 2 ou 3 uniquement. Prix fixe par session (Stripe : quantity = 1).
- Bornes appliquées dans l'UI (`ContactInfoForm` / étape session) ET dans Zod (`src/lib/validation/booking.ts`, le `.max(3)` actuel saute au profit de bornes par type). Idem côté admin (`admin-booking.ts`, actuellement max 10 incohérent : aligné sur les mêmes bornes).

### 4.5 Multi-créneaux (brief 2.3)

- L'étape date + créneau de `PrivateWizard` devient un panier : ajout de sessions (date, créneau), multi-jours, retrait possible, total affiché en direct.
- Une ligne `bookings` par session, reliées par `booking_group_id`. Une seule session Stripe Checkout : line_items agrégés, metadata `booking_group_id` (+ `booking_id` de la première pour compat), montant = somme.
- `/api/checkout` : valide chaque session du panier (cutoff, capacité en unités) ; si UNE session échoue, tout le checkout est refusé avec un message nommant le créneau en conflit. Insertion des N bookings pending + N blocks (pattern insert-then-verify de B4 appliqué à chaque session).
- Webhook `completed` : confirme toutes les lignes du groupe, un seul email client listant toutes les sessions (template `BookingConfirmed` étendu), email admin idem. `expired` : annule toutes les lignes du groupe + supprime tous les blocks (extension de B3).
- Admin : le détail d'une résa affiche les sessions sœurs du même groupe (liens croisés). L'annulation admin d'une session individuelle reste possible (supprime son block).
- Forfait 10 séances : panier désactivé, un seul créneau.

### 4.6 Hors scope privé v2

Fenêtre glissante de capacité (chevauchement), suivi de solde du forfait 10, paniers mixtes (types de session différents), modification de résa par le client.

## 5. Vague 2, chantier 2 : accommodation par paliers

### 5.1 Grille tarifaire (config typée, nouveau module `src/content/stay-pricing.ts`)

| Unit | Formule | Paliers (nuits = prix THB) | Nuit supp. | Minimum | Notes copy (aucune logique) |
|------|---------|---------------------------|-----------|---------|------------------------------|
| room | normal | 7 = 8 000 ; 14 = 15 000 ; 30 = 18 000 | 1 140 (avant 30 n) ; 600 (après 30 n) | 7 nuits | Électricité incluse < 1 mois, NON incluse au mois. Training normal 2x/j inclus. |
| room | fighter | 30 = 20 000 | 670 | 30 nuits | Électricité non incluse. |
| bungalow | normal | 30 = 23 000 | 600 (défaut, à confirmer cliente) | 30 nuits | Électricité non incluse. |
| bungalow | fighter | 30 = 25 500 | 670 (défaut, à confirmer cliente) | 30 nuits | Électricité non incluse. |

Activer un court séjour bungalow plus tard = ajouter des paliers dans cette config, zéro dev (exigence brief 4.2 point 4).

### 5.2 Calcul : `computeStayPrice(checkIn, checkOut, unit, plan)`

Fonction pure dans `src/lib/booking/stay.ts` :
1. `nights` = écart en nuits (check-out matin libère la nuit, logique hôtelière existante).
2. Si `nights < minNights(unit, plan)` : erreur explicite.
3. Palier = le plus grand palier <= nights. Prix = prix du palier + (nights - nuits du palier) x tarif nuit supp. du segment.
4. Retourne montant + breakdown (base, nuits supp, mentions) pour l'affichage.

Exemples de vérité (repris en tests unitaires) : 6 n room = erreur ; 7 n = 8 000 ; 13 n = 14 840 ; 14 n = 15 000 ; 15 n = 16 140 ; 29 n = 32 100 ; 30 n normal = 18 000 ; 45 n normal = 27 000 ; 30 n fighter room = 20 000 ; 29 n bungalow = erreur ; 31 n bungalow normal = 23 600 (défaut).

Note assumée : anomalie de frontière (29 n = 32 100 > 30 n = 18 000) inhérente à la grille cliente. Le prix live affiché dans le wizard la rend visible ; aucun arbitrage automatique.

### 5.3 UI

- `DatePicker` : variante range (react-day-picker `mode="range"`), check-in ET check-out libres, contrainte minimum de nuits selon unit/plan.
- Grisage des dates : logique d'occupation existante (`getOccupancyMap`, par nuit), inchangée dans son principe : une plage est réservable si aucune nuit n'est à capacité (7 rooms / 1 bungalow).
- Prix live avec breakdown (base + X nuits supp + mentions électricité/training).
- Les deux wizards conservés : `CampStayWizard` (formule normal : room dès 7 nuits, bungalow dès 30) et `FighterWizard` (tiers stay : room/bungalow, 30 nuits min, formule fighter). Les deux consomment `computeStayPrice` et le même endpoint checkout. Le tier **Fighter Only** (9 500 THB/mois, sans hébergement) n'est PAS concerné : il reste un forfait Stripe fixe classique.
- `/accommodation` : les cartes existantes (1 Week / 2 Weeks Standard Room / 1 Month Room / 1 Month Bungalow / Fighter+Room / Fighter+Bungalow) deviennent des illustrations de la grille, lisent la config, mentionnent le tarif nuit supplémentaire. Le CTA mène au wizard.

### 5.4 API + Stripe

- Payload checkout accommodation : `{ unit, plan, check_in, check_out, contact... }` (les anciens price_id de forfait ne pilotent plus la résa). Zod : dates valides, minimum de nuits, unit/plan autorisés.
- Serveur : recalcule via `computeStayPrice` (le client n'envoie JAMAIS de montant), vérifie l'occupation sur la plage (`checkRangeAvailability`), insère le booking (type camp-stay/fighter, `price_id` = identifiant de formule ex. `stay-room-normal`, `price_amount` = montant calculé, vraies dates start/end), crée la session Stripe en `price_data` (currency thb, unit_amount en satang, product_data nommé ex. "Standard Room · 12 nights · Mar 3 - Mar 15", rattaché à un Product pérenne "Accommodation Stay" pour le reporting).
- Webhook : inchangé (completed -> confirmed, expired -> cancelled).
- Suppression du string matching : `getDurationDays`/`getStayDurationDays`/`computeEndDate`/`getInventoryKey` par parsing de price_id (5 fichiers : `inventory.ts`, `CampStayWizard.tsx`, `FighterWizard.tsx`, `CreateBookingForm.tsx`, `admin/bookings/route.ts`) remplacés par les dates réelles + champ `unit` explicite, centralisés dans `src/lib/booking/stay.ts`.
- `getOccupancyMap` : filtre `type IN ('camp-stay','fighter')` conservé (aucun nouveau type introduit).
- Anciens produits Stripe de forfaits (camp-stay-1week, etc.) : archivés, conservés pour l'historique.

### 5.5 Admin

- `CreateBookingForm` (résa manuelle) : pour camp-stay/fighter-stay, champs unit + plan + dates range, prix auto-calculé via `computeStayPrice` avec breakdown affiché, override manuel du montant conservé.
- Calendrier d'occupation admin : inchangé (compte par nuit, dates réelles).
- Détail résa : affiche unit, plan, nuits, breakdown.

### 5.6 Hors scope accommodation

Identité par chambre (assignment room 1-7), inventaire configurable via UI, catégories de chambres, tarifs saisonniers, court séjour bungalow (config prête, valeurs cliente manquantes).

## 6. Tests

- **Introduction de vitest** (première infra de test du projet, décision Rd : « c'est le défaut de ce projet »). Config minimale, scripts `npm run test`.
- **Tests unitaires CONSERVÉS dans le repo** : `computeStayPrice` (matrice §5.2), calcul du prix privé (1-1 x N, groupe fixe, forfait 10, total panier multi-sessions), helper de capacité en unités, règle de cutoff par créneau. Ces tests protègent les futurs changements de grille (argent réel).
- **E2E manuels supprimés après validation** (exigence brief) : chaque flux joué en local avec Stripe test + `stripe listen` (privé simple, privé multi-créneaux, privé groupe, forfait 10, camp-stay court/long, fighter+stay, DTV avec date de naissance, admin création/annulation), données de test purgées de Supabase ensuite.
- Lint + build 0 erreur à chaque vague. Smoke test préversion Vercel avant merge, smoke test prod après.

## 7. Confirmations cliente (non bloquantes, tout est en config)

1. Prix groupe 2-3-1 : 1 400 THB fixe pour 2 ET 3 participants ? (point ouvert brief §6.1)
2. Groupe privé kids : passe aussi en prix fixe par session ? Montant ? (actuellement 400 THB/enfant)
3. DTV : « 3 weeks » à partir du paiement, confirmé ? (point ouvert brief §6.2)
4. Bungalow : tarif nuit supplémentaire Normal et Fighter (défauts 600/670 appliqués en attendant).

## 8. Risques et garde-fous

- **Site live** : migrations additives uniquement, rollback = revert de PR. Aucune donnée existante modifiée.
- **Ordre de déploiement des prix** : seed Stripe LIVE avant déploiement du code (sinon checkout en erreur sur les nouveaux price ids).
- **Duplication des prix** : résorbée en deux temps : vague 1 pour les prix privés + DTV (lecture depuis `pricing.ts`), vague 2 pour l'accommodation (lecture depuis `stay-pricing.ts`). Toute future modification tarifaire = 1 fichier + re-seed.
- **Chevauchement des créneaux** : non contrôlé (décision cliente). Si surbooking opérationnel constaté, évolution possible vers fenêtre glissante sans changement de schéma (les blocks portent déjà date + heure + units).
- **Politique DTV** : le passage de « voucher 100 % » à « 50 % refund + 50 % voucher » modifie un engagement contractuel ; `/terms` aligné dans la même vague pour éviter deux versions contradictoires en ligne.
