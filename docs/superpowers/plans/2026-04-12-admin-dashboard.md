# Phase 4 — Admin Dashboard + Capacity Tracking — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a protected admin dashboard at `/admin/*` with bookings management, availability calendar with room/bungalow capacity tracking, and refactored dark-theme calendar for both public and admin UIs.

**Architecture:** Supabase Auth with `profiles` table and `is_admin()` SQL function gates all admin routes. Middleware intercepts `/admin/*` requests. Capacity is computed from active bookings against fixed inventory constants (7 rooms, 1 bungalow). Calendar uses react-day-picker v9 with full Tailwind classNames (no default CSS).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Supabase (@supabase/ssr), Tailwind CSS v4, react-day-picker 9, lucide-react, date-fns 4, zod 4

---

## Task 1: Private Slots Centralization + Zod Fix

**Files:**
- Create: `src/lib/config/slots.ts`
- Modify: `src/components/booking/AvailabilityCalendar.tsx`
- Modify: `src/app/booking/private/PrivateWizard.tsx`
- Modify: `src/lib/validation/booking.ts`

- [ ] **Step 1: Create centralized slots config**

```typescript
// src/lib/config/slots.ts
export const PRIVATE_SLOTS = [
  "08:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
] as const;

export type PrivateSlot = (typeof PRIVATE_SLOTS)[number];
```

- [ ] **Step 2: Update Zod TimeSlotSchema**

In `src/lib/validation/booking.ts`, replace:

```typescript
export const TimeSlotSchema = z.enum(["09:00", "11:00", "14:00", "16:00"]);
```

With:

```typescript
import { PRIVATE_SLOTS } from "@/lib/config/slots";

export const TimeSlotSchema = z.enum(PRIVATE_SLOTS);
```

- [ ] **Step 3: Update AvailabilityCalendar**

In `src/components/booking/AvailabilityCalendar.tsx`, replace:

```typescript
const ALL_SLOTS = ["09:00", "11:00", "14:00", "16:00"];
```

With:

```typescript
import { PRIVATE_SLOTS } from "@/lib/config/slots";
```

Then replace all references to `ALL_SLOTS` with `PRIVATE_SLOTS` (3 occurrences: line 22 definition, line 63 `.length` check, line 79 `.filter`).

- [ ] **Step 4: Update PrivateWizard**

In `src/app/booking/private/PrivateWizard.tsx`, find the hardcoded slots array in `useState`:

```typescript
const [availableSlots, setAvailableSlots] = useState<string[]>([
  "09:00",
  "11:00",
  "14:00",
  "16:00",
]);
```

Replace with:

```typescript
import { PRIVATE_SLOTS } from "@/lib/config/slots";

const [availableSlots, setAvailableSlots] = useState<string[]>([
  ...PRIVATE_SLOTS,
]);
```

Also find and update any slot rendering logic that hardcodes the same values.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/lib/config/slots.ts src/components/booking/AvailabilityCalendar.tsx src/app/booking/private/PrivateWizard.tsx src/lib/validation/booking.ts
git commit -m "refactor(slots): centralize private time slots to 7 (08:00, 11:00-16:00)"
```

---

## Task 2: Supabase Migration — Profiles + RLS Tightening

**Files:**
- Create: `supabase/migrations/20260413000000_admin_profiles.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/20260413000000_admin_profiles.sql
-- Admin authentication: profiles table + is_admin() helper + RLS tightening

-- ============================================================
-- Table: profiles
-- ============================================================
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "users_read_own_profile" on profiles
  for select to authenticated using (auth.uid() = user_id);

-- ============================================================
-- Function: is_admin()
-- ============================================================
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

-- ============================================================
-- Tighten bookings RLS: replace USING (true) with is_admin()
-- ============================================================
drop policy if exists "admin_read_bookings" on bookings;
drop policy if exists "admin_update_bookings" on bookings;

create policy "admin_read_bookings" on bookings
  for select to authenticated using (public.is_admin());

create policy "admin_update_bookings" on bookings
  for update to authenticated using (public.is_admin());

-- ============================================================
-- Tighten availability_blocks RLS
-- ============================================================
drop policy if exists "admin_manage_availability" on availability_blocks;

create policy "admin_manage_availability" on availability_blocks
  for all to authenticated using (public.is_admin());
```

- [ ] **Step 2: Apply migration via MCP**

Use `mcp__supabase-ratchawat__apply_migration` with name `admin_profiles` and the SQL above.

- [ ] **Step 3: Verify via MCP**

Run `mcp__supabase-ratchawat__list_tables` — confirm `profiles` appears.
Run `mcp__supabase-ratchawat__execute_sql` with `select public.is_admin();` — should return `false` (no admin user yet).
Run `mcp__supabase-ratchawat__get_advisors` with category `security` — confirm lint 0024 no longer flags bookings or availability_blocks admin policies.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260413000000_admin_profiles.sql
git commit -m "feat(auth): add profiles table, is_admin(), tighten RLS policies"
```

---

## Task 3: Supabase Migration — Fix Private Slots Data

**Files:**
- Create: `supabase/migrations/20260413000001_fix_private_slots.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/20260413000001_fix_private_slots.sql
-- Remap 09:00 → 08:00 for existing private availability blocks

UPDATE availability_blocks
SET time_slot = '08:00'
WHERE time_slot = '09:00' AND type IN ('private', 'all');
```

- [ ] **Step 2: Apply migration via MCP**

Use `mcp__supabase-ratchawat__apply_migration` with name `fix_private_slots`.

- [ ] **Step 3: Verify via MCP**

Run `mcp__supabase-ratchawat__execute_sql`:
```sql
SELECT time_slot, count(*) FROM availability_blocks WHERE type IN ('private','all') GROUP BY time_slot ORDER BY time_slot;
```

Confirm no `09:00` rows exist.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260413000001_fix_private_slots.sql
git commit -m "fix(db): remap 09:00 → 08:00 in existing availability blocks"
```

---

## Task 4: Create Admin Script

**Files:**
- Create: `scripts/create-admin.ts`

- [ ] **Step 1: Write the script**

```typescript
// scripts/create-admin.ts
// Usage: ADMIN_EMAIL=x ADMIN_PASSWORD=y npx tsx scripts/create-admin.ts
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  if (!email || !password) {
    console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD env vars");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if user already exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);

  let userId: string;

  if (existing) {
    console.log(`User ${email} already exists (${existing.id})`);
    userId = existing.id;
  } else {
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error || !newUser?.user) {
      console.error("Failed to create user:", error);
      process.exit(1);
    }
    console.log(`Created user ${email} (${newUser.user.id})`);
    userId = newUser.user.id;
  }

  // Upsert profile with admin role
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id" });

  if (profileError) {
    console.error("Failed to upsert profile:", profileError);
    process.exit(1);
  }

  console.log(`Admin profile set for ${email}. Done.`);
}

main();
```

- [ ] **Step 2: Run the script**

```bash
source .env.local && ADMIN_EMAIL=chor.ratchawat@gmail.com ADMIN_PASSWORD=<ask-user> npx tsx scripts/create-admin.ts
```

Note: Ask user for the admin password before running. Do not hardcode it.

- [ ] **Step 3: Verify via MCP**

Run `mcp__supabase-ratchawat__execute_sql`:
```sql
SELECT p.user_id, u.email, p.role
FROM profiles p
JOIN auth.users u ON u.id = p.user_id;
```

Confirm one row with `role='admin'`.

- [ ] **Step 4: Commit**

```bash
git add scripts/create-admin.ts
git commit -m "feat(scripts): add create-admin.ts for one-time admin user setup"
```

---

## Task 5: Calendar Visual Refonte (Shared Tokens + DatePicker)

**Files:**
- Create: `src/components/ui/calendar-tokens.ts`
- Modify: `src/components/booking/DatePicker.tsx`

- [ ] **Step 1: Create calendar tokens**

```typescript
// src/components/ui/calendar-tokens.ts
// Shared Tailwind classNames for react-day-picker v9
// Used by both public DatePicker and admin AdminCalendar

import type { ClassNames } from "react-day-picker";

export const calendarClassNames: Partial<ClassNames> = {
  root: "w-full",
  months: "flex flex-col",
  month: "space-y-4",
  month_caption: "flex justify-center relative items-center h-10",
  caption_label:
    "font-serif font-bold text-on-surface text-lg uppercase tracking-wide",
  nav: "flex items-center gap-1",
  button_previous:
    "absolute left-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors",
  button_next:
    "absolute right-0 inline-flex items-center justify-center w-9 h-9 rounded-md text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-colors",
  weekdays: "flex",
  weekday:
    "text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest w-11 h-8 flex items-center justify-center",
  week: "flex mt-1",
  day: "relative w-11 h-11 flex items-center justify-center",
  day_button:
    "w-10 h-10 flex items-center justify-center rounded-md text-sm font-medium text-on-surface hover:ring-2 hover:ring-primary transition-colors duration-150 cursor-pointer",
  selected:
    "!bg-primary !text-on-primary font-bold rounded-md ring-0 hover:!ring-0",
  today: "ring-1 ring-primary rounded-md",
  disabled:
    "!text-on-surface-variant/30 line-through pointer-events-none hover:ring-0",
  outside: "!text-on-surface-variant/20",
  hidden: "invisible",
};
```

- [ ] **Step 2: Refactor DatePicker**

Replace the entire content of `src/components/booking/DatePicker.tsx`:

```typescript
"use client";

import { DayPicker, Matcher } from "react-day-picker";
import { calendarClassNames } from "@/components/ui/calendar-tokens";

interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDays?: Matcher | Matcher[];
  weekdaysDisabled?: number[];
}

export default function DatePicker({
  selected,
  onSelect,
  minDate,
  maxDate,
  disabledDays,
  weekdaysDisabled,
}: DatePickerProps) {
  const disabled: Matcher[] = [];

  if (minDate) disabled.push({ before: minDate });
  if (maxDate) disabled.push({ after: maxDate });
  if (weekdaysDisabled && weekdaysDisabled.length > 0) {
    disabled.push({ dayOfWeek: weekdaysDisabled });
  }
  if (disabledDays) {
    if (Array.isArray(disabledDays)) disabled.push(...disabledDays);
    else disabled.push(disabledDays);
  }

  return (
    <div className="bg-surface-lowest rounded-lg p-5">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        showOutsideDays
        classNames={calendarClassNames}
      />
    </div>
  );
}
```

Key change: removed `import "react-day-picker/dist/style.css"` and replaced partial `classNames` with full `calendarClassNames` from shared tokens.

- [ ] **Step 3: Verify calendar renders correctly**

Run: `npm run dev`
Navigate to `/booking/training`, `/booking/private`, `/booking/camp-stay`, `/booking/fighter`. Confirm:
- Calendar renders with dark theme (no white/light artifacts)
- Month header is Barlow Condensed bold uppercase
- Nav arrows are visible and functional
- Selected day is orange (#ff6600) with white text
- Disabled days are greyed out with line-through
- Today has subtle ring
- Cells are at least 44x44px (touch target)

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/calendar-tokens.ts src/components/booking/DatePicker.tsx
git commit -m "feat(calendar): refonte dark theme with shared Tailwind tokens, remove default rdp CSS"
```

---

## Task 6: Inventory + Capacity Helpers

**Files:**
- Create: `src/lib/admin/inventory.ts`
- Create: `src/lib/admin/availability.ts`

- [ ] **Step 1: Create inventory constants**

```typescript
// src/lib/admin/inventory.ts
export const INVENTORY = {
  rooms: 7,
  bungalows: 1,
} as const;

export type InventoryKey = "rooms" | "bungalows";

/**
 * Maps a price_id to its inventory pool.
 * Returns null for bookings that don't consume accommodation (training, private, fighter-only).
 */
export function getInventoryKey(priceId: string): InventoryKey | null {
  if (priceId.includes("bungalow")) return "bungalows";
  if (
    priceId.includes("camp-stay-room") ||
    priceId.startsWith("camp-stay-1week") ||
    priceId.startsWith("camp-stay-2weeks") ||
    priceId.startsWith("camp-stay-1month") ||
    priceId === "fighter-stay-room-monthly"
  ) {
    return "rooms";
  }
  return null;
}
```

Note: `camp-stay-1week`, `camp-stay-2weeks`, `camp-stay-1month` are room-based packages (not bungalow). Only `camp-stay-bungalow-monthly` and `fighter-stay-bungalow-monthly` consume bungalow pool.

- [ ] **Step 2: Create availability helpers**

```typescript
// src/lib/admin/availability.ts
import { createAdminClient } from "@/lib/supabase/admin";
import { INVENTORY, type InventoryKey, getInventoryKey } from "./inventory";
import { eachDayOfInterval, parseISO, subDays, format } from "date-fns";

interface BookingRange {
  start_date: string;
  end_date: string | null;
  price_id: string;
}

/**
 * Returns occupancy count per day for a date range and inventory pool.
 * Counts bookings with status IN ('pending','confirmed').
 */
export async function getOccupancyMap(
  inventoryKey: InventoryKey,
  fromDate: string,
  toDate: string,
): Promise<Map<string, number>> {
  const supabase = createAdminClient();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("start_date, end_date, price_id")
    .in("type", ["camp-stay", "fighter"])
    .in("status", ["pending", "confirmed"])
    .lte("start_date", toDate)
    .gte("end_date", fromDate);

  if (error) {
    console.error("Failed to load occupancy:", error);
    return new Map();
  }

  const map = new Map<string, number>();

  for (const booking of bookings as BookingRange[]) {
    const bookingInventory = getInventoryKey(booking.price_id);
    if (bookingInventory !== inventoryKey) continue;
    if (!booking.end_date) continue;

    // Hotel logic: checkout morning frees the night.
    // A stay from Apr 15 to Apr 22 occupies nights 15,16,17,18,19,20,21 (not 22).
    const lastNight = subDays(parseISO(booking.end_date), 1);
    const nights = eachDayOfInterval({
      start: parseISO(booking.start_date),
      end: lastNight,
    });

    for (const night of nights) {
      const key = format(night, "yyyy-MM-dd");
      if (key >= fromDate && key <= toDate) {
        map.set(key, (map.get(key) ?? 0) + 1);
      }
    }
  }

  return map;
}

/**
 * Returns available units for a single day.
 */
export async function getAvailableUnits(
  inventoryKey: InventoryKey,
  date: string,
): Promise<number> {
  const map = await getOccupancyMap(inventoryKey, date, date);
  const occupied = map.get(date) ?? 0;
  return Math.max(0, INVENTORY[inventoryKey] - occupied);
}

/**
 * Checks if an entire stay range has capacity.
 * Returns OK or the first conflict date.
 */
export async function checkRangeAvailability(
  inventoryKey: InventoryKey,
  startDate: string,
  endDate: string,
): Promise<{ ok: true } | { ok: false; conflictDate: string }> {
  const lastNight = format(subDays(parseISO(endDate), 1), "yyyy-MM-dd");
  const map = await getOccupancyMap(inventoryKey, startDate, lastNight);
  const capacity = INVENTORY[inventoryKey];

  const nights = eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(lastNight),
  });

  for (const night of nights) {
    const key = format(night, "yyyy-MM-dd");
    const occupied = map.get(key) ?? 0;
    if (occupied >= capacity) {
      return { ok: false, conflictDate: key };
    }
  }

  return { ok: true };
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/lib/admin/inventory.ts src/lib/admin/availability.ts
git commit -m "feat(capacity): add inventory model and occupancy helpers for rooms/bungalows"
```

---

## Task 7: Capacity Check in /api/checkout

**Files:**
- Modify: `src/app/api/checkout/route.ts`

- [ ] **Step 1: Add capacity check**

In `src/app/api/checkout/route.ts`, after the `pkg.price === null` check (around line 42) and before the `totalAmount` calculation, add:

```typescript
import { getInventoryKey } from "@/lib/admin/inventory";
import { checkRangeAvailability } from "@/lib/admin/availability";
```

Then, after `const totalAmount = pkg.price * data.num_participants;` (line 44) and before the Supabase insert (line 46), add:

```typescript
    // Capacity check for accommodation bookings
    const inventoryKey = getInventoryKey(data.price_id);
    if (inventoryKey && data.start_date && data.end_date) {
      const check = await checkRangeAvailability(
        inventoryKey,
        data.start_date,
        data.end_date,
      );
      if (!check.ok) {
        return NextResponse.json(
          {
            error: `Sold out on ${check.conflictDate}. Please choose different dates.`,
          },
          { status: 409 },
        );
      }
    }
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat(checkout): add capacity check to prevent accommodation overbooking"
```

---

## Task 8: Capacity-Aware AvailabilityCalendar

**Files:**
- Modify: `src/components/booking/AvailabilityCalendar.tsx`

- [ ] **Step 1: Refactor to include capacity blocking**

Replace the entire content of `src/components/booking/AvailabilityCalendar.tsx`:

```typescript
"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { createClient } from "@/lib/supabase/browser";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { INVENTORY, type InventoryKey } from "@/lib/admin/inventory";
import { Matcher } from "react-day-picker";
import { eachDayOfInterval, parseISO, subDays, format, addMonths } from "date-fns";

interface AvailabilityBlock {
  date: string;
  time_slot: string | null;
  type: string;
}

interface BookingOccupancy {
  start_date: string;
  end_date: string | null;
  price_id: string;
}

interface Props {
  type: "private" | "camp-stay";
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onAvailableSlotsChange?: (slots: string[]) => void;
  inventoryKey?: InventoryKey;
  stayDurationDays?: number;
}

export default function AvailabilityCalendar({
  type,
  selected,
  onSelect,
  onAvailableSlotsChange,
  inventoryKey,
  stayDurationDays,
}: Props) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [occupancyMap, setOccupancyMap] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const fromDate = format(new Date(), "yyyy-MM-dd");
    const toDate = format(addMonths(new Date(), 6), "yyyy-MM-dd");

    // Load manual blocks
    const blocksPromise = supabase
      .from("availability_blocks")
      .select("date, time_slot, type")
      .in("type", [type, "all"])
      .eq("is_blocked", true)
      .gte("date", fromDate)
      .lte("date", toDate);

    // Load occupancy data for accommodation types
    const occupancyPromise = inventoryKey
      ? supabase
          .from("bookings")
          .select("start_date, end_date, price_id")
          .in("type", ["camp-stay", "fighter"])
          .in("status", ["pending", "confirmed"])
          .gte("end_date", fromDate)
          .lte("start_date", toDate)
      : Promise.resolve({ data: null, error: null });

    Promise.all([blocksPromise, occupancyPromise]).then(
      ([blocksResult, occupancyResult]) => {
        if (blocksResult.error) {
          console.error("Failed to load availability:", blocksResult.error);
        } else {
          setBlocks(blocksResult.data ?? []);
        }

        // Build occupancy map from bookings
        if (inventoryKey && occupancyResult.data) {
          const map = new Map<string, number>();
          for (const booking of occupancyResult.data as BookingOccupancy[]) {
            const bKey = getInventoryKeyLocal(booking.price_id);
            if (bKey !== inventoryKey) continue;
            if (!booking.end_date) continue;

            const lastNight = subDays(parseISO(booking.end_date), 1);
            const nights = eachDayOfInterval({
              start: parseISO(booking.start_date),
              end: lastNight,
            });

            for (const night of nights) {
              const key = format(night, "yyyy-MM-dd");
              map.set(key, (map.get(key) ?? 0) + 1);
            }
          }
          setOccupancyMap(map);
        }

        setLoading(false);
      },
    );
  }, [type, inventoryKey]);

  const disabledDays: Matcher[] = useMemo(() => {
    const blockedDates = new Set<string>();
    const dateSlotMap = new Map<string, Set<string>>();

    // Manual admin blocks
    for (const block of blocks) {
      if (!block.time_slot) {
        blockedDates.add(block.date);
      } else {
        if (!dateSlotMap.has(block.date)) dateSlotMap.set(block.date, new Set());
        dateSlotMap.get(block.date)!.add(block.time_slot);
      }
    }

    // Private: day is blocked if all slots are blocked
    if (type === "private") {
      for (const [date, slots] of dateSlotMap.entries()) {
        if (slots.size >= PRIVATE_SLOTS.length) blockedDates.add(date);
      }
    }

    // Capacity: day is blocked if occupancy >= capacity
    if (inventoryKey) {
      const capacity = INVENTORY[inventoryKey];
      const fromDate = format(new Date(), "yyyy-MM-dd");
      const toDate = format(addMonths(new Date(), 6), "yyyy-MM-dd");

      // Generate all dates in range to check
      const allDates = eachDayOfInterval({
        start: parseISO(fromDate),
        end: parseISO(toDate),
      });

      if (stayDurationDays && stayDurationDays > 1) {
        // For multi-day stays: a check-in date is blocked if ANY night in the
        // resulting range is at capacity
        for (const checkInDate of allDates) {
          const checkInKey = format(checkInDate, "yyyy-MM-dd");
          if (blockedDates.has(checkInKey)) continue;

          let rangeBlocked = false;
          for (let d = 0; d < stayDurationDays; d++) {
            const nightDate = new Date(checkInDate);
            nightDate.setDate(nightDate.getDate() + d);
            const nightKey = format(nightDate, "yyyy-MM-dd");
            const occupied = occupancyMap.get(nightKey) ?? 0;
            if (occupied >= capacity) {
              rangeBlocked = true;
              break;
            }
          }
          if (rangeBlocked) blockedDates.add(checkInKey);
        }
      } else {
        // Single-night or no duration specified: block individual full days
        for (const [date, occupied] of occupancyMap.entries()) {
          if (occupied >= capacity) blockedDates.add(date);
        }
      }
    }

    return Array.from(blockedDates).map((d) => new Date(d + "T00:00:00"));
  }, [blocks, type, inventoryKey, stayDurationDays, occupancyMap]);

  // Private slot filtering for selected date
  useEffect(() => {
    if (!selected || type !== "private" || !onAvailableSlotsChange) return;
    const dateStr = format(selected, "yyyy-MM-dd");
    const blockedSlotsForDate = new Set(
      blocks
        .filter((b) => b.date === dateStr && b.time_slot)
        .map((b) => b.time_slot as string),
    );
    const available = [...PRIVATE_SLOTS].filter(
      (s) => !blockedSlotsForDate.has(s),
    );
    onAvailableSlotsChange(available);
  }, [selected, blocks, type, onAvailableSlotsChange]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (loading) {
    return (
      <div className="h-80 bg-surface-lowest rounded-lg animate-pulse" />
    );
  }

  return (
    <DatePicker
      selected={selected}
      onSelect={onSelect}
      minDate={tomorrow}
      disabledDays={disabledDays}
    />
  );
}

// Client-side version of getInventoryKey (avoids importing server module)
function getInventoryKeyLocal(priceId: string): string | null {
  if (priceId.includes("bungalow")) return "bungalows";
  if (
    priceId.includes("camp-stay-room") ||
    priceId.startsWith("camp-stay-1week") ||
    priceId.startsWith("camp-stay-2weeks") ||
    priceId.startsWith("camp-stay-1month") ||
    priceId === "fighter-stay-room-monthly"
  ) {
    return "rooms";
  }
  return null;
}
```

- [ ] **Step 2: Update Camp Stay wizard to pass inventoryKey + stayDurationDays**

In the camp-stay wizard (at `src/app/booking/camp-stay/CampStayWizard.tsx`), pass the new props to `AvailabilityCalendar`:

Find the `<AvailabilityCalendar` JSX and add:

```typescript
<AvailabilityCalendar
  type="camp-stay"
  selected={startDate}
  onSelect={setStartDate}
  inventoryKey={selectedPriceId?.includes("bungalow") ? "bungalows" : "rooms"}
  stayDurationDays={getStayDuration(selectedPriceId)}
/>
```

Add a helper above the component:

```typescript
function getStayDuration(priceId: string | null): number {
  if (!priceId) return 7;
  if (priceId.includes("1week")) return 7;
  if (priceId.includes("2weeks")) return 14;
  if (priceId.includes("1month") || priceId.includes("monthly")) return 30;
  return 7;
}
```

- [ ] **Step 3: Update Fighter wizard for stay tiers**

In `src/app/booking/fighter/FighterWizard.tsx`, for fighter-stay tiers, pass props:

```typescript
<AvailabilityCalendar
  type="camp-stay"
  selected={startDate}
  onSelect={setStartDate}
  inventoryKey={selectedPriceId?.includes("bungalow") ? "bungalows" : "rooms"}
  stayDurationDays={30}
/>
```

Only pass `inventoryKey` when the tier is a stay tier (not fighter-only).

- [ ] **Step 4: Verify all booking flows**

Run: `npm run dev`
Test: Visit each booking flow (`/booking/training`, `/booking/private`, `/booking/camp-stay`, `/booking/fighter`). Confirm calendars render and blocked dates work.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/components/booking/AvailabilityCalendar.tsx src/app/booking/camp-stay/CampStayWizard.tsx src/app/booking/fighter/FighterWizard.tsx
git commit -m "feat(availability): capacity-aware calendar blocking for rooms/bungalows"
```

---

## Task 9: Middleware — Admin Protection + Cleanup

**Files:**
- Modify: `src/middleware.ts`
- Modify: `src/lib/supabase/middleware.ts`

- [ ] **Step 1: Update middleware.ts**

Replace the entire content of `src/middleware.ts`:

```typescript
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Skip Supabase auth if not configured yet
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  const { updateSession } = await import("@/lib/supabase/middleware");
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|robots.txt|sitemap.xml|llms.txt|llms-full.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

No change needed to `middleware.ts` itself since the logic is in `updateSession`.

- [ ] **Step 2: Update supabase/middleware.ts with admin protection**

Replace the entire content of `src/lib/supabase/middleware.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = request.nextUrl.pathname === "/admin/login";

  // Admin routes (except /admin/login) require authenticated admin
  if (isAdminRoute && !isAdminLogin) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Check admin role via RPC
    const { data: isAdmin } = await supabase.rpc("is_admin");

    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("error", "not_admin");
      return NextResponse.redirect(url);
    }
  }

  // If already authenticated admin visiting /admin/login, redirect to dashboard
  if (isAdminLogin) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: isAdmin } = await supabase.rpc("is_admin");
      if (isAdmin) {
        const redirect = request.nextUrl.searchParams.get("redirect");
        const url = request.nextUrl.clone();
        url.pathname = redirect ?? "/admin/bookings";
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/middleware.ts src/lib/supabase/middleware.ts
git commit -m "feat(middleware): protect /admin/* routes, redirect non-admin, remove /account legacy"
```

---

## Task 10: Admin Login Page

**Files:**
- Create: `src/app/admin/login/page.tsx`

- [ ] **Step 1: Create the login page**

```typescript
// src/app/admin/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/admin/bookings";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    errorParam === "not_admin" ? "This account does not have admin access." : "",
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Middleware will validate admin role on next request
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
            <Lock size={28} className="text-primary" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-on-surface uppercase tracking-wide">
            Admin
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            Ratchawat Muay Thai
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/10 border-2 border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-surface-lowest border-2 border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-surface-lowest border-2 border-outline-variant rounded-lg px-4 py-3 text-on-surface text-sm placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify login page renders**

Run: `npm run dev`
Navigate to `/admin/login`. Confirm:
- Page renders with dark theme, centered form
- Lock icon and "Admin" title visible
- Email and password fields work
- Button has orange styling

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/login/page.tsx
git commit -m "feat(admin): add login page with Supabase Auth"
```

---

## Task 11: Admin Layout Shell

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/components/admin/AdminShell.tsx`
- Create: `src/components/admin/AdminSidebar.tsx`
- Create: `src/components/admin/AdminBottomTabs.tsx`
- Create: `src/components/admin/AdminUserMenu.tsx`
- Create: `src/app/api/admin/signout/route.ts`

- [ ] **Step 1: Create signout API route**

```typescript
// src/app/api/admin/signout/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Create AdminSidebar**

```typescript
// src/components/admin/AdminSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CalendarDays, User } from "lucide-react";

const links = [
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/availability", label: "Availability", icon: CalendarDays },
  { href: "/admin/account", label: "Account", icon: User },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-56 border-r-2 border-outline-variant bg-surface min-h-[calc(100vh-3.5rem)]">
      <nav className="flex flex-col gap-1 p-3 pt-4">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary border-l-4 border-primary -ml-px"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-lowest"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create AdminBottomTabs**

```typescript
// src/components/admin/AdminBottomTabs.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, CalendarDays, User } from "lucide-react";

const tabs = [
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/availability", label: "Availability", icon: CalendarDays },
  { href: "/admin/account", label: "Account", icon: User },
];

export default function AdminBottomTabs() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface border-t-2 border-outline-variant">
      <div className="flex justify-around py-2">
        {tabs.map((tab) => {
          const active =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-4 py-1 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: Create AdminUserMenu**

```typescript
// src/components/admin/AdminUserMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";

interface Props {
  email: string;
}

export default function AdminUserMenu({ email }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initials = email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSignOut() {
    await fetch("/api/admin/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center hover:bg-primary/20 transition-colors"
        aria-label="User menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface-lowest border-2 border-outline-variant rounded-lg shadow-lg shadow-black/30 py-1 z-50">
          <div className="px-4 py-3 border-b border-outline-variant">
            <p className="text-xs text-on-surface-variant truncate">{email}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              router.push("/admin/account");
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-low transition-colors"
          >
            <User size={16} />
            Account
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-surface-low transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create AdminShell**

```typescript
// src/components/admin/AdminShell.tsx
import Link from "next/link";
import AdminSidebar from "./AdminSidebar";
import AdminBottomTabs from "./AdminBottomTabs";
import AdminUserMenu from "./AdminUserMenu";

interface Props {
  email: string;
  children: React.ReactNode;
}

export default function AdminShell({ email, children }: Props) {
  return (
    <div className="min-h-screen bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-40 h-14 bg-surface border-b-2 border-outline-variant flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="font-serif text-base font-semibold text-on-surface tracking-tight flex items-center gap-2"
          >
            <span className="inline-block w-1.5 h-1.5 bg-primary rotate-45" />
            RATCHAWAT
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant bg-surface-lowest px-2 py-0.5 rounded">
            Admin
          </span>
        </div>
        <AdminUserMenu email={email} />
      </header>

      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
      </div>

      <AdminBottomTabs />
    </div>
  );
}
```

- [ ] **Step 6: Create admin layout**

```typescript
// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=not_admin");

  return <AdminShell email={user.email ?? "admin"}>{children}</AdminShell>;
}
```

Note: `/admin/login/page.tsx` does NOT use this layout because it is outside the admin layout group. Create a separate layout for login:

```typescript
// src/app/admin/login/layout.tsx
export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

Wait — in Next.js App Router, `src/app/admin/login/page.tsx` IS nested inside `src/app/admin/layout.tsx` by default. To exclude login from the admin shell, we need a route group. Restructure:

```
src/app/admin/
  login/
    page.tsx           # login page (no admin shell)
  (dashboard)/
    layout.tsx         # admin layout with shell + auth check
    bookings/
      page.tsx
    bookings/[id]/
      page.tsx
    availability/
      page.tsx
    account/
      page.tsx
```

Create `src/app/admin/layout.tsx` as a pass-through:

```typescript
// src/app/admin/layout.tsx
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

And the auth shell goes in the route group:

```typescript
// src/app/admin/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?error=not_admin");

  return <AdminShell email={user.email ?? "admin"}>{children}</AdminShell>;
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 8: Commit**

```bash
git add src/app/admin/ src/components/admin/ src/app/api/admin/signout/
git commit -m "feat(admin): add layout shell with sidebar, bottom tabs, user menu, signout"
```

---

## Task 12: Admin Nav Button in Public Header

**Files:**
- Create: `src/components/admin/AdminNavButton.tsx`
- Modify: `src/components/layout/Navigation.tsx`

- [ ] **Step 1: Create AdminNavButton (Server Component wrapper + Client icon)**

Since `Navigation.tsx` is a Client Component ("use client"), the admin button needs to receive `isAdmin` as a prop. We create a server wrapper that determines the state, and pass it down.

First, create the button component:

```typescript
// src/components/admin/AdminNavButton.tsx
"use client";

import Link from "next/link";
import { Lock, LayoutDashboard } from "lucide-react";

interface Props {
  isAdmin: boolean;
}

export default function AdminNavButton({ isAdmin }: Props) {
  return (
    <Link
      href={isAdmin ? "/admin/bookings" : "/admin/login"}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
        isAdmin
          ? "text-primary hover:bg-primary/10"
          : "text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-lowest"
      }`}
      title={isAdmin ? "Admin Dashboard" : "Admin"}
      aria-label={isAdmin ? "Admin Dashboard" : "Admin login"}
    >
      {isAdmin ? <LayoutDashboard size={16} /> : <Lock size={14} />}
    </Link>
  );
}
```

- [ ] **Step 2: Modify Navigation.tsx**

The `Navigation` component is a Client Component. To get auth state, we need to pass `isAdmin` from a parent Server Component.

Create a server wrapper that checks auth and passes the prop:

In the layout that renders `Navigation` (check `src/app/layout.tsx`), we'll need to resolve auth state there and pass it. However, since `Navigation` is imported directly in the root layout and is a client component, the cleanest approach is:

Add the `isAdmin` prop to Navigation:

In `src/components/layout/Navigation.tsx`, add the import and prop:

```typescript
import AdminNavButton from "@/components/admin/AdminNavButton";
```

Add a prop to the component:

```typescript
interface Props {
  isAdmin?: boolean;
}

export default function Navigation({ isAdmin = false }: Props) {
```

In the desktop nav, after the "Book Now" button (line 98), add:

```typescript
            <AdminNavButton isAdmin={isAdmin} />
```

In the mobile menu, before the closing `</div>` of the mobile nav (before line 149), add:

```typescript
            <div className="border-t border-white/5 pt-3 mt-2">
              <AdminNavButton isAdmin={isAdmin} />
            </div>
```

Then, in the root layout (`src/app/layout.tsx`), check auth state and pass it:

```typescript
import { createClient } from "@/lib/supabase/server";

// Inside the layout function, before the return:
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
let isAdmin = false;
if (user) {
  const { data } = await supabase.rpc("is_admin");
  isAdmin = !!data;
}

// Then pass to Navigation:
<Navigation isAdmin={isAdmin} />
```

Note: The root layout MUST be converted to an async function if it isn't already. Check and convert.

- [ ] **Step 3: Verify**

Run: `npm run dev`
- Visit `/` — see small Lock icon (opacity 50%) in nav
- Click it → redirected to `/admin/login`
- Login as admin → icon changes to LayoutDashboard orange

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/AdminNavButton.tsx src/components/layout/Navigation.tsx src/app/layout.tsx
git commit -m "feat(nav): add admin icon button in public header (lock/dashboard)"
```

---

## Task 13: Admin Bookings List Page

**Files:**
- Create: `src/lib/admin/bookings-query.ts`
- Create: `src/components/admin/StatusBadge.tsx`
- Create: `src/components/admin/TypeBadge.tsx`
- Create: `src/components/admin/BookingsFilters.tsx`
- Create: `src/components/admin/BookingsTable.tsx`
- Create: `src/components/admin/BookingsCards.tsx`
- Create: `src/app/admin/(dashboard)/bookings/page.tsx`

- [ ] **Step 1: Create badges**

```typescript
// src/components/admin/StatusBadge.tsx
const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest border ${
        STATUS_STYLES[status] ?? "bg-surface-lowest text-on-surface-variant border-outline-variant"
      }`}
    >
      {status}
    </span>
  );
}
```

```typescript
// src/components/admin/TypeBadge.tsx
const TYPE_STYLES: Record<string, string> = {
  training: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  private: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "camp-stay": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  fighter: "bg-red-500/10 text-red-400 border-red-500/30",
};

const TYPE_LABELS: Record<string, string> = {
  training: "Training",
  private: "Private",
  "camp-stay": "Camp Stay",
  fighter: "Fighter",
};

export default function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-widest border ${
        TYPE_STYLES[type] ?? "bg-surface-lowest text-on-surface-variant border-outline-variant"
      }`}
    >
      {TYPE_LABELS[type] ?? type}
    </span>
  );
}
```

- [ ] **Step 2: Create bookings query helper**

```typescript
// src/lib/admin/bookings-query.ts
import { createClient } from "@/lib/supabase/server";

export interface BookingsQueryParams {
  type?: string;
  status?: string;
  from?: string;
  to?: string;
  q?: string;
  page?: number;
}

export const PAGE_SIZE = 25;

export async function queryBookings(params: BookingsQueryParams) {
  const supabase = await createClient();

  let query = supabase
    .from("bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (params.type && params.type !== "all") {
    query = query.eq("type", params.type);
  }
  if (params.status && params.status !== "all") {
    query = query.eq("status", params.status);
  }
  if (params.from) {
    query = query.gte("start_date", params.from);
  }
  if (params.to) {
    query = query.lte("start_date", params.to);
  }
  if (params.q) {
    query = query.or(
      `client_name.ilike.%${params.q}%,client_email.ilike.%${params.q}%`,
    );
  }

  const page = params.page ?? 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error("Bookings query error:", error);
    return { bookings: [], total: 0 };
  }

  return { bookings: data ?? [], total: count ?? 0 };
}
```

- [ ] **Step 3: Create BookingsFilters**

```typescript
// src/components/admin/BookingsFilters.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export default function BookingsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`/admin/bookings?${params.toString()}`);
    },
    [router, searchParams],
  );

  function resetFilters() {
    router.push("/admin/bookings");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={searchParams.get("type") ?? "all"}
        onChange={(e) => setParam("type", e.target.value)}
        className="bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface"
      >
        <option value="all">All types</option>
        <option value="training">Training</option>
        <option value="private">Private</option>
        <option value="camp-stay">Camp Stay</option>
        <option value="fighter">Fighter</option>
      </select>

      <select
        value={searchParams.get("status") ?? "all"}
        onChange={(e) => setParam("status", e.target.value)}
        className="bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface"
      >
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>

      <input
        type="date"
        value={searchParams.get("from") ?? ""}
        onChange={(e) => setParam("from", e.target.value)}
        className="bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface"
        placeholder="From"
      />

      <input
        type="date"
        value={searchParams.get("to") ?? ""}
        onChange={(e) => setParam("to", e.target.value)}
        className="bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface"
        placeholder="To"
      />

      <input
        type="search"
        value={searchParams.get("q") ?? ""}
        onChange={(e) => setParam("q", e.target.value)}
        className="bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 w-48"
        placeholder="Search name or email"
      />

      <button
        onClick={resetFilters}
        className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create BookingsTable (desktop)**

```typescript
// src/components/admin/BookingsTable.tsx
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";
import { ChevronRight } from "lucide-react";

interface Booking {
  id: string;
  created_at: string;
  type: string;
  status: string;
  client_name: string;
  start_date: string;
  end_date: string | null;
  price_amount: number;
}

interface Props {
  bookings: Booking[];
}

export default function BookingsTable({ bookings }: Props) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-outline-variant">
            <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Created
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Type
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Status
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Client
            </th>
            <th className="text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Dates
            </th>
            <th className="text-right px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
              Amount
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr
              key={b.id}
              className="border-b border-outline-variant hover:bg-surface-lowest transition-colors"
            >
              <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                {new Date(b.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-3">
                <TypeBadge type={b.type} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={b.status} />
              </td>
              <td className="px-4 py-3 text-on-surface font-medium">
                {b.client_name}
              </td>
              <td className="px-4 py-3 text-on-surface-variant whitespace-nowrap">
                {b.start_date}
                {b.end_date ? ` → ${b.end_date}` : ""}
              </td>
              <td className="px-4 py-3 text-right text-on-surface font-medium tabular-nums">
                {b.price_amount.toLocaleString("en-US")} ฿
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/bookings/${b.id}`}
                  className="text-on-surface-variant hover:text-primary transition-colors"
                  aria-label={`View booking ${b.id.slice(0, 8)}`}
                >
                  <ChevronRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5: Create BookingsCards (mobile)**

```typescript
// src/components/admin/BookingsCards.tsx
import Link from "next/link";
import StatusBadge from "./StatusBadge";
import TypeBadge from "./TypeBadge";

interface Booking {
  id: string;
  created_at: string;
  type: string;
  status: string;
  client_name: string;
  client_email: string;
  start_date: string;
  end_date: string | null;
  price_amount: number;
}

interface Props {
  bookings: Booking[];
}

export default function BookingsCards({ bookings }: Props) {
  return (
    <div className="md:hidden space-y-3">
      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/admin/bookings/${b.id}`}
          className="block bg-surface-lowest border-2 border-outline-variant rounded-lg p-4 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <TypeBadge type={b.type} />
            <StatusBadge status={b.status} />
          </div>
          <p className="text-on-surface font-medium text-sm">{b.client_name}</p>
          <p className="text-on-surface-variant text-xs">{b.client_email}</p>
          <div className="flex justify-between items-end mt-3">
            <span className="text-on-surface-variant text-xs">
              {b.start_date}
              {b.end_date ? ` → ${b.end_date}` : ""}
            </span>
            <span className="font-serif text-lg font-bold text-primary">
              {b.price_amount.toLocaleString("en-US")} ฿
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Create bookings list page**

```typescript
// src/app/admin/(dashboard)/bookings/page.tsx
import {
  queryBookings,
  PAGE_SIZE,
  type BookingsQueryParams,
} from "@/lib/admin/bookings-query";
import BookingsFilters from "@/components/admin/BookingsFilters";
import BookingsTable from "@/components/admin/BookingsTable";
import BookingsCards from "@/components/admin/BookingsCards";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AdminBookingsPage({ searchParams }: Props) {
  const params = await searchParams;

  const query: BookingsQueryParams = {
    type: params.type,
    status: params.status,
    from: params.from,
    to: params.to,
    q: params.q,
    page: params.page ? parseInt(params.page, 10) : 1,
  };

  const { bookings, total } = await queryBookings(query);
  const currentPage = query.page ?? 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, total);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif text-2xl font-bold text-on-surface uppercase">
          Bookings
        </h1>
        <span className="text-sm text-on-surface-variant">
          {total} total
        </span>
      </div>

      <div className="mb-4">
        <BookingsFilters />
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          No bookings found.
        </div>
      ) : (
        <>
          <BookingsTable bookings={bookings} />
          <BookingsCards bookings={bookings} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant">
              <span className="text-sm text-on-surface-variant">
                Showing {from}-{to} of {total}
              </span>
              <div className="flex gap-2">
                {currentPage > 1 && (
                  <Link
                    href={`/admin/bookings?${buildPageParams(params, currentPage - 1)}`}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm text-on-surface-variant hover:text-primary border-2 border-outline-variant rounded-lg transition-colors"
                  >
                    <ChevronLeft size={14} /> Prev
                  </Link>
                )}
                {currentPage < totalPages && (
                  <Link
                    href={`/admin/bookings?${buildPageParams(params, currentPage + 1)}`}
                    className="inline-flex items-center gap-1 px-3 py-2 text-sm text-on-surface-variant hover:text-primary border-2 border-outline-variant rounded-lg transition-colors"
                  >
                    Next <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function buildPageParams(
  params: Record<string, string | undefined>,
  page: number,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && key !== "page") sp.set(key, value);
  }
  sp.set("page", String(page));
  return sp.toString();
}
```

- [ ] **Step 7: Create admin redirect page**

```typescript
// src/app/admin/(dashboard)/page.tsx
import { redirect } from "next/navigation";

export default function AdminPage() {
  redirect("/admin/bookings");
}
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 9: Commit**

```bash
git add src/lib/admin/bookings-query.ts src/components/admin/StatusBadge.tsx src/components/admin/TypeBadge.tsx src/components/admin/BookingsFilters.tsx src/components/admin/BookingsTable.tsx src/components/admin/BookingsCards.tsx src/app/admin/
git commit -m "feat(admin): add bookings list page with filters, table, cards, pagination"
```

---

## Task 14: Admin Booking Detail Page

**Files:**
- Create: `src/app/admin/(dashboard)/bookings/[id]/page.tsx`
- Create: `src/app/api/admin/bookings/[id]/status/route.ts`
- Create: `src/app/api/admin/bookings/[id]/notes/route.ts`
- Create: `src/app/api/admin/bookings/[id]/resend-email/route.ts`

- [ ] **Step 1: Create status update API route**

```typescript
// src/app/api/admin/bookings/[id]/status/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // Verify admin
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await request.json();

  // Load current booking
  const { data: booking } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", id)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const allowed = VALID_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(status)) {
    return NextResponse.json(
      { error: `Cannot transition from ${booking.status} to ${status}` },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status });
}
```

- [ ] **Step 2: Create notes update API route**

```typescript
// src/app/api/admin/bookings/[id]/notes/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notes } = await request.json();

  const { error } = await supabase
    .from("bookings")
    .update({ notes: notes ?? null })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Create resend email API route**

```typescript
// src/app/api/admin/bookings/[id]/resend-email/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBookingConfirmationEmail } from "@/lib/email/send";
import type { BookingEmailData } from "@/lib/email/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const emailData: BookingEmailData = {
    id: booking.id,
    type: booking.type,
    price_id: booking.price_id,
    price_amount: booking.price_amount,
    start_date: booking.start_date,
    end_date: booking.end_date,
    time_slot: booking.time_slot,
    camp: booking.camp,
    num_participants: booking.num_participants,
    client_name: booking.client_name,
    client_email: booking.client_email,
    client_phone: booking.client_phone,
    client_nationality: booking.client_nationality,
    notes: booking.notes,
  };

  try {
    await sendBookingConfirmationEmail(emailData);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Resend email failed:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
```

- [ ] **Step 4: Create booking detail page**

```typescript
// src/app/admin/(dashboard)/bookings/[id]/page.tsx
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { getPriceById } from "@/content/pricing";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Copy,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import TypeBadge from "@/components/admin/TypeBadge";
import BookingActions from "@/components/admin/BookingActions";
import BookingNotesEditor from "@/components/admin/BookingNotesEditor";

const CAMP_LABEL: Record<string, string> = {
  "bo-phut": "Bo Phut",
  "plai-laem": "Plai Laem",
  both: "Plai Laem stay, both camps",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BookingDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !booking) notFound();

  const pkg = getPriceById(booking.price_id);
  const packageName = pkg?.name ?? booking.price_id;

  const stripeBaseUrl = process.env.STRIPE_SECRET_KEY?.startsWith("sk_live_")
    ? "https://dashboard.stripe.com"
    : "https://dashboard.stripe.com/test";

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/bookings"
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="font-serif text-xl font-bold text-on-surface uppercase">
            Booking #{id.slice(0, 8)}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <TypeBadge type={booking.type} />
            <StatusBadge status={booking.status} />
          </div>
        </div>
        {booking.stripe_session_id && (
          <a
            href={`${stripeBaseUrl}/payments/${booking.stripe_payment_intent_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost text-xs"
          >
            Stripe <ExternalLink size={12} />
          </a>
        )}
      </div>

      <div className="space-y-4">
        {/* Client info */}
        <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Client
          </h2>
          <p className="text-on-surface font-medium">{booking.client_name}</p>
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            <a
              href={`mailto:${booking.client_email}`}
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
            >
              <Mail size={14} /> {booking.client_email}
            </a>
            <a
              href={`https://wa.me/${booking.client_phone.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors"
            >
              <Phone size={14} /> {booking.client_phone}
            </a>
            {booking.client_nationality && (
              <span className="flex items-center gap-1.5 text-on-surface-variant">
                <Globe size={14} /> {booking.client_nationality}
              </span>
            )}
          </div>
        </div>

        {/* Booking details */}
        <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Details
          </h2>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <span className="text-on-surface-variant">Package</span>
            <span className="text-on-surface font-medium">{packageName}</span>

            <span className="text-on-surface-variant">Camp</span>
            <span className="text-on-surface font-medium">
              {CAMP_LABEL[booking.camp] ?? booking.camp ?? "—"}
            </span>

            <span className="text-on-surface-variant">Start date</span>
            <span className="text-on-surface font-medium">
              {booking.start_date}
            </span>

            {booking.end_date && (
              <>
                <span className="text-on-surface-variant">End date</span>
                <span className="text-on-surface font-medium">
                  {booking.end_date}
                </span>
              </>
            )}

            {booking.time_slot && (
              <>
                <span className="text-on-surface-variant">Time slot</span>
                <span className="text-on-surface font-medium">
                  {booking.time_slot}
                </span>
              </>
            )}

            <span className="text-on-surface-variant">Participants</span>
            <span className="text-on-surface font-medium">
              {booking.num_participants}
            </span>

            <span className="text-on-surface-variant">Amount</span>
            <span className="font-serif text-lg font-bold text-primary">
              {booking.price_amount.toLocaleString("en-US")} THB
            </span>
          </div>
        </div>

        {/* Stripe info */}
        {booking.stripe_session_id && (
          <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
              Stripe
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant">Session</span>
                <code className="text-on-surface text-xs bg-surface-low px-2 py-0.5 rounded">
                  {booking.stripe_session_id}
                </code>
              </div>
              {booking.stripe_payment_intent_id && (
                <div className="flex items-center gap-2">
                  <span className="text-on-surface-variant">Payment</span>
                  <code className="text-on-surface text-xs bg-surface-low px-2 py-0.5 rounded">
                    {booking.stripe_payment_intent_id}
                  </code>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant">Status</span>
                <span className="text-on-surface font-medium">
                  {booking.stripe_payment_status ?? "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <BookingNotesEditor bookingId={id} initialNotes={booking.notes} />

        {/* Actions */}
        <BookingActions bookingId={id} currentStatus={booking.status} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create BookingActions client component**

```typescript
// src/components/admin/BookingActions.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Award, Mail } from "lucide-react";

const TRANSITIONS: Record<
  string,
  { label: string; status: string; icon: typeof CheckCircle; style: string }[]
> = {
  pending: [
    {
      label: "Mark Confirmed",
      status: "confirmed",
      icon: CheckCircle,
      style: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20",
    },
    {
      label: "Cancel",
      status: "cancelled",
      icon: XCircle,
      style: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20",
    },
  ],
  confirmed: [
    {
      label: "Mark Completed",
      status: "completed",
      icon: Award,
      style: "bg-blue-500/10 text-blue-400 border-blue-500/30 hover:bg-blue-500/20",
    },
    {
      label: "Cancel",
      status: "cancelled",
      icon: XCircle,
      style: "bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20",
    },
  ],
};

interface Props {
  bookingId: string;
  currentStatus: string;
}

export default function BookingActions({ bookingId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const actions = TRANSITIONS[currentStatus] ?? [];

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    setMessage("");
    const res = await fetch(`/api/admin/bookings/${bookingId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setMessage(`Status updated to ${newStatus}`);
      router.refresh();
    } else {
      const data = await res.json();
      setMessage(data.error ?? "Update failed");
    }
    setLoading(null);
  }

  async function resendEmail() {
    setLoading("email");
    setMessage("");
    const res = await fetch(
      `/api/admin/bookings/${bookingId}/resend-email`,
      { method: "POST" },
    );
    if (res.ok) {
      setMessage("Confirmation email sent");
    } else {
      setMessage("Email failed to send");
    }
    setLoading(null);
  }

  return (
    <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
        Actions
      </h2>

      {message && (
        <div className="mb-3 text-sm text-on-surface-variant">{message}</div>
      )}

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.status}
            onClick={() => updateStatus(action.status)}
            disabled={loading !== null}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-colors disabled:opacity-50 ${action.style}`}
          >
            <action.icon size={16} />
            {loading === action.status ? "Updating..." : action.label}
          </button>
        ))}

        <button
          onClick={resendEmail}
          disabled={loading !== null}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border-2 border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-50"
        >
          <Mail size={16} />
          {loading === "email" ? "Sending..." : "Resend Email"}
        </button>
      </div>

      {actions.length === 0 && (
        <p className="text-sm text-on-surface-variant">
          No actions available for {currentStatus} bookings.
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create BookingNotesEditor client component**

```typescript
// src/components/admin/BookingNotesEditor.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Save, X } from "lucide-react";

interface Props {
  bookingId: string;
  initialNotes: string | null;
}

export default function BookingNotesEditor({ bookingId, initialNotes }: Props) {
  const [editing, setEditing] = useState(false);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/bookings/${bookingId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: notes || null }),
    });
    if (res.ok) {
      setEditing(false);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          Internal Notes
        </h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full bg-surface border-2 border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none resize-y"
            placeholder="Add internal notes..."
          />
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              <Save size={12} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setNotes(initialNotes ?? "");
                setEditing(false);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-on-surface-variant hover:text-on-surface text-xs font-semibold transition-colors"
            >
              <X size={12} />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-on-surface-variant">
          {initialNotes || "No notes."}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 8: Commit**

```bash
git add src/app/admin/ src/components/admin/ src/app/api/admin/bookings/
git commit -m "feat(admin): add booking detail page with status transitions, notes, resend email"
```

---

## Task 15: Admin Availability Page

**Files:**
- Create: `src/components/admin/AdminCalendar.tsx`
- Create: `src/components/admin/AdminDayDrawer.tsx`
- Create: `src/app/admin/(dashboard)/availability/page.tsx`
- Create: `src/app/api/admin/availability/route.ts`
- Create: `src/app/api/admin/availability/[id]/route.ts`

- [ ] **Step 1: Create availability API routes**

```typescript
// src/app/api/admin/availability/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { date, type, time_slot, reason } = await request.json();

  if (!date || !type) {
    return NextResponse.json(
      { error: "date and type are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("availability_blocks")
    .insert({
      date,
      type,
      time_slot: time_slot ?? null,
      reason: reason ?? null,
      is_blocked: true,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id });
}
```

```typescript
// src/app/api/admin/availability/[id]/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("availability_blocks")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Create AdminDayDrawer**

```typescript
// src/components/admin/AdminDayDrawer.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Lock, Unlock, Users } from "lucide-react";
import { PRIVATE_SLOTS } from "@/lib/config/slots";
import { INVENTORY } from "@/lib/admin/inventory";
import Link from "next/link";

interface AvailabilityBlock {
  id: string;
  date: string;
  type: string;
  time_slot: string | null;
  reason: string | null;
}

interface BookingSummary {
  id: string;
  client_name: string;
  price_id: string;
  type: string;
}

interface Props {
  date: string;
  blocks: AvailabilityBlock[];
  roomOccupancy: number;
  bungalowOccupancy: number;
  bookingsOnDate: BookingSummary[];
  onClose: () => void;
}

export default function AdminDayDrawer({
  date,
  blocks,
  roomOccupancy,
  bungalowOccupancy,
  bookingsOnDate,
  onClose,
}: Props) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const fullDayBlock = blocks.find(
    (b) => !b.time_slot && (b.type === "all" || b.type === "camp-stay"),
  );
  const privateDayBlock = blocks.find(
    (b) => !b.time_slot && b.type === "private",
  );
  const allBlock = blocks.find((b) => !b.time_slot && b.type === "all");

  function getSlotBlock(slot: string): AvailabilityBlock | undefined {
    return blocks.find((b) => b.time_slot === slot);
  }

  async function createBlock(type: string, timeSlot?: string) {
    setLoading(true);
    await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        type,
        time_slot: timeSlot ?? null,
        reason: reason || null,
      }),
    });
    setLoading(false);
    router.refresh();
  }

  async function removeBlock(id: string) {
    setLoading(true);
    await fetch(`/api/admin/availability/${id}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l-2 border-outline-variant shadow-2xl shadow-black/50 overflow-y-auto">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-lg font-bold text-on-surface">
            {displayDate}
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Occupancy */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Occupancy
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-3 text-center">
              <p className="font-serif text-2xl font-bold text-on-surface">
                {roomOccupancy}/{INVENTORY.rooms}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">Rooms</p>
            </div>
            <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-3 text-center">
              <p className="font-serif text-2xl font-bold text-on-surface">
                {bungalowOccupancy}/{INVENTORY.bungalows}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">Bungalows</p>
            </div>
          </div>

          {bookingsOnDate.length > 0 && (
            <div className="mt-3 space-y-1">
              {bookingsOnDate.map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-2 text-xs text-on-surface-variant hover:text-primary transition-colors"
                >
                  <Users size={12} />
                  {b.client_name} ({b.price_id})
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Manual blocks */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Manual Blocks
          </h3>
          <div className="space-y-2">
            <BlockToggle
              label="Block all camp-stay"
              active={!!fullDayBlock}
              onToggle={() =>
                fullDayBlock
                  ? removeBlock(fullDayBlock.id)
                  : createBlock("camp-stay")
              }
              disabled={loading}
            />
            <BlockToggle
              label="Block all private"
              active={!!privateDayBlock}
              onToggle={() =>
                privateDayBlock
                  ? removeBlock(privateDayBlock.id)
                  : createBlock("private")
              }
              disabled={loading}
            />
            <BlockToggle
              label="Block everything"
              active={!!allBlock}
              onToggle={() =>
                allBlock ? removeBlock(allBlock.id) : createBlock("all")
              }
              disabled={loading}
            />
          </div>
        </div>

        {/* Private slots */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
            Private Slots
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PRIVATE_SLOTS.map((slot) => {
              const block = getSlotBlock(slot);
              return (
                <BlockToggle
                  key={slot}
                  label={slot}
                  active={!!block}
                  onToggle={() =>
                    block
                      ? removeBlock(block.id)
                      : createBlock("private", slot)
                  }
                  disabled={loading}
                />
              );
            })}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
            Reason (for next block)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-surface-lowest border-2 border-outline-variant rounded-lg px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            placeholder="e.g. Wan Phra, Maintenance..."
          />
        </div>
      </div>
    </div>
  );
}

function BlockToggle({
  label,
  active,
  onToggle,
  disabled,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-colors disabled:opacity-50 ${
        active
          ? "bg-red-500/10 text-red-400 border-red-500/30"
          : "text-on-surface-variant border-outline-variant hover:border-primary/30"
      }`}
    >
      {active ? <Lock size={14} /> : <Unlock size={14} />}
      {label}
      {active && (
        <span className="ml-auto text-[10px] uppercase tracking-widest">
          Blocked
        </span>
      )}
    </button>
  );
}
```

- [ ] **Step 3: Create AdminCalendar**

```typescript
// src/components/admin/AdminCalendar.tsx
"use client";

import { DayPicker } from "react-day-picker";
import { calendarClassNames } from "@/components/ui/calendar-tokens";
import { INVENTORY } from "@/lib/admin/inventory";
import { format } from "date-fns";

interface DayData {
  rooms: number;
  bungalows: number;
  hasBlock: boolean;
}

interface Props {
  month: Date;
  onMonthChange: (month: Date) => void;
  dayDataMap: Record<string, DayData>;
  onDayClick: (date: Date) => void;
}

export default function AdminCalendar({
  month,
  onMonthChange,
  dayDataMap,
  onDayClick,
}: Props) {
  function renderDay(day: Date) {
    const key = format(day, "yyyy-MM-dd");
    const data = dayDataMap[key];
    if (!data) return null;

    const roomPct = data.rooms / INVENTORY.rooms;
    const roomColor =
      data.rooms >= INVENTORY.rooms
        ? "text-red-400"
        : roomPct > 0.75
          ? "text-amber-400"
          : "text-emerald-400";

    const bungalowColor =
      data.bungalows >= INVENTORY.bungalows
        ? "text-red-400"
        : "text-emerald-400";

    return (
      <div className="flex flex-col items-center gap-0.5 mt-0.5">
        <span className={`text-[8px] font-bold ${roomColor}`}>
          R {data.rooms}/{INVENTORY.rooms}
        </span>
        <span className={`text-[8px] font-bold ${bungalowColor}`}>
          B {data.bungalows}/{INVENTORY.bungalows}
        </span>
        {data.hasBlock && (
          <span className="text-[8px] text-red-400">&#128274;</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-surface-lowest rounded-lg p-5">
      <DayPicker
        mode="single"
        month={month}
        onMonthChange={onMonthChange}
        onDayClick={(day) => onDayClick(day)}
        showOutsideDays
        classNames={{
          ...calendarClassNames,
          day: "relative w-16 h-20 flex flex-col items-center justify-start pt-1 cursor-pointer",
          day_button:
            "w-full h-full flex flex-col items-center rounded-md hover:ring-2 hover:ring-primary transition-colors duration-150",
        }}
        components={{
          DayDate: ({ day }) => {
            const dateNum = day.date.getDate();
            return (
              <div className="flex flex-col items-center w-full">
                <span className="text-sm font-medium text-on-surface">
                  {dateNum}
                </span>
                {renderDay(day.date)}
              </div>
            );
          },
        }}
      />
    </div>
  );
}
```

Note: The `components` API of react-day-picker v9 may need adjustment based on the exact API. Check using context7 if needed during implementation. The key requirement is displaying extra content (R x/7, B x/1, lock icon) inside each day cell.

- [ ] **Step 4: Create availability page**

```typescript
// src/app/admin/(dashboard)/availability/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/browser";
import { INVENTORY, getInventoryKey } from "@/lib/admin/inventory";
import AdminCalendar from "@/components/admin/AdminCalendar";
import AdminDayDrawer from "@/components/admin/AdminDayDrawer";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  parseISO,
  subDays,
} from "date-fns";

interface AvailabilityBlock {
  id: string;
  date: string;
  type: string;
  time_slot: string | null;
  reason: string | null;
}

interface BookingRow {
  id: string;
  start_date: string;
  end_date: string | null;
  price_id: string;
  type: string;
  status: string;
  client_name: string;
}

interface DayData {
  rooms: number;
  bungalows: number;
  hasBlock: boolean;
}

export default function AdminAvailabilityPage() {
  const [month, setMonth] = useState(new Date());
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [dayDataMap, setDayDataMap] = useState<Record<string, DayData>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const from = format(startOfMonth(month), "yyyy-MM-dd");
    const to = format(endOfMonth(month), "yyyy-MM-dd");

    const [blocksRes, bookingsRes] = await Promise.all([
      supabase
        .from("availability_blocks")
        .select("id, date, type, time_slot, reason")
        .gte("date", from)
        .lte("date", to)
        .eq("is_blocked", true),
      supabase
        .from("bookings")
        .select("id, start_date, end_date, price_id, type, status, client_name")
        .in("type", ["camp-stay", "fighter"])
        .in("status", ["pending", "confirmed"])
        .lte("start_date", to)
        .gte("end_date", from),
    ]);

    const loadedBlocks = (blocksRes.data ?? []) as AvailabilityBlock[];
    const loadedBookings = (bookingsRes.data ?? []) as BookingRow[];

    setBlocks(loadedBlocks);
    setBookings(loadedBookings);

    // Build day data map
    const dataMap: Record<string, DayData> = {};
    const allDays = eachDayOfInterval({
      start: startOfMonth(month),
      end: endOfMonth(month),
    });

    for (const day of allDays) {
      const key = format(day, "yyyy-MM-dd");
      dataMap[key] = { rooms: 0, bungalows: 0, hasBlock: false };
    }

    // Count occupancy
    for (const booking of loadedBookings) {
      const invKey = getInventoryKey(booking.price_id);
      if (!invKey || !booking.end_date) continue;
      const lastNight = subDays(parseISO(booking.end_date), 1);
      const nights = eachDayOfInterval({
        start: parseISO(booking.start_date),
        end: lastNight,
      });
      for (const night of nights) {
        const key = format(night, "yyyy-MM-dd");
        if (dataMap[key]) {
          dataMap[key][invKey]++;
        }
      }
    }

    // Mark manual blocks
    for (const block of loadedBlocks) {
      if (dataMap[block.date]) {
        dataMap[block.date].hasBlock = true;
      }
    }

    setDayDataMap(dataMap);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleDayClick(date: Date) {
    setSelectedDate(format(date, "yyyy-MM-dd"));
  }

  const selectedBlocks = selectedDate
    ? blocks.filter((b) => b.date === selectedDate)
    : [];

  const selectedDayData = selectedDate ? dayDataMap[selectedDate] : null;

  const bookingsOnDate = selectedDate
    ? bookings.filter((b) => {
        if (!b.end_date) return false;
        return b.start_date <= selectedDate && b.end_date > selectedDate;
      })
    : [];

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-on-surface uppercase mb-6">
        Availability
      </h1>

      {loading ? (
        <div className="h-96 bg-surface-lowest rounded-lg animate-pulse" />
      ) : (
        <AdminCalendar
          month={month}
          onMonthChange={setMonth}
          dayDataMap={dayDataMap}
          onDayClick={handleDayClick}
        />
      )}

      {selectedDate && selectedDayData && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setSelectedDate(null)}
          />
          <AdminDayDrawer
            date={selectedDate}
            blocks={selectedBlocks}
            roomOccupancy={selectedDayData.rooms}
            bungalowOccupancy={selectedDayData.bungalows}
            bookingsOnDate={bookingsOnDate}
            onClose={() => setSelectedDate(null)}
          />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 6: Commit**

```bash
git add src/components/admin/AdminCalendar.tsx src/components/admin/AdminDayDrawer.tsx src/app/admin/ src/app/api/admin/availability/
git commit -m "feat(admin): add availability page with calendar, occupancy display, day drawer"
```

---

## Task 16: Admin Account Page

**Files:**
- Create: `src/app/admin/(dashboard)/account/page.tsx`

- [ ] **Step 1: Create account page**

```typescript
// src/app/admin/(dashboard)/account/page.tsx
import { createClient } from "@/lib/supabase/server";

export default async function AdminAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-2xl font-bold text-on-surface uppercase mb-6">
        Account
      </h1>

      <div className="bg-surface-lowest border-2 border-outline-variant rounded-lg p-4 space-y-3">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
            Email
          </span>
          <p className="text-on-surface text-sm">{user?.email ?? "Unknown"}</p>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
            Role
          </span>
          <p className="text-on-surface text-sm">Admin</p>
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
            User ID
          </span>
          <p className="text-on-surface-variant text-xs font-mono">
            {user?.id ?? "Unknown"}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-on-surface-variant">
        To change your password, use Supabase Dashboard or contact the developer.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/
git commit -m "feat(admin): add account page showing user info"
```

---

## Task 17: Update Docs — ARCHITECTURE, ROADMAP, PROJET-STATUS

**Files:**
- Modify: `ARCHITECTURE.md`
- Modify: `ROADMAP.md`
- Modify: `PROJET-STATUS.md`

- [ ] **Step 1: Update ARCHITECTURE.md**

Add to Section 4 (Calendar Components): update private slots to 7 slots (08:00, 11:00-16:00).

Add new Section 5b: Profiles & Admin Auth — document `profiles` table, `is_admin()` function, middleware protection.

Update Section 8 (Admin Dashboard): add the route group `(dashboard)`, document all admin routes and API routes.

Add new Section 10 (or appropriate number): Capacity Model — document INVENTORY constants, getInventoryKey mapping, occupancy calculation logic.

- [ ] **Step 2: Update ROADMAP.md**

Tick all Phase 4 task checkboxes. Update Phase 4 status to COMPLETE.
Note that pending #56 is resolved (RLS tightening done in Phase 4).

- [ ] **Step 3: Update PROJET-STATUS.md**

Add Phase 4 completion entry. Update current phase to Phase 5.
Add correction history entries for: calendar refonte, slot fix, capacity system, admin dashboard.

- [ ] **Step 4: Commit**

```bash
git add ARCHITECTURE.md ROADMAP.md PROJET-STATUS.md
git commit -m "docs(phase-4): update ARCHITECTURE, ROADMAP, PROJET-STATUS after admin dashboard completion"
```

---

## Task 18: Full Smoke Test

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Test admin login flow**

1. Visit `/` — see Lock icon in nav
2. Click Lock icon → `/admin/login`
3. Login with admin credentials
4. Verify redirect to `/admin/bookings`
5. Verify Lock icon changes to LayoutDashboard (orange)

- [ ] **Step 3: Test bookings list**

1. View bookings table (desktop) and cards (resize to mobile)
2. Test each filter: type, status, date range, search
3. Test "Reset" clears all filters
4. Click a booking row → detail page

- [ ] **Step 4: Test booking detail**

1. Verify all sections render (client, details, stripe, notes, actions)
2. Edit notes → save → verify persist
3. Click status transition button → verify update
4. Click "Resend Email" → verify no error (check Resend dashboard)
5. Click "Stripe" external link → verify opens correct Stripe page

- [ ] **Step 5: Test availability**

1. Navigate to `/admin/availability`
2. Verify calendar shows occupancy (R x/7, B x/1) for days with bookings
3. Click a day → drawer opens
4. Toggle "Block all private" → verify block created
5. Toggle individual slot → verify block created
6. Remove a block → verify removed
7. Navigate months → verify data updates

- [ ] **Step 6: Test capacity on public booking flow**

1. Visit `/booking/camp-stay`
2. Verify calendar shows blocked dates where capacity is full (if any test bookings exist)
3. Attempt to book on a full date → should be greyed out

- [ ] **Step 7: Test calendar visual**

1. Visit `/booking/training` → verify dark theme calendar
2. Visit `/booking/private` → verify 7 slots (08:00, 11:00-16:00)
3. Visit `/booking/camp-stay` → verify calendar same theme
4. Verify mobile responsiveness at 375px

- [ ] **Step 8: Test middleware protection**

1. Sign out
2. Visit `/admin/bookings` directly → redirected to `/admin/login`
3. Visit `/admin/availability` → redirected
4. Visit `/admin/login` → login page renders

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: 0 errors

Run: `npm run lint`
Expected: 0 errors
