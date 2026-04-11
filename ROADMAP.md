# Ratchawat Muay Thai — Roadmap

> **Source of truth for what to build.** Read this at the start of every session alongside PROJET-STATUS.md.
> Update task statuses as work progresses. Never start work without checking the current phase.

**Last updated:** 2026-04-11
**Current phase:** Phase 2 — Accommodation Page Redesign

---

## Phase 1 — Content & Pricing Foundation

**Status:** COMPLETE
**Goal:** Real prices on every page. Centralized price catalog. Production documentation in place.
**Blocker:** None.
**Spec:** `docs/superpowers/specs/2026-04-11-production-phase-design.md`
**Plan:** `docs/superpowers/plans/2026-04-11-phase-1-content-pricing.md`

### Tasks

- [x] Write spec + plan (2026-04-11)
- [x] Create `src/content/pricing.ts` — centralized price catalog
- [x] Create `ROADMAP.md` (this file)
- [x] Create `ARCHITECTURE.md`
- [x] Update `PROJET-STATUS.md` — production mode, real prices
- [x] Update `CLAUDE.md` — add /nextjs-security-scan, reference ROADMAP
- [x] Update `/pricing` page — complete price restructure (real prices + new sections)
- [x] Update `/programs/group-adults` — drop-in 400 THB, pricing links
- [x] Update `/programs/group-kids` — drop-in 300 THB, monthly 2500 THB
- [x] Update `/programs/private` — 800 THB solo, 600 THB group
- [x] Update `/programs/fighter` — 9500 THB, real includes
- [x] Update `/accommodation` — add Camp Stay packages section (Plai Laem)
- [x] Update `/` homepage — drop-in 400 THB
- [x] `npm run lint` — 0 errors
- [x] `npm run build` — 0 errors
- [x] Commit

### Success criteria

`npm run build` passes. Every price shown on site matches `src/content/pricing.ts`. No "500 THB" reference remains.

---

## Phase 2 — Accommodation Page Redesign

**Status:** COMPLETE
**Goal:** Rewrite `/accommodation` around on-site stay at Plai Laem camp. Remove all Bo Phut accommodation content. Present both standard rooms AND private bungalows visually with a 12-photo carousel, amenity lists, and Camp Stay Packages (4 tiers including bungalow). Add Fighter Program + Stay tier.
**Blocker:** Phase 1 complete.
**Spec:** `docs/superpowers/specs/2026-04-11-accommodation-page-redesign.md`
**Plan:** `docs/superpowers/plans/2026-04-11-accommodation-page-redesign.md`

### Tasks

- [x] Write spec + plan (2026-04-11)
- [x] Remove Bo Phut accommodation section and external partner lodging
- [x] Add 12-photo horizontal carousel (6 rooms + 6 bungalows) with captions
- [x] Add Standard Rooms description + 8 amenity tiles (4 rooms available)
- [x] Add Private Bungalows description + 10 amenity tiles (4 bungalows, limited)
- [x] Add "Why Stay Here" 3-card benefits section
- [x] Update Camp Stay Packages to 4 cards in 2x2 grid (1 week, 2 weeks, 1 month Room, 1 month Bungalow)
- [x] Add Fighter Program + Stay section (Fighter + Room ~20k, Fighter + Bungalow ~25k, TODO prices)
- [x] Update Schema.org LodgingBusiness with amenityFeature
- [x] Update meta description with 8,000 THB price anchor
- [x] Update GEO passage (mentions both rooms and bungalows, 8k weekly + 23k monthly anchors)
- [x] Extend `src/content/pricing.ts` with bungalow + fighter+stay entries
- [x] Update `/pricing` page with new Camp Stay section (4 cards)
- [x] Update `/programs/fighter` with Fighter + Accommodation options mention
- [x] Sync AUDIT-SEO.md PAGE 13
- [x] Update PROJET-STATUS.md correction history
- [x] /humanizer pass on visible copy
- [x] `npm run lint` — 0 errors
- [x] `npm run build` — 0 errors
- [x] Commit

### Success criteria

`npm run build` passes. No "Bo Phut" or "US Hostel" reference in `/accommodation`. Schema validates. Visual review passes at 375px, 768px, 1280px. Both room and bungalow tiers clearly differentiated. Fighter+Stay tier visible with TODO note on prices.

### Known follow-ups

- Fighter + Room / Fighter + Bungalow prices are approximate (20,000 / 25,000 THB). Client to confirm final prices — tracked in `pricing.ts` via `priceTodo` field. Remove `priceTodo` and update display once confirmed.

---

## Phase 3 — Booking System UI

**Status:** PENDING
**Goal:** All 5 booking flows navigable. Training flow connected to Stripe (no availability needed). Other flows show correct UI with static placeholders for availability.
**Blocker:** Phase 2 complete.
**Spec:** `docs/superpowers/specs/2026-04-11-production-phase-design.md` § 3

### Routes to build

- [ ] `/booking` — landing with 3 type-selection cards
- [ ] `/booking/training` — 5-step wizard (package, camp, date, contact, payment)
- [ ] `/booking/private` — wizard with static availability slots
- [ ] `/booking/accommodation` — wizard with static calendar
- [ ] `/booking/camp-stay` — wizard with static calendar + packages
- [ ] `/booking/fighter` — wizard with accommodation option
- [ ] `/booking/confirmed` — post-payment confirmation

### Components to build

- [ ] `BookingWizard` — shell with step indicator + navigation
- [ ] `DatePicker` — simple (no availability check)
- [ ] `AvailabilityCalendar` — static for now, wired to Supabase in Phase 3
- [ ] `ContactInfoForm` — name, email, phone, nationality
- [ ] `BookingReview` — summary before Stripe redirect

### Success criteria

All routes accessible. Training flow completes through Stripe Checkout. `npm run build` passes.

---

## Phase 4 — Backend Integration

**Status:** PENDING
**Goal:** Supabase + Stripe + Resend fully operational. All booking flows live with real availability.
**Blocker:** New Supabase account ready (client GitHub account required).

### Tasks

- [ ] Create Supabase project (client account)
- [ ] Run migration: `bookings` table
- [ ] Run migration: `availability_blocks` table
- [ ] Configure RLS policies (see ARCHITECTURE.md)
- [ ] Create Stripe products + prices for all `PriceItem.id` values
- [ ] Wire Stripe webhook (`/api/webhooks/stripe`)
- [ ] Configure Resend (domain verification)
- [ ] Build email templates (booking confirmed, admin notification)
- [ ] Wire `AvailabilityCalendar` to Supabase
- [ ] Wire all booking flows to Supabase + Stripe
- [ ] Set `.env.local` with all real keys
- [ ] End-to-end test all 5 booking flows

### External blockers

| Action | Owner |
|--------|-------|
| Create GitHub account for client | RD |
| Create Supabase account with client GitHub | RD |
| Get Stripe account access from client | RD |
| DNS access for Resend domain verification | RD (after domain transfer) |

### Success criteria

Full booking + payment + email confirmation works for all 5 flows.

---

## Phase 5 — Admin Dashboard

**Status:** PENDING
**Goal:** Gym owner can manage bookings and availability from `/admin`.
**Blocker:** Phase 4 complete.

### Tasks

- [ ] Build `/admin/login` — Supabase Auth
- [ ] Build `/admin/bookings` — paginated table, filters by type/status/date
- [ ] Build `/admin/bookings/[id]` — detail view + status update
- [ ] Build `/admin/availability` — calendar view, block/unblock dates + private slots
- [ ] Protect all `/admin/*` via middleware

### Success criteria

Admin logs in, views all bookings, updates availability. No unauthenticated access possible.

---

## Phase 6 — Security & Quality

**Status:** PENDING
**Goal:** Production-ready. Lighthouse targets met. Zero critical vulnerabilities.
**Blocker:** Phase 5 complete.

### Tasks

- [ ] Run `/nextjs-security-scan` — fix all critical + high findings
- [ ] Add rate limiting to `/api/*` routes
- [ ] Configure CORS
- [ ] Add Zod validation to all API routes
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100
- [ ] Audit all pages vs AUDIT-SEO.md (schemas, GEO, internal links)
- [ ] Update `llms.txt` + `llms-full.txt` with booking system info
- [ ] Confirm fighter + accommodation price (replace TODO)
- [ ] Photos: replace all `ImagePlaceholder` with real images (pending client)

### Success criteria

Security scan: 0 critical, 0 high findings. All Lighthouse targets met.

---

## Phase 7 — Go-live

**Status:** PENDING
**Goal:** Site live at ratchawatmuaythai.com.
**Blocker:** Domain transfer confirmed + Phase 6 complete.

### Tasks

- [ ] Analyze Bluehost domain situation
- [ ] Transfer domain or update nameservers
- [ ] Deploy to Vercel (production)
- [ ] Set all environment variables in Vercel
- [ ] Add 301 redirections in `next.config.js`
- [ ] Verify Google Search Console
- [ ] Configure Google Analytics (migrate G-SVH7KPWM2S or create new)
- [ ] Update 2 Google Business Profile fiches with new URLs
- [ ] Smoke test all booking flows on production
- [ ] Monitor for 48h post-launch

### Success criteria

Site accessible at ratchawatmuaythai.com. All booking flows confirmed working in production.
