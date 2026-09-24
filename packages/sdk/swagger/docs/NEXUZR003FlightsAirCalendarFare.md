
# NEXUZR003FlightsAirCalendarFare

Minimum fare summary for a specific date.

## Properties

Name | Type
------------ | -------------
`date` | string
`baseFareAmount` | number
`totalFareAmount` | number

## Example

```typescript
import type { NEXUZR003FlightsAirCalendarFare } from ''

// TODO: Update the object below with actual values
const example = {
  "date": 2026-10-05,
  "baseFareAmount": 18000,
  "totalFareAmount": 20160,
} satisfies NEXUZR003FlightsAirCalendarFare

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsAirCalendarFare
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


