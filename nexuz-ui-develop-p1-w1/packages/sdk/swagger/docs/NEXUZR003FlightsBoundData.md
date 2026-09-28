
# NEXUZR003FlightsBoundData

Flight data for a single bound (outbound or inbound).

## Properties

Name | Type
------------ | -------------
`airCalendarFare` | [Array&lt;NEXUZR003FlightsAirCalendarFare&gt;](NEXUZR003FlightsAirCalendarFare.md)
`flightsByDate` | [Array&lt;NEXUZR003FlightsFlightsByDate&gt;](NEXUZR003FlightsFlightsByDate.md)

## Example

```typescript
import type { NEXUZR003FlightsBoundData } from ''

// TODO: Update the object below with actual values
const example = {
  "airCalendarFare": null,
  "flightsByDate": null,
} satisfies NEXUZR003FlightsBoundData

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsBoundData
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


