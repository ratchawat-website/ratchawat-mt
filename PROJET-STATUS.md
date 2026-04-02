# Ratchawat Muay Thai -- Project Status

> **This file is the primary reference for the project.**
> Each agent must read it at the start of a conversation and update it after each modification.

**Last updated:** 2026-04-02
**Current commit:** (initial setup, not yet committed)
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
- Hours: 8:00 AM - 8:00 PM, 6 days/week
- Rating: 9.3/10 on MuayThaiMap (131 Google reviews)
- Drop-in: 500 THB (~$15 USD) | Monthly: 5,500 THB (~$167 USD)

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
│   │   ├── layout.tsx                 # Root layout (Outfit + Plus Jakarta Sans)
│   │   ├── page.tsx                   # Homepage
│   │   ├── not-found.tsx              # Custom 404
│   │   └── sitemap.ts                 # Dynamic sitemap (20 routes)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx         # Fixed dark header + mobile menu
│   │   │   ├── Footer.tsx             # 4-column footer
│   │   │   └── Breadcrumbs.tsx        # Breadcrumbs + JSON-LD
│   │   ├── ui/
│   │   │   ├── HeroSection.tsx        # Full-height hero with CTA
│   │   │   ├── GlassCard.tsx          # Dark card component
│   │   │   ├── CTABanner.tsx          # Call-to-action banner
│   │   │   ├── FAQAccordion.tsx       # Expandable FAQ
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
│   ├── middleware.ts                  # Root middleware (graceful without Supabase keys)
│   ├── styles/globals.css             # Design system "Ratchawat Bold" (Tailwind v4)
│   └── types/index.ts                # Core types (NavItem, Booking, Trainer, etc.)
├── public/
│   ├── images/                        # (empty, needs real photos)
│   ├── robots.txt                     # Allows all + AI crawlers
│   ├── llms.txt                       # Brief AI summary
│   └── llms-full.txt                  # Extended AI summary
├── CLAUDE.md                          # Agent instructions
├── PROJET-STATUS.md                   # THIS FILE
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
| `/booking` | Booking | Planned | -- | -- | Stripe integration |
| `/contact` | Contact | **Done** | Yes | ContactPage + LocalBusiness x2 + Organization | Form + 2 location cards + maps + contact info |
| `/camps/bo-phut` | Bo Phut Camp | **Done** | Yes | SportsActivityLocation + Organization | Hero + gym description + schedule table + equipment + location card + GEO + CTA |
| `/camps/plai-laem` | Plai Laem Camp | **Done** | Yes | SportsActivityLocation + Organization | Hero + gym description + schedule table + equipment (8 items) + location card + GEO + CTA |
| `/accommodation` | Accommodation | **Done** | Yes | LodgingBusiness + Organization | Bo Phut options (3) + Plai Laem options (3) + tips + GEO + CTA |
| `/services` | Services | **Done** | Yes | Service x3 + Organization | Transport (3 cards) + gear (3 cards) + health insurance + GEO + CTA |
| `/visa/dtv` | DTV Visa | **Done** | Yes | Article + FAQPage + Organization | Requirements (6) + 4-step process + packages + 6 FAQ + GEO + CTA |
| `/visa/90-days` | 90-Day Visa | **Done** | Yes | Article + FAQPage + Organization | Highlights (6) + 4-step process + pricing + 6 FAQ + GEO + CTA |
| `/team` | Trainers | **Done** | Yes | Person x4 + Organization | 4 trainer profiles (alternating layout) + specialties + GEO + CTA |
| `/gallery` | Gallery | **Done** | Yes | ImageGallery + Organization | 4 sections (Bo Phut, Plai Laem, Training, Team) with placeholders + social links + CTA |
| `/faq` | FAQ | **Done** | Yes | FAQPage + Organization | 10 Q&A accordion + quick links + GEO |
| `/reviews` | Reviews | **Done** | Yes | AggregateRating + Review x6 + Organization | 5 score cards + 6 reviews + reviewer tags + GEO + CTA |

### 2.3 Components

**Done:**

| Component | Location | Description |
|-----------|---------|-------------|
| Navigation | `src/components/layout/` | Fixed dark header, 6 nav links + Book Now CTA, mobile hamburger |
| Footer | `src/components/layout/` | 4-column (brand, training, info, contact/social) |
| Breadcrumbs | `src/components/layout/` | With JSON-LD BreadcrumbList |
| HeroSection | `src/components/ui/` | Full-height, gradient overlay, optional image + CTA |
| GlassCard | `src/components/ui/` | Dark card with hover shadow |
| CTABanner | `src/components/ui/` | Centered CTA with primary button |
| FAQAccordion | `src/components/ui/` | Expandable Q&A with chevron |
| ImagePlaceholder | `src/components/ui/` | 6 category gradients for dark mode |
| JsonLd | `src/components/seo/` | Generic JSON-LD script injector |
| SchemaOrg | `src/components/seo/` | 10 schema builders (org, website, breadcrumb, faq, article, sportsLocation, course, rating, localBusiness, offerCatalog) |
| ContactForm | `src/components/ui/` | Client form with status states, submits to /api/contact |
| LocationCard | `src/components/ui/` | Map embed + address/phone/email/hours + camp page link |
| ScheduleTable | `src/components/ui/` | Responsive HTML schedule table (time x days), replaces image-based schedule |
| ProgramCard | `src/components/ui/` | Program card with icon, title, level badge, duration badge, description, link |

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
| Display font | Outfit (bold, uppercase titles) |
| Body font | Plus Jakarta Sans |
| Border-radius | card 0.5rem, btn 0.5rem, banner 0.75rem |
| Glass effects | No |
| Shadows | Orange-tinted, low opacity |

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

### Elements preserved
- Brand identity and colors (orange #ff6600)
- Business content (programs, locations, services, visa info)
- Domain and SEO equity (via 301 redirects)
- Google Analytics tracking ID (G-SVH7KPWM2S)

### Elements improved
- Performance: 473 KB HTML -> ~50 KB (10x lighter)
- SEO: meta, schemas, GEO passages, llms.txt
- Navigation: 2 camps clearly separated instead of mixed
- Schedule: HTML tables instead of images
- Contact info: visible on site (was only on external directories)
- Prices: visible on site (was only on third-party sites)
- Mobile: optimized, no popups, no auto-play videos

### Elements added
- Online booking system (Stripe)
- Online payment processing
- Trainer profiles page (/team)
- FAQ page with FAQPage schema
- Reviews/testimonials page with AggregateRating
- GEO optimization (llms.txt, citable passages)
- Multi-language support planned (EN/FR/ES)
- User authentication (Supabase)
- Contact form with email notifications (Resend)
- Custom 404 page

### Redirections 301 (to implement in next.config.js before go-live)

| Old URL | New URL |
|---------|---------|
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

## 4. Correction History

| Date | Description |
|------|-------------|
| 2026-04-02 | Initial project setup via project-init skill (32 files) |
| 2026-04-02 | Fixed layout.tsx imports (components/layout/ path) |
| 2026-04-02 | Fixed Resend lazy initialization (build without API keys) |
| 2026-04-02 | Fixed middleware to gracefully skip Supabase without keys |
| 2026-04-02 | Homepage enriched: added camps, pricing preview, testimonials, team, visa sections. Fixed program links. Added AggregateRating schema. |
| 2026-04-02 | Created /pricing page with full price grid (drop-in, weekly, monthly, private, fighter). OfferCatalog + Course schemas. |
| 2026-04-02 | Created /contact page with ContactForm, 2 LocationCards, ContactPage + LocalBusiness x2 schemas. |
| 2026-04-02 | Added localBusinessSchema + offerCatalogSchema to SchemaOrg.tsx (10 total builders). |
| 2026-04-02 | Created ContactForm + LocationCard components in src/components/ui/. |
| 2026-04-02 | Fixed sitemap.ts routes to match actual page slugs (group-adults, private, group-kids, fighter, 90-days). Added /team, /faq, /services routes. |
| 2026-04-02 | Created ScheduleTable component (responsive HTML schedule, time x days grid). |
| 2026-04-02 | Created /camps/bo-phut page: hero, gym description, schedule table, 6 equipment cards, LocationCard, GEO passage, SportsActivityLocation schema. |
| 2026-04-02 | Created /camps/plai-laem page: hero, gym description, schedule table, 8 equipment cards (incl. bodyweight area), LocationCard, GEO passage, SportsActivityLocation schema. |
| 2026-04-02 | Created ProgramCard component (icon, title, level/duration badges, description, link). |
| 2026-04-02 | Created /programs overview page with 4 ProgramCards + Course schemas + how it works section. |
| 2026-04-02 | Created /programs/group-adults: class structure (6 phases), schedule/pricing links, Course+Offer schema. |
| 2026-04-02 | Created /programs/group-kids: 6 benefit cards, parent info section, Course schema. |
| 2026-04-02 | Created /programs/private: 4 reason cards, 3 trainer previews (Kroo Wat, Mam, Kong), Course+Offer schema. |
| 2026-04-02 | Created /programs/fighter: 4 training blocks (typical day), 3 prerequisites, pricing/accommodation links, Course schema. |
| 2026-04-02 | Created /about page: story, 4 values cards, why students choose us, reputation section, AboutPage schema. |
| 2026-04-02 | Created /team page: 4 trainer profiles (Kroo Wat, Mam, Kong, Nangja) with alternating layout, specialties badges, Person x4 schemas. |
| 2026-04-02 | Created /faq page: 10 Q&A items with FAQAccordion, quick links section, FAQPage schema. |
| 2026-04-02 | Created /reviews page: 5 score cards, 6 student reviews (multi-language), reviewer tags, AggregateRating + Review x6 schemas. |
| 2026-04-02 | Created /visa/dtv page: DTV explanation, 6 requirements, 4-step process, training packages, 6 FAQ, Article + FAQPage schemas. |
| 2026-04-02 | Created /visa/90-days page: ED visa explanation, 6 highlights, 4-step process, pricing, 6 FAQ, Article + FAQPage schemas. |
| 2026-04-02 | Created /accommodation page: Bo Phut (3 options) + Plai Laem (3 options) + tips, LodgingBusiness schema. |
| 2026-04-02 | Created /services page: transport (3 cards), gear (3 cards), health insurance section, Service x3 schemas. |
| 2026-04-02 | Created /gallery page: 4 gallery sections with placeholders, ImageGallery schema. Awaiting real photos. |
| 2026-04-02 | Fixed breadcrumbs hidden behind fixed nav: added pt-20 to main in layout.tsx. |
| 2026-04-02 | Rebuilt Navigation: glassmorphism style, detached from top (pt-3), centered (max-w-6xl), rounded-2xl, backdrop-blur-xl, scroll-aware opacity. Added About + Camps submenu. |
| 2026-04-02 | Rebuilt Footer: 5 columns (Training, Camps, Info, Contact + brand), all 20+ pages now accessible. |
| 2026-04-02 | Revised font pairing: reduced H1/H2/Hero sizes by one step, H2 now font-semibold without uppercase, added letter-spacing -0.01em for elegance. |

---

## 5. Known Issues

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | Low | Next.js 16 warns "middleware" is deprecated, use "proxy" | Won't fix now |
| 2 | Medium | All images are placeholders (no real photos) | Pending client content |
| 3 | Medium | API keys not configured (Supabase, Stripe, Resend) | TO DO LATER |
| 4 | Low | Blog section not implemented (phase 3) | Planned |
| 5 | Low | Multi-language (FR/ES) not implemented yet | Planned |

---

## 6. Next Steps -- Detailed Instructions for Agents

### IMPORTANT: Before working on any page

1. **Read this file** (PROJET-STATUS.md) for current state
2. **Read AUDIT-SEO.md** for SEO strategy per page (keywords, meta title/description, H1, schemas, GEO passage, internal links)
3. **Read CLAUDE.md** for coding conventions and workflows
4. **Read AUDIT-REFONTE-COMPLET.md** for business context and content to migrate

### Phase 1: Core pages (priority order)

Build pages in this order. Each page MUST include:
- SEO metadata via `generatePageMeta()` (title and description from AUDIT-SEO.md)
- Breadcrumbs component with JSON-LD
- Schema.org JSON-LD (type specified in AUDIT-SEO.md per page)
- GEO citable passage (exact text in AUDIT-SEO.md per page)
- Internal links (minimum 3, targets specified in AUDIT-SEO.md)
- CTABanner at bottom pointing to /booking or /pricing
- Mobile-responsive (test at 375px)

After each page: `npm run build` + `npm run lint` + update this file.

#### Wave 1 -- High conversion impact

| # | Page | Route | Key content | New components needed | Schema |
|---|------|-------|-------------|----------------------|--------|
| 1 | **Pricing** | `/pricing` | Price grid: drop-in 500 THB, packages, monthly 5500 THB, private, fighter | `PricingTable` | Offer, AggregateOffer |
| 2 | **Contact** | `/contact` | Form (Resend API ready), Google Maps embed x2, phone, email, WhatsApp, directions | `LocationCard` | ContactPage, LocalBusiness x2 |
| 3 | **Bo Phut Camp** | `/camps/bo-phut` | Gym description, equipment, HTML schedule, gallery, address, map | `ScheduleTable`, `LocationCard` | SportsActivityLocation |
| 4 | **Plai Laem Camp** | `/camps/plai-laem` | Same as Bo Phut but for Plai Laem | Reuse `ScheduleTable`, `LocationCard` | SportsActivityLocation |

#### Wave 2 -- Programs (SEO content)

| # | Page | Route | Key content | Schema |
|---|------|-------|-------------|--------|
| 5 | **Programs overview** | `/programs` | 4 program cards linking to sub-pages | ItemList of Course |
| 6 | **Group Adults** | `/programs/group-adults` | Class description, what to expect, levels, schedule link | Course + CourseInstance |
| 7 | **Group Kids** | `/programs/group-kids` | Kids program, safety, ages, parent info | Course |
| 8 | **Private Lessons** | `/programs/private` | 1-on-1 description, trainer selection, booking CTA | Course + Offer |
| 9 | **Fighter Program** | `/programs/fighter` | Intensive training, prerequisites, competition prep | Course |

#### Wave 3 -- Trust & differentiation

| # | Page | Route | Key content | New components needed | Schema |
|---|------|-------|-------------|----------------------|--------|
| 10 | **Team** | `/team` | Trainer profiles: Kroo Wat, Mam, Kong, Teacher Nangja (photo, bio, specialty) | `TrainerCard` | Person x4 |
| 11 | **Reviews** | `/reviews` | Showcase 131 Google reviews, 9.3/10 rating, key quotes | `TestimonialCarousel` | AggregateRating + Review |
| 12 | **FAQ** | `/faq` | 10+ Q&A (see AUDIT-SEO.md for questions list) | Reuse `FAQAccordion` | FAQPage |
| 13 | **About** | `/about` | Story, values, mission, reputation | -- | AboutPage |

#### Wave 4 -- Services & visa (SEO gap exploitation)

| # | Page | Route | Key content | Schema |
|---|------|-------|-------------|--------|
| 14 | **DTV Visa** | `/visa/dtv` | What is DTV, requirements, how to apply with Ratchawat, FAQ section, packages | FAQPage + Article |
| 15 | **90-Day Visa** | `/visa/90-days` | Education visa info, 3-month training, documents, FAQ | FAQPage + Article |
| 16 | **Accommodation** | `/accommodation` | Options near both camps, US Hostel partnership, photos, prices | LodgingBusiness |
| 17 | **Services** | `/services` | Transport, gear, health insurance (3 sections) | Service |
| 18 | **Gallery** | `/gallery` | Photo/video grid (placeholder until real content) | ImageGallery |

#### Wave 5 -- Booking flow (requires Stripe keys)

| # | Page | Route | Key content | New components needed |
|---|------|-------|-------------|----------------------|
| 19 | **Booking** | `/booking` | Camp selector, program selector, date picker, Stripe checkout | `BookingWidget` |
| 20 | **Booking Confirmed** | `/booking/confirmed` | Thank you page, confirmation details, next steps | -- |

### Phase 2: Backend setup (requires API keys)

When ready to connect services:

1. **Supabase**
   - Create project on supabase.com
   - Create tables: `bookings`, `schedules`, `trainers`, `programs`, `faq_items`, `testimonials`
   - Configure Row Level Security (RLS)
   - Enable Email auth
   - Copy URL + anon key + service role key to .env.local

2. **Stripe**
   - Create account on stripe.com
   - Create products: "Drop-in Session" (50000 satang), "Private Lesson", packages
   - Create webhook endpoint pointing to /api/webhooks/stripe
   - Copy publishable key + secret key + webhook secret to .env.local

3. **Resend**
   - Create account on resend.com
   - Verify domain ratchawatmuaythai.com
   - Copy API key to .env.local

4. **Set all keys in .env.local** (copy from .env.local.example)

### Phase 3: Polish & launch preparation

1. **Content**
   - Replace all ImagePlaceholder components with real photos
   - Write final content for all pages
   - Run `/humanizer` on all text
   - Run `/seo` audit on each page

2. **Multi-language (next-intl)**
   - Install and configure next-intl
   - Create EN/FR/ES translations for all pages
   - Add `LanguageSwitcher` component
   - Update hreflang tags

3. **Redirections 301**
   - Implement all redirects from section 3 in next.config.js
   - Test every old URL redirects correctly

4. **Performance & accessibility**
   - Run Lighthouse audit (targets: Performance >= 90, Accessibility >= 95, SEO = 100)
   - Run `/accessibility` skill
   - Run `/performance` skill
   - Optimize images (WebP/AVIF, srcset, lazy-loading)

5. **Deployment**
   - Deploy to Vercel
   - Configure custom domain (ratchawatmuaythai.com)
   - Set environment variables in Vercel dashboard
   - Submit sitemap to Google Search Console
   - Update Google Business Profile (2 listings) with new URLs
   - Verify all Schema.org with Google Rich Results Test

### Phase 4: Post-launch

1. **Blog** (11 articles to migrate from old site, see AUDIT-REFONTE-COMPLET.md)
2. **Analytics review** and conversion tracking
3. **Review collection system** (Google reviews integration)
4. **A/B testing** on booking flow

---

## 7. Reference Documents

| Document | Location | Purpose |
|----------|---------|---------|
| `CLAUDE.md` | Project root | Agent instructions, coding conventions, workflows |
| `PROJET-STATUS.md` | Project root | This file -- single source of truth |
| `AUDIT-SEO.md` | Project root | **SEO strategy per page**: keywords, meta, H1, schemas, GEO passages, internal links |
| `AUDIT-REFONTE-COMPLET.md` | Project root | Full technical audit, architecture, content to migrate, debt inventory |
| `audit-ratchawat-muaythai.docx` | Project root | Original client-facing audit document |
| `.env.local.example` | Project root | Required environment variables template |

---

## 8. Contribution Rules

1. **Read** `PROJET-STATUS.md` at the start of every session
2. **Read** `AUDIT-SEO.md` before building any page (it has the exact meta, keywords, schemas)
3. **Update** `PROJET-STATUS.md` after every significant change (mark page as Done, update components, add to correction history)
4. `npm run build` must pass without errors before committing
5. `npm run lint` must show 0 errors
6. Never commit API keys or secrets
7. All visible text must pass through `/humanizer`
8. Every page must include SEO metadata, breadcrumbs, JSON-LD, GEO passage, and CTABanner
9. Use existing components before creating new ones
10. Test at 375px (mobile) and 1440px (desktop) before marking a page Done
