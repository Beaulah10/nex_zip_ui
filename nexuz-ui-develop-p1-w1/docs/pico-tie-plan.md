# Fix Seat Map Mobile View

## Root cause

The seat map component (`apps/ibe-app/components/customize/seat-map/`) uses **fixed, non-responsive spacing** (Tailwind `gap-4`/`gap-2`, `p-4`/`px-4`, a `44px` row-number spacer) at multiple nested levels:

- `seat-map-dialog.tsx`: outer flex wrapper `p-4`, gray card wrapper `px-4`
- `seat-map.tsx`: white seat-map area `p-4`
- `seat-column-groups.tsx` / `seat-map-row.tsx` / `cabin-header.tsx`: fixed `gap-4` within a 3-seat group, `gap-2` between groups, plus a `44px` (`w-11`) row-number spacer between groups

On desktop there's enough width for these fixed gaps to look fine (which is why desktop already matches). On a 390px mobile screen, the same fixed values push the seat grid's real width to roughly 460–500px — well past what's available (~330px after all the nested padding) — causing the grid to overflow/compress and look wrong, which is exactly the mismatch reported.

The Figma mobile spec (`Popup/Seat_Map`, `Device=Mobile`) confirms tighter, more fluid mobile spacing:
- Outer seat-map card padding: `4px` horizontal (vs `16px` today)
- Inner white seat-map padding: `16px` vertical / `8px` horizontal (vs `16px` all around today)
- Column header row is distributed with `justify-content: space-between` across the full available width (fluid), not fixed pixel gaps
- Seat/column width is `28px`, which already matches the current `SEAT_SIZE_CLASSES` (`w-7 h-7`) — seat sizing itself is correct, only the surrounding padding/gaps need to become mobile-aware

The **business/ZipFullFlat cabin** (`business-cabin-rows.tsx`, `business-cabin-header.tsx`) already uses CSS Grid with auto-sized columns, which is inherently responsive — no changes needed there.

The passenger panel (`seat-map-passenger-panel.tsx`) and legend (`seat-map-legend.tsx`) already structurally match the Figma mobile layout (74px seat-status column, name+badge rows, stacked legend) — expected to need no structural change, only a final visual check.

## Approach

Mobile-first, additive responsive fix: change only the **default (mobile)** Tailwind values and add `md:` overrides that restore the exact current desktop values, so desktop stays pixel-identical.

1. **`seat-map-dialog.tsx`** — tighten outer flex container and gray wrapper horizontal padding on mobile, preserve current values under `md:`.
2. **`seat-map.tsx`** — reduce the white seat-map container padding on mobile to match Figma's `py-4 px-2`, preserve `md:p-4`.
3. **`seat-column-groups.tsx`, `cabin-header.tsx`, `seat-map-row.tsx`** — replace fixed inter-seat/inter-group gaps with smaller mobile gaps (and/or fluid `justify-between` distribution to mirror Figma), restoring today's `gap-4`/`gap-2` via `md:` prefixes.
4. **`seat-size.ts`** — shrink `ROW_NUMBER_CLASSES` (aisle row-number spacer) on mobile, restore `w-11 h-11` via `md:`.
5. Leave business-cabin files, passenger panel, and legend untouched unless visual testing reveals an issue.

## Verification

- Load the seat map dialog in the live preview at mobile width (~375–390px) and compare side-by-side against the Figma screenshot provided, iterating on exact gap/padding values (the Figma export's raw HTML truncates some exact seat-row gap numbers, so final pixel tuning will be done visually against the reference).
- Re-check desktop (≥768px) afterward to confirm zero visual diff from before the change.

## Files to modify

- `apps/ibe-app/components/customize/seat-map/seat-map-dialog.tsx`
- `apps/ibe-app/components/customize/seat-map/seat-map.tsx`
- `apps/ibe-app/components/customize/seat-map/seat-column-groups.tsx`
- `apps/ibe-app/components/customize/seat-map/cabin-header.tsx`
- `apps/ibe-app/components/customize/seat-map/seat-map-row.tsx`
- `apps/ibe-app/components/customize/seat-map/seat-size.ts`

## Out of scope

- Business/ZipFullFlat cabin seat grid (already responsive)
- Seat data/column configuration (ABC/DEG/HJK groupings)
- Desktop layout/styling
