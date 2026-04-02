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
| `/` | Homepage | **Done** | Yes | Organization + WebSite | Hero + features + programs + CTA |
| `/about` | About | Planned | -- | -- | |
| `/pricing` | Pricing | Planned | -- | -- | Critical: prices visible |
| `/programs` | Programs Overview | Planned | -- | -- | |
| `/programs/group-adults` | Group Classes (Adults) | Planned | -- | -- | |
| `/programs/group-kids` | Group Classes (Kids) | Planned | -- | -- | |
| `/programs/private` | Private Lessons | Planned | -- | -- | |
| `/programs/fighter` | Fighter Program | Planned | -- | -- | |
| `/booking` | Booking | Planned | -- | -- | Stripe integration |
| `/contact` | Contact | Planned | -- | -- | Google Maps + form |
| `/camps/bo-phut` | Bo Phut Camp | Planned | -- | -- | + integrated schedule |
| `/camps/plai-laem` | Plai Laem Camp | Planned | -- | -- | + integrated schedule |
| `/accommodation` | Accommodation | Planned | -- | -- | |
| `/services` | Services | Planned | -- | -- | Transport + insurance + gear |
| `/visa/dtv` | DTV Visa | Planned | -- | -- | High SEO value |
| `/visa/90-days` | 90-Day Visa | Planned | -- | -- | High SEO value |
| `/team` | Trainers | Planned | -- | -- | Kroo Wat, Mam, Kong, Nangja |
| `/gallery` | Gallery | Planned | -- | -- | |
| `/faq` | FAQ | Planned | -- | -- | FAQPage schema |
| `/reviews` | Reviews | Planned | -- | -- | AggregateRating schema |

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
| SchemaOrg | `src/components/seo/` | 8 schema builders (org, website, breadcrumb, faq, article, sportsLocation, course, rating) |

**Planned (project-specific, to build when needed):**

| Component | Purpose | Build with page |
|-----------|---------|----------------|
| ScheduleTable | HTML schedule by location (replaces image-based schedule) | /camps/* |
| TrainerCard | Trainer profile with photo, bio, specialty | /team |
| TestimonialCarousel | Google reviews carousel | /reviews |
| LocationCard | Google Maps embed + directions | /contact, /camps/* |
| PricingTable | Price grid by formula (drop-in, packages, monthly) | /pricing |
| BookingWidget | Booking form with date/program selection + Stripe | /booking |
| LanguageSwitcher | EN/FR/ES language toggle | layout.tsx (later) |
| ProgramCard | Program card with level, duration, description | /programs |

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
