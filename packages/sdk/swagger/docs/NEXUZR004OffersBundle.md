
# NEXUZR004OffersBundle

Bundle information including bundle code and passenger types with their associated services.

## Properties

Name | Type
------------ | -------------
`bundleCode` | string
`passengerTypes` | [Array&lt;NEXUZR004OffersPassengerType&gt;](NEXUZR004OffersPassengerType.md)

## Example

```typescript
import type { NEXUZR004OffersBundle } from ''

// TODO: Update the object below with actual values
const example = {
  "bundleCode": VALU,
  "passengerTypes": null,
} satisfies NEXUZR004OffersBundle

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR004OffersBundle
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


