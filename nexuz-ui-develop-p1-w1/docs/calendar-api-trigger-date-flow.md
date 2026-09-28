# Calendar API Trigger and Date Flow

This note explains when the calendar fares API is triggered and how dates move through the flow.

## 1) Trigger point in UI

- The dispatch starts in [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L108).
- It calls [fetchCalendarFares](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L109) with:
  - locale from route params at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L37)
  - request payload built at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L93)
  - loadedRange passed at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L112)

## 2) When it triggers

- Initial modal open load:
  - computes next window at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L138)
  - checks if load is needed at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L140)
  - requests fares at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L146)
- Lazy load on month change:
  - tracks visible months at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L150)
  - checks extended visible range at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L170)
  - requests next window when needed at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L184)

## 3) Date construction in request payload

- Outbound start date uses rangeToFetch.from at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L95).
- Round-trip inbound date is set to next day of from-date via getNextDate:
  - next-day helper at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L46)
  - departureDateTo assignment at [apps/top-app/components/flight-search/calendar/calendar-content.tsx](apps/top-app/components/flight-search/calendar/calendar-content.tsx#L96)

## 4) Date window logic

- Window generation rule is in [apps/top-app/lib/calendar-fare-utils.ts](apps/top-app/lib/calendar-fare-utils.ts#L164):
  - from = input date
  - to = last day of month two months ahead
- Coverage check for already-loaded data is in [apps/top-app/lib/calendar-fare-utils.ts](apps/top-app/lib/calendar-fare-utils.ts#L129).
- String-to-Date conversion used during checks is in [apps/top-app/lib/calendar-fare-utils.ts](apps/top-app/lib/calendar-fare-utils.ts#L182).

## 5) API call path

- Thunk entry is in [apps/top-app/store/slices/calendar-fares.slice.ts](apps/top-app/store/slices/calendar-fares.slice.ts#L105).
- It calls SDK service at [apps/top-app/store/slices/calendar-fares.slice.ts](apps/top-app/store/slices/calendar-fares.slice.ts#L111).
- SDK service builds localized base URL and calls BFF endpoint in [apps/top-app/modules/services/calendar-fares-sdk.service.ts](apps/top-app/modules/services/calendar-fares-sdk.service.ts#L24).

## 6) Response date normalization and storage

- Date normalization for API date keys is in [apps/top-app/store/slices/calendar-fares.slice.ts](apps/top-app/store/slices/calendar-fares.slice.ts#L78).
- Outbound fares are merged by normalized date at [apps/top-app/store/slices/calendar-fares.slice.ts](apps/top-app/store/slices/calendar-fares.slice.ts#L142).
- Inbound fares are merged by normalized date at [apps/top-app/store/slices/calendar-fares.slice.ts](apps/top-app/store/slices/calendar-fares.slice.ts#L182).
- The loaded request range is recorded at [apps/top-app/store/slices/calendar-fares.slice.ts](apps/top-app/store/slices/calendar-fares.slice.ts#L222).