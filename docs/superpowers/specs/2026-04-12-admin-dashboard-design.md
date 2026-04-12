# Phase 4 — Admin Dashboard + Capacity Tracking — Design Spec

> **Validated:** 2026-04-12 (brainstorming session with RD)
> **Phase:** 4
> **Blocker:** Phase 3 complete (validated 2026-04-12)
> **Resolves:** Pending #56 (RLS tightening via profiles.role='admin')

---

## 1. Scope

Phase 4 delivers:

1. **Admin authentication** — `profiles` table with `role='admin'`, `is_admin()` SQL function, login/logout flow
2. **Admin dashboard** — protected `/admin/*` routes with sidebar/bottom-tabs shell
3. **Bookings management** — paginated list with filters, detail page with status transitions, notes, resend email
4. **Availability + capacity** — calendar with occupancy display, day drawer for block/unblock, inventory tracking for rooms/bungalows
5. **Calendar refonte** — full Tailwind dark theme for react-day-picker, replaces broken default CSS on both public and admin calendars
6. **Private slot correction** — 7 slots (08:00, 11:00-16:00) replacing old 4 slots (09:00, 11:00, 14:00, 16:00)
7. **RLS tightening** — all admin policies gated by `is_admin()` instead of `USING (true)`
8. **Cleanup** — remove dead `/account` middleware branch, centralize slot config

**Out of scope:** Client accounts, client-facing booking history, refund automation, multi-language admin.

---

## 2. Auth Model

### Database

**Table: `profiles`**

```sql
create table profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

RLS on profiles: authenticated users can read their own row only.

**Function: `is_admin()`**

```sql
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;
```

### RLS Tightening (resolves pending #56)

All existing admin policies on `bookings` and `availability_blocks` are replaced:

```sql
-- bookings
drop policy if exists "admin_read_bookings" on bookings;
drop policy if exists "admin_update_bookings" on bookings;
create policy "admin_read_bookings" on bookings
  for select to authenticated using (public.is_admin());
create policy "admin_update_bookings" on bookings
  for update to authenticated using (public.is_admin());

-- availability_blocks
drop policy if exists "admin_manage_availability" on availability_blocks;
create policy "admin_manage_availability" on availability_blocks
  for all to authenticated using (public.is_admin());
```

### Middleware

`src/middleware.ts` updated:
- Remove dead `/account` branch
- Add: if `pathname.startsWith("/admin")` AND `pathname !== "/admin/login"` → check `auth.getUser()` + RPC `is_admin()`. If not admin → redirect `/admin/login?redirect=<pathname>`.
- `/admin/login` remains publicly accessible (no auth required to visit).

### Admin Creation

Script `scripts/create-admin.ts` (run once by RD):
- Takes email + password from env vars or CLI args
- Uses `supabase.auth.admin.createUser({ email, password, email_confirm: true })` via service_role
- Inserts `profiles (user_id, role) = (newUserId, 'admin')`
- Idempotent: if email exists, only inserts profile if missing

### Public Nav Button

`<AdminNavButton />` rendered in `Header.tsx`:

| Auth state | Visual | Click action |
|---|---|---|
| Not authenticated | Discrete `Lock` icon, opacity 50%, no label, right side of nav after CTA | → `/admin/login` |
| Authenticated + admin | `LayoutDashboard` icon, primary orange, tooltip "Admin Dashboard" | → `/admin/bookings` |

Server Component: reads auth state server-side, never leaks admin data to unauthenticated visitors.
Mobile: appears in nav drawer, after main links, separated by divider.

---

## 3. Admin Layout Shell

### Desktop (≥ md:)

```
+----------------------------------------------------+
|  [Logo Ratchawat]   Admin    [User menu ▾] [Logout]|  <- fixed top bar
+--------+-------------------------------------------+
|        |                                           |
|  Nav   |             Page content                  |
| (w-56) |                                           |
| □ Bkgs |                                           |
| □ Avbl |                                           |
| □ Acct |                                           |
|        |                                           |
+--------+-------------------------------------------+
```

Sidebar links:
- **Bookings** (Calendar icon) → `/admin/bookings`
- **Availability** (CalendarDays icon) → `/admin/availability`
- **Account** (User icon) → `/admin/account`

Active state: background orange-tinted + `border-l-4` primary.

### Mobile (< md:)

Sidebar hidden. Replaced by **sticky bottom tab bar** with 3 icons (Bookings, Availability, Account).
Top bar remains: logo + user menu.

### User Menu (Client Component)

Displays initials extracted from email. Dropdown: "Account settings" → `/admin/account`, "Sign out" → POST `/api/admin/signout` then redirect `/`.

### Login Page (`/admin/login`)

Separate layout (no sidebar, no header/footer). Logo centered + email/password form + "Sign in" button.
If already authenticated → immediate redirect to `/admin/bookings`.
Auth errors displayed inline. Rate-limited by Supabase Auth natively.

### Signout Route (`POST /api/admin/signout`)

Calls `supabase.auth.signOut()` server-side, clears cookies, returns 200. Client redirects to `/`.

---

## 4. Bookings List (`/admin/bookings`)

Server Component. Reads Supabase via `createClient()` (auth user, RLS enforced).

### Query Params

```
?type=training&status=pending&from=2026-04-01&to=2026-04-30&q=john&page=2
```

### Desktop (≥ md:) — Dense Table

Columns: Created, Type (badge), Status (badge), Client (name), Dates (start → end), Amount (THB), Action (→ link).

- Row entirely clickable → `/admin/bookings/[id]`
- Hover: `surface-low` background
- Sort: `created_at desc` default

### Mobile (< md:) — Stacked Cards

Each card: type badge + status badge top, client name + email, dates, amount large.
Tap → detail.

### Filters (sticky, below header)

- Select `type`: All / Training / Private / Camp Stay / Fighter
- Select `status`: All / Pending / Confirmed / Completed / Cancelled
- Date range `from` / `to` (filters on `start_date`)
- Search input `q` (ILIKE on `client_email` + `client_name`)
- "Reset filters" button

### Pagination

25 rows per page. Offset-based (acceptable for < 10k bookings).
Indicator: "Showing 1-25 of 142".

### Badge Colors

Type: Training = blue, Private = purple, Camp Stay = emerald, Fighter = red.
Status: Pending = amber, Confirmed = green, Completed = blue, Cancelled = red.

---

## 5. Booking Detail (`/admin/bookings/[id]`)

Server Component. Loads booking via Supabase (RLS enforced).

### Page Sections

**1. Header**
`← Back to bookings` + `Booking #abc12345` (8 first UUID chars) + type/status badges + "Open in Stripe Dashboard" button (external link).

**2. Client Info Card**
Name, email (mailto:), phone (tel: + WhatsApp link `https://wa.me/<num>`), nationality.

**3. Booking Details Card**
Type, package (price_id → friendly label from pricing.ts), camp, num_participants, start_date, end_date, time_slot, price_amount.

**4. Stripe Info Card**
stripe_session_id (copy button), stripe_payment_intent_id, stripe_payment_status, Stripe Dashboard link.

**5. Internal Notes Card**
Displays current `notes`. "Edit" button opens textarea + save → `POST /api/admin/bookings/[id]/notes`.

**6. Actions Card**

Status transitions by current status:
- `pending` → `Mark as Confirmed`, `Mark as Cancelled`
- `confirmed` → `Mark as Completed`, `Mark as Cancelled`
- `completed` → read-only (no actions)
- `cancelled` → read-only (no actions)

Secondary action: **"Resend confirmation email"** → `POST /api/admin/bookings/[id]/resend-email`.

All transitions via `POST /api/admin/bookings/[id]/status` with `{ status }` body. Server verifies `is_admin`, updates Supabase, revalidates paths.

---

## 6. Availability + Capacity Tracking

### 6.1 Inventory Model

**File: `src/lib/admin/inventory.ts`**

```typescript
export const INVENTORY = {
  rooms: 7,
  bungalows: 1,
} as const;

export type InventoryKey = "rooms" | "bungalows";

export function getInventoryKey(priceId: string): InventoryKey | null {
  if (priceId.includes("bungalow")) return "bungalows";
  if (
    priceId.includes("camp-stay-room") ||
    priceId === "fighter-stay-room-monthly"
  ) return "rooms";
  return null;
}
```

Constants (not a database table): physical rooms don't change without a deploy.

### 6.2 Capacity Helpers

**File: `src/lib/admin/availability.ts`**

```typescript
// Returns occupancy count per day for a date range and inventory pool.
export async function getOccupancyMap(
  inventoryKey: InventoryKey,
  fromDate: string,
  toDate: string,
): Promise<Map<string, number>>;

// Returns available units for a single day.
export async function getAvailableUnits(
  inventoryKey: InventoryKey,
  date: string,
): Promise<number>;

// Checks if an entire stay range has capacity. Returns OK or the first conflict date.
export async function checkRangeAvailability(
  inventoryKey: InventoryKey,
  startDate: string,
  endDate: string,
): Promise<{ ok: true } | { ok: false; conflictDate: string }>;
```

**Algorithm for `getOccupancyMap`:**
1. Query: `select start_date, end_date, price_id from bookings where type IN ('camp-stay','fighter') AND status IN ('pending','confirmed') AND start_date <= toDate AND end_date >= fromDate`
2. For each booking, iterate each night from `start_date` to `end_date - 1` (hotel logic: checkout morning frees the night)
3. For each night, if `getInventoryKey(price_id) === inventoryKey`, increment counter
4. Return Map `{ "2026-04-15": 5, "2026-04-16": 6, ... }`

**Edge cases:**
- `pending` bookings count as occupied (prevents double-booking during Stripe Checkout window)
- `checkout.session.expired` webhook sets booking to `cancelled`, freeing the slot

### 6.3 Admin Availability Page (`/admin/availability`)

Server Component loading:
- All `availability_blocks` for displayed month
- Occupancy maps for rooms AND bungalows for the month
- Active bookings for the month (for drawer detail)

**Calendar (react-day-picker, custom styled):**

Each day cell displays 3 info lines:
- `R 5/7` (rooms occupied) — green if OK, amber if >75% full, red if full
- `B 1/1` or `B 0/1` — same color coding
- Lock icon if manual admin block exists

Navigation: prev/next month.
Filter top: `Show: All / Rooms / Bungalows / Private`.

**Day Drawer (slide from right):**

Opens on day click. Contains:

- **Occupancy section:** `Rooms: 5 / 7 booked` (with list of bookings, links to detail). `Bungalows: 1 / 1 booked`.
- **Manual blocks section:**
  - Toggle: `Block all camp-stay this day`
  - Toggle: `Block all private this day`
  - Toggle: `Block everything this day`
- **Private slots section:** 7 individual toggles: 08:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00
- **Reason** field (optional textarea, applied to next block created)

### 6.4 Client-Side Integration

**`/api/checkout` — overbooking protection:**

Before inserting booking + creating Stripe Session:

```typescript
const inventoryKey = getInventoryKey(price_id);
if (inventoryKey) {
  const check = await checkRangeAvailability(inventoryKey, start_date, end_date);
  if (!check.ok) {
    return NextResponse.json(
      { error: `Sold out on ${check.conflictDate}. Please choose different dates.` },
      { status: 409 },
    );
  }
}
```

**`AvailabilityCalendar.tsx` (public booking flow):**

Refactored to also check occupancy (not just manual blocks):
- Server Component wrapper loads occupancy map + blocks for 6 months
- Passes disabled dates to client DatePicker
- A date is disabled if: manual block exists for matching type, OR occupancy >= capacity for the inventory pool
- For multi-day stays (camp-stay, fighter+stay): a check-in date is disabled if ANY night in the resulting range is full

**Race condition:** Two clients paying simultaneously for the last slot. Second arrives after first's insert → `checkRangeAvailability` fails → 409 returned → Stripe Session never created. Acceptable ~50ms window for this volume.

---

## 7. Calendar Visual Refonte

Applies to BOTH public (`DatePicker`, `AvailabilityCalendar`) and admin (`AdminCalendar`).

**Decision:** Remove `react-day-picker/dist/style.css` import. Style entirely via Tailwind `classNames`.

**Shared tokens file: `src/components/ui/calendar-tokens.ts`**

Exports a complete `classNames` object for react-day-picker v9.

**Visual spec (Ratchawat Bold design system):**

| Element | Style |
|---|---|
| Container | `surface-lowest`, no border (contrast by background), `rounded-lg`, `p-4` |
| Month header | Barlow Condensed bold uppercase, orange primary nav arrows |
| Weekday labels | Inter uppercase xs, `on-surface-variant` |
| Day cell (normal) | `on-surface`, 44x44px min (WCAG touch target), `rounded-md` |
| Day cell (hover) | `ring-2 ring-primary` |
| Day cell (selected) | `bg-primary` (#ff6600), white text, bold |
| Day cell (today) | `ring-1 ring-primary`, no background |
| Day cell (disabled) | opacity 30%, line-through, no hover |
| Day cell (outside month) | opacity 20% |
| Transitions | `transition-colors duration-150` |
| Mobile | Full-width, cells stretch to fill |

Two component variants sharing these tokens:
1. `<DatePicker />` — refactored public component (clean blocking)
2. `<AdminCalendar />` — admin component (occupancy badges per cell, click → drawer)

---

## 8. Private Slot Correction

### Old slots (4)
`09:00, 11:00, 14:00, 16:00`

### New slots (7)
`08:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00`

### Centralized config

**File: `src/lib/config/slots.ts`**

```typescript
export const PRIVATE_SLOTS = [
  "08:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
] as const;

export type PrivateSlot = (typeof PRIVATE_SLOTS)[number];
```

All files import from this single source of truth.

### Migration

```sql
UPDATE availability_blocks
SET time_slot = '08:00'
WHERE time_slot = '09:00' AND type IN ('private', 'all');
```

### Files to update

- `src/components/booking/AvailabilityCalendar.tsx` — replace `ALL_SLOTS` with `PRIVATE_SLOTS` import
- `src/app/booking/private/PrivateWizard.tsx` — replace hardcoded slots with `PRIVATE_SLOTS` import
- Admin drawer — 7 toggles from `PRIVATE_SLOTS`

---

## 9. API Routes Summary

### New admin routes (all verify `is_admin` server-side, return 401 if not)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/admin/signout` | Sign out, clear cookies |
| POST | `/api/admin/bookings/[id]/status` | Update booking status `{ status }` |
| POST | `/api/admin/bookings/[id]/notes` | Update notes `{ notes }` |
| POST | `/api/admin/bookings/[id]/resend-email` | Resend confirmation email |
| POST | `/api/admin/availability` | Create availability block `{ date, type, time_slot?, reason? }` |
| DELETE | `/api/admin/availability/[id]` | Delete availability block |

---

## 10. New Files (~25)

```
src/app/admin/
  layout.tsx
  login/page.tsx
  bookings/page.tsx
  bookings/[id]/page.tsx
  availability/page.tsx

src/components/admin/
  AdminShell.tsx
  AdminSidebar.tsx
  AdminBottomTabs.tsx
  AdminUserMenu.tsx
  AdminNavButton.tsx
  AdminCalendar.tsx
  AdminDayDrawer.tsx
  BookingsTable.tsx
  BookingsCards.tsx
  BookingsFilters.tsx
  BookingDetailHeader.tsx
  BookingClientCard.tsx
  BookingDetailsCard.tsx
  BookingStripeCard.tsx
  BookingNotesCard.tsx
  BookingActionsCard.tsx
  StatusBadge.tsx
  TypeBadge.tsx

src/lib/admin/
  inventory.ts
  availability.ts
  bookings-query.ts

src/lib/config/
  slots.ts

src/components/ui/
  calendar-tokens.ts

src/app/api/admin/
  signout/route.ts
  bookings/[id]/status/route.ts
  bookings/[id]/notes/route.ts
  bookings/[id]/resend-email/route.ts
  availability/route.ts
  availability/[id]/route.ts

scripts/
  create-admin.ts

supabase/migrations/
  20260413000000_admin_profiles.sql
  20260413000001_fix_private_slots.sql
```

## 11. Modified Files (~8)

```
src/middleware.ts                                   — add /admin/* protection, remove /account
src/lib/supabase/middleware.ts                      — refactor auth check for admin
src/components/booking/DatePicker.tsx               — full CSS refonte (remove style.css)
src/components/booking/AvailabilityCalendar.tsx     — PRIVATE_SLOTS import + capacity check
src/components/layout/Header.tsx                    — add <AdminNavButton />
src/app/booking/private/PrivateWizard.tsx           — PRIVATE_SLOTS import
src/app/api/checkout/route.ts                       — add capacity check before Stripe
src/app/api/webhooks/stripe/route.ts                — confirm expired session handling
```

## 12. Docs to Update

```
ARCHITECTURE.md     — Section 4 (slots), Section 5 (profiles table), Section 8 (admin routes)
PROJET-STATUS.md    — Phase 4 done, known issues updates
ROADMAP.md          — Phase 4 task checkboxes, pending #56 resolved
```

## 13. Success Criteria

1. Admin logs in via `/admin/login` with Supabase Auth credentials
2. Admin views paginated bookings list with working filters (type, status, date, search)
3. Admin views booking detail, transitions status, edits notes, resends email
4. Admin views availability calendar with real-time occupancy display (rooms/bungalows)
5. Admin blocks/unblocks dates and private slots via day drawer
6. Client booking flow greys out dates where capacity is full
7. `/api/checkout` rejects overbooking with 409 error
8. RLS policies gated by `is_admin()` (Supabase advisor lint 0024 resolved)
9. Calendar on public booking pages has proper dark theme styling (Ratchawat Bold)
10. Private slots are 08:00, 11:00-16:00 (7 slots) everywhere
11. No unauthenticated access to any `/admin/*` route except `/admin/login`
12. `npm run build` passes with 0 errors
