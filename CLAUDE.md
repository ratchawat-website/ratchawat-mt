@AGENTS.md

# Ratchawat Muay Thai -- Project Instructions

> **First actions in every session:**
> 1. Read `PROJECT-STATUS.md` -- state of the codebase (what is built)
> 2. Read `ROADMAP.md` -- current phase and tasks to do next
> 3. Read `ARCHITECTURE.md` -- before any backend or integration work

---

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (no Prettier in this project)
npm run test         # Vitest (vitest run)
npm run stripe:seed  # Seed Stripe products/prices (scripts/stripe-seed-products.ts)
```

---

## Architecture

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Framework        | Next.js 16 (App Router)                         |
| UI               | React 19                                        |
| Language         | TypeScript 5                                    |
| Styling          | Tailwind CSS v4                                 |
| Database / Auth  | Supabase                                        |
| Payments         | Stripe                                          |
| Email            | Resend                                          |

### Routing

- App Router only (`src/app/`)
- Every route gets its own folder with `page.tsx` and, when needed, `layout.tsx`
- Dynamic segments use `[slug]` convention
- API routes live under `src/app/api/`

### Project layout (key paths)

```
src/
  app/              # Routes and layouts (api/ = admin, availability, checkout, contact, visa, webhooks)
  components/
    ui/             # Design-system primitives (HeroSection, GlassCard, CTABanner, FAQAccordion...)
    sections/       # Page sections (ReviewsGrid, TeamGrid, TeamCircularGallery)
    layout/         # Navigation, Footer, Breadcrumbs
    booking/        # Booking wizards, calendars
    admin/          # Admin dashboard components
    seo/            # SchemaOrg.tsx, JsonLd.tsx
  lib/              # supabase/, stripe/, email/, booking/, seo/, validation/, security/, admin/, config/, utils/
  content/          # Single sources of truth: pricing.ts, stay-pricing.ts, schedule.ts, policies.ts, trainers.ts, reviews.ts
  styles/           # globals.css (design tokens)
  types/            # Shared TypeScript types
  proxy.ts          # Next.js 16 proxy (formerly middleware.ts)
public/
  images/
  llms.txt, llms-full.txt
supabase/migrations/
```

---

## Design System -- Ratchawat Bold

Bold/Modern, dark mode default, primary `#ff6600`, Barlow Condensed + Inter. Full rules in `.claude/rules/design-system.md` (loaded when editing `src/**/*.tsx` or `src/styles/`).

---

## Content & Language

- **Primary language:** English (en_US)
- **Translations:** French (FR) and Spanish (ES) planned

### Writing rules

- Run `/humanizer` on every piece of written copy before committing it.
- No em dashes. Use commas, periods, or parentheses instead.
- No unicode escape sequences in source files. Write characters directly.
- Keep sentences short and direct. This is a Muay Thai camp, not a luxury spa. The tone is energetic, welcoming, and no-nonsense.
- Use specific numbers whenever possible (prices in THB, class durations, distances).

---

## Key Integrations

| Service   | Purpose                 | Code location                          |
| --------- | ----------------------- | -------------------------------------- |
| Supabase  | Database, Auth, Storage | `src/lib/supabase/`                    |
| Stripe    | Payments, Booking       | `src/lib/stripe/`, `src/app/api/checkout/`, `src/app/api/webhooks/` |
| Resend    | Transactional email     | `src/lib/email/` (send.ts, templates/) |

### Authentication (Supabase Auth)

- Supabase handles sign-up, login, password reset.
- Protect booking and account routes with `src/proxy.ts` (Next.js 16 convention, formerly `middleware.ts`).
- Store the session server-side using Supabase SSR helpers.

### Supabase migrations (template required from 2026-10-30)

From **2026-10-30**, Supabase removes the default `public` schema grants. A new table without explicit `GRANT` statements is invisible to `supabase-js` and PostgREST.

Every new migration that creates a table in `public` includes:
1. `create table public.x (...)`
2. `alter table public.x enable row level security;`
3. Explicit `grant ...` per role (least privilege, no permissive `grant all to anon`)
4. RLS policies

Full template + examples: `ARCHITECTURE.md` section 6, "Migration template (mandatory from 2026-10-30)".

Existing tables keep their current grants. The 5 production tables (`bookings`, `availability_blocks`, `dtv_applications`, `profiles`, `processed_stripe_events`) are not affected.

---

## SEO & GEO (project specifics)

Generic SEO/GEO rules come from the global `seo-geo` rule. Project specifics:

- Metadata via `generatePageMeta()` from `src/lib/seo/meta.ts` (title <= 60 chars, description <= 155 chars). Required fields: `title`, `description`, `openGraph`, `alternates`.
- JSON-LD builders in `src/components/seo/SchemaOrg.tsx`; per-page schema type, keywords, and GEO passage text are in `AUDIT-SEO.md`.
- Sitemap: `src/app/sitemap.ts`. Robots: `src/app/robots.ts`. LLM files: `public/llms.txt` and `public/llms-full.txt`.
- All images use `next/image` with explicit `width`, `height`, and `alt`.
- Example citable passage: "Chor Ratchawat Muay Thai Gym is a training camp in Koh Samui, Thailand, with two locations in Bo Phut and Plai Laem. Drop-in sessions start at 500 THB."

---

## Blog

Blog is planned for a later phase. The route `/blog` is reserved. Don't build blog infrastructure yet, but keep the architecture flexible enough to add MDX-based blog posts later.

---

## Workflow: Page creation or modification

### Project skills (`.claude/skills/`)

| Skill | When to use |
|-------|-------------|
| `/humanizer` | After writing or modifying any visible text |
| `/tailwindcss-mobile-first` | Responsive design, breakpoints, mobile-first patterns |
| `/web-design-guidelines` | UX review, best practices |
| `/vercel-react-best-practices` | React / Next.js performance patterns |
| `/performance` | Lighthouse optimization, Core Web Vitals, lazy loading, bundle |
| `/accessibility` | Accessibility audit (target >= 95), ARIA, contrast, keyboard navigation |
| `/stripe-best-practices` | Stripe Checkout configuration, webhooks, products/prices |
| `/nextjs-security-scan` | Security audit before any deployment |

Use other available skills if the situation calls for it.

### Content audit workflow

When auditing existing pages, follow this order:

1. **Read** `PROJECT-STATUS.md` (reference facts) + the page to audit
2. **Read** `AUDIT-SEO.md` for that page's SEO strategy (keywords, meta, schemas, GEO passage) before modifying anything
3. **Fix** section by section (content, schemas, metadata, internal links)
4. **Run `/humanizer`** on all modified text
5. **Verify**: `npm run lint` (0 errors) + `npm run build` (0 errors)
6. **Document**: update `PROJECT-STATUS.md`, and `AUDIT-SEO.md` if the SEO strategy changed

### Visual consistency

- Study 2-3 similar existing pages before creating a new one, to follow their patterns.
- Reuse existing components (`HeroSection`, `GlassCard`, `CTABanner`, `ImagePlaceholder`, `FAQAccordion`, etc.) rather than creating new ones.
- Mobile-first: test at 375px minimum, use Tailwind breakpoints (`sm:`, `md:`, `lg:`).

### Page checklist (before marking a page "Done")

1. **SEO metadata** via `generatePageMeta()` (values from AUDIT-SEO.md)
2. **Breadcrumbs** -- `<Breadcrumbs>` component (adds JSON-LD automatically)
3. **Schema.org JSON-LD** -- at minimum `breadcrumbSchema`, plus the page's schema type from AUDIT-SEO.md
4. **GEO citable passage** -- exact text from AUDIT-SEO.md
5. **Internal linking** -- at least 3 links to other site pages (targets in AUDIT-SEO.md)
6. **CTA** -- page ends with a `<CTABanner>` pushing toward /booking or /pricing
7. **Sitemap** -- route included in `src/app/sitemap.ts`
8. **Navigation** -- added to `Navigation.tsx` and/or `Footer.tsx` if the page is important
9. **`llms.txt` / `llms-full.txt`** -- updated if the page adds significant content
10. **Images** -- `next/image` + alt; `ImagePlaceholder` with the correct category if no real image yet, otherwise in `public/images/`
11. Dark mode and mobile (375px+) render correctly, `/humanizer` run on all text
12. `npm run lint` and `npm run build` pass, Lighthouse targets met

---

## Lighthouse Targets

| Metric | Target |
|--------|--------|
| Performance | >= 90 |
| Accessibility | >= 95 |
| Best Practices | >= 90 |
| SEO | = 100 |
