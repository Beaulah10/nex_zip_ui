
# NEXUZR002SearchFareDateEntry


## Properties

Name | Type
------------ | -------------
`date` | string
`baseFareForPromotion` | number
`lowestPrice` | number

## Example

```typescript
import type { NEXUZR002SearchFareDateEntry } from ''

// TODO: Update the object below with actual values
const example = {
  "date": 2026-05-25,
  "baseFareForPromotion": 43535.01,
  "lowestPrice": 50000.01,
} satisfies NEXUZR002SearchFareDateEntry

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as NEXUZR002SearchFareDateEntry
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


