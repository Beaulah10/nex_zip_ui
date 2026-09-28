
# NEXUZR004OffersSeatMapRequest


## Properties

Name | Type
------------ | -------------
`cabin` | string
`currency` | string
`departureDateTime` | string
`routes` | string
`logicalFlightId` | number

## Example

```typescript
import type { NEXUZR004OffersSeatMapRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "cabin": STANDARD,
  "currency": JPY,
  "departureDateTime": 2026-06-28T23:10:00,
  "routes": NRT,BKK,
  "logicalFlightId": 74793,
} satisfies NEXUZR004OffersSeatMapRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersSeatMapRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


