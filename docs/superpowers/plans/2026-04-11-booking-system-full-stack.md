# Booking System Full Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully functional booking system for Ratchawat Muay Thai with 4 client flows (training, private, fighter, camp-stay), Supabase persistence, Stripe Checkout payments, and Resend transactional emails, all testable in dev from day one.

**Architecture:** Next.js 16 App Router pages with shared `BookingWizard` client component shell. Supabase for bookings + availability persistence (RLS protected, service_role for confirmed page reads). Stripe Checkout Sessions with webhook-driven confirmation. Resend for client + admin emails. `react-day-picker` for all date selection.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4, Supabase (`@supabase/ssr`), Stripe (`stripe` SDK), Resend (`resend` + `@react-email/render`), react-day-picker, Zod.

**Spec:** `docs/superpowers/specs/2026-04-11-booking-system-full-stack-design.md`

---

## Section 1 — Documentation and data model sync

### Task 1: Patch ARCHITECTURE.md with 7 corrections

**Files:**
- Modify: `ARCHITECTURE.md`

- [ ] **Step 1: Remove `/booking/accommodation` from §2 routes list**

In `ARCHITECTURE.md` §2, find the routes block and delete the `/booking/accommodation` line entirely. The final routes block should list exactly: `/booking`, `/booking/training`, `/booking/private`, `/booking/camp-stay`, `/booking/fighter`, `/booking/confirmed`.

- [ ] **Step 2: Delete the Accommodation flow section in §3**

Remove the entire `### Accommodation (Plai Laem only)` subsection in §3. Keep Training, Private, Camp Stay, Fighter subsections.

- [ ] **Step 3: Rewrite Camp Stay flow in §3**

Replace the Camp Stay subsection with:

```markdown
### Camp Stay (training + accommodation, Plai Laem only)
1. Package — 1 week / 2 weeks / 1 month Room / 1 month Bungalow
2. Check-in date — AvailabilityCalendar (reads availability_blocks, type IN ('camp-stay','all'))
3. Contact info
4. Review + Stripe Checkout

Note: Clients stay at Plai Laem but can train at either camp (Bo Phut or Plai Laem). Booking record uses camp='both'.
```

- [ ] **Step 4: Rewrite Fighter flow in §3**

Replace the Fighter subsection with:

```markdown
### Fighter Program
1. Info screen — what is included in the Fighter Program
2. Tier selection — Fighter Only (9,500 THB) / Fighter + Room (20,000 THB approx) / Fighter + Bungalow (25,000 THB approx)
3. Camp + start date — Bo Phut or Plai Laem for Fighter Only, auto-locked to Plai Laem with AvailabilityCalendar for stay tiers
4. Contact info
5. Review + Stripe Checkout

Note: Fighter+Room and Fighter+Bungalow prices are approximate and marked with priceTodo until client confirmation.
```

- [ ] **Step 5: Update §5 bookings table**

Replace the `create table bookings` block with:

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

Then below the table, add:

```markdown
**Notes on bookings schema:**
- `type` dropped the 'accommodation' value (no prices exist for that type)
- `num_participants` added for Private Group bookings (2-3 people, prices per person)
- `time_slot` added for Private lessons (09:00 / 11:00 / 14:00 / 16:00)
- `camp` accepts 'both' for Camp Stay bookings (client stays at Plai Laem but trains at either camp)
```

- [ ] **Step 6: Update §5 availability_blocks type enum**

Find the line `type text not null check (type in ('private','accommodation','all'))` and replace with `type text not null check (type in ('private','camp-stay','all'))`.

- [ ] **Step 7: Add confirmed page pattern note to §5**

At the end of §5 (after the RLS policies), add:

```markdown
### Reading bookings from `/booking/confirmed`

The confirmed page is a Server Component that uses `SUPABASE_SERVICE_ROLE_KEY` server-side to bypass RLS. No public read policy is needed because:
1. The client is redirected with `?session_id={CHECKOUT_SESSION_ID}` from Stripe
2. The page retrieves the Stripe session server-side, extracts `metadata.booking_id`
3. The page queries Supabase via the admin client with that booking_id
4. Rendering happens on the server, so the service_role key never reaches the browser
```

- [ ] **Step 8: Add priceTodo note to §6**

Find the `## 6. Stripe Integration` section and under `### Products`, add:

```markdown
Prices with `priceTodo` set (currently `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly`) are still created as Stripe products using their approximate `price` value. The `priceTodo` note is included in the Stripe product description so the client can update the price in the Stripe dashboard later without code changes.
```

- [ ] **Step 9: Verify the file is consistent**

Read the full ARCHITECTURE.md and ensure no references to `accommodation` booking type remain.

**No commit yet — grouped with Task 2 and 3.**

---

### Task 2: Renumber ROADMAP.md and rewrite Phase 3

**Files:**
- Modify: `ROADMAP.md`

- [ ] **Step 1: Update header**

Change `**Current phase:** Phase 2 — Accommodation Page Redesign` to `**Current phase:** Phase 3 — Booking System Full Stack` and update `**Last updated:**` to today's date.

- [ ] **Step 2: Replace the entire Phase 3 section**

Locate `## Phase 3 — Booking System UI` and replace that whole section up to (but not including) `## Phase 4 — Backend Integration` with:

```markdown
## Phase 3 — Booking System Full Stack

**Status:** IN PROGRESS
**Goal:** 4 booking flows fully functional in dev with real Supabase persistence, Stripe Checkout, and Resend emails. Replaces the legacy flat BookingWidget.
**Blocker:** Phase 2 complete.
**Spec:** `docs/superpowers/specs/2026-04-11-booking-system-full-stack-design.md`
**Plan:** `docs/superpowers/plans/2026-04-11-booking-system-full-stack.md`

### Routes to build

- [ ] `/booking` — landing with 4 type selection cards (training / private / fighter / camp-stay)
- [ ] `/booking/training` — 5-step wizard (package, camp, date, contact, payment)
- [ ] `/booking/private` — 5-step wizard (session type, camp, date+time-slot, contact, payment)
- [ ] `/booking/fighter` — 5-step wizard (info, tier, camp+date, contact, payment)
- [ ] `/booking/camp-stay` — 4-step wizard (package, check-in, contact, payment)
- [ ] `/booking/confirmed` — server component reading Supabase via service_role

### Components to build

- [ ] `BookingWizard` — shared shell with step indicator and navigation
- [ ] `DatePicker` — react-day-picker wrapper with design tokens
- [ ] `AvailabilityCalendar` — Supabase-connected calendar for private and camp-stay
- [ ] `ContactInfoForm` — name, email, phone, nationality, num_participants, notes
- [ ] `BookingReview` — summary and Pay button

### Backend to wire

- [ ] Supabase project (dedicated account) + migration for bookings + availability_blocks + RLS policies
- [ ] Stripe test-mode products (22 seeded) via `scripts/stripe-seed-products.ts`
- [ ] Rewrite `/api/checkout` with Zod + Supabase insert + Stripe Checkout Session
- [ ] Rewrite `/api/webhooks/stripe` with signature verification + booking update + email send
- [ ] Resend integration with BookingConfirmed and BookingNotification React templates

### Setup to perform

- [ ] Create Supabase project + run migration SQL
- [ ] Configure .env.local with Supabase + Stripe + Resend keys
- [ ] Run `npx tsx scripts/stripe-seed-products.ts` to create products
- [ ] Start `stripe listen --forward-to localhost:3000/api/webhooks/stripe` for webhook

### Success criteria

All 4 booking flows payable end-to-end with Stripe test card `4242 4242 4242 4242`. Bookings appear in Supabase with `status='confirmed'`. Client and admin emails received. `npm run build` passes with 0 errors.

### Known follow-ups (deferred)

- Replace approximate prices for `fighter-stay-room-monthly` and `fighter-stay-bungalow-monthly` once client confirms
- Rate limiting, CORS, and Zod hardening on API routes (tracked in new Phase 5)
- Domain verification for Resend production sender (tracked in new Phase 6)
```

- [ ] **Step 3: Delete the old Phase 4 — Backend Integration section entirely**

Find `## Phase 4 — Backend Integration` and delete through the end of its "Success criteria" subsection (everything until the next `## Phase 5` header).

- [ ] **Step 4: Renumber subsequent phases**

- `## Phase 5 — Admin Dashboard` → `## Phase 4 — Admin Dashboard`
- `## Phase 6 — Security & Quality` → `## Phase 5 — Security & Quality`
- `## Phase 7 — Go-live` → `## Phase 6 — Go-live`

Update their `**Blocker:**` lines to reference the new phase numbers.

- [ ] **Step 5: Verify no dangling Phase 7 references**

Search the file for "Phase 7" and "Phase 4 — Backend" and confirm no occurrences.

**No commit yet — grouped with Tasks 1 and 3.**

---

### Task 3: Update pricing.ts — drop accommodation type and reclassify fighter-stay

**Files:**
- Modify: `src/content/pricing.ts`

- [ ] **Step 1: Remove `"accommodation"` from BookingType union**

Change:
```typescript
export type BookingType =
  | "training"
  | "private"
  | "accommodation"
  | "camp-stay"
  | "fighter";
```

to:
```typescript
export type BookingType =
  | "training"
  | "private"
  | "camp-stay"
  | "fighter";
```

- [ ] **Step 2: Reclassify fighter-stay-room-monthly**

Find the entry `id: "fighter-stay-room-monthly"` and change `bookingType: "camp-stay"` to `bookingType: "fighter"`.

- [ ] **Step 3: Reclassify fighter-stay-bungalow-monthly**

Find the entry `id: "fighter-stay-bungalow-monthly"` and change `bookingType: "camp-stay"` to `bookingType: "fighter"`.

- [ ] **Step 4: Verify type check passes**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit Task 1 + 2 + 3 together**

```bash
git add ARCHITECTURE.md ROADMAP.md src/content/pricing.ts
git commit -m "docs(phase-3): sync ARCHITECTURE + ROADMAP + pricing.ts for booking system full stack

- ARCHITECTURE.md: drop /booking/accommodation, add 3-tier Fighter, camp='both', num_participants, time_slot, confirmed page pattern
- ROADMAP.md: merge Phase 3+4 into Phase 3 Full Stack, renumber 4-6
- pricing.ts: drop 'accommodation' BookingType, reclassify fighter-stay-* as 'fighter'"
```

---

## Section 2 — Dependencies and environment setup

### Task 4: Install npm dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (auto)

- [ ] **Step 1: Install booking-related packages**

```bash
npm install react-day-picker date-fns @supabase/ssr @supabase/supabase-js resend @react-email/render @react-email/components zod
```

- [ ] **Step 2: Install dev-only packages for Stripe seed script**

```bash
npm install --save-dev tsx
```

Note: `stripe` may already be installed. Verify with `npm ls stripe`. If not installed, run `npm install stripe`.

- [ ] **Step 3: Verify versions in package.json**

Expected (or newer) versions:
- `react-day-picker` ≥ 9.0.0
- `@supabase/ssr` ≥ 0.5.0
- `@supabase/supabase-js` ≥ 2.45.0
- `resend` ≥ 4.0.0
- `@react-email/render` ≥ 1.0.0
- `stripe` ≥ 17.0.0
- `zod` ≥ 3.23.0
- `tsx` ≥ 4.19.0 (devDependencies)

- [ ] **Step 4: Verify build still passes**

```bash
npm run build
```

Expected: 0 errors, 28 static pages (current).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(deps): add booking system dependencies (supabase, stripe, resend, react-day-picker, zod)"
```

---

### Task 5: Create .env.example and document .env.local setup

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (ensure .env.local ignored)

- [ ] **Step 1: Create .env.example**

Create `.env.example` with these exact contents:

```bash
# Supabase (dedicated project account)
# Get from: https://app.supabase.com → your project → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Stripe (client account, TEST mode)
# Get from: Stripe dashboard → Developers → API keys (ensure TEST mode toggle)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
# Get from: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend (dedicated project account)
# Get from: https://resend.com → API Keys
RESEND_API_KEY=re_...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=chor.ratchawat@gmail.com
```

- [ ] **Step 2: Verify .env.local is gitignored**

Read `.gitignore` and confirm `.env*.local` or `.env.local` is present. If not, add `.env*.local` as a new line under the `# local env files` section.

- [ ] **Step 3: Commit**

```bash
git add .env.example .gitignore
git commit -m "chore: add .env.example with setup instructions for Supabase, Stripe, Resend"
```

---

## Section 3 — Supabase and backend primitives

### Task 6: Create Supabase migration file

**Files:**
- Create: `supabase/migrations/20260411000000_init.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260411000000_init.sql` with this exact content:

```sql
-- Booking system initial schema
-- Phase 3 — Booking System Full Stack

-- ============================================================
-- Table: bookings
-- ============================================================
create table if not exists bookings (
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

create index if not exists bookings_created_at_idx on bookings (created_at desc);
create index if not exists bookings_email_idx on bookings (client_email);
create index if not exists bookings_status_idx on bookings (status);

-- ============================================================
-- Table: availability_blocks
-- ============================================================
create table if not exists availability_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('private','camp-stay','all')),
  date date not null,
  time_slot text,
  is_blocked boolean not null default true,
  reason text,
  created_by uuid references auth.users(id)
);

create index if not exists availability_blocks_date_idx on availability_blocks (date);
create index if not exists availability_blocks_type_date_idx on availability_blocks (type, date);

-- ============================================================
-- RLS: bookings
-- ============================================================
alter table bookings enable row level security;

create policy "anon_insert_bookings" on bookings
  for insert to anon with check (true);

create policy "admin_read_bookings" on bookings
  for select to authenticated using (true);

create policy "admin_update_bookings" on bookings
  for update to authenticated using (true);

-- ============================================================
-- RLS: availability_blocks
-- ============================================================
alter table availability_blocks enable row level security;

create policy "public_read_availability" on availability_blocks
  for select to anon using (true);

create policy "admin_manage_availability" on availability_blocks
  for all to authenticated using (true);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260411000000_init.sql
git commit -m "feat(supabase): add init migration for bookings and availability_blocks tables"
```

---

### Task 7: Create Supabase client helpers

**Files:**
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/admin.ts`

- [ ] **Step 1: Create the browser client**

Create `src/lib/supabase/browser.ts`:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 2: Create the server client (cookies-based)**

Create `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components can't set cookies — middleware handles refresh
          }
        },
      },
    },
  );
}
```

- [ ] **Step 3: Create the admin client (service_role)**

Create `src/lib/supabase/admin.ts`:

```typescript
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client using service_role key.
// Never import this file in client components.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
```

- [ ] **Step 4: Verify type check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/
git commit -m "feat(supabase): add browser, server, and admin client helpers"
```

---

### Task 8: Create Zod validation schemas for booking

**Files:**
- Create: `src/lib/validation/booking.ts`

- [ ] **Step 1: Create the Zod schemas**

Create `src/lib/validation/booking.ts`:

```typescript
import { z } from "zod";

export const BookingTypeSchema = z.enum([
  "training",
  "private",
  "camp-stay",
  "fighter",
]);

export const CampSchema = z.enum(["bo-phut", "plai-laem", "both"]);

export const TimeSlotSchema = z.enum(["09:00", "11:00", "14:00", "16:00"]);

export const BookingRequestSchema = z.object({
  price_id: z.string().min(1),
  type: BookingTypeSchema,
  camp: CampSchema,
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  end_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  time_slot: TimeSlotSchema.optional(),
  num_participants: z.number().int().min(1).max(3).default(1),
  client_name: z.string().trim().min(2).max(100),
  client_email: z.string().trim().email().max(200),
  client_phone: z.string().trim().min(6).max(30),
  client_nationality: z.string().trim().min(2).max(60).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type BookingRequest = z.infer<typeof BookingRequestSchema>;
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/validation/booking.ts
git commit -m "feat(booking): add Zod schemas for booking request validation"
```

---

### Task 9: Create Stripe seed script

**Files:**
- Create: `scripts/stripe-seed-products.ts`

- [ ] **Step 1: Create the seed script**

Create `scripts/stripe-seed-products.ts`:

```typescript
/**
 * Stripe seed script
 *
 * Creates Stripe Products + Prices for every PriceItem in pricing.ts
 * (excluding bodyweight items, which are in-person only).
 *
 * Writes generated stripeProductId and stripePriceId back into
 * src/content/pricing.ts via in-place regex replacement.
 *
 * Idempotent: re-running skips entries that already have stripeProductId.
 *
 * Usage:
 *   npx tsx scripts/stripe-seed-products.ts
 *
 * Required env:
 *   STRIPE_SECRET_KEY (test mode key)
 */

import Stripe from "stripe";
import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";

config({ path: ".env.local" });

import { PRICES } from "../src/content/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

const PRICING_FILE = path.resolve(__dirname, "../src/content/pricing.ts");

async function main() {
  const toSeed = PRICES.filter(
    (p) =>
      p.price !== null &&
      !p.stripeProductId &&
      !p.id.startsWith("bodyweight-"),
  );

  console.log(`Seeding ${toSeed.length} Stripe products...`);

  let fileContent = fs.readFileSync(PRICING_FILE, "utf8");

  for (const item of toSeed) {
    console.log(`  → ${item.id} (${item.price} THB)`);

    const product = await stripe.products.create({
      name: item.name,
      description: [
        item.description,
        item.notes,
        item.priceTodo ? `NOTE: ${item.priceTodo}` : null,
      ]
        .filter(Boolean)
        .join(" — "),
      metadata: {
        price_id: item.id,
        category: item.category,
        booking_type: item.bookingType,
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: item.price! * 100, // Stripe expects smallest currency unit
      currency: "thb",
    });

    // Inject back into pricing.ts using a regex anchored on the id line.
    // Target pattern: `id: "xxx",` — insert Stripe IDs right after the id line.
    const idLine = `id: "${item.id}",`;
    const replacement =
      `${idLine}\n    stripeProductId: "${product.id}",\n    stripePriceId: "${price.id}",`;

    if (fileContent.includes(`stripeProductId: "${product.id}"`)) {
      // already injected somehow — skip
      continue;
    }

    fileContent = fileContent.replace(idLine, replacement);
  }

  fs.writeFileSync(PRICING_FILE, fileContent, "utf8");
  console.log("Done. Updated src/content/pricing.ts with Stripe IDs.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Install dotenv if missing**

```bash
npm ls dotenv || npm install --save-dev dotenv
```

- [ ] **Step 3: Add npm script**

Edit `package.json` scripts block, add:

```json
"stripe:seed": "tsx scripts/stripe-seed-products.ts"
```

- [ ] **Step 4: Verify the script type-checks**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add scripts/ package.json package-lock.json
git commit -m "feat(stripe): add idempotent seed script for products and prices"
```

---

### Task 10: Create Resend email templates

**Files:**
- Create: `src/lib/email/templates/BookingConfirmed.tsx`
- Create: `src/lib/email/templates/BookingNotification.tsx`

- [ ] **Step 1: Create shared booking type**

Create `src/lib/email/types.ts`:

```typescript
export interface BookingEmailData {
  id: string;
  type: "training" | "private" | "camp-stay" | "fighter";
  price_id: string;
  price_amount: number;
  start_date: string;
  end_date: string | null;
  time_slot: string | null;
  camp: "bo-phut" | "plai-laem" | "both" | null;
  num_participants: number;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_nationality: string | null;
  notes: string | null;
}
```

- [ ] **Step 2: Create the client confirmation template**

Create `src/lib/email/templates/BookingConfirmed.tsx`:

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Link,
  Hr,
} from "@react-email/components";
import type { BookingEmailData } from "../types";

interface Props {
  booking: BookingEmailData;
  packageName: string;
}

const CAMP_LABEL: Record<string, string> = {
  "bo-phut": "Bo Phut",
  "plai-laem": "Plai Laem",
  both: "Plai Laem stay, both camps for training",
};

export function BookingConfirmed({ booking, packageName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>
        Your Muay Thai booking at Ratchawat Koh Samui is confirmed
      </Preview>
      <Body style={{ fontFamily: "Inter, Arial, sans-serif", backgroundColor: "#0a0a0a", color: "#f5f5f5" }}>
        <Container style={{ padding: 24, maxWidth: 560 }}>
          <Heading style={{ color: "#ff6600" }}>Booking confirmed</Heading>
          <Text>Hi {booking.client_name},</Text>
          <Text>
            Thanks for booking with Ratchawat Muay Thai in Koh Samui. Your
            training is locked in. Here is your summary.
          </Text>

          <Section>
            <Text><strong>Package:</strong> {packageName}</Text>
            <Text><strong>Start date:</strong> {booking.start_date}</Text>
            {booking.end_date && (
              <Text><strong>End date:</strong> {booking.end_date}</Text>
            )}
            {booking.time_slot && (
              <Text><strong>Time:</strong> {booking.time_slot}</Text>
            )}
            {booking.camp && (
              <Text><strong>Location:</strong> {CAMP_LABEL[booking.camp]}</Text>
            )}
            <Text><strong>Total paid:</strong> {booking.price_amount.toLocaleString()} THB</Text>
          </Section>

          <Hr />

          <Heading as="h2">What happens next</Heading>
          <Text>
            Show up 10 minutes before your first session. Bring shorts and a
            t-shirt. We provide gloves, shin guards, and wraps.
          </Text>

          <Heading as="h3">Address</Heading>
          <Text>
            <Link href="https://maps.google.com/?q=Plai+Laem+Muay+Thai+Koh+Samui">
              Plai Laem camp — Soi Sunday
            </Link>
            {" · "}
            <Link href="https://maps.google.com/?q=Bo+Phut+Muay+Thai+Koh+Samui">
              Bo Phut camp — Fisherman Village
            </Link>
          </Text>

          <Heading as="h3">Need to reach us</Heading>
          <Text>
            WhatsApp: <Link href="https://wa.me/66630802876">+66 63 080 2876</Link>
          </Text>
          <Text>
            Email: <Link href="mailto:chor.ratchawat@gmail.com">chor.ratchawat@gmail.com</Link>
          </Text>

          <Hr />
          <Text style={{ fontSize: 12, color: "#999" }}>
            Booking ID: {booking.id}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 3: Create the admin notification template**

Create `src/lib/email/templates/BookingNotification.tsx`:

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import type { BookingEmailData } from "../types";

interface Props {
  booking: BookingEmailData;
  packageName: string;
}

export function BookingNotification({ booking, packageName }: Props) {
  return (
    <Html>
      <Head />
      <Preview>New booking: {packageName} — {booking.client_name}</Preview>
      <Body style={{ fontFamily: "Arial, sans-serif" }}>
        <Container style={{ padding: 24, maxWidth: 560 }}>
          <Heading>New booking received</Heading>

          <Section>
            <Text><strong>Package:</strong> {packageName} ({booking.price_id})</Text>
            <Text><strong>Type:</strong> {booking.type}</Text>
            <Text><strong>Amount:</strong> {booking.price_amount.toLocaleString()} THB</Text>
            <Text><strong>Participants:</strong> {booking.num_participants}</Text>
          </Section>

          <Hr />

          <Heading as="h2">Dates</Heading>
          <Text><strong>Start:</strong> {booking.start_date}</Text>
          {booking.end_date && <Text><strong>End:</strong> {booking.end_date}</Text>}
          {booking.time_slot && <Text><strong>Time slot:</strong> {booking.time_slot}</Text>}
          <Text><strong>Camp:</strong> {booking.camp}</Text>

          <Hr />

          <Heading as="h2">Client</Heading>
          <Text><strong>Name:</strong> {booking.client_name}</Text>
          <Text><strong>Email:</strong> {booking.client_email}</Text>
          <Text><strong>Phone:</strong> {booking.client_phone}</Text>
          {booking.client_nationality && (
            <Text><strong>Nationality:</strong> {booking.client_nationality}</Text>
          )}
          {booking.notes && <Text><strong>Notes:</strong> {booking.notes}</Text>}

          <Hr />
          <Text style={{ fontSize: 11, color: "#666" }}>
            Booking ID: {booking.id}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 4: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/email/
git commit -m "feat(email): add BookingConfirmed and BookingNotification React email templates"
```

---

### Task 11: Create Resend send helper

**Files:**
- Create: `src/lib/email/send.ts`

- [ ] **Step 1: Create the helper**

Create `src/lib/email/send.ts`:

```typescript
import { Resend } from "resend";
import { render } from "@react-email/render";
import { BookingConfirmed } from "./templates/BookingConfirmed";
import { BookingNotification } from "./templates/BookingNotification";
import type { BookingEmailData } from "./types";
import { getPriceById } from "@/content/pricing";

function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM_DEV = "Ratchawat Muay Thai <onboarding@resend.dev>";
const FROM_PROD = "Ratchawat Muay Thai <bookings@ratchawatmuaythai.com>";

function getFromAddress(): string {
  return process.env.NODE_ENV === "production" ? FROM_PROD : FROM_DEV;
}

export async function sendBookingConfirmationEmail(booking: BookingEmailData) {
  const resend = getResend();
  const pkg = getPriceById(booking.price_id);
  const packageName = pkg?.name ?? booking.price_id;

  const html = await render(
    BookingConfirmed({ booking, packageName }),
  );

  return resend.emails.send({
    from: getFromAddress(),
    to: booking.client_email,
    subject: "Your booking at Ratchawat Muay Thai is confirmed",
    html,
  });
}

export async function sendAdminNotificationEmail(booking: BookingEmailData) {
  const resend = getResend();
  const pkg = getPriceById(booking.price_id);
  const packageName = pkg?.name ?? booking.price_id;

  const html = await render(
    BookingNotification({ booking, packageName }),
  );

  const adminEmail = process.env.ADMIN_EMAIL ?? "chor.ratchawat@gmail.com";

  return resend.emails.send({
    from: getFromAddress(),
    to: adminEmail,
    subject: `New booking: ${packageName} — ${booking.client_name}`,
    html,
  });
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/send.ts
git commit -m "feat(email): add Resend send helpers for booking confirmation and admin notification"
```

---

### Task 12: Rewrite /api/checkout route

**Files:**
- Modify: `src/app/api/checkout/route.ts`

- [ ] **Step 1: Replace the entire file**

Replace the full contents of `src/app/api/checkout/route.ts` with:

```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookingRequestSchema } from "@/lib/validation/booking";
import { getPriceById } from "@/content/pricing";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate body
    const parsed = BookingRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid booking request", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const data = parsed.data;

    // Look up price in pricing.ts
    const pkg = getPriceById(data.price_id);
    if (!pkg) {
      return NextResponse.json({ error: "Unknown price_id" }, { status: 400 });
    }
    if (!pkg.stripePriceId) {
      return NextResponse.json(
        { error: "Stripe price not configured. Run stripe seed script." },
        { status: 500 },
      );
    }

    // Compute total amount (supports private group per-person pricing)
    const totalAmount = (pkg.price ?? 0) * data.num_participants;

    // Insert pending booking via admin client (bypass RLS)
    const supabase = createAdminClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        type: data.type,
        status: "pending",
        price_id: data.price_id,
        price_amount: totalAmount,
        num_participants: data.num_participants,
        start_date: data.start_date,
        end_date: data.end_date,
        time_slot: data.time_slot,
        camp: data.camp,
        client_name: data.client_name,
        client_email: data.client_email,
        client_phone: data.client_phone,
        client_nationality: data.client_nationality,
        notes: data.notes,
      })
      .select("id")
      .single();

    if (error || !booking) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 },
      );
    }

    // Create Stripe Checkout Session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: pkg.stripePriceId,
          quantity: data.num_participants,
        },
      ],
      metadata: {
        booking_id: booking.id,
      },
      customer_email: data.client_email,
      success_url: `${siteUrl}/booking/confirmed?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/booking?cancelled=1`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/checkout/route.ts
git commit -m "feat(api): rewrite /api/checkout with Zod validation, Supabase insert, Stripe Checkout"
```

---

### Task 13: Rewrite /api/webhooks/stripe route

**Files:**
- Modify: `src/app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: Replace the entire file**

Replace the full contents of `src/app/api/webhooks/stripe/route.ts` with:

```typescript
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  sendBookingConfirmationEmail,
  sendAdminNotificationEmail,
} from "@/lib/email/send";
import type { BookingEmailData } from "@/lib/email/types";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
});

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (!bookingId) {
      console.error("Missing booking_id in session metadata");
      return NextResponse.json({ received: true });
    }

    // Update booking to confirmed
    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : null,
        stripe_payment_status: session.payment_status,
      })
      .eq("id", bookingId)
      .select("*")
      .single();

    if (error || !updated) {
      console.error("Failed to update booking:", error);
      return NextResponse.json({ received: true });
    }

    // Fire-and-forget emails (don't block webhook response)
    const bookingData: BookingEmailData = {
      id: updated.id,
      type: updated.type,
      price_id: updated.price_id,
      price_amount: updated.price_amount,
      start_date: updated.start_date,
      end_date: updated.end_date,
      time_slot: updated.time_slot,
      camp: updated.camp,
      num_participants: updated.num_participants,
      client_name: updated.client_name,
      client_email: updated.client_email,
      client_phone: updated.client_phone,
      client_nationality: updated.client_nationality,
      notes: updated.notes,
    };

    try {
      await Promise.all([
        sendBookingConfirmationEmail(bookingData),
        sendAdminNotificationEmail(bookingData),
      ]);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // Don't fail the webhook — booking is confirmed regardless
    }
  } else if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      await supabase
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", bookingId);
    }
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/webhooks/stripe/route.ts
git commit -m "feat(api): rewrite /api/webhooks/stripe with signature verification, booking update, email send"
```

---

## Section 4 — Shared booking components

### Task 14: Create BookingWizard shell component

**Files:**
- Create: `src/components/booking/BookingWizard.tsx`

- [ ] **Step 1: Create the shell**

Create `src/components/booking/BookingWizard.tsx`:

```tsx
"use client";

import { Check } from "lucide-react";
import { ReactNode } from "react";

interface BookingWizardProps {
  steps: string[];
  currentStep: number;
  onStepChange: (step: number) => void;
  canProceed: boolean;
  isFinalStep: boolean;
  isSubmitting?: boolean;
  submitLabel?: string;
  onSubmit?: () => void;
  children: ReactNode;
}

export default function BookingWizard({
  steps,
  currentStep,
  onStepChange,
  canProceed,
  isFinalStep,
  isSubmitting = false,
  submitLabel = "Pay",
  onSubmit,
  children,
}: BookingWizardProps) {
  return (
    <div>
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-10">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2 flex-1">
            <button
              type="button"
              onClick={() => i < currentStep && onStepChange(i)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                i < currentStep
                  ? "bg-primary text-white cursor-pointer"
                  : i === currentStep
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-surface-lowest text-on-surface-variant"
              }`}
              aria-label={`Step ${i + 1}: ${label}`}
              aria-current={i === currentStep ? "step" : undefined}
            >
              {i < currentStep ? <Check size={14} aria-hidden="true" /> : i + 1}
            </button>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i <= currentStep ? "text-on-surface" : "text-on-surface-variant"
              }`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  i < currentStep ? "bg-primary" : "bg-outline-variant"
                }`}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div>{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={() => onStepChange(currentStep - 1)}
            className="text-on-surface-variant text-sm font-medium hover:text-on-surface transition-colors"
          >
            Back
          </button>
        ) : (
          <div />
        )}

        {isFinalStep ? (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canProceed || isSubmitting}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors text-sm ${
              canProceed && !isSubmitting
                ? "bg-primary text-white hover:bg-primary-dim"
                : "bg-surface-lowest text-on-surface-variant cursor-not-allowed"
            }`}
          >
            {isSubmitting ? "Processing..." : submitLabel}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => canProceed && onStepChange(currentStep + 1)}
            disabled={!canProceed}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-lg transition-colors text-sm ${
              canProceed
                ? "bg-primary text-white hover:bg-primary-dim"
                : "bg-surface-lowest text-on-surface-variant cursor-not-allowed"
            }`}
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/BookingWizard.tsx
git commit -m "feat(booking): add BookingWizard shared shell component"
```

---

### Task 15: Create DatePicker component

**Files:**
- Create: `src/components/booking/DatePicker.tsx`

- [ ] **Step 1: Create the DatePicker wrapper**

Create `src/components/booking/DatePicker.tsx`:

```tsx
"use client";

import { DayPicker, Matcher } from "react-day-picker";
import "react-day-picker/dist/style.css";

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
    <div className="rdp-wrapper bg-surface-lowest border-2 border-outline-variant rounded-[var(--radius-card)] p-4">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={disabled}
        showOutsideDays
        classNames={{
          root: "text-on-surface",
          caption_label: "font-serif font-bold text-on-surface",
          nav_button: "text-on-surface hover:text-primary",
          head_cell: "text-on-surface-variant text-xs font-semibold uppercase",
          day: "text-on-surface hover:bg-primary/10 rounded-md transition-colors",
          day_selected:
            "bg-primary text-white hover:bg-primary-dim font-bold",
          day_today: "text-primary font-bold",
          day_disabled: "text-on-surface-variant/30 line-through",
          day_outside: "text-on-surface-variant/40",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/DatePicker.tsx
git commit -m "feat(booking): add DatePicker wrapper around react-day-picker"
```

---

### Task 16: Create AvailabilityCalendar component

**Files:**
- Create: `src/components/booking/AvailabilityCalendar.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/booking/AvailabilityCalendar.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "./DatePicker";
import { createClient } from "@/lib/supabase/browser";
import { Matcher } from "react-day-picker";

interface AvailabilityBlock {
  date: string;
  time_slot: string | null;
  type: string;
}

interface Props {
  type: "private" | "camp-stay";
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  onAvailableSlotsChange?: (slots: string[]) => void;
}

const ALL_SLOTS = ["09:00", "11:00", "14:00", "16:00"];

export default function AvailabilityCalendar({
  type,
  selected,
  onSelect,
  onAvailableSlotsChange,
}: Props) {
  const [blocks, setBlocks] = useState<AvailabilityBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("availability_blocks")
      .select("date, time_slot, type")
      .in("type", [type, "all"])
      .eq("is_blocked", true)
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to load availability:", error);
        } else {
          setBlocks(data ?? []);
        }
        setLoading(false);
      });
  }, [type]);

  // Fully blocked dates: every slot blocked, or a row without time_slot
  const disabledDays: Matcher[] = useMemo(() => {
    const blockedDates = new Set<string>();
    const dateSlotMap = new Map<string, Set<string>>();

    for (const block of blocks) {
      if (!block.time_slot) {
        blockedDates.add(block.date);
      } else {
        if (!dateSlotMap.has(block.date)) dateSlotMap.set(block.date, new Set());
        dateSlotMap.get(block.date)!.add(block.time_slot);
      }
    }

    // Mark as fully blocked if all time slots blocked (private only)
    if (type === "private") {
      for (const [date, slots] of dateSlotMap.entries()) {
        if (slots.size >= ALL_SLOTS.length) blockedDates.add(date);
      }
    }

    return Array.from(blockedDates).map((d) => new Date(d + "T00:00:00"));
  }, [blocks, type]);

  // Notify parent of available slots for the selected date (private only)
  useEffect(() => {
    if (!selected || type !== "private" || !onAvailableSlotsChange) return;
    const dateStr = selected.toISOString().split("T")[0];
    const blockedSlotsForDate = new Set(
      blocks
        .filter((b) => b.date === dateStr && b.time_slot)
        .map((b) => b.time_slot as string),
    );
    const available = ALL_SLOTS.filter((s) => !blockedSlotsForDate.has(s));
    onAvailableSlotsChange(available);
  }, [selected, blocks, type, onAvailableSlotsChange]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (loading) {
    return (
      <div className="h-80 bg-surface-lowest rounded-[var(--radius-card)] animate-pulse" />
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
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/AvailabilityCalendar.tsx
git commit -m "feat(booking): add AvailabilityCalendar component backed by Supabase"
```

---

### Task 17: Create ContactInfoForm component

**Files:**
- Create: `src/components/booking/ContactInfoForm.tsx`

- [ ] **Step 1: Create the form**

Create `src/components/booking/ContactInfoForm.tsx`:

```tsx
"use client";

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  nationality: string;
  numParticipants: number;
  notes: string;
}

interface Props {
  value: ContactInfo;
  onChange: (value: ContactInfo) => void;
  showParticipants?: boolean;
  maxParticipants?: number;
}

export default function ContactInfoForm({
  value,
  onChange,
  showParticipants = false,
  maxParticipants = 3,
}: Props) {
  const update = (patch: Partial<ContactInfo>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Full name"
        value={value.name}
        onChange={(e) => update({ name: e.target.value })}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
        required
      />
      <input
        type="email"
        placeholder="Email address"
        value={value.email}
        onChange={(e) => update({ email: e.target.value })}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
        required
      />
      <input
        type="tel"
        placeholder="Phone (e.g. +66 12 345 6789)"
        value={value.phone}
        onChange={(e) => update({ phone: e.target.value })}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
        required
      />
      <input
        type="text"
        placeholder="Nationality (optional)"
        value={value.nationality}
        onChange={(e) => update({ nationality: e.target.value })}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors"
      />
      {showParticipants && (
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-2">
            Number of participants
          </label>
          <select
            value={value.numParticipants}
            onChange={(e) =>
              update({ numParticipants: parseInt(e.target.value, 10) })
            }
            className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
          >
            {Array.from({ length: maxParticipants }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "person" : "people"}
              </option>
            ))}
          </select>
        </div>
      )}
      <textarea
        placeholder="Notes (optional) — injuries, experience level, dietary requirements..."
        value={value.notes}
        onChange={(e) => update({ notes: e.target.value })}
        rows={3}
        className="w-full bg-surface border-2 border-outline-variant rounded-[var(--radius-input)] px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none transition-colors resize-none"
      />
    </div>
  );
}

export function isContactInfoValid(info: ContactInfo): boolean {
  return (
    info.name.trim().length >= 2 &&
    /^\S+@\S+\.\S+$/.test(info.email.trim()) &&
    info.phone.trim().length >= 6
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/ContactInfoForm.tsx
git commit -m "feat(booking): add ContactInfoForm with optional participants selector"
```

---

### Task 18: Create BookingReview component

**Files:**
- Create: `src/components/booking/BookingReview.tsx`

- [ ] **Step 1: Create the review card**

Create `src/components/booking/BookingReview.tsx`:

```tsx
"use client";

import GlassCard from "@/components/ui/GlassCard";

interface ReviewRow {
  label: string;
  value: string;
}

interface Props {
  rows: ReviewRow[];
  totalAmount: number;
  note?: string;
}

export default function BookingReview({ rows, totalAmount, note }: Props) {
  return (
    <GlassCard hover={false}>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
        Booking Summary
      </h3>
      <div className="space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-4">
            <span className="text-on-surface-variant">{row.label}</span>
            <span className="text-on-surface font-medium text-right">
              {row.value}
            </span>
          </div>
        ))}
        <div className="flex justify-between pt-2 border-t border-outline-variant">
          <span className="text-on-surface font-semibold">Total</span>
          <span className="font-serif text-xl font-bold text-primary">
            {totalAmount.toLocaleString()} THB
          </span>
        </div>
      </div>
      {note && (
        <p className="text-on-surface-variant text-xs mt-4 leading-relaxed">
          {note}
        </p>
      )}
    </GlassCard>
  );
}
```

- [ ] **Step 2: Verify type check**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/booking/BookingReview.tsx
git commit -m "feat(booking): add BookingReview summary card component"
```

---

## Section 5 — Booking pages

### Task 19: Delete legacy BookingWidget and rebuild /booking landing

**Files:**
- Delete: `src/app/booking/BookingWidget.tsx`
- Modify: `src/app/booking/page.tsx`

- [ ] **Step 1: Delete the legacy widget**

```bash
rm src/app/booking/BookingWidget.tsx
```

- [ ] **Step 2: Replace /booking/page.tsx with the new landing**

Replace the full contents of `src/app/booking/page.tsx` with:

```tsx
import Link from "next/link";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { Users, User, Swords, Home } from "lucide-react";

export const metadata = generatePageMeta({
  title: "Book Muay Thai Training Online | Ratchawat Koh Samui",
  description:
    "Book group training, private lessons, fighter program, or camp stay at Ratchawat Muay Thai Koh Samui. Instant Stripe payment and email confirmation.",
  path: "/booking",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

const bookingSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Book Muay Thai Training",
  url: `${SITE_URL}/booking`,
  potentialAction: {
    "@type": "ReserveAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/booking`,
    },
    result: {
      "@type": "Reservation",
      name: "Muay Thai Training Session",
    },
  },
};

const bookingTypes = [
  {
    id: "training",
    icon: Users,
    title: "Group Training",
    from: "From 400 THB",
    badge: "Bo Phut or Plai Laem",
    description:
      "Drop in for a single class, train a full week, or commit for a month. Morning and afternoon sessions, six days a week.",
    href: "/booking/training",
    cta: "Book Training",
  },
  {
    id: "private",
    icon: User,
    title: "Private Lessons",
    from: "From 600 THB",
    badge: "Bo Phut or Plai Laem",
    description:
      "One-on-one or small-group sessions for adults and kids. Fully personalized training with a dedicated trainer.",
    href: "/booking/private",
    cta: "Book Private",
  },
  {
    id: "fighter",
    icon: Swords,
    title: "Fighter Program",
    from: "From 9,500 THB / month",
    badge: "Bo Phut or Plai Laem",
    description:
      "For athletes who want to compete. Two sessions a day, six days a week, with fight organization and corner support.",
    href: "/booking/fighter",
    cta: "Apply Now",
  },
  {
    id: "camp-stay",
    icon: Home,
    title: "Camp Stay",
    from: "From 8,000 THB / week",
    badge: "Stay Plai Laem, train any camp",
    description:
      "All-inclusive training + accommodation at Plai Laem. Standard rooms and private bungalows. Access to both camps for training.",
    href: "/booking/camp-stay",
    cta: "Book Camp Stay",
  },
];

export default function BookingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), bookingSchema]} />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Book" }]} />

      {/* Page Header */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              BOOK ONLINE
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Book Your Training
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Four ways to train at Ratchawat. Pick the one that fits you, pay securely, get an instant confirmation.
          </p>
        </div>
      </section>

      {/* Type cards */}
      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookingTypes.map((type, i) => (
            <GlassCard
              key={type.id}
              number={String(i + 1).padStart(2, "0")}
            >
              <div className="flex items-start gap-4 mb-4">
                <type.icon size={32} className="text-primary shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h2 className="font-serif text-xl font-bold text-on-surface uppercase">
                    {type.title}
                  </h2>
                  <p className="text-primary font-semibold text-sm mt-1">
                    {type.from}
                  </p>
                </div>
              </div>
              <span className="inline-block badge-underline badge-neutral mb-4">
                {type.badge}
              </span>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                {type.description}
              </p>
              <Link
                href={type.href}
                className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:text-primary-dim transition-colors"
              >
                {type.cta} →
              </Link>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Book Muay Thai training, private lessons, fighter program, or full camp stays at Ratchawat Koh Samui. Prices start at 400 THB for a drop-in class and 8,000 THB for a one-week all-inclusive camp stay at Plai Laem with cross-camp training access.
          </p>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build
```

Expected: 0 errors. Old BookingWidget reference gone.

- [ ] **Step 4: Commit**

```bash
git add src/app/booking/
git commit -m "feat(booking): rebuild /booking landing with 4 type cards, delete legacy BookingWidget"
```

---

### Task 20: Build /booking/training page and wizard

**Files:**
- Create: `src/app/booking/training/page.tsx`
- Create: `src/app/booking/training/TrainingWizard.tsx`

- [ ] **Step 1: Create the page shell**

Create `src/app/booking/training/page.tsx`:

```tsx
import { Suspense } from "react";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import TrainingWizard from "./TrainingWizard";

export const metadata = generatePageMeta({
  title: "Book Group Training | Ratchawat Muay Thai Koh Samui",
  description:
    "Book your Muay Thai group training at Ratchawat Koh Samui. Drop-in, weekly, or monthly packages. Bo Phut or Plai Laem camps.",
  path: "/booking/training",
});

export default function TrainingBookingPage() {
  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Book", href: "/booking" },
          { label: "Group Training" },
        ]}
      />

      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-on-surface uppercase">
            Book Group Training
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Pick a package, choose your camp, set a date, and confirm. Five quick steps.
          </p>
        </div>
      </section>

      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <Suspense
            fallback={
              <div className="h-96 bg-surface-lowest rounded-[var(--radius-card)] animate-pulse" />
            }
          >
            <TrainingWizard />
          </Suspense>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Create the TrainingWizard client component**

Create `src/app/booking/training/TrainingWizard.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import BookingWizard from "@/components/booking/BookingWizard";
import DatePicker from "@/components/booking/DatePicker";
import ContactInfoForm, {
  ContactInfo,
  isContactInfoValid,
} from "@/components/booking/ContactInfoForm";
import BookingReview from "@/components/booking/BookingReview";
import GlassCard from "@/components/ui/GlassCard";
import { MapPin } from "lucide-react";
import { getPricesByBookingType, getPriceById } from "@/content/pricing";

const STEPS = ["Package", "Camp", "Date", "Contact", "Review"];

const CAMPS = [
  {
    id: "bo-phut" as const,
    name: "Bo Phut",
    description: "Soi Sunday, near Fisherman's Village",
  },
  {
    id: "plai-laem" as const,
    name: "Plai Laem",
    description: "Plai Laem Soi 13, near Big Buddha",
  },
];

const DEFAULT_CONTACT: ContactInfo = {
  name: "",
  email: "",
  phone: "",
  nationality: "",
  numParticipants: 1,
  notes: "",
};

export default function TrainingWizard() {
  const searchParams = useSearchParams();
  const packages = getPricesByBookingType("training").filter(
    (p) => !p.id.startsWith("bodyweight-"),
  );

  const [step, setStep] = useState(0);
  const [priceId, setPriceId] = useState<string | null>(null);
  const [camp, setCamp] = useState<"bo-phut" | "plai-laem" | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pkg = searchParams.get("package");
    if (pkg && packages.some((p) => p.id === pkg)) {
      setPriceId(pkg);
      setStep(1);
    }
  }, [searchParams, packages]);

  const selectedPackage = priceId ? getPriceById(priceId) : null;

  const canProceed = () => {
    if (step === 0) return !!priceId;
    if (step === 1) return !!camp;
    if (step === 2) return !!date;
    if (step === 3) return isContactInfoValid(contact);
    if (step === 4) return isContactInfoValid(contact);
    return false;
  };

  const handleSubmit = async () => {
    if (!selectedPackage || !camp || !date) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price_id: selectedPackage.id,
          type: "training",
          camp,
          start_date: date.toISOString().split("T")[0],
          num_participants: 1,
          client_name: contact.name,
          client_email: contact.email,
          client_phone: contact.phone,
          client_nationality: contact.nationality || undefined,
          notes: contact.notes || undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Failed to start checkout");
      }
    } catch {
      setError("Network error. Please try again or contact us on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);

  return (
    <BookingWizard
      steps={STEPS}
      currentStep={step}
      onStepChange={setStep}
      canProceed={canProceed()}
      isFinalStep={step === 4}
      isSubmitting={isSubmitting}
      submitLabel={selectedPackage ? `Pay ${selectedPackage.price?.toLocaleString()} THB` : "Pay"}
      onSubmit={handleSubmit}
    >
      {/* Step 0: Package */}
      {step === 0 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Select a Package
          </h2>
          {packages.map((pkg) => (
            <button
              type="button"
              key={pkg.id}
              onClick={() => setPriceId(pkg.id)}
              className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                priceId === pkg.id
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-lowest hover:border-outline"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-serif text-base font-semibold text-on-surface">
                      {pkg.name}
                    </span>
                    {pkg.popular && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-on-surface-variant text-sm mt-0.5">
                    {pkg.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-serif text-lg font-bold text-primary">
                    {pkg.price?.toLocaleString()} THB
                  </span>
                  <p className="text-on-surface-variant text-xs">/ {pkg.unit}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 1: Camp */}
      {step === 1 && (
        <div className="space-y-3">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Choose Your Camp
          </h2>
          {CAMPS.map((c) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setCamp(c.id)}
              className={`w-full text-left rounded-[var(--radius-card)] p-4 sm:p-5 border-2 transition-all ${
                camp === c.id
                  ? "border-primary bg-primary/5"
                  : "border-outline-variant bg-surface-lowest hover:border-outline"
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin size={20} className={camp === c.id ? "text-primary" : "text-on-surface-variant"} aria-hidden="true" />
                <div>
                  <span className="font-serif text-base font-semibold text-on-surface">
                    {c.name}
                  </span>
                  <p className="text-on-surface-variant text-sm">{c.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Date */}
      {step === 2 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Pick a Start Date
          </h2>
          <DatePicker
            selected={date}
            onSelect={setDate}
            minDate={tomorrow}
            maxDate={maxDate}
            weekdaysDisabled={[0]}
          />
          <p className="text-on-surface-variant text-xs mt-3">
            Sundays are rest days. Classes run Monday through Saturday.
          </p>
        </div>
      )}

      {/* Step 3: Contact */}
      {step === 3 && (
        <div>
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Your Details
          </h2>
          <ContactInfoForm value={contact} onChange={setContact} />
        </div>
      )}

      {/* Step 4: Review */}
      {step === 4 && selectedPackage && camp && date && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-on-surface mb-4">
            Confirm & Pay
          </h2>
          <BookingReview
            rows={[
              { label: "Package", value: selectedPackage.name },
              { label: "Camp", value: CAMPS.find((c) => c.id === camp)!.name },
              {
                label: "Start date",
                value: date.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                }),
              },
              { label: "Contact", value: contact.email },
            ]}
            totalAmount={selectedPackage.price ?? 0}
          />
          {error && (
            <div className="bg-primary/10 border-2 border-primary/30 rounded-[var(--radius-card)] p-4">
              <p className="text-on-surface text-sm">{error}</p>
            </div>
          )}
        </div>
      )}
    </BookingWizard>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

Expected: 0 errors, new route `/booking/training` in build output.

- [ ] **Step 4: Commit**

```bash
git add src/app/booking/training/
git commit -m "feat(booking): add /booking/training page and wizard"
```

---

### Task 21: Build /booking/private page and wizard

**Files:**
- Create: `src/app/booking/private/page.tsx`
- Create: `src/app/booking/private/PrivateWizard.tsx`

- [ ] **Step 1: Create the page shell**

Create `src/app/booking/private/page.tsx` following the same pattern as `/booking/training/page.tsx` but with:
- Title: "Book Private Lessons | Ratchawat Muay Thai Koh Samui"
- Description: "Book one-on-one or small-group private Muay Thai lessons at Ratchawat Koh Samui. Adults and kids. Bo Phut or Plai Laem."
- Path: "/booking/private"
- H1: "Book Private Lessons"
- Subtitle: "Session type, camp, date and time, contact, review."
- Import and render `<PrivateWizard />` in Suspense

- [ ] **Step 2: Create the PrivateWizard client component**

Create `src/app/booking/private/PrivateWizard.tsx` mirroring TrainingWizard structure, but:

Steps: `["Session type", "Camp", "Date & Time", "Contact", "Review"]`

Step 0 (Session type): list `getPricesByBookingType("private")` as 4 cards. Each shows `name`, `price THB`, `unit` (per-person note for group cards).

Step 1 (Camp): same 2 camp cards as training.

Step 2 (Date & Time): render `<AvailabilityCalendar type="private" />` with `onAvailableSlotsChange` callback storing available slots in state. Below the calendar, when a date is picked, render a horizontal row of 4 time-slot buttons (09:00, 11:00, 14:00, 16:00). Disable any slot not in `availableSlots` (returned by the calendar). State holds `selectedTimeSlot: string | null`. `canProceed` for step 2 requires both a date AND a time slot.

Step 3 (Contact): pass `showParticipants` to `ContactInfoForm` if `selectedPackage.category === "private-adult"` and `nameShort` includes "Group", OR `category === "private-kids"` and `nameShort` includes "Group". Max 3 participants. Total = `pkg.price * numParticipants`.

Step 4 (Review): summary rows include session type, camp, date, time slot, num participants. Total amount multiplied by participants.

Submit payload:
```typescript
{
  price_id, type: "private", camp,
  start_date: date.toISOString().split("T")[0],
  time_slot: selectedTimeSlot,
  num_participants: contact.numParticipants,
  ...contact fields
}
```

Submit label: `Pay ${(pkg.price * numParticipants).toLocaleString()} THB`

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/booking/private/
git commit -m "feat(booking): add /booking/private page and wizard with availability and time slots"
```

---

### Task 22: Build /booking/fighter page and wizard

**Files:**
- Create: `src/app/booking/fighter/page.tsx`
- Create: `src/app/booking/fighter/FighterWizard.tsx`

- [ ] **Step 1: Create the page shell**

Create `src/app/booking/fighter/page.tsx` with:
- Title: "Apply to Fighter Program | Ratchawat Muay Thai Koh Samui"
- Description: "Apply for the intensive Fighter Program at Ratchawat Koh Samui. Train twice a day, prepare for competition. Accommodation options available."
- Path: "/booking/fighter"
- H1: "Apply to the Fighter Program"
- Subtitle: "Info, tier, camp and dates, contact, review."
- Import and render `<FighterWizard />` in Suspense

- [ ] **Step 2: Create the FighterWizard client component**

Create `src/app/booking/fighter/FighterWizard.tsx`:

Steps: `["Info", "Tier", "Camp & Date", "Contact", "Review"]`

Step 0 (Info): Read-only `GlassCard` explaining the Fighter Program (2x/day training, weekly stretch and yoga, weekly ice bath, fight organization, corner support, nutrition guidance). Single next button.

Step 1 (Tier): `getPricesByBookingType("fighter")` returns 3 entries (fighter-monthly, fighter-stay-room-monthly, fighter-stay-bungalow-monthly). Render 3 cards. Stay tiers show "Approximate price" badge with tooltip "Final price pending client confirmation". Bungalow card shows "Limited to 4 bungalows" badge.

Step 2 (Camp & Date): Conditional logic based on selected tier:
- If tier is `fighter-monthly` → render 2 camp cards + simple `DatePicker` (min tomorrow, max +90d, weekdaysDisabled: [0])
- If tier is `fighter-stay-*` → render a locked card showing "Plai Laem — Accommodation included" + `AvailabilityCalendar type="camp-stay"`

State: `camp` stores the chosen value. For stay tiers, auto-set `camp = "plai-laem"` on mount.

Step 3 (Contact): standard ContactInfoForm, no participants.

Step 4 (Review): summary rows: Tier, Camp, Start date, Contact. Total = pkg.price. Note when priceTodo exists: "This is an approximate price. The gym will confirm the final amount after booking."

Submit payload:
```typescript
{
  price_id, type: "fighter", camp,
  start_date: date.toISOString().split("T")[0],
  num_participants: 1,
  ...contact fields
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/booking/fighter/
git commit -m "feat(booking): add /booking/fighter page and wizard with 3 tiers and conditional camp lock"
```

---

### Task 23: Build /booking/camp-stay page and wizard

**Files:**
- Create: `src/app/booking/camp-stay/page.tsx`
- Create: `src/app/booking/camp-stay/CampStayWizard.tsx`

- [ ] **Step 1: Create the page shell**

Create `src/app/booking/camp-stay/page.tsx` with:
- Title: "Book Camp Stay | Ratchawat Muay Thai Koh Samui"
- Description: "All-inclusive Muay Thai training plus accommodation at Plai Laem. Rooms and bungalows. Train at both camps."
- Path: "/booking/camp-stay"
- H1: "Book Camp Stay"
- Subtitle: "Package, check-in date, contact, review."
- Import and render `<CampStayWizard />` in Suspense

- [ ] **Step 2: Create the CampStayWizard client component**

Create `src/app/booking/camp-stay/CampStayWizard.tsx`:

Steps: `["Package", "Check-in", "Contact", "Review"]`

Step 0 (Package): `getPricesByBookingType("camp-stay")` returns 4 entries. Render as 2×2 grid. Bungalow card shows "Limited to 4" badge. Each card mentions "Stay Plai Laem, train either camp".

Step 1 (Check-in): Render `<AvailabilityCalendar type="camp-stay" />`. On date pick, compute `end_date = start_date + (package duration in days)`. Durations: 1w = 7 days, 2w = 14 days, 1m = 30 days. Show "Check-out: {end_date formatted}" below the calendar.

Step 2 (Contact): standard ContactInfoForm.

Step 3 (Review): summary rows: Package, Check-in, Check-out, Access ("Stay Plai Laem, train any camp"), Contact. Total = pkg.price.

Submit payload:
```typescript
{
  price_id, type: "camp-stay", camp: "both",
  start_date, end_date,
  num_participants: 1,
  ...contact fields
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/app/booking/camp-stay/
git commit -m "feat(booking): add /booking/camp-stay page and wizard with 4 packages and auto-computed end date"
```

---

### Task 24: Rewrite /booking/confirmed as server component

**Files:**
- Modify: `src/app/booking/confirmed/page.tsx`

- [ ] **Step 1: Replace the full file**

Replace the contents of `src/app/booking/confirmed/page.tsx` with:

```tsx
import Link from "next/link";
import Stripe from "stripe";
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPriceById } from "@/content/pricing";
import { CheckCircle, Mail, MapPin, Clock } from "lucide-react";

export const metadata = generatePageMeta({
  title: "Booking Confirmed | Ratchawat Muay Thai Koh Samui",
  description:
    "Your Muay Thai training at Ratchawat Koh Samui is booked. Check your email for confirmation details.",
  path: "/booking/confirmed",
  noIndex: true,
});

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

interface BookingSummary {
  id: string;
  packageName: string;
  startDate: string;
  endDate: string | null;
  timeSlot: string | null;
  camp: string | null;
  amount: number;
  clientName: string;
}

async function resolveBooking(sessionId: string): Promise<BookingSummary | null> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-12-18.acacia",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const bookingId = session.metadata?.booking_id;
    if (!bookingId) return null;

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (error || !data) return null;

    const pkg = getPriceById(data.price_id);
    return {
      id: data.id,
      packageName: pkg?.name ?? data.price_id,
      startDate: data.start_date,
      endDate: data.end_date,
      timeSlot: data.time_slot,
      camp: data.camp,
      amount: data.price_amount,
      clientName: data.client_name,
    };
  } catch (err) {
    console.error("Failed to resolve booking:", err);
    return null;
  }
}

const CAMP_LABEL: Record<string, string> = {
  "bo-phut": "Bo Phut",
  "plai-laem": "Plai Laem",
  both: "Plai Laem stay, both camps for training",
};

export default async function BookingConfirmedPage({ searchParams }: Props) {
  const params = await searchParams;
  const booking = params.session_id ? await resolveBooking(params.session_id) : null;

  return (
    <>
      <JsonLd data={[organizationSchema()]} />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Book", href: "/booking" },
          { label: "Confirmed" },
        ]}
      />

      <section className="py-16 sm:py-24 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle size={64} className="text-primary mx-auto mb-6" aria-hidden="true" />
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-on-surface uppercase">
            Booking Confirmed
          </h1>
          {booking ? (
            <p className="mt-4 text-on-surface-variant text-lg">
              Thanks {booking.clientName}. Your booking is locked in and your
              confirmation email is on its way.
            </p>
          ) : (
            <p className="mt-4 text-on-surface-variant text-lg">
              You are all set. Check your email for confirmation details.
            </p>
          )}
        </div>
      </section>

      {booking && (
        <section className="pb-12 px-6 sm:px-10 md:px-16 lg:px-20">
          <div className="max-w-2xl mx-auto">
            <GlassCard hover={false}>
              <h2 className="font-serif text-lg font-bold text-on-surface mb-4 uppercase">
                Your Booking
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Package</span>
                  <span className="text-on-surface font-medium text-right">{booking.packageName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-on-surface-variant">Start date</span>
                  <span className="text-on-surface font-medium">{booking.startDate}</span>
                </div>
                {booking.endDate && (
                  <div className="flex justify-between gap-4">
                    <span className="text-on-surface-variant">End date</span>
                    <span className="text-on-surface font-medium">{booking.endDate}</span>
                  </div>
                )}
                {booking.timeSlot && (
                  <div className="flex justify-between gap-4">
                    <span className="text-on-surface-variant">Time</span>
                    <span className="text-on-surface font-medium">{booking.timeSlot}</span>
                  </div>
                )}
                {booking.camp && (
                  <div className="flex justify-between gap-4">
                    <span className="text-on-surface-variant">Location</span>
                    <span className="text-on-surface font-medium">{CAMP_LABEL[booking.camp]}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-outline-variant">
                  <span className="text-on-surface font-semibold">Total paid</span>
                  <span className="font-serif text-xl font-bold text-primary">
                    {booking.amount.toLocaleString()} THB
                  </span>
                </div>
                <p className="text-on-surface-variant text-xs pt-2">
                  Booking ID: {booking.id}
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      )}

      <section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="font-serif text-xl font-bold text-on-surface mb-4">
            What Happens Next
          </h2>
          <GlassCard hover={false}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Check your email</p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Your confirmation email has full details and directions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Find the gym</p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    <Link href="/camps/bo-phut" className="btn-link">Bo Phut</Link>
                    {" or "}
                    <Link href="/camps/plai-laem" className="btn-link">Plai Laem</Link>
                    {" "}— maps and directions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-on-surface font-medium text-sm">Arrive 10 minutes early</p>
                  <p className="text-on-surface-variant text-xs leading-relaxed">
                    Bring shorts and a t-shirt. Gloves and shin guards are provided.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/programs" className="btn-primary text-center text-sm">
              Browse Programs
            </Link>
            <Link
              href="/"
              className="text-center text-sm text-on-surface-variant font-medium hover:text-on-surface transition-colors border-2 border-outline-variant rounded-lg px-6 py-3"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/app/booking/confirmed/page.tsx
git commit -m "feat(booking): rewrite /booking/confirmed as server component with Supabase booking lookup"
```

---

## Section 6 — Setup execution, integration testing, documentation

### Task 25: [MANUAL] Create Supabase project, Stripe keys, Resend key, run migrations, seed Stripe

**This task is executed by RD manually following step-by-step instructions. Nothing to commit here — the outputs are `.env.local` (not committed) and the updated `pricing.ts` with Stripe IDs (committed in Step 8).**

- [ ] **Step 1: Create Supabase project**

1. Go to `https://app.supabase.com`
2. Click "New project"
3. Name: `ratchawat-mt`
4. Database password: generate and save securely
5. Region: `Southeast Asia (Singapore)`
6. Wait ~2 minutes for provisioning

- [ ] **Step 2: Copy Supabase keys to .env.local**

1. Supabase dashboard → Settings → API
2. Copy `Project URL` → paste as `NEXT_PUBLIC_SUPABASE_URL`
3. Copy `anon public` key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy `service_role` key → paste as `SUPABASE_SERVICE_ROLE_KEY`

Create `.env.local` at the project root by copying `.env.example` and filling in the values.

- [ ] **Step 3: Run Supabase migration**

1. Supabase dashboard → SQL Editor → New query
2. Open `supabase/migrations/20260411000000_init.sql` in your editor and copy the whole file
3. Paste into Supabase SQL Editor, click Run
4. Verify: Table Editor → `bookings` and `availability_blocks` both visible with correct columns

- [ ] **Step 4: Copy Stripe TEST keys from client dashboard**

1. Login to the client's Stripe dashboard
2. Top-right toggle → switch to **TEST mode** (should show "Viewing test data")
3. Developers → API keys
4. Copy `Publishable key` (pk_test_...) → paste as `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in `.env.local`
5. Reveal + copy `Secret key` (sk_test_...) → paste as `STRIPE_SECRET_KEY` in `.env.local`

- [ ] **Step 5: Run Stripe seed script**

```bash
npm run stripe:seed
```

Expected output:
```
Seeding 22 Stripe products...
  → drop-in-adult (400 THB)
  → weekly-1x (2000 THB)
  ...
Done. Updated src/content/pricing.ts with Stripe IDs.
```

- [ ] **Step 6: Install Stripe CLI and start webhook listener**

1. Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (macOS)
2. Login: `stripe login` (follow browser auth)
3. In a **separate terminal** (leave running):
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Copy the `whsec_...` value from the output → paste as `STRIPE_WEBHOOK_SECRET` in `.env.local`
5. Keep this terminal running during dev

- [ ] **Step 7: Create Resend API key**

1. Go to `https://resend.com` → API Keys
2. Create API Key, name it "ratchawat-dev", full access
3. Copy the `re_...` key → paste as `RESEND_API_KEY` in `.env.local`

- [ ] **Step 8: Commit updated pricing.ts (with Stripe IDs)**

```bash
git add src/content/pricing.ts
git commit -m "feat(stripe): seed 22 test products and link IDs in pricing.ts"
```

- [ ] **Step 9: Seed a test availability block**

1. Supabase dashboard → SQL Editor → new query:
```sql
insert into availability_blocks (type, date, reason)
values
  ('camp-stay', '2026-04-20', 'Test block - already booked'),
  ('private', '2026-04-18', 'Test block - trainer off');
```

Run. Verify row count = 2 in Table Editor.

---

### Task 26: End-to-end smoke test of all 4 flows

**Files:** None modified. This is a verification task.

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

Ensure `stripe listen` is still running in the other terminal.

- [ ] **Step 2: Test /booking/training flow**

1. Open `http://localhost:3000/booking/training?package=monthly-1x`
2. Package step should be pre-selected. Click Continue.
3. Pick camp Bo Phut. Continue.
4. Pick a weekday in the next 7 days. Continue.
5. Fill contact: name "Test User", email your own, phone "+66 12 345 67", notes "smoke test".
6. Continue to Review. Click Pay.
7. Stripe Checkout opens. Use card `4242 4242 4242 4242`, any future expiry, any CVC, any ZIP.
8. Complete payment. Redirected to `/booking/confirmed?session_id=...`
9. Verify booking summary shows Package, camp Bo Phut, date, total 5500 THB, booking ID.
10. Check Supabase: `select * from bookings order by created_at desc limit 1;` → status='confirmed', stripe_session_id populated.
11. Check email inbox for "Your booking at Ratchawat Muay Thai is confirmed".
12. Check `stripe listen` terminal for `[200] POST /api/webhooks/stripe`.

- [ ] **Step 3: Test /booking/private flow**

1. Open `http://localhost:3000/booking/private`
2. Pick "Private 1-on-1 (Adult)". Continue.
3. Pick Plai Laem. Continue.
4. Pick 2026-04-18 — should be disabled (blocked). Pick 2026-04-19 instead. Select time slot 14:00. Continue.
5. Fill contact. Continue. Pay with Stripe test card.
6. Verify confirmed page. Verify booking in Supabase with time_slot='14:00'.

- [ ] **Step 4: Test /booking/fighter flow**

1. Open `http://localhost:3000/booking/fighter`
2. Continue past Info screen.
3. Pick "Fighter + Standard Room". Continue.
4. Should auto-lock to Plai Laem. Pick a check-in date. Continue.
5. Fill contact. Continue. Pay.
6. Verify confirmed page shows camp = "Plai Laem".

- [ ] **Step 5: Test /booking/camp-stay flow**

1. Open `http://localhost:3000/booking/camp-stay`
2. Pick "1 Week". Continue.
3. Verify 2026-04-20 is blocked (greyed out). Pick 2026-04-21. Confirm check-out = 2026-04-28. Continue.
4. Fill contact. Continue. Pay.
5. Verify confirmed page shows "Plai Laem stay, both camps for training".
6. Verify Supabase booking has camp='both' and end_date=2026-04-28.

- [ ] **Step 6: Test landing page at 375px**

1. Open `http://localhost:3000/booking`
2. DevTools → device toolbar → 375px width
3. 4 cards stack vertically, readable, CTAs tappable.

- [ ] **Step 7: Lint and build**

```bash
npm run lint
npm run build
```

Expected: 0 errors both.

- [ ] **Step 8: If any flow failed**

Create a fix sub-task. Re-run the failing flow until green. Do not proceed to Task 27 with known failures.

---

### Task 27: Update PROJET-STATUS.md and commit phase close

**Files:**
- Modify: `PROJET-STATUS.md`

- [ ] **Step 1: Update PROJET-STATUS.md**

Find the "Known issues" / "Correction history" section and add an entry dated today:

```markdown
### 2026-04-11 — Phase 3 Booking System Full Stack complete

- Rebuilt /booking landing with 4 type cards (training, private, fighter, camp-stay)
- Deleted legacy flat BookingWidget
- Built 5-step training wizard with pre-select via ?package=
- Built 5-step private wizard with Supabase-backed availability and time slots
- Built 5-step fighter wizard with 3 tiers and conditional camp lock for stay tiers
- Built 4-step camp-stay wizard with auto-computed end date and cross-camp access
- Rewrote /booking/confirmed as Server Component reading Supabase via service_role
- Added BookingWizard, DatePicker, AvailabilityCalendar, ContactInfoForm, BookingReview shared components
- Supabase schema live (bookings + availability_blocks + RLS)
- Stripe 22 products seeded in client TEST account, linked in pricing.ts
- Resend emails sending to client and admin on checkout.session.completed
- Merged old Phase 3+4 ROADMAP entries into new Phase 3, renumbered phases 4-6
- ARCHITECTURE.md patched with 7 corrections (accommodation drop, Fighter tiers, camp='both', schema fields, confirmed page pattern, priceTodo Stripe note)
- Fighter+Room and Fighter+Bungalow Stripe products created with approximate prices; pending client confirmation
```

- [ ] **Step 2: Update current phase**

If there's a "Current phase" line, update to `Phase 4 — Admin Dashboard`.

- [ ] **Step 3: Commit and close phase**

```bash
git add PROJET-STATUS.md
git commit -m "docs(phase-3): close Phase 3 Booking System Full Stack — all 4 flows live end-to-end"
```

- [ ] **Step 4: Final verification**

```bash
npm run lint
npm run build
git log --oneline -20
```

Phase 3 closed.

---

## Success criteria recap

- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` passes (0 errors)
- [ ] Supabase project live with both tables, RLS, and test availability blocks
- [ ] Stripe has 22 products in TEST mode, IDs in pricing.ts
- [ ] Resend sends both client and admin emails successfully
- [ ] /booking/training end-to-end flow completes and booking is confirmed in Supabase
- [ ] /booking/private end-to-end flow with time slot selection and a blocked date visible
- [ ] /booking/fighter end-to-end flow across all 3 tiers, with conditional camp lock
- [ ] /booking/camp-stay end-to-end flow with auto-computed end date and camp='both'
- [ ] /booking/confirmed resolves booking via session_id and Stripe
- [ ] ARCHITECTURE.md contains all 7 corrections
- [ ] ROADMAP.md renumbered (Phase 4 = Admin, Phase 5 = Security, Phase 6 = Go-live)
- [ ] PROJET-STATUS.md has Phase 3 correction history entry
- [ ] All commits pushed to main

---

## Task count: 27 tasks across 6 sections

- **Section 1:** 3 tasks (documentation sync)
- **Section 2:** 2 tasks (deps + env)
- **Section 3:** 8 tasks (backend primitives)
- **Section 4:** 5 tasks (shared components)
- **Section 5:** 6 tasks (booking pages)
- **Section 6:** 3 tasks (manual setup + smoke test + phase close)

Manual step count: 1 (Task 25 — RD setup of Supabase, Stripe keys, Resend, Stripe seed run, test availability block)
