# Confirmation Page Modules Plan

## Recommended approach

Build the confirmation page incrementally in `apps/ibe-app/app/[locale]/confirmation/page.tsx`, using static fixture data for the demos until the Figma sequence and booking-data mapping are provided. Keep the current route-level demo approach for Module 1, preserve the existing design tokens and responsive layout, and avoid changing the currently working shared design system.

## Module sequence

1. **Flight Information card**
   - Replace the first-pass itinerary markup with the Figma-matched flight information presentation.
   - Reuse the existing flight display conventions and route details where they match the design.
   - Support the relevant trip type shape (one-way, round trip, and multi-segment if shown by the Figma).
   - Validate mobile and desktop behavior in the confirmation route.

2. **Confirm section based on trip type**
   - Add the confirmation content after the flight information card.
   - Render passenger sections from static fixture data.
   - Add accessible expand/collapse controls for multiple passengers with `aria-expanded` and keyboard support.
   - Keep the section structure ready for later real booking-data integration.

3. **Tax breakdown**
   - Add the Figma tax and fare breakdown using existing fare/tax type conventions where applicable.
   - Preserve currency, total, and row hierarchy from the design.

4. **Passenger Information**
   - Add the passenger summary information in the order and grouping specified by the Figma.
   - Reuse existing passenger display conventions only where their visuals match; do not force unrelated customer-information interactions into the confirmation page.

5. **Receipt issuance**
   - Add the receipt-issuance state, copy, and action defined by the Figma.
   - Keep the initial implementation presentational until the receipt service/API contract is supplied.

6. **Precautions**
   - Add the precaution content using the existing precaution styling and translated-message conventions where appropriate.
   - Preserve readable spacing, semantic lists, and responsive behavior.

## Validation and integration

- Use the Figma export for each module as the source of truth for typography, spacing, colors, radius, shadows, sizing, and interactions.
- Keep inline styles out of the route and use descriptive classes with existing Tailwind v4 tokens.
- Add focused tests when a module introduces interaction, especially passenger accordion behavior.
- Run the confirmation route type check and lint after each module.
- Validate the complete route in the live preview after all modules are assembled.

## Critical files

- `apps/ibe-app/app/[locale]/confirmation/page.tsx`
- `apps/ibe-app/components/flight-selection/flight-information/flight-info.tsx`
- `apps/ibe-app/types/flight-selection-routes.ts`
- `apps/ibe-app/components/customer-information/passenger-details/passenger-card/passenger-card.tsx`
- `apps/ibe-app/components/customer-information/customer-information.tsx`
- `apps/ibe-app/messages/en.json`
- `packages/ui/components/card.tsx`
- `packages/ui/components/button.tsx`
- `packages/ui/styles/global.css`
