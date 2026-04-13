# Ratchawat Muay Thai — Roadmap

> **Source of truth for what to build.** Read this at the start of every session alongside PROJET-STATUS.md.
> Update task statuses as work progresses. Never start work without checking the current phase.

**Last updated:** 2026-04-13
**Current phase:** Phase 6 — Go-live (Phase 4 audit complete, Phase 5 partial)

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

- ~~Fighter + Room / Fighter + Bungalow prices are approximate~~ DONE 2026-04-12: Fighter+Room confirmed at 20,000 THB. `priceTodo` removed.

---

## Phase 3 — Booking System Full Stack

**Status:** COMPLETE (in dev, end-to-end validated 2026-04-12)
**Goal:** 4 booking flows fully functional in dev with real Supabase persistence, Stripe Checkout, and Resend emails. Replaces the legacy flat BookingWidget.
**Blocker:** Phase 2 complete.
**Pre-go-live config:** see `GO-LIVE-CHECKLIST.md` for env var switches deferred to Phase 6.
**Spec:** `docs/superpowers/specs/2026-04-11-booking-system-full-stack-design.md`
**Plan:** `docs/superpowers/plans/2026-04-11-booking-system-full-stack.md`

### Routes to build

- [x] `/booking` — landing with 4 type selection cards (training / private / fighter / camp-stay)
- [x] `/booking/training` — 5-step wizard (package, camp, date, contact, payment)
- [x] `/booking/private` — 5-step wizard (session type, camp, date+time-slot, contact, payment)
- [x] `/booking/fighter` — 5-step wizard (info, tier, camp+date, contact, payment)
- [x] `/booking/camp-stay` — 4-step wizard (package, check-in, contact, payment)
- [x] `/booking/confirmed` — server component reading Supabase via service_role

### Components to build

- [x] `BookingWizard` — shared shell with step indicator and navigation
- [x] `DatePicker` — react-day-picker wrapper with design tokens
- [x] `AvailabilityCalendar` — Supabase-connected calendar for private and camp-stay
- [x] `ContactInfoForm` — name, email, phone, nationality, num_participants, notes
- [x] `BookingReview` — summary and Pay button

### Backend to wire

- [x] Supabase project (dedicated account) + migration for bookings + availability_blocks + RLS policies
- [x] Stripe test-mode products (22 seeded) via `scripts/stripe-seed-products.ts`
- [x] Rewrite `/api/checkout` with Zod + Supabase insert + Stripe Checkout Session
- [x] Rewrite `/api/webhooks/stripe` with signature verification + booking update + email send
- [x] Resend integration with BookingConfirmed and BookingNotification React templates

### Setup to perform

- [x] Create Supabase project + run migration SQL
- [x] Configure .env.local with Supabase + Stripe + Resend keys
- [x] Run `npx tsx scripts/stripe-seed-products.ts` to create products
- [x] Start `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for webhook
- [x] End-to-end smoke test: 4242 test card payment → booking confirmed in Supabase → client email delivered (2026-04-12)

### Success criteria

All 4 booking flows payable end-to-end with Stripe test card `4242 4242 4242 4242`. Bookings appear in Supabase with `status='confirmed'`. Client and admin emails received. `npm run build` passes with 0 errors.

### Known follow-ups (deferred)

- ~~Replace approximate prices for `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly` once client confirms~~ DONE 2026-04-12 (20,000 THB confirmed)
- Rate limiting, CORS, and Zod hardening on API routes (tracked in Phase 5)
- Domain verification for Resend production sender (tracked in Phase 6)

---

## Phase 4 — Admin Dashboard + Capacity Tracking

**Status:** COMPLETE (in dev, 2026-04-12)
**Goal:** Gym owner can manage bookings and availability from `/admin`. Room/bungalow capacity tracked and enforced.
**Blocker:** Phase 3 complete.
**Spec:** `docs/superpowers/specs/2026-04-12-admin-dashboard-design.md`
**Plan:** `docs/superpowers/plans/2026-04-12-admin-dashboard.md`

### Tasks

- [x] Centralize private time slots to 7 (08:00, 11:00-16:00) in `src/lib/config/slots.ts`
- [x] Supabase migration: `profiles` table + `is_admin()` function + tighten RLS policies (resolves pending #56)
- [x] Supabase migration: remap 09:00 → 08:00 in existing availability_blocks
- [x] Create `scripts/create-admin.ts` for one-time admin user setup
- [x] Calendar visual refonte: shared Tailwind tokens, remove default rdp CSS
- [x] Inventory model + capacity helpers (7 rooms, 1 bungalow)
- [x] Capacity check in `/api/checkout` (409 on overbooking)
- [x] Capacity-aware `AvailabilityCalendar` (public booking flow)
- [x] Middleware: protect `/admin/*`, remove legacy `/account`
- [x] Build `/admin/login` — Supabase Auth email/password
- [x] Build admin layout shell (sidebar, bottom tabs, user menu, signout)
- [x] Add admin icon button in public nav header
- [x] Build `/admin/bookings` — paginated table/cards, filters, search
- [x] Build `/admin/bookings/[id]` — detail + status transitions + notes + resend email
- [x] Build `/admin/availability` — calendar with occupancy display + day drawer
- [x] Build `/admin/account` — user info page
- [x] Hide public nav/footer on admin routes via ConditionalLayout

### Post-completion audit (2026-04-12/13)

**Spec:** `docs/superpowers/specs/2026-04-12-booking-availability-audit-design.md`
**Plan:** `docs/superpowers/plans/2026-04-12-booking-availability-audit.md`

- [x] Fix `availability_blocks` type constraint: `('private','private-slot','full')` — removed `camp-stay` and `all`
- [x] Unified date formatting via `src/lib/utils/date-format.ts` (7 files migrated)
- [x] Calendar month navigation: custom external nav (ChevronLeft/ChevronRight), centered grid
- [x] Block type filter fix in AvailabilityCalendar (full/private/private-slot)
- [x] Private booking → availability_blocks sync (create on checkout+webhook, delete on cancel)
- [x] Admin drawer: removed "Block camp-stay rooms", added "Create Booking" link
- [x] Admin "Create Booking": validation schema + API + form + page integration
- [x] Admin capacity check enforced: auto-compute end_date from package duration
- [x] Fighter+Room confirmed at 20,000 THB, /accommodation button updated
- [x] Camp Stay package names clarified: added "(Room)" to 1 Week and 2 Weeks
- [x] Applied all migrations to dev Supabase (rlmeafyvedpsflwohuyy)

### Success criteria

Admin logs in, views all bookings with filters, updates status, manages availability with capacity display. Overbooking prevented (client + admin). Calendar properly themed with month navigation. No unauthenticated access possible. `npm run build` passes.

---

## Phase 5 — Security & Quality

**Status:** PARTIAL (some tasks completed during Phase 4 audit, rest deferred to post-launch)
**Goal:** Production-ready. Lighthouse targets met. Zero critical vulnerabilities.
**Blocker:** Phase 4 complete.

### Tasks

- [ ] Run `/nextjs-security-scan` — fix all critical + high findings
- [ ] Add rate limiting to `/api/*` routes
- [ ] Configure CORS
- [x] Add Zod validation to all API routes (client: BookingRequestSchema, admin: AdminBookingSchema)
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100
- [ ] Audit all pages vs AUDIT-SEO.md (schemas, GEO, internal links)
- [ ] Update `llms.txt` + `llms-full.txt` with booking system info
- [x] Confirm fighter + accommodation price (20,000 THB confirmed 2026-04-12)
- [ ] **NEXT: Photos** — replace key `ImagePlaceholder` with real images (rooms, bungalow, camps). Priority before Phase 6.
- [x] **FIX CAMP ADDRESSES** — corrected 2026-04-13: Bo Phut (Soi Sunday Tambon Bo Put) + Plai Laem (20, 33 หมู่ที่ 5 ปลายแหลม ซอย 13) across 6 production files + llms-full.txt. Fixed Plai Laem GPS coords (9.5718, 100.0726). Fixed email template bug (Plai Laem was labeled "Soi Sunday"). Removed static "Open Now" badge + self-referencing camp links. Rewrote ScheduleTable with correct hours (8:00 Private, 9:30 Group, 11:00-17:00 Private, 17:00 Group, Mon-Sat, Sunday closed). Removed Fighter from schedule.

### Success criteria

Security scan: 0 critical, 0 high findings. All Lighthouse targets met.

---

## Phase 6 — Go-live

**Status:** PENDING
**Goal:** Site live at ratchawatmuaythai.com.
**Blocker:** Domain transfer confirmed + Phase 5 complete.
**Reference:** **`GO-LIVE-CHECKLIST.md`** at the project root is the authoritative pre-launch checklist. Read it from start to finish before executing any task in this phase. It documents every env var switch, dashboard action, DNS record, and rollback step that was deferred from Phase 3. Do not skip items.

### Tasks

- [ ] Read `GO-LIVE-CHECKLIST.md` end to end
- [ ] Analyze Bluehost domain situation (checklist §5.1)
- [ ] Transfer domain or update nameservers
- [ ] Resend domain verification (`ratchawatmuaythai.com`) — checklist §3
- [ ] Stripe LIVE mode switch + create webhook endpoint + seed live products — checklist §1.2 + §2
- [ ] Decide Supabase migration vs keep current — checklist §1.1 + §4
- [ ] Clean Supabase test data (availability_blocks, smoke test bookings) — checklist §4.1
- [ ] Deploy to Vercel (production)
- [ ] Set all environment variables in Vercel — checklist §1
- [ ] Switch `ADMIN_EMAIL` from RD's dev address to `chor.ratchawat@gmail.com` — checklist §1.4
- [ ] Add 301 redirections in `next.config.js` — checklist §5.3
- [ ] Verify Google Search Console — checklist §6.2
- [ ] Configure Google Analytics (migrate G-SVH7KPWM2S or create new) — checklist §6.1
- [ ] Update 2 Google Business Profile fiches with new URLs — checklist §6.3
- [ ] Smoke test all booking flows on production — checklist §9
- [ ] Monitor for 48h post-launch — checklist §10 rollback plan ready

### Success criteria

Site accessible at ratchawatmuaythai.com. All booking flows confirmed working in production. All sign-off rows in `GO-LIVE-CHECKLIST.md` checked.
