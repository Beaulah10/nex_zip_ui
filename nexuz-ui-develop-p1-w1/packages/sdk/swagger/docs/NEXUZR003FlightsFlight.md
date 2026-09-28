
# NEXUZR003FlightsFlight

A single flight itinerary (direct or connecting).

## Properties

Name | Type
------------ | -------------
`transitTime` | string
`overallFlightTime` | string
`segments` | [Array&lt;NEXUZR003FlightsSegment&gt;](NEXUZR003FlightsSegment.md)

## Example

```typescript
import type { NEXUZR003FlightsFlight } from ''

// TODO: Update the object below with actual values
const example = {
  "transitTime": 05:30,
  "overallFlightTime": 10:50,
  "segments": null,
} satisfies NEXUZR003FlightsFlight

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsFlight
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


