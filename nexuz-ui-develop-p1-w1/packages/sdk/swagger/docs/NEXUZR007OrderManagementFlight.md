
# NEXUZR007OrderManagementFlight


## Properties

Name | Type
------------ | -------------
`carrierCode` | string
`flightCode` | string
`stopOverCode` | number
`departureAirport` | string
`arrivalAirport` | string
`departureDate` | [NEXUZR007OrderManagementDateParts](NEXUZR007OrderManagementDateParts.md)
`fare` | [NEXUZR007OrderManagementFare](NEXUZR007OrderManagementFare.md)
`amount` | [NEXUZR007OrderManagementAmount](NEXUZR007OrderManagementAmount.md)

## Example

```typescript
import type { NEXUZR007OrderManagementFlight } from ''

// TODO: Update the object below with actual values
const example = {
  "carrierCode": ZG,
  "flightCode": ZG095,
  "stopOverCode": 0,
  "departureAirport": NRT,
  "arrivalAirport": MNL,
  "departureDate": null,
  "fare": null,
  "amount": null,
} satisfies NEXUZR007OrderManagementFlight

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR007OrderManagementFlight
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


