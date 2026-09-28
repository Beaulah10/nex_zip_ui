# Confirmation "passenger summary" accordion card

## Goal
Add the "Confirmation/top" passenger price-summary section from Figma below the
existing "Outbound" heading on the confirmation page. Unlike the earlier
throwaway version (which reused `PassengerService`), this time build proper
shared components (an accordion + icon button) so the collapse/expand
behavior and per-row bordered "Change" boxes match the design, and so the
pieces are reusable elsewhere.

## New shared components (packages/ui)

1. **`packages/ui/components/accordion.tsx`**
   - shadcn-style `Accordion`, `AccordionItem`, `AccordionTrigger`,
     `AccordionContent`, built on the already-installed `radix-ui` bundle
     package (`import { Accordion as AccordionPrimitive } from "radix-ui"`)
     — no new dependency needed (`@radix-ui/react-accordion` is not
     installed separately, but the umbrella `radix-ui` package already used
     by `wrapper.tsx`/`badge.tsx` re-exports it).
   - Follow existing conventions: `cn()`, `data-slot` attributes, animated
     open/close via Tailwind (`data-[state=open]` classes), forwarded refs.

2. **`packages/ui/components/icon-button.tsx`**
   - Small `cva`-based round/pill icon button (outline, primary color,
     xxs/sm/md sizes) matching the Figma "Icon Button" component
     (`isPill:true, isOutline:true, color:primary`). Generalizes the ad-hoc
     pattern currently hand-rolled in `baggage-counter-card.tsx`.
   - Renders a single `Icon` child; supports `asChild` so it can be used as
     the `AccordionTrigger`.

## New feature components (apps/ibe-app/components/confirmation)

3. **`components/confirmation/passenger-summary-card/passenger-summary-card.tsx`**
   - Wraps `Accordion` (`type="single" collapsible`, default open per Figma
     `Expanded=True`).
   - Header row (always visible, acts as trigger): `person` icon, passenger
     name (bold 20px), total price (bold 24px, primary-700), and the round
     `IconButton` chevron that swaps `expand_less`/`expand_more` based on
     `data-state`.
   - `AccordionContent`: divider, then a list of `SummaryRow`s.
   - Props:
     ```ts
     interface SummaryLineItem { label: string; price?: number }
     interface SummaryRowData {
       icon: string;
       label: string;
       items: SummaryLineItem[];
       note?: string;          // e.g. Seat Type's "*start your flight search again" text
       changeLabel?: string;   // defaults to t("ancillary_service.change_button")
       onChange?: () => void;  // omit to hide the Change button (e.g. Seat Type row)
     }
     interface PassengerSummaryCardProps {
       name: string;
       totalPrice: number;
       rows: SummaryRowData[];
       defaultOpen?: boolean;
       className?: string;
     }
     ```

4. **`components/confirmation/passenger-summary-card/summary-row/summary-row.tsx`**
   - Left: icon (24px, primary-700) + bold label.
   - Right: bordered box (`border-base-300 rounded-lg`) containing one or
     more line items (label left, price right in primary-700 bold), each
     separated by a divider when there are multiple; single `Change` button
     vertically centered/spanning via flex, shown only when `onChange` is
     provided (Seat Type row shows a note instead, no button).

## Wiring into the confirmation page

5. **`apps/ibe-app/components/confirmation/confirmation.tsx`**
   - Import `PassengerSummaryCard` and render one instance below the
     "Outbound" section heading and a second instance below a new "Inbound"
     section heading (mirroring the same heading/divider pattern), so both
     legs get their own passenger price-summary accordion.
   - Both instances use the same hardcoded sample data validated from the
     Figma "Confirmation/top" frame (name `YAMADA TARO`, total `795593`) —
     rows: Bundle, Seat Type, Seat, Baggage (4 sub-items), In-flight meal,
     Priority services, Airport lounge, Transport services, Ancillary
     optional Services (3 sub-items). This mirrors the existing
     `FlightItineraryCard` pattern of static props, easy to swap for real
     booking data later.
   - `onChange` handlers and the header's expand/collapse toggle are
     visually functional but wired to no-op callbacks (e.g. empty arrow
     functions) since there's no backend action yet.
   - Icon mapping (reusing names already used elsewhere in the app):
     `trip` (Bundle), `airline_seat_recline_normal` (Seat Type),
     `event_seat` (Seat), `luggage` (Baggage), `restaurant` (In-flight meal),
     `schedule` (Priority services), `weekend` (Airport lounge),
     `airport_shuttle` (Transport services), `sell` (Ancillary optional
     Services). These are close approximations of the Figma glyphs and can
     be swapped for exact icon names during review.

## Translations
   - Reuse `ancillary_service.change_button` ("Change") for the row action.
   - Add new keys under `confirmation_page` in both `messages/en.json` and
     `messages/ja.json`: `bundle_label`, `seat_type_label`, `seat_label`,
     `baggage_label`, `meal_label`, `priority_services_label`,
     `airport_lounge_label`, `transport_services_label`,
     `ancillary_optional_services_label`, `seat_type_note`.

## Out of scope / follow-up
- Wiring the accordions to real booking data (instead of static sample
  props) and hooking up real "Change" navigation/dialogs is a follow-up,
  not part of this change.
