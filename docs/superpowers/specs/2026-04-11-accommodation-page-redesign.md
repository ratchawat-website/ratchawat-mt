# Accommodation Page Redesign — Ratchawat Muay Thai

**Date:** 2026-04-11
**Status:** Approved
**Author:** Brainstorming session (RD + Claude)
**Scope:** Single page redesign — `/accommodation`

---

## Context

The current `/accommodation` page presents two camps (Bo Phut and Plai Laem) with external lodging recommendations (US Hostel, guesthouses, apartments). This is incorrect. Only the **Plai Laem** camp offers on-site accommodation: clean rooms inside the camp itself with a shared pool. The page must be rebuilt to reflect reality, showcase the rooms visually, and drive bookings for the Camp Stay packages (which were added in Phase 1).

The redesign must:
- Remove all Bo Phut accommodation content (no lodging offered there)
- Remove external Plai Laem recommendations (guesthouses, apartments, shared houses)
- Present the real on-site rooms at Plai Laem camp
- Make the visitor want to stay (visual, descriptive, emotional)
- Preserve and reuse the existing Camp Stay Packages pricing section
- Update SEO (schema, GEO passage, meta description) to reflect the new reality

---

## 1. Page Structure

Linear top-to-bottom flow. No sidebar, no tabs. Each section is one focused unit.

| Order | Section | Purpose |
|-------|---------|---------|
| 1 | Hero | State clearly: on-site stay at Plai Laem only |
| 2 | Photo strip (×6) | Visual seduction — scroll horizontal |
| 3 | Room description + amenities | What you get, concretely |
| 4 | Camp Stay Packages | Pricing / conversion (reused from Phase 1) |
| 5 | Why stay on-site? | 3 benefits, emotional reinforcement |
| 6 | GEO citable passage | AI search visibility |
| 7 | CTABanner | Final CTA |

---

## 2. Section Details

### 2.1 Hero

**Components:** Existing page header pattern (title + subtitle centered in `<section>`).

**Content:**
- Orange underline badge above H1: `PLAI LAEM CAMP ONLY`
- H1: `Stay at the Camp`
- Subtitle: `Train. Rest. Repeat. Rooms available at our Plai Laem camp, with pool view, AC, and all-inclusive packages.`

**Purpose:** Immediately clarify this is on-site accommodation at a single location. No confusion about Bo Phut, no ambiguity about partnership hostels.

**SEO impact:** H1 remains `Stay at the Camp` for visitors, but the document `<title>` stays aligned with AUDIT-SEO.md target keywords (`muay thai camp with accommodation koh samui`).

---

### 2.2 Photo Strip

**Layout:** Horizontal scrollable strip, 6 photos.

**Implementation:**
- Container: `<div className="overflow-x-auto snap-x snap-mandatory scrollbar-hide">`
- Inner: `<div className="flex gap-4 px-6">`
- Each item: fixed width (e.g. `w-[280px] sm:w-[320px] md:w-[360px]`), `aspect-[3/4]`, `snap-start`, rounded
- Each item uses `<ImagePlaceholder category="accommodation">` until real photos are added (Phase 5 blocker)
- On desktop, first 3 photos visible, remaining photos revealed by scroll
- Subtle left/right fade gradient at edges to suggest more content (`bg-gradient-to-r from-surface`)

**Photo captions (below each image, uppercase small text):**
1. `Room`
2. `Balcony`
3. `Pool`
4. `Camp view`
5. `Shared area`
6. `Storage`

**Accessibility:** Each image has descriptive alt text (e.g. `Double bed room with AC and storage at Ratchawat Plai Laem camp`). Horizontal scroll is keyboard-accessible via Tab + arrow keys on focused scroll container.

**Mobile:** Natural horizontal swipe, one full photo visible at a time.

**Note on real photos:** The client has not yet delivered real photos (Phase 5 blocker). Implementation uses `ImagePlaceholder` with the accommodation category. When photos arrive, they replace the placeholders in `public/images/accommodation/`.

---

### 2.3 Room Description + Amenities

**Layout:** Two-column grid on desktop (`lg:grid-cols-2`), stacked on mobile.

**Left column — Description:**
Two or three short paragraphs describing the vibe:
- Rooms are clean, functional, inside the camp grounds
- Designed for training: quiet, simple, everything you need after a hard session
- Balcony opens onto the shared pool, used by fellow fighters between sessions
- Shared pool — social hub of the camp, not a hotel pool

**Example text (to be humanized by `/humanizer` skill during implementation):**

> Our rooms are inside the Plai Laem camp. Clean, simple, everything you need after training and nothing you don't. Each room has a double bed, a private bathroom, air conditioning, and a balcony looking onto the shared pool.
>
> The pool is where fighters cool down between sessions. It's not a resort pool, it's a camp pool, and that is the point. You are here to train, not to lounge, but the water is there when you need it.

**Right column — Amenities grid:**

8 items in a grid (`grid-cols-2 gap-4` or `grid-cols-2 sm:grid-cols-4`), each with lucide-react icon + label:

| Icon | Label |
|------|-------|
| `Bed` | Double bed |
| `Bath` | Private bathroom |
| `Wind` | Air conditioning |
| `Wifi` | Wi-Fi |
| `Waves` | Shared pool |
| `Fence` | Pool-view balcony |
| `Package` | Storage |
| `MapPin` | Inside the camp |

Each item: icon (24px, primary color) + label (small text, on-surface-variant). Follows existing pattern used elsewhere on the site for feature lists.

---

### 2.4 Camp Stay Packages (reused)

**No changes to logic.** Keep the 3 cards exactly as they are in the current page:

- 1 Week — 8,000 THB (electricity included)
- 2 Weeks — 15,000 THB (Best Value badge, `ring-2 ring-primary`)
- 1 Month — 18,000 THB (electricity separate)

**Section label:** `ALL-INCLUSIVE` (existing)
**H2:** `Camp Stay Packages` (existing)

**One content update:** The intro paragraph below the H2 currently says "Available at our Plai Laem camp only." That phrasing is now redundant since the whole page is about Plai Laem. Simplify to:

> Training and accommodation in one package. Electricity is included for 1-week and 2-week stays.

Links and booking hrefs unchanged:
- `/booking/camp-stay?package=camp-stay-1week`
- `/booking/camp-stay?package=camp-stay-2weeks`
- `/booking/camp-stay?package=camp-stay-1month`

---

### 2.5 Why Stay On-Site?

**Layout:** 3 `GlassCard` components in a grid (`grid-cols-1 sm:grid-cols-3 gap-6`).

Each card: lucide icon + H3 + short description.

| Icon | Title | Description |
|------|-------|-------------|
| `Zap` | Zero commute | The gym is 30 seconds away. Train, eat, sleep, repeat. No wasted energy. |
| `Users` | Fighter community | Share the camp with other athletes. Motivation, advice, sparring partners. |
| `Tag` | All-in-one price | Accommodation and unlimited group training in one package. No surprises. |

Section label: `WHY STAY HERE`
H2: `The Camp Stay Experience`

Text will be humanized during implementation.

---

### 2.6 GEO Citable Passage

**Replace** the existing GEO passage with:

> Chor Ratchawat Muay Thai offers on-site accommodation at its Plai Laem camp in Koh Samui. Rooms include a double bed, private bathroom, air conditioning, Wi-Fi, and a private balcony with pool view. Camp Stay packages start at 8,000 THB per week with electricity included and combine unlimited group training with accommodation in one price.

**Why:** Mentions the business name, location, concrete amenities, and starting price — all signals AI search engines look for.

---

### 2.7 CTABanner

**Replace** the existing CTABanner props with:

```tsx
<CTABanner
  title="Book Your Stay"
  description="Training and accommodation, one price. Plai Laem camp, Koh Samui."
  buttonText="Book a Package"
  href="/booking/camp-stay"
  ghostText="View All Prices"
  ghostHref="/pricing"
/>
```

---

## 3. SEO Updates

### 3.1 Page metadata (unchanged)

Meta title and description from AUDIT-SEO.md line 368-369 remain valid:

```
Title: Muay Thai Accommodation Koh Samui | Train & Stay - Ratchawat
Description: Stay near Ratchawat Muay Thai in Koh Samui. Accommodation options near both Bo Phut and Plai Laem camps. Training + stay packages available.
```

**Issue:** The description mentions "both Bo Phut and Plai Laem" which is now inaccurate. Update description to:

```
Description: Stay at Ratchawat Muay Thai Plai Laem camp in Koh Samui. On-site rooms with pool, AC, balcony. All-inclusive training + stay packages from 8,000 THB.
```

Under 155 characters, accurate, mentions price anchor.

### 3.2 Schema.org — `LodgingBusiness`

**Replace** the existing `lodgingSchema` object (lines 21-39 in `src/app/accommodation/page.tsx`).

Current schema references "US Hostel / US Samui" in Bo Phut. New schema:

```typescript
const lodgingSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Ratchawat Muay Thai Camp Stay - Plai Laem",
  description:
    "On-site accommodation at Ratchawat Muay Thai Plai Laem camp in Koh Samui. Rooms with private bathroom, air conditioning, Wi-Fi, and pool-view balcony. All-inclusive training and stay packages.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Plai Laem, Ko Samui",
    addressRegion: "Surat Thani",
    postalCode: "84320",
    addressCountry: "TH",
  },
  priceRange: "฿฿",
  amenityFeature: [
    { "@type": "LocationFeatureSpecification", name: "Air conditioning", value: true },
    { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
    { "@type": "LocationFeatureSpecification", name: "Private bathroom", value: true },
    { "@type": "LocationFeatureSpecification", name: "Shared pool", value: true },
    { "@type": "LocationFeatureSpecification", name: "Balcony", value: true },
  ],
  parentOrganization: {
    "@type": "Organization",
    name: "Chor Ratchawat Muay Thai Gym",
    url: SITE_URL,
  },
};
```

### 3.3 AUDIT-SEO.md update

Update PAGE 13 in `AUDIT-SEO.md`:
- Meta description (match new one above)
- H1: change from `Accommodation` to `Stay at the Camp`
- GEO passage (match new one in section 2.6)
- Add note: "On-site accommodation at Plai Laem camp only. No Bo Phut accommodation."

---

## 4. Code Changes

### 4.1 Files to modify

| File | Change |
|------|--------|
| `src/app/accommodation/page.tsx` | Full rewrite per this spec |
| `AUDIT-SEO.md` | Update PAGE 13 section |
| `PROJET-STATUS.md` | Add entry to correction history, mark accommodation redesign done |

### 4.2 New imports needed

```typescript
import {
  MapPin,    // existing
  Wifi,      // existing
  Bed,       // existing
  Check,     // existing
  Bath,      // new
  Wind,      // new
  Waves,     // new
  Fence,     // new (if available — fallback: Building)
  Package,   // new
  Zap,       // new
  Users,     // existing
  Tag,       // new
} from "lucide-react";
```

**Icon availability check:** Verify `Fence` is exported by `lucide-react` at the version in use. If not, fall back to `Mountain` or `Building`.

### 4.3 Imports to remove

- `Utensils` (no longer used — was in boPhutOptions)
- `DollarSign` (no longer used — was in tips)

### 4.4 Data to remove

- `const boPhutOptions = [...]` — delete entirely
- `const plaiLaemOptions = [...]` — delete entirely
- `const tips = [...]` — delete entirely

### 4.5 Sections to remove

- `{/* Bo Phut Area */}` section (lines 191-223)
- `{/* Plai Laem Area */}` section (lines 225-257)
- `{/* Tips */}` section (lines 259-285)

### 4.6 Sections to add

- `{/* Photo Strip */}` section (new)
- `{/* Room Description */}` section (new)
- `{/* Why Stay On-Site */}` section (new)

### 4.7 Sections to keep (with minor edits)

- `{/* Page Header */}` — update H1 and subtitle
- `{/* Camp Stay Packages — Plai Laem */}` — update intro paragraph only
- `{/* GEO Citable Passage */}` — replace text
- `<CTABanner>` — update props

---

## 5. Design System Compliance

- **Dark mode default:** All sections use existing `bg-surface` and `bg-surface-lowest/50` alternation
- **No 1px borders:** Uses `ring-2` and `border-2` where needed (already compliant in reused cards)
- **No backdrop-blur:** Photo strip uses native overflow-x, no glass effects
- **Primary color CTAs:** All booking buttons use `.btn-primary` class
- **Typography:** `font-serif` (Barlow Condensed) for headings, Inter for body (via root layout)
- **Generous spacing:** Sections use `py-16 sm:py-20` consistent with current page
- **Mobile-first:** Photo strip works natively on mobile (horizontal swipe), amenity grid stacks, packages stack

---

## 6. Accessibility

- Photo strip container has `role="region"` and `aria-label="Room photo gallery"`
- Each photo has meaningful `alt` text
- Amenity icons are decorative (`aria-hidden="true"`), labels are readable
- Scroll container is keyboard-focusable; arrow keys scroll
- Color contrast meets WCAG AAA for body text (already compliant via design tokens)

---

## 7. Validation Criteria

The rewrite is complete when:

1. `npm run lint` passes (0 errors, 0 warnings on the file)
2. `npm run build` passes (0 errors)
3. The page renders correctly at mobile (375px), tablet (768px), and desktop (1280px) breakpoints
4. No references to "Bo Phut" in accommodation context remain on the page
5. No references to "US Hostel" or external partners remain
6. Schema.org validates (via Google Rich Results Test or schema.org validator)
7. All 6 photo placeholders render
8. All 8 amenities render with correct icons
9. The 3 Camp Stay Packages cards are unchanged in structure and links
10. `AUDIT-SEO.md` PAGE 13 section reflects the new reality
11. `PROJET-STATUS.md` has a new correction history entry

---

## 8. Out of Scope

Explicitly **not** part of this redesign:
- Real photo delivery (Phase 5 blocker, client responsibility)
- Booking flow for camp-stay (Phase 2)
- Supabase availability calendar (Phase 3)
- Translation to French or Spanish (later phase)
- Lightbox / full-screen photo viewer (YAGNI, scroll strip is enough)
- Video content (none available from client)

---

## 9. Notes for Implementation

- Run `/humanizer` on all visible text before committing (per `CLAUDE.md` mandatory rule)
- Run `/seo` check before modifying the file
- Study existing `GlassCard`, `CTABanner`, and page header patterns before coding
- Verify `lucide-react` has `Fence` icon at the installed version; fall back if needed
- Keep the edit focused: this is a rewrite of one page file and one update to two doc files, not a refactor
