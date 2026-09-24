# Ratchawat Muay Thai -- Project Status

> **This file is the primary reference for the project.**
> Each agent must read it at the start of a conversation and update it after each modification.

**Last updated:** 2026-09-24
**Phase:** Post-launch (site live since 2026-05-02; brief cliente juillet 2026 shipped 2026-07-14, see `ROADMAP.md`).
**Pre-go-live config:** Read `GO-LIVE-CHECKLIST.md` before any production deployment.
**Project status:** Live in production at https://ratchawatmuaythai.com (go-live 2026-05-02).
**Rebuilt from:** https://ratchawatmuaythai.com/

---

## 1. Overview

**Client:** Ratchawat MT
**Site:** ratchawatmuaythai.com (domain migration at end of project)
**Type:** Booking (reservation + online payment)
**Description:** Muay Thai training camp in Ko Samui with two locations (Bo Phut and Plai Laem). Offers group classes, private lessons, kids programs, fighter training, accommodation, and visa support (DTV + 90-day).

**Business objective:** Replace the current WordPress site (performance 2/10, SEO 3/10, 0 online bookings) with a fast, SEO-optimized Next.js site with online booking and payment.

**Business info:**
- Phone: +66 63 080 2876
- Email: chor.ratchawat@gmail.com
- Hours (training): 7:00 AM - 8:00 PM, 6 days/week (closed Sunday)
- Schedule: Group 9:00-10:30 + 17:00-18:30 | Private 60-min sessions, 19 start times every 30 min from 7:00 to 19:00 (last ends 20:00) | Fighter 7:30-10:00 + 16:00-18:30 (Plai Laem only)
- Rating: 5.0/5 (396 Google reviews: 255 Bo Phut + 141 Plai Laem)
- Drop-in (adult): 400 THB | Drop-in (kids 8-13 group / 3-13 private): 300 THB
- Monthly (1x/day): 5,500 THB | Monthly (2x/day): 7,000 THB
- Monthly kids unlimited: 2,500 THB | Resident: 3,000 THB/month (1 session/day) — sole tier, Stripe `prod_ULq6vblPmCin40`
- Private 1-on-1 adult: 1,000 THB | 10-session pack: 9,000 THB (flat) | Private group (2-3 max) adult: 700 THB/person (per-person since 2026-07-16, was 1,400 flat)
- Private 1-on-1 kids: 600 THB | Private group (2-3 kids max): 400 THB/kid
- Fighter Program: 9,500 THB/month (Plai Laem only)
- Camp Stay (Plai Laem, free check-in/check-out since 2026-07): room from 8,000 THB/7 nights or 15,000 THB/14 nights (+1,140 THB/extra night) -- 18,000 THB/month (+600 THB/extra day) -- bungalow 23,000 THB/month (+760 THB/extra night, client-confirmed 2026-07-16) -- Fighter+Room 20,000 (+670) / Fighter+Bungalow 25,500 THB/30 nights (+850 THB/extra night). Grid: `src/content/stay-pricing.ts`
- Bodyweight area: 100 THB drop-in, 900 THB/month
- DTV packages: 20,000 THB (2x/wk, `dtv-6m-2x`) | 25,000 THB (4x/wk, `dtv-6m-4x`) | 35,000 THB (unlimited group training, Fighter Program NOT included, `dtv-6m-unlimited`) -- all 6 months. Refund policy since 2026-07: 50% refund within 3 weeks with official refusal proof + 50% training voucher (texts verbatim in `src/content/policies.ts`)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Styling | Tailwind CSS (CSS-first) | 4.x |
| Language | TypeScript | 5.x |
| Auth + DB | Supabase (@supabase/ssr) | 2.x |
| Payments | Stripe Checkout | latest |
| Email | Resend | latest |
| Hosting | Vercel (planned) | -- |

---

## 2. Current State -- What's Done

### 2.1 Project structure

```
ratchawat-mt/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkout/route.ts      # Stripe checkout session
│   │   │   ├── contact/route.ts       # Resend contact form
│   │   │   └── webhooks/stripe/route.ts # Stripe webhook handler
│   │   ├── layout.tsx                 # Root layout (Barlow Condensed + Inter)
│   │   ├── page.tsx                   # Homepage
│   │   ├── not-found.tsx              # Custom 404
│   │   └── sitemap.ts                 # Dynamic sitemap (20 routes)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx         # Floating nav, diamond logo, Camps dropdown, gradient line
│   │   │   ├── Footer.tsx             # Brand header row, gradient accent, 4 columns, orange headers
│   │   │   └── Breadcrumbs.tsx        # Accent line, uppercase, slash separator + JSON-LD
│   │   ├── ui/
│   │   │   ├── HeroSection.tsx        # Centered bold + outline hero, kicker, dual buttons
│   │   │   ├── GlassCard.tsx          # Card with top glow line, left border, filigree number, hover lift
│   │   │   ├── CTABanner.tsx          # Warm glow CTA with accent lines, kicker, dual buttons
│   │   │   ├── FAQAccordion.tsx       # Numbered FAQ with +/- toggle, left border transitions
│   │   │   ├── ProgramCard.tsx        # Extends GlassCard with underline badges, bottom separator
│   │   │   ├── ContactForm.tsx        # System card with kicker, uppercase labels, focus glow
│   │   │   ├── LocationCard.tsx       # Media card with map, "Open Now" badge, bottom link
│   │   │   ├── ScheduleTable.tsx      # Dual render: desktop table + mobile day list
│   │   │   ├── ImagePlaceholder.tsx   # Gradient placeholder
│   │   │   └── index.ts              # Barrel export
│   │   └── seo/
│   │       ├── JsonLd.tsx             # Generic JSON-LD injector
│   │       └── SchemaOrg.tsx          # Schema builders (8 types)
│   ├── lib/
│   │   ├── seo/meta.ts               # generatePageMeta() helper
│   │   ├── stripe/client.ts           # Stripe singleton
│   │   └── supabase/
│   │       ├── client.ts              # Browser client
│   │       ├── server.ts              # Server client
│   │       └── middleware.ts          # Auth session refresh
│   ├── hooks/
│   │   └── useScrollAnimation.ts      # Intersection Observer hook (fade-in, slide-up, stagger)
│   ├── proxy.ts                       # Root proxy (Next 16 convention, ex-middleware; graceful without Supabase keys)
│   ├── styles/globals.css             # Design system "Ratchawat Bold" + Elegance tokens (Tailwind v4)
│   └── types/index.ts                # Core types (NavItem, Booking, Trainer, etc.)
├── public/
│   ├── images/                        # (empty, needs real photos)
│   ├── robots.txt                     # Allows all + AI crawlers
│   ├── llms.txt                       # Brief AI summary
│   └── llms-full.txt                  # Extended AI summary
├── CLAUDE.md                          # Agent instructions
├── PROJECT-STATUS.md                   # THIS FILE
├── AUDIT-SEO.md                       # SEO strategy per page (keywords, schemas, metas, GEO)
├── AUDIT-REFONTE-COMPLET.md           # Full technical audit + architecture plan
├── .env.local.example                 # Environment variable template
└── audit-ratchawat-muaythai.docx      # Original audit document (client-facing)
```

### 2.2 Pages

| Route | Title | Status | SEO Meta | JSON-LD | Notes |
|-------|-------|--------|:--------:|:-------:|-------|
| `/` | Homepage | **Done** | Yes | Organization + WebSite + AggregateRating | Hero + features + camps + programs + pricing preview + testimonials + team + GEO + CTA |
| `/about` | About | **Done** | Yes | AboutPage + Organization | Story + 4 values + why students choose us + reputation + GEO + CTA |
| `/pricing` | Pricing | **Done** | Yes | Course + OfferCatalog + Organization | Full pricing grid: drop-in, weekly, monthly, private, fighter |
| `/programs` | Programs Overview | **Done** | Yes | Course x4 + Organization | 4 ProgramCards + how it works + GEO + CTA |
| `/programs/group-adults` | Group Classes (Adults) | **Done** | Yes | Course + Organization | Class structure (6 blocks) + schedule/pricing + GEO + CTA |
| `/programs/group-kids` | Group Classes (Kids) | **Done** | Yes | Course + Organization | Benefits (6 cards) + parent info + GEO + CTA |
| `/programs/private` | Private Lessons | **Done** | Yes | Course + Offer + Organization | 4 reasons + 3 trainer previews + pricing + GEO + CTA |
| `/programs/fighter` | Fighter Program | **Done** | Yes | Course + Organization | Training day (4 blocks) + prerequisites (3) + pricing/accommodation + GEO + CTA |
| `/booking` | Booking | **Done** | Yes | WebPage + ReserveAction + Organization | 4-step widget (package > camp > date > confirm), reads query params, graceful Stripe fallback |
| `/contact` | Contact | **Done** | Yes | ContactPage + LocalBusiness x2 + Organization | Form + 2 location cards + maps + contact info |
| `/camps/bo-phut` | Bo Phut Camp | **Done** | Yes | SportsActivityLocation + Organization | Hero + gym description + schedule table + equipment + location card + GEO + CTA |
| `/camps/plai-laem` | Plai Laem Camp | **Done** | Yes | SportsActivityLocation + Organization | Hero + gym description + schedule table + equipment (8 items) + location card + GEO + CTA |
| `/accommodation` | Accommodation | **Done** | Yes | LodgingBusiness + Organization | Bo Phut options (3) + Plai Laem options (3) + tips + GEO + CTA |
| `/services` | Services | **Done** | Yes | Service x3 + Organization | Transport (3 cards) + gear (3 cards) + health insurance + GEO + CTA |
| `/visa/dtv` | DTV Visa | **Rebuilt 2026-04-17 (Wave 5d)** | Yes | Service + Article + FAQPage + Organization | Hero + Soft Power explainer + 3 DTV packages (20K/25K/33K) + 4 required docs + 5-step process + 6 FAQ + GEO + CTA → /visa/dtv/apply |
| `/visa/dtv/apply` | DTV Application Form | **Done 2026-04-17 (Wave 5e)** | Yes | - | 14 fields in 4 sections (Personal / Passport / Travel / Package), client-side + server-side Zod validation, WhatsApp fallback, submits to /api/visa/dtv/apply → Stripe → /visa/dtv/confirmed |
| `/visa/dtv/confirmed` | DTV Confirmation | **Done 2026-04-17 (Wave 5g)** | noIndex | Organization | Success page, resolves application via Stripe session_id, summary card, 24h docs reminder, embassy fee reminder |
| ~~`/visa/90-days`~~ | ~~90-Day Visa~~ | **Deleted 2026-04-17 (Wave 5a)** | - | - | Client dropped ED visa assistance. Route removed, sitemap/links cleaned. |
| `/team` | Trainers | **Done** | Yes | Person x4 + Organization | 4 trainer profiles (alternating layout) + specialties + GEO + CTA |
| `/gallery` | Gallery | **Done** | Yes | ImageGallery + Organization | 4 sections (Bo Phut, Plai Laem, Training, Team) with placeholders + social links + CTA |
| `/faq` | FAQ | **Done** | Yes | FAQPage + Organization | 10 Q&A accordion + quick links + GEO |
| `/reviews` | Reviews | **Done** | Yes | AggregateRating + Review x6 + Organization | 5 score cards + 6 reviews + reviewer tags + GEO + CTA |

### 2.3 Components

**Done:**

| Component | Location | Description |
|-----------|---------|-------------|
| Navigation | `src/components/layout/` | Floating nav, diamond logo mark, Camps dropdown on hover, gradient top line, Book Now CTA |
| Footer | `src/components/layout/` | Brand header row with social links, gradient accent line, 4 columns with orange headers |
| Breadcrumbs | `src/components/layout/` | Leading accent line, uppercase tracking, slash separators, JSON-LD BreadcrumbList |
| HeroSection | `src/components/ui/` | Centered bold + outline text, kicker, warm glow gradient bg, grid overlay, dual buttons (primary + ghost), established line |
| GlassCard | `src/components/ui/` | Top glow line (gradient, intensifies on hover), left border accent, bottom border, filigree number, hover lift + shadow |
| CTABanner | `src/components/ui/` | Warm glow gradient bg, top/bottom accent lines, kicker label, dual buttons (primary + ghost) |
| FAQAccordion | `src/components/ui/` | Numbered with filigree numbers, +/- toggle icon, left border color transitions, answer padding aligned |
| ProgramCard | `src/components/ui/` | Extends GlassCard, underline badges (level + duration), bottom separator with link arrow |
| ContactForm | `src/components/ui/` | System card with kicker label, uppercase labels (10px tracking), focus glow on inputs |
| LocationCard | `src/components/ui/` | Media card with map zone, "Open Now" overlay badge, bottom separator link |
| ScheduleTable | `src/components/ui/` | Dual render: desktop pill table with legend + mobile day list with typed badges |
| ImagePlaceholder | `src/components/ui/` | 6 category gradients for dark mode (unchanged) |
| JsonLd | `src/components/seo/` | Generic JSON-LD script injector |
| SchemaOrg | `src/components/seo/` | 10 schema builders (org, website, breadcrumb, faq, article, sportsLocation, course, rating, localBusiness, offerCatalog) |
| useScrollAnimation | `src/hooks/` | Intersection Observer hook: fade-in + slide-up with stagger delay, respects prefers-reduced-motion |

**Planned (project-specific, to build when needed):**

| Component | Purpose | Build with page |
|-----------|---------|----------------|
| TestimonialCarousel | Google reviews carousel (live API integration) | /reviews (phase 3) |
| BookingWidget | Booking form with date/program selection + Stripe | /booking |
| LanguageSwitcher | EN/FR/ES language toggle | layout.tsx (later) |

### 2.4 Design system: "Ratchawat Bold"

| Token | Value |
|-------|-------|
| Style | Bold / Modern |
| Mode | Dark mode (default) |
| Primary | `#ff6600` (Deep Orange) |
| Accent | `#f5f5f5` (Blanc casse) |
| Surface (body bg) | `#0a0a0a` |
| Surface-low (footer) | `#111111` |
| Surface-lowest (cards) | `#1a1a1a` |
| Text | `#f5f5f5` |
| Text secondary | `#999999` |
| Display font | Barlow Condensed (bold, uppercase titles) |
| Body font | Inter (400/500) |
| Border-radius | card 0.5rem, btn 0.5rem, banner 0.75rem |
| Glass effects | No |
| Shadows | card: tight dark, hover: 0 8px 30px, glow: 0 0 30px orange 6% |
| Border accents | Left 2px #ff660040 (hover #ff6600), bottom 2px #222 (hover #ff6600) |
| Top line | Gradient from-transparent via-#ff660040 to-transparent, intensifies on hover |
| Filigree numbers | Barlow Condensed 48px, opacity 0.12 (hover 0.2) |
| Badges | Underline style (no background): orange, green, neutral |
| Buttons | Primary (uppercase, tracking, arrow), Ghost (border, transparent bg), Link (small, orange) |
| Category labels | 32px orange line + uppercase text, tracking 3px |
| Steps/Process | Timeline vertical: gradient line + orange dots + content right |

### 2.5 Infrastructure

- [ ] **Supabase project created** -- TO DO LATER
- [ ] **Supabase Auth configured** -- TO DO LATER
- [ ] **Supabase tables created** (bookings, schedules, trainers, programs, faq, testimonials) -- TO DO LATER
- [ ] **Stripe account connected** -- TO DO LATER
- [ ] **Stripe products/prices created** -- TO DO LATER
- [ ] **Resend domain verified** (ratchawatmuaythai.com) -- TO DO LATER
- [ ] **Environment variables set** (.env.local) -- TO DO LATER (see .env.local.example)
- [ ] **Vercel deployment** -- TO DO LATER
- [ ] **Domain configured** (ratchawatmuaythai.com migration) -- TO DO LAST
- [ ] **Google Search Console** -- After deployment
- [ ] **Google Analytics** (migrate G-SVH7KPWM2S or new) -- After deployment
- [ ] **Google Business Profile updated** (2 fiches, new URLs) -- After deployment

**Note:** The middleware gracefully skips Supabase auth when keys are not configured. The site works without any API keys for frontend development.

---

## 3. Migration Notes (from ratchawatmuaythai.com)

Archivé (redirections 301 livrées dans `next.config.ts`) : voir `docs/archive/2026-09-24-project-status-archive.md` section C.

---

## 4. Correction History

| Date | Description |
|------|-------------|
| 2026-09-24 | **§6 Next Steps rafraîchi.** Bloqueurs pré-go-live retirés (tous résolus), Known Issue #3 (clés Stripe TEST) clos : `.env.local` configuré + smoke test 4242 le 2026-04-12, seeds TEST depuis (`0ef0ec0`). Ancien texte archivé (section D de l'archive). |
| 2026-09-24 | **Ménage des fichiers d'instructions.** `CLAUDE.md` 302 → <200 lignes (doublons des règles globales retirés, skills inexistants retirés, faits périmés corrigés, `@AGENTS.md` importé). Historique ≤ 2026-07-14, issues résolus et notes de migration archivés dans `docs/archive/2026-09-24-project-status-archive.md` ; phases 1-8 de `ROADMAP.md` dans `docs/archive/2026-09-24-roadmap-archive.md`. |
| 2026-09-17 | **Dependency hygiene.** `npm audit fix` : 5 vulnérabilités (1 high `browserslist`, 4 moderate `baseline-browser-mapping`, `@humanfs/node`, `vitest`/`@vitest/mocker`) → 0, toutes dans l'outillage de dev (ESLint, Babel, vitest), aucune exposée en prod. Next.js 16.3.4 → 16.3.5 (range `package.json` passé à `^16.3.5`). esbuild low plus signalé. Majeures dispo non prises (stripe 22, typescript 7, eslint 10, react-day-picker 10, vitest 5). Vérifs : lint 0 erreur, build 0 erreur, 69/69 tests vitest (TZ locale + TZ=UTC). |
| 2026-09-01 | **Dependency hygiene.** `npm audit fix` : 7 vulnérabilités (6 high, 1 low) → 0. Next.js 16.2.10 → 16.3.4 (9 advisories corrigées, dont bypass proxy/middleware App Router, SSRF Server Actions, cache confusion), plus postcss, sharp, nanoid, js-yaml, brace-expansion, esbuild. Les 2 moderates postcss « acceptées » de juin sont désormais corrigées (Next 16.3.4 embarque un postcss patché) — plus d'exception à maintenir. Seul `package-lock.json` a changé (ranges semver de `package.json` déjà compatibles). Vérifs : lint 0 erreur, build 0 erreur (proxy détecté), 69/69 tests vitest sous TZ=UTC. |
| 2026-07-16 | **Correctifs audit 2026-07-16** (plan `docs/superpowers/plans/2026-07-16-audit-fixes.md`, 16 commits locaux, non poussés). **Critiques** : (1) cutoffs privés calculés en heure de Bangkok via nouveau helper `src/lib/utils/bangkok-time.ts` (`bangkokSlotInstant`, `todayInBangkok`) — `isSlotWithinCutoff` prend désormais un `dateStr` string et donne la même réponse sur le serveur UTC de Vercel et dans tout navigateur (bug prouvé par tests sous TZ=UTC) ; (2) webhook Stripe : nouvel helper `releaseEvent` — tout échec DB post-dédup supprime la ligne `processed_stripe_events` et renvoie 500 pour déclencher le retry Stripe (chemins DTV, booking confirmé, expired) ; 0 ligne matchée sans erreur reste un 200 définitif. **Élevés** : (3) route admin refuse `camp=both` pour une session privée (miroir du checkout public) + option masquée dans le formulaire ; (4) plancher de date serveur (calendrier Bangkok) dans `BookingRequestSchema` (sauf private, couvert par le cutoff) et `StayCheckoutSchema` ; (5) insert-then-verify sur l'inventaire hébergement (`firstOverbookedNight`/`findOverbookedNight` dans `src/lib/admin/availability.ts`, branchés dans `/api/checkout` et `/api/checkout/stay`). **Moyens/faibles** : rollback du booking pending si la création de session Stripe échoue (chemin standard) ; `expires_at` 30 min sur les 3 checkouts qui bloquent de la capacité (DTV exclu) ; insert-then-verify sur les créneaux privés créés par l'admin ; confirmation avant suppression d'un bloc dans le drawer admin (avertissement si lié à un booking) ; pages de confirmation booking + DTV vérifient `payment_status` (état discriminé paid/unpaid/unknown, écran « Payment not completed ») ; copy contact sans promesse d'email ; contenus factuels (GEO homepage 7 AM, badge fighter « Plai Laem only », légende planning fighter en bleu, `/privacy` + `/terms` retirés du disallow robots.ts) ; erreurs Zod serveur affichées par champ sur le formulaire DTV + plancher DOB 1920 ; sanitize des caractères PostgREST dans la recherche admin ; validation format + plage 366 j sur `/api/availability/occupancy` ; reset des dates au changement de tier dans FighterWizard ET CampStayWizard (même pattern trouvé). **Décisions assumées** (voir plan) : robots gagne sur sitemap pour privacy/terms ; pas de reset du panier privé au changement de participants (revalidation serveur) ; pas de polling occupancy ; l'admin peut créer des réservations passées (walk-ins) ; DTV sans expires_at court ; `no_payment_required` traité comme payé. **Vérif prod (Task 17, read-only)** : 0 ligne `camp='both'` dans `availability_blocks` (private-slot) et `bookings` (private) — aucune donnée corrompue. 69 tests, lint/build 0 erreur. |
| 2026-07-16 | **Corrections cliente V2** (brief `docs/brief-correction-cliente-V2.md`, spec + plan dans `docs/superpowers/`). 1) Groupe privé adulte 1,400 flat → **700 THB/personne** (`pricing.ts`: suppression `billing: "flat"`, test régression `src/content/pricing.test.ts`; copie pricing/programs-private/llms-full; nouveau price Stripe via seed sync, ancien 1,400 à archiver après deploy). 2) Extra nights bungalow **760** (normal) / **850** (fighter) dans `stay-pricing.ts` (TDD, chambres 600/670 inchangées; copie fighter page + llms-full). 3) « double bed » → **king-size bed (cannot be split into two singles)** sur /accommodation (4 occurrences). 4) Nouvelles politiques verbatim `PURCHASE_NO_REFUND_POLICY` + `ELECTRICITY_BILLING_NOTE` (500-3,000 THB/mois) dans `policies.ts`, affichées sur /terms, /pricing, /accommodation. À confirmer cliente : coexistence « non-refundable and non-exchangeable » vs politique voucher 12 mois des terms (voucher conservé). |
| … | Entrées 2026-04-02 → 2026-07-14 archivées dans `docs/archive/2026-09-24-project-status-archive.md` (section A). |

---

## 5. Known Issues

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 2 | Medium | All images are placeholders (no real photos) | Pending client content |
| 7 | Low | Blog section not implemented | Planned post-launch |
| 8 | Low | Multi-language (FR/ES) not implemented yet | Planned post-launch |

Issues résolus archivés dans `docs/archive/2026-09-24-project-status-archive.md` (section B).

---

## 6. Next Steps

> Read `ROADMAP.md` for the full task list. Site is live since 2026-05-02; all pre-launch blockers (Stripe keys, Bluehost domain, real photos, Resend domain, fighter+stay prices) are closed. Old section archived in `docs/archive/2026-09-24-project-status-archive.md` (section D).

### Open items

| Item | Source | Notes |
|------|--------|-------|
| Rate limiting on `/api/*` | ROADMAP, carried over from Phase 8 | Deferred post-launch (needs Upstash Redis or Vercel KV) |
| Explicit CORS policy on `/api/*` | ROADMAP, carried over from Phase 8 | Same-origin by default, low priority |
| Live Lighthouse + cross-browser + screen reader passes on prod | ROADMAP Phase 9 §G | Internal hygiene |
| Rollback plan write-up | ROADMAP Phase 9 §J, `GO-LIVE-CHECKLIST.md` §10 | Internal hygiene |
| Archive old LIVE Stripe prices (solo 800, group 600, group 1,400, DTV unlimited 33,000) | ROADMAP deployment checklist step 5 + 2026-07-16 history | Cosmetic, Stripe dashboard (à vérifier par Rd) |
| Prod visual smoke test of vague 2b (camp-stay quote vs Stripe page, 2-session private cart, admin drawer in units) | ROADMAP vague 2b checklist step 4 | Do not pay (à vérifier par Rd) |
| Real-card smoke tests for private, fighter, camp-stay, DTV, contact form, admin login | ROADMAP Phase 9 §F (unchecked) | ROADMAP "Current state" says all flows were validated with real cards: checkboxes likely stale (à vérifier par Rd) |
| Remaining client confirmations from spec §7 (group 2 vs 3 price, kids group, DTV delay, bungalow extra night) | ROADMAP vague 2b checklist step 5 | Adult group price (700/person) and bungalow extra night (760/850) settled 2026-07-16; others à vérifier par Rd |

### Open client questions

- **Grille Standard Room 17-29 nuits à confirmer avec la cliente** : avec les
  paliers actuels (14 nuits = 15 000 THB + 1 140/nuit extra ; 30 nuits =
  18 000 THB), un séjour de 17 à 29 nuits coûte plus cher que le mois complet
  (ex. 29 nuits = 32 100 THB vs 30 nuits = 18 000 THB). Est-ce voulu ?
  Sinon, fournir le tarif extra-night souhaité entre 14 et 30 nuits.
  (Détecté par l'audit du 2026-07-16, aucun changement appliqué.)

---

## 7. Reference Documents

| Document | Location | Purpose |
|----------|---------|---------|
| `CLAUDE.md` | Project root | Agent instructions, coding conventions, workflows |
| `PROJECT-STATUS.md` | Project root | This file -- single source of truth |
| `AUDIT-SEO.md` | Project root | **SEO strategy per page**: keywords, meta, H1, schemas, GEO passages, internal links |
| `AUDIT-REFONTE-COMPLET.md` | Project root | Full technical audit, architecture, content to migrate, debt inventory |
| `audit-ratchawat-muaythai.docx` | Project root | Original client-facing audit document |
| `.env.local.example` | Project root | Required environment variables template |

---

## 8. Contribution Rules

1. **Read** `PROJECT-STATUS.md` at the start of every session
2. **Read** `AUDIT-SEO.md` before building any page (it has the exact meta, keywords, schemas)
3. **Update** `PROJECT-STATUS.md` after every significant change (mark page as Done, update components, add to correction history)
4. `npm run build` must pass without errors before committing
5. `npm run lint` must show 0 errors
6. Never commit API keys or secrets
7. All visible text must pass through `/humanizer`
8. Every page must include SEO metadata, breadcrumbs, JSON-LD, GEO passage, and CTABanner
9. Use existing components before creating new ones
10. Test at 375px (mobile) and 1440px (desktop) before marking a page Done
