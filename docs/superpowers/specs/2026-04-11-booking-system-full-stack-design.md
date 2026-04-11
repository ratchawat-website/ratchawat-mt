# Booking System Full Stack — Design

**Date:** 2026-04-11
**Status:** Approved
**Author:** Brainstorming session (RD + Claude)
**Phase:** Phase 3 — Booking System Full Stack (merged ex-Phase 3 UI + ex-Phase 4 Backend)

---

## 1. Context and scope change

The original ROADMAP split this work into two phases: Phase 3 (UI only, static availability) and Phase 4 (Backend wiring). Based on the decision to have everything testable in dev from day one, these two phases are merged into a single "Phase 3 — Booking System Full Stack".

Subsequent phases are renumbered:

| Old | New | Goal |
|-----|-----|------|
| Phase 3 (UI) + Phase 4 (Backend) | **Phase 3 — Booking System Full Stack** | UI + Supabase + Stripe + Resend all live in dev |
| Phase 5 (Admin) | Phase 4 — Admin Dashboard | |
| Phase 6 (Security) | Phase 5 — Security & Quality | |
| Phase 7 (Go-live) | Phase 6 — Go-live | |

Admin dashboard stays explicitly **out of scope** for this phase. This keeps the scope focused on the client-facing booking flow plus its backend.

### What is in scope

- Rebuild `/booking` landing page with 4 clear booking type cards
- Build 4 wizard routes: `/booking/training`, `/booking/private`, `/booking/fighter`, `/booking/camp-stay`
- Update `/booking/confirmed` to read from Supabase via `service_role`
- Delete the legacy `src/app/booking/BookingWidget.tsx` (hardcoded packages, ignores `pricing.ts`)
- Supabase project creation, migrations, RLS policies
- Stripe products seeding (22 products) via TypeScript script
- Stripe Checkout Session creation in `/api/checkout`
- Stripe webhook handling in `/api/webhooks/stripe`
- Resend email templates and sending on booking confirmation
- `react-day-picker` for date selection
- `AvailabilityCalendar` component backed by Supabase
- ARCHITECTURE.md corrections (7 fixes)
- ROADMAP.md renumbering

### What is out of scope

- Admin dashboard (moved to renumbered Phase 4)
- Domain verification for Resend in production (Phase 6 go-live)
- Rate limiting, CORS, Zod validation on all API routes (Phase 5 security)
- Real client production Stripe keys (stays in test mode until go-live)

---

## 2. Booking types simplification

The current `pricing.ts` declares 5 `BookingType` values but `"accommodation"` has zero `PriceItem` entries. All stay entries are classified as `"camp-stay"`. Additionally, `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly` are currently typed `"camp-stay"` but belong in the Fighter flow UX-wise.

### Changes to `src/content/pricing.ts`

1. Drop `"accommodation"` from the `BookingType` union
2. Reclassify `fighter-stay-room-monthly` → `bookingType: "fighter"`
3. Reclassify `fighter-stay-bungalow-monthly` → `bookingType: "fighter"`

### Resulting 4 booking types

| Type | Route | Packages shown | Camps |
|------|-------|---------------|-------|
| `training` | `/booking/training` | 7 (drop-in adult/kids, weekly, monthly, residents) | Bo Phut or Plai Laem |
| `private` | `/booking/private` | 4 (solo/group × adult/kids) | Bo Phut or Plai Laem |
| `fighter` | `/booking/fighter` | 3 (Fighter only, + Room, + Bungalow) | Bo Phut or Plai Laem |
| `camp-stay` | `/booking/camp-stay` | 4 (1w, 2w, 1m Room, 1m Bungalow) | Plai Laem stay, cross-camp training access |

---

## 3. Landing page — `/booking`

Clean rebuild. The legacy flat widget is replaced by a landing page with 4 clear type cards.

### Layout

Hero with page title + subtitle, then a 2-column grid (1-column on mobile) of 4 large cards:

```
GROUP TRAINING              PRIVATE LESSONS
From 400 THB                From 600 THB
Badge: Bo Phut or Plai Laem Badge: Bo Phut or Plai Laem
Icon: Users                 Icon: User
CTA: Book Training          CTA: Book Private

FIGHTER PROGRAM             CAMP STAY
From 9,500 THB/month        From 8,000 THB/week
Badge: Bo Phut or Plai Laem Badge: Stay Plai Laem, train any camp
Icon: Swords                Icon: Home
CTA: Apply                  CTA: Book Camp Stay
```

### Component reuse

Use existing `GlassCard` with `number` prop for the 01-04 numbering. Badge via `badge-underline badge-neutral` token. CTAs use `btn-primary` and `btn-arrow` patterns.

### GEO citable passage

> "Book Muay Thai training, private lessons, fighter program, or full camp stays at Ratchawat Koh Samui. Prices start at 400 THB for a drop-in class and 8,000 THB for a one-week all-inclusive camp stay at Plai Laem with cross-camp training access."

---

## 4. Wizard flows

Each wizard uses a shared `BookingWizard` shell component that handles:
- Step indicator (numbered circles with progress line)
- Back / Next navigation
- Form state via `useState` (no external state library)
- URL query param pre-selection (`?package=<price-id>`)
- Loading state during Stripe redirect

### 4.1 `/booking/training` — 5 steps

1. **Package** — 7 cards grouped by sub-category: "Adult Group" (drop-in, weekly×2, monthly×2), "Kids Group" (drop-in, monthly), "Residents" (10x, 20x). Each card shows name, price, duration badge.
2. **Camp** — 2 cards: Bo Phut and Plai Laem. Each card shows name, short description, and a Google Maps link.
3. **Start date** — `react-day-picker` single-date mode, min = tomorrow, max = today + 90 days. Sunday disabled (rest day).
4. **Contact info** — `ContactInfoForm`: name, email, phone (intl format), nationality select, optional notes.
5. **Review & Pay** — `BookingReview` showing all selections, terms checkbox, "Pay {amount} THB" button that POSTs to `/api/checkout`.

### 4.2 `/booking/private` — 5 steps

1. **Session type** — 4 cards: Private 1-on-1 Adult, Private Group 2-3 Adult, Private 1-on-1 Kids, Private Group 2-3 Kids. Group cards show "Price per person".
2. **Camp** — 2 cards (same as Training).
3. **Date & time slot** — `AvailabilityCalendar` reads `availability_blocks WHERE type IN ('private','all')`. Blocked dates are greyed out, unselectable. On date pick, the 4 time slots (09:00, 11:00, 14:00, 16:00) render as buttons; each slot that has a matching `availability_blocks` row for that date is disabled.
4. **Contact info** — adds a `num_participants` select (1 for solo, 2 or 3 for group). Total price auto-recomputed.
5. **Review & Pay**.

### 4.3 `/booking/fighter` — 5 steps

1. **Info screen** — read-only card explaining what's included in the Fighter Program (2x/day training, weekly stretch and yoga, weekly ice bath, fight organization, corner support). Single CTA "Continue".
2. **Tier** — 3 cards: Fighter Only (9,500 THB), Fighter + Standard Room (20,000 THB, "approximate" badge), Fighter + Private Bungalow (25,000 THB, "approximate" badge + "Limited to 4"). The 2 stay tiers show a tooltip on the approximate badge explaining that the price is pending final client confirmation.
3. **Camp + start date** — conditional logic:
   - If tier = "Fighter Only" → 2 camp cards + `react-day-picker`
   - If tier includes stay → camp auto-locked to Plai Laem with note "Accommodation available at Plai Laem" + `AvailabilityCalendar` reading `type IN ('camp-stay','all')`
4. **Contact info**.
5. **Review & Pay**. Stripe Checkout is created for all 3 tiers (including approximate-price tiers).

### 4.4 `/booking/camp-stay` — 4 steps

1. **Package** — 4 cards in 2×2 grid: 1 Week (8k), 2 Weeks (15k), 1 Month Room (18k), 1 Month Bungalow (23k). Bungalow card shows "Limited to 4 bungalows" badge. Each card mentions "Stay at Plai Laem, train at either camp".
2. **Check-in date** — `AvailabilityCalendar` reading `type IN ('camp-stay','all')`. End date auto-calculated from package duration.
3. **Contact info**.
4. **Review & Pay**. Booking record has `camp = 'both'` to reflect cross-camp training access.

### 4.5 `/booking/confirmed`

Server Component that reads `?session_id=` from `searchParams`, calls `stripe.checkout.sessions.retrieve()` to get `metadata.booking_id` and `payment_status`, then queries Supabase with `service_role` key (bypasses RLS for this server-only read). If the webhook has not yet updated `status` to `confirmed`, the page still renders correctly because Stripe's own `payment_status='paid'` is the source of truth at display time.

It renders:
- Success icon and heading
- Booking summary: package name, dates, camp(s), total paid
- Next steps: check email, gym address (map link), arrival instructions
- WhatsApp contact button
- Links to programs/home

If `booking_id` is missing or not found, render a fallback "Thank you, check your email" version (preserves the current static version for Stripe-less direct hits).

---

## 5. Shared components

### 5.1 `BookingWizard` (`src/components/booking/BookingWizard.tsx`)

Generic shell. Props:
- `steps: string[]` — step labels
- `currentStep: number`
- `onStepChange: (step: number) => void`
- `canProceed: boolean`
- `isFinalStep: boolean`
- `onSubmit?: () => void`
- `children: ReactNode` — rendered inside the active step

Renders progress indicator, children, and bottom nav buttons (Back / Next / Pay). Mobile responsive.

### 5.2 `DatePicker` (`src/components/booking/DatePicker.tsx`)

Wraps `react-day-picker` in single-select mode with project design tokens (dark mode, primary orange selected state). Props:
- `selected: Date | undefined`
- `onSelect: (date: Date | undefined) => void`
- `minDate?: Date`
- `maxDate?: Date`
- `disabledDays?: Matcher[]` — passes through to rdp
- `weekdaysDisabled?: number[]` — e.g. `[0]` for Sunday

### 5.3 `AvailabilityCalendar` (`src/components/booking/AvailabilityCalendar.tsx`)

Client component that fetches `availability_blocks` on mount for the requested type, converts them to a `disabledDays` matcher, and renders `DatePicker`. Props:
- `type: 'private' | 'camp-stay'`
- `selected: Date | undefined`
- `onSelect: (date: Date | undefined) => void`
- `onTimeSlotsChange?: (slots: string[]) => void` — only for `private` type, emits available slots for the picked date

Uses `createBrowserClient` from `@supabase/ssr` and the public anon key.

### 5.4 `ContactInfoForm` (`src/components/booking/ContactInfoForm.tsx`)

Controlled form with fields:
- `name` (text, required)
- `email` (email, required)
- `phone` (text, required, placeholder "+66 12 345 6789")
- `nationality` (select, required, ISO country list)
- `numParticipants` (optional select 1-3, shown only for private-group)
- `notes` (textarea, optional)

Validation via inline checks (`disabled` next button until fields valid). Full Zod validation happens server-side in `/api/checkout`.

### 5.5 `BookingReview` (`src/components/booking/BookingReview.tsx`)

Summary card showing:
- Package name + price
- Camp(s)
- Dates (start, optional end, optional time slot)
- Contact info (masked: "First L.")
- Total amount (bold)
- Terms-and-conditions checkbox
- Primary CTA: "Pay {amount} THB"

---

## 6. Supabase

### Project

New Supabase project "ratchawat-mt" on RD's dedicated Supabase account. Region: Southeast Asia (Singapore).

### Migrations

Single initial migration file `supabase/migrations/20260411000000_init.sql` containing:

```sql
-- bookings table
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

create index bookings_created_at_idx on bookings (created_at desc);
create index bookings_email_idx on bookings (client_email);
create index bookings_status_idx on bookings (status);

-- availability_blocks table
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

create index availability_blocks_date_idx on availability_blocks (date);
create index availability_blocks_type_date_idx on availability_blocks (type, date);

-- RLS: bookings
alter table bookings enable row level security;

create policy "anon_insert_bookings" on bookings
  for insert to anon with check (true);

create policy "admin_read_bookings" on bookings
  for select to authenticated using (true);

create policy "admin_update_bookings" on bookings
  for update to authenticated using (true);

-- RLS: availability_blocks
alter table availability_blocks enable row level security;

create policy "public_read_availability" on availability_blocks
  for select to anon using (true);

create policy "admin_manage_availability" on availability_blocks
  for all to authenticated using (true);
```

### Supabase client helpers

- `src/lib/supabase/server.ts` — `createServerClient()` using `@supabase/ssr` with cookies
- `src/lib/supabase/browser.ts` — `createBrowserClient()` for client components
- `src/lib/supabase/admin.ts` — admin client using `SUPABASE_SERVICE_ROLE_KEY` for server-only reads (used by `/booking/confirmed` and webhook)

---

## 7. Stripe

### Account

Client's Stripe account in TEST mode. Test keys live in `.env.local`. No migration needed later, just toggle TEST → LIVE keys at go-live.

### Products

22 products to create. All use the 2-tier Stripe model: Product + Price. Since all prices are one-off (not subscriptions), we use `mode: 'payment'` in Checkout Sessions.

**Excluded from the seed:** `bodyweight-dropin` and `bodyweight-monthly`. These are in-person access passes for the bodyweight training area, not online-bookable. They stay in `pricing.ts` for display on `/pricing` but the seed script skips them (filter by `bookingType !== 'training' || !id.startsWith('bodyweight-')`). Total seeded: 22 products.

### Seed script

`scripts/stripe-seed-products.ts` — standalone Node script that:
1. Imports `PRICES` from `src/content/pricing.ts`
2. For each `PriceItem` where `stripeProductId` is empty:
   - Creates a Stripe Product with name + description + metadata.price_id
   - Creates a Stripe Price with unit_amount (THB → smallest unit: THB has no cents, so multiply by 1)
3. Writes the generated `stripeProductId` and `stripePriceId` back into `pricing.ts` using a regex-based in-place update (safer than AST rewriting)

Run via `npx tsx scripts/stripe-seed-products.ts`. Idempotent: re-running skips already-seeded entries.

### Checkout flow

`/api/checkout/route.ts` — rewrite:

```typescript
POST /api/checkout
body: {
  price_id: string,
  booking: {
    type, camp, start_date, end_date?, time_slot?,
    client_name, client_email, client_phone,
    client_nationality, num_participants?, notes?
  }
}

1. Validate body with Zod schema
2. Look up PriceItem in pricing.ts, fail if not found or no stripePriceId
3. Insert pending booking into Supabase (admin client)
4. Create Stripe Checkout Session:
     line_items: [{ price: stripePriceId, quantity: num_participants || 1 }]
     mode: 'payment'
     metadata: { booking_id: inserted.id }
     success_url: `${SITE_URL}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`
     cancel_url: `${SITE_URL}/booking?cancelled=1`
     customer_email: booking.client_email
5. Return { url: session.url }
```

Note: `{CHECKOUT_SESSION_ID}` is a Stripe-substituted placeholder expanded server-side by Stripe before redirecting. The confirmed page calls `stripe.checkout.sessions.retrieve(session_id)` to fetch `metadata.booking_id`, then queries Supabase. This also gives us `payment_status` directly from Stripe even if the webhook has not fired yet.

### Webhook

`/api/webhooks/stripe/route.ts` — rewrite:

```typescript
POST /api/webhooks/stripe
headers: stripe-signature

1. Read raw body, verify signature with STRIPE_WEBHOOK_SECRET
2. If event.type === 'checkout.session.completed':
    a. Extract booking_id from session.metadata
    b. Update Supabase booking:
         status = 'confirmed'
         stripe_session_id = session.id
         stripe_payment_intent_id = session.payment_intent
         stripe_payment_status = session.payment_status
    c. Fetch the full booking row
    d. Call sendBookingConfirmationEmail(booking) — Resend
    e. Call sendAdminNotificationEmail(booking) — Resend
3. If event.type === 'checkout.session.expired':
    a. Update booking status to 'cancelled'
4. Return 200 OK
```

---

## 8. Resend

### Setup

RD's dedicated Resend account. In dev, use sandbox domain `onboarding@resend.dev` as the `from` address. In production (Phase 6), switch to `bookings@ratchawatmuaythai.com` after domain verification.

### Templates

React components in `src/lib/email/templates/`:

**`BookingConfirmed.tsx`** (client email)
- Subject: "Your booking at Ratchawat Muay Thai is confirmed"
- Body: friendly tone, summary table (package, dates, camp, total), arrival instructions, gym address with map link, WhatsApp contact, what to bring list

**`BookingNotification.tsx`** (admin email, sent to `ADMIN_EMAIL`)
- Subject: "New booking: {package_name} — {client_name}"
- Body: full booking details, client contact info, link to Supabase dashboard (hardcoded for now)

### Sending logic

`src/lib/email/send.ts`:
```typescript
export async function sendBookingConfirmationEmail(booking: Booking)
export async function sendAdminNotificationEmail(booking: Booking)
```

Both functions use `new Resend(process.env.RESEND_API_KEY)` and `resend.emails.send()` with React templates via `@react-email/render`.

---

## 9. Environment variables

`.env.local` (not committed):

```bash
# Supabase (dedicated project account)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (client account, TEST mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (dedicated project account)
RESEND_API_KEY=re_...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=chor.ratchawat@gmail.com
```

Create `.env.example` with placeholders committed to the repo.

---

## 10. Setup instructions for RD

The plan will include step-by-step commands. Summary here:

### Supabase (10 min)
1. Go to `app.supabase.com`, create project "ratchawat-mt", region Singapore, save password
2. Settings → API → copy `Project URL`, `anon public`, `service_role` keys into `.env.local`
3. SQL Editor → paste contents of `supabase/migrations/20260411000000_init.sql`, run
4. Verify tables exist in Table Editor

### Stripe (10 min)
1. Login to client's Stripe dashboard, make sure you're in **TEST mode** (toggle top right)
2. Developers → API keys → copy Publishable and Secret keys into `.env.local`
3. Run `npx tsx scripts/stripe-seed-products.ts` — creates 22 products and writes IDs back to `pricing.ts`
4. In another terminal: `stripe listen --forward-to localhost:3000/api/webhooks/stripe` — copy the `whsec_...` into `.env.local`
5. Commit the updated `pricing.ts`

### Resend (5 min)
1. Login to resend.com, API Keys → Create API key, copy into `.env.local`
2. No domain verification needed in dev

### Run the app
```bash
npm install   # installs react-day-picker, stripe, @supabase/ssr, resend, @react-email/render
npm run dev
```

Open `http://localhost:3000/booking`, test all 4 flows end to end.

---

## 11. ARCHITECTURE.md corrections

Task 1 of the plan patches ARCHITECTURE.md with these fixes:

1. **§2 Routes:** Remove `/booking/accommodation` from the list
2. **§3 Flows:** Update Camp Stay to 4 packages (1w, 2w, 1m Room, 1m Bungalow)
3. **§3 Flows:** Rewrite Fighter flow to use 3 tiers (base, +Room, +Bungalow) instead of "add-on yes/no"
4. **§3 Flows:** Add note under Camp Stay: "Client stays at Plai Laem but can train at both camps"
5. **§5 bookings schema:**
   - Drop `'accommodation'` from type enum
   - Add `num_participants integer not null default 1`
   - Add `time_slot text`
   - Add `'both'` to the camp check constraint
6. **§5 RLS:** Document that `/booking/confirmed` uses `service_role` server-side to read bookings (no client-facing read policy needed)
7. **§6 Stripe:** Document that `priceTodo` entries (fighter-stay-*) still get Stripe products at approximate prices, with a "pending client confirmation" note in the dashboard description

---

## 12. ROADMAP.md changes

Task 1 also patches ROADMAP.md:

- Phase 2 stays COMPLETE
- **Phase 3 — Booking System Full Stack** replaces the old Phase 3 (UI only). Goal rewritten, tasks reflect the merged scope
- **Phase 4 — Admin Dashboard** (was Phase 5)
- **Phase 5 — Security & Quality** (was Phase 6)
- **Phase 6 — Go-live** (was Phase 7)
- The old "Phase 4 — Backend Integration" section is deleted (merged into new Phase 3)

---

## 13. File structure

```
src/
  app/
    booking/
      page.tsx                         REBUILT — landing with 4 cards
      BookingWidget.tsx                DELETED
      confirmed/
        page.tsx                       REBUILT — server component, reads Supabase
      training/
        page.tsx                       NEW
        TrainingWizard.tsx             NEW (client component)
      private/
        page.tsx                       NEW
        PrivateWizard.tsx              NEW
      fighter/
        page.tsx                       NEW
        FighterWizard.tsx              NEW
      camp-stay/
        page.tsx                       NEW
        CampStayWizard.tsx             NEW
    api/
      checkout/
        route.ts                       REWRITTEN — Supabase + Stripe
      webhooks/
        stripe/
          route.ts                     REWRITTEN — signature + email + DB update

  components/
    booking/
      BookingWizard.tsx                NEW — shared shell
      DatePicker.tsx                   NEW — react-day-picker wrapper
      AvailabilityCalendar.tsx         NEW — Supabase-connected
      ContactInfoForm.tsx              NEW
      BookingReview.tsx                NEW

  content/
    pricing.ts                         MODIFIED — drop 'accommodation' type,
                                       reclassify fighter-stay-* to 'fighter',
                                       add stripeProductId / stripePriceId after seed

  lib/
    supabase/
      server.ts                        NEW
      browser.ts                       NEW
      admin.ts                         NEW
    stripe/
      client.ts                        EXISTS — may need update
    email/
      send.ts                          NEW
      templates/
        BookingConfirmed.tsx           NEW
        BookingNotification.tsx        NEW
    validation/
      booking.ts                       NEW — Zod schemas

supabase/
  migrations/
    20260411000000_init.sql            NEW

scripts/
  stripe-seed-products.ts              NEW

.env.example                           NEW (placeholder values)

ARCHITECTURE.md                        PATCHED (see §11)
ROADMAP.md                             PATCHED (see §12)
```

---

## 14. Success criteria

Phase 3 is DONE when:

- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` passes with 0 errors
- [ ] Supabase project exists with both tables and RLS policies active
- [ ] Stripe test products (22) exist in client Stripe dashboard with matching IDs in `pricing.ts`
- [ ] Resend API key works and can send a test email
- [ ] `/booking` landing renders 4 cards at 375px, 768px, 1280px
- [ ] Full end-to-end flow for `/booking/training`: pick package → camp → date → contact → pay with Stripe test card `4242 4242 4242 4242` → redirected to `/booking/confirmed?booking_id=X` → booking appears in Supabase with `status='confirmed'` → client receives email → admin receives email
- [ ] Same end-to-end for `/booking/private` (with time slot selection and availability blocked date)
- [ ] Same end-to-end for `/booking/fighter` (all 3 tiers payable, including approximate-price ones)
- [ ] Same end-to-end for `/booking/camp-stay` (date selection respects `availability_blocks`, booking stored with `camp='both'`)
- [ ] Blocked dates (manually inserted in `availability_blocks` via SQL editor) appear greyed out in the calendar
- [ ] `/booking/confirmed` reads the booking via `service_role` and shows a personalized summary
- [ ] ARCHITECTURE.md reflects all 7 corrections
- [ ] ROADMAP.md reflects the renumbered phases
- [ ] PROJET-STATUS.md updated with Phase 3 progress
- [ ] Commit with descriptive message pushed to main

---

## 15. Follow-ups (tracked in new ROADMAP Phase 5/6)

- Replace approximate prices for `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly` once client confirms
- Domain verification for Resend at go-live
- Rate limiting on `/api/checkout` and `/api/webhooks/stripe`
- Zod validation hardening with explicit error responses
- Lighthouse audit of the 6 booking routes

---

## 16. Open questions at sign-off

None. All design decisions validated during brainstorming session 2026-04-11.
