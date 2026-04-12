# Ratchawat Muay Thai -- Project Status

> **This file is the primary reference for the project.**
> Each agent must read it at the start of a conversation and update it after each modification.

**Last updated:** 2026-04-12
**Phase:** Phase 3 -- Booking System Full Stack (COMPLETE in dev, end-to-end validated). Next: Phase 4 Admin Dashboard.
**Pre-go-live config:** Read `GO-LIVE-CHECKLIST.md` before any production deployment.
**Project status:** Production refonte accepted by client. Maquette phase complete. Building toward full deployment (no live deployment until all 6 phases complete).
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
- Drop-in (adult): 400 THB | Drop-in (kids 8-13): 300 THB
- Monthly (1x/day): 5,500 THB | Monthly (2x/day): 7,000 THB
- Monthly kids unlimited: 2,500 THB | Resident 10x: 3,000 THB | Resident 20x: 5,500 THB
- Private 1-on-1 adult: 800 THB | Private group (2-3) adult: 600 THB/person
- Private 1-on-1 kids: 600 THB | Private group kids: 400 THB/kid
- Fighter Program: 9,500 THB/month
- Camp Stay (Plai Laem): 8,000 THB/1wk -- 15,000 THB/2wks -- 18,000 THB/month
- Bodyweight area: 100 THB drop-in, 900 THB/month

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
│   ├── middleware.ts                  # Root middleware (graceful without Supabase keys)
│   ├── styles/globals.css             # Design system "Ratchawat Bold" + Elegance tokens (Tailwind v4)
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
| `/booking` | Booking | **Done** | Yes | WebPage + ReserveAction + Organization | 4-step widget (package > camp > date > confirm), reads query params, graceful Stripe fallback |
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
| 2026-04-12 | **Security fix: drop anon_insert_bookings RLS policy** (Supabase advisor lint 0024). The policy was unused (all inserts flow through /api/checkout with service_role) AND a security hole: anyone with the public NEXT_PUBLIC_SUPABASE_ANON_KEY could POST directly to `https://<project>.supabase.co/rest/v1/bookings` and insert arbitrary rows bypassing Zod validation. Applied via MCP `supabase-ratchawat__apply_migration` (migration version `20260412023040`). Mirrored in local file `supabase/migrations/20260412023040_drop_anon_insert_bookings_policy.sql` and reflected in `supabase/migrations/20260411000000_init.sql` so a fresh setup never recreates the policy. Verified post-fix: POST /api/checkout still returns a real Stripe Checkout URL (service_role bypass intact). Updated ARCHITECTURE.md §5 RLS section. Two related advisor warnings remain (admin_update_bookings + admin_manage_availability with USING true) and are deferred to Phase 5 Security. **MCP `supabase-ratchawat` configured** with PAT-based stdio transport, scoped to the Ratchawat project only via `--project-ref`. Currently running WITHOUT --read-only to apply this migration; should be re-locked to read-only after Phase 4 admin work that requires DDL is complete. |
| 2026-04-12 | **Phase 3 Booking System Full Stack END-TO-END VALIDATED:** All 4 booking flows tested live in dev. Real Stripe Checkout Sessions created (TEST mode), payments completed with test card 4242, webhook delivers `checkout.session.completed`, booking row updated to status='confirmed' in Supabase, client confirmation email delivered via Resend (sandbox `onboarding@resend.dev`). Three production bugs found and fixed during smoke test: (1) `toLocaleString()` hydration mismatch — FR browser locale rendered `2 000` while server-rendered `2,000`. Fixed by forcing `"en-US"` locale across 13 call sites in 9 files. (2) Wizards loaded with `?package=` reset to step 1 on every Continue/Back click — root cause: useEffect dependency array included `packages` (a freshly-computed array on every render), causing the preselect effect to re-fire infinitely and snap setStep(1). Fixed by hoisting packages to module scope and guarding the effect with a `useRef` initialized flag in TrainingWizard, PrivateWizard, CampStayWizard. (3) After successful payment, Stripe redirected to `https://ratchawatmuaythai.com/booking/confirmed?session_id=...` (production URL from `NEXT_PUBLIC_SITE_URL`) which hits the legacy Bluehost WordPress and is blocked by mod_security with HTTP 406 "Not Acceptable". Fixed by deriving the success_url origin from the incoming request headers in `/api/checkout/route.ts` instead of relying on `NEXT_PUBLIC_SITE_URL`. The env var stays correct for SSR metadata. **Resend sandbox limitation discovered:** the `onboarding@resend.dev` from-address can only deliver to the Resend account owner's email. Admin email to `chor.ratchawat@gmail.com` is rejected silently. Workaround in dev: set `ADMIN_EMAIL` to RD's own address. Permanent fix in Phase 6: verify the real domain in Resend after DNS access is available. **Created `GO-LIVE-CHECKLIST.md`** at the project root, the authoritative pre-launch checklist documenting every env var switch, dashboard action, DNS record, Stripe live-mode toggle, Resend domain verification, Supabase test-data cleanup, and rollback plan that must happen in Phase 6. ROADMAP Phase 6 now references the checklist explicitly. |
| 2026-04-11 | **Phase 3 Booking System Full Stack (code complete, Stripe seed pending):** Rebuilt entire booking subsystem. Deleted legacy `src/app/booking/BookingWidget.tsx` (flat 4-step widget with hardcoded packages, ignored pricing.ts). Rebuilt `/booking` landing with 4 clear type cards (Group Training, Private Lessons, Fighter Program, Camp Stay) with camp badges. Built 4 dedicated wizard routes: `/booking/training` (5 steps), `/booking/private` (5 steps with AvailabilityCalendar + 4 time slots filtered per date), `/booking/fighter` (5 steps with 3 tiers, conditional camp lock for stay tiers), `/booking/camp-stay` (4 steps with auto-computed checkout date and camp='both'). Rewrote `/booking/confirmed` as async Server Component resolving booking via `stripe.checkout.sessions.retrieve(session_id)` then querying Supabase via `createAdminClient` (service_role bypass RLS). Created 5 shared components in `src/components/booking/`: BookingWizard shell, DatePicker (react-day-picker wrapper), AvailabilityCalendar (Supabase-connected), ContactInfoForm, BookingReview. Created Supabase client helpers (`src/lib/supabase/{browser,server,admin}.ts`). Added Zod validation (`src/lib/validation/booking.ts`). Rewrote `/api/checkout` (Zod + Supabase insert + Stripe session creation with booking_id metadata) and `/api/webhooks/stripe` (signature verification + booking status update + Resend emails). Added Resend email templates (BookingConfirmed, BookingNotification as React Email components) + send helpers. Installed deps: react-day-picker, date-fns, @supabase/ssr, @supabase/supabase-js, @react-email/render, zod, tsx, dotenv. Created Supabase migration `supabase/migrations/20260411000000_init.sql` (bookings + availability_blocks tables with RLS, num_participants, time_slot, camp='both'). Created idempotent Stripe seed script `scripts/stripe-seed-products.ts`. Applied ARCHITECTURE.md 7 corrections (drop /booking/accommodation, rewrite Fighter to 3 tiers, add cross-camp note, add num_participants/time_slot/camp='both' to schema, confirmed page service_role pattern, priceTodo Stripe note). Renumbered ROADMAP.md: merged Phase 3 UI + Phase 4 Backend into new Phase 3 Full Stack, renumbered phases 4-6 (Admin / Security / Go-live). Reclassified `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly` from `camp-stay` to `fighter` bookingType. Smoke test partial PASS: all 6 booking routes 200, Zod validation rejects bad bodies with issue details, `/api/checkout` reaches Stripe step and fails cleanly on missing `stripePriceId` (expected), Supabase anon client reads availability_blocks (2 test blocks in place), service_role admin client reads bookings. `npm run lint` 0 errors, `npm run build` 0 errors (32 pages). |
| 2026-04-11 | **/accommodation rebuild + bungalow tier:** Removed Bo Phut accommodation section and all external partner lodging (US Hostel, guesthouses). Page now presents on-site stay at Plai Laem camp only: 12-photo horizontal carousel (6 rooms + 6 bungalows), Standard Rooms section (4 rooms, 8 amenities), Private Bungalows section (4 bungalows limited, 10 amenities including king bed, kitchenette, private terrace), 4-card Camp Stay Packages in 2x2 grid (1 week 8k / 2 weeks 15k / 1 month Room 18k / 1 month Bungalow 23k), new Fighter Program + Stay section (Fighter + Room ~20k, Fighter + Bungalow ~25k, prices TODO pending client confirmation), and 3 "Why stay here" benefits. Extended `src/content/pricing.ts` with `camp-stay-bungalow-monthly`, `fighter-stay-room-monthly`, `fighter-stay-bungalow-monthly`. Added Camp Stay section to `/pricing` page. Updated `/programs/fighter` to mention Fighter + Accommodation tiers. Updated Schema.org LodgingBusiness with amenityFeature, meta description, GEO passage, AUDIT-SEO.md PAGE 13. |
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
| 2026-04-02 | Created /booking page: 4-step BookingWidget (package > camp > date > confirm), reads ?package= and ?camp= query params, graceful Stripe fallback with WhatsApp/email contact. |
| 2026-04-02 | Created /booking/confirmed page: success confirmation with next steps (email, directions, what to bring). |
| 2026-04-02 | Connected pricing page links: each "Book X" button now passes ?package=ID to /booking (drop-in, weekly, monthly, private-single, private-10). |
| 2026-04-02 | Font change: replaced Outfit + Plus Jakarta Sans with Barlow Condensed (titles) + Inter (body). Updated layout.tsx, globals.css, CLAUDE.md. Removed font-preview page. |
| 2026-04-02 | Typography scale bump: H1 hero +1 step (36/48/60px), H1 pages +1 step (24/30/36px), H2 sections added lg:text-3xl (30px desktop). 22 pages + 2 components updated. |
| 2026-04-02 | **Component Elegance Redesign** (spec: docs/superpowers/specs/2026-04-02-component-elegance-redesign.md). Full visual refinement of all 12 components + 21 pages. Added: CSS tokens (shadow-card-glow, border-accent, filigree-opacity), btn-ghost/btn-link/badge-underline utilities, scrollbar-hide. GlassCard: top glow line, left border, bottom border, filigree number, hover lift. HeroSection: centered bold+outline, kicker, warm glow gradient, grid overlay, dual buttons, "Est. 2018". CTABanner: warm glow gradient bg, accent lines, kicker, dual buttons. FAQAccordion: numbered, +/- toggle, left border transitions. ProgramCard: underline badges, bottom separator. ContactForm: kicker label, uppercase labels, focus glow. LocationCard: "Open Now" overlay, bottom separator. ScheduleTable: dual render (desktop table + mobile day list). Navigation: diamond logo, Camps dropdown on hover, gradient top line. Footer: brand header row, gradient accent, 4 columns with orange headers. Breadcrumbs: accent line, uppercase, slash separator. All 21 pages: category labels on sections, filigree numbers, underline badges, btn-link/btn-primary, ghost buttons on CTAs, text-xs in cards. Visa steps: timeline vertical with dots. New hook: useScrollAnimation (Intersection Observer). |
| 2026-04-02 | Navigation: moved Camps first, added hover dropdown (Bo Phut / Plai Laem) instead of direct link. Pricing badges (Most Popular, Save 20%) repositioned inside card flow to avoid top line overlap. |
| 2026-04-11 | Production phase begins. Client accepted project. Created ROADMAP.md, ARCHITECTURE.md, spec (docs/superpowers/specs/2026-04-11-production-phase-design.md) and plan (docs/superpowers/plans/2026-04-11-phase-1-content-pricing.md). Updated PROJET-STATUS.md, CLAUDE.md with production mode. Created src/content/pricing.ts with all real prices. Updated all pages with correct prices. |

---

## 5. Known Issues

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | Low | Next.js 16 warns "middleware" is deprecated, use "proxy" | Won't fix now |
| 2 | Medium | All images are placeholders (no real photos) | Pending client content |
| 3 | High | Stripe TEST keys not in .env.local (waiting for client dashboard credentials) | Blocks full E2E smoke test of payment flow |
| 4 | Low | Fighter+Room and Fighter+Bungalow prices are approximate (20k/25k THB) | Pending client confirmation |
| 5 | RESOLVED 2026-04-12 | Supabase advisor lint flagged `anon_insert_bookings` as `rls_policy_always_true`. Policy was unused (all inserts go through /api/checkout with service_role) AND a security gap (anyone with the public anon key could POST raw rows bypassing Zod). Migration `20260412023040_drop_anon_insert_bookings_policy.sql` drops the policy. Verified post-fix: /api/checkout still creates bookings via service_role. | DONE |
| 5b | Medium | Supabase advisor still flags `bookings.admin_update_bookings` and `availability_blocks.admin_manage_availability` as `rls_policy_always_true` for the `authenticated` role. Acceptable for single-admin Phase 4 setup (one admin == full access). Must be tightened in Phase 5 with `profiles.role='admin'` check once auth schema exists. | Phase 5 Security |
| 6 | Medium | npm audit flags `next@16.0.0` high severity DoS (GHSA-q4gf-8mx6-v5v3). Fix requires `--force` upgrade to 16.2.3 | Deferred to Phase 5 Security |
| 7 | Low | Blog section not implemented | Planned post-launch |
| 8 | Low | Multi-language (FR/ES) not implemented yet | Planned post-launch |

---

## 6. Next Steps

> Read `ROADMAP.md` for the full phased plan and current task list.

### Current phase: Phase 4 -- Admin Dashboard

Phase 3 is complete in dev: 4 booking flows live, Supabase persistence, Stripe Checkout, Resend emails, end-to-end validated with test payment. See `ROADMAP.md` for Phase 4 task checklist.

**Pre-go-live config:** Read `GO-LIVE-CHECKLIST.md` before any production deployment. It documents all env var switches, Resend domain verification, Stripe LIVE mode toggle, Supabase test data cleanup, DNS records, and rollback plan.

### External blockers (actions required from RD)

| Blocker | Needed for | Action |
|---------|-----------|--------|
| **Stripe TEST keys from client dashboard** | Finish Phase 3 Task 25 (Stripe seed + webhook listener) | Client must share access to Stripe dashboard in TEST mode |
| Bluehost domain access | Phase 6 Go-live | Analyze + transfer domain |
| Fighter + accommodation final prices | Phase 5 Security & Quality | Confirm with client (currently 20k/25k approximate) |
| Real photos | Phase 5 Security & Quality | Client delivers photos |
| Resend domain verification | Phase 6 Go-live | Requires DNS access to ratchawatmuaythai.com (currently using sandbox `onboarding@resend.dev`) |

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
