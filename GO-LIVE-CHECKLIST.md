# Ratchawat Muay Thai — Go-Live Checklist

> **READ THIS FILE BEFORE DEPLOYING TO PRODUCTION.**
>
> This is the exhaustive list of environment variables, dashboards, DNS records, and config switches that must be toggled between dev and production. Every item here was flagged during Phase 3 development and deferred until go-live (Phase 6).
>
> **Never skip an item.** Missing any one of these will either break the booking flow, leak customer data to the wrong account, or deliver emails to the wrong inbox.

**Last updated:** 2026-04-12
**Status:** Dev complete — pending go-live
**Used when:** Phase 6 — Go-live

---

## 1. Environment variables

All values below live in **Vercel Project Settings → Environment Variables** for the production deployment. Never commit a `.env.production` file.

### 1.1 Supabase

| Var | Dev value (current) | Prod value (to set) | Notes |
|-----|---------------------|---------------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Points to RD's personal Supabase project for Ratchawat | **Same** if we keep the same project, OR a new client-owned project if we migrate | Decide during Phase 6 whether to migrate the Supabase project to a client-owned account |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Dev project anon key | Prod project anon key | Regenerate if migrating |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev project service_role | Prod project service_role | **NEVER** commit this. Vercel-only. Used by /api/checkout and /booking/confirmed server reads. |

**Migration decision:** The client asked not to be involved in backend setup. RD owns the Supabase project today. At go-live, decide:
- **Option A:** Keep the project under RD's account, client pays via business agreement.
- **Option B:** Transfer project ownership to a new client-owned Supabase account. Requires data migration.

The booking system code does not care which option we pick — only the env vars change.

### 1.2 Stripe

| Var | Dev value (current) | Prod value (to set) |
|-----|---------------------|---------------------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_...` (client account TEST mode) | `pk_live_...` (client account LIVE mode) |
| `STRIPE_SECRET_KEY` | `sk_test_...` | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` from `stripe listen` CLI | `whsec_...` from dashboard webhook endpoint |

**Product migration:**
1. In Stripe Dashboard (client account), toggle **TEST mode → LIVE mode**
2. Run `npm run stripe:seed` against live keys. This creates 22 live products with the same IDs injected into `pricing.ts`.
3. **The `pricing.ts` file will accumulate BOTH test and live IDs** — we need to decide which one is committed. Recommendation: commit live IDs only, and maintain a `pricing.dev.ts` or overlay for dev. OR accept that `stripe:seed` is only run once (live) and dev uses the same IDs.

**Simpler alternative:** keep test keys in dev forever (test products never expire), and at go-live, seed live products and replace IDs in `pricing.ts` via a single commit. This is the recommended path.

### 1.3 Resend

| Var | Dev value (current) | Prod value (to set) |
|-----|---------------------|---------------------|
| `RESEND_API_KEY` | Dev API key (may be same account) | Live API key from same Resend account is fine |

**From address migration:** Currently `src/lib/email/send.ts` uses:
- Dev: `Ratchawat Muay Thai <onboarding@resend.dev>` (sandbox, only delivers to Resend account owner's email)
- Prod: `Ratchawat Muay Thai <bookings@ratchawatmuaythai.com>` (requires verified domain)

To unlock production delivery to any recipient:
1. Resend Dashboard → **Domains → Add Domain → `ratchawatmuaythai.com`**
2. Resend provides DNS records (TXT, MX, CNAME — typically 4 to 6 records)
3. Add records to the authoritative DNS server for `ratchawatmuaythai.com`
4. Wait for Resend to verify (5–30 minutes)
5. Once verified, the `getFromAddress()` helper in `send.ts` will switch automatically because it reads `process.env.NODE_ENV === "production"`

**Blocker:** requires DNS access to `ratchawatmuaythai.com`. Currently the domain is on Bluehost and pending transfer. Coordinate Resend domain verification with the domain transfer step.

### 1.4 Admin email

| Var | Dev value (current) | Prod value (to set) |
|-----|---------------------|---------------------|
| `ADMIN_EMAIL` | **RD's own email** (Resend sandbox limitation) | `chor.ratchawat@gmail.com` (owner) |

**Why:** In dev, Resend sandbox only delivers to the account owner's address. RD set `ADMIN_EMAIL=<rd's own>` so that both client confirmation AND admin notification land in RD's inbox for testing.

In production, after domain verification, any recipient works and we switch back to the real gym owner address.

**Potential future recipients to consider:** trainers, managers, accounting. Today the system sends only to `ADMIN_EMAIL`. If multiple recipients are needed, extend `sendAdminNotificationEmail` to accept an array.

### 1.5 Site URL

| Var | Dev value (current) | Prod value (to set) |
|-----|---------------------|---------------------|
| `NEXT_PUBLIC_SITE_URL` | `https://ratchawatmuaythai.com` (already correct for SEO metadata) | `https://ratchawatmuaythai.com` |

**No change needed.** This variable feeds Schema.org, sitemap, canonical tags, and Open Graph tags. It already points at production during dev.

Note: the Stripe checkout success/cancel URLs are NOT built from this var (they are derived from the incoming request origin). So you can leave this alone.

---

## 2. Stripe dashboard actions

### 2.1 Switch to live mode
- Top-right toggle in Stripe Dashboard → **View live data**
- Verify business details, payout bank account, tax settings for Thailand
- Verify that the Stripe account is connected to a real Thai bank for THB payouts

### 2.2 Create webhook endpoint
- Dashboard → **Developers → Webhooks → Add endpoint**
- URL: `https://ratchawatmuaythai.com/api/webhooks/stripe`
- Events to subscribe to (only these two — see `src/app/api/webhooks/stripe/route.ts`):
  - `checkout.session.completed`
  - `checkout.session.expired`
- Signing secret: copy the `whsec_...` value into Vercel `STRIPE_WEBHOOK_SECRET`

### 2.3 Remove the `stripe listen` CLI tunnel
- Dev uses `stripe listen --forward-to localhost:3000/api/webhooks/stripe` with a different `whsec_...`
- In production the dashboard endpoint replaces the CLI tunnel

### 2.4 Seed live products
- Run `npm run stripe:seed` against live keys locally
- This creates 22 products in the client's live Stripe account
- IDs are auto-injected into `src/content/pricing.ts`
- Commit the updated `pricing.ts`

### 2.5 Pending price confirmation
- `fighter-stay-room-monthly` is currently **20,000 THB approximate** (has `priceTodo` flag)
- Confirm final price with client before seeding live products
- `fighter-stay-bungalow-monthly` is already **25,500 THB confirmed** (2026-04-11)

---

## 3. Resend dashboard actions

### 3.1 Verify the domain
- Resend Dashboard → **Domains → Add Domain → `ratchawatmuaythai.com`**
- Add the 4-6 DNS records Resend provides (SPF TXT, DKIM, MX, DMARC)
- Verify success in Resend dashboard

### 3.2 Pick the from-address
- Recommended: `bookings@ratchawatmuaythai.com` (already hardcoded in `src/lib/email/send.ts:FROM_PROD`)
- Alternatives: `hello@`, `noreply@`, or `training@`
- No mailbox needs to exist — Resend sends outbound only, doesn't receive

### 3.3 Set up DMARC monitoring (optional but recommended)
- Default DMARC record Resend provides is `p=none` (monitor mode)
- After a few weeks of successful sending, tighten to `p=quarantine` then `p=reject`

---

## 4. Supabase production setup

### 4.1 If staying on the current dev project
- No migration needed. Just update Vercel env vars to match `.env.local`.
- **Double-check:** the dev project has 2 test availability_blocks seeded (`2026-04-18`, `2026-04-20`). Delete these before go-live:

```sql
delete from availability_blocks where reason like 'Test block%';
```

- **Double-check:** any test bookings with `client_email = 'smoke@test.local'` or similar — delete:

```sql
delete from bookings where client_email like '%@test.local';
delete from bookings where client_name ilike 'smoke test%';
```

### 4.2 If migrating to a client-owned Supabase account
- Create new project under client account
- Run `supabase/migrations/20260411000000_init.sql` on the new project
- Copy environment variables to Vercel
- Data migration: the booking table is empty by design (no historical data)
- The availability_blocks table will need to be seeded with real blocks by the admin via `/admin/availability` once Phase 4 ships

### 4.3 RLS follow-up (issue #5 in PROJET-STATUS.md)
- Investigate why policy `anon_insert_bookings` rejects direct inserts
- Not blocking for go-live because `/api/checkout` uses `service_role`
- Either fix the policy or drop it entirely and document that all inserts are server-side

### 4.4 Enable Point-in-Time Recovery
- Supabase paid plan feature
- Go to project settings and enable if available on the chosen tier

---

## 5. Domain + DNS

### 5.1 Resolve Bluehost situation
- Domain `ratchawatmuaythai.com` is currently registered at Bluehost serving a WordPress site
- Options:
  - **Transfer domain to a better registrar** (Cloudflare, Namecheap, Route 53)
  - **Update nameservers** at Bluehost to point to Cloudflare (keeps registration at Bluehost but DNS elsewhere — less ideal)

### 5.2 Add required DNS records

At the new DNS provider, add:

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| A or CNAME | `@` or `ratchawatmuaythai.com` | `cname.vercel-dns.com` (Vercel-provided) | Point root to Vercel |
| CNAME | `www` | `cname.vercel-dns.com` | WWW subdomain |
| TXT | `@` | Resend DKIM record | Email authentication |
| TXT | `resend._domainkey` (or similar) | Resend DKIM key | Email authentication |
| MX | `@` | (only if using Resend's inbound, otherwise skip) | Usually not needed for Resend outbound |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@ratchawatmuaythai.com` | DMARC policy |

Exact values will be provided by Vercel and Resend dashboards when you connect the domain.

### 5.3 Redirect 301 from old URLs
- In `next.config.js`, add redirects from the old WordPress URL structure to the new Next.js routes
- Example: `/contact-us` → `/contact`, `/muay-thai-programs` → `/programs`, etc.
- RD to map the old URLs using Google Search Console's old sitemap or Wayback Machine

---

## 6. Analytics + tracking

### 6.1 Google Analytics
- Old property: `G-SVH7KPWM2S` (from WordPress site)
- Decision: migrate to new property or keep? If keeping, add the tag to `src/app/layout.tsx`
- If migrating: create new GA4 property for the Next.js site

### 6.2 Google Search Console
- Add new property for `https://ratchawatmuaythai.com` (prefix, not domain verification) or verify via DNS
- Submit sitemap: `https://ratchawatmuaythai.com/sitemap.xml`
- Request re-crawl for important pages

### 6.3 Google Business Profile
- Two fiches to update:
  - Bo Phut location
  - Plai Laem location
- Replace website URL on both profiles with the new Next.js URL (same domain but ensure it's the canonical one)
- Update opening hours, phone, categories if needed

### 6.4 Social media (optional)
- Update Facebook, Instagram bio links to point at `/booking`
- Consider running a launch post driving traffic to the new site

---

## 7. Security hardening (Phase 5 items, verify before go-live)

These are tracked in the renumbered Phase 5 (Security & Quality), but verify each one before flipping the DNS.

- [ ] **Rate limiting** on `/api/checkout` and `/api/webhooks/stripe` (Vercel Edge Middleware or Upstash Redis)
- [ ] **CORS** config on API routes — only allow same-origin
- [ ] **Zod validation** hardening — every API route has explicit Zod validation (currently only `/api/checkout`)
- [ ] **Next.js audit fix**: GHSA-q4gf-8mx6-v5v3 (Next.js 16.0.0 DoS) — upgrade to `next@16.2.3` or later with `npm audit fix --force`
- [ ] **`/nextjs-security-scan`** skill — run full scan and address all critical + high findings
- [ ] **Lighthouse targets**: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100

---

## 8. Content — real photos

- All image placeholders currently use `ImagePlaceholder` component
- Client must deliver real photos for:
  - 6 standard room photos (accommodation page carousel)
  - 6 bungalow photos (accommodation page carousel)
  - Hero photos (home, camps, programs)
  - Trainer portraits (team page)
  - Gym action shots (gallery)
- Replace `<ImagePlaceholder>` with `<Image>` (next/image) with width, height, alt
- Add photos to `public/images/`
- Re-run Lighthouse to verify CLS stays under 0.1

---

## 9. Pre-launch smoke test (production)

Before announcing the launch publicly, run these checks against the production URL:

### 9.1 Booking flows
- [ ] `/booking/training` full flow with a **live Stripe test card** (there's a dedicated live-mode test card: see Stripe docs) — or run a small real transaction and refund it
- [ ] `/booking/private` full flow
- [ ] `/booking/fighter` full flow (all 3 tiers)
- [ ] `/booking/camp-stay` full flow
- [ ] Webhook delivers within 5 seconds of payment
- [ ] Client email arrives at test address
- [ ] Admin email arrives at `chor.ratchawat@gmail.com`

### 9.2 SEO
- [ ] `robots.txt` accessible
- [ ] `sitemap.xml` accessible and lists all pages
- [ ] Meta tags render correctly (test with https://metatags.io)
- [ ] Schema.org validates (test with https://validator.schema.org)

### 9.3 Performance
- [ ] Lighthouse score ≥ 90 on all key pages
- [ ] Core Web Vitals green
- [ ] Image optimization working (next/image)

### 9.4 Legal
- [ ] Privacy policy page exists (if collecting personal data via booking)
- [ ] Terms & conditions page exists
- [ ] Cookie notice (if tracking with analytics)

---

## 10. Rollback plan

If something breaks after going live:

1. **Immediate rollback:** in Vercel dashboard, promote the previous deployment
2. **DNS fallback:** temporarily point DNS back at Bluehost (WordPress still works)
3. **Stripe pause:** in Stripe Dashboard, **pause** the webhook endpoint to prevent failed delivery retries
4. **Communication:** post a note on Google Business Profile informing customers of a brief maintenance

Keep the Bluehost WordPress site live until at least 48 hours after the Next.js go-live, as a safety net.

---

## Sign-off

| Item | Date | By |
|------|------|----|
| All env vars set in Vercel production | | |
| Stripe live products seeded | | |
| Resend domain verified | | |
| Supabase production ready, test data cleaned | | |
| DNS pointing to Vercel | | |
| GSC verified, sitemap submitted | | |
| Smoke tests passed | | |
| Google Business Profiles updated | | |

---

## References

- `ARCHITECTURE.md` — system design
- `PROJET-STATUS.md` — correction history and known issues
- `ROADMAP.md` — phase sequencing
- `src/content/pricing.ts` — source of truth for prices and Stripe IDs
- `src/app/api/checkout/route.ts` — checkout session creation
- `src/app/api/webhooks/stripe/route.ts` — payment confirmation + email
- `src/lib/email/send.ts` — Resend sending logic and from-address switch
- `supabase/migrations/20260411000000_init.sql` — DB schema
