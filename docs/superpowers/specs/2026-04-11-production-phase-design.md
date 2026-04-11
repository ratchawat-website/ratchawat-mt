# Production Phase Design — Ratchawat Muay Thai

**Date:** 2026-04-11
**Status:** Approved
**Author:** Brainstorming session (RD + Claude)

---

## Context

The client has accepted the site redesign. The maquette phase (20 pages, design system, component library) is complete. This document defines the architecture and roadmap for the production phase: real content, real prices, full booking system, backend integrations, and deployment.

**The site must not go live until all phases are complete (Option B — full build before deployment).**

---

## 1. Documentation Structure

Four files govern the project. Every agent reads them at session start.

| File | Role | Read when |
|------|------|-----------|
| `PROJET-STATUS.md` | State of the codebase. What is built, components, correction history. | Always — first read |
| `ROADMAP.md` | What to build. Phases, task checklists, statuses, blockers, success criteria. | Always — to know what to do next |
| `ARCHITECTURE.md` | Technical decisions. Supabase schema, Stripe products, booking system design. | Before touching backend or integrations |
| `CLAUDE.md` | How to work. Conventions, skills, workflows. References ROADMAP as source of truth for tasks. | Always — instructions |

**Rule:** Never start work without reading ROADMAP.md. Never write backend code without reading ARCHITECTURE.md.

---

## 2. Price Catalog — `src/content/pricing.ts`

Single source of truth for all prices. Imported by any page that displays prices. Designed to be replaced by a Supabase query when the backend is ready (same data shape).

### TypeScript structure

```typescript
export type BookingType = 'training' | 'private' | 'accommodation' | 'camp-stay' | 'fighter'
export type PriceCategory = 'group' | 'kids' | 'resident' | 'private-adult' | 'private-kids' | 'bodyweight' | 'fighter' | 'accommodation' | 'camp-stay'

export interface PriceItem {
  id: string                    // slug used in ?package= query param and Stripe
  name: string                  // display name (full)
  nameShort: string             // display name (compact, for cards)
  category: PriceCategory
  price: number | null          // THB. null = TODO (awaiting client confirmation)
  priceTodo?: string            // shown instead of price when null
  currency: 'THB'
  unit: string                  // 'session' | 'week' | 'month' | 'person'
  description: string
  includes: string[]
  notes?: string                // e.g. "+ electricity separately"
  popular?: boolean             // shows "Most Popular" badge
  bookingType: BookingType
  stripeProductId?: string      // populated when Stripe is configured
  stripePriceId?: string        // populated when Stripe is configured
}
```

### Complete price list

**Group training (adult):**
| id | name | price | unit |
|----|------|-------|------|
| `drop-in-adult` | Drop-in (Adult) | 400 THB | session |
| `weekly-1x` | 1 Week, 1 session/day | 2,000 THB | week |
| `weekly-2x` | 1 Week, 2 sessions/day | 3,000 THB | week |
| `biweekly-1x` | 2 Weeks, 1 session/day | 3,500 THB | 2 weeks |
| `biweekly-2x` | 2 Weeks, 2 sessions/day | 5,500 THB | 2 weeks |
| `monthly-1x` | Monthly, 1 session/day | 5,500 THB | month |
| `monthly-2x` | Monthly, 2 sessions/day | 7,000 THB | month |

**Group training (kids, 8-13 years):**
| id | name | price | unit |
|----|------|-------|------|
| `drop-in-kids` | Drop-in (Kids 8-13) | 300 THB | session |
| `monthly-kids` | Monthly Unlimited (Kids 8-13) | 2,500 THB | month |

**Resident (Koh Samui residents):**
| id | name | price | unit |
|----|------|-------|------|
| `resident-10` | Resident 10 Classes | 3,000 THB | 10 classes |
| `resident-20` | Resident 20 Classes | 5,500 THB | 20 classes |

**Private lessons (adult):**
| id | name | price | unit |
|----|------|-------|------|
| `private-adult-solo` | Private 1-on-1 (Adult) | 800 THB | session |
| `private-adult-group` | Private Group 2-3 (Adult) | 600 THB | person/session |

**Private lessons (kids):**
| id | name | price | unit |
|----|------|-------|------|
| `private-kids-solo` | Private 1-on-1 (Kids) | 600 THB | session |
| `private-kids-group` | Private Group 2-3 (Kids) | 400 THB | kid/session |

**Bodyweight area (equipment access):**
| id | name | price | unit |
|----|------|-------|------|
| `bodyweight-dropin` | Bodyweight Area Drop-in | 100 THB | session |
| `bodyweight-monthly` | Bodyweight Area Monthly | 900 THB | month |

**Fighter Program:**
| id | name | price | unit | includes |
|----|------|-------|------|----------|
| `fighter-monthly` | Fighter Program Monthly | 9,500 THB | month | 2x/day training, weekly stretch/yoga, weekly ice bath, fight organization, fight support |

**Accommodation + Training (Plai Laem only):**
| id | name | price | notes |
|----|------|-------|-------|
| `camp-stay-1week` | Camp Stay 1 Week | 8,000 THB | Electricity included |
| `camp-stay-2weeks` | Camp Stay 2 Weeks | 15,000 THB | Electricity included |
| `camp-stay-1month` | Camp Stay 1 Month | 18,000 THB | + electricity separately |

**Fighter + Accommodation:**
| id | name | price | notes |
|----|------|-------|-------|
| `fighter-stay-monthly` | Fighter Program + Accommodation | null | TODO — awaiting client confirmation |

---

## 3. Booking System Architecture

### Routes

```
/booking                     Landing — 3 type selection cards
/booking/training            Group classes wizard
/booking/private             Private lessons wizard (availability calendar)
/booking/accommodation       Accommodation wizard (availability calendar, Plai Laem only)
/booking/camp-stay           MT + Accommodation wizard
/booking/fighter             Fighter Program wizard
/booking/confirmed           Post-payment confirmation (reads ?booking_id=)
```

### Entry points (links from other pages)

Every "Book Now" or pricing link passes `?package=<id>` so the wizard pre-selects the right option. Example: `/booking/training?package=monthly-1x`.

### Wizard steps per flow

**Training (group classes):**
1. Package selection (pre-selected if ?package= present)
2. Camp choice (Bo Phut or Plai Laem)
3. Start date (date picker — any date, no availability check)
4. Contact info (name, email, phone, nationality)
5. Review + Stripe Checkout

**Private lessons:**
1. Session type (solo or group, adult or kids)
2. Availability calendar (shows gym-wide available slots, admin-managed)
3. Time slot selection (from available slots on chosen date)
4. Contact info
5. Review + Stripe Checkout

**Accommodation (Plai Laem only):**
1. Duration (1 week / 2 weeks / 1 month)
2. Availability calendar (shows available check-in dates based on duration)
3. Contact info
4. Review + Stripe Checkout

**Camp Stay (MT + Accommodation):**
1. Duration (1 week / 2 weeks / 1 month)
2. Availability calendar (same as accommodation)
3. Contact info
4. Review + Stripe Checkout

**Fighter Program:**
1. Confirmation of what is included (read-only info screen)
2. Start date (date picker)
3. Accommodation option (yes/no — if yes, TODO price shown with WhatsApp fallback)
4. Contact info
5. Review + Stripe Checkout

### Calendar system — 2 distinct types

**Type A — Simple date picker** (training, fighter start date)
- Any date selectable
- Standard HTML date input or lightweight calendar
- No Supabase query needed

**Type B — Availability calendar** (private lessons, accommodation, camp stay)
- Fetches `availability_blocks` from Supabase
- Blocked dates shown as unavailable (greyed out)
- Admin manages blocks via /admin/availability
- Real-time — no double booking

### Components to build

| Component | Used in | Notes |
|-----------|---------|-------|
| `BookingLanding` | /booking | 3 cards with icons, prices, CTA |
| `BookingWizard` | all /booking/* | Step indicator, back/next navigation, progress state |
| `DatePicker` | training, fighter | Simple, no availability |
| `AvailabilityCalendar` | private, accommodation, camp-stay | Supabase-connected |
| `ContactForm` | all wizards | Name, email, phone, nationality |
| `BookingReview` | all wizards | Summary before payment |
| `BookingConfirmed` | /booking/confirmed | Success state, next steps |

---

## 4. Supabase Data Model

### Table: `bookings`

```sql
create table bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('training','private','accommodation','camp-stay','fighter')),
  status text not null default 'pending' check (status in ('pending','confirmed','cancelled','completed')),
  price_id text not null,              -- references pricing.ts id
  price_amount integer not null,       -- in THB
  start_date date not null,
  end_date date,                       -- null for drop-in/single session
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

### Table: `availability_blocks`

```sql
create table availability_blocks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('private','accommodation','all')),
  date date not null,
  time_slot text,                      -- for private only: '09:00', '11:00', '14:00', '16:00'
  is_blocked boolean not null default true,
  reason text,                         -- admin note (e.g. "Public holiday", "Fully booked")
  created_by uuid references auth.users(id)
);
```

### RLS Policies

- `bookings`: insert allowed for all (anonymous booking), select/update restricted to admin role
- `availability_blocks`: select allowed for all (client calendar reads), insert/update/delete restricted to admin role

### Auth

- Admin auth via Supabase Auth (email/password)
- Single admin account for the gym
- Protected routes: `/admin/*` — middleware redirects to `/admin/login` if not authenticated

---

## 5. Stripe Integration

### Products to create in Stripe dashboard

One product per `PriceItem.id`. Stripe Product ID and Price ID stored back in `pricing.ts` once created.

### Checkout flow

1. Client completes wizard → POST `/api/checkout` with `price_id`, `booking_data`
2. API creates a booking row in Supabase with status `pending`
3. API creates Stripe Checkout Session with `booking_id` in metadata
4. Client redirected to Stripe Checkout
5. Stripe webhook (`/api/webhooks/stripe`) receives `checkout.session.completed`
6. Webhook updates booking status to `confirmed`, sends confirmation email via Resend

### Email flows (Resend)

- **Booking confirmed (client):** summary, dates, camp address, what to bring, WhatsApp contact
- **Booking notification (admin):** new booking alert with all details

---

## 6. Admin Dashboard

### Routes

```
/admin                       Redirect to /admin/bookings
/admin/login                 Auth page (Supabase)
/admin/bookings              Table of all bookings (filter by type, status, date)
/admin/bookings/[id]         Booking detail + status update
/admin/availability          Calendar — block/unblock dates and time slots
```

### Access control

Supabase middleware: if no active session, redirect to `/admin/login`.

---

## 7. Project Phases (ROADMAP)

### Phase 1 — Content & Pricing Foundation
**Goal:** Real information on every page. No maquette data.
**Blocker:** None.
- [ ] Create `src/content/pricing.ts` with complete price list
- [ ] Update `/pricing` page with real prices (all categories)
- [ ] Update `/programs/group-adults` with real prices
- [ ] Update `/programs/group-kids` with real prices
- [ ] Update `/programs/private` with real prices
- [ ] Update `/programs/fighter` with real prices + Fighter Program details
- [ ] Update `/accommodation` with real prices (Plai Laem only)
- [ ] Update `/` homepage pricing preview section
- [ ] Update SEO metadata (title mentions real price 400 THB not 500)
- [ ] Update `PROJET-STATUS.md` (production mode, real data)
- [ ] Update `CLAUDE.md` (add /nextjs-security-scan to workflow)
- [ ] Create `ROADMAP.md`
- [ ] Create `ARCHITECTURE.md`
- **Success:** `npm run build` passes. Every price shown on site matches this spec.

### Phase 2 — Booking System UI
**Goal:** All booking flows built. No backend yet — Stripe fallback to WhatsApp for unavailability-gated flows.
**Blocker:** Phase 1 complete.
- [ ] Build `BookingLanding` component + `/booking` page
- [ ] Build `BookingWizard` shell (step indicator, navigation)
- [ ] Build `/booking/training` (date picker, package pre-select)
- [ ] Build `/booking/private` (static slots — backend wired in Phase 3)
- [ ] Build `/booking/accommodation` (static calendar — backend wired in Phase 3)
- [ ] Build `/booking/camp-stay`
- [ ] Build `/booking/fighter`
- [ ] Build `/booking/confirmed`
- [ ] Wire Stripe Checkout for training flow (simple, no availability needed)
- [ ] `npm run build` + security scan pass
- **Success:** Full booking flow navigable. Training bookings payable via Stripe.

### Phase 3 — Backend Integration
**Goal:** Supabase + Stripe + Resend fully operational. All booking flows live.
**Blocker:** New Supabase account ready (new GitHub account for client).
- [ ] Create Supabase project (client account)
- [ ] Run migrations (bookings, availability_blocks tables)
- [ ] Configure RLS policies
- [ ] Create Stripe products + prices for all price IDs
- [ ] Wire Stripe webhook
- [ ] Configure Resend (domain verification)
- [ ] Build email templates (booking confirmed, admin notification)
- [ ] Wire availability calendar to Supabase
- [ ] Wire all booking flows to Supabase + Stripe
- [ ] Set `.env.local` with all keys
- [ ] `npm run build` + all flows end-to-end tested
- **Success:** Full booking + payment + email confirmation works for all 5 flows.

### Phase 4 — Admin Dashboard
**Goal:** Gym owner can manage bookings and availability.
**Blocker:** Phase 3 complete.
- [ ] Build `/admin/login` (Supabase Auth)
- [ ] Build `/admin/bookings` (table, filters)
- [ ] Build `/admin/bookings/[id]` (detail, status update)
- [ ] Build `/admin/availability` (calendar, block/unblock)
- [ ] Protect all `/admin/*` routes via middleware
- **Success:** Admin can log in, see all bookings, manage availability.

### Phase 5 — Security & Quality
**Goal:** Production-ready. Lighthouse targets met. No vulnerabilities.
**Blocker:** Phase 4 complete.
- [ ] Run `/nextjs-security-scan` — fix all findings
- [ ] Rate limiting on `/api/*` routes
- [ ] CORS configuration
- [ ] Input validation on all API routes (Zod)
- [ ] Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100
- [ ] All pages audited vs AUDIT-SEO.md (schemas, GEO, internal links)
- [ ] `llms.txt` and `llms-full.txt` updated with booking system info
- [ ] Fighter camp prices confirmed + TODO replaced
- **Success:** All Lighthouse targets met. Security scan 0 critical findings.

### Phase 6 — Go-live
**Goal:** Site live at ratchawatmuaythai.com.
**Blocker:** Domain transfer from Bluehost confirmed + Phase 5 complete.
- [ ] Analyze Bluehost domain situation
- [ ] Transfer domain or update nameservers
- [ ] Deploy to Vercel (production)
- [ ] Set environment variables in Vercel
- [ ] Configure redirections 301 in `next.config.js`
- [ ] Verify Google Search Console
- [ ] Configure Google Analytics (G-SVH7KPWM2S or new)
- [ ] Update 2 Google Business Profile fiches with new URLs
- [ ] Smoke test all booking flows on production
- **Success:** Site live, bookings working, analytics tracking, GSC verified.

---

## 8. External Blockers (actions required from RD)

| Blocker | Needed for | Action |
|---------|-----------|--------|
| New GitHub account (client) | Phase 3 | Create account, add as project owner |
| New Supabase account (client) | Phase 3 | Sign up with client GitHub |
| Stripe account access | Phase 3 | Client shares Stripe dashboard access |
| Bluehost domain access | Phase 6 | Analyze + transfer domain |
| Fighter + accommodation price | Phase 5 | Confirm with client |
| Real photos | Phase 5 | Client delivers photos |
| Resend domain verification | Phase 3 | Requires DNS access to ratchawatmuaythai.com |
