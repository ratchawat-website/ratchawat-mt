
# AUDIT TECHNIQUE & PLAN DE REFONTE

## Ratchawat Muay Thai

**Plai Laem & Bo Phut -- Koh Samui**

**Site actuel :** https://ratchawatmuaythai.com/
**Domaine cible :** ratchawatmuaythai.com (migration en fin de projet)
**Date d'audit :** Avril 2026

---

## 1. Informations business

| Champ | Valeur |
|-------|--------|
| **Nom** | Chor Ratchawat Muay Thai Gym |
| **Description** | Camp d'entrainement Muay Thai a Ko Samui proposant des cours collectifs, prives. Hebergement disponible et programme pour les combattants |
| **Type de site** | Booking (reservation + paiement en ligne) |
| **Public cible** | International (touristes, passionnes de Muay Thai) |
| **Langues** | Anglais (principal) + Francais + Espagnol |
| **Telephone** | +66 63 080 2876 |
| **Email** | chor.ratchawat@gmail.com |
| **Horaires** | 8h00 - 20h00, 6j/7 |
| **Reputation** | 9.3/10 sur MuayThaiMap (131 avis Google) |

### Localisations

| | Bo Phut | Plai Laem |
|--|---------|-----------|
| **Adresse** | Soi Sunday, Tambon Bo Put, Ko Samui District, Surat Thani 84320 | 20, 33 Village No. 5, Plai Laem Soi 13, Tambon Bo Put, Amphoe Ko Samui, Surat Thani 84320 |
| **Caractere** | Petit gym, ambiance "street" et familiale | Plus grand, plus complet, section bodyweight |
| **Coordonnees** | 9.5553391, 100.0344246 | A confirmer |

### Tarifs actuels (trouves sur sites tiers, absents du site)

- Drop-in : 500 THB (~15 USD)
- Mensuel : 5 500 THB (~167 USD)

### Equipe / Entraineurs

| Nom | Role |
|-----|------|
| **Kroo Wat** | Entraineur principal |
| **Mam** | Instructeur |
| **Kong** | Instructeur |
| **Teacher Nangja** | Instructeur / Combattant |

### Programmes proposes

1. Cours collectifs adultes
2. Cours collectifs enfants
3. Cours prives (1-on-1)
4. Programme combattant (Train to Fight)
5. Package 1 semaine intensif

### Services complementaires

- Hebergement (partenariat US Hostel / US Samui a Bo Phut)
- Boutique equipement
- Support visa DTV (180 jours)
- Support visa Muay Thai 90 jours
- Solutions de transport
- Conseils assurance sante

### Reseaux sociaux

- Facebook : facebook.com/Chor.RatchawatMuayThaiGym
- Instagram : @chor.ratchawatmuaythai
- TikTok : @chor.ratchawat

---

## 2. Diagnostic technique du site actuel

### Stack actuelle

| Composant | Technologie |
|-----------|-------------|
| CMS | WordPress |
| Theme | Gym Training Coach + Elementor |
| SEO Plugin | Rank Math SEO (+ residus Yoast) |
| E-commerce | WooCommerce |
| Analytics | Google Analytics (G-SVH7KPWM2S) via MonsterInsights |
| Formulaires | Jetpack Contact Forms + Creative Mail |
| Menu | WPRMenu |
| Cache | W3 Total Cache |
| Hebergement | Bluehost / Newfold Digital |
| Traduction | GTranslate (traduction auto) |
| Plugins totaux | 23 detectes |

### Metriques de performance

| Metrique | Valeur actuelle | Norme |
|----------|----------------|-------|
| Poids HTML | 473 KB | 50-80 KB |
| Scripts charges | 181 blocs JS | 5-10 |
| Plugins WordPress | 23 | 0 (site sur mesure) |
| Videos auto-play | 6 MP4 non optimisees | 0 sans lazy-loading |
| Images homepage | 37 chargees d'un coup | Lazy-loading progressif |
| Animations CSS | 69+ references | Minimal |
| References Elementor | 402 injectees | 0 |
| Balises H1 | 2 (doublon) | 1 seule |
| Score SEO estime | ~3/10 | >9/10 |
| Score performance estime | ~2/10 | >9/10 |

---

## 3. Dettes techniques identifiees

### CRITIQUES

| # | Probleme | Detail | Impact |
|---|----------|--------|--------|
| 1 | **Contenu invisible aux crawlers** | Le contenu est rendu en JavaScript. Les moteurs de recherche et les crawlers ne voient que du HTML vide. | SEO catastrophique, pages non indexees |
| 2 | **HTML 473 KB** | 6x le poids normal. CSS inline massif (~200 KB). | Temps de chargement excessif, visiteurs partent |
| 3 | **181 blocs JavaScript** | Chaque script bloque le rendu. Le navigateur doit tout executer avant d'afficher quoi que ce soit. | Page blanche pendant 6-10+ secondes |
| 4 | **23 plugins WordPress** | Dont AI Copilot (inutile), Popup Builder (intrusif), WP Recipe Maker (non pertinent), Creative Mail (non configure). | Surface d'attaque securite, bloat, maintenance |
| 5 | **402 references Elementor** | Le page builder injecte massivement du code dans chaque page. | Performance catastrophique |
| 6 | **6 videos MP4 auto-play** | Hebergees localement, sans compression ni lazy-loading. | Bande passante saturee sur mobile 4G thailandaise |
| 7 | **0 reservation en ligne** | Tout passe par WhatsApp. Barriere a la conversion. | Perte de clients directs |
| 8 | **0 paiement integre** | Cash uniquement a l'arrivee. | Pas de revenue tracking, pas de pre-booking |
| 9 | **SEO ~3/10** | Meta-descriptions generiques et repetitives ("Muay Thai Ko Samui:..."), pas de schema pour cours/prix/horaires, pas de strategie mots-cles. | Invisible sur Google |
| 10 | **Pas de prix affiches** | Drop-in 500 THB et mensuel 5 500 THB uniquement sur sites tiers. La page /pricing/ ne rend rien. | Visiteurs frustrers, partent chercher l'info ailleurs |
| 11 | **Pas de contact visible** | Ni telephone, ni email, ni adresse sur le site. Uniquement sur annuaires externes. | Perte de confiance, impossibilite de contacter |
| 12 | **Texte placeholder visible** | "Add a strong one liner supporting the heading above..." visible sur plusieurs pages. | Image non professionnelle |

### ALERTES

| # | Probleme | Detail | Impact |
|---|----------|--------|--------|
| 13 | **Navigation confuse** | Bo Phut et Plai Laem melanges partout. 2 pages schedule, 2 pages accommodation, 4 pages visa separees. | Visiteur perdu, ne trouve pas son camp |
| 14 | **69+ animations CSS** | WOW.js + animations excessives. Surcharge visuelle. | Distraction, lenteur sur mobile |
| 15 | **Popups intrusifs** | Popup Builder interrompt la navigation. | UX degradee |
| 16 | **GTranslate** | Traduction automatique de mauvaise qualite. Google penalise les traductions auto. | SEO penalise, image non pro |
| 17 | **Images non optimisees** | PNG, 960x960 (format social media), featured 200x200 (trop petit), pas de WebP/AVIF. | Lenteur, mauvais rendu |
| 18 | **Planning en images** | Horaires publies comme images ("CLICK TO ENLARGE PICTURE"). | Non indexable, non accessible, non mobile |
| 19 | **URL avec typo** | `/accomodation/` au lieu de `/accommodation/`. | URL non professionnelle |
| 20 | **URL avec emojis** | Article "kick off 2025" contient des emojis dans l'URL. | Probleme SEO et partage |
| 21 | **Plugins SEO conflictuels** | Residus Rank Math ET Yoast detectes. | Doublons meta, confusion |
| 22 | **Mobile non optimise** | Popups + videos auto-play + animations lourdes sur mobile. | 53% des visiteurs partent si chargement > 3s |
| 23 | **Horaires incoherents** | Schema dit 9h-17h, MuayThaiMap dit 8h-20h. Confirme : 8h-20h. | Confusion clients |

---

## 4. Impact business

| Indicateur | Situation actuelle |
|------------|-------------------|
| Reservations en ligne | 0% possibles |
| Revenus generes via le site | 0 EUR |
| Taux de rebond estime | Eleve (site lent, pas de CTA) |
| Questions repetitives WhatsApp | Plusieurs par jour (info dispo nulle part) |
| Positionnement Google "muay thai koh samui" | Faible (contenu invisible aux crawlers) |

---

## 5. Solution proposee -- Refonte complete

### Stack technique

| Composant | Technologie | Avantage |
|-----------|-------------|----------|
| Frontend | **Next.js 16 + React 19** | SSR/SSG natif = SEO parfait, ultra rapide, 0 plugin |
| Styling | **Tailwind CSS v4** | Utility-first, leger, responsive natif |
| Langage | **TypeScript 5** | Type safety, maintenabilite |
| Base de donnees | **Supabase** | Auth + DB + API temps reel |
| Paiement | **Stripe** | Leader mondial, securise, Checkout Sessions |
| Emails | **Resend** | Emails transactionnels (confirmation booking) |
| Hebergement | **Vercel** | CDN mondial, HTTPS auto, zero maintenance |
| Traduction | **next-intl** | i18n professionnelle integree (EN/FR/ES) |
| SEO | **Infrastructure sur mesure** | Meta, Schema.org, sitemap, llms.txt, GEO |

### Avant / Apres

| Critere | Site actuel (WordPress) | Nouveau site (Next.js) |
|---------|------------------------|----------------------|
| Temps de chargement | 6-10+ secondes | < 1.5 secondes |
| Poids HTML | 473 KB | ~50 KB |
| Plugins / dependances | 23 plugins | 0 plugin, code sur mesure |
| Score SEO | ~3/10 | >9/10 |
| Score performance | ~2/10 | >9/10 |
| Reservation en ligne | Aucune | Booking + paiement Stripe |
| Traduction | GTranslate (auto) | Traduction pro integree (EN/FR/ES) |
| Cout hebergement | 10-30 EUR/mois | Gratuit (Vercel free tier) |
| Maintenance | MAJ WordPress/plugins constantes | Zero maintenance technique |
| Securite | 23 plugins = 23 failles potentielles | Aucune surface d'attaque |

---

## 6. Architecture des pages

### Pages du nouveau site (20 pages + blog)

#### Pages communes (marque Ratchawat)

| # | Route | Titre | Contenu | Migration |
|---|-------|-------|---------|-----------|
| 1 | `/` | Homepage | Presentation marque, selecteur camp, avantages cles, CTA booking | Refonte totale de `/` |
| 2 | `/about` | A propos | Histoire, valeurs, mission du camp | Migration de `/about-us/` |
| 3 | `/pricing` | Tarifs | Grille de prix unifiee : drop-in, packages, mensuel, fighter | Refonte de `/pricing/` |
| 4 | `/programs` | Programmes | Vue d'ensemble de tous les programmes de training | Nouveau (fusionne `/training/`) |
| 5 | `/programs/group-adults` | Cours collectifs adultes | Description, horaires, niveau, ce qu'on apprend | Migration de `/group-lessons-adults/` |
| 6 | `/programs/group-kids` | Cours collectifs enfants | Programme kids, ages, securite | Migration de `/group-lessons-kids/` |
| 7 | `/programs/private` | Cours prives | 1-on-1, personnalisation, booking direct | Migration de `/private-lessons/` |
| 8 | `/programs/fighter` | Programme combattant | Training intensif, conditions, preparation combat | Migration de `/train-to-fight/` |
| 9 | `/booking` | Reservation | Systeme de booking en ligne + paiement Stripe | **NOUVEAU** |
| 10 | `/contact` | Contact | Formulaire, carte Google Maps, tel, email, WhatsApp, LINE | **NOUVEAU** |

#### Pages par localisation

| # | Route | Titre | Contenu | Migration |
|---|-------|-------|---------|-----------|
| 11 | `/camps/bo-phut` | Camp Bo Phut | Presentation, equipements, horaires integres, galerie | Migration de `/bo-phut/` + `/schedule-bo-phut/` |
| 12 | `/camps/plai-laem` | Camp Plai Laem | Presentation, equipements, horaires integres, galerie | Migration de `/plai-laem/` + `/schedule-plai-laem/` |

#### Pages services

| # | Route | Titre | Contenu | Migration |
|---|-------|-------|---------|-----------|
| 13 | `/accommodation` | Hebergement | Options 2 camps, partenaires, photos, prix | Fusion de `/accomodation/` + `/accomodation-plai-laem/` |
| 14 | `/services` | Services | Transport + assurance sante + gear | Fusion de `/services/` + `/transportation-solutions/` + `/health-insurance/` |
| 15 | `/visa/dtv` | Visa DTV | Info complete + formulaire integre | Fusion de `/dtv-visa-thailand-apply-now/` + `/destination-thailand-visa-dtv-form/` |
| 16 | `/visa/90-days` | Visa 90 jours | Info complete + formulaire integre | Fusion de `/90-days-muay-thai-visa-apply-now/` + `/90-days-muay-thai-visa-form/` |

#### Pages nouvelles

| # | Route | Titre | Contenu | Justification |
|---|-------|-------|---------|--------------|
| 17 | `/team` | Notre equipe | Profils entraineurs avec photo, bio, specialite | Kroo Wat, Mam, Kong, Nangja meritent des profils |
| 18 | `/gallery` | Galerie | Photos et videos du camp, training, ambiance | Actuellement eparpille, besoin d'un hub visuel |
| 19 | `/faq` | FAQ | Questions frequentes structurees | Reduit la charge WhatsApp, bon pour SEO |
| 20 | `/reviews` | Temoignages | Showcase des avis Google (9.3/10, 131 avis) | Reputation excellente non exploitee |

#### Blog (phase ulterieure)

| # | Route | Titre | Statut |
|---|-------|-------|--------|
| 21 | `/blog` | News & articles | A creer plus tard |
| -- | `/blog/[slug]` | Articles individuels | 11 articles a migrer (voir liste ci-dessous) |

**Articles a migrer ulterieurement :**
1. `/new-muay-thai-camp-koh-samui/` - Ouverture Plai Laem
2. `/join-us-in-thailand-dtv-visa.../` - DTV + packages
3. `/new-winner-congratulations-georgie/` - Victoire Georgie
4. `/new-accomodation-koh-samui/` - Nouvel hebergement
5. `/camp-updates-endurance-circuit/` - Circuit endurance
6. `/camp-updates-two-new-classes/` - Nouvelles classes
7. `/1-week-intensive-muay-thai.../` - Package 1 semaine
8. `/congratulations-dani.../` - Victoire Dani
9. `/prepare-for-kroo-wats-return.../` - Retour Kroo Wat
10. `/celebrating-the-recent-wins.../` - Victoires kids
11. `/celebrating-the-recent-victory.../` - Victoire Nangja

**Pages supprimees (pas de migration) :**
- `/gear/` - Boutique WooCommerce, complexite e-commerce non justifiee
- `/blognews/` - Doublon avec /camp-news/
- `/category/news/` - Categorie inutile avec nouvelle architecture
- `/lets-kick-off-2025-together/` - URL avec emoji, contenu perime

### Redirections 301 necessaires

Toutes les anciennes URLs doivent rediriger vers les nouvelles pour preserver le SEO :

| Ancienne URL | Nouvelle URL |
|-------------|-------------|
| `/about-us/` | `/about` |
| `/bo-phut/` | `/camps/bo-phut` |
| `/plai-laem/` | `/camps/plai-laem` |
| `/group-lessons-adults/` | `/programs/group-adults` |
| `/group-lessons-kids/` | `/programs/group-kids` |
| `/private-lessons/` | `/programs/private` |
| `/train-to-fight/` | `/programs/fighter` |
| `/schedule-bo-phut/` | `/camps/bo-phut#schedule` |
| `/schedule-plai-laem/` | `/camps/plai-laem#schedule` |
| `/accomodation/` | `/accommodation` |
| `/accomodation-plai-laem/` | `/accommodation` |
| `/training/` | `/programs` |
| `/services/` | `/services` |
| `/transportation-solutions/` | `/services#transport` |
| `/health-insurance/` | `/services#insurance` |
| `/dtv-visa-thailand-apply-now/` | `/visa/dtv` |
| `/destination-thailand-visa-dtv-form/` | `/visa/dtv#apply` |
| `/90-days-muay-thai-visa-apply-now/` | `/visa/90-days` |
| `/90-days-muay-thai-visa-form/` | `/visa/90-days#apply` |
| `/camp-news/` | `/blog` |

---

## 7. Design et direction visuelle

| Parametre | Valeur |
|-----------|--------|
| **Direction** | Bold / Modern |
| **Design System** | A nommer |
| **Couleur primaire** | #ff6600 (Deep Orange) |
| **Couleur accent** | #f5f5f5 (Blanc casse) |
| **Police titres** | Outfit |
| **Police corps** | Plus Jakarta Sans |
| **Effets glass** | Non |
| **Dark mode** | Oui, par defaut |
| **Coins (border-radius)** | card 0.5rem, btn 0.5rem, banner 0.75rem |
| **Ombres** | Faibles ou nulles (flat design) |

### Palette derivee de #ff6600

| Token | Couleur |
|-------|---------|
| `primary` | #ff6600 |
| `primary-dim` | #e85d00 |
| `primary-deep` | #b34700 |
| `primary-container` | #ffd4a8 |
| `primary-container-low` | #ffe4c7 |
| `on-primary` | #f0f9ff |
| `on-surface` | #2a1a0d |
| `on-surface-variant` | #5c4433 |
| `surface` | #1a1a1a (dark mode) |
| `surface-low` | #121212 (dark mode) |
| `outline` | #7a6a5a |

---

## 8. Composants UI a developper

### Composants standards (inclus dans le scaffold)

1. **HeroSection** - Hero plein ecran avec CTA
2. **GlassCard** - Carte (sans effet glass, style bold)
3. **CTABanner** - Banniere d'appel a l'action
4. **FAQAccordion** - FAQ avec ouverture/fermeture
5. **ImagePlaceholder** - Placeholder images avant contenu reel
6. **Navigation** - Nav responsive avec burger mobile
7. **Footer** - Pied de page avec liens, contact, reseaux
8. **Breadcrumbs** - Fil d'ariane

### Composants specifiques au projet

9. **ScheduleTable** - Planning HTML interactif par localisation (remplace les images)
10. **TrainerCard** - Profil entraineur avec photo, bio, specialite
11. **TestimonialCarousel** - Carrousel des avis Google
12. **LocationCard** - Carte localisation avec Google Maps embed
13. **PricingTable** - Tableau de prix par formule (drop-in, packages, mensuel)
14. **BookingWidget** - Formulaire de reservation avec selection cours + Stripe
15. **LanguageSwitcher** - Selecteur de langue EN/FR/ES
16. **ProgramCard** - Carte programme avec description, niveau, duree

---

## 9. Integrations techniques

### Supabase (Auth + Database)

- **Auth** : Inscription/connexion clients pour reservations
- **Tables** : bookings, schedules, trainers, programs, testimonials, faq
- **Row Level Security** : Clients voient uniquement leurs propres reservations

### Stripe (Paiements)

- **Checkout Sessions** : Paiement securise pour reservations de cours
- **Products** : Drop-in, packages, abonnements mensuel
- **Webhooks** : Confirmation automatique apres paiement

### Resend (Emails)

- **Confirmation de reservation** : Email automatique apres booking
- **Formulaire de contact** : Notification a chor.ratchawat@gmail.com
- **Rappel de cours** : Email la veille (phase ulterieure)

---

## 10. Infrastructure SEO/GEO

### SEO technique

- Meta titles et descriptions uniques par page
- Schema.org : LocalBusiness (2 localisations), Course, Event, FAQPage, BreadcrumbList, Review/AggregateRating
- Sitemap XML dynamique
- robots.txt optimise (acces AI bots pour GEO)
- Redirections 301 de toutes les anciennes URLs
- Images optimisees WebP/AVIF, lazy-loading, alt text descriptifs
- Core Web Vitals > 90/100

### GEO (Generative Engine Optimization)

- llms.txt + llms-full.txt pour les AI crawlers
- Passages citables structures dans chaque page
- Donnees factuelles claires (prix, horaires, adresses) facilement extractibles par les IA
- Schema.org riche pour apparaitre dans les reponses AI

### Mots-cles strategiques

- "muay thai koh samui" / "muay thai ko samui"
- "muay thai camp koh samui"
- "muay thai training thailand"
- "muay thai plai laem" / "muay thai bo phut"
- "private muay thai lessons koh samui"
- "dtv visa muay thai thailand"
- "muay thai camp with accommodation"
- "kids muay thai koh samui"
- "fighter training camp thailand"

---

## 11. Estimation budgetaire (a mettre a jour par l'autre agent)

### Option A -- Site complet avec Booking + Stripe

| Poste | Detail | Estimation |
|-------|--------|------------|
| Design / UX | Maquettes, charte graphique, responsive design | A estimer |
| Frontend (20 pages) | Next.js 16 + Tailwind CSS v4, dark mode, animations legeres | A estimer |
| Backend / CMS | Supabase : auth, horaires, prix, FAQ, trainers, bookings | A estimer |
| Booking + Stripe | Reservation cours + paiement en ligne + webhooks | A estimer |
| Emails (Resend) | Confirmation booking, contact, notifications | A estimer |
| Contenu + SEO/GEO | Redaction, metas, schema.org, sitemap, llms.txt, GEO passages | A estimer |
| Trilingue EN/FR/ES | next-intl, traduction professionnelle 3 langues | A estimer |
| Deploiement | Vercel + configuration domaine + redirections 301 | A estimer |
| Camp Bo Phut | Pages dediees, trainers, horaires, contenu trilingue | A estimer |
| **TOTAL OPTION A** | **Site complet 2 camps, 20 pages, cle en main** | **A estimer** |

### Option B -- Site vitrine sans Booking (phase 1)

| Poste | Detail | Estimation |
|-------|--------|------------|
| Phase 1 | Site vitrine 2 camps (20 pages + SEO/GEO + trilingue) sans booking | A estimer |
| Phase 2 | Ajout booking + Stripe + Resend | A estimer |
| **TOTAL OPTION B** | **Projet 2 camps en deux phases** | **A estimer** |

---

## 12. Planning previsionnel

| Semaine | Etape | Livrable |
|---------|-------|----------|
| S1 | Design & maquettes | Maquettes validees + charte graphique |
| S2-S3 | Developpement frontend | 20 pages fonctionnelles en staging |
| S3 | Backend + integrations | Supabase + Stripe + Resend |
| S4 | Contenu + SEO/GEO | Contenu trilingue + optimisation complete |
| S4 | Booking + paiement | Systeme de reservation operationnel |
| S5 | Tests + mise en ligne | Site en production, formation client, redirections 301 |

---

## 13. Differences par rapport a l'audit original (.docx)

| Point | Audit .docx original | Mise a jour |
|-------|---------------------|-------------|
| Stack | Next.js 14 | **Next.js 16 + React 19** |
| Langues | EN/FR (2 langues) | **EN/FR/ES (3 langues)** |
| Nombre de pages | 8 pages | **20 pages** (architecture detaillee) |
| Hebergement | "Pas de section accommodation dediee" | **Faux** -- 2 pages existent, fusionnees en 1 |
| Composants | Non detailles | **16 composants UI specifiques** |
| Blog | Non mentionne | **11 articles a migrer (phase ulterieure)** |
| Redirections 301 | Mentionnees vaguement | **Table complete de 20 redirections** |
| Schema.org | "1 seul bloc generique" | **7 types de schemas planifies** |
| GEO | Non mentionne | **Infrastructure GEO complete (llms.txt, passages citables)** |
| Mots-cles | Non listes | **9 mots-cles strategiques identifies** |
