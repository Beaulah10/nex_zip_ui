
# NEXUZR003FlightsScheduledDateTime


## Properties

Name | Type
------------ | -------------
`departureDateTime` | string
`departureDateTimeOffset` | string
`arrivalDateTime` | string
`arrivalDateTimeOffset` | string

## Example

```typescript
import type { NEXUZR003FlightsScheduledDateTime } from ''

// TODO: Update the object below with actual values
const example = {
  "departureDateTime": 2026-10-05T23:10:00,
  "departureDateTimeOffset": 2026-10-05T14:10:00+00:00,
  "arrivalDateTime": 2026-10-06T07:30:00,
  "arrivalDateTimeOffset": 2026-10-05T22:30:00+00:00,
} satisfies NEXUZR003FlightsScheduledDateTime

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsScheduledDateTime
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


