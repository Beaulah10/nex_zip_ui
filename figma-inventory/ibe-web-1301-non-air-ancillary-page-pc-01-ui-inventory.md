# Figma UI Inventory: IBE_WEB_1301_Non_Air_Ancillary_Page_PC_01

## Source

- Figma URL: https://www.figma.com/design/bKbmnibIMXEvV41PTvlQQR/IBE?node-id=16497-101924&m=dev
- Scope: selected frame
- Screen node: `16497:101924`
- Frame size: `1440 × 2308`
- Device: Desktop, explicit in the frame name
- Screenshot: `docs/figma-inventory/screenshots/ibe-web-1301-non-air-ancillary-page-pc-01.png`

## Screen Structure

The screen contains a `Header` instance (`26682:241514`) at `1440 × 340`, a `1024px` main content region (`16497:101927`), and a `BookingFooter` instance (`16497:101988`) at `1024 × 52`.

The header includes:

- ZIPAIR logo (`18:1192`)
- Japanese language selector
- Join ZIPAIR Point Club link
- Login button
- Route summary: Tokyo Narita (NRT) - San Jose (SJC), San Jose (SJC) - Tokyo Narita (NRT)
- Date summary: 6/11 - 6/18
- Fare summary: ¥314,992
- Summary dropdown
- Six-item stepper: Select Flights, Outbound Options, Inbound Options, Passenger Details, Insurance, Review & Confirm, Payment

The main content includes:

- Heading: `Outbound Ancillary - Optional Services`
- Subheading: `Choose the ancillary services for each passenger.`
- `Categories` region (`21936:53077`), with seven pills: All, Special Offers, Amenities, Food and Souvenirs, Snacks and Souvenirs, Clothes and Cosmetics, Others
- Six extracted product groups and 21 card instances, each card measuring `198 × 188`
- Selected `microwavable rice（pack of 12）` card (`16497:101964`) with a `20 × 20` `Radio_check`
- Total Amount `¥700`
- Proceed button with minimum width `256px`

## Component Inventory

- Unique component definitions or referenced definitions: 8 recorded entries
- `Internal/Card`: 21 instances
- `Anc/Inflight`: 21 image instances, `176 × 112`
- `Heading`: 5 instances, `28px` high
- `Stepper/Parts/Item`: 6 instances
- Category pills: 7 instances, `9999` radius
- `Radio_check`: 1 selected instance, `20 × 20`
- Code Connect mappings: none returned

## Product Groups

| Group | Node ID | Cards |
|---|---|---:|
| Special offers | `16497:101944` | 5 |
| Amenities | `16497:101958` | 2 |
| Food & Souvenirs | `16497:101961` | 2 |
| Snacks & Souvenirs | `22005:207214` | 2 |
| Clothes & Cosmetics | `16497:101972` | 5 |
| Others | `16497:101980` | 5 |

The metadata also contains continuation frame `22005:207442` with card `22005:207444`; its semantic group label is not explicit, so it is retained as a review item in the JSON inventory.

## Design Tokens

The exact variable output is stored in [ibe-web-1301-non-air-ancillary-page-pc-01-design-tokens.json](ibe-web-1301-non-air-ancillary-page-pc-01-design-tokens.json). Key values include:

- Primary green: `#007057`
- Accent green: `#008568`
- Body text: `#0d0d0f`
- Description text: `#494b4f`
- Field border: `#c7d1d6`
- Divider: `#e3e8eb`
- Noto Sans typography, with sizes `12`, `14`, `16`, `18`, `20`, and `36`
- Common spacing: `4`, `6`, `8`, `10`, `12`, `16`, `20`, `24`, `32`, and `56`
- Radii: `2`, `4`, `8`, and `9999`
- Main container: `1024`

## States and Accessibility

Explicitly represented states:

- `All` category pill is selected.
- The rice product card is selected.
- `Select Flights` is completed.
- `Outbound Options` is current.
- Remaining stepper items are upcoming and visually disabled.

Accessibility details requiring review:

- Product image nodes expose empty alt values in the returned reference code.
- Accessible names, keyboard order, focus behavior, and semantic roles are not available from Figma extraction.
- Confirm names and keyboard behavior for category pills, product cards, the selected radio control, Summary, Login, and Proceed.

## Availability and Review Items

- Code Connect map is empty.
- Parent Figma page name was not returned by metadata.
- No responsive variants were available in the selected scope.
- Prototype interactions, hover behavior, validation behavior, sticky behavior, loading states, empty states, and error states were not explicitly represented.
- Shadows and opacity values were not returned.

## Generated Files

- [ibe-web-1301-non-air-ancillary-page-pc-01-ui-inventory.json](ibe-web-1301-non-air-ancillary-page-pc-01-ui-inventory.json)
- [ibe-web-1301-non-air-ancillary-page-pc-01-design-tokens.json](ibe-web-1301-non-air-ancillary-page-pc-01-design-tokens.json)
- [ibe-web-1301-non-air-ancillary-page-pc-01-ui-inventory.md](ibe-web-1301-non-air-ancillary-page-pc-01-ui-inventory.md)
- [ibe-web-1301-non-air-ancillary-page-pc-01.png](screenshots/ibe-web-1301-non-air-ancillary-page-pc-01.png)
