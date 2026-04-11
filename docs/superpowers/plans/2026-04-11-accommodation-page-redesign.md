# Accommodation Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `/accommodation` to present only on-site rooms at Plai Laem camp (removing all Bo Phut and external recommendations), with a horizontal photo carousel, room amenities, and Camp Stay Packages.

**Architecture:** Single-file rewrite of `src/app/accommodation/page.tsx`. Three supporting doc updates: `AUDIT-SEO.md` PAGE 13 section, `PROJET-STATUS.md` correction history, and `ROADMAP.md` (insert as new Phase 2, renumber subsequent phases). No new components — uses existing `GlassCard`, `CTABanner`, `Breadcrumbs`, `ImagePlaceholder`, and `JsonLd`. The photo carousel is native `overflow-x-auto` + `snap-x`, no JavaScript needed. Work happens directly on `main` (no worktree).

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, lucide-react icons, Schema.org JSON-LD.

**Reference spec:** `docs/superpowers/specs/2026-04-11-accommodation-page-redesign.md`

---

## File Map

| File | Action |
|------|--------|
| `src/app/accommodation/page.tsx` | Full rewrite |
| `AUDIT-SEO.md` | Update PAGE 13 section (meta description, H1, GEO passage) |
| `PROJET-STATUS.md` | Add correction history entry |
| `ROADMAP.md` | Insert as new Phase 2, renumber current Phases 2–6 to 3–7 |

---

## Task 1: Verify baseline on main

**Purpose:** Confirm `main` branch is clean and builds before starting edits.

**Files:**
- No file changes; git + build verification only

- [ ] **Step 1: Confirm on main with clean working tree**

```bash
git branch --show-current
git status
```
Expected: `main`, `nothing to commit, working tree clean`.

- [ ] **Step 2: Verify baseline build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, 28 static pages generated, 0 errors.

---

## Task 2: Rewrite `src/app/accommodation/page.tsx`

**Purpose:** Replace the file entirely with the new structure per spec sections 2.1–2.7.

**Files:**
- Modify (full rewrite): `src/app/accommodation/page.tsx`

- [ ] **Step 1: Read current file to confirm starting state**

Use the Read tool on `src/app/accommodation/page.tsx`. Confirm it still contains `boPhutOptions`, `plaiLaemOptions`, `tips` arrays and the section markers `{/* Bo Phut Area */}`, `{/* Plai Laem Area */}`, `{/* Tips */}`.

- [ ] **Step 2: Overwrite the file with the new content**

Use the Write tool to replace the entire file with:

```tsx
import { generatePageMeta } from "@/lib/seo/meta";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import GlassCard from "@/components/ui/GlassCard";
import CTABanner from "@/components/ui/CTABanner";
import ImagePlaceholder from "@/components/ui/ImagePlaceholder";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/components/seo/SchemaOrg";
import {
  BedDouble,
  Bath,
  Wind,
  Wifi,
  Waves,
  Fence,
  Package,
  MapPin,
  Zap,
  Users,
  Tag,
  Check,
} from "lucide-react";
import Link from "next/link";

export const metadata = generatePageMeta({
  title: "Muay Thai Accommodation Koh Samui | Train & Stay - Ratchawat",
  description:
    "Stay at Ratchawat Muay Thai Plai Laem camp in Koh Samui. On-site rooms with pool, AC, balcony. All-inclusive training and stay packages from 8,000 THB.",
  path: "/accommodation",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ratchawatmuaythai.com";

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

const photos = [
  { caption: "Room", alt: "Double bed room with AC at Ratchawat Plai Laem camp" },
  { caption: "Balcony", alt: "Private balcony with pool view at Plai Laem camp" },
  { caption: "Pool", alt: "Shared pool at Ratchawat Plai Laem camp" },
  { caption: "Camp view", alt: "View of the Plai Laem training camp" },
  { caption: "Shared area", alt: "Common area for fighters at Plai Laem camp" },
  { caption: "Storage", alt: "Room storage and closet at Plai Laem camp" },
];

const amenities = [
  { icon: BedDouble, label: "Double bed" },
  { icon: Bath, label: "Private bathroom" },
  { icon: Wind, label: "Air conditioning" },
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Waves, label: "Shared pool" },
  { icon: Fence, label: "Pool-view balcony" },
  { icon: Package, label: "Storage" },
  { icon: MapPin, label: "Inside the camp" },
];

const benefits = [
  {
    icon: Zap,
    title: "Zero Commute",
    description:
      "The gym is 30 seconds away. Train, eat, sleep, repeat. No wasted energy on transport.",
  },
  {
    icon: Users,
    title: "Fighter Community",
    description:
      "Share the camp with other athletes. Motivation, advice, and sparring partners on tap.",
  },
  {
    icon: Tag,
    title: "All-In-One Price",
    description:
      "Accommodation and unlimited group training in one package. No surprises.",
  },
];

export default function AccommodationPage() {
  return (
    <>
      <JsonLd data={[organizationSchema(), lodgingSchema]} />

      <Breadcrumbs
        items={[{ label: "Home", href: "/" }, { label: "Accommodation" }]}
      />

      {/* Hero */}
      <section className="py-12 sm:py-16 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4">
            <span className="badge-underline badge-orange">PLAI LAEM CAMP ONLY</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-semibold text-on-surface">
            Stay at the Camp
          </h1>
          <p className="mt-4 text-on-surface-variant text-lg max-w-2xl mx-auto">
            Train. Rest. Repeat. Rooms available at our Plai Laem camp, with pool view, AC, and all-inclusive packages.
          </p>
        </div>
      </section>

      {/* Photo Strip */}
      <section
        className="pb-12 sm:pb-16"
        aria-label="Room photo gallery"
      >
        <div
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-6 px-6 sm:px-10 md:px-16 lg:px-20"
          role="region"
          tabIndex={0}
        >
          {photos.map((photo) => (
            <div
              key={photo.caption}
              className="shrink-0 w-[260px] sm:w-[300px] md:w-[340px] snap-start"
            >
              <ImagePlaceholder
                category="accommodation"
                aspectRatio="aspect-[3/4]"
                className="w-full"
              />
              <p className="mt-3 text-xs uppercase tracking-[0.19em] text-on-surface-variant">
                {photo.caption}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Room Description + Amenities */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              THE ROOMS
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            Inside the Camp
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-4 text-on-surface-variant leading-relaxed">
              <p>
                Our rooms sit inside the Plai Laem camp. Clean, simple, everything you need after training and nothing you don't. Each room has a double bed, a private bathroom, air conditioning, and a balcony looking onto the shared pool.
              </p>
              <p>
                The pool is where fighters cool down between sessions. It is not a resort pool, it is a camp pool, and that is the point. You come here to train, and the water is there when your legs need it.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {amenities.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-4 rounded-card bg-surface-low border-2 border-outline-variant"
                >
                  <item.icon size={22} className="text-primary shrink-0" aria-hidden="true" />
                  <span className="text-sm text-on-surface font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Camp Stay Packages */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              ALL-INCLUSIVE
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface text-center mb-4">
            Camp Stay Packages
          </h2>
          <p className="text-center text-on-surface-variant text-sm mb-10">
            Training and accommodation in one package. Electricity is included for 1-week and 2-week stays.
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
                <li className="flex items-center gap-2 opacity-50"><Check size={16} className="shrink-0" /> Electricity charged separately</li>
              </ul>
              <Link href="/booking/camp-stay?package=camp-stay-1month" className="btn-primary w-full justify-center">
                Book 1 Month <span className="btn-arrow">&rarr;</span>
              </Link>
            </GlassCard>
          </div>
          <p className="text-center mt-6 text-on-surface-variant text-sm">
            Interested in the{" "}
            <Link href="/programs/fighter" className="btn-link">fighter program <span className="btn-arrow">&rarr;</span></Link>
            {" "}with accommodation?{" "}
            <Link href="/contact" className="btn-link">Contact us <span className="btn-arrow">&rarr;</span></Link>.
          </p>
        </div>
      </section>

      {/* Why Stay On-Site */}
      <section className="py-16 sm:py-20 px-6 sm:px-10 md:px-16 lg:px-20 bg-surface-lowest/50">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-[2px] bg-primary" />
            <span className="text-xs uppercase tracking-[0.19em] text-primary font-semibold">
              WHY STAY HERE
            </span>
            <span className="w-8 h-[2px] bg-primary" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-on-surface mb-8">
            The Camp Stay Experience
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <GlassCard key={benefit.title} number={String(i + 1).padStart(2, "0")}>
                <benefit.icon size={28} className="text-primary mb-3" aria-hidden="true" />
                <h3 className="font-serif text-lg font-bold text-on-surface uppercase mb-2">
                  {benefit.title}
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* GEO Citable Passage */}
      <section className="py-12 px-6 sm:px-10 md:px-16 lg:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-base leading-relaxed text-center">
            Chor Ratchawat Muay Thai offers on-site accommodation at its Plai Laem camp in Koh Samui. Rooms include a double bed, private bathroom, air conditioning, Wi-Fi, and a private balcony with pool view. Camp Stay packages start at 8,000 THB per week with electricity included and combine unlimited group training with accommodation in one price.
          </p>
        </div>
      </section>

      <CTABanner
        title="Book Your Stay"
        description="Training and accommodation, one price. Plai Laem camp, Koh Samui."
        buttonText="Book a Package"
        href="/booking/camp-stay"
        ghostText="View All Prices"
        ghostHref="/pricing"
      />
    </>
  );
}
```

- [ ] **Step 3: Verify the file compiles**

Run: `npm run lint -- src/app/accommodation/page.tsx`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run full build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, 28 static pages, 0 errors. The `/accommodation` route appears in the route list.

- [ ] **Step 5: Visual smoke test (developer)**

Run: `npm run dev` in a separate terminal, then open `http://localhost:3000/accommodation`.
Expected:
- Hero shows "PLAI LAEM CAMP ONLY" badge + "Stay at the Camp" H1
- Photo strip scrolls horizontally with 6 placeholder tiles
- Room description + 8 amenity tiles visible
- 3 Camp Stay Packages cards render
- 3 "Why stay here" benefit cards render
- GEO passage present
- CTABanner at bottom
- No Bo Phut or US Hostel text anywhere on the page

Kill dev server with Ctrl+C before moving on.

---

## Task 3: Update `AUDIT-SEO.md` PAGE 13

**Purpose:** Sync the SEO reference doc with the new page reality.

**Files:**
- Modify: `AUDIT-SEO.md` (lines around PAGE 13 section)

- [ ] **Step 1: Read the current PAGE 13 section**

Use the Read tool with offset 360, limit 25 on `AUDIT-SEO.md`. Confirm the section matches lines 360–380 showing the old meta description and GEO passage.

- [ ] **Step 2: Apply the edit**

Use the Edit tool on `AUDIT-SEO.md` with:

**old_string:**
```
### PAGE 13 : Hebergement `/accommodation`

**Mots-cles cibles :**
- Principal : `muay thai camp with accommodation koh samui`
- Secondaires : `muay thai training holiday koh samui`, `muay thai retreat koh samui`, `muay thai camp and stay koh samui`

**Meta :**
```
Title: Muay Thai Accommodation Koh Samui | Train & Stay — Ratchawat
Description: Stay near Ratchawat Muay Thai in Koh Samui. Accommodation options near both Bo Phut and Plai Laem camps. Training + stay packages available.
```

**H1 :** `Accommodation`

**Schema :** `LodgingBusiness` lie a l'`Organization`

**Passage GEO :**
> Ratchawat Muay Thai partners with local accommodations near both Koh Samui locations. In Bo Phut, the camp works with US Hostel / US Samui near Fisherman's Village. Accommodation options near the Plai Laem camp are also available. Training and stay packages combine lodging with daily Muay Thai classes.

**Liens internes :** /pricing, /booking, /camps/bo-phut, /camps/plai-laem
```

**new_string:**
```
### PAGE 13 : Hebergement `/accommodation`

**Mots-cles cibles :**
- Principal : `muay thai camp with accommodation koh samui`
- Secondaires : `muay thai training holiday koh samui`, `muay thai retreat koh samui`, `muay thai camp and stay koh samui`

**Meta :**
```
Title: Muay Thai Accommodation Koh Samui | Train & Stay - Ratchawat
Description: Stay at Ratchawat Muay Thai Plai Laem camp in Koh Samui. On-site rooms with pool, AC, balcony. All-inclusive training and stay packages from 8,000 THB.
```

**H1 :** `Stay at the Camp`

**Schema :** `LodgingBusiness` avec `amenityFeature` lie a l'`Organization`

**Passage GEO :**
> Chor Ratchawat Muay Thai offers on-site accommodation at its Plai Laem camp in Koh Samui. Rooms include a double bed, private bathroom, air conditioning, Wi-Fi, and a private balcony with pool view. Camp Stay packages start at 8,000 THB per week with electricity included and combine unlimited group training with accommodation in one price.

**Note :** On-site accommodation at Plai Laem camp only. No Bo Phut accommodation.

**Liens internes :** /pricing, /booking/camp-stay, /programs/fighter, /camps/plai-laem
```

- [ ] **Step 3: Verify no other accommodation references in AUDIT-SEO.md need updating**

Run: `grep -n "US Hostel\|Bo Phut.*accommodation\|accommodation.*Bo Phut" AUDIT-SEO.md`
Expected: no matches (or only matches outside PAGE 13 that are unrelated to lodging claims).

---

## Task 4: Update `PROJET-STATUS.md`

**Purpose:** Keep the project state document accurate so future agents know the accommodation page was rebuilt.

**Files:**
- Modify: `PROJET-STATUS.md` (correction history section)

- [ ] **Step 1: Locate the correction history section**

Use the Read tool on `PROJET-STATUS.md` and find the "Correction History" or similar section at the top.

- [ ] **Step 2: Add a new entry at the top of the history list**

Use the Edit tool to insert a new bullet. Find the first existing correction entry (for example an entry mentioning Phase 1 pricing work) and add the new entry immediately above it.

**Insert this bullet (adapt indent to match the list style in the file):**

```markdown
- **2026-04-11 — /accommodation rebuild:** Removed Bo Phut accommodation section and all external partner lodging (US Hostel, guesthouses). Page now presents only on-site rooms at Plai Laem camp with a 6-photo horizontal carousel, 8 amenity icons, 3-card Camp Stay Packages, and 3 "Why stay here" benefits. Updated Schema.org `LodgingBusiness`, meta description (mentions 8,000 THB price anchor), GEO passage, and `AUDIT-SEO.md` PAGE 13.
```

If there is a "Pages Done" list, verify `/accommodation` is still marked Done (it should already be). No change needed there.

---

## Task 5: Update `ROADMAP.md` (insert as new Phase 2)

**Purpose:** Record the accommodation redesign in the project roadmap as a discrete phase and renumber subsequent phases so the source-of-truth document stays accurate.

**Files:**
- Modify: `ROADMAP.md`

- [ ] **Step 1: Read the current ROADMAP.md to confirm phase structure**

Use the Read tool on `ROADMAP.md`. Confirm it has 6 phases numbered 1–6 where Phase 1 is COMPLETE and Phases 2–6 are PENDING.

- [ ] **Step 2: Update the "Last updated" line and "Current phase"**

Use the Edit tool on `ROADMAP.md` with:

**old_string:**
```
**Last updated:** 2026-04-11
**Current phase:** Phase 1 — Content & Pricing Foundation
```

**new_string:**
```
**Last updated:** 2026-04-11
**Current phase:** Phase 2 — Accommodation Page Redesign
```

- [ ] **Step 3: Insert the new Phase 2 section after Phase 1**

Use the Edit tool on `ROADMAP.md`. Find the boundary between Phase 1 and Phase 2 (the `---` separator followed by `## Phase 2 — Booking System UI`) and insert the new phase.

**old_string:**
```
---

## Phase 2 — Booking System UI
```

**new_string:**
```
---

## Phase 2 — Accommodation Page Redesign

**Status:** COMPLETE
**Goal:** Rewrite `/accommodation` around on-site rooms at Plai Laem camp. Remove all Bo Phut accommodation content. Present rooms visually with a 6-photo carousel, amenity list, and reuse of Camp Stay Packages.
**Blocker:** Phase 1 complete.
**Spec:** `docs/superpowers/specs/2026-04-11-accommodation-page-redesign.md`
**Plan:** `docs/superpowers/plans/2026-04-11-accommodation-page-redesign.md`

### Tasks

- [x] Write spec + plan (2026-04-11)
- [x] Remove Bo Phut accommodation section and external partner lodging
- [x] Add 6-photo horizontal carousel with captions
- [x] Add room description + 8 amenity tiles
- [x] Add "Why Stay Here" 3-card benefits section
- [x] Update Schema.org `LodgingBusiness` with `amenityFeature`
- [x] Update meta description with 8,000 THB price anchor
- [x] Update GEO passage (on-site at Plai Laem only)
- [x] Sync `AUDIT-SEO.md` PAGE 13
- [x] Update `PROJET-STATUS.md` correction history
- [x] `/humanizer` pass on visible copy
- [x] `npm run lint` — 0 errors
- [x] `npm run build` — 0 errors
- [x] Commit

### Success criteria

`npm run build` passes. No "Bo Phut" or "US Hostel" reference in `/accommodation`. Schema validates. Visual review passes at 375px, 768px, 1280px.

---

## Phase 3 — Booking System UI
```

- [ ] **Step 4: Renumber Phase 3 (Backend Integration)**

Use the Edit tool on `ROADMAP.md` with:

**old_string:** `## Phase 3 — Backend Integration`
**new_string:** `## Phase 4 — Backend Integration`

- [ ] **Step 5: Renumber Phase 4 (Admin Dashboard)**

Use the Edit tool on `ROADMAP.md` with:

**old_string:** `## Phase 4 — Admin Dashboard`
**new_string:** `## Phase 5 — Admin Dashboard`

- [ ] **Step 6: Renumber Phase 5 (Security & Quality)**

Use the Edit tool on `ROADMAP.md` with:

**old_string:** `## Phase 5 — Security & Quality`
**new_string:** `## Phase 6 — Security & Quality`

- [ ] **Step 7: Renumber Phase 6 (Go-live)**

Use the Edit tool on `ROADMAP.md` with:

**old_string:** `## Phase 6 — Go-live`
**new_string:** `## Phase 7 — Go-live`

- [ ] **Step 8: Update "Blocker" lines in renumbered phases**

The old Phase 3 (now Phase 4) was blocked by "Phase 3 complete" in dependent phases. Update each renumbered phase's blocker reference.

Use the Edit tool on `ROADMAP.md`:

**old_string:** `**Blocker:** Phase 3 complete.`
**new_string:** `**Blocker:** Phase 4 complete.`

Then:

**old_string:** `**Blocker:** Phase 4 complete.`
**new_string:** `**Blocker:** Phase 5 complete.`

Then:

**old_string:** `**Blocker:** Phase 5 complete.`
**new_string:** `**Blocker:** Phase 6 complete.`

Note: the `replace_all` parameter must stay `false` for each edit so they apply in sequence (each edit makes the next unique).

- [ ] **Step 9: Update "Phase 2 complete" references pointing to the old Phase 2 (Booking System)**

The old Phase 2 was "Booking System UI" and is now Phase 3. Any phase that listed `**Blocker:** Phase 2 complete.` (implicit in the old file's Phase 3 entry that said "New Supabase account ready") did not use that phrasing, but double-check.

Run: `grep -n "Phase [0-9] complete" ROADMAP.md`
Expected: each dependency matches the new numbering (each later phase blocked by the phase immediately before it, except Phase 4 which is blocked by the external Supabase setup).

- [ ] **Step 10: Verify final structure**

Run: `grep -n "^## Phase" ROADMAP.md`
Expected (7 lines):
```
## Phase 1 — Content & Pricing Foundation
## Phase 2 — Accommodation Page Redesign
## Phase 3 — Booking System UI
## Phase 4 — Backend Integration
## Phase 5 — Admin Dashboard
## Phase 6 — Security & Quality
## Phase 7 — Go-live
```

---

## Task 6: Humanize, final verification, commit

**Purpose:** Run the mandatory humanizer pass and verify nothing regressed before committing.

**Files:**
- Possibly minor text tweaks in `src/app/accommodation/page.tsx`

- [ ] **Step 1: Run `/humanizer` on the new page copy**

Activate the `/humanizer` skill and feed it the visible text from `src/app/accommodation/page.tsx`. The text to check:
- Hero subtitle
- Room description paragraphs (2)
- Camp Stay Packages intro paragraph
- 3 benefit card descriptions
- GEO passage
- CTABanner title and description

Apply any suggested edits directly in the file. Do not alter structure or class names — only copy.

- [ ] **Step 2: Verify no em dashes or unicode escapes in the new file**

Run: `grep -n "—\|\\\\u" src/app/accommodation/page.tsx`
Expected: no matches (the only dashes should be `-` or `--` as natural hyphens).

If matches are found, replace them with ` - ` (space-hyphen-space) or commas/parentheses per `CLAUDE.md` rules.

- [ ] **Step 3: Run lint on the full project**

Run: `npm run lint`
Expected: 0 errors, 0 warnings.

- [ ] **Step 4: Run full production build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, 28 static pages, 0 errors.

- [ ] **Step 5: Final visual check**

Run: `npm run dev`, open `http://localhost:3000/accommodation`.
Verify at 3 breakpoints (resize browser window):
- Mobile (~375px): hero centered, photos scroll horizontally one at a time, amenities stack to 2 columns, packages stack vertically, benefits stack vertically
- Tablet (~768px): same as mobile but amenities show 2 columns cleanly, packages still stacked or 3-up depending on space
- Desktop (~1280px): hero centered, photos show ~3-4 visible with scroll for the rest, description + amenities in 2 columns, packages in 3 cards, benefits in 3 cards

Kill dev server.

- [ ] **Step 6: Ask user for commit approval**

Per project rule: never commit without explicit user instruction. Pause here and ask the user: "All checks pass. Ready to commit the 4 modified files? (`src/app/accommodation/page.tsx`, `AUDIT-SEO.md`, `PROJET-STATUS.md`, `ROADMAP.md`)"

Wait for explicit approval before proceeding.

- [ ] **Step 7: Stage changes**

```bash
git add src/app/accommodation/page.tsx AUDIT-SEO.md PROJET-STATUS.md ROADMAP.md
git status
```
Expected: exactly these 4 files listed as modified.

- [ ] **Step 8: Commit**

```bash
git commit -m "$(cat <<'EOF'
feat(accommodation): rebuild page around on-site Plai Laem rooms

- Remove Bo Phut accommodation section and external partner lodging
- Add 6-photo horizontal carousel (scroll + snap) with captions
- Add room description + 8 amenity tiles (bed, bathroom, AC, Wi-Fi, pool, balcony, storage, location)
- Add 3-card "Why Stay Here" benefits section
- Update Schema.org LodgingBusiness with amenityFeature
- Update meta description with 8,000 THB price anchor
- Update GEO passage to reflect on-site accommodation at Plai Laem only
- Sync AUDIT-SEO.md PAGE 13 section
- Update PROJET-STATUS.md correction history
- Insert new Phase 2 in ROADMAP.md (renumber subsequent phases)
EOF
)"
```
Expected: commit created, working tree clean.

- [ ] **Step 9: Show final state**

Run: `git log --oneline -5 && git status`
Expected: new commit at HEAD of `main`, working tree clean.

---

## After All Tasks Complete

Work is already on `main`. No branch cleanup needed. Report completion to user.
