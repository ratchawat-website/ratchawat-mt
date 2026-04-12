# Booking & Availability System Audit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all booking/availability bugs, add admin "Create Booking", unify date formats, fix calendar navigation, confirm Fighter+Room pricing.

**Architecture:** Fix DB constraint for availability_blocks types, create shared date-formatting helpers, add admin booking creation API + form, sync private-slot bookings with availability_blocks, fix client calendar nav and block filters.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Supabase (Postgres), Tailwind CSS v4, date-fns, react-day-picker v9, Zod

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `src/lib/utils/date-format.ts` | Shared date formatting helpers (formatDateShort, formatDateLong, formatDateISO) |
| `src/app/api/admin/bookings/route.ts` | POST endpoint for admin manual booking creation |
| `src/components/admin/CreateBookingForm.tsx` | Client component: admin booking creation form |
| `src/lib/validation/admin-booking.ts` | Zod schema for admin booking creation (relaxed vs client) |
| `supabase/migrations/20260413000002_fix_availability_block_types.sql` | Fix CHECK constraint on availability_blocks.type |

### Modified files
| File | Changes |
|------|---------|
| `src/content/pricing.ts` | Remove priceTodo from fighter-stay-room-monthly, update notes |
| `src/app/accommodation/page.tsx` | Fighter+Room button → booking link |
| `src/components/booking/AvailabilityCalendar.tsx` | Fix block type filter, remove "all" type reference |
| `src/components/booking/DatePicker.tsx` | Fix month nav button visibility |
| `src/components/ui/calendar-tokens.ts` | Fix nav button styles |
| `src/components/admin/AdminDayDrawer.tsx` | Remove camp-stay block, fix types to private-slot, add "Create Booking" link |
| `src/app/admin/(dashboard)/availability/page.tsx` | Update block type references in hasBlock check |
| `src/app/admin/(dashboard)/bookings/page.tsx` | Add "Create Booking" button + form integration |
| `src/components/admin/BookingsTable.tsx` | Use formatDateShort |
| `src/components/admin/BookingsCards.tsx` | Use formatDateShort |
| `src/app/admin/(dashboard)/bookings/[id]/page.tsx` | Use formatDateLong |
| `src/app/booking/camp-stay/CampStayWizard.tsx` | Use formatDateLong |
| `src/app/booking/private/PrivateWizard.tsx` | Use formatDateLong |
| `src/app/booking/fighter/FighterWizard.tsx` | Use formatDateLong |
| `src/app/booking/confirmed/page.tsx` | Use formatDateShort for dates |
| `src/app/api/checkout/route.ts` | Create private-slot block on private booking |
| `src/app/api/webhooks/stripe/route.ts` | Create private-slot block on payment confirmed (private type) |
| `src/app/api/admin/bookings/[id]/status/route.ts` | Delete private-slot block on cancellation |

---

### Task 1: Supabase migration — fix availability_blocks type constraint

**Files:**
- Create: `supabase/migrations/20260413000002_fix_availability_block_types.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Fix availability_blocks type constraint
-- Old: ('private','camp-stay','all')
-- New: ('private','private-slot','full')

-- Remove rows with deprecated types
DELETE FROM availability_blocks WHERE type IN ('camp-stay', 'all');

-- Drop old constraint and add new one
ALTER TABLE availability_blocks DROP CONSTRAINT availability_blocks_type_check;
ALTER TABLE availability_blocks
  ADD CONSTRAINT availability_blocks_type_check
  CHECK (type IN ('private', 'private-slot', 'full'));
```

- [ ] **Step 2: Apply migration via Supabase MCP**

Run the migration using the Supabase MCP `apply_migration` tool with name `fix_availability_block_types` and the SQL above.

- [ ] **Step 3: Verify constraint**

Run via Supabase MCP `execute_sql`:
```sql
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'availability_blocks'::regclass AND contype = 'c';
```

Expected: constraint shows `CHECK ((type = ANY (ARRAY['private'::text, 'private-slot'::text, 'full'::text])))`

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260413000002_fix_availability_block_types.sql
git commit -m "fix(db): update availability_blocks type constraint to (private, private-slot, full)"
```

---

### Task 2: Create shared date formatting helpers

**Files:**
- Create: `src/lib/utils/date-format.ts`

- [ ] **Step 1: Create the date format utility**

```typescript
import { format, parseISO } from "date-fns";

/**
 * Short format: "Apr 12, 2026"
 * Use in: tables, cards, lists, confirmation page
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "MMM d, yyyy");
}

/**
 * Long format: "Saturday, April 12, 2026"
 * Use in: wizard review steps, booking detail page
 */
export function formatDateLong(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEEE, MMMM d, yyyy");
}

/**
 * ISO format: "2026-04-12"
 * Use in: API calls, DB queries, form values
 */
export function formatDateISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

Expected: build succeeds (new file, no consumers yet).

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils/date-format.ts
git commit -m "feat: add shared date formatting helpers (short, long, ISO)"
```

---

### Task 3: Unify date formats across all pages

**Files:**
- Modify: `src/components/admin/BookingsTable.tsx`
- Modify: `src/components/admin/BookingsCards.tsx`
- Modify: `src/app/admin/(dashboard)/bookings/[id]/page.tsx`
- Modify: `src/app/booking/camp-stay/CampStayWizard.tsx`
- Modify: `src/app/booking/private/PrivateWizard.tsx`
- Modify: `src/app/booking/fighter/FighterWizard.tsx`
- Modify: `src/app/booking/confirmed/page.tsx`

- [ ] **Step 1: Fix BookingsTable.tsx**

Add import at top:
```typescript
import { formatDateShort } from "@/lib/utils/date-format";
```

Replace the Created column cell (line 64-68):
```typescript
// OLD:
{new Date(booking.created_at).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})}

// NEW:
{formatDateShort(booking.created_at)}
```

Replace the Dates column cell (line 84-88):
```typescript
// OLD:
{booking.start_date}
{booking.end_date && booking.end_date !== booking.start_date
  ? ` - ${booking.end_date}`
  : ""}

// NEW:
{formatDateShort(booking.start_date)}
{booking.end_date && booking.end_date !== booking.start_date
  ? ` - ${formatDateShort(booking.end_date)}`
  : ""}
```

- [ ] **Step 2: Fix BookingsCards.tsx**

Add import at top:
```typescript
import { formatDateShort } from "@/lib/utils/date-format";
```

Replace the dates section (line 51-56):
```typescript
// OLD:
{booking.start_date}
{booking.end_date && booking.end_date !== booking.start_date
  ? ` - ${booking.end_date}`
  : ""}

// NEW:
{formatDateShort(booking.start_date)}
{booking.end_date && booking.end_date !== booking.start_date
  ? ` - ${formatDateShort(booking.end_date)}`
  : ""}
```

- [ ] **Step 3: Fix booking detail page**

In `src/app/admin/(dashboard)/bookings/[id]/page.tsx`, replace the `formatDate` function (lines 22-26):

```typescript
// OLD:
function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// NEW:
import { formatDateLong } from "@/lib/utils/date-format";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return formatDateLong(dateStr);
}
```

- [ ] **Step 4: Fix CampStayWizard.tsx**

Add import at top:
```typescript
import { formatDateLong } from "@/lib/utils/date-format";
```

Remove the local `formatDate` function (lines 50-56). Replace all usages:

```typescript
// OLD: formatDate(checkIn) / formatDate(checkOut)
// NEW: formatDateLong(checkIn) / formatDateLong(checkOut)
```

There are 4 usages: 2 in the check-in display (step 1) and 2 in the review step (step 3).

- [ ] **Step 5: Fix PrivateWizard.tsx**

Add import at top:
```typescript
import { formatDateLong } from "@/lib/utils/date-format";
```

Replace the date formatting in step 4 review (line 303):
```typescript
// OLD:
value: date.toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
}),

// NEW:
value: formatDateLong(date),
```

- [ ] **Step 6: Fix FighterWizard.tsx**

Add import at top:
```typescript
import { formatDateLong } from "@/lib/utils/date-format";
```

Replace the date formatting in the review step where `date.toLocaleDateString(...)` is used with `formatDateLong(date)`. The fighter wizard has the same pattern as PrivateWizard — find the `toLocaleDateString` call in the Review step and replace it.

- [ ] **Step 7: Fix confirmed page**

In `src/app/booking/confirmed/page.tsx`, add import:
```typescript
import { formatDateShort } from "@/lib/utils/date-format";
```

Replace the raw date displays (lines 134 and 141):
```typescript
// OLD:
{booking.startDate}
// NEW:
{formatDateShort(booking.startDate)}

// OLD:
{booking.endDate}
// NEW:
{formatDateShort(booking.endDate)}
```

- [ ] **Step 8: Verify build**

```bash
npm run lint && npm run build 2>&1 | tail -5
```

Expected: 0 lint errors, build succeeds.

- [ ] **Step 9: Commit**

```bash
git add src/components/admin/BookingsTable.tsx src/components/admin/BookingsCards.tsx src/app/admin/\(dashboard\)/bookings/\[id\]/page.tsx src/app/booking/camp-stay/CampStayWizard.tsx src/app/booking/private/PrivateWizard.tsx src/app/booking/fighter/FighterWizard.tsx src/app/booking/confirmed/page.tsx
git commit -m "fix: unify date formats across all pages (short: Apr 12, 2026 / long: Saturday, April 12, 2026)"
```

---

### Task 4: Fix calendar month navigation visibility

**Files:**
- Modify: `src/components/ui/calendar-tokens.ts`
- Modify: `src/components/booking/DatePicker.tsx`

- [ ] **Step 1: Debug the nav button visibility**

Read `src/components/ui/calendar-tokens.ts` and `src/components/booking/DatePicker.tsx`. The current `button_previous` and `button_next` classes use `absolute left-0` / `absolute right-0`, and the parent `month_caption` uses `relative`. The issue is that the `month_caption` class has `flex justify-center relative items-center h-10` but the container or parent may clip the absolutely positioned buttons.

Check: `DayPicker` renders nav buttons inside the caption. The `month_caption` needs enough width for the absolute-positioned buttons to be visible. The `root` class is `w-full flex flex-col items-center` which constrains width.

- [ ] **Step 2: Fix the calendar token styles**

In `src/components/ui/calendar-tokens.ts`:

```typescript
// The issue: month_caption needs to be full-width for absolute nav buttons to show.
// The months container also needs full width.

export const calendarClassNames: Partial<ClassNames> = {
  root: "w-full flex flex-col items-center",
  months: "flex flex-col w-full",              // ADD w-full
  month: "space-y-4 w-full",                   // ADD w-full
  month_caption: "flex justify-center relative items-center h-10 w-full",  // ADD w-full
  caption_label: "font-serif font-bold text-on-surface text-lg uppercase tracking-wide",
  nav: "flex items-center gap-1",
  button_previous: "absolute left-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors",
  button_next: "absolute right-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors",
  weekdays: "flex w-full",                     // ADD w-full
  weekday: "text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest w-11 h-8 flex items-center justify-center",
  week: "flex mt-1",
  day: "relative w-11 h-11 flex items-center justify-center",
  day_button: "w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium text-on-surface hover:ring-2 hover:ring-primary transition-colors duration-150 cursor-pointer",
  selected: "!bg-primary !text-on-primary font-bold rounded-md ring-0 hover:!ring-0",
  today: "ring-1 ring-primary rounded-md",
  disabled: "!text-on-surface-variant/30 !bg-surface-low/50 line-through pointer-events-none hover:ring-0 rounded-md opacity-40",
  outside: "!text-on-surface-variant/20",
  hidden: "invisible",
};
```

The key changes are adding `w-full` to `months`, `month`, `month_caption`, and `weekdays` so the calendar grid takes full container width and the absolute-positioned nav buttons have room to render.

- [ ] **Step 3: Test in browser**

Start dev server if not running. Navigate to `/booking/camp-stay`, select a package, verify:
- Left/right arrows visible next to month name
- Clicking arrows changes month
- Calendar remains centered

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/calendar-tokens.ts
git commit -m "fix(calendar): make month navigation arrows visible by adding w-full to calendar containers"
```

---

### Task 5: Fix client AvailabilityCalendar block type filter

**Files:**
- Modify: `src/components/booking/AvailabilityCalendar.tsx`

- [ ] **Step 1: Fix the Supabase query filter**

In `src/components/booking/AvailabilityCalendar.tsx`, the current block query (lines 43-55):

```typescript
// OLD (line 49):
.in("type", [type, "all"])

// NEW — different filter per booking type:
```

Replace the entire blocks query section:

```typescript
// Determine which block types to fetch based on booking type
const blockTypes = type === "private"
  ? ["full", "private", "private-slot"]
  : ["full"];  // camp-stay/fighter: only full closures block calendar

const blocksPromise = supabase
  .from("availability_blocks")
  .select("date, time_slot, type")
  .in("type", blockTypes)
  .eq("is_blocked", true)
  .then(({ data, error }) => {
    if (error) {
      console.error("Failed to load availability:", error);
      return [];
    }
    return data ?? [];
  });
```

- [ ] **Step 2: Update disabledDays logic for "full" blocks**

In the `disabledDays` useMemo (around line 78), the logic that processes blocks needs to treat `type=full` as blocking the whole day:

```typescript
const disabledDays: Matcher[] = useMemo(() => {
  const blockedDates = new Set<string>();
  const dateSlotMap = new Map<string, Set<string>>();

  for (const block of blocks) {
    // "full" and "private" block the entire day
    if (block.type === "full" || block.type === "private" || !block.time_slot) {
      blockedDates.add(block.date);
    } else {
      // "private-slot" — block individual slot
      if (!dateSlotMap.has(block.date)) dateSlotMap.set(block.date, new Set());
      dateSlotMap.get(block.date)!.add(block.time_slot);
    }
  }

  if (type === "private") {
    // If all slots for a date are blocked, disable the whole day
    for (const [date, slots] of dateSlotMap.entries()) {
      if (slots.size >= PRIVATE_SLOTS.length) blockedDates.add(date);
    }
  }

  // Capacity-based blocking (unchanged — keep existing logic)
  if (inventoryKey) {
    const capacity = INVENTORY[inventoryKey];
    const duration = stayDurationDays ?? 1;

    if (duration > 1) {
      for (const [dateStr, count] of Object.entries(occupancy)) {
        if (count < capacity) continue;
        const nightDate = new Date(dateStr + "T00:00:00");
        for (let offset = 0; offset < duration; offset++) {
          const checkInDate = new Date(nightDate.getTime() - offset * 86400000);
          blockedDates.add(format(checkInDate, "yyyy-MM-dd"));
        }
      }
    } else {
      for (const [dateStr, count] of Object.entries(occupancy)) {
        if (count >= capacity) blockedDates.add(dateStr);
      }
    }
  }

  return Array.from(blockedDates).map((d) => new Date(d + "T00:00:00"));
}, [blocks, type, occupancy, inventoryKey, stayDurationDays]);
```

- [ ] **Step 3: Verify build**

```bash
npm run lint && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/components/booking/AvailabilityCalendar.tsx
git commit -m "fix(calendar): fix block type filter — use full/private/private-slot, remove deprecated 'all' type"
```

---

### Task 6: Private booking → availability_blocks sync

**Files:**
- Modify: `src/app/api/checkout/route.ts`
- Modify: `src/app/api/webhooks/stripe/route.ts`
- Modify: `src/app/api/admin/bookings/[id]/status/route.ts`

- [ ] **Step 1: Add private-slot block creation in checkout API**

In `src/app/api/checkout/route.ts`, after the booking insert succeeds (after line 87), add:

```typescript
// If this is a private session, create an availability block for the slot
if (data.type === "private" && data.time_slot) {
  await supabase
    .from("availability_blocks")
    .insert({
      date: data.start_date,
      type: "private-slot",
      time_slot: data.time_slot,
      is_blocked: true,
      reason: `Booking ${booking.id}`,
    });
}
```

Note: `supabase` here is already `createAdminClient()` (line 66), so it bypasses RLS.

- [ ] **Step 2: Add private-slot block creation in Stripe webhook**

In `src/app/api/webhooks/stripe/route.ts`, inside the `checkout.session.completed` handler, after the booking status is updated to `confirmed`, add:

Read the booking data to check if it's a private session:

```typescript
// After updating booking status to 'confirmed':
// Check if this is a private session and create availability block
const { data: confirmedBooking } = await supabase
  .from("bookings")
  .select("type, start_date, time_slot")
  .eq("id", bookingId)
  .single();

if (confirmedBooking?.type === "private" && confirmedBooking.time_slot) {
  await supabase
    .from("availability_blocks")
    .upsert(
      {
        date: confirmedBooking.start_date,
        type: "private-slot" as const,
        time_slot: confirmedBooking.time_slot,
        is_blocked: true,
        reason: `Booking ${bookingId}`,
      },
      { onConflict: "date,type,time_slot", ignoreDuplicates: true }
    )
    .then(() => {}); // ignore upsert errors — block may already exist from checkout
}
```

Note: The block may already exist from the checkout step. Use upsert with ignoreDuplicates or just catch and ignore the error. Since `availability_blocks` doesn't have a unique constraint on (date, type, time_slot), use a simple insert wrapped in a try/catch or check for existing first:

```typescript
if (confirmedBooking?.type === "private" && confirmedBooking.time_slot) {
  // Check if block already exists (created during checkout)
  const { data: existingBlock } = await supabase
    .from("availability_blocks")
    .select("id")
    .eq("date", confirmedBooking.start_date)
    .eq("type", "private-slot")
    .eq("time_slot", confirmedBooking.time_slot)
    .maybeSingle();

  if (!existingBlock) {
    await supabase
      .from("availability_blocks")
      .insert({
        date: confirmedBooking.start_date,
        type: "private-slot",
        time_slot: confirmedBooking.time_slot,
        is_blocked: true,
        reason: `Booking ${bookingId}`,
      });
  }
}
```

- [ ] **Step 3: Add private-slot block deletion on cancellation**

In `src/app/api/admin/bookings/[id]/status/route.ts`, after the status update succeeds, if the new status is `cancelled` and the booking is a private session, delete the corresponding block:

```typescript
// After successful status update:
if (status === "cancelled") {
  // Fetch booking to check if private with time_slot
  const { data: cancelledBooking } = await supabase
    .from("bookings")
    .select("type, start_date, time_slot")
    .eq("id", id)
    .single();

  if (cancelledBooking?.type === "private" && cancelledBooking.time_slot) {
    await supabase
      .from("availability_blocks")
      .delete()
      .eq("date", cancelledBooking.start_date)
      .eq("type", "private-slot")
      .eq("time_slot", cancelledBooking.time_slot)
      .eq("reason", `Booking ${id}`);
  }
}
```

- [ ] **Step 4: Verify build**

```bash
npm run lint && npm run build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/checkout/route.ts src/app/api/webhooks/stripe/route.ts src/app/api/admin/bookings/\[id\]/status/route.ts
git commit -m "feat: sync private bookings with availability_blocks (create on book, delete on cancel)"
```

---

### Task 7: Update admin availability drawer — remove camp-stay block, fix types

**Files:**
- Modify: `src/components/admin/AdminDayDrawer.tsx`
- Modify: `src/app/admin/(dashboard)/availability/page.tsx`

- [ ] **Step 1: Update AdminDayDrawer block types**

In `src/components/admin/AdminDayDrawer.tsx`, update the `BLOCK_TYPES` constant (line 26-30):

```typescript
// OLD:
const BLOCK_TYPES = [
  { type: "camp-stay", label: "Block camp-stay rooms" },
  { type: "private", label: "Block all private sessions" },
  { type: "full", label: "Block everything (camp closed)" },
] as const;

// NEW:
const BLOCK_TYPES = [
  { type: "private", label: "Block all private sessions" },
  { type: "full", label: "Block everything (camp closed)" },
] as const;
```

- [ ] **Step 2: Fix private slot toggle type**

In `AdminDayDrawer.tsx`, the `toggleSlotBlock` function (line 87) sends `type: "private-slot"` which is correct but was failing due to the old DB constraint. With the new constraint from Task 1, this will work. Verify the function sends the right type:

```typescript
async function toggleSlotBlock(slot: string) {
  const existing = hasExactBlock("private-slot", slot);
  // ... rest is correct
}
```

This is already correct in the code. No change needed here.

- [ ] **Step 3: Add "Create Booking" link in drawer**

In `AdminDayDrawer.tsx`, after the Occupancy section and before the Reason field, add a link button:

```tsx
{/* Quick actions */}
<section>
  <a
    href={`/admin/bookings?create=1&date=${dateStr}`}
    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 border-primary bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
  >
    + Create Booking for {format(date, "MMM d")}
  </a>
</section>
```

Import `format` is already imported from date-fns.

- [ ] **Step 4: Update availability page hasBlock logic**

In `src/app/admin/(dashboard)/availability/page.tsx`, update the `hasBlock` computation (around line 64):

```typescript
// OLD:
const hasBlock = blockList.some(
  (b) =>
    b.date === d &&
    (b.type === "full" || b.type === "camp-stay" || b.type === "private"),
);

// NEW:
const hasBlock = blockList.some(
  (b) =>
    b.date === d &&
    (b.type === "full" || b.type === "private"),
);
```

- [ ] **Step 5: Verify build**

```bash
npm run lint && npm run build 2>&1 | tail -5
```

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/AdminDayDrawer.tsx src/app/admin/\(dashboard\)/availability/page.tsx
git commit -m "fix(admin): remove camp-stay block, fix drawer types, add Create Booking link"
```

---

### Task 8: Admin booking validation schema

**Files:**
- Create: `src/lib/validation/admin-booking.ts`

- [ ] **Step 1: Create the admin booking Zod schema**

```typescript
import { z } from "zod";
import { PRIVATE_SLOTS } from "@/lib/config/slots";

export const AdminBookingSchema = z.object({
  type: z.enum(["training", "private", "camp-stay", "fighter"]),
  price_id: z.string().min(1),
  camp: z.enum(["bo-phut", "plai-laem", "both"]),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time_slot: z.enum(PRIVATE_SLOTS).optional(),
  num_participants: z.number().int().min(1).max(10).default(1),
  client_name: z.string().trim().min(1).max(100),
  client_email: z.string().trim().email().max(200).optional().or(z.literal("")),
  client_phone: z.string().trim().max(30).optional().or(z.literal("")),
  client_nationality: z.string().trim().max(60).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  price_amount: z.number().int().min(0).optional(),
});

export type AdminBookingRequest = z.infer<typeof AdminBookingSchema>;
```

Key differences from client schema:
- `client_email` and `client_phone` are optional (walk-ins)
- `num_participants` max is 10 (admin may book for a group)
- `price_amount` can be overridden (may be 0 for comped stays)
- `client_name` min is 1 (not 2, admin might write "Walk-in")

- [ ] **Step 2: Commit**

```bash
git add src/lib/validation/admin-booking.ts
git commit -m "feat: add admin booking validation schema (relaxed email/phone, overridable amount)"
```

---

### Task 9: Admin create booking API endpoint

**Files:**
- Create: `src/app/api/admin/bookings/route.ts`

- [ ] **Step 1: Create the API endpoint**

```typescript
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminBookingSchema } from "@/lib/validation/admin-booking";
import { getPriceById } from "@/content/pricing";
import { getInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability } from "@/lib/admin/availability";

export async function POST(request: Request) {
  // Auth check
  const supabase = await createClient();
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = AdminBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const pkg = getPriceById(data.price_id);
  if (!pkg) {
    return NextResponse.json({ error: "Unknown price_id" }, { status: 400 });
  }

  // Calculate amount: admin override > catalog price * participants
  const priceAmount =
    data.price_amount ?? (pkg.price ?? 0) * data.num_participants;

  // Capacity check for accommodation types
  const inventoryKey = getInventoryKey(data.price_id);
  if (inventoryKey && data.start_date && data.end_date) {
    const check = await checkRangeAvailability(
      inventoryKey,
      data.start_date,
      data.end_date,
    );
    if (!check.ok) {
      return NextResponse.json(
        { error: `No availability on ${check.conflictDate}. Choose different dates.` },
        { status: 409 },
      );
    }
  }

  // Check private slot availability
  if (data.type === "private" && data.time_slot) {
    const admin = createAdminClient();
    const { data: existingBlock } = await admin
      .from("availability_blocks")
      .select("id")
      .eq("date", data.start_date)
      .eq("time_slot", data.time_slot)
      .in("type", ["private-slot", "private", "full"])
      .maybeSingle();

    if (existingBlock) {
      return NextResponse.json(
        { error: `Time slot ${data.time_slot} is already blocked on ${data.start_date}.` },
        { status: 409 },
      );
    }
  }

  // Insert booking
  const admin = createAdminClient();
  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      type: data.type,
      status: "confirmed",
      price_id: data.price_id,
      price_amount: priceAmount,
      num_participants: data.num_participants,
      start_date: data.start_date,
      end_date: data.end_date ?? null,
      time_slot: data.time_slot ?? null,
      camp: data.camp,
      client_name: data.client_name,
      client_email: data.client_email || null,
      client_phone: data.client_phone || null,
      client_nationality: data.client_nationality || null,
      notes: data.notes || null,
    })
    .select("id")
    .single();

  if (error || !booking) {
    console.error("Admin booking insert error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 },
    );
  }

  // Create private-slot block if private session
  if (data.type === "private" && data.time_slot) {
    await admin
      .from("availability_blocks")
      .insert({
        date: data.start_date,
        type: "private-slot",
        time_slot: data.time_slot,
        is_blocked: true,
        reason: `Booking ${booking.id}`,
      });
  }

  return NextResponse.json({ ok: true, id: booking.id });
}
```

- [ ] **Step 2: Verify build**

```bash
npm run lint && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/bookings/route.ts
git commit -m "feat(admin): add POST /api/admin/bookings for manual booking creation"
```

---

### Task 10: Admin "Create Booking" form component

**Files:**
- Create: `src/components/admin/CreateBookingForm.tsx`

- [ ] **Step 1: Create the form component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PRICES, type PriceItem } from "@/content/pricing";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { formatDateISO } from "@/lib/utils/date-format";

const BOOKING_TYPES = [
  { value: "training", label: "Training" },
  { value: "private", label: "Private Lesson" },
  { value: "camp-stay", label: "Camp Stay" },
  { value: "fighter", label: "Fighter Program" },
] as const;

const CAMPS = [
  { value: "bo-phut", label: "Bo Phut" },
  { value: "plai-laem", label: "Plai Laem" },
  { value: "both", label: "Both (Plai Laem stay)" },
] as const;

interface Props {
  defaultDate?: string;
  onClose: () => void;
}

function getPackagesForType(type: string): PriceItem[] {
  return PRICES.filter((p) => p.bookingType === type);
}

function needsEndDate(type: string): boolean {
  return type === "camp-stay" || type === "fighter";
}

function needsTimeSlot(type: string): boolean {
  return type === "private";
}

function getDefaultCamp(priceId: string | null, type: string): string {
  if (!priceId) return "bo-phut";
  if (priceId.includes("stay") || priceId.includes("bungalow")) return "plai-laem";
  if (type === "camp-stay") return "both";
  return "bo-phut";
}

export default function CreateBookingForm({ defaultDate, onClose }: Props) {
  const router = useRouter();
  const [type, setType] = useState("training");
  const [priceId, setPriceId] = useState("");
  const [camp, setCamp] = useState("bo-phut");
  const [startDate, setStartDate] = useState(defaultDate ?? "");
  const [endDate, setEndDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [numParticipants, setNumParticipants] = useState(1);
  const [priceAmount, setPriceAmount] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packages = getPackagesForType(type);
  const selectedPkg = PRICES.find((p) => p.id === priceId);

  // Auto-calculate price when package or participants change
  useEffect(() => {
    if (selectedPkg?.price) {
      setPriceAmount(selectedPkg.price * numParticipants);
    }
  }, [selectedPkg, numParticipants]);

  // Auto-set camp when package changes
  useEffect(() => {
    setCamp(getDefaultCamp(priceId, type));
  }, [priceId, type]);

  // Reset package when type changes
  useEffect(() => {
    setPriceId("");
    setTimeSlot("");
    setEndDate("");
  }, [type]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!priceId || !startDate || !clientName) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          price_id: priceId,
          camp,
          start_date: startDate,
          end_date: endDate || undefined,
          time_slot: timeSlot || undefined,
          num_participants: numParticipants,
          client_name: clientName,
          client_email: clientEmail || undefined,
          client_phone: clientPhone || undefined,
          client_nationality: nationality || undefined,
          notes: notes || undefined,
          price_amount: typeof priceAmount === "number" ? priceAmount : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create booking");
        return;
      }

      onClose();
      router.refresh();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5";
  const selectClass = `${inputClass} appearance-none`;

  return (
    <div className="bg-surface border-2 border-primary/30 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-lg font-bold text-on-surface uppercase tracking-tight">
          Create Booking
        </h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-lowest transition-colors"
          aria-label="Close form"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Type + Package */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={selectClass}
            >
              {BOOKING_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Package</label>
            <select
              value={priceId}
              onChange={(e) => setPriceId(e.target.value)}
              className={selectClass}
              required
            >
              <option value="">Select package...</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.nameShort} — {pkg.price?.toLocaleString("en-US") ?? "?"} THB
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Camp + Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Camp</label>
            <select
              value={camp}
              onChange={(e) => setCamp(e.target.value)}
              className={selectClass}
            >
              {CAMPS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>
          {needsEndDate(type) && (
            <div>
              <label className={labelClass}>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
          {needsTimeSlot(type) && (
            <div>
              <label className={labelClass}>Time Slot</label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className={selectClass}
                required
              >
                <option value="">Select slot...</option>
                {PRIVATE_SLOTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Row 3: Client info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Client Name</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Walk-in guest"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Email (optional)</label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Phone (optional)</label>
            <input
              type="text"
              value={clientPhone}
              onChange={(e) => setClientPhone(e.target.value)}
              placeholder="+66..."
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Nationality (optional)</label>
            <input
              type="text"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g. French"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Participants</label>
            <input
              type="number"
              value={numParticipants}
              onChange={(e) =>
                setNumParticipants(Math.max(1, parseInt(e.target.value) || 1))
              }
              min={1}
              max={10}
              className={inputClass}
            />
          </div>
        </div>

        {/* Row 4: Amount + Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Amount (THB)</label>
            <input
              type="number"
              value={priceAmount}
              onChange={(e) => {
                const val = e.target.value;
                setPriceAmount(val === "" ? "" : parseInt(val) || 0);
              }}
              min={0}
              className={inputClass}
              placeholder="Auto-calculated"
            />
            <p className="text-[10px] text-on-surface-variant mt-1">
              Auto-filled from package. Edit to override.
            </p>
          </div>
          <div>
            <label className={labelClass}>Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Error + Submit */}
        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !priceId || !startDate || !clientName}
            className="px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          >
            {submitting ? "Creating..." : "Create Booking"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border-2 border-outline-variant text-on-surface-variant text-sm font-semibold hover:border-primary hover:text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run lint && npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add src/components/admin/CreateBookingForm.tsx
git commit -m "feat(admin): add CreateBookingForm component for manual booking creation"
```

---

### Task 11: Integrate Create Booking form into admin bookings page

**Files:**
- Modify: `src/app/admin/(dashboard)/bookings/page.tsx`

- [ ] **Step 1: Convert to hybrid page with client wrapper**

The bookings page is a server component that uses `searchParams`. We need to add a client-side toggle for the create form. Create a small client wrapper.

Add a new file `src/components/admin/BookingsHeader.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import CreateBookingForm from "./CreateBookingForm";

export default function BookingsHeader() {
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);

  // Open form if ?create=1 is in URL (from availability drawer link)
  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setShowForm(true);
    }
  }, [searchParams]);

  const defaultDate = searchParams.get("date") ?? undefined;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          {/* Title is rendered by server parent — this just handles the button */}
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            + Create Booking
          </button>
        )}
      </div>

      {showForm && (
        <CreateBookingForm
          defaultDate={defaultDate}
          onClose={() => setShowForm(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Update the bookings page to use the header**

In `src/app/admin/(dashboard)/bookings/page.tsx`, add the import and replace the header section:

```tsx
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { queryBookings, PAGE_SIZE } from "@/lib/admin/bookings-query";
import BookingsFilters from "@/components/admin/BookingsFilters";
import BookingsTable from "@/components/admin/BookingsTable";
import BookingsCards from "@/components/admin/BookingsCards";
import BookingsHeader from "@/components/admin/BookingsHeader";

// ... (keep PageProps, buildPageParams unchanged)

export default async function AdminBookingsPage({ searchParams }: PageProps) {
  const sp = await searchParams;

  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const params = {
    type: sp.type,
    status: sp.status,
    from: sp.from,
    to: sp.to,
    q: sp.q,
    page,
  };

  const { bookings, total } = await queryBookings(params);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="space-y-6">
      {/* Header with Create Booking button */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-on-surface uppercase tracking-tight">
          Bookings
        </h1>
        <p className="text-on-surface-variant text-sm mt-0.5">
          {total === 0
            ? "No bookings found"
            : `${total.toLocaleString("en-US")} booking${total === 1 ? "" : "s"} total`}
        </p>
      </div>

      <Suspense>
        <BookingsHeader />
      </Suspense>

      {/* Filters */}
      <Suspense>
        <BookingsFilters />
      </Suspense>

      {/* Table (desktop) + Cards (mobile) */}
      <div className="bg-surface border-2 border-outline-variant rounded-xl overflow-hidden">
        <BookingsTable bookings={bookings} />
        <BookingsCards bookings={bookings} />
      </div>

      {/* Pagination (keep unchanged) */}
      {totalPages > 1 && (
        // ... existing pagination code unchanged
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run lint && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Test in browser**

1. Go to `/admin/bookings`
2. Click "+ Create Booking"
3. Fill form: type=camp-stay, package=Camp Stay 1 Week, dates, client name "Test Admin"
4. Submit — should see success, form closes, list refreshes
5. Go to `/admin/availability`, click a day, click "Create Booking for [date]"
6. Should open `/admin/bookings?create=1&date=2026-04-XX` with form pre-opened and date pre-filled

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/BookingsHeader.tsx src/app/admin/\(dashboard\)/bookings/page.tsx
git commit -m "feat(admin): integrate Create Booking form in bookings page with availability drawer link"
```

---

### Task 12: Confirm Fighter+Room pricing and update accommodation page

**Files:**
- Modify: `src/content/pricing.ts`
- Modify: `src/app/accommodation/page.tsx`

- [ ] **Step 1: Remove priceTodo from fighter-stay-room-monthly**

In `src/content/pricing.ts`, find the `fighter-stay-room-monthly` entry (around line 468) and:

1. Remove the `priceTodo` line entirely:
```typescript
// DELETE this line:
priceTodo: "Approximate price - pending client confirmation",
```

2. Update the notes to remove "pending confirmation":
```typescript
// OLD:
notes: "Plai Laem camp only. Electricity charged separately. Price pending final client confirmation.",

// NEW:
notes: "Plai Laem camp only. Electricity charged separately.",
```

- [ ] **Step 2: Update accommodation page fighter+room button**

In `src/app/accommodation/page.tsx`, find the Fighter + Room card. Change:

```tsx
// OLD:
<Link href="/contact" className="...">Contact Us →</Link>

// NEW:
<Link href="/booking/fighter?package=fighter-stay-room-monthly" className="...">Book Now →</Link>
```

Also update the section intro text that mentions "approximate" or "pending confirmation" — remove that language.

- [ ] **Step 3: Verify build**

```bash
npm run lint && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Test in browser**

1. Go to `/accommodation`
2. Find Fighter + Room card
3. Button should say "Book Now" and link to `/booking/fighter?package=fighter-stay-room-monthly`
4. Click it — should open FighterWizard with Fighter+Room pre-selected

- [ ] **Step 5: Commit**

```bash
git add src/content/pricing.ts src/app/accommodation/page.tsx
git commit -m "feat: confirm fighter+room at 20,000 THB, update accommodation page booking link"
```

---

### Task 13: Full integration smoke test

**Files:** None (testing only)

- [ ] **Step 1: Clear build cache and restart**

```bash
rm -rf .next && npm run dev
```

- [ ] **Step 2: Test client booking flows**

1. `/booking/camp-stay` — select 1 Week, verify:
   - Calendar shows month nav arrows (left/right)
   - Can switch months
   - Dates with `type=full` blocks are disabled (if any exist)
   - Dates at room capacity are disabled
   - Date format in review step: "Saturday, April 19, 2026"

2. `/booking/private` — select Private 1-on-1, verify:
   - Calendar shows nav arrows
   - Blocked slots show as strikethrough
   - Full days (all 7 slots blocked) show as disabled

3. `/booking/fighter` — click from `/accommodation` Fighter+Room button, verify:
   - Pre-selects "Fighter + Room" tier
   - Shows 20,000 THB (no "approximate" badge)
   - Calendar checks room capacity for 30-day stay

- [ ] **Step 3: Test admin flows**

1. `/admin/bookings` — verify:
   - Date format: "Apr 12, 2026" (not ISO, not long)
   - Amount column shows values (if data exists)
   - "+ Create Booking" button visible

2. Create manual booking:
   - Click "+ Create Booking"
   - Type: camp-stay, Package: 1 Week, Start: future date, End: start+7, Client: "Test Walk-in"
   - Submit — booking appears in list

3. `/admin/availability` — verify:
   - No "Block camp-stay rooms" toggle in drawer
   - "Block everything" and "Block all private sessions" toggles work
   - Private slot toggles work (no 500 error!)
   - "Create Booking for [date]" link works, pre-fills date in form

4. `/admin/bookings/[id]` — verify:
   - Date format: "Saturday, April 19, 2026" (long)
   - Cancel a private booking → check that the corresponding availability_block is deleted

- [ ] **Step 4: Test confirmed page format**

If you have a confirmed booking, check `/booking/confirmed?session_id=...`:
- Dates should display as "Apr 19, 2026" (short format)

- [ ] **Step 5: Verify production build**

```bash
npm run lint && npm run build
```

Expected: 0 errors for both lint and build.

- [ ] **Step 6: Commit any final fixes**

If any fixes were needed during testing, commit them:

```bash
git add -A
git commit -m "fix: integration test fixes for booking/availability audit"
```

---

### Task 14: Update documentation

**Files:**
- Modify: `PROJET-STATUS.md`
- Modify: `ARCHITECTURE.md`

- [ ] **Step 1: Update PROJET-STATUS.md**

Add a correction history entry for the booking/availability audit:
- Date: 2026-04-12
- What was fixed: availability_blocks type constraint, date format unification, calendar nav, block filter, private slot sync, admin create booking, fighter+room pricing confirmation
- Mark any relevant pages/features as updated

- [ ] **Step 2: Update ARCHITECTURE.md**

Update Section 4 (Calendar & Availability) and Section 5 (Capacity Model) to reflect:
- New block types: `('private', 'private-slot', 'full')` — removed `'camp-stay'` and `'all'`
- Admin creates manual bookings for capacity (no more "block rooms")
- Private bookings auto-create availability_blocks rows
- Unified date format helpers in `src/lib/utils/date-format.ts`

Update Section 8 (Admin) to document:
- `POST /api/admin/bookings` — manual booking creation
- Admin booking validation schema (relaxed vs client)
- Create Booking form in `/admin/bookings`

- [ ] **Step 3: Commit**

```bash
git add PROJET-STATUS.md ARCHITECTURE.md
git commit -m "docs: update PROJET-STATUS and ARCHITECTURE after booking/availability audit"
```

---

## Self-Review Checklist

### Spec coverage
| Spec Section | Task(s) |
|-------------|---------|
| Section 1: DB migration | Task 1 |
| Section 2: Admin create booking API | Task 8, 9 |
| Section 3: Admin create booking UI | Task 10, 11 |
| Section 4: Availability page redesign | Task 7 |
| Section 5a: Calendar nav | Task 4 |
| Section 5b: Block type filter | Task 5 |
| Section 5c: Private slot sync | Task 6 |
| Section 6: Date formatting | Task 2, 3 |
| Section 7: Fighter+Room | Task 12 |
| Section 8a: Amount column | Addressed in Task 13 (cache clear) |
| Section 8b: Private-slot 500 | Task 1 (constraint fix) |
| Section 8c: Full block filter | Task 5 |

### Type consistency check
- `formatDateShort` / `formatDateLong` / `formatDateISO` — consistent across Task 2, 3, 10
- `AdminBookingSchema` in Task 8 matches the API in Task 9
- `availability_blocks` types `('private','private-slot','full')` — consistent across Task 1, 5, 6, 7, 9
- `BookingsHeader` in Task 11 references `CreateBookingForm` from Task 10
- All `PRIVATE_SLOTS` imports reference `@/lib/config/slots`
