# Completion Page — Pass 1 (Header + Reservation + Flight Details)

## Scope
Build the new post-purchase "Completion" page, starting with the top of the Figma frame only:
1. Success header ("Your purchase has been completed.")
2. Reservation number banner (with "Manage your booking" button)
3. Flight Details section (Outbound / Inbound cards)

Deferred to later passes (per user decision): "Status of Your Travel Information Registration" table + Sherpa visa widget, and the bottom promotional banners / 3x3 service card grid. Do not stub these out — just don't build them yet.

Data: hardcoded mock data in the page component, following the same pattern as `confirmation.tsx` (arrays/props inline, ready to be swapped for real data later).

## Reused existing code
- `FlightItineraryCard` (`apps/ibe-app/components/confirmation/flight-itinerary-card/flight-itinerary-card.tsx`) — already pixel-matches the Figma flight cards (airport codes, times/dates, duration line with plane icon, Outbound/Inbound + flight number pill badges). Reuse as-is, no changes needed.
- `Icon` component (`@repo/ui/components/icon`) for the `check_circle` success icon (Material Symbols Rounded, color `#008568` → map to existing green token, e.g. `text-primary-600`/`Icon-Green` equivalent).
- `Button` component (`packages/ui/components/button` or wherever shadcn Button lives) for "Manage your booking" — outline variant, primary color, matches `state=enable, size=md, isOutline=true, color=primary`.
- Design tokens from `packages/ui/styles/global.css` (colors, spacing, radius, typography) — reuse existing tokens (`primary-700`, `primary-600`/`Icon-Green`, base/gray scale, border radius `rounded-lg`, spacing scale) rather than introducing new ones. Confirm token names for `Info-100`/`Info-800`-equivalent (used for the reservation banner's light green background `#EBF7F4` / heading text `#00523F`) — check if `success-*` or a light green surface token already exists before adding anything new.

## New component structure
Location: `apps/ibe-app/components/completion/` (mirrors `apps/ibe-app/components/confirmation/` structure).

- `apps/ibe-app/components/completion/completion.tsx` — top-level client component, analogous to `confirmation.tsx`. Renders:
  - Success header block (icon + h1 title + description paragraph)
  - `ReservationNumberBanner` (reservation number + "Manage your booking" button)
  - Flight Details heading + responsive grid of `FlightItineraryCard` (outbound/inbound), same grid pattern as confirmation page (`grid-cols-1 md:grid-cols-2`)
- `apps/ibe-app/components/completion/reservation-number-banner/reservation-number-banner.tsx` — new small component for the green reservation number box with title, big reservation number, and outline button. Props: `reservationNumber`, `title` label, `manageBookingLabel`, `onManageBooking`.
- `apps/ibe-app/app/[locale]/completion/page.tsx` — new route, following the exact pattern of `apps/ibe-app/app/[locale]/confirmation/page.tsx` (metadata via `generatePageMetadata` with a new `completion_page` namespace).

## i18n
Add a new `completion_page` namespace to `apps/ibe-app/messages/en.json` (no existing "completion" keys found) with keys such as:
- `title` ("Your purchase has been completed.")
- `subtitle` (the itinerary-sent description text)
- `reservation_number_label`
- `manage_booking_button`
- `flight_details_title` (if a section heading is present)
- `outbound_label` / `inbound_label` (reuse same strings as `confirmation_page` — check if these can be shared or must be duplicated per existing i18n conventions in the repo)

## Layout/responsiveness
- Follow the same responsive container pattern as `confirmation.tsx`: `mx-auto w-full max-w-5xl` content width, `px-4 md:px-0` padding, stacking to single column on mobile.
- Success header: icon + heading in a flex row on desktop; wrap gracefully on small screens (icon above/beside text, no fixed widths).
- Reservation banner: fixed-looking two-column layout (info left, button right) in Figma — implement as flex row that wraps to column on narrow viewports (button below reservation number) rather than the fixed `height:108px` from the raw export.
- Flight cards grid: reuse existing `grid-cols-1 md:grid-cols-2 gap-4` pattern already used in `confirmation.tsx`.
- No absolute positioning; convert all Figma inline styles to Tailwind classes using existing tokens.

## Implementation steps
1. Add `completion_page` translation namespace to `apps/ibe-app/messages/en.json` (and other locale files if present) with the strings above.
2. Create `ReservationNumberBanner` component with props for reservation number, labels, and click handler, styled with existing green surface/border tokens.
3. Create `completion.tsx` composing header, `ReservationNumberBanner`, and the Flight Details grid using the existing `FlightItineraryCard`, with hardcoded mock props (reservation number `AB1234`, outbound NRT→SJC, inbound SJC→NRT, matching the Figma copy).
4. Create `app/[locale]/completion/page.tsx` route wired to `generatePageMetadata` with the new namespace.
5. Verify in the dev server preview at `/en/completion` (or equivalent locale route) that spacing, colors, and typography match the Figma screenshot, and that the layout is responsive across mobile/tablet/desktop.
