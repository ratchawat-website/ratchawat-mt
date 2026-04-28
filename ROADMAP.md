# Ratchawat Muay Thai — Roadmap

> **Source of truth for what to build.** Read this at the start of every session alongside PROJET-STATUS.md.
> Update task statuses as work progresses. Never start work without checking the current phase.

**Last updated:** 2026-04-28
**Current phase:** Phase 9 — Go-live (in progress)

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

**Status:** DONE 2026-04-26
**Goal:** Every public page built, audited, and polished. Content matches reality (real prices, real addresses, real copy). All visible text passes through `/humanizer`.
**Blocker:** Phase 4 complete.

### Tasks

- [x] **Admin UX (2026-04-18)**: (1) Per-camp private-slot occupancy on `/admin/availability` and in `AdminDayDrawer`. Each slot row now shows `BP N/6 · PL N/6` color-coded (green 0, amber 1-5, red full), computed from `availability_blocks` rows where `type='private-slot'`, `is_blocked=true`, grouped by `(time_slot, camp)`. `BlockRecord` extended with `camp` + `is_blocked`. (2) "Back to site" link added at bottom of `AdminSidebar` (separator + ArrowUpLeft icon) and inside `AdminUserMenu` dropdown for mobile. Navigating to `/` does not log out (cookies persist). (3) Self-service password change on `/admin/account`: new `PasswordChangeForm` component (current + new + confirm, show/hide toggles, client-side validation). Backed by new `POST /api/admin/change-password` which re-verifies current password via `signInWithPassword` before calling `supabase.auth.updateUser({ password })`. Removed the "To change your password, use Supabase Dashboard or contact the developer" mention.
- [x] **Wave 1 — Fondations (2026-04-17)**: centralized schedule in `src/content/schedule.ts` (group 9:00–10:30 + 17:00–18:30; private 1h slots 7:00–17:00; fighter 7:30–10:00 + 16:00–18:30). Propagated to `/camps/*`, `/programs/*`, `/booking/fighter` (locked Plai Laem), `/pricing`, `/contact`, `llms.txt`, `llms-full.txt`. Homepage "Est. 2023" → "Since 2020". "7 days" → "6 days". Kids group 8–13 + private 3–13 (under 8 private only). Small group private 3 people max. Fighter program now Plai Laem only across all surfaces. Removed stale 90-day visa link from llms-full. `PRIVATE_SLOTS` now 9 slots (added 07:00, 10:00). `ScheduleTable` supports `fighter` type. `openingHours` schema Mo-Sa 07:00–18:30.
- [x] `/team` — **Structure built 2026-04-16, real data integrated 2026-04-26**. Hero founder card + camp-filtered grid + Schema.org Person per trainer. Now using authoritative data from client `trainers.md`: 10 trainers (was 12 placeholders, real count is 10). Roster: Kru Ratchawat (Founder, both camps, 25 years, 450 fights, C-license), Kru Kuan (Head Trainer Bo Phut, 3-time champion, 280 fights, C-license), Kru Mam (Plai Laem, Southern Thailand Champion 126 lbs, 500 fights), Kru Kit (Plai Laem, 200 fights), Kru Kheng (Plai Laem, national gold medalist, 300 fights, C-license), Kru Dam (both camps, 300 fights), Kru Tae (Plai Laem, 300 fights, clinch specialist), Kru Sing (Bo Phut, 2-time champion, 250 fights), Kru Jet (Bo Phut, 8 national amateur boxing golds, 470 fights), Kru Tan (Bo Phut, kids instructor). All bios humanized from client's ChatGPT-style draft. All real photos integrated (`/public/images/trainers/trainer-*.jpeg`). Renamed founder "Kruu Wat" → "Kru Ratchawat" everywhere (canonical name from client). Total `trainers.length` shown in header now reads `10`.
- [x] `/about` — Wave 3 done 2026-04-17 (Kru Ratchawat story integrated, Ring Results section, "since 2020" kicker, GEO + AboutPage schema). 2026-04-21 humanizer pass + "Kruu Wat" → "Kru Ratchawat" rename. **2026-04-26**: client confirmed no hero image needed for /about, closed.
- [x] `/visa/dtv` — **Wave 5 complete 2026-04-17**: rebuilt with 3 DTV packages (20K/25K/33K THB), single-page application form at `/visa/dtv/apply` (14 fields in 4 sections), `/api/visa/dtv/apply` endpoint with Zod validation, Stripe checkout, Resend template `DTVApplicationReceived` (client + admin), `/visa/dtv/confirmed` success page. `dtv_applications` Supabase table + RLS live. Pending: end-to-end smoke test with Stripe test card 4242.
- [x] `/visa/90-days` — **DELETED 2026-04-17 (Wave 5a)**. Route removed, sitemap + footer + faq + home-page visa blurb + /visa/dtv See Also cleaned. AUDIT-SEO.md section removed. WordPress 301 redirects now point to /visa/dtv.
- [x] `/programs/group-adults` — schedule corrected (9:00 AM + 5:00 PM, Mon-Sat) 2026-04-17. Pricing, GEO still to verify.
- [x] `/programs/group-kids` — ages corrected to 8–13 group + 3–7 private 2026-04-17. Pricing verification pending.
- [x] `/programs/private` — verify pricing 800 THB solo / 600 THB group (3 max), slots now 9 (7:00, 8:00, 10:00–16:00). 2026-04-26: trainer name list synced with real data (Kru Ratchawat / Kru Kuan / Kru Mam featured), real photos integrated via Next/Image (replaced ImagePlaceholder), GEO passage updated. **Wave 6 done 2026-04-17**: 12h lead-time cutoff enforced (any date, not only same-day — interpretation A confirmed). Greyed-out slots + WhatsApp fallback box with pre-filled message. Server-side check in `/api/checkout`. Helpers `isSlotWithinCutoff`, `buildWhatsAppUrl`, `CAMP_WHATSAPP_*` in `src/content/schedule.ts`. Admin bypass intentional. **Timezone bug fixed** in `AvailabilityCalendar` + 4 wizards (date-fns `format()` instead of `toISOString().split("T")[0]`). **Per-camp slot capacity**: `PRIVATE_SLOT_CAPACITY = 6` simultaneous private sessions per camp per slot. Migration `20260417000000_availability_blocks_camp.sql` adds `camp` column to `availability_blocks` (with backfill). `AvailabilityCalendar` takes a `camp` prop and counts per-camp occupancy. `/api/checkout`, admin bookings API, and webhook now persist `camp` on `private-slot` blocks. Server rejects booking with 409 if camp slot capacity reached.
- [x] `/programs/fighter` — **Wave 4 done 2026-04-17**: full page redesign. Added "Built for Fighters, Not Tourists" narrative (differentiates from group classes, mentions Rajadamnern/One Lumpinee/RWS). New "Why This Program" section with 6 differentiator cards; "Keep Your Full Fight Purse" marked as featured/unique USP. New "Pricing" section with big 9,500 THB price card + 9-item "Everything included" checklist justifying the tier. Separate "Fighter + Stay" section with 2 tiers (20K room / 25.5K bungalow). Updated GEO passage, metadata title (mentions purse USP), courseSchema description, and llms-full.txt fighter block.
- [x] `/faq` — **FULL AUDIT done 2026-04-21**. Rewrote all 10 original Q/A + added 4 new (Fighter Program, Bo Phut vs Plai Laem, trainers speak English, cancellation policy) → 14 total. **Factual corrections**: schedule `8 AM/4 PM/6 PM Mon-Fri + Sat morning` → `9:00 AM + 5:00 PM Mon-Sat, closed Sunday`; kids ages `5-15` → `8-13 group / 3+ private`; removed stale `90-day Muay Thai education visa` mention (DTV only now); accommodation answer updated with on-site rooms + bungalow at Plai Laem. **Humanizer**: dropped "Absolutely.", "in a safe environment", "We can point you in the right direction.", rule-of-three "fundamentals, discipline, and fitness". **GEO passage added** (was missing, required by CLAUDE.md).
- [x] `/gallery` — **REMOVED 2026-04-16**. Photos and updates now live on Instagram/Facebook. Page deleted, footer link removed, sitemap entry removed. No redirect (site not deployed).
- [x] `/reviews` — **DONE 2026-04-16**. Real Google reviews (12 curated + 3 featured homepage), filter tabs (All/Bo Phut/Plai Laem), per-camp stats (5.0 / 255 Bo Phut + 5.0 / 141 Plai Laem = 396 total), language flags on non-EN, Schema.org per-camp AggregateRating + individual Review entries with `inLanguage`, GBP canonical URLs (`maps.app.goo.gl`), month-year dates (no "X weeks ago" staleness), `reviewDisplayDate()` helper via date-fns. Also fixed stale 9.3/131/MuayThaiMap references across `/about`, `/faq`, `llms.txt`, `llms-full.txt`. Homepage testimonials + AggregateRating + `organizationSchema.sameAs` also updated.
- [x] `/services` — **REMOVED 2026-04-16**. Page supprimée, footer + sitemap nettoyés. Content redundant with `/programs`.
- [x] `/contact` — **VERIFIED 2026-04-16, social handles confirmed 2026-04-26**. Addresses, GPS coords, phone, email, hours, map embeds all correct. Schema.org ContactPage + Organization + per-camp LocalBusiness present. Canonical social handles: Facebook `/Chor.RatchawatMuayThaiGym`, Instagram `/chor.ratchawatmuaythai`. **TikTok removed 2026-04-26** (client confirmed no TikTok presence): cleaned from Footer, /contact page, `organizationSchema.sameAs`, `llms-full.txt`, AUDIT-SEO.md.
- [x] `/pricing` — Wave 1 done 2026-04-17: "7 days" → "6 days", "3 people/kids max" on small group private. Wave 2 done 2026-04-17: resident-10 + resident-20 Stripe products archived, new `resident-monthly` (3,000 THB / 1x/day) created, 3 DTV products created (`dtv-6m-2x` 20K, `dtv-6m-4x` 25K, `dtv-6m-unlimited` 33K). `src/content/pricing.ts` updated with new entries, BookingType/PriceCategory enums extended with `dtv`, Zod schemas updated. `/pricing` now shows single Resident card + new DTV section. **Wave 4 done 2026-04-21**: Fighter Program section densified to justify 9,500 THB. Added anchor line comparing to monthly 2x/day (7,000 THB → 9,500 THB for +2,500 THB). USP badge "Keep 100% of your fight purse". Bullets expanded from 5 to 9 (aligned with `/programs/fighter`). New "What's included that you'd pay extra for elsewhere" breakdown card: yoga ~500 THB, kettlebell ~500 THB, ice bath 150 THB, matchmaking ~2,000 THB + note on 30-50% purse commission elsewhere. Also fixed 3 lint errors pre-existing in `TeamCircularGallery.tsx` (refactored to `useSyncExternalStore`) and cleaned 2 warnings in `/programs/fighter` (unused `Check` import + dead `whatsIncluded` constant).
- [x] Run `/humanizer` on every visible copy block — **done 2026-04-21**. Full pass in 5 batches (A: homepage + /about + /team; B: /programs/*; C: /pricing + /accommodation + /camps/*; D: /booking/* + /visa/dtv/* audit-only; E: /reviews + /contact audit-only). Removed AI tells: "at the heart of", "every budget", "top trainers", "family energy", "same Ratchawat spirit", "Ideal for", rule-of-three promotional stacks, "The Camp Stay Experience". Bonus factual corrections: kids ages 5-15 → 8-13 group / 3+ private (homepage + /programs hub); camp hours 8 AM-8 PM → 7 AM-6:30 PM Mon-Sat (/camps/bo-phut + /camps/plai-laem, aligned with schedule + schema); trainer Kong (inexistant) → Tae (confirmed) on /programs/private + GEO passage. Also removed em dashes from 4 visible copy locations per CLAUDE.md rule. Commits: `272e386`, `2c941cc`, `eca11f0`, `448131b`.
- [x] Update `Navigation.tsx` and `Footer.tsx` if any new pages are added — **2026-04-26**: audit OK, both already cover all 16 public routes. Two Footer links (`/privacy`, `/terms`) previously pointed to non-existent routes; created stub pages with short placeholder copy (booking/payment/cancellation/training-risk basics + DTV refund-voucher policy). Stubs are `noIndex: true`. **Real legal content to be drafted in Phase 6** (see Phase 6 task).

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

**Status:** DONE 2026-04-26 (legal text pending owner validation, non-blocking)
**Goal:** All placeholder images replaced with real photos. `next/image` used everywhere with proper `alt`, `sizes`, and weights optimized.
**Blocker:** Phase 5 complete (can't photograph content pages that don't exist).

### Tasks

- [x] **Done 2026-04-13/14** — see history below
- [x] **Homepage Meet the Team (`TeamCircularGallery`)** — done 2026-04-26. All 10 trainers shown in circular gallery with real photos from `/public/images/trainers/`.
- [x] **Plai Laem "Our Two Camps" homepage photo** — done 2026-04-26. `camp-view.png` (3.5 MB) compressed to `camp-view.jpg` (547 KB, -85%) and reused on homepage + `/camps/plai-laem`. Client confirmed photo is correct.
- [x] **Bo Phut — "The Gym" section** — done 2026-04-26. 2 square placeholders replaced with `camp-inside.jpeg` + `camp-inside-2.jpeg`.
- [x] **`/about` page** — done 2026-04-26. Single 9:16 portrait of Kru Ratchawat (`trainer-ratachawat-2.jpeg`).
- [x] **`/programs/group-adults`** — done 2026-04-26. Single 9:16 image (`group-adult.jpg`).
- [x] **`/programs/group-kids`** — done 2026-04-26. Single 9:16 image (`groupf-kids.jpg`).
- [x] **`/programs/fighter`** — done 2026-04-26. Single 9:16 image (`program-fighter.jpg`).
- [x] **Audit `ImagePlaceholder` usage** — done 2026-04-26. Zero usage remains in production pages.
- [x] **`<Image>` config audit** — done 2026-04-26. All 18 `<Image>` tags verified with `alt`, `sizes`, `fill` or explicit dimensions.
- [x] **Compress sources** — done 2026-04-26. `camp-view.png` 3.5 MB → 547 KB. `camp-inside.jpg` 930 KB → 820 KB. `ring-view.jpg` 831 KB → 719 KB. `trainer-kit` 652 → 562 KB. `trainer-jet` 627 → 540 KB.
- [x] **`/team` page** — done 2026-04-26. All 10 trainer portraits use real photos from `/public/images/trainers/`.
- [x] **Above-the-fold `priority` audit** — done 2026-04-26. `HeroSection` (homepage) and `/team` featured trainer use `priority`. All other first `<Image>` tags sit below intro text blocks (textual hero), so lazy loading is correct.
- [x] **Legal pages content (provisional)** — done 2026-04-26. `/privacy` and `/terms` rewritten with full sectioned content using reasonable Thai/EU-aware defaults: who we are, what we collect, processors (Stripe, Supabase, Resend, Vercel), 2-year retention, GDPR rights, international transfers; booking/payment, cancellation matrix per program type, DTV voucher clause, training risk waiver, accommodation rules (check-in 14:00, check-out 11:00, electricity 8 THB/unit), conduct, photo consent, liability cap, governing law (Thai / Surat Thani jurisdiction). `noIndex: true` kept until owner validates the text. After validation: flip `noIndex` to `false` and bump sitemap priority.

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

**Status:** DONE 2026-04-26
**Goal:** Every page audited against `AUDIT-SEO.md`. Structured data complete and valid. GEO passages visible. `llms.txt` mirrors current site.
**Blocker:** Phase 5 + 6 complete (can't audit incomplete pages).

### Tasks

- [x] **Sitemap audit** — done 2026-04-26. Removed /blog (404), commented out /privacy + /terms (noIndex).
- [x] **robots.ts created** — done 2026-04-26. Allow /, disallow /admin, /api, /auth, /booking/confirmed, /visa/dtv/confirmed, /privacy, /terms.
- [x] **llms.txt + llms-full.txt refresh** — done 2026-04-26. Aligned to canonical pricing.ts and schedule.ts: drop-in 400 THB (was 500), real schedule, 10 trainers, no TikTok, no /blog.
- [x] **GEO citable passages** — done 2026-04-26. 16/16 public pages have a GEO citable passage; 3 strengthened with specific numbers (/programs, /programs/group-kids, /programs/private).
- [x] **Schema.org validation + fixes** — done 2026-04-26. Three bugs fixed (openingHoursSpecification → openingHours, AggregateRating bestRating 10 → 5, removed phantom /search SearchAction). LodgingBusiness on /accommodation enriched with geo, tel, image, checkinTime/checkoutTime, AggregateRating. Organization schema enriched with legalName + description.
- [x] **Metadata audit** — done 2026-04-26. 16/16 pages now have title ≤ 60 chars and description ≤ 155 chars (was 7 + 2 over budget).
- [x] **Internal linking** — done 2026-04-26. /accommodation GEO passage now links to /camps/plai-laem, /programs/fighter, /pricing.
- [x] **Alt text + filename audit** — done 2026-04-26. 18/18 alt texts descriptive and unique. Three filename typos fixed (kitchette, groupf-kids, ratachawat).
- [x] **E-E-A-T audit + Person schema enrichment** — done 2026-04-26. Trainer Person schemas now expose nationality (Thailand), image, hasCredential (C-license), and fight record in description. Review schemas with author + datePublished already in place.

### Success criteria

All AUDIT-SEO.md requirements met for every route. `llms.txt` reflects current site exactly. No orphan pages. Schema Validator returns 0 errors/warnings.

---

## Phase 8 — Security, Performance & Accessibility

**Status:** DONE 2026-04-26 (code-side audits complete; live Lighthouse + manual cross-browser deferred to Phase 9 staging validation)
**Goal:** Production-ready hardening. Lighthouse targets met. 0 critical vulnerabilities. WCAG 2.2 AA.
**Blocker:** Phase 7 complete.

### Tasks

- [x] **Add Zod validation to all API routes** — done 2026-04-12 in Phase 4 audit (`BookingRequestSchema`, `AdminBookingSchema`). Extended 2026-04-26 with `ContactRequestSchema` + DTV schema (Phase 5).
- [x] **Confirm fighter + accommodation price** — 20,000 THB confirmed 2026-04-12.
- [x] **`/nextjs-security-scan` run** — done 2026-04-26. 1 HIGH CVE resolved (next.js DoS GHSA-q4gf-8mx6-v5v3 -> bumped to 16.2.4). 2 MODERATE transitive accepted risk documented (postcss build-time XSS unreachable; uuid bounds check requires `buf` arg we never pass). 8 false positives documented (Supabase anon key by design public, password fields legitimate, JsonLd raw HTML pattern uses server-controlled JSON-LD data only).
- [x] **`/api/contact` hardening** — done 2026-04-26. Zod schema (email format, length limits, message 10-5000), HTML escape on every interpolated string in admin + user emails (closes injection vector + email harassment relay), honeypot field "website" (off-screen, tabIndex -1) wired into ContactForm.
- [x] **Secrets audit** — done 2026-04-26. No hardcoded keys in source, `.env.local` gitignored, only `.env.example` + `.env.local.example` tracked. All API routes use `process.env.*`.
- [x] **Security headers** — done 2026-04-26 in `next.config.ts`: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo off, payment self), Strict-Transport-Security 2y preload.
- [x] **`/performance` audit** — done 2026-04-26. 0 third-party scripts, lucide-react tree-shakable, server-only deps confined to API routes, fonts via next/font/google with display:swap. Three broken asset references found and fixed (default OG image 404, organizationSchema logo 404, articleSchema logo 404). Real logo + favicon set integrated.
- [x] **`/accessibility` audit** — done 2026-04-26. Skip link added (sr-only -> focus visible), `<main id="main-content" tabIndex={-1}>`, mobile toggle now has `aria-expanded` + `aria-controls` + dynamic aria-label, mobile menu has matching `id`, desktop dropdowns now keyboard-accessible via `group-focus-within` + aria-haspopup, all decorative icons have `aria-hidden="true"`. Already verified: html lang, prefers-reduced-motion globally, ContactForm labels, Image alt text, Footer icon button aria-labels.
- [x] **`prefers-reduced-motion`** — done. Global rule in `globals.css` neutralises all animations + per-component handling in TeamCircularGallery via `useSyncExternalStore`.
- [x] **P0 security checklist audit** — done 2026-04-27. All 8 items in `security-checklist.md` validated. Fixes applied: (1) `dtv_applications` RLS tightened from `USING (true)` to `is_admin()` (migration `align_dtv_policies_with_is_admin`); (2) Stripe webhook hardened — `runtime="nodejs"` + explicit `STRIPE_WEBHOOK_SECRET` guard; (3) idempotency table `processed_stripe_events` + dedup logic in webhook handler (migration `processed_stripe_events_dedup`); (4) race-safe `checkout.session.expired` cancellation (only when status='pending'); (5) middleware now gates `/api/admin/*` (JSON 401) in addition to `/admin/*` pages, defense-in-depth on top of per-route `is_admin()` checks. Two non-P0 follow-ups deferred to Phase 9 go-live: permanent Stripe LIVE webhook endpoint + Supabase Leaked Password Protection toggle. See PROJET-STATUS.md 2026-04-27 entry.
- [ ] **Rate limiting on `/api/*`** — DEFERRED to post-launch. Needs Upstash Redis or Vercel KV; low traffic at launch, security headers + Zod + honeypot mitigate the main spam vectors.
- [ ] **CORS on `/api/*`** — Next.js defaults to same-origin for API routes; explicit policy not required at this stage.
- [ ] **Live Lighthouse run** — DEFERRED to Phase 9 staging deployment. Targets: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100. Bundle stats hidden by Next 16 Turbopack output; need real preview deploy.
- [ ] **Live cross-browser test** — DEFERRED to Phase 9. iPhone + Android + Safari + Chrome + Firefox + throttled 3G smoke test on staging.
- [ ] **Live screen reader test** — DEFERRED to Phase 9. VoiceOver (Mac/iOS) + NVDA (Windows) walkthroughs of /, /booking, /contact, /accommodation.

### Success criteria

0 critical, 0 high findings in security scan ✓ (1 HIGH resolved). Code-side accessibility audit passes WCAG 2.2 AA ✓. Live Lighthouse + cross-browser + screen reader gating moved to Phase 9 staging.

---

## Phase 9 — Go-live

**Status:** IN PROGRESS (started 2026-04-27)
**Goal:** Site live at ratchawatmuaythai.com.
**Blocker:** Phases 5, 6, 7, 8 all complete.
**Reference:** **`GO-LIVE-CHECKLIST.md`** at the project root is the authoritative pre-launch checklist.

### Current blocker

Domain registrar transfer in progress (Bluehost → Cloudflare). Status "Wait for your domain to be released" since 2026-04-28. Auto-approve max 5 days, completes by ~2026-05-03. DNS already controlled via Cloudflare nameservers, so DNS records can be configured before transfer fully completes.

### A. Infrastructure — accounts & external services

- [x] **Cloudflare account created** (2026-04-27) with `ratchawat.website@gmail.com` + 2FA active.
- [x] **Vercel account created** (2026-04-27) with `ratchawat.website@gmail.com` + 2FA. Repo `ratchawat-mt` connected, first deploy live on `*.vercel.app` URL.
- [x] **Resend account + domain verification** — `ratchawatmuaythai.com` verified on Resend (DKIM/SPF/DMARC records added in Cloudflare DNS, validated 2026-04-28). Sending from `contact@ratchawatmuaythai.com` works in prod (no longer sandbox).
- [x] **Stripe LIVE mode** activated. LIVE secret + publishable keys generated.
- [x] **Stripe LIVE webhook endpoint** created, pointing to Vercel URL. Signing secret captured.
- [x] **Stripe LIVE products seeded** (2026-04-28) — 24 products created in LIVE Stripe account. Refactored `pricing.ts` schema to dual-mode: split `stripeProductId`/`stripePriceId` into parallel `*Test` + `*Live` fields. New helpers `isStripeLiveMode()`, `getStripePriceId(item)`, `getStripeProductId(item)` detect mode via `STRIPE_SECRET_KEY` prefix and return matching IDs. `/api/checkout` and `/api/visa/dtv/apply` updated to use the helper. Seed script auto-detects mode and writes to correct field. Local dev with TEST keys + Vercel prod with LIVE keys now coexist without manual swap.

### B. Domain transfer (Bluehost → Cloudflare)

- [x] Obtained EPP/auth code from previous developer (2026-04-27).
- [x] Domain unlocked at Bluehost (2026-04-27).
- [x] Cloudflare nameservers (`damiete` + `michelle`) replaced Bluehost nameservers (2026-04-27).
- [x] Cloudflare registrar transfer initiated + paid ~$10.44 (2026-04-28).
- [ ] **Wait for Bluehost release** (auto-approves within 5 days, by ~2026-05-03).
- [ ] Final transfer confirmation email from Cloudflare.

### C. DNS records (Cloudflare → Vercel)

- [ ] Add `A` record `@` → `76.76.21.21` (Vercel IP), proxy **DNS only** (grey cloud).
- [ ] Add `CNAME` record `www` → `cname.vercel-dns.com`, proxy **DNS only**.
- [ ] In Vercel project settings, add `ratchawatmuaythai.com` + `www.ratchawatmuaythai.com` as production domains.
- [ ] Wait for SSL certificate issuance (Let's Encrypt via Vercel, 5-30 min).
- [ ] Verify `https://ratchawatmuaythai.com` serves the site.

### D. Vercel environment variables (production)

- [x] `NEXT_PUBLIC_SITE_URL=https://ratchawatmuaythai.com`
- [x] `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- [x] `STRIPE_SECRET_KEY` (LIVE), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (LIVE), `STRIPE_WEBHOOK_SECRET` (LIVE)
- [x] `RESEND_API_KEY`
- [x] `RESEND_FROM_EMAIL=Ratchawat Muay Thai <contact@ratchawatmuaythai.com>` (added 2026-04-28 after domain verification)
- [x] `ADMIN_EMAIL=chor.ratchawat@gmail.com` (final value, not RD's dev address)
- [ ] Optional: `RESEND_BOOKINGS_FROM=Ratchawat Muay Thai <bookings@ratchawatmuaythai.com>` if separate sender for booking confirmations is desired.

### E. Code-level fixes during go-live

- [x] **`/api/contact` — env-driven config** (2026-04-28): `RESEND_FROM_EMAIL` + `ADMIN_EMAIL` now read from env, with `replyTo` set to visitor email; admin send error now bubbles up as 500 (was silently swallowed).
- [x] **`/lib/email/send.ts` — env-driven config** (2026-04-28): cascade `RESEND_BOOKINGS_FROM` → `RESEND_FROM_EMAIL` → NODE_ENV fallback. Eliminates hardcoded `bookings@` and the dev/prod NODE_ENV branch when env vars are set.

### F. Pre-launch validation (production environment)

- [ ] **Stripe webhook live delivery test** — Stripe Dashboard → Webhooks → "Send test webhook" → expect 200.
- [ ] **Real-card booking smoke test** — small amount (e.g. drop-in 400 THB), all 4 booking types: training, private, fighter, camp-stay. Verify booking row in Supabase, client + admin emails delivered. Refund via Stripe Dashboard.
- [ ] **DTV application smoke test** — submit form, complete payment, verify `dtv_applications` row + admin notification + client confirmation.
- [ ] **Contact form smoke test** on production domain.
- [ ] **Admin login** on production with real admin user.

### G. Pre-launch validation (deferred from Phase 8)

- [ ] **Live Lighthouse run** on production URL — targets Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100.
- [ ] **Live cross-browser test** — iPhone Safari, Android Chrome, desktop Safari/Chrome/Firefox, throttled 3G.
- [ ] **Live screen reader test** — VoiceOver + NVDA on /, /booking, /contact, /accommodation.

### H. Data & content cleanup

- [ ] **Clean Supabase test data** — purge `bookings`, `availability_blocks`, `dtv_applications`, `processed_stripe_events` rows from dev/test runs (task #57).
- [ ] **Real legal content validation** — `/privacy` and `/terms` currently provisional with `noIndex: true`. Owner reviews, then flip `noIndex: false` + add to sitemap.

### I. Search & analytics

- [ ] **Google Search Console** — add property, verify via DNS TXT record on Cloudflare, submit sitemap `https://ratchawatmuaythai.com/sitemap.xml`.
- [ ] **Google Analytics** — decide migration of `G-SVH7KPWM2S` or new GA4 property; add tracking ID env var + integrate.
- [ ] **301 redirects** for old WordPress URLs — add to `next.config.ts` if old URL list provided (checklist §5.3).
- [ ] **Google Business Profile** — update both Bo Phut + Plai Laem listings with new website URL and any updated NAP/hours.

### J. Post-launch

- [ ] **48h monitoring** — Vercel logs, Stripe events, Resend deliverability, Supabase advisor warnings.
- [ ] **Rollback plan ready** — checklist §10 documented, Cloudflare DNS revert path confirmed.

### Success criteria

Site accessible at ratchawatmuaythai.com over HTTPS. All 4 booking flows + DTV + contact form confirmed working with real card on production. All sign-off rows in `GO-LIVE-CHECKLIST.md` checked.

---

## Cross-phase completed items (historical)

- **2026-04-13 FIX CAMP ADDRESSES** — corrected Bo Phut (Soi Sunday Tambon Bo Put) + Plai Laem (20, 33 หมู่ที่ 5 ปลายแหลม ซอย 13) across 6 production files + llms-full.txt. Fixed Plai Laem GPS coords (9.5718, 100.0726). Fixed email template bug (Plai Laem was labeled "Soi Sunday"). Removed static "Open Now" badge + self-referencing camp links. Rewrote ScheduleTable with correct hours (8:00 Private, 9:30 Group, 11:00-17:00 Private, 17:00 Group, Mon-Sat, Sunday closed). Removed Fighter from schedule.
