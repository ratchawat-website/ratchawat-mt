# Ratchawat Muay Thai — Roadmap

> **Source of truth for what to build.** Read this at the start of every session alongside PROJET-STATUS.md.
> Update task statuses as work progresses. Never start work without checking the current phase.

**Last updated:** 2026-04-11
**Current phase:** Phase 3 — Booking System Full Stack

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

## Phase 3 — Booking System Full Stack

**Status:** IN PROGRESS
**Goal:** 4 booking flows fully functional in dev with real Supabase persistence, Stripe Checkout, and Resend emails. Replaces the legacy flat BookingWidget.
**Blocker:** Phase 2 complete.
**Spec:** `docs/superpowers/specs/2026-04-11-booking-system-full-stack-design.md`
**Plan:** `docs/superpowers/plans/2026-04-11-booking-system-full-stack.md`

### Routes to build

- [ ] `/booking` — landing with 4 type selection cards (training / private / fighter / camp-stay)
- [ ] `/booking/training` — 5-step wizard (package, camp, date, contact, payment)
- [ ] `/booking/private` — 5-step wizard (session type, camp, date+time-slot, contact, payment)
- [ ] `/booking/fighter` — 5-step wizard (info, tier, camp+date, contact, payment)
- [ ] `/booking/camp-stay` — 4-step wizard (package, check-in, contact, payment)
- [ ] `/booking/confirmed` — server component reading Supabase via service_role

### Components to build

- [ ] `BookingWizard` — shared shell with step indicator and navigation
- [ ] `DatePicker` — react-day-picker wrapper with design tokens
- [ ] `AvailabilityCalendar` — Supabase-connected calendar for private and camp-stay
- [ ] `ContactInfoForm` — name, email, phone, nationality, num_participants, notes
- [ ] `BookingReview` — summary and Pay button

### Backend to wire

- [ ] Supabase project (dedicated account) + migration for bookings + availability_blocks + RLS policies
- [ ] Stripe test-mode products (22 seeded) via `scripts/stripe-seed-products.ts`
- [ ] Rewrite `/api/checkout` with Zod + Supabase insert + Stripe Checkout Session
- [ ] Rewrite `/api/webhooks/stripe` with signature verification + booking update + email send
- [ ] Resend integration with BookingConfirmed and BookingNotification React templates

### Setup to perform

- [ ] Create Supabase project + run migration SQL
- [ ] Configure .env.local with Supabase + Stripe + Resend keys
- [ ] Run `npx tsx scripts/stripe-seed-products.ts` to create products
- [ ] Start `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for webhook

### Success criteria

All 4 booking flows payable end-to-end with Stripe test card `4242 4242 4242 4242`. Bookings appear in Supabase with `status='confirmed'`. Client and admin emails received. `npm run build` passes with 0 errors.

### Known follow-ups (deferred)

- Replace approximate prices for `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly` once client confirms
- Rate limiting, CORS, and Zod hardening on API routes (tracked in new Phase 5)
- Domain verification for Resend production sender (tracked in new Phase 6)

---

## Phase 4 — Admin Dashboard

**Status:** PENDING
**Goal:** Gym owner can manage bookings and availability from `/admin`.
**Blocker:** Phase 3 complete.

### Tasks

- [ ] Build `/admin/login` — Supabase Auth
- [ ] Build `/admin/bookings` — paginated table, filters by type/status/date
- [ ] Build `/admin/bookings/[id]` — detail view + status update
- [ ] Build `/admin/availability` — calendar view, block/unblock dates + private slots
- [ ] Protect all `/admin/*` via middleware

### Success criteria

Admin logs in, views all bookings, updates availability. No unauthenticated access possible.

---

## Phase 5 — Security & Quality

**Status:** PENDING
**Goal:** Production-ready. Lighthouse targets met. Zero critical vulnerabilities.
**Blocker:** Phase 4 complete.

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

## Phase 6 — Go-live

**Status:** PENDING
**Goal:** Site live at ratchawatmuaythai.com.
**Blocker:** Domain transfer confirmed + Phase 5 complete.

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
