# Booking & Availability System Audit + Redesign

> **Scope:** Fix all bugs, redesign admin availability model, unify date formats, add admin "Create Booking", confirm Fighter+Room pricing.

**Goal:** A coherent, bug-free booking/availability system where the admin manages capacity through manual reservations and targeted blocks (camp closure, private slot blocks), and the client sees accurate real-time availability.

**Architecture:** Keep existing tables (`bookings`, `availability_blocks`) but fix the block type constraint, add admin booking creation API, unify date formatting via a shared helper, fix calendar nav visibility, and wire capacity checks to block data.

---

## UX Simulation: Client vs Admin Flows

### Scenario 1: Client books a 1-week camp stay (room)

1. Client goes to `/booking/camp-stay`, selects "1 Week" (8,000 THB)
2. Calendar shows: dates where rooms are at capacity (7/7) are disabled + any dates with `type=full` blocks
3. Client picks Apr 15 as check-in. System computes check-out Apr 22.
4. Capacity check: for every night Apr 15-21, count `bookings` where inventoryKey=rooms + status in (pending, confirmed). If any night >= 7, block the check-in date.
5. Client fills contact, reviews, pays via Stripe.
6. Booking created with `status=pending`, Stripe webhook confirms to `status=confirmed`.

### Scenario 2: Admin blocks capacity for existing occupants

Admin knows 3 rooms are occupied by walk-in guests from Apr 10-17.

1. Admin goes to `/admin/bookings`, clicks "Create Booking"
2. Fills: type=camp-stay, package=camp-stay-1week, dates Apr 10-17, client name "Walk-in guest (3 rooms)", num_participants=3 (or creates 3 separate bookings for 1 room each)
3. Booking inserted with `status=confirmed` (no Stripe). `price_amount` can be 0 or actual amount.
4. Occupancy system now counts these rooms. Client calendar automatically reflects reduced availability.

**Decision: num_participants vs multiple bookings for rooms.** Each booking = 1 accommodation unit. If 3 rooms are occupied, admin creates 3 bookings. This is consistent with how the capacity system counts: 1 booking = 1 room/bungalow consumed. The `num_participants` field on bookings is for pricing (group private sessions), not for rooms.

### Scenario 3: Admin closes camp for Songkran (Apr 13-15)

1. Admin goes to `/admin/availability`, clicks Apr 13
2. Drawer opens, admin toggles "Block everything (camp closed)", enters reason "Songkran"
3. Block created: `type=full, date=2026-04-13, reason="Songkran"`
4. Repeats for Apr 14, 15
5. Client side: `AvailabilityCalendar` fetches blocks with `type IN ('private','private-slot','full')`. Dates with `type=full` are disabled for ALL booking types.

### Scenario 4: Admin blocks a private slot

1. Admin clicks Apr 20 in availability calendar
2. Drawer shows 7 private slot toggles (08:00 through 16:00)
3. Admin toggles 14:00 OFF
4. API creates block: `type=private-slot, date=2026-04-20, time_slot=14:00`
5. Client booking private session: on Apr 20, slot 14:00 appears as unavailable (strikethrough)

### Scenario 5: Client tries to book overlapping dates

Client wants to check in Apr 15 for 1 week (through Apr 22). But Apr 20 has all 7 rooms occupied.

1. Calendar computes: for check-in Apr 15, stay occupies nights Apr 15-21
2. Apr 20 has occupancy=7 (capacity), so check-in Apr 15 is DISABLED
3. Client must pick different dates
4. Same logic works backward: if admin created a manual booking for Apr 20-27, any client check-in from Apr 14-20 (for 1 week) that would overlap Apr 20 is blocked

### Scenario 6: Admin creates a private lesson booking

1. Admin clicks "Create Booking" in `/admin/bookings`
2. Selects type=private, picks package (e.g. private-adult-solo), picks camp, date, time slot, fills client info
3. Amount auto-calculated from package price. Admin can override.
4. Booking created with `status=confirmed`.
5. This slot now appears as taken in the client calendar (via block query or direct booking check)

**Important note on private bookings and blocks:** Private lesson bookings don't currently create `availability_blocks` rows. The client `AvailabilityCalendar` only checks `availability_blocks` for slot blocking, not the `bookings` table. Two approaches:
- **Approach chosen:** When a private booking is created (client checkout or admin manual), also insert an `availability_blocks` row with `type=private-slot` for that date+slot. This keeps the block system as the single source of truth for slot availability. The checkout API and admin create API both do this.

### Scenario 7: Fighter + Room booking

1. Client goes to `/booking/fighter` or clicks "Book Now" on `/accommodation` fighter+room card
2. Selects "Fighter + Room" (20,000 THB/month), camp auto-locked to Plai Laem
3. Calendar shows room availability for 30-day stay duration
4. Same capacity checks as camp-stay, using inventoryKey=rooms
5. Pays via Stripe

---

## Section 1: Database Migration

### availability_blocks type constraint

```sql
-- Remove old data that no longer applies
DELETE FROM availability_blocks WHERE type IN ('camp-stay', 'all');

-- Alter CHECK constraint
ALTER TABLE availability_blocks
  DROP CONSTRAINT availability_blocks_type_check;

ALTER TABLE availability_blocks
  ADD CONSTRAINT availability_blocks_type_check
  CHECK (type IN ('private', 'private-slot', 'full'));
```

### No new tables needed

The `bookings` table already supports all booking types. Admin-created bookings use the same table with `stripe_session_id = NULL` to distinguish them.

---

## Section 2: Admin "Create Booking" API

**Endpoint:** `POST /api/admin/bookings`

**Auth:** `is_admin()` check via Supabase RPC.

**Body:**
```typescript
{
  type: "training" | "private" | "camp-stay" | "fighter",
  price_id: string,           // from pricing catalog
  camp: "bo-phut" | "plai-laem" | "both",
  start_date: string,         // yyyy-MM-dd
  end_date?: string,          // yyyy-MM-dd (for stays)
  time_slot?: string,         // for private sessions
  num_participants: number,   // default 1
  client_name: string,
  client_email?: string,      // optional for admin (walk-ins may not have email)
  client_phone?: string,      // optional for admin
  client_nationality?: string,
  notes?: string,
  price_amount?: number,      // admin can override; if omitted, calculated from catalog
}
```

**Logic:**
1. Validate inputs (relaxed vs client: email/phone optional)
2. If accommodation type: run `checkRangeAvailability()` — return 409 if full
3. If private type: check that the time_slot is not already blocked or booked
4. Insert into `bookings` with `status = 'confirmed'` (no Stripe flow)
5. If private type: also insert `availability_blocks` row with `type=private-slot` for the date+slot
6. Return booking ID

---

## Section 3: Admin "Create Booking" UI

**Location:** `/admin/bookings` page, button "Create Booking" in header.

**Behavior:** Clicking opens a full-width form panel (not a modal) above the bookings list, or a slide-out drawer. Single form, no wizard steps.

**Form fields (dynamic based on type):**

| Field | Always | Training | Private | Camp-stay | Fighter |
|-------|--------|----------|---------|-----------|---------|
| Type selector | x | | | | |
| Package dropdown | x | x | x | x | x |
| Camp | x | x | x | auto: both | auto: plai-laem (stay) |
| Start date | x | x | x | x | x |
| End date | | | | auto-calc | auto-calc |
| Time slot | | | x | | |
| Client name | x | | | | |
| Client email | optional | | | | |
| Client phone | optional | | | | |
| Nationality | optional | | | | |
| Participants | if group | | group only | | |
| Amount | auto + editable | | | | |
| Notes | optional | | | | |

**Capacity feedback:** When dates are selected for accommodation types, show real-time availability status (e.g., "5/7 rooms available for this period" or "FULL - cannot book").

---

## Section 4: Availability Page Redesign

### What stays
- Calendar grid showing occupancy per day (R x/7, B x/1)
- Color coding (green/amber/red)
- Day drawer with occupancy display
- Block toggles: "Block all private sessions" (type=private) and "Block everything" (type=full)
- Per-slot toggles for private sessions (type=private-slot)
- Reason field

### What changes
- **Remove** "Block camp-stay rooms" toggle (capacity now via manual bookings)
- **Remove** block type `camp-stay` and `all` from UI
- **Add** link/button in drawer to "Create Booking for this date" (pre-fills the date in the create booking form)
- **Fix** the drawer block creation to use correct types (`private-slot` instead of trying to use invalid type)

### Admin calendar legend update
- Green = available capacity
- Amber = 75%+ rooms full
- Red = rooms full (7/7)
- Lock icon = manually blocked (full or private)

---

## Section 5: Client Calendar Fixes

### 5a: Month navigation visibility

The `button_previous` and `button_next` classes in `calendarClassNames` use `absolute left-0` / `absolute right-0`. The parent `month_caption` has `relative` positioning. Debug why buttons are invisible:
- Check if the buttons are rendered but clipped (overflow)
- Check if the parent container is too narrow
- Ensure the SVG icons inside rdp nav buttons inherit color from the class

Fix: ensure buttons are visible, clickable, styled consistently with the dark theme.

### 5b: Block type filter fix

`AvailabilityCalendar` currently filters: `.in("type", [type, "all"])` where `type` is "private" or "camp-stay".

**New filter:** `.in("type", ["full", type === "private" ? "private-slot" : null, type === "private" ? "private" : null].filter(Boolean))`

Simplified logic:
- For **private** bookings: fetch blocks with `type IN ('full', 'private', 'private-slot')`
- For **camp-stay/fighter** bookings: fetch blocks with `type IN ('full')` (capacity handled by occupancy system, not blocks)
- For **training** bookings: fetch blocks with `type IN ('full')` (training has no accommodation)

### 5c: Private booking slot sync

When a private booking is confirmed (via client Stripe webhook or admin manual creation), insert a corresponding `availability_blocks` row:
```sql
INSERT INTO availability_blocks (type, date, time_slot, is_blocked, reason)
VALUES ('private-slot', booking.start_date, booking.time_slot, true, 'Booked')
```

This ensures the client calendar shows the slot as taken without querying the bookings table.

**On cancellation:** Delete the corresponding `availability_blocks` row when a private booking is cancelled.

---

## Section 6: Unified Date Formatting

### Helper function

Create `src/lib/utils/date-format.ts`:

```typescript
import { format, parseISO } from "date-fns";

/** Short format: "Apr 12, 2026" — default for tables, cards, lists */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/** Long format: "Saturday, April 12, 2026" — for review steps and detail pages */
export function formatDateLong(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, MMMM d, yyyy");
}

/** ISO format: "2026-04-12" — for API calls and DB */
export function formatDateISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
```

### Where to apply

| Location | Current format | New format |
|----------|---------------|------------|
| `/admin/bookings` table | `new Date().toLocaleDateString(...)` | `formatDateShort()` |
| `/admin/bookings` cards | raw `start_date` string (ISO) | `formatDateShort()` |
| `/admin/bookings/[id]` detail | `toLocaleDateString("en-US", { long })` | `formatDateLong()` |
| Client wizard review steps | `toLocaleDateString("en-US", { long })` | `formatDateLong()` |
| Client wizard date selection display | `toLocaleDateString(...)` | `formatDateLong()` |
| Confirmation page | check current format | `formatDateLong()` |
| Confirmation email | check current format | `formatDateLong()` |
| Admin drawer header | `format(date, "MMMM d, yyyy")` | keep (already good, matches long minus weekday) |

---

## Section 7: Fighter + Room Price Confirmation

### Changes
1. **`src/content/pricing.ts`**: Remove `priceTodo` from `fighter-stay-room-monthly`. Price confirmed at 20,000 THB.
2. **`/accommodation` page**: Change fighter+room card button from `href="/contact"` ("Contact Us") to `href="/booking/fighter?package=fighter-stay-room-monthly"` ("Book Now").
3. **Fighter wizard**: Remove the "Approximate" badge and disclaimer that shows when `priceTodo` is set (this will happen automatically once `priceTodo` is removed).

---

## Section 8: Additional Bug Fixes

### 8a: Amount column in /admin/bookings

The fix from commit `5af6b04` (amount_total → price_amount) is correct in the code. The issue is likely a stale `.next` build cache. Verify by:
1. Stop dev server
2. `rm -rf .next`
3. `npm run dev`
4. Check if amount displays correctly

If it still fails, check that `queryBookings()` returns `price_amount` in the select (it uses `select("*")` so it should).

### 8b: Admin drawer "private-slot" insert 500

Root cause confirmed: CHECK constraint rejects `type='private-slot'`. Fixed by the migration in Section 1.

### 8c: Block type filter mismatch

The admin drawer sends `type="full"` for "Block everything" but the client `AvailabilityCalendar` never filters for `type="full"`. Fixed in Section 5b.

---

## Files Changed (Summary)

### New files
- `src/lib/utils/date-format.ts` — unified date formatting helpers
- `src/app/api/admin/bookings/route.ts` — POST create manual booking
- `src/components/admin/CreateBookingForm.tsx` — admin booking creation form
- `supabase/migrations/2026XXXX_fix_availability_blocks_types.sql` — fix CHECK constraint

### Modified files
- `src/content/pricing.ts` — remove priceTodo from fighter-stay-room-monthly
- `src/app/accommodation/page.tsx` — fighter+room button → booking link
- `src/components/booking/AvailabilityCalendar.tsx` — fix block type filter, sync private slots
- `src/components/booking/DatePicker.tsx` — fix month nav visibility
- `src/components/ui/calendar-tokens.ts` — fix nav button styles if needed
- `src/components/admin/AdminDayDrawer.tsx` — remove camp-stay block toggle, fix types, add "Create Booking" link
- `src/app/admin/(dashboard)/availability/page.tsx` — update block type references
- `src/app/admin/(dashboard)/bookings/page.tsx` — add Create Booking button + form
- `src/components/admin/BookingsTable.tsx` — use formatDateShort
- `src/components/admin/BookingsCards.tsx` — use formatDateShort
- `src/app/admin/(dashboard)/bookings/[id]/page.tsx` — use formatDateLong
- `src/app/booking/camp-stay/CampStayWizard.tsx` — use formatDateLong
- `src/app/booking/private/PrivateWizard.tsx` — use formatDateLong
- `src/app/booking/fighter/FighterWizard.tsx` — use formatDateLong
- `src/app/api/checkout/route.ts` — add private-slot block creation on booking insert
- Stripe webhook handler — add private-slot block creation on payment confirmed
- Booking status transition API — delete private-slot block on cancellation
- `src/app/booking/confirmed/page.tsx` — use formatDateLong (if dates shown)

---

## Out of Scope

- Client authentication (confirmed: guest-only booking, no client accounts)
- Blog infrastructure
- Email template redesign (date format fix only)
- Training booking calendar (training = drop-in, no capacity constraint beyond camp closure)
