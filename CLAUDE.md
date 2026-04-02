# Ratchawat Muay Thai -- Project Instructions

> **First action in every session:** read `PROJET-STATUS.md` at project root to know exactly where the project stands.

---

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # ESLint + Prettier check
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
  app/              # Routes and layouts
  components/
    ui/             # Design-system primitives (Button, Card, Badge...)
    sections/       # Page sections (Hero, Pricing, FAQ...)
    layout/         # Header, Footer, Nav
  lib/
    supabase/       # Supabase client + helpers
    stripe/         # Stripe client + helpers
    utils/          # Shared utilities
  content/          # Static content / copy (JSON or MDX)
  types/            # Shared TypeScript types
public/
  images/
  fonts/
```

---

## Design System -- Ratchawat Bold

**Style:** Bold/Modern, dark mode default.

### Colors

| Token      | Value      |
| ---------- | ---------- |
| Primary    | `#ff6600`  |
| Surface    | `#0a0a0a`  |
| Text       | `#f5f5f5`  |

### Typography

| Role          | Font              | Notes                         |
| ------------- | ----------------- | ----------------------------- |
| Display/Titles| Outfit            | Bold weight, uppercase for hero headings |
| Body          | Plus Jakarta Sans | Regular 400 / Medium 500      |

### Bold/Modern Rules

1. **Dark mode is the default.** Light surfaces are the exception, not the rule.
2. **No thin 1px borders.** Use 2px minimum or rely on background contrast to separate sections.
3. **Tight, punchy shadows** -- small offsets, strong opacity. No diffuse, luxe-style shadows.
4. **Bold typography** -- headings should feel heavy. Use font-bold or font-extrabold for titles.
5. **High contrast** -- text on dark backgrounds must pass WCAG AAA (7:1 ratio minimum for body text).
6. **Accent color (#ff6600) for CTAs** -- buttons, links, and interactive elements use primary orange.
7. **No glass/blur effects.** No backdrop-blur, no frosted glass.
8. **Generous spacing** -- sections breathe with large padding, but avoid excessive whitespace that feels empty.
9. **Motion is minimal and purposeful** -- subtle fade-ins and micro-interactions only, no parallax or heavy animation.

### Component conventions

- Every UI component in `src/components/ui/` exports a single default component.
- Use `className` prop for style overrides (Tailwind merge via `cn()` utility).
- All interactive components must have visible focus states (outline with primary color).

---

## Content & Language

- **Primary language:** English (en_US)
- **Translations:** French (FR) and Spanish (ES) planned
- **Locale:** `en_US`

### Writing rules

- Every piece of written copy must pass through `/humanizer` before being committed. No exceptions.
- Never use em dashes (--). Use commas, periods, or parentheses instead.
- Never use unicode escape sequences in source files. Write characters directly.
- Keep sentences short and direct. This is a Muay Thai camp, not a luxury spa. The tone is energetic, welcoming, and no-nonsense.
- Use specific numbers whenever possible (prices in THB, class durations, distances).

---

## Key Integrations

| Service   | Purpose              | Code location              |
| --------- | -------------------- | -------------------------- |
| Supabase  | Database, Auth, Storage | `src/lib/supabase/`     |
| Stripe    | Payments, Booking    | `src/lib/stripe/`          |
| Resend    | Transactional email  | `src/app/api/contact/`     |

### Authentication (Supabase Auth)

- Auth is enabled. Supabase handles sign-up, login, password reset.
- Protect booking and account routes with middleware (`src/middleware.ts`).
- Store the session server-side using Supabase SSR helpers.

---

## SEO

### Technical SEO

- Every page must export `metadata` (or `generateMetadata` for dynamic routes).
- Mandatory fields: `title`, `description`, `openGraph`, `alternates`.
- Structured data (JSON-LD) on every page: Organization, LocalBusiness, or specific schema.
- Sitemap generated automatically via `src/app/sitemap.ts`.
- Robots.txt via `src/app/robots.ts`.
- All images use `next/image` with explicit `width`, `height`, and `alt`.

### GEO Methodology

Every page must include a "citable passage" for AI search engines. Format:

- 2-3 factual sentences answering a likely search query
- Include: business name, location, specific numbers (prices, ratings, hours)
- Place in a visible `<p>` or `<section>`, not hidden
- Example: "Chor Ratchawat Muay Thai Gym is a training camp in Koh Samui, Thailand, with two locations in Bo Phut and Plai Laem. Drop-in sessions start at 500 THB."

### GEO assets

- `public/llms.txt` -- plain-text summary of the site for LLM crawlers
- Every page contains at least one citable passage (see format above)
- Structured data enriched with `sameAs`, `geo`, `areaServed` properties

---

## Blog

Blog is planned for a later phase. The route `/blog` is reserved. Do not build blog infrastructure yet, but keep the architecture flexible enough to add MDX-based blog posts later.

---

## Workflow: Page creation or modification

### Required skills

Activate the relevant skills systematically when creating or modifying any page:

| Skill | When to use |
|-------|-------------|
| `/humanizer` | After writing or modifying any visible text |
| `/ui-ux-pro-max` | UI/UX design decisions, component choices, layout |
| `/frontend-design` | Building frontend components and pages |
| `/tailwindcss-mobile-first` | Responsive design, breakpoints, mobile-first patterns |
| `/web-design-guidelines` | Accessibility audit, UX review, best practices |
| `/seo` (and sub-skills) | Technical SEO, schemas, content quality |
| `/seo-schema` | Detect, validate, generate Schema.org JSON-LD |
| `/seo-content` | Content quality, E-E-A-T, readability, thin content |
| `/seo-page` | Deep single-page SEO analysis |
| `/seo-technical` | Crawlability, indexability, Core Web Vitals |
| `/seo-geo` | AI Overviews, GEO optimization, llms.txt |
| `/seo-local` | Local SEO for both gym locations |
| `/seo-hreflang` | Hreflang validation for EN/FR/ES |
| `/seo-sitemap` | Sitemap validation and generation |
| `/seo-images` | Image alt text, sizes, formats, lazy loading |
| `/seo-performance` | Core Web Vitals measurement |
| `/context7` | Up-to-date library documentation (Next.js, React, Tailwind, Supabase, Stripe) |
| `/performance` | Lighthouse optimization, Core Web Vitals, lazy loading, bundle |
| `/accessibility` | Accessibility audit (target >= 95), ARIA, contrast, keyboard navigation |
| `/nextjs-app-router-patterns` | Advanced App Router patterns, SSG/SSR, metadata, caching |
| `/supabase-postgres-best-practices` | Supabase connection, tables, RLS, migrations, queries |
| `/stripe-best-practices` | Stripe Checkout configuration, webhooks, products/prices |
| `/prd` | Generate Product Requirements Documents when needed |
| `/find-skills` | Search and install new skills from the ecosystem |

All skills listed above are pre-installed globally in `~/.claude/skills/`. No per-project installation needed.

**Marketplace plugins** (auto-detected, no installation):
- `/ui-ux-pro-max` -- UI/UX design intelligence (50+ styles, 161 palettes, 57 font pairings)
- `/frontend-design` -- Production-grade frontend interfaces
- `/context7` -- Up-to-date library documentation (MCP server)

Do not hesitate to use other skills if the situation requires it.

### Content audit workflow

When auditing existing pages, follow this mandatory order:

1. **Read** `PROJET-STATUS.md` (reference facts) + the page to audit
2. **Read** `AUDIT-SEO.md` for that page's SEO strategy (keywords, meta, schemas, GEO passage)
3. **Run `/seo`** (or sub-skills) **BEFORE any modification**. This is mandatory, not optional.
4. **Fix** section by section (content, schemas, metadata, internal links)
5. **Run `/humanizer`** on all modified text
6. **Verify**: `npm run lint` (0 errors) + `npm run build` (0 errors)
7. **Document**: update `PROJET-STATUS.md` (mark page as Done, add correction history entry)
8. **Commit** with descriptive message

### Visual consistency

- **Always study existing pages** before creating new ones. Read 2-3 similar pages to understand the patterns.
- Reuse existing components (`HeroSection`, `GlassCard`, `CTABanner`, `ImagePlaceholder`, `FAQAccordion`, etc.) -- do not create new ones unless truly necessary.
- Respect the "Ratchawat Bold" design system: CSS tokens in `src/styles/globals.css`, typography Outfit + Plus Jakarta Sans, no 1px borders, dark mode default.
- Mobile-first: test at 375px minimum, use Tailwind breakpoints (`sm:`, `md:`, `lg:`).

### Page creation checklist

Each new page MUST include:

1. **SEO Metadata** -- via `generatePageMeta()` from `src/lib/seo/meta.ts` (title <= 60 chars, description <= 155 chars, from AUDIT-SEO.md)
2. **Breadcrumbs** -- `<Breadcrumbs>` component with automatic JSON-LD
3. **Schema.org JSON-LD** -- at minimum `breadcrumbSchema`, plus relevant schemas (see AUDIT-SEO.md for each page's schema type) via `src/components/seo/SchemaOrg.tsx`
4. **GEO citable passage** -- exact text provided in AUDIT-SEO.md per page
5. **Internal linking** -- each page must contain at least 3 links to other site pages (targets specified in AUDIT-SEO.md)
6. **CTA** -- each page ends with a `<CTABanner>` pushing toward /booking or /pricing
7. **Sitemap** -- verify the route is included in `src/app/sitemap.ts`
8. **Navigation** -- add to `Navigation.tsx` and/or `Footer.tsx` if the page is important
9. **`llms.txt` / `llms-full.txt`** -- update if the page adds significant content
10. **Images** -- use `ImagePlaceholder` with the correct category if no real image, or place the image in `public/images/`

---

## Lighthouse Targets

| Metric | Target |
|--------|--------|
| Performance | >= 90 |
| Accessibility | >= 95 |
| Best Practices | >= 90 |
| SEO | = 100 |

---

## MANDATORY RULE: Documentation of changes

**Each agent MUST, after completing a task or significant step:**

1. **Update `PROJET-STATUS.md`** -- mark pages as Done, add correction history entry, update known issues
2. **Update `CLAUDE.md`** if workflow, architecture, or conventions changed
3. **Update `AUDIT-SEO.md`** if SEO strategy was modified
4. **Commit** with a descriptive message

Never consider a task complete until documentation is updated. This allows any future agent to resume work without loss of context.

---

## Final Verification

Before marking any page as "Done":

- [ ] Metadata complete (title, description, OG) from AUDIT-SEO.md
- [ ] JSON-LD present and valid (schema type from AUDIT-SEO.md)
- [ ] GEO citable passage included (text from AUDIT-SEO.md)
- [ ] Breadcrumbs component present
- [ ] Internal links (minimum 3)
- [ ] CTABanner at page bottom
- [ ] All images optimized with next/image + alt text
- [ ] Dark mode renders correctly
- [ ] Mobile responsive (375px+)
- [ ] `/humanizer` run on all text
- [ ] `npm run lint` passes (0 errors)
- [ ] `npm run build` passes (0 errors)
- [ ] Lighthouse targets met
- [ ] `PROJET-STATUS.md` updated (page marked Done, history entry added)
- [ ] Committed with descriptive message
