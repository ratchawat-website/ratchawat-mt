---
paths:
  - "src/**/*.tsx"
  - "src/styles/**"
---

# Design System -- Ratchawat Bold

**Style:** Bold/Modern, dark mode default. Tokens live in `src/styles/globals.css`.

### Colors

| Token      | Value      |
| ---------- | ---------- |
| Primary    | `#ff6600`  |
| Surface    | `#0a0a0a`  |
| Text       | `#f5f5f5`  |

### Typography

| Role          | Font              | Notes                         |
| ------------- | ----------------- | ----------------------------- |
| Display/Titles| Barlow Condensed  | Bold weight, uppercase for hero headings |
| Body          | Inter             | Regular 400 / Medium 500      |

### Bold/Modern Rules

1. **Dark mode is the default.** Light surfaces are the exception, not the rule.
2. **No thin 1px borders.** Use 2px minimum or rely on background contrast to separate sections.
3. **Tight, punchy shadows** -- small offsets, strong opacity. No diffuse, luxe-style shadows.
4. **Bold typography** -- headings should feel heavy. Use font-bold or font-extrabold for titles.
5. **High contrast** -- text on dark backgrounds should pass WCAG AAA (7:1 ratio for body text).
6. **Accent color (#ff6600) for CTAs** -- buttons, links, and interactive elements use primary orange.
7. **No glass/blur on content surfaces.** `GlassCard` is opaque despite its name, so reuse it freely. Current exceptions in code: the floating `Navigation` bar (deliberate glassmorphism, 2026-04-02) and the cards in `TeamCircularGallery`.
   <!-- TODO(Rd): confirm whether the backdrop-blur in TeamCircularGallery.tsx is an intended exception or should be removed. -->
8. **Generous spacing** -- sections breathe with large padding, but avoid excessive whitespace that feels empty.
9. **Motion is minimal and purposeful** -- subtle fade-ins and micro-interactions only, no parallax or heavy animation.

### Component conventions

- Every UI component in `src/components/ui/` exports a single default component.
- Accept a `className` prop for style overrides (appended to the class string; there is no `cn()`/tailwind-merge in this project).
- Interactive components need visible focus states (outline with primary color).
