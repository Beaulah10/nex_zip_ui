# Customize Screen Dialog Flow Refactor Plan

## Problem
Currently, the customize screen opens multiple nested dialogs simultaneously:
- **In-flight Meal:** outer dialog + meal list + meal detail (3 dialogs open at once)
- **Baggage:** outer dialog + baggage selection (2 dialogs open at once)
- **Transport Services:** outer dialog + service selection (2 dialogs open at once)

This creates a confusing UX with multiple modal layers and unclear navigation.

## Solution
Refactor to a **single-modal step-through flow** where:
1. One outer modal remains open throughout the interaction
2. Content within the modal switches between steps (e.g., passenger list → selected passenger's baggage picker)
3. "Confirm selection" saves the current step but keeps the modal open for further edits
4. Only the top-level "Confirm selection" button (when all passengers are done) closes the entire modal

## User Behavior (From Questions)
- **Modal flow:** Step-through in one modal (content changes, not new dialogs)
- **Confirm behavior:** Confirm saves current passenger's selection and keeps dialog open for more edits

## Affected Services
- **Baggage** (currently uses nested BaggageSelectionDialog)
- **In-flight Meal** (currently uses nested MealSelectionFlow → MealListDialog + MealSelectionDialog)
- **Transport Services** (currently uses nested TransportServiceSelectionDialog)
- **Priority Services** (already single dialog with SelectCustomers)
- **Airport Lounge** (already single dialog with SelectCustomers)

## Implementation Approach

### 1. Baggage Service
**Current flow:** Main dialog → per-passenger BaggageSelectionDialog
**New flow:** Main dialog with two content sections
- Add state: `selectedBaggagePassengerId: string | null`
- When user clicks Add/Change, set the selected passenger ID
- Conditionally render: passenger list OR current passenger's baggage UI
- Confirm button on baggage UI saves selection and clears `selectedBaggagePassengerId`
- Final "Confirm selection" on footer closes the entire dialog

### 2. In-flight Meal
**Current flow:** Main dialog → MealSelectionFlow (which opens MealListDialog then MealSelectionDialog)
**New flow:** Main dialog with step-through sections
- Add state: `selectedMealPassengerId: string | null`, `mealStep: 'list' | 'detail'`
- When user clicks Add/Change, set selected passenger and show meal list
- When user selects a meal from list, show meal detail for that meal
- Confirm on detail page saves and returns to meal list (not passenger list)
- Back/close from meal detail returns to meal list
- Close from meal list returns to passenger list
- Final "Confirm selection" closes the entire dialog

### 3. Transport Services
**Current flow:** Main dialog → TransportServiceSelectionDialog for each service's Add button
**New flow:** Main dialog with two content sections
- Add state: `selectedTransportServiceId: string | null`
- When user clicks Add on a service row, set the selected service ID
- Conditionally render: service list OR current service's passenger selection
- Confirm button on passenger selection saves and clears `selectedTransportServiceId`
- Final "Confirm selection" closes the entire dialog

### 4. Seat, Priority Services, Airport Lounge
**Status:** Already single-modal design
**Action:** No changes (use as reference for pattern)

## Key Changes to Files

### apps/ibe-app/components/customize/customize.tsx
**Add step-through state:**
- `const [selectedBaggagePassengerId, setSelectedBaggagePassengerId] = useState<string | null>(null)`
- `const [selectedMealPassengerId, setSelectedMealPassengerId] = useState<string | null>(null)`
- `const [mealStep, setMealStep] = useState<'list' | 'detail' | null>(null)`
- `const [selectedTransportServiceId, setSelectedTransportServiceId] = useState<string | null>(null)`

**Refactor JSX:**
- Baggage dialog: show `{!selectedBaggagePassengerId ? <PassengerList /> : <BaggageUI />}`
- Meal dialog: show appropriate step based on `mealStep` and `selectedMealPassengerId`
- Transport dialog: show `{!selectedTransportServiceId ? <ServiceList /> : <PassengerSelection />}`

**Wire handlers:**
- PassengerService Add/Change buttons call `setSelectedBaggagePassengerId(passengerId)`
- ActivityCard service Add buttons call `setSelectedTransportServiceId(serviceId)`
- Inner confirm buttons clear the selection state and return to list view
- Footer "Confirm selection" closes the dialog

### packages/ui/components/baggage-selection-dialog.tsx
- Either extract as a non-dialog component that can be rendered inside outer dialog
- Or simplify to content-only and pass as children instead of with Dialog wrapper

### packages/ui/components/meal-selection-flow.tsx
- Simplify to manage only list↔detail transitions (not opening separate dialogs)
- Or integrate logic directly into customize.tsx meal dialog section

### packages/ui/components/transport-service-selection-dialog.tsx
- Extract as a non-dialog component (or render content only inside outer dialog)
- Remove the Dialog wrapper; use just the content

### packages/ui/components/activity-card.tsx
- Keep for structure, but remove dialog trigger logic
- Service rows should call `onAdd` directly (state managed by parent)

## Rendering Pattern (Example for Baggage)
```tsx
<Dialog open={openDialogs.Baggage} onOpenChange={...}>
  <DialogContent>
    <DialogHeader>Baggage Services - Outbound</DialogHeader>
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
      {selectedBaggagePassengerId === null ? (
        // Show passenger list
        <div>
          {baggagePassengers.map((passenger) => (
            <PassengerService
              key={passenger.id}
              {...passenger}
              onAdd={() => setSelectedBaggagePassengerId(passenger.id)}
              onChange={() => setSelectedBaggagePassengerId(passenger.id)}
            />
          ))}
        </div>
      ) : (
        // Show baggage selection for selected passenger
        <BaggagePickerContent
          passenger={baggagePassengers.find(p => p.id === selectedBaggagePassengerId)}
          onConfirm={() => {
            // Save data
            setSelectedBaggagePassengerId(null); // Return to list
          }}
          onBack={() => setSelectedBaggagePassengerId(null)}
        />
      )}
    </div>
    <DialogFooter>
      <Button onClick={() => closeDialog("Baggage")}>Confirm selection</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Files to Modify
1. `apps/ibe-app/components/customize/customize.tsx` — main refactor (add step state, conditional rendering)
2. `packages/ui/components/baggage-selection-dialog.tsx` — extract content or simplify
3. `packages/ui/components/meal-selection-flow.tsx` — simplify to non-dialog
4. `packages/ui/components/transport-service-selection-dialog.tsx` — extract content or simplify
5. `packages/ui/components/activity-card.tsx` — remove dialog cloning logic (optional)

## Success Criteria
- ✅ Only 1 modal visible at a time per service
- ✅ Clear step-through flow (list → detail → back to list)
- ✅ No overlapping nested Dialog components
- ✅ Confirm saves current step, keeps dialog open
- ✅ All pricing totals and selections persist correctly
- ✅ Mobile responsive step-through
