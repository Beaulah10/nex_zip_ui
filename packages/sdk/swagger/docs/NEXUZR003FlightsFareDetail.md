
# NEXUZR003FlightsFareDetail

Detailed fare information for a single passenger type within a cabin.

## Properties

Name | Type
------------ | -------------
`fareId` | number
`fareClass` | string
`fareBasisCode` | string
`passengerType` | string
`availableSeat` | number
`baseFareAmt` | number
`fareAmt` | number
`baseFareAmtInclTax` | number
`fareAmtInclTax` | number
`amtInclTax` | number
`taxes` | [Array&lt;NEXUZR003FlightsTax&gt;](NEXUZR003FlightsTax.md)

## Example

```typescript
import type { NEXUZR003FlightsFareDetail } from ''

// TODO: Update the object below with actual values
const example = {
  "fareId": 35223,
  "fareClass": Y,
  "fareBasisCode": U0ZFA0A,
  "passengerType": null,
  "availableSeat": 5,
  "baseFareAmt": 23462,
  "fareAmt": 24346,
  "baseFareAmtInclTax": 24657,
  "fareAmtInclTax": 24657,
  "amtInclTax": 24657,
  "taxes": null,
} satisfies NEXUZR003FlightsFareDetail

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR003FlightsFareDetail
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


