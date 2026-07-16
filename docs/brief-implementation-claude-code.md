# BRIEF D'IMPLEMENTATION - Modifications Ratchawat Muay Thai

**Site:** ratchawatmuaythai.com
**Contexte:** Site livre en avril 2026 (Next.js + Supabase + Stripe + Resend). Ce document liste les modifications demandees par la cliente en juillet 2026, avec les clarifications du developpeur. A utiliser comme contexte pour construire le plan d'implementation.

---

## 0. Clarification du processus de mise en place du brief/plan d'implémentation

1. Claude doit lire le document "brief-implementation-claude-code.md" en entier.
2. Claude doit approuver la mise en place du brief via un audit exaustif du projet actuel et remonter les alertes et points de vigilance.
3. Claude doit mettre en place le brief.
4. Le plan d'implémentation doit etre exécuté sur une branche feat-* -> jamais mergé sans approval, jusqu'à la fin.
5. Claude doit prendre les bonnes décisions concernant la méthode utilisée, les outils à utiliser, et les techniques à utiliser, tout en respectant le projet actuel.
6. Si Claude n'est pas sur d'une chose, il doit demander à la cliente avant de continuer.
7. Le brief mélange simple modifications et specifications techniques (système de réservation, chambres, etc. vs contenu simple à mettre à jour). Claude doit faire la difference entre les deux et agir en consequence.
Exemple: Dans la section "Cours prives", il y a 3 points. Le premier et le troisieme sont des mises a jour de contenu. Le deuxieme est une specification technique. Claude doit les traiter separerment. Comment le plan sera exécuté? Plusieurs plan/agents? Par ou commencer?

**Important** 
1. Tout ce qui est en lien avec le systeme de reservation et la gestions clients/cours doit aussi etre modifier dans le dashboard admin (le plus important!).
2. Le site est en live, avec des clients réel, des reservations deja payées, etc. Claude doit donc etre tres prudent et tester ses modifications.
3. Claude doit prendre en consideration les demandes de la cliente, mais aussi et surtout le projet actuel et sa coherence globale. Claude doit etre force de proposition et proposer les meilleures solutions possibles en fonction de son audit du projet.
4. Les agents assignés doivent être les plus compétents, ils devronts tester chaque fonctionnalité mise en place, en local puis supprimer leurs testes pour ne laisser que le code final et propre et fonctionnel.

## 1. Cours prives - Tarifs (mise a jour de contenu)

Mettre a jour la grille tarifaire :
- 1-1 adulte, 1 seance : 1'000 THB
- 1-1 adulte, forfait 10 seances : 9'000 THB
- 2-1 (deux personnes, un coach), 1 seance : 1'400 THB

**Type de tache:** Mise a jour de donnees (CMS/DB), pas de logique.

---

## 2. Systeme de reservation

### 2.1 Champ "nombre de participants"

A ajouter dans le formulaire de reservation des cours prives.

**Logique de prix (confirmee par le developpeur, prix du groupe a reconfirmer avec la cliente) :**

| Type de cours | Selection participants | Comportement du prix |
|----------------|------------------------|----------------------|
| 1-1 (one-to-one) | 1 a 6 personnes | Le prix se multiplie par le nombre de participants (prix unitaire x N) |
| 2-3-1 (groupe avec un coach) | Uniquement 2 ou 3 (pas 1, pas 4-6) | Le prix reste fixe au tarif groupe, ne varie pas selon 2 ou 3 (a confirmer avec la cliente avant developpement final) |

**Note technique:** Le selecteur de participants doit avoir des bornes differentes selon le type de cours choisi (1-6 pour 1-1, uniquement 2-3 pour le format groupe). Prevoir une validation cote formulaire pour empecher une selection hors bornes.

### 2.2 Bug de capacite (6 personnes par creneau)

**Bug signale:** Impossible de reserver 4 a 5 personnes sur un creneau ou 1 personne est deja inscrite, alors que la capacite maximale du creneau est de 6.

**Cause probable a investiguer:** Logique de verification de capacite disponible qui bloque de maniere incorrecte des reservations multi-personnes quand le creneau n'est pas vide. A tester specifiquement : reserver 1 personne sur un creneau, puis tenter d'ajouter 4-5 personnes supplementaires sur ce meme creneau.

**Statut:** Bug couvert par la garantie du projet initial, correction gratuite pour le client.

### 2.3 Reservation multi-creneaux

Permettre au client de selectionner et reserver plusieurs creneaux horaires en une seule transaction/reservation.

**Confirme:** Le paiement se fait en une seule fois pour l'ensemble des creneaux selectionnes dans la meme session (pas de paiements separes par creneau).

### 2.4 Ajout de creneaux horaires

Le systeme compte actuellement 8 creneaux. La cliente demande la liste complete suivante (19 creneaux au total, donc 11 nouveaux a ajouter) :

```
7:00 - 7:30 - 8:00 - 8:30 - 9:00 - 10:30 - 11:00 - 11:30 - 12:00 -
12:30 - 13:00 - 13:30 - 14:00 - 14:30 - 15:00 - 15:30 - 16:00 - 18:30 - 19:00
```

**Note technique:** Identifier lors du developpement lesquels des 19 creneaux existent deja parmi les 8 actuels, et n'ajouter que les creneaux manquants.

### 2.5 Textes a ajouter sur la page de reservation cours prives

Ajouter ce texte (en anglais, tel quel) :

> "Private lesson bookings are non-refundable and cannot be rescheduled if cancelled less than 24 hours before the scheduled session."

### 2.6 Correction de l'affichage de l'encadre "creneau non disponible"

**Bug actuel:** Le message suivant ne s'affiche que sur le jour present dans le calendrier, alors qu'il devrait s'afficher sur tous les jours :

> "If your preferred time slot is not available, please leave us a message."

**Cause:** Erreur de developpement initiale (bug attribue au developpeur).

**Statut:** Correction gratuite, couverte par la garantie.

---

## 3. Camp Plai Laem - Presentation

Dans la presentation/héro principale de la page du camp Plai Laem, ajouter un texte precisant que **ce camp specifique** propose :
- L'hebergement (accommodation)
- Une section bodyweight
- Un espace ice bath

**Contexte:** Cette clarification vise a reduire la confusion des visiteurs entre les deux camps (Plai Laem et Bo Phut), qui n'ont pas les memes equipements/services.

**Type de tache:** Ajout de contenu textuel sur la page du camp Plai Laem.

---

## 4. Chambres (Rooms) et Bungalow

### 4.1 Mention "Standard Room" (contenu uniquement)

**IMPORTANT - clarification cle:** La cliente veut simplement ajouter la mention "Standard Room" a cote des titres "1 Week" et "2 Weeks" sur les cartes existantes de la page `/accommodation`.

**Type de tache:** Ajout de texte, aucune logique metier a developper.

### 4.2 Systeme de reservation flexible (tarifs par palier : court sejour et longue duree)

**Perimetre etendu:** Cette logique doit s'appliquer aux DEUX types d'hebergement : Room ET Bungalow (le deuxieme type d'accommodation du site).

**Grille tarifaire confirmee (Room uniquement pour le moment) :**

| Duree du sejour | Tarif de base | Tarif jour supplementaire | Notes |
|------------------|---------------|----------------------------|-------|
| 1 a 3 semaines | 8'000 THB pour 1 semaine (minimum) | 1'140 THB/jour au-dela de la semaine de base | Electricite incluse |
| 1 mois minimum, formule Normal | 18'000 THB pour le mois | 600 THB/jour au-dela du mois | Electricite NON incluse (mention texte uniquement). Training normal 2x/jour deja inclus dans le systeme existant (mention texte uniquement, aucune logique a developper) |
| 1 mois minimum, Fighter Program | 20'000 THB pour le mois | 670 THB/jour au-dela du mois | Electricite NON incluse (mention texte uniquement) |

**Frontiere confirmee:** Le palier long demarre exactement a 1 mois, aucune zone grise a gerer entre 3 semaines et 1 mois.

**Mecanisme sous-jacent (inchange) :** Le client choisit librement une date de check-in et une date de check-out. Le systeme determine automatiquement le palier applicable (court sejour vs long sejour) selon la duree totale, puis calcule le prix selon le tarif de base + les jours supplementaires eventuels au tarif correspondant.

**Points a developper/optimiser :**
1. Interface de selection de dates (check-in libre, check-out libre)
2. Logique de calcul : si duree < 1 mois -> 1'140 THB/jour (minimum 7 jours = 8'000 THB) ; si duree >= 1 mois -> tarif de base selon la formule choisie + (jours au-dela du mois x tarif jour supplementaire de la formule)
3. Mentions textuelles informatives (aucune logique de calcul associee) : electricite non incluse sur les formules longue duree, training normal inclus 2x/jour sur la formule Normal
4. Appliquer cette meme architecture technique (date picker + calcul par palier) aux deux types d'hebergement (Room et Bungalow), en prevoyant que les tarifs Bungalow seront peut etre ajustés ulterieurement sans development supplementaire (simple configuration de donnees)

**A noter:** Cette logique de réservation doit aussi s'appliquer au dashboard admin.

### 4.3 Texte de politique a ajouter

> "Room reservations are non-refundable and non-exchangeable."

A afficher sur les pages de reservation Room ET Bungalow.

---

## 5. Visa DTV

### 5.1 Mise a jour des tarifs packages

- 2-3x/semaine : 20'000 THB
- 4-5x/semaine : 25'000 THB
- Illimite : 35'000 THB (Fighter Program non inclus)

### 5.2 Ajout du champ "date de naissance"

A ajouter dans le formulaire de demande DTV visa.

### 5.3 Ajout d'un encadre informatif

> "Need a 9-month or 12-month training plan? Or a personalized program including private lessons or any other special request? Please contact us via WhatsApp."

### 5.4 Remplacement du texte de politique de remboursement DTV

**IMPORTANT:** Remplacer le texte existant par le texte suivant, en anglais, exactement comme fourni par la cliente (ne pas traduire) :

> "Documents are delivered within 24 hours of receiving your payment (on business days).
>
> If your DTV visa application is refused, you may request a 50% refund within a maximum of 3 weeks after payment, provided you submit official proof of the visa refusal. The remaining 50% will be issued as a training voucher of the same value, valid for use at our gym."

**Question encore ouverte (a faire confirmer par la cliente avant implementation finale) :** Le delai de 3 semaines court-il a partir de la date de paiement du client, ou a partir de la date de soumission du dossier aupres de l'administration ? Le texte fourni dit "within a maximum of 3 weeks after payment", ce qui suggere que c'est bien a partir du paiement, mais a reconfirmer pour eviter toute ambiguite en cas de litige.

---

## 6. Points encore ouverts (a clarifier avant de considerer le scope comme fige)

1. **Prix du cours groupe (2-3-1):** Le developpeur suppose que le prix reste fixe peu importe 2 ou 3 participants. A faire confirmer explicitement par la cliente.
2. **Delai de remboursement DTV:** Confirmer que les "3 weeks" partent de la date de paiement (semble deja clair dans le texte fourni, mais a verifier).

Tous les autres points listes dans le message original de la cliente ont ete clarifies par le developpeur et peuvent etre consideres comme fige pour le developpement.

---

## 7. Recapitulatif des taches par type

| Type | Taches concernees |
|------|--------------------|
| **Contenu/donnees uniquement** | Prix cours prives, texte Plai Laem, mention Standard Room, prix packages DTV, textes de policy (private lesson, room, DTV refund), encadre WhatsApp DTV |
| **Bug fix (gratuit)** | Capacite 6 personnes par creneau, affichage encadre "creneau non disponible" sur tous les jours |
| **Ajout de champ simple** | Date de naissance (formulaire DTV) |
| **Ajout de creneaux** | 11 nouveaux creneaux horaires |
| **Fonctionnalite moyenne** | Champ nombre de participants avec logique de prix conditionnelle, reservation multi-creneaux en une transaction |
| **Fonctionnalite lourde** | Systeme de reservation flexible par paliers (court sejour et longue duree, formules Normal/Fighter) applique a Room ET Bungalow |
