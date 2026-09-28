
# NEXUZR004OffersSeats

Contains the column seat details for the corresponding row cabin.

## Properties

Name | Type
------------ | -------------
`column` | string
`isSeatAvailable` | boolean
`amount` | number
`serviceCode` | string

## Example

```typescript
import type { NEXUZR004OffersSeats } from ''

// TODO: Update the object below with actual values
const example = {
  "column": B,
  "isSeatAvailable": true,
  "amount": 2000.16,
  "serviceCode": STOT,
} satisfies NEXUZR004OffersSeats

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersSeats
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


