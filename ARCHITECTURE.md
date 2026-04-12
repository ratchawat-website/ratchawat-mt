# Ratchawat Muay Thai — Architecture

> **Technical reference.** Read this before writing any backend code, touching integrations, or designing new booking flows.
> This file documents decisions that are fixed. If you need to change something here, discuss with RD first.

**Last updated:** 2026-04-12

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

**Private lesson time slots:** `08:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00` (7 slots). Centralized in `src/lib/config/slots.ts`.

---

## 5. Capacity Model

**File:** `src/lib/admin/inventory.ts`

Fixed inventory constants (physical rooms, not configurable via UI):
- **Rooms:** 7 (standard rooms at Plai Laem)
- **Bungalows:** 1 (private bungalow at Plai Laem)

`getInventoryKey(priceId)` maps a price_id to its pool (`"rooms"` or `"bungalows"`). Returns `null` for non-accommodation bookings.

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
  stripe_payment_status text
);
```

**Notes on bookings schema:**
- `type` dropped the 'accommodation' value (no prices exist for that type)
- `num_participants` added for Private Group bookings (2-3 people, prices per person)
- `time_slot` added for Private lessons (09:00 / 11:00 / 14:00 / 16:00)
- `camp` accepts 'both' for Camp Stay bookings (client stays at Plai Laem but trains at either camp)

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
  created_by uuid references auth.users(id)
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

### Reading bookings from `/booking/confirmed`

The confirmed page is a Server Component that uses `SUPABASE_SERVICE_ROLE_KEY` server-side to bypass RLS. No public read policy is needed because:
1. The client is redirected with `?session_id={CHECKOUT_SESSION_ID}` from Stripe
2. The page retrieves the Stripe session server-side, extracts `metadata.booking_id`
3. The page queries Supabase via the admin client with that booking_id
4. Rendering happens on the server, so the service_role key never reaches the browser

---

## 6. Stripe Integration

### Flow
1. Client completes wizard — POST `/api/checkout` with `{ price_id, booking_data }`
2. API creates pending booking in Supabase
3. API creates Stripe Checkout Session (`success_url=/booking/confirmed?booking_id=X`)
4. Client redirected to Stripe
5. Stripe webhook `checkout.session.completed` — update booking to `confirmed` — send emails

### Products
One Stripe Product per `PriceItem.id`. Store `stripeProductId` and `stripePriceId` in `pricing.ts` once created.

Prices with `priceTodo` set (currently `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly`) are still created as Stripe products using their approximate `price` value. The `priceTodo` note is included in the Stripe product description so the client can update the price in the Stripe dashboard later without code changes.

---

## 7. Resend Email Flows

**Booking confirmed (client):** Booking summary, dates, camp address, what to bring, WhatsApp contact.
**Booking notification (admin):** New booking alert with full client + booking details.
Templates live in `src/lib/email/`.

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
