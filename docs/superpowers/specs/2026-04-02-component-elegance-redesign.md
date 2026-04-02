# Component Elegance Redesign — Design Spec

**Date:** 2026-04-02
**Status:** Approved
**Scope:** All UI components + inline section patterns across 20 pages

---

## 1. Design Philosophy

Evolve the existing "Ratchawat Bold" design system toward a more elegant and professional feel while maintaining the dark-mode-first, high-contrast identity. The changes are additive refinements, not a redesign from scratch.

### Core Visual Language

Every card and section on the site shares these traits:

| Element | Treatment |
|---------|-----------|
| **Top line** | `linear-gradient(90deg, transparent, #ff660040, transparent)` — 2px, intensifies on hover/active |
| **Left border** | 2px solid `#ff660040` — intensifies to `#ff6600` on hover/active |
| **Bottom border** | 2px solid `#222` — transitions to `#ff6600` on hover/active |
| **Hover** | `translateY(-2px)` + shadow `0 8px 30px rgba(0,0,0,0.4)` + borders intensify |
| **Filigree numbers** | Barlow Condensed, 36-48px, `rgba(255,102,0,0.12)` — present on numbered items |
| **Category labels** | Orange line (32px wide, 2px) + uppercase text, letter-spacing 3px, `#ff6600` |
| **Animations** | fade-in + slide-up sequential on scroll (500ms ease-out, staggered per item) |

### Badge System Change

Replace pill badges (background tinted) with **underline badges**:
- Text: uppercase, letter-spacing 1.5px, font-weight 600
- Underline: 1.5px solid, color matches text (orange for level, green for status, gray for neutral)
- No background fill

---

## 2. Component Specifications

### 2.1 HeroSection

**Direction:** Centered Bold + Outline

- Background: `radial-gradient(ellipse at center bottom, #1a1200 0%, #0a0a0a 60%)` (warm orange/black gradient)
- Subtle grid overlay: `linear-gradient(rgba(255,102,0,0.03) 1px, transparent 1px)` at 60px intervals
- Top accent bar: 60px wide, 3px, centered, `#ff6600`
- Layout: centered vertically and horizontally
- Kicker: uppercase, letter-spacing 4px, `#ff6600`, "Koh Samui, Thailand"
- Title line 1: Barlow Condensed, 56px (lg) / 48px (md) / 36px (sm), bold, `#f5f5f5`, "RATCHAWAT"
- Title line 2: same size, `transparent` fill with `-webkit-text-stroke: 1.5px #ff6600`, "MUAY THAI"
- Description: `#999`, 15px, max-width 480px, centered
- Two buttons:
  - Primary: "Start Training" — standard primary button style
  - Ghost: "View Pricing" — 1.5px border `#333`, color `#999`, hover border `#ff6600` + text `#f5f5f5`
- Bottom decorative: centered "Est. 2018" with 40px lines on each side, `#333`
- Entry animation: staggered fade-in + slide-up (kicker → title → desc → buttons)

### 2.2 GlassCard

**Direction:** Numbered + Top Glow Line (C+B hybrid)

- Background: `#1a1a1a`, border-radius `0.5rem`
- Top line: `linear-gradient(90deg, transparent, #ff660040, transparent)`, 2px — intensifies to `#ff6600` on hover
- Top glow on hover: `radial-gradient(ellipse, rgba(255,102,0,0.08), transparent)`, 120px wide, 60px tall, centered at top
- Left border: 2px solid `#ff660040` — intensifies to `#ff6600` on hover
- Bottom border: 2px solid `#222` — transitions to `#ff6600` on hover
- Filigree number: Barlow Condensed, 48px, bold, `rgba(255,102,0,0.12)` — intensifies to `0.2` on hover
- Hover: `translateY(-2px)`, shadow `0 8px 30px rgba(0,0,0,0.4)`, 300ms transition
- Padding: `p-6 sm:p-8`
- Bottom section: metadata (level, duration) + arrow, separated by top border `1px solid #222`
- Arrow: `→` in `#ff6600`, translateX(4px) on hover

**Props addition:**
- `number?: string` — filigree number to display (e.g., "01")
- `showTopLine?: boolean` — default true
- `showLeftBorder?: boolean` — default true

### 2.3 CTABanner

**Direction:** Warm Glow Center

- Full-width section, `py-16 sm:py-20`
- Background: `linear-gradient(180deg, #0a0a0a 0%, #1a1200 50%, #0a0a0a 100%)`
- Top line: 60px centered, `linear-gradient(90deg, transparent, #ff6600, transparent)`, 2px
- Bottom line: same
- Kicker label: uppercase, letter-spacing 4px, `#ff6600`, "Ready to train?"
- Title: Barlow Condensed, 36px (lg) / 30px (md) / 24px (sm), bold, centered
- Description: `#777`, 14px, max-width 460px, centered
- Two buttons centered:
  - Primary: "Book a Session →"
  - Ghost: "View Pricing"
- Entry animation: fade-in on scroll

### 2.4 FAQAccordion

**Direction:** Numbered Accent

- Items: `space-y-3`
- Each item: `#1a1a1a` background, `rounded-card`, overflow hidden
- Top line: gradient (dim when closed, bright when open)
- Left border: 2px `#ff660040` (closed) → `#ff6600` (open)
- Button layout: flex, items-center, gap 16px
  - Filigree number: 28px, `rgba(255,102,0,0.15)` → `0.3` when open
  - Question text: Barlow Condensed, 16px, semibold, `#f5f5f5` → `#ff6600` when open
  - Toggle icon: `+` / `−` in `#ff6600`, 18px
- Answer: padding-left aligned with question text (72px from left), `#999`, 13px, leading-relaxed
- Transition: max-height + opacity, 300ms

### 2.5 ProgramCard

**Direction:** GlassCard Extended (no icon square)

- Inherits full GlassCard system (number, top line, left border, bottom border, hover)
- Icon: direct emoji/Lucide icon, `#ff6600`, no background square, `mb-4`
- Title: Barlow Condensed, 20px, bold, uppercase
- Description: `#999`, 12px, leading-relaxed
- Badges: underline style (no background)
- Bottom: "Learn more" + arrow, separated by top border
- Mobile behavior: horizontal scroll slider (overflow-x-auto, snap-x, snap-mandatory)
  - Cards: `min-w-[280px]`, `snap-center`
  - Scrollbar hidden (`scrollbar-hide`)

### 2.6 ContactForm

**Direction:** System Card

- Wrapped in GlassCard (top line + left border + bottom border, hover disabled)
- Kicker: orange line 32px + "Get in touch" uppercase
- Title: "SEND US A MESSAGE", Barlow Condensed, 24px, bold
- Labels: 10px, uppercase, letter-spacing 2px, `#666`
- Inputs: `#111` background, 2px border `#222`, radius 6px, padding 12px 16px
- Focus state: border `#ff6600`, `box-shadow: 0 0 0 1px rgba(255,102,0,0.1)`
- Submit button: full-width, primary style, "Send Message →"
- Error: `bg-red-900/20`, border `red-900/40`, text `red-400`
- Success: green check icon, centered confirmation

### 2.7 LocationCard

**Direction:** Media System Card

- GlassCard wrapper (top line + left border + bottom border + hover)
- Map zone: top area, aspect-video, rounded top corners
- "Open Now" badge: overlay on map, bottom-left, green dot + uppercase text, bg `rgba(0,0,0,0.6)`
- Info section: padding 20px
  - Name: Barlow Condensed, 20px, bold, uppercase
  - Info list: space-y-3, icon (emoji, `#ff6600`) + text (`#999`, 12px)
- Bottom: separator 1px `#222` + "View camp details →" in `#ff6600`

### 2.8 ScheduleTable

**Direction:** Dual Render (Pill Table desktop + Day List mobile)

**Desktop (hidden below md):**
- GlassCard wrapper (top line + left border + bottom border)
- Table headers: 9px uppercase, letter-spacing 2px, `#ff6600`, bold
- Time cells: Barlow Condensed, 13px, semibold
- Active cells: pills with tinted background by type:
  - Group: `rgba(255,102,0,0.1)`, text `#f5f5f5`
  - Private: `rgba(34,197,94,0.1)`, text `#22c55e`
  - Fighter: `rgba(255,102,0,0.15)`, text `#ff6600`
- Empty cells: `#333` em-dash
- Row separators: 1px `#222`
- Legend below: colored dots + labels

**Mobile (hidden above md):**
- Day groups: header = day name (`#ff6600`, uppercase, tracking 3px) + line separator
- Slots: stacked cards, `#1a1a1a` background, rounded 6px, flex layout
  - Time: Barlow Condensed, 15px, bold, min-width 60px
  - Activity name: `#999`, 12px
  - Duration badge: underline style, colored by type

### 2.9 ImagePlaceholder

**No changes.** Keep current implementation.

### 2.10 Navigation

**Direction:** Refined Floating

- Keep floating style (detached from top, `max-w-6xl`, `rounded-2xl`)
- Add: subtle top gradient line `linear-gradient(90deg, transparent, #ff660030, transparent)` across 60% center width
- Logo mark: 6px diamond (rotated square), `#ff6600`, before "RATCHAWAT" text
- Scroll behavior unchanged (opacity + blur increase on scroll)
- Active link: `#ff6600` text
- "Book Now" button: standard primary small button

### 2.11 Footer

**Direction:** Brand Header + Columns

- `bg-surface-low`, top accent line: full-width `linear-gradient(90deg, transparent, #ff6600, transparent)`, 2px
- Brand row: logo (diamond + "RATCHAWAT MUAY THAI") left + social links (FB, IG, TT) right, separated by bottom border `1px solid #1a1a1a`
- 4 columns: Training, Camps, Info, Contact
  - Column headers: 9px, uppercase, letter-spacing 3px, `#ff6600`, semibold
  - Links: 12px, `#777`, hover `#ff6600`
- Bottom bar: border-top `1px solid #1a1a1a`, copyright left + Privacy/Terms right, `#444`, 10px

### 2.12 Breadcrumbs

**Direction:** Accent Line + Uppercase

- Leading accent: 16px wide, 1px tall, `#ff6600`
- Items: 10px, uppercase, letter-spacing 2px, `#777`
- Separator: `/` in `#333`
- Current page: `#f5f5f5`, font-weight 600
- Hover on links: `#ff6600`
- Keep JSON-LD BreadcrumbList

### 2.13 Buttons

**Direction:** Sharp System

**Primary:**
- `#ff6600` bg, white text, `padding: 13px 28px`, radius 6px
- Uppercase, letter-spacing 1.5px, font-weight 600
- Arrow `→` with gap 8px
- Hover: `#e85d00` bg, `translateY(-1px)`, `box-shadow: 0 4px 16px rgba(255,102,0,0.25)`, arrow translateX(3px)
- Active: translateY(0)

**Ghost:**
- Transparent bg, `#999` text, 1.5px border `#333`, same padding/radius
- Hover: border `#ff6600`, text `#f5f5f5`

**Link:**
- `#ff6600` text, 12px, semibold, arrow
- Hover: `#e85d00`, arrow translateX(3px)

### 2.14 Badges

**Direction:** Underline Accent

- Text: 9px, uppercase, letter-spacing 1.5px, font-weight 600
- No background
- Underline: 1.5px solid, matching text color
- Colors:
  - Level (Beginner/Advanced): `#ff6600`, underline `#ff6600`
  - Status (Open Now): `#22c55e`, underline `#22c55e`
  - Neutral (duration, meta): `#999`, underline `#666`

---

## 3. Section Pattern Specifications

### 3.1 Icon + Title + Description Cards (70+ instances)

**Direction:** Current layout + accent additions

- Keep existing vertical GlassCard layout (icon above, title, description)
- Add: left border 2px `#ff660040`, intensifies on hover
- Add: top gradient line 2px
- Add: hover intensifies left border to `#ff6600`
- Icon: direct (no background square), `#ff6600`
- Title: Barlow Condensed, uppercase, bold
- Description: `#999`, small, leading-relaxed
- Used on: Why Train, Values, Benefits, Equipment, Requirements, Class Structure, Services, Training Gear, What Kids Get, What You Need, etc.

### 3.2 Pricing Cards

**Direction:** System Consistent

- Full GlassCard system (top line + left border + bottom border)
- Package name: 9px uppercase label
- Price: Barlow Condensed, 36px, bold, `#ff6600`
- Currency: 11px, `#666`, next to price
- USD conversion: 10px, `#444`, underline badge style `#ff660020`
- Features: checkmark list, `✓` in `#ff6600`, text `#999`
- Regular card: ghost button
- Highlighted card: left + bottom borders full `#ff6600`, glow `0 0 30px rgba(255,102,0,0.06)`, primary button, "Best Value" badge (underline style, top-right)

### 3.3 Stats / Score Cards

**Direction:** System Consistent

- GlassCard (top line + left border + bottom border), hover disabled
- Number: Barlow Condensed, 32px, bold, `#ff6600`
- Label: 9px, uppercase, tracking 2px, `#666`, underline badge style `#ff6600`
- Centered text layout

### 3.4 Testimonial Cards

**Direction:** Current layout + accent additions

- Keep existing card layout (stars, quote, author)
- Add: top gradient line 2px
- Add: left border 2px `#ff660040`, intensifies on hover
- Add: bottom border 2px `#222` → `#ff6600` on hover
- Add: hover lift translateY(-2px)
- Stars: `#ff6600` fill
- Quote text: `#ccc`, italic, leading-relaxed
- Author section: separated by top border 1px `#222`
  - Name: Barlow Condensed, 13px, bold
  - Location: 10px, `#666`
  - Duration badge: underline style

### 3.5 Trainer Profile Cards

**Direction:** Full System

- GlassCard system (top line + left border + bottom border + hover)
- Photo zone: top area, ImagePlaceholder, gradient background
- Name: Barlow Condensed, 16px, bold, centered
- Role: 9px uppercase, `#ff6600`, underline badge style, centered
- Specialty tags: underline badge style, `#999` / `#666` underline, flex centered, wrap

### 3.6 Steps / Process

**Direction:** Timeline Vertical

- Vertical line: 2px, `linear-gradient(to bottom, #ff6600, #ff660030)`, absolute positioned left
- Step dots: 12px circles, `#ff6600` fill, 2px border `#0a0a0a`, on the line
- Content: right of line, padding-left 28px
  - Title: Barlow Condensed, 14px, bold, uppercase
  - Description: `#999`, 11px, leading-relaxed
- Step spacing: gap 20px
- No GlassCard wrapper (the timeline IS the visual structure)

### 3.7 Accommodation Cards

**Direction:** Unified System

- GlassCard system (top line + left border)
- Horizontal layout: icon left (emoji, `#ff6600`, 18px) + content right
  - Title: Barlow Condensed, 14px, bold, uppercase
  - Description: `#999`, 11px
  - Price: `#ff6600`, 11px, semibold, underline badge style

### 3.8 Camp Feature Cards

**Direction:** Unified System

- GlassCard system (top line + left border + bottom border + hover)
- Image zone: top area, gradient placeholder, aspect ratio ~16/9
- Content: padding 16px
  - Name: Barlow Condensed, 16px, bold, uppercase
  - Description: `#999`, 11px, leading-relaxed
  - Link: "Explore camp →", `#ff6600`, semibold

---

## 4. CSS Token Additions

Add to `globals.css` `@theme inline`:

```css
/* New shadow for hover glow */
--shadow-card-glow: 0 0 30px rgba(255, 102, 0, 0.06);

/* Border accent values */
--border-accent: #ff660040;
--border-accent-hover: #ff6600;
--border-accent-active: #ff6600;

/* Filigree number opacity */
--filigree-opacity: 0.12;
--filigree-opacity-hover: 0.2;
```

---

## 5. Animation Specifications

### Scroll-triggered entry animations

Use Intersection Observer (native, no library). Each section triggers once when 20% visible.

- **fade-in**: opacity 0 → 1, 500ms ease-out
- **slide-up**: translateY(1rem) → 0 + opacity 0 → 1, 500ms ease-out
- **Stagger**: each child item delays 100ms after the previous
- **Hero**: custom stagger (kicker 0ms → title 150ms → desc 300ms → buttons 450ms)

Respect `prefers-reduced-motion`: disable all animations.

### Hover transitions

All hovers: 300ms ease, properties: transform, box-shadow, border-color, opacity.

---

## 6. Files to Modify

### Components (modify existing):
1. `src/components/ui/HeroSection.tsx` — full rebuild
2. `src/components/ui/GlassCard.tsx` — add number, top line, left border, hover enhancements
3. `src/components/ui/CTABanner.tsx` — warm glow, 2 buttons, accent lines
4. `src/components/ui/FAQAccordion.tsx` — numbered, +/−, left border, color transitions
5. `src/components/ui/ProgramCard.tsx` — extend GlassCard, remove icon square, add mobile slider
6. `src/components/ui/ContactForm.tsx` — wrap in system card, kicker label, focus styles
7. `src/components/ui/LocationCard.tsx` — media card with map overlay badge
8. `src/components/ui/ScheduleTable.tsx` — dual render (desktop table + mobile list)
9. `src/components/ui/index.ts` — no changes needed
10. `src/components/layout/Navigation.tsx` — add gradient line, diamond logo mark
11. `src/components/layout/Footer.tsx` — brand header row, gradient line, restructure columns
12. `src/components/layout/Breadcrumbs.tsx` — accent line, uppercase, slash separator

### Styles:
13. `src/styles/globals.css` — add new tokens, button updates, badge utility class

### Pages (update inline sections):
14-33. All 20 page files — update inline card patterns to use new GlassCard props, update badges to underline style, add scroll animations, update buttons to dual-button pattern where applicable

### New utilities (optional):
34. `src/hooks/useScrollAnimation.ts` — Intersection Observer hook for scroll-triggered animations

---

## 7. Implementation Priority

1. **Foundation**: globals.css tokens + GlassCard component (everything depends on this)
2. **Core components**: HeroSection, CTABanner, FAQAccordion, Buttons/Badges
3. **Secondary components**: ProgramCard, ContactForm, LocationCard, ScheduleTable
4. **Layout**: Navigation, Footer, Breadcrumbs
5. **Pages pass**: update all 20 pages to use new component props and patterns
6. **Animations**: useScrollAnimation hook + apply to all sections
7. **Polish**: mobile slider for ProgramCards, dual-render ScheduleTable

---

## 8. Constraints

- No glass/blur effects (Ratchawat Bold rule)
- No new dependencies (animations via native Intersection Observer)
- Dark mode only
- Mobile-first (375px minimum)
- WCAG AAA contrast (7:1 minimum for body text)
- All existing SEO (metadata, JSON-LD, GEO passages) must be preserved
- No content changes (text stays the same, only visual treatment changes)
