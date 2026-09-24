# Plan: Unify passenger-related slices into passenger.slice

## Scope
Merge `selected-services`, `bundle-offers.selectedBundle` (catalog response stays), and new `seats[]` into `passenger.slice` as single source of truth per passenger. `customer-information` slice stays untouched. Full consumer refactor (no alias shims).

## Decisions
- customer-information slice: excluded, stays as-is
- seats: new feature, added to type and reducers
- bundle-offers slice: keeps API response/catalog state (`data`, `request`, `isPending`, `error`); only `selectedBundle` sub-state moves to passenger
- selected-services slice: fully removed after migration
- backward compat: full refactor of consumers (no alias selectors)
- Persistence: `selectedServices` whitelisted key needs removal; `passenger` slice already persisted

---

## Phase 1: Types

File: `apps/ibe-app/types/passenger/passenger.type.ts`
- Add `PassengerSeat` type (lfid, pfid, row, column, serviceCode, amount, bundleCode)
- Add `PassengerService` type (lfid, pfid, amount, categoryId, ssrCode, serviceID, chargeComment, bundleCode)
- Add `PassengerBundle` type (lfid, pfid, bundleCode, amount, categoryId, serviceID)
- Extend `PassengerValues` with optional `seats?: PassengerSeat[]`, `services?: PassengerService[]`, `bundles?: PassengerBundle[]`
- Update `PassengerNameState` if needed (submitted flag stays)

## Phase 2: Passenger Slice

File: `apps/ibe-app/store/slices/passenger/passenger.slice.ts`
- Add reducers:
  - **Seats**
    - `setSeats(state, action: PayloadAction<{ passengerId: string; lfid: number; seats: PassengerSeat[] }>)` — replace seat array for passenger on specific leg
    - `addSeat(state, action: PayloadAction<{ passengerId: string; lfid: number; seat: PassengerSeat }>)` — append; replace if same lfid+pfid already exists
    - `updateSeat(state, action: PayloadAction<{ passengerId: string; lfid: number; seat: PassengerSeat }>)` — partial merge by lfid+pfid
    - `removeSeat(state, action: PayloadAction<{ passengerId: string; lfid: number; pfid: number }>)` — remove by passengerId + lfid + pfid
    - `clearSeats(state, action: PayloadAction<{ passengerId: string; lfid: number }>)` — wipe seats for passenger on specific leg
  - **Bundles**
    - `setBundles(state, action: PayloadAction<{ passengerId: string; lfid: number; bundles: PassengerBundle[] }>)` — replace bundle array for passenger on specific leg
    - `updateBundle(state, action: PayloadAction<{ passengerId: string; lfid: number; bundle: PassengerBundle }>)` — merge by passengerId + lfid + pfid
    - `clearBundles(state, action: PayloadAction<{ passengerId: string; lfid: number }>)` — wipe bundles for passenger on specific leg
  - **Services**
    - `addService(state, action: PayloadAction<{ passengerId: string; lfid: number; service: PassengerService }>)` — append; replace if same lfid+ssrCode+serviceID already exists
    - `removeService(state, action: PayloadAction<{ passengerId: string; lfid: number; ssrCode: string; serviceID: string }>)` — remove by passengerId + lfid + ssrCode + serviceID
    - `updateService(state, action: PayloadAction<{ passengerId: string; lfid: number; service: PassengerService }>)` — partial merge by passengerId + lfid + ssrCode + serviceID
    - `clearServices()` — wipe all services across all passengers
- Keep existing `setPassengerNames` and `updatePassenger` extraReducer

## Phase 3: New Selectors for passenger slice

File: `apps/ibe-app/store/slices/passenger/passenger.slice.ts` (or a new `passenger.selectors.ts` alongside)
- `selectPassengers(state)` — state.passenger.passengers
- `selectPassengerById(state, id)` — find by id
- `selectAllPassengerServices(state)` — flatten all services
- `selectServicesByPassengerId(state, id, lfid)` — services for one passenger on specific leg
- `selectAllPassengerBundles(state)` — flatten all bundles
- `selectBundlesByPassengerId(state, id, lfid)` — bundles for one passenger on specific leg
- `selectSeatsByPassengerId(state, id, lfid)` — seats for one passenger on specific leg

## Phase 4: Remove selected-services slice

File: `apps/ibe-app/store/slices/common/selected-services/selected-services.slice.ts`
- Delete file after all consumers migrated (Phase 6)

File: `apps/ibe-app/types/customer-information/selected-services.types.ts`
- Types to move/reuse in `passenger.type.ts` (align field names with TOBE)

## Phase 5: Trim bundle-offers slice

File: `apps/ibe-app/store/slices/bundle-offers/bundle-offers.slice.ts`
- Remove `selectedBundle` from `BundleOffersState`
- Remove `setSelectedBundle` reducer
- Keep `data`, `request`, `isPending`, `error` and `fetchBundleOffers` thunk unchanged

File: `apps/ibe-app/types/bundle-offers` (wherever SelectedBundle types live)
- Move `SelectedBundlePassenger`, `SelectedBundleEntry` types to `passenger.type.ts` or inline in passenger types

## Phase 6: Update all consumers

Use grep for: `selectSelectedBundle`, `setSelectedBundle`, `selectAllSelectedServices`, `selectSelectedServicesByPassenger`, `addService`, `removeService`, `updateService`, `setSelectedServices`, `clearSelectedServices` across `apps/ibe-app/`

Components likely affected (from exploration):
- Bundle selection page/component — uses `setSelectedBundle`, `selectSelectedBundle`
- Extras/ancillary components — uses `addService`, `removeService`, `updateService`
- Booking summary/review — uses `selectAllSelectedServices`, `selectSelectedBundle`
- Order submit/checkout — aggregates services + bundles per passenger

For each consumer: swap old action/selector import with new passenger slice equivalents.

## Phase 7: Store registration + persistence

File: `apps/ibe-app/store/index.ts`
- Remove `selectedServices` reducer from `combineReducers`
- Remove `selectedServices` from persistence whitelist
- `passenger` slice already whitelisted — no change needed
- `bundleOffers` stays registered (still has catalog state)

## Phase 8: Verification

1. `pnpm typecheck` — zero TS errors
2. `pnpm test` — existing vitest tests pass
3. Manual: go through full booking flow (flight select → bundles → extras → review → submit) and verify no regression
4. Check Redux DevTools that `passenger` state correctly contains seats/services/bundles after each step
5. Verify `selectedServices` key no longer appears in persisted state (localStorage/storage)
6. Grep for any remaining imports from `selected-services.slice` — should be zero

---

## Relevant files

- `apps/ibe-app/types/passenger/passenger.type.ts` — extend PassengerValues + new sub-types
- `apps/ibe-app/store/slices/passenger/passenger.slice.ts` — add reducers + selectors
- `apps/ibe-app/store/slices/common/selected-services/selected-services.slice.ts` — DELETE after Phase 6
- `apps/ibe-app/types/customer-information/selected-services.types.ts` — migrate/delete types
- `apps/ibe-app/store/slices/bundle-offers/bundle-offers.slice.ts` — remove selectedBundle state
- `apps/ibe-app/store/index.ts` — remove selectedServices from combineReducers + whitelist
- All components under `apps/ibe-app/components/` that import from removed slices

## Parallelism notes
- Phase 1 and research (Phase 6 grep) can start in parallel
- Phase 2 depends on Phase 1 (types must exist)
- Phase 3 depends on Phase 2
- Phase 4, 5 can run in parallel after Phase 3
- Phase 6 depends on Phase 3 (new selectors/actions available)
- Phase 7 depends on Phase 4+6
- Phase 8 last
