# Bundle page technical reference

## Scope and entry point

The bundle page lets travellers choose an optional bundle for each eligible passenger and each journey direction.

- Route: `apps/ibe-app/app/[locale]/bundles/[stage]/page.tsx:13`
  - Validates the URL `stage`, resolves its booking direction, and renders `BundleSelection`.
- Root shell: `apps/ibe-app/components/bundle/bundle.tsx:30`
  - Fetches offers, persists confirmed choices, shows loading, and forwards API failures to the app error boundary.
- Main view model: `apps/ibe-app/modules/hooks/bundle/use-bundle-package-selection/use-bundle-package-selection.ts:62`
  - Owns local selection state, interaction rules, validation, availability, and navigation.

## Component structure

```text
BundleSelection (bundle.tsx)
├── BundleHeading
└── BundlePackageSelection
    ├── BundlePackageSelectionAlerts
    ├── BundleOfferOverview
    │   ├── UnavailableAlert (seat-fee eligibility information)
    │   ├── BundlePriceCards
    │   ├── BundleComparisonTable
    │   └── TicketChangeOptionDialog (Flex Biz confirmation)
    └── PassengerBundleSelection
        ├── PassengerBundleTable
        │   ├── PassengerBundleTableDesktop
        │   └── PassengerBundleTableMobile
        └── BookingFooter
```

Component locations are under `apps/ibe-app/components/bundle/`. `bundle-package-selection.tsx:10` obtains all page data and callbacks from `useBundlePackageSelection` and passes them to presentation components.

## Offer API flow

```text
BundleSelection
  → buildRetrieveOfferBundlesRequest()
  → fetchBundleOffers Redux thunk
  → retrieveOfferBundlesBySdk()
  → POST /api/offers/bundles?currency=<currency>
  → fetchOfferBundles() SDK call
  → POST /offers/bundles
```

### Request construction

`apps/ibe-app/components/bundle/bundle.tsx:53-79`

1. Waits for a confirmed flight and at least one passenger.
2. Calls `buildRetrieveOfferBundlesRequest`.
3. Dispatches `fetchBundleOffers({ locale, request })` whenever the locale or request payload changes.

`apps/ibe-app/store/slices/bundle-offers/bundle-offers.slice.ts:93-206`

- `toOffersFlights()` converts each selected flight segment to an offer-flight object. It requires a valid scheduled departure datetime and throws if it is missing/invalid.
- `countPassengers()` maps passenger codes to the API buckets:
  - `adult` / `adt` → `adult`
  - `childa` / `chd` → `childA`
  - `childb` → `childB`
  - `childc` → `childC`
  - `infant` / `inf` → `infant`
  - unknown codes are ignored.
- `buildBundleRequestBody()` requires the first outbound segment origin and destination. It sends route, passenger counts, outbound flights, and inbound flights only when an inbound bound exists.
- `buildRetrieveOfferBundlesRequest()` requires `confirmedFlight.currency`.

The request body is `NEXUZR004OffersBundleRequest` with `routes`, passenger counts, `outbound`, and optional `inbound`. The top-level request also contains `currency`.

### Client service and BFF

- Redux thunk: `apps/ibe-app/store/slices/bundle-offers/bundle-offers.slice.ts:212-233`
  - Calls `retrieveOfferBundlesBySdk` and normalizes failures with `getBundleApiError`.
  - Its `condition` avoids duplicate/unnecessary fetches via `shouldFetchBundleOffers`.
- Client service: `apps/ibe-app/modules/services/bundle-offers/bundle-offers.service.ts:195-228`
  - Calls the local `/booking/api/offers/bundles` endpoint through the SDK client and includes the client-reference header.
- BFF route: `apps/ibe-app/app/api/offers/bundles/route.ts:12-41`
  - Accepts `POST` only.
  - Requires the `currency` query parameter; otherwise returns HTTP 400.
  - Reads the JSON body, converts it to the SDK request, and calls `fetchOfferBundles`.
  - Returns backend data as JSON. SDK failures return normalized JSON with `error`, optional `code`, and an HTTP status (normally 502 when no backend status is available).
- SDK endpoint: `packages/sdk/swagger/apis/OffersApi.ts:43-135`
  - `POST /offers/bundles?currency=<currency>`.

The response is `NEXUZR004OffersBundleResponse`, whose `data` is segment-wise bundle availability keyed by `lfid`; see `packages/sdk/swagger/models/NEXUZR004OffersBundleResponse.ts:29` and `NEXUZR004OffersSegmentWiseBundle.ts:29`.

### API error rendering

`bundle.tsx:124-126` throws `getBundleBoundaryError(bundleOffersError)` after a failed non-pending request. `apps/ibe-app/modules/utils/helpers/bundle/bundle-api-error/bundle-api-error.ts:18-48` maps the normalized error to an error-boundary message/code. The application error page renders the localized error state in `apps/ibe-app/app/[locale]/error.tsx:34-46`.

## Selection model and persistence

### State owner

`useBundlePackageSelection.ts:256-265` owns direction-specific local state:

- `outboundSelection` / `inboundSelection`: `{ passengerId: bundleCode }` maps.
- `outboundApplyToAll` / `inboundApplyToAll`: independent per-direction mode.
- `showValidation`: enables missing-selection feedback after Proceed.
- `hasSelectionInteraction`: prevents limited-capacity warnings before the user interacts.
- `pendingFlexBiz` and `flexBizDialogOpen`: defer Flex Biz assignment until the modal is confirmed.

At initialization, `storedSelection` restores the current segment from `bundleOffers.selectedBundlesBySegment`; if absent, it falls back to bundles already stored for passengers (`use-bundle-package-selection.ts:79-92`). The direction effect loads that value into the outbound or inbound selection map (`:267-273`).

### Choosing a bundle

- Standard bundle choice: `onSelectionChange` at `use-bundle-package-selection.ts:434-443` marks the page as interacted with and writes the bundle code to the current direction map.
- Flex Biz (`FLBS`): the same function opens a confirmation modal instead of applying immediately.
- Apply to all: `onApplyToAllChange` at `:417-432` updates the current direction only. Turning it on clears individual selectable-passenger choices so the next all-passenger choice can be applied consistently.
- Forced No Bundle: the effect at `:404-415` sets every selectable passenger to `NOBN` when all offers are unavailable or the purchase deadline has passed.
- Accompanying-child groups: `passengersGroups` at `:169-254` creates `unavailable-group` rows for eligible adult/child relationships. Such rows show only `NOBN`; their IDs are excluded from selection validation.

### Flex Biz confirmation

`confirmFlexBizSelection` at `use-bundle-package-selection.ts:320-344` applies `FLBS` only after confirmation from `ticket-change-option-dialog/ticket-change-option-dialog.tsx:16`.

- For one passenger, the chosen passenger receives `FLBS`.
- In apply-to-all mode, eligible passenger rows receive `FLBS` only until its remaining capacity is reached; any remaining eligible passengers receive `NOBN`.
- Unavailable passenger groups always receive `NOBN`.

### Proceed and Redux persistence

`onProceedClick` at `use-bundle-package-selection.ts:446-474`:

1. Blocks navigation if any selectable passenger is unselected.
2. Calls the shell’s `onProceed` callback with both direction maps.
3. Navigates to the next booking-flow route through `getNextBookingFlowPath`.

`handleProceed` in `bundle.tsx:81-121` then:

1. Builds the selected bundle payload with `buildSelectedBundle`.
2. Stores the current segment selection map in `bundleOffers.selectedBundlesBySegment` through `setSelectedBundles`.
3. Adds selected bundle details, including matching API passenger-type category data, to each passenger using `setBundles`.

## Alerts and exact trigger conditions

There are no toast notifications in this feature. Alerts and the Flex Biz modal are used instead.

| UI | Source | Trigger |
| --- | --- | --- |
| No bundles available | `bundle-package-selection-alerts/bundle-package-selection-alerts.tsx:22-69` | `allBundlesUnavailable` is true. The UI instructs users to choose No Bundle only. |
| Purchase deadline exceeded | Same file | `isBundlePurchaseDeadlineExceeded` is true. The message includes `bundleDeadlineHours`. |
| Bundle out of stock | Same file | At least one non-`NOBN` bundle is absent from `availableBundleIds`, while not all bundles are unavailable. One alert is shown per unavailable bundle. |
| Limited availability | Same file | The user has interacted (`hasSelectionInteraction`) and selected at least one limited-capacity bundle (`limitedBundleIds`). Copy differs for apply-to-all versus individual selection. |
| No selection at all | Same file | Proceed was attempted and no selectable passenger has a chosen bundle. |
| Missing selections for named passengers | `passenger-bundle-table/passenger-bundle-table.tsx:78-82` | Proceed was attempted and only some selectable passengers lack a bundle. |
| Seat-selection eligibility information | `bundle-offer-overview/unavailable-alert/unavailable-alert.tsx:9-41` | `showEligibilityBanner` is true. The information alert is expandable/collapsible. |
| Flex Biz confirmation | `ticket-change-option-dialog/ticket-change-option-dialog.tsx:16-77` | User chooses `FLBS` from a passenger cell or price-card action. Confirm applies the pending selection. |
| Full-page API error | `bundle.tsx:124-126` | Bundle offer request failed after loading completed. Routed to the application error boundary. |

## Availability, deadline, capacity, and eligibility restrictions

### Bundle availability

- `getAvailableBundleIds`: `apps/ibe-app/modules/utils/helpers/bundle/bundle.helpers.tsx:56-88`
  - Selects API offers for the active segment LFID.
  - Intersects bundle codes across matching offer rows, so a bundle must be available for every relevant returned row to be selectable.
- `isAllBundlesUnavailable`: `bundle.helpers.tsx:90-115`
  - Determines whether no sellable bundle remains (and supports the backend availability override code).
- `isBundleDisabled`: `use-bundle-package-selection.ts:124-131`
  - All bundle codes except `NOBN` are disabled when the deadline is exceeded, all bundles are unavailable, or that specific bundle is unavailable.

### Purchase deadline

`apps/ibe-app/modules/hooks/common/departure-deadline/departure-deadline.ts:14-46`

- A deadline is exceeded when departure is at or inside the configured threshold, including past departures.
- Threshold: **24 hours** for NRT–ICN; **48 hours** for all other routes.
- When exceeded, non-`NOBN` options are disabled and all selectable passengers are set to `NOBN`.

### Capacity

- `getBundleCapacities`: `bundle.helpers.tsx:132-164`
  - Uses adult/ADT API rows and keeps the lowest `actualQuantity` among matching rows as the bundle capacity.
- `limitedBundleIds`: `use-bundle-package-selection.ts:381-388`
  - A chosen non-`NOBN` bundle is considered limited when its capacity is lower than the number of selectable passenger rows.
- Capacity is enforced during Flex Biz apply-to-all confirmation. Other limited choices surface a warning; they are not globally blocked by the hook.

### Child/route eligibility display rule

`showEligibilityBanner` at `use-bundle-package-selection.ts:287-310` is true when an accompanying non-adult passenger has a date of birth and is:

- age 0–6 on standard routes; or
- age 0–14 on routes connected to YVR.

The banner explains the waived advance seat-selection fee. It is informational and does not itself change request data.

## Validation rules

`use-bundle-package-selection.ts:346-402`

- Only `kind: "passenger"` rows are selectable and required for validation.
- `unavailable-group` rows are excluded because they are fixed to `NOBN`.
- Pressing Proceed with no eligible passenger selected shows the top-level generic error.
- Pressing Proceed with a partial selection identifies each missing passenger by display name in the table-level error.
- No validation message is shown before Proceed, except availability/deadline/stock conditions described above.

## Key functions by responsibility

| Responsibility | Function / location |
| --- | --- |
| Build API request | `buildRetrieveOfferBundlesRequest`, `bundle-offers.slice.ts:189-206` |
| Fetch and normalize API result | `fetchBundleOffers`, `bundle-offers.slice.ts:212-233` |
| Local BFF forwarding | `POST`, `app/api/offers/bundles/route.ts:12-41` |
| Main page selection logic | `useBundlePackageSelection`, `use-bundle-package-selection.ts:62-505` |
| Resolve active segment | `getBundleSegment`, `bundle.helpers.tsx:21-42` |
| Determine availability | `getAvailableBundleIds`, `bundle.helpers.tsx:56-88` |
| Determine capacity | `getBundleCapacities`, `bundle.helpers.tsx:132-164` |
| Build persisted passenger bundles | `buildSelectedBundle`, `bundle.helpers.tsx:278-310` |
| Handle page submit and persistence | `handleProceed`, `components/bundle/bundle.tsx:81-121` |
| Render booking footer | `booking-footer/booking-footer.tsx:6-27` |
