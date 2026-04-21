# Ratchawat Muay Thai — Roadmap

> **Source of truth for what to build.** Read this at the start of every session alongside PROJET-STATUS.md.
> Update task statuses as work progresses. Never start work without checking the current phase.

**Last updated:** 2026-04-17
**Current phase:** Phase 5 — Pages & Content Completion

> **Phase ordering (post-Phase 4 restructure, 2026-04-15):** Before go-live we split the generic "Security & Quality" bucket into 4 sequential phases (5 → 8) so work happens in the right order. Go-live (Phase 9) is the FINAL phase, unblocked only when all content, media, SEO, and security/perf/a11y work is done. Do not skip ahead.

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

## Phase 5 — Pages & Content Completion

**Status:** PENDING
**Goal:** Every public page built, audited, and polished. Content matches reality (real prices, real addresses, real copy). All visible text passes through `/humanizer`.
**Blocker:** Phase 4 complete.

### Tasks

- [x] **Admin UX (2026-04-18)**: (1) Per-camp private-slot occupancy on `/admin/availability` and in `AdminDayDrawer`. Each slot row now shows `BP N/6 · PL N/6` color-coded (green 0, amber 1-5, red full), computed from `availability_blocks` rows where `type='private-slot'`, `is_blocked=true`, grouped by `(time_slot, camp)`. `BlockRecord` extended with `camp` + `is_blocked`. (2) "Back to site" link added at bottom of `AdminSidebar` (separator + ArrowUpLeft icon) and inside `AdminUserMenu` dropdown for mobile. Navigating to `/` does not log out (cookies persist). (3) Self-service password change on `/admin/account`: new `PasswordChangeForm` component (current + new + confirm, show/hide toggles, client-side validation). Backed by new `POST /api/admin/change-password` which re-verifies current password via `signInWithPassword` before calling `supabase.auth.updateUser({ password })`. Removed the "To change your password, use Supabase Dashboard or contact the developer" mention.
- [x] **Wave 1 — Fondations (2026-04-17)**: centralized schedule in `src/content/schedule.ts` (group 9:00–10:30 + 17:00–18:30; private 1h slots 7:00–17:00; fighter 7:30–10:00 + 16:00–18:30). Propagated to `/camps/*`, `/programs/*`, `/booking/fighter` (locked Plai Laem), `/pricing`, `/contact`, `llms.txt`, `llms-full.txt`. Homepage "Est. 2023" → "Since 2020". "7 days" → "6 days". Kids group 8–13 + private 3–13 (under 8 private only). Small group private 3 people max. Fighter program now Plai Laem only across all surfaces. Removed stale 90-day visa link from llms-full. `PRIVATE_SLOTS` now 9 slots (added 07:00, 10:00). `ScheduleTable` supports `fighter` type. `openingHours` schema Mo-Sa 07:00–18:30.
- [~] `/team` — **Structure built 2026-04-16 with placeholders** (Option A: Hero founder card + camp-filtered grid, 12 trainers, Schema.org Person per trainer, date-demo-ready). Centralized data in `src/content/trainers.ts`, also used by homepage circular gallery. **PENDING**: real names for 5 unknown trainers (7 confirmed: Kruu Wat + Tae, Kuan, Kit, Sing, Mam, Mon), real bios for all 12, real specialties, real photos. Bios and TBD names must be replaced before launch.
- [~] `/about` — Wave 3 done 2026-04-17: Kruu Wat story integrated (started 2020 Bo Phut with two pairs of gloves, expansion to Plai Laem, cultural transmission theme, respect/sportsmanship values), new "Ring Results" section listing Rajadamnern Stadium / One Lumpinee / RWS, hero kicker now "since 2020", GEO passage updated, AboutPage schema description updated. **TODO**: hero image (currently no hero image on /about — could use `/public/images/home/hero-trainers.webp` or dedicated Kruu Wat portrait once provided).
- [x] `/visa/dtv` — **Wave 5 complete 2026-04-17**: rebuilt with 3 DTV packages (20K/25K/33K THB), single-page application form at `/visa/dtv/apply` (14 fields in 4 sections), `/api/visa/dtv/apply` endpoint with Zod validation, Stripe checkout, Resend template `DTVApplicationReceived` (client + admin), `/visa/dtv/confirmed` success page. `dtv_applications` Supabase table + RLS live. Pending: end-to-end smoke test with Stripe test card 4242.
- [x] `/visa/90-days` — **DELETED 2026-04-17 (Wave 5a)**. Route removed, sitemap + footer + faq + home-page visa blurb + /visa/dtv See Also cleaned. AUDIT-SEO.md section removed. WordPress 301 redirects now point to /visa/dtv.
- [x] `/programs/group-adults` — schedule corrected (9:00 AM + 5:00 PM, Mon-Sat) 2026-04-17. Pricing, GEO still to verify.
- [x] `/programs/group-kids` — ages corrected to 8–13 group + 3–7 private 2026-04-17. Pricing verification pending.
- [~] `/programs/private` — verify pricing 800 THB solo / 600 THB group (3 max), slots now 9 (7:00, 8:00, 10:00–16:00). Kroo → Kruu spelling normalized 2026-04-16. Trainer name list in page needs sync with rebuilt `/team`. **Wave 6 done 2026-04-17**: 12h lead-time cutoff enforced (any date, not only same-day — interpretation A confirmed). Greyed-out slots + WhatsApp fallback box with pre-filled message. Server-side check in `/api/checkout`. Helpers `isSlotWithinCutoff`, `buildWhatsAppUrl`, `CAMP_WHATSAPP_*` in `src/content/schedule.ts`. Admin bypass intentional. **Timezone bug fixed** in `AvailabilityCalendar` + 4 wizards (date-fns `format()` instead of `toISOString().split("T")[0]`). **Per-camp slot capacity**: `PRIVATE_SLOT_CAPACITY = 6` simultaneous private sessions per camp per slot. Migration `20260417000000_availability_blocks_camp.sql` adds `camp` column to `availability_blocks` (with backfill). `AvailabilityCalendar` takes a `camp` prop and counts per-camp occupancy. `/api/checkout`, admin bookings API, and webhook now persist `camp` on `private-slot` blocks. Server rejects booking with 409 if camp slot capacity reached.
- [x] `/programs/fighter` — **Wave 4 done 2026-04-17**: full page redesign. Added "Built for Fighters, Not Tourists" narrative (differentiates from group classes, mentions Rajadamnern/One Lumpinee/RWS). New "Why This Program" section with 6 differentiator cards; "Keep Your Full Fight Purse" marked as featured/unique USP. New "Pricing" section with big 9,500 THB price card + 9-item "Everything included" checklist justifying the tier. Separate "Fighter + Stay" section with 2 tiers (20K room / 25.5K bungalow). Updated GEO passage, metadata title (mentions purse USP), courseSchema description, and llms-full.txt fighter block.
- [ ] `/faq` — full audit (partial update 2026-04-16: removed MuayThaiMap + stale trainer reference from female-friendly answer)
- [x] `/gallery` — **REMOVED 2026-04-16**. Photos and updates now live on Instagram/Facebook. Page deleted, footer link removed, sitemap entry removed. No redirect (site not deployed).
- [x] `/reviews` — **DONE 2026-04-16**. Real Google reviews (12 curated + 3 featured homepage), filter tabs (All/Bo Phut/Plai Laem), per-camp stats (5.0 / 255 Bo Phut + 5.0 / 141 Plai Laem = 396 total), language flags on non-EN, Schema.org per-camp AggregateRating + individual Review entries with `inLanguage`, GBP canonical URLs (`maps.app.goo.gl`), month-year dates (no "X weeks ago" staleness), `reviewDisplayDate()` helper via date-fns. Also fixed stale 9.3/131/MuayThaiMap references across `/about`, `/faq`, `llms.txt`, `llms-full.txt`. Homepage testimonials + AggregateRating + `organizationSchema.sameAs` also updated.
- [x] `/services` — **REMOVED 2026-04-16**. Page supprimée, footer + sitemap nettoyés. Content redundant with `/programs`.
- [x] `/contact` — **VERIFIED 2026-04-16**. Addresses, GPS coords, phone, email, hours, map embeds all correct. Schema.org ContactPage + Organization + per-camp LocalBusiness present. Fixed social handle inconsistency: `organizationSchema.sameAs` + `llms-full.txt` aligned with `/contact` page's canonical handles (Facebook `/Chor.RatchawatMuayThaiGym`, Instagram `/chor.ratchawatmuaythai`, TikTok `/@chor.ratchawat`). **⚠ TODO** : confirm with owner that these are the REAL social URLs (couldn't verify without access).
- [x] `/pricing` — Wave 1 done 2026-04-17: "7 days" → "6 days", "3 people/kids max" on small group private. Wave 2 done 2026-04-17: resident-10 + resident-20 Stripe products archived, new `resident-monthly` (3,000 THB / 1x/day) created, 3 DTV products created (`dtv-6m-2x` 20K, `dtv-6m-4x` 25K, `dtv-6m-unlimited` 33K). `src/content/pricing.ts` updated with new entries, BookingType/PriceCategory enums extended with `dtv`, Zod schemas updated. `/pricing` now shows single Resident card + new DTV section. **Wave 4 done 2026-04-21**: Fighter Program section densified to justify 9,500 THB. Added anchor line comparing to monthly 2x/day (7,000 THB → 9,500 THB for +2,500 THB). USP badge "Keep 100% of your fight purse". Bullets expanded from 5 to 9 (aligned with `/programs/fighter`). New "What's included that you'd pay extra for elsewhere" breakdown card: yoga ~500 THB, kettlebell ~500 THB, ice bath 150 THB, matchmaking ~2,000 THB + note on 30-50% purse commission elsewhere. Also fixed 3 lint errors pre-existing in `TeamCircularGallery.tsx` (refactored to `useSyncExternalStore`) and cleaned 2 warnings in `/programs/fighter` (unused `Check` import + dead `whatsIncluded` constant).
- [x] Run `/humanizer` on every visible copy block — **done 2026-04-21**. Full pass in 5 batches (A: homepage + /about + /team; B: /programs/*; C: /pricing + /accommodation + /camps/*; D: /booking/* + /visa/dtv/* audit-only; E: /reviews + /contact audit-only). Removed AI tells: "at the heart of", "every budget", "top trainers", "family energy", "same Ratchawat spirit", "Ideal for", rule-of-three promotional stacks, "The Camp Stay Experience". Bonus factual corrections: kids ages 5-15 → 8-13 group / 3+ private (homepage + /programs hub); camp hours 8 AM-8 PM → 7 AM-6:30 PM Mon-Sat (/camps/bo-phut + /camps/plai-laem, aligned with schedule + schema); trainer Kong (inexistant) → Tae (confirmed) on /programs/private + GEO passage. Also removed em dashes from 4 visible copy locations per CLAUDE.md rule. Commits: `272e386`, `2c941cc`, `eca11f0`, `448131b`.
- [ ] Update `Navigation.tsx` and `Footer.tsx` if any new pages are added

### Success criteria

Every public route returns a complete, human-copy page with real content. No "TODO", "TBD", lorem ipsum, or empty sections. Navigation reflects actual site structure.

---

### Wave 5 — /visa DTV rebuild (COMPLETE 2026-04-18)

**Status:** DONE 2026-04-18 (7 initial sub-waves + post-smoke-test hardening 5h). End-to-end smoke test executed by user 2026-04-18 surfaced 3 gaps, all fixed in 5h before final sign-off.

**Goal:** Replace the current /visa/dtv page with a complete DTV application flow: content + long-form application (14 fields) + Stripe Checkout for the 3 DTV packages + Resend email with docs within 24h. Delete /visa/90-days entirely (client dropped ED visa assistance).

**Validated decisions (from Wave 5 planning 2026-04-17):**
- **A1** — Content on `/visa/dtv`, dedicated application page at `/visa/dtv/apply` (14 fields is long, needs focus).
- **B1** — New dedicated `dtv_applications` table (DTV-specific fields like passport + arrival_date + currently_in_thailand do not belong in `bookings`).
- **C1** — Single-page form with sections (Personal / Passport / Travel / Package), not multi-step wizard (fewer clicks, faster completion).

**Form fields (source: `meeting-infos-client.md:75-88`, client example):**
First Name, Last Name, Country of Origin/Nationality, Phone (WhatsApp), Email, Passport Number, Passport Expiration Date, Currently in Thailand? (yes/no), Training start date, Planned arrival date in Thailand, Package (dtv-6m-2x / dtv-6m-4x / dtv-6m-unlimited), Commitment checkbox (must be true).

**Sub-wave execution order:**

- [x] **5a — Cleanup /visa/90-days**: delete `src/app/visa/90-days/page.tsx`, remove sitemap entry in `src/app/sitemap.ts`, remove any internal link (Footer, FAQ, About, llms.txt, llms-full.txt — llms-full already done in Wave 1). Update `AUDIT-SEO.md` to remove the /visa/90-days section. No redirect needed (site not deployed yet).

- [x] **5b — Supabase `dtv_applications` table**: migration file `supabase/migrations/20260417000001_dtv_applications.sql`. Columns: `id uuid pk default gen_random_uuid()`, `created_at timestamptz default now()`, `first_name`, `last_name`, `nationality`, `phone`, `email`, `passport_number`, `passport_expiry date`, `currently_in_thailand bool`, `training_start_date date`, `arrival_date date`, `price_id text` (must be a DTV id), `committed_at timestamptz` (when checkbox ticked), `stripe_session_id text`, `stripe_payment_intent_id text`, `stripe_payment_status text default 'pending'`, `status text default 'pending'` (pending / paid / docs_sent / cancelled / refused_voucher_issued), `docs_sent_at timestamptz`. RLS: anon can INSERT only (form submission); admins can SELECT/UPDATE. Indexes on `email`, `stripe_session_id`. Apply via Supabase MCP.

- [x] **5c — API endpoints**: `/api/visa/dtv/apply` (POST): Zod validation, insert into `dtv_applications`, create Stripe Checkout Session with `metadata: { dtv_application_id, type: 'dtv' }` using the DTV price id (20k/25k/33k), persist session id on the application row, return `{ url }` for client redirect. Validation schema in `src/lib/validation/dtv-application.ts`. Reuse `BookingType` includes `"dtv"` from Wave 2.

- [x] **5d — `/visa/dtv` page refonte**: hero (DTV 180 days, Soft Power Muay Thai), explainer sections (what DTV is, eligibility checklist, included benefits), 3 package cards (reuse data from `src/content/pricing.ts` `category === 'dtv'`), required documents list (passport, 500,000 THB bank statement, 10,000 THB embassy fee, enrollment letter), process timeline (apply → pay → docs in 24h → online DTV application → success), GEO passage mentioning Soft Power visa + 180 days + Koh Samui, CTA button pointing to `/visa/dtv/apply?package=<id>`. Schema.org `Service` + `Offer` per package.

- [x] **5e — `/visa/dtv/apply` form page**: client component with single-page form organized in 4 sections. react-hook-form or controlled state (reuse project patterns — `ContactInfoForm` style). Zod schema from 5c. Fields validation: passport expiry must be > 6 months out, arrival date must be before training start date, email format, phone digits. Pre-fill `price_id` from `?package=` query. Commitment checkbox required. Submit → POST `/api/visa/dtv/apply` → redirect to Stripe. Error handling: inline field errors + toast-level API errors with WhatsApp fallback CTA. Reuse `BookingWizard` / `BookingReview` visual primitives for consistency.

- [x] **5f — Email template + webhook**: new Resend template `src/lib/email/templates/DTVApplicationReceived.tsx` styled like `BookingConfirmed`. Subject: "Your DTV training application at Chor Ratchawat — we will send your documents within 24h". Content: thank-you, package summary, what happens next (24h docs delivery), embassy fee reminder, "no refund but training voucher if visa refused" disclaimer. Update `src/app/api/webhooks/stripe/route.ts`: detect DTV sessions via `metadata.type === 'dtv'`, update `dtv_applications.status = 'paid'` + `stripe_payment_status = 'paid'`, send email via Resend. On `checkout.session.expired` mark `status = 'cancelled'`.

- [x] **5g — Confirmation + docs + smoke test**: reuse `/booking/confirmed` for the success redirect OR create `/visa/dtv/confirmed` if the copy diverges enough. Run full flow end to end in Stripe test mode (apply, pay with 4242 card, confirm email received, verify DB row). Update PROJET-STATUS.md + ARCHITECTURE.md (new table + endpoint). Commit.

- [x] **5h — Post-smoke-test hardening (2026-04-18)**: smoke test by user revealed 3 gaps. (1) No mention of the official Thai e-visa portal anywhere → added `https://thaievisa.go.th/` link in `/visa/dtv` step 4 + `/visa/dtv/confirmed` step 2 + client email step 2. (2) Admin notification email was identical to client email (same "Hi X, Thanks for applying..." template) with no contact info → new dedicated template `DTVAdminNotification.tsx`, subject `[DTV] Name — Package — Amount paid`, full contact card (email, phone, WhatsApp, nationality), passport + travel blocks, 24h SLA callout, link to admin detail page. (3) Zero admin visibility on DTV applications → new admin list `/admin/dtv-applications` (status filter, 24h SLA badge on overdue-docs rows), detail `/admin/dtv-applications/[id]`, sidebar + bottom-tab entry, 3 admin API routes (`status` with state machine paid → docs_sent | cancelled | refused_voucher_issued, `notes` using `admin_notes` column, `resend-email`), new components (`DtvStatusBadge`, `DtvActions`, `DtvNotesEditor`).

**Dependencies already in place (from earlier waves):**
- Stripe products + prices created (Wave 2 — see PROJET-STATUS business info).
- `BookingType` enum contains `"dtv"` (Wave 2 — `src/lib/validation/booking.ts`, `admin-booking.ts`, `src/content/pricing.ts`).
- Resend already integrated for bookings (`src/lib/email/templates/BookingConfirmed.tsx`).

**Out of scope for Wave 5 (future):**
- Voucher issuance logic on visa refusal beyond the status transition (voucher generation / tracking still manual).

---

## Phase 6 — Photos & Media Assets

**Status:** PARTIAL (started 2026-04-13)
**Goal:** All placeholder images replaced with real photos. `next/image` used everywhere with proper `alt`, `sizes`, and weights optimized.
**Blocker:** Phase 5 complete (can't photograph content pages that don't exist).

### Tasks

- [x] **Done 2026-04-13/14** — see history below
- [ ] **Homepage Meet the Team (`TeamCircularGallery`)** — 12 trainer photos (Kruu Wat + 11 others). Component expects `{ name, role, image, alt, pos? }` per trainer in `src/app/page.tsx:119+`. Drop-in replacement when user provides `.jpeg` per trainer.
- [ ] **Plai Laem dedicated "Our Two Camps" homepage photo** (currently reuses `camp-view.png` — needs a distinct hero-style shot)
- [ ] **Bo Phut — "The Gym" section**: 2 square placeholders remaining in `/camps/bo-phut`
- [ ] **`/team` page**: full trainer portraits + any group shots
- [ ] **`/about` page**: founder/story photos if page added in Phase 5
- [ ] Audit remaining `ImagePlaceholder` usage across all pages, replace or remove
- [ ] Verify every `<Image>` has correct `sizes`, `alt`, `width`/`height` or `fill`
- [ ] Compress sources, prefer WebP/AVIF
- [ ] Above-the-fold images use `priority`

### Done (history)

- **2026-04-13** `/accommodation` fully replaced (6 room + 9 bungalow photos via `next/image`). Room amenity "Inside the camp" → "Fridge" + schema updated.
- **2026-04-13** `/camps/plai-laem` fully replaced (camp-view, ring-view, camp-inside).
- **2026-04-13** `/camps/bo-phut` main image replaced (camp-view).
- **2026-04-14** `/` homepage hero image (`hero-trainers.webp`): `HeroSection` upgraded with image-aware overlay (object-position 30%, vertical + radial gradient, grid softened). Established date updated to 2023.
- **2026-04-14** `/` homepage "Our Two Camps": aspect 4:3 → 16:9, Bo Phut real + Plai Laem temp photo, hover zoom.
- **2026-04-15** `/` homepage "Meet the Team": rebuilt as 3D `TeamCircularGallery` (12 cards, CSS 3D rotateY, perspective 2000px, drag/swipe + momentum + keyboard arrows + hint overlay, IntersectionObserver pause, prefers-reduced-motion fallback). Currently uses placeholder gradient per card pending real trainer photos.

### Success criteria

Zero `ImagePlaceholder` usage remains in production pages. All above-the-fold images load under 200KB. No CLS from images.

---

## Phase 7 — SEO & GEO Pass

**Status:** PENDING
**Goal:** Every page audited against `AUDIT-SEO.md`. Structured data complete and valid. GEO passages visible. `llms.txt` mirrors current site.
**Blocker:** Phase 5 + 6 complete (can't audit incomplete pages).

### Tasks

- [ ] Full `/seo` audit page-by-page vs `AUDIT-SEO.md` (metadata, schemas, internal links, GEO passage)
- [ ] Validate all Schema.org JSON-LD via `/seo-schema` (Organization, LocalBusiness, SportsActivityLocation, LodgingBusiness, BreadcrumbList, FAQ, Review, AggregateRating)
- [ ] `/seo-geo` audit — every page has a citable passage with business name + location + numbers
- [ ] `/seo-local` audit — both camps (Bo Phut + Plai Laem) with NAP consistency + local schema
- [ ] Internal linking audit — each page ≥ 3 contextual links to related pages
- [ ] Update `public/llms.txt` with booking system, visa info, team, real prices
- [ ] Update `public/llms-full.txt` with full content snapshot
- [ ] Verify `src/app/sitemap.ts` includes all new routes
- [ ] Verify `src/app/robots.ts`
- [ ] `/seo-images` — alt text audit, image filename conventions
- [ ] `/seo-content` — E-E-A-T signals, thin-content detection

### Success criteria

All AUDIT-SEO.md requirements met for every route. `llms.txt` reflects current site exactly. No orphan pages. Schema Validator returns 0 errors/warnings.

---

## Phase 8 — Security, Performance & Accessibility

**Status:** PARTIAL (Zod validation completed during Phase 4 audit)
**Goal:** Production-ready hardening. Lighthouse targets met. 0 critical vulnerabilities. WCAG 2.2 AA.
**Blocker:** Phase 7 complete.

### Tasks

- [x] Add Zod validation to all API routes (done 2026-04-12 in Phase 4 audit: `BookingRequestSchema`, `AdminBookingSchema`)
- [x] Confirm fighter + accommodation price (20,000 THB confirmed 2026-04-12)
- [ ] Run `/nextjs-security-scan` — fix all critical + high findings
- [ ] Add rate limiting to `/api/*` routes (client booking + admin + webhooks)
- [ ] Configure CORS for `/api/*`
- [ ] Secrets audit — no hardcoded keys, `.env.local` gitignored, Vercel envs ready
- [ ] Lighthouse Performance ≥ 90 (LCP, INP, CLS)
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 90
- [ ] Lighthouse SEO = 100
- [ ] `/accessibility` WCAG 2.2 AA audit — keyboard nav, contrast, ARIA, screen reader, focus
- [ ] `/performance` audit — bundle size, lazy loading, third-party scripts
- [ ] Test `prefers-reduced-motion` on TeamCircularGallery + other animated components
- [ ] Test on real iPhone + Android + Safari + Chrome + Firefox
- [ ] Verify reduced network (throttled 3G) — site remains usable

### Success criteria

0 critical, 0 high findings in security scan. All Lighthouse targets met on production build. Accessibility audit passes WCAG 2.2 AA. No console errors in production.

---

## Phase 9 — Go-live

**Status:** PENDING
**Goal:** Site live at ratchawatmuaythai.com.
**Blocker:** Phases 5, 6, 7, 8 all complete.
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

---

## Cross-phase completed items (historical)

- **2026-04-13 FIX CAMP ADDRESSES** — corrected Bo Phut (Soi Sunday Tambon Bo Put) + Plai Laem (20, 33 หมู่ที่ 5 ปลายแหลม ซอย 13) across 6 production files + llms-full.txt. Fixed Plai Laem GPS coords (9.5718, 100.0726). Fixed email template bug (Plai Laem was labeled "Soi Sunday"). Removed static "Open Now" badge + self-referencing camp links. Rewrote ScheduleTable with correct hours (8:00 Private, 9:30 Group, 11:00-17:00 Private, 17:00 Group, Mon-Sat, Sunday closed). Removed Fighter from schedule.
