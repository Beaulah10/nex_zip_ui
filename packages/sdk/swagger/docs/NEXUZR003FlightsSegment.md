
# NEXUZR003FlightsSegment

A single flight segment (leg).

## Properties

Name | Type
------------ | -------------
`previousDayIndicator` | boolean
`nextDayIndicator` | boolean
`carrierCode` | string
`origin` | string
`destination` | string
`scheduledDepartureArrivalDateTime` | [NEXUZR003FlightsScheduledDateTime](NEXUZR003FlightsScheduledDateTime.md)
`flightTime` | string
`flightNumber` | string
`pfid` | number
`lfid` | number
`fareInfos` | [Array&lt;NEXUZR003FlightsFareInfo&gt;](NEXUZR003FlightsFareInfo.md)

## Example

```typescript
import type { NEXUZR003FlightsSegment } from ''

// TODO: Update the object below with actual values
const example = {
  "previousDayIndicator": null,
  "nextDayIndicator": null,
  "carrierCode": ZG,
  "origin": NRT,
  "destination": BKK,
  "scheduledDepartureArrivalDateTime": null,
  "flightTime": 07:30,
  "flightNumber": 052,
  "pfid": 232,
  "lfid": 232,
  "fareInfos": null,
} satisfies NEXUZR003FlightsSegment

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsSegment
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


