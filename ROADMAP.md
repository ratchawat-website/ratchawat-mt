# Ratchawat Muay Thai — Roadmap

> **Source of truth for what to build.** Read this at the start of every session alongside PROJET-STATUS.md.
> Update task statuses as work progresses. Never start work without checking the current phase.

**Last updated:** 2026-04-11
**Current phase:** Phase 1 — Content & Pricing Foundation

---

## Phase 1 — Content & Pricing Foundation

**Status:** IN PROGRESS
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
- [ ] Commit

### Success criteria

`npm run build` passes. Every price shown on site matches `src/content/pricing.ts`. No "500 THB" reference remains.

---

## Phase 2 — Booking System UI

**Status:** PENDING
**Goal:** All 5 booking flows navigable. Training flow connected to Stripe (no availability needed). Other flows show correct UI with static placeholders for availability.
**Blocker:** Phase 1 complete.
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

## Phase 3 — Backend Integration

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
