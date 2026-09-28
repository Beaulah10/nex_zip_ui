# Seat Map Page — Design System Demo

## Goal
Build a responsive seat map component for the ZIPAIR-style aircraft (Boeing 787-8), matching the provided design (desktop + mobile), and add it as a new demo section/page inside `apps/ibe-app/app/[locale]/design-system/page.tsx` (or a dedicated demo route if that file is too large already).

## Scope
- Design-system demo only (per user choice) — not wired into the real booking flow yet.
- Location: `apps/ibe-app` only (per user choice), following existing patterns (`packages/ui` primitives + app-level feature components).
- Data: driven by the provided seat map JSON (cabins → rows → seats, with `templateSeats` + `rowRange` expansion for repeated rows).
- Both cabins from the JSON are in scope: Business class (rows 1–5, `1-1` and `1-2-1` layouts) and Economy (rows 18–57, matching the provided screenshot). Business class has no reference screenshot, so its visual style will extend the same design language (seat button shapes/colors) inferred from the economy design.
- Pricing: color-coding by tier only (teal/green, blue, orange, special) — no price values/badges/tooltips in this demo.

## Design Reference (from screenshot)
- Two cabin blocks separated by "Emergency exit" left/right labels with arrow icons.
- Column headers: `A B C` | gap | `D E G` | gap | `H J K` (3-3-3 economy layout), with icons above certain columns (wheelchair accessible, infant/family icons).
- Economy block 1: rows 18–36, layout 3-3-3, seat color teal/green (available), row 19 A-C highlighted orange (extra-legroom/exit-row seats with diagonal arrow icon), row 20 has a "ZT" special seat.
- Economy block 2: rows 45–57, layout with row 45 only middle 3 seats (3-center), rows 46–55 full 3-3-3 blue-colored (different price tier), row 56/57 layout 2-3-2 (fewer seats, aisle shifts).
- Row 46 and last row before 57 boundary show orange "exit row" seats at ends.
- Bottom rows (36, 57) show chevron/collapse icons instead of seats — likely "more seats below/collapsed" indicators.
- Row number labels appear on both sides of each row (left of ABC block, right of HJK block).
- Two color tiers visible: teal/green seats (front economy) vs blue seats (rear economy) — likely different fare classes (e.g., Standard vs Basic), plus orange = preferred/exit-row, dark green "ZT" = special/occupied seat.
- Family/infant icons and wheelchair icon appear above specific columns as legend/markers, not full legend blocks — need Figma HTML for exact icon assets, spacing, and color tokens (hex/CSS vars). **Will request the Figma HTML/export again during implementation for pixel-accurate icons, spacing, and colors.**

## Data Modeling
1. Create a TypeScript type for the seat map JSON shape (`SeatMapData`, `Cabin`, `Row`, `Seat`, `TemplateSeat`).
2. Write a small utility (`lib/seat-map.ts` or `utils/seat-map.ts`) to:
   - Expand `rowRange` + `templateSeats` entries into concrete per-row seat lists (e.g. rows 19–36, 46–55).
   - Normalize each cabin's rows into a flat list of `{ row, seats[] }` ready for rendering, preserving `layout` (e.g. `3-3-3`, `3-center`, `2-3-2`, `1-1`, `1-2-1`) to control column gaps/grouping.
3. Store the sample JSON as a local fixture (e.g. `apps/ibe-app/app/[locale]/design-system/seat-map-data.json` or `.ts`) for the demo.

## Component Structure (new files under `apps/ibe-app/components/seat-map/`)
- `seat-map.tsx` — top-level container: renders cabin sections, column headers, emergency exit rows.
- `seat-map-row.tsx` — renders one row: row number + seats grouped by layout gaps (handles 3-3-3, 3-center, 2-3-2, 1-1, 1-2-1 variants).
- `seat.tsx` — individual seat button: variant-driven (available, selected, occupied/blocked, exit-row/preferred, special) using `class-variance-authority` to match existing `packages/ui` patterns (like `button.tsx`).
- `seat-map-legend.tsx` — optional legend row/icons (wheelchair, family, exit arrows) if confirmed needed from Figma detail.
- `cabin-header.tsx` — column letter headers (A B C / D E G / H J K) with per-column icon markers.

## Interactivity (per user selection)
- Seat selection: clickable seat buttons toggle `selected` state (local `useState` in the demo page, e.g. `Set<string>` of seat codes).
- Pricing tiers: seat variant maps to a price tier badge/tooltip (data comes from JSON `type` + cabin `class`; may need a `price` field added to fixture if not present — will confirm with user if pricing display is required beyond color-coding).
- Availability states: `available`, `selected`, `occupied` (blocked/disabled), `exit-row/preferred` (orange), `special` (ZT-style labeled seat).

## Responsiveness
- Avoid absolute positioning from the Figma export; use CSS Grid for seat rows (grid-template-columns matching layout groups with gap for aisles) and Flexbox for row-level accessories (row number, emergency exit labels).
- Mobile: same grid structure scaled down via responsive units (rem/clamp) and smaller touch targets, preserving the exact visual structure shown (already appears to be the mobile-width screenshot at ~430px).
- Use Tailwind CSS 4 utility classes + existing design tokens (`--color-primary`, `--color-base-*`, etc.) from `packages/ui/styles/global.css`; introduce new seat-status tokens only if none exist, following existing naming conventions.

## Implementation Steps
1. Add TypeScript types + JSON fixture + row-expansion utility.
2. Build `Seat` component with CVA variants matching screenshot colors (green/teal available, blue rear-cabin tier, orange exit-row, dark green special/occupied, gray collapsed-indicator).
3. Build `SeatMapRow` to lay out seats per row layout with correct aisle gaps and row-number labels on both sides.
4. Build `CabinHeader` for column letters + icon markers.
5. Build `SeatMap` to compose header + rows + emergency exit dividers + cabin transition.
6. Wire up selection state and pass down `selected`/`onSelectSeat` handlers.
7. Add a new "Seat Map" demo section to `apps/ibe-app/app/[locale]/design-system/page.tsx` (replacing/extending the existing basic "Seat Map Selection" dialog demo) rendering the full `SeatMap` with the sample JSON.
8. Test responsively at mobile and desktop widths in the dev server; verify pixel-fidelity against the provided screenshot.

## Open Items to Revisit During Implementation
- Re-request/re-attach the Figma HTML export (the referenced `*.figma.html` file wasn't accessible) to confirm exact colors, spacing, icon SVGs, and fonts for the economy section.
- Business class cabin has no reference screenshot — will use a consistent seat button style (extending the economy visual language: rounded seat shape, window/aisle/middle color coding) and confirm with user once a first draft is visible in the dev preview.
