# Phase 1 — Content & Pricing Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all maquette/placeholder prices with real client prices, create a centralized price catalog, and set up the production project documentation (ROADMAP.md, ARCHITECTURE.md).

**Architecture:** A single `src/content/pricing.ts` file is the source of truth for all prices. Pages import from it. The file mirrors the future Supabase table structure, making backend migration trivial. Documentation files (ROADMAP.md, ARCHITECTURE.md) establish the project management system for all future agents.

**Tech Stack:** Next.js 15 App Router, TypeScript 5, Tailwind CSS v4. No new dependencies.

---

## Task 1: Create ROADMAP.md

**Files:**
- Create: `ROADMAP.md`

- [ ] **Step 1: Create the file**

```markdown
# Ratchawat Muay Thai — Roadmap

> **Source of truth for what to build.** Read this at the start of every session alongside PROJET-STATUS.md.
> Update task statuses as work progresses. Never start work without checking the current phase.

**Last updated:** 2026-04-11
**Current phase:** Phase 1 — Content & Pricing Foundation

---

## Phase 1 — Content & Pricing Foundation

**Status:** IN PROGRESS
**Goal:** Real prices on every page. Centralized price catalog. Production documentation in place.
**Blocker:** None.
**Spec:** `docs/superpowers/specs/2026-04-11-production-phase-design.md`
**Plan:** `docs/superpowers/plans/2026-04-11-phase-1-content-pricing.md`

### Tasks

- [x] Write spec + plan (2026-04-11)
- [ ] Create `src/content/pricing.ts` — centralized price catalog
- [ ] Create `ROADMAP.md` (this file)
- [ ] Create `ARCHITECTURE.md`
- [ ] Update `PROJET-STATUS.md` — production mode, real prices
- [ ] Update `CLAUDE.md` — add /nextjs-security-scan, reference ROADMAP
- [ ] Update `/pricing` page — complete price restructure (real prices + new sections)
- [ ] Update `/programs/group-adults` — drop-in 400 THB, pricing links
- [ ] Update `/programs/group-kids` — drop-in 300 THB, monthly 2500 THB
- [ ] Update `/programs/private` — 800 THB solo, 600 THB group
- [ ] Update `/programs/fighter` — 9500 THB, real includes
- [ ] Update `/accommodation` — add Camp Stay packages section (Plai Laem)
- [ ] Update `/` homepage — drop-in 400 THB
- [ ] `npm run lint` — 0 errors
- [ ] `npm run build` — 0 errors
- [ ] Commit

### Success criteria

`npm run build` passes. Every price shown on site matches `src/content/pricing.ts`. No "500 THB" reference remains.

---

## Phase 2 — Booking System UI

**Status:** PENDING
**Goal:** All 5 booking flows navigable. Training flow connected to Stripe (no availability needed). Other flows show correct UI with static placeholders for availability.
**Blocker:** Phase 1 complete.
**Spec:** `docs/superpowers/specs/2026-04-11-production-phase-design.md` § 3

### Routes to build

- [ ] `/booking` — landing with 3 type-selection cards
- [ ] `/booking/training` — 5-step wizard (package, camp, date, contact, payment)
- [ ] `/booking/private` — wizard with static availability slots
- [ ] `/booking/accommodation` — wizard with static calendar
- [ ] `/booking/camp-stay` — wizard with static calendar + packages
- [ ] `/booking/fighter` — wizard with accommodation option
- [ ] `/booking/confirmed` — post-payment confirmation

### Components to build

- [ ] `BookingWizard` — shell with step indicator + navigation
- [ ] `DatePicker` — simple (no availability check)
- [ ] `AvailabilityCalendar` — static for now, wired to Supabase in Phase 3
- [ ] `ContactInfoForm` — name, email, phone, nationality
- [ ] `BookingReview` — summary before Stripe redirect

### Success criteria

All routes accessible. Training flow completes through Stripe Checkout. `npm run build` passes.

---

## Phase 3 — Backend Integration

**Status:** PENDING
**Goal:** Supabase + Stripe + Resend fully operational. All booking flows live with real availability.
**Blocker:** New Supabase account ready (client GitHub account required).

### Tasks

- [ ] Create Supabase project (client account)
- [ ] Run migration: `bookings` table
- [ ] Run migration: `availability_blocks` table
- [ ] Configure RLS policies (see ARCHITECTURE.md)
- [ ] Create Stripe products + prices for all `PriceItem.id` values
- [ ] Wire Stripe webhook (`/api/webhooks/stripe`)
- [ ] Configure Resend (domain verification)
- [ ] Build email templates (booking confirmed, admin notification)
- [ ] Wire `AvailabilityCalendar` to Supabase
- [ ] Wire all booking flows to Supabase + Stripe
- [ ] Set `.env.local` with all real keys
- [ ] End-to-end test all 5 booking flows

### External blockers

| Action | Owner |
|--------|-------|
| Create GitHub account for client | RD |
| Create Supabase account with client GitHub | RD |
| Get Stripe account access from client | RD |
| DNS access for Resend domain verification | RD (after domain transfer) |

### Success criteria

Full booking + payment + email confirmation works for all 5 flows.

---

## Phase 4 — Admin Dashboard

**Status:** PENDING
**Goal:** Gym owner can manage bookings and availability from `/admin`.
**Blocker:** Phase 3 complete.

### Tasks

- [ ] Build `/admin/login` — Supabase Auth
- [ ] Build `/admin/bookings` — paginated table, filters by type/status/date
- [ ] Build `/admin/bookings/[id]` — detail view + status update
- [ ] Build `/admin/availability` — calendar view, block/unblock dates + private slots
- [ ] Protect all `/admin/*` via middleware

### Success criteria

Admin logs in, views all bookings, updates availability. No unauthenticated access possible.

---

## Phase 5 — Security & Quality

**Status:** PENDING
**Goal:** Production-ready. Lighthouse targets met. Zero critical vulnerabilities.
**Blocker:** Phase 4 complete.

### Tasks

- [ ] Run `/nextjs-security-scan` — fix all critical + high findings
- [ ] Add rate limiting to `/api/*` routes
- [ ] Configure CORS
- [ ] Add Zod validation to all API routes
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100
- [ ] Audit all pages vs AUDIT-SEO.md (schemas, GEO, internal links)
- [ ] Update `llms.txt` + `llms-full.txt` with booking system info
- [ ] Confirm fighter + accommodation price (replace TODO)
- [ ] Photos: replace all `ImagePlaceholder` with real images (pending client)

### Success criteria

Security scan: 0 critical, 0 high findings. All Lighthouse targets met.

---

## Phase 6 — Go-live

**Status:** PENDING
**Goal:** Site live at ratchawatmuaythai.com.
**Blocker:** Domain transfer confirmed + Phase 5 complete.

### Tasks

- [ ] Analyze Bluehost domain situation
- [ ] Transfer domain or update nameservers
- [ ] Deploy to Vercel (production)
- [ ] Set all environment variables in Vercel
- [ ] Add 301 redirections in `next.config.js`
- [ ] Verify Google Search Console
- [ ] Configure Google Analytics (migrate G-SVH7KPWM2S or create new)
- [ ] Update 2 Google Business Profile fiches with new URLs
- [ ] Smoke test all booking flows on production
- [ ] Monitor for 48h post-launch

### Success criteria

Site accessible at ratchawatmuaythai.com. All booking flows confirmed working in production.
```

- [ ] **Step 2: Verify file created**

Run: `ls ROADMAP.md`
Expected: file exists, no error.

---

## Task 2: Create ARCHITECTURE.md

**Files:**
- Create: `ARCHITECTURE.md`

- [ ] **Step 1: Create the file**

```markdown
# Ratchawat Muay Thai — Architecture

> **Technical reference.** Read this before writing any backend code, touching integrations, or designing new booking flows.
> This file documents decisions that are fixed. If you need to change something here, discuss with RD first.

**Last updated:** 2026-04-11

---

## 1. Price Catalog

**File:** `src/content/pricing.ts`
**Pattern:** Static TypeScript data. Import `PRICES` array and filter by `id`, `category`, or `bookingType`.
**Migration path:** When Supabase is ready, replace the import with a `supabase.from('prices').select()` call. The shape is identical.

```typescript
import { PRICES } from "@/content/pricing"
const dropIn = PRICES.find(p => p.id === "drop-in-adult")
const groupPrices = PRICES.filter(p => p.category === "group")
```

---

## 2. Booking System Routes

```
/booking                     Landing — type selection (training / private / accommodation / camp-stay / fighter)
/booking/training            Group classes wizard
/booking/private             Private lessons wizard (availability calendar)
/booking/accommodation       Accommodation wizard (availability calendar, Plai Laem only)
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

### Accommodation (Plai Laem only)
1. Package — 1 week / 2 weeks / 1 month
2. Dates — AvailabilityCalendar (reads availability_blocks, type='accommodation')
3. Contact info
4. Review + Stripe Checkout

### Camp Stay (MT + Accommodation)
1. Package — 1 week / 2 weeks / 1 month
2. Dates — AvailabilityCalendar (same as accommodation)
3. Contact info
4. Review + Stripe Checkout

### Fighter Program
1. Info screen (what is included)
2. Start date — free date picker
3. Accommodation add-on — yes/no (if yes: TODO price with WhatsApp fallback until confirmed)
4. Contact info
5. Review + Stripe Checkout

---

## 4. Calendar Components

**DatePicker** — used for training start date, fighter start date. Simple HTML date input or lightweight component. No Supabase.

**AvailabilityCalendar** — used for private, accommodation, camp-stay. Fetches `availability_blocks` from Supabase. Blocked dates = greyed out, unselectable. Admin creates blocks via `/admin/availability`.

---

## 5. Supabase Data Model

### Table: bookings

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('training','private','accommodation','camp-stay','fighter')),
  status text not null default 'pending'
    check (status in ('pending','confirmed','cancelled','completed')),
  price_id text not null,
  price_amount integer not null,
  start_date date not null,
  end_date date,
  camp text check (camp in ('bo-phut','plai-laem')),
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

### Table: availability_blocks

```sql
create table availability_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('private','accommodation','all')),
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

---

## 6. Stripe Integration

### Flow
1. Client completes wizard → POST `/api/checkout` with `{ price_id, booking_data }`
2. API creates pending booking in Supabase
3. API creates Stripe Checkout Session (`success_url=/booking/confirmed?booking_id=X`)
4. Client redirected to Stripe
5. Stripe webhook `checkout.session.completed` → update booking to `confirmed` → send emails

### Products
One Stripe Product per `PriceItem.id`. Store `stripeProductId` and `stripePriceId` in `pricing.ts` once created.

---

## 7. Resend Email Flows

**Booking confirmed (client):** Booking summary, dates, camp address, what to bring, WhatsApp contact.
**Booking notification (admin):** New booking alert with full client + booking details.
Templates live in `src/lib/email/`.

---

## 8. Admin Dashboard

```
/admin               → redirect to /admin/bookings
/admin/login         → Supabase Auth (email + password)
/admin/bookings      → table, filters by type/status/date range
/admin/bookings/[id] → detail view + status update
/admin/availability  → calendar, block/unblock dates and time slots
```

All `/admin/*` routes protected by middleware: unauthenticated request → redirect to `/admin/login`.

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
```

- [ ] **Step 2: Verify file created**

Run: `ls ARCHITECTURE.md`
Expected: file exists, no error.

---

## Task 3: Update PROJET-STATUS.md and CLAUDE.md

**Files:**
- Modify: `PROJET-STATUS.md` — update last updated date, prices in overview, add correction history entry, add production phase note
- Modify: `CLAUDE.md` — update first action instruction, add ROADMAP.md reference, add /nextjs-security-scan to skills table

- [ ] **Step 1: Update PROJET-STATUS.md header and overview section**

Replace the current header block (lines 1-8 area) and the business info drop-in price:

Old:
```markdown
**Last updated:** 2026-04-02
**Current commit:** component-elegance-redesign
```

New:
```markdown
**Last updated:** 2026-04-11
**Phase:** Phase 1 — Content & Pricing Foundation (IN PROGRESS)
**Project status:** Production refonte accepted by client. Maquette phase complete. Building toward full deployment.
```

Replace in the business info section:
```markdown
- Drop-in: 500 THB (~$15 USD) | Monthly: 5,500 THB (~$167 USD)
```
with:
```markdown
- Drop-in (adult): 400 THB | Monthly (1x/day): 5,500 THB | Monthly (2x/day): 7,000 THB
- Drop-in (kids 8-13): 300 THB | Monthly kids unlimited: 2,500 THB
- Private 1-on-1: 800 THB | Private group (2-3): 600 THB/person
- Fighter Program: 9,500 THB/month
- Camp Stay (Plai Laem): 8,000 THB/week — 15,000 THB/2 weeks — 18,000 THB/month
```

- [ ] **Step 2: Add correction history entry**

In section 4 (Correction History), add at the end:
```markdown
| 2026-04-11 | Production phase begins. Client accepted project. Created ROADMAP.md, ARCHITECTURE.md, spec + plan. Updated PROJET-STATUS.md, CLAUDE.md. Created src/content/pricing.ts with all real prices. Updated all pages with correct prices. |
```

- [ ] **Step 3: Update CLAUDE.md — first action and ROADMAP reference**

Replace:
```markdown
> **First action in every session:** read `PROJET-STATUS.md` at project root to know exactly where the project stands.
```
With:
```markdown
> **First actions in every session:**
> 1. Read `PROJET-STATUS.md` — state of the codebase
> 2. Read `ROADMAP.md` — current phase and tasks to do next
> 3. Read `ARCHITECTURE.md` — before any backend or integration work
```

- [ ] **Step 4: Add /nextjs-security-scan to CLAUDE.md skills table**

In the "Required skills" table (Workflow section), add a new row:
```markdown
| `/nextjs-security-scan` | Security audit — run before any deployment, after Phase 4 complete |
```

---

## Task 4: Create src/content/pricing.ts

**Files:**
- Create: `src/content/pricing.ts`

- [ ] **Step 1: Create the file with complete content**

```typescript
export type BookingType =
  | "training"
  | "private"
  | "accommodation"
  | "camp-stay"
  | "fighter";

export type PriceCategory =
  | "group"
  | "kids"
  | "resident"
  | "private-adult"
  | "private-kids"
  | "bodyweight"
  | "fighter"
  | "accommodation"
  | "camp-stay";

export interface PriceItem {
  id: string;
  name: string;
  nameShort: string;
  category: PriceCategory;
  price: number | null;
  priceTodo?: string;
  currency: "THB";
  unit: string;
  description: string;
  includes: string[];
  notes?: string;
  popular?: boolean;
  bookingType: BookingType;
  stripeProductId?: string;
  stripePriceId?: string;
}

export const PRICES: PriceItem[] = [
  // --- GROUP TRAINING (ADULT) ---
  {
    id: "drop-in-adult",
    name: "Drop-in Session (Adult)",
    nameShort: "Drop-in",
    category: "group",
    price: 400,
    currency: "THB",
    unit: "session",
    description: "Single group Muay Thai class. Morning or afternoon. No commitment.",
    includes: [
      "1 group class (morning or afternoon)",
      "All equipment provided",
      "Access to Bo Phut or Plai Laem",
    ],
    bookingType: "training",
  },
  {
    id: "weekly-1x",
    name: "1 Week — 1 Session/Day",
    nameShort: "1 Week (1x/day)",
    category: "group",
    price: 2000,
    currency: "THB",
    unit: "week",
    description: "One week of training, one session per day (5 days).",
    includes: [
      "5 group sessions",
      "Morning or afternoon choice",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },
  {
    id: "weekly-2x",
    name: "1 Week — 2 Sessions/Day",
    nameShort: "1 Week (2x/day)",
    category: "group",
    price: 3000,
    currency: "THB",
    unit: "week",
    description: "One week of training, morning and afternoon every day.",
    includes: [
      "10 group sessions",
      "Morning + afternoon",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },
  {
    id: "biweekly-1x",
    name: "2 Weeks — 1 Session/Day",
    nameShort: "2 Weeks (1x/day)",
    category: "group",
    price: 3500,
    currency: "THB",
    unit: "2 weeks",
    description: "Two weeks of training, one session per day.",
    includes: [
      "10 group sessions",
      "Morning or afternoon choice",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },
  {
    id: "biweekly-2x",
    name: "2 Weeks — 2 Sessions/Day",
    nameShort: "2 Weeks (2x/day)",
    category: "group",
    price: 5500,
    currency: "THB",
    unit: "2 weeks",
    description: "Two weeks of training, morning and afternoon every day.",
    includes: [
      "20 group sessions",
      "Morning + afternoon",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },
  {
    id: "monthly-1x",
    name: "Monthly — 1 Session/Day",
    nameShort: "Monthly (1x/day)",
    category: "group",
    price: 5500,
    currency: "THB",
    unit: "month",
    description: "One month of training, one session per day. Best value for regular training.",
    includes: [
      "Unlimited 1x/day group sessions",
      "Morning or afternoon choice",
      "All equipment provided",
      "Both locations",
    ],
    popular: true,
    bookingType: "training",
  },
  {
    id: "monthly-2x",
    name: "Monthly — 2 Sessions/Day",
    nameShort: "Monthly (2x/day)",
    category: "group",
    price: 7000,
    currency: "THB",
    unit: "month",
    description: "One month of training, morning and afternoon every day. Maximum progress.",
    includes: [
      "Unlimited 2x/day group sessions",
      "Morning + afternoon",
      "All equipment provided",
      "Both locations",
    ],
    bookingType: "training",
  },

  // --- GROUP TRAINING (KIDS 8-13) ---
  {
    id: "drop-in-kids",
    name: "Drop-in Session (Kids 8-13)",
    nameShort: "Kids Drop-in",
    category: "kids",
    price: 300,
    currency: "THB",
    unit: "session",
    description: "Single kids Muay Thai class. Ages 8-13.",
    includes: [
      "1 kids group class",
      "All equipment provided",
      "Dedicated kids trainer",
    ],
    bookingType: "training",
  },
  {
    id: "monthly-kids",
    name: "Monthly Unlimited (Kids 8-13)",
    nameShort: "Kids Monthly",
    category: "kids",
    price: 2500,
    currency: "THB",
    unit: "month",
    description: "Unlimited kids group sessions for one month. Ages 8-13.",
    includes: [
      "Unlimited kids group sessions",
      "All equipment provided",
      "Progress tracking",
    ],
    popular: true,
    bookingType: "training",
  },

  // --- RESIDENT (KOH SAMUI) ---
  {
    id: "resident-10",
    name: "Resident 10 Classes",
    nameShort: "Resident 10x",
    category: "resident",
    price: 3000,
    currency: "THB",
    unit: "10 classes",
    description: "For Koh Samui residents. 10-class punch card, no expiry.",
    includes: [
      "10 group sessions",
      "Both locations",
      "All equipment provided",
    ],
    notes: "Proof of Koh Samui residency required.",
    bookingType: "training",
  },
  {
    id: "resident-20",
    name: "Resident 20 Classes",
    nameShort: "Resident 20x",
    category: "resident",
    price: 5500,
    currency: "THB",
    unit: "20 classes",
    description: "For Koh Samui residents. 20-class punch card, no expiry. Best resident value.",
    includes: [
      "20 group sessions",
      "Both locations",
      "All equipment provided",
    ],
    notes: "Proof of Koh Samui residency required.",
    popular: true,
    bookingType: "training",
  },

  // --- PRIVATE LESSONS (ADULT) ---
  {
    id: "private-adult-solo",
    name: "Private Lesson 1-on-1 (Adult)",
    nameShort: "Private 1-on-1",
    category: "private-adult",
    price: 800,
    currency: "THB",
    unit: "session",
    description: "60-minute private session with a dedicated trainer. Fully personalized.",
    includes: [
      "60 minutes 1-on-1",
      "Tailored to your level and goals",
      "All equipment provided",
    ],
    bookingType: "private",
  },
  {
    id: "private-adult-group",
    name: "Private Group 2-3 (Adult)",
    nameShort: "Private Group",
    category: "private-adult",
    price: 600,
    currency: "THB",
    unit: "person/session",
    description: "Private session for 2-3 people with one trainer. Price per person.",
    includes: [
      "60 minutes with 1 trainer",
      "For 2-3 participants",
      "All equipment provided",
    ],
    notes: "Price per person. Minimum 2 participants.",
    bookingType: "private",
  },

  // --- PRIVATE LESSONS (KIDS) ---
  {
    id: "private-kids-solo",
    name: "Private Lesson 1-on-1 (Kids)",
    nameShort: "Private Kids 1-on-1",
    category: "private-kids",
    price: 600,
    currency: "THB",
    unit: "session",
    description: "60-minute private kids session. Ages 8-13. Focused individual attention.",
    includes: [
      "60 minutes 1-on-1",
      "Kids-specific training",
      "All equipment provided",
    ],
    bookingType: "private",
  },
  {
    id: "private-kids-group",
    name: "Private Group 2-3 (Kids)",
    nameShort: "Private Kids Group",
    category: "private-kids",
    price: 400,
    currency: "THB",
    unit: "kid/session",
    description: "Private kids session for 2-3 children with one trainer. Price per kid.",
    includes: [
      "60 minutes with 1 trainer",
      "For 2-3 kids aged 8-13",
      "All equipment provided",
    ],
    notes: "Price per kid. Minimum 2 participants.",
    bookingType: "private",
  },

  // --- BODYWEIGHT AREA ---
  {
    id: "bodyweight-dropin",
    name: "Bodyweight Area Drop-in",
    nameShort: "Bodyweight Drop-in",
    category: "bodyweight",
    price: 100,
    currency: "THB",
    unit: "session",
    description: "Access to the bodyweight training area with equipment. No class, train at your own pace.",
    includes: [
      "Full equipment access",
      "Bodyweight area",
    ],
    bookingType: "training",
  },
  {
    id: "bodyweight-monthly",
    name: "Bodyweight Area Monthly",
    nameShort: "Bodyweight Monthly",
    category: "bodyweight",
    price: 900,
    currency: "THB",
    unit: "month",
    description: "Unlimited monthly access to the bodyweight training area with equipment.",
    includes: [
      "Unlimited equipment access",
      "Bodyweight area",
    ],
    bookingType: "training",
  },

  // --- FIGHTER PROGRAM ---
  {
    id: "fighter-monthly",
    name: "Fighter Program (Monthly)",
    nameShort: "Fighter Program",
    category: "fighter",
    price: 9500,
    currency: "THB",
    unit: "month",
    description: "Intensive monthly fighter program for athletes preparing to compete.",
    includes: [
      "Training 2x per day",
      "Weekly stretch and yoga class",
      "Weekly ice bath",
      "Fight organization and matchmaking",
      "Corner support on fight day",
      "Full conditioning program",
    ],
    bookingType: "fighter",
  },

  // --- ACCOMMODATION + TRAINING (PLAI LAEM ONLY) ---
  {
    id: "camp-stay-1week",
    name: "Camp Stay — 1 Week",
    nameShort: "Camp Stay 1 Week",
    category: "camp-stay",
    price: 8000,
    currency: "THB",
    unit: "week",
    description: "1 week training + accommodation at Plai Laem. All-inclusive except food.",
    includes: [
      "7 nights accommodation at Plai Laem",
      "Unlimited group training sessions",
      "Electricity included",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity included for weekly stays.",
    bookingType: "camp-stay",
  },
  {
    id: "camp-stay-2weeks",
    name: "Camp Stay — 2 Weeks",
    nameShort: "Camp Stay 2 Weeks",
    category: "camp-stay",
    price: 15000,
    currency: "THB",
    unit: "2 weeks",
    description: "2 weeks training + accommodation at Plai Laem.",
    includes: [
      "14 nights accommodation at Plai Laem",
      "Unlimited group training sessions",
      "Electricity included",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity included for weekly stays.",
    popular: true,
    bookingType: "camp-stay",
  },
  {
    id: "camp-stay-1month",
    name: "Camp Stay — 1 Month",
    nameShort: "Camp Stay 1 Month",
    category: "camp-stay",
    price: 18000,
    currency: "THB",
    unit: "month",
    description: "1 month training + accommodation at Plai Laem. Best long-stay value.",
    includes: [
      "30 nights accommodation at Plai Laem",
      "Unlimited group training sessions",
      "Wi-Fi",
    ],
    notes: "Plai Laem camp only. Electricity charged separately for monthly stays.",
    bookingType: "camp-stay",
  },

  // --- FIGHTER + ACCOMMODATION (TODO) ---
  {
    id: "fighter-stay-monthly",
    name: "Fighter Program + Accommodation (Monthly)",
    nameShort: "Fighter Stay",
    category: "camp-stay",
    price: null,
    priceTodo: "Contact us",
    currency: "THB",
    unit: "month",
    description: "Fighter program plus accommodation at Plai Laem. Price pending confirmation.",
    includes: [
      "Fighter program (2x/day, yoga, ice bath, fight prep)",
      "30 nights accommodation at Plai Laem",
    ],
    notes: "Price pending client confirmation. Contact us for current rate.",
    bookingType: "camp-stay",
  },
];

// Convenience helpers
export const getPriceById = (id: string): PriceItem | undefined =>
  PRICES.find((p) => p.id === id);

export const getPricesByCategory = (category: PriceCategory): PriceItem[] =>
  PRICES.filter((p) => p.category === category);

export const getPricesByBookingType = (type: BookingType): PriceItem[] =>
  PRICES.filter((p) => p.bookingType === type);

export const formatPrice = (item: PriceItem): string =>
  item.price !== null
    ? `${item.price.toLocaleString()} THB`
    : (item.priceTodo ?? "Contact us");
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run build 2>&1 | grep -E "error|Error" | head -20`
Expected: no TypeScript errors from `src/content/pricing.ts`.

---

## Task 5: Update /pricing page

**Files:**
- Modify: `src/app/pricing/page.tsx`

The pricing page needs a complete restructure: correct prices, new sections (kids, resident, bodyweight), weekly packages split into 1x/2x day options, private lessons restructured.

- [ ] **Step 1: Update imports to use pricing catalog**

At the top of the file, after existing imports, add:
```typescript
import { PRICES, getPricesByCategory, formatPrice } from "@/content/pricing";
```

- [ ] **Step 2: Update metadata and schema**

Replace the metadata title and the schema offers:
```typescript
export const metadata = generatePageMeta({
  title: "Muay Thai Prices Koh Samui | Ratchawat - From 400 THB",
  description:
    "Muay Thai training prices at Ratchawat Koh Samui. Drop-in 400 THB, weekly & monthly packages. Group, private, kids & fighter programs.",
  path: "/pricing",
});
```

In the `offerCatalogSchema` call, replace offers array:
```typescript
offerCatalogSchema({
  name: "Ratchawat Muay Thai Training Packages",
  description: "Training packages at Chor Ratchawat Muay Thai Gym, Koh Samui",
  offers: [
    { name: "Drop-in Session (Adult)", price: 400, description: "Single group class" },
    { name: "1 Week 1x/day", price: 2000, description: "5 sessions" },
    { name: "Monthly 1x/day", price: 5500, description: "Unlimited sessions, 1 per day" },
    { name: "Monthly 2x/day", price: 7000, description: "Unlimited sessions, 2 per day" },
    { name: "Private 1-on-1", price: 800, description: "60-minute private session" },
    { name: "Fighter Program", price: 9500, description: "Full fighter program monthly" },
    { name: "Camp Stay 1 Week", price: 8000, description: "Training + accommodation, Plai Laem" },
  ],
}),
```

- [ ] **Step 3: Rewrite the Drop-in section**

Replace the drop-in price display:
```tsx
{/* Drop-in Sessions */}
<section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">SINGLE CLASS</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
      Drop-in Sessions
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <GlassCard>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Adults</p>
            <span className="font-serif text-4xl lg:text-5xl font-bold text-primary">400 THB</span>
            <p className="text-on-surface-variant text-sm mt-1">per session</p>
          </div>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> 1 group class (morning or afternoon)</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> All equipment included</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Both locations</li>
          </ul>
          <Link href="/booking/training?package=drop-in-adult" className="btn-primary">
            Book Now <span className="btn-arrow">&rarr;</span>
          </Link>
        </div>
      </GlassCard>
      <GlassCard>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-1">Kids (8-13 years)</p>
            <span className="font-serif text-4xl lg:text-5xl font-bold text-primary">300 THB</span>
            <p className="text-on-surface-variant text-sm mt-1">per session</p>
          </div>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> 1 kids group class</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> All equipment included</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Dedicated kids trainer</li>
          </ul>
          <Link href="/booking/training?package=drop-in-kids" className="btn-primary">
            Book Kids Class <span className="btn-arrow">&rarr;</span>
          </Link>
        </div>
      </GlassCard>
    </div>
  </div>
</section>
```

- [ ] **Step 4: Rewrite the Weekly & Monthly section**

Replace the 2-card grid (Weekly / Monthly) with a 4-card grid showing 1x and 2x options:
```tsx
{/* Weekly & Monthly Packages */}
<section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
  <div className="max-w-5xl mx-auto">
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">PACKAGES</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
      Weekly & Monthly Packages
    </h2>
    <p className="text-center text-on-surface-variant text-sm mb-10">
      Choose between 1 session/day or 2 sessions/day (morning + afternoon).
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1 Week 1x */}
      <GlassCard>
        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">1 Week</p>
        <h3 className="font-serif text-base font-bold text-on-surface uppercase mb-3">1 Session/Day</h3>
        <div className="mb-4">
          <span className="font-serif text-3xl font-bold text-primary">2,000</span>
          <span className="text-on-surface-variant text-xs ml-1">THB</span>
        </div>
        <ul className="space-y-1 text-xs text-on-surface-variant mb-5">
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> 5 sessions</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Morning or afternoon</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Both locations</li>
        </ul>
        <Link href="/booking/training?package=weekly-1x" className="btn-primary w-full justify-center text-sm">
          Book <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
      {/* 1 Week 2x */}
      <GlassCard>
        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">1 Week</p>
        <h3 className="font-serif text-base font-bold text-on-surface uppercase mb-3">2 Sessions/Day</h3>
        <div className="mb-4">
          <span className="font-serif text-3xl font-bold text-primary">3,000</span>
          <span className="text-on-surface-variant text-xs ml-1">THB</span>
        </div>
        <ul className="space-y-1 text-xs text-on-surface-variant mb-5">
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> 10 sessions</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Morning + afternoon</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Both locations</li>
        </ul>
        <Link href="/booking/training?package=weekly-2x" className="btn-primary w-full justify-center text-sm">
          Book <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
      {/* Monthly 1x */}
      <GlassCard className="ring-2 ring-primary">
        <div className="mb-2"><span className="badge-underline badge-orange">Most Popular</span></div>
        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Monthly</p>
        <h3 className="font-serif text-base font-bold text-on-surface uppercase mb-3">1 Session/Day</h3>
        <div className="mb-4">
          <span className="font-serif text-3xl font-bold text-primary">5,500</span>
          <span className="text-on-surface-variant text-xs ml-1">THB</span>
        </div>
        <ul className="space-y-1 text-xs text-on-surface-variant mb-5">
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Unlimited 1x/day</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Morning or afternoon</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Both locations</li>
        </ul>
        <Link href="/booking/training?package=monthly-1x" className="btn-primary w-full justify-center text-sm">
          Book <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
      {/* Monthly 2x */}
      <GlassCard>
        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-2">Monthly</p>
        <h3 className="font-serif text-base font-bold text-on-surface uppercase mb-3">2 Sessions/Day</h3>
        <div className="mb-4">
          <span className="font-serif text-3xl font-bold text-primary">7,000</span>
          <span className="text-on-surface-variant text-xs ml-1">THB</span>
        </div>
        <ul className="space-y-1 text-xs text-on-surface-variant mb-5">
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Unlimited 2x/day</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Morning + afternoon</li>
          <li className="flex items-center gap-2"><Check size={14} className="text-primary shrink-0" /> Best for max progress</li>
        </ul>
        <Link href="/booking/training?package=monthly-2x" className="btn-primary w-full justify-center text-sm">
          Book <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
    </div>
    {/* 2-week packages note */}
    <div className="mt-6 text-center">
      <p className="text-on-surface-variant text-sm">
        Also available: 2-week packages — 3,500 THB (1x/day) or 5,500 THB (2x/day).{" "}
        <Link href="/contact" className="btn-link">Ask us <span className="btn-arrow">&rarr;</span></Link>
      </p>
    </div>
  </div>
</section>
```

- [ ] **Step 5: Rewrite Private Lessons section**

Replace the Single Session + 10-Pack cards with the real pricing:
```tsx
{/* Private Lessons */}
<section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">1-ON-1</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
      Private Lessons
    </h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
      {/* Adult private */}
      <GlassCard>
        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-3">Adults</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-on-surface/10 pb-4">
            <div>
              <p className="font-bold text-on-surface text-sm">1-on-1 session</p>
              <p className="text-xs text-on-surface-variant mt-0.5">60 min, fully personalized</p>
            </div>
            <span className="font-serif text-2xl font-bold text-primary">800 <span className="text-sm font-normal">THB</span></span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-on-surface text-sm">Group 2-3 people</p>
              <p className="text-xs text-on-surface-variant mt-0.5">1 trainer, price per person</p>
            </div>
            <span className="font-serif text-2xl font-bold text-primary">600 <span className="text-sm font-normal">THB</span></span>
          </div>
        </div>
        <Link href="/booking/private?package=private-adult-solo" className="btn-primary w-full justify-center mt-6">
          Book Private <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
      {/* Kids private */}
      <GlassCard>
        <p className="text-xs uppercase tracking-widest text-on-surface-variant mb-3">Kids (8-13 years)</p>
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-on-surface/10 pb-4">
            <div>
              <p className="font-bold text-on-surface text-sm">1-on-1 session</p>
              <p className="text-xs text-on-surface-variant mt-0.5">60 min, kids-focused</p>
            </div>
            <span className="font-serif text-2xl font-bold text-primary">600 <span className="text-sm font-normal">THB</span></span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-on-surface text-sm">Group 2-3 kids</p>
              <p className="text-xs text-on-surface-variant mt-0.5">1 trainer, price per kid</p>
            </div>
            <span className="font-serif text-2xl font-bold text-primary">400 <span className="text-sm font-normal">THB</span></span>
          </div>
        </div>
        <Link href="/booking/private?package=private-kids-solo" className="btn-primary w-full justify-center mt-6">
          Book Kids Private <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
    </div>
    <p className="text-center text-on-surface-variant text-sm">
      Learn more about{" "}
      <Link href="/programs/private" className="btn-link">private training <span className="btn-arrow">&rarr;</span></Link>
    </p>
  </div>
</section>
```

- [ ] **Step 6: Update Fighter Program section**

Replace the 8,000 THB card content:
```tsx
{/* Fighter Program */}
<section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">FIGHTER</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
      Fighter Program
    </h2>
    <GlassCard>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">Monthly Fighter Program</h3>
          <div className="mb-4">
            <span className="font-serif text-4xl lg:text-5xl font-bold text-primary">9,500 THB</span>
            <span className="text-on-surface-variant text-sm ml-2">/ month</span>
          </div>
          <ul className="space-y-2 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Training 2x per day</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Weekly stretch and yoga class</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Weekly ice bath</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Fight organization and matchmaking</li>
            <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Corner support on fight day</li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 shrink-0">
          <Link href="/booking/fighter?package=fighter-monthly" className="btn-primary justify-center">
            Apply Now <span className="btn-arrow">&rarr;</span>
          </Link>
          <Link href="/programs/fighter" className="btn-link text-sm justify-center">
            Learn more about the program <span className="btn-arrow">&rarr;</span>
          </Link>
        </div>
      </div>
    </GlassCard>
  </div>
</section>
```

- [ ] **Step 7: Add Resident Prices section (new, after fighter)**

Insert this section after the Fighter section and before the "What's Included" section:
```tsx
{/* Resident Prices */}
<section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">KOH SAMUI RESIDENTS</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
      Resident Rates
    </h2>
    <p className="text-center text-on-surface-variant text-sm mb-8">
      Living on Koh Samui? We offer special rates for local residents. Proof of residency required.
    </p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <GlassCard>
        <h3 className="font-serif text-base font-bold text-on-surface uppercase mb-3">10-Class Card</h3>
        <div className="mb-4">
          <span className="font-serif text-3xl font-bold text-primary">3,000</span>
          <span className="text-on-surface-variant text-sm ml-1">THB</span>
        </div>
        <p className="text-sm text-on-surface-variant">10 group sessions, no expiry. Both locations.</p>
      </GlassCard>
      <GlassCard className="ring-2 ring-primary">
        <div className="mb-2"><span className="badge-underline badge-orange">Best Value</span></div>
        <h3 className="font-serif text-base font-bold text-on-surface uppercase mb-3">20-Class Card</h3>
        <div className="mb-4">
          <span className="font-serif text-3xl font-bold text-primary">5,500</span>
          <span className="text-on-surface-variant text-sm ml-1">THB</span>
        </div>
        <p className="text-sm text-on-surface-variant">20 group sessions, no expiry. Both locations.</p>
      </GlassCard>
    </div>
    <p className="text-center mt-6 text-on-surface-variant text-sm">
      <Link href="/contact" className="btn-link">Contact us for resident pricing <span className="btn-arrow">&rarr;</span></Link>
    </p>
  </div>
</section>
```

- [ ] **Step 8: Add Bodyweight Area section (new, after resident)**

Insert before the "What's Included" section:
```tsx
{/* Bodyweight Area */}
<section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">GYM ACCESS</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-8">
      Bodyweight Area
    </h2>
    <GlassCard>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <p className="text-on-surface-variant text-sm mb-4">
            Access to the bodyweight training area with full equipment. Train at your own pace, no class required.
          </p>
          <div className="flex gap-8">
            <div>
              <span className="font-serif text-3xl font-bold text-primary">100</span>
              <span className="text-on-surface-variant text-xs ml-1">THB / drop-in</span>
            </div>
            <div>
              <span className="font-serif text-3xl font-bold text-primary">900</span>
              <span className="text-on-surface-variant text-xs ml-1">THB / month</span>
            </div>
          </div>
        </div>
        <Link href="/contact" className="btn-primary shrink-0">
          Ask Us <span className="btn-arrow">&rarr;</span>
        </Link>
      </div>
    </GlassCard>
  </div>
</section>
```

- [ ] **Step 9: Update GEO citable passage**

Find the GEO passage section and update the price:
```tsx
<p className="text-on-surface-variant text-base leading-relaxed text-center">
  Chor Ratchawat Muay Thai Gym offers group classes, private lessons, and a fighter program at two locations in Koh Samui, Thailand: Bo Phut and Plai Laem. Drop-in sessions start at 400 THB for adults. Monthly packages start at 5,500 THB (1 session/day) or 7,000 THB (2 sessions/day). Camp Stay packages combining training and accommodation at Plai Laem start at 8,000 THB per week.
</p>
```

---

## Task 6: Update /programs pages

**Files:**
- Modify: `src/app/programs/group-adults/page.tsx`
- Modify: `src/app/programs/group-kids/page.tsx`
- Modify: `src/app/programs/private/page.tsx`
- Modify: `src/app/programs/fighter/page.tsx`

- [ ] **Step 1: Fix group-adults — schema and all price references**

In `src/app/programs/group-adults/page.tsx`:

Replace schema:
```typescript
const groupClassCourse = courseSchema({
  name: "Muay Thai Group Classes for Adults",
  description: "Daily group Muay Thai classes at Ratchawat Koh Samui. Morning and evening sessions for all levels.",
  url: `${SITE_URL}/programs/group-adults`,
  offers: { price: 400, priceCurrency: "THB" },
});
```

Replace all occurrences of `500 THB` with `400 THB` (3 occurrences).

Replace the CTABanner description:
```tsx
<CTABanner
  title="Ready to Train?"
  description="400 THB drop-in. No booking required, just show up."
  buttonText="Book Now"
  href="/booking/training?package=drop-in-adult"
  ghostText="View All Prices"
  ghostHref="/pricing"
/>
```

- [ ] **Step 2: Fix group-kids — schema and all price references**

In `src/app/programs/group-kids/page.tsx`:

Replace schema:
```typescript
const kidsCourse = courseSchema({
  name: "Muay Thai Group Classes for Kids",
  description: "Kids Muay Thai classes at Ratchawat Koh Samui. Ages 8-13.",
  url: `${SITE_URL}/programs/group-kids`,
  offers: { price: 300, priceCurrency: "THB" },
});
```

Replace all `500 THB` references with `300 THB` for the drop-in price (there may be a mention of the kids drop-in price).

Update the pricing section text to include monthly:
```tsx
Drop-in: 300 THB per session. Monthly unlimited: 2,500 THB. See{" "}
<Link href="/pricing" className="btn-link">all prices <span className="btn-arrow">&rarr;</span></Link>.
```

Replace the CTABanner description:
```tsx
<CTABanner
  title="Book a Kids Class"
  description="Drop-in 300 THB. Monthly unlimited 2,500 THB. Ages 8-13."
  buttonText="Book Now"
  href="/booking/training?package=drop-in-kids"
  ghostText="View All Prices"
  ghostHref="/pricing"
/>
```

- [ ] **Step 3: Fix programs/private — remove "choose your trainer" and update booking link**

In `src/app/programs/private/page.tsx`:

Remove "Choose your trainer" from the includes list (no dedicated trainer per gym policy).

Update booking links from `/booking?package=private-single` to `/booking/private?package=private-adult-solo`.

In the pricing section, update to show the real split:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="flex items-center justify-between p-4 bg-surface-lowest rounded-lg">
    <span className="text-on-surface text-sm font-medium">1-on-1 adult</span>
    <span className="font-serif text-2xl font-bold text-primary">800 THB</span>
  </div>
  <div className="flex items-center justify-between p-4 bg-surface-lowest rounded-lg">
    <span className="text-on-surface text-sm font-medium">Group 2-3 adults</span>
    <span className="font-serif text-2xl font-bold text-primary">600 THB<span className="text-xs font-normal text-on-surface-variant">/person</span></span>
  </div>
  <div className="flex items-center justify-between p-4 bg-surface-lowest rounded-lg">
    <span className="text-on-surface text-sm font-medium">1-on-1 kids</span>
    <span className="font-serif text-2xl font-bold text-primary">600 THB</span>
  </div>
  <div className="flex items-center justify-between p-4 bg-surface-lowest rounded-lg">
    <span className="text-on-surface text-sm font-medium">Group 2-3 kids</span>
    <span className="font-serif text-2xl font-bold text-primary">400 THB<span className="text-xs font-normal text-on-surface-variant">/kid</span></span>
  </div>
</div>
```

- [ ] **Step 4: Fix programs/fighter — price and includes**

In `src/app/programs/fighter/page.tsx`:

Replace both `5,500 THB` references with `9,500 THB`.

Update the pricing/info section to reflect real includes:
```tsx
Fighter training: 9,500 THB per month. Includes 2x daily training, weekly stretch-yoga class, weekly ice bath, fight organization, and corner support on fight day.{" "}
<Link href="/pricing" className="btn-link">See full pricing <span className="btn-arrow">&rarr;</span></Link>.
```

Update the CTABanner description:
```tsx
<CTABanner
  title="Ready to Fight?"
  description="Monthly fighter program 9,500 THB. All sessions included."
  buttonText="Apply Now"
  href="/booking/fighter?package=fighter-monthly"
  ghostText="Learn About Pricing"
  ghostHref="/pricing"
/>
```

---

## Task 7: Update /accommodation page

**Files:**
- Modify: `src/app/accommodation/page.tsx`

The page currently shows external accommodation options only. We need to add a Camp Stay Packages section at the top (Plai Laem only — these are products the gym sells directly).

- [ ] **Step 1: Add Camp Stay packages section before the existing content**

After the `<Breadcrumbs>` component and the page header section, insert a new section before the Bo Phut / Plai Laem external options:

```tsx
{/* Camp Stay Packages — Plai Laem */}
<section className="pb-16 sm:pb-20 px-6 sm:px-10 md:px-16 lg:px-20">
  <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="w-8 h-[2px] bg-primary" />
      <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">ALL-INCLUSIVE</span>
      <span className="w-8 h-[2px] bg-primary" />
    </div>
    <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
      Camp Stay Packages
    </h2>
    <p className="text-center text-on-surface-variant text-sm mb-10">
      Training + accommodation in one package. Available at our Plai Laem camp only. Electricity included for 1-week and 2-week stays.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <GlassCard>
        <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">1 Week</h3>
        <div className="mb-4">
          <span className="font-serif text-4xl font-bold text-primary">8,000</span>
          <span className="text-on-surface-variant text-sm ml-1">THB</span>
        </div>
        <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> 7 nights accommodation</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Unlimited group training</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Electricity included</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Wi-Fi</li>
        </ul>
        <Link href="/booking/camp-stay?package=camp-stay-1week" className="btn-primary w-full justify-center">
          Book 1 Week <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
      <GlassCard className="ring-2 ring-primary">
        <div className="mb-2"><span className="badge-underline badge-orange">Best Value</span></div>
        <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">2 Weeks</h3>
        <div className="mb-4">
          <span className="font-serif text-4xl font-bold text-primary">15,000</span>
          <span className="text-on-surface-variant text-sm ml-1">THB</span>
        </div>
        <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> 14 nights accommodation</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Unlimited group training</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Electricity included</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Wi-Fi</li>
        </ul>
        <Link href="/booking/camp-stay?package=camp-stay-2weeks" className="btn-primary w-full justify-center">
          Book 2 Weeks <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
      <GlassCard>
        <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-3">1 Month</h3>
        <div className="mb-4">
          <span className="font-serif text-4xl font-bold text-primary">18,000</span>
          <span className="text-on-surface-variant text-sm ml-1">THB</span>
        </div>
        <ul className="space-y-2 text-sm text-on-surface-variant mb-6">
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> 30 nights accommodation</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Unlimited group training</li>
          <li className="flex items-center gap-2"><Check size={16} className="text-primary shrink-0" /> Wi-Fi</li>
          <li className="flex items-center gap-2 text-on-surface-variant/60"><Check size={16} className="text-on-surface-variant/40 shrink-0" /> Electricity charged separately</li>
        </ul>
        <Link href="/booking/camp-stay?package=camp-stay-1month" className="btn-primary w-full justify-center">
          Book 1 Month <span className="btn-arrow">&rarr;</span>
        </Link>
      </GlassCard>
    </div>
    <p className="text-center mt-6 text-on-surface-variant text-sm">
      Also interested in the{" "}
      <Link href="/programs/fighter" className="btn-link">fighter program <span className="btn-arrow">&rarr;</span></Link>
      {" "}with accommodation? <Link href="/contact" className="btn-link">Contact us <span className="btn-arrow">&rarr;</span></Link>.
    </p>
  </div>
</section>
```

- [ ] **Step 2: Add `Check` import and `Link` import if not present**

Check the existing imports at the top of the file. If `Check` from lucide-react is missing, add it:
```typescript
import { MapPin, Wifi, Utensils, Bed, DollarSign, Users, Check } from "lucide-react";
```

- [ ] **Step 3: Update GEO passage for accommodation page**

Find the GEO passage and update:
```tsx
<p className="text-on-surface-variant text-base leading-relaxed text-center">
  Chor Ratchawat Muay Thai Gym offers Camp Stay packages at its Plai Laem location in Koh Samui, combining accommodation and unlimited group training. Prices start at 8,000 THB for one week (electricity included) and 18,000 THB for one month. For external accommodation, both Bo Phut and Plai Laem camps have budget guesthouses and monthly rentals nearby.
</p>
```

---

## Task 8: Update homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Fix the pricing preview section (line ~258)**

Replace `500 THB` drop-in display:
```tsx
<div className="text-center">
  <span className="font-serif text-3xl font-bold text-primary">
    400 THB
  </span>
  <p className="text-on-surface-variant text-xs mt-1">
    Drop-in (~$12 USD)
  </p>
</div>
<div className="text-center">
  <span className="font-serif text-3xl font-bold text-primary">
    5,500 THB
  </span>
  <p className="text-on-surface-variant text-xs mt-1">
    Monthly 1x/day (~$167 USD)
  </p>
</div>
```

- [ ] **Step 2: Fix the GEO passage (line ~408)**

Replace:
```tsx
. Drop-in sessions start at
500 THB (~$15 USD).
```
With:
```tsx
. Drop-in sessions start at 400 THB.
```

---

## Task 9: Final verification and commit

**Files:** All modified files

- [ ] **Step 1: Run lint**

Run: `npm run lint`
Expected: 0 errors, 0 warnings. Fix any issues before proceeding.

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build completes successfully. Fix any TypeScript errors.

- [ ] **Step 3: Search for stale prices**

Run: `grep -r "500 THB" src/ --include="*.tsx" --include="*.ts"`
Expected: 0 results. If any found, fix them.

Run: `grep -r "8,000 THB\|1,500 THB\|12,000 THB" src/ --include="*.tsx"`
Expected: 0 results (old fake prices). Fix if found.

- [ ] **Step 4: Update ROADMAP.md to mark Phase 1 tasks complete**

In `ROADMAP.md`, under Phase 1, check off all completed tasks.

- [ ] **Step 5: Commit**

```bash
git add src/content/pricing.ts ROADMAP.md ARCHITECTURE.md PROJET-STATUS.md CLAUDE.md src/app/pricing/page.tsx src/app/programs/group-adults/page.tsx src/app/programs/group-kids/page.tsx src/app/programs/private/page.tsx src/app/programs/fighter/page.tsx src/app/accommodation/page.tsx src/app/page.tsx docs/
git commit -m "feat: production phase foundation — real prices, pricing catalog, ROADMAP + ARCHITECTURE docs"
```

---

## Self-Review Checklist

- [x] All prices match the spec (400 drop-in, 9500 fighter, 8000/15000/18000 camp stay)
- [x] `pricing.ts` type definitions consistent across all references
- [x] Booking links updated to new routes (`/booking/training`, `/booking/private`, etc.)
- [x] `Check` import added to accommodation page
- [x] GEO passages updated on all modified pages
- [x] No TBD or TODO in code (only `fighter-stay-monthly` which is intentionally null with priceTodo)
- [x] Build step verifies TypeScript compilation
- [x] Stale price grep step catches any missed occurrences
