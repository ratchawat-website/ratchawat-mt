# Ratchawat Muay Thai — Roadmap

> **Source of truth for what to build.** Read this at the start of every session alongside PROJECT-STATUS.md.
> Update task statuses as work progresses. Never start work without checking the current phase.

**Last updated:** 2026-09-24 (passe d'hygiène : Phases 1-8 archivées ; dernier changement produit : 2026-07-14, vagues 1 + 2a + 2b MERGÉES et DÉPLOYÉES en prod, seed Stripe LIVE fait)
**Current phase:** Post-launch — Brief cliente juillet 2026 **SHIPPED** (reste : archivage des anciens prix Stripe live + 4 confirmations cliente spec §7)

> **Phase ordering (post-Phase 4 restructure, 2026-04-15):** Before go-live we split the generic "Security & Quality" bucket into 4 sequential phases (5 → 8) so work happens in the right order. Go-live (Phase 9) is the FINAL phase, unblocked only when all content, media, SEO, and security/perf/a11y work is done. Do not skip ahead.

---

## Vague 1 — Fixes & Content, brief cliente juillet 2026

**Status:** SHIPPED 2026-07-14 — merged into main (via `feat/booking-v2-july`) and deployed to production
**Spec:** `docs/superpowers/specs/2026-07-10-brief-juillet-design.md` (sections 3 et 6)
**Plan:** `docs/superpowers/plans/2026-07-10-vague-1-fixes-and-content.md`

---

## Vague 2a — Réservation privée v2, brief cliente juillet 2026

**Status:** SHIPPED 2026-07-14 — merged into main and deployed to production (recette Rd faite : paiement réel test rejoué, emails reçus, 3 bugs trouvés et corrigés)
**Spec:** `docs/superpowers/specs/2026-07-10-brief-juillet-design.md` (section 4)
**Plan:** `docs/superpowers/plans/2026-07-10-vague-2a-private-booking-v2.md`

### Tasks (all done on branch)

- [x] Task 1 — Migration additive `booking_group_id` (bookings) + `units` (availability_blocks), MCP + miroir
- [x] Task 2 — Capacité 6 = coachs: `capacity` sur PriceItem, `getCapacityUnits`, `getSlotOccupancy` somme les units, 3 writers
- [x] Task 3 — 19 créneaux (pas de 30 min), `SLOT_GROUPS`, cutoff 12h avant 09:30, horaires publiés 20:00
- [x] Task 4 — Bornes participants par package (solo 1-6, groupe 2-3, pack 1), sélecteur à l'étape Session type, validation partout
- [x] Task 5 — Checkout multi-sessions (Zod `sessions`, N bookings groupés, rollback, 1 paiement Stripe)
- [x] Task 6 — Webhook completed/expired par groupe
- [x] Task 7 — Panier de sessions dans le wizard privé, calendrier en unités (`unitsRequested`)
- [x] Task 8 — Emails multi-sessions (2 templates)
- [x] Task 9 — Admin: drawer en unités, sessions sœurs, annulation par session
- [x] Task 10 — Page /booking/confirmed multi-sessions
- [x] Task 11 — Recette E2E complète (voir PROJECT-STATUS 2026-07-14) + purge + docs

### Handoff

Vérification manuelle restante pour Rd: annulation admin d'une session d'un panier en UI (logique vérifiée par code), et rendu visuel du wizard (grille groupée, panier) à 375px.

---

## Vague 2b — Hébergement par paliers à dates libres, brief cliente juillet 2026

**Status:** SHIPPED 2026-07-14 — merged into main and deployed to production. Seed LIVE done (Accommodation Stay `prod_UskxQSrmezEJNQ`, 10-pack, prix syncés). Smoke prod auto vérifié (montants /pricing, /accommodation, /booking + route stay protégée par Turnstile).
**Spec:** `docs/superpowers/specs/2026-07-10-brief-juillet-design.md` (section 5)
**Plan:** `docs/superpowers/plans/2026-07-10-vague-2b-accommodation-tiers.md`

### Tasks (all done on branch)

- [x] Task 1 — Grille tarifaire `src/content/stay-pricing.ts` (4 rate cards, paliers, source unique)
- [x] Task 2 — `computeStayPrice` par paliers (TDD, matrice spec §5.2, anomalie 29/30 nuits assumée)
- [x] Task 3 — Inventaire: mapping `stay-*` + ids historiques conservés (tests)
- [x] Task 4 — Endpoint `/api/checkout/stay` (Zod, recalcul serveur, Stripe `price_data`, fallback `stayLabelFromPriceId` emails/confirmed/admin)
- [x] Task 5 — `DateRangePicker` + `StayCalendar` (mode range, occupation 180j, minNights, nuits pleines)
- [x] Task 6 — Product Stripe permanent « Accommodation Stay » (TEST seedé) + 6 forfaits `archived: true`
- [x] Task 7 — CampStayWizard à dates libres avec devis live
- [x] Task 8 — FighterWizard: tiers stay à dates libres, Fighter Only inchangé
- [x] Task 9 — Admin: type « Accommodation Stay » (unit/plan/dates, prix auto éditable), API revalide
- [x] Task 10 — /accommodation, /pricing, /booking, llms lisent la grille (0 montant séjour en dur)
- [x] Task 11 — Recette API (montants Stripe vérifiés, 409, minimums), purge, nettoyage AvailabilityCalendar, docs

### Deployment checklist vague 2b (STRICT order — rien mergé ni pushé)

1. [x] Rd reviews the diff (recette manuelle Rd 2026-07-14, 3 bugs corrigés)
2. [x] Seed LIVE done 2026-07-14 (`prod_UskxQSrmezEJNQ`), diff commité (`5367d0d`)
3. [x] Merged + deployed 2026-07-14 (fast-forward `1004ca4..5367d0d`)
4. [ ] Prod smoke test visuel (Rd): camp-stay wizard room 10 nights → quote 11,420 and Stripe page shows the same amount (do NOT pay); private wizard 2-session cart up to the Stripe page (do NOT pay); admin drawer in units. (Montants des pages + route stay déjà vérifiés automatiquement.)
5. [ ] Rappels post-merge: les 4 confirmations cliente du spec §7 restent ouvertes (prix groupe 2 vs 3, groupe kids, délai DTV, tarif nuit supp bungalow) — chaque réponse = simple édition de `stay-pricing.ts`/config + redéploiement

### Tasks (all done on branch)

- [x] Task 1 — vitest infra (`npm run test`, 11 tests)
- [x] Task 2 — Bug B1: shared capacity helper `src/lib/booking/capacity.ts`, admin creation respects 6/camp
- [x] Task 3 — Bug B4: insert-then-verify closes the last-slot race in `/api/checkout`
- [x] Task 4 — Bug B3: expired payment frees the private slot block
- [x] Task 5 — Bug B2: WhatsApp box always visible on the private wizard date step
- [x] Task 6 — `billing: per-person | flat` + shared `computeBookingAmount`/`getStripeQuantity`
- [x] Task 7 — Private adult rates 2026: solo 1,000 / 10-pack 9,000 flat (new) / group 1,400 flat
- [x] Task 8 — Stripe seed price-sync pass (old prices kept active, zero-downtime cutover), run in TEST
- [x] Task 9 — DTV unlimited 35,000 THB + client-verbatim policies (`src/content/policies.ts`) + custom-plan WhatsApp box
- [x] Task 10 — DTV `date_of_birth` (migration + form + API + webhook + emails + admin)
- [x] Task 11 — Plai Laem exclusive facilities paragraph, "Standard Room" card titles, policies on 3 wizards + BookingConfirmed email
- [x] Task 12 — Price dedup: /pricing + /programs/private + schemas + llms read pricing.ts
- [x] Task 13 — E2E recette (amounts, capacity 409, expired cleanup, DTV dob) + test data purged + docs

### Deployment checklist (STRICT order — nothing merged or pushed yet)

1. [x] Diff reviewed (recette Rd 2026-07-14)
2. [x] Seed LIVE done 2026-07-14 (10-pack + prices 1000/1400/35000, old prices kept active)
3. [x] Merged + deployed 2026-07-14
4. [x] Prod smoke test 2026-07-14: /pricing serves 1,000/9,000/1,400/35,000 (auto-vérifié)
5. [ ] POST-deploy only: archive the old LIVE prices (solo 800, group 600, dtv unlimited 33000) in the Stripe dashboard. Non-urgent, cosmetic.

Rollback = revert the PR. Old prices stay active until step 5, so a revert restores a 100% functional site immediately.

---

## Phases 1 à 8 (closes, 2026-04)

Archivées dans `docs/archive/2026-09-24-roadmap-archive.md`. Items encore ouverts reportés de la Phase 8 :

- [ ] **Rate limiting on `/api/*`** — DEFERRED to post-launch. Needs Upstash Redis or Vercel KV; low traffic at launch, security headers + Zod + honeypot mitigate the main spam vectors.
- [ ] **CORS on `/api/*`** — Next.js defaults to same-origin for API routes; explicit policy not required at this stage.

---

## Phase 9 — Go-live

**Status:** ✅ DONE (2026-05-02)
**Goal:** Site live at ratchawatmuaythai.com.
**Blocker:** Phases 5, 6, 7, 8 all complete.
**Reference:** **`GO-LIVE-CHECKLIST.md`** at the project root is the authoritative pre-launch checklist.

### Current state (2026-05-02)

Site is **LIVE** at `https://ratchawatmuaythai.com` with valid SSL. All booking types and DTV flow validated in production with real cards. Stripe LIVE mode active. Domain transfer Bluehost → Cloudflare completed and renewed past 2026-05. Legal pages (`/privacy`, `/terms`) finalized with the registered entity CHOR:RATCHAWAT CO., LTD, indexed and added to sitemap. Google Business Profile updated on both listings. 48h post-launch monitoring done with no regressions. Pre-launch security hardening shipped (commit `06d9247`): Cloudflare Turnstile on all public forms, CSP, host header injection closed, JsonLd `</script>` escape, Zod on `/api/admin/availability`.

Outstanding (non-blocking, internal hygiene): Lighthouse + cross-browser + screen reader passes on prod (Section G), and the formal rollback-plan write-up in `GO-LIVE-CHECKLIST.md` §10.

### A. Infrastructure — accounts & external services

- [x] **Cloudflare account created** (2026-04-27) with `ratchawat.website@gmail.com` + 2FA active.
- [x] **Vercel account created** (2026-04-27) with `ratchawat.website@gmail.com` + 2FA. Repo `ratchawat-mt` connected, first deploy live on `*.vercel.app` URL.
- [x] **Resend account + domain verification** — `ratchawatmuaythai.com` verified on Resend (DKIM/SPF/DMARC records added in Cloudflare DNS, validated 2026-04-28). Sending from `contact@ratchawatmuaythai.com` works in prod (no longer sandbox).
- [x] **Stripe LIVE mode** activated. LIVE secret + publishable keys generated.
- [x] **Stripe LIVE webhook endpoint** created, pointing to Vercel URL. Signing secret captured.
- [x] **Stripe LIVE products seeded** (2026-04-28) — 24 products created in LIVE Stripe account. Refactored `pricing.ts` schema to dual-mode: split `stripeProductId`/`stripePriceId` into parallel `*Test` + `*Live` fields. New helpers `isStripeLiveMode()`, `getStripePriceId(item)`, `getStripeProductId(item)` detect mode via `STRIPE_SECRET_KEY` prefix and return matching IDs. `/api/checkout` and `/api/visa/dtv/apply` updated to use the helper. Seed script auto-detects mode and writes to correct field. Local dev with TEST keys + Vercel prod with LIVE keys now coexist without manual swap.

### B. Domain transfer (Bluehost → Cloudflare)

- [x] Obtained EPP/auth code from previous developer (2026-04-27).
- [x] Domain unlocked at Bluehost (2026-04-27).
- [x] Cloudflare nameservers (`damiete` + `michelle`) replaced Bluehost nameservers (2026-04-27).
- [x] Cloudflare registrar transfer initiated + paid ~$10.44 (2026-04-28).
- [x] **Bluehost release confirmed** + transfer completed at Cloudflare (2026-05-02).
- [x] Domain renewed to push expiry past 2026-05 (auto-renew was cancelled by ex-dev; manual renew done 2026-05-02).

### C. DNS records (Cloudflare → Vercel) ✅ DONE 2026-04-28

- [x] `A` record `@` → Vercel IP, proxy **DNS only** (grey cloud).
- [x] `CNAME` record `www` → `cname.vercel-dns.com`, proxy **DNS only**.
- [x] Vercel project settings: `ratchawatmuaythai.com` + `www.ratchawatmuaythai.com` added as production domains.
- [x] SSL certificate issued by Let's Encrypt via Vercel.
- [x] `https://ratchawatmuaythai.com` serves the site, www → apex redirect working.

### D. Vercel environment variables (production)

- [x] `NEXT_PUBLIC_SITE_URL=https://ratchawatmuaythai.com`
- [x] `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` + `SUPABASE_SERVICE_ROLE_KEY`
- [x] `STRIPE_SECRET_KEY` (LIVE), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (LIVE), `STRIPE_WEBHOOK_SECRET` (LIVE)
- [x] `RESEND_API_KEY`
- [x] `RESEND_FROM_EMAIL=Ratchawat Muay Thai <contact@ratchawatmuaythai.com>` (added 2026-04-28 after domain verification)
- [x] `ADMIN_EMAIL=chor.ratchawat@gmail.com` (final value, not RD's dev address)
- [ ] Optional: `RESEND_BOOKINGS_FROM=Ratchawat Muay Thai <bookings@ratchawatmuaythai.com>` if separate sender for booking confirmations is desired.

### E. Code-level fixes during go-live

- [x] **`/api/contact` — env-driven config** (2026-04-28): `RESEND_FROM_EMAIL` + `ADMIN_EMAIL` now read from env, with `replyTo` set to visitor email; admin send error now bubbles up as 500 (was silently swallowed).
- [x] **`/lib/email/send.ts` — env-driven config** (2026-04-28): cascade `RESEND_BOOKINGS_FROM` → `RESEND_FROM_EMAIL` → NODE_ENV fallback. Eliminates hardcoded `bookings@` and the dev/prod NODE_ENV branch when env vars are set.

### F. Pre-launch validation (production environment)

- [x] **Stripe webhook LIVE delivery validated** (2026-04-28) — note: Stripe Dashboard does not expose a "Send test event" button in LIVE mode, so validation was done via a real-card payment. Drop-in 400 THB booking → webhook fired → booking transitioned to `confirmed` in Supabase → 200 OK in Stripe webhook attempts log → emails delivered → refunded via Dashboard.
- [x] **Real-card booking smoke test (training type)** (2026-04-28) — drop-in 400 THB validated end-to-end + refunded.
- [ ] **Remaining booking types smoke test** — private, fighter, camp-stay still untested with real cards. Each requires a real card + refund cycle.
- [ ] **DTV application smoke test** — submit form, complete payment, verify `dtv_applications` row + admin notification + client confirmation.
- [ ] **Contact form smoke test** on production domain (`https://ratchawatmuaythai.com/contact`).
- [ ] **Admin login** on `https://ratchawatmuaythai.com/admin/login` with real admin user.

### G. Pre-launch validation (deferred from Phase 8)

- [ ] **Live Lighthouse run** on production URL — targets Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90, SEO = 100.
- [ ] **Live cross-browser test** — iPhone Safari, Android Chrome, desktop Safari/Chrome/Firefox, throttled 3G.
- [ ] **Live screen reader test** — VoiceOver + NVDA on /, /booking, /contact, /accommodation.

### H. Data & content cleanup

- [x] **Clean Supabase test data** (2026-04-28) — purged 4 bookings + 5 availability_blocks + 5 processed_stripe_events. `dtv_applications` already empty. `profiles` (1 admin row) preserved. Production database now clean.
- [x] **Real legal content validated and indexed** (2026-05-02, commit `5009efb`) — `/privacy` and `/terms` updated with the registered legal entity `CHOR:RATCHAWAT CO., LTD`, registered office address (20, 33 Moo 5 Soi Plai Laem 13, Tambon Bo Put, Koh Samui, Surat Thani 84320), unified cancellation policy (no cash refund → 12-month training voucher valid at both camps, aligned with the DTV refusal rule), payment options (cash + Wise/bank transfer accepted on every booking type). `noIndex` removed, both URLs added to `sitemap.ts`.

### I. Search & analytics

- [x] **Google Search Console** (2026-04-28) — property added, sitemap `https://ratchawatmuaythai.com/sitemap.xml` submitted by user.
- [~] **Google Analytics** — DEFERRED. Decision: not added at launch (privacy-first stance, can be added later if needed).
- [x] **301 redirects** (2026-04-28) — 24 legacy WordPress URLs routed to current pages via `next.config.ts redirects()`. Each entry registered with and without trailing slash. Targets corrected for routes that no longer exist on the new site (`/services` → `/programs`, `/transportation-solutions` + `/health-insurance` → `/contact`, `/blog` family → `/`, `/gallery` → `/`).
- [x] **robots.txt hardening** (2026-04-28) — added legacy WordPress paths to disallow list (`/wp-admin/`, `/wp-content/`, `/wp-includes/`, `/wp-json/`, `/xmlrpc.php`, `/feed/`, `/?s=`, `/search`) on top of existing app-specific disallows.
- [x] **Google Business Profile updated** (2026-05-02) — both Bo Phut and Plai Laem listings now point to `https://ratchawatmuaythai.com` with the canonical NAP and current hours.

### J. Post-launch

- [x] **48h monitoring done** (2026-05-02) — Vercel logs, Stripe events, Resend deliverability, and Supabase advisors checked over the 48h window after launch. No regressions, no anomalies.
- [ ] **Rollback plan ready** — checklist §10 documented, Cloudflare DNS revert path confirmed.

### Success criteria

Site accessible at ratchawatmuaythai.com over HTTPS. All 4 booking flows + DTV + contact form confirmed working with real card on production. All sign-off rows in `GO-LIVE-CHECKLIST.md` checked.
