
# NEXUZR003FlightsFare

Fare detail for a specific passenger type and cabin.

## Properties

Name | Type
------------ | -------------
`fareId` | number
`fareClass` | string
`fareBasisCode` | string
`passengerType` | string
`cabinCode` | string
`availableSeat` | number
`baseFareAmt` | number
`fareAmt` | number
`baseFareAmtInclTax` | number
`fareAmtInclTax` | number
`ptcTotalFare` | number
`taxes` | [Array&lt;NEXUZR003FlightsTax&gt;](NEXUZR003FlightsTax.md)

## Example

```typescript
import type { NEXUZR003FlightsFare } from ''

// TODO: Update the object below with actual values
const example = {
  "fareId": 35223,
  "fareClass": ABC,
  "fareBasisCode": U0ZFA0A,
  "passengerType": null,
  "cabinCode": STANDARD,
  "availableSeat": 9,
  "baseFareAmt": 23462,
  "fareAmt": 24346,
  "baseFareAmtInclTax": 24657,
  "fareAmtInclTax": 24657,
  "ptcTotalFare": 24657,
  "taxes": null,
} satisfies NEXUZR003FlightsFare

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsFare
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


