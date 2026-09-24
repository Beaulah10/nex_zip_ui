
# NEXUZR005APIsSummaryRequest


## Properties

Name | Type
------------ | -------------
`tripType` | string
`promotionCode` | string
`reservationAmount` | number
`flights` | [NEXUZR005APIsFlights](NEXUZR005APIsFlights.md)
`passengers` | [Array&lt;NEXUZR005APIsPassengerDetails&gt;](NEXUZR005APIsPassengerDetails.md)

## Example

```typescript
import type { NEXUZR005APIsSummaryRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "tripType": oneway,
  "promotionCode": ABC,
  "reservationAmount": 10000.01,
  "flights": null,
  "passengers": null,
} satisfies NEXUZR005APIsSummaryRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsSummaryRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


