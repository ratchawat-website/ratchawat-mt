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

## Workflow -- Page Creation Checklist

When creating a new page, follow this checklist:

1. Create folder under `src/app/<route>/` with `page.tsx`
2. Export `metadata` with title, description, openGraph, alternates
3. Add JSON-LD structured data (appropriate schema type)
4. Include at least one GEO citable passage
5. Ensure all images use `next/image` with alt text
6. Test dark mode rendering (it is the default)
7. Verify mobile responsiveness (375px minimum)
8. Run `npm run lint` -- zero errors
9. Run `npm run build` -- zero errors
10. Lighthouse audit: Performance >= 90, Accessibility >= 95, Best Practices >= 90, SEO = 100
11. Update `PROJET-STATUS.md` with new page status

---

## Lighthouse Targets

| Metric          | Target |
| --------------- | ------ |
| Performance     | >= 90  |
| Accessibility   | >= 95  |
| Best Practices  | >= 90  |
| SEO             | = 100  |

---

## Final Verification

Before marking any page as "Done":

- [ ] Metadata complete (title, description, OG)
- [ ] JSON-LD present and valid
- [ ] GEO citable passage included
- [ ] All images optimized with next/image
- [ ] Dark mode renders correctly
- [ ] Mobile responsive (375px+)
- [ ] Lint passes
- [ ] Build passes
- [ ] Lighthouse targets met
- [ ] PROJET-STATUS.md updated
