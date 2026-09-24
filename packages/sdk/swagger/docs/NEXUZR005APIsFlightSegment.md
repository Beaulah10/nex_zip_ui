
# NEXUZR005APIsFlightSegment


## Properties

Name | Type
------------ | -------------
`carrierCode` | string
`origin` | string
`destination` | string
`flightNumber` | number
`pfid` | number
`lfid` | number
`cabin` | string
`scheduledDepartureArrivalDateTime` | [NEXUZR005APIsScheduledDateTime](NEXUZR005APIsScheduledDateTime.md)
`fareDetails` | [Array&lt;NEXUZR005APIsFareDetails&gt;](NEXUZR005APIsFareDetails.md)

## Example

```typescript
import type { NEXUZR005APIsFlightSegment } from ''

// TODO: Update the object below with actual values
const example = {
  "carrierCode": ZG,
  "origin": NRT,
  "destination": SIN,
  "flightNumber": 1234,
  "pfid": 2341,
  "lfid": 2312,
  "cabin": STANDARD,
  "scheduledDepartureArrivalDateTime": null,
  "fareDetails": null,
} satisfies NEXUZR005APIsFlightSegment

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsFlightSegment
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


