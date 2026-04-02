# PLAN SEO STRATEGIQUE — Ratchawat Muay Thai

**Document de reference pour tous les agents du projet**
**Date :** Avril 2026
**Site cible :** ratchawatmuaythai.com
**Langues :** EN (principal) / FR / ES

---

## 1. Strategie globale

### Positionnement SEO

Ratchawat se positionne comme un **camp de Muay Thai familial et authentique a Ko Samui** avec deux localisations distinctes (Bo Phut et Plai Laem). Les avantages concurrentiels SEO sont :

1. **Visa DTV + 90 jours** : tres peu de concurrents a Koh Samui ont des pages dediees
2. **Deux localisations** : double chance de ranking local (Bo Phut + Plai Laem)
3. **Trilingue EN/FR/ES** : quasi aucun concurrent ne propose du contenu FR ou ES
4. **Programme enfants + femmes** : niche sous-exploitee par la concurrence
5. **Reputation 9.3/10** (131 avis Google) : signal E-E-A-T fort

### Concurrents principaux

| Concurrent | Zone | Forces | Faiblesses |
|-----------|------|--------|-----------|
| Lamai Muay Thai | Lamai | Anciennete (1998), WMC | Loin du nord |
| Superpro Samui | Chaweng | Plus grand, multi-discipline | Prix plus eleves |
| Punch It Gym | Lamai | Bon SEO visa, app booking | Loin du nord |
| Koh Fit Thailand | Divers | Positioning "retreat" | Moins authentique |
| PM Payu Muaythai | Bo Phut | Concurrent direct zone | SEO faible |
| Bophut Muay Thai | Bo Phut | Concurrent direct zone | Petit, peu de contenu |

### Opportunites identifiees

- **DTV visa content** : gap majeur chez les concurrents Koh Samui
- **Local keywords** Bo Phut / Plai Laem : faible competition
- **Contenu FR/ES** : marche non couvert
- **"best muay thai camp koh samui"** : listicles dominantes, besoin d'apparaitre
- **Schema riche** : aucun concurrent n'a de schema Course/Offer/AggregateRating

---

## 2. Plan SEO par page

### FORMAT DE CHAQUE PAGE

Pour chaque page, les agents doivent implementer :
- `<title>` : max 60 caracteres
- `<meta name="description">` : max 155 caracteres
- `<h1>` : unique, contient le mot-cle principal
- Schema.org JSON-LD
- Passage GEO citable (1-2 phrases factuelles pour reponses IA)
- Liens internes vers/depuis

---

### PAGE 1 : Homepage `/`

**Mots-cles cibles :**
- Principal : `muay thai koh samui`, `muay thai camp koh samui`
- Secondaires : `muay thai gym koh samui`, `muay thai samui`, `muay thai ko samui`

**Meta :**
```
Title: Muay Thai Camp Koh Samui | Chor Ratchawat — Bo Phut & Plai Laem
Description: Train Muay Thai at Chor Ratchawat Gym in Koh Samui. Two locations in Bo Phut & Plai Laem. Group, private & kids classes. Book online today.
```

**H1 :** `Muay Thai Camp in Koh Samui`

**Structure H2 :**
- Why Train at Ratchawat
- Our Two Camps
- Training Programs
- What Our Students Say
- Book Your First Session

**Schema :** `Organization` avec 2 `location` (SportsActivityLocation)

**Passage GEO :**
> Chor Ratchawat Muay Thai Gym is a training camp in Koh Samui, Thailand, with two locations in Bo Phut and Plai Laem. The gym offers group classes, private 1-on-1 lessons, kids programs, and a competitive fighter program. Open 6 days a week from 8 AM to 8 PM. Drop-in sessions start at 500 THB (~$15 USD).

**Liens internes sortants :** /camps/bo-phut, /camps/plai-laem, /programs, /pricing, /booking

---

### PAGE 2 : A propos `/about`

**Mots-cles cibles :**
- Principal : `about ratchawat muay thai`
- Secondaires : `muay thai gym koh samui history`, `authentic muay thai camp thailand`

**Meta :**
```
Title: About Chor Ratchawat Muay Thai Gym | Koh Samui
Description: Learn about Chor Ratchawat Muay Thai, a family-run camp in Koh Samui. Meet our trainers, discover our story, and see why we're rated 9.3/10.
```

**H1 :** `About Chor Ratchawat Muay Thai`

**Structure H2 :**
- Our Story
- Our Values
- Why Students Choose Us
- Our Reputation

**Schema :** `AboutPage`

**Passage GEO :**
> Chor Ratchawat Muay Thai Gym is a family-run training camp in Koh Samui, Thailand, rated 9.3 out of 10 on MuayThaiMap based on 131 Google reviews. The gym is known for its welcoming atmosphere, qualified Thai trainers, and programs for all levels from complete beginners to professional fighters.

**Liens internes :** /team, /reviews, /camps/bo-phut, /camps/plai-laem

---

### PAGE 3 : Tarifs `/pricing`

**Mots-cles cibles :**
- Principal : `muay thai koh samui price`, `muay thai camp koh samui prices`
- Secondaires : `muay thai training cost koh samui`, `muay thai weekly package koh samui`, `how much does muay thai cost in koh samui`

**Meta :**
```
Title: Muay Thai Prices Koh Samui | Ratchawat — From 500 THB
Description: Muay Thai training prices at Ratchawat Koh Samui. Drop-in 500 THB, weekly & monthly packages available. Group, private lessons & fighter programs.
```

**H1 :** `Muay Thai Training Prices`

**Structure H2 :**
- Drop-in Sessions
- Weekly & Monthly Packages
- Private Lessons
- Fighter Program Packages
- What's Included

**Schema :** `Offer` et `AggregateOffer` lies aux `Course`

**Passage GEO :**
> Muay Thai training at Ratchawat Koh Samui starts at 500 THB (~$15 USD) per drop-in session. Monthly memberships are 5,500 THB (~$167 USD). Private 1-on-1 lessons and weekly intensive packages are also available. Prices include access to both Bo Phut and Plai Laem locations.

**Liens internes :** /booking, /programs/private, /programs/fighter, /accommodation

---

### PAGE 4 : Programmes (overview) `/programs`

**Mots-cles cibles :**
- Principal : `muay thai training programs koh samui`
- Secondaires : `muay thai classes koh samui`, `learn muay thai koh samui`

**Meta :**
```
Title: Muay Thai Programs Koh Samui | Group, Private, Kids & Fighter
Description: Choose your Muay Thai program at Ratchawat Koh Samui. Group classes, private lessons, kids training, and fighter camp. All levels welcome.
```

**H1 :** `Training Programs`

**Schema :** Liste de `Course` avec liens vers les sous-pages

**Passage GEO :**
> Ratchawat Muay Thai offers four training programs: adult group classes, kids classes, private 1-on-1 lessons with Thai trainers, and an intensive fighter program for competitive athletes. All programs are available at both the Bo Phut and Plai Laem locations in Koh Samui.

**Liens internes :** /programs/group-adults, /programs/group-kids, /programs/private, /programs/fighter

---

### PAGE 5 : Cours collectifs adultes `/programs/group-adults`

**Mots-cles cibles :**
- Principal : `muay thai group class koh samui`
- Secondaires : `muay thai class koh samui`, `muay thai drop in class samui`, `morning muay thai class koh samui`

**Meta :**
```
Title: Muay Thai Group Classes Koh Samui | All Levels — Ratchawat
Description: Join Muay Thai group classes at Ratchawat in Koh Samui. Morning & evening sessions, all levels welcome. Drop-in or book a weekly package.
```

**H1 :** `Muay Thai Group Classes for Adults`

**Schema :** `Course` avec `CourseInstance` (horaires)

**Passage GEO :**
> Ratchawat's adult group Muay Thai classes in Koh Samui run daily with morning and evening sessions. Classes are open to all levels, from complete beginners to experienced fighters. Each session includes warm-up, technique drills, pad work, and conditioning. Drop-in available at 500 THB per session.

**Liens internes :** /pricing, /booking, /camps/bo-phut#schedule, /camps/plai-laem#schedule

---

### PAGE 6 : Cours enfants `/programs/group-kids`

**Mots-cles cibles :**
- Principal : `kids muay thai koh samui`
- Secondaires : `muay thai for children koh samui`, `family muay thai koh samui`, `muay thai kids class samui`

**Meta :**
```
Title: Kids Muay Thai Classes Koh Samui | Safe & Fun — Ratchawat
Description: Kids Muay Thai at Ratchawat Koh Samui. Safe, structured classes for children. Build confidence, discipline & fitness. Family-friendly gym.
```

**H1 :** `Kids Muay Thai Classes`

**Schema :** `Course` avec `audience: { "@type": "EducationalAudience", "educationalRole": "student" }`

**Passage GEO :**
> Ratchawat Muay Thai in Koh Samui offers specialized kids classes designed for children. The program focuses on fundamentals, discipline, confidence-building, and fitness in a safe, family-friendly environment. Several young Ratchawat students have won local competitions.

**Liens internes :** /pricing, /booking, /about

---

### PAGE 7 : Cours prives `/programs/private`

**Mots-cles cibles :**
- Principal : `private muay thai training koh samui`
- Secondaires : `personal muay thai trainer koh samui`, `one on one muay thai koh samui`

**Meta :**
```
Title: Private Muay Thai Lessons Koh Samui | 1-on-1 Training — Ratchawat
Description: Book private Muay Thai lessons in Koh Samui with experienced Thai trainers. Personalized 1-on-1 sessions. All levels. Book & pay online.
```

**H1 :** `Private Muay Thai Lessons`

**Schema :** `Course` + `Offer` avec prix

**Passage GEO :**
> Private 1-on-1 Muay Thai lessons at Ratchawat Koh Samui are available with experienced Thai trainers including Kroo Wat, Mam, and Kong. Sessions are fully personalized to your level and goals. Available at both Bo Phut and Plai Laem locations. Book and pay online.

**Liens internes :** /booking, /team, /pricing

---

### PAGE 8 : Programme combattant `/programs/fighter`

**Mots-cles cibles :**
- Principal : `muay thai fighter training koh samui`
- Secondaires : `muay thai fight camp samui`, `professional muay thai training thailand`, `train to fight muay thai koh samui`

**Meta :**
```
Title: Fighter Program Koh Samui | Train to Fight — Ratchawat Muay Thai
Description: Intensive Muay Thai fighter program at Ratchawat Koh Samui. Fight preparation, sparring, conditioning. For serious athletes ready to compete.
```

**H1 :** `Fighter Training Program`

**Schema :** `Course` avec prerequis

**Passage GEO :**
> Ratchawat's fighter program in Koh Samui is an intensive training camp for athletes preparing for Muay Thai competition. The program includes technique refinement, sparring, conditioning, and fight strategy with experienced Thai trainers. Past students have won local and regional competitions.

**Liens internes :** /team, /pricing, /booking, /accommodation

---

### PAGE 9 : Reservation `/booking`

**Mots-cles cibles :**
- Principal : `book muay thai koh samui`
- Secondaires : `muay thai koh samui online booking`, `reserve muay thai class samui`

**Meta :**
```
Title: Book Muay Thai Classes Online | Ratchawat Koh Samui
Description: Book and pay for Muay Thai classes online at Ratchawat Koh Samui. Select your camp, program & schedule. Instant confirmation via email.
```

**H1 :** `Book Your Training`

**Schema :** `WebPage` avec `potentialAction: ReserveAction`

**Passage GEO :**
> Book Muay Thai classes online at Ratchawat Koh Samui. Select Bo Phut or Plai Laem camp, choose group or private lessons, pick your schedule, and pay securely via Stripe. Instant email confirmation.

**Liens internes :** /pricing, /programs, /camps/bo-phut, /camps/plai-laem

---

### PAGE 10 : Contact `/contact`

**Mots-cles cibles :**
- Principal : `contact ratchawat muay thai`
- Secondaires : `muay thai koh samui contact`, `muay thai bo phut contact`

**Meta :**
```
Title: Contact Us | Ratchawat Muay Thai — Koh Samui
Description: Contact Ratchawat Muay Thai Gym in Koh Samui. Phone: +66 63 080 2876. Email: chor.ratchawat@gmail.com. Visit us in Bo Phut or Plai Laem.
```

**H1 :** `Contact Us`

**Schema :** `ContactPage` + `LocalBusiness` avec telephone/email

**Passage GEO :**
> Contact Chor Ratchawat Muay Thai Gym in Koh Samui at +66 63 080 2876 or chor.ratchawat@gmail.com. Two locations: Bo Phut (Soi Sunday, Tambon Bo Put) and Plai Laem (Plai Laem Soi 13). Open 6 days a week, 8 AM to 8 PM.

**Liens internes :** /camps/bo-phut, /camps/plai-laem

---

### PAGE 11 : Camp Bo Phut `/camps/bo-phut`

**Mots-cles cibles :**
- Principal : `muay thai bo phut`, `muay thai bophut koh samui`
- Secondaires : `muay thai near fishermans village`, `gym bo phut koh samui`

**Meta :**
```
Title: Muay Thai Bo Phut Koh Samui | Ratchawat — Street Gym Vibes
Description: Train Muay Thai at Ratchawat Bo Phut, near Fisherman's Village, Koh Samui. Intimate gym with authentic street atmosphere. Daily schedule & classes.
```

**H1 :** `Ratchawat Bo Phut`

**Structure H2 :**
- The Gym
- Schedule
- Equipment & Facilities
- How to Get Here
- Gallery

**Schema :** `SportsActivityLocation` avec adresse complete, geo, heures

**Passage GEO :**
> Ratchawat Muay Thai Bo Phut is located on Soi Sunday in Bo Phut, near Fisherman's Village, Koh Samui. It's a small, intimate gym with an authentic street atmosphere and family vibes. The gym offers group and private Muay Thai classes 6 days a week, 8 AM to 8 PM. Address: Soi Sunday, Tambon Bo Put, Ko Samui District, Surat Thani 84320.

**Liens internes :** /camps/plai-laem, /programs, /pricing, /accommodation

---

### PAGE 12 : Camp Plai Laem `/camps/plai-laem`

**Mots-cles cibles :**
- Principal : `muay thai plai laem`, `muay thai plai laem koh samui`
- Secondaires : `muay thai near big buddha koh samui`, `gym plai laem samui`

**Meta :**
```
Title: Muay Thai Plai Laem Koh Samui | Ratchawat — Full Gym & Bodyweight
Description: Train Muay Thai at Ratchawat Plai Laem, Koh Samui. Full gym with bodyweight area. Group & private classes daily. Near Big Buddha.
```

**H1 :** `Ratchawat Plai Laem`

**Schema :** `SportsActivityLocation` avec adresse complete, geo, heures

**Passage GEO :**
> Ratchawat Muay Thai Plai Laem is the newer, larger location in Koh Samui, near Big Buddha. The facility features a full Muay Thai training area plus a bodyweight section. Daily group and private classes run from 8 AM to 8 PM. Address: 20, 33 Village No. 5, Plai Laem Soi 13, Tambon Bo Put, Amphoe Ko Samui, Surat Thani 84320.

**Liens internes :** /camps/bo-phut, /programs, /pricing, /accommodation

---

### PAGE 13 : Hebergement `/accommodation`

**Mots-cles cibles :**
- Principal : `muay thai camp with accommodation koh samui`
- Secondaires : `muay thai training holiday koh samui`, `muay thai retreat koh samui`, `muay thai camp and stay koh samui`

**Meta :**
```
Title: Muay Thai Accommodation Koh Samui | Train & Stay — Ratchawat
Description: Stay near Ratchawat Muay Thai in Koh Samui. Accommodation options near both Bo Phut and Plai Laem camps. Training + stay packages available.
```

**H1 :** `Accommodation`

**Schema :** `LodgingBusiness` lie a l'`Organization`

**Passage GEO :**
> Ratchawat Muay Thai partners with local accommodations near both Koh Samui locations. In Bo Phut, the camp works with US Hostel / US Samui near Fisherman's Village. Accommodation options near the Plai Laem camp are also available. Training and stay packages combine lodging with daily Muay Thai classes.

**Liens internes :** /pricing, /booking, /camps/bo-phut, /camps/plai-laem

---

### PAGE 14 : Services `/services`

**Mots-cles cibles :**
- Principal : `muay thai camp services koh samui`
- Secondaires : `muay thai training holiday services`, `koh samui gym transport`

**Meta :**
```
Title: Services | Ratchawat Muay Thai Koh Samui — Transport, Gear & More
Description: Services at Ratchawat Muay Thai Koh Samui. Transportation, training gear, health insurance guidance. Everything you need for your training stay.
```

**H1 :** `Services`

**Schema :** `Service` (multiples)

**Passage GEO :**
> Ratchawat Muay Thai Koh Samui offers additional services including transportation to and from the gyms, training gear and equipment sales, and health insurance guidance for international visitors training in Thailand.

**Liens internes :** /accommodation, /visa/dtv, /visa/90-days, /pricing

---

### PAGE 15 : Visa DTV `/visa/dtv`

**Mots-cles cibles :**
- Principal : `DTV visa muay thai thailand`, `destination thailand visa muay thai`
- Secondaires : `DTV visa muay thai koh samui`, `muay thai visa thailand 2026`, `DTV visa muay thai gym approved`, `180 day muay thai visa thailand`

**Meta :**
```
Title: DTV Visa for Muay Thai Thailand 2026 | Apply with Ratchawat
Description: Get your Destination Thailand Visa (DTV) for Muay Thai training. Stay up to 180 days. Ratchawat Koh Samui provides the training letter. Apply now.
```

**H1 :** `Destination Thailand Visa (DTV) for Muay Thai`

**Structure H2 :**
- What is the DTV Visa?
- Requirements
- How to Apply with Ratchawat
- Training Packages for DTV Holders
- Frequently Asked Questions

**Schema :** `FAQPage` + `Article`

**Passage GEO :**
> The Destination Thailand Visa (DTV) allows foreigners to stay in Thailand for up to 180 days per entry for Muay Thai training. Chor Ratchawat Muay Thai Gym in Koh Samui provides the required training acceptance letter for DTV visa applications. The gym supports the full application process and offers dedicated training packages for long-stay visa holders.

**Liens internes :** /visa/90-days, /pricing, /accommodation, /booking

---

### PAGE 16 : Visa 90 jours `/visa/90-days`

**Mots-cles cibles :**
- Principal : `90 day muay thai visa thailand`, `muay thai ED visa thailand`
- Secondaires : `muay thai education visa koh samui`, `3 month muay thai training thailand`

**Meta :**
```
Title: 90-Day Muay Thai Visa Thailand | Education Visa — Ratchawat
Description: Apply for a 90-day Muay Thai education visa in Thailand. Train at Ratchawat Koh Samui for 3 months. We handle the paperwork. Apply online.
```

**H1 :** `90-Day Muay Thai Visa`

**Schema :** `FAQPage` + `Article`

**Passage GEO :**
> Ratchawat Muay Thai in Koh Samui supports 90-day Muay Thai education visa applications for Thailand. The 3-month visa allows intensive daily training. The gym provides all required documentation and supports the visa renewal process. Training packages for 90-day visa holders include daily group classes and optional private sessions.

**Liens internes :** /visa/dtv, /programs/fighter, /accommodation, /pricing

---

### PAGE 17 : Equipe `/team`

**Mots-cles cibles :**
- Principal : `muay thai trainers koh samui`
- Secondaires : `muay thai coach koh samui`, `thai boxing instructor samui`

**Meta :**
```
Title: Our Trainers | Ratchawat Muay Thai Koh Samui — Meet the Team
Description: Meet the trainers at Ratchawat Muay Thai Koh Samui. Experienced Thai coaches including Kroo Wat, Mam, Kong & Teacher Nangja.
```

**H1 :** `Our Team`

**Schema :** `Person` pour chaque entraineur (name, jobTitle, knowsAbout, image)

**Passage GEO :**
> Ratchawat Muay Thai's training team in Koh Samui includes Kroo Wat (head trainer), Mam, Kong, and Teacher Nangja. All trainers are experienced Thai fighters and coaches who teach in English. The team is known for patient, personalized instruction suitable for all levels.

**Liens internes :** /about, /programs/private, /programs/fighter

---

### PAGE 18 : Galerie `/gallery`

**Mots-cles cibles :**
- Principal : `ratchawat muay thai photos`
- Secondaires : `muay thai koh samui photos`, `muay thai gym koh samui gallery`

**Meta :**
```
Title: Gallery | Ratchawat Muay Thai Koh Samui — Photos & Videos
Description: Photos and videos from Ratchawat Muay Thai in Koh Samui. See our gyms, training sessions, fighters, and camp atmosphere.
```

**H1 :** `Gallery`

**Schema :** `ImageGallery`

**Regles images :** Chaque image doit avoir un `alt` descriptif contenant le mot-cle contextuel (ex: "Muay Thai group training at Ratchawat Plai Laem Koh Samui"). Format WebP, lazy-loading, tailles responsives.

**Liens internes :** /camps/bo-phut, /camps/plai-laem, /about

---

### PAGE 19 : FAQ `/faq`

**Mots-cles cibles :**
- Principal : `muay thai koh samui FAQ`
- Secondaires : `muay thai for beginners questions`, `first time muay thai what to expect`

**Meta :**
```
Title: FAQ | Muay Thai Training at Ratchawat Koh Samui
Description: Frequently asked questions about Muay Thai training at Ratchawat Koh Samui. Levels, what to bring, schedules, visas, pricing & more.
```

**H1 :** `Frequently Asked Questions`

**Schema :** `FAQPage` (chaque Q/A en `Question` + `acceptedAnswer`)

**Questions recommandees :**
1. Do I need experience to train Muay Thai?
2. What should I bring to training?
3. What time are the classes?
4. Can I drop in for a single session?
5. Do you offer training for kids?
6. Is the gym suitable for women?
7. Can you help with visa applications?
8. Do you have accommodation nearby?
9. How do I get to the gym?
10. Can I book and pay online?

**Liens internes :** /pricing, /booking, /visa/dtv, /visa/90-days, /accommodation

---

### PAGE 20 : Temoignages `/reviews`

**Mots-cles cibles :**
- Principal : `ratchawat muay thai reviews`
- Secondaires : `muay thai koh samui reviews`, `best muay thai gym koh samui review`

**Meta :**
```
Title: Reviews | Ratchawat Muay Thai Koh Samui — Rated 9.3/10
Description: Read reviews from Ratchawat Muay Thai students. Rated 9.3/10 on MuayThaiMap with 131+ Google reviews. See what makes us the top-rated gym.
```

**H1 :** `What Our Students Say`

**Schema :** `AggregateRating` + `Review` individuels

**Passage GEO :**
> Chor Ratchawat Muay Thai is rated 9.3 out of 10 on MuayThaiMap, based on 131 Google reviews. Scores: Training 9.5/10, Facilities 9.0/10, Ambiance 9.6/10, Value 9.1/10, Accessibility 9.2/10. The gym is recognized as beginner-friendly, female-friendly, and kid-friendly with English-speaking trainers.

**Liens internes :** /about, /booking, /programs

---

## 3. Schema.org — Plan complet

### Schemas globaux (toutes les pages)

```
Organization
├── name: "Chor Ratchawat Muay Thai Gym"
├── url: "https://ratchawatmuaythai.com"
├── telephone: "+66630802876"
├── email: "chor.ratchawat@gmail.com"
├── sameAs: [facebook, instagram, tiktok]
├── aggregateRating: { ratingValue: 9.3, reviewCount: 131 }
└── location: [
      SportsActivityLocation (Bo Phut),
      SportsActivityLocation (Plai Laem)
    ]

BreadcrumbList (toutes les pages sauf homepage)

WebSite (homepage uniquement)
├── potentialAction: SearchAction
```

### Schemas par page

| Page | Types Schema | Notes |
|------|-------------|-------|
| `/` | Organization, WebSite | Multi-location |
| `/about` | AboutPage | |
| `/pricing` | Offer, AggregateOffer | Lies aux Course |
| `/programs` | ItemList de Course | |
| `/programs/group-adults` | Course, CourseInstance | Avec horaires |
| `/programs/group-kids` | Course | Avec EducationalAudience |
| `/programs/private` | Course, Offer | Avec prix |
| `/programs/fighter` | Course | Avec prerequis |
| `/booking` | WebPage, ReserveAction | |
| `/contact` | ContactPage, LocalBusiness x2 | |
| `/camps/bo-phut` | SportsActivityLocation | Adresse, geo, heures |
| `/camps/plai-laem` | SportsActivityLocation | Adresse, geo, heures |
| `/accommodation` | LodgingBusiness | Partenaires |
| `/services` | Service | Multiples |
| `/visa/dtv` | FAQPage, Article | Questions visa |
| `/visa/90-days` | FAQPage, Article | Questions visa |
| `/team` | Person (x4+) | Entraineurs |
| `/gallery` | ImageGallery | |
| `/faq` | FAQPage | 10+ questions |
| `/reviews` | AggregateRating, Review | |
| `/blog` | Blog, CollectionPage | Phase ulterieure |
| `/blog/[slug]` | BlogPosting, Article | Phase ulterieure |

---

## 4. Infrastructure SEO technique

### robots.txt

```
User-agent: *
Allow: /

# Sitemaps
Sitemap: https://ratchawatmuaythai.com/sitemap.xml

# AI Crawlers (GEO - authorized)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Bytespider
Allow: /

# Block WordPress legacy paths (after migration)
Disallow: /wp-admin/
Disallow: /wp-content/
Disallow: /wp-includes/
```

### Sitemap XML

Genere dynamiquement par Next.js (`src/app/sitemap.ts`).
Inclut toutes les 20 pages + articles de blog (quand crees).
Priorites : homepage 1.0, pages programmes 0.8, pages services 0.7, blog 0.6.

### Hreflang (trilingue)

Chaque page doit inclure dans le `<head>` :
```html
<link rel="alternate" hreflang="en" href="https://ratchawatmuaythai.com/{path}" />
<link rel="alternate" hreflang="fr" href="https://ratchawatmuaythai.com/fr/{path}" />
<link rel="alternate" hreflang="es" href="https://ratchawatmuaythai.com/es/{path}" />
<link rel="alternate" hreflang="x-default" href="https://ratchawatmuaythai.com/{path}" />
```

### llms.txt (GEO)

Fichier `public/llms.txt` pour les crawlers IA :
```
# Chor Ratchawat Muay Thai Gym
> Muay Thai training camp in Koh Samui, Thailand. Two locations: Bo Phut and Plai Laem.

## Contact
- Phone: +66 63 080 2876
- Email: chor.ratchawat@gmail.com
- Website: https://ratchawatmuaythai.com

## Locations
- Bo Phut: Soi Sunday, Tambon Bo Put, Ko Samui District, Surat Thani 84320
- Plai Laem: 20, 33 Village No. 5, Plai Laem Soi 13, Tambon Bo Put, Amphoe Ko Samui, Surat Thani 84320

## Programs
- Group classes (adults & kids)
- Private 1-on-1 lessons
- Fighter training program
- 1-week intensive package

## Pricing
- Drop-in: 500 THB (~$15 USD)
- Monthly: 5,500 THB (~$167 USD)

## Hours
Open 6 days a week, 8:00 AM - 8:00 PM

## Visa Support
- DTV Visa (180 days)
- 90-Day Muay Thai Education Visa

## Rating
9.3/10 on MuayThaiMap (131 Google reviews)
```

### Redirections 301 (migration WordPress → Next.js)

Implementer dans `next.config.js` :

| Source | Destination |
|--------|------------|
| `/about-us/` | `/about` |
| `/bo-phut/` | `/camps/bo-phut` |
| `/plai-laem/` | `/camps/plai-laem` |
| `/group-lessons-adults/` | `/programs/group-adults` |
| `/group-lessons-kids/` | `/programs/group-kids` |
| `/private-lessons/` | `/programs/private` |
| `/train-to-fight/` | `/programs/fighter` |
| `/schedule-bo-phut/` | `/camps/bo-phut` |
| `/schedule-plai-laem/` | `/camps/plai-laem` |
| `/accomodation/` | `/accommodation` |
| `/accomodation-plai-laem/` | `/accommodation` |
| `/training/` | `/programs` |
| `/services/` | `/services` |
| `/transportation-solutions/` | `/services` |
| `/health-insurance/` | `/services` |
| `/dtv-visa-thailand-apply-now/` | `/visa/dtv` |
| `/destination-thailand-visa-dtv-form/` | `/visa/dtv` |
| `/90-days-muay-thai-visa-apply-now/` | `/visa/90-days` |
| `/90-days-muay-thai-visa-form/` | `/visa/90-days` |
| `/camp-news/` | `/blog` |
| `/blognews/` | `/blog` |
| `/category/news/` | `/blog` |

---

## 5. Strategie de mots-cles par langue

### Anglais (EN) — Langue principale

Couvert ci-dessus dans le plan par page.

### Francais (FR) — Mots-cles cibles

| Page | Mots-cles FR |
|------|-------------|
| Homepage | muay thai koh samui, camp muay thai thailande |
| Pricing | prix muay thai koh samui, tarif entrainement muay thai |
| Programs | cours muay thai koh samui, apprendre muay thai thailande |
| Private | cours prive muay thai koh samui |
| Kids | muay thai enfant koh samui |
| Accommodation | muay thai hebergement koh samui, sejour muay thai thailande |
| DTV Visa | visa DTV muay thai thailande, visa thailande muay thai |
| FAQ | questions muay thai debutant |

### Espagnol (ES) — Mots-cles cibles

| Page | Mots-cles ES |
|------|-------------|
| Homepage | muay thai koh samui, campo muay thai tailandia |
| Pricing | precios muay thai koh samui, cuanto cuesta muay thai tailandia |
| Programs | clases muay thai koh samui, aprender muay thai tailandia |
| Private | clases privadas muay thai koh samui |
| Kids | muay thai ninos koh samui |
| Accommodation | muay thai alojamiento koh samui, vacaciones muay thai |
| DTV Visa | visa DTV muay thai tailandia |

---

## 6. Strategie de liens internes

### Pages piliers (hub)

Les pages suivantes sont des "hubs" qui doivent recevoir le maximum de liens internes :
1. **Homepage** `/` — hub principal
2. **Pricing** `/pricing` — hub transactionnel
3. **Booking** `/booking` — hub conversion
4. **Programs** `/programs` — hub contenu

### Regle de maillage

- Chaque page doit contenir **minimum 3 liens internes** vers d'autres pages
- Chaque page doit etre **liee depuis minimum 2 autres pages**
- Les CTAs doivent toujours pointer vers `/booking` ou `/pricing`
- Le footer contient un lien vers chaque page de niveau 1
- Les breadcrumbs assurent le maillage hierarchique

### Ancres recommandees

Utiliser des ancres descriptives avec mots-cles, pas de "cliquez ici" :
- "View our training prices" → /pricing
- "Book your session online" → /booking
- "See the Bo Phut gym" → /camps/bo-phut
- "Meet our trainers" → /team
- "Read student reviews" → /reviews

---

## 7. Checklist pre-deploiement

Avant chaque mise en production, verifier :

- [ ] Toutes les pages ont un `<title>` unique < 60 caracteres
- [ ] Toutes les pages ont une `<meta description>` unique < 155 caracteres
- [ ] Chaque page a exactement 1 `<h1>`
- [ ] Schema JSON-LD valide sur chaque page (tester avec Google Rich Results Test)
- [ ] Hreflang correct pour EN/FR/ES sur chaque page
- [ ] Sitemap XML inclut toutes les pages
- [ ] robots.txt autorise les crawlers IA
- [ ] llms.txt et llms-full.txt en place
- [ ] Redirections 301 testees (toutes les anciennes URLs)
- [ ] Images en WebP, avec alt text, lazy-loading
- [ ] Core Web Vitals > 90 (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- [ ] OG tags (Open Graph) pour partage social
- [ ] Canonical URLs sur chaque page
- [ ] Google Search Console connectee
- [ ] Google Analytics connectee
- [ ] Google Business Profile mis a jour (2 fiches)

---

## 8. Priorites d'implementation

### Phase 1 — Quick wins (a integrer des le scaffold)

1. Infrastructure SEO : meta, schemas, sitemap, robots.txt, llms.txt
2. Pages visa (DTV + 90 jours) — gap concurrentiel majeur
3. Schema LocalBusiness pour les 2 camps
4. Redirections 301 dans next.config.js
5. Hreflang setup

### Phase 2 — Contenu (pendant le developpement)

6. Passages GEO sur chaque page
7. FAQ structuree avec schema FAQPage
8. Temoignages avec AggregateRating
9. Profils entraineurs avec schema Person

### Phase 3 — Post-deploiement (audit live)

10. Audit SEO technique complet (`/seo`)
11. Test Core Web Vitals reels
12. Soumission sitemap a Google Search Console
13. Verification schemas avec Rich Results Test
14. Audit backlinks et plan de recuperation
15. MAJ Google Business Profile avec nouvelles URLs
