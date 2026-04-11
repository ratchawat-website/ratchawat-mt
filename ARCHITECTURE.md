# Ratchawat Muay Thai — Architecture

> **Technical reference.** Read this before writing any backend code, touching integrations, or designing new booking flows.
> This file documents decisions that are fixed. If you need to change something here, discuss with RD first.

**Last updated:** 2026-04-11

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
2. Date — AvailabilityCalendar (reads availability_blocks, type='private')
3. Time slot — from available slots on chosen date
4. Contact info
5. Review + Stripe Checkout

### Camp Stay (training + accommodation, Plai Laem only)
1. Package — 1 week / 2 weeks / 1 month Room / 1 month Bungalow
2. Check-in date — AvailabilityCalendar (reads availability_blocks, type IN ('camp-stay','all'))
3. Contact info
4. Review + Stripe Checkout

Note: Clients stay at Plai Laem but can train at either camp (Bo Phut or Plai Laem). Booking record uses camp='both'.

### Fighter Program
1. Info screen — what is included in the Fighter Program
2. Tier selection — Fighter Only (9,500 THB) / Fighter + Room (20,000 THB approx) / Fighter + Bungalow (25,000 THB approx)
3. Camp + start date — Bo Phut or Plai Laem for Fighter Only, auto-locked to Plai Laem with AvailabilityCalendar for stay tiers
4. Contact info
5. Review + Stripe Checkout

Note: Fighter+Room and Fighter+Bungalow prices are approximate and marked with priceTodo until client confirmation.

---

## 4. Calendar Components

**DatePicker** — used for training start date, fighter start date. Simple HTML date input or lightweight component. No Supabase.

**AvailabilityCalendar** — used for private and camp-stay flows. Fetches `availability_blocks` from Supabase. Blocked dates = greyed out, unselectable. Admin creates blocks via `/admin/availability`.

---

## 5. Supabase Data Model

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
  type text not null check (type in ('private','camp-stay','all')),
  date date not null,
  time_slot text,
  is_blocked boolean not null default true,
  reason text,
  created_by uuid references auth.users(id)
);
```

### RLS Policies

```sql
-- bookings: anyone can insert (booking), only admin can read/update
alter table bookings enable row level security;
create policy "Anyone can insert bookings" on bookings for insert to anon with check (true);
create policy "Admin reads bookings" on bookings for select to authenticated using (true);
create policy "Admin updates bookings" on bookings for update to authenticated using (true);

-- availability_blocks: anyone can read, only admin can write
alter table availability_blocks enable row level security;
create policy "Anyone reads availability" on availability_blocks for select to anon using (true);
create policy "Admin manages availability" on availability_blocks for all to authenticated using (true);
```

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
/admin               — redirect to /admin/bookings
/admin/login         — Supabase Auth (email + password)
/admin/bookings      — table, filters by type/status/date range
/admin/bookings/[id] — detail view + status update
/admin/availability  — calendar, block/unblock dates and time slots
```

All `/admin/*` routes protected by middleware: unauthenticated request redirects to `/admin/login`.

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
