
# NEXUZR005APIsFareDetails


## Properties

Name | Type
------------ | -------------
`fareId` | number
`fareClass` | string
`fareBasisCode` | string
`passengerType` | string
`baseFareAmtInclTax` | number
`amtInclTax` | number

## Example

```typescript
import type { NEXUZR005APIsFareDetails } from ''

// TODO: Update the object below with actual values
const example = {
  "fareId": 12,
  "fareClass": C,
  "fareBasisCode": Y0ZSC0A,
  "passengerType": Adult,
  "baseFareAmtInclTax": 10000.12,
  "amtInclTax": 9000.23,
} satisfies NEXUZR005APIsFareDetails

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR005APIsFareDetails
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


