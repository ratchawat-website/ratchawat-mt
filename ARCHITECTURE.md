# Ratchawat Muay Thai — Architecture

> **Technical reference.** Read this before writing any backend code, touching integrations, or designing new booking flows.
> This file documents decisions that are fixed. If you need to change something here, discuss with RD first.

**Last updated:** 2026-05-18

---

## 1. Price Catalog

**File:** `src/content/pricing.ts`
**Pattern:** Static TypeScript data. Import `PRICES` array and filter by `id`, `category`, or `bookingType`.
**Migration path:** When Supabase is ready, replace the import with a `supabase.from('prices').select()` call. The shape is identical.

Usage example:
```typescript
import { PRICES } from "@/content/pricing"
const dropIn = PRICES.find(p => p.id === "drop-in-adult")
const groupPrices = PRICES.filter(p => p.category === "group")
```

**Billing mode (July 2026):** `PriceItem.billing?: "per-person" | "flat"`. Absent means `"per-person"` (historic behavior: amount = price x participants). `"flat"` items (`private-adult-group`, `private-adult-10pack`) charge one price per session regardless of participant count. The shared computation lives in `src/lib/booking/pricing.ts` (`computeBookingAmount`, `getStripeQuantity`) and is consumed by `/api/checkout`, `/api/admin/bookings`, and `PrivateWizard`. Never multiply `price * num_participants` by hand.

**Policy texts:** `src/content/policies.ts` holds client-provided policy strings (private cancellation, room reservation, DTV delivery/refusal, DTV custom-plan WhatsApp note). They are VERBATIM client copy: do not rewrite or run through humanizer. Consumed by the booking wizards, `/visa/dtv`, `/pricing`, `/terms`, and the confirmation emails.

---

## 2. Booking System Routes

```
/booking                     Landing — type selection (training / private / camp-stay / fighter)
/booking/training            Group classes wizard
/booking/private             Private lessons wizard (availability calendar)
/booking/camp-stay           MT + Accommodation combined wizard
/booking/fighter             Fighter Program wizard
/booking/confirmed           Post-payment confirmation (?booking_id=)
```

All "Book Now" links pass `?package=<price-id>` so wizards pre-select the package. Example: `/booking/training?package=monthly-1x`.

---

## 3. Wizard Flows

### Training (group classes)
1. Package selection (pre-filled from ?package=)
2. Camp choice — Bo Phut or Plai Laem
3. Start date — free date picker (no availability check)
4. Contact info — name, email, phone, nationality
5. Review + Stripe Checkout

### Private lessons
1. Session type — solo/group, adult/kids
2. Date — AvailabilityCalendar (reads availability_blocks, type IN ('full','private','private-slot'))
3. Time slot — from available slots on chosen date
4. Contact info
5. Review + Stripe Checkout

### Camp Stay (training + accommodation, Plai Laem only)
1. Package — 1 week / 2 weeks / 1 month Room / 1 month Bungalow
2. Check-in date — AvailabilityCalendar (reads availability_blocks, type IN ('full') + occupancy API)
3. Contact info
4. Review + Stripe Checkout

Note: Clients stay at Plai Laem but can train at either camp (Bo Phut or Plai Laem). Booking record uses camp='both'.

### Fighter Program
1. Info screen — what is included in the Fighter Program
2. Tier selection — Fighter Only (9,500 THB) / Fighter + Room (20,000 THB) / Fighter + Bungalow (25,500 THB)
3. Camp + start date — Bo Phut or Plai Laem for Fighter Only, auto-locked to Plai Laem with AvailabilityCalendar for stay tiers
4. Contact info
5. Review + Stripe Checkout

Note: Fighter+Room confirmed at 20,000 THB (2026-04-12).

---

## 4. Calendar Components

**DatePicker** — used for training start date, fighter start date. react-day-picker v9 with full Tailwind dark theme (shared tokens in `src/components/ui/calendar-tokens.ts`). No Supabase.

**AvailabilityCalendar** — used for private and camp-stay flows. Fetches `availability_blocks` from Supabase + occupancy data from `/api/availability/occupancy`. Block type filter depends on booking type: private fetches `('full','private','private-slot')`, camp-stay/fighter fetches only `('full')`. Blocked dates (manual blocks OR capacity full) = greyed out, unselectable. For multi-day stays, a check-in date is blocked if ANY night in the resulting range is at capacity. Private bookings auto-create `availability_blocks` rows (type='private-slot') on checkout, deleted on cancellation.

**Date formatting** — unified via `src/lib/utils/date-format.ts`. Short format `formatDateShort` (Apr 12, 2026) for tables, cards, lists. Long format `formatDateLong` (Saturday, April 12, 2026) for review steps and detail pages.

**Private lesson time slots (19, client-approved 2026-07-10):** `07:00, 07:30, 08:00, 08:30, 09:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 18:30, 19:00`. 30-minute starts, sessions of 60 minutes: two consecutive starts overlap, which the client explicitly accepts (capacity is counted per start, not per overlap window). Source of truth: `src/content/schedule.ts` (`PRIVATE_SLOT_TIMES`), re-exported by `src/lib/config/slots.ts`. Display grouping for the wizard: `SLOT_GROUPS` (Morning / Midday / Afternoon / Evening). Booking cutoff: `getCutoffHoursForSlot` returns 12h for slots starting before 09:30 (`EARLY_CUTOFF_BEFORE`), 2h otherwise.

**AvailabilityCalendar units:** the calendar sums `availability_blocks.units` (legacy rows count as 1) and accepts a `unitsRequested` prop; a slot greys out when `occupied + unitsRequested > PRIVATE_SLOT_CAPACITY`.

---

## 5. Capacity Model

**File:** `src/lib/admin/inventory.ts`

Fixed inventory constants (physical rooms, not configurable via UI):
- **Rooms:** 7 (standard rooms at Plai Laem)
- **Bungalows:** 1 (private bungalow at Plai Laem)

`getInventoryKey(priceId)` maps a price_id to its pool (`"rooms"` or `"bungalows"`). Returns `null` for non-accommodation bookings.

**Trainer capacity (private slots, July 2026 vague 2a):** `PRIVATE_SLOT_CAPACITY = 6` now counts TRAINERS per (date, slot, camp), not bookings. Each `availability_blocks` row of type `private-slot` carries `units`: a 1-on-1 booking for N participants consumes N trainers (`capacity: "per-participant"` on the PriceItem, `getCapacityUnits` in `src/lib/booking/pricing.ts`), a group session or 10-pack consumes 1. `getSlotOccupancy` sums units. Assumed limit (client decision 2026-07-10): 30-minute starts overlap over 60-minute sessions and slots are counted independently; a trainer teaching at 10:30 is not deducted from the 11:00 pool.

**Occupancy helpers:** `src/lib/admin/availability.ts`
- `getOccupancyMap(key, from, to)` — counts active bookings per night (hotel logic: checkout morning frees the night)
- `checkRangeAvailability(key, start, end)` — returns `{ ok: true }` or `{ ok: false, conflictDate }`
- Used by `/api/checkout` (overbooking prevention) and `/api/availability/occupancy` (public calendar)

---

## 6. Supabase Data Model

### Table: bookings

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('training','private','camp-stay','fighter')),
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','completed')),
  price_id text not null,
  price_amount integer not null,
  num_participants integer not null default 1,
  start_date date not null,
  end_date date,
  time_slot text,
  camp text check (camp in ('bo-phut','plai-laem','both')),
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  client_nationality text,
  notes text,
  stripe_session_id text,
  stripe_payment_intent_id text,
  stripe_payment_status text,
  booking_group_id uuid -- added 2026-07-14 (migration 20260711000000)
);
```

**Notes on bookings schema:**
- `type` dropped the 'accommodation' value (no prices exist for that type)
- `num_participants` added for Private Group bookings (2-3 people, prices per person)
- `time_slot` added for Private lessons (see `PRIVATE_SLOT_TIMES` in `src/content/schedule.ts`)
- `camp` accepts 'both' for Camp Stay bookings (client stays at Plai Laem but trains at either camp)
- `booking_group_id` (nullable, partial index `idx_bookings_group`) links the N rows of a multi-session private cart paid in ONE Stripe payment. The webhook confirms/cancels the whole group; admin cancellation stays per session. Null for legacy and non-private bookings.

### Table: availability_blocks

```sql
create table availability_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('private','private-slot','full')),
  date date not null,
  time_slot text,
  is_blocked boolean not null default true,
  reason text,
  created_by uuid references auth.users(id),
  units integer not null default 1 -- added 2026-07-14: trainers consumed by this block
);
```

### Table: profiles

```sql
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

**Function:** `is_admin()` — returns boolean, `security definer`, `set search_path = ''`. Checks `profiles.role = 'admin'` for current `auth.uid()`.

### RLS Policies

```sql
-- bookings: NO insert policy for anon. All inserts go through /api/checkout
-- which uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS).
alter table bookings enable row level security;
create policy "admin_read_bookings" on bookings
  for select to authenticated using (public.is_admin());
create policy "admin_update_bookings" on bookings
  for update to authenticated using (public.is_admin());

-- availability_blocks: anyone can read, only admin can write
alter table availability_blocks enable row level security;
create policy "public_read_availability" on availability_blocks for select to anon using (true);
create policy "admin_manage_availability" on availability_blocks
  for all to authenticated using (public.is_admin());

-- profiles: user can read own row
alter table profiles enable row level security;
create policy "users_read_own_profile" on profiles
  for select to authenticated using (auth.uid() = user_id);
```

All admin policies gated by `is_admin()`. Supabase security advisor: 0 lints.

### Migration template (mandatory from 2026-10-30)

Starting **2026-10-30**, Supabase removes the default `public` schema grants to `anon`, `authenticated`, and `service_role` on **all existing projects** (including ours, `rlmeafyvedpsflwohuyy`). Any new table created after that date without explicit grants will be invisible to `supabase-js` and PostgREST, and any attempt to read/write through the Data API will return a `42501` Postgres error.

**Existing tables keep their grants — no action needed on the 5 current tables.** This rule applies only to **future migrations**.

Every new migration that creates a table in `public` MUST follow this template:

```sql
-- 1. Create table
create table public.my_table (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
  -- ... other columns
);

-- 2. Enable RLS (always)
alter table public.my_table enable row level security;

-- 3. Explicit grants (REQUIRED from 2026-10-30)
-- Pick only what the app actually needs. Default to least privilege.
grant select on public.my_table to anon;
grant select, insert, update on public.my_table to authenticated;
grant all on public.my_table to service_role;

-- 4. RLS policies
create policy "..." on public.my_table for select to anon using (...);
create policy "..." on public.my_table for select to authenticated using (...);
-- service_role bypasses RLS, no policy needed for it.
```

**Notes:**
- If a table is **server-only** (inserts via API routes using `SUPABASE_SERVICE_ROLE_KEY` only), give nothing to `anon` and `authenticated`. Only `service_role` needs grants. Example: `processed_stripe_events`.
- If a table is **publicly readable** (e.g. `availability_blocks` for the public calendar), `grant select on ... to anon;` is enough.
- **Never** copy the old permissive default (`grant all on ... to anon`). RLS is a second line of defense, not the only one.
- After applying a migration, verify with: `SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_schema='public' AND table_name='my_table';`

### Reading bookings from `/booking/confirmed`

The confirmed page is a Server Component that uses `SUPABASE_SERVICE_ROLE_KEY` server-side to bypass RLS. No public read policy is needed because:
1. The client is redirected with `?session_id={CHECKOUT_SESSION_ID}` from Stripe
2. The page retrieves the Stripe session server-side, extracts `metadata.booking_id`
3. The page queries Supabase via the admin client with that booking_id
4. Rendering happens on the server, so the service_role key never reaches the browser

---

## 6. Stripe Integration

### Flow
1. Client completes wizard — POST `/api/checkout` with `{ price_id, booking_data }`. Private bookings send `sessions: [{ date, time_slot }]` (1-10 entries, multi-day cart).
2. API creates pending booking(s) in Supabase. Private: one row per session sharing a `booking_group_id`, one `private-slot` block per session with `units`, full rollback if any insert or the insert-then-verify re-count fails.
3. API creates ONE Stripe Checkout Session (quantity = Stripe quantity x number of sessions; metadata `booking_id` = first row + `booking_group_id` for carts).
4. Client redirected to Stripe.
5. Stripe webhook `checkout.session.completed` — updates the booking (or the whole group when `booking_group_id` is present) to `confirmed` — sends ONE email listing every session (`BookingEmailData.sessions`). `checkout.session.expired` cancels the group and deletes its blocks.

### Products
One Stripe Product per `PriceItem.id`. Store `stripeProductId` and `stripePriceId` in `pricing.ts` once created.

**Price sync (July 2026):** `scripts/stripe-seed-products.ts` now runs a sync pass after seeding. For every already-seeded item whose catalog `price` differs from the active Stripe price, it creates a new Price on the same Product, sets it as `default_price`, refreshes name/description, and rewrites the price ID in `pricing.ts`. The OLD price is deliberately left active (zero-downtime cutover: deployed code keeps referencing it until the next deploy). Archive old prices manually in the Stripe dashboard AFTER the deploy is verified.

Prices with `priceTodo` set (currently `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly`) are still created as Stripe products using their approximate `price` value. The `priceTodo` note is included in the Stripe product description so the client can update the price in the Stripe dashboard later without code changes.

---

## 7. Resend Email Flows

**Booking confirmed (client):** Booking summary, dates, camp address, what to bring, WhatsApp contact.
**Booking notification (admin):** New booking alert with full client + booking details.
**DTV application received (client):** Package summary, applicant details, 24h docs reminder, embassy fee reminder, voucher-on-refusal disclaimer.
**DTV admin notification:** Same template sent to admin for every new paid DTV application.
Templates live in `src/lib/email/templates/`.

---

## 7b. DTV Visa Flow (Phase 5 Wave 5)

```
/visa/dtv                    Content page — Soft Power, 3 packages, docs, process, FAQ
/visa/dtv/apply              Single-page form (14 fields, 4 sections)
/visa/dtv/confirmed          Post-payment confirmation (?session_id=)
POST /api/visa/dtv/apply     Zod validation → insert dtv_applications → Stripe Session
```

**Table:** `dtv_applications` (separate from `bookings` because of passport + arrival_date + visa-specific fields). RLS mirrors `bookings` — admin `select`/`update`, inserts via service role only. Migration: `supabase/migrations/20260417000001_dtv_applications.sql`. Column `date_of_birth date` (nullable, migration `supabase/migrations/20260710000000_dtv_date_of_birth.sql`) added July 2026; applications submitted before it have no value, all surfaces handle `null` with a `-` fallback.

**Packages:** `dtv-6m-2x` (20K THB), `dtv-6m-4x` (25K THB, popular), `dtv-6m-unlimited` (35K THB, unlimited GROUP training, Fighter Program not included). Source of truth: `src/content/pricing.ts` `category === 'dtv'`.

**Stripe metadata:** `{ type: 'dtv', dtv_application_id: <uuid> }` — the webhook branches on `type === 'dtv'` before touching `bookings`.

**Validation highlights:** passport expiry must be at least 6 months out from today; arrival date must be on or before training start date; commitment checkbox must be `true` (Zod literal).

**Refund policy (July 2026, client verbatim in `src/content/policies.ts`):** if the visa is refused, 50% refund on request within 3 weeks of payment with official proof of refusal, plus a 50% training voucher of the same value. Documents delivered within 24h of payment on business days.

**Official portal:** All customer-facing surfaces (site + email) link to `https://thaievisa.go.th/` — the Thai e-visa portal where the applicant uploads our documents and pays the 10,000 THB embassy fee.

**Admin flow:**
```
/admin/dtv-applications             List with status filter, 24h SLA badge on overdue rows
/admin/dtv-applications/[id]        Detail + actions
POST /api/admin/dtv-applications/[id]/status        — transitions: paid → docs_sent | cancelled | refused_voucher_issued
POST /api/admin/dtv-applications/[id]/notes         — admin_notes column
POST /api/admin/dtv-applications/[id]/resend-email  — re-send DTVApplicationReceived to client
```

**Status machine:**
- `pending` (row exists, payment not complete) → `cancelled` on `checkout.session.expired`
- `paid` (webhook received) → `docs_sent` (sets `docs_sent_at`) | `cancelled` | `refused_voucher_issued`
- `docs_sent` → `refused_voucher_issued`
- `cancelled` and `refused_voucher_issued` are terminal.

**Admin notification email is a separate template** (`DTVAdminNotification.tsx`) from the client confirmation (`DTVApplicationReceived.tsx`): subject `[DTV] Name — Package — Amount paid`, full client contact card (email + phone + WhatsApp + nationality), passport, travel, 24h SLA reminder, link back to the admin dashboard detail page.

---

## 8. Admin Dashboard

```
/admin                     — redirect to /admin/bookings (via route group)
/admin/login               — Supabase Auth (email + password), standalone layout
/admin/bookings            — paginated table/cards, filters (type/status/date/search)
/admin/bookings/[id]       — detail view + status transitions + notes + resend email
/admin/availability        — monthly calendar with occupancy (R x/7, B x/1) + day drawer
/admin/account             — user info
```

**Route structure:** Uses `(dashboard)` route group so `/admin/login` has no shell, all other admin routes share `AdminShell` (sidebar + top bar + bottom tabs).

**API routes:**
```
POST /api/admin/signout                    — sign out
POST /api/admin/bookings                   — create manual booking (admin, no Stripe)
POST /api/admin/bookings/[id]/status       — update booking status (+ delete private-slot block on cancel)
POST /api/admin/bookings/[id]/notes        — update internal notes
POST /api/admin/bookings/[id]/resend-email — resend confirmation email
POST /api/admin/availability               — create availability block (types: private, private-slot, full)
DELETE /api/admin/availability/[id]        — delete availability block
GET /api/availability/occupancy            — public occupancy data for calendar
```

**Auth:** Middleware checks `auth.getUser()` + `is_admin()` RPC on all `/admin/*` except `/admin/login`. Layout double-gates with same check. Admin user created via `scripts/create-admin.ts`.

**Public nav:** `AdminNavButton` in header — Lock icon (not logged in) or LayoutDashboard icon (admin). ConditionalLayout hides public nav/footer on admin routes.

---

## 9. Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Site
NEXT_PUBLIC_SITE_URL=https://ratchawatmuaythai.com
ADMIN_EMAIL=chor.ratchawat@gmail.com
```
