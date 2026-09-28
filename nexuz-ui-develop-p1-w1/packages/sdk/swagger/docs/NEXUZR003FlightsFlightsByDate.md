
# NEXUZR003FlightsFlightsByDate

Flights available on a specific departure date.

## Properties

Name | Type
------------ | -------------
`date` | string
`flights` | [Array&lt;NEXUZR003FlightsFlight&gt;](NEXUZR003FlightsFlight.md)

## Example

```typescript
import type { NEXUZR003FlightsFlightsByDate } from ''

// TODO: Update the object below with actual values
const example = {
  "date": 2026-10-05,
  "flights": null,
} satisfies NEXUZR003FlightsFlightsByDate

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsFlightsByDate
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


