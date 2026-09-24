# Confirmation page background alignment

## Goal
Match the Figma "Surface-Gray" (`#F1F4F5`) background behind the itinerary,
transit, outbound, inbound, passenger summary, and taxes content. The
"Passenger Information" section belongs to the lower white background section,
along with Issuance of Receipt, Newsletter Subscription, and Precautions. This
matches the existing (previously unimplemented) `{/* Section 2: ... distinct
background */}` comment already in the code.

This is a background-color-only change — no layout restructuring, no new
components, no changes to spacing/content/behavior. Scope is contained to the
confirmation page's own centered content column (no full-bleed / shared
layout changes), per user confirmation.

## Design token
`#F1F4F5` already exists in the design system as `--gray-100` / `--base-100`
(`packages/ui/styles/global.css`). Use the existing Tailwind utility
`bg-base-100` (or `bg-gray-100`, whichever is the established convention in
`apps/ibe-app`) rather than a raw hex value or a new token.

## Implementation

File: `apps/ibe-app/components/confirmation/confirmation.tsx`

1. Wrap the existing gray-background content (itineraries, transit info,
   Outbound heading + PassengerSummaryCard + TaxesSummaryCard, and Inbound
   heading + PassengerSummaryCard + TaxesSummaryCard) in an outer container
   with `bg-base-100`. Keep the current inner `flex flex-col gap-4 px-4 py-2
   md:px-0` structure nested inside this wrapper so no spacing changes occur —
   only add the background color and enough padding for the gray surface to be
   visible around the white bordered cards.
2. Move `<PassengerInformation />` into the lower white-background wrapper
   together with `IssuanceOfReceipt`, `NewsletterSubscription`, and
   `Precautions`. Make that wrapper explicitly `bg-white`, replacing the stale
   `distinct background` comment with the real styling. Preserve the existing
   component order: Passenger Information, Issuance of Receipt, Newsletter,
   then Precautions.
3. Do not touch `apps/ibe-app/app/[locale]/layout.tsx` or any other shared
   layout/page — the color change stays local to the `Confirmation` component
   tree.

## Validation
- Visual check in the live preview at both desktop and mobile widths: gray
  region visible through the outbound/inbound taxes content, then white from
  Passenger Information through the booking footer area.
- Run Biome format/lint and `pnpm --filter ibe-app check-types` on the
  modified file.
- No other confirmation sub-components need edits.
